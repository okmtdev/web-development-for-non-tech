# 演習3：Supabase接続と2人のデータの分離

[第3回教材](../lessons/03-database.md) / [トラブル対応](../troubleshooting.md)

前提：自分または講師が管理する**新規の学習用**Supabaseプロジェクト。仕事のDBでは実行しません。この演習は外部サービスへテーブルと架空データを書き込みます。アカウント作成は授業前に済ませます。

## A. プロジェクト・表・利用者を用意する（25分）

1. [Supabase Dashboard](https://supabase.com/dashboard)にログイン。「New project」で学習用プロジェクトを作る。プランがFreeであることを確認し、名前は `mytasks-learning` などにします。リージョンは近い地域を選びます。
2. DBパスワードを自分で生成して保管。教材やAIへ貼り付けません。このアプリではDBパスワードを使いません。
3. プロジェクトの準備完了を待ち、「SQL Editor」で新しいクエリを開く。`supabase/schema.sql` 全体をコピーし、内容を読んでRun。一度だけ実行します。
4. 「Table Editor」で `public.tasks` があり、5列が見えることを確認。RLSが有効であることを確認。「Authentication」のユーザー一覧は別の画面です。
5. 「Authentication → Users → Add user / Create new user」で練習用ユーザーAとBを作ります。メール送信のInviteではなく、パスワードを指定するCreateを選び、Auto Confirm User（メール確認済みにする項目）を有効にします。
6. 例：`learner-a@example.test` と `learner-b@example.test`。メールを送信しない架空のアドレスです。パスワードはそれぞれ自分で生成し、教材の共通パスワードは使いません。UIの名称が異なる場合は「ユーザーを作成し確認済みにする」操作を講師と探します。
7. 授業のユーザーを管理者が作成する運用では、Authenticationの設定で新規サインアップを無効にします。公開のユーザー登録画面はこの教材にはありません。

期待する結果：空のtasksテーブル、RLS有効、確認済みユーザーA/B。`relation already exists` は同名の表がすでにあるという意味です。既存の表を削除せず、学習用プロジェクトを選び直します。

## B. ローカルアプリを接続する（10分）

1. ターミナルでサーバーを `Ctrl+C` で止める。
2. `.env` がなければ `.env.example` をコピー（[事前準備](../setup.md)参照）。既存の `.env` は上書きコピーしません。
3. SupabaseのConnectまたはSettingsのAPI画面で **Project URL** と **Publishable key** を確認。下の2つの例示値を自分の値に置き換えます。

   ```dotenv
   APP_MODE=supabase
   PORT=3000
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
   ```

4. 保存して `npm start`。http://localhost:3000 を再読み込み。
5. 「Supabase接続モード」とログイン欄が出れば、アプリ側の切り替えは成功。Aでログインできれば、接続と認証も成功です。

`sb_secret_...`、`service_role`、DBパスワードは使いません。このアプリはpublishableキー以外を起動時に拒否します。URLの末尾に `/rest/v1` を付けません。

## C. 保存と権限を確認する（15分）

1. Aでログインし、「Aの練習タスク」を追加。編集・完了切り替えも試す。
2. 再読み込みするとログイン画面に戻る。Aでログインし直し、タスクが残ることを確認。
3. ログアウトし、Bでログイン。Aのタスクが見えないことを確認。
4. Bで「Bの練習タスク」を追加。Aに戻って、Bのタスクが見えないことを確認。
5. Table Editorでは管理者として両方が見えることを確認。アプリの利用者とは権限が違います。

| 確認 | 期待する結果 | 実際の結果 |
| --- | --- | --- |
| Aの追加・再ログイン | Aのタスクが残る |  |
| Bで一覧 | Aのタスクが見えない |  |
| Aで一覧 | Bのタスクが見えない |  |
| ログアウト後 | タスク画面が隠れる |  |

## D. 講師向け：APIからRLSも確かめる（授業外または余裕がある場合）

画面での非表示だけでなく、他人のタスクの更新・削除も拒否されることを確認します。`.env` に次の項目を追加し、自分の練習用ユーザーの値を入力します。パスワードに `#` や空白を含む場合は引用符で囲んでください。

```dotenv
SUPABASE_TEST_EMAIL_A=learner-a@example.test
SUPABASE_TEST_PASSWORD_A="自分で設定したAのパスワード"
SUPABASE_TEST_EMAIL_B=learner-b@example.test
SUPABASE_TEST_PASSWORD_B="自分で設定したBのパスワード"
```

```sh
npm run test:supabase
```

このコマンドは実DBに確認用の1件を作成します。未ログインの拒否、Aの操作、BからAの行への閲覧・更新・削除の遮断を確認し、最後に確認用の1件を削除します。PASSと削除完了が期待する結果です。失敗時はRLSとSQLの権限設定を確認し、エラーの秘密部分を共有しないでください。終了後は `.env` からテスト用4項目を消します。

## 接続できない場合と片付け（10分＋振り返り5分）

- 401：メール確認済みか、A/Bの値か、ログイン期限切れでないかを確認。
- 502：ネット接続、プロジェクト停止、URL・publishableキー・tasks表の有無を確認。
- 403：RLSと権限を確認。RLSを無効化して解決しない。
- ローカルに戻す：`.env` を `APP_MODE=demo` にして再起動。以前のローカルデータが再び出ます。DBへの接続達成は未完了として記録。

授業後は不要な架空タスクを各利用者の画面で削除。プロジェクト自体を削除すると他のデータも消えるため、所有者が学習用であることを確認して判断します。
