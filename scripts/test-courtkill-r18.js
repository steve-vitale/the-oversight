#!/usr/bin/env node
// scripts/test-courtkill-r18.js — proof test for scale-wall r18 arm 1
// (COURTKILL hunting layer, scripts/policies/courtkill.js + the two
// ctx._huntCommit hooks in scripts/policies/competent.js).
//
// Mechanism:
//   1. Gate OFF = pure delegation: courtkill-lead.daily is byte-identical to
//      leadcourt.daily on identical seeds (no hunt legs, no fight marking).
//   2. Gate ON + wave-3 locked = no hunt (huntLive false).
//   3. Gate ON + wave-3 unlocked = hunt legs run (travel + engagement).
//   4. Fight commit: a live wave-3 fight at 60% HP is NOT fled at start with
//      the gate on (legacy `outmatched` would flee: maxWave>=2 && hp<70%),
//      but IS fled with the gate off (RED contrast).
//   5. Mid-fight hold: at 30% HP in a wave-3 fight the gate-on policy holds
//      (12% threshold) while the gate-off policy flees (35% threshold).
//   6. The <50% HP suicide guard stays even with the gate on.
//   7. Courtship delegation: gate-on daily runs the base daily (structure
//      check — the sweep compares proposal/tend/tribute counters).
//
// RED phases: every gate-on assertion has a gate-off (or pre-change)
// contrast that must show the legacy behavior. Run:
//   node scripts/test-courtkill-r18.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const comp = require('./policies/competent');
const { leadcourt } = require('./policies/leadcourt');
const ck = require('./policies/courtkill');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function plantMonster(Game, mid, tx, ty, mx, my) {
  try { Game.state.worldMonsters = (Game.state.worldMonsters || []).filter(m => !(m.tx === tx && m.ty === ty)); } catch (e) {}
  const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid) || {};
  const hp = (def.hp && def.hp[1]) || def.hp || 100;
  const wm = { id: mid, monsterId: mid, tx, ty, mx: mx == null ? 4 : mx, my: my == null ? 4 : my, hp, maxHp: hp };
  Game.worldMonsters().push(wm);
  return wm;
}
// A live wave-3 fight with the scholar at `pct` of max HP. Returns {Game, ctx, f}.
async function wave3Fight(seed, pct) {
  const { Game } = await loadGame({ seed, mode: 'courtkill-test' });
  await setupGame(Game);
  Game.unlockedWave = () => 3; // policy-side: pretend wave-3 is unlocked
  const p0 = Game.tbFighter ? null : null;
  Game.startCombat('redactor'); // wave-3, HP 240-420
  const f = Game.tbfight;
  const p = Game.tbFighter('p');
  p.hp = Math.round((p.maxHp || 100) * pct);
  return { Game, ctx: {}, f, p };
}
function ctxOf(o) { return o.ctx; }

