'use strict';
const K=require('./lib'),cp=require('child_process'),T=K.reporter('occupation cohorts');
const F=require('./occupation-fixtures.json');
const scenario=process.argv[2];
async function child(){
 if(scenario==='excluded-driver'){
  const D=require('../sweep-compare');let calls=0;
  D.POLICY_REGISTRY['cohort-proof']={id:'cohort-proof',setup(){calls++;},daily(){calls++;}};
  const r=await K.H.quietLog(()=>D.runComparison({seeds:[F.npcOnlySeed],policies:['cohort-proof'],days:2,origin:'Columbus, Ohio',occupation:'er_nurse'}));
  T.ok('absent offered occupation runs no policy hook or alternate campaign',calls===0&&r.runs.length===0&&r.exclusions.length===1);
  T.ok('empty cohort has no invented progress rates or survival duration',r.byPolicy['cohort-proof'].n===0&&r.byPolicy['cohort-proof'].tablePct===null&&r.byPolicy['cohort-proof'].maxWave===null);
  T.done();return;
 }
 const seed=scenario==='npc-only'?F.npcOnlySeed:scenario==='absent'?F.absentSeed:F.playedSeed,G=await K.load({seed});
 const gr=G.genRoster,ng=G.newGame,dp=G.depart;let generated=0,started=0,departed=0;
 G.genRoster=function(...args){generated++;return gr.apply(this,args);};
 G.newGame=function(...args){started++;return ng.apply(this,args);};
 G.depart=function(...args){departed++;return dp.apply(this,args);};
 if(scenario==='invalid'){
  let error;try{await K.H.setupGame(G,'Columbus, Ohio',undefined,{occupation:'not-a-job'});}catch(e){error=e;}
  T.ok('unknown job is a configuration error before generation',/Unknown occupation/.test(error?.message)&&generated===0&&started===0);
  error=null;try{await K.H.setupGame(G,'Columbus, Ohio','arbitrary-id',{occupation:'er_nurse'});}catch(e){error=e;}
  T.ok('explicit roster and occupation cannot compete',/not both/.test(error?.message)&&generated===0);
  const prior=process.env.FORCE_OCC;try{process.env.FORCE_OCC='er_nurse';error=null;try{await K.H.setupGame(G,'Columbus, Ohio',undefined,{occupation:'er_nurse'});}catch(e){error=e;}
   T.ok('legacy forced generation cannot masquerade as offered selection',/Unset FORCE_OCC/.test(error?.message)&&generated===0);
  }finally{if(prior===undefined)delete process.env.FORCE_OCC;else process.env.FORCE_OCC=prior;}
 }else{
  const selection=await K.H.setupGame(G,'Columbus, Ohio',undefined,scenario==='default'?undefined:{occupation:'er_nurse'});
  T.ok('one ordinary roster generation, no missing-job reroll',generated===1);
  if(scenario==='played'){
   T.ok('selects actual non-first offered nurse card',selection.status==='played'&&selection.selectedOfferIndex===1&&selection.offered.length===4);
   T.ok('real newGame/depart start the exact canonical offered person',started===1&&departed===1&&G.villagerId===selection.selectedId&&G.getPerson(G.villagerId).occupationId==='er_nurse');
   T.ok('retains actual occupation and landing, not just a label',selection.startingBearer===G.villagerId&&selection.occupation==='er_nurse'&&selection.region===G.state.region&&!!selection.region);
   T.ok('complete original roster matches the predeclared audit',selection.rosterHash===F.playedRosterHash);
  }else if(scenario==='default'){
   T.ok('omitted option retains the original first-card setup/return',selection===undefined&&G.villagerId===G.generatedRoster[0].id&&started===1&&departed===1);
  }else{
   T.ok('absent card is excluded without booting or departing',selection.status==='excluded'&&selection.reason==='occupation_not_offered'&&started===0&&departed===0);
   T.ok('offered receipt contains no matching occupation',selection.offered.length===4&&!selection.offered.some(p=>p.occupation==='er_nurse'));
   if(scenario==='npc-only')T.ok('an actually generated NPC nurse is not a playable offer',G.generatedRoster.some(p=>p.occupationId==='er_nurse'&&p.candidate===false));
  }
 }
 T.done();
}
if(scenario)child().catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 for(const name of ['played','npc-only','absent','default','invalid','excluded-driver']){
  const p=cp.spawnSync(process.execPath,[__filename,name],{cwd:K.ROOT,encoding:'utf8',env:process.env});
  if(p.status!==0)console.error(p.stdout,p.stderr);
  T.ok('real shared-harness process: '+name,p.status===0);
 }
 T.done();
}
