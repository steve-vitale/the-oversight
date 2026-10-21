'use strict';
const K=require('./lib'),T=K.reporter('Garden usage observation'),O=require('../lib/garden-usage'),{gameplayHash}=require('../gear-usage-audit');
(async()=>{
 const G=await K.load({seed:7002});K.newRun(G);G.exitBuilding();const before=gameplayHash(G.state),observer=O.install(G);observer.sample();
 T.ok('installing and sampling actual game observation leaves all saved state unchanged',before===gameplayHash(G.state));
 G.harvestGarden();T.ok('a real refused harvest is a call, never delivered food',observer.report.calls.harvestGarden===1&&observer.report.playerHarvestKcal===0&&observer.report.playerHarvests===0);
 const plant=G.data.plants.find(p=>p.form==='shoots'),plot={pid:plant.id,plantedDay:1,lastTend:1,lastHarvest:0,weeds:0,dead:false};
 G.map.tiles[4][4].plots=[plot];G.state.scholar.day=1+G.gardenGrowthDays(plant.form);G.state.scholar.kcal=5000;
 G.state.codex.plants[plant.id]={level:3,prepKnown:true}; // Prepared identified-food opportunity, not an unknown haul.
 G.harvestGarden();T.ok('actual mature crop output is observed through the public harvest method',observer.report.playerHarvests===1&&observer.report.playerHarvestKcal>0);
 T.ok('the observer has no hidden observation errors',observer.report.errors.length===0);
 observer.restore();
 // Boundary fixture: a paid action's following meal consumes ALL of the food.
 // Counting after the action would falsely say the harvest produced nothing.
 const fake={state:{scholar:{day:9,inventory:[]},village:{pantry:[]}},map:{tiles:Array.from({length:9},()=>Array.from({length:9},()=>({})))},villagerId:'person',
  tickAction(){this.state.scholar.inventory=[];return 'paid';},harvestGarden(){this.map.tiles[4][4].plots[0].lastHarvest=9;this.state.scholar.inventory.push({units:2,kcalEach:300});return this.tickAction(16);},
  stockPantry(){this.state.village.pantry.push({units:1,kcalEach:50});return 'stored';},prodThrottleAltTask(){return 'wood';},resolveOneAssignment(){return this.prodThrottleAltTask();}};
 fake.map.tiles[4][4].plots=[{pid:'crop',lastHarvest:0,lastTend:1}];const original=fake.harvestGarden,obs=O.install(fake);
 T.ok('wrapper preserves the original paid action return value',fake.harvestGarden()==='paid');
 T.ok('harvest calories are measured before the following meal, not net pack change',obs.report.playerHarvestKcal===600&&fake.state.scholar.inventory.length===0);
 fake.stockPantry(5000,'Garden harvest');T.ok('pantry receipts count delivered output, not requested output',obs.report.pantryDeliveredKcal===50);
 fake.stockPantry(5000,'Gift');T.ok('other pantry sources cannot masquerade as garden production',obs.report.pantryDeliveries===1);
 fake.resolveOneAssignment('worker',{task:'garden'});fake.prodThrottleAltTask();
 T.ok('garden duty redirected to other work is distinct from tending/harvesting',obs.report.gardenDutyAttempts===1&&obs.report.gardenDutyRedirects===1&&obs.report.tendedDutyPlots===0);
 obs.restore();T.ok('restoration returns the actual original methods',fake.harvestGarden===original);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
