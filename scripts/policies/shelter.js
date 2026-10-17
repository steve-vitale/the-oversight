// shelter policy layer — the muster discipline with a real mechanism.
//
// SHELTER=1 (default OFF — unset means the wrapper delegates to its parent
// byte-identically; the proof test's RED phase pins that).
//
// The diagnosis (evidence/2026-10-15/sim-siegeroster.md): the siegeroster
// muster beat fired 63 times and read well — "📯 MUSTER — The Reunion hunts
// near Haven, and it is beyond us. Everyone inside..." — but villagers kept
// dying at the identical rate because no verb existed to move them. "The
// beat is a narration without a mechanism."
//
// This layer keeps the proven beat and wires it to the shelter verb
// (src/js/shelter.js): threat detected → muster beat + everyone inside;
// threat gone → stand-down beat + all-clear. The verb does the honest work:
// sheltered villagers can't be wild-jumped, can't be raid-drafted, and
// don't work while mustered (the cost is lost production — the policy's
// episode-length pressure, not a verb bug).
//
// Design calls (documented, Steve can overrule):
// - Everyone shelters; no fighting watch is held out. Wave-4+ vs villagers
//   is a 1-2 round death (siegeroster diagnosis) — holding a watch out is
//   spending lives for pride. A future arm that wants a watch passes
//   holdouts to shelterEveryoneBut.
// - Unmet raiders linger and gorge (the existing havenGrowth mechanic) —
//   the muster trades pantry for lives, legibly. Driving raiders off is
//   the scholar's job (the crisis chain already exists for that).
'use strict';
const { capable } = require('./capable');

function shelterOn() { return process.env.SHELTER === '1'; }

// The proven muster beat (sim-siegeroster 2026-10-15 — "fires and reads
// well"). Threat-named, episode-deduped by the caller.
function musterBeat(Game, threatName) {
  const name = threatName || 'something';
  try {
    Game.say(`📯 MUSTER — ${name} hunts near Haven, and it is beyond us. Everyone inside. No one walks the treeline alone — the garden crews double up, the hunters stand down. We outlast it.`);
  } catch (e) {}
}

// musterCheck: the episode manager. 2026-10-17 (journey crisis r20): the
// game owns the episode now (src/js/shelter.js — shelterMusterCheck, fired
// daily from progDaily). The policy delegates — no double beats, no double
// musters. SHELTER=1 keeps working for bot arms: the game musters, the
// policy just mirrors the episode flag into ctx.
function musterCheck(Game, ctx) {
  try { if (Game.shelterMusterCheck) Game.shelterMusterCheck(); } catch (e) {}
  ctx._shelterMustered = !!(((Game.state || {}).village || {}).shelterMustered);
}

function withShelter(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    upkeep(Game, ctx) {
      base.upkeep(Game, ctx);
      if (!shelterOn()) return; // gate off: pure delegation above
      try { musterCheck(Game, ctx); } catch (e) {}
    },
  });
}

const capableshelter = withShelter(
  capable, 'capableshelter',
  'capable + shelter muster layer (SHELTER=1): wave-4+ near Haven → muster beat + everyone inside; all-clear on stand-down'
);

module.exports = { capableshelter, withShelter, shelterOn, musterCheck, musterBeat };
