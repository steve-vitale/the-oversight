'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=process.argv[2]?require(path.join(path.resolve(process.argv[2]),'scripts/godpath/lib')):require('./lib'),T=K.reporter('held answer continuity');
(async()=>{
 const G=await K.load({seed:221023});K.newRun(G);
 const f=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'../../evidence/2026-10-22/held-answer-observed-r1.json.gz'))));
 const reset=()=>{G.state=structuredClone(f.state);G.villagerId=f.bearer;G.over=false;G.won=false;return G.convoGet(f.vid);};
 let c=reset();const menu=G.buildMenu(f.vid,true),answer=menu.find(x=>x.id==='gq:reason:understand');
 T.ok('the actual recorded interruption offers a live reason answer',!!answer&&c.genericQ?.kind==='reason');
 G.convoTurn(f.vid,answer.id);
 T.ok('answering the interruption retains the recorded substantive reply',c.heldBeats.some(h=>h.text===f.expectedSubstantive));
 T.ok('answering removes the old question and its queued reminder',!c.genericQ&&!c.heldBeats.some(h=>h.genericFollowup));
 let delivered=0;
 for(let i=0;i<8&&c.active&&c.heldBeats.length;i++){
  const choices=G.buildMenu(f.vid,true),goon=choices.find(x=>x.id==='goon');if(!goon)break;
  const offered=goon.label,oldLength=c.transcript.length;G.convoTurn(f.vid,'goon');
  const added=c.transcript.slice(oldLength);
  T.ok('continuation records the exact words offered before its queue advances',added.find(x=>x.who==='you')?.text===offered);
  delivered+=added.filter(x=>x.who==='them'&&x.text===f.expectedSubstantive).length;
 }
 T.ok('the actual substantive reply reaches the transcript exactly once',delivered===1);
 c=reset();G.convoTurn(f.vid,'dlg:subject');
 T.ok('deliberate subject change still discards the old substantive reply',!c.heldBeats.some(h=>h.text===f.expectedSubstantive));
 for(const mode of ['generic','formal','reactive']){
  c=reset();c.pendingQ=null;c.reactiveQ=null;c.genericQ=null;
  if(mode==='generic')c.genericQ={kind:'reason',q:'What is this about?'};
  if(mode==='formal')c.pendingQ=G.convoQuestionDef('q_fun');
  if(mode==='reactive')c.reactiveQ={id:'rq_personal'};
  const futureAsk={text:'"What did you do for fun?"',ask:G.convoQuestionDef('q_fun')};
  const old=[{text:f.expectedSubstantive},futureAsk,{text:'old reminder',genericFollowup:true},{text:'old formal reminder',pendingqFup:true},{text:'old reactive reminder',reactiveFollowup:'rq_personal'},{text:'"I should go."',winddown:true}];
  c.heldBeats=structuredClone(old);c.heldAsk=true;c.winddownQueued=true;
  const id=mode==='generic'?'gq:reason:understand':mode==='formal'?'ans:q_fun:a_people':'react:rq_personal:yes';
  G.convoDropUnspoken(f.vid,id);
  T.ok(mode+' answer keeps original speech, deferred ask and goodbye in order',c.heldBeats.length===3&&c.heldBeats[0].text===f.expectedSubstantive&&!!c.heldBeats[1].ask&&!!c.heldBeats[2].winddown);
  T.ok(mode+' answer does not count a future question as a dodge',c.heldAsk&&c.winddownQueued&&!c.heldAskDodges);
 }
 for(const id of ['agree','joke','silence']){
  c=reset();G.convoDropUnspoken(f.vid,id);
  T.ok('the existing generic '+id+' response also preserves unfinished speech',c.heldBeats.some(h=>h.text===f.expectedSubstantive)&&!c.heldBeats.some(h=>h.genericFollowup));
 }
 c=reset();c.genericQ=null;c.reactiveQ={id:'rq_personal'};
 const reactive=G.convoMatchReactive('"Can I ask you something — person to person?"');
 c.heldBeats=[{text:f.expectedSubstantive},{text:reactive.followUp}];
 G.convoDropUnspoken(f.vid,'react:rq_personal:yes');
 T.ok('old untagged reactive reminders are removed without losing actual speech',c.heldBeats.length===1&&c.heldBeats[0].text===f.expectedSubstantive);
 c=reset();c.genericQ=null;c.pendingQ=G.convoQuestionDef('q_fun');G.convoDropUnspoken(f.vid,'silence');
 T.ok('silence that does not answer a formal question retains its existing abandonment behavior',!c.heldBeats.some(h=>h.text===f.expectedSubstantive));
 c=reset();c.genericQ=null;G.convoDropUnspoken(f.vid,'gq:reason:understand');
 T.ok('an answer-shaped ID without a current question cannot preserve obsolete content',!c.heldBeats.some(h=>h.text===f.expectedSubstantive));
 c=reset();c.heldBeats=[{text:'"I should go."',winddown:true}];c.thread='skills';
 T.ok('a queued goodbye never promises more skill information',! /what else|good at|teach|learn/i.test(G.convoGoonLabel(f.vid)));
 T.ok('a queued goodbye explicitly allows the speaker to finish',G.convoGoonLabel(f.vid)==='(let them finish)');
 c.heldBeats=[{text:'A neutral quiet returns.'}];T.ok('a narration beat offers a moment instead of a new topic question',G.convoGoonLabel(f.vid)==='(give them a moment)');
 // Exercise a real profile containing question mannerisms; raw questions
 // remain answerable while decoration cannot create a new speech intention.
 const V=G.data.characterGen.voice,backup=structuredClone(V);let seedQuestions=0,rawQuestions=0;
 try{
  for(const p of Object.values(V.profiles||{})){p.p=1;p.open=['What\'s this about? '];p.close=[' How are you?'];}
  V.ageSets={};V.states={};
  c=reset();c.want=null;
  for(let i=0;i<48;i++){
   const line=G.voiceLine(f.vid,'"The free things mattered."');if(line.includes('?'))seedQuestions++;
   const q=G.voiceLine(f.vid,'"What did you do before?"');if(q.includes('What did you do before?'))rawQuestions++;
  }
 }finally{G.data.characterGen.voice=backup;}
 T.ok('voice mannerisms never add a question to an authored statement',seedQuestions===0,'added '+seedQuestions);
 T.ok('authored actual questions survive voice decoration',rawQuestions===48);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
