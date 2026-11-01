'use strict';
// Passive: retain only calls the game/controller already makes. No additional
// Game queries, menu generation, RNG, clock changes or private actions.
const SCHEMA_VERSION=2;
const METHODS=['startConvo','convoTurn','endConvo','convoFavorActionMenu','convoFavorCommit','convoPerformFavor'];
function install(G,{limit=100000}={}){
 const rows=[],errors=[],restore=[],missingMethods=[],counts={};let depth=0,phase=null,restored=false,overflow=false;
 const copy=x=>x===undefined?null:JSON.parse(JSON.stringify(x));
 const fail=e=>{if(errors.length<40)errors.push(e?.message||String(e));};
 const add=row=>{if(rows.length>=limit){if(!overflow){overflow=true;fail(Error('Conversation probe row limit reached'));}return;}rows.push(row);};
 function view(vid){
  const s=G.state?.scholar||{},v=G.state?.village||{},c=v.conv?.[vid],p=v.positions?.[vid];
  return copy({day:s.day,tick:s.dayTicks,bearer:G.villagerId,engineOver:!!G.over,dead:s.dead,health:s.health,kcal:s.kcal,water:s.waterL,position:[s.mx,s.my],inside:s.insideHaven,npcPosition:p,npcNode:v.nodePos?.[vid],npcInside:v.npcInside?.[vid],away:v.away?.[vid],rostered:(v.roster||[]).includes(vid),favor:v.favorLedger?.[vid],promise:v.promises?.[vid],conversation:c?{active:c.active,thread:c.thread,budget:c.budget,exchanges:c.exchanges,spokenBeat:c.spokenBeat,pendingQ:c.pendingQ,genericQ:c.genericQ,reactiveQ:c.reactiveQ,choosingSubject:c.choosingSubject,offeredReplies:c.offeredReplies,want:c.want?{id:c.want.id,stage:c.want.stage,resolution:c.want.resolution}:null,visible:c.transcript?.filter(e=>e.who==='them').at(-1)}:null});
 }
 for(const name of METHODS){
  const descriptor=Object.getOwnPropertyDescriptor(G,name);
  if(descriptor?.get||descriptor?.set){missingMethods.push(name);continue;}
  const original=G[name];if(typeof original!=='function'){missingMethods.push(name);continue;}
  function observed(...args){
   const vid=args[0],level=depth++;let before,result,error,anchor,thrown=false;
   try{anchor=G.state?.village?.conv?.[vid]?.transcript?.at(-1);before=view(vid);}catch(e){fail(e);}
   try{result=Reflect.apply(original,this,args);return result;}catch(e){error=e;thrown=true;throw e;}
   finally{
    depth--;counts[name]=(counts[name]||0)+1;
    try{
     const c=G.state?.village?.conv?.[vid],t=c?.transcript||[],index=anchor?t.indexOf(anchor):-1;
     const added=name==='startConvo'?t:t.slice(index+1);
     add({kind:'call',seq:rows.length,method:name,depth:level,phase,vid,args:copy(args.slice(1)),before,after:view(vid),result:copy(result),added:copy(added),anchorLost:!!anchor&&index<0&&name!=='startConvo',thrown,error:thrown?String(error?.message??error):null});
    }catch(e){fail(e);}
   }
  }
  try{Object.defineProperty(G,name,descriptor?{...descriptor,value:observed}:{configurable:true,enumerable:true,writable:true,value:observed});restore.push(()=>descriptor?Object.defineProperty(G,name,descriptor):delete G[name]);}catch(e){fail(e);}
 }
 return{schemaVersion:SCHEMA_VERSION,rows,errors,coverage:{methods:METHODS,missingMethods,counts,scope:'Existing call capture only. No calls are unknown opportunities, not feature defects; headless transcripts do not establish browser visibility or native actionability.'},hook(name,at){if(at==='before')phase=name;else if(at==='after')phase=null;},restore(){if(restored)return;restored=true;for(const fn of restore.reverse())try{fn();}catch(e){fail(e);}}};
}
module.exports={install,METHODS,SCHEMA_VERSION};
