#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('village-meal-demand');
const C = require('../lib/garden-coverage');
(async () => {
  const G = await K.load({ seed: 7 });
  let v, s, npc, p;
  const near = (a,b) => Number.isFinite(a) && Math.abs(a-b)<1e-7;
  function fresh() {
    K.newRun(G); s=G.state.scholar; v=G.state.village; s.day=85;
    npc=v.roster.find(id=>id!==G.villagerId);p=G.getPerson(npc);p.kcalPerDay=2000;
    v.health={ [npc]:100 };v.havenTier=0;v.rationing=null;v.away={};
    v.pantry=[{ name:'Stored meal', units:100, kcalEach:100, safe:true, spoilDay:9999, kg:0.1 }];
    const n=G.npcNeeds(npc);n.rhythm='regular';n.hunger=80;
  }
  const eat=()=>G.villagerMealDay(npc,p,v,{cookId:null});
  fresh();let r=eat(),d=r.demand||{};
  T.ok('real home meal reports the computed healthy need',d.need===2000 && d.nominalKcal===2000 && d.away===false);
  T.ok('real own-food production is distinct from communal demand',near(d.ownEat,Math.min(d.produced,d.need)) && near(d.communalWant,d.need-d.ownEat));
  T.ok('actual eaten total conserves own-food and communal draw',near(r.ate,d.ownEat+r.drawn));
  T.ok('personal-work intake agrees with the returned own-food amount',near(v.harvestIntake[s.day][npc].routes['personal-work'].kcal,d.ownEat));
  fresh();v.health[npc]=50;r=eat();
  T.ok('injured meal reports health-adjusted need rather than nominal diet',r.demand?.need===1700);
  fresh();v.havenTier=1;r=eat();
  T.ok('longhouse meal reports the real hearth reduction',r.demand?.need===1800);
  fresh();v.havenTier=1;v.away[npc]={sinceDay:s.day,duration:2};r=eat();
  T.ok('away meal does not invent a home hearth reduction',r.demand?.need===2000 && r.demand.away);
  fresh();v.rationing={until:s.day+1};r=eat();
  T.ok('ration wrapper reports the effective half-ration need',r.demand?.nominalKcal===1000 && r.demand.need===1000);
  T.ok('ration wrapper restores the persons normal daily budget',p.kcalPerDay===2000 && !p._rationHalf);
  fresh();v.pantry=[];r=eat();d=r.demand||{};
  T.ok('empty stores do not erase an actual communal request',near(d.requested, d.communalWant>50?d.communalWant:0) && r.drawn===0);
  fresh();p.kcalPerDay=1;r=eat();d=r.demand||{};
  T.ok('self-sufficient meal retains need but has no communal opportunity',d.need===1 && d.ownEat===1 && d.requested===0);
  let fast;
  for(let i=0;i<40&&!fast;i++) {fresh();G.npcNeeds(npc).rhythm='gorge';G.npcNeeds(npc).hunger=0;r=eat();if(r.fasting)fast=r;}
  T.ok('a real voluntary fast has zero request without erasing physiological need',fast?.demand?.requested===0 && fast.demand.need>0 && fast.drawn===0);
  fresh();const observer=C.install(G);r=eat();const originalNeed=r.demand?.need;
  if(r.demand)r.demand.need=0;
  // The day is settled with the real endDay path. A duplicate direct meal
  // is diagnostic ambiguity, not another village-feeding success.
  G.endDay();const day=observer.days.find(x=>x.day===85);
  T.ok('observer snapshots the returned demand without keeping mutable references',day?.meals.find(x=>x.eater===npc)?.demand?.need===originalNeed && originalNeed>0);
  T.ok('duplicate meals are unknown instead of pooled into a daily demand',day && C.mealDemand(day.required,day.meals).unknown.includes(npc));
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
