'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert');
const dir=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=n=>JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir,'god-support-'+n+'.json.gz'))));
const receipt=JSON.parse(fs.readFileSync(path.join(dir,'god-support-receipt.json')));
for(const [name,hash] of Object.entries(receipt.files))assert.strictEqual(sha(fs.readFileSync(path.join(dir,name))),hash,name);
assert.strictEqual(sha(fs.readFileSync(path.join(dir,'../../scripts/godpath/test-god-support-player.js'),'utf8').replace(/\r\n/g,'\n')),receipt.proofNormalizedSha256);
const before=read('before-panel'),after=read('after-panel'),bundle=read('sources');
assert.deepStrictEqual(Object.keys(after.sources).filter(n=>before.sources[n]!==after.sources[n]).sort(),['src/js/game.js','src/js/godverbs.js']);
assert.strictEqual(before.observerDigest,after.observerDigest);assert.strictEqual(before.contractDigest,after.contractDigest);
for(const [arm,p] of [['before',before],['after',after]]){
 assert.strictEqual(p.rows.length,256);assert(p.validity.sourcesStable);assert(p.validity.neutrality.every(n=>n.match&&!n.warnings));
 const jobs=read(arm+'-jobs');assert.strictEqual(jobs.length,260);
 for(const j of jobs){assert.strictEqual(j.key,sha(JSON.stringify(j.identity)));assert.strictEqual(j.resultDigest,sha(JSON.stringify(j.result)));assert.strictEqual(j.identity.sourceDigest,p.sourceDigest);assert.strictEqual(j.identity.observerDigest,p.observerDigest);assert.strictEqual(j.identity.contractDigest,p.contractDigest);}
 for(const r of p.rows){const j=jobs.find(j=>j.identity.observe==='1'&&j.identity.policy===r.row.policy&&j.identity.seed===r.row.seed);assert.deepStrictEqual(j.result,r);}
 for(const [name,arms] of Object.entries(bundle.files)){const b=Buffer.from(arms[arm].base64,'base64');assert.strictEqual(sha(b),arms[arm].sha256);assert.strictEqual(sha(b.toString().replace(/\r\n/g,'\n')),p.sources[name]);}
}
for(const b of before.rows){const r=after.rows.find(x=>x.row.policy===b.row.policy&&x.row.seed===b.row.seed);assert.deepStrictEqual(r.row,b.row);assert.strictEqual(r.stateHash,b.stateHash);assert.deepStrictEqual(r.metrics,b.metrics);}
let failed=0;for(const file of ['god-support-legacy-pairs.json','god-support-legacy-more.json']){const pairs=JSON.parse(fs.readFileSync(path.join(dir,file)));for(const b of pairs.filter(r=>r.arm==='before')){const a=pairs.find(r=>r.arm==='after'&&r.seed===b.seed);assert.deepStrictEqual({status:a.status,stdout:a.stdout,stderr:a.stderr},{status:b.status,stdout:b.stdout,stderr:b.stderr});if(b.status)failed++;}}
assert.strictEqual(failed,4);
console.log('Verified receipt, 520 jobs, 256 matching paired rows/final hashes/metric sets and 160 legacy controls (4 matched failures).');
