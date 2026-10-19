'use strict';
// Match observed phases by day AND their ordered occurrence within that day.
// A day can contain several policy calls (succession, continued actions).
function compareBoundaries(before,after,difference){
 const groups=new Map(),seen=new Map();
 function key(s){if(!Number.isFinite(s?.value?.day)||typeof s.at!=='string')throw Error('Unknown replay boundary');return s.at+':'+s.value.day;}
 for(const s of before){const k=key(s);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s);}
 let first=null;const unmatchedAfter=[],unmatchedBefore=[];
 for(const s of after){const k=key(s),ordinal=seen.get(k)||0;seen.set(k,ordinal+1);const b=groups.get(k)?.[ordinal];
  if(!b){unmatchedAfter.push({day:s.value.day,at:s.at,ordinal});continue;}
  const differences=difference(b.value,s.value);if(!first&&differences.length)first={day:s.value.day,at:s.at,ordinal,differences};
 }
 for(const [k,rows] of groups)for(let i=seen.get(k)||0;i<rows.length;i++)unmatchedBefore.push({day:rows[i].value.day,at:rows[i].at,ordinal:i});
 return {first,unmatchedBefore,unmatchedAfter};
}
module.exports={compareBoundaries};
