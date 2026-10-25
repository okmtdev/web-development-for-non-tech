import { AppError } from './errors.js';

// 画面の入力制限だけでは不十分なので、サーバーでも確かめます。
export function validateTask(value, { partial = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(400, 'JSONのオブジェクトで送ってください。');
  }
  const keys = Object.keys(value);
  if (keys.some(key => !['title', 'done'].includes(key)) || keys.length === 0) {
    throw new AppError(400, '送信できる項目は title と done です。');
  }
  if (!partial && !Object.hasOwn(value, 'title')) {
    throw new AppError(400, 'タスク名を入力してください。');
  }
  const result = {};
  if (Object.hasOwn(value, 'title')) {
    if (typeof value.title !== 'string' || value.title.trim().length < 1 || value.title.trim().length > 80) {
      throw new AppError(400, 'タスク名は空白だけにせず、1〜80文字で入力してください。');
    }
    result.title = value.title.trim();
  }
  if (Object.hasOwn(value, 'done')) {
    if (typeof value.done !== 'boolean') throw new AppError(400, 'done は true か false にしてください。');
    result.done = value.done;
  }
  return result;
}

export function validateId(id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new AppError(400, 'タスクのIDが正しくありません。');
  }
  return id;
}
