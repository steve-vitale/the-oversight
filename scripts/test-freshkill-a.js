// test-freshkill-a.js — proof for the fresh-kill inversion DIAG analyzer
// and driver (arm sim-freshkill-a). Fixture tests (channel classifier,
// ±1-day kill matcher, verdict rules) + live harness smoke + off/on
// neutrality leg + determinism leg (driver subprocesses into /tmp, never
// into evidence/). The instrument is reused VERBATIM from grindfinish-b
// (scripts/grindfinish-instrument-20261105.js), whose own proof
// (scripts/test-grindfinish-20261105.js, 26/26) covers its capture;
// this proof covers only the NEW measurement: channel attribution,
// the ±1-day join, and the DIAG verdict rules.
// Exit non-zero on any failure.
// Usage: node scripts/test-freshkill-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'freshkill-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---- channel classifier fixtures ----
function tbf(o) {
  return Object.assign({ day: 30, channel: 'player-tb', fighter: 'leader', fighters: ['leader'], mid: 'eulogy', wave: 4,
    entryHp: 925, entryHpPrimary: 925, entryMaxHpPrimary: 1100, defHpLo: 900, defHpHi: 1100,
    entryFracHi: 925 / 1100, entryFracHiPrimary: 925 / 1100, entryFracLoPrimary: 925 / 900,
    damageDealt: 100, damageFrac: 0.1, rounds: 5, swingsAttempted: 3, partySize: 1,
    ending: 'death', outcomeRaw: 'lost', mHpLeft: 825, mHpLeftPrimary: 825,
    lifted: false, worldHpAtLift: null, pendingLive: false, pendingId: null, doorFledAtEntry: null,
    primaryVeteran: false, worldOriginPresent: false,
    gear: { weaponBonus: 25, armorP: 10 }, abilitiesUsed: [] }, o || {});
}
(function () {
  // A: pending-live wanderer, fresh entry (the grindfinish kill shape:
  // fracHi 0.84, non-lifted, pending-live).
  check('channel-A-wild-fresh', AN.channelOf(tbf({ pendingLive: true, pendingId: 'w_12', entryFracHiPrimary: 0.84 })) === 'A');
  // A at the fresh boundary (0.75 exactly) still counts.
  check('channel-A-boundary-075', AN.channelOf(tbf({ pendingLive: true, entryFracHiPrimary: 0.75 })) === 'A');
  // B: lifted siege at middle entry.
  check('channel-B-lifted-siege', AN.channelOf(tbf({ lifted: true, worldHpAtLift: { hp: 600, maxHp: 1100 }, entryFracHiPrimary: 0.55 })) === 'B');
  // B: lifted siege entering fresh (a fresh world entity lifted at
  // near-full HP is still a siege fight, not a wild fight).
  check('channel-B-lifted-fresh', AN.channelOf(tbf({ lifted: true, worldHpAtLift: { hp: 1050, maxHp: 1100 }, entryFracHiPrimary: 0.95 })) === 'B');
  // C: wounded entry, lifted (grind tail) — precedence C over B.
  check('channel-C-lifted-wounded', AN.channelOf(tbf({ lifted: true, worldHpAtLift: { hp: 200, maxHp: 1100 }, entryFracHiPrimary: 0.18 })) === 'C');
  // C: wounded entry, non-lifted non-pending.
  check('channel-C-wounded', AN.channelOf(tbf({ entryFracHiPrimary: 0.10 })) === 'C');
  // C at the wounded boundary (0.25 exactly is NOT wounded — middle).
  check('channel-boundary-025-not-wounded', AN.channelOf(tbf({ entryFracHiPrimary: 0.25 })) === 'D');
  // D: veteran roll (non-lifted, non-pending, fresh).
  check('channel-D-veteran', AN.channelOf(tbf({ primaryVeteran: true, entryFracHiPrimary: 1.5 })) === 'D');
  // D: pending-live but non-fresh middle entry (should not happen for a
  // genuine fresh roll — def lo/hi >= 0.778 — but the classifier must
  // not promote it to A).
  check('channel-D-pending-nonfresh', AN.channelOf(tbf({ pendingLive: true, entryFracHiPrimary: 0.5 })) === 'D');
  // D: door-flee re-engage (non-lifted, non-pending).
  check('channel-D-doorfled', AN.channelOf(tbf({ doorFledAtEntry: [{ id: 'eulogy', hp: 400 }], entryFracHiPrimary: 0.4 })) === 'D');
  // D: null frac — never promoted to A or C.
  check('channel-D-null-frac', AN.channelOf(tbf({ entryFracHiPrimary: null, entryFracHi: null })) === 'D');
  // Field fights carry no channel.
  check('channel-null-field', AN.channelOf(Object.assign(tbf(), { channel: 'field' })) === null);
  // D sub-classification.
  check('dsub-pending-nonfresh', AN.dSub(tbf({ pendingLive: true, entryFracHiPrimary: 0.5 })) === 'pendingLive-nonfresh');
  check('dsub-veteran', AN.dSub(tbf({ primaryVeteran: true, entryFracHiPrimary: 1.5 })) === 'veteran');
  check('dsub-doorfled', AN.dSub(tbf({ doorFledAtEntry: [{ id: 'eulogy', hp: 400 }], entryFracHiPrimary: 0.4 })) === 'doorFled');
  check('dsub-contest-residual', AN.dSub(tbf({ entryFracHiPrimary: 0.5 })) === 'contestOrTrial');
})();

