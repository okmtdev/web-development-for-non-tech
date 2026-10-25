# 講義スライド原稿・講師ノート

元データは `deck.json`。教材と同じ順序の53枚です。

## 1. 小さなWebアプリを つくって、理解する

非技術者のためのアプリ開発教室

マイタスクを改善し、URLで動かして説明する

講師ノート：全5回450分。初回事前準備30〜45分、第5回前クラウド準備45〜60分は別枠。第5回で実デプロイと全体構成を学ぶ。docs/curriculum.md。

## 2. 5回の最後に、説明できること

仕組み：画面・処理・保存と
ブラウザ内の保存

改善：AIへ依頼し、
差分と動作を確認

公開：URLで動かし、
構成と保存先を説明

完成の基準は、自分のアプリで説明し、操作できること

講師ノート：docs/curriculum.md。受講者の目的を聞く。成果は機能、説明、確認記録の3つで評価する。

## 3. 完成形は、自分だけの「マイタスク」

追加・編集：タスク名を1〜80文字で保存

完了・削除：状態を変え、不要なものを消す

検索を追加：第4回で名前の一部から探す

講師ノート：実アプリを実演。基本版には追加・一覧・編集・完了・削除・状態フィルターが実装済み。検索は第4回の演習。個人情報を使わず『教材を開く』など架空の内容を使う。

## 4. ブラウザは、Webアプリを動かす入口

身近なアプリ：Chrome・Edge・Safariなど
URLへ内容を要求する
検索サービスも中で開く

表示・実行・保存：HTMLとCSSで画面を描く
JavaScriptを動かし通信する
端末内にデータも持てる

この授業では、localhost:3000で自分のPCのサーバーへ接続

講師ノート：導入・ブラウザ5分。ブラウザはWebを表示・操作するアプリ。Googleなどの検索サービスと区別する。表示だけでなくJSの実行、通信、保存ができる。任意のPCファイルやサーバーDBを自由に操作できるわけではない。docs/browser-and-frameworks.md。https://developer.mozilla.org/en-US/docs/Glossary/Browser

## 5. アプリの仕事を3つに分ける

画面：フロントエンド
入力と表示

処理：バックエンド
確認と依頼

保存：DB
記録と取り出し

「教材を開く」を入力したら、どこを通る？

講師ノート：第1回の役割10分。フロントも計算・保存ができる。ブラウザは利用者の端末、サーバーは共通ルールの確認、DBは共有するデータの正本を担当。この後の比較スライドとdocs/roles-and-storage.mdで補足。第1・2回はJSONファイル、第3回からSupabase。矢印は依頼で、結果は逆向き。

## 6. 登録なしで始め、あとでDBにつなぐ

第1・2回：ブラウザ + Node.js
保存先はこのPCのファイル
外部サービスへの登録は不要

第3回以降：画面とサーバーは同じ
保存先をSupabaseへ変更
ログインと権限を追加

第5回はCloud Runへ配置し、URLで動作を確認する

講師ノート：docs/architecture.md。Node.jsはJavaScriptをブラウザ以外で実行する環境。クラウド登録を初回から必須にしない。JSONはDBそのものではない。ローカルデータはDBへ自動移行しない。

## 7. フロントでできること

操作と計算：入力しやすくする
読み込んだタスクを検索
結果に合わせて表示を更新

端末内の保存：表示設定や下書きを保存
他の端末との同期は別途
権限は画面の値だけで決めない

このアプリ：検索はブラウザ内、タスクの正本はサーバー側

講師ノート：docs/roles-and-storage.md。画面は表示専用ではなく計算も保存もできる。今回の検索は読み込み済み200件まで。localStorageを実装しているわけではない。

## 8. バックエンドでできること

共通ルールの確認：入力を検証する
本人を確かめる
外部サービスへ依頼する

このアプリのNode.js：画面用ファイルを配信
Supabase Authへ本人確認
本人のトークンでDB操作

画面を経由しないAPI要求にも、同じルールを適用する

