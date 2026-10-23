import test from 'node:test';import assert from 'node:assert/strict';
import {markdownToText,displayWidth,renderMarkdown,renderHtml} from '../lib/renderers.js';
const table=rows=>'| 名称 | 值 |\n|---|---|\n'+rows;
test('TXT literal pipes use numbered fields without losing escaped and code-span content',()=>{
  const text=markdownToText(table('| 中文 | 转义 \\| 竖线及 `a\\|b` |'));
  assert(text.includes('列 1（名称）：中文'));assert(text.includes('列 2（值）：转义 | 竖线及 a|b'));
  assert(!text.includes('-+-'));assert.equal((text.match(/列 2（值）/g)||[]).length,1);
});
test('TXT width uses grapheme clusters for mixed CJK, combining marks, flags and joined emoji',()=>{
  assert.equal(displayWidth('中文ab'),6);assert.equal(displayWidth('e\u0301'),1);
  assert.equal(displayWidth('👨‍👩‍👧‍👦🇨🇳1️⃣'),6);
  const text=markdownToText('| 中文 | abc |\n|---|---|\n| ab | 中国 |\n| 😀 | e\u0301 |');
  const lines=text.split('\n').filter(l=>l.includes(' | '));assert.equal(new Set(lines.map(l=>displayWidth(l.split(' | ')[0]))).size,1);
});
test('TXT surplus or missing table cells retain source instead of accepting GFM truncation',()=>{
  for(const raw of [table('| A | B | SURPLUS_MUST_SURVIVE |'),table('| missing |')]){
    const text=markdownToText(raw);assert(text.includes('表格原文'));assert(text.includes(raw));
  }
});
test('TXT complex multiline convention and wide fields retain literal markup and long URLs',()=>{
  const url='https://example.com/'+ '中文/long?x=1&'.repeat(20);
  const text=markdownToText(table('| A | first<br>second '+url+' |'));
  assert(text.includes('记录 1'));assert(text.includes('first<br>second'));assert(decodeURI(text).includes(url));
});
test('TXT multiline source outside GFM tables remains complete',()=>{
  const raw='| 名称 | 值 |\n|---|---|\n| A | 第一行 |\n\n第二行不能归入上一单元格\n';
  assert(markdownToText(raw).includes('第二行不能归入上一单元格'));
});
test('TXT nested quotes/lists, long links and nested fences keep readable hierarchy and indentation',()=>{
  const raw='> 外层\n>\n> > 内层\n> >\n> > - 中文 English\n> >   - 二级 😀\n\n````markdown\n```js\n  const x = "a|b";\n```\n````\n\n[链接](https://example.com/'+ 'path/'.repeat(50)+')';
  const text=markdownToText(raw);for(const s of ['> > 内层','> > • 中文 English','> >   • 二级 😀','````markdown','  const x = "a|b";','https://example.com/'+ 'path/'.repeat(50)])assert(text.includes(s),s);
});
test('TXT table fallback leaves Markdown body and PDF HTML table rendering unchanged',()=>{
  const body=table('| 中文 | 转义 \\| 管道 |');const t={title:'fixture',complete:true,messages:[{index:1,role:'assistant',body}]};
  const options={exportedAt:0};const beforeMd=renderMarkdown(t,options),beforeHtml=renderHtml(t,options);
  markdownToText(body);assert.equal(renderMarkdown(t,options),beforeMd);assert.equal(renderHtml(t,options),beforeHtml);
  assert(beforeMd.includes(body));assert(beforeHtml.includes('<table>'));assert(beforeHtml.includes('转义 | 管道'));
});
