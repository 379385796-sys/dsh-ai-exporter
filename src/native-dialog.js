import {spawn} from 'node:child_process';import {join,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {existsSync} from 'node:fs';

const program=join(dirname(fileURLToPath(import.meta.url)),'native-dialog.exe');
const DAY=24*60*60*1000;
const traceEnvironment=()=>({...process.env,DSH_EXPORTER_TRACE_TEMP:tmpdir()});

export function startNativeTraceRetention() {
  if(process.platform!=='win32')return ()=>{};
  let child,stopped=false;
  const check=()=>{
    if(stopped||child||!existsSync(join(tmpdir(),'dsh-ai-exporter-native-debug-v1')))return;
    try {
      const running=spawn(program,['--prune-debug'],{env:traceEnvironment(),windowsHide:true,stdio:'ignore',timeout:15000});
      child=running;
      const done=()=>{if(child===running)child=undefined;};
      running.once('error',done);
      running.once('close',done);
      running.unref();
    } catch { /* trace maintenance must not interrupt export */ }
  };
  queueMicrotask(check);
  const interval=setInterval(check,DAY).unref();
  return ()=>{stopped=true;clearInterval(interval);child?.kill();};
}
/** Static WinForms executable. JSON carries only chooser metadata, never code. */
export async function pickNativeDestination(options,signal) {
  if(process.platform!=='win32')throw Error('Windows 原生选择器仅支持 Windows Desktop');
  signal?.throwIfAborted();
  return new Promise((done,reject)=>{
    // WinExe has no terminal window. Keep the requested interactive dialog visible.
    const child=spawn(program,[],{env:traceEnvironment(),shell:false,windowsHide:false,stdio:['pipe','pipe','pipe']});
    let stdout='',stderr='',settled=false;
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);error?reject(error):done(value);};
    const cancel=()=>{child.kill();finish(Error('已取消选择'));};
    const timer=setTimeout(()=>{child.kill();finish(Error('原生文件选择超时，请重新选择'));},180000);
    signal?.addEventListener('abort',cancel,{once:true});
    child.on('error',error=>finish(Error('无法启动 Windows 原生选择器：'+error.message)));
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    child.stdout.on('data',b=>{stdout+=b;if(stdout.length>65536){child.kill();finish(Error('选择器返回数据过长'));}});
    child.stderr.on('data',b=>{stderr=(stderr+b).slice(-1000);});
    child.on('close',code=>{try{const result=JSON.parse(stdout.replace(/^\uFEFF/,''));if(code!==0||result.error)throw Error(result.error??stderr??'选择器失败');if(result.path!==null&&typeof result.path!=='string')throw Error('无效原生选择结果');finish(null,result.path);}catch(e){finish(Error('原生选择器失败：'+e.message));}});
    child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(options)+'\n',()=>child.stdin.destroy());
    if(signal?.aborted)cancel();
  });
}
