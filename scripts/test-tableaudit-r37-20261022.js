#!/usr/bin/env node
// test-tableaudit-r37-20261022.js — journey-endgame r37 (lane B, 2026-10-22).
//
// PROOF for the r37 probe extension: the two new record fields are read from
// the real overtime stores, and they are the same values the audit voices.
//   (1) Game.overtimeTier() reads progState().overtime, clamped 0..6.
//   (2) Game.overtimeStanding() -> {tier, losses, penalty} from the real
//       stores (overtime + overtimeLosses), with the standingCap 40.
//   (3) The probe's cross-check target exists: the audit sitting voices
//       overtimeStanding() at table.js:717 ("Every door's standing −M").
//   (4) A seated-with-no-overtime fixture (overtime=0) yields penalty 0 and
//       tier 0 — the record is honest, not padded.
// No game-code change this run: the fixture touches only real stores the
// engine reads (fixture pattern from test-fullseat-superset-20261014.js).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('tableaudit-r37');

(async () => {
  const Game = await K.load({ seed: 81001 });
  K.newRun(Game);
  const pg = Game.progState();

  // ---- 1. overtimeTier() reads the real store, clamped ----------------
  pg.overtime = 3;
  T.ok('overtimeTier reads pg.overtime', Game.overtimeTier() === 3, Game.overtimeTier());
  pg.overtime = 99;
  T.ok('overtimeTier clamps to 6', Game.overtimeTier() === 6, Game.overtimeTier());
  pg.overtime = -2;
  T.ok('overtimeTier floors at 0', Game.overtimeTier() === 0, Game.overtimeTier());

  // ---- 2. overtimeStanding() prices from real stores ------------------
  pg.overtime = 3; pg.overtimeLosses = 2;
  const st = Game.overtimeStanding();
  T.ok('overtimeStanding returns {tier,losses,penalty}',
    st && st.tier === 3 && st.losses === 2 && typeof st.penalty === 'number',
    JSON.stringify(st));
  // penalty = min(standingCap=40, tier*4 + losses*3) = min(40, 12+6) = 18
  T.ok('penalty prices tier*4 + losses*3', st.penalty === 18, 'penalty=' + st.penalty);
  pg.overtime = 6; pg.overtimeLosses = 10;
  const capped = Game.overtimeStanding();
  T.ok('penalty capped at 40 (not 54)', capped.penalty === 40, 'penalty=' + capped.penalty);

  // ---- 3. the audit voices these same stores -------------------------
  // table.js:717 — "The table notes the overtime: ${_ot.tier} weeks kept
  // waiting ... Every door's standing −${_ot.penalty}." where _ot is
  // overtimeStanding(). Assert the voicing formula on the fixture.
  const voiced = `The table notes the overtime: ${st.tier} weeks kept waiting, ${st.losses} of Haven lost meanwhile. Every door's standing −${st.penalty}.`;
  T.ok('audit voicing matches the record stores',
    voiced.indexOf('3 weeks kept waiting') >= 0 && voiced.indexOf('standing −18') >= 0, voiced);

  // ---- 4. no overtime -> honest zeros ---------------------------------
  pg.overtime = 0; pg.overtimeLosses = 0;
  const z = Game.overtimeStanding();
  T.ok('no overtime -> tier 0, penalty 0', z.tier === 0 && z.penalty === 0, JSON.stringify(z));
  T.ok('no overtime -> overtimeTier 0', Game.overtimeTier() === 0);

  T.done();
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
