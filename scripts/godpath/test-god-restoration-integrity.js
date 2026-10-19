'use strict';
const K=require('./lib'),T=K.reporter('god-restoration-integrity');
(async()=>{
 const saves=new Map();globalThis.localStorage={getItem:k=>saves.get(k)??null,setItem:(k,v)=>saves.set(k,String(v)),removeItem:k=>saves.delete(k),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:Number(process.env.SEED||7)});let s,v,id;
 function fresh(god=null){G.tbfight=null;G.over=false;G.won=false;K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;s.health=100;s.kcal=3000;s.abilities=[];s.backgroundAbilities=[];s.inventory=[];s.equipped={};s.godhood={recognized:god?{[god]:85}:{},active:god?[god]:[]};G.state.systemArrived=true;id=v.roster.find(x=>x!==G.villagerId&&G.npcAge(x)>=18);v.party=[];v.followers=[];v.npcAbilities={};v.npcSynergies={};v.npcGodhood={};v.health={};G.npcNeeds(id).hunger=0;v.pantry=[];G.stockPantry(G.villageDailyNeed()*5,'Prepared actual stores');}
 const giveNpc=(god,who=id)=>{v.npcGodhood[who]={active:[god],recognized:{[god]:85}};};
 function mantle(who){const previous=G.villagerId;G.villagerId=who;G.mantleBecome(previous,who);s=G.state.scholar;v=G.state.village;s.kcal=3000;s.health=100;}
 fresh();giveNpc('voice_of_the_relay','not-a-person');
 T.ok('unknown identities cannot hold a playable god',G.holderGod('not-a-person')===null);
 giveNpc('voice_of_the_relay');G.getPerson(id).dead=true;
 T.ok('a dead canonical person cannot lend a god',G.holderGod(id)===null);
 fresh('one_person_army');giveNpc('voice_of_the_relay',G.villagerId);
 T.ok('a stale NPC alias of the bearer cannot become a second god body',G.fighterGod({kind:'villager',key:'alias',villagerId:G.villagerId,hp:100,alive:true})===null);
 giveNpc('one_person_army');
 T.ok('a dead persons echo cannot borrow its personal god',G.fighterGod({kind:'villager',key:'echo',villagerId:id,hp:100,alive:true,_echoed:true})===null);

 fresh('living_garden');G.npcNeeds(id).hunger=60;s.kcal=499;const hungry=G.npcNeeds(id).hunger;
 T.ok('the public god action obeys the eat-first fuel gate before paying',G.useAbility('god','feed_multitude')===false&&s.kcal===499&&G.npcNeeds(id).hunger===hungry);
 s.kcal=500;
 T.ok('an honestly funded Garden pays200 and feeds other people',G.useAbility('god','feed_multitude')===true&&s.kcal===300&&G.npcNeeds(id).hunger===0);
 s.kcal=3000;const key=G.state.runKey;G.save();const loaded=G.load(key);s=G.state.scholar;v=G.state.village;
 T.ok('Continue retains the Garden daily limit',loaded&&G.useAbility('god','feed_multitude')===false&&s.kcal===3000);
 giveNpc('living_garden');mantle(id);
 T.ok('a new persons unused Garden does not inherit the previous bearers daily use',G.useAbility('god','feed_multitude')===true);

 fresh();giveNpc('living_garden');s.kcal=700;const holderFood=G.npcNeeds(id).hunger;globalThis.Scattering.GodVerbs.godDaily(G);
 T.ok('actual NPC Garden feeds the bearer and pays its own belly',s.kcal>700&&G.npcNeeds(id).hunger>holderFood&&v.harvestDay===85);
 mantle(id);const food=s.kcal;
 T.ok('an NPCs spent daily Garden follows that person into the mantle',G.useAbility('god','feed_multitude')===false&&s.kcal===food);

 fresh('one_person_army');const m=K.fight(G,'moderator'),p=G.tbFighter('p');p.mx=4;p.my=4;m.mx=4;m.my=5;m.hp=m.maxHp=10000;
 G.tbDamage('p',30,'prepared hostile wound',m.key,{undodgeable:true});p.acted=false;G.tbfight.order=['p',m.key];G.tbfight.turnIdx=0;
 T.ok('actual public Army fires after a real wound',G.useAbility('god','turn_the_pain',m.key)===true);
 G.save();G.load(G.state.runKey);s=G.state.scholar;const target=G.tbfight.fighters.find(x=>x.kind==='monster'),hp=target.hp,kcal=s.kcal;G.tbFighter('p').acted=false;G.tbfight.turnIdx=G.tbfight.order.indexOf('p');
 T.ok('Continue cannot re-arm the used Army strike',G.useAbility('god','turn_the_pain',target.key)===false&&target.hp===hp&&s.kcal===kcal);

 fresh();giveNpc('undying_ward');v.party=[id];v.health[id]=100;
 const foe=K.fight(G,'moderator',{party:true});const ward=G.tbfight.fighters.find(x=>x.villagerId===id)||G.tbHumanFighter(id,'villager',{mx:4,my:5});
 if(!ward)throw Error('Prepared real Ward fighter must exist');
 ward.hp=9;ward.maxHp=100;ward.alive=true;v.health[id]=9;
 if(!G.tbfight.fighters.includes(ward)){G.tbfight.fighters.push(ward);G.tbfight.order.push(ward.key);}
 const player=G.tbFighter('p'),playerHp=player.hp;G.tbDamage('p',50,'prepared hostile wound',foe.key,{undodgeable:true});
 T.ok('the actual God Ward carries the wound and keeps its authored oneHP floor',player.hp===playerHp&&ward.hp===1);
 T.ok('the carried God wound persists in the canonical NPC health pool',v.health[id]===1);

 fresh();giveNpc('unkillable');v.health[id]=1;const person=G.getPerson(id),registered=[],register=G.registerDeath;
 G.registerDeath=function(rec){registered.push(rec);return register.apply(this,arguments);};
 try{G.hurtVillager(id,999,'monster');}finally{G.registerDeath=register;}
 T.ok('actual world god Phoenix holds or saves its person before death registration',!person.dead&&v.roster.includes(id)&&(v.health[id]>=1||v.dyingLinks?.[id]));
 T.ok('a held Phoenix bearer has no false death or fallen record',!registered.some(x=>x.villagerId===id)&&!(v.fallen||[]).some(x=>x.villagerId===id));
 T.ok('borrowed-life god Phoenix cannot manufacture a personal survival deed',!v.godpathDeeds?.[id]?.death_refused);
 fresh('unkillable');s.health=0;const living=G.phoenixLivingVillagers().length;
 T.ok('god Phoenix cannot bypass a starvation death by burning another person',G.maybeCheatDeath('starvation')===false&&s.kcal===3000&&G.phoenixLivingVillagers().length===living);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
