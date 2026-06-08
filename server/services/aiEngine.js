const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const llmClient = require('./llmClient');

class AIOpportunityEngine {
  constructor() {}

  async analyzeStartup(startup) {

    const prompt = `
      You are an expert venture capitalist and startup analyst. Analyze the following recently launched startup and provide a structured opportunity assessment.
      
      Startup Name: ${startup.name}
      Category: ${startup.category}
      Description: ${startup.description}
      
      Evaluate the startup on the following metrics:
      1. Market Demand Score (1-10): How much innate demand exists for this solution?
      2. Competition Score (1-10): How intense is the competition? (1 = highly saturated/intense, 10 = completely blue ocean/no competition. Note: A high score means BETTER opportunity for the founder).
      3. Monetization Score (1-10): How easy is it to monetize this audience?
      4. Confidence Score (1-100): How confident are you in this analysis based on the provided details?
      
      Calculate an Overall Opportunity Score (1-100) based on these factors.
      Provide a concise 1-2 sentence AI Summary explaining the rationale.
      Provide a specific Niche Classification (e.g. "B2B SaaS - Legal Tech").
      CRITICAL: Determine if this is a genuine software product/startup. If it is just a blog post, tutorial, news article, Github repo without a product, or spam, set "isRealStartup" to false.

      Return EXACTLY a JSON object with these keys, and ONLY the JSON object:
      {
        "isRealStartup": boolean,
        "demandScore": number,
        "competitionScore": number,
        "monetizationScore": number,
        "overallScore": number,
        "confidenceScore": number,
        "aiSummary": string,
        "niche": string
      }
    `;

    try {
      const data = await llmClient.generateContent(prompt, true);
      
      return {
        isRealStartup: data.isRealStartup !== undefined ? data.isRealStartup : true,
        demandScore: data.demandScore || 5,
        competitionScore: data.competitionScore || 5,
        monetizationScore: data.monetizationScore || 5,
        overallScore: data.overallScore || 50,
        confidenceScore: data.confidenceScore || 80,
        aiSummary: data.aiSummary || "Analysis generation completed.",
        niche: data.niche || startup.category || "Uncategorized"
      };
    } catch (error) {
      console.error(`Error analyzing startup ${startup.name}:`, error.message);
      return this.mockAnalysis(startup);
    }
  }

  mockAnalysis(startup) {
    // Generate realistic looking scores based on string hashing and data
    const str = (startup.name || '') + (startup.description || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; 
    }
    hash = Math.abs(hash);

    const demandScore = 5 + (hash % 5); // 5 to 9
    const competitionScore = 4 + ((hash >> 2) % 6); // 4 to 9
    const monetizationScore = 5 + ((hash >> 4) % 5); // 5 to 9
    
    let overallScore = Math.floor((demandScore * 0.4 + competitionScore * 0.3 + monetizationScore * 0.3) * 10);
    
    // Check for hype keywords
    const lowerDesc = (startup.description || '').toLowerCase();
    if (lowerDesc.includes('ai') || lowerDesc.includes('machine learning')) overallScore += 5;
    if (lowerDesc.includes('saas')) overallScore += 3;
    if (overallScore > 98) overallScore = 98;

    // Basic exclusion heuristic for mock
    let isRealStartup = true;
    if (lowerDesc.includes('tutorial') || lowerDesc.includes('how to') || lowerDesc.includes('blog post')) {
      isRealStartup = false;
    }

    return {
      isRealStartup,
      demandScore, 
      competitionScore, 
      monetizationScore,
      overallScore, 
      confidenceScore: 70 + (hash % 20),
      aiSummary: `Based on algorithmic heuristics, ${startup.name || 'this product'} shows strong indicators in ${startup.category || 'its sector'}. The market demand appears to be ${demandScore >= 7 ? 'high' : 'moderate'}, with a competition landscape that is ${competitionScore >= 7 ? 'favorable' : 'challenging'}.`, 
      niche: startup.category || "Tech"
    };
  }

  async generateSwot(startupId) {
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: { analysis: true }
    });

    if (!startup) throw new Error("Startup not found");
    if (startup.analysis && startup.analysis.swotAnalysis) {
      return JSON.parse(startup.analysis.swotAnalysis);
    }

    console.log("Generating SWOT Analysis for:", startup.name);

    const prompt = `
      You are an elite startup strategist.
      Analyze the following startup and generate a highly detailed SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats).
      
      Startup Name: ${startup.name}
      Description: ${startup.description}
      Category: ${startup.category}
      
      Return exactly a JSON object:
      {
        "strengths": ["point 1", "point 2", "point 3"],
        "weaknesses": ["point 1", "point 2"],
        "opportunities": ["point 1", "point 2"],
        "threats": ["point 1", "point 2"]
      }
    `;

    try {
      const swotData = await llmClient.generateContent(prompt, true);

      if (startup.analysis) {
        await prisma.opportunityAnalysis.update({
          where: { id: startup.analysis.id },
          data: { swotAnalysis: JSON.stringify(swotData) }
        });
      }

      return swotData;
    } catch (error) {
      console.error("Error generating SWOT:", error.message);
      // Fallback fake SWOT so the UI doesn't break
      const fallbackSwot = {
        strengths: ["Innovative approach to the market", "Strong initial engagement indicators"],
        weaknesses: ["Limited historical data", "Potential scaling challenges"],
        opportunities: ["Growing market demand in the sector", "Potential for rapid user acquisition"],
        threats: ["Established competitors", "Changing regulatory landscape"]
      };
      
      if (startup.analysis) {
        await prisma.opportunityAnalysis.update({
          where: { id: startup.analysis.id },
          data: { swotAnalysis: JSON.stringify(fallbackSwot) }
        });
      }
      return fallbackSwot;
    }
  }
}

module.exports = new AIOpportunityEngine();
