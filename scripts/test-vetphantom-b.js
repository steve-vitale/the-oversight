#!/usr/bin/env node
// test-vetphantom-b.js — proof test for the vetfirst-b 190305
// readiness-vs-ladder veteran phantom (Loop B arm sim-vetphantom-b).
//
// THE DEFECT (vetfirst-b, evidence/2026-11-11/sim-vetfirst-b.md §9,
// seed 190305, 150d, competent): on the final day (d121, roster emptied)
// `waveCombatReadiness(4).veterans` = 1 while
// `_ladderLivingVeterans(4)` = 0 and the instrument's final snapshot = 0.
// The readiness gate read a dead veteran as living. Phantom identified by
// elimination as Tama King (wave-3-only killer, died d121 in combat).
//
// MECHANISM (read in code, confirmed by this fixture): `ladder.js`
// `countLivingVeterans.isLiving` requires roster membership
// (`roster.indexOf(vid) < 0 → false`) and then checks `vp.dead`.
// `standing.js` `waveCombatReadiness.isLiving` had NO roster check —
// `vp && !vp.dead` only. The TB combat death path (`game.js`
// `tbVillagerFalls`) removes the villager from the roster but never sets
// `vp.dead`, so a TB-fallen veteran keeps a live-reading vp record and
// is counted by readiness from then on, while the ladder correctly
// counts 0.
//
// THE FIX (already landed before this arm, journey-scale r131,
// commit 5d16916f4, local master): one line in
// `waveCombatReadiness.isLiving`, mirroring `countLivingVeterans`:
//   if (roster.indexOf(vid) < 0) return false;
// This test is the named-next fixture from vetfirst-b §9: it kills a
// wave-3+ veteran in combat and reads ALL THREE counts (readiness,
// ladder, instrument recomputation) on the death day AND the day after.
// It must FAIL on pre-fix code (phantom reproduced: readiness 1 vs
// ladder 0 vs instrument 0) and PASS on fixed code (all three agree).
// Sensitivity is proven by running it against the pre-fix standing.js
// (see evidence/2026-11-11/sim-vetphantom-b.md) — never by editing the
// assertions.
//
// Usage: node scripts/test-vetphantom-b.js
'use strict';
const K = require('./godpath/lib');
const H = require('./sim-harness');
const { competent } = require('./policies/competent');
const VF = require('./vetfirst-instrument-20261111');
const T = K.reporter('vetphantom-b');

