'use strict';
// Auxiliary coverage, never a replacement for balanced outcomes. A trip call
// is not an arrival, an API call is not payment, and true is not an agreement.
function summarize(d){
 const keys=['attempts','sameBearerRangeArrivals','unknownArrivalAttempts','talkCalls','acceptedTalkCalls','talksWithObservedTime','unknownTalkTime','unknownActionAttempts','dealCalls','newAgreementsObserved','unknownAgreementOutcomes'];
 const out={status:Array.isArray(d?.receipts)?'known':'unknown',scope:'Attempt receipts; range arrival does not establish an interaction. Accepted calls do not establish usefulness. Agreements are observed after a deal attempt, not causal attribution of later outcomes.'};
 for(const k of keys)out[k]=out.status==='known'?0:null;if(out.status==='unknown')return out;
 out.attempts=d.receipts.length;
 for(const r of d.receipts){
  if(!r||typeof r!=='object'){out.unknownArrivalAttempts++;out.unknownActionAttempts++;out.unknownAgreementOutcomes++;continue;}
  if(typeof r.arrival?.bearer!=='string'||typeof r.before?.bearer!=='string'||!Number.isFinite(r.target?.x)||!Number.isFinite(r.target?.y)||!Array.isArray(r.arrival?.world)||!r.arrival.world.every(Number.isFinite))out.unknownArrivalAttempts++;
  else if(r.arrival.bearer===r.before.bearer&&Math.abs(r.arrival.world[0]-r.target.x)+Math.abs(r.arrival.world[1]-r.target.y)<=1)out.sameBearerRangeArrivals++;
  if(!Array.isArray(r.actions))out.unknownActionAttempts++;
  const actions=Array.isArray(r.actions)?r.actions:[];
  for(const a of actions){
   if(a.id==='talk'){
    out.talkCalls++;if(a.accepted===true)out.acceptedTalkCalls++;
    const b=a.before,n=a.after;
    if(b?.bearer===n?.bearer&&[b?.day,b?.tick,n?.day,n?.tick].every(Number.isFinite)){
     if(n.day>b.day||(n.day===b.day&&n.tick>b.tick))out.talksWithObservedTime++;
    }else out.unknownTalkTime++;
   }
   if(a.id?.startsWith('deal_'))out.dealCalls++;
  }
  if(!r.observedBefore||!r.observedAfter||!Object.hasOwn(r.observedBefore,'deal')||!Object.hasOwn(r.observedAfter,'deal'))out.unknownAgreementOutcomes++;
  else if(actions.some(a=>a.id?.startsWith('deal_'))&&r.observedAfter.deal!=null&&r.observedAfter.deal!==r.observedBefore.deal)out.newAgreementsObserved++;
 }
 if(out.unknownAgreementOutcomes||out.unknownTalkTime||out.unknownArrivalAttempts||out.unknownActionAttempts)out.status='partial';return out;
}
module.exports={summarize};
