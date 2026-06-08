const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function exportReport() {
  console.log("Fetching validation data from DB...");
  const startups = await prisma.startup.findMany({
    where: { sources: 'VALIDATION_DATASET' },
    include: { analysis: true }
  });

  if (startups.length === 0) {
    console.log("No validation startups found in DB.");
    return;
  }

  // 1. Export CSV
  let csvContent = "Startup Name,Category,Opportunity Score,Confidence Score,Market Demand,Competition,Monetization,Niche,AI Summary,Validation Notes\n";
  
  for (const s of startups) {
    if (!s.analysis) continue;
    
    // Escape quotes for CSV
    const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
    
    const row = [
      escapeCsv(s.name),
      escapeCsv(s.category),
      s.analysis.overallScore,
      s.analysis.confidenceScore,
      s.analysis.demandScore,
      s.analysis.competitionScore,
      s.analysis.monetizationScore,
      escapeCsv(s.analysis.niche),
      escapeCsv(s.analysis.aiSummary),
      '""' // Empty Validation Notes column
    ];
    csvContent += row.join(',') + '\n';
  }

  fs.writeFileSync('./server/scripts/data/validation_report.csv', csvContent);
  console.log(`\n✅ CSV Exported to server/scripts/data/validation_report.csv`);

  // 2. Score Distribution Analysis
  const validAnalyses = startups.map(s => s.analysis).filter(a => a);
  const scores = validAnalyses.map(a => a.overallScore);
  
  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  
  // By Category
  const catStats = {};
  for (const s of startups) {
    if (!s.analysis) continue;
    if (!catStats[s.category]) catStats[s.category] = { total: 0, count: 0 };
    catStats[s.category].total += s.analysis.overallScore;
    catStats[s.category].count += 1;
  }
  
  console.log(`\n=== SCORE DISTRIBUTION ANALYSIS ===`);
  console.log(`Total Validated: ${validAnalyses.length}`);
  console.log(`Average Score: ${avgScore}`);
  console.log(`Highest Score: ${highestScore}`);
  console.log(`Lowest Score: ${lowestScore}`);
  
  console.log(`\n--- Average Score by Category ---`);
  for (const [cat, data] of Object.entries(catStats)) {
    console.log(`${cat.padEnd(25)} : ${(data.total / data.count).toFixed(1)}`);
  }
  
  // Top 20 and Bottom 20
  const sorted = startups.filter(s => s.analysis).sort((a, b) => b.analysis.overallScore - a.analysis.overallScore);
  
  console.log(`\n--- TOP 20 OPPORTUNITIES ---`);
  sorted.slice(0, 20).forEach((s, i) => {
    console.log(`${i+1}. [${s.analysis.overallScore}] ${s.name} (${s.category})`);
  });

  console.log(`\n--- BOTTOM 20 OPPORTUNITIES ---`);
  const bottom20 = sorted.slice().reverse().slice(0, 20);
  bottom20.forEach((s, i) => {
    console.log(`${i+1}. [${s.analysis.overallScore}] ${s.name} (${s.category})`);
  });
}

exportReport()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
