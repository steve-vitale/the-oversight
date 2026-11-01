'use strict';
// Passive public-action trace over the standard balance child. No extra game
// query, action, save, RNG draw or policy decision. Exact whole-panel control.
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process'),crypto=require('crypto'),captureRuntime=require('./lib/combat-capture-runtime');
const toolIdentity=()=>Object.fromEntries(['scripts/campaign-combat-trace.js','scripts/lib/combat-capture-runtime.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file),'utf8').replace(/\r\n/g,'\n')).digest('hex')]));
if(process.env.CAMPAIGN_COMBAT_ROOT){
 const H=require(path.join(process.env.CAMPAIGN_COMBAT_ROOT,'scripts/sim-harness')),load=H.loadGame;
 const events=[],starts=[],errors=[],ids=new WeakMap();let serial=0;
 const clone=x=>JSON.parse(JSON.stringify(x));
 H.loadGame=async function(...xs){const result=await load.apply(this,xs),G=result.Game;
  function snap(){const f=G.tbfight;return clone({day:G.state.scholar.day,part:G.dayPart,bearer:G.villagerId,over:G.over,combat:f&&{id:f.id,mid:f.monsterId,round:f.round,turnIdx:f.turnIdx,over:f.over,otTier:f.otTier,fighters:f.fighters.map(p=>({key:p.key,name:p.name,kind:p.kind,hp:p.hp,maxHp:p.maxHp,mx:p.mx,my:p.my,acted:p.acted,moveLeft:p.moveLeft,fled:p.fled,dead:p.dead}))}});}
  for(const name of ['tbPlayerStrike','tbPlayerWait','tbPlayerMove','tbPlayerFlee']){
   const original=G[name];if(typeof original!=='function')continue;
   G[name]=function(...args){let event;
    if(this.tbfight&&this.state.scholar.day===Number(process.env.CAMPAIGN_COMBAT_DAY))try{
     const f=this.tbfight;if(!ids.has(f)){ids.set(f,++serial);starts.push(clone({fight:serial,state:this.state,runtime:captureRuntime.capture(this)}));}
     event={name,args:clone(args),fight:ids.get(f),before:snap()};
    }catch(e){errors.push(e.message);}
    const reply=original.apply(this,args);
    if(event)try{event.after=snap();event.reply=reply;events.push(event);}catch(e){errors.push(e.message);}return reply;
   };
  }return result;
 };
 process.on('exit',()=>fs.writeFileSync(process.env.CAMPAIGN_COMBAT_OUT,z.gzipSync(JSON.stringify({schemaVersion:captureRuntime.SCHEMA_VERSION,tools:toolIdentity(),scope:'Passive actual controller-selected public combat actions with live save-projected aliases; runtime snapshot is not an extra native save',starts,events,errors})),{flag:'wx'}));
}else if(require.main===module){
 const arg=n=>{const i=process.argv.indexOf(n);return i<0?null:process.argv[i+1];},root=path.resolve(arg('--root')||'.'),file=arg('--panel'),policy=arg('--policy'),seed=Number(arg('--seed')),day=Number(arg('--day')),out=arg('--out');
 if(!file||!policy||!out||!Number.isSafeInteger(seed)||!Number.isSafeInteger(day)||day<1)throw Error('--panel --policy --seed --day --out required');
 const B=require('./balance-panel'),panel=JSON.parse(z.gunzipSync(fs.readFileSync(file))),expected=panel.rows.find(x=>x.row.policy===policy&&x.row.seed===seed);
 if(!expected||!panel.validity.sourcesStable||panel.validity.neutrality.some(x=>!x.match||x.warnings)||JSON.stringify(B.manifest(root))!==JSON.stringify(panel.sources))throw Error('Actual source-matched controlled panel required');
 for(const suffix of ['-trace.json.gz','-result.json.gz','-comparison.json'])if(fs.existsSync(out+suffix))throw Error('Fresh output prefix required');
 const tools=toolIdentity(),stdout=cp.execFileSync(process.execPath,['--require',__filename,path.join(__dirname,'balance-panel.js'),'--child','--root',root,'--policy',policy,'--seed',String(seed),'--days',String(panel.options.days),'--origin',panel.options.origin,...(panel.options.region?['--region',panel.options.region]:[]),...(panel.options.occupation!=null?['--occupation',String(panel.options.occupation)]:[]),'--observe','1'],{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,CAMPAIGN_COMBAT_ROOT:root,CAMPAIGN_COMBAT_DAY:String(day),CAMPAIGN_COMBAT_OUT:path.resolve(out+'-trace.json.gz')}});
 const actual=JSON.parse(stdout.split('@@BALANCE@@').pop()),checks={wholeRow:JSON.stringify(actual.row)===JSON.stringify(expected.row),state:actual.stateHash===expected.stateHash,all29:JSON.stringify(actual.metrics)===JSON.stringify(expected.metrics),wholeGear:JSON.stringify(actual.gear)===JSON.stringify(expected.gear),warnings:actual.warnings.length===0,sourceStable:JSON.stringify(B.manifest(root))===JSON.stringify(panel.sources)};
 const capture=JSON.parse(z.gunzipSync(fs.readFileSync(out+'-trace.json.gz')));checks.toolSourceStable=JSON.stringify(tools)===JSON.stringify(toolIdentity())&&JSON.stringify(tools)===JSON.stringify(capture.tools)&&capture.schemaVersion===captureRuntime.SCHEMA_VERSION;
 const report={captureSchemaVersion:capture.schemaVersion,tools,panel:path.resolve(file),policy,seed,day,checks,errors:capture.errors,events:capture.events.length,fights:capture.starts.length,harness:actual.row.harnessDiagnostics};
 fs.writeFileSync(out+'-result.json.gz',z.gzipSync(JSON.stringify(actual)),{flag:'wx'});fs.writeFileSync(out+'-comparison.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
 if(Object.values(checks).some(v=>!v)||capture.errors.length||!capture.events.length)process.exitCode=1;
}
