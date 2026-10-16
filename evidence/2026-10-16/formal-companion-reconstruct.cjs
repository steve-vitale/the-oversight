'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),cp=require('child_process'),assert=require('assert');
const arm=process.argv[2],output=process.argv[3];
if(!['before','after'].includes(arm)||!output)throw Error('Usage: node formal-companion-reconstruct.cjs before|after <fresh-directory>');
const bundle=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'formal-companion-sources.json.gz'))));
const root=path.resolve(output),repo=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(fs.existsSync(root))throw Error('Output must not exist');
const archive=cp.execFileSync('git',['archive',bundle.baseCommit,'src','scripts','docs','index.html','.gitattributes'],{cwd:repo,maxBuffer:64*1024*1024});
fs.mkdirSync(root,{recursive:true});cp.execFileSync('tar',['-xf','-','-C',root],{input:archive,maxBuffer:64*1024*1024});
for(const [name,r]of Object.entries({...bundle.arms[arm],...bundle.proof})){
  const target=path.resolve(root,name);
  if(!target.startsWith(root+path.sep)||sha(r.content)!==r.sha256)throw Error('Invalid replacement '+name);
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,r.content);
}
for(const [name,h]of Object.entries(bundle.manifests[arm]))assert.strictEqual(sha(fs.readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n')),h,name);
console.log(JSON.stringify({arm,root,sourceFiles:Object.keys(bundle.manifests[arm]).length}));
