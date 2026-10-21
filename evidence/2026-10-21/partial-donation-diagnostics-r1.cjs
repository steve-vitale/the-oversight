'use strict';
const fs=require('fs'),z=require('zlib'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),R=require('../../scripts/garden-longplay-audit');
const prefix='evidence/2026-10-21/partial-donation-',read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f))),roots=require('./partial-donation-roots-r1.json');
(async()=>{
 const panels={before:read(prefix+'game-panel-r1.json.gz'),after:read(prefix+'controller-panel-r1.json.gz')};
 const changed=panels.after.rows.filter(a=>{const b=panels.before.rows.find(x=>x.row.policy===a.row.policy&&x.row.seed===a.row.seed);return JSON.stringify(a.metrics)!==JSON.stringify(b.metrics);});
 const jobs=changed.flatMap(a=>['before','after'].map(arm=>({arm,policy:a.row.policy,seed:a.row.seed}))),results=[];let next=0;
 const tools=['scripts/garden-longplay-audit.js','scripts/lib/donation-usage.js','scripts/lib/garden-usage.js','scripts/lib/garden-accounting.js'].map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')).digest('hex')}));
 async function worker(){while(next<jobs.length){const job=jobs[next++],root=roots[job.arm].root;
  const r=await R.readChild([path.resolve('scripts/garden-longplay-audit.js'),'--child','--root',root,'--policy',job.policy,'--seed',String(job.seed),'--days','150','--observe','1'],root);
  const p=panels[job.arm].rows.find(x=>x.row.policy===job.policy&&x.row.seed===job.seed);
  assert.equal(r.stateHash,p.stateHash);assert.deepEqual(r.metrics,p.metrics);assert.deepEqual(r.row,p.row);
  assert.equal(r.warnings.length+r.observerErrors.length+r.gearErrors.length+r.donationObservation.errors.length,0);
  results.push({job,...r});process.stdout.write('.');
 }}await Promise.all(Array.from({length:2},worker));
 const report={scope:'Every current-screen case with any changed metric; independent source-bound current-observer replay. Not a causal explanation of all later events or an independent holdout.',tools,jobs,results};
 fs.writeFileSync(prefix+'diagnostics-r1.json.gz',z.gzipSync(JSON.stringify(report)+'\n'),{flag:'wx'});console.log('\nVerified '+results.length+' independent Game-hash/row/all23 replays.');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
