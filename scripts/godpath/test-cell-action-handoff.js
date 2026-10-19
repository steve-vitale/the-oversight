'use strict';
const fs=require('fs'),path=require('path'),K=require('./lib'),T=K.reporter('cell-action-handoff');
(async()=>{
 const G=await K.load({seed:7});K.newRun(G);
 const source=fs.readFileSync(path.join(K.ROOT,'src/js/app.js'),'utf8').replace(/\r\n/g,'\n');
 const body=source.match(/  function runCellAction\([^\n]*\) \{[\s\S]*?\n  \}\n/);
 if(!body)throw Error('Missing actual cell-action handoff');
 const paints=[],partials=[];
 const run=new Function('Game','refresh','refreshTilePanel',body[0]+';return runCellAction;')(
  G,()=>paints.push({fight:G.tbfight,allies:(G.tbfight?.fighters||[]).filter(f=>f.kind==='ally').length}),()=>partials.push(true));
 run(()=>G.examineCell(G.state.scholar.mx,G.state.scholar.my));
 T.ok('real in-place examine keeps the contextual panel', partials.length===1&&paints.length===0);
 const links=G.hierarchyState();links.length=0;
 for(const v of G.state.otherVillages){
  G.genVillageRoster(v);v.opinion=30;
  links.push({primary:'haven',subordinate:v.id,status:'active',trust:90,arrears:0,theirSpeaker:{id:v.roster.find(r=>r.age>=18).id,name:'Speaker'}});
 }
 G.state.titans={omens:{herald:{stage:2}},musters:{},slain:{},cast:null};
 const muster=G.soundTitanCall('herald');
 T.ok('prepared real recruitment supplies the unchanged entry floor', G.titanMusterReady('herald')&&muster.allies.length>=10);
 run(()=>G.startCombat('herald'));
 T.ok('native encounter entry paints after all real coalition wrappers finish', paints.length===1&&paints[0].fight===G.tbfight&&paints[0].allies===muster.allies.length);
 T.ok('opening paint needs no move or action to reveal the army', G.tbfight.round===1&&G.tbFighter('p').moveLeft===G.tbFighter('p').speed&&!G.tbFighter('p').acted);
 // Explicit terminal fixture: verify the UI boundary, not fight win probability.
 run(()=>G.tbEnd('fled'));
 T.ok('resolved encounter also replaces the old battle immediately', paints.length===2&&paints[1].fight==null);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
