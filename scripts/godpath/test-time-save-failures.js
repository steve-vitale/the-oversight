'use strict';
const K=require('./lib'),assert=require('assert/strict'),cp=require('child_process');
async function scenario(kind){
 const blobs=new Map();let reject=false,indexFail=false;
 globalThis.localStorage={get length(){return blobs.size;},key:i=>[...blobs.keys()][i]??null,getItem:k=>blobs.get(k)??null,removeItem:k=>blobs.delete(k),setItem(k,v){if((reject&&k.startsWith('scattering-save-v1-'))||(indexFail&&k==='scattering-saves-index'))throw Error('prepared storage failure');blobs.set(k,String(v));}};
 const G=await K.load({seed:7002}),S=globalThis.Scattering;K.newRun(G);const s=G.state.scholar;
 s.day=2;s.dayTicks=511;s.actionClock=0;G.dayPart=3;s.kcal=2400;s.hydration=100;s.health=100;assert.equal(G.save(),true);
 const key=G.state.runKey,prior=blobs.get(key),status=G.status,near=G.checkVillageProximity;let deferred=null;
 const pre=G.progDaily;G.progDaily=function(){deferred=this.save();return pre.apply(this,arguments);};
 if(kind==='throw-before')G.checkVillageProximity=function(){throw Error('prepared before-core failure');};
 if(kind==='throw-after')G.status=function(){if(this.state.scholar.day===3)throw Error('prepared after-core failure');return status.apply(this,arguments);};
 if(kind==='quota')reject=true;if(kind==='index')indexFail=true;
 if(kind==='stale'){const newer=JSON.parse(prior);newer.saveSeq+=50;newer.scholar.kcal=1777;blobs.set(key,JSON.stringify(newer));}
 if(kind==='tombstone')S.state.wipe(key,'prepared ended elsewhere');
 const expected=blobs.get(key),warnings=[],warn=console.warn;console.warn=(...args)=>warnings.push(args.map(String).join(' '));
 try{if(kind.startsWith('throw-'))assert.throws(()=>G.tickAction(1),/prepared .*failure/);else G.tickAction(1);}finally{console.warn=warn;G.status=status;G.checkVillageProximity=near;}
 if(kind==='index')assert.equal(JSON.parse(blobs.get(key)).scholar.day,3,'index failure leaves the complete committed payload');
 else assert(blobs.get(key)===expected,'failed/refused commit never replaces last durable payload');
 if(kind.startsWith('throw-')){
  assert.equal(warnings.length,1,'one reported transaction failure');assert.equal(G.save(),'settlement_failed','later autosave refuses partial memory');
  const day=G.state.scholar.day;G.tickAction(1);assert.equal(G.state.scholar.day,day,'partial night cannot be retried in place');
 }else if(kind==='stale')assert.equal(G.save(),'stale');else if(kind==='tombstone')assert.equal(G.save(),'tombstoned');else assert.equal(G.save(),false);
 if(kind!=='throw-before')assert.equal(deferred,'deferred','nested request never claims durable success');
 reject=false;indexFail=false;
 if(kind==='tombstone'){assert.equal(G.load(key),false,'ended run cannot resurrect');K.newRun(G);assert.equal(G.save(),true);}
 else if(kind==='index'){
  // Payload commit succeeds even if the subsequent index update fails.
  assert.equal(G.load(key),true);assert.equal(G.state.scholar.day,3);assert.equal(G.save(),true);
 }else{assert.equal(G.load(key),true);assert.equal(G.state.scholar.day,2);assert.equal(G.save(),true,'reload clears the failed in-memory transaction');}
 console.log('Time-save failure '+kind+' passed');
}
async function main(){if(process.argv[2])return scenario(process.argv[2]);for(const kind of ['throw-before','throw-after','quota','stale','tombstone','index']){const r=cp.spawnSync(process.execPath,[__filename,kind],{encoding:'utf8',maxBuffer:2e6});assert.equal(r.status,0,r.stderr);process.stdout.write(r.stdout);}console.log('Time-save failures: 6/6 scenarios passed');}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
