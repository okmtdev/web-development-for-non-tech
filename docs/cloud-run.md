# 第5回の操作手順：Cloud Runへデプロイする

[第5回教材・全体構成図](lessons/05-deploy.md) / [演習5の確認表](exercises/05-deploy.md) / [構成と費用](architecture.md)

**デプロイは本編の必須実習です。** 第5回90分のうち、配置とURL設定25分、公開と確認20分、再配置と保存確認15分をこの手順で進めます。アカウント・権限・CLIの準備は事前に済ませます。

Cloud Runはアプリのコンテナを動かすGoogle Cloudサービスです。従量課金で無料枠がありますが、請求先登録が必要で、Cloud Build・Artifact Registry・通信などの関連費用が生じる場合があります。全工程が無料で終わることは保証しません。[料金](https://cloud.google.com/run/pricing)、[Node.js公式手順](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)

## 授業前の準備（45〜60分、組織の承認待ちは別）

- ローカルのSupabase版と検索が動き、練習用A/Bの権限確認を終えている。
- 自分または講師が管理する学習用Google Cloudプロジェクト、請求先、公開の許可がある。会社の既存サービス用プロジェクトは使わない。
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)を導入し、ターミナルで `gcloud --version` が表示される。CLIはコマンドでサービスを操作する道具。
- 管理者と[公式の必要権限](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)を確認。実行者の配置・サービスアカウント利用・ログ閲覧権限と、**ビルドに使うサービスアカウント**の `roles/run.builder` を準備。アカウントは環境ごとに確認し、推測した相手へ権限を付けない。
- 通知用の予算を設定し、関連サービスの費用を確認。「通知のみ」の予算は支出を停止する上限ではない。[予算とアラート](https://cloud.google.com/billing/docs/how-to/budgets)

次を1行ずつ実行します。`YOUR_PROJECT_ID` は自分の学習用IDに置き換えます。APIの有効化はクラウドへの変更なので、対象プロジェクトを確認してから進めます。

```sh
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud config get-value project
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

期待する結果：意図したプロジェクトIDが表示され、3つのAPIが有効になる。権限エラーなら講師・管理者へ相談します。

## 1. 配置する内容と設定を確認する

教材ルートで `npm run check`、`npm test` を実行します。`gcloud meta list-files-for-upload` で送信対象を表示し、`.env`、`.local`、`app/data/tasks.json` が含まれないことを確認します。`.gcloudignore` が送信対象を、`.dockerignore` がビルド対象を絞ります。[送信対象の確認方法](https://cloud.google.com/sdk/gcloud/reference/topic/gcloudignore)

対象プロジェクト、サービス名、地域、公開範囲、費用、配置するコードを講師と共有します。以下のサービス名 `mytasks-learning` は例です。共有プロジェクトでは各組で異なる名前に変え、以後すべてのコマンドで同じ名前を使います。**既存サービスを上書きしない新しい名前**を選んでください。

エディターで `.local` フォルダを作成し、その中に `cloud-run-env.yaml` を保存します。`.local` はGit対象外です。

```yaml
APP_MODE: "supabase"
SUPABASE_URL: "https://YOUR_PROJECT.supabase.co"
SUPABASE_PUBLISHABLE_KEY: "sb_publishable_REPLACE_ME"
APP_ORIGIN: "https://example.invalid"
```

URL・publishableキーは自分の値へ変更。APP_ORIGINは、非公開状態でサービスURLを発行するまでの仮値です。後で実URLへ置き換えます。パスワード・secretキーは設定しません。環境変数は実行時の設定で、ブラウザの保存領域ではありません。

## 2. まず非公開で配置する

以下を**1行として**実行します。すべてのコマンドはMac／PowerShellとも同じ1行です。

```sh
gcloud run deploy mytasks-learning --source . --region asia-northeast1 --no-allow-unauthenticated --min-instances 0 --max-instances 1 --cpu 1 --memory 512Mi --timeout 30 --env-vars-file .local/cloud-run-env.yaml
```

ソースをCloud Buildで実行用イメージへ組み立て、Artifact Registryに保存し、Cloud Runで動かします。DockerfileがあるためNode.js 24の設定を使います。ここでの `.` は現在の教材フォルダです。[ソースからの配置](https://cloud.google.com/run/docs/deploying-source-code)

期待する結果：配置が完了し、サービスURLが発行される。最小0・最大1は稼働数を抑える設定で、料金上限ではありません。ビルドには数分以上かかる場合があります。まだ非公開なので、ブラウザでURLを開いて403でもこの段階では正常です。

URLを控え損ねた場合は次で確認できます。

```sh
gcloud run services describe mytasks-learning --region asia-northeast1 --format="value(status.url)"
```

## 3. 発行されたURLを設定する

1. 出力された `https://...run.app` をコピーし、末尾の `/` を除く。
2. `.local/cloud-run-env.yaml` のAPP_ORIGINをそのURLへ変更して保存。**次の再配置でもこのファイルを使うため、必ず更新します。**
3. 下の `YOUR_SERVICE_URL` を同じ実URLへ置き換えて実行。

```sh
gcloud run services update mytasks-learning --region asia-northeast1 --update-env-vars APP_ORIGIN=YOUR_SERVICE_URL
```

期待する結果：新しいリビジョン（配置した版）が稼働。Cloud Runのログで起動を確認します。`APP_MODE=demo` では起動を拒否します。Cloud Runの通常のローカルファイルは終了後に残らないため、DBを使います。[実行環境の仕様](https://cloud.google.com/run/docs/container-contract)

## 4. 学習用ログイン画面を公開して確認する

この時点ではIAM（クラウドのアクセス権管理）で許可された呼び出しだけが使えます。対象URL・公開範囲・費用・A/B確認結果を示し、学習用ログイン画面の公開を確認してから次を実行します。

```sh
gcloud run services add-iam-policy-binding mytasks-learning --region asia-northeast1 --member=allUsers --role=roles/run.invoker
```

これでログイン画面とログインAPIへ誰でもアクセスできます。**タスクの操作には引き続きSupabase認証とRLSが必要**です。この教材はこのIAM設定を使います。組織の制約で許可されなければ、管理者が許可した環境で実習します。[公開アクセスの公式手順](https://cloud.google.com/run/docs/authenticating/public)

[演習5のC](exercises/05-deploy.md)を実施し、HTTPS画面、未ログイン401、AのCRUD・検索、別ブラウザでAのデータが見えること、Bには見えないことを確認します。ローカルのNode.jsを停止しても公開URLが動くことも確かめ、処理がCloud Runへ移ったことを説明します。

## 5. コードを再配置し、DBの保存を確認する

Aの確認用タスクを残し、`app/public/index.html` の見出しを「マイタスク 公開版」に変えます。ローカルで確認後、APP_ORIGINが実URLになっていることを確認し、**同じサービス名**で再配置します。

```sh
gcloud run deploy mytasks-learning --source . --region asia-northeast1 --allow-unauthenticated --min-instances 0 --max-instances 1 --cpu 1 --memory 512Mi --timeout 30 --env-vars-file .local/cloud-run-env.yaml
```

公開URLを再読み込みし、見出しの変更を確認。Aで再ログインして同じタスクが残ることを確認します。DBのスキーマを作り直す必要はありません。公開後も同じSupabaseを使っているため、ローカル版のsupabaseモードで同じアカウントを使うと、同じタスクを読み書きします。

## 6. 片付けと記録

継続利用する場合は、管理担当者・用途・終了日・費用確認日を決めます。終了する場合は、Cloud Consoleで対象プロジェクトとサービス名を確認して削除します。コマンドの場合は以下です。削除対象を確認するプロンプトを読み、`--quiet` は付けません。

```sh
gcloud run services delete mytasks-learning --region asia-northeast1
```

サービス削除後も、Artifact Registryのイメージやビルドの保存先などは残る場合があります。今回作成したものをConsoleで個別に確認して片付けます。Supabaseも別サービスなので、タスク・プロジェクトを残すか別途決めます。共有物や既存のデータは削除しません。

## つまずいたとき

| 現象 | 確認する場所・対処 |
| --- | --- |
| `gcloud` が見つからない | CLIの導入後にターミナルを開き直し、`gcloud --version` |
| ビルド・配置の権限エラー | エラーに出たアカウントを確認。実行者とビルド用アカウントの権限を混同しない |
| 起動しない | Cloud Runのログ。supabaseモード、URL、publishableキー、APP_ORIGINのHTTPS、DockerfileのPORT設定を確認 |
| Google Cloudの403ページ | 非公開段階か、公開範囲のIAM設定が反映されたか |
| アプリのJSONで403 | APP_ORIGINが発行URLと一致するか。末尾 `/`、仮URL、異なるホストを確認 |
| `/api/tasks` が401 | 未ログインなら正常。画面でログインし直す |
| ログイン失敗・DB操作失敗 | Supabaseの稼働、練習ユーザー、キー、SQLとRLS。Networkの秘密をそのまま共有しない |
| 再配置で見た目が変わらない | 正しいフォルダを送ったか、リビジョンが稼働したか、同じURLを再読み込みしたか |
| タスクが空 | 同じSupabaseプロジェクト・同じユーザーか。demoのJSONは自動移行されない |

講師はログにパスワードやトークンが出ていないことも確認します。この手順を資料として作成したことと、実環境へ配置済みであることは別です。実施状況は[検証記録](verification.md)に記載します。
