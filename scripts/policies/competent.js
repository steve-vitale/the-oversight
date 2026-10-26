// policies/competent.js — plays like an aware, experienced player (Steve 2026-10-09).
// Heuristics, not optimal. Genuinely trying to win: learns plants, teaches,
// cooks everything, avoids disease vectors, fights only with advantage,
// keeps the takes/gives ledger honest. This is the skill-ceiling seed.
'use strict';
const idle = require('./idle');
const {chooseConversationChoice}=require('./conversation-pages');
const { vinebank } = require('./vinebank'); // materials-banking arm (VINEBANK=1, default OFF)
const snareteach = require('./snareteach'); // teach-drive arm (SNARETEACH=1, default OFF)

// COMPETENT_WARM (journey social r39 2026-10-21): warm acts (donations,
// promise-keeping, comfort, answering begs) are part of the competent base.
// Setting COMPETENT_WARM=0 strips them so a driver can play a competent but
// socially distant player. Default ON — every other consumer of this policy
// is byte-identical.
const COMPETENT_WARM = process.env.COMPETENT_WARM !== '0';

// DAWNREFUSE (refusal-spam fix 2026-10-15): per-dawn refusal-voice flags.
// When the scholar's hands can't reach the pantry, every iteration of the
// guard loop in competentEat would voice the engine's honest refusal
// ("The pantry is in the hall. Your hands are not.") — ~40-50 identical
// beats per dawn. The flag records the last scholar-day each Game object
// was refused on, so the voice fires once per dawn; a WeakMap keyed on the
// Game object keeps sequential seeds in one process from leaking flags.
const _dawnRefusedDays = new WeakMap();

// NOTHINGEDIBLE (nothing-edible guard-loop spam fix 2026-10-17, finding #473):
// per-day pack-eat voice flags. When the scholar's pack holds no edible food,
// every competentEat re-attempt voices the engine's full-inventory
// "Nothing edible. (<list> — not food yet: <prep hint>.)" beat byte-identical
// again — up to 105 in a single day (feastvoice census 2026-10-17). The flag
// records the last scholar-day each Game object heard it plus the pack state
// at that moment; a re-attempt with an unchanged pack is skipped (the engine
// would voice the same beat and move no state — same voice-only doctrine as
// DAWNREFUSE). A changed pack (forage haul, pantry take, aid parcel)
// re-attempts honestly. Env kill: NOTHINGEDIBLE_GATE='0' restores the old
// path (default ON). WeakMap keyed on the Game object so sequential seeds in
// one process don't leak flags.
const _packNothingDays = new WeakMap();

// Cultivated food uses the same raw/unknown/shelling contract as wild food.
// These guards change controller decisions only; never rewrite physical food.
function gardenFoodReady(Game, it) {
  if (!it?.gardenShares) return true;
  return it.edible !== false && !it.needsCooking && it.safe !== false &&
    !it.diseaseRisk && !it.poisonRisk && !it.parasiteRisk && !Game.isSpoiled(it);
}
function gardenActorGuard(Game, allowEncounter=false) {
  const state=Game.state,scholar=state.scholar,id=Game.villagerId,x=Game.map.px,y=Game.map.py;
  return ()=>Game.state===state&&Game.state.scholar===scholar&&Game.villagerId===id&&
    !Game.over&&(allowEncounter||(!Game.inCombat()&&!Game.pendingEncounter))&&Game.map.px===x&&Game.map.py===y;
}
function prepareGardenFood(Game,ctx) {
  const active=gardenActorGuard(Game);let prepared=0,attempts=0;
  for(const item of (Game.state.scholar.inventory||[]).slice()) {
    if(!active()||attempts>=6)break;
    if(!item.gardenShares||Game.isSpoiled(item))continue;
    const shell=item.foodKind==='nut'&&item.foodState==='in_shell';
    const cook=item.needsCooking&&item.diseaseRisk&&Game.nearFire();
    if(!shell&&!cook)continue; // unknown crops and unresolved risks stay unavailable
    const index=Game.state.scholar.inventory.indexOf(item);if(index<0)continue;
    const before=JSON.stringify(item);attempts++;
    if(shell)Game.shellNuts(index);else Game.cookFood(index);
    if(JSON.stringify(item)!==before)prepared++;
  }
  ctx.gardenPrepAttempts=(ctx.gardenPrepAttempts||0)+attempts;
  ctx.gardenPreparations=(ctx.gardenPreparations||0)+prepared;
  return prepared;
}
// Bulk Eat consumes risky ready plants too. If any such garden food is held,
// select real safe portions instead; a lack of fire must never make it edible.
function eatAroundUnpreparedGarden(Game) {
  if(!(Game.state.scholar.inventory||[]).some(it=>it.gardenShares&&!gardenFoodReady(Game,it)))return false;
  const active=gardenActorGuard(Game,true);
  for(let n=0;n<64&&active()&&Game.state.scholar.kcal<Game.kcalCap();n++) {
    const inv=Game.state.scholar.inventory;
    const candidates=inv.map((it,index)=>({it,index})).filter(({it})=>it.units>0&&it.kcalEach>0&&it.edible!==false&&gardenFoodReady(Game,it)&&!Game.isSpoiled(it));
    candidates.sort((a,b)=>(a.it.spoilDay??99999)-(b.it.spoilDay??99999));
    if(!candidates.length)break;
    const {it,index}=candidates[0],units=it.units,kcal=Game.state.scholar.kcal;
    Game.eatOne(index);
    if(active()&&it.units===units&&Game.state.scholar.kcal===kcal)break;
  }
  return true;
}

// Pack fingerprint: name|units|kcalEach|foodState|edible-flag per stack, in
// pack order. Recomputed AFTER the attempt so the engine's spoil-purge is
// part of the recorded state.
function _packStateKey(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    return inv.map(i => [i && i.name, (i && i.units) || 0, (i && i.kcalEach) || 0,
      (i && i.foodState) || '', i && i.edible === false ? '0' : '1'].join('|')).join(';');
  } catch (e) { return ''; }
}
function _packHasEdibleFood(Game) {
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    return inv.some(i => i && (i.kcalEach || 0) > 0 && (i.units || 0) > 0 && i.edible !== false);
  } catch (e) { return false; }
}
// VOICE ONLY. Gate the policy's pack-eat re-attempt on what the last attempt
// established: if it left a pack with nothing edible and the pack is
// unchanged, the engine's beat would be identical — skip the call. Any pack
// change (or a new day) re-arms the attempt.
function packEatOnce(Game) {
  if(eatAroundUnpreparedGarden(Game))return;
  if (process.env.NOTHINGEDIBLE_GATE === '0') { try { Game.eat(); } catch (e) {} return; }
  let day = 0;
  try { day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) {}
  const key = _packStateKey(Game);
  const rec = _packNothingDays.get(Game);
  if (rec && rec.day === day && rec.key === key) return; // already heard it today on this pack
  try { Game.eat(); } catch (e) {}
  try {
    if (!_packHasEdibleFood(Game)) _packNothingDays.set(Game, { day, key: _packStateKey(Game) });
  } catch (e) {}
}

// Eat like someone who knows the disease roster (DISEASES.md): cooked/safe
// food first, never human meat (trembles — cooking doesn't kill prions),
// never raw meat (trichinosis/gutrot). Re-scans each take since indices shift.
function competentEat(Game) {
  const s = Game.state.scholar, vv = Game.state.village;
  const active=gardenActorGuard(Game,true);
  // EAT_FRAC (journey landing r10 2026-10-13): policy variants can lower the
  // eat trigger (e.g. EAT_FRAC=0.10 for a distracted player who forgets to
  // eat) to probe starvation pathways. Default 0.85 = unchanged behavior.
  const trig = Math.min(0.95, Math.max(0.02, parseFloat(process.env.EAT_FRAC || '0.85') || 0.85));
  try {
    if (s.kcal >= Game.kcalCap() * trig) return;
    // HONEST EATING (bal-survival 2026-10-10): eat from the PACK first
    // (your foraged food), pantry second. The old code took from the pantry
    // even with a full pack — making the player a net drain.
    // NOTHINGEDIBLE (2026-10-17): once the day's pack-eat has heard
    // "nothing edible" on an unchanged pack, don't re-attempt — the engine
    // would voice the identical beat again. Game-code eat verb untouched.
    packEatOnce(Game);
    if(!active())return;
    if (s.kcal >= Game.kcalCap() * trig) return;
    // DAWNREFUSE (2026-10-15, refusal-spam fix): VOICE ONLY. When the hands
    // can't reach the pantry (havenStoresAccess()==='none') every take in
    // the guard loop below would be refused anyway — the engine voices
    // honestly, returns null, changes no state. So refuse ONCE per dawn
    // and skip the loop. Game-code take verbs are untouched; the take
    // behavior (refused draws) is unchanged. Re-checked every upkeep call,
    // so a scholar who steps inside mid-dawn takes normally.
    if (process.env.DAWNREFUSE_GATE !== '0') {
      let handsBlocked = false;
      try { handsBlocked = !!(Game.havenStoresAccess && Game.havenStoresAccess() === 'none'); } catch (e) {}
      if (handsBlocked) {
        const day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0;
        if (_dawnRefusedDays.get(Game) !== day) {
          _dawnRefusedDays.set(Game, day);
          try { Game.say('The pantry is in the hall. Your hands are not.'); } catch (e) {}
        }
        return;
      }
    }

    let guard = 0;
    while (s.kcal < Game.kcalCap() * 0.95 && guard++ < 20) {
      const pantry = vv.pantry || [];
      let best = -1, bestScore = -99;
      for (let i = 0; i < pantry.length; i++) {
        const it = pantry[i];
        if (!it || (it.kcalEach || 0) <= 0 || !gardenFoodReady(Game,it)) continue;
        if (it.plantId === 'meat_human') continue; // trembles: no cure, ever
        let score = 1;
        const fs = it.foodState || '';
        if (fs === 'cooked' || fs === 'smoked' || fs === 'preserved' || fs === 'rendered') score = 10;
        else if (fs === 'raw') score = (it.plantId || '').startsWith('meat_') ? -10 : 2;
        if (score > bestScore) { bestScore = score; best = i; }
      }
      if (best < 0 || bestScore < 0) break;
      try { Game.takeFromPantry(best); } catch (e) { break; }
      if(!active())break;
      // NOTHINGEDIBLE (2026-10-17): same gate — a take that added nothing to
      // the pack leaves the "nothing edible" verdict standing; a successful
      // take changes the pack key and re-arms the attempt honestly.
      try { packEatOnce(Game); } catch (e) { break; }
      if(!active())break;
    }
  } catch (e) {}
}

// ANSWER THE FIRE NETWORK (longsim food r4 2026-10-12): the aid instrument
// is the coalition's only non-national-gated food layer and it works
// end-to-end (offer -> inbound -> pantry; beg -> their pantry + trust) — but
// no competent-derived policy ever answered it, so every loop's sims measured
// a coalition food economy with the pipes shut. A competent player:
//   - ACCEPTS an aid offer. It only fires when Haven is genuinely struggling
//     and a rich neighbor noticed; there is no cost to saying yes.
//   - GIVES to a begging neighbor when the pantry can carry it (3x the ask,
//     1.5x when they once fed Haven — refusing a creditor costs double trust
//     and the ledger remembers). Refuses honestly otherwise.
function answerAidBeats(Game, ctx) {
  if (process.env.COMPETENT_AID === '0') return; // before/after harness gate
  const st = Game.state || {};
  const pantryKcal = () => {
    try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
  };
  try {
    if (st.pendingAidOffer && Game.answerAidOffer) {
      Game.answerAidOffer('accept');
      ctx.aidOffersAccepted = (ctx.aidOffersAccepted || 0) + 1;
    }
  } catch (e) {}
  try {
    const beg = st.pendingAidBeg;
    if (beg && Game.answerAidBeg) {
      const ask = beg.amount || 1500;
      const pk = pantryKcal();
      let creditor = false;
      try {
        const led = Game.aidLedger ? Game.aidLedger(beg.villageId) : null;
        creditor = led && (led.receivedKcal || 0) > (led.givenKcal || 0);
      } catch (e) {}
      const give = pk > ask * (creditor ? 1.5 : 3);
      const r = Game.answerAidBeg(give ? 'give' : 'refuse');
      if (r === 'gave') ctx.aidGivenKcal = (ctx.aidGivenKcal || 0) + ask;
      else ctx.aidRefused = (ctx.aidRefused || 0) + 1;
    }
  } catch (e) {}
}

// Loot the dead: an experienced player strips corpses — one decision per
// corpse (corpseLootAll), not one per item stack. Never human meat
// (trembles). Range-checked inside the verb. LOOT_ALL=0 restores the old
// per-item path (sweep baseline control); default is batch.
function lootCorpses(Game, ctx) {
  try {
    if (!Game.corpses) return 0;
    const batch = Game.corpseLootAll && process.env.LOOT_ALL !== '0';
    const skipHuman = (it) => it.plantId === 'meat_human'; // trembles
    let units = 0; // batch: corpses cleared; per-item fallback: items taken
    for (const c of Game.corpses()) {
      if (!c || c.looted || c.buried) continue;
      // RANGE PRE-CHECK (batch-loot 2026-10-13): the old loop fired the verb
      // on every corpse on the map — 97% failed "Too far" (measured
      // competent/s11/30d: 176/182). A human doesn't tap loot on a body
      // three tiles away; skip out-of-range corpses before spending a
      // deliberate verb. Quiet: no "Too far" narration spam.
      try {
        if (Game._corpseCheckRange && Game._corpseCheckRange(c, true) === false) continue;
      } catch (e) {}
      const items = c.items || [];
      // only fire a deliberate verb when something takeable remains
      let takeable = 0;
      for (const it of items) {
        if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
        if (it._left) continue;
        if (skipHuman(it)) continue;
        takeable++;
      }
      if (!takeable) continue;
      try {
        if (batch) {
          const r = Game.corpseLootAll(c.id, skipHuman);
          if (r && r.taken && r.taken.length > 0) { units++; ctx.looted = (ctx.looted || 0) + r.taken.length; }
        } else {
          for (let i = items.length - 1; i >= 0; i--) {
            const it = items[i];
            if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
            if (skipHuman(it)) continue; // trembles
            try {
              const r = Game.corpseTakeItem(c.id, i);
              if (r) { units++; ctx.looted = (ctx.looted || 0) + 1; }
            } catch (e) {}
          }
        }
      } catch (e) {}
      if (units >= 12) break; // don't spend the whole day-part
    }
    return units;
  } catch (e) { return 0; }
}

function nearFire(Game) {
  try { return Game.nearFire(); } catch (e) { return false; }
}

// Cook every raw item in the pack when a fire is near. Raw = disease risk.
function cookPack(Game, ctx) {
  const active=gardenActorGuard(Game,true),encounterBefore=Game.inCombat()||Game.pendingEncounter;
  const gardenPrepared=prepareGardenFood(Game,ctx);
  if(!active()||(!encounterBefore&&(Game.inCombat()||Game.pendingEncounter)))return gardenPrepared;
  if (!nearFire(Game)) return 0;
  let cooked = 0;
  try {
    const inv = Game.state.scholar.inventory || [];
    for (let i = inv.length - 1; i >= 0&&active(); i--) {
      const it = inv[i];
      if (it && it.foodState === 'raw' && it.kcalEach > 0) {
        try { Game.cookFood(i); cooked++; } catch (e) {}
        if (cooked >= 6) break; // don't burn the whole day-part
      }
    }
  } catch (e) {}
  if (cooked) ctx.cooked = (ctx.cooked || 0) + cooked;
  return cooked;
}

// Safe water: fill when near a source, boil first (needs fire or beard_moss),
// then drink. An experienced player never drinks risky water raw.
function drinkSafe(Game, ctx) {
  try {
    const s = Game.state.scholar;
    // fill a bottle when the tile offers water
    try {
      const t = Game.playerTile ? Game.playerTile() : null;
      const atHaven = (() => { try { return Game.playerAtHaven(); } catch (e) { return false; } })();
      if ((t && /creek|well|spring|river|pond|haven/i.test(t.type || '') || atHaven) && (s.water || []).length < 3) {
        try { Game.fillWater(); } catch (e) {}
      }
    } catch (e) {}
    if ((s.hydration || 0) >= 70) return;
    if (!(s.water || []).length) return;
    try { Game.boilWater(); } catch (e) {}
    try { Game.doAction('drink'); ctx.drank = (ctx.drank || 0) + 1; } catch (e) {}
  } catch (e) {}
}

// Ticks: check after wilderness time; remove cleanly only when skilled.
// Blind yanks botch into wound_fever — an experienced player knows that.
function checkTicks(Game, ctx) {
  try {
    const list = Game.seList ? Game.seList('scholar') : [];
    const tick = (list || []).find(e => e.id === 'tick_attached');
    if (!tick) return;
    const knows = !!((Game.state.codex || {}).techniques || {}).tick_removal ||
      (Game.hasAbility && (Game.hasAbility('triage') || Game.hasAbility('field_medicine') || Game.hasAbility('herbal_remedy')));
    if (knows) {
      try { Game.removeTick(); ctx.ticksRemoved = (ctx.ticksRemoved || 0) + 1; } catch (e) {}
    } else {
      ctx.ticksIgnored = (ctx.ticksIgnored || 0) + 1;
    }
  } catch (e) {}
}

// Teach: pass known plants to villagers who don't know them.
// Knowledge → food → power starts with someone knowing the plants.
function teachRound(Game, ctx) {
  try {
    const known = Object.keys((Game.state.codex || {}).plants || {});
    if (!known.length) return;
    const vv = Game.state.village;
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    if (!roster.length) return;
    let taught = 0;
    for (const pid of known.slice(0, 3)) { // a few per day, not a lecture marathon
      // REDUNDANT-TEACHING STOP SIGNAL (longsim tedium 2026-10-13): every pid
      // in `known` is a plant the scholar already knows — offering the lesson
      // anyway just burns a deliberate verb on a no-op. Check before offering,
      // not after failing. (The villager filter below is also inverted — it
      // asks non-knowers to teach — so this loop could never teach anything
      // new as written; fixing that direction is a separate lever.)
      if (Game.plantKnown && Game.plantKnown(pid)) continue;
      for (const vid of roster) {
        let vk = [];
        try { vk = (vv.plantKnowledge && vv.plantKnowledge[vid]) || []; } catch (e) {}
        if (!vk.includes(pid)) {
          try { if (Game.teachPlant(vid, pid)) { taught++; break; } } catch (e) {}
        }
      }
      if (taught >= 2) break;
    }
    if (taught) ctx.taught = (ctx.taught || 0) + taught;
  } catch (e) {}
}

// TRAUMA RELIEF (longsim combat r7 2026-10-12): keepsake channeling is the
// fastest trauma relief in the game (−6/channel vs −2/night sleep), and the
// button already renames itself "Hold it (steady yourself)" at trauma >= 8.
// A competent player who feels the shaking steadies themselves at dawn —
// the policy never did this before (baseline: 0 policy-driven channels in
// 24 runs; the only channels were the System's one-time demo). Gate:
// COMPETENT_TRAUMA_RELIEF=0 restores the legacy path for before/after
// measurement.
function sootheTrauma(Game, ctx) {
  try {
    if (process.env.COMPETENT_TRAUMA_RELIEF === '0') return;
    const s = Game.state.scholar || {};
    if ((s.trauma || 0) < 8) return; // below the game's own relief threshold
    if (!Game.sentimentTaught || !Game.sentimentTaught()) return;
    if (!Game.channelReadyKeepsakes || !Game.channelSentiment) return;
    const ready = Game.channelReadyKeepsakes();
    if (!ready || !ready.length) return;
    Game.channelSentiment(ready[0]);
    ctx.soothed = (ctx.soothed || 0) + 1;
  } catch (e) {}
}

// ---------- THE FEAST ROAD (food r7 2026-10-12) ----------
// Env gate COMPETENT_FEAST=0 restores the exact old behavior for
// identical-seed before/after. Default ON.
//
// The feast chain (the Arc-IV gate's feast deed): (1) the village hosts
// real feasts — a real pantry cost, guests, the game's quality formula;
// an unarmed feast is still the village's social engine (trust, bonds,
// gossip); (2) the devotion lane arms via keepsake channeling
// (channelSentiment: 3×L3 abilities OR surgeResonance>=35); (3) an armed
// feast grants the FEASTED buff (2-dawn window); (4) real combat use
// inside the window marks feastSurgeUsed (noteFeastedCombatUse). The base
// policy never hosts feasts and its only channel is trauma-routed — the
// chain never starts. Measured 12 seeds × 200d: 0 feast calls on 648
// affordable days, 0 arms though surgeResonance crossed 35 on 9/12 runs.
// A competent player who knows the conversion hosts the feast and warms
// the blades.
function feastOn() { return process.env.COMPETENT_FEAST !== '0'; }

