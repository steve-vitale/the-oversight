#!/usr/bin/env node
'use strict';
const fs=require('fs'),z=require('zlib'),assert=require('assert/strict'),crypto=require('crypto'),R=require('./garden-longplay-audit'),G=require('./summarize-garden-accounting'),M=require('./lib/measurement-contract');
const read=file=>JSON.parse(z.gunzipSync(fs.readFileSync(file))),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const GARDEN=['green_thumb','green_whisper','cornucopia','rain_dancer','photosynthesis'],CORE=['green_thumb','green_whisper'];
const has=(rows,ids)=>Array.isArray(rows)&&rows.some(a=>ids.includes(a.id));
const named=c=>c?.path==='forager'&&c.subclass==='gardener'&&!c.lapsed;
function validate(report,options){
 G.validate(report,options);assert(report.plan.toolHashes['scripts/lib/garden-opportunity.js'],'Missing collector identity');
 for(const r of report.results.filter(r=>r.job.observe)){
  const o=r.gardenOpportunity;assert.equal(o?.version,1);assert.deepEqual(o.errors,[]);assert(o.observedMethods.includes('chooseAbility')&&o.observedMethods.includes('cultivateGarden'));
  assert(o.casts.every(c=>['before-time','return'].includes(c.boundary)),'Old pre-time-boundary collector is not accepted');
  assert(o.playerChoices.every(c=>c.seq===null||o.offers[c.seq]),'Unlinked player sheet reference');
  assert(o.npcGrants.every(c=>c.sheet===null||o.npcOffers[c.sheet]),'Unlinked NPC sheet reference');
  assert(o.playerChoices.every(c=>c.held!==null&&c.after!==null||c.acquired===null),'Unknown player kit was treated as known');
  assert(o.npcGrants.every(c=>c.held!==null&&c.after!==null||c.acquired===null),'Unknown NPC kit was treated as known');
 }
 for(const off of report.results.filter(r=>!r.job.observe)){
  const on=report.results.find(r=>r.job.observe&&r.job.policy===off.job.policy&&r.job.seed===off.job.seed&&r.job.days===off.job.days);
  assert.deepEqual(on.donationCounters,off.donationCounters);
 }
 return true;
}
function summarizeCase(r){
 const o=r.gardenOpportunity,dayKeys=new Set(),npcDays=new Set(),npcCore=new Set(),npcUnknown=new Set(),unknownPeople=new Set();
 for(const d of o.actorDays){
  dayKeys.add(d.day+':'+d.bearer);
  for(const n of d.npcs){const k=d.day+':'+n.id;npcDays.add(k);if(n.held===null)npcUnknown.add(k);else if(has(n.held,CORE))npcCore.add(k);}
  for(const id of d.excluded.unknownPerson)unknownPeople.add(d.day+':'+id);
 }
 const acquired=o.playerChoices.filter(c=>c.acquired===true&&c.onSheet),npcAcquired=o.npcGrants.filter(c=>c.acquired===true&&c.onSheet&&c.eligibility===null);
 const isTrack=c=>o.offers[c.seq]?.choices.find(a=>a.id===c.id)?.src?.startsWith('level_up:');
 const beyond=o.gates.filter(g=>g.gate==='gardenMakeGate'&&g.plots>=4&&g.tier>=2);
 const casts=o.casts.filter(c=>c.returnedTrue),pc=casts.filter(c=>c.actor===c.bearer),nc=casts.filter(c=>c.actor!==c.bearer&&c.eligibility===null);
 return{job:r.job,terminal:r.terminal,
  player:{sheets:o.offers.length,sheetsWithGarden:o.offers.filter(s=>s.choices.some(c=>GARDEN.includes(c.id))).length,sheetsWithCore:o.offers.filter(s=>s.choices.some(c=>CORE.includes(c.id))).length,
   acquiredGarden:acquired.filter(c=>GARDEN.includes(c.id)).length,acquiredCore:acquired.filter(c=>CORE.includes(c.id)).length,trackAcquiredGarden:acquired.filter(c=>GARDEN.includes(c.id)&&isTrack(c)).length,trackAcquiredCore:acquired.filter(c=>CORE.includes(c.id)&&isTrack(c)).length,
   unknownChoiceAcquisitions:o.playerChoices.filter(c=>c.acquired===null).length,sampledActorDays:dayKeys.size,sampledCoreHolderDays:o.actorDays.filter(d=>has(d.held,CORE)).length,namedGardenerSampled:o.actorDays.some(d=>named(d.class)),casts:pc.length},
  npc:{eligibleOfferCalls:o.npcOffers.filter(s=>s.eligibility===null).length,eligibleCoreOfferCalls:o.npcOffers.filter(s=>s.eligibility===null&&s.ids?.some(id=>CORE.includes(id))).length,
   linkedGardenAcquisitions:npcAcquired.filter(c=>GARDEN.includes(c.id)).length,linkedCoreAcquisitions:npcAcquired.filter(c=>CORE.includes(c.id)).length,unknownPriorKitGrants:o.npcGrants.filter(c=>c.acquired===null).length,
   sampledEligibleResidentDays:npcDays.size,sampledCoreHolderDays:npcCore.size,unknownBuildDays:npcUnknown.size,unknownPersonDays:unknownPeople.size,namedGardenerSampled:o.actorDays.some(d=>d.npcs.some(n=>named(n.class))),casts:nc.length},
  capacity:{upperTierSampled:o.actorDays.some(d=>d.tier>=2),unusedUpperCapacitySampled:o.actorDays.some(d=>d.tier>=2&&d.unusedCapacity>0),maxPlots:Math.max(0,...o.actorDays.map(d=>d.plots.length)),
   makeQueriesBeyondFour:beyond.reduce((n,g)=>n+g.calls,0),makeSpecificReadyQueriesBeyondFour:beyond.filter(g=>g.ok).reduce((n,g)=>n+g.calls,0),
   actualBuildsBeyondFour:o.builds.filter(b=>b.sameBearer&&b.before>=4&&b.after>b.before).length},
  byAbility:Object.fromEntries(GARDEN.map(id=>[id,{offeredSheets:o.offers.filter(s=>s.choices.some(c=>c.id===id)).length,playerAcquisitions:acquired.filter(c=>c.id===id).length,trackPlayerAcquisitions:acquired.filter(c=>c.id===id&&isTrack(c)).length,npcLinkedAcquisitions:npcAcquired.filter(c=>c.id===id).length}]))};
}
function summarize(report,options){
 const selected=M.select(report.plan.identity,options);
 validate(report,options);const cases=report.results.filter(r=>r.job.observe).map(summarizeCase),groups=[];
 for(const c of cases){let g=groups.find(g=>g.policy===c.job.policy&&g.cap===c.job.days);if(!g){g={policy:c.job.policy,cap:c.job.days,cases:0,terminal:0,capped:0,playerCoreOfferCases:0,playerTrackCoreAcquiredCases:0,playerCoreHolderCases:0,playerCultivationCases:0,npcCoreHolderCases:0,npcCultivationCases:0,playerNamedGardenerCases:0,npcNamedGardenerCases:0,upperTierCases:0,unusedUpperCapacityCases:0,buildsBeyondFour:0,maxPlots:0};groups.push(g);}
  g.cases++;g.terminal+=+c.terminal.engineOver;g.capped+=+!c.terminal.engineOver;g.playerCoreOfferCases+=+(c.player.sheetsWithCore>0);g.playerTrackCoreAcquiredCases+=+(c.player.trackAcquiredCore>0);g.playerCoreHolderCases+=+(c.player.sampledCoreHolderDays>0);g.playerCultivationCases+=+(c.player.casts>0);g.npcCoreHolderCases+=+(c.npc.sampledCoreHolderDays>0);g.npcCultivationCases+=+(c.npc.casts>0);g.playerNamedGardenerCases+=+c.player.namedGardenerSampled;g.npcNamedGardenerCases+=+c.npc.namedGardenerSampled;g.upperTierCases+=+c.capacity.upperTierSampled;g.unusedUpperCapacityCases+=+c.capacity.unusedUpperCapacitySampled;g.buildsBeyondFour+=c.capacity.actualBuildsBeyondFour;g.maxPlots=Math.max(g.maxPlots,c.capacity.maxPlots);
 }
 return{measurementIdentity:selected.measurementIdentity,scope:'Mixed-policy exposure audit. Actual on-sheet acquisitions, sampled holders, physical completed casts and named class observations are distinct. No intended-build/pacifist viability, net-profit or balance claim. Gate readiness is the returned sub-gate only, not full action availability; no unqueried permissions are inferred.',cases,groups:groups.sort((a,b)=>a.cap-b.cap||a.policy.localeCompare(b.policy)),accounting:G.summarize(report)};
}
function referenceReplay(reference,current,options){
 G.validate(reference,options);validate(current,options);
 for(const key of ['sources','identity','configuration','jobs','comparisonExclusions'])assert.deepEqual(reference.plan[key],current.plan[key],key);
 const changed=[...new Set([...Object.keys(reference.plan.toolHashes),...Object.keys(current.plan.toolHashes)])].filter(k=>reference.plan.toolHashes[k]!==current.plan.toolHashes[k]).sort();
 assert.deepEqual(changed,['scripts/garden-longplay-audit.js','scripts/lib/garden-opportunity.js']);
 const pairs=current.results.map(a=>{const b=reference.results.find(b=>same(a.job,b.job));assert(b);const matches=Object.fromEntries(['row','stateHash','metrics','rngTail','donationCounters'].map(k=>[k,same(a[k],b[k])]));assert(Object.values(matches).every(Boolean),'Observer revision changed a campaign');return{job:a.job,...matches};});
 return{scope:'Auxiliary observer revision; unchanged Game/controller and balanced observer/contract. Only Game/row/all23/RNG/native counters are replay-compared; older reports have no reconstructed opportunity census.',changedTools:Object.fromEntries(changed.map(k=>[k,{before:reference.plan.toolHashes[k]??null,after:current.plan.toolHashes[k]}])),pairs};
}
module.exports={validate,summarize,summarizeCase,referenceReplay};
if(require.main===module)try{
 const historicalOptions={historical:process.argv.includes('--historical')};
 const [file,referenceFile,out]=process.argv.slice(2);if(!file||!referenceFile||!out)throw Error('Usage: node scripts/summarize-garden-opportunity.js <current.json.gz> <reference.json.gz or -> <fresh-output-prefix>');
 const report=read(file),summary=summarize(report,historicalOptions);summary.reference=referenceFile==='-'?{scope:'No equal-source historical reference supplied. Only the real current-source on/off controls establish observation neutrality; do not compare a changed Game as an observer-only revision.',pairs:[]}:referenceReplay(read(referenceFile),report,historicalOptions);
 summary.inputs={current:{file,sha256:sha(fs.readFileSync(file))},reference:referenceFile==='-'?null:{file:referenceFile,sha256:sha(fs.readFileSync(referenceFile))}};summary.summarizerSha256=sha(fs.readFileSync(__filename,'utf8').replace(/\r\n/g,'\n'));
 fs.writeFileSync(out+'.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
 const rows=summary.groups.map(g=>`| ${g.policy} | ${g.cap} | ${g.cases} | ${g.terminal}/${g.capped} | ${g.playerCoreOfferCases} | ${g.playerTrackCoreAcquiredCases} | ${g.playerCoreHolderCases} | ${g.playerCultivationCases} | ${g.npcCoreHolderCases} | ${g.npcCultivationCases} | ${g.upperTierCases} | ${g.maxPlots} |`);
 fs.writeFileSync(out+'.md',['# Garden opportunity audit','',summary.scope,'',summary.reference.scope,'',`${summary.reference.pairs.length} exact Game/row/all23/RNG/native-counter reference replays; ${report.controls.length} actual on/off observer controls. Counts below are campaigns, not rates of usefulness.`,'','| Policy | Iteration cap | Cases | Ended/capped | Player core offered | Track core acquired | Core held | Player cast | NPC core held | NPC cast | Upper tier | Max beds |','| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',...rows,'','Raw unknown/excluded identities, sheet sources, class observations, sub-gate queries and existing food/cost accounting remain in the JSON/raw report. Sampled holder-days are coverage, not use or benefit.',''].join('\n'),{flag:'wx'});
 console.log(JSON.stringify({cases:summary.cases.length,replays:summary.reference.pairs.length,controls:report.controls.length,groups:summary.groups}));
}catch(e){console.error(e.stack);process.exitCode=1;}
