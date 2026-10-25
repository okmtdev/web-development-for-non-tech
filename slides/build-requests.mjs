// スライド原稿からGoogle Slides APIのリクエストを生成します。
// 生成だけを行い、外部サービスへの送信・認証は行いません。
// 現在の作成先にある空白スライド p と空のプレースホルダー i0/i1 を前提とします。
// 別のプレゼンテーションで使う場合は、最初に実際のIDと内容を確認してください。
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const deck = JSON.parse(await readFile(new URL('./deck.json', import.meta.url), 'utf8'));
const out = new URL('../.local/slides-build/', import.meta.url);
await mkdir(out, { recursive: true });
const colors = { paper: '#F6F5F0', ink: '#24372F', green: '#266B53', muted: '#65756B', line: '#D9E2D9', pale: '#E7EEE6', white: '#FFFFFF' };
const rgb = hex => ({ red: parseInt(hex.slice(1, 3), 16) / 255, green: parseInt(hex.slice(3, 5), 16) / 255, blue: parseInt(hex.slice(5, 7), 16) / 255 });
const all = [];
const geometry = [];
for (const data of deck) {
  const page = data.id || (data.n === 1 ? 'p' : `course_${String(data.n).padStart(2, '0')}`);
  const prefix = page === 'p' ? 'course_01' : page;
  const requests = [];
  let index = 0;
  const push = request => requests.push(request);
  const props = (x, y, w, h) => ({ pageObjectId: page, size: { width: { magnitude: w, unit: 'PT' }, height: { magnitude: h, unit: 'PT' } }, transform: { scaleX: 1, scaleY: 1, translateX: x, translateY: y, unit: 'PT' } });
  function shape(x, y, w, h, fill, kind = 'RECTANGLE') {
    const id = `${prefix}_s${++index}`;
    push({ createShape: { objectId: id, shapeType: kind, elementProperties: props(x, y, w, h) } });
    push({ updateShapeProperties: { objectId: id, shapeProperties: { shapeBackgroundFill: { solidFill: { color: { rgbColor: rgb(fill) }, alpha: 1 } }, outline: { propertyState: 'NOT_RENDERED' } }, fields: 'shapeBackgroundFill,outline' } });
    geometry.push({ page, id, x, y, w, h });
    return id;
  }
  function text(value, x, y, w, h, size = 18, color = colors.ink, bold = false, align = 'START') {
    const id = `${prefix}_t${++index}`;
    push({ createShape: { objectId: id, shapeType: 'TEXT_BOX', elementProperties: props(x, y, w, h) } });
    push({ insertText: { objectId: id, text: value, insertionIndex: 0 } });
    push({ updateTextStyle: { objectId: id, textRange: { type: 'ALL' }, style: { fontFamily: 'Noto Sans JP', fontSize: { magnitude: size, unit: 'PT' }, bold, foregroundColor: { opaqueColor: { rgbColor: rgb(color) } } }, fields: 'fontFamily,fontSize,bold,foregroundColor' } });
    push({ updateParagraphStyle: { objectId: id, textRange: { type: 'ALL' }, style: { alignment: align, lineSpacing: 115, spaceAbove: { magnitude: 0, unit: 'PT' }, spaceBelow: { magnitude: 0, unit: 'PT' } }, fields: 'alignment,lineSpacing,spaceAbove,spaceBelow' } });
    push({ updateShapeProperties: { objectId: id, shapeProperties: { contentAlignment: 'TOP', autofit: { autofitType: 'NONE' } }, fields: 'contentAlignment,autofit.autofitType' } });
    geometry.push({ page, id, x, y, w, h, text: value, fontSize: size });
    return id;
  }
  function picture(path, id, x, y, w, intrinsicWidth, intrinsicHeight) {
    const h = w * intrinsicHeight / intrinsicWidth;
    push({ createImage: { objectId: `${prefix}_${id}`, url: new URL(path, import.meta.url).pathname, elementProperties: props(x, y, w, h) } });
    geometry.push({ page, id: `${prefix}_${id}`, x, y, w, h });
  }
  function badge(number, x, y) {
    shape(x, y, 20, 20, colors.green, 'ELLIPSE');
    text(String(number), x - 1, y - 3, 22, 25, 12, colors.white, true, 'CENTER');
  }
  if (data.n === 1) {
    push({ deleteObject: { objectId: 'i0' } });
    push({ deleteObject: { objectId: 'i1' } });
  } else push({ createSlide: { objectId: page, insertionIndex: data.n - 1, slideLayoutReference: { predefinedLayout: 'BLANK' } } });
  const dark = ['cover', 'divider', 'closing'].includes(data.layout);
  push({ updatePageProperties: { objectId: page, pageProperties: { pageBackgroundFill: { solidFill: { color: { rgbColor: rgb(dark ? colors.green : colors.paper) }, alpha: 1 } } }, fields: 'pageBackgroundFill' } });
  if (!dark) {
    shape(44, 35, 32, 4, colors.green);
    text(data.title, 40, 54, 640, 58, 27, colors.ink, true);
    if (data.bottom) {
      if (data.layout === 'annotated') text(data.bottom, 370, 347, 310, 28, 12, colors.muted);
      else text(data.bottom, 42, 342, 638, 34, 13, colors.muted);
    }
  }
  text(`${String(data.n).padStart(2, '0')} / ${deck.length}`, 615, 378, 64, 18, 9, dark ? colors.pale : colors.muted, false, 'END');
  switch (data.layout) {
    case 'cover':
      text(data.subtitle, 44, 40, 600, 28, 15, colors.pale);
      text(data.title, 40, 115, 650, 130, 40, colors.white, true);
      text(data.lead, 44, 269, 620, 35, 19, colors.pale);
      text(data.meta, 44, 346, 610, 25, 12, colors.pale);
      break;
    case 'divider':
      text(data.subtitle, 44, 44, 630, 30, 16, colors.pale);
      text(data.title, 40, 130, 650, 132, 37, colors.white, true);
      text(data.lead, 44, 308, 630, 50, 18, colors.pale);
      break;
    case 'closing':
      text(data.title, 40, 65, 650, 125, 37, colors.white, true);
      text(data.lead, 44, 218, 630, 80, 22, colors.pale);
      text(data.bottom, 44, 345, 610, 26, 14, colors.pale);
      break;
    case 'three':
      data.items.forEach(([head, body], i) => {
        const x = 44 + i * 218;
        text(`0${i + 1}`, x, 137, 60, 35, 20, colors.green);
        shape(x, 180, 190, 1, colors.line);
        text(head, x - 4, 198, 205, 40, 25, colors.ink, true);
        text(body, x - 4, 252, 207, 78, 18, colors.muted);
      });
      break;
    case 'two':
      data.items.forEach(([head, body], i) => {
        const x = 44 + i * 330;
        shape(x, 139, 288, 3, colors.green);
        text(head, x - 4, 157, 300, 46, 25, colors.green, true);
        text(body, x - 4, 217, 304, 112, 18, colors.ink);
      });
      break;
    case 'rows':
      data.items.forEach(([head, body], i) => {
        const y = 134 + i * 67;
        text(head, 42, y, 140, 40, 21, colors.green, true);
        text(body, 190, y + 2, 490, 44, 18);
        if (i < 2) shape(44, y + 52, 630, 1, colors.line);
      });
      break;
    case 'annotated':
      // 既存rowsの見出し・説明・区切りを保ち、画像の右側へ配置する。
      data.items.forEach(([head, body], i) => {
        const y = 122 + i * 74;
        text(head, 370, y, 310, 31, 19, colors.green, true);
        text(body, 370, y + 33, 310, 46, 14);
        if (i < 2) index++; // 旧区切り線のIDを予約。画像注釈には線を使わない。
      });
      picture(data.image, 'image1', 44, 117, 300, 770, 682);
      badge(1, 153, 132);
      badge(2, 339, 218);
      badge(3, 20, 320);
      break;
    case 'beforeafter':
      text(data.leftTitle, 40, 115, 300, 31, 18, colors.green, true);
      text(data.rightTitle, 384, 115, 300, 31, 18, colors.green, true);
      picture(data.images[0], 'image1', 44, 157, 286, 760, 463);
      picture(data.images[1], 'image2', 388, 157, 286, 760, 463);
      shape(348, 232, 22, 20, colors.green, 'RIGHT_ARROW');
      break;
    case 'flow':
      data.items.forEach(([head, body], i) => {
        const x = 44 + i * 220;
        shape(x, 153, 186, 152, colors.pale);
        text(head, x + 8, 171, 170, 40, 25, colors.green, true, 'CENTER');
        text(body, x + 4, 226, 178, 70, 17, colors.ink, false, 'CENTER');
        if (i < 2) shape(x + 192, 211, 22, 20, colors.green, 'RIGHT_ARROW');
      });
      break;
    case 'exercise':
      data.steps.forEach((step, i) => {
        const y = 130 + i * 55;
        text(String(i + 1).padStart(2, '0'), 44, y, 50, 40, 21, colors.green, true);
        text(step, 98, y + 2, 578, 47, 18);
      });
      shape(44, 306, 630, 2, colors.line);
      text(data.result, 40, 318, 640, 32, 15, colors.green, true);
      text(data.path, 44, 357, 580, 22, 11, colors.muted);
      break;
    case 'code':
      [[data.leftTitle, data.left], [data.rightTitle, data.right]].forEach(([head, body], i) => {
        const x = 44 + i * 328;
        text(head, x, 121, 280, 30, 18, colors.green, true);
        shape(x, 158, 300, 178, colors.pale);
        text(body, x + 10, 169, 280, 165, 14, colors.ink);
      });
      break;
    case 'table': {
      const id = `${prefix}_table`;
      const rows = [data.headers, ...data.rows];
      const cols = data.headers.length;
      const widths = data.widths || (cols === 2 ? [335, 295] : [320, 200, 110]);
      push({ createTable: { objectId: id, rows: rows.length, columns: cols, elementProperties: props(44, 125, 630, 200) } });
      widths.forEach((width, i) => push({ updateTableColumnProperties: { objectId: id, columnIndices: [i], tableColumnProperties: { columnWidth: { magnitude: width, unit: 'PT' } }, fields: 'columnWidth' } }));
      push({ updateTableRowProperties: { objectId: id, tableRowProperties: { minRowHeight: { magnitude: 32, unit: 'PT' } }, fields: 'minRowHeight' } });
      rows.forEach((row, r) => row.forEach((value, c) => {
        const cellLocation = { rowIndex: r, columnIndex: c };
        push({ insertText: { objectId: id, cellLocation, text: value } });
        push({ updateTextStyle: { objectId: id, cellLocation, textRange: { type: 'ALL' }, style: { fontFamily: 'Noto Sans JP', fontSize: { magnitude: 15, unit: 'PT' }, bold: r === 0, foregroundColor: { opaqueColor: { rgbColor: rgb(r === 0 ? colors.white : colors.ink) } } }, fields: 'fontFamily,fontSize,bold,foregroundColor' } });
        push({ updateParagraphStyle: { objectId: id, cellLocation, textRange: { type: 'ALL' }, style: { lineSpacing: 100, spaceAbove: { magnitude: 0, unit: 'PT' }, spaceBelow: { magnitude: 0, unit: 'PT' } }, fields: 'lineSpacing,spaceAbove,spaceBelow' } });
        push({ updateTableCellProperties: { objectId: id, tableRange: { location: cellLocation, rowSpan: 1, columnSpan: 1 }, tableCellProperties: { tableCellBackgroundFill: { solidFill: { color: { rgbColor: rgb(r === 0 ? colors.green : r % 2 ? colors.white : colors.pale) }, alpha: 1 } }, contentAlignment: 'MIDDLE' }, fields: 'tableCellBackgroundFill,contentAlignment' } });
      }));
      break;
    }
    case 'app':
      shape(44, 133, 342, 195, colors.white);
      text('マイタスク', 58, 146, 200, 34, 22, colors.ink, true);
      shape(61, 192, 304, 1, colors.line);
      text('✓  教材を開く', 61, 204, 294, 33, 19, colors.green);
      text('□  APIを観察する', 61, 248, 294, 33, 19);
      text('操作のイメージ', 61, 296, 280, 22, 11, colors.muted);
      data.items.forEach(([head, body], i) => {
        const y = 132 + i * 71;
        text(head, 415, y, 255, 30, 19, colors.green, true);
        text(body, 415, y + 32, 255, 42, 15);
      });
      break;
    default: throw new Error(`Unknown layout: ${data.layout}`);
  }
  await writeFile(new URL(`slide-${String(data.n).padStart(2, '0')}.json`, out), JSON.stringify(requests));
  all.push({ n: data.n, page, requests: requests.length, title: data.title, images: requests.filter(r => r.createImage).map(r => r.createImage.url) });
}
const outside = geometry.filter(g => g.x < 0 || g.y < 0 || g.x + g.w > 720 || g.y + g.h > 405);
if (outside.length) throw new Error(`ページ外の要素: ${JSON.stringify(outside)}`);
await writeFile(new URL('manifest.json', out), JSON.stringify(all, null, 2));
await writeFile(new URL('geometry.json', out), JSON.stringify(geometry, null, 2));
await writeFile(new URL('./speaker-notes.md', import.meta.url), `# 講義スライド原稿・講師ノート\n\n元データは \`deck.json\`。教材と同じ順序の${deck.length}枚です。\n\n` + deck.map(d => `## ${d.n}. ${d.title.replaceAll('\n', ' ')}\n\n${[d.subtitle, d.lead, ...(d.items || []).map(i => i.join('：')), ...(d.rows || []).map(i => i.join('：')), ...(d.steps || []), d.bottom, d.result].filter(Boolean).join('\n\n')}\n\n講師ノート：${d.notes}\n`).join('\n'));
console.log(`生成: ${deck.length}枚、ページ外の要素0。API送信は実行していません。`);
