'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto'),gear=require('../../scripts/gear-usage-audit'),B=require('../../scripts/balance-panel');
const base='evidence/2026-10-20/',inputs={},read=n=>{const bytes=fs.readFileSync(base+n+'.json.gz');inputs[n]=crypto.createHash('sha256').update(bytes).digest('hex');return JSON.parse(z.gunzipSync(bytes));};
const before=read('overnight-save-terminal-before-r3'),after=read('overnight-save-terminal-r3');
for(const r of [before,after]){assert(r.stable);assert(r.neutral.every(n=>n.match));assert(r.prefixes.every(p=>p.ok));for(const x of r.results){assert.equal(gear.gameplayHash(x.finalState),x.stateHash);if(x.bridge)assert.equal(gear.gameplayHash(x.bridge.state),x.bridge.stateHash);assert.deepEqual(x.observer,r.plan.observer);for(const k of ['warnings','hookErrors','traceErrors','entropyErrors'])assert.equal(x[k].length,0);}}
assert.deepEqual(before.plan.observer,after.plan.observer);assert.deepEqual(B.manifest(process.cwd()),after.plan.sources);
const diff=(a,b,p,out)=>{if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object')for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'.'+k,out);else out.push(p);};
const paired=[];
for(const a of after.results.filter(r=>r.job.trace===1)){const b=before.results.find(r=>r.seed===a.seed&&r.cap===a.cap&&r.job.trace===1),paths=[];diff(b.finalState,a.finalState,'state',paths);
 assert(paths.every(p=>p==='state.saveSeq'||/^state\.pacing\.(lastTs|dayMinutes|totalMin)(\.|$)/.test(p)),JSON.stringify(paths));assert.deepEqual(a.observation.metrics,b.observation.metrics);assert.deepEqual(a.rngTail,b.rngTail);assert.deepEqual(a.terminal,b.terminal);
 paired.push({seed:a.seed,cap:a.cap,terminal:a.terminal,all23Exact:true,rngTailExact:true,fullStateHashesEqual:a.stateHash===b.stateHash,changedPaths:paths});
}
const pb=read('overnight-save-before-r2'),pa=read('overnight-save-after-r2'),bm=new Map(pb.rows.map(x=>[x.row.policy+':'+x.row.seed,x]));
assert.deepEqual(pb.options,pa.options);assert.equal(pa.rows.length,64);assert.equal(pb.rows.length,64);assert.equal(pa.observerDigest,pb.observerDigest);
for(const p of [pa,pb]){assert(p.validity.sourcesStable);assert(p.validity.neutrality.every(x=>x.match&&!x.warnings));for(const r of p.rows){assert.equal(Object.keys(r.metrics).length,23);assert.equal(r.warnings.length,0);assert.equal(r.observerErrors.length,0);assert.equal(r.gear.errors.length,0);}}
for(const a of pa.rows)assert.deepEqual(a.metrics,bm.get(a.row.policy+':'+a.row.seed).metrics);
const prior=read('caregiver-terminal-current-ui-r5'),pilot=read('overnight-save-terminal-r1');
const corruption=[['prior caregiver r5',prior],['overnight pilot r1',pilot]].map(([report,r])=>({report,badRawStates:r.results.filter(x=>gear.gameplayHash(x.finalState)!==x.stateHash).map(x=>({seed:x.seed,cap:x.cap,trace:x.job.trace})),scope:'Historical raw-state transport damage; original child scalar hashes remain unedited. Final r3 recollects both exact Game roots with UTF-8 decoding and payload hash verification.'}));
const result={inputs,scope:'Current final-source paired time-persistence correctness study, not general balance or public-launch clearance. No whole-state equivalence claim: saveSeq legitimately changes; only three existing pacing clock fields are additionally excluded in the path audit.',paired,panels:{casesPerArm:64,metricsPerCase:23,identicalVectors:64,neutralControlsPerArm:4,observerDigest:pa.observerDigest,seeds:pa.options.seeds},corruption};
fs.writeFileSync(base+'overnight-save-summary-r1.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({pairs:paired.length,terminal:paired.filter(x=>x.cap===600).map(x=>({seed:x.seed,...x.terminal})),screen:result.panels,corruption},null,2));
