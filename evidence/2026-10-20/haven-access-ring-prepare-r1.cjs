'use strict';
const fs=require('node:fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7002});K.newRun(G);const s=G.state.scholar;s.kcal=6000;G.chooseKnack(G.liveKnackChoices()[0].id);
 s.inventory.push({kind:'tent',name:'Packed tent',units:9,kg:2.5});G.exitBuilding();
 function walk(goal,adjacent){
  const cells=G.genDetail(G.map.px,G.map.py),open=(x,y)=>!!cells[y]?.[x]&&cells[y][x]!=='lodge'&&!G.cellProps(cells[y][x]).blocks;
  const end=(x,y)=>adjacent?Math.max(Math.abs(x-goal[0]),Math.abs(y-goal[1]))<=1&&(x!==goal[0]||y!==goal[1]):x===goal[0]&&y===goal[1];
  const q=[[s.mx,s.my,[]]],seen=new Set();let route=null;
  while(q.length){const[x,y,path]=q.shift(),k=x+','+y;if(seen.has(k)||!open(x,y))continue;seen.add(k);if(end(x,y)){route=path;break;}for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])q.push([x+dx,y+dy,[...path,[x+dx,y+dy]]]);}
  if(!route)throw Error('No actual construction route');for(const[x,y]of route)if(G.microMove(x,y)!==true)throw Error('Paid construction movement refused');
 }
 for(const[x,y]of [[4,5],[5,5],[3,5],[6,4],[6,3],[2,3],[6,5],[6,2],[2,2]]){if(G.genDetail(G.map.px,G.map.py)[y][x]==='tent')continue;walk([x,y],true);G.pitchTent(x,y);if(!G.playerTile().secrets[x+','+y]?.yours)throw Error('Paid construction failed');}
 walk([4,2],false);G.enterBuilding();const v=G.state.village;v.talkRequests={};v.engaged={};for(const id of v.roster)if(id!==G.villagerId)G.npcSetInside(id,true);
 const t=G.playerTile(),preserved=JSON.stringify({grid:t.groundsDetail,secrets:t.secrets||{}});if(!G.save())throw Error('Ring fixture save failed');
 fs.writeFileSync('evidence/2026-10-20/haven-access-ring-fixture-r1.json',JSON.stringify({scope:'Declared nine packed tents and food; the saved camp was built by real paid placement/movement APIs. First knack chosen and other residents placed inside to isolate the door boundary. Browser proof must use normal touch; not natural item acquisition or a campaign.',setup:{key:G.state.runKey,kind:'ring',preserved},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
