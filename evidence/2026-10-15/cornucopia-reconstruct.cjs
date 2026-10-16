'use strict';
const f=require('fs'),p=require('path'),z=require('zlib'),c=require('crypto'),cp=require('child_process');
const arm=process.argv[2],target=process.argv[3];if(!['before','initial','after'].includes(arm)||!target)throw Error('Usage: node cornucopia-reconstruct.cjs before|initial|after <fresh-directory>');
const bundle=JSON.parse(z.gunzipSync(f.readFileSync(p.join(__dirname,'cornucopia-sources.json.gz')))),root=p.resolve(target),repo=p.resolve(__dirname,'../..'),sha=b=>c.createHash('sha256').update(b).digest('hex');
if(f.existsSync(root))throw Error('Output must not exist');
const archive=cp.execFileSync('git',['archive',bundle.baseCommit,'src','scripts','index.html','.gitattributes'],{cwd:repo,maxBuffer:64*1024*1024});f.mkdirSync(root,{recursive:true});cp.execFileSync('tar',['-xf','-','-C',root],{input:archive,maxBuffer:64*1024*1024});
for(const[n,r]of Object.entries(bundle.arms[arm])){const dest=p.resolve(root,n);if(!dest.startsWith(root+p.sep)||sha(r.content)!==r.sha256)throw Error('Invalid bundled source');f.mkdirSync(p.dirname(dest),{recursive:true});f.writeFileSync(dest,r.content);}
const manifest=bundle[arm+'Manifest'];for(const[n,h]of Object.entries(manifest))if(sha(f.readFileSync(p.join(root,n),'utf8').replace(/\r\n/g,'\n'))!==h)throw Error('Source mismatch '+n);
console.log(JSON.stringify({arm,root,sourceFiles:Object.keys(manifest).length}));
