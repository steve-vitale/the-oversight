'use strict';
const assert=require('assert/strict'),fs=require('fs'),z=require('zlib'),{spawnSync}=require('child_process'),K=require('./lib');
const mode=process.argv[2],kind=process.argv[3]||'relic';
const fixture=K.ROOT+'/evidence/2026-10-29/relic-choice-save-r1/day12-after-jacket-evolution-profile-r1.json.gz';
async function child(){
 const profile=JSON.parse(z.gunzipSync(fs.readFileSync(fixture))),disk=new Map(profile.origins[0].localStorage.map(r=>[r.name,r.value]));let armed=false,writes=0;
 const emit=()=>console.log('CHOICE_DISK '+JSON.stringify(Object.fromEntries(disk)));
 globalThis.localStorage={get length(){return disk.size;},key:i=>[...disk.keys()][i]??null,getItem:k=>disk.get(k)??null,removeItem:k=>disk.delete(k),setItem(k,v){
  const run=k.startsWith('scattering-save-v1-');if(armed&&run&&mode==='commit-before')process.exit(77);if(armed&&run&&mode==='quota')throw Error('prepared quota refusal');
  disk.set(k,String(v));if(armed&&run){writes++;emit();if(mode==='commit-after')process.exit(77);}
 }};
 if(mode==='recover'){
  const input=JSON.parse(fs.readFileSync(0,'utf8'));disk.clear();for(const[k,v]of Object.entries(input.disk))disk.set(k,v);
  const G=await K.load({seed:7003,narration:true}),key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-')),raw=disk.get(key),saved=JSON.parse(raw);
  assert.equal(G.load(key),true);assert.equal(disk.get(key),raw);assert.deepEqual(G.state.scholar,saved.scholar);assert.deepEqual(G.state.codex,saved.codex);
  const item=G.relicItems().find(r=>(r.itemId||r.id)==='denim_jacket');assert.equal(!!item.enhancements?.includes('stay_put'),input.complete);assert.equal(G.state.scholar.relicChoices===null,input.complete);return;
 }
 const read=fs.readFileSync;if(mode==='removed')fs.readFileSync=function(file,...args){let v=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/timeSettlement.js')){const before=String(v),after=before.replace(/for\(const \[name,field\]of \[\['chooseRelicEnhancement'[^\n]+\]\]\)/,"for(const [name,field]of [])");assert.notEqual(before,after,'actual choice hook missing');v=typeof v==='string'?after:Buffer.from(after);}return v;};
 let G;try{G=await K.load({seed:7003,narration:true});}finally{fs.readFileSync=read;}
 const key=[...disk.keys()].find(k=>k.startsWith('scattering-save-v1-'));assert.equal(G.load(key),true);const s=G.state.scholar;let method='chooseRelicEnhancement',args=['stay_put'],field='relicChoices';
 if(kind!=='relic'){
  s.relicChoices=null;s.levelUpQueue=[];const def=G.data.abilities.find(a=>a.id==='haggle');assert(def);
  s.abilityChoices=[{...def,src:'level_up:social'}];field='abilityChoices';method=kind==='keep'?'keepAbilities':'chooseAbility';args=kind==='keep'?[]:['haggle'];
  if(kind==='knack'){s.abilities=[];s.knackChosen=false;s.knackChoices=G.knackChoicesFor(G.vpOf(G.villagerId));assert(s.knackChoices.length);method='chooseKnack';field='knackChoices';args=[s.knackChoices[0].id];}
 }
 if(mode==='invalid'){args=['not-an-offered-choice'];if(kind==='keep')s.abilityChoices[0].src='arrival';}
 if(mode==='legacy-invalid'){assert.equal(kind,'knack');s.knackChoices=[{id:'still_hands',name:'Old human skill'}];args=['not-an-offered-choice'];}
 if(mode==='full'){const max=G.abilitySlots();s.abilities=G.data.abilities.filter(a=>a.lane==='magic'&&a.id!=='haggle').slice(0,max).map(a=>({id:a.id,name:a.name,level:1,xp:0}));assert.equal(s.abilities.length,max);s.abilityChoices[0].src='arrival';}
 if(mode==='next')s.levelUpQueue=[{track:'field',level:2,xp:120}];
 assert.equal(G.save(),true);const prior=disk.get(key);emit();armed=true;
 if(['nested','throw'].includes(mode)){const say=G.say;G.say=function(...xs){const r=say.apply(this,xs);assert.equal(this.save(),'deferred');assert.equal(disk.get(key),prior);if(mode==='throw')throw Error('prepared selection tail failure');return r;};}
 if(mode==='throw'){assert.throws(()=>G[method](...args),/prepared selection tail failure/);assert.equal(disk.get(key),prior);assert.equal(G.save(),'settlement_failed');return;}
 G[method](...args);
 if(['invalid','legacy-invalid','full','quota'].includes(mode)){assert.equal(disk.get(key),prior,'refused or failed save changed durable bytes');assert.equal(writes,0);return;}
 const saved=JSON.parse(disk.get(key));assert.notDeepEqual(saved.scholar[field],JSON.parse(prior).scholar[field],'chosen offer must be immediately durable');assert.deepEqual(saved.scholar,G.state.scholar);assert.deepEqual(saved.codex,G.state.codex);assert.equal(writes,1,'one final checkpoint');
 if(kind==='relic'){const item=G.relicItems().find(r=>(r.itemId||r.id)==='denim_jacket');assert(item.enhancements.includes('stay_put'));assert.equal(saved.scholar.relicChoices,null);}
 if(mode==='next'){assert(s.abilityChoices?.length,'next real queued offer remains');assert(s.abilityChoices.every(c=>c.src==='level_up:field'));}
 if(kind==='relic'){const paid=disk.get(key);G[method](...args);assert.equal(writes,1);assert.equal(disk.get(key),paid);}
}
async function main(){
 if(mode)return child();let cold=0;const cases=[['complete','relic'],['complete','ability'],['complete','knack'],['complete','keep'],['invalid','relic'],['invalid','ability'],['invalid','knack'],['invalid','keep'],['legacy-invalid','knack'],['full','ability'],['next','ability'],['next','keep'],['nested','relic'],['throw','relic'],['quota','relic'],['commit-before','relic'],['commit-after','relic']];
 const run=(m,k,input)=>spawnSync(process.execPath,[__filename,m,k||'relic'],{encoding:'utf8',input,maxBuffer:40e6});
 for(const[m,k]of cases){const r=run(m,k);assert.equal(r.status,m.startsWith('commit-')?77:0,r.stderr||r.stdout.slice(-1800));if(m.startsWith('commit-')){const disk=JSON.parse(r.stdout.split('\n').filter(s=>s.startsWith('CHOICE_DISK ')).at(-1).slice(12));const recovered=run('recover','relic',JSON.stringify({disk,complete:m==='commit-after'}));assert.equal(recovered.status,0,recovered.stderr||recovered.stdout.slice(-1800));cold++;}}
 const removed=run('removed','relic');assert.notEqual(removed.status,0);assert(/chosen offer must be immediately durable/.test(removed.stderr),removed.stderr.slice(-1800));
 console.log('Earned choice settlement: '+cases.length+' scenarios, '+cold+' fresh-process recoveries and actual removed-hook rejection passed');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
