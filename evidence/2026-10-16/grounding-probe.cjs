'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib');
const [rootArg,policy,seedArg,out]=process.argv.slice(2),root=path.resolve(rootArg),here=root;
const H=require(path.join(root,'scripts/sim-harness')), {runComparison,POLICY_REGISTRY:registry}=require(path.join(root,'scripts/sweep-compare'));
const B=require(path.join(here,'scripts/balance-panel')),gear=require(path.join(here,'scripts/gear-usage-audit'));
const base=registry[policy],calls=[];let G,observer;const warnings=[],warn=console.warn;
console.warn=(...xs)=>{warnings.push(xs.map(String).join(' '));return warn.apply(console,xs);};
function snap(g,args){const s=g.state.scholar;return {day:s.day,person:g.villagerId,grounding:s.grounding??100,personHistory:{...g.state.groundingByPerson},args:args.map(x=>typeof x==='object'?JSON.parse(JSON.stringify(x)):x)};}
registry[policy]={...base,setup(g,c){G=g;observer=B.install(g);for(const name of ['addGrounding','mantleBecome','hostFeast','tableFacilitate','agencyTurn']){const fn=g[name];g[name]=function(...args){const before=snap(g,args),r=fn.apply(this,args),after=snap(g,[]);calls.push({name,before,after});return r;};}return base.setup?.(g,c);},daily(g,c){const r=base.daily?.(g,c);observer.sample();return r;}};
H.quietLog(()=>runComparison({seeds:[Number(seedArg)],policies:[policy],days:150,origin:'Columbus, Ohio'})).then(report=>{
const row=report.runs[0],observed=observer.finish(row),value={sourceDigest:require('crypto').createHash('sha256').update(JSON.stringify(B.manifest(root))).digest('hex'),row,stateHash:gear.gameplayHash(G.state),metrics:observed.metrics,warnings,calls};fs.writeFileSync(out,z.gzipSync(JSON.stringify(value)+'\n'));console.warn=warn;
}).catch(e=>{console.error(e);process.exitCode=1;});
