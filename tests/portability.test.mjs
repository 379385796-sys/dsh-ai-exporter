import test from 'node:test';import assert from 'node:assert/strict';
import {homedir} from 'node:os';import {mkdtemp,mkdir,readFile,readdir,writeFile} from 'node:fs/promises';import {join,resolve} from 'node:path';
import {DestinationGrants,assertLocalPath} from '../lib/destinations.js';import {exportTranscript} from '../lib/exporter.js';import {replay} from '../lib/core.js';import {fixture} from './fixture.mjs';
import {existingDirectory} from '../lib/files.js';

test('C, D and other local Windows drives accept Unicode without a maintainer directory',async()=>{
 for(const drive of ['C','D','Z']){const root=drive+':\\Users\\ordinary\\中文 空格 😀',file=root+'\\导出.txt';assert.doesNotThrow(()=>assertLocalPath(file));let initial;
 const grants=new DestinationGrants({picker:async o=>{initial=o.initialDirectory;return file;},validateDirectory:async p=>p});const chosen=await grants.choose({sessionId:'synthetic',formats:['txt'],title:'合成'});assert.equal(initial,homedir());assert.equal(grants.consume(chosen.grant,'synthetic',['txt']).outputDir,root);}
});

test('denied or missing chooser destination never grants a write; stored preference is retained as input',async()=>{
 const preference='C:\\Users\\old-user\\Saved exports';let seen;
 const grants=new DestinationGrants({picker:async o=>{seen=o.initialDirectory;return 'C:\\Users\\ordinary\\locked\\out.txt';},validateDirectory:async p=>{if(p===preference)return p;throw Object.assign(Error('permission denied'),{code:'EACCES'});}});
 await assert.rejects(grants.choose({sessionId:'s',formats:['txt'],title:'s',initialDirectory:preference}),/permission denied/);assert.equal(seen,preference);assert.equal(grants.grants.size,0);
});

test('real isolated PDF/TXT/Markdown export in an unrelated Unicode directory cleans its temporary profile',async()=>{
 const base=resolve('artifacts/portable-tests');await mkdir(base,{recursive:true});const root=await mkdtemp(join(base,'普通用户 😀 ')),out=join(root,'我的导出'),temp=join(root,'临时 空格');await mkdir(out);await mkdir(temp);await writeFile(join(temp,'keep.txt'),'user-owned');
 const f=fixture(2),t=replay(f.header,f.events);const result=await exportTranscript(t,{outputDir:out,tempDirectory:temp,formats:['txt','md','pdf'],range:'2',models:true});
 assert.equal(result.files.length,3);const txt=await readFile(result.files[0],'utf8');assert(txt.includes('第 2 轮完成'));assert(!txt.includes('第 1 轮：'));const pdf=await readFile(result.files[2]);assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.deepEqual(await readdir(temp),['keep.txt']);assert.equal(JSON.parse(await readFile(result.reportFile,'utf8')).messages,2);
 const saved={TEMP:process.env.TEMP,TMP:process.env.TMP,DSH_EXPORTER_TEMP:process.env.DSH_EXPORTER_TEMP};try{process.env.TEMP=temp;process.env.TMP=temp;delete process.env.DSH_EXPORTER_TEMP;const fallback=await exportTranscript(t,{outputDir:out,formats:['pdf'],range:'1'});assert.equal((await readFile(fallback.files[0])).subarray(0,5).toString(),'%PDF-');assert.deepEqual(await readdir(temp),['keep.txt']);}finally{for(const [k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}
});

test('existing legal Chinese punctuation directories are accepted',async()=>{const base=resolve('artifacts/portable-tests');await mkdir(base,{recursive:true});const root=await mkdtemp(join(base,'用户。；，'));assert.equal(await existingDirectory(root),root);assert.doesNotThrow(()=>assertLocalPath('C:\\用户。；，'));});
