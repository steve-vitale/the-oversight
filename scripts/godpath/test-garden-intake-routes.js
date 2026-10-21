'use strict';
const K=require('./lib'),T=K.reporter('Garden intake routes');
(async()=>{const G=await K.load({seed:7});let s,v,me,npc;const close=(a,b)=>Math.abs((a||0)-(b||0))<1e-7;
 function fresh(){K.newRun(G);s=G.state.scholar;v=G.state.village;me=G.villagerId;npc=v.roster.find(id=>id!==me);s.day=85;s.kcal=0;s.inventory=[];v.pantry=[];s.insideHaven=true;G.map.px=v.px??4;G.map.py=v.py??4;v.trust[me]=100;v.gives={[me]:100000};}
 const food=(units=1)=>({name:'Prepared cultivated beans',safe:true,edible:true,units,kcalEach:500,spoilDay:9999,gardenShares:{ordinary:.4,assisted:.6}});
 const book=()=>v.gardenIntakeTotals;
 fresh();s.inventory=[food(4)];G.donateToPantry(0);T.ok('actual donation preserves crop origin without consuming it',v.pantry.length&&close(v.pantry[0].gardenShares.ordinary,.4)&&!book());
 G.takeFromPantry(0);T.ok('single pantry withdrawal preserves both crop origins',s.inventory.some(i=>close(i.gardenShares?.assisted,.6))&&!book());
 s.inventory=[];G.packKcal(npc);T.ok('actual carried ration retains crop origin and is not a meal',close(v.pack[npc]?.gardenShares?.ordinary,.4)&&!book());
 G.packMeal(npc,200,G.freshExposure());T.ok('actual away meal records its consumed crop fraction once',book()?.kcal===200&&close(book().origins.ordinary.kcal,80)&&close(book().origins.assisted.kcal,120)&&book().roles.npc.kcal===200);
 fresh();v.pack={[npc]:{day:85,kcal:1000,risks:G.freshExposure(),gardenShares:{ordinary:1}}};s.kcal=3000;const rng=Math.random;Math.random=()=>.99;try{G.stealFrom(npc);}finally{Math.random=rng;}
 T.ok('actual ration theft retains the food origin without creating intake',s.inventory.some(i=>i.stolen&&i.gardenShares?.ordinary===1)&&!book());s.kcal=0;G.eatOne(0);T.ok('eating the stolen portion counts the original crop exactly once',book()?.origins.ordinary.kcal===150);
 for(const capdraw of [false,true])for(const ration of [false,true]){
  fresh();const prior=process.env.CAPDRAW2;if(capdraw)process.env.CAPDRAW2='1';else delete process.env.CAPDRAW2;
  s.kcal=G.kcalCap()-100;const serving=food();serving.kcalEach=1000;v.pantry=[serving];if(ration)v.rationing={until:86};
  try{const before=s.kcal;G.villageMeal();const remaining=G.pantryKcal(),b=book();
   T.ok('real clipped/refunded communal meal conserves crop intake capdraw='+capdraw+' ration='+ration,close(b?.kcal,1000-remaining)&&close(b.origins.ordinary.kcal,.4*b.kcal)&&close(b.origins.assisted.nourishment,.6*Math.max(0,s.kcal-before))&&v.pantry.every(i=>close(i.gardenShares?.ordinary,.4)&&close(i.gardenShares?.assisted,.6)));
  }finally{if(prior===undefined)delete process.env.CAPDRAW2;else process.env.CAPDRAW2=prior;}
 }
 fresh();s.kcal=10000;G.learnTechnique('render','trial');s.inventory=[
  {name:'Smoked meat',foodKind:'meat',foodState:'preserved',units:2,kcalEach:400,spoilDay:100},
  {name:'Rendered fat',foodKind:'fat',foodState:'rendered',units:1,kcalEach:400,spoilDay:100},
  {name:'Berries',plantId:'blackberry',foodKind:'plant',edible:true,units:2,kcalEach:200,spoilDay:100,gardenShares:{assisted:1}},
 ];G.makePemmican();const bars=s.inventory.find(i=>i.itemId==='pemmican');
 T.ok('real mixed recipe weights cultivated origin by ingredient calories, not item count',bars?.units===3&&bars.kcalEach===517&&close(bars.gardenShares?.assisted,.25)&&!book());
 G.pantryAdd(bars);T.ok('finished recipe shelving preserves its partial crop fraction',v.pantry.length&&v.pantry.every(i=>close(i.gardenShares?.assisted,.25)));
 fresh();const plant=G.data.plants.find(p=>p.id==='dandelion');G.addUnknownToLump(plant,2,85,undefined,undefined,{ordinary:1});G.addUnknownToLump(plant,2,85);G.stageForPrep();const stash=G.prepStash(),sorted=G.splitLumpOut(stash[0],plant.id,stash);
 T.ok('actual unknown-food staging and sorting retain the known half without identifying the rest',sorted.units===4&&close(sorted.gardenShares?.ordinary,.5)&&!book());
 for(let d=85;d<105;d++){s.day=d;s.kcal=0;s.inventory=[food()];G.eatOne(0);}
 T.ok('delayed sampling retains twenty meals beyond the eight-day diagnostic ring',book()?.records===20&&book().kcal===10000&&close(book().origins.ordinary.kcal,4000)&&close(book().origins.assisted.kcal,6000)&&Object.keys(v.harvestIntake).length===8);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
