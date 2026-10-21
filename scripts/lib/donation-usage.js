'use strict';
// Passive direct-action receipts. No permission, hydration or RNG calls.
function install(G){
 const report={version:1,attempts:0,transfers:0,kcal:0,refusals:0,discardedWithoutCredit:0,events:[],errors:[]};
 const original=G.donateToPantry;
 G.donateToPantry=function(idx,...args){
  const s=this.state.scholar,v=this.state.village,id=s.villagerId,item=s.inventory?.[idx];
  const old=(v.gives||{})[id]||0,units=item?.units??1,expected=(item?.kcalEach||0)*units;
  report.attempts++;
  const result=original.call(this,idx,...args);
  const credit=((v.gives||{})[id]||0)-old,removed=!!item&&!s.inventory.includes(item);
  if(removed&&credit>0&&Math.abs(credit-expected)<1e-6){
   report.transfers++;report.kcal+=credit;report.events.push({day:s.day,actor:id,kcal:credit,gardenShares:item.gardenShares?{...item.gardenShares}:null});
  }else if(!removed&&credit===0)report.refusals++;
  else if(removed&&credit===0)report.discardedWithoutCredit++;
  else report.errors.push('Gift credit and removed food disagree at day '+s.day);
  return result;
 };
 return{report,restore(){G.donateToPantry=original;}};
}
module.exports={install};
