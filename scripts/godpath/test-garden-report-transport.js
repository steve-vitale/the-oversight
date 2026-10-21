'use strict';
const assert=require('assert/strict'),crypto=require('crypto'),K=require('./lib'),R=require('../garden-longplay-audit'),gear=require('../gear-usage-audit');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
(async()=>{
 const G=await K.load({seed:7002});K.newRun(G);const plain=gear.gameplayHash(G.state),item=G.state.scholar.inventory[0];assert(item);
 item.gardenShares={ordinary:1};G.state.village.gardenIntakeTotals={version:1,prepared:true};const withData=JSON.stringify(G.state);
 assert.equal(R.comparableHash(G.state),plain);assert.equal(JSON.stringify(G.state),withData);
 item.harvestShares={untouched:.5};assert.notEqual(R.comparableHash(G.state),plain,'existing producer metadata must not be stripped');delete item.harvestShares;
 G.state.scholar.kcal--;assert.notEqual(R.comparableHash(G.state),plain,'a changed survival value must remain visible');
 const sources={fixture:'Jörg – Cháo 🌱'},job={policy:'capable',seed:1},payload={sourceDigest:sha(JSON.stringify(sources)),row:{...job},stateHash:plain,comparableStateHash:plain,unicode:'Jörg – Cháo 🌱'};
 const encoded=R.frame(payload),read=R.parseFrame('normal output\n@@GARDEN@@'+encoded+'\n');assert.equal(read.unicode,payload.unicode);assert(R.validateResult({job,...read},job,sources));
 const bytes='normal output\n@@GARDEN@@'+encoded+'\n',program='const b=Buffer.from('+JSON.stringify(bytes)+');let i=0;function step(){if(i<b.length){process.stdout.write(b.subarray(i,i+1));i++;setImmediate(step)}}step();';
 const transported=await R.readChild(['-e',program],process.cwd());assert.deepEqual(transported,read,'actual child byte writes retain multibyte UTF-8');
 assert.throws(()=>R.parseFrame('@@GARDEN@@'+encoded.replace('Cháo','Ch�o')),/payload changed/);
 assert.throws(()=>R.parseFrame('@@GARDEN@@'+encoded+'@@GARDEN@@'+encoded),/duplicated/);
 const damaged={job,...read,unicode:'transport damage'};assert.throws(()=>R.validateResult(damaged,job,sources),/payload/,'a rehashed outer cache cannot certify a damaged child payload');
 assert.throws(()=>R.validateResult({job,...read},{...job,seed:2},sources),/identity/);
 console.log('garden report transport: actual UTF-8 child, semantic payload/cache identity and exact declared state exclusions pass');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
