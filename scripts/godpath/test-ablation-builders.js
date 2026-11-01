'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),K=require('./lib'),T=K.reporter('Portable one-field ablation builders'),C=require('../prepare-calendar-ablation'),L=require('../prepare-ledger-ablation'),B=require('../balance-panel');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-ablation-'));
try{
 const input=path.join(temp,'extracted-input');C.copySimulationInputs(K.ROOT,input);const original=B.manifest(input);
 T.ok('actual extracted simulation tree has all original inputs and no inherited Git identity',JSON.stringify(original)===JSON.stringify(B.manifest(K.ROOT))&&B.sourceHead(input)===null);
 const ledger=L.prepare(input,path.join(temp,'ledger-off'));
 T.ok('controller control changes exactly one policy file without a Git checkout',ledger.sourceHead===null&&ledger.differences.join(',')==='scripts/policies/ledger-aware.js');
 const calendar=C.prepare(input,path.join(temp,'calendar-off'));
 T.ok('calendar control from an extracted tree changes only its JSON flag',calendar.sourceHead===null&&calendar.differences.join(',')==='src/data/titans.json');
 let refused=false;try{C.copySimulationInputs(input,path.join(input,'nested-output'));}catch(e){refused=true;}
 T.ok('a copied control may not be created inside its own source',refused&&!fs.existsSync(path.join(input,'nested-output')));
 refused=false;try{L.prepare(input,path.join(temp,'ledger-off'));}catch(e){refused=true;}
 T.ok('an existing output cannot be overwritten',refused);
 T.ok('all construction and refusal paths leave source inputs unchanged',JSON.stringify(B.manifest(input))===JSON.stringify(original));
}finally{
 const owned=fs.realpathSync(temp),parent=fs.realpathSync(os.tmpdir());assert.equal(path.dirname(owned),parent);assert(path.basename(owned).startsWith('oversight-ablation-'));fs.rmSync(owned,{recursive:true,force:true});
}
T.done();
