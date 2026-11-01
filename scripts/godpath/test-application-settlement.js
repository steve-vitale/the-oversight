'use strict';
// Real day18 application, zero-time public decisions and abrupt process loss.
const assert=require('assert/strict'),fs=require('fs'),z=require('zlib'),cp=require('child_process'),K=require('./lib');
const [operation,phase]=process.argv.slice(2),copy=x=>JSON.parse(JSON.stringify(x));
async function child(){
 const disk=new Map();let armed=false,writes=0;
 const emit=()=>fs.writeSync(1,'APPLICATION_DISK '+JSON.stringify(Object.fromEntries(disk))+'\n');
 global.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,removeItem:k=>disk.delete(k),setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');
  if(armed&&run&&phase==='commit-before')process.exit(77);
  if(armed&&run&&phase==='quota')throw Error('prepared application quota failure');
  disk.set(k,String(v));if(armed&&run){writes++;emit();if(phase==='commit-after')process.exit(77);}
 }};
 const read=fs.readFileSync;
 if(phase==='removed')fs.readFileSync=function(file,...args){let value=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/timeSettlement.js')){
  const before=String(value),after=before.replace("for(const name of ['acceptApplication','refuseApplication'])","for(const name of [])");assert.notEqual(after,before,'actual admission hook must be removed');value=typeof value==='string'?after:Buffer.from(after);
 }return value;};
 let G;try{G=await K.load({seed:2020962499,narration:true});}finally{fs.readFileSync=read;}
 if(operation==='recover'){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));for(const[k,v]of Object.entries(input.disk))disk.set(k,v);
  const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=disk.get(key),saved=JSON.parse(raw);
  assert(G.load(key));assert.equal(disk.get(key),raw,'Continue leaves committed bytes unchanged');
  assert.deepEqual(copy(G.state.scholar),saved.scholar);assert.deepEqual(copy(G.state.codex),saved.codex);
  assert.deepEqual(copy(G.state.village.mship),saved.village.mship,'arrival/refusal survives fresh process');
  assert.deepEqual(copy(G.state.village.trust),saved.village.trust);assert.deepEqual(copy(G.state.village.betrayal),saved.village.betrayal);
  return;
 }
 const profile=JSON.parse(z.gunzipSync(fs.readFileSync(K.ROOT+'/evidence/2026-10-31/application-checkpoint-r1/day18-before-accept-profile.json.gz')));
 for(const row of profile.origins[0].localStorage)disk.set(row.name,row.value);
 const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-'));assert(G.load(key));assert(G.mshipState().applications.some(a=>a.id==='amina_diallo'));
 assert(G.save());const prior=disk.get(key),body=copy(G.state.scholar);emit();armed=true;
 const say=G.say;G.say=function(...args){const result=say.apply(this,args);
  if(phase==='nested')assert.equal(this.save(),'deferred','inner narration cannot commit a partial decision');
  if(phase==='after-effect')process.exit(77);
  if(phase==='throw')throw Error('prepared admission narration failure');return result;
 };
 const method=operation==='accept'?'acceptApplication':'refuseApplication',id=phase==='missing'?'no-such-application':'amina_diallo';
 if(phase==='throw'){
  assert.throws(()=>G[method](id),/prepared admission narration failure/);assert.equal(disk.get(key),prior);assert.equal(G.save(),'settlement_failed');return;
 }
 const result=G[method](id);
 if(phase==='missing'){assert.equal(result,null);assert.equal(writes,0);assert.equal(disk.get(key),prior);return;}
 assert.equal(result,true,'preserve public boolean contract');
 assert.equal(G.state.scholar.day,body.day);assert.equal(G.state.scholar.dayTicks,body.dayTicks);assert.equal(G.state.scholar.kcal,body.kcal,'admission has no invented food or time cost');
 if(phase==='quota'){assert.equal(disk.get(key),prior);assert.equal(writes,0);return;}
 const saved=JSON.parse(disk.get(key));
 assert(!saved.village.mship.applications.some(a=>a.id===id),'complete admission decision immediately durable');
 const arrivals=saved.village.mship.arrivals.filter(a=>a.id===id);assert.equal(arrivals.length,operation==='accept'?1:0);
 if(operation==='accept'){assert.equal(arrivals[0].status,'accepted');assert(arrivals[0].arriveDay>=body.day+2&&arrivals[0].arriveDay<=body.day+4);}
 assert.deepEqual(saved.scholar,copy(G.state.scholar));assert.deepEqual(saved.codex,copy(G.state.codex));assert.deepEqual(saved.village,copy(G.state.village),'journal/reputation/wrapper consequences are complete');assert.equal(writes,1);
 const completed=disk.get(key);assert.equal(G[method](id),null,'replay consumes nothing');assert.equal(writes,1);assert.equal(disk.get(key),completed);
}
(async()=>{
 if(operation)return child();let count=0,cold=0;
 const run=(op,p,input)=>cp.spawnSync(process.execPath,[__filename,op,p||''],{encoding:'utf8',input,maxBuffer:30e6,timeout:120000});
 for(const op of ['accept','refuse']){
  for(const p of ['normal','nested','missing','throw','quota','after-effect','commit-before','commit-after']){
   const abrupt=['after-effect','commit-before','commit-after'].includes(p),r=run(op,p);assert.equal(r.status,abrupt?77:0,r.stderr||r.stdout.slice(-1600));count++;
   if(abrupt){const raw=r.stdout.split('\n').filter(s=>s.startsWith('APPLICATION_DISK ')).at(-1);assert(raw);const recovered=run('recover','',JSON.stringify({disk:JSON.parse(raw.slice(17))}));assert.equal(recovered.status,0,recovered.stderr||recovered.stdout.slice(-1600));cold++;}
  }
  const removed=run(op,'removed');assert.notEqual(removed.status,0);assert(/complete admission decision immediately durable/.test(removed.stderr),'actual removed checkpoint must reject missing durability: '+removed.stderr.slice(-1600));
 }
 console.log('Application settlement: '+count+' scenarios, '+cold+' fresh-process recoveries and 2 actual removed-hook rejections passed');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
