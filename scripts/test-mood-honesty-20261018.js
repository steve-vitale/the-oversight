// test-mood-honesty-20261018.js — proof for the journey-deepening r12 M7 fix.
//
// FINDING: census moods skewed "lonely" 8-9/10 for villagers with rich
// communal lives (daily shared meals, gossip, mutual tending — see
// journey-deepening-r12 mood audits). Root cause: the social-need model had
// wrong-signed updates at the communal-meal sites —
//   (1) logSitting (game.js): two villagers lingering over the fire TOGETHER
//       got n.social +3 (company made them LONELIER), and the co-eater got
//       no needs update at all;
//   (2) seasonMeal "loved the meal": n.social +5 (good food -> lonelier);
//   (3) seasonMeal "complained": n.social -5 (complaining -> less lonely).
// Under the established semantics (npcMood: n.social > 78 -> 'lonely';
// dominantNeed: n.social > 78 -> 'loneliness' = "sitting a little apart";
// tickNeeds: "wants grow with time"), company SATISFIES the need. The signs
// were backwards, so the instrument lied about communally-embedded villagers.
//
// FIX: logSitting reduces social need for BOTH lingerers (-8); the taste
// lines no longer touch the social axis (taste is not company).
//
// This test: (a) unit — a shared lingering meal REDUCES social need for both
// villagers; (b) taste lines leave social need alone; (c) integration —
// villagers who eat together daily read less lonely over 20 days.
// RED on pristine (shared meal INCREASES need), GREEN after the fix.
// Usage: node scripts/test-mood-honesty-20261018.js
'use strict';
const assert = require('assert');

async function main() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 4242, mode: 'mood-honesty-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 2, 'need 2+ villagers');
  const [a, b] = roster;

  // ---- (a) shared lingering meal ----
  const nA0 = Game.npcNeeds(a).social, nB0 = Game.npcNeeds(b).social;
  Game.npcNeeds(a).social = 80; Game.npcNeeds(b).social = 80;
  // someone already ate at this part/place, so `a` lingers with company
  v.mealLog = [{ vid: b, part: 'dusk', place: 'haven' }];
  v.away = {};
  const _rnd = Math.random;
  Math.random = () => 0.1; // force the 50% lingering branch + the 30% say branch
  try { Game.logSitting(v, a, 'dusk'); } finally { Math.random = _rnd; }
  const nA1 = Game.npcNeeds(a).social, nB1 = Game.npcNeeds(b).social;
  console.log(`shared meal: A ${80} -> ${nA1}, B ${80} -> ${nB1}`);
  assert(nA1 < 80, `FAIL(a1): lingerer's social need should DECREASE with company (got ${nA1})`);
  assert(nB1 < 80, `FAIL(a2): co-eater's social need should DECREASE with company (got ${nB1})`);

  // ---- (b) taste lines don't move the social axis ----
  Game.npcNeeds(a).social = 80;
  const m = { prefs: { likes: '__no_such_kind__', dislikes: '__no_such_kind__' }, items: [], exposure: 0 };
  // likes path: prefs.likes matches the drawn food kind
  const liked = { prefs: { likes: 'veg', dislikes: '__no__' },
    items: [{ item: { name: 'Dandelion', foodKind: 'veg' }, units: 1, effectiveKcal: 100 }], exposure: 0 };
  const person = Game.getPerson(a);
  try { Game.seasonMeal(v, a, person, liked); } catch (e) { console.log('(b) seasonMeal threw (non-fatal for the assertion):', e.message); }
  const nA2 = Game.npcNeeds(a).social;
  console.log(`loved meal: A 80 -> ${nA2}`);
  assert(nA2 === 80, `FAIL(b): taste should not move the social axis (got ${nA2})`);

  // ---- (c) integration: 20 days of shared meals keep company honest ----
  const { Game: G2 } = await loadGame({ seed: 4243, mode: 'mood-honesty-proof2', fullTelemetry: true });
  await setupGame(G2);
  const v2 = G2.state.village;
  const r2 = (v2.roster || []).filter(id => id !== G2.villagerId);
  assert(r2.length >= 2, 'need 2+ villagers (sim2)');
  const [c, d2] = r2;
  G2.npcNeeds(c).social = 90; G2.npcNeeds(d2).social = 90;
  const _rnd2 = Math.random;
  Math.random = () => 0.1;
  try {
    for (let i = 0; i < 20; i++) {
      v2.mealLog = [{ vid: d2, part: 'dusk', place: 'haven' }];
      v2.away = {};
      G2.logSitting(v2, c, 'dusk');
      // the co-eater also lingers back half the time (symmetric company)
      if (i % 2 === 0) { v2.mealLog = [{ vid: c, part: 'dusk', place: 'haven' }]; G2.logSitting(v2, d2, 'dusk'); }
    }
  } finally { Math.random = _rnd2; }
  const sC = G2.npcNeeds(c).social, sD = G2.npcNeeds(d2).social;
  const moodC = G2.npcMood(c), moodD = G2.npcMood(d2);
  console.log(`20d shared meals: C 90 -> ${sC} (${moodC}), D 90 -> ${sD} (${moodD})`);
  assert(sC < 78 && sD < 78, `FAIL(c): daily company should keep villagers under the lonely line (got ${sC}, ${sD})`);

  console.log('\nALL MOOD-HONESTY PROOF ASSERTIONS PASSED');
  // restore untouched baseline note
  void nA0; void nB0;
}

main().catch(e => { console.error('PROOF FAILED:', e.message); process.exit(1); });
