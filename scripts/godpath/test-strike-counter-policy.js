'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib'),T=K.reporter('Visible Strike counter policy'),C=require('../policies/counter-aware'),HC=require('../policies/human-combat');
(async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:52});K.newRun(G);
 const sample=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-23/calendar-merchant99-combat-r1-trace.json.gz')))).starts[0];
 const capture={state:sample.state,fight:sample.runtime.tbfight,bearer:sample.state.scholar.villagerId,map:sample.runtime.map,location:sample.state.run.location,dayPart:sample.runtime.dayPart,people:[]};
 K.restoreCombatCapture(G,capture);const original=JSON.stringify(G.tbfight.fighters),hp=G.tbFighter('p').hp,food=G.playerPackKcal(),f=G.tbfight;
 T.ok('prepared regression preserves all actual natural giant rat fighters and HP',JSON.stringify(G.tbfight.fighters)===original&&f.fighters.filter(m=>m.kind==='monster').length===4&&f.otTier===12);
 const ctx={publicCounterplay:true};let calls=0,loaded=false,stalled=false,lastPlayer=G.tbFighter('p'),lastMonsters=f.fighters.filter(x=>x.kind==='monster');
 while(G.tbfight===f&&!f.over&&calls++<50){
  if(!HC.monsterTurn(G,ctx)){stalled=true;break;}
  if(!loaded&&G.tbfight&&G.tbfight.fighters.some(m=>m.sigStrike?.still)){
   G.save();const key=G.state.runKey,paid=G.tbfight.fighters.find(m=>m.sigStrike?.still).sigStrike.still.remaining;
   loaded=G.load(key);T.ok('prepared natural combat Continue retains the actual unpaid counter cost',loaded&&G.tbfight?.fighters.some(m=>m.sigStrike?.still?.remaining===paid));
   // Continue creates the saved fight object. Keep using the shared public
   // controller against that object, never force the old pointer back live.
   break;
  }
 }
 let continuedCalls=0;while(G.tbfight&&!G.tbfight.over&&continuedCalls++<50){lastPlayer=G.tbFighter('p');lastMonsters=G.tbfight.fighters.filter(x=>x.kind==='monster');if(!HC.monsterTurn(G,ctx)){stalled=true;break;}}
 T.ok('visible paid counterplay ends the four-rat arena promptly through public actions',!stalled&&!G.tbfight&&calls+continuedCalls<35,{calls,continuedCalls});
 T.ok('all four rats require actual payment instead of an automatic separation escape',ctx.monsterCombatCounterAccepted===4&&ctx.monsterCombatCounterWaits===8&&lastMonsters.every(m=>m.fled&&m.sigStrike.met));
 T.ok('counterplay leaves the combat bodies unwounded and grants no game ending',!(ctx.monsterCombatStrikeAttempts>0)&&lastPlayer.hp===hp&&lastMonsters.every(m=>m.hp===m.maxHp)&&!G.won);
 T.ok('actual paid nonviolent arena resolution earns a contest win, like NPC drive-offs',K.teleEvents(G,'contest_end').at(-1)?.outcome==='won');
 T.ok('original parent profiles remain unchanged and four explicit experiments exist',C.profiles().map(x=>x.id).join(',')==='counter-aware-capable,counter-aware-maker,counter-aware-merchant,counter-aware-caregiver');
 T.ok('counter errors remain observable',!ctx.counterAwareErrors?.length);
 console.log(JSON.stringify({scope:'Prepared natural day200 four-rat checkpoint; original whole-campaign RNG continuation is not claimed',calls:calls+continuedCalls,readWaits:ctx.monsterCombatCounterReadWaits||0,accepted:ctx.monsterCombatCounterAccepted||0,paidWaits:ctx.monsterCombatCounterWaits||0,strikes:ctx.monsterCombatStrikeAttempts||0,continued:loaded,hpBefore:hp,hpAfter:G.state.scholar.health}));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
