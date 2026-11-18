// PROOF: carrier food-gate instrumentation (sim-foodgate-instr-a,
// finding #2557-A). The field-fight encounter row now records the
// food tier + fighter hunger at fight start and which food gate bit
// (tier-gate blocking fieldAct, hunger-gate blocking the 60-kcal Rage
// pay), set by the code that actually checked the gate — never a
// proxy (finding #2553's snapshot-proxy retirement stands).
//   §1 LIVE staged field fights (one harness, seed 7; every fight
//      takes a fresh mulberry32(rngSeed) as opts.rng, so the same rng
//      seed twice is the SAME fight):
//      a. determinism: same rng seed twice -> identical rec, including
//         every foodgate field. Runs FIRST.
//      b. honesty: rec.foodTier === Game.villageFoodTier() and
//         rec.hungerStart === npcNeeds hunger at fight start; rec
//         holds the tier the fight actually ran under.
//      c. tier gate, starving: empty pantry -> tier starving ->
//         fieldAct blocked every round (foodgateTierBlocked
//         'starving', round 1), Rage never fires, no Rage line.
//      d. tier gate, tight: 1-3 days of food -> tier tight, solo
//         fighter above 40% HP -> blocked 'tight' from round 1;
//         the same fighter at 30% HP is NOT tight-blocked (the gate's
//         own condition) and Rage fires.
//      e. hunger gate: hunger 79, secure tier, real Rage -> the
//         60-kcal pay fails (payBlockedRage, payBlockedFirst
//         {id 'rage', kcal 60, hunger 79}), Rage never fires; hunger
//         77 pays (77 + 60/25 = 79.4 < 80) and Rage fires; hunger 0
//         fires and pays honestly (hunger +2 = round(60/25)).
//      f. rageFired agrees with the log: true iff a '(Rage)' line is
//         present; false on every gate-blocked fight.
//      g. no-ability fighter: gpF is still non-null here on a secure
//         tier (the villager's power multiplier is 1.25 when fed, so
//         fieldBegin returns a state) — the record still carries
//         foodTier / hungerStart and no gate flags; on a STARVING
//         tier the power multiplier is sapped to 1
//         (villagerPowerMult), so fieldBegin returns null and there
//         is no fieldAct for the tier gate to block — the gate's bite
//         is observable exactly when the fighter has something to
//         fire, which is the carrier/Rage population.
//      h. trick displacement (finding #2558): the third meeting with
//         the same monster runs the village's learned trick
//         ('contradict') instead of fieldAct — Rage never fires, no
//         gate flags. Per-type isolation: every case below uses a
//         fresh wave-4 monster type (a trick is taught only after
//         TWO observations of one type, so at most two fights share
//         a type and the second still runs fieldAct).
//   §2 Direct fieldAct unit checks (no fight flow): tier starving /
//      tight block with the exact flag values; hunger 79 blocks the
//      rage pay; hunger 0 fires (rageFired, nextMult 2, nextN 3).
//   §3 Driver + analyzer modules load and export their helpers.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Usage: node scripts/test-foodgate-instr-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

