'use strict';
const path=require('path'),root=path.resolve(process.env.DONATION_RECEIPTS_ROOT||path.join(__dirname,'../..'));
const K=require(path.join(root,'scripts/godpath/lib')),C=require(path.join(root,'scripts/policies/competent')),T=K.reporter('Donation receipts');
(async()=>{
 const G=await K.load({seed:7002}),observer=require('../lib/donation-usage').install(G);let s,v;
 const food=(name,units,extra={})=>({name,units,kcalEach:500,foodState:'cooked',edible:true,safe:true,spoilDay:100,kg:.1,...extra});
 function fresh(){K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;s.kcal=G.kcalCap()*2;s.health=100;s.energy=100;s.inventory=[];v.pantry=[];v.gives={[G.villagerId]:0};G.enterBuilding();}
 fresh();s.inventory=[food('Reserve',6),food('Gift',2,{gardenShares:{ordinary:1}})];let ctx={};const result=C.donateHaul(G,ctx);
 T.ok('a real null-returning gift is counted only after removal and credit',result===1&&ctx.donated===1&&ctx.donatedKcal===1000&&ctx._lastGiveDay===85&&s.inventory.length===1&&v.gives[G.villagerId]===1000);
 T.ok('actual pantry food retains cultivated origin',v.pantry.some(i=>i.gardenShares?.ordinary===1));
 T.ok('independent passive receipts count the physical gift',observer.report.transfers===1&&observer.report.kcal===1000&&observer.report.errors.length===0);
 fresh();s.inventory=[food('Reserve',6),food('Refused gift',2)];ctx={_lastGiveDay:70};const donate=G.donateToPantry;G.donateToPantry=()=>null;C.donateHaul(G,ctx);G.donateToPantry=donate;
 T.ok('a refused call does not count or postpone contribution',ctx.donationAttempts===1&&ctx.donationRefusals===1&&!ctx.donated&&!ctx.donatedKcal&&ctx._lastGiveDay===70&&s.inventory.length===2&&v.gives[G.villagerId]===0);
 fresh();s.inventory=[food('Reserve',6),food('Gift',2)];v.pantry=[food('Full pantry',G.pantryCapKcal()/500)];ctx={};C.donateHaul(G,ctx);
 T.ok('a known full pantry is not repeatedly attempted or counted',!ctx.donationAttempts&&!ctx.donated&&s.inventory.length===2);
 fresh();const room=G.pantryCapKcal();v.pantry=[food('Occupied bins',(room-1000)/500)];s.inventory=[food('Reserve',6),food('Small gift',2),food('Oversized gift',100)];ctx={};C.donateHaul(G,ctx);
 T.ok('an oversized stack does not hide a smaller fitting gift',ctx.donatedKcal===1000&&s.inventory.some(i=>i.name==='Oversized gift')&&!s.inventory.some(i=>i.name==='Small gift')&&G.pantryKcal()<=room);
 fresh();s.inventory=[food('One stack',10)];ctx={};C.donateHaul(G,ctx);
 T.ok('whole-stack donation never spends the personal food buffer',!ctx.donated&&s.inventory[0].units===10);
 fresh();s.inventory=[food('Safe reserve',6),food('Unknown',20,{edible:false}),food('Raw',20,{needsCooking:true}),food('Risk',20,{poisonRisk:{p:.2,dmg:2}}),food('Bonded',20,{bonded:true}),food('Empty',0),food('Shells',20,{foodState:'in_shell'}),food('Rot',20,{spoilDay:1})];ctx={};
 T.ok('declared rotten fixture is beyond the actual preservation bonus',G.isSpoiled(s.inventory[7]));C.donateHaul(G,ctx);
 T.ok('unsafe, unknown, bonded, empty and unshelled stacks neither donate nor pad reserve',!ctx.donated&&s.inventory.length===8,JSON.stringify({ctx,day:s.day,bonus:G.spoilBonusDays(),remaining:s.inventory.map(i=>i.name)}));
 fresh();s.inventory=[food('Unsafe reserve',20,{diseaseRisk:{p:.2,dmg:2}}),food('Only safe meal',2)];ctx={};C.donateHaul(G,ctx);
 T.ok('unsafe calories cannot make the only safe meal look surplus',!ctx.donated&&s.inventory.length===2);
 fresh();K.giveAbility(G,'preservation_instinct',{force:true,level:3});const preserved=food('Still fresh by ability',2,{spoilDay:84});s.inventory=[food('Reserve',6),preserved];ctx={};
 T.ok('preservation fixture is actually fresh under its owned modifier',G.spoilBonusDays()>1&&!G.isSpoiled(preserved));C.donateHaul(G,ctx);
 T.ok('the controller follows the real spoilage boundary rather than raw dates',ctx.donatedKcal===1000&&!s.inventory.includes(preserved));
 fresh();s.inventory=[food('Reserve',6),food('Gift',2)];G.exitBuilding();G.map.px=3;G.map.py=3;ctx={};C.donateHaul(G,ctx);
 T.ok('no remote donation attempt is invented',!ctx.donationAttempts&&!ctx.donated&&s.inventory.length===2);
 if(C.donateSurplus){
  fresh();s.inventory=[food('Reserve',10),food('Gift A',2),food('Gift B',2)];ctx={};C.donateSurplus(G,ctx,{keepKcal:G.kcalCap()*2,maxTransfers:1});
  T.ok('the second decision uses its two-day buffer and one-transfer limit',ctx.donated===1&&ctx.donatedKcal===1000&&s.inventory.reduce((n,i)=>n+i.units*i.kcalEach,0)>=G.kcalCap()*2);
 }else T.ok('the second decision uses its two-day buffer and one-transfer limit',false);
 T.ok('receipt observation reports no inconsistent physical transfers',observer.report.errors.length===0);
 observer.restore();T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
