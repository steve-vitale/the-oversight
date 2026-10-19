#!/usr/bin/env node
'use strict';
// Compare passive browser cache receipts to a frozen runtime, including JSON.
// Usage: node scripts/verify-installed-cache.js <receipt.json> <runtime-root> [served-build]
const fs=require('fs'),path=require('path'),crypto=require('crypto'),B=require('./build-offline-assets');
function verify(receipt,root,servedBuild){
 root=path.resolve(root);
 const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
 const build=servedBuild||version,errors=[],inputs=receipt.inputs||{},seen=new Set();
 const stamped=new Set(['index.html','sw.js','version.json','src/js/build.js','manifest.json']);
 for(const [key,value]of Object.entries(inputs)){
  const url=new URL(key,'https://receipt.invalid/'),rel=decodeURIComponent(url.pathname).slice(1)||'index.html',file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)){errors.push('Escaping cache key: '+key);continue;}
  if(!fs.existsSync(file)){errors.push('Unexpected file: '+rel);continue;}
  let text=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
  if(stamped.has(rel))text=text.split(version).join(build);
  const expected=crypto.createHash('sha256').update(text).digest('hex');
  if(value.normalizedSha256!==expected)errors.push('Stale bytes: '+key);
  if(rel.startsWith('src/data/')&&url.searchParams.get('v')!==build)errors.push('Unversioned or wrong-build data: '+key);
  seen.add(url.pathname+url.search);
 }
 for(const key of B.collect(root).assets){
  if(!/\.(js|json|css|html)(?:\?|$)/.test(key)&&key!=='./')continue;
  const url=new URL(key.split(version).join(build),'https://receipt.invalid/');
  if(!seen.has(url.pathname+url.search))errors.push('Missing cached input: '+url.pathname+url.search);
 }
 if(receipt.build&&receipt.build!==build)errors.push('Unexpected running build');
 if(receipt.controller!==true)errors.push('No controlling service worker');
 if(receipt.dataRequests){
  if(!receipt.dataRequests.length)errors.push('No boot data requests observed');
  for(const key of receipt.dataRequests)if(new URL(key,'https://receipt.invalid/').searchParams.get('v')!==build)errors.push('Wrong boot data request: '+key);
 }
 return {ok:errors.length===0,build,inputs:Object.keys(inputs).length,errors};
}
module.exports={verify};
if(require.main===module){
 try{const [file,root,build]=process.argv.slice(2);if(!file||!root)throw Error('Expected receipt.json runtime-root [served-build]');
 const result=verify(JSON.parse(fs.readFileSync(file,'utf8')),root,build);console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
 }catch(e){console.error(e.message);process.exitCode=1;}
}
