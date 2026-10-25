import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupabaseStore } from '../app/lib/supabase-store.js';

test('SupabaseのURL・所有者トークン・更新する項目を保持する', async () => {
  const calls = [];
  const store = createSupabaseStore({ url: 'https://example.supabase.co', key: 'sb_publishable_test', fetcher: async (url, options) => {
    calls.push({ url, ...options });
    return new Response(JSON.stringify([{ id: 'test-id', title: 'テスト', done: true }]), { status: 200 });
  } });
  await store.list('user-token');
  await store.create({ title: 'テスト' }, 'user-token');
  await store.update('test-id', { done: true }, 'user-token');
  await store.remove('test-id', 'user-token');
  assert.ok(calls.every(call => call.headers.Authorization === 'Bearer user-token'));
  assert.ok(calls.every(call => call.headers.apikey === 'sb_publishable_test'));
  assert.match(calls[0].url, /limit=200/);
  assert.deepEqual(JSON.parse(calls[1].body), { title: 'テスト' });
  assert.equal(calls[2].method, 'PATCH');
  assert.equal(calls[3].method, 'DELETE');
});

test('ログイン応答からrefresh_tokenを除き、未認証・所有権なし・通信エラーを扱う', async () => {
  const login = createSupabaseStore({ url: 'https://example.supabase.co', key: 'fake', fetcher: async () => new Response(JSON.stringify({ access_token: 'fake-access', refresh_token: 'fake-refresh', expires_in: 3600 })) });
  assert.deepEqual(await login.login('a@example.test', 'fake'), { access_token: 'fake-access', expires_in: 3600 });
  await assert.rejects(login.authorize(), { status: 401 });
  const empty = createSupabaseStore({ url: 'https://example.supabase.co', key: 'fake', fetcher: async () => new Response('[]') });
  await assert.rejects(empty.update('id', { done: true }, 'token'), { status: 404 });
  await assert.rejects(empty.remove('id', 'token'), { status: 404 });
  const disconnected = createSupabaseStore({ url: 'https://example.supabase.co', key: 'fake', fetcher: async () => { throw new Error('private internal detail'); } });
  await assert.rejects(disconnected.list('token'), error => error.status === 502 && !error.message.includes('private'));
});

test('Supabaseのエラー詳細や秘密を画面へ返さない', async () => {
  for (const [status, expected] of [[401, 401], [403, 403], [429, 429], [500, 502]]) {
    const store = createSupabaseStore({ url: 'https://example.supabase.co', key: 'fake', fetcher: async () => new Response('PRIVATE SECRET', { status }) });
    await assert.rejects(store.list('token'), error => error.status === expected && !error.message.includes('PRIVATE'));
  }
});
