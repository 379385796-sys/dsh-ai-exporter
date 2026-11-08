import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {replay} from '../lib/core.js';
import {getTranscript,assertReviewedSnapshot} from '../lib/adapter.js';
import {header} from './fixture.mjs';
const native=JSON.parse(await readFile(new URL('./fixtures/native-forks.json',import.meta.url)));
for(const fixture of native.cases)test('native Session Fork: '+fixture.name,()=>{
  const before=JSON.stringify(fixture),result=replay(fixture.header,fixture.events);
  assert.equal(result.complete,true,JSON.stringify(result.diagnostics));assert.equal(result.messages.length,2);assert.equal(result.stats.rounds,1);
  assert.equal(result.messages[0].id,'u0');assert.equal(result.messages[1].id,'a0');
  assert(!JSON.stringify(result.messages).includes('RETRY_DRAFT'));assert(!JSON.stringify(result.messages).includes('COMPACTION_INTERNAL'));
  assert(!result.diagnostics.some(d=>d.code==='open-turn'));assert.equal(JSON.stringify(fixture),before);
  assert(fixture.events.some(e=>e.type==='session/end-seed'&&e.data.inherited));
});
test('empty native fork is a complete empty readable projection',()=>{const result=replay({...header,id:'empty-fork',isSeeded:true},[]);assert.equal(result.complete,true);assert.equal(result.messages.length,0);});
test('reviewed key is stable for one observation and rejects changed content or diagnostics',async()=>{
  const f=structuredClone(native.cases[0]);const ctx={get:()=>({readSession:async()=>({session:f.header,events:f.events})})};
  const a=await getTranscript(ctx,f.header.id),b=await getTranscript(ctx,f.header.id);assert.equal(a.snapshotKey,b.snapshotKey);assert.doesNotThrow(()=>assertReviewedSnapshot(b,a.snapshotKey));
  f.events.push({seq:f.events.length,time:123,type:'plugin:future',data:{synthetic:true}});const changed=await getTranscript(ctx,f.header.id);assert.notEqual(a.snapshotKey,changed.snapshotKey);assert.throws(()=>assertReviewedSnapshot(changed,a.snapshotKey),/Session changed/);assert.throws(()=>assertReviewedSnapshot(changed,undefined),/Session changed/);
});
