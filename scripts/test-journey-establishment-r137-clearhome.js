#!/usr/bin/env node
// Proof test for the r137 travel-home clear-home fix (journey-establishment
// r137 2026-11-14).
//
// r136's next blank, verbatim: when a fallen tree (or rubble / washed-out
// gap) blocks the path home, travelHome84 tries one hop, fails, and the
// wedge gives up for the dawn — Pablo sat 6 dawns at the map edge,
// Hiroshi 4. The player HAS the honest verb ("Clear the fallen tree" —
// cut it, +2 wood). The wedge needs blockage-clearing (or routing
// around) on its homeward path.
//
// Diagnosis (code reading, NOT a game defect): two game verbs already
// exist and the wedge used neither. Game.walkHome(maxSteps) is the
// compass's way home as an action — one tile at a time through travelTo,
// longer axis first, then the other, then a perpendicular sidestep —
// stopping honestly with blocked {kind, blockType, x, y} named.
// Game.clearBlockage(x, y) is the honest player verb for a clearable
// blockage (fallen_tree: cut, +2 wood; rubble: clear, +stone;
// washed_out: bridge if wood >= 4, else scramble). A creek is NOT
// clearable by hand. The fix is driver-only (no src/js): the r137
// driver's travelHome84 walks home with Game.walkHome(12) and, when the
// stopping block is clearable, clears it with Game.clearBlockage and
// retries — up to 3 clears per call; a creek stops honestly, never
// loops. This test proves the mechanism on a harness-loaded Game and
// the driver determinism:
//   A: staged Pablo (broken run, player at (6,4), fallen trees on the
//      direct tile + both sidesteps): walkHome stops blocked, the
//      stopping tree clears, walkHome again reaches home, ending ready,
//      wood +2 for the cut.
//   B: after walking home, press dlg:favor_cancel: the run closes,
//      trust does not drop, the run is no longer live.
//   C (control): open path -> walkHome reaches home in one call.
//   D: creek block -> walkHome stops with blockType 'creek';
//      clearBlockage refuses (false) and the creek still blocks.
//   E: rubble / washed-out clear shapes (stone yield; scramble with
//      wood < 4; bridge with wood >= 4).
//   F (source): the r137 driver walks home + clears + records clears,
//      never hop-loops in travelHome84, and its CLEARABLE set excludes
//      creek. Fail-control: the r136 driver contains 0 occurrences of
//      walkHome/clearBlockage — F fails on it by construction.
//   G (det-gate): the r137 driver run twice on 5d seed 2801 produces
//      byte-identical JSON + convo txt.
// Setup mirrors test-journey-establishment-r136-threadpage.js (broken
// run) + staged blockages via tileAt().blockFrom (travelBlockage's
// approach-side rule: bf.dx === -sign(x - playerX)).
// Usage: node scripts/test-journey-establishment-r137-clearhome.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');
const DRIVER = path.join(__dirname, 'journey-establishment-r137-20261114.js');
const OLD_DRIVER = path.join(__dirname, 'journey-establishment-r136-20261113.js');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
async function freshGame() {
  const { Game } = await loadGame({ seed: 385, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const day0 = (Game.state.scholar || {}).day || 0;
  const living = ((Game.state.village || {}).roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  const v = Game.state.village || {};
  const home = (Number.isFinite(v.px) && Number.isFinite(v.py)) ? { x: v.px, y: v.py } : { x: 4, y: 4 };
  if (Number.isFinite(v.px) && Number.isFinite(v.py)) { Game.map.px = v.px; Game.map.py = v.py; }
  Game.dayPart = 0;
  function promisedFavor(vid, kind) {
    const f = { id: 'test-' + kind + '-' + String(vid), vid, kind, goal: kind, task: 'test ' + kind,
      state: 'asked', askedDay: day0 - 7, deadline: (day0 - 7) + 2, line: '"test"', short: 'test' };
    Game.convoStoreFavor(f);
    const r = Game.convoFavorCommit(vid, f);
    return { f, r };
  }
  function placeAdjacent(vid) {
    const vv = Game.state.village || {}, s = Game.state.scholar || {};
    vv.nodePos = vv.nodePos || {}; vv.nodePos[vid] = { nx: home.x, ny: home.y };
    vv.positions = vv.positions || {};
    vv.positions[vid] = { mx: (s.mx ?? 4), my: (s.my ?? 4) };
    vv.npcInside = vv.npcInside || {}; vv.npcInside[vid] = false;
    s.insideHaven = false;
    if (vv.away) delete vv.away[vid];
  }
  function liveRun(vid, f) {
    f.forageRun = { bearer: Game.villagerId, startedDay: day0, playerHaul: [], partnerHaul: [],
      forageCount: 0, talked: false, talkCount: 0, returned: false, deliveredKcal: 0 };
    placeAdjacent(vid);
    return f.forageRun;
  }
  function breakRun(vid, f) {
    f.state = 'broken';
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'broken'; p.closedReason = 'deadline'; p.closedDay = day0; }
  }
  function trustOf(vid) { try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined || t === null) ? null : t; } catch (e) { return null; } }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {} }
  // Move the player to (x, y) on the map (node position + micro match).
  function movePlayer(x, y) { Game.map.px = x; Game.map.py = y; try { Game.state.scholar.mx = x; Game.state.scholar.my = y; } catch (e) {} }
  // Stage a fallen-tree blockage on tile (x, y) guarding the approach
  // from (fx, fy): bf.dx/dy point FROM the tile TOWARD the approach
  // origin (travelBlockage: blocked when bf.dx === -sign(x - fx)).
  function stageTree(x, y, fx, fy) {
    const t = Game.tileAt(x, y);
    t.blockFrom = { type: 'fallen_tree', dx: Math.sign(fx - x), dy: Math.sign(fy - y) };
    return t;
  }
  function stageCreek(x, y) {
    const t = Game.tileAt(x, y);
    t.type = 'creek'; t.needsBridge = true; t.bridged = false;
    delete t.blockFrom;
    return t;
  }
  return { Game, day0, living, home, promisedFavor, liveRun, breakRun, trustOf, endSit, movePlayer, stageTree, stageCreek, placeAdjacent };
}
async function main() {
  // A: staged Pablo — broken run, player at (6,4), trees on the direct
  // tile (5,4) and both sidesteps (6,5)/(6,3) as approached from (6,4).
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f); t.breakRun(vid, c.f);
    t.movePlayer(6, 4);
    t.stageTree(5, 4, 6, 4); t.stageTree(6, 5, 6, 4); t.stageTree(6, 3, 6, 4);
    const woodBefore = (() => { try { return t.Game.woodCount(); } catch (e) { return null; } })();
    const w1 = t.Game.walkHome(12);
    check('A1 walkHome stops, not reached', !!(w1 && !w1.reached), JSON.stringify(w1 && { reached: w1.reached, blocked: w1.blocked, interrupted: w1.interrupted }));
    check('A2 stopping block is a fallen tree with coords', !!(w1 && w1.blocked && w1.blocked.blockType === 'fallen_tree' && Number.isFinite(w1.blocked.x) && Number.isFinite(w1.blocked.y)), JSON.stringify(w1 && w1.blocked));
    let cleared = false;
    try { cleared = !!t.Game.clearBlockage(w1.blocked.x, w1.blocked.y); } catch (e) { cleared = false; }
    check('A3 clearBlockage clears the stopping tree', cleared);
    check('A4 cleared tile no longer blocks', (() => { try { return t.Game.travelBlockage(w1.blocked.x, w1.blocked.y) === null; } catch (e) { return false; } })());
    const woodAfter = (() => { try { return t.Game.woodCount(); } catch (e) { return null; } })();
    check('A5 cutting the tree yields +2 wood', woodBefore !== null && woodAfter === woodBefore + 2, `before=${woodBefore} after=${woodAfter}`);
    const w2 = t.Game.walkHome(12);
    check('A6 walkHome retry reaches home', !!(w2 && w2.reached), JSON.stringify(w2 && { reached: w2.reached, steps: w2.steps, blocked: w2.blocked }));
    check('A7 player is home after the retry', t.Game.map.px === t.home.x && t.Game.map.py === t.home.y, `at=(${t.Game.map.px},${t.Game.map.py}) home=(${t.home.x},${t.home.y})`);
    // Ending readiness is judged at home with the partner adjacent
    // (same staging as the r136 probe — the walk changed position only).
    // Re-place the partner WITHOUT resetting the broken run.
    t.placeAdjacent(vid);
    check('A8 ending status ready forage_end after walking home', (() => { try { const s = t.Game.forageFavorAction(vid, c.f, true); return !!(s && s.ready && s.action === 'forage_end'); } catch (e) { return false; } })());
    t.endSit(vid);
  }
  // B: after walking home, press dlg:favor_cancel — the run closes.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f); t.breakRun(vid, c.f);
    t.movePlayer(6, 4);
    t.stageTree(5, 4, 6, 4); t.stageTree(6, 5, 6, 4); t.stageTree(6, 3, 6, 4);
    const w1 = t.Game.walkHome(12);
    if (w1 && !w1.reached && w1.blocked) { try { t.Game.clearBlockage(w1.blocked.x, w1.blocked.y); } catch (e) {} }
    const w2 = t.Game.walkHome(12);
    check('B0 walk-home-then-clear reaches home', !!(w2 && w2.reached));
    t.placeAdjacent(vid);
    const trustBefore = t.trustOf(vid);
    const o = t.Game.startConvo(vid);
    const ids = ((o && o.choices) || []).map(x => x.id);
    check('B1 cancel offered at home after the walk', ids.includes('dlg:favor_cancel'), 'choices=' + JSON.stringify(ids));
    let res = null;
    try { res = t.Game.convoTurn(vid, 'dlg:favor_cancel'); } catch (e) { res = { error: String(e && e.message) }; }
    check('B2 cancel press closes run', !!(c.f.forageRun && c.f.forageRun.returned === true), 'res=' + JSON.stringify(res && res.line ? String(res.line).slice(0, 160) : res));
    check('B3 run no longer live', (() => { try { return !t.Game.forageFavorCompanions().includes(vid); } catch (e) { return false; } })());
    check('B4 trust does not drop on end press', t.trustOf(vid) >= trustBefore, 'before=' + trustBefore + ' after=' + t.trustOf(vid));
    t.endSit(vid);
  }
  // C (control): open path -> walkHome reaches home in one call.
  {
    const t = await freshGame();
    t.movePlayer(6, 4);
    const w = t.Game.walkHome(12);
    check('C1 walkHome reaches home on an open path', !!(w && w.reached), JSON.stringify(w && { reached: w.reached, steps: w.steps }));
    check('C2 no block named on an open path', !!(w && w.blocked === null), JSON.stringify(w && w.blocked));
  }
  // D: creek block -> walkHome stops with blockType 'creek';
  // clearBlockage refuses and the creek still blocks.
  {
    const t = await freshGame();
    t.movePlayer(6, 4);
    t.stageCreek(5, 4); t.stageCreek(6, 5); t.stageCreek(6, 3);
    const w = t.Game.walkHome(12);
    check('D1 walkHome stops on a creek', !!(w && !w.reached), JSON.stringify(w && { reached: w.reached, blocked: w.blocked }));
    check('D2 stopping block is a creek', !!(w && w.blocked && w.blocked.blockType === 'creek'), JSON.stringify(w && w.blocked));
    let cleared = null;
    try { cleared = t.Game.clearBlockage(w.blocked.x, w.blocked.y); } catch (e) { cleared = 'error:' + e.message; }
    check('D3 clearBlockage refuses a creek', cleared === false, 'returned=' + JSON.stringify(cleared));
    check('D4 creek still blocks after the refused clear', (() => { try { const b = t.Game.travelBlockage(w.blocked.x, w.blocked.y); return !!(b && b.blockType === 'creek'); } catch (e) { return false; } })());
  }
  // E: rubble / washed-out clear shapes (direct clearBlockage calls).
  {
    const t = await freshGame();
    t.movePlayer(6, 4);
    const tile = t.Game.tileAt(5, 4);
    tile.blockFrom = { type: 'rubble', dx: 1, dy: 0 };
    const invBefore = (t.Game.state.scholar.inventory || []).length;
    let ok = false;
    try { ok = !!t.Game.clearBlockage(5, 4); } catch (e) { ok = false; }
    check('E0 rubble clears', ok);
    check('E1 rubble yields stone in inventory', (t.Game.state.scholar.inventory || []).length > invBefore, `inv ${invBefore} -> ${(t.Game.state.scholar.inventory || []).length}`);
    const tile2 = t.Game.tileAt(5, 4);
    tile2.blockFrom = { type: 'washed_out', dx: 1, dy: 0 };
    const woodNow = (() => { try { return t.Game.woodCount(); } catch (e) { return 99; } })();
    check('E2 wood below bridge cost for the scramble shape', woodNow < 4, `wood=${woodNow}`);
    let ok2 = false;
    try { ok2 = !!t.Game.clearBlockage(5, 4); } catch (e) { ok2 = false; }
    check('E3 washed-out scrambles through with wood < 4', ok2 && !t.Game.tileAt(5, 4).blockFrom, 'ok=' + ok2);
  }
  {
    const t = await freshGame();
    t.movePlayer(6, 4);
    try { t.Game.addWood(4); } catch (e) {}
    const woodNow = (() => { try { return t.Game.woodCount(); } catch (e) { return null; } })();
    const tile = t.Game.tileAt(5, 4);
    tile.blockFrom = { type: 'washed_out', dx: 1, dy: 0 };
    let ok = false;
    try { ok = !!t.Game.clearBlockage(5, 4); } catch (e) { ok = false; }
    const woodAfter = (() => { try { return t.Game.woodCount(); } catch (e) { return null; } })();
    check('E4 washed-out bridges with wood >= 4', ok && t.Game.tileAt(5, 4).bridged === true && !t.Game.tileAt(5, 4).blockFrom, `ok=${ok} wood ${woodNow}->${woodAfter} bridged=${t.Game.tileAt(5, 4).bridged}`);
    check('E5 bridge spends 4 wood', woodNow !== null && woodAfter === woodNow - 4, `wood ${woodNow}->${woodAfter}`);
  }
  // F (source): the r137 driver walks home + clears + records clears,
  // never hop-loops inside travelHome84, and excludes creek.
  {
    const src = fs.readFileSync(DRIVER, 'utf8');
    check('F1 driver calls Game.walkHome', /Game\.walkHome\(12\)/.test(src));
    check('F2 driver calls Game.clearBlockage on the blocked tile', /Game\.clearBlockage\(blocked\.x, blocked\.y\)/.test(src));
    check('F3 driver records clears', /clears\.push\(\{ type: blocked\.blockType/.test(src));
    check('F4 driver travelHome84 never calls travelStep84', (() => { const m = src.match(/function travelHome84\(\) \{[\s\S]*?\n  \}/); return !!(m && !/travelStep84/.test(m[0])); })());
    check('F5 driver CLEARABLE set has fallen_tree/rubble/washed_out, no creek', /CLEARABLE = \{ fallen_tree: 1, rubble: 1, washed_out: 1 \}/.test(src) && !/CLEARABLE[^}]*creek/.test(src));
    check('F6 driver caps clears per call', /attempt < 4/.test(src));
    // Fail-control: the r136 driver has no walkHome/clearBlockage.
    const old = fs.readFileSync(OLD_DRIVER, 'utf8');
    check('F7 (fail-control) r136 driver has no walkHome', !/walkHome/.test(old));
    check('F8 (fail-control) r136 driver has no clearBlockage', !/clearBlockage/.test(old));
  }
  // G (det-gate): r137 driver twice, 5d seed 2801, byte-identical outputs.
  {
    const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r137-detgate-a-'));
    const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r137-detgate-b-'));
    try {
      const run = (dir) => {
        const env = Object.assign({}, process.env, { SEEDS: '2801', DAYS: '5', EVID: dir });
        execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return {
          json: fs.readFileSync(path.join(dir, 'journey-establishment-r137-seed2801.json'), 'utf8'),
          txt: fs.readFileSync(path.join(dir, 'journey-establishment-r137-convo-seed2801.txt'), 'utf8'),
        };
      };
      let a = null, b = null;
      try { a = run(dirA); } catch (e) { check('G1 det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); }
      try { b = run(dirB); } catch (e) { check('G2 det-gate-second-run', false, 'second driver run exit/timeout: ' + (e && e.message)); }
      if (a && b) {
        check('G3 det-gate-json-identical', a.json === b.json, 'two runs of the same driver/seed produce byte-identical JSON');
        check('G4 det-gate-convo-identical', a.txt === b.txt, 'two runs produce byte-identical convo transcripts');
        const ja = JSON.parse(a.json);
        check('G5 det-gate-seed-ran', ja.seed === 2801 && ja.endDay > 0, `seed=${ja.seed} endDay=${ja.endDay}`);
      }
    } finally {
      try { fs.rmSync(dirA, { recursive: true, force: true }); } catch (e) {}
      try { fs.rmSync(dirB, { recursive: true, force: true }); } catch (e) {}
    }
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
