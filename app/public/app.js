// 画面の仕事: 入力を読み、APIへ頼み、返ってきた結果を表示します。
const $ = selector => document.querySelector(selector);
let tasks = [];
let filter = 'all';
let token = ''; // メモリだけに保持。再読み込みするとログインし直します。
let mode = 'demo';
let editingId = null;
let busy = false;

function showMessage(text, error = false) {
  $('#message').textContent = text;
  $('#message').classList.toggle('error', error);
}

function showLogin() {
  token = '';
  tasks = [];
  $('#task-list').replaceChildren();
  $('#task-panel').hidden = true;
  $('#login-panel').hidden = false;
  $('#edit-dialog').close();
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(15000)
    });
  } catch { throw new Error('サーバーに接続できません。ターミナルで npm start が動いているか確認してください。結果が不明な場合は、再操作の前に一覧を再読み込みしてください。'); }
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if (response.status === 401 && mode === 'supabase') showLogin();
    throw new Error(data.error || '処理に失敗しました。');
  }
  return data;
}

async function run(action) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try { await action(); }
  catch (error) {
    showMessage(error.message, true);
    if ($('#edit-dialog').open) $('#edit-error').textContent = error.message;
  } finally {
    busy = false;
    document.querySelectorAll('button').forEach(button => { button.disabled = false; });
    document.querySelectorAll('.task-check').forEach(input => { input.disabled = false; });
  }
}

// 第4回: 検索機能はこの関数へ追加します。
function visibleTasks() {
  return tasks.filter(task => filter === 'all' || (filter === 'done' ? task.done : !task.done));
}

function renderTasks() {
  const list = $('#task-list');
  list.replaceChildren();
  const shown = visibleTasks();
  $('#count').textContent = `${tasks.filter(task => !task.done).length}件の未完了 / 全${tasks.length}件`;
  $('#empty').hidden = shown.length > 0;
  $('#empty h3').textContent = tasks.length ? '条件に合うタスクはありません' : '小さな一歩を追加しましょう';
  $('#empty p').textContent = tasks.length ? '表示条件を変えてみましょう。' : 'まずは「教材を開く」から始めてみましょう。';
  for (const task of shown) {
    const row = document.createElement('li');
    row.className = `task-row${task.done ? ' done' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.done;
    checkbox.id = `task-${task.id}`;
    checkbox.disabled = busy;
    const label = document.createElement('label');
    label.className = 'task-label';
    label.htmlFor = checkbox.id;
    label.textContent = task.title; // HTMLとして実行せず、そのまま文字として表示します。
    checkbox.addEventListener('change', () => {
      if (busy) { checkbox.checked = task.done; return; }
      const desired = checkbox.checked;
      run(async () => {
        checkbox.disabled = true;
        try {
          const result = await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ done: desired }) });
          tasks = tasks.map(item => item.id === task.id ? result.task : item);
          renderTasks();
          showMessage(desired ? '完了にしました。' : '未完了に戻しました。');
        } catch (error) { checkbox.checked = task.done; throw error; }
      });
    });
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    const edit = document.createElement('button');
    edit.className = 'text-button';
    edit.textContent = '編集';
    edit.setAttribute('aria-label', `${task.title} を編集`);
    edit.addEventListener('click', () => {
      editingId = task.id;
      $('#edit-title').value = task.title;
      $('#edit-error').textContent = '';
      $('#edit-dialog').showModal();
      $('#edit-title').focus();
    });
    const remove = document.createElement('button');
    remove.className = 'text-button delete';
    remove.textContent = '削除';
    remove.setAttribute('aria-label', `${task.title} を削除`);
    remove.addEventListener('click', () => {
      if (!confirm(`「${task.title}」を削除しますか？ この操作は取り消せません。`)) return;
      run(async () => {
        await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
        tasks = tasks.filter(item => item.id !== task.id);
        renderTasks();
        showMessage('タスクを削除しました。');
      });
    });
    actions.append(edit, remove);
    row.append(checkbox, label, actions);
    list.append(row);
  }
}

async function loadTasks() {
  const data = await api('/api/tasks');
  tasks = data.tasks;
  $('#task-panel').hidden = false;
  $('#login-panel').hidden = true;
  renderTasks();
}

$('#task-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const title = $('#title').value.trim();
    if (!title) throw new Error('タスク名は空白だけにせず入力してください。');
    const result = await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) });
    tasks.unshift(result.task);
    $('#title').value = '';
    renderTasks();
    showMessage('タスクを追加しました。');
    $('#title').focus();
  });
});

$('#edit-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const result = await api(`/api/tasks/${editingId}`, { method: 'PATCH', body: JSON.stringify({ title: $('#edit-title').value }) });
    tasks = tasks.map(task => task.id === editingId ? result.task : task);
    $('#edit-dialog').close();
    renderTasks();
    showMessage('タスク名を変更しました。');
  });
});
$('#cancel-edit').addEventListener('click', () => $('#edit-dialog').close());
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderTasks();
}));
$('#reload').addEventListener('click', () => run(async () => { await loadTasks(); showMessage('一覧を再読み込みしました。'); }));
$('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    try {
      const session = await api('/api/session', { method: 'POST', body: JSON.stringify({ email: $('#email').value, password: $('#password').value }) });
      token = session.access_token;
      await loadTasks();
      showMessage('ログインしました。自分のタスクだけを表示します。');
    } finally { $('#password').value = ''; }
  });
});
$('#logout').addEventListener('click', () => { showLogin(); showMessage('この画面のログイン情報を消去しました。'); });

run(async () => {
  const health = await api('/api/health');
  mode = health.mode;
  $('#mode').textContent = mode === 'demo' ? 'ローカル練習モード' : 'Supabase接続モード';
  $('#storage-note').textContent = mode === 'demo' ? '保存先：このPCのJSONファイル' : '保存先：Supabase。最新200件を表示します。';
  $('#logout').hidden = mode !== 'supabase';
  if (mode === 'supabase') showLogin();
  else await loadTasks();
});
