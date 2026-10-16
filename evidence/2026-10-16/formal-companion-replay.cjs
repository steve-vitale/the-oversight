'use strict';
// Passive reads around real entry, damage and settlement; no game helper
// queries, extra telemetry, random draws or clock reads from observation.
const fs=require('fs'),path=require('path');
const root=path.resolve(process.argv[2]),policy=process.argv[3],seed=Number(process.argv[4]),observe=process.argv[5]!=='off',out=process.argv[6];
const {runComparison,POLICY_REGISTRY:R}=require(path.join(root,'scripts/sweep-compare'));
const H=require(path.join(root,'scripts/sim-harness')),hash=require(path.join(root,'scripts/gear-usage-audit')).gameplayHash;
const base=R[policy],events=[],days=[],warnings=[];let G,dropped=0;
const clone=x=>x===undefined?null:JSON.parse(JSON.stringify(x));
const add=x=>{if(events.length<24000)events.push(x);else dropped++;};
const bodies=f=>(f?.fighters||[]).filter(x=>x.kind==='player'||x.kind==='villager').map(x=>({key:x.key,id:x.villagerId,kind:x.kind,hp:x.hp,maxHp:x.maxHp,wbonus:x.wbonus,varmor:x.varmor,alive:x.alive,fled:x.fled}));
R[policy]={...base,setup(g,c){G=g;if(observe){
  for(const name of ['startCombat','startBetrayalCombat','apStartEncounter']){
    const orig=g[name];g[name]=function(...args){
      const s=this.state.scholar,v=this.state.village,oldFight=this.tbfight;
      const prior={day:s.day,bearer:this.villagerId,position:[s.mx??4,s.my??4],party:clone(v.party),health:clone(v.health),positions:clone(v.positions)};
      const result=orig.apply(this,args);
      add({type:'entry',name,...prior,newFight:this.tbfight!==oldFight,bodies:bodies(this.tbfight)});return result;
    };
  }
  const end=g.tbEnd;g.tbEnd=function(result){
    const prior={day:this.state.scholar.day,bearer:this.villagerId,bodies:bodies(this.tbfight),health:clone(this.state.village.health)};
    const r=end.apply(this,arguments);add({type:'end',result,...prior,afterHealth:clone(this.state.village.health)});return r;
  };
  const damage=g.tbDamage;g.tbDamage=function(key,n,label,sourceKey){
    const t=this.tbfight?.fighters.find(x=>x.key===key),before=t?.hp,r=damage.apply(this,arguments);
    add({type:'hit',day:this.state.scholar.day,bearer:this.villagerId,key,id:t?.villagerId,kind:t?.kind,sourceKey,label,requested:n,before,after:t?.hp,landed:r});return r;
  };
  const tele=g.tele;g.tele=function(type,data){
    if(['death','table_won','table_failed','village_lost','ascension'].includes(type))add({type,day:this.state.scholar.day,bearer:this.villagerId,data:clone(data)});
    return tele.apply(this,arguments);
  };
}return base.setup&&base.setup(g,c);},daily(g,c){
  const r=base.daily&&base.daily(g,c);
  if(observe){const s=g.state.scholar,v=g.state.village;days.push({day:s.day,bearer:g.villagerId,hp:s.health,kcal:s.kcal,hydration:s.hydration,party:clone(v.party),roster:clone(v.roster),pantry:(v.pantry||[]).reduce((n,i)=>n+(i.kcalEach||0)*(i.units||0),0),class:clone(s.godpath),gods:clone(s.godhood)});}
  return r;
}};
(async()=>{
  const warn=console.warn;console.warn=(...args)=>{warnings.push(args.map(String).join(' '));warn(...args);};
  let report;try{report=await H.quietLog(()=>runComparison({policies:[policy],seeds:[seed],days:150}));}finally{console.warn=warn;}
  fs.writeFileSync(out,JSON.stringify({policy,seed,observe,row:report.runs[0],stateHash:hash(G.state),events,days,warnings,dropped})+'\n');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
