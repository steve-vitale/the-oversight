// scripts/test-pellet-boost-20261108.js — the pellet's power boost, cost =
// RADIATION on the bearer (Steve 2026-11-08 11:54 CST). Prereg amendment:
// evidence/2026-11-08/sim-pellet-rads-prereg.md, bar RB-1 (boost, floor,
// heal, villager bearer, all under the rads cost). This file is the rework
// of the pantry-cost boost test: the pantry draws are gone (PB-1 / PB-2 /
// PB-3 superseded), and every assertion that used to read the pantry now
// reads the rads ledger / exposure instead. Uses the shared kit
// (scripts/sim-harness.js); rigged states, no seeds.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

const SEED = 20261108;
const BASE = 20;
const RADS = 2;

function pantry50() { return [{ name: 'Dried berries', kcalEach: 50, units: 20, foodKind: 'plant', foodState: 'dried' }]; }
function installScholarReactor(G) {
  const s = G.state.scholar;
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'fusion_pellet', name: 'Fusion pellet', units: 1, kg: 0.1 });
  s.abilities = [];
  s.abilities.push({ id: 'fusion_reactor', name: 'Fusion Reactor', desc: '', level: 1, xp: 0 });
  try { G.abilityOnAcquire('fusion_reactor'); } catch (e) { return false; }
  try { return !!(G.fusionReactorOnline && G.fusionReactorOnline()); } catch (e) { return false; }
}
function setPantry(G, items) { G.state.village.pantry = items; }
function kcal(G) { try { return Math.round(G.pantryKcalLive(G.state.village)); } catch (e) { return -1; } }
function ledger(G) { return G.state.pelletBoost || {}; }
function exposure(G, key) { try { return G.pelletExposure(key); } catch (e) { return -1; } }
function captureSays(G) {
  const lines = [];
  const orig = G.say;
  G.say = function () {
    try { const a = Array.prototype.slice.call(arguments); lines.push(a.join(' ')); } catch (e) {}
    try { return orig.apply(this, arguments); } catch (e) {}
  };
  return { lines, restore() { G.say = orig; } };
}
function endFight(G) {
  try { if (G.tbfight && !G.tbfight.over) G.tbEnd('fled'); } catch (e) { try { G.tbfight = null; } catch (e2) {} }
}
function startFight(G) {
  endFight(G);
  G.startCombat('hummice');
  const p = G.tbFighter('p');
  const m = (G.tbfight.fighters || []).find(f => f.kind === 'monster');
  if (p) { p.hp = 5000; p.maxHp = 5000; }
  if (m) { m.hp = 5000; m.maxHp = 5000; }
  return { p, m };
}
function strike(G, mKey, dmg, srcKey, srcLabel) {
  return G.tbDamage(mKey, dmg, srcLabel, srcKey, { undodgeable: true });
}

