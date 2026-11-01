#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),B=require('./balance-panel'),{copySimulationInputs}=require('./prepare-calendar-ablation');
function prepare(root,out){
 const copied=copySimulationInputs(root,out),file='scripts/policies/ledger-aware.js',destination=path.join(copied.out,file),original=fs.readFileSync(destination,'utf8'),needle='const EXPERIMENT_ENABLED = true;',changed=original.replace(needle,'const EXPERIMENT_ENABLED = false;');
 assert.equal(original.split(needle).length,2,'Exactly one enabled experiment declaration required');assert.notEqual(changed,original);fs.writeFileSync(destination,changed);
 assert.deepEqual(B.manifest(copied.root),copied.sources,'Source changed during construction');const offSources=B.manifest(copied.out),differences=Object.keys({...copied.sources,...offSources}).filter(f=>copied.sources[f]!==offSources[f]);assert.deepEqual(differences,[file]);
 const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),receipt={schemaVersion:1,scope:'Explicit controller-layer ablation on identical Game, parents, harness and observer. Named livelihood trials deliberately add hunting; originals remain non-hunters.',at:new Date().toISOString(),sourceRoot:copied.root,sourceHead:B.sourceHead(copied.root),outputRoot:copied.out,files:copied.files.size,bytes:copied.bytes,unresolvedStaticImports:copied.unresolved,sourceManifest:copied.sources,offManifest:offSources,differences,sourceDigest:sha(JSON.stringify(copied.sources)),offDigest:sha(JSON.stringify(offSources))};
 fs.writeFileSync(path.join(copied.out,'ledger-ablation.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});return receipt;
}
module.exports={prepare};
if(require.main===module)try{assert.equal(process.argv.length,3,'Usage: node scripts/prepare-ledger-ablation.js <fresh-external-directory>');const r=prepare(path.resolve(__dirname,'..'),process.argv[2]);console.log(JSON.stringify({root:r.outputRoot,files:r.files,bytes:r.bytes,differences:r.differences,unresolved:r.unresolvedStaticImports}));}catch(e){console.error(e.stack);process.exitCode=1;}
