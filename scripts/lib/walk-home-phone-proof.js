'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update'),same=require('util').isDeepStrictEqual;
const dir='evidence/2026-10-29/walk-home-checkpoint-r1',sha=b=>crypto.createHash('sha256').update(b).digest('hex'),norm=s=>s.replace(/\r\n/g,'\n');
function read(root){return JSON.parse(z.gunzipSync(fs.readFileSync(path.join(root,dir,'native-r3-report.json.gz'))));}
function verify(root,r){
 const errors=[],check=(v,m)=>{if(!v)errors.push(m);},source=F.expectedInputs(root),fixture=fs.readFileSync(path.join(root,dir,'actual-before-return-profile.json.gz')),old=sha(norm(z.gunzipSync(fs.readFileSync(path.join(root,dir,'baseline-timeSettlement-e527.js.txt.gz'))).toString())),seen=new Set();
 check(r.schemaVersion===1&&r.sourceStable&&same(r.source,source),'stale runtime');check(r.fixtureSha256===sha(fixture),'changed actual fixture');check(r.baselineSha256===old,'changed original boundary');check(r.recipeSha256===sha(norm(fs.readFileSync(path.join(root,dir,'replay.cjs'),'utf8'))),'changed recipe');check(r.rows?.length===8,'eight scenes required');
 for(const row of r.rows||[]){
  const id=row.height+':'+row.variant+':'+row.walk,expected={...source};if(row.variant==='baseline')expected['src/js/timeSettlement.js']=old;
  check(!seen.has(id)&&[736,844].includes(row.height)&&['baseline','current'].includes(row.variant)&&typeof row.walk==='boolean','duplicate/unknown scene');seen.add(id);check(same(row.expected,expected)&&same(row.responses,expected),'actual loaded response bytes');
  check(row.errors?.length===0,'browser errors');check(row.touches?.length>0&&row.touches.every(t=>t.trusted&&t.type==='touch'),'trusted touch');check(row.controls?.length>0&&row.controls.every(c=>c.box&&c.box.x>=0&&c.box.y>=0&&c.box.x+c.box.width<=390&&c.box.y+c.box.height<=row.height),'visible controls');
  const before=JSON.parse(row.beforeRaw),saved=JSON.parse(row.afterRaw),live=row.live;check(same(saved,row.saved),'raw saved bytes');check(same(row.restored?.scholar,before.scholar)&&same(row.restored?.codex,before.codex),'whole initial recovery');
  const durable=same(saved.scholar,live.scholar)&&same(saved.codex,live.codex)&&saved.run.map.px===live.map.px&&saved.run.map.py===live.map.py;check(row.durable===durable,'honest durability flag');
  if(row.walk){
   check(live.map.px===4&&live.map.py===4,'actual home arrival');check(live.scholar.kcal===before.scholar.kcal&&live.scholar.dayTicks===before.scholar.dayTicks,'authored free node cost');check(!live.scholar.inventory.some(i=>i.foodState==='carcass')&&live.scholar.prepStash.filter(i=>i.foodState==='carcass').length===1,'real arrival transfer');
   if(row.variant==='current')check(durable&&same(saved.run.log,live.log),'whole final checkpoint including return words');
   else check(!durable&&saved.scholar.inventory.some(i=>i.foodState==='carcass'),'required original missing checkpoint');
  }else check(durable&&saved.run.map.px===(row.variant==='current'?4:5)&&saved.run.map.py===(row.variant==='current'?4:3)&&saved.scholar.inventory.some(i=>i.foodState==='carcass')===(row.variant==='baseline'),'honest original/current cold outcome');
 }
 for(const h of [736,844])for(const variant of ['baseline','current'])for(const walk of [true,false])check(seen.has(h+':'+variant+':'+walk),'missing contrast');
 return{ok:errors.length===0,errors};
}
module.exports={read,verify};
if(require.main===module)require('./retain-phone-report').runCLI(dir+'/native-r3-report.json.gz',verify);
