// scripts/test-tableoffer-20261106.js — proof test for sim-tableoffer-b
// (2026-11-06): THE STICKY TABLE OFFER (Steve 2026-11-06 07:06 CST).
//
// Ruling: once the table offers a seat, the offer does NOT withdraw. The
// d90 withdrawal is a DEFECT, not a rule; the time after the offer is not
// "extra time to repair."
//
// Construction (honest state, no stubs — same lesser-seat profile as the
// r19 withdrawal test): a fresh game is given a full lesser-seat deed
// profile via the real pg.deeds / pg.crises / scale flags the bars read,
// then integration slips 45 -> 39 the way a real refusal does
// (answerSystemFavor('refuse') -3, comms.js). The slip is the only
// regressable lesser-seat bar (waves/contests/crises/food-deeds are
// monotonic).
//
// GREEN means:
//   PART A (the fix): with the offer made, the slip does NOT withdraw it —
//     no withdrawal copy, tableWaiting + tableAnnounced stay true,
//     tableDone stays false, the holding line speaks ONCE naming the
//     slipped bar; a second dawn does not repeat it; on recovery the
//     return line speaks once, the Haven preview returns the offer, and
//     the sitting succeeds (tableScene runs the audit + offers paths).
//   PART B (preserved): a village that NEVER had the offer announced
//     still hears the withdrawal beat aloud at dawn (tableWaiting cleared)
//     and the TABLE RE-FIRE still re-extends the invitation aloud on
//     re-earning — the pre-offer "does not come" path is untouched.
//   PART C (decline preserved): an offered village can hold the offer
//     unseated across dawns — nothing auto-sits, nothing clears the wait;
//     the player declining to sit is a choice the engine never takes away.
//   PART D (voicing): tableWithdrawLine still names the real missing bars
//     (it still voices the pre-offer beat) and tableMissingBars is its
//     single source of truth.
// Usage: node scripts/test-tableoffer-20261106.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const WITHDRAW_BITS = ['does not come', 'NOT COMPLETE', 'RESCHEDULE', 'withdrawn'];
const HOLD_BITS = ['holds its place', 'DOES NOT TAKE BACK'];
const RETURN_BITS = ['the ring steadies', 'STILL YOURS'];
const REFIRE_BITS = ['The table is being set'];

function buildLesserProfile(Game) {
  const pg = Game.progState();
  const s = Game.state.scholar;
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
  // LEG 2 (2026-11-08): Village ladder standing (12 counted points) so
  // the lesser seat prices. Fight 6 (wave-3 ledger 12) + Forage 6
  // (scholar field XP 72) on top of the fresh game's own Craft/Talk.
  Game.state.waveLedger = { 3: { points: 12, perType: {}, perTypeX: {} } };
  Game.playerTracks().field.xp = 72;
  pg.arc = 4; pg.tableWaiting = true; pg.tableAnnounced = true; pg.tableDone = false;
  return { pg, s };
}

