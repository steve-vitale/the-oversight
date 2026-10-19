'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),cp=require('child_process');
const dir=__dirname,read=n=>JSON.parse(fs.readFileSync(path.join(dir,n))),hash=s=>crypto.createHash('sha256').update(s).digest('hex'),census=read('release-inclusion-contract-census-r1.json'),kit=read('release-primary-proof-dispositions-r7.json'),legacy=read('release-contact2-dispositions-r3.json'),rest=read('release-inclusion-decisions-r2.json'),split=read('release-legacy-five-assertions-r3.json'),supp=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir,'release-inclusion-supplemental-r2.json.gz'))));
const full=fs.readFileSync(path.join(dir,'release-preview-full-r1.log'),'utf8');if(!/check\.js: 1044 passed, 0 failed/.test(full))throw Error('Current full proof is incomplete');
const list=f=>fs.readFileSync(f,'utf8').split('\n').map(l=>l.replace(/#.*/,'').trim().split(/\s/)[0]).filter(Boolean),q=new Set(list('scripts/green-list-quarantine.txt')),automatic=new Set([...fs.readdirSync('scripts/godpath').filter(f=>/^test-.*\.js$/.test(f)).map(f=>'scripts/godpath/'+f),...list('scripts/green-list.txt').filter(f=>!q.has(f))]);
const boundary=f=>{if(!fs.existsSync(f))throw Error('Missing boundary '+f);return{file:f,automatic:automatic.has(f),sourceSha256:hash(fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'))}};
const resolutions=new Map();
for(const file of new Set(census.rows.flatMap(r=>r.tests.map(t=>t.file)))){
 let r;if(fs.existsSync(file)){
  if(automatic.has(file))r={kind:'current_named_automatic_contract',boundaries:[boundary(file)],acceptance:'release-preview-full-r1.log.gz'};
  else{const s=supp.find(r=>r.file===file);if(!s)throw Error('Unreviewed non-automatic test '+file);r={kind:s.exit===0?'current_supplemental_pass':'superseded_historical_fixture_assertions',exit:s.exit,scope:s.scope,boundaries:file.endsWith('test-carexplore.js')?[boundary('scripts/godpath/test-gift-food-budget.js'),boundary('scripts/godpath/test-cell-popup-dispatch-release.js')]:[boundary(file)],acceptance:'release-inclusion-supplemental-r2.json.gz'}}
 }else{
  const k=kit.rows.find(r=>r.file===file),l=legacy.rows.find(r=>r.legacy===file),n=rest.rows.find(r=>r.file===file);
  if(k)r={kind:'prior_shared_kit_explicit_disposition',resolution:k.currentResolution,mapping:'release-primary-proof-dispositions-r7.json'};
  else if(l){
   if(l.current)r={kind:l.disposition,boundaries:[boundary(l.current)],mapping:'release-contact2-dispositions-r3.json'};
   else if(file.includes('drift-zero-coordinate'))r={kind:'literal_current_drift_contract',boundaries:[boundary('evidence/2026-10-19/release-drift-current-r2.cjs')],acceptance:'release-drift-current-r2.log.gz'};
   else if(file.includes('god-verbs-wired'))r={kind:'recovered_automatic_God_runtime_contract',boundaries:[boundary('scripts/godpath/test-god-verbs-runtime.js')]};
   else{const s=split.files.find(r=>r.legacy===file);if(!s)throw Error('Missing split '+file);r={kind:'explicit_per_assertion_split',resolutionKinds:[...new Set(s.assertions.map(a=>a.resolution.kind))],mapping:'release-legacy-five-assertions-r3.json'}}
  }else if(n)r={kind:n.kind,reason:n.reason,boundaries:n.currentRuntimeBoundaries.map(boundary),mapping:'release-inclusion-decisions-r2.json'};
  else if(file.includes('sim-harness-portable'))r={kind:'recovered_portable_harness',boundaries:[boundary('scripts/godpath/test-harness-no-grep.js')]};
  else if(file.includes('wiring-guard'))r={kind:'recovered_wiring_guard',boundaries:[boundary('scripts/godpath/test-wiring-evidence.js')],acceptance:'release-wiring-fault-control-r1.json'};
  else throw Error('Unclassified original test '+file);
 }
 resolutions.set(file,r);
}
const rows=census.rows.map(c=>({sha:c.sha,subject:c.subject,runtimeFiles:c.runtimeFiles,exactSourcePatchCommit:c.exactSourcePatchCommit,kind:c.runtimeFiles.length?'served_change_with_current_contracts_or_explicit_exclusions':'historical_tooling_or_records_outside_player_runtime',tests:c.tests.map(t=>({file:t.file,resolution:resolutions.get(t.file)})),scope:c.runtimeFiles.length?'Read each contract and exclusion; this is not an assertion that every historical line or optional controller was restored.':'Non-player tooling/record changes keep their source identities. Current shared measurement, guards and explicit experiment exclusions supersede obsolete tooling; historical results are not relabelled current.'}));
const report={head:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'Finite source reconciliation map for the193 previously enumerated divergent commits (including primary149), with dispositions for every237 original test name. Current automatic/supplemental contracts, replacements and exclusions remain distinct. No whole-game correctness, natural attainment, physical-device or launch clearance claim.',counts:{commits:rows.length,servedChangeCommits:rows.filter(r=>r.runtimeFiles.length).length,toolingRecordCommits:rows.filter(r=>!r.runtimeFiles.length).length,originalTests:resolutions.size,unclassifiedOriginalTests:0},tests:[...resolutions].map(([file,resolution])=>({file,resolution})),rows};
fs.writeFileSync(path.join(dir,'release-canonical-contract-map-r3.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report.counts));
