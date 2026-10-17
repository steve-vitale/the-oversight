'use strict';
const K=require('./lib'),T=K.reporter('Explorer empirical testing callers');
(async()=>{const G=await K.load({seed:7});let s,v,me,npc,pid;
 function fresh(){G.over=false;G.won=false;G.tbfight=null;K.newRun(G);s=G.state.scholar;v=G.state.village;me=G.villagerId;npc=v.roster.find(id=>id!==me);v.roster=[me,npc];s.day=85;s.health=100;s.kcal=6000;G.state.systemArrived=true;G.state.codex.plants={};G.state.codex.encounters={};v.familiar={};v.taught={};v.plantKnowledge={};v.sharedKnowledge={};v.wrongAbout={};v.away={};v.health={[npc]:100};pid=G.data.plants.find(p=>p.edibility==='safe').id;s.prepStash=[{name:'Unknown shoots',lump:{[pid]:{units:6,day:85}},units:6,foodState:'unknown',edible:false,spoilDay:100}];v.pantry=[{name:'Prepared stores',units:200,kcalEach:500,safe:true,spoilDay:9999}];}
 const pending=id=>v.godpathFieldDiscoveries?.[id]?.[pid],deed=id=>v.godpathDeeds?.[id]?.field_truth_shared;
 function test(opts){v.roster=[me];G.testCautiously(0,opts,s.prepStash);v.roster=[me,npc];}
 fresh();test();T.ok('the real full cautious protocol identifies and tests an unknown plant',G.plantKnown(pid)&&G.state.codex.plants[pid].tested==='safe');T.ok('personal empirical testing records firsthand discovery',!!pending(me)&&!deed(me));G.startConvo(npc);G.convoTurn(npc,'teach');T.ok('a real subsequent lesson completes that same discovery',deed(me)?.plant===pid&&deed(me)?.recipient===npc);
 fresh();for(let i=0;i<3;i++)globalThis.Scattering.Examine.observePlant(pid,'field');test();T.ok('three real observations plus the short protocol earn personal fieldwork',G.state.codex.plants[pid]?.by==='fieldwork'&&!!pending(me));
 fresh();test({rush:true});T.ok('a real rushed test that earns the name also records its actual discoverer',G.plantKnown(pid)&&!!pending(me));
 fresh();G.testCautiously(99,{},s.prepStash);T.ok('an absent test target invents no discovery',!pending(me));
 fresh();v.roster=[me];G.identifyPlant(pid,'fieldwork');v.roster=[me,npc];T.ok('a direct primitive with a fieldwork label cannot invent fieldwork',!pending(me));
 fresh();G.grantKnowledge('plant',pid,1,{type:'read',by:'Prepared book'});T.ok('a real book grant is knowledge rather than firsthand discovery',G.plantKnown(pid)&&!pending(me));
 fresh();v.roster=[me];G.experimentWith(0,s.prepStash);v.roster=[me,npc];T.ok('an actual unnamed nibble remains partial evidence',!pending(me)&&!G.plantKnown(pid));
 fresh();G.villagerExperimentBeat(true);T.ok('the real public NPC protocol teaches the tester and player',G.plantKnown(pid)&&G.plantKnownBy(npc,pid)&&v.sharedKnowledge[pid]?.testedBy===npc);T.ok('the actual tester earns discovery and a landed public lesson',deed(npc)?.plant===pid&&deed(npc)?.recipient===me&&deed(npc)?.via==='experiment');T.ok('watching someone else test cannot become the player own fieldwork',!pending(me)&&!deed(me));
 fresh();v.familiar[npc]=[pid];G.villagerExperimentBeat(true);T.ok('testing something the NPC already knew does not backfill discovery',!pending(npc)&&!deed(npc));
 fresh();G.villagerExperimentBeat(false);T.ok('an absent public experiment cannot invent personal work',!pending(npc)&&!deed(npc)&&!G.plantKnown(pid));
 T.done();})().catch(e=>{console.error(e.stack);process.exitCode=1;});
