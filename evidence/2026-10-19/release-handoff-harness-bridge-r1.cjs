'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),assert=require('assert'),B=require('../../scripts/balance-panel'),P=require('../../scripts/balance-proof-update');
const dir=__dirname,root=process.cwd(),common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),read=p=>JSON.parse(z.gunzipSync(fs.readFileSync(p))),rows=[];
for(const region of ['na','eu']){
 const folder=path.join(common,'release-handoff-'+region+'-neutral-r1'),bytes=fs.readFileSync(path.join(folder,'panel.json.gz')),after=JSON.parse(z.gunzipSync(bytes)),before=read(path.join(dir,'release-loot-'+region+'-after-r1.json.gz'));P.validate(root,after);
 const changed=Object.keys(after.sources).filter(p=>after.sources[p]!==before.sources[p]);assert.deepStrictEqual(changed,['scripts/sim-harness.js']);assert.deepStrictEqual(B.observerIdentity(root),{observerDigest:before.observerDigest,contractDigest:before.contractDigest});
 for(const a of after.rows){const b=before.rows.find(b=>b.row.policy===a.row.policy&&b.row.seed===a.row.seed);assert.ok(b);assert.strictEqual(a.stateHash,b.stateHash);assert.deepStrictEqual(a.metrics,b.metrics);rows.push({region,policy:a.row.policy,seed:a.row.seed,stateHash:a.stateHash,all23MetricsMatch:true});}
 fs.writeFileSync(path.join(dir,'release-handoff-'+region+'-neutral-r1.json.gz'),bytes,{flag:'wx'});
 const files=fs.readdirSync(path.join(folder,'cases')).sort();fs.writeFileSync(path.join(dir,'release-handoff-'+region+'-neutral-jobs-r1.json.gz'),z.gzipSync(JSON.stringify(Object.fromEntries(files.map(f=>[f,JSON.parse(fs.readFileSync(path.join(folder,'cases',f)))])))),{flag:'wx'});
}
const report={scope:'Explicit cross-harness semantic bridge, not a gameplay balance comparison or equivalence claim for all seeds. Only source input change is shell-free manifest reading; eight observed150-day states/all23 vectors exactly match retained old-harness cases, with eight additional observer-neutral controls.',rows};
fs.writeFileSync(path.join(dir,'release-handoff-harness-bridge-r1.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});P.update(root,path.join(dir,'release-handoff-na-neutral-r1.json.gz'));console.log(JSON.stringify({observedMatched:rows.length,neutralControls:8,onlyInputChange:'scripts/sim-harness.js'}));
