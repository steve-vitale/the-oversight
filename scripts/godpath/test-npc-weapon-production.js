'use strict';
// Canonical own-material production, earned progression and actual grant source.
const assert=require('assert/strict'),fs=require('fs'),cp=require('child_process'),K=require('./lib'),A=require('../gear-usage-audit');
const mode=process.argv[2]||'normal';
async function child(){
 const read=fs.readFileSync;
 if(mode==='removed-engine')fs.readFileSync=function(file,...args){let value=read.call(this,file,...args);if(String(file).replace(/\\/g,'/').endsWith('/src/js/villager-build.js')){const before=String(value),after=before.replace("this.creditDeed(vid, 'crafting'); // actual weapon production",'/* actual weapon deed removed */');assert.notEqual(after,before);value=typeof value==='string'?after:Buffer.from(after);}return value;};
 let G;try{G=await K.load({seed:31031});}finally{fs.readFileSync=read;}
 const fixed=(n,fn)=>{const r=Math.random;Math.random=()=>n;try{return fn();}finally{Math.random=r;}};
 function fresh(){
  G.over=false;G.won=false;G.tbfight=null;K.newRun(G);const s=G.state.scholar,v=G.state.village;
  const [id,other]=v.roster.filter(x=>x!==G.villagerId&&G.npcAge(x)>=18),p=G.getPerson(id);assert(id&&other);
  v.roster=[G.villagerId,id,other];v.away={};v.armory=[];v.wood=0;v.health={[id]:100,[other]:100};v.npcDeedDay={};v.weaponCraft={[id]:{hunting_spear:2}};v.weaponCraftCd={};
  v.pantry=[{name:'Prepared stores',units:100,kcalEach:500,spoilDay:9999,safe:true}];v.water={clean:100};v.party=[];v.followers=[];
  p.items=[];p.equipped={};p.stashed=[];p.dead=false;const q=G.getPerson(other);q.items=['stone_knife'];q.equipped={melee:{itemId:'stone_knife'}};q.stashed=[];
  for(const who of [id,other]){G.npcSetNode(who,v.px??4,v.py??4);Object.assign(G.npcNeeds(who),{energy:90,hunger:0});Object.assign(G.objOf(who),{kind:'REST',purpose:'rest',indoor:true,state:'indoor',partsLeft:9});G.npcXp(who);}
  Object.assign(s,{day:85,dayTicks:128,actionClock:0,kcal:2400,health:100,hydration:100,monster:null,animal:null});G.dayPart=1;G.worldMonsters().length=0;G.pendingEncounter=null;
  const recipe=G.data.recipes.find(r=>r.id==='hunting_spear'),entries=Object.entries(recipe.materials),[own,n]=entries[0];
  p.items.push({material:own,units:n});G.stashState().materials=Object.fromEntries(entries.slice(1));
  return{s,v,id,other,p,recipe};
 }
 let c=fresh();
 if(mode==='audit-neutral-on'||mode==='audit-neutral-off'){
  const audit=require('../audit-npc-work'),report=audit.createReport(31031,mode==='audit-neutral-on');if(report.observed)audit.install(G,report);
  const made=G.villagerWeaponCraftDay(),repeat=G.villagerWeaponCraftDay();
  if(report.observed){assert.equal(report.weaponWork.length,2);assert(report.weaponWork[0].before.some(p=>p.id===c.id));assert(report.weaponWork[0].after.some(p=>p.id===c.id&&p.owned.items.some(i=>i.itemId==='hunting_spear')));}
  console.log('WEAPON_NEUTRAL '+JSON.stringify({made,repeat,state:A.gameplayHash(G.state),next:Math.random(),errors:[]}));return;
 }
 if(mode==='neutral-on'||mode==='neutral-off'){
  const observer=mode==='neutral-on'?A.install(G):null;observer?.sample();const made=G.villagerWeaponCraftDay(),repeat=G.villagerWeaponCraftDay();observer?.sample();
  console.log('WEAPON_NEUTRAL '+JSON.stringify({made,repeat,state:A.gameplayHash(G.state),next:Math.random(),errors:observer?.errors||[]}));return;
 }
 if(mode==='removed-observer')delete A.METHODS.villagerWeaponCraftDay;
 const observer=A.install(G),beforeHash=A.gameplayHash(G.state);observer.sample();assert.equal(A.gameplayHash(G.state),beforeHash,'sampling is read-only');assert.equal(observer.grants.length,0,'owned equipment is not earned again');
 const before=G.npcXp(c.id).craft,other=G.npcXp(c.other).craft,bearer=G.playerTracks().craft.xp,made=fixed(.1,()=>G.villagerWeaponCraftDay());assert.equal(made,1);
 assert(Object.values(c.p.equipped).some(e=>e.itemId==='hunting_spear'),'actual product is worn');
 assert(Object.keys(c.recipe.materials).every(m=>(G.stashState().materials[m]||0)===0));assert(!c.p.items.some(e=>e.material),'own material consumed first');
 if(mode!=='observer-only')assert.equal(G.npcXp(c.id).craft-before,G.trackData().deeds.crafting.n,'new weapon production must earn its maker the authored crafting deed');
 assert.equal(G.npcXp(c.other).craft,other);assert.equal(G.playerTracks().craft.xp,bearer);
 let grants=observer.grants.filter(g=>g.id==='hunting_spear');assert.equal(grants.length,1,'actual weapon duty needs its own observed craft grant');assert.equal(grants[0].source,'craft');assert.equal(grants[0].who,c.id);assert.equal(grants[0].n,1);
 const count=observer.grants.length,xp=G.npcXp(c.id).craft;assert.equal(G.villagerWeaponCraftDay(),0);assert.equal(observer.grants.length,count);assert.equal(G.npcXp(c.id).craft,xp,'cooldown/replay earns no extra deed');
 c=fresh();const failureStart=observer.grants.length,old=G.npcXp(c.id).craft;assert.equal(fixed(.99,()=>G.villagerWeaponCraftDay()),0);assert.equal(G.npcXp(c.id).craft,old);assert.equal(observer.grants.length,failureStart,'paid failure is not a grant');assert(Object.values(G.stashState().materials).every(n=>n===0));
 for(const reason of ['no-materials','no-knowledge','armed','dead','away']){
  c=fresh();if(reason==='no-materials'){c.p.items=[];G.stashState().materials={};}if(reason==='no-knowledge')c.v.weaponCraft[c.id]={};if(reason==='armed')c.p.items.push('stone_knife');if(reason==='dead')c.p.dead=true;if(reason==='away')c.v.away[c.id]={kind:'prepared-away'};
  const xp=G.npcXp(c.id).craft,start=observer.grants.length;assert.equal(fixed(.1,()=>G.villagerWeaponCraftDay()),0,reason);assert.equal(G.npcXp(c.id).craft,xp);assert.equal(observer.grants.length,start,reason+' cannot earn a product');
 }
 c=fresh();G.creditDeed(c.id,'crafting');G.creditDeed(c.id,'crafting');const cap=G.npcXp(c.id).craft;assert.equal(fixed(.1,()=>G.villagerWeaponCraftDay()),1);assert.equal(G.npcXp(c.id).craft,cap,'weapon production shares existing daily cap');assert.equal(c.v.npcDeedDay[c.id].crafting.n,2);
 c=fresh();const nestedStart=observer.grants.length;c.s.dayTicks=G.TIME.TICKS_PER_DAY-1;c.s.actionClock=0;G.dayPart=3;fixed(.1,()=>G.doAction('wait'));
 grants=observer.grants.slice(nestedStart).filter(g=>g.who===c.id&&g.id==='hunting_spear');assert.equal(grants.length,1,'actual dawn duty delivers one new weapon');assert.equal(grants[0].source,'craft','nested outer action must not steal the craft source');assert.equal(c.v.weaponCraftCd[c.id],85);
 assert.equal(observer.errors.length,0);console.log('NPC weapon production: real own/communal payment, wear, own deed/cap, refusal/failure and nested source passed');
}
(async()=>{
 if(mode!=='normal')return child();const run=m=>cp.spawnSync(process.execPath,[__filename,m],{encoding:'utf8',timeout:120000,maxBuffer:6e6});const main=run('current');assert.equal(main.status,0,main.stderr||main.stdout);
 const pair=['neutral-off','neutral-on'].map(m=>{const r=run(m);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout.split('\n').find(s=>s.startsWith('WEAPON_NEUTRAL ')).slice(15));});assert.deepEqual(pair[0],pair[1],'observer preserves actual returns, whole state and next RNG');
 const auditPair=['audit-neutral-off','audit-neutral-on'].map(m=>{const r=run(m);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout.split('\n').find(s=>s.startsWith('WEAPON_NEUTRAL ')).slice(15));});assert.deepEqual(auditPair[0],auditPair[1],'shared call-chain audit preserves actual returns, whole state and next RNG');
 for(const [m,reason]of [['removed-engine','new weapon production must earn its maker'],['removed-observer','actual weapon duty needs its own observed craft grant']]){const r=run(m);assert.notEqual(r.status,0);assert(r.stderr.includes(reason),r.stderr);}
 console.log(main.stdout.trim());console.log('Actual deed/observer removal controls reject missing behavior; independent observer-neutral pair passed');
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
