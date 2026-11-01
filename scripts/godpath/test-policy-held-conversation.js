'use strict';
// Controller fidelity, not balance: prepared active phone state and long queue.
// Every submitted reply/navigation still goes through the actual Game API.
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib');
const C=process.argv[2]?require(path.join(path.resolve(process.argv[2]),'scripts/policies/competent')):require('../policies/competent');
const T=K.reporter('policy held conversation');
(async()=>{
 const G=await K.load({seed:221023});K.newRun(G);
 const f=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'../../evidence/2026-10-22/held-answer-observed-r1.json.gz'))));
 const choice=id=>({id,label:id}),pick=(ids,seen,c)=>C.pickTalkChoice(ids.map(choice),seen,c)?.id;
 T.ok('history and silence are not fallback content',pick(['recap','silence'],{})===undefined);
 T.ok('generic answer precedes teaching',pick(['teach','gq:reason:understand'],{})==='gq:reason:understand');
 T.ok('reactive answer precedes teaching',pick(['teach','react:noise:yes'],{})==='react:noise:yes');
 T.ok('new held beat can reuse the continuation ID',pick(['teach','goon'],{goon:1},{heldBeats:[{text:'"Still speaking."'}]})==='goon');
 T.ok('continuation requires an actual queued beat',pick(['goon'],{},{heldBeats:[]})===undefined);
 T.ok('an offered current answer can recur after another question',pick(['gq:reason:understand'],{'gq:reason:understand':1},{genericQ:{kind:'reason'}})==='gq:reason:understand');
 T.ok('ordinary topic choices still cannot repeat',pick(['teach'],{teach:1})===undefined);
 const talk=G.talkTo,turn=G.convoTurn;
 function sitting(longQueue){
  const actions=[],ctx={};let opened=0,invalid=0;
  G.talkTo=function(vid){
   const result=talk.call(this,vid);opened++;
   // One-shot preparation after opening; this does NOT prove Talk pricing.
   this.state=structuredClone(f.state);this.villagerId=f.bearer;this.over=false;this.won=false;
   const c=this.convoGet(vid);
   if(longQueue){c.pendingQ=null;c.reactiveQ=null;c.genericQ=null;c.heldBeats=Array.from({length:9},(_,i)=>({text:`"Prepared held beat ${i}."`}));c.heldAsk=false;}
   return result;
  };
  G.convoTurn=function(vid,id){
   if(!this.convoChoices(vid).some(ch=>ch.id===id))invalid++;
   const result=turn.call(this,vid,id);
   if(!result?.navigation)actions.push({id,ignored:!!result?.ignored});
   return result;
  };
  // Initialize the real bearer before holdConversation opens the fixture.
  G.state=structuredClone(f.state);G.villagerId=f.bearer;G.over=false;G.won=false;
  try{C.holdConversation(G,ctx,f.vid);}finally{G.talkTo=talk;G.convoTurn=turn;}
  return{actions,ctx,opened,invalid,c:G.convoGet(f.vid)};
 }
 const actual=sitting(false);
 T.ok('wired sitting opens once and submits only currently offered choices',actual.opened===1&&actual.invalid===0);
 T.ok('wired sitting answers the actual interruption first',actual.actions[0]?.id==='gq:reason:understand');
 T.ok('wired sitting hears the recorded substantive answer exactly once',actual.c.transcript.filter(t=>t.who==='them'&&t.text===f.expectedSubstantive).length===1);
 T.ok('continuations remain inside five actual attempts',actual.actions.length<=5&&actual.actions.some(t=>t.id==='goon')&&!actual.actions.some(t=>t.ignored));
 T.ok('sitting closes honestly',!actual.c.active);
 const bounded=sitting(true),spoken=bounded.c.transcript.filter(t=>t.who==='them').map(t=>t.text);
 T.ok('long queue uses exactly five continuation actions',bounded.actions.length===5&&bounded.actions.every(t=>t.id==='goon'&&!t.ignored));
 T.ok('each of the first five queued beats is delivered exactly once',Array.from({length:5},(_,i)=>`"Prepared held beat ${i}."`).every(text=>spoken.filter(t=>t===text).length===1));
 T.ok('remaining queue does not bypass the sitting budget',!spoken.includes('"Prepared held beat 5."')&&bounded.ctx.deepTurns===5&&!bounded.c.active);
 T.ok('prepared queue never submits hidden or stale actions',bounded.invalid===0);
 console.log(JSON.stringify({actual:actual.actions,bounded:bounded.actions,scope:'Prepared active snapshot and queue; not paid Talk, natural campaign or balance evidence.'}));
 T.done();
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
