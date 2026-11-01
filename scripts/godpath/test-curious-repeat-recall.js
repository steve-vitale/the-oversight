'use strict';
// One full shared runtime; exact live-state export from a failed old-client
// phone replay. No granted resources; native byte durability is proved separately.
const fs=require('fs'),path=require('path'),K=require('./lib'),T=K.reporter('Repeated unanswered curiosity');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||7),narration:true});
 const fixture=JSON.parse(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-26/curious-repeat-legacy-fixture-r1.json'),'utf8'));
 G.state=JSON.parse(fixture.storage[fixture.key]);
 // Reattach the checkpoint's actual runtime identities, not a generated body.
 G.villagerId=G.state.run.villagerId;G.map=G.state.run.map;
 G.homeRegion=G.state.run.homeRegion;G.location=G.state.run.location;
 G.departed=G.state.run.departed;G.log=G.normalizeLogEntries(G.state.run.log);
 const vid=fixture.vid,qid=G.state.village.convoSeeds[vid].qid,body=G.villagerId;
 const q=G.convoQuestionDef(qid),oldAsked=G.state.village.conv[vid].askedQs.slice();
 T.ok('fixture has the actual bearer, inactive unanswered ask and canonical definition',body===fixture.bearer&&body!==vid&&!!q?.q&&!G.state.village.conv[vid].active);
 const balance=()=>Object.fromEntries(['health','kcal','water','energy','day','dayTicks','inventory'].map(k=>[k,structuredClone(G.state.scholar[k])]));
 for(let sitting=1;sitting<=5;sitting++){
  const prior=balance(),op=G.startConvo(vid),c=G.state.village.conv[vid];
  T.ok('sitting'+sitting+' retains exact live question and surfaced want',c.want?.fromSeed&&c.pendingQ?.id===qid&&c.want.qid===qid&&c.want.stage===1);
  T.ok('sitting'+sitting+' actually speaks the remembered question',c.transcript.filter(e=>e.who==='them').map(e=>e.text).join(' ').includes(q.q.replace(/^"|"$/g,'')));
  T.ok('sitting'+sitting+' offers answers bound to that same question',(op.choices||[]).some(x=>x.id.startsWith('ans:'+qid+':')&&!x.id.includes('honest_pass')));
  T.ok('sitting'+sitting+' does not duplicate asked identities',JSON.stringify(c.askedQs)===JSON.stringify(oldAsked));
  if(sitting<5){
   G.convoTurn(vid,'leave');
   T.ok('sitting'+sitting+' leaves exact unanswered seed',G.state.village.convoSeeds[vid]?.qid===qid&&!c.active);
   const expected={...prior,kcal:prior.kcal-10,dayTicks:prior.dayTicks+1};
   T.ok('sitting'+sitting+' keeps real10-kcal/one-tick Talk and other resources',JSON.stringify(balance())===JSON.stringify(expected)&&G.villagerId===body);
   // Native save serializes state without live functions; test the next sitting
   // after that boundary rather than retaining a live want.def closure.
   G.state=JSON.parse(JSON.stringify(G.state));
  }else{
   const answer=(op.choices||[]).find(x=>x.id.startsWith('ans:'+qid+':')&&!x.id.includes('honest_pass'));
   if(answer){G.convoTurn(vid,answer.id);G.convoTurn(vid,'leave');}
   T.ok('actual final answer resolves rather than reseeding',!!answer&&!G.state.village.conv[vid].pendingQ&&!G.state.village.convoSeeds[vid]);
  }
 }
 // The exception is a saved unanswered question, not permission to repeat all
 // flavor. Both the preflight and actual emission still block ordinary filler.
 const c=G.state.village.conv[vid],line='"The kettle smells like pine needles."';
 c.saidLinesConvo=[];G.sayLine(vid,line);const n=c.transcript.length;
 T.ok('ordinary repeat remains detectable',G.convoWouldBlock(vid,line));
 G.sayLine(vid,line);
 T.ok('ordinary repeat is not emitted verbatim',!c.transcript.slice(n).some(e=>e.text===line));
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
