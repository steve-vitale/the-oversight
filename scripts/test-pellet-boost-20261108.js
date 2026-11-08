// scripts/test-pellet-boost-20261108.js — pellet boost + cost proofs.
// Prereg: evidence/2026-11-08/sim-pellet-boost-prereg.md (+ amendment A1), bar PB-1.
// Uses the shared kit (scripts/sim-harness.js); rigged states, no seeds.
// RED until the build lands: pelletBurn / pelletBoostCfg / the tbDamage
// call-in / pellet-boost.json do not exist yet.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

const SEED = 20261108;
const COST = 50, FLOOR = 1.25, BOOST = 1.5, BASE = 20;

function pantry50() { return [{ name: 'Dried berries', kcalEach: 50, units: 20, foodKind: 'plant', foodState: 'dried' }]; } // 1000 kcal
function pantry100() { return [{ name: 'Smoked turkey leg', kcalEach: 100, units: 10, foodKind: 'meat', foodState: 'smoked' }]; } // 1000 kcal
function pantry30() { return [{ name: 'Dried berries', kcalEach: 30, units: 1, foodKind: 'plant', foodState: 'dried' }]; } // 30 kcal

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
function ledger(G) { return G.state.pelletBoost || { spent: 0, boosts: 0, floors: 0, lastBoostDay: null }; }
function captureSays(G) {
  const lines = [];
  const orig = G.say;
  G.say = function (m) { lines.push(String(m)); try { return orig.apply(this, arguments); } catch (e) {} };
  lines.restore = () => { G.say = orig; };
  return lines;
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
  const says = captureSays(G);
  const s = G.state.scholar;

  // --- data lever (RED until pellet-boost.json joins the boot data list) ---
  check('data: pelletBoost JSON loaded', !!(G.data && G.data.pelletBoost && G.data.pelletBoost._doc && G.data.pelletBoost.costKcalPerStrike === 50),
    'Game.data.pelletBoost=' + JSON.stringify((G.data && G.data.pelletBoost) || null));
  check('cfg: pelletBoostCfg reads the lever', typeof G.pelletBoostCfg === 'function' &&
    G.pelletBoostCfg().costKcalPerStrike === 50 && G.pelletBoostCfg().boostMult === 1.5 &&
    G.pelletBoostCfg().floorMult === 1.25,
    typeof G.pelletBoostCfg === 'function' ? JSON.stringify(G.pelletBoostCfg()) : 'no pelletBoostCfg');

  // --- 1. control, no reactor: a plain strike is unboosted, no ledger ---
  s.kcal = 500; // below overcharge (75% of 2400) so no incidental 1.25x
  let f = startFight(G);
  check('control: fight starts', !!(f.p && f.m), 'p=' + !!f.p + ' m=' + !!f.m);
  let landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('control: no-reactor strike is unboosted', landed === BASE, 'landed=' + landed);
  check('control: no ledger without a reactor', !G.state.pelletBoost, JSON.stringify(G.state.pelletBoost || null));
  // healing control, no reactor: the feasted form does nothing
  s.health = 50; if (s.maxHealth) s.maxHealth = 100;
  try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
  check('control: no-reactor heal bonus does not fire', s.health === 50, 'health=' + s.health);

  // --- 2. floor free, pantry empty: x1.25, no spend, still fed ---
  check('setup: reactor installs on the scholar', installScholarReactor(G), 'online=' + (G.fusionReactorOnline && G.fusionReactorOnline()));
  setPantry(G, []);
  check('setup: pantry is empty', kcal(G) === 0, 'kcal=' + kcal(G));
  s.kcal = 500;
  f = startFight(G);
  landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('floor: empty-pantry strike lands x1.25', landed === Math.round(BASE * FLOOR), 'landed=' + landed);
  check('floor: ledger counts a floor, no spend', ledger(G).floors === 1 && ledger(G).boosts === 0 && ledger(G).spent === 0,
    JSON.stringify(ledger(G)));
  let need = -1;
  try { need = globalThis.Scattering.calories.dailyNeed(s); } catch (e) {}
  check('floor: bearer still does not hunger', need === 0, 'dailyNeed=' + need);

  // --- 3. boost paid, 50-kcal units: x1.5, exactly 50 drawn ---
  setPantry(G, pantry50());
  check('setup: 50-kcal pantry reads 1000', kcal(G) === 1000, 'kcal=' + kcal(G));
  says.length = 0;
  f = startFight(G);
  landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('boost: 50-kcal pantry strike lands x1.5', landed === Math.round(BASE * BOOST), 'landed=' + landed);
  check('boost: ledger counts one boost, 50 spent', ledger(G).boosts === 1 && ledger(G).spent === 50,
    JSON.stringify(ledger(G)));
  check('boost: pantry lighter by exactly 50', kcal(G) === 950, 'kcal=' + kcal(G));
  check('boost: line names the cost', says.some(l => /REACTOR/i.test(l) && /50/.test(l)), says.join(' | ').slice(0, 300));
  // A non-bearer party member's strike in the same fight touches nothing.
  const nf = (G.tbfight.fighters || []).find(x => x.kind === 'villager');
  if (nf) {
    nf.hp = 5000; nf.maxHp = 5000;
    const b0 = ledger(G).boosts, s0 = ledger(G).spent, k0 = kcal(G);
    strike(G, f.m.key, BASE, nf.key, nf.name || 'villager');
    check('non-bearer: party strike touches no ledger, no pantry', ledger(G).boosts === b0 && ledger(G).spent === s0 && kcal(G) === k0,
      'ledger=' + JSON.stringify(ledger(G)) + ' kcal=' + kcal(G));
  } else {
    check('non-bearer: a villager fights alongside the scholar', false, 'no villager fighter');
  }

  // --- 4. overshoot, 100-kcal units: x1.5, 100 drawn and honestly recorded ---
  setPantry(G, pantry100());
  check('setup: 100-kcal pantry reads 1000', kcal(G) === 1000, 'kcal=' + kcal(G));
  says.length = 0;
  f = startFight(G);
  landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('overshoot: strike lands x1.5', landed === Math.round(BASE * BOOST), 'landed=' + landed);
  check('overshoot: ledger records the actual 100 drawn', ledger(G).boosts === 2 && ledger(G).spent === 150,
    JSON.stringify(ledger(G)));
  check('overshoot: pantry lighter by 100, not 50', kcal(G) === 900, 'kcal=' + kcal(G));
  check('overshoot: line names 100, not 50', says.some(l => /REACTOR/i.test(l) && /100/.test(l)), says.join(' | ').slice(0, 300));

  // --- 5. pantry short: floor only, no spend ---
  setPantry(G, pantry30());
  check('setup: short pantry reads 30', kcal(G) === 30, 'kcal=' + kcal(G));
  f = startFight(G);
  landed = strike(G, f.m.key, BASE, 'p', 'you');
  check('short: strike lands x1.25 floor only', landed === Math.round(BASE * FLOOR), 'landed=' + landed);
  check('short: no new boost, no new spend', ledger(G).boosts === 2 && ledger(G).spent === 150,
    JSON.stringify(ledger(G)));
  check('short: pantry untouched at 30', kcal(G) === 30, 'kcal=' + kcal(G));

  // --- 6. healing boost: bonus heal draws 50, base heal lands regardless ---
  setPantry(G, pantry50());
  s.health = 50; if (s.maxHealth) s.maxHealth = 100;
  says.length = 0;
  const spentBefore = ledger(G).spent, boostsBefore = ledger(G).boosts;
  try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
  check('heal: bonus heal lands (+10 on a +20 heal)', s.health === 60, 'health=' + s.health);
  check('heal: bonus draws 50 from the pantry', ledger(G).spent === spentBefore + 50 && ledger(G).boosts === boostsBefore + 1 && kcal(G) === 950,
    'ledger=' + JSON.stringify(ledger(G)) + ' kcal=' + kcal(G));
  // healing with a short pantry: base heal already landed (preHp 30 -> 50
  // happened before the form ran); the BONUS must not fire.
  setPantry(G, pantry30());
  s.health = 50;
  const spentBefore2 = ledger(G).spent, boostsBefore2 = ledger(G).boosts;
  try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
  check('heal: short pantry, no bonus heal', s.health === 50 && ledger(G).spent === spentBefore2 && ledger(G).boosts === boostsBefore2,
    'health=' + s.health + ' ledger=' + JSON.stringify(ledger(G)));

  // --- 7. villager bearer: their own strikes burn, others do not ---
  // Move the reactor off the scholar first (revoke + clear the holder).
  try { G.state.fusionReactorHolder = null; } catch (e) {}
  try { s.fusionReactor = null; } catch (e) {}
  try { s.abilities = (s.abilities || []).filter(a => (a.id || a) !== 'fusion_reactor'); } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  check('setup: a roster villager exists for the bearer test', roster.length >= 2, 'roster=' + roster.length);
  const bearerVid = roster[0], otherVid = roster[1];
  let granted = false;
  try { granted = G.npcGrantAbility(bearerVid, 'fusion_reactor'); } catch (e) {}
  check('setup: villager granted the reactor', granted === true && G.state.fusionReactorHolder && G.state.fusionReactorHolder.vid === bearerVid,
    'holder=' + JSON.stringify(G.state.fusionReactorHolder || null));
  setPantry(G, pantry50());
  f = startFight(G);
  const vf = (G.tbfight.fighters || []).find(x => x.kind === 'villager' && x.villagerId === bearerVid);
  check('setup: bearer villager fights', !!vf, 'fighters=' + (G.tbfight.fighters || []).map(x => x.kind + ':' + (x.villagerId || x.key)).join(','));
  if (vf) {
    vf.hp = 5000; vf.maxHp = 5000;
    const b0 = ledger(G).boosts, s0 = ledger(G).spent, k0 = kcal(G);
    const vlanded = strike(G, f.m.key, BASE, vf.key, vf.name || 'villager');
    check('villager-bearer: boosted strike lands x1.5', vlanded === Math.round(BASE * BOOST), 'landed=' + vlanded);
    check('villager-bearer: ledger + pantry record the burn', ledger(G).boosts === b0 + 1 && ledger(G).spent === s0 + 50 && kcal(G) === k0 - 50,
      'ledger=' + JSON.stringify(ledger(G)) + ' kcal=' + kcal(G));
  }
  // The scholar, a non-bearer while the villager holds the reactor, strikes
  // plain and touches nothing.
  const b0 = ledger(G).boosts, s0 = ledger(G).spent, k0 = kcal(G);
  const slanded = strike(G, f.m.key, BASE, 'p', 'you');
  check('non-bearer: scholar strike is unboosted while the villager bears', slanded === BASE, 'landed=' + slanded);
  check('non-bearer: scholar strike touches no ledger, no pantry', ledger(G).boosts === b0 && ledger(G).spent === s0 && kcal(G) === k0,
    'ledger=' + JSON.stringify(ledger(G)) + ' kcal=' + kcal(G));

  says.restore();
  endFight(G);
  console.log(`\npellet-boost: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
