#!/usr/bin/env node
// scripts/test-takeseat-b-20261107.js — proof for the sit drive
// (arm sim-takeseat-b, run fleshout-loop-b-20261107T1330Z).
//
// Sections:
//   (A) RED: gate OFF never drives the verb — pure delegation, zero
//       Game reads when off (a stub whose engine methods throw if
//       touched proves it).
//   (B) GREEN: gate-ON fixtures on stub Games — ready drives the real
//       verb exactly once; every other state is a classified skip and
//       never calls the verb; the double-call guard holds; a failed
//       verb is counted, not thrown.
//   (C) COMPOSITION: against a real loaded game, the composite daily
//       runs staged.daily exactly once + linkDrive once, and upkeep
//       runs staged.upkeep exactly once (+ sit drive).
//   (D) LIVE: the judged driver, run twice on seed 53001 —
//       RE-PINNED (sim-takeseat-repin-b, 2026-11-09, master
//       5e79679e4): 53001 was a no-seat seed in sitstep2, so the
//       drive could never fire; the sit-drive rebaseline
//       (ff8b9869f/b5d1eb923/38389defb/f37924c96) moved it, and the
//       ARMED leg now takes the lesser seat on day 98 while the
//       baseline still takes none. The section now proves
//       discrimination (0 vs 1 sits) plus pre-sit neutrality: the
//       95 daily rows before the sit day are identical between
//       the legs, and the day-98 rows differ in exactly the four
//       sit fields. A still-quiet surviving seed was hunted and
//       NOT found (armed legs on 53002-53008 and 53101-53108:
//       every surviving village sits; the only no-seat legs die
//       at 45-89d), so the old whole-run head equality is replaced
//       by the two pinned heads. This is also the 1-seed smoke
//       leg (structural invariants).
//   (E) ANALYZER: pure-function fixtures (preSitMatch, starvation,
//       medianOf, classifySeatDay).
//
// Usage: node scripts/test-takeseat-b-20261107.js
//   (D) runs two 150d sims in /tmp; allow ~2-4 min.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const LF = require('./policies/competent-linkfeast-b');
const { layerOn, takeSeatDrive, resetTakeseatStats, takeseatStats } = LF;
const ANALYZE = require('./takeseat-b-analyze-20261107');
const { classifySeatDay } = ANALYZE;

let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL: ' + name); process.exitCode = 1; return; }
  pass++;
  console.log('ok: ' + name);
}

function withEnv(v, fn) {
  const prev = process.env.TAKESEAT_B;
  if (v == null) delete process.env.TAKESEAT_B; else process.env.TAKESEAT_B = v;
  try { return fn(); } finally {
    if (prev == null) delete process.env.TAKESEAT_B; else process.env.TAKESEAT_B = prev;
  }
}

// stubGame: a minimal engine surface. tablePreview/tableTakeSeat are
// the REAL call sequence the drive uses; everything else is state the
// engine owns (over, tbfight, progState table flags, haven).
function stubGame(overrides) {
  const calls = { taken: 0, previews: 0 };
  const g = {
    over: false, tbfight: null, dayPart: 2,
    state: { scholar: { day: 100, tableChoices: { options: [{ id: 'path:beloved' }, { id: 'path:defiant' }] } } },
    _pg: { tableDone: false, tableWaiting: true, tableAnnounced: true },
    _ready: true, _previewNull: false,
    progState() { return this._pg; },
    playerAtHaven() { return true; },
    tablePreview() {
      calls.previews++;
      if (this._previewNull) return null;
      if (!this._pg.tableWaiting || this._pg.tableDone) return null;
      return { seat: 'lesser', ready: this._ready, doors: ['the Beloved'], why: this._ready ? '' : 'Finish the current encounter before taking your seat.' };
    },
    tableTakeSeat() {
      calls.taken++;
      const pv = this.tablePreview();
      if (!pv || !pv.ready) return { ok: false, msg: pv ? pv.why : '' };
      this._pg.tableDone = true;
      return { ok: true };
    },
    _calls: calls,
  };
  return Object.assign(g, overrides || {});
}

// --- (A) RED: gate OFF never drives the verb, never reads the engine.
withEnv(null, () => {
  assert.strictEqual(layerOn(), false);
  resetTakeseatStats();
  // A Game whose engine methods THROW if touched: gate-off must not
  // touch them at all (pure delegation — zero reads, not just zero sits).
  const bomb = {
    get over() { throw new Error('read over'); },
    get tbfight() { throw new Error('read tbfight'); },
    progState() { throw new Error('progState touched'); },
    tablePreview() { throw new Error('preview touched'); },
    tableTakeSeat() { throw new Error('verb touched'); },
  };
  takeSeatDrive(bomb, {});
  const st = takeseatStats();
  assert.strictEqual(st.seatAttempts, 0);
  assert.strictEqual(st.seatTaken, 0);
  assert.strictEqual(Object.keys(st.skips).length, 0);
  ok('RED: gate OFF never drives the verb and never reads the engine', true);
});

