#!/usr/bin/env node
// Proof: STRANDED-CLOSE MENU — a settled favor with a live endable run
// offers the end verb (journey-establishment r268, 2026-11-22).
//
// r268 panel, seed 101972: Casey, forage_help, bearer Paul dead, favor
// state 'moot', run unreturned, 9 stranded dawns. The action layer was
// ready every dawn (forageFavorAction ending=true -> forage_end, "This
// outing belonged to Paul, who is gone...") but the sit menu never
// offered dlg:favor_cancel — ask_favor.menuOptions returned [] for any
// settled state including 'moot', so the conversation fell back to a
// generic menu (help/more/react/recap/invite/subject) and the driver
// re-attempted a sit that could never press cancel. r265 proved the
// ACTION layer (33/33, direct calls) but never sat in a conversation,
// so the menu layer was never reached.
// GREEN (post-fix): two menu-layer fixes, both reusing the existing
// readiness check (convoFavorActionMenu) — no second copy of it.
// (1) STAGE-0 SURFACING (the fix that reaches live sits): convoWantMenu's
// stage-0 ask_favor branch offers dlg:favor_cancel whenever the ledger
// favor holds a live endable run — stranded sits live at stage 0 with
// the favor never attached to the want, and the need-independent offer
// means the verb surfaces even when the need is gone. (2) SETTLED MENU
// (defense in depth): ask_favor.menuOptions' settled-state early return
// offers ONLY the end verb when the favor has an endable run, instead of
// returning [] — a settled favor is not closed for ending purposes.
// A settled favor with no endable run still offers nothing; a
// living-bearer <redacted> (ending not ready) still offers nothing.
// Staging mirrors test-bearer-end-r265.js. Uses the shared harness
// (scripts/sim-harness). Exits nonzero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');

let pass = 0;
function check(name, cond, extra) {
  assert(cond, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
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
    f.forageRun = { bearer: Game.villagerId, startedDay: day0,
      playerHaul: [{ itemId: 'test-venison-r268', name: 'Test venison', kcalEach: 100, units: 2, edible: true }],
      partnerHaul: [{ itemId: 'test-venison-r268', name: 'Test venison', kcalEach: 75, units: 2, edible: true }],
      forageCount: 1, talked: false, talkCount: 0, returned: false, deliveredKcal: 0 };
    placeAdjacent(vid);
    return f.forageRun;
  }
  function strandRun(vid, f, predecessorId) {
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'released'; p.inherited = true; }
    f.state = 'asked';
    const run = f.forageRun || f.waterRun;
    if (run) run.bearer = predecessorId;
    return run;
  }
  function killPerson(id) {
    const p = Game.getPerson(id);
    if (p) p.dead = true;
    return p;
  }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {} }
  // The driver's read, driven like a player: start the conversation
  // (the seeded want is ask_favor, stage 0, favor never attached — the
  // r268 panel shape), answer any pre-empting goal question, engage the
  // thread, and watch every menu for the end verb. Returns the turn on
  // which dlg:favor_cancel was offered and pressed, or -1, plus the
  // menu ids seen on the turn cancel appeared (or the last menu).
  function driveSit(vid, favor) {
    Game.convoPlantSeed(vid, { wantId: 'ask_favor', favorId: favor.id, note: favor.short || 'the pantry run' });
    let r = Game.startConvo(vid);
    let lastIds = [];
    for (let turn = 0; turn < 10; turn++) {
      const cc = Game.convoGet(vid);
      if (!cc || !cc.active) break;
      const ids = ((r && r.choices) || (cc && cc.choices) || []).map(x => x.id);
      lastIds = ids;
      if (ids.includes('dlg:favor_cancel')) {
        r = Game.convoTurn(vid, 'dlg:favor_cancel');
        return { cancelTurn: turn, ids, cancelLine: (r && r.line) ? String(r.line) : null };
      }
      let pick = null;
      if (ids.includes('dlg:help')) pick = 'dlg:help';
      else if (ids.some(x => x.indexOf('gq:') === 0)) pick = ids.find(x => x.indexOf('gq:') === 0);
      else if (ids.includes('goon')) pick = 'goon';
      else if (ids.includes('dlg:react')) pick = 'dlg:react';
      if (!pick) break;
      r = Game.convoTurn(vid, pick);
      if (r && r.ended) break;
    }
    return { cancelTurn: -1, ids: lastIds, cancelLine: null };
  }
  return { Game, day0, living, home, promisedFavor, liveRun, strandRun, killPerson, endSit, driveSit };
}

