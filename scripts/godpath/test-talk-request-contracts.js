'use strict';
const assert=require('assert/strict'),K=require('./lib'),{prepareScenario,scenarios}=require('../../evidence/2026-10-29/conversation-context-r1/corpus.cjs');
const disk=new Map();let armed=false,writes=0,key;
globalThis.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,removeItem:k=>disk.delete(k),setItem(k,v){disk.set(k,String(v));if(armed&&k===key)writes++;}};
const json=x=>JSON.parse(JSON.stringify(x));
(async()=>{
 const G=await K.load({seed:87391,narration:true});let cases=0;
 const begin=kind=>{armed=false;const scene=prepareScenario(G,kind);key=G.state.runKey;assert.equal(scene.c.thread,'request');assert(G.activeTalkRequest(scene.vid));assert.equal(scene.c.genericQ,null);assert(Object.keys(scene.c.offeredReplies).every(id=>id.startsWith('request:')||['silence','leave'].includes(id)));assert.equal(G.save(),true);writes=0;armed=true;return scene;};
 const choose=(scene,choice)=>{const before=disk.get(key),result=G.convoTurn(scene.vid,choice);assert(result?.requestDecision,'actual request reply accepted');assert.equal(result.requestSave,true,'complete initialized reply is durable');assert.equal(writes,1,'one final canonical save');assert.notEqual(disk.get(key),before);const saved=JSON.parse(disk.get(key));assert.deepEqual(saved.scholar,json(G.state.scholar));assert.deepEqual(saved.codex,json(G.state.codex));assert.deepEqual(saved.village,json(G.state.village));writes=0;return result;};
 const invalid=(scene,id)=>{const before=json(G.state),raw=disk.get(key),result=G.convoTurn(scene.vid,id);assert(!result?.requestDecision);assert.equal(writes,0);assert.equal(disk.get(key),raw);assert.deepEqual(json(G.state),before,'invalid request must not mutate or advance conversation');};
 for(const kind of scenarios){
  const defKind=kind==='legacy-rumor'?'rumor':kind,def=G.data.characterGen.convo.requestContracts[defKind];
  for(const reply of def.start){
   const scene=begin(kind),old=Object.keys(scene.c.offeredReplies).find(id=>id.endsWith(':start:'+reply.id));assert(old);
   invalid(scene,'gq:yn:yes');invalid(scene,'request:not-offered');
   const assignments=json(G.state.village.assignments||{}),promises=json(G.state.village.promises||{}),result=choose(scene,old);
   assert.equal(G.state.village.talkRequests[scene.vid].request.reply.id,reply.id);assert(scene.c.transcript.some(e=>e.who==='you'&&e.text===reply.label));
   if(reply.op==='assign'){assert.deepEqual(result.requestNavigation,{kind:'assign',vid:scene.vid});assert.deepEqual(json(G.state.village.assignments||{}),assignments,'opening work controls cannot assign work');assert(result.ended);}
   if(reply.op==='close'){assert(result.ended);assert.equal(scene.c.active,false);assert.equal(scene.c.transcript.at(-1).text,reply.response,'the accepted closing response is the visible final line');}
   if(reply.op==='supplies'){assert.equal(scene.c.villageQuestionIntent,'supplies');assert(!/same as yesterday/.test(result.line));assert(G.activeTalkRequest(scene.vid));}
   if(kind==='legacy-rumor'&&reply.op==='concern'){assert.equal(result.line,def.unknown);assert.equal(G.activeTalkRequest(scene.vid),null);assert(!scene.c.transcript.some(e=>e.who==='them'&&/keep too much/.test(e.text)));}
   assert.deepEqual(json(G.state.village.promises||{}),promises,'a conversation request cannot accept an unrelated favor');
   invalid(scene,old);cases++;
  }
  for(const reply of def.detail||[]){
   if(kind==='legacy-rumor')continue;
   const scene=begin(kind),entry=def.start.find(r=>['concern','detail','space-detail','supplies'].includes(r.op));assert(entry);
   const first=Object.keys(scene.c.offeredReplies).find(id=>id.endsWith(':start:'+entry.id));choose(scene,first);assert(G.activeTalkRequest(scene.vid));
   const next=Object.keys(scene.c.offeredReplies).find(id=>id.endsWith(':detail:'+reply.id));assert(next);const result=choose(scene,next);
   if(reply.op==='morale')assert.equal(scene.c.villageQuestionIntent,'morale');
   invalid(scene,first);invalid(scene,next);cases++;
  }
  for(const choice of ['leave','silence']){
   const scene=begin(kind),request=G.state.village.talkRequests[scene.vid].request,id=request.id,result=choose(scene,choice);
   assert(result.ended&&result.requestOutcome.paused);assert.equal(request.answered,false);assert.equal(request.phase,'start');
   armed=false;G.startConvo(scene.vid);assert.equal(G.activeTalkRequest(scene.vid)?.id,id,'unanswered request resumes its original identity');assert(Object.keys(scene.c.offeredReplies).some(k=>k.startsWith('request:'+id+':start:')));cases++;
  }
 }
 const stale=begin('rumor'),offered=Object.keys(stale.c.offeredReplies).find(id=>id.startsWith('request:')),bearer=G.villagerId;
 G.villagerId=stale.vid;invalid(stale,offered);G.villagerId=bearer;
 const record=G.state.village.talkRequests[stale.vid],snapshot=json(record.request.context);G.state.village.gossip=[];choose(stale,offered);assert.deepEqual(record.request.context,snapshot,'heard concern survives source gossip expiry');assert(stale.c.transcript.some(e=>e.who==='them'&&e.text.includes(snapshot.claim)));
 // A real accepted physical favor remains ahead of a later casual request.
 armed=false;const fixture=JSON.parse(require('fs').readFileSync(K.ROOT+'/evidence/2026-10-27/forage-phone-fixture-r1.json','utf8'));
 disk.clear();for(const [k,v]of Object.entries(fixture.storage))disk.set(k,v);assert(G.load(fixture.setup.key));
 const resident=fixture.setup.npc,P=require('../lib/conversation-playtest');G.startConvo(resident);P.choose(G,resident,'dlg:commit');G.convoTurn(resident,'leave');
 const obligation=json(G.openFavorObligation(resident));assert(obligation?.favorId);
 G.state.village.talkRequests[resident]={...G.makeTalkRequest(resident,'work'),day:G.state.scholar.day};
 const reopened=G.startConvo(resident);assert.equal(G.convoGet(resident).thread,'want');assert(!reopened.choices.some(c=>c.id.startsWith('request:')));
 assert.deepEqual(json(G.openFavorObligation(resident)),obligation);assert(!G.state.village.talkRequests[resident].delivered,'casual request stays pending behind accepted work');
 console.log('Talk request contracts: '+cases+' full reply/pause/resume scenarios, whole-village checkpoints, invalid/stale contrasts, retained source context and actual accepted-favor priority passed');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
