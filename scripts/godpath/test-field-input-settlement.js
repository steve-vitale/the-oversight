'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const root=path.resolve(arg('root',path.join(__dirname,'../..'))),K=require(path.join(root,'scripts/godpath/lib'));
function store(initial={}){
 const blobs=new Map(Object.entries(initial));let armed=false,phase='',writes=0;
 const disk=()=>fs.writeSync(1,'FIELD_DISK '+JSON.stringify(Object.fromEntries(blobs))+'\n');
 globalThis.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');if(armed&&run&&phase==='commit-before')process.exit(77);blobs.set(k,String(v));
  if(armed&&run){writes++;disk();if(phase==='commit-after')process.exit(77);}
 }};
 return{blobs,disk,arm:p=>{armed=true;phase=p;},count:()=>writes};
}
async function load(control){
 const read=fs.readFileSync;
 if(control)fs.readFileSync=function(file,...args){let value=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/timeSettlement.js')){
  const source=String(value),changed=control==='no-cell'
   ?source.replace("['doAction','cellInteract','examineCell','craft','tickAction'","['doAction','examineCell','craft','tickAction'")
   :source.replace(/if\(this\.state===state&&state\.scholar===body[^\n]*\)this\.save\(\);/,'if(false)this.save();');
  assert.notEqual(changed,source,'Rejecting control must remove the actual new hook');value=typeof value==='string'?changed:Buffer.from(changed);
 }return value;};
 try{return await K.load({seed:7003,narration:true});}finally{fs.readFileSync=read;}
}
function scene(G){
 K.newRun(G);const s=G.state.scholar,v=G.state.village,x=(v.px??4)+1,y=v.py??4,t=G.map.tiles[y][x];
 Object.assign(t,{type:'meadow',stock:100,vigor:100,detail:Array.from({length:9},()=>Array(9).fill('dirt')),bushSpecies:{'4,4':'blackberry'},plantSpecies:{},detailRegrow:{}});t.detail[4][4]='bush';
 G.map.px=x;G.map.py=y;G.dayPart=0;Object.assign(s,{day:2,dayTicks:0,actionClock:0,mx:4,my:4,insideHaven:false,inventory:[],kcal:1200,health:100,hydration:100,monster:null});
 G.worldMonsters().length=0;G.pendingEncounter=null;G.state.codex.plants.blackberry={level:3};return{x,y};
}
async function act(mode){
 const storage=store(),G=await load(['no-cell','no-paid'].includes(mode)?mode:null),where=scene(G),s=G.state.scholar;
 assert.equal(G.save(),true);const key=G.state.runKey,prior=storage.blobs.get(key);storage.disk();
 const interact=G._cellInteract;let nested;
 G._cellInteract=function(...args){const value=interact.apply(this,args);this.state.fieldInputProbe={afterHarvest:true};
  if(mode==='nested')nested=this.save();
  if(mode==='after-harvest')process.exit(77);
  if(mode==='throw-after-harvest')throw Error('prepared field harvest failure');return value;};
 storage.arm(mode);
 if(['direct-forage','direct-examine'].includes(mode)){
  if(mode==='direct-forage')G.doAction('forage');else G.examineCell(4,4);
  const saved=JSON.parse(storage.blobs.get(key));assert(s.dayTicks>0,'actual direct input pays time');
  assert.equal(saved.scholar.dayTicks,s.dayTicks,'direct input clock committed');
  assert.deepEqual(saved.scholar.inventory,s.inventory,'direct input inventory committed');
  assert.deepEqual(saved.codex,G.state.codex,'direct input knowledge committed');
  assert.equal(storage.count(),1,'one completed direct input payload');
 }else if(mode==='refusal'){
  const ticks=s.dayTicks,kcal=s.kcal,inventory=JSON.stringify(s.inventory);G.cellInteract(8,8);
  assert.equal(s.dayTicks,ticks);assert.equal(s.kcal,kcal);assert.equal(JSON.stringify(s.inventory),inventory);assert.equal(storage.count(),0,'refused input creates no checkpoint');
 }else if(mode==='throw-after-harvest'){
  assert.throws(()=>G.cellInteract(4,4),/prepared field harvest failure/);assert.equal(storage.blobs.get(key),prior,'failed outer input preserves prior bytes');assert.equal(G.save(),'settlement_failed','partial state cannot autosave later');
 }else{
  G.cellInteract(4,4);const saved=JSON.parse(storage.blobs.get(key));
  assert.equal(saved.scholar.dayTicks,s.dayTicks,'whole field input clock committed');assert.equal(s.dayTicks,17,'delegated gather plus actual final interaction tick');
  assert.deepEqual(saved.scholar.inventory,s.inventory,'whole field inventory committed');assert(s.inventory.some(i=>i.units>0),'actual physical harvest');
  assert.equal(saved.fieldInputProbe.afterHarvest,true);assert.deepEqual(saved.run.map.tiles[where.y][where.x].detail,G.map.tiles[where.y][where.x].detail);
  assert.equal(storage.count(),1,'one complete public field payload');if(mode==='nested')assert.equal(nested,'deferred','inner request is not durable success');
 }
 console.log('Field input '+mode+' passed');
}
async function recover(){
 const input=JSON.parse(fs.readFileSync(0,'utf8')),storage=store(input.disk),G=await load(),key=[...storage.blobs.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=storage.blobs.get(key),saved=JSON.parse(raw);
 assert.equal(G.load(key),true);assert.equal(storage.blobs.get(key),raw,'fresh process Continue does not rewrite or replay');
 const complete=input.phase==='commit-after';assert.equal(G.state.scholar.dayTicks,complete?17:0);assert.equal(!!G.state.fieldInputProbe?.afterHarvest,complete);
 for(const name of ['inventory','kcal','health','hydration','energy'])assert.deepEqual(G.state.scholar[name],saved.scholar[name],'fresh canonical '+name);
 console.log('Field recovery '+input.phase+' passed');
}
async function main(){
 const mode=arg('case',null);if(mode==='recover')return recover();if(mode)return act(mode);
 let cases=0,recoveries=0;const run=(mode,input)=>spawnSync(process.execPath,[__filename,'--root',root,'--case',mode],{input,encoding:'utf8',maxBuffer:30e6});
 for(const phase of ['complete','direct-forage','direct-examine','nested','refusal','throw-after-harvest','after-harvest','commit-before','commit-after']){
  const child=run(phase);assert.equal(child.status,['after-harvest','commit-before','commit-after'].includes(phase)?77:0,child.stderr||child.stdout.slice(-3000));cases++;
  if(['after-harvest','commit-before','commit-after'].includes(phase)){
   const rows=child.stdout.split('\n').filter(l=>l.startsWith('FIELD_DISK '));assert(rows.length,'actual transported bytes required');const disk=JSON.parse(rows.at(-1).slice('FIELD_DISK '.length)),recovered=run('recover',JSON.stringify({phase,disk}));assert.equal(recovered.status,0,recovered.stderr||recovered.stdout.slice(-3000));recoveries++;
  }
 }
 for(const control of ['no-cell','no-paid']){const child=run(control);assert.notEqual(child.status,0,'removing '+control+' must reject the proof');assert(/whole field input clock committed|whole field inventory committed/.test(child.stderr),'actual boundary assertion must reject '+control+': '+child.stderr.slice(-1500));cases++;}
 console.log('Field input settlement: '+cases+' scenarios, '+recoveries+' fresh-process recoveries, 2 actual removed-hook controls passed');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
