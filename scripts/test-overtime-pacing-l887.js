#!/usr/bin/env node
// test-overtime-pacing-l887.js — proof for gap-phase2 L887 (BREAK THE TIER-6
// RERUN GRIND, NAMED NEXT). The 1100Z run killed all three first attacks at
// pilot — table-sit (trigger never fires), door-deferral (no doors), rerun
// census (empty population) — leaving overtime pacing, the one L887 direction
// never armed, as the new attack. This test proves the arm's independent
// variable actually moves, so the pre-registered arm (see
// evidence/2026-10-24/l887-overtime-pacing-prereg.md) measures the lever and
// not a broken knob:
//   1. Baseline pacing from titans.json _overtime (7 days/tier, cap 6):
//      tier rises on the 7-day cadence and caps at 6.
//   2. IV manipulation (the arm's only change, applied as a post-load data
//      override — no repo data change): daysPerTier 14 halves the cadence
//      (7 counted days still tier 0, 14 counted days tier 1); maxTier 4
//      caps the climb at 4.
//   3. Per-tier punch is unchanged by pacing: at tier 3 a wave-4/5 fight is
//      still a RERUN x1.75 HP with the label, and raid knobs are per-tier
//      (pacing changes WHEN tiers arrive, not what a tier does).
// Usage: node scripts/test-overtime-pacing-l887.js (from the repo root)
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('overtime-pacing-l887');

(async () => {
  const Game = await K.load({ seed: 887 });
  K.newRun(Game);
  const s = Game.state.scholar, pg = Game.progState();
  Game.state.systemArrived = true;
  Game.tableSeat = () => ({ seat: 'lesser', detail: {} });
  Game.say = () => {}; Game.sysSay = () => {};
  const dawn = () => { s.day++; Game.overtimeTick(); };
  const ot = () => Game.data.titans._overtime;

  T.section('1. baseline pacing (7 days/tier, cap 6)');
  T.ok('baseline data is 7/tier cap 6', ot().daysPerTier === 7 && ot().maxTier === 6,
    JSON.stringify({ daysPerTier: ot().daysPerTier, maxTier: ot().maxTier }));
  pg.tableWaiting = true; // the clock runs only while the table waits, unseated
  s.day = 90; Game.tableAnnounce();
  T.ok('announced at day 90', pg.tableAnnounced === true);
  for (let i = 0; i < 8; i++) dawn(); // announcement dawn + 7 counted days
  T.ok('7 counted days: tier 1', Game.overtimeTier() === 1, 'tier ' + Game.overtimeTier());
  for (let i = 0; i < 7; i++) dawn();
  T.ok('14 counted days: tier 2', Game.overtimeTier() === 2, 'tier ' + Game.overtimeTier());
  for (let i = 0; i < 28; i++) dawn();
  T.ok('42 counted days: tier 6', Game.overtimeTier() === 6, 'tier ' + Game.overtimeTier());
  for (let i = 0; i < 30; i++) dawn();
  T.ok('tier caps at 6', Game.overtimeTier() === 6, 'tier ' + Game.overtimeTier());

  T.section('2. IV manipulation: the arm moves the clock, nothing else');
  // Fresh clock, same door state.
  pg.overtime = 0; pg.overtimeDays = 0; pg.overtimeStarted = false;
  pg.overtimeLastDay = -1; pg.tableDone = false;
  ot().daysPerTier = 14;
  for (let i = 0; i < 8; i++) dawn(); // announcement dawn + 7 counted days
  T.ok('14-day cadence: 7 counted days still tier 0', Game.overtimeTier() === 0,
    'tier ' + Game.overtimeTier());
  for (let i = 0; i < 7; i++) dawn();
  T.ok('14-day cadence: 14 counted days tier 1', Game.overtimeTier() === 1,
    'tier ' + Game.overtimeTier());
  ot().daysPerTier = 7; ot().maxTier = 4;
  pg.overtime = 0; pg.overtimeDays = 0; pg.overtimeStarted = false;
  pg.overtimeLastDay = -1;
  for (let i = 0; i < 8; i++) dawn();
  for (let i = 0; i < 35; i++) dawn(); // 42 counted days
  T.ok('cap 4: 42 counted days caps at 4, not 6', Game.overtimeTier() === 4,
    'tier ' + Game.overtimeTier());
  ot().daysPerTier = 7; ot().maxTier = 6; // restore (process-local, but be clean)

  T.section('3. per-tier punch unchanged by pacing');
  pg.overtime = 3;
  const base = (Game.data.monsters.find(m => m.id === 'cancellation') || {}).hp;
  const mf = K.fight(Game, 'cancellation');
  T.ok('tier 3: HP x1.75 (above the data max)', mf.hp >= Math.round(base[0] * 1.75) && mf.hp > base[1],
    'hp ' + mf.hp + ' vs data ' + base);
  T.ok('tier 3: RERUN x3 label + otTier', /RERUN ×3/.test(mf.name) && Game.tbfight.otTier === 3,
    mf.name + ' otTier ' + Game.tbfight.otTier);
  Game.tbEnd('fled');
  const rk = Game.overtimeRaidKnobs();
  T.ok('tier 3 raid knobs are per-tier (cooldown 4, skip 0.64, gorge 1.75)',
    rk && rk.cooldown === 4 && Math.abs(rk.skip - 0.64) < 1e-9 && Math.abs(rk.gorge - 1.75) < 1e-9,
    JSON.stringify(rk));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
