// Run against your local development API and its matching DATABASE_URL.
// Creates isolated test accounts, promotes one using local DB access, then cleans up.
require('dotenv').config({ quiet: true });
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const base = process.env.API_BASE_URL || 'http://localhost:3001/api';
const created = [];
let checks = 0;

async function request(method, route, token, body, expected) {
  const response = await fetch(base + route, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  assert.equal(response.status, expected, `${method} ${route}: ${text}`);
  checks++;
  console.log(`PASS ${response.status} ${method} ${route}`);
  return text ? JSON.parse(text) : undefined;
}

async function account(label) {
  const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
  const result = await request('POST', '/auth/register', null, {
    email: `${label}_${suffix}@example.com`, username: `${label}_${suffix}`, password: 'Testing12345',
  }, 201);
  created.push(result.user.id);
  // Ensure the API and script use the same DB before granting any test roles.
  const row = await prisma.user.findUnique({ where: { id: result.user.id } });
  assert.ok(row, 'API_BASE_URL and DATABASE_URL must point to the same local backend/database');
  assert.equal(row.siteRole, 'USER');
  return result;
}

(async () => {
  console.log(`Testing ${base}; temporary accounts only.`);
  const admin = await account('admincheck');
  const user = await account('usercheck');
  const guest = await account('guestcheck');
  await prisma.user.update({ where: { id: admin.user.id }, data: { siteRole: 'ADMIN' } });
  await prisma.user.update({ where: { id: guest.user.id }, data: { siteRole: 'GUEST' } });
  const a = admin.accessToken;
  await request('GET', '/admin/users', null, null, 401);
  await request('GET', '/admin/users', user.accessToken, null, 403);
  await request('GET', '/admin/users', guest.accessToken, null, 403);
  const list = await request('GET', '/admin/users?limit=2', a, null, 200);
  assert.ok(list.items.length <= 2);
  assert.ok(list.items.every(row => !('passwordHash' in row)));
  await request('GET', '/admin/users?page=0', a, null, 400);
  const profile = await request('GET', '/users/me', guest.accessToken, null, 200);
  assert.equal(profile.siteRole, 'GUEST');
  assert.equal(profile.avatarUrl, '/api/default-avatar');
  await request('PATCH', '/users/me', guest.accessToken, { bio: 'should fail' }, 403);
  await request('POST', '/communities', guest.accessToken, { name: 'Should fail' }, 403);
  await request('PATCH', '/users/me', user.accessToken, { siteRole: 'ADMIN' }, 400);

  const community = await request('POST', '/communities', user.accessToken, { name: 'Disposable admin deletion test', isPublic: false }, 201);
  await request('POST', '/posts', user.accessToken, { content: 'Disposable test post', communityId: community.id }, 201);
  const id = randomUUID().replaceAll('-', '').slice(0,12);
  const newAccount = await request('POST', '/admin/users', a, { username: `created_${id}`, email: `created_${id}@example.com`, password: 'Testing12345', siteRole: 'USER' }, 201);
  created.push(newAccount.id);
  assert.ok(!('passwordHash' in newAccount));
  await request('GET', `/admin/users/${newAccount.id}`, a, null, 200);
  await request('PATCH', `/admin/users/${user.user.id}`, a, { displayName: 'Changed by administrator', siteRole: 'GUEST' }, 200);
  // An old JWT must respect the new database role immediately.
  await request('PATCH', '/users/me', user.accessToken, { bio: 'should fail' }, 403);
  await request('PATCH', `/admin/users/${admin.user.id}`, a, { siteRole: 'USER' }, 403);
  await request('DELETE', `/admin/users/${admin.user.id}`, a, null, 403);
  await request('DELETE', `/admin/users/${user.user.id}`, a, null, 204);
  assert.equal(await prisma.community.findUnique({ where: { id: community.id } }), null);
  await request('GET', '/users/me', user.accessToken, null, 401);
  await request('GET', `/admin/users/${user.user.id}`, a, null, 404);
  await request('DELETE', `/admin/users/${newAccount.id}`, a, null, 204);
  await request('DELETE', `/admin/users/${guest.user.id}`, a, null, 204);
  console.log(`All ${checks} HTTP checks passed against your running backend and database.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; })
.finally(async () => {
  try {
    // Explicit local cleanup, including the disposable administrator.
    await prisma.community.deleteMany({ where: { createdById: { in: created } } });
    await prisma.post.deleteMany({ where: { authorId: { in: created } } });
    await prisma.user.deleteMany({ where: { id: { in: created } } });
    console.log('Temporary test accounts/content cleaned up.');
  } catch (error) { console.error(`Cleanup incomplete: ${error.message}`); process.exitCode = 1; }
  await prisma.$disconnect();
});