// DEVOTION CHANNEL (food r7): once a day, when the trauma is quiet, hold
// a keepsake and practice — channelSentiment's focused-practice branch
// feeds surgeResonance (+1 per gainAbilityXP call, +5 per level-up) until
// the devotion lane arms (3×L3 OR resonance>=35). Trauma >= 8 stays the
// soothe channel's business: sootheTrauma already ran today, and the
// game's own branch order would soothe anyway. Never steals the soothe.
function channelDevotion(Game, ctx) {
  if (!feastOn()) return; // before/after harness gate
  try {
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (ctx._devChanDay === day) return; // one devotion channel a day
    if ((s.trauma || 0) >= 8) return; // the soothe channel owns high-trauma days
    if (!Game.sentimentTaught || !Game.sentimentTaught()) return;
    if (!Game.channelReadyKeepsakes || !Game.channelSentiment) return;
    const ready = Game.channelReadyKeepsakes();
    if (!ready || !ready.length) return;
    Game.channelSentiment(ready[0]);
    ctx._devChanDay = day;
    ctx.devotionChannels = (ctx.devotionChannels || 0) + 1;
  } catch (e) {}
}

// THE EVENING FEAST (food r7): at dusk, at the haven, when the pantry can
// honestly afford it. An ARMED feast is the conversion — the devotion
// rides the fire and the 2-dawn window covers the night's fights. An
// unarmed feast is the social engine (trust, bonds, gossip) — worth
// doing, but less often. Cadence: armed every 7+ days (the buff window
// is 2 dawns — re-feasting sooner just refreshes), unarmed every 14+
// days. Affordability: have >= cost*1.5 — winseek's honest-buffer rule,
// never feast the pantry into famine. EAT FIRST, FEAST SECOND: the feast
// spends the commons' food — the scholar must have contributed this week
// (recentGives, lifetime-metric bug in winseek's road fixed).
function eveningFeast(Game, ctx) {
  if (!feastOn()) return; // before/after harness gate
  try {
    if (Game.dayPart !== 2) return; // dusk — the buff rides into the night's fights
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (s.feastDay === day) return; // the game allows one feast a day
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const armed = !!(s.prog && s.prog.feastSurge);
    // FUSION REACTOR CEILING (Steve 2026-10-12): an online reactor crowds
    // out the feast's fire — the grant is honestly refused every time
    // (measured seed 222: 6 refused armed feasts). A competent player who
    // has heard the refusal doesn't waste the pantry on an armed feast;
    // the social engine (unarmed cadence) still runs.
    let armedForFeast = armed;
    try {
      if (armed && Game.fusionReactorOnline && Game.fusionReactorOnline()) armedForFeast = false;
    } catch (e) {}
    const cadence = armedForFeast ? 7 : 14;
    if (ctx._lastFeastDay && (day - ctx._lastFeastDay) < cadence) return;
    // EAT FIRST, FEAST SECOND (winseek's road, lifetime-metric BUG FIXED):
    // winseek checked lifetime (takes - gives) > 3000 — but takes/gives
    // are RUN-CUMULATIVE, so any scholar who ever eats from the pantry
    // crosses 3000 by day ~3 and the check blocks feasting forever
    // (measured seed 22: 86/141 armed days drain-blocked). The honest
    // check is RECENT contribution: the scholar put food IN this week
    // (>= 1500 kcal given in the last 7 days — about one real haul's
    // donation). The feast spends the commons' food — contribute first.
    if (recentGives(Game, ctx, 7) < 1500) return;
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) {}
    if (!plan || !plan.ok) return;
    if (plan.have < plan.cost * 1.5) return; // honest buffer — never feast into famine
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) {}
    if (rep && rep.ok) {
      ctx._lastFeastDay = day;
      ctx.feasts = (ctx.feasts || 0) + 1;
      if (armedForFeast) ctx.armedFeasts = (ctx.armedFeasts || 0) + 1;
    } else if (rep && /Nobody came/.test(rep.why || '')) {
      // the village is in no shape to feast (all abed or unwilling) — a
      // competent host reads the room and doesn't re-light the fire
      // tomorrow. (Seed 222: three straight empty-fire attempts.)
      ctx._lastFeastDay = day;
    }
  } catch (e) {}
}

// FEAST-FIGHT COORDINATION (food r7): the buff is a window, not a trophy.
// A fresh ARMED feast draws a scavenger to the haven's edge (feastDraw —
// guaranteed, but fought): face it WHILE FEASTED so the deed marks.
// Otherwise patrol while the window is live — a dusk feast buys the
// night plus the full next day (2 dawns). Patrol budget 3 sweeps/day:
// the buff is the point, a single sweep is a coin flip. (Pattern proven
// in winseek's feastFight/feastDrawRoad.)
function feastFightRoad(Game, ctx) {
  if (process.env.COMPETENT_SEEK_FIGHTS === '0') return; // targeted livelihoods choose the public drive-off response
  if (!feastOn()) return; // before/after harness gate
  try {
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (Game.over || Game.tbfight) return;
    if (!Game.feastedActive || !Game.feastedActive()) { ctx._feastFightDay = 0; return; }
    const b = s.feastBuff || null;
    if (b && b.used) { ctx._feastFightDay = 0; return; } // marked — nothing to gain
    // THE DRAW: a beast circles the haven's edge. Face it while feasted.
    try {
      if (Game.feastDrawPending && Game.feastDrawPending()) {
        if (Game.faceFeastDraw) Game.faceFeastDraw();
        ctx.facedDraw = (ctx.facedDraw || 0) + 1;
        return;
      }
    } catch (e) {}
    // no draw — patrol while feasted (the night + next day are live)
    if (ctx._feastFightDay === day && (ctx._feastFightSweeps || 0) >= 3) return;
    const hx = Game.map.px, hy = Game.map.py;
    const cands = [];
    try {
      for (const tt of (Game.travelTargets() || [])) {
        const t = Game.tileAt(tt.x, tt.y);
        if (!t || t.type === 'haven') continue;
        let blocked = false;
        try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
        if (blocked) continue;
        cands.push({ x: tt.x, y: tt.y, d: tt.d });
      }
    } catch (e) {}
    cands.sort((a, b) => b.d - a.d); // far tiles — monsters live out there
    let sweeps = 0;
    while (!Game.over && !Game.tbfight && Game.feastedActive && Game.feastedActive() && sweeps < 3) {
      sweeps++;
      for (const c of cands.slice(0, 4)) {
        if (Game.over || Game.tbfight) break;
        if (!Game.feastedActive || !Game.feastedActive()) break;
        try { Game.travelTo(c.x, c.y); } catch (e) { break; }
        if (Game.over || Game.tbfight) break;
        if (Game.map.px !== c.x || Game.map.py !== c.y) continue;
        try { Game.doAction('forage', {}); } catch (e) {}
        if (Game.over || Game.tbfight) break;
      }
    }
    if (!Game.tbfight) { try { Game.travelTo(hx, hy); } catch (e) {} }
    if (ctx._feastFightDay === day) ctx._feastFightSweeps = (ctx._feastFightSweeps || 0) + sweeps;
    else { ctx._feastFightDay = day; ctx._feastFightSweeps = sweeps; }
  } catch (e) {}
}

// RECENT GIVES (food r7): kcal the scholar donated to the pantry over the
// last `days` days. takes/gives are lifetime counters — a lifetime net is
// not a freeload test (every scholar who eats from the pantry crosses it
// by day ~3; measured seed 22: 86/141 armed days drain-blocked). One
// snapshot per day in ctx._givesHist (upkeep runs 3×/day; the day key
// keeps it honest).
function recentGives(Game, ctx, days) {
  try {
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    const g = (vv.gives || {})[me] || 0;
    const day = (Game.state.scholar || {}).day || 0;
    ctx._givesHist = ctx._givesHist || [];
    const last = ctx._givesHist[ctx._givesHist.length - 1];
    if (!last || last.day !== day) ctx._givesHist.push({ day, g });
    // AGE TRIM: the window is the last `days` days — drop the oldest
    // snapshot only while the NEXT one is still at/before the window start,
    // so the latest pre-window snapshot survives as the baseline. (Trimming
    // on hist[0] alone ate the baseline and returned 0 — caught by A3b.)
    while (ctx._givesHist.length > 1 && ctx._givesHist[1].day <= day - days) ctx._givesHist.shift();
    while (ctx._givesHist.length > days + 1) ctx._givesHist.shift();
    const old = ctx._givesHist[0];
    return g - (old ? old.g : 0);
  } catch (e) { return 0; }
}

// ---------- THE SURPLUS FEAST (blitz simpolicy 2026-10-13) ----------
// Env gate COMPETENT_SURPLUS_FEAST=1 enables; default OFF — the baseline
// stays byte-identical for before/after on identical seeds.
//
// The parent's rule, distinct from the food-r7 contribution rule above
// (eveningFeast: "the scholar must have given >=1500 kcal this week") and
// the r13 tribute rule (feastscale.js: tribute/tend count as giving):
// feast when the COMMONS can carry it — the pantry holds a surplus and
// nobody is going hungry. A competent player who sees a fat pantry and
// full bellies lights the fire. The feast is the village's social engine
// (trust, bonds, gossip) and, when the devotion is armed, the feastburn
// conversion the food-deed chain needs. All the honest gates stay: dusk,
// at haven, one feast/day, affordability (have >= cost*1.5 — never feast
// into famine), the fusion-reactor ceiling, cadence (armed 7d / unarmed
// 14d — the buff window is 2 dawns, re-feasting sooner just refreshes).
//
// Design call (documented, Steve can overrule): "surplus" = after the
// feast the pantry still holds a full day of village food
// (mouths * 2000 kcal — BALANCING.md's 2,000 kcal/day target); "villagers
// are fed" = the engine's own starvingVillage() is false (no starvation
// death in a week, fewer than a third of the roster deep in hunger).
// This is the "village can carry it" rule; the r7 "you carried it" rule
// is untouched and still runs alongside (the engine caps at 1 feast/day).
function surplusFeastOn() { return process.env.COMPETENT_SURPLUS_FEAST === '1'; }

function surplusFeast(Game, ctx) {
  if (!surplusFeastOn()) return; // before/after harness gate
  try {
    if (Game.dayPart !== 2) return; // dusk — the feast rides into the night
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (s.feastDay === day) return; // the game allows one feast a day
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const armed = !!((s.prog || {}).feastSurge);
    // FUSION REACTOR CEILING (Steve 2026-10-12): an online reactor crowds
    // out the feast's fire — the grant is honestly refused every time. A
    // competent host doesn't waste the pantry on an armed feast; the
    // social engine (unarmed cadence) still runs.
    let armedForFeast = armed;
    try {
      if (armed && Game.fusionReactorOnline && Game.fusionReactorOnline()) armedForFeast = false;
    } catch (e) {}
    const cadence = armedForFeast ? 7 : 14;
    if (ctx._sfLastFeastDay && (day - ctx._sfLastFeastDay) < cadence) return;
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) {}
    if (!plan || !plan.ok) return;
    if (plan.have < plan.cost * 1.5) return; // honest buffer — never feast into famine
    // SURPLUS: after the feast, a full day of village food remains.
    const vv = Game.state.village || {};
    let mouths = 0;
    try {
      for (const id of (vv.roster || [])) {
        if (!id || id === Game.villagerId) continue;
        let dead = false;
        try { const p = Game.getPerson(id); dead = !p || !!p.dead; } catch (e) {}
        if (!dead) mouths++;
      }
    } catch (e) {}
    if (mouths < 1) mouths = 1;
    if (plan.have - plan.cost < mouths * 2000) return; // no surplus, no feast
    // VILLAGERS FED: the engine's own starvation check.
    try { if (Game.starvingVillage && Game.starvingVillage()) return; } catch (e) {}
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) {}
    if (rep && rep.ok) {
      ctx._sfLastFeastDay = day;
      ctx.surplusFeasts = (ctx.surplusFeasts || 0) + 1;
      if (armedForFeast) ctx.surplusArmedFeasts = (ctx.surplusArmedFeasts || 0) + 1;
    } else if (rep && /Nobody came/.test(rep.why || '')) {
      // the village is in no shape to feast — read the room, don't
      // re-light the fire tomorrow
      ctx._sfLastFeastDay = day;
    }
  } catch (e) {}
}

// Talk: one real conversation a day. Relationships are the other economy.
function talkRound(Game, ctx) {
  try {
    const vv = Game.state.village;
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    if (!roster.length || !Game.talkTo) return;
    const vid = roster[Math.floor((global.__policyRandom || Math.random)() * roster.length)];
    try {
      Game.talkTo(vid);
      try { Game.endConvo(vid, 'left'); } catch (e2) {} // don't leave modal state open
      ctx.talked = (ctx.talked || 0) + 1;
    } catch (e) {}
  } catch (e) {}
}

// ---------- HELD CONVERSATIONS (blitz simpolicy 2026-10-13) ----------
// Env gate COMPETENT_TALK=1 enables; default OFF — baseline byte-identical.
//
// talkRound opens a conversation and walks straight out (endConvo 'left',
// zero exchanges): the trust stipend without the talk. The driverless
// player holds no real conversations — the whole dialogue engine (wants,
// grief, teaching, gossip, the canon questions) is unreachable BY
// CONSTRUCTION for it. A competent player who knows relationships are the
// other economy SITS DOWN: up to two held conversations a day, a few real
// turns each, then an honest goodbye.
//
// Target picking is meaning-first:
//   1. someone with an unresolved want (they want something — engage it),
//   2. the grieving or the scared (comfort is a competent kindness),
//   3. the stranger (lowest bond with the player),
//   4. the least-talked-to.
// Choice picking mirrors the engine's own courtesy: answer their question
// first (ans:* — the menu builder's rule: "it's rude to ignore it"), then
// teach (knowledge is the food economy), then the canon questions (gq:*),
// then ask on. Never 'leave'/'deflect' mid-conversation — the sitting ends
// by its own winddown, the 5-turn cap, or the honest goodbye.
//
// Hang safety: this stays on the shipped open/close verbs (talkTo +
// endConvo('left') in a finally — the talkRound-proven close path). The
// journey-endgame r8 convo-in-daily wedge used a different driver shape
// (a separate probe driver, endConvo 'done'); the pilot watches run timing
// for any recurrence.
function talkOn() { return process.env.COMPETENT_TALK === '1'; }

// Structural menu ids: never picked mid-conversation. 'goon' ("go on") is
// structural here too — the 5-turn cap owns continuation, not the menu.
const TALK_STRUCTURAL = { leave: 1, goon: 1, subject: 1, 'dlg:subject': 1, 'menu:more':1, deflect_q: 1, honest_pass: 1 };

function pickTalkChoice(choices, seen) {
  try {
    // NO REPEATS (blitz simpolicy 2026-10-13): teaching three plants in a
    // row reads as a lecture, not a conversation (pilot transcripts: the
    // triple-teach + the engine's "lost my train of thought" stutter). A
    // choice id fires once per sitting; the next turn picks the next-best.
    const live = (choices || []).filter(c =>
      c && c.id && !TALK_STRUCTURAL[String(c.id)] && !(seen && seen[String(c.id)]));
    if (!live.length) return null;
    const ans = live.find(c => String(c.id).indexOf('ans:') === 0);
    if (ans) return ans; // answer their question first — it's rude to ignore it
    const teach = live.find(c => String(c.id) === 'teach');
    if (teach) return teach; // knowledge is the food economy
    const gq = live.find(c => String(c.id).indexOf('gq') === 0);
    if (gq) return gq; // the canon questions
    const ask = live.find(c => String(c.id) === 'ask');
    if (ask) return ask;
    return live[0];
  } catch (e) { return null; }
}

function talkScore(Game, ctx, vid) {
  // higher = talk to them first. Deterministic — no RNG draws (the sort
  // below is stable), so identical seeds stay identical.
  let score = 0;
  try {
    const c = Game.convoGet ? Game.convoGet(vid) : null;
    const want = c && c.want;
    if (want && want.id && !want.resolution) score += 100; // they want something
    const cnt = (c && c.count) || 0;
    score += Math.max(0, 10 - cnt); // the least-talked-to
  } catch (e) {}
  try {
    if (Game.npcMood) {
      const m = Game.npcMood(vid);
      if (m === 'grieving' || m === 'scared') score += 50; // comfort
    }
  } catch (e) {}
  try {
    if (Game.bondGet) {
      const b = Game.bondGet(Game.villagerId, vid);
      const v = b ? (b.v || 0) : 0;
      score += Math.max(0, Math.min(30, 20 - v)); // the stranger first
    }
  } catch (e) {}
  return score;
}

function pickTalkTargets(Game, ctx, alive) {
  try {
    return alive.slice().sort((a, b) => talkScore(Game, ctx, b) - talkScore(Game, ctx, a));
  } catch (e) { return alive.slice(); }
}

// One held sitting: open, take up to 5 real turns, close honestly. The
// engine may wind the conversation down sooner (natural end) — the loop
// respects it. endConvo('left') always runs (finally) so modal state never
// leaks into the day loop.
function holdConversation(Game, ctx, vid) {
  try {
    Game.talkTo(vid);
    ctx.deepConvos = (ctx.deepConvos || 0) + 1;
    const seen = {}; // choice ids already taken this sitting — no repeats
    try {
      for (let turn = 0; turn < 5; turn++) {
        let c = null;
        try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
        if (!c || !c.active) break;
        const pick = chooseConversationChoice(Game,vid,choices=>pickTalkChoice(choices,seen),ctx);
        if (!pick) break;
        seen[String(pick.id)] = 1;
        let result;
        try { result=Game.convoTurn(vid, pick.id); } catch (e) { console.warn('[policy/conversation]',e.message); break; }
        if(result&&!result.ignored&&!result.navigation)ctx.deepTurns = (ctx.deepTurns || 0) + 1;
        else ctx.convoActionRefused=(ctx.convoActionRefused||0)+1;
        try {
          const c2 = Game.convoGet ? Game.convoGet(vid) : null;
          if (!c2 || !c2.active || c2.over) break;
        } catch (e) { break; }
      }
    } finally {
      try { if (Game.endConvo) Game.endConvo(vid, 'left'); } catch (e) {}
    }
  } catch (e) {}
}

function deepTalk(Game, ctx) {
  if (!talkOn()) return; // before/after harness gate
  try {
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    const alive = (vv.roster || []).filter(id => {
      if (!id || id === me) return false;
      try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return true; }
    });
    if (!alive.length || !Game.talkTo) return;
    // two held sittings a day — a social life, not a filibuster
    const targets = pickTalkTargets(Game, ctx, alive).slice(0, 2);
    for (const vid of targets) {
      if (Game.over) break;
      holdConversation(Game, ctx, vid);
    }
  } catch (e) {}
}

