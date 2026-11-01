'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib'),assert=require('assert/strict');
const K=require('./lib'),T=K.reporter('Campaign continuation geography'),root=K.ROOT;
const run=args=>cp.execFileSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
const parse=(text,marker)=>JSON.parse(text.split(marker).at(-1));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-campaign-geo-'));
try{
 const cases=[{id:'default',args:[]},{id:'main-panel',args:['--origin','Columbus, Ohio','--region','na_eastern_woodlands'],region:'na_eastern_woodlands'},
  {id:'independent-origin-and-landing',args:['--origin','Paris, France','--region','sa_amazon'],region:'sa_amazon'}];
 let alternate;
 for(const c of cases){
  const audit=parse(run(['scripts/campaign-terminal-audit.js','--child','--root',root,'--seed','731','--policy','caregiver','--cap','2','--prefix-cap','1','--trace','0',...c.args]),'@@TERMINAL@@');
  const standard=parse(run(['scripts/balance-panel.js','--child','--root',root,'--seed','731','--policy','caregiver','--days','2','--observe','1',...c.args]),'@@BALANCE@@');
  assert.deepEqual(audit.row,standard.row);assert.equal(audit.stateHash,standard.stateHash);assert.deepEqual(audit.observation.metrics,standard.metrics);assert.deepEqual(audit.observation.gear,standard.gear);
  T.ok(c.id+' retains the exact standard whole row/state/all29/gear',true);
  if(c.region){assert.equal(audit.finalState.region,c.region);T.ok(c.id+' uses the requested landing region',true);}
  if(c.id==='independent-origin-and-landing')alternate=audit;
 }
 const out=path.join(temp,'regional');run(['scripts/campaign-terminal-audit.js','--root',root,'--seeds','731','--policy','caregiver','--caps','1,2','--origin','Paris, France','--region','sa_amazon','--par','1','--out',out]);
 const report=JSON.parse(z.gunzipSync(fs.readFileSync(out+'.json.gz'))),long=report.results.find(r=>r.job.cap===2&&r.job.trace===1);
 assert.equal(report.plan.configuration.origin,'Paris, France');assert.equal(report.plan.configuration.region,'sa_amazon');
 T.ok('parent records explicit origin and landing in configuration/cache identity',true);
 assert(report.results.every(r=>r.finalState.region==='sa_amazon'));assert.deepEqual(long.row,alternate.row);assert.equal(long.stateHash,alternate.stateHash);
 T.ok('actual parent forwards both options through every observed/off child',true);
 assert(report.stable&&report.neutral.every(n=>n.match)&&report.prefixes.every(n=>n.ok));
 T.ok('regional parent retains real passive neutrality and exact prefix controls',true);
}finally{
 const owned=fs.realpathSync(temp),parent=fs.realpathSync(os.tmpdir());assert.equal(path.dirname(owned),parent);assert(path.basename(owned).startsWith('oversight-campaign-geo-'));fs.rmSync(owned,{recursive:true,force:true});
}
T.done();
