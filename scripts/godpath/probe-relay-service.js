#!/usr/bin/env node
'use strict';
// Replay a saved standard campaign, reading actual office calls and public
// service opportunities. No extra RNG, clock, telemetry or game-helper calls.
const fs=require('fs'), path=require('path'), crypto=require('crypto'), z=require('zlib');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i<0?d:process.argv[i+1];};
(async()=>{
  const root=path.resolve(arg('root',path.join(__dirname,'../..'))), file=arg('panel',null), out=arg('out',null);
  if(!file||!out)throw Error('--panel <saved-panel.json.gz> --out <probe.json> required');
  const panel=JSON.parse(z.gunzipSync(fs.readFileSync(file))), seed=Number(arg('seed',7)), policy=arg('policy','merchant');
  const expected=panel.rows.find(r=>r.row.policy===policy&&r.row.seed===seed);
  if(!expected||panel.options.nodeVersion!==process.version)throw Error('No matching case/Node version');
  for(const [k,v] of Object.entries(panel.options.flags))if((process.env[k]??null)!==v)throw Error('Flag mismatch '+k);
  const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
  function validate(){for(const [f,h]of Object.entries(panel.sources))if(sha(fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n'))!==h)throw Error('Source mismatch '+f);}
  validate();
  const H=require(path.join(root,'scripts/sim-harness')), S=require(path.join(root,'scripts/sweep-compare'));
  const base=S.POLICY_REGISTRY[policy];if(!base)throw Error('Unknown policy '+policy);
  let G,ctx;const calls=[],samples=[],availableDays=new Set();let availabilityChecks=0;
  const snapshot=g=>{const s=g.state.scholar,v=g.state.village;return {day:s.day,bearer:g.villagerId,networkLive:!!g.state.networkLive,
    holder:g.state.switchboard?.holderId||null,holderDeathDay:v.deathSeen?.[g.state.switchboard?.holderId]??null,holderFallen:(v.fallen||[]).some(x=>x.villagerId===g.state.switchboard?.holderId),playerClass:s.godpath||null,
    npcSocialites:Object.entries(v.npcGodpath||{}).filter(([id,c])=>c.path==='socialite'&&!c.lapsed).map(([id,c])=>({id,since:c.since})),
    playerGods:s.godhood?.active||[]};};
  const sample=g=>samples.push(JSON.parse(JSON.stringify(snapshot(g))));
  S.POLICY_REGISTRY[policy]=Object.assign({},base,{setup(g,c){G=g;ctx=c;
    for(const name of ['switchboardAvailable','claimRelay','appointSwitchboard','removeSwitchboard']){
      const original=g[name];if(!original)continue;
      g[name]=function(){
        const before=name==='switchboardAvailable'?null:JSON.parse(JSON.stringify(snapshot(this)));
        const result=original.apply(this,arguments);
        if(name==='switchboardAvailable'){availabilityChecks++;if(result)availableDays.add(this.state.scholar.day);}
        else calls.push({name,args:[...arguments],before,after:JSON.parse(JSON.stringify(snapshot(this))),result:typeof result==='object'?result?.holderId||null:result});
        return result;
      };
    }
    sample(g);return base.setup?.(g,c);
  },daily(g,c){const result=base.daily?.(g,c);sample(g);return result;}});
  let report;
  try{report=await H.quietLog(()=>S.runComparison({seeds:[seed],policies:[policy],days:panel.options.days,origin:panel.options.origin,...(panel.options.region?{region:panel.options.region}:{})}));}
  finally{S.POLICY_REGISTRY[policy]=base;}
  sample(G);validate();
  const stateHash=require('../gear-usage-audit').gameplayHash(G.state),match=stateHash===expected.stateHash&&JSON.stringify(report.runs[0])===JSON.stringify(expected.row);
  const result={seed,policy,sourceDigest:panel.sourceDigest,probeDigest:sha(fs.readFileSync(__filename)),match,stateHash,row:report.runs[0],availabilityChecks,availableDays:[...availableDays],calls,samples,
    counters:Object.fromEntries(['capRelayClaimed','capRelayAppointed'].map(k=>[k,ctx[k]||0])),notes:ctx.notes};
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({seed,policy,match,availabilityChecks,availableDays:availableDays.size,calls:calls.length,counters:result.counters}));
  if(!match)throw Error('Probe changed the saved campaign');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
