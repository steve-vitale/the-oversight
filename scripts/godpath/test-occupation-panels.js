'use strict';
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto');
const K=require('./lib'),T=K.reporter('occupation panels'),S=require('../lib/balance-scorecard'),C=require('../lib/balance-cohorts'),F=require('../balance-features');
const OF=require('./occupation-fixtures.json');
// Preserve one actually offered non-first nurse, one NPC-only nurse and one
// absent nurse. The larger Muse occupation pool changed the old seed receipts.
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-cohort-')),driver=path.join(temporary,'observer'),out=path.join(temporary,'cases');
const read=()=>JSON.parse(z.gunzipSync(fs.readFileSync(path.join(out,'panel.json.gz')))),copy=x=>JSON.parse(JSON.stringify(x));
try{
 for(const f of ['balance-panel.js','gear-usage-audit.js','balance-metrics.json','lib/balance-scorecard.js','lib/simulation-flags.js','lib/balance-cohorts.js']){
  const target=path.join(driver,'scripts',f);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(K.ROOT,'scripts',f),target);
 }
 const run=occupation=>{
  const p=cp.spawnSync(process.execPath,[path.join(driver,'scripts/balance-panel.js'),'--root',K.ROOT,'--seeds',[OF.absentSeed,OF.npcOnlySeed,OF.playedSeed].join(','),'--proof-seeds',[OF.absentSeed,OF.npcOnlySeed,OF.playedSeed].join(','),'--policies','caregiver','--days','2','--occupation',occupation,'--out',out,'--par','2'],{cwd:K.ROOT,encoding:'utf8',env:process.env,maxBuffer:8*1024*1024});
  if(p.status!==0)throw Error(p.stdout+p.stderr);return read();
 };
 const nurse=run('er_nurse');
 T.ok('real CLI retains one actual campaign and both absent offers',nurse.rows.length===1&&nurse.exclusions.length===2&&nurse.rows[0].row.seed===OF.playedSeed);
 T.ok('played bearer retains the actual non-first occupation card',nurse.rows[0].row.selection.selectedOfferIndex===1&&nurse.rows[0].row.selection.occupation==='er_nurse');
 T.ok('campaign neutrality and deterministic exclusions are separate',nurse.validity.neutrality.length===1&&nurse.validity.selection.length===2&&nurse.validity.neutrality.every(n=>n.match));
 T.ok('excluded jobs contain no synthetic loss, usage or exposure',nurse.exclusions.every(r=>r.excluded&&!r.metrics&&!r.gear&&r.row.won===undefined));
 T.ok('unchanged settings reuse only their six exact on/off cases',run('er_nurse').reused===6);
 fs.appendFileSync(path.join(driver,'scripts/lib/balance-cohorts.js'),'\n// Independent observer-input cache proof.\n');
 const changedObserver=run('er_nurse');
 T.ok('changed shared cohort observer invalidates every cached case',changedObserver.reused===0&&changedObserver.observerDigest!==nurse.observerDigest);
 const alternate=run(OF.alternateOccupation);
 T.ok('occupation option changes cache identity and actual selected jobs',alternate.reused===0&&alternate.rows.length===2&&alternate.rows.every(r=>r.row.selection.occupation===OF.alternateOccupation));
 T.ok('complete played/excluded accounting validates the real panel',C.validate(nurse).length===0);
 const report=S.comparePanels(nurse,copy(nurse)),policy=report.policies[0];
 T.ok('only the one matched played campaign enters metrics',report.decision==='review_required'&&policy.cases===1&&!policy.confirmationSized&&policy.cohort.before.attempted===3&&policy.metrics.find(m=>m.id==='won').pairs===1);
 const features=F.summarize(nurse)[0];
 T.ok('feature coverage uses played runs, with explicit excluded offers',features.runs===1&&features.cohort.excluded===2&&features.controllerDiagnostics.measuredRuns===1);
 const empty=copy(nurse);empty.options.seeds=[OF.absentSeed,OF.npcOnlySeed];empty.rows=[];empty.validity.neutrality=[];
 const emptyReport=S.comparePanels(empty,copy(empty)),emptyFeatures=F.summarize(empty)[0];
 T.ok('all-excluded cohorts cannot become wins or confirmation-sized',emptyReport.decision==='review_required'&&emptyReport.policies[0].cases===0&&!emptyReport.policies[0].confirmationSized&&emptyReport.policies[0].metrics.every(m=>m.pairs===0&&m.status==='not_observed'));
 T.ok('all-excluded cohorts do not become dead features or NPC exposure',emptyFeatures.runs===0&&!emptyFeatures.completeMethodCoverage&&emptyFeatures.features.length===0&&emptyFeatures.npcExposure.measuredRuns===0);
 // Structural denominator fixture built from real receipts, not world evidence
 // for these additional keys. Only the original played-seed campaign is observed.
 const sparse=copy(nurse);sparse.options.seeds=[OF.playedSeed,...Array.from({length:63},(_,i)=>3000+i)];
 sparse.exclusions=sparse.options.seeds.slice(1).map(seed=>{const r=copy(nurse.exclusions[0]);r.row.seed=seed;return r;});
 sparse.validity.selection=[{policy:'caregiver',seed:3000,match:true,warnings:0,kind:'selection'}];
 const sparseReport=S.comparePanels(sparse,copy(sparse));
 T.ok('64 requested seeds cannot certify one eligible campaign',sparseReport.policies[0].cohort.before.attempted===64&&sparseReport.policies[0].cases===1&&!sparseReport.policies[0].confirmationSized&&sparseReport.policies[0].metrics.find(m=>m.id==='won').pairs===1);
 const sparseMissing=copy(sparse);sparseMissing.exclusions.pop();
 T.ok('an unsampled absent-offer attempt cannot silently disappear',S.comparePanels(sparseMissing,copy(sparseMissing)).decision==='invalid');
 const invalid=[];
 let p=copy(nurse);p.exclusions.pop();invalid.push(['missing attempt',p]);
 p=copy(nurse);p.exclusions.push(copy(p.exclusions[0]));invalid.push(['duplicate case',p]);
 p=copy(nurse);p.rows[0].row.selection.startingBearer='wrong-person';invalid.push(['wrong starting bearer',p]);
 p=copy(nurse);p.exclusions[0].metrics={won:0};invalid.push(['invented excluded loss',p]);
 p=copy(nurse);p.exclusions[0].row.selection.rosterHash='0'.repeat(64);invalid.push(['tampered selection receipt',p]);
 p=copy(nurse);p.validity.selection[0].match=false;invalid.push(['failed excluded-selection proof beside passing campaign proof',p]);
 p=copy(nurse);p.validity.neutrality.push({...p.validity.neutrality[0],match:false});invalid.push(['failed campaign proof beside a passing proof',p]);
 p=copy(nurse);p.validity.neutrality=[{...p.validity.selection[0]}];invalid.push(['selection proof posing as campaign neutrality',p]);
 p=copy(empty);p.validity.selection[0].kind='campaign';invalid.push(['campaign proof posing as excluded selection',p]);
 for(const [name,panel] of invalid)T.ok('rejects '+name,S.comparePanels(panel,copy(panel)).decision==='invalid');
 const wrongJob=copy(nurse);wrongJob.options.occupation=OF.alternateOccupation;T.ok('different occupation cohorts cannot be compared as one lever',S.comparePanels(nurse,wrongJob).decision==='invalid');
 // A content revision may remove an offer. Use an actual absent-offer receipt
 // as a structural comparator fixture, not as claimed world evidence for the played seed.
 const lost=copy(nurse),removed=lost.rows.pop(),ex=copy(lost.exclusions[0]);ex.row.seed=removed.row.seed;lost.exclusions.push(ex);
 lost.validity.neutrality=[];lost.validity.selection.push({policy:'caregiver',seed:OF.playedSeed,match:true,warnings:0,kind:'selection'});
 const drift=S.comparePanels(nurse,lost);
 T.ok('changed offer availability remains visible rather than a fake defeat',drift.decision==='review_required'&&drift.policies[0].cases===0&&drift.policies[0].cohort.unavailableAfter.includes(OF.playedSeed));
}catch(e){console.error(e.stack);T.ok('real CLI workflow completed',false);}
finally{
 const actual=fs.realpathSync(temporary),base=fs.realpathSync(os.tmpdir());
 if(path.dirname(actual)!==base||!path.basename(actual).startsWith('oversight-cohort-'))throw Error('Refuse cleanup outside owned temp directory');
 fs.rmSync(actual,{recursive:true});
}
T.done();
