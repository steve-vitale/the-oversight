#!/usr/bin/env node
'use strict';
// Refresh the real observer-neutral maintenance proof; never fabricate one.
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),B=require('./balance-panel'),contract=require('./balance-metrics.json');
const inputs=[...B.observerFiles,'scripts/balance-metrics.json'],sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function validate(root,panel){
 if(panel.sourceDigest!==sha(JSON.stringify(panel.sources)))throw Error('Proof manifest digest is invalid');
 if(JSON.stringify(B.manifest(root))!==JSON.stringify(panel.sources))throw Error('Proof source inputs are not current');
 const identity=B.observerIdentity(root);
 if(panel.observerDigest!==identity.observerDigest||panel.contractDigest!==identity.contractDigest)throw Error('Proof observer/contract inputs are not current');
 if(!panel.rows?.length||!panel.validity?.sourcesStable||!panel.options?.policies?.length||!panel.validity.neutrality?.length||panel.validity.neutrality.some(n=>!n.match||n.warnings)||panel.options.policies.some(p=>!panel.validity.neutrality.some(n=>n.policy===p)))throw Error('Stable-source real observer-neutral proof required for every cohort');
 if(require('./lib/balance-cohorts').validate(panel).length)throw Error('Invalid played/excluded proof accounting');
 const ids=contract.metrics.map(m=>m.id).sort().join(',');
 if(panel.rows.some(r=>r.warnings?.length||r.observerErrors?.length||r.gear?.errors?.length||Object.keys(r.metrics||{}).sort().join(',')!==ids||Object.values(r.metrics).some(v=>v!==null&&!Number.isFinite(v))))throw Error('Proof has warnings, observer errors or invalid metrics');
 return Object.fromEntries(inputs.map(n=>[n,sha(fs.readFileSync(path.join(root,n),'utf8').replace(/\r\n/g,'\n'))]));
}
function update(root,file){
 const absolute=fs.realpathSync(path.resolve(file)),base=fs.realpathSync(root),relative=path.relative(base,absolute);
 if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Copy the retained panel into this repository first');
 const bytes=fs.readFileSync(absolute),panel=JSON.parse(file.endsWith('.gz')?z.gunzipSync(bytes):bytes.toString('utf8')),normalizedSources=validate(root,panel);
 const proof={schemaVersion:1,panel:relative.replace(/\\/g,'/'),panelDigest:sha(bytes),normalizedSources},out=path.join(root,'scripts/balance-proof.json');fs.writeFileSync(out+'.tmp',JSON.stringify(proof,null,2)+'\n');fs.renameSync(out+'.tmp',out);return proof;
}
module.exports={validate,update};
if(require.main===module){try{if(!process.argv[2])throw Error('Usage: node scripts/balance-proof-update.js evidence/<date>/<real-neutral-panel>.json.gz');console.log(JSON.stringify(update(path.resolve(__dirname,'..'),process.argv[2]),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
