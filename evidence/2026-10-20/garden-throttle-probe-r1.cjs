'use strict';
// Prepared mechanic contrast, NOT a natural campaign. Separate processes.
const K=require('../../scripts/godpath/lib'),fs=require('fs'),B=require('../../scripts/balance-panel');
(async()=>{
 const G=await K.load({seed:7002});K.newRun(G);const s=G.state.scholar,v=G.state.village;
 s.day=20;s.kcal=5000;v.pantry=[];v.hungryStreak=0;
 G.stockPantry(200000,'Prepared surplus');
 const worker=v.roster.find(id=>id!==G.villagerId),plant=G.data.plants.find(p=>p.form==='shoots');
 const plot={pid:plant.id,plantedDay:1,lastTend:19,lastHarvest:0,weeds:0,dead:false};G.map.tiles[4][4].plots=[plot];
 const engaged=G.prodThrottleEngaged(),before={plot:{...plot},freshDays:G.pantryFreshDays()};
 if(!engaged)throw Error('Prepared source scene did not naturally engage surplus throttle');
 const counterfactual=process.argv.includes('--unthrottled');if(counterfactual)G.prodThrottleEngaged=()=>false;
 const messages=[],say=G.say;G.say=function(m){messages.push(String(m));return say.apply(this,arguments);};
 G.resolveOneAssignment(worker,{task:'garden'});
 const report={scope:'Prepared abundant-pantry actual garden duty; one deliberate throttle predicate intervention in the counterfactual, same seeded setup. Does not measure campaign causality or balance.',source:B.manifest(process.cwd()),counterfactual,worker,engaged,before,after:{plot:{...plot}},messages};
 const file='evidence/2026-10-20/garden-throttle-'+(counterfactual?'off':'on')+'-r1.json';fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({counterfactual,engaged,tended:plot.lastTend===20,harvested:plot.lastHarvest===20,messages}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
