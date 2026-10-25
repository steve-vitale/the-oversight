// test-journey-deepening-r44-20261025.js -- proof for the R44 lever set.
// (1) FIX1: prep-stash butchering fires the hide-handling beat (hide_armor
//     L0 -> L1), while a non-scholar container does NOT (scholar-only).
// (2) FIX2: gatherFallen on a tree cell yields bark strips (1 per branch);
//     on a bush cell it yields branches only (no bark).
// (3) CHAIN (unchanged game rule, exercised): craft() still reads ONLY the
//     pack (prep-only materials block), and the existing takePrepMaterial
//     path moves prep hide/vine into the pack, after which craft() makes
//     hide_armor. This is the chain the R44 PREP_PULL policy step uses.
// (4) INSTRUMENTS: the R44 harness smoke run (seed 99, DAYCAP=45,
//     CRAFT_ARMOR=1, PREP_PULL=1) populates the armor block, the intraday
//     matflow, the FORAGE_PROBE fields, and prepPulls; a second identical
//     run reproduces the same metric aggregates (determinism).
// Usage: node scripts/test-journey-deepening-r44-20261025.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-25';
const SEED = 99;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const matCount = (Game, arr, mat) => (arr || []).filter(i => i.material === mat).reduce((t, i) => t + (i.units || 0), 0);
const packMats = (Game) => ({ bark: matCount(Game, Game.state.scholar.inventory, 'bark'), vine: matCount(Game, Game.state.scholar.inventory, 'vine'), hide: matCount(Game, Game.state.scholar.inventory, 'hide'), branch: matCount(Game, Game.state.scholar.inventory, 'branch') });

