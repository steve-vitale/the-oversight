'use strict';
const path=require('path'),fixture=require('../../evidence/2026-10-18/mobile-combat-pagehide-r2.json');
const ri=process.argv.indexOf('--root'),K=ri<0?require('./lib'):require(path.join(path.resolve(process.argv[ri+1]),'scripts/godpath/lib')),T=K.reporter('deer antler cadence');
(async()=>{
 const storage=new Map(),key=Object.keys(fixture.storage).find(k=>k.startsWith('scattering-save-v1-'));
 global.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
 const G=await K.load({seed:812,narration:true}),original=G.tbAntlerThrash,receipts=[];let calls=[];
 G.tbAntlerThrash=function(m){calls.push({key:m.key,phase:m.beamPhase,alive:m.alive,ignition:!!m.telegraph?.ignition});return original.call(this,m);};
 function prepare(){
  for(const[k,v]of Object.entries(fixture.storage))storage.set(k,v);G.load(key);
  const m=G.tbfight.fighters.find(f=>f.kind==='monster'),p=G.tbFighter('p');
  // Declared phase-boundary fixture on the real recorded fight. Extra HP keeps
  // damage resolution alive long enough to count attacks; no win claim.
  p.hp=p.maxHp=1000;p.mx=5;p.my=1;m.mx=5;m.my=0;
  T.ok('real recorded attack supplies a sweeping beam',!!m.telegraph?.pattern?.sweep);
  calls=[];return{m,p,tg:m.telegraph};
 }
 try{
  let{m,p,tg}=prepare();m.beamPhase='aim';tg.turnsLeft=2;delete tg.firing;
  G.tbMonsterTurn(m);receipts.push({case:'windup',calls:calls.slice()});T.ok('windup retains exactly one close-range antler attack',calls.length===1);
  ({m,p,tg}=prepare());m.beamPhase='aim';tg.turnsLeft=1;delete tg.firing;
  G.tbMonsterTurn(m);receipts.push({case:'ignition',calls:calls.slice(),firing:tg.firing});T.ok('ignition advances the real beam lifecycle',tg.firing>0&&m.beamPhase==='firing');T.ok('ignition never duplicates the pre-turn antler attack',calls.length===1,JSON.stringify(calls));
  calls=[];G.tbMonsterTurn(m);receipts.push({case:'live fire',calls:calls.slice()});T.ok('normal live firing still attacks with antlers exactly once',calls.length===1);
  ({m,p,tg}=prepare());tg.firing=2;m.beamPhase='firing';const hp=p.hp;G.tbBeamSweepTick(m,tg,true);T.ok('tracking-only player ticks deal neither antler nor beam damage',calls.length===0&&p.hp===hp);
  for(const roll of [0.01,0.2,0.49]){
   ({m,p,tg}=prepare());tg.firing=2;m.beamPhase='firing';m.hasFired=true;m.hp=m.maxHp=1000;
   p.acted=false;p.moveLeft=3;G.tbfight.turnIdx=G.tbfight.order.indexOf('p');
   const random=Math.random,before=m.hp;let accepted;
   // Exercise the actual Strike damage path at rolls that formerly cancelled
   // the beam. Keep movement available so this assertion precedes enemy turns.
   try{Math.random=()=>roll;accepted=G.tbPlayerStrike(m.key);}finally{Math.random=random;}
   receipts.push({case:'ordinary strike',roll,accepted,damage:before-m.hp,firing:m.telegraph?.firing});
   T.ok(`ordinary Strike lands damage at roll ${roll}`,accepted!==false&&m.hp<before&&m.alive);
   T.ok(`ordinary Strike preserves the live beam at roll ${roll}`,m.telegraph===tg&&tg.firing===2);
  }
  ({m,p,tg}=prepare());m.hasFired=false;m.hp=1;const damage=G.tbDamage(m.key,10000,'declared test strike','p');const lines=G.log.slice(-12).map(x=>x.text||String(x));receipts.push({case:'death throes',calls:calls.slice(),damage,alive:m.alive,hp:m.hp,sweep:m.mdef.attack.pattern.sweep,lines});
  T.ok('lethal pre-fire damage retains the existing gathered-light deferral',damage===0&&m.alive&&m.hp===1&&lines.some(x=>/body won't fall until it fires/.test(x)));
  m.hasFired=true;calls=[];G.tbDamage(m.key,10000,'declared post-fire strike','p');T.ok('spent-light deer can still die without another antler attack',!m.alive&&calls.length===0);
 }finally{G.tbAntlerThrash=original;}
 console.log(JSON.stringify({receipts}));T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
