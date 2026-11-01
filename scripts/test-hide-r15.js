#!/usr/bin/env node
'use strict';
// Prepared armor-uptake contrasts. Every case has one fresh shared runtime;
// combat uses actual bearer capacity and equal incoming attacks, not 5,000 HP.
const K=require('./godpath/lib'),a=require('assert/strict'),cp=require('child_process'),crypto=require('crypto');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function giveMaterials(G,n){for(let i=0;i<n;i++)G.state.scholar.inventory.push({plantId:'animal_hide',material:'hide',name:'Hide',units:1,kg:1,kcalEach:0});G.state.scholar.inventory.push({material:'vine',name:'Vine',units:1,kg:0.1,kcalEach:0});}
function recipe(G,level){G.state.codex.recipes=G.state.codex.recipes||{};G.state.codex.recipes.hide_armor={level,learnedDay:1,learnedFrom:'prepared-test',via:'discovery'};}
function owns(G){const s=G.state.scholar;return [...Object.values(s.equipped||{}),...s.inventory].some(x=>x&&(x.itemId||x.id)==='hide_armor');}
async function caseRun(mode){
 const seed={off:51001,parent:51001,l0:51002,craft:51003,recraft:51004,sweep:51005,bare:61001,armor:61001}[mode];a(seed);
 const G=await K.load({seed,narration:true}),s=K.newRun(G),bearer=G.villagerId,hide=require('./policies/hide'),checks=[],ctx={};
 const check=(name,condition,details)=>checks.push({name,condition:!!condition,details});
 delete process.env.HIDE_R15;
 if(mode==='off'||mode==='parent'){
  recipe(G,1);giveMaterials(G,2);const policy=mode==='off'?hide.belonghide:require('./policies/belongseek').belongseek;
  for(let i=0;i<3;i++)policy.upkeep(G,ctx);
  check('gate off: no hide craft attempt',ctx.hideCraftAttempts===undefined);
  check('gate off: no phantom armor',!owns(G));
  check('gate off: recipe remains L1',s&&G.state.codex.recipes.hide_armor.level===1);
  check('gate off: inventory contains no free hide armor',!s.inventory.some(x=>(x.itemId||x.id)==='hide_armor'));
  return{mode,seed,checks,stateHash:hash(G.state),contextHash:hash(ctx),nextRandom:Math.random()};
 }
 if(['l0','craft','recraft','sweep'].includes(mode))process.env.HIDE_R15='1';
 if(mode==='l0'){
  G.state.codex.recipes=G.state.codex.recipes||{};delete G.state.codex.recipes.hide_armor;giveMaterials(G,2);
  for(let i=0;i<3;i++)hide.belonghide.upkeep(G,ctx);
  check('L0: unseen recipe never crafts or grants armor',ctx.hideCraftAttempts===undefined&&!owns(G));
 }else if(mode==='craft'){
  recipe(G,1);giveMaterials(G,4);
  const payments=[],craft=G.craft,count=mat=>s.inventory.filter(x=>x.material===mat).reduce((n,x)=>n+x.units,0);
  G.craft=function(...args){const before={hide:count('hide'),vine:count('vine')},result=craft.apply(this,args);payments.push({success:!!result,hide:before.hide-count('hide'),vine:before.vine-count('vine')});return result;};
  for(let day=1;day<=10&&!owns(G);day++){s.day=day;hide.belonghide.upkeep(G,ctx);if(!owns(G))giveMaterials(G,2);}
  check('blind craft actually attempted',ctx.hideCraftAttempts>=1,ctx);
  check('blind craft succeeds within ten prepared attempt days',owns(G));
  check('successful practice teaches L2',G.state.codex.recipes.hide_armor.level>=2);
  check('inherited gearUp wears crafted armor in torso',s.equipped?.torso?.itemId==='hide_armor');
  check('crafted worn armor provides P20',G.armorBonus()===20,G.armorBonus());
  check('successful armor pays two actual hides and one vine',payments.some(x=>x.success)&&payments.filter(x=>x.success).every(x=>x.hide===2&&x.vine===1),payments);
 }else if(mode==='recraft'){
  recipe(G,2);giveMaterials(G,2);s.day=30;hide.belonghide.upkeep(G,ctx);
  check('replacement setup actually acquired first armor',owns(G),ctx);
  for(const key of Object.keys(s.equipped||{}))if((s.equipped[key]?.itemId||s.equipped[key]?.id)==='hide_armor')delete s.equipped[key];
  s.inventory=s.inventory.filter(x=>(x.itemId||x.id)!=='hide_armor');check('lost armor actually removed',!owns(G));
  giveMaterials(G,2);s.day=31;hide.belonghide.upkeep(G,ctx);check('lost armor is crafted again',owns(G)&&ctx.hideArmorCrafted>=2,ctx);
 }else if(mode==='sweep'){
  s.mx=4;s.my=4;const body=G.registerDeath({kind:'animal',monsterId:'deer',name:'Deer',mx:4,my:4,cause:'prepared-loot-scene'});a(body?.id);
  const before=body.items.filter(x=>x.material==='hide').reduce((n,x)=>n+x.units,0);a(before>0,'Real registered animal body must own generated hide');
  const prior=s.inventory.filter(x=>x.material==='hide').reduce((n,x)=>n+x.units,0);hide.hideUpkeep(G,ctx);
  const after=s.inventory.filter(x=>x.material==='hide').reduce((n,x)=>n+x.units,0),remaining=body.items.filter(x=>x.material==='hide').reduce((n,x)=>n+x.units,0);
  check('actual animal corpse transfers hide into pack',after-prior===before&&remaining===0,{before,prior,after,remaining});
  check('successful hide transfer is counted honestly',ctx.hidesSwept>=1,ctx);
 }else if(mode==='bare'||mode==='armor'){
  s.equipped={};if(mode==='armor')s.equipped.torso={itemId:'hide_armor',name:'Hide armor'};
  const grid=G.genDetail(G.map.px,G.map.py);for(const row of grid)row.fill('dirt');
  const m=K.fight(G,'review_drone',{px:3,py:4,mx:4,my:4}),f=G.tbfight,p=G.tbFighter('p');a(m&&f&&p);const startingHp=p.hp,hits=[],damage=G.tbDamage;
  G.tbDamage=function(key,amount,...rest){const before=p.hp,result=damage.call(this,key,amount,...rest);if(key==='p'&&before>p.hp)hits.push({requested:amount,debit:before-p.hp,source:rest[1],name:rest[0]});return result;};
  let waits=0;while(G.tbfight===f&&!f.over&&p.alive&&G.villagerId===bearer&&hits.length<2&&waits<30){a(G.tbIsPlayerTurn());G.tbPlayerWait();waits++;}
  check(mode+': two actual incoming attacks reach the real body',hits.length===2,{hits,waits});
  check(mode+': same living bearer at normal capacity',G.villagerId===bearer&&G.state.scholar===s&&p.alive&&p.hp>0&&startingHp===100&&p.maxHp===100&&s.health===p.hp,{startingHp,hp:p.hp,max:p.maxHp,health:s.health});
  check(mode+': canonical worn protection',G.armorBonus()===(mode==='armor'?20:0));
  return{mode,seed,checks,hits,waits,hp:p.hp,startingHp,protection:G.armorBonus()};
 }
 return{mode,seed,checks,ctx,protection:G.armorBonus()};
}
if(process.argv[2]==='--child')caseRun(process.argv[3]).then(r=>console.log('HIDE_RESULT '+JSON.stringify(r))).catch(e=>{console.error(e.stack);process.exitCode=1;});
else{
 const T=K.reporter('Hide armor uptake and real incoming hits'),rows={};
 for(const mode of ['off','parent','l0','craft','recraft','sweep','bare','armor']){
  const child=cp.spawnSync(process.execPath,[__filename,'--child',mode],{cwd:K.ROOT,encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024});a.equal(child.status,0,child.stderr+'\n'+child.stdout);
  const lines=child.stdout.split('\n').filter(x=>x.startsWith('HIDE_RESULT '));a.equal(lines.length,1);const r=rows[mode]=JSON.parse(lines[0].slice(12));console.log(JSON.stringify(r));for(const c of r.checks)T.ok(c.name,c.condition,JSON.stringify(c.details));
 }
 T.ok('disabled layer exactly delegates: whole state, context and next RNG draw',rows.off.stateHash===rows.parent.stateHash&&rows.off.contextHash===rows.parent.contextHash&&rows.off.nextRandom===rows.parent.nextRandom);
 const bare=rows.bare,armor=rows.armor;
 T.ok('both arms resolve the same incoming attack requests and cadence',JSON.stringify(bare.hits.map(x=>[x.requested,x.source,x.name]))===JSON.stringify(armor.hits.map(x=>[x.requested,x.source,x.name]))&&bare.waits===armor.waits);
 T.ok('P20 reduces every actual corresponding hit',bare.hits.length===2&&armor.hits.length===2&&armor.hits.every((h,i)=>h.debit>0&&h.debit<bare.hits[i].debit));
 T.ok('total real HP debit is lower with worn armor',bare.startingHp-bare.hp>armor.startingHp-armor.hp&&armor.startingHp-armor.hp>0);
 T.done();
}
