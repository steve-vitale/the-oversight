'use strict';
const assert=require('assert/strict'),fs=require('fs'),{spawnSync}=require('child_process'),K=require('./lib');
const mode=process.argv[2];
async function child(){
 const disk=new Map();let armed=false,writes=0;
 const emit=()=>console.log('AID_DISK '+JSON.stringify(Object.fromEntries(disk)));
 globalThis.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,removeItem:k=>disk.delete(k),setItem(k,v){
  if(armed&&k.startsWith('scattering-save-v1-')&&mode==='commit-before')process.exit(77);
  disk.set(k,String(v));if(armed&&k.startsWith('scattering-save-v1-')){writes++;emit();if(mode==='commit-after')process.exit(77);}
 }};
 if(mode==='recover'){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));for(const [k,v]of Object.entries(input.disk))disk.set(k,v);
  const G=await K.load({seed:7003,narration:true}),key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=disk.get(key),saved=JSON.parse(raw);
  assert.equal(G.load(key),true);assert.equal(disk.get(key),raw);assert.deepEqual(G.state.scholar,saved.scholar);assert.deepEqual(G.state.codex,saved.codex);
  assert.equal(!!G.state.codex.skills.scrounger,input.complete);assert.equal(G.state.activeAidQuest===null,input.complete);return;
 }
 const read=fs.readFileSync;
 if(mode==='removed')fs.readFileSync=function(file,...args){let v=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/timeSettlement.js')){const before=String(v),after=before.replace("const handIn=game.handInAidQuest;","const handIn=game.handInAidQuest; return;");assert.notEqual(after,before);v=typeof v==='string'?after:Buffer.from(after);}return v;};
 let G;try{G=await K.load({seed:7003,narration:true});}finally{fs.readFileSync=read;}
 K.newRun(G);Object.assign(G.state.scholar,{day:9,dayTicks:0,actionClock:0,kcal:2000,health:100,hydration:100,monster:null});G.dayPart=0;G.pendingEncounter=null;G.worldMonsters().length=0;
 G.state.scholar.inventory.push({material:'stone',units:mode==='short'?2:3,name:'Stone',kcalEach:0,spoilDay:9999,kg:0.3});
 G.state.activeAidQuest={id:'aid-save-proof',kind:'fetch',sinceDay:9,deadlineDay:12,title:'THE SMOOTH ONES',need:{stoneUnits:3},needText:'hand over 3 stone (any)',rewardKind:'ability'};
 G.state.aidQuestLedger={lastOfferDay:9,done:0,failed:0};delete G.state.codex.skills.scrounger;
 assert.equal(G.save(),true);const key=G.state.runKey;assert.equal(G.load(key),true);assert.equal(G.save(),true);const prior=disk.get(key);emit();armed=true;
 if(['nested','throw'].includes(mode)){const teach=G.teachAbilitySkill;G.teachAbilitySkill=function(...args){const r=teach.apply(this,args);assert.equal(this.save(),'deferred');if(mode==='throw')throw Error('prepared aid reward failure');return r;};}
 if(mode==='throw'){assert.throws(()=>G.handInAidQuest(),/prepared aid reward failure/);assert.equal(disk.get(key),prior);assert.equal(G.save(),'settlement_failed');return;}
 const result=G.handInAidQuest();
 if(mode==='short'){assert.equal(result,'short');assert.equal(disk.get(key),prior);assert.equal(writes,0);return;}
 assert.equal(result,'reward-skill');const saved=JSON.parse(disk.get(key));
 assert.equal(saved.activeAidQuest,null,'completed quest immediately durable');assert.equal(saved.aidQuestLedger.done,1);assert.equal(saved.codex.skills.scrounger.level,1,'earned skill immediately durable');
 assert.deepEqual(saved.scholar,G.state.scholar);assert.deepEqual(saved.codex,G.state.codex);assert.equal(saved.scholar.inventory.some(i=>i.material==='stone'),false);assert.equal(writes,1);
 const paid=disk.get(key);assert.equal(G.handInAidQuest(),null);assert.equal(disk.get(key),paid);assert.equal(writes,1);
}
async function main(){
 if(mode)return child();const run=(m,input)=>spawnSync(process.execPath,[__filename,m],{encoding:'utf8',input,maxBuffer:30e6});let cold=0;
 for(const m of ['complete','short','nested','throw','commit-before','commit-after']){
  const r=run(m);assert.equal(r.status,m.startsWith('commit-')?77:0,r.stderr||r.stdout.slice(-1800));
  if(m.startsWith('commit-')){const disk=JSON.parse(r.stdout.split('\n').filter(v=>v.startsWith('AID_DISK ')).at(-1).slice(9));const c=run('recover',JSON.stringify({disk,complete:m==='commit-after'}));assert.equal(c.status,0,c.stderr||c.stdout.slice(-1800));cold++;}
 }
 const removed=run('removed');assert.notEqual(removed.status,0);assert(/completed quest immediately durable/.test(removed.stderr),removed.stderr.slice(-1800));
 console.log(`Aid hand-in settlement: 6 scenarios, ${cold} fresh-process recoveries and actual removed-hook rejection passed`);
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
