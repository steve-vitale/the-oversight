'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto'),S=require('../../scripts/lib/balance-scorecard');
const base='evidence/2026-10-20/',read=n=>JSON.parse(z.gunzipSync(fs.readFileSync(base+n+'.json.gz'))),seeds=[10001,10003,10004,10008],inputs={};
const get=n=>{inputs[n]=crypto.createHash('sha256').update(fs.readFileSync(base+n+'.json.gz')).digest('hex');return read(n);};
const haven=get('caregiver-terminal-haven-r3'),current=get('caregiver-terminal-current-r3'),wait=get('caregiver-terminal-current-public-wait-r4'),final=get('caregiver-terminal-current-ui-r5'),old150=get('haven-access-holdout-after-r2'),old600=get('garden-longplay-r3'),garden=get('garden-cultivation-natural-r1');
const find=(a,s,c)=>a.results.find(x=>x.seed===s&&x.cap===c&&x.job.trace===1);
const checks=[];
for(const [name,r]of Object.entries({haven,current,wait,final})){
 assert.equal(r.stable,true);assert.equal(r.neutral.length,8);assert(r.neutral.every(x=>x.match));assert.equal(r.prefixes.length,4);assert(r.prefixes.every(x=>x.ok));
 for(const x of r.results)for(const k of ['warnings','hookErrors','traceErrors','entropyErrors'])assert.equal(x[k].length,0,name+'/'+k);
 for(const s of seeds){const x=find(r,s,600);assert.equal(x.terminal.engineOver,true);assert.equal(x.terminal.watchdogRoutes,0);assert.equal(Object.keys(x.observation.metrics).length,23);}
 checks.push({arm:name,stable:true,neutralControls:8,exactPrefixes:4,engineTerminalCases:4});
}
const replay=[];
for(const s of seeds){
 const h150=find(haven,s,150),h600=find(haven,s,600),g600=find(current,s,600);
 const panel=old150.rows.find(x=>x.row.seed===s),long=old600.results.find(x=>x.job.seed===s&&x.job.policy==='caregiver'&&x.job.days===600&&x.job.observe===1),ng=garden.results.find(x=>x.job.seed===s&&x.job.policy==='caregiver'&&x.job.days===600&&x.job.observe===1);
 for(const [a,b,label]of [[h150,panel,'historical150'],[h600,long,'historical600'],[g600,ng,'garden600']]){
  assert.equal(a.stateHash,b.stateHash,s+'/'+label+'/state');assert.deepEqual(a.row,b.row,s+'/'+label+'/row');assert.deepEqual(a.observation.metrics,b.metrics,s+'/'+label+'/metrics');if(b.rngTail)assert.deepEqual(a.rngTail,b.rngTail);
  replay.push({seed:s,reference:label,state:true,row:true,all23:true,rngTail:!!b.rngTail});
 }
 for(const c of [150,600])for(const arm of [wait,final]){const a=find(current,s,c),b=find(arm,s,c);assert.equal(a.stateHash,b.stateHash);assert.deepEqual(a.observation.metrics,b.observation.metrics);assert.deepEqual(a.rngTail,b.rngTail);assert.equal(b.terminal.driverForcedTurns,0);}
}
const before=get('caregiver-terminal-wait-before-r1'),after=get('caregiver-terminal-wait-after-r1');
assert.equal(before.validity.sourcesStable,true);assert.equal(after.validity.sourcesStable,true);assert.deepEqual(before.options,after.options);
const changed=Object.keys(before.sources).filter(k=>before.sources[k]!==after.sources[k]);assert.deepEqual(changed,['scripts/sim-harness.js']);
for(const p of [before,after]){assert(p.validity.neutrality.every(n=>n.match&&!n.warnings));for(const r of p.rows){assert.equal(r.warnings.length,0);assert.equal(r.observerErrors.length,0);assert.equal(r.gear.errors.length,0);}}
assert.equal(before.rows.length,64);assert.equal(after.rows.length,64);
const bm=new Map(before.rows.map(x=>[x.row.policy+':'+x.row.seed,x]));
for(const a of after.rows){const b=bm.get(a.row.policy+':'+a.row.seed);assert.equal(a.stateHash,b.stateHash);assert.deepEqual(a.metrics,b.metrics);}
const method={scope:'Harness-methodology correction, not a Game balance comparison. Only public Wait replaces direct internal turn mutation. Existing policies/Game are identical.',changedSources:changed,completeGameStateMatches:64,all23MetricVectorsMatch:64,neutralControlsPerArm:4,standardComparator:S.comparePanels(before,after),policies:after.options.policies.map(policy=>{const rows=after.rows.filter(r=>r.row.policy===policy);return{policy,cases:rows.length,metrics:S.contract.metrics.map(m=>S.compareMetric(rows.map(a=>bm.get(a.row.policy+':'+a.row.seed).metrics[m.id]),rows.map(a=>a.metrics[m.id]),m,policy+'/'+m.id))};})};
assert.equal(method.standardComparator.decision,'invalid');assert(method.standardComparator.errors.some(e=>e.includes('Policy/harness changed: scripts/sim-harness.js')));
const outcomes=seeds.map(seed=>({seed,historical:find(haven,seed,600).terminal,releasedGarden:find(current,seed,600).terminal,final:find(final,seed,600).terminal}));
const out={scope:'Four preselected diagnostic caregiver cases, not independent win-rate or garden viability evidence. Actual engine endings, faithful cap extension, observer neutrality and public Wait control. Existing balanced warnings stay open.',inputs,checks,replay,outcomes,method};
fs.writeFileSync(base+'caregiver-terminal-summary-r1.json',JSON.stringify(out,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({checks,replays:replay.length,outcomes,method:{cases:64,changedSources:changed,standardComparator:method.standardComparator.decision}},null,2));
