'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),root=path.resolve(__dirname,'../..'),rows=[];
for(const seed of [7,42,99])for(const name of ['regional-trap','europe-contract','cell-popup-dispatch']){
 const file='scripts/godpath/test-'+name+'-release.js',r=cp.spawnSync(process.execPath,[file],{cwd:root,env:{...process.env,SEED:String(seed)},encoding:'utf8',timeout:30000});rows.push({seed,file,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message});
}
const file='scripts/godpath/test-region-driver-release.js',r=cp.spawnSync(process.execPath,[file],{cwd:root,env:process.env,encoding:'utf8',timeout:60000});rows.push({seed:7,file,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message});
const revision=process.argv[2]||'r1';if(!/^r[0-9]+$/.test(revision))throw Error('Pass fresh rN receipt revision');
fs.writeFileSync(path.join(__dirname,'release-regional-contracts-raw-'+revision+'.json.gz'),z.gzipSync(JSON.stringify({rows})),{flag:'wx'});
const summary=rows.map(r=>({seed:r.seed,file:r.file,status:r.status,result:r.stdout.split('\n').find(l=>/passed, \d+ failed/.test(l))}));fs.writeFileSync(path.join(__dirname,'release-regional-contracts-summary-'+revision+'.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(summary));if(rows.some(r=>r.status!==0))process.exitCode=1;
