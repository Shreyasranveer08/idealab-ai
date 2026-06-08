const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiEngine = require('./aiEngine');
const ProductHuntIngestor = require('./ingestion/ProductHuntIngestor');
const HackerNewsIngestor = require('./ingestion/HackerNewsIngestor');
const RedditIngestor = require('./ingestion/RedditIngestor');
const GitHubIngestor = require('./ingestion/GitHubIngestor');
const IndieHackersIngestor = require('./ingestion/IndieHackersIngestor');
const DevToIngestor = require('./ingestion/DevToIngestor');
const TwitterIngestor = require('./ingestion/TwitterIngestor');
const YCombinatorIngestor = require('./ingestion/YCombinatorIngestor');
const BetaListIngestor = require('./ingestion/BetaListIngestor');
const TechCrunchIngestor = require('./ingestion/TechCrunchIngestor');

const ingestors = [
  new ProductHuntIngestor(),
  new HackerNewsIngestor(),
  new RedditIngestor(),
  new GitHubIngestor(),
  new IndieHackersIngestor(),
  new DevToIngestor(),
  new YCombinatorIngestor(),
  new BetaListIngestor(),
  new TwitterIngestor(),
  new TechCrunchIngestor()
];

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function runIngestionPipeline() {
  console.log("Starting ingestion pipeline...");
  
  for (const ingestor of ingestors) {
    try {
      const sourceName = ingestor.getSourceName();
      console.log(`Fetching from ${sourceName}...`);
      const rawStartups = await ingestor.fetchLatest();
      console.log(`Found ${rawStartups.length} startups from ${sourceName}.`);
      
      for (const startupData of rawStartups) {
        const normName = normalizeName(startupData.name);
        
        // 1. Duplicate Detection by externalId or URL or normalized name
        const existing = await prisma.startup.findFirst({
          where: {
            OR: [
              { externalId: startupData.externalId },
              { url: startupData.url },
            ]
          }
        });

        // Let's also check all startups for normalized name if no exact url/id match
        let trueExisting = existing;
        if (!trueExisting) {
          const allStartups = await prisma.startup.findMany({ select: { id: true, name: true, sources: true } });
          const nameMatch = allStartups.find(s => normalizeName(s.name) === normName);
          if (nameMatch) {
            trueExisting = await prisma.startup.findUnique({ where: { id: nameMatch.id } });
          }
        }
        
        if (!trueExisting) {
          console.log(`Processing new startup: ${startupData.name}`);
          
          // Run AI Opportunity Analysis
          const analysisResult = await aiEngine.analyzeStartup(startupData);
          
          if (analysisResult.isRealStartup === false) {
            console.log(`Skipped non-startup: ${startupData.name}`);
            continue;
          }

          // Save Startup and Analysis to Database
          await prisma.startup.create({
            data: {
              name: startupData.name,
              description: startupData.description,
              url: startupData.url,
              sources: sourceName,
              externalId: startupData.externalId,
              category: startupData.category,
              launchedAt: startupData.launchedAt,
              engagementMetrics: startupData.engagementMetrics || null,
              rawPayload: JSON.stringify(startupData.rawPayload || startupData),
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
          console.log(`Saved ${startupData.name} with score ${analysisResult.overallScore}`);
        } else {
          console.log(`Duplicate found: ${startupData.name}. Updating sources if needed.`);
          // Update sources if new source
          const existingSources = trueExisting.sources.split(',').map(s => s.trim());
          if (!existingSources.includes(sourceName)) {
            existingSources.push(sourceName);
            await prisma.startup.update({
              where: { id: trueExisting.id },
              data: { sources: existingSources.join(', ') }
            });
            console.log(`Updated sources for ${trueExisting.name} -> ${existingSources.join(', ')}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing ingestor ${ingestor.getSourceName()}:`, error);
    }
  }
  console.log("Ingestion pipeline complete.");
}

module.exports = {
  runIngestionPipeline
};
