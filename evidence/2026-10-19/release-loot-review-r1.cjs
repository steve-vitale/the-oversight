'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
const dir=__dirname,common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),read=p=>JSON.parse(z.gunzipSync(fs.readFileSync(p))),key=x=>x.row.policy+':'+x.row.seed;
const result={scope:'Screen-level all23 metric review; loot-only comparison isolates current feedback/access changes from pending survival repairs. Pacing/event differences are investigation pointers, not causal attribution.',regions:{}};
for(const region of ['na','eu']){
 const before=read(path.join(dir,'release-regional-'+region+'-after-r1.json.gz')),survival=read(path.join(common,'release-survival-'+region+'-after-r1','panel.json.gz')),after=read(path.join(dir,'release-loot-'+region+'-after-r1.json.gz')),lookup=new Map(before.rows.map(x=>[key(x),x])),mid=new Map(survival.rows.map(x=>[key(x),x]));
 const identity=p=>({observer:p.observerDigest,contract:p.contractDigest,options:p.options});if(JSON.stringify(identity(before))!==JSON.stringify(identity(after))||JSON.stringify(identity(survival))!==JSON.stringify(identity(after)))throw Error('Mismatched observer/controller/options');
 const changed=[];for(const b of after.rows){const a=lookup.get(key(b)),m=mid.get(key(b));if(!a||!m)throw Error('Missing pair');if(b.stateHash!==m.stateHash||JSON.stringify(b.metrics)!==JSON.stringify(m.metrics))throw Error('Loot-only gameplay drift');
  if(b.stateHash!==a.stateHash){const ap=a.row.pacing.perDay,bp=b.row.pacing.perDay;let first=null;for(let i=0;i<Math.max(ap.length,bp.length);i++)if(JSON.stringify(ap[i])!==JSON.stringify(bp[i])){first={before:ap[i]||null,after:bp[i]||null};break}
   changed.push({case:key(b),firstPacingDifference:first,before:{metrics:a.metrics,deaths:a.row.deaths,events:a.events,endings:a.endings},after:{metrics:b.metrics,deaths:b.row.deaths,events:b.events,endings:b.endings}});
  }
 }
 result.regions[region]={cases:after.rows.length,lootOnlyStatesAndAll23MetricsMatch:true,policies:Object.fromEntries(after.options.policies.map(policy=>{const a=before.rows.filter(x=>x.row.policy===policy),b=after.rows.filter(x=>x.row.policy===policy);return[policy,{winsBefore:a.reduce((s,x)=>s+x.metrics.won,0),winsAfter:b.reduce((s,x)=>s+x.metrics.won,0),changedCases:changed.filter(x=>x.case.startsWith(policy+':')).length}]})),changed};
}
fs.writeFileSync(path.join(dir,'release-loot-review-r1.json.gz'),z.gzipSync(JSON.stringify(result)),{flag:'wx'});console.log(JSON.stringify(Object.fromEntries(Object.entries(result.regions).map(([k,v])=>[k,{cases:v.cases,lootOnlyStatesAndAll23MetricsMatch:v.lootOnlyStatesAndAll23MetricsMatch,policies:v.policies}]))));
