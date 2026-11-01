'use strict';
const K=require('./lib'),P=require('../lib/game-namespace-proof'),T=K.reporter('game-namespace-proof'),root=K.ROOT,original=P.read(root),run=patch=>{const copy=structuredClone(original);patch(copy);return P.verify(root,copy).ok;};
T.ok('current source has both native crew/namespace/Continue witnesses',P.verify(root,original).ok);
T.ok('a fake Game global cannot pass browser parity',!run(p=>p.receipts[0].data.trace[0].hasGlobalGame=true));
T.ok('missing canonical hooks cannot hide behind exported functions',!run(p=>p.receipts[0].data.trace[0].hooks.noteCrewTogether='undefined'));
T.ok('zero actual practice cannot pass',!run(p=>p.receipts[0].data.trace.find(t=>t.label==='native Wait resolves crew').bond=0));
T.ok('unpaid next-part time cannot pass',!run(p=>p.receipts[0].data.trace.find(t=>t.label==='native Wait resolves crew').state.scholar.dayTicks--));
T.ok('lost practice on Continue cannot pass',!run(p=>p.receipts[0].data.trace.find(t=>t.label==='native full-payload Continue').bond=0));
T.ok('changed runtime cannot reuse the witness',!run(p=>p.receipts[0].data.sourceWitness.networkInputs['src/js/party-bond.js']='stale'));T.done();
