'use strict';
// Real turn driver with a controlled browser task queue. This complements,
// rather than replaces, full touch-browser playthroughs.
const path=require('path'),ri=process.argv.indexOf('--root'),K=ri<0?require('./lib'):require(path.join(path.resolve(process.argv[ri+1]),'scripts/godpath/lib')),T=K.reporter('mobile combat cadence');
(async()=>{
 const saves=new Map();global.localStorage={getItem:k=>saves.get(String(k))??null,setItem:(k,v)=>saves.set(String(k),String(v)),removeItem:k=>saves.delete(String(k)),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:181026,narration:true});K.newRun(G);K.fight(G,'gallowdeer');
 const f=G.tbfight,p=G.tbFighter('p');
 f.turnIdx=f.order.indexOf('p');p.moveLeft=0;p.acted=false;
 const oldTimer=global.setTimeout,oldWindow=global.window,oldEvent=global.CustomEvent;
 const tasks=[],events=[],actedKeys=[];let acts=0,elapsed=0;
 const drain=limit=>{for(let n=0;tasks.length&&n<limit;n++){const task=tasks.shift();elapsed+=task.ms;task.fn();}};
 const original=G.tbMonsterTurn;
 // Only count the real method; never substitute an enemy outcome.
 G.tbMonsterTurn=function(...args){acts++;actedKeys.push(args[0].key);return original.apply(this,args);};
 global.setTimeout=(fn,ms)=>{tasks.push({fn,ms});return tasks.length;};
 global.CustomEvent=class{constructor(type,init){this.type=type;this.detail=init.detail;}};
 global.window={dispatchEvent:e=>events.push({phase:e.detail.phase,acts,elapsed})};
 try{
  T.ok('Wait accepts zero movement with unused action',G.tbPlayerWait()===true);
  T.ok('enemy is announced before its action runs',events.some(e=>e.phase==='monster')&&acts===0,JSON.stringify({order:f.order,events,tasks:tasks.map(t=>t.ms)}));
  T.ok('announcement leaves a real browser task before resolution',tasks.length===1&&tasks[0].ms>=100);
  drain(30);
  T.ok('exactly one enemy action resolves before hand-back',acts===1);
  T.ok('resolved board gets its own presentation event',events.some(e=>e.phase==='resolved'&&e.acts===1));
  T.ok('player returns with usable action and fresh movement',G.tbfight===f&&!f.asyncRunning&&!p.acted&&p.moveLeft>0);
  const resolved=events.findIndex(e=>e.phase==='resolved'),arrived=events.findIndex(e=>e.phase==='player');
  T.ok('hand-back follows resolution',resolved>=0&&arrived>resolved);
  T.ok('actor announcement stays visible for at least 400ms before its action',events[resolved].elapsed-events.find(e=>e.phase==='monster').elapsed>=400);
  T.ok('resolved result stays visible for at least 650ms before hand-back',events[arrived].elapsed-events[resolved].elapsed>=650);
  const oldActs=acts;G.tbPlayerWait();
  f.asyncGen++;
  for(let n=0;tasks.length&&n<30;n++)tasks.shift().fn();
  T.ok('superseded announcement cannot perform a stale enemy action',acts===oldActs);
  const savedRound=f.round,saveKey=G.state.runKey;G.save();const didLoad=G.load(saveKey);
  const loaded=G.tbfight;
  T.ok('save retains the announced but unresolved actor',didLoad&&loaded!==f&&!!loaded.pendingTurnKey);
  G.tbAdvanceAsync();for(let n=0;tasks.length&&n<30;n++)tasks.shift().fn();
  T.ok('Continue resolves the pending enemy exactly once',acts===oldActs+1);
  T.ok('Continue does not wrap the announced round a second time',loaded.round===savedRound,JSON.stringify({savedRound,loadedRound:loaded.round,order:loaded.order,events}));
  T.ok('Continue hands control back with fresh player inputs',G.tbIsPlayerTurn()&&!loaded.asyncRunning&&!G.tbFighter('p').acted);
  G.tbPlayerWait();
  // An enemy can die while its announcement is on screen (a deferred effect
  // or a departing ally). Exercise the real terminal check at this boundary.
  for(const enemy of loaded.fighters.filter(x=>x.kind==='monster')){enemy.hp=0;enemy.alive=false;}
  for(let n=0;tasks.length&&n<30;n++)tasks.shift().fn();
  T.ok('enemy-phase endings publish the terminal state to the browser',!G.tbfight&&events.some(e=>e.phase==='ended'));
  K.newRun(G);acts=0;tasks.length=0;events.length=0;actedKeys.length=0;
  K.fight(G,'hummice');
  T.ok('faster opening enemy is announced before acting',G.tbCurrent()?.kind==='monster'&&acts===0&&events.some(e=>e.phase==='monster'));
  for(let n=0;tasks.length&&n<40;n++)tasks.shift().fn();
  const expected=G.tbfight.order.slice(0,G.tbfight.order.indexOf('p')).filter(k=>G.tbFighter(k).kind==='monster');
  T.ok('each faster opening enemy acts once before usable player controls',JSON.stringify(actedKeys)===JSON.stringify(expected)&&expected.length===4&&G.tbIsPlayerTurn()&&!G.tbfight.asyncRunning&&!G.tbFighter('p').acted);
  // Separate real party contrast. An ally after the player can legitimately
  // precede the monster's next-round turn; compare the actual circular order,
  // not the solo fixture's already-wrapped round assumption.
  K.newRun(G);tasks.length=0;events.length=0;
  for(const id of G.state.village.roster)if(id!==G.villagerId){G.npcSetNode(id,G.map.px,G.map.py);G.npcSetInside(id,G.state.scholar.insideHaven!==false&&G.state.scholar.insideHaven!==null);}
  const browserWindow=global.window;delete global.window;
  try{K.fight(G,'gallowdeer',{party:true});}finally{global.window=browserWindow;}
  const party=G.tbfight,player=G.tbFighter('p');party.turnIdx=party.order.indexOf('p');player.moveLeft=0;player.acted=false;
  const partyActors=[],villagerTurn=G.tbVillagerTurn,monsterTurn=G.tbMonsterTurn;
  G.tbVillagerTurn=function(actor){partyActors.push(actor.key);return villagerTurn.apply(this,arguments);};
  G.tbMonsterTurn=function(actor){partyActors.push(actor.key);return monsterTurn.apply(this,arguments);};
  try{
   T.ok('prepared party contains actual nearby villagers',party.fighters.some(x=>x.kind==='villager'));
   G.tbPlayerWait();const round=party.round,pending=party.order.indexOf(party.pendingTurnKey),playerIndex=party.order.indexOf('p'),due=[];
   for(let n=0,i=pending;n<party.order.length&&party.order[i]!=='p';n++,i=(i+1)%party.order.length)due.push(party.order[i]);
   const nextRound=round+(pending>playerIndex?1:0),key=G.state.runKey;
   G.save();const restored=G.load(key);G.tbAdvanceAsync();drain(100);
   T.ok('interrupted party Continue resolves each due real actor once in order',restored&&due.length>1&&JSON.stringify(partyActors)===JSON.stringify(due),JSON.stringify({due,partyActors}));
   T.ok('party Continue advances only its actual order wrap and restores usable player input',G.tbfight?.round===nextRound&&G.tbIsPlayerTurn()&&!G.tbfight.asyncRunning&&!G.tbFighter('p').acted,JSON.stringify({round,nextRound,actual:G.tbfight?.round}));
  }finally{G.tbVillagerTurn=villagerTurn;G.tbMonsterTurn=monsterTurn;}
 }finally{global.setTimeout=oldTimer;if(oldWindow===undefined)delete global.window;else global.window=oldWindow;if(oldEvent===undefined)delete global.CustomEvent;else global.CustomEvent=oldEvent;G.tbMonsterTurn=original;}
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
