'use strict';
// Explicit controller experiment. Read the same posted counter choices as the
// phone; use real public actions and pay real time. No fighter/state edits.
function bump(ctx,key){ctx[key]=(ctx[key]||0)+1;}
function play(G,ctx){
 const f=G.tbfight;if(!f||f.over||!G.tbIsPlayerTurn())return false;
 const p=G.tbFighter('p');if(!p||!p.alive||p.acted)return false;
 if(typeof G.tbStrikeMeet!=='function')return false;
 try{
  let waiting=false,available=false,legacy=false;
  if(typeof G.tbStrikeDemandOptions==='function'){
   const options=G.tbStrikeDemandOptions();
   waiting=options.some(x=>x.id==='still'&&x.pending&&x.remaining>0);
   available=options.some(x=>x.id==='still'&&x.available&&!x.pending);
  }else if(typeof G.sigW4CombatButtons==='function'){
   // Older roots offer only the first demand. Use its visible wording;
   // never invent an unavailable choice or silently assume zero exposure.
   const html=G.sigW4CombatButtons(),tag=(html.match(/<button\b[^>]*data-sigw4=["']tbStrikeMeet["'][^>]*>/i)||[])[0];
   legacy=!!tag&&!/\bdisabled\b/i.test(tag)&&/3 (?:rounds of stillness|consecutive rounds of stillness|consecutive rounds without moving)/i.test(tag);
   available=legacy;
  }
  if(waiting){bump(ctx,'monsterCombatCounterWaits');return !!G.tbPlayerWait();}
  if(available){bump(ctx,'monsterCombatCounterAttempts');const accepted=G.tbStrikeMeet(legacy?undefined:'still');if(accepted)bump(ctx,'monsterCombatCounterAccepted');return !!accepted;}
  if(ctx._counterReadFight!==f&&typeof G.sigW4CombatButtons==='function'&&/data-sigw4=["']tbStrikeScab["']/i.test(G.sigW4CombatButtons())){
   // The visible Scab control identifies a labor encounter. Hear its first
   // posted demand before choosing violence; pay one normal Wait to listen.
   ctx._counterReadFight=f;bump(ctx,'monsterCombatCounterReadWaits');return !!G.tbPlayerWait();
  }
 }catch(e){const errors=ctx.counterAwareErrors||(ctx.counterAwareErrors=[]);if(errors.length<30)errors.push(e.message);console.warn('[counter-aware] '+e.message);}
 return false;
}
function wrap(base){return{...base,id:'counter-aware-'+base.id,desc:base.desc+'; experimental visible labor-demand counterplay',
 setup(G,ctx){const result=base.setup?.call(this,G,ctx);ctx.publicCounterplay=true;return result;},
 diagnostics(ctx){const parent=base.diagnostics?.call(this,ctx)||{};return{...parent,counterAwareness:{errors:ctx.counterAwareErrors||[],scope:'Actual visible posted-demand reads and paid public counter actions; mixed strategy, not pacifist proof'}};},
};}
function profiles(){const {capable}=require('./capable'),L=require('./livelihood');return[capable,L.maker,L.merchant,L.caregiver].map(wrap);}
module.exports={play,wrap,profiles};
