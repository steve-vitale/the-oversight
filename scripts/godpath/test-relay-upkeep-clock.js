#!/usr/bin/env node
'use strict';
const K=require('./lib'),T=K.reporter('relay-upkeep-clock');
(async()=>{
 const saves=new Map();global.localStorage={getItem:k=>saves.get(String(k))??null,setItem:(k,x)=>saves.set(String(k),String(x)),removeItem:k=>saves.delete(String(k)),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:7});let s;
 function fresh(){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;s.day=85;s.kcal=3000;s.health=100;s.grounding=100;G.state.systemArrived=true;G.state.networkLive=true;}
 fresh();G.claimRelay();for(let i=0;i<4;i++)G.commsTick();
 T.ok('four actual communications ticks on one day charge one grounding',s.day===85 && G.grounding()===99);
 T.ok('one calendar day grants one service-day credit',s.relay.holderDays===1 && s.relay.upkeepDayByPerson?.[G.villagerId]===85);
 s.day++;G.commsTick();
 T.ok('a later calendar day charges and progresses again',G.grounding()===98 && s.relay.holderDays===2);
 const prior=G.grounding();G.removeSwitchboard('same-day handover');G.claimRelay();G.commsTick();
 T.ok('same-person same-day release and reclaim cannot multiply upkeep or progress',G.grounding()===prior && s.relay.holderDays===2);
 G.save();const key=G.state.runKey;
 T.ok('the actual load succeeds with a saved upkeep receipt',G.load(key));s=G.state.scholar;G.commsTick();
 T.ok('reloading the same day cannot charge or progress twice',G.grounding()===prior && s.relay.holderDays===2);
 fresh();G.claimRelay();G.commsTick();const old=G.villagerId;G.playerDeath('upkeep fixture');const next=G.villagerId;
 T.ok('actual succession produces another person and an unclaimed role',next!==old && !G.switchboard());
 G.claimRelay();const g=G.grounding();G.commsTick();
 T.ok('a new bearer claiming on the same day owes their own daily upkeep',G.grounding()===g-1 && G.state.scholar.relay.upkeepDayByPerson?.[next]===85);
 fresh();const before=JSON.stringify(G.state);G.relayTick();
 T.ok('no occupied office creates no daily service record',JSON.stringify(G.state)===before);
 const npc=G.switchboardCandidates()[0].id;G.appointSwitchboard(npc);const ng=G.grounding();G.commsTick();
 T.ok('an NPC-held office does not bill the player for personal Relay upkeep',G.grounding()===ng && !G.state.scholar.relay?.upkeepDayByPerson?.[G.villagerId]);
 fresh();s.energy=100;G.claimRelay();G.advancePart();G.advancePart();
 T.ok('the real advancePart caller retains both world parts while billing once',s.energy===90 && s.relay.holderDays===1 && G.grounding()===99);
 fresh();G.claimRelay();const messages=[],say=G.say;G.say=function(text){messages.push(String(text));return say.apply(this,arguments);};
 for(let day=85;day<92;day++){s.day=day;for(let part=0;part<4;part++)G.commsTick();if(day===85)T.ok('Deep Listen is not earned from three parts of one day',!G.relayHas('deep-listen'));}
 G.say=say;
 T.ok('seven calendar service days cost seven grounding and seven credits',G.grounding()===93 && s.relay.holderDays===7);
 T.ok('Deep Listen unlocks through actual daily service',G.relayHas('deep-listen'));
 T.ok('the three-day System request runs twice across seven days',messages.filter(x=>x.includes('THE WIRES HAVE QUESTIONS')).length===2);
 T.ok('the weekly holder beat runs once across seven days',messages.filter(x=>x.includes('You look tired')).length===1);
 fresh();G.claimRelay();s.relay.holderDays=37;G.relayGrant('deep-listen',{silent:true});G.commsTick();
 T.ok('legacy progress and unlocked abilities are preserved without fabricated prior dates',s.relay.holderDays===38 && G.relayHas('deep-listen') && Object.keys(s.relay.upkeepDayByPerson||{}).length===1 && G.grounding()===99);
 fresh();s.day=0;G.claimRelay();G.commsTick();G.commsTick();
 T.ok('calendar day zero is also charged once',G.grounding()===99 && s.relay.holderDays===1);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
