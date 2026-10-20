'use strict';
// Prepared comfort scenes through actual offered choices/handlers. Each
// scenario runs in its own shared-harness process; no dialogue stubs.
const assert=require('assert'),cp=require('child_process'),path=require('path');
const root=path.resolve(__dirname,'../..');
async function child(){
 const scenario=process.argv[3],seed=Number(process.env.COMFORT_SEED||9003);
 const {loadGame,setupGame}=require(path.join(process.env.COMFORT_GAME_ROOT||root,'scripts/sim-harness'));
 const {Game:G}=await loadGame({seed,mode:'comfort-arc-proof'});await setupGame(G);
 const vid=G.state.village.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);assert(vid);
 G.convoPlantSeed(vid,{wantId:'seek_comfort',note:'prepared comfort proof'});
 const want=G.convoSelectWant(vid);assert.equal(want.id,'seek_comfort');G.startConvo(vid);
 const c=G.convoGet(vid);c.want={id:want.id,def:want.def,stage:1,fromSeed:true};c.thread='want';
 c.pendingQ=null;c.reactiveQ=null;c.genericQ=null;G.sayLine(vid,G.convoWantOpener(vid,c.want).line);
 let choices=G.convoChoices(vid),checks=0;
 const ids=()=>choices.map(o=>o.id),check=(name,fn)=>{fn();checks++;console.log('ok '+name);};
 const turn=id=>{assert(ids().includes(id),'offered '+id+' in '+ids());const r=G.convoTurn(vid,id);choices=r.choices||[];return r;};
 const complete=()=>{turn('dlg:comfort');turn('dlg:empathize');};
 if(scenario==='empathy'){
  turn('dlg:comfort');check('first comfort engages',()=>assert.equal(c.want.stage,2));
  check('stage2 asks for follow-through rather than asking again',()=>{assert(ids().includes('dlg:empathize'));assert(!ids().includes('dlg:comfort'));});
  turn('dlg:empathize');check('empathic follow-through resolves as comforted',()=>{assert.equal(c.want.stage,3);assert.equal(c.want.resolution,'comforted');});
  check('want and generic feeling menus retire all completed comfort actions',()=>{for(const id of ['dlg:comfort','dlg:empathize','dlg:stay'])assert(!ids().includes(id));});
  check('other choices remain available',()=>assert(ids().includes('leave')&&ids().includes('dlg:subject')));
 }else if(scenario==='stale'){
  complete();
  let consequences=0;const resolve=G.resolveConsequence;G.resolveConsequence=function(...a){consequences++;return resolve.apply(this,a);};
  for(const id of ['dlg:comfort','dlg:empathize','dlg:stay']){
   const before={trust:G.state.village.trust[vid],mood:JSON.stringify(G.state.village.convoMood||{}),transcript:c.transcript.length,exchanges:c.exchanges,substantive:c.substantive};
   G.convoTurn(vid,id);
   check('stale '+id+' has no conversation payout or exchange',()=>{assert.equal(consequences,0);assert.equal(G.state.village.trust[vid],before.trust);assert.equal(JSON.stringify(G.state.village.convoMood||{}),before.mood);assert.equal(c.transcript.length,before.transcript);assert.equal(c.exchanges,before.exchanges);assert.equal(c.substantive,before.substantive);});
  }
 }else if(scenario==='opening-replay'){
  turn('dlg:comfort');const trust=G.state.village.trust[vid],exchanges=c.exchanges;
  G.convoTurn(vid,'dlg:comfort');
  check('stale opener at stage2 pays no trust or exchange',()=>{assert.equal(G.state.village.trust[vid],trust);assert.equal(c.exchanges,exchanges);assert.equal(c.want.stage,2);});
 }else if(scenario==='early-leave'){
  turn('leave');check('leaving before engagement does not complete comfort',()=>{assert.equal(c.want.stage,3);assert.notEqual(c.want.resolution,'comforted');assert.notEqual(c.want.resolution,'engaged');});
 }else if(scenario==='stay'){
  turn('dlg:comfort');for(let i=0;i<4;i++)turn('dlg:stay');
  check('existing four stays still resolve comfort',()=>{assert.equal(c.want.stage,3);assert.equal(c.want.resolution,'comforted');});
  check('resolved stay retires generic empathy too',()=>assert(!ids().includes('dlg:empathize')));
 }else if(scenario==='deflect'){
  turn('dlg:cant');check('honest refusal remains deflected',()=>{assert.equal(c.want.stage,3);assert.equal(c.want.resolution,'deflected');});
  check('refused comfort is not re-offered on its thread',()=>{assert(!ids().includes('dlg:comfort'));assert(!ids().includes('dlg:empathize'));});
 }else if(scenario==='other-thread'){
  complete();c.thread='grief';G.sayLine(vid,'"I miss them."',{tag:'feeling',topic:'grief'});choices=G.convoChoices(vid);
  check('another feeling thread can still offer comfort',()=>assert(ids().includes('dlg:comfort')));
  const trust=G.state.village.trust[vid];turn('dlg:comfort');
  check('other-thread comfort still responds, without changing the completed want',()=>{assert(G.state.village.trust[vid]>trust);assert.equal(c.want.stage,3);assert.equal(c.want.resolution,'comforted');});
 }else if(scenario==='other-want'){
  G.convoPlantSeed(vid,{wantId:'warn_you',note:'prepared warning'});const w=G.convoSelectWant(vid);assert.equal(w.id,'warn_you');
  c.want={id:w.id,def:w.def,stage:1};c.thread='grief';G.sayLine(vid,'"I miss them."',{tag:'feeling',topic:'grief'});choices=G.convoChoices(vid);
  turn('dlg:empathize');check('comfort on a different thread does not engage an unrelated want',()=>assert.equal(c.want.stage,1));
 }else if(scenario==='cap-and-close'){
  G.state.village.trust[vid]=40;complete();G.endConvo(vid,'done');
  check('words and goodbye still obey40 trust cap',()=>assert.equal(G.state.village.trust[vid],40));
  check('goodbye preserves comforted resolution and consumes seed',()=>{assert.equal(c.want.resolution,'comforted');assert(!G.state.village.convoSeeds[vid]);});
 }else throw Error('unknown scenario '+scenario);
 console.log('comfort-'+scenario+': '+checks+' passed, 0 failed');
}
if(process.argv[2]==='--child')child().catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 let checks=0;for(const scenario of ['empathy','stale','opening-replay','early-leave','stay','deflect','other-thread','other-want','cap-and-close']){
  const r=cp.spawnSync(process.execPath,[__filename,'--child',scenario],{cwd:root,encoding:'utf8',env:process.env,maxBuffer:4*1024*1024});
  process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);assert.equal(r.status,0,scenario+' failed');checks++;
 }console.log('comfort-arc: '+checks+' passed, 0 failed (isolated cases)');
}
