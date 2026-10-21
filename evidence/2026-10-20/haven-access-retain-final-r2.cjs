'use strict';
const fs=require('fs'),z=require('zlib'),crypto=require('crypto'),B=require('../../scripts/balance-panel');
const prefix='evidence/2026-10-20/haven-access-';
for(const file of ['docs/AGENT-LANES.md','docs/MUSE-CALIBRATION-HANDOFF.md',prefix+'audit-r1.md']){
 let s=fs.readFileSync(file,'utf8').replaceAll('3f09b84a1-20261020-225850','3f09b84a1-20261020-235403').replaceAll('29 shared-harness','35 shared-harness').replaceAll('Shared-kit29','Shared-kit35').replaceAll('test-haven-access.js:29','test-haven-access.js:35').replaceAll('green-r5','green-r8');
 fs.writeFileSync(file,s);
}
const note='\nFinal fallback revision (build3f09b84a1-20261020-235403): a camp with nine tents erected through actual paid actions blocked every preferred landing while leaving connected exterior open. The final helper searches all connected non-garden exterior cells before refusing; it preserves every structure. The frozen first candidate fails the same reproduction, the final candidate exits successfully. Shared-kit coverage is35 checks including128 saved obstruction layouts. Final phone-r2 has17 trusted-touch checkpoints at each height, including the paid nine-tent yard, walking out to the world and Continue; combat-r4 has7, frame-r3 and water haven-final-r2 have16 each. Lifecycle-r2 proves old installed-worker update and cold offline Continue. Prepared fixtures do not establish naturally earned campaigns or physical-device clearance.\n\nFresh final-source screen/holdout after-r2 panels contain192 campaigns and match EVERY retained first-candidate row field, canonical state hash, outcome and all23 metrics (equivalence-r1.json). Earlier replays, ablations and eligibility queries retain their original first-candidate source identities; they were not rerun on the final source. Their sampled endpoints match the new actual runs, not a universal equivalence claim. Both final scorecards remain review_required. The lost caregiver Table pace stays open for the next bounded terminal-campaign milestone.\n';
for(const file of [prefix+'audit-r1.md','docs/SURVIVAL-LEVERS.md','docs/MUSE-CALIBRATION-HANDOFF.md','docs/AGENT-LANES.md'])fs.appendFileSync(file,note);
let audit=fs.readFileSync(prefix+'audit-r1.md','utf8').replace('journeys:12 checkpoints','journeys:17 checkpoints').replace('Final r3 uses ordinary100 HP','Final r4 uses ordinary100 HP');fs.writeFileSync(prefix+'audit-r1.md',audit);
for(const height of [736,844]){
 for(const n of [2,8,14,16,17])fs.copyFileSync('.playwright-mcp/haven-access-final-r2-'+height+'-'+n+'.png',prefix+'phone-'+height+'-'+n+'-r2.png');
 for(const n of [2,6,7])fs.copyFileSync('.playwright-mcp/haven-access-combat-r4-'+height+'-'+n+'.png',prefix+'combat-'+height+'-'+n+'-r4.png');
 fs.copyFileSync('.playwright-mcp/water-favor-haven-final-r2-'+height+'-14.png',prefix+'water-'+height+'-r2.png');
}
const old=JSON.parse(z.gunzipSync(fs.readFileSync(prefix+'source-final-r1.json.gz'))),files={},hashes={};
for(const file of Object.keys(old.files)){files[file]=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');hashes[file]=crypto.createHash('sha256').update(files[file]).digest('hex');}
const bundle={scope:old.scope,head:old.head,version:JSON.parse(fs.readFileSync('version.json')).version,sources:B.manifest(process.cwd()),hashes,files};
fs.writeFileSync(prefix+'source-final-r2.json.gz',z.gzipSync(JSON.stringify(bundle)+'\n'),{flag:'wx'});
console.log('Final source, documentation and selected screenshots retained');
