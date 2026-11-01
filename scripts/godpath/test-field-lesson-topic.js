'use strict';
const assert=require('assert/strict'),K=require('./lib'),P=require('../lib/conversation-playtest');
(async()=>{
 const T=K.reporter('field lesson topic'),G=await K.load({seed:88107,narration:true});K.newRun(G);
 const v=G.state.village,vid=v.roster.find(id=>id!==G.villagerId);
 const resource=()=>JSON.stringify([G.state.scholar.kcal,G.state.scholar.dayTicks,G.day,G.dayPart]);
 function prepare(kind){
  if(G.convoGet(vid).active)G.endConvo(vid,'left');
  const a=G.agencyState();a.know[vid]={plants:0,monsters:0,places:kind==='place'?['Prepared north ridge']:[],fought:kind==='monster'?['hushwolf']:[]};
  a.teachable[vid]=kind==='plant'?[{topic:'plants',day:G.state.scholar.day}]:[];
  if(kind==='monster')delete G.state.codex.monsters.hushwolf;
  G.startConvo(vid);assert(P.reach(G,vid,['agency:ask_field','agency:ask_expedition'],50));return G.convoGet(vid);
 }
 const c=prepare('monster');assert.equal(c.thread,'want');const beforeWant=JSON.stringify(c.want),oldWantSnippet=G.convoLastThreadSnippet(vid,'want'),beforeResource=resource(),beforeLength=c.transcript.length;
 const first=P.choose(G,vid,'agency:ask_field');assert.equal(G.state.codex.monsters.hushwolf.stage,'observed');assert.equal(c.spokenBeat.topic,'field');assert.equal(c.spokenBeat.tag,'endtopic');assert.equal(c.thread,'small');assert.equal(c.depth,0);assert.equal(JSON.stringify(c.want),beforeWant);assert.equal(resource(),beforeResource);assert.equal(G.convoLastThreadSnippet(vid,'want'),oldWantSnippet);assert(c.transcript.slice(beforeLength).some(e=>e.who==='them'&&e.topic==='field'));
 assert(c.transcript.slice(beforeLength).some(e=>e.who==='them'&&e.text===first.line));assert(G.convoTopicLedger(vid).discussed.field);assert.equal(G.convoTopicLabel(vid,'field'),'that field lesson');
 T.ok('Actual offered monster lesson owns its beat/memory, preserves the real want and existing resource cost',true);
 const recap=G.convoRecapLine(vid);assert(recap.includes('field lesson'));assert(!recap.includes('Still on'));
 G.endConvo(vid,'left');assert(!G.convoOpenThreads(vid).some(t=>t.tid==='field'));
 T.ok('Recap names the actual lesson and completed field content never becomes unfinished business',true);
 for(const kind of ['plant','place']){
  const sc=prepare(kind),old=JSON.stringify(sc.want),n=sc.transcript.length,budget=resource();const r=P.choose(G,vid,'agency:ask_field');assert.equal(sc.thread,'small');assert.equal(sc.spokenBeat.topic,'field');assert.equal(resource(),budget);assert.equal(JSON.stringify(sc.want),old);assert(sc.transcript.slice(n).some(e=>e.who==='them'&&e.text===r.line));
  assert(!sc.threadLog.slice(-1).some(e=>e.thread==='want'));
  if(kind==='plant')assert.equal(G.agencyState().teachable[vid].length,0);else assert.equal(G.agencyState().know[vid].places.length,0);
 }
 T.ok('Plant and place siblings use the same completed-topic boundary and consume exactly their finite lesson',true);
 prepare('monster');const priorTopic=G.convoGet(vid).thread;assert(priorTopic&&priorTopic!=='field');const hook=G.agencySayLesson;G.agencySayLesson=function(id,line){return this.sayLine(id,line);};P.choose(G,vid,'agency:ask_field');assert.equal(G.convoGet(vid).spokenBeat.topic,priorTopic);assert.notEqual(G.convoGet(vid).spokenBeat.topic,'field');G.agencySayLesson=hook;
 T.ok('Removing the actual shared emission hook reproduces the original wrong-topic defect',true);
 prepare('monster');const pc=G.convoGet(vid),savedLine=G.convoSplitBeats(G.agencyMonsterLessonLine('hushwolf'))[0].trim();pc.saidLinesConvo=pc.saidLinesConvo.filter(x=>x!==savedLine);G.convoRunLedger().push(savedLine);const n=pc.transcript.length,r=P.choose(G,vid,'agency:ask_field');assert(pc._sayFellBack);assert(pc.transcript.slice(n).some(e=>e.who==='them'&&e.text===r.line));assert.notEqual(r.line,savedLine);assert(!pc.threadLog.slice(-1).some(e=>e.snippet===savedLine));
 T.ok('A real no-repeat fallback returns its accepted transcript words instead of the blocked lesson',true);
 prepare('monster');const qc=G.convoGet(vid),oldKnowledge=JSON.stringify(G.state.codex),oldDeeds=JSON.stringify(G.codexDeeds());qc.pendingQ={id:'prepared',answers:[{id:'yes',label:'"Yes."'}]};G.convoChoices(vid);const paid=resource();const rejected=G.convoTurn(vid,'agency:ask_field');assert(rejected.noop);assert.equal(JSON.stringify(G.state.codex),oldKnowledge);assert.equal(JSON.stringify(G.codexDeeds()),oldDeeds);assert.equal(resource(),paid);assert(qc.pendingQ);
 T.ok('Unshown lesson commands cannot bypass a current direct question or grant knowledge/deeds',true);
 qc.pendingQ=null;qc.thread='ambush';const ambush=G.convoTurn(vid,'agency:ask_field');assert(ambush.noop);assert(ambush.choices.some(x=>x.id==='betrayal:run'));assert.equal(JSON.stringify(G.state.codex),oldKnowledge);
 T.ok('Urgent ambush retains its real controls and blocks stale lesson commands',true);
 qc.thread='small';qc.spokenBeat=null;qc.lastBeat=null;G.convoChoices(vid);const labels=qc.offeredReplies['agency:ask_field'];assert(labels);G.agencyState().know[vid].fought=[];G.agencyState().know[vid].places=['Prepared changed place'];const stale=G.convoTurn(vid,'agency:ask_field');assert(stale.noop);assert.equal(G.agencyState().know[vid].places.length,1);
 T.ok('A stale wild-lesson label cannot silently consume a newly changed place report',true);
 G.agencyState().know[vid].places=[];const say=G.sayLine,beforeTranscript=qc.transcript.slice();G.sayLine=()=>null;const silent=G.agencyTurn(vid,'agency:ask_field');G.sayLine=say;assert(silent.noop);assert.equal(silent.ended,false);assert(silent.choices.length);assert.deepEqual(Array.from(qc.transcript),beforeTranscript);
 T.ok('An exhausted/silent domain call leaves an active conversation honestly open with no orphan player echo',true);

 if(qc.active)G.endConvo(vid,'left');
 G.npcNeeds(vid).hunger=90;
 const favor=G.convoBuildFavor(vid,{kind:'food_share'});assert(favor);G.convoStoreFavor(favor);G.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:'Prepared actual food request'});
 const ag=G.agencyState();ag.know[vid]={plants:0,monsters:1,places:[],fought:['hushwolf']};ag.teachable[vid]=[];delete G.state.codex.monsters.hushwolf;
 G.startConvo(vid);assert.equal(G.convoGet(vid).want.id,'ask_favor');assert(P.reach(G,vid,['dlg:commit'],40));P.choose(G,vid,'dlg:commit');assert.equal(favor.state,'promised');assert(G.openFavorObligation(vid));
 P.choose(G,vid,'dlg:subject');assert(P.reach(G,vid,['agency:ask_field'],40));const favorBefore=JSON.stringify(favor),oldDeadline=favor.deadline,cost=resource();P.choose(G,vid,'agency:ask_field');assert.equal(JSON.stringify(favor),favorBefore);assert.equal(resource(),cost);assert(G.openFavorObligation(vid));G.endConvo(vid,'left');G.startConvo(vid);assert.equal(G.convoGetFavor(vid).id,favor.id);assert.equal(G.convoGetFavor(vid).state,'promised');assert.equal(G.convoGetFavor(vid).deadline,oldDeadline);assert(!G.convoGet(vid).transcript.some(e=>e.who==='them'&&e.text.includes('Dog-shaped')));
 T.ok('A real accepted food favor keeps its canonical obligation/deadline and honest reminder across a field lesson',true);

 G.endConvo(vid,'left');G.getPerson(vid).languages={native:'arabic',levels:{arabic:2,english:0}};G.state.scholar.languages={native:'english',levels:{english:2,arabic:0}};G.state.scholar.englishLevel=2;
 ag.know[vid]={plants:0,monsters:1,places:[],fought:['hushwolf']};delete G.state.codex.monsters.hushwolf;assert.equal(G.commLevel(vid).level,'none');G.startConvo(vid);assert.equal(G.convoGet(vid).thread,'nonverbal');const nv=P.offers(G,vid);const focusedNV=G.convoMenuPage(vid,[{id:'nv:listen',label:'Listen'},{id:'agency:ask_field',label:'Wrong English lesson'},{id:'party_role',label:'Wrong English roles'},{id:'speak_back',label:'Try learned words'},{id:'leave',label:'Leave'}]);assert(!focusedNV.some(ch=>ch.id==='party_role'||ch.id.startsWith('agency:')));assert(focusedNV.some(ch=>ch.id==='speak_back'));assert(nv.some(ch=>ch.id==='nv:listen'));assert(!nv.some(ch=>ch.id.startsWith('agency:')||ch.id.startsWith('party_')));
 const noLanguageKnowledge=JSON.stringify(G.state.codex);const nvResult=G.agencyTurn(vid,'agency:ask_field');assert(nvResult.noop);assert.equal(JSON.stringify(G.state.codex),noLanguageKnowledge);assert.equal(G.convoGet(vid).thread,'nonverbal');P.choose(G,vid,'nv:listen');assert(P.offers(G,vid).some(ch=>ch.id==='speak_back'));assert(!P.offers(G,vid).some(ch=>ch.id.startsWith('agency:')));
 G.endConvo(vid,'left');G.state.scholar.languages.levels.arabic=1;assert.equal(G.commLevel(vid).level,'partial');G.startConvo(vid);assert.notEqual(G.convoGet(vid).thread,'nonverbal');assert(P.reach(G,vid,['agency:ask_field'],50));P.choose(G,vid,'agency:ask_field');assert.equal(G.state.codex.monsters.hushwolf.stage,'observed');
 T.ok('A real language barrier keeps gestures/study and blocks free English lessons; prepared shared comprehension restores the lesson',true);

 const untouched=v.roster.find(id=>id!==G.villagerId&&!v.conv?.[id]);assert(untouched,'Fresh canonical resident for availability-query contrast');G.agencyState().know[untouched]={plants:0,monsters:0,places:['Prepared lookout'],fought:[]};const conversationRecords=JSON.stringify(v.conv);G.agencyChoices(untouched);assert.equal(JSON.stringify(v.conv),conversationRecords);
 T.ok('Checking an untouched resident for lessons creates no unrelated conversation record',true);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
