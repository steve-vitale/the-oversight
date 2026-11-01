'use strict';
// Replaces the old spin-the-directions test with the executable outing contract.
// A ridge/creek/burn is not a real meeting place merely because prose names it.
const K=require('./godpath/lib'),T=K.reporter('Grounded forage favor directions');
(async()=>{
 const G=await K.load({seed:20261012});K.newRun(G);const s=G.state.scholar,v=G.state.village,vid=v.roster.find(id=>id!==G.villagerId);
 s.day=4;const lines=[];
 for(let n=0;n<20;n++){const f=G.convoBuildFavor(vid,{kind:'forage_help',kcal:0});lines.push(f.commitLine);T.ok('authored instance '+n+' names the actual Haven/dawn contract',/Haven/.test(f.commitLine)&&/dawn|first light/.test(f.commitLine)&&f.task.includes(String(G.data.favorRules.forage.minimumDeliveryKcal))&&!/ridge|fallen oak|creek bend|old burn/.test(f.commitLine));}
 T.ok('human wording can vary while the actual meeting remains coherent',new Set(lines).size>1);
 v.favorSeq=9000;const a=G.convoBuildFavor(vid,{kind:'forage_help'});v.favorSeq=9000;const b=G.convoBuildFavor(vid,{kind:'forage_help'});
 T.ok('same instance inputs replay the same authored words',a.commitLine===b.commitLine&&a.line===b.line&&!a.commitLines);
 const h={x:v.px??4,y:v.py??4},x=h.x+1,y=h.y,t=G.map.tiles[y][x],pid='blackberry';G.map.px=h.x;G.map.py=h.y;s.seenTiles={[h.x+','+h.y]:{k:'v'}};
 t.type='forest_floor';t.stock=100;t.detail=Array.from({length:9},()=>Array(9).fill('dirt'));t.detail[4][4]='bush';t.bushSpecies={'4,4':pid};t.detailRegrow={};G.state.codex.plants[pid]={level:1,identifiedDay:1};
 T.ok('unvisited but materialized ground is not offered as player knowledge',G.forageFavorTarget()===null);
 G.markSeen(x,y,'visited');const before=JSON.stringify({state:G.state,map:G.map}),target=G.forageFavorTarget();
 T.ok('visiting a recognized physical patch creates a real destination',target?.x===x&&target?.y===y);
 T.ok('destination query does not generate or mutate world data',JSON.stringify({state:G.state,map:G.map})===before);
 t.detailRegrow['4,4']={day:6,was:'bush'};T.ok('worked-out terrain is not sold as a fresh known destination',G.forageFavorTarget()===null);
 T.done();
})().catch(error=>{console.error(error.stack);process.exitCode=1});
