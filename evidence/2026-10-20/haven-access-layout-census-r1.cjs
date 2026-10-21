'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),z=require('node:zlib'),assert=require('node:assert/strict'),B=require('../../scripts/balance-panel');
const arg=name=>{const n=process.argv.indexOf('--'+name);return n<0?null:process.argv[n+1];};
(async()=>{
 if(process.argv.includes('--child')){
  const root=path.resolve(arg('root')),K=require(path.join(root,'scripts/godpath/lib')),sources=B.manifest(root),G=await K.load({seed:7002});K.newRun(G);
  const s=G.state.scholar,t=G.playerTile(),rows=[];s.insideHaven=false;
  for(let seed=0;seed<256;seed++){G.detailSeed=()=>seed;delete t.detail;delete t.groundsDetail;const cells=G.genDetail(G.map.px,G.map.py);rows.push({seed,cells:JSON.parse(JSON.stringify(cells))});}
  assert.deepEqual(B.manifest(root),sources,'Source fixed during layout census');
  console.log('@@LAYOUT@@'+JSON.stringify({root,head:B.sourceHead(root),sources,rows}));return;
 }
 const arms={};for(const name of ['before','after']){const root=path.resolve(arg(name+'-root')),r=cp.spawnSync(process.execPath,[__filename,'--child','--root',root],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});if(r.status!==0)throw Error(r.stderr||r.stdout);arms[name]=JSON.parse(r.stdout.split('@@LAYOUT@@').pop());}
 const oldBlocked=[],changed=[];
 for(let n=0;n<256;n++){
  const a=arms.before.rows[n],b=arms.after.rows[n],count=(cells,type)=>cells.flat().filter(c=>c===type).length;
  assert.equal(a.seed,b.seed);assert.equal(count(a.cells,'tent'),count(b.cells,'tent'),'Actual shelter count seed '+n);
  assert.equal(count(a.cells,'fire'),count(b.cells,'fire'));assert.equal(count(a.cells,'lodge'),count(b.cells,'lodge'));
  assert.equal(count(a.cells,'plant'),count(b.cells,'plant'));assert.equal(count(a.cells,'bush'),count(b.cells,'bush'));
  assert.equal(b.cells[5][4],'dirt','Reserved doorstep seed '+n);
  if(a.cells[5][4]==='tent')oldBlocked.push(n);
  const diffs=[];for(let y=0;y<9;y++)for(let x=0;x<9;x++)if(a.cells[y][x]!==b.cells[y][x]){assert(x===4&&y===5||x===2&&y===5,'Unrelated terrain changed');diffs.push({x,y,before:a.cells[y][x],after:b.cells[y][x]});}
  if(diffs.length)changed.push({seed:n,diffs});
 }
 const report={scope:'Independent same-driver before/after private terrain-seed census through actual genDetail, separate harness processes. Static generation, not 256 campaigns or natural availability.',seeds:256,oldBlocked:oldBlocked.length,newBlocked:0,shelterCountsPreserved:true,fireHallTeachingGardenPreserved:true,changed,arms};
 const out=arg('out');fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify(report)),{flag:'wx'});fs.writeFileSync(out+'-summary.json',JSON.stringify({...report,arms:undefined,changed:undefined,oldBlockedSeeds:oldBlocked},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({seeds:256,oldBlocked:oldBlocked.length,newBlocked:0,changedLayouts:changed.length,shelterCountsPreserved:true,otherFeaturesPreserved:true}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
