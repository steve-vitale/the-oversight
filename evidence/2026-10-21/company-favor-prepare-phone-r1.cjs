'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{const store=new Map();globalThis.localStorage={get length(){return store.size;},key:i=>[...store.keys()][i]??null,getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 const G=await K.load({seed:7002});K.newRun(G);G.chooseKnack(G.liveKnackChoices()[0].id);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
 G.map.px=v.px??4;G.map.py=v.py??4;G.location='haven';s.insideHaven=true;s.day=4;s.dayTicks=384;s.actionClock=0;G.dayPart=3;s.kcal=2400;s.health=80;s.energy=40;s.hydration=100;
 v.away={};v.assignments={};v.taskLeads={};v.gardenKeeper=null;v.promises={};v.favorLedger={};v.engaged={};
 const grid=G.genDetail(G.map.px,G.map.py),fire=grid.flatMap((row,y)=>row.map((c,x)=>c==='fire'?{mx:x,my:y}:null)).find(Boolean),slots=[];
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=fire.mx+dx,y=fire.my+dy;if(grid[y]?.[x]&&!G.cellProps(grid[y][x]).blocks)slots.push({mx:x,my:y});}
 const a=slots.find(a=>slots.some(b=>b!==a&&Math.max(Math.abs(a.mx-b.mx),Math.abs(a.my-b.my))<=1)),b=slots.find(b=>b!==a&&Math.max(Math.abs(a.mx-b.mx),Math.abs(a.my-b.my))<=1);Object.assign(s,a);
 for(const id of v.roster)if(id!==G.villagerId)G.npcSetInside(id,id===vid);
 G.npcSetNode(vid,G.map.px,G.map.py);v.positions={[vid]:b};v.health={...v.health,[vid]:100};Object.assign(G.npcNeeds(vid),{fear:90,hunger:10,social:60,energy:80});
 G.convoPlantSeed(vid,{wantId:'ask_favor',note:'prepared fear, actual request is authored by the conversation'});if(G.save()!==true)throw Error('Prepared save failed');
 fs.writeFileSync('evidence/2026-10-21/company-favor-phone-fixture-r1.json',JSON.stringify({scope:'Prepared night, actual generated hearth/people; declared fear90 and protected player stats, neighbor beside player, other residents outside. No favor, promise, outcome, conversation reply or time credit supplied. Actual offered initial knack selected.',setup:{key:G.state.runKey,npc:vid},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