// KEEP YOUR WORD (journey landing r20 2026-10-17): the policy accepted
// favors and broke every one (r19: favorKept 0, favorBroken 5; r20
// baseline seeds 70-73: 0/5 kept, -15 trust each). A competent player
// who makes a promise keeps it. Each morning, scan open promises and
// work the per-person kinds with real acts. Broadcast kinds
// (fight/task/travel) keep through the policy's normal daily acts
// (fights, resolveAssignments, travel) and need no extra move — they're
// counted, not chased. Nearest deadline first: favor obligations rot in
// 1-3 days, not the 7-day promise window.
function promiseDaysLeft(Game, p, today) {
  if (!p) return 99;
  if (p.favorDeadline != null) return p.favorDeadline - today;
  return 7 - (today - (p.day || 0)); // the 7-day promise window
}
function keepPromiseFood(Game, ctx, vid) {
  // Don't starve yourself keeping your word — but a thin pack isn't an
  // excuse when you manage the pantry. A competent leader draws from the
  // store to feed someone they promised: the food is real and the take is
  // tracked like any other.
  const countUnits = () => {
    let u = 0;
    const inv = (Game.state.scholar || {}).inventory || [];
    for (const it of inv) {
      if ((it.kcalEach || 0) > 0 && (it.units || 0) > 0 && !it.bonded) u += it.units;
    }
    return u;
  };
  try {
    const s = Game.state.scholar || {};
    if (countUnits() < 3) {
      // Thin pack? Step inside and draw from the pantry you manage — the
      // promise is to share food, and the store is real food. Enter and
      // exit in one move so the rest of the day never sees the inside
      // state; both verbs are engine-guarded (no mid-fight use, haven node
      // only, honest refusals). The take is tracked like any other: the
      // village may notice the draw (-2), but keeping your word (+15) is
      // the bigger truth — a competent leader does that math.
      try {
        const v = Game.state.village || {};
        ctx.promiseDrawGuard = { atHaven: !!Game.playerAtHaven(), inside: !!((Game.state.scholar || {}).insideHaven) };
        let entered = false;
        if (Game.playerAtHaven() && !Game.state.scholar.insideHaven &&
            !Game.inCombat() && !Game.over) {
          entered = !!Game.enterBuilding();
        }
        if (entered) {
          const pantry = v.pantry || [];
          let took = 0;
          // Two passes: prepared food first, raw only if that's all there is.
          for (let pass = 0; pass < 2 && took < 3; pass++) {
            for (let i = pantry.length - 1; i >= 0 && took < 3; i--) {
              const it = pantry[i];
              if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
              if (pass === 0 && it.foodState === 'raw') continue;
              try { Game.takeFromPantry(i); took++; } catch (e) { break; }
            }
          }
          if (took) ctx.promisePantryDraws = (ctx.promisePantryDraws || 0) + took;
          try { Game.exitBuilding(); } catch (e) {}
        }
      } catch (e) {}
    }
    const units = countUnits();
    if (units < 2) { ctx.promiseFoodSkipped = (ctx.promiseFoodSkipped || 0) + 1; ctx.promiseFoodSkipUnits = units; ctx.promiseFoodSkipKcal = Math.round(s.kcal || 0); return; } // keep one for yourself
    if ((s.kcal || 0) < 500) { ctx.promiseFoodSkipped = (ctx.promiseFoodSkipped || 0) + 1; ctx.promiseFoodSkipUnits = units; ctx.promiseFoodSkipKcal = Math.round(s.kcal || 0); return; }
    const r = Game.giveFood(vid, 'meal'); // 'meal' is the honest default
    if (r) ctx.promiseFoodKept = (ctx.promiseFoodKept || 0) + 1;
  } catch (e) { ctx.keepPromiseErr = String(e && e.message).slice(0, 80); }
}
function keepPromiseSocial(Game, ctx, vid) {
  // A real conversation (substantive, 3+ exchanges) keeps belong/
  // understand promises — the engine's bar, not a hello-goodbye.
  // pickTalkChoice never takes commit choices, so this can't mint new
  // promises while keeping old ones.
  try {
    holdConversation(Game, ctx, vid);
    ctx.promiseSocialTried = (ctx.promiseSocialTried || 0) + 1;
  } catch (e) { ctx.keepPromiseErr = String(e && e.message).slice(0, 80); }
}
function keepPromiseHeal(Game, ctx, vid) {
  // Ladder: real medicine when able, tending when they're sick or wounded
  // (wound care is a real deed since r20), words (through the honest 40
  // talk cap) when there's nothing to treat.
  try {
    const v = Game.state.village || {};
    const sick = !!((v.sick || {})[vid]);
    let wounded = false;
    try {
      const vh = ((Game.state.village || {}).health || {});
      const hp = (vh[vid] !== undefined) ? vh[vid] : 100;
      wounded = !sick && hp < 70;
    } catch (e) {}
    const s = Game.state.scholar || {};
    const healAb = ['herbal_remedy', 'field_medicine', 'triage'].find(a => {
      try { return Game.hasAbility(a) && Game.abilityLevel(a) >= 2; } catch (e) { return false; }
    });
    if (sick && healAb && (s.kcal || 0) >= 150) {
      Game.treatVillager(vid, healAb);
      ctx.promiseHealTreated = (ctx.promiseHealTreated || 0) + 1;
    } else if (sick || wounded) {
      Game.tendVillager(vid); // 32 ticks of real care (sick or wound)
      ctx.promiseHealTended = (ctx.promiseHealTended || 0) + 1;
    } else if (Game.comfort) {
      Game.comfort(vid, 'silent'); // words-keep: presence, capped like all words
      ctx.promiseHealComforted = (ctx.promiseHealComforted || 0) + 1;
    }
  } catch (e) { ctx.keepPromiseErr = String(e && e.message).slice(0, 80); }
}
function keepPromises(Game, ctx) {
  try {
    const v = Game.state.village || {};
    const promises = v.promises || {};
    const today = (Game.state.scholar || {}).day || 0;
    const open = [];
    for (const [vid, p] of Object.entries(promises)) {
      if (!p || p.kept === true || p.kept === 'broken' || p.kept === 'released') continue;
      let alive = true;
      try { const per = Game.getPerson(vid); alive = !!(per && !per.dead); } catch (e) {}
      if (!alive) continue;
      const kind = (Game.promiseKeepKind && p.goal) ? Game.promiseKeepKind(p.goal) : null;
      if (!kind) continue;
      open.push({ vid, kind, left: promiseDaysLeft(Game, p, today) });
    }
    if (!open.length) return;
    open.sort((a, b) => a.left - b.left);
    for (const o of open) {
      if (Game.over) break;
      try {
        if (o.kind === 'food') keepPromiseFood(Game, ctx, o.vid);
        else if (o.kind === 'social') keepPromiseSocial(Game, ctx, o.vid);
        else if (o.kind === 'heal') keepPromiseHeal(Game, ctx, o.vid);
        else ctx['promiseOpen_' + o.kind] = (ctx['promiseOpen_' + o.kind] || 0) + 1;
      } catch (e) { ctx.keepPromiseErr = String(e && e.message).slice(0, 80); }
    }
    ctx.promiseScans = (ctx.promiseScans || 0) + 1;
  } catch (e) { ctx.keepPromisesErr = String(e && e.message).slice(0, 80); }
}

// Forage as a matter of course: a competent citizen works the land daily,
// not just when the ledger screams. The old gate (pantry < 25000) meant the
// player never foraged while the starting pantry looked fine — living off
// the commons, giving nothing, and getting exiled for freeloading by day 17
// (journey-scale r3 2026-10-11: 4/4 seeds exiled before the courtship began,
// all scale verbs blocked). Contribution is daily, not emergency-only.
function needTrip(Game, ctx) {
  try {
    const pantry = ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    const s = Game.state.scholar;
    if (pantry < 25000 || s.kcal < Game.kcalCap() * 0.5) return true;
    // CONTRIBUTION MAINTENANCE: if we haven't given to the pantry in 3 days,
    // we're taking without giving — forage. The village notices.
    if (ctx) {
      const day = (s && s.day) || 0;
      const lastGive = ctx._lastGiveDay || 0;
      if (day - lastGive >= 3) return true;
    }
    return false;
  } catch (e) { return false; }
}

// WORK THE WATER (food-early 2026-10-09): a competent leader keeps the
// cistern filled. Villagers drink 2L/day each; nobody fetches water
// autonomously, so without assignments the village dies of thirst while
// food is still on the table — 11/49 baseline deaths. Runs in upkeep (per
// part); the already-assigned guard keeps it to one worker per need.
// Assign in person (assignTask refuses remote).
function workWater(Game, ctx) {
  try {
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const v = Game.state.village || {};
    const vw = v.water || { clean: 0, dirty: 0 };
    const stored = (vw.clean || 0) + (vw.dirty || 0);
    const mouths = (v.roster || []).length;
    const asg = v.assignments || {};
    const onTask = (t) => Object.values(asg).some(a => a && a.task === t);
    const free = (v.roster || []).filter(id => {
      if (id === Game.villagerId) return false;
      if (asg[id] || v.gardenKeeper === id) return false;
      try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return true; }
    });
    let fi = 0;
    const assignOne = (task) => {
      if (fi >= free.length) return false;
      try { Game.assignTask(free[fi++], task, { via: 'in-person' }); return true; }
      catch (e) { return false; }
    };
    if (stored < mouths * 4 && !onTask('water')) assignOne('water');
    if ((v.wood || 0) < 8 && !onTask('wood')) assignOne('wood');
  } catch (e) {}
}

// COUNTER-PLAY (bal-survival 2026-10-10): an honest player in the depletion
// build doesn't just forage harder — they build the second food leg. When
// the near grounds thin: break garden ground at haven, put a green-handed
// villager on garden duty (they sow from village seed stock), and put a
// fisher on the creek. Traps: set one when holding a trap tool on wild
// ground. All best-effort, in-person, obedience-gated like any leadership.
function groundsThinning(Game) {
  try {
    let stocked = 0, thin = 0;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (x === 4 && y === 4) continue;
      const dist = Math.abs(x - 4) + Math.abs(y - 4);
      if (dist < 1 || dist > 2) continue;
      const t = Game.tileAt(x, y);
      if (!t || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
      stocked++;
      if (Game.depletionLevel(t) !== 'lush') thin++;
    }
    return stocked >= 3 && thin / stocked > 0.5;
  } catch (e) { return false; }
}

// SEED-FIRST (bal-survival 2026-10-10): sowing is the player's call, and
// seed is 2 units of a known gardenable plant from the PACK — not the
// pantry (the pantry never holds seed stock; stockPantry makes generic
// items). An honest player sows from the fresh haul BEFORE donating it,
// or the village eats the seed. Returns true when something was sown.
function trySow(Game, ctx) {
  if(Game.over||Game.pendingEncounter||Game.inCombat())return false;
  if (!Game.gardenPlots || !Game.sowOptions || !Game.sowPlot || Game.map.px !== 4 || Game.map.py !== 4) return false;
  const plots=Game.gardenPlots(),plot=plots.find(p=>!p.pid&&!p.dead);
  if(!plot)return false;
  const opts=(Game.sowOptions()||[]).slice().sort((a,b)=>a.growthDays-b.growthDays||(b.kcalEach||0)-(a.kcalEach||0));
  if(!opts.length)return false;
  const inside=Game.state.scholar.insideHaven,active=gardenActorGuard(Game);
  try {
    if(inside&&Game.exitBuilding()!==true)return false;
    Game.sowPlot(opts[0].pid);
    if(!active()||plot.pid!==opts[0].pid||plot.dead)return false;
    ctx.sown=(ctx.sown||0)+1;return true;
  } catch(e){console.warn('[policy] sow',e.message);return false;}
  finally{if(inside&&active()&&!Game.state.scholar.insideHaven)Game.enterBuilding();}
}

// Public-action gardening. The same current controller runs against both
// roots; absent baseline APIs remain unavailable, never simulated by edits.
function workGarden(Game,ctx) {
  if(Game.map.px!==4||Game.map.py!==4||Game.inCombat()||Game.pendingEncounter||Game.over)return;
  const inside=Game.state.scholar.insideHaven,active=gardenActorGuard(Game);
  let cropWork=false;
  const harvest=()=>{
    const collect=active()&&Game.gardenGate('harvest').ok;
    if(collect)Game.harvestGarden();
    const prepared=active()?prepareGardenFood(Game,ctx):0;
    cropWork=cropWork||collect||prepared>0;
    if(active()&&(collect||prepared))competentEat(Game);
  };
  try{
    if(inside&&Game.exitBuilding()!==true)return;
    if(!active())return;
    harvest();if(!active())return;
    const target=Math.min(4,Game.gardenCapacity?Game.gardenCapacity():6);
    while(active()&&Game.gardenPlots().length<target){const n=Game.gardenPlots().length;Game.makePlot();if(Game.gardenPlots().length<=n)break;}
    if(!active())return;
    const v=Game.state.village;
    if(Game.setGardenKeeper && !Game.gardenKeeperReady(v.gardenKeeper)){
      const candidates=(v.roster||[]).filter(id=>Game.gardenKeeperReady(id)&&!v.assignments?.[id]);
      const score=id=>(Game.villagerKnowsPlants(id)||[]).length+(Game.gardenMagicPlan(id)?10:0);
      candidates.sort((a,b)=>score(b)-score(a));
      if(candidates.length)Game.setGardenKeeper(candidates[0]);
    }
    if(Game.reclaimGarden&&Game.gardenPlots().some(p=>p.dead)&&Game.state.scholar.kcal>=800)Game.reclaimGarden();
    if(!active())return;
    trySow(Game,ctx);
    if(!active())return;
    if(Game.cultivateGarden&&Game.state.scholar.kcal>=1000&&Game.gardenMagicGate().ok)Game.cultivateGarden();
    if(!active())return;
    harvest();if(!active())return;
    if(!v.gardenKeeper){
      const hasGarden=Object.values(v.assignments||{}).some(a=>a?.task==='garden');
      if(!hasGarden)assignBest(Game,'garden',['farmer','gardener','botanist','herbalist','forager']);
    }
  }catch(e){console.warn('[policy] garden',e.message);}
  finally{if(inside&&active()&&!Game.state.scholar.insideHaven)Game.enterBuilding();}
  if(cropWork&&active()&&Game.state.scholar.insideHaven)donateHaul(Game,ctx);
}

// THE KNIFE IN THE PACK (longsim food r6 2026-10-12): sim scholars start
// knifeless and stone never meets vine in the pack — the trapline's catches
// rot uncleaned (r5: 56 catches, ~1 cleaned). This is a materials-gathering
// BEHAVIOR blank, not a game bug: a real player prioritizing the line
// gathers the stone. The competent policy now does too:
//
//   - knifeNeeded: the trigger — uncleaned carcasses in the pack, trap
//     materials held (with the snare known), or actively traplining.
//   - keepKnife (camp ritual, before workTrapline): knap the universal
//     stone knife FIRST (everyone's L3 — the game's own knifeless message
//     points at it: stone + vine, 85%, durable), so the knife wins the
//     pack's vine before snare crafts eat it. Once knapped the knife is
//     held durably — this fires ~once per life.
//   - the trip: when the knife is needed and stone is the missing half, a
//     rubble-choked path is roadwork, not a detour — clear it (a day-part,
//     40 kcal, 1-3 real stone), then walk in. When vine is the missing
//     half, prefer revealed vine-rich ground (thickets).
// Env gate COMPETENT_KEEP_KNIFE=0 restores the exact old behavior for
// identical-seed before/after.
function packMat(Game, m) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
  } catch (e) { return 0; }
}
function knifeNeeded(Game, ctx) {
  try {
    if (Game.hasCuttingTool && Game.hasCuttingTool()) return false;
    const inv = (Game.state.scholar || {}).inventory || [];
    if (inv.some(i => i && i.foodState === 'carcass')) return true; // uncleaned carcasses
    const snareKnown = (((Game.state.codex || {}).recipes || {}).snare || {}).level >= 1;
    if (snareKnown && (packMat(Game, 'vine') >= 1 || packMat(Game, 'stick') >= 1)) return true; // holds trap materials
    if ((ctx.trapsCrafted || 0) > 0 || (ctx.trapsSet || 0) > 0 || (ctx.trapsWireSet || 0) > 0) return true; // actively traplining
    return false;
  } catch (e) { return false; }
}
function knifeWantsStone(Game, ctx) {
  return knifeNeeded(Game, ctx) && packMat(Game, 'stone') < 1;
}
function knifeWantsVine(Game, ctx) {
  return knifeNeeded(Game, ctx) && packMat(Game, 'stone') >= 1 && packMat(Game, 'vine') < 1;
}
// ARMOR-VINE SEEK (journey-deepening r48, 2026-10-25): once the knife is
// owned, the policy's only vine-seeking (knifeWantsVine / vinebank) turns
// OFF — and vine stalls: r47's 42003 banked exactly 1 vine from day 17 to
// day 100 with zero thicket forage calls, while bark>=3 sat in the pack.
// A real player who wants bark armor walks to the thickets for the vine
// half, the same way a knifeless player does for the knife half. This
// extends the existing trip preference to the armor need: bark armor
// (bark 3 + vine 2) or hide armor (hide 2 + vine 1), gated on the recipe
// being seen enough to attempt (level >= 1, matching the journey driver's
// daily craft attempts) and on the bulk mat already banked, so the trip
// has a purpose. Env-gated COMPETENT_ARMOR_VINE_SEEK=1, default OFF —
// every other competent user is byte-identical.
function armorWantsVine(Game, ctx) {
  if (process.env.COMPETENT_ARMOR_VINE_SEEK !== '1') return false;
  try {
    const s = Game.state.scholar;
    if (!s) return false;
    const recipes = ((Game.state.codex || {}).recipes || {});
    const barkLvl = (recipes.bark_armor || {}).level || 0;
    const hideLvl = (recipes.hide_armor || {}).level || 0;
    if (barkLvl >= 1 && packMat(Game, 'bark') >= 3 && packMat(Game, 'vine') < 2) return true;
    if (hideLvl >= 1 && packMat(Game, 'hide') >= 2 && packMat(Game, 'vine') < 1) return true;
    return false;
  } catch (e) { return false; }
}
// hop-by-hop honest walk toward (hx,hy): one travelTo per hop, no force,
// bounded. travelTargets only reaches d<=3, so a single travelTo can't
// cross the map — walk it like a player would.
function walkTo(Game, hx, hy) {
  try {
    let guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 && !Game.over && !Game.tbfight) {
      let best = null, bd = 1e9;
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - hx) + Math.abs(tt.y - hy);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      const px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) {
        // refused: stay put, safely — or (opt-in) go around, as the
        // blockage card's own "Go around" button offers a human.
        if (routeAroundOn() && routeAround(Game, hx, hy)) continue;
        break;
      }
    }
  } catch (e) {}
}
// ROUTE AROUND (tuning 2026-10-15, opt-in COMPETENT_ROUTE_AROUND=1, set by
// capable): walkTo stopped dead at the first refused step. A fallen tree
// guarding the haven's approach side left the bearer one tile from home for
// days, out of water and food, until dehydration killed them (seed 42 day
// 27; 18 of 64 baseline runs had a dehydration death). A human taps "Go
// around". BFS over orthogonal steps the engine's own travelBlockage allows,
// then walk the first step. Returns true when it moved.
function routeAroundOn() { return process.env.COMPETENT_ROUTE_AROUND === '1'; }
function routeAround(Game, hx, hy) {
  try {
    const N = (Game.map && Game.map.worldSize) || 9;
    const sx = Game.map.px, sy = Game.map.py;
    const key = (x, y) => x + ',' + y;
    const prev = {}; prev[key(sx, sy)] = null;
    const q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === hx && y === hy) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || key(nx, ny) in prev) continue;
        let blocked = true;
        try { blocked = !!Game.travelBlockage(nx, ny, x, y); } catch (e) { blocked = true; }
        if (blocked) continue;
        prev[key(nx, ny)] = [x, y];
        q.push([nx, ny]);
      }
    }
    if (!(key(hx, hy) in prev)) return false;
    let cur = [hx, hy];
    while (prev[key(cur[0], cur[1])] && !(prev[key(cur[0], cur[1])][0] === sx && prev[key(cur[0], cur[1])][1] === sy)) cur = prev[key(cur[0], cur[1])];
    try { Game.travelTo(cur[0], cur[1]); } catch (e) { return false; }
    return Game.map.px !== sx || Game.map.py !== sy;
  } catch (e) { return false; }
}
// nearest rubble-choked path in travel reach (from the player's tile)
function nearestRubble(Game) {
  let best = null;
  try {
    for (const tt of (Game.travelTargets() || [])) {
      let b = null;
      try { b = Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (!b || b.blockType !== 'rubble') continue;
      if (!best || tt.d < best.d) best = { x: tt.x, y: tt.y, d: tt.d };
    }
  } catch (e) {}
  return best;
}
// nearest unrevealed tile on the map (the expedition's frontier)
function nearestUnknown(Game) {
  try {
    const px = Game.map.px, py = Game.map.py;
    let ux = -1, uy = -1, ud = 1e9;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (x === px && y === py) continue;
      const t = Game.tileAt(x, y);
      if (!t || t.revealed) continue;
      const d = Math.abs(x - px) + Math.abs(y - py);
      if (d < ud) { ud = d; ux = x; uy = y; }
    }
    return ux < 0 ? null : { x: ux, y: uy };
  } catch (e) { return null; }
}
// Walk to the rubble's guarded side and clear it — the blockage card's own
// honest path (a day-part, 40 kcal, 1-3 stone into the pack). The guarded
// side is (bx+bf.dx, by+bf.dy): blockFrom.dx/dy is the direction you'd be
// coming FROM to enter the tile. Returns true when the rubble was cleared.
function clearRubbleForStone(Game, ctx, bx, by) {
  try {
    const t = Game.tileAt(bx, by);
    const bf = t && t.blockFrom;
    if (!bf || bf.type !== 'rubble') return false;
    const sx = bx + (bf.dx || 0), sy = by + (bf.dy || 0);
    if (sx < 0 || sy < 0 || sx > 8 || sy > 8) return false;
    if (Game.map.px !== sx || Game.map.py !== sy) {
      try { Game.travelTo(sx, sy); } catch (e) { return false; } // honest walk, no force
      if (Game.over || Game.tbfight) return false;
      if (Game.map.px !== sx || Game.map.py !== sy) return false;
    }
    const before = packMat(Game, 'stone');
    try { Game.clearBlockage(bx, by); } catch (e) { return false; }
    const gained = packMat(Game, 'stone') - before;
    ctx.rubbleCleared = (ctx.rubbleCleared || 0) + 1;
    if (gained > 0) ctx.stoneFromRubble = (ctx.stoneFromRubble || 0) + gained;
    return true;
  } catch (e) { return false; }
}
function keepKnife(Game, ctx) {
  if (process.env.COMPETENT_KEEP_KNIFE === '0') return; // before/after harness gate
  try {
    if (!knifeNeeded(Game, ctx)) return;
    // VINEBANK (materials-banking 2026-10-14): while the trapper is banking
    // vine+stick for the blind band, the bank has first claim — the knife
    // waits. Counted in ctx for the pilot's telemetry.
    const defer = vinebank.defersCraft(Game, 'stone_knife');
    if (defer) { ctx.vinebankDeferred = (ctx.vinebankDeferred || 0) + 1; ctx.vinebankDeferKnife = (ctx.vinebankDeferKnife || 0) + 1; return; }
    // KNAP FIRST: stone + vine → the universal stone knife. Runs before
    // workTrapline's snare crafts in daily() so the durable knife wins the
    // vine race. The 15% fail is real: materials already consumed by craft().
    if (packMat(Game, 'stone') >= 1 && packMat(Game, 'vine') >= 1) {
      try {
        if (Game.craft('stone_knife')) ctx.knivesKnapped = (ctx.knivesKnapped || 0) + 1;
        else ctx.knapFailed = (ctx.knapFailed || 0) + 1;
      } catch (e) {}
    }
  } catch (e) {}
}
// ARM UP (longsim combat r1 2026-10-12): a competent player arms BEFORE
// fighting. The r1 baseline measured bare-handed fighters: the day-12 player
// had no weapon and an empty pack, and 83% of player deaths were combat —
// mostly wave-1 wild ambushes they couldn't out-DPS (~2/round vs 11-30
// incoming). stone_knife is universal L3 knowledge and a bonus-12 weapon;
// knap one when stone+vine are on hand. gearUp (upkeep) equips it, and
// hasCuttingTool counts an equipped knife — no butchering regression.
function armUp(Game, ctx) {
  try {
    const w = (Game.equippedWeapon && Game.equippedWeapon()) || {};
    if (!w.unarmed) return; // already holding a real weapon
    if (packMat(Game, 'stone') >= 1 && packMat(Game, 'vine') >= 1) {
      // VINEBANK (materials-banking 2026-10-14): the weapon knife waits for
      // the blind band too — the bank has first claim while it is not full.
      const defer = vinebank.defersCraft(Game, 'stone_knife');
      if (defer) { ctx.vinebankDeferred = (ctx.vinebankDeferred || 0) + 1; ctx.vinebankDeferArm = (ctx.vinebankDeferArm || 0) + 1; return; }
      if (Game.craft('stone_knife')) ctx.armedKnife = (ctx.armedKnife || 0) + 1;
      else ctx.armFailed = (ctx.armFailed || 0) + 1;
    }
  } catch (e) {}
}
// STONE RUN (food r6): when the knife needs its stone half, a competent
// trapper makes a DELIBERATE detour to the nearest rubble-choked path —
// roadwork, not luck. (The forage trip's opportunistic clearing only fires
// when a blocked tile surfaces in the trip rotation, which ~never happens:
// 12-seed probe showed rubble=0 everywhere. A real player prioritizing the
// line walks to the rubble on purpose.) Scans travel reach for rubble,
// clears the nearest (a day-part, 40 kcal, 1-3 real stone), walks home.
// Fires at most until stone≥1 — then knifeWantsStone goes false.
function stoneRun(Game, ctx) {
  if (process.env.COMPETENT_KEEP_KNIFE === '0') return; // before/after harness gate
  try {
    if (!knifeWantsStone(Game, ctx)) return;
    const hx = Game.map.px, hy = Game.map.py;
    // 1. known roads first
    let best = nearestRubble(Game);
    // 2. EXPEDITION (food r6): rubble is ~8% of wild tiles and the player
    //    only knows the roads they've walked — the scan above is fog-honest
    //    but blind on most seeds (seed 11: 2 rubble tiles, both far from
    //    haven; the forage trips map the whole neighborhood by day 5). A
    //    real player needing stone walks the unknown: push the frontier
    //    (walkTo hops there honestly, real travel costs and encounter risk),
    //    re-scan at each new ground. Up to 3 pushes/day.
    let pushes = 0;
    while (!best && pushes < 3 && !Game.over && !Game.tbfight) {
      const U = nearestUnknown(Game);
      if (!U) break;
      walkTo(Game, U.x, U.y);
      pushes++;
      ctx.fogSteps = (ctx.fogSteps || 0) + 1;
      if (!Game.over && !Game.tbfight) best = nearestRubble(Game);
    }
    if (Game.over || Game.tbfight) { walkTo(Game, hx, hy); return; }
    if (best) {
      if (clearRubbleForStone(Game, ctx, best.x, best.y))
        ctx.stoneRuns = (ctx.stoneRuns || 0) + 1;
    }
    // walk home whether or not stone was found — never strand the expedition
    walkTo(Game, hx, hy);
  } catch (e) {}
}

