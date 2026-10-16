// Read-only natural replay checkpoint; never calls save/syncRun/telemetry.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(process.argv[2]||'.'),policy=process.argv[3]||'merchant-hoarder',seed=Number(process.argv[4]||4);
const H=require(path.join(root,'scripts/sim-harness')),{runComparison,POLICY_REGISTRY:registry}=require(path.join(root,'scripts/sweep-compare'));
const manifest=require(path.join(root,'scripts/balance-panel')).manifest;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
  const sources=manifest(root),probeSha256=sha(fs.readFileSync(__filename)),base=registry[policy];let G,checkpoint=null;
  if(!base)throw Error('Unknown policy');
  registry[policy]=Object.assign({},base,{setup(g,ctx){G=g;return base.setup&&base.setup(g,ctx);},daily(g,ctx){const r=base.daily&&base.daily(g,ctx),s=g.state.scholar;
    if(!checkpoint&&!g.over&&!g.tbfight&&!g.pendingEncounter&&!g.state.activeContest&&s.godpath?.path==='miser'&&!s.godpath.lapsed){
      const state=JSON.parse(JSON.stringify(g.state));
      // Snapshot the same serializable fields as syncRun into the copy only.
      state.run=JSON.parse(JSON.stringify({map:g.map,dayPart:g.dayPart,location:g.location,departed:g.departed,log:g.log.slice(-40),homeRegion:g.homeRegion,villagerId:g.villagerId,encounterDone:g.encounterDone,wanderer:g.wanderer||null,tbfight:null,pendingEncounter:false,pendingMonsterId:null,pendingInTent:false}));
      checkpoint={day:s.day,person:g.villagerId,class:{...s.godpath},abilities:(s.abilities||[]).map(a=>a.id||a),state,villagers:JSON.parse(JSON.stringify(g.data.villagers))};
    }return r;
  }});
  const warnings=[],warn=console.warn;console.warn=(...xs)=>{warnings.push(xs.map(String).join(' '));return warn.apply(console,xs);};
  let report;try{report=await H.quietLog(()=>runComparison({seeds:[seed],policies:[policy],days:150}));}finally{registry[policy]=base;console.warn=warn;}
  const stable=JSON.stringify(sources)===JSON.stringify(manifest(root))&&probeSha256===sha(fs.readFileSync(__filename));
  console.log(JSON.stringify({root,policy,seed,node:process.version,sources,probeSha256,stable,warnings,row:report.runs[0],stateHash:require(path.join(root,'scripts/gear-usage-audit')).gameplayHash(G.state),checkpoint},null,2));
  if(!stable||warnings.length||!checkpoint)throw Error('Invalid/missing natural checkpoint');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