講師ノート：一般には秘密を使う外部API連携もバックエンドの仕事。この教材はpublishableキーを使い管理者キーは使わない。サーバーのメモリやCloud Runのローカルファイルは永続保存先としない。docs/roles-and-storage.md。

## 9. DBでできること

保存と検索：端末をまたいでデータを保存
条件で検索・集計
複数更新を一括で確定

PostgreSQLの担当：タスクを行として保存
列の制約で不正な値を拒否
RLSで本人の行だけ許可

Supabase Authは本人確認のサービス。DBとは担当が違う

講師ノート：DBの一般機能とこの実装を分ける。検索演習はブラウザ内でありDB検索の追加はしない。RLSは適切な設定が必要。複数更新の一括確定はトランザクションというが今回は実装しない。docs/roles-and-storage.md。

## 10. 実画面で、3ファイルを読み分ける

1  HTML：項目と文字：見出し・入力欄・ボタン
index.html の h1 / form

2  CSS：色と余白：緑のボタン・角丸・配置
style.css の .primary / .panel

3  JavaScript：動き：行を作り、操作・通信・更新
app.js の renderTasks()

Web画面は実写、ブラウザ枠は説明用

講師ノート：docs/browser-and-frameworks.mdの2。画面の1はh1、2は追加ボタン、3はタスクのチェック欄。1つのボタンにもHTML・CSS・JSが協力する。見える文字がすべてHTMLに書かれているわけではなく、タスク行や件数はJSが追加・更新する。写真は本リポジトリをローカルで動かして撮影。React／Next.js未使用。 画面の範囲が分かるよう、タブとアドレスバー（localhost:3000）を持つブラウザ枠を図形で追加。Web画面自体は実写、ブラウザ枠は説明用の模式図。

## 11. チェックを押すと、どこが動く？

JavaScriptが保存を依頼 → 結果を画面へ。CSSが取り消し線を付ける

講師ノート：実アプリで架空タスクを2件追加し、教材を開くを完了にした前後の画像。チェック、未完了件数、取り消し線を指す。app.jsのchange→PATCH→tasks更新→renderTasks、CSSの.done .task-label。チェック自体の標準操作はブラウザが担当し、アプリの保存・再描画をJSが担当する。失敗するとチェックを戻してエラーを表示。第2回で通信を観察する。docs/browser-and-frameworks.md。

## 12. ファイルから、操作できる画面へ

受け取る：Node.jsが返す
HTML・CSS・JS

組み立てる：HTMLからDOM
CSSで見た目を指定

動かす：JSで通信・DOM更新
ブラウザが描き直す

DOM＝ブラウザが扱う要素の構造。このサンプルはReact未使用

講師ノート：docs/browser-and-frameworks.mdの3。HTMLのlinkとscriptがCSSとJSの場所を伝える。初期HTMLは枠と空の一覧、app.jsがAPIからデータを読みrenderTasksで行を作る。実際は読み込み・処理に並行部分がある。https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_browsers_load_websites

## 13. 演習1：動かして、見出しと色を変える

npm start で起動し、localhost:3000 を開く

3件を追加し、編集・完了・削除を試す

h1の文字とCSSの --accent を変更する

期待する結果：見た目は変わり、タスクは残る

講師ノート：第1回の起動・基本操作15分、実画面と3ファイル・画面変更20分。React／Next.js比較は続く2枚で5分。node --versionはv24.x、npm install不要。docs/exercises/01-first-app.md。

## 14. Reactなら、部品から画面を作る

開発者：JSXという記法で
画面の部品を書く

ビルド：配信するために
JavaScriptへ変換

ブラウザ：ReactがDOMを更新
CSSと合わせて描画

React＝画面用のライブラリ。図は主にブラウザ側で描画する例

講師ノート：React／Next.js比較5分の前半。コンポーネントは画面の部品。JSXはHTMLに似たJSの拡張記法で、ブラウザはそのまま実行しない。JSXをJSに変換することとHTMLを生成することは別。配信物にはHTML/CSS/JSがある。Reactを使う場合もサーバーでHTMLを作れる。比較のみで本サンプルへの追加実装はしない。https://react.dev/learn/writing-markup-with-jsx https://react.dev/learn/render-and-commit

