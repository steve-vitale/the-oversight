#!/usr/bin/env node
// scripts/test-fullseat-shortfall-20261102.js — proof test for gap round
// 2026-11-02, item 2: FULL-SEAT SHORTFALL NAMING (src/js/table.js).
//
// The gap (Nov 2 scale-onramp round, seed 97339): a run sat on a LESSER
// seat with every full-seat bar met except wave-4/5 deeds (0 of 3, 0 of
// 2) and heard NOTHING about the full seat — the Haven offer named the
// lesser seat, the audit named the lesser counts, and no surface named
// what a full seat still wants. This arm names the shortfall in plain
// words; it does NOT retune any gate, price, or requirement.
//
// Construction (honest state, no stubs): a fresh game is given deed
// profiles through the real deedState()/progState() maps — distinct
// wave-N fights, contests survived, crises, standing flags, integration
// value, and the keepsake-lesson flag — exactly the inputs
// deedGateReady() reads. No gate function is stubbed or replaced.
// LEG 2 (2026-11-08): applyProfile ALSO rigs National ladder standing
// (40 counted points) and a delivered trade-charter capstone, so the
// ladder bars never pollute a case that isolates a named bar; the surge
// flag is still carried in the profile but is NO LONGER a seat bar —
// foodDeeds is sentimentTaught alone (brief §b.4).
//
// GREEN means, on IDENTICAL constructed states:
//   BEFORE (the unchanged old surfaces): tableSeatLine() for a lesser
//     seat never mentions a full seat at all — and for the Nov 2 state
//     it mentions neither wave-4 nor wave-5 — the reported silence,
//     reproduced, not assumed.
//   AFTER (the new surfaces): fullSeatShortfall() names EXACTLY the
//     missing piece(s) — no more, no fewer — for every single-bar
//     shortfall in turn (each wave 1-5, contests, crises, standing,
//     integration, the keepsake lesson; the unspent surge is NOT a
//     bar and is never named), and names nothing when every bar is met.
//   OFFER: tablePreview() on a lesser seat carries the same line in
//     fullShortfall (and fullReady false); on a full seat it carries
//     '' (and fullReady true).
//   AUDIT: tableScene() on the Nov 2 lesser state says the shortfall
//     line aloud right after the seat line; on a full seat it says no
//     shortfall line at all.
//   GATES UNCHANGED: deedGateReady().ok and tableSeat().seat match the
//     old bars in every case (short at need-1, earned at need).
//
// Usage: node scripts/test-fullseat-shortfall-20261102.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const NEED = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2 };

function wavesFor(counts) {
  const out = {};
  counts.forEach((n, wi) => {
    for (let i = 0; i < n; i++) out[`w${wi + 1}_${i}`] = wi + 1;
  });
  return out;
}

function applyProfile(Game, p) {
  const deeds = Game.deedState();
  deeds.wavesFaced = wavesFor(p.w);
  deeds.contestsSurvived = p.contests;
  const pg = Game.progState();
  pg.crises = {};
  for (let i = 0; i < p.crises; i++) pg.crises[`crisis_${i}`] = 1;
  Game.state.globalLive = false; Game.state.nationalLive = false; Game.state.networkLive = false;
  if (p.rank === 'global') Game.state.globalLive = true;
  else if (p.rank === 'national') Game.state.nationalLive = true;
  else if (p.rank === 'regional') Game.state.networkLive = true;
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.day = 95;
  s.integration = p.stage === 1 ? 5 : 45;
  s.prog = s.prog || {};
  pg.sentimentTaught = !!p.sentiment;
  s.prog.feastSurgeUsed = !!p.surge;
  // LEG 2 (2026-11-08): National ladder standing + a delivered capstone,
  // so the ladder bars never pollute a case isolating a named bar.
  // Fight 24 (wave-3 ledger 48) + Forage 16 (scholar field XP 192) = 40.
  Game.state.waveLedger = { 3: { points: 48, perType: {}, perTypeX: {} } };
  Game.playerTracks().field.xp = 192;
  pg.ladderCapstone = 'trade_charter';
  pg.tableWaiting = true;
  pg.tableDone = false;
}

