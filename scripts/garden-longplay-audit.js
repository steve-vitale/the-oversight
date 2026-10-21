#!/usr/bin/env node
'use strict';
// Source-bound natural campaigns; one shared harness per child. Example:
// node scripts/garden-longplay-audit.js --out evidence/<date>/<prefix>
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),z=require('zlib');
const B=require('./balance-panel'),gear=require('./gear-usage-audit'),sidecar=require('./lib/garden-usage'),P=require('./lib/campaign-prefix');
const ROOT=path.resolve(__dirname,'..'),arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i<0?d:process.argv[i+1];};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function comparableHash(state){
 const copy=JSON.parse(JSON.stringify(state));delete copy.village.gardenIntakeTotals;
 function strip(x){if(!x||typeof x!=='object')return;delete x.gardenShares;for(const value of Object.values(x))strip(value);}strip(copy);
 return gear.gameplayHash(copy);
}
function frame(payload){return JSON.stringify({version:1,sha256:sha(JSON.stringify(payload)),payload});}
function parseFrame(text){
 const parts=text.split('@@GARDEN@@');if(parts.length!==2)throw Error('Missing or duplicated garden report frame');
 const f=JSON.parse(parts[1]);if(f.version!==1||!f.payload||f.sha256!==sha(JSON.stringify(f.payload)))throw Error('Garden report payload changed in transport');
 return{...f.payload,transportDigest:f.sha256};
}
function validateResult(result,job,sources){
 const{job:storedJob,transportDigest,...payload}=result;
 if(JSON.stringify(storedJob)!==JSON.stringify(job)||transportDigest!==sha(JSON.stringify(payload))||payload.sourceDigest!==sha(JSON.stringify(sources))||payload.row?.policy!==job.policy||payload.row?.seed!==job.seed||!/^[0-9a-f]{64}$/.test(payload.stateHash||'')||!/^[0-9a-f]{64}$/.test(payload.comparableStateHash||''))throw Error('Invalid garden case payload or identity');
 return true;
}
function readChild(args,cwd){return new Promise((resolve,reject)=>{
 const child=cp.spawn(process.execPath,args,{cwd,env:process.env});let stdout='',stderr='';
 child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
 child.stdout.on('data',s=>stdout+=s);child.stderr.on('data',s=>stderr+=s);child.on('error',reject);child.on('close',code=>{try{if(code)throw Error(stderr||stdout.slice(-2000));resolve(parseFrame(stdout));}catch(e){reject(e);}});
});}
async function child(){
 const root=path.resolve(arg('root',ROOT)),sources=B.manifest(root),H=require(path.join(root,'scripts/sim-harness')),S=require(path.join(root,'scripts/sweep-compare')),policy=arg('policy','capable'),base=S.POLICY_REGISTRY[policy];
 if(!base)throw Error('Unknown policy');let G,balanced,garden,ctx;const warnings=[],warn=console.warn;
 console.warn=(...xs)=>{warnings.push(xs.map(String).join(' '));};
 S.POLICY_REGISTRY[policy]={...base,setup(g,c){G=g;ctx=c;balanced=B.install(g);if(arg('observe','1')==='1')garden=sidecar.install(g);return base.setup?.(g,c);},daily(g,c){const r=base.daily?.(g,c);balanced.sample();garden?.sample();return r;}};
 let result;try{result=await H.quietLog(()=>S.runComparison({seeds:[Number(arg('seed',7))],policies:[policy],days:Number(arg('days',150)),origin:'Columbus, Ohio'}));}finally{console.warn=warn;S.POLICY_REGISTRY[policy]=base;}
 const row=result.runs[0],stateHash=gear.gameplayHash(G.state),observed=balanced.finish(row);garden?.sample();
 if(stateHash!==gear.gameplayHash(G.state))throw Error('Final observation mutated state');
 if(JSON.stringify(B.manifest(root))!==JSON.stringify(sources))throw Error('Game source changed during garden campaign');
 process.stdout.write('@@GARDEN@@'+frame({sourceDigest:sha(JSON.stringify(sources)),row,stateHash,comparableStateHash:comparableHash(G.state),metrics:observed.metrics,warnings,observerErrors:observed.observerErrors,gearErrors:observed.gear.errors,terminal:P.terminalStatus(G,row,ctx),garden:garden?.report||null,rngTail:[Math.random(),Math.random(),Math.random()]})+'\n');
}
async function main(){
 if(process.argv.includes('--child'))return child();const out=arg('out',null);if(!out)throw Error('--out <prefix> required');
 const parallel=Number(arg('par',4));if(!Number.isSafeInteger(parallel)||parallel<1||parallel>4)throw Error('--par must be an integer from 1 to 4');
 if(fs.existsSync(out+'.json.gz'))throw Error('Completed audit exists; use a fresh output prefix');
 const root=path.resolve(arg('root',ROOT)),sources=B.manifest(root),identity=B.observerIdentity(ROOT),toolFiles=['scripts/garden-longplay-audit.js','scripts/lib/garden-usage.js','scripts/lib/garden-accounting.js','scripts/lib/campaign-prefix.js'],toolHashes=Object.fromEntries(toolFiles.map(f=>[f,sha(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n'))]));
 const flags=require('./lib/simulation-flags'),configuration={nodeVersion:process.version,origin:'Columbus, Ohio',flags:flags.snapshot(root,sources,flags.discover(root,sources))};
 const policies=['capable','maker','merchant','caregiver'],seeds=Array.from({length:16},(_,i)=>i+1),jobs=[];
 for(const policy of policies)for(const seed of seeds)jobs.push({policy,seed,days:150,observe:1});
 for(const policy of policies)for(const seed of [10003,10004])jobs.push({policy,seed,days:600,observe:1});
 for(const seed of [10001,10008])jobs.push({policy:'caregiver',seed,days:600,observe:1});
 for(const policy of policies)for(const days of [150,600])jobs.push({policy,seed:days===150?1:10003,days,observe:0});
 const plan={root,scope:'Natural current-policy usage audit; no Garden balance change or gardener/pacifist viability claim. 600 controller iterations is a cap; actual terminal status is separate.',comparisonExclusions:['**.gardenShares','village.gardenIntakeTotals','existing gameplayHash wall-clock fields'],sources,identity,toolHashes,configuration,jobs};
 const planText=JSON.stringify(plan,null,2)+'\n';
 if(fs.existsSync(out+'-plan.json')){if(fs.readFileSync(out+'-plan.json','utf8')!==planText)throw Error('Resume inputs changed; use a fresh prefix');}
 else fs.writeFileSync(out+'-plan.json',planText,{flag:'wx'});
 const cache=out+'-cases';fs.mkdirSync(cache,{recursive:true});
 const results=[];let next=0;async function worker(){while(next<jobs.length){const job=jobs[next++],key=sha(JSON.stringify({sources,identity,toolHashes,configuration,job})),file=path.join(cache,key+'.json.gz');
 if(fs.existsSync(file)){const cached=JSON.parse(z.gunzipSync(fs.readFileSync(file)));if(cached.key!==key||cached.digest!==sha(JSON.stringify(cached.result)))throw Error('Invalid cached case');validateResult(cached.result,job,sources);results.push(cached.result);continue;}
 const r=await readChild([__filename,'--child','--root',root,...Object.entries(job).flatMap(([k,v])=>['--'+k,String(v)])],root);
 const result={job,...r};validateResult(result,job,sources);fs.writeFileSync(file,z.gzipSync(JSON.stringify({key,digest:sha(JSON.stringify(result)),result})),{flag:'wx'});results.push(result);process.stdout.write('.');}}
 await Promise.all(Array.from({length:parallel},worker));
 const controls=results.filter(r=>!r.job.observe).map(off=>{const on=results.find(r=>r.job.observe&&r.job.policy===off.job.policy&&r.job.seed===off.job.seed&&r.job.days===off.job.days);return{job:off.job,match:['row','stateHash','metrics','rngTail'].every(k=>JSON.stringify(off[k])===JSON.stringify(on[k]))};});
 const stable=JSON.stringify(sources)===JSON.stringify(B.manifest(root))&&toolFiles.every(f=>toolHashes[f]===sha(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n')));const report={plan,stable,controls,results};
 fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify(report)+'\n'),{flag:'wx'});
 console.log('\nSaved '+results.length+' cases; neutral '+controls.every(c=>c.match));
 if(!stable||results.length!==jobs.length||controls.some(c=>!c.match)||results.some(r=>r.warnings.length||r.observerErrors.length||r.gearErrors.length||r.garden?.errors.length))throw Error('Invalid audit; inspect retained results');
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={frame,parseFrame,readChild,validateResult,comparableHash};
