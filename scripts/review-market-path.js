'use strict';
// Diagnose real offered builds and paid trade deeds. Never score another option,
// grant a power, evaluate a gate or make a choice from observation.
const fs=require('fs'),path=require('path'),cp=require('child_process'),z=require('zlib'),crypto=require('crypto');
const B=require('./balance-panel'),A=require('./gear-usage-audit'),O=require('./lib/build-choice-observer');
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];},read=f=>JSON.parse(z.gunzipSync(fs.readFileSync(f))),clone=x=>JSON.parse(JSON.stringify(x));
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const observerFiles=['balance-panel.js','gear-usage-audit.js','lib/balance-scorecard.js','lib/simulation-flags.js','lib/balance-cohorts.js'].map(f=>path.join(__dirname,f));
const observerDigest=()=>crypto.createHash('sha256').update(observerFiles.map(f=>fs.readFileSync(f)).join('\n')).digest('hex');
(async()=>{
 if(!arg('panel'))throw Error('--panel required');
 const root=path.resolve(arg('root')||'.'),panelFile=path.resolve(arg('panel')),panel=read(panelFile);
 if(JSON.stringify(B.manifest(root))!==JSON.stringify(panel.sources))throw Error('Game/controller source drift');
 if(observerDigest()!==panel.observerDigest||digest(path.join(__dirname,'balance-metrics.json'))!==panel.contractDigest)throw Error('Use the retained current observer/contract on both roots');
 const sourceFiles=[__filename,path.join(__dirname,'lib/build-choice-observer.js'),...observerFiles,path.join(__dirname,'balance-metrics.json')];
 const sources=Object.fromEntries(sourceFiles.map(f=>[path.relative(path.resolve(__dirname,'..'),f).replace(/\\/g,'/'),digest(f)]));
 if(panel.options.occupation!=null)throw Error('Occupation panels not supported by this diagnostic');
 if(process.argv.includes('--child')){
  const policy=arg('policy'),seed=Number(arg('seed')),expected=panel.rows.find(r=>r.row.policy===policy&&r.row.seed===seed);if(!expected)throw Error('Missing retained case');
  const H=require(path.join(root,'scripts/sim-harness')),C=require(path.join(root,'scripts/sweep-compare')),base=C.POLICY_REGISTRY[policy];if(!base)throw Error('Missing policy');
  let G,balanced,choices;const control=process.argv.includes('--control'),snapshots=[],picks=[],trades=[],errors=[],warnings=[],warn=console.warn,seen=new Set(),limit=20000;let dropped=0;
  const ids=()=>G.state.scholar.abilities.map(a=>typeof a==='string'?a:a.evolvedFrom||a.id);
  function record(list,value){if(list.length<limit)list.push(clone(value));else dropped++;}
  function sample(at){try{const s=G.state.scholar,v=G.state.village,id=G.villagerId,p=(G.data.villagers||[]).find(p=>p.id===id)||v.rosterChars?.[id],value={at,day:s.day,person:id,occupation:p?.occupation||p?.job||null,held:ids(),class:s.godpath||null,gods:s.godhood?.active||[],marketDeed:v.godpathDeeds?.[id]?.market_exchange||null};const key=JSON.stringify({...value,at:null});if(!seen.has(key)){seen.add(key);record(snapshots,value);}}catch(e){errors.push('snapshot: '+e.message);}}
  C.POLICY_REGISTRY[policy]={...base,setup(g,ctx){G=g;balanced=B.install(g);if(control){if(base.setup)return base.setup(g,ctx);return;}choices=O.install(g,{limit});
    const choose=g.chooseAbility;g.chooseAbility=function(id,replace){const before=ids(),offers=clone(this.state.scholar.abilityChoices||[]),person=this.villagerId,day=this.state.scholar.day;const result=choose.apply(this,arguments);try{record(picks,{person,day,offers,id,replace:replace||null,before,after:ids(),returned:result===undefined?'undefined':result===null?'null':typeof result==='boolean'?result:typeof result});}catch(e){errors.push('choice: '+e.message);}return result;};
    const trade=g.recordMarketExchange;g.recordMarketExchange=function(who,receipt,delivered){const person=who==='player'?this.villagerId:who,day=this.state.scholar.day,result=trade.apply(this,arguments);try{record(trades,{person,day,result,receipt,delivered:delivered?{itemId:delivered.itemId,units:delivered.units,kcalEach:delivered.kcalEach}:null});}catch(e){errors.push('trade: '+e.message);}return result;};
    const ascend=g.checkPlayerGodhoodAscension;g.checkPlayerGodhoodAscension=function(){sample('ascension-before');const result=ascend.apply(this,arguments);sample('ascension-after');return result;};
    sample('setup');if(base.setup)return base.setup(g,ctx);
   },daily(g,ctx){if(!control)sample('policy-before');const result=base.daily&&base.daily(g,ctx);balanced.sample();if(!control)sample('policy-after');return result;}};
  console.warn=(...x)=>warnings.push(x.map(String).join(' '));let report;try{report=await H.quietLog(()=>C.runComparison({seeds:[seed],policies:[policy],days:panel.options.days,origin:panel.options.origin,...(panel.options.region?{region:panel.options.region}:{})}));}finally{console.warn=warn;}
  const row=report.runs[0],observation=balanced.finish(row);if(!control)sample('final');const checks={state:A.gameplayHash(G.state)===expected.stateHash,row:JSON.stringify(row)===JSON.stringify(expected.row),metrics:JSON.stringify(observation.metrics)===JSON.stringify(expected.metrics),warnings:!warnings.length&&!observation.observerErrors.length&&!observation.gear.errors.length,diagnostic:!errors.length&&!dropped&&!(choices?.dropped)};
  console.log('@@MARKET_PATH@@'+JSON.stringify({policy,seed,checks,nextRandom:Math.random(),snapshots,picks,trades,decisions:choices?.decisions||[],errors,dropped,choiceDropped:choices?.dropped||0}));return;
 }
 const out=arg('out'),policy=arg('policy')||'merchant';if(!out||fs.existsSync(out+'.json.gz'))throw Error('--out <new prefix> required');
 const rows=[];for(const expected of panel.rows.filter(r=>r.row.policy===policy)){const pair=[false,true].map(control=>{const r=cp.spawnSync(process.execPath,[__filename,'--root',root,'--panel',panelFile,'--policy',policy,'--seed',String(expected.row.seed),'--child',...(control?['--control']:[])],{cwd:root,env:process.env,encoding:'utf8',timeout:120000,maxBuffer:64e6});if(r.status!==0)throw Error(r.stderr||r.stdout);const value=JSON.parse(r.stdout.split('@@MARKET_PATH@@').pop());if(!Object.values(value.checks).every(Boolean))throw Error('Exact replay rejected '+JSON.stringify({seed:value.seed,checks:value.checks,errors:value.errors}));return value;});if(pair[0].nextRandom!==pair[1].nextRandom)throw Error('Diagnostic changed RNG '+expected.row.seed);pair[0].control={checks:pair[1].checks,nextRandom:pair[1].nextRandom};rows.push(pair[0]);console.log('exact',policy,pair[0].seed);}
 if(!rows.length)throw Error('No matched cases');if(JSON.stringify(B.manifest(root))!==JSON.stringify(panel.sources))throw Error('Game source changed during review');
 if(sourceFiles.some(f=>sources[path.relative(path.resolve(__dirname,'..'),f).replace(/\\/g,'/')]!==digest(f)))throw Error('Diagnostic/observer/contract source changed during review');
 fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify({scope:'Passive exact retained player-path replays; raw per-bearer offers/held/class/deed facts. No natural viability or gate eligibility inferred from an aggregate union.',root,panel:panelFile,sourceDigest:panel.sourceDigest,observerDigest:panel.observerDigest,contractDigest:panel.contractDigest,sources,rows})+'\n'),{flag:'wx'});
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