function fullProfile() {
  return { w: [5, 5, 4, 3, 2], contests: 3, crises: 3, rank: 'national', stage: 2, sentiment: true, surge: true };
}

function eqArr(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
}

async function main() {
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); };
  const { Game } = await loadGame({ seed: 97339, mode: 'fullseat-shortfall-proof' });
  await setupGame(Game);
  const sayCap = [];
  const _say = Game.say;
  Game.say = function (...a) { sayCap.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };

  const cases = [
    // name, profile overrides, expected missing (exact), expected seat
    ['nov2-regression: w4 0/3, w5 0/2, everything else met',
      { w: [14, 9, 6, 0, 0] },
      ['only 0 of 3 different wave-4 monsters faced', 'only 0 of 2 different wave-5 monsters faced'], 'lesser'],
    ['wave-1 short: 4 of 5', { w: [4, 5, 4, 3, 2] },
      ['only 4 of 5 different wave-1 monsters faced'], 'lesser'],
    ['wave-2 short: 4 of 5', { w: [5, 4, 4, 3, 2] },
      ['only 4 of 5 different wave-2 monsters faced'], 'lesser'],
    ['wave-3 short: 3 of 4', { w: [5, 5, 3, 3, 2] },
      ['only 3 of 4 different wave-3 monsters faced'], 'lesser'],
    ['wave-4 short: 2 of 3', { w: [5, 5, 4, 2, 2] },
      ['only 2 of 3 different wave-4 monsters faced'], 'lesser'],
    ['wave-5 short: 1 of 2', { w: [5, 5, 4, 3, 1] },
      ['only 1 of 2 different wave-5 monsters faced'], 'lesser'],
    ['contests short: 2 of 3', { contests: 2 },
      ['only 2 of 3 contests survived'], 'lesser'],
    ['crises short: 2 of 3', { crises: 2 },
      ['only 2 of 3 crises weathered'], 'lesser'],
    ['standing short: regional, full seat wants national+',
      { rank: 'regional' },
      ['standing is regional — the full seat asks for national standing or higher'], 'lesser'],
    ['integration short: stage 1 of 2', { stage: 1 },
      ['integration too shallow (stage 1 of 2 needed)'], 'none'],
    ['food half short: keepsake lesson not taught', { sentiment: false },
      ['the keepsake lesson has not yet been taught'], 'none'],
    // LEG 2 (2026-11-08): the surge is NOT a bar. Sentiment taught +
    // surge unspent still earns the full seat; nothing is named.
    ['food: surge unspent is NOT a bar (lesson taught alone earns the seat)', { surge: false },
      [], 'full'],
    ['food both short: only the lesson is named', { sentiment: false, surge: false },
      ['the keepsake lesson has not yet been taught'], 'none'],
    ['all bars met: full seat', {},
      [], 'full'],
  ];

  for (const [name, over, expectMissing, expectSeat] of cases) {
    const prof = Object.assign(fullProfile(), over);
    applyProfile(Game, prof);
    const gate = Game.deedGateReady();
    const seat = Game.tableSeat();
    ok(gate.ok === (expectMissing.length === 0), `${name}: deedGateReady().ok=${gate.ok}, expected ${expectMissing.length === 0}`);
    ok(seat.seat === expectSeat, `${name}: tableSeat().seat=${seat.seat}, expected ${expectSeat}`);
    // AFTER: the new function names exactly the missing pieces.
    const fs = Game.fullSeatShortfall(seat);
    ok(eqArr(fs.missing, expectMissing), `${name}: missing=${JSON.stringify(fs.missing)}, expected ${JSON.stringify(expectMissing)}`);
    ok(fs.ready === (expectMissing.length === 0), `${name}: ready=${fs.ready}, expected ${expectMissing.length === 0}`);
    const expectLine = expectMissing.length ? `For a full seat, the ledger still wants: ${expectMissing.join('; ')}.` : '';
    ok(fs.line === expectLine, `${name}: line=${JSON.stringify(fs.line)}, expected ${JSON.stringify(expectLine)}`);
    // AFTER, no-arg path (live deedGateReady) agrees with the seat-arg path.
    const fsLive = Game.fullSeatShortfall();
    ok(eqArr(fsLive.missing, expectMissing), `${name}: live missing=${JSON.stringify(fsLive.missing)}, expected ${JSON.stringify(expectMissing)}`);
    // BEFORE: the unchanged old surface names nothing about a full seat.
    if (expectSeat === 'lesser') {
      const line = Game.tableSeatLine(seat);
      ok(!/full seat/i.test(line), `${name}: BEFORE gap not reproduced — old seat line mentions a full seat: ${line}`);
      // OFFER: the preview carries the same shortfall line.
      const pv = Game.tablePreview();
      ok(!!pv, `${name}: tablePreview() is null on a lesser seat (offer surface unreachable in harness)`);
      if (pv) {
        ok(pv.seat === 'lesser', `${name}: preview seat=${pv.seat}, expected lesser`);
        ok(pv.fullReady === false, `${name}: preview fullReady=${pv.fullReady}, expected false`);
        ok(pv.fullShortfall === expectLine, `${name}: preview fullShortfall=${JSON.stringify(pv.fullShortfall)}, expected ${JSON.stringify(expectLine)}`);
      }
    }
    if (expectSeat === 'full') {
      const pv = Game.tablePreview();
      ok(!!pv, `${name}: tablePreview() is null on a full seat`);
      if (pv) {
        ok(pv.fullReady === true, `${name}: preview fullReady=${pv.fullReady}, expected true`);
        ok(pv.fullShortfall === '', `${name}: preview fullShortfall=${JSON.stringify(pv.fullShortfall)}, expected ''`);
      }
    }
  }

  // AUDIT: Nov 2 lesser state — tableScene says the shortfall aloud.
  {
    applyProfile(Game, Object.assign(fullProfile(), { w: [14, 9, 6, 0, 0] }));
    const before = sayCap.length;
    let err = null;
    try { Game.tableScene(); } catch (e) { err = e; }
    ok(!err, 'AUDIT nov2: tableScene threw: ' + (err && err.stack || err));
    const fresh = sayCap.slice(before);
    const short = fresh.find(l => /For a full seat, the ledger still wants:/.test(l));
    ok(!!short, 'AUDIT nov2: no shortfall line spoken; says=' + JSON.stringify(fresh.slice(0, 6)));
    if (short) {
      ok(/wave-4 monsters faced/.test(short) && /wave-5 monsters faced/.test(short),
        'AUDIT nov2: shortfall line misses a wave: ' + short);
      ok(/only 0 of 3/.test(short) && /only 0 of 2/.test(short),
        'AUDIT nov2: shortfall line misses a count: ' + short);
    }
    ok(!!fresh.find(l => /THE AUDIT/.test(l)), 'AUDIT nov2: no audit line spoken');
  }

  // AUDIT: full seat — tableScene says no shortfall line at all.
  {
    applyProfile(Game, fullProfile());
    // tableScene returns early once tableDone; the previous scene set it —
    // applyProfile cleared it, and the phase moves on, so re-sitting is fine.
    try { Game.tableState().phase = null; } catch (e) {}
    const before = sayCap.length;
    let err = null;
    try { Game.tableScene(); } catch (e) { err = e; }
    ok(!err, 'AUDIT full: tableScene threw: ' + (err && err.stack || err));
    const fresh = sayCap.slice(before);
    ok(!fresh.find(l => /For a full seat, the ledger still wants:/.test(l)),
      'AUDIT full: shortfall line spoken on a full seat: ' + JSON.stringify(fresh.filter(l => /full seat/i.test(l))));
    ok(!!fresh.find(l => /A full seat\./.test(l)), 'AUDIT full: no full-seat line spoken');
  }

  if (fails.length) { console.log('FAIL'); fails.forEach(f => console.log(' - ' + f)); process.exit(1); }
  console.log('ALL GREEN: full-seat shortfall naming (before/after + offer + audit + gates unchanged)');
}

main().catch(e => { console.error('TEST ERROR:', e && e.stack || e); process.exit(2); });
