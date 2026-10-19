#!/usr/bin/env node
// test-presence-confirm.js — proof for the sim-presence CONFIRM instruments.
//
// T1: the CONFIRM PRIMARY's definition is pinned on the ENGINE:
//     waveCombatReadiness(4).veterans = DISTINCT living roster vids with a
//     wave-3+ kill in state.waveKillLog (VETSHAPE off = default). Dead
//     killers excluded; wave-2-only killers excluded; duplicate kills by one
//     vid count once; the scholar (always living) counts. veterans5
//     (wave-4+ killers) pinned the same way.
// T2: the analyzer's judge predicates (the SAME functions the verdict rests
//     on, required from presence-confirm-analyze-20261019.js): primary bar
//     +4/32 exact boundary, survival bar control-5d boundary, reach noise
//     band, new-mode detection.
// T3: the landed layer's no-fighter-movement invariant (A9-class, on the
//     real presence.js): assignTask/takeWeapon throw if called; the beat
//     fires on a w3 threat and never calls them.
//
// New tests must not write into the repo — this one doesn't.
// Usage: node scripts/test-presence-confirm.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (PRESENCE_KILLED=1 set by
// the coordinator after a killed arm), T3 is skipped — the proof exits green
// with an INFO-SKIP for the layer-dependent section. T1/T2 (metric definition
// + judge logic) don't need the layer and still run. Without the layer and
// without the flag, absence is RED (exit 1).
const LAYER_PATH = path.join(__dirname, 'policies', 'presence.js');
const LAYER_GONE = !fs.existsSync(LAYER_PATH);
if (LAYER_GONE && process.env.PRESENCE_KILLED !== '1') {
  console.error('RED: scripts/policies/presence.js missing and PRESENCE_KILLED not set.');
  process.exit(1);
}
const PR = LAYER_GONE ? null : require('./policies/presence');
const J = require('./presence-confirm-analyze-20261019');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- fabricated Game for T3 (mirrors test-presence.js stubGame) ----------
function stubGame(o) {
  o = o || {};
  const calls = { goInside: 0, microMove: 0, assignTask: 0, takeWeapon: 0 };
  return {
    over: false,
    villagerId: 'scholar1',
    state: {
      scholar: { day: 100, insideHaven: false, mx: 6, my: 0 },
      village: { roster: ['scholar1', 'v1', 'v2'], px: 4, py: 4 },
    },
    data: { items: [], monsters: [{ id: 'spool', wave: 3 }, { id: 'hushwolf', wave: 1 }] },
    _calls: calls,
    playerAtHaven: () => true,
    inCombat: () => false,
    aidCrisis: () => false,
    worldMonsters: () => (o.worldMonsters || []),
    enterBuilding: function () { calls.goInside++; this.state.scholar.insideHaven = true; return true; },
    microMove: function () { calls.microMove++; return true; },
    assignTask: function () { calls.assignTask++; throw new Error('presence layer called Game.assignTask — violation'); },
    takeWeapon: function () { calls.takeWeapon++; throw new Error('presence layer called Game.takeWeapon — violation'); },
  };
}

(async () => {
  // ================= T1: veteran-count definition (real engine) =================
  console.log('T1: confirm primary definition (waveCombatReadiness veterans)');
  const { Game } = await loadGame({ seed: 416, mode: 'presence-confirm-proof' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []);
  const fighters = roster.filter(v => v !== Game.villagerId).filter(v => { try { const vp = Game.vpOf(v); return vp && !vp.dead; } catch (e) { return false; } });
  check('T1 fixture has 3+ fighters', fighters.length >= 3, `fighters=${fighters.length}`);
  const [livingA, deadB, livingC] = fighters;
  try { Game.vpOf(deadB).dead = true; } catch (e) { check('T1 kill deadB', false, String(e)); }
  Game.state.waveKillLog = [
    { d: 50, mid: 'spool', w: 3, by: livingA, via: 'agency' },   // living w3 killer -> counts
    { d: 51, mid: 'gavel', w: 3, by: livingA, via: 'agency' },   // dup killer -> still one
    { d: 52, mid: 'redactor', w: 3, by: deadB, via: 'agency' },  // dead -> excluded
    { d: 53, mid: 'hushwolf', w: 1, by: livingC, via: 'agency' },// wave-1 kill -> excluded
    { d: 54, mid: 'static', w: 2, by: livingC, via: 'agency' },  // wave-2 kill -> excluded
    { d: 55, mid: 'ad_break', w: 3, by: Game.villagerId, via: 'agency' }, // scholar -> counts
  ];
  const r4 = Game.waveCombatReadiness(4);
  check('T1 veterans(4) = livingA + scholar only', r4.veterans === 2, `veterans=${r4.veterans}`);
  // veterans5: wave-4+ killers. livingA has no w4 kill yet; add one.
  Game.state.waveKillLog.push({ d: 56, mid: 'congregation', w: 4, by: livingA, via: 'agency' });
  const r5 = Game.waveCombatReadiness(5);
  check('T1 veterans(5) = livingA only', r5.veterans === 1, `veterans5=${r5.veterans}`);
  // VETSHAPE off (default): the dead killer stays excluded even with w4 kill.
  Game.state.waveKillLog.push({ d: 57, mid: 'strike', w: 4, by: deadB, via: 'agency' });
  const r4b = Game.waveCombatReadiness(4);
  check('T1 dead w4 killer still excluded (VETSHAPE off)', r4b.veterans === 2, `veterans=${r4b.veterans}`);

  // ================= T2: judge predicates =================
  console.log('T2: analyzer judge predicates');
  check('T2 primary GO at exactly +4', J.judgePrimary(10, 14) === true);
  check('T2 primary NO-GO at +3', J.judgePrimary(10, 13) === false);
  check('T2 primary GO from zero control', J.judgePrimary(0, 4) === true);
  check('T2 primary NO-GO below bar from zero', J.judgePrimary(0, 3) === false);
  check('T2 primary bar is +4 (VET_BAR)', J.VET_BAR === 4, `VET_BAR=${J.VET_BAR}`);
  check('T2 survival PASS at control-5', J.judgeSurvival(119, 114) === true);
  check('T2 survival FAIL at control-6', J.judgeSurvival(119, 113) === false);
  check('T2 reach PASS at control-2', J.judgeReach(7, 5) === true);
  check('T2 reach FAIL at control-3', J.judgeReach(7, 4) === false);
  check('T2 no new modes on identical maps', J.newDeathModes({ a: 1, b: 2 }, { a: 3, b: 4 }).length === 0);
  check('T2 new mode detected', JSON.stringify(J.newDeathModes({ a: 1 }, { a: 1, x: 2 })) === '["x"]');

  // ================= T3: no-fighter-movement on the landed layer =================
  console.log('T3: landed layer never moves/assigns/risks villagers');
  if (LAYER_GONE) {
    console.log('  INFO-SKIP T3 (layer deleted per kill protocol; PRESENCE_KILLED=1)');
  } else {
    const oldP = process.env.PRESENCE;
    process.env.PRESENCE = '1';
    let threw = false;
    const G = stubGame({ worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
    const ctx = {};
    try { PR.presenceBeat(G, ctx); } catch (e) { threw = true; }
    process.env.PRESENCE = oldP;
    check('T3 beat does not throw', !threw);
    check('T3 beat fires (goInside + step)', G._calls.goInside === 1 && G._calls.microMove === 1, JSON.stringify(G._calls));
    check('T3 assignTask/takeWeapon never called', G._calls.assignTask === 0 && G._calls.takeWeapon === 0, JSON.stringify(G._calls));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST FAIL', e); process.exit(1); });
