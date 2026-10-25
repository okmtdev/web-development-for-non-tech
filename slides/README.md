# 講義スライド

全5回・各90分の教材に対応した53枚。詳細手順はMarkdown、講義では図・操作例・確認の問いを使います。

完成版：[非技術者のためのWebアプリ開発教室｜全5回](https://docs.google.com/presentation/d/1gauKSFgcxO7z5cr1ZXpNlo_Q3Ttc7Pj-otsf-U4bfSE/edit)。指定されたファイルを更新し、ブラウザ・実画面・React／Next.js・データ保存の説明を追加しました。共有設定は変更していません。

Google Slides APIでの直接作成は利用者の指定により採用。本文・図形・表・画像上の番号は編集可能なオブジェクトです。実アプリの撮影画像3点を含みます。53枚すべてに講師用ノートを設定し、実際のスライドのプレビューを確認しました。詳細は[スライド確認記録](qa.md)を参照してください。

| 回 | スライド | 内容 |
| --- | --- | --- |
| 1 | 1〜20 | ブラウザ、実画面と3ファイル、React／Next.js比較、保存、起動と画面変更 |
| 2 | 21〜28 | API、JSON、通信観察、入力エラー、切り分け |
| 3 | 29〜36 | 表、認証と認可、RLS、Supabase設定、費用 |
| 4 | 37〜43 | 要件、AIへの依頼、検索、確認、発表と次回の準備 |
| 5 | 44〜53 | 公開後の構成、配信と実行、デプロイ、権限、再配置、片付け |

今回の補足は4枚目（ブラウザ）、10〜12枚目（実画面と表示の流れ）、14〜15枚目（React／Next.js）、16〜19枚目（保存・データ・セッション）です。公開後の構成図は45枚目です。

## 原稿と再利用

- [deck.json](deck.json)：53枚の内容、図・表の構成、講師用補足を含む原稿。
- [speaker-notes.md](speaker-notes.md)：授業中に参照する説明と問い。
- [deployed-architecture.png](deployed-architecture.png)：45枚目の構成図。オフラインでも参照できる画像。
- [browser-files.png](browser-files.png)：10枚目の実画面と3ファイルの対応図。
- [撮影画像](../docs/images/app-before.jpg)：このリポジトリのローカル実行画面。操作前後は `docs/images/task-before.jpg` と `task-after.jpg`。
- [build-requests.mjs](build-requests.mjs)：原稿からGoogle Slides APIのリクエストを生成する補助コード。APIへの送信は行いません。

原稿を変更した後、`node slides/build-requests.mjs` で `.local/slides-build/` にリクエストを生成できます。これは最初の空白デッキに対する作成用です。完成済みのデッキにそのまま再送すると、オブジェクトIDの重複などで失敗します。更新時は対象ページと変更内容を確認してから、差分のリクエストを作成してください。画像のリクエストはローカルの絶対パスを含むため、Drive連携の `image_uris` など対応するアップロード経路で送ります。通常のAPIへパスだけを渡しても読み込めません。

画面比率は16:9、書体はNoto Sans JP。本文と図の短い説明を中心に、詳細な操作は各回のMarkdown演習へつなぎます。
