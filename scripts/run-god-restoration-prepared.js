#!/usr/bin/env node
'use strict';
// Repeat prepared God mechanics with one shared-harness world per child.
// Use balance-panel for natural campaigns; these explicit scenes prove mechanics.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),z=require('zlib');
const {manifest}=require('./balance-panel');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const root=path.resolve(arg('root',path.join(__dirname,'..'))),out=arg('out',null);
const seeds=String(arg('seeds',Array.from({length:64},(_,i)=>i+1).join(','))).split(',').map(Number);
const jobs=Number(arg('jobs',4)),timeout=Number(arg('timeout',60))*1000;
const defaultSuites=['test-god-verbs-runtime.js','test-player-command-turns.js','test-god-support-player.js','test-grounding-person.js','test-god-restoration-integrity.js','test-god-field-light.js','test-market-audit-ownership.js','test-market-dawn-catalog.js','test-market-delivery.js','test-market-choice.js'];
const suites=String(arg('suites',defaultSuites.join(','))).split(',');
const supportFiles=['scripts/godpath/lib.js','scripts/gear-usage-audit.js','scripts/balance-panel.js','scripts/balance-metrics.json','scripts/lib/balance-scorecard.js','scripts/lib/simulation-flags.js','scripts/lib/balance-cohorts.js'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const textHash=f=>sha(fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'));
(async()=>{
 if(!out)throw Error('--out <new evidence prefix> required; optional --root --seeds 1,2,3 --suites test-name.js --jobs 4 --timeout 60');
 if(!suites.length||new Set(suites).size!==suites.length||suites.some(s=>!/^test-[a-z0-9-]+\.js$/.test(s)||!fs.existsSync(path.join(root,'scripts/godpath',s))))throw Error('Invalid or missing God-path proof suite');
 if(!seeds.length||seeds.some(s=>!Number.isSafeInteger(s))||new Set(seeds).size!==seeds.length||!Number.isInteger(jobs)||jobs<1||jobs>16||!Number.isFinite(timeout)||timeout<1000)throw Error('Invalid seeds/jobs/timeout');
 if(fs.existsSync(out+'.json.gz'))throw Error('Refusing to replace retained proof: '+out);
 const sources=manifest(root),suiteSources=Object.fromEntries(suites.map(s=>[s,textHash(path.join(root,'scripts/godpath',s))]));
 const supportSources=Object.fromEntries(supportFiles.map(s=>[s,textHash(path.join(root,s))])),runnerDigest=textHash(__filename);
 const pending=seeds.flatMap(seed=>suites.map(suite=>({seed,suite}))),rows=[];let next=0;
 async function worker(){while(next<pending.length){const {seed,suite}=pending[next++];const row=await new Promise(resolve=>{const p=cp.spawn(process.execPath,[path.join(root,'scripts/godpath',suite)],{cwd:root,env:{...process.env,SEED:String(seed)}});let stdout='',stderr='',error=null;const started=Date.now(),timer=setTimeout(()=>{error='timeout';p.kill();},timeout);p.stdout.on('data',x=>stdout+=x);p.stderr.on('data',x=>stderr+=x);p.on('error',e=>error=e.message);p.on('close',exit=>{clearTimeout(timer);resolve({seed,suite,exit,error,ms:Date.now()-started,stdout,stderr});});});rows.push(row);console.log((row.exit===0&&!row.error?'PASS':'FAIL')+' '+suite+' seed '+seed);}}
 await Promise.all(Array.from({length:Math.min(jobs,pending.length)},worker));
 rows.sort((a,b)=>a.seed-b.seed||suites.indexOf(a.suite)-suites.indexOf(b.suite));
 const sourcesStable=JSON.stringify(sources)===JSON.stringify(manifest(root))&&Object.entries(suiteSources).every(([s,h])=>textHash(path.join(root,'scripts/godpath',s))===h)&&Object.entries(supportSources).every(([s,h])=>textHash(path.join(root,s))===h)&&textHash(__filename)===runnerDigest;
 const report={schemaVersion:3,scope:'Prepared actual public actions/callers; not natural attainment, usefulness, all scene/scale parity or balance',root,nodeVersion:process.version,seeds,suites,sources,suiteSources,supportSources,runnerDigest,sourcesStable,passed:rows.filter(r=>r.exit===0&&!r.error).length,failed:rows.filter(r=>r.exit!==0||r.error).length,rows};
 fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify(report)+'\n'),{flag:'wx'});
 console.log(JSON.stringify({passed:report.passed,failed:report.failed,sourcesStable}));if(!sourcesStable||report.failed)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
