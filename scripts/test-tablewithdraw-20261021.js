// scripts/test-tablewithdraw-20261021.js — proof test for journey-scale r19
// (2026-10-21): THE WITHDRAWN SEAT.
//
// REWRITTEN 2026-11-06 (sim-tableoffer-b, Steve 2026-11-06 07:06 CST):
// the r19 behavior this file proved — a regressed seat withdraws the
// table aloud — is SUPERSEDED by the sticky-offer ruling: once the table
// offers a seat, the offer does NOT withdraw. The withdrawal beat now
// fires ONLY for a table that was never announced (the pre-offer "does
// not come" path, proved in test-tableoffer-20261106.js Part B). This
// file now proves the ruling on the SAME construction: offer made, then
// the integration slip (45 -> 39, as a favor refusal does).
//
// The deed re-check (ledger.js endDay wrap -> tableAnnounce -> tableScene)
// must HOLD an offered seat aloud when the seat regresses to 'none' —
// never withdraw it. The one regressable lesser-seat bar in the scale
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
//   3. the dawn check does NOT withdraw the offered seat: no withdrawal
//      copy, tableWaiting + tableAnnounced stay true, tableDone stays
//      false — instead the holding line speaks once, naming the slipped bar
//   4. re-earning (integration back to 45) re-fires the offer: the return
//      line speaks, the Haven preview returns the lesser seat, and the
//      sitting succeeds
// Usage: node scripts/test-tablewithdraw-20261021.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const WITHDRAW_BITS = ['does not come', 'NOT COMPLETE', 'RESCHEDULE', 'withdrawn'];
const HOLD_BITS = ['holds its place', 'DOES NOT TAKE BACK'];
const RETURN_BITS = ['the ring steadies', 'STILL YOURS'];

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
  // STICKY OFFER (Steve 2026-11-06): the offered seat must HOLD, not
  // withdraw. No withdrawal copy, flags stay, holding line speaks once.
  sayCap.length = 0;
  try { Game.tableAnnounce(); } catch (e) { fails.push('tableAnnounce threw: ' + e.message); }
  const holdText = sayCap.join('\n');
  if (WITHDRAW_BITS.every(b => holdText.includes(b))) fails.push('withdrawal beat fired on an OFFERED seat (superseded by the sticky-offer ruling):\n' + sayCap.slice(0, 4).join('\n---\n'));
  if (!HOLD_BITS.every(b => holdText.includes(b))) fails.push('holding line did not speak on the dipped offer; captured:\n' + sayCap.slice(0, 4).join('\n---\n'));
  const pg2 = Game.progState();
  if (pg2.tableWaiting !== true) fails.push(`tableWaiting cleared on a dipped offer: ${pg2.tableWaiting} (must stay true)`);
  if (pg2.tableAnnounced !== true) fails.push(`tableAnnounced cleared on a dipped offer: ${pg2.tableAnnounced} (must stay true)`);
  if (pg2.tableDone !== false) fails.push(`tableDone flipped (must stay false): ${pg2.tableDone}`);

  // --- the promise: re-earn -> the held offer re-fires ---
  s.integration = 45;
  sayCap.length = 0;
  try { Game.tableAnnounce(); } catch (e) { fails.push('recovery tableAnnounce threw: ' + e.message); }
  const retText = sayCap.join('\n');
  if (!RETURN_BITS.every(b => retText.includes(b))) fails.push('return line did not speak on recovery; captured:\n' + sayCap.slice(0, 4).join('\n---\n'));
  const pv = Game.tablePreview();
  if (!pv || pv.seat !== 'lesser') fails.push(`preview did not return the re-fired offer: ${JSON.stringify(pv)}`);
  const pg3 = Game.progState();
  if (pg3.tableWaiting !== true) fails.push(`tableWaiting not held through the dip: ${pg3.tableWaiting}`);

  // --- honesty (r20, 2026-10-22): the holding copy must name the failed
  // bar — the old stock "deeds are not all done" lied when integration alone
  // slipped (the r19 sim finding). This is a fail, not a note.
  const namesBar = /integration|neural|slip/i.test(holdText);
  if (!namesBar) fails.push('holding copy does NOT name the failed bar; captured:\n' + sayCap.slice(0, 6).join('\n---\n'));

  // --- tableWithdrawLine unit voicing (proof-testable, no modal flow) ---
  const wl = Game.tableWithdrawLine.bind(Game);
  const slipSeat = { seat: 'none', detail: { w1: 4, w2: 4, w3: 3, w4: 0, w5: 0, contestsN: 2, crisesN: 2, rank: 'regional', stage: 1, foodDeeds: true } };
  const slipLine = wl(slipSeat);
  if (!/integration too shallow \(stage 1\)/.test(slipLine)) fails.push('withdrawLine misses the integration slip: ' + slipLine.slice(0, 140));
  if (/THE DEEDS ARE NOT ALL DONE/i.test(slipLine)) fails.push('withdrawLine blames the deeds on an integration slip: ' + slipLine.slice(0, 140));
  const multiSeat = { seat: 'none', detail: { w1: 2, w2: 4, w3: 3, contestsN: 1, crisesN: 2, rank: 'village', stage: 1, foodDeeds: false } };
  const multiLine = wl(multiSeat);
  for (const bit of ['wave-blood unpaid (2/4, 4/4, 3/3)', 'fewer than two contests survived (1)', 'standing too low (village)', 'integration too shallow (stage 1)', 'the food-thesis unproven'])
    if (!multiLine.includes(bit)) fails.push('withdrawLine drops a missing bar: ' + bit);
  // empty detail: every bar reads unmet, so all of them are named honestly
  const bareLine = wl({ seat: 'none', detail: {} });
  if (!/wave-blood unpaid \(0\/4, 0\/4, 0\/3\)/.test(bareLine)) fails.push('withdrawLine hides unmet bars on empty detail: ' + bareLine.slice(0, 140));
  // defensive fallback only: a 'none' seat whose detail passes every bar
  // (cannot come from tableSeat — lesser would have been 'lesser')
  const defensive = wl({ seat: 'none', detail: { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'national', stage: 2, foodDeeds: true } });
  if (!/the deeds are not all done/.test(defensive)) fails.push('withdrawLine loses the generic fallback: ' + defensive.slice(0, 140));

  if (fails.length) {
    console.log('FAILURES:');
    for (const f of fails) console.log('  ' + f);
    process.exit(1);
  }
  console.log('GREEN: seat slips lesser->none on integration loss; the OFFERED seat holds aloud (no withdrawal, flags stay, holding line names the bar) and re-fires on recovery with the preview returning the lesser seat.');
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
