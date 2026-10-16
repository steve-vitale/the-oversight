'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),cp=require('child_process'),assert=require('assert');
const name=process.argv[2],output=process.argv[3],repo=path.resolve(__dirname,'../..');
if(!output||!['primary-before','primary-after','shared-after'].includes(name))throw Error('Usage: node npc-measurement-reconstruct.cjs primary-before|primary-after|shared-after <fresh-directory>');
const bundle=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'npc-measurement-sources.json.gz')))),arm=bundle.arms[name],root=path.resolve(output),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(fs.existsSync(root))throw Error('Output must not exist');
const archive=cp.execFileSync('git',['archive',arm.baseCommit,'src','scripts','docs','index.html','.gitattributes','AGENTS.md'],{cwd:repo,maxBuffer:128*1024*1024});
fs.mkdirSync(root,{recursive:true});cp.execFileSync('tar',['-xf','-','-C',root],{input:archive,maxBuffer:128*1024*1024});
const files={...arm.files,'scripts/godpath/test-balance-npc-eligibility.js':bundle.proof};
for(const [n,r]of Object.entries(files)){const target=path.resolve(root,n),bytes=Buffer.from(r.base64,'base64');assert(target.startsWith(root+path.sep));assert.strictEqual(sha(bytes),r.sha256,n);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
for(const [n,h]of Object.entries(arm.sources))assert.strictEqual(sha(fs.readFileSync(path.join(root,n),'utf8').replace(/\r\n/g,'\n')),h,n);
console.log(JSON.stringify({arm:name,root,sourceFiles:Object.keys(arm.sources).length,head:null}));
