'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),assert=require('assert'),crypto=require('crypto'),S=require('../../scripts/lib/balance-scorecard');
const dir=__dirname,read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f))),write=(f,x)=>fs.writeFileSync(path.join(dir,f),JSON.stringify(x,null,2)+'\n'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const sources=read(path.join(dir,'ward-sources.json.gz')),reuse=path.join(dir,'quartermaster-standard-report.json.gz');
assert.deepStrictEqual(read(reuse).sources,sources.arms.before.sources);
write('ward-baseline-reuse.json',{report:'quartermaster-standard-report.json.gz',sha256:sha(fs.readFileSync(reuse)),jobs:'quartermaster-standard-jobs.json.gz',jobsSha256:sha(fs.readFileSync(path.join(dir,'quartermaster-standard-jobs.json.gz'))),reason:'Identical211-entry baseline Game/policy/harness manifest and current observer; preserve original report identity and provenance.'});
for(const cohort of ['screen','holdout']){
 const panels={};
 for(const arm of ['before','parity','after']){
  const retained=path.join(dir,`ward-${arm}-${cohort}-report.json.gz`);
  const src=cohort==='screen'&&arm==='before'?reuse:fs.existsSync(retained)?retained:path.resolve('.git/ward-'+arm+'-'+cohort+'/panel.json.gz');
  const p=panels[arm]=read(src);assert.deepStrictEqual(p.sources,sources.arms[arm].sources);assert(p.validity.sourcesStable&&p.validity.neutrality.every(n=>n.match&&!n.warnings));
  if(!(cohort==='screen'&&arm==='before')&&!fs.existsSync(retained)){fs.copyFileSync(src,retained);const cache=path.resolve('.git/ward-'+arm+'-'+cohort+'/cases'),jobs=fs.readdirSync(cache).filter(n=>n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync(path.join(cache,n))));fs.writeFileSync(path.join(dir,`ward-${arm}-${cohort}-jobs.json.gz`),z.gzipSync(JSON.stringify(jobs)+'\n'));}
 }
 const plan=[];
 for(const [a,b]of [['before','parity'],['parity','after'],['before','after']]){
  const score=S.comparePanels(panels[a],panels[b]);assert(!score.errors.length&&score.policies.every(p=>p.metrics.length===23));const prefix=`ward-${cohort}-${a}-${b}`;write(prefix+'-score.json',score);fs.writeFileSync(path.join(dir,prefix+'-score.md'),S.markdown(score));
  const changes=panels[b].rows.filter(r=>r.stateHash!==panels[a].rows.find(q=>q.row.seed===r.row.seed&&q.row.policy===r.row.policy).stateHash);console.log(cohort,a+' -> '+b,'changed hashes',changes.length,score.decision);
  for(const r of changes)for(const arm of [a,b])if(!plan.some(x=>x.arm===arm&&x.policy===r.row.policy&&x.seed===r.row.seed)){const expected=panels[arm].rows.find(q=>q.row.seed===r.row.seed&&q.row.policy===r.row.policy);plan.push({arm,policy:r.row.policy,seed:r.row.seed,sourceDigest:panels[arm].sourceDigest,expected});}
 }
 fs.writeFileSync(path.join(dir,`ward-${cohort}-replay-plan.json.gz`),z.gzipSync(JSON.stringify(plan)+'\n'));console.log(cohort,'unique diagnostic replays',plan.length);
}
