// test-journey-establishment-r292-cancelpress-20261128.js -- R292 Q1
// cancel-press proof
// The r286 establishment panel stranded one run 24 dawns (seed 109054,
// Lena's forage_help, bearer Aisha the scholar, dead d21): the r286
// any-want fix offers dlg:favor_cancel from any sitting, and the r287
// B1 fix answers "why" with the ending's reason — but the r286 driver
// never PRESSED the cancel (it appears in NO picker list), and r287's
// deepening Q6 showed the same shape stranding 44 dawns on 109603
// because the driver asked why and left. This test proves the r292
// establishment driver port of r287's cancel-press rule (build A):
// pickWedgeChoice returns dlg:favor_cancel when the favor is
// bearer-ended urgent, and does NOT return it for a healthy live run
// (urgent false) or when urgency is absent (backward compatible).
// Staging helpers are adapted from
// test-journey-deepening-r287-bearerend-20261127.js (same sim-harness
// load, same promisedFavor/liveRun/strandRun/killPerson). Fixture seeds
// 109691/109692/109693 are test fixtures, not a panel band (zero hits
// in any prereg or run note).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function freshDriver() {
  const p = require.resolve('./journey-establishment-r292-20261128.js');
  delete require.cache[p];
  return require(p);
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
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
    // The villager must stand on the scholar's actual tile (map.px/py,
    // not spawn coords) or the adjacency read fails (r287 staging lesson).
    vv.positions[vid] = { mx: Game.map.px, my: Game.map.py };
    vv.npcInside = vv.npcInside || {}; vv.npcInside[vid] = false;
    s.insideHaven = false;
    if (vv.away) delete vv.away[vid];
  }
  function liveRun(vid, f) {
    f.forageRun = { bearer: Game.villagerId, startedDay: day0,
      playerHaul: [{ itemId: 'test-venison-r292', name: 'Test venison', kcalEach: 100, units: 2, edible: true }],
      partnerHaul: [{ itemId: 'test-venison-r292', name: 'Test venison', kcalEach: 75, units: 2, edible: true }],
      forageCount: 1, talked: false, talkCount: 0, returned: false, deliveredKcal: 0 };
    placeAdjacent(vid);
    return f.forageRun;
  }
  // Strand the run onto a dead predecessor (the 109054/109603 shape: the
  // run's bearer <redacted> the previous scholar, who died; the current scholar
  // is the successor). The favor goes 'broken' as in the wild — the promise
  // rotted past its deadline while the bearer <redacted> gone.
  function strandRun(vid, f, predecessorId) {
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'released'; p.inherited = true; }
    f.state = 'broken';
    const run = f.forageRun || f.waterRun;
    if (run) run.bearer = predecessorId;
    return run;
  }
  function killPerson(id) {
    const p = Game.getPerson(id);
    if (p) p.dead = true;
    return p;
  }
  function setHunger(vid, h) {
    try { Game.npcNeeds(vid).hunger = h; } catch (e) { throw e; }
  }
  function endSit(vid) { try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) { console.warn('cancelpress: endConvo failed', e && e.message); } }
  // Open sittings until one offers dlg:favor_cancel (the r286 injection
  // adds it to any sitting's menu when the favor is bearer-ended urgent
  // and the ending is ready). Each attempt is a real sitting through the
  // real path; a non-cancel sitting touches neither the ledger nor the
  // run. Returns the sitting's choices, or null if it never won.
  function openSittingWithCancel(vid, maxAttempts) {
    for (let i = 0; i < maxAttempts; i++) {
      const r = Game.startConvo(vid);
      let choices = [];
      try { choices = Game.convoChoices(vid) || []; } catch (e) { choices = []; }
      if (choices.some(x => x && x.id === 'dlg:favor_cancel')) return { r, choices, attempts: i + 1 };
      endSit(vid);
    }
    return null;
  }
  // Open sittings until one offers dlg:favor_requirements (any want).
  function openSittingWithRequirements(vid, maxAttempts) {
    for (let i = 0; i < maxAttempts; i++) {
      const r = Game.startConvo(vid);
      let choices = [];
      try { choices = Game.convoChoices(vid) || []; } catch (e) { choices = []; }
      if (choices.some(x => x && x.id === 'dlg:favor_requirements')) return { r, choices, attempts: i + 1 };
      endSit(vid);
    }
    return null;
  }
  return { Game, day0, living, home, promisedFavor, liveRun, strandRun,
    killPerson, setHunger, endSit, openSittingWithCancel, openSittingWithRequirements };
}

