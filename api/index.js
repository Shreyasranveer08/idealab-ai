const app = require('../server/index.js');

app.use((req, res, next) => {
  res.setHeader('X-DB-URL-Len', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'UNDEFINED');
  res.setHeader('X-Env-Keys', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('GEMINI')).join(','));
  next();
});

// Export the Express app as a Vercel Serverless Function
module.exports = app;
