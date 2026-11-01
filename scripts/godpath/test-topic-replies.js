'use strict';
const assert=require('assert/strict'),cp=require('child_process'),K=require('./lib');
async function sample(observe){
 const G=await K.load({seed:88107,narration:true});K.newRun(G);
 const vid=G.state.village.roster.find(id=>id!==G.villagerId),replies={};
 G.state.villageSlain={memory_projector:1};G.state.monsterCounters={};G.state.villageCounterObs={};
 const results={};
 for(const topic of ['goal','gossip','village','tellbeast','namebeast','usename','beasttricks']){
  const lines=[];results[topic]=G.askAbout(vid,topic,observe?{onReply:text=>lines.push(text)}:undefined);replies[topic]=lines;
 }
 return{state:JSON.parse(JSON.stringify(G.state)),log:JSON.parse(JSON.stringify(G.log)),results,replies};
}
if(process.argv[2]==='--sample')sample(process.argv[3]==='observe').then(x=>process.stdout.write(JSON.stringify(x))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const T=K.reporter('authored topic replies'),run=mode=>{
  const r=cp.spawnSync(process.execPath,[__filename,'--sample',mode],{encoding:'utf8',maxBuffer:16*1024*1024});
  assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
 };
 const off=run('off'),on=run('observe');
 assert.deepEqual(on.state,off.state);assert.deepEqual(on.log,off.log);assert.deepEqual(on.results,off.results);
 T.ok('Reply observation leaves actual seeded seven-topic state, logs and return values unchanged',true);
 for(const [topic,lines] of Object.entries(on.replies))assert(lines.length&&lines.every(x=>typeof x==='string'&&x.length),topic+' explicit answer');
 T.ok('All seven standalone topics expose their authored answer, including unavailable-topic explanations',true);
 const lesson=on.replies.beasttricks;assert.equal(lesson.length,1);assert(lesson[0].includes('leans in, voice low.'));
 assert(lesson[0].includes('Stun it or shout'));assert(!lesson.some(x=>/Journal:|COUNTER LEARNED/.test(x)));
 assert(on.state.monsterCounters.memory_projector);
 T.ok('Later discovery/journal notices do not replace the actual learned explanation',true);
 T.done();
}
