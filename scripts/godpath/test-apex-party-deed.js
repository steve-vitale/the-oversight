'use strict';
const path=require('path'),root=path.resolve(process.argv[2]||path.join(__dirname,'../..')),K=require(path.join(root,'scripts/godpath/lib')),T=K.reporter('apex-party-deed');
(async()=>{
 const saves=new Map();global.localStorage={getItem:k=>saves.get(String(k))??null,setItem:(k,v)=>saves.set(String(k),String(v)),removeItem:k=>saves.delete(String(k)),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:7});let s,v,id,f,ally,prey;
 function prepare({pack=true,health=100,monster='moderator'}={}){
  G.tbfight=null;G.over=false;G.won=false;K.newRun(G);s=G.state.scholar;v=G.state.village;id=v.roster.find(x=>x!==G.villagerId&&G.npcAge(x)>=18);
  s.day=85;s.health=100;s.kcal=6000;s.mx=0;s.my=0;s.abilities=[];G.state.systemArrived=true;
  v.roster=[G.villagerId,id];v.party=[id];v.followers=[];v.positions={[id]:{mx:8,my:8}};v.health={[id]:health};v.npcAbilities={[id]:pack?['pack_hunt']:[]};G.npcNeeds(id).hunger=0;
  v.pantry=[{name:'Prepared stores',units:100,kcalEach:500,safe:true,spoilDay:9999}];s.monster={id:monster,mx:3,my:0};G.startCombat(monster);bind();
 }
 function bind(){s=G.state.scholar;v=G.state.village;f=G.tbfight;ally=f?.fighters.find(x=>x.villagerId===id);prey=f?.fighters.find(x=>x.kind==='monster');}
 const book=()=>v.godpathDeeds?.[id]?.apex_hunt;
 function cast(){return G.tbVillagerAbility(ally);}
 function kill(){G.tbDamage(prey.key,10000,'prepared lethal hit','p',{undodgeable:true});G.tbEndCheck();}
 function reload(){const ok=G.load(G.state.runKey);bind();return ok;}
 prepare();T.ok('actual far formal companion joins after the core opening',!!ally&&ally.mx===8&&ally.my===8&&f.fighters.filter(x=>x.villagerId===id).length===1);
 T.ok('this deed change does not silently repair the separate30HP body model',ally.hp===30&&ally.maxHp===30);
 T.ok('the public NPC action actually pays for Pack Hunt',cast()===true&&G.npcNeeds(id).hunger===3&&prey._birdStrike>0);
 kill();T.ok('the actual late formal caster earns their own hunt',book()?.method==='pack'&&book().actorMaxHp===100);
 T.ok('the accompanying player cannot borrow that receipt',!v.godpathDeeds?.[G.villagerId]?.apex_hunt);
 prepare();G.save();T.ok('real load before the first cast retains opening evidence',reload());cast();kill();T.ok('a loaded formal companion can finish their paid hunt',book()?.method==='pack');
 prepare();cast();const paid=G.npcNeeds(id).hunger;G.save();T.ok('real load after payment retains its finite use',reload()&&G.npcNeeds(id).hunger===paid&&cast()===false);kill();T.ok('a loaded paid formal hunt finishes without a second charge',book()?.method==='pack'&&G.npcNeeds(id).hunger===paid);
 prepare({pack:false});v.npcAbilities[id]=['pack_hunt'];T.ok('late-learned Pack Hunt still has its real public action',cast()===true);kill();T.ok('learning Pack Hunt after opening cannot earn formal hunt credit',!book());
 prepare();kill();T.ok('holding an unused Pack Hunt does not credit a formal helper',!book());
 prepare({monster:'bulldozer'});cast();kill();T.ok('the30HP proxy cannot turn a weaker monster into stronger prey',!book());
 prepare({health:200});cast();kill();T.ok('the real opening world capacity remains the stronger-prey threshold',!book());
 prepare({health:200});v.health[id]=100;cast();kill();T.ok('later world wounds cannot lower the saved opening capacity',!book());
 prepare();cast();ally.hp=0;ally.alive=false;kill();T.ok('a fallen formal caster earns no hunt',!book());
 prepare();cast();ally.fled=true;kill();T.ok('a departed formal caster earns no hunt',!book());
 prepare();G.save();const raw=JSON.parse(saves.get(G.state.runKey));delete raw.run.tbfight.godpathApexHunt.openingCompanions;saves.set(G.state.runKey,JSON.stringify(raw));reload();cast();kill();T.ok('older opening ledgers cannot invent missing formal ownership',!book());
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
