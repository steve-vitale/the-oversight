'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),util=require('util'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),same=util.isDeepStrictEqual,gameplay=s=>{const v=structuredClone(s);delete v.saveSeq;return v;};
const recipe='evidence/2026-10-26/promise-speech-phone-r1.cjs',fixture='evidence/2026-10-26/promise-speech-fixtures-r1.json';
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/promise-speech-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const b=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(c,m)=>{if(!c)errors.push(m);},expected=F.expectedInputs(root),input=JSON.parse(fs.readFileSync(path.join(root,fixture))),keys=new Set();
 check(pointer.schemaVersion===1&&receipts.length===4,'Four real role cases required');
 for(const r of receipts){const d=r.data,k=d.height+':'+d.kind,s=input.scenes.find(s=>s.kind===d.kind),get=n=>d.trace.find(t=>t.name===n);check(!keys.has(k),'Unique '+k);keys.add(k);check([736,844].includes(d.height)&&!!s,k+' declared case');if(!s)continue;
  check(r.actualHash===r.sha256&&same(d.scene,s)&&d.scope===input.scope,k+' actual receipt/fixture identity');check(same(d.errors,[]),k+' no browser errors');
  const expectedImages=[d.height+'-'+d.kind+'-'+(d.kind==='blocked'?'refusal':'amends')+'.png',d.height+'-'+d.kind+'-continued.png'].map(f=>path.posix.dirname(r.path)+'/'+f).sort(),images=Array.isArray(d.screenshots)?d.screenshots:[];
  check(same(images.map(i=>i.path).sort(),expectedImages),k+' actual scene images');
  for(const image of images){const file=path.resolve(root,image.path),rel=path.relative(path.join(root,'evidence'),file);check(!rel.startsWith('..')&&!path.isAbsolute(rel)&&fs.existsSync(file)&&hash(fs.readFileSync(file))===image.sha256,k+' image bytes');}
  for(const [f,h]of Object.entries(expected))check(d.sourceWitness?.networkInputs?.[f]===h,k+' loaded source '+f);
  for(const f of[recipe,fixture,'evidence/2026-10-22/combat-turn-network-r1.cjs','scripts/refresh-phone-proofs.js','scripts/phone-frame-proof-update.js','scripts/balance-panel.js'])check(d.sourceWitness?.recipeInputs?.[f]===F.normalized(path.join(root,f)),k+' executed input '+f);
  check(d.sourceWitness?.trustedTouches?.length>=6&&d.sourceWitness.trustedTouches.every(t=>t.trusted),k+' actual touch');
  check(d.controls?.length>=6&&d.controls.every(b=>b.x>=0&&b.y>=0&&b.x+b.width<=391&&b.y+b.height<=d.height&&b.width>=43.5&&b.height>=43.5),k+' visible44px controls');
  check(d.trace.every(t=>t.scroll[0]===0&&t.scroll[1]===0&&t.scroll[2]<=d.height+1&&t.rects.length>=4&&t.rects.every(b=>b.y>=0&&b.bottom<=d.height+1)),k+' one phone frame');
  for(let i=0;i<d.trace.length;i++)if(d.trace[i].name==='before reply page')check(d.trace[i+1]?.name==='after reply page'&&same(gameplay(d.trace[i].state),gameplay(d.trace[i+1].state)),k+' free reply paging');
  const final=get('before pagehide'),loaded=get('native Continue');check(final&&loaded&&same(gameplay(loaded.state),gameplay(d.committed)),k+' whole committed Continue');check(loaded?.state.village.promises[s.vid]?.kept===final?.state.village.promises[s.vid]?.kept,k+' promise stays settled or open');
  if(d.kind==='blocked'){
   const before=get('prepared active legacy ask'),after=get('actual offered blocked commitment');check(before&&after&&same(before.state.village.promises[s.vid],after.state.village.promises[s.vid])&&!after.state.village.promises[s.vid].kept,k+' real refusal without a duplicate promise');
   check(d.pages.some(t=>t.includes(s.short)&&!t.includes(s.task)),k+' actually rendered recipient words');check(d.controls.some(b=>b.q.includes('data-cid="dlg:commit"')),k+' actual offered commitment');
  }else{
   const before=get('actual expired memory and person card'),after=get('actual amends');check(before?.word.word==='promise_broken'&&before.word.mem.favorId===s.favorId,k+' loaded exact broken favor identity');
   check(after?.word.word==='amends'&&after.state.village.promises[s.vid].kept==='broken'&&loaded?.word.word==='amends',k+' amends never becomes completion and survives Continue');
   const added=after?.log.slice(before?.log.length||0)||[];check(added.some(l=>l.includes(s.bearerAbout)&&!l.includes(s.task)&&!l.includes(s.short)),k+' actual accepted bearer speech');check(d.controls.some(b=>b.q==='[data-act="amends"]'),k+' actual amends control');
  }
 }
 for(const h of[736,844])for(const kind of['blocked','amends'])check(keys.has(h+':'+kind),'Missing '+h+kind);
 return{ok:errors.length===0,errors};
}
function update(root,directory){const absolute=fs.realpathSync(path.resolve(root,directory)),rel=path.relative(fs.realpathSync(root),absolute);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('Retain actual receipts inside the repository');
 const rows=[736,844].flatMap(h=>['blocked','amends'].map(k=>{const file=path.join(rel,h+'-'+k+'.json.gz').replace(/\\/g,'/'),bytes=fs.readFileSync(path.join(root,file)),sha256=hash(bytes);return{path:file,sha256,actualHash:sha256,data:JSON.parse(z.gunzipSync(bytes))};})),pointer={schemaVersion:1,scope:'Prepared real-touch blocked commitment and actual expired-memory apology, exact role text, saved identity and whole Continue at both phone heights. Not natural Talk/payment, universal dialogue, physical-device or release clearance.',receipts:rows.map(({path,sha256})=>({path,sha256}))},v=verify(root,{pointer,receipts:rows});if(!v.ok)throw Error(v.errors.join('\n'));fs.writeFileSync(path.join(root,'scripts/promise-speech-proof.json'),JSON.stringify(pointer,null,2)+'\n');return{receipts:rows.length};}
module.exports={read,verify,update};
if(require.main===module)try{if(!process.argv[2])throw Error('Fresh actual receipt directory required');console.log(JSON.stringify(update(path.resolve(__dirname,'../..'),process.argv[2])));}catch(e){console.error(e.stack);process.exitCode=1;}
