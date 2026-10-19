'use strict';
// Deliberate Market builds on merchant's real trading/survival actions.
// These are mixed-play intent cohorts, not pacifists or Game balance levers.
const {merchant} = require('./livelihood');
function dailyMarket(G,ctx) {
  if(G.over||G.pendingEncounter||G.state.activeContest||(G.tbfight&&!G.tbfight.over))return;
  try {
    const s=G.state.scholar,key=G.villagerId+':'+s.day;
    // No Market ascension can expose this verb. Avoid unrelated readiness
    // queries (some normalize feast buffs) for every other bearer.
    if(!s.godhood?.active?.includes('market_god'))return;
    if(ctx._marketAttempt===key)return;
    const exposure=ctx.marketDailyExposure||(ctx.marketDailyExposure={holder:{},listed:{},available:{},unlisted:{}});
    if(s.godhood?.active?.includes('market_god'))exposure.holder[key]=true;
    const action=G.activatableAbilities().find(a=>a.id==='god.name_price'&&!a.combat);
    if(!action){if(exposure.holder[key])exposure.unlisted[key]={day:s.day,bearer:G.villagerId,activeGods:s.godhood.active.slice()};return;}
    exposure.listed[key]=true;
    const blocked=reason=>{const b=ctx.marketDailyBlocked||(ctx.marketDailyBlocked={});b[reason]=(b[reason]||0)+1;};
    ctx.marketDailyListed=(ctx.marketDailyListed||0)+1;
    if(!action.available&&!action.choiceAvailable){blocked('unavailable');return;}
    exposure.available[key]=true;
    const owned=[...(s.inventory||[]),...(s.prepStash||[]),...Object.values(s.equipped||{})].filter(it=>it&&(it.units==null||it.units>0));
    const has=id=>owned.some(it=>(it.itemId||it.id)===id);
    const def=id=>G.data.items.find(d=>d.id===id);
    const maxArmor=Math.max(0,...owned.map(it=>def(it.itemId||it.id)?.armor?.protection||0));
    const candidates=[];
    // The normal public default reveals its own upgrade. Named alternatives
    // come only from familiar UI suggestions, never a scan of hidden names.
    const automatic=action.available?G.marketWishQuote(null):null;
    if(automatic?.ok&&!has(automatic.itemId))candidates.push(automatic);
    for(const familiar of G.marketWishSuggestions()) {
      const d=def(familiar.id);
      if(!has(familiar.id)&&d?.armor?.protection>maxArmor){const q=G.marketWishQuote(familiar.id);if(q.ok)candidates.push(q);}
    }
    if(!candidates.length){blocked('no-unowned-upgrade');return;}
    const viable=candidates.filter(q=>q.bearer===G.villagerId&&q.day===s.day&&Number.isFinite(q.totalKcal)&&
      s.kcal-q.totalKcal>=1200&&Number.isFinite(q.debtAfter)&&q.debtAfter<=2&&!q.auditDue);
    if(!viable.length){blocked('meal-or-audit-budget');return;}
    viable.sort((a,b)=>((def(b.itemId)?.weapon?.bonus||def(b.itemId)?.armor?.protection||0)-
      (def(a.itemId)?.weapon?.bonus||def(a.itemId)?.armor?.protection||0))||a.itemId.localeCompare(b.itemId));
    const quote=viable[0],count=()=>s.inventory.reduce((n,it)=>n+((it.itemId||it.id)===quote.itemId?Math.max(0,it.units??1):0),0);
    const units=count(),food=s.kcal,debt=Number.isFinite(s.godhood?.marketDebt)?s.godhood.marketDebt:null;
    ctx._marketAttempt=key;ctx.marketDailyAttempts=(ctx.marketDailyAttempts||0)+1;
    const returned=G.activateAbility('god.name_price',quote.itemId),gained=Math.max(0,count()-units);
    if(gained>0)ctx.marketDailyDeliveries=(ctx.marketDailyDeliveries||0)+1;
    else ctx.marketDailyRefused=(ctx.marketDailyRefused||0)+1;
    const receipt={day:s.day,bearer:G.villagerId,itemId:quote.itemId,quote:{...quote},returned:returned===true,
      units:gained,kcalSpent:food-s.kcal,debtBefore:debt,debtAfter:Number.isFinite(s.godhood?.marketDebt)?s.godhood.marketDebt:null};
    const receipts=ctx.marketDailyReceipts||(ctx.marketDailyReceipts=[]);
    if(receipts.length<200)receipts.push(receipt);else ctx.marketDailyReceiptDrops=(ctx.marketDailyReceiptDrops||0)+1;
  }catch(e){const errors=ctx.marketDailyErrors||(ctx.marketDailyErrors=[]);if(errors.length<30)errors.push(e.message);console.warn('[market-policy] '+e.message);}
}
function priority(G, subclass) {
  const subclasses=G.data.godpaths.paths.miser.subclasses;
  const keys=[subclass,...Object.keys(subclasses).filter(k=>k!==subclass)];
  const ids=keys.flatMap(k=>[subclasses[k].payoff,...subclasses[k].enablers,subclasses[k].tie]);
  return [...new Set(ids)].filter(id=>G.data.abilities.some(a=>a.id===id && a.lane==='magic' && [a.path,a.alsoPath].includes('miser')));
}
function profile(subclass) {
  const id='market-'+subclass;
  return {...merchant,id,desc:'merchant survival and paid trades; deliberate '+subclass+' choices from real offers',
    setup(G,ctx) {ctx.capOfferPriority=priority(G,subclass); return merchant.setup(G,ctx);},
    upkeep(G,ctx) {dailyMarket(G,ctx);return merchant.upkeep(G,ctx);},
    daily(G,ctx) {dailyMarket(G,ctx);return merchant.daily(G,ctx);},
    diagnostics(ctx) {const d=merchant.diagnostics(ctx);return {...d,profile:id,mode:'intentional-market-mixed',counters:{...d.counters,
      intentAcquired:ctx.capIntentAcquired||0,intentRefused:ctx.capIntentRefused||0,intentKept:ctx.capIntentKept||0,
      marketDailyListed:ctx.marketDailyListed||0,marketDailyAttempts:ctx.marketDailyAttempts||0,marketDailyDeliveries:ctx.marketDailyDeliveries||0,
      marketDailyRefused:ctx.marketDailyRefused||0,marketDailyReceiptDrops:ctx.marketDailyReceiptDrops||0},
      errors:[...d.errors,...(ctx.marketDailyErrors||[])],marketDailyBlocked:{...(ctx.marketDailyBlocked||{})},
      marketDailyExposure:ctx.marketDailyExposure?JSON.parse(JSON.stringify(ctx.marketDailyExposure)):null,
      marketDailyReceipts:(ctx.marketDailyReceipts||[]).map(r=>({...r,quote:{...r.quote}})),intentPicks:{...(ctx.capIntentPicks||{})}};}};
}
module.exports={dealer:profile('dealer'),hoarder:profile('hoarder'),priority,dailyMarket};
