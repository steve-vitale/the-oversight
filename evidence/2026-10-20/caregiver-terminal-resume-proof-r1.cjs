'use strict';
const fs=require('fs'),cp=require('child_process'),z=require('zlib'),assert=require('assert/strict');
const source='evidence/2026-10-20/caregiver-terminal-current-public-wait-r4',target='evidence/2026-10-20/caregiver-terminal-resume-r1';
fs.copyFileSync(source+'-plan.json',target+'-plan.json',fs.constants.COPYFILE_EXCL);fs.mkdirSync(target+'-cases');
for(const file of fs.readdirSync(source+'-cases'))fs.copyFileSync(source+'-cases/'+file,target+'-cases/'+file,fs.constants.COPYFILE_EXCL);
const bad=cp.spawnSync(process.execPath,['scripts/campaign-terminal-audit.js','--root','.', '--caps','150,601','--out',target],{encoding:'utf8',env:process.env});
fs.writeFileSync(target+'-rejected.log',bad.stdout+bad.stderr,{flag:'wx'});assert.notEqual(bad.status,0);assert.match(bad.stderr,/Resume inputs differ/);assert.ok(!fs.existsSync(target+'.json.gz'));
const valid=cp.spawnSync(process.execPath,['scripts/campaign-terminal-audit.js','--root','.', '--out',target],{encoding:'utf8',env:process.env,maxBuffer:8*1024*1024});
fs.writeFileSync(target+'-accepted.log',valid.stdout+valid.stderr,{flag:'wx'});assert.equal(valid.status,0,valid.stderr);
const read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f))),a=read(source+'.json.gz'),b=read(target+'.json.gz');
assert.deepEqual(a.plan,b.plan);assert.deepEqual(a.neutral,b.neutral);assert.deepEqual(a.prefixes,b.prefixes);
const sort=rs=>rs.slice().sort((a,b)=>a.job.seed-b.job.seed||a.job.cap-b.job.cap||a.job.trace-b.job.trace);assert.deepEqual(sort(a.results),sort(b.results));
assert.doesNotMatch(valid.stdout,/\./); // a dot is emitted only for a newly executed case
fs.writeFileSync('evidence/2026-10-20/caregiver-terminal-resume-proof-r1.json',JSON.stringify({sameInputsExact:true,cases:a.results.length,changedCapRejected:true,newCasesExecuted:0,scope:'Prepared interruption shape: actual validated case cache and plan copied without a final report. Resume preserves every raw case, including diagnostic wall times. Not additional independent campaigns.'},null,2)+'\n',{flag:'wx'});console.log('Resume exact; changed cap rejected; no child campaigns rerun.');
