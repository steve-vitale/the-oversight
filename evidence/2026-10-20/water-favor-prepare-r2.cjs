'use strict';
const fs=require('node:fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7002});K.newRun(G);const s=G.state.scholar,v=G.state.village;
 const vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead),person=G.getPerson(vid);
 v.px=4;v.py=4;G.map.px=4;G.map.py=4;s.mx=8;s.my=5;s.insideHaven=false;
 s.day=4;s.dayTicks=480;s.actionClock=0;G.dayPart=3;s.kcal=6000;s.hydration=100;s.health=100;s.energy=100;
 s.languages={english:2};person.languages={native:'english',levels:{english:2}};G.revealName(vid,'intro');
 v.away={};v.engaged={};v.promises={};v.favorLedger={};v.talkRequests={};v.water={clean:2,dirty:0};
 for(const id of v.roster)if(id!==G.villagerId)G.npcSetInside(id,id!==vid);
 G.npcSetNode(vid,4,4);v.positions={[vid]:{mx:7,my:5}};v.health={...v.health,[vid]:100};
 Object.assign(G.npcNeeds(vid),{hunger:20,energy:90,fear:10});
 const creek=G.map.tiles[4][5];creek.type='creek';creek.revealed=true;creek.needsBridge=false;creek.blockage=null;
 creek.detail=Array.from({length:9},()=>Array(9).fill('dirt'));creek.detail[0][0]='water';G.markSeen(5,4,'visited');
 const favor=G.convoBuildFavor(vid,{kind:'water_haul',water:2});G.convoStoreFavor(favor);G.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:favor.short});
 if(!G.save())throw Error('Prepared scene save failed');
 fs.writeFileSync('evidence/2026-10-20/water-favor-phone-fixture-r2.json',JSON.stringify({scope:'Prepared native-play scene from the shared seeded new-run engine: explicit dawn clock, low cistern, known adjacent creek/open corridor, shared language/name and nearby requester. Not natural encounter or campaign coverage. All browser actions must use actual UI controls.',setup:{key:G.state.runKey,npc:vid,name:G.displayName(vid),favorId:favor.id},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
