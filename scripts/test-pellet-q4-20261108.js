// scripts/test-pellet-q4-20261108.js — Q4: a feast-surge spend counts even
// when the spender can't eat anymore (Steve 2026-11-08 07:03 CST), plus the
// pellet-pass rule untouched (PB-5 smoke). Prereg:
// evidence/2026-11-08/sim-pellet-boost-prereg.md, bars PB-4 / PB-5.
// Uses the shared kit (scripts/sim-harness.js); rigged states, no seeds.
// RED until the build lands: the 'reactor' path in _spendFeastedPower does
// not exist yet.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

const SEED = 20261108;
const BASE = 20;

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
  const origSay = G.say;
  G.say = function () { try { return origSay.apply(this, arguments); } catch (e) {} };
  const s = G.state.scholar;
  const prog = s.prog || (s.prog = {});

  // --- 1. a PAID reactor boost marks the feast surge (scholar) ---
  check('setup: reactor installs on the scholar', installScholarReactor(G));
  s.kcal = 500;
  setPantry(G, pantry50());
  prog.feastSurgeUsed = false; prog.feastSurgeBy = null; prog.feastSurge = 1.5; // arming, untouched by the reactor path
  let f = startFight(G);
  strike(G, f.m.key, BASE, 'p', 'you');
  check('q4: paid boost marks feastSurgeUsed', prog.feastSurgeUsed === true, 'used=' + prog.feastSurgeUsed);
  check('q4: paid boost records the scholar as the spender', prog.feastSurgeBy === 'p', 'by=' + prog.feastSurgeBy);
  check('q4: arming left alone by the reactor path', prog.feastSurge === 1.5, 'feastSurge=' + prog.feastSurge);
  // a second paid boost: still marked, still the same spender (idempotent)
  strike(G, f.m.key, BASE, 'p', 'you');
  check('q4: second boost stays marked, same spender', prog.feastSurgeUsed === true && prog.feastSurgeBy === 'p',
    'used=' + prog.feastSurgeUsed + ' by=' + prog.feastSurgeBy);

  // --- 2. the FREE floor does not mark (costs nothing, is not a spend) ---
  setPantry(G, []);
  prog.feastSurgeUsed = false; prog.feastSurgeBy = null;
  f = startFight(G);
  const floorLanded = strike(G, f.m.key, BASE, 'p', 'you');
  check('q4: floor strike still lands x1.25', floorLanded === Math.round(BASE * 1.25), 'landed=' + floorLanded);
  check('q4: free floor does NOT mark a surge spend', prog.feastSurgeUsed !== true && !prog.feastSurgeBy,
    'used=' + prog.feastSurgeUsed + ' by=' + prog.feastSurgeBy);

  // --- 3. a PAID bonus heal marks the surge too ---
  // Out of combat: the fighter's HP pool is the live one mid-fight, so end
  // the fight first and measure on the scholar's own health.
  endFight(G);
  setPantry(G, pantry50());
  prog.feastSurgeUsed = false; prog.feastSurgeBy = null;
  s.health = 50; if (s.maxHealth) s.maxHealth = 100;
  try { G.applyFeastedForm('field_medicine', null, null, { scholar: 30, fighter: null }); } catch (e) {}
  check('q4: paid bonus heal lands', s.health === 60, 'health=' + s.health);
  check('q4: paid bonus heal marks the surge', prog.feastSurgeUsed === true && prog.feastSurgeBy === 'p',
    'used=' + prog.feastSurgeUsed + ' by=' + prog.feastSurgeBy);

  // --- 4. a villager bearer's paid boost marks with their id ---
  try { G.state.fusionReactorHolder = null; } catch (e) {}
  try { s.fusionReactor = null; } catch (e) {}
  try { s.abilities = (s.abilities || []).filter(a => (a.id || a) !== 'fusion_reactor'); } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  check('setup: roster has a villager for the bearer test', roster.length >= 1, 'roster=' + roster.length);
  const bearerVid = roster[0];
  let granted = false;
  try { granted = G.npcGrantAbility(bearerVid, 'fusion_reactor'); } catch (e) {}
  check('setup: villager granted the reactor', granted === true, 'holder=' + JSON.stringify(G.state.fusionReactorHolder || null));
  setPantry(G, pantry50());
  prog.feastSurgeUsed = false; prog.feastSurgeBy = null;
  f = startFight(G);
  const vf = (G.tbfight.fighters || []).find(x => x.kind === 'villager' && x.villagerId === bearerVid);
  check('setup: bearer villager fights', !!vf);
  if (vf) {
    vf.hp = 5000; vf.maxHp = 5000;
    const vlanded = strike(G, f.m.key, BASE, vf.key, vf.name || 'villager');
    check('q4: villager boost lands x1.5', vlanded === Math.round(BASE * 1.5), 'landed=' + vlanded);
    check('q4: villager boost marks with the villager id', prog.feastSurgeUsed === true && prog.feastSurgeBy === ('v:' + bearerVid),
      'used=' + prog.feastSurgeUsed + ' by=' + prog.feastSurgeBy);
  }

  // --- 5. the PASS rule is untouched (PB-5 smoke): the trigger still moves
  // the pellet to the hungriest hand, and silence still holds it. ---
  endFight(G);
  try { G.state.systemArrived = true; } catch (e) {}
  // The holder is the villager from section 4; make them fed and three
  // others hungry so the trigger holds.
  const needs = G.state.village.needs = G.state.village.needs || {};
  const others = roster.filter(id => id !== bearerVid).slice(0, 3);
  check('setup: three other villagers exist for the pass test', others.length === 3, 'others=' + others.length);
  [bearerVid, ...others].forEach(id => { needs[id] = needs[id] || {}; });
  needs[bearerVid].hunger = 10;
  needs[others[0]].hunger = 80; needs[others[1]].hunger = 90; needs[others[2]].hunger = 95;
  try { (G.state.pelletPass || (G.state.pelletPass = {})).lastPassDay = -999; } catch (e) {}
  let passed = false;
  try { passed = G.maybePassPellet(); } catch (e) { passed = 'ERR ' + e.message; }
  check('pass: trigger holds, pellet passes', passed === true, 'returned=' + passed);
  check('pass: holder is now the hungriest villager', G.state.fusionReactorHolder && G.state.fusionReactorHolder.vid === others[2],
    'holder=' + JSON.stringify(G.state.fusionReactorHolder || null));
  let oldHas = true;
  try { oldHas = G.npcHasAbility(bearerVid, 'fusion_reactor'); } catch (e) {}
  check('pass: old bearer no longer holds the reactor ability', oldHas === false, 'oldHas=' + oldHas);
  // Negative: nobody hungry, no pass.
  const newHolder = G.state.fusionReactorHolder && G.state.fusionReactorHolder.vid;
  others.forEach(id => { needs[id].hunger = 10; });
  needs[newHolder].hunger = 10;
  let passed2 = false;
  try { passed2 = G.maybePassPellet(); } catch (e) { passed2 = 'ERR ' + e.message; }
  check('pass: nobody hungry, no pass', passed2 !== true && G.state.fusionReactorHolder && G.state.fusionReactorHolder.vid === newHolder,
    'returned=' + passed2 + ' holder=' + JSON.stringify(G.state.fusionReactorHolder || null));

  G.say = origSay;
  endFight(G);
  console.log(`\npellet-q4: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
