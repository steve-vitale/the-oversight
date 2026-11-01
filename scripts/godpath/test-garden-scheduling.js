'use strict';
const K=require('./lib'),S=require('../policies/garden-scheduling'),C=require('../policies/competent'),T=K.reporter('Garden scheduling');
(async()=>{
 const G=await K.load({seed:7002});let s,v,p;
 function fresh(){K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;s.dayTicks=0;s.actionClock=0;s.kcal=6000;s.health=100;s.energy=100;s.hydration=100;s.inventory=[];s.levelUpQueue=[];s.abilityChoices=null;v.pantry=[];v.assignments={};v.gardenKeeper=null;G.state.systemArrived=true;G.exitBuilding();G.state.codex.plants.dandelion={level:3,prepKnown:true};p={};G.gardenPlant(p,'dandelion',84);G.map.tiles[4][4].plots=[p];K.giveAbility(G,'green_thumb');}
 const context=()=>({gardenTarget:()=>1});
 fresh();G.enterBuilding();const ctx=context(),cost=s.kcal,growth=G.gardenGrowthLeft(p),tick=s.dayTicks;
 T.ok('safe early session executes actual owned food-powered cultivation',S.scheduledGarden(G,ctx,'early')&&G.gardenGrowthLeft(p)<growth);
 T.ok('early session pays real time and reserve and returns to the hall',s.kcal<cost&&s.dayTicks>tick&&s.insideHaven);
 const after=JSON.stringify(G.state);T.ok('late session cannot duplicate early work for the same bearer/day',!S.scheduledGarden(G,ctx,'late')&&JSON.stringify(G.state)===after&&ctx.gardenSchedule.at(-1).reason==='already-worked-early');
 fresh();const unsafe=context();s.health=59;const old=JSON.stringify(G.state);T.ok('early health guard refuses without Game mutation',!S.scheduledGarden(G,unsafe,'early')&&JSON.stringify(G.state)===old);
 s.health=100;T.ok('an early refusal leaves the real late session available',S.scheduledGarden(G,unsafe,'late')&&unsafe.gardenSchedule.at(-1).reason==='session');
 fresh();const low=context();s.kcal=1799;T.ok('early reserve threshold is enforced',!S.scheduledGarden(G,low,'early'));s.kcal=6000;s.dayTicks=321;T.ok('early time threshold is enforced',!S.scheduledGarden(G,low,'early'));
 fresh();const away=context();G.map.px=3;const abroad=JSON.stringify(G.state);T.ok('early work never teleports an away bearer home',!S.scheduledGarden(G,away,'early')&&JSON.stringify(G.state)===abroad&&away.gardenSchedule[0].reason==='away');
 fresh();const encounter=context();G.pendingEncounter=true;const contact=JSON.stringify(G.state);T.ok('pending contact is not bypassed by early work',!S.scheduledGarden(G,encounter,'early')&&JSON.stringify(G.state)===contact);G.pendingEncounter=false;
 fresh();const dated=context(),original=G.villagerId+':'+s.day,cast=G.cultivateGarden;G.cultivateGarden=function(...args){const r=cast.apply(this,args);this.state.scholar.day++;return r;};try{S.scheduledGarden(G,dated,'early');}finally{G.cultivateGarden=cast;}
 T.ok('declared dawn fault credits only the original actor/day',dated._gardenEarlyDone===original&&dated.gardenSchedule[0].after.day!==dated.gardenSchedule[0].before.day);
 T.ok('new day can use its own late opportunity',S.scheduledGarden(G,dated,'late'));
 fresh();const mantle=context(),oldBearer=G.villagerId;G.cultivateGarden=function(...args){const r=cast.apply(this,args);this.villagerId='prepared-new-bearer';return r;};try{S.scheduledGarden(G,mantle,'early');}finally{G.cultivateGarden=cast;}
 T.ok('declared mantle fault does not mark the new bearer as already worked',mantle._gardenEarlyDone.startsWith(oldBearer+':')&&mantle.gardenSchedule[0].after.bearer!==oldBearer);
 fresh();const flow=context(),order=[],walk=G.travelTo,cultivate=G.cultivateGarden;flow.gardenWork=function(g,c,phase){order.push(phase);return S.scheduledGarden(g,c,phase);};G.cultivateGarden=function(...args){order.push('cultivate');return cultivate.apply(this,args);};G.travelTo=function(...args){order.push('travel');return walk.apply(this,args);};try{C.competent.daily(G,flow);}finally{G.travelTo=walk;G.cultivateGarden=cultivate;}
 T.ok('real daily dispatch reaches early work before public cultivation and outings',order[0]==='early'&&order.includes('cultivate')&&(!order.includes('travel')||order.indexOf('cultivate')<order.indexOf('travel')));
 fresh();const recovery=context();C.markRecover(G,recovery);s.health=10;s.hp=10;let premature=0;recovery.gardenWork=()=>premature++;const priorFlag=process.env.COMPETENT_DIRECTIONAL_FLEE;try{process.env.COMPETENT_DIRECTIONAL_FLEE='1';C.competent.daily(G,recovery);}finally{if(priorFlag===undefined)delete process.env.COMPETENT_DIRECTIONAL_FLEE;else process.env.COMPETENT_DIRECTIONAL_FLEE=priorFlag;}
 T.ok('real recovery day keeps both early and late garden sessions behind recovery',recovery.recoverDays>0&&premature===0);
 T.ok('both scheduling profiles are registered without replacing old profiles',S.profiles.length===2&&S.profiles.every(p=>require('../sweep-compare').POLICY_REGISTRY[p.id]===p)&&require('../sweep-compare').POLICY_REGISTRY['garden-invest'].id==='garden-invest');
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
