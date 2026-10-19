'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const [kind,out]=process.argv.slice(2);if(!['sleep','peace','finale'].includes(kind)||!out)throw Error('Pass scenario and a fresh output path');
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size}};
 const G=await K.load({seed:42,narration:true});K.newRun(G);const s=G.state.scholar;
 s.day=5;s.dayTicks=300;s.kcal=4000;s.hydration=100;s.health=100;s.energy=100;s.abilityChoices=null;s.knackChoices=null;s.relicChoices=null;
 if(kind!=='sleep'){G.map.px=2;G.map.py=2;G.playerTile().type='forest_floor';s.insideHaven=false;G.genDetail(2,2);}
 if(kind==='sleep'){
  G.map.px=G.state.village.px??4;G.map.py=G.state.village.py??4;s.mx=s.my=4;s.insideHaven=true;G.state.village.havenTier=2;
  const m=G.spawnWorldMonster({id:'hushwolf'},G.map.px,G.map.py,{mx:4,my:5});m.stance='hungry';
 }else if(kind==='peace'){
  K.giveAbility(G,'peacemaker',{force:true});K.fight(G,'bulldozer',{px:4,py:4,mx:5,my:4,hp:1000});
 }else{
  G.titanMusterState('finale');Object.assign(G.finaleCampaign(),{started:true,crew:true,opening:true});
  G.state.titans.musters.finale={allies:Array.from({length:20},(_,i)=>({vid:'contact2_ally_'+i,villageId:'contact2_prepared_fire',name:'Prepared ally '+(i+1),hp:100,outfitted:[],gearValue:0})),haven:[],turned:{}};
  s.monster={id:'finale',mx:5,my:4};G.startCombat('finale');
  const f=G.tbfight,m=f.fighters.find(x=>x.kind==='monster'&&x.mdef?.id==='finale');if(!m)throw Error('No actual Finale');
  f.fiCrewSpoils={redpen:1,script:1,badnote:1};f.fiSkyArmed=[{x:3,y:3,radius:1}];m.fiCountdown=3;
  s.inventory=[{itemId:'stone_knife',name:'Exhausted knife stack',units:0},{name:'Prepared meal',units:2,kcalEach:1000,kg:.2}];
 }
 G.save();fs.writeFileSync(out,JSON.stringify({fixture:'Prepared '+kind+' contract scene, not natural progression or earned availability. Real saved state; subsequent browser actions use native controls. Sleep includes an adjacent raider; Finale includes declared crew spoils and exact-stack payment.',setup:{kind,key:G.state.runKey,bearer:G.villagerId},storage:Object.fromEntries(memory)},null,2)+'\n',{flag:'wx'});
 console.log({kind,key:G.state.runKey,fight:!!G.tbfight});
})().catch(e=>{console.error(e.stack);process.exitCode=1});
