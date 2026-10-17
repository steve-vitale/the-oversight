// Prepared real deception callers; one seeded shared harness per process.
'use strict';
const K=require('./lib'),T=K.reporter('All-Seeing ambush parity');
(async()=>{
 const saves=new Map();globalThis.localStorage={getItem:k=>saves.get(k)??null,setItem:(k,v)=>saves.set(k,String(v)),removeItem:k=>saves.delete(k),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:7});let s,v,me,id,leader,plots,events,simCalls;const actualSim=G.simNpcAmbush,actualTele=G.tele;
 G.simNpcAmbush=function(p){simCalls++;return actualSim.apply(this,arguments);};
 G.tele=function(e,d){if(e==='god_verb'&&d.verb==='no_lies_ambush')events.push(d);return actualTele.apply(this,arguments);};
 function fresh(){G.over=false;G.won=false;G.tbfight=null;K.newRun(G);s=G.state.scholar;v=G.state.village;me=G.villagerId;[id,leader]=v.roster.filter(x=>x!==me);s.day=85;s.health=100;s.kcal=2400;s.godhood={active:[],recognized:{}};G.state.systemArrived=true;v.roster=[me,id,leader];v.health={[id]:100,[leader]:100};v.npcGodhood={[id]:{active:['all_seeing'],recognized:{all_seeing:85}}};v.pantry=[{name:'Prepared stores',units:200,kcalEach:500,safe:true,spoilDay:9999}];G.npcNeeds(id).hunger=20;plots=[];events=[];simCalls=0;}
 function plot(target=id){const p={id:'sight_'+plots.length,target,leader,inviter:leader,accomplices:[],tells:[],active:true,sprung:false,day:s.day};plots.push(p);G.betrayalState().plots.push(p);return p;}
 const run=p=>G.springAmbush(p),record=()=>v.npcGodhood[id];
 fresh();let p=plot(),r=run(p);T.ok('actual NPC ambush is foiled before ordinary victim simulation',r?.foiled===true&&r.ambush===false&&simCalls===0);T.ok('only the target pays existing60-kcal NPC hunger equivalent',G.npcNeeds(id).hunger===22&&s.kcal===2400);T.ok('foiled plot is terminal and cannot occupy the active plot slot',p.foiled&&p.sprung&&!p.active&&p.resolved);T.ok('telemetry names the real NPC holder',events.length===1&&events[0].who===id);T.ok('private NPC sight does not reveal a plot in the bearer Codex',!(G.state.codex.doubts||[]).some(d=>(d.evidence||[]).some(e=>/No Lies/.test(e))));
 p=plot();r=run(p);T.ok('two same-day deceptive plots use one personal daily payment',r?.foiled&&G.npcNeeds(id).hunger===22);const paid=G.npcNeeds(id).hunger,n=events.length;r=run(p);T.ok('re-entering a settled foiled plot cannot charge or emit twice',r?.foiled&&G.npcNeeds(id).hunger===paid&&events.length===n&&simCalls===0);
 fresh();p=plot();run(p);G.save();const key=G.state.runKey;delete record()._godSightDay;G.load(key);s=G.state.scholar;v=G.state.village;p=plot();r=run(p);T.ok('explicit load restores personal same-day paid sight',r?.foiled&&G.npcNeeds(id).hunger===22&&record()._godSightDay===85);
 s.day++;p=plot();r=run(p);T.ok('a later day pays again before avoiding deception',r?.foiled&&G.npcNeeds(id).hunger===24&&record()._godSightDay===86);
 fresh();delete v.npcGodhood[id];p=plot();r=run(p);T.ok('ordinary NPC plot still uses actual ambush simulation',r?.sim===true&&simCalls===1&&G.npcNeeds(id).hunger===20&&!p.foiled);
 fresh();G.npcNeeds(id).hunger=99;p=plot();r=run(p);T.ok('unfunded NPC sight preserves actual ordinary danger',r?.sim===true&&simCalls===1&&!p.foiled&&!record()._godSightDay&&G.npcNeeds(id).hunger===99);
 fresh();v.pantry=[];p=plot();r=run(p);T.ok('starving community cannot fund NPC sight',!r?.foiled&&simCalls===1&&!record()._godSightDay);
 fresh();p=plot();G.getPerson(id).dead=true;run(p);T.ok('a stale dead god record cannot buy living protection',!p.foiled&&!record()._godSightDay&&G.npcNeeds(id).hunger===20);
 fresh();p=plot();v.health[id]=0;run(p);T.ok('zero-health target cannot buy protection',!p.foiled&&!record()._godSightDay&&G.npcNeeds(id).hunger===20);
 fresh();p=plot();v.roster=v.roster.filter(x=>x!==id);run(p);T.ok('departed holder cannot buy resident protection',!p.foiled&&!record()._godSightDay&&G.npcNeeds(id).hunger===20);
 fresh();s.godhood={active:['all_seeing'],recognized:{all_seeing:85}};p=plot(me);r=run(p);T.ok('existing player protection retains real60-kcal payment',r?.foiled&&s.kcal===2340&&G.npcNeeds(id).hunger===20);T.ok('player foiling retains actual discovery and participant telemetry',events[0]?.who==='player'&&(G.state.codex.doubts||[]).some(d=>d.vid===leader));
 fresh();s.godhood={active:['all_seeing'],recognized:{all_seeing:85}};s.kcal=400;p=plot(me);r=run(p);T.ok('hungry player retains interactive danger and spends no sight food',r?.ambush&&!r.foiled&&s.kcal===400);
 fresh();p=plot();p.active=false;p.sprung=true;p.resolved=true;run(p);T.ok('settled ordinary plot cannot be retroactively foiled',!p.foiled&&!record()._godSightDay&&G.npcNeeds(id).hunger===20);
 fresh();p=plot();for(let i=0;i<20&&p.active;i++)G.npcPlotTick();T.ok('the real scheduled NPC plot caller reaches paid protection',p.foiled&&p.resolved&&simCalls===0&&G.npcNeeds(id).hunger===22);
 fresh();p=plot();run(p);v.trust={[id]:10000};G.playerDeath('prepared sight succession');s=G.state.scholar;v=G.state.village;s.kcal=2000;p=plot(G.villagerId);r=run(p);T.ok('a paid NPC faculty follows that same person into the mantle',G.villagerId===id&&r?.foiled&&s.kcal===2000);
 fresh();s.godhood={active:['all_seeing'],recognized:{all_seeing:85}};run(plot(me));v.trust={[id]:10000};G.playerDeath('prepared separate sight owner');s=G.state.scholar;v=G.state.village;s.kcal=2000;p=plot(G.villagerId);r=run(p);T.ok('a successor cannot borrow the predecessor daily payment',G.villagerId===id&&r?.foiled&&s.kcal===1940);
 fresh();s.godhood={active:['all_seeing'],recognized:{all_seeing:85}};s._godSightDay=85;run(plot(me));T.ok('a legacy player paid-day marker keeps its existing faculty',s.kcal===2400);
 fresh();delete v.npcGodhood[id];s.godhood={active:['all_seeing'],recognized:{all_seeing:85}};p=plot();r=run(p);T.ok('the bearer cannot extend private sight to an ordinary target',r?.sim&&simCalls===1&&s.kcal===2400&&!p.foiled);
 fresh();run(plot());G.npcNeeds(id).hunger=81;p=plot();r=run(p);T.ok('an already-paid NPC faculty still needs a fed holder',r?.sim&&simCalls===1&&!p.foiled&&G.npcNeeds(id).hunger===81);
 fresh();s.godhood={active:['all_seeing'],recognized:{all_seeing:85}};s.health=0;p=plot(me);run(p);T.ok('a zero-health bearer cannot pay for living sight',!p.foiled&&s.kcal===2400);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
