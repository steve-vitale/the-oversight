'use strict';
const fs=require('node:fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7002});
 for(const kind of ['open','sealed']){
  K.newRun(G);const s=G.state.scholar,t=G.playerTile();s.kcal=6000;s.hydration=100;s.health=100;s.energy=100;
  G.chooseKnack(G.liveKnackChoices()[0].id);
  s.insideHaven=false;G.genDetail(G.map.px,G.map.py);
  if(kind==='sealed'){t.groundsDetail=Array.from({length:9},()=>Array(9).fill('wall'));for(let y=3;y<=4;y++)for(let x=3;x<=5;x++)t.groundsDetail[y][x]='lodge';}
  s.insideHaven=true;t.detail=null;G.genDetail(G.map.px,G.map.py);
  K.fight(G,'hushwolf',{px:4,py:5,mx:1,my:1});const p=G.tbFighter('p');p.moveLeft=3;p.acted=false;s.mx=4;s.my=5;
  if(!G.save())throw Error('Prepared door-fight save failed');
  fs.writeFileSync('evidence/2026-10-20/haven-access-combat-'+kind+'-fixture-r2.json',JSON.stringify({scope:'Declared isolated indoor door-flee test: one actual hushwolf, prepared player turn at the door, ordinary 100 player HP, first knack chosen and open or deliberately sealed grounds. Not natural attainment or a combat win/balance proof.',setup:{key:G.state.runKey,kind},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
