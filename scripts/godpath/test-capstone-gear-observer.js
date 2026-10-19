'use strict';
const K=require('./lib'),A=require('../gear-usage-audit'),T=K.reporter('capstone-gear-observer');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||7),narration:true}),o=A.install(G);
 let s,v,id;
 const kit=['trophy_room','bloodhound','lucky_rock','static_toss'];
 function fresh(){G.tbfight=null;G.over=false;G.won=false;K.newRun(G);s=G.state.scholar;v=G.state.village;id=v.roster.find(x=>x!==G.villagerId&&G.npcAge(x)>=18);s.day=85;s.kcal=6000;s.health=100;s.backgroundAbilities=[];s.abilities=kit.map(id=>({id,level:1}));s.godhood={active:[],recognized:{}};s.equipped={};v.roster=[G.villagerId,id];v.party=[];v.followers=[];v.health={[id]:100};v.npcAbilities={[id]:kit.slice()};v.npcGodhood={};v.pantry=[{name:'Prepared stores',units:200,kcalEach:500,safe:true,spoilDay:9999}];G.npcNeeds(id).hunger=0;G.state.systemArrived=true;G.recognizeClass('player');G.recognizeClass(id);}
 function playerHunt(){const roster=v.roster;v.roster=[];s.mx=0;s.my=0;s.monster={id:'moderator',mx:1,my:0};G.startCombat('moderator');const m=G.tbfight.fighters.find(x=>x.kind==='monster');G.tbDamage(m.key,10000,'prepared real killing blow','p',{undodgeable:true});G.tbEndCheck();v.roster=roster;}
 function npcHunt(){G.getPerson(id).items=['godslayer_spear','commanders_coat'];G.state.villagerTricks={moderator:true};const m=G.data.monsters.find(x=>x.id==='moderator');return G.fieldFight(id,m,{hp:160,maxHp:160},{intent:'fight',rng:()=>0.99});}
 const gifts=(start,who)=>o.grants.slice(start).filter(g=>g.id==='apex_bow'&&g.who===who);
 const units=gs=>gs.reduce((n,g)=>n+g.n,0);
 fresh();playerHunt();T.ok('actual solo kill earns the player hunt',!!v.godpathDeeds?.[G.villagerId]?.apex_hunt);
 const start=o.grants.length,hash=A.gameplayHash(G.state);o.sample();T.ok('sampling a ready build neither grants a gift nor changes Game state',A.gameplayHash(G.state)===hash&&!s.inventory.some(x=>x.itemId==='apex_bow'));
 G.checkPlayerGodhoodAscension();T.ok('actual direct ceremony grants the earned player bow',s.godhood.active.includes('apex_predator')&&s.inventory.some(x=>x.itemId==='apex_bow'));
 T.ok('direct ceremony records exactly one player capstone with actual gear tier',units(gifts(start,'player'))===1&&gifts(start,'player').every(g=>g.source==='capstone'&&g.gear&&g.tier===4));
 G.checkPlayerGodhoodAscension();T.ok('repeat player ceremony adds no acquisition',units(gifts(start,'player'))===1);
 fresh();const result=npcHunt();T.ok('real living NPC field kill earns its own hunt',result.outcome==='vKill'&&result.vHpLeft>0&&!!v.godpathDeeds?.[id]?.apex_hunt);
 const ns=o.grants.length;G.checkVillagerGodhoodAscension(id);T.ok('actual NPC ceremony gives the bow to that person',v.npcGodhood[id].active.includes('apex_predator')&&G.getPerson(id).items.includes('apex_bow'));
 T.ok('NPC gift is recorded for its canonical recipient, not the bearer',units(gifts(ns,id))===1&&!gifts(ns,'player').length&&gifts(ns,id).every(g=>g.source==='capstone'));
 G.checkVillagerGodhoodAscension(id);T.ok('repeat NPC ceremony adds no acquisition',units(gifts(ns,id))===1);
 fresh();playerHunt();npcHunt();const nested=o.grants.length;s.dayTicks=G.TIME.TICKS_PER_DAY-1;s.actionClock=0;G.dayPart=3;G.doAction('wait');
 T.ok('real outer wait crosses dawn and grants both earned capstones',s.day===86&&s.godhood.active.includes('apex_predator')&&v.npcGodhood[id].active.includes('apex_predator'));
 T.ok('nested player gift has one source, without action duplication',units(gifts(nested,'player'))===1&&gifts(nested,'player').every(g=>g.source==='capstone'));
 T.ok('nested NPC gift has one source, without sibling duplication',units(gifts(nested,id))===1&&gifts(nested,id).every(g=>g.source==='capstone'));
 const before=o.grants.length;G.doAction('wait');T.ok('later ordinary action cannot rediscover already-held gear',!o.grants.slice(before).some(g=>g.id==='apex_bow'));
 T.ok('the observer reports no acquisition errors',!o.errors.length);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
