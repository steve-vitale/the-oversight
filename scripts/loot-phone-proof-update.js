'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),F=require('./phone-frame-proof-update');
const recipe='evidence/2026-10-21/search-phone-r1.cjs',sceneRecipe='evidence/2026-10-21/corpse-scenes-phone-r1.cjs';
const cases=['approach:736','approach:844','scene:736','scene:844','underfoot:736','underfoot:844'];
function validate(root,r){
 if(r.case==='scene')return validateScene(root,r);
 assert(['underfoot','approach'].includes(r.case));assert([736,844].includes(r.height));assert.deepEqual(r.errors,[]);assert.equal(r.recipeSha256,F.normalized(path.join(root,recipe)));
 for(const[k,v]of Object.entries(F.expectedInputs(root)))assert.equal(r.loadedResponseHashes[k],v,k);
 assert(r.touches.length>=7&&r.touches.every(t=>t.trusted&&!t.grid));
 const by=Object.fromEntries(r.trace.map(t=>[t.label,t])),initial=by['native edge Continue'],refused=by['overweight refusal'],taken=by['native direct edge pickup'],left=by['explicit item left'],continued=by['native Continue retains ownership and leave choice'];
 assert(initial&&refused&&taken&&left&&continued);assert.deepEqual(initial.position,[0,0]);assert(/Too heavy/i.test(refused.message));const approached=by['paid approach exposes adjacent bodies'],opened=by['direct Search opens existing reader'],basis=approached||initial;assert(opened);
 for(const k of ['position','world','bearer','inventory','corpses','kcal','tick'])assert.deepEqual(opened[k],basis[k]);
 for(const k of ['inventory','corpses','kcal','tick'])assert.deepEqual(refused[k],basis[k]);
 assert.equal(basis.searchActions.length,1);assert.equal(basis.searchActions[0].id,r.primaryId);
 if(r.case==='approach'){assert(approached);assert.equal(initial.searchActions.length,0);assert.deepEqual(approached.position,[1,0]);assert.equal(initial.kcal-approached.kcal,4);assert.equal(approached.tick-initial.tick,1);assert(basis.searchActions[0].label.includes('Search bodies (2)'));}else{assert(!approached);assert(basis.searchActions[0].label.includes('Search body'));}

 assert(r.swipes.length>0&&r.swipes.some(s=>s.box.scrollTop>0)&&r.swipes.every(s=>s.box.scrollHeight>s.box.clientHeight));
 for(const k of ['inventory','corpses']){assert.deepEqual(r.immediate[k],taken[k]);assert.deepEqual(r.saved[k],left[k]);}
 assert(taken.inventory.some(i=>i.name==='Declared travel ration'&&i.units===1));assert(left.corpses.some(c=>c.items.some(i=>i._left)));
 const selected=by['other body selected in same reader'],second=by['second body pickup preserves first ownership'],final=second||left;
 if(r.case==='approach'){assert.equal(r.chooserLabel,'Declared second carcass — fresh ↘');assert(selected&&second&&r.secondaryId!==r.primaryId);for(const k of ['position','world','bearer','inventory','corpses','kcal','tick'])assert.deepEqual(selected[k],left[k]);assert(second.inventory.some(i=>i.name==='Declared second salvage'&&i.units===1));assert.equal(second.corpses.find(c=>c.id===r.secondaryId).items[0].units,0);}
 for(const k of ['inventory','corpses'])assert.deepEqual(r.finalCommitted[k],final[k]);
 for(const k of ['position','world','bearer','inventory','corpses','kcal','tick'])assert.deepEqual(continued[k],final[k]);

 for(const t of r.trace){assert.equal(t.scroll,0);assert(Object.values(t.rects).every(b=>b.y>=0&&b.bottom<=r.height+1));}
 return r.height;
}

