// Rebuild a fresh, runnable measured root without changing the active checkout.
// node evidence/2026-10-15/miser-intent-reconstruct.cjs original|early|haggle <new-directory>
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto');
const arm=process.argv[2],out=process.argv[3]&&path.resolve(process.argv[3]);
if(!['original','early','haggle'].includes(arm)||!out)throw Error('Specify original|early|haggle and a fresh output directory');
if(fs.existsSync(out))throw Error('Refusing to overwrite an existing output directory');
const dir=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const bundle=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(dir,'miser-intent-'+(arm==='original'?'policy':arm)+'-sources.json.gz'))));
const base='ff7ca50c';const commit=cp.execFileSync('git',['rev-parse',base+'^{commit}'],{encoding:'utf8'}).trim();
if(commit!==bundle.policyCommit)throw Error('Wrong policy commit; fetch origin codex/resume-claude');
const archive=cp.execFileSync('git',['archive',commit,'src','scripts','index.html','.gitattributes'],{maxBuffer:256*1024*1024});
fs.mkdirSync(out,{recursive:true});const extract=cp.spawnSync('tar',['-xf','-','-C',out],{input:archive});if(extract.status!==0)throw Error('Archive extraction failed: '+extract.stderr);
if(arm!=='original')for(const[n,r]of Object.entries(bundle.replacements)){
  const target=path.resolve(out,n);if(!target.startsWith(out+path.sep)||sha(r.content)!==r.sha256)throw Error('Invalid replacement '+n);
  fs.writeFileSync(target,r.content);
}
const actual=require(path.join(out,'scripts/balance-panel')).manifest(out);
if(JSON.stringify(actual)!==JSON.stringify(bundle.afterManifest))throw Error('Reconstructed source manifest mismatch');
console.log(JSON.stringify({arm,out,commit,sourceFiles:Object.keys(actual).length,verified:true}));
