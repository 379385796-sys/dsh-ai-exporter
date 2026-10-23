import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import {TranscriptReplay,LIMITS} from './core.js';
/** Strict streaming JSONL read; never opens write handles on the source. */
export async function readTranscript(path,options={}) {
  if((await stat(path)).size>LIMITS.bytes)throw Error('日志超过 64 MiB 安全上限；请分批处理或提高经过测试的上限');
  const input=createReadStream(path,{encoding:'utf8',signal:options.signal});
  const lines=createInterface({input,crlfDelay:Infinity});let n=0,r;
  try {for await(let line of lines){n++;if(n===1)line=line.replace(/^\uFEFF/,'');if(!line.trim())continue;if(Buffer.byteLength(line)>LIMITS.line)throw Error(`第 ${n} 行过大`);let e;try{e=JSON.parse(line);}catch{throw Error(`第 ${n} 行 JSON 损坏，拒绝不完整导出`);}if(!r)r=new TranscriptReplay(e,options);else r.push(e);if(n%200===0){options.onProgress?.(n);await new Promise(resolve=>setImmediate(resolve));}}
    if(!r)throw Error('空日志');return r.finish();
  } finally {lines.close();input.destroy();}
}
