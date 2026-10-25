# 演習1補助：ブラウザにも保存できる（15分）

[第1回](../lessons/01-overview.md) / [保存領域の比較](../roles-and-storage.md)

前提：demoで `npm start` し、通常ウィンドウの `http://localhost:3000` を開く。仕事のデータ・パスワードは使いません。アプリのコードは変更しません。

## 1. 保存先を3つに分ける（5分）

1. Chrome／Edgeで画面を右クリックし「検証」、開発者ツールのConsoleを開く。
2. 以下の意味を読んでから1行ずつ手入力する。貼り付け保護の解除は不要です。

```js
window.courseMemory = '一時メモ';
sessionStorage.setItem('courseNote', 'このタブのメモ');
localStorage.setItem('courseNote', 'このブラウザのメモ');
```

`setItem` は名前と値を保存する操作です。保存直後の表示が `undefined` でも失敗ではありません。次の読み取りで確認します。

```js
window.courseMemory
sessionStorage.getItem('courseNote')
localStorage.getItem('courseNote')
```

期待する結果：順に「一時メモ」「このタブのメモ」「このブラウザのメモ」。ApplicationタブのStorageから保存値を見ても構いません。

## 2. 再読み込みと新しいタブで比べる（5分）

ページを再読み込みし、読み取りの3行をもう一度実行します。次に、タブの複製ではなく、新しいタブへ同じURLをアドレス欄から入力して読み取ります。

| 操作 | メモリ | sessionStorage | localStorage |
| --- | --- | --- | --- |
| 同じタブを再読み込み | `undefined` | このタブのメモ | このブラウザのメモ |
| 新しいタブで同じURLを手入力 | `undefined` | `null` | このブラウザのメモ |

タブの複製や開き方によってsessionStorageが初期コピーされる場合があります。ここでは手入力で新規に開きます。`null` は該当する保存値がないという意味です。

## 3. タスクの保存と分けて説明する（5分）

1. 元のタブのConsoleで `localStorage.setItem('courseNote', '自分で変更できる')` を実行して読み直す。
2. この値を変えてもタスク一覧が変わらないこと、`app/data/tasks.json` にこの文字がないことを確認。
3. 「ブラウザの値は利用者が変更できる。権限の証明には使えない」と説明する。
4. 元のタブで次を実行して片付ける。`clear()`で他のデータまで消さず、この演習の項目だけ削除する。

```js
delete window.courseMemory;
sessionStorage.removeItem('courseNote');
localStorage.removeItem('courseNote');
```

つまずいたら：URLが `localhost` と `127.0.0.1` で混ざっていないか、ポートが同じか、ブラウザが保存を禁止していないかを確認。タスクはブラウザのlocalStorageではなく、Node.js経由でJSONファイルに保存しています。

提出：「再読み込みで消えたもの」「残ったもの」「別端末との共有に足りない仕組み」を各1文で記録します。
