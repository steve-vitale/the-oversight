'use strict';
const K=require('./lib'),T=K.reporter('Market build policies'),{chooseOffers,capable}=require('../policies/capable'),M=require('../policies/market-build'),{merchant}=require('../policies/livelihood');
(async()=>{
 const seed=Number(process.env.SEED||7),G=await K.load({seed});
 console.log('prepared-harness-seed='+seed);
 let s,ctx;
 function fresh(subclass='dealer') {s=K.newRun(G);s.day=35;s.integration=80;s.abilities=[];s.abilityChoices=null;ctx={};M[subclass].setup(G,ctx);}
 function sheet(ids,src='level_up:social'){s.abilityChoices=ids.map(id=>({...G.data.abilities.find(a=>a.id===id),src}));}
 const ids=()=>s.abilities.map(a=>typeof a==='string'?a:a.id);
 fresh();sheet(['scream_cheese','haggle']);chooseOffers(G,ctx);
 T.ok('Dealer acquires the actual offered Haggle through the public command',ids().includes('haggle')&&s.abilityChoices===null&&ctx.capIntentAcquired===1);
 T.ok('policy setup grants neither payoff nor god',!ids().includes('sweetener')&&!s.godhood?.active?.includes('market_god'));
 fresh('hoarder');sheet(['haggle','hoarder']);chooseOffers(G,ctx);
 T.ok('Hoarder chooses its own offered enabler over the Dealer alternative',ids().includes('hoarder')&&!ids().includes('haggle'));
 fresh();for(const id of ['fusion_reactor','green_thumb','scream_cheese','lucky_rock','cold_blooded','third_eye'])K.giveAbility(G,id,{force:true});
 sheet(['sweetener','night_eyes']);chooseOffers(G,ctx);
 T.ok('a full level-up uses real replacement with six slots and protects the reactor',ids().length===6&&ids().includes('fusion_reactor')&&ids().includes('sweetener')&&!ids().includes('green_thumb')&&ctx.capIntentAcquired===1);
 fresh();for(const id of ctx.capOfferPriority.slice(0,6))K.giveAbility(G,id,{force:true});
 const before=ids().join(',');sheet(['taste_vision']);chooseOffers(G,ctx);
 T.ok('a lower-priority offer keeps the existing full kit through keepAbilities',ids().join(',')===before&&s.abilityChoices===null&&ctx.capIntentKept===1);
 fresh();for(const id of ['fusion_reactor','green_thumb','scream_cheese','lucky_rock','cold_blooded','third_eye'])K.giveAbility(G,id,{force:true});
 const prior=ids().join(',');sheet(['haggle'],'arrival');chooseOffers(G,ctx);
 T.ok('full arrival sheet cannot bypass slots or replace a power',ids().join(',')===prior&&s.abilityChoices?.[0].id==='haggle');
 fresh();sheet(['scream_cheese']);chooseOffers(G,ctx);
 T.ok('unavailable preferences never mint hidden abilities',ids().includes('scream_cheese')&&!ids().some(id=>ctx.capOfferPriority.includes(id))&&!ctx.capIntentAcquired);
 fresh();sheet(['haggle']);const original=G.chooseAbility;let calls=0;G.chooseAbility=function(){calls++;return {ok:false};};
 try{chooseOffers(G,ctx);chooseOffers(G,ctx);}finally{G.chooseAbility=original;}
 T.ok('truthy refusal is no acquisition and a refused sheet is not retried that day',calls===1&&!ctx.capIntentAcquired&&ctx.capIntentRefused===1&&ids().length===0);
 fresh();sheet(['haggle']);const upstream=capable.upkeep;let wired=false;
 // The inherited real merchant upkeep reaches capable's chooseOffers before
 // other chores. Stop immediately after the real acquisition for this scene.
 const stop=G.chooseAbility;G.chooseAbility=function(){const r=stop.apply(this,arguments);wired=ids().includes('haggle');throw Error('fixture-stop-after-choice');};
 try{M.dealer.upkeep(G,ctx);}finally{G.chooseAbility=stop;}
 T.ok('registered profile delegates to the actual merchant upkeep that invokes intent',wired&&typeof merchant.upkeep==='function'&&typeof upstream==='function');
 const registry=require('../sweep-compare').POLICY_REGISTRY;
 T.ok('both named profiles are registered while generic merchant stays unmodified',registry['market-dealer']===M.dealer&&registry['market-hoarder']===M.hoarder&&!Object.hasOwn(merchant,'capOfferPriority'));
 const d=M.dealer.diagnostics({capIntentAcquired:2,capIntentRefused:1,capIntentKept:3,capIntentPicks:{haggle:2}});
 T.ok('diagnostics report actual acquisitions, refusals and keeps separately',d.mode==='intentional-market-mixed'&&d.counters.intentAcquired===2&&d.counters.intentRefused===1&&d.counters.intentKept===3&&d.intentPicks.haggle===2);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