async function main() {
  // --- Part 1: the picker, no game (pure function of its args).
  const menu = [{ id: 'dlg:favor_requirements' }, { id: 'dlg:favor_cancel' }, { id: 'goon' }, { id: 'leave' }];
  {
    const D = freshDriver();
    const pick = D.pickWedgeChoice(menu, 'work', null, null, true, {});
    check('P1 urgent: picker presses the bearer-end cancel', pick && pick.id === 'dlg:favor_cancel', JSON.stringify(pick && pick.id));
  }
  {
    const D = freshDriver();
    const pick = D.pickWedgeChoice(menu, 'work', null, null, false, {});
    check('P2 not urgent: picker does NOT press the cancel (goes on instead)', pick && pick.id !== 'dlg:favor_cancel', JSON.stringify(pick && pick.id));
  }
  {
    const D = freshDriver();
    const pick = D.pickWedgeChoice(menu, 'work', null, null, undefined, {});
    check('P3 no urgency arg: backward compatible, does NOT press the cancel', pick && pick.id !== 'dlg:favor_cancel', JSON.stringify(pick && pick.id));
  }
  {
    const D = freshDriver();
    const m = [{ id: 'dlg:favor_action' }, { id: 'dlg:favor_cancel' }, { id: 'dlg:favor_requirements' }];
    const pick = D.pickWedgeChoice(m, 'work', null, null, true, {});
    check('P4 favor_action still wins in work mode when offered (deliver-first, even when urgent)', pick && pick.id === 'dlg:favor_action', JSON.stringify(pick && pick.id));
  }
  {
    const D = freshDriver();
    const m = [{ id: 'dlg:commit' }, { id: 'dlg:favor_cancel' }, { id: 'goon' }];
    const pick = D.pickWedgeChoice(m, 'accept', 'ask_favor', { kind: 'forage_help' }, true, {});
    check('P5 commit still wins in accept mode for an ask_favor joint want (even when urgent)', pick && pick.id === 'dlg:commit', JSON.stringify(pick && pick.id));
  }
  {
    const D = freshDriver();
    const pick = D.pickWedgeChoice(menu, 'accept', 'repay', { kind: 'forage_help' }, true, {});
    check('P6 social sit (repay want, no commit): urgent picker presses the cancel', pick && pick.id === 'dlg:favor_cancel', JSON.stringify(pick && pick.id));
  }
  {
    const D = freshDriver();
    const m = [{ id: 'leave' }, { id: 'dlg:renounce' }, { id: 'ans:foo' }];
    const pick = D.pickWedgeChoice(m, 'start', null, null, true, {});
    check('P7 fallback never returns a NO_PICK id', pick && pick.id === 'ans:foo', JSON.stringify(pick && pick.id));
    const m2 = [{ id: 'leave' }, { id: 'dlg:renounce' }, { id: 'dlg:invite' }];
    const pick2 = D.pickWedgeChoice(m2, 'start', null, null, true, {});
    check('P7b all-NO_PICK menu returns null (no state-changing fallback)', pick2 === null, JSON.stringify(pick2 && pick2.id));
  }
  {
    const D = freshDriver();
    const a = D.pickWedgeChoice(menu, 'work', null, null, true, {});
    const b = D.pickWedgeChoice(menu, 'work', null, null, true, {}, D.WEDGE_JOINT, D.WEDGE_NO_PICK);
    check('P8 explicit joint/noPick params (the sit() call path) match the bare call', a && b && a.id === b.id, JSON.stringify([a && a.id, b && b.id]));
  }

  // --- Part 2: the live stranded shape (bearer-ended, 'broken', at Haven).
  {
    const t = await freshGame(109693);
    const Game = t.Game;
    const vid = t.living[0];
    const pred = t.living[1] || t.living[0];
    const predName = (() => { try { return String(Game.displayName(pred)).split(' ')[0]; } catch (e) { return 'Pred'; } })();
    const c = t.promisedFavor(vid, 'forage_help');
    check('B0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.strandRun(vid, c.f, pred);
    t.killPerson(pred);
    c.f.inh = predName; // succession stamp, as playerDeath writes it
    check('B1 urgency gate reads true on the staged shape', Game.convoFavorEndUrgent(vid) === true,
      'urgent=' + JSON.stringify((() => { try { return Game.convoFavorEndUrgent(vid); } catch (e) { return 'ERR ' + e.message; } })()));
    const opened = t.openSittingWithCancel(vid, 8);
    check('B2 a sitting offers dlg:favor_cancel (r286 offer, regression)', !!opened, 'attempts=' + (opened && opened.attempts));
    if (opened) {
      const conv = Game.convoGet(vid);
      const wantId = conv && conv.want && conv.want.id;
      const wantFavor = conv && conv.want && conv.want.favor;
      const req = Game.convoTurn(vid, 'dlg:favor_requirements');
      const reqLine = (req && req.line) || '';
      check('B3 requirements answer names the ending ("close the books")', /close the books/i.test(reqLine), 'line=' + JSON.stringify(reqLine));
      check('B4 requirements answer does NOT say "not your promise"', !/not your promise/i.test(reqLine), 'line=' + JSON.stringify(reqLine));
      let afterChoices = [];
      try { afterChoices = Game.convoChoices(vid) || []; } catch (e) { afterChoices = []; }
      check('B5 cancel is still offered after the requirements ask', afterChoices.some(x => x && x.id === 'dlg:favor_cancel'),
        'choices=' + JSON.stringify(afterChoices.map(x => x && x.id)));
      const D = freshDriver();
      const urgent = (() => { try { return !!Game.convoFavorEndUrgent(vid); } catch (e) { return false; } })();
      const pick = D.pickWedgeChoice(afterChoices, 'accept', wantId, wantFavor, urgent, {}, D.WEDGE_JOINT, D.WEDGE_NO_PICK);
      check('B6 driver pickWedgeChoice on the live menu returns the cancel', pick && pick.id === 'dlg:favor_cancel', JSON.stringify(pick && pick.id));
      const cancel = Game.convoTurn(vid, 'dlg:favor_cancel');
      const cancelLine = (cancel && cancel.line) || '';
      check('B7 pressing the cancel closes the run', !!(c.f.forageRun && c.f.forageRun.returned), JSON.stringify(c.f.forageRun && c.f.forageRun.returned));
      check('B8 cancel line does NOT say "not your promise"', !/not your promise/i.test(cancelLine), 'line=' + JSON.stringify(cancelLine));
      check('B9 favor no longer sits open (state moved on)', c.f.state !== 'asked' && c.f.state !== 'promised', 'state=' + JSON.stringify(c.f.state));
      t.endSit(vid);
    }
  }

  // --- Part 3: control — a HEALTHY live run (bearer = scholar, partner
  // alive, no strand, no kill). The sitting opens on repay (the run has
  // haul to deliver). The cancel IS offered, as the healthy early end
  // (pressing it would break the promise) — and the urgency gate reads
  // false, so the picker must NOT press it: a competent player does not
  // break a healthy promise.
  {
    const t = await freshGame(109692);
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('C0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    t.setHunger(vid, 85);
    check('C1 urgency gate reads false on the healthy run', Game.convoFavorEndUrgent(vid) === false,
      'urgent=' + JSON.stringify((() => { try { return Game.convoFavorEndUrgent(vid); } catch (e) { return 'ERR ' + e.message; } })()));
    const opened = t.openSittingWithRequirements(vid, 5);
    check('C2 a sitting opens with the requirements choice', !!opened, 'attempts=' + (opened && opened.attempts));
    if (opened) {
      const conv = Game.convoGet(vid);
      check('C2b the healthy sitting opens on repay (haul to deliver)', conv && conv.want && conv.want.id === 'repay', 'want=' + JSON.stringify(conv && conv.want && conv.want.id));
      check('C3 the healthy menu offers the cancel as an early end (the control is meaningful: it is right there and must be left alone)', opened.choices.some(x => x && x.id === 'dlg:favor_cancel'),
        'choices=' + JSON.stringify(opened.choices.map(x => x && x.id)));
      const D = freshDriver();
      const pick = D.pickWedgeChoice(opened.choices, 'accept', 'repay', { kind: 'forage_help' }, false, {});
      check('C4 picker does NOT press the cancel on the healthy run', pick && pick.id !== 'dlg:favor_cancel', JSON.stringify(pick && pick.id));
      const req = Game.convoTurn(vid, 'dlg:favor_requirements');
      const reqLine = (req && req.line) || '';
      check('C5 healthy requirements line is unchanged (carries kcal, no "close the books")', /kcal/i.test(reqLine) && !/close the books/i.test(reqLine), 'line=' + JSON.stringify(reqLine));
      t.endSit(vid);
    }
  }

  // --- Part 4: control — a HEALTHY live run with NO haul yet, at Haven.
  // The non-ending action is blocked ("nothing to bring home yet") while
  // the generic ending IS ready — without the urgency check in B1, the
  // requirements answer would flip to the ending line. With it, the line
  // stays the honest "nothing to bring home yet".
  {
    const t = await freshGame(109691);
    const Game = t.Game;
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('D0 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f);
    c.f.forageRun.playerHaul = [];
    c.f.forageRun.partnerHaul = [];
    check('D1 urgency gate reads false on the healthy empty run', Game.convoFavorEndUrgent(vid) === false,
      'urgent=' + JSON.stringify((() => { try { return Game.convoFavorEndUrgent(vid); } catch (e) { return 'ERR ' + e.message; } })()));
    const opened = t.openSittingWithRequirements(vid, 5);
    check('D2 a sitting opens with the requirements choice', !!opened, 'attempts=' + (opened && opened.attempts));
    if (opened) {
      const req = Game.convoTurn(vid, 'dlg:favor_requirements');
      const reqLine = (req && req.line) || '';
      check('D3 healthy empty-run line stays "nothing to bring home yet"', /nothing .* bring home yet/i.test(reqLine), 'line=' + JSON.stringify(reqLine));
      check('D4 healthy empty-run line is NOT the ending line', !/end this outing/i.test(reqLine), 'line=' + JSON.stringify(reqLine));
      t.endSit(vid);
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
if (require.main === module) main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
