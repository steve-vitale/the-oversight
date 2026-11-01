'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),util=require('util'),F=require('../phone-frame-proof-update');
const recipe='evidence/2026-10-23/commons-phone-r4.cjs',fixture='evidence/2026-10-23/commons-phone-fixture-r3.json';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),same=util.isDeepStrictEqual;
const comparable=s=>{const c=structuredClone(s);delete c.saveSeq;return c;};
function validate(root,r){
 const errors=[],check=(condition,label)=>{if(!condition)errors.push(label);};
 try{
  const scene=JSON.parse(fs.readFileSync(path.join(root,fixture),'utf8')).scenes.find(s=>s.name===r.scene);
  check(!!scene,'declared prepared scene');if(!scene)return errors;
  check([736,844].includes(r.height),'declared phone height');
  check(r.expectedDeal===scene.expectedDeal&&r.expectedSpend===scene.expectedSpend,'declared outcome and price');
  check(same(r.errors,[]),'no browser exceptions');
  check(same(r.sourceWitness.networkInputs,F.expectedInputs(root)),'actual current network inputs');
  const inputs=[recipe,fixture,'evidence/2026-10-22/combat-turn-network-r1.cjs'];
  check(inputs.every(f=>r.sourceWitness.recipeInputs[f]===F.normalized(path.join(root,f))),'actual recipe and prepared input');
  check(r.sourceWitness.trustedTouches.length>=12&&r.sourceWitness.trustedTouches.every(t=>t.trusted),'trusted native touches');
  const trace=name=>r.trace.find(t=>t.name===name),before=trace('continued fixture'),opened=trace('village card'),closed=trace('closed visit'),offered=trace('commons discussion'),paid=trace('deal');
  check(!!before&&!!opened&&!!closed&&!!offered&&!!paid,'complete actual flow');
  check(same(before.state,opened.state)&&same(before.state,closed.state),'free visit browsing');
  for(const t of r.trace){
   check(t.viewport.scrollX===0&&t.viewport.scrollY===0&&t.viewport.scrollHeight<=r.height+1,'one phone page: '+t.name);
   check(t.rects.length>=4&&t.rects.every(b=>b.y>=0&&b.bottom<=r.height),'field regions stay visible: '+t.name);
   check(same(t.village,t.state.otherVillages.find(v=>v.id===scene.village)),'actual village state: '+t.name);
   const food=t.state.village.pantry.reduce((n,i)=>n+(i.units||0)*(i.kcalEach||0),0);
   check(Math.abs(food-t.pantryKcal)<1e-8,'actual physical pantry: '+t.name);
  }
  check(offered.village.commonsTalkOpen===true,'real shared-ground offer opened');
  check(r.choices.length===4&&new Set(r.choices.map(c=>c.text)).size===4&&r.choices.every(c=>c.height>=44&&c.width>=44&&c.y>=0&&c.bottom<=c.boardBottom&&c.uncovered),'all real deal choices fit the board');
  check(paid.village.commons.deal===scene.expectedDeal,'real outcome matches declared branch');
  check(before.pantryKcal-paid.pantryKcal===scene.expectedSpend,'single named payment or honest refusal');
  if(scene.expectedDeal===null)check(paid.village.commonsTalkOpen&&paid.message.includes('not 2000 kcal to spare'),'missing food explained and offer retained');
  check(r.checkpoints.length===2,'pending and paid native checkpoints');
  for(const point of r.checkpoints){const loaded=trace('continued '+point.label);check(loaded&&same(comparable(loaded.state),comparable(point.stored)),'whole native Continue: '+point.label);}
  const pending=trace('continued pending-'+r.height+'-'+r.scene),continued=trace('continued paid-'+r.height+'-'+r.scene);
  check(pending?.village.commonsTalkOpen&&!pending?.village.commons.deal&&pending.pantryKcal===before.pantryKcal,'pending discussion persists without a charge');
  check(continued?.village.commons.deal===scene.expectedDeal&&continued.pantryKcal===paid.pantryKcal,'final deal/refusal persists without duplicate payment');
 }catch(e){errors.push('malformed witness: '+e.message);}
 return errors;
}
function update(root,directory){
 const absolute=fs.realpathSync(path.resolve(root,directory)),base=fs.realpathSync(root),rel=path.relative(base,absolute);
 if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Retain actual receipts inside the repository');
 const scenes=JSON.parse(fs.readFileSync(path.join(root,fixture),'utf8')).scenes,receipts=[];
 for(const height of [736,844])for(const scene of scenes){const file=path.join(rel,height+'-'+scene.name+'.json.gz'),bytes=fs.readFileSync(path.join(root,file)),r=JSON.parse(z.gunzipSync(bytes)),errors=validate(root,r);if(r.height!==height||r.scene!==scene.name||errors.length)throw Error(file+': '+errors.join('; '));receipts.push({file:file.replace(/\\/g,'/'),sha256:hash(bytes)});}
 const proof={version:1,scope:'Prepared phone visit/shared-ground interactions, native payments/refusal and complete save/Continue. Not natural travel, pacifist viability, physical device or installed-update proof.',receipts};
 fs.writeFileSync(path.join(root,'scripts/village-visit-proof.json'),JSON.stringify(proof,null,2)+'\n');return proof;
}
module.exports={validate,update,hash};
if(require.main===module)try{if(!process.argv[2])throw Error('Pass the fresh actual receipt directory');const proof=update(path.resolve(__dirname,'../..'),process.argv[2]);console.log(JSON.stringify({receipts:proof.receipts.length}));}catch(e){console.error(e.stack);process.exitCode=1;}
