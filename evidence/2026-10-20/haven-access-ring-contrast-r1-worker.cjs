'use strict';
const fs=require('node:fs'),K=require(process.argv[2]+'/scripts/godpath/lib'),B=require(process.argv[2]+'/scripts/balance-panel');
(async()=>{
 const G=await K.load({seed:7002});K.newRun(G);const s=G.state.scholar;s.kcal=6000;
 s.inventory.push({kind:'tent',name:'Packed tent',units:9,kg:2.5});G.exitBuilding();
 function walk(goal,adjacent){
  const cells=G.genDetail(G.map.px,G.map.py),open=(x,y)=>!!cells[y]?.[x]&&cells[y][x]!=='lodge'&&!G.cellProps(cells[y][x]).blocks;
  const end=(x,y)=>adjacent?Math.max(Math.abs(x-goal[0]),Math.abs(y-goal[1]))<=1&&(x!==goal[0]||y!==goal[1]):x===goal[0]&&y===goal[1];
  const q=[[s.mx,s.my,[]]],seen=new Set();let route=null;
  while(q.length){const[x,y,path]=q.shift(),k=x+','+y;if(seen.has(k)||!open(x,y))continue;seen.add(k);if(end(x,y)){route=path;break;}for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])q.push([x+dx,y+dy,[...path,[x+dx,y+dy]]]);}
  if(!route)throw Error('No actual walking route to '+goal);
  for(const[x,y]of route)if(G.microMove(x,y)!==true)throw Error('Normal paid movement refused');
 }
 const built=[];
 for(const[x,y]of [[4,5],[5,5],[3,5],[6,4],[6,3],[2,3],[6,5],[6,2],[2,2]]){
  const cells=G.genDetail(G.map.px,G.map.py);if(cells[y][x]==='tent')continue;
  walk([x,y],true);G.pitchTent(x,y);if(G.genDetail(G.map.px,G.map.py)[y][x]!=='tent'||!G.playerTile().secrets[x+','+y]?.yours)throw Error('Paid tent construction failed');built.push([x,y]);
 }
 walk([4,2],false);const preserved=JSON.stringify({grid:G.playerTile().groundsDetail,secrets:G.playerTile().secrets});const entered=G.enterBuilding(),exited=G.exitBuilding(),cells=G.playerTile().groundsDetail;
 const report={root:process.argv[2],sources:B.manifest(process.argv[2]),structuresPreserved:JSON.stringify({grid:G.playerTile().groundsDetail,secrets:G.playerTile().secrets})===preserved,scope:'Prepared nine packed tents/food; all placement and travel through real paid engine actions, no terrain edits. Tests a legitimately constructible legacy camp around the hall, not natural acquisition or browser coverage.',built,entered,exited,inside:s.insideHaven,position:[s.mx,s.my],remainingOpenGround:cells.flat().filter(c=>['dirt','grass','plant','bush'].includes(c)).length,lastLines:G.log.slice(-3)};
 fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
