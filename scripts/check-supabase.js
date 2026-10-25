// 実際の練習用DBでRLSを確認する任意テスト。設定値やトークンは出力しません。
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { getConfig } from '../app/server.js';
const config = getConfig();
const { SUPABASE_TEST_EMAIL_A: emailA, SUPABASE_TEST_PASSWORD_A: passwordA, SUPABASE_TEST_EMAIL_B: emailB, SUPABASE_TEST_PASSWORD_B: passwordB } = process.env;
if (config.mode !== 'supabase' || !emailA || !passwordA || !emailB || !passwordB || emailA === emailB) {
  console.error('docs/exercises/03-database.md に従い、supabaseモードと異なる練習用ユーザーA/Bを設定してください。');
  process.exit(1);
}
async function request(path, token, method = 'GET', body) {
  return fetch(`${config.url}${path}`, { method, headers: { apikey: config.key, ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(10000) });
}
async function login(email, password) {
  const response = await request('/auth/v1/token?grant_type=password', '', 'POST', { email, password });
  assert.equal(response.status, 200, '練習用ユーザーでログインできません。');
  return (await response.json()).access_token;
}
let tokenA;
let id;
try {
  tokenA = await login(emailA, passwordA);
  const tokenB = await login(emailB, passwordB);
  const anonymous = await request('/rest/v1/tasks?select=id', '');
  assert.ok([401, 403].includes(anonymous.status), '未ログインでテーブルへアクセスできています。');
  const created = await request('/rest/v1/tasks?select=id', tokenA, 'POST', { title: `RLS練習-${randomUUID().slice(0, 8)}` });
  assert.equal(created.status, 201, 'Aのタスクを作成できません。');
  id = (await created.json())[0].id;
  const target = `/rest/v1/tasks?id=eq.${id}&select=id,title,done`;
  assert.deepEqual(await (await request(target, tokenB)).json(), [], 'BにAのタスクが見えています。');
  assert.deepEqual(await (await request(target, tokenB, 'PATCH', { done: true })).json(), [], 'BがAのタスクを更新できています。');
  assert.deepEqual(await (await request(target, tokenB, 'DELETE')).json(), [], 'BがAのタスクを削除できています。');
  const own = await request(target, tokenA, 'PATCH', { done: true });
  assert.equal(own.status, 200);
  assert.equal((await own.json())[0].done, true);
  console.log('PASS: 未ログイン拒否、Aの追加・更新、Bからの閲覧・更新・削除の遮断');
} catch (error) {
  console.error(error instanceof assert.AssertionError ? error.message.split('\n')[0] : '確認に失敗しました。通信と練習用DBの設定を確認してください。');
  process.exitCode = 1;
} finally {
  if (id && tokenA) {
    try {
      const response = await request(`/rest/v1/tasks?id=eq.${id}`, tokenA, 'DELETE');
      if (!response.ok) throw new Error();
      console.log('確認用タスクを削除しました。');
    } catch { console.error('確認用タスクの削除をTable Editorで確認してください。'); process.exitCode = 1; }
  }
}
