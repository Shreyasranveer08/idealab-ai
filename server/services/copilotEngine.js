const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const llmClient = require('./llmClient');

class CopilotEngine {
  constructor() {}

  async generateResponse(userMessage) {
    console.log("Generating Copilot response for:", userMessage);

    // Fetch database context
    // 1. Get Top 20 overall startups
    const topStartups = await prisma.startup.findMany({
      take: 20,
      orderBy: { analysis: { overallScore: 'desc' } },
      include: { analysis: true }
    });

    // 2. Get User's validated ideas
    const myIdeas = await prisma.validatedIdea.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const contextTopStartups = topStartups.filter(s => s.analysis).map(s => ({
      name: s.name,
      niche: s.analysis.niche,
      score: s.analysis.overallScore,
      demand: s.analysis.demandScore,
      competition: s.analysis.competitionScore
    }));

    const contextMyIdeas = myIdeas.map(i => ({
      idea: i.rawIdea,
      score: i.overallScore,
      niche: i.niche,
      competition: i.competitionScore
    }));

    const systemPrompt = `
You are the Startup AI Copilot for BuildWatch AI, an advanced startup intelligence platform.
The user is talking to you via a chat interface.
Your goal is to answer their questions about startups, niches, competition, and their own ideas using the provided database context.
Be concise, highly insightful, and format your answers beautifully using Markdown (bolding, lists, emojis are encouraged for readability).

--- DATABASE CONTEXT ---
TOP RECENT STARTUPS IN DATABASE:
${JSON.stringify(contextTopStartups, null, 2)}

USER'S VALIDATED IDEAS:
${JSON.stringify(contextMyIdeas, null, 2)}
------------------------

USER MESSAGE:
"${userMessage}"

Provide a direct, helpful, and analytical response based on the data context. If they ask about something outside the context, answer generally but remind them you only have direct data on the provided context.
`;

    try {
      // We pass expectJson = false because we want a natural language markdown response
      const responseText = await llmClient.generateContent(systemPrompt, false);
      return { response: responseText };
    } catch (error) {
      console.error("Copilot Engine Error:", error.message);
      throw error;
    }
  }
}

module.exports = new CopilotEngine();
