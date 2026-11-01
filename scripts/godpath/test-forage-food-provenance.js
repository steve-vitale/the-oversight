'use strict';
// Prepared physical food routes; does not certify the joint outing or its UI.
const K=require('./lib'),T=K.reporter('Forage outing food provenance');
(async()=>{
 const G=await K.load({seed:Number(process.argv[2]||7)}),close=(a,b)=>Math.abs((a||0)-(b||0))<1e-8;
 T.ok('outing source has a separate weighted-food contract',typeof G.blendForageShares==='function');
 if(typeof G.blendForageShares!=='function'){T.done();return;}
 const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,value)=>storage.set(k,String(value)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
 let s,v,me;const trip='prepared-forage-favor';
 function fresh(){K.newRun(G);s=G.state.scholar;v=G.state.village;me=G.villagerId;s.day=20;s.dayTicks=0;s.kcal=10000;s.health=100;s.hydration=100;s.inventory=[];s.insideHaven=true;v.pantry=[];G.map.px=v.px??4;G.map.py=v.py??4;G.dayPart=0;}
 const berry=()=>G.data.plants.find(p=>p.id==='blackberry');
 const food=(n,shares)=>({...G.foodForageItem(berry(),true,n,n*berry().caloriesPerUnit,s.day,G.harvestOrigin(me)),...(shares?{forageShares:shares}:{})});
 fresh();
 const original=[{item:food(3),weight:3},{item:food(2,{[trip]:1}),weight:2}],snapshot=JSON.stringify(original),blend=G.blendForageShares(original);
 T.ok('old food stays in denominator rather than borrowing joint-work credit',close(blend[trip],.4));
 T.ok('source blending leaves physical input rows unchanged',JSON.stringify(original)===snapshot);
 const bad=G.blendForageShares([{item:{forageShares:{a:1,b:1,invalid:NaN,tooLarge:2}},weight:1},{item:{},weight:1}]);
 T.ok('invalid shares are excluded and excess attribution cannot create food',close(bad.a,.25)&&close(bad.b,.25)&&bad.invalid===undefined&&bad.tooLarge===undefined);
 T.ok('untagged ordinary food gets no extra metadata',Object.keys(G.blendForageShares([{item:food(3),weight:3}])).length===0);

 fresh();const p=berry();G.state.codex.plants[p.id]={level:1,identifiedDay:1};
 G.addUnknownToLump(p,3,s.day,undefined,G.harvestOrigin(me));
 const lump=G.addUnknownToLump(p,2,s.day,undefined,G.harvestOrigin(me),undefined,{[trip]:1});
 T.ok('actual unknown-lump merge records only the two newly sourced units',lump.units===5&&close(lump.lump[p.id].forageShares?.[trip],.4));
 const split=G.splitLumpOut(lump,p.id,s.inventory);
 T.ok('actual identification split preserves the partial source',split?.units===5&&close(split.forageShares?.[trip],.4));
 T.ok('outing identifiers never contaminate producer identities',split.harvestShares?.[me]===1&&!split.harvestShares?.[trip]);
 fresh();s.inventory=[{plantId:p.id,foodState:'unknown',units:2,spoilDay:22,name:'Prepared legacy unknown',harvestShares:G.harvestOrigin(me),forageShares:{[trip]:.5}}];delete s._lumpsMigrated;G.migrateLumps();
 T.ok('real legacy-unknown conversion preserves its partial outing source',s.inventory[0]?.lump?.[p.id]?.forageShares?.[trip]===.5);
 const key=G.state.runKey;G.save();G.load(key);s=G.state.scholar;v=G.state.village;
 T.ok('actual save/load retains hidden per-species source without naming it',s.inventory[0]?.foodState==='unknown'&&s.inventory[0]?.lump?.[p.id]?.forageShares?.[trip]===.5);

 fresh();const nut=G.data.plants.find(p=>p.id==='hickory_nut'),nuts=G.foodForageItem(nut,true,4,4*nut.caloriesPerUnit,s.day,G.harvestOrigin(me));nuts.forageShares={[trip]:.5};s.inventory=[nuts];const gross=nuts.hiddenKcal,before=s.dayTicks;G.shellNuts(0);
 T.ok('real shelling keeps attribution and pays its four clock ticks',nuts.foodState==='shelled'&&nuts.kcalEach===Math.round(gross*.75)&&close(nuts.forageShares[trip],.5)&&s.dayTicks-before===4);
 T.ok('usable outing calories follow shell loss rather than gross yield',close(nuts.units*nuts.kcalEach*nuts.forageShares[trip],2*Math.round(gross*.75)));

 fresh();s.inventory=[food(3)];G.donateToPantry(0);s.inventory=[food(2,{[trip]:1})];G.donateToPantry(0);
 const kcal=()=>v.pantry.filter(i=>i.plantId===p.id).reduce((n,i)=>n+i.units*i.kcalEach*(i.forageShares?.[trip]||0),0);
 T.ok('real pantry donations merge without turning old stock into new work',close(kcal(),2*p.caloriesPerUnit)&&v.pantry.filter(i=>i.plantId===p.id).reduce((n,i)=>n+i.units,0)===5);
 const idx=v.pantry.findIndex(i=>i.plantId===p.id);G.takeFromPantry(idx);
 const taken=s.inventory.find(i=>i.plantId===p.id);
 T.ok('actual pantry withdrawal preserves the diluted source fraction',close(taken?.forageShares?.[trip],.4));
 G.takeFromPantryBulk({[idx]:2});
 T.ok('actual bulk take and pack merge preserve source without inflation',s.inventory.some(i=>i.plantId===p.id&&i.units===3&&close(i.forageShares?.[trip],.4)));

 fresh();G.learnTechnique('render','trial');s.inventory=[
  {name:'Smoked meat',foodKind:'meat',foodState:'preserved',units:2,kcalEach:400,spoilDay:100},
  {name:'Rendered fat',foodKind:'fat',foodState:'rendered',units:1,kcalEach:400,spoilDay:100},
  {name:'Berries',plantId:'blackberry',foodKind:'plant',edible:true,units:2,kcalEach:200,spoilDay:100,forageShares:{[trip]:1}},
 ];G.makePemmican();const bars=s.inventory.find(i=>i.itemId==='pemmican');
 T.ok('real mixed recipe attributes only the ingredient share, not old meat/fat',!!bars&&close(bars.forageShares?.[trip],.25));
 if(bars){G.pantryAdd(bars);T.ok('finished-food shelving keeps its actual recipe fraction',v.pantry.length>0&&v.pantry.every(i=>close(i.forageShares?.[trip],.25)));}
 T.done();
})().catch(error=>{console.error(error.stack);process.exitCode=1});
