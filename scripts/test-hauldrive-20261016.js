#!/usr/bin/env node
// scripts/test-hauldrive-20261016.js — proof test for the kill→haul drive
// layer (scripts/policies/hauldrive.js, ARM sim-hauldrive-b, finding #17).
//
// PART A (fixtures, seed 42): the beats, each with a real RED phase
//   (gate OFF → pure no-op) and GREEN phase (HAULDRIVE=1 → honest effect),
//   plus the guard beats:
//     A1 freshHaul: revealed species → meat hauled via the honest verb
//     A2 knowledge law: unknown flesh untouched (never vacuumed)
//     A3 trembles: meat_human untouched
//     A4 clean on-site: hauled carcass + knife → cleaned, edible:true
//        (species revealed); knifeless → honest once/day skip, no clean
//     A5 cautious test: the daily beat runs meatseek's testUnknownMeat
//        (gate-gated via the wrapped policy)
//     A6 composition: policyForRun chains the feastscale substrate
// PART B (det-gate): gate-OFF wrapped vs pristine leadfeast/belongfeast —
//   30d on seeds 171, 282 must be BYTE-IDENTICAL (the layer is inert when
//   the gate is unset).
// PART C (SMOKE=1 honesty): the layer-live marker is honest —
//   hd.layerOn() === (HAULDRIVE==='1').
// PART D (zero-firing purity): gate-ON with no revealed meat byte-identical
//   to gate-OFF on a seed — the monstermeat lesson (fire checks must not
//   diverge trajectories even when nothing fires).
//
// Usage: node scripts/test-hauldrive-20261016.js
//        SMOKE=1 node scripts/test-hauldrive-20261016.js   (PART C only)
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const hd = require('./policies/hauldrive');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; process.stderr.write('  FAIL ' + name + (extra ? ' — ' + extra : '') + '\n'); }
}
function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    const pk = ((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Math.round(pk / 100),
      ((Game.state.corpses || []).length)].join('|');
  } catch (e) { return 'ERR'; }
}
function packOf(Game) { return (Game.state.scholar || {}).inventory || []; }

// makeCorpse: a fresh in-range monster corpse with one meat item.
// opts: { edibleItem (bool, default false), plantId, human (bool) }
function makeCorpse(Game, mid, opts) {
  opts = opts || {};
  const s = Game.state.scholar;
  const day = dayOf(Game);
  const c = {
    id: 'test-corpse-' + mid + '-' + Math.floor(Math.random() * 1e9),
    kind: 'monster', monsterId: mid, name: 'Test ' + mid,
    node: { x: Game.map.px, y: Game.map.py },
    mx: (s.mx == null ? 4 : s.mx), my: (s.my == null ? 4 : s.my),
    items: [], buried: false, looted: false,
  };
  const pid = opts.plantId || ('meat_' + mid);
  c.items.push({
    plantId: pid, foodKind: 'meat', foodState: 'carcass',
    edible: !!opts.edibleItem, units: 1, kcalEach: opts.edibleItem ? 400 : 0,
    hiddenKcal: 2000, spoilDay: day + 3,
    name: 'Test meat (carcass)', unit: 'carcass', kg: 2.0,
  });
  Game.state.corpses = Game.state.corpses || [];
  Game.state.corpses.push(c);
  return c;
}
function corpseMeatCount(Game) {
  let n = 0;
  for (const c of (Game.state.corpses || []))
    for (const it of (c.items || []))
      if (it && (it.units == null ? 1 : it.units) > 0 && /^meat_/.test(String(it.plantId || ''))) n++;
  return n;
}

async function freshGame() {
  const { Game } = await loadGame({ seed: 42, mode: 'hauldrive-test', fullTelemetry: false });
  await setupGame(Game);
  Game.state.scholar.inventory = [];
  Game.state.corpses = [];
  // a knife in hand (name-matched by hasCuttingTool)
  Game.state.scholar.inventory.push({ name: 'Stone knife', itemId: 'stone_knife', kg: 0.3, units: 1 });
  return Game;
}
function reveal(Game, mid) { Game.markMonsterFoodSafe(mid, 'tested'); }

