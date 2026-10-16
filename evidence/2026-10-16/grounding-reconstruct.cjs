'use strict';
// A fresh destination only. The pinned base commit must exist locally.
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto'),assert=require('assert');
const [arm,destination]=process.argv.slice(2),repo=path.resolve(__dirname,'../..');
assert(['before','after','prototype','no-meal','no-mantle','no-meal-or-mantle','clock-control','clock-no-meal','clock-no-mantle'].includes(arm)&&destination,'Usage: node grounding-reconstruct.cjs <arm> <fresh-directory>');
const dest=path.resolve(destination);assert(!fs.existsSync(dest)&&!fs.existsSync(dest+'.tar'),'Destination and adjacent archive must be fresh');
const bundle=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'grounding-sources.json.gz'))));
cp.execFileSync('git',['archive',bundle.baseCommit,'-o',dest+'.tar','src','scripts','docs','index.html','.gitattributes'],{cwd:repo});
fs.mkdirSync(dest,{recursive:true});cp.execFileSync('tar',['-xf',dest+'.tar','-C',dest]);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const records=Object.fromEntries(Object.entries(bundle.files).map(([name,arms])=>[name,arms[arm==='before'?'before':'after']]).filter(([,rec])=>rec));
Object.assign(records,bundle.ablations[arm]?.files||{});
for(const [name,rec] of Object.entries(records)){const bytes=Buffer.from(rec.base64,'base64');assert.strictEqual(sha(bytes),rec.sha256);fs.mkdirSync(path.dirname(path.join(dest,name)),{recursive:true});fs.writeFileSync(path.join(dest,name),bytes);}
const panel=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,'grounding-'+arm+'-panel.json.gz'))));
const B=require(path.join(dest,'scripts/balance-panel'));assert.deepStrictEqual(B.manifest(dest),panel.sources);assert.strictEqual(B.sourceHead(dest),null);
console.log('Reconstructed '+arm+'; all '+Object.keys(panel.sources).length+' runtime/policy/harness manifest entries match. Archive retained: '+dest+'.tar');
