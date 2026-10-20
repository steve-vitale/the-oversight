#!/usr/bin/env node
'use strict';
// Retain actual displayed lines, paged offers and selected outcomes. This is
// sampling evidence, not a semantic pass/fail oracle or a balance controller.
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i<0?d:process.argv[i+1];};
const root=path.resolve(arg('root',path.join(__dirname,'..'))),seed=Number(arg('seed','7')),days=Number(arg('days','0'));
const clone=x=>JSON.parse(JSON.stringify(x));
async function sample(){
 const H=require(path.join(root,'scripts/sim-harness'));
 return H.quietLog(async()=>{
  const {Game:G}=await H.loadGame({seed,narration:true});await H.setupGame(G);
  let campaign=null;if(days)campaign=await H.runDays(G,require(path.join(root,'scripts/policies/capable')).capable,{days,sampleEvery:30});
  const roster=(G.state.village.roster||[]).filter(id=>id!==G.villagerId&&!G.getPerson(id)?.dead).slice(0,12),conversations=[];
  for(let ni=0;ni<roster.length;ni++){
   const vid=roster[ni],turns=[],opened=G.startConvo(vid),c=G.convoGet(vid);
   if(!opened||!c.active){conversations.push({vid,refused:true});continue;}
   for(let t=0;t<12&&c.active;t++){
    let page=t===0?opened.choices:G.convoChoices(vid);const pages=[clone(page)],all=page.slice();
    const pageCount=c.menuPages||1;
    for(let p=1;p<pageCount;p++){const next=G.convoNextMenu(vid);page=next.choices||[];pages.push(clone(page));for(const ch of page)if(!all.some(x=>x.id===ch.id))all.push(ch);}
    const focus=all.filter(ch=>!['leave','silence','menu:more','subject','dlg:subject'].includes(ch.id));
    const answer=focus.find(x=>/^(ans:|react:|gq:)/.test(x.id)&&!x.id.endsWith('honest_pass'));
    const engagement=focus.find(x=>/^(dlg:help|dlg:details|dlg:commit|dlg:heed|dlg:stay|dlg:comfort|goon)$/.test(x.id));
    const options=ni%3===0?focus.filter(x=>/^(ask:|follow:|dlg:subject)/.test(x.id)):focus;
    let pick=answer||(ni%3===1&&engagement)||options[(ni*7+t*3)%Math.max(1,options.length)]||focus[0]||all.find(x=>x.id==='leave');
    if(!pick)break;
    // Return to the actual offered page before selection; never fabricate a
    // choice or skip engine pagination to exercise a private helper.
    let offered=page;
    for(let p=0;p<pageCount&&!offered.some(x=>x.id===pick.id);p++)offered=G.convoNextMenu(vid).choices||[];
    pick=offered.find(x=>x.id===pick.id);if(!pick)throw Error('Choice vanished during paging');
    const before={thread:c.thread,depth:c.depth,lastBeat:clone(c.lastBeat||null),spokenBeat:clone(c.spokenBeat||null),windingDown:!!c.windingDown,want:c.want?{id:c.want.id,stage:c.want.stage,resolution:c.want.resolution}:null,pendingQ:c.pendingQ?.id,pendingText:c.pendingQ&&(c.pendingQ.q||G.convoQuestionDef(c.pendingQ.id)?.q),genericQ:clone(c.genericQ||null),reactiveQ:clone(c.reactiveQ||null),held:clone(c.heldBeats||[]),choosingSubject:!!c.choosingSubject};
    const visible=c.transcript.filter(x=>x.who==='them').at(-1)?.text,oldLength=c.transcript.length;
    const result=G.convoTurn(vid,pick.id);
    turns.push({turn:t,day:G.state.scholar.day,visible,before,pages,pick:clone(pick),result:result?.line,emitted:clone(c.transcript.slice(oldLength)),ended:!c.active});
   }
   if(c.active)G.endConvo(vid,'left');
   conversations.push({vid,name:G.displayName(vid),temper:G.npcTemper(vid),turns});
  }
  return {seed,requestedIterations:days,actualDay:G.state.scholar.day,campaign:campaign?{endReason:campaign.endReason,days:campaign.days}:null,conversations};
 });
}
if(process.argv.includes('--child'))sample().then(r=>process.stdout.write(JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const out=arg('out');if(!out||fs.existsSync(out+'.json.gz')||fs.existsSync(out+'.md'))throw Error('--out requires a fresh prefix');
 const seeds=arg('seeds','1,7,42,99,1234,2026').split(',').map(Number),stages=arg('stages','0,30,90').split(',').map(Number),jobs=[];
 for(const s of seeds)for(const d of stages)jobs.push([s,d]);
 const rows=[];let at=0;
 async function worker(){while(at<jobs.length){const[s,d]=jobs[at++];const result=await new Promise((resolve,reject)=>{const child=cp.spawn(process.execPath,[__filename,'--child','--root',root,'--seed',String(s),'--days',String(d)],{windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('exit',code=>code?reject(Error(s+'/'+d+' '+stderr.slice(-4000))):resolve(JSON.parse(stdout)));});rows.push(result);console.log('sampled '+s+'/'+d+': '+result.conversations.reduce((n,c)=>n+(c.turns?.length||0),0)+' turns');}}
 Promise.all([worker(),worker(),worker()]).then(()=>{
  rows.sort((a,b)=>a.seed-b.seed||a.requestedIterations-b.requestedIterations);
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n')).digest('hex');
  const report={scope:'Actual shared-harness conversations; remote speakers may be sampled directly. Campaign days are observed, not granted. No semantic quality or late-game coverage inferred from requested iterations.',root,sources:require(path.join(root,'scripts/balance-panel')).manifest(root),sampler:hash(path.relative(root,__filename)),rows};
  fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify(report)),{flag:'wx'});
  const lines=['# Actual conversation sample','',report.scope,''];
  for(const r of rows)for(const c of r.conversations)for(const t of c.turns||[]){lines.push(`## seed${r.seed} iteration${r.requestedIterations} actual day${t.day}: ${c.name}, turn${t.turn}`,'',t.visible||'[no visible line]','',...t.pages.flat().filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).map(x=>`- ${x.id}: ${x.label}`),'',`Selected ${t.pick.id}: ${t.pick.label}`,`NPC: ${t.emitted.filter(x=>x.who==='them').map(x=>x.text).join(' / ')||'[no emitted reply]'}`,'');}
  fs.writeFileSync(out+'.md',lines.join('\n'),{flag:'wx'});console.log(JSON.stringify({worlds:rows.length,conversations:rows.reduce((n,r)=>n+r.conversations.filter(c=>c.turns).length,0),turns:rows.reduce((n,r)=>n+r.conversations.reduce((n,c)=>n+(c.turns?.length||0),0),0)}));
 }).catch(e=>{console.error(e.stack);process.exitCode=1;});
}
