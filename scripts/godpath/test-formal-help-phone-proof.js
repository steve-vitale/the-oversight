'use strict';const K=require('./lib'),P=require('../lib/formal-help-phone-proof'),T=K.reporter('Formal help phone proof'),original=P.read(K.ROOT);
T.ok('eight actual current formal help/Continue witnesses pass',P.verify(K.ROOT,original).ok);
function reject(label,change){const p=structuredClone(original);change(p);T.ok(label,!P.verify(K.ROOT,p).ok);}
reject('untrusted input fails',p=>{p.receipts[0].data.sourceWitness.trustedTouches[0].trusted=false;});
reject('stale loaded response fails',p=>{p.receipts[0].data.sourceWitness.networkInputs['src/js/conversation.js']='stale';});
reject('changed executed helper fails',p=>{p.receipts[0].data.sourceWitness.recipeInputs['scripts/refresh-phone-proofs.js']='stale';});
reject('borrowed screenshot bytes fail',p=>{p.receipts[0].data.screenshots[0].sha256='borrowed';});
reject('undersized control fails',p=>{p.receipts[0].data.controls[0].width=1;});
reject('clipped core frame fails',p=>{p.receipts[0].data.trace[0].scroll[2]=2000;});
reject('unpaid Talk fails',p=>{const d=p.receipts[0].data;d.trace.find(t=>t.name==='prepared known goal subject menu').state.scholar.kcal++;});
reject('false grateful refusal fails',p=>{p.receipts.find(r=>r.data.kind==='broken').data.pages=['"Thank you!"'];});
reject('settled vow disguised as renewal fails',p=>{const d=p.receipts.find(r=>r.data.kind==='kept').data;d.trace.find(t=>t.name==='actual offered formal help').state.village.promises[d.scene.vid].kept=true;});
reject('amends without a new vow fails',p=>{const d=p.receipts.find(r=>r.data.kind==='amends').data;delete d.trace.find(t=>t.name==='actual offered formal help').state.village.promises[d.scene.vid];});
reject('deflection replacing history fails',p=>{const d=p.receipts.find(r=>r.data.kind==='deflected').data;d.trace.find(t=>t.name==='actual offered formal help').state.village.promises[d.scene.vid].kept=false;});
reject('last action missing from committed bytes fails',p=>{p.receipts[0].data.committed.scholar.kcal--;});
reject('lost resource on Continue fails',p=>{p.receipts[0].data.trace.find(t=>t.name==='native Continue').state.scholar.kcal--;});
reject('one size cannot replace both fails',p=>{p.receipts=p.receipts.filter(r=>r.data.height===736);});
T.done();
