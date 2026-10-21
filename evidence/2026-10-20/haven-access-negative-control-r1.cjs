'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),B=require('../../scripts/balance-panel');
const prefix='evidence/2026-10-20/haven-access-negative-control-r1';
(async()=>{
 if(process.argv.includes('--child')){
  const root=path.resolve(process.argv.at(-1)),K=require(path.join(root,'scripts/godpath/lib')),sources=B.manifest(root),G=await K.load({seed:7002}),store=new Map();
  globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i]??null,get length(){return store.size;}};
  K.newRun(G);let t=G.playerTile();const seedFn=G.detailSeed;let blocked=0;
  for(let seed=0;seed<256;seed++){G.detailSeed=()=>seed;G.state.scholar.insideHaven=false;delete t.detail;delete t.groundsDetail;const c=G.genDetail(G.map.px,G.map.py);if(G.cellProps(c[5][4]).blocks)blocked++;}
  G.detailSeed=seedFn;K.newRun(G);G.save();const s=G.state.scholar,before=s.kcal;G.exitBuilding();
  const saved=JSON.parse(store.get(G.state.runKey)),checks={generatedDoorstepClear:blocked===0,southDoorLanding:s.mx===4&&s.my===5,exitPersistedBeforeUnload:saved.scholar.insideHaven===false&&saved.scholar.mx===4&&saved.scholar.my===5};
  checks.actualPaidStep=G.microMove(4,6)!==false&&s.mx===4&&s.my===6&&s.kcal<before;
  assert.deepEqual(B.manifest(root),sources);console.log('@@NEGATIVE@@'+JSON.stringify({root,sources,blocked,checks}));process.exitCode=Object.values(checks).every(Boolean)?0:1;return;
 }
 const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim()),roots={before:path.join(common,'haven-access-baseline-3f09b84a1'),after:process.cwd()},report={scope:'Same independent public-action assertions against immutable old source and current candidate, separate shared harness processes. This proves the doorway control detects the old faults; it is not campaign or full save-safety coverage.',arms:{}};
 for(const[arm,root]of Object.entries(roots)){
  const run=cp.spawnSync(process.execPath,[__filename,'--child',root],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024}),split=run.stdout.split('@@NEGATIVE@@');
  if(split.length!==2)throw Error('Control crashed instead of reporting assertions: '+run.stderr);
  report.arms[arm]={...JSON.parse(split[1]),exitCode:run.status};
  assert.equal(run.status,arm==='before'?1:0,'Expected RED/GREEN control exit');
 }
 assert(Object.values(report.arms.before.checks).every(v=>v===false));assert(Object.values(report.arms.after.checks).every(Boolean));
 fs.writeFileSync(prefix+'.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({before:report.arms.before.checks,after:report.arms.after.checks}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
