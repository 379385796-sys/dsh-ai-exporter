import test from 'node:test';import assert from 'node:assert/strict';import MarkdownIt from 'markdown-it';import {markdownToText,renderMarkdown} from '../lib/renderers.js';import {fixture,header,complexBody} from './fixture.mjs';import {replay} from '../lib/core.js';
test('TXT Windows drive, Chinese/space, punctuation and UNC paths retain literal spelling',()=>{
  for(const path of [String.raw`D:\AI聊天记录\中文 空格\report.md`,String.raw`C:\folder\[draft]\a_b.txt`,String.raw`\\server\share\中文 空格\x.txt`,String.raw`D:\percent%20literal\x.txt`])assert(markdownToText(path).includes(path),path);
  const result=markdownToText('[文件](<D:\\中文 文件\\报告.txt>)');assert(result.includes('D:\\中文 文件\\报告.txt'));assert(!result.includes('%5C'));assert(!result.includes('%20'));
});
test('TXT full URLs and Markdown link labels remain readable without local-path rewriting',()=>{const url='https://example.com/a%20b?q=%E4%B8%AD%E6%96%87&x=1';assert(markdownToText(url).includes(url));assert(markdownToText('[地址]('+url+')').includes('地址 ('+url+')'));});
test('TXT removes renderer-added nested group gaps but preserves deliberate source blank lines and code',()=>{
 assert.equal(markdownToText('- one\n  - nested\n- 二'), '• one\n  • nested\n• 二');
 assert.equal(markdownToText('> 一级\n> > 二级'),'> 一级\n> > 二级');
 assert(markdownToText('第一段\n\n\n第二段').includes('第一段\n\n\n第二段'));
 assert(markdownToText('```python\n  a=1\n\n\n    b=2\n```').includes('  a=1\n\n\n    b=2'));
 assert.equal(markdownToText('中文长段落'.repeat(100)),'中文长段落'.repeat(100));
});
test('Markdown wrapper is standard syntax with inert metadata while original HTML/body is untouched',()=>{
 const f=fixture(1),t=replay(header,f.events);t.title='title\n# injected <script> & [link](bad)';t.messages[0].body='<h1>原始 HTML</h1>\n\n原始 **正文**';const out=renderMarkdown(t,{exportedAt:0});assert(out.startsWith('# title '));assert(!out.includes('<hr>'));assert(!out.includes('<p><strong>'));assert(out.includes(t.messages[0].body));assert(out.includes(complexBody));
 const parsed=new MarkdownIt({html:false}).parse(out,{});assert.equal(parsed.filter(t=>t.type==='hr').length,2);assert.equal(parsed.filter(t=>t.type==='fence'&&t.info==='mermaid').length,1);
});
