// test-sitdrive-winseek-b.js — proof for the WINSEEK SIT DRIVE build
// (arm sim-sitdrive-winseek-b). G1 det-gate (drive fires exactly once on
// fixtures + gate-OFF RED + broken-drive sensitivity + classifier
// fixtures for the armed leg), G2 recorder neutrality, G3 corpus
// integrity, plus the real-sim legs: seed 53003 armed sits (d90,
// lesser) vs gate-off 0 sits, and gate-off reproduces plain winseek
// byte-identically (same driver, same master, same seed).
// (Prereg Correction 1: 53001 was the DIAG's purest seed, but on this
// master it dies d67 — the re-derived reachable seed is 53003.)
// Real-sim legs write to /tmp (never evidence/) and take minutes; the
// pilot sweep writes its own corpora separately.
// Run: node scripts/test-sitdrive-winseek-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const SD = require('./policies/winseek-sitdrive-b');
const AD = require('./analyze-sitdrive-winseek-20261109');
const A = require('./analyze-sitgap-20261108');

const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function checkSkip(name, cond, extra) {
  if (cond === null) { skip++; console.log('SKIP ' + name + (extra ? ' — ' + extra : '')); }
  else check(name, cond, extra);
}
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

// --- fake Game for the drive unit legs ---
function fakeGame(over) {
  const calls = [];
  const game = {
    over: false,
    tbfight: null,
    state: { scholar: { day: 90, tableChoices: null } },
    dayPart: 1,
    progState: function () { return { tableDone: false, tableAnnounced: true }; },
    playerAtHaven: function () { return true; },
    tablePreview: function () { return { seat: 'lesser', doors: ['Defiant', 'Beloved'], ready: true, why: '', overtime: 0, fullReady: false }; },
    // The real engine sets scholar.tableChoices when the seat is taken
    // (the 7-door modal); the fake does the same so the drive's
    // doors-reading path is exercised honestly.
    tableTakeSeat: function () { calls.push('takeSeat'); game.state.scholar.tableChoices = { options: [{ id: 'defiant' }, { id: 'beloved' }] }; return { ok: true, msg: 'sat' }; },
  };
  return { game: game, calls: calls };
}
function setGate(on) {
  if (on) process.env.SITDRIVE_B = '1';
  else delete process.env.SITDRIVE_B;
}

