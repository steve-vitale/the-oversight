'use strict';
const K=require('./lib'),D=require('../policies/garden-daystart'),C=require('../policies/competent'),T=K.reporter('Garden day-start');
(async()=>{
 const G=await K.load({seed:7002});let s,v,p;
 function fresh(){K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;s.dayTicks=0;s.actionClock=0;s.kcal=6000;s.health=100;s.energy=100;s.hydration=100;s.inventory=[];s.levelUpQueue=[];s.abilityChoices=null;G.dayPart=0;v.pantry=[];v.assignments={};v.gardenKeeper=null;G.state.systemArrived=true;G.exitBuilding();G.state.codex.plants.dandelion={level:3,prepKnown:true};p={};G.gardenPlant(p,'dandelion',84);G.map.tiles[4][4].plots=[p];K.giveAbility(G,'green_thumb');}
 const context=()=>({gardenTarget:()=>1});
 fresh();G.enterBuilding();const ctx=context(),kcal=s.kcal,tick=s.dayTicks,left=G.gardenGrowthLeft(p);T.ok('real dawn session uses owned cultivation and pays time/reserve',D.dayStartGarden(G,ctx)&&G.gardenGrowthLeft(p)<left&&s.kcal<kcal&&s.dayTicks>tick&&s.insideHaven);
 const after=JSON.stringify(G.state);T.ok('late callback cannot duplicate original dawn session',!D.lateGarden(G,ctx,'late')&&JSON.stringify(G.state)===after);
 T.ok('late-daily early slot is explicitly inert in a dawn profile',!D.lateGarden(G,ctx,'early')&&JSON.stringify(G.state)===after);
 T.ok('another upkeep cannot reconsider the same completed dawn',!D.dayStartGarden(G,ctx)&&ctx.gardenDaystart.at(-1).reason==='already-considered'&&JSON.stringify(G.state)===after);
 fresh();const low=context();s.kcal=1799;const poor=JSON.stringify(G.state);T.ok('reserve guard refuses without Game mutation',!D.dayStartGarden(G,low)&&JSON.stringify(G.state)===poor);s.kcal=6000;s.dayTicks=128;G.dayPart=1;T.ok('part1 is not mislabeled as dawn',!D.dayStartGarden(G,low)&&low.gardenDaystart.at(-1).reason==='outside-dawn');
 fresh();const contact=context();G.pendingEncounter=true;const blocked=JSON.stringify(G.state);T.ok('pending contact cannot be skipped for dawn work',!D.dayStartGarden(G,contact)&&JSON.stringify(G.state)===blocked);G.pendingEncounter=false;
 fresh();const away=context();G.map.px=3;T.ok('day-start never moves an away bearer home for free',!D.dayStartGarden(G,away)&&G.map.px===3);
 fresh();const recovery=context();C.markRecover(G,recovery);s.health=60;s.hp=10;const flag=process.env.COMPETENT_DIRECTIONAL_FLEE;try{process.env.COMPETENT_DIRECTIONAL_FLEE='1';T.ok('actual recovery guard retains precedence at dawn',!D.dayStartGarden(G,recovery)&&recovery.gardenDaystart.at(-1).reason==='recovery');}finally{if(flag===undefined)delete process.env.COMPETENT_DIRECTIONAL_FLEE;else process.env.COMPETENT_DIRECTIONAL_FLEE=flag;}
 fresh();const promises=context(),keep=C.keepPromises,oldGrowth=G.gardenGrowthLeft(p);C.keepPromises=(g,c)=>{keep(g,c);g.doAction('wait');};try{D.dayStartGarden(G,promises);}finally{C.keepPromises=keep;}
 T.ok('a real promise-time boundary prevents spending a later part as dawn',promises.gardenDaystart.at(-1).reason==='outside-dawn'&&G.gardenGrowthLeft(p)===oldGrowth);
 T.ok('missed dawn leaves real late work available',D.lateGarden(G,promises,'late'));
 fresh();const died=context(),oldBearer=G.villagerId;C.keepPromises=g=>g.playerDeath('prepared dawn-obligation death');try{D.dayStartGarden(G,died);}finally{C.keepPromises=keep;}
 T.ok('real death/mantle in obligations cannot garden as the replacement body',died.gardenDaystart.at(-1).reason==='obligation-changed-actor-day'&&died._gardenDaystartWorked===undefined&&(G.over||G.villagerId!==oldBearer));
 fresh();const dated=context(),originalDay=s.day;C.keepPromises=g=>{for(let i=0;i<3;i++)g.doAction('wait');g.sleep();};try{D.dayStartGarden(G,dated);}finally{C.keepPromises=keep;}
 T.ok('actual sleep/dawn in obligations does not spend the replacement day',s.day>originalDay&&dated.gardenDaystart.at(-1).reason==='obligation-changed-actor-day'&&!dated._gardenDaystartWorked);
 fresh();const flow=context(),order=[],waitNpc=[],cast=G.cultivateGarden,action=G.doAction,turn=G.villagerTurn;let npcTurns=0;const profile=D.profiles.find(p=>p.id==='garden-invest-daystart');profile.setup(G,flow);flow.gardenTarget=()=>1;G.cultivateGarden=function(...args){order.push({kind:'cast',tick:s.dayTicks,part:this.dayPart});return cast.apply(this,args);};G.doAction=function(name,...args){const beforeNpc=npcTurns;if(name==='wait')order.push({kind:'wait',tick:s.dayTicks,part:this.dayPart});const result=action.call(this,name,...args);if(name==='wait')waitNpc.push(npcTurns-beforeNpc);return result;};G.villagerTurn=function(...args){npcTurns++;return turn.apply(this,args);};
 try{profile.upkeep(G,flow);G.doAction('wait');G.doAction('wait');G.doAction('wait');}finally{G.cultivateGarden=cast;G.doAction=action;G.villagerTurn=turn;}
 T.ok('actual capable upkeep executes paid cultivation before driver Wait',order[0]?.kind==='cast'&&order[0].tick<128&&order[0].part===0&&order.filter(x=>x.kind==='wait').length===3);
 T.ok('each of the three public Waits still executes real individual NPC turns',waitNpc.length===3&&waitNpc.every(n=>n>=1));
 T.ok('dawn profiles are registered separately from late/early controls',D.profiles.length===2&&D.profiles.every(p=>require('../sweep-compare').POLICY_REGISTRY[p.id]===p)&&require('../sweep-compare').POLICY_REGISTRY['garden-invest-early'].id==='garden-invest-early');
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