// ---- ±1-day kill matcher fixtures ----
(function () {
  const F = function (day, mid, fighters) {
    return { day: day, channel: 'player-tb', mid: mid, fighters: fighters, wave: 4 };
  };
  // Same-day match.
  let fights = [F(20, 'eulogy', ['leader'])];
  let unmatched = AN.matchKills(fights, [{ d: 20, mid: 'eulogy', w: 4, by: 'leader' }]);
  check('match-same-day', fights[0]._matchedKill != null && fights[0]._matchedKillDayOffset === 0 && unmatched.length === 0,
    JSON.stringify({ off: fights[0]._matchedKillDayOffset, un: unmatched.length }));
  // N+1 match (midnight-spanning kill).
  fights = [F(20, 'eulogy', ['leader'])];
  unmatched = AN.matchKills(fights, [{ d: 21, mid: 'eulogy', w: 4, by: 'leader' }]);
  check('match-next-day', fights[0]._matchedKill != null && fights[0]._matchedKillDayOffset === 1 && unmatched.length === 0,
    JSON.stringify({ off: fights[0]._matchedKillDayOffset, un: unmatched.length }));
  // A kill logged 2 days after the fight does NOT match.
  fights = [F(20, 'eulogy', ['leader'])];
  unmatched = AN.matchKills(fights, [{ d: 22, mid: 'eulogy', w: 4, by: 'leader' }]);
  check('match-not-day-plus-2', fights[0]._matchedKill == null && unmatched.length === 1);
  // Same-day fight claims the kill; the next-day fight must not steal it.
  fights = [F(20, 'eulogy', ['leader']), F(21, 'eulogy', ['leader'])];
  unmatched = AN.matchKills(fights, [{ d: 21, mid: 'eulogy', w: 4, by: 'leader' }]);
  check('match-same-day-preferred', fights[0]._matchedKill == null && fights[1]._matchedKill != null && fights[1]._matchedKillDayOffset === 0 && unmatched.length === 0,
    JSON.stringify(fights.map(function (f) { return f._matchedKillDayOffset; })));
  // Each kill matches at most one fight; each fight at most one kill.
  fights = [F(20, 'eulogy', ['leader']), F(20, 'eulogy', ['ally'])];
  unmatched = AN.matchKills(fights, [{ d: 20, mid: 'eulogy', w: 4, by: 'leader' }, { d: 20, mid: 'eulogy', w: 4, by: 'ally' }]);
  check('match-one-to-one', fights[0]._matchedKill != null && fights[1]._matchedKill != null && unmatched.length === 0);
  fights = [F(20, 'eulogy', ['leader'])];
  unmatched = AN.matchKills(fights, [{ d: 20, mid: 'eulogy', w: 4, by: 'leader' }, { d: 20, mid: 'eulogy', w: 4, by: 'leader' }]);
  check('match-one-kill-per-fight', fights[0]._matchedKill != null && unmatched.length === 1);
  // Killer must be in the fight's fighters (strict rule carried over).
  fights = [F(20, 'eulogy', ['jesse'])];
  unmatched = AN.matchKills(fights, [{ d: 20, mid: 'eulogy', w: 4, by: 'boris' }]);
  check('match-killer-must-be-fighter', fights[0]._matchedKill == null && unmatched.length === 1);
  // TB "kill-or-rout" ending without a kill-log row is not a kill —
  // covered by the matcher (no log row => no match); the analyzer's
  // same-day table agrees with the ±1-day table when all kills are
  // same-day.
  const sd = AN.matchKillsSameDay([F(20, 'eulogy', ['leader'])], [{ d: 20, mid: 'eulogy', w: 4, by: 'leader' }]);
  check('match-sameday-helper', sd.matchedCount === 1 && sd.unmatched.length === 0);
  const sd2 = AN.matchKillsSameDay([F(20, 'eulogy', ['leader'])], [{ d: 21, mid: 'eulogy', w: 4, by: 'leader' }]);
  check('match-sameday-helper-misses-next-day', sd2.matchedCount === 0 && sd2.unmatched.length === 1);
})();

