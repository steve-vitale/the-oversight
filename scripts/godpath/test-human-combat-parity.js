'use strict';
const K=require('./lib'),T=K.reporter('human combat parity');
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process'),assert=require('assert');
(async()=>{
  // Reuse the retained real-caller fixture, not its old result. Each child
  // loads exactly one actual shared Game. The frozen parent has25 failures.
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-parity-')),out=path.join(temp,'callers.json');
  try{
    const run=cp.spawnSync(process.execPath,[path.join(K.ROOT,'scripts/lib/human-parity-callers.js'),K.ROOT,out],{encoding:'utf8',timeout:60000});
    if(run.status!==0)throw Error(run.stderr||run.stdout||'Caller fixture failed');
    const report=JSON.parse(fs.readFileSync(out));assert.strictEqual(report.cases.length,6);
    for(const c of report.cases)for(const [label,value]of Object.entries(c.checks))T.ok(c.label+': '+label,value);
  }finally{if(fs.existsSync(out))fs.unlinkSync(out);fs.rmdirSync(temp);}
  // Browser storage surface only; Game.save/load and serialization stay real.
  const storage=new Map();globalThis.localStorage={
    getItem:k=>storage.has(String(k))?storage.get(String(k)):null,
    setItem:(k,v)=>storage.set(String(k),String(v)),removeItem:k=>storage.delete(String(k)),
    key:i=>[...storage.keys()][i]??null,get length(){return storage.size;},
  };
  const G=await K.load({seed:7,narration:true}),S=globalThis.Scattering;
  function fresh(){
    G.tbfight=null;K.newRun(G,'Dakar, Senegal');
    const v=G.state.village,s=G.state.scholar,ids=v.roster.filter(id=>id!==G.villagerId&&G.vpOf(id)).slice(0,6);
    assert.strictEqual(ids.length,6);v.roster=[G.villagerId,...ids];v.party=[];v.followers=[];v.positions={};v.health={};
    for(const id of ids){v.positions[id]={mx:8,my:8};v.health[id]=80;}
    s.mx=1;s.my=4;s.health=100;s.monster={id:'dustboar',mx:7,my:4};
    const floor=G.genDetail(G.map.px,G.map.py);for(let y=0;y<9;y++)for(let x=0;x<9;x++)floor[y][x]='hall';
    // Only pause opening scheduling; actual constructors/actions remain real.
    G.tbBeginTurn=function(){};
    return {v,s,ids,floor};
  }
  let c=fresh(),id=c.ids[0];c.v.health[id]=63.5;
  T.ok('factory preserves fractional persistent health',G.tbHumanFighter(id,'villager',{mx:2,my:4}).hp===63.5);
  c.v.health[id]=0;T.ok('zero-health people cannot enter',G.tbHumanFighter(id,'hostile',{mx:2,my:4})===null);
  c.v.health[id]=80;G.vpOf(id).dead=true;
  T.ok('dead-marked roster people cannot re-enter at positive HP',G.tbHumanFighter(id,'villager',{mx:2,my:4})===null);
  G.vpOf(id).dead=false;c.v.roster.push('prepared_missing_identity');
  T.ok('unknown roster entries cannot manufacture human fighters',G.tbHumanFighter('prepared_missing_identity','villager',{mx:2,my:4})===null);
  delete c.v.health[id];T.ok('only absent health defaults to100',G.tbHumanFighter(id,'villager',{mx:2,my:4}).hp===100);
  c.v.roster.push(G.villagerId);T.ok('the bearer cannot also enter as an NPC',G.tbHumanFighter(G.villagerId,'villager',{mx:2,my:4})===null);
  c.v.roster=c.ids;c.v.health[id]=80;c.v.positions[id]={mx:2,my:4};G.startCombat('dustboar');
  let ally=G.tbfight.fighters.find(f=>f.villagerId===id);assert(ally);
  G.tbDamage(ally.key,5,'prepared contact',null,{quiet:true,undodgeable:true});const wounded=ally.hp;
  G.tbEnd('fled');G.startCombat('dustboar');ally=G.tbfight.fighters.find(f=>f.villagerId===id);
  T.ok('actual fled fight re-entry retains the wound',ally&&ally.hp===wounded&&c.v.health[id]===wounded);
  // Direct HP-changing support verbs must persist at end too, even if the
  // fighter fled (position sync intentionally excludes fled fighters).
  ally.hp+=2;ally.fled=true;const healed=ally.hp;G.tbEnd('fled');
  T.ok('terminal sync retains healing and fled people',c.v.health[id]===healed);
  c=fresh();id=c.ids[0];c.v.betrayalWounds={[id]:23};G.startBetrayalCombat(id,{aggressor:'player'});
  let hostile=G.tbfight.fighters.find(f=>f.kind==='hostile');assert(hostile);
  T.ok('old saved betrayal wounds are honored',hostile.hp===23);
  hostile.hp=29;hostile.yielded=true;G.tbEnd('betrayal_yielded');
  T.ok('yield saves healed HP without a stale second cap',c.v.health[id]===29&&c.v.betrayalWounds[id]===undefined);
  G.startBetrayalCombat(id,{aggressor:'player'});hostile=G.tbfight.fighters.find(f=>f.kind==='hostile');
  T.ok('yield re-entry uses the same persistent body',hostile&&hostile.hp===29);
  c=fresh();id=c.ids[0];
  const armor=G.data.items.find(i=>i.armor?.protection>=20&&!i.fullBody),weapon=G.data.items.find(i=>i.weapon?.bonus>=10);assert(armor&&weapon);
  const person=G.vpOf(id);person.items=[armor.id,weapon.id];person.equipped={torso:{itemId:armor.id},melee:{itemId:weapon.id}};
  G.startBetrayalCombat(id,{aggressor:'player'});hostile=G.tbfight.fighters.find(f=>f.kind==='hostile');assert(hostile);
  const protection=hostile.varmor;hostile.varmor=0;let before=hostile.hp;G.tbDamage(hostile.key,20,'prepared contact',null,{quiet:true,undodgeable:true});const bare=before-hostile.hp;
  hostile.hp=before;hostile.varmor=protection;G.tbDamage(hostile.key,20,'prepared contact',null,{quiet:true,undodgeable:true});
  T.ok('real local-hostile worn armor absorbs actual keyed damage',protection>0&&before-hostile.hp<bare&&c.v.health[id]===hostile.hp);
  hostile.hp=80;hostile._talked=true;hostile._begged=true;hostile.mx=2;hostile.my=4;
  const p=G.tbFighter('p'),roll=S.combat.roll;let strike;
  const damage=G.tbDamage;G.tbDamage=function(key,n,label,source,opts){if(source===hostile.key)strike={key,n};return damage.apply(this,arguments);};
  try{S.combat.roll=range=>range[0];G.tbHostileTurn(hostile);}finally{S.combat.roll=roll;G.tbDamage=damage;}
  T.ok('real hostile strike delivers its worn weapon half-bonus',strike?.key===p.key&&strike.n===6+Math.round(hostile.wbonus/2));
  // A saved fight is not rebuilt with a new constructor/default HP.
  const saveKey=S.state.saveKey(G.state),saveHp=hostile.hp;G.save();const loaded=G.load(saveKey),restored=G.tbFighter(hostile.key);
  T.ok('actual mid-fight save/load retains human HP and gear',loaded&&restored&&restored.hp===saveHp&&restored.wbonus===hostile.wbonus&&restored.varmor===hostile.varmor,JSON.stringify({loaded,saveHp,key:hostile.key,oldWeapon:hostile.wbonus,oldArmor:hostile.varmor,restored:restored&&{hp:restored.hp,wbonus:restored.wbonus,varmor:restored.varmor},savedKey:saveKey,tail:G.log?.slice(-3)}));
  c=fresh();id=c.ids[0];c.v.positions[id]={mx:2,my:4};G.startCombat('dustboar');
  const monster=G.tbfight.fighters.find(f=>f.kind==='monster');ally=G.tbfight.fighters.find(f=>f.villagerId===id);assert(monster&&ally);
  c.floor[4][2]='door';G.tbPlaceHumans(G.tbfight.fighters,8);
  T.ok('actual entrants leave door tiles clear',!(ally.mx===2&&ally.my===4)&&c.floor[ally.my][ally.mx]!=='door');
  const bigDef=G.data.monsters.find(m=>m.size>=2);assert(bigDef);monster.mdef=bigDef;monster.mx=4;monster.my=4;ally.mx=5;ally.my=5;G.tbPlaceHumans(G.tbfight.fighters,8);
  T.ok('placement respects every occupied tile of a large body',!G.fighterTiles(monster).some(([x,y])=>x===ally.mx&&y===ally.my));
  // Full9-grid: no overlap fallback. Extended titan grid: real extra cells
  // remain available under the same placement rule.
  c=fresh();G.startCombat('dustboar');for(let y=0;y<9;y++)for(let x=0;x<9;x++)c.floor[y][x]='wall';
  c.floor[4][1]='hall';const m=G.tbfight.fighters.find(f=>f.kind==='monster');c.floor[m.my][m.mx]='hall';
  G._titanTest.titanState().musters.herald={allies:[],haven:[{vid:c.ids[0]}]};G.titanInjectAllies('herald');
  T.ok('a full9-grid does not inject a wall/overlap fallback',!G.tbfight.fighters.some(f=>f.kind==='ally'));
  G.tbfight.gridSize=12;G.titanInjectAllies('herald');ally=G.tbfight.fighters.find(f=>f.kind==='ally');
  T.ok('actual12-grid injection can use extended legal cells',ally&&(ally.mx>8||ally.my>8)&&G.tbCanOccupy(ally,ally.mx,ally.my));
  c=fresh();id=c.ids[0];c.v.positions[id]={mx:2,my:4};G.startCombat('dustboar');
  G._titanTest.titanState().musters.herald={allies:[],haven:[{vid:id},{vid:c.ids[4]}]};G.titanInjectAllies('herald');G.titanInjectAllies('herald');
  T.ok('nearby/party/coalition enrollment remains one person',G.tbfight.fighters.filter(f=>f.villagerId===id).length===1&&G.tbfight.fighters.filter(f=>f.villagerId===c.ids[4]).length===1);
  T.ok('injected people are in turn order exactly once',G.tbfight.fighters.filter(f=>f.kind==='ally').every(f=>G.tbfight.order.filter(k=>k===f.key).length===1));
  c=fresh();const home=G.state.otherVillages[0];G.genVillageRoster(home);const foreign=home.roster.find(x=>x.alive);assert(foreign);
  G.startCombat('dustboar');const muster={allies:[{vid:foreign.id,villageId:home.id,name:foreign.name,hp:57,wbonus:17,varmor:13}],haven:[]};G._titanTest.titanState().musters.herald=muster;
  const havenBefore=JSON.stringify(c.v.health);G.titanInjectAllies('herald');let blade=G.tbfight.fighters.find(f=>f.villageId===home.id);assert(blade);
  T.ok('foreign coalition HP and outfitting retain authored values',blade.hp===57&&blade.wbonus===17&&blade.varmor===13);
  G.tbDamage(blade.key,8,'prepared contact',null,{quiet:true,undodgeable:true});const foreignHp=blade.hp;
  T.ok('foreign wounds update own home and muster without touching Haven',foreign.health===foreignHp&&muster.allies[0].hp===foreignHp&&JSON.stringify(c.v.health)===havenBefore);
  G.tbEnd('fled');G.startCombat('dustboar');G.titanInjectAllies('herald');blade=G.tbfight.fighters.find(f=>f.villageId===home.id);
  T.ok('foreign re-entry retains wounds rather than resetting to100',blade&&blade.hp===foreignHp);
  c=fresh();id=c.ids[0];c.v.positions[id]={mx:2,my:4};G.startCombat('dustboar');ally=G.tbfight.fighters.find(f=>f.villagerId===id);assert(ally);
  K.giveAbility(G,'lifeline',{force:true});G.tbDamage(ally.key,10000,'prepared lethal contact',null,{quiet:true,undodgeable:true});
  T.ok('wound persistence runs after real Lifeline prevention',ally.alive&&ally.hp===1&&c.v.health[id]===1);
  G.tbDamage(ally.key,10000,'prepared second lethal contact',null,{quiet:true,undodgeable:true});
  T.ok('actual death persists zero and removes the person',!ally.alive&&c.v.health[id]===0&&!c.v.roster.includes(id));
  G.tbEnd('fled');T.ok('a fallen person cannot re-enter',G.tbHumanFighter(id,'villager',{mx:2,my:4})===null);
  c=fresh();id=c.ids[0];c.v.positions[id]={mx:2,my:4};c.v.roster=[G.villagerId,id];c.v.party=[id];G.startCombat('dustboar');
  const oldNpc=G.tbfight.fighters.find(f=>f.villagerId===id);assert(oldNpc);
  G.playerDeath('prepared parity mantle');const newHealth=G.state.scholar.health;oldNpc.hp=1;G.tbSyncHumanHealth(oldNpc);
  T.ok('real succession cannot be overwritten by a stale NPC fighter',G.villagerId===id&&G.state.scholar.health===newHealth&&newHealth>1);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
