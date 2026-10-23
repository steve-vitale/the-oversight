// scholardistsafe-b — "the scholar's share, gated": thin-day earmarked
// distribution with burn-clock + scholar-hunger gates.
//
// SCHOLAR-SAFE variant of sim-scholardist-b / sim-scholardist-confirm-b
// (evidence/2026-10-23/sim-scholardist-confirm-b.md). The confirm's
// kill-discipline diagnosis: the mechanism is sound (312 grants / 307k
// kcal / 0 errors), the scholar is NOT systematically starved
// (hunger-probe control≈armed), but the d1 thin-gate artifact fires on
// 32/32 armed runs — every armed trajectory diverges from control on DAY
// 1, and the corpus total is chaos-dominated. The named next: gate the
// grant — skip day 1 (require an established burnHistory) and grant only
// when the scholar's own hunger is low.
//
// LEVER: on thin days (pantryFreshDays < 2, the Q1 thin gate, evaluated
// at the scholar's meal), the scholar's trust-scaled villageMeal intent
// is halved at the pantryDraw choke point (the scholarbowl-b pattern)
// and the conserved half is drawn as REAL pantry items for the hungriest
// eligible villager (living, present, not the scholar; npcNeeds hunger
// >= 20; roster-order tiebreak; zero Math.random) and folded into their
// meal via the engine's own "eaten at the fire" intake channel (the
// depositgate dgEased honesty precedent). No phantom kcal: the grant is
// a real best-fit pantryDraw; a zero-take grant is silent. GATED DAYS
// are full delegation — no halve, no grant, no voice — so a gated armed
// day is control-identical and cannot reshuffle the trajectory.
//
// GATES (design calls, documented in the evidence header for overrule):
//  1. burnHistory gate: grants require >= 1 recorded burn day. On day 1
//     burnHistory is empty and pantryFreshDays falls back to roster x
//     2000 — the d1 artifact. One recorded day ends the fallback.
//  2. scholar-hunger gate (relative): the scholar gives only when the
//     hungriest eligible mouth is hungrier than the scholar
//     ("eat. You need it more than I do." — ties go to the scholar).
//     The absolute <=30 ceiling was replaced during instrument proof:
//     the distribution probe showed scholar hunger on thin days sits
//     ~30-45, so <=30 blocked ~3/4 of thin days; the relative rule blocks
//     exactly the perverse case (scholar is the hungriest mouth).
//
// VOICE: one beat per day max, fired only when the grant actually moved
// food (taken > 0). First-person scholar, named recipient, recipient
// reaction in the same beat — never a silent override (#761; canon "No
// silent actions"). Gated days narrate nothing because nothing happens.
//
// IMPLEMENTATION: game-side layer, default-OFF, env-gated
// (SCHOLARDISTSAFE=1). ZERO src/js modifications. Wraps
// Game.villageMeal + Game.pantryDraw + Game.villagerMealDay +
// Game.villagerDayProduction. Gate OFF: install() never wraps
// (byte-identical delegation — the proof test's det-gate pins it).
// Disjoint namespace SCHOLARDISTSAFE_B / _sds* flags from scholardist-b's
// SCHOLARDIST_B / _sd* (that layer stays on master untouched).
'use strict';

const NS = 'SCHOLARDISTSAFE_B';

// Eligibility: a genuinely hungry mouth. Below one bad day's hunger the
// gift would leak straight back through gave->stockSurplus.
const HUNGER_THRESHOLD = 20;
// (absolute-ceiling constant retired during instrument proof — the gate
// is relative now; kept documented here so the design history is legible)
// The burn-clock gate: at least one recorded burn day. villageEats pushes
// v.burnHistory at endDay (rolling 7); on day 1 it is empty and
// pantryFreshDays falls back to roster x 2000 — the d1 artifact.
const BURN_HISTORY_MIN = 1;

function layerOn() {
  return typeof process !== 'undefined' && process.env && process.env.SCHOLARDISTSAFE === '1';
}

// Thin gate: the Q1 thin quintile (pantryFreshDays < 2), evaluated at the
// scholar's meal. Same gate as thindefer-b / scholarbowl-b / scholardist-b.
function thinDay(Game) {
  try { return Game.pantryFreshDays() < 2; } catch (e) { return false; }
}

// The burn-clock gate: an established burn clock, i.e. at least one
// endDay has recorded the honest net burn. On day 1 the clock is empty.
function burnEstablished(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const hist = v.burnHistory || [];
    return hist.length >= BURN_HISTORY_MIN;
  } catch (e) { return false; }
}

// The scholar-hunger gate (relative): the scholar gives only when the
// hungriest mouth needs it MORE — scholar hunger < recipient hunger.
// The voice line is the literal rule: "eat. You need it more than I do."
// Ties go to the scholar (scholar-safe). This replaced the absolute
// <=30 ceiling during instrument proof: the distribution probe showed the
// scholar's hunger on thin days sits ~30-45 (median), so <=30 blocked
// ~3/4 of thin days (5/19 pass); the relative rule passes 17/19 and
// blocks exactly the perverse case (the scholar is the hungriest mouth).
function scholarHungrierThan(Game, recHunger) {
  return scholarHungerOf(Game) >= recHunger;
}

