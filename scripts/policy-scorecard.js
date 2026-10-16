#!/usr/bin/env node
'use strict';
// Explicit same-panel strategy pairs. Never a game-only before/after report.
const fs=require('fs'),z=require('zlib'),crypto=require('crypto'),S=require('./lib/balance-scorecard');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function comparePolicies(panel,pairs){
 const errors=[],ids=pairs.flat();
 if(panel.schemaVersion!==1)errors.push('Unsupported panel schema');
 if(!pairs.length||pairs.some(p=>p.length!==2)||new Set(ids).size!==ids.length)errors.push('Declare distinct one-to-one control:candidate pairs');
 if(panel.contractDigest!==S.contractDigest)errors.push('Metric contract does not match comparator');
 if(sha(JSON.stringify(panel.sources))!==panel.sourceDigest)errors.push('Source manifest digest mismatch');
 if(!panel.validity.sourcesStable)errors.push('Sources changed mid-panel');
 if(!Array.isArray(panel.options.seeds)||new Set(panel.options.seeds).size!==panel.options.seeds.length||new Set(panel.options.policies).size!==panel.options.policies.length)errors.push('Duplicate/invalid declared cases');
 const keys=panel.rows.map(r=>r.row.policy+':'+r.row.seed),expected=new Set(panel.options.policies.flatMap(p=>panel.options.seeds.map(s=>p+':'+s)));
 if(new Set(keys).size!==keys.length||keys.length!==expected.size||keys.some(k=>!expected.has(k)))errors.push('Incomplete, duplicate or undeclared cases');
 for(const id of panel.options.policies)if(!panel.validity.neutrality.some(n=>n.policy===id&&n.match&&!n.warnings))errors.push('Missing passing neutrality proof: '+id);
 for(const id of ids)if(!panel.options.policies.includes(id))errors.push('Unknown paired policy: '+id);
 if(panel.rows.some(r=>r.warnings.length||r.observerErrors.length||r.gear.errors.length))errors.push('Runtime/observer error or warning');
 const metricIds=S.contract.metrics.map(m=>m.id).sort().join(',');if(panel.rows.some(r=>Object.keys(r.metrics).sort().join(',')!==metricIds||Object.values(r.metrics).some(v=>v!==null&&!Number.isFinite(v))))errors.push('Incomplete or invalid metric contract');
 const identity={schemaVersion:1,experimentKind:'paired-policy-strategy',sourceDigest:panel.sourceDigest,observerDigest:panel.observerDigest,contractDigest:panel.contractDigest,pairs};
 if(errors.length)return {...identity,decision:'invalid',errors:[...new Set(errors)],policies:[]};
 const rows=new Map(panel.rows.map(r=>[r.row.policy+':'+r.row.seed,r]));
 const policies=pairs.map(([control,candidate])=>{const policy=control+' → '+candidate,metrics=S.contract.metrics.map(m=>S.compareMetric(panel.options.seeds.map(s=>rows.get(control+':'+s).metrics[m.id]),panel.options.seeds.map(s=>rows.get(candidate+':'+s).metrics[m.id]),m,policy+'/'+m.id));return{policy,control,candidate,cases:panel.options.seeds.length,confirmationSized:panel.options.seeds.length>=S.contract.confirmationSeeds,decision:metrics.some(m=>!['descriptive','no_material_signal'].includes(m.status))?'review_required':'no_material_signal',metrics};});
 return {...identity,decision:policies.some(p=>p.decision==='review_required')?'review_required':'no_material_signal',errors:[],policies,note:'Same-source paired strategy experiment; policy choices differ, not game rules. No weighted score or win quota. Exploratory intervals are not multiplicity-adjusted; review all metrics and disjoint holdouts.'};
}
module.exports={comparePolicies};
if(require.main===module){const arg=k=>{const i=process.argv.indexOf('--'+k);return i<0?null:process.argv[i+1];};try{const input=arg('panel'),out=arg('out'),pairText=arg('pairs');if(!input||!out||!pairText)throw Error('--panel <panel.json.gz> --pairs control:candidate,... --out <prefix> required');const p=JSON.parse(z.gunzipSync(fs.readFileSync(input))),report=comparePolicies(p,pairText.split(',').map(x=>x.split(':')));report.comparatorDigest=sha(fs.readFileSync(__filename));fs.writeFileSync(out+'.json',JSON.stringify(report,null,2)+'\n');fs.writeFileSync(out+'.md',S.markdown(report).replace('# Balanced campaign comparison','# Paired policy strategy comparison'));console.log(report.decision);if(report.decision!=='no_material_signal')process.exitCode=2;}catch(e){console.error(e.stack);process.exitCode=1;}}
