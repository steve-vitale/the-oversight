'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),z=require('zlib'),rows=[];
for(const file of ['scripts/test-carexplore.js','scripts/test-capable-greedy-20261015.js','scripts/test-where-are-we-20261014.js']){
 const r=cp.spawnSync(process.execPath,[file],{encoding:'utf8',timeout:120000,maxBuffer:8e6}),output=r.stdout+r.stderr,failures=output.split('\n').filter(l=>/^FAIL /.test(l));
 if(r.error)throw r.error;if(file.endsWith('test-carexplore.js')){if(r.status!==1||failures.length!==2||!failures.some(l=>l.includes('giveFood full clears hunger'))||!failures.some(l=>l.includes('examineCell records depth')))throw Error('Unexpected legacy care result: '+output)}else if(r.status!==0)throw Error('Supplemental contract failed: '+file+' '+output);
 rows.push({file,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')).digest('hex'),exit:r.status,output,scope:file.endsWith('test-carexplore.js')?'Historical partial-module fixture:500kcal cannot erase80 hunger (2000kcal), and the examined key hardcodes3,3 while current Haven is4,4. These two assertions are superseded, not passing.':'Current supplementary contract outside automatic list; successful exit is retained separately.'});
}
fs.writeFileSync(path.join(__dirname,'release-inclusion-supplemental-r2.json.gz'),z.gzipSync(JSON.stringify(rows)),{flag:'wx'});console.log(JSON.stringify(rows.map(r=>({file:r.file,exit:r.exit,tail:r.output.trim().split('\n').slice(-2)}))));
