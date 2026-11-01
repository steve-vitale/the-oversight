'use strict';
const K=require('./lib'),P=require('../policies/gardener-intent'),C=require('../policies/competent'),A=require('../policies/capable'),T=K.reporter('Gardener intent');
(async()=>{
 const G=await K.load({seed:7002});let s,v;
 function fresh(){K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;s.dayTicks=0;s.actionClock=0;s.kcal=6000;s.health=100;s.energy=100;s.hydration=100;s.inventory=[];s.abilities=[];s.levelUpQueue=[];G.state.systemArrived=true;v.havenTier=2;v.pantry=[];v.assignments={};v.gardenKeeper=null;K.openSlots(G,3);G.exitBuilding();G.state.codex.plants.dandelion={level:1,prepKnown:true};for(let i=0;i<9;i++){const q=G.gardenSlot(i);G.genDetail(4,4)[q.y][q.x]='dirt';}G.map.tiles[4][4].plots=[];}
 function offer(id){const d=G.data.abilities.find(a=>a.id===id);return{id,name:d.name,description:d.description,src:'level_up:field'};}
 const ctx=()=>({gardenerInvest:true,capResolveOffers:P.resolveGardenOffers,resolvePendingOffers:A.chooseOffers,gardenTarget:P.gardenTarget});
 fresh();s.abilityChoices=[offer('photosynthesis'),offer('green_thumb')];const choices=ctx();A.chooseOffers(G,choices);
 T.ok('actual offered core wins over a first-choice garden support power',s.abilities.some(a=>a.id==='green_thumb')&&!s.abilities.some(a=>a.id==='photosynthesis')&&choices.gardenerChoices[0].acquired);
 T.ok('acquisition receipt preserves real earned-sheet source',choices.gardenerChoices[0].offered.every(o=>o.src==='level_up:field'));
 s.abilityChoices=[offer('photosynthesis')];const held=JSON.stringify(s.abilities);P.resolveGardenOffers(G,choices);
 T.ok('resolver only requests an actually offered ability',s.abilities.some(a=>a.id==='photosynthesis')&&JSON.stringify(s.abilities)!==held&&!s.abilities.some(a=>a.id==='green_whisper'));
 s.abilityChoices=[offer('rain_dancer')];P.resolveGardenOffers(G,choices);s.abilityChoices=[offer('green_whisper')];P.resolveGardenOffers(G,choices);
 T.ok('a full earned sheet replaces lower-priority support while retaining own core',s.abilities.some(a=>a.id==='green_thumb')&&s.abilities.some(a=>a.id==='green_whisper')&&!s.abilities.some(a=>a.id==='photosynthesis'));
 fresh();const late=ctx(),old=G.counterTeachable;let injected=false;
 G.counterTeachable=function(...args){const result=old.apply(this,args);if(!injected){s.abilityChoices=[offer('photosynthesis'),offer('green_whisper')];injected=true;}return result;};
 try{C.competent.daily(G,late);}finally{G.counterTeachable=old;}
 T.ok('real daily fallback routes a late-opened sheet through the intent resolver',injected&&late.gardenerChoices?.some(c=>c.preferred==='green_whisper'&&c.acquired));
 fresh();s.abilityChoices=[offer('green_thumb')];P.resolveGardenOffers(G,ctx());
 for(let i=0;i<4;i++){G.makePlot();G.gardenPlant(G.gardenPlots()[i],'dandelion',s.day);}
 s.dayTicks=0;s.actionClock=0;s.kcal=6000;s.inventory=[{plantId:'dandelion',name:'dandelion',units:10,kcalEach:40,kg:.01,foodState:'raw'}];
 const expand=ctx(),plan=P.planExpansion(G,expand);
 T.ok('prepared upper Haven opportunity considers a fifth bed from real gates and seeds',plan.makeGate.ok&&plan.target===5&&['food-demand','practice-and-food'].includes(plan.reason));
 const count=G.gardenPlots().length,food=s.kcal;C.workGarden(G,expand);
 T.ok('shared work routine really builds the fifth bed and pays resources',G.gardenPlots().length===count+1&&s.kcal<food-120&&expand.gardenerPlans.some(p=>p.target===5));
 T.ok('new bed changes actual grounds and gets real seed planting',G.genDetail(4,4)[2][4]==='dirt'&&G.gardenPlots()[4].pid==='dandelion');
 const repeated=P.planExpansion(G,expand);T.ok('same bearer cannot repeatedly expand in the same day',repeated.reason==='one-bed-per-day'||repeated.reason==='use-existing-bed');
 s.day++;s.kcal=6000;s.dayTicks=0;const q=G.gardenSlot(5);G.genDetail(4,4)[q.y][q.x]='fire';
 const blocked=P.planExpansion(G,ctx());T.ok('occupied sixth bed is recorded as a genuine gate refusal',blocked.reason==='make-gate'&&!blocked.makeGate.ok&&blocked.target===5);
 G.genDetail(4,4)[q.y][q.x]='dirt';s.kcal=500;T.ok('low personal reserve defers expansion',P.planExpansion(G,ctx()).reason==='personal-reserve');
 s.kcal=6000;s.inventory=[];T.ok('no known real seed stock means no extra bed',P.planExpansion(G,ctx()).reason==='known-seed-value');
 s.inventory=[{plantId:'dandelion',name:'dandelion',units:10,kcalEach:40,kg:.01}];
 const roster=v.roster;v.roster=[G.villagerId];s.inventory.push({name:'prepared bread',units:20,kcalEach:1000,kg:.1,foodState:'cooked'});
 T.ok('a real usable food buffer can defer expansion below the Haven bed cap',P.planExpansion(G,ctx()).reason==='stored-surplus');
 s.inventory.at(-1).edible=false;const unsafe=P.planExpansion(G,ctx());
 T.ok('unsafe nominal pack calories are not counted as useful stored food',unsafe.usablePackKcal<20000&&unsafe.reason!=='stored-surplus');
 v.roster=roster;v.pantry=[{name:'test food',units:100000,kcalEach:100,kg:.01}];
 T.ok('storage pressure prevents expanding for unused production',P.planExpansion(G,ctx()).reason==='storage');
 T.ok('factorial registry has four distinct declared arms',new Set(P.profiles.map(p=>p.id)).size===4&&P.profiles.every(p=>require('../sweep-compare').POLICY_REGISTRY[p.id]===p));
 T.ok('policy receipts report no hidden action errors',!(expand.gardenerErrors||[]).length&&!(late.gardenerErrors||[]).length);T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
