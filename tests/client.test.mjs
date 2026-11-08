import test,{before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from 'playwright-core';
import http from 'node:http';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
let server,browser,page,base,state;
const paused=()=>{let release;const promise=new Promise(r=>release=r);return {promise,release};};
const snapshot=id=>({id,snapshotKey:id+'-'+state.revision,complete:!state.partial,messages:Array.from({length:id==='A'?1:2},()=>({})),stats:{rounds:1},diagnostics:state.partial?[{seq:1,code:'synthetic-unsupported',detail:'SYNTHETIC ONLY'}]:[]});
before(async()=>{
  const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {ExportPanel} from './src/client.jsx';import {en,zh} from './src/copy.js';let root=createRoot(document.getElementById('app'));window.show=(id='A',lang='zh')=>root.render(<ExportPanel sessionId={id} t={(key,params={})=>(lang==='en'?en:zh)[key].replace(/\\{(\\w+)\\}/g,(_,n)=>String(params[n]??''))}/>);window.unmount=()=>root.unmount();window.show();`,resolveDir:resolve('.'),loader:'jsx'},bundle:true,write:false,jsx:'automatic',format:'iife',define:{'process.env.NODE_ENV':'"production"'}});
  server=http.createServer(async(req,res)=>{
    if(req.url==='/bundle.js'){res.setHeader('content-type','text/javascript');return res.end(bundle.outputFiles[0].text);}
    if(!req.url.startsWith('/api/')){res.setHeader('content-type','text/html;charset=utf-8');return res.end('<!doctype html><html><meta charset="utf-8"><style>body{font:14px/1.5 sans-serif}</style><div id="app"></div><script src="/bundle.js"></script></html>');}
    const s=state,url=new URL(req.url,'http://localhost');let raw='';for await(const b of req)raw+=b;
    const body=raw?JSON.parse(raw):null;s.calls.push({url:req.url,method:req.method,body});
    let value;
    if(url.pathname.endsWith('.snapshot')){const id=url.searchParams.get('sessionId'),read=snapshot(id),delay=s.delays.shift();if(delay)await delay.promise;if(s.fail){res.statusCode=400;value={error:'SYNTHETIC_READ_FAILURE'};}else value=read;}
    else if(url.pathname.endsWith('.sessions'))value=[{id:'B',createdAt:1}];
    else if(url.pathname.endsWith('.destination'))value={grant:'synthetic-grant',directory:'D:\\Synthetic',expires:Date.now()+240000};
    else if(url.pathname.endsWith('.start')){value={id:'synthetic-job'};if(s.startDelay)await s.startDelay.promise;}
    else if(req.method==='DELETE'){s.cancelled=true;value={status:'cancelled'};}
    else if(url.pathname.endsWith('.job'))value=s.running&&!s.cancelled?{status:'running',progress:'正在生成 PDF'}:{status:s.cancelled?'cancelled':'done',progress:'complete',result:{files:['D:\\Synthetic\\export.txt'],reportFile:'D:\\Synthetic\\report.json'}};
    else {res.statusCode=404;value={error:'unknown fixture route'};}
    res.setHeader('content-type','application/json');res.end(JSON.stringify(value));
  });await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
  const profile=resolve('artifacts/client-tests/browser-profile');await mkdir(profile,{recursive:true});
  browser=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:1000,height:900},env:process.env});
});
after(async()=>{await browser?.close();await new Promise(r=>server?.close(r));});
beforeEach(async()=>{if(page)await page.close();state={revision:1,partial:false,delays:[],calls:[],running:false,cancelled:false};page=await browser.newPage();await page.goto(base);await page.getByRole('button',{name:'导出对话',exact:true}).waitFor();});
async function open(){await page.getByRole('button',{name:'导出对话',exact:true}).click();}
async function ready(n=1){await page.getByRole('status').filter({hasText:`已读取 ${n} 条正文`}).waitFor();}
test('host session switch ignores a late snapshot and a late error; next read uses B',async()=>{
  const slow=paused();state.delays.push(slow);await open();await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('读取'));
  await page.evaluate(()=>window.show('B'));slow.release();await page.waitForTimeout(100);assert.equal(await page.getByRole('button',{name:'导出',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'重新读取',exact:true}).click();await ready(2);assert.equal(await page.getByRole('combobox',{name:'导出会话'}).inputValue(),'B');
  const late=paused();state.delays.push(late);await page.getByRole('button',{name:'重新读取',exact:true}).click();await page.evaluate(()=>window.show('A'));state.fail=true;late.release();await page.waitForTimeout(80);assert.equal(await page.getByRole('alert').count(),0);
});
test('history selection, refresh and close invalidate old reads; consent resets for every review',async()=>{
  state.partial=true;await open();await ready();const consent=page.getByRole('checkbox',{name:'我已了解，允许此快照部分导出'});await consent.check();
  const slow=paused();state.delays.push(slow);await page.getByRole('button',{name:'重新读取',exact:true}).click();assert.equal(await consent.count(),0);
  await page.getByRole('button',{name:'历史会话',exact:true}).click();await page.getByRole('combobox',{name:'导出会话'}).selectOption('B');await ready(2);assert.equal(await consent.isChecked(),false);slow.release();await page.waitForTimeout(80);assert.equal(await consent.isChecked(),false);
  await consent.check();await page.getByRole('button',{name:'关闭',exact:true}).click();await open();await ready(2);assert.equal(await consent.isChecked(),false);
  const late=paused();state.delays.push(late);await page.getByRole('button',{name:'重新读取',exact:true}).click();await page.keyboard.press('Escape');late.release();await page.waitForTimeout(60);assert.equal(await page.getByRole('dialog').count(),0);
});
test('submitted request carries reviewed identity and consent; unmount never sends task cancellation',async()=>{
  state.partial=true;state.running=true;await open();await ready();await page.getByRole('checkbox',{name:'我已了解，允许此快照部分导出'}).check();await page.getByRole('button',{name:'导出',exact:true}).click();await page.getByRole('button',{name:'取消导出',exact:true}).waitFor();
  await page.waitForFunction(()=>document.querySelector('[role=status]').textContent.includes('PDF'));
  const request=state.calls.find(c=>c.url.endsWith('.start')).body;assert.equal(request.sessionId,'A');assert.equal(request.reviewedSnapshot,'A-1');assert.equal(request.allowPartial,true);
  await page.evaluate(()=>window.unmount());await page.waitForTimeout(100);assert.equal(state.calls.some(c=>c.method==='DELETE'),false);
});
test('explicit cancel reaches only the task; delayed submission also survives unmount',async()=>{
  state.running=true;await open();await ready();await page.getByRole('button',{name:'导出',exact:true}).click();const cancel=page.getByRole('button',{name:'取消导出',exact:true});await cancel.waitFor();await cancel.click();await page.getByRole('alert').filter({hasText:'已取消'}).waitFor();assert.equal(state.calls.filter(c=>c.method==='DELETE').length,1);
  await page.getByRole('button',{name:'关闭',exact:true}).click();await open();await ready();state.startDelay=paused();await page.getByRole('button',{name:'导出',exact:true}).click();await page.waitForTimeout(60);await page.evaluate(()=>window.unmount());state.startDelay.release();await page.waitForTimeout(80);assert.equal(state.calls.filter(c=>c.method==='DELETE').length,1);
});
test('English, narrow layout, keyboard focus and reduced motion remain usable',async()=>{
  await page.evaluate(()=>window.show('A','en'));await page.setViewportSize({width:360,height:800});await page.emulateMedia({reducedMotion:'reduce'});const trigger=page.getByRole('button',{name:'Export conversation',exact:true});await trigger.focus();await page.keyboard.press('Enter');await page.getByRole('status').filter({hasText:'Read 1 message'}).waitFor();assert.equal(await page.locator('.dse-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true);assert.equal(await page.locator('.dse-dialog').evaluate(e=>getComputedStyle(e).animationName),'none');await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Close export',exact:true}).evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
});
