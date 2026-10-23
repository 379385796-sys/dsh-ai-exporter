import test from 'node:test';import assert from 'node:assert/strict';
import {validateWorkspaceState,validateAdditiveLockfile} from '../scripts/install-state-rules.mjs';
const before={lastValidatedTimestamp:1000,projects:{p:{name:'profile',hasModulesDir:true}},settings:{minimumReleaseAgeExclude:['pkg@1'],nodeLinker:'hoisted'},filteredInstall:false};
const options={effectiveAgeExclude:['pkg@1 || 2'],configUnchanged:true,startedAt:2000,finishedAt:3000};
test('installation rules allow only timestamp and stale cache refresh to unchanged actual config',()=>{
 const after=structuredClone(before);after.lastValidatedTimestamp=2500;after.settings.minimumReleaseAgeExclude=['pkg@1 || 2'];assert.equal(validateWorkspaceState(before,after,options).length,2);
});
test('installation rules reject unapproved exclusions, unknown fields, project/settings drift and config edits',()=>{
 for(const mutate of [s=>s.settings.minimumReleaseAgeExclude=['pkg@*'],s=>s.settings.nodeLinker='isolated',s=>s.projects.p.hasModulesDir=false,s=>s.unknown=true,s=>s.lastValidatedTimestamp=99999]){const after=structuredClone(before);after.lastValidatedTimestamp=2500;mutate(after);assert.throws(()=>validateWorkspaceState(before,after,options));}
 assert.throws(()=>validateWorkspaceState(before,{...before,lastValidatedTimestamp:2500},{...options,configUnchanged:false}));
});
test('lock rules reject an existing version change, dependency deletion or unexpected addition',()=>{
 const a={settings:{autoInstallPeers:false},packages:{'old@1':{resolution:{integrity:'a'}}},snapshots:{'old@1':{}},importers:{'.':{dependencies:{old:{version:'1'}}}}};
 const b=structuredClone(a);b.packages['exporter@file:fixture']={};b.snapshots['exporter@file:fixture']={};b.importers['.'].dependencies.exporter={version:'file:fixture'};
 const opts={candidate:'exporter',allowedNewKeys:['exporter@file:fixture']};assert(validateAdditiveLockfile(a,b,opts));
 for(const mutate of [s=>delete s.packages['old@1'],s=>s.importers['.'].dependencies.old.version='2',s=>s.snapshots['evil@1']={}]){const bad=structuredClone(b);mutate(bad);assert.throws(()=>validateAdditiveLockfile(a,bad,opts));}
});
