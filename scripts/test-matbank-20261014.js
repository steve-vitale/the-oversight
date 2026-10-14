#!/usr/bin/env node
// test-matbank-20261014.js — sim-matbank arm (flesh-out loop B, 2026-10-14).
// ARM (food-economy axis), POLICY-SIDE. Materials-banking for the snare trapline.
//
// The blank (sim-findings #81, from the KILLED snaregate arm): the scholar's
// pack never co-banks vine>=2 && stick>=2 — vine banks thinly, stick burns on
// knives/tools. The arm: scripts/policies/matbank.js, opt-in gate MATBANK=1
// (default OFF):
//   1. SNARE RESERVE: discretionary vine/stick recipe burns (arrow, bark_armor)
//      may spend only the surplus above 2+2 — the craft goes ahead iff the
//      pack still holds vine>=2 && stick>=2 after the spend.
//   2. KNIFE PRIORITY: stone_knife knapping (keepKnife/cleanCatch/armUp) is
//      never gated; the snare craft itself is never gated (the reserve exists
//      for it).
//   3. COLLECT BEFORE BURNING: below the reserve (snare L1+), the forage trip
//      prefers vine-rich ground (thickets/groves).
//
// RED (gate OFF — the mechanism absent): the burns happen below the reserve
// (arrow at stick=2 burns 2->0; bark_armor at vine=2 burns 2->0) and the
// forage trip does NOT prefer the thicket. This is the blank, demonstrated.
// GREEN (MATBANK=1): the reserve holds (no attempt below 2+2; surplus crafts
// proceed and leave 2+2 intact), knife knapping still fires, snare crafts
// still fire, and the trip steers for the thicket.
//
// Usage: node scripts/test-matbank-20261014.js            (RED: gate off)
//        MATBANK=1 node scripts/test-matbank-20261014.js  (GREEN: gate on)
//
// NOTE (2026-10-14): the layer was KILLED at pilot and deleted — the armed
// branch of this proof only passes on the (removed) layer commit. Kept as
// the arm's measurement record; see evidence/2026-10-14/sim-matbank.md.
// Verdict: co-banked seeds 2/8 -> 2/8 (need 4/8), blind crafts 3 -> 1
// (need >=6) — the 2+2 reserve parked the pack one short of the live 3+3
// blind gate; the refined prescription (bank to the craft threshold) is in
// the evidence file and sim-findings.md.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const comp = require('./policies/competent');
const { keepKnife, workTrapline, forageTripSeedFirst } = comp;
// gearUp was exported only for this proof's scenarios; the kill reverted the
// export along with the hooks — degrade gracefully on the killed tree.
const gearUp = comp.gearUp || null;
// The layer was KILLED and deleted (see header note) — require optionally so
// the RED (gate-off) branch still runs on the killed tree as the record.
let matbank = null;
try { matbank = require('./policies/matbank'); } catch (e) { matbank = null; }

const SEED = parseInt(process.env.SEED || '20261014', 10);
const GATE = process.env.MATBANK === '1';
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function mats(Game, m) {
  return ((Game.state.scholar || {}).inventory || [])
    .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
}
const MAT = (m, n) => ({ material: m, units: n, name: m, kcalEach: 0, spoilDay: 9999, kg: 0.1 });
function setRecipe(Game, id, level) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.recipes = Game.state.codex.recipes || {};
  Game.state.codex.recipes[id] = level >= 1 ? { level } : {};
}
async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'matbank-proof' });
  await setupGame(Game);
  return Game;
}
function watchCraft(Game) {
  const attempts = {};
  const _craft = Game.craft.bind(Game);
  Game.craft = function (id) { attempts[id] = (attempts[id] || 0) + 1; return _craft.apply(this, arguments); };
  return attempts;
}

// ---- scenario 1: the arrow burn (stick:2) through gearUp's dry-bow path ----
async function arrowScenario(seed, vine, stick) {
  if (!gearUp) return null; // export reverted with the kill: untestable, skip
  const Game = await freshGame(seed);
  setRecipe(Game, 'arrow', 2); // known: reliable band, attempts deterministic
  const inv = Game.state.scholar.inventory;
  inv.push({ itemId: 'crude_bow', id: 'crude_bow' }); // dry: no arrows in pack
  inv.push(MAT('stick', stick), MAT('stone', 1), MAT('fiber', 1));
  if (vine) inv.push(MAT('vine', vine));
  const attempts = watchCraft(Game);
  gearUp(Game, {});
  return { attempts: attempts.arrow || 0, vine: mats(Game, 'vine'), stick: mats(Game, 'stick') };
}

