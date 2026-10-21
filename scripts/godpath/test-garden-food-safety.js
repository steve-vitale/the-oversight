'use strict';
const path=require('path'),K=require(path.join(path.resolve(process.env.GARDEN_FOOD_ROOT||path.join(__dirname,'../..')),'scripts/godpath/lib')),T=K.reporter('Garden food safety');
(async()=>{
 const saves=new Map();global.localStorage={getItem:k=>saves.get(k)??null,setItem:(k,v)=>saves.set(k,String(v)),removeItem:k=>saves.delete(k),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:7002});let s;
 function fresh(pid,known=true){K.newRun(G);s=G.state.scholar;s.day=85;s.kcal=6000;G.exitBuilding();s.inventory=[];G.state.codex.plants[pid]=known?{level:3,prepKnown:true}:{level:0};const p={};G.gardenPlant(p,pid,-800);G.map.tiles[4][4].plots=[p];return p;}
 const fields=i=>Object.fromEntries(['foodKind','foodState','edible','needsCooking','kcalEach','hiddenKcal','diseaseRisk','poisonRisk','name','prep','spoilDay','unit','kg'].map(k=>[k,i?.[k]??null]));
 for(const pid of ['dandelion','elderberry','stinging_nettle','groundnut','sweet_cassava','cushcush_yam','moso_bamboo_shoot','acorn_white_oak']){
  const p=fresh(pid),plant=G.data.plants.find(x=>x.id===pid),units=G.gardenHarvestUnits(p),expected=G.foodForageItem(plant,true,units,G.plotYieldKcal(p),s.day);G.harvestGarden();const item=s.inventory.find(i=>i.plantId===pid);
  T.ok(pid+': actual harvest keeps canonical preparation, risks, name and shelf life',JSON.stringify(fields(item))===JSON.stringify(fields(expected)),JSON.stringify({actual:fields(item),expected:fields(expected)}));
  T.ok(pid+': real units and both producer/crop origins survive',item?.units===units&&item.harvestShares?.[G.villagerId]===1&&item.gardenShares?.ordinary===1);
 }
 fresh('sweet_cassava',false);let said='';const say=G.say;G.say=function(text){said=text;return say.apply(this,arguments);};G.harvestGarden();G.say=say;let item=s.inventory[0];
 T.ok('guided but unknown crop stays unknown and inedible',item?.foodState==='unknown'&&item.edible===false&&item.kcalEach===0&&item.hiddenKcal===350);
 T.ok('unknown harvest narration does not reveal species or calories',said.startsWith('Harvest:')&&!/cassava|350|kcal/i.test(said));
 const key=G.state.runKey,raw=JSON.parse(saves.get(key));
 T.ok('harvest saves the physical unknown food before unload',raw.scholar.inventory[0]?.foodState==='unknown'&&raw.scholar.inventory[0].gardenShares?.ordinary===1);
 G.load(key);s=G.state.scholar;item=s.inventory[0];const units=item.units;G.eatOne(0);
 T.ok('Continue retains the real unknown-food refusal',item.units===units&&item.edible===false&&!G.state.village.gardenIntakeTotals);
 fresh('stinging_nettle');G.harvestGarden();item=s.inventory[0];const ticks=s.dayTicks;
 G.learnTechnique('cook','trial');
 T.ok('prepared Haven has a real fire and harvested food has raw risk',G.nearFire()&&item.needsCooking&&item.diseaseRisk?.p>0);
 G.cookFood(0);
 T.ok('actual cooking spends time, resolves risk and preserves crop attribution',s.dayTicks>ticks&&item.foodState==='cooked'&&item.safe===true&&!item.needsCooking&&!item.diseaseRisk&&item.gardenShares?.ordinary===1);
 s.kcal=0;G.eatOne(0);
 T.ok('a real prepared crop meal reaches settled intake accounting',G.state.village.gardenIntakeTotals?.origins.ordinary.kcal>0&&G.state.village.gardenIntakeTotals.nourishment>0);
 const refused={kcal:s.kcal,ticks:s.dayTicks,inventory:JSON.stringify(s.inventory)};G.harvestGarden();
 T.ok('empty harvest spends no food or time and creates no item',s.kcal===refused.kcal&&s.dayTicks===refused.ticks&&JSON.stringify(s.inventory)===refused.inventory);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
