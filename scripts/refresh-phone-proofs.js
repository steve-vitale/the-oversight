#!/usr/bin/env node
'use strict';
// Run existing real browser recipes and their real validators. Never rewrite
// receipt identities, waive failures, or infer a release from a completed plan.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),z=require('zlib'),http=require('http');
const F=require('./phone-frame-proof-update'),B=require('./balance-panel');
const ROOT=path.resolve(__dirname,'..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const rel=(root,file)=>path.relative(root,file).replace(/\\/g,'/');
const inside=(base,file)=>{const p=path.relative(base,file);return !!p&&!p.startsWith('..'+path.sep)&&p!=='..'&&!path.isAbsolute(p);};
const scopes={
 frame:'16-stage touch frames at both heights; conversation/paging/reply, native Deer Continue, zero-move Wait/escape.',
 table:'Both original simulated Table checkpoints at both heights, actual finales/Records/tombstones and mid-act Continue. Not current natural acquisition or day660 survival.',
 gear:'Six prepared weapon/armor/stack conservation and native Continue journeys. Not natural gear acquisition.',
 caretaker:'Six prepared growing/hungry/used caretaker journeys and native Continue. Not natural productivity or all-policy viability.',
 reply:'Two independently sampled natural-checkpoint dialogue openers, actual answers/paging/exact speech/Continue. Not matched RNG or universal dialogue quality.',
 activation:'Ten prepared phone previews/casts, real food/action bills, cancellation and whole Continue. Not natural acquisition.',
 namespace:'Two prepared real crew Wait/cancellation/Continue journeys without a bare Game global. Not tactical bond-growth or campaign clearance.',
 legacy:'Fourteen prepared treatment/refusal/legacy-action phone journeys, actual payments and whole Continue. Not natural acquisition.',
 pack:'Two unmodified natural-checkpoint deep Pack tests, actual cautious-test outcomes/payments and whole Continue. Not matched RNG or balance clearance.',
 camp:'Four prepared cold/warm camp approaches with earned sightings, physical Visit range, paid talk and whole Continue. Not natural travel or build discovery.',
 visits:'Six prepared village/shared-ground offers, free browsing, paid/refused deals and pending/paid whole Continue. Not natural trust or pacifist viability.',
 food:'Eight natural-checkpoint/prepared food-record readers with honest empty/zero/missing history and free full Continue. Not natural famine or balance clearance.',
 held:'Two prepared actual interrupted-conversation snapshots, native answer, exact substantive delivery/role-honest words/free paging and committed Continue. Not natural Talk/payment or campaign clearance.',
 promise:'Four prepared legacy active-ask/expired-debt phone journeys: visible recipient refusal, accepted bearer apology, saved exact identity and whole Continue. Not natural discovery, universal dialogue or physical-device clearance.',
 formal:'Eight prepared known-goal formal help journeys: kept/broken/amends/deflected histories, actual offered replies,10kcal Talk, final committed action/log and whole Continue. Not natural discovery or campaign clearance.',
 curious:'Two prepared curiosity journeys: exact unanswered question, native Leave/reload/resume/answer, visible farewell, free Done and whole Continue. Not natural20-day survival or universal dialogue quality.',
 arrival:'Unedited day602 checkpoint, seven free arrival beats, paid departure and immediate/fresh-context Continue at both heights. Not current day602 viability.',
 carry:'Two prepared heavy pickup, burden quote, paid walk, Stop and native Continue journeys. Not natural gear acquisition or balance clearance.',
 haven:'Two prepared real rest/warmth/exit/lodge/management/Continue journeys. Not natural construction or physical-device clearance.',
 loot:'Six prepared underfoot/approach/indoor/outdoor/legacy ownership journeys, refusal, Leave, paid approach, swipes and Continue. No grid shortcuts; not natural acquisition.'
};
const previews={
 activation:{stem:'activation-preview',fixture:'activation-preview-fixtures-r2.json',gate:'activation-browser',suffixes:['.json.gz','-card.png','-paid.png','-failed.png','-failed.txt']},
 namespace:{stem:'game-namespace',fixture:'game-namespace-fixture-r1.json',gate:'game-namespace',suffixes:['.json.gz','-after-wait.png','-failed.json','-failed.png']},
 legacy:{stem:'legacy-activation',fixture:'legacy-activation-fixtures-r2.json',gate:'legacy-activation',suffixes:['.json.gz','-card.png','-result.png','-failed.png','-failed.txt','-failed.json.gz']}
};
function parse(args){
 const o={run:false,clean:false,families:Object.keys(scopes)};
 for(let i=0;i<args.length;i++){
  const a=args[i];
  if(a==='--run')o.run=true;
  else if(a==='--plan')o.plan=true;
  else if(a==='--clean-scratch')o.clean=true;
  else if(a==='--list')o.list=true;
  else if(a==='--help'||a==='-h')o.help=true;
  else if(['--families','--revision','--out'].includes(a)){
   const v=args[++i];if(!v||v.startsWith('--'))throw Error('Missing value for '+a);
   if(a==='--families')o.families=v.split(',');else o[a.slice(2)]=v;
  }else throw Error('Unknown option: '+a);
 }
 if(o.run&&o.plan)throw Error('Choose --run or --plan');
 if(o.help||o.list)return o;
 if(!o.revision||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(o.revision))throw Error('A simple fresh --revision is required');
 if(!o.out)throw Error('--out evidence/<date>/<fresh-directory> is required');
 if(!o.families.length||new Set(o.families).size!==o.families.length||o.families.some(f=>!Object.hasOwn(scopes,f)))throw Error('Unknown or duplicate family');
 return o;
}
function ownedOutput(root,name){
 const evidence=fs.realpathSync(path.join(root,'evidence')),out=path.resolve(root,name);
 if(!inside(evidence,out))throw Error('Output must be a new child of this repository evidence directory');
 let ancestor=out;while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);
 const actual=fs.realpathSync(ancestor);
 if(actual!==evidence&&!inside(evidence,actual))throw Error('Output parent escapes evidence through a link');
 return out;
}
function makePlan(root,o){
 const out=ownedOutput(root,o.out),revision=o.revision,steps=[],fresh=[out],inputs=new Set([
  'scripts/refresh-phone-proofs.js','scripts/phone-frame-proof-update.js','scripts/build-offline-assets.js',
  'scripts/balance-panel.js','scripts/godpath/lib.js','sw.js','version.json','manifest.json'
 ]);
 const add=(id,script,args=[],log,preview=false)=>{inputs.add(script);steps.push({id,script,args,log:log||id+'.log',...(preview?{preview:true}:{})});};
 const operation=(id,op,data)=>steps.push({id,operation:op,...data});
 const native=(name)=>'evidence/2026-10-22/'+name;
 for(const family of o.families){
  if(family==='frame'){
   const recipe='evidence/2026-10-21/mobile-opening-frame-r1.cjs';
   Object.keys(F.replayInputs(root)).forEach(f=>inputs.add(f));
   const files=[736,844].map(h=>'evidence/2026-10-21/mobile-opening-frame-'+h+'-'+revision+'.json');
   fresh.push(...files.map(f=>path.join(root,f)));
   for(const h of[736,844])for(const kind of['chat','deer','exit'])fresh.push(path.join(root,'evidence/2026-10-21/mobile-opening-frame-'+revision+'-'+kind+'-final-'+h+'.png'));
   add('frame-play',recipe,[revision]);add('frame-update','scripts/phone-frame-proof-update.js',files);
   add('frame-gate','scripts/godpath/test-phone-frame-proof.js');
  }else if(family==='table'){
   inputs.add(native('natural-phone-driver-r3.cjs'));
   const receipts=[];
   for(const profile of['late','nongod']){
    const recipe=native(profile==='late'?'late-table-phone-r3.cjs':'nongod-table-phone-r1.cjs');
    const fixture=native(profile+'-table-phone-checkpoint-r1.json.gz'),scratch=[];
    inputs.add(fixture);
    for(const h of[736,844]){
     const output=path.join(out,'table-'+profile+'-'+h);scratch.push(output);
     add('table-'+profile+'-'+h,recipe,[String(h),fixture,output],rel(out,output)+'.log');
     receipts.push(native(profile+'-table-native-'+revision+'/'+h+'.json.gz'));
    }
    fresh.push(path.join(root,native(profile+'-table-native-'+revision)));
    add('table-'+profile+'-retain',native('late-table-retain-r1.cjs'),[...scratch,revision,profile,'retain-only','brotli']);
   }
   add('table-update','scripts/lib/late-table-phone-proof.js',receipts);
   add('table-gate','scripts/godpath/test-late-table-phone-proof.js');
   if(o.clean)operation('table-clean','table-clean',{revision});
  }else if(family==='gear'||family==='caretaker'){
   const folder=path.join(out,family),base='evidence/2026-10-23/'+family+'-phone';
   inputs.add(base+'-fixtures-r1.json');inputs.add(native('combat-turn-network-r1.cjs'));
   add(family+'-play',base+'-r1.cjs',[root,folder,'after']);
   add(family+'-update','scripts/lib/'+family+'-phone-proof.js',[folder]);
   add(family+'-gate','scripts/godpath/test-'+family+'-phone-proof.js');
  }else if(['reply','pack','held'].includes(family)){
   const pack=family==='pack',held=family==='held',prefix=pack?'pack-reader':held?'held-answer-phone':'reply-phone',recipe=pack?'pack-reader-phone-r1.cjs':held?'held-answer-phone-r1.cjs':'reply-phone-r1.cjs';
   const verifier='scripts/lib/'+prefix+'-proof.js';
   inputs.add(native(pack?'natural-phone-discovery-r1-checkpoint.json.gz':held?'held-answer-observed-r1.json.gz':'reply-phone-checkpoint-r1.json.gz'));
   if(held)inputs.add(native('natural-phone-851-r3-checkpoint.json.gz'));
   const folder=path.join(out,family),targets=[736,844].map(h=>native(prefix+'-'+h+'-'+revision+'.json.gz'));
   fresh.push(...targets.map(f=>path.join(root,f)));
   add(family+'-play',native(recipe),[root,folder,'after']);
   inputs.add(verifier);
   operation(family+'-retain','pair-retain',{folder,targets,verifier,schemaVersion:pack?2:1});
   add(family+'-update',verifier,[revision]);
   add(family+'-gate','scripts/godpath/test-'+prefix+'-proof.js');
  }else if(family==='curious'){
   const folder=path.join(out,'curious');inputs.add('evidence/2026-10-26/curious-phone-fixture-r4.json');inputs.add(native('combat-turn-network-r1.cjs'));
   add('curious-play','evidence/2026-10-26/curious-phone-r10.cjs',[folder]);
   add('curious-update','scripts/lib/curious-phone-proof.js',[folder]);
   add('curious-gate','scripts/godpath/test-curious-phone-proof.js');
  }else if(family==='formal'){
   const folder=path.join(out,'formal');inputs.add('evidence/2026-10-26/formal-help-fixtures-r1.json');inputs.add(native('combat-turn-network-r1.cjs'));
   add('formal-play','evidence/2026-10-26/formal-help-phone-r1.cjs',[folder]);
   add('formal-update','scripts/lib/formal-help-phone-proof.js',[folder]);
   add('formal-gate','scripts/godpath/test-formal-help-phone-proof.js');
  }else if(family==='promise'){
   const folder=path.join(out,'promise');inputs.add('evidence/2026-10-26/promise-speech-fixtures-r1.json');inputs.add(native('combat-turn-network-r1.cjs'));
   add('promise-play','evidence/2026-10-26/promise-speech-phone-r1.cjs',[folder]);
   add('promise-update','scripts/lib/promise-speech-proof.js',[folder]);
   add('promise-gate','scripts/godpath/test-promise-speech-phone-proof.js');
  }else if(['camp','visits','food'].includes(family)){
   const food=family==='food',camp=family==='camp',stem=food?'haven-food':camp?'camp-sighting':'village-visit';
   const recipe=food?native('haven-food-phone-r1.cjs'):'evidence/2026-10-23/'+(camp?'camp-sighting-phone-r2.cjs':'commons-phone-r4.cjs');
   const fixture=food?native('natural-phone-d64-r2-checkpoint.json.gz'):'evidence/2026-10-23/'+(camp?'camp-sighting-fixtures-r1.json':'commons-phone-fixture-r3.json');
   inputs.add(fixture);if(!food)inputs.add(native('combat-turn-network-r1.cjs'));
   const folder=food?path.join(root,native('haven-food-native-'+revision)):path.join(out,family);fresh.push(folder);
   add(family+'-play',recipe,food?[root,folder,'after']:[folder]);
   add(family+'-update','scripts/lib/'+stem+'-proof.js',[food?revision:folder]);
   add(family+'-gate','scripts/godpath/test-'+(food?'haven-food-browser':stem)+'-proof.js');
  }else if(['arrival','carry','haven','loot'].includes(family)){
   const field=name=>'evidence/2026-10-21/'+name;
   const recipes=family==='loot'?[
    {id:'underfoot',script:'search-phone-r1.cjs',args:['underfoot',revision],stem:'search-underfoot-',receipt:'phone-',images:['action','refused','continued']},
    {id:'approach',script:'search-phone-r1.cjs',args:['approach',revision],stem:'search-approach-',receipt:'phone-',images:['action','refused','chooser','continued']},
    {id:'scene',script:'corpse-scenes-phone-r1.cjs',args:[revision],stem:'corpse-scenes-',receipt:'phone-',images:['indoor','outdoor','continued']}
   ]:[{
    id:family,script:family==='arrival'?'carry-arrival-r1.cjs':family==='carry'?'carry-phone-r1.cjs':'lodge-mobile-r1.cjs',
    args:family==='arrival'?['--rev',revision]:[revision],
    stem:family==='arrival'?'carry-arrival-':family==='carry'?'carry-phone-':'lodge-',
    receipt:family==='arrival'?'mobile-':'',
    images:family==='arrival'?['mobile-loaded','mobile-exit']:family==='carry'?['over-limit','packed','inventory','continued']:['inside','hearth','outside','management-outside','occupied','pantry']
   }];
   const fixtures=family==='arrival'?['carry-arrival-fixture-r1.json']:family==='carry'?['carry-phone-fixture-r1.json']:family==='haven'?['haven-visual-fixture-r1.json']:['search-fixture-underfoot-r2.json','search-fixture-approach-r2.json','corpse-scenes-fixture-r1.json','corpse-scenes-fixture-r1.cjs'];
   fixtures.forEach(f=>inputs.add(field(f)));
   const receipts=[];
   for(const r of recipes){
    for(const h of[736,844]){
     const prefix=field(r.stem),receipt=prefix+r.receipt+h+'-'+revision+'.json';receipts.push(receipt);
     fresh.push(path.join(root,receipt));
     for(const kind of r.images)fresh.push(path.join(root,prefix+kind+'-'+h+'-'+revision+'.png'));
     for(const suffix of['-failure.json','-failure.png','-failed.png'])fresh.push(path.join(root,prefix+r.receipt+h+'-'+revision+suffix));
     if(family==='arrival')for(let beat=1;beat<=7;beat++)fresh.push(path.join(root,prefix+'arrival-'+h+'-'+beat+'-'+revision+'.png'));
    }
    add(family+'-'+r.id+'-play',field(r.script),r.args,undefined,true);
   }
   add(family+'-update','scripts/'+family+'-phone-proof-update.js',receipts);
   add(family+'-gate','scripts/godpath/test-'+family+'-phone-proof.js');
  }else if(Object.hasOwn(previews,family)){
   const p=previews[family],fixture=native(p.fixture),cases=family==='namespace'?['']:JSON.parse(fs.readFileSync(path.join(root,fixture),'utf8')).cases.map(c=>c.name);
   if(!cases.length||new Set(cases).size!==cases.length||(family!=='namespace'&&cases.some(name=>typeof name!=='string'||!/^[a-z0-9-]+$/i.test(name))))throw Error('Unique safe prepared case IDs required: '+family);
   inputs.add(fixture);inputs.add(native('combat-turn-network-r1.cjs'));
   for(const h of[736,844])for(const name of cases){
    const prefix=native(p.stem+(family==='namespace'?'-phone':'')+'-'+h+(name?'-'+name:'')+'-'+revision);
    fresh.push(...p.suffixes.map(s=>path.join(root,prefix+s)));
   }
   add(family+'-play',native(p.stem+'-phone-r1.cjs'),[revision,...(family==='namespace'?['after']:[])],undefined,true);
   add(family+'-update','scripts/lib/'+p.stem+'-proof.js',[revision]);
   add(family+'-gate','scripts/godpath/test-'+p.gate+'-proof.js');
  }
 }
 for(const f of inputs)if(!fs.statSync(path.join(root,f),{throwIfNoEntry:false})?.isFile())throw Error('Missing real input: '+f);
 return {schemaVersion:1,root,out,revision,families:o.families,scopes:Object.fromEntries(o.families.map(f=>[f,scopes[f]])),steps,fresh,inputs:[...inputs].sort(),limit:'Selected source-bound Chromium phone recipes only. Not all release proofs, physical devices, installed lifecycle, broad balance or publication.'};
}
function snapshot(plan){
 return {browser:F.expectedInputs(plan.root),simulation:B.manifest(plan.root),
  workflow:Object.fromEntries(plan.inputs.map(f=>[f,sha(fs.readFileSync(path.join(plan.root,f)))]))};
}
function fresh(plan){for(const p of plan.fresh)if(fs.existsSync(p))throw Error('Fresh output/revision required; existing artifact: '+rel(plan.root,p));}
function createJobDirectory(out){
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.mkdirSync(out); // Atomic final creation: another writer cannot adopt this job.
}
function write(file,value,options={}){
 const io=options.fs||fs,platform=options.platform||process.platform;
 const pause=options.pause||(ms=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms));
 io.writeFileSync(file+'.tmp',JSON.stringify(value,null,2)+'\n');
 for(let attempt=0;;attempt++){
  try{io.renameSync(file+'.tmp',file);return;}
  catch(e){
   // Windows can briefly deny replacement while a reader/scanner owns the
   // destination. Keep the old complete report and retry the SAME rename;
   // never fall back to truncating a report or silently accepting failure.
   if(platform!=='win32'||!['EPERM','EBUSY'].includes(e.code)||attempt>=5)throw e;
   const delay=10*2**attempt;
   console.warn('[phone-proof] report replacement retry',e.code,attempt+1,delay+'ms');
   pause(delay);
  }
 }
}
function retainPair(plan,step){
 const P=require(path.join(plan.root,step.verifier)),rows=[736,844].map((height,i)=>{
  const bytes=fs.readFileSync(path.join(step.folder,height+'.json.gz')),hash=sha(bytes);
  return {path:step.targets[i],sha256:hash,actualHash:hash,data:JSON.parse(z.gunzipSync(bytes)),bytes};
 });
 const pointer={schemaVersion:step.schemaVersion,receipts:rows.map(({path,sha256})=>({path,sha256}))},result=P.verify(plan.root,{pointer,receipts:rows});
 if(!result.ok)throw Error(result.errors.join('\n'));
 for(const row of rows){const p=path.join(plan.root,row.path);fs.writeFileSync(p,row.bytes,{flag:'wx'});if(!fs.readFileSync(p).equals(row.bytes))throw Error('Retained bytes differ');}
 return {receipts:rows.length,rule:'Copies are byte-exact; original attempts, traces and screenshots remain in the original job directory.'};
}
async function createPreview(root){
 const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.wav':'audio/wav','.mp3':'audio/mpeg'};
 const server=http.createServer((req,res)=>{
  try{
   const url=new URL(req.url,'http://127.0.0.1'),file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
   if(!inside(root,file)){res.writeHead(403).end();return;}
   fs.readFile(file,(error,bytes)=>{if(error){res.writeHead(error.code==='ENOENT'?404:500).end('Unavailable');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);});
  }catch(e){res.writeHead(400).end('Invalid request');}
 });
 let runtimeError;
 await new Promise((resolve,reject)=>{const fail=e=>reject(e);server.once('error',fail);server.listen(0,'127.0.0.1',()=>{server.removeListener('error',fail);server.on('error',e=>{runtimeError=e;});resolve();});});
 const origin='http://127.0.0.1:'+server.address().port;let closing;
 return {server,origin,get error(){return runtimeError;},close(){if(!closing)closing=new Promise((resolve,reject)=>{server.closeAllConnections();server.close(error=>error?reject(error):resolve());});return closing;}};
}
function cleanTable(plan){
 const targets=[];
 function size(file){const s=fs.lstatSync(file);if(s.isSymbolicLink())throw Error('Scratch link refused');return s.isDirectory()?fs.readdirSync(file).reduce((n,f)=>n+size(path.join(file,f)),0):s.size;}
 for(const profile of['late','nongod'])for(const h of[736,844]){
  const target=path.resolve(plan.out,'table-'+profile+'-'+h);
  if(!inside(plan.out,target)||!inside(fs.realpathSync(plan.out),fs.realpathSync(target)))throw Error('Scratch escaped the owned job');
  const archive=path.join(plan.root,'evidence/2026-10-22/'+profile+'-table-native-'+plan.revision);
  const raw=fs.readFileSync(path.join(target,'play/trace.json'));
  if(!z.brotliDecompressSync(fs.readFileSync(path.join(archive,h+'-trace.json.br'))).equals(raw))throw Error('Cold trace differs');
  for(const f of fs.readdirSync(path.join(target,'play')).filter(f=>f.endsWith('.png')))if(!fs.readFileSync(path.join(target,'play',f)).equals(fs.readFileSync(path.join(archive,String(h),f))))throw Error('Screenshot differs: '+f);
  if(!fs.readFileSync(path.join(target,'native-driver.cjs')).equals(fs.readFileSync(path.join(archive,String(h),'native-driver.cjs'))))throw Error('Executed driver differs');
  if(!z.gunzipSync(fs.readFileSync(path.join(archive,String(h),'process.log.gz'))).equals(fs.readFileSync(path.join(target,'process.log'))))throw Error('Process log differs');
  targets.push({path:target,bytes:size(target),traceSha256:sha(raw)});
 }
 for(const t of targets)fs.rmSync(t.path,{recursive:true,force:false});
 return {targets,logicalBytesRemoved:targets.reduce((n,t)=>n+t.bytes,0),rule:'Only four new closed scratch directories; full byte-exact archives, images, driver and logs remain.'};
}
async function execute(plan){
 fresh(plan);require.resolve('playwright'); // Fail before creating output when the configured runtime is missing.
 const initial=snapshot(plan),identity=JSON.stringify(initial),report={schemaVersion:1,status:'running',started:new Date().toISOString(),node:process.version,platform:process.platform,sourceDigest:sha(identity),steps:[],scope:plan.limit};
 createJobDirectory(plan.out);write(path.join(plan.out,'plan.json'),{...plan,sources:initial});const file=path.join(plan.out,'report.json');write(file,report);
 let stopped=false,preview;
 const stop=()=>{stopped=true;report.status='stop_requested';write(file,report);process.stderr.write('Stop requested; preserving the active recipe until it closes normally. No further step will start.\n');};
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
 const stable=()=>{if(preview?.error)throw Error('Owned preview failed: '+preview.error.message);if(JSON.stringify(snapshot(plan))!==identity)throw Error('Declared runtime, simulation or executed recipe inputs changed; retain this attempt and rerun from a fresh source/revision.');};
 const finishSources=()=>{
  try{
   const current=snapshot(plan),text=JSON.stringify(current);report.sourceStable=text===identity;report.finalSourceDigest=sha(text);
   if(!report.sourceStable)write(path.join(plan.out,'source-after.json'),current);
  }catch(e){report.sourceStable=false;report.sourceReadError=e.stack||String(e);}
 };
 try{
  if(plan.steps.some(s=>s.preview)){
   preview=await createPreview(plan.root);
   report.preview={origin:preview.origin,ownerPid:process.pid,started:new Date().toISOString()};write(file,report);
  }
  for(const step of plan.steps){
   if(stopped)break;stable();const row={id:step.id,started:new Date().toISOString(),...(step.script?{script:step.script,args:step.args}:{operation:step.operation})};report.steps.push(row);write(file,report);
   try{
    if(step.operation){
     if(step.operation==='pair-retain')row.result=retainPair(plan,step);
     else if(step.operation==='table-clean')row.result=cleanTable(plan);
     else throw Error('Unknown internal operation: '+step.operation);
    }
    else{
     const log=path.join(plan.out,step.log);if(!inside(plan.out,log))throw Error('Log escaped job');const fd=fs.openSync(log,'wx');
     row.code=await new Promise((resolve,reject)=>{
      const env=step.preview?{...process.env,PHONE_PROOF_ORIGIN:preview.origin}:process.env;
      const child=cp.spawn(process.execPath,[step.script,...step.args],{cwd:plan.root,env,windowsHide:true,stdio:['ignore',fd,fd]});fs.closeSync(fd);row.pid=child.pid;row.log=rel(plan.root,log);write(file,report);process.stdout.write(JSON.stringify({id:step.id,pid:child.pid,log:row.log})+'\n');
      child.on('error',reject);child.on('close',(code,signal)=>{row.signal=signal;resolve(code);});
     });
     if(row.code!==0)throw Error(step.id+' failed; inspect '+row.log+'. Outputs and failed attempts are preserved.');
    }
    stable();row.finished=new Date().toISOString();row.status='complete';write(file,report);
   }catch(e){row.finished=new Date().toISOString();row.status='failed';row.error=e.stack||String(e);throw e;}
  }
  report.status=stopped?'interrupted':preview?'closing-preview':'complete';report.finished=new Date().toISOString();finishSources();
  if(!report.sourceStable)throw Error('Source inputs could not be confirmed at completion');
  write(file,report);
  return report;
 }catch(e){report.status='failed';report.finished=new Date().toISOString();report.error=e.stack||String(e);finishSources();write(file,report);throw e;}
 finally{
  process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);
  if(preview){
   try{await preview.close();report.preview.closed=new Date().toISOString();}
   catch(e){report.status='failed';report.preview.closeError=e.stack||String(e);write(file,report);throw e;}
   finishSources();
   const closingError=preview.error?String(preview.error):!report.sourceStable?'Source inputs changed while closing owned preview':null;
   if(closingError){report.status='failed';report.completionError=closingError;if(preview.error)report.preview.error=String(preview.error);}
   else if(report.status==='closing-preview')report.status='complete';
   report.finished=new Date().toISOString();write(file,report);
   if(closingError)throw Error(closingError);
  }
 }
}
async function main(args){
 const o=parse(args);
 if(o.help){console.log('node scripts/refresh-phone-proofs.js --families '+Object.keys(scopes).join(',')+' --revision <fresh-id> --out evidence/<date>/<fresh-job> [--plan | --run] [--clean-scratch]\nDefault is read-only planning. --list shows coverage. Requires configured Playwright/msedge for --run. Existing outputs are never resumed or replaced.');return;}
 if(o.list){console.log(JSON.stringify(scopes,null,2));return;}
 const plan=makePlan(ROOT,o);
 if(!o.run){console.log(JSON.stringify({out:rel(ROOT,plan.out),revision:plan.revision,families:plan.families,scopes:plan.scopes,steps:plan.steps,sourceDigest:sha(JSON.stringify(snapshot(plan))),scope:plan.limit,action:'plan only; no files or browser changed'},null,2));return;}
 const report=await execute(plan);console.log(JSON.stringify({status:report.status,steps:report.steps.length,sourceStable:report.sourceStable,report:rel(ROOT,path.join(plan.out,'report.json')),scope:report.scope}));if(report.status!=='complete')process.exitCode=130;
}
module.exports={parse,makePlan,snapshot,execute,ownedOutput,createJobDirectory,createPreview,scopes,write};
if(require.main===module)main(process.argv.slice(2)).catch(e=>{console.error(e.stack||e);process.exitCode=1;});
