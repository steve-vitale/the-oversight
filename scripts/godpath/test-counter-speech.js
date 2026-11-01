'use strict';
// Prepared teaching/dispatch boundaries; not a mobile or literary-quality proof.
const assert=require('assert/strict'),K=require('./lib'),T=K.reporter('counter speech');
(async()=>{
 const G=await K.load({seed:10724,narration:true});K.newRun(G);
 const vid=G.state.village.roster.find(id=>id!==G.villagerId);
 const lines=[],say=G.say;G.say=function(text){lines.push(String(text));return say.apply(this,arguments);};
 try{
  const counters=G.data.monsters.filter(m=>m.counter);
  for(const m of counters){
   G.state.monsterCounters={};G.state.villageSlain={[m.id]:1};G.state.villageCounterObs={};lines.length=0;
   const r=G.askAbout(vid,'beasttricks');
   assert.equal(r.taught,m.id);assert(G.state.monsterCounters[m.id]);
   const lesson=lines.find(s=>s.includes('leans in, voice low.'));
   assert(lesson);const spoken=G.voiceCleanText(lesson,true);
   assert(spoken.includes(m.counter.reveal),m.id+' complete explanation reaches speech');
   assert(!spoken.includes(m.counter.trick+'. '+m.counter.reveal),m.id+' no duplicate heading');
   assert(!spoken.includes('leans in, voice low'),m.id+' stage direction excluded');
   if (G.monsterNoun(m.id) === 'something') assert(!spoken.includes(m.unknown),m.id+' whole scene is not inserted as a name');
   assert(!/stat check|tutorial|tbRrLeaveMessage|the telegraph/i.test(spoken),m.id+' authoring leak');
  }
  T.ok('Every authored counter teaches through askAbout with complete speech and earned knowledge ('+counters.length+' species)',true);
  G.state.monsterCounters={};G.state.villageSlain={memory_projector:1};
  G.ensureMonsterEntry('memory_projector').villageName='Lantern Betty';lines.length=0;
  G.askAbout(vid,'beasttricks');assert(lines.find(s=>s.includes('leans in, voice low.')).includes('about Lantern Betty.'));
  T.ok('An earned village name remains intact in the spoken lesson',true);
  lines.length=0;G.state.monsterCounters=Object.fromEntries(counters.map(m=>[m.id,true]));
  const none=G.askAbout(vid,'beasttricks');assert(none.none);assert(!lines.some(s=>s.includes('leans in, voice low.')));
  T.ok('Exhausted knowledge offers no fabricated lesson',true);
  for(const mid of ['terms_of_service','reunion','algorithm','eater','rerun','spoiler']){
   const m=K.fight(G,mid),a=m.mdef.attacks[0];m.moveAtk=a;m.telegraph={attackName:a.name,pattern:a.pattern,turnsLeft:2};
   const cue=G.tbTelegraphCue(m);assert(cue.includes(a.telegraph),mid+' real cue consumes revised warning');
   assert(!/DPS|tutorial|telegraph IS|honesty is|health bar|the game tracks|tbRrLeaveMessage/.test(cue));
  }
  T.ok('Six actual fight cue paths use observable warnings',true);
  const m=K.fight(G,'rerun');m.rrN=4;lines.length=0;G.tbMonsterTurn(m);
  assert.equal(G.tbfight.rrTakes,1);assert(lines.some(s=>s.includes('Rigging, Left or Big hit')));
  assert(!lines.some(s=>s.includes('tbRrLeaveMessage')));
  T.ok('Real fifth-round rewind retains mechanics and names available controls',true);
 }finally{G.say=say;}
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
