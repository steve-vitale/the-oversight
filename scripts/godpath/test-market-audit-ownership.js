'use strict';
// Real Audit ownership, dawn and Continue. One shared-harness world per process.
const path=require('path'),rootArg=process.argv.indexOf('--root');
const K=rootArg<0?require('./lib'):require(path.resolve(process.argv[rootArg+1],'scripts/godpath/lib'));
const T=K.reporter('market-audit-ownership');
(async()=>{
 const saves=new Map();globalThis.localStorage={getItem:k=>saves.get(k)??null,setItem:(k,v)=>saves.set(k,String(v)),removeItem:k=>saves.delete(k),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:Number(process.env.SEED||7)}),S=globalThis.Scattering;let s,v,id,person;
 function fresh(){G.over=false;G.won=false;G.tbfight=null;K.newRun(G);s=G.state.scholar;v=G.state.village;G.state.systemArrived=true;s.day=85;s.health=100;s.kcal=9000;s.inventory=[];s.prepStash=[];s.equipped={};s.godhood={active:['market_god'],recognized:{market_god:85},marketDebt:3};id=v.roster.find(x=>x!==G.villagerId&&G.npcAge(x)>=18);if(!id)throw Error('Living adult control missing');person=G.getPerson(id);person.items=[];person.stashed=[];person.equipped={};v.npcGodhood={};v.pantry=[];G.stockPantry(G.villageDailyNeed()*5,'Prepared actual stores');}
 function npc(){s.godhood.active=[];s.godhood.marketDebt=0;v.npcGodhood[id]={active:['market_god'],recognized:{market_god:85},marketDebt:3};G.npcNeeds(id).hunger=20;}
 function count(items,key){return(items||[]).filter(x=>(typeof x==='string'?x:x.itemId||x.id)===key).reduce((n,x)=>n+(typeof x==='string'?1:x.units??1),0);}
 fresh();s.inventory=[{itemId:'hardlight_knife',units:1},{itemId:'searcaster',units:1}];G.equip(1,'ranged');const r=G.marketAuditCollect();
 T.ok('player Audit takes the finest worn item instead of a cheaper carried one',r?.took==='searcaster'&&!s.equipped.ranged&&count(s.inventory,'hardlight_knife')===1);
 T.ok('one real payment clears markers and a repeated collection takes nothing',s.godhood.marketDebt===0&&G.marketAuditCollect()===null&&count(s.inventory,'hardlight_knife')===1);
 fresh();s.inventory=[{itemId:'searcaster',units:3},{itemId:'hardlight_knife',units:1}];G.marketAuditCollect();
 T.ok('an Audit takes one physical unit, not an entire valuable stack',count(s.inventory,'searcaster')===2&&count(s.inventory,'hardlight_knife')===1);
 fresh();s.inventory=[{itemId:'searcaster',units:0},{itemId:'hardlight_knife',units:1}];const empty=G.marketAuditCollect();
 T.ok('a zero-unit stack cannot pay the price',empty?.took==='hardlight_knife'&&count(s.inventory,'hardlight_knife')===0);
 fresh();s.inventory=[{itemId:'hardlight_knife',units:1}];s.prepStash=[{itemId:'searcaster',units:1}];G.marketAuditCollect();
 T.ok('personal prep storage cannot hide the finest owned item',count(s.prepStash,'searcaster')===0&&count(s.inventory,'hardlight_knife')===1);
 fresh();s.inventory=[{itemId:'hardlight_knife',units:1}];person.items=['searcaster'];G.marketAuditCollect();
 T.ok('another persons possessions never pay the players bill',count(person.items,'searcaster')===1);
 fresh();s.inventory=[{itemId:'searcaster',units:1}];G.equip(0,'ranged');G.save();const key=G.state.runKey;G.marketAuditCollect();G.load(key);s=G.state.scholar;v=G.state.village;
 T.ok('native saved state retains the actual lost item and settled markers',!s.equipped.ranged&&s.godhood.marketDebt===0);
 fresh();npc();person.items=['searcaster','hardlight_knife'];person.equipped={ranged:{itemId:'searcaster',name:'Searcaster'}};const holderKcal=s.kcal,belly=G.npcNeeds(id).hunger;S.GodVerbs.godDaily(G);
 T.ok('actual NPC dawn takes its highest tier rather than the last item',count(person.items,'searcaster')===0&&count(person.items,'hardlight_knife')===1);
 T.ok('NPC Audit removes the worn copy and leaves no ghost weapon',!person.equipped.ranged&&S.equipment.weaponBonusOf(person,G.data.items,'ranged')===0);
 T.ok('a paid item does not also charge either persons food',G.npcNeeds(id).hunger===belly&&s.kcal===holderKcal);
 fresh();npc();person.items=['searcaster','searcaster','hardlight_knife'];person.equipped={ranged:{itemId:'searcaster'}};S.GodVerbs.godDaily(G);
 T.ok('an NPC spare stays owned but cannot stand in for the lost worn copy',count(person.items,'searcaster')===1&&!person.equipped.ranged);
 fresh();npc();person.items=['hardlight_knife'];person.stashed=['searcaster'];S.GodVerbs.godDaily(G);
 T.ok('the NPCs own stash is included without touching other peoples goods',count(person.stashed,'searcaster')===0&&count(person.items,'hardlight_knife')===1);
 fresh();npc();person.items=[{itemId:'searcaster',units:2},'hardlight_knife'];S.GodVerbs.godDaily(G);
 T.ok('NPC object stacks lose one actual unit through the same price',count(person.items,'searcaster')===1);
 fresh();npc();person.items=['searcaster'];G.save();const npcKey=G.state.runKey;S.GodVerbs.godDaily(G);G.load(npcKey);s=G.state.scholar;v=G.state.village;person=G.getPerson(id);
 T.ok('Continue preserves NPC inventory loss and paid debt',count(person.items,'searcaster')===0&&v.npcGodhood[id].marketDebt===0);
 fresh();s.kcal=6000;const food=G.marketAuditCollect();
 T.ok('empty-handed player pays the authored5000 kcal fallback',food?.took==='5000 kcal'&&s.kcal===1000&&s.godhood.marketDebt===0);
 fresh();npc();S.GodVerbs.godDaily(G);
 T.ok('empty-handed NPC pays the same fallback from its own remaining belly reserve',G.npcNeeds(id).hunger===100&&s.kcal===9000&&v.npcGodhood[id].marketDebt===0);
 fresh();npc();person.items=['searcaster'];person.dead=true;S.GodVerbs.godDaily(G);
 T.ok('a dead stale market holder cannot pay or have its corpse taxed',count(person.items,'searcaster')===1&&v.npcGodhood[id].marketDebt===3);
 fresh();npc();person.items=['searcaster'];v.roster=v.roster.filter(x=>x!==id);S.GodVerbs.godDaily(G);
 T.ok('an absent nonresident is not taxed by Haven dawn',count(person.items,'searcaster')===1&&v.npcGodhood[id].marketDebt===3);
 fresh();s.inventory=[{itemId:'searcaster',units:1}];G.equip(0,'ranged');s.kcal=9000;G.save();G.endDay();s=G.state.scholar;
 T.ok('real endDay invokes the player Audit and removes the actual worn item',s.godhood.marketDebt===0&&!s.equipped.ranged);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
