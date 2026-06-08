require('dotenv').config({ path: require('path').resolve(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { runIngestionPipeline } = require('./services/ingestionPipeline');
const { generateDailyBrief } = require('./services/dailyBrief');
const cron = require('node-cron');
const aiEngine = require('./services/aiEngine');
const ideaValidatorEngine = require('./services/ideaValidatorEngine');
const emailService = require('./services/emailService');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Get all startups with analysis
app.get('/api/startups', async (req, res) => {
  try {
    const { q } = req.query;
    let whereClause = {};
    if (q) {
      whereClause = {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } }
        ]
      };
    }
    
    const startups = await prisma.startup.findMany({
      where: whereClause,
      include: {
        analysis: true
      },
      orderBy: {
        launchedAt: 'desc'
      },
      take: 20 // limit to 20 for preview
    });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's brief
app.get('/api/brief/today', async (req, res) => {
  try {
    const brief = await prisma.dailyBrief.findFirst({
      orderBy: {
        date: 'desc'
      }
    });
    
    if (!brief) return res.json(null);
    
    let topOpportunity = null;
    if (brief.topOpportunityId) {
      topOpportunity = await prisma.startup.findUnique({
        where: { id: brief.topOpportunityId },
        include: { analysis: true }
      });
    }
    
    // Extract count from the generated summary string to ensure it matches the AI text, 
    // instead of a rolling 24-hour window which expires to 0.
    let count = 0;
    if (brief.summary) {
      const match = brief.summary.match(/Analyzed (\d+) new startups/);
      if (match) count = parseInt(match[1]);
    }

    res.json({
      brief,
      topOpportunity,
      newStartupsCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top Opportunities endpoint
app.get('/api/startups/top', async (req, res) => {
  try {
    const { days } = req.query;
    const dateFilter = {};
    
    if (days && days !== 'all') {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - parseInt(days));
      dateFilter.createdAt = { gte: pastDate };
    }

    const startups = await prisma.startup.findMany({
      where: dateFilter,
      include: {
        analysis: true
      },
      orderBy: {
        analysis: {
          overallScore: 'desc'
        }
      },
      take: 50
    });
    
    res.json(startups.filter(s => s.analysis));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Startup Detail endpoint
app.get('/api/startups/:id', async (req, res) => {
  try {
    const startupId = req.params.id;
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: { analysis: true }
    });

    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Fetch related startups from the same category (excluding self)
    const related = await prisma.startup.findMany({
      where: { 
        category: startup.category,
        id: { not: startupId }
      },
      include: { analysis: true },
      take: 3,
      orderBy: {
        analysis: { overallScore: 'desc' }
      }
    });

    res.json({ startup, related });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual trigger for ingestion and brief generation
app.post('/api/ingest', async (req, res) => {
  try {
    await runIngestionPipeline();
    const brief = await generateDailyBrief();
    res.json({ message: "Ingestion and Brief generation complete", brief });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Target email required" });
    
    // Fetch latest brief
    const brief = await prisma.dailyBrief.findFirst({ orderBy: { date: 'desc' } });
    if (!brief) return res.status(400).json({ error: "No brief found to send" });
    
    let topOpportunity = null;
    if (brief.topOpportunityId) {
      topOpportunity = await prisma.startup.findUnique({
        where: { id: brief.topOpportunityId },
        include: { analysis: true }
      });
    }
    
    const count = await prisma.startup.count({
      where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } }
    });

    const success = await emailService.sendDailyBrief(email, brief, topOpportunity, count);
    
    if (success) {
      res.json({ message: "Test email sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send test email. Check server console for details." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// Deep Niche Reports
// ---------------------------------------------------------

// Get available niches
app.get('/api/niches', async (req, res) => {
  try {
    const categories = await prisma.startup.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });
    // Return list of non-null categories
    res.json(categories.filter(c => c.category).map(c => ({ name: c.category, count: c._count.category })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical reports
app.get('/api/reports/niche', async (req, res) => {
  try {
    const { category } = req.query;
    const whereClause = category ? { niche: category } : {};
    const reports = await prisma.nicheReport.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate a new report
app.post('/api/reports/niche', async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ error: "Category is required" });
    
    const nicheReportEngine = require('./services/nicheReportEngine');
    const report = await nicheReportEngine.generateReport(category);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// Opportunity Lab
// ---------------------------------------------------------

app.post('/api/lab/validate', async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });
    
    const validator = require('./services/ideaValidatorEngine');
    const result = await validator.validateIdea(idea);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lab/matrix', async (req, res) => {
  try {
    const startups = await prisma.startup.findMany({
      include: { analysis: true }
    });
    const formatted = startups.filter(s => s.analysis).map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      demand: s.analysis.demandScore,
      competition: s.analysis.competitionScore,
      overall: s.analysis.overallScore
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lab/ideas', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
    const ideas = await prisma.validatedIdea.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// Daily Briefs
// ---------------------------------------------------------

app.get('/api/briefs', async (req, res) => {
  try {
    const briefs = await prisma.dailyBrief.findMany({
      orderBy: { date: 'desc' },
      take: 30
    });
    res.json(briefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// Phase 9: Pitch Decks & SWOT
// ---------------------------------------------------------

app.post('/api/lab/pitch-deck', async (req, res) => {
  try {
    const { ideaId } = req.body;
    if (!ideaId) return res.status(400).json({ error: "Idea ID required" });
    const deck = await ideaValidatorEngine.generatePitchDeck(ideaId);
    res.json(deck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/startup/:id/swot', async (req, res) => {
  try {
    const { id } = req.params;
    const swot = await aiEngine.generateSwot(id);
    res.json(swot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// Phase 10: AI Copilot
// ---------------------------------------------------------

app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    
    const copilotEngine = require('./services/copilotEngine');
    const result = await copilotEngine.generateResponse(message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// Cron Jobs
// ---------------------------------------------------------

// Run the Live Ingestion Pipeline every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log("CRON triggered: Running Ingestion Pipeline...");
  try {
    await runIngestionPipeline();
    const brief = await generateDailyBrief();
    
    // Trigger email blast
    let topOpportunity = null;
    if (brief.topOpportunityId) {
      topOpportunity = await prisma.startup.findUnique({
        where: { id: brief.topOpportunityId },
        include: { analysis: true }
      });
    }
    const count = await prisma.startup.count({
      where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } }
    });
    
    await emailService.sendDailyBriefToAllUsers(brief, topOpportunity, count);
    
    console.log("CRON complete.");
  } catch (error) {
    console.error("CRON failed:", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Scheduled cron job for ingestion (every 6 hours).");
});
