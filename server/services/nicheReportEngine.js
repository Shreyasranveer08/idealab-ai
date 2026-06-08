const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const llmClient = require('./llmClient');

class NicheReportEngine {

  async generateReport(niche) {
    console.log(`Generating Deep Niche Report for: ${niche}`);

    // Fetch all startups in this category
    const startups = await prisma.startup.findMany({
      where: { category: niche },
      include: { analysis: true }
    });

    if (startups.length === 0) {
      throw new Error(`No startups found in category: ${niche}`);
    }

    // Filter out those without analysis
    const validStartups = startups.filter(s => s.analysis);
    
    // Sort to easily pick top startups
    validStartups.sort((a, b) => b.analysis.overallScore - a.analysis.overallScore);
    
    // Prepare the data payload for the prompt
    const contextData = validStartups.map(s => ({
      name: s.name,
      description: s.description,
      sources: s.sources,
      overallScore: s.analysis.overallScore,
      demandScore: s.analysis.demandScore,
      competitionScore: s.analysis.competitionScore,
      monetizationScore: s.analysis.monetizationScore,
      nicheSubcategory: s.analysis.niche,
      engagementMetrics: s.engagementMetrics ? JSON.parse(s.engagementMetrics) : null
    }));

    // Calculate generic stats locally to pass into prompt for grounding
    const avgScore = validStartups.reduce((acc, s) => acc + s.analysis.overallScore, 0) / validStartups.length;
    
    const prompt = `
      You are an expert market analyst for a startup intelligence platform.
      Generate a Deep Niche Report for the category: "${niche}".
      
      CRITICAL REQUIREMENT: Your entire analysis MUST be derived STRICTLY from the provided startup data. Do not invent generic market trends. Base your "Saturated Segments" and "Underserved Opportunities" entirely on patterns you see in the data (e.g. if you see 5 generic AI wrappers with low scores, that is a saturated segment).

      Here is the raw data of ${validStartups.length} startups currently tracked in this niche:
      ${JSON.stringify(contextData, null, 2)}
      
      Average Opportunity Score in this category: ${avgScore.toFixed(1)}/100

      Return EXACTLY a JSON object with these keys:
      {
        "marketOverview": string (2-3 paragraphs analyzing the current state of this niche based on the data),
        "fastestGrowing": string (Identify specific subcategories or themes that show high demand/scores),
        "saturatedSegments": string (Identify subcategories with high competition/low scores in the data),
        "underserved": string (Identify high-opportunity areas or missing solutions based on gaps in the data),
        "scoreDistribution": string (e.g. "High: 2, Medium: 10, Low: 3" or similar breakdown string),
        "topStartups": string (Comma separated names of the best performing startups from the data),
        "recommendedIdeas": string (2-3 concrete startup ideas a founder could build today to capitalize on the underserved areas),
        "confidenceScore": number (0-100 indicating how conclusive the data is for this niche)
      }
    `;

    try {
      const data = await llmClient.generateContent(prompt, true);
      
      // Save report snapshot to DB
      const report = await prisma.nicheReport.create({
        data: {
          niche: niche,
          marketOverview: data.marketOverview,
          startupsAnalyzed: validStartups.length,
          fastestGrowing: data.fastestGrowing,
          saturatedSegments: data.saturatedSegments,
          underserved: data.underserved,
          scoreDistribution: data.scoreDistribution,
          topStartups: data.topStartups,
          recommendedIdeas: data.recommendedIdeas,
          confidenceScore: data.confidenceScore || 50
        }
      });
      
      return report;
    } catch (error) {
      console.error(`Error generating Niche Report for ${niche}:`, error.message);
      throw error;
    }
  }
}

module.exports = new NicheReportEngine();
