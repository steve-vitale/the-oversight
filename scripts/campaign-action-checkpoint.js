'use strict';
// Capture an actual naturally selected feast-healing action, then verify the
// whole campaign against its retained panel. No extra save/action/query calls.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
if(process.env.CAMPAIGN_ACTION_ROOT){
 const H=require(path.join(process.env.CAMPAIGN_ACTION_ROOT,'scripts/sim-harness')),load=H.loadGame;
 const receipts=[];H.loadGame=async function(...xs){const result=await load.apply(this,xs),G=result.Game,act=G.activateAbility;
  G.activateAbility=function(id,...args){const s=this.state.scholar;
   const wanted=id==='field_medicine'&&s.feastBuff&&!s.feastBuff.used&&receipts.length<8;
   const before=wanted?JSON.parse(JSON.stringify({state:this.state,runtime:{dayPart:this.dayPart,ap:this.ap,over:this.over,won:this.won,map:this.map,departed:this.departed}})):null;
   const reply=act.call(this,id,...args);
   if(wanted)receipts.push({id,before,after:JSON.parse(JSON.stringify({day:s.day,hp:s.health,kcal:s.kcal,buff:s.feastBuff,feastUsed:s.prog?.feastSurgeUsed})),reply});return reply;
  };return result;
 };
 process.on('exit',()=>fs.writeFileSync(process.env.CAMPAIGN_ACTION_OUT,z.gzipSync(JSON.stringify({scope:'Observed controller-selected action checkpoint; runtime/state snapshot, not an extra native save or fabricated starting character',receipts})),{flag:'wx'}));
}else if(require.main===module){
 const arg=n=>process.argv[process.argv.indexOf(n)+1],root=path.resolve(arg('--root')||'.'),file=arg('--panel'),policy=arg('--policy'),seed=Number(arg('--seed')),out=arg('--out');
 if(!file||!policy||!out)throw Error('--panel --policy --seed --out required');
 const B=require('./balance-panel'),panel=JSON.parse(z.gunzipSync(fs.readFileSync(file))),expected=panel.rows.find(x=>x.row.policy===policy&&x.row.seed===seed);
 if(!expected||!panel.validity.sourcesStable||panel.validity.neutrality.some(x=>!x.match||x.warnings)||JSON.stringify(B.manifest(root))!==JSON.stringify(panel.sources))throw Error('Actual source-matched controlled panel required');
 for(const suffix of ['-checkpoint.json.gz','-comparison.json'])if(fs.existsSync(out+suffix))throw Error('Fresh output prefix required');
 const stdout=cp.execFileSync(process.execPath,['--require',__filename,path.join(__dirname,'balance-panel.js'),'--child','--root',root,'--policy',policy,'--seed',String(seed),'--days',String(panel.options.days),'--origin',panel.options.origin,'--observe','1'],{encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,CAMPAIGN_ACTION_ROOT:root,CAMPAIGN_ACTION_OUT:path.resolve(out+'-checkpoint.json.gz')}});
 const actual=JSON.parse(stdout.split('@@BALANCE@@').pop()),checks={wholeRow:JSON.stringify(actual.row)===JSON.stringify(expected.row),state:actual.stateHash===expected.stateHash,all29:JSON.stringify(actual.metrics)===JSON.stringify(expected.metrics),wholeGear:JSON.stringify(actual.gear)===JSON.stringify(expected.gear),warnings:actual.warnings.length===0};
 const capture=JSON.parse(z.gunzipSync(fs.readFileSync(out+'-checkpoint.json.gz'))),report={panel:path.resolve(file),policy,seed,checks,actions:capture.receipts.map(x=>({id:x.id,day:x.before.state.scholar.day,hpBefore:x.before.state.scholar.health,kcalBefore:x.before.state.scholar.kcal,after:x.after}))};
 fs.writeFileSync(out+'-comparison.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
 if(Object.values(checks).some(v=>!v)||!capture.receipts.length)process.exitCode=1;
}
