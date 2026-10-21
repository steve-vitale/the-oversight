'use strict';
const K=require('./lib'),assert=require('assert/strict'),cp=require('child_process');
const phases=['precore-request','postcore-request','commit-before','commit-after','index-before'];
async function child(phase){
 const blobs=new Map();let armed=false;
 const disk=()=>console.log('@@DISK@@'+JSON.stringify(Object.fromEntries(blobs)));
 globalThis.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');
  if(armed&&((run&&phase==='commit-before')||(k==='scattering-saves-index'&&phase==='index-before')))process.exit(77);
  blobs.set(k,String(v));if(armed)disk();if(armed&&run&&phase==='commit-after')process.exit(77);
 }};
 const G=await K.load({seed:7002});K.newRun(G);G.state.scholar.day=2;G.state.scholar.dayTicks=511;G.state.scholar.actionClock=0;G.dayPart=3;
 G.state.scholar.kcal=2400;G.state.scholar.hydration=100;G.state.scholar.health=100;
 const pre=G.progDaily,post=G.overtimeTick;
 G.progDaily=function(){const r=pre.apply(this,arguments);this.state.crashProbe={pre:true};this.save();if(phase==='precore-request')process.exit(77);return r;};
 G.overtimeTick=function(){const r=post.apply(this,arguments);this.state.crashProbe.post=true;this.save();if(phase==='postcore-request')process.exit(77);return r;};
 assert.equal(G.save(),true);disk();armed=true;G.tickAction(1);throw Error('Crash phase was never reached');
}
async function recover(){
 const input=JSON.parse(require('fs').readFileSync(0,'utf8')),blobs=new Map(Object.entries(input.disk));
 globalThis.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,setItem:(k,v)=>blobs.set(k,String(v)),removeItem:k=>blobs.delete(k)};
 const G=await K.load({seed:7002}),key=[...blobs.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=JSON.parse(blobs.get(key)),before=JSON.stringify(blobs.get(key));
 assert.equal(G.load(key),true);assert.equal(JSON.stringify(blobs.get(key)),before,'Continue does not rewrite/replay the checkpoint');
 assert.equal(G.state.scholar.day,input.next?3:2);assert.equal(G.dayPart,input.next?0:3);
 assert.equal(G.state.scholar.dayTicks,input.next?0:511);assert.equal(!!G.state.crashProbe?.pre,input.next);assert.equal(!!G.state.crashProbe?.post,input.next);
 for(const k of ['health','kcal','energy','hydration'])assert.equal(G.state.scholar[k],raw.scholar[k],k+' is restored exactly, without another night');
 assert.equal(G.listSaves().length,1);assert.equal(G.save(),true,'normal saving works after recovery');
 console.log('Recovered '+input.phase+' day'+G.state.scholar.day);
}
async function main(){
 if(process.argv[2]==='recover')return recover();if(process.argv[2])return child(process.argv[2]);
 for(const phase of phases){const r=cp.spawnSync(process.execPath,[__filename,phase],{encoding:'utf8',maxBuffer:20e6});assert.equal(r.status,77,r.stderr||phase);
  const snapshots=r.stdout.split('\n').filter(l=>l.startsWith('@@DISK@@')).map(l=>JSON.parse(l.slice(8)));assert(snapshots.length);
  const result=cp.spawnSync(process.execPath,[__filename,'recover'],{encoding:'utf8',input:JSON.stringify({phase,disk:snapshots.at(-1),next:phase==='commit-after'||phase==='index-before'}),maxBuffer:2e6});
  assert.equal(result.status,0,result.stderr);process.stdout.write(result.stdout);
 }console.log('Time-save abrupt exits: 5/5 independent recovery processes passed');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
