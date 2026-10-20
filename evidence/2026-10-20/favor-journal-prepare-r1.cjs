'use strict';
const fs=require('node:fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const old=JSON.parse(fs.readFileSync('evidence/2026-10-18/installed-update-old-save-r1.json')),store=new Map(Object.entries(old.storage));
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size}};
 const G=await K.load({seed:7002}),key=[...store.keys()].find(k=>k.startsWith('scattering-save-v1-'));
 for(const scenario of ['food','wound','illness','expiry']){
  store.clear();for(const [k,v] of Object.entries(old.storage))store.set(k,v);if(!G.load(key))throw Error('Retained played save did not load');
  const v=G.state.village,s=G.state.scholar,vid=v.roster.find(id=>id!==G.villagerId&&G.isKnowledgeTrader(id));
  if(!vid)throw Error('No retained actor');
  G.npcSetNode(vid,G.map.px,G.map.py);G.npcSetInside(vid,s.insideHaven!==false);v.positions[vid]={mx:Math.max(0,s.mx-1),my:s.my};v.away={};v.sick={};v.health={...v.health,[vid]:scenario==='wound'?40:100};
  if(scenario==='illness')v.sick[vid]={id:'cold',daysLeft:4,severity:2};
  G.npcNeeds(vid).hunger=90;v.promises={};v.talkRequests={};v.favorLedger={};s.day=4;s.kcal=4000;s.hydration=100;s.health=100;s.energy=100;
  if(scenario==='food'||scenario==='expiry')s.inventory=s.inventory.filter(i=>!(i.kcalEach>0));
  const kind=scenario==='wound'?'heal_help':scenario==='illness'?'sick_help':'food_share';
  const favor=G.convoBuildFavor(vid,{kind,hunger:90,health:40,severity:2});G.convoStoreFavor(favor);G.convoPlantSeed(vid,{wantId:'ask_favor',favorId:favor.id,note:favor.short});
  if(scenario==='expiry'){G.convoFavorCommit(vid,favor);s.day=5;s.dayTicks=G.TIME.TICKS_PER_DAY-1;}
  if(G.save()!==true)throw Error('Fixture save failed');
  const out='evidence/2026-10-20/favor-journal-'+scenario+'-fixture-r1.json';
  fs.writeFileSync(out,JSON.stringify({scope:'Prepared need, nearby actor and explicit clock in a retained played save. Browser must use actual menus/actions; no browser outcome grants.',setup:{key,npc:vid,name:G.vpOf(vid).name,scenario,kind,favorId:favor.id,dueDay:scenario==='expiry'?G.promiseDueDay(v.promises[vid]):favor.deadline},storage:Object.fromEntries(store)},null,2)+'\n',{flag:'wx'});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1});