async function main() {
  const predecessor = (t) => t.living[1] || t.living[0];
  const src = fs.readFileSync(path.join(ROOT, 'src/js/convo-wants.js'), 'utf8');

  // A: Casey shape — 'moot' favor, dead bearer, live run. The menu must
  // offer the end verb (and ONLY the end verb from the favor menu).
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    check('A0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    c.f.state = 'moot';
    const stEnd = Game.forageFavorAction(vid, c.f, true);
    check('A1 ending action is ready (r265 layer)', !!(stEnd && stEnd.ready && stEnd.action === 'forage_end'), JSON.stringify(stEnd));
    const d = t.driveSit(vid, c.f);
    check('A2 moot favor with endable run offers cancel', d.cancelTurn >= 0, 'last menu=' + d.ids.join(','));
    check('A3 moot favor offers no commit', !d.ids.includes('dlg:commit'), 'menu=' + d.ids.join(','));
    check('A4 moot favor offers no work verb', !d.ids.includes('dlg:favor_action'), 'menu=' + d.ids.join(','));
    // Pressing it closed the run, honestly.
    check('A5 cancel line names the gone bearer', /who is gone/i.test(d.cancelLine || ''), JSON.stringify(d.cancelLine));
    check('A6 run is returned after cancel', !!(c.f.forageRun && c.f.forageRun.returned), JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
    t.endSit(vid);
  }

  // B: 'asked' favor, dead bearer, live run — the menu already offered
  // cancel through the non-settled branch; the fix must not regress it.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    const d = t.driveSit(vid, c.f);
    check('B1 asked favor with endable run offers cancel', d.cancelTurn >= 0, 'last menu=' + d.ids.join(','));
    t.endSit(vid);
  }

  // C: settled favor with NO live run — still nothing. The acknowledgment
  // menu stays an acknowledgment.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    c.f.state = 'moot';
    const d = t.driveSit(vid, c.f);
    check('C1 moot favor with no run offers no cancel', d.cancelTurn === -1, 'last menu=' + d.ids.join(','));
    t.endSit(vid);
  }

  // D: settled favor, live run, LIVING previous bearer — ending is not
  // ready (the living bearer owns their outing), so no cancel.
  {
    const t = await freshGame();
    const Game = t.Game;
    const vid = t.living[0];
    const pred = predecessor(t);
    const c = t.promisedFavor(vid, 'forage_help');
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    // predecessor stays alive.
    c.f.state = 'moot';
    const stEnd = Game.forageFavorAction(vid, c.f, true);
    check('D0 ending is NOT ready for a living bearer', !!(stEnd && !stEnd.ready), JSON.stringify(stEnd));
    const d = t.driveSit(vid, c.f);
    check('D1 living-bearer <redacted> offers no cancel', d.cancelTurn === -1, 'last menu=' + d.ids.join(','));
    t.endSit(vid);
  }

  // E: code pins — the fixes live in the menu layer, not in a second
  // copy of the readiness check.
  check('E1 settled-state early return still present', /Settled favors \(fulfilled\/broken\/moot\)/.test(src));
  check('E2 settled branch consults the action menu for the end verb', /convoFavorActionMenu\(vid, favor, false\)\s*\n?\s*\.filter\(o => o && o\.id === 'dlg:favor_cancel'\)/.test(src));
  check('E3 no blanket return-\\[\\] ahead of the end-verb check', !/favor\.state === 'declined'\)\) \{\s*\n?\s*return \[\];/.test(src));
  check('E4 stage-0 surfacing offers the end verb for an endable run', /R268 STRANDED-CLOSE[\s\S]*?endOnly/.test(src));
  check('E5 stage-0 end verb does not depend on a live need', /if \(endOnly\.length\) return endOnly;/.test(src));

  console.log('PASS test-strandedclose-menu-r268: ' + pass + ' checks');
}

main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
