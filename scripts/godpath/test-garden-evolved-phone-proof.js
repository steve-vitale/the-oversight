'use strict';
const assert=require('assert/strict'),K=require('./lib'),P=require('../lib/evolved-garden-phone-proof'),r=P.read(K.ROOT),copy=x=>JSON.parse(JSON.stringify(x));
assert.deepEqual(P.verify(K.ROOT,r),{ok:true,errors:[]});
const controls=[x=>x.rows.pop(),x=>x.source['src/js/gardenCultivation.js']='0'.repeat(64),x=>x.recipeSha256='0'.repeat(64),x=>x.rows[0].recovery.responses['src/js/gardenCultivation.js']='0'.repeat(64),x=>x.rows[0].final.touches[0].trusted=false,x=>x.rows[0].final.controls[0].box.y=-1,x=>x.rows[0].final.saved.scholar.kcal+=200,x=>x.rows[0].final.saved.run.map.tiles[4][4].plots[0].magicGrowth+=12,x=>x.rows[1].final.saved.scholar.dayTicks++];
for(const change of controls){const bad=copy(r);change(bad);assert.equal(P.verify(K.ROOT,bad).ok,false,'independent altered receipt must be rejected');}
console.log('Evolved garden phone proof: 4 actual native/cold scenes and 9 independent receipt rejections passed');
