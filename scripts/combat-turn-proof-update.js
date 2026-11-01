#!/usr/bin/env node
'use strict';
// Explicit maintenance after actual browser replays; never relabel old inputs.
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),P=require('./lib/combat-turn-proof');
function update(root,revision){
 if(!/^[a-zA-Z0-9-]+$/.test(revision||''))throw Error('A retained replay revision is required');
 const prefix='evidence/2026-10-22/',receipts=[];
 for(const h of [736,844]){
  for(const scene of ['ordinary-solo','ordinary-party','deer-party'])receipts.push({kind:'play',path:prefix+`combat-turn-play-${scene}-${h}-${revision}.json.gz`});
  for(const phase of ['announced','resolved'])receipts.push({kind:'resume',path:prefix+`combat-turn-resume-${h}-${phase}-${revision}.json.gz`});
  receipts.push({kind:'reader',path:prefix+`combat-turn-reader-${h}-${revision}.json`});
 }
 const rows=receipts.map(r=>{const bytes=fs.readFileSync(path.join(root,r.path)),compressed=r.path.endsWith('.gz');r.sha256=crypto.createHash('sha256').update(compressed?bytes:bytes.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');return{...r,actualHash:r.sha256,data:JSON.parse(compressed?z.gunzipSync(bytes):bytes)};});
 const pointer={schemaVersion:1,receiptHashNormalization:'lf-v1',scope:'Prepared real-touch Chromium phone fights, native reload/Continue and asynchronous reader; not physical-device or all-enemy clearance.',receipts},result=P.verify(root,{pointer,receipts:rows});
 if(!result.ok)throw Error(result.errors.join('\n'));
 const destination=path.join(root,'scripts/combat-turn-proof.json');fs.writeFileSync(destination+'.tmp',JSON.stringify(pointer,null,2)+'\n');fs.renameSync(destination+'.tmp',destination);return{receipts:rows.length};
}
module.exports={update};
if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'..'),process.argv[2])));}catch(e){console.error(e.message);process.exitCode=1;}
