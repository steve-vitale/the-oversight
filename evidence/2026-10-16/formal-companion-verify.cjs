'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert');
const dir=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=n=>JSON.parse(n.endsWith('.gz')?z.gunzipSync(fs.readFileSync(path.join(dir,n))):fs.readFileSync(path.join(dir,n)));
const receipt=read('formal-companion-receipt.json');
for(const [name,h]of Object.entries(receipt.artifacts)){
  const b=fs.readFileSync(path.join(dir,name)),bytes=/\.(gz|jpg)$/.test(name)?b:Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));
  assert.strictEqual(sha(bytes),h,name);
}
const bundle=read('formal-companion-sources.json.gz'),jobs=read('formal-companion-jobs.json.gz');
assert.strictEqual(bundle.baseCommit,'ecba851d592addc47f50d821634785bf58af1133');
for(const r of Object.values({...bundle.arms.after,...bundle.proof}))assert.strictEqual(sha(r.content),r.sha256);
const panels=Object.fromEntries(['before','after'].map(a=>[a,read(`formal-companion-${a}-panel.json.gz`)]));
assert.strictEqual(jobs.length,520);assert.strictEqual(new Set(jobs.map(j=>j.key)).size,520);
for(const [arm,p]of Object.entries(panels)){
  assert.strictEqual(p.rows.length,256);assert.strictEqual(Object.keys(p.sources).length,207);
  assert(p.validity.sourcesStable&&p.validity.neutrality.every(x=>x.match&&!x.warnings));
  assert.deepStrictEqual(p.sources,bundle.manifests[arm]);
  assert.strictEqual(p.sourceDigest,sha(JSON.stringify(p.sources)));
  const screen=read(`formal-companion-${arm}16-panel.json.gz`);
  for(const r of screen.rows)assert.deepStrictEqual(r,p.rows.find(t=>t.row.policy===r.row.policy&&t.row.seed===r.row.seed));
  const fresh=read(`formal-companion-fresh-${arm}-panel.json.gz`),r=p.rows.find(x=>x.row.policy==='maker'&&x.row.seed===7);
  assert.strictEqual(fresh.sourceHeadStart,null);assert.strictEqual(fresh.sourceHeadEnd,null);
  assert.strictEqual(fresh.sourceDigest,p.sourceDigest);assert(fresh.validity.sourcesStable&&fresh.validity.neutrality.every(x=>x.match&&!x.warnings));
  assert.deepStrictEqual(fresh.rows[0],r);
  const short=read(`formal-companion-short-${arm}.json.gz`);
  assert.strictEqual(short.on.length,2);assert.strictEqual(short.off.length,2);
  for(let i=0;i<2;i++){assert.strictEqual(short.on[i].stateHash,short.off[i].stateHash);assert.deepStrictEqual(short.on[i].row,short.off[i].row);}
}
assert.strictEqual(panels.before.observerDigest,panels.after.observerDigest);
assert.strictEqual(panels.before.contractDigest,panels.after.contractDigest);
assert.deepStrictEqual(Object.keys(panels.before.sources).filter(n=>panels.before.sources[n]!==panels.after.sources[n]),['src/js/party.js']);
for(const j of jobs){
  assert.strictEqual(sha(JSON.stringify(j.identity)),j.key);
  const p=panels[j.arm],i=j.identity,r=i.observe==='0'?j.result:p.rows.find(r=>r.row.policy===i.policy&&r.row.seed===i.seed);
  assert.strictEqual(i.sourceDigest,p.sourceDigest);assert.strictEqual(i.observerDigest,p.observerDigest);assert.strictEqual(i.contractDigest,p.contractDigest);
  assert.strictEqual(sha(JSON.stringify(r)),j.resultDigest);assert.deepStrictEqual(r.warnings,[]);
  if(i.observe==='1'){assert.deepStrictEqual(r.observerErrors,[]);assert.deepStrictEqual(r.gear.errors,[]);}
  else{
    assert.strictEqual(r.observerErrors,undefined);assert.strictEqual(r.gear,undefined);
    const on=p.rows.find(t=>t.row.policy===i.policy&&t.row.seed===i.seed);
    assert.deepStrictEqual(r.row,on.row);assert.strictEqual(r.stateHash,on.stateHash);
  }
}
const diagnostics=read('formal-companion-diagnostics.json');assert.strictEqual(diagnostics.length,16);
for(const d of diagnostics){const r=read(d.file),p=panels[d.arm].rows.find(t=>t.row.policy===d.policy&&t.row.seed===d.seed);assert.deepStrictEqual(r.row,p.row);assert.strictEqual(r.stateHash,p.stateHash);assert.deepStrictEqual(r.warnings,[]);assert.strictEqual(r.dropped,0);}
console.log(JSON.stringify({artifacts:Object.keys(receipt.artifacts).length,standardJobs:520,diagnosticJobs:16,shortTerminalRows:8,sourceFiles:207,adopted:false}));
