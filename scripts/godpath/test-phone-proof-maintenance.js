'use strict';
const cp=require('child_process'),fs=require('fs'),path=require('path'),K=require('./lib');
const T=K.reporter('Phone proof maintenance safety'),root=K.ROOT,script=path.join(root,'scripts/refresh-phone-proofs.js');
const revision='safety-'+process.pid,out='evidence/2026-10-26/phone-maintenance-safety-'+process.pid,absolute=path.join(root,out);
if(fs.existsSync(absolute))throw Error('Fresh test path required');
const call=args=>cp.spawnSync(process.execPath,[script,...args],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
const base=['--families','reply','--revision',revision];
let r=call([...base,'--out',out,'--plan']);
T.ok('read-only planning starts no browser and creates no output',r.status===0&&!fs.existsSync(absolute));
const plan=JSON.parse(r.stdout);
T.ok('plan keeps explicit checkpoint/selected-family limits',plan.families.join(',')==='reply'&&plan.scope.includes('Not all release proofs'));
r=call([...base,'--out','../phone-proof-outside-'+process.pid,'--run']);
T.ok('a write outside evidence is rejected before any browser',r.status===1&&r.stderr.includes('Output must be a new child'));
r=call([...base,'--out','evidence/2026-10-26','--run']);
T.ok('an existing directory cannot be adopted or replaced',r.status===1&&r.stderr.includes('Fresh output/revision required'));
r=call(['--families','reply','--revision','../escape','--out',out,'--run']);
T.ok('an escaping revision cannot create a canonical artifact',r.status===1&&r.stderr.includes('simple fresh --revision')&&!fs.existsSync(absolute));
r=call(['--families','reply,reply','--revision',revision,'--out',out,'--run']);
T.ok('duplicate families cannot execute two writers over the same outputs',r.status===1&&r.stderr.includes('Unknown or duplicate family')&&!fs.existsSync(absolute));
r=call(['--families','activation,namespace,legacy,pack','--revision',revision,'--out',out,'--plan']);
const abilityPlan=JSON.parse(r.stdout);
T.ok('ability plans require the owned preview and inventory keeps its real separate recipe',r.status===0&&abilityPlan.steps.filter(s=>s.preview).map(s=>s.id).join(',')==='activation-play,namespace-play,legacy-play'&&!abilityPlan.steps.find(s=>s.id==='pack-play').preview&&!fs.existsSync(absolute));
r=call(['--families','arrival,carry,haven,loot','--revision',revision,'--out',out,'--plan']);
const fieldPlan=JSON.parse(r.stdout),lootUpdate=fieldPlan.steps.find(s=>s.id==='loot-update');
T.ok('field plan keeps all six room/body witnesses and six owned-preview plays',r.status===0&&fieldPlan.steps.filter(s=>s.preview).length===6&&lootUpdate.args.length===6&&['underfoot','approach','corpse-scenes'].every(k=>lootUpdate.args.filter(f=>f.includes(k)).length===2)&&!fs.existsSync(absolute));
r=call(['--families','camp,visits,food,held','--revision',revision,'--out',out,'--plan']);
const readers=JSON.parse(r.stdout),heldRetain=readers.steps.find(s=>s.id==='held-retain');
T.ok('reader plans keep original separate servers, canonical food cases and two held witnesses',r.status===0&&!readers.steps.some(s=>s.preview)&&readers.steps.find(s=>s.id==='food-play').args[1].endsWith('haven-food-native-'+revision)&&heldRetain.targets.length===2&&heldRetain.schemaVersion===1&&!fs.existsSync(absolute));
r=call(['--families','curious','--revision',revision,'--out',out,'--plan']);
const curious=JSON.parse(r.stdout);
T.ok('curiosity maintenance uses the actual two-height recipe, strict updater and rejecting gate',r.status===0&&curious.steps.map(s=>s.id).join(',')==='curious-play,curious-update,curious-gate'&&curious.steps[0].script.endsWith('curious-phone-r10.cjs')&&curious.steps[1].script==='scripts/lib/curious-phone-proof.js'&&!fs.existsSync(absolute));
async function outputRace(){
 const os=require('os'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-phone-output-'));
 const probe=path.join(temporary,'probe.cjs'),target=path.join(temporary,'job');
 fs.writeFileSync(probe,"const fs=require('fs'),R=require(process.argv[2]);try{R.createJobDirectory(process.argv[3]);}catch(e){if(e.code==='EEXIST'){process.exit(17);}throw e;}fs.appendFileSync(process.argv[3]+'/owner',String(process.pid)+'\\n');process.stdout.write(String(process.pid));");
 try{
  const results=await Promise.all([0,1].map(()=>new Promise((resolve,reject)=>{
   const child=cp.spawn(process.execPath,[probe,script,target],{stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
   child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr}));
  })));
  T.ok('two real processes cannot both claim the same new job',results.map(r=>r.code).sort((a,b)=>a-b).join(',')==='0,17',JSON.stringify(results));
  const winner=results.find(r=>r.code===0),owner=fs.readFileSync(path.join(target,'owner'),'utf8').trim();
  T.ok('the losing writer cannot replace or append to the owner payload',!!winner&&owner===winner.stdout.trim());
 }finally{
  const actual=fs.realpathSync(temporary),parent=fs.realpathSync(os.tmpdir());
  if(path.dirname(actual)!==parent||!path.basename(actual).startsWith('oversight-phone-output-')||fs.lstatSync(actual).isSymbolicLink())throw Error('Unsafe test cleanup target');
  fs.rmSync(actual,{recursive:true,force:false});
 }
}
async function previewOwnership(){
 const os=require('os'),http=require('http'),R=require(script),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-phone-preview-')),servers=[];
 const request=(origin,url)=>new Promise((resolve,reject)=>{
  const u=new URL(origin);const q=http.get({hostname:u.hostname,port:u.port,path:url,agent:false},res=>{const chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>resolve({status:res.statusCode,bytes:Buffer.concat(chunks),headers:res.headers}));});q.on('error',reject);
 });
 try{
  const other=Buffer.from('{"owner":"second-owned-preview"}');fs.writeFileSync(path.join(temporary,'version.json'),other);
  const a=await R.createPreview(root);servers.push(a);const b=await R.createPreview(temporary);servers.push(b);
  T.ok('two previews own distinct ephemeral loopback listeners',a.origin!==b.origin&&new URL(a.origin).hostname==='127.0.0.1'&&new URL(b.origin).hostname==='127.0.0.1');
  const [first,second]=await Promise.all([request(a.origin,'/version.json'),request(b.origin,'/version.json')]);
  T.ok('each preview serves its own exact root bytes without a cache',first.status===200&&second.status===200&&first.bytes.equals(fs.readFileSync(path.join(root,'version.json')))&&second.bytes.equals(other)&&first.headers['cache-control']==='no-store');
  T.ok('encoded traversal cannot read beyond the owned root',(await request(a.origin,'/%2e%2e%2foutside.txt')).status===403);
  await Promise.all(servers.map(s=>s.close()));
  const refused=await request(a.origin,'/version.json').then(()=>({code:'still_serving'}),e=>({code:e.code}));
  T.ok('closed preview stops accepting new connections',!a.server.listening&&!b.server.listening&&refused.code==='ECONNREFUSED',JSON.stringify(refused));
 }finally{
  const closed=await Promise.allSettled(servers.map(s=>s.close()));
  const actual=fs.realpathSync(temporary),parent=fs.realpathSync(os.tmpdir());
  if(path.dirname(actual)!==parent||!path.basename(actual).startsWith('oversight-phone-preview-')||fs.lstatSync(actual).isSymbolicLink())throw Error('Unsafe preview test cleanup target');
  fs.rmSync(actual,{recursive:true,force:false});
  const failed=closed.find(r=>r.status==='rejected');if(failed)throw failed.reason;
 }
}
outputRace().then(previewOwnership).then(()=>T.done()).catch(e=>{console.error(e.stack);process.exitCode=1;});
