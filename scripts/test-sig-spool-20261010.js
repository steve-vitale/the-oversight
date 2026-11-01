#!/usr/bin/env node
'use strict';
// Real public actions, one seeded runtime per child scene. Prepared open ground
// and a pre-fight wound are explicit fixtures, not naturally acquired campaigns.
const K=require('./godpath/lib'),a=require('assert/strict'),cp=require('child_process');
async function encounter(mode,seed){
 const G=await K.load({seed,narration:true}),s=K.newRun(G),bearer=G.villagerId,checks=[],audio=[];
 const check=(name,condition,details)=>checks.push({name,condition:!!condition,details});
 const registered=typeof globalThis.MonsterBehaviorHooks?.spoolWatch==='function'&&typeof G.tbSpoolExamineReel==='function';
 check('signature hook and public reel action registered',registered);if(!registered)return{mode,seed,checks};
 s.equipped={};s.inventory=[];
 if(mode==='heal'){
  // Wounded BEFORE combat; never damage/heal a fighter to manufacture a verb.
  s.health=40;const def=K.readJSON('src/data/items.json').find(x=>x.id==='field_sutures');a(def);
  s.inventory.push({itemId:def.id,name:def.name,kg:def.kg,units:1});
 }
 const grid=G.genDetail(G.map.px,G.map.py);for(const row of grid)row.fill('dirt');
 const audioEvent=G.audioEvent;G.audioEvent=function(name,...args){audio.push(name);return audioEvent.call(this,name,...args);};
 const logStart=G.log.length,m=K.fight(G,'spool',{px:3,py:4,mx:4,my:4}),f=G.tbfight,p=G.tbFighter('p');a(m&&f&&p);
 const startingHp=p.hp,monsterHp=m.hp,damage=G.tbDamage,incoming=[],strikes=[];
 let ownStrike=false;const playerStrike=G.tbPlayerStrike;G.tbPlayerStrike=function(...args){const prior=ownStrike;ownStrike=this.tbFighter('p')===p&&this.villagerId===bearer;try{return playerStrike.apply(this,args);}finally{ownStrike=prior;}};
 G.tbDamage=function(key,amount,label,source,...args){const target=key==='p'?p:key===m.key?m:null,before=target?.hp,result=damage.call(this,key,amount,label,source,...args);if(target&&before>target.hp)(key==='p'?incoming:strikes).push({requested:amount,debit:before-target.hp,source,label,publicPlayerStrike:ownStrike});return result;};
 function active(){return G.tbfight===f&&!f.over&&!G.over&&p.alive&&G.villagerId===bearer;}
 function wait(){a(active()&&G.tbIsPlayerTurn(),'Original living bearer must still own the public turn');a.equal(G.tbPlayerWait(),true);}
 function finishPublicTurn(){if(active()&&G.tbIsPlayerTurn())wait();}
 const recordHp=[];let healing;
 for(let turn=0;turn<3;turn++){
  a(active()&&G.tbIsPlayerTurn());
  if(mode==='strike')G.tbPlayerStrike(m.key);
  if(mode==='heal'&&turn===1){const before=p.hp,idx=s.inventory.findIndex(x=>x.itemId==='field_sutures');a(idx>=0);G.useItem(idx);healing={before,after:p.hp,paidAction:p.acted,consumed:!s.inventory.some(x=>x.itemId==='field_sutures')};}
  finishPublicTurn();recordHp.push(p.hp);
 }
 const reel=JSON.parse(JSON.stringify(m.spRec||[])),recordLines=G.log.slice(logStart).map(String);
 check('exactly three actual player turns recorded and replay loaded',reel.length===3&&m.spPhase==='replay',reel);
 check('record phase is harmless to the actual bearer',incoming.length===0&&recordHp.every(h=>h>=startingHp),recordHp);
 check('three record cues and one replay-start audio event',audio.filter(x=>x==='spoolRecord').length===3&&audio.filter(x=>x==='spoolReplayStart').length===1,audio);
 check('REC3/3 and honest loaded-reel preview narrated',recordLines.some(x=>/REC ● \(3\/3\)/.test(x))&&recordLines.some(x=>x.includes('LOADED:')));
 let ending=null;
 if(mode==='strike'){
  check('each real Strike supplies its own recorded damage',reel.length===3&&strikes.length===3&&reel.every((e,i)=>e.kind==='strike'&&e.dmg>0&&e.dmg===strikes[i].debit&&strikes[i].publicPlayerStrike),{reel,strikes});
  const n=G.log.length,cycle=m.spCycle;
  check('public Examine consumes the action',G.tbSpoolExamineReel()===true&&p.acted);
  const detail=G.log.slice(n).map(String).join(' ');
  check('reel examination lists every exact recorded damage and next frame',reel.every((e,i)=>detail.includes((i+1)+'. STRIKE → hits you for ~'+e.dmg))&&detail.includes('Next up: 1/3'),detail);
  const nIncoming=incoming.length;finishPublicTurn();let replayWaits=0;while(active()&&m.spCycle<cycle+3&&replayWaits++<6)wait();
  const hits=incoming.slice(nIncoming);
  check('one actual replay cycle damages the original body with matching swings',hits.length===3&&hits.every((h,i)=>h.source===m.key&&h.debit>0&&h.debit>=Math.round(reel[i].dmg*0.9)&&h.debit<=Math.round(reel[i].dmg*1.1)),hits);
  check('strike replay is narrated and emits replay audio',G.log.slice(n).map(String).filter(x=>/REPLAY \d\/3: STRIKE/.test(x)).length===3&&audio.filter(x=>x==='spoolReplay').length===3);
 }else if(mode==='heal'){
  check('real medicine heals and pays/consumes its action and item',healing?.after>healing?.before&&healing.paidAction&&healing.consumed,healing);
  check('record is exactly Wait, real item Heal, Wait',JSON.stringify(reel.map(e=>e.kind))===JSON.stringify(['wait','heal','wait'])&&reel[1].amt===healing.after-healing.before,{reel,healing});
  const changes=[],n=G.log.length;for(let frame=0;frame<3&&active();frame++){const before=p.hp;wait();changes.push(p.hp-before);}
  check('only recorded heal frame restores actual HP, respecting real capacity',changes.length===3&&changes[0]===0&&changes[1]===Math.min(reel[1].amt,p.maxHp-healing.after)&&changes[1]>0&&changes[2]===0,changes);
  check('replay honestly identifies the healing frame',G.log.slice(n).map(String).some(x=>/REPLAY 2\/3: HEAL/.test(x)));
 }else{
  check('boring tape is exactly three real Wait actions',reel.length===3&&reel.every(e=>e.kind==='wait'),reel);
  const before=p.hp,n=G.log.length,cycle=m.spCycle;for(let i=0;i<6&&active();i++)wait();
  check('two complete replay cycles do no damage',m.spCycle===cycle+6&&p.hp===before&&incoming.length===0,{cycle:m.spCycle,hp:p.hp});
  check('every harmless replay frame narrates patience',G.log.slice(n).map(String).filter(x=>x.includes('Your own patience, played back at you')).length===6);
  let swings=0;while(active()&&swings<200){a(G.tbIsPlayerTurn());G.tbPlayerStrike(m.key);swings++;finishPublicTurn();}
  ending={swings,result:f.result,over:f.over,monsterHp:m.hp,monsterStart:monsterHp,playerHp:p.hp,corpse:m._deathCorpse&&{monsterId:m._deathCorpse.monsterId,killerId:m._deathCorpse.killerId},strikeDamage:strikes.reduce((n,h)=>n+h.debit,0)};
  check('ordinary public Strikes finish the actual full-health monster',f.over&&f.result==='won'&&!m.alive&&!m.fled&&m.hp<=0&&swings>1&&swings<200&&ending.strikeDamage>=monsterHp&&monsterHp===m.maxHp&&strikes.every(h=>h.publicPlayerStrike),ending);
  check('actual corpse credits this bearer, not a successor or companion',m._deathCorpse?.monsterId==='spool'&&m._deathCorpse?.killerId===bearer,ending.corpse);
 }
 check('original normal-capacity bearer and fighter HP remain synchronized',G.villagerId===bearer&&G.state.scholar===s&&p.alive&&p.hp>0&&p.maxHp===100&&s.health===p.hp,{hp:p.hp,health:s.health,max:p.maxHp});
 check('scene has only this human fighter',f.fighters.filter(x=>x.kind!=='monster').length===1);
 return{mode,seed,checks,reel,incoming,healing,ending,audio};
}
if(process.argv[2]==='--child')encounter(process.argv[3],+process.argv[4]).then(r=>console.log('SPOOL_RESULT '+JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const T=K.reporter('Spool public recording and replay'),seeds=process.env.SEED?[Number(process.env.SEED)]:[1,2,3];
 for(const seed of seeds)for(const mode of ['strike','heal','wait']){
  const child=cp.spawnSync(process.execPath,[__filename,'--child',mode,String(seed)],{cwd:K.ROOT,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});a.equal(child.status,0,child.stderr+'\n'+child.stdout);
  const lines=child.stdout.split('\n').filter(x=>x.startsWith('SPOOL_RESULT '));a.equal(lines.length,1);const r=JSON.parse(lines[0].slice(13));console.log(JSON.stringify(r));for(const c of r.checks)T.ok(seed+' '+mode+': '+c.name,c.condition,JSON.stringify(c.details));
 }
 T.done();
}