// --- (B) GREEN: gate-ON fixtures.
withEnv('1', () => {
  assert.strictEqual(layerOn(), true);
  // B1: ready -> verb called once, ok recorded, doors offered read.
  resetTakeseatStats();
  let g = stubGame(); let ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 1);
  let st = takeseatStats();
  assert.strictEqual(st.seatTaken, 1);
  assert.strictEqual(st.seatDay, 100);
  assert.strictEqual(st.seatKind, 'lesser');
  assert.strictEqual(st.doorsOffered, 2);
  assert.strictEqual(ctx.tsSeatTaken, 1);
  ok('GREEN: ready preview drives the real verb once, records day/kind/doors', true);
  // B2: second call after a sit -> verb never called again.
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 1);
  st = takeseatStats();
  assert.strictEqual(st.seatTaken, 1);
  assert.strictEqual((st.skips['already-done'] | 0) + (st.skips['already-taken'] | 0) >= 1, true);
  ok('GREEN: double-call guard — verb never invoked twice', true);
  // B3: fight live -> skip 'fight', verb never called.
  resetTakeseatStats();
  g = stubGame({ tbfight: { over: false } }); ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(takeseatStats().skips.fight, 1);
  ok('GREEN: live fight -> classified skip, verb never called', true);
  // B4: not announced -> skip, verb never called.
  resetTakeseatStats();
  g = stubGame(); g._pg.tableAnnounced = false; ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(takeseatStats().skips['not-announced'], 1);
  ok('GREEN: unannounced invitation -> classified skip', true);
  // B5: preview null (pre-day-90 / not staged) -> skip, verb never called.
  resetTakeseatStats();
  g = stubGame({ _previewNull: true }); ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(takeseatStats().skips['preview-null'], 1);
  ok('GREEN: null preview -> classified skip', true);
  // B6: not ready (encounter block) -> skip carrying the engine why.
  resetTakeseatStats();
  g = stubGame({ _ready: false }); ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(g._calls.previews, 1);
  const sk = takeseatStats().skips;
  assert.strictEqual(Object.keys(sk).some(function (k) { return k.indexOf('not-ready:Finish the current encounter') === 0; }), true);
  ok('GREEN: not-ready preview -> classified skip with the engine why', true);
  // B7: scholar away -> skip 'away'.
  resetTakeseatStats();
  g = stubGame({ playerAtHaven: function () { return false; } }); ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(takeseatStats().skips.away, 1);
  ok('GREEN: scholar away from Haven -> classified skip', true);
  // B8: game over -> skip 'over'.
  resetTakeseatStats();
  g = stubGame({ over: true }); ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(takeseatStats().skips.over, 1);
  ok('GREEN: game over -> classified skip', true);
  // B9: failed verb (ok:false) -> counted as failed, never throws.
  resetTakeseatStats();
  g = stubGame({ tableTakeSeat: function () { this._calls.taken++; return { ok: false, msg: 'Your seat could not be taken.' }; } }); ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 1);
  st = takeseatStats();
  assert.strictEqual(st.seatFailed, 1);
  assert.strictEqual(st.seatTaken, 0);
  ok('GREEN: refused verb -> counted as failed, never throws', true);
  // B10: throwing preview -> error counted, never throws into the engine.
  resetTakeseatStats();
  g = stubGame({ tablePreview: function () { throw new Error('boom'); } }); ctx = {};
  takeSeatDrive(g, ctx);
  assert.strictEqual(g._calls.taken, 0);
  assert.strictEqual(takeseatStats().errors >= 1, true);
  ok('GREEN: throwing preview -> error counted, never throws', true);
});

