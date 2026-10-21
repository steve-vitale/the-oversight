'use strict';
// Optional sidecar. Read saved fields only; never call a permission, RNG or
// production helper while observing. Not part of the balanced metric contract.
function install(G) {
  const report = { schemaVersion:1, calls:{}, made:0, sown:{player:0,npc:0}, playerHarvests:0,
    playerHarvestKcal:0, pantryDeliveries:0, pantryDeliveredKcal:0, cropDeaths:0,
    gardenDutyAttempts:0, gardenDutyRedirects:0, tendedDutyPlots:0,
    events:[], days:[], errors:[] };
  const plots = () => G.map?.tiles?.[4]?.[4]?.plots || [];
  const day = () => G.state?.scholar?.day || 0;
  const copy = () => plots().map(p => ({...p}));
  const calories = rows => (rows || []).reduce((n,i) => n + (Number(i.units)||0)*(Number(i.kcalEach)||0),0);
  const event = (type, data) => report.events.push({day:day(),type,...data});
  const safe = fn => { try { return fn(); } catch(e) { report.errors.push(e.message); } };
  const originals = new Map();
  function wrap(name, before, after) {
    const original=G[name]; if(typeof original!=='function') return;
    originals.set(name,original);
    G[name]=function(...args) {
      report.calls[name]=(report.calls[name]||0)+1;
      const old=safe(()=>before(args));
      const result=original.apply(this,args);
      safe(()=>after(old,args)); return result;
    };
  }
  wrap('makePlot',()=>plots().length,n=>{const added=plots().length-n;if(added>0){report.made+=added;event('made',{count:added});}});
  for(const [name,who] of [['sowPlot','player'],['villagerSowPlot','npc']])
    wrap(name,copy,(before,args)=>{plots().forEach((p,i)=>{if(p.pid&&(!before[i]?.pid||before[i].dead)){
      report.sown[who]++;event('sown',{who,actor:who==='npc'?args[0]:G.villagerId,index:i,pid:p.pid});
    }});});
  let harvestContext=null, dutyContext=null;
  const settleHarvest=old=>{
    if(!old||old.settled)return;old.settled=true;
    const harvested=plots().filter((p,i)=>p.lastHarvest> (old.plots[i]?.lastHarvest||0)).length;
    if(harvested){const kcal=Math.max(0,calories(G.state.scholar.inventory)-old.kcal);
      report.playerHarvests+=harvested;report.playerHarvestKcal+=kcal;event('player-harvest',{plots:harvested,kcal,actor:G.villagerId});}
  };
  const harvest=G.harvestGarden;
  if(typeof harvest==='function'){
    originals.set('harvestGarden',harvest);
    G.harvestGarden=function(...args){
      report.calls.harvestGarden=(report.calls.harvestGarden||0)+1;
      const parent=harvestContext,context={plots:copy(),kcal:calories(G.state.scholar.inventory)};
      harvestContext=context;
      try{return harvest.apply(this,args);}finally{safe(()=>settleHarvest(context));harvestContext=parent;}
    };
  }
  // Harvest output is delivered BEFORE its paid time passes. Observe there,
  // excluding meals, spoilage and NPC production during the following tick.
  wrap('tickAction',()=>safe(()=>settleHarvest(harvestContext)),()=>{});
  const duty=G.resolveOneAssignment;
  if(typeof duty==='function'){
    originals.set('resolveOneAssignment',duty);
    G.resolveOneAssignment=function(vid,a,...args){
      const parent=dutyContext,context=a?.task==='garden'?{vid,before:copy()}:null;
      if(context){report.gardenDutyAttempts++;dutyContext=context;}
      try{return duty.call(this,vid,a,...args);}finally{
        if(context)safe(()=>{const tended=plots().filter((p,i)=>p.pid&&!p.dead&&p.lastTend>(context.before[i]?.lastTend||0)).length;
          report.tendedDutyPlots+=tended;if(tended)event('duty-tend',{actor:vid,plots:tended});});
        dutyContext=parent;
      }
    };
  }
  const alt=G.prodThrottleAltTask;
  if(typeof alt==='function'){
    originals.set('prodThrottleAltTask',alt);
    G.prodThrottleAltTask=function(...args){const result=alt.apply(this,args);if(dutyContext){report.gardenDutyRedirects++;event('duty-redirect',{actor:dutyContext.vid,to:result});}return result;};
  }
  wrap('stockPantry',args=>args[1]==='Garden harvest'?calories(G.state.village.pantry):null,(before,args)=>{
    if(before===null)return;const kcal=Math.max(0,calories(G.state.village.pantry)-before);
    if(kcal>0){report.pantryDeliveries++;report.pantryDeliveredKcal+=kcal;event('pantry-delivery',{requestedKcal:args[0],deliveredKcal:kcal});}
  });
  wrap('gardenTick',copy,before=>{plots().forEach((p,i)=>{if(before[i]?.pid&&!before[i].dead&&p.dead){report.cropDeaths++;event('crop-death',{pid:before[i].pid,index:i});}});});
  function sample() {
    safe(()=>{
      const s=G.state.scholar,v=G.state.village,p=plots();
      const row={day:day(),bearer:G.villagerId,tier:v.havenTier||0,plots:p.length,
        planted:p.filter(x=>x.pid&&!x.dead).length,dead:p.filter(x=>x.dead).length,
        gardenAssignments:Object.values(v.assignments||{}).filter(a=>a?.task==='garden').length,
        playerGardenerAbilities:(s.abilities||[]).filter(a=>['green_thumb','green_whisper','rain_dancer','cornucopia','photosynthesis'].includes(a.id)).map(a=>({id:a.id,level:a.level||1}))};
      const i=report.days.findIndex(x=>x.day===row.day);if(i<0)report.days.push(row);else report.days[i]=row;
    });
  }
  return {report,sample,restore(){for(const [name,fn]of originals)G[name]=fn;}};
}
module.exports={install};
