// Reproduce changing legacy failure categories on an unchanged frozen base.
// No test edits, assertion changes, quarantines or claim of a green full run.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const before=path.resolve(process.argv[2]),after=path.resolve(process.argv[3]);
const preload=path.join(__dirname,'build-choice-sharing-legacy-seed.cjs');
const tests=[['test-drifter-joinstay.js','they foraged their own turf while you lived there'],['test-enter-building-guard.js','FAIL left haven'],['test-item-use.js','FAIL age gate holds'],['test-moot-justice-aftermath.js','FAIL judged heat is half of unjudged'],['test-past-deflect-gate.js','none found']];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=root=>require(path.join(root,'scripts/balance-panel')).manifest(root);
const sources=manifest(before);if(JSON.stringify(sources)!==JSON.stringify(manifest(after)))throw Error('Game/policy sources differ');
function run(root,test,seed){const r=cp.spawnSync(process.execPath,['--require',preload,path.join(root,'scripts',test)],{cwd:root,env:{...process.env,OVERSIGHT_LEGACY_PROBE_SEED:String(seed)},encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024});if(r.error)throw r.error;return {code:r.status,stdout:r.stdout,stderr:r.stderr};}
const output={baseCommit:'f1ab62c7dc390fe0293b32571b846cf7953ad31a',node:process.version,sources,preloadSha256:sha(fs.readFileSync(preload)),probeSha256:sha(fs.readFileSync(__filename)),clock:'Legacy real clock unchanged; seed injected before module evaluation.',results:[]};
for(const[test,signature]of tests){const name='scripts/'+test,raw=fs.readFileSync(path.join(before,name));if(!raw.equals(fs.readFileSync(path.join(after,name))))throw Error('Legacy test bytes differ '+test);const attempts=[];let match=null;for(let seed=1;seed<=32;seed++){const r=run(before,test,seed);attempts.push({seed,code:r.code,matched:r.code!==0&&r.stdout.includes(signature)});if(attempts.at(-1).matched){const candidate=run(after,test,seed);match={seed,baseline:r,candidate,signatureMatched:candidate.code!==0&&candidate.stdout.includes(signature)};break;}}output.results.push({test,signature,testSha256:sha(raw),attempts,match});}
console.log(JSON.stringify(output,null,2));if(output.results.some(r=>!r.match?.signatureMatched))process.exitCode=1;
