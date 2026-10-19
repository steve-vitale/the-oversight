'use strict';
const K=require('./lib'),T=K.reporter('Current-wave persistent raid posts');
(async()=>{
 const memory=new Map();global.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size}};
 const G=await K.load({seed:Number(process.env.SEED||7)});K.newRun(G);G.state.systemArrived=true;const s=G.state.scholar,v=G.state.village;s.day=20;v.lastRaidDay=-100;v.roster=[G.villagerId];G.pantryKcalLive=()=>25000;G.playerAtHaven=()=>false;G.unlockedWave=()=>3;G.tableActive=()=>false;
 for(const t of G.map.tiles.flat()){if(t)t.monster=null;}
 const defs=G.data.monsters,selected=[[1,2],[3,5],[5,2]].flatMap(([wave,n])=>defs.filter(m=>m.wave===wave&&!m.campaignOnly).slice(0,n));
 for(const [i,d]of selected.entries())G.spawnWorldMonster(d.id,i%9,0,{mx:4,my:4});
 let fired=false;for(let i=0;i<200&&!fired;i++)fired=G.havenRaidTick();T.ok('a real current-wave raid fires',fired===true);
 let raiders=G.worldMonsters().filter(m=>m.raidPost);T.ok('only actual current-wave monsters raid',raiders.length>=3&&raiders.every(m=>defs.find(d=>d.id===m.id).wave===3));
 T.ok('each raider occupies a distinct real macro tile',raiders.length>=3&&new Set(raiders.map(m=>m.tx+','+m.ty)).size===raiders.length&&raiders.every(m=>G.tileAt(m.tx,m.ty)));
 const posts=rs=>rs.map(m=>({id:m.id,x:m.tx,y:m.ty,post:m.raidPost,haven:m.raidHaven})).sort((a,b)=>a.id.localeCompare(b.id));const before=JSON.stringify(posts(raiders));
 G.havenGrowthDaily();T.ok('ordinary dawn keeps separate posts',JSON.stringify(posts(raiders))===before&&raiders.length>=3);
 G.save();const key=G.state.runKey;const loaded=G.load(key);raiders=G.worldMonsters().filter(m=>m.raidPost);T.ok('actual save/Continue retains all raid posts',loaded&&raiders.length>=3&&JSON.stringify(posts(raiders))===before);
 const crisis=G.aidCrisis(),off=raiders.find(m=>m.tx!==4||m.ty!==4);T.ok('actual crisis records the current raid wave',crisis?.wave===3&&crisis.raiders===true);
 if(!off){T.ok('an adjacent posted raider exists',false);T.done();return}
 for(const m of G.worldMonsters())if(m!==off)m.hp=0;crisis.ageParts=3;G.commsTick();T.ok('a surviving adjacent post keeps the actual siege open',G.aidCrisis()===crisis);
 off.hp=0;G.commsTick();T.ok('clearing the final post resolves the actual siege',!G.aidCrisis());
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
