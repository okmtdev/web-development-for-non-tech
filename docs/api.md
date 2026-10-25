# API仕様

[第2回教材](lessons/02-api.md)

基準URLは `http://localhost:3000`。設定を変えた場合はそのURLを使います。本文を送るときは `Content-Type: application/json` を指定します。SupabaseモードのタスクAPIは `Authorization: Bearer <アクセストークン>` が必要です。demoモードはローカルだけで動作します。

| メソッド・パス | 入力 | 正常応答 |
| --- | --- | --- |
| `GET /api/health` | なし | 200、`{"ok":true,"mode":"demo"}` など。外部DBへの疎通は確かめない |
| `POST /api/session` | `{"email":"...","password":"..."}` | 200、`access_token` と `expires_in`。Supabaseモードのみ |
| `GET /api/tasks` | なし | 200、`{"tasks":[...]}` |
| `POST /api/tasks` | `{"title":"教材を開く"}`。`done` は任意 | 201、`{"task":{...}}` |
| `PATCH /api/tasks/:id` | `title`、`done` の一方または両方 | 200、`{"task":{...}}` |
| `DELETE /api/tasks/:id` | なし | 204、本文なし |

`title` は前後の空白を除いて1〜80文字（JavaScriptの文字数単位）。`done` は真偽値。IDはUUID形式。タスクの入力項目は `title` と `done` だけで、所有者IDはDBがログイン情報から決めます。POSTで `done` を省略するとfalseです。PATCHに空のオブジェクトは送れません。

応答のタスク項目は `id`、`title`、`done`、`created_at`。DBの `user_id` は画面に渡しません。DB版は新しい順に最大200件。ローカル版は新しい追加を先頭に置き、保存件数も200件までです。

| 番号 | 意味・確認先 |
| --- | --- |
| 400 | 不正なJSON・空白だけ・文字数・項目・ID・型を確認 |
| 401 | 未ログイン、期限切れ、ログイン情報の誤り |
| 403 | 別サイトからの依頼、不正Host、DBの権限 |
| 404 | 存在しないURL／タスク、または本人の行ではない |
| 405 | 対応しないHTTPメソッド |
| 409 | ローカル版の200件上限 |
| 413 | リクエスト本文が8,192バイトを超えた |
| 415 | JSON以外のContent-Type |
| 429 | Supabaseでのリクエスト制限 |
| 500 | ローカルの保存・読込などの予期しない問題 |
| 502 | Supabaseの通信・設定・処理の問題 |

エラー本文は `{"error":"説明"}` です。秘密を含む外部サービスの生のエラーは返しません。Originの確認はブラウザの別サイトからの操作を防ぐ補助で、認証の代わりではありません。