// Forage trip that feeds the garden: travel out, forage, travel home. The
// haul comes home as unidentified lumps (prepStash) — sorting, sowing, and
// donating happen as separate honest steps in daily(), not hidden in the trip.
function forageTripSeedFirst(Game, ctx) {
  const s = Game.state.scholar;
  const keepKnifeOn = process.env.COMPETENT_KEEP_KNIFE !== '0';
  try {
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      const t = Game.tileAt(tt.x, tt.y);
      if (!t || t.type === 'haven' || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
      let blocked = false, blockType = null;
      try { const b = Game.travelBlockage(tt.x, tt.y); blocked = !!b; blockType = b && b.blockType; } catch (e) {}
      cands.push({ x: tt.x, y: tt.y, d: tt.d, blocked, blockType, type: t.type, revealed: !!t.revealed });
    }
    // VINE-RICH GROUND (food r6): when vine is the knife's missing half, a
    // competent player heads for the thickets — bushes grow in thickets, and
    // that's player-visible world knowledge (revealed tiles only; the fog
    // keeps its secrets). A vine-rich tile counts as one step nearer.
    const wantVine = keepKnifeOn && knifeWantsVine(Game, ctx);
    // ARMOR-VINE SEEK (journey-deepening r48): the armor need wants the
    // same thicket ground the knife wants. Counted for the run's telemetry
    // (driver ctx IS policy ctx); the trip preference itself is unchanged.
    const armorVine = armorWantsVine(Game, ctx);
    if (armorVine) ctx.armorVineSeekTrips = (ctx.armorVineSeekTrips || 0) + 1;
    // VINEBANK (materials-banking 2026-10-14): a trapper banking vine+stick
    // for the blind band wants the same ground the knife wants — thickets
    // for vine (bush harvests), groves for stick (tree harvests).
    const vbBoost = vinebank.tripBoost(Game);
    const vbWantVine = vbBoost.vine, vbWantStick = vbBoost.stick;
    // STONE-FIRST SORT (food r6): when the knife needs its stone half, a
    // rubble-choked tile IS the destination — route to it deliberately
    // instead of sorting it last. The trip's clearing branch does the work.
    const wantStone = keepKnifeOn && knifeWantsStone(Game, ctx);
    const wantVineBank = wantVine || vbWantVine || armorVine; // the bank wants thickets too, and so does the armor need (r48)
    const deff = (c) => c.d - ((wantVineBank && c.revealed && (c.type === 'thicket' || c.type === 'grove')) ? 1 : 0)
                             - ((vbWantStick && c.revealed && c.type === 'grove') ? 1 : 0);
    cands.sort((a, b) =>
      ((wantStone && a.blockType === 'rubble' ? 0 : 1) - (wantStone && b.blockType === 'rubble' ? 0 : 1)) ||
      (a.blocked - b.blocked) || (deff(a) - deff(b)));
    if (!cands.length) return 0;
    const hx = Game.map.px, hy = Game.map.py;
    // WORKED-OUT PATCH (longsim combat r2 2026-10-11): the nearest stocked
    // tile is usually the one we picked clean yesterday (detail regrows in
    // ~2 days) — the old code foraged it anyway and the trip failed every
    // day, so the policy never gathered wild food OR crafting materials. A
    // competent player steps to another green patch when the forage comes
    // back empty, like the game's own failure line says. Try up to 3.
    let foraged = 0;
    for (const pick of cands.slice(0, 3)) {
      // FIGHT-ASSESS MAP DECLINE (longsim scale-wall r3): the scholar can
      // SEE the monster on the tile (perception) — walk around an unwinnable
      // fight instead of into it. Decline engagement at the map level.
      if (fightAssessOn() && fightAssessSkipTile(Game, ctx, pick.x, pick.y)) continue;
      // W2-DISENGAGE MAP DECLINE (longsim scale-wall r16 arm B, gate
      // COMPETENT_W2DISENGAGE=1): skip visible unarmored top-4 tiles.
      if (w2disengageOn() && w2disengageSkipTile(Game, ctx, pick.x, pick.y)) continue;
      // HONEST TRAVEL (food r6): the old form passed pick.blocked as
      // travelTo's FORCE arg — a blocked path was crossed for free (no
      // 40 kcal, no stone, no card). A real player goes around or does the
      // roadwork. Never force.
      const res = keepKnifeOn
        ? Game.travelTo(pick.x, pick.y)
        : Game.travelTo(pick.x, pick.y, pick.blocked); // legacy: gate-off behavior
      if (Game.over || Game.tbfight) { try { Game.travelTo(hx, hy); } catch (e) {} return 0; }
      if (Game.map.px !== pick.x || Game.map.py !== pick.y) {
        // STONE RUN (food r6): rubble on the path and the knife needs its
        // stone half — do the roadwork (clearRubbleForStone: a day-part,
        // 40 kcal, 1-3 real stone), then walk in. The rubble's stone is why
        // a competent trapper clears paths.
        if (keepKnifeOn && res && res.blockType === 'rubble' && knifeWantsStone(Game, ctx)) {
          if (clearRubbleForStone(Game, ctx, res.x, res.y)) {
            const res2 = Game.travelTo(pick.x, pick.y);
            if (Game.over || Game.tbfight) { try { Game.travelTo(hx, hy); } catch (e) {} return 0; }
            if (Game.map.px !== pick.x || Game.map.py !== pick.y) continue;
          } else continue;
        } else continue;
      }
      let ok = null;
      try { ok = Game.doAction('forage', {}); ctx.forageTrips = (ctx.forageTrips || 0) + 1; } catch (e) {}
      if (ok) { foraged = 1; workTraplineSet(Game, ctx); break; }
    }
    try { Game.travelTo(hx, hy); } catch (e) {}
    return foraged;
  } catch (e) { try { Game.travelTo(Game.map.px, Game.map.py); } catch (e2) {} return 0; }
}

// Donate the haul: identified edible inventory food goes to the pantry.
// (The seed was already sown by trySow; the player keeps a 1-day buffer.)
function donationFoodReady(Game,it) {
  return !!it&&Number.isFinite(it.kcalEach)&&it.kcalEach>0&&
    Number.isFinite(it.units??1)&&(it.units??1)>0&&!it.bonded&&it.edible!==false&&
    it.safe!==false&&!it.needsCooking&&it.foodState!=='in_shell'&&
    !it.diseaseRisk&&!it.poisonRisk&&!it.parasiteRisk&&!Game.isSpoiled(it);
}
// Both donation decisions use physically moved units AND the gift ledger.
// null is the public action's result on success as well as refusal.
function donateSurplus(Game,ctx,options={}) {
  let transferred=0;
  try {
    if(Game.havenStoresAccess&&Game.havenStoresAccess()==='none')return 0;
    const s=Game.state.scholar,inv=s.inventory||[],active=gardenActorGuard(Game,true);
    const cap=Game.kcalCap?Game.kcalCap():2400;
    const keep=options.keepKcal??(process.env.COMPETENT_TRADE_RESERVE==='1'?cap*3:cap);
    const max=options.maxTransfers??Infinity;
    if(!Number.isFinite(keep)||keep<0)return 0;
    for(let i=inv.length-1;i>=0&&transferred<max&&active();i--){
      const it=inv[i];if(!donationFoodReady(Game,it))continue;
      const have=it.units??1;
      const available=inv.reduce((n,item)=>n+(donationFoodReady(Game,item)?item.kcalEach*(item.units??1):0),0);
      const room=Game.pantryCapKcal()-Game.pantryKcal();
      if(!Number.isFinite(room))continue;
      let amount=have;
      if(typeof Game.pantryDonationOptions==='function'){
        const choice=Game.pantryDonationOptions(i);if(!choice.ok)continue;
        amount=Math.min(have,choice.maxUnits,Math.floor(Math.max(0,available-keep)/it.kcalEach));
        if(!Number.isSafeInteger(amount)||amount<=0)continue;
      }else if(available-have*it.kcalEach<keep||room<have*it.kcalEach)continue;
      const kcal=it.kcalEach*amount;
      const vid=Game.villagerId,before=(Game.state.village.gives||{})[vid]||0;
      ctx.donationAttempts=(ctx.donationAttempts||0)+1;
      Game.donateToPantry(i,amount);
      const credited=((Game.state.village.gives||{})[vid]||0)-before;
      const moved=have-(inv.includes(it)?it.units??1:0);
      if(moved===amount&&Math.abs(credited-kcal)<1e-6){
        transferred++;ctx.donated=(ctx.donated||0)+1;
        ctx.donatedKcal=(ctx.donatedKcal||0)+credited;
        ctx._lastGiveDay=s.day||0;
      }else if(moved===0&&credited===0)ctx.donationRefusals=(ctx.donationRefusals||0)+1;
      else throw Error('Donation removal and gift credit disagree');
    }
  }catch(e){
    ctx.donationErrors=(ctx.donationErrors||0)+1;
    (ctx.notes||(ctx.notes=[])).push('donateSurplus: '+e.message);
    console.warn('[policy] donateSurplus: '+e.message);
  }
  return transferred;
}
function donateHaul(Game,ctx) {
  return donateSurplus(Game,ctx);
}

// SORT THE HAUL (bal-survival 2026-10-10): foraging yields unknowns, period —
// identification happens at the camp ritual. An honest player sorts the bag
// at haven after a trip: known plants (and field-clicked ones) become real
// food that can be eaten, sown, or donated. Without this the haul is lumps.
// A villager who KNOWS the plants sorts with you — watching a knower teaches
// (faster than solo field-clicks); solo is the fallback.
function sortHaul(Game, ctx) {
  try {
    if (!Game.atCamp || !Game.atCamp()) return 0;
    const stash = (Game.state.scholar || {}).prepStash || [];
    const hasLumps = stash.some(l => l && l.lump && Object.keys(l.lump).length);
    if (!hasLumps) return 0;
    // best sorter: the roster villager who knows the most plants (background
    // knowledge breaks the chicken-and-egg); solo if nobody knows anything.
    let bestVid = null, bestKnown = 0;
    try {
      const v = Game.state.village || {};
      for (const rid of (v.roster || [])) {
        if (rid === Game.villagerId) continue;
        const known = Game.villagerKnowsPlants ? (Game.villagerKnowsPlants(rid) || []).length : 0;
        if (known > bestKnown) { bestKnown = known; bestVid = rid; }
      }
    } catch (e) {}
    let sorted = 0;
    for (let i = stash.length - 1; i >= 0 && sorted < 3; i--) {
      if (stash[i] && stash[i].lump && Object.keys(stash[i].lump).length) {
        try { Game.sortBag(bestVid, i); sorted++; } catch (e) {}
      }
    }
    if (sorted) ctx.sorted = (ctx.sorted || 0) + sorted;
    return sorted;
  } catch (e) { return 0; }
}

function freeVillagers(Game) {
  try {
    const v = Game.state.village || {};
    const asg = v.assignments || {};
    return (v.roster || []).filter(id => {
      if (id === Game.villagerId) return false;
      if (asg[id]) return false;
      try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return true; }
    });
  } catch (e) { return []; }
}

function assignBest(Game, task, occWords) {
  try {
    const v = Game.state.village || {};
    const asg = v.assignments || {};
    if (Object.values(asg).some(a => a && a.task === task)) return false;
    const free = freeVillagers(Game);
    if (!free.length) return false;
    const score = (id) => {
      let s = 0;
      try {
        const p = Game.getPerson(id) || {};
        const occ = (p.formerOccupation || '').toLowerCase();
        if (occWords.some(w => occ.includes(w))) s += 2;
        if (Game.villagerCompetence) s += Game.villagerCompetence(id, task);
      } catch (e) {}
      return s;
    };
    free.sort((a, b) => score(b) - score(a));
    try { Game.assignTask(free[0], task, { via: 'in-person' }); return true; }
    catch (e) { return false; }
  } catch (e) { return false; }
}

// assignAnother: like assignBest but allows MULTIPLE villagers on the same
// task (the creek crew, not a lone fisher).
function assignAnother(Game, task, occWords) {
  try {
    const v = Game.state.village || {};
    const free = freeVillagers(Game);
    if (!free.length) return false;
    const score = (id) => {
      let s = 0;
      try {
        const p = Game.getPerson(id) || {};
        const occ = (p.formerOccupation || '').toLowerCase();
        if (occWords.some(w => occ.includes(w))) s += 2;
        if (Game.villagerCompetence) s += Game.villagerCompetence(id, task);
      } catch (e) {}
      return s;
    };
    free.sort((a, b) => score(b) - score(a));
    try { Game.assignTask(free[0], task, { via: 'in-person' }); return true; }
    catch (e) { return false; }
  } catch (e) { return false; }
}

