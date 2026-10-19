'use strict';
const K=require('./lib'),T=K.reporter('balance-npc-eligibility'),path=require('path');
const observerArg=process.argv.indexOf('--observer'),B=require(observerArg<0?'../balance-panel':path.resolve(process.argv[observerArg+1]));
const hash=require('../gear-usage-audit').gameplayHash;
(async()=>{
  const G=await K.load({seed:7});K.newRun(G);
  const s=G.state.scholar,v=G.state.village,me=G.villagerId;
  const [a,dead,departed,unclassed]=v.roster.filter(id=>id!==me&&G.npcAge(id)>=18).slice(0,4);
  s.day=85;G.state.systemArrived=true;
  const bg='proof_background',rc='proof_restored',unknown='proof_unknown';
  G.data.background_survivors=G.data.background_survivors||[];
  G.data.background_survivors.push({id:bg,name:'Prepared background resident',dead:false});
  v.rosterChars={...(v.rosterChars||{}),[rc]:{id:rc,name:'Prepared saved resident',dead:false}};
  G.vpOf(dead).dead=true;
  v.roster=[me,a,a,unclassed,dead,unknown,bg,rc];
  v.needs={[a]:{hunger:90},[bg]:{hunger:10},[rc]:{hunger:100}};
  v.npcGodpath={};v.npcGodhood={};
  const observer=B.install(G);
  const kit=G.data.abilities.filter(x=>x.lane==='magic'&&x.path==='hunter').slice(0,3).map(x=>x.id);
  v.npcAbilities={[a]:kit};const recognized=G.recognizeClass(a);
  T.ok('real NPC recognition emits a class for the eligible resident',recognized?.path==='hunter'&&G.state.telemetry.some(e=>e.type==='class_recognized'&&e.who===a));
  const otherPath=G.data.abilities.find(x=>x.lane==='magic'&&x.path&&x.path!=='hunter'&&G.data.abilities.filter(y=>y.lane==='magic'&&y.path===x.path).length>=3).path;
  v.npcAbilities[dead]=G.data.abilities.filter(x=>x.lane==='magic'&&x.path===otherPath).slice(0,3).map(x=>x.id);
  const deadClass=G.recognizeClass(dead);
  T.ok('prepared dead holder also exercises the actual class telemetry producer',deadClass?.path===otherPath&&G.state.telemetry.some(e=>e.type==='class_recognized'&&e.who===dead));
  for(const [id,tag]of [[me,'self'],[dead,'dead'],[departed,'departed'],[unknown,'unknown']]){
    // Explicit legacy-record fixtures, not earned gameplay builds.
    v.npcGodpath[id]={path:'fixture_'+tag,subclass:'fixture'};
    v.npcGodhood[id]={active:['fixture_'+tag]};
  }
  v.npcGodhood[a]={active:['apex_predator','apex_predator']};
  const before=hash(G.state);observer.sample();
  T.ok('sampling does not mutate gameplay',hash(G.state)===before);
  // A real mantle into the former NPC, retaining stale NPC map entries.
  v.roster=[me,a];v.party=[a];v.trust[a]=90;G.vpOf(a).dead=false;
  G.playerDeath('prepared NPC measurement mantle');
  T.ok('real succession takes the previously measured resident',G.villagerId===a);
  const v2=G.state.village;G.state.scholar.day=86;
  v2.npcGodpath[a]={path:'fixture_bearer_era',subclass:'fixture'};
  v2.npcGodhood[a]={active:['fixture_bearer_era']};
  observer.sample();
  // This person was genuinely sampled as an NPC, but held no class then.
  // A class written only after becoming the bearer must not earn NPC credit.
  v2.roster=[a,unclassed];v2.trust[unclassed]=90;G.vpOf(unclassed).dead=false;
  G.playerDeath('prepared unclassed NPC mantle');
  T.ok('second real succession takes the previously sampled unclassed NPC',G.villagerId===unclassed);
  G.state.scholar.day=87;G.state.village.npcGodpath[unclassed]={path:'fixture_player_only',subclass:'fixture'};
  observer.sample();
  const row={won:0,entered:0,table:0,national:0,gameDays:86,deaths:{'player:prepared':1},endReason:'survived'};
  const finalBefore=hash(G.state),r=observer.finish(row),ex=r.npcExposure,first=ex?.days.find(d=>d.day===85),last=ex?.days.find(d=>d.day===86);
  T.ok('terminal observation does not mutate gameplay',hash(G.state)===finalBefore);
  T.ok('daily living identities deduplicate roster and include both definition fallbacks',JSON.stringify(first?.eligible)===JSON.stringify([a,unclassed,bg,rc].sort()));
  T.ok('duplicate roster entries remain a diagnostic instead of extra mouths',first?.duplicateRosterEntries===1);
  T.ok('unknown and dead roster people remain explicit',JSON.stringify(first?.unknown)===JSON.stringify([unknown])&&JSON.stringify(first?.dead)===JSON.stringify([dead]));
  T.ok('daily living count measures distinct known residents',r.samples.find(d=>d.day===85)?.livingNpcs===4);
  T.ok('living NPC count remains unknown when any sampled roster person lacks a definition',r.metrics.livingNpcs===null);
  T.ok('class fraction also remains unknown with incomplete roster coverage',r.metrics.npcClassAccess===null);
  T.ok('hunger counts actual distinct known needs',r.metrics.npcHungry===2/3,r.metrics.npcHungry);
  T.ok('eligible real class recognition is retained',r.classes.npc.includes(recognized.path+'/'+recognized.subclass));
  T.ok('self, dead, departed and unknown class maps are excluded',!r.classes.npc.some(x=>x.startsWith('fixture_')));
  T.ok('an actual recognition event for a dead holder is excluded too',!r.classes.npc.includes(deadClass.path+'/'+deadClass.subclass));
  T.ok('self, dead, departed and unknown god maps are excluded',JSON.stringify(r.gods.npc)===JSON.stringify(['apex_predator']));
  T.ok('duplicate active-god records do not multiply holder exposure',first?.gods.length===1);
  T.ok('each rejected class record has its actual eligibility reason',first?.excludedBuildRecords.classes.currentBearer===1&&first?.excludedBuildRecords.classes.deadPerson===1&&first?.excludedBuildRecords.classes.notResident===1&&first?.excludedBuildRecords.classes.unknownPerson===1);
  T.ok('each rejected god record has its actual eligibility reason',first?.excludedBuildRecords.gods.currentBearer===1&&first?.excludedBuildRecords.gods.deadPerson===1&&first?.excludedBuildRecords.gods.notResident===1&&first?.excludedBuildRecords.gods.unknownPerson===1);
  T.ok('the new bearer never counts as a current NPC holder',last?.classes.every(x=>x.who!==a)&&last?.gods.every(x=>x.who!==a));
  T.ok('a real earlier NPC class remains historical access after succession',ex?.classIdentities.includes(a));
  T.ok('having once been an NPC cannot turn a later player-only class into NPC access',ex?.sampledIdentities.includes(unclassed)&&!ex?.classIdentities.includes(unclassed));
  T.ok('sampled denominator identities are retained for review',JSON.stringify(ex?.sampledIdentities)===JSON.stringify([a,unclassed,bg,rc].sort()));
  // A second collector on a fully known snapshot: no game actions are run
  // after installing it, so earlier observers cannot affect this control.
  v2.roster=[G.villagerId,bg,bg];v2.needs={[bg]:{hunger:10}};
  const known=B.install(G),knownBefore=hash(G.state),k=known.finish(row);
  T.ok('fully known denominator gives a real zero rather than null',k.metrics.npcClassAccess===0);
  T.ok('background-only living population is one despite duplicate roster',k.metrics.livingNpcs===1);
  T.ok('a current bearer alias alone cannot imply NPC god availability',k.gods.npc.length===0);
  T.ok('finite NPC fractions stay within zero and one',k.metrics.npcClassAccess>=0&&k.metrics.npcClassAccess<=1&&k.metrics.npcHungry===0);
  T.ok('known-only terminal control is also observationally pure',hash(G.state)===knownBefore);
  v2.roster=[G.villagerId,bg,unknown];const transient=B.install(G);transient.sample();
  v2.roster=[G.villagerId,bg];transient.sample();const tr=transient.finish(row);
  T.ok('a same-day terminal overwrite cannot erase earlier unknown NPC coverage',tr.metrics.npcClassAccess===null&&tr.npcExposure?.unknownIdentities.includes(unknown)&&tr.npcExposure?.days.every(d=>d.unknown.length===0));
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
