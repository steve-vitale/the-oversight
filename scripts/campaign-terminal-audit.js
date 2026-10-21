#!/usr/bin/env node
'use strict';
// One harness per child. Explicit roots/caps; passive prefixes, real endings.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),z=require('zlib');
const B=require('./balance-panel'),gear=require('./gear-usage-audit'),P=require('./lib/campaign-prefix');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const intact=r=>gear.gameplayHash(r.finalState)===r.stateHash&&(!r.bridge||gear.gameplayHash(r.bridge.state)===r.bridge.stateHash);
async function child(){
 const root=path.resolve(arg('root','.')),seed=Number(arg('seed',10003)),cap=Number(arg('cap',600)),prefixCap=Number(arg('prefix-cap',150)),policy=arg('policy','caregiver'),observe=arg('trace','1')==='1';
 const sources=B.manifest(root),entropy=observe?P.entropyObserver():null,H=require(path.join(root,'scripts/sim-harness'));
 let notes=[],G,balanced,trace,ctx,driverForcedTurns=0;const originalRun=H.runDays;
 H.runDays=async function(...args){const result=await originalRun.apply(this,args);notes=result.notes;return result;};
 const S=require(path.join(root,'scripts/sweep-compare')),base=S.POLICY_REGISTRY[policy];if(!base)throw Error('Unknown policy '+policy);
 const warnings=[],hookErrors=[],warn=console.warn;console.warn=(...xs)=>warnings.push(xs.map(String).join(' '));
 const wrapped={...base};
 for(const hook of ['setup','upkeep','daily']){
  const original=base[hook];
  wrapped[hook]=function(g,c){
   if(hook==='setup'){
    G=g;ctx=c;balanced=B.install(g);if(observe){entropy.attachPolicy();trace=P.traceObserver(g,entropy,prefixCap);}
    // The legacy fallback writes acted/moveLeft directly before calling this
    // helper. Count its direct caller separately from real player verbs.
    const afterAction=g.tbAfterPlayerAction;
    g.tbAfterPlayerAction=function monitorDriverTurn(...args){
     const stack={};Error.captureStackTrace(stack,monitorDriverTurn);
     if(/\bdriveFightsImpl\b/.test((stack.stack||'').split('\n')[1]||''))driverForcedTurns++;
     return afterAction.apply(this,args);
    };
   }
   trace?.record(hook,'before',c);
   try{const result=original?.call(this,g,c);if(hook==='daily')balanced.sample();return result;}
   catch(e){hookErrors.push({hook,message:e.message});throw e;}
   finally{trace?.record(hook,'after',c);}
  };
 }
 S.POLICY_REGISTRY[policy]=wrapped;
 try{
  const report=await H.quietLog(()=>S.runComparison({seeds:[seed],policies:[policy],days:cap,origin:'Columbus, Ohio'})),row=report.runs[0],stateHash=gear.gameplayHash(G.state),observation=balanced.finish(row);
  if(stateHash!==gear.gameplayHash(G.state))throw Error('Final balanced observation changed state');
  if(JSON.stringify(B.manifest(root))!==JSON.stringify(sources))throw Error('Source changed during campaign');
  const result={seed,cap,policy,sources,observer:B.observerIdentity(path.resolve(__dirname,'..')),row,stateHash,observation,terminal:{...P.terminalStatus(G,row,ctx),driverForcedTurns},notes,warnings,hookErrors,traceErrors:trace?.errors||[],entropyErrors:entropy?.errors||[],trace:trace?.rows||null,bridge:trace?.bridge||null,finalState:G.state,rngTail:[Math.random(),Math.random(),Math.random()]};
  process.stdout.write('@@TERMINAL@@'+JSON.stringify(result)+'\n');
 }finally{console.warn=warn;entropy?.restore();}
}
async function main(){
 if(process.argv.includes('--child'))return child();
 const root=path.resolve(arg('root','.')),out=arg('out',null);if(!out)throw Error('--out <fresh prefix> required');
 if(fs.existsSync(out+'.json.gz'))throw Error('Completed report exists');
 const seeds=arg('seeds','10001,10003,10004,10008').split(',').map(Number),caps=arg('caps','150,600').split(',').map(Number),policy=arg('policy','caregiver');
 if(seeds.some(n=>!Number.isSafeInteger(n))||caps.length!==2||caps[0]>=caps[1]||caps.some(n=>!Number.isSafeInteger(n)||n<1))throw Error('Invalid seeds/caps');
 const sources=B.manifest(root),observer=B.observerIdentity(path.resolve(__dirname,'..')),toolFiles=['scripts/campaign-terminal-audit.js','scripts/lib/campaign-prefix.js'],tools=Object.fromEntries(toolFiles.map(f=>[f,sha(fs.readFileSync(path.join(__dirname,'..',f),'utf8').replace(/\r\n/g,'\n'))]));
 const flags=require('./lib/simulation-flags'),configuration={nodeVersion:process.version,origin:'Columbus, Ohio',flags:flags.snapshot(root,sources,flags.discover(root,sources))};
 const jobs=seeds.flatMap(seed=>caps.flatMap(cap=>[0,1].map(trace=>({seed,cap,trace,policy,prefixCap:caps[0]})))),plan={root,sources,observer,tools,configuration,jobs};
 const text=JSON.stringify(plan,null,2)+'\n';if(fs.existsSync(out+'-plan.json')){if(fs.readFileSync(out+'-plan.json','utf8')!==text)throw Error('Resume inputs differ');}else fs.writeFileSync(out+'-plan.json',text,{flag:'wx'});
 const cache=out+'-cases';fs.mkdirSync(cache,{recursive:true});let next=0;const results=[];
 async function worker(){while(next<jobs.length){const job=jobs[next++],key=sha(JSON.stringify({plan,job})),file=path.join(cache,key+'.json.gz');
  if(fs.existsSync(file)){const cached=JSON.parse(z.gunzipSync(fs.readFileSync(file)));if(cached.key!==key||cached.digest!==sha(JSON.stringify(cached.result))||JSON.stringify(cached.result.job)!==JSON.stringify(job)||!intact(cached.result))throw Error('Invalid cache');results.push(cached.result);continue;}
  const result=await new Promise((resolve,reject)=>{const p=cp.spawn(process.execPath,[__filename,'--child','--root',root,'--seed',String(job.seed),'--cap',String(job.cap),'--prefix-cap',String(job.prefixCap),'--policy',job.policy,'--trace',String(job.trace)],{env:process.env,cwd:root});let stdout='',stderr='';p.stdout.setEncoding('utf8');p.stderr.setEncoding('utf8');p.stdout.on('data',s=>stdout+=s);p.stderr.on('data',s=>stderr+=s);p.on('error',reject);p.on('close',code=>{try{if(code)throw Error(stderr||stdout.slice(-2000));const parsed=JSON.parse(stdout.split('@@TERMINAL@@').pop());if(!intact(parsed))throw Error('Child state changed in transport');resolve({job,...parsed});}catch(e){reject(e);}});});
  fs.writeFileSync(file,z.gzipSync(JSON.stringify({key,digest:sha(JSON.stringify(result)),result})),{flag:'wx'});results.push(result);process.stdout.write('.');
 }}
 await Promise.all(Array.from({length:Math.min(4,Number(arg('par',4)))},worker));
 const neutral=seeds.flatMap(seed=>caps.map(cap=>{const find=t=>results.find(r=>r.job.seed===seed&&r.job.cap===cap&&r.job.trace===t),on=find(1),off=find(0);return{seed,cap,match:['row','stateHash','observation','terminal','notes','rngTail'].every(k=>JSON.stringify(on[k])===JSON.stringify(off[k]))};}));
 const prefixes=seeds.map(seed=>({seed,...P.comparePrefix(results.find(r=>r.job.seed===seed&&r.job.cap===caps[0]&&r.job.trace===1),results.find(r=>r.job.seed===seed&&r.job.cap===caps[1]&&r.job.trace===1))}));
 const stable=JSON.stringify(B.manifest(root))===JSON.stringify(sources)&&toolFiles.every(f=>tools[f]===sha(fs.readFileSync(path.join(__dirname,'..',f),'utf8').replace(/\r\n/g,'\n')));
 fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify({plan,stable,neutral,prefixes,results})+'\n'),{flag:'wx'});
 console.log('\nSaved '+results.length+' cases; neutral '+neutral.every(n=>n.match)+'; prefixes '+prefixes.every(p=>p.ok));
 if(!stable||neutral.some(n=>!n.match)||prefixes.some(p=>!p.ok)||results.some(r=>r.warnings.length||r.hookErrors.length||r.traceErrors.length||r.entropyErrors.length||r.observation.observerErrors.length||r.observation.gear.errors.length))throw Error('Audit requires review; inspect retained report');
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
