import { readdir, readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', '.local', 'node_modules', 'rendered'].includes(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else result.push(path);
  }
  return result;
}
let failures = 0;
let links = 0;
let javascript = 0;
for (const file of await files('.')) {
  if (file.endsWith('.js') || file.endsWith('.mjs')) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    javascript++;
    if (result.status !== 0) { failures++; console.error(result.stderr); }
  }
  if (file.endsWith('.md')) {
    const content = await readFile(file, 'utf8');
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z]+:|^\//i.test(target) || target.includes('<')) continue;
      links++;
      try { await access(resolve(dirname(file), decodeURI(target))); }
      catch { failures++; console.error(`リンク先がありません: ${file} -> ${target}`); }
    }
  }
}
console.log(`JavaScript構文: ${javascript}ファイル、Markdownローカルリンク: ${links}件、エラー: ${failures}`);
process.exitCode = failures ? 1 : 0;
