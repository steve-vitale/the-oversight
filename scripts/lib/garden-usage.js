'use strict';
const accounting=require('./garden-accounting');
// Optional sidecar. Read saved fields only; never call a permission, RNG or
// production helper while observing. Not part of the balanced metric contract.
function install(G) {
  const report = { schemaVersion:2, calls:{}, made:0, sown:{player:0,npc:0}, playerHarvests:0,
    playerHarvestKcal:0, pantryDeliveries:0, pantryDeliveredKcal:0, cropDeaths:0,
    gardenDutyAttempts:0, gardenDutyRedirects:0, tendedDutyPlots:0,
    events:[], days:[], errors:[], accounting:{initialStocks:accounting.stockSnapshot(G),intake:null,stocks:null,
      removedBySpoilageSweep:Object.fromEntries(accounting.KINDS.map(k=>[k,0])),
      costs:{scope:'Observed net reserve debits before clock work, NPC hunger equivalents at 25 kcal/point, nominal seeds, requested clock ticks and actual elapsed ticks. A dawn may discard clock overshoot; the two tick counts are distinct. Excludes normal metabolism and unpriced duty opportunity costs.',playerReserveKcal:0,npcHungerEquivalentKcal:0,seedUnits:0,seedNominalKcal:0,unvaluedSeedUnits:0,playerActionTicks:0,playerRequestedTicks:0,unknownWindows:0,byAction:{}}} };
  const plots = () => G.map?.tiles?.[4]?.[4]?.plots || [];
  const day = () => G.state?.scholar?.day || 0;
  const copy = () => plots().map(p => ({...p}));
  const calories = rows => (rows || []).reduce((n,i) => n + (Number(i.units)||0)*(Number(i.kcalEach)||0),0);
  const event = (type, data) => report.events.push({day:day(),type,...data});
  const safe = fn => { try { return fn(); } catch(e) { report.errors.push(e.message); } };
  const originals = new Map();
  function wrap(name, before, after, count=true) {
    const original=G[name]; if(typeof original!=='function') return;
    if(!originals.has(name))originals.set(name,original);
    G[name]=function(...args) {
      if(count)report.calls[name]=(report.calls[name]||0)+1;
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
  wrap('tickAction',args=>safe(()=>{settleHarvest(harvestContext);for(const c of paidContexts){settleCharge(c);if(!c.npc&&!G._ticking&&!G.tbfight)c.requestedTicks+=Math.max(0,Math.round(args[0]||1));}}),()=>{});
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
  wrap('sweepSpoiled',()=>accounting.stockSnapshot(G),before=>{
    const after=accounting.stockSnapshot(G);for(const key of accounting.KINDS)report.accounting.removedBySpoilageSweep[key]+=Math.max(0,before.totals[key]-after.totals[key]);
  });
  const paidContexts=new Set(),costs=report.accounting.costs;
  const clock=()=>Number.isFinite(G.TIME?.TICKS_PER_DAY)&&Number.isFinite(G.state.scholar.day)?G.state.scholar.day*G.TIME.TICKS_PER_DAY+(G.state.scholar.dayTicks||0):null;
  const seeds=pid=>(G.state.scholar.inventory||[]).filter(i=>pid&&i.plantId===pid).reduce((r,i)=>{const n=Number.isFinite(i.units)?i.units:0;r.units+=n;if(Number.isFinite(i.kcalEach)&&i.kcalEach>0)r.kcal+=n*i.kcalEach;else r.unvalued+=n;return r;},{units:0,kcal:0,unvalued:0});
  function settleCharge(c){
    if(!c||c.settled)return;c.settled=true;
    if(G.state!==c.state||G.villagerId!==c.bearer){c.unknown=true;return;}
    if(c.npc){const now=G.state.village.needs?.[c.who]?.hunger;if(!Number.isFinite(c.hunger)||!Number.isFinite(now))c.unknown=true;else c.npcKcal=Math.max(0,now-c.hunger)*25;}
    else{const now=G.state.scholar.kcal;if(!Number.isFinite(c.kcal)||!Number.isFinite(now))c.unknown=true;else c.playerKcal=Math.max(0,c.kcal-now);}
    const after=seeds(c.pid);c.seedUnits=Math.max(0,c.seeds.units-after.units);c.seedKcal=Math.max(0,c.seeds.kcal-after.kcal);c.unvalued=Math.max(0,c.seeds.unvalued-after.unvalued);
  }
  for(const name of ['makePlot','sowPlot','tendGarden','harvestGarden','reclaimGarden','cultivateGarden','useAbility'])wrap(name,args=>{
    if(name==='useAbility'&&(args[1]!=='cultivate'||!['green_thumb','green_whisper'].includes(args[0])))return null;
    if(name==='cultivateGarden'&&(args[0]==null||args[0]===G.villagerId))return null; // Player charge is observed around real useAbility, before dispatch.
    const who=['reclaimGarden','cultivateGarden'].includes(name)?args[0]:G.villagerId,npc=who!=null&&who!==G.villagerId,pid=name==='sowPlot'?args[0]:null;
    const c={name:name==='useAbility'?'cultivate':name,who,npc,pid,state:G.state,bearer:G.villagerId,kcal:G.state.scholar.kcal,hunger:G.state.village.needs?.[who]?.hunger,seeds:seeds(pid),start:clock(),settled:false,playerKcal:0,npcKcal:0,requestedTicks:0};paidContexts.add(c);return c;
  },c=>{
    if(!c)return;settleCharge(c);paidContexts.delete(c);const ticks=clock(),elapsed=!c.npc&&ticks!=null&&c.start!=null&&G.state===c.state&&G.villagerId===c.bearer?Math.max(0,ticks-c.start):0;
    const r=costs.byAction[c.name]||(costs.byAction[c.name]={attempts:0,charged:0,playerReserveKcal:0,npcHungerEquivalentKcal:0,seedUnits:0,seedNominalKcal:0,unvaluedSeedUnits:0,playerActionTicks:0,playerRequestedTicks:0,unknownWindows:0});
    r.attempts++;if(c.playerKcal||c.npcKcal||c.seedUnits||elapsed)r.charged++;
    for(const book of [costs,r]){book.playerReserveKcal+=c.playerKcal;book.npcHungerEquivalentKcal+=c.npcKcal;book.seedUnits+=c.seedUnits||0;book.seedNominalKcal+=c.seedKcal||0;book.unvaluedSeedUnits+=c.unvalued||0;book.playerActionTicks+=elapsed;book.playerRequestedTicks+=c.requestedTicks;if(c.unknown)book.unknownWindows++;}
  },false);
  function sample() {
    safe(()=>{
      const s=G.state.scholar,v=G.state.village,p=plots();
      const row={day:day(),bearer:G.villagerId,tier:v.havenTier||0,plots:p.length,
        planted:p.filter(x=>x.pid&&!x.dead).length,dead:p.filter(x=>x.dead).length,
        gardenAssignments:Object.values(v.assignments||{}).filter(a=>a?.task==='garden').length,
        playerGardenerAbilities:(s.abilities||[]).filter(a=>['green_thumb','green_whisper','rain_dancer','cornucopia','photosynthesis'].includes(a.id)).map(a=>({id:a.id,level:a.level||1}))};
      const i=report.days.findIndex(x=>x.day===row.day);if(i<0)report.days.push(row);else report.days[i]=row;
      report.accounting.intake=accounting.intakeSnapshot(v);report.accounting.stocks=accounting.stockSnapshot(G);
    });
  }
  return {report,sample,restore(){for(const [name,fn]of originals)G[name]=fn;}};
}
module.exports={install};