function scholarHungerOf(Game) {
  try { return (Game.npcNeeds(Game.villagerId) || {}).hunger || 0; }
  catch (e) { return 0; }
}

// Hungriest eligible villager: living, present (not away — away villagers
// eat from pack; haven food can't reach them), not the scholar. Max
// npcNeeds hunger >= threshold; roster-order tiebreak; zero Math.random.
function pickRecipient(Game, v) {
  try {
    const me = Game.villagerId;
    const roster = (v && v.roster) || [];
    let best = null;
    for (const vid of roster) {
      if (vid === me) continue;
      if (v.away && v.away[vid]) continue;
      let person = null;
      try { person = Game.vpOf(vid); } catch (e) { continue; }
      if (!person || person.dead) continue;
      let hunger = 0;
      try { hunger = (Game.npcNeeds(vid) || {}).hunger || 0; } catch (e) { continue; }
      if (hunger < HUNGER_THRESHOLD) continue;
      if (!best || hunger > best.hunger) best = { vid, person, hunger };
    }
    return best;
  } catch (e) { return null; }
}

function recipientName(Game, vid) {
  try {
    const n = Game.npcName(vid);
    if (n && n !== 'Someone') return n;
  } catch (e) {}
  try {
    const dn = String(Game.displayName(vid) || '');
    if (/^an? /i.test(dn)) return dn;
    const first = dn.split(' ')[0];
    if (first) return first;
  } catch (e2) {}
  return 'Someone';
}

// The scholar's share, voiced. First-person scholar, named recipient,
// recipient reaction — the proven fiction, kept verbatim from
// scholardist-b (sense PASS x2; only the gating is new).
const LINES = [
  "🍽️ You push half your bowl across the fire to {N} — 'eat. You need it more than I do.' {N} doesn't argue. The bowl comes back scraped clean.",
  "🍽️ The bins are thin, and {N} looks it. You set your second half in front of {N}. 'Eat,' you say. {N} eats like someone making up for days.",
  "🍽️ Half your share tonight. You hand the rest to {N}, who takes it with both hands and doesn't say a word until it's gone.",
  "🍽️ You wave off the second scoop and nod toward {N}. '{N} eats first tonight.' Nobody at the fire disagrees.",
  "🍽️ Thin day. Your bowl stays half-full — the other half goes to {N}, who's been quiet about being hungry.",
];

function freshTele() {
  return {
    thinMeals: 0, halves: 0, grants: 0, grantedKcal: 0, voices: 0,
    errors: 0, gatedBurn: 0, gatedHunger: 0, gatedNoMouth: 0, beatLines: [],
  };
}

