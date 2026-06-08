require('dotenv').config();
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const aiEngine = require('../services/aiEngine');

const prisma = new PrismaClient();
const startups = JSON.parse(fs.readFileSync('./server/scripts/data/realistic_startups.json', 'utf8'));

// A simple delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runStressTest() {
  console.log(`Starting Validation Stress Test for ${startups.length} startups...`);
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < startups.length; i++) {
    const startupData = startups[i];
    console.log(`\n[${i + 1}/${startups.length}] Processing: ${startupData.name}`);

    // Check if duplicate exists (for idempotency in testing)
    const existing = await prisma.startup.findFirst({
      where: { externalId: startupData.externalId }
    });

    if (existing) {
      console.log(`Skipping ${startupData.name} - Already exists in DB.`);
      continue;
    }

    try {
      // Small rate limit protection: sleep 1 second between requests to OpenRouter
      await delay(1000);

      // Run AI Analysis
      const analysisResult = await aiEngine.analyzeStartup(startupData);
      
      // Save Startup and Analysis to Database
      await prisma.startup.create({
        data: {
          name: startupData.name,
          description: startupData.description,
          url: startupData.url,
          sources: 'VALIDATION_DATASET',
          externalId: startupData.externalId,
          category: startupData.category,
          launchedAt: new Date(startupData.launchedAt),
          rawPayload: JSON.stringify(startupData),
          analysis: {
            create: {
              overallScore: analysisResult.overallScore,
              demandScore: analysisResult.demandScore,
              competitionScore: analysisResult.competitionScore,
              monetizationScore: analysisResult.monetizationScore,
              confidenceScore: analysisResult.confidenceScore,
              aiSummary: analysisResult.aiSummary,
              niche: analysisResult.niche
            }
          }
        }
      });
      
      console.log(`Success! Score: ${analysisResult.overallScore} | Niche: ${analysisResult.niche}`);
      successCount++;
    } catch (error) {
      console.error(`Failed to process ${startupData.name}:`, error);
      failCount++;
      // If we hit a hard rate limit, back off for 10 seconds
      if (error.status === 429) {
        console.log("Rate limit hit! Backing off for 10 seconds...");
        await delay(10000);
      }
    }
  }

  console.log(`\nStress Test Complete!`);
  console.log(`Successfully ingested: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

runStressTest()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
