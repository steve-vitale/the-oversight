'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const[kind,out]=process.argv.slice(2);if(!['beam','table'].includes(kind)||!out)throw Error('Pass beam/table and a fresh fixture path');
 const store=new Map();global.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size}};
 const G=await K.load({seed:8201,narration:true});K.newRun(G);const s=G.state.scholar;s.knackChoices=s.abilityChoices=s.relicChoices=null;G.state.systemArrived=true;G.state.systemAnimationShown=true;let expected={kind};
 if(kind==='beam'){
  G.map.px=2;G.map.py=4;s.insideHaven=false;G.playerTile().type='forest_floor';G.genDetail(2,4).forEach(row=>row.fill('grass'));s.abilities=[];s.backgroundAbilities=[];s.godhood={active:[]};s.equipped={torso:{itemId:'worldroot_plate'},hands:{itemId:'alien_gauntlets'}};s.day=40;s.health=100;
  if(!G.apStartEncounter('vex_marlowe'))throw Error('Alien encounter refused');const f=G.tbfight,p=G.tbFighter('p'),alien=f.fighters.find(f=>f.alienPid==='vex_marlowe');p.hp=s.health=100;alien.apTurns=1;alien.apSpent=0;alien.hp=alien.maxHp;f._beamCooldown=0;f.order=[alien.key,'p'];f.turnIdx=-1;f.pendingTurnKey=null;
  const random=Math.random;try{Math.random=()=>0;G.tbAdvance()}finally{Math.random=random}
  if(!alien._beamAim||!G.tbIsPlayerTurn()||p.hp!==100)throw Error('No genuine aimed response turn');expected={...expected,aim:alien._beamAim,source:{x:alien.mx,y:alien.my},bearer:G.villagerId};
 }else{
  s.day=120;s.kcal=3000;s.integration=60;s.insideHaven=true;G.state.networkLive=true;const pg=G.progState();pg.table={};pg.tableDone=false;pg.tableWaiting=true;pg.sentimentTaught=true;s.prog.feastSurgeUsed=true;pg.crises={raid:true,illness:true};const d=G.deedState();d.contestsSurvived=2;d.wavesFaced={};for(const[w,n]of [[1,4],[2,4],[3,3]])for(const m of G.data.monsters.filter(m=>m.wave===w).slice(0,n))d.wavesFaced[m.id]=w;G.ledger().might=10;
  if(!G.tableTakeSeat()?.ok)throw Error('Prepared earned seat refused');G.chooseTableOption('path:feared');const T=G.tableState();T.beat=0;T.meters={terror:2,horror:4};T.abilMods={};G.tableRunBeat();expected={...expected,seat:G.tableSeat().seat,path:T.path,choices:s.tableChoices};
 }
 G.save();fs.writeFileSync(out,JSON.stringify({fixture:'Prepared '+kind+' scene: real ability/encounter/table APIs; declared gear/day/deeds/critical meters, not natural attainment.',expected,storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(expected));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
