'use strict';
const assert=require('assert/strict'),K=require('./lib');
(async()=>{
 const T=K.reporter('village question contracts'),G=await K.load({seed:88107,narration:true});K.newRun(G);
 const v=G.state.village,vid=v.roster.find(id=>id!==G.villagerId),other=v.roster.find(id=>id!==vid&&id!==G.villagerId);
 assert(vid&&other);const entries=Object.values(G.data.characterGen.convo.villageQuestions).flatMap(g=>Object.values(g).flat());
 const intents=new Set(['overview','hunger','supplies','health','care','morale','young','alive']);
 assert.equal(entries.length,18);assert.equal(new Set(entries.map(e=>e.label)).size,18);
 for(const e of entries){assert(intents.has(e.intent));assert.equal(G.convoVillageQuestionIntent(e.label),e.intent);}
 T.ok('All 18 actual village labels have unambiguous explicit semantic contracts',true);
 const snap=JSON.stringify(G.state);for(const e of entries)G.convoVillageQuestionIntent(e.label);assert.equal(JSON.stringify(G.state),snap);
 T.ok('Registry lookup does not change live state',true);
 const c=G.convoGet(vid);const reset=()=>{c.active=true;c.thread=null;c.said={};c.heldBeats=[];c.pendingQ=null;c.genericQ=null;c.reactiveQ=null;c.want=null;c.exchanges=0;c.budget=100;c.askedTopics=[];c.transcript=[];c.choosingSubject=true;delete c.villageQuestionIntent;};
 v.health=v.health||{};for(const id of v.roster){G.npcNeeds(id).hunger=20;G.npcNeeds(id).fear=0;v.health[id]=100;}v.sick={};v.grief=0;v.cheer=0;v.heat={};
 const ask=label=>{reset();c.offeredReplies={'ask:village':label};return G.convoTurn(vid,'ask:village');};
 const hunger=entries.find(e=>e.intent==='hunger').label;
 ask(hunger);assert.equal(c.villageQuestionIntent,'hunger');assert(c.transcript.some(e=>e.who==='you'&&e.text===hunger));assert(c.transcript.some(e=>e.who==='them'&&e.text.includes("haven't seen anyone here going hungry")));
 T.ok('Full turn answers the actual food question and records the exact offered words',true);
 G.npcNeeds(vid).hunger=95;c.said={};assert(G.convoVillageLine(vid).includes("I'm going hungry"));
 T.ok('A single hungry resident is enough, including the speaker',true);
 G.npcNeeds(vid).hunger=20;G.npcNeeds(other).hunger=95;c.said={};assert(G.convoVillageLine(vid).includes('needs food'));assert(!G.convoVillageLine(vid).includes('same as yesterday'));
 T.ok('Follow-up retains food intent instead of reverting to generic village filler',true);
 v.pantry=[{units:0,kcalEach:9999},{units:2,kcalEach:150}];v.pantryKcal=999999;c.said={};c.villageQuestionIntent='supplies';const stock=JSON.stringify(v.pantry),first=G.convoVillageLine(vid);assert(first.includes('300 calories'));assert(!first.includes('9999'));assert.equal(JSON.stringify(v.pantry),stock);
 T.ok('Supply answer counts canonical positive pantry rows without consuming or inventing stock',true);
 v.pantry=[];c.said={};assert(G.convoVillageLine(vid).includes('pantry is empty'));
 v.health[other]=43;ask(entries.find(e=>e.intent==='health').label);assert.equal(c.villageQuestionIntent,'health');assert(c.transcript.some(e=>e.who==='them'&&e.text.includes('hurt or ill')));
 T.ok('Injury question reports an actual patient rather than mood',true);
 v.health[other]=100;v.sick[vid]=true;c.said={};assert(G.convoVillageLine(vid).includes("I'm feeling ill"));
 T.ok('Illness and speaker grammar use the actual current condition',true);
 ask(entries.find(e=>e.intent==='care').label);assert(c.transcript.some(e=>e.who==='them'&&/needs food|feeling ill/.test(e.text)));assert(!v.promises?.[vid]);
 T.ok('Who-needs-help answer names actual needs without silently accepting a favor',true);
 v.grief=10;ask(entries.find(e=>e.intent==='morale').label);assert(c.transcript.some(e=>e.who==='them'&&e.text.includes('grieving')));
 T.ok('Morale question reports current community conditions',true);
 v.fallen=[other];G.npcNeeds(G.villagerId).hunger=100;v.sick={};G.npcNeeds(vid).hunger=20;c.said={};c.villageQuestionIntent='hunger';assert(G.convoVillageLine(vid).includes("haven't seen anyone here going hungry"));
 T.ok('Dead residents and the current bearer are excluded from NPC need reporting',true);
 for(const intent of ['young','alive','unknown','__proto__']){reset();c.villageQuestionIntent=intent;assert.equal(typeof G.convoVillageLine(vid),'string');}
 ask('"A retired village question."');assert.equal(c.villageQuestionIntent,'unknown');assert(c.transcript.some(e=>e.who==='them'&&e.text.includes('not sure about that particular question')));
 T.ok('Unknown cached labels admit uncertainty and unknown intent keys cannot crash the report',true);
 for(const entry of entries){ask(entry.label);assert.equal(c.villageQuestionIntent,entry.intent);}
 T.ok('All 18 offered variants route through the actual full turn handler',true);
 const registry=G.convoVillageQuestionIntent;G.convoVillageQuestionIntent=()=> 'overview';ask(hunger);assert(!c.transcript.some(e=>e.who==='them'&&e.text.includes("haven't seen anyone here going hungry")));G.convoVillageQuestionIntent=registry;
 T.ok('Removing the semantic binding reproduces the original unanswered-food defect',true);
 // The saved words remain authoritative even if current menu generation would
 // now offer a different question. No label/tier/occupation re-generation.
 reset();c.offeredReplies={'ask:village':hunger};const currentLabel=G.convoLabel;G.convoLabel=function(id,key){return key==='village'?'"Everyone still breathing?"':currentLabel.call(this,id,key);};
 G.convoAskTopic(vid,'village');assert.equal(c.villageQuestionIntent,'hunger');G.convoLabel=currentLabel;
 const restored=JSON.parse(JSON.stringify(c));v.conv[vid]=restored;assert.equal(restored.villageQuestionIntent,'hunger');assert(!G.convoVillageLine(vid).includes('same as yesterday'));
 T.ok('Cached wording controls semantics across menu changes and JSON round trips',true);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
