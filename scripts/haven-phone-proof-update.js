'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),F=require('./phone-frame-proof-update');
const inputs=['src/js/app.js','src/js/game.js','src/css/main.css','evidence/2026-10-21/lodge-mobile-r1.cjs','scripts/haven-phone-proof-update.js'];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')).digest('hex');
function shape(r){
 assert([736,844].includes(r.height));assert.deepEqual(r.errors,[]);assert(r.touches.length>=9&&r.touches.every(t=>t.trusted));
 const first=r.trace[0],rest=r.trace.find(t=>t.label==='real rest'),fire=r.trace.find(t=>t.label==='native hearth approach and warmth'),outside=r.trace.find(t=>t.label==='native exit'),continued=r.trace.find(t=>t.label==='fresh Continue grounds');
 assert(first.inside&&first.hall);assert.equal(first.gardens,0);assert.equal(first.stations,5);assert.equal(first.furnishings,5);assert(rest&&fire&&outside&&continued);assert(rest.tick>first.tick&&rest.kcal<first.kcal);assert(fire.tick>rest.tick&&fire.kcal<rest.kcal);
 for(const t of r.trace){assert.equal(t.scroll,0);assert(Object.values(t.rects).every(b=>b.y>=0&&b.bottom<=r.height+1));if(t.hall){assert.equal(t.gardens,0);assert.equal(t.stations,5);}}
 for(const t of [outside,continued]){assert.equal(t.inside,false);assert.equal(t.hall,false);assert(t.gardens>0);assert.equal(t.stations,0);assert.deepEqual(t.plots,first.plots);}
 for(const k of ['position','world','kcal','tick','inside','hall'])assert.deepEqual(continued[k],outside[k]);
 assert.equal(r.lodge.count,1);assert.equal(r.lodge.label,'Haven hall');assert.equal(r.lodge.cells.length,6);assert(r.lodge.nav.includes('Haven'));
 assert(Math.abs(r.lodge.bounds.width-r.lodge.cells[0].width*3)<2&&Math.abs(r.lodge.bounds.height-r.lodge.cells[0].height*2)<2);
 assert(r.outdoorManagement.visible&&r.indoorManagement.visible);assert.equal(r.outdoorManagement.pantry,false);assert.equal(r.indoorManagement.pantry,true);assert.equal(r.outdoorManagement.garden,1);assert.equal(r.indoorManagement.garden,1);
 const entered=r.trace.find(t=>t.label==='native lodge entry'),pantry=r.trace.find(t=>t.label==='actual pantry panel');assert(entered&&pantry);assert.equal(entered.kcal,pantry.kcal);assert.equal(entered.tick,pantry.tick);return true;
}
function update(root,files){
 const expected=F.expectedInputs(root),receipts=files.map(file=>{const absolute=path.resolve(file),rel=path.relative(root,absolute);assert(!rel.startsWith('..')&&!path.isAbsolute(rel));const r=JSON.parse(fs.readFileSync(absolute));shape(r);for(const[k,v]of Object.entries(expected))assert.equal(r.loadedResponseHashes[k],v,k);return{path:rel.replace(/\\/g,'/'),height:r.height,sha256:hash(absolute)};});assert.deepEqual(receipts.map(r=>r.height).sort(),[736,844]);
 const proof={schemaVersion:1,scope:'Prepared Haven: real birth choice, native station approach/rest/warmth/exit/Continue, visible room/outdoor-only plots, one actual lodge footprint and gated management/pantry at both emulated phone heights. Generic phone-frame proof binds every boot input; this gate binds core scene/interaction inputs and the retained recipe. No physical-device or release claim.',textHashNormalization:'lf-v1',receipts,sources:Object.fromEntries(inputs.map(f=>[f,hash(path.join(root,f))]))};const out=path.join(root,'scripts/haven-phone-proof.json');fs.writeFileSync(out+'.tmp',JSON.stringify(proof,null,2)+'\n');fs.renameSync(out+'.tmp',out);return{heights:receipts.map(r=>r.height),inputs:inputs.length};
}
module.exports={shape,update,hash,inputs};
if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'..'),process.argv.slice(2))));}catch(e){console.error(e.stack);process.exitCode=1;}
