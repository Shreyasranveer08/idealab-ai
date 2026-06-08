const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function cleanText(text) {
  if (!text) return text;
  // Replace basic HTML entities
  let clean = text
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  // Strip HTML tags
  clean = clean.replace(/<\/?[^>]+(>|$)/g, " ");
  
  // Replace multiple spaces/newlines with single space
  clean = clean.replace(/\s+/g, ' ').trim();
  
  return clean;
}

async function run() {
  console.log("Cleaning startup descriptions...");
  const startups = await prisma.startup.findMany();
  
  for (const s of startups) {
    if (s.description) {
      const cleaned = cleanText(s.description);
      if (cleaned !== s.description) {
        await prisma.startup.update({
          where: { id: s.id },
          data: { description: cleaned }
        });
        console.log(`Cleaned: ${s.name}`);
      }
    }
  }
  console.log("Done!");
}

run().catch(console.error);
