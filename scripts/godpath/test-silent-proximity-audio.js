'use strict';
const K=require('./lib'),T=K.reporter('Silent proximity audio');
(async()=>{
 const G=await K.load({seed:Number(process.env.SEED||20261017)});
 const silent=['speedbump_turtle','anaconda_empress','sweeps_week'];
 for(const id of [...silent,'gallowdeer','voice_mimic_radio']){
  K.newRun(G);G.startCombat(id);const f=G.tbfight,p=G.tbFighter('p'),m=f?.fighters.find(o=>o.monsterId===id),vid=G.state.village.roster.find(r=>r!==G.villagerId&&!G.getPerson(r).dead);
  T.ok(id+' actual encounter and living second target exist',!!(f&&p&&m&&vid));if(!(f&&p&&m&&vid))continue;
  const ally={key:'audio_proof_ally',kind:'villager',villagerId:vid,name:G.displayName(vid),hp:100,maxHp:100,alive:true,mx:4,my:5};
  f.fighters=[p,m,ally];p.alive=true;p.fled=false;p.mx=4;p.my=1;m.alive=true;m.fled=false;m.mx=4;m.my=4;m.threatQueue=['p',ally.key];
  const cfg=G.encConfig(m),events=[],audio=G.audioEvent;
  const resources=()=>JSON.stringify({health:G.state.scholar.health,kcal:G.state.scholar.kcal,water:G.state.scholar.water,day:G.state.scholar.day,ticks:G.state.scholar.dayTicks,inventory:G.state.scholar.inventory,playerHp:p.hp,allyHp:ally.hp});
  G.audioEvent=function(name,data){events.push({name,data});return audio.apply(this,arguments);};
  try{
   const prior=resources();G.encScanThreats(m);
   T.ok(id+' actual scanner still prioritizes the adjacent living target',m.threatQueue[0]===ally.key&&G.encCurrentTarget(m)===ally);
   T.ok(id+' scan does not change resource prices, HP, cargo or time',resources()===prior);
   if(silent.includes(id)){
    T.ok(id+' declares explicit proximity silence',cfg.proximityAudio===false);
    T.ok(id+' retargeting does not announce an unmade attack',events.length===0,JSON.stringify(events));
   }else T.ok(id+' ordinary vocal retargeting remains audible',events.length===1&&events[0].name===(cfg.aggroAudio||'deerAggro'),JSON.stringify(events));
   events.length=0;G.encNoticesPain(m,'p');
   T.ok(id+' real pain-notice handler retains its voice and target switch',m.threatQueue[0]==='p'&&events.length===1&&events[0].name===(cfg.aggroAudio||'deerAggro'),JSON.stringify(events));
   T.ok(id+' pain notice itself does not charge or damage anyone',resources()===prior);
  }finally{G.audioEvent=audio;}
 }
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
