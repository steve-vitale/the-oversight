'use strict';
const fs=require('fs'),z=require('zlib'),path=require('path'),assert=require('assert/strict'),B=require('./balance-panel'),S=require('./lib/balance-scorecard');
const PAIRS=[['garden-diplomacy-control','garden-diplomacy-visit'],['garden-diplomacy-visit','garden-diplomacy-water-safe']];
function summarize(panel,root=path.resolve(__dirname,'..')){
 assert.deepEqual(panel.sources,B.manifest(root),'Current identical Game/controller inputs required');
 const identity=B.observerIdentity(root);assert.equal(panel.observerDigest,identity.observerDigest);assert.equal(panel.contractDigest,identity.contractDigest);
 assert(panel.validity.sourcesStable&&panel.validity.neutrality.length&&panel.validity.neutrality.every(n=>n.match&&!n.warnings),'Real neutral controls required');
 const IDS=panel.options.policies;assert(PAIRS.some(p=>JSON.stringify(p)===JSON.stringify(IDS)),'Declared controller contrast required');assert(panel.options.seeds.length>=16,'At least16 matched screen seeds');
 const groups=IDS.map(id=>panel.rows.filter(r=>r.row.policy===id));
 for(let i=0;i<2;i++){
  assert(panel.validity.neutrality.some(n=>n.policy===IDS[i]),'Each arm needs a neutral control');
  assert.equal(groups[i].length,panel.options.seeds.length);assert.equal(new Set(groups[i].map(r=>r.row.seed)).size,groups[i].length,'Unique paired seeds required');
  assert(groups[i].every(r=>!r.warnings.length&&!r.observerErrors.length&&!r.gear.errors.length),'Warnings/errors require investigation');
  const keys=S.contract.metrics.map(m=>m.id).sort();
  assert(groups[i].every(r=>JSON.stringify(Object.keys(r.metrics).sort())===JSON.stringify(keys)&&Object.values(r.metrics).every(v=>v===null||Number.isFinite(v))),'Complete declared metrics with explicit unknowns required');
 }
 const pairs=panel.options.seeds.map(seed=>groups.map(g=>{const row=g.find(r=>r.row.seed===seed);assert(row,'Matched played seed required');return row;}));
 const metrics=S.contract.metrics.map(m=>S.compareMetric(pairs.map(p=>p[0].metrics[m.id]),pairs.map(p=>p[1].metrics[m.id]),m,'garden-diplomacy/'+m.id));
 const arms=groups.map((rows,i)=>({id:IDS[i],cases:rows.length,wins:rows.reduce((n,r)=>n+r.row.won,0),caps:rows.filter(r=>r.row.stop.kind==='observation-cap').map(r=>r.row.seed),
  attemptCensus:rows.map(r=>({seed:r.row.seed,...require('./lib/diplomacy-usage').summarize(r.row.policyDiagnostics.diplomacy)})),
  agreementSeeds:rows.filter(r=>require('./lib/diplomacy-usage').summarize(r.row.policyDiagnostics.diplomacy).newAgreementsObserved>0).map(r=>r.row.seed),
  gridCrossings:rows.reduce((n,r)=>n+(r.row.policyDiagnostics.diplomacy.travel.counters.crossedNodes||0),0),
  water:rows.every(r=>r.row.policyDiagnostics.diplomacy.water)?{
   refusedChecks:rows.reduce((n,r)=>n+r.row.policyDiagnostics.diplomacy.water.decisions.filter(c=>c.water.reason).length,0),
   recordedActions:rows.reduce((n,r)=>n+r.row.policyDiagnostics.diplomacy.receipts.reduce((s,v)=>s+v.actions.length,0),0),
   unsafeRecordedActions:rows.reduce((n,r)=>n+r.row.policyDiagnostics.diplomacy.receipts.reduce((s,v)=>s+v.actions.filter(a=>a.before.water?.reason!==null).length,0),0),
   dropped:rows.reduce((n,r)=>n+r.row.policyDiagnostics.diplomacy.water.dropped,0),scope:'Checks are calls, not unique available opportunities. Transit safety remains separately unproven.'
  }:null}));
 return{schemaVersion:2,scope:'Matched controller contrast on one Game; raw distinct IDs and rows are preserved.16 seeds is screening, not confirmation or pacifist viability. Only diplomacy movement uses native grid travel. Historical schema1 visits counted attempts, not successful arrivals or interactions; use the explicit attempt census.',
  identity,arms,decision:metrics.some(S.requiresReview)?'review_required':'no_material_signal',policies:[{policy:IDS.join(' -> '),cases:pairs.length,confirmationSized:pairs.length>=S.contract.confirmationSeeds,metrics}],
  changedSeeds:pairs.filter(p=>p[0].stateHash!==p[1].stateHash).map(p=>p[0].row.seed),note:'No weighted score. Winning should remain difficult; win changes require investigation. All survival/community/resource/progression/gear warnings remain open. Visits and deals do not establish useful food or protection from other raiders.'};
}
module.exports={summarize};
if(require.main===module)try{const[file,out]=process.argv.slice(2);assert(file&&out,'Usage: node scripts/summarize-garden-diplomacy.js <panel.json.gz> <fresh-prefix>');const bytes=fs.readFileSync(file),result=summarize(JSON.parse(z.gunzipSync(bytes)));result.input={file,sha256:require('crypto').createHash('sha256').update(bytes).digest('hex')};fs.writeFileSync(out+'.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});fs.writeFileSync(out+'.md',S.markdown(result),{flag:'wx'});console.log(JSON.stringify({decision:result.decision,arms:result.arms,changedSeeds:result.changedSeeds}));}catch(e){console.error(e.stack);process.exitCode=1;}
