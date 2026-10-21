'use strict';
// Read-only reporting. Unclassified includes other food and unknown old origins;
// cultivated intake is a measured lower bound, never an inferred entire diet.
const KINDS=Object.freeze(['ordinary','assisted','legacy','legacyAssisted']);
const finite=n=>Number.isFinite(n)&&n>=0;
const near=(a,b)=>Math.abs(a-b)<=1e-7+1e-9*Math.max(Math.abs(a),Math.abs(b));
const pair=p=>p&&finite(p.kcal)&&finite(p.nourishment);
function bucket(b){
 if(!pair(b)||!pair(b.unclassified)||!b.origins||typeof b.origins!=='object')return false;
 if(Object.entries(b.origins).some(([k,p])=>!KINDS.includes(k)||!pair(p)))return false;
 return ['kcal','nourishment'].every(k=>near(b[k],b.unclassified[k]+Object.values(b.origins).reduce((n,p)=>n+p[k],0)));
}
function intakeSnapshot(v){
 const t=v?.gardenIntakeTotals,unknown=reason=>({status:'unknown',reason,totals:null});
 if(!t)return unknown('no-cultivated-origin-receipts');
 if(t.version!==1)return unknown('unsupported-cultivated-origin-version');
 if(!Number.isSafeInteger(t.records)||t.records<1||!finite(t.startedDay)||!bucket(t)||!t.roles||typeof t.roles!=='object')return unknown('malformed-cultivated-origin-totals');
 const roles=Object.entries(t.roles);
 if(!roles.length||roles.some(([r,b])=>!['player','npc'].includes(r)||!bucket(b)))return unknown('malformed-cultivated-origin-roles');
 for(const key of ['kcal','nourishment']){
  if(!near(t[key],roles.reduce((n,[,b])=>n+b[key],0))||!near(t.unclassified[key],roles.reduce((n,[,b])=>n+b.unclassified[key],0)))return unknown('inconsistent-cultivated-origin-roles');
  for(const kind of KINDS)if(!near(t.origins[kind]?.[key]||0,roles.reduce((n,[,b])=>n+(b.origins[kind]?.[key]||0),0)))return unknown('inconsistent-cultivated-origin-roles');
 }
 return{status:'known',scope:'Instrumented meals since startedDay. Cultivated fractions only; unclassified is not proof of non-garden food. Assistance means applied growth/yield on that crop cycle, not current ability ownership.',totals:JSON.parse(JSON.stringify(t))};
}
function stockSnapshot(G){
 const s=G.state?.scholar||{},v=G.state?.village||{},totals=Object.fromEntries(KINDS.map(k=>[k,0])),locations={},unvaluedTaggedUnits={};
 const seen=new Set();
 function add(name,rows){
  if(!Array.isArray(rows)||seen.has(rows))return;seen.add(rows);const here=Object.fromEntries(KINDS.map(k=>[k,0]));
  for(const it of rows){if(!it||!finite(it.units)||it.units<=0)continue;
   const shares=KINDS.map(k=>[k,it.gardenShares?.[k]]).filter(([,n])=>Number.isFinite(n)&&n>0&&n<=1),sum=shares.reduce((n,[,x])=>n+x,0);
   for(const[k,share]of shares){const units=it.units*share/Math.max(1,sum);if(!finite(it.kcalEach)||it.kcalEach===0)unvaluedTaggedUnits[k]=(unvaluedTaggedUnits[k]||0)+units;else{const kcal=units*it.kcalEach;here[k]+=kcal;totals[k]+=kcal;}}
   // A sorted identity is not assumed for a lump. Its component has no
   // canonical kcalEach yet, so retain units rather than inventing calories.
   if(it.lump)for(const p of Object.values(it.lump)){const entries=KINDS.map(k=>[k,p.gardenShares?.[k]]).filter(([,n])=>Number.isFinite(n)&&n>0&&n<=1),sum=entries.reduce((n,[,x])=>n+x,0);if(finite(p.units))for(const[k,n]of entries)unvaluedTaggedUnits[k]=(unvaluedTaggedUnits[k]||0)+p.units*n/Math.max(1,sum);}
  }locations[name]=here;
 }
 add('pack',s.inventory);add('prep',s.prepStash);add('pantry',v.pantry);
 for(const[id,r]of Object.entries(v.pack||{}))if(finite(r.kcal)&&r.kcal>0)add('ration:'+id,[{units:1,kcalEach:r.kcal,gardenShares:r.gardenShares}]);
 for(const [i,c]of (G.state?.corpses||[]).entries())if(!c.buried)add('corpse:'+i,c.items);
 const people=new Map();for(const list of [G.data?.villagers,Object.values(v.rosterChars||{}),G.data?.background_survivors])for(const p of list||[])if(p?.id&&!people.has(p.id))people.set(p.id,p);
 const unknownResidents=[];for(const id of new Set(v.roster||[])){if(id===G.villagerId)continue;const p=people.get(id);if(!p)unknownResidents.push(id);else if(!p.dead&&(v.health?.[id]??100)>0)add('resident:'+id,p.items);}
 return{scope:'Nominal kcalEach in pack/prep/pantry, carried rations, known living resident items and unburied corpses. Not edible security. Other caches/transfers remain outside this stock coverage.',totals,locations,unvaluedTaggedUnits,unknownResidents};
}
module.exports={KINDS,intakeSnapshot,stockSnapshot};
