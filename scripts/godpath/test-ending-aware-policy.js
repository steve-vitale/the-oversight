'use strict';
const K=require('./lib'),T=K.reporter('Ending-aware public treatment'),E=require('../policies/ending-aware');
(async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:12});
 function ready(hp=40){K.newRun(G);const s=G.state.scholar;s.health=hp;s.kcal=2400;G.learnSkill('wound_care',2,'prepared test');s.prog=s.prog||{};s.prog.sentimentTaught=true;s.prog.feastSurge=1.5;G.grantFeastBuff({quality:1,served:[{itemId:'foraged_food',kcal:1800}],guests:['a','b','c']});G.driveOffFeastDraw();G.activatableAbilities();return s;}
 let s=ready(),ctx={},before=s.kcal;E.play(G,ctx);
 T.ok('learned public noncombat care actually heals and pays the full bill',s.health===70&&before-s.kcal===140);
 T.ok('real landed bonus earns the deed; controller never writes it',s.prog.feastSurgeUsed===true&&s.feastBuff.use.kind==='healing'&&ctx.endingAwareness.powerUses===1);
 const key=G.state.runKey;G.save();T.ok('whole Continue preserves the actual engine healing receipt',G.load(key)&&G.state.scholar.feastBuff.use.kind==='healing'&&G.state.scholar.prog.feastSurgeUsed);
 s=ready(100);before=JSON.stringify(G.state);E.play(G,{});T.ok('healthy bearer is not harmed or charged to manufacture a deed',JSON.stringify(G.state)===before);
 s=ready(G.maxHealth()-20);before=JSON.stringify(G.state);E.play(G,{});T.ok('base-only healing opportunity does not farm the deed',JSON.stringify(G.state)===before);
 s=ready();s.kcal=1339;before=JSON.stringify(G.state);E.play(G,{});T.ok('full activation bill must leave the personal1200 kcal reserve',JSON.stringify(G.state)===before);
 s=ready();s.fieldMedDayPart=`${s.day}-${G.dayPart}`;before=JSON.stringify(G.state);E.play(G,{});T.ok('actual skill-sheet cooldown refuses without cost',JSON.stringify(G.state)===before);
 s=ready();s.prog.feastSurgeUsed=true;before=JSON.stringify(G.state);E.play(G,{});T.ok('completed deed causes no extra healing or feasting',JSON.stringify(G.state)===before);
 s=ready();G.state.codex.skills={};before=JSON.stringify(G.state);E.play(G,{});T.ok('controller does not invent an unknown treatment',JSON.stringify(G.state)===before);
 const profiles=E.profiles();T.ok('all four experimental profiles are registered separately from their parents',profiles.map(p=>p.id).join(',')==='ending-aware-capable,ending-aware-maker,ending-aware-merchant,ending-aware-caregiver');
 function surplus(){K.newRun(G);s=G.state.scholar;s.day=85;s.health=100;s.kcal=2400;s.insideHaven=true;G.dayPart=2;const v=G.state.village;G.map.px=v.px??4;G.map.py=v.py??4;v.pantry=[{itemId:'foraged_food',name:'Prepared surplus',units:60,kcalEach:1000,spoilDay:9999,kg:0.1,safe:true}];v.sick={};v.health={};v.away={};for(const id of v.roster){v.trust[id]=80;G.npcNeeds(id).hunger=10;}s.prog=s.prog||{};s.prog.sentimentTaught=true;s.prog.feastSurge=1.5;}
 surplus();const pantry=G.pantryKcal(),old=process.env.COMPETENT_SURPLUS_FEAST;ctx={};E.play(G,ctx);
 T.ok('no personal donation quota blocks a real paid communal surplus feast',ctx.endingAwareness.feasts===1&&G.pantryKcal()<pantry&&s.feastBuff&&!s.prog.feastSurgeUsed);
 T.ok('experimental reuse restores the prior environment flag exactly',process.env.COMPETENT_SURPLUS_FEAST===old);
 const paid=G.pantryKcal();E.play(G,ctx);T.ok('a healthy bearer neither manufactures injury nor repeats the feast',s.health===100&&G.pantryKcal()===paid&&!s.prog.feastSurgeUsed);
 surplus();G.state.village.pantry=[];E.play(G,{});T.ok('thin communal pantry cannot fund a feast or invent the deed',!s.feastDay&&!s.prog.feastSurgeUsed);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
