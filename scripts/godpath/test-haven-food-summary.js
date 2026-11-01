'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),assert=require('assert/strict'),K=require('./lib'),T=K.reporter('Haven food summary');
(async()=>{
 const G=await K.load({seed:221022});K.newRun(G);
 T.ok('Haven has a callable food-record view',typeof G.havenFoodSummary==='function');
 if(typeof G.havenFoodSummary!=='function'){T.done();return;}
 const trace=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'../../evidence/2026-10-22/natural-phone-d64-r2/trace.json.gz'))));
 G.state=structuredClone(trace.trace.filter(t=>t.state)[2].state);const v=G.state.village;
 let draws=0;const random=Math.random;Math.random=()=>{draws++;return random();};
 const view=()=>{const old=JSON.stringify(G.state),r=G.havenFoodSummary();assert.equal(JSON.stringify(G.state),old,'Food view never changes saves/resources/history');return r;};
 try{
  let r=view();T.ok('actual phone pantry is canonical stock',r.stockKcal===G.pantryKcal()&&r.stockKcal===39660);
  T.ok('actual one-day record stays one day',r.historyDays===1&&r.averageMealDraw===v.burnHistory[0]);
  T.ok('actual private meals are not subtracted from pantry deposits',r.lastEaten===v.lastEat&&r.lastDeposited===v.lastGive&&r.daysAtRecentUse===5);
  v.pantry=[];v.burnHistory=[0];v.lastEat=0;v.lastGive=0;r=view();
  T.ok('empty pantry never receives an infinite-days forecast',r.stockKcal===0&&r.daysAtRecentUse===null);
  T.ok('zero eating remains zero, not the old800 fallback',r.lastEaten===0&&r.lastDeposited===0);
  v.pantry=[{units:2,kcalEach:500}];r=view();
  T.ok('zero net draw is a record, not proof of feeding everyone',r.averageMealDraw===0&&r.daysAtRecentUse===null);
  v.burnHistory=[];v.lastEat=8000;v.lastGive=99999;r=view();
  T.ok('no settled history stays unknown despite stale totals',r.historyDays===0&&r.averageMealDraw===null&&r.lastEaten===null&&r.lastDeposited===null&&r.daysAtRecentUse===null);
  v.burnHistory=[100,200,300,400,500,600,700];v.lastEat=1200;v.lastGive=100;r=view();
  T.ok('seven recorded days use the actual rolling mean',r.historyDays===7&&r.averageMealDraw===400&&r.daysAtRecentUse===2);
  v.burnHistory=[100,NaN];r=view();T.ok('invalid history cannot invent a safe forecast',r.averageMealDraw===null&&r.daysAtRecentUse===null);
  v.burnHistory=[100,-2];r=view();T.ok('invalid negative draw stays unknown',r.averageMealDraw===null&&r.daysAtRecentUse===null);
  v.burnHistory=[250];v.pantry=[{units:0,kcalEach:999999},{units:1,kcalEach:500}];r=view();
  T.ok('zero-unit stacks do not create phantom reserves',r.stockKcal===500&&r.daysAtRecentUse===2);
  v.pantry=[{units:1,kcalEach:NaN}];r=view();
  T.ok('invalid stock stays unknown rather than pretending it is empty',r.stockKcal===null&&r.daysAtRecentUse===null);
  T.ok('all record reads consume no random draws',draws===0);
 }finally{Math.random=random;}
 T.done();
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
