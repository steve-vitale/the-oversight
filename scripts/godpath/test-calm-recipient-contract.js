'use strict';
// Actual captured human betrayal. This proves recipient refusal and public
// escape, not the availability of animal combat encounters in the world.
const K=require('./lib'),fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const T=K.reporter('Calm recipient contract');
(async()=>{
 const read=fs.readFileSync,removed=process.argv[2]==='removed';
 if(removed)fs.readFileSync=function(file,...args){let value=read.call(this,file,...args);
  if(String(file).replace(/\\/g,'/').endsWith('/src/js/abilityActions.js')){
   const before=String(value),after=before.replace("m.kind === 'animal'","m.kind !== 'monster' && m.kind !== 'player' && m.kind !== 'villager'");
   assert.notEqual(after,before);value=typeof value==='string'?after:Buffer.from(after);
  }return value;
 };
 let G;try{G=await K.load({seed:9});}finally{fs.readFileSync=read;}
 K.newRun(G);
 const capture=JSON.parse(z.gunzipSync(fs.readFileSync(K.ROOT+'/evidence/2026-10-21/gardener-intent-freeze-replay-r2.json.gz'))).trace.routes[0];
 for(const explicit of [false,true]){
  K.restoreCombatCapture(G,capture);const target=G.tbfight.fighters.find(f=>f.kind==='hostile');assert(target?.alive);
  const row=G.activatableAbilities().find(a=>a.id==='animal_ken.calm_beast');
  T.ok('actual human-only fight explains the unavailable Calm control',row&&!row.available&&/People and monsters/.test(row.why));
  const before=JSON.stringify({scholar:G.state.scholar,fight:G.tbfight}),rng=Math.random;let draws=0;
  Math.random=function(){draws++;return rng();};let result;
  try{result=G.activateAbility('animal_ken.calm_beast',explicit?target.key:undefined);}finally{Math.random=rng;}
  T.ok((explicit?'explicit':'targetless')+' human Calm refuses without payment, turn loss or a peaceful ending',!result&&draws===0&&JSON.stringify({scholar:G.state.scholar,fight:G.tbfight})===before);
 }
 if(!removed){
  const r=spawnSync(process.execPath,[__filename,'removed'],{encoding:'utf8',timeout:60000,maxBuffer:20e6});
  T.ok('restoring the actual overbroad recipient predicate is rejected',r.status!==0&&/FAIL/.test(r.stdout),r.stderr+r.stdout.slice(-900));
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
