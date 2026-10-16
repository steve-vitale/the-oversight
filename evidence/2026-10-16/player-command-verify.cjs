'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert');
const dir=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=n=>JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir,'player-command-'+n+'.json.gz'))));
const receipt=JSON.parse(fs.readFileSync(path.join(dir,'player-command-receipt.json')));
for(const [name,hash] of Object.entries(receipt.files))assert.strictEqual(sha(fs.readFileSync(path.join(dir,name))),hash,name);
const before=read('before-panel'),after=read('after-panel'),bundle=read('sources');
const proof=Buffer.from(bundle.proof.base64,'base64');assert.strictEqual(sha(proof),bundle.proof.sha256);
for(const [name,h] of Object.entries(receipt.normalizedTests)){
 const b=name==='scripts/godpath/test-player-command-turns.js'?proof:Buffer.from(bundle.files[name].after.base64,'base64');assert.strictEqual(sha(b.toString().replace(/\r\n/g,'\n')),h,name);
 if(process.argv.includes('--current'))assert.strictEqual(sha(fs.readFileSync(path.join(dir,'../../',name),'utf8').replace(/\r\n/g,'\n')),h,name);
}
assert.deepStrictEqual(Object.keys(after.sources).filter(n=>before.sources[n]!==after.sources[n]).sort(),['src/js/app.js','src/js/game.js','src/js/godpath.js','src/js/godverbs.js']);
assert.strictEqual(before.observerDigest,after.observerDigest);assert.strictEqual(before.contractDigest,after.contractDigest);
for(const [arm,p] of [['before',before],['after',after]]){
 assert.strictEqual(p.rows.length,256);assert(p.validity.sourcesStable);assert(p.validity.neutrality.every(n=>n.match&&!n.warnings));assert.strictEqual(sha(JSON.stringify(p.sources)),p.sourceDigest);
 const jobs=read(arm+'-jobs');assert.strictEqual(jobs.length,260);
 for(const j of jobs){assert.strictEqual(j.key,sha(JSON.stringify(j.identity)));assert.strictEqual(j.resultDigest,sha(JSON.stringify(j.result)));assert.strictEqual(j.identity.sourceDigest,p.sourceDigest);assert.strictEqual(j.identity.observerDigest,p.observerDigest);assert.strictEqual(j.identity.contractDigest,p.contractDigest);}
 for(const r of p.rows){const j=jobs.find(j=>j.identity.observe==='1'&&j.identity.policy===r.row.policy&&j.identity.seed===r.row.seed);assert.deepStrictEqual(j.result,r);assert.strictEqual(Object.keys(r.metrics).length,23);assert(!r.warnings.length&&!r.observerErrors.length&&!r.gear.errors.length);}
 for(const [name,arms] of Object.entries(bundle.files)){const b=Buffer.from(arms[arm].base64,'base64');assert.strictEqual(sha(b),arms[arm].sha256);if(p.sources[name])assert.strictEqual(sha(b.toString().replace(/\r\n/g,'\n')),p.sources[name]);}
}
const changed=[];for(const b of before.rows){const r=after.rows.find(x=>x.row.policy===b.row.policy&&x.row.seed===b.row.seed);assert.deepStrictEqual(r.row,b.row);assert.deepStrictEqual(r.metrics,b.metrics);if(r.stateHash!==b.stateHash)changed.push({policy:r.row.policy,seed:r.row.seed});}
assert.strictEqual(changed.length,12);
// Frozen gameplay hash v2, independent of future observer revisions.
const gameplayHash=state=>{const s=JSON.parse(JSON.stringify(state));if(s.pacing)for(const k of ['lastTs','dayMinutes','totalMin'])delete s.pacing[k];return sha(JSON.stringify(s));};
for(const c of changed){const traces={};for(const [arm,p] of [['before',before],['after',after]]){const t=read('trace-'+arm+'-'+c.policy+'-'+c.seed),r=p.rows.find(r=>r.row.policy===c.policy&&r.row.seed===c.seed);assert.strictEqual(t.sourceDigest,p.sourceDigest);assert.strictEqual(gameplayHash(t.state),r.stateHash);assert.strictEqual(t.stateHash,r.stateHash);assert.deepStrictEqual(t.row,r.row);assert.deepStrictEqual(t.metrics,r.metrics);assert(!t.calls.some(c=>c.name==='tbCommandPlayer'));traces[arm]=JSON.parse(JSON.stringify(t.state));}
 for(const t of Object.values(traces))if(t.pacing)for(const k of ['lastTs','dayMinutes','totalMin'])delete t.pacing[k];
 for(const k of ['playerCommands','playerCommandReturn','godVerbs','godpathUses','godpathVillagerUses'])delete traces.after.run.tbfight[k];assert.deepStrictEqual(traces.after,traces.before);
}
for(const arm of ['before','after']){const p=read(arm+'16-panel'),full=arm==='before'?before:after;assert.strictEqual(p.rows.length,64);for(const r of p.rows)assert.deepStrictEqual(r,full.rows.find(x=>x.row.policy===r.row.policy&&x.row.seed===r.row.seed));}
const proto=read('prototype-panel'),protoJobs=read('prototype-jobs'),protoBundle=read('prototype-sources');assert.strictEqual(protoJobs.length,260);
assert.strictEqual(proto.observerDigest,after.observerDigest);assert.strictEqual(proto.contractDigest,after.contractDigest);assert.strictEqual(sha(JSON.stringify(proto.sources)),proto.sourceDigest);assert(proto.validity.sourcesStable&&proto.validity.neutrality.every(n=>n.match&&!n.warnings));
assert.deepStrictEqual(Object.keys(after.sources).filter(n=>after.sources[n]!==proto.sources[n]),['src/js/game.js']);
for(const j of protoJobs){assert.strictEqual(j.key,sha(JSON.stringify(j.identity)));assert.strictEqual(j.resultDigest,sha(JSON.stringify(j.result)));assert.strictEqual(j.identity.sourceDigest,proto.sourceDigest);assert.strictEqual(j.identity.observerDigest,proto.observerDigest);assert.strictEqual(j.identity.contractDigest,proto.contractDigest);}
for(const r of proto.rows){const f=after.rows.find(f=>f.row.policy===r.row.policy&&f.row.seed===r.row.seed);assert.deepStrictEqual(r.row,f.row);assert.strictEqual(r.stateHash,f.stateHash);assert.deepStrictEqual(r.metrics,f.metrics);}
for(const n of ['src/js/app.js','src/js/game.js','src/js/godpath.js','src/js/godverbs.js'])assert.strictEqual(sha(Buffer.from(protoBundle.files[n].after.base64,'base64').toString().replace(/\r\n/g,'\n')),proto.sources[n]);
const cursor=read('cursor-only-panel'),cursorJobs=read('cursor-only-jobs'),cursorBundle=read('cursor-only-sources');assert.strictEqual(cursorJobs.length,260);assert.strictEqual(cursor.observerDigest,after.observerDigest);assert.strictEqual(cursor.contractDigest,after.contractDigest);assert(cursor.validity.sourcesStable&&cursor.validity.neutrality.every(n=>n.match&&!n.warnings));
for(const j of cursorJobs){assert.strictEqual(j.key,sha(JSON.stringify(j.identity)));assert.strictEqual(j.resultDigest,sha(JSON.stringify(j.result)));assert.strictEqual(j.identity.sourceDigest,cursor.sourceDigest);}
for(const r of cursor.rows){const f=after.rows.find(f=>f.row.policy===r.row.policy&&f.row.seed===r.row.seed);assert.deepStrictEqual(r.row,f.row);assert.strictEqual(r.stateHash,f.stateHash);assert.deepStrictEqual(r.metrics,f.metrics);}
for(const n of ['src/js/app.js','src/js/game.js','src/js/godpath.js','src/js/godverbs.js'])assert.strictEqual(sha(Buffer.from(cursorBundle.files[n].after.base64,'base64').toString().replace(/\r\n/g,'\n')),cursor.sources[n]);
console.log('Verified receipt, 1040 baseline/prototype/cursor/final jobs, unchanged 256 paired outcomes/metrics and all12 final hash changes as saved combat metadata (24 neutral replays).');
