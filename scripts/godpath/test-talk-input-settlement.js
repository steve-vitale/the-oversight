'use strict';
// Actual retained day13 request, complete initialized inputs and process loss.
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),{spawnSync}=require('child_process'),K=require('./lib');
const [operation,phase]=process.argv.slice(2),copy=x=>JSON.parse(JSON.stringify(x));
async function child(){
 const disk=new Map();let armed=false,writes=0;
 const emit=()=>console.log('TALK_DISK '+JSON.stringify(Object.fromEntries(disk)));
 global.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,removeItem:k=>disk.delete(k),setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');if(armed&&run&&phase==='commit-before')process.exit(77);
  if(armed&&run&&phase==='quota')throw Error('prepared storage quota failure');
  disk.set(k,String(v));if(armed&&run){writes++;emit();if(phase==='commit-after')process.exit(77);}
 }};
 const read=fs.readFileSync;
 if(phase==='removed')fs.readFileSync=function(file,...args){let value=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/timeSettlement.js')){const before=String(value),hook=operation==='open'?'startConvo':'convoTurn',after=before.replace('game.'+hook+'=function','game.__removed'+hook+'=function');assert.notEqual(after,before);value=typeof value==='string'?after:Buffer.from(after);}return value;};
 let G;try{G=await K.load({seed:2020962499,narration:true});}finally{fs.readFileSync=read;}
 if(operation==='recover'){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));for(const [k,v]of Object.entries(input.disk))disk.set(k,v);
  const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=disk.get(key),saved=JSON.parse(raw);
  // Existing load settles ordinary active chats as a walk-away. A reply
  // earns the authored endConvo diplomat practice (+1 surge resonance).
  // This actual bearer owns no diplomat entry; no other scholar field may change.
  const expected=copy(saved.scholar),active=Object.values(saved.village.conv||{}).filter(c=>c.active&&(c.exchanges||0)>=1);
  assert(!(expected.abilities||[]).concat(expected.backgroundAbilities||[]).some(a=>a.id==='diplomat'));
  if(active.length)expected.prog.surgeResonance=(expected.prog.surgeResonance||0)+active.length;
  assert(G.load(key));assert.equal(disk.get(key),raw,'Continue does not rewrite committed bytes');assert.deepEqual(copy(G.state.scholar),expected,'whole scholar including narrowly specified existing walk-away practice');
  assert.deepEqual(copy(G.state.village.talkRequests),saved.village.talkRequests,'Continue preserves actual request outcome');
  for(const [id,c]of Object.entries(saved.village.conv||{}))assert.deepEqual(copy(G.state.village.conv[id].transcript.slice(0,c.transcript.length)),c.transcript,'load may settle chat but retains committed words');
  return;
 }
 const profile=JSON.parse(z.gunzipSync(fs.readFileSync(K.ROOT+'/evidence/2026-10-29/earned-evolution-r1/day13-unanswerable-rumor-profile.json.gz')));
 for(const e of profile.origins[0].localStorage)disk.set(e.name,e.value);
 const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-'));assert(G.load(key));const vid='meera_reddy';
 if(operation!=='open'){const opened=G.startConvo(vid);assert(!opened.ended);assert(G.activeTalkRequest(vid));}
 assert.equal(G.save(),true);const prior=disk.get(key);emit();armed=true;
 const hook=operation==='close'?'endConvo':'sayLine',original=G[hook];let calls=0;
 if(['nested','throw-effect','after-effect'].includes(phase))G[hook]=function(...args){const result=original.apply(this,args);calls++;assert.equal(this.save(),'deferred','inner request is not durable success');if(phase==='after-effect')process.exit(77);if(phase==='throw-effect')throw Error('prepared completed conversation callback failure');return result;};
 const act=()=>operation==='open'?G.startConvo(vid):G.convoTurn(vid,operation==='close'?'leave':G.convoChoices(vid).find(c=>c.id.startsWith('request:')&&c.id.endsWith(':start:clarify')).id);
 if(phase==='throw-effect'){assert.throws(act,/prepared completed conversation callback failure/);assert(calls);assert.equal(disk.get(key),prior);assert.equal(G.save(),'settlement_failed');return;}
 const result=act();if(phase==='nested')assert(calls);
 if(phase==='quota'){assert.equal(result.conversationSave,false);assert.equal(disk.get(key),prior);return;}
 assert.equal(result.conversationSave,true,'complete conversation input exposes durable success');assert.equal(writes,1,'one final canonical write');
 const saved=JSON.parse(disk.get(key));assert.deepEqual(saved.scholar,copy(G.state.scholar));assert.deepEqual(saved.codex,copy(G.state.codex));assert.deepEqual(saved.village,copy(G.state.village));
 if(operation==='open')assert.equal(saved.village.conv[vid].active,true);
 if(operation==='close')assert.equal(saved.village.conv[vid].active,false);
 if(operation==='reply')assert.equal(saved.village.talkRequests[vid].request.answered,true);
}
(async()=>{
 if(operation)return child();let cases=0,cold=0;
 const run=(op,p,input)=>spawnSync(process.execPath,[__filename,op,p||''],{encoding:'utf8',input,maxBuffer:30e6,timeout:120000});
 for(const op of ['open','reply','close']){
  for(const p of ['normal','nested','throw-effect','quota','after-effect','commit-before','commit-after']){
   const abrupt=['after-effect','commit-before','commit-after'].includes(p),r=run(op,p);assert.equal(r.status,abrupt?77:0,r.stderr||r.stdout.slice(-1800));cases++;
   if(abrupt){const rows=r.stdout.split('\n').filter(x=>x.startsWith('TALK_DISK ')),disk=JSON.parse(rows.at(-1).slice(10)),recovered=run('recover','',JSON.stringify({disk}));assert.equal(recovered.status,0,recovered.stderr);cold++;}
  }
  const removed=run(op,'removed');assert.notEqual(removed.status,0);assert(/complete conversation input exposes durable success/.test(removed.stderr),'removed actual input hook must reject durable success: '+removed.stderr.slice(-1800));
 }
 console.log('Conversation input settlement: '+cases+' scenarios, '+cold+' fresh-process recoveries and 3 actual removed-hook rejections passed');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
