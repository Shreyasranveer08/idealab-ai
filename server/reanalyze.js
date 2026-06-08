const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiEngine = require('./services/aiEngine');

async function reanalyze() {
  console.log("Finding startups that failed AI analysis...");
  const failedAnalyses = await prisma.opportunityAnalysis.findMany({
    where: {
      aiSummary: 'Error during AI generation.'
    },
    include: {
      startup: true
    }
  });

  console.log(`Found ${failedAnalyses.length} startups to reanalyze.`);

  for (const analysis of failedAnalyses) {
    console.log(`Reanalyzing: ${analysis.startup.name}`);
    
    // Call AI Engine again
    const newAnalysis = await aiEngine.analyzeStartup(analysis.startup);
    
    if (newAnalysis.aiSummary !== 'Error during AI generation.') {
      // Update Database
      await prisma.opportunityAnalysis.update({
        where: { id: analysis.id },
        data: {
          overallScore: newAnalysis.overallScore,
          demandScore: newAnalysis.demandScore,
          competitionScore: newAnalysis.competitionScore,
          monetizationScore: newAnalysis.monetizationScore,
          confidenceScore: newAnalysis.confidenceScore,
          aiSummary: newAnalysis.aiSummary,
          niche: newAnalysis.niche
        }
      });
      console.log(`Success! New Score: ${newAnalysis.overallScore}`);
    } else {
      console.log("AI failed again (maybe rate limited). Skipping...");
    }
    
    // Add delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 4000));
  }
  
  console.log("Reanalysis complete.");
}

reanalyze().catch(console.error);
