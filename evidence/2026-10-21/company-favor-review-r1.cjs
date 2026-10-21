'use strict';
// All paired cases with any changed balanced metric; diagnostic, not a holdout.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
const prefix='evidence/2026-10-21/company-favor-',read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f)));
const beforePanel=prefix+'before-r1.json.gz',afterPanel=prefix+'after-r1.json.gz',before=read(beforePanel),after=read(afterPanel);
const cases=after.rows.flatMap(a=>{const b=before.rows.find(r=>r.row.policy===a.row.policy&&r.row.seed===a.row.seed);const changed=Object.keys(a.metrics).filter(k=>a.metrics[k]!==b.metrics[k]);return changed.length?[{policy:a.row.policy,seed:a.row.seed,reason:'Every changed metric case: '+changed.join(', ')}]:[];});
const plan={beforeRoot:JSON.parse(fs.readFileSync('evidence/2026-10-20/company-favor-baseline-root-r1.json')).root,afterRoot:process.cwd(),beforePanel:path.resolve(beforePanel),afterPanel:path.resolve(afterPanel),cases};
const file=prefix+'replay-r1-plan.json';fs.writeFileSync(file,JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
const result=cp.spawnSync(process.execPath,['scripts/review-god-restoration.js','--plan',file,'--out',prefix+'replay-r1'],{encoding:'utf8',maxBuffer:16*1024*1024});
fs.writeFileSync(prefix+'replay-r1.log',result.stdout+'\n'+result.stderr,{flag:'wx'});console.log(result.stdout);if(result.status!==0)throw Error(result.stderr||'Replay failed');
