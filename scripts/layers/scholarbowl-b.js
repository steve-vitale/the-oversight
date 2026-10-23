// scholarbowl-b — "the scholar's bowl": thin-day player-side voiced meal choice.
//
// Lever 2 of the pool-thickness theory (evidence/2026-10-22/sim-poolscholar-b.md,
// backlog #816; named next of the KILLED-AT-PILOT thindefer-b arm,
// evidence/2026-10-22/sim-thindefer-b.md).
//
// THEORY FACT (poolscholar-b): the scholar's trust-scaled villageMeal
// (~1000/2000/2200 kcal/day) is ~50% of ALL pooled draws at EVERY pool-
// thickness quintile — thickness-independent by design, the pool's single
// largest fixed cost. The villager-side thin-deference arm (thindefer-b)
// fired correctly but was structurally undersized (~44 kcal/day/village
// vs the scholar's ~2000/day): no villager-side lever can move the pool's
// fate. The binding constraint is the scholar's fixed draw.
//
// LEVER: on thin days (pantryFreshDays < 2, the Q1 thin gate), the
// scholar's draw becomes a VOICED choice: take half. The choice is always
// voiced — NEVER a silent override of the player's draw (backlog #761
// sense-hostility constraint; canon: "No silent actions."). The actual
// choice UI (full / half / leave it) is a design task for Steve and is OUT
// OF SCOPE; sim-side the policy exercises "take half on thin days" and
// this layer measures the mechanism's economics headless.
//
// IMPLEMENTATION: game-side layer, default-OFF, env-gated (SCHOLARBOWL=1).
// ZERO src/js modifications. Wraps Game.villageMeal + Game.pantryDraw:
// the meal wrapper evaluates thinness BEFORE the draw and raises the
// _sbHalve flag; the pantryDraw wrapper halves `want` (the trust-scaled
// share intent, after the room cap) while the flag stands, then the flag
// clears in a finally. Gate OFF: install() never wraps (byte-identical
// delegation — the proof test's det-gate pins it). The joined-village and
// camp-wild meal branches never call pantryDraw, so the flag is inert
// there. No RNG consumed by the layer: voice line selection is
// deterministic ((day + seed) % lines), reproducible across re-runs.
//
// VOICE: one beat per day max (voiceDay guard), fired from the draw
// wrapper only when the pantry actually holds food (empty-pantry thin
// days are the pristine "No food in the pantry" beat's territory —
// deferring from an empty bin is not a choice). First-person fiction, the
// depositgate/thindefer day-voice pattern: one line/day, deterministic.
// Line varies by DAY (not by speaker — the thindefer per-speaker-key
// repetition nit is avoided by construction: the speaker is the player).
'use strict';

const NS = 'SCHOLARBOWL_B';

function layerOn() {
  return typeof process !== 'undefined' && process.env && process.env.SCHOLARBOWL === '1';
}

// Thin gate: the Q1 thin quintile (pantryFreshDays < 2), the same gate the
// villager-side thindefer-b arm used. Evaluated at the scholar's meal.
function thinDay(Game) {
  try { return Game.pantryFreshDays() < 2; } catch (e) { return false; }
}

// The scholar's bowl, voiced. First-person: the choice is the player's.
// (The choice UI — full / half / leave it — is Steve's design task; the
// sim-side policy exercises "take half on thin days".)
const LINES = [
  "🍽️ You take half your share — 'the bins are thin. Leave the rest for the village.'",
  "🍽️ Half a bowl tonight. The village needs the other half more than you do.",
  "🍽️ You wave off the second scoop — 'half's plenty for me tonight.'",
  "🍽️ The bins are thin. You eat half and push the rest back for whoever's hungrier.",
  "🍽️ Thin day: your bowl stays half-full, and the pantry keeps the other half.",
];

function freshTele() {
  return { thinMeals: 0, halves: 0, savedKcal: 0, voices: 0, errors: 0, beatLines: [] };
}

// install(Game): wrap villageMeal + pantryDraw. Gate OFF: wraps nothing,
// returns a tele that stays all-zero (det-gate pins it).
// Returns { tele, uninstall } — uninstall restores the originals.
function install(Game) {
  const tele = freshTele();
  const seed = (Game && Game.__simSeed) || 0;
  if (!layerOn()) return { tele, uninstall() {} };
  const origMeal = Game.villageMeal;
  const origDraw = Game.pantryDraw;
  if (typeof origMeal !== 'function' || typeof origDraw !== 'function') {
    tele.errors++;
    return { tele, uninstall() {} };
  }
  let voiceDay = -1;

  Game.pantryDraw = function (v, want, opts) {
    if (this._sbHalve && typeof want === 'number' && want > 0) {
      const halved = want / 2;
      tele.halves++;
      tele.savedKcal += Math.round(want - halved);
      // VOICE: the choice is voiced — never a silent override. One beat
      // per day, and only when there is real food to defer (an empty
      // pantry has no choice to voice; pristine's "No food" beat owns it).
      const day = ((this.state && this.state.scholar) || {}).day || 0;
      let hasFood = false;
      try { hasFood = this.pantryFreshKcal() > 0; } catch (e) { tele.errors++; }
      if (hasFood && voiceDay !== day) {
        voiceDay = day;
        tele.voices++;
        const line = LINES[(day + seed) % LINES.length];
        tele.beatLines.push({ day, line });
        try { this.say(line); } catch (e) { tele.errors++; }
        try { this.tele('scholarBowl', { day, choice: 'half', line: line.slice(0, 60) }); } catch (e2) {}
      }
      return origDraw.call(this, v, halved, opts);
    }
    return origDraw.call(this, v, want, opts);
  };

  Game.villageMeal = function () {
    let thin = false;
    try {
      thin = thinDay(this);
      if (thin) tele.thinMeals++;
    } catch (e) { tele.errors++; }
    this._sbHalve = thin;
    try {
      return origMeal.apply(this, arguments);
    } finally {
      this._sbHalve = false;
    }
  };
  // namespace marker (disjoint from thindefer-b's THINDEFER_B / _thinDefer,
  // and from loop-A arm namespaces)
  Game.villageMeal._scholarBowl = NS;
  Game.pantryDraw._scholarBowl = NS;

  return {
    tele,
    uninstall() {
      Game.villageMeal = origMeal;
      Game.pantryDraw = origDraw;
    },
  };
}

module.exports = { install, layerOn, thinDay, LINES, NS };