async function partA() {
  console.log('PART A — beat fixtures (RED→GREEN)');
  // ---- A1: freshHaul ----
  {
    const Game = await freshGame();
    makeCorpse(Game, 'hushwolf');
    reveal(Game, 'hushwolf');
    const ctx = {};
    delete process.env.HAULDRIVE;
    const took0 = hd.freshHaul(Game, ctx);
    check('A1 RED: gate-off freshHaul is a pure no-op',
      took0 === 0 && corpseMeatCount(Game) === 1 && !(ctx.hdHauled > 0),
      `took=${took0} corpseMeat=${corpseMeatCount(Game)}`);
    process.env.HAULDRIVE = '1';
    const took1 = hd.freshHaul(Game, ctx);
    const inPack = packOf(Game).filter(i => String(i.plantId || '') === 'meat_hushwolf');
    check('A1 GREEN: revealed species hauled via the honest verb',
      took1 > 0 && inPack.length === 1 && corpseMeatCount(Game) === 0 && (ctx.hdHauled || 0) === took1,
      `took=${took1} inPack=${inPack.length} corpseLeft=${corpseMeatCount(Game)}`);
    delete process.env.HAULDRIVE;
  }
  // ---- A2: knowledge law (unknown flesh never vacuumed) ----
  {
    const Game = await freshGame();
    makeCorpse(Game, 'bulldozer'); // NOT revealed
    const ctx = {};
    process.env.HAULDRIVE = '1';
    const took = hd.freshHaul(Game, ctx);
    const inPack = packOf(Game).filter(i => String(i.plantId || '') === 'meat_bulldozer');
    check('A2 knowledge law: unknown flesh untouched, never vacuumed',
      took === 0 && inPack.length === 0 && corpseMeatCount(Game) === 1,
      `took=${took} inPack=${inPack.length} corpseLeft=${corpseMeatCount(Game)}`);
    delete process.env.HAULDRIVE;
  }
  // ---- A3: trembles (meat_human never hauled) ----
  {
    const Game = await freshGame();
    const c = makeCorpse(Game, 'hushwolf', { plantId: 'meat_human' });
    reveal(Game, 'hushwolf');
    const ctx = {};
    process.env.HAULDRIVE = '1';
    const took = hd.freshHaul(Game, ctx);
    const inPack = packOf(Game).filter(i => String(i.plantId || '') === 'meat_human');
    check('A3 trembles: meat_human untouched even with gate on',
      took === 0 && inPack.length === 0,
      `took=${took} inPack=${inPack.length}`);
    delete process.env.HAULDRIVE;
  }
  // ---- A4: clean on-site ----
  {
    // GREEN with knife: hauled carcass of a revealed species cleans to
    // edible:true with real kcalEach (carcassToMeat reveals on knowledge).
    const Game = await freshGame();
    makeCorpse(Game, 'hushwolf');
    reveal(Game, 'hushwolf');
    const ctx = {};
    process.env.HAULDRIVE = '1';
    const took = hd.freshHaul(Game, ctx);
    const cleaned = hd.cleanOnSite(Game, ctx, took);
    const meat = packOf(Game).find(i => String(i.plantId || '') === 'meat_hushwolf');
    check('A4 GREEN clean: knife + hauled carcass → cleaned, edible:true, real kcal',
      cleaned > 0 && meat && meat.foodState === 'cleaned' && meat.edible === true && (meat.kcalEach || 0) > 0,
      `cleaned=${cleaned} state=${meat && meat.foodState} edible=${meat && meat.edible} kcalEach=${meat && meat.kcalEach}`);
    delete process.env.HAULDRIVE;
  }
  {
    // RED: gate off → no clean.
    const Game = await freshGame();
    makeCorpse(Game, 'hushwolf');
    reveal(Game, 'hushwolf');
    const ctx = {};
    delete process.env.HAULDRIVE;
    check('A4 RED: gate-off cleanOnSite is a no-op', hd.cleanOnSite(Game, ctx, 1) === 0);
  }
  {
    // Knifeless: honest once/day skip, meat stays carcass-state.
    const Game = await freshGame();
    Game.state.scholar.inventory = []; // no knife
    makeCorpse(Game, 'hushwolf');
    reveal(Game, 'hushwolf');
    const ctx = {};
    process.env.HAULDRIVE = '1';
    const took = hd.freshHaul(Game, ctx);
    const cleaned = hd.cleanOnSite(Game, ctx, took);
    const meat = packOf(Game).find(i => String(i.plantId || '') === 'meat_hushwolf');
    check('A4 knifeless: honest skip, carcass rides home whole',
      cleaned === 0 && meat && meat.foodState === 'carcass' && (ctx.hdKnifeSkips || 0) === 1,
      `cleaned=${cleaned} state=${meat && meat.foodState} skips=${ctx.hdKnifeSkips || 0}`);
    // second call same day: no repeat narration (no spam)
    const skipsBefore = ctx.hdKnifeSkips || 0;
    hd.cleanOnSite(Game, ctx, took);
    check('A4 knifeless: skip narrated once/day only', (ctx.hdKnifeSkips || 0) === skipsBefore);
    delete process.env.HAULDRIVE;
  }
  // ---- A5: cautious test via the wrapped daily (gate-gated) ----
  {
    const Game = await freshGame();
    // unknown flesh in the pack for the tester to find
    Game.state.scholar.inventory.push({
      plantId: 'meat_gallowdeer', foodKind: 'meat', foodState: 'cleaned',
      edible: false, units: 2, kcalEach: 0, hiddenKcal: 1500,
      spoilDay: dayOf(Game) + 2, name: 'Unknown flesh', kg: 0.5,
    });
    const p = hd.policyForRun('leadcourt');
    const ctx = {};
    delete process.env.HAULDRIVE;
    const safeBefore = Game.monsterFoodSafe('gallowdeer');
    // gate-off daily: the base daily runs, but no test fires
    try { p.daily(Game, ctx); } catch (e) {}
    const testedOff = (ctx.meatTests || 0);
    process.env.HAULDRIVE = '1';
    try { p.daily(Game, ctx); } catch (e) {}
    const testedOn = (ctx.meatTests || 0);
    const safeAfter = Game.monsterFoodSafe('gallowdeer');
    check('A5 cautious test: gate-off daily tests nothing; gate-on tests once/day',
      testedOff === 0 && testedOn === 1 && safeBefore === false && safeAfter === true,
      `off=${testedOff} on=${testedOn} safe ${safeBefore}→${safeAfter}`);
    delete process.env.HAULDRIVE;
  }
  // ---- A6: composition ----
  {
    const p = hd.policyForRun('leadcourt');
    check('A6 policyForRun leadcourt chains', typeof p.upkeep === 'function' && /hauldrive$/.test(p.id || ''), 'id=' + p.id);
    const p2 = hd.policyForRun('belongseek');
    check('A6 policyForRun belongseek chains', typeof p2.upkeep === 'function' && /hauldrive$/.test(p2.id || ''), 'id=' + p2.id);
    let threw = false;
    try { hd.policyForRun('nope'); } catch (e) { threw = true; }
    check('A6 policyForRun rejects unknown policy', threw);
  }
  // ---- A7: sampleUnknown (the corpse-side discovery prompt) ----
  {
    // RED: gate off → no-op.
    const Game = await freshGame();
    makeCorpse(Game, 'bulldozer'); // unknown
    const ctx = {};
    delete process.env.HAULDRIVE;
    check('A7 RED: gate-off sampleUnknown is a no-op',
      hd.sampleUnknown(Game, ctx) === 0 && corpseMeatCount(Game) === 1);
  }
  {
    // GREEN: unknown flesh of untested species → one sample taken, narrated.
    const Game = await freshGame();
    makeCorpse(Game, 'bulldozer');
    const ctx = {};
    process.env.HAULDRIVE = '1';
    const n = hd.sampleUnknown(Game, ctx);
    const inPack = packOf(Game).filter(i => String(i.plantId || '') === 'meat_bulldozer');
    check('A7 GREEN: one unknown sample taken for the cautious test',
      n === 1 && inPack.length === 1 && (ctx.hdSampled || 0) === 1,
      `n=${n} inPack=${inPack.length} hdSampled=${ctx.hdSampled || 0}`);
    // Second call: pack now holds an untested sample → no stockpiling.
    makeCorpse(Game, 'gallowdeer');
    check('A7 no-stockpile: second sample blocked while one awaits testing',
      hd.sampleUnknown(Game, ctx) === 0 && (ctx.hdSampled || 0) === 1);
    delete process.env.HAULDRIVE;
  }
  {
    // Tested species (safe or poison) are never re-sampled.
    const Game = await freshGame();
    makeCorpse(Game, 'bulldozer');
    reveal(Game, 'bulldozer'); // safe
    makeCorpse(Game, 'gallowdeer');
    // mark gallowdeer poison-tested directly
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters['gallowdeer'] = { foodSafe: false, foodTested: 'poison' };
    const ctx = {};
    process.env.HAULDRIVE = '1';
    // bulldozer is revealed → freshHaul would take it, not sampleUnknown;
    // gallowdeer is poison-tested → skipped. So sampleUnknown takes nothing.
    // (Remove the bulldozer corpse to isolate the poison case.)
    Game.state.corpses = Game.state.corpses.filter(c => c.monsterId !== 'bulldozer');
    check('A7 poison-tested species never re-sampled',
      hd.sampleUnknown(Game, ctx) === 0 && corpseMeatCount(Game) === 1);
    delete process.env.HAULDRIVE;
  }
}