function counterPlay(Game, ctx) {
  try {
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const day = (Game.state.scholar || {}).day || 0;
    if ((ctx._cpDay || 0) === day) return;
    ctx._cpDay = day;
    workGarden(Game,ctx);
    // fishing: the creek crew. Two fishers from day one — the early deficit
    // kills before the garden matures. Three when the pantry is critical.
    // (Three from day one was tried: more exposure killed more than the
    // extra fish saved. Two is the sweet spot.)
    try {
      const v = Game.state.village || {};
      const pantryKcal = ((v.pantry || [])).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      const fishers = Object.values(v.assignments || {}).filter(a => a && a.task === 'fish').length;
      const day = (Game.state.scholar || {}).day || 0;
      const wantFishers = pantryKcal < 15000 ? 3 : (pantryKcal < 30000 || day <= 5) ? 2 : 1;
      for (let i = fishers; i < wantFishers; i++) {
        if (assignAnother(Game, 'fish', ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook']))
          ctx.fishStaffed = (ctx.fishStaffed || 0) + 1;
        else break;
      }
    } catch (e) {}
    // STAFF THE SMOKE RACKS (longsim food 2026-10-11): a competent leader
    // puts a cook on duty when fresh food is about to rot. Anyone can work
    // the racks (rough job: 0.80x, 15d); a real preserver
    // (chef/fisherman/farmer/smoker) is preferred and does it properly.
    // Only free villagers: pulling a fisher off the creek to smoke is the
    // player's call, not the bot's.
    // FOOD R8 (longsim food r8 2026-10-12): a second-cook scale-up was tried
    // here (staff 2 when freshKcal > 12000) and KILLED at pilot — 54 cook
    // assignments fired but trajectories were byte-identical (rot 98/76/91/
    // 99% both arms). The bottleneck is game-side (cook 4,000 kcal/day
    // budget + racksFull guard), not staffing. Single cook stands.
    try {
      const v = Game.state.village || {};
      const day = (Game.state.scholar || {}).day || 0;
      const asg = v.assignments || {};
      const hasCook = Object.values(asg).some(a => a && a.task === 'cook');
      if (!hasCook) {
        let freshKcal = 0;
        for (const it of (v.pantry || [])) {
          const sd = it.spoilDay == null ? 99999 : it.spoilDay;
          if ((it.kcalEach || 0) > 0 && (it.units || 0) > 0 && sd - day <= 3 && sd - day >= 0 && it.foodState !== 'preserved')
            freshKcal += (it.kcalEach || 0) * (it.units || 1);
        }
        if (freshKcal > 1500) {
          // STAFFING FALLBACK (longsim food 2026-10-25, sim-stafffallback-b):
          // the old code picked the single highest-preserver free villager
          // and never fell through: on seed 9754 the widening made Rosa
          // Mendez (skill 2) the permanent pick, and she refuses cook duty
          // every time (cook gates at trust 20), so no cook was ever
          // staffed and nothing was ever smoked. Try down the skill list
          // until someone says yes; a refusal moves to the next candidate,
          // and if nobody accepts no cook is staffed (honest, not forced).
          // Ties keep roster order (stable sort), as the old strict-> pick did.
          const cands = freeVillagers(Game).map((id) => {
            let sk = 0;
            try { sk = Game.specialistSkill ? Game.specialistSkill(Game.getPerson(id) || {}, 'preserver') : 0; }
            catch (e) {}
            return { id, sk };
          }).sort((a, b) => b.sk - a.sk);
          for (let ci = 0; ci < cands.length; ci++) {
            let res = null;
            try { res = Game.assignTask(cands[ci].id, 'cook', { via: 'in-person' }); }
            catch (e) { res = null; }
            if (res && res.ok) {
              ctx.cookStaffed = (ctx.cookStaffed || 0) + 1;
              if (ci > 0) ctx.cookStaffFallback = (ctx.cookStaffFallback || 0) + 1;
              break;
            }
          }
        }
      }
    } catch (e) {}
    // (trap setting now lives in workTrapline, called from daily)
  } catch (e) {}
}

// WORK THE TRAPLINE (longsim combat r2 2026-10-11): traps sat at 0/0 across
// every measured run — the policy "crafts nothing and invents nothing," so
// the whole craft->set->dawn-check trapline (ecology, shyness, uses, rot,
// carcasses) never ran in a 200-day sim. A competent player who knows the
// snare keeps a small trapline: craft what they know (L2+ reliably; L1 blind
// only when materials are plentiful — 35% odds, materials at real risk), set
// it on wild ground, and the dawn check does the rest. Cap: 2 held traps —
// traps are consumed on set and wear out, so this maintains a working line,
// not a stockpile. The old every-3-days setter in counterPlay is folded in
// here (one place, one cadence).
const TRAPLINE_IDS = ['snare', 'deadfall', 'box_trap', 'spring_snare', 'minnow_trap', 'pit_trap'];
// CLEAN THE CATCH (longsim food r5 2026-10-12): trapped carcasses rot in
// ~2 days ("clean it quickly (knife). It rots fast") and the policy never
// cleaned them — seed 11: 31 catches, 0 cleaned, the meat lost (rotted or
// dropped on player death). A competent player with a cutting tool cleans
// the catch at camp (8 ticks each, first rung of the preservation ladder);
// without a knife the carcass sits, honestly.
function cleanCatch(Game, ctx) {
  if (process.env.COMPETENT_CLEAN_CATCH === '0') return; // before/after harness gate
  try {
    const s = Game.state.scholar; if (!s) return;
    const inv = s.inventory || [];
    let stash = [];
    try { stash = (Game.prepStash && Game.prepStash()) || []; } catch (e) {}
    const nInv = inv.filter(i => i && i.foodState === 'carcass').length;
    const nStash = stash.filter(i => i && i.foodState === 'carcass').length;
    if (!nInv && !nStash) return;
    // KNAP FIRST: the dawn catch says "clean it quickly (knife)" and the
    // knifeless message points at the universal stone-knife recipe (L3 for
    // everyone) — a competent trapper holding stone + vine knaps the edge
    // instead of watching dinner rot. Durable craft, lives in the pack.
    if (!Game.hasCuttingTool || !Game.hasCuttingTool()) {
      const have = (m) => inv.filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
      if (have('stone') >= 1 && have('vine') >= 1) {
        try { if (Game.craft('stone_knife')) ctx.knappedKnife = (ctx.knappedKnife || 0) + 1; } catch (e) {}
      }
    }
    if (!Game.hasCuttingTool || !Game.hasCuttingTool()) return; // still knifeless: the carcass sits, honestly
    // THE KITCHEN COUNTER (food r6 2026-10-12): the homecoming pooling moves
    // unprocessed hauls — carcasses included — from the pack to the prep
    // stash. The r5 policy only swept the pack, so trapped carcasses rotted
    // on the counter untouched (53 catches, 0 cleaned on identical seeds).
    // A competent trapper cleans the counter too — same action, same knife.
    try { Game.cleanCarcass(); ctx.cleanedCarcasses = (ctx.cleanedCarcasses || 0) + nInv; } catch (e) {}
    try {
      const m = stash.filter(i => i && i.foodState === 'carcass').length;
      if (m) {
        Game.cleanCarcass(undefined, stash);
        ctx.cleanedCarcasses = (ctx.cleanedCarcasses || 0) + m;
        ctx.cleanedStash = (ctx.cleanedStash || 0) + m;
      }
    } catch (e) {}
  } catch (e) {}
}

// SET THE LINE WHERE YOU STAND (longsim food r5 2026-10-12): the SET half
// of workTrapline never fired — it ran at day-end, when the player is back
// at haven, and setTrap refuses haven tiles. The traps were crafted and
// never set (2 crafts / 0 sets across 200-day sims). A real player sets the
// trap while OUT on the wild tile, right after working it — the dawn check
// visits every tile's traps, so the line works while you sleep elsewhere.
// This is called from forageTripSeedFirst on the foraged tile, one trap per
// outing (the 2-held cap keeps it a working line, not a stockpile).
// Wire fallback: snare wire in hand sets an improvised 2-use snare with no
// recipe knowledge needed (setTrap's honest-tackle path) — a competent
// player finding wire sets it.
function workTraplineSet(Game, ctx) {
  if (process.env.COMPETENT_TRAPLINE_SET === '0') return; // before/after harness gate
  try {
    const s = Game.state.scholar; if (!s) return;
    const pt = Game.playerTile ? Game.playerTile() : null;
    if (!pt || pt.type === 'haven' || pt.type === 'ruin') return;
    const tools = s.tools || [];
    const trap = tools.find(t => t && TRAPLINE_IDS.includes(t.recipeId));
    if (trap) {
      try { const r = Game.setTrap(trap.recipeId); if (r) ctx.trapsSet = (ctx.trapsSet || 0) + 1; } catch (e) {}
      return;
    }
    // no held trap, but wire in the pack? improvise.
    try {
      if (Game.hasItem && Game.hasItem('snare_wire')) {
        const r = Game.setTrap('snare');
        if (r) ctx.trapsWireSet = (ctx.trapsWireSet || 0) + 1;
      }
    } catch (e) {}
  } catch (e) {}
}

function workTrapline(Game, ctx) {
  try {
    const s = Game.state.scholar; if (!s) return;
    const day = s.day || 0;
    if ((ctx._trapDay || 0) === day) return;
    ctx._trapDay = day;
    // CRAFT: restock the line at day-end (in haven). Setting now happens
    // out on the wild tile via workTraplineSet (food r5 fix — see above).
    try {
      const level = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
      if (level >= 1) {
        const tools = s.tools || [];
        const held = tools.filter(t => t && TRAPLINE_IDS.includes(t.recipeId)).length;
        if (held < 2) {
          const inv = s.inventory || [];
          const have = (m) => inv.filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
          const vine = have('vine'), stick = have('stick');
          const matsOk = level >= 2 ? (vine >= 1 && stick >= 1) : (vine >= 3 && stick >= 3); // blind craft: gamble only what you can lose
          if (matsOk) {
            try { const r = Game.craft('snare'); if (r) ctx.trapsCrafted = (ctx.trapsCrafted || 0) + 1; } catch (e) {}
          }
        }
      }
    } catch (e) {}
  } catch (e) {}
}

// GEAR UP (longsim combat lever 2026-10-11): a competent player equips the
// best weapon and armor they own. The sim policy never equipped anything —
// every measured fight was bare-fisted and unarmored, which made the combat
// death share measure naked-fighter lethality instead of the game's curve.
// This only equips what the world already gave (loot, gifts, finds); it
// crafts nothing and invents nothing.
function gearUp(Game, ctx) {
  try {
    const s = Game.state.scholar;
    if (!s) return;
    const eq = s.equipped || {};
    let inv = s.inventory || [];
    const defOf = (it) => (Game.data.items || []).find(d => d.id === (it.itemId || it.id));
    // AMMO AWARENESS (journey-scale r3 2026-10-11): a ranged weapon with no
    // ammo is a stick you hold wrong — the scale harness watched a player
    // strike a Highbeam Deer 34 rounds for 0 damage ("No arrow left" every
    // round) and die. Never equip a dry ranged weapon while a usable one
    // exists; craft arrows when the best weapon is dry; unequip a dry
    // ranged weapon rather than posing with it.
    const ammoOk = (w) => {
      try { if (!w || !w.ammo) return true; return Game.ammoCount(w.ammo) > 0; }
      catch (e) { return true; }
    };
    // WEAPON SLOT ROUTING (fix 2026-10-12): route exactly like the inventory
    // UI (app.js data-equip-w) — isRangedWeapon (range > 1, which INCLUDES
    // spears), not the def's flavor type. The old `w.type === 'ranged'` check
    // sent every spear to 'melee', where equip() refuses it ("That goes on
    // your ranged") — so the policy silently fought bare-fisted with spears
    // in the pack, and ctx.geared counted the failed equip as success.
    const weaponSlot = (def, w) => {
      try {
        const g = typeof globalThis !== 'undefined' ? globalThis : {};
        const Seq = (g.Scattering && g.Scattering.equipment) || (g.S && g.S.equipment);
        if (Seq && typeof Seq.isRangedWeapon === 'function' && Seq.isRangedWeapon(def)) return 'ranged';
      } catch (e) {}
      return (w && w.type === 'ranged') ? 'ranged' : 'melee';
    };
    // Compare the whole owned kit, including what is already worn. Otherwise
    // a weak packed knife both blocks ammo crafting and displaces a better bow.
    const weapons = () => {
      const out = [];
      const add = (it, fromSlot) => {
        const def = it && defOf(it);
        if (!def || def.class !== 'weapon' || (it.units == null ? 1 : it.units) <= 0) return;
        const w = def.weapon || {};
        out.push({ it, fromSlot, w, bonus: w.bonus || 0, slot: weaponSlot(def, w), id: it.itemId || it.id });
      };
      for (const slot of ['melee', 'ranged', 'weapon']) add((s.equipped || {})[slot], slot);
      for (const it of s.inventory || []) add(it, null);
      return out.sort((a, b) => b.bonus - a.bonus);
    };
    let owned = weapons(), best = owned.find(c => ammoOk(c.w));
    const fundedRecipe = c => {
      const recipe = (Game.data.recipes || []).find(r => r.id === c.w.ammo);
      const level = ((((Game.state.codex || {}).recipes || {})[c.w.ammo] || {}).level || 0);
      return recipe && level >= 1 && Object.entries(recipe.materials || {}).every(([m, n]) =>
        (s.inventory || []).filter(it => m === 'bait' ? (it.kcalEach || 0) > 0 : it.material === m)
          .reduce((sum, it) => sum + (it.units || 0), 0) >= n) ? recipe : null;
    };
    const upgrade = owned.find(c => !ammoOk(c.w) && (!best || c.bonus > best.bonus) && fundedRecipe(c));
    if (upgrade && !Game.over && !(Game.inCombat && Game.inCombat())) {
      const bearer = Game.villagerId, recipe = fundedRecipe(upgrade);
      // Preserve the current trap-material banking policy.
      const defer = vinebank.defersCraft(Game, recipe.id);
      if (defer) {
        ctx.vinebankDeferred = (ctx.vinebankDeferred || 0) + 1;
        if (recipe.id === 'arrow') ctx.vinebankDeferArrow = (ctx.vinebankDeferArrow || 0) + 1;
      } else {
        const made = Game.craft(recipe.id);
        if (Game.over || bearer !== Game.villagerId) return;
        if (made) { ctx.ammoCrafts = (ctx.ammoCrafts || 0) + 1; if (recipe.id === 'arrow') ctx.arrowCraft = (ctx.arrowCraft || 0) + 1; }
        owned = weapons(); best = owned.find(c => ammoOk(c.w));
      }
    }
    if (best) {
      let activeSlot = best.fromSlot;
      if (!activeSlot) {
        const index = (s.inventory || []).findIndex(it => it === best.it);
        if (index >= 0) {
          Game.equip(index, best.slot);
          if (((s.equipped || {})[best.slot] || {}).itemId === best.id) {
            ctx.geared = (ctx.geared || 0) + 1; activeSlot = best.slot;
          }
        }
      }
      // The game's public weapon reader uses melee first. Take off the
      // weaker blocker through the same public Take off action as players.
      if (activeSlot === 'ranged' && (s.equipped || {}).melee) Game.unequip('melee');
      if (activeSlot === 'weapon') for (const slot of ['melee', 'ranged']) if ((s.equipped || {})[slot]) Game.unequip(slot);
    } else {
      if (owned.some(c => c.w.ammo)) ctx.dryWeaponDays = (ctx.dryWeaponDays || 0) + 1;
      for (const c of owned) if (c.fromSlot && c.w.ammo && !ammoOk(c.w)) {
        Game.unequip(c.fromSlot); ctx.unarmedDry = (ctx.unarmedDry || 0) + 1;
      }
    }
    inv = s.inventory || [];
    // ARMOR (longsim combat r6 2026-10-12): wear the BEST armor owned, and
    // craft bark armor when the recipe is known. Two blanks closed:
    // (1) the old code equipped the FIRST armor-def item in inventory order
    // only when every armor slot was empty — sims showed a P=2 garment worn
    // over a P=10 bark armor sitting in the pack, never upgrading;
    // (2) the policy never crafted the universally-craftable bark armor
    // (bark 3 + vine 2, no knowledge requirement on the recipe itself —
    // craft() enforces the L1+ knowledge gate, blind L1 attempts are honest
    // 35% fails with materials at risk), so 2/3 sampled seeds fought wave-3
    // — which the design anchors at P=64 — with P~2.
    // Env gate COMPETENT_CRAFT_ARMOR=0 restores the old first-found behavior
    // for before/after measurement.
    const armorCraftOn = process.env.COMPETENT_CRAFT_ARMOR !== '0';
    const protOf = (it) => {
      const def = defOf(it);
      return (def && def.armor) ? (def.armor.protection || 0) : 0;
    };
    const armorSlotFor = (it) => {
      try {
        const def = defOf(it);
        const g = typeof globalThis !== 'undefined' ? globalThis : {};
        const Seq = (g.Scattering && g.Scattering.equipment) || (g.S && g.S.equipment);
        if (Seq && typeof Seq.slotForItem === 'function') {
          const want = Seq.slotForItem(def);
          if (want) return want;
        }
      } catch (e) {}
      return 'armor';
    };
    if (!armorCraftOn) {
      // LEGACY PATH (pre-r6): first armor-def item in inventory order, only
      // when every armor slot is empty. Preserved verbatim for before/after
      // measurement via COMPETENT_CRAFT_ARMOR=0.
      const hasArmor = ['torso', 'armor', 'head', 'body'].some(sl => eq[sl]);
      if (!hasArmor) {
        for (let i = 0; i < inv.length; i++) {
          const def = defOf(inv[i]);
          if (def && def.armor) {
            try { Game.equip(i, 'armor'); ctx.geared = (ctx.geared || 0) + 1; } catch (e) {}
            break;
          }
        }
      }
    } else {
    let wornMax = 0;
    for (const sl of ['torso', 'armor', 'head', 'body']) {
      const cur = eq[sl];
      if (cur) wornMax = Math.max(wornMax, protOf(cur));
    }
    let abestI = -1, abestP = -1;
    for (let i = 0; i < inv.length; i++) {
      const p = protOf(inv[i]);
      if (p > 0 && p > abestP) { abestP = p; abestI = i; }
    }
    if (armorCraftOn && abestI < 0 && wornMax < 10) {
      // Nothing owned and nothing decent worn: craft bark armor when the
      // recipe is known (handling a villager's bark armor teaches L1) and
      // the materials are on hand. craft() enforces every gate itself.
      try {
        const rk = ((Game.state.codex || {}).recipes || {}).bark_armor || {};
        if ((rk.level || 0) >= 1) {
          const have = (m) => inv.filter(it => it && it.material === m)
            .reduce((t, it) => t + (it.units || 0), 0);
          // VINEBANK (materials-banking 2026-10-14): bark armor eats the whole
          // vine bank (vine 2) — it waits while the trapper is banking.
          const vbDefer = vinebank.defersCraft(Game, 'bark_armor');
          if (vbDefer) { ctx.vinebankDeferred = (ctx.vinebankDeferred || 0) + 1; ctx.vinebankDeferArmor = (ctx.vinebankDeferArmor || 0) + 1; }
          else if (have('bark') >= 3 && have('vine') >= 2 && Game.craft) {
            const made = Game.craft('bark_armor');
            if (made) {
              ctx.barkArmorCrafted = (ctx.barkArmorCrafted || 0) + 1;
              // re-scan: craft() replaced scholar.inventory with a new
              // filtered array — rebind the local before indexing into it.
              inv = Game.state.scholar.inventory || [];
              abestI = -1; abestP = -1;
              for (let i = 0; i < inv.length; i++) {
                const p = protOf(inv[i]);
                if (p > 0 && p > abestP) { abestP = p; abestI = i; }
              }
            }
          }
        }
      } catch (e) {}
    }
    if (abestI >= 0 && abestP > wornMax) {
      try {
        Game.equip(abestI, armorSlotFor(inv[abestI]));
        ctx.geared = (ctx.geared || 0) + 1;
      } catch (e) {}
    }
    } // end armorCraftOn branch
  } catch (e) {}
}

// BEAST TRICKS (longsim combat r5 2026-10-12): the competent policy PLAYS
// monster counters tactically — the Undertale half of the fight. Blank from
// sim-combat-r2: "counters discovered 91–103; policy still doesn't play
// them tactically."
//
// KNOWLEDGE-GATED (Steve: "If you don't know, it doesn't show"): a trick is
// attempted only for a monster type the village has actually learned — fully
// discovered (state.monsterCounters, via trick or beasttricks teaching), or
// hint-revealed in the Monster Codex (slaying a type surfaces counter.hint;
// the player read the carcass entry). Blind types get no tricks.
//
// One attempt per monster per fight; setup-dependent tricks (windup,
// sidestep, recovery) wait for their setup while the policy fights normally
// in between. After the trick fires or proves unavailable, normal fighting
// resumes. Each kind maps to the tb* action checkMonsterCounter observes
// (game.js) — shout / offer_food / wait / move / strike / round_end — so the
// action actually fires the observation.
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || null; } catch (e) { return null; } }
function beastCounterOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.counter) || null;
  } catch (e) { return null; }
}
function beastTrickKnown(Game, mid) {
  // Full discovery (trick performed or taught at haven): nothing to learn,
  // so no trick is wasted.
  try { return !!((Game.state.monsterCounters || {})[mid]); } catch (e) { return false; }
}
function beastHintKnown(Game, mid) {
  // The codex hint IS knowledge: a slain type shows counter.hint (app.js
  // renders it at codex stage 'slain'), and the player read it.
  try {
    if (beastTrickKnown(Game, mid)) return true;
    const e = ((Game.state.codex || {}).monsters || {})[mid];
    return !!(e && e.stage === 'slain');
  } catch (e) { return false; }
}
// Interior free tiles (1..7): grid edges are the flee-by-barrier (by design)
// — stepping on them can end the fight mid-trick.
function beastFreeTiles(Game, f, px, py) {
  const out = [];
  try {
    const occupied = new Set(
      ((f.fighters || []).filter(x => x && x.alive && x.key !== 'p')).map(x => x.mx + ',' + x.my));
    for (let tx = 1; tx <= 7; tx++) for (let ty = 1; ty <= 7; ty++) {
      if (tx === px && ty === py) continue;
      if (occupied.has(tx + ',' + ty)) continue;
      out.push([tx, ty]);
    }
  } catch (e) {}
  return out;
}
// Closest free tile avoiding a set of "x,y" cells (a telegraph lane).
function beastDodgeTile(Game, f, px, py, avoid) {
  const cands = beastFreeTiles(Game, f, px, py);
  cands.sort((a, b) =>
    (Math.max(Math.abs(a[0] - px), Math.abs(a[1] - py)) - Math.max(Math.abs(b[0] - px), Math.abs(b[1] - py))) ||
    (a[0] - b[0]) || (a[1] - b[1]));
  for (const c of cands) { if (!avoid || !avoid.has(c[0] + ',' + c[1])) return c; }
  return cands[0] || null;
}
// Strike a chosen target: close the distance first (interior tiles only),
// then strike. Returns 'moved', 'struck', or 'stuck'.
function beastStrikeTarget(Game, f, ctx, p, px, py, tgt, endTurn) {
  try {
    const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
    const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
    const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
    if (d0 > (w.range || 1)) {
      const occupied = new Set(
        ((f.fighters || []).filter(x => x && x.alive && x.key !== 'p')).map(x => x.mx + ',' + x.my));
      let bx = null, by = null, bd = 1e9;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const cx = tmx + dx, cy = tmy + dy;
        if (cx < 1 || cx > 7 || cy < 1 || cy > 7) continue;
        if (occupied.has(cx + ',' + cy)) continue;
        const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
        if (dd < bd) { bd = dd; bx = cx; by = cy; }
      }
      if (bx != null) {
        // STEP, DON'T TELEPORT (capable bot 2026-10-14): the main strike
        // path got this fix in r6, this one didn't — tbPlayerMove refuses a
        // destination past this turn's movement ("Too far"), so a far trick
        // target was a no-op every turn. Walk as far as moveLeft pays for
        // (terrain priced like tbPlayerMove prices it).
        try {
          let dx = bx, dy = by;
          if (typeof Game.findPath === 'function') {
            const path = Game.findPath(px, py, bx, by);
            if (path && path.length) {
              let cost = 0, idx = -1;
              for (let i = 0; i < path.length; i++) {
                let c = 1;
                try { c = Game.tbTerrainCost ? Game.tbTerrainCost(path[i][0], path[i][1]) : 1; } catch (e) { c = 1; }
                if (cost + c > (p.moveLeft || 0)) break;
                cost += c; idx = i;
              }
              if (idx >= 0) { dx = path[idx][0]; dy = path[idx][1]; }
            }
          }
          Game.tbPlayerMove(dx, dy);
        } catch (e) {}
        ctx.closed = (ctx.closed || 0) + 1;
      }
      endTurn();
      return 'moved';
    }
  } catch (e) {}
  try { Game.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
  if (ctx._dpsRace) ctx._dpsRace.strikes++; // DPS-race assessment (scale-wall r1): count real strikes
  endTurn();
  return 'struck';
}
// Attempt one beast trick this turn. Returns true when the turn is consumed.
function beastTrickPlay(Game, f, ctx, p, endTurn) {
  try {
    if (ctx._btFight !== f) { ctx._btFight = f; ctx._btTried = {}; ctx._btSeq = {}; }
    const tried = ctx._btTried, seq = ctx._btSeq;
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const live = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
    const markTypeTried = (mid) => { for (const x of live) { if (beastMidOf(x) === mid) tried[x.key] = 1; } };
    for (const m of live) {
      const mid = beastMidOf(m);
      if (!mid || tried[m.key]) continue;
      const ctr = beastCounterOf(Game, mid);
      if (!ctr || !ctr.kind) { tried[m.key] = 1; continue; }
      // Knowledge gate: the trick is attempted for KNOWN counters — fully
      // discovered (state.monsterCounters) OR hint-revealed (codex 'slain':
      // the player read the carcass entry). Fully-known tricks still pay
      // mechanically (the shout scatters, the sidestep dodges) — a competent
      // player USES a known trick, not just discovers it. Blind types get
      // no tricks.
      if (!beastHintKnown(Game, mid)) continue;
      const kind = ctr.kind;
      const trickDone = () => { ctx.beastTricks = (ctx.beastTricks || 0) + 1; };
      // --- instant tricks: no setup, one action ---
      if (kind === 'shout') {
        // hummice / belltoad: the bellow IS the trick (scatters the choir).
        tried[m.key] = 1;
        try { Game.tbPlayerShout(); } catch (e) {}
        trickDone();
        return true;
      }
      if (kind === 'offer_food') {
        // lockpick_raccoon: buy it off. One bribe per raccoon.
        const inv = (((Game.state || {}).scholar || {}).inventory) || [];
        const hasFood = inv.some(i => i && (i.units || 0) > 0 && (i.kcalEach || 0) > 0);
        tried[m.key] = 1;
        if (hasFood) { try { Game.tbPlayerOfferFood(); } catch (e) {} trickDone(); }
        return true;
      }
      if (kind === 'wait') {
        // heckler / moderator: silence is the verb it can't moderate.
        // tbPlayerWait auto-advances — never endTurn after it.
        tried[m.key] = 1;
        try { Game.tbPlayerWait(); } catch (e) {}
        trickDone();
        return true;
      }
      // --- move tricks ---
      if (kind === 'move_windup') {
        // MOVE while it winds up, don't stare. The windup is the setup.
        if (!m.telegraph) continue;
        const cells = (m.telegraph && Array.isArray(m.telegraph.cells)) ? m.telegraph.cells : [];
        const avoid = new Set(cells.map(c => c.cx + ',' + c.cy));
        const spot = beastDodgeTile(Game, f, px, py, avoid);
        if (!spot) { tried[m.key] = 1; continue; }
        tried[m.key] = 1;
        try { Game.tbPlayerMove(spot[0], spot[1]); } catch (e) {}
        trickDone();
        endTurn();
        return true;
      }
      if (kind === 'move_x2') {
        // Dodge on two consecutive rounds — the sequence IS the trick.
        // ctr.vary (review_drone): never the same net direction twice.
        // ctr.tiles (warranty_caller): cover N tiles this turn.
        const need = (ctr.tiles | 0) || 1;
        const st = seq[m.key] || (seq[m.key] = { n: 0, dir: null, round: -1 });
        if (st.n > 0 && f.round !== st.round + 1) { st.n = 0; st.dir = null; } // sequence broken
        const cands = beastFreeTiles(Game, f, px, py);
        // deterministic: farthest from the beast first, then low coords
        cands.sort((a, b) =>
          (Math.max(Math.abs(b[0] - m.mx), Math.abs(b[1] - m.my)) -
           Math.max(Math.abs(a[0] - m.mx), Math.abs(a[1] - m.my))) ||
          (a[0] - b[0]) || (a[1] - b[1]));
        let pick = null;
        for (const c of cands) {
          let path = null;
          try { path = Game.findPath(px, py, c[0], c[1]) || []; } catch (e) { continue; }
          if (path.length < need) continue;
          let cost = 0;
          try { cost = path.reduce((s, t) => s + Game.tbTerrainCost(t[0], t[1]), 0); } catch (e) { continue; }
          if (cost <= 0 || cost > (p.moveLeft || 0)) continue;
          const dir = Math.sign(c[0] - px) + ',' + Math.sign(c[1] - py);
          if (ctr.vary && st.dir && dir === st.dir) continue;
          pick = [c[0], c[1], dir]; break;
        }
        if (!pick) { tried[m.key] = 1; delete seq[m.key]; continue; }
        try { Game.tbPlayerMove(pick[0], pick[1]); } catch (e) {}
        st.n += 1; st.dir = pick[2]; st.round = f.round;
        trickDone();
        if (st.n >= 2) { tried[m.key] = 1; delete seq[m.key]; }
        endTurn();
        return true;
      }
      if (kind === 'sidestep') {
        // Step OFF the lane: must be IN it to leave it. The telegraph is
        // the setup; without one, fight normally and check again later.
        const tg = m.telegraph;
        const cells = tg && Array.isArray(tg.cells) ? tg.cells : null;
        if (!cells || !cells.length) continue;
        if (!cells.some(c => c.cx === px && c.cy === py)) continue;
        const lane = new Set(cells.map(c => c.cx + ',' + c.cy));
        const spot = beastDodgeTile(Game, f, px, py, lane);
        if (!spot || lane.has(spot[0] + ',' + spot[1])) { tried[m.key] = 1; continue; }
        tried[m.key] = 1;
        try { Game.tbPlayerMove(spot[0], spot[1]); } catch (e) {}
        trickDone();
        endTurn();
        return true;
      }
      if (kind === 'keep_distance') {
        // End the turn AT the trick's distance — no farther. The DISENGAGE
        // rule (game.js tbEndCheck) ends fights vs non-chasers beyond their
        // reach, and it runs BEFORE the round_end counter observation: backing
        // off to the far corner "works" but the trick never registers. The
        // honest play is exactly `need` tiles out.
        // (Engine tension, documented in evidence: bright_idea needs 3 but
        // disengages past 2 — the trick is still the right survival play, it
        // just can't discover via round_end while disengage fires first.)
        const need = (ctr.tiles | 0) || 3;
        const d = Math.max(Math.abs(m.mx - px), Math.abs(m.my - py));
        tried[m.key] = 1;
        if (d !== need) {
          const cands = beastFreeTiles(Game, f, px, py);
          // prefer exactly `need` tiles out; fall back to closest to it
          cands.sort((a, b) => {
            const da = Math.abs(Math.max(Math.abs(a[0] - m.mx), Math.abs(a[1] - m.my)) - need);
            const db = Math.abs(Math.max(Math.abs(b[0] - m.mx), Math.abs(b[1] - m.my)) - need);
            return (da - db) || (a[0] - b[0]) || (a[1] - b[1]);
          });
          for (const c of cands) {
            let path = null;
            try { path = Game.findPath(px, py, c[0], c[1]) || []; } catch (e) { continue; }
            if (!path.length) continue;
            let cost = 0;
            try { cost = path.reduce((s, t) => s + Game.tbTerrainCost(t[0], t[1]), 0); } catch (e) { continue; }
            if (cost <= 0 || cost > (p.moveLeft || 0)) continue;
            try { Game.tbPlayerMove(c[0], c[1]); } catch (e) {}
            break;
          }
        }
        trickDone();
        endTurn();
        return true;
      }
      // --- strike tricks: the strike itself is the observation ---
      if (kind === 'strike_lead' || kind === 'strike_windup' || kind === 'strike_recovery' ||
          kind === 'strike_first' || kind === 'strike_nonhead' || kind === 'fresh_weapon') {
        let tgt = m;
        if (kind === 'strike_lead') {
          // the lead is the first-spawned of its type (counterIsLead logic)
          const same = live.filter(x => beastMidOf(x) === mid);
          tgt = same[0];
          let li = (f.fighters || []).indexOf(tgt);
          for (const x of same) {
            const xi = (f.fighters || []).indexOf(x);
            if (xi < li) { tgt = x; li = xi; }
          }
        } else if (kind === 'strike_windup') {
          if (!m.telegraph) continue; // hit it WHILE it folds
        } else if (kind === 'strike_recovery') {
          // the window: discharged and no new windup yet
          if (!m._counterDischarged || m.telegraph) continue;
        } else if (kind === 'strike_first') {
          if (((f._counterStrikes | 0) !== 0)) { tried[m.key] = 1; continue; }
          if (m.urWalkout) { tried[m.key] = 1; continue; } // behind the picket line: untargetable
        } else if (kind === 'strike_nonhead') {
          const same = live.filter(x => beastMidOf(x) === mid);
          tgt = same.find(x => ((x.segmentIndex | 0) > 0)) || m;
        } else if (kind === 'fresh_weapon') {
          // the understudy must have SEEN a weapon already: the trick is
          // the mid-fight SWITCH, not the opener. usSeen is keyed by the
          // strike-time weapon name (def.name — equip() writes that).
          const seen = (m.usSeen && Object.keys(m.usSeen)) || [];
          if (!seen.length) { tried[m.key] = 1; continue; }
          let cur = 'your hands';
          try { cur = (Game.equippedWeapon() || {}).name || cur; } catch (e) {}
          if (seen.indexOf(cur) >= 0) {
            const inv = (((Game.state || {}).scholar || {}).inventory) || [];
            const defs = ((Game.data || {}).items || []);
            let sw = -1, swSlot = null, wantName = null;
            for (let i = 0; i < inv.length; i++) {
              const it = inv[i]; if (!it) continue;
              const def = defs.find(d => d && d.id === (it.itemId || it.id));
              if (!def || def.class !== 'weapon') continue;
              const nm = def.name || 'weapon';
              if (seen.indexOf(nm) >= 0) continue;
              const wr = def.weapon || {};
              // weapon_split (equipment.js): range > 1 -> ranged slot.
              // equippedWeapon() reads melee first, so a ranged switch needs
              // the melee slot cleared or the strike still uses the old one.
              swSlot = (((wr.range || 1) > 1 || wr.type === 'ranged') ? 'ranged' : 'melee');
              sw = i; wantName = nm; break;
            }
            if (sw < 0) { tried[m.key] = 1; continue; } // no fresh weapon: unavailable
            try { if (swSlot === 'ranged') Game.unequip('melee'); } catch (e) {}
            try { Game.equip(sw, swSlot); } catch (e) {}
            let after = cur;
            try { after = (Game.equippedWeapon() || {}).name || after; } catch (e) {}
            if (after !== wantName) { tried[m.key] = 1; continue; } // switch failed: unavailable
          }
          // else: the current weapon is already fresh to it — strike as-is
        }
        const r = beastStrikeTarget(Game, f, ctx, p, px, py, tgt, endTurn);
        if (r === 'struck') { markTypeTried(mid); trickDone(); }
        return true;
      }
      // Unknown kind: never loop on it.
      tried[m.key] = 1;
    }
  } catch (e) {}
  return false;
}