function mulberry(a) { return mulberry32(a); }

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}
function fgFields(rec) {
  return JSON.stringify({ foodTier: rec.foodTier, hungerStart: rec.hungerStart,
    holdsRage: rec.holdsRage, gpActive: rec.gpActive,
    foodgateTierBlocked: rec.foodgateTierBlocked, foodgateTierBlockedRound: rec.foodgateTierBlockedRound,
    foodgateTierBlockedCount: rec.foodgateTierBlockedCount, foodgatePayBlocked: rec.foodgatePayBlocked,
    foodgatePayBlockedRage: rec.foodgatePayBlockedRage, foodgatePayBlockedFirst: rec.foodgatePayBlockedFirst,
    rageFired: rec.rageFired, carrierRageHeld: rec.carrierRageHeld, carrierRageFired: rec.carrierRageFired,
    outcome: rec.outcome, rounds: rec.rounds, mDealt: rec.mDealt });
}
function hasRageLine(rec) { return (rec.log || []).some(function (s) { return String(s).indexOf('(Rage)') !== -1; }); }

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'test' });
  if (loadFails && loadFails.length) { console.log('FAIL live module load failures: ' + loadFails.join('; ')); process.exit(1); }
  await setupGame(Game);
  const S = globalThis.Scattering;
  const GP = S && S.Godpath;
  check('Godpath module present (fieldBegin/fieldAct/fieldStrike)', !!(GP && GP.fieldBegin && GP.fieldAct && GP.fieldStrike));
  if (!GP) { console.log('FAIL no Godpath'); process.exit(1); }
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const eulogy = mdef('eulogy');
  check('eulogy def is wave 4', !!(eulogy && eulogy.wave === 4));
  const roster = (Game.state.village.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 2) { console.log('FAIL need 2+ NPCs, have ' + roster.length); process.exit(1); }
  const vid = roster[0], cid = roster[1];
  const village = Game.state.village;
  village.npcAbilities = village.npcAbilities || {};
  const setHealth = function (v, hp) { ((village.health = village.health || {}))[v] = hp; };
  const setHunger = function (v, h) { try { const n = Game.npcNeeds && Game.npcNeeds(v); if (n) n.hunger = h; } catch (e) {} };
  const getHunger = function (v) { try { const n = Game.npcNeeds && Game.npcNeeds(v); return n ? n.hunger : null; } catch (e) { return null; } };
  const setAbilities = function (v, abs) { village.npcAbilities[v] = (abs || []).slice(); };
  // setTier(target): pantry units of 12000 kcal each until
  // villageFoodTier() reads target ('starving' | 'tight' | 'secure').
  // Fails loudly if no unit count 0..8 gives the target.
  function setTier(target) {
    for (let u = 0; u <= 8; u++) {
      village.pantry = u === 0 ? [] : [{ kcalEach: 12000, units: u }];
      let t = null;
      try { t = Game.villageFoodTier ? Game.villageFoodTier() : null; } catch (e) { t = null; }
      if (t === target) return u;
    }
    return -1;
  }
  function fight(opts) {
    opts = opts || {};
    setAbilities(vid, opts.abilities);
    setAbilities(cid, []);
    setHealth(vid, opts.hp == null ? 100 : opts.hp);
    setHealth(cid, 100);
    setHunger(vid, opts.hunger == null ? 0 : opts.hunger);
    const md = mdef(opts.mid || 'eulogy');
    const rec = Game.fieldFight(vid, md, null, { rng: mulberry(opts.seed == null ? 7 : opts.seed) });
    return rec;
  }

  // ---- §1a determinism (runs FIRST) ----
  let u = setTier('secure');
  check('pantry stages secure tier', u >= 0, 'units=' + u);
  const d1 = fight({ abilities: ['rage'], hunger: 0, seed: 7 });
  const d2 = fight({ abilities: ['rage'], hunger: 0, seed: 7 });
  check('determinism: same rng seed twice -> identical rec incl. foodgate fields', fgFields(d1) === fgFields(d2), fgFields(d1) + ' VS ' + fgFields(d2));
  check('determinism control: secure + hunger 0 -> Rage fires', d1.rageFired === true && hasRageLine(d1), 'rageFired=' + d1.rageFired);

  // ---- §1b honesty ----
  check('honesty: rec.foodTier is the live tier', d1.foodTier === 'secure', 'foodTier=' + d1.foodTier);
  check('honesty: rec.hungerStart is the fight-start hunger', d1.hungerStart === 0, 'hungerStart=' + d1.hungerStart);
  check('honesty: holdsRage/gpActive true for a Rage holder', d1.holdsRage === true && d1.gpActive === true);
  check('honesty: no gate flags on the clean control', d1.foodgateTierBlocked === null && d1.foodgatePayBlocked === 0 && d1.foodgatePayBlockedRage === false);

  // ---- §1h trick displacement (finding #2558) ----
  // The third eulogy meeting: the village learned the trick after the
  // first two observations, so the fighter works the trick instead of
  // fieldAct — Rage never fires and no gate flags are set. This is the
  // competing explanation the analyzer's "other" bucket must respect.
  const x3 = fight({ abilities: ['rage'], hunger: 0, mid: 'eulogy', seed: 29 });
  check('trick displacement: third meeting runs the learned trick, not Rage', Array.isArray(x3.trickLog) && x3.trickLog.length > 0 && x3.trickLog[0] === 'contradict' && x3.rageFired === false && !hasRageLine(x3), 'trickLog=' + JSON.stringify(x3.trickLog) + ' rageFired=' + x3.rageFired);

  // ---- §1c tier gate, starving ----
  u = setTier('starving');
  check('pantry stages starving tier', u >= 0, 'units=' + u);
  const s1 = fight({ abilities: ['rage'], hunger: 0, mid: 'audit', seed: 11 });
  check('starving: rec.foodTier starving', s1.foodTier === 'starving', 'foodTier=' + s1.foodTier);
  check('starving: fieldAct tier-blocked from round 1', s1.foodgateTierBlocked === 'starving' && s1.foodgateTierBlockedRound === 1, 'blocked=' + s1.foodgateTierBlocked + ' round=' + s1.foodgateTierBlockedRound);
  check('starving: Rage never fires', s1.rageFired === false && !hasRageLine(s1));
  check('starving: no pay attempted (tier gate runs first)', s1.foodgatePayBlocked === 0 && s1.foodgatePayBlockedRage === false, 'payBlocked=' + s1.foodgatePayBlocked);

  // ---- §1d tier gate, tight ----
  u = setTier('tight');
  check('pantry stages tight tier', u >= 0, 'units=' + u);
  const t1 = fight({ abilities: ['rage'], hunger: 0, hp: 100, mid: 'influencer', seed: 13 });
  check('tight: rec.foodTier tight', t1.foodTier === 'tight', 'foodTier=' + t1.foodTier);
  check('tight: solo fighter above 40% HP is tier-blocked from round 1', t1.foodgateTierBlocked === 'tight' && t1.foodgateTierBlockedRound === 1, 'blocked=' + t1.foodgateTierBlocked + ' round=' + t1.foodgateTierBlockedRound);
  const t2 = fight({ abilities: ['rage'], hunger: 0, hp: 30, mid: 'influencer', seed: 13 });
  check('tight: the same fighter at 30% HP is NOT tight-blocked (gate condition)', t2.foodgateTierBlocked === null, 'blocked=' + t2.foodgateTierBlocked);
  check('tight: low-HP fighter rages (gate did not bite)', t2.rageFired === true && hasRageLine(t2), 'rageFired=' + t2.rageFired);

  // ---- §1e hunger gate ----
  u = setTier('secure');
  check('pantry stages secure tier again', u >= 0, 'units=' + u);
  const h79 = fight({ abilities: ['rage'], hunger: 79, mid: 'algorithm', seed: 17 });
  check('hunger 79: Rage pay hunger-blocked', h79.foodgatePayBlockedRage === true, 'payBlockedRage=' + h79.foodgatePayBlockedRage);
  check('hunger 79: first blocked pay is the 60-kcal Rage pay at hunger 79', !!h79.foodgatePayBlockedFirst && h79.foodgatePayBlockedFirst.id === 'rage' && h79.foodgatePayBlockedFirst.kcal === 60 && h79.foodgatePayBlockedFirst.hunger === 79, JSON.stringify(h79.foodgatePayBlockedFirst));
  check('hunger 79: Rage never fires', h79.rageFired === false && !hasRageLine(h79));
  check('hunger 79: tier gate did not bite (secure)', h79.foodgateTierBlocked === null);
  const h77 = fight({ abilities: ['rage'], hunger: 77, mid: 'eater', seed: 17 });
  check('hunger 77: the pay goes through (77 + 60/25 = 79.4 < 80) and Rage fires', h77.rageFired === true && hasRageLine(h77) && h77.foodgatePayBlockedRage === false, 'rageFired=' + h77.rageFired);
  const h0 = fight({ abilities: ['rage'], hunger: 0, mid: 'strike', seed: 19 });
  check('hunger 0: Rage fires and pays honestly (hunger +2 = round(60/25))', h0.rageFired === true && getHunger(vid) === 2, 'hungerAfter=' + getHunger(vid));

  // ---- §1f rageFired agrees with the log ----
  check('rageFired agrees with the log on every staged fight', [d1, s1, t1, t2, h79, h77, h0, x3].every(function (r) { return r.rageFired === hasRageLine(r); }));

  // ---- §1g no-ability fighter ----
  u = setTier('secure');
  const n1 = fight({ abilities: [], hunger: 0, mid: 'congregation', seed: 23 });
  check('no abilities: food values present, no gate flags on a secure tier', n1.foodTier === 'secure' && n1.hungerStart === 0 && n1.foodgateTierBlocked === null && n1.foodgatePayBlocked === 0 && n1.rageFired === false, 'foodTier=' + n1.foodTier + ' blocked=' + n1.foodgateTierBlocked);
  u = setTier('starving');
  const n2 = fight({ abilities: [], hunger: 0, mid: 'congregation', seed: 23 });
  check('no abilities: starving tier saps power to 1, fieldBegin returns null, no gate flag to set', n2.gpActive === false && n2.foodgateTierBlocked === null && n2.rageFired === false, 'gpActive=' + n2.gpActive + ' blocked=' + n2.foodgateTierBlocked);
  const fbStarve = (function () { setTier('starving'); setAbilities(vid, []); return GP.fieldBegin(Game, vid, []); })();
  const fbSecure = (function () { setTier('secure'); setAbilities(vid, []); return GP.fieldBegin(Game, vid, []); })();
  check('unit: fieldBegin with no abilities is null on starving, non-null on secure', fbStarve === null && fbSecure !== null, 'starving=' + fbStarve + ' secure=' + !!fbSecure);

  // ---- §2 direct fieldAct unit checks ----
  function directAct(opts) {
    opts = opts || {};
    setTier(opts.tier || 'secure');
    setAbilities(vid, opts.abilities || ['rage']);
    setHealth(vid, opts.hp == null ? 100 : opts.hp);
    setHunger(vid, opts.hunger == null ? 0 : opts.hunger);
    const G = GP.fieldBegin(Game, vid, village.npcAbilities[vid]);
    if (!G) return { noG: true };
    const out = GP.fieldAct(G, { round: 1, vHp: opts.hp == null ? 100 : opts.hp, vHpMax: 100,
      lead: { hp: 500, maxHp: 1000 }, members: [{ hp: 500 }], log: [], vName: 'T', mName: 'eulogy' });
    return { G: G, out: out };
  }
  const uStarve = directAct({ tier: 'starving' });
  check('unit: starving tier blocks fieldAct with the exact flag', !uStarve.noG && uStarve.out.consumed === false && uStarve.G.tierBlocked === 'starving' && uStarve.G.tierBlockedRound === 1 && uStarve.G.tierBlockedCount === 1, JSON.stringify({ blocked: uStarve.G && uStarve.G.tierBlocked, round: uStarve.G && uStarve.G.tierBlockedRound }));
  const uTight = directAct({ tier: 'tight', hp: 100 });
  check('unit: tight tier blocks a solo healthy fighter', !uTight.noG && uTight.out.consumed === false && uTight.G.tierBlocked === 'tight', JSON.stringify({ blocked: uTight.G && uTight.G.tierBlocked }));
  const uTightLow = directAct({ tier: 'tight', hp: 30 });
  check('unit: tight tier does not block a fighter at 30% HP', !uTightLow.noG && uTightLow.G.tierBlocked == null, JSON.stringify({ blocked: uTightLow.G && uTightLow.G.tierBlocked }));
  const uH79 = directAct({ tier: 'secure', hunger: 79 });
  check('unit: hunger 79 blocks the Rage pay', !uH79.noG && uH79.out.consumed === false && uH79.G.payBlockedRage === true && uH79.G.payBlockedFirst && uH79.G.payBlockedFirst.kcal === 60 && uH79.G.payBlockedFirst.hunger === 79 && !uH79.G.rageFired, JSON.stringify(uH79.G && uH79.G.payBlockedFirst));
  const uH0 = directAct({ tier: 'secure', hunger: 0 });
  check('unit: hunger 0 fires Rage (rageFired, nextMult 2, nextN 3)', !uH0.noG && uH0.out.consumed === true && uH0.G.rageFired === true && uH0.G.nextMult === 2 && uH0.G.nextN === 3, JSON.stringify({ fired: uH0.G && uH0.G.rageFired, mult: uH0.G && uH0.G.nextMult, n: uH0.G && uH0.G.nextN }));

  // ---- §3 driver + analyzer modules load ----
  let driverOk = false, analyzerOk = false;
  try { const d = require('./foodgate-driver-a.js'); driverOk = !!(d && typeof d.oneRun === 'function' && typeof d.loadWave4Ids === 'function'); } catch (e) { driverOk = false; }
  check('driver module loads and exports oneRun/loadWave4Ids', driverOk);
  try { const a = require('./analyze-foodgate-a.js'); analyzerOk = !!(a && typeof a.analyze === 'function'); } catch (e) { analyzerOk = false; }
  check('analyzer module loads and exports analyze', analyzerOk);

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(function (e) { console.error(e.stack); process.exit(1); });
