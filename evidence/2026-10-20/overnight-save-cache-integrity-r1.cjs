'use strict';
const fs=require('fs'),z=require('zlib'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert/strict');
const source='evidence/2026-10-20/overnight-save-terminal-r3',proof=[];
for(const kind of ['finalState','bridge','resume']){
 const target='evidence/2026-10-20/overnight-save-cache-'+kind+'-r1';
 fs.copyFileSync(source+'-plan.json',target+'-plan.json',fs.constants.COPYFILE_EXCL);fs.mkdirSync(target+'-cases');
 for(const file of fs.readdirSync(source+'-cases'))fs.copyFileSync(source+'-cases/'+file,target+'-cases/'+file,fs.constants.COPYFILE_EXCL);
 if(kind!=='resume'){
  const file=fs.readdirSync(target+'-cases').find(file=>JSON.parse(z.gunzipSync(fs.readFileSync(target+'-cases/'+file))).result.bridge),absolute=target+'-cases/'+file,cache=JSON.parse(z.gunzipSync(fs.readFileSync(absolute)));
  const state=kind==='bridge'?cache.result.bridge.state:cache.result.finalState;state.scholar.kcal++;
  // Update the outer byte digest deliberately: the child's independent state
  // hash, not just the cache checksum, must reject this semantic corruption.
  cache.digest=crypto.createHash('sha256').update(JSON.stringify(cache.result)).digest('hex');fs.writeFileSync(absolute,z.gzipSync(JSON.stringify(cache)));
 }
 const r=cp.spawnSync(process.execPath,['scripts/campaign-terminal-audit.js','--root','.','--out',target],{encoding:'utf8',env:process.env,maxBuffer:8e6});
 fs.writeFileSync(target+'.log',r.stdout+r.stderr,{flag:'wx'});
 if(kind==='resume'){
  assert.equal(r.status,0,r.stderr);assert(!r.stdout.includes('.'),'resume must not execute new children');
  const read=p=>JSON.parse(z.gunzipSync(fs.readFileSync(p+'.json.gz'))),sort=x=>x.results.sort((a,b)=>a.seed-b.seed||a.cap-b.cap||a.job.trace-b.job.trace);assert.deepEqual(sort(read(source)),sort(read(target)));
 }else{assert.notEqual(r.status,0);assert.match(r.stderr,/Invalid cache/);assert(!fs.existsSync(target+'.json.gz'));}
 proof.push({kind,rejected:kind!=='resume',exactReuse:kind==='resume',childCampaignsExecuted:0});
}
fs.writeFileSync('evidence/2026-10-20/overnight-save-cache-integrity-r1.json',JSON.stringify({proof,scope:'Prepared semantic cache corruption with recomputed outer digests. Final-state and continued-bridge child hashes reject damage; untouched cache preserves every raw result without new campaigns.'},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(proof));
