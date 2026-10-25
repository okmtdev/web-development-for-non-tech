# GitHubへ反映する前に

[教材の入口](../README.md)

Gitは変更履歴の管理、GitHubはそれをオンラインで共有するサービスです。`git commit` は手元の記録、`git push` は外部のリポジトリへ送る操作です。教材を動かすだけならpushは不要です。

## 内容を確認する

教材ルートで実行します。

```sh
git status --short
git diff --check
git diff
npm run check
npm test
```

`git diff` にはまだGitに追加していない新規ファイルは出ません。新規ファイルはエディターで中身を開くか、次のステージ後の差分で確認します。ステージは、次のコミットに含める変更を選ぶ操作です。

```sh
git add README.md .gitignore .env.example .nvmrc package.json app docs supabase tests scripts slides .github Dockerfile .dockerignore .gcloudignore
git diff --cached --stat
git diff --cached
```

含めるもの：教材、架空のサンプルコード、設定例、SQL、テスト、スライド原稿と生成コード。含めないもの：`.env`、実際の保存データ、パスワード、トークン、個人情報、作業中のスクリーンショット。

```sh
git check-ignore .env app/data/tasks.json
```

2つのパスが表示されれば無視設定が効いています。ただし既にGitへ登録済みの秘密ファイルは `.gitignore` だけでは除外されないので、ステージされた差分も確認します。

## 変更を提示してから反映する

変更の目的、追加ファイル、検証結果、未検証範囲、反映先のリポジトリとブランチを確認相手に提示します。この教材の作成作業では、外部へ送る前にその内容を提示します。

例：`curriculum/mytasks-course` のような作業ブランチにコミットし、PR（変更を取り込むための提案）を作ります。手順を実行する前に、リモートが意図した場所か `git remote -v` で確認します。

```sh
git switch -c curriculum/mytasks-course
git commit
git push -u origin curriculum/mytasks-course
```

コミットメッセージをエディターで書き、Codexが作成する場合は末尾に次を1回入れます。

```text
Co-authored-by: Codex <noreply@openai.com>
```

PRには具体的な学習内容、構成、`npm test` / `npm run check` の結果、実Supabase・Cloud Run未検証などを記載。Codexが作成するPR本文には次を1回含めます。

```text
Generated with [Codex](https://openai.com/codex/).
```

CI（変更のたびに自動実行する確認）は `.github/workflows/test.yml` に用意しています。GitHub側でActionsが利用可能な場合、push／PRで実行されます。緑になっても外部DBや本番運用の確認まで済んだという意味ではありません。