// ---------- DPS-RACE FIGHT ASSESSMENT (longsim scale-wall r1 2026-10-13) ----------
// A competent player gauges the DAMAGE RACE after a couple of exchanges —
// not the HP pool, the race. The old logic fled only at HP thresholds (35%
// mid-fight, 50% at fight start): the raccoon replay (sim-combat-r1) showed
// 11 rounds at ~1 dealt/round vs 13–16 taken, flee firing at <30% HP = death
// mid-retreat. The fight was unwinnable from round 1 but the policy never
// evaluated the race.
//
// MEASURED, not card-read: every 2 player-turns (windows at turns 3,5,7,9)
// the policy compares strike-normalized dealt damage against the player-HP
// drop over the window and projects rounds-to-kill vs rounds-to-die. Two
// consecutive lost-race windows = conviction = disengage WHILE HP IS HIGH,
// walking to the edge (flee-by-barrier) while the walk is still survivable.
// Strike-normalized so beast-trick turns don't dilute the offense read;
// healing reads as less-taken (a deliberate stay-bias: a player with
// answers stays). Skipped when the player isn't striking (flyers circling
// overhead), when incoming damage is gentle, or when the fight is nearly
// over — the assessment decides fights early, never mid-grind.
// Env gate COMPETENT_DPS_RACE=1 opts IN (default OFF — killed at pilot
// 2026-10-13, see evidence/2026-10-13/sim-scale-wall-r1.md). Kept as a
// documented experiment: the assessment instrument is sound and the
// barrier push is the engine-honest exit, but the combination is harmful
// (median 69→28d) — fleeing must be DIRECTIONAL (toward haven/safety),
// not just "nearest edge". Future work can re-arm this gate.
function dpsRaceOn() { return process.env.COMPETENT_DPS_RACE === '1'; }
function dpsRaceInit(ctx) {
  ctx._dpsRace = { turn: 0, snapTurn: 0, strikes: 0, snapStrikes: 0, snapDealt: 0, snapPhp: 0, lostStreak: 0 };
}
// Cumulative damage dealt to fighters still in the fight (fled excluded).
function dpsRaceDealt(Game, f) {
  let dealt = 0;
  try {
    for (const x of (f.fighters || [])) {
      if (!x || x.kind !== 'monster' || x.fled) continue;
      dealt += Math.max(0, (x.maxHp || x.hp || 0) - (x.hp || 0));
    }
  } catch (e) {}
  return dealt;
}
function dpsRaceRemaining(Game, f) {
  let hp = 0;
  try {
    for (const x of (f.fighters || [])) {
      if (!x || x.kind !== 'monster' || x.fled || (x.hp || 0) <= 0) continue;
      hp += x.hp;
    }
  } catch (e) {}
  return hp;
}
// Returns flee()'s value when the race is lost with conviction, null
// otherwise. `flee` is the policy's own flee closure (edge walk + end turn).
function dpsRaceAssess(Game, f, ctx, p, flee) {
  if (!dpsRaceOn()) return null;
  const st = ctx._dpsRace;
  if (!st) return null;
  st.turn += 1;
  if (st.turn === 1) { // baseline snapshot at fight start
    st.snapDealt = dpsRaceDealt(Game, f);
    st.snapPhp = p.hp || 0;
    st.snapStrikes = st.strikes;
    st.snapTurn = 1;
    return null;
  }
  if (st.turn !== 3 && st.turn !== 5 && st.turn !== 7 && st.turn !== 9) return null;
  const dealtNow = dpsRaceDealt(Game, f);
  const phpNow = p.hp || 0;
  const dealtDelta = Math.max(0, dealtNow - st.snapDealt);
  const strikesDelta = st.strikes - st.snapStrikes;
  const takenDelta = Math.max(0, st.snapPhp - phpNow);
  const turnsDelta = Math.max(1, st.turn - st.snapTurn);
  st.snapDealt = dealtNow; st.snapPhp = phpNow;
  st.snapStrikes = st.strikes; st.snapTurn = st.turn;
  ctx.dpsWindows = (ctx.dpsWindows || 0) + 1;
  if (strikesDelta < 1) return null; // not engaging (flyers overhead) — unmeasured
  const takenPerTurn = takenDelta / turnsDelta;
  if (takenPerTurn < 3) { st.lostStreak = 0; return null; } // gentle incoming — no conviction either way
  const dealtPerStrike = dealtDelta / strikesDelta;
  const remaining = dpsRaceRemaining(Game, f);
  const roundsToKill = remaining / Math.max(0.5, dealtPerStrike);
  const roundsToDie = phpNow / Math.max(0.5, takenPerTurn);
  if (roundsToKill <= 4) return null; // nearly over — finish it
  if (roundsToDie < roundsToKill * 1.3) {
    st.lostStreak += 1;
    if (st.lostStreak >= 2) {
      ctx.dpsFled = (ctx.dpsFled || 0) + 1;
      ctx.dpsFledDetail = {
        turn: st.turn,
        dealtPerStrike: +dealtPerStrike.toFixed(1),
        takenPerTurn: +takenPerTurn.toFixed(1),
        roundsToKill: +roundsToKill.toFixed(1),
        roundsToDie: +roundsToDie.toFixed(1),
        php: Math.round(phpNow),
      };
      if (!ctx.dpsFledFirstDetail) ctx.dpsFledFirstDetail = Object.assign({}, ctx.dpsFledDetail);
      return flee();
    }
    return null;
  }
  st.lostStreak = 0;
  return null;
}

//
// DIRECTIONAL FLEE (longsim scale-wall r2 2026-10-13): fleeing must be
// DIRECTIONAL — toward haven/safety, judging the destination — not "nearest
// edge". r1's barrier push extracted scholars from fights (player combat
// deaths 34→14) but pushed through the NEAREST edge, stranding hurt, hungry
// scholars on unknown nodes (monster deaths 16→25, starvation 9→13; the
// seed-44 trace: a day-25 scholar pushed (4,4)→(3,4)→(2,4) AWAY from haven
// and starved the same day). Standing ground near haven beats pushing
// outward.
//
// Env gate COMPETENT_DIRECTIONAL_FLEE=1 opts IN (default OFF). Orthogonal
// to COMPETENT_DPS_RACE: with only this gate on, the disengage triggers are
// the new-fight outmatched assessment and the legacy 35%-HP threshold —
// both funnel through flee(), which now picks the havenward exit. The DPS
// instrument stays inert unless its own gate is also set.
//
function dirFleeOn() { return process.env.COMPETENT_DIRECTIONAL_FLEE === '1'; }
// CONSUMED-PUSH VERIFICATION (journey deepening r16 -> shared port r36):
// tbBarrierExit returns TRUE for pushes CONSUMED without exiting (sealed
// barrier holds, world edge, stasis). Gate off = legacy block, byte-identical.
// Gate on = only count a push as a flee when it actually exits the fight;
// on a consumed push, mark the fight unfleeable so the policy fights it
// out instead of hammering the barrier and spamming barrier say-lines.
function exitVerifiedFleeOn() { return process.env.COMPETENT_EXIT_VERIFIED_FLEE === '1'; }

// Haven sits at the 9x9 center (game.js: hx=4, hy=4).
const DIR_FLEE_HAVEN = { x: 4, y: 4 };

// Score one exit direction from node (mpx,mpy). Returns null when the push
// would leave the known world (the engine refuses those — "The known world
// ends here" — and burns the turn). Higher is better:
//   +10 push lands ON haven (engine: HAVEN IS SAFE — even the relentless
//       give up at the gate; the chase ends, the fight ends)
//   +4  havenward (destination strictly closer to haven)
//   +1  lateral (same distance from haven)
//   -2  away from haven (the r1 failure mode)
//   +2  destination known (visited or shared — fog-of-war honest)
//   -6  destination monster-active (don't trade one fight for another;
//       a world monster is sitting on that node right now)
function fleeDirScore(Game, mpx, mpy, dx, dy) {
  const nx = mpx + dx, ny = mpy + dy;
  if (nx < 0 || nx > 8 || ny < 0 || ny > 8) return null;
  const dNow = Math.abs(mpx - DIR_FLEE_HAVEN.x) + Math.abs(mpy - DIR_FLEE_HAVEN.y);
  const dNew = Math.abs(nx - DIR_FLEE_HAVEN.x) + Math.abs(ny - DIR_FLEE_HAVEN.y);
  let haven = false;
  try {
    const t = Game.tileAt(nx, ny);
    haven = !!(t && (t.type === 'haven' || t.isHaven));
  } catch (e) {}
  let known = false, danger = false;
  try { known = !!Game.mapSeen(nx, ny); } catch (e) {}
  try { danger = !!Game.monsterAt(nx, ny); } catch (e) {}
  let score = 0;
  if (haven) score += 10;
  else if (dNew < dNow) score += 4;
  else if (dNew === dNow) score += 1;
  else score -= 2;
  if (known) score += 2;
  if (danger) score -= 6;
  return { dx, dy, nx, ny, score, haven, known, danger, havenward: dNew < dNow };
}

