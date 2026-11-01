#!/usr/bin/env node
'use strict';
// Simulation-only fresh root; copy exact current inputs, change one flag.
// No Git checkout, deletion, host-specific paths or historical proof rewrites.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),{createRequire}=require('module'),B=require('./balance-panel');
function copySimulationInputs(root,out){
 root=fs.realpathSync(root);out=path.resolve(out);assert(!fs.existsSync(out),'Fresh output directory required');
 const rel=path.relative(root,out);assert(rel.startsWith('..'+path.sep)||path.isAbsolute(rel),'Output must be outside source tree');
 const sources=B.manifest(root),files=new Set(Object.keys(sources)),pending=['scripts/sim-harness.js','scripts/sweep-compare.js',...B.observerFiles,'scripts/lib/balance-scorecard.js','scripts/balance-metrics.json'];
 const seen=new Set(),unresolved=[];
 while(pending.length){const file=pending.pop();if(seen.has(file))continue;seen.add(file);files.add(file);
  if(!/\.(js|cjs)$/.test(file))continue;
  const absolute=path.join(root,file),resolve=createRequire(absolute).resolve;
  for(const match of fs.readFileSync(absolute,'utf8').matchAll(/require\(\s*(['"])(\.[^'"]+)\1\s*\)/g)){
   let dependency;try{dependency=resolve(match[2]);}catch(e){unresolved.push({file,require:match[2],code:e.code});continue;}
   const relative=path.relative(root,dependency);assert(!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative),'Dependency outside source: '+dependency);pending.push(relative.replace(/\\/g,'/'));
  }
 }
 fs.mkdirSync(out);let bytes=0;
 for(const file of [...files].sort()){const source=path.join(root,file),destination=path.join(out,file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(source,destination,fs.constants.COPYFILE_EXCL);bytes+=fs.statSync(source).size;}
 assert.deepEqual(B.manifest(root),sources,'Source changed during construction');
 return{root,out,sources,files,bytes,unresolved};
}
function prepare(root,out){
 const copied=copySimulationInputs(root,out);root=copied.root;out=copied.out;
 const {sources,files,bytes,unresolved}=copied;
 const file='src/data/titans.json',destination=path.join(out,file),original=fs.readFileSync(destination,'utf8'),data=JSON.parse(original);
 assert.equal(data._overtime.calendarEnabled,true,'Candidate calendar must actually be enabled');
 const changed=original.replace(/("calendarEnabled"\s*:\s*)true\b/,'$1false');assert.notEqual(changed,original);fs.writeFileSync(destination,changed);
 const expected=structuredClone(data);expected._overtime.calendarEnabled=false;assert.deepEqual(JSON.parse(changed),expected,'Only intended JSON field may differ');
 assert.deepEqual(B.manifest(root),sources,'Source changed during construction');
 const offSources=B.manifest(out),differences=Object.keys({...sources,...offSources}).filter(f=>sources[f]!==offSources[f]);assert.deepEqual(differences,[file],'Exactly one manifested input must differ');
 const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),receipt={schemaVersion:1,scope:'Calendar-only ablation of current corrected Game and identical controllers/observer; simulation tree, not native browser or public baseline',at:new Date().toISOString(),sourceRoot:root,sourceHead:B.sourceHead(root),outputRoot:out,files:files.size,bytes,unresolvedStaticImports:unresolved,sourceManifest:sources,offManifest:offSources,differences,sourceDigest:sha(JSON.stringify(sources)),offDigest:sha(JSON.stringify(offSources))};
 fs.writeFileSync(path.join(out,'calendar-ablation.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});return receipt;
}
module.exports={prepare,copySimulationInputs};
if(require.main===module)try{assert.equal(process.argv.length,3,'Usage: node scripts/prepare-calendar-ablation.js <fresh-external-directory>');const r=prepare(path.resolve(__dirname,'..'),process.argv[2]);console.log(JSON.stringify({root:r.outputRoot,files:r.files,bytes:r.bytes,differences:r.differences,unresolved:r.unresolvedStaticImports}));}catch(e){console.error(e.stack);process.exitCode=1;}