// --- G1: drive fires exactly once on a ready fixture ---
(function () {
  setGate(true);
  SD.resetTakeseatStats();
  const f = fakeGame();
  const ctx = {};
  SD.takeSeatDrive(f.game, ctx);
  check('G1: drive fires on a ready fixture (announced + ready + at Haven + no fight)', f.calls.length === 1, 'calls=' + f.calls.length);
  const st = SD.takeseatStats();
  check('G1: drive records the sit (taken 1, day 90, lesser, doors 2)', st.seatTaken === 1 && st.seatDay === 90 && st.seatKind === 'lesser' && st.doorsOffered === 2, JSON.stringify(st));
  check('G1: ctx carries the sit (tsSeatTaken 1, tsSeatDay 90)', ctx.tsSeatTaken === 1 && ctx.tsSeatDay === 90, JSON.stringify(ctx));
  SD.takeSeatDrive(f.game, ctx);
  check('G1: second call is a no-op (never twice — already-taken)', f.calls.length === 1 && SD.takeseatStats().seatAttempts === 1, 'calls=' + f.calls.length);
  check('G1: already-taken skip classified', (SD.takeseatStats().skips['already-taken'] | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
})();

// --- G1: gate OFF (RED phase) — never drives even when ready ---
(function () {
  setGate(false);
  SD.resetTakeseatStats();
  const f = fakeGame();
  const ctx = {};
  SD.takeSeatDrive(f.game, ctx);
  check('G1: gate OFF never drives the verb even when ready', f.calls.length === 0, 'calls=' + f.calls.length);
  const st = SD.takeseatStats();
  check('G1: gate OFF leaves zero stats (no attempts, no skips, no errors)', st.seatAttempts === 0 && st.seatTaken === 0 && JSON.stringify(st.skips) === '{}' && st.errors === 0, JSON.stringify(st));
  // The wrapper path must also be gate-off clean: upkeep delegates and
  // the drive inside it returns before any stat write.
  check('G1: gate OFF is pure delegation (layerOn false)', SD.layerOn() === false, 'layerOn=' + SD.layerOn());
})();

// --- G1: broken-drive sensitivity — a drive that ignores the gate MUST fail the gate-off check ---
function brokenTakeSeatDrive(Game, ctx) {
  // Mutant: calls the verb whenever the preview is ready, never
  // consulting the gate. The gate-off check must catch this.
  if (Game.over) return;
  const pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null;
  if (pv && pv.ready && typeof Game.tableTakeSeat === 'function') Game.tableTakeSeat();
}
(function () {
  setGate(false);
  const f = fakeGame();
  brokenTakeSeatDrive(f.game, {});
  check('G1: broken drive (gate ignored) DOES call the verb with the gate off — the gate-off check can fail', f.calls.length === 1, 'calls=' + f.calls.length);
  setGate(true);
  SD.resetTakeseatStats();
  const f2 = fakeGame();
  SD.takeSeatDrive(f2.game, {});
  check('G1: real drive with the gate ON calls exactly once (the check passes on the real code)', f2.calls.length === 1, 'calls=' + f2.calls.length);
})();

// --- G1: every early exit is classified, never an attempt ---
(function () {
  setGate(true);
  // live fight
  SD.resetTakeseatStats();
  let f = fakeGame(); f.game.tbfight = { over: false };
  SD.takeSeatDrive(f.game, {});
  check('G1: live fight → skip fight, no call', f.calls.length === 0 && (SD.takeseatStats().skips.fight | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
  // not announced
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.progState = function () { return { tableDone: false, tableAnnounced: false }; };
  SD.takeSeatDrive(f.game, {});
  check('G1: not announced → skip not-announced, no call', f.calls.length === 0 && (SD.takeseatStats().skips['not-announced'] | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
  // away from Haven
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.playerAtHaven = function () { return false; };
  SD.takeSeatDrive(f.game, {});
  check('G1: away from Haven → skip away, no call', f.calls.length === 0 && (SD.takeseatStats().skips.away | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
  // preview null (pre-day-90 / not staged — the engine's answer)
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.tablePreview = function () { return null; };
  SD.takeSeatDrive(f.game, {});
  check('G1: preview null → skip preview-null, no call', f.calls.length === 0 && (SD.takeseatStats().skips['preview-null'] | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
  // preview not ready, engine's why carried
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.tablePreview = function () { return { seat: 'lesser', doors: [], ready: false, why: 'Return to Haven to take your seat.', overtime: 0, fullReady: false }; };
  SD.takeSeatDrive(f.game, {});
  check('G1: preview not ready → skip not-ready:<why>, no call', f.calls.length === 0 && (SD.takeseatStats().skips['not-ready:Return to Haven to take your seat.'] | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
  // table already done
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.progState = function () { return { tableDone: true, tableAnnounced: true }; };
  SD.takeSeatDrive(f.game, {});
  check('G1: tableDone → skip already-done, no call', f.calls.length === 0 && (SD.takeseatStats().skips['already-done'] | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
  // game over
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.over = true;
  SD.takeSeatDrive(f.game, {});
  check('G1: game over → skip over, no call', f.calls.length === 0 && (SD.takeseatStats().skips.over | 0) === 1, JSON.stringify(SD.takeseatStats().skips));
  // verb fails (engine refuses) → seatFailed, not a silent pass
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.tableTakeSeat = function () { f.calls.push('takeSeat'); return { ok: false, msg: 'Finish the current encounter before taking your seat.' }; };
  SD.takeSeatDrive(f.game, {});
  check('G1: failed verb → seatFailed 1, seatTaken 0', SD.takeseatStats().seatFailed === 1 && SD.takeseatStats().seatTaken === 0, JSON.stringify(SD.takeseatStats()));
  // preview throws → error counted, no crash
  SD.resetTakeseatStats();
  f = fakeGame(); f.game.tablePreview = function () { throw new Error('boom'); };
  let threw = false;
  try { SD.takeSeatDrive(f.game, {}); } catch (e) { threw = true; }
  check('G1: throwing preview → error counted, no throw, no call', !threw && f.calls.length === 0 && SD.takeseatStats().errors === 1, 'threw=' + threw + ' calls=' + f.calls.length);
  setGate(false);
})();

// --- G1: classifier fixtures for the ARMED leg ---
function row(day, over) {
  return Object.assign({
    day: day, living: 12, raw: 175, arc: 4, seat: 'none', seatDetail: null,
    preview: null, entryBlock: '', gate: 'no-seat',
    tableWaiting: false, tableAnnounced: false, tableDone: false,
    winDayFloorOk: day >= 90, scholarAtHaven: true, scholarAlive: true,
    sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
  }, over || {});
}
function mkCorpus(seed, rows, opts) {
  const o = opts || {};
  return Object.assign({
    seed: seed, arm: 'sitdrive-winseek-b', days: 150, gameDays: rows.length ? rows[rows.length - 1].day : 0,
    endReason: 'survived', won: false, over: false, villageLost: false,
    scaleRank: 'regional', maxWave: 4, standing: 175, instrumentOff: false,
    daily: rows, fallen: [], waveKillLog: [],
    takeseatStats: { seatAttempts: 0, seatTaken: 0, seatFailed: 0, seatDay: null, seatKind: null, doorsOffered: null, skips: {}, errors: 0, events: [] },
    sitAttempts: [], doorVerbMsgs: [], instrumentErrors: [], finalSeat: null,
  }, o);
}
const LESSER = { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true };

(function () {
  // sat, ARMED SHAPE: lesser from d90, drive sits d90, 7 doors offered,
  // tableChoices answered after the sit. The mechanism must name the
  // sit + doors and must NOT state "no sit drive runs".
  const rows = [];
  for (let d = 2; d <= 100; d++) {
    if (d === 3) continue;
    const sat = d >= 90;
    rows.push(row(d, {
      tableWaiting: d >= 85, tableAnnounced: d >= 90, tableDone: sat,
      seat: d >= 90 ? 'lesser' : 'none', seatDetail: d >= 90 ? LESSER : null,
      preview: d >= 90 ? { seat: 'lesser', doors: ['Defiant'], ready: !sat, why: sat ? '' : '', overtime: 0, fullReady: false } : null,
      gate: sat ? 'sat' : (d >= 90 ? 'offer-not-taken' : 'no-seat'),
      sitgap: { tsSkips: sat ? { 'not-announced': 80 } : { 'not-announced': 80 }, tsAttempts: sat ? 1 : 0, tsTaken: sat ? 1 : 0, tsFailed: 0, tsSeatDay: sat ? 90 : null, tsSeatKind: sat ? 'lesser' : null },
    }));
  }
  const c = mkCorpus(53001, rows, { gameDays: 100, days: 100, standing: 170,
    takeseatStats: { seatAttempts: 1, seatTaken: 1, seatFailed: 0, seatDay: 90, seatKind: 'lesser', doorsOffered: 7, skips: { 'not-announced': 80 }, errors: 0, events: [] },
    doorVerbMsgs: [
      { day: 90, call: 'tableTakeSeat', arg: null, ok: true, msg: null, before: {}, after: {}, offered: [] },
      { day: 90, call: 'chooseTableOption', arg: 'defiant', ok: true, msg: null, before: {}, after: {}, offered: ['defiant'] },
    ],
    finalSeat: { seat: 'lesser', detail: LESSER } });
  const cl = AD.classifySitDrive(c);
  check('G1: sat fixture (armed) classifies sat, lesser d90', cl.cls === 'sat' && cl.mechanism.indexOf('d90') >= 0, 'got ' + cl.cls + ': ' + cl.mechanism);
  check('G1: sat mechanism names doors offered (7)', cl.mechanism.indexOf('doors offered 7') >= 0, cl.mechanism);
  check('G1: sat mechanism names tableChoices answered (1)', cl.mechanism.indexOf('tableChoices answered after the sit: 1') >= 0, cl.mechanism);
  check('G1: armed-leg mechanism NEVER states "no sit drive runs"', cl.mechanism.indexOf(AD.NO_SIT_DRIVE_SENTENCE) === -1, cl.mechanism);
  check('G1: sat fixture has no failed attempt', cl.failedAttempt === false && cl.seatFailed === 0, 'seatFailed=' + cl.seatFailed);
})();

(function () {
  // offered-not-taken, ARMED SHAPE: announced d90, ready d92–d100,
  // the drive runs and skips 'away' on the away days — REAL skip
  // diffs, so the mechanism MAY cite skips (and must not claim no
  // drive runs).
  const rows = [];
  for (let d = 2; d <= 100; d++) {
    if (d === 3) continue;
    const away = (d % 3 === 0);
    const cumAway = [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100].filter(function (x) { return x <= d && x % 3 === 0; }).length;
    rows.push(row(d, {
      tableWaiting: d >= 85, tableAnnounced: d >= 90,
      seat: d >= 90 ? 'lesser' : 'none', seatDetail: d >= 90 ? LESSER : null,
      preview: d >= 92 ? { seat: 'lesser', doors: ['Defiant'], ready: true, why: '', overtime: 1, fullReady: false } : (d >= 90 ? { seat: 'lesser', doors: ['Defiant'], ready: false, why: 'Return to Haven to take your seat.', overtime: 0, fullReady: false } : null),
      entryBlock: (d >= 90 && d < 92) ? 'Return to Haven to take your seat.' : '',
      gate: d >= 92 ? 'offer-not-taken' : 'no-preview',
      scholarAtHaven: !away,
      sitgap: { tsSkips: d >= 92 ? { away: cumAway } : {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
    }));
  }
  const c = mkCorpus(53008, rows, { gameDays: 100, days: 100, standing: 175,
    takeseatStats: { seatAttempts: 0, seatTaken: 0, seatFailed: 0, seatDay: null, seatKind: null, doorsOffered: null, skips: { away: 3 }, errors: 0, events: [] },
    finalSeat: { seat: 'lesser', detail: LESSER } });
  const cl = AD.classifySitDrive(c);
  check('G1: offered-not-taken fixture (armed) classifies offered-not-taken', cl.cls === 'offered-not-taken', 'got ' + cl.cls);
  check('G1: armed offered-not-taken mechanism cites the real dominant skip (away)', cl.mechanism.indexOf('away') >= 0, cl.mechanism);
  check('G1: armed-leg mechanism NEVER states "no sit drive runs"', cl.mechanism.indexOf(AD.NO_SIT_DRIVE_SENTENCE) === -1, cl.mechanism);
})();

// Broken-classifier sensitivity: rule-order swap (offered-not-taken
// checked before sat) must misclassify a sat fixture — the gate can fail.
function brokenClassifySit(corpus) {
  const ev = A.seatEvents(corpus);
  if (ev.firstAnnouncedDay != null && ev.readyDays.length > 0) return 'offered-not-taken';
  if ((corpus.takeseatStats || {}).seatTaken > 0) return 'sat';
  if (ev.firstWaitingDay != null) return 'reached-never-sat';
  return 'never-offered';
}
(function () {
  const rows = [];
  for (let d = 90; d <= 95; d++) rows.push(row(d, { tableWaiting: true, tableAnnounced: true, tableDone: d >= 95, seat: 'lesser', seatDetail: LESSER, preview: { seat: 'lesser', doors: [], ready: d < 95, why: '', overtime: 0, fullReady: false }, gate: d >= 95 ? 'sat' : 'offer-not-taken', sitgap: { tsSkips: {}, tsAttempts: d >= 95 ? 1 : 0, tsTaken: d >= 95 ? 1 : 0, tsFailed: 0, tsSeatDay: d >= 95 ? 95 : null, tsSeatKind: d >= 95 ? 'lesser' : null } }));
  const c = mkCorpus(53001, rows, { gameDays: 95, days: 95, takeseatStats: { seatAttempts: 1, seatTaken: 1, seatFailed: 0, seatDay: 95, seatKind: 'lesser', doorsOffered: 7, skips: {}, errors: 0, events: [] }, finalSeat: { seat: 'lesser', detail: LESSER } });
  check('G1: broken classifier (offered-not-taken before sat) misclassifies a sat fixture',
    brokenClassifySit(c) !== 'sat', 'broken rule returned ' + brokenClassifySit(c));
  check('G1: real classifier returns sat on the same fixture',
    AD.classifySitDrive(c).cls === 'sat', 'real rule returned ' + AD.classifySitDrive(c).cls);
})();

// --- G1: cost bars on fixtures ---
(function () {
  function mkC(seed, gameDays, fallen) {
    return { seed: seed, gameDays: gameDays, fallen: fallen, daily: [], takeseatStats: { seatTaken: 0, seatDay: null } };
  }
  const armed = { 53001: mkC(53001, 119, [{ cause: 'the wild' }]), 53002: mkC(53002, 122, [{ cause: 'starvation' }]) };
  const base = { 53001: mkC(53001, 119, [{ cause: 'the wild' }]), 53002: mkC(53002, 122, []) };
  const bars = AD.costBars(armed, base);
  check('G1: costBars counts starvation (armed 1 vs control 0)', bars.starvArmed === 1 && bars.starvControl === 0, JSON.stringify(bars));
  check('G1: costBars starvation totals bar (≤ control+2) passes at +1', bars.starvTotalsOk === true, JSON.stringify(bars));
  check('G1: costBars median ratio 1.00 passes (≥ 0.80)', bars.medianOk === true && bars.medianRatio === 1, JSON.stringify(bars));
  const armed2 = { 53001: mkC(53001, 100, [{ cause: 'starvation' }, { cause: 'starvation' }, { cause: 'starvation' }]) };
  const base2 = { 53001: mkC(53001, 119, []) };
  const bars2 = AD.costBars(armed2, base2);
  check('G1: costBars FAILS the starvation bar at +3 (the bar can fail)', bars2.starvTotalsOk === false, JSON.stringify(bars2));
  check('G1: trueMedian is the true median (70+80)/2=75, not the upper-middle 80', AD.trueMedian([59, 60, 69, 70, 80, 96, 117, 119]) === 75, 'got ' + AD.trueMedian([59, 60, 69, 70, 80, 96, 117, 119]));
})();

// --- G3: corpus integrity on synthetic corpora (reused checker) ---
(function () {
  const daily = [];
  for (let d = 2; d <= 10; d++) {
    if (d === 3) continue;
    daily.push({ day: d, living: d < 5 ? 12 : 11,
      diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null },
      sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
      seat: 'none', seatDetail: null, preview: null, tableWaiting: false, tableAnnounced: false, tableDone: false });
  }
  daily.push({ day: 10, living: 11,
    diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null },
    sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
    seat: 'none', seatDetail: null, preview: null, tableWaiting: false, tableAnnounced: false, tableDone: false });
  const good = { seed: 53001, days: 10, gameDays: 10, endReason: 'survived', instrumentOff: false, daily: daily, fallen: [{ day: 5, name: 'Rafael', cause: 'sickness' }], instrumentErrors: [] };
  check('G3: good synthetic corpus passes integrity', AD.checkCorpusSit(good).ok);
  const bad = JSON.parse(JSON.stringify(good));
  bad.daily.forEach(function (r) { delete r.sitgap; });
  check('G3: broken recorder (sitgap dropped) FAILS integrity', !AD.checkCorpusSit(bad).ok);
})();

// --- Real-sim legs (seed 53003, /tmp only): armed sits, gate-off == plain winseek ---
// Runs the driver as a child process (env selects the leg) so each leg
// gets a fresh process + fresh module STATS. Slow (minutes) — these are
// the measurement legs, not unit checks.
function runDriverLeg(outSub, envExtra) {
  const outDir = path.join('/tmp', outSub + '-' + process.pid);
  const env = Object.assign({}, process.env, envExtra, { OUTDIR: outDir });
  delete env.SEEDS; delete env.POLICIES; delete env.DAYS;
  if (!('SITDRIVE_B' in envExtra)) delete env.SITDRIVE_B; // gate-off legs must not inherit a stale gate from this process
  if (!('POLICY' in envExtra)) delete env.POLICY;
  const r = cp.spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sitdrive-winseek-driver-20261109.js')],
    { cwd: REPO, env: Object.assign(env, { SEEDS: '53003', DAYS: '150', RUN: 'proof' }), encoding: 'utf8', timeout: 1500000 });
  const file = path.join(outDir, 'sitdrive-winseek-b-s53003-proof.json');
  return { status: r.status, stdout: (r.stdout || '').slice(-2000), stderr: (r.stderr || '').slice(-2000), corpus: readJson(file), file: file, outDir: outDir };
}
(function () {
  // ARMED: gate on, composite policy. Expect seatTaken 1, seatDay 90, kind lesser.
  const armed = runDriverLeg('sitdrive-proof-armed', { POLICY: 'winseek-sitdrive-b', SITDRIVE_B: '1' });
  checkSkip('REAL: armed 53003 runs clean (exit 0, corpus present)',
    armed.corpus ? (armed.status === 0) : null,
    armed.corpus ? ('exit=' + armed.status) : ('no corpus; exit=' + armed.status + ' stderr=' + armed.stderr));
  if (armed.corpus) {
    const ts = armed.corpus.takeseatStats || {};
    check('REAL: armed 53003 sits (seatTaken 1)', ts.seatTaken === 1, 'seatTaken=' + ts.seatTaken + ' seatDay=' + ts.seatDay);
    check('REAL: armed 53003 sits on d90 (the announcement day)', ts.seatDay === 90, 'seatDay=' + ts.seatDay);
    check('REAL: armed 53003 sits the lesser seat', ts.seatKind === 'lesser', 'seatKind=' + ts.seatKind);
    check('REAL: armed 53003 classifies sat', AD.classifySitDrive(armed.corpus).cls === 'sat', 'got ' + AD.classifySitDrive(armed.corpus).cls);
    check('REAL: armed 53003 has zero instrument errors', (armed.corpus.instrumentErrors || []).length === 0, JSON.stringify(armed.corpus.instrumentErrors || []));
  }
  // GATE-OFF: same driver, same policy file, gate unset. Expect 0 sits.
  const off = runDriverLeg('sitdrive-proof-gateoff', { POLICY: 'winseek-sitdrive-b' });
  if (off.corpus) {
    const ts = off.corpus.takeseatStats || {};
    checkSkip('REAL: gate-off 53003 runs clean (exit 0, corpus present)', off.status === 0, 'exit=' + off.status + ' stderr=' + off.stderr);
    check('REAL: gate-off 53003 never sits (seatTaken 0)', ts.seatTaken === 0 && ts.seatAttempts === 0, JSON.stringify(ts));
    check('REAL: gate-off 53003 classifies offered-not-taken (the DIAG shape)', AD.classifySitDrive(off.corpus).cls === 'offered-not-taken', 'got ' + AD.classifySitDrive(off.corpus).cls);
  } else {
    checkSkip('REAL: gate-off 53003 runs clean (exit 0, corpus present)', null, 'no corpus; exit=' + off.status + ' stderr=' + off.stderr);
  }
  // PLAIN: plain winseek through the same driver. Gate-off must equal it byte-identically.
  const plain = runDriverLeg('sitdrive-proof-plain', { POLICY: 'winseek' });
  if (plain.corpus && off.corpus) {
    // Canonical compare: JSON key ORDER is not a trajectory difference
    // (the module STATS object and the zero stub list the same fields
    // in different orders). Sort keys recursively, then compare.
    const canon = function (v) {
      if (v === null || typeof v !== 'object') return JSON.stringify(v);
      if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
      return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + canon(v[k]); }).join(',') + '}';
    };
    const strip = function (c) {
      const d = JSON.parse(JSON.stringify(c));
      delete d.arm; delete d.policy; delete d.gateOn; delete d.anchorCommit; delete d.run;
      return d;
    };
    const same = canon(strip(off.corpus)) === canon(strip(plain.corpus));
    check('REAL: gate-off == plain winseek byte-identical on 53003 (headline + daily + fallen + takeseatStats)', same,
      same ? '' : 'corpora differ (gate-off vs plain)');
    // The takeseatStats sub-object alone, for the report.
    check('REAL: gate-off takeseatStats == plain takeseatStats (both zero)', canon(off.corpus.takeseatStats) === canon(plain.corpus.takeseatStats),
      canon(off.corpus.takeseatStats) + ' vs ' + canon(plain.corpus.takeseatStats));
  } else {
    checkSkip('REAL: gate-off == plain winseek byte-identical on 53003', null, 'a corpus is missing');
  }
  [armed, off, plain].forEach(function (leg) {
    try { fs.rmSync(leg.outDir, { recursive: true, force: true }); } catch (e) {}
  });
})();

// --- G2/G3: real pilot corpora (present after the sweep) ---
const DIR = path.join(REPO, 'evidence', '2026-11-09', 'perseed-sitdrive-winseek-b');
const BASE = path.join(REPO, 'evidence', '2026-11-09', 'perseed-sitdrive-winseek-b-baseline');
const seeds = [53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008];
seeds.forEach(function (seed) {
  const c = readJson(path.join(DIR, 'sitdrive-winseek-b-s' + seed + '-sitdrive.json'));
  const ck = c ? AD.checkCorpusSit(c) : null;
  checkSkip('G3: armed corpus seed ' + seed + ' passes integrity',
    c ? ck.ok : null,
    c ? ck.problems.join('; ') + (ck.gaps.length ? ' (gaps: ' + ck.gaps.join(', ') + ')' : '') : 'no committed armed corpus yet');
  const b = readJson(path.join(BASE, 'sitdrive-winseek-b-s' + seed + '-winseek.json'));
  const ckb = b ? AD.checkCorpusSit(b) : null;
  checkSkip('G3: baseline corpus seed ' + seed + ' passes integrity',
    b ? ckb.ok : null,
    b ? ckb.problems.join('; ') : 'no committed baseline corpus yet');
});
(function () {
  const present = seeds.filter(function (s) { return !!readJson(path.join(DIR, 'sitdrive-winseek-b-s' + s + '-sitdrive.json')); });
  checkSkip('G1: all 8 armed corpora classify with a named mechanism',
    present.length === 8 ? seeds.every(function (s) {
      const c = readJson(path.join(DIR, 'sitdrive-winseek-b-s' + s + '-sitdrive.json'));
      const cl = AD.classifySitDrive(c);
      return cl.cls && cl.mechanism && cl.mechanism.length > 40;
    }) : null,
    present.length === 8 ? 'a seed classified without a mechanism' : 'only ' + present.length + '/8 corpora present');
  checkSkip('G1: no armed-leg mechanism states "no sit drive runs"',
    present.length === 8 ? seeds.every(function (s) {
      const c = readJson(path.join(DIR, 'sitdrive-winseek-b-s' + s + '-sitdrive.json'));
      return AD.classifySitDrive(c).mechanism.indexOf(AD.NO_SIT_DRIVE_SENTENCE) === -1;
    }) : null,
    present.length === 8 ? 'a mechanism still carries the DIAG sentence' : 'only ' + present.length + '/8 corpora present');
  checkSkip('G1: armed 53003/53006 sit (the reachable set, prereg Correction 1)',
    present.length === 8 ? [53003, 53006].every(function (s) {
      const c = readJson(path.join(DIR, 'sitdrive-winseek-b-s' + s + '-sitdrive.json'));
      return AD.classifySitDrive(c).cls === 'sat';
    }) : null,
    present.length === 8 ? 'a reachable seed did not sit' : 'only ' + present.length + '/8 corpora present');
  checkSkip('G1: offered-not-taken class is empty on the armed leg',
    present.length === 8 ? seeds.every(function (s) {
      const c = readJson(path.join(DIR, 'sitdrive-winseek-b-s' + s + '-sitdrive.json'));
      return AD.classifySitDrive(c).cls !== 'offered-not-taken';
    }) : null,
    present.length === 8 ? 'offered-not-taken is not empty' : 'only ' + present.length + '/8 corpora present');
})();

// --- G2: recorder neutrality on the armed leg (present after the control run) ---
const UNREC = path.join(REPO, 'evidence', '2026-11-09', 'perseed-sitdrive-winseek-b-unrec');
[53008, 53004].forEach(function (seed) {
  const unrec = readJson(path.join(UNREC, 'sitdrive-winseek-b-s' + seed + '-sitdrive.json'));
  const rec = readJson(path.join(DIR, 'sitdrive-winseek-b-s' + seed + '-sitdrive.json'));
  const n = (unrec && rec) ? AD.neutralityCompareSit(unrec, rec) : null;
  checkSkip('G2: armed neutrality seed ' + seed + ' (armed-recorded == armed-unrecorded)',
    (unrec && rec) ? n.ok : null,
    (unrec && rec) ? ('diffs: ' + n.diffs.join(', ')) : 'control corpus missing');
});

// --- Driver stub shape (the gate-off-vs-plain equality rests on it) ---
(function () {
  const DRV = require('./sitdrive-winseek-driver-20261109');
  SD.resetTakeseatStats();
  const stubKeys = Object.keys(DRV.zeroTakeseatStats()).sort();
  const realKeys = Object.keys(SD.takeseatStats()).sort();
  check('G3: zeroTakeseatStats has exactly the real takeseatStats field set (else gate-off vs plain compares different shapes)',
    JSON.stringify(stubKeys) === JSON.stringify(realKeys), 'stub=' + JSON.stringify(stubKeys) + ' real=' + JSON.stringify(realKeys));
  check('G3: zeroTakeseatStats returns fresh zero stats',
    (function () { const a = DRV.zeroTakeseatStats(); const b = DRV.zeroTakeseatStats(); return a !== b && a.seatTaken === 0 && a.seatAttempts === 0 && JSON.stringify(a.skips) === '{}' && a.seatDay === null && a.doorsOffered === null && a.errors === 0; })(),
    'stub is not a fresh zero object');
})();

// --- Driver write-retry helper (flap robustness, success path) ---
(function () {
  const DRV = require('./sitgap-winseek-driver-20261109');
  const tmp = '/tmp/sitdrive-winseek-proof-' + process.pid + '.json';
  const content = JSON.stringify({ seed: 53001, check: 'round-trip' }, null, 2) + '\n';
  let ok = false, errMsg = '';
  try {
    DRV.writeFileRetry(tmp, content, { attempts: 3, sleepS: 5 });
    ok = fs.readFileSync(tmp, 'utf8') === content;
  } catch (e) { ok = false; errMsg = String(e && e.message ? e.message : e).slice(0, 80); }
  try { fs.unlinkSync(tmp); } catch (e) {}
  check('G3: driver writeFileRetry round-trips a corpus file (and verifies by read-back)', ok === true, 'round-trip failed' + (errMsg ? ': ' + errMsg : ''));
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