// Pick the best exit direction, or null when the scholar should HOLD:
// at the haven node there is no havenward push — every exit leads away
// from safety, so standing ground (with the pantry and the village)
// beats pushing outward (the r1 lesson, stated as code).
//
// Destination judgment: when a safe (non-monster-active) havenward exit
// exists — haven is within reach — monster-active exits are off the table
// entirely. Never trade one fight for another on the way home. When no
// safe way home exists, take the least-bad scored exit.
function chooseFleeDir(Game, mpx, mpy) {
  if (mpx === DIR_FLEE_HAVEN.x && mpy === DIR_FLEE_HAVEN.y) return null; // at haven: hold
  const cands = [];
  for (const dd of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const s = fleeDirScore(Game, mpx, mpy, dd[0], dd[1]);
    if (s) cands.push(s);
  }
  if (!cands.length) return null;
  const safeHome = cands.filter(c => (c.haven || c.havenward) && !c.danger);
  const pool = safeHome.length ? cands.filter(c => !c.danger) : cands;
  pool.sort((a, b) => (b.score - a.score) ||
    ((a.danger ? 1 : 0) - (b.danger ? 1 : 0)) ||
    ((b.havenward ? 1 : 0) - (a.havenward ? 1 : 0)) ||
    (a.dx - b.dx) || (a.dy - b.dy));
  return pool[0];
}

// RECOVER-AND-RETURN (scale-wall r2): after a directional push the scholar
// is hurt and displaced. For a bounded window they head back to haven to
// eat/rest instead of resuming outward exploration — r1's pushed scholars
// wandered on the new node and starved. Window: 2 days, or until fed and
// healed at haven (whichever comes first).
function markRecover(Game, ctx) {
  try {
    const day = (Game.state.scholar && Game.state.scholar.day) || 0;
    ctx._recoverUntilDay = day + 2;
    ctx.recoverMarks = (ctx.recoverMarks || 0) + 1;
  } catch (e) {}
}
function recovering(Game, ctx) {
  if (!dirFleeOn()) return false;
  const until = ctx._recoverUntilDay || 0;
  if (!until) return false;
  const day = (Game.state.scholar && Game.state.scholar.day) || 0;
  if (day > until) { ctx._recoverUntilDay = 0; return false; }
  // early out: fed and healed at haven — back to work
  try {
    const s = Game.state.scholar;
    const atHaven = Game.map.px === DIR_FLEE_HAVEN.x && Game.map.py === DIR_FLEE_HAVEN.y;
    if (atHaven && s.kcal > Game.kcalCap() * 0.6 && (s.hp || 0) > (s.maxHp || 100) * 0.6) {
      ctx._recoverUntilDay = 0; return false;
    }
  } catch (e) {}
  return true;
}
// One haven-bound recovery day: walk home honestly, eat, drink. The caller
// skips outward trips while recovering() is true.
function recoverStep(Game, ctx) {
  try {
    ctx.recoverDays = (ctx.recoverDays || 0) + 1;
    if (Game.map.px !== DIR_FLEE_HAVEN.x || Game.map.py !== DIR_FLEE_HAVEN.y) {
      walkTo(Game, DIR_FLEE_HAVEN.x, DIR_FLEE_HAVEN.y);
    }
    competentEat(Game);
    drinkSafe(Game, ctx);
  } catch (e) {}
}

// ---------- FIGHT-ASSESS: PRE-FIGHT DAMAGE-RACE ASSESSMENT (longsim scale-wall r3 2026-10-13) ----------
// Policy-side fight SELECTION: assess the damage race BEFORE engaging — at
// fight start (turn 1, full HP: proactive disengage) and at the map level
// (forage trips decline monster-active tiles they can't beat) — instead of
// the legacy mid-fight flee-on-HP-threshold. r1's DPS-race assessment was
// inert in practice (0 fires in 50 windows: fights run 3–4 player turns,
// conviction needs 5+); r2's directional flee fired 2× in 8 runs. Both were
// mid-fight instruments. This one decides BEFORE the first strike.
//
// Knowledge gating (the policy only ever uses what its scholar learned):
//   codex entry (stage observed/slain, or patterns) -> the species' real
//       attack damage from the monster def
//   own-fight lore (ctx._fightLore)                -> observed per-monster
//       damage per player-turn, learned the hard way
//   unknown species                                -> pessimistic prior 20/round
// A known counter (beastHintKnown) discounts monster DPR ×0.7 — the policy
// knows it has an answer. Player DPR = 13 + weapon bonus (tbPlayerStrike:
// roll([10,16]) + w.bonus; the policy knows its own weapon).
// Decline when roundsToDie < roundsToKill × 1.3 (lost race with margin), or
// monsterDPR ≥ p.hp/2 (dead in ≤2 rounds). The disengage is the policy's
// normal flee() — walk to the edge while survivable; the r1/r2 barrier-push
// gates stay off, so no push, no abandon-the-node.
//
// Env gate COMPETENT_FIGHT_ASSESS=1 opts IN (default OFF). Orthogonal to
// COMPETENT_DPS_RACE and COMPETENT_DIRECTIONAL_FLEE — both unset in the
// before/after arms. Gate off = legacy HP-ratio block, byte-identical.
function fightAssessOn() { return process.env.COMPETENT_FIGHT_ASSESS === '1'; }
const FIGHT_ASSESS_UNKNOWN_DPR = 20; // pessimistic prior for unidentified species
const FIGHT_ASSESS_COUNTER_DISC = 0.7; // known counter: the policy has an answer
const FIGHT_ASSESS_RACE_MARGIN = 1.3;

function fightAssessMidOf(m) {
  try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; }
}
function fightAssessCodexKnown(Game, mid) {
  try {
    const e = (((Game.state || {}).codex || {}).monsters || {})[mid];
    return !!(e && (e.stage || (e.patterns && Object.keys(e.patterns).length)));
  } catch (e) { return false; }
}
function fightAssessMonsterDef(Game, mid) {
  try { return (((Game.data || {}).monsters || []).find(d => d && d.id === mid)) || null; } catch (e) { return null; }
}
// Per-monster expected damage/round from policy-legitimate knowledge.
function fightAssessDPR(Game, ctx, mid) {
  // 1. Codex knowledge: the scholar has examined/survived/slain this species.
  if (mid && fightAssessCodexKnown(Game, mid)) {
    const def = fightAssessMonsterDef(Game, mid);
    const dmg = def && def.attack && def.attack.damage;
    if (dmg && dmg.length >= 2) return (dmg[0] + dmg[1]) / 2;
  }
  // 2. Own-fight lore: observed per-monster damage per player-turn.
  try {
    const lore = (ctx._fightLore || {})[mid];
    if (lore && lore.samples > 0) return lore.taken / lore.samples;
  } catch (e) {}
  // 3. Unknown: pessimistic prior — assume it hits hard until proven otherwise.
  return FIGHT_ASSESS_UNKNOWN_DPR;
}
// Worst single-round damage from policy-legitimate knowledge: a codex-known
// species' def max damage; otherwise the average (a lower bound — lore and
// the prior are averages, and inflating them would invent a max).
function fightAssessBurst(Game, ctx, mid, dpr) {
  if (mid && fightAssessCodexKnown(Game, mid)) {
    const def = fightAssessMonsterDef(Game, mid);
    const dmg = def && def.attack && def.attack.damage;
    if (dmg && dmg.length >= 2) return dmg[1];
  }
  return dpr;
}
// The damage race for a monster list. Returns {decline, detail}.
function fightAssessRace(Game, ctx, mons, p) {
  let bonus = 0;
  try { const w = Game.equippedWeapon && Game.equippedWeapon(); if (w && w.bonus) bonus += w.bonus; } catch (e) {}
  const playerDPR = 13 + bonus; // roll([10,16]) avg + weapon bonus
  let totalMhp = 0, monsterDPR = 0, burstDPR = 0;
  const per = [];
  for (const m of mons) {
    const mid = fightAssessMidOf(m);
    const hp = Math.max(1, m.hp || m.maxHp || 100);
    totalMhp += hp;
    let dpr = fightAssessDPR(Game, ctx, mid);
    let disc = 1;
    if (mid && typeof beastHintKnown === 'function' && beastHintKnown(Game, mid)) disc = FIGHT_ASSESS_COUNTER_DISC;
    monsterDPR += dpr * disc;
    // BURST TERM (gap-phase2 W1, line 353 — raidassess modal death: 4 hits /
    // 103 dmg, counter known 94%). A single-round max-vs-HP term would be
    // redundant on current defs (def max/average <= ~1.33, so it never fires
    // without deadInTwo firing first), so the term prices the whole kill
    // window at max rolls, UNDISCOUNTED: the modal death is a scholar who
    // knew the counter, traded blows, and ate max-roll hits for the rounds
    // the kill took. Knowing a counter does not shrink the beam — it tells
    // you to move, and a trading race must not assume you did.
    const burst = fightAssessBurst(Game, ctx, mid, dpr);
    burstDPR += burst;
    per.push({ mid, hp: Math.round(hp), dpr: +dpr.toFixed(1), disc, burst });
  }
  const php = (p && (p.hp || p.health)) || 1;
  const roundsToKill = totalMhp / Math.max(1, playerDPR);
  const roundsToDie = php / Math.max(0.5, monsterDPR);
  const lostRace = roundsToDie < roundsToKill * FIGHT_ASSESS_RACE_MARGIN;
  const deadInTwo = monsterDPR >= php / 2;
  const burstWindow = roundsToKill * Math.max(0.5, burstDPR);
  const burstKill = burstWindow >= php;
  return {
    decline: (lostRace || deadInTwo || burstKill) && mons.length > 0,
    detail: {
      n: mons.length, playerDPR, monsterDPR: +monsterDPR.toFixed(1),
      totalMhp: Math.round(totalMhp), php: Math.round(php),
      roundsToKill: +roundsToKill.toFixed(1), roundsToDie: +roundsToDie.toFixed(1),
      lostRace, deadInTwo, per,
      burstDPR: +burstDPR.toFixed(1), burstWindow: +burstWindow.toFixed(1), burstKill,
    },
  };
}
// Lore: attribute this fight() tick's scholar-HP drop across the monsters
// present at the previous tick (per-head; crude but it converges on the
// scholar's own experience). Bookkeeping only — the before arm never calls it.
function fightAssessLore(Game, ctx, f, p, mons) {
  try {
    const prev = ctx._faLorePrev;
    ctx._faLorePrev = { f, php: (p && (p.hp || p.health)) || 0, mids: mons.map(m => fightAssessMidOf(m)).filter(Boolean) };
    if (!prev || prev.f !== f || !prev.mids.length) return;
    const delta = (prev.php || 0) - (((p && (p.hp || p.health))) || 0);
    if (!(delta > 0)) return;
    ctx._fightLore = ctx._fightLore || {};
    const per = delta / prev.mids.length;
    for (const mid of prev.mids) {
      const l = ctx._fightLore[mid] = ctx._fightLore[mid] || { taken: 0, samples: 0 };
      l.taken += per; l.samples += 1;
    }
  } catch (e) {}
}
// Fight-start hook (replaces the legacy HP-ratio block under the gate):
// assess the race at turn 1, full HP, and proactively disengage a lost race
// through the policy's normal flee() — walk to the edge while survivable.
// Returns true when it disengaged.
function fightAssessHook(Game, f, ctx, p, flee) {
  const mons = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
  const race = fightAssessRace(Game, ctx, mons, p);
  ctx.faChecks = (ctx.faChecks || 0) + 1;
  if (!race.decline) return false;
  ctx.faDeclined = (ctx.faDeclined || 0) + 1;
  ctx.faDeclineDetail = race.detail;
  if (!ctx.faFirstDetail) { try { ctx.faFirstDetail = JSON.parse(JSON.stringify(race.detail)); } catch (e) {} }
  return flee();
}
// Map-level decline (forage trips): the scholar can SEE the monster on the
// tile (perception via Game.monsterAt) — walk around an unwinnable fight
// instead of into it. Returns true when the destination should be skipped.
function fightAssessSkipTile(Game, ctx, x, y) {
  try {
    const wm = Game.monsterAt && Game.monsterAt(x, y);
    if (!wm) return false;
    const s = (Game.state || {}).scholar || {};
    let maxHp = 100;
    try { maxHp = Game.maxHealth ? Game.maxHealth() : 100; } catch (e) {}
    const p = { hp: s.hp || s.health || 100, maxHp };
    const race = fightAssessRace(Game, ctx, [wm], p);
    if (race.decline) {
      ctx.faSkipped = (ctx.faSkipped || 0) + 1;
      return true;
    }
  } catch (e) {}
  return false;
}

// ---------------------------------------------------------------------------
// W2-DISENGAGE (longsim scale-wall r16 arm B): unarmored wave-2-top-end
// disengage. The r14 static audit flagged review_drone / bright_idea /
// mirror_stag / moderator as ~3-hit kills on an unarmored scholar; armor
// P>=20 (craftable hide) takes them to ~6 hits — the "slow" in Steve's
// "slow and risky". This lever declines THOSE FOUR matchups when the
// scholar is unarmored (P<20) and the damage race is lost, at the MAP
// level (walk around the tile — engine-honest, no fight ever starts).
// Forced fights (a wanderer walked into the scholar) keep the legacy
// behavior — the policy's legacy outmatched block already flees those.
//
// Knowledge: codex observed+ stage -> own-fight lore DPR -> pessimistic
// prior — the same codex→lore→prior convention as fightAssessDPR.
// Decline fires on race.decline (roundsToDie < roundsToKill*1.3 or
// dead-in-two), same margin as r3. Never touches monster stats (Steve's
// law: the Highbeam Deer benchmark is untouched; so is everything else).
//
// Env gate COMPETENT_W2DISENGAGE=1 opts IN (default OFF). Orthogonal to
// COMPETENT_FIGHT_ASSESS (r3, killed at pilot — do not combine).
function w2disengageOn() { return process.env.COMPETENT_W2DISENGAGE === '1'; }
const W2_DISENGAGE_TOP4 = ['review_drone', 'bright_idea', 'mirror_stag', 'moderator'];
const W2_DISENGAGE_ARMOR_GATE = 20; // P>=20 = the r14 "slow" answer; below it, decline

function w2disengageArmorP(Game) {
  try { return (typeof Game.armorBonus === 'function' ? Game.armorBonus() : 0) || 0; } catch (e) { return 0; }
}

// Map-level decline: the scholar can SEE the monster on the tile
// (Game.monsterAt) — walk around an unarmored top-4 matchup instead of
// into it. Returns true when the destination should be skipped.
function w2disengageSkipTile(Game, ctx, x, y) {
  try {
    const wm = Game.monsterAt && Game.monsterAt(x, y);
    if (!wm) return false;
    const mid = fightAssessMidOf(wm);
    if (!W2_DISENGAGE_TOP4.includes(mid)) return false;
    if (w2disengageArmorP(Game) >= W2_DISENGAGE_ARMOR_GATE) return false; // armored: fight
    const s = (Game.state || {}).scholar || {};
    let maxHp = 100;
    try { maxHp = Game.maxHealth ? Game.maxHealth() : 100; } catch (e) {}
    const p = { hp: s.hp || s.health || 100, maxHp };
    const race = fightAssessRace(Game, ctx, [wm], p);
    if (race.decline) {
      ctx.w2dSkipped = (ctx.w2dSkipped || 0) + 1;
      if (!ctx.w2dFirst) { try { ctx.w2dFirst = JSON.parse(JSON.stringify(race.detail)); } catch (e) {} }
      return true;
    }
  } catch (e) {}
  return false;
}
// ---------------------------------------------------------------------------

