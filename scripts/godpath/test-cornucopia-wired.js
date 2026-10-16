'use strict';
const K=require('./lib'),T=K.reporter('cornucopia-wired');
(async()=>{
 const saves=new Map();global.localStorage={getItem:k=>saves.get(String(k))??null,setItem:(k,v)=>saves.set(String(k),String(v)),removeItem:k=>saves.delete(String(k)),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:7}),BA=globalThis.Scattering.buildarounds;let s,v,me,npc,t;
 const fixed=fn=>{const rnd=Math.random;Math.random=()=>0.5;try{return fn();}finally{Math.random=rnd;}};
 function fresh(cornu=true){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;v=G.state.village;me=G.villagerId;npc=v.roster.find(id=>id!==me&&G.npcAge(id)>=18);K.openSlots(G,6);s.abilities=[];s.inventory=[];s.kcal=10000;s.insideHaven=false;s.day=20;G.state.systemArrived=true;G.map.px=5;G.map.py=4;s.mx=4;s.my=4;G.genDetail(5,4);t=G.playerTile();t.type='grove';t.stock=1000;t.maxStock=1000;t.vigor=100;v.positions={};v.pantry=[];v.sick={};G.state.codex.plants.dandelion={level:2,prepKnown:true};if(cornu)K.giveAbility(G,'cornucopia');patch();}
 function patch(cell='plant'){t.detail=Array.from({length:9},()=>Array(9).fill('grass'));t.detail[4][4]=cell;t.plantSpecies={'4,4':'dandelion'};t.modifiers={};t.detailRegrow={};t.stock=1000;t.vigor=100;}
 const units=()=>s.inventory.reduce((n,i)=>n+(i.plantId==='dandelion'?i.units||0:i.lump?.dandelion?.units||0),0);
 const gather=()=>{patch();const before=units();fixed(()=>G.doAction('forage'));return units()-before;};
 fresh(false);const base=gather();T.ok('control uses the real sweep and yields six known units',base===6,base);
 T.ok('a nonholder creates no canonical streak',!v.cornucopia);
 fresh();const unchanged=JSON.stringify(G.state);BA.forageMult(G);T.ok('reading a held payoff does not allocate streak state',JSON.stringify(G.state)===unchanged);
 const first=gather(),second=gather();T.ok('first and second successful sweeps receive15 and30percent before rounding',first===7&&second===8,JSON.stringify({first,second}));
 T.ok('gathering consumes the actual16tick action cost',s.dayTicks===32,s.dayTicks);
 for(let i=0;i<9;i++){s.inventory=[];gather();}
 T.ok('eleven consecutive gathers cap at ten stacks and2.5x',v.cornucopia?.[me]?.streak===10&&BA.forageMult(G)===2.5);
 const cap=gather();T.ok('the capped bonus reaches actual stored plant units',cap===15,cap);
 T.ok('bonus harvest retains the real canonical source',s.inventory.filter(i=>i.plantId==='dandelion').every(i=>i.harvestShares?.[me]===1));
 G.tickAction(1);T.ok('other paid work breaks the chain',BA.forageMult(G)===1&&v.cornucopia?.[me]?.streak===0);
 gather();patch();t.detail[4][4]='grass';fixed(()=>G.doAction('forage'));T.ok('an empty failed gather breaks the chain',BA.forageMult(G)===1);
 gather();patch('tree');fixed(()=>G.doAction('forage'));T.ok('wood-only gathering earns materials without plant streak credit',BA.forageMult(G)===1&&s.inventory.some(i=>i.material==='branch'));
 gather();s.inventory=[{material:'stone',units:1,kg:999,name:'Prepared overload'}];const clock=s.dayTicks;patch();fixed(()=>G.doAction('forage'));T.ok('a refused full-pack gather resets without free food or time',BA.forageMult(G)===1&&s.inventory.length===1&&s.dayTicks===clock);
 s.inventory=[];gather();t.type='ruin';t.bookChecked=true;t.loot=[];fixed(()=>G.doAction('forage'));T.ok('an empty ruin is not a forage streak',BA.forageMult(G)===1);
 fresh();delete G.state.codex.plants.dandelion;const unknown=gather();T.ok('extra unknown plants stay unnamed in the same lump',unknown===5&&!G.plantKnown('dandelion')&&s.inventory.some(i=>i.lump?.dandelion)&&!s.inventory.some(i=>i.plantId==='dandelion'),unknown);
 fresh();gather();const saved=G.save(),loaded=G.load(G.state.runKey);s=G.state.scholar;v=G.state.village;t=G.playerTile();T.ok('real save/load preserves that persons chain',saved===true&&loaded&&BA.forageMult(G)===1.15&&v.cornucopia?.[me]?.streak===1);
 v.npcAbilities[npc]=['cornucopia'];v.cornucopia=v.cornucopia||{};v.cornucopia[npc]={streak:4,sequence:4};G.playerDeath('prepared Cornucopia mantle');T.ok('a successor reads their own canonical chain, never the predecessors',G.villagerId!==me&&BA.forageMult(G)===(G.villagerId===npc?1.6:1));
 fresh();gather();BA.onDayTick(G);T.ok('dawn breaks the plant chain',BA.forageMult(G)===1);
 gather();G.startCombat('hushwolf');T.ok('a combat interruption breaks the plant chain',BA.forageMult(G)===1);G.tbfight=null;
 // Real duty: record its existing ecology result rather than replace it.
 fresh(false);v.npcAbilities[npc]=['cornucopia'];const depletion=G.villagerDepleteTiles;let dep;
 G.villagerDepleteTiles=function(...args){dep=depletion.apply(this,args);return dep;};
 try{fixed(()=>G.resolveOneAssignment(npc,{task:'forage'}));}finally{G.villagerDepleteTiles=depletion;}
 const raw=450*G.villagerCompetence(npc,'forage')*G.trustTaskMult(npc)*(dep.depleted>0?G.vigorYieldMult(dep.avgVigor):0.3);
 T.ok('NPC duty generates the same15percent actual pantry bonus',G.pantryKcal()===Math.round(raw*1.15)&&BA.forageMult(G,npc)===1.15,JSON.stringify({pantry:G.pantryKcal(),raw}));
 T.ok('NPC duty bonus retains its own harvest source',v.pantry.every(i=>i.harvestShares?.[npc]===1));
 fixed(()=>G.resolveOneAssignment(npc,{task:'wood'}));T.ok('an NPCs other duty breaks their own chain',BA.forageMult(G,npc)===1);
 T.ok('NPC work does not grant a payoff or streak to the player',!G.hasAbility('cornucopia')&&BA.forageMult(G)===1);
 // Adjacent gather: the native NPC needs branch, with one actual plant.
 fresh(false);v.npcAbilities[npc]=['cornucopia'];v.positions[npc]={mx:3,my:4};Object.assign(G.npcNeeds(npc),{hunger:90,energy:100,fear:0});
 fixed(()=>G.npcTakeAction(npc,t.detail,{announced:0}));
 T.ok('adjacent NPC plant gathering applies its own first bonus',G.npcNeeds(npc).hunger===61.25&&BA.forageMult(G,npc)===1.15,G.npcNeeds(npc).hunger);
 patch();G.npcNeeds(npc).hunger=90;fixed(()=>G.npcTakeAction(npc,t.detail,{announced:0}));T.ok('consecutive NPC gathers advance independently',G.npcNeeds(npc).hunger===57.5&&BA.forageMult(G,npc)===1.3);
 patch();t.detail[4][4]='grass';t.detail[4][6]='plant';t.plantSpecies['6,4']='dandelion';G.npcNeeds(npc).hunger=90;fixed(()=>G.npcTakeAction(npc,t.detail,{announced:0}));
 T.ok('an NPC can walk toward the next real patch without losing focus',v.positions[npc].mx===4&&BA.forageMult(G,npc)===1.3);
 G.npcNeeds(npc).hunger=0;G.npcNeeds(npc).energy=10;fixed(()=>G.npcTakeAction(npc,t.detail,{announced:0}));T.ok('NPC rest breaks that actors chain',BA.forageMult(G,npc)===1);
 // Actual away-return route, all other residents engaged so they do not depart.
 fresh(false);v.npcAbilities[npc]=['cornucopia'];const hx=v.px??4,hy=v.py??4;G.npcSetNode(npc,hx+1,hy);v.away={[npc]:{purpose:'forage',sinceDay:18,sincePart:0,duration:1}};const engaged=G.isEngaged;G.isEngaged=id=>id!==npc;
 try{fixed(()=>G.npcNodeTravel());}finally{G.isEngaged=engaged;}
 T.ok('actual returning forager receives460 real kcal at15percent',G.pantryKcal()===460&&!v.away[npc]&&BA.forageMult(G,npc)===1.15,G.pantryKcal());
 G.npcSetNode(npc,hx+1,hy);T.ok('actual node travel preserves the NPC gathering chain',BA.forageMult(G,npc)===1.15);
 fresh();s.buildaround={cornucopia:8};for(const id of v.roster.filter(id=>id!==me)){v.npcAbilities[id]=['cornucopia'];v.cornucopia=v.cornucopia||{};v.cornucopia[id]={streak:2,sequence:2};}
 T.ok('a legacy unscoped player counter remains readable before interruption',BA.forageMult(G)===2.2);
 G.playerDeath('prepared legacy Cornucopia mantle');T.ok('legacy player history cannot become the next bearers own chain',G.villagerId!==me&&BA.forageMult(G)===1.3&&!(G.state.scholar.buildaround||{}).cornucopia);
 fresh(false);v.npcAbilities[npc]=['cornucopia'];G.npcSetNode(npc,5,4);G.npcSetInside(npc,false);v.trust[npc]=100;v.positions[npc]={mx:3,my:4};v.cornucopia={[npc]:{streak:5,sequence:5}};K.fight(G,'hushwolf',{party:true});
 const fought=G.tbfight.fighters.some(f=>f.villagerId===npc);T.ok('an actual tactical party fight interrupts its NPC participants',fought&&BA.forageMult(G,npc)===1);
 // Finite patches: use the public cell wrapper and real walking, no refill.
 fresh();t.type='grove';patch();t.detail[4][4]='grass';for(const x of [3,6]){t.detail[4][x]='plant';t.plantSpecies[`${x},4`]='dandelion';}s.mx=2;s.my=4;
 fixed(()=>G.cellInteract(3,4));const one=BA.forageMult(G),ticks=s.dayTicks;
 fixed(()=>G.pathStep(4,4));fixed(()=>G.microMove(5,4));
 T.ok('native path and manual steps keep focus while paying their real clock',one===1.15&&BA.forageMult(G)===1.15&&s.dayTicks===ticks+2);
 fixed(()=>G.cellInteract(6,4));T.ok('the public cell wrapper keeps two finite harvests in one chain',BA.forageMult(G)===1.3&&v.cornucopia?.[me]?.sequence===2&&units()===15,JSON.stringify({mult:BA.forageMult(G),units:units()}));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
