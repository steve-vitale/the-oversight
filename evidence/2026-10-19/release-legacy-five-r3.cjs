'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),z=require('zlib');
const dir=__dirname,primary='038a96b39ebf3d49cf6bf02d22377a2e1cdc8b2e',prior=JSON.parse(fs.readFileSync(path.join(dir,'release-contact2-dispositions-r2.json'))),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const runtime=['scripts/godpath/test-coalition-scale.js','scripts/godpath/test-coalition-body-turns.js','scripts/test-network-commit-lock-runtime.js'];
function resolution(file,line){
 if(file.includes('campaigner')||file.includes('capable-death-fixes'))return{kind:'historical_controller_contract_excluded',reason:'The old optional controller module/exports, A/B flags and counters are absent from the current four-policy registry. This is an explicit coverage limitation, not a passing claim or an assumption that current bots behave equivalently. Human coalition/escape/beam/contest actions have separate runtime/native proofs; no broad controller rewrite in this release milestone.',currentRuntime:runtime};
 if(file.includes('network-commit-lock'))return /later-node policy|later Network road|heart policy/.test(line)?{kind:'historical_campaigner_controller_excluded',reason:'Depends on the absent optional campaigner module. No policy survivor-floor or recruitment behavior clearance is inferred from the runtime lock test.'}:{kind:'recovered_runtime_contract',current:['scripts/test-network-commit-lock-runtime.js']};
 if(file.includes('resumed-survival')){
  if(/human-class maximum beam/.test(line))return{kind:'old_numeric_tune_excluded',reason:'The legacy65–85% damage proposal is not a direct Steve numeric directive. Current90–110% maximum-HP damage remains deliberately lethal at the top end; fixed-tile aim supplies a real response window. Do not assert that an unprotected maximum hit is survivable.'};
  if(/beam reads the actual|human full-body|advanced full-body|sufficient gear|inventory armor/.test(line))return{kind:'covered_current_protection_semantics',reason:'Actual fighter capacity and own worn slots are preserved. Current minimum216 at240HP and protected maximum18 at100HP replace old156/14 numeric expectations, without weakening damage.',current:['scripts/godpath/test-release-survival-boundaries.js','scripts/godpath/test-phase-shawl.js']};
  if(/aim|wind-up|moving off|staying on/.test(line))return{kind:'recovered_response_window',current:['scripts/godpath/test-alien-beam-window-release.js']};
  if(/sleep protection/.test(line))return{kind:'covered_real_relocated_contact',current:['scripts/godpath/test-release-survival-boundaries.js','scripts/godpath/test-palisade-sleep.js']};
  return{kind:'recovered_current_wave_posts',current:['scripts/godpath/test-raid-posts-release.js']};
 }
 if(file.includes('resumed-table')){
  if(/failed path closes|closed path cannot|fallback begins/.test(line))return{kind:'recovered_current_failedDoors_contract',reason:'Current state uses failedDoors; stale direct and native-choice reentry cannot restart the path; opening advantages are really reduced and saved.',current:['scripts/godpath/test-table-failure-release.js']};
  if(/two played failures/.test(line))return{kind:'excluded_in_favor_of_Table_law4',reason:'Automatic whole-run loss after two failures conflicts with TABLE.md law4: failure resolves the story. Preserve finite closed doors, played fallback and eventual honest ending; do not reinstate deletion.'};
  if(/closing leverage|declared stake reaches/.test(line))return{kind:'old_closing_threshold_tune_excluded',reason:'The historic terror4 final gate is an additional numeric proposal, not a current authored finale condition. Current Feared choices can deliberately spend terror protecting others; adding an undisclosed final threshold would reject that route. Existing horror failure and explicit build-option stakes remain. No claim the old threshold assertion passes.'};
  return{kind:'old_entry_standing_or_food_tune_excluded',reason:'Cumulative late-wave entry, unbounded standing curves and a500kcal failure tax are old balance proposals. Current TABLE.md lesser-seat bar is distinct4/4/3 wave encounters; preserve current priced paths and stated costs. No direct Steve quote prescribes those numeric replacements.'};
 }
 throw Error('Unclassified legacy file '+file);
}
const originals={},mapped=[];
for(const row of prior.rows.filter(r=>r.disposition==='pending explicit disposition')){
 const source=cp.execFileSync('git',['show',primary+':'+row.legacy],{encoding:'utf8'});originals[row.legacy]=source;
 const assertions=source.split('\n').flatMap((line,i)=>line.includes('T.ok(')?[{line:i+1,source:line.trim(),resolution:resolution(row.legacy,line)}]:[]);if(!assertions.length)throw Error('No original assertion inventory');
 mapped.push({legacy:row.legacy,primary,sourceSha256:sha(source),scope:'Static assertion call sites; templated loops may execute several checks. This inventory does not rerun the historical script.',assertions});
}
for(const item of mapped)for(const a of item.assertions)for(const f of a.resolution.current||[])if(!fs.existsSync(f))throw Error('Missing current proof '+f);
const next={...prior,scope:'All24 original contracts now have explicit dispositions. Runtime recoveries, superseded semantics, historical controller exclusions and numeric proposals are distinguished; excluded assertions are never counted as passing. Broader193-commit review and hosted/device release gates remain separate.',rows:prior.rows.map(row=>{const item=mapped.find(r=>r.legacy===row.legacy);return item?{...row,disposition:'explicit split disposition; see per-assertion mapping',mapping:'release-legacy-five-assertions-r3.json',resolutionKinds:[...new Set(item.assertions.map(a=>a.resolution.kind))]}:row})};
fs.writeFileSync(path.join(dir,'release-legacy-five-originals-r3.json.gz'),z.gzipSync(JSON.stringify({primary,originals})),{flag:'wx'});
fs.writeFileSync(path.join(dir,'release-legacy-five-assertions-r3.json'),JSON.stringify({scope:'No historical test is declared passing by exclusion. Read individual assertion dispositions and current proof results.',files:mapped},null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(dir,'release-contact2-dispositions-r3.json'),JSON.stringify(next,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:mapped.length,assertionCallSites:mapped.reduce((n,r)=>n+r.assertions.length,0),pending:next.rows.filter(r=>r.disposition==='pending explicit disposition').length}));