// --- (E) ANALYZER pure functions (before the live legs — fast).
(function () {
  const row = function (day, over) {
    return Object.assign({ day: day, rawStanding: 100 + day, rosterSize: 12, living: 12,
      w4kills: 0, seat: 'none', feastSurgeUsed: false, sentimentTaught: true,
      pairDay: false, scholarAtHaven: true, preview: null }, over || {});
  };
  const base = { daily: [row(90), row(91), row(92)] };
  const armed = { daily: [row(90), row(91), row(92)] };
  const m1 = ANALYZE.preSitMatch(base, armed, 95);
  assert.strictEqual(m1.match, true);
  assert.strictEqual(m1.daysCompared, 3);
  ok('ANALYZER: preSitMatch identical rows -> match', true);
  const armed2 = { daily: [row(90), row(91, { rawStanding: 999 }), row(92)] };
  const m2 = ANALYZE.preSitMatch(base, armed2, 95);
  assert.strictEqual(m2.match, false);
  assert.strictEqual(/day 91 field rawStanding/.test(m2.firstDiff), true);
  ok('ANALYZER: preSitMatch differing standing -> mismatch named', true);
  const armed3 = { daily: [row(90), row(91, { preview: { ready: true, why: '' } }), row(92)] };
  const m3 = ANALYZE.preSitMatch(base, armed3, 95);
  assert.strictEqual(m3.match, false);
  assert.strictEqual(/day 91 preview/.test(m3.firstDiff), true);
  ok('ANALYZER: preSitMatch differing preview -> mismatch named', true);
  assert.strictEqual(ANALYZE.starvation({ teleDeaths: [{ cause: 'starvation' }, { cause: 'monster' }, { kind: 'starved' }] }), 2);
  assert.strictEqual(ANALYZE.starvation({ teleDeaths: [] }), 0);
  ok('ANALYZER: starvation counts cause/kind naming starvation', true);
  assert.strictEqual(ANALYZE.medianOf([150, 79, 86, 89, 95, 118, 139, 150]), 106.5);
  ok('ANALYZER: medianOf matches the sitstep2 band median', true);
  const satRow = { day: 100, tableDone: true, seat: 'lesser' };
  assert.strictEqual(classifySeatDay(satRow, []).gate, 'sat');
  const readyRow = { day: 100, tableDone: false, seat: 'lesser', preview: { ready: true, why: '' } };
  assert.strictEqual(classifySeatDay(readyRow, []).gate, 'offer-not-taken');
  assert.strictEqual(classifySeatDay(readyRow, [{ call: 'tableTakeSeat', ok: true }]).gate, 'sit-called');
  assert.strictEqual(classifySeatDay(readyRow, [{ call: 'tableTakeSeat', ok: false, msg: 'blocked' }]).gate, 'sit-refused');
  ok('ANALYZER: classifySeatDay gates (sat / offer-not-taken / sit-called / sit-refused)', true);
})();

