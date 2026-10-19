// Favor obligations through actual offered dialogue and shared care runtime.
'use strict';
const K=require('./godpath/lib'),T=K.reporter('favor-system');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||20261011),narration:true});
 function fresh(hungry=true){
  G.debugRegion='na_eastern_woodlands';K.newRun(G);const s=G.state.scholar,v=G.state.village;
  const vid=v.roster.find(id=>id!==G.villagerId&&G.getPerson(id));if(!vid)throw Error('No living conversation target');
  const person=G.getPerson(vid);person.languages={native:'english',levels:{english:2}};s.languages={english:2};
  Object.assign(G.npcNeeds(vid),{hunger:hungry?85:10,fear:10,social:10,energy:90});
  v.health=v.health||{};v.health[vid]=100;v.sick=v.sick||{};delete v.sick[vid];
  v.water={clean:100,dirty:0};v.pantry.push({name:'Prepared stores',kcalEach:1000000,units:1});
  v.trust[vid]=30;s.kcal=50000;
  T.ok('fresh target shares a full language',G.commLevel(vid).level==='full');
  return {s,v,vid};
 }
 function choices(vid){return G.convoChoices(vid)||[];}
 function choose(vid,id){const visible=!!K.findConvoChoice(G,vid,id);T.ok('offered dialogue: '+id,visible,choices(vid).map(c=>c.id).join(','));if(!visible)throw Error('Required dialogue missing: '+id);return G.convoTurn(vid,id);}
 function start(vid){
  G.startConvo(vid);
  // Answer only actual offered opening questions before the favor dialogue.
  for(let i=0;i<4;i++){
   const qs=choices(vid).filter(c=>c.id.startsWith('gq:'));
   if(!qs.length)break;
   const c=qs.find(c=>c.id==='gq:open:take')||qs.find(c=>c.id==='gq:open:unsure')||qs[0];choose(vid,c.id);
  }
  T.ok('acute need actually selects ask_favor',G.convoGet(vid).want?.id==='ask_favor');
  if(G.convoGet(vid).want?.id!=='ask_favor')throw Error('Favor not selected');
 }
 function close(vid,why='left'){G.endConvo(vid,why);}
 function obligation(vid){return G.state.village.promises?.[vid];}
 function journal(vid,status,task){return (G.state.codex.people?.[vid]?.promises||[]).some(p=>p.status===status&&p.text===task);}
 function commit(){const f=fresh();start(f.vid);choose(f.vid,'dlg:help');choose(f.vid,'dlg:commit');const p=obligation(f.vid);T.ok('commit creates concrete tracked obligation',!!p&&!p.kept&&!!p.favorTask&&Number.isFinite(p.favorDeadline));if(!p)throw Error('Missing committed obligation');return {...f,p};}
 let f=fresh(false);
 T.ok('no real need exists',G.convoFindFavorNeed(f.vid)===null);
 let needCount=0,favorCount=0;for(let i=0;i<40;i++){if(G.convoFindFavorNeed(f.vid))needCount++;if(G.convoSelectWant(f.vid)?.id==='ask_favor')favorCount++;}
 T.ok('no contentless favors across40 real selections',needCount===0&&favorCount===0);
 const paths=[['help then leave',['dlg:help']],['details then leave',['dlg:details']],['help then extra details unavailable',['dlg:help']],['help then decline',['dlg:help','dlg:cant']],['opening only',[]]];
 for(const [name,moves]of paths){
  f=fresh();start(f.vid);for(const id of moves)choose(f.vid,id);if(name==='help then extra details unavailable')T.ok('stated ask offers commit instead of another details action',!K.findConvoChoice(G,f.vid,'dlg:details')&&!!K.findConvoChoice(G,f.vid,'dlg:commit'));close(f.vid);
  const resolution=G.convoGet(f.vid).want?.resolution;
  T.ok(name+': no promised/engaged resolution',['stated','deflected','abandoned','unresolved'].includes(resolution),resolution);
  T.ok(name+': no obligation without commitment',!obligation(f.vid));
 }
 f=fresh();start(f.vid);choose(f.vid,'dlg:help');close(f.vid);
 T.ok('heard but uncommitted is stated',G.convoGet(f.vid).want.resolution==='stated');
 T.ok('stated favor plants exact followup id',f.v.convoSeeds[f.vid]?.wantId==='ask_favor'&&f.v.convoSeeds[f.vid]?.favorId===G.convoGetFavor(f.vid)?.id);
 let c=commit();
 T.ok('formal dialogue resolves promised',G.convoGet(c.vid).want.resolution==='promised');
 T.ok('food obligation carries actual favor id and goal',c.p.goal==='feed'&&c.p.favorId===G.convoGetFavor(c.vid)?.id);
 T.ok('journal shows exact open obligation',journal(c.vid,'open',c.p.favorTask));close(c.vid,'closed');
 T.ok('committed favor seeds repay',c.v.convoSeeds[c.vid]?.wantId==='repay');
 // Wrong recipient and words alone must not satisfy the concrete promise.
 G.checkPromises('food','not-this-recipient');T.ok('wrong recipient does not fulfill',obligation(c.vid)?.kept===false);
 const trust=c.v.trust[c.vid];const berry=G.data.plants.find(p=>p.id==='blackberry');c.s.inventory=[G.foodForageItem(berry,true,5,5*berry.caloriesPerUnit,c.s.day)];
 const beforeHunger=G.npcNeeds(c.vid).hunger;G.giveFood(c.vid,'meal');
 T.ok('actual food handoff consumes real units',c.s.inventory.reduce((n,i)=>n+(i.units||0),0)===2);
 T.ok('actual food handoff relieves actual hunger',G.npcNeeds(c.vid).hunger<beforeHunger);
 T.ok('actual food handoff fulfills obligation',obligation(c.vid)?.kept===true);
 T.ok('favor instance becomes fulfilled',G.convoGetFavor(c.vid)?.state==='fulfilled');
 T.ok('fulfilled deed increases trust',c.v.trust[c.vid]>trust);
 T.ok('journal records kept concrete favor',journal(c.vid,'kept',c.p.favorTask));
 c=commit();close(c.vid,'closed');const trustBeforeBreak=c.v.trust[c.vid];c.s.day=c.p.favorDeadline+1;G.checkPromises();
 T.ok('deadline breaks exact obligation',obligation(c.vid)?.kept==='broken');
 T.ok('deadline marks favor broken',G.convoGetFavor(c.vid)?.state==='broken');
 T.ok('broken promise reduces trust',c.v.trust[c.vid]<trustBeforeBreak);
 T.ok('journal records broken concrete favor',journal(c.vid,'broken',c.p.favorTask));
 f=fresh();start(f.vid);choose(f.vid,'dlg:help');const beforeDecline=f.v.trust[f.vid];choose(f.vid,'dlg:cant');
 T.ok('decline itself costs trust',f.v.trust[f.vid]<beforeDecline);close(f.vid,'closed');
 T.ok('decline resolves deflected',G.convoGet(f.vid).want.resolution==='deflected');
 T.ok('decline plants no reask seed',!f.v.convoSeeds?.[f.vid]);
 T.ok('decline writes explicit memory',(f.v.memory[f.vid]||[]).some(m=>m.t==='deflected'));
 // Builder coverage retains six villagers x six days, not a retry-until-pass.
 f=fresh();const vids=f.v.roster.filter(id=>id!==G.villagerId).slice(0,6),last={};let built=0,consecutive=0;const repeats=[];
 for(let day=1;day<=6;day++){f.s.day=day;for(const vid of vids){Object.assign(G.npcNeeds(vid),{hunger:85,fear:10,energy:90});const need=G.convoFindFavorNeed(vid);if(!need)throw Error('Missing prepared favor need');const favor=G.convoBuildFavor(vid,need);if(!favor)throw Error('Missing real favor');built++;const previous=last[vid]||(last[vid]={});for(const key of ['line','whyLine']){if(previous[key]===favor[key]){consecutive++;repeats.push({day,vid,key,text:favor[key]});}previous[key]=favor[key];}G.convoStoreFavor(favor);}}
 T.ok('all36 meaningful favors built',vids.length===6&&built===36);
 T.ok('no immediate verbatim repetition per villager',consecutive===0,JSON.stringify(repeats));
 // Prepared collision: retain a valid earlier identity with the next instance's
 // candidate wording. Rebuild that exact candidate; rotate wording, not its task.
 f=fresh();const need=G.convoFindFavorNeed(f.vid),earlier=G.convoBuildFavor(f.vid,need);
 const seq=f.v.favorSeq,candidate=G.convoBuildFavor(f.vid,need);f.v.favorSeq=seq;
 G.convoStoreFavor({...earlier,line:candidate.line,whyLine:candidate.whyLine});
 const rotated=G.convoBuildFavor(f.vid,need);
 T.ok('prepared opener collision chooses different authored wording',rotated.line!==candidate.line);
 T.ok('prepared explanation collision chooses different authored wording',rotated.whyLine!==candidate.whyLine);
 T.ok('collision rotation preserves identity and sequence',rotated.id===candidate.id&&f.v.favorSeq===seq+1);
 T.ok('collision rotation preserves task deadline and semantics',['kind','keepKind','goal','task','short','why','stakes','deadline','state','askedDay','commitLine','goodbye'].every(k=>rotated[k]===candidate[k]));
 // Resume uses fresh natural conversation history, not the other branches.
 f=fresh();start(f.vid);choose(f.vid,'dlg:help');close(f.vid);const prior=G.convoGetFavor(f.vid);
 T.ok('resume seed refers to real favor',f.v.convoSeeds[f.vid]?.favorId===prior.id);
 f.s.day++;G.startConvo(f.vid);const opening=G.convoGet(f.vid).transcript.filter(e=>e.who==='them').map(e=>e.text).join(' ');
 T.ok('followup names prior ask',opening.includes(prior.short)||opening.includes('still need hands'),opening);
 T.ok('followup offers commitment directly',choices(f.vid).some(c=>c.id==='dlg:commit'),choices(f.vid).map(c=>c.id).join(','));
 delete G.debugRegion;T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
