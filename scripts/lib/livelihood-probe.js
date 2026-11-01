'use strict';
// Observe existing policy queries/actions only. Never issue a query or action.
const SCHEMA_VERSION=2;
const METHODS=['playerAtHaven','havenStoresAccess','nearFire','tradeSpirit','visitorWares','isFinishedFood','visitorBuyWare','traderSell','goodsTradePrice','traderPay'];
const ITEM=['itemId','plantId','id','name','units','kcalEach','rawKcal','prep','foodState','safe','edible','kind','price','sold','ok','short','paid'];
const select=(value,keys)=>Object.fromEntries(keys.filter(k=>value[k]!==undefined).map(k=>[k,value[k]]));
const view=value=>value===undefined?{type:'undefined'}:Array.isArray(value)?value.map(view):value&&typeof value==='object'?select(value,ITEM):value;
function install(G,{limit=200000}={}){
 const rows=[],errors=[],restore=[];let phase=null,depth=0,overflow=false,restored=false;
 const fail=e=>{if(errors.length<40)errors.push(e.message||String(e));};
 function add(row){try{if(rows.length>=limit){if(!overflow){overflow=true;fail(Error('Livelihood probe row limit reached'));}return;}rows.push(row);}catch(e){fail(e);}}
 function snapshot(){try{
  const state=G.state,s=state.scholar||{},v=state.village||{},m=state.run?.map;
  return{day:s.day,tick:s.dayTicks,part:state.run?.dayPart,bearer:s.villagerId||state.villagerId,
   world:m?[m.px,m.py]:null,haven:[v.px??4,v.py??4],position:[s.mx,s.my],inside:s.insideHaven,
   health:s.health,kcal:s.kcal,tradesDone:s.tradesDone??null,inventory:(s.inventory||[]).map(view),
   equipped:Object.fromEntries(Object.entries(s.equipped||{}).filter(([,item])=>item).map(([slot,item])=>[slot,view(item)])),
   visitors:(v.visitors||[]).map(p=>({id:p.id,alive:p.alive,dead:p.dead,credit:p.credit??null,wares:p.wares?view(p.wares):null}))};
 }catch(e){fail(e);return null;}}
 for(const name of METHODS){
  const descriptor=Object.getOwnPropertyDescriptor(G,name),original=G[name];
  if(typeof original!=='function'||descriptor?.get||descriptor?.set){fail(Error('Unsupported probe method '+name));continue;}
  function observed(...args){
   const stack={};Error.captureStackTrace(stack,observed);
   const frames=(stack.stack||'').split('\n').slice(1).map(line=>line.replace(/\\/g,'/'));
   const caller=frames[0]||'',policyStack=frames.filter(line=>line.includes('/policies/livelihood.js:'));
   const direct=caller.includes('/policies/livelihood.js:');
   const nested=depth>0&&['goodsTradePrice','traderPay','isFinishedFood'].includes(name);
   if(!direct&&!nested)return Reflect.apply(original,this,args);
   const before=snapshot(),action=['visitorBuyWare','traderSell'].includes(name);let result,error;
   if(action)depth++;
   try{result=Reflect.apply(original,this,args);return result;}
   catch(e){error=e;throw e;}
   finally{
    if(action)depth--;
    try{add({kind:'method',method:name,phase,caller,policyStack,direct,before,after:snapshot(),args:args.map(view),result:view(result),error:error?.message||null});}catch(e){fail(e);}
   }
  }
  try{
   Object.defineProperty(G,name,descriptor?{...descriptor,value:observed}:{configurable:true,enumerable:true,writable:true,value:observed});
   restore.push(()=>descriptor?Object.defineProperty(G,name,descriptor):delete G[name]);
  }catch(e){fail(e);}
 }
 return{schemaVersion:SCHEMA_VERSION,rows,errors,hook(name,at,ctx){
  if(at==='before')phase=name;
  try{add({kind:'hook',hook:name,at,state:snapshot(),guards:select(ctx||{},['_tradeHarvestDay','_tradeCookDay','_makerCounterDay','_makerMaterialDay','_ledgerSortieKey','_capHuntKey']),
   counters:Object.fromEntries(Object.entries(ctx||{}).filter(([k,v])=>k.startsWith('livelihood')&&Number.isFinite(v)))});}catch(e){fail(e);}
  if(at==='after')phase=null;
 },restore(){if(restored)return;restored=true;for(const fn of restore.reverse())try{fn();}catch(e){fail(e);}}};
}
module.exports={install,METHODS,SCHEMA_VERSION};
