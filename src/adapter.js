import {TranscriptReplay,LIMITS} from './core.js';
/** This is the only module that knows DSH's host query contract. */
export async function getTranscript(ctx,id,signal) {
  if(typeof id!=='string'||!/^[-\w]{1,180}$/.test(id))throw Error('无效会话 ID');
  const query=ctx.get('sessionQuery');
  if(typeof query?.readSession!=='function')throw Error('当前 DSH 缺少已验证的 sessionQuery.readSession，请使用独立工具');
  signal?.throwIfAborted();const {session,events}=await query.readSession(id);signal?.throwIfAborted();
  if(events.length>LIMITS.events)throw Error('会话事件数量超过安全上限');
  const r=new TranscriptReplay(session,{signal});let bytes=0;
  for(let i=0;i<events.length;i++){bytes+=Buffer.byteLength(JSON.stringify(events[i]));if(bytes>LIMITS.bytes)throw Error('会话超过 64 MiB 安全上限');r.push(events[i]);if(i%200===0)await new Promise(done=>setImmediate(done));}
  return r.finish();
}
export async function listSessions(ctx,signal) {const query=ctx.get('sessionQuery');if(typeof query?.listSessions!=='function')throw Error('会话查询服务不可用');const records=await query.listSessions(signal);return records.map(r=>({id:r.header.id,createdAt:r.header.createdAt,live:r.live}));}
