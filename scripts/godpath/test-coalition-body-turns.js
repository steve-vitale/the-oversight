'use strict';
const K=require('./lib'),T=K.reporter('coalition-body-turns');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||7)});K.newRun(G);
 const opponent=process.env.OPPONENT||'herald',musterId=opponent==='finale_crew'?'finale':opponent;
 const links=G.hierarchyState();links.length=0;
 for(const v of G.state.otherVillages){G.genVillageRoster(v);v.opinion=30;links.push({primary:'haven',subordinate:v.id,status:'active',trust:90,arrears:0,theirSpeaker:{id:v.roster.find(r=>r.age>=18).id,name:'Speaker'}});}
 G.state.titans={omens:{[musterId]:{stage:2}},musters:{},slain:{},cast:null};G.soundTitanCall(musterId);
 const site=G.titanPlacementTile(3);G.map.px=site.x;G.map.py=site.y;G.state.scholar.insideHaven=false;G.genDetail(site.x,site.y);G.state.scholar.mx=5;G.state.scholar.my=3;
 G.startCombat(opponent);let checked=0,first=null;
 function positions(){return G.tbfight?.fighters.filter(x=>x.alive&&!x.fled).map(x=>({key:x.key,x:x.mx,y:x.my,size:G.fighterSize(x)}));}
 function check(at,before){if(!G.tbfight||G.tbfight.over)return;const occupied=new Map();checked++;for(const f of G.tbfight.fighters){if(!f.alive||f.fled)continue;for(const[x,y]of G.fighterTiles(f)){const key=x+','+y;if(occupied.has(key)&&!first)first={at,round:G.tbfight.round,tile:key,actors:[occupied.get(key),f.key],before,after:positions()};occupied.set(key,f.key);}}}
 check('opening');
 for(const name of ['tbMonsterTurn','tbVillagerTurn']){const orig=G[name];G[name]=function(...args){const before=positions(),r=orig.apply(this,args);check(name+':'+args[0]?.key,before);return r;};}
 for(let turn=0;turn<12&&G.tbfight;turn++)G.tbPlayerWait();
 T.ok('prepared army advances through real actor turns',checked>=20,checked);
 T.ok('living fighters never overlap the huge body after a real turn',!first,first&&JSON.stringify(first));
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
