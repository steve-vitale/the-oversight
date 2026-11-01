'use strict';
// Passive trace over the existing terminal runner, checked against its retained
// off-control. No copied harness or injected player decisions.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
if(process.env.CAMPAIGN_FEAST_TRACE_ROOT){
 const H=require(path.join(process.env.CAMPAIGN_FEAST_TRACE_ROOT,'scripts/sim-harness')),load=H.loadGame,run=H.runDays;
 const opportunities=process.env.CAMPAIGN_FEAST_OPPORTUNITIES==='1';
 let events=[],errors=[],snapshot;
 H.loadGame=async function(...args){const result=await load.apply(this,args),G=result.Game;
  function snap(){const s=G.state?.scholar||{},v=G.state?.village||{},pg=s.prog||{};return{day:s.day,part:G.dayPart,bearer:s.villagerId,hp:s.health,kcal:s.kcal,hydration:s.hydration,pantryKcal:v.pantryKcal,armed:pg.feastSurge,used:!!pg.feastSurgeUsed,buff:s.feastBuff,feastDay:s.feastDay,...(opportunities?{dayTicks:s.dayTicks,gives:(v.gives||{})[s.villagerId],abilities:s.abilities,skills:s.skills}: {})};}
  snapshot=()=>JSON.parse(JSON.stringify(snap()));
  for(const name of ['hostFeast','grantFeastBuff','_spendFeastedPower','faceFeastDraw','endDay','say']){
   const original=G[name];if(typeof original!=='function')continue;
   G[name]=function(...xs){
    const capture=name!=='say'||/feast|surge|reactor|table.*seat/i.test(String(xs[0]));
    let event;if(capture)try{event={name,before:JSON.parse(JSON.stringify(snap())),...(name==='say'?{text:String(xs[0])}:{})};}catch(e){errors.push(e.message);}
    const reply=original.apply(this,xs);
    if(event)try{event.after=JSON.parse(JSON.stringify(snap()));if(name!=='say'&&name!=='endDay')event.reply=reply;events.push(event);}catch(e){errors.push(e.message);}
    return reply;
   };
  }
  if(opportunities)for(const name of ['playerAtHaven','feastPlan','fusionReactorOnline']){
   const original=G[name];if(typeof original!=='function')continue;
   G[name]=function(...xs){const reply=original.apply(this,xs);try{const stack=new Error().stack||'';if(/at (?:scaleFeast|eveningFeast)\b/.test(stack))events.push({name,before:snapshot(),reply,gate:stack.includes('at scaleFeast')?'scaleFeast':'eveningFeast'});}catch(e){errors.push(e.message);}return reply;};
  }
  return result;
 };
 if(opportunities)H.runDays=function(G,policy,...xs){
  const wrapped={...policy};
  for(const hook of ['upkeep','daily'])if(typeof policy[hook]==='function')wrapped[hook]=function(g,c){
   const capture=phase=>{try{if(g.dayPart===2)events.push({name:'policy:'+hook+':'+phase,before:snapshot(),context:JSON.parse(JSON.stringify({gives:c._givesHist,tribute:c._tribHist,scaleLast:c._fsLastFeastDay,eveningLast:c._lastFeastDay}))});}catch(e){errors.push(e.message);}};
   capture('before');try{return policy[hook].call(this,g,c);}finally{capture('after');}
  };
  return run.call(this,G,wrapped,...xs);
 };
 process.on('exit',()=>fs.writeFileSync(process.env.CAMPAIGN_FEAST_TRACE_FILE,z.gzipSync(JSON.stringify({events,errors})),{flag:'wx'}));
}else if(require.main===module){
 const arg=n=>process.argv[process.argv.indexOf(n)+1],file=arg('--report'),seed=Number(arg('--seed')),out=arg('--out');
 if(!file||!out)throw Error('--report --seed --out required');
 const audit=JSON.parse(z.gunzipSync(fs.readFileSync(file))),r=audit.results.find(r=>r.seed===seed&&r.cap===3000&&r.job.trace===0);
 if(!r||!audit.stable||audit.neutral.some(n=>!n.match)||audit.prefixes.some(p=>!p.ok))throw Error('Missing controlled terminal case');
 for(const suffix of ['-events.json.gz','-result.json.gz','-comparison.json'])if(fs.existsSync(out+suffix))throw Error('Fresh output prefix required');
 const output=cp.execFileSync(process.execPath,['--require',__filename,path.join(__dirname,'campaign-terminal-audit.js'),'--child','--root',audit.plan.root,'--seed',String(seed),'--cap','3000','--prefix-cap','600','--policy',r.policy,'--trace','0'],{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,CAMPAIGN_FEAST_TRACE_ROOT:audit.plan.root,CAMPAIGN_FEAST_TRACE_FILE:path.resolve(out+'-events.json.gz'),CAMPAIGN_FEAST_OPPORTUNITIES:process.argv.includes('--opportunities')?'1':'0'}});
 const actual=JSON.parse(output.split('@@TERMINAL@@').pop()),fields=['row','stateHash','observation','terminal','notes','rngTail','sources'];
 const checks=Object.fromEntries(fields.map(k=>[k,JSON.stringify(actual[k])===JSON.stringify(r[k])]));
 const trace=JSON.parse(z.gunzipSync(fs.readFileSync(out+'-events.json.gz')));
 fs.writeFileSync(out+'-result.json.gz',z.gzipSync(JSON.stringify(actual)),{flag:'wx'});
 const report={report:path.resolve(file),seed,checks,traceErrors:trace.errors,events:trace.events.length,terminal:actual.terminal};
 fs.writeFileSync(out+'-comparison.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
 if(Object.values(checks).some(v=>!v)||trace.errors.length)process.exitCode=1;
}
