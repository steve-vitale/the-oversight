'use strict';
// Explicit prepared replay, not observation or a resumed whole-campaign RNG.
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict'),K=require('./godpath/lib'),B=require('./balance-panel'),R=require('./lib/combat-capture-runtime');
(async()=>{
 const args=process.argv.slice(2);if(args.length!==3)throw Error('Usage: node scripts/prepare-combat-trace-save.js <trace.json.gz> <fight-number> <fresh-save.json.gz>');
 const [file,number,out]=args;assert(!fs.existsSync(out),'Fresh output required');const bytes=fs.readFileSync(file),capture=JSON.parse(z.gunzipSync(bytes));assert.equal(capture.schemaVersion,R.SCHEMA_VERSION,'Recapture with complete live save-projected aliases; old evidence stays historical');const sample=capture.starts.find(x=>x.fight===Number(number));assert(sample,'Captured fight required');
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const G=await K.load({seed:52});K.newRun(G);const source=B.manifest(K.ROOT);
 K.restoreCombatCapture(G,{state:sample.state,fight:sample.runtime.tbfight,bearer:sample.state.scholar.villagerId,map:sample.runtime.map,location:sample.state.run.location,dayPart:sample.runtime.dayPart,people:[]});
 R.restore(G,sample.runtime);
 assert.deepEqual(G.tbfight.fighters,sample.runtime.tbfight.fighters,'No fighter grants or rescaling');
 G.save();const key=G.state.runKey,payload=JSON.parse(memory.get(key));assert(payload.run.tbfight,'Actual native combat save required');
 const fields=x=>({key:x.key,hp:x.hp,maxHp:x.maxHp,mx:x.mx,my:x.my,alive:x.alive,fled:x.fled,acted:x.acted,moveLeft:x.moveLeft});
 assert.deepEqual(payload.run.tbfight.fighters.map(fields),sample.runtime.tbfight.fighters.map(fields));assert.equal(payload.scholar.day,sample.state.scholar.day);
 assert.deepEqual(payload.scholar,sample.state.scholar,'Whole original scholar, resources and equipment');
 const {tbfight,...projection}=payload.run;assert.deepEqual(projection,sample.runtime.runProjection,'Every live save-projected alias, including world actors');
 const producer=Object.fromEntries(['scripts/prepare-combat-trace-save.js','scripts/lib/combat-capture-runtime.js','scripts/godpath/lib.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(K.ROOT,file),'utf8').replace(/\r\n/g,'\n')).digest('hex')]));
 const receipt={schemaVersion:R.SCHEMA_VERSION,producer,scope:'Prepared native save from an actual runtime capture via shared restore helper, complete live save-projected aliases and real Game.save; full-campaign RNG continuation and original native-save identity are not claimed',input:path.relative(K.ROOT,path.resolve(file)).replace(/\\/g,'/'),inputSha256:crypto.createHash('sha256').update(bytes).digest('hex'),fight:Number(number),source,key,payload};
 fs.writeFileSync(out,z.gzipSync(JSON.stringify(receipt)),{flag:'wx'});console.log(JSON.stringify({out,key,day:payload.scholar.day,fighters:payload.run.tbfight.fighters.length}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