## 15. Next.jsでは、サーバーも画面を作る

サーバー：Reactの部品から
初期HTMLを準備

配信：HTML・CSS・JS
画面用データも送る

ブラウザ：HTMLを表示し
JSで操作を有効に

Next.js＝Reactを土台にした開発の仕組み。App Routerの初回表示の概要

講師ノート：React／Next.js比較5分の後半。サーバーで初期HTMLを準備する時期はビルド時・要求時など。操作処理の結び付けはハイドレーション。Server Componentはサーバーで動き、Client Componentはブラウザで操作を扱えるが初期HTML作成ではサーバーでも処理される。画面用データにはRSC Payloadを含む。詳細実装は対象外。本サンプルのCloud Runは引き続き既存Node.jsを動かす。https://nextjs.org/docs/app/getting-started/server-and-client-components

## 16. ブラウザにある保存領域

メモリ：通常は再読み込みで初期化：画面の状態

sessionStorage：同じタブ・同じオリジン：入力途中の値

localStorage：同じブラウザ・オリジン：表示設定

IndexedDB：構造を持つデータを保存：オフライン用データ

Cookie：条件に合う通信に付く：ログイン状態の識別

永続保存も削除される場合がある。別端末への同期は自動ではない

講師ノート：オリジンは通信方式・ホスト名・ポートの組。メモリはページ実行中。sessionStorageは通常タブを閉じるまで。localStorageは通常閉じても残るが削除やブラウザ設定に依存。Cookieは送信先ルールが異なりHttpOnlyでJSから読めなくできる。今回の認証はメモリのトークンでCookie未使用。https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies

## 17. このアプリの「データ」はどこにある？

タスク名・完了状態：表示用コピー：メモリ：ファイル → 第3回はDB

選んだ表示条件：メモリ：保存しない

第4回の検索文字：メモリ：保存しない

ログイントークン：メモリ：タスクDBとは別

実験のcourseNote：local／sessionStorage：サーバーへ送らない

再読み込みで画面のコピーを失っても、保存済みタスクは読み直せる

講師ノート：docs/roles-and-storage.md。データは文字・数字・true/falseなどアプリが扱う値。コピーと正本を区別。トークンはSupabase Authが発行しタスクの表へ保存するものではない。ブラウザは配信ファイルのキャッシュも持つがタスク正本として使わない。localStorage等は本体では未使用、演習のみ。

## 18. セッションとsessionStorageは別の意味

ログインの状態：本人として継続して扱う
状態や期間をセッションと呼ぶ
証明の持ち方は設計次第

タブ内の保存機能：sessionStorageは値の置き場
保存しただけではログイン不可
このアプリの認証では未使用

このアプリはトークンをメモリに保持。再読み込み後は再ログイン

講師ノート：docs/browser-and-frameworks.mdの6。ログイン状態の識別にCookieを使う方式やトークンを送る方式がある。sessionStorageは認証機構ではない。サンプルはメモリのtoken変数からAuthorizationヘッダーへ入れる。ログアウトは画面のトークン消去で即時失効ではない。DBのタスクは再ログイン後に読める。https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies

## 19. 演習：保存場所による違いを比べる

メモリ・sessionStorage・localStorageにメモを置く

再読み込みし、新しいタブでも読み取る

タスクの保存先と比べ、実験用メモを削除する

期待する結果：メモリは消え、保存領域ごとの違いが見える

講師ノート：第1回のブラウザ保存15分。通常ウィンドウのlocalhost:3000で実験。コードは読んで手入力。courseNoteだけ削除しclearは使わない。タブの複製はsessionStorageがコピーされる場合があるためURLを手入力。docs/roles-and-storage.md。

## 20. 画面を閉じても、データは残る？

試す：ブラウザを再読み込み
サーバーを停止・再起動
同じタスクが残るか確認

説明する：保存先は tasks.json
画面は保存結果を読む
3つの役割を1文ずつ話す

第1回の到達点：起動・画面変更・保存先の説明

