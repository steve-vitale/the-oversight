'use strict';
const fs=require('node:fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7002});
 for(const kind of ['fresh','legacy']){
  K.newRun(G);const s=G.state.scholar,v=G.state.village,t=G.playerTile();
  s.day=4;s.dayTicks=96;s.actionClock=0;G.dayPart=0;s.kcal=6000;s.hydration=100;s.health=100;s.energy=100;
  // Declared precondition: stand by the real hall door. Do not pay for or
  // perform any interaction under test in this prepared source-side fixture.
  s.insideHaven=false;const grounds=G.genDetail(G.map.px,G.map.py);
  if(kind==='legacy'){
   grounds[5][4]='tent';grounds[5][3]='fire';grounds[5][5]='tent';
   t.secrets={...(t.secrets||{}),'4,5':{yours:true,packedFrom:'declared legacy player tent'}};
  }
  const preserved=JSON.stringify({grid:grounds,secrets:t.secrets||{}});
  s.insideHaven=true;t.detail=null;G.genDetail(G.map.px,G.map.py);s.mx=4;s.my=7;
  v.away={};v.talkRequests={};v.engaged={};
  if(!G.save())throw Error('Prepared Haven save failed');
  fs.writeFileSync('evidence/2026-10-20/haven-access-'+kind+'-fixture-r1.json',JSON.stringify({scope:'Declared shared-harness Haven scene, actual hall door and fresh or explicitly legacy player-built grounds. Browser mutations must use normal touch controls. Not a natural campaign or physical device.',setup:{key:G.state.runKey,kind,preserved},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
