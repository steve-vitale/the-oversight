'use strict';
const K=require('./lib'),P=require('../lib/combat-turn-proof'),T=K.reporter('native combat turn evidence'),data=P.read(K.ROOT),result=P.verify(K.ROOT,data);
T.ok('current source has complete native phone combat/reload/reader evidence',result.ok,result.errors.join('\n'));
function reject(name,change){const copy=JSON.parse(JSON.stringify(data));change(copy);T.ok(name,!P.verify(K.ROOT,copy).ok);}
reject('stale actual runtime responses fail',d=>{d.receipts[0].data.sourceWitness.networkInputs['src/js/app.js']='stale';});
reject('changed replay code fails',d=>{d.receipts[0].data.sourceWitness.recipeInputs['evidence/2026-10-22/combat-turn-play-r1.cjs']='stale';});
reject('hidden real damage fails',d=>{const e=d.receipts.find(r=>r.kind==='play').data.events[0];e.before=[{key:'p',hp:100}];e.after=[{key:'p',hp:90}];e.summary='No damage';});
reject('duplicated actors after Continue fail',d=>{const r=d.receipts.find(r=>r.kind==='resume').data;r.after.events.push(r.after.events.find(e=>e.detail.phase==='resolved'));});
reject('vanishing selected reader fails',d=>{d.receipts.find(r=>r.kind==='reader').data.visible=false;});
reject('erased Haven preparation fails',d=>{d.receipts.find(r=>r.kind==='play').data.states[0].homeType='forest_floor';});
reject('missing phone coverage fails',d=>{d.receipts.pop();});
T.done();
