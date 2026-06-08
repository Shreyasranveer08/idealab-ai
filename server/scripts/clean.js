const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
async function clean() {
  await prisma.startup.deleteMany({where: {sources: 'VALIDATION_DATASET'}});
  console.log('Cleaned DB.');
  await prisma.$disconnect();
}
clean();
