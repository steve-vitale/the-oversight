'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),gameplay=s=>{const x=structuredClone(s);delete x.saveSeq;return x;};
function read(root){const pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/held-answer-phone-proof.json')));return{pointer,receipts:pointer.receipts.map(r=>{const b=fs.readFileSync(path.join(root,r.path));return{...r,actualHash:hash(b),data:JSON.parse(z.gunzipSync(b))};})};}
function verify(root,{pointer,receipts}=read(root)){
 const fixtureFile=path.join(root,'evidence/2026-10-22/held-answer-observed-r1.json.gz'),bytes=fs.readFileSync(fixtureFile),f=JSON.parse(z.gunzipSync(bytes)),expected=F.expectedInputs(root),errors=[],check=(c,m)=>{if(!c)errors.push(m);};
 check(pointer.schemaVersion===1&&same(receipts.map(r=>r.data.height),[736,844]),'Two actual phone heights');
 for(const r of receipts){const d=r.data,p=d.height+': ',get=l=>d.trace.find(t=>t.label===l),before=get('prepared actual interruption'),answer=get('native answer to interruption'),loaded=get('native committed Continue');
  check(r.actualHash===r.sha256,p+'retained bytes');check(d.mode==='after'&&d.errors.length===0,p+'native outcome');check(d.touches.length>6&&d.touches.every(t=>t.trusted),p+'trusted touches');
  for(const[file,h]of Object.entries(expected))check(d.responses[file]===h,p+'stale runtime '+file);
  check(d.recipeSha256===F.normalized(path.join(root,'evidence/2026-10-22/held-answer-phone-r1.cjs'))&&d.fixtureSha256===hash(bytes),p+'recipe and original actual snapshot');
  check(before.conversation.generic?.kind==='reason'&&before.conversation.held.some(h=>h.text===f.expectedSubstantive),p+'real recorded interrupted speech');
  check(!answer.conversation.generic&&!answer.conversation.held.some(h=>h.genericFollowup)&&answer.conversation.held.some(h=>h.text===f.expectedSubstantive),p+'answer preserves substantive speech without stale reminder');
  check(answer.state.scholar.kcal===before.state.scholar.kcal&&answer.state.scholar.dayTicks===before.state.scholar.dayTicks,p+'existing free generic answer');
  check(d.delivered===1&&loaded.state.village.conv[f.vid].transcript.filter(t=>t.who==='them'&&t.text===f.expectedSubstantive).length===1,p+'actual saved substantive delivery exactly once');
  for(const t of d.trace.filter(t=>/^before continuation /.test(t.label))){const n=t.label.split(' ').at(-1),after=get('native continuation '+n);if(!after)continue;const oldLength=t.state.village.conv[f.vid].transcript.length,added=after.state.village.conv[f.vid].transcript.slice(oldLength),next=t.conversation.held[0];check(added.find(x=>x.who==='you')?.text===t.conversation.words.goon,p+'exact offered words');check(t.state.scholar.kcal===after.state.scholar.kcal&&t.state.scholar.dayTicks===after.state.scholar.dayTicks,p+'free held delivery');if(next?.winddown)check(t.conversation.words.goon==='(let them finish)',p+'goodbye role');else if(next?.text&&!/["“]/.test(next.text))check(t.conversation.words.goon==='(give them a moment)',p+'narration role');}
  for(let i=0;i<d.trace.length;i++)if(d.trace[i].label==='before free page')check(same(gameplay(d.trace[i].state),gameplay(d.trace[i+1].state)),p+'free paging');
  check(same(gameplay(loaded.state),gameplay(d.checkpoint)),p+'native committed Continue');check(d.trace.filter(t=>t.state).every(t=>t.scroll[0]===0&&t.scroll[1]===0&&t.scroll[2]<=d.height+1),p+'one main phone frame');
 }return{ok:errors.length===0,errors};
}
function update(root,revision){if(!/^[a-z0-9-]+$/i.test(revision||''))throw Error('Fresh retained revision required');const receipts=[736,844].map(h=>{const file=`evidence/2026-10-22/held-answer-phone-${h}-${revision}.json.gz`,b=fs.readFileSync(path.join(root,file)),sha256=hash(b);return{path:file,sha256,actualHash:sha256,data:JSON.parse(z.gunzipSync(b))};}),pointer={schemaVersion:1,scope:'Prepared active snapshot from actual phone play; native answer, retained substantive delivery, role-honest exact words, free continuation/pages and committed pagehide Continue. Not natural Talk/payment or complete campaign.',receipts:receipts.map(({path,sha256})=>({path,sha256}))},v=verify(root,{pointer,receipts});if(!v.ok)throw Error(v.errors.join('\n'));fs.writeFileSync(path.join(root,'scripts/held-answer-phone-proof.json'),JSON.stringify(pointer,null,2)+'\n');return{receipts:receipts.length};}
module.exports={read,verify,update};

if(require.main===module)try{console.log(JSON.stringify(update(path.resolve(__dirname,'../..'),process.argv[2])));}catch(e){console.error(e.stack);process.exitCode=1;}
