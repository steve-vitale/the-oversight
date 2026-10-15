// PROOF TEST: contest gift sheets lean toward the paths you hold (2026-10-15).
//
// contests.js _cxPrizeAbilityOffer computes a steering weight per bag entry
// (PATH STEERING, 2026-10-14: +2 for a path you hold 2+ of, +0.5 for 1;
// uncommitted build-arounds 0.1) and sorts the bag by it, then drew every
// offer with a UNIFORM random splice, so the weights did nothing
// (diagnosis 2026-10-15, issue 4). After the fix the draw is weighted by
// the same numbers: one Math.random per offer, as before.
//
// Measure: hold 2 abilities of one path, open 300 gift sheets with
// shapeOffers stubbed (it forces one on-path offer by itself), count the
// mean number of offers on that path. Uniform draw ≈ the path's share of
// the bag (×3); weighted draw is clearly higher.
// RED on master (the mean sits near the uniform expectation).
'use strict';
const K = require('./godpath/lib');

(async () => {
  const T = K.reporter('gift-steering');
  const G = await K.load({ seed: 20261015 });
  K.newRun(G);
  G.state.systemArrived = true;
  K.openSlots(G, 6);
  const s = G.state.scholar;
  const A = G.data.abilities || [];
  const giftTiers = ['utility', 'wacky', 'underpowered', 'uncommon', 'rare', 'combat', 'social'];
  const isGift = (a) => a.unlock && a.unlock.type === 'system_offer' && a.lane !== 'skill' && giftTiers.indexOf(a.tier) >= 0;
  // the path with the most gift-bag entries, so the test has room to steer
  const byPath = {};
  for (const a of A) if (isGift(a) && a.path) (byPath[a.path] = byPath[a.path] || []).push(a.id);
  const path = Object.keys(byPath).sort((x, y) => byPath[y].length - byPath[x].length)[0];
  const held = byPath[path].slice(0, 2);
  s.abilities = held.map(id => ({ id, name: id, desc: '', level: 1, xp: 0 }));
  const bag = A.filter(a => isGift(a) && held.indexOf(a.id) < 0 && a.id !== 'fusion_reactor');
  const share = bag.filter(a => a.path === path || a.alsoPath === path).length / bag.length;
  const contest = { id: 'proof', name: 'Proof', cat: 'show' };
  const _sys = G.sysSay; G.sysSay = () => {};
  // isolate the draw: shapeOffers (godpath.js) adds its own on-path offer
  const _shape = G.shapeOffers; G.shapeOffers = (choices) => choices;
  let sheets = 0, onPath = 0;
  for (let i = 0; i < 300; i++) {
    s.abilityChoices = null;
    if (!G._cxPrizeAbilityOffer(contest)) continue;
    sheets++;
    for (const c of s.abilityChoices) { const d = A.find(a => a.id === c.id) || {}; if (d.path === path || d.alsoPath === path) onPath++; }
  }
  G.sysSay = _sys; G.shapeOffers = _shape;
  const mean = onPath / Math.max(1, sheets);
  const uniform = 3 * share;
  console.log(`  path ${path}: held ${held.join(',')}; bag share ${(share * 100).toFixed(1)}%; uniform mean ${uniform.toFixed(2)}; measured mean ${mean.toFixed(2)} over ${sheets} sheets`);
  T.ok('gift sheets open', sheets >= 290, String(sheets));
  // the draw alone (shapeOffers stubbed): weighted must clearly beat uniform
  T.ok('held paths are steered: mean on-path offers > 1.8x uniform', mean > 1.8 * uniform, mean.toFixed(2) + ' vs ' + uniform.toFixed(2));
  T.done();
})().catch(e => { console.error(e); process.exit(1); });
