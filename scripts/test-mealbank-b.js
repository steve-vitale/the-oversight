#!/usr/bin/env node
// test-mealbank-b.js — proof for the loop-B ARM 3 mealbank layer
// (food-economy, 2026-10-20, answers backlog #182 PACK-DEPENDENCE FRAGILITY).
//
// Real RED -> GREEN on a live Game, no mocks.
//
// RED (gate off): hungry scholar + stocked pantry + empty pack ->
//   the base daily's pre-fill fires real takeFromPantry calls (the bind the
//   arm gates is real — without it the proof cannot go RED).
// NON-AGGRESSION (gate off byte-identical): base policy vs wrapped policy
//   (MEALBANK unset), 20 days, same seed -> identical day hashes.
// GREEN (gate on): same fixture + banked pack (>= 3x fullLine edible) ->
//   takeFromPantry calls are REFUSED (real takes == 0), the refused counter
//   climbs, pack food still gets eaten (Game.eat works), exactly one voice
//   line per day.
// RED-REVERSAL (gate on, pack below the floor): the take flows through the
//   original verb (real kcal drawn), refused == 0 — the guarantee re-opens.
// PASS-THROUGH (gate on, physically impossible): away from the hall -> the
//   call reaches the original verb, the ENGINE's own refusal speaks, the
//   refusal is not counted and never silenced.
// VOICE (gate on): two refusals the same day -> one line; next day -> a
//   second, different line (day-keyed variety, never verbatim-adjacent).
// BANK-HONESTY: packBankKcal matches eat()'s predicate exactly (spoiled,
//   inedible, gear excluded) and never banks on meat_human; floorKcal ==
//   MEALBANK_DAYS x fullLine().
//
// Usage: node scripts/test-mealbank-b.js
// (no env vars required; the proof sets MEALBANK per-part via withEnv)
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// KILL PROTOCOL (loop B ARM3 NO-GO at pilot): the mealbank layer was deleted
// after the pilot killed the arm (0 mechanism engagement — the take gate can
// never fire; see evidence/2026-10-20/sim-mealbank-b.md). Degrade gracefully
// so the retained proof documents the pre-kill result instead of crashing.
let mb = null;
try { mb = require('./policies/mealbank-b'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: mealbank layer deleted per kill protocol (NO-GO at pilot); proof was 56/56 RED->GREEN pre-kill — see evidence/2026-10-20/sim-mealbank-b.md');
    process.exit(0);
  }
  throw e;
}