function validateScene(root,r){
 assert.equal(r.case,'scene');assert([736,844].includes(r.height));assert.deepEqual(r.errors,[]);
 assert.equal(r.recipeSha256,F.normalized(path.join(root,sceneRecipe)));
 for(const[k,v]of Object.entries(F.expectedInputs(root)))assert.equal(r.loadedResponseHashes[k],v,k);
 assert(r.touches.length>=18&&r.touches.every(t=>t.trusted&&!t.grid));
 const by=Object.fromEntries(r.trace.map(t=>[t.label,t])),ids=r.ids;
 assert.equal(new Set(Object.values(ids)).size,3);
 const initial=by['indoor Continue isolates outdoor and legacy bodies'],opened=by['indoor reader opens without transfer'],taken=by['indoor pickup saves only its body'],exited=by['native exit returns to outdoor doorstep'],stale=by['retired indoor callback cannot leave from outside'],approach=by['paid outdoor step exposes two actual outside bodies'],outside=by['outdoor pickup saves its own source'],legacy=by['legacy belongings remain recoverable outside'],final=by['native reentry and indoor Leave retain all ownership'],continued=by['second Continue keeps room migration and belongings'];
 assert(initial&&opened&&taken&&exited&&stale&&approach&&outside&&legacy&&final&&continued);
 assert(initial.inside);assert.deepEqual(initial.available,[ids.hall]);
 assert.equal(initial.searchActions.length,1);assert.equal(initial.searchActions[0].id,ids.hall);
 assert.equal(initial.corpses.find(c=>c.id===ids.legacy).sceneInferred,'legacy-outside');
 for(const k of ['inventory','corpses','kcal','tick','position'])assert.deepEqual(opened[k],initial[k]);
 assert(opened.title.includes('Unknown person')&&!opened.title.includes('Secret'));
 assert(taken.inventory.some(i=>i.name==='Declared indoor salvage'&&i.units===1));
 assert.equal(taken.corpses.find(c=>c.id===ids.outside).items[0].units,1);
 assert(!exited.inside);assert.deepEqual(exited.position,[4,5]);assert(!exited.available.includes(ids.hall));
 for(const k of ['inventory','corpses','kcal','tick','position'])assert.deepEqual(stale[k],exited[k]);
 assert.deepEqual(approach.position,[4,6]);assert.equal(exited.kcal-approach.kcal,2);assert.equal(approach.tick-exited.tick,1);
 assert.deepEqual([...approach.available].sort(),[ids.outside,ids.legacy].sort());
 assert(outside.inventory.some(i=>i.name==='Declared outdoor salvage'&&i.units===1));
 assert.equal(outside.corpses.find(c=>c.id===ids.hall).items[1].units,1);
 assert(legacy.inventory.some(i=>i.name==='Declared retained legacy salvage'&&i.units===1));
 assert(final.inside);assert.equal(final.corpses.find(c=>c.id===ids.hall).items[1]._left,true);
 for(const [name,t]of Object.entries({indoor:taken,outdoor:outside,legacy,final}))for(const k of ['inventory','corpses'])assert.deepEqual(r.checkpoints[name][k],t[k]);
 for(const k of ['inside','position','inventory','corpses','kcal','tick'])assert.deepEqual(continued[k],final[k]);
 assert.deepEqual(continued.available,[ids.hall]);
 for(const t of r.trace){assert.equal(t.scroll,0);assert(Object.values(t.rects).every(b=>b.y>=0&&b.bottom<=r.height+1));}
 return r.height;
}

function update(root,files){
 const receipts=files.map(file=>{const absolute=path.resolve(file),rel=path.relative(root,absolute);assert(!rel.startsWith('..')&&!path.isAbsolute(rel));const r=JSON.parse(fs.readFileSync(absolute));return{path:rel.replace(/\\/g,'/'),sha256:F.normalized(absolute),case:r.case,height:validate(root,r)};});assert.deepEqual(receipts.map(r=>r.case+':'+r.height).sort(),cases);
 const proof={schemaVersion:3,scope:'Prepared Chromium touch direct underfoot Search and paid approach, multi-body selection and canonical indoor/outdoor/legacy ownership through native exit/paid approach/reentry, refusal/pickup/Leave, list swipes, immediate bytes and native Continue; no grid taps. Not physical-device or release clearance.',receipts,sources:Object.fromEntries([...Object.keys(F.expectedInputs(root)),recipe,sceneRecipe,'evidence/2026-10-21/corpse-scenes-fixture-r1.cjs','evidence/2026-10-21/corpse-scenes-fixture-r1.json','scripts/loot-phone-proof-update.js'].map(f=>[f,F.normalized(path.join(root,f))]))};
 const out=path.join(root,'scripts/loot-phone-proof.json');fs.writeFileSync(out+'.tmp',JSON.stringify(proof,null,2)+'\n');fs.renameSync(out+'.tmp',out);return{heights:receipts.map(r=>r.height),inputs:Object.keys(proof.sources).length};
}
module.exports={validate,update};
if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'..'),process.argv.slice(2))));}catch(e){console.error(e.stack);process.exitCode=1;}
