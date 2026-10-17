// Passive contest/show decision -> outcome -> requested tier -> delivered item.
// Never calls a game getter: queries can hydrate people or consume RNG/clock.
'use strict';
const ROOTS=new Set(['fireContest','fireShow','contestInterruption','contestChoose','_contestVerdict','_contestEnd','_contestResolveOthers','_cxItemPrize','_showEnd','_showVillagerEnd']);
const METHODS=[...ROOTS,'_cxPrizeLane','broadcastRewardTier','rollAlienLoot','alienLootGrant','apAdjustFavor','apCarePackage','unlockedWave','addNotability','contestEligible','contestResolveGroup','contestResolveVillager'];
const copy=x=>x===undefined?null:JSON.parse(JSON.stringify(x));
function install(G,options={}){
 const limit=options.limit??10000,fromDay=options.fromDay??0,toDay=options.toDay??Infinity;
 if(!Number.isInteger(limit)||limit<0||!Number.isFinite(fromDay)||!(toDay>=fromDay))throw Error('Invalid contest observer bounds');
 const events=[],calls={},missing=[],errors=[],stack=[],originals=new Map(),ids=new WeakMap();let next=0,nextAc=0,dropped=0,filtered=0;
 const acId=a=>{if(!a||typeof a!=='object')return null;if(!ids.has(a))ids.set(a,++nextAc);return ids.get(a);};
 function snapshot(){const st=G.state||{},s=st.scholar||{},v=st.village||{},ap=st.alienPlayers||{},ac=st.activeContest;return copy({day:s.day,part:G.dayPart,bearer:G.villagerId,health:s.health,kcal:s.kcal,abilities:s.abilities,backgroundAbilities:s.backgroundAbilities,skills:s.skills,tracks:s.tracks,trauma:s.trauma,equipped:s.equipped,inventory:s.inventory,godpath:s.godpath,godhood:s.godhood,fanClubs:ap.fanClubs,favor:ap.favor,notability:st.notability,contestClock:st.nextContestDay,activeId:acId(ac),active:ac?{contestId:ac.contestId,kind:ac.kind,participant:ac.participant,participants:ac.participants,others:ac.others,phase:ac.phase,phaseIdx:ac.phaseIdx,variant:ac.variant,wounds:ac.wounds,standing:ac.standing,demand:ac._mootDemand,cheer:ac.cheer,heckle:ac.heckle,prizeGranted:ac._prizeGranted}:null,roster:v.roster});}
 function inputs(name,args){const ac=name==='contestChoose'?G.state?.activeContest:args[0],out={};if(['fireContest','fireShow'].includes(name))out.definition=args[0];else if(name==='contestChoose'){const phase=ac?.phases?.[ac.phaseIdx||0];out.ac=acId(ac);out.index=args[0];out.phase=phase?.id;out.choice=phase?.choices?.[args[0]];}
  else if(name.startsWith('_contest')||name.startsWith('_show')||['_cxItemPrize','_cxPrizeLane'].includes(name)){out.ac=acId(ac);out.contestId=ac?.contestId;out.participant=ac?.participant;out.variant=ac?.variant;out.phase=ac?.phase;out.phases=ac?.phases;out.args=args.slice(1);}
  else if(name==='alienLootGrant')out.args=[args[0],args[1]?{id:args[1].id,kind:args[1].kind,hasItems:Array.isArray(args[1].items),items:args[1].items}:null];
  else out.args=args;return copy(out);
 }
 for(const name of METHODS){const fn=G[name];if(typeof fn!=='function'){missing.push(name);continue;}const wrapper=function(...args){if(!ROOTS.has(name)&&!stack.length)return fn.apply(this,args);const id=++next,parent=stack.at(-1)||null,before=snapshot(),day=before.day??0,keep=day>=fromDay&&day<=toDay;calls[name]=(calls[name]||0)+1;const input=keep?inputs(name,args):null;stack.push(id);let result,error;
   try{result=fn.apply(this,args);return result;}catch(e){error={name:e.name,message:e.message};throw e;}finally{stack.pop();if(!keep)filtered++;else if(events.length>=limit)dropped++;else{try{events.push({id,parent,name,input,before,after:snapshot(),returnedType:result===null?'null':typeof result,result:copy(result),error});}catch(e){errors.push({id,name,message:e.message});}}}
  };originals.set(name,{fn,wrapper});G[name]=wrapper;}
 return{events,calls,missing,errors,get dropped(){return dropped;},get filtered(){return filtered;},finish(){return{schemaVersion:1,limit,fromDay,toDay:Number.isFinite(toDay)?toDay:null,dropped,filtered,calls:copy(calls),missing:missing.slice(),errors:copy(errors),events:events.slice().sort((a,b)=>a.id-b.id)};},restore(){for(const[name,{fn,wrapper}]of originals)if(G[name]===wrapper)G[name]=fn;else errors.push({name,message:'Another wrapper replaced this observer; restore skipped'});}};
}
module.exports={install,METHODS};
