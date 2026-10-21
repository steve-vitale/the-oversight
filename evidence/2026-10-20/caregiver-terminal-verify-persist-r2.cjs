'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),gear=require('../../scripts/gear-usage-audit');
const prefix='evidence/2026-10-20/caregiver-terminal-persist-r1-',read=f=>JSON.parse(f.endsWith('.gz')?z.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const on=read(prefix+'on.json.gz'),off=read(prefix+'off.json.gz'),excluded=[];
function canonical(result,arm){
 const copy=JSON.parse(JSON.stringify(result));
 for(const [label,state,hash] of [['finalState',copy.finalState,copy.stateHash],['bridge.state',copy.bridge?.state,copy.bridge?.stateHash]]){
  if(!state)continue;assert.equal(gear.gameplayHash(state),hash,label+' canonical hash');
  if(state.pacing){const values={};for(const key of ['lastTs','dayMinutes','totalMin']){values[key]=state.pacing[key];delete state.pacing[key];}excluded.push({arm,path:label+'.pacing',values});}
 }
 return copy;
}
assert.deepEqual(canonical(on,'on'),canonical(off,'off'),'Canonical state, outcomes, all metrics, observed context and RNG/clock histories must match');
const a=read(prefix+'on-storage.json'),b=read(prefix+'off-storage.json');assert.equal(a.storageDigest,b.storageDigest,'Raw final storage differs');assert.deepEqual(a.opportunities,b.opportunities);
for(const kind of ['late','fight','table'])assert.ok(a.captured.includes(kind),'Missing natural '+kind+' save');
fs.writeFileSync('evidence/2026-10-20/caregiver-terminal-persist-neutrality-r2.json',JSON.stringify({canonicalExact:true,rawFinalStorageExact:true,fields:Object.keys(on),captured:a.captured,opportunities:a.opportunities,terminal:on.terminal,excluded,
 scope:'The raw r1 equality check correctly exposed wall-clock pacing diagnostics. Only the three existing gameplayHash exclusions are removed here, at final/bridge state; every other field and all observed RNG/clock histories remain exact. Raw child reports are preserved. This does not claim byte-identical raw Game state.'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({canonicalExact:true,storageExact:true,terminal:on.terminal,saves:a.captured}));
