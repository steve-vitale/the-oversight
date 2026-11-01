'use strict';
const K=require('./lib'),T=K.reporter('Calendar survival pressure');
(async()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:12});let s,pg;
 function fresh(day){K.newRun(G);s=G.state.scholar;s.day=day;s.kcal=2400;s.hydration=100;pg=G.progState();G.state.systemArrived=true;}
 fresh(109);G.overtimeTick();T.ok('no calendar state or pressure before the warning',!G.state.longSurvival&&G.survivalPressureTier()===0);
 s.day=110;G.overtimeTick();T.ok('warning arrives before pressure without announcing a Table',G.state.longSurvival.warned&&!pg.tableAnnounced&&G.survivalPressureTier()===0);
 s.day=119;G.overtimeTick();T.ok('pre-onset survival retains tier zero',G.overtimeTier()===0);
 s.day=120;G.overtimeTick();T.ok('missing Table deeds do not bypass day120 pressure',G.tableSeat().seat==='none'&&!G.overtimeActive()&&G.overtimeTier()===1);
 const events=K.teleEvents(G,'survival_pressure_tier').length;G.overtimeTick();T.ok('repeated tick is idempotent within a tier',K.teleEvents(G,'survival_pressure_tier').length===events);
 s.day=150;G.overtimeTick();T.ok('day150 reaches tier5 without a Table announcement',G.overtimeTier()===5&&!pg.tableAnnounced);
 const at150=G.overtimeMonsterPressure('hummice');T.ok('even staying in lower waves cannot evade calendar monster pressure',at150&&at150.hpMult===2.25&&at150.damageMult===1.6);
 s.day=180;G.overtimeTick();const at180=G.overtimeMonsterPressure('hummice');T.ok('day180 is harsher than150',G.overtimeTier()===9&&at180.hpMult>at150.hpMult&&at180.damageMult>at150.damageMult);
 s.day=187;T.ok('pressure keeps rising after180 instead of capping at six',G.overtimeTier()===10);
 s.day=600;const late=G.overtimeMonsterPressure('hummice');T.ok('extreme late age keeps increasing strength while pack additions stay bounded',late.tier>10&&late.hpMult>at180.hpMult&&late.packExtra===3);
 const raid=G.overtimeRaidKnobs();T.ok('late raids grow hungrier without a Table unlock',raid&&raid.gorge>1&&raid.skip===0&&raid.cooldown===3);
 T.ok('the calendar is a hazard, not an automatic ending',!G.over&&!G.won&&!pg.tableDone);
 T.ok('titan and campaign fights retain authored mechanics',G.overtimeMonsterPressure('herald')===null&&G.overtimeMonsterPressure('network_heart')===null);
 G.save();const key=G.state.runKey;T.ok('actual Continue preserves age and announced tier',G.load(key)&&G.state.scholar.day===600&&G.survivalPressureTier()>10);
 pg=G.progState();pg.tableDone=true;T.ok('taking the seat stops calendar pressure during the ending',G.survivalPressureTier()===0);

 fresh(149);G.state.titans=G.state.titans||{};G.state.titans.slain={herald:true,nielsen:true,finale:true};
 T.ok('calendar alone does not reveal the Easter egg before its day150 milestone',!G.networkKeyReady());
 s.day=150;T.ok('day150 plus the three real titan victories opens the existing boss road',G.networkKeyReady());
 delete G.state.titans.slain.finale;T.ok('calendar age never substitutes for a required titan victory',!G.networkKeyReady());G.state.titans.slain.finale=true;
 G.overtimeTick();T.ok('actual daily pressure tick summons the existing nine-node map boss',G.networkCampaign().summoned&&G.worldMonsters().filter(m=>m.networkNode).length===9);
 T.ok('summoning never grants the earned human-ending key',!pg.networkFallen);

 fresh(150);const target=G.state.village.roster.find(id=>id!==G.villagerId),def=G.data.monsters.find(m=>m.id==='hummice'),data=JSON.stringify(def),monster={hp:5000,maxHp:10000};
 const rec=G.fieldFight(target,def,monster,{rng:()=>0.5});T.ok('NPC world fights receive the same real calendar HP/damage/pack coefficients',rec.pressure?.tier===5&&rec.pressure.hpMult===at150.hpMult&&rec.pressure.damageMult===at150.damageMult&&rec.packCount===(def.pack||1)+at150.packExtra);
 T.ok('a persistent monster is converted to its pressure scale once',monster.survivalHpMult===2.25&&monster.maxHp===22500);
 const remaining=monster.hp;G.fieldFight(target,def,monster,{rng:()=>0.5});T.ok('repeated NPC encounters do not multiply surviving monster HP again',monster.hp<=remaining&&monster.maxHp===22500);
 T.ok('shared monster data is not mutated by a pressured field fight',JSON.stringify(def)===data);
 const arena=G.fieldFight(target,def,null,{rng:()=>0.5,noFlee:true});T.ok('authored sealed NPC arena is not silently rescaled as a world encounter',!arena.pressure);

 fresh(150);K.fight(G,'hummice');const f=G.tbfight,foes=f.fighters.filter(x=>x.kind==='monster');T.ok('actual public fight start applies calendar reruns below wave4',f.otTier===5&&foes.every(x=>x.otTier===5&&/RERUN ×5/.test(x.name)));
 T.ok('rerun pack additions respect the bounded physical grid',foes.length===(def.pack||1)+at150.packExtra);
 const player=G.tbFighter('p');player.hp=1000;player.maxHp=1000;G.tbDamage('p',100,'prepared monster hit',foes[0].key,{undodgeable:true});
 T.ok('calendar damage multiplier lands through the real tactical damage funnel',1000-player.hp===160,1000-player.hp);
 fresh(119);G.state.village.pantry=[{name:'Prepared supplies',units:200,kcalEach:1000,safe:true,spoilDay:9999}];G.endDay();
 T.ok('the actual endDay path announces calendar pressure without a Table',G.state.scholar.day===120&&G.state.longSurvival?.announcedTier===1&&!G.progState().tableAnnounced);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
