'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{const store=new Map();globalThis.localStorage={get length(){return store.size;},key:i=>[...store.keys()][i]??null,getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 const G=await K.load({seed:7002});K.newRun(G);G.chooseKnack(G.liveKnackChoices()[0].id);const s=G.state.scholar;
 G.map.px=4;G.map.py=4;G.location='haven';s.insideHaven=true;s.day=2;s.dayTicks=384;s.actionClock=0;G.dayPart=3;s.kcal=2400;s.hydration=100;s.health=80;s.energy=30;
 if(G.save()!==true)throw Error('Prepared checkpoint failed');
 fs.writeFileSync('evidence/2026-10-20/overnight-save-phone-fixture-r1.json',JSON.stringify({scope:'Prepared protected Haven night, day2/ticks384, health80/energy30, existing generated pantry/roster/gear and actual offered knack chosen. Not naturally reached night or ability viability.',setup:{key:G.state.runKey},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
})();
