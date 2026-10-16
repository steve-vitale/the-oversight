'use strict';
const K=require('./lib'),T=K.reporter('miser-intent');
const {decide}=require('../policies/miser-intent'),{chooseOffers}=require('../policies/capable');
(async()=>{
  const G=await K.load({seed:7});let s,ctx;
  function fresh(subclass='dealer'){
    K.newRun(G);G.over=false;G.tbfight=null;G.state.systemArrived=true;s=G.state.scholar;
    s.day=85;s.abilities=[];s.levelUpQueue=[];s.abilityChoices=null;K.openSlots(G,6);
    ctx={offerIntent:(g,o,d)=>decide(g,o,d,subclass)};
  }
  function sheet(ids,src='level_up:social'){s.abilityChoices=ids.map(id=>{const a=G.abilityDef(id);return {id,name:a.name,description:a.description,src};});}
  const ids=()=>s.abilities.map(a=>a.id||a);
  fresh();sheet(['loud_chewer','hoarder','haggle']);const sharedScore=G.buildScore,npcDecision=G.buildDecide;
  chooseOffers(G,ctx);
  T.ok('Dealer intent takes actual offered Haggle through the public choice',G.hasAbility('haggle')&&!G.hasAbility('hoarder')&&!s.abilityChoices);
  T.ok('actual chosen id reaches policy counters and working pricing',ctx.capOfferPicks?.haggle===1&&G.goodsTradePrice(800)===600);
  T.ok('intent changes no shared or NPC scoring function',G.buildScore===sharedScore&&G.buildDecide===npcDecision);
  fresh('hoarder');sheet(['loud_chewer','hoarder','haggle']);chooseOffers(G,ctx);
  T.ok('Hoarder intent can choose a different real shown starter',G.hasAbility('hoarder')&&!G.hasAbility('haggle'));
  fresh();sheet(['loud_chewer','translator']);let queried=[];const abilityDef=G.abilityDef;
  G.abilityDef=function(id){queried.push(id);if(!['loud_chewer','translator'].includes(id))throw Error('Unshown ability queried '+id);return abilityDef.call(this,id);};
  let fallback;try{fallback=decide(G,s.abilityChoices,{pick:'loud_chewer'},'dealer');}finally{G.abilityDef=abilityDef;}
  T.ok('no shown Miser offer preserves the generic pick without hidden ability lookup',fallback.pick==='loud_chewer'&&queried.length===2);
  fresh();for(const id of ['green_thumb','loud_chewer','scream_cheese','translator','leech','second_wind'])K.giveAbility(G,id);
  sheet(['haggle','hoarder','crowd_favorite']);chooseOffers(G,ctx);
  T.ok('full-slot intent performs a legal paid-for-in-opportunity swap',ids().length===6&&G.hasAbility('haggle')&&ctx.capLevelUpReplaced===1);
  fresh();K.giveAbility(G,'haggle');for(const id of ['green_thumb','loud_chewer','scream_cheese','translator','leech'])K.giveAbility(G,id);
  sheet(['crowd_favorite','turncoat','rally_aura']);const keep=decide(G,s.abilityChoices,{pick:'crowd_favorite',replace:'haggle'},'dealer');
  T.ok('commitment may keep its earned Miser core over a generic replacement',keep.keep===true);
  fresh();K.giveAbility(G,'fusion_reactor');for(const id of ['green_thumb','loud_chewer','scream_cheese','translator','leech'])K.giveAbility(G,id);
  sheet(['haggle','hoarder','crowd_favorite']);const planned=decide(G,s.abilityChoices,{keep:true},'dealer');chooseOffers(G,ctx);
  T.ok('the singular reactor is never chosen as the replacement',planned.replace!=='fusion_reactor'&&G.hasAbility('fusion_reactor')&&G.hasAbility('haggle')&&ids().length===6);
  fresh();sheet(['haggle','hoarder','crowd_favorite'],'arrival');for(const id of ['green_thumb','loud_chewer','scream_cheese','translator','leech','second_wind'])K.giveAbility(G,id);
  const heldBefore=ids().join();chooseOffers(G,ctx);
  T.ok('a full gift cannot bypass the real level-up swap gate',ids().join()===heldBefore&&!G.hasAbility('haggle')&&!!s.abilityChoices);
  fresh();sheet(['loud_chewer','hoarder','haggle']);const expected=G.buildDecide('player',s.abilityChoices.map(o=>o.id)).pick;const ordinary={};chooseOffers(G,ordinary);
  T.ok('absent callback leaves the ordinary shared-brain choice intact',G.hasAbility(expected)&&ordinary.capOfferPicks?.[expected]===1);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
