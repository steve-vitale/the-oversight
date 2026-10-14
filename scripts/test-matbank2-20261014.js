#!/usr/bin/env node
// test-matbank2-20261014.js — sim-matbank-b2 arm (flesh-out loop B, 2026-10-14).
// ARM (food-economy axis), POLICY-SIDE. Materials-banking for the snare
// trapline, CORRECTED prescription (sim-findings #81).
//
// The KILLED matbank arm banked to a fixed 2+2 reserve — the dead snaregate
// arm's band — while the LIVE blind gate is 3+3 (workTrapline:
// `level >= 2 ? 1+1 : 3+3`). It parked the pack one short of the craft
// threshold: the preference shut off AT the 2+2 reserve line, so collection
// stopped before 3+3 was reachable. This arm keys the reserve to the LIVE
// gate: 3+3 at snare L1, 1+1 at snare L2, nothing at L0. The collection pull
// stays ACTIVE until the threshold is met and shuts off AT the threshold,
// not below it.
//
// scripts/policies/matbank2.js, opt-in gate MATBANK2=1 (default OFF), hooked
// into competent.js (forageTripSeedFirst thicket sort, gearUp's arrow and
// bark_armor craft sites):
//   1. SNARE RESERVE: discretionary burns (arrow: stick 2, bark_armor:
//      vine 2) may spend only the surplus above the live target band — the
//      craft goes ahead iff the pack holds the band after the spend.
//      Engine fires burn branch/wood/fusion ONLY: fires NOT gated. Knife
//      knapping never gated (priority). The snare craft itself never gated.
//   2. COLLECT BEFORE BURNING: below the target band (snare L1+), the forage
//      trip prefers vine-rich ground (thickets/groves).
//
// RED (gate OFF — the mechanism absent): the burns happen below the band,
// no collection signal, the tied trip takes the meadow; AND the broken 2+2
// prescription is re-implemented inline to show it parks at 2+2 (signal off
// at 2+2 while the blind craft needs 3+3 — the parked state can't craft).
// GREEN (MATBANK2=1): the pull continues past 2+2, shuts off AT 3+3, the
// reserve holds (surplus-only burns), knife knapping still fires, the snare
// craft still fires, the tied trip steers for the thicket only while below
// the band.
//
// Usage: node scripts/test-matbank2-20261014.js            (RED: gate off)
//        MATBANK2=1 node scripts/test-matbank2-20261014.js  (GREEN: gate on)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const comp = require('./policies/competent');
const { keepKnife, workTrapline, forageTripSeedFirst, gearUp } = comp;
const matbank2 = require('./policies/matbank2');

const SEED = parseInt(process.env.SEED || '20261014', 10);
const GATE = process.env.MATBANK2 === '1';
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
  const { Game } = await loadGame({ seed, mode: 'matbank2-proof' });
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
async function arrowScenario(seed, vine, stick, snareLvl) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'arrow', 2); // known: reliable band, attempts deterministic
  setRecipe(Game, 'snare', snareLvl);
  const inv = Game.state.scholar.inventory;
  inv.push({ itemId: 'crude_bow', id: 'crude_bow' }); // dry: no arrows in pack
  inv.push(MAT('stick', stick), MAT('stone', 1), MAT('fiber', 1));
  if (vine) inv.push(MAT('vine', vine));
  const attempts = watchCraft(Game);
  gearUp(Game, {});
  return { attempts: attempts.arrow || 0, vine: mats(Game, 'vine'), stick: mats(Game, 'stick') };
}

// ---- scenario 2: the bark_armor burn (vine:2) through gearUp's armor path ----
async function barkScenario(seed, vine, stick, snareLvl) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'bark_armor', 2);
  setRecipe(Game, 'snare', snareLvl);
  const inv = Game.state.scholar.inventory;
  inv.push(MAT('bark', 3), MAT('vine', vine), MAT('stick', stick));
  const attempts = watchCraft(Game);
  gearUp(Game, {});
  return { attempts: attempts.bark_armor || 0, vine: mats(Game, 'vine'), stick: mats(Game, 'stick') };
}

// ---- scenario 3: knife priority — keepKnife must fire even below the band ----
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
async function snareScenario(seed, vine, stick, snareLvl) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'snare', snareLvl);
  const inv = Game.state.scholar.inventory;
  inv.push(MAT('vine', vine), MAT('stick', stick));
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
  return matbank2.snareReserveWanted(Game);
}

