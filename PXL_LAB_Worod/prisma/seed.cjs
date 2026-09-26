'use strict';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  for (const user of [
    { id: 'demo-worod', username: 'worod' },
    { id: 'demo-afnan', username: 'afnan' },
  ]) {
    await prisma.user.upsert({ where: { id: user.id }, update: { username: user.username }, create: user });
  }
  await prisma.community.upsert({
    where: { id: 'community-web' },
    update: { name: 'Web Developers' },
    create: { id: 'community-web', name: 'Web Developers' },
  });
  for (const member of [
    { userId: 'demo-worod', communityId: 'community-web', role: 'OWNER' },
    { userId: 'demo-afnan', communityId: 'community-web', role: 'MEMBER' },
  ]) {
    await prisma.membership.upsert({
      where: { userId_communityId: { userId: member.userId, communityId: member.communityId } },
      update: { role: member.role },
      create: member,
    });
  }
  await prisma.post.upsert({
    where: { id: 'demo-welcome' },
    update: {},
    create: { id: 'demo-welcome', authorId: 'demo-worod', content: 'Welcome to PXL_LAB!' },
  });
  console.log('Seed completed.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
