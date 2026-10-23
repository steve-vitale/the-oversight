// scholardist-b — "the scholar's share": thin-day earmarked distribution.
//
// Distribution-side named next of the scholarbowl-b NO-GO
// (evidence/2026-10-22/sim-scholarbowl-b.md — the "deferral-routing gap":
// conserved pool kcal does not reach starving mouths on thin days).
// Backlog: the pool-thickness theory (sim-poolscholar-b.md, #816/#817).
//
// THEORY FACT (poolscholar-b): the scholar's trust-scaled villageMeal
// (~1000/2000/2200 kcal/day) is ~50% of ALL pooled draws at EVERY pool-
// thickness quintile — thickness-independent by design, the pool's single
// largest fixed cost. scholarbowl-b proved pool thickening is not the
// treatment: 268 halves / 276,700 kcal saved moved thin-pool starvation
// only 8->7 (bar <=6) — the saved kcal thickened the bins while mouths
// still starved (s67403: 13 halves / 13k saved, 4 thin-day starvation
// deaths). Thin-pool starvation is a DISTRIBUTION/timing problem.
//
// LEVER: on thin days (pantryFreshDays < 2, the Q1 thin gate), the
// scholar's draw is halved at the pantryDraw choke point (the scholarbowl
// pattern), but the conserved half is NOT returned to the general pool —
// it is drawn as REAL pantry items for the hungriest villager and folded
// into their meal via the engine's own "eaten at the fire" intake channel
// (the depositgate dgEased honesty precedent: extra intake counted in the
// meal's starvation-judgment ateAll, hunger eased by the meal formula).
// Earmarked distribution, not pool thickening. No phantom kcal: the grant
// is a real best-fit pantryDraw; a zero-take grant is silent (nothing
// moved — nothing to narrate).
//
// The grant is always voiced — NEVER a silent override of the player's
// draw (backlog #761 sense-hostility constraint; canon: "No silent
// actions."). The real choice UI (full / half / grant it) is Steve's
// design task and is OUT OF SCOPE; sim-side the policy exercises the grant
// on thin days and this layer measures the mechanism's economics headless.
//
// IMPLEMENTATION: game-side layer, default-OFF, env-gated (SCHOLARDIST=1).
// ZERO src/js modifications. Wraps Game.villageMeal + Game.pantryDraw
// (the halve, scholarbowl's choke point) + Game.villagerMealDay +
// Game.villagerDayProduction (the grant fold-in). Gate OFF: install()
// never wraps (byte-identical delegation — the proof test's det-gate pins
// it). The joined-village and camp-wild meal branches never call
// pantryDraw, so the halve flag (and hence the grant) is inert there.
// Ordering (game.js endDay): villageMeal runs BEFORE villageEats, so the
// grant is stashed at the scholar's meal and consumed by the recipient's
// same-day villagerMealDay (day-guarded against stale carryover).
// villagerDayProduction's ONLY meal-loop caller is villagerMealDay, so the
// injection wrapper is contained. No RNG consumed by the layer:
// recipient pick is max-hunger/roster-order, voice line selection is
// deterministic ((day + seed) % lines), reproducible across re-runs.
//
// VOICE: one beat per day max (voiceDay guard), fired only when the grant
// actually moved food (taken > 0). First-person scholar, named recipient,
// recipient reaction in the same beat — the SENSE-TESTING LAW reads both.
'use strict';

const NS = 'SCHOLARDIST_B';

// Eligibility: a genuinely hungry mouth. Below one bad day's hunger the
// gift would leak straight back through gave->stockSurplus.
const HUNGER_THRESHOLD = 20;

function layerOn() {
  return typeof process !== 'undefined' && process.env && process.env.SCHOLARDIST === '1';
}

