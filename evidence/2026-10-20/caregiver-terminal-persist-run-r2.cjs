'use strict';
const fs=require('fs'),cp=require('child_process'),z=require('zlib'),assert=require('assert/strict');
const prefix='evidence/2026-10-20/caregiver-terminal-persist-r2',results=[];
(async()=>{
 for(const capture of [1,0]){
  const out=prefix+'-'+(capture?'on':'off');
  const result=await new Promise((resolve,reject)=>{const p=cp.spawn(process.execPath,['-r','./evidence/2026-10-20/caregiver-terminal-persist-r2.cjs','scripts/campaign-terminal-audit.js','--child','--root','.', '--policy','caregiver','--seed','10004','--cap','600','--prefix-cap','150','--trace','1','--capture',String(capture),'--save-prefix',out],{env:process.env});let stdout='',stderr='';p.stdout.on('data',s=>stdout+=s);p.stderr.on('data',s=>stderr+=s);p.on('error',reject);p.on('close',code=>{try{if(code)throw Error(stderr||stdout.slice(-2000));resolve(JSON.parse(stdout.split('@@TERMINAL@@').pop()));}catch(e){reject(e);}});});
  fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify(result)+'\n'),{flag:'wx'});results.push(result);console.log(JSON.stringify({capture,terminal:result.terminal,warnings:result.warnings}));
 }
 const normalized=results.map(r=>{const c=JSON.parse(JSON.stringify(r));for(const state of [c.finalState,c.bridge?.state])if(state?.pacing)for(const key of ['lastTs','dayMinutes','totalMin'])delete state.pacing[key];return c;});assert.deepEqual(normalized[0],normalized[1],'Canonical capture trajectory changed');
 const on=JSON.parse(fs.readFileSync(prefix+'-on-storage.json')),off=JSON.parse(fs.readFileSync(prefix+'-off-storage.json'));
 assert.equal(on.storageDigest,off.storageDigest);assert.ok(on.captured.includes('late'),'No natural late Haven save');
 fs.writeFileSync(prefix+'-neutrality.json',JSON.stringify({canonicalExact:true,wallClockExclusions:['lastTs','dayMinutes','totalMin'],fields:Object.keys(results[0]),storageExact:true,opportunities:on.opportunities,captured:on.captured,scope:'Two separate current-source real-storage processes. Capture on/off matches complete result including state, all23 metrics, policy context and RNG/clock boundaries. Not the old no-storage trajectory.'},null,2)+'\n',{flag:'wx'});
 console.log('Natural persistent capture neutral.');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
