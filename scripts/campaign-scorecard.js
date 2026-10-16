#!/usr/bin/env node
'use strict';
// Adapt the campaign audit's exact standard-driver observations to the
// existing same-source strategy comparator. Never relabel different games.
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),S=require('./lib/balance-scorecard'),P=require('./policy-scorecard');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function toPanel(report){
 const expected=sha(['campaign-audit.js','balance-panel.js','gear-usage-audit.js','lib/balance-scorecard.js','balance-metrics.json'].map(f=>fs.readFileSync(path.join(__dirname,f))).join('\n'));
 if(report.schemaVersion!==2||report.observerDigest!==expected)throw Error('Campaign observer/contract differs; use its frozen collector');
 if(!report.validity.sourcesStable||report.validity.neutrality.some(n=>!n.match||n.warnings||n.errors))throw Error('Invalid campaign neutrality/source proof');
 if(report.rows.some(r=>!r.balanced||r.measurement.sourceDigest!==report.sourceDigest||r.measurement.observerDigest!==report.observerDigest))throw Error('Campaign case identity differs');
 return {schemaVersion:1,sourceHeadStart:report.sourceHeadStart,sourceHeadEnd:report.sourceHeadEnd,sources:report.sources,sourceDigest:report.sourceDigest,observerDigest:report.observerDigest,contractDigest:S.contractDigest,
  options:Object.fromEntries(['days','policies','seeds','region','origin','flags','nodeVersion'].map(k=>[k,report[k]])),validity:report.validity,
  rows:report.rows.map(r=>({row:r.rawRow,stateHashVersion:2,stateHash:r.stateHash,warnings:r.warnings,...r.balanced}))};
}
function compare(report,pairs=[['campaigner-control','campaigner']]){return P.comparePolicies(toPanel(report),pairs);}
module.exports={toPanel,compare};
if(require.main===module){const arg=k=>{const i=process.argv.indexOf('--'+k);return i<0?null:process.argv[i+1];};try{const file=arg('report'),out=arg('out');if(!file||!out)throw Error('--report <campaign-report.json.gz> --out <prefix> [--pairs control:candidate,...]');const bytes=fs.readFileSync(file),report=JSON.parse(file.endsWith('.gz')?z.gunzipSync(bytes):bytes),panel=toPanel(report),result=compare(report,arg('pairs')?.split(',').map(p=>p.split(':')));result.comparatorDigest=sha([__filename,path.join(__dirname,'policy-scorecard.js')].map(f=>fs.readFileSync(f)).join('\n'));fs.writeFileSync(out+'-panel.json.gz',z.gzipSync(JSON.stringify(panel)+'\n'));fs.writeFileSync(out+'.json',JSON.stringify(result,null,2)+'\n');fs.writeFileSync(out+'.md',S.markdown(result).replace('# Balanced campaign comparison','# Paired campaign strategy comparison'));console.log(result.decision);if(result.decision!=='no_material_signal')process.exitCode=2;}catch(e){console.error(e.stack);process.exitCode=1;}}