// ---- verdict fixtures (analyzeDir over synthetic corpora) ----
function arow(seed, opts) {
  const r = { seed: seed, run: 'fixture', days: 100, endReason: 'horizon', won: false,
    fights: [], daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1 };
  return Object.assign(r, opts || {});
}
// A-fight: pending-live fresh (frac 0.84). B-fight: lifted middle (0.55).
// C-fight: wounded (0.18). D-fight: non-lifted non-pending middle (0.5).
function mkTb(day, kind, killer) {
  const base = { day: day, channel: 'player-tb', mid: 'eulogy', wave: 4, fighters: [killer || 'leader'],
    entryHp: 900, entryHpPrimary: 900, entryFracHiPrimary: 0.5, ending: 'death', outcomeRaw: 'lost',
    mHpLeft: 800, mHpLeftPrimary: 800, rounds: 5, partySize: 1, damageFrac: 0.1,
    lifted: false, pendingLive: false, doorFledAtEntry: null, primaryVeteran: false, worldOriginPresent: false };
  if (kind === 'A') { base.pendingLive = true; base.entryFracHiPrimary = 0.84; base.entryHpPrimary = 925; }
  if (kind === 'B') { base.lifted = true; base.entryFracHiPrimary = 0.55; base.entryHpPrimary = 605; base.worldHpAtLift = { hp: 605, maxHp: 1100 }; }
  if (kind === 'C') { base.entryFracHiPrimary = 0.18; base.entryHpPrimary = 200; base.lifted = true; base.worldHpAtLift = { hp: 200, maxHp: 1100 }; }
  if (kind === 'D') { base.entryFracHiPrimary = 0.5; }
  return base;
}
function writeCorpus(dir, rows) {
  fs.mkdirSync(dir, { recursive: true });
  rows.forEach(function (r, i) {
    fs.writeFileSync(dir + '/freshkill-s' + r.seed + '-fixture.json', JSON.stringify(r));
  });
}
function clean(dir) { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }

