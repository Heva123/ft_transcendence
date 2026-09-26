'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { io } = require('socket.io-client');

const URL = process.env.SOCKET_URL || 'http://127.0.0.1:3000';

function waitFor(socket, event, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timed out waiting for ${event}. Is the NestJS server running?`));
    }, timeoutMs);

    function handler(data) {
      clearTimeout(timeout);
      resolve(data);
    }

    socket.once(event, handler);
  });
}

async function connectClient() {
  const client = io(URL, {
    autoConnect: false,
    reconnection: false,
    timeout: 5000,
  });

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Cannot connect to ${URL}. Start npm run start:dev first.`));
      }, 5000);

      function cleanup() {
        clearTimeout(timer);
        client.off('connect', onConnect);
        client.off('connect_error', onError);
      }
      function onConnect() {
        cleanup();
        resolve();
      }
      function onError(error) {
        cleanup();
        reject(error);
      }

      client.once('connect', onConnect);
      client.once('connect_error', onError);
      client.connect();
    });
    return client;
  } catch (error) {
    client.disconnect();
    throw error;
  }
}

test('two clients connect, ping, broadcast, validate, disconnect', { timeout: 20000 }, async () => {
  const clients = [];
  try {
    const a = await connectClient();
    clients.push(a);
    const b = await connectClient();
    clients.push(b);

    assert.ok(a.connected && b.connected, 'Both users must connect');
    assert.notEqual(a.id, b.id, 'Sockets must have different IDs');
    console.log('PASS: two independent clients connected');

    const pong = waitFor(a, 'demo:pong');
    a.emit('demo:ping', { hello: 'Worod' });
    assert.deepEqual((await pong).received, { hello: 'Worod' });
    console.log('PASS: ping -> pong to the sender');

    const messageA = waitFor(a, 'demo:message');
    const messageB = waitFor(b, 'demo:message');
    a.emit('demo:message', { text: 'Hello from Worod' });
    const [receivedByA, receivedByB] = await Promise.all([messageA, messageB]);
    assert.equal(receivedByA.text, 'Hello from Worod');
    assert.equal(receivedByB.text, 'Hello from Worod');
    assert.equal(receivedByB.fromSocketId, a.id);
    console.log('PASS: same broadcast received by BOTH clients');

    const error = waitFor(a, 'demo:error');
    a.emit('demo:message', { text: '   ' });
    assert.match((await error).message, /1.200/);
    console.log('PASS: server rejects empty messages');

    a.disconnect();
    b.disconnect();
    assert.ok(!a.connected && !b.connected, 'Both sockets should disconnect');
    console.log('PASS: both clients disconnected');
  } finally {
    clients.forEach((client) => client.disconnect());
  }
});