async function partB() {
  console.log('PART B — det-gate (gate-OFF wrapped vs pristine, byte-identical)');
  const fs_ = require('./policies/feastscale');
  for (const seed of [171, 282]) {
    for (const pid of ['leadcourt', 'belongseek']) {
      const pristine = pid === 'leadcourt' ? fs_.leadfeast : fs_.belongfeast;
      delete process.env.HAULDRIVE;
      process.env.FEASTSCALE_R13 = '1';
      const wrapped = hd.policyForRun(pid); // gate off → pure delegation
      const hashes = [];
      for (const pol of [pristine, wrapped]) {
        const { Game } = await loadGame({ seed, mode: 'hauldrive-det-' + pid, fullTelemetry: false });
        await setupGame(Game);
        const hs = [];
        const od = pol.daily;
        const pw = Object.assign({}, pol);
        pw.daily = (G, ctx) => { hs.push(dayHash(G)); if (od) return od(G, ctx); };
        await quietLog(async () => { await runDays(Game, pw, { days: 30, manifest: undefined, sampleEvery: 10 }); });
        hashes.push(hs.join('\n'));
      }
      check(`B det [${pid} s${seed}] gate-off trajectories byte-identical`,
        hashes[0] === hashes[1] && hashes[0].length > 0,
        `len=${hashes[0].length}`);
    }
  }
  delete process.env.FEASTSCALE_R13;
}