講師ノート：サーバー保存10分、ブラウザ保存15分、振り返り10分。docs/exercises/01-browser-storage.mdも実施。tasks.jsonのタスクとブラウザのcourseNoteを区別して説明する。

## 21. ボタンの向こうで 何が起きている？

第2回　通信と入力チェック

画面から送った依頼と、サーバーの返事を見る

講師ノート：第2回90分。復習10、HTTP/API/JSON15、通信観察25、入力実験25、コード追跡10、確認5。前提はdemoモードで起動できること。

## 22. APIは、決まった方法で頼む窓口

一覧を読む：GET：200

追加する：POST：201

編集・完了にする：PATCH：200

削除する：DELETE：204

HTTPは通信のルール。メソッドは依頼の種類

講師ノート：APIはプログラム間の窓口。URLは一覧・追加が/api/tasks、更新・削除は/api/tasks/ID。IDはタスクを区別する値。204は本文なしの成功。docs/api.md。

## 23. JSONで「何を保存するか」を伝える

JSON：項目名と値を組にする書式。右側は一部を省略

講師ノート：実際の応答はidとcreated_atも含む。文字列は二重引用符。falseは真偽値で、"false"という文字列とは違う。コードは例示で、Consoleへそのまま貼るものではない。

## 24. 通信を観察する場所はNetwork

開発者ツールでNetworkを開く

タスクを追加し、tasksの通信を選ぶ

Method・Status・Payload・Responseを読む

POST、201、送ったtitle、返ったtaskが見えれば成功

講師ノート：通信観察25分。Chrome/Edgeの開発者ツールを実演。Networkを開いてから操作する。Fetch/XHRで絞る。Supabase版のログイン通信には秘密が含まれるので、そのまま共有しない。

## 25. 入力の境界を、両側から試す

空白だけ：400
保存しない

80文字：201
保存する

81文字：400
保存しない

画面から送れない入力も、APIには直接届く

講師ノート：バリデーションは入力ルールの確認。JavaScriptのUTF-16単位で80文字。絵文字などでは見た目の文字数と異なる。演習は'a'.repeat(80)などで比較。docs/exercises/02-api.md。

## 26. 入力を確かめるのは、サーバーでも

画面：入力しやすくする
maxlength=80

サーバー：依頼を確認する
validateTask()

保存先：記録を残す
DBにも制約

画面の制限だけでは、APIへの直接の依頼を防げない

講師ノート：app/public/index.html、app/lib/validation.js、supabase/schema.sqlを対応させる。画面の確認は利便性、サーバーとDBの確認はルールの維持。

## 27. 演習2：400と201を自分で確かめる

Consoleから空白だけのtitleをPOSTする

80文字と81文字を送り、番号を記録する

一覧を再読み込みし、保存結果を確かめる

期待する結果：不正入力は保存されず、80文字は残る

講師ノート：入力実験25分、コード追跡10分。Consoleのコードを読んでから実行。貼り付け保護を無効化せず手入力または講師実演。APIから追加しただけでは画面は更新されないことを説明。

## 28. 失敗したら、まず3つを記録する

操作：どこで、何を押し、何を入力したか

期待：本当はどうなってほしかったか

実際：表示・番号・メッセージは何だったか

第2回の到達点：通信の結果を根拠に説明する

講師ノート：確認5分。400番台は入力・権限、500番台は処理や外部通信などの手がかり。ただし番号だけで決めつけない。次回までにSupabaseアカウントを用意。

## 29. 保存先をDBへ。 自分のデータを守る

第3回　Supabaseとログイン

ログインした人だけが、自分のタスクを扱えるようにする

講師ノート：第3回90分。復習10、表・認証15、設定25、接続とA/B確認25、障害切り分け10、振り返り5。Supabaseアカウントとネット接続が前提。

## 30. DBでは、1つのタスクを1行で保存

id：タスクの識別：自動生成

user_id：持ち主の識別：利用者AのID

title：タスク名：教材を開く

done：完了したか：false

created_at：作成日時：自動記録

テーブルは表、行は1件、列は項目。SQLで構造を作る

講師ノート：supabase/schema.sqlの5列と一致。DBはPostgreSQL。UUIDは重複しにくい識別子。SQLはDBへ構造や操作を伝える言語。

