'use strict';
// Run from an Oversight checkout containing the pinned baseline commit.
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),assert=require('assert'),crypto=require('crypto');
const arm=process.argv[2],out=path.resolve(process.argv[3]||'');
if(!['before','after'].includes(arm)||!process.argv[3]||fs.existsSync(out))throw Error('Expected before|after and a fresh destination');
const bundle=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'god-support-sources.json.gz'))));
fs.mkdirSync(out,{recursive:true});const tar=path.join(out,'baseline.tar');
cp.execFileSync('git',['archive','--format=tar','--output='+tar,bundle.baseCommit]);cp.execFileSync('tar',['-xf',tar,'-C',out]);fs.unlinkSync(tar);
for(const [name,arms] of Object.entries(bundle.files)){const r=arms[arm],b=Buffer.from(r.base64,'base64');assert.strictEqual(crypto.createHash('sha256').update(b).digest('hex'),r.sha256);fs.writeFileSync(path.join(out,name),b);}
fs.copyFileSync(path.join(__dirname,'../../scripts/godpath/test-god-support-player.js'),path.join(out,'scripts/godpath/test-god-support-player.js'));
console.log(out);
