#!/usr/bin/env node
// Proof test for the r138 previous-bearer stranded fix (journey-establishment
// r138 2026-11-14).
//
// r137's next blank, verbatim: a previous-bearer's live run strands the
// wedge — seed 2802, Ingrid's forage run committed d12 by Tyler, Tyler
// died d13, the run stayed live with the promise released and the ending
// permanently not-ready for the successor. The wedge worked the dead run
// every dawn (18x 'unworked: previous bearer') and never sat for a new
// favor: 0 commits after d12, Xavier's d10 ask never got a commit sit.
// The wedge should recognize the previous-bearer status and stop working
// the run (sit for new favors instead, or record it abandoned-unworkable).
//
// Diagnosis (code reading, NOT a game defect): on succession the mantle
// handoff (ledger.js) releases every open promise (kept='released') and
// reverts its favor to 'asked' — but does NOT touch a live run object,
// which stays live with bearer = the dead predecessor's id.
// forageFavorAction / waterFavorAction then block BOTH branches for the
// successor ("That outing belonged to the previous bearer. It is not
// your promise."); attemptWaitingOuting skips previous-bearer promises;
// the companions lists filter to bearer===villagerId. No honest verb
// closes the run. The fix is driver-only (no src/js): the wedge
// recognizes the stranded run, records it in strandedLog, and falls
// through to the normal no-live path so social play continues.
//
// This test proves the mechanism on a harness-loaded Game and the driver
// determinism:
//   A: staged succession state (live forage run, bearer = a predecessor
//      id, promise released, favor 'asked' — exactly the mantle handoff
//      shape): work + ending both blocked with the previous-bearer line,
//      run stays live, the game never sets out on a previous-bearer
//      promise, and the current-bearer control is NOT previous-bearer
//      blocked.
//   B: the same stranded shape for a water run.
//   C: the driver's OWN prevBearerRunOf (required from the driver,
//      require.main guard) detects the staged runs and clears the
//      current-bearer / returned / no-run controls.
//   D (source): the r138 driver records strandedLog, filters the live
//      find to non-stranded runs, and guards wedgeTravelOut with the
//      prev-bearer outcome. Fail-control: the r137 driver contains 0
//      occurrences of 'prevBearer'/'stranded'.
//   E (det-gate): the r138 driver run twice on 5d seed 2901 produces
//      byte-identical JSON + convo txt.
// Setup mirrors test-journey-establishment-r137-clearhome.js (promised
// favor + staged live run).
// Usage: node scripts/test-journey-establishment-r138-prevbearer.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');
const DRIVER = path.join(__dirname, 'journey-establishment-r138-20261114.js');
const OLD_DRIVER = path.join(__dirname, 'journey-establishment-r137-20261114.js');
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
  function liveWaterRun(vid, f) {
    f.waterRun = { bearer: Game.villagerId, startedDay: day0,
      target: { x: home.x + 1, y: home.y }, partnerWater: [], returned: false };
    placeAdjacent(vid);
    return f.waterRun;
  }
  // Stage the mantle-handoff shape exactly (ledger.js MANTLE HANDOFF
  // RECORD): the promise is released (kept='released', inherited) and
  // the favor reverts to 'asked' — but the live run is untouched and
  // still names the dead predecessor as bearer.
  function strandRun(vid, f, predecessorId) {
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'released'; p.inherited = true; }
    f.state = 'asked';
    const run = f.forageRun || f.waterRun;
    if (run) run.bearer = predecessorId;
    return run;
  }
  function trustOf(vid) { try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined || t === null) ? null : t; } catch (e) { return null; } }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {} }
  return { Game, day0, living, home, promisedFavor, liveRun, liveWaterRun, strandRun, trustOf, endSit, placeAdjacent };
}
async function main() {
  const predecessor = (t) => t.living[1] || t.living[0];
  // A: staged succession state, forage shape.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    const stWork = (() => { try { return t.Game.forageFavorAction(vid, c.f, false); } catch (e) { return { error: String(e && e.message) }; } })();
    check('A1 work status blocked with the previous-bearer line', !!(stWork && !stWork.ready && /previous bearer/i.test(stWork.reason || '')), JSON.stringify(stWork && stWork.reason));
    const stEnd = (() => { try { return t.Game.forageFavorAction(vid, c.f, true); } catch (e) { return { error: String(e && e.message) }; } })();
    check('A2 ending status blocked with the previous-bearer line', !!(stEnd && !stEnd.ready && /previous bearer/i.test(stEnd.reason || '')), JSON.stringify(stEnd && stEnd.reason));
    check('A3 run stays live after stranding', !!(c.f.forageRun && !c.f.forageRun.returned), 'returned=' + JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    check('A4 run is not a current-bearer companion', (() => { try { return !t.Game.forageFavorCompanions().includes(vid); } catch (e) { return false; } })());
    // A5: the game never sets out on a previous-bearer promise (no run).
    const vid2 = t.living[2] || t.living[1];
    const c2 = t.promisedFavor(vid2, 'forage_help');
    const p2 = ((t.Game.state.village || {}).promises || {})[vid2];
    if (p2) p2.maker = pred;
    let outing = 'not-called';
    try { outing = t.Game.attemptWaitingOuting(vid2, c2.f); } catch (e) { outing = 'error:' + e.message; }
    check('A5 attemptWaitingOuting skips a previous-bearer promise', outing === null, 'returned=' + JSON.stringify(outing));
    // A6 (control): a current-bearer live run is NOT previous-bearer blocked.
    const vid3 = t.living[3] || t.living[1];
    const c3 = t.promisedFavor(vid3, 'forage_help');
    t.liveRun(vid3, c3.f);
    const stCtl = (() => { try { return t.Game.forageFavorAction(vid3, c3.f, false); } catch (e) { return { error: String(e && e.message) }; } })();
    check('A6 current-bearer control is not previous-bearer blocked', !!(stCtl && !/previous bearer/i.test(stCtl.reason || '')), JSON.stringify(stCtl && stCtl.reason));
    t.endSit(vid); t.endSit(vid2); t.endSit(vid3);
  }
  // B: the same stranded shape for a water run.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'water_haul');
    check('B0 water commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveWaterRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    const stWork = (() => { try { return t.Game.waterFavorAction(vid, c.f, false); } catch (e) { return { error: String(e && e.message) }; } })();
    check('B1 water work blocked with the previous-bearer line', !!(stWork && !stWork.ready && /previous bearer/i.test(stWork.reason || '')), JSON.stringify(stWork && stWork.reason));
    const stEnd = (() => { try { return t.Game.waterFavorAction(vid, c.f, true); } catch (e) { return { error: String(e && e.message) }; } })();
    check('B2 water ending blocked with the previous-bearer line', !!(stEnd && !stEnd.ready && /previous bearer/i.test(stEnd.reason || '')), JSON.stringify(stEnd && stEnd.reason));
    check('B3 water run stays live after stranding', !!(c.f.waterRun && !c.f.waterRun.returned));
    t.endSit(vid);
  }
  // C: the driver's OWN prevBearerRunOf on staged state (the driver is
  // required, not copied — require.main guard keeps seeds from running).
  {
    const driver = require(DRIVER);
    check('C0 driver exports prevBearerRunOf', typeof driver.prevBearerRunOf === 'function');
    const t = await freshGame();
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    check('C1 current-bearer run is not stranded', driver.prevBearerRunOf(t.Game, c.f) === null);
    t.strandRun(vid, c.f, pred);
    const rec = driver.prevBearerRunOf(t.Game, c.f);
    check('C2 stranded forage run detected', !!(rec && rec.kind === 'forage_help' && rec.bearer === String(pred)), JSON.stringify(rec));
    check('C3 stranded record names the bearer', !!(rec && rec.bearerName), JSON.stringify(rec && rec.bearerName));
    c.f.forageRun.returned = true;
    check('C4 returned run is not stranded', driver.prevBearerRunOf(t.Game, c.f) === null);
    c.f.forageRun.returned = false;
    const cW = t.promisedFavor(t.living[1], 'water_haul');
    t.liveWaterRun(t.living[1], cW.f);
    t.strandRun(t.living[1], cW.f, pred);
    const recW = driver.prevBearerRunOf(t.Game, cW.f);
    check('C5 stranded water run detected', !!(recW && recW.kind === 'water_haul' && recW.bearer === String(pred)), JSON.stringify(recW));
    check('C6 favor with no run is not stranded', driver.prevBearerRunOf(t.Game, { kind: 'forage_help', vid }) === null);
    check('C7 null favor is not stranded', driver.prevBearerRunOf(t.Game, null) === null);
    t.endSit(vid); t.endSit(t.living[1]);
  }
  // D (source): the r138 driver records stranded runs, filters the live
  // find to non-stranded runs, and guards wedgeTravelOut.
  {
    const src = fs.readFileSync(DRIVER, 'utf8');
    check('D1 driver defines prevBearerRunOf', /function prevBearerRunOf\(Game, f\)/.test(src));
    check('D2 driver exports prevBearerRunOf + require.main guard', /require\.main === module/.test(src) && /module\.exports = \{ prevBearerRunOf/.test(src));
    check('D3 driver records strandedLog', /strandedLog\.push\(\{ day: nowDay\(Game\), vid: String\(s\.vid\)/.test(src));
    check('D4 wedgeDawn live find excludes stranded runs', /jl\.find\(j => j\.live && !j\.stranded\)/.test(src));
    check('D5 wedgeTravelOut guards with prev-bearer-stranded', /outcome = 'prev-bearer-stranded'/.test(src));
    check('D6 jointLedger exposes the stranded flag', /stranded: !!strandedRec138/.test(src));
    // Fail-control: the r137 driver has no stranded handling at all.
    const old = fs.readFileSync(OLD_DRIVER, 'utf8');
    check('D7 (fail-control) r137 driver has no prevBearer', !/prevBearer/.test(old));
    check('D8 (fail-control) r137 driver has no strandedLog', !/strandedLog/.test(old));
  }
  // E (det-gate): r138 driver twice, 5d seed 2901, byte-identical outputs.
  {
    const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r138-detgate-a-'));
    const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r138-detgate-b-'));
    try {
      const run = (dir) => {
        const env = Object.assign({}, process.env, { SEEDS: '2901', DAYS: '5', EVID: dir });
        execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return {
          json: fs.readFileSync(path.join(dir, 'journey-establishment-r138-seed2901.json'), 'utf8'),
          txt: fs.readFileSync(path.join(dir, 'journey-establishment-r138-convo-seed2901.txt'), 'utf8'),
        };
      };
      let a = null, b = null;
      try { a = run(dirA); } catch (e) { check('E1 det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); }
      try { b = run(dirB); } catch (e) { check('E2 det-gate-second-run', false, 'second driver run exit/timeout: ' + (e && e.message)); }
      if (a && b) {
        check('E3 det-gate-json-identical', a.json === b.json, 'two runs of the same driver/seed produce byte-identical JSON');
        check('E4 det-gate-convo-identical', a.txt === b.txt, 'two runs produce byte-identical convo transcripts');
        const ja = JSON.parse(a.json);
        check('E5 det-gate-seed-ran', ja.seed === 2901 && ja.endDay > 0, `seed=${ja.seed} endDay=${ja.endDay}`);
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
