'use strict';
// Explicit controller experiment. Baseline profiles keep their own behavior.
// Use existing paid surplus feasts and genuinely useful learned treatment;
// never manufacture injuries, encounters, abilities or progression credit.
const C=require('./competent');
function record(ctx,reason){
 const d=ctx.endingAwareness||(ctx.endingAwareness={version:1,observations:0,reasons:{},feasts:0,treatments:0,powerUses:0,errors:[]});
 d.observations++;d.reasons[reason]=(d.reasons[reason]||0)+1;return d;
}
function play(G,ctx){
 try{
  const s=G.state.scholar,pg=s.prog||{};
  if(G.over||G.tbfight||G.state.activeContest||G.pendingEncounter){record(ctx,'busy');return;}
  if(pg.feastSurgeUsed){record(ctx,'deed_already_used');return;}
  if(!pg.sentimentTaught){record(ctx,'channel_not_taught');return;}
  if(G.feastedActive()&&!s.feastBuff.used){
   // Only real wounds with room for the authored bonus: base-only treatment
   // neither consumes power nor earns a deed. Do not withhold ordinary care
   // to create this opportunity; the parent retains its usual care decisions.
   if(G.maxHealth()-s.health<=20){record(ctx,'no_bonus_healing_room');return;}
   const treatment=G.activatableAbilities().find(a=>a.id==='field_medicine'&&a.available);
   if(!treatment){record(ctx,'no_available_learned_treatment');return;}
   const definition=G.data.abilities.find(a=>a.id===treatment.id);
   const price=G.abilityKcalCost(treatment.id)+(definition?.legacyCost?.kcal||0);
   if((s.kcal||0)-price<1200){record(ctx,'personal_food_reserve');return;}
   const before=s.health,bearer=G.villagerId;
   G.activateAbility(treatment.id);
   const d=record(ctx,'treatment_attempted');
   if(G.villagerId===bearer&&s.health>before)d.treatments++;
   if(pg.feastSurgeUsed&&s.feastBuff?.use?.kind==='healing')d.powerUses++;
   return;
  }
  if(!pg.feastSurge){record(ctx,'devotion_not_armed');return;}
  if(G.dayPart!==2){record(ctx,'not_dusk');return;}
  // Reuse the existing surplus road: real guests/food, >=1 day of communal
  // food left, no starving village, normal cadence and reactor restrictions.
  const old=process.env.COMPETENT_SURPLUS_FEAST,day=s.feastDay;
  try{process.env.COMPETENT_SURPLUS_FEAST='1';C.surplusFeast(G,ctx);}
  finally{if(old===undefined)delete process.env.COMPETENT_SURPLUS_FEAST;else process.env.COMPETENT_SURPLUS_FEAST=old;}
  const d=record(ctx,s.feastDay!==day?'surplus_feast_held':'surplus_road_did_not_host');
  if(s.feastDay!==day)d.feasts++;
 }catch(e){const d=record(ctx,'error');if(d.errors.length<30)d.errors.push(e.message);console.warn('[ending-aware] '+e.message);}
}
function wrap(base){
 return{...base,id:'ending-aware-'+base.id,desc:base.desc+'; experimental surplus-feast and learned wound-treatment pursuit',
  upkeep(G,ctx){const r=base.upkeep?.call(this,G,ctx);play(G,ctx);return r;},
  daily(G,ctx){play(G,ctx);return base.daily?.call(this,G,ctx);},
  diagnostics(ctx){const d=base.diagnostics?.call(this,ctx)||{};return{...d,endingAwareness:ctx.endingAwareness||null};},
 };
}
function profiles(){const {capable}=require('./capable'),L=require('./livelihood');return[capable,L.maker,L.merchant,L.caregiver].map(wrap);}
module.exports={play,wrap,profiles};
