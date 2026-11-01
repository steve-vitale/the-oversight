'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),cp=require('child_process'),F=require('../phone-frame-proof-update');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const recipe='evidence/2026-10-23/strike-demand-phone-r1.cjs',fixture='evidence/2026-10-23/strike-counter-prepared-save-r3.json.gz',helper='evidence/2026-10-22/combat-turn-network-r1.cjs';
const inputs=[recipe,fixture,helper,'scripts/prepare-combat-trace-save.js','evidence/2026-10-23/calendar-merchant99-combat-r1-trace.json.gz'];
function screenshotMatches(root,s){const file=path.resolve(root,s.path||''),rel=path.relative(root,file);return rel.startsWith('evidence'+path.sep)&&!path.isAbsolute(rel)&&fs.existsSync(file)&&sha(fs.readFileSync(file))===s.sha256;}
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/strike-phone-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const bytes=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:sha(bytes),data:JSON.parse(z.gunzipSync(bytes))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);},expected=F.expectedInputs(root);
 const original=JSON.parse(z.gunzipSync(fs.readFileSync(path.join(root,fixture)))).payload.run.tbfight;
 const bodies=f=>f?.fighters?.map(a=>({key:a.key,hp:a.hp,maxHp:a.maxHp}));
 function legal(f){const used=new Set();for(const a of f?.fighters||[]){if(!a.alive||a.fled)continue;const n=a.battleSize||a.mdef?.size||1;for(let dy=0;dy<n;dy++)for(let dx=0;dx<n;dx++){const x=a.mx+dx,y=a.my+dy,key=x+','+y;if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=f.gridSize||y>=f.gridSize||used.has(key))return false;used.add(key);}}return true;}
 check(pointer.schemaVersion===1&&same(receipts.map(r=>r.data.height),[736,844]),'Both actual phone heights required');
 const tracked=new Set(cp.execFileSync('git',['ls-files','-z','--',...inputs],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean));
 check(inputs.every(f=>tracked.has(f)&&fs.existsSync(path.join(root,f))),'Replay, native fixture, original capture and generator must be included in Git');
 for(const r of receipts){const d=r.data,p=d.height+': ',find=label=>d.trace?.find(t=>t.label===label);
  check(r.sha256===r.actualHash,p+'retained receipt bytes');check(d.errors?.length===0,p+'no browser errors');
  for(const[file,hash]of Object.entries(expected))check(d.sourceWitness?.networkInputs?.[file]===hash,p+'stale runtime '+file);
  for(const file of [recipe,helper,fixture])check(d.sourceWitness?.recipeInputs?.[file]===F.normalized(path.join(root,file)),p+'actual executed input '+file);
  check(d.fixture===fixture&&d.fixtureSha256===sha(fs.readFileSync(path.join(root,fixture))),p+'actual binary native fixture bytes');
  check(d.sourceWitness?.trustedTouches?.length>=d.touches?.length&&d.sourceWitness?.trustedTouches?.every(t=>t.trusted),p+'trusted native touches');
  check(d.met===4&&d.waits===9&&d.touches?.filter(t=>t.includes('data-sigw4arg="still"')).length===4&&d.touches?.filter(t=>t==='#c-wait').length===9,p+'all four paid public counter sequences');
  const initial=find('prepared actual day200 arena Continue'),pending=find('native pagehide and pending-cost Continue'),end=find('actual arena resolves'),loaded=find('native full final Continue');
  if(!initial||!pending||!end||!loaded){check(false,p+'complete native journey required');continue;}
  check(initial.fight?.fighters?.filter(m=>m.kind==='monster').length===4&&initial.entities?.filter(e=>e.key.startsWith('creature:')).length===4&&initial.gardenMarkers===0,p+'all four visible bodies on the actual separate arena');
  check(same(bodies(initial.fight),bodies(original))&&legal(initial.fight),p+'original complete bodies, unchanged HP and legal placement');
  check(d.bodyPixels?.length===4&&d.bodyPixels.every(x=>Array.isArray(x.rgba)&&Math.min(...x.rgba.slice(0,3))>65&&Math.abs(x.rgba[0]-x.rgba[1])<10&&x.rgba[2]>=x.rgba[0]-3),p+'giant bodies really paint beyond their anchors');
  check(d.screenshots?.length===3&&d.screenshots.every(s=>screenshotMatches(root,s)),p+'actual retained pixel evidence');
  const seen=n=>new Set((d.trace||[]).flatMap(t=>(t.fight?.fighters||[]).filter(m=>m.sigStrike?.still?.remaining===n).map(m=>m.key))).size;
  check(seen(2)===4&&seen(1)===4,p+'every rat retains both unpaid still turns');
  check(same(pending.state,d.checkpoints?.find(c=>c.label==='pending')?.payload)&&same(loaded.state,d.checkpoints?.find(c=>c.label==='final')?.payload),p+'both whole committed Continue payloads');
  check(!end.fight&&!loaded.fight&&!loaded.state.arenaContest&&!loaded.state.activeContest&&end.state.telemetry.filter(e=>e.type==='contest_end').at(-1)?.outcome==='won',p+'real nonviolent contest settlement persists');
  check(d.trace.every(t=>t.scroll?.[0]===0&&t.scroll?.[1]===0&&t.scroll?.[2]<=d.height+1),p+'single outer phone frame');
 }
 return{ok:errors.length===0,errors};
}
function update(root,files){if(files.length!==2)throw Error('Two actual receipt paths required');const receipts=files.map(file=>{const rel=path.relative(root,path.resolve(file)).replace(/\\/g,'/');if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Retain receipts inside this repository');const bytes=fs.readFileSync(path.join(root,rel));return{path:rel,sha256:sha(bytes),actualHash:sha(bytes),data:JSON.parse(z.gunzipSync(bytes))};}),pointer={schemaVersion:1,scope:'Prepared actual four-rat encounter at both phone heights: visible full bodies, paid stillness, two native full Continues and real nonviolent contest win. Not natural whole mobile campaigns, physical devices or general balance clearance.',receipts:receipts.map(({path,sha256})=>({path,sha256}))},result=verify(root,{pointer,receipts});if(!result.ok)throw Error(result.errors.join('\n'));fs.writeFileSync(path.join(root,'scripts/strike-phone-proof.json'),JSON.stringify(pointer,null,2)+'\n');return{receipts:receipts.length};}
module.exports={read,verify,update};
if(require.main===module)try{console.log(update(path.resolve(__dirname,'../..'),process.argv.slice(2)));}catch(e){console.error(e.stack);process.exitCode=1;}
