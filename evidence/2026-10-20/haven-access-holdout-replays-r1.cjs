'use strict';
// Diagnostic selection, not a new effect estimate. One process per replay.
const fs=require('node:fs'),z=require('node:zlib'),path=require('node:path'),cp=require('node:child_process');
const prefix='evidence/2026-10-20/haven-access-',read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f)));
const beforePanel=prefix+'holdout-before-r1.json.gz',afterPanel=prefix+'holdout-after-r1.json.gz',before=read(beforePanel),after=read(afterPanel);
(async()=>{
 await Promise.all(after.options.policies.map(async policy=>{
  const rows=after.rows.filter(r=>r.row.policy===policy),old=new Map(before.rows.filter(r=>r.row.policy===policy).map(r=>[r.row.seed,r]));
  const cases=new Map(),add=(r,reason)=>{const item=cases.get(r.row.seed);if(item)item.reason+='; '+reason;else cases.set(r.row.seed,{policy,seed:r.row.seed,reason});};
  for(const r of rows)if(r.row.won!==old.get(r.row.seed).row.won)add(r,'Every binary win change in either direction');
  for(const [metric,direction] of [['playerDeaths',1],['npcHungry',1],['goodGear',-1],['classAccess',-1],['communityLost',1],['table',-1],['survival30',-1]]){
   const ranked=rows.map(r=>({r,delta:direction*(r.metrics[metric]-old.get(r.row.seed).metrics[metric])})).filter(x=>Number.isFinite(x.r.metrics[metric])&&Number.isFinite(old.get(x.r.row.seed).metrics[metric])&&x.delta>0).sort((a,b)=>b.delta-a.delta||a.r.row.seed-b.r.row.seed);
   if(ranked.length)add(ranked[0].r,'Largest adverse '+metric+' delta, ties by seed');
  }
  const plan={beforeRoot:'C:/Users/Steve/oversight/.git/haven-access-baseline-3f09b84a1',afterRoot:process.cwd(),beforePanel:path.resolve(beforePanel),afterPanel:path.resolve(afterPanel),cases:[...cases.values()].sort((a,b)=>a.seed-b.seed)};
  const out=prefix+policy+'-holdout-replay-r1',file=out+'-plan.json';fs.writeFileSync(file,JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
  await new Promise((resolve,reject)=>{const fd=fs.openSync(out+'.log','wx'),p=cp.spawn(process.execPath,['scripts/review-god-restoration.js','--plan',file,'--out',out],{stdio:['ignore',fd,fd]});p.once('error',reject);p.once('close',code=>{fs.closeSync(fd);code?reject(Error(policy+' replay exit '+code)):resolve();});});
  console.log(JSON.stringify({policy,cases:plan.cases.length,exact:true}));
 }));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
