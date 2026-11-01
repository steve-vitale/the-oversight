#!/usr/bin/env node
'use strict';
// Exact Git Game inputs + one current toolset. Simulation roots, never a deploy.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert/strict');
const B=require('./balance-panel'),{copySimulationInputs}=require('./prepare-calendar-ablation');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const normalized=bytes=>sha(bytes.toString('utf8').replace(/\r\n/g,'\n'));
const gameFile=file=>file==='index.html'||file.startsWith('src/');
function git(repo,args,input){return cp.execFileSync('git',['-C',repo,...args],{input,maxBuffer:128*1024*1024});}
function snapshot(repo,ref){
 assert(/^[a-f0-9]{40}$/i.test(ref),'Use an immutable full Git commit');
 const commit=git(repo,['rev-parse','--verify',ref+'^{commit}']).toString().trim();assert.equal(commit,ref);
 const files=git(repo,['ls-tree','-rz','--name-only',commit,'--','src','index.html']).toString().split('\0').filter(f=>f==='index.html'||/^src\/.*\.(js|json)$/.test(f)).sort();
 assert(files.includes('index.html')&&files.includes('src/js/game.js'),'Complete Game entry/core required');
 assert(files.every(f=>!/[\r\n]/.test(f)&&!f.split('/').includes('..')),'Safe Git paths');
 const raw=git(repo,['cat-file','--batch'],files.map(f=>commit+':'+f+'\n').join('')),blobs={};let at=0;
 for(const file of files){
  const end=raw.indexOf(10,at);assert(end>=0,'Complete Git object header');
  const header=raw.subarray(at,end).toString(),match=/^([a-f0-9]{40}) blob (\d+)$/.exec(header);assert(match,'Expected Git blob: '+file);
  const size=Number(match[2]),start=end+1,bytes=raw.subarray(start,start+size);assert.equal(bytes.length,size);assert.equal(raw[start+size],10);
  blobs[file]={bytes,gitBlob:match[1],sha256:sha(bytes),normalizedSha256:normalized(bytes)};at=start+size+1;
 }
 assert.equal(at,raw.length,'All Git output consumed');return{commit,blobs};
}
function prepare({repo,toolRoot,baselineRef,candidateRef,out}){
 repo=fs.realpathSync(repo);toolRoot=fs.realpathSync(toolRoot);out=path.resolve(out);
 assert(!fs.existsSync(out),'Fresh comparison output required');
 const rel=path.relative(toolRoot,out);assert(rel.startsWith('..'+path.sep)||path.isAbsolute(rel),'Output must be outside tool source');
 const source=B.manifest(toolRoot),identity=B.observerIdentity(toolRoot),baseline=snapshot(repo,baselineRef),candidate=snapshot(repo,candidateRef);
 const expected=Object.keys(source).filter(gameFile).sort();
 for(const [id,snap]of [['baseline',baseline],['candidate',candidate]])assert.deepEqual(Object.keys(snap.blobs),expected,id+' Game path set differs; explicitly review added/removed modules before extending this constructor');
 for(const file of expected)assert.equal(source[file],candidate.blobs[file].normalizedSha256,'Current Game must match pinned candidate: '+file);
 fs.mkdirSync(out);
 const arms=[];
 for(const [id,snap]of [['baseline',baseline],['candidate',candidate]]){
  const copied=copySimulationInputs(toolRoot,path.join(out,id));
  for(const [file,blob]of Object.entries(snap.blobs))fs.writeFileSync(path.join(copied.out,file),blob.bytes);
  const manifest=B.manifest(copied.out);
  for(const [file,digest]of Object.entries(source))assert.equal(manifest[file],gameFile(file)?snap.blobs[file].normalizedSha256:digest,'Exact Game/common tools: '+id+' '+file);
  for(const [file,blob]of Object.entries(snap.blobs))assert.equal(sha(fs.readFileSync(path.join(copied.out,file))),blob.sha256,'Exact Git bytes: '+id+' '+file);
  // Includes dependency closure beyond the panel's policy/harness manifest.
  for(const file of copied.files)if(!gameFile(file))assert.equal(sha(fs.readFileSync(path.join(copied.out,file))),sha(fs.readFileSync(path.join(toolRoot,file))),'Exact common tool/dependency bytes: '+file);
  assert.deepEqual(B.observerIdentity(copied.out),identity,'Identical current observer and contract');
  arms.push({id,root:copied.out,gameCommit:snap.commit,sourceDigest:sha(JSON.stringify(manifest)),manifest,
   simulationFiles:Object.fromEntries([...copied.files].sort().map(file=>[file,normalized(fs.readFileSync(path.join(copied.out,file)))])),
   files:copied.files.size,bytes:[...copied.files].reduce((n,f)=>n+fs.statSync(path.join(copied.out,f)).size,0),
   unresolvedStaticImports:copied.unresolved,gitGame:Object.fromEntries(Object.entries(snap.blobs).map(([file,{bytes,...meta}])=>[file,meta]))});
 }
 assert.deepEqual(B.manifest(toolRoot),source,'Source unchanged during preparation');
 assert.deepEqual(B.observerIdentity(toolRoot),identity,'Observer unchanged during preparation');
 const differences=Object.keys(source).filter(f=>arms[0].manifest[f]!==arms[1].manifest[f]);assert(differences.every(gameFile),'Only Game inputs may differ');
 const receipt={schemaVersion:1,scope:'Exact immutable Git Game/data/entry on identical current harness/policies/observer/contract; no CSS/assets/native browser certification',
  constructor:{file:'scripts/prepare-game-comparison.js',sha256:normalized(fs.readFileSync(__filename)),copyInputsSha256:normalized(fs.readFileSync(path.join(__dirname,'prepare-calendar-ablation.js')))},
  toolRoot,toolHead:B.sourceHead(toolRoot),observer:identity,toolManifest:source,arms,differences};
 fs.writeFileSync(path.join(out,'comparison-inputs.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});return receipt;
}
module.exports={snapshot,prepare};
if(require.main===module)try{
 assert.equal(process.argv.length,7,'Usage: node scripts/prepare-game-comparison.js <git-repo> <baseline-full-sha> <candidate-full-sha> <tool-root> <fresh-external-directory>');
 const [repo,baselineRef,candidateRef,toolRoot,out]=process.argv.slice(2),r=prepare({repo,baselineRef,candidateRef,toolRoot,out});
 console.log(JSON.stringify({out,observer:r.observer,differences:r.differences,arms:r.arms.map(({id,gameCommit,root,files,bytes,unresolvedStaticImports})=>({id,gameCommit,root,files,bytes,unresolvedStaticImports}))},null,2));
}catch(e){console.error(e.stack);process.exitCode=1;}
