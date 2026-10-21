'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{const store=new Map();global.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7002});K.newRun(G);G.chooseKnack(G.liveKnackChoices()[0].id);const s=G.state.scholar,v=G.state.village;K.openSlots(G,3);if(!K.giveAbility(G,'green_thumb'))throw Error('Declared prepared power was not actually held');s.kcal=6000;G.exitBuilding();v.pantry=[];v.havenTier=1;G.makePlot();G.makePlot();
 s.day=31;s.dayTicks=0;s.actionClock=0;G.dayPart=0;s.kcal=1500;s.health=100;s.energy=100;s.hydration=100;s.inventory=[];s.mx=4;s.my=5;v.assignments={};v.gardenKeeper=null;
 G.state.codex.plants.dandelion={level:3,prepKnown:true};G.gardenPlant(G.gardenPlots()[0],'dandelion',1);G.gardenPlant(G.gardenPlots()[1],'dandelion',5);
 if(v.gardenIntakeTotals)throw Error('Preparation unexpectedly ate food');if(G.save()!==true)throw Error('Prepared save failed');
 fs.writeFileSync('evidence/2026-10-21/garden-intake-phone-fixture-r2.json',JSON.stringify({scope:'Prepared two actual paid beds, declared day31: ordinary 30-day crop and 26-day crop awaiting a real paid growth cast. Green Thumb is supplied for this prepared opportunity with sufficient real slot capacity. Protected body/knowledge, empty pack/pantry. No harvest, food-origin shares or intake receipt supplied.',setup:{key:G.state.runKey},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
