'use strict';
// Selected exact-case review. Passive snapshots are accepted only if the full
// final Game state, outcome and all contract metrics replay the retained panel.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
const B=require('./balance-panel'),gear=require('./gear-usage-audit');
const {compareBoundaries}=require('./lib/replay-boundaries');
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const read=f=>JSON.parse(f.endsWith('.gz')?z.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f,'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
function snapshot(G){const s=G.state.scholar,v=G.state.village||{};return clone({day:s.day,bearer:G.villagerId,over:G.over,won:G.won,kcal:s.kcal,health:s.health,godhood:s.godhood,roster:v.roster,healths:v.health,needs:v.needs,trust:v.trust,pantry:v.pantry,people:(G.data.villagers||[]).filter(p=>(v.roster||[]).includes(p.id)).map(p=>({id:p.id,items:p.items,equipped:p.equipped})),npcGodhood:v.npcGodhood});}
function differences(a,b,p='',out=[]){if(JSON.stringify(a)===JSON.stringify(b))return out;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)])){if(out.length>=24)break;differences(a[k],b[k],p+'/'+k,out);}}else out.push({path:p,before:a===undefined?'[absent]':a,after:b===undefined?'[absent]':b});return out;}
(async()=>{
 if(process.argv.includes('--child')){
  const root=path.resolve(arg('root')),policy=arg('policy'),seed=Number(arg('seed')),panel=read(arg('panel'));if(panel.options.occupation!=null)throw Error('This selected-case reviewer does not support occupation panels');const expected=panel.rows.find(r=>r.row.policy===policy&&r.row.seed===seed);
  if(!expected)throw Error('Missing exact retained case');
  if(JSON.stringify(B.manifest(root))!==JSON.stringify(panel.sources))throw Error('Source drift');
  const H=require(path.join(root,'scripts/sim-harness')),C=require(path.join(root,'scripts/sweep-compare')),base=C.POLICY_REGISTRY[policy];let G,o;const snapshots=[],events=[],warnings=[],warn=console.warn;
  console.warn=(...x)=>{warnings.push(x.map(String).join(' '));};
  C.POLICY_REGISTRY[policy]={...base,setup(g,ctx){G=g;o=B.install(g);const tele=g.tele;g.tele=function(type,data){if(/god_|godhood|ascen/.test(String(type)))events.push(clone({day:g.state.scholar.day,type,data}));return tele.apply(this,arguments);};if(base.setup)return base.setup(g,ctx);},daily(g,ctx){snapshots.push({at:'before',value:snapshot(g)});const r=base.daily&&base.daily(g,ctx);o.sample();snapshots.push({at:'after',value:snapshot(g)});return r;}};
  let report;try{report=await H.quietLog(()=>C.runComparison({seeds:[seed],policies:[policy],days:panel.options.days,origin:panel.options.origin,...(panel.options.region?{region:panel.options.region}:{})}));}finally{console.warn=warn;}
  const row=report.runs[0],observed=o.finish(row),stateHash=gear.gameplayHash(G.state),checks={state:stateHash===expected.stateHash,row:JSON.stringify(row)===JSON.stringify(expected.row),metrics:JSON.stringify(observed.metrics)===JSON.stringify(expected.metrics),warnings:warnings.length===0,observer:observed.observerErrors.length===0};
  process.stdout.write('@@REVIEW@@'+JSON.stringify({policy,seed,checks,row,metrics:observed.metrics,events,snapshots,final:snapshot(G),finalState:clone(G.state)})+'\n');return;
 }
 if(!arg('plan')||!arg('out'))throw Error('--plan <plan.json> --out <prefix> required');
 const plan=read(arg('plan')),prefix=arg('out');
 const panels=Object.fromEntries(['before','after'].map(arm=>[arm,read(plan[arm+'Panel'])]));const selected=Array.isArray(plan.cases)?plan.cases.map(c=>({...c})):[];
 if(new Set(selected.map(c=>c.policy+':'+c.seed)).size!==selected.length||selected.some(c=>!Number.isSafeInteger(c.seed)||typeof c.policy!=='string'))throw Error('Invalid explicit review cases');
 for(const policy of (Array.isArray(plan.cases)?[]:panels.after.options.policies)){const before=new Map(panels.before.rows.filter(r=>r.row.policy===policy).map(r=>[r.row.seed,r]));const candidates=panels.after.rows.filter(r=>r.row.policy===policy&&before.get(r.row.seed).row.won&&!r.row.won).sort((a,b)=>a.row.seed-b.row.seed).slice(0,2);for(const r of candidates)selected.push({policy,seed:r.row.seed,reason:'first two sorted lost wins per policy; diagnostic selection, not a new effect estimate'});}
 const reviews=[];
 for(const item of selected){const pair={...item};for(const arm of ['before','after']){const r=cp.spawnSync(process.execPath,[__filename,'--child','--root',plan[arm+'Root'],'--panel',plan[arm+'Panel'],'--policy',item.policy,'--seed',String(item.seed)],{encoding:'utf8',timeout:120000,maxBuffer:32*1024*1024});if(r.status!==0)throw Error(r.stderr||r.stdout);pair[arm]=JSON.parse(r.stdout.split('@@REVIEW@@').pop());if(!Object.values(pair[arm].checks).every(Boolean))throw Error('Replay drift '+JSON.stringify({item,arm,checks:pair[arm].checks}));}
  const alignment=compareBoundaries(pair.before.snapshots,pair.after.snapshots,(a,b)=>differences(a,b));
  pair.firstObservedDifference=alignment.first;pair.snapshotAlignment={unmatchedBefore:alignment.unmatchedBefore,unmatchedAfter:alignment.unmatchedAfter};
  const normalizedState=state=>{const copy=clone(state);if(copy.pacing)for(const k of ['lastTs','dayMinutes','totalMin'])delete copy.pacing[k];return copy;};
  pair.finalStateDifferences=differences(normalizedState(pair.before.finalState),normalizedState(pair.after.finalState));
  reviews.push(pair);console.log('exact',item.policy,item.seed,'first observed summary difference',JSON.stringify(pair.firstObservedDifference));
 }
 const report={boundaryAlignment:'ordered-day-phase-occurrence-v1',scope:'Selected exact-case replays; association and coarse daily first differences do not establish the causal path to the ending',selection:Array.isArray(plan.cases)?'explicit predeclared panel case list; diagnostic, not a new effect estimate':'first two sorted lost-win cases per policy, no seed searching',plan,reviews};fs.writeFileSync(prefix+'.json.gz',z.gzipSync(JSON.stringify(report)));fs.writeFileSync(prefix+'-summary.json',JSON.stringify({...report,reviews:reviews.map(({before,after,...r})=>({...r,before:{checks:before.checks,row:before.row,events:before.events},after:{checks:after.checks,row:after.row,events:after.events}}))},null,2)+'\n');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
