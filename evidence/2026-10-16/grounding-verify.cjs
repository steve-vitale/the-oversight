'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert'),cp=require('child_process');
const base=__dirname,repo=path.resolve(base,'../..'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=n=>JSON.parse(z.gunzipSync(fs.readFileSync(path.join(base,'grounding-'+n+'.json.gz'))));
const receipt=JSON.parse(fs.readFileSync(path.join(base,'grounding-receipt.json')));
assert(Object.keys(receipt.files).length>=40);
for(const [file,hash] of Object.entries(receipt.files))assert.strictEqual(sha(fs.readFileSync(path.join(base,file))),hash,file);
const before=read('before-panel'),after=read('after-panel'),bundle=read('sources');
assert.strictEqual(before.rows.length,256);assert.strictEqual(after.rows.length,256);
assert.strictEqual(before.observerDigest,after.observerDigest);assert.strictEqual(before.contractDigest,after.contractDigest);
assert.deepStrictEqual(before.options,after.options);
assert.strictEqual(Object.keys(before.sources).length,207);assert.deepStrictEqual(Object.keys(before.sources),Object.keys(after.sources));
assert.deepStrictEqual(Object.keys(after.sources).filter(f=>before.sources[f]!==after.sources[f]),['src/js/game.js','src/js/godverbs.js','src/js/table.js','src/js/villager-agency.js','src/js/villager-build.js']);
for(const [file,arms] of Object.entries(bundle.files))for(const [arm,rec] of Object.entries(arms)){const bytes=Buffer.from(rec.base64,'base64');assert.strictEqual(sha(bytes),rec.sha256);const p=arm==='before'?before:after;if(p.sources[file])assert.strictEqual(rec.sha256,p.sources[file]);}
for(const [arm,p] of [['before',before],['after',after]]){
 assert.strictEqual(sha(JSON.stringify(p.sources)),p.sourceDigest);assert(p.validity.sourcesStable&&p.validity.neutrality.every(x=>x.match&&!x.warnings));
 const jobs=read(arm+'-jobs');assert.strictEqual(jobs.length,260);assert.strictEqual(new Set(jobs.map(j=>j.key)).size,260);
 for(const j of jobs){assert.strictEqual(j.key,sha(JSON.stringify(j.identity)));assert.strictEqual(j.resultDigest,sha(JSON.stringify(j.result)));assert.strictEqual(j.identity.sourceDigest,p.sourceDigest);assert.strictEqual(j.identity.observerDigest,p.observerDigest);assert.strictEqual(j.identity.contractDigest,p.contractDigest);}
 for(const off of jobs.filter(j=>j.identity.observe==='0')){const on=jobs.find(j=>j.identity.observe==='1'&&j.identity.policy===off.identity.policy&&j.identity.seed===off.identity.seed);assert.strictEqual(on.result.stateHash,off.result.stateHash);assert.deepStrictEqual(on.result.row,off.result.row);assert(!off.result.warnings.length);}
 for(const row of p.rows){const job=jobs.find(j=>j.identity.observe==='1'&&j.identity.policy===row.row.policy&&j.identity.seed===row.row.seed);assert(job);assert.deepStrictEqual(job.result,row);assert(!row.warnings.length&&!row.observerErrors.length&&!row.gear.errors.length);}
 for(const row of read(arm+'16-panel').rows)assert.deepStrictEqual(row,p.rows.find(x=>x.row.policy===row.row.policy&&x.row.seed===row.row.seed));
 for(const [policy,seed] of [['merchant',2],['merchant',3],['caregiver',9]]){const trace=read('trace-'+arm+'-'+policy+'-'+seed),r=p.rows.find(x=>x.row.policy===policy&&x.row.seed===seed);assert.strictEqual(trace.sourceDigest,p.sourceDigest);assert.strictEqual(trace.stateHash,r.stateHash);assert.deepStrictEqual(trace.row,r.row);assert.deepStrictEqual(trace.metrics,r.metrics);assert(!trace.warnings.length);}
}
for(const arm of Object.keys(bundle.ablations)){
 const p=read(arm+'-panel'),jobs=read(arm+'-jobs'),overrides=bundle.ablations[arm].files;
 assert.strictEqual(p.rows.length,arm==='prototype'?256:1);assert.strictEqual(jobs.length,arm==='prototype'?260:2);assert.strictEqual(p.observerDigest,after.observerDigest);assert.strictEqual(p.contractDigest,after.contractDigest);assert.strictEqual(sha(JSON.stringify(p.sources)),p.sourceDigest);assert(p.validity.sourcesStable&&p.validity.neutrality.every(n=>n.match&&!n.warnings));
 assert.deepStrictEqual(Object.keys(p.sources).filter(f=>p.sources[f]!==after.sources[f]),Object.keys(overrides));
 for(const [name,rec] of Object.entries(overrides)){assert.strictEqual(sha(Buffer.from(rec.base64,'base64')),rec.sha256);assert.strictEqual(rec.sha256,p.sources[name]);}
 for(const j of jobs){assert.strictEqual(j.key,sha(JSON.stringify(j.identity)));assert.strictEqual(j.resultDigest,sha(JSON.stringify(j.result)));assert.strictEqual(j.identity.sourceDigest,p.sourceDigest);assert.strictEqual(j.identity.observerDigest,p.observerDigest);assert.strictEqual(j.identity.contractDigest,p.contractDigest);assert(!j.result.warnings.length);}
 for(const off of jobs.filter(j=>j.identity.observe==='0')){const on=jobs.find(j=>j.identity.observe==='1'&&j.identity.policy===off.identity.policy&&j.identity.seed===off.identity.seed);assert.strictEqual(on.result.stateHash,off.result.stateHash);assert.deepStrictEqual(on.result.row,off.result.row);}
 for(const r of p.rows)assert.deepStrictEqual(jobs.find(j=>j.identity.observe==='1'&&j.identity.policy===r.row.policy&&j.identity.seed===r.row.seed).result,r);
}
const prototype=read('prototype-panel');for(const row of read('prototype16-panel').rows)assert.deepStrictEqual(row,prototype.rows.find(x=>x.row.policy===row.row.policy&&x.row.seed===row.row.seed));
for(const seed of [2,3]){const trace=read('trace-prototype-merchant-'+seed),r=prototype.rows.find(x=>x.row.policy==='merchant'&&x.row.seed===seed);assert.strictEqual(trace.sourceDigest,prototype.sourceDigest);assert.strictEqual(trace.stateHash,r.stateHash);assert.deepStrictEqual(trace.row,r.row);assert.deepStrictEqual(trace.metrics,r.metrics);}
const original=before.rows.find(x=>x.row.policy==='merchant'&&x.row.seed===2),control=read('clock-control-panel').rows[0];assert.deepStrictEqual(control.row,original.row);assert.deepStrictEqual(control.metrics,original.metrics);
if(process.argv.includes('--current')){const B=require(path.join(repo,'scripts/balance-panel'));assert.deepStrictEqual(B.manifest(repo),after.sources);for(const [name,rec] of Object.entries(bundle.files))assert.strictEqual(sha(fs.readFileSync(path.join(repo,name),'utf8').replace(/\r\n/g,'\n')),rec.after.sha256);cp.execFileSync(process.execPath,['scripts/godpath/test-grounding-person.js'],{cwd:repo,stdio:'inherit'});}
console.log('Verified receipt, five changed runtime inputs,792 retained campaign jobs,16-seed subsets, eight neutral named replays and clock-control outcome.');
