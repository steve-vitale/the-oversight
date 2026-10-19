'use strict';
const K=require('./lib'),H=K.H,L=require('../policies/livelihood'),T=K.reporter('livelihood controllers');
(async()=>{
  const G=await K.load({seed:20261017});
  const fresh=()=>{K.newRun(G);G.state.scholar.day=20;G.state.scholar.kcal=2400;G.state.scholar.health=100;G.state.scholar.dayTicks=0;return G.state.scholar;};
  const flags=['CAPABLE_HUNT','COMPETENT_FEAST','COMPETENT_SEEK_FIGHTS','COMPETENT_TRADE_RESERVE'];
  const before=flags.map(k=>process.env[k]);let caught=false;
  try{L.quiet(()=>{T.ok('non-hunting controls are selected within the call',process.env.CAPABLE_HUNT==='0'&&process.env.COMPETENT_SEEK_FIGHTS==='0'&&process.env.COMPETENT_TRADE_RESERVE==='1');throw Error('proof');},true);}catch(e){caught=e.message==='proof';}
  T.ok('scoped control restores all flags even on exception',caught&&flags.every((k,i)=>process.env[k]===before[i]));

  let s=fresh(),v=G.state.village;
  s.inventory=[{name:'Bread',itemId:'proof_bread',kcalEach:500,units:12,foodState:'cooked',edible:true}];
  const trader={id:'proof_trader',name:'Mara',entrepreneurial:true,credit:0,wares:[{kind:'tool',itemId:'stone_knife',name:'Stone knife',price:1000,sold:false}]};
  v.visitors=[trader];const ctx={};
  const food=()=>s.inventory.reduce((n,i)=>n+(i.kcalEach||0)*(i.units??1),0),start=food();
  L.trade(G,ctx);
  T.ok('merchant buys actual cart gear with real food',trader.wares[0].sold&&s.inventory.some(i=>(i.itemId||i.id)==='stone_knife')&&start-food()===1000);
  T.ok('merchant purchase is reported only after public success',ctx.livelihoodBuys===1);
  T.ok('merchant retains a personal meal buffer',food()>=1200);

  s=fresh();v=G.state.village;
  s.inventory=[{name:'meal A',kcalEach:2400,units:1},{name:'meal B',kcalEach:2400,units:1},{name:'meal C',kcalEach:2400,units:1}];
  const C=require('../policies/competent');
  L.quiet(()=>C.donateHaul(G,{}),true);
  T.ok('trade reserve protects three personal days of actual stock',s.inventory.length===3);
  L.quiet(()=>C.donateHaul(G,{}),false);
  T.ok('ordinary contribution still donates beyond one personal day',s.inventory.length===1);

  s=fresh();G.state.codex.recipes={hide_armor:{level:3}};
  s.inventory=[{name:'Cured hide',material:'hide',units:2},{name:'Vine',material:'vine',units:1}];
  const maker={};L.make(G,maker);
  T.ok('maker crafts real known gear',s.inventory.some(i=>(i.itemId||i.id)==='hide_armor')&&maker.livelihoodCrafts===1);
  T.ok('craft consumes real recipe materials',G.materialCount('hide')===0&&G.materialCount('vine')===0);
  s=fresh();G.state.codex.recipes={};
  s.inventory=[{name:'Cured hide',material:'hide',units:2},{name:'Vine',material:'vine',units:1}];
  L.make(G,{});
  T.ok('maker cannot craft hidden unlearned gear from sufficient materials',!s.inventory.some(i=>(i.itemId||i.id)==='hide_armor')&&G.materialCount('hide')===2&&G.materialCount('vine')===1);
  s=fresh();G.state.codex.recipes={hide_armor:{level:3}};
  s.inventory=[{name:'Vine',material:'vine',units:1,kg:0.1}];s.prepStash=[{name:'Cured hide',material:'hide',units:2,kg:0.8}];
  const blocked={};L.collectPrepMaterials(G,blocked);
  T.ok('maker takes actual counter stock through the paid public action',G.materialCount('hide')===2&&s.prepStash.length===0&&s.dayTicks===2&&blocked.livelihoodMaterialUnits===2&&!blocked.livelihoodCounterMaterialBlockedDays&&!(blocked.livelihoodErrors||[]).length);
  s=fresh();G.state.codex.techniques=G.state.codex.techniques||{};G.state.codex.techniques.preserve=true;
  const safe={name:'Rabbit meat (cooked)',plantId:'meat_rabbit',foodKind:'meat',foodState:'cooked',kcalEach:400,units:2,edible:true,safe:true,spoilDay:25};
  const unsafe={name:'Human meat',plantId:'meat_human',foodKind:'meat',foodState:'cleaned',kcalEach:400,units:2,edible:true,parasiteRisk:true,spoilDay:25};
  s.inventory=[safe,unsafe];const smoker={};L.make(G,smoker);
  T.ok('maker preserves the actual selected safe pack batch',safe.foodState==='preserved'&&smoker.livelihoodPreserves===1);
  T.ok('safe-batch work leaves a dangerous neighboring batch untouched',unsafe.foodState==='cleaned'&&unsafe.parasiteRisk===true);

  s=fresh();v=G.state.village;
  const ids=v.roster.filter(id=>id!==G.villagerId),patient=ids[0],remote=ids[1];
  v.roster=[G.villagerId,patient,remote];v.health=v.health||{};v.health[patient]=40;v.health[remote]=10;
  G.npcSetNode(patient,G.map.px,G.map.py);G.npcSetNode(remote,G.map.px+1,G.map.py);
  const carer={};L.care(G,carer);
  T.ok('caregiver performs real local wound care',v.health[patient]>40&&s.dayTicks>0&&carer.livelihoodPatients===1);
  T.ok('caregiver never treats the more-injured remote resident',v.health[remote]===10);
  const hp=v.health[patient],ticks=s.dayTicks;L.care(G,carer);
  T.ok('one patient per day prevents repetitive care farming',v.health[patient]===hp&&s.dayTicks===ticks);

  s=fresh();const drawn=G.grantFeastBuff({quality:1,surge:1.5,served:[{itemId:'proof_bread',kcal:1500}],guests:[]});
  T.ok('actual live feast grant presents a pending encounter',drawn.granted&&G.pendingEncounter&&G.pendingMonsterId);
  const pending={};L.merchant.upkeep(G,pending);
  T.ok('actual merchant upkeep preserves the offered noncombat response',G.pendingEncounter&&!(G.tbfight&&!G.tbfight.over));
  H.driveContests(G,L.merchant,pending);
  T.ok('harness calls merchant public drive-off before combat fallback',pending.livelihoodDrawsDrivenOff===1&&!G.pendingEncounter&&!(G.tbfight&&!G.tbfight.over),JSON.stringify({drivenOff:pending.livelihoodDrawsDrivenOff,encounter:G.pendingEncounter,monster:G.pendingMonsterId,fight:!!G.tbfight}));
  T.ok('declining draw invents no combat food deed',!(s.prog||{}).feastSurgeUsed);
  s=fresh();G.drawFeastScavenger();let starts=0;const original=G.startCombat;
  G.startCombat=function(...args){starts++;return original.apply(this,args);};
  try{H.driveContests(G,{},{});}finally{G.startCombat=original;}
  T.ok('profiles without a pending response retain the actual fight fallback',starts===1);

  s=fresh();G.state.village.visitors=[trader];const bad={},warnings=[],warn=console.warn,wares=G.visitorWares;
  console.warn=x=>warnings.push(String(x));G.visitorWares=()=>{throw Error('proof missing cart');};
  try{L.trade(G,bad);}finally{console.warn=warn;G.visitorWares=wares;}
  const diagnostics=L.merchant.diagnostics(bad);
  T.ok('controller failures remain visible in warnings and bounded diagnostics',warnings.some(x=>x.includes('proof missing cart'))&&diagnostics.errors.some(x=>x.includes('proof missing cart')));
  T.ok('three distinct profiles are registered without aliases', ['maker','merchant','caregiver'].every(id=>require('../sweep-compare').POLICY_REGISTRY[id]===L[id])&&L.maker!==L.merchant&&L.caregiver!==L.merchant);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
