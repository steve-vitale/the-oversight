#!/usr/bin/env node
'use strict';
// Explicit same-Game, named-controller experiment. Never relabel panel rows.
const fs=require('fs'),path=require('path'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto'),S=require('./lib/balance-scorecard'),C=require('./lib/balance-cohorts'),M=require('./lib/measurement-contract');
const BASE=['capable','maker','merchant','caregiver'],IDS=BASE.flatMap(p=>[p,'grid-'+p]);
function validate(panel,options){
 const selected=M.select(panel,options);assert.equal(panel.sourceDigest,crypto.createHash('sha256').update(JSON.stringify(panel.sources)).digest('hex'));
 assert.deepEqual(C.validate(panel),[]);assert(panel.validity.sourcesStable);assert.equal(panel.rows.length,128);assert.equal(panel.options.days,150);
 assert.deepEqual(panel.options.policies.slice().sort(),IDS.slice().sort());assert.equal(panel.options.seeds.length,16);assert.equal(panel.validity.neutrality.length,8);assert(panel.validity.neutrality.every(n=>n.match&&!n.warnings));
 for(const row of panel.rows){assert.deepEqual(row.warnings,[]);assert.deepEqual(row.observerErrors,[]);assert.deepEqual(row.gear.errors,[]);assert.deepEqual(Object.keys(row.metrics).sort(),selected.contract.metrics.map(m=>m.id).sort());assert(Object.values(row.metrics).every(v=>v===null||Number.isFinite(v)));}
 return selected;
}
function summarize(panel,options){
 const selected=validate(panel,options),contract=selected.contract;
 const contrasts=BASE.map(base=>{
  const pairs=panel.options.seeds.map(seed=>({seed,b:panel.rows.find(r=>r.row.policy===base&&r.row.seed===seed),a:panel.rows.find(r=>r.row.policy==='grid-'+base&&r.row.seed===seed)}));
  const counters={},reasons={};let retreatKnown=0,retreatTurns=0;
  for(const{a}of pairs){const d=a.row.policyDiagnostics;assert.equal(d.mode,'experimental-public-grid-travel');assert.deepEqual(d.errors,[]);assert(d.publicTravel?.rules.version===1);for(const[k,v]of Object.entries(d.publicTravel.counters)){assert(Number.isFinite(v)&&v>=0);counters[k]=(counters[k]||0)+v;}
   const retreat=d.counters.gridStandoffRetreatTurns;if(Number.isFinite(retreat)){retreatKnown++;retreatTurns+=retreat;}
   for(const r of d.publicTravel.receipts){reasons[r.reason]=(reasons[r.reason]||0)+1;for(const h of r.hops){assert.equal(Math.abs(h.to[0]-h.from[0])+Math.abs(h.to[1]-h.from[1]),1);assert(Number.isSafeInteger(h.approachSteps)&&h.approachSteps>=0);}}
  }
  const metrics=contract.metrics.map(m=>S.compareMetric(pairs.map(p=>p.b.metrics[m.id]),pairs.map(p=>p.a.metrics[m.id]),m,base+'/public-grid/'+m.id));
  return{base,physical:'grid-'+base,seeds:pairs.map(p=>p.seed),cases:pairs.length,decision:metrics.some(S.requiresReview)?'review_required':'no_material_signal',metrics,counters,standoff:{knownCases:retreatKnown,unknownCases:pairs.length-retreatKnown,retreatTurns:retreatKnown===pairs.length?retreatTurns:null},retainedReceiptReasons:reasons,
   outcomes:pairs.map(p=>({seed:p.seed,before:{won:p.b.row.won,end:p.b.row.endReason,days:p.b.row.gameDays},after:{won:p.a.row.won,end:p.a.row.endReason,days:p.a.row.gameDays}}))};
 });
 return{measurementIdentity:selected.measurementIdentity,scope:'Explicit paired controller experiment on one source/observer/contract/harness. Original profile IDs remain unmodified. Sixteen seeds per profile are screening, not confirmation or broad human-play equivalence. Grid profiles change real travel cadence/exposure and, where recorded, choose native retreat from an unreachable-human standoff. This is a combined controller treatment, not attribution of every outcome to walking alone. No Game numbers/defaults change.',decision:contrasts.some(c=>c.decision==='review_required')?'review_required':'no_material_signal',sourceDigest:panel.sourceDigest,observerDigest:panel.observerDigest,contractDigest:panel.contractDigest,configuration:panel.options,controls:panel.validity.neutrality,contrasts,
  limitations:'Cumulative travel counters are complete; receipt reason samples cover only the last256 requests per run, with olderReceiptsDropped explicit. No zero-call inference without opportunity. Caps are incomplete; long native-ending coverage is separate. More wins never cancel other warnings. No numeric/default/calibration promotion.'};
}
module.exports={validate,summarize};
if(require.main===module)try{
 const historicalOptions={historical:process.argv.includes('--historical')};
 const[file,out]=process.argv.slice(2);if(!file||!out)throw Error('Usage: node scripts/summarize-public-travel.js <eight-profile-panel.json.gz> <fresh-output-prefix>');
 const bytes=fs.readFileSync(file),r=summarize(JSON.parse(z.gunzipSync(bytes)),historicalOptions);r.input={file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),summarizerSha256:crypto.createHash('sha256').update(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n')).digest('hex')};fs.writeFileSync(out+'.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});
 const lines=['# Native grid travel controller screen','',r.scope,'',`Decision: ${r.decision}.`, '',r.limitations];
 for(const c of r.contrasts)lines.push('',`## ${c.base} versus ${c.physical}: ${c.decision}`,'',JSON.stringify(c.counters),'','| Metric | Macro | Physical | Delta | Known pairs | Status |','| --- | ---: | ---: | ---: | ---: | --- |',...c.metrics.map(m=>`| ${m.label} | ${m.before} | ${m.after} | ${m.delta} | ${m.pairs}/${m.totalPairs} | ${m.status} |`));
 fs.writeFileSync(out+'.md',lines.join('\n')+'\n',{flag:'wx'});console.log(JSON.stringify({decision:r.decision,contrasts:r.contrasts.map(c=>({base:c.base,decision:c.decision,counters:c.counters}))}));
}catch(error){console.error(error.stack);process.exitCode=1;}
