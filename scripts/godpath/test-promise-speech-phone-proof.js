'use strict';const K=require('./lib'),P=require('../lib/promise-speech-proof'),T=K.reporter('Promise speech phone proof'),original=P.read(K.ROOT);
T.ok('four actual current role/Continue phone witnesses pass',P.verify(K.ROOT,original).ok);
function reject(name,change){const copy=structuredClone(original);change(copy);T.ok(name,!P.verify(K.ROOT,copy).ok);}
reject('untrusted touch fails',p=>{p.receipts[0].data.sourceWitness.trustedTouches[0].trusted=false;});
reject('stale response bytes fail',p=>{p.receipts[0].data.sourceWitness.networkInputs['src/js/game.js']='stale';});
reject('substituted rendered image bytes fail',p=>{p.receipts[0].data.screenshots[0].sha256='stale';});
reject('changed executed preview helper fails',p=>{p.receipts[0].data.sourceWitness.recipeInputs['scripts/refresh-phone-proofs.js']='stale';});
reject('a hidden or undersized control fails',p=>{p.receipts[0].data.controls[0].width=1;});
reject('a falsely completed blocked promise fails',p=>{const d=p.receipts.find(r=>r.data.kind==='blocked').data;d.trace.find(t=>t.name==='actual offered blocked commitment').state.village.promises[d.scene.vid].kept=true;});
reject('missing visible refusal words fail',p=>{p.receipts.find(r=>r.data.kind==='blocked').data.pages=[];});
reject('borrowed broken-favor identity fails',p=>{p.receipts.find(r=>r.data.kind==='amends').data.trace.find(t=>t.name==='actual expired memory and person card').word.mem.favorId='another-favor';});
reject('wrong apology role fails',p=>{const d=p.receipts.find(r=>r.data.kind==='amends').data;d.trace.find(t=>t.name==='actual amends').log=[];});
reject('lost committed state fails',p=>{p.receipts[0].data.trace.find(t=>t.name==='native Continue').state.scholar.kcal--;});
reject('one phone height cannot replace both',p=>{p.receipts=p.receipts.filter(r=>r.data.height===736);});
T.done();
