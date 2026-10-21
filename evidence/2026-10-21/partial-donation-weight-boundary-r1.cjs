'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
(async()=>{
 if(process.argv[2]==='--child'){
  const root=process.argv[3],K=require(path.join(root,'scripts/godpath/lib')),G=await K.load({seed:7002});K.newRun(G);G.enterBuilding();const s=G.state.scholar,v=G.state.village;s.day=85;s.inventory=[{name:'Declared tiny high-energy food',units:10,kcalEach:750,kg:.01,foodState:'cooked',safe:true,edible:true,spoilDay:100}];v.pantry=[];
  G.donateToPantry(0,3);const moved=10-(s.inventory[0]?.units||0),weight=v.pantry.reduce((n,i)=>n+i.units*i.kg,0);process.stdout.write('@@WEIGHT@@'+JSON.stringify({root,moved,expectedWeight:moved*.01,pantryWeight:weight,ratio:weight/(moved*.01)})+'\n');return;
 }
 const before=require('./partial-donation-baseline-reuse-r1.json').root,after=require('./partial-donation-controller-root-r1.json').root;
 const results=[before,after].map(root=>{const p=cp.spawnSync(process.execPath,[__filename,'--child',root],{env:process.env,encoding:'utf8',maxBuffer:2e6});if(p.status)throw Error(p.stderr||p.stdout);return JSON.parse(p.stdout.split('@@WEIGHT@@').pop());});
 assert(results.every(r=>Math.abs(r.ratio-2)<1e-9));
 fs.writeFileSync('evidence/2026-10-21/partial-donation-weight-boundary-r1.json',JSON.stringify({scope:'Declared tiny high-energy fixture; inherited0.01kg minimum per pantry piece inflates storage mass in both old and new Game. Food/calorie credit and retained-row metadata are separate; no general mass-conservation clearance.',results},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(results));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
