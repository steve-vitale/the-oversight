'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib'),assert=require('assert/strict');
const K=require('./lib'),R=require('../lib/combat-capture-runtime'),P=require('../lib/campaign-prefix'),gear=require('../gear-usage-audit'),T=K.reporter('Complete captured combat runtime');
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-combat-alias-')),memory=new Map();
 globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size;}};
 const entropy=P.entropyObserver();
 try{
  const G=await K.load({seed:7});K.newRun(G);K.fight(G,'ad_break');
  const actual={x:7,y:8,dir:-1,monsterId:'glasswing',veteran:false},stale={x:1,y:2,dir:1,monsterId:'hummice'};
  G.wanderer=actual;G.encounterDone=true;G.pendingInTent=true;G.state.run.wanderer=stale;
  const before=gear.gameplayHash(G.state),rng=entropy.snapshot(),sample=JSON.parse(JSON.stringify({fight:1,state:G.state,runtime:R.capture(G)}));
  assert.equal(before,gear.gameplayHash(G.state));assert.deepEqual(entropy.snapshot(),rng);
  T.ok('recording live aliases leaves actual state/RNG/clock unchanged',true);
  assert.deepEqual(sample.runtime.runProjection.wanderer,actual);assert.deepEqual(sample.state.run.wanderer,stale);
  T.ok('live world actor is captured independently from stale cached run data',true);
  G.wanderer=null;G.encounterDone=false;G.pendingInTent=false;G.log=['Unrelated preparation log'];
  K.restoreCombatCapture(G,{state:sample.state,fight:sample.runtime.tbfight,bearer:sample.state.scholar.villagerId,map:sample.runtime.map,location:sample.state.run.location,dayPart:sample.runtime.dayPart,people:[]});R.restore(G,sample.runtime);
  assert.deepEqual(G.wanderer,actual);assert.equal(G.encounterDone,true);assert.equal(G.pendingInTent,true);assert.equal(G.ap,sample.runtime.ap);
  T.ok('restoration uses every observed alias instead of fresh-run defaults',true);
  const scholar=structuredClone(G.state.scholar);G.save();const payload=JSON.parse(memory.get(G.state.runKey)),{tbfight,...projection}=payload.run;
  assert.deepEqual(projection,sample.runtime.runProjection);assert.deepEqual(payload.scholar,scholar);
  T.ok('real native save preserves whole scholar and complete live run projection',true);
  const budget=x=>({key:x.key,hp:x.hp,maxHp:x.maxHp,mx:x.mx,my:x.my,acted:x.acted,moveLeft:x.moveLeft});
  assert.deepEqual(tbfight.fighters.map(budget),sample.runtime.tbfight.fighters.map(budget));T.ok('real fighter health/positions/action/movement budgets survive',true);
  assert.throws(()=>R.restore(G,{dayPart:0}),/complete live run projection/);
  const missing=structuredClone(sample.runtime);delete missing.runProjection.wanderer;assert.throws(()=>R.restore(G,missing),/Explicit actual/);
  T.ok('missing legacy or world-actor observations are refused',true);
  const input=path.join(temp,'capture.json.gz'),output=path.join(temp,'save.json.gz');
  fs.writeFileSync(input,z.gzipSync(JSON.stringify({schemaVersion:R.SCHEMA_VERSION,starts:[sample]})));
  cp.execFileSync(process.execPath,['scripts/prepare-combat-trace-save.js',input,'1',output],{cwd:K.ROOT,encoding:'utf8',maxBuffer:1024*1024});
  const cli=JSON.parse(z.gunzipSync(fs.readFileSync(output))),{tbfight:cliFight,...cliProjection}=cli.payload.run;
  assert.deepEqual(cliProjection,sample.runtime.runProjection);assert.deepEqual(cli.payload.scholar,sample.state.scholar);
  T.ok('actual separate-process exporter preserves the live actor and whole scholar',true);
  const old=path.join(temp,'old.json.gz'),refused=path.join(temp,'refused.json.gz');fs.writeFileSync(old,z.gzipSync(JSON.stringify({starts:[sample]})));
  const result=cp.spawnSync(process.execPath,['scripts/prepare-combat-trace-save.js',old,'1',refused],{cwd:K.ROOT,encoding:'utf8'});
  assert.notEqual(result.status,0);assert(!fs.existsSync(refused));T.ok('exporter cannot silently relabel an old incomplete capture',true);
 }finally{
  entropy.restore();const owned=fs.realpathSync(temp),parent=fs.realpathSync(os.tmpdir());assert.equal(path.dirname(owned),parent);assert(path.basename(owned).startsWith('oversight-combat-alias-'));fs.rmSync(owned,{recursive:true,force:true});
 }
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
