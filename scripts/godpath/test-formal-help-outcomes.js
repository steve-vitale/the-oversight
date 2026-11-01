'use strict';
const path=require('path'),K=require(process.env.FORMAL_HELP_TEST_ROOT?path.resolve(process.env.FORMAL_HELP_TEST_ROOT,'scripts/godpath/lib.js'):'./lib'),P=require('../lib/conversation-playtest'),T=K.reporter('Formal help outcomes');
(async()=>{
 const G=await K.load({seed:7002});let authored,originalGoal;
 function scene(kind,subject=true){
  K.newRun(G);const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead);
  authored=(G.data.villagers||[]).find(p=>p.id===vid);if(authored){if(originalGoal===undefined)originalGoal=authored.goal;authored.goal='feed';}v.bgGoals={...v.bgGoals,[vid]:'feed'};
  s.day=4;s.dayTicks=0;v.trust[vid]=40;
  G.askAbout(vid,'goal',{inConvo:true});G.discover('promise');
  const made=G.promiseHelp(vid);if(!made?.ok)throw Error('Prepared initial real promise failed');
  if(kind==='kept')G.checkPromises('food',vid,{food:true});
  if(['broken','refused','amends'].includes(kind)){s.day=12;G.checkPromises();if(v.promises[vid]?.kept!=='broken')throw Error('Prepared real expiry failed');}
  if(kind==='refused'){const result=G.promiseHelp(vid);if(result?.ok||v.promises[vid])throw Error('Prior refusal was not real');}
  if(kind==='amends'){const result=G.makeAmends(vid);if(!result?.ok)throw Error('Prepared actual amends failed');}
  G.startConvo(vid);const c=G.convoGet(vid);
  // Explicit isolated idle/subject checkpoint. We never inject a choice or
  // dispatch an unoffered handler; the complete live menu owns eligibility.
  Object.assign(c,{want:null,thread:null,pendingQ:null,genericQ:null,reactiveQ:null,heldAsk:null,heldBeats:[],windingDown:false,choosingSubject:subject,offeredHelp:false,goalOpenedUp:true});
  return{v,s,vid,c};
 }
 try{
  for(const subject of[true,false])for(const kind of['kept','broken','amends','open']){
   const x=scene(kind,subject),before=JSON.stringify(x.v.promises[x.vid]),menu=P.offers(G,x.vid),offered=menu.some(o=>o.id==='offer_help');
   T.ok((subject?'subject':'idle')+' '+kind+' uses open rather than any promise as its gate',offered===(kind!=='open'));
   T.ok('query preserves '+kind+' promise in '+(subject?'subject':'idle'),JSON.stringify(x.v.promises[x.vid])===before);
   if(offered&&kind!=='broken'){
    const r=P.choose(G,x.vid,'offer_help');
    T.ok(kind+' actual offered renewal creates one current open vow',x.v.promises[x.vid]?.kept===false&&x.v.promises[x.vid].maker===G.villagerId&&x.v.promises[x.vid].day===x.s.day&&/thank you/i.test(r.line));
   }
   if(offered&&kind==='broken'){
    const r=P.choose(G,x.vid,'offer_help');
    T.ok('broken offered renewal is an honest refusal',!x.v.promises[x.vid]&&/not again/i.test(r.line)&&!/thank you|means something|won.t forget/i.test(r.line));
   }
  }
  {
   const x=scene('refused'),beforeTrust=x.v.trust[x.vid],offered=P.offers(G,x.vid).some(o=>o.id==='offer_help');
   T.ok('a previous real refusal exposes the known formal help verb',offered);
   if(offered){const resolve=G.resolveConsequence,calls=[];let r;G.resolveConsequence=function(vid,consequence){const applied=resolve.apply(this,arguments);calls.push({vid,consequence:structuredClone(consequence),applied:structuredClone(applied)});return applied;};try{r=P.choose(G,x.vid,'offer_help');}finally{G.resolveConsequence=resolve;}
    T.ok('actual no-entry refusal cannot become grateful acceptance',!x.v.promises[x.vid]&&/not again/i.test(r.line)&&!/thank you|means something|won.t forget/i.test(r.line));
    const words=calls.filter(c=>c.consequence.name==='offer_help');
    T.ok('existing nominal words contract uses the real applied delta and talk cap',words.length===1&&words[0].consequence.trust===2&&words[0].consequence.temper==='kind'&&words[0].consequence.talk!==false&&x.v.trust[x.vid]-beforeTrust===words[0].applied.trust&&x.v.trust[x.vid]<=40,JSON.stringify({beforeTrust,afterTrust:x.v.trust[x.vid],words}));
    T.ok('an attempted offer is spent rather than repeatable trust farming',x.c.offeredHelp&&!P.offers(G,x.vid).some(o=>o.id==='offer_help'));
   }
  }
  {
   const x=scene('kept');delete x.v.goalsKnown[x.vid];x.c.goalOpenedUp=false;x.v.discoveries={};
   T.ok('settled history cannot bypass unknown goal/discovery gates',!P.offers(G,x.vid).some(o=>o.id==='offer_help'));
  }
  {
   const x=scene('kept'),old=structuredClone(x.v.promises[x.vid]);
   if(authored)authored.goal='lead';x.v.bgGoals[x.vid]='lead';G.askAbout(x.vid,'goal',{inConvo:true});
   const offered=P.offers(G,x.vid).some(o=>o.id==='offer_help');T.ok('known unkeepable goal still offers an honest discussion',offered);
   if(offered){const r=P.choose(G,x.vid,'offer_help');T.ok('deflection retains its honest reply and settled history',/fair/i.test(r.line)&&JSON.stringify(x.v.promises[x.vid])===JSON.stringify(old));}
  }
  {
   const x=scene('refused');x.v.trust[x.vid]=40;
   const offered=P.offers(G,x.vid).some(o=>o.id==='offer_help');T.ok('known refusal remains discussable at the words cap',offered);
   if(offered){P.choose(G,x.vid,'offer_help');T.ok('refused offer never bypasses the40 words cap',x.v.trust[x.vid]===40&&!x.v.promises[x.vid]);}
  }
  {
   const x=scene('open'),old=x.v.promises[x.vid],r=G.promiseHelp(x.vid);
   T.ok('direct stale duplicate returns a typed actual refusal without replacing its vow',r?.ok===false&&r.reason==='open-promise'&&/keep the promise/i.test(r.line)&&x.v.promises[x.vid]===old);
   if(authored)authored.goal='';x.v.bgGoals[x.vid]=null;const unknown=G.promiseHelp(x.vid);
   T.ok('unknown goal returns its actual honest boundary rather than null success ambiguity',unknown?.ok===false&&unknown.reason==='unknown-goal'&&unknown.line==="You don't know what they want yet."&&x.v.promises[x.vid]===old,JSON.stringify({goal:G.npcGoal(x.vid),unknown}));
  }
 }finally{if(authored){if(originalGoal===undefined)delete authored.goal;else authored.goal=originalGoal;}}
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