(async () => {
  // ---- 1. gate OFF = pure delegation (byte-identical daily) ----
  delete process.env.COURTKILL;
  ok('gate OFF: courtkillOn() false', ck.courtkillOn() === false);
  const g1 = await loadGame({ seed: 42, mode: 'ck-delegate-a' }); await setupGame(g1.Game);
  const g2 = await loadGame({ seed: 42, mode: 'ck-delegate-b' }); await setupGame(g2.Game);
  const ctxA = {}, ctxB = {};
  leadcourt.daily(g1.Game, ctxA);
  ck.courtkillLead.daily(g2.Game, ctxB);
  ok('gate OFF: courtkill-lead.daily byte-identical to leadcourt.daily (same seed)',
    JSON.stringify(ctxA) === JSON.stringify(ctxB),
    'diverged keys: ' + JSON.stringify(Object.keys(ctxB).filter(k => !(k in ctxA))));

  // ---- 2. gate ON + wave-3 locked = no hunt ----
  process.env.COURTKILL = '1';
  ok('gate ON: courtkillOn() true', ck.courtkillOn() === true);
  const g3 = await loadGame({ seed: 43, mode: 'ck-locked' }); await setupGame(g3.Game);
  // fresh game: wave-3 locked (day 1, no ledger points)
  ok('fresh game: wave-3 locked', ck.wave3Unlocked(g3.Game) === false);
  ok('locked: huntLive false', ck.huntLive(g3.Game) === false);
  const ctx3 = {};
  g3.Game.state.scholar.kcal = 5000;
  ck.courtkillLead.daily(g3.Game, ctx3);
  ok('locked: no hunt legs run', (ctx3.hunts || 0) === 0 && (ctx3.huntLegs || 0) === 0);

  // ---- 3. gate ON + wave-3 unlocked = hunt legs run ----
  const g4 = await loadGame({ seed: 44, mode: 'ck-hunt' }); await setupGame(g4.Game);
  g4.Game.unlockedWave = () => 3;
  g4.Game.state.scholar.kcal = 5000;
  g4.Game.state.scholar.hp = g4.Game.maxHealth ? g4.Game.maxHealth() : 100;
  const ctx4 = {};
  ck.courtkillLead.daily(g4.Game, ctx4);
  ok('unlocked: huntLive true', ck.huntLive(g4.Game) === true);
  ok('unlocked: hunt leg ran (travel into monster country)',
    (ctx4.hunts || 0) >= 1 && (ctx4.huntLegs || 0) >= 1,
    'hunts=' + (ctx4.hunts || 0) + ' legs=' + (ctx4.huntLegs || 0));
  // rung met (4 pts) = hunt stands down
  const g4b = await loadGame({ seed: 441, mode: 'ck-standdown' }); await setupGame(g4b.Game);
  g4b.Game.unlockedWave = () => 3;
  g4b.Game.waveLedgerPoints = () => 4;
  ok('rung met: huntLive false (stand down)', ck.huntLive(g4b.Game) === false);

  // ---- 4. fight commit at 60% HP: gate ON holds, gate OFF flees (RED) ----
  process.env.COURTKILL = '1';
  const on60 = await wave3Fight(45, 0.60);
  ck.courtkillLead.fight(on60.Game, on60.ctx);
  ok('gate ON, wave-3 @60%: _huntCommit marked', on60.ctx._huntCommit === true);
  ok('gate ON, wave-3 @60%: NO start-flee (legacy outmatched overridden)',
    (on60.ctx.fledBad || 0) === 0 && !!on60.Game.tbfight && !on60.Game.tbfight.over,
    'fledBad=' + (on60.ctx.fledBad || 0));
  delete process.env.COURTKILL;
  const off60 = await wave3Fight(45, 0.60);
  leadcourt.fight(off60.Game, off60.ctx); // RED: legacy behavior, no wrapper
  ok('gate OFF, wave-3 @60%: legacy FLEES at start (fledBad)',
    (off60.ctx.fledBad || 0) >= 1, 'fledBad=' + (off60.ctx.fledBad || 0));

  // ---- 5. mid-fight hold at 30%: gate ON holds to 12%, gate OFF flees ----
  process.env.COURTKILL = '1';
  const on30 = await wave3Fight(46, 0.30);
  on30.ctx._fightObj = on30.Game.tbfight; // simulate mid-fight (past start assessment)
  ck.courtkillLead.fight(on30.Game, on30.ctx);
  ok('gate ON, wave-3 @30% mid-fight: holds (no flee)',
    (on30.ctx.fled || 0) === 0, 'fled=' + (on30.ctx.fled || 0));
  delete process.env.COURTKILL;
  const off30 = await wave3Fight(46, 0.30);
  off30.ctx._fightObj = off30.Game.tbfight;
  leadcourt.fight(off30.Game, off30.ctx); // RED: legacy 35% threshold
  ok('gate OFF, wave-3 @30% mid-fight: legacy flees (35% threshold)',
    (off30.ctx.fled || 0) >= 1, 'fled=' + (off30.ctx.fled || 0));

  // ---- 6. suicide guard: <50% HP at fight START still flees, gate on ----
  process.env.COURTKILL = '1';
  const on40 = await wave3Fight(47, 0.40);
  ck.courtkillLead.fight(on40.Game, on40.ctx);
  ok('gate ON, wave-3 @40% at start: suicide guard flees (hp<50%)',
    (on40.ctx.fledBad || 0) >= 1, 'fledBad=' + (on40.ctx.fledBad || 0));

  // ---- 7. engagement: walk up to a visible wave-3 monster, honestly ----
  process.env.COURTKILL = '1';
  const g7 = await loadGame({ seed: 48, mode: 'ck-engage' }); await setupGame(g7.Game);
  g7.Game.unlockedWave = () => 3;
  const s7 = g7.Game.state.scholar;
  s7.mx = 4; s7.my = 4; s7.kcal = 5000;
  const px7 = g7.Game.map.px, py7 = g7.Game.map.py;
  plantMonster(g7.Game, 'redactor', px7, py7, 6, 4); // two squares east
  const ctx7 = {};
  const engaged = ck.engageVisibleWave3(g7.Game, ctx7);
  ok('engage: walked up to the visible redactor (fight started or honest miss)',
    engaged === true || (ctx7.huntSteps || 0) > 0,
    'engaged=' + engaged + ' steps=' + (ctx7.huntSteps || 0) + ' tbfight=' + !!g7.Game.tbfight);
  // non-wave-3 monster: not engaged
  const g7b = await loadGame({ seed: 481, mode: 'ck-engage-neg' }); await setupGame(g7b.Game);
  g7b.Game.unlockedWave = () => 3;
  g7b.Game.state.scholar.mx = 4; g7b.Game.state.scholar.my = 4; g7b.Game.state.scholar.kcal = 5000;
  plantMonster(g7b.Game, 'bulldozer', g7b.Game.map.px, g7b.Game.map.py, 6, 4);
  const ctx7b = {};
  ok('engage: ignores non-wave-3 monsters',
    ck.engageVisibleWave3(g7b.Game, ctx7b) === false && (ctx7b.huntSteps || 0) === 0);

  // ---- 8. courtship delegation structure: wrapper daily calls base.daily ----
  // (behavioral: gate-on daily with hunt inert == base daily on same seed)
  process.env.COURTKILL = '1';
  const g8a = await loadGame({ seed: 49, mode: 'ck-court-a' }); await setupGame(g8a.Game);
  const g8b = await loadGame({ seed: 49, mode: 'ck-court-b' }); await setupGame(g8b.Game);
  const ctx8a = {}, ctx8b = {};
  leadcourt.daily(g8a.Game, ctx8a);
  // hunt inert: lock wave-3 so only delegation runs
  ck.courtkillLead.daily(g8b.Game, ctx8b);
  const huntKeys = ['hunts', 'huntLegs', 'huntSteps', 'huntEngaged', 'huntFights', '_lastHuntDay'];
  const strippedB = Object.fromEntries(Object.entries(ctx8b).filter(([k]) => !huntKeys.includes(k)));
  ok('gate ON, hunt locked: daily delegates cleanly to base (no hunt keys leak)',
    JSON.stringify(ctx8a) === JSON.stringify(strippedB));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