## 31. 「誰か」と「何をしてよいか」を分ける

認証：あなたは誰？
メールとパスワードで確認
ログインの仕組み

認可：どのデータを扱える？
本人のタスクだけ許可
DBのRLSで確認

ログイン成功だけでは、データ保護の確認は終わらない

講師ノート：RLSはRow Level Security、行ごとにアクセス条件を確かめる仕組み。画面で非表示にするだけでは保護にならない。https://supabase.com/docs/guides/database/postgres/row-level-security

## 32. 本人のトークンを、DBまで渡す

画面：ログインの証明
トークンを送る

Node.js：本人を確認し
依頼を渡す

Supabase：RLSで
持ち主を確認

auth.uid() = user_id　なら、その行を許可する

講師ノート：トークンはログインを証明する文字列。本人確認はSupabase Authへ依頼。APIキーはアプリを、トークンは利用者を識別。ブラウザのメモリにだけ保持し、再読込・期限切れで再ログイン。https://supabase.com/docs/guides/getting-started/api-keys

## 33. 演習3：学習用のDBへ接続する

Freeプロジェクトでschema.sqlを一度実行

確認済みの練習ユーザーAとBを作る

.envを設定し、再起動してAでログイン

期待する結果：Supabase接続モードで追加・保存できる

講師ノート：新規の学習用DBのみ。既存の実データへSQLを流さない。APP_MODE=supabase、URL、publishableキーを設定。アカウント作成は事前。ローカルデータは自動移行しないので空の一覧で正常。

## 34. アプリ用キーと、利用者の秘密を区別

この教材で使う：publishableキー
アプリを識別する値
本人のトークン + RLSも必要

共有しないもの：パスワード・トークン
.envファイルの内容
secret／service_roleキー

管理者キーは設定しない。AIやGitHubへ秘密を渡さない

講師ノート：publishableキー自体は秘密ではないが、教材では設定を.envにまとめてGitから除外する。secretとservice_roleはRLSを回避するため使わない。ブラウザNetworkの認証情報にも注意。https://supabase.com/docs/guides/getting-started/api-keys

## 35. Aのタスクを、Bは扱えないか？

利用者A：Aのタスクを追加
再ログインしても残る
自分の行を編集・削除できる

利用者B：Aのタスクが見えない
Aの行を更新できない
Aの行を削除できない

画面で確認し、講師は test:supabase でAPIからも確認

講師ノート：A/B確認15分。npm run test:supabaseは実DBに1件作成して削除する任意テスト。見えないだけでなく更新・削除も確認。Table Editorは管理者なので両方が見える。実DB未接続なら未確認と記録。

## 36. 無料で始める範囲を決める

第1〜4回：手元のNode.jsで実行
SupabaseはFreeプラン
授業前に一時停止を確認

第5回の準備：Cloud Runは従量課金
請求先と関連費用を確認
無料枠は料金上限ではない

2026年10月25日確認。料金・制限は授業前に再確認

講師ノート：Supabase Freeは月額$0、500MB DB、月間アクティブユーザー50,000、2アクティブプロジェクト、1週間非アクティブで一時停止。https://supabase.com/pricing 。Cloud Run無料枠は請求先単位、関連サービス別料金あり。https://cloud.google.com/run/pricing 。通知のみの予算アラートは停止上限ではない。https://cloud.google.com/billing/docs/how-to/budgets 。詳しくはdocs/architecture.md。

## 37. AIと小さく改善し、 動いた根拠を示す

第4回　検索機能と確認

目的を決める。変更を読む。期待と結果を比べる

講師ノート：第4回90分。要件10、AIへの依頼10、検索実装25、確認修正20、発表15、デプロイ準備確認10。demoまたはsupabaseで実施可能。

## 38. 検索の「できた」を先に決める

部分一致：APIと入力したら
名前に含むものだけ

空欄で戻す：検索を消したら
元の一覧へ

条件の組合せ：未完了と検索を
同時に使える

英字の大小を区別せず、前後の空白を除く

