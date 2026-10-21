'use strict';
const path=require('path'),root=path.resolve(process.env.PARTIAL_DONATION_ROOT||path.join(__dirname,'../..')),K=require(path.join(root,'scripts/godpath/lib')),T=K.reporter('Partial pantry donation');
(async()=>{
 const G=await K.load({seed:7002}),observer=require('../lib/donation-usage').install(G);let s,v;
 const food=extra=>({name:'Prepared garden food',units:10,kcalEach:750,kg:.3,foodState:'cooked',safe:true,edible:true,spoilDay:100,plantId:'dandelion',gardenShares:{ordinary:.25,assisted:.75},harvestShares:{resident:.6,player:.4},...extra});
 function fresh(extra={}){K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;s.dayTicks=0;s.actionClock=0;s.kcal=2400;s.health=100;s.energy=100;s.inventory=[food(extra)];v.pantry=[];v.assignments={};v.gives={[G.villagerId]:0};G.enterBuilding();G.pantryCapKcal();}
 const state=()=>JSON.stringify({pack:s.inventory,pantry:v.pantry,gives:v.gives,trust:v.trust,day:s.day,ticks:s.dayTicks,kcal:s.kcal});
 fresh();const item=s.inventory[0],original=JSON.parse(JSON.stringify(item)),beforeTicks=s.dayTicks;G.donateToPantry(0,3);
 T.ok('partial donation preserves the actual remaining row and units',s.inventory[0]===item&&item.units===7);
 T.ok('the real pantry receives exactly the selected calories',G.pantryKcal()===2250&&v.gives[G.villagerId]===2250);
 T.ok('independent receipts recognize a transfer without removing the whole row',observer.report.transfers===1&&observer.report.kcal===2250&&observer.report.events[0].movedUnits===3&&observer.report.events[0].remainingUnits===7);
 T.ok('the retained food keeps all non-quantity metadata',JSON.stringify({...item,units:10})===JSON.stringify(original));
 const sameShares=(a,b)=>JSON.stringify(Object.keys(a||{}).sort())===JSON.stringify(Object.keys(b||{}).sort())&&Object.keys(b||{}).every(k=>Math.abs(a[k]-b[k])<1e-12);
 T.ok('every delivered piece preserves food state, plant and origin shares',v.pantry.length>0&&v.pantry.every(i=>i.foodState==='cooked'&&i.plantId==='dandelion'&&sameShares(i.gardenShares,original.gardenShares)&&sameShares(i.harvestShares,original.harvestShares)),JSON.stringify(v.pantry));
 T.ok('delivered weight matches the selected food',Math.abs(v.pantry.reduce((n,i)=>n+i.units*i.kg,0)-.9)<1e-9);
 T.ok('giving food retains its existing free action cost',s.day===85&&s.dayTicks===beforeTicks&&s.kcal===2400);
 fresh();v.pantry=[food({name:'Stored food',units:(G.pantryCapKcal()-1500)/750})];
 T.ok('the shared options expose actual fitting whole units',G.pantryDonationOptions?.(0)?.maxUnits===2);
 const before=state();G.donateToPantry(0,3);T.ok('over-capacity request leaves food and credit unchanged',state()===before);
 G.donateToPantry(0,2);T.ok('an explicit fitting part reaches capacity without losing the rest',s.inventory[0]?.units===8&&G.pantryKcal()===G.pantryCapKcal()&&v.gives[G.villagerId]===1500);
 let invalid=true;for(const n of [0,-1,.5,NaN,Infinity,'2',11]){fresh();const b=state();G.donateToPantry(0,n);invalid=invalid&&state()===b;}
 T.ok('invalid, fractional and excessive quantities never transfer or earn credit',invalid);
 fresh({units:0});const empty=state();G.donateToPantry(0,1);T.ok('an explicit empty stack cannot mint food',state()===empty);
 fresh({kcalEach:750.5});const fractional=state();G.donateToPantry(0,1);T.ok('unmeasurable legacy calories are not rounded into a gift',state()===fractional);
 fresh({edible:false});const unknown=state();G.donateToPantry(0,1);T.ok('unknown food remains blocked with no gift credit',state()===unknown);
 fresh({bonded:true});const bonded=state();G.donateToPantry(0,1);T.ok('partial quantities cannot bypass a bond',state()===bonded);
 fresh({spoilDay:1});const rotten=state();G.donateToPantry(0,1);T.ok('a refused partial rotten-food request never discards the unselected stack',state()===rotten);
 fresh();G.exitBuilding();G.map.px=3;G.map.py=3;const remote=state();G.donateToPantry(0,1);T.ok('partial transfers cannot reach the hall remotely',state()===remote);
 fresh();G.donateToPantry(0);T.ok('omitted quantity retains whole-stack donation behavior',s.inventory.length===0&&G.pantryKcal()===7500&&v.gives[G.villagerId]===7500);
 fresh();G.donateToPantry(0,10);T.ok('selecting the complete stack removes exactly that row',s.inventory.length===0&&v.gives[G.villagerId]===7500);
 fresh({units:4,kcalEach:500,kg:.1});G.donateToPantry(0,2);let takes=0;while(v.pantry.length&&takes++<20)G.takeFromPantry(0);
 T.ok('taking the partial gift back revokes its owed trust/XP',v.pantry.length===0&&(v.giveTrust[G.villagerId]||0)===0&&(v.giveXP?.[G.villagerId]||0)===0);
 T.ok('partial and whole receipts have no physical/credit discrepancies',observer.report.errors.length===0);
 observer.restore();T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
