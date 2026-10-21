'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const store=new Map();global.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
 const G=await K.load({seed:7002});
 for(const kind of ['fresh','near']){
  K.newRun(G);const s=G.state.scholar,v=G.state.village,t=G.playerTile();G.chooseKnack(G.liveKnackChoices()[0].id);K.openSlots(G,3);K.giveAbility(G,'green_thumb');K.giveAbility(G,'green_whisper');
  s.day=4;s.dayTicks=0;s.actionClock=0;G.dayPart=0;s.kcal=6000;s.health=100;s.energy=100;s.hydration=100;
  G.state.codex.plants.lambs_quarters={level:1};s.inventory=[{plantId:'lambs_quarters',units:12,kcalEach:50,name:"Lamb's quarters",kg:.1}];
  s.insideHaven=false;t.detail=null;G.genDetail(4,4);s.mx=4;s.my=5;v.havenTier=kind==='near'?1:0;v.wood=0;v.pantry=[];
  if(kind==='near'){
    const crop={pid:null};G.gardenPlant(crop,'lambs_quarters',s.day-28);crop.lastTend=s.day;
    t.plots=[crop,{pid:null,dead:true,weeds:6,lastHarvest:0,lastTend:1}];
    for(const index of [0,1]){const pos=G.gardenSlot(index);t.groundsDetail[pos.y][pos.x]='dirt';}
  }
  v.away={};v.talkRequests={};v.engaged={};
  const worker=v.roster.find(id=>G.gardenKeeperReady(id));if(!worker)throw Error('No eligible prepared caretaker');
  if(!G.save())throw Error('Prepared save failed');
  fs.writeFileSync('evidence/2026-10-20/garden-cultivation-'+kind+'-fixture-r1.json',JSON.stringify({scope:'Prepared opportunity: supplied planting stock, learned crop, held Green abilities, eligible resident and (near only) aged crop/dead bed. Not natural attainment or full crop growth. All browser proof actions use normal touch controls.',setup:{key:G.state.runKey,kind,worker},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