const competent = {
  id: 'competent',
  desc: 'aware experienced player: learns, teaches, cooks, avoids vectors, fights with advantage',
  setup(Game, ctx) {
    ctx.knownAtStart = Object.keys((Game.state.codex || {}).plants || {}).length;
  },
  upkeep(Game, ctx) {
    cookPack(Game, ctx);
    competentEat(Game);
    drinkSafe(Game, ctx);
    checkTicks(Game, ctx);
    workWater(Game, ctx);
    gearUp(Game, ctx); // equip best weapon/armor owned (longsim combat 2026-10-11)
    eveningFeast(Game, ctx); // host the feast at dusk when honestly affordable (food r7)
    feastFightRoad(Game, ctx); // face the feast's draw / fight while feasted (food r7)
    surplusFeast(Game, ctx); // feast on surplus when nobody starves (blitz simpolicy 2026-10-13, COMPETENT_SURPLUS_FEAST=1)
  },
  daily(Game, ctx) {
    // steady yourself at dawn: channel a keepsake when the trauma is up
    // (longsim combat r7 2026-10-12)
    sootheTrauma(Game, ctx);
    channelDevotion(Game, ctx); // calm days: practice a keepsake toward the devotion lane (food r7)
    // RECOVER-AND-RETURN (longsim scale-wall r2): after a directional flee
    // the scholar heads home to eat/rest — no outward exploration today.
    // Outward legs (stoneRun's frontier pushes, forage trips, counterPlay,
    // workTrapline) are skipped while recovering() is true; haven chores
    // below (sort, donate, teach, talk) still run.
    // THIRST HOME (tuning 2026-10-15; r18 2026-10-16: ungated from
    // COMPETENT_ROUTE_AROUND): no water carried and hydration low -> drink
    // if the tile offers water, else walk home and drink before anything
    // else. The bot used to sit on a trail tile for days at hydration 0
    // while the cistern held clean water (seeds 2026, 43; r18 seed 58 died
    // of dehydration on day 11 the same way): recovering() only reads kcal
    // and hp. The game says "DEHYDRATED: find and treat water today." — a
    // human listens. Gating this behind the experimental routing flag meant
    // every non-flagged run could die of thirst; the walk itself is safe
    // without routeAround (walkTo just stops at blockages).
    try {
      const s = Game.state.scholar;
      if ((s.hydration || 0) < 45 && !(s.water || []).length && !Game.playerAtHaven()) {
        drinkSafe(Game, ctx); // this tile may offer water — drink before walking
        const s2 = Game.state.scholar;
        if ((s2.hydration || 0) < 45 && !(s2.water || []).length) {
          walkTo(Game, DIR_FLEE_HAVEN.x, DIR_FLEE_HAVEN.y);
          drinkSafe(Game, ctx);
        }
        ctx.thirstHome = (ctx.thirstHome || 0) + 1;
      }
    } catch (e) { ctx.thirstHomeErr = String(e && e.message).slice(0, 80); }
    // KEEP YOUR WORD (journey landing r20): obligations before outings —
    // a competent player handles their promises first, from the morning
    // buffer, before the day's travel scatters everyone. COMPETENT_WARM=0:
    // the cold player makes no promises worth keeping and keeps none.
    if (COMPETENT_WARM) keepPromises(Game, ctx);
    const rec = recovering(Game, ctx);
    if (rec) recoverStep(Game, ctx);
    // the honest food run: forage, sort the haul at camp, sow seed first,
    // donate the rest. (Foraging yields unknowns — an honest player sorts.)
    if (!rec) stoneRun(Game, ctx); // deliberate rubble detour when the knife needs stone (food r6)
    if (!rec && needTrip(Game, ctx)) forageTripSeedFirst(Game, ctx);
    sortHaul(Game, ctx); // identify the haul at camp — unknowns become food
    armUp(Game, ctx); // knap a weapon BEFORE any fighting (combat r1) — runs
    // BEFORE keepKnife deliberately: the fighting knife and the butchering
    // knife are the same object, and the weapon gets priority.
    keepKnife(Game, ctx); // knap the stone knife FIRST (food r6: wins the vine race)
    cleanCatch(Game, ctx); // clean the trapline's catch before it rots (food r5)
    trySow(Game, ctx); // sow from identified pack plants when plots wait
    // COMPETENT_WARM=0: the cold player keeps their own haul — no donations.
    if (COMPETENT_WARM) donateHaul(Game, ctx); // the rest feeds the village
    if (!rec) counterPlay(Game, ctx); // gardens / fishing / traps when the land thins
    // VINEBANK (materials-banking 2026-10-14): spend the bank through the
    // 2+2 blind band — one honest attempt per day, below the base 3+3 band.
    // Runs BEFORE workTrapline deliberately: workTrapline's craft consumes
    // materials first, so a layer reading after it can't tell a 3+3 day
    // (base owns it) from a 2+2 day (the layer owns it) — and double-fires.
    if (!rec) vinebank.blindBand(Game, ctx);
    if (!rec) workTrapline(Game, ctx); // craft + set the snare line when known (longsim combat r2)
    // donate surplus beyond a 2-day personal buffer (hall-gated: see donateHaul)
    // COMPETENT_WARM=0: the cold player keeps the surplus too.
    if (COMPETENT_WARM) try {
      const hallGated = Game.havenStoresAccess && Game.havenStoresAccess() === 'none';
      if (!hallGated) {
        const s = Game.state.scholar;
        const cap = Game.kcalCap();
        if (s.kcal > cap * 1.5) {
          donateSurplus(Game,ctx,{keepKcal:cap*2,maxTransfers:1});
        }
      }
    } catch (e) {}
    teachRound(Game, ctx);
    // SNARETEACH (teach-drive 2026-10-19): court the trapper — gifts + the
    // wire lesson steer the scholar toward the existing teach channel.
    // Env-gated; gate-off returns null with no side effects.
    snareteach.courtTrapper(Game, ctx);
    // LEARN FIRST: knowledge is the food economy. Until we know 5 plants,
    // triple the conversations — gratitude teaches, and taught plants feed.
    try {
      const known = Object.keys((Game.state.codex || {}).plants || {}).length;
      if (known < 5) { talkRound(Game, ctx); talkRound(Game, ctx); }
    } catch (e) {}
    talkRound(Game, ctx);
    deepTalk(Game, ctx); // hold real conversations (blitz simpolicy 2026-10-13, COMPETENT_TALK=1)
    lootCorpses(Game, ctx); // strip the dead after fights
    // the fire network: accept offers, answer begs. COMPETENT_WARM=0: the
    // cold player walks past the fire network — no answering begs.
    if (COMPETENT_WARM) answerAidBeats(Game, ctx);
    // ASK ABOUT BEAST TRICKS (longsim combat 2026-11): a curious player asks
    // when the village knows something. counterTeachable() gates the topic.
    try {
      if (Game.counterTeachable && Game.askAbout) {
        const teachable = Game.counterTeachable();
        if (teachable) {
          const vv = Game.state.village || {};
          const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
          if (roster.length) {
            const vid = roster[Math.floor((global.__policyRandom || Math.random)() * roster.length)];
            const r = Game.askAbout(vid, 'beasttricks');
            if (r && r.taught) ctx.beastTricks = (ctx.beastTricks || 0) + 1;
          }
        }
      }
    } catch (e) {}
    // TAKE THE SYSTEM'S OFFER (coverage 2026-10-09): an experienced player
    // chooses an ability when offered — the sim never did, so ability_granted
    // never fired. Pick the first offer (a competent player takes the gift).
    try {
      const ch = (Game.state.scholar || {}).abilityChoices;
      if (ch && ch.length && Game.chooseAbility) {
        Game.chooseAbility(ch[0].id);
        ctx.choseAbility = (ctx.choseAbility || 0) + 1;
      }
    } catch (e) {}
    const known = Object.keys((Game.state.codex || {}).plants || {}).length;
    ctx.knownPlants = known;
    // KEEP YOUR WORD, EVENING PASS (journey landing r20): promises made
    // during the day's conversations are first visible now — a 1-day
    // favor deadline means tonight, not tomorrow morning. keepPromises is
    // idempotent: kept promises are skipped, open ones retried; the pack
    // holds the day's haul for food promises the morning buffer couldn't
    // cover, and a villager who was away all morning may be back.
    // COMPETENT_WARM=0: the cold player keeps nothing.
    if (COMPETENT_WARM) keepPromises(Game, ctx);
    // EAT THE DAY'S HAUL (longsim food r2 2026-10-11): daily forages AFTER
    // the last upkeep, so the upkeep's competentEat never sees the fresh
    // haul — the player was sleeping (and starving) on foraged food still
    // in the pack. Eat after the day's work, before the harness sleeps.
    competentEat(Game);
  },
  // Fight only with advantage: assess at fight START and walk away from bad
  // ones (an experienced player doesn't take 3:1 fights). Below 35% HP,
  // walk to the edge (flee-by-barrier). Otherwise strike the weakest.
  // BEAST TRICKS (longsim combat r5 2026-10-12) play before the generic
  // strike-the-weakest: the policy fights monster counters tactically.
  fight(Game, ctx) {
    try {
      const f = Game.tbfight;
      if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
      const p = Game.tbFighter('p');
      const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
      const endTurn = () => {
        try {
          const q = Game.tbFighter('p');
          q.moveLeft = 0; q.acted = true;
          Game.tbAfterPlayerAction();
        } catch (e) {}
      };
      // FLEE = PUSH THROUGH THE BARRIER (longsim scale-wall r1 2026-10-13):
      // the engine's exit is tbBarrierExit(dx,dy) — a deliberate push THROUGH
      // the grid edge onto the next node. Walking to / along the edge does
      // NOT exit (canon, game.js: "only a deliberate exit attempt"), and the
      // old walk-to-edge-only flee stood at the edge pressing "flee" as a
      // no-op while chasers killed the scholar — seed 44: a 21000-turn
      // belltoad where dpsFled fired at turn 7 and the scholar still died at
      // turn 20, ten no-op "flees" from the same edge tile. Chasers with
      // pursuit stamina follow across (the chase plays out honestly; the
      // relentless hushwolf only stops at Haven or death); non-chasers give
      // up at the barrier. Sealed fights hold — the engine says so.
      const flee = () => {
        // DIRECTIONAL FLEE (longsim scale-wall r2, gate COMPETENT_DIRECTIONAL_FLEE=1):
        // pick the havenward exit and judge the destination — never the
        // nearest edge. At the haven node: HOLD (no push leads toward
        // safety) — return false so fight() falls through to normal combat.
        if (dirFleeOn()) {
          try {
            const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
            const mpx = Game.map.px, mpy = Game.map.py;
            const dir = chooseFleeDir(Game, mpx, mpy);
            if (!dir) { ctx.fledHeld = (ctx.fledHeld || 0) + 1; return false; } // hold ground
            const tx = dir.dx < 0 ? 0 : dir.dx > 0 ? 8 : px;
            const ty = dir.dy < 0 ? 0 : dir.dy > 0 ? 8 : py;
            if (px === tx && py === ty) {
              // On the chosen edge: push THROUGH toward the judged destination.
              const bx = Game.map.px, by = Game.map.py;
              Game.tbBarrierExit(dir.dx, dir.dy);
              ctx.barrierPushes = (ctx.barrierPushes || 0) + 1;
              ctx.dirPushes = (ctx.dirPushes || 0) + 1;
              ctx.dirPushDetail = { from: [bx, by], to: [Game.map.px, Game.map.py], dir: [dir.dx, dir.dy], haven: dir.haven, known: dir.known, danger: dir.danger, score: dir.score };
              if (!ctx.dirPushFirst) ctx.dirPushFirst = Object.assign({}, ctx.dirPushDetail);
              // The push moved us or ended the fight: recover-and-return.
              // (Sealed fights and blocked far sides consume the push without
              // moving — no recovery window for a push that went nowhere.)
              if (Game.map.px !== bx || Game.map.py !== by || !Game.tbfight || Game.tbfight.over) {
                markRecover(Game, ctx);
              }
            } else {
              // Not on the chosen edge yet: step toward it one tile (the
              // full edge walk can exceed this turn's movement budget —
              // tbPlayerMove refuses paths longer than moveLeft); the push
              // lands on a later turn once the edge is reached.
              try { Game.tbPlayerMove(px + dir.dx, py + dir.dy); } catch (e) {}
              ctx.dirWalks = (ctx.dirWalks || 0) + 1;
            }
            ctx.fled = (ctx.fled || 0) + 1;
          } catch (e) {}
          endTurn();
          return true;
        }
        try {
          const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
          if (exitVerifiedFleeOn() && ctx._fleeBlockedFor === f.id) {
            // This fight is already marked unfleeable (consumed push, or
            // stuck flee-walk): a real player reads the message once and
            // fights it out. Return false so fight() falls through to
            // beast-trick play and strikes. Checked BEFORE the edge/pick
            // logic so it fires mid-grid too, not just on an edge.
            ctx.fleeBlocked = (ctx.fleeBlocked || 0) + 1;
            return false;
          }
          // STUCK-FLEE SNAPSHOT (journey deepening r37, gate COMPETENT_EXIT_VERIFIED_FLEE=1):
          // a flee turn that moves the player NOWHERE (walk path fails with
          // "No path there.", push silently fails) is a wasted turn a real
          // player wouldn't repeat — the d63 moderator ran 25 such rounds
          // and the scholar died without striking. Gate off: snapshots stay
          // null and nothing below runs (legacy byte-identical).
          const fleeGridBefore = exitVerifiedFleeOn()
            ? (px + ',' + py) : null;
          const fleeMapBefore = exitVerifiedFleeOn()
            ? (Game.map.px + ',' + Game.map.py) : null;
          let pushed = false;
          try {
            const mpx = Game.map.px, mpy = Game.map.py;
            const cands = [];
            if (px === 0) cands.push([-1, 0]); else if (px === 8) cands.push([1, 0]);
            if (py === 0) cands.push([0, -1]); else if (py === 8) cands.push([0, 1]);
            // World bounds: pushing off the 9x9 world is a spent turn ("The
            // known world ends here") — prefer an exit that leads somewhere.
            const viable = cands.filter((dd) =>
              mpx + dd[0] >= 0 && mpx + dd[0] <= 8 && mpy + dd[1] >= 0 && mpy + dd[1] <= 8);
            const pick = viable[0] || cands[0];
            if (pick && dpsRaceOn()) {
              const mapBefore = exitVerifiedFleeOn()
                ? (Game.map.px + ',' + Game.map.py) : null;
              const pushResult = Game.tbBarrierExit(pick[0], pick[1]);
              if (!exitVerifiedFleeOn()) {
                pushed = true;
                ctx.barrierPushes = (ctx.barrierPushes || 0) + 1;
              } else if (pushResult) {
                const exited = !!(!Game.tbfight || Game.tbfight.over ||
                  (Game.map.px + ',' + Game.map.py) !== mapBefore);
                if (exited) {
                  pushed = true;
                  ctx.barrierPushes = (ctx.barrierPushes || 0) + 1;
                } else {
                  // Truthy push consumed WITHOUT exiting (barrier holds,
                  // world edge, stasis). Mark this fight unfleeable; the
                  // push spent the turn (the message was said), so fall
                  // through to endTurn below with pushed=true.
                  ctx._fleeBlockedFor = f.id;
                  ctx.fleeBlocked = (ctx.fleeBlocked || 0) + 1;
                  pushed = true;
                }
              }
            }
          } catch (e) {}
          if (!pushed) {
            // Not on an edge yet (or lever gated off — legacy path): walk to
            // the nearest x-edge; the push happens on a later turn.
            const tx = px <= 4 ? 0 : 8;
            try { Game.tbPlayerMove(tx, py); } catch (e) {}
          }
          if (exitVerifiedFleeOn()) {
            // STUCK-FLEE RESOLUTION (journey deepening r37): the flee turn
            // moved the player NOWHERE (walk path failed, push silently
            // failed) and the fight didn't end. Track consecutive
            // zero-progress flee turns on this fight; at 3, mark it
            // unfleeable and fight it out. A real player reads the room and
            // fights — the d63 moderator looped 25 rounds of "No path there."
            // before the scholar went down without striking once.
            const gridNow = ((p.mx != null ? p.mx : 4) + ',' + (p.my != null ? p.my : 4));
            const mapNow = Game.map.px + ',' + Game.map.py;
            const noProgress = gridNow === fleeGridBefore && mapNow === fleeMapBefore &&
              Game.tbfight && !Game.tbfight.over && ctx._fleeBlockedFor !== f.id;
            let fst = ctx._fleeStuck;
            if (noProgress) {
              if (!fst || fst.for !== f.id) fst = ctx._fleeStuck = { for: f.id, turns: 0 };
              fst.turns += 1;
              if (fst.turns >= 3) {
                // Return false BEFORE endTurn: the failed walk spent nothing,
                // so this turn is still the player's — fight() falls through
                // to beast-trick play and strikes.
                ctx._fleeBlockedFor = f.id;
                ctx.fleeBlocked = (ctx.fleeBlocked || 0) + 1;
                return false;
              }
            } else if (fst && fst.for === f.id) {
              fst.turns = 0;
            }
          }
          ctx.fled = (ctx.fled || 0) + 1;
        } catch (e) {}
        endTurn();
        return true;
      };
      // FIGHT-ASSESS LORE (longsim scale-wall r3): learn each species'
      // damage from the scholar's own fights — bookkeeping only, gate on.
      if (fightAssessOn()) {
        try {
          const _mons = f.fighters.filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
          fightAssessLore(Game, ctx, f, p, _mons);
        } catch (e) {}
      }
      // NEW-FIGHT ASSESSMENT: don't start fights you can't win.
      if (ctx._fightObj !== f) {
        ctx._fightObj = f;
        dpsRaceInit(ctx); // DPS-race assessment (scale-wall r1): snapshot the race baseline
        // FIGHT-ASSESS (longsim scale-wall r3, gate COMPETENT_FIGHT_ASSESS=1):
        // knowledge-gated damage-race assessment at turn 1, full HP —
        // proactive disengage of a lost race, instead of the legacy
        // HP-ratio heuristic below. Gate off = legacy block, byte-identical.
        if (fightAssessOn()) {
          try {
            if (fightAssessHook(Game, f, ctx, p, flee)) return true;
          } catch (e) {}
        } else try {
          const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
          let totalMhp = 0, maxWave = 1;
          for (const m of monsters) {
            totalMhp += m.maxHp || m.hp || 0;
            const md = ((Game.data || {}).monsters || []).find(d => d.id === m.monsterId);
            if (md && md.wave) maxWave = Math.max(maxWave, md.wave);
          }
          const pmax = p.maxHp || 100;
          // COURTKILL (scale-wall r18 arm 1, via ctx._huntCommit — set only by
          // the courtkill wrapper when COURTKILL=1, wave-3 unlocked, rung
          // unmet): a committed wave-3 hunt overrides the start-of-fight
          // walk-away. The ledger needs these kills and the r16 dmgmath
          // finding says wave-3 fights are winnable attrition (4-6 rounds at
          // mid build), not burst deaths. The <50% HP guard stays: starting
          // a wave-3 fight badly hurt is suicide, not a hunt. Gate off =
          // the block below, byte-identical.
          const huntCommitted = !!(ctx._huntCommit && maxWave === 3 && hpPct >= 0.5);
          // WAVE5REACH (scale-onramp wave-5 lever 2026-10-15, via ctx._w5Commit
          // — set only by the wave5reach wrapper when WAVE5REACH=1, wave-4
          // unlocked, wave-5 not yet, scholar >= 50% HP): a committed
          // wave-4+ facing overrides the start-of-fight walk-away, exactly
          // like _huntCommit does for wave-3. DESIGN CALL (see
          // evidence/2026-10-15/sim-wave5reach.md): the mid-fight 35% eject
          // below is UNCHANGED — wave-4 attrition is bloodier than wave-3,
          // so the hunt holds to 12% only via _huntCommit; a losing wave-4+
          // race still retreats at 35%. Gate off = the block below,
          // byte-identical.
          const wave5Committed = !!(ctx._w5Commit && maxWave >= 4 && hpPct >= 0.5);
          const outmatched = !(huntCommitted || wave5Committed) && (
            totalMhp > 2.5 * pmax ||
            (maxWave >= 2 && hpPct < 0.7) ||
            hpPct < 0.5);
          if (outmatched && monsters.length) {
            ctx.fledBad = (ctx.fledBad || 0) + 1;
            const fr = flee();
            if (fr) return true;
            // directional-flee hold (at haven): no exit leads toward safety —
            // fall through to tricks/strikes below instead of pushing outward
          }
        } catch (e) {}
      }
      // COURTKILL (scale-wall r18 arm 1, via ctx._huntCommit): committed wave-3
      // hunts hold to 12% — the r16 finding says these are winnable
      // attritions and cheat-death usually holds (103/104); fleeing at 35%
      // abandons winnable ledger kills mid-race. Gate off = 0.35, unchanged.
      if (hpPct < (ctx._huntCommit ? 0.12 : 0.35)) {
        // retreat toward the havenward edge — the barrier ends pursuit honestly
        const fr = flee();
        if (fr) return true;
        // directional-flee hold (at haven): fall through to tricks/strikes
      }
      // DPS-RACE ASSESSMENT (longsim scale-wall r1 2026-10-13): gauge the
      // damage race after a couple of exchanges; disengage a lost race while
      // HP is still high. Outranks trick play — a trick that isn't winning
      // the race doesn't save the fight.
      try {
        const _dpsVerdict = dpsRaceAssess(Game, f, ctx, p, flee);
        if (_dpsVerdict) return _dpsVerdict;
      } catch (e) {}
      // BEAST TRICKS (longsim combat r5 2026-10-12): play known monster
      // counters tactically before the generic strike-the-weakest. Never
      // overrides the walk-away assessment above.
      try { if (beastTrickPlay(Game, f, ctx, p, endTurn)) return true; } catch (e) {}
      const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      if (!alive.length) return false;
      alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      const tgt = alive[0];
      const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
      const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
      // CLOSE THE DISTANCE (coverage 2026-10-09): striking out of range is a
      // no-op that never advances the turn. Move adjacent first, then strike.
      // (Grid is 0..8; skip off-grid and monster-occupied tiles.)
      try {
        const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
        const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
        if (d0 > (w.range || 1)) {
          const occupied = new Set(
            f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
          let bx = null, by = null, bd = 1e9;
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy) continue;
            const cx = tmx + dx, cy = tmy + dy;
            if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
            if (occupied.has(cx + ',' + cy)) continue;
            const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
            if (dd < bd) { bd = dd; bx = cx; by = cy; }
          }
          if (bx != null) {
            // STEP, DON'T TELEPORT (journey-endgame r6 2026-10-12):
            // tbPlayerMove refuses destinations beyond moveLeft ("Too far").
            // Walking the full path to a far target no-ops forever — the
            // ducks_in_a_row standoff ran 4975 rounds with nobody moving and
            // nobody bleeding. Step as far toward the target as this turn
            // allows instead.
            try {
              let dx = bx, dy = by;
              const ml = (p.moveLeft || 0);
              if (ml > 0 && typeof Game.findPath === 'function') {
                const path = Game.findPath(px, py, bx, by);
                if (path && path.length > ml) {
                  const step = path[ml - 1];
                  dx = step[0]; dy = step[1];
                }
              }
              Game.tbPlayerMove(dx, dy);
            } catch (e) {}
            ctx.closed = (ctx.closed || 0) + 1;
          }
          endTurn();
          return true;
        }
      } catch (e) {}
      // STRIKE THEN END TURN (coverage 2026-10-09): tbPlayerStrike leaves
      // moveLeft > 0, so the turn never auto-advances — the policy spun on
      // "Already acted" forever, freezing the game clock. End explicitly.
      try { Game.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
      if (ctx._dpsRace) ctx._dpsRace.strikes++; // DPS-race assessment (scale-wall r1): count real strikes
      endTurn();
      return true;
    } catch (e) { return false; }
  },
};

module.exports = { competent, competentEat, packEatOnce, beastStrikeTarget, walkTo, workTrapline, workTraplineSet, forageTripSeedFirst, sortHaul, donateHaul, needTrip, keepKnife, armUp, gearUp, stoneRun, clearRubbleForStone, sootheTrauma, channelDevotion, eveningFeast, feastFightRoad, feastOn, recentGives, surplusFeast, surplusFeastOn, talkRound, deepTalk, talkOn, pickTalkTargets, pickTalkChoice, holdConversation, talkScore, keepPromises, dpsRaceAssess, dpsRaceInit, dpsRaceOn, dirFleeOn, chooseFleeDir, fleeDirScore, markRecover, recovering, recoverStep, DIR_FLEE_HAVEN, fightAssessOn, fightAssessRace, fightAssessDPR, fightAssessHook, fightAssessSkipTile, fightAssessLore, w2disengageOn, w2disengageSkipTile, W2_DISENGAGE_TOP4, W2_DISENGAGE_ARMOR_GATE, armorWantsVine };


// The public shared gearing routine, also used by prepared policy proofs.
module.exports.gearUp = gearUp;

module.exports.workGarden = workGarden;
module.exports.donateSurplus = donateSurplus;
