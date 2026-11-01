'use strict';
const assert=require('assert/strict'),K=require('./lib'),P=require('../lib/earned-evolution-phone-proof');
const r=P.read(K.ROOT),v=P.verify(K.ROOT,r);assert(v.ok,v.errors.join('\n'));
const controls=[
 c=>{c.source['src/js/app.js']='changed';},c=>{c.fixtureSha256='changed';},c=>{c.driverSha256='changed';},c=>{c.recipeSha256='changed';},c=>{c.rows.pop();},
 c=>{c.rows[0].final.touches[0].trusted=false;},c=>{c.rows[0].final.controls[0].box.y=-1;},c=>{c.rows[0].recovery.responses['src/js/game.js']='changed';},
 c=>{c.rows[0].final.saved.scholar.kcal++;},c=>{c.rows[2].final.saved.scholar.pendingEvolution=null;},c=>{c.rows[1].recovery.restored.scholar.kcal++;},
];
for(const mutate of controls){const c=structuredClone(r);mutate(c);assert.equal(P.verify(K.ROOT,c).ok,false,'reject changed evidence');}
console.log('Earned evolution phone proof: ten actual journeys and '+controls.length+' rejecting controls passed');
