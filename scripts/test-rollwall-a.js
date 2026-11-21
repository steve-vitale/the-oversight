// test-rollwall-a.js — proof test, arm sim-rollwall-a
// (finding #2590, the ROLL WALL). Proves the instrument + the game
// behavior it reads, on a staged village (seed 31031, the
// test-ammo-a.js pattern). It does NOT run the judged leg — the
// pilot's own corpora prove the live path.
//   - Static: DEPMAT/ROLL35/AMMO substrate present in game.js,
//     FIBERFETCH absent (concept-dead, not re-landed).
//   - Fixtures: a served bow seats (melee-first fallback moves the
//     spear to melee); a served 0.60 craft fails on roll 0.70 and
//     succeeds on roll 0.50; a fiber-0 pile yields no-mats even when
//     the carrier's PACK holds fiber (departure craft is pile-only);
//     a spear-only carrier yields no-ammo-id; the home craft eats
//     the pile fiber first (the timing mechanism exists).
//   - Pure helpers: deriveFailReason (every branch), countMat /
//     countAmmo (draw-free), callPath (expedition/patrol/other).
//   - Analyzer: its --selftest runs green from here.
// Harness: shared sim-harness (seeded Math.random BEFORE eval).
'use strict';
process.env.DEPMAT = '1';
process.env.ROLL35 = '1';
process.env.AMMO = '1';
process.env.SPEARGATE = '1';
process.env.BOWOPEN = '1';
process.env.SENSEEXPED = '1';
const path = require('path');
const fs = require('fs');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const driver = require('./rollwall-driver-a');
const analyzer = require('./analyze-rollwall-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- 1. Static wiring ----
  const game = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  check('substrate present (DEPMAT marker)', /DEPMAT \(sim-depmat-a/.test(game));
  check('substrate present (ROLL35 marker)', /ROLL35 \(sim-roll35-a/.test(game));
  check('substrate present (AMMO marker)', /AMMO \(sim-ammo-a/.test(game));
  check('dead fetch NOT re-landed (no FIBERFETCH marker)', !/FIBERFETCH \(sim-fiberfetch-a/.test(game));
  check('driver exports oneRun + pure helpers', typeof driver.oneRun === 'function' && typeof driver.deriveFailReason === 'function' && typeof driver.countMat === 'function' && typeof driver.callPath === 'function');
  check('analyzer exports classifyServed + clopperPearson', typeof analyzer.classifyServed === 'function' && typeof analyzer.clopperPearson === 'function');

  // ---- 2. Staged village (seed 31031) ----
  const g2 = await loadGame({ seed: 31031, mode: 'rollwall-stage' });
  const G = g2.Game;
  check('villagerPocketAmmo callable', typeof G.villagerPocketAmmo === 'function');
  check('villagerStageBow callable', typeof G.villagerStageBow === 'function');
  check('villagerAmmoCraftDay callable', typeof G.villagerAmmoCraftDay === 'function');
  if (typeof G.villagerPocketAmmo !== 'function' || typeof G.villagerStageBow !== 'function') { console.log('ROLLWALL_FAILS ' + failed); process.exit(1); }
  await quietLog(async () => { await setupGame(G); });
  const v = G.state.village || {};
  const vessel = G.villagerId;
  const others = (v.roster || []).filter(function (id) { return id !== vessel; });
  check('roster has >=4 non-vessel villagers', others.length >= 4, others);
  const learner = others[0];
  const person = function (vid) { return G.getPerson(vid); };
  const EQ = (globalThis.Scattering || {}).equipment;
  const resetVillager = function (vid) {
    const p = person(vid);
    p.items = []; p.equipped = {}; p.stashed = []; p.dead = false;
    if (v.away) delete v.away[vid];
    return p;
  };
  const resetAllOthers = function () { for (const id of others) resetVillager(id); };
  const setPile = function (mats) {
    const st = G.stashState();
    for (const m of ['wood', 'branch', 'stone', 'fiber', 'stick', 'vine', 'bark']) st.materials[m] = 0;
    Object.assign(st.materials, mats);
    try { st.weapons = []; } catch (e) {}
    return st.materials;
  };
  const pileOf = function () { const st = G.stashState(); return { stick: st.materials.stick || 0, stone: st.materials.stone || 0, fiber: st.materials.fiber || 0 }; };
  const equippedId = function (vid, slot) { const e = (person(vid).equipped || {})[slot]; return e ? (e.itemId || e.id || null) : null; };
  const arrowsCarried = function (vid) {
    let n = 0;
    for (const e of (person(vid).items || [])) {
      const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
      if (eid === 'arrow') n += (typeof e === 'string') ? 1 : (e.units || 1);
    }
    return n;
  };
  const setAmmo = function (on) { if (on) process.env.AMMO = '1'; else delete process.env.AMMO; };
  const serveBow = function (roll) {
    resetVillager(learner);
    v.weaponCraft = {};
    v.weaponCraft[learner] = { crude_bow: 1 };
    v.ammoCraft = {};
    v.bowOpen = {}; v.bowOpenByVid = {};
    const lp = person(learner);
    lp.items = ['hunting_spear'];
    if (EQ) EQ.autoEquip(lp, G.data.items);
    setPile({});
    const origRandom = Math.random;
    try {
      Math.random = function () { return roll; };
      return G.villagerStageBow(learner);
    } finally { Math.random = origRandom; }
  };
  const pocket = function (roll) {
    let draws = 0;
    const origRandom = Math.random;
    try {
      Math.random = function () { draws++; return roll; };
      const out = G.villagerPocketAmmo(learner);
      return { out: out, draws: draws, carried: arrowsCarried(learner) };
    } finally { Math.random = origRandom; }
  };
  const servedRec = function () { return ((v.bowOpenByVid || {})[learner] || null); };
  if (G.map) { G.map.px = v.px != null ? v.px : 4; G.map.py = v.py != null ? v.py : 4; }

  // R1: staging serves a crude bow and seats it — the spear falls
  // back to melee (melee-first fallback), so the bow is the ranged
  // weapon the departure craft sees.
  console.log('\n=== R1: staging serves + seats the bow (spear to melee) ===');
  setAmmo(true);
  const s1 = serveBow(0.01);
  console.log('served: source=' + (servedRec() && servedRec().source) + ' ranged=' + equippedId(learner, 'ranged') + ' melee=' + equippedId(learner, 'melee'));
  check('R1 staging served a crude bow', s1.staged === true && (servedRec() || {}).source === 'crafted', JSON.stringify(s1));
  check('R1 the bow is seated in the ranged slot', equippedId(learner, 'ranged') === 'crude_bow', equippedId(learner, 'ranged'));
  check('R1 the spear fell back to melee', equippedId(learner, 'melee') === 'hunting_spear', equippedId(learner, 'melee'));

  // R2: the 0.60 roll fails on 0.70 — a served 0-ammo departure
  // classified roll-fail by the driver's own derivation.
  console.log('\n=== R2: served craft fails the 0.60 roll (roll-fail) ===');
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m2 = pocket(0.70);
  console.log('after: carried=' + m2.carried + ' draws=' + m2.draws + ' ammoRate=' + m2.out.ammoRate + ' ammoServed=' + m2.out.ammoServed);
  check('R2 no arrows pocketed (0.70 >= 0.60)', m2.carried === 0, 'carried=' + m2.carried);
  check('R2 the craft ran and failed', m2.out.crafted === 1 && m2.out.craftedOk === false, JSON.stringify(m2.out));
  check('R2 return carries ammoRate 0.60 + ammoServed', m2.out.ammoRate === 0.60 && m2.out.ammoServed === true, JSON.stringify(m2.out));
  check('R2 exactly one craft draw', m2.draws === 1, 'draws=' + m2.draws);
  check('R2 deriveFailReason says craft-fail', driver.deriveFailReason({ rangedId: 'crude_bow', ammoId: 'arrow', carriedBefore: 0, pileBefore: { fiber: 1 } }, m2.out) === 'craft-fail');
  check('R2 classifyServed says roll-fail', analyzer.classifyServed({ day: 1, vid: learner }, { failReason: 'craft-fail', ammoRate: 0.6, ammoLvBefore: 1 }, [], []).cls === 'roll-fail');

  // R3: the same setup succeeds on roll 0.50 — the rate is what it
  // seems (0.50 < 0.60 crafts, 0.70 >= 0.60 fails).
  console.log('\n=== R3: served craft succeeds on roll 0.50 (craft-ok) ===');
  const s3 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m3 = pocket(0.50);
  console.log('after: carried=' + m3.carried + ' draws=' + m3.draws + ' ammoRate=' + m3.out.ammoRate);
  check('R3 staging served again', s3.staged === true, JSON.stringify(s3));
  check('R3 5 arrows pocketed (0.50 < 0.60, one batch)', m3.carried === 5, 'carried=' + m3.carried);
  check('R3 the craft ran and succeeded', m3.out.crafted === 1 && m3.out.craftedOk === true, JSON.stringify(m3.out));
  check('R3 deriveFailReason says craft-ok', driver.deriveFailReason({ rangedId: 'crude_bow', ammoId: 'arrow', carriedBefore: 0, pileBefore: { fiber: 1 } }, m3.out) === 'craft-ok');

  // R4: pile fiber 0, carrier's PACK holds 1 fiber — the departure
  // craft never runs (pile-only read): no-mats, pack fiber untouched.
  console.log('\n=== R4: pile-only read — pack fiber does not save the craft (no-mats) ===');
  const s4 = serveBow(0.01);
  setPile({ stick: 2, stone: 1, fiber: 0 });
  const lp4 = person(learner);
  lp4.items.push({ itemId: 'fiber', material: 'fiber', units: 1 });
  check('R4 pack fiber reads 1', driver.countMat(lp4, 'fiber', G.data.items) === 1, 'pack=' + driver.countMat(lp4, 'fiber', G.data.items));
  const m4 = pocket(0.10);
  console.log('after: carried=' + m4.carried + ' draws=' + m4.draws + ' crafted=' + m4.out.crafted);
  check('R4 staging served again', s4.staged === true, JSON.stringify(s4));
  check('R4 no arrows (craft never ran)', m4.carried === 0 && m4.out.crafted === 0, JSON.stringify(m4.out));
  check('R4 zero draws (no attempt, no roll)', m4.draws === 0, 'draws=' + m4.draws);
  check('R4 pack fiber still 1 afterward (never spent)', driver.countMat(lp4, 'fiber', G.data.items) === 1);
  check('R4 deriveFailReason says no-mats', driver.deriveFailReason({ rangedId: 'crude_bow', ammoId: 'arrow', carriedBefore: 0, pileBefore: { fiber: 0 } }, m4.out) === 'no-mats');
  check('R4 classifyServed says no-mats (dawn 0, no timing)', analyzer.classifyServed({ day: 1, vid: learner }, { failReason: 'no-mats', pile: { fiber: 0 }, packFiberBefore: 1 }, [], [{ day: 1, pileFiber: 0 }]).cls === 'no-mats');

  // R5: spear-only carrier (never staged) — the departure craft
  // returns before any attempt: no-ammo-id.
  console.log('\n=== R5: spear-only carrier — no ammo id (no-ammo-id) ===');
  resetVillager(learner);
  v.weaponCraft = {}; v.ammoCraft = {}; v.bowOpen = {}; v.bowOpenByVid = {};
  const lp5 = person(learner);
  lp5.items = ['hunting_spear'];
  if (EQ) EQ.autoEquip(lp5, G.data.items);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  const m5 = pocket(0.10);
  console.log('after: ranged=' + equippedId(learner, 'ranged') + ' carried=' + m5.carried + ' draws=' + m5.draws);
  check('R5 the spear sits in the ranged slot', equippedId(learner, 'ranged') === 'hunting_spear', equippedId(learner, 'ranged'));
  check('R5 no ammo id, nothing pocketed, zero draws', m5.out.ammoId == null && m5.carried === 0 && m5.draws === 0, JSON.stringify(m5.out) + ' draws=' + m5.draws);
  check('R5 deriveFailReason says no-ammo-id', driver.deriveFailReason({ rangedId: 'hunting_spear', ammoId: null, carriedBefore: 0, pileBefore: { fiber: 1 } }, m5.out) === 'no-ammo-id');

  // R6: the home craft eats the pile fiber first — the timing
  // mechanism exists: a bow-holder at home crafts 5 arrows from
  // the pile's last fiber, so a later departure finds none.
  console.log('\n=== R6: home craft drains the pile fiber (timing exists) ===');
  resetAllOthers();
  v.ammoCraft = {}; v.arrowCraftCd = {}; v.bowOpen = {}; v.bowOpenByVid = {};
  const lp6 = person(learner);
  lp6.items = [{ itemId: 'crude_bow' }];
  if (EQ) EQ.autoEquip(lp6, G.data.items);
  setPile({ stick: 2, stone: 1, fiber: 1 });
  check('R6 learner holds the bow at home', equippedId(learner, 'ranged') === 'crude_bow', equippedId(learner, 'ranged'));
  let homeMade = 0;
  const origRandom = Math.random;
  try {
    Math.random = function () { return 0.10; };
    homeMade = G.villagerAmmoCraftDay();
  } finally { Math.random = origRandom; }
  console.log('homeMade=' + homeMade + ' carried=' + arrowsCarried(learner) + ' pile=' + JSON.stringify(pileOf()));
  check('R6 home craft made one batch', homeMade === 1, 'made=' + homeMade);
  check('R6 learner now carries 5 arrows', arrowsCarried(learner) === 5, 'carried=' + arrowsCarried(learner));
  check('R6 pile fiber is 0 afterward', pileOf().fiber === 0, JSON.stringify(pileOf()));

  // R7: pure helpers are draw-free and classify call paths.
  console.log('\n=== R7: helpers — draw-free reads, call paths ===');
  let helperDraws = 0;
  const origR = Math.random;
  try {
    Math.random = function () { helperDraws++; return 0.5; };
    driver.deriveFailReason({ rangedId: 'crude_bow', ammoId: 'arrow', carriedBefore: 0, pileBefore: { fiber: 0 } }, { crafted: 0, pocketed: 0 });
    driver.countMat(person(learner), 'fiber', G.data.items);
    driver.countAmmo(person(learner), 'arrow');
    driver.callPath('Error\n    at Object.departExpedition (/x/src/js/villager-agency.js:527:1)');
    driver.callPath('Error\n    at Game.resolvePatrol (/x/src/js/game.js:8335:1)');
  } finally { Math.random = origR; }
  check('R7 helpers draw zero Math.random', helperDraws === 0, 'draws=' + helperDraws);
  check('R7 expedition path', driver.callPath('Error\n    at Object.departExpedition (/x/src/js/villager-agency.js:527:1)') === 'expedition');
  check('R7 patrol path', driver.callPath('Error\n    at Game.resolvePatrol (/x/src/js/game.js:8335:1)') === 'patrol');
  check('R7 other path', driver.callPath('Error\n    at Object.foo (/x/src/js/other.js:1:1)').indexOf('other:') === 0);
  check('R7 deriveFailReason no-ranged', driver.deriveFailReason({ rangedId: null, ammoId: null, carriedBefore: 0, pileBefore: null }, {}) === 'no-ranged');
  check('R7 deriveFailReason already-capped', driver.deriveFailReason({ rangedId: 'crude_bow', ammoId: 'arrow', carriedBefore: 5, pileBefore: { fiber: 1 } }, { pocketed: 0 }) === 'already-capped');
  check('R7 deriveFailReason stock-draw', driver.deriveFailReason({ rangedId: 'sling', ammoId: 'stone', carriedBefore: 0, pileBefore: { stone: 6 } }, { pocketed: 6, crafted: 0 }) === 'stock-draw');
  check('R7 deriveFailReason no-recipe', driver.deriveFailReason({ rangedId: 'x', ammoId: 'dart', carriedBefore: 0, pileBefore: {} }, { pocketed: 0, crafted: 0 }) === 'no-recipe');

  // R8: the analyzer's own selftest runs green from here.
  console.log('\n=== R8: analyzer selftest ===');
  let selfFails = -1;
  const origLog = console.log;
  try { console.log = function () {}; selfFails = analyzer.selftest(); } finally { console.log = origLog; }
  check('R8 analyzer selftest 0 failures', selfFails === 0, 'fails=' + selfFails);

  console.log('\nROLLWALL ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — FAILS: ' + fails.join('; ') : ''));
  process.exit(failed ? 1 : 0);
}

main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
