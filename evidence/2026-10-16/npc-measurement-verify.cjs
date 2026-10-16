'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),z=require('zlib'),assert=require('assert');
const dir=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=n=>JSON.parse(n.endsWith('.gz')?z.gunzipSync(fs.readFileSync(path.join(dir,n))):fs.readFileSync(path.join(dir,n)));
const receipt=read('npc-measurement-receipt.json');
for(const [n,h]of Object.entries(receipt.artifacts)){const b=fs.readFileSync(path.join(dir,n));assert.strictEqual(sha(n.endsWith('.gz')?b:Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'))),h,n);}
const bundle=read('npc-measurement-sources.json.gz');
const panels={'primary-before':read('npc-measurement-before-panel.json.gz'),'primary-after':read('npc-measurement-after-panel.json.gz'),'shared-after':read('npc-measurement-shared-observer-panel.json.gz')};
const count={'primary-before':256,'primary-after':256,'shared-after':4};
function eligibility(r){
  const e=r.npcExposure;assert.strictEqual(e.schemaVersion,1);assert.strictEqual(e.identityRule,'known-living-resident-not-current-bearer');
  for(const k of ['sampledIdentities','classIdentities','unknownIdentities'])assert.strictEqual(new Set(e[k]).size,e[k].length,k);
  assert(e.classIdentities.every(id=>e.sampledIdentities.includes(id)));
  assert.strictEqual(r.metrics.npcClassAccess,e.unknownIdentities.length||!e.sampledIdentities.length?null:e.classIdentities.length/e.sampledIdentities.length);
  for(const d of e.days){assert.strictEqual(new Set(d.eligible).size,d.eligible.length);assert(!d.eligible.includes(d.bearer));assert(d.unknown.every(id=>e.unknownIdentities.includes(id)));assert([...d.classes,...d.gods].every(h=>d.eligible.includes(h.who)));}
}
for(const [arm,p]of Object.entries(panels)){
  assert.strictEqual(p.rows.length,count[arm]);assert(p.validity.sourcesStable&&p.validity.neutrality.every(n=>n.match&&!n.warnings));
  assert.deepStrictEqual(p.sources,bundle.arms[arm].sources);assert.strictEqual(p.sourceDigest,sha(JSON.stringify(p.sources)));
  const files=bundle.arms[arm].files;
  for(const[n,f]of Object.entries(files))assert.strictEqual(sha(Buffer.from(f.base64,'base64')),f.sha256,n);
  const observer=sha(['scripts/balance-panel.js','scripts/gear-usage-audit.js','scripts/lib/balance-scorecard.js'].map(n=>Buffer.from(files[n].base64,'base64')).join('\n'));
  assert.strictEqual(observer,p.observerDigest);assert.strictEqual(sha(Buffer.from(files['scripts/balance-metrics.json'].base64,'base64')),p.contractDigest);
  for(const r of p.rows){assert.deepStrictEqual(r.warnings,[]);assert.deepStrictEqual(r.observerErrors,[]);assert.deepStrictEqual(r.gear.errors,[]);if(arm!=='primary-before')eligibility(r);}
}
const before=panels['primary-before'],after=panels['primary-after'];assert.deepStrictEqual(before.sources,after.sources);
let changedGodRuns=0;
for(const r of after.rows){const b=before.rows.find(t=>t.row.policy===r.row.policy&&t.row.seed===r.row.seed);assert.deepStrictEqual(r.row,b.row);assert.strictEqual(r.stateHash,b.stateHash);assert.deepStrictEqual(r.metrics,b.metrics);if(JSON.stringify(r.gods.npc)!==JSON.stringify(b.gods.npc))changedGodRuns++;}
assert.strictEqual(changedGodRuns,55);assert.notStrictEqual(before.observerDigest,after.observerDigest);assert.notStrictEqual(before.contractDigest,after.contractDigest);
for(const [file,arm]of [['npc-measurement-before16-panel.json.gz','primary-before'],['npc-measurement-primary16-panel.json.gz','primary-after'],['npc-measurement-primary-observer-panel.json.gz','primary-after']]){
  const s=read(file),p=panels[arm];assert.strictEqual(s.observerDigest,p.observerDigest);for(const r of s.rows)assert.deepStrictEqual(r,p.rows.find(t=>t.row.policy===r.row.policy&&t.row.seed===r.row.seed));
}
const jobs=read('npc-measurement-jobs.json.gz');assert.strictEqual(jobs.length,528);assert.strictEqual(new Set(jobs.map(j=>j.key)).size,528);
for(const j of jobs){const p=panels[j.arm],i=j.identity;assert.strictEqual(sha(JSON.stringify(i)),j.key);assert.strictEqual(i.sourceDigest,p.sourceDigest);assert.strictEqual(i.observerDigest,p.observerDigest);assert.strictEqual(i.contractDigest,p.contractDigest);const on=p.rows.find(r=>r.row.policy===i.policy&&r.row.seed===i.seed),r=i.observe==='0'?j.result:on;assert.strictEqual(sha(JSON.stringify(r)),j.resultDigest);assert.strictEqual(r.stateHash,on.stateHash);assert.deepStrictEqual(r.row,on.row);}
for(const [label,arm]of [['before','primary-before'],['after','primary-after'],['shared','shared-after']]){
  const p=read(`npc-measurement-fresh-${label}-panel.json.gz`),expected=panels[arm].rows.find(r=>r.row.policy==='maker'&&r.row.seed===7);
  assert.strictEqual(p.sourceHeadStart,null);assert.strictEqual(p.sourceHeadEnd,null);assert.strictEqual(p.observerDigest,panels[arm].observerDigest);assert.strictEqual(p.contractDigest,panels[arm].contractDigest);assert.strictEqual(p.sourceDigest,panels[arm].sourceDigest);assert(p.validity.sourcesStable&&p.validity.neutrality.every(n=>n.match&&!n.warnings));assert.deepStrictEqual(p.rows[0],expected);
}
const controls=read('npc-measurement-shared-legacy-controls.json.gz');assert.strictEqual(controls.runs.length,160);assert.strictEqual(controls.pairs.length,80);assert.deepStrictEqual(controls.sources,panels['shared-after'].sources);
for(const p of controls.pairs){const a=controls.runs.find(r=>r.file===p.file&&r.seed===p.seed&&r.arm==='before'),b=controls.runs.find(r=>r.file===p.file&&r.seed===p.seed&&r.arm==='after');assert.strictEqual(a.code,b.code);assert.strictEqual(a.stdout,b.stdout);assert.strictEqual(a.stderr,b.stderr);assert(p.match);}
assert.strictEqual(controls.runnerDigest,sha(fs.readFileSync(path.join(dir,'npc-measurement-legacy-run.cjs'),'utf8').replace(/\r\n/g,'\n')));
const miser=read('npc-measurement-miser-selected-control.json.gz');assert.strictEqual(miser.search.length,96);assert.strictEqual(miser.selected.before.seed,110);assert.deepStrictEqual(miser.selected.before,miser.search.find(r=>r.seed===110));assert(miser.selected.match);assert.strictEqual(miser.selected.before.code,1);assert.strictEqual(miser.selected.after.code,1);assert.strictEqual(miser.selected.before.stdout,miser.selected.after.stdout);assert.strictEqual(miser.selected.before.stderr,miser.selected.after.stderr);assert(miser.selected.before.stdout.includes('FAIL far caches are safer than near'));
const validation=read('npc-measurement-validation.json');assert.strictEqual(validation.primary.full.failed,0);assert.strictEqual(validation.primary.full.passed,945);assert.strictEqual(validation.shared.final.failed,50);assert.strictEqual(validation.sharedIntegrationGreen,false);assert.deepStrictEqual(validation.unexplainedFinalFailures,[]);
for(const[n,h]of Object.entries(validation.commonHashes))for(const a of ['primary-after','shared-after'])assert.strictEqual(sha(Buffer.from(bundle.arms[a].files[n].base64,'base64').toString('utf8').replace(/\r\n/g,'\n')),h,n);
assert.strictEqual(read('npc-measurement-lineage-rejection.json').decision,'invalid');
console.log(JSON.stringify({artifacts:Object.keys(receipt.artifacts).length,retainedJobs:528,primaryRowsUnchanged:256,scalarMetricsUnchanged:23,changedNpcGodRuns:55,legacyControlPairs:80,miserSelectedSeed:110}));
