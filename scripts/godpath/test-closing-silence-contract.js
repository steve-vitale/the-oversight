'use strict';
const assert=require('assert/strict'),cp=require('child_process'),K=require('./lib'),{chooseConversationChoice,conversationDiagnostics}=require('../policies/conversation-pages');
async function sample(ablate, target){
 const G=await K.load({seed:7,narration:true});K.newRun(G);
 const present=G.convoSilencePresentation,say=G.sayLine,note=G.convoNoteSpokenBeat;let enabled=false,closed=0;
 // Both samples execute the same old semantic prefix with live functions,
 // not JSON-restored wants. Activate the candidate only at the matched final
 // public action. This is a closure contrast, not a full-campaign RNG claim.
 G.convoSilencePresentation=function(vid,beat){return enabled?present.call(this,vid,beat):beat;};
 G.sayLine=function(vid,line,opts){if(!enabled&&opts?.tag==='closing'&&opts.structural){opts={...opts};if(!this.convoGet(vid).active)delete opts.structural;delete opts.tag;}return say.call(this,vid,line,opts);};
 G.convoNoteSpokenBeat=function(vid,line,opts){return note.call(this,vid,line,enabled?opts:undefined);};
 const actions=[],pages={};
 for(const vid of G.state.village.roster.filter(id=>id!==G.villagerId)){
  G.startConvo(vid);
  for(let n=0;n<64&&G.convoGet(vid).active;n++){
   const c=G.convoGet(vid),pick=chooseConversationChoice(G,vid,choices=>choices.find(x=>/^(ans:|gq:|react:)/.test(x.id))||choices.find(x=>x.id==='goon')||choices.find(x=>x.id==='dlg:more')||choices.find(x=>x.id==='dlg:react')||choices.find(x=>!['leave','silence','recap'].includes(x.id))||choices.find(x=>x.id==='silence'),pages);assert(pick);
   const matched=c.windingDown&&pick.id==='silence'&&closed===target,before=matched?JSON.parse(JSON.stringify(G.state)):null;
   if(matched)enabled=!ablate;
   const closing=c.windingDown,anchor=c.transcript.at(-1),r=G.convoTurn(vid,pick.id),i=anchor?c.transcript.indexOf(anchor):-1,added=c.transcript.slice(i+1);actions.push({vid,id:pick.id,closing,ended:!!r?.ended,added});
   if(matched){assert(r?.ended);const state=JSON.parse(JSON.stringify(G.state));G.startConvo(vid);const reopened=G.convoUI(vid);return{before,state,actions,vid,added,paging:conversationDiagnostics(pages),reopened:{active:reopened.active,choices:reopened.choices}};}
  }
  assert(!G.convoGet(vid).active,'Natural ending within safety bound');closed++;
 }
 throw Error('Missing matched closure '+target);
}
async function legacySample(ablate){
 const fixture=require('../../evidence/2026-10-27/closing-silence-legacy-r1/fixture.json'),G=await K.load({seed:7,narration:true});K.newRun(G);
 G.state=structuredClone(fixture.state);const runtime=fixture.runtime;
 G.villagerId=runtime.bearer;G.map=structuredClone(runtime.map);G.homeRegion=runtime.homeRegion;G.location=runtime.location;G.departed=runtime.departed;G.dayPart=runtime.dayPart;G.log=structuredClone(runtime.log);
 const c=G.convoGet(fixture.vid);assert(c.active&&c.windingDown&&!c.pendingQ&&!c.genericQ&&!c.reactiveQ&&!c.heldAsk);
 if(ablate){
  const say=G.sayLine,note=G.convoNoteSpokenBeat;
  G.convoSilencePresentation=function(vid,beat){return beat;};
  G.sayLine=function(vid,line,opts){if(opts?.tag==='closing'&&opts.structural){opts={...opts};if(!this.convoGet(vid).active)delete opts.structural;delete opts.tag;}return say.call(this,vid,line,opts);};
  G.convoNoteSpokenBeat=function(vid,line){return note.call(this,vid,line);};
 }
 const before=structuredClone(G.state),anchor=c.transcript.at(-1),r=G.convoTurn(fixture.vid,'silence');assert(r?.ended);
 return{before,state:structuredClone(G.state),added:c.transcript.slice(c.transcript.indexOf(anchor)+1)};
}
if(process.argv[2]==='--sample'){
 const mode=process.argv[3],result=mode.startsWith('legacy-')?legacySample(mode==='legacy-ablate'):sample(mode==='ablate',Number(process.argv[4]));
 result.then(x=>process.stdout.write(JSON.stringify(x))).catch(e=>{console.error(e.stack);process.exitCode=1;});
}
else(async()=>{
 const T=K.reporter('closing silence contract'),G=await K.load({seed:7,narration:true});K.newRun(G);const vid=G.state.village.roster.find(id=>id!==G.villagerId),c=G.convoGet(vid),line=G.data.characterGen.convo.silenceAtGoodbye;
 assert(line&&!/[?"“”]/.test(line));c.windingDown=true;c.pendingQ=null;c.genericQ=null;c.reactiveQ=null;c.heldAsk=false;
 const state=JSON.stringify(G.state),beat={line:'"Where was I?"',shift:-1,spent:true},shown=G.convoSilencePresentation(vid,beat);assert.equal(shown.line,line);assert.equal(shown.shift,-1);assert.equal(shown.spent,true);assert.equal(beat.line,'"Where was I?"');assert.equal(JSON.stringify(G.state),state);
 T.ok('Closing presentation changes only the words, preserving the input beat and full live state',true);
 for(const key of ['pendingQ','genericQ','reactiveQ','heldAsk']){c[key]=true;assert.equal(G.convoSilencePresentation(vid,beat),beat);c[key]=null;}c.windingDown=false;assert.equal(G.convoSilencePresentation(vid,beat),beat);
 T.ok('Open conversations and real unanswered interruptions retain their ordinary reaction',true);
 for(const mood of [-3,-1,0,1,3])for(const count of [0,3,8]){c.windingDown=true;c.mood=mood;c._msil={warm:count,cool:count,tense:count,neutral:count,friendly:count};const b=G.convoMoodSilence(vid);assert.equal(b.line,line);}
 c.active=true;c.thread='skills';G.convoNoteSpokenBeat(vid,'"I learned to mend the nets before I could swim."');assert(c.threadLog.length);
 const threads=JSON.stringify(G.state.village.topicLog),log=JSON.stringify(c.threadLog);G.convoNoteSpokenBeat(vid,line,{tag:'closing'});assert.equal(JSON.stringify(G.state.village.topicLog),threads);assert.equal(JSON.stringify(c.threadLog),log);
 T.ok('Closing beats cannot replace remembered topic content with a goodbye',true);
 T.ok('Every mood band and ordinary/escalated/exhausted silence path respects a spoken goodbye',true);
 const run=(mode,target)=>{const p=cp.spawnSync(process.execPath,[__filename,'--sample',mode,String(target)],{encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout);};
 const strip=s=>{const copy=structuredClone(s);delete copy.village.conv;delete copy.village.convoRunLines;delete copy.village.topicLog;return copy;};
 const mechanical=c=>Object.fromEntries(['active','exchanges','budget','mood','substantive','count','lastDay','qCount','offeredHelp','over'].map(k=>[k,c[k]]).concat([['wantResolution',c.want?.resolution],['wantStage',c.want?.stage]]));
 for(let target=0;target<11;target++){
  const old=run('ablate',target),now=run('current',target);assert.deepEqual(now.before,old.before,'Identical live closure prefix '+target);assert.equal(now.vid,old.vid);assert.equal(now.paging.errors.length,0);assert(now.reopened.active&&now.reopened.choices.some(c=>!['silence','leave'].includes(c.id)),'Actual Talk again is not trapped in the previous closing menu');
  assert(now.added.some(e=>e.who==='them'&&e.text===line&&e.voiceLine===''));assert(!now.added.some(e=>e.who==='them'&&G.convoIsDeflectionLine(e.text)));
  assert.deepEqual(strip(now.state),strip(old.state),'All non-dialogue state at the matched closing action '+target);
  assert.deepEqual(mechanical(now.state.village.conv[now.vid]),mechanical(old.state.village.conv[old.vid]));
  // Ten ablated reactions are narration; one is an actual spoken compliment.
  // Only that observed utterance may add discussion. Preserve exact topic
  // state instead of counting every screen sentence as speech.
  const oldSpeech=old.added.filter(e=>e.who==='them'&&e.voiceLine);assert(oldSpeech.length<=1);
  const topic=s=>{const t=structuredClone(s.village.topicLog||{});for(const row of Object.values(t))for(const o of row.open||[])delete o.snippet;return t;},nt=topic(now.state),ot=topic(old.state),thread=now.before.village.conv[now.vid].thread;
  if(oldSpeech.length){assert(thread);nt[now.vid].discussed[thread].times++;}assert.deepEqual(nt,ot,'Only actual spoken closing content can add discussion');
 }
 T.ok('All 11 real endings after identical live prefixes use closing words without content deflections',true);
 const legacyOld=run('legacy-ablate',0),legacyNow=run('legacy-current',0);
 assert.deepEqual(legacyNow.before,legacyOld.before,'Same actual legacy winddown state for both hook contrasts');
 // The old amnesia control came from the separate second mood goodbye.
 // That utterance no longer exists. Still require removal of the actual
 // presenter hook to lose the closing cue through the real public action.
 assert(!legacyOld.added.some(e=>e.who==='them'&&e.text===line),'Removing closing hooks must lose the actual final-silence cue');
 assert(!legacyNow.added.some(e=>e.who==='them'&&G.convoIsDeflectionLine(e.text))&&legacyNow.added.some(e=>e.who==='them'&&e.text===line&&e.voiceLine===''),'Current hooks repair the actual legacy reply');
 assert.deepEqual(strip(legacyNow.state),strip(legacyOld.state),'Legacy closure preserves non-dialogue settlement');
 T.ok('Removing the actual closing hooks loses the final-silence cue in the retained real legacy ending',true);
 T.ok('Matched closing actions preserve non-dialogue state/settlement; topic counts exclude exactly the closing utterance',true);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
