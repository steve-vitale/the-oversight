'use strict';
// One shared harness; exercise the canonical browser namespace, never a fake Game global.
const path=require('path'),K=process.argv[2]?require(path.join(path.resolve(process.argv[2]),'scripts/godpath/lib')):require('./lib'),T=K.reporter('browser-game-namespace');
(async()=>{
 const G=await K.load({seed:221031}),S=globalThis.Scattering;K.newRun(G);
 T.ok('shared harness exposes only the real Scattering.Game namespace',!Object.hasOwn(globalThis,'Game')&&S.Game===G);
 // A failing control for the old harness: remove its alias before exercising
 // functions. The actual browser has no alias; old hooks must not pass because
 // the test environment secretly supplies one.
 delete globalThis.Game;
 const hooks=['combatBondGet','combatBondAdd','noteSharedFight','noteBondGrief','noteCrewTogether','bondCombatBonus','pathAnchor','villageBondBonus','villageBondGrowth','noteVillageBondFight','noteVillageBondGrief','noteShieldbearerOffer','isNewcomer','findVeteranBuddy'];
 T.ok('all authored party-bond hooks attach to the actual Game',hooks.every(k=>typeof G[k]==='function'&&G[k]===S.PartyBond[k]));
 const v=G.state.village,s=G.state.scholar,[a,b]=(v.roster||[]).filter(id=>id!==G.villagerId&&!G.vpOf(id).dead).slice(0,2);if(!a||!b)throw Error('Prepared pair unavailable');
 const key=G.bondKey(a,b);v.bonds={};G.combatBondAdd?.(a,b,4);
 T.ok('bond writer persists to the canonical village without a global alias',v.bonds[key]?.combat===4&&G.combatBondGet?.(a,b)===4);
 G.noteSharedFight?.([a,b]);T.ok('existing shared-fight practice adds its authored four points',v.bonds[key]?.combat===8);
 v.bonds={};v.assignments={};v.taskLeads={};v.party=[];v.health=v.health||{};v.health[a]=v.health[b]=100;v.trust=v.trust||{};v.trust[a]=v.trust[b]=80;
 G.assignTask(a,'forage',{via:'in-person'});G.assignTask(b,'forage',{via:'in-person'});
 T.ok('prepared outdoor crew is assigned through actual task methods',v.assignments[a]?.task==='forage'&&v.assignments[b]?.task==='forage');
 G.resolveAssignments();T.ok('actual assignment resolution records crew practice',v.bonds[key]?.combat>=1);
 const spoken=[],original=G.convoSpeakLine,pid=G.apPersonas()[0].id;G.convoSpeakLine=function(...args){spoken.push({self:this,args});return 'canonical-hook';};
 T.ok('alien speech delegates to its actual receiver',G.apSpeak(pid,'"Hello."')==='canonical-hook'&&spoken.length===1&&spoken[0].self===G&&spoken[0].args[0]==='ap:'+pid&&spoken[0].args[1]==='"Hello."');
 const beforeEmpty=spoken.length;T.ok('empty alien speech never invokes the hook',G.apSpeak(pid,'')==='empty'&&spoken.length===beforeEmpty);delete G.convoSpeakLine;
 T.ok('missing speech hook returns its honest no-hook status',G.apSpeak(pid,'"Hello."')==='no-hook');G.convoSpeakLine=original;
 T.ok('the actual persona voice pipeline reaches its normal gate', ['off','muted','locked'].includes(G.apSpeak(pid,'Hello.')));
 const GH=S.Godhood,god=GH.byId('voice_of_the_relay');s.villagerId=G.villagerId;
 const legacy={...god,requires:{...god.requires,deed:undefined,deedAlt:'relay_office',synergies:[]}};G.state.switchboard={holderId:G.villagerId};
 T.ok('legacy Relay-office fallback reads the actual canonical state',GH.godhoodCloseness(s,legacy,85).synergy);
 G.state.switchboard.holderId=b;T.ok('another holder cannot lend the player their office',!GH.godhoodCloseness(s,legacy,85).synergy);
 T.ok('no operation recreates the fake Game global',!Object.hasOwn(globalThis,'Game'));T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
