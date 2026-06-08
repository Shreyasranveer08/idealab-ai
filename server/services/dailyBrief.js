const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const llmClient = require('./llmClient');

async function generateDailyBrief() {
  console.log("Generating Daily Brief...");
  
  // Get all startups from the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const recentStartups = await prisma.startup.findMany({
    where: {
      createdAt: {
        gte: yesterday
      }
    },
    include: {
      analysis: true
    }
  });

  if (recentStartups.length === 0) {
    console.log("No new startups found to generate a brief.");
    return null;
  }

  // Find top opportunity
  let topStartup = null;
  let maxScore = -1;
  const nicheCounts = {};

  for (const startup of recentStartups) {
    if (startup.analysis) {
      if (startup.analysis.overallScore > maxScore) {
        maxScore = startup.analysis.overallScore;
        topStartup = startup;
      }
      
      const niche = startup.analysis.niche;
      nicheCounts[niche] = (nicheCounts[niche] || 0) + 1;
    }
  }

  // Find fastest growing (most entries) and underserved (fewest entries but maybe we just pick one with count 1)
  const niches = Object.entries(nicheCounts).sort((a, b) => b[1] - a[1]);
  const fastestGrowing = niches.length > 0 ? niches[0][0] : "None";
  const underserved = niches.length > 0 ? niches[niches.length - 1][0] : "None";

  const summary = `Analyzed ${recentStartups.length} new startups today. Top opportunity found in ${topStartup?.name || 'none'}.`;

  // Use Gemini to generate the prose fields based on recentStartups
  const geminiKey = process.env.GEMINI_API_KEY;
  let emergingTrends = "AI is accelerating across multiple sectors.";
  let saturatedMarkets = "General-purpose chat wrappers and basic productivity tools.";
  let recommendedIdeas = "1. AI legal assistant for boutique firms.\n2. Automated compliance for fintechs.\n3. Personalized health tech for longevity.";

  if (geminiKey && geminiKey !== 'REPLACE_WITH_YOUR_API_KEY') {
    const prompt = `
      You are an expert market analyst. Here are the startups launched in the last 24 hours:
      ${JSON.stringify(recentStartups.map(s => ({ name: s.name, desc: s.description, niche: s.analysis?.niche, score: s.analysis?.overallScore })))}
      
      Based on this data, provide:
      1. A 2-sentence summary of emerging trends (areas with high scores but few startups).
      2. A 2-sentence summary of saturated markets (areas with many startups but low scores/high competition).
      3. A simple, easy to understand, numbered list of 3 top recommended new startup ideas that a founder could build to capitalize on these trends. Keep the tone beginner-friendly like ChatGPT. Do NOT use complex technical jargon. Do NOT use markdown bold stars (like **Idea Name**) anywhere in the output. Just use plain simple text.

      Return EXACTLY a JSON object:
      {
        "emergingTrends": string,
        "saturatedMarkets": string,
        "recommendedIdeas": string
      }
    `;

    try {
      const insightsData = await llmClient.generateContent(prompt, true);
      emergingTrends = insightsData.emergingTrends || emergingTrends;
      saturatedMarkets = insightsData.saturatedMarkets || saturatedMarkets;
      recommendedIdeas = insightsData.recommendedIdeas || recommendedIdeas;
    } catch (e) {
      console.error("Failed to generate AI brief fields:", e.message);
    }
  }

  const brief = await prisma.dailyBrief.create({
    data: {
      summary,
      fastestGrowingNiche: fastestGrowing,
      underservedNiche: underserved,
      emergingTrends,
      saturatedMarkets,
      recommendedIdeas,
      topOpportunityId: topStartup ? topStartup.id : null
    }
  });

  console.log("Daily Brief generated successfully:", brief);
  
  // Log the alert event as requested instead of sending an email
  console.log(`[ALERT LOG] Daily Brief generated! Summary: ${summary}. Top Opportunity: ${topStartup?.name}.`);
  
  return brief;
}

module.exports = {
  generateDailyBrief
};
