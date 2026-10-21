'use strict';
const fs=require('node:fs'),z=require('node:zlib'),assert=require('node:assert/strict'),B=require('../../scripts/balance-panel'),read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f)));
const prefix='evidence/2026-10-20/haven-access-',current=B.manifest(process.cwd()),reports=[];
for(const cohort of ['','holdout-']){
 const oldFile=prefix+cohort+'after-r1.json.gz',newFile=prefix+cohort+'after-r2.json.gz',a=read(oldFile),b=read(newFile);assert.deepEqual(b.sources,current);assert.equal(a.observerDigest,b.observerDigest);assert.equal(a.contractDigest,b.contractDigest);
 const old=new Map(a.rows.map(r=>[r.row.policy+':'+r.row.seed,r])),mismatches=[];assert.equal(a.rows.length,b.rows.length);
 for(const r of b.rows){const key=r.row.policy+':'+r.row.seed,prior=old.get(key);assert(prior,'Same predeclared case');const fields=[...new Set([...Object.keys(prior),...Object.keys(r)])].filter(k=>JSON.stringify(prior[k])!==JSON.stringify(r[k]));if(fields.length)mismatches.push({key,fields});}
 reports.push({oldFile,newFile,beforeSourceDigest:a.sourceDigest,afterSourceDigest:b.sourceDigest,cases:b.rows.length,mismatches,equivalent:mismatches.length===0});
}
const report={scope:'Fresh current-collector runs for the final fallback fix compared case-by-case with the historical first candidate: every retained row, canonical gameplay-state hash, outcome, all23 metrics, census, warnings and observation fields. This is sampled case equivalence, not universal equivalence: the paid-camp counterexample intentionally differs. Earlier source identities/receipts remain unchanged.',reports,equivalent:reports.every(r=>r.equivalent)};
fs.writeFileSync(prefix+'equivalence-r1.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({equivalent:report.equivalent,cases:reports.reduce((n,r)=>n+r.cases,0),mismatches:reports.flatMap(r=>r.mismatches)}));if(!report.equivalent)process.exitCode=2;
