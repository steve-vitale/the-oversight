'use strict';
const fs=require('fs'),z=require('zlib'),crypto=require('crypto'),F=require('../phone-frame-proof-update');
const dir='evidence/2026-10-29/earned-evolution-r1',sha=b=>crypto.createHash('sha256').update(b).digest('hex'),same=require('util').isDeepStrictEqual;
const saved=p=>JSON.parse(p.origins[0].localStorage.find(e=>e.name.startsWith('scattering-save-v1-')).value);
function verify(root,r){
 const errors=[],check=(v,m)=>{if(!v)errors.push(m);},source=F.expectedInputs(root),initial=saved(JSON.parse(z.gunzipSync(fs.readFileSync(root+'/'+dir+'/actual-pending-profile.json.gz')))),seen=new Set();
 check(same(r.source,source),'stale runtime');check(r.fixtureSha256===sha(fs.readFileSync(root+'/'+dir+'/actual-pending-profile.json.gz')),'changed original fixture');check(r.driverSha256===sha(fs.readFileSync(root+'/scripts/mobile-native-journey.cjs')),'changed native driver');check(r.recipeSha256===sha(fs.readFileSync(root+'/'+dir+'/replay.cjs')),'changed recipe');
 for(const row of r.rows||[]){
  const {height,stage,final:f,recovery:c}=row,id=height+':'+stage;check(!seen.has(id),'duplicate scene');seen.add(id);
  check(f?.ok&&f.sourceStable&&f.classification==='prepared-replay','failed or unclassified scene');check(same(c?.expected,source)&&same(c?.responses,source),'actual response bytes');check(same(c?.saved?.scholar,c?.restored?.scholar)&&same(c?.saved?.codex,c?.restored?.codex),'whole initial Continue');
  check(f?.touches?.length>0&&f.touches.every(t=>t.trusted&&t.type==='touch'),'trusted touch');check(f?.controls?.length>0&&f.controls.every(c=>c.box&&c.box.x>=0&&c.box.y>=0&&c.box.x+c.box.width<=390&&c.box.y+c.box.height<=height),'onscreen controls');check(f?.errors?.length===0,'browser errors');check(same(f?.saved?.scholar,f?.live?.scholar)&&same(f?.saved?.codex,f?.live?.codex),'whole immediately durable state');
  const s=f?.saved?.scholar;if(!s){errors.push('missing actual save');continue;}
  if(stage==='green'||stage==='green-cold'){check(s.abilities.some(a=>a.id==='system_utility__sovereign'&&a.evolvedFrom==='green_thumb'&&a.level===3),'lost Green Sovereign');check(s.kcal===initial.scholar.kcal-20,'actual paid root action');check(row.views.some(v=>/Ask the Plants/.test(v.text))||stage==='green-cold','retained action offered');}
  if(stage==='defer'){check(s.evolutionDeferred===true&&s.pendingEvolution==='green_thumb'&&s.evolutionChoices?.length===2,'lost deferred choice');}
  if(stage==='deferred-cold-reopen'||stage==='hearth-cold'){check(s.abilities.some(a=>a.id==='system_utility__hearth'&&a.evolvedFrom==='green_thumb'&&a.level===3),'lost Hearth King');check(!s.pendingEvolution,'unconsumed choice');}
  if(['defer','deferred-cold-reopen','hearth-cold'].includes(stage))for(const k of ['day','dayTicks','kcal','health','water'])check(same(s[k],initial.scholar[k]),'free choice cost '+k);
  if(stage==='green'){try{const chosen=saved(row.stepProfiles[1]).scholar;for(const k of ['day','dayTicks','kcal','health','water'])check(same(chosen[k],initial.scholar[k]),'free immediate pick '+k);}catch(e){errors.push('missing actual immediate pick profile');}}
  if(['green-cold','deferred-cold-reopen','hearth-cold'].includes(stage)){const priorStage=stage==='green-cold'?'green':stage==='deferred-cold-reopen'?'defer':'deferred-cold-reopen',prior=r.rows.find(x=>x.height===height&&x.stage===priorStage);try{check(prior&&same(saved(prior.profile),c.saved),'exact source profile cold transport');}catch(e){errors.push('invalid cold profile');}}
 }
 check(r.rows?.length===10,'ten journeys required');for(const h of [736,844])for(const stage of ['green','green-cold','defer','deferred-cold-reopen','hearth-cold'])check(seen.has(h+':'+stage),'missing phone scene');return{ok:errors.length===0,errors};
}
function read(root){return JSON.parse(z.gunzipSync(fs.readFileSync(root+'/'+dir+'/native-r4-report.json.gz')));}
module.exports={verify,read};
if(require.main===module)require('./retain-phone-report').runCLI(dir+'/native-r4-report.json.gz',verify);
