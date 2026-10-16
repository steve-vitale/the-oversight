#!/usr/bin/env node
'use strict';
// scripts/test-feastcost-20261016.js — proof test for the feast-economy
// cost lever (sim-feastcost-b, 2026-10-16): FEASTCOST=1 scales
// plentyPerFeast by quality — a fine feast (quality 1) credits half
// (+10) of a legend (+20); default OFF is byte-identical to pristine.
//
// RED/GREEN: on pristine code FEASTCOST=1 computes 140 for the fixture
// (RED: armed expectation 90 fails). With the lever, FEASTCOST=1 gives 90
// and gate-off gives 140 (GREEN both).
// SMOKE: cfg shape, quality-0 exclusion, feasts count unchanged, total==sum.
//
// KILLED 2026-10-16 (sim-feastcost-b): the pilot's P2 missed (+0/+1d vs the
// pre-registered +7d — the faced-deferral paces the bar, not the bread
// credit). The layer was deleted per kill protocol (src/js/standing.js
// reverted to HEAD, byte-identical). This script remains as the
// instrument: gate-off runs GREEN 9/9; the armed assertions now FAIL by
// design (RED) since the lever no longer exists. The RED→GREEN record
// (2026-10-16, armed fixture 90 vs pristine 140) stands as the pilot's
// sensitivity proof.
// Uses the shared kit only (scripts/sim-harness.js) — no copied eval
// boilerplate. The harness seeds Math.random BEFORE eval'ing modules and
// stubs window then deletes it. Game.save is never touched.
//
// Usage:
//   FEASTCOST=1 node scripts/test-feastcost-20261016.js   # armed expectations
//   node scripts/test-feastcost-20261016.js               # gate-off expectations
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const ARMED = process.env.FEASTCOST === '1';
// Fixture: 5 fine feasts (quality 1) + 2 legends (quality 2) + 1 thin meal
// (quality 0, below feastQualityMin — must never count).
const FIXTURE = [
  { day: 10, quality: 1 }, { day: 20, quality: 1 }, { day: 30, quality: 1 },
  { day: 40, quality: 1 }, { day: 50, quality: 1 },
  { day: 15, quality: 2 }, { day: 35, quality: 2 },
  { day: 25, quality: 0 },
];
// ARMED:   5*10 + 2*20 + 0 = 90
// PRISTINE/gate-off: 7*20 + 0 = 140
// NOTE: after the 2026-10-16 kill (layer deleted), gate-off/pristine code
// has NO plentyPerFeastQ1 field at all — undefined is the correct
// gate-off expectation now.
const EXPECT_PLENTY = ARMED ? 90 : 140;
const EXPECT_Q1CREDIT = ARMED ? 10 : undefined;
const EXPECT_FEASTS = 7; // quality-0 excluded in both modes

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  console.log('== feastcost proof (' + (ARMED ? 'FEASTCOST=1 armed' : 'gate-off') + ') ==');
  const { Game } = await loadGame({ seed: 4242, mode: 'feastcost-proof' });
  await setupGame(Game);

  const cfg = Game.standingCfg();
  check('cfg exposes plentyPerFeast', cfg.plentyPerFeast === 20, 'got ' + cfg.plentyPerFeast);
  check('cfg.plentyPerFeastQ1 = ' + EXPECT_Q1CREDIT, cfg.plentyPerFeastQ1 === EXPECT_Q1CREDIT,
    'got ' + cfg.plentyPerFeastQ1);
  check('cfg.feastQualityMin unchanged', cfg.feastQualityMin === 1, 'got ' + cfg.feastQualityMin);

  Game.state.feastLog = FIXTURE.map(f => ({ day: f.day, quality: f.quality }));
  const s = Game.villageStanding();
  check('feast count excludes quality-0 (' + EXPECT_FEASTS + ')', s.feasts === EXPECT_FEASTS,
    'got ' + s.feasts);
  check('plenty = ' + EXPECT_PLENTY + ' (' + (ARMED ? 'quality-tiered' : 'pristine credit') + ')',
    s.plenty === EXPECT_PLENTY, 'got ' + s.plenty);
  check('total = war+diplomacy+plenty', s.total === s.war + s.diplomacy + s.plenty,
    JSON.stringify({ total: s.total, war: s.war, dip: s.diplomacy, plenty: s.plenty }));

  // SMOKE: the gated total still computes and the standing line names bread honestly.
  let total = null, line = '';
  try { total = Game.villageStandingTotal(); } catch (e) { total = 'ERR ' + e.message; }
  check('villageStandingTotal() computes', typeof total === 'number', String(total));
  try { line = Game.standingLine(); } catch (e) { line = 'ERR ' + e.message; }
  check('standingLine() narrates', typeof line === 'string' && line.length > 0, String(line).slice(0, 80));

  // SMOKE: an empty feast log is 0 plenty in both modes — no phantom credit.
  Game.state.feastLog = [];
  const s0 = Game.villageStanding();
  check('empty feast log → plenty 0', s0.plenty === 0 && s0.feasts === 0,
    JSON.stringify({ plenty: s0.plenty, feasts: s0.feasts }));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
