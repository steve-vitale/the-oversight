'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),cp=require('child_process'),K=require('./lib');
const mode=process.argv[2];
async function child(){
 const read=fs.readFileSync;
 if(mode?.startsWith('removed-'))fs.readFileSync=function(file,...args){let text=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/conversation.js')){
  const before=String(text);let after;
  if(mode==='removed-lifecycle')after=before.replace('L.open=L.open.filter(o=>!closed(o));L.lapsed=L.lapsed.filter(o=>!closed(o));','/* removed actual terminal-favor migration */');
  else after=before.replace("const spoken=this.voiceLinesForBeats?.([this.convoStripAcks(String(line||''))])?.[0];","const spoken=String(line||'');").replace('const memoryLines=this.voiceLinesForBeats(useChunks.map(chunk=>this.convoStripAcks(chunk)));','const memoryLines=useChunks;');
  assert.notEqual(after,before,'remove the actual runtime hook');text=typeof text==='string'?after:Buffer.from(after);
 }return text;};
 let G;try{G=await K.load({seed:2020962499,narration:true});}finally{fs.readFileSync=read;}
 const profile=JSON.parse(z.gunzipSync(read(K.ROOT+'/evidence/2026-10-31/application-checkpoint-r1/day18-before-accept-profile.json.gz'))),disk=new Map(profile.origins[0].localStorage.map(r=>[r.name,r.value]));
 global.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,String(v)),removeItem:k=>disk.delete(k)};
 const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-'));assert(G.load(key));const vid='rafael_torres',v=G.state.village,c=G.convoGet(vid),favor=v.favorLedger[vid];
 assert.equal(favor.state,'fulfilled');assert.equal(favor.fulfilledDay,14);
 assert(v.topicLog[vid].open.some(o=>o.tid==='want'),'actual failure fixture retains the stale favor thread');
 G.convoTopicLedger(vid);assert(!v.topicLog[vid].open.some(o=>o.tid==='want'),'settled actual favor cannot remain unfinished');
 const opened=G.startConvo(vid);assert(opened&&!opened.ended);assert(!/We never finished talking about that favor|You spend time tending them/.test(opened.line||''),'actual paid opening no longer revives the completed job or narrator');
 G.convoTurn(vid,'leave');
 // Each terminal lifecycle state closes only its own job, including lapsed
 // entries; a newer unfinished favor must survive the migration.
 for(const state of ['fulfilled','thanked','broken','acknowledged','moot','declined']){
  favor.state=state;c.want={id:'ask_favor',favor};v.topicLog[vid].open=[{tid:'want',favorId:favor.id,day:14,label:'that favor',snippet:'actual old request'}];v.topicLog[vid].lapsed=[{...v.topicLog[vid].open[0]}];
  assert.equal(G.convoOpenThreads(vid).length,0);assert.equal(v.topicLog[vid].lapsed.length,0);
 }
 favor.state='asked';c.want={id:'ask_favor',favor};v.topicLog[vid].open=[{tid:'want',favorId:favor.id,day:18,label:'that favor',snippet:'actual unfinished request'}];assert.equal(G.convoOpenThreads(vid).length,1,'unfinished obligation remains');
 c.want={id:'curious'};favor.state='fulfilled';v.topicLog[vid].open=[{tid:'want',favorId:'different-new-job',day:18,label:'that favor',snippet:'another request'}];assert.equal(G.convoOpenThreads(vid).length,1,'a different request is not silently completed');
 v.topicLog[vid].open=[];c.active=true;c.thread='past';c.threadLog=[];c.transcript=[];c._beatThread=null;c.saidLines=[];c.saidLinesConvo=[];
 const narration='You spend time tending them. This was care, not a promise of a cure.';
 G.sayLine(vid,narration,{diegeticAct:true});assert(c.transcript.some(e=>e.text===narration&&e.voiceLine===''),'narration remains visible, unvoiced');assert.equal(c.threadLog.length,0,'unspoken narration cannot become speech memory');
 const mixed='They take a breath. "The footbridge is gone beyond the north field." They look away.';
 G.sayLine(vid,mixed);const snippet=G.convoLastThreadSnippet(vid,'past');assert.equal(snippet,'The footbridge is gone beyond the north field.','mixed memory contains only actual quoted speech');
 c.exchanges=1;c.depth=2;G.convoPlantOpenThread(vid,'left');const planted=G.convoOpenThreads(vid).find(o=>o.tid==='past');assert(planted&&planted.snippetSpeech===true);assert.equal(planted.snippet,snippet);
 // New sitting clears its live transcript/log; stored provenance must keep
 // genuine speech usable without treating arbitrary legacy text as speech.
 c.threadLog=[];c.transcript=[];assert.equal(G.convoOpenThreads(vid).find(o=>o.tid==='past').snippetSpeech,true);
 v.topicLog[vid].open=[{tid:'legacy',label:'the old work',day:18,snippet:narration}];assert.equal(G.convoOpenThreads(vid)[0].snippetSpeech,false,'unknown legacy narration cannot gain speech provenance');
 c.transcript=[{who:'them',text:'"We should repair that footbridge before the next storm."',voiceLine:'"We should repair that footbridge before the next storm."'}];
 v.topicLog[vid].open=[{tid:'legacy',label:'the crossing',day:18,snippet:'We should repair that footbridge before the next storm.'}];assert.equal(G.convoOpenThreads(vid)[0].snippetSpeech,true,'legacy spoken text is recovered from its actual transcript');
 c.transcript=[{who:'you',text:'"I remember the road by the river."'}];assert.equal(G.convoSnippetSpeech(vid,'I remember the road by the river.'),null,'player speech is not attributed to the NPC');
 const parsed=G.voiceLinesForBeats(['They pause. "The north ', 'crossing is washed out." They turn away.']);assert(parsed.every(Boolean));c.threadLog=[];for(const speech of parsed)G.convoNoteSpokenBeat(vid,speech);assert(c.threadLog.every(e=>e.speech===true&&!/They pause|They turn/.test(e.snippet)),'paged speech excludes narration');
 console.log('Conversation memory provenance: actual fulfilled-job opening, 6 terminal states, unrelated/open jobs, narration/mixed/paged speech and legacy/player contrasts passed');
}
(async()=>{if(mode)return child();const run=m=>cp.spawnSync(process.execPath,[__filename,m],{encoding:'utf8',timeout:120000,maxBuffer:5e6});const current=run('current');assert.equal(current.status,0,current.stderr||current.stdout);for(const [mode,reason]of [['removed-lifecycle','settled actual favor cannot remain unfinished'],['removed-speech','unspoken narration cannot become speech memory']]){const r=run(mode);assert.notEqual(r.status,0);assert(r.stderr.includes(reason),r.stderr);}console.log(current.stdout.trim());console.log('Both actual removed runtime controls reject the missing repair');})().catch(error=>{console.error(error.stack);process.exitCode=1;});
