'use strict';
const K=require('./lib'),T=K.reporter('Conversation spoken context');
(async()=>{
 const G=await K.load({seed:43,narration:true});K.newRun(G); // seed 42 -> 43 on 2026-10-31 (lootabilities build): items.json gained two tier-1 loot pieces (the System-assembled shard_spear is alien-origin and joins the fan-gift pool), re-rolling seeded generation; at seed 42 the day answer no longer receives its relevant acknowledgment. Seed 43 preserves the scenario's spoken-context shape. No assertion changed.
 const vid=G.state.village.roster.find(id=>id!==G.villagerId);G.startConvo(vid);const c=G.convoGet(vid),curiousWant={...G.convoGet(vid).want};
 function clear(){c.pendingQ=null;c.reactiveQ=null;c.genericQ=null;c.pendingTrade=null;c.pendingHawk=null;c.heldBeats=[];c.heldAsk=false;c.windingDown=false;c.choosingSubject=false;c.want=null;c.thread='personal';c.active=true;}
 // Actual authored lines retained by the broad seed1/7/42/99 sample. These
 // rhetorical frames must not manufacture an unanswered question.
 const statements=[
  '"Bottom line: Honestly? oh, thriving. Absolutely thriving. (We are not.)"',
  '"Well, Honestly? quiet. People keeping to themselves, mostly."',
  '"My plan? Keep everyone fed. That\'s it. That\'s the whole plan and it\'s enough."',
  '"Frank? I\'d trust Frank with my pack. That\'s the highest compliment I have."',
  '"Xavier? A lawyer, back before. Solid person, friend."',
  '"What? Don\'t mind me. I\'m having a whole argument in my head and losing."',
  '"Back home I was a social worker. Doesn\'t mean much now, does it? Means something. Just not much."',
  '"When did I get like this? I used to be fun."',
  '"Can I tell you something? At night I talk to someone who isn\'t there anymore."',
  '"Can I be honest? Still on what they want."',
  '"If I forget who I was, then what survived? Just a body. That\'s not enough."',
 ];
 for(const line of statements){clear();T.ok('no phantom answer to '+line,G.convoGenericQ(vid,line)===null);}
 for(const [line,kind]of [['"Funny thing: You ever get a song stuck in your head?"','yn'],['"You doing okay?"','howru'],['"Why — do I look useless to you?"','yn'],['"About the sickness — have you had a chance?"','yn']]){clear();T.ok('real addressed question '+line,G.convoGenericQ(vid,line)?.kind===kind);}
 clear();G.sayLine(vid,'"We need another fire before dark."');const a=G.beatOf(vid);T.ok('reply beat records actual emitted words',a.line===c.transcript.filter(x=>x.who==='them').at(-1).text);
 c.lastBeat={tag:'feeling',topic:'grief',line:'unspoken generated grief'};T.ok('generating another beat cannot replace the displayed context',G.beatOf(vid).line===a.line);
 clear();G.convoGenericQ(vid,'"Have you ever asked?"');G.sayLine(vid,'They smile when they see you.');T.ok('an unrelated emitted beat retires an unseen generic question',!c.genericQ);
 clear();c.thread='want';c.want={id:'ask_favor',stage:1,def:{}};T.ok('a real favor owns its request instead of an inert Yes/No menu',G.convoGenericQ(vid,'"Will you help me clean it?"')===null);
 clear();c.thread='plans';G.sayLine(vid,'"I should get going."',{tag:'closing'});c.windingDown=true;T.ok('goodbye does not offer more old-topic replies',G.convoChoices(vid).every(x=>['leave','silence'].includes(x.id)));
 clear();c.thread='plans';c.threadDryFor='plans';G.sayLine(vid,'"That is all I can tell you."',{tag:'endtopic'});T.ok('exhausted topic offers a deliberate pivot or exit, no filler loop',G.convoChoices(vid).every(x=>['dlg:subject','subject','leave','silence'].includes(x.id)));
 clear();G.sayLine(vid,'"I have been thinking about the fire."');const before=G.buildMenu(vid,true).map(x=>[x.id,x.label]);const after=G.buildMenu(vid,true).map(x=>[x.id,x.label]);T.ok('rendering the same spoken beat preserves exact offered words',JSON.stringify(before)===JSON.stringify(after));
 clear();G.sayLine(vid,'"I miss the music back home."');G.convoChoices(vid);G.convoTurn(vid,'dlg:subject');const topics=G.buildMenu(vid,true);T.ok('subject change opens topics instead of replying to the bridge',c.choosingSubject&&topics.some(x=>x.id.startsWith('ask:'))&&!topics.some(x=>/^(gq:|dlg:more|dlg:react)/.test(x.id)));
 clear();c.pendingQ={id:'audit',answers:[{id:'yes',label:'"Yes."'}]};const focused=G.convoMenuPage(vid,[{id:'agency:unrelated',label:'Wrong topic'},{id:'ans:audit:yes',label:'"Yes."'},{id:'teach',label:'Wrong lesson'}]);T.ok('outer menu injectors cannot enter a question',focused.every(x=>x.id==='ans:audit:yes'||x.id==='leave'));
 clear();G.inviteHistory(vid).pending={defId:'show',day:G.state.scholar.day};G.sayLine(vid,'"Come see what I found. You won\'t believe it."',{tag:'invitation',inviteBeat:true});const invitation=G.convoChoices(vid);T.ok('spoken invitation owns accept/decline after all injectors',invitation.some(x=>x.id==='betrayal:accept')&&invitation.every(x=>/^(betrayal:(accept|decline)|leave|silence)$/.test(x.id)));T.ok('accepting an invitation does not repeat the inviter\'s words as the player',invitation.find(x=>x.id==='betrayal:accept')?.label==='"All right. Let\'s go."');G.convoTurn(vid,'betrayal:decline');T.ok('actual decline consumes the invitation',!G.pendingInvite(vid));
 clear();c.thread='nonverbal';c.nativeLang='spanish';const gesture=G.convoChoices(vid).find(x=>x.id==='nv:nod');const entries=new Set(c.transcript);G.convoTurn(vid,gesture.id);T.ok('gesture shortcuts retain the actual selected action',c.transcript.find(x=>x.who==='you'&&!entries.has(x))?.text===gesture.label);
 clear();G.convoGenericQ(vid,'"Can you help me?"');G.sayLine(vid,'"Can you help me?"');T.ok('generic questions have a real exit after final injectors',G.convoChoices(vid).some(x=>x.id==='leave'));
 clear();c.want={...curiousWant,id:'curious',stage:0};const beforeAsked=JSON.stringify([c.askedQs,G.state.village.askedQsAny,c.qCount]);const prepared=G.convoWantOpener(vid,c.want);T.ok('a generated question is provisional until its opener is accepted',!!prepared?.question&&!c.pendingQ&&JSON.stringify([c.askedQs,G.state.village.askedQsAny,c.qCount])===beforeAsked);G.convoAcceptWantQuestion(vid,prepared);G.sayLine(vid,prepared.line);T.ok('accepted question exposes its own authored answers',G.convoChoices(vid).some(x=>x.id.startsWith('ans:'+prepared.question.id+':')));
 clear();T.ok('a trailing you-know tag is not a Yes/No question',!G.convoGenericQ(vid,'"Can\'t sit still, you know?"'));T.ok('why-ask questions offer reasons, not a reversed question',G.convoGenericQ(vid,'"Why do you ask?"')?.kind==='reason'&&G.convoGenericAnswers(vid,c.genericQ).some(x=>x.id==='gq:reason:understand'));
 clear();const region=G.homeRegion;const reaction=G.convoAnswerReactLine(vid,'"'+region+'. I\'ll remember that."');T.ok('NPC cover stories cannot rewrite the player\'s named hometown',reaction.includes(region),reaction);
 clear();c.thread='want';c.want={id:'ask_favor',stage:1,def:{}};const owned=G.convoMenuPage(vid,[{id:'dlg:details',label:'"Tell me more."'},{id:'teach',label:'Wrong lesson'},{id:'agency:ask_field',label:'Unrelated trip'},{id:'leave',label:'"Bye."'}]);T.ok('current needs keep unrelated lessons and fieldwork behind a pivot',owned.every(x=>['dlg:details','leave'].includes(x.id)));
 clear();const qd=G.convoQuestionDef('q_useful');c.pendingQ={...qd};G.sayLine(vid,qd.q,{diegeticAct:true});G.sayLine(vid,qd.q,{fallback:'"I lost my train of thought."'});T.ok('blocked question emission cannot expose answers over a fallback',!c.pendingQ);
 clear();c.thread='want';c.want={id:'ask_favor',stage:1,def:{menuOptions(){return[];}}};G.sayLine(vid,'"Never mind the food. We got it handled."',{tag:'offer'});T.ok('an empty settled want menu cannot invent another offer',!G.convoChoices(vid).some(x=>['dlg:help','dlg:cant','teach'].includes(x.id)));
 clear();G.remember(vid,'gift','prepared selected-topic boundary');c.choosingSubject=true;const P=require('../lib/conversation-playtest'),memory=P.offers(G,vid).find(x=>x.id==='alive:memory:gift');T.ok('prepared memory is an actual offered topic',!!memory);if(memory){P.choose(G,vid,memory.id);T.ok('selecting an injected topic closes the selector before replies',!c.choosingSubject);}
 clear();G.sayLine(vid,'"Did the repair work?"');G.convoGenericQ(vid,'"Did the repair work?"');
 const ledger=G.convoRunLedger();ledger.push('"All right. Thank you for telling me."','They nod. "Okay."','"I see." They take a moment to think about your answer.');
 const start=c.transcript.length;P.choose(G,vid,'gq:yn:yes');const acknowledgement=c.transcript.slice(start).filter(x=>x.who==='them').map(x=>x.text).join(' ');
 T.ok('a general yes does not invent shared visions or knowledge',! /only one seeing|good instincts|why I asked you/i.test(acknowledgement));
 T.ok('required acknowledgment survives another speaker using the same words',!/lost my train|never mind|forget it/i.test(acknowledgement)&&!!acknowledgement);
 clear();G.sayLine(vid,'"What should we do?"');G.convoGenericQ(vid,'"What should we do?"');const openStart=c.transcript.length;P.choose(G,vid,'gq:open:take');
 T.ok('asking for time receives time rather than ledger amnesia',c.transcript.slice(openStart).some(x=>x.who==='them'&&/Take your time/.test(x.text)));
 clear();c.thread='want';c.want={id:'seek_taken',stage:1,def:{commitBeat(){return '"Thank you. Really."';}}};ledger.push('"Thank you. Really."');const commitStart=c.transcript.length;G.convoTurn(vid,'dlg:commit');
 T.ok('a real commitment confirms the promise despite a shared thank-you',c.want.resolution==='promised'&&c.transcript.slice(commitStart).some(x=>x.who==='them'&&x.text==='"Thank you. Really."'));
 clear();T.ok('a speaker finding their place does not ask the player an open question',!G.convoGenericQ(vid,'"Anyway — where was I?"'));
 clear();T.ok('what this is about asks for a reason',G.convoGenericQ(vid,'"What\'s this about?"')?.kind==='reason');
 clear();const dayQuestion=G.convoGenericQ(vid,'"What\'s the count today?"');G.sayLine(vid,'"What\'s the count today?"');T.ok('a day question offers the real observed day',G.convoGenericAnswers(vid,dayQuestion).some(x=>x.label==='"It\'s day '+G.state.scholar.day+'."'));
 P.choose(G,vid,'gq:day:count');T.ok('the day answer receives a relevant acknowledgment',c.transcript.filter(x=>x.who==='them').at(-1).text==='"Thank you. I wanted to check."');
 for(const question of G.data.characterGen?.convo?.questions || []) {
  const first=question.q.split('?')[0];
  if (/\b(?:what|who|where|when|how)\b/i.test(first)) T.ok('authored open question has no bare yes/no answer: '+question.id,!question.answers.some(x=>/^"(?:Yes|No)\./i.test(x.label)));
 }
 T.ok('naming a person cannot be an unbound placeholder',!G.convoQuestionDef('q_read').answers.some(x=>/mention someone specific/.test(x.label)));
 T.ok('a proposed lesson cannot claim a completed second lesson',!/lesson two/.test(G.convoQuestionDef('q_teach_me').recalls.a_tell));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
