'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const prefix='evidence/2026-10-20/haven-access-ring-contrast-r1';
let worker=fs.readFileSync('evidence/2026-10-20/haven-access-ring-probe-r2.cjs','utf8').replace(/\r\n/g,'\n');
worker=worker.replace("K=require('../../scripts/godpath/lib')","K=require(process.argv[2]+'/scripts/godpath/lib'),B=require(process.argv[2]+'/scripts/balance-panel')");
worker=worker.replace('walk([4,2],false);const entered=',"walk([4,2],false);const preserved=JSON.stringify({grid:G.playerTile().groundsDetail,secrets:G.playerTile().secrets});const entered=");
worker=worker.replace('const report={scope:',"const report={root:process.argv[2],sources:B.manifest(process.argv[2]),structuresPreserved:JSON.stringify({grid:G.playerTile().groundsDetail,secrets:G.playerTile().secrets})===preserved,scope:");
worker=worker.replace("'evidence/2026-10-20/haven-access-ring-probe-r2.json'",'process.argv[3]');
const file=prefix+'-worker.cjs';fs.writeFileSync(file,worker,{flag:'wx'});
const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),roots={before:path.join(common,'haven-access-pre-fallback-r1'),after:process.cwd()},report={scope:'Same nine paid tent placements and actual movement against frozen intermediate candidate and final source, separate shared-harness processes; no map edits or deleted structures.',arms:{}};
for(const[arm,root]of Object.entries(roots)){
 const output=path.resolve(prefix+'-'+arm+'.json'),run=cp.spawnSync(process.execPath,[file.startsWith('/')?file:path.resolve(file),root,output],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
 if(run.status!==0)throw Error(run.stderr||run.stdout);report.arms[arm]=JSON.parse(fs.readFileSync(output));
}
assert.equal(report.arms.before.entered,true);assert.equal(report.arms.before.exited,false);assert.equal(report.arms.after.entered,true);assert.equal(report.arms.after.exited,true);assert.equal(report.arms.after.inside,false);assert.equal(report.arms.after.structuresPreserved,true);
fs.writeFileSync(prefix+'-summary.json',JSON.stringify({scope:report.scope,before:{built:report.arms.before.built.length,exited:report.arms.before.exited,remainingOpenGround:report.arms.before.remainingOpenGround},after:{built:report.arms.after.built.length,exited:report.arms.after.exited,structuresPreserved:true,position:report.arms.after.position}},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({beforeExit:false,afterExit:true,paidTents:report.arms.after.built.length,structuresPreserved:true}));
