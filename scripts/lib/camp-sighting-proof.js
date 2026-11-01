'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),util=require('util'),F=require('../phone-frame-proof-update');
const recipe='evidence/2026-10-23/camp-sighting-phone-r2.cjs',fixture='evidence/2026-10-23/camp-sighting-fixtures-r1.json';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),same=util.isDeepStrictEqual;
const comparable=(s,bookmark=false)=>{const c=structuredClone(s);delete c.saveSeq;if(bookmark)delete c.fbMarkIdx;return c;};
function validate(root,r){
 const errors=[],check=(ok,label)=>{if(!ok)errors.push(label);};
 try{
  const input=JSON.parse(fs.readFileSync(path.join(root,fixture),'utf8')),scene=input.scenes.find(s=>s.name===r.scene);check(!!scene,'declared prepared scene');if(!scene)return errors;
  check([736,844].includes(r.height)&&r.scope===input.scope,'declared phone/scope');check(same(r.errors,[]),'no browser exceptions');
  check(same(r.sourceWitness.networkInputs,F.expectedInputs(root)),'current loaded response inputs');
  check([recipe,fixture,'evidence/2026-10-22/combat-turn-network-r1.cjs'].every(f=>r.sourceWitness.recipeInputs[f]===F.normalized(path.join(root,f))),'actual recipe/fixture identities');
  check(r.sourceWitness.trustedTouches.length>=(r.scene==='cold'?8:10)&&r.sourceWitness.trustedTouches.every(t=>t.trusted),'trusted native journey');
  const trace=name=>r.trace.find(t=>t.name===name),before=trace('before crossing'),sighted=trace('sighted camp'),mapped=trace('map camp detail'),restored=trace('restored');
  check(!!before&&!!sighted&&!!mapped&&!!restored,'complete actual journey');
  check(!before.state.scholar.campSightings?.[scene.village],'no granted sighting at entry');
  check(before.state.otherVillages.find(v=>v.id===scene.village).generated===(r.scene==='warm'),'both cold and already simulated camps');
  check(same(sighted.world,[scene.approach.x+scene.approach.dx,scene.approach.y+scene.approach.dy]),'actual single cardinal crossing');
  const sight=sighted.state.scholar.campSightings?.[scene.village];check(sight?.x===scene.x&&sight?.y===scene.y&&sight?.source==='smoke','earned location/provenance');
  check(r.trace.every(t=>!t.state.scholar.seenTiles[scene.x+','+scene.y]),'camp sighting never explores its ground');
  check(r.trace.every(t=>t.scroll[0]===0&&t.scroll[1]<=r.height+1),'one phone viewport');
  check(r.mapInfo.includes(scene.campName)&&r.mapInfo.includes('ground unexplored'),'name and honest knowledge limit');
  check(r.mapRects.length===3&&r.mapRects.every(b=>b.x>=0&&b.y>=0&&b.right<=391&&b.bottom<=r.height),'map and details fit the phone');
  const close=r.mapRects.find(b=>b.label==='mapoverlay-x');check(close?.width>=44&&close?.height>=44,'map close touch target');
  check(same(comparable(mapped.state,true),comparable(sighted.state,true))&&mapped.state.fbMarkIdx===mapped.log.length,'viewing only, exact feedback bookmark');
  check(r.visits===(scene.expectedDistance<=1?1:0),'speaking range is physical');
  if(r.visits){const opened=trace('visit card'),talked=trace('paid conversation');check(same(comparable(opened.state,true),comparable(mapped.state,true)),'free card opening');check(talked.state.scholar.dayTicks-opened.state.scholar.dayTicks===64&&talked.state.otherVillages.find(v=>v.id===scene.village).lastTalkDay===talked.state.scholar.day,'real paid conversation');}
  check(r.checkpoints.length===1&&same(comparable(restored.state),comparable(r.checkpoints[0])),'whole native checkpoint Continue');
  check(same(restored.state.scholar.campSightings[scene.village],sight),'original location provenance persists');
 }catch(e){errors.push('malformed witness: '+e.message);}
 return errors;
}
function update(root,directory){
 const absolute=fs.realpathSync(path.resolve(root,directory)),rel=path.relative(fs.realpathSync(root),absolute);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Retain actual receipts inside the repository');const receipts=[];
 for(const height of [736,844])for(const scene of ['cold','warm']){const file=path.join(rel,height+'-'+scene+'.json.gz').replace(/\\/g,'/'),bytes=fs.readFileSync(path.join(root,file)),r=JSON.parse(z.gunzipSync(bytes)),errors=validate(root,r);if(r.height!==height||r.scene!==scene||errors.length)throw Error(file+': '+errors.join('; '));receipts.push({file,sha256:hash(bytes)});}
 const proof={version:1,scope:'Prepared native mobile camp sightings, fog/card range, paid conversation and complete Continue. Not natural build/travel discovery, balance or installed-update proof.',receipts};fs.writeFileSync(path.join(root,'scripts/camp-sighting-proof.json'),JSON.stringify(proof,null,2)+'\n');return proof;
}
module.exports={hash,validate,update};
if(require.main===module)try{if(!process.argv[2])throw Error('Pass a fresh actual receipt directory');console.log(JSON.stringify({receipts:update(path.resolve(__dirname,'../..'),process.argv[2]).receipts.length}));}catch(e){console.error(e.stack);process.exitCode=1;}
