'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto'),{isDeepStrictEqual:same}=require('util'),F=require('../phone-frame-proof-update');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),relative=p=>p.replace(/\\/g,'/'),base=p=>relative(p).split('/').pop();
function file(root,name){const f=path.resolve(root,...relative(name).split('/'));if(!f.startsWith(path.resolve(root)+path.sep))throw Error('Owned repository evidence required');return f;}
function read(root,pointer=JSON.parse(fs.readFileSync(path.join(root,'scripts/combat-input-proof.json'),'utf8'))){
 return{pointer,receipts:pointer.receipts.map(entry=>{
  const bytes=fs.readFileSync(file(root,entry.path)),data=JSON.parse(z.gunzipSync(bytes)),rawBytes=fs.readFileSync(file(root,data.raw.file));
  return{...entry,actualHash:hash(bytes),data,rawHash:hash(rawBytes),raw:JSON.parse(z.gunzipSync(rawBytes))};
 })};
}
function verify(root,{pointer,receipts}=read(root)){
 const errors=[],check=(ok,name)=>{if(!ok)errors.push(name);},expected=F.expectedInputs(root),heights=new Set();
 check(pointer.schemaVersion===1&&receipts.length===2,'Two phone heights required');
 const shape=f=>(f?.fighters||[]).map(x=>['key','hp','maxHp','mx','my','acted','moveLeft','alive','fled'].map(k=>x[k]));
 function observed(s,label,height){
  check(!!s,label+' actual observation');if(!s)return;
  check(same(s.state,s.committed),label+' whole immediately committed state');
  check(same(s.geometry,{width:390,height,x:0,y:0,documentHeight:height}),label+' one phone screen');
  if(s.fight)check(same(shape(s.fight),shape(s.committed?.run?.tbfight)),label+' live fighter HP/position/budgets match committed fighters');
 }
 function continued(b,a,label,height){
  observed(b,label+' before',height);observed(a,label+' after',height);if(!a||!b)return;
  const before=structuredClone(b.state),after=structuredClone(a.state);check(after.saveSeq>before.saveSeq,label+' native save progression');delete before.saveSeq;delete after.saveSeq;
  check(same(before,after)&&a.bearer===b.bearer,label+' whole native Continue');
 }
 for(const r of receipts){
  const p=r.data,d=r.raw,h=p.height,label=String(h);check([736,844].includes(h)&&!heights.has(h),'Unique phone height');heights.add(h);
  check(r.actualHash===r.sha256&&r.rawHash===p.raw.sha256,label+' original compressed receipt bytes');
  check(d.height===h&&d.errors?.length===0&&d.sourceErrors?.length===0,label+' browser completed without errors');
  check(same(d.networkInputs,expected),label+' actual current served sources');
  check(p.runner.sha256===F.normalized(file(root,p.runner.file)),label+' actually executed runner');
  const helper='evidence/2026-10-24/day150-phone-session-r1.cjs',fixture='evidence/2026-10-24/day150-maker63003-prepared-save-r2.json.gz';
  check(base(d.recipe.file)===base(helper)&&d.recipe.sha256===F.normalized(file(root,helper)),label+' executed touch helper');
  check(base(d.fixture)===base(fixture)&&d.fixtureSha256===hash(fs.readFileSync(file(root,fixture))),label+' actual prepared natural fixture');
  check(d.touches?.length>=18&&d.touches.every(t=>t.trusted),label+' trusted touch input');
  for(const img of d.images||[]){const image=path.posix.dirname(relative(p.raw.file))+'/'+base(img.path);check(hash(fs.readFileSync(file(root,image)))===img.sha256,label+' actual screenshot '+img.label);}
  check(d.images?.length>=6,label+' retained rendered scenes');
  const announced=p.interruption?.announced,resumed=p.interruption?.continued;
  continued(announced,resumed,label+' announced actor',h);
  const actor=announced?.fight?.pendingTurnKey;
  check(!!actor&&actor!=='p'&&announced.fight.order[announced.fight.turnIdx]===actor&&resumed?.fight?.pendingTurnKey===actor,label+' pending actor is preserved, not skipped');
  observed(p.handoff,label+' final movement handoff',h);
  const hand=p.handoff?.fight,spent=hand?.fighters.find(x=>x.key==='p');
  check(!!hand?.pendingTurnKey&&hand.order[hand.turnIdx]===hand.pendingTurnKey&&spent?.acted===true&&spent.moveLeft===0,label+' exhausted movement announces next actor without a refund');
  const snapshots=d.steps.filter(s=>s.kind==='snapshot'),get=name=>snapshots.find(s=>s.label===name);
  for(const prefix of ['strike','movement'])continued(get(prefix==='strike'?'strike-immediate':'movement-immediate'),get(prefix+'-continued'),label+' '+prefix,h);
  const strike=get('strike-immediate'),moved=get('movement-immediate'),player=s=>s?.fight?.fighters.find(x=>x.key==='p');
  check(player(strike)?.acted===true&&player(strike).moveLeft===2&&strike.fight.fighters.find(x=>x.key==='m_0')?.hp<722&&strike.fight.sigW5PDmg>0&&strike.fight.sigVerbCounts?.strike>=1,label+' actual player hit spends action');
  check(player(moved)?.acted===true&&player(moved).moveLeft===1&&player(moved).mx===7,label+' actual movement spends one square');
  const tap=d.steps.find(s=>s.kind==='tap'&&s.selector==='#c-strike');
  check(!!tap&&!!strike&&Date.parse(strike.at)-Date.parse(tap.at)>=0&&Date.parse(strike.at)-Date.parse(tap.at)<5000,label+' immediate hit observation before autosave fallback');
  const retreat=get('retreat'),after=get('retreat-continued');continued(retreat,after,label+' retreat',h);
  check(!!retreat&&!retreat.fight&&!after?.fight&&retreat.state.scholar.day===150,label+' real day150 retreat outcome');
 }
 return{ok:errors.length===0,errors};
}
function update(root,paths){
 const pointer={schemaVersion:1,scope:'Prepared natural day150 mobile combat checkpoint/Continue evidence; no physical-device or balance certification',receipts:paths.map(name=>({path:relative(name),sha256:hash(fs.readFileSync(file(root,name)))}))};
 const result=verify(root,read(root,pointer));if(!result.ok)throw Error(result.errors.join('\n'));
 const out=path.join(root,'scripts/combat-input-proof.json');fs.writeFileSync(out+'.tmp',JSON.stringify(pointer,null,2)+'\n');fs.renameSync(out+'.tmp',out);return pointer;
}
module.exports={read,verify,update};
if(require.main===module){try{console.log(JSON.stringify(update(path.resolve(__dirname,'../..'),process.argv.slice(2)),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
