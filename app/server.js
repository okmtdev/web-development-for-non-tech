import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createDemoStore } from './lib/demo-store.js';
import { createSupabaseStore } from './lib/supabase-store.js';
import { validateTask, validateId } from './lib/validation.js';
import { AppError } from './lib/errors.js';

const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
const defaultData = fileURLToPath(new URL('./data/tasks.json', import.meta.url));
const staticFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']]
]);

export function getConfig(env = process.env) {
  const mode = env.APP_MODE || 'demo';
  if (!['demo', 'supabase'].includes(mode)) throw new Error('APP_MODE は demo または supabase にしてください。');
  const host = env.HOST || (env.K_SERVICE ? '0.0.0.0' : '127.0.0.1');
  if (mode === 'demo' && (env.K_SERVICE || !['127.0.0.1', 'localhost', '::1'].includes(host))) {
    throw new Error('demo は自分のPC専用です。公開環境では supabase モードを設定してください。');
  }
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT は1〜65535の数字にしてください。');
  let origin = env.APP_ORIGIN || '';
  if (origin) {
    const parsed = new URL(origin);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) throw new Error('APP_ORIGIN は末尾の / を含まないURLにしてください。');
  }
  if (mode === 'supabase' && !['127.0.0.1', 'localhost', '::1'].includes(host) && !origin.startsWith('https://')) {
    throw new Error('公開環境では HTTPS の APP_ORIGIN が必要です。');
  }
  const url = (env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.SUPABASE_PUBLISHABLE_KEY || '';
  if (mode === 'supabase') {
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || url.includes('YOUR_PROJECT')) throw new Error('自分の SUPABASE_URL を設定してください。');
    if (!key.startsWith('sb_publishable_') || key.includes('REPLACE_ME')) throw new Error('SUPABASE_PUBLISHABLE_KEY に publishable キーを設定してください。secret / service_role キーは使用しません。');
  }
  return { mode, host, port, origin, url, key, dataFile: env.DEMO_DATA_FILE || defaultData };
}

async function readJson(req) {
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new AppError(415, 'Content-Type を application/json にしてください。');
  let length = 0;
  const chunks = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 8192) throw new AppError(413, '送信する内容が大きすぎます。');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString()); }
  catch { throw new AppError(400, 'JSONの書き方を確認してください。'); }
}

export function createApp(config = getConfig(), suppliedStore) {
  const store = suppliedStore || (config.mode === 'supabase' ? createSupabaseStore(config) : createDemoStore(config.dataFile));
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(body === undefined ? undefined : JSON.stringify(body)); };
    try {
      const host = req.headers.host || '';
      const allowedHosts = new Set([`127.0.0.1:${config.port}`, `localhost:${config.port}`, `[::1]:${config.port}`]);
      if (config.origin) allowedHosts.add(new URL(config.origin).host);
      if (!allowedHosts.has(host)) throw new AppError(403, 'このホストからは利用できません。');
      // ブラウザが付けるOriginを確認。APIクライアントの認証の代わりではありません。
      const origin = req.headers.origin;
      const expectedOrigin = config.origin || `http://${host}`;
      if (origin && origin !== expectedOrigin) throw new AppError(403, '別のサイトからの操作は許可されていません。');
      const path = new URL(req.url, expectedOrigin).pathname;
      const method = req.method;
      if (method === 'GET' && staticFiles.has(path)) {
        const [file, type] = staticFiles.get(path);
        res.writeHead(200, { 'Content-Type': type });
        return res.end(await readFile(resolve(publicDir, file)));
      }
      if (path === '/api/health' && method === 'GET') return json(200, { ok: true, mode: config.mode });
      if (path === '/api/session' && method === 'POST' && config.mode === 'supabase') {
        const body = await readJson(req);
        if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email.trim() || body.email.length > 254 || !body.password || body.password.length > 256) throw new AppError(400, 'メールアドレスとパスワードを入力してください。');
        return json(200, await store.login(body.email.trim(), body.password));
      }
      if (path === '/api/tasks' || path.startsWith('/api/tasks/')) {
        const token = /^Bearer (\S+)$/.exec(req.headers.authorization || '')?.[1];
        if (config.mode === 'supabase') await store.authorize(token);
        if (path === '/api/tasks') {
          if (method === 'GET') return json(200, { tasks: await store.list(token) });
          if (method === 'POST') return json(201, { task: await store.create(validateTask(await readJson(req)), token) });
        } else {
          const id = validateId(path.slice('/api/tasks/'.length));
          if (method === 'PATCH') return json(200, { task: await store.update(id, validateTask(await readJson(req), { partial: true }), token) });
          if (method === 'DELETE') { await store.remove(id, token); return json(204); }
        }
        throw new AppError(405, 'この操作方法は対応していません。');
      }
      throw new AppError(404, 'ページまたはAPIが見つかりません。');
    } catch (error) {
      if (!(error instanceof AppError)) console.error('処理に失敗しました。設定・保存ファイルを確認してください。');
      if (!res.headersSent) json(error.status || 500, { error: error instanceof AppError ? error.message : 'サーバーで問題が起きました。ターミナルと保存ファイルを確認してください。' });
      else res.end();
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const config = getConfig();
    const server = createApp(config);
    server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'ポートが使用中です。起動済みのサーバーを止めるか、.env の PORT を変更してください。' : 'サーバーを起動できません。設定を確認してください。'); process.exitCode = 1; });
    server.listen(config.port, config.host, () => console.log(`マイタスク: ${config.origin || `http://localhost:${config.port}`} (${config.mode})`));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
