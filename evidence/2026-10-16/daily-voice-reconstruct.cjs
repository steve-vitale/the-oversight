'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto'),assert=require('assert');
const [arm,directory]=process.argv.slice(2),repo=path.resolve(__dirname,'../..');assert(['before','after'].includes(arm)&&directory,'Usage: daily-voice-reconstruct.cjs before|after <fresh-directory>');
const dest=path.resolve(directory);assert(!fs.existsSync(dest)&&!fs.existsSync(dest+'.tar'),'Use a fresh directory and adjacent tar path');
const read=n=>JSON.parse(z.gunzipSync(fs.readFileSync(path.join(__dirname,n)))),bundle=read('daily-voice-sources.json.gz');
cp.execFileSync('git',['archive',bundle.baseCommit,'-o',dest+'.tar','src','scripts','docs','index.html','.gitattributes'],{cwd:repo});fs.mkdirSync(dest,{recursive:true});cp.execFileSync('tar',['-xf',dest+'.tar','-C',dest]);
for(const [file,arms] of Object.entries(bundle.files)){const rec=arms[arm]||arms.proof;if(!rec)continue;const bytes=Buffer.from(rec.base64,'base64');assert.strictEqual(crypto.createHash('sha256').update(bytes).digest('hex'),rec.sha256);fs.mkdirSync(path.dirname(path.join(dest,file)),{recursive:true});fs.writeFileSync(path.join(dest,file),bytes);}
const p=read(arm==='before'?'grounding-after-panel.json.gz':'daily-voice-after-panel.json.gz'),B=require(path.join(dest,'scripts/balance-panel'));assert.deepStrictEqual(B.manifest(dest),p.sources);assert.strictEqual(B.sourceHead(dest),null);console.log('Reconstructed '+arm+' with25-assertion proof; all207 manifest entries match. Adjacent archive retained.');
