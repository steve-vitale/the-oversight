#!/usr/bin/env node
// Proof test for the r85 end-menu defect (journey-establishment r85):
// a BROKEN live forage run (departed, unreturned, promise missed) can be
// closed by the honest end — dlg:favor_cancel, "End outing and unload
// what we have" — but NO conversation offers it: buildMenu's favor-menu
// gate (conversation.js) admits state 'promised' and live WATER runs
// only, with no live-FORAGE clause, so the menu falls through to generic
// small talk and the run stays live forever, blocking every later
// departure. The engine side is complete (forageFavorAction ending
// branch ready forage_end; performForageFavor unloads + returns the run);
// only the menu gate hides the verb. The r85 pilot proved the state is
// reached honestly (991 Brian: broken, 0 haul, ending ready, cancel
// never offered in 26 dawns) — this test proves the menu offer itself.
// Setup mirrors the engine's own end state (departed run + deadline rot);
// the driver, not this test, proves the honest path there.
// Usage: node scripts/test-journey-establishment-r85-endmenu.js
const { loadGame, setupGame } = require('./sim-harness');
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
  // Player at Haven (ending requires the home node); dawn, no event.
  const v = Game.state.village || {};
  if (Number.isFinite(v.px) && Number.isFinite(v.py)) { Game.map.px = v.px; Game.map.py = v.py; }
  Game.dayPart = 0;
  function promisedFavor(vid, kind) {
    const f = { id: 'test-' + kind + '-' + String(vid), vid, kind, goal: kind, task: 'test ' + kind,
      state: 'asked', askedDay: day0 - 7, deadline: (day0 - 7) + 2,
      line: '"test"', short: 'test' };
    Game.convoStoreFavor(f);
    const r = Game.convoFavorCommit(vid, f);
    return { f, r };
  }
  // The ending branch shares the adjacency check (door/same-side): the
  // partner must stand next to the player, on the same side of the
  // Haven door, on the home node. The r85 driver recovers this with
  // door verbs + tap-walk; the test places the pair directly.
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
  // Mirror performForageFavor's forage_start record, then the deadline
  // rot: favor 'broken', promise kept 'broken'. (The r85 pilot JSON
  // shows exactly this end state, reached honestly.)
  function liveRun(vid, f, haul) {
    f.forageRun = { bearer: Game.villagerId, startedDay: day0, playerHaul: (haul && haul.player) || [],
      partnerHaul: (haul && haul.partner) || [], forageCount: (haul ? 1 : 0),
      talked: false, talkCount: 0, returned: false, deliveredKcal: 0 };
    placeAdjacent(vid);
    return f.forageRun;
  }
  function breakRun(vid, f) {
    f.state = 'broken';
    const p = ((Game.state.village || {}).promises || {})[vid];
    if (p) { p.kept = 'broken'; p.closedReason = 'deadline'; p.closedDay = day0; }
  }
  function openChoices(vid) {
    const r = Game.startConvo(vid);
    let ids = ((r && r.choices) || []).map(c => c.id);
    if (!ids.length) { try { const c = Game.convoGet(vid); ids = ((c && c.choices) || []).map(ch => ch.id); } catch (e) {} }
    try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {}
    return { r, ids };
  }
  function trustOf(vid) { try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined || t === null) ? null : t; } catch (e) { return null; } }
  return { Game, day0, living, promisedFavor, liveRun, breakRun, openChoices, trustOf };
}
async function main() {
  // Case 1 (PRIMARY): broken live run, 0 haul, at home — cancel offered.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('case1 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f, null);
    t.breakRun(vid, c.f);
    check('case1 ending status ready forage_end', (() => { try { const s = t.Game.forageFavorAction(vid, c.f, true); return !!(s && s.ready && s.action === 'forage_end'); } catch (e) { return false; } })());
    const o = t.openChoices(vid);
    check('case1 cancel offered for broken live run', o.ids.includes('dlg:favor_cancel'), 'offered=' + JSON.stringify(o.ids));
  }
  // Case 2: broken live run WITH haul, at home — deliver offered.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('case2 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    const item = { name: 'Blackberry', kcalEach: 65, units: 2, edible: true, plantId: 'blackberry' };
    t.liveRun(vid, c.f, { player: [Object.assign({}, item)], partner: [Object.assign({}, item)] });
    t.breakRun(vid, c.f);
    const o = t.openChoices(vid);
    check('case2 deliver offered for broken live run with haul', o.ids.includes('dlg:favor_action'), 'offered=' + JSON.stringify(o.ids));
  }
  // Case 3 (CONTROL): unbroken live run, 0 haul, at home — cancel offered
  // (menu already opens via state 'promised'; the fix must not regress it).
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('case3 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f, null);
    const o = t.openChoices(vid);
    check('case3 cancel offered for unbroken live run', o.ids.includes('dlg:favor_cancel'), 'offered=' + JSON.stringify(o.ids));
  }
  // Case 4 (CONTROL): broken run, RETURNED (not live) — cancel NOT offered.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('case4 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    const run = t.liveRun(vid, c.f, null);
    run.returned = true; run.returnedDay = t.day0;
    t.breakRun(vid, c.f);
    const o = t.openChoices(vid);
    check('case4 cancel NOT offered for returned run', !o.ids.includes('dlg:favor_cancel'), 'offered=' + JSON.stringify(o.ids));
  }
  // Case 5 (END-TO-END): press cancel on a broken live run — the run
  // closes (returned=true, live=false) and trust does not move.
  {
    const t = await freshGame();
    const vid = t.living[0];
    const c = t.promisedFavor(vid, 'forage_help');
    check('case5 commit ok', !!(c.r && c.r.ok), JSON.stringify(c.r));
    t.liveRun(vid, c.f, null);
    t.breakRun(vid, c.f);
    const trustBefore = t.trustOf(vid);
    const o = t.openChoices(vid);
    check('case5 cancel offered before press', o.ids.includes('dlg:favor_cancel'), 'offered=' + JSON.stringify(o.ids));
    let res = null;
    try {
      const r = t.Game.startConvo(vid);
      res = t.Game.convoTurn(vid, 'dlg:favor_cancel');
      try { if (t.Game.endConvo) t.Game.endConvo(vid, 'done'); } catch (e) {}
    } catch (e) { res = { error: String(e && e.message) }; }
    check('case5 cancel press closes run', !!(c.f.forageRun && c.f.forageRun.returned === true), 'res=' + JSON.stringify(res && res.line ? String(res.line).slice(0, 160) : res));
    check('case5 run no longer live', (() => { try { return !t.Game.forageFavorCompanions().includes(vid); } catch (e) { return false; } })());
    // No DROP: ending a conversation in which the player talked grants
    // +1 trust (talk reward), so post is typically pre+1 — a drop
    // would be the double penalty, not the +1.
    check('case5 trust does not drop on end press', t.trustOf(vid) >= trustBefore, 'before=' + trustBefore + ' after=' + t.trustOf(vid));
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
