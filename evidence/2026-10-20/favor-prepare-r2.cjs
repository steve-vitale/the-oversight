'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const old=JSON.parse(fs.readFileSync('evidence/2026-10-18/installed-update-old-save-r1.json')),store=new Map(Object.entries(old.storage));
 global.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size}};
 const G=await K.load({seed:7}),key=[...store.keys()].find(k=>k.startsWith('scattering-save-v1-'));
 for(const kind of ['heal_help','food_share','water_haul']){
  store.clear();for(const[k,v]of Object.entries(old.storage))store.set(k,v);G.load(key);
  const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&G.isKnowledgeTrader(id));
  G.npcSetNode(vid,G.map.px,G.map.py);G.npcSetInside(vid,s.insideHaven!==false);v.positions[vid]={mx:Math.max(0,s.mx-1),my:s.my};v.away={};v.sick={};v.health=v.health||{};v.health[vid]=kind==='heal_help'?40:100;G.npcNeeds(vid).hunger=kind==='food_share'?90:20;
  if(kind==='food_share')s.inventory=s.inventory.filter(i=>!(i.kcalEach>0));
  v.water={...v.water,clean:0};v.promises={};v.talkRequests={};
  const favor=G.convoBuildFavor(vid,{kind,hunger:90,health:40,water:0});G.convoStoreFavor(favor);G.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:favor.short});G.save();
  fs.writeFileSync('evidence/2026-10-20/favor-'+kind+'-fixture-r2.json',JSON.stringify({scope:'Prepared need and nearby actor in retained played save; no browser response/outcome grants.',setup:{key,npc:vid,name:G.vpOf(vid).name,kind,favorId:favor.id},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
 }
})().catch(e=>{console.error(e);process.exitCode=1});