(async () => {
  // ============ P1: hide beat, prep-stash butchering ============
  {
    const { Game } = await loadGame({ seed: 12345, mode: 'r44-p1' });
    await setupGame(Game);
    const lvl = () => (((Game.state.codex || {}).recipes || {}).hide_armor || {}).level || 0;
    ok('P1 hide_armor starts L0', lvl() === 0, `level=${lvl()}`);
    const animal = (Game.data.animals || []).find(a => a.id === 'white_tailed_deer');
    ok('P1 deer def found with hide yield', !!(animal && (animal.butcher || {}).hide === 2), JSON.stringify(animal && animal.butcher));
    // Control FIRST: a plain non-scholar container must NOT fire the beat.
    const dummy = [];
    dummy.push(Game.foodCarcass(animal, 20000, Game.state.scholar.day || 1, 'hunted'));
    Game.carcassToMeat(dummy, 0, null);
    ok('P1 dummy-container butcher does not fire beat', lvl() === 0, `level=${lvl()}`);
    ok('P1 dummy-container butcher still yields hide', matCount(Game, dummy, 'hide') >= 2, `hide=${matCount(Game, dummy, 'hide')}`);
    // Now the prep counter: the scholar's own staging counter.
    const prep = Game.prepStash();
    prep.push(Game.foodCarcass(animal, 20000, Game.state.scholar.day || 1, 'hunted'));
    const idx = prep.length - 1;
    Game.carcassToMeat(prep, idx, null);
    ok('P1 prep-stash butcher yields hide on the counter', matCount(Game, prep, 'hide') >= 2, `hide=${matCount(Game, prep, 'hide')}`);
    ok('P1 prep-stash butcher fires hide beat (L0 -> L1)', lvl() === 1, `level=${lvl()}`);
  }

  // ============ P2: gatherFallen bark ============
  {
    const { Game } = await loadGame({ seed: 54321, mode: 'r44-p2' });
    await setupGame(Game);
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    const mx = Game.state.scholar.mx ?? 4, my = Game.state.scholar.my ?? 4;
    // Find an adjacent tree cell; if none, stage one and verify persistence.
    let tc = null;
    for (let dy = -1; dy <= 1 && !tc; dy++) for (let dx = -1; dx <= 1 && !tc; dx++) {
      if (!dx && !dy) continue;
      const cx = mx + dx, cy = my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      if (detail[cy] && detail[cy][cx] === 'tree') tc = [cx, cy];
    }
    if (!tc) {
      const cx = Math.min(8, mx + 1), cy = my;
      detail[cy][cx] = 'tree';
      const again = Game.genDetail(Game.map.px, Game.map.py);
      if (again[cy] && again[cy][cx] === 'tree') tc = [cx, cy];
    }
    ok('P2 adjacent tree cell available', !!tc, `mx=${mx} my=${my}`);
    if (tc) {
      const before = packMats(Game);
      Game.gatherFallen(tc[0], tc[1]);
      const after = packMats(Game);
      ok('P2 tree deadfall yields branches', after.branch > before.branch, `branch ${before.branch}->${after.branch}`);
      ok('P2 tree deadfall yields bark strips', after.bark > before.bark, `bark ${before.bark}->${after.bark}`);
      ok('P2 tree deadfall bark equals branches gained', (after.bark - before.bark) === (after.branch - before.branch), `dBark=${after.bark - before.bark} dBranch=${after.branch - before.branch}`);
    }
    // Control: brush deadfall gives branches, NOT bark.
    const detail2 = Game.genDetail(Game.map.px, Game.map.py);
    let bc = null;
    for (let dy = -1; dy <= 1 && !bc; dy++) for (let dx = -1; dx <= 1 && !bc; dx++) {
      if (!dx && !dy) continue;
      const cx = mx + dx, cy = my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      if (detail2[cy] && (detail2[cy][cx] === 'bush' || detail2[cy][cx] === 'thicket')) bc = [cx, cy];
    }
    if (!bc) {
      const cx = Math.min(8, mx + 1), cy = Math.min(8, my + 1);
      detail2[cy][cx] = 'bush';
      const again = Game.genDetail(Game.map.px, Game.map.py);
      if (again[cy] && (again[cy][cx] === 'bush' || again[cy][cx] === 'thicket')) bc = [cx, cy];
    }
    ok('P2 adjacent brush cell available', !!bc);
    if (bc) {
      const before = packMats(Game);
      Game.gatherFallen(bc[0], bc[1]);
      const after = packMats(Game);
      ok('P2 brush deadfall yields branches', after.branch > before.branch, `branch ${before.branch}->${after.branch}`);
      ok('P2 brush deadfall yields NO bark', after.bark === before.bark, `bark ${before.bark}->${after.bark}`);
    }
  }

  // ============ P3: prep -> pack -> craft chain ============
  {
    const { Game } = await loadGame({ seed: 999, mode: 'r44-p3' });
    await setupGame(Game);
    // Stage the scholar at camp (village tile) so the counter is in reach.
    const v = Game.state.village || {};
    Game.map.px = v.px ?? 4; Game.map.py = v.py ?? 4;
    ok('P3 scholar at camp', Game.atCamp() === true);
    const prep = Game.prepStash();
    prep.push({ material: 'hide', units: 2, name: 'Rawhides', kcalEach: 0, spoilDay: 9999, kg: 1.0 });
    prep.push({ material: 'vine', units: 1, name: 'Vine', kcalEach: 0, spoilDay: 9999, kg: 0.1 });
    Game.grantKnowledge('recipe', 'hide_armor', 2, { type: 'discovery' });
    const lvl = () => (((Game.state.codex || {}).recipes || {}).hide_armor || {}).level || 0;
    ok('P3 hide_armor at L2 (materials known)', lvl() === 2, `level=${lvl()}`);
    // Control: craft reads the pack only — prep-only materials block.
    const blocked = Game.craft('hide_armor');
    ok('P3 craft blocked while materials sit only on the counter', blocked == null, `craft=${blocked}`);
    // Pull via the game's own counter action, re-finding indices each time.
    for (const mat of ['hide', 'vine']) {
      const stash = Game.prepStash();
      const idx = stash.findIndex(it => it && it.material === mat);
      if (idx >= 0) { const r = Game.takePrepMaterial(idx); ok(`P3 takePrepMaterial pulls ${mat}`, r && r.ok && r.taken > 0, JSON.stringify(r)); }
    }
    const pack = packMats(Game);
    ok('P3 pack holds hide + vine after pull', pack.hide >= 2 && pack.vine >= 1, JSON.stringify(pack));
    // Force the 85% roll to succeed (stub global RNG around the one call).
    const realRandom = Math.random;
    Math.random = () => 0;
    let made = null;
    try { made = Game.craft('hide_armor'); } finally { Math.random = realRandom; }
    ok('P3 craft makes hide_armor from pulled materials', made === true, `craft=${made}`);
    const madeItem = (Game.state.scholar.inventory || []).find(it => it.itemId === 'hide_armor' || it.name === 'Hide armor');
    ok('P3 crafted hide_armor lands in the pack', !!madeItem, JSON.stringify(madeItem));
  }

  // ============ P4: harness instruments + determinism ============
  const jsonFp = path.join(EVIDIR, `journey-deepening-r44-seed${SEED}.json`);
  const txRe = new RegExp(`^journey-deepening-r44-transcript-${SEED}-day\\d+\\.txt$`);
  function cleanup() {
    try { fs.unlinkSync(jsonFp); } catch (e) {}
    try { for (const f of fs.readdirSync(EVIDIR)) if (txRe.test(f)) { try { fs.unlinkSync(path.join(EVIDIR, f)); } catch (e) {} } } catch (e) {}
  }
  function runOnce() {
    cleanup();
    execFileSync('node', [path.join(ROOT, 'scripts', 'journey-deepening-r44-20261025.js')], {
      cwd: ROOT,
      env: Object.assign({}, process.env, { POLICY: 'competent', CRAFT_ARMOR: '1', PREP_PULL: '1', SEEDS: String(SEED), DAYCAP: '45' }),
      stdio: 'pipe', timeout: 600000,
    });
    return JSON.parse(fs.readFileSync(jsonFp, 'utf8'));
  }
  console.log('run 1 (seed 99, DAYCAP=45)...');
  const a = runOnce();
  const mf = a.armor && a.armor.matflow && a.armor.matflow.intraday;
  ok('P4 armor block present', !!a.armor);
  ok('P4 intraday present', !!mf, JSON.stringify(Object.keys((a.armor && a.armor.matflow) || {})));
  ok('P4 forage probe fields present', mf && mf.forageTileTypes !== undefined && mf.forageWoodCalls !== undefined && mf.forageBareCalls !== undefined, JSON.stringify(mf && { tc: mf.forageTileTypes, wood: mf.forageWoodCalls, bare: mf.forageBareCalls }));
  ok('P4 forage calls recorded', mf && mf.forageCalls > 0, `calls=${mf && mf.forageCalls}`);
  ok('P4 prepPulls present', a.armor && a.armor.prepPulls !== undefined && a.armor.prepPullOn === true, JSON.stringify(a.armor && a.armor.prepPulls));
  ok('P4 transcripts written', Array.isArray(a.convoFiles) && a.convoFiles.length >= 1, JSON.stringify(a.convoFiles));
  console.log('run 2 (determinism)...');
  const b = runOnce();
  const mfb = b.armor && b.armor.matflow && b.armor.matflow.intraday;
  const aggOf = (m) => m && JSON.stringify({ fc: m.forageCalls, fb: m.forageBarkTotal, fv: m.forageVineTotal, tt: m.forageTileTypes, wc: m.forageWoodCalls, bc: m.forageBareCalls, bt: m.forageBareTotal, gc: m.gatherCalls, gb: m.gatherBarkTotal, hh: m.hideHandledEvents, hu: m.hideHandledUnits });
  ok('P4 probe aggregates byte-identical across runs', aggOf(mf) === aggOf(mfb), `\n  run1=${aggOf(mf)}\n  run2=${aggOf(mfb)}`);
  ok('P4 prepPulls identical across runs', JSON.stringify(a.armor.prepPulls) === JSON.stringify(b.armor.prepPulls), `${JSON.stringify(a.armor.prepPulls)} vs ${JSON.stringify(b.armor.prepPulls)}`);
  cleanup();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF ERROR:', e && e.stack || e); process.exit(2); });
