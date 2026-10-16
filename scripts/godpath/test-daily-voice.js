'use strict';
// Paid daily cast and real fight/turn/save callers; prepared access, not a campaign.
const K=require('./lib'),T=K.reporter('daily-voice');
(async()=>{
 const saves=new Map();global.localStorage={getItem:k=>saves.get(String(k))??null,setItem:(k,v)=>saves.set(String(k),String(v)),removeItem:k=>saves.delete(String(k)),key:i=>[...saves.keys()][i]??null,get length(){return saves.size;}};
 const G=await K.load({seed:7});let s,v,f,p,m,a,id,roster;
 function fresh(paid=true){G.tbfight=null;G.over=false;K.newRun(G);s=G.state.scholar;v=G.state.village;s.day=85;s.kcal=1200;s.health=100;s.abilities=[];s.inventory=[];s.grounding=80;G.state.systemArrived=true;s.godhood={active:['voice_of_the_relay'],recognized:{voice_of_the_relay:85}};roster=v.roster.slice();id=roster.find(x=>x!==G.villagerId);v.npcAbilities={[id]:[]};v.npcSkills={[id]:[]};if(paid&&G.useAbility('god','be_heard')!==true)throw Error('Daily cast refused');}
 function fight(){m=K.fight(G,'review_drone',{px:3,py:4,mx:4,my:4,hp:100});v.roster=roster.slice();f=G.tbfight;p=G.tbFighter('p');m.hp=m.maxHp=10000;p.stunned=0;f.order=['p',m.key];f.turnIdx=0;}
 function inject(kind='villager',vid=id){a={key:'v_late',kind,villagerId:vid,name:'Prepared late ally',hp:100,maxHp:100,mx:2,my:4,alive:true,fled:false,ai:'brave'};f.fighters.push(a);f.order.splice(1,0,a.key);return a;}
 function load(){const key=G.state.runKey;const ok=G.load(key);s=G.state.scholar;v=G.state.village;f=G.tbfight;p=G.tbFighter('p');m=f.fighters.find(x=>x.kind==='monster');a=G.tbFighter('v_late');return ok;}
 fresh();T.ok('actual daily Voice pays150 and five humanity once',s.kcal===1050&&s.grounding===75&&v.voiceDay===85&&G.useAbility('god','be_heard')===false);
 fight();T.ok('actual fight constructor delivers three active rally turns before player input',G.tbCurrent()===p&&p._gvVoiced&&p.rallyBuff===3&&p.rallied===3);
 T.ok('daily rally grants neither a command nor a strike multiplier',!f.playerCommands?.length&&!f.playerCommandReturn&&!s._nextStrikes);
 const hp=m.hp;G.tbDamage(m.key,20,'you',null,{undodgeable:true});T.ok('real player damage consumes the existing raw plus-four convention',hp-m.hp===24);
 G.tbPlayerWait();T.ok('next real own turn ages daily rally without refreshing',p.rallyBuff===2&&p.rallied===2);
 G.save();T.ok('actual save/load retains the spent daily recipient gate and remaining duration',load()&&p._gvVoiced&&p.rallyBuff===2&&p.rallied===2);
 G.tbPlayerWait();T.ok('first turn after reload continues expiry rather than rearming',p.rallyBuff===1&&p.rallied===1);
 G.tbPlayerWait();T.ok('daily rally expires after three active player turns',p.rallyBuff===0&&p.rallied===0);
 const unbuffed=m.hp;G.tbDamage(m.key,20,'you',null,{undodgeable:true});T.ok('expired daily rally supplies no damage bonus',unbuffed-m.hp===20);
 T.ok('turns and reload charge no extra daily food or grounding',s.kcal===1050&&s.grounding===75);
 fresh();fight();inject();G.npcNeeds(id).hunger=10;G.tbPlayerWait();T.ok('a late-injected living NPC still receives the same three active turns',a._gvVoiced&&a.rallyBuff===3&&a.rallied===3);
 G.save();load();G.tbPlayerWait();T.ok('late NPC recipient gate and finite duration survive reload',a._gvVoiced&&a.rallyBuff===2&&a.rallied===2);
 fresh();fight();inject();a.rallyBuff=7;a.rallied=6;G.tbPlayerWait();T.ok('daily entry preserves stronger pre-existing rally before normal expiry',a.rallyBuff===6&&a.rallied===5);
 fresh();fight();inject();G.tbCommandPlayer(a,'Prepared earned command');G.tbAdvance();T.ok('an earned bonus turn ages the existing daily rally once',!!f.playerCommandReturn&&p._gvVoiced&&p.rallyBuff===2);
 G.tbPlayerWait();T.ok('return to ordinary turn does not refresh daily rally',!f.playerCommandReturn&&p.rallyBuff===1);
 fresh();fight();p.stunned=1;p.stunFull=1;G.tbBeginTurn();T.ok('a full stun spends duration and cannot rearm the daily effect',p._gvVoiced&&p.rallyBuff===1&&!p.stunned&&!p.acted);
 fresh();fight();G.tbEnd('fled');s.health=100;fight();T.ok('a distinct later fight on the paid day receives its own finite rally',p._gvVoiced&&p.rallyBuff===3&&s.kcal===1050&&s.grounding===75);
 fresh(false);fight();T.ok('no paid daily marker means no free rally',!p._gvVoiced&&!p.rallyBuff);
 fresh(false);v.voiceDay=84;fight();T.ok('yesterday\'s marker cannot arm a new fight',!p._gvVoiced&&!p.rallyBuff);
 fresh();s.kcal=G.kcalCap();G.endDay();const next=s.day;fight();T.ok('a real dawn ends the daily word for new fights',next===86&&!p._gvVoiced&&!p.rallyBuff);
 for(const bad of ['dead','fled','hostile','detached','self-alias']){fresh();fight();inject(bad==='hostile'?'hostile':'villager',bad==='self-alias'?G.villagerId:id);if(bad==='dead')a.alive=false;if(bad==='fled')a.fled=true;if(bad==='detached')f.fighters=f.fighters.filter(x=>x!==a);G.tbVillagerTurn(a);T.ok(bad+' cannot acquire a daily allied rally',!a._gvVoiced&&!a.rallyBuff);}
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
