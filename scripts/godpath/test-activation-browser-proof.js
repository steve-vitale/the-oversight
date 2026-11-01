'use strict';
const K=require('./lib'),P=require('../lib/activation-preview-proof'),T=K.reporter('native activation evidence'),data=P.read(K.ROOT),result=P.verify(K.ROOT,data);
T.ok('current source has ten native paid/free/Continue phone witnesses',result.ok,result.errors.join('\n'));
function reject(label,change){const d=JSON.parse(JSON.stringify(data));change(d);T.ok(label,!P.verify(K.ROOT,d).ok);}
reject('stale served ability code fails',d=>{d.receipts[0].data.sourceWitness.networkInputs['src/js/foodPower.js']='stale';});
reject('a free cast consuming the action fails',d=>{d.receipts.find(r=>r.data.scene==='stoke').data.trace.find(t=>t.label==='native activation').fight.fighters.find(f=>f.key==='p').acted=true;});
reject('a false calorie price fails',d=>{d.receipts[0].data.card=d.receipts[0].data.card.replace(/Cost: \d+ kcal/,'Cost: 999 kcal');});
reject('lost prepared aim after Continue fails',d=>{d.receipts.find(r=>r.data.scene==='aim').data.trace.find(t=>t.label==='native full-payload Continue').state.scholar.aimBonus=null;});
reject('a hidden blocked reason fails',d=>{d.receipts.find(r=>r.data.scene!=='stoke').data.blocked.visible=false;});
reject('a different reason cannot stand in for the actual refusal',d=>{d.receipts.find(r=>r.data.scene!=='stoke').data.blocked.expected='unrelated refusal';});
reject('an offscreen blocked explanation fails',d=>{d.receipts.find(r=>r.data.scene!=='stoke').data.blocked.rect.y=9999;});
reject('a missing height/scenario fails',d=>{d.receipts.pop();});T.done();
