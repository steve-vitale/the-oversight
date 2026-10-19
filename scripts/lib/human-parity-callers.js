'use strict';
// Current caller fixture derived from evidence/2026-10-17/human-parity-probe.cjs.
// The historical probe remains unchanged. Pause both opening schedulers so
// entry assertions precede actual AI movement, including alien encounters.
// Prepared runtime diagnostic, not ordinary campaign play. One shared Game;
// real generated people, equipment definitions and actual fight-entry callers.
// Pause ONLY opening turn scheduling to inspect construction without AI damage.
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../..')),out=process.argv[3];
const K=require(path.join(root,'scripts/godpath/lib')),B=require(path.join(root,'scripts/balance-panel'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
(async()=>{
  const G=await K.load({seed:7}),S=globalThis.Scattering,sources=B.manifest(root),cases=[];
  function prepare(){
    K.newRun(G,'Dakar, Senegal');G.tbfight=null;
    const s=G.state.scholar,v=G.state.village;
    const ids=v.roster.filter(id=>id!==G.villagerId&&G.vpOf(id)).slice(0,6);
    assert.strictEqual(ids.length,6);v.roster=ids.slice();v.party=[ids[4],ids[5]];v.followers=[];
    s.mx=1;s.my=4;s.health=100;s.monster={id:'dustboar',mx:7,my:4};
    v.positions={};v.health={};v.trust={};
    const weapon=G.data.items.find(i=>i.weapon?.bonus>0),armor=G.data.items.find(i=>i.armor?.protection>0&&!i.fullBody);
    assert(weapon&&armor);
    for(let i=0;i<ids.length;i++){
      const id=ids[i],vp=G.vpOf(id);v.health[id]=[63,47,0,92,73,81][i];v.trust[id]=i<2?5:80;
      v.positions[id]={mx:i<4?2:8,my:i<4?4:8};
      vp.items=[weapon.id,armor.id];vp.equipped={melee:{itemId:weapon.id},torso:{itemId:armor.id}};
    }
    const floor=G.genDetail(G.map.px,G.map.py);for(let y=0;y<9;y++)for(let x=0;x<9;x++)floor[y][x]='hall';
    floor[3][1]='wall';floor[3][2]='door';
    const begin=G.tbBeginTurn,advance=G.tbAdvance;G.tbBeginTurn=function(){};G.tbAdvance=function(){};
    return {ids,v,s,floor,restore(){G.tbBeginTurn=begin;G.tbAdvance=advance;}};
  }
  function snapshot(label,ctx){
    const f=G.tbfight;assert(f&&f.fighters.length>1,label+' constructed a fight');
    const human=f.fighters.filter(x=>x.kind==='villager'||(x.kind==='hostile'&&x.villagerId)||(x.kind==='ally'&&x.villageId==='haven'));
    assert(human.length>0,label+' must exercise actual human entrants');
    const expected=Object.fromEntries(ctx.ids.map(id=>{const vp=G.vpOf(id);return[id,{hp:ctx.v.health[id],wbonus:S.equipment.weaponBonusOf(vp,G.data.items),varmor:S.equipment.armorOf(vp,G.data.items)}];}));
    const all=f.fighters.filter(x=>x.alive&&!x.fled);
    const result={label,expected,fighters:all.map(x=>({key:x.key,kind:x.kind,id:x.villagerId,hp:x.hp,maxHp:x.maxHp,mx:x.mx,my:x.my,wbonus:x.wbonus,varmor:x.varmor})),checks:{
      actualHealth:human.every(x=>x.hp===expected[x.villagerId]?.hp),
      noZeroHealthEntrant:human.every(x=>expected[x.villagerId]?.hp>0),
      equipment:human.every(x=>x.wbonus===expected[x.villagerId]?.wbonus&&x.varmor===expected[x.villagerId]?.varmor),
      uniquePositions:new Set(all.map(x=>x.mx+','+x.my)).size===all.length,
      lawfulPositions:all.every(x=>x.mx>=0&&x.mx<=8&&x.my>=0&&x.my<=8&&!G.cellProps(ctx.floor[x.my]?.[x.mx]).blocks&&ctx.floor[x.my]?.[x.mx]!=='door')
    }};
    // Actual keyed damage, then actual fight end: compare the persisted wound
    // to the fighter's resulting health, not a guessed mitigation amount.
    const ally=human.find(x=>(x.kind==='villager'||x.kind==='ally')&&x.hp>20);
    if(ally){
      const before=ally.hp;G.tbDamage(ally.key,4,'diagnostic contact',null,{quiet:true,undodgeable:true});
      const after=ally.hp;result.damage={id:ally.villagerId,before,after,persistentImmediately:ctx.v.health[ally.villagerId]};
      G.tbEnd('fled');result.damage.persistentAfterEnd=ctx.v.health[ally.villagerId];
      result.checks.damageApplied=after<before;
      result.checks.woundsPersist=after<before&&ctx.v.health[ally.villagerId]===after;
    }
    cases.push(result);ctx.restore();G.tbfight=null;
  }
  let c=prepare();G.startCombat('dustboar');snapshot('monster plus remote party reinforcements',c);
  c=prepare();c.v.party=[];G.startCombat('dustboar');snapshot('ordinary nearby monster allies',c);
  c=prepare();const person=(G.data.alienPlayers?.personas||G.data.alienPlayers||[]);
  const persona=Array.isArray(person)?person.find(x=>x.id):null;
  // Build the genuine foreign fighter from authored data; never fabricate stats.
  const pid=persona?.id||Object.keys(G.data.alienPlayers?.players||{})[0];
  assert(pid,'Authored alien-player persona required');const alien=G.apBuildFighter(pid,7,4);assert(alien);
  G.startAlienCombat(alien);snapshot('alien-person encounter allies',c);
  c=prepare();G.startBetrayalCombat(c.ids[0],{aggressor:'player'});snapshot('betrayal hostile and loyal party',c);
  c=prepare();G.startVillageUprising('prepared parity diagnostic');snapshot('uprising attackers and defenders',c);
  c=prepare();c.v.party=[];for(const id of c.ids)c.v.positions[id]={mx:8,my:8};
  G.startCombat('dustboar');
  // The real injection method is shared by titan/Finale/Network callers.
  // Prepare only its muster selection, not its fighter stats or terrain logic.
  G._titanTest.titanState().musters.herald={allies:[],haven:[0,2,4].map(i=>({vid:c.ids[i]}))};
  G.titanInjectAllies('herald');snapshot('Haven coalition injection into actual combat',c);
  assert.deepStrictEqual(B.manifest(root),sources,'No runtime source drift during probe');
  const report={sourceDigest:sha(JSON.stringify(sources)),sources,fixture:'Generated humans with prepared HP, real equipped items, clustered positions and open floor; opening turn scheduling paused. Not a campaign sample.',cases};
  if(out)fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  for(const c of cases)console.log(c.label,JSON.stringify(c.checks));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