(function () {
  // DIAG-GO: A 2/8 (25%) vs B 0/8 (0%) — exactly 25pp, 8+8 fights.
  const dir = '/tmp/freshkill-verdict-go-' + process.pid;
  const fights = [];
  const log = [];
  for (let i = 0; i < 8; i++) {
    const a = mkTb(20 + i, 'A'); fights.push(a);
    const b = mkTb(40 + i, 'B'); fights.push(b);
  }
  fights[0].ending = 'kill-or-rout'; fights[0].outcomeRaw = 'won';
  fights[1].ending = 'kill-or-rout'; fights[1].outcomeRaw = 'won';
  log.push({ d: 20, mid: 'eulogy', w: 4, by: 'leader' });
  log.push({ d: 21, mid: 'eulogy', w: 4, by: 'leader' });
  writeCorpus(dir, [arow(99351, { fights: fights, waveKillLog: log })]);
  const out = AN.analyzeDir(dir);
  check('verdict-GO-15pp-8plus8', out.diag.verdict === 'DIAG-GO' && out.diag.go === true &&
    out.channels.A.fights === 8 && out.channels.A.kills === 2 && out.channels.B.fights === 8 && out.channels.B.kills === 0,
    JSON.stringify(out.diag) + ' A=' + JSON.stringify(out.channels.A) + ' B=' + JSON.stringify(out.channels.B));
  clean(dir);
})();
(function () {
  // DIAG-NO: A 1/8 (12.5%) vs B 0/8 — gap 12.5pp < 15pp, total TB 16 < 20
  // but the GO bar fails, so UNDERPOWERED would ALSO apply; the prereg
  // rule order is GO first, then UNDERPOWERED. Use 24 total TB fights
  // (A 8, B 8, D 8) so the verdict is a clean DIAG-NO.
  const dir = '/tmp/freshkill-verdict-no-' + process.pid;
  const fights = [];
  const log = [];
  for (let i = 0; i < 8; i++) {
    fights.push(mkTb(20 + i, 'A'));
    fights.push(mkTb(40 + i, 'B'));
    fights.push(mkTb(60 + i, 'D'));
  }
  fights[0].ending = 'kill-or-rout'; fights[0].outcomeRaw = 'won';
  log.push({ d: 20, mid: 'eulogy', w: 4, by: 'leader' });
  writeCorpus(dir, [arow(99351, { fights: fights, waveKillLog: log })]);
  const out = AN.analyzeDir(dir);
  check('verdict-NO-14pp', out.diag.verdict === 'DIAG-NO' && out.totalTb === 24 &&
    Math.abs(out.channels.A.killRate - 0.125) < 1e-9 && out.channels.B.killRate === 0,
    JSON.stringify(out.diag) + ' totalTb=' + out.totalTb);
  clean(dir);
})();
(function () {
  // DIAG-NO (not GO) when a channel has only 7 fights even at a 25pp gap.
  const dir = '/tmp/freshkill-verdict-7-' + process.pid;
  const fights = [];
  const log = [];
  for (let i = 0; i < 7; i++) fights.push(mkTb(20 + i, 'A'));
  for (let i = 0; i < 8; i++) fights.push(mkTb(40 + i, 'B'));
  for (let i = 0; i < 8; i++) fights.push(mkTb(60 + i, 'D'));
  fights[0].ending = 'kill-or-rout'; fights[0].outcomeRaw = 'won';
  fights[1].ending = 'kill-or-rout'; fights[1].outcomeRaw = 'won';
  log.push({ d: 20, mid: 'eulogy', w: 4, by: 'leader' });
  log.push({ d: 21, mid: 'eulogy', w: 4, by: 'leader' });
  writeCorpus(dir, [arow(99351, { fights: fights, waveKillLog: log })]);
  const out = AN.analyzeDir(dir);
  check('verdict-NO-channel-7-fights', out.diag.verdict === 'DIAG-NO' && out.channels.A.fights === 7,
    JSON.stringify(out.diag));
  clean(dir);
})();
(function () {
  // UNDERPOWERED: 19 total TB fights, no GO pair.
  const dir = '/tmp/freshkill-verdict-under-' + process.pid;
  const fights = [];
  for (let i = 0; i < 10; i++) fights.push(mkTb(20 + i, 'A'));
  for (let i = 0; i < 9; i++) fights.push(mkTb(40 + i, 'B'));
  writeCorpus(dir, [arow(99351, { fights: fights, waveKillLog: [] })]);
  const out = AN.analyzeDir(dir);
  check('verdict-UNDERPOWERED-19tb', out.diag.verdict === 'UNDERPOWERED' && out.totalTb === 19,
    JSON.stringify(out.diag));
  clean(dir);
})();
(function () {
  // GO beats UNDERPOWERED: 19 total TB fights (A 8 with 2 kills, B 8,
  // D 3) — the comparison itself is powered.
  const dir = '/tmp/freshkill-verdict-go-under-' + process.pid;
  const fights = [];
  const log = [];
  for (let i = 0; i < 8; i++) fights.push(mkTb(20 + i, 'A'));
  for (let i = 0; i < 8; i++) fights.push(mkTb(40 + i, 'B'));
  for (let i = 0; i < 3; i++) fights.push(mkTb(60 + i, 'D'));
  fights[0].ending = 'kill-or-rout'; fights[0].outcomeRaw = 'won';
  fights[1].ending = 'kill-or-rout'; fights[1].outcomeRaw = 'won';
  log.push({ d: 20, mid: 'eulogy', w: 4, by: 'leader' });
  log.push({ d: 21, mid: 'eulogy', w: 4, by: 'leader' });
  writeCorpus(dir, [arow(99351, { fights: fights, waveKillLog: log })]);
  const out = AN.analyzeDir(dir);
  check('verdict-GO-over-UNDERPOWERED', out.diag.verdict === 'DIAG-GO' && out.totalTb === 19,
    JSON.stringify(out.diag));
  clean(dir);
})();
(function () {
  // ±1-day join moves a kill into the verdict: A kill logged day N+1
  // for a day-N fight counts (same-day table misses it). A fights are
  // spaced two days apart so the +1 match is unambiguous (no same-day
  // fight of the same mid competes for the kill).
  const dir = '/tmp/freshkill-verdict-plus1-' + process.pid;
  const fights = [];
  const log = [];
  for (let i = 0; i < 8; i++) fights.push(mkTb(20 + 2 * i, 'A'));
  for (let i = 0; i < 8; i++) fights.push(mkTb(40 + i, 'B'));
  fights[0].ending = 'kill-or-rout'; fights[0].outcomeRaw = 'won';
  fights[1].ending = 'kill-or-rout'; fights[1].outcomeRaw = 'won';
  // Both kills logged the day AFTER their fights (midnight-spanning):
  // day-20 fight -> kill logged day 21; day-22 fight -> kill day 23.
  log.push({ d: 21, mid: 'eulogy', w: 4, by: 'leader' });
  log.push({ d: 23, mid: 'eulogy', w: 4, by: 'leader' });
  writeCorpus(dir, [arow(99351, { fights: fights, waveKillLog: log })]);
  const out = AN.analyzeDir(dir);
  check('verdict-plus1-day-join-counts', out.diag.verdict === 'DIAG-GO' &&
    out.channels.A.kills === 2 && out.killsMatchedNextDay === 2 &&
    out.sameDayChannels.A.killsSameDay === 0,
    JSON.stringify({ v: out.diag.verdict, aKills: out.channels.A.kills, nextDay: out.killsMatchedNextDay, sdA: out.sameDayChannels.A.killsSameDay }));
  clean(dir);
})();

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const INST = require(path.join(REPO, 'scripts', 'grindfinish-instrument-20261105'));
  const { Game } = await loadGame({ seed: 99351, mode: 'competent-freshkill-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== last) { last = d; inst.snapshot(); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 && Array.isArray(fin.waveKillLog),
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  const tmp = '/tmp/freshkill-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99351', OUTDIR: tmp });
  execSync('node scripts/freshkill-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', FRESHKILL_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/freshkill-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  execSync('node scripts/freshkill-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on2' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'freshkill-s99351-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'freshkill-s99351-proof-on.json'), 'utf8'));
  const on2 = JSON.parse(fs.readFileSync(path.join(tmp, 'freshkill-s99351-proof-on2.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  check('determinism-on-twice', on.days === on2.days && on.endReason === on2.endReason &&
    (on.waveKillLog || []).length === (on2.waveKillLog || []).length &&
    on.fights.length === on2.fights.length &&
    JSON.stringify(on.fights) === JSON.stringify(on2.fights),
    'on=' + on.days + '/' + on.fights.length + ' on2=' + on2.days + '/' + on2.fights.length);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
