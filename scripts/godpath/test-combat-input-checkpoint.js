'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process'),assert=require('assert/strict'),K=require('./lib');
const cases=['strike','refusal','nested','throw','throw-end','quota','stale','tombstone','successor','clock','outside','async','async-movement','async-stun','async-stun-continue'];
async function scenario(kind){
 const sample=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-24/day150-maker63003-prepared-save-r2.json.gz'))));
 const blobs=new Map([[sample.key,JSON.stringify(sample.payload)]]),writes=[];let quota=false;
 globalThis.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),setItem(k,v){if(quota&&k===sample.key)throw Error('prepared combat storage quota');blobs.set(k,String(v));if(k===sample.key)writes.push(JSON.parse(v));}};
 const G=await K.load({seed:73});assert.equal(G.load(sample.key),true);assert.equal(G.save(),true);writes.length=0;
 const original=blobs.get(sample.key),bearer=G.villagerId,kcal=G.state.scholar.kcal;
 const snapshot=()=>JSON.parse(blobs.get(sample.key));
 if(kind==='strike'){
  const wait=G.runCombatInput(()=>G.tbPlayerWait());assert.equal(wait.save,true);assert.equal(G.tbfight.round,2);writes.length=0;
  const result=G.runCombatInput(()=>{assert.equal(G.tbPlayerStrike('m_0'),true);assert.equal(writes.length,0,'No partial hit/deed writes inside action');G.state.scholar.kcal-=17;return true;});
  assert.equal(result.value,true);assert.equal(result.save,true);assert.equal(writes.length,1);assert.deepEqual(snapshot(),G.state);
  const player=G.tbFighter('p'),hp=G.tbFighter('m_0').hp;assert(player.acted);assert.equal(G.load(sample.key),true);
  assert.equal(G.tbFighter('m_0').hp,hp);assert.equal(G.tbFighter('p').acted,true);assert.equal(G.state.scholar.kcal,kcal-17);return;
 }
 if(kind==='refusal'){const r=G.runCombatInput(()=>false);assert.equal(r.save,null);assert.equal(writes.length,0);assert.equal(blobs.get(sample.key),original);return;}
 if(kind==='nested'){
  let nested;const r=G.runCombatInput(()=>{nested=G.runCombatInput(()=>{G.state.scholar.kcal-=17;assert.equal(G.save(),'deferred');return true;});assert.equal(writes.length,0);G.state.scholar.kcal-=13;return true;});
  assert.equal(nested.save,'deferred');assert.equal(r.save,true);assert.equal(writes.length,1);assert.equal(snapshot().scholar.kcal,kcal-30);return;
 }
 if(kind==='throw'||kind==='throw-end'){
  assert.throws(()=>G.runCombatInput(()=>{G.state.scholar.kcal-=17;G.save();if(kind==='throw-end')G.tbEnd('fled');throw Error('prepared post-payment wrapper throw');}),/post-payment/);
  assert.equal(writes.length,0);assert.equal(blobs.get(sample.key),original);assert.equal(G.save(),'settlement_failed');
  assert.equal(G.runCombatInput(()=>{throw Error('must not run');}).save,'settlement_failed');assert.equal(G.load(sample.key),true);assert.equal(G.save(),true);return;
 }
 if(kind==='clock'){
  const r=G.runCombatInput(()=>{G.save();G.dayPart=4;return true;});assert.equal(r.save,'settlement_failed');assert.equal(blobs.get(sample.key),original);assert.equal(G.save(),'settlement_failed');return;
 }
 if(kind==='outside'){G.tbEnd('fled');writes.length=0;const r=G.runCombatInput(()=>{G.state.scholar.kcal-=17;return true;});assert.equal(r.save,null);assert.equal(writes.length,0);return;}
 if(kind==='successor'){
  const r=G.runCombatInput(()=>{G.playerDeath('prepared input settlement death');return true;});assert(G.over||G.villagerId!==bearer);
  assert(writes.length<=1,'Only the native complete successor checkpoint');if(!G.over){assert.notEqual(snapshot().scholar.villagerId,bearer);assert.deepEqual(snapshot(),G.state);}else assert.notEqual(r.save,true);return;
 }
 if(kind.startsWith('async')){
  const timers=[],oldTimer=globalThis.setTimeout,oldEvent=globalThis.CustomEvent;
  const phases=[];globalThis.window={dispatchEvent(event){if(event.type==='tb-turn')phases.push({round:G.tbfight?.round,...event.detail});}};globalThis.CustomEvent=class{constructor(type,opts){this.type=type;this.detail=opts?.detail;}};
  globalThis.setTimeout=(fn,ms)=>{timers.push({fn,ms});return timers.length;};
  try{
   if(kind==='async-stun'||kind==='async-stun-continue'){
    const p=G.tbFighter('p');p.stunned=1;p.stunFull=1;
    let turns=0;const turn=G.tbMonsterTurn;G.tbMonsterTurn=function(){turns++;return turn.apply(this,arguments);};
    G.runCombatInput(()=>G.tbPlayerWait());
    let reloaded=false;
    for(let i=0;i<40&&timers.length;i++){
     const before=turns;timers.shift().fn();assert(turns-before<=1,'No hidden synchronous NPC round inside a browser tick');
     if(kind==='async-stun-continue'&&!reloaded&&G.tbfight?.round===2&&G.tbfight.order[G.tbfight.turnIdx]==='p'&&G.tbFighter('p').acted){
      assert.equal(snapshot().run.tbfight.fighters.find(f=>f.key==='p').stunned,0);
      assert.equal(G.load(sample.key),true);timers.length=0;G.tbAdvanceAsync();reloaded=true;
     }
     if(G.tbfight?.round>=3&&!G.tbfight.asyncRunning)break;
    }
    if(kind==='async-stun-continue')assert(reloaded,'Continue exercised at the actual lost-turn checkpoint');
    assert.equal(G.tbfight.round,3);assert.equal(G.tbFighter('p').acted,false);assert(!phases.some(e=>e.phase==='player'&&e.round===2),'Lost turn is not presented as an available player turn');
    assert.deepEqual(snapshot(),G.state);return;
   }
   if(kind==='async-movement'){
    const p=G.tbFighter('p');p.mx=7;p.my=7;p.moveLeft=1;p.acted=true;G.state.scholar.mx=7;G.state.scholar.my=7;
    let turns=0;const turn=G.tbMonsterTurn;G.tbMonsterTurn=function(){turns++;return turn.apply(this,arguments);};
    const r=G.runCombatInput(()=>G.tbPlayerMove(8,7));assert.equal(r.save,true);assert.equal(turns,0,'Final movement announces before any NPC acts');
    assert(G.tbfight.pendingTurnKey);assert.equal(G.tbFighter('p').moveLeft,0);assert.equal(G.tbFighter('p').acted,true);assert.deepEqual(snapshot(),G.state);return;
   }
   const r=G.runCombatInput(()=>G.tbPlayerWait());assert.equal(r.save,true);
   const announced=snapshot().run.tbfight,actor=announced.pendingTurnKey;assert(actor&&actor!=='p');assert.equal(announced.order[announced.turnIdx],actor);
   // Actual native load then the browser's normal async resume entry.
   assert.equal(G.load(sample.key),true);timers.length=0;let turns=0;const originalTurn=G.tbMonsterTurn;
   G.tbMonsterTurn=function(m){if(m.key===actor)turns++;return originalTurn.apply(this,arguments);};
   G.tbAdvanceAsync();assert.equal(G.tbfight.pendingTurnKey,actor);assert.equal(turns,0);
   const resolve=timers.find(t=>t.ms===450);assert(resolve);writes.length=0;resolve.fn();
   assert.equal(turns,1);assert.equal(writes.length,1);assert.equal(snapshot().run.tbfight.pendingTurnKey,null);
   assert.equal(snapshot().run.tbfight.order[snapshot().run.tbfight.turnIdx],actor);assert.deepEqual(snapshot(),G.state);
  }finally{globalThis.setTimeout=oldTimer;delete globalThis.window;if(oldEvent===undefined)delete globalThis.CustomEvent;else globalThis.CustomEvent=oldEvent;}
  return;
 }
 if(kind==='quota')quota=true;
 if(kind==='stale'){const newer=JSON.parse(original);newer.saveSeq+=50;newer.scholar.kcal=1777;blobs.set(sample.key,JSON.stringify(newer));}
 if(kind==='tombstone')globalThis.Scattering.state.wipe(sample.key,'prepared ended elsewhere');
 const prior=blobs.get(sample.key),r=G.runCombatInput(()=>{G.state.scholar.kcal-=17;return true;});
 assert.equal(r.save,kind==='quota'?false:kind==='stale'?'stale':'tombstoned');assert.equal(blobs.get(sample.key),prior);assert.equal(G.state.scholar.kcal,kcal-17);
 if(kind==='quota'){quota=false;assert.equal(G.save(),true);assert.deepEqual(snapshot(),G.state);}
}
(async()=>{
 if(process.argv[2])return scenario(process.argv[2]);
 for(const kind of cases){const r=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',maxBuffer:2e6});assert.equal(r.status,0,kind+': '+r.stdout+r.stderr);console.log('Combat checkpoint '+kind+' passed');}
 console.log('Combat input checkpoints: '+cases.length+' passed, 0 failed');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
