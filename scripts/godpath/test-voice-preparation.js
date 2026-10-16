'use strict';
const K=require('./lib'),T=K.reporter('voice-preparation'),V=require('../policies/voice-preparation'),C=require('../policies/capable'),L=require('../policies/livelihood');
(async()=>{
 const G=await K.load({seed:7});let s,v,ctx,id;
 function fresh(candidate=true){G.tbfight=null;G.over=false;K.newRun(G);ctx={notes:[]};(candidate?V['capable-voice-ready']:C.capable).setup(G,ctx);s=G.state.scholar;v=G.state.village;s.day=85;s.health=100;s.kcal=2000;s.grounding=100;s.inventory=[];s.abilities=[];s.godhood={active:['voice_of_the_relay'],recognized:{voice_of_the_relay:85}};G.state.systemArrived=true;id=v.roster.find(x=>x!==G.villagerId);for(const x of v.roster)v.trust[x]=100;}
 fresh();C.godDay(G,ctx);T.ok('opt-in policy declines a daily cast with no living social need',s.kcal===2000&&s.grounding===100&&v.voiceDay!==85);
 v.trust[id]=80;C.godDay(G,ctx);T.ok('actual social cast pays full price and obeys progressive trust80→81',s.kcal===1850&&s.grounding===95&&v.voiceDay===85&&v.trust[id]===81);
 C.godDay(G,ctx);T.ok('paid daily gate prevents another policy charge',s.kcal===1850&&s.grounding===95);
 fresh();v.trust[id]=90;C.godDay(G,ctx);T.ok('ordinary plus-two cannot justify a cast in the extraordinary-only trust band',s.kcal===2000&&s.grounding===100&&v.trust[id]===90&&v.voiceDay!==85);
 fresh(false);C.godDay(G,ctx);T.ok('default policy retains its original unconditional daily choice',s.kcal===1850&&s.grounding===95&&v.voiceDay===85&&!ctx.godDayIntent&&!ctx.beforeKnownFight);
 fresh();T.ok('known encounter preparation pays without creating a fight',ctx.beforeKnownFight(G,{kind:'deed',monster:'review_drone'})&&s.kcal===1850&&s.grounding===95&&!G.tbfight);
 const m=K.fight(G,'review_drone',{px:3,py:4,mx:4,my:4,hp:100}),p=G.tbFighter('p');T.ok('the real later constructor consumes the prepared same-day word',p._gvVoiced&&p.rallyBuff===3&&v.voiceDay===85);
 T.ok('preparation refuses during the actual live fight',!ctx.beforeKnownFight(G,{kind:'deed'})&&s.kcal===1850&&s.grounding===95);
 fresh();s.kcal=1109;T.ok('planned cast cannot spend below the retained forty-percent bank reserve',!ctx.beforeKnownFight(G,{kind:'deed'})&&s.kcal===1109&&s.grounding===100);
 s.kcal=1110;T.ok('a cast funded exactly at the post-price reserve can proceed',ctx.beforeKnownFight(G,{kind:'deed'})&&s.kcal===960&&s.grounding===95);
 fresh();s.grounding=79;T.ok('humanity cost cannot cross the full-conversion threshold',!ctx.beforeKnownFight(G,{kind:'raid'})&&s.kcal===2000&&s.grounding===79);
 s.grounding=80;T.ok('exactly funded humanity preserves the actual75 boundary',ctx.beforeKnownFight(G,{kind:'raid'})&&s.grounding===75);
 fresh();T.ok('an unknown encounter request grants no cast',!ctx.beforeKnownFight(G,{kind:'invented'})&&s.kcal===2000&&v.voiceDay!==85);
 fresh();s.godhood.active=[];T.ok('absent public god action grants no cast',!ctx.beforeKnownFight(G,{kind:'deed'})&&s.kcal===2000);
 fresh();v.roster.push('unknown-person');v.trust['unknown-person']=0;C.godDay(G,ctx);T.ok('phantom social need cannot finance a daily cast',s.kcal===2000&&v.voiceDay!==85);
 fresh();v.trust[id]=null;C.godDay(G,ctx);T.ok('unknown trust is not invented social need',s.kcal===2000&&v.voiceDay!==85);
 fresh();const person=G.getPerson(id);person.dead=true;v.trust[id]=0;C.godDay(G,ctx);T.ok('dead social target cannot finance a daily cast',s.kcal===2000&&v.voiceDay!==85);person.dead=false;
 fresh();const calls=[],use=G.useAbility,help=G.callForHelp;G.state.networkLive=true;const other=G.state.otherVillages[0];G._formLink(other.id,{},null);G.linkWith(other.id).trust=70;G.raiseAidCrisis('Prepared raiders',1);G.aidCrisis().raiders=true;
 G.useAbility=function(a,b){if(a==='god'&&b==='be_heard')calls.push('word');return use.apply(this,arguments);};G.callForHelp=function(){calls.push('help');return help.apply(this,arguments);};try{C.raidCall(G,ctx);}finally{G.useAbility=use;G.callForHelp=help;}
 T.ok('real raid policy pays the word before its existing help action',calls[0]==='word'&&calls[1]==='help'&&v.voiceDay===85&&G.aidCrisis().calls.length>0,JSON.stringify(calls));
 for(const base of [C.capable,L.maker,L.merchant,L.caregiver]){const variant=V[base.id+'-voice-ready'];T.ok(base.id+' cohort inherits its exact work, fights, pending choices and contests',variant.upkeep===base.upkeep&&variant.daily===base.daily&&variant.fight===base.fight&&variant.pending===base.pending&&variant.contest===base.contest);}
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
