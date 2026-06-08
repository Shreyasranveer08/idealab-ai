const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const prisma = new PrismaClient();
const llmClient = require('./llmClient');

// Simple in-memory cache: { rawIdea: { timestamp, result } }
const cache = {};
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

class IdeaValidatorEngine {
  constructor() {}

  async validateIdea(rawIdea) {

    const cacheKey = rawIdea.trim().toLowerCase();
    
    // Check Cache
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
      console.log("Returning cached validation for idea:", rawIdea.substring(0, 30));
      return cache[cacheKey].result;
    }

    // Check DB for previously validated ideas
    const existing = await prisma.validatedIdea.findFirst({
      where: { rawIdea: cacheKey }
    });

    if (existing) {
      const formatted = {
        overallScore: existing.overallScore,
        demandScore: existing.demandScore,
        competitionScore: existing.competitionScore,
        monetizationScore: existing.monetizationScore,
        confidenceScore: existing.confidenceScore,
        niche: existing.niche,
        aiSummary: existing.aiSummary,
        keyRisks: existing.keyRisks,
        advantages: existing.advantages,
        positioning: existing.positioning,
        competitors: JSON.parse(existing.competitors)
      };
      cache[cacheKey] = { timestamp: Date.now(), result: formatted };
      return formatted;
    }

    console.log("Validating New Idea:", rawIdea.substring(0, 30));

    // Handle URL scraping
    let processedIdea = rawIdea;
    if (rawIdea.startsWith('http://') || rawIdea.startsWith('https://')) {
      console.log("URL detected. Attempting to scrape:", rawIdea);
      try {
        const scrapeRes = await fetch(rawIdea.trim(), {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const html = await scrapeRes.text();
        const $ = cheerio.load(html);
        
        const title = $('title').text();
        const desc = $('meta[name="description"]').attr('content') || '';
        let pText = '';
        $('p').slice(0, 5).each((i, el) => {
          pText += $(el).text() + ' ';
        });
        
        processedIdea = `Website URL: ${rawIdea}\nTitle: ${title}\nDescription: ${desc}\nContent: ${pText.substring(0, 800)}`;
        console.log("Successfully scraped website context.");
      } catch (err) {
        console.error("Failed to scrape URL, falling back to raw text:", err.message);
      }
    }

    // Fetch all startups from DB to find competitors
    const allStartups = await prisma.startup.findMany({
      select: { id: true, name: true, description: true, category: true }
    });

    const prompt = `
      You are an expert venture capitalist and startup validator.
      The user is pitching a raw startup idea or providing a website to analyze.
      
      User's Pitch / Website Context: "${processedIdea}"
      
      Evaluate the idea on the following metrics (1-10):
      1. Demand Score: How much innate demand exists for this?
      2. Competition Score: How intense is the competition? (1 = highly saturated, 10 = completely blue ocean. A high score means BETTER opportunity).
      3. Monetization Score: How viable is the revenue model?
      4. Confidence Score (1-100): How confident are you?
      Calculate an Overall Opportunity Score (1-100).
      
      Also provide:
      - Niche Classification
      - AI Summary (2 sentences)
      - Key Risks (2 sentences)
      - Competitive Advantages (2 sentences)
      - Suggested Positioning (2 sentences)
      
      Finally, find the top 3 closest competitors from the provided database list. For each, give a "similarityScore" (0-100).
      
      Database Startups:
      ${JSON.stringify(allStartups.map(s => ({id: s.id, name: s.name, desc: s.description.substring(0,100)})), null, 2)}
      
      Return EXACTLY a JSON object:
      {
        "overallScore": number,
        "demandScore": number,
        "competitionScore": number,
        "monetizationScore": number,
        "confidenceScore": number,
        "niche": string,
        "aiSummary": string,
        "keyRisks": string,
        "advantages": string,
        "positioning": string,
        "competitors": [
          { "id": "uuid-from-db", "name": "startup name", "similarityScore": number }
        ]
      }
    `;

    try {
      const data = await llmClient.generateContent(prompt, true);
      
      // Save to DB
      const savedIdea = await prisma.validatedIdea.create({
        data: {
          rawIdea: cacheKey,
          overallScore: data.overallScore,
          demandScore: data.demandScore,
          competitionScore: data.competitionScore,
          monetizationScore: data.monetizationScore,
          confidenceScore: data.confidenceScore,
          niche: data.niche,
          aiSummary: data.aiSummary,
          keyRisks: data.keyRisks,
          advantages: data.advantages,
          positioning: data.positioning,
          competitors: JSON.stringify(data.competitors || [])
        }
      });
      
      data.id = savedIdea.id;
      cache[cacheKey] = { timestamp: Date.now(), result: data };
      return data;
    } catch (error) {
      console.error(`Error validating idea:`, error.message);
      throw error;
    }
  }

  async generatePitchDeck(ideaId) {
    const idea = await prisma.validatedIdea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new Error("Idea not found");
    if (idea.pitchDeck) return JSON.parse(idea.pitchDeck); // return cached

    console.log("Generating Pitch Deck for Idea:", ideaId);

    const prompt = `
      You are an expert pitch deck writer and VC analyst.
      Based on the following AI validated idea, generate a highly compelling 10-slide pitch deck outline.
      
      Idea: "${idea.rawIdea}"
      Niche: ${idea.niche}
      AI Summary: ${idea.aiSummary}
      Positioning: ${idea.positioning}
      Key Risks: ${idea.keyRisks}
      Advantages: ${idea.advantages}
      Demand Score: ${idea.demandScore}/10
      Competition Score: ${idea.competitionScore}/10
      Monetization Score: ${idea.monetizationScore}/10

      Return exactly a JSON array of 10 objects representing the slides. Each object must have:
      {
        "slideNumber": number,
        "title": string,
        "content": string, // The main text or bullet points. Do NOT use markdown bolding (like **Text**). Use plain, simple, easy-to-understand conversational English.
        "speakerNotes": string // What the founder should say. Simple conversational tone. Do NOT use markdown.
      }
    `;

    try {
      const deckData = await llmClient.generateContent(prompt, true);

      await prisma.validatedIdea.update({
        where: { id: ideaId },
        data: { pitchDeck: JSON.stringify(deckData) }
      });

      return deckData;
    } catch (error) {
      console.error("Error generating pitch deck:", error.message);
      throw error;
    }
  }
}

module.exports = new IdeaValidatorEngine();