// The KILLED arm's rule, re-implemented inline for the record: the 2+2-keyed
// reserve said "want" only below 2+2 — the pull shut off at the reserve line.
const old22Signal = (vine, stick) => !(vine >= 2 && stick >= 2);

// ---- scenario 6: the forage destination choice (behavioral) ----
// meadow d=2 vs thicket d=2: baseline ties -> stable order -> meadow;
// armed below the band: the trapline pull breaks the tie -> thicket.
// hasCuttingTool=true isolates the trapline pull (the knife has no vine need).
async function foragePrefScenario(seed, vine, stick, snareLvl) {
  const Game = await freshGame(seed);
  setRecipe(Game, 'snare', snareLvl);
  if (vine) Game.state.scholar.inventory.push(MAT('vine', vine));
  if (stick) Game.state.scholar.inventory.push(MAT('stick', stick));
  Game.hasCuttingTool = () => true;
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
  console.log(`MATBANK2=${GATE ? '1 (armed)' : 'off (baseline/RED)'} seed=${SEED}`);

  // ============================ RED ========================================
  if (!GATE) {
    // ---- 1. arrow: the stick burn fires below the band (the blank) ----
    const a = await arrowScenario(SEED, 2, 2, 1);
    ok('RED: arrow crafted at stick=2 (burns below the 3+3 band)', a.attempts === 1 && a.stick === 0,
      `attempts=${a.attempts} stick=${a.stick}`);
    // ---- 2. bark_armor: the vine burn fires below the band ----
    const b = await barkScenario(SEED + 3, 2, 2, 1);
    ok('RED: bark_armor crafted at vine=2 (burns the last vine)', b.attempts === 1 && b.vine === 0,
      `attempts=${b.attempts} vine=${b.vine}`);
    // ---- 3. knife priority ----
    const k = await knifeScenario(SEED + 6);
    ok('RED: knife knapping fires below the band (priority)', k.attempts === 1 && k.knapped === 1,
      `attempts=${k.attempts} knapped=${k.knapped}`);
    // ---- 4. snare craft: fires at 3+3, and the parked 2+2 state can't craft ----
    const sn33 = await snareScenario(SEED + 7, 3, 3, 1);
    ok('RED: snare craft attempted at 3+3 (the reserve exists for it)', sn33.attempts === 1,
      `attempts=${sn33.attempts}`);
    const sn22 = await snareScenario(SEED + 17, 2, 2, 1);
    ok('RED: parked at 2+2 the blind craft CANNOT fire (one short of the live gate)',
      sn22.attempts === 0, `attempts=${sn22.attempts}`);
    // ---- 5. collection signal: absent when the gate is off ----
    const s1 = await signalScenario(SEED + 8, 1, 5, 1);
    const s2 = await signalScenario(SEED + 9, 2, 2, 1);
    const s3 = await signalScenario(SEED + 10, 3, 3, 1);
    ok('RED: no collection signal (gate off) at 1+5, 2+2, 3+3',
      s1 === false && s2 === false && s3 === false, `${s1}/${s2}/${s3}`);
    // ---- 6. the broken 2+2 prescription, re-implemented: it parks at 2+2 ----
    const oldS = old22Signal(2, 2);
    ok('RED: the killed 2+2 rule shuts the pull off AT 2+2 (parks one short of 3+3)',
      oldS === false, `old signal at 2+2 = ${oldS}`);
    // ---- 7. forage destination: tied trip takes the meadow ----
    const f = await foragePrefScenario(SEED + 13, 1, 1, 1);
    ok('RED: tied trip takes the meadow (no thicket preference)', f && f[0] === 1 && f[1] === 1,
      `first travelTo=${JSON.stringify(f)}`);
  }

  // ============================ GREEN ======================================
  if (GATE) {
    // ---- 1. arrow: blocked below the band, fires on surplus, band holds ----
    const aGate = await arrowScenario(SEED, 2, 2, 1);
    ok('armed: arrow NOT crafted at 2+2 (below the 3+3 band)', aGate.attempts === 0 && aGate.stick === 2,
      `attempts=${aGate.attempts} stick=${aGate.stick}`);
    const aSurplus = await arrowScenario(SEED + 1, 3, 5, 1);
    ok('armed: arrow crafted at 3+5 (surplus spent, 3+3 band intact)',
      aSurplus.attempts === 1 && aSurplus.stick === 3 && aSurplus.vine === 3,
      `attempts=${aSurplus.attempts} vine=${aSurplus.vine} stick=${aSurplus.stick}`);
    const aL2 = await arrowScenario(SEED + 2, 1, 3, 2);
    ok('armed: at snare L2 the band is 1+1 — arrow crafted at 1+3 (stick 3->1)',
      aL2.attempts === 1 && aL2.stick === 1 && aL2.vine === 1,
      `attempts=${aL2.attempts} vine=${aL2.vine} stick=${aL2.stick}`);
    // ---- 2. bark_armor: blocked below the band, fires on surplus ----
    const bGate = await barkScenario(SEED + 3, 2, 2, 1);
    ok('armed: bark_armor NOT crafted at 2+2 (below the 3+3 band)',
      bGate.attempts === 0 && bGate.vine === 2,
      `attempts=${bGate.attempts} vine=${bGate.vine}`);
    const bSurplus = await barkScenario(SEED + 4, 5, 3, 1);
    ok('armed: bark_armor crafted at 5+3 (surplus spent, 3+3 band intact)',
      bSurplus.attempts === 1 && bSurplus.vine === 3 && bSurplus.stick === 3,
      `attempts=${bSurplus.attempts} vine=${bSurplus.vine} stick=${bSurplus.stick}`);
    // ---- 3. knife priority ----
    const k = await knifeScenario(SEED + 6);
    ok('armed: knife knapping still fires below the band (priority)', k.attempts === 1 && k.knapped === 1,
      `attempts=${k.attempts} knapped=${k.knapped} vine=${k.vine}`);
    // ---- 4. snare craft itself never gated ----
    const sn = await snareScenario(SEED + 7, 3, 3, 1);
    ok('armed: snare craft at 3+3 still attempted (the reserve exists for it)',
      sn.attempts === 1, `attempts=${sn.attempts}`);
    // ---- 5. collection signal: pull CONTINUES past 2+2, shuts off AT 3+3 ----
    const g1 = await signalScenario(SEED + 8, 1, 5, 1);   // below band
    const g2 = await signalScenario(SEED + 9, 2, 2, 1);   // the old park point
    const g3 = await signalScenario(SEED + 10, 3, 3, 1);  // threshold met
    const g4 = await signalScenario(SEED + 11, 5, 5, 1);  // above band
    ok('armed: signal TRUE below the band AND at 2+2 (pull continues past the old park)',
      g1 === true && g2 === true, `${g1}/${g2}`);
    ok('armed: signal FALSE at 3+3 and above (shutoff AT the threshold)', g3 === false && g4 === false,
      `${g3}/${g4}`);
    const gL2a = await signalScenario(SEED + 12, 0, 0, 2); // below 1+1 band
    const gL2b = await signalScenario(SEED + 14, 1, 1, 2); // 1+1 band met
    ok('armed: at snare L2 the pull tracks the 1+1 band (true at 0+0, false at 1+1)',
      gL2a === true && gL2b === false, `${gL2a}/${gL2b}`);
    const gL0 = await signalScenario(SEED + 15, 0, 0, 0);
    ok('armed: no pull at snare L0 (no trapline to feed yet)', gL0 === false, `got ${gL0}`);
    const gBurn = matbank2.mayBurnDiscretionary(await freshGame(SEED + 16), { stick: 2 });
    ok('armed: at snare L0 the burn gate is inert (no reserve)', gBurn === true, `got ${gBurn}`);
    // ---- 6. forage destination: thicket while below the band, meadow at it ----
    const fBelow = await foragePrefScenario(SEED + 13, 1, 1, 1);
    ok('armed: below-band trip steers for the thicket (collect before burning)',
      fBelow && fBelow[0] === 3 && fBelow[1] === 3, `first travelTo=${JSON.stringify(fBelow)}`);
    const fAt = await foragePrefScenario(SEED + 18, 3, 3, 1);
    ok('armed: at-band trip goes back to neutral (meadow — the pull is off)',
      fAt && fAt[0] === 1 && fAt[1] === 1, `first travelTo=${JSON.stringify(fAt)}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
