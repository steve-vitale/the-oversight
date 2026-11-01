'use strict';
const K=require('./lib'),P=require('../lib/strike-phone-proof'),T=K.reporter('Strike native phone proof'),data=P.read(K.ROOT),v=P.verify(K.ROOT,data);
T.ok('both source-bound native four-rat journeys pass',v.ok,v.errors.join('\n'));
function reject(label,change){const d=structuredClone(data);change(d);T.ok(label,!P.verify(K.ROOT,d).ok);}
reject('one phone height cannot stand in for both',d=>d.receipts=d.receipts.slice(0,1));
reject('stale runtime bytes cannot pass',d=>d.receipts[0].data.sourceWitness.networkInputs['src/js/game.js']='old');
reject('changed binary starting save cannot pass',d=>d.receipts[0].data.fixtureSha256='old');
reject('synthetic touch cannot pass',d=>d.receipts[0].data.sourceWitness.trustedTouches[0].trusted=false);
reject('logical anchors without painted bodies cannot pass',d=>d.receipts[0].data.bodyPixels[0].rgba=[41,32,21,255]);
reject('invisible missing actors cannot pass',d=>d.receipts[0].data.trace[0].entities=d.receipts[0].data.trace[0].entities.slice(0,2));
reject('world garden overlays cannot pass',d=>d.receipts[0].data.trace[0].gardenMarkers=9);
reject('overlapping full footprints cannot pass',d=>{const f=d.receipts[0].data.trace[0].fight;f.fighters[2].mx=f.fighters[1].mx;f.fighters[2].my=f.fighters[1].my;});
reject('secretly weakened monsters cannot pass',d=>d.receipts[0].data.trace[0].fight.fighters[1].hp=10);
reject('unpaid stillness cannot pass',d=>{for(const t of d.receipts[0].data.trace)for(const m of t.fight?.fighters||[])if(m.sigStrike?.still)m.sigStrike.still.remaining=0;});
reject('lost pending cost on Continue cannot pass',d=>d.receipts[0].data.checkpoints.find(c=>c.label==='pending').payload.scholar.kcal++);
reject('lost final native save cannot pass',d=>d.receipts[0].data.checkpoints.pop());
reject('a clipped phone frame cannot pass',d=>d.receipts[0].data.trace[0].scroll[2]=1500);
reject('a failed bout cannot claim the nonviolent contest reward',d=>d.receipts[0].data.trace.find(t=>t.label==='actual arena resolves').state.telemetry.filter(t=>t.type==='contest_end').at(-1).outcome='lost');
T.done();
