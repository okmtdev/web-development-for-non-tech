import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { AppError } from './errors.js';

// 第1・2回の保存先。DBそのものではなく、1台のPCで練習するためのJSONファイルです。
// 同時に届いた書き込みは順番に処理します。複数プロセスでの利用は対象外です。
export function createDemoStore(file) {
  let queue = Promise.resolve();
  async function read() {
    try {
      const tasks = JSON.parse(await readFile(file, 'utf8'));
      if (!Array.isArray(tasks)) throw new Error('Invalid demo data');
      return tasks;
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error; // 壊れたファイルを空データで上書きしません。
    }
  }
  async function change(action) {
    const pending = queue.then(async () => {
      const tasks = await read();
      const result = action(tasks);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(`${file}.tmp`, JSON.stringify(tasks, null, 2), { mode: 0o600 });
      await rename(`${file}.tmp`, file);
      return result;
    });
    queue = pending.catch(() => {});
    return pending;
  }
  return {
    async list() { await queue; return read(); },
    create(input) {
      return change(tasks => {
        if (tasks.length >= 200) throw new AppError(409, '練習用の上限は200件です。不要なタスクを削除してください。');
        const task = { id: randomUUID(), title: input.title, done: input.done ?? false, created_at: new Date().toISOString() };
        tasks.unshift(task);
        return task;
      });
    },
    update(id, input) {
      return change(tasks => {
        const task = tasks.find(task => task.id === id);
        if (!task) throw new AppError(404, 'タスクが見つかりません。再読み込みしてください。');
        Object.assign(task, input);
        return task;
      });
    },
    remove(id) {
      return change(tasks => {
        const index = tasks.findIndex(task => task.id === id);
        if (index === -1) throw new AppError(404, 'タスクが見つかりません。再読み込みしてください。');
        tasks.splice(index, 1);
      });
    }
  };
}
