// scripts/test-tablewithdraw-20261021.js — proof test for journey-scale r19
// (2026-10-21): THE WITHDRAWN SEAT.
//
// The deed re-check (ledger.js endDay wrap -> tableAnnounce -> tableScene)
// must withdraw a stale tableWaiting ALOUD when the seat regresses to
// 'none' — never silently. The one regressable lesser-seat bar in the scale
// window is the integration stage (scholar.integration < 40 -> stage 1);
// waves/contests/crises/food-deeds are monotonic and networkLive never
// clears, so the integration slip is the reachable withdrawal path.
//
// Construction (honest state, no stubs): a fresh game is given a full
// lesser-seat deed profile via the real pg.deeds / pg.crises / scale flags
// the bars read, then integration slips 45 -> 39 the way a real refusal
// does (answerSystemFavor('refuse') -3, comms.js).
//
// GREEN means:
//   1. with integration 45 the seat is 'lesser' (construction valid)
//   2. with integration 39 the seat is 'none' (the slip regresses the seat)
//   3. the dawn check fires the withdrawal beat ALOUD (copy captured),
//      tableWaiting=false, tableAnnounced=false, tableDone=false (no silent flip)
//   4. re-earning (integration back to 45) re-extends the invitation ALOUD
//      via checkArc's TABLE RE-FIRE (the "will be set again" promise is honored)
// Usage: node scripts/test-tablewithdraw-20261021.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const WITHDRAW_BITS = ['does not come', 'NOT COMPLETE', 'RESCHEDULE', 'withdrawn'];
const REFIRE_BITS = ['The table is being set'];

async function main() {
  const fails = [];
  const { Game } = await loadGame({ seed: 777001, mode: 'tablewithdraw-proof' });
  await setupGame(Game);
  const sayCap = [];
  const _say = Game.say;
  Game.say = function (...a) { sayCap.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };

  const pg = Game.progState();
  const s = Game.state.scholar;
  // --- construct a full lesser-seat deed profile (the bars' real inputs) ---
  const deeds = Game.deedState();
  deeds.wavesFaced = { a: 1, b: 1, c: 1, d: 1, e: 2, f: 2, g: 2, h: 2, i: 3, j: 3, k: 3 };
  deeds.contestsSurvived = 2;
  pg.crises = { 'first-grave': 1, 'hunger-winter': 1 };
  Game.state.networkLive = true;              // regional standing
  Game.state.systemArrived = true;
  s.day = 95;
  s.integration = 45;                          // stage 2 (neural creep)
  pg.sentimentTaught = true;
  s.prog = s.prog || {}; s.prog.feastSurgeUsed = true;
  pg.arc = 4; pg.tableWaiting = true; pg.tableAnnounced = true; pg.tableDone = false;
  try { Game.state.systemArrived = true; } catch (e) {}

  const seat0 = Game.tableSeat();
  if (!seat0 || seat0.seat !== 'lesser') fails.push(`construction invalid: seat=${seat0 && seat0.seat} (expected lesser), detail=${JSON.stringify(seat0 && seat0.detail)}`);

  // --- the slip: integration 45 -> 39 (stage 2 -> 1), as a favor refusal does ---
  s.integration = 39;
  const seat1 = Game.tableSeat();
  if (!seat1 || seat1.seat !== 'none') fails.push(`slip did not regress seat: seat=${seat1 && seat1.seat} (expected none)`);

  // --- the dawn check (exactly what ledger.js's endDay wrap calls) ---
  sayCap.length = 0;
  try { Game.tableAnnounce(); } catch (e) { fails.push('tableAnnounce threw: ' + e.message); }
  const wdText = sayCap.join('\n');
  const wdFired = WITHDRAW_BITS.every(b => wdText.includes(b));
  if (!wdFired) fails.push('withdrawal beat did NOT fire aloud; captured:\n' + sayCap.slice(0, 6).join('\n---\n'));
  const pg2 = Game.progState();
  if (pg2.tableWaiting !== false) fails.push(`tableWaiting not cleared: ${pg2.tableWaiting}`);
  if (pg2.tableAnnounced !== false) fails.push(`tableAnnounced not cleared: ${pg2.tableAnnounced}`);
  if (pg2.tableDone !== false) fails.push(`tableDone flipped (must stay false): ${pg2.tableDone}`);

  // --- the promise: re-earn -> the invitation is re-extended ALOUD ---
  s.integration = 45;
  sayCap.length = 0;
  try { Game.checkArc(); } catch (e) { fails.push('checkArc threw: ' + e.message); }
  const rfText = sayCap.join('\n');
  const rfFired = REFIRE_BITS.some(b => rfText.includes(b));
  if (!rfFired) fails.push('TABLE RE-FIRE did not speak aloud; captured:\n' + sayCap.slice(0, 6).join('\n---\n'));
  const pg3 = Game.progState();
  if (pg3.tableWaiting !== true) fails.push(`tableWaiting not restored by re-fire: ${pg3.tableWaiting}`);

  // --- honesty note: does the withdrawal copy name the failed bar? (documented, not a fail) ---
  const namesBar = /integration|neural|slip/i.test(wdText);
  console.log(`withdrawal names the failed bar: ${namesBar}`);

  if (fails.length) {
    console.log('FAILURES:');
    for (const f of fails) console.log('  ' + f);
    process.exit(1);
  }
  console.log('GREEN: seat slips lesser->none on integration loss; the withdrawal beat fires aloud with exact state transitions; the re-fire re-extends the invitation aloud.');
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
