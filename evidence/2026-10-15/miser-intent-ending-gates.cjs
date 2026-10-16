// End-of-run diagnostics only AFTER the comparable gameplay hash is sealed.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(process.argv[2]||'.'),policy=process.argv[3]||'merchant-hoarder',seed=Number(process.argv[4]||4);
const H=require(path.join(root,'scripts/sim-harness')),{runComparison,POLICY_REGISTRY:registry}=require(path.join(root,'scripts/sweep-compare'));
const manifest=require(path.join(root,'scripts/balance-panel')).manifest,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
  const sources=manifest(root),probeSha256=sha(fs.readFileSync(__filename)),base=registry[policy];if(!base)throw Error('Unknown policy');let G;
  registry[policy]=Object.assign({},base,{setup(g,ctx){G=g;return base.setup&&base.setup(g,ctx);}});
  const warnings=[],warn=console.warn;console.warn=(...xs)=>{warnings.push(xs.map(String).join(' '));return warn.apply(console,xs);};
  let report;try{report=await H.quietLog(()=>runComparison({seeds:[seed],policies:[policy],days:150}));}finally{registry[policy]=base;console.warn=warn;}
  const stateHash=require(path.join(root,'scripts/gear-usage-audit')).gameplayHash(G.state);
  const s=G.state.scholar,pg=G.progState();
  const diagnostic={afterComparableHash:true,day:s.day,person:G.villagerId,class:s.godpath||null,abilities:(s.abilities||[]).map(a=>a.id||a),arc:pg.arc,fullGate:G.deedGateReady(),currentSeat:G.tableSeat(),table:JSON.parse(JSON.stringify(G.tableState())),pantry:G.pantryKcal(),packKcal:(s.inventory||[]).reduce((n,i)=>n+(i.kcalEach||0)*(i.units||0),0),health:s.health,reactor:(s.abilities||[]).some(a=>(a.id||a)==='fusion_reactor')};
  const stable=JSON.stringify(sources)===JSON.stringify(manifest(root))&&probeSha256===sha(fs.readFileSync(__filename));
  console.log(JSON.stringify({root,policy,seed,node:process.version,sources,probeSha256,stable,warnings,row:report.runs[0],stateHash,diagnostic},null,2));if(!stable||warnings.length)throw Error('Invalid post-run diagnostic');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
