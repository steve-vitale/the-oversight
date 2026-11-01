'use strict';
const K=require('./lib'),P=require('../lib/caretaker-phone-proof'),T=K.reporter('Caretaker phone proof'),data=P.read(K.ROOT),v=P.verify(K.ROOT,data);
T.ok('six actual source-bound mobile caretaker journeys',v.ok,v.errors.join('\n'));
function reject(label,mutate){const d=structuredClone(data);mutate(d);T.ok(label,!P.verify(K.ROOT,d).ok);}
reject('one height cannot stand in for both',d=>d.receipts=d.receipts.slice(0,3));
reject('untrusted actions cannot certify real control',d=>d.receipts[0].data.touches[0].trusted=false);
reject('stale Game bytes cannot certify current source',d=>d.receipts[0].data.sourceWitness.networkInputs['src/js/game.js']='old');
reject('an unpaid appointment cannot pass',d=>d.receipts[0].data.trace.find(t=>t.label==='native paid caretaker appointment').state.scholar.dayTicks--);
reject('hungry residents cannot receive free cultivation',d=>d.receipts[1].data.trace.find(t=>t.label==='native paid caretaker appointment').plots[0].magicGrowth=4);
reject('same-day practice cannot duplicate',d=>d.receipts[2].data.trace.find(t=>t.label==='native paid caretaker appointment').practice.green_whisper.xp=4);
reject('lost standing care after Continue cannot pass',d=>d.receipts[0].data.trace.find(t=>t.label==='native committed Continue').state.village.gardenKeeper=null);
reject('paid garden work cannot silently lose cooperation credit',d=>d.receipts[0].data.trace.find(t=>t.label==='native paid caretaker appointment').state.village.trust[d.receipts[0].data.actor]--);
reject('paid garden work cannot silently lose its completion history',d=>{const r=d.receipts[0].data,t=r.trace.find(t=>t.label==='native paid caretaker appointment');t.state.village.memory[r.actor]=[];});
reject('a clipped main phone frame cannot pass',d=>d.receipts[0].data.trace[0].scroll[2]=1500);
T.done();
