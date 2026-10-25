import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { get } from 'node:http';
import { createApp, getConfig } from '../app/server.js';

async function fixture(t, overrides = {}, store) {
  const directory = await mkdtemp(join(tmpdir(), 'mytasks-test-'));
  const config = { mode: 'demo', port: 0, host: '127.0.0.1', origin: '', dataFile: join(directory, 'tasks.json'), ...overrides };
  const server = createApp(config, store);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  config.port = server.address().port;
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(directory, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${config.port}`;
  const request = (path, { method = 'GET', body, headers = {} } = {}) => fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { request, config, base };
}

test('CRUD: 一覧・追加・編集・完了・永続化・削除', async t => {
  const { request, config } = await fixture(t);
  assert.deepEqual(await (await request('/api/tasks')).json(), { tasks: [] });
  const created = await request('/api/tasks', { method: 'POST', body: { title: '  教材を開く  ' } });
  assert.equal(created.status, 201);
  const { task } = await created.json();
  assert.equal(task.title, '教材を開く');
  assert.equal(task.done, false);
  const updated = await request(`/api/tasks/${task.id}`, { method: 'PATCH', body: { title: '説明してみる', done: true } });
  assert.equal((await updated.json()).task.done, true);
  assert.equal(JSON.parse(await readFile(config.dataFile))[0].title, '説明してみる');
  // 保存の読み戻しはストアを作り直して確認します。
  const { createDemoStore } = await import('../app/lib/demo-store.js');
  assert.equal((await createDemoStore(config.dataFile).list())[0].done, true);
  assert.equal((await request(`/api/tasks/${task.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await request(`/api/tasks/${task.id}`, { method: 'DELETE' })).status, 404);
  assert.deepEqual(await (await request('/api/tasks')).json(), { tasks: [] });
});

test('不正な入力・未知の項目・ID・JSONを拒否する', async t => {
  const { request, base } = await fixture(t);
  for (const body of [null, [], {}, { title: '' }, { title: '  ' }, { title: 'a'.repeat(81) }, { title: 4 }, { title: 'x', done: 'false' }, { title: 'x', user_id: 'another-user' }]) {
    assert.equal((await request('/api/tasks', { method: 'POST', body })).status, 400, JSON.stringify(body));
  }
  assert.equal((await request('/api/tasks', { method: 'POST', body: { title: 'a'.repeat(80) } })).status, 201);
  assert.equal((await request('/api/tasks/not-an-id', { method: 'PATCH', body: { done: true } })).status, 400);
  const broken = await fetch(`${base}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' });
  assert.equal(broken.status, 400);
  assert.equal((await request('/api/tasks', { method: 'POST', body: { title: 'a'.repeat(9000) } })).status, 413);
});

test('別サイト・不正Host・秘密ファイルへのアクセスを拒否する', async t => {
  const { request, base } = await fixture(t);
  assert.equal((await request('/api/tasks', { method: 'POST', body: { title: 'x' }, headers: { Origin: 'https://evil.example' } })).status, 403);
  const badHostStatus = await new Promise((resolve, reject) => {
    get(`${base}/api/tasks`, { headers: { Host: 'evil.example' } }, response => { response.resume(); resolve(response.statusCode); }).on('error', reject);
  });
  assert.equal(badHostStatus, 403);
  assert.equal((await request('/api/tasks', { method: 'POST', body: { title: 'x' }, headers: { 'Content-Type': 'text/plain' } })).status, 415);
  for (const path of ['/.env', '/data/tasks.json', '/server.js', '/%2e%2e/.env']) assert.equal((await request(path)).status, 404);
  const page = await request('/');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(await page.text(), /マイタスク/);
});

test('並行した追加でも保存が失われない', async t => {
  const { request } = await fixture(t);
  const responses = await Promise.all(Array.from({ length: 20 }, (_, i) => request('/api/tasks', { method: 'POST', body: { title: `練習${i}` } })));
  assert.ok(responses.every(response => response.status === 201));
  assert.equal((await (await request('/api/tasks')).json()).tasks.length, 20);
});

test('Supabaseモードは認証必須で、認証済みトークンをストアへ渡す', async t => {
  const { AppError } = await import('../app/lib/errors.js');
  const observed = [];
  const store = {
    async authorize(token) { if (token !== 'valid-test-token') throw new AppError(401, 'ログインしてください。'); },
    async list(token) { observed.push(token); return []; },
    async login() { return { access_token: 'valid-test-token', expires_in: 3600 }; }
  };
  const { request } = await fixture(t, { mode: 'supabase' }, store);
  assert.equal((await request('/api/tasks')).status, 401);
  assert.equal((await request('/api/tasks', { headers: { Authorization: 'Bearer wrong' } })).status, 401);
  assert.equal((await request('/api/tasks', { headers: { Authorization: 'Bearer valid-test-token' } })).status, 200);
  assert.deepEqual(observed, ['valid-test-token']);
  const result = await request('/api/session', { method: 'POST', body: { email: 'learner@example.test', password: 'fake-test-password' } });
  assert.equal(result.status, 200);
  assert.equal((await request('/api/session', { method: 'POST', body: null })).status, 400);
});

test('公開demoと管理者キーを拒否し、ローカルの既定値で起動できる', () => {
  assert.equal(getConfig({}).mode, 'demo');
  assert.throws(() => getConfig({ APP_MODE: 'typo' }), /APP_MODE/);
  assert.throws(() => getConfig({ HOST: '0.0.0.0' }), /demo/);
  assert.throws(() => getConfig({ K_SERVICE: 'mytasks' }), /demo/);
  assert.throws(() => getConfig({ PORT: 'abc' }), /PORT/);
  assert.throws(() => getConfig({ APP_MODE: 'supabase', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_secret_test' }), /publishable/);
  assert.throws(() => getConfig({ APP_MODE: 'supabase', HOST: '0.0.0.0' }), /HTTPS/);
});
