import { AppError } from './errors.js';

// 追加ライブラリなしでSupabaseのHTTP APIを呼びます。
// publishableキー + 利用者のトークンを送り、DBのRLSに本人の行だけを許可させます。
// service_role / secret キーは使いません。
export function createSupabaseStore({ url, key, fetcher = fetch }) {
  async function request(path, { token, method = 'GET', body } = {}) {
    let response;
    try {
      response = await fetcher(`${url}${path}`, {
        method,
        headers: {
          apikey: key,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      });
    } catch {
      throw new AppError(502, 'Supabaseへ接続できません。通信とプロジェクトの稼働状況を確認してください。');
    }
    if (!response.ok) {
      if (response.status === 401) throw new AppError(401, 'ログイン情報を確認し、もう一度ログインしてください。');
      if (response.status === 429) throw new AppError(429, 'リクエストが多すぎます。少し待ってください。');
      if (path.startsWith('/auth/') && response.status === 400) throw new AppError(401, 'メールアドレスとパスワードを確認してください。');
      if (response.status === 403) throw new AppError(403, '操作できません。ログインとRLS設定を確認してください。');
      throw new AppError(502, 'Supabaseの処理に失敗しました。URL・キー・テーブル設定を確認してください。');
    }
    return response.status === 204 ? null : response.json();
  }
  function one(rows) {
    if (!rows?.length) throw new AppError(404, 'タスクが見つからないか、操作する権限がありません。');
    return rows[0];
  }
  return {
    async login(email, password) {
      const data = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
      // refresh_tokenは返しません。練習用として、期限切れ時には再ログインします。
      return { access_token: data.access_token, expires_in: data.expires_in };
    },
    async authorize(token) {
      if (!token) throw new AppError(401, '先にログインしてください。');
      await request('/auth/v1/user', { token });
    },
    list(token) { return request('/rest/v1/tasks?select=id,title,done,created_at&order=created_at.desc&limit=200', { token }); },
    async create(input, token) {
      return one(await request('/rest/v1/tasks?select=id,title,done,created_at', { token, method: 'POST', body: input }));
    },
    async update(id, input, token) {
      return one(await request(`/rest/v1/tasks?id=eq.${id}&select=id,title,done,created_at`, { token, method: 'PATCH', body: input }));
    },
    async remove(id, token) {
      one(await request(`/rest/v1/tasks?id=eq.${id}&select=id`, { token, method: 'DELETE' }));
    }
  };
}
