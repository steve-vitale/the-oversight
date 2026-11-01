'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function read(root){
 const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/combat-turn-proof.json'),'utf8'));
 return{pointer,receipts:pointer.receipts.map(p=>{const bytes=fs.readFileSync(path.join(root,p.path)),compressed=p.path.endsWith('.gz');return{...p,actualHash:hash(compressed?bytes:bytes.toString('utf8').replace(/\r\n/g,'\n')),data:JSON.parse(compressed?z.gunzipSync(bytes):bytes)};})};
}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(ok,label)=>{if(!ok)errors.push(label);},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),expected=F.expectedInputs(root),keys=new Set();
 check(pointer.schemaVersion===1&&pointer.receiptHashNormalization==='lf-v1','Proof schema');check(receipts.length===12,'Six fights, four reloads and two readers required');
 for(const r of receipts){const d=r.data,w=d.sourceWitness,label=r.kind+':'+d.height+':'+(d.scene||d.phase||'reader');
  check(!keys.has(label),'Duplicate '+label);keys.add(label);check(r.actualHash===r.sha256,label+' receipt bytes');check([736,844].includes(d.height),label+' height');check(d.errors?.length===0,label+' browser errors');
  check(w?.schemaVersion===1&&w.trustedTouches?.length>=3&&w.trustedTouches.every(t=>t.trusted),label+' trusted touches');
  for(const[file,digest]of Object.entries(expected))check(w?.networkInputs?.[file]===digest,label+' stale response '+file);
  const recipe='evidence/2026-10-22/combat-turn-'+r.kind+'-r1.cjs';
  for(const file of [recipe,'evidence/2026-10-22/combat-turn-network-r1.cjs','evidence/2026-10-22/combat-turn-fixtures-r4.json'])check(w?.recipeInputs?.[file]===F.normalized(path.join(root,file)),label+' changed preparation/recipe '+file);
  if(r.kind==='play'){
   check(['ordinary-solo','ordinary-party','deer-party'].includes(d.scene),label+' scene');
   const outcome=d.states.find(s=>s.label==='native outcome'),continued=d.states.find(s=>s.label==='outcome continued');
   check(!!outcome&&(!outcome.fight||outcome.fight.over)&&!!continued&&(!continued.fight||continued.fight.over),label+' native ending');
   check(outcome?.bearer===continued?.bearer&&same(outcome?.map,continued?.map)&&outcome?.state.scholar.insideHaven===continued?.state.scholar.insideHaven,label+' Continue body/location');
   check(d.states.length>3&&d.states.every(s=>s.homeType==='haven'&&(!s.state.scholar.insideHaven||s.tileType==='haven')&&s.rects.every(b=>b.y>=0&&b.bottom<=d.height)),label+' actual Haven and phone frame');
   check(d.states.some(s=>s.label==='details closed'),label+' details journey');
   check(d.events?.length>0,label+' native actor events');
   for(const e of d.events||[]){const a=e.before?.find(f=>f.key==='p'),b=e.after?.find(f=>f.key==='p');if(a&&b&&a.hp>b.hp)check(e.summary?.includes('You −'+Math.round((a.hp-b.hp)*10)/10+' HP'),label+' hidden actual damage');}
   if(d.scene!=='ordinary-solo')check(d.events.some(e=>e.key.startsWith('v_')),label+' companion turn');
  }else if(r.kind==='resume'){
   const actual=d.after.events.filter(e=>e.detail.phase==='resolved').map(e=>e.detail.key);
   check(['announced','resolved'].includes(d.phase)&&same(actual,d.expected),label+' remaining actor order');
   check(d.after.fight.round===d.initial.round+1&&!d.after.fight.fighters.find(f=>f.key==='p')?.acted,label+' one round hand-back');
   check(d.committed.scholar.health===d.paused.health&&same(d.committed.run.tbfight.fighters.map(f=>[f.key,f.hp]),d.paused.fight.fighters.map(f=>[f.key,f.hp])),label+' actual pagehide bytes');
   check(d.phase==='announced'?d.committed.run.tbfight.pendingTurnKey===d.paused.detail.key:!d.committed.run.tbfight.pendingTurnKey,label+' pending cursor');
  }else if(r.kind==='reader')check(d.visible&&d.before===d.after&&d.before.includes(d.detail.name+' · turn details'),label+' selected reader survives asynchronous actors');
  else check(false,label+' unknown proof kind');
 }
 for(const h of [736,844]){for(const s of ['ordinary-solo','ordinary-party','deer-party'])check(keys.has('play:'+h+':'+s),'Missing fight '+h+s);for(const phase of ['announced','resolved'])check(keys.has('resume:'+h+':'+phase),'Missing reload '+h+phase);check(keys.has('reader:'+h+':reader'),'Missing reader '+h);}
 return{ok:errors.length===0,errors};
}
module.exports={read,verify};
