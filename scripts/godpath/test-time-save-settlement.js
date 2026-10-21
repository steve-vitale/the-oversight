'use strict';
const K=require('./lib'),assert=require('assert/strict'),cp=require('child_process');
const kinds=['endDay','advancePart','tickAction','sleep'];
async function scenario(kind){
 const blobs=new Map(),writes=[];globalThis.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,setItem(k,v){blobs.set(k,String(v));if(k.startsWith('scattering-save-v1-'))writes.push(JSON.parse(v));},removeItem:k=>blobs.delete(k)};
 const G=await K.load({seed:7002,narration:true});K.newRun(G);const s=G.state.scholar;
 // Declared midnight boundary and protected sleeper. No gameplay tuning.
 G.map.px=4;G.map.py=4;s.insideHaven=true;G.location='haven';G.tbfight=null;G.pendingEncounter=false;s.monster=null;
 s.day=2;s.dayTicks=kind==='sleep'?384:511;s.actionClock=0;G.dayPart=3;s.kcal=2400;s.hydration=100;s.health=80;s.energy=30;
 G.state.village.pantry=[{name:'Prepared food',units:100,kcalEach:200,spoilDay:9999,foodKind:'plant',foodState:'ready',edible:true}];
 // Inject work at real pre-core and post-core hook points; the original hooks
 // still execute. These marked writes expose the actual persistence boundary.
 const pre=G.progDaily,post=G.overtimeTick;let calls=0;
 G.progDaily=function(){this.state.overnightProbe={before:++calls};this.save();return pre.apply(this,arguments);};
 G.overtimeTick=function(){const r=post.apply(this,arguments);this.state.overnightProbe.after=true;this.save();return r;};
 assert.equal(G.save(),true);writes.length=0;
 if(kind==='tickAction')G.tickAction(1);else G[kind]();
 const key=G.state.runKey,stored=JSON.parse(blobs.get(key));
 assert.equal(G.over,false,'prepared run stays alive');assert.equal(G.state.scholar.day,3,'one dawn');
 assert.equal(writes.length,1,kind+': only one complete run payload reaches storage');
 assert(writes.every(x=>x.run.dayPart>=0&&x.run.dayPart<4&&x.scholar.dayTicks<512),'every committed clock is coherent');
 assert.equal(stored.overnightProbe.before,1);assert.equal(stored.overnightProbe.after,true,'post-core hooks included');
 assert.equal(stored.scholar.health,G.state.scholar.health,'sleep healing settled');assert.equal(stored.scholar.energy,G.state.scholar.energy,'sleep recovery settled');
 assert.equal(stored.scholar.kcal,G.state.scholar.kcal,'night metabolism/sleep conservation settled');
 const expected=JSON.stringify({day:stored.scholar.day,kcal:stored.scholar.kcal,health:stored.scholar.health,energy:stored.scholar.energy,probe:stored.overnightProbe});
 assert.equal(G.load(key),true);assert.equal(JSON.stringify({day:G.state.scholar.day,kcal:G.state.scholar.kcal,health:G.state.scholar.health,energy:G.state.scholar.energy,probe:G.state.overnightProbe}),expected,'Continue restores the committed result without replay');
 console.log(JSON.stringify({kind,checks:11,writes:writes.length,day:G.state.scholar.day}));
}
if(process.argv[2])scenario(process.argv[2]).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{let failed=0;for(const kind of kinds){const r=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',maxBuffer:2e6});process.stdout.write(r.stdout);if(r.status){failed++;process.stderr.write(r.stderr);}}console.log('Time-save settlement: '+(kinds.length-failed)+'/'+kinds.length+' scenarios passed');if(failed)process.exitCode=1;}