async function main() {
  const fails = [];
  const { Game } = await loadGame({ seed: 777001, mode: 'tableoffer-proof' });
  await setupGame(Game);
  const sayCap = [];
  const _say = Game.say;
  Game.say = function (...a) { sayCap.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };

  // ================= PART A — the sticky offer =================
  const { pg, s } = buildLesserProfile(Game);
  const seat0 = Game.tableSeat();
  if (!seat0 || seat0.seat !== 'lesser') fails.push(`A construction invalid: seat=${seat0 && seat0.seat} (expected lesser), detail=${JSON.stringify(seat0 && seat0.detail)}`);

  // The slip: integration 45 -> 39 (stage 2 -> 1), as a favor refusal does.
  s.integration = 39;
  const seat1 = Game.tableSeat();
  if (!seat1 || seat1.seat !== 'none') fails.push(`A slip did not regress seat: seat=${seat1 && seat1.seat} (expected none)`);

  // The dawn check (exactly what ledger.js's endDay wrap calls).
  sayCap.length = 0;
  try { Game.tableAnnounce(); } catch (e) { fails.push('A tableAnnounce threw: ' + e.message); }
  const holdText = sayCap.join('\n');
  if (WITHDRAW_BITS.every(b => holdText.includes(b))) fails.push('A WITHDRAWAL fired on an OFFERED seat (the defect):\n' + sayCap.slice(0, 4).join('\n---\n'));
  if (!HOLD_BITS.every(b => holdText.includes(b))) fails.push('A holding line did not speak on the dipped offer; captured:\n' + sayCap.slice(0, 4).join('\n---\n'));
  if (!/integration too shallow \(stage 1\)/.test(holdText)) fails.push('A holding line does not name the slipped bar; captured:\n' + sayCap.slice(0, 4).join('\n---\n'));
  const pgA = Game.progState();
  if (pgA.tableWaiting !== true) fails.push(`A tableWaiting cleared on a dipped offer: ${pgA.tableWaiting} (must stay true)`);
  if (pgA.tableAnnounced !== true) fails.push(`A tableAnnounced cleared on a dipped offer: ${pgA.tableAnnounced} (must stay true)`);
  if (pgA.tableDone !== false) fails.push(`A tableDone flipped on a dipped offer (must stay false): ${pgA.tableDone}`);
  // While dipped the seat cannot be TAKEN (sitting is still gated on the
  // live seat — no gate change): the Haven preview is null.
  let pvDipped = null;
  try { pvDipped = Game.tablePreview(); } catch (e) { fails.push('A tablePreview threw while dipped: ' + e.message); }
  if (pvDipped !== null) fails.push(`A preview returned a takeable offer while dipped: ${JSON.stringify(pvDipped)} (sitting stays gated on the live seat)`);

  // Second dawn on the same dip: the holding line does NOT repeat.
  sayCap.length = 0;
  try { Game.tableAnnounce(); } catch (e) { fails.push('A second tableAnnounce threw: ' + e.message); }
  const hold2 = sayCap.join('\n');
  if (HOLD_BITS.some(b => hold2.includes(b))) fails.push('A holding line REPEATED on the second dipped dawn (once per dip):\n' + sayCap.slice(0, 4).join('\n---\n'));
  if (Game.progState().tableWaiting !== true) fails.push('A tableWaiting cleared on the second dipped dawn');

  // Recovery: integration back to 45 — the offer re-fires.
  s.integration = 45;
  sayCap.length = 0;
  try { Game.tableAnnounce(); } catch (e) { fails.push('A recovery tableAnnounce threw: ' + e.message); }
  const retText = sayCap.join('\n');
  if (!RETURN_BITS.every(b => retText.includes(b))) fails.push('A return line did not speak on recovery; captured:\n' + sayCap.slice(0, 4).join('\n---\n'));
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { fails.push('A tablePreview threw on recovery: ' + e.message); }
  if (!pv || pv.seat !== 'lesser') fails.push(`A preview did not return the re-fired offer: ${JSON.stringify(pv)}`);
  // The re-fired offer can be TAKEN: tableScene sits (audit + paths).
  sayCap.length = 0;
  try { Game.tableScene(); } catch (e) { fails.push('A tableScene threw on the re-fired offer: ' + e.message); }
  const sitText = sayCap.join('\n');
  if (Game.progState().tableDone !== true) fails.push('A re-fired offer did not sit (tableDone stayed false)');
  if (!/THE AUDIT/.test(sitText)) fails.push('A sitting did not run the audit on the re-fired offer; captured:\n' + sayCap.slice(0, 4).join('\n---\n'));
  if (Game.tableState().phase !== 'paths') fails.push(`A sitting did not open the paths (phase=${Game.tableState().phase})`);

  // ================= PART B — pre-offer withdrawal preserved =================
  // Fresh construction, same deed profile, but the offer was NEVER
  // announced: tableAnnounced=false. The dawn check must still withdraw
  // aloud (the "does not come" path for a table never offered).
  const { Game: G2 } = await loadGame({ seed: 777002, mode: 'tableoffer-proof-b' });
  await setupGame(G2);
  const say2 = [];
  const _say2 = G2.say;
  G2.say = function (...a) { say2.push(String(a[0])); try { return _say2.apply(this, a); } catch (e) { return a[0]; } };
  const b = buildLesserProfile(G2);
  b.pg.tableAnnounced = false;                 // never offered
  b.s.integration = 39;                        // seat 'none' at dawn
  const seatB = G2.tableSeat();
  if (!seatB || seatB.seat !== 'none') fails.push(`B construction invalid: seat=${seatB && seatB.seat} (expected none)`);
  say2.length = 0;
  try { G2.tableAnnounce(); } catch (e) { fails.push('B tableAnnounce threw: ' + e.message); }
  const wdText = say2.join('\n');
  if (!WITHDRAW_BITS.every(x => wdText.includes(x))) fails.push('B pre-offer withdrawal did NOT fire aloud; captured:\n' + say2.slice(0, 4).join('\n---\n'));
  const pgB = G2.progState();
  if (pgB.tableWaiting !== false) fails.push(`B tableWaiting not cleared by pre-offer withdrawal: ${pgB.tableWaiting}`);
  if (pgB.tableAnnounced !== false) fails.push(`B tableAnnounced not cleared by pre-offer withdrawal: ${pgB.tableAnnounced}`);
  if (pgB.tableDone !== false) fails.push(`B tableDone flipped (must stay false): ${pgB.tableDone}`);
  // The promise: re-earn -> the invitation is re-extended ALOUD.
  b.s.integration = 45;
  say2.length = 0;
  try { G2.checkArc(); } catch (e) { fails.push('B checkArc threw: ' + e.message); }
  const rfText = say2.join('\n');
  if (!REFIRE_BITS.some(x => rfText.includes(x))) fails.push('B TABLE RE-FIRE did not speak aloud; captured:\n' + say2.slice(0, 4).join('\n---\n'));
  if (G2.progState().tableWaiting !== true) fails.push(`B tableWaiting not restored by re-fire: ${G2.progState().tableWaiting}`);

  // ================= PART C — decline / deny preserved =================
  // A third game: the offer is made, the seat holds, and the player
  // simply does not sit for three dawns. Nothing auto-sits, nothing
  // clears the wait — declining to sit is the player's choice, and the
  // engine never takes it for them.
  const { Game: G3 } = await loadGame({ seed: 777003, mode: 'tableoffer-proof-c' });
  await setupGame(G3);
  const say3 = [];
  const _say3 = G3.say;
  G3.say = function (...a) { say3.push(String(a[0])); try { return _say3.apply(this, a); } catch (e) { return a[0]; } };
  buildLesserProfile(G3);
  for (let dawn = 1; dawn <= 3; dawn++) {
    say3.length = 0;
    try { G3.tableAnnounce(); } catch (e) { fails.push(`C dawn ${dawn} tableAnnounce threw: ` + e.message); }
    const p3 = G3.progState();
    if (p3.tableDone !== false) fails.push(`C the offer auto-sat on dawn ${dawn} (tableDone true without the player sitting)`);
    if (p3.tableAnnounced !== true) fails.push(`C the offer was cleared on dawn ${dawn} without the player acting`);
    if (p3.tableWaiting !== true) fails.push(`C the wait was cleared on dawn ${dawn} without the player acting`);
    let pv3 = null;
    try { pv3 = G3.tablePreview(); } catch (e) { fails.push(`C dawn ${dawn} tablePreview threw: ` + e.message); }
    if (!pv3 || pv3.seat !== 'lesser') fails.push(`C dawn ${dawn} preview did not keep offering the seat: ${JSON.stringify(pv3)}`);
  }

  // ================= PART D — withdrawal voicing still names the bars =================
  const wl = Game.tableWithdrawLine.bind(Game);
  const slipSeat = { seat: 'none', detail: { w1: 4, w2: 4, w3: 3, w4: 0, w5: 0, contestsN: 2, crisesN: 2, rank: 'regional', stage: 1, foodDeeds: true } };
  const slipLine = wl(slipSeat);
  if (!/integration too shallow \(stage 1\)/.test(slipLine)) fails.push('D withdrawLine misses the integration slip: ' + slipLine.slice(0, 140));
  if (/THE DEEDS ARE NOT ALL DONE/i.test(slipLine)) fails.push('D withdrawLine blames the deeds on an integration slip: ' + slipLine.slice(0, 140));
  const multiSeat = { seat: 'none', detail: { w1: 2, w2: 4, w3: 3, contestsN: 1, crisesN: 2, rank: 'village', stage: 1, foodDeeds: false } };
  const multiLine = wl(multiSeat);
  for (const bit of ['wave-blood unpaid (2/4, 4/4, 3/3)', 'fewer than two contests survived (1)', 'standing too low (village)', 'integration too shallow (stage 1)', 'the food-thesis unproven'])
    if (!multiLine.includes(bit)) fails.push('D withdrawLine drops a missing bar: ' + bit);
  // tableMissingBars is the single source of truth for the naming.
  if (typeof Game.tableMissingBars !== 'function') {
    fails.push('D tableMissingBars is not a function (the naming helper is missing)');
  } else {
    const named = Game.tableMissingBars(multiSeat);
    if (!multiLine.includes(named)) fails.push('D tableMissingBars diverges from tableWithdrawLine naming: ' + JSON.stringify(named));
    for (const bit of ['wave-blood unpaid (2/4, 4/4, 3/3)', 'fewer than two contests survived (1)', 'standing too low (village)', 'integration too shallow (stage 1)', 'the food-thesis unproven'])
      if (!named.includes(bit)) fails.push('D tableMissingBars drops a missing bar: ' + bit);
  }

  if (fails.length) {
    console.log('FAILURES:');
    for (const f of fails) console.log('  ' + f);
    process.exit(1);
  }
  console.log('GREEN: offered seat survives a bar dip (holds once, re-fires on recovery, sits); pre-offer withdrawal + re-fire preserved; decline-by-waiting preserved; withdrawal voicing still names the real bars.');
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