// ---- scenario 2: the bark_armor burn (vine:2) through gearUp's armor path ----
async function barkScenario(seed, vine, stick) {
  if (!gearUp) return null; // export reverted with the kill: untestable, skip
  const Game = await freshGame(seed);
  setRecipe(Game, 'bark_armor', 2);
  const inv = Game.state.scholar.inventory;
  inv.push(MAT('bark', 3), MAT('vine', vine), MAT('stick', stick));
  const attempts = watchCraft(Game);
  gearUp(Game, {});
  return { attempts: attempts.bark_armor || 0, vine: mats(Game, 'vine'), stick: mats(Game, 'stick') };
}

// ---- scenario 3: knife priority — keepKnife must fire even below reserve ----
async function knifeScenario(seed) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'stone_knife', 3); // universal L3
  const inv = Game.state.scholar.inventory;
  inv.push({ foodState: 'carcass', units: 1, name: 'carcass', kcalEach: 100 }); // knifeNeeded
  inv.push(MAT('stone', 1), MAT('vine', 1));
  const attempts = watchCraft(Game);
  const ctx = {};
  keepKnife(Game, ctx);
  return {
    attempts: attempts.stone_knife || 0,
    knapped: (ctx.knivesKnapped || 0) + (ctx.knapFailed || 0),
    vine: mats(Game, 'vine'),
  };
}

// ---- scenario 4: the snare craft itself is never gated ----
async function snareScenario(seed) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'snare', 1);
  const inv = Game.state.scholar.inventory;
  inv.push(MAT('vine', 3), MAT('stick', 3));
  const attempts = watchCraft(Game);
  workTrapline(Game, {});
  return { attempts: attempts.snare || 0 };
}

// ---- scenario 5: the collection signal (unit) ----
async function signalScenario(seed, vine, stick, snareLvl) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'snare', snareLvl);
  const inv = Game.state.scholar.inventory;
  if (vine) inv.push(MAT('vine', vine));
  if (stick) inv.push(MAT('stick', stick));
  if (!matbank) return null; // layer killed & deleted: signal untestable, skip
  return matbank.snareReserveWanted(Game);
}

// ---- scenario 6: the forage destination choice (behavioral) ----
// meadow d=2 vs thicket d=2: baseline ties -> stable order -> meadow;
// armed: the thicket's -1 preference breaks the tie -> thicket.
async function foragePrefScenario(seed) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'snare', 1);
  Game.state.scholar.inventory.push(MAT('vine', 1), MAT('stick', 1)); // below reserve
  Game.hasCuttingTool = () => true; // knife has no vine need: isolate the trapline pull
  Game.map = Game.map || { px: 4, py: 4 };
  const calls = [];
  Game.travelTargets = () => [{ x: 1, y: 1, d: 2 }, { x: 3, y: 3, d: 2 }];
  Game.tileAt = (x, y) => (x === 1
    ? { type: 'meadow', revealed: true, stock: 5 }
    : { type: 'thicket', revealed: true, stock: 5 });
  Game.travelBlockage = () => null;
  Game.travelTo = function (x, y) { calls.push([x, y]); Game.map.px = x; Game.map.py = y; return {}; };
  const _doAction = Game.doAction.bind(Game);
  Game.doAction = function (a, o) { if (a === 'forage') return null; return _doAction.apply(this, arguments); };
  forageTripSeedFirst(Game, {});
  return calls.length ? calls[0] : null;
}

