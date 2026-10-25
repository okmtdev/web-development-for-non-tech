# 演習2：通信を観察し、不正な入力を試す

[第2回教材](../lessons/02-api.md) / [API仕様](../api.md)

前提：demoモードで `npm start`。実際のログイン情報がない第2回だけで通信画面の共有を練習します。

## A. Networkで観察（25分）

1. Chrome／Edgeで http://localhost:3000 を開く。
2. メニューの「その他のツール → デベロッパーツール」を開く。WindowsはF12、Macは `Command+Option+I` でも開けます。
3. **Network（ネットワーク）** を選び、Fetch/XHRのフィルターを選択。これは画面が行うデータ通信に絞る操作です。
4. アプリで「通信を調べる」を追加。`tasks` という行を選ぶ。
5. HeadersのRequest MethodがPOST、Status Codeが201、Payloadに `title`、Responseに作成したタスクがあることを確認。
6. 完了、編集、削除を順に操作し、PATCH、PATCH、DELETEと変わることを確認。
7. 「一覧を再読み込み」でGETと200を確認。

| 操作 | 自分が見たメソッド | ステータス | 送った内容／返った内容 |
| --- | --- | --- | --- |
| 追加 |  |  |  |
| 完了 |  |  |  |
| 編集 |  |  |  |
| 削除 |  |  |  |
| 一覧 |  |  |  |

通信が出ない場合：Networkを開いてから操作し直します。行が多ければフィルターに `api/tasks` と入力します。削除成功の204はResponseが空で正常です。

## B. APIへ直接依頼する（25分）

ブラウザの **Console（コンソール）** はJavaScriptを実行して調べる場所です。コードを読み、宛先が自分のPCの `/api/tasks` であることを確認してから入力してください。ブラウザが貼り付けを警告する場合は保護を無効にせず、手入力か講師の実演で進めます。

```js
fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '   ' })
}).then(async response => console.log(response.status, await response.json()));
```

期待する結果：`400` と「1〜80文字」のエラー。失敗した追加は保存されません。

1. `title: '   '` を `title: 'a'.repeat(80)` に変えて実行。201で成功。
2. `81` に変えて実行。400で失敗。
3. `title: 'APIから追加'` に変えて実行。201。
4. 画面の「一覧を再読み込み」を押す。Consoleから作成した2件が表示される。
5. 確認用の2件を画面から削除。

画面がすぐ変わらない理由：Consoleからの通信は、アプリの画面更新処理を通っていないためです。APIへの保存と画面の表示は別の仕事だと確認できます。

## C. コードのつながりを指差す（10分）

`app.js` の `api('/api/tasks'`、`server.js` の `method === 'POST'`、`validation.js` の `80`、`demo-store.js` の `writeFile` をエディター検索で探します。

「入力確認があるのはどこか」「保存するのはどこか」を一緒に説明します。コード全体の暗記は不要です。

## 確認（5分）

正常入力80文字と、境界を越える81文字を両方試すことを、**境界値の確認**と呼びます。確認した結果を[評価表](../assessment.md)に記入してください。
