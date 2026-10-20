// Settled favors: real seeded followups, fresh shared-runtime cases, stale replies.
'use strict';
const K=require('./godpath/lib'),T=K.reporter('settled-favor-engage');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||424242),narration:true});
 function fresh(){
  G.debugRegion='na_eastern_woodlands';K.newRun(G);const s=G.state.scholar,v=G.state.village;
  const vid=v.roster.find(id=>id!==G.villagerId&&G.getPerson(id));if(!vid)throw Error('No actual neighbor');
  const p=G.getPerson(vid);p.languages={native:'english',levels:{english:2}};p.personality=p.personality||{};p.personality.temperament='steady';s.languages={english:2};
  Object.assign(G.npcNeeds(vid),{hunger:10,fear:10,social:10,energy:90});v.health=v.health||{};v.health[vid]=100;v.sick=v.sick||{};delete v.sick[vid];
  v.water={clean:100,dirty:0};v.pantry.push({name:'Prepared stores',kcalEach:1000000,units:1});v.trust[vid]=30;
  T.ok('fresh shared-language neighbor',G.commLevel(vid).level==='full');
  return {s,v,vid};
 }
 const choices=vid=>G.convoChoices(vid)||[];
 function questions(vid){for(let i=0;i<4;i++){const qs=choices(vid).filter(c=>c.id.startsWith('gq:'));if(!qs.length)break;const q=qs.find(c=>c.id==='gq:open:take')||qs.find(c=>c.id==='gq:open:unsure')||qs[0];G.convoTurn(vid,q.id);}}
 function moot(){
  const f=fresh();f.v.health[f.vid]=40;const need=G.convoFindFavorNeed(f.vid);
  T.ok('wound is the actual selected need',need?.kind==='heal_help');if(need?.kind!=='heal_help')throw Error('Missing wound need');
  const favor=G.convoBuildFavor(f.vid,need);G.convoStoreFavor(favor);G.convoPlantSeed(f.vid,{wantId:'ask_favor',note:'the help I asked for',favorId:favor.id});
  f.v.health[f.vid]=100;G.startConvo(f.vid);questions(f.vid);
  const c=G.convoGet(f.vid),transcript=c.transcript.filter(e=>e.who==='them').map(e=>e.text).join('\n');
  T.ok('actual seeded followup selected',c.want?.id==='ask_favor'&&c.want?.fromSeed===true);
  T.ok('seeded opener states wound is handled',/we got it handled/i.test(transcript),transcript);
  T.ok('actual resolved need becomes moot',favor.state==='moot'&&!G.convoFavorNeedLive(favor));
  T.ok('settled menu cannot offer commitment',!choices(f.vid).some(c=>c.id==='dlg:commit'));
  return {...f,favor};
 }
 const handled=text=>/handled|all sorted|it.s fine|already/i.test(text);
 function noDeadWhy(text,favor){return !text.includes(favor.whyLine.replace(/^"|"$/g,''))&&!/getting worse, not better/i.test(text);}
 // Closed menus need not re-offer an obsolete action. These deliberately
 // replay stale ids to prove the runtime's defensive reply remains honest.
 for(const action of ['dlg:help','dlg:details','dlg:cant','alive:want:ask_favor']){
  const f=moot(),r=G.convoTurn(f.vid,action),line=r?.line||'';
  T.ok(action+': stale reply exists',line.length>0);
  T.ok(action+': stale reply never revives dead why',noDeadWhy(line,f.favor),line);
  T.ok(action+': stale reply acknowledges settlement',handled(line),line);
  T.ok(action+': no guilt or hollow fallback',!/won.t forget|won.t ask twice|figure it out|here.s the thing/i.test(line),line);
  T.ok(action+': no phantom obligation',!f.v.promises?.[f.vid]);
  const close=G.endConvo(f.vid,'done')?.line||'';
  T.ok(action+': close preserves settlement',!/forget i asked|getting worse/i.test(close),close);
 }
 // Additional settled states use the real followup transition: fulfilled ->
 // thanked, broken -> acknowledged. Each is a fresh controlled state.
 for(const state of ['fulfilled','broken']){
  const f=fresh();f.v.health[f.vid]=40;const favor=G.convoBuildFavor(f.vid,G.convoFindFavorNeed(f.vid));favor.state=state;G.convoStoreFavor(favor);
  G.convoPlantSeed(f.vid,{wantId:'ask_favor',note:'the prior favor',favorId:favor.id});f.v.health[f.vid]=100;G.startConvo(f.vid);questions(f.vid);
  T.ok(state+': followup transitions to settled acknowledgment',favor.state===(state==='fulfilled'?'thanked':'acknowledged'));
  T.ok(state+': cannot recommit settled obligation',!choices(f.vid).some(c=>c.id==='dlg:commit'));
  const line=G.convoTurn(f.vid,'dlg:help')?.line||'';
  T.ok(state+': defensive engagement stays handled',handled(line)&&noDeadWhy(line,favor),line);
 }
 // Live contrasts are mandatory, single starts, no retry-until-selected.
 {
  const kind='heal_help',f=fresh();f.v.health[f.vid]=40;
  T.ok(kind+': actual live need exists',G.convoFindFavorNeed(f.vid)?.kind===kind);
  G.startConvo(f.vid);questions(f.vid);const c=G.convoGet(f.vid),favor=G.convoGetFavor(f.vid);
  T.ok(kind+': fresh actual ask selected',c.want?.id==='ask_favor'&&!c.want?.fromSeed&&favor?.kind===kind);
  const help=choices(f.vid).find(c=>c.id==='dlg:details');T.ok(kind+': real live help action offered',!!help);if(!help)throw Error('Live help action missing');
  const line=G.convoTurn(f.vid,help.id)?.line||'';
  T.ok(kind+': actual engagement speaks live why',!!favor&&line.includes(favor.whyLine.replace(/^"|"$/g,'')),line);
  T.ok(kind+': stated need can be committed',choices(f.vid).some(c=>c.id==='dlg:commit'));
 }
 // Water is chronic urgency3 and legitimately competes with first-meeting
 // curiosity/grief. Seed a real prior water ask; never retry the picker.
 {
  const f=fresh();f.v.water.clean=0;const need=G.convoFindFavorNeed(f.vid);
  T.ok('water: actual live need is water haul',need?.kind==='water_haul');
  const favor=G.convoBuildFavor(f.vid,need);G.convoStoreFavor(favor);
  G.convoPlantSeed(f.vid,{wantId:'ask_favor',note:'the water I asked about',favorId:favor.id});G.startConvo(f.vid);questions(f.vid);
  const c=G.convoGet(f.vid),speech=c.transcript.filter(e=>e.who==='them').map(e=>e.text).join(' ');
  T.ok('water: actual seeded ask stays live',c.want?.id==='ask_favor'&&c.want?.fromSeed&&favor.state==='asked'&&G.convoFavorNeedLive(favor));
  T.ok('water: followup remembers exact ask',speech.includes(favor.short),speech);
  const explanation=choices(f.vid).find(c=>c.id==='dlg:favor_requirements');T.ok('water: unavailable job explains instead of offering hollow promise',!!explanation&&!choices(f.vid).some(c=>c.id==='dlg:commit'));
  const result=G.convoTurn(f.vid,explanation.id);T.ok('water: joint trip explicitly unavailable, no obligation',/no playable action yet/.test(result.line)&&!f.v.promises?.[f.vid]);
 }
 const f=fresh();G.npcNeeds(f.vid).hunger=85;const food=G.convoBuildFavor(f.vid,G.convoFindFavorNeed(f.vid));
 T.ok('food explanation is quoted speech',!!food&&/^\s*"/.test(food.whyLine)&&/"\s*$/.test(food.whyLine));
 const voice=G.voiceLine(f.vid,'"Will you?"');T.ok('voice join has no double spaces',!/  /.test(String(voice).replace(/^"|"$/g,'')),voice);
 delete G.debugRegion;T.done();
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