async function partC() {
  console.log('PART C — SMOKE layer-live marker honesty');
  delete process.env.HAULDRIVE;
  const off = hd.layerOn() === false;
  process.env.HAULDRIVE = '1';
  const on = hd.layerOn() === true;
  delete process.env.HAULDRIVE;
  check('C layerOn() === (HAULDRIVE==="1")', off && on, `off=${off} on=${on}`);
}

async function partD() {
  console.log('PART D — zero-firing purity (gate-ON no-fire vs gate-OFF, byte-identical)');
  // A rigged world: no revealed species, so freshHaul's fire check finds
  // nothing; the cautious test finds no unknown flesh either. Gate-ON must
  // then be trajectory-identical to gate-OFF — proving the fire checks are
  // pure reads (the monstermeat nearFire lesson).
  const fs_ = require('./policies/feastscale');
  for (const seed of [171]) {
    for (const pid of ['leadcourt']) {
      process.env.FEASTSCALE_R13 = '1';
      const hashes = [];
      for (const armed of [false, true]) {
        if (armed) process.env.HAULDRIVE = '1'; else delete process.env.HAULDRIVE;
        const pol = armed ? hd.policyForRun(pid) : fs_.leadfeast;
        const { Game } = await loadGame({ seed, mode: 'hauldrive-purity-' + pid, fullTelemetry: false });
        await setupGame(Game);
        const hs = [];
        const od = pol.daily;
        const pw = Object.assign({}, pol);
        pw.daily = (G, ctx) => { hs.push(dayHash(G)); if (od) return od(G, ctx); };
        await quietLog(async () => { await runDays(Game, pw, { days: 30, manifest: undefined, sampleEvery: 10 }); });
        hashes.push(hs.join('\n'));
      }
      delete process.env.HAULDRIVE;
      check(`D purity [${pid} s${seed}] gate-ON no-fire byte-identical to gate-OFF`,
        hashes[0] === hashes[1] && hashes[0].length > 0,
        `len=${hashes[0].length}`);
    }
  }
  delete process.env.FEASTSCALE_R13;
}

async function main() {
  if (process.env.SMOKE === '1') { await partC(); }
  else { await partA(); await partB(); await partC(); await partD(); }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
