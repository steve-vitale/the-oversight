'use strict';
// Rejected-candidate access proof: run with a reconstructed candidate root.
// Three assertions intentionally fail on the restored baseline; not a unit-suite test.
const path=require('path'),root=path.resolve(process.argv[2]||'.');
const K=require(path.join(root,'scripts/godpath/lib')),T=K.reporter('miser-access');
(async()=>{
  const G=await K.load({seed:17});K.newRun(G);
  const s=G.state.scholar,v=G.state.village;G.state.systemArrived=true;
  s.abilities=[];s.levelUpQueue=[];s.abilityChoices=null;
  const npc=v.roster.find(id=>id!==G.villagerId);
  v.npcAbilities=v.npcAbilities||{};v.npcAbilities[npc]=[];
  // Prepared real occupation: both share the authored Miser/Socialite lean.
  G.vpOf(G.villagerId).occupationId='lawyer';G.vpOf(npc).occupationId='lawyer';
  const kit=new Set(G.trackData().kits.social);
  const seen={player:new Set(),npc:new Set()};let legal=true,stable=true,calls=0;
  const random=Math.random;Math.random=()=>{calls++;return random();};
  let first=null;
  try{
    // Only the five real threshold levels, with no prior held magic.
    for(let level=1;level<=G.trackData().thresholds.length;level++){
      const p=G.levelUpOffers('social',level).map(a=>a.id),n=G.villagerLevelUpOffers(npc,'social',level);
      stable=stable&&p.join()===G.levelUpOffers('social',level).map(a=>a.id).join()&&n.join()===G.villagerLevelUpOffers(npc,'social',level).join();
      legal=legal&&[p,n].every(o=>o.length===3&&new Set(o).size===3&&o.every(id=>kit.has(id)&&G.abilityDef(id).lane==='magic'));
      p.forEach(id=>seen.player.add(id));n.forEach(id=>seen.npc.add(id));
      if(first===null&&p.includes('haggle'))first=level;
    }
  }finally{Math.random=random;}
  T.ok('fresh Miser-job player and resident sheets can offer both starters', ['player','npc'].every(w=>['hoarder','haggle'].every(id=>seen[w].has(id))));
  T.ok('fresh sheets remain three distinct legal magic offers',legal);
  T.ok('reopening stays deterministic without consuming the world random stream',stable&&calls===0);
  T.ok('compound interest and Dealer payoff remain outside fresh Social sheets', ['player','npc'].every(w=>!seen[w].has('hoarders_interest')&&!seen[w].has('sweetener')));
  if(first!==null){s.levelUpQueue=[{track:'social',level:first,xp:G.trackData().thresholds[first-1]}];G.pumpLevelUps();const choice=(s.abilityChoices||[]).find(a=>a.id==='haggle');if(choice)G.chooseAbility(choice.id);}
  T.ok('a real offered level-up choice installs Haggle in a magic slot',G.hasAbility('haggle')&&s.abilities.some(a=>(a.id||a)==='haggle'));
  const price=G.goodsTradePrice(800);T.ok('the chosen ability reaches the working goods quote caller',price===600);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
