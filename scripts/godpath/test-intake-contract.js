'use strict';
const assert=require('assert'),K=require('./lib'),B=require('../balance-panel');
(async()=>{
 const G=await K.load({seed:7071});let s,v,me,npc;
 function fresh(){K.newRun(G);s=G.state.scholar;v=G.state.village;me=G.villagerId;npc=v.roster.find(id=>id!==me);s.day=85;s.kcal=0;s.inventory=[];v.pantry=[];s.insideHaven=true;G.map.px=v.px??4;G.map.py=v.py??4;v.trust[me]=100;v.gives={[me]:100000};}
 const food=(kcal=500)=>({name:'Prepared beans',safe:true,edible:true,kcalEach:kcal,units:1,spoilDay:9999,harvestShares:{[npc]:1}});
 const row={deaths:{},won:0,entered:0,table:0,national:0,gameDays:20,endReason:'prepared diagnostic'};
 fresh();assert.equal(B.intakeSnapshot(v).status,'unknown');
 v.harvestIntake={85:{[me]:{kcal:500,nourishment:500,routes:{}}}};
 assert.equal(B.install(G).finish(row).metrics.usefulIntake,null,'unversioned legacy ring must not certify complete intake');
 fresh();const observer=B.install(G);
 for(let d=85;d<105;d++){s.day=d;s.kcal=0;s.inventory=[food()];G.eatOne(0);}
 const out=observer.finish(row);assert.equal(Object.keys(v.harvestIntake).length,8);assert.equal(out.intakeCoverage.totals.kcal,10000);
 assert.equal(out.intakeCoverage.totals.records,20);assert.equal(out.metrics.usefulIntake,1,'a delayed observer uses all twenty meals, not just the eight-day ring');
 assert.equal(out.intakeCoverage.totals.actors[me].kcal,10000);assert.equal(out.intakeCoverage.totals.roles.player.kcal,10000);
 const retained=JSON.stringify(out.intakeCoverage);v.harvestIntakeTotals.kcal++;assert.equal(JSON.stringify(out.intakeCoverage),retained,'report does not hold mutable state references');
 assert.equal(B.intakeSnapshot(v).reason,'inconsistent-producer-totals');
 fresh();const captured=G.captureIntakeEater(me);assert(captured);const state=JSON.stringify(G.state);
 assert.equal(G.recordHarvestIntake({...captured},[{kcal:50}],'pack'),false);assert.equal(JSON.stringify(G.state),state,'forged eater frame mutates nothing');
 fresh();assert.equal(G.recordHarvestIntake(captured,[{kcal:50}],'pack'),false,'old-run frame cannot write new-run intake');
 v.harvestIntakeTotals={version:999};const unsupported=JSON.stringify(G.state);const warn=console.warn;let warns=0;console.warn=()=>warns++;
 try{assert.equal(G.recordHarvestIntake(me,[{kcal:50}],'pack'),false);}finally{console.warn=warn;}
 assert.equal(warns,1);assert.equal(JSON.stringify(G.state),unsupported,'unknown versions are preserved without partial daily writes');
 fresh();const victim=G.getPerson(npc);victim.dead=true;assert.equal(G.captureIntakeEater(npc),null);
 s.inventory=[food()];G.eatOne(0);assert.equal(v.harvestIntake[85][me].harvestKcal[npc],500,'a dead producer still produced the stored food');
 for(const capdraw of [false,true])for(const ration of [false,true]){
   fresh();const prior=process.env.CAPDRAW2;if(capdraw)process.env.CAPDRAW2='1';else delete process.env.CAPDRAW2;
   s.kcal=G.kcalCap()-100;v.pantry=[food(1000)];if(ration)v.rationing={until:s.day+1};
   try{const before=s.kcal;G.villageMeal();const r=v.harvestIntake[85][me], returned=G.pantryKcal();
     assert.equal(r.kcal,1000-returned,'physical intake excludes both real leftover and ration returns');
     assert.equal(r.nourishment,Math.max(0,s.kcal-before),'cap-clipped ration does not invent useful reserve');
     assert.equal(r.harvestKcal[npc],r.kcal);
     assert.equal(Object.hasOwn(G,'_harvestMealDeferred'),false);assert.equal(Object.hasOwn(G,'_harvestPantryMeal'),false);
     assert(v.pantry.every(p=>p.harvestShares?.[npc]===1));
   }finally{if(prior===undefined)delete process.env.CAPDRAW2;else process.env.CAPDRAW2=prior;}
 }
 fresh();s.inventory=[{...food(),units:20}];G.returnToVillage();
 assert(v.pantry.length>0,'actual homecoming deposits surplus');
 assert(v.pantry.every(p=>p.harvestShares?.[npc]===1),'homecoming explicit field copy retains the actual producer');
 assert.equal(v.harvestIntake,undefined,'pooling is not consumption');
 fresh();v.pantry=[{...food(),units:20}];v.rationing={until:s.day+1};
 const stock=G.stockPantry,originalWarn=console.warn;let returnWarnings=0;
 G.stockPantry=()=>{throw Error('prepared return failure');};console.warn=()=>returnWarnings++;
 try{assert.doesNotThrow(()=>G.villageMeal(),'the existing recoverable ration-return path still returns');}
 finally{G.stockPantry=stock;console.warn=originalWarn;}
 assert.equal(returnWarnings,1,'the previously swallowed failure is observable');
 assert.equal(Object.hasOwn(G,'_harvestMealDeferred'),false);assert.equal(Object.hasOwn(G,'_harvestPantryMeal'),false);
 assert.equal(v.harvestIntake,undefined,'a failed settlement does not invent a completed intake record');
 // Invalid data stays unknown; absorption greater than one is a ratio, not
 // an excuse to clamp or discard an honest producer value.
 const t={version:1,startedDay:1,records:1,kcal:100,nourishment:120,roles:{player:{kcal:100,nourishment:120}},actors:{a:{kcal:100,nourishment:120}},routes:{pack:{kcal:100,nourishment:120}}};
 assert.equal(B.intakeSnapshot({harvestIntakeTotals:t}).totals.nourishment,120);
 assert.equal(B.intakeSnapshot({harvestIntakeTotals:{...t,nourishment:NaN}}).status,'unknown');
 console.log('intake contract: delayed sampling, lifetime totals, identity, versions, four real refund combinations and unknowns pass');
})().catch(e=>{console.error(e);process.exitCode=1;});
