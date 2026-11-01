#!/usr/bin/env node
'use strict';
// A declared player-strategy experiment, never a Game balance clearance.
// The ordinary Game comparator remains strict and its rejection is retained.
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto'),S=require('./lib/balance-scorecard'),C=require('./lib/balance-cohorts');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function compare(before,after,ablation,options={}){
 const measurement=require('./lib/measurement-contract').select(before,{historical:options.historical===true}),contract=measurement.contract;
 assert.equal(ablation.scope.includes('controller-layer ablation'),true,'Declared controller experiment required');
 assert.deepEqual(ablation.differences,['scripts/policies/ledger-aware.js']);
 assert(same(before.sources,ablation.offManifest)&&same(after.sources,ablation.sourceManifest),'Exact constructed off/on input manifests required');
 const differences=Object.keys({...before.sources,...after.sources}).filter(f=>before.sources[f]!==after.sources[f]);
 assert.deepEqual(differences,ablation.differences,'Game, other controllers and harness must be identical');
 assert(same(before.options,after.options),'Matched experiment configuration required');
 assert(!before.options.occupation,'Job availability trials need a separate declared paired selection design');
 assert.equal(before.observerDigest,after.observerDigest);assert.equal(before.contractDigest,measurement.measurementIdentity.contractDigest);assert.equal(after.contractDigest,measurement.measurementIdentity.contractDigest);
 const metricIds=contract.metrics.map(m=>m.id).sort();
 for(const p of[before,after]){
  assert.equal(p.sourceDigest,sha(JSON.stringify(p.sources)),'Source digest must match the retained manifest');
  assert.equal(p.validity.sourcesStable,true);assert.deepEqual(C.validate(p),[]);
  assert(p.options.policies.every(policy=>p.validity.neutrality.some(n=>n.policy===policy&&n.match&&!n.warnings)),'Actual neutrality required for each played profile');
  for(const r of p.rows){assert(!r.warnings.length&&!r.observerErrors.length&&!r.gear.errors.length);assert.deepEqual(Object.keys(r.metrics).sort(),metricIds,'All metrics, including explicit unknowns, required');assert(Object.values(r.metrics).every(v=>v===null||Number.isFinite(v)));}
 }
 const ordinary=S.comparePanels(before,after,{historical:options.historical===true});
 assert.equal(ordinary.decision,'invalid');assert.deepEqual(ordinary.errors,['Policy/harness changed: scripts/policies/ledger-aware.js'],'Do not hide additional invalidity behind the declared controller change');
 const key=r=>r.row.policy+':'+r.row.seed,byKey=new Map(before.rows.map(r=>[key(r),r]));assert(after.rows.every(r=>byKey.has(key(r))));
 const policies=after.options.policies.map(policy=>{const rows=after.rows.filter(r=>r.row.policy===policy);return{policy,cases:rows.length,confirmationSized:rows.length>=contract.confirmationSeeds,decision:'controller_review_required',metrics:contract.metrics.map(m=>S.compareMetric(rows.map(r=>byKey.get(key(r)).metrics[m.id]),rows.map(r=>r.metrics[m.id]),m,policy+'/'+m.id))};});
 return{schemaVersion:1,type:'explicit_controller_experiment',decision:'controller_review_required',errors:[],standardGameComparison:ordinary,measurementIdentity:measurement.measurementIdentity,sourceDigests:[before.sourceDigest,after.sourceDigest],observerDigest:after.observerDigest,contractDigest:after.contractDigest,policies,note:'Different deliberate player strategies on the identical Game. All29 retained with the unchanged metric definitions. No Game balance clearance, default promotion, pure pacifist or lifetime win-probability claim. Early wins compete with later exposure; inspect every domain.'};
}
module.exports={compare};
if(require.main===module)try{
 assert.equal(process.argv.length,6,'Usage: node scripts/controller-trial-report.js <before-panel.gz> <after-panel.gz> <ablation.json> <fresh-prefix>');
 const [beforeFile,afterFile,ablationFile,out]=process.argv.slice(2);assert(!fs.existsSync(out+'.json')&&!fs.existsSync(out+'.md'),'Fresh outputs required');
 const load=f=>JSON.parse(f.endsWith('.gz')?z.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f,'utf8')),report=compare(load(beforeFile),load(afterFile),load(ablationFile));
 report.inputs=[beforeFile,afterFile,ablationFile].map(file=>({file,sha256:sha(fs.readFileSync(file))}));fs.writeFileSync(out+'.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});fs.writeFileSync(out+'.md','# Explicit controller experiment\n\n'+S.markdown(report),{flag:'wx'});console.log(report.decision);
}catch(e){console.error(e.stack);process.exitCode=1;}
