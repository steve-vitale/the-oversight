'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),K=require('./lib'),T=K.reporter('Combined paid endgame policy'),P=require('../policies/endgame-counter-aware'),HC=require('../policies/human-combat');
(async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:12});K.newRun(G);
 // Isolate composition hooks from unrelated livelihood chores, while using
 // actual Game costs, paid treatment and the retained natural rat encounter.
 const parent={id:'integration-probe',desc:'Prepared integration',setup(g,c){c.parentSetup=(c.parentSetup||0)+1;},upkeep(g,c){c.parentUpkeep=(c.parentUpkeep||0)+1;},daily(g,c){c.parentDaily=(c.parentDaily||0)+1;},diagnostics(){return{parentRetained:true};}};
 const p=P.wrap(parent),ctx={};p.setup(G,ctx);
 const s=G.state.scholar;s.health=40;s.kcal=2400;G.learnSkill('wound_care',2,'prepared test');s.prog=s.prog||{};s.prog.sentimentTaught=true;s.prog.feastSurge=1.5;
 G.grantFeastBuff({quality:1,served:[{itemId:'foraged_food',kcal:1800}],guests:['a','b','c']});G.driveOffFeastDraw();G.activatableAbilities();
 p.upkeep(G,ctx);
 T.ok('one composed controller pays actual useful treatment and enables public counterplay',s.health===70&&s.kcal===2260&&s.prog.feastSurgeUsed&&ctx.publicCounterplay===true);
 const before=JSON.stringify(G.state);p.daily(G,ctx);
 T.ok('parent hooks survive composition and a completed deed spends nothing again',ctx.parentSetup===1&&ctx.parentUpkeep===1&&ctx.parentDaily===1&&JSON.stringify(G.state)===before);
 const sample=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(K.ROOT,'evidence/2026-10-23/calendar-merchant99-combat-r1-trace.json.gz')))).starts[0];
 K.restoreCombatCapture(G,{state:sample.state,fight:sample.runtime.tbfight,bearer:sample.state.scholar.villagerId,map:sample.runtime.map,location:sample.state.run.location,dayPart:sample.runtime.dayPart,people:[]});
 let calls=0,last=[];while(G.tbfight&&!G.tbfight.over&&calls<30){last=G.tbfight.fighters.filter(f=>f.kind==='monster');calls++;if(!HC.monsterTurn(G,ctx))break;}
 T.ok('the same composed controller pays all four real counter demands without striking',!G.tbfight&&calls===13&&ctx.monsterCombatCounterAccepted===4&&ctx.monsterCombatCounterWaits===8&&!ctx.monsterCombatStrikeAttempts&&last.every(f=>f.fled&&f.sigStrike.met&&f.hp===f.maxHp));
 const d=p.diagnostics(ctx);
 T.ok('both observation streams and parent diagnostics survive together',d.parentRetained&&d.endingAwareness.powerUses===1&&d.counterAwareness.errors.length===0);
 T.ok('actual contest outcome is earned while no whole-game ending is manufactured',K.teleEvents(G,'contest_end').at(-1)?.outcome==='won'&&!G.won);
 T.ok('all four opt-in profiles are distinct from original experiments and defaults',P.profiles().map(x=>x.id).join(',')==='endgame-counter-aware-capable,endgame-counter-aware-maker,endgame-counter-aware-merchant,endgame-counter-aware-caregiver');
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