// Thin gate: the Q1 thin quintile (pantryFreshDays < 2), the same gate the
// thindefer-b and scholarbowl-b arms used. Evaluated at the scholar's meal.
function thinDay(Game) {
  try { return Game.pantryFreshDays() < 2; } catch (e) { return false; }
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
// recipient reaction — the beat reads as people, not ledger lines.
const LINES = [
  "🍽️ You push half your bowl across the fire to {N} — 'eat. You need it more than I do.' {N} doesn't argue. The bowl comes back scraped clean.",
  "🍽️ The bins are thin, and {N} looks it. You set your second half in front of {N}. 'Eat,' you say. {N} eats like someone making up for days.",
  "🍽️ Half your share tonight. You hand the rest to {N}, who takes it with both hands and doesn't say a word until it's gone.",
  "🍽️ You wave off the second scoop and nod toward {N}. '{N} eats first tonight.' Nobody at the fire disagrees.",
  "🍽️ Thin day. Your bowl stays half-full — the other half goes to {N}, who's been quiet about being hungry.",
];

function freshTele() {
  return { thinMeals: 0, halves: 0, grants: 0, grantedKcal: 0, voices: 0, errors: 0, beatLines: [] };
}

// install(Game): wrap villageMeal + pantryDraw + villagerMealDay +
// villagerDayProduction. Gate OFF: wraps nothing, returns a tele that stays
// all-zero (det-gate pins it).
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
    if (this._sdHalve && typeof want === 'number' && want > 0) {
      const halved = want / 2;
      tele.halves++;
      this._sdIntent = want;
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
    if (!rec) return; // no eligible mouth: the conserved half stays pooled
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
    v._sdGift = { vid: rec.vid, kcal: taken, day };
    // VOICE: the grant is voiced — never a silent override. One beat per
    // day; only when real food moved.
    if (voiceDay !== day) {
      voiceDay = day;
      tele.voices++;
      const name = recipientName(game, rec.vid);
      const line = LINES[(day + seed) % LINES.length].split('{N}').join(name);
      tele.beatLines.push({ day, vid: rec.vid, kcal: taken, line });
      try { game.say(line); } catch (e) { tele.errors++; }
      try { game.tele('scholarDist', { day, vid: rec.vid, kcal: taken, line: line.slice(0, 60) }); } catch (e2) {}
    }
  }

  Game.villageMeal = function () {
    let thin = false;
    try {
      thin = thinDay(this);
      if (thin) tele.thinMeals++;
    } catch (e) { tele.errors++; }
    this._sdHalve = thin;
    this._sdIntent = 0;
    try {
      return origMeal.apply(this, arguments);
    } finally {
      this._sdHalve = false;
      // Route the conserved half to the hungriest villager — earmarked,
      // not pooled. (Joined-village / camp-wild branches never set
      // _sdIntent: the flag is inert there.)
      const intent = this._sdIntent || 0;
      this._sdIntent = 0;
      if (thin && intent > 0) {
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
    if (this._sdGiftVid && vid === this._sdGiftVid) {
      const vv = v || ((this.state || {}).village) || {};
      const g = vv._sdGift;
      if (g && g.vid === vid && g.kcal > 0) return base + g.kcal;
    }
    return base;
  };

  Game.villagerMealDay = function (vid, person, v, ctx) {
    const vv = v || ((this.state || {}).village) || {};
    const day = ((this.state || {}).scholar || {}).day || 0;
    const g = vv._sdGift || null;
    const armed = !!(g && g.vid === vid && g.kcal > 0 && g.day === day);
    if (armed) this._sdGiftVid = vid;
    try {
      return origMealDay.apply(this, arguments);
    } finally {
      this._sdGiftVid = null;
      if (g && vv._sdGift === g) vv._sdGift = null; // consume the gift
    }
  };

  // namespace markers (disjoint from scholarbowl-b's SCHOLARBOWL_B /
  // _sbHalve, thindefer-b's THINDEFER_B / _thinDefer, and loop-A arms)
  Game.villageMeal._scholarDist = NS;
  Game.pantryDraw._scholarDist = NS;
  Game.villagerMealDay._scholarDist = NS;
  Game.villagerDayProduction._scholarDist = NS;

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

module.exports = { install, layerOn, thinDay, pickRecipient, LINES, NS, HUNGER_THRESHOLD };
