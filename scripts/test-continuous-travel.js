#!/usr/bin/env node
'use strict';
// Real travelTo/findWalkableEntry on prepared detail arrays. Exact-edge claims
// use open entries; blocked rims and isolated pockets have separate contracts.
const assert=require('assert/strict'),K=require('./godpath/lib');
const seed=Number(process.env.SEED||20261006);let checks=0;
function check(name,condition){assert(condition,name);checks++;console.log('PASS '+name);}
(async()=>{
 const G=await K.load({seed,narration:true});G.debugRegion='na_eastern_woodlands';K.newRun(G,'Columbus, Ohio');
 const s=G.state.scholar,x0=G.map.px,y0=G.map.py,rows=[];
 check('interior starting node permits all directions',x0>0&&x0<7&&y0>0&&y0<6);
 function prepare(tx,ty,fill='grass'){
  G.reveal(tx,ty);const tile=G.tileAt(tx,ty),detail=G.genDetail(tx,ty);assert(tile&&detail);
  tile.traps=[];tile.animal=null;tile.modifiers={};tile.secrets={};
  for(let y=0;y<9;y++)for(let x=0;x<9;x++)detail[y][x]=fill;
  return detail;
 }
 function walkable(tx,ty,x,y){const d=G.genDetail(tx,ty);return !!d[y]?.[x]&&!G.cellProps(d[y][x]).blocks;}
 function cross(name,tx,ty,mx,my,expected){
  s.mx=mx;s.my=my;const from=[G.map.px,G.map.py],oldVid=G.villagerId;
  const result=G.travelTo(tx,ty,true);
  check(name+': actual map transition',G.map.px===tx&&G.map.py===ty&&JSON.stringify(from)!==JSON.stringify([tx,ty]));
  check(name+': exact prepared entry',s.mx===expected[0]&&s.my===expected[1]);
  check(name+': real entry is walkable',walkable(tx,ty,s.mx,s.my));
  check(name+': crossing retains living bearer',G.villagerId===oldVid&&s.health>0&&!G.over);
  rows.push({name,from,to:[tx,ty],entry:[s.mx,s.my],resultIsNull:result===null});
 }
 for(const [x,y] of [[x0,y0],[x0,y0-1],[x0+1,y0],[x0+1,y0-1],[x0+1,y0+2]])prepare(x,y);
 cross('north open',x0,y0-1,6,0,[6,8]);
 cross('south open',x0,y0,2,8,[2,0]);
 cross('east open',x0+1,y0,8,5,[0,5]);
 cross('west open',x0,y0,0,5,[8,5]);
 cross('diagonal NE open',x0+1,y0-1,4,4,[0,8]);
 cross('multi-tile south open',x0+1,y0+2,4,4,[4,0]);
 // Return to the west of a controlled east-entry node.
 prepare(x0,y0);G.travelTo(x0,y0,true);
 let d=prepare(x0+1,y0);d[5][0]='tree';
 check('blocked-rim fixture is genuinely blocked',!!G.cellProps(d[5][0]).blocks);
 cross('east blocked rim',x0+1,y0,8,5,[1,5]);
 check('blocked-rim fallback has a walkable exit',walkable(x0+1,y0,2,5));
 // The desired edge is walkable but isolated. Prefer the nearest connected
 // pair, not a pocket that leaves the player unable to make any grid move.
 G.travelTo(x0,y0,true);d=prepare(x0+1,y0,'tree');d[5][0]='grass';d[5][2]='grass';d[5][3]='grass';
 check('isolated entry is walkable',walkable(x0+1,y0,0,5));
 check('isolated entry has no adjacent walkable cell',[-1,0,1].every(dy=>[-1,0,1].every(dx=>(dx===0&&dy===0)||!walkable(x0+1,y0,dx,5+dy))));
 cross('east isolated pocket',x0+1,y0,8,5,[2,5]);
 const step=G.microMove(3,5);
 check('connected fallback permits an actual grid step',!!step&&s.mx===3&&s.my===5&&walkable(x0+1,y0,3,5));
 // If no connected cell exists, retain the nearest walkable singleton.
 d=prepare(x0+1,y0,'tree');d[2][1]='grass';
 const singleton=G.findWalkableEntry(x0+1,y0,0,2);
 check('all-pocket fallback is nearest actual walkable cell',singleton.x===1&&singleton.y===2&&walkable(x0+1,y0,singleton.x,singleton.y));
 console.log('TRAVEL_FIXTURE_RESULT '+JSON.stringify({seed,checks,rows,singleton}));
 delete G.debugRegion;console.log(`${checks} passed, 0 failed`);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