// --- (C) COMPOSITION against a real loaded game.
(async function () {
  const { loadGame, setupGame } = require('./sim-harness');
  const STAGED = require('./policies/competent-stageally-a');
  const LINK = require('./policies/competent-linkdrive-b');
  const { Game } = await loadGame({ seed: 53001, mode: 'competent-takeseat-b-proof', fullTelemetry: false });
  await setupGame(Game);
  let stagedDaily = 0, stagedUpkeep = 0, linkCalls = 0;
  const origDaily = STAGED.stagedPolicy.daily;
  const origUpkeep = STAGED.stagedPolicy.upkeep;
  const origLink = LINK.linkDrive;
  STAGED.stagedPolicy.daily = function () { stagedDaily++; return origDaily.apply(this, arguments); };
  STAGED.stagedPolicy.upkeep = function () { stagedUpkeep++; return origUpkeep.apply(this, arguments); };
  LINK.linkDrive = function () { linkCalls++; return origLink.apply(this, arguments); };
  try {
    const ctx = {};
    LF.linkfeast.daily(Game, ctx);
    assert.strictEqual(stagedDaily, 1);
    assert.strictEqual(linkCalls, 1);
    ok('COMPOSITION: composite daily runs staged.daily exactly once + linkDrive once', true);
    LF.linkfeast.upkeep(Game, ctx);
    assert.strictEqual(stagedUpkeep, 1);
    ok('COMPOSITION: composite upkeep runs staged.upkeep exactly once (+ sit drive)', true);
  } finally {
    STAGED.stagedPolicy.daily = origDaily;
    STAGED.stagedPolicy.upkeep = origUpkeep;
    LINK.linkDrive = origLink;
  }

  // --- (D) LIVE: judged driver twice on seed 53001.
  // RE-PIN (sim-takeseat-repin-b, 2026-11-09, master 5e79679e4):
  // 53001 was a no-seat seed when this section was written, but the
  // sit-drive rebaseline (ff8b9869f/b5d1eb923/38389defb/f37924c96)
  // moved it: the ARMED leg now takes the lesser seat on day 98
  // (seatTaken 1, standing 209) while the baseline still takes none.
  // That IS the discrimination proof now. The trajectory-neutrality
  // claim survives in pre-sit form: the 95 daily rows before the sit
  // day are identical between the legs (ANALYZE.preSitMatch), and
  // the day-98 rows differ in exactly the four sit fields — the
  // preview reads move nothing until the day the drive fires. A
  // still-quiet surviving seed was hunted and NOT found: armed legs
  // on 53002-53008 and 53101-53108 all sit when the village survives
  // (12/12 survivors sit; the 3 no-seat legs all die at 45-89d), so
  // there is no surviving no-seat seed in either band to pin the old
  // whole-run head equality to. See
  // evidence/2026-11-09/sim-takeseat-repin-b.md.
  const tmpBase = '/tmp/takeseat-b-proof-baseline';
  const tmpArmed = '/tmp/takeseat-b-proof-armed';
  [tmpBase, tmpArmed].forEach(function (d) {
    try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {}
    fs.mkdirSync(d, { recursive: true });
  });
  const run = function (policy, outdir) {
    const env = Object.assign({}, process.env, { SEEDS: '53001', DAYS: '150', RUN: 'takeseat-proof-' + policy, POLICY: policy, OUTDIR: outdir });
    execSync('node scripts/takeseat-b-driver-20261107.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
  };
  run('baseline', tmpBase);
  run('armed', tmpArmed);
  const b = JSON.parse(fs.readFileSync(path.join(tmpBase, 'takeseat-b-s53001-takeseat-proof-baseline.json'), 'utf8'));
  const a = JSON.parse(fs.readFileSync(path.join(tmpArmed, 'takeseat-b-s53001-takeseat-proof-armed.json'), 'utf8'));
  assert.strictEqual(b.instrumentErrors.length, 0);
  assert.strictEqual(a.instrumentErrors.length, 0);
  ok('LIVE: both proof legs run with 0 instrument errors', true);
  // Discrimination: baseline never sits, armed sits once (lesser, day 98).
  assert.strictEqual((b.takeseatStats || {}).seatTaken, 0);
  assert.strictEqual((a.takeseatStats || {}).seatTaken, 1);
  assert.strictEqual((a.takeseatStats || {}).seatAttempts, 1);
  assert.strictEqual((a.takeseatStats || {}).seatDay, 98);
  assert.strictEqual((a.takeseatStats || {}).seatKind, 'lesser');
  assert.strictEqual((a.takeseatStats || {}).doorsOffered, 5);
  ok('LIVE: seed 53001 — baseline takes 0 seats, armed takes the lesser seat on day 98 (drive discriminates)', true);
  const head = function (o) {
    return { days: o.days, gameDays: o.gameDays, endReason: o.endReason, standing: o.standing,
      maxWave: o.maxWave, finalSeat: (o.finalSeat || {}).seat || null,
      w4kills: (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length };
  };
  // Whole-run heads differ ONLY where the sit itself changes them.
  assert.deepStrictEqual(head(b), { days: 150, gameDays: 152, endReason: 'survived', standing: 250, maxWave: 5, finalSeat: 'none', w4kills: 3 });
  assert.deepStrictEqual(head(a), { days: 150, gameDays: 152, endReason: 'survived', standing: 209, maxWave: 5, finalSeat: 'lesser', w4kills: 2 });
  ok('LIVE: both legs pinned to their fresh current-master heads (150d, survived, maxWave 5; armed differs only by the sit)', true);
  // Pre-sit neutrality: every daily row before the sit day matches.
  const pre = ANALYZE.preSitMatch(b, a, (a.takeseatStats || {}).seatDay);
  assert.strictEqual(pre.match, true);
  assert.strictEqual(pre.daysCompared, 95);
  ok('LIVE: pre-sit daily rows identical for all 95 days before the sit (preview reads are trajectory-neutral until the drive fires)', true);
  // The day-98 rows differ in exactly the four sit fields.
  const rb98 = (b.daily || []).filter(function (r) { return r.day === 98; })[0];
  const ra98 = (a.daily || []).filter(function (r) { return r.day === 98; })[0];
  const all98 = {};
  Object.keys(rb98).concat(Object.keys(ra98)).forEach(function (k) { all98[k] = true; });
  const diff98 = Object.keys(all98).filter(function (k) { return JSON.stringify(rb98[k]) !== JSON.stringify(ra98[k]); }).sort();
  assert.deepStrictEqual(diff98, ['gate', 'preview', 'tableChoicesSurfaced', 'tableDone']);
  ok('LIVE: divergence starts exactly on the sit day, in exactly the four sit fields', true);
  assert.strictEqual(b.finalSeat ? b.finalSeat.seat : null, 'none');
  ok('LIVE: seed 53001 baseline earns no seat (smoke structural check)', true);

  console.log(pass + ' checks passed');
  process.exit(process.exitCode || 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