講師ノート：要件はしてほしいこと。受け入れ条件は完成の判断基準。検索対象は読み込み済みのタスク、Supabaseは最新200件。大量データ全件検索は範囲外。

## 39. AIへ渡すのは、目的と具体的な条件

目的：タスク名の一部で検索したい

範囲：index.html と app.js。新しいAPIは不要

確認：空欄・大小文字・状態との組合せを試す

「まず変更案と理由を示して」と頼む

講師ノート：docs/lessons/04-improve.mdにコピーできるプロンプト。新ライブラリ・DB列・APIを増やさずvisibleTasksを拡張。必要なコードだけ渡し、.env・トークンなどは渡さない。AIが使えなければ実装例で進める。

## 40. 検索の変更は、画面の中で完結する

入力欄：検索する文字を
受け取る

判定：状態と名前の
両方を確かめる

一覧：合うタスクだけ
描き直す

visibleTasks() を変更し、inputイベントで再描画

講師ノート：実装25分。docs/exercises/04-search.md、解答はdocs/solutions/04-search.md。既存関数を置換し、重複定義しない。trim、toLowerCase、includes、&&を平易に説明。

## 41. 成功例と失敗例を、両方確かめる

空欄・すべて：4件

API ／ api ／ 前後の空白：2件

API・未完了：1件

存在しない文字：0件＋説明

追加・編集・完了・削除：従来どおり動く

確認用4件は演習4に記載。実際の結果も記録する

講師ノート：確認修正20分。HTMLを読む、APIを試す、APIを説明する（完了）、DBを確認するの4件。既存機能の回帰確認を含める。検索値と状態は再読込で初期化、タスクは残る。

## 42. 2分のデモで、変更を説明する

30秒：誰の、どんな
困りごとか

60秒：基本操作と
検索のデモ

30秒：変えた場所と
確認・未確認

発表を聞く人は「次に試すとよいこと」を1つ伝える

講師ノート：発表枠15分。人数が多い場合は3人組で2分ずつ発表、全体共有は代表者。docs/assessment.mdで機能と説明を別々に評価。AIの提案で採用しなかったものも理由があれば共有。

## 43. 第5回に公開する内容を確認する

差分：何を変え、どこへ送るかを説明する

情報：.env・実データ・トークンを含めない

結果：動作確認、未検証、費用と権限を示す

GitHubへの反映と、Cloud Runでの公開は別の操作

講師ノート：第4回最後の10分。docs/cloud-run.mdの事前準備を案内。クラウド準備45〜60分は授業外。第5回に配置・公開・再配置を行う。GitHubへのpushはコード共有で、この教材では自動デプロイされない。新規ファイルも内容確認する。

## 44. URLで動かし、 全体の構成を確かめる

第5回　デプロイと全体構成

Cloud Runへ配置し、別ブラウザと再配置で確認する

講師ノート：90分。構成10、公開内容10、配置URL25、公開確認20、再配置保存15、発表片付け10。事前準備45〜60分＋承認待ちは別枠。docs/lessons/05-deploy.md、docs/exercises/05-deploy.md。

## 45. 公開後のアプリの構成

ブラウザ：画面のJSを実行
表示データはメモリ

Cloud Run：Node.jsで配信
API・入力確認

Supabase：Authで本人確認
DB API・DB・RLS

HTTPSで依頼し、結果を返す。タスクの正本はPostgreSQL

講師ノート：docs/lessons/05-deploy.mdの詳細図。画面とAPIは同じCloud Run URL。ブラウザからSupabaseへは直接接続せずNode.jsがAuthとDB APIを呼ぶ。DB APIはPostgreSQLの窓口。矢印は依頼の方向、HTML/CSS/JSとJSONは逆方向に返る。ブラウザにはlocalStorageなどもあるが本体では未使用。

## 46. 配信する場所と、実行する場所

Cloud Runが配る：HTML・CSS・画面用JS
ブラウザの要求に返す
サーバー用JSはNode.jsで実行

ブラウザが動かす：受け取った画面用JS
入力・検索・表示更新
必要なデータをAPIへ依頼

