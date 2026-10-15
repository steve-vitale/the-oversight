#!/usr/bin/env node
'use strict';
const K=require('./lib'),T=K.reporter('relay-office-lifetime');
(async()=>{
  const saves=new Map();global.localStorage={getItem:k=>saves.get(String(k))??null,setItem:(k,x)=>saves.set(String(k),String(x)),removeItem:k=>saves.delete(String(k)),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
  const G=await K.load({seed:7});let s,v,me;
  function fresh(){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;v=G.state.village;me=G.villagerId;s.day=85;s.health=100;s.kcal=3000;G.state.systemArrived=true;G.state.networkLive=true;}
  fresh();G.claimRelay();const old=me;
  G.playerDeath('relay test');
  T.ok('actual bearer death passes the mantle but vacates the old persons post',G.villagerId!==old && !G.state.switchboard);
  T.ok('the ordinary appointment beat returns after death',G.state.pendingSwitchboard && G.switchboardAvailable());
  T.ok('a successor can explicitly claim the reopened role',G.claimRelay()==='claimed' && G.switchboard()?.holderId===G.villagerId);
  fresh();let npc=G.switchboardCandidates()[0].id;G.appointSwitchboard(npc);
  const corpse=G.registerDeath({kind:'villager',villagerId:npc,name:G.getPerson(npc).name,cause:'test'});
  T.ok('actual NPC death preserves its corpse return and reopens the office',corpse?.villagerId===npc && !G.switchboard() && G.switchboardAvailable());
  G.claimRelay();const replacement=G.switchboard();
  T.ok('duplicate registration returns its original no-op without evicting the replacement',G.registerDeath({kind:'villager',villagerId:npc,cause:'test'})===null && G.switchboard()===replacement);
  fresh();G.claimRelay();npc=G.state.village.roster.find(id=>id!==me);
  G.registerDeath({kind:'villager',villagerId:npc,name:G.getPerson(npc).name,cause:'test'});
  T.ok('another persons death does not remove the living holder',G.switchboard()?.holderId===me);
  fresh();G.claimRelay();G.hurtVillager(me,5,'test');
  T.ok('nonfatal wounds do not relinquish the office',G.switchboard()?.holderId===me && G.state.scholar.health>0);
  fresh();s.abilities=[{id:'second_wind',level:1}];G.claimRelay();G.hurtVillager(me,999,'combat');
  T.ok('an actual Second Wind refusal keeps the living holder in post',G.villagerId===me && G.state.scholar.health>0 && G.switchboard()?.holderId===me && !v.deathSeen?.[me]);
  fresh();G.claimRelay();const valid=JSON.stringify(G.switchboard());G.save();
  T.ok('valid actual save/load retains the holder and post',G.load(G.state.runKey) && JSON.stringify(G.switchboard())===valid);
  fresh();G.claimRelay();const stale=JSON.parse(JSON.stringify(G.switchboard()));G.playerDeath('legacy fixture');
  // Reinsert only the old dangling role to model an authentic pre-fix save.
  G.state.switchboard=stale;G.state.pendingSwitchboard=null;G.save();
  T.ok('successful actual load repairs a saved dead predecessor post',G.load(G.state.runKey) && !G.switchboard() && G.state.pendingSwitchboard && G.switchboardAvailable());
  G.state.switchboard=stale;G.state.pendingSwitchboard=null;
  const before=JSON.stringify(G.state);G.switchboard();G.switchboardAvailable();
  T.ok('read-only office queries do not repair or mutate a legacy save',JSON.stringify(G.state)===before);
  G.commsTick();
  T.ok('actual communications tick also repairs an old in-memory dead post',!G.switchboard() && G.state.pendingSwitchboard);
  fresh();G.claimRelay();const zero=me;G.state.village.deathSeen={ [zero]:0 };G.commsTick();
  T.ok('day-zero death records are not mistaken for a living holder',!G.switchboard());
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
