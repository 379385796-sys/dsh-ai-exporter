import {getTranscript,listSessions} from './adapter.js';
import {exportTranscript} from './exporter.js';
import {DestinationGrants} from './destinations.js';
export const name='dsh-ai-exporter';
export const inject=['connection','sessionQuery'];
// The official HTTP bridge normalizes Request.url to http://dsh.internal;
// preserve its already trust-checked Host authority when checking browser Origin.
export function validOrigin(request){const origin=request.headers.get('origin');if(!origin||origin==='dsh-app://app')return true;try{const host=request.headers.get('host');return origin===(host?new URL('http://'+host).origin:new URL(request.url).origin);}catch{return false;}}
/** Owner-only exact Fetch routes, authenticated by DSH Connection. No arbitrary read API. */
export function apply(ctx) {
  const jobs=new Map(),destinations=new DestinationGrants(),lifetime=new AbortController();let disposed=false;
  ctx.effect(()=>()=>{disposed=true;lifetime.abort();for(const j of jobs.values())j.abort.abort();jobs.clear();destinations.grants.clear();},'ai-exporter job lifecycle');
  const route=(path,methods,fetch)=>ctx.connection.fetch.register({path:'/api/ai-exporter.'+path,methods,requestBody:'buffered',fetch:async request=>{try{if(disposed)throw Error('插件已卸载');if(request.method==='POST'){if(!validOrigin(request))throw Error('拒绝跨站导出请求');if(!request.headers.get('content-type')?.startsWith('application/json'))throw Error('需要 JSON 请求');}return await fetch(request);}catch(e){return Response.json({error:e.message},{status:400,headers:{'cache-control':'no-store'}});}}});
  route('snapshot',['GET'],async request=>Response.json(await getTranscript(ctx,new URL(request.url).searchParams.get('sessionId'),request.signal),{headers:{'cache-control':'no-store'}}));
  route('sessions',['GET'],async request=>Response.json(await listSessions(ctx,request.signal),{headers:{'cache-control':'no-store'}}));
  route('destination',['POST'],async request=>{
    const body=await request.json(),signal=AbortSignal.any([request.signal,lifetime.signal]);
    const transcript=await getTranscript(ctx,body.sessionId,signal);
    return Response.json(await destinations.choose({sessionId:body.sessionId,formats:body.formats,title:transcript.title,initialDirectory:body.initialDirectory,folderOnly:body.folderOnly,strictInitialDirectory:body.strictInitialDirectory},signal),{headers:{'cache-control':'no-store'}});
  });
  route('start',['POST'],async request=>{
    const body=await request.json();
    request.signal.throwIfAborted();
    for(const [key,value] of jobs)if(value.finished&&Date.now()-value.finished>300000)jobs.delete(key);
    if([...jobs.values()].filter(j=>!j.finished).length>=2)throw Error('已有导出任务，请等待完成');
    if(jobs.size>=32)for(const [key,value] of jobs){if(value.finished){jobs.delete(key);break;}}
    const destination=destinations.consume(body.grant,body.sessionId,body.formats);
    const abort=new AbortController(),id=globalThis.crypto.randomUUID(),job={abort,status:'running',progress:'读取完整会话',created:Date.now()};jobs.set(id,job);
    const options={outputDir:destination.outputDir,fileStem:destination.fileStem,tempDirectory:process.env.DSH_EXPORTER_TEMP,formats:body.formats,range:body.range,timestamps:body.timestamps!==false,models:body.models===true,allowPartial:body.allowPartial===true,bom:true,newline:'crlf',timeZone:'Australia/Sydney',signal:abort.signal,onProgress:text=>job.progress=text};
    void (async()=>{try{const t=await getTranscript(ctx,body.sessionId,abort.signal);job.result=await exportTranscript(t,options);job.status='done';}catch(e){job.status=abort.signal.aborted?'cancelled':'error';job.error=e.message;job.completedFiles=e.completedFiles??[];job.cleanupWarnings=e.cleanupWarnings??[];}finally{job.finished=Date.now();}})();
    // Finished jobs expire; browser can consume the result or cancel independently of its HTTP fetch.
    for(const [key,value] of jobs)if(value.finished&&Date.now()-value.finished>300000)jobs.delete(key);
    return Response.json({id});
  });
  route('job',['GET','DELETE'],async request=>{const id=new URL(request.url).searchParams.get('id'),job=jobs.get(id);if(!job)throw Error('任务不存在');if(request.method==='DELETE')job.abort.abort();const {abort,...safe}=job;return Response.json(safe,{headers:{'cache-control':'no-store'}});});
}
