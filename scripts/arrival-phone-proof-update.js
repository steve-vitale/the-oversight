#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),F=require('./phone-frame-proof-update');
const inputs=['src/js/app.js','src/js/game.js','src/css/main.css','evidence/2026-10-21/carry-arrival-r1.cjs','scripts/arrival-phone-proof-update.js'];
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')).digest('hex');
function shape(r){
 assert(!r.beforeMode&&[736,844].includes(r.height));assert.equal(r.arrivalBeats,7);assert.equal(r.arrivalFrames.length,7);assert.equal(r.arrivalSwipes,0);
 for(const f of r.arrivalFrames){assert(f.windows>0);assert.equal(f.documentScroll,0);assert(!f.neededScroll);assert(f.button.x>=0&&f.button.x+f.button.width<=390&&f.button.y>=0&&f.button.bottom<=r.height&&f.button.height>=44);assert(f.content?.clientHeight>0&&f.content.scrollWidth<=f.content.clientWidth+1&&f.content.tabIndex===0&&f.content.role==='region');}
 assert.deepEqual(r.errors,[]);assert(r.touches.length>=10&&r.touches.every(t=>t.trusted));
 for(const[k,v]of Object.entries(r.arrivalInput))assert.deepEqual(r.loaded[k],v,'arrival must not advance '+k);
 assert.equal(r.loaded.inside,false);assert.equal(r.loaded.hall,false);assert.equal(r.loaded.day,602);
 for(const k of Object.keys(r.committed)){assert.deepEqual(r.committed[k],r.crossed[k]);assert.deepEqual(r.continued[k],r.crossed[k]);}
 return true;
}
function update(root,files){
 const expected=F.expectedInputs(root),receipts=files.map(file=>{const absolute=path.resolve(file),rel=path.relative(root,absolute);assert(!rel.startsWith('..')&&!path.isAbsolute(rel));const r=JSON.parse(fs.readFileSync(absolute));shape(r);assert.equal(r.recipeSha256,hash(path.join(root,inputs[3])));for(const[k,v]of Object.entries(expected))assert.equal(r.loadedResponseHashes[k],v,k);return{path:rel.replace(/\\/g,'/'),height:r.height,sha256:hash(absolute)};});
 assert.deepEqual(receipts.map(r=>r.height).sort(),[736,844]);
 const proof={schemaVersion:1,scope:'Arrival layout, canonical late-save scene and native departure/Continue, bound to the listed core scene/layout/recipe inputs. Generic phone-frame proof separately binds every boot input. Emulation, not physical-device or release proof.',textHashNormalization:'lf-v1',receipts,sources:Object.fromEntries(inputs.map(file=>[file,hash(path.join(root,file))]))};
 const out=path.join(root,'scripts/arrival-phone-proof.json');fs.writeFileSync(out+'.tmp',JSON.stringify(proof,null,2)+'\n');fs.renameSync(out+'.tmp',out);return{heights:receipts.map(r=>r.height),inputs:inputs.length};
}
module.exports={shape,update,hash,inputs};
if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'..'),process.argv.slice(2))));}catch(error){console.error(error.stack);process.exitCode=1;}
