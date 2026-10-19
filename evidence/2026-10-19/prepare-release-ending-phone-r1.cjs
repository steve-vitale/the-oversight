'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const[kind,out]=process.argv.slice(2);if(!['succession','table-win','table-falter'].includes(kind)||!out)throw Error('Pass scene and fresh output');
 const memory=new Map();global.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size}};
 const G=await K.load({seed:8201,narration:true});K.newRun(G);const s=G.state.scholar,v=G.state.village,oldId=G.villagerId,expected={kind,oldId};s.abilityChoices=s.knackChoices=s.relicChoices=null;
 if(kind==='succession'){
  const roster=v.roster.filter(id=>id!==oldId),B=roster[0],C=roster[1];Object.assign(expected,{B,C});
  for(const id of [B,C]){const favor={id:'release-ending-'+id,vid:id,kind:'food_share',goal:'feed',task:'the pantry run',short:'the pantry run',deadline:30,state:'asked'};G.convoStoreFavor(favor);if(!G.convoFavorCommit(id,favor)?.ok)throw Error('Favor refused')}
  for(const id of roster){v.trust[id]=id===B?100:10;if(G.npcSetNode)G.npcSetNode(id,4,4)}
  G.map.px=2;G.map.py=2;G.playerTile().type='forest_floor';s.insideHaven=false;G.genDetail(2,2);s.health=100;s.abilities=[];s.backgroundAbilities=[];s.equipped={};s.inventory=[];s.godhood={active:[]};
  K.fight(G,'hushwolf',{px:4,py:4,mx:5,my:4,hp:100,party:true});if(G.villagerId!==oldId||!G.tbfight||!G.tbIsPlayerTurn())throw Error('No live original player turn');s.health=1;G.tbFighter('p').hp=1;
 }else{
  G.state.systemArrived=true;G.state.systemAnimationShown=true;s.day=120;s.kcal=3000;s.integration=60;G.progState().tableDone=true;
  G.tableStartPath(kind==='table-win'?'assimilated':'feared');const T=G.tableState();T.seat='lesser';T.branch='light';
  if(kind==='table-win'){T.meters={comfort:8};G.tableFinals()}
  else{T.beat=0;T.meters={terror:2,horror:4};T.abilMods={};G.tableRunBeat()}
  expected.options=s.tableChoices?.options;expected.phase=T.phase;
 }
 G.save();fs.writeFileSync(out,JSON.stringify({fixture:'Prepared '+kind+' state. Late-game stakes/low health and trust are declared; no natural attainment claim. Browser must use native actions only.',expected,storage:Object.fromEntries(memory)},null,2)+'\n',{flag:'wx'});console.log(expected);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