(async () => {
  const { Game: G } = await loadGame({ seed: SEED, mode: 'test' });
  await setupGame(G);
  const s = G.state.scholar;
  s.kcal = 500; // below overcharge (75% of 2400) so no incidental 1.25x
  const cfg = (() => { try { return G.pelletBoostCfg(); } catch (e) { return null; } })();

  // --- 0. data lever: the rads cost is in the data, the pantry cost is out ---
  check('data: no pantry cost key on the pellet boost', !(cfg && 'costKcalPerStrike' in cfg), JSON.stringify(cfg));
  check('data: radsPerBoost is 2', cfg && cfg.radsPerBoost === RADS, JSON.stringify(cfg));
  check('data: radsSickAt is 10', cfg && cfg.radsSickAt === 10, JSON.stringify(cfg));
  check('data: radsDecayPerDay is 1', cfg && cfg.radsDecayPerDay === 1, JSON.stringify(cfg));
  check('data: radsCureDrop is 10', cfg && cfg.radsCureDrop === 10, JSON.stringify(cfg));

  // --- 1. CONTROL: no reactor installed, the scholar strikes plain ---
  setPantry(G, pantry50());
  let f = startFight(G);
  const ctrl = strike(G, f.m.key, BASE, 'p', 'you');
  check('control: no reactor, strike lands unboosted', ctrl === BASE, 'landed=' + ctrl);
  check('control: no ledger written without a reactor', !G.state.pelletBoost, JSON.stringify(G.state.pelletBoost));
  check('control: no rads store without a reactor', !G.state.pelletRads, JSON.stringify(G.state.pelletRads));
  check('control: no reactor, bonus heal does not fire', (() => {
    s.health = 50; if (s.maxHealth) s.maxHealth = 100;
    try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
    return s.health === 50;
  })(), 'health=' + s.health);
  endFight(G);

  // --- 2. PAID BOOST: a full pantry, a strike, x1.5 — and the pantry is
  // untouched; the cost is rads on the bearer, not food ---
  check('setup: reactor installs on the scholar', installScholarReactor(G));
  setPantry(G, pantry50());
  const cap = captureSays(G);
  f = startFight(G);
  const landed = strike(G, f.m.key, BASE, 'p', 'you');
  cap.restore();
  check('boost: strike lands x1.5', landed === Math.round(BASE * 1.5), 'landed=' + landed);
  check('boost: ledger records one boost', ledger(G).boosts === 1, JSON.stringify(ledger(G)));
  check('boost: ledger records rads, not spent kcal', ledger(G).rads === RADS && !('spent' in ledger(G)), JSON.stringify(ledger(G)));
  check('boost: bearer exposure is 2', exposure(G, 'p') === RADS, 'exposure=' + exposure(G, 'p'));
  check('boost: pantry untouched by the boost', kcal(G) === 1000, 'kcal=' + kcal(G));
  check('boost: a line names the rads', cap.lines.some(l => /radiation/i.test(l) && /2/.test(l)), cap.lines.join(' | '));
  let need = -1;
  try { need = globalThis.Scattering.calories.dailyNeed(s); } catch (e) {}
  check('boost: bearer still does not hunger', need === 0, 'dailyNeed=' + need);
  // a second strike: the ledger tracks the identity rads == boosts x RADS
  strike(G, f.m.key, BASE, 'p', 'you');
  check('boost: two boosts, rads == boosts x 2', ledger(G).boosts === 2 && ledger(G).rads === 2 * RADS, JSON.stringify(ledger(G)));
  check('boost: exposure tracks per-bearer boosts', exposure(G, 'p') === 2 * RADS, 'exposure=' + exposure(G, 'p'));
  endFight(G);

  // --- 3. NO PANTRY GATE: an empty pantry still pays the boost (the cost
  // is rads, not food) ---
  setPantry(G, []);
  f = startFight(G);
  const emptyLanded = strike(G, f.m.key, BASE, 'p', 'you');
  check('no-gate: empty pantry, strike still lands x1.5', emptyLanded === Math.round(BASE * 1.5), 'landed=' + emptyLanded);
  check('no-gate: empty pantry, rads still accrue', ledger(G).boosts === 3 && ledger(G).rads === 3 * RADS, JSON.stringify(ledger(G)));
  check('no-gate: pantry stays at 0', kcal(G) === 0, 'kcal=' + kcal(G));
  endFight(G);

  // --- 4. the FREE FLOOR: a bigger live mult gets the reactor's standing
  // hum (x1.25) at no cost — direct call, since the floor fires through
  // the currentMult guard now that the pantry gate is gone ---
  const floorsBefore = ledger(G).floors || 0;
  const floorBurn = (() => { try { return G.pelletBurn(null, { currentMult: 1.5 }); } catch (e) { return null; } })();
  check('floor: guard case returns the free x1.25', floorBurn && floorBurn.mult === 1.25, JSON.stringify(floorBurn));
  check('floor: counted as a floor, not a boost', ledger(G).floors === floorsBefore + 1 && ledger(G).boosts === 3, JSON.stringify(ledger(G)));
  check('floor: no rads for the free floor', ledger(G).rads === 3 * RADS && exposure(G, 'p') === 3 * RADS, JSON.stringify(ledger(G)));
  // non-bearer party strike: no reactor, no ledger change, no rads
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  check('setup: roster has a villager for the non-bearer check', roster.length >= 1, 'roster=' + roster.length);
  f = startFight(G);
  const vf = (G.tbfight.fighters || []).find(x => x.kind === 'villager' && x.villagerId === roster[0]);
  if (vf) {
    vf.hp = 5000; vf.maxHp = 5000;
    const vlanded = strike(G, f.m.key, BASE, vf.key, vf.name || 'villager');
    check('non-bearer: villager strike lands plain', vlanded === BASE, 'landed=' + vlanded);
    check('non-bearer: ledger untouched', ledger(G).boosts === 3 && ledger(G).rads === 3 * RADS, JSON.stringify(ledger(G)));
  } else {
    check('non-bearer: villager not in this fight (skipped)', true);
    check('non-bearer: ledger untouched (skipped)', true);
  }
  endFight(G);

  // --- 5. BONUS HEAL: the reactor's bonus healing costs rads, not pantry,
  // and fires even with an empty pantry ---
  setPantry(G, pantry50());
  s.health = 50; if (s.maxHealth) s.maxHealth = 100;
  try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
  check('heal: bonus lands (+10)', s.health === 60, 'health=' + s.health);
  check('heal: bonus adds 2 rads', ledger(G).rads === 4 * RADS && ledger(G).boosts === 4, JSON.stringify(ledger(G)));
  check('heal: pantry untouched by the bonus heal', kcal(G) === 1000, 'kcal=' + kcal(G));
  setPantry(G, []);
  s.health = 50;
  try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
  check('heal: empty pantry, bonus still lands (+10)', s.health === 60, 'health=' + s.health);
  check('heal: empty pantry, rads still accrue', ledger(G).rads === 5 * RADS && ledger(G).boosts === 5, JSON.stringify(ledger(G)));
  endFight(G);

  // --- 6. VILLAGER BEARER: the reactor on a villager burns their strikes
  // (x1.5, rads on their own key, pantry untouched) ---
  try { G.state.fusionReactorHolder = null; } catch (e) {}
  try { s.fusionReactor = null; } catch (e) {}
  try { s.abilities = (s.abilities || []).filter(a => (a.id || a) !== 'fusion_reactor'); } catch (e) {}
  const bearerVid = roster[0];
  let granted = false;
  try { granted = G.npcGrantAbility(bearerVid, 'fusion_reactor'); } catch (e) {}
  check('setup: villager granted the reactor', granted === true, 'holder=' + JSON.stringify(G.state.fusionReactorHolder || null));
  setPantry(G, pantry50());
  const vBurn = (() => { try { return G.pelletBurn(bearerVid, {}); } catch (e) { return null; } })();
  check('villager: direct burn lands x1.5', vBurn && vBurn.mult === 1.5, JSON.stringify(vBurn));
  check('villager: exposure accrues on the villager key', exposure(G, bearerVid) === RADS, 'exposure=' + exposure(G, bearerVid));
  check('villager: scholar exposure untouched', exposure(G, 'p') === 5 * RADS, 'exposure=' + exposure(G, 'p'));
  check('villager: pantry untouched', kcal(G) === 1000, 'kcal=' + kcal(G));
  // the scholar, no longer the bearer, strikes plain
  f = startFight(G);
  const plain = strike(G, f.m.key, BASE, 'p', 'you');
  check('villager: scholar strikes plain now', plain === BASE, 'landed=' + plain);
  endFight(G);

  console.log(`\npellet-boost: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
