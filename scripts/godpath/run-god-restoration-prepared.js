'use strict';
// One isolated shared-harness process per suite/start. Logs go only to --out.
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i<0?d:process.argv[i+1];};
const out=arg('out');if(!out)throw Error('--out <report.json.gz> required');
const seeds=arg('seeds','')?arg('seeds').split(',').map(Number):Array.from({length:Number(arg('n',64))},(_,i)=>i+1);
const suites=['test-god-verbs-runtime.js','test-player-command-turns.js','test-god-support-player.js','test-grounding-person.js','test-god-restoration-integrity.js','test-god-field-light.js'];
const rows=[];for(const seed of seeds){for(const suite of suites){const r=cp.spawnSync(process.execPath,[path.join(__dirname,suite)],{encoding:'utf8',env:{...process.env,SEED:String(seed)},timeout:120000,maxBuffer:8*1024*1024});rows.push({seed,suite,exit:r.status,error:r.error?.message||null,stdout:r.stdout,stderr:r.stderr});}console.log('seed '+seed+': '+rows.slice(-suites.length).filter(r=>r.exit===0).length+'/'+suites.length);}
const report={schemaVersion:1,seeds,suites,scope:'Prepared actual public actions/callers; not natural attainment, usefulness or balance',passed:rows.filter(r=>r.exit===0).length,failed:rows.filter(r=>r.exit!==0).length,rows};fs.writeFileSync(out,z.gzipSync(JSON.stringify(report)));console.log(JSON.stringify({passed:report.passed,failed:report.failed,out}));if(report.failed)process.exitCode=1;
