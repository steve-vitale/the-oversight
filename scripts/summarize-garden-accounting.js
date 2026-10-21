#!/usr/bin/env node
'use strict';
const fs=require('fs'),z=require('zlib'),crypto=require('crypto'),R=require('./garden-longplay-audit'),A=require('./lib/garden-accounting'),contract=require('./balance-metrics.json');
const read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f))),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const arg=n=>{const i=process.argv.indexOf('--'+n);if(i<0)throw Error('--'+n+' required');return process.argv[i+1];};
function validate(r){
 if(!r.stable||!r.plan?.jobs?.length||r.results?.length!==r.plan.jobs.length)throw Error('Incomplete or unstable report');
 const ids=contract.metrics.map(m=>m.id).sort();
 for(const job of r.plan.jobs){const found=r.results.filter(x=>same(x.job,job));if(found.length!==1)throw Error('Missing/duplicate case');const x=found[0];R.validateResult(x,job,r.plan.sources);
  if(x.warnings.length||x.observerErrors.length||x.gearErrors.length||x.garden?.errors.length||!same(Object.keys(x.metrics).sort(),ids))throw Error('Invalid observed case');
  if(job.observe&&(!x.garden?.accounting||x.garden.schemaVersion!==2))throw Error('Current accounting observer required');
 }
 const off=r.results.filter(x=>!x.job.observe);if(!off.length||r.controls.length!==off.length||r.controls.some(x=>!x.match))throw Error('Real neutral controls required');
 for(const b of off){const a=r.results.find(x=>x.job.observe&&x.job.policy===b.job.policy&&x.job.seed===b.job.seed&&x.job.days===b.job.days);if(!a||!['row','stateHash','metrics','rngTail'].every(k=>same(a[k],b[k])))throw Error('Passive control differs');}
}
function summarize(r){
 const groups=[];
 for(const row of r.results.filter(x=>x.job.observe)){
  const key=row.job.policy+':'+row.job.days;let g=groups.find(g=>g.key===key);
  if(!g){g={key,policy:row.job.policy,cap:row.job.days,cases:0,terminal:0,capped:0,planted:0,harvesting:0,knownIntakeCases:0,unknownIntakeCases:0,eatingGardenCases:0,outputKcal:0,initialNominal:{},consumed:{},nourishment:{},spoilageRemoved:{},remainingNominal:{},costs:{playerReserveKcal:0,npcHungerEquivalentKcal:0,seedUnits:0,seedNominalKcal:0,unvaluedSeedUnits:0,playerRequestedTicks:0,playerActionTicks:0,unknownWindows:0},maxCalendarDay:0};for(const k of A.KINDS)for(const field of ['initialNominal','consumed','nourishment','spoilageRemoved','remainingNominal'])g[field][k]=0;groups.push(g);}
  const s=row.garden,a=s.accounting;g.cases++;g.terminal+=+row.terminal.engineOver;g.capped+=+!row.terminal.engineOver;g.maxCalendarDay=Math.max(g.maxCalendarDay,row.terminal.day);
  g.planted+=+(s.sown.player+s.sown.npc>0);g.harvesting+=+(s.playerHarvests+s.pantryDeliveries>0);g.outputKcal+=s.playerHarvestKcal+s.pantryDeliveredKcal;
  if(a.intake.status==='known'){g.knownIntakeCases++;const t=a.intake.totals;g.eatingGardenCases+=+(Object.values(t.origins).reduce((n,p)=>n+p.kcal,0)>0);for(const k of A.KINDS){g.consumed[k]+=t.origins[k]?.kcal||0;g.nourishment[k]+=t.origins[k]?.nourishment||0;}}else g.unknownIntakeCases++;
  for(const k of A.KINDS){g.initialNominal[k]+=a.initialStocks.totals[k];g.spoilageRemoved[k]+=a.removedBySpoilageSweep[k];g.remainingNominal[k]+=a.stocks.totals[k];}
  for(const k of Object.keys(g.costs))g.costs[k]+=a.costs[k];
 }for(const g of groups){const sum=key=>Object.values(g[key]).reduce((n,x)=>n+x,0);g.unallocatedNominalKcal=g.unknownIntakeCases?null:g.outputKcal+sum('initialNominal')-sum('consumed')-sum('spoilageRemoved')-sum('remainingNominal');}return groups.sort((a,b)=>a.cap-b.cap||a.policy.localeCompare(b.policy));
}
function compare(before,after){
 validate(before);validate(after);
 for(const key of ['identity','toolHashes','configuration','jobs','comparisonExclusions'])if(!same(before.plan[key],after.plan[key]))throw Error('Mixed methodology: '+key);
 for(const file of Object.keys(before.plan.sources).filter(f=>f.startsWith('scripts/policies/')||['scripts/sim-harness.js','scripts/sweep-compare.js'].includes(f)))if(before.plan.sources[file]!==after.plan.sources[file])throw Error('Controller/harness changed: '+file);
 const pairs=after.results.map(a=>{const b=before.results.find(b=>same(a.job,b.job));if(!b)throw Error('Unmatched case');return{job:a.job,stateExcludingDeclaredInstrumentation:a.comparableStateHash===b.comparableStateHash,outcome:same(a.row,b.row),all23:same(a.metrics,b.metrics),rng:same(a.rngTail,b.rngTail)};});
 return{scope:'Natural mixed-policy campaigns. Ordinary/assisted describes the harvested cycle, not an ordinary-only or intentional ability build. All known intake is a lower bound; unclassified includes non-garden food and unknown origins. Nominal stocks and spoilage-sweep removals are not edible security. Unallocated nominal kcal is a diagnostic residual: it may include processing, seed use, barter/export, loss at run end, uncovered storage or dropped provenance; it is not classified waste. Direct debits, hunger equivalents, seed stock and time are separate; no net-profit or causal magic-payoff estimate.',comparisonExclusions:after.plan.comparisonExclusions,pairs,before:summarize(before),after:summarize(after)};
}
module.exports={validate,summarize,compare};
if(require.main===module)try{
 const beforeFile=arg('before'),afterFile=arg('after'),out=arg('out'),r=compare(read(beforeFile),read(afterFile));
 r.inputs={before:{file:beforeFile,sha256:sha(fs.readFileSync(beforeFile))},after:{file:afterFile,sha256:sha(fs.readFileSync(afterFile))},summarizerSha256:sha(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n'))};
 const total=(g,k)=>Object.values(g[k]).reduce((n,x)=>n+x,0),num=n=>Math.round(n).toLocaleString('en-US');
 const rows=r.after.map(g=>`| ${g.policy} | ${g.cap} | ${g.cases} | ${g.terminal} / ${g.capped} | ${g.harvesting} | ${g.eatingGardenCases} | ${num(g.outputKcal)} | ${num(total(g,'consumed'))} | ${num(total(g,'nourishment'))} | ${num(total(g,'spoilageRemoved'))} | ${num(total(g,'remainingNominal'))} |`);
 const match=r.pairs.every(p=>p.stateExcludingDeclaredInstrumentation&&p.outcome&&p.all23&&p.rng);
 const md=['# Natural garden accounting','',r.scope,'',`${r.pairs.length} exact paired jobs including controls. Declared-field comparison, outcomes, all23 metrics and RNG all match: ${match}.`,'','| Policy | Iteration cap | Cases | Terminal / capped | Harvesting | Eating garden food | Output kcal | Consumed crop kcal | Useful crop nourishment | Swept spoilage kcal | End stock nominal kcal |','| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',...rows,'','Detailed origin classes and direct cost quantities remain in the JSON. Before-arm origin history remains unknown; it is not zero intake. This cohort does not establish all-playstyle viability or independent small-effect confirmation.',''].join('\n');
 fs.writeFileSync(out+'.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});fs.writeFileSync(out+'.md',md,{flag:'wx'});console.log(JSON.stringify({pairs:r.pairs.length,exact:match,groups:r.after.length}));
}catch(e){console.error(e.stack);process.exitCode=1;}
