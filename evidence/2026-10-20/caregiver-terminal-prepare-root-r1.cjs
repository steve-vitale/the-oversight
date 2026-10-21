'use strict';
// Reconstruct the exact retained Haven Game/controller; never modify the bundle.
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict'),B=require('../../scripts/balance-panel');
const input='evidence/2026-10-20/haven-access-source-final-r2.json.gz',bundle=JSON.parse(z.gunzipSync(fs.readFileSync(input)));
const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),root=path.join(common,'caregiver-terminal-haven-r1');
const sha=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
for(const [rel,text] of Object.entries(bundle.files)){
 const file=path.resolve(root,rel);assert.ok(file.startsWith(root+path.sep),'Bundle path escaped destination');assert.equal(sha(text),bundle.hashes[rel],rel);
 if(fs.existsSync(file))assert.equal(sha(fs.readFileSync(file,'utf8')),bundle.hashes[rel],rel+' existing root differs');
 else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text,{flag:'wx'});}
}
assert.deepEqual(B.manifest(root),bundle.sources);assert.deepEqual(B.observerIdentity(root),B.observerIdentity(process.cwd()));
const receipt={input,root,head:bundle.head,version:bundle.version,files:Object.keys(bundle.files).length,sources:bundle.sources,observer:B.observerIdentity(root),scope:'Exact retained historical source/controller. Kept separate from the newer garden Game.'};
fs.writeFileSync('evidence/2026-10-20/caregiver-terminal-historical-root-r1.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({root,files:receipt.files,exact:true}));
