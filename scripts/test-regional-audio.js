#!/usr/bin/env node
'use strict';
const assert=require('assert/strict'),crypto=require('crypto'),fs=require('fs'),path=require('path'),K=require('./godpath/lib');
let checks=0;function check(label,value){assert(value,label);checks++;console.log('PASS '+label);}
function context(){
 const nodes=[],buffers=[];const param=()=>({value:0,calls:[],setValueAtTime(v,t){this.calls.push(['set',v,t]);},exponentialRampToValueAtTime(v,t){assert(v>0&&Number.isFinite(v)&&Number.isFinite(t));this.calls.push(['ramp',v,t]);}});
 const node=kind=>{const n={kind,gain:param(),frequency:param(),Q:param(),links:[],disconnected:0,starts:[],stops:[],connect(to){this.links.push(to);},disconnect(){this.disconnected++;},start(t){this.starts.push(t);},stop(t){this.stops.push(t);}};nodes.push(n);return n;};
 return {currentTime:7,sampleRate:8000,nodes,buffers,createGain:()=>node('gain'),createOscillator:()=>node('oscillator'),createBufferSource:()=>node('source'),createBiquadFilter:()=>node('filter'),createBuffer(ch,n,rate){const data=new Float32Array(n);buffers.push(data);return {getChannelData(){return data;}};}};
}
(async()=>{
 const seed=Number(process.env.SEED||20261017),G=await K.load({seed,narration:true}),R=globalThis.Scattering.regionalAudio;
 check('shared production module loads through index',!!R&&Object.keys(R.monsters).length===10&&Object.keys(R.specs).length===12);
 const app=fs.readFileSync(path.join(__dirname,'../src/js/app.js'),'utf8');
 check('production app installs shared renderer before dispatch assignment',app.includes('globalThis.Scattering.regionalAudio.install(CombatAudio);')&&app.indexOf('regionalAudio.install(CombatAudio)')<app.indexOf('Game.audio = CombatAudio;'));
 const renderRows=[];
 for(const hook of Object.keys(R.specs)){
  const ctx=context(),sfx={mixer:true};let muted=false;const audio={port:()=>muted?null:({ctx,sfx})};R.install(audio);
  const random=Math.random;let receipt;
  try{Math.random=()=>{throw Error('audio consumed gameplay RNG');};receipt=audio[hook]();}finally{Math.random=random;}
  check(hook+': actual installed hook schedules bounded sound',receipt?.hook===hook&&receipt.duration>0&&receipt.duration<2&&ctx.nodes.some(n=>n.starts.length));
  check(hook+': sound reaches supplied effects mixer',ctx.nodes.some(n=>n.kind==='gain'&&n.links.includes(sfx)));
  check(hook+': mixer and envelope have nonzero gain',ctx.nodes.some(n=>n.links.includes(sfx)&&n.gain.value>0.1)&&ctx.nodes.some(n=>n.gain.calls.some(c=>c[0]==='ramp'&&c[1]>=0.1)));
  check(hook+': deterministic noise has finite nonzero samples',ctx.buffers.length>0&&ctx.buffers.every(b=>b.some(x=>x!==0)&&b.every(Number.isFinite)));
  const stopCount=ctx.nodes.reduce((n,x)=>n+x.stops.length,0);receipt.stop();receipt.stop();
  check(hook+': explicit stop cancels once',ctx.nodes.reduce((n,x)=>n+x.stops.length,0)>stopCount&&ctx.nodes.filter(n=>n.starts.length).every(n=>n.stops.length===2));
  for(const n of ctx.nodes.filter(n=>n.starts.length))n.onended();
  check(hook+': completed voice disconnects graph',ctx.nodes.every(n=>n.disconnected===1));
  muted=true;const nodesBeforeMute=ctx.nodes.length;
  check(hook+': muted mixer schedules no nodes',audio[hook]()===null&&ctx.nodes.length===nodesBeforeMute);
  renderRows.push({hook,duration:receipt.duration,nodes:receipt.nodes,noiseHash:crypto.createHash('sha256').update(Buffer.from(ctx.buffers[0].buffer)).digest('hex')});
 }
 check('all authored voices have distinct deterministic noise',new Set(renderRows.map(r=>r.noiseHash)).size===12);
 check('unknown or unavailable voice does not allocate audio',R.play('missing',null)===null&&R.play('wireCrackle',null)===null);
 const emitted=[];
 for(const [id,voice] of Object.entries(R.monsters)){
  G.debugRegion='na_eastern_woodlands';K.newRun(G,'Columbus, Ohio');
  // Harness deliberately silences audio. Observe its boundary here; native
  // proof separately exercises actual Game.audioEvent -> mixer -> Web Audio.
  const def=G.data.monsters.find(m=>m.id===id), originalAttacks=def.attacks;
  // Isolate the actual authored instant move for the silent-contact contrast.
  if(!voice.notice){def.attacks=originalAttacks.filter(a=>['ambush','rush'].includes(a.pattern?.type));assert(def.attacks.length);}
  const events=[];G.audioEvent=(name,data)=>events.push({name,data});
  const damage=G.tbDamage;
  G.tbDamage=function(key,n,...rest){const target=G.tbFighter(key),hp=target?.hp,entry={name:'$damage',key,n};events.push(entry);const out=damage.call(this,key,n,...rest);entry.change=hp-(target?.hp);return out;};
  G.startCombat(id);const f=G.tbfight,m=f?.fighters.find(m=>m.monsterId===id),p=G.tbFighter('p');
  check(id+': actual encounter starts',!!m&&!!p&&f&&!f.over);
  check(id+': actual combat start respects configured notice or silence',voice.notice?events.some(e=>e.name===voice.notice):(!events.some(e=>e.name===voice.aggro)||events.findIndex(e=>e.name===voice.aggro)>events.findIndex(e=>e.name==='$damage'&&e.change>0)));
  const at=voice.notice?events.length:0;p.hp=p.maxHp=10000;G.state.scholar.health=10000;
  let turns=0;
  while(G.inCombat()&&!events.slice(at).some(e=>e.name===voice.aggro)&&turns++<20){if(!G.tbIsPlayerTurn())G.tbAdvance();if(G.inCombat())G.tbPlayerEndTurn();}
  if(!events.slice(at).some(e=>e.name===voice.aggro))console.error('AUDIO_EMISSION_DEBUG '+JSON.stringify({id,turns,round:f.round,result:f.result,over:f.over,phase:m.phase,telegraph:m.telegraph,m:{mx:m.mx,my:m.my,hp:m.hp},p:{mx:p.mx,my:p.my,hp:p.hp},events:events.slice(-8)}));
  check(id+': actual turn driver emits configured declaration',events.slice(at).some(e=>e.name===voice.aggro)&&turns<20);
  check(id+': game and Lab share registered callable voices',(!voice.notice||typeof R.specs[voice.notice]==='object')&&typeof R.specs[voice.aggro]==='object');
  if(!voice.notice){const firstVoice=events.findIndex(e=>e.name===voice.aggro),firstHit=events.findIndex(e=>e.name==='$damage'&&e.change>0);check(id+': ambush voice starts only after real damage',firstHit>=0&&firstVoice>firstHit);}
  G.tbDamage=damage;def.attacks=originalAttacks;
  emitted.push({id,preparedAuthoredInstant:!voice.notice,notice:voice.notice,aggro:voice.aggro,turns,events:events.filter(e=>e.name===voice.notice||e.name===voice.aggro)});
 }
 const w={};new Function('window',fs.readFileSync(path.join(__dirname,'../tools/audio-lab-data.js'),'utf8'))(w);
 check('Lab has every current creature exactly once',w.AUDIO_LAB_DATA.monsters.length===G.data.monsters.length&&new Set(w.AUDIO_LAB_DATA.monsters.map(m=>m.id)).size===G.data.monsters.length);
 for(const [id,voice] of Object.entries(R.monsters)){const entry=w.AUDIO_LAB_DATA.monsters.find(m=>m.id===id);check(id+': honest labeled Lab entry uses the same voice',entry?.hook===voice.aggro&&entry.synth===voice.aggro&&entry.origin==='gap'&&entry.source.includes('no field recording registered')&&entry.why===voice.why);}
 console.log('REGIONAL_AUDIO_RESULT '+JSON.stringify({seed,checks,renderRows,emitted}));
 console.log(`regional-audio proof green: ${checks} checks`);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
