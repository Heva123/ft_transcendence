// Local operator tool only. Never accepts a role from public registration.
const { PrismaClient } = require('@prisma/client');
const { config } = require('dotenv');
config();
const prisma = new PrismaClient();
(async () => {
  const username = process.argv[2];
  if (!username) throw new Error('Usage: npm run admin:promote -- EXISTING_USERNAME');
  const user = await prisma.user.update({ where: { username }, data: { siteRole: 'ADMIN' }, select: { id: true, username: true, siteRole: true } });
  console.log(user);
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
