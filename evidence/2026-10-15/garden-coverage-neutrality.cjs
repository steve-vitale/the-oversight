const fs=require('fs'),cp=require('child_process'),z=require('zlib'),c=require('crypto'),path=require('path');
const arg=(k,d)=>{let i=process.argv.indexOf('--'+k);return i<0?d:process.argv[i+1]};
const sha=b=>c.createHash('sha256').update(b).digest('hex');
const fingerprint=()=>{
 const observer=Object.fromEntries(['scripts/godpath/deed-screen.js','scripts/lib/garden-coverage.js'].map(f=>[f,sha(fs.readFileSync(f))])),runtime={};
 const add=f=>runtime[f.replace(/\\/g,'/')]=sha(fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'));
 function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(/\.(js|json)$/.test(f))add(f);}}
 walk('src');walk('scripts/policies');for(const f of ['index.html','scripts/sim-harness.js','scripts/sweep-compare.js'])add(f);
 return {observer,runtime};
};
(async()=>{const sources=fingerprint(),rows=[],policies=arg('policies','capable,maker,merchant,caregiver').split(','),seeds=arg('seeds','7').split(',').map(Number);
if(!seeds.length||seeds.some(s=>!Number.isSafeInteger(s))||new Set(seeds).size!==seeds.length||new Set(policies).size!==policies.length)throw Error('Invalid or duplicate cases');
for(const policy of policies)for(const seed of seeds){
 const run=observe=>new Promise((resolve,reject)=>{let out='',err='';const p=cp.spawn(process.execPath,['scripts/godpath/deed-screen.js','--child','--policy',policy,'--seed',String(seed),'--observe',String(observe)],{cwd:process.cwd()});p.stdout.on('data',b=>out+=b);p.stderr.on('data',b=>err+=b);p.on('error',reject);p.on('close',code=>{try{if(code)throw Error(err);resolve(JSON.parse(out.split('@@DEED@@').pop()));}catch(e){reject(e);}});});
 const [before,after]=await Promise.all([run(0),run(1)]);const match=JSON.stringify(before.row)===JSON.stringify(after.row)&&before.stateHash===after.stateHash;rows.push({policy,seed,match,before,after});console.log(policy,seed,match,'closed',after.gardenCoverage.days.filter(d=>d.closed).length,'errors',after.gardenCoverage.errors.length);if(!match||after.gardenCoverage.errors.length||after.warnings.length||before.warnings.length)throw Error('Invalid neutrality proof');
}if(JSON.stringify(sources)!==JSON.stringify(fingerprint()))throw Error('Observer sources changed');fs.writeFileSync(arg('out','.git/garden-coverage-final-proof.json.gz'),z.gzipSync(JSON.stringify({sourceHashes:sources.observer,runtimeSources:sources.runtime,sourcesStable:true,rows})));})().catch(e=>{console.error(e);process.exitCode=1});
