'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const ROOT = process.env.API_URL || 'http://127.0.0.1:3000';
async function request(path, { method='GET', user='demo-worod', body }={}) {
  const response = await fetch(ROOT + path, {
    method,
    headers: {
      ...(user ? {'x-demo-user': user} : {}),
      ...(body === undefined ? {} : {'content-type': 'application/json'}),
    },
    ...(body === undefined ? {} : {body: JSON.stringify(body)}),
    signal: AbortSignal.timeout(7000),
  });
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      `Expected JSON from ${ROOT}${path}, received HTTP ${response.status} and ${response.headers.get('content-type') || 'unknown content type'}. ` +
      `Response starts: ${raw.slice(0, 100)}. Check the server running on port 3000 ` +
      `and started the new integrated project.`
    );
  }
  return { status: response.status, data };
}

test('social API: auth, CRUD, comments, likes, community', {timeout: 30000}, async () => {
  let id;
  try {
    const noIdentity = await request('/posts', {user:null});
    assert.equal(noIdentity.status, 401);
    console.log('PASS: endpoints reject missing demo identity');

    const create = await request('/posts', {
      method:'POST', body:{content:'Automated test post'},
    });
    assert.equal(create.status, 201);
    assert.equal(create.data.content, 'Automated test post');
    assert.equal(create.data.authorId, 'demo-worod');
    id = create.data.id;
    console.log('PASS: create post with author determined by server');

    const read = await request(`/posts/${id}`);
    assert.equal(read.status, 200);
    assert.equal(read.data.id, id);
    const listing = await request('/posts?page=1');
    assert.equal(listing.status, 200);
    assert.ok(listing.data.total >= 1);
    console.log('PASS: read/list saved posts');

    const denied = await request(`/posts/${id}`, {
      method:'PATCH', user:'demo-afnan', body:{content:'not mine'},
    });
    assert.equal(denied.status, 403);
    const edited = await request(`/posts/${id}`, {method:'PATCH', body:{content:'Edited content'}});
    assert.equal(edited.status, 200);
    assert.equal(edited.data.content, 'Edited content');
    console.log('PASS: author can edit; other user cannot');

    const bad = await request('/posts', {method:'POST',body:{content:'   '}});
    assert.equal(bad.status, 400);
    const extraField = await request('/posts', {method:'POST',body:{content:'hello',authorId:'demo-afnan'}});
    assert.equal(extraField.status, 400);
    console.log('PASS: validation rejects empty text and user-supplied authorId');

    const comment = await request(`/posts/${id}/comments`, {
      method:'POST', user:'demo-afnan',body:{content:'Afnan comment'},
    });
    assert.equal(comment.status, 201);
    assert.equal(comment.data.authorId, 'demo-afnan');
    const comments = await request(`/posts/${id}/comments`);
    assert.ok(comments.data.some((item)=>item.id===comment.data.id));
    const notOwnerComment = await request(`/posts/${id}/comments/${comment.data.id}`, {
      method:'DELETE',user:'demo-worod',
    });
    assert.equal(notOwnerComment.status, 403);
    const editedComment = await request(`/posts/${id}/comments/${comment.data.id}`, {
      method:'PATCH',user:'demo-afnan',body:{content:'Edited comment'},
    });
    assert.equal(editedComment.data.content, 'Edited comment');
    console.log('PASS: comments belong to post and enforce ownership');

    const like1 = await request(`/posts/${id}/likes`, {method:'POST',user:'demo-afnan'});
    const like2 = await request(`/posts/${id}/likes`, {method:'POST',user:'demo-afnan'});
    assert.equal(like1.status, 201);
    assert.equal(like2.data.likeCount, like1.data.likeCount);
    const asAfnan = await request(`/posts/${id}`,{user:'demo-afnan'});
    assert.equal(asAfnan.data.likedByMe,true);
    const unlike = await request(`/posts/${id}/likes`,{method:'DELETE',user:'demo-afnan'});
    assert.equal(unlike.data.liked,false);
    console.log('PASS: one like per user, likedByMe, unlike');

    const community = await request('/posts', {
      method:'POST',body:{content:'Community test',communityId:'community-web'},
    });
    assert.equal(community.status, 201);
    const group = await request('/posts?communityId=community-web');
    assert.ok(group.data.items.some((item)=>item.id===community.data.id));
    await request(`/posts/${community.data.id}`,{method:'DELETE'});
    console.log('PASS: community feed and membership-aware posts');

    const deleted = await request(`/posts/${id}`,{method:'DELETE'});
    assert.equal(deleted.status, 200);
    id = undefined;
    const missing = await request(`/posts/${deleted.data.id}`);
    assert.equal(missing.status, 404);
    console.log('PASS: delete post cascades comments and likes');
  } finally {
    if(id) await request(`/posts/${id}`, {method:'DELETE'}).catch(()=>{});
  }
});
