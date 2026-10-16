'use strict';
const K=require('./lib'),T=K.reporter('campaign-measurement'),cp=require('child_process'),path=require('path'),assert=require('assert'),ROOT=path.resolve(__dirname,'../..');
function child(script,args,marker){return new Promise((resolve,reject)=>cp.execFile(process.execPath,[script,...args],{cwd:ROOT,maxBuffer:16*1024*1024},(e,stdout,stderr)=>{if(e)return reject(new Error(stderr||stdout));try{resolve(JSON.parse(stdout.split(marker).pop()));}catch(e){reject(e);}}));}
(async()=>{
 const common=['--child','--root',ROOT,'--policy','campaigner','--seed','7','--days','30'];
 const [on,off,standard]=await Promise.all([child('scripts/campaign-audit.js',[...common,'--observe','1'],'@@CAMPAIGN@@'),child('scripts/campaign-audit.js',[...common,'--observe','0'],'@@CAMPAIGN@@'),child('scripts/balance-panel.js',[...common,'--observe','1'],'@@BALANCE@@')]);
 T.ok('campaign instrumentation preserves observer-off full gameplay hash',on.stateHash===off.stateHash);
 T.ok('campaign instrumentation preserves observer-off complete standard row',JSON.stringify(on.rawRow)===JSON.stringify(off.rawRow));
 T.ok('campaign row matches the ordinary balanced driver exactly',JSON.stringify(on.rawRow)===JSON.stringify(standard.row));
 T.ok('campaign observation matches the ordinary full gameplay hash',on.stateHash===standard.stateHash);
 T.ok('all23 metric values match the ordinary balanced driver',Object.keys(on.balanced.metrics).length===23&&JSON.stringify(on.balanced.metrics)===JSON.stringify(standard.metrics));
 T.ok('complete daily pacing remains in rawRow for exact comparisons',Array.isArray(on.rawRow.pacing.perDay)&&!on.pacing.perDay);
 T.ok('observer-off does not manufacture diagnostic samples',off.balanced===null&&Object.keys(off.blockages).length===0);
 T.ok('observed source and compound collector identity are pinned',/^[a-f0-9]{64}$/.test(on.measurement.sourceDigest)&&/^[a-f0-9]{64}$/.test(on.measurement.observerDigest));
 T.ok('campaign and balanced warnings remain explicit',!on.warnings.length&&!on.policyErrors.length&&!on.capabilityErrors.length&&!on.balanced.observerErrors.length&&!on.balanced.gear.errors.length);
 const G=await K.load({seed:7});K.newRun(G);const ctx={campaignTarget:'finale'},before=JSON.stringify(G.state),snap=require('../campaign-audit').checkpoint(G,ctx);
 T.ok('blockage snapshots read state without initializing game helpers',JSON.stringify(G.state)===before&&snap.target==='finale');
 snap.inventory.push({name:'proof mutation'});T.ok('diagnostic snapshots cannot mutate live stock',JSON.stringify(G.state)===before);
 const fs=require('fs'),os=require('os'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-campaign-'));
 async function parent(){return new Promise((resolve,reject)=>cp.execFile(process.execPath,['scripts/campaign-audit.js','--seeds','7,42','--days','3','--jobs','4','--out',path.join(tmp,'report.json.gz')],{cwd:ROOT,maxBuffer:1024*1024},(e,stdout,stderr)=>e?reject(new Error(stderr||stdout)):resolve(JSON.parse(require('zlib').gunzipSync(fs.readFileSync(path.join(tmp,'report.json.gz')))))));}
 try{const first=await parent(),second=await parent();T.ok('parent retains both named cohorts and distinct neutral/standard controls',first.rows.length===4&&first.controls.length===4&&first.validity.neutrality.every(n=>n.match&&!n.warnings&&!n.errors));T.ok('resume reuses all eight exact-identity cases',first.reused===0&&second.reused===8&&JSON.stringify(first.rows)===JSON.stringify(second.rows));
 const score=require('../campaign-scorecard'),comparison=score.compare(first);T.ok('campaign cohorts use the existing23-metric named-strategy comparator',comparison.experimentKind==='paired-policy-strategy'&&!comparison.errors.length&&comparison.policies[0].metrics.length===23);const stale=JSON.parse(JSON.stringify(first));stale.observerDigest='old';assert.throws(()=>score.toPanel(stale),/observer\/contract differs/);T.ok('stale observer or contract cannot be relabeled as current',true);const foreign=JSON.parse(JSON.stringify(first));foreign.rows[0].measurement.sourceDigest='other';assert.throws(()=>score.toPanel(foreign),/case identity differs/);T.ok('mixed-source campaign cases cannot become a policy scorecard',true);
 const file=path.join(tmp,'report.json.gz.cases',fs.readdirSync(path.join(tmp,'report.json.gz.cases'))[0]),bad=JSON.parse(fs.readFileSync(file));bad.resultDigest='corrupt';fs.writeFileSync(file,JSON.stringify(bad));let rejected=false;try{await parent();}catch(e){rejected=e.message.includes('Invalid campaign cache');}T.ok('a corrupt cached result fails instead of becoming evidence',rejected);}finally{assert.strictEqual(path.dirname(path.resolve(tmp)),path.resolve(os.tmpdir()));assert(path.basename(tmp).startsWith('oversight-campaign-'));fs.rmSync(tmp,{recursive:true});}
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
