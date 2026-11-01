'use strict';
const assert=require('assert/strict'),K=require('./lib'),P=require('../lib/walk-home-phone-proof'),r=P.read(K.ROOT),copy=x=>JSON.parse(JSON.stringify(x));assert.deepEqual(P.verify(K.ROOT,r),{ok:true,errors:[]});
const controls=[x=>x.rows.pop(),x=>x.source['src/js/timeSettlement.js']='0'.repeat(64),x=>x.recipeSha256='0'.repeat(64),x=>x.baselineSha256='0'.repeat(64),x=>x.rows[0].responses['src/js/timeSettlement.js']='0'.repeat(64),x=>x.rows[0].touches[0].trusted=false,x=>x.rows[0].controls[0].box.y=-1,x=>x.rows[0].durable=true,x=>x.rows[2].afterRaw=x.rows[2].beforeRaw,x=>x.rows[3].live.map.px=5];
for(const change of controls){const bad=copy(r);change(bad);assert.equal(P.verify(K.ROOT,bad).ok,false,'altered actual receipt must be rejected');}
console.log('Walk home phone proof: 8 actual original/current/cold scenes and 10 independent receipt rejections passed');
