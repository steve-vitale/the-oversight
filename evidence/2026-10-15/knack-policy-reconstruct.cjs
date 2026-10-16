'use strict';
const f=require('fs'),path=require('path'),z=require('zlib'),c=require('crypto'),cp=require('child_process');
const arm=process.argv[2],target=process.argv[3];if(!['before','after'].includes(arm)||!target)throw Error('Usage: node knack-policy-reconstruct.cjs before|after <fresh-directory>');
const bundle=JSON.parse(z.gunzipSync(f.readFileSync(path.join(__dirname,'knack-policy-sources.json.gz')))),root=path.resolve(target),repo=path.resolve(__dirname,'../..');
if(f.existsSync(root))throw Error('Output must not exist');
const sha=b=>c.createHash('sha256').update(b).digest('hex');
const archive=cp.execFileSync('git',['archive',bundle.baseCommit,'src','scripts','index.html','.gitattributes'],{cwd:repo,maxBuffer:64*1024*1024});
f.mkdirSync(root,{recursive:true});cp.execFileSync('tar',['-xf','-','-C',root],{input:archive,maxBuffer:64*1024*1024});
if(arm==='after')for(const[n,r]of Object.entries(bundle.replacements)){
 if(!['scripts/policies/capable.js','scripts/godpath/test-capable-knack.js'].includes(n)||sha(r.content)!==r.sha256)throw Error('Invalid replacement');
 f.writeFileSync(path.join(root,n),r.content);
}
const manifest=bundle[arm+'Manifest'];for(const[n,h]of Object.entries(manifest))if(sha(f.readFileSync(path.join(root,n),'utf8').replace(/\r\n/g,'\n'))!==h)throw Error('Source mismatch '+n);
console.log(JSON.stringify({arm,root,sourceFiles:Object.keys(manifest).length,disposition:bundle.disposition}));
