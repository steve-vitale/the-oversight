'use strict';
// Passive diagnostic cohort: all three changed screen cases, both roots.
// Observe real calls only. Never invoke a gate/action to manufacture availability.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process'),crypto=require('crypto');
const B=require('../../scripts/balance-panel'),gear=require('../../scripts/gear-usage-audit');
const read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f))),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const prefix='evidence/2026-10-21/company-favor-opportunity-r2';
const arg=n=>process.argv[process.argv.indexOf('--'+n)+1];
async function child(){
 const root=arg('root'),policy=arg('policy'),seed=Number(arg('seed')),on=arg('observe')==='1',panel=read(arg('panel')),expected=panel.rows.find(r=>r.row.policy===policy&&r.row.seed===seed);
 if(JSON.stringify(B.manifest(root))!==JSON.stringify(panel.sources))throw Error('Source mismatch');
 const H=require(path.join(root,'scripts/sim-harness')),S=require(path.join(root,'scripts/sweep-compare')),base=S.POLICY_REGISTRY[policy];let G,o;const observations=[],counts={},warnings=[],warn=console.warn;
 console.warn=(...xs)=>warnings.push(xs.map(String).join(' '));
 function observe(type,vid,data){const v=G.state.village,p=G.getPerson(vid),eligible=!!(vid&&vid!==G.villagerId&&(v.roster||[]).includes(vid)&&p&&!p.dead);counts[type]=(counts[type]||0)+1;if(observations.length<300)observations.push({type,day:G.state.scholar.day,ticks:G.state.scholar.dayTicks,vid,eligible,data});}
 S.POLICY_REGISTRY[policy]={...base,setup(g,c){G=g;o=B.install(g);if(on){
  for(const name of ['convoStoreFavor','convoFavorCommit','convoPerformFavor','performCompanyFavor','companyFavorAction']){if(typeof g[name]!=='function')continue;const old=g[name];g[name]=function(...args){const f=name==='convoStoreFavor'?args[0]:args[1]||this.state.village.favorLedger?.[args[0]],vid=name==='convoStoreFavor'?f?.vid:args[0];const result=old.apply(this,args);if(f?.kind==='stay_close')observe(name,vid,{favorId:f.id,night:f.companyNight??null,state:f.state,cancel:name==='performCompanyFavor'?!!args[2]:null,result:result&&typeof result==='object'?{ready:result.ready,ok:result.ok,reason:result.reason,line:result.line,action:result.action}:result,company:f.company?JSON.parse(JSON.stringify(f.company)):null});return result;};}
  const tele=g.tele;g.tele=function(type,data){if(String(type).startsWith('favor_company_'))observe(type,data?.partner,data);return tele.apply(this,arguments);};
 }return base.setup?.(g,c);},daily(g,c){const result=base.daily?.(g,c);o.sample();return result;}};
 try{const report=await H.quietLog(()=>S.runComparison({seeds:[seed],policies:[policy],days:panel.options.days,origin:panel.options.origin})),row=report.runs[0],observed=o.finish(row),stateHash=gear.gameplayHash(G.state),rngTail=[Math.random(),Math.random(),Math.random()];
 const checks={source:JSON.stringify(B.manifest(root))===JSON.stringify(panel.sources),state:stateHash===expected.stateHash,row:JSON.stringify(row)===JSON.stringify(expected.row),metrics:JSON.stringify(observed.metrics)===JSON.stringify(expected.metrics),clean:!warnings.length&&!observed.observerErrors.length&&!observed.gear.errors.length};
 if(!Object.values(checks).every(Boolean))throw Error('Diagnostic diverged '+JSON.stringify(checks));
 process.stdout.write('@@COMPANY@@'+JSON.stringify({checks,stateHash,row,metrics:observed.metrics,rngTail,counts,observations,warnings})+'\n');
 }finally{console.warn=warn;}
}
async function main(){if(process.argv.includes('--child'))return child();
 const replay=JSON.parse(fs.readFileSync('evidence/2026-10-21/company-favor-replay-r1-plan.json')),jobs=['before','after'].flatMap(arm=>replay.cases.flatMap(c=>[0,1].map(on=>({arm,root:replay[arm+'Root'],panel:replay[arm+'Panel'],...c,on})))),plan={scope:'All changed screen cases, diagnostic only; stored requests are not proof of spoken requests; real gates/calls are not completions; no natural-viability inference.',toolSha256:sha(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n')),sourcePanels:Object.fromEntries(['before','after'].map(a=>[a,sha(fs.readFileSync(replay[a+'Panel']))])),jobs};
 fs.writeFileSync(prefix+'-plan.json',JSON.stringify(plan,null,2)+'\n',{flag:'wx'});let next=0;const results=[];
 async function worker(){while(next<jobs.length){const job=jobs[next++];const result=await new Promise((resolve,reject)=>{const p=cp.spawn(process.execPath,[__filename,'--child','--root',job.root,'--panel',job.panel,'--policy',job.policy,'--seed',String(job.seed),'--observe',String(job.on)],{cwd:process.cwd(),env:process.env});let stdout='',stderr='';p.stdout.setEncoding('utf8');p.stderr.setEncoding('utf8');p.stdout.on('data',s=>stdout+=s);p.stderr.on('data',s=>stderr+=s);p.on('error',reject);p.on('close',code=>{try{if(code)throw Error(stderr||stdout);resolve(JSON.parse(stdout.split('@@COMPANY@@').pop()));}catch(e){reject(e);}});});results.push({job,...result});process.stdout.write('.');}}
 await Promise.all(Array.from({length:4},worker));const neutrality=results.filter(r=>r.job.on).map(a=>{const b=results.find(r=>!r.job.on&&r.job.arm===a.job.arm&&r.job.policy===a.job.policy&&r.job.seed===a.job.seed);return{arm:a.job.arm,policy:a.job.policy,seed:a.job.seed,match:a.stateHash===b.stateHash&&JSON.stringify(a.row)===JSON.stringify(b.row)&&JSON.stringify(a.metrics)===JSON.stringify(b.metrics)&&JSON.stringify(a.rngTail)===JSON.stringify(b.rngTail)};});
 if(neutrality.some(n=>!n.match))throw Error('Passive observer changed campaign');
 fs.writeFileSync(prefix+'.json.gz',z.gzipSync(JSON.stringify({plan,neutrality,results})),{flag:'wx'});console.log('\n'+JSON.stringify({neutrality,counts:results.filter(r=>r.job.on).map(r=>({arm:r.job.arm,policy:r.job.policy,seed:r.job.seed,counts:r.counts}))}));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
