'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto');
const B=require('../../scripts/balance-panel'),S=require('../../scripts/lib/balance-scorecard'),H=require('../../scripts/lib/harness-comparison'),G=require('../../scripts/summarize-garden-accounting');
const prefix='evidence/2026-10-21/garden-transfer-',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f)));
const roots=require('./garden-transfer-roots-r1.json');
const retained='evidence/2026-10-21/solo-campaign-after-r1.json.gz',before=read(retained),afterFile='.balance-garden-transfer-after-r1/panel.json.gz',after=read(afterFile);
assert.deepEqual(before.sources,roots.before.sources);assert.deepEqual(after.sources,roots.after.sources);
for(const p of [before,after]){assert(p.validity.sourcesStable);assert(p.validity.neutrality.every(c=>c.match&&!c.warnings));assert.equal(p.validity.neutrality.length,4);assert.equal(p.rows.length,64);}
assert.equal(before.observerDigest,after.observerDigest);assert.equal(before.contractDigest,after.contractDigest);
const file='scripts/policies/competent.js',changes={[file]:{before:before.sources[file],after:after.sources[file]}};
const balanced=H.compareHarnessRevision(before,after,{reason:'Truthful physical donation receipts, safe food reserves and whole-stack capacity decisions on unchanged Game. Controller methodology, not a Game balance lever.',changes});
assert.notEqual(balanced.decision,'invalid');
const old=read(prefix+'long-before-r1.json.gz'),current=read(prefix+'long-after-r1.json.gz');
for(const r of [old,current]){
 G.validate(r);assert.equal(r.plan.jobs.length,82);assert.equal(r.controls.length,8);
 for(const x of r.results){
  assert.equal(x.donationObservation?.errors.length||0,0);
  if(x.job.observe){const d=x.donationObservation;assert(d);assert.equal(d.events.length,d.transfers);assert.equal(d.events.reduce((n,e)=>n+e.kcal,0),d.kcal);assert.equal(d.attempts,d.transfers+d.refusals+d.discardedWithoutCredit);}
  else {const on=r.results.find(a=>a.job.observe&&a.job.policy===x.job.policy&&a.job.seed===x.job.seed&&a.job.days===x.job.days);assert.deepEqual(x.donationCounters,on.donationCounters);}
 }
}
for(const key of ['identity','toolHashes','configuration','jobs','comparisonExclusions'])assert.deepEqual(old.plan[key],current.plan[key]);
assert.deepEqual(old.plan.sources,roots.before.sources);assert.deepEqual(current.plan.sources,roots.after.sources);
for(const f of Object.keys(old.plan.sources).filter(f=>f!==file))assert.equal(old.plan.sources[f],current.plan.sources[f],f);
function donations(r){
 const rows=r.results.filter(x=>x.job.observe),sum=k=>rows.reduce((n,x)=>n+x.donationObservation[k],0);
 return{cases:rows.length,attempts:sum('attempts'),physicalTransfers:sum('transfers'),actualKcal:sum('kcal'),refusals:sum('refusals'),discardedWithoutCredit:sum('discardedWithoutCredit'),
  claimedCount:rows.reduce((n,x)=>n+(x.donationCounters.donated??0),0),
  disagreements:rows.filter(x=>(x.donationCounters.donated??0)!==x.donationObservation.transfers).map(x=>({job:x.job,claimed:x.donationCounters.donated,observed:x.donationObservation.transfers})),
  calorieDisagreements:rows.filter(x=>x.donationObservation.transfers>0&&x.donationCounters.donatedKcal!==x.donationObservation.kcal).map(x=>({job:x.job,claimed:x.donationCounters.donatedKcal,observed:x.donationObservation.kcal}))};
}
const donationBefore=donations(old),donationAfter=donations(current);
assert.deepEqual(donationAfter.disagreements,[]);assert.deepEqual(donationAfter.calorieDisagreements,[]);
assert(current.results.every(x=>!x.donationCounters.donationErrors));
const longMetrics=[];
for(const policy of ['capable','maker','merchant','caregiver'])for(const cap of [150,600]){
 const a=current.results.filter(x=>x.job.observe&&x.job.policy===policy&&x.job.days===cap),b=old.results.filter(x=>x.job.observe&&x.job.policy===policy&&x.job.days===cap);
 const bySeed=new Map(b.map(x=>[x.job.seed,x]));
 longMetrics.push({policy,cap,cases:a.length,metrics:S.contract.metrics.map(m=>S.compareMetric(a.map(x=>bySeed.get(x.job.seed).metrics[m.id]),a.map(x=>x.metrics[m.id]),m,policy+'/'+cap+'/'+m.id))});
}
const adverse=[];
for(const a of after.rows){const b=before.rows.find(x=>x.row.policy===a.row.policy&&x.row.seed===a.row.seed);if(a.metrics.won!==b.metrics.won)adverse.push({policy:a.row.policy,seed:a.row.seed,before:b.metrics,after:a.metrics});}
const report={scope:balanced.reason,baselineReuse:{file:retained,sha256:sha(fs.readFileSync(retained)),sameSources:true,sameObserver:true,sameContract:true},balancedDecision:balanced.decision,
 donations:{before:donationBefore,after:donationAfter},gardens:{before:G.summarize(old),after:G.summarize(current)},longMetrics,winFlips:adverse,
 extendedEndings:{before:old.results.filter(x=>x.job.observe&&x.job.days===600).map(x=>({job:x.job,terminal:x.terminal})),after:current.results.filter(x=>x.job.observe&&x.job.days===600).map(x=>({job:x.job,terminal:x.terminal}))},
 limitations:['No small-effect confirmation or pacifist/build-specific viability claim.','Whole-stack public action remains; partial donation is a player-facing follow-up.','Output/spoilage/consumption/reserve debits and labor are separate quantities, not net profit.','Observer receipt coverage is direct donateToPantry calls; other gifts and pantry production are outside it.']};
function save(file,value){const data=typeof value==='string'?value:JSON.stringify(value,null,2)+'\n';if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8'),data);else fs.writeFileSync(file,data,{flag:'wx'});}
for(const [arm,p]of [['before',retained],['after',afterFile]]){const f=prefix+arm+'-r1.json.gz',data=fs.readFileSync(p);if(fs.existsSync(f))assert(fs.readFileSync(f).equals(data));else fs.writeFileSync(f,data,{flag:'wx'});}
save(prefix+'balanced-r1.json',balanced);save(prefix+'balanced-r1.md',S.markdown(balanced));save(prefix+'review-r1.json',report);
console.log(JSON.stringify({decision:balanced.decision,donations:report.donations,extended:report.extendedEndings.after.map(x=>x.terminal)},null,2));
