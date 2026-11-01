'use strict';
const K=require('./lib'),T=K.reporter('Joint forage favor');
(async()=>{
 const G=await K.load({seed:Number(process.argv[2]||7)}),store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,x)=>store.set(k,String(x)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 function scene(){
  K.newRun(G);const s=G.state.scholar,v=G.state.village,vid=v.roster.find(id=>id!==G.villagerId&&!G.getPerson(id).dead),plant=G.data.plants.find(p=>p.id==='blackberry');
  s.day=4;s.dayTicks=0;G.dayPart=0;s.kcal=10000;s.health=100;s.hydration=100;s.insideHaven=false;s.mx=4;s.my=4;s.inventory=[];
  v.px=v.px??4;v.py=v.py??4;G.map.px=v.px;G.map.py=v.py;v.away={};v.engaged={};v.promises={};v.favorLedger={};v.pantry=[];
  G.npcSetNode(vid,v.px,v.py);G.npcSetInside(vid,false);v.positions[vid]={mx:4,my:3};
  const x=v.px+1,y=v.py,t=G.map.tiles[y][x];t.type='forest_floor';t.stock=100;t.vigor=100;t.needsBridge=false;t.blockage=null;t.detail=Array.from({length:9},()=>Array(9).fill('dirt'));t.detailRegrow={};t.bushSpecies={};
  for(const[cx,cy]of [[3,4],[4,5],[5,4]]){t.detail[cy][cx]='bush';t.bushSpecies[cx+','+cy]=plant.id;}
  // Explicit resource-rich success scene; NPCs keep their normal work. The
  // retained thin-patch pilot is a contested opportunity, not a success proof.
  t.plantSpecies={};for(let cy=1;cy<8;cy++)for(let cx=1;cx<8;cx++)if((cx+cy)%2===0&&!(cx===4&&cy===4)){t.detail[cy][cx]='plant';t.plantSpecies[cx+','+cy]=plant.id;}
  G.markSeen(x,y,'visited');G.state.codex.plants[plant.id]={level:1,identifiedDay:3,harvests:0};
  const f=G.convoBuildFavor(vid,{kind:'forage_help',kcal:0});G.convoStoreFavor(f);return{vid,x,y,t,f,plant};
 }
 const favor=c=>G.convoGetFavor(c.vid),position=c=>{const s=G.state.scholar;s.mx=4;s.my=4;G.npcSetInside(c.vid,s.insideHaven!==false);G.state.village.positions[c.vid]={mx:4,my:3};};
 function start(c){const accepted=G.convoFavorCommit(c.vid,c.f);G.state.scholar.day=5;G.dayPart=0;const begun=G.convoPerformFavor(c.vid,c.f);return{accepted,begun};}
 function gather(c){G.travelTo(c.x,c.y);position(c);return G.convoPerformFavor(c.vid,favor(c));}
 function back(c){const v=G.state.village;G.travelTo(v.px,v.py);G.enterBuilding();position(c);}
 const c=scene();T.ok('real authored request has a supported physical lifecycle',!G.convoFavorAction(c.vid,c.f).unsupported&&typeof G.performForageFavor==='function');
 T.ok('meeting language names actual Haven rather than fictional terrain',/Haven/.test(c.f.commitLine)&&/dawn|first light/.test(c.f.commitLine)&&!/creek bend|fallen oak|ridge/.test(c.f.commitLine));
 T.ok('asked action explains acceptance without granting food',!G.convoFavorAction(c.vid,c.f).ready&&/Accept/.test(G.convoFavorAction(c.vid,c.f).reason));
 const state=JSON.stringify({state:G.state,map:G.map}),random=Math.random;let draws=0;Math.random=function(){draws++;return random();};let target;
 try{target=G.forageFavorTarget();G.convoFavorAction(c.vid,c.f);}finally{Math.random=random;}
 T.ok('known-target readiness neither mutates world state nor draws RNG',draws===0&&JSON.stringify({state:G.state,map:G.map})===state&&target?.x===c.x);
 const a=G.convoFavorCommit(c.vid,c.f);T.ok('acceptance creates one exact obligation and no delivered food',a.ok&&G.state.village.promises[c.vid]?.favorId===c.f.id&&!c.f.forageRun&&G.pantryKcal()===0);
 T.ok('the actual meeting is tomorrow, not immediately',!G.convoFavorAction(c.vid,c.f).ready&&/day 5/.test(G.convoFavorAction(c.vid,c.f).reason));
 G.state.scholar.day=5;const begun=G.convoPerformFavor(c.vid,c.f);T.ok('dawn departure binds actual target and temporary companion',begun.ok&&c.f.forageRun?.target.x===c.x&&G.travelingWith().includes(c.vid)&&!G.partyMembers().includes(c.vid));
 const old=G.foodForageItem(c.plant,true,10,650,5,G.harvestOrigin(G.villagerId));G.state.scholar.inventory=[old];G.enterBuilding();position(c);G.donateToPantry(0);G.exitBuilding();position(c);
 G.checkPromises('food',c.vid,{food:true,forageFavorId:c.f.id});
 T.ok('real donation of starting food and forged generic receipt do not keep this promise',!G.state.village.promises[c.vid].kept&&c.f.forageRun.deliveredKcal===0);
 T.ok('direct helper call without a canonical donation frame cannot mint delivery',G.forageFavorDeposit({forageShares:{[c.f.id]:1},units:10,kcalEach:65},650)===false&&!G.state.village.promises[c.vid].kept);
 const result=gather(c),r=favor(c).forageRun;
 T.ok('actual public gather pays and tags physical harvest before return',result.ok&&r.gatheredUnits>0&&!G.state.village.promises[c.vid].kept&&c.t.stock<100&&G.state.scholar.inventory.some(i=>i.forageShares?.[c.f.id]===1),JSON.stringify({result,known:G.plantKnown(c.plant.id),sameTile:G.playerTile()===c.t,stock:c.t.stock,cells:[[3,4],[4,5],[5,4]].map(([x,y])=>({cell:c.t.detail?.[y]?.[x],regrow:c.t.detailRegrow?.[x+','+y],species:c.t.bushSpecies?.[x+','+y]}))}));
 T.ok('actual travel brought the real partner to the gathering node',G.npcNode(c.vid).nx===c.x&&G.npcNode(c.vid).ny===c.y);
 const key=G.state.runKey;G.save();G.load(key);
 T.ok('actual Continue retains companion, source food and obligation identity',G.travelingWith().includes(c.vid)&&favor(c).forageRun.gatheredUnits===r.gatheredUnits&&G.state.scholar.inventory.some(i=>i.forageShares?.[c.f.id]===1));
 back(c);const before=G.pantryKcal(),delivered=G.convoPerformFavor(c.vid,favor(c));
 T.ok('canonical home handoff adds actual food and keeps the exact promise',delivered.ok&&favor(c).forageRun.returned&&G.state.village.promises[c.vid].kept===true&&G.pantryKcal()>before,JSON.stringify({delivered,homeType:G.playerTile()?.type,inside:G.state.scholar.insideHaven,access:G.havenStoresAccess(),food:G.state.scholar.inventory.filter(i=>i.forageShares?.[c.f.id]).map(i=>({units:i.units,option:G.pantryDonationOptions(G.state.scholar.inventory.indexOf(i))}))}));
 T.ok('completed task releases temporary escort without inventing party membership',!G.travelingWith().includes(c.vid)&&!G.partyMembers().includes(c.vid));
 const stock=G.pantryKcal();T.ok('repeated handoff cannot duplicate food or completion',!G.convoPerformFavor(c.vid,favor(c)).ok&&G.pantryKcal()===stock);
 {const c=scene();start(c);gather(c);back(c);const item=G.state.scholar.inventory.findIndex(i=>i.forageShares?.[c.f.id]);G.donateToPantry(item,1);T.ok('partial actual delivery is retained without an early completion',favor(c).forageRun.deliveredKcal===65&&!G.state.village.promises[c.vid].kept);const food=G.state.scholar.inventory.reduce((n,i)=>n+(i.units||0),0);const ended=G.performForageFavor(c.vid,favor(c),{keepCargo:true});T.ok('explicit cancellation keeps real cargo but breaks the unfinished word',ended.ok&&G.state.scholar.inventory.reduce((n,i)=>n+(i.units||0),0)===food&&G.state.village.promises[c.vid].kept==='broken'&&!G.travelingWith().includes(c.vid));}
 {const c=scene();start(c);gather(c);G.state.scholar.day=7;G.checkPromises(null);back(c);const before=G.pantryKcal(),late=G.convoPerformFavor(c.vid,favor(c));T.ok('spoiled late food cannot be laundered into the pantry or a kept promise',!late.ok&&G.pantryKcal()===before&&G.state.village.promises[c.vid].kept==='broken'&&G.state.scholar.inventory.some(i=>i.forageShares?.[c.f.id]&&G.isSpoiled(i)));}
 {
  const c=scene();start(c);const gathered=gather(c),lines=[],say=G.say;
  G.say=function(...args){lines.push(String(args[0]));return say.apply(this,args);};
  const pack=()=>G.state.scholar.inventory.map(i=>({id:i.itemId,units:i.units,kcal:i.kcalEach,state:i.foodState,spoil:i.spoilDay,shares:i.forageShares}));
  try{
   G.learnTechnique('render','trial');G.state.scholar.inventory.push({name:'Prepared smoked meat',foodKind:'meat',foodState:'preserved',units:8,kcalEach:400,spoilDay:100,kg:.1},{name:'Prepared rendered fat',foodKind:'fat',foodState:'rendered',units:4,kcalEach:400,spoilDay:100,kg:.1});
   const preview=G.pemmicanPreview();G.makePemmican();const made=G.state.scholar.inventory.some(i=>i.itemId==='pemmican'&&i.forageShares?.[c.f.id]>0),afterMix=pack();
   G.state.scholar.day=7;G.checkPromises(null);const afterExpiry=pack(),want=G.convoSelectWant(c.vid),options=want.def.menuOptions.call(G,c.vid,0);
   T.ok('expired outing still offers physical work/end rather than saying we are square',want.id==='repay'&&options.some(o=>o.id==='dlg:favor_cancel')&&!options.some(o=>o.id==='dlg:react'));
   const before=G.pantryKcal();back(c);const late=favor(c).forageRun.returned?{alreadyReturned:true}:G.convoPerformFavor(c.vid,favor(c));
   T.ok('real preservation permits late physical salvage without rewriting the deadline',made&&(late.ok||late.alreadyReturned)&&G.pantryKcal()>before&&favor(c).forageRun.deliveredKcal>0&&G.state.village.promises[c.vid].kept==='broken'&&favor(c).state!=='fulfilled',JSON.stringify({late,gathered,preview,made,afterMix,afterExpiry,afterReturn:pack(),lines:lines.slice(-12)}));
  }finally{G.say=say;}
 }
 {const c=scene();c.f.state='promised';c.f.promisedDay=4;G.state.village.promises[c.vid]={day:4,goal:'feed',kept:false,maker:G.villagerId,favorId:c.f.id,favorTask:c.f.task,favorDeadline:6};G.state.scholar.day=20;const key=G.state.runKey;G.save();G.load(key);const p=G.state.village.promises[c.vid],due=G.promiseDueDay(p);T.ok('old unplayable accepted jobs get one fair persisted meeting/deadline window',!p.kept&&p.forageVersion===1&&favor(c).meetDay===21&&due>=22);G.state.scholar.day=21;G.save();G.load(key);T.ok('further Continue cannot keep renewing the grace window',G.promiseDueDay(G.state.village.promises[c.vid])===due&&favor(c).meetDay===21);}
 {const c=scene();const rule=G.data.favorRules.forage,old=rule.minimumDeliveryKcal;try{rule.minimumDeliveryKcal=999;start(c);T.ok('offered and accepted task amount is pinned rather than changed by later tuning',favor(c).forageRequiredKcal===old&&G.forageFavorAction(c.vid,favor(c)).reason.includes('/'+old+' kcal'));}finally{rule.minimumDeliveryKcal=old;}}
 {const c=scene();start(c);const maker=G.villagerId;G.villagerId=c.vid;G.state.scholar.villagerId=c.vid;T.ok('a successor cannot borrow the earlier bearer escort or activity',!G.forageFavorCompanions().includes(c.vid)&&!G.forageFavorAction(c.vid,favor(c)).ready);G.villagerId=maker;G.state.scholar.villagerId=maker;}
 {const c=scene();c.t.bushSpecies={};c.t.plantSpecies={};const before=JSON.stringify(c.t);let n=0;const rng=Math.random;Math.random=function(){n++;return rng();};let target;try{target=G.forageFavorTarget();}finally{Math.random=rng;}T.ok('missing species are never initialized to manufacture a known destination',!target&&n===0&&JSON.stringify(c.t)===before);}
 {const c=scene();start(c);G.travelTo(c.x,c.y);position(c);for(let y=0;y<9;y++)for(let x=0;x<9;x++)if(['plant','bush'].includes(c.t.detail[y][x]))c.t.detailRegrow[x+','+y]={day:7,was:c.t.detail[y][x]};const before=JSON.stringify(G.state),status=G.convoPerformFavor(c.vid,favor(c));T.ok('a depleted arrival is refused without food, payment or completion',!status.ok&&JSON.stringify(G.state)===before&&!G.state.village.promises[c.vid].kept);}
 T.done();
})().catch(error=>{console.error(error.stack);process.exitCode=1});
