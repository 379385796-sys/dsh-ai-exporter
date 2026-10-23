import {tmpdir} from 'node:os';
import {fork} from 'node:child_process';
import {mkdir,readFile,unlink} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {acquireTemp} from './temp-scope.js';
/** Run Playwright in a child with TEMP/TMP set before its runtime initializes. */
export async function renderPdfIsolated(transcript,options={}) {
  const temp=resolve(options.tempDirectory??process.env.DSH_EXPORTER_TEMP??join(tmpdir(),'dsh-ai-exporter'));
  options.signal?.throwIfAborted();const scope=await acquireTemp(temp,options.onCleanupWarning),work=scope.path,result=join(work,randomUUID()+'.pdf');let child;
  try {
  options.signal?.throwIfAborted();
  child=fork(options._workerFile??join(dirname(fileURLToPath(import.meta.url)),'pdf-worker.cjs'),[],{env:{...process.env,TEMP:work,TMP:work,DSH_EXPORTER_TEMP:work,ELECTRON_RUN_AS_NODE:'1'},windowsHide:true,stdio:['ignore','ignore','pipe','ipc']});
  let stderr='';child.stderr.on('data',b=>{stderr=(stderr+b.toString()).slice(-2000);});
  const cancel=()=>{if(child.connected)child.send({cancel:true});};options.signal?.addEventListener('abort',cancel,{once:true});
  try {
    const resultPromise=new Promise((done,reject)=>{child.once('error',reject);child.once('exit',code=>reject(Error(`PDF 子进程退出 (${code}) ${stderr}`)));child.on('message',message=>message.ok?done():reject(Error(message.error)));});
    const {signal,onProgress,onCleanupWarning,_workerFile,...plainOptions}=options;child.send({transcript,options:{...plainOptions,tempDirectory:work},result});
    await resultPromise;options.signal?.throwIfAborted();return await readFile(result);
  }finally{options.signal?.removeEventListener('abort',cancel);await new Promise(done=>{if(child.exitCode!==null)return done();child.once('exit',done);setTimeout(()=>{child.kill();done();},10000).unref();});await unlink(result).catch(()=>{});}
  }finally{await scope.release();}
}
