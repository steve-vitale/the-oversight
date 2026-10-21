// Read retained reports; never runs Game or rewrites historical evidence.
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict');
const path=require('path'),root=path.resolve(__dirname,'../..');
const gear=require(path.join(root,'scripts/gear-usage-audit'));
const read=n=>JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'solo-campaign-'+n+'-r1.json.gz'))));
const before=read('before'),after=read('after');
assert.equal(before.observerDigest,after.observerDigest);
assert.equal(before.contractDigest,after.contractDigest);
const changed=Object.keys(after.sources).filter(k=>after.sources[k]!==before.sources[k]);
assert.deepEqual(changed.sort(),['scripts/sim-harness.js','scripts/sweep-compare.js']);
for(const p of [before,after]){
 assert.equal(p.rows.length,64);assert(p.validity.sourcesStable);
 assert.equal(p.validity.neutrality.length,4);assert(p.validity.neutrality.every(x=>x.match&&!x.warnings));
 assert(p.rows.every(x=>!x.observerErrors.length));
}
let stateDifferences=0;
for(let i=0;i<64;i++){
 const a=before.rows[i],b=after.rows[i];
 assert.equal(a.row.policy,b.row.policy);assert.equal(a.row.seed,b.row.seed);
 assert.deepEqual(a.metrics,b.metrics);assert.equal(Object.keys(a.metrics).length,23);
 if(a.stateHash!==b.stateHash)stateDifferences++;
}
const audits=['regression-before','regression-after','boundary-after'].map(read);
for(const a of audits){
 assert(a.stable);assert(a.neutral.every(x=>x.match));assert(a.prefixes.every(x=>x.ok&&x.finalMatches));
 for(const r of a.results){
  assert.equal(gear.gameplayHash(r.finalState),r.stateHash);
  if(r.bridge)assert.equal(gear.gameplayHash(r.bridge.state),r.bridge.stateHash);
  for(const k of ['warnings','hookErrors','traceErrors','entropyErrors'])assert.equal(r[k].length,0);
  assert.equal(r.terminal.watchdogRoutes,0);assert.equal(r.terminal.driverForcedTurns,0);
 }
}
const pick=(a,cap)=>a.results.find(r=>r.job.cap===cap&&r.job.trace===1);
const old=pick(audits[0],600),current=pick(audits[1],600),boundary=pick(audits[2],600);
assert.equal(old.terminal.engineOver,false);assert.equal(old.terminal.day,162);
assert.equal(current.terminal.engineOver,true);assert.equal(current.terminal.day,164);
assert.equal(old.observation.metrics.communityLost,1);assert.equal(current.observation.metrics.communityLost,1);
const diff=[];
function walk(a,b,p=''){
 if(JSON.stringify(a)===JSON.stringify(b))return;
 if(a&&b&&typeof a==='object'&&typeof b==='object'){
  for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],p+'/'+k);
 }else diff.push({path:p,before:a,after:b});
}
walk(old.finalState,boundary.bridge.state);
const substantive=diff.filter(x=>!/^\/pacing\/(lastTs|dayMinutes|totalMin)(\/|$)/.test(x.path));
assert.equal(substantive.length,5);
assert(substantive.every(x=>/^\/village\/agency\/(know|xp|tier|scars|stats)\/gen_5t6xco7$/.test(x.path)&&x.after===undefined));
assert.notEqual(old.stateHash,boundary.bridge.stateHash);
const report={changed,pairedCases:64,metrics:23,allMetricsIdentical:true,stateDifferences,
 named:{old:old.terminal,current:current.terminal,oldCommunityLost:1,currentCommunityLost:1},
 cutoffBoundary:{crossHarnessEquivalent:false,oldHash:old.stateHash,newHash:boundary.bridge.stateHash,differences:diff,
 interpretation:'Five substantive agency-default writes removed; remaining differences are preexisting wall-clock diagnostics. No new hash exclusions. Exact continuation prefix is proved within each source revision, not across revisions.'},
 auditControls:audits.map(a=>({neutral:a.neutral,prefixes:a.prefixes}))};
const out=path.join(__dirname,'solo-campaign-review-r1.json');
const text=JSON.stringify(report,null,2)+'\n';
if(fs.existsSync(out))assert.equal(fs.readFileSync(out,'utf8'),text);else fs.writeFileSync(out,text,{flag:'wx'});
console.log('Verified 64 matched cases/all23; '+stateDifferences+' state differences; real day164 loss; cutoff diff retained.');