(async () => {
  console.log(`MATBANK=${GATE ? '1 (armed)' : 'off (baseline/RED)'} seed=${SEED}`);

  // ---- 1. arrow: the stick burn ----
  const aBase = await arrowScenario(SEED, 0, 2);
  if (aBase === null) {
    console.log('info  gearUp export reverted with the kill: arrow scenarios skipped');
  } else {
    ok('RED baseline: arrow crafted at stick=2 (burns below the reserve)',
      !GATE ? (aBase.attempts === 1 && aBase.stick === 0) : true,
      `attempts=${aBase.attempts} stick=${aBase.stick}`);
  }
  const aGate = await arrowScenario(SEED + 1, 0, 2);
  if (GATE && aGate) {
    ok('armed: arrow NOT crafted at stick=2 (reserve holds)', aGate.attempts === 0 && aGate.stick === 2,
      `attempts=${aGate.attempts} stick=${aGate.stick}`);
  }
  const aSurplus = await arrowScenario(SEED + 2, 2, 4);
  if (GATE && aSurplus) {
    ok('armed: arrow crafted at vine=2/stick=4 (surplus spent, reserve intact)',
      aSurplus.attempts === 1 && aSurplus.stick === 2 && aSurplus.vine === 2,
      `attempts=${aSurplus.attempts} vine=${aSurplus.vine} stick=${aSurplus.stick}`);
  }

  // ---- 2. bark_armor: the vine burn ----
  const bBase = await barkScenario(SEED + 3, 2, 2);
  if (bBase === null) {
    console.log('info  gearUp export reverted with the kill: bark_armor scenarios skipped');
  } else {
    ok('RED baseline: bark_armor crafted at vine=2 (burns the last vine)',
      !GATE ? (bBase.attempts === 1 && bBase.vine === 0) : true,
      `attempts=${bBase.attempts} vine=${bBase.vine}`);
  }
  const bGate = await barkScenario(SEED + 4, 2, 2);
  if (GATE && bGate) {
    ok('armed: bark_armor NOT crafted at vine=2/stick=2 (reserve holds)',
      bGate.attempts === 0 && bGate.vine === 2,
      `attempts=${bGate.attempts} vine=${bGate.vine}`);
  }
  const bSurplus = await barkScenario(SEED + 5, 4, 2);
  if (GATE && bSurplus) {
    ok('armed: bark_armor crafted at vine=4/stick=2 (surplus spent, reserve intact)',
      bSurplus.attempts === 1 && bSurplus.vine === 2 && bSurplus.stick === 2,
      `attempts=${bSurplus.attempts} vine=${bSurplus.vine} stick=${bSurplus.stick}`);
  }

  // ---- 3. knife priority ----
  const k = await knifeScenario(SEED + 6);
  ok('knife knapping fires even below the reserve (priority, gate or not)',
    k.attempts === 1 && k.knapped === 1, `attempts=${k.attempts} knapped=${k.knapped} vine=${k.vine}`);

  // ---- 4. snare craft untouched ----
  const sn = await snareScenario(SEED + 7);
  if (GATE) {
    ok('armed: snare craft at 3+3 still attempted (the reserve exists for it)',
      sn.attempts === 1, `attempts=${sn.attempts}`);
  } else {
    ok('baseline: snare craft at 3+3 attempted', sn.attempts === 1, `attempts=${sn.attempts}`);
  }

  // ---- 5. collection signal ----
  const s1 = await signalScenario(SEED + 8, 1, 5, 1);
  const s2 = await signalScenario(SEED + 9, 0, 0, 1);
  const s3 = await signalScenario(SEED + 10, 2, 2, 1);
  const s4 = await signalScenario(SEED + 11, 5, 1, 1);
  const s5 = await signalScenario(SEED + 12, 0, 0, 0);
  if (!matbank) {
    console.log('info  layer deleted (killed): collection-signal scenarios skipped');
  } else if (GATE) {
    ok('signal: below reserve + snare L1 -> want vine-rich ground', s1 === true && s2 === true && s4 === true,
      `${s1}/${s2}/${s4}`);
    ok('signal: reserve met -> no pull', s3 === false, `got ${s3}`);
    ok('signal: snare L0 -> no pull (no trapline to feed yet)', s5 === false, `got ${s5}`);
  } else {
    ok('RED baseline: no collection signal (gate off)', s1 === false && s2 === false, `${s1}/${s2}`);
  }

  // ---- 6. forage destination choice ----
  const f = await foragePrefScenario(SEED + 13);
  if (GATE && !matbank) {
    console.log('info  layer deleted (killed): armed forage-preference assertion skipped');
  } else if (GATE) {
    ok('armed: below-reserve trip steers for the thicket (collect before burning)',
      f && f[0] === 3 && f[1] === 3, `first travelTo=${JSON.stringify(f)}`);
  } else {
    ok('RED baseline: tied trip takes the meadow (no thicket preference)',
      f && f[0] === 1 && f[1] === 1, `first travelTo=${JSON.stringify(f)}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
