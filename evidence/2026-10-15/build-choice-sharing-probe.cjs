// Same standard merchant, one run/process; observer has no actions of its own.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(process.argv[2]||'.'),observe=(process.argv[3]||'1')==='1';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const H=require(path.join(root,'scripts/sim-harness'));
const {runComparison,POLICY_REGISTRY:registry}=require(path.join(root,'scripts/sweep-compare'));
const manifest=require(path.join(root,'scripts/balance-panel')).manifest;
const helper=path.join(root,'scripts/lib/build-choice-observer.js');
(async()=>{
  const sources=manifest(root),probeSha256=sha(fs.readFileSync(__filename)),helperSha256=sha(fs.readFileSync(helper));
  const base=registry.merchant;let G,observation;
  registry.merchant=Object.assign({},base,{setup(g,ctx){G=g;if(observe)observation=require(helper).install(g);if(base.setup)return base.setup(g,ctx);}});
  const warnings=[],originalWarn=console.warn;console.warn=(...xs)=>{warnings.push(xs.map(String).join(' '));return originalWarn.apply(console,xs);};
  let report;try{report=await H.quietLog(()=>runComparison({seeds:[7],policies:['merchant'],days:150}));}finally{registry.merchant=base;console.warn=originalWarn;}
  const stateHash=require(path.join(root,'scripts/gear-usage-audit')).gameplayHash(G.state);
  const stable=JSON.stringify(sources)===JSON.stringify(manifest(root))&&helperSha256===sha(fs.readFileSync(helper))&&probeSha256===sha(fs.readFileSync(__filename));
  const output={prepared:false,policy:'merchant',seed:7,days:150,observe,node:process.version,flags:{CAPABLE_READ_STAKES:process.env.CAPABLE_READ_STAKES||null,CAPABLE_GREEDY:process.env.CAPABLE_GREEDY||null},sources,helperSha256,probeSha256,stable,row:report.runs[0],stateHash,warnings,decisions:observation?.decisions||[],dropped:observation?.dropped||0};
  console.log(JSON.stringify(output,null,2));if(!stable||warnings.length||output.dropped)throw Error('Invalid shared observer probe');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
