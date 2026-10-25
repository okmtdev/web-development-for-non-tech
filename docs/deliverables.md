# 成果物一覧

更新日：2026年10月25日。今回の教材として追加するファイルは **60件** です。既存のLICENSEは変更していません。GitHubへの反映対象は以下のファイルです。

全5回×90分、プログラミング未経験の社会人を仮定しています。教材・演習・アプリ・スライドは「マイタスク」を題材に統一しました。第5回にデプロイを組み込み、実画面と3ファイル、ブラウザ、React／Next.js、保存とセッションの教材を追加しました。確認結果と未実施項目は[検証記録](verification.md)を参照してください。

## 入口・実行・公開設定

- [.dockerignore](../.dockerignore)
- [.env.example](../.env.example)
- [.gcloudignore](../.gcloudignore)
- [.github/workflows/test.yml](../.github/workflows/test.yml)
- [.gitignore](../.gitignore)
- [.nvmrc](../.nvmrc)
- [Dockerfile](../Dockerfile)
- [README.md](../README.md)
- [package.json](../package.json)

## サンプルアプリ

- [app/data/.gitkeep](../app/data/.gitkeep)
- [app/lib/demo-store.js](../app/lib/demo-store.js)
- [app/lib/errors.js](../app/lib/errors.js)
- [app/lib/supabase-store.js](../app/lib/supabase-store.js)
- [app/lib/validation.js](../app/lib/validation.js)
- [app/public/app.js](../app/public/app.js)
- [app/public/index.html](../app/public/index.html)
- [app/public/style.css](../app/public/style.css)
- [app/server.js](../app/server.js)

## Markdown教材

- [docs/api.md](../docs/api.md)
- [docs/architecture.md](../docs/architecture.md)
- [docs/assessment.md](../docs/assessment.md)
- [docs/browser-and-frameworks.md](../docs/browser-and-frameworks.md)
- [docs/cloud-run.md](../docs/cloud-run.md)
- [docs/curriculum.md](../docs/curriculum.md)
- [docs/deliverables.md](../docs/deliverables.md)
- [docs/exercises/01-browser-storage.md](../docs/exercises/01-browser-storage.md)
- [docs/exercises/01-first-app.md](../docs/exercises/01-first-app.md)
- [docs/exercises/02-api.md](../docs/exercises/02-api.md)
- [docs/exercises/03-database.md](../docs/exercises/03-database.md)
- [docs/exercises/04-search.md](../docs/exercises/04-search.md)
- [docs/exercises/05-deploy.md](../docs/exercises/05-deploy.md)
- [docs/github.md](../docs/github.md)
- [docs/glossary.md](../docs/glossary.md)
- [docs/instructor.md](../docs/instructor.md)
- [docs/lessons/01-overview.md](../docs/lessons/01-overview.md)
- [docs/lessons/02-api.md](../docs/lessons/02-api.md)
- [docs/lessons/03-database.md](../docs/lessons/03-database.md)
- [docs/lessons/04-improve.md](../docs/lessons/04-improve.md)
- [docs/lessons/05-deploy.md](../docs/lessons/05-deploy.md)
- [docs/roles-and-storage.md](../docs/roles-and-storage.md)
- [docs/setup.md](../docs/setup.md)
- [docs/solutions/01-03.md](../docs/solutions/01-03.md)
- [docs/solutions/04-search.md](../docs/solutions/04-search.md)
- [docs/troubleshooting.md](../docs/troubleshooting.md)
- [docs/verification.md](../docs/verification.md)

## 実画面の画像

- [docs/images/app-before.jpg](../docs/images/app-before.jpg)
- [docs/images/task-before.jpg](../docs/images/task-before.jpg)
- [docs/images/task-after.jpg](../docs/images/task-after.jpg)

## DB・確認用コード

- [scripts/check-supabase.js](../scripts/check-supabase.js)
- [scripts/check.js](../scripts/check.js)
- [supabase/schema.sql](../supabase/schema.sql)
- [tests/app.test.js](../tests/app.test.js)
- [tests/supabase-store.test.js](../tests/supabase-store.test.js)

## Google Slides・原稿

- [slides/README.md](../slides/README.md)
- [slides/build-requests.mjs](../slides/build-requests.mjs)
- [slides/browser-files.png](../slides/browser-files.png)
- [slides/deck.json](../slides/deck.json)
- [slides/deployed-architecture.png](../slides/deployed-architecture.png)
- [slides/qa.md](../slides/qa.md)
- [slides/speaker-notes.md](../slides/speaker-notes.md)

## 作業用ファイル

`.local/` にはスライドのプレビュー、API確認結果、検索演習の検証用コピーなどを保存しています。Git対象外で、配布物の件数に含めていません。`.env` と生成されたタスクデータもGit対象外です。
