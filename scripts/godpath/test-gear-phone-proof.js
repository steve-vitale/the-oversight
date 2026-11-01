'use strict';
const K=require('./lib'),P=require('../lib/gear-phone-proof'),T=K.reporter('Equipment phone conservation proof'),data=P.read(K.ROOT),v=P.verify(K.ROOT,data);
T.ok('six current source-bound native equipment journeys',v.ok,v.errors.join('\n'));
function reject(label,mutate){const d=structuredClone(data);mutate(d);T.ok(label,!P.verify(K.ROOT,d).ok);}
reject('one height cannot certify both phones',d=>d.receipts=d.receipts.slice(0,3));
reject('untrusted equipment input is rejected',d=>d.receipts[0].data.touches[0].trusted=false);
reject('old Game bytes cannot certify current equipment',d=>d.receipts[0].data.sourceWitness.networkInputs['src/js/game.js']='old');
reject('a replaced weapon cannot vanish',d=>d.receipts[0].data.trace.find(t=>t.label==='native gear equipped').state.scholar.inventory=[]);
reject('wearing a stack cannot consume its extra units',d=>d.receipts[2].data.trace.find(t=>t.label==='native gear equipped').state.scholar.inventory=[]);
reject('ownership cannot disappear from a worn item',d=>delete d.receipts[0].data.trace.find(t=>t.label==='native gear equipped').state.scholar.equipped.melee.owner);
reject('taking armor off cannot reset it to half a kilogram',d=>{for(const i of d.receipts[1].data.trace.find(t=>t.label==='native gear taken off').state.scholar.inventory)if(i.itemId==='conquerors_plate')i.kg=.5;});
reject('equipment cannot create an extra item',d=>d.receipts[2].data.trace.find(t=>t.label==='native gear taken off').state.scholar.inventory[0].units++);
reject('a free wear action cannot silently spend time',d=>d.receipts[0].data.trace.find(t=>t.label==='native gear equipped').state.scholar.dayTicks++);
reject('a partial Continue payload cannot certify durability',d=>delete d.receipts[0].data.trace.find(t=>t.label==='native committed Continue').state.village);
reject('a double-length game surface cannot certify mobile layout',d=>d.receipts[0].data.trace[0].scroll[2]=1600);
T.done();
