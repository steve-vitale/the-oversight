'use strict';
// Fixed diagnostic cases from the retained screen, not a new balance estimate.
// Only disposable source copies are changed; the live checkout stays frozen.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),z=require('node:zlib'),assert=require('node:assert/strict'),B=require('../../scripts/balance-panel');
const root=process.cwd(),prefix='evidence/2026-10-20/haven-access-ablation-r1',read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f)));
const panel=read('evidence/2026-10-20/haven-access-after-r1.json.gz'),before=read('evidence/2026-10-20/haven-access-before-r1.json.gz');
const policies=['maker','caregiver'],seed=1;
for(const policy of policies){const a=before.rows.find(r=>r.row.policy===policy&&r.row.seed===seed),b=panel.rows.find(r=>r.row.policy===policy&&r.row.seed===seed);assert(a&&b);assert(policy==='maker'?a.metrics.classAccess>b.metrics.classAccess:a.metrics.survival30>b.metrics.survival30);}
const scratch=path.join(path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),'haven-access-ablation-r1');
if(fs.existsSync(scratch))throw Error('Diagnostic roots already exist; inspect before reuse');fs.mkdirSync(scratch);
function replaceExactly(text,needle,replacement,count=1){assert.equal(text.split(needle).length-1,count,'Exact diagnostic edit');return text.split(needle).join(replacement);}
(async()=>{
 const initial=B.manifest(root),reports={};
 for(const arm of ['control','no-door-save','old-door-landing','old-tent-placement']){
  const dir=path.join(scratch,arm);fs.mkdirSync(dir);
  for(const name of ['src','scripts','tools','index.html','sw.js','version.json','manifest.json'])fs.cpSync(path.join(root,name),path.join(dir,name),{recursive:true});
  const game=path.join(dir,'src/js/game.js');let text=fs.readFileSync(game,'utf8').replace(/\r\n/g,'\n');
  if(arm==='no-door-save'){
   text=replaceExactly(text,'      if (!doorFlee) this.save();\n','',2);
   text=replaceExactly(text,'          this.save();\n          return true;\n        }\n      }\n      // ACTION ECONOMY','          return true;\n        }\n      }\n      // ACTION ECONOMY');
  }else if(arm==='old-door-landing')text=replaceExactly(text,'      const landing = this.havenDoorLanding(this.genDetail(this.map.px, this.map.py));','      this.genDetail(this.map.px, this.map.py);\n      const landing = { x: 4, y: 2 };');
  else if(arm==='old-tent-placement')text=replaceExactly(text,'            if (jx === 4 && jy === 5) { jx = 2; jy = 5; }\n','');
  fs.writeFileSync(game,text);
  const out=path.join(dir,'panel'),fd=fs.openSync(prefix+'-'+arm+'.log','wx');
  await new Promise((resolve,reject)=>{const p=cp.spawn(process.execPath,['scripts/balance-panel.js','--root',dir,'--seeds',String(seed),'--policies',policies.join(','),'--days','150','--par','2','--out',out],{cwd:root,stdio:['ignore',fd,fd]});p.once('error',reject);p.once('close',code=>{fs.closeSync(fd);code?reject(Error(arm+' exit '+code)):resolve();});});
  const result=read(path.join(out,'panel.json.gz'));fs.copyFileSync(path.join(out,'panel.json.gz'),prefix+'-'+arm+'.json.gz');
  if(arm==='control')for(const r of result.rows){const expected=panel.rows.find(x=>x.row.policy===r.row.policy&&x.row.seed===seed);assert.deepEqual(r.row,expected.row,'Unmodified cloned control outcome');assert.deepEqual(r.metrics,expected.metrics,'Unmodified cloned control metrics');assert.equal(r.stateHash,expected.stateHash,'Unmodified cloned control full state');}
  reports[arm]={sourceDigest:result.sourceDigest,neutrality:result.validity.neutrality,rows:result.rows.map(r=>({policy:r.row.policy,seed:r.row.seed,row:r.row,metrics:r.metrics,stateHash:r.stateHash,warnings:r.warnings,observerErrors:r.observerErrors}))};
  console.log(JSON.stringify({arm,rows:reports[arm].rows.map(r=>({policy:r.policy,class:r.metrics.classAccess,survival30:r.metrics.survival30,won:r.metrics.won,deaths:r.metrics.playerDeaths}))}));
 }
 assert.deepEqual(B.manifest(root),initial,'Active source remains fixed');
 fs.writeFileSync(prefix+'-summary.json',JSON.stringify({scope:'Fixed seed1: first sorted maker lost-class and caregiver early-survival-loss case in the retained screen. Each lever is reversed separately in a disposable root. Diagnostic association within these fixed cases; not a population estimate or proof that a higher win rate is better.',policies,seed,source:initial,reports},null,2)+'\n',{flag:'wx'});
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