// install(Game): wrap villageMeal + pantryDraw + villagerMealDay +
// villagerDayProduction. Gate OFF: wraps nothing, returns a tele that
// stays all-zero (det-gate pins it).
// Returns { tele, uninstall } — uninstall restores the originals.
function install(Game) {
  const tele = freshTele();
  const seed = (Game && Game.__simSeed) || 0;
  if (!layerOn()) return { tele, uninstall() {} };
  const origMeal = Game.villageMeal;
  const origDraw = Game.pantryDraw;
  const origMealDay = Game.villagerMealDay;
  const origProd = Game.villagerDayProduction;
  if (typeof origMeal !== 'function' || typeof origDraw !== 'function' ||
      typeof origMealDay !== 'function' || typeof origProd !== 'function') {
    tele.errors++;
    return { tele, uninstall() {} };
  }
  let voiceDay = -1;

  // The halve: same choke point as scholarbowl-b — the trust-scaled share
  // intent (want, after the room cap) is halved while the flag stands. The
  // original want is stashed for the grant sizing.
  Game.pantryDraw = function (v, want, opts) {
    if (this._sdsHalve && typeof want === 'number' && want > 0) {
      const halved = want / 2;
      tele.halves++;
      this._sdsIntent = want;
      return origDraw.call(this, v, halved, opts);
    }
    return origDraw.call(this, v, want, opts);
  };

  // The grant: after the scholar's halved meal, draw the conserved half as
  // REAL pantry items for the hungriest villager and stash it for their
  // same-day meal. Drawn BEFORE villageEats — priority, earmarked, never
  // competed for. No phantom kcal: taken is what moved.
  function grantOne(game, intent) {
    const v = (game.state || {}).village || {};
    const day = ((game.state || {}).scholar || {}).day || 0;
    const want = Math.round(intent / 2);
    if (!(want > 0)) return;
    const rec = pickRecipient(game, v);
    if (!rec) return; // defense-in-depth: the wrapper pre-checks eligibility
                      // before the choke point, so this is unreachable in
                      // practice. If ever reached, the grant is skipped —
                      // never a halve-then-pool.
    let exposure = {};
    try { exposure = game.freshExposure(); } catch (e) { tele.errors++; }
    let drawn = null;
    try {
      drawn = origDraw.call(game, v, want, { cook: true, exposure });
    } catch (e) { tele.errors++; return; }
    const taken = Math.round((drawn && drawn.taken) || 0);
    if (!(taken > 0)) return; // thin bins: nothing moved, nothing to narrate
    tele.grants++;
    tele.grantedKcal += taken;
    // Stash for the recipient's same-day villagerMealDay (day-guarded).
    // The produced-injection below folds these REAL kcal into their meal's
    // starvation-judgment ateAll — the depositgate-dgEased honesty
    // contract: "eaten at the fire" intake, counted, never silent.
    v._sdsGift = { vid: rec.vid, kcal: taken, day };
    // VOICE: the grant is voiced — never a silent override. One beat per
    // day; only when real food moved.
    if (voiceDay !== day) {
      voiceDay = day;
      tele.voices++;
      const name = recipientName(game, rec.vid);
      const line = LINES[(day + seed) % LINES.length].split('{N}').join(name);
      tele.beatLines.push({ day, vid: rec.vid, kcal: taken, line });
      try { game.say(line); } catch (e) { tele.errors++; }
      try { game.tele('scholarDistSafe', { day, vid: rec.vid, kcal: taken, line: line.slice(0, 60) }); } catch (e2) {}
    }
  }

  Game.villageMeal = function () {
    let thin = false;
    try {
      thin = thinDay(this);
      if (thin) tele.thinMeals++;
    } catch (e) { tele.errors++; }
    // THE GATES: on a gated thin day the scholar eats their full
    // trust-scaled meal — no halve, no grant, no voice. The armed day is
    // then control-identical and cannot reshuffle the trajectory. The
    // recipient pre-check runs BEFORE the choke point: the halve only
    // happens when there is a mouth to receive it — a no-recipient meal
    // is full delegation, never a halve-then-pool.
    let gated = false;
    if (thin) {
      if (!burnEstablished(this)) { gated = true; tele.gatedBurn++; }
      else {
        const v = (this.state || {}).village || {};
        const rec = pickRecipient(this, v);
        if (!rec) { gated = true; tele.gatedNoMouth++; }
        else if (scholarHungrierThan(this, rec.hunger)) { gated = true; tele.gatedHunger++; }
      }
    }
    this._sdsHalve = thin && !gated;
    this._sdsIntent = 0;
    try {
      return origMeal.apply(this, arguments);
    } finally {
      this._sdsHalve = false;
      // Route the conserved half to the hungriest villager — earmarked,
      // not pooled. (Joined-village / camp-wild branches never set
      // _sdsIntent: the flag is inert there.)
      const intent = this._sdsIntent || 0;
      this._sdsIntent = 0;
      if (thin && !gated && intent > 0) {
        try { grantOne(this, intent); } catch (e) { tele.errors++; }
      }
    }
  };

  // The fold-in: during the gift recipient's villagerMealDay, their
  // production reads higher by the REAL granted kcal — ownEat rises,
  // dayWant falls (they draw less from the thin pantry), hunger eases by
  // the meal formula, and the starvation judgment (ateAll < need*0.6)
  // reads the gift. villagerDayProduction's only meal-loop caller is
  // villagerMealDay, so the injection is contained; the flag is raised
  // only for the flagged vid and cleared in the finally.
  Game.villagerDayProduction = function (person, vid, v) {
    const base = origProd.apply(this, arguments);
    if (this._sdsGiftVid && vid === this._sdsGiftVid) {
      const vv = v || ((this.state || {}).village) || {};
      const g = vv._sdsGift;
      if (g && g.vid === vid && g.kcal > 0) return base + g.kcal;
    }
    return base;
  };

  Game.villagerMealDay = function (vid, person, v, ctx) {
    const vv = v || ((this.state || {}).village) || {};
    const day = ((this.state || {}).scholar || {}).day || 0;
    const g = vv._sdsGift || null;
    const armed = !!(g && g.vid === vid && g.kcal > 0 && g.day === day);
    if (armed) this._sdsGiftVid = vid;
    try {
      return origMealDay.apply(this, arguments);
    } finally {
      this._sdsGiftVid = null;
      if (g && vv._sdsGift === g) vv._sdsGift = null; // consume the gift
    }
  };

  // namespace markers (disjoint from scholardist-b's _scholarDist,
  // scholarbowl-b's _sb markers, thindefer-b, and loop-A arms)
  Game.villageMeal._scholarDistSafe = NS;
  Game.pantryDraw._scholarDistSafe = NS;
  Game.villagerMealDay._scholarDistSafe = NS;
  Game.villagerDayProduction._scholarDistSafe = NS;

  return {
    tele,
    uninstall() {
      Game.villageMeal = origMeal;
      Game.pantryDraw = origDraw;
      Game.villagerMealDay = origMealDay;
      Game.villagerDayProduction = origProd;
    },
  };
}

module.exports = {
  install, layerOn, thinDay, burnEstablished, scholarHungrierThan,
  scholarHungerOf, pickRecipient, LINES, NS, HUNGER_THRESHOLD,
  BURN_HISTORY_MIN,
};
