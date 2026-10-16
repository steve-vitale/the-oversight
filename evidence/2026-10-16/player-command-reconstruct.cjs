'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),assert=require('assert'),crypto=require('crypto');
const choice=process.argv[2],experimental=['prototype','cursor-only'].includes(choice),arm=experimental?'after':choice,out=path.resolve(process.argv[3]||'');
if(!['before','after','prototype','cursor-only'].includes(choice)||!process.argv[3]||fs.existsSync(out))throw Error('Expected before|after|prototype|cursor-only and a fresh destination');
const bundle=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,experimental?'player-command-'+choice+'-sources.json.gz':'player-command-sources.json.gz'))));
fs.mkdirSync(out,{recursive:true});const tar=path.join(out,'baseline.tar');
cp.execFileSync('git',['archive','--format=tar','--output='+tar,bundle.baseCommit]);cp.execFileSync('tar',['-xf',tar,'-C',out]);fs.unlinkSync(tar);
for(const [name,arms] of Object.entries(bundle.files)){const r=arms[arm],b=Buffer.from(r.base64,'base64');assert.strictEqual(crypto.createHash('sha256').update(b).digest('hex'),r.sha256);fs.writeFileSync(path.join(out,name),b);}
const proofBundle=experimental?JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'player-command-sources.json.gz')))):bundle;
const proof=Buffer.from(proofBundle.proof.base64,'base64');assert.strictEqual(crypto.createHash('sha256').update(proof).digest('hex'),proofBundle.proof.sha256);
fs.writeFileSync(path.join(out,'scripts/godpath/test-player-command-turns.js'),proof);console.log(out);
const panel=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'player-command-'+(experimental?choice:arm)+'-panel.json.gz'))));
for(const [name,h] of Object.entries(panel.sources))assert.strictEqual(crypto.createHash('sha256').update(fs.readFileSync(path.join(out,name),'utf8').replace(/\r\n/g,'\n')).digest('hex'),h,name);
