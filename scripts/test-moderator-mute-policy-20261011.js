#!/usr/bin/env node
'use strict';
// Explicit prepared muting/history scene, not a natural equipment campaign.
// Each case loads one full shared runtime; public actions use the turn token.
const K=require('./godpath/lib'),H=require('./policies/human-combat'),a=require('assert/strict'),cp=require('child_process');
async function scene(mode){
 const G=await K.load({seed:20261011,narration:true}),s=K.newRun(G),bearer=G.villagerId,captured=[],say=G.say;
 s.equipped={};for(const id of ['swat_vest','fire_hardened_spear']){const d=K.readJSON('src/data/items.json').find(x=>x.id===id);a(d);s.inventory.push({itemId:id,name:d.name,kg:d.kg,units:1});G.equip(s.inventory.length-1,d.armor?'armor':'weapon');a(Object.values(s.equipped).some(x=>x.itemId===id));}
 if(mode==='stocked'){const d=K.readJSON('src/data/items.json').find(x=>x.id==='field_sutures');s.inventory.push({itemId:d.id,name:d.name,kg:d.kg,units:8});}
 const starting={hp:s.health,max:G.maxHealth(),protection:G.armorBonus(),weapon:G.equippedWeapon().itemId};
 G.say=function(...args){captured.push(String(args[0]));return say.apply(this,args);};
 const grid=G.genDetail(G.map.px,G.map.py);for(const row of grid)row.fill('dirt');const m=K.fight(G,'moderator',{px:3,py:4,mx:5,my:4}),f=G.tbfight,p=G.tbFighter('p');a(m&&f&&p);
 // Prepared prior strike habit and live suppression. The real AI still selects
 // its authored attack; this proves mute/quiet behavior, not natural move names.
 G.encSetPhase(m,'muting');m.telegraph=null;f.modRecent=['strike','strike','strike','strike','strike'];G.modProjectField(m,2,'suppressed');G.tbPlayerWait();
 const initialMhp=m.hp,rows=[],heals=[],hits=[],damage=G.tbDamage,playerStrike=G.tbPlayerStrike;let ownStrike=false;
 G.tbPlayerStrike=function(...args){const prior=ownStrike;ownStrike=this.tbFighter('p')===p&&this.villagerId===bearer;try{return playerStrike.apply(this,args);}finally{ownStrike=prior;}};
 G.tbDamage=function(key,...args){const target=key==='p'?p:key===m.key?m:null,before=target?.hp,result=damage.call(this,key,...args);if(target&&before>target.hp)hits.push({key,debit:before-target.hp,ownStrike});return result;};
 let cursor=captured.length,quiet=0,liftSeen=false;const limit=mode==='bad'?10:mode==='stocked'?160:16;
 for(let i=0;i<limit&&G.tbfight===f&&!f.over&&!G.over&&p.alive&&G.villagerId===bearer;i++){
  a(G.tbIsPlayerTurn());const beforeHp=p.hp,token=H.token(G,f),before=m.modViolations||0,logs=captured.slice(cursor);cursor=captured.length;
  if(logs.some(x=>x.includes('IS MUTED inside')))quiet=6;
  if(logs.some(x=>x.includes('The mute LIFTS'))){quiet=0;liftSeen=true;}
  const med=s.inventory.findIndex(x=>x.itemId==='field_sutures'&&x.units>0),action=mode==='stocked'&&p.hp<50&&med>=0?'heal':mode==='bad'||quiet===0?'strike':'wait';
  if(action==='heal'){const item=s.inventory[med],units=item.units,hp=p.hp;G.useItem(med);heals.push({gain:p.hp-hp,consumed:units-item.units,acted:p.acted});}
  else if(action==='strike')G.tbPlayerStrike(m.key);
  else{G.tbPlayerWait();quiet--;}
  if(H.sameTurn(G,f,p,token))G.tbPlayerWait();
  rows.push({action,beforeHp,beforeViolations:before,violations:m.modViolations||0,hp:p.hp,mhp:m.hp,quiet});
 }
 return{mode,starting,initialMhp,rows,heals,hits,liftSeen,violations:m.modViolations||0,result:f.result,over:f.over,playerAlive:p.alive,hp:p.hp,max:p.maxHp,sameBearer:G.villagerId===bearer,sameScholar:G.state.scholar===s,synchronized:s.health===p.hp,monsterHp:m.hp,monsterAlive:m.alive,monsterFled:!!m.fled,solo:f.fighters.filter(x=>x.kind!=='monster').length===1,logCount:G.log.length,capturedCount:captured.length,lines:captured,medicineLeft:s.inventory.filter(x=>x.itemId==='field_sutures').reduce((n,x)=>n+x.units,0),kills:(G.state.waveKillLog||[]).filter(x=>x.mid==='moderator'),bearer,corpse:m._deathCorpse&&{mid:m._deathCorpse.monsterId,by:m._deathCorpse.killerId}};
}
if(process.argv[2]==='--child')scene(process.argv[3]).then(r=>console.log('MODERATOR_RESULT '+JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const T=K.reporter('Moderator public mute and quiet play'),rows={};
 for(const mode of ['bad','aware','stocked']){const r=cp.spawnSync(process.execPath,[__filename,'--child',mode],{cwd:K.ROOT,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});a.equal(r.status,0,r.stderr+'\n'+r.stdout);const lines=r.stdout.split('\n').filter(x=>x.startsWith('MODERATOR_RESULT '));a.equal(lines.length,1);const x=rows[mode]=JSON.parse(lines[0].slice(17));console.log(JSON.stringify(x));T.ok(mode+': ordinary capacity and actual canonical loadout',x.starting.hp===100&&x.starting.max===100&&x.max===100&&x.starting.protection===35&&x.starting.weapon==='fire_hardened_spear'&&x.solo);if(mode!=='bad')T.ok(mode+': actual quiet turns never add a violation',x.rows.some(r=>r.action==='wait')&&x.rows.filter(r=>r.action==='wait').every(r=>r.violations===r.beforeViolations));else T.ok('bad: blocked strikes pay actual incoming HP costs',x.rows.every(r=>r.hp<r.beforeHp));}
 const {bad:b,aware:q,stocked:c}=rows;
 T.ok('strike-only: nearly every actual attempt is muted',b.rows.length===10&&b.rows.every(r=>r.action==='strike'&&r.violations===r.beforeViolations+1));
 T.ok('strike-only: zero monster progress despite real violations',b.monsterHp===b.initialMhp&&b.hits.filter(h=>h.key!=='p').length===0&&b.violations===10);
 T.ok('strike-only: honest original-body death is not called a stall or win',b.over&&b.result==='lost'&&!b.playerAlive&&b.hp<=0&&b.monsterAlive&&!b.monsterFled&&b.kills.length===0);
 T.ok('cue-aware: all sixteen original public turns complete alive',q.rows.length===16&&q.playerAlive&&q.hp>0&&q.sameBearer&&q.sameScholar&&q.synchronized);
 T.ok('cue-aware: violations stay tiny and are never consecutive',q.violations<=3&&q.rows.every((r,i)=>i===0||!(r.violations>r.beforeViolations&&q.rows[i-1].violations>q.rows[i-1].beforeViolations)));
 T.ok('cue-aware: quiet actually lifts the mute and announces it',q.liftSeen&&q.lines.some(x=>x.includes('The mute LIFTS'))&&q.rows.some(r=>r.action==='wait'));
 T.ok('cue-aware: actual owned Strikes make damage progress',q.monsterHp<q.initialMhp&&q.hits.some(h=>h.key!=='p'&&h.ownStrike&&h.debit>0));
 T.ok('stocked: real whole fight ends won with original normal body alive',c.over&&c.result==='won'&&c.playerAlive&&c.hp>0&&c.sameBearer&&c.sameScholar&&c.synchronized&&!c.monsterAlive&&!c.monsterFled&&c.monsterHp<=0&&c.rows.length<160);
 T.ok('stocked: healing really consumes items and actions, no free HP',c.heals.length>0&&c.medicineLeft===8-c.heals.length&&c.heals.every(h=>h.gain>0&&h.consumed===1&&h.acted));
 T.ok('stocked: actual kill and corpse credit the original bearer',c.kills.length===1&&c.kills[0].by===c.bearer&&c.corpse?.mid==='moderator'&&c.corpse.by===c.bearer);
 T.ok('stocked: cue capture survives bounded Game.log rollover',c.capturedCount>c.logCount&&c.liftSeen&&c.lines.filter(x=>x.includes('The mute LIFTS')).length>=2);
 T.done();
}