let pass = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL: ' + msg); process.exit(1); }
  pass++;
  console.log('  ok: ' + msg);
}
function withEnv(k, v, fn) {
  const old = process.env[k]; delete process.env[k];
  if (v !== undefined) process.env[k] = v;
  return Promise.resolve().then(fn).finally(() => {
    delete process.env[k];
    if (old !== undefined) process.env[k] = old;
  });
}
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)].join('|');
  } catch (e) { return 'ERR'; }
}
async function runHashed(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'mealbank-test' });
  await setupGame(Game);
  const hashes = [];
  const p = Object.assign({}, policy);
  const od = policy.daily;
  p.daily = (G, ctx) => { hashes.push(dayHash(G)); return od ? od(G, ctx) : undefined; };
  await quietLog(() => runDays(Game, p, { days }));
  return hashes;
}
function pantryKcal(Game) {
  return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function havenXY(Game) {
  const v = Game.state.village || {};
  return [(v.px !== undefined && v.px !== null) ? v.px : 4, (v.py !== undefined && v.py !== null) ? v.py : 4];
}
function parkAtHaven(Game) {
  const [hx, hy] = havenXY(Game);
  Game.map.px = hx; Game.map.py = hy;
  try { Game.state.scholar.insideHaven = true; } catch (e) {}
}
function parkAway(Game) {
  const [hx, hy] = havenXY(Game);
  Game.map.px = hx + 3; Game.map.py = hy + 3;
  try { Game.state.scholar.insideHaven = false; } catch (e) {}
}
// takeCounter: wraps the take verbs OUTSIDE the policy layer to count REAL
// takes (calls that reached the original verb) + pantry kcal deltas.
function takeCounter(Game) {
  const c = { single: 0, singleKcal: 0, bulk: 0 };
  const os = Game.takeFromPantry.bind(Game);
  Game.takeFromPantry = function (idx) {
    const k0 = pantryKcal(Game);
    const r = os(idx);
    c.single++;
    c.singleKcal += Math.max(0, k0 - pantryKcal(Game));
    return r;
  };
  const ob = Game.takeFromPantryBulk.bind(Game);
  Game.takeFromPantryBulk = function (sel) {
    const r = ob(sel);
    c.bulk++;
    return r;
  };
  return c;
}
function sayCapture(Game) {
  const lines = [];
  const os = Game.say.bind(Game);
  Game.say = function (msg) { lines.push(String(msg)); return os(msg); };
  return lines;
}
const WRAPPED = { belongseek: mb.belongmealbank, leadcourt: mb.leadmealbank };
function baseOf(id) {
  // re-require the raw bases (mealbank-b wraps them at require time; the
  // Object.assign copy keeps the original .daily intact)
  return id === 'belongseek' ? require('./policies/belongseek').belongseek
    : require('./policies/leadcourt').leadcourt;
}
// fixture: 10 real days to build a pantry, then a hungry scholar with an
// empty pack. Returns { Game, base, wrapped }.
async function fixture(policyId) {
  const base = baseOf(policyId);
  const wrapped = WRAPPED[policyId];
  const { Game } = await loadGame({ seed: 31, mode: 'mealbank-test' });
  await setupGame(Game);
  await quietLog(() => runDays(Game, base, { days: 10 }));
  const pk = pantryKcal(Game);
  if (pk < 3000) throw new Error('fixture pantry too thin: ' + Math.round(pk) + ' kcal');
  const s = Game.state.scholar;
  s.kcal = 0; // hungry
  s.inventory = []; // empty pack (maximal-take fixture)
  try { s.water = []; } catch (e) {}
  parkAtHaven(Game);
  return { Game, base, wrapped, pkBefore: pk };
}

async function main() {
  for (const policyId of ['belongseek', 'leadcourt']) {
    console.log('=== policy ' + policyId + ' ===');

    console.log('PART 0 — module + gate');
    ok(typeof mb.installWraps === 'function', 'installWraps exported');
    ok(mb.MEALBANK_DAYS === 3, 'MEALBANK_DAYS pre-registered at 3');
    await withEnv('MEALBANK', undefined, async () => { ok(!mb.layerOn(), 'gate OFF when MEALBANK unset'); });
    await withEnv('MEALBANK', '1', async () => { ok(mb.layerOn(), 'gate ON when MEALBANK=1'); });

    console.log('PART 1 — RED (gate off): the natural voluntary-take pattern');
    await withEnv('MEALBANK', undefined, async () => {
      const { Game, base } = await fixture(policyId);
      const c = takeCounter(Game);
      const ctx = {};
      // upkeep (not daily): the parent arm's RED path — no walking, the
      // scholar stays parked at the hall so the top-up actually fires.
      await quietLog(() => base.upkeep(Game, ctx));
      ok(c.single > 0, `RED: base.upkeep fires ${c.single} real takeFromPantry calls (the top-up the arm gates is real)`);
      ok(c.singleKcal > 0, `RED: those takes drew ${Math.round(c.singleKcal)} kcal`);
    });

    console.log('PART 2 — NON-AGGRESSION: gate-off wrapped == raw base');
    const hBase = await withEnv('MEALBANK', undefined, () => runHashed(baseOf(policyId), 32, 20));
    const hWrap = await withEnv('MEALBANK', undefined, () => runHashed(WRAPPED[policyId], 32, 20));
    ok(hBase.length === hWrap.length && hBase.every((h, i) => h === hWrap[i]),
      `NON-AGGRESSION: 20-day day-hashes byte-identical (${hBase.length} days)`);

    console.log('PART 3 — GREEN (gate on, banked pack): takes refused, voiced once');
    await withEnv('MEALBANK', '1', async () => {
      const { Game, wrapped } = await fixture(policyId);
      const floor = mb.floorKcal(Game);
      ok(floor === 3 * mb.fullLineOf(Game), `GREEN setup: floorKcal (${floor}) == 3 x fullLine (${mb.fullLineOf(Game)})`);
      Game.state.scholar.inventory = [
        { name: 'Smoked venison', kcalEach: 800, units: Math.ceil((floor + 3000) / 800), spoilDay: 9999, edible: true },
      ];
      ok(mb.packBankKcal(Game) >= floor, `GREEN setup: pack bank ${mb.packBankKcal(Game)} >= floor ${floor}`);
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const ctx = {};
      mb.installWraps(Game, ctx);
      const k0 = Game.state.scholar.kcal || 0;
      await quietLog(() => { Game.takeFromPantry(0); Game.takeFromPantry(1); });
      ok(c.singleKcal === 0, 'GREEN: 0 real kcal taken from the pantry while the pack is banked');
      ok(ctx._mbRefused === 2, `GREEN: ${ctx._mbRefused} top-up takes refused at the floor gate`);
      ok(ctx._mbRefuseDays === 1, 'GREEN: refusal counted on one day');
      const voice = lines.filter(l => /🎒/.test(l));
      ok(voice.length === 1, `GREEN: exactly one refusal line voiced for the day (got ${voice.length})`);
      await quietLog(() => { try { Game.eat(); } catch (e) {} });
      ok((Game.state.scholar.kcal || 0) > k0, 'GREEN: the banked pack still feeds (Game.eat works) — the guarantee is real');
    });

    console.log('PART 4 — RED-REVERSAL (gate on, pack below the floor): takes flow');
    await withEnv('MEALBANK', '1', async () => {
      const { Game } = await fixture(policyId);
      const floor = mb.floorKcal(Game);
      Game.state.scholar.inventory = [
        { name: 'Dried beans', kcalEach: 750, units: 2, spoilDay: 9999, edible: true },
      ];
      ok(mb.packBankKcal(Game) < floor, `RED-REVERSAL setup: pack bank ${mb.packBankKcal(Game)} < floor ${floor}`);
      const c = takeCounter(Game);
      const ctx = {};
      mb.installWraps(Game, ctx);
      await quietLog(() => { Game.takeFromPantry(0); });
      ok(c.singleKcal > 0, `RED-REVERSAL: the take flowed through the original verb (${Math.round(c.singleKcal)} kcal drawn)`);
      ok(!ctx._mbRefused, 'RED-REVERSAL: nothing refused below the floor');
    });

    console.log('PART 5 — PASS-THROUGH: physically impossible takes reach the engine');
    await withEnv('MEALBANK', '1', async () => {
      const { Game } = await fixture(policyId);
      const floor = mb.floorKcal(Game);
      Game.state.scholar.inventory = [
        { name: 'Smoked venison', kcalEach: 800, units: Math.ceil((floor + 3000) / 800), spoilDay: 9999, edible: true },
      ];
      parkAway(Game); // off the hall tile: "The pantry is in the hall. Your hands are not."
      const c = takeCounter(Game);
      const lines = sayCapture(Game);
      const ctx = {};
      mb.installWraps(Game, ctx);
      await quietLog(() => { Game.takeFromPantry(0); });
      ok(c.single === 1, 'PASS-THROUGH: the call reached the original verb (not swallowed)');
      ok(c.singleKcal === 0, 'PASS-THROUGH: nothing was drawn (engine refusal)');
      ok(!ctx._mbRefused, 'PASS-THROUGH: not counted as a refusal (the engine spoke)');
      ok(lines.some(l => /pantry is in the hall/i.test(l)), "PASS-THROUGH: the engine's own refusal line spoke (not silenced)");
    });

    console.log('PART 6 — VOICE: one line per day max, day-keyed variety');
    await withEnv('MEALBANK', '1', async () => {
      const { Game } = await fixture(policyId);
      const floor = mb.floorKcal(Game);
      Game.state.scholar.inventory = [
        { name: 'Smoked venison', kcalEach: 800, units: Math.ceil((floor + 3000) / 800), spoilDay: 9999, edible: true },
      ];
      const lines = sayCapture(Game);
      const ctx = {};
      mb.installWraps(Game, ctx);
      const d0 = Game.state.scholar.day || 0;
      await quietLog(() => { Game.takeFromPantry(0); Game.takeFromPantry(1); Game.takeFromPantry(2); });
      let voice = lines.filter(l => /🎒/.test(l));
      ok(voice.length === 1, `VOICE: 3 refusals on day ${d0} -> exactly 1 line (got ${voice.length})`);
      Game.state.scholar.day = d0 + 1;
      await quietLog(() => { Game.takeFromPantry(0); });
      voice = lines.filter(l => /🎒/.test(l));
      ok(voice.length === 2, 'VOICE: next day refuses again -> a second line');
      ok(voice[0] !== voice[1], 'VOICE: day-keyed variety — adjacent days never verbatim-adjacent');
    });

    console.log('PART 7 — BANK-HONESTY: eat() predicate, no cannibalism banking');
    await withEnv('MEALBANK', '1', async () => {
      const { Game } = await fixture(policyId);
      Game.state.scholar.inventory = [
        { name: 'Smoked venison', kcalEach: 800, units: 10, spoilDay: 9999, edible: true }, // 8000, edible
        { name: 'Old meat', kcalEach: 500, units: 4, spoilDay: 0, edible: true }, // spoiled
        { name: 'Mystery root', kcalEach: 300, units: 6, spoilDay: 9999, edible: false }, // inedible
        { name: 'Stone knife', kcalEach: 0, units: 1, spoilDay: 9999 }, // gear
        { name: 'Long pork', kcalEach: 900, units: 5, spoilDay: 9999, edible: true, plantId: 'meat_human' }, // cannibalism
      ];
      ok(mb.packBankKcal(Game) === 8000, `BANK-HONESTY: bank == 8000 (spoiled/inedible/gear/human-meat excluded), got ${mb.packBankKcal(Game)}`);
      // eat() feeds from the bankable pool (fills the bar to the cap), and
      // touches nothing it shouldn't:
      Game.state.scholar.kcal = 0;
      const cap = Game.kcalCap();
      await quietLog(() => { try { Game.eat(); } catch (e) {} });
      ok((Game.state.scholar.kcal || 0) >= Math.min(cap, 8000),
        `BANK-HONESTY: eat() fed the scholar from the bankable pool (bar ${(Game.state.scholar.kcal || 0) | 0}/${cap})`);
      const spoil = Game.state.scholar.inventory.find(i => i.name === 'Old meat');
      const myst = Game.state.scholar.inventory.find(i => i.name === 'Mystery root');
      const human = Game.state.scholar.inventory.find(i => i.name === 'Long pork');
      ok(!spoil, 'BANK-HONESTY: the spoiled meat was DISCARDED as rot (engine behavior), not eaten');
      ok(myst && myst.units === 6 && human && human.units === 5,
        'BANK-HONESTY: inedible and human meat were NOT eaten (bankable-only feeding)');
    });
  }
  console.log(`\nPROOF GREEN: ${pass} assertions (RED->GREEN->RED-REVERSAL on a live Game)`);
}
main().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
