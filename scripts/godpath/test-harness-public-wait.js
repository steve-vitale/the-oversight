'use strict';
const K=require('./lib'),T=K.reporter('Harness public Wait');
(async()=>{
 const G=await K.load({seed:7002});K.newRun(G);G.state.scholar.kcal=6000;
 const monster=K.fight(G,'gallowdeer',{px:2,py:4,mx:3,my:4}),player=G.tbFighter('p');
 // Declared durable encounter: exercise forfeiting moves after a paid strike.
 monster.hp=monster.maxHp=150;player.hp=player.maxHp=300;player.moveLeft=3;
 const struck=G.tbPlayerStrike(monster.key);
 T.ok('the real strike leaves an actual spent action with movement remaining',struck!==false&&player.acted&&player.moveLeft>0&&!!G.tbfight);
 const wait=G.tbPlayerWait,after=G.tbAfterPlayerAction,note=G.modNoteVerb;
 let waits=0,noted=0,direct=0;const starts=[];
 G.tbPlayerWait=function(){const p=this.tbFighter('p');starts.push({acted:p?.acted,moves:p?.moveLeft});waits++;return wait.apply(this,arguments);};
 G.modNoteVerb=function(verb){if(verb==='wait')noted++;return note.apply(this,arguments);};
 G.tbAfterPlayerAction=function monitor(...args){const stack={};Error.captureStackTrace(stack,monitor);if(/\bdriveFightsImpl\b/.test((stack.stack||'').split('\n')[1]||''))direct++;return after.apply(this,args);};
 K.H.driveFights(G,{id:'prepared-no-policy-handler'},{notes:[]});
 T.ok('the default fight driver invokes the actual public Wait action',waits>0);
 T.ok('Wait receives the genuine spent-action turn before it changes flags',starts[0]?.acted===true&&starts[0]?.moves>0);
 T.ok('public Wait-specific combat effects run for each forfeited turn',noted===waits);
 T.ok('the harness never calls the internal end-action helper directly',direct===0);
 T.ok('the real encounter advances beyond its initial round or ends',!G.tbfight||G.tbfight.over||G.tbfight.round>1);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
