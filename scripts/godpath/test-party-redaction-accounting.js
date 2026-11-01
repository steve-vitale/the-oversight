'use strict';
const assert=require('assert/strict'),K=require('./lib');
(async()=>{
 const G=await K.load({seed:1,narration:true});await K.H.setupGame(G);
 const T=K.reporter('party redaction accounting'),s=G.state.scholar;
 // Declared endurance fixture, not a natural acquisition or balance claim.
 // Keep the actual resident roster and real damage/action resolvers.
 s.health=9000;s.mx=4;s.my=4;s.equipped={melee:{itemId:'fire_hardened_spear',name:'spear'}};
 G.startCombat('redactor');const fight=G.tbfight,m=fight?.fighters.find(f=>f.mdef?.id==='redactor');
 assert(m&&fight);m.maxHp=10000;m.hp=10000;
 T.ok('real nearby residents participate in the declared party fixture',fight.fighters.some(f=>f.kind==='villager'));
 const hooks=globalThis.MonsterBehaviorHooks,original=hooks.sigRedactor,heals=[];
 assert.equal(typeof original,'function');
 hooks.sigRedactor=function(game,actor){
  const target=actor.sigR?.phase==='point'&&actor.sigR.target?.kind==='lastTurn'?actor.sigR.target.strike:null;
  const body=target&&game.tbFighter(target.target),before=body?.hp;
  const result=process.argv.includes('--without-redactor-hook')?false:original.apply(this,arguments);
  if(target&&body)heals.push({before,after:body.hp,amount:target.dmg,limit:body.maxHp,target:body.key});
  return result;
 };
 const waits=[];
 try{
  for(let n=0;n<24&&G.tbfight===fight&&!fight.over&&!heals.length;n++){
   assert(G.tbIsPlayerTurn(),'public input must belong to the player');
   if(!G.tbFighter('p').acted)G.tbPlayerStrike(m.key);
   const before=m.hp,count=heals.length;
   if(G.tbfight===fight&&!fight.over){assert(G.tbPlayerWait(),'public Wait advances the real party');waits.push({before,after:m.hp,healed:heals.length>count});}
  }
 }finally{hooks.sigRedactor=original;}
 T.ok('an actual announced last-turn redaction resolves through its registered hook',heals.length===1);
 const heal=heals[0],wait=waits.find(w=>w.healed);
 T.ok('redaction restores exactly the captured player strike, with the real HP ceiling',!!heal&&heal.amount>0&&heal.after-heal.before===Math.min(heal.amount,heal.limit-heal.before));
 T.ok('other party damage stays separate from that restoration',!!heal&&!!wait&&wait.after-wait.before<heal.after-heal.before);
 T.ok('the end of Wait retains actual party actors and the original bearer',G.tbfight===fight&&fight.fighters.some(f=>f.kind==='villager'&&f.alive)&&G.villagerId===s.villagerId);
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
