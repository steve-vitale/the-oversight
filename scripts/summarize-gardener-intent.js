#!/usr/bin/env node
'use strict';
const fs=require('fs'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict'),O=require('./summarize-garden-opportunity'),S=require('./lib/balance-scorecard'),M=require('./lib/measurement-contract');
const IDS=['garden-control','garden-invest','garden-control-expand','garden-invest-expand'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f)));
function summarize(report,options){
 const selected=M.select(report.plan.identity,options),contract=selected.contract;
 O.validate(report,options);const rows=report.results.filter(r=>r.job.observe),metricIds=contract.metrics.map(m=>m.id).sort();
 assert.equal(rows.length,72);assert.equal(report.controls.length,4);assert(report.controls.every(c=>c.match));
 const arms=IDS.map(id=>{
  const all=rows.filter(r=>r.job.policy===id),screen=all.filter(r=>r.job.seed<=16),extended=all.filter(r=>r.job.seed>10000);
  assert.deepEqual(screen.map(r=>r.job.seed).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i+1));assert.equal(extended.length,2);
  const decisions={},coverage=all.map(r=>O.summarizeCase(r));
  for(const r of all){
   assert.equal(r.job.days,600);assert.deepEqual(Object.keys(r.metrics).sort(),metricIds);
   assert.equal(typeof r.terminal.engineOver,'boolean');assert(Number.isSafeInteger(r.terminal.watchdogRoutes)&&r.terminal.watchdogRoutes>=0,'Unknown watchdog coverage cannot establish clean completion');
   const d=r.row.policyDiagnostics;assert.equal(d?.mode,'declared-gardener-mixed');assert.deepEqual(d.errors,[]);
   assert.equal(d.gardener.choicesDropped,0);assert.equal(d.gardener.plansDropped,0);
   for(const p of d.gardener.plans)decisions[p.reason]=(decisions[p.reason]||0)+1;
  }
  return{id,screenCases:screen.length,screenEnded:screen.filter(r=>r.terminal.engineOver).length,screenCapped:screen.filter(r=>!r.terminal.engineOver).length,
   screenRecovered:screen.filter(r=>r.terminal.watchdogRoutes>0).length,cleanScreenEndings:screen.filter(r=>r.terminal.engineOver&&!r.terminal.watchdogRoutes).length,
   screenWins:screen.filter(r=>r.terminal.won).length,extended:extended.map(r=>({seed:r.job.seed,...r.terminal})),
   maxCalendarDay:Math.max(...all.map(r=>r.terminal.day)),maxBeds:Math.max(...coverage.map(c=>c.capacity.maxPlots)),
   buildsBeyondFour:coverage.reduce((n,c)=>n+c.capacity.actualBuildsBeyondFour,0),queriesBeyondFour:coverage.reduce((n,c)=>n+c.capacity.makeQueriesBeyondFour,0),
   playerCasts:coverage.reduce((n,c)=>n+c.player.casts,0),npcCasts:coverage.reduce((n,c)=>n+c.npc.casts,0),
   trackCoreAcquisitions:coverage.reduce((n,c)=>n+c.player.trackAcquiredCore,0),namedPlayerGardenerCases:coverage.filter(c=>c.player.namedGardenerSampled).length,
   deferralsAndPlans:decisions,screenMetrics:Object.fromEntries(contract.metrics.map(m=>[m.id,{mean:S.mean(screen.map(r=>r.metrics[m.id]).filter(Number.isFinite)),known:screen.filter(r=>Number.isFinite(r.metrics[m.id])).length}]))};
 });
 const contrasts=[['priority_at_fixed_beds',IDS[0],IDS[1]],['expansion_at_normal_priority',IDS[0],IDS[2]],['priority_with_expansion',IDS[2],IDS[3]],['expansion_with_priority',IDS[1],IDS[3]]].map(([name,before,after])=>{
  const pairs=Array.from({length:16},(_,i)=>({seed:i+1,b:rows.find(r=>r.job.policy===before&&r.job.seed===i+1),a:rows.find(r=>r.job.policy===after&&r.job.seed===i+1)}));
  const metrics=contract.metrics.map(m=>S.compareMetric(pairs.map(p=>p.b.metrics[m.id]),pairs.map(p=>p.a.metrics[m.id]),m,name+'/'+m.id));
  return{name,before,after,pairs:16,decision:metrics.some(S.requiresReview)?'review_required':'no_material_signal',metrics,
   changedSeeds:pairs.filter(p=>JSON.stringify(p.b.metrics)!==JSON.stringify(p.a.metrics)).map(p=>p.seed)};
 });
 return{measurementIdentity:selected.measurementIdentity,scope:'Screening controller factorial on one Game. Different actual policy IDs are paired explicitly by seed; no rows or source identities are rewritten. 16 matched seeds, not confirmation. The two extra seeds per arm are separate extended coverage, not a64-seed holdout. Current observer controls prove neutrality, not build viability or a Game balance effect. Harness-recovered endings are retained in raw metrics but are not clean playable completions.',arms,contrasts,opportunity:O.summarize(report,options),
  watchdogCases:rows.filter(r=>r.terminal.watchdogRoutes>0).map(r=>({job:r.job,terminal:r.terminal})),
  decision:contrasts.some(c=>c.decision==='review_required')?'review_required':'no_material_signal',note:'All23 domains retained; wins in either direction prompt investigation. Capped cases remain incomplete. Projected food in policy decisions is an estimate, not produced/consumed food. Current prototype is pending review and ship-loop intake before use as a calibration gate.'};
}
module.exports={summarize};
if(require.main===module)try{
 const historicalOptions={historical:process.argv.includes('--historical')};
 const[file,out]=process.argv.slice(2);if(!file||!out)throw Error('Usage: node scripts/summarize-gardener-intent.js <current-long.json.gz> <fresh-prefix>');
 const report=read(file),result=summarize(report,historicalOptions);result.input={file,sha256:sha(fs.readFileSync(file)),summarizerSha256:sha(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n'))};
 fs.writeFileSync(out+'.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 const lines=['# Gardener intent factorial','',result.scope,'',`Decision: ${result.decision}. ${result.note}`,'','| Arm | Screen ended/capped | Recovered endings | Screen wins | Max beds | Builds >4 | Player casts | Earned core picks | Named Gardeners |','| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',...result.arms.map(a=>`| ${a.id} | ${a.screenEnded}/${a.screenCapped} | ${a.screenRecovered} | ${a.screenWins} | ${a.maxBeds} | ${a.buildsBeyondFour} | ${a.playerCasts} | ${a.trackCoreAcquisitions} | ${a.namedPlayerGardenerCases} |`),'','Counts of beds/casts/picks include the two separately listed extended cases; screen wins/endings use16 seeds only. Food output/intake/cost/spoilage and all exclusions remain in the JSON.'];
 for(const c of result.contrasts)lines.push('',`## ${c.name}: ${c.decision}`,'','| Metric | Before | After | Delta | Known pairs | Status |','| --- | ---: | ---: | ---: | ---: | --- |',...c.metrics.map(m=>`| ${m.label} | ${m.before} | ${m.after} | ${m.delta} | ${m.pairs}/${m.totalPairs} | ${m.status} |`));
 fs.writeFileSync(out+'.md',lines.join('\n')+'\n',{flag:'wx'});console.log(JSON.stringify({decision:result.decision,arms:result.arms,contrasts:result.contrasts.map(c=>({name:c.name,decision:c.decision,changedSeeds:c.changedSeeds}))}));
}catch(e){console.error(e.stack);process.exitCode=1;}
