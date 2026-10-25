# 第4回の実装例

[演習4](../exercises/04-search.md)

この例は初期サンプルの `visibleTasks()` を使います。すでにAIが別の方法で変更した場合は、両方を重ねて追加せず、どちらか一方に揃えます。

## 1. 検索欄を追加

`app/public/index.html` の `<!-- 第4回の検索欄は、この位置に追加します。 -->` の直後に追加します。

```html
<label for="search">タスク名で検索</label>
<input id="search" type="search" placeholder="例：API" autocomplete="off">
```

期待する結果：表示の切り替えボタンの下に、ラベルと検索欄が出ます。ラベルの `for` と入力欄の `id` を揃えると、ラベルを押しても入力欄へ移れます。

## 2. 表示条件を追加

`app/public/app.js` の既存の `visibleTasks()` 関数を次に置き換えます。

```js
function visibleTasks() {
  const query = $('#search').value.trim().toLowerCase();
  return tasks.filter(task => {
    const matchesState = filter === 'all' || (filter === 'done' ? task.done : !task.done);
    const matchesQuery = task.title.toLowerCase().includes(query);
    return matchesState && matchesQuery;
  });
}
```

`trim()` は前後の空白を除き、`toLowerCase()` は英字を小文字にし、`includes()` は文字が含まれるかを確認します。`&&` は両方の条件を満たすという意味です。空文字はすべての文字列に含まれるため、空欄では状態フィルターだけが残ります。

## 3. 入力時に一覧を描き直す

`app.js` の最後に、次の1行を追加します。

```js
$('#search').addEventListener('input', renderTasks);
```

`input` は入力が変わったときの出来事（イベント）です。既存の `renderTasks` を使うので、追加や編集の後にも同じ検索条件で表示されます。サーバーやDBの変更は不要です。

保存後に再読み込みし、[演習の確認表](../exercises/04-search.md)をすべて実行してください。検索欄の値は保存しないため、再読み込みで空に戻ります。
