// @ontology
// system: favor-company
// description: A specific night by a shared fire, with physical attendance, saved progress and an exact promise receipt.
// provides:
//   - companyFavorCommitGate(vid, favor)
//   - companyFavorAction(vid, favor)
//   - performCompanyFavor(vid, favor, cancel)
//   - companyFavorHolding(vid)
//   - companyFavorWaiting(vid)
//   - companyFavorReceipt(vid, favor, opts)
//   - companyFavorDeadline(favor)
//   - companyFavorOpening(vid, favor)
//   - companyMeetingStep()
//   - migrateCompanyFavors()
// rules:
//   - physical_night: only actual paid clock intervals beside the same person and fire count; generic social events and direct day jumps cannot keep this promise (code: accrue, finish)
//   - tonight: new promises expire at the agreed dawn; previously unavailable saved commitments receive one explicit fair meeting night (code: companyFavorCommitGate, migrateCompanyFavors)
//   - no_teleport: the requester walks a legal grid step toward the fire and stays on their actual side of the door; work orders take priority (code: companyMeetingStep, companyFavorHolding)
//   - canonical_time: normal world clock and Sleep costs remain; company adds no food or healing, and both awake presence and nearby sleep count (code: performCompanyFavor, install)
// consumes:
//   - state.village
//   - state.scholar
//   - tickAction(n)
//   - checkPromises(kind, vid, opts)
//   - journalFavorPromise(vid, promise, opts)
(function(){
 'use strict';
 const G=globalThis.Scattering.Game;
 const rules=()=>G.data.favorRules?.company;
 const abs=g=>(g.state.scholar.day||1)*g.TIME.TICKS_PER_DAY+(g.state.scholar.dayTicks||0);
 const night=f=>f?.companyNight??f?.askedDay;
 const distance=(a,b)=>Math.max(Math.abs(a.mx-b.mx),Math.abs(a.my-b.my));
 const block=reason=>({ready:false,reason});
 let pending=null,receipt=null,installed=false;
 function record(g,vid){const f=g.state.village.favorLedger?.[vid],p=g.state.village.promises?.[vid];return f?.kind==='stay_close'&&f.companyVersion===1&&p?.favorId===f.id&&!p.kept&&p.maker===g.villagerId?{f,p}:null;}
 function busy(g,vid){const v=g.state.village;return !!(v.assignments?.[vid]||g.waterFavorCompanions?.().includes(vid)||g.isSheltered?.(vid));}
 function personHere(g,vid){
  const v=g.state.village,s=g.state.scholar,p=g.getPerson(vid),node=v.nodePos?.[vid]||{nx:v.px??4,ny:v.py??4},pos=v.positions?.[vid];
  if(g.over||s.dead||vid===g.villagerId||!(v.roster||[]).includes(vid)||!p||p.dead)return 'That person is no longer available.';
  if(v.away?.[vid]||node.nx!==g.map.px||node.ny!==g.map.py||!pos)return 'Meet them on their actual map tile first.';
  if(g.playerTile()?.type==='haven'&&(v.npcInside?.[vid]!==false)!==(s.insideHaven!==false))return v.npcInside?.[vid]!==false?'They are inside the Haven hall. Go inside to meet them.':'They are on the Haven grounds. Step outside to meet them.';
  if(![s.mx,s.my,pos.mx,pos.my].every(Number.isFinite))return 'Move onto the grid beside them first.';
  return null;
 }
 function grid(g){const t=g.playerTile();return t?.type==='haven'?(g.state.scholar.insideHaven!==false?t.hallDetail:t.groundsDetail):t?.detail;}
 function fires(g,until){
  const cells=grid(g),inside=g.playerTile()?.type==='haven'&&g.state.scholar.insideHaven!==false,out=[];
  if(!cells)return out;
  for(let y=0;y<cells.length;y++)for(let x=0;x<(cells[y]?.length||0);x++)if(cells[y][x]==='fire'){
   const fire=inside?null:(g.state.fires||[]).find(f=>!f.inside&&f.tx===g.map.px&&f.ty===g.map.py&&f.cx===x&&f.cy===y);
   if(!fire||fire.till>=until)out.push({mx:x,my:y});
  }return out;
 }
 function presence(g,vid,r,until=abs(g),fuel=null){
  if(r&&r.bearer!==g.villagerId)return 'That company belonged to the previous bearer. It is not your attendance.';
  const why=personHere(g,vid);if(why)return why;
  if(g.inCombat()||g.pendingEncounter||g.state.scholar.monster||g.state.activeContest||g.tableActive?.())return 'Danger or another event interrupted the company.';
  if(busy(g,vid))return 'They have other work or a commitment. Release that order before joining them.';
  const s=g.state.scholar,pos=g.state.village.positions[vid],cfg=rules();
  if(distance(s,pos)>cfg.partnerDistance)return 'Move next to them to keep company.';
  const dawnEdge=r&&fuel&&fuel.till===until&&until===(r.night+1)*g.TIME.TICKS_PER_DAY&&s.day===r.night&&abs(g)>=until;
  const candidates=fires(g,until);if(dawnEdge)candidates.push(r.fire);
  const shared=candidates.find(f=>distance(s,f)<=cfg.fireRadius&&distance(pos,f)<=cfg.fireRadius&&(!r||f.mx===r.fire.mx&&f.my===r.fire.my));
  if(!shared)return 'Both of you must be beside the same burning fire. Feed a player-made fire to last until dawn.';
  if(r&&(r.x!==g.map.px||r.y!==g.map.py||r.inside!==(g.playerTile()?.type==='haven'&&s.insideHaven!==false)))return 'You left the place where you agreed to stay.';
  return null;
 }
 function pause(g,vid,r,reason){if(!r?.active)return;r.active=false;r.reason=reason;g.tele('favor_company_interrupted',{partner:vid,favorId:g.convoGetFavor(vid)?.id,bearer:r.bearer,night:r.night,presentTicks:r.presentTicks,reason});g.save();}
 function recheck(g){let changed=false;for(const [vid,f]of Object.entries(g.state.village.favorLedger||{}))if(f.kind==='stay_close'&&f.company?.active){const why=presence(g,vid,f.company);if(why){pause(g,vid,f.company,why);changed=true;}}return changed;}
 function accrue(g,p,end){
  if(!p||p.used)return;p.used=true;
  if(p.people.some(([, ,fuel])=>fuel))g.sweepDeadFires();
  for(const [vid,r,fuel]of p.people){
   const current=record(g,vid);if(!current||current.f.company!==r||!r.active||g.state!==p.state||g.villagerId!==p.bearer)continue;
   const stop=Math.min(end,(r.night+1)*g.TIME.TICKS_PER_DAY),spent=stop-p.start;
   const reason=presence(g,vid,r,stop,fuel);
   if(reason||r.lastAbs!==p.start||spent<0||spent>p.ticks){pause(g,vid,r,reason||'Time or attendance no longer matches this stretch.');continue;}
   r.presentTicks+=spent;r.totalTicks+=spent;r.lastAbs=stop;if(spent>0)g.save();
  }
 }
 function finish(g){
  if(pending)accrue(g,pending,abs(g));
  for(const [vid,f]of Object.entries(g.state.village.favorLedger||{})){
   const r=f.company,p=g.state.village.promises?.[vid];if(!r?.active||f.kind!=='stay_close'||g.state.scholar.day!==r.night)continue;
   const dawn=(r.night+1)*g.TIME.TICKS_PER_DAY;
   if(abs(g)<dawn)continue;
   const fuel=pending?.people.find(([id,runtime])=>id===vid&&runtime===r)?.[2];
   const reason=presence(g,vid,r,dawn,fuel);
   if(reason||r.lastAbs!==dawn||r.presentTicks<rules().minimumPresenceTicks||!record(g,vid)) {pause(g,vid,r,reason||'There was not enough continuous company before dawn.');continue;}
   r.active=false;r.completed=true;r.completedAt=dawn;
   receipt={state:g.state,vid,favorId:f.id,bearer:g.villagerId};
   try{g.checkPromises('social',vid,{companyFavorId:f.id});}finally{receipt=null;}
   if(p.kept===true){
    const needs=g.npcNeeds(vid),before=needs.fear||0;needs.fear=Math.max(0,before-rules().fearRelief);needs.social=Math.max(0,(needs.social||0)-rules().socialRelief);
    g.remember(vid,'comforted','stayed beside them through the night');g.observe('comfort',{target:vid,noTrust:true});g.notePlaystyle('social');
    g.tele('favor_company_complete',{partner:vid,favorId:f.id,bearer:r.bearer,night:r.night,presentTicks:r.presentTicks,fearBefore:before,fearAfter:needs.fear});
    g.journalFavorPromise?.(vid,p);g.save();
   }
  }
 }
 Object.assign(G,{
  companyFavorCommitGate(vid,f){
   if(!rules())return{ok:false,unsupported:true,reason:'This company request is not available.'};
   const p=this.getPerson(vid),s=this.state.scholar;
   if(!f||f.kind!=='stay_close'||f.vid!==vid||!['asked','promised'].includes(f.state))return{ok:false,reason:'This company request is closed.'};
   if(f.companyVersion!==1)return{ok:false,unsupported:true,reason:'This older request needs a new meeting night before it can be performed.'};
   if(this.over||s.dead||vid===this.villagerId||!(this.state.village.roster||[]).includes(vid)||!p||p.dead)return{ok:false,reason:'That person is no longer available.'};
   if(s.day>night(f)||s.day===night(f)&&this.TIME.TICKS_PER_DAY-(s.dayTicks||0)<rules().minimumPresenceTicks&&!f.company?.active)return{ok:false,reason:'That night is over, or dawn is too close to begin. This request can no longer be promised.'};
   return{ok:true};
  },
  companyFavorAction(vid,f){
   const gate=this.companyFavorCommitGate(vid,f);if(!gate.ok)return{...block(gate.reason),unsupported:!!gate.unsupported,canPromise:false};
   const {scholar:s,village:v}=this.state,p=v.promises?.[vid],r=f.company;
   if(!p||p.favorId!==f.id||p.kept)return{...block('Accept the request first. Meet beside a fire on night '+night(f)+' and stay together until dawn. Normal food, water and rest rules still apply.'),canPromise:true};
   if(p.maker!==this.villagerId)return{...block('That promise belonged to the previous bearer.'),canPromise:false};
   if(s.day!==night(f)||this.dayPart<2)return block('Meet by the fire at dusk or night on day '+night(f)+'. Stay until the following dawn.');
   const why=presence(this,vid,r?.active?r:null);if(why)return block(why);
   const dawn=(night(f)+1)*this.TIME.TICKS_PER_DAY;
   if(!r?.active&&dawn-abs(this)<rules().minimumPresenceTicks)return block('There is not enough night left for meaningful company.');
   if(!r?.active&&!fires(this,dawn).some(fire=>distance(s,fire)<=rules().fireRadius&&distance(v.positions[vid],fire)<=rules().fireRadius))return block('Feed this fire to last until dawn, then join them.');
   return{ready:true,action:r?.active?'company_wait':'company_join',label:r?.active?'Keep company until dawn':'Join them by the fire',reason:(r?.reason?'Earlier company was interrupted. Start a fresh stretch. ':'')+(r?.active?'You are staying together. ':'')+'Stay beside this person and fire until dawn. Waiting here or sleeping nearby counts after you join; a quick chat does not. Walking away, danger or a new work order interrupts the company. You still pay normal food, water and time costs.'};
  },
  performCompanyFavor(vid,f,cancel){
   if(cancel){const p=this.state.village.promises?.[vid];if(p?.favorId!==f?.id||p.kept)return{ok:false,line:'There is no open company promise to break.'};if(f.company)f.company.active=false;this.convoFavorRenounce(vid);this.save();return{ok:true,close:true,promiseMissed:true,line:'You end the company and break tonight’s promise.'};}
   const status=this.companyFavorAction(vid,f);if(!status.ready)return{ok:false,line:status.reason};
   if(status.action==='company_join'){
    const s=this.state.scholar,fire=fires(this,(night(f)+1)*this.TIME.TICKS_PER_DAY).find(fire=>distance(s,fire)<=rules().fireRadius&&distance(this.state.village.positions[vid],fire)<=rules().fireRadius);
    f.company={bearer:this.villagerId,night:night(f),active:true,x:this.map.px,y:this.map.py,inside:this.playerTile()?.type==='haven'&&s.insideHaven!==false,fire,presentTicks:0,totalTicks:f.company?.totalTicks||0,lastAbs:abs(this)};
    this.tele('favor_company_join',{favorId:f.id,partner:vid,bearer:this.villagerId,night:night(f)});this.save();return{ok:true,incomplete:true,line:'You join '+this.displayName(vid)+' beside the fire. Stay here until dawn; you may wait or sleep nearby. Company has started, but the promise is not kept yet.'};
   }
   const state=this.state,bearer=this.villagerId,r=f.company;
   for(let n=0;n<32&&r.active&&this.state===state&&this.villagerId===bearer&&!this.over&&this.state.scholar.day===r.night;n++){
    const why=presence(this,vid,r);if(why){pause(this,vid,r,why);break;}
    const start=abs(this);this.tickAction(Math.min(this.TIME.TICKS_PER_BATCH,(r.night+1)*this.TIME.TICKS_PER_DAY-start));
    if(abs(this)===start){pause(this,vid,r,'Time could not advance.');break;}
   }
   const kept=this.state.village.promises?.[vid]?.favorId===f.id&&this.state.village.promises[vid].kept===true;
   return{ok:kept||r.active,incomplete:!kept,close:kept,line:kept?'You stayed together by the fire until dawn. The company, not merely the conversation, kept your promise.':r.reason||'The company is unfinished. Check your partner and the night before continuing.'};
  },
  companyFavorHolding(vid){
   const e=record(this,vid);if(!e?.f.company?.active)return false;
   const v=this.state.village,p=this.getPerson(vid),r=e.f.company;
   return !!(!this.over&&!this.state.scholar.dead&&p&&!p.dead&&r?.active&&r.bearer===this.villagerId&&r.night===night(e.f)&&!busy(this,vid)&&!v.away?.[vid]&&this.state.scholar.day===r.night&&this.dayPart>=2);
  },
  companyFavorWaiting(vid){
   const e=record(this,vid);if(!e||e.f.company?.active)return false;
   const v=this.state.village,p=this.getPerson(vid),node=v.nodePos?.[vid]||{nx:v.px??4,ny:v.py??4};
   return !!(!this.over&&!this.state.scholar.dead&&e&&!e.f.company?.active&&p&&!p.dead&&!busy(this,vid)&&!v.away?.[vid]&&this.state.scholar.day===night(e.f)&&this.dayPart>=2&&node.nx===(v.px??4)&&node.ny===(v.py??4));
  },
  companyFavorReceipt(vid,f,opts){return !!(receipt&&receipt.state===this.state&&receipt.vid===vid&&receipt.favorId===f.id&&opts?.companyFavorId===f.id&&receipt.bearer===this.villagerId&&f.company?.completed);},
  companyFavorDeadline(f){const d=night(f),today=this.state.scholar.day;return today>d?'That night has passed.':d===today?'Tonight, until dawn.':'Meet on night '+d+', until the following dawn.';},
  companyFavorOpening(vid,f){
   if(!f||f.kind!=='stay_close')return null;
   if(f.state==='asked'&&this.state.scholar.day>night(f)){f.state='moot';return '"That night has passed. Let’s leave that request behind."';}
   if(f.state!=='promised')return null;
   return f.company?.active?'"Stay near until morning. Just knowing you’re here helps."':'"We still need to meet by the fire. '+this.companyFavorDeadline(f)+'"';
  },
  companyMeetingStep(){
   const cells=grid(this);if(!cells||!rules())return;
   for(const vid of this.state.village.roster||[]){
    if(!this.companyFavorWaiting(vid)||personHere(this,vid))continue;
    const pos=this.state.village.positions[vid],fire=fires(this,abs(this)).sort((a,b)=>distance(pos,a)-distance(pos,b))[0];if(!fire||distance(pos,fire)<=rules().fireRadius)continue;
    const occupied=new Set(Object.entries(this.state.village.positions||{}).filter(([id])=>id!==vid&&!personHere(this,id)).map(([,p])=>p.mx+','+p.my));occupied.add(this.state.scholar.mx+','+this.state.scholar.my);
    const queue=[{mx:pos.mx,my:pos.my,first:null}],seen=new Set([pos.mx+','+pos.my]);let step=null;
    for(let i=0;i<queue.length;i++){const p=queue[i];if(distance(p,fire)<=rules().fireRadius){step=p.first;break;}for(const [dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]]){const x=p.mx+dx,y=p.my+dy,key=x+','+y;if(!cells[y]?.[x]||seen.has(key)||occupied.has(key)||this.cellProps(cells[y][x]).blocks)continue;seen.add(key);queue.push({mx:x,my:y,first:p.first||{mx:x,my:y}});}}
    if(step){Object.assign(pos,step);const needs=this.npcNeeds(vid);needs.energy=Math.max(0,(needs.energy||0)-1);}
   }
  },
  migrateCompanyFavors(){
   const s=this.state.scholar,v=this.state.village;if(this.dayPart<0||this.dayPart>3||s.dayTicks>=this.TIME.TICKS_PER_DAY)return false;let changed=false;
   for(const [vid,f]of Object.entries(v.favorLedger||{})){
    if(f.kind!=='stay_close'||f.companyVersion||!['asked','promised'].includes(f.state))continue;
    const p=v.promises?.[vid],open=p?.favorId===f.id&&!p.kept;
    f.companyVersion=1;f.companyNight=s.day+(this.TIME.TICKS_PER_DAY-(s.dayTicks||0)<rules().minimumPresenceTicks?1:0);f.deadline=f.companyNight;changed=true;
    if(open){p.companyVersion=1;p.companyNight=f.companyNight;p.favorDeadline=f.deadline;this.journalFavorPromise?.(vid,p);}
   }return changed;
  },
 });
 function install(game){
  if(installed)return;installed=true;
  const engaged=game.isEngaged;game.isEngaged=function(vid){return this.companyFavorHolding(vid)||this.companyFavorWaiting(vid)||engaged.apply(this,arguments);};
  const batch=game.npcBatchTurn;game.npcBatchTurn=function(){const result=batch.apply(this,arguments);this.companyMeetingStep();return result;};
  const tick=game.tickAction;game.tickAction=function(n,...args){
   if(this._ticking||this.tbfight||!rules())return tick.call(this,n,...args);
   const prior=pending,start=abs(this),people=[];
   for(const [vid,f]of Object.entries(this.state.village.favorLedger||{}))if(f.kind==='stay_close'&&f.company?.active){const why=presence(this,vid,f.company);if(why)pause(this,vid,f.company,why);else {const r=f.company,fuel=r.inside?null:(this.state.fires||[]).find(f=>!f.inside&&f.tx===r.x&&f.ty===r.y&&f.cx===r.fire.mx&&f.cy===r.fire.my);people.push([vid,r,fuel]);}}
   if(!people.length)return tick.call(this,n,...args);
   const p={state:this.state,bearer:this.villagerId,start,ticks:Math.max(0,Math.round(n||1)),people,used:false};pending=p;
   try{const result=tick.call(this,n,...args);accrue(this,p,abs(this));return result;}finally{pending=prior;}
  };
  const day=game.endDay;game.endDay=function(){finish(this);const result=day.apply(this,arguments);let changed=false;for(const [vid,f]of Object.entries(this.state.village.favorLedger||{}))if(f.kind==='stay_close'&&f.company?.active&&this.state.scholar.day>f.company.night){pause(this,vid,f.company,'That night passed before the company was completed.');changed=true;}if(changed)this.save();return result;};
  for(const name of ['travelTo','enterBuilding','exitBuilding','startCombat']){
   const original=game[name];game[name]=function(){const result=original.apply(this,arguments);recheck(this);return result;};
  }
  const load=game.load;game.load=function(){const ok=load.apply(this,arguments);if(ok){const migrated=this.migrateCompanyFavors(),interrupted=recheck(this);if(migrated||interrupted)this.save();}return ok;};
 }
 const init=G.init;G.init=async function(){const result=await init.apply(this,arguments);install(this);return result;};
})();