// Three-way veteran read: engine readiness, engine ladder, and the
// instrument's own kill-time-keyed recomputation (the same rule the
// vetfirst-b instrument used: roster + vp.dead, scholar counts).
function counts(Game) {
  let r4 = -1, r5 = -1, l3 = -1, l4 = -1, i3 = -1, i4 = -1;
  try { r4 = (Game.waveCombatReadiness(4) || {}).veterans; } catch (e) { r4 = 'ERR:' + (e && e.message); }
  try { r5 = (Game.waveCombatReadiness(5) || {}).veterans; } catch (e) { r5 = 'ERR:' + (e && e.message); }
  try { l3 = Game._ladderLivingVeterans(3); } catch (e) { l3 = 'ERR:' + (e && e.message); }
  try { l4 = Game._ladderLivingVeterans(4); } catch (e) { l4 = 'ERR:' + (e && e.message); }
  try { i3 = VF.livingVeterans(Game, 3, {}).count; } catch (e) { i3 = 'ERR:' + (e && e.message); }
  try { i4 = VF.livingVeterans(Game, 4, {}).count; } catch (e) { i4 = 'ERR:' + (e && e.message); }
  return { r4, r5, l3, l4, i3, i4 };
}
function fmt(c) { return 'r4=' + c.r4 + ' r5=' + c.r5 + ' l3=' + c.l3 + ' l4=' + c.l4 + ' i3=' + c.i3 + ' i4=' + c.i4; }
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  const Game = await K.load({ seed: 131100 });

  // fresh(): a new expedition, departed, with a roster. Returns two
  // distinct non-scholar roster villagers (vidA, vidB) and the scholar id.
  function fresh() {
    K.newRun(Game);
    Game.state.waveKillLog = Game.state.waveKillLog || [];
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    if (others.length < 2) throw new Error('fresh run has <2 non-scholar roster members: ' + JSON.stringify(roster));
    return { vidA: others[0], vidB: others[1], scholarId, roster };
  }
  function giveKill(vid, w) {
    Game.state.waveKillLog.push({ by: vid, w: w, day: gday(Game) || 1 });
  }
  function onRoster(vid) { return ((Game.state.village || {}).roster || []).includes(vid); }
  function vpDead(vid) {
    try { const vp = Game.vpOf(vid); return !!(vp && vp.dead); } catch (e) { return 'ERR'; }
  }
  // Advance one competent day (the day-after read). Returns the day
  // reached, or null if the day loop could not advance.
  async function advanceOneDay() {
    const d0 = gday(Game);
    try {
      await H.quietLog(async function () { await H.runDays(Game, competent, { days: 1 }); });
    } catch (e) { return { day: gday(Game), error: String((e && e.message) || e).slice(0, 120) }; }
    return { day: gday(Game), from: d0, error: null };
  }

  // ---- 1. Alive veteran — all three reads agree ----
  T.section('1. Alive veteran — three counts agree');
  let f = fresh();
  giveKill(f.vidA, 3);
  let c = counts(Game);
  T.ok('alive w3 killer: readiness(4).veterans = 1', c.r4 === 1, fmt(c));
  T.ok('alive w3 killer: ladder(3) = 1', c.l3 === 1, fmt(c));
  T.ok('alive w3 killer: instrument(3) = 1', c.i3 === 1, fmt(c));
  T.ok('alive w3 killer: readiness(5) = 0 (w3 does not lift w5)', c.r5 === 0, fmt(c));
  T.ok('alive w3 killer: ladder(4) = 0', c.l4 === 0, fmt(c));
  T.ok('alive w3 killer: instrument(4) = 0', c.i4 === 0, fmt(c));

  // ---- 2. Tama shape, death day: w3 killer falls in TB combat ----
  T.section('2. Tama shape, death day — w3 killer falls in TB combat');
  f = fresh();
  giveKill(f.vidA, 3);
  const deathDay = gday(Game);
  Game.tbVillagerFalls({ villagerId: f.vidA });
  T.ok('TB fall removes the villager from the roster', !onRoster(f.vidA),
    'roster: ' + JSON.stringify((Game.state.village || {}).roster));
  T.ok('TB fall does NOT set vp.dead (the lag, documented)', vpDead(f.vidA) === false,
    'vp.dead=' + vpDead(f.vidA));
  c = counts(Game);
  T.ok('death day: readiness(4) = 0 (no phantom)', c.r4 === 0, fmt(c));
  T.ok('death day: ladder(3) = 0', c.l3 === 0, fmt(c));
  T.ok('death day: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('death day: readiness(4) == ladder(3) == instrument(3)', c.r4 === c.l3 && c.l3 === c.i3, fmt(c));
  T.ok('death day: readiness(5) stays 0 (w3 killer never lifted w5)', c.r5 === 0, fmt(c));

  // ---- 3. Tama shape, day after: the phantom must not reappear ----
  T.section('3. Tama shape, day after — phantom must not reappear');
  const adv = await advanceOneDay();
  T.ok('day advanced by one', adv.error === null && adv.day === deathDay + 1,
    'from d' + deathDay + ' to d' + adv.day + (adv.error ? ' err=' + adv.error : ''));
  T.ok('day after: fallen veteran still off the roster', !onRoster(f.vidA), 'roster len ' + ((Game.state.village || {}).roster || []).length);
  T.ok('day after: vp.dead still unset (the lie persists)', vpDead(f.vidA) === false, 'vp.dead=' + vpDead(f.vidA));
  c = counts(Game);
  T.ok('day after: readiness(4) = 0 (no phantom)', c.r4 === 0, fmt(c));
  T.ok('day after: ladder(3) = 0', c.l3 === 0, fmt(c));
  T.ok('day after: instrument(3) = 0', c.i3 === 0, fmt(c));
  T.ok('day after: three counts agree', c.r4 === c.l3 && c.l3 === c.i3, fmt(c));

  // ---- 4. Mireille shape: w4 killer falls in TB combat ----
  T.section('4. Mireille shape — w4 killer falls in TB combat');
  f = fresh();
  giveKill(f.vidA, 4);
  c = counts(Game);
  T.ok('alive w4 killer: readiness(5).veterans = 1', c.r5 === 1, fmt(c));
  T.ok('alive w4 killer: ladder(4) = 1', c.l4 === 1, fmt(c));
  T.ok('alive w4 killer: instrument(4) = 1', c.i4 === 1, fmt(c));
  const deathDay4 = gday(Game);
  Game.tbVillagerFalls({ villagerId: f.vidA });
  c = counts(Game);
  T.ok('death day: readiness(5) = 0 (no phantom)', c.r5 === 0, fmt(c));
  T.ok('death day: ladder(4) = 0', c.l4 === 0, fmt(c));
  T.ok('death day: instrument(4) = 0', c.i4 === 0, fmt(c));
  T.ok('death day: three counts agree on the w5 bar', c.r5 === c.l4 && c.l4 === c.i4, fmt(c));
  const adv4 = await advanceOneDay();
  T.ok('day advanced by one', adv4.error === null && adv4.day === deathDay4 + 1,
    'from d' + deathDay4 + ' to d' + adv4.day + (adv4.error ? ' err=' + adv4.error : ''));
  c = counts(Game);
  T.ok('day after: readiness(5) = 0 (no phantom)', c.r5 === 0, fmt(c));
  T.ok('day after: ladder(4) = 0', c.l4 === 0, fmt(c));
  T.ok('day after: instrument(4) = 0', c.i4 === 0, fmt(c));

  // ---- 5. Control: removeVillager marks dead, all three read 0 ----
  T.section('5. Control — removeVillager(killed) marks dead');
  f = fresh();
  giveKill(f.vidA, 3);
  Game.removeVillager(f.vidA, 'killed');
  T.ok('removeVillager removes the villager from the roster', !onRoster(f.vidA),
    'roster: ' + JSON.stringify((Game.state.village || {}).roster));
  T.ok('removeVillager sets vp.dead = true', vpDead(f.vidA) === true, 'vp.dead=' + vpDead(f.vidA));
  c = counts(Game);
  T.ok('after removeVillager: readiness(4) = 0', c.r4 === 0, fmt(c));
  T.ok('after removeVillager: ladder(3) = 0', c.l3 === 0, fmt(c));
  T.ok('after removeVillager: instrument(3) = 0', c.i3 === 0, fmt(c));

  // ---- 6. No undercount: a living second veteran still counts ----
  T.section('6. No undercount — living second veteran still counts');
  f = fresh();
  giveKill(f.vidA, 3);
  giveKill(f.vidB, 3);
  Game.tbVillagerFalls({ villagerId: f.vidA });
  c = counts(Game);
  T.ok('one TB-fallen + one living: readiness(4) = 1', c.r4 === 1, fmt(c));
  T.ok('one TB-fallen + one living: ladder(3) = 1', c.l3 === 1, fmt(c));
  T.ok('one TB-fallen + one living: instrument(3) = 1', c.i3 === 1, fmt(c));
  T.ok('one TB-fallen + one living: three counts agree', c.r4 === c.l3 && c.l3 === c.i3, fmt(c));

  // ---- 7. Scholar kill still counts (no overcorrection) ----
  T.section('7. Scholar kill still counts (Steve RULED 2026-11-10)');
  f = fresh();
  giveKill(f.scholarId, 3);
  c = counts(Game);
  T.ok('scholar w3 kill: readiness(4) = 1', c.r4 === 1, fmt(c));
  T.ok('scholar w3 kill: ladder(3) = 1', c.l3 === 1, fmt(c));
  T.ok('scholar w3 kill: instrument(3) = 1', c.i3 === 1, fmt(c));

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
