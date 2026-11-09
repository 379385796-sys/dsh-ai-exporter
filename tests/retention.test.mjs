import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const program = fileURLToPath(new URL('../lib/native-dialog.exe', import.meta.url));
const folder = 'dsh-ai-exporter-native-debug-v1';
const day = 86_400_000;

test('native trace retention checks age, ownership, share locks and links across restarts', {skip:process.platform!=='win32'}, async () => {
  const temp = fs.mkdtempSync(path.join(tmpdir(),'exporter-retention-'));
  const root = path.join(temp,folder);
  const differentTmp=path.join(temp,'other-tmp');fs.mkdirSync(differentTmp);
  const env = {...process.env,TEMP:temp,TMP:differentTmp,DSH_EXPORTER_NATIVE_DEBUG:'1'};
  delete env.DSH_EXPORTER_TRACE_TEMP;
  const run = (args,input) => spawnSync(program,args,{env:{...env,DSH_EXPORTER_TRACE_TEMP:temp},input,windowsHide:true,encoding:'utf8',timeout:10000});
  // A malformed chooser request returns before any UI, but exercises the real opt-in writer.
  const invalid = run([],'not-json\n');
  assert.equal(invalid.status,1);
  const [generated] = fs.readdirSync(root);
  assert.match(generated,/^trace-[a-f0-9]{32}\.log$/);
  assert.match(fs.readFileSync(path.join(root,generated),'utf8'),/\nstart\nstdout-ready\ninput-read\n/);
  function fixture(digit,age,valid=true) {
    const id=digit.repeat(32),file=path.join(root,`trace-${id}.log`);
    fs.writeFileSync(file,valid?`dsh-ai-exporter/native-debug/v1 ${id}\nstart\n`:'not an exporter trace');
    fs.utimesSync(file,new Date(Date.now()-age*day),new Date(Date.now()-age*day));
    return file;
  }
  const fresh=fixture('1',9), edge=fixture('2',10), expired=fixture('3',11), corrupt=fixture('4',11,false);
  const locked=fixture('5',11), denied=fixture('6',11);
  fs.chmodSync(denied,0o444);
  const retainedReport=path.join(root,'saved-export-report.json');
  fs.writeFileSync(retainedReport,'private user report sentinel');
  const original=fixture('7',11);
  const outside=path.join(temp,'original.log');
  fs.renameSync(original,outside);
  fs.linkSync(outside,original);
  const protectedDir=path.join(temp,'not-a-log');fs.mkdirSync(protectedDir);
  const junction=path.join(root,`trace-${'8'.repeat(32)}.log`);
  fs.symlinkSync(protectedDir,junction,'junction');
  const legacy=path.join(temp,'dsh-native-1234.log');fs.writeFileSync(legacy,'start\n');
  const oldPdf=path.join(temp,'export-job-unproven');fs.mkdirSync(oldPdf);
  const powershell=path.join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe');
  const lock=spawn(powershell,['-NoProfile','-NonInteractive','-Command',"$f=[IO.File]::Open($env:TRACE_TEST_PATH,'Open','ReadWrite','Read'); try{[Console]::Out.WriteLine('ready'); [Console]::In.ReadLine() | Out-Null}finally{$f.Dispose()}"],{env:{...env,TRACE_TEST_PATH:locked},windowsHide:true,stdio:['pipe','pipe','inherit']});
  const exited=once(lock,'exit');
  try {
    assert.match(String((await once(lock.stdout,'data'))[0]),/ready/);
    assert.equal(run(['--prune-debug']).status,0);
    assert.equal(run(['--prune-debug']).status,0);
    for(const file of [fresh,corrupt,locked,denied,retainedReport,outside,original,junction,legacy,oldPdf])assert(fs.existsSync(file),file);
    for(const file of [edge,expired])assert(!fs.existsSync(file),file);
  } finally {lock.stdin.end('\n');await exited;}
  fs.chmodSync(denied,0o666);
  const old=new Date(Date.now()-11*day);
  fs.utimesSync(denied,old,old);fs.utimesSync(fresh,old,old);
  // A fresh plugin process performs its initial check with the configured TEMP.
  const restarted=spawn(process.execPath,['--input-type=module','-e',`import {startNativeTraceRetention} from ${JSON.stringify(new URL('../lib/native-dialog.js',import.meta.url).href)};const stop=startNativeTraceRetention();setTimeout(stop,5000);`],{env,windowsHide:true,stdio:'inherit'});
  const restartedExit=once(restarted,'exit');
  for(let i=0;i<40&&fs.existsSync(fresh);i++)await sleep(100);
  assert.equal((await restartedExit)[0],0);
  for(const file of [fresh,locked,denied])assert(!fs.existsSync(file),file);
  assert.equal(fs.readFileSync(retainedReport,'utf8'),'private user report sentinel');
});
