'use strict';
// Actual carried-ration boundary and fresh-process post-flee Continue.
// Prepared remote traveler/pack, not a claim of a natural expedition campaign.
const assert=require('assert/strict'),fs=require('fs'),cp=require('child_process'),K=require('./lib');
function storage(entries=[]){const m=new Map(entries);global.localStorage={getItem:k=>m.get(String(k))??null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),key:i=>[...m.keys()][i]??null,get length(){return m.size;}};return m;}
(async()=>{
 if(process.argv.includes('--continue-child')){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));storage(input.entries);const G=await K.load({seed:85031});
  const loaded=G.load(input.key),v=G.state.village,pantry=JSON.stringify(v.pantry),carried=G.packKcal(input.vid),ate=G.packMeal(input.vid,300,G.freshExposure());
  process.stdout.write('@@REST@@'+JSON.stringify({loaded,day:G.state.scholar.day,resting:G.isPostFleeResting(input.vid),bearer:G.villagerId,away:!!v.away?.[input.vid],carried,ate,remaining:v.pack[input.vid].kcal,pantryUntouched:JSON.stringify(v.pantry)===pantry})+'\n');return;
 }
 const T=K.reporter('Away supply boundary'),saved=storage(),G=await K.load({seed:85031});K.newRun(G);
 const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId);
 assert(vid);v.away=v.away||{};v.away[vid]={since:s.day-1,returnDay:s.day+2};G.npcSetNode(vid,(v.px??4)+1,v.py??4);
 v.pack=v.pack||{};v.pack[vid]={day:s.day,kcal:400,dawnKcal:400,topUpDone:false,risks:G.freshExposure()};
 v.pantry=[{itemId:'foraged_food_dried',name:'Prepared dried food',foodState:'dried',edible:true,kcalEach:100,units:100}];
 const pantry=JSON.stringify(v.pantry),ration=G.packMeal(vid,2000,G.freshExposure());
 T.ok('an away meal can eat only its actual carried ration',ration===400&&v.pack[vid].kcal===0,JSON.stringify({ration,pack:v.pack[vid]}));
 T.ok('a remote meal cannot top up from the physical Haven pantry',JSON.stringify(v.pantry)===pantry);
 T.ok('the exhausted carried ration cannot be eaten twice',G.packMeal(vid,2000,G.freshExposure())===0);
 s.day++;const remotePantry=JSON.stringify(v.pantry);
 T.ok('a new remote dawn cannot silently reseed the empty pack',G.packKcal(vid)===0&&JSON.stringify(v.pantry)===remotePantry);
 v.pack[vid].kcal=300;s.day++;
 T.ok('actual remaining carried food survives another remote dawn',G.packKcal(vid)===300&&JSON.stringify(v.pantry)===remotePantry);
 delete v.away[vid];G.npcSetNode(vid,v.px??4,v.py??4);G.npcSetInside(vid,true);
 const localPantry=G.pantryKcalLive(v),local=G.packMeal(vid,2000,G.freshExposure());
 T.ok('actual return to the hall permits a paid refill with remaining food conserved',local===2000&&localPantry-G.pantryKcalLive(v)===1700&&v.pack[vid].kcal===0,JSON.stringify({local,before:localPantry,after:G.pantryKcalLive(v)}));
 v.away[vid]={since:s.day-1,returnDay:s.day+2};G.npcSetNode(vid,(v.px??4)+1,v.py??4);v.pack[vid]={day:s.day-1,kcal:250,risks:G.freshExposure()};
 G.markPostFleeRest(vid);const day=s.day,key=G.state.runKey,bearer=G.villagerId;
 assert(G.isPostFleeResting(vid));G.save();assert(saved.has(key),'actual committed save bytes required');
 const output=cp.execFileSync(process.execPath,[__filename,'--continue-child'],{input:JSON.stringify({entries:[...saved],vid,key}),encoding:'utf8',maxBuffer:8*1024*1024});
 const line=output.split(/\r?\n/).find(s=>s.startsWith('@@REST@@'));assert(line,'fresh worker must report its actual load');const r=JSON.parse(line.slice(8));
 T.ok('fresh-process Continue preserves the same actual traveler rest day',r.loaded&&r.day===day&&r.bearer===bearer&&r.resting,JSON.stringify(r));
 T.ok('fresh-process Continue keeps actual away food finite without a remote draw',r.away&&r.carried===250&&r.ate===250&&r.remaining===0&&r.pantryUntouched,JSON.stringify(r));
 s.day++;T.ok('post-flee rest expires on the next actual calendar day',!G.isPostFleeResting(vid));
 const traveler=v.roster.find(id=>id!==G.villagerId&&G.npcMaxDist(id)>0);assert(traveler,'eligible canonical traveler required');
 function atHall(){
  delete v.away[traveler];G.npcSetNode(traveler,v.px??4,v.py??4);G.npcSetInside(traveler,true);
  v.health=v.health||{};v.health[traveler]=100;if(v.sick)delete v.sick[traveler];
  v.pack[traveler]={day:s.day-1,kcal:0,risks:G.freshExposure()};
 }
 atHall();let before=G.pantryKcalLive(v);G.startExpedition(traveler,v.px??4,v.py??4,false);
 T.ok('real expedition packs paid food before setting away and moving',v.away[traveler]?.purpose==='expedition'&&v.pack[traveler].kcal>0&&before-G.pantryKcalLive(v)===v.pack[traveler].kcal);
 atHall();before=G.pantryKcalLive(v);const obj={kind:'FORAGE',purpose:'forage',tx:((v.px??4)+1)%9,ty:v.py??4,partsLeft:4};G.objDepart(traveler,obj,v.px??4,v.py??4,false);
 T.ok('real objective departure also carries its paid ration before moving',obj.state==='out'&&!!v.away[traveler]&&v.pack[traveler].kcal>0&&before-G.pantryKcalLive(v)===v.pack[traveler].kcal);
 K.newRun(G);const prior=G.state.village.roster.find(id=>id!==G.villagerId);assert(prior);G.markPostFleeRest(prior);assert(G.isPostFleeResting(prior));K.newRun(G);
 T.ok('a new run on the same first day cannot inherit another village rest marker',!G.isPostFleeResting(prior));
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
