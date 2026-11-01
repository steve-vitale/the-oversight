'use strict';
// Explicit mixed progression strategy: livelihoods retain their work, but these
// named trials add deliberate exploration/hunts. Original non-hunters stay so.
const {approachHuntTarget}=require('./capable'),travel=require('./public-travel');
const EXPERIMENT_ENABLED = true; // one-source-field ablation, never a Game lever
function record(ctx,reason){const d=ctx.ledgerAwareness||(ctx.ledgerAwareness={version:1,reasons:{},errors:[],sorties:0,approaches:0});d.reasons[reason]=(d.reasons[reason]||0)+1;return d;}
function need(G){
 const wave=G.unlockedWave();if(wave!==1&&wave!==2)return null;
 const cfg=G.waveLedgerCfg(),entry=G.state.waveLedger?.[wave]||{points:0,perType:{},perTypeX:{}};
 if((entry.points||0)>=(cfg.barsPerWave[wave]||0))return null;
 return{wave,cfg,entry};
}
function canCredit(G,missing,monster){
 if(!missing||!monster)return false;
 const def=G.data.monsters.find(d=>d.id===monster.id);if(!def||(def.wave||1)!==missing.wave)return false;
 const {cfg,entry,wave}=missing;
 if((entry.perType?.[def.id]||0)<cfg.perTypeCap)return true;
 return cfg.extraPerTypeCap>0&&cfg.counterBonusEnabled[wave]&&G.monsterCounterKnown(def.id)&&(entry.perTypeX?.[def.id]||0)<cfg.extraPerTypeCap;
}
function play(G,ctx){
 try{
  if(!EXPERIMENT_ENABLED){record(ctx,'experiment_disabled');return;}
  if(G.over||G.tbfight||G.pendingEncounter||G.state.activeContest){record(ctx,'busy');return;}
  const s=G.state.scholar,missing=need(G);if(!missing){record(ctx,'no_unlock_deficit');return;}
  if(s.day<30&&!s.prog?.sentimentTaught){record(ctx,'early_survival');return;}
  if(s.health/G.maxHealth()<0.7){record(ctx,'hurt');return;}
  if((s.kcal||0)<G.kcalCap()*0.4){record(ctx,'food_reserve');return;}
  const key=G.villagerId+':'+s.day+':'+G.dayPart;
  if(ctx._ledgerSortieKey===key||ctx._capHuntKey===s.day+':'+G.dayPart){record(ctx,'sortie_already_attempted');return;}
  const actor={state:G.state,scholar:s,bearer:G.villagerId,x:G.map.px,y:G.map.py},same=()=>G.state===actor.state&&G.state.scholar===actor.scholar&&G.villagerId===actor.bearer;
  // Only this actually rendered field supplies a target. Never query the
  // hidden world-monster list to choose an unexplored destination.
  const m=!s.insideHaven&&!s.insideTent?G.playerMonster():null;
  ctx._ledgerSortieKey=key;
  if(canCredit(G,missing,m)){
   const d=record(ctx,'current_field_eligible');d.approaches++;
   approachHuntTarget(G,ctx,{m,w:missing.wave,dist:0},'ledger',()=>same()&&G.map.px===actor.x&&G.map.py===actor.y&&G.playerMonster()===m);
   return;
  }
  record(ctx,m?'current_field_no_credit':'no_current_field_target');
  const visits=ctx.ledgerVisits||(ctx.ledgerVisits={}),at=G.map.px+','+G.map.py;visits[at]=(visits[at]||0)+1;
  const next=G.travelTargets().filter(t=>Math.abs(t.x-G.map.px)+Math.abs(t.y-G.map.py)===1)
   .sort((a,b)=>((visits[a.x+','+a.y]||0)-(visits[b.x+','+b.y]||0))||Number(!!G.mapSeen(a.x,a.y))-Number(!!G.mapSeen(b.x,b.y))||a.y-b.y||a.x-b.x)[0];
  if(!next){record(ctx,'no_public_adjacent_route');return;}
  const d=record(ctx,'public_exploration');d.sorties++;
  travel.within(G,ctx,()=>travel.travel(G,next.x,next.y));
  if(!same())record(ctx,'bearer_changed_during_travel');
 }catch(e){const d=record(ctx,'error');if(d.errors.length<30)d.errors.push(e.message);console.warn('[ledger-aware] '+e.message);}
}
function wrap(base){return{...base,id:base.id.replace(/^endgame-counter-aware-/,'ledger-aware-'),desc:base.desc+'; explicit mixed ledger-unlock exploration/hunting trial',
 upkeep(G,ctx){const r=base.upkeep?.call(this,G,ctx);play(G,ctx);return r;},
 diagnostics(ctx){const d=base.diagnostics?.call(this,ctx)||{},ledger=ctx.ledgerAwareness;return{...d,
  profile:base.id.replace(/^endgame-counter-aware-/,'ledger-aware-'),mode:'ledger-seeking-mixed',parentMode:d.mode||null,
  errors:[...(d.errors||[]),...(ledger?.errors||[]),...(ctx.publicTravelErrors||[])],
  counters:{...(d.counters||{}),...(ledger?{ledgerExplorationSorties:ledger.sorties,ledgerTargetApproaches:ledger.approaches}:{})},
  ledgerAwareness:ledger||null,ledgerTravel:travel.diagnostics(ctx)};},
};}
function profiles(){return require('./endgame-counter-aware').profiles().map(wrap);}
module.exports={need,canCredit,play,wrap,profiles};
