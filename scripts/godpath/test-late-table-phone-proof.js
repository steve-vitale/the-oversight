'use strict';
const assert=require('assert/strict'),path=require('path'),P=require('../lib/late-table-phone-proof');
const root=path.resolve(__dirname,'../..'),data=P.read(root);let checks=1;
const initial=P.verify(root,data);assert(initial.ok,initial.errors.join('\n'));
// Mutate a single fact and restore it; never clone the large campaign trace.
function reject(name,target,key,value){const old=target[key];target[key]=value;try{assert(!P.verify(root,data).ok,name);checks++;}finally{target[key]=old;}}
const d=data.receipts[0].data;
reject('synthetic input cannot replace touch',d.touches[0],'trusted',false);
reject('all seven doors need actual reachability',d,'doors',d.doors.slice(0,6));
reject('an intermediate reader swipe cannot charge resources',d.doors[2],'stateHash','changed');
reject('a clipped choice is not reachable',d.doors[2].rect,'y',9999);
reject('current served source is required',d.network,'src/js/app.js','stale');
reject('Continue must retain actual food',d.resumed.scholar,'kcal',d.resumed.scholar.kcal-1);
reject('the same pending act must resume',d.resumed.scholar.tableChoices,'options',[]);
reject('opening-day play is not late-game coverage',d.ending,'day',2);
reject('completed expeditions cannot reappear in Continue',d.afterEnding,'hasContinue',true);
reject('the ending must persist in Records',d.records.legend,'wins',0);
reject('main play cannot overflow the phone',d.frames.find(f=>f.playing),'scroll',[0,0,9999]);
reject('the unmodified fixture is required',d.meta,'fixtureSha256','invented');
reject('the actual recipe must be current',d.meta,'recipeSha256','stale');
reject('the original full trace must remain unchanged',d.rawTrace,'sha256','changed');
reject('one phone cannot stand in for both',data,'receipts',data.receipts.slice(0,1));
const n=data.receipts[2].data;
reject('god-bearing entry is not non-god coverage',n.godhood.before,'active',['living_garden']);
reject('unknown godhood cannot count as empty',n.godhood,'atSeat',{});
reject('the ending must remain non-god',n.godhood.ending,'active',['iron_sovereign']);
reject('the replay must observe non-god entry',n.meta,'playerGodsAtEntry',null);
const before=n.committed.scholar.godhood.active,after=n.resumed.scholar.godhood.active;
try{n.committed.scholar.godhood.active=['living_garden'];n.resumed.scholar.godhood.active=['living_garden'];assert(!P.verify(root,data).ok,'matching god-bearing saves cannot pass non-god Continue');checks++;}finally{n.committed.scholar.godhood.active=before;n.resumed.scholar.godhood.active=after;}
reject('six earned doors cannot become a fabricated seventh',n,'doors',[...n.doors,{...n.doors[5],index:6}]);
reject('non-god coverage cannot discard the day660 pair',data,'receipts',data.receipts.slice(2));
reject('empty frame observations are not phone coverage',n,'frames',[]);
assert.throws(()=>P.updateMany(root,{unknown:[]}),/known campaign/);checks++;
assert.throws(()=>P.updateMany(root,{nongod:[data.receipts[2].path]}),/two retained/);checks++;
console.log(`Late Table phone proof: ${checks} passed, 0 failed`);
