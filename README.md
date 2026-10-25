# 非技術者のための、小さなWebアプリ開発教室

プログラミング未経験の社会人が、**画面・サーバー・データベースの役割を説明し、AIを使って小さなアプリを試作・改善する**ための教材です。全5回、各90分。第5回で学習用アプリをデプロイし、URLで操作・説明するところまで扱います。最初に完成済みのサンプルを動かし、観察・変更・確認を繰り返します。

作るアプリは「マイタスク」。タスクの追加、一覧、名前の編集、完了／未完了の切り替え、削除、状態による絞り込みができます。第4回に検索を追加します。個人情報や仕事の実データを使わず、架空のタスクで練習します。

## まず動かす（約5分）

前提：Node.js **24.x LTS**、ブラウザ、コードを編集するエディター。LTSは「長く保守される版」です。導入から必要な方は[事前準備](docs/setup.md)へ。

1. このリポジトリ（教材ファイルをまとめた保管場所）をダウンロードして展開します。Gitが使える場合は次でも取得できます。

   ```sh
   git clone https://github.com/okmtdev/web-development-for-non-tech.git
   cd web-development-for-non-tech
   ```

2. `package.json` があるフォルダでターミナルを開き、実行します。

   ```sh
   node --version
   npm start
   ```

   **`npm install` は不要**です。Node.jsの標準機能だけを使っています。`package-lock.json` も不要です。

3. ブラウザで **http://localhost:3000** を開きます。「ローカル練習モード」と空の一覧が出たら成功です。ターミナルは開いたままにします。終了は `Ctrl+C`（MacでもControlキー）。

## 操作する

| 操作 | 手順 | 期待する結果 |
| --- | --- | --- |
| 追加 | 入力欄に「教材を開く」と入力して「＋ 追加」 | 一覧に1件増える |
| 編集 | タスクの「編集」で名前を変え、「保存」 | 同じタスクの名前が変わる |
| 完了 | 左のチェックを押す | 取り消し線が付き、未完了の件数が減る |
| 絞り込み | 「未完了」「完了」を押す | 対象の状態だけ見える |
| 削除 | 「削除」で内容を確認して確定 | 対象の1件が消える |
| 保存確認 | ブラウザとサーバーを再起動 | タスクが残る |

ローカル版は `app/data/tasks.json` に保存します。ファイルは最初の変更時に生成され、Gitの対象外です。同じPCで1つのサーバーを動かす練習専用で、ログイン機能はありません。Supabase版は本人のデータをDBに保存します。2つの保存先の間でデータは自動移行しません。

## 教材の入口

| 読む順 | ファイル | 内容 |
| --- | --- | --- |
| 0 | [事前準備](docs/setup.md) | Mac／Windows、起動、AI、困ったとき |
| 1 | [カリキュラム](docs/curriculum.md) | 各回90分の配分と到達目標 |
| 2 | [第1回：画面と全体像](docs/lessons/01-overview.md) | 3つの役割、画面を変える |
| 3 | [第2回：通信と処理](docs/lessons/02-api.md) | API、入力チェック、通信を観察 |
| 4 | [第3回：DBと本人のデータ](docs/lessons/03-database.md) | Supabase、ログイン、アクセス制御 |
| 5 | [第4回：AIで改善](docs/lessons/04-improve.md) | 検索追加、テスト、成果発表 |
| 6 | [第5回：デプロイと全体構成](docs/lessons/05-deploy.md) | Cloud Run公開、別ブラウザ・再配置の確認 |
| 図解 | [実画面・ブラウザ・React／Next.js](docs/browser-and-frameworks.md) | 3ファイルとの対応、画面が表示される流れ、セッション |
| 比較 | [フロント・バックエンド・DBの役割](docs/roles-and-storage.md) | ブラウザの保存領域とDBを使い分ける |
| 補助 | [用語集](docs/glossary.md)／[トラブル対応](docs/troubleshooting.md) | わからない言葉・現象から調べる |
| 講師 | [講師用ガイド](docs/instructor.md)／[評価・確認表](docs/assessment.md) | 進行、解答、採点基準 |
| 技術 | [構成と費用](docs/architecture.md)／[API仕様](docs/api.md) | 設計意図、無料枠、制約 |
| 実習 | [Cloud Run操作手順](docs/cloud-run.md)／[演習5](docs/exercises/05-deploy.md) | 第5回の配置・公開・再配置・片付け |
| 補助 | [GitHubへの反映](docs/github.md) | コードの公開・変更反映 |
| 講義 | [スライド案内](slides/README.md) | Google Slides、原稿、確認記録 |
| 確認 | [検証記録](docs/verification.md)／[成果物一覧](docs/deliverables.md) | 実行済みの確認、未実施の範囲、作成ファイル |

## コードの読み方

```text
app/public/index.html     画面の項目と並び（HTML）
app/public/style.css      色・大きさ・余白（CSS）
app/public/app.js         ボタン操作、通信、画面更新（JavaScript）
app/server.js             HTTPの受付、入力・認証の確認（Node.js）
app/lib/validation.js     タスク名と入力項目のルール
app/lib/demo-store.js     練習用JSONファイルへの保存
app/lib/supabase-store.js SupabaseのAPIとの通信
supabase/schema.sql      DBの表と、本人の行だけを許可するルール
tests/                   動作を自動で確かめるコード
```

フロントエンドは人が操作する画面、バックエンドは画面の依頼を受けて処理する部分、DB（データベース）は情報を整理して保存する場所です。画面とバックエンドは1つのNode.jsサーバーから配信します。仕組みを見えるようにするため、React／Next.jsは使いません。Reactという画面用ライブラリや、Reactを土台としたNext.jsというフレームワークを使う場合の流れは、[図解教材](docs/browser-and-frameworks.md)で比較します。

## Supabaseへ接続する

[第3回の演習](docs/exercises/03-database.md)に従い、練習用プロジェクト、テーブル、ユーザーA/Bを作成します。`.env.example` を `.env` にコピーして `APP_MODE=supabase`、自分のURLと **publishableキー** を設定し、再起動します。管理者用の `sb_secret_...`、`service_role`、DBパスワードはアプリに設定しません。

ログイン情報はブラウザのメモリにだけ保持します。再読み込み・期限切れで再ログインが必要です。「ログアウト」はこの画面からトークンを消す処理で、発行済みトークンの即時失効ではありません。自動ログイン継続や一般公開の会員登録は授業の対象外です。

## 動作確認

```sh
npm run check
npm test
```

構文と教材リンク、APIの追加・編集・削除、入力チェック、認証、保存などを確認します。実DBの権限確認は、練習用ユーザー2名を設定して `npm run test:supabase` を実行します。これは実際に確認用の1件を作成し、終了時に削除します。通常の `npm test` は外部サービスを変更しません。

## 授業で扱う範囲

第1・2回はローカルだけで始められます。第3回にSupabase、第5回にGoogle Cloudの請求先・権限・CLIが必要です。デプロイを本編に含めるため、全体で完全無料になる保証はありません。登録に制約がある場合は許可済みの講師環境で操作を分担し、見学だけの項目は未達成として補講で確認します。AIの利用は所属組織の規定と利用枠に従います。

アプリを起動しても、GitHubへのpush、Cloud Runの作成・デプロイ、実Supabaseプロジェクトの作成は自動実行されません。変更を公開する前の内容確認は[GitHub手順](docs/github.md)を使います。ライセンスは既存の [LICENSE](LICENSE) を参照してください。
