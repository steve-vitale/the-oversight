'use strict';
// Check the reusable diagnostic against retained real campaigns, without
// running another harness or rewriting any historical evidence.
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),T=require('./lib').reporter('Calendar phase review portability');
const root=path.resolve(__dirname,'../..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-phase-review-')),planFile='evidence/2026-10-24/calendar-composed-plan-r1.json',run=(plan,out)=>cp.spawnSync(process.execPath,['scripts/calendar-phase-review.js',plan,path.join(temp,out)],{cwd:root,encoding:'utf8',timeout:30000});
try{
 const actual=run(planFile,'real.json');assert.equal(actual.status,0,actual.stderr);
 const result=JSON.parse(fs.readFileSync(path.join(temp,'real.json'))),historical=JSON.parse(fs.readFileSync(path.join(root,'evidence/2026-10-24/calendar-composed-phase-review-r1.json')));
 T.ok('reusable CLI reproduces every historical phase, ending and cap exactly',JSON.stringify(result.arms)===JSON.stringify(historical.arms));
 T.ok('actual matched pre120 sample/action prefixes are explicitly scoped and equal',result.pairedPrefixes.pairs.length===64&&result.pairedPrefixes.allRecordedPre120Equal&&result.pairedPrefixes.scope.includes('not complete state'));
 const wrong=JSON.parse(fs.readFileSync(path.join(root,planFile)));wrong.arms[0].sourceDigest='wrong';const wrongFile=path.join(temp,'wrong.json');fs.writeFileSync(wrongFile,JSON.stringify(wrong));
 T.ok('an incorrect declared input digest is rejected',run(wrongFile,'wrong-output.json').status!==0&&!fs.existsSync(path.join(temp,'wrong-output.json')));
 const mismatch=JSON.parse(fs.readFileSync(path.join(root,planFile)));mismatch.seeds.push(999999);const mismatchFile=path.join(temp,'mismatch.json');fs.writeFileSync(mismatchFile,JSON.stringify(mismatch));
 T.ok('a changed declared seed cohort cannot reuse the phase evidence',run(mismatchFile,'mismatch-output.json').status!==0&&!fs.existsSync(path.join(temp,'mismatch-output.json')));
}finally{for(const file of fs.readdirSync(temp))fs.unlinkSync(path.join(temp,file));fs.rmdirSync(temp);}
T.done();
