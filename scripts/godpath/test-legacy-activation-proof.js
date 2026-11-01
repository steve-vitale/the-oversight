'use strict';
const K=require('./lib'),P=require('../lib/legacy-activation-proof'),T=K.reporter('legacy native activation evidence'),data=P.read(K.ROOT),result=P.verify(K.ROOT,data);T.ok('current source has fourteen legacy eligibility/payment/Continue phone witnesses',result.ok,result.errors.join('\n'));
function reject(label,change){const copy=JSON.parse(JSON.stringify(data));change(copy);T.ok(label,!P.verify(K.ROOT,copy).ok);}
reject('stale served dispatcher fails',d=>{d.receipts[0].data.sourceWitness.networkInputs['src/js/game.js']='stale';});
reject('a refusal consuming food fails',d=>{d.receipts.find(r=>r.data.scene==='combat-499').data.trace.find(t=>t.label==='native attempted activation').state.scholar.kcal--;});
reject('an unreadable disabled explanation fails',d=>{d.receipts.find(r=>!r.data.available).data.readability.opacity=.4;});
reject('a paid cast failing to spend the action fails',d=>{d.receipts.find(r=>r.data.scene==='combat-500').data.trace.find(t=>t.label==='native attempted activation').fight.fighters.find(f=>f.key==='p').acted=false;});
reject('losing a dose after Continue fails',d=>{d.receipts.find(r=>r.data.scene==='combat-500').data.trace.find(t=>t.label==='native full-payload Continue').state.scholar.fieldMedDayPart=null;});
reject('missing nearby-body evidence fails',d=>{d.receipts.find(r=>r.data.scene==='red-hunger-ready').data.trace.find(t=>t.label==='prepared native Continue').state.corpses=[];});T.done();
