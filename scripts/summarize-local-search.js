#!/usr/bin/env node
'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto'),O=require('./summarize-garden-opportunity'),S=require('./lib/balance-scorecard'),M=require('./lib/measurement-contract');
const BASE=['grid-capable','grid-maker','grid-merchant','grid-caregiver'];
function summarize(report,options){
  const selected=M.select(report.plan.identity,options),contract=selected.contract;
  O.validate(report,options);assert(report.stable);const ids=[...BASE,...BASE.map(x=>x+'-search')],rows=report.results.filter(r=>r.job.observe);
  assert.equal(rows.length,144);assert.equal(report.controls.length,8);assert(report.controls.every(c=>c.match));
  assert.deepEqual([...new Set(report.plan.jobs.map(j=>j.policy))].sort(),ids.slice().sort());
  assert.deepEqual(report.results.filter(r=>!r.job.observe).map(r=>r.job.policy).sort(),ids.slice().sort());
  const arms=ids.map(id=>{
    const all=rows.filter(r=>r.job.policy===id),screen=all.filter(r=>r.job.seed<=16),extended=all.filter(r=>r.job.seed>10000);
    assert.deepEqual(screen.map(r=>r.job.seed).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i+1));
    assert.deepEqual(extended.map(r=>r.job.seed).sort((a,b)=>a-b),[10003,10004]);
    const counters={};let retainedReceipts=0;
    for(const r of all){
      assert.equal(r.job.days,600);assert.deepEqual(Object.keys(r.metrics).sort(),contract.metrics.map(m=>m.id).sort());
      assert(Number.isSafeInteger(r.terminal.watchdogRoutes)&&r.terminal.watchdogRoutes>=0);
      const d=r.row.policyDiagnostics;assert.deepEqual(d.errors,[]);
      if(id.endsWith('-search')){
        const q=d.localSearch;assert(q&&q.rules.version===1&&q.rules.maxSteps===8&&q.rules.maxStacks===3);
        for(const[k,v]of Object.entries(q.counters)){assert(Number.isSafeInteger(v)&&v>=0);counters[k]=(counters[k]||0)+v;}
        for(const p of q.receipts){assert(p.steps>=0&&p.steps<=8);assert(p.takes.length<=3);
          if(p.reason==='completed')for(const key of['bearer','node','inside','day'])assert.deepEqual(p.after[key],p.before[key],'Completed search crossed actor/day/scene');
        }
        retainedReceipts+=q.receipts.length;
      }else assert.equal(d.localSearch,undefined);
    }
    return{id,screenWins:screen.filter(r=>r.terminal.won).length,terminal:all.filter(r=>r.terminal.engineOver).length,
      capped:all.filter(r=>!r.terminal.engineOver).map(r=>r.job.seed),recovered:all.filter(r=>r.terminal.watchdogRoutes).map(r=>r.job.seed),
      dayRange:[Math.min(...all.map(r=>r.terminal.day)),Math.max(...all.map(r=>r.terminal.day))],counters,retainedReceipts};
  });
  const contrasts=BASE.map(before=>{
    const after=before+'-search',pairs=rows.filter(r=>r.job.policy===after).map(a=>({a,b:rows.find(b=>b.job.policy===before&&b.job.seed===a.job.seed)}));assert(pairs.every(p=>p.b));
    const compare=ps=>contract.metrics.map(m=>S.compareMetric(ps.map(p=>p.b.metrics[m.id]),ps.map(p=>p.a.metrics[m.id]),m,before+'/'+m.id));
    const screen=compare(pairs.filter(p=>p.a.job.seed<=16)),extended=compare(pairs.filter(p=>p.a.job.seed>10000));
    return{before,after,screen,extended,changedScreenSeeds:pairs.filter(p=>p.a.job.seed<=16&&JSON.stringify(p.a.metrics)!==JSON.stringify(p.b.metrics)).map(p=>p.a.job.seed),
      decision:screen.some(S.requiresReview)?'review_required':'no_material_signal'};
  });
  return{measurementIdentity:selected.measurementIdentity,scope:'Same-Game controller experiment, not a Game balance effect or default-policy promotion. Sixteen matched screen seeds and two separately analyzed extended cases per arm; all23 preserved. Boundary receipts are bounded; dropped counts remain explicit. Local approach/search can legitimately cost survival. Mixed profiles do not establish pacifist viability.',
    sourceDigest:crypto.createHash('sha256').update(JSON.stringify(report.plan.sources)).digest('hex'),arms,contrasts,
    decision:contrasts.some(c=>c.decision==='review_required')||arms.some(a=>a.capped.length||a.recovered.length)?'review_required':'no_material_signal'};
}
module.exports={summarize};
if(require.main===module)try{
 const historicalOptions={historical:process.argv.includes('--historical')};
  const[file,out]=process.argv.slice(2);assert(file&&out,'Usage: summarize-local-search.js <long.json.gz> <fresh-prefix>');const bytes=fs.readFileSync(file),r=summarize(JSON.parse(z.gunzipSync(bytes)),historicalOptions);
  r.input={file,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify(r,null,2)+'\n'),{flag:'wx'});
  const lines=['# Local search controller screen','',r.scope,'',`Decision: ${r.decision}.`,'','| Arm | Native endings/18 | Capped | Recovered | Screen wins/16 | Landed search steps | Take calls | Source stacks depleted | Receipts dropped |','| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...r.arms.map(a=>`| ${a.id} | ${a.terminal} | ${a.capped.length} | ${a.recovered.length} | ${a.screenWins} | ${a.counters.landedSteps??'not observed'} | ${a.counters.takeCalls??'not observed'} | ${a.counters.depletedStacks??'not observed'} | ${a.counters.receiptsDropped??0} |`),
    '','Counters include the two extended cases. Wins and all23 screen use16 seeds; the two extended cases remain separate. Depleted source stacks are transfers, not retained/equipped/useful gear or nourishment. No forced win-rate target.'];
  for(const c of r.contrasts)lines.push('',`## ${c.before} → ${c.after}: ${c.decision}`,'','| Metric | Before | After | Delta | Known pairs | Status |','| --- | ---: | ---: | ---: | ---: | --- |',...c.screen.map(m=>`| ${m.label} | ${m.before} | ${m.after} | ${m.delta} | ${m.pairs}/${m.totalPairs} | ${m.status} |`));
  fs.writeFileSync(out+'.md',lines.join('\n')+'\n',{flag:'wx'});console.log(JSON.stringify({decision:r.decision,arms:r.arms}));
}catch(e){console.error(e.stack);process.exitCode=1;}
