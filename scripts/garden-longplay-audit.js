#!/usr/bin/env node
'use strict';
// Source-bound natural campaigns; one shared harness per child. Example:
// node scripts/garden-longplay-audit.js --out evidence/<date>/<prefix>
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),z=require('zlib');
const B=require('./balance-panel'),gear=require('./gear-usage-audit'),sidecar=require('./lib/garden-usage');
const ROOT=path.resolve(__dirname,'..'),arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i<0?d:process.argv[i+1];};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
async function child(){
 const H=require('./sim-harness'),S=require('./sweep-compare'),policy=arg('policy','capable'),base=S.POLICY_REGISTRY[policy];
 if(!base)throw Error('Unknown policy');let G,balanced,garden;const warnings=[],warn=console.warn;
 console.warn=(...xs)=>{warnings.push(xs.map(String).join(' '));};
 S.POLICY_REGISTRY[policy]={...base,setup(g,ctx){G=g;balanced=B.install(g);if(arg('observe','1')==='1')garden=sidecar.install(g);return base.setup?.(g,ctx);},daily(g,ctx){const r=base.daily?.(g,ctx);balanced.sample();garden?.sample();return r;}};
 let result;try{result=await H.quietLog(()=>S.runComparison({seeds:[Number(arg('seed',7))],policies:[policy],days:Number(arg('days',150))}));}finally{console.warn=warn;S.POLICY_REGISTRY[policy]=base;}
 const row=result.runs[0],stateHash=gear.gameplayHash(G.state),observed=balanced.finish(row);garden?.sample();
 if(stateHash!==gear.gameplayHash(G.state))throw Error('Final observation mutated state');
 process.stdout.write('@@GARDEN@@'+JSON.stringify({row,stateHash,metrics:observed.metrics,warnings,observerErrors:observed.observerErrors,garden:garden?.report||null,rngTail:[Math.random(),Math.random(),Math.random()]})+'\n');
}
async function main(){
 if(process.argv.includes('--child'))return child();const out=arg('out',null);if(!out)throw Error('--out <prefix> required');
 if(fs.existsSync(out+'.json.gz'))throw Error('Completed audit exists; use a fresh output prefix');
 const sources=B.manifest(ROOT),identity=B.observerIdentity(ROOT),toolFiles=['scripts/garden-longplay-audit.js','scripts/lib/garden-usage.js'],toolHashes=Object.fromEntries(toolFiles.map(f=>[f,sha(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n'))]));
 const flags=require('./lib/simulation-flags'),configuration={nodeVersion:process.version,origin:'Columbus, Ohio',flags:flags.snapshot(ROOT,sources,flags.discover(ROOT,sources))};
 const policies=['capable','maker','merchant','caregiver'],seeds=Array.from({length:16},(_,i)=>i+1),jobs=[];
 for(const policy of policies)for(const seed of seeds)jobs.push({policy,seed,days:150,observe:1});
 for(const policy of policies)for(const seed of [10003,10004])jobs.push({policy,seed,days:600,observe:1});
 for(const seed of [10001,10008])jobs.push({policy:'caregiver',seed,days:600,observe:1});
 for(const policy of policies)for(const days of [150,600])jobs.push({policy,seed:days===150?1:10003,days,observe:0});
 const plan={scope:'Natural current-policy usage audit; no Garden balance change or gardener/pacifist viability claim. 600-day cap is not a terminal outcome.',sources,identity,toolHashes,configuration,jobs};
 const planText=JSON.stringify(plan,null,2)+'\n';
 if(fs.existsSync(out+'-plan.json')){if(fs.readFileSync(out+'-plan.json','utf8')!==planText)throw Error('Resume inputs changed; use a fresh prefix');}
 else fs.writeFileSync(out+'-plan.json',planText,{flag:'wx'});
 const cache=out+'-cases';fs.mkdirSync(cache,{recursive:true});
 const results=[];let next=0;async function worker(){while(next<jobs.length){const job=jobs[next++],key=sha(JSON.stringify({sources,identity,toolHashes,configuration,job})),file=path.join(cache,key+'.json.gz');
 if(fs.existsSync(file)){const cached=JSON.parse(z.gunzipSync(fs.readFileSync(file)));if(cached.key!==key||cached.digest!==sha(JSON.stringify(cached.result))||JSON.stringify(cached.result.job)!==JSON.stringify(job)||cached.result.row.policy!==job.policy||cached.result.row.seed!==job.seed)throw Error('Invalid cached case');results.push(cached.result);continue;}
 const r=await new Promise((resolve,reject)=>{const child=cp.spawn(process.execPath,[__filename,'--child',...Object.entries(job).flatMap(([k,v])=>['--'+k,String(v)])],{cwd:ROOT,env:process.env});let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);child.on('error',reject);child.on('close',code=>{try{if(code)throw Error(stderr||stdout.slice(-2000));resolve(JSON.parse(stdout.split('@@GARDEN@@').pop()));}catch(e){reject(e);}});});
 const result={job,...r};fs.writeFileSync(file,z.gzipSync(JSON.stringify({key,digest:sha(JSON.stringify(result)),result})),{flag:'wx'});results.push(result);process.stdout.write('.');}}
 await Promise.all(Array.from({length:4},worker));
 const controls=results.filter(r=>!r.job.observe).map(off=>{const on=results.find(r=>r.job.observe&&r.job.policy===off.job.policy&&r.job.seed===off.job.seed&&r.job.days===off.job.days);return{job:off.job,match:['row','stateHash','metrics','rngTail'].every(k=>JSON.stringify(off[k])===JSON.stringify(on[k]))};});
 const stable=JSON.stringify(sources)===JSON.stringify(B.manifest(ROOT))&&toolFiles.every(f=>toolHashes[f]===sha(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n')));const report={plan,stable,controls,results};
 fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify(report)+'\n'),{flag:'wx'});
 console.log('\nSaved '+results.length+' cases; neutral '+controls.every(c=>c.match));
 if(!stable||controls.some(c=>!c.match)||results.some(r=>r.warnings.length||r.observerErrors.length||r.garden?.errors.length))throw Error('Invalid audit; inspect retained results');
}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
