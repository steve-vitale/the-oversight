'use strict';
const fs=require('fs'),K=require('../../scripts/godpath/lib');
(async()=>{
 const G=await K.load({seed:7002});K.newRun(G);const s=G.state.scholar;
 G.map.tiles[4][4].plots=Array.from({length:6},()=>({pid:null,dead:true,weeds:6,lastTend:1,plantedDay:1,lastHarvest:0}));
 const snapshot=()=>JSON.stringify({plots:G.map.tiles[4][4].plots,kcal:s.kcal,day:s.day,inventory:s.inventory});
 const before=snapshot(),gates=Object.fromEntries(['make','sow','tend','harvest'].map(a=>[a,G.gardenGate(a)]));
 G.makePlot();G.sowPlot('wild_onion');G.tendGarden();G.harvestGarden();
 const report={scope:'Prepared six-dead-bed boundary, not a natural occurrence estimate; actual public garden gates and actions',gates,allFourActionsLeaveBedResourceStateUnchanged:before===snapshot(),gardenMethods:Object.keys(G).filter(k=>/garden|plot/i.test(k)).sort()};
 fs.writeFileSync('evidence/2026-10-20/garden-reclaim-probe-r1.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
