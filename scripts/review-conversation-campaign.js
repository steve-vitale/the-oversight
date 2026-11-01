'use strict';
// Review retained calls only; no Game import, extra query or prose-quality grade.
const fs=require('fs'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const [input,out]=process.argv.slice(2);if(!input||!out)throw Error('input.json.gz fresh-output-prefix');for(const ext of ['.json','.md'])assert(!fs.existsSync(out+ext),'Fresh output');
const bytes=fs.readFileSync(input),raw=JSON.parse(z.gunzipSync(bytes)),selected=new Map();
for(const r of raw.results.filter(r=>r.job.trace===1)){const key=r.job.policy+':'+r.seed,old=selected.get(key);if(!old||r.cap>old.cap)selected.set(key,r);}
const summary={producer:{file:__filename,sha256:crypto.createHash('sha256').update(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n')).digest('hex')},source:input,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),scope:'Existing headless call/returned-menu evidence only. Longest observed case per policy/seed; short prefixes are not counted twice. Not browser visibility, natural nearby availability, whole population prose quality or calibrated balance.',stable:raw.stable,neutral:raw.neutral,prefixes:raw.prefixes,worlds:[],calls:{},favorKinds:{},selectedWithActionInCachedMenu:[],blockedExamples:[],settledHelpReplies:[],returnedLinesWithoutTranscript:[],originalErrors:[],wordMismatches:[],unknownSelectedWords:0,recordingErrors:[],postEndingTurns:0,selfTurns:0};
const turns=[];
for(const r of selected.values()){
 assert(r.workProbe?.coverage,'Conversation view required');const probe=r.workProbe;
 summary.worlds.push({seed:r.seed,policy:r.policy,cap:r.cap,terminal:r.terminal,counts:probe.coverage.counts,missingMethods:probe.coverage.missingMethods});summary.recordingErrors.push(...probe.errors);
 for(const row of probe.rows){if(row.error)summary.originalErrors.push({seed:r.seed,seq:row.seq,method:row.method,vid:row.vid,error:row.error});summary.calls[row.method]=(summary.calls[row.method]||0)+1;
  const f=row.after?.favor||row.before?.favor,kind=f?.kind||row.args?.[0]?.kind;
  if(kind){const d=summary.favorKinds[kind]||(summary.favorKinds[kind]={helperMenus:0,helperActionReady:0,returnedActionMenus:0,favorIds:new Set(),ledgerStates:{}});if(f?.id){d.favorIds.add(r.seed+':'+f.id);const s=d.ledgerStates[f.state]||(d.ledgerStates[f.state]=new Set());s.add(r.seed+':'+f.id);}
   if(row.method==='convoFavorActionMenu'){d.helperMenus++;if(row.result?.some(c=>c.id==='dlg:favor_action'))d.helperActionReady++;}
   if(row.result?.choices?.some(c=>c.id==='dlg:favor_action'))d.returnedActionMenus++;
  }
  if(row.method!=='convoTurn'||row.args[0]==='menu:more')continue;turns.push({run:r,row});
  if(!row.anchorLost&&row.result?.line&&row.after?.conversation?.active&&!row.added.some(e=>e.who==='them'))summary.returnedLinesWithoutTranscript.push({seed:r.seed,seq:row.seq,day:row.before.day,vid:row.vid,id:row.args[0],line:row.result.line,choices:row.result.choices});
  if(row.before?.engineOver)summary.postEndingTurns++;if(row.vid===row.before?.bearer)summary.selfTurns++;
  const offered=row.before?.conversation?.offeredReplies?.[row.args[0]],said=row.added.find(e=>e.who==='you');
  if(row.anchorLost||!offered||!said)summary.unknownSelectedWords++;else if(offered!==said.text)summary.wordMismatches.push({seed:r.seed,day:row.before.day,vid:row.vid,choice:row.args[0],offered,said:said.text});
  if(row.before?.conversation?.offeredReplies?.['dlg:favor_action'])summary.selectedWithActionInCachedMenu.push({seed:r.seed,day:row.before.day,vid:row.vid,kind,selected:row.args[0],actionLabel:row.before.conversation.offeredReplies['dlg:favor_action']});
  if(row.args[0]==='dlg:help'&&row.before?.conversation?.want?.id==='ask_favor'&&['declined','broken','moot','acknowledged'].includes(row.before?.favor?.state))summary.settledHelpReplies.push({seed:r.seed,day:row.before.day,vid:row.vid,storedFavorKind:row.before.favor.kind,state:row.before.favor.state,line:row.result?.line});
  if(row.args[0]==='dlg:favor_requirements')summary.blockedExamples.push({seed:r.seed,day:row.before.day,vid:row.vid,kind,line:row.result?.line});
 }
}
for(const d of Object.values(summary.favorKinds)){d.favorIds=d.favorIds.size;d.ledgerStates=Object.fromEntries(Object.entries(d.ledgerStates).map(([k,s])=>[k,s.size]));}
// Include each observed seed/life-stage/favor kind, then evenly spread to50.
const examples=[],used=new Set(),groups=new Set(),key=x=>x.run.seed+':'+x.row.seq;
for(const t of turns){const day=t.row.before?.day||0,kind=['ask_favor','repay'].includes(t.row.before?.conversation?.want?.id)?t.row.before?.favor?.kind:null;if(!kind)continue;const group=t.run.seed+':'+(day<30?'early':day<120?'middle':'late')+':'+kind;if(!groups.has(group)){groups.add(group);used.add(key(t));examples.push(t);}}
const slots=Math.max(0,50-examples.length);for(let i=0;i<slots;i++){const t=turns[Math.floor(i*(turns.length-1)/Math.max(1,slots-1))];if(t&&!used.has(key(t))){used.add(key(t));examples.push(t);}}
for(const t of turns){if(examples.length>=50)break;if(!used.has(key(t))){used.add(key(t));examples.push(t);}}
summary.sampledExchanges=examples.length;
fs.writeFileSync(out+'.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
const lines=['# Actual campaign dialogue sample','',summary.scope,'','Do not treat helper readiness as a final offered menu. The stored favor ledger can describe an old closed request while the active want concerns something else. Helper readiness is not a final offered menu. Ledger fulfillment is observed status, not attribution to this dispatcher. Missing calls remain unknown.',''];
for(const {run:r,row:t} of examples){lines.push(`## seed${r.seed}, day${t.before.day}, ${t.vid}, want=${t.before.conversation?.want?.id||'unknown'}, thread=${t.before.conversation?.thread||'unknown'}, storedFavor=${t.before.favor?.kind||'none'}/${t.before.favor?.state||'none'}`,'',t.before.conversation?.visible?.text||'(no prior NPC beat retained)','',...Object.entries(t.before.conversation?.offeredReplies||{}).map(([id,label])=>`- ${id}: ${label}`),'',`Selected: ${t.args[0]}`,'',...t.added.filter(e=>e.who==='them').map(e=>e.text),'');}
fs.writeFileSync(out+'.md',lines.join('\n'),{flag:'wx'});console.log(JSON.stringify({worlds:summary.worlds,calls:summary.calls,favorKinds:summary.favorKinds,wordMismatches:summary.wordMismatches.length,unknownSelectedWords:summary.unknownSelectedWords,sampledExchanges:examples.length}));
