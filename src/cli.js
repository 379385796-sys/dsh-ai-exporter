#!/usr/bin/env node
import {parseArgs} from 'node:util';
import {readTranscript} from './reader.js';
import {exportTranscript} from './exporter.js';
const {values}=parseArgs({options:{input:{type:'string'},out:{type:'string'},formats:{type:'string',default:'txt,md,pdf'},rounds:{type:'string'},'no-timestamps':{type:'boolean'},models:{type:'boolean'},bom:{type:'boolean'},crlf:{type:'boolean'},'allow-partial':{type:'boolean'},inspect:{type:'boolean'},timezone:{type:'string',default:'Australia/Sydney'},help:{type:'boolean'}}});
if(values.help){console.log('DSH AI Exporter\nnode lib/cli.js --input session.v4.jsonl --out 保存文件夹 [--formats txt,md,pdf] [--rounds 1-3,5] [--models] [--no-timestamps] [--bom] [--crlf] [--inspect] [--allow-partial] [--timezone Australia/Sydney]');}
else {const abort=new AbortController();process.once('SIGINT',()=>abort.abort());try{if(!values.input)throw Error('请指定 --input');const t=await readTranscript(values.input,{signal:abort.signal,onProgress:n=>console.error(`已读取 ${n} 行`)});
  if(values.inspect)console.log(JSON.stringify({id:t.id,stats:t.stats,complete:t.complete,diagnostics:t.diagnostics},null,2));
  else {if(!values.out)throw Error('请使用 --out 明确指定导出目录');const report=await exportTranscript(t,{outputDir:values.out,formats:values.formats.split(','),range:values.rounds,timestamps:!values['no-timestamps'],models:values.models,bom:values.bom,newline:values.crlf?'crlf':'lf',allowPartial:values['allow-partial'],timeZone:values.timezone,signal:abort.signal,onProgress:console.error});console.log(JSON.stringify(report,null,2));}
}catch(e){console.error(e.message);if(e.completedFiles?.length)console.error('已完成的文件：'+e.completedFiles.join('\n'));process.exitCode=abort.signal.aborted?130:1;}}
