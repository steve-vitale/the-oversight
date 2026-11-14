#!/usr/bin/env node
// Proof test for the r136 end-wedge paging fix (journey-establishment
// r136 2026-11-13).
//
// r85's next blank, verbatim: Yara (seed 997) broke d8 and closed d15 —
// 7 dawns — because a betrayal investigation thread occupied the
// conversation menu, displacing the favor verbs entirely. The wedge
// presses ONLY cancel, so it sat and retried each dawn.
//
// Diagnosis (staged probe + Yara's committed JSON, NOT a game defect):
// the mechanism is PAGINATION, not thread-gating. Yara's offeredIds are
// a paged page-1 menu (4 betrayal actions + menu:more + navigation).
// The favor branch DID fire (thread 'want'); convoMenuPage paginates —
// betrayal actions rank 0 first, dlg:favor_cancel (default rank 4)
// lands on page 2, one menu:more tap away. Pressing a betrayal action
// does NOT free page 1 (moot calls the trial, site examines the site —
// both real village actions, case stays open), so the wedge must never
// press case actions to clear a menu; it pages, like a real player.
//
// The fix is driver-only (no src/js): the r136 driver's sit() presses
// menu:more via Game.convoNextMenu when its target verb is not on the
// current page, before giving up — for every mode with a target verb
// (end cancel, work favor_action, accept commit). This test proves the
// mechanism on a harness-loaded Game and the driver determinism:
//   A: staged Yara (broken run + open known case): ending ready,
//      cancel absent page 1, present page 2 after convoNextMenu.
//   B: page then press cancel: the run closes, trust does not drop,
//      the run is no longer live.
//   C (control): no case -> cancel on page 1.
//   D: pressing betrayal:moot does NOT free page 1 (case stays open,
//      trial called — the wedge must not do this).
//   E: pressing betrayal:site does NOT free page 1 (case stays open).
//   F (source): the r136 driver pages (convoNextMenu + pagesTurned).
//   G (det-gate): the r136 driver run twice on 5d seed 2701 produces
//      byte-identical JSON + convo txt.
// Setup mirrors test-journey-establishment-r85-endmenu.js (broken run)
// + test-betrayal.js (openCase via a pushed plot).
// Usage: node scripts/test-journey-establishment-r136-threadpage.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');
const DRIVER = path.join(__dirname, 'journey-establishment-r136-20261113.js');
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
    const home = (Number.isFinite(vv.px) && Number.isFinite(vv.py)) ? { x: vv.px, y: vv.py } : { x: 4, y: 4 };
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
  // Open betrayal case the player knows about (mirrors caseDiscoveryTick
  // having told the player; the case-level actions are offered to any
  // conversation partner while it is open).
  function openKnownCase(excludeVid) {
    const others = living.filter(id => String(id) !== String(excludeVid));
    const [L, A, T] = others;
    const plot = { id: 'probeplot', leader: L, accomplices: [A], target: T, weakest: A };
    Game.betrayalState().plots.push(plot);
    const c = Game.openCase(plot, 'theft');
    c.knownToPlayer = true;
    return c;
  }
  function page1Ids(vid) {
    const r = Game.startConvo(vid);
    return { r, ids: ((r && r.choices) || []).map(x => x.id) };
  }
  function trustOf(vid) { try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined || t === null) ? null : t; } catch (e) { return null; } }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {} }
  return { Game, day0, living, promisedFavor, liveRun, breakRun, openKnownCase, page1Ids, trustOf, endSit };
}
async function main() {
  // A: staged Yara — broken run + open known case.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f); t.breakRun(vid, c.f);
    const cs = t.openKnownCase(vid);
    check('A1 ending status ready forage_end', (() => { try { const s = t.Game.forageFavorAction(vid, c.f, true); return !!(s && s.ready && s.action === 'forage_end'); } catch (e) { return false; } })());
    const o = t.page1Ids(vid);
    check('A2 cancel NOT on page 1 with a case open', !o.ids.includes('dlg:favor_cancel'), 'page1=' + JSON.stringify(o.ids));
    check('A3 page 1 is the Yara shape (betrayal actions + menu:more)', o.ids.some(x => x.startsWith('betrayal:')) && o.ids.includes('menu:more'), 'page1=' + JSON.stringify(o.ids));
    let p2 = null;
    try { p2 = t.Game.convoNextMenu(vid); } catch (e) { p2 = { error: String(e && e.message) }; }
    const p2ids = ((p2 && p2.choices) || []).map(x => x.id);
    check('A4 cancel IS on page 2 after menu:more', p2ids.includes('dlg:favor_cancel'), 'page2=' + JSON.stringify(p2ids));
    check('A5 case still open at menu time', cs.status === 'open');
    t.endSit(vid);
  }
  // B: page, then press cancel — the run closes, trust holds.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f); t.breakRun(vid, c.f);
    t.openKnownCase(vid);
    const trustBefore = t.trustOf(vid);
    const o = t.page1Ids(vid);
    check('B0 cancel absent page 1', !o.ids.includes('dlg:favor_cancel'));
    const p2 = t.Game.convoNextMenu(vid);
    const p2ids = ((p2 && p2.choices) || []).map(x => x.id);
    check('B1 cancel present page 2', p2ids.includes('dlg:favor_cancel'), 'page2=' + JSON.stringify(p2ids));
    let res = null;
    try { res = t.Game.convoTurn(vid, 'dlg:favor_cancel'); } catch (e) { res = { error: String(e && e.message) }; }
    check('B2 cancel press closes run', !!(c.f.forageRun && c.f.forageRun.returned === true), 'res=' + JSON.stringify(res && res.line ? String(res.line).slice(0, 160) : res));
    check('B3 run no longer live', (() => { try { return !t.Game.forageFavorCompanions().includes(vid); } catch (e) { return false; } })());
    check('B4 trust does not drop on end press', t.trustOf(vid) >= trustBefore, 'before=' + trustBefore + ' after=' + t.trustOf(vid));
    t.endSit(vid);
  }
  // C (control): no case -> cancel on page 1.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f); t.breakRun(vid, c.f);
    const o = t.page1Ids(vid);
    check('C1 cancel offered page 1 with no case open', o.ids.includes('dlg:favor_cancel'), 'page1=' + JSON.stringify(o.ids));
    t.endSit(vid);
  }
  // D: pressing betrayal:moot does NOT free page 1 (and calls a trial —
  // the wedge must never do this to clear a menu).
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f); t.breakRun(vid, c.f);
    const cs = t.openKnownCase(vid);
    const o = t.page1Ids(vid);
    const moot = o.ids.find(x => x.startsWith('betrayal:moot:'));
    check('D0 moot offered page 1', !!moot, 'page1=' + JSON.stringify(o.ids));
    if (moot) {
      t.Game.convoTurn(vid, moot);
      check('D1 moot calls the trial', !!cs.trial, 'trial=' + JSON.stringify(!!cs.trial));
      check('D2 case still open after moot', cs.status === 'open');
      const after = (t.Game.convoChoices(vid) || []).map(x => x.id);
      check('D3 cancel STILL absent page 1 after moot', !after.includes('dlg:favor_cancel'), 'menu=' + JSON.stringify(after));
    }
    t.endSit(vid);
  }
  // E: pressing betrayal:site does NOT free page 1.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f); t.breakRun(vid, c.f);
    const cs = t.openKnownCase(vid);
    const o = t.page1Ids(vid);
    const site = o.ids.find(x => x.startsWith('betrayal:site:'));
    check('E0 site offered page 1', !!site, 'page1=' + JSON.stringify(o.ids));
    if (site) {
      t.Game.convoTurn(vid, site);
      check('E1 site examined', cs.siteExamined === true);
      check('E2 case still open after site', cs.status === 'open');
      const after = (t.Game.convoChoices(vid) || []).map(x => x.id);
      check('E3 cancel STILL absent page 1 after site', !after.includes('dlg:favor_cancel'), 'menu=' + JSON.stringify(after));
    }
    t.endSit(vid);
  }
  // F (source): the r136 driver pages.
  {
    const src = fs.readFileSync(DRIVER, 'utf8');
    check('F1 driver calls convoNextMenu in sit()', /convoNextMenu\(vid\)/.test(src));
    check('F2 driver records pagesTurned', /pagesTurned/.test(src));
    check('F3 driver records all-pages offeredIds', /allPagesOffered/.test(src));
    check('F4 driver never presses a betrayal: choice', !/convoTurn\(vid, ['"]betrayal:/.test(src) && !/pick\.id\.startsWith\(['"]betrayal/.test(src));
  }
  // G (det-gate): r136 driver twice, 5d seed 2701, byte-identical outputs.
  {
    const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r136-detgate-a-'));
    const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'establishment-r136-detgate-b-'));
    try {
      const run = (dir) => {
        const env = Object.assign({}, process.env, { SEEDS: '2701', DAYS: '5', EVID: dir });
        execFileSync(process.execPath, [DRIVER], { encoding: 'utf8', env, timeout: 600000, cwd: ROOT });
        return {
          json: fs.readFileSync(path.join(dir, 'journey-establishment-r136-seed2701.json'), 'utf8'),
          txt: fs.readFileSync(path.join(dir, 'journey-establishment-r136-convo-seed2701.txt'), 'utf8'),
        };
      };
      let a = null, b = null;
      try { a = run(dirA); } catch (e) { check('G1 det-gate-first-run', false, 'first driver run exit/timeout: ' + (e && e.message)); }
      try { b = run(dirB); } catch (e) { check('G2 det-gate-second-run', false, 'second driver run exit/timeout: ' + (e && e.message)); }
      if (a && b) {
        check('G3 det-gate-json-identical', a.json === b.json, 'two runs of the same driver/seed produce byte-identical JSON');
        check('G4 det-gate-convo-identical', a.txt === b.txt, 'two runs produce byte-identical convo transcripts');
        const ja = JSON.parse(a.json);
        check('G5 det-gate-seed-ran', ja.seed === 2701 && ja.endDay > 0, `seed=${ja.seed} endDay=${ja.endDay}`);
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
