'use strict';
const path=require('path'),f=require('fs');const root=path.resolve(process.argv[2]),seed=Number(process.argv[3]),observe=process.argv[4]==='on';
const {runComparison,POLICY_REGISTRY:R}=require(path.join(root,'scripts/sweep-compare')),hash=require(path.join(root,'scripts/gear-usage-audit')).gameplayHash;
let G,ctx,events=[];const base=R.capable;R.capable={...base,setup(g,c){G=g;ctx=c;
 if(observe)for(const name of ['chooseKnack','grantFeastBuff','abilityOnAcquire']){const orig=g[name];g[name]=function(...args){const day=this.state.scholar.day,bearer=this.villagerId,result=orig.apply(this,args);events.push({name,day,bearer,args:JSON.parse(JSON.stringify(args)),result:result==null?null:JSON.parse(JSON.stringify(result))});return result;};}
 return base.setup(g,c);
}};
(async()=>{const report=await runComparison({label:'introductory knack diagnostic',policies:['capable'],seeds:[seed],days:40});const s=G.state.scholar,stateHash=hash({...G.state,__run:{villagerId:G.villagerId,over:G.over,won:G.won,dayPart:G.dayPart,map:G.map}});const out={seed,observe,row:report.runs?.[0]||report.rows?.[0],stateHash,events,policy:{knack:ctx.capKnackPicks,errors:ctx.capErrors||[]},end:{day:s.day,bearer:G.villagerId,abilities:s.abilities,knackChosen:s.knackChosen,knackChoices:s.knackChoices,reactor:s.fusionReactor,foodDeeds:{sentimentTaught:!!G.progState().sentimentTaught,feastSurgeUsed:!!s.prog?.feastSurgeUsed},seat:G.tableSeat()}};f.writeFileSync(process.argv[5],JSON.stringify(out,null,2)+'\n');})();
