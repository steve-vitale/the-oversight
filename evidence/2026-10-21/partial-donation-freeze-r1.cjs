'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),z=require('zlib'),crypto=require('crypto'),B=require('../../scripts/balance-panel');
const stage=process.argv[2];assert(['game','controller'].includes(stage));
const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),root=path.join(common,'partial-donation-'+stage+'-r1');
if(fs.existsSync(root))throw Error('Frozen root exists');const sources=B.manifest(process.cwd()),files=new Set(Object.keys(sources));
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(/\.(js|json)$/.test(f))files.add(f.replace(/\\/g,'/'));}}walk('scripts');
for(const f of files){const target=path.resolve(root,f);assert(target.startsWith(root+path.sep));fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(f,target);}
assert.deepEqual(B.manifest(root),sources);
if(stage==='game'){
 const panelFile='evidence/2026-10-21/garden-transfer-after-r1.json.gz',panel=JSON.parse(z.gunzipSync(fs.readFileSync(panelFile))),oldRoot=path.join(common,'garden-transfer-after-r1');
 assert.deepEqual(B.manifest(oldRoot),panel.sources);assert.equal(sources['scripts/policies/competent.js'],panel.sources['scripts/policies/competent.js']);
 const observer=B.observerIdentity(process.cwd());assert.equal(observer.observerDigest,panel.observerDigest);assert.equal(observer.contractDigest,panel.contractDigest);
 fs.writeFileSync('evidence/2026-10-21/partial-donation-baseline-reuse-r1.json',JSON.stringify({root:oldRoot,panel:panelFile,sha256:crypto.createHash('sha256').update(fs.readFileSync(panelFile)).digest('hex'),sources:panel.sources,observer,scope:'Exact retained baseline, same observer/contract/policy. Candidate Game is freshly observed.'},null,2)+'\n',{flag:'wx'});
}else{
 const before=require('./partial-donation-game-root-r1.json');assert.deepEqual(Object.keys(sources).filter(f=>sources[f]!==before.sources[f]),['scripts/policies/competent.js']);
}
fs.writeFileSync('evidence/2026-10-21/partial-donation-'+stage+'-root-r1.json',JSON.stringify({root,sources,scope:stage==='game'?'Player partial action on current unchanged whole-stack controller.':'Same candidate Game with the controller using real partial transfers.'},null,2)+'\n',{flag:'wx'});
console.log(root);
