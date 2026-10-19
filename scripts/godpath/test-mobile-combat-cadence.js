'use strict';
// Real turn driver with a controlled browser task queue. This complements,
// rather than replaces, full touch-browser playthroughs.
const K=require('./lib'),T=K.reporter('mobile combat cadence');
(async()=>{
 const saves=new Map();global.localStorage={getItem:k=>saves.get(String(k))??null,setItem:(k,v)=>saves.set(String(k),String(v)),removeItem:k=>saves.delete(String(k)),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:181026,narration:true});K.newRun(G);G.startCombat('gallowdeer');
 const f=G.tbfight,p=G.tbFighter('p');
 f.turnIdx=f.order.indexOf('p');p.moveLeft=0;p.acted=false;
 const oldTimer=global.setTimeout,oldWindow=global.window,oldEvent=global.CustomEvent;
 const tasks=[],events=[],actedKeys=[];let acts=0;
 const original=G.tbMonsterTurn;
 // Only count the real method; never substitute an enemy outcome.
 G.tbMonsterTurn=function(...args){acts++;actedKeys.push(args[0].key);return original.apply(this,args);};
 global.setTimeout=(fn,ms)=>{tasks.push({fn,ms});return tasks.length;};
 global.CustomEvent=class{constructor(type,init){this.type=type;this.detail=init.detail;}};
 global.window={dispatchEvent:e=>events.push({phase:e.detail.phase,acts})};
 try{
  T.ok('Wait accepts zero movement with unused action',G.tbPlayerWait()===true);
  T.ok('enemy is announced before its action runs',events.some(e=>e.phase==='monster')&&acts===0);
  T.ok('announcement leaves a real browser task before resolution',tasks.length===1&&tasks[0].ms>=100);
  for(let n=0;tasks.length&&n<30;n++)tasks.shift().fn();
  T.ok('exactly one enemy action resolves before hand-back',acts===1);
  T.ok('resolved board gets its own presentation event',events.some(e=>e.phase==='resolved'&&e.acts===1));
  T.ok('player returns with usable action and fresh movement',G.tbfight===f&&!f.asyncRunning&&!p.acted&&p.moveLeft>0);
  const resolved=events.findIndex(e=>e.phase==='resolved'),arrived=events.findIndex(e=>e.phase==='player');
  T.ok('hand-back follows resolution',resolved>=0&&arrived>resolved);
  const oldActs=acts;G.tbPlayerWait();
  f.asyncGen++;
  for(let n=0;tasks.length&&n<30;n++)tasks.shift().fn();
  T.ok('superseded announcement cannot perform a stale enemy action',acts===oldActs);
  const savedRound=f.round,saveKey=G.state.runKey;G.save();const didLoad=G.load(saveKey);
  const loaded=G.tbfight;
  T.ok('save retains the announced but unresolved actor',didLoad&&loaded!==f&&!!loaded.pendingTurnKey);
  G.tbAdvanceAsync();for(let n=0;tasks.length&&n<30;n++)tasks.shift().fn();
  T.ok('Continue resolves the pending enemy exactly once',acts===oldActs+1);
  T.ok('Continue does not wrap the announced round a second time',loaded.round===savedRound);
  T.ok('Continue hands control back with fresh player inputs',G.tbIsPlayerTurn()&&!loaded.asyncRunning&&!G.tbFighter('p').acted);
  G.tbPlayerWait();
  // An enemy can die while its announcement is on screen (a deferred effect
  // or a departing ally). Exercise the real terminal check at this boundary.
  for(const enemy of loaded.fighters.filter(x=>x.kind==='monster')){enemy.hp=0;enemy.alive=false;}
  for(let n=0;tasks.length&&n<30;n++)tasks.shift().fn();
  T.ok('enemy-phase endings publish the terminal state to the browser',!G.tbfight&&events.some(e=>e.phase==='ended'));
  K.newRun(G);acts=0;tasks.length=0;events.length=0;actedKeys.length=0;
  G.startCombat('hummice');
  T.ok('faster opening enemy is announced before acting',G.tbCurrent()?.kind==='monster'&&acts===0&&events.some(e=>e.phase==='monster'));
  for(let n=0;tasks.length&&n<40;n++)tasks.shift().fn();
  const expected=G.tbfight.order.slice(0,G.tbfight.order.indexOf('p')).filter(k=>G.tbFighter(k).kind==='monster');
  T.ok('each faster opening enemy acts once before usable player controls',JSON.stringify(actedKeys)===JSON.stringify(expected)&&expected.length===4&&G.tbIsPlayerTurn()&&!G.tbfight.asyncRunning&&!G.tbFighter('p').acted);
 }finally{global.setTimeout=oldTimer;if(oldWindow===undefined)delete global.window;else global.window=oldWindow;if(oldEvent===undefined)delete global.CustomEvent;else global.CustomEvent=oldEvent;G.tbMonsterTurn=original;}
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
