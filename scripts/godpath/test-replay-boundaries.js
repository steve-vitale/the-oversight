'use strict';
const {compareBoundaries}=require('../lib/replay-boundaries'),T=require('./lib').reporter('replay boundaries');
const point=(n,at='before',day=1)=>({at,value:{day,kcal:n}}),diff=(a,b)=>a.kcal===b.kcal?[]:[{path:'/kcal',before:a.kcal,after:b.kcal}];
const original=[point(100),point(80),point(70,'after')],copy=JSON.stringify(original);
let r=compareBoundaries(original,JSON.parse(copy),diff);
T.ok('same-day repeated observations never fabricate a first difference',r.first===null&&r.unmatchedBefore.length===0&&r.unmatchedAfter.length===0);
r=compareBoundaries(original,[point(100),point(79),point(70,'after')],diff);
T.ok('a real second-occurrence change names the matching observed moment',r.first?.ordinal===1&&r.first.differences[0].before===80&&r.first.differences[0].after===79);
r=compareBoundaries([point(100),point(60,'after')],[point(100),point(60,'after')],diff);
T.ok('before and after phases have separate occurrence queues',r.first===null);
r=compareBoundaries([point(100)],[point(100),point(80)],diff);
T.ok('extra candidate observations remain explicit rather than borrowing an earlier state',r.first===null&&r.unmatchedAfter.length===1&&r.unmatchedAfter[0].ordinal===1);
r=compareBoundaries([point(100),point(80)],[point(100)],diff);
T.ok('missing candidate observations retain the before-side gap',r.first===null&&r.unmatchedBefore.length===1&&r.unmatchedBefore[0].ordinal===1);
let error=false;try{compareBoundaries([{at:'before',value:{kcal:1}}],[],diff);}catch(e){error=/Unknown replay boundary/.test(e.message);}
T.ok('an unknown observation boundary is rejected rather than imputed',error);
T.ok('comparison leaves all recorded input untouched',JSON.stringify(original)===copy);
T.done();