同じJavaScriptでも、画面用とサーバー用で実行場所が違う

講師ノート：app/public/app.jsはブラウザ、app/server.jsはCloud RunのNode.js。ソースの保管場所とプログラムの実行場所を区別。ブラウザのストレージは端末ごと・オリジンごと。localhostの保存値は公開URLへ自動移行しない。

## 47. コードをCloud Runへ配置する流れ

Cloud Build：手元のコードを
イメージにする

Registry：実行用イメージ
を保管する

Cloud Run：イメージを動かし
URLで受け付ける

gcloud run deploy --source .　／　GitHubへのpushは別操作

講師ノート：RegistryはArtifact Registry。このサンプルはDockerfileを使う。関連サービスに別料金が生じる場合がある。git pushによる自動デプロイは未設定。https://cloud.google.com/run/docs/deploying-source-code

## 48. 演習5：配置して、URLを設定する

送信するコード・プロジェクト・費用を確認する

非公開で配置し、発行URLをAPP_ORIGINに設定

公開範囲を確認し、学習用ログイン画面を公開

期待する結果：HTTPSのURLでSupabaseモードが開く

講師ノート：配置URL25分、公開確認20分。先にCLI・請求先・権限・API有効化を済ませる。APP_ORIGINは実URLへ置換し、env yamlも更新する。公開前のGoogle Cloud 403は正常。秘密を含む.envや実データは送信しない。

## 49. 画面の公開と、データの権限

Cloud Runの入口：ログイン画面を公開する
URLにアクセスできる
IAMで呼び出し権限を設定

タスクを扱う権限：Supabaseでログイン
APIが本人を確認
DBのRLSで行を保護

未ログインの /api/tasks は401。公開後にもA/Bで確認

講師ノート：この手順はallUsersへroles/run.invokerを付ける。画面とログインAPIが外部アクセス可能になる。タスクAPIはトークン必須。組織の制約があれば許可された講師環境を使い、見学だけなら未達成。https://cloud.google.com/run/docs/authenticating/public

## 50. 公開URLで確かめること

未ログイン：/api/tasks は401。ログイン後は操作できる

利用者AとB：AのタスクをBは見られない・変えられない

別ブラウザ：同じAでログインすると、同じタスクが見える

ローカルサーバーを止めても、公開URLは動く

講師ノート：docs/exercises/05-deploy.mdのC。画面のA/B確認に加え、第3回で実DBへの更新・削除拒否も検証する。別ブラウザはAのデータ共有を確認するためでパスワード共有の実習ではない。検索・編集・完了・削除キャンセルも確認。

## 51. 再配置しても、DBのタスクは残る

コードを更新：見出しを「公開版」に変更
同じサービスへ再配置
公開URLで見出しを確認

保存先を確認：同じSupabaseを使う
再ログインしてタスクを確認
DBを作り直す操作は不要

Cloud Runの通常のローカルファイルは、終了後に残らない

講師ノート：再配置保存15分。env yamlのAPP_ORIGINが実URLか確認。Cloud Runのファイルシステムはインスタンス終了時に失われるのでdemoを使わない。DB削除やschema変更は行わない。https://cloud.google.com/run/docs/container-contract

## 52. 構成の説明と、学習環境の片付け

説明：画面のJS・サーバーのJS・保存先を指す

記録：公開URL、確認結果、未達成項目を残す

片付け：サービス・イメージ・DBの扱いを決める

残す場合は期限と管理者、消す場合は対象を確認する

講師ノート：発表片付け10分。ペアで2分ずつ構成説明。Cloud Run削除だけでイメージ等が消えるわけではない。docs/cloud-run.mdの6、docs/assessment.md。課金や本番運用の責任を記録する。

## 53. URLで動かし、 仕組みを説明できる

ブラウザ・サーバー・DBの役割
保存先と、変更を反映する手順

公開URL・確認結果・片付けの予定を記録しよう

講師ノート：全5回のまとめ。docs/assessment.md。公開URL、401、A/B、別ブラウザ、再配置後の保存を確認。未実施は未達成と記録し補講へ。継続的な本番運用は授業とは別に設計する。
