'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const storage=new Map();global.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size}};
 const G=await K.load({seed:8419});K.newRun(G);const s=G.state.scholar;G.state.systemArrived=true;G.state.systemAnimationShown=true;s.knackChoices=s.abilityChoices=s.relicChoices=null;
 G.map.px=2;G.map.py=4;s.mx=s.my=0;s.insideHaven=false;s.water=[];s.abilities=[];s.backgroundAbilities=[];s.equipped={};G.playerTile().type='forest_floor';G.genDetail(2,4).forEach(row=>row.fill('grass'));
 const cap=G.packCapacity();s.inventory=[{name:'Prepared ballast',units:1,kg:cap*1.2,kcalEach:0}];
 const body=G.registerDeath({kind:'monster',name:'Prepared carcass',mx:0,my:0,items:[{name:'Small hide',material:'hide',units:1,kg:1,kcalEach:0},{name:'Heavy bundle',material:'wood',units:2,kg:cap,kcalEach:0}]});
 G.save();fs.writeFileSync(process.argv[2],JSON.stringify({fixture:'Prepared edge corpse and 120% normal load; native pickup and refusal are the actions under test.',expected:{cap,body:body.id,weight:G.packWeight()},storage:Object.fromEntries(storage)},null,2)+'\n',{flag:'wx'});
})().catch(e=>{console.error(e.stack);process.exitCode=1});
