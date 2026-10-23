import assert from 'node:assert/strict';
/** Accept cached state refresh, never a configuration edit or arbitrary settings drift. */
export function validateWorkspaceState(before,after,{effectiveAgeExclude,configUnchanged,startedAt,finishedAt}) {
  assert.equal(configUnchanged,true,'Effective configuration must be unchanged');
  assert(Number.isFinite(after.lastValidatedTimestamp)&&after.lastValidatedTimestamp>=before.lastValidatedTimestamp&&after.lastValidatedTimestamp>=startedAt-2000&&after.lastValidatedTimestamp<=finishedAt+2000,'Timestamp outside installation window');
  const a=structuredClone(before),b=structuredClone(after),changes=[];
  if(a.lastValidatedTimestamp!==b.lastValidatedTimestamp)changes.push('lastValidatedTimestamp refreshed within installation window');
  delete a.lastValidatedTimestamp;delete b.lastValidatedTimestamp;
  if(JSON.stringify(a.settings?.minimumReleaseAgeExclude)!==JSON.stringify(b.settings?.minimumReleaseAgeExclude)){
    assert.deepEqual(b.settings.minimumReleaseAgeExclude,effectiveAgeExclude,'Cached exclusions must exactly equal pre-install effective config');
    a.settings.minimumReleaseAgeExclude=b.settings.minimumReleaseAgeExclude;
    changes.push('settings.minimumReleaseAgeExclude refreshed to unchanged pre-install config');
  }
  assert.deepEqual(b,a,'Unexpected workspace state field change');return changes;
}
/** Wanted lockfile must retain every existing package, snapshot and importer entry. */
export function validateAdditiveLockfile(before,after,{candidate,allowedNewKeys}) {
  assert.deepEqual(after.settings,before.settings,'Lock settings drift');
  for(const section of ['packages','snapshots']){
    for(const [key,value] of Object.entries(before[section]??{}))assert.deepEqual(after[section]?.[key],value,`Existing ${section} changed: ${key}`);
    const added=Object.keys(after[section]??{}).filter(k=>!(k in (before[section]??{})));
    assert.deepEqual(added.sort(),[...allowedNewKeys].sort(),`Unexpected added ${section}`);
  }
  const b=structuredClone(after.importers),a=structuredClone(before.importers);
  assert(b['.'].dependencies[candidate],'Candidate importer entry missing');delete b['.'].dependencies[candidate];
  assert.deepEqual(b,a,'Existing importer drift');return true;
}
