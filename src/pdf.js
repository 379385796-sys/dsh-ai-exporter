import {tmpdir} from 'node:os';
import {chromium} from 'playwright-core';
import {mkdtemp,rm,access,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {renderHtml} from './renderers.js';
/** Prefer installed Edge; no browser download, cloud conversion or shared profile. */
export async function browserExecutable(explicit=process.env.DSH_EXPORTER_BROWSER) {
  const candidates=[explicit,process.env['PROGRAMFILES(X86)']&&join(process.env['PROGRAMFILES(X86)'],'Microsoft/Edge/Application/msedge.exe'),process.env.PROGRAMFILES&&join(process.env.PROGRAMFILES,'Google/Chrome/Application/chrome.exe')].filter(Boolean);
  for(const c of candidates){try{await access(c);return c;}catch{}}
  throw Error('找不到 Edge/Chrome；请安装浏览器或设置 DSH_EXPORTER_BROWSER 为其程序路径');
}
export async function renderPdf(t,o={}) {
  const temp=o.tempDirectory??process.env.DSH_EXPORTER_TEMP??tmpdir();
  o.signal?.throwIfAborted();await mkdir(temp,{recursive:true});
  const profile=await mkdtemp(join(temp,'export-browser-'));let context;
  const cancel=()=>{void context?.close().catch(()=>{});};
  try {
    context=await chromium.launchPersistentContext(profile,{executablePath:await browserExecutable(o.browser),headless:true,env:{...process.env,TEMP:temp,TMP:temp},args:['--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run']});
    o.signal?.addEventListener('abort',cancel,{once:true});o.signal?.throwIfAborted();
    await context.route('**/*',route=>route.abort());const page=context.pages()[0]??await context.newPage();
    await page.setContent(renderHtml(t,o),{waitUntil:'load',timeout:30000});
    await page.evaluate(()=>document.fonts.ready);o.signal?.throwIfAborted();
    return await page.pdf({format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="width:100%;text-align:center;font-size:9px;color:#718095"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',timeout:60000});
  }finally{o.signal?.removeEventListener('abort',cancel);await context?.close().catch(()=>{});await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
}
