#!/usr/bin/env node
'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto'),O=require('./summarize-garden-opportunity'),A=require('./summarize-garden-accounting'),S=require('./lib/balance-scorecard'),M=require('./lib/measurement-contract');
const DEFAULT_IDS=['garden-invest','garden-invest-expand','garden-invest-early','garden-invest-expand-early'];
function summarizeTiming(report,config,options){
 const selected=M.select(report.plan.identity,options),contract=selected.contract;
 const IDS=config.ids,{suffix,diagnostic,phase,countKey}=config;
 O.validate(report,options);const rows=report.results.filter(r=>r.job.observe);assert.equal(rows.length,72);assert.equal(report.controls.length,4);assert(report.controls.every(c=>c.match));
 assert.deepEqual([...new Set(report.plan.jobs.map(j=>j.policy))].sort(),[...IDS].sort());
 assert.deepEqual(report.results.filter(r=>!r.job.observe).map(r=>r.job.policy).sort(),[...IDS].sort(),'One real observer-off control per timing arm required');
 const accounting=A.summarize(report),arms=IDS.map(id=>{
  const all=rows.filter(r=>r.job.policy===id),screen=all.filter(r=>r.job.seed<=16),extended=all.filter(r=>r.job.seed>10000),reasons={};let sessions=0,early=0;
  assert.deepEqual(screen.map(r=>r.job.seed).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i+1));assert.deepEqual(extended.map(r=>r.job.seed).sort((a,b)=>a-b),[10003,10004]);
  for(const r of all){
   assert.equal(r.job.days,600);assert.deepEqual(Object.keys(r.metrics).sort(),contract.metrics.map(m=>m.id).sort());assert(Number.isSafeInteger(r.terminal.watchdogRoutes)&&r.terminal.watchdogRoutes>=0,'Unknown recovery coverage');
   const d=r.row.policyDiagnostics;assert.deepEqual(d.errors,[]);assert.equal(d.gardener.choicesDropped,0);assert.equal(d.gardener.plansDropped,0);
   if(id.endsWith(suffix)){assert.equal(d[diagnostic].dropped,0);const worked=new Set();
    for(const receipt of d[diagnostic].receipts){assert([phase,'late'].includes(receipt.phase));const key=receipt.before.bearer+':'+receipt.before.day;reasons[receipt.phase+':'+receipt.reason]=(reasons[receipt.phase+':'+receipt.reason]||0)+1;
     if(receipt.reason==='session'){config.validateSession?.(receipt);assert(!worked.has(key),'Repeated garden session for an early-worked bearer/day');sessions++;if(receipt.phase===phase){early++;worked.add(key);}}
    }
   }else assert.equal(d[diagnostic],undefined);
  }
  return{id,screenCases:16,extendedCases:2,screenWins:screen.filter(r=>r.terminal.won).length,terminal:all.filter(r=>r.terminal.engineOver).length,capped:all.filter(r=>!r.terminal.engineOver).length,recovered:all.filter(r=>r.terminal.watchdogRoutes).map(r=>r.job.seed),maxDay:Math.max(...all.map(r=>r.terminal.day)),sessions:id.endsWith(suffix)?sessions:null,[countKey]:id.endsWith(suffix)?early:null,scheduleReasons:reasons,accounting:accounting.find(a=>a.policy===id),capacity:all.map(O.summarizeCase).map(c=>c.capacity)};
 });
 const contrasts=[['fixed_beds',IDS[0],IDS[2]],['expansion',IDS[1],IDS[3]]].map(([name,before,after])=>{
  const pairs=rows.filter(r=>r.job.policy===after).map(a=>({a,b:rows.find(b=>b.job.policy===before&&b.job.seed===a.job.seed)}));assert(pairs.every(p=>p.b));
  const compare=ps=>contract.metrics.map(m=>S.compareMetric(ps.map(p=>p.b.metrics[m.id]),ps.map(p=>p.a.metrics[m.id]),m,name+'/'+m.id));
  const screen=compare(pairs.filter(p=>p.a.job.seed<=16)),extended=compare(pairs.filter(p=>p.a.job.seed>10000));
  return{name,before,after,screen,extended,changedSeeds:pairs.filter(p=>JSON.stringify(p.a.metrics)!==JSON.stringify(p.b.metrics)).map(p=>p.a.job.seed),decision:screen.some(S.requiresReview)?'review_required':'no_material_signal'};
 });
 return{measurementIdentity:selected.measurementIdentity,scope:config.scope,arms,contrasts,decision:contrasts.some(c=>c.decision==='review_required')?'review_required':'no_material_signal'};
}
function summarize(report,options){return summarizeTiming(report,{ids:DEFAULT_IDS,suffix:'-early',diagnostic:'scheduling',phase:'early',countKey:'earlySessions',scope:'Prospectively declared controller-timing screen on one Game. Sixteen matched screen seeds plus two separately analyzed extended cases per arm; not independent confirmation or a numeric Game effect. All policies can earn magic. Gross yield, nominal stocks and snapshot reserve deltas are not useful food or net cost. Recovered/capped cases do not prove clean completion.'},options);}
module.exports={summarize,summarizeTiming};
if(require.main===module)try{
 const historicalOptions={historical:process.argv.includes('--historical')};
 const[file,out]=process.argv.slice(2);if(!file||!out)throw Error('Usage: summarize-garden-scheduling.js <long.json.gz> <fresh-prefix>');const bytes=fs.readFileSync(file),result=summarize(JSON.parse(z.gunzipSync(bytes)),historicalOptions);result.input={file,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 fs.writeFileSync(out+'.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});const total=o=>Object.values(o).reduce((n,x)=>n+x,0),lines=['# Garden scheduling screen','',result.scope,'',`Decision: ${result.decision}.`,'','| Arm | Ended/capped | Recovered | Screen wins/16 | Early sessions | Crop food kcal eaten | Useful crop nourishment |','| --- | ---: | ---: | ---: | ---: | ---: | ---: |',...result.arms.map(a=>`| ${a.id} | ${a.terminal}/${a.capped} | ${a.recovered.length} | ${a.screenWins} | ${a.earlySessions} | ${Math.round(total(a.accounting.consumed))} | ${Math.round(total(a.accounting.nourishment))} |`),'','Food/session totals include extended cases. Wins use screen seeds only; extended all23 stay separate in JSON.'];
 for(const c of result.contrasts)lines.push('',`## ${c.name}: ${c.decision}`,'','| Metric | Before | After | Delta | Known pairs | Status |','| --- | ---: | ---: | ---: | ---: | --- |',...c.screen.map(m=>`| ${m.label} | ${m.before} | ${m.after} | ${m.delta} | ${m.pairs}/${m.totalPairs} | ${m.status} |`));fs.writeFileSync(out+'.md',lines.join('\n')+'\n',{flag:'wx'});console.log(JSON.stringify({decision:result.decision,arms:result.arms.map(a=>({id:a.id,terminal:a.terminal,capped:a.capped,recovered:a.recovered,earlySessions:a.earlySessions})),contrasts:result.contrasts.map(c=>({name:c.name,decision:c.decision,changedSeeds:c.changedSeeds}))}));
}catch(e){console.error(e.stack);process.exitCode=1;}
