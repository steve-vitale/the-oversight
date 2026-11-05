// test-postblood-20261105.js — proof for the postblood analyzer
// (arm sim-postblood-b). Fixture classifier/verdict/exposure tests +
// live harness smoke + off/on neutrality leg (driver subprocesses into
// /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-postblood-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const PB = require(path.join(REPO, 'scripts', 'postblood-analyze-20261105'));
const AN = require(path.join(REPO, 'scripts', 'killerdeath-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// --- Bucket mapping from killerdeath split strings ---
check('bucket-show-contest', PB.bucketFromSplit('contest') === 'SHOW');
check('bucket-show-arena', PB.bucketFromSplit('the arena') === 'SHOW');
check('bucket-monster', PB.bucketFromSplit('monster:The Eater') === 'WILD-MONSTER');
check('bucket-scholar-arena', PB.bucketFromSplit('scholar-death:the arena:at-haven:in-combat') === 'SHOW');
check('bucket-scholar-contest', PB.bucketFromSplit('scholar-death:contest:away:in-combat') === 'SHOW');
check('bucket-scholar-expedition', PB.bucketFromSplit('scholar-death:the expedition:at-haven:not-in-combat') === 'EXPEDITION');
check('bucket-scholar-wild', PB.bucketFromSplit('scholar-death:the wild:away:in-combat') === 'WILD-MONSTER');
check('bucket-scholar-injuries', PB.bucketFromSplit('scholar-death:injuries:away:in-combat') === 'WILD-MONSTER');
check('bucket-expedition', PB.bucketFromSplit('the expedition') === 'EXPEDITION');
check('bucket-residual', PB.bucketFromSplit('the wild (unsplit residual)') === 'WILD-RESIDUAL');
check('bucket-other-thirst', PB.bucketFromSplit('thirst') === 'OTHER');
check('bucket-alive-null', PB.bucketFromSplit('alive') === null);

// --- Roster-death splitter precedence ---
check('split-monster-threaded', PB.splitRosterDeath({ villagerId: 'x', day: 10, cause: 'the wild', monsterId: 'the_eater', monsterName: 'The Eater' }, null) === 'monster:The Eater');
check('split-scholar-ctx', PB.splitRosterDeath({ villagerId: 'x', day: 10, cause: 'the wild' }, { day: 10, scholarId: 'x', causeArg: 'the arena', atHaven: true, inCombat: true, pendingEncounter: false }) === 'scholar-death:the arena:at-haven:in-combat');
check('split-bare-wild-residual', PB.splitRosterDeath({ villagerId: 'x', day: 10, cause: 'the wild' }, null) === 'the wild (unsplit residual)');
check('split-literal-contest', PB.splitRosterDeath({ villagerId: 'x', day: 10, cause: 'contest' }, null) === 'contest');

// --- Row builders (mirror test-killerdeath helpers) ---
function row(seed, opts) {
  const r = {
    seed: seed, policy: 'baseline', run: 'fixture', days: 100, endReason: 'horizon', won: false, fights: [],
    daily: [], waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    killsLive: [], scholarDeaths: [], killerTrack: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 3, maxWave: 3,
  };
  return Object.assign(r, opts || {});
}
function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'player', trick: null }; }
function dead(vid, day, cause, extra) { return Object.assign({ villagerId: vid, day: day, cause: cause || 'the arena', name: vid }, extra || {}); }
function liveKill(d, mid, w, by, scholarChannel) {
  return { day: d, mid: mid, wave: w, by: by, via: 'player', scholarAtKill: scholarChannel ? by : 'someone-else', scholarChannel: !!scholarChannel };
}
function dailyRow(day, living, vets) {
  return { day: day, gated: 100, raw: 120, living: living, rosterSize: living, readiness5: { veterans: vets || 0 } };
}
function trackRow(day, by, deadInFallen) {
  return { day: day, by: by, isScholar: false, deadInFallen: !!deadInFallen, atHaven: null, health: null, onExped: false };
}

// --- Roster ledger: dedupe (earliest wins), killer + scholar flags ---
(function () {
  const r = row(20, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'contest'), dead('bob', 50, 'monster', { monsterName: 'Big Ugly', monsterId: 'big_ugly' }), dead('bob', 52, 'thirst')],
    scholarDeaths: [{ day: 45, scholarId: 'alice', causeArg: 'contest', atHaven: false, inCombat: true, pendingEncounter: false }],
    deadMap: { alice: true, bob: true },
  });
  const led = PB.rosterLedger(r);
  check('ledger-dedupe-earliest', led.length === 2 && led.filter(function (x) { return x.vid === 'bob'; })[0].day === 50, JSON.stringify(led.map(function (x) { return x.vid + '@' + x.day; })));
  const a = led.filter(function (x) { return x.vid === 'alice'; })[0];
  const b = led.filter(function (x) { return x.vid === 'bob'; })[0];
  check('ledger-flags', a.isKiller === true && a.isScholarDeath === true && a.bucket === 'SHOW' && b.isKiller === false && b.bucket === 'WILD-MONSTER',
    JSON.stringify({ a: a, b: b }));
})();

// --- Fresh-window boundary: +7 fresh, +8 not ---
(function () {
  const r = row(21, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(40, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(40, 'w4b', 4, 'bob', false)],
    fallen: [dead('alice', 47, 'contest'), dead('bob', 48, 'monster', { monsterName: 'Big Ugly', monsterId: 'big_ugly' })],
    deadMap: { alice: true, bob: true },
  });
  const fates = AN.killerFates(r);
  const fa = fates.filter(function (f) { return f.by === 'alice'; })[0];
  const fb = fates.filter(function (f) { return f.by === 'bob'; })[0];
  check('fresh-boundary-7d', fa.killToDeathDays === 7 && fb.killToDeathDays === 8, JSON.stringify([fa.killToDeathDays, fb.killToDeathDays]));
})();

// --- Exposure days: fresh window counts only alive rows in [first, first+7] ---
(function () {
  const r = row(22, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 43, 'contest')],
    deadMap: { alice: true },
    killerTrack: [trackRow(40, 'alice', false), trackRow(41, 'alice', false), trackRow(42, 'alice', false), trackRow(43, 'alice', true), trackRow(44, 'alice', true)],
    daily: [dailyRow(40, 10), dailyRow(41, 10), dailyRow(42, 10), dailyRow(43, 9), dailyRow(44, 9)],
  });
  const fates = AN.killerFates(r);
  const ex = PB.exposureDays(r, fates);
  check('exposure-fresh-days', ex.freshKillerDays === 3 && ex.killerDaysTotal === 3 && ex.rosterDays === 48 && ex.nonKillerRosterDays === 45,
    JSON.stringify(ex));
})();

// --- Verdict fixtures: build tiny corpora and run the full analyzer ---
function fixtureCorpus(tag, seedRows) {
  const dir = '/tmp/postblood-proof-' + process.pid + '-' + tag;
  fs.mkdirSync(dir, { recursive: true });
  seedRows.forEach(function (r, i) {
    fs.writeFileSync(path.join(dir, 'postblood-s' + (99171 + i) + '-fixture.json'), JSON.stringify(r) + '\n');
  });
  return dir;
}
function killerRow(seed, killerDefs, nonKillerDeaths, living) {
  // killerDefs: [{by, firstDay, deathDay, cause, monster, scholar}]
  const r = row(seed, { daily: [], unlockedWave: 4, maxWave: 4 });
  for (let d = 1; d <= 100; d++) r.daily.push(dailyRow(d, living, 0));
  killerDefs.forEach(function (kd, i) {
    r.waveKillLog.push(kill(kd.firstDay, 'w4m' + i, 4, kd.by));
    r.killsLive.push(liveKill(kd.firstDay, 'w4m' + i, 4, kd.by, !!kd.scholar));
    r.deadMap[kd.by] = kd.deathDay != null;
    if (kd.deathDay != null) {
      const extra = kd.monster ? { monsterId: kd.monster, monsterName: kd.monster } : {};
      r.fallen.push(dead(kd.by, kd.deathDay, kd.cause, extra));
      if (kd.scholar) r.scholarDeaths.push({ day: kd.deathDay, scholarId: kd.by, causeArg: kd.cause, atHaven: false, inCombat: true, pendingEncounter: false });
      for (let d = kd.firstDay; d <= kd.deathDay; d++) r.killerTrack.push(trackRow(d, kd.by, d === kd.deathDay));
    } else {
      for (let d = kd.firstDay; d <= 100; d++) r.killerTrack.push(trackRow(d, kd.by, false));
    }
  });
  (nonKillerDeaths || []).forEach(function (nk, i) {
    r.fallen.push(dead('nk' + i + '_' + seed, nk.day, nk.cause, nk.monster ? { monsterId: nk.monster, monsterName: nk.monster } : {}));
    r.deadMap['nk' + i + '_' + seed] = true;
    if (nk.scholar) r.scholarDeaths.push({ day: nk.day, scholarId: 'nk' + i + '_' + seed, causeArg: nk.cause, atHaven: false, inCombat: true, pendingEncounter: false });
  });
  return r;
}

// (a) Show-preferential: 4 fresh deaths, 3 show; non-killer 10 deaths, 1 show.
(function () {
  const dir = fixtureCorpus('a', [
    killerRow(99171, [
      { by: 'k1', firstDay: 40, deathDay: 41, cause: 'contest', scholar: true },
      { by: 'k2', firstDay: 50, deathDay: 50, cause: 'the arena', scholar: true },
      { by: 'k3', firstDay: 60, deathDay: 63, cause: 'contest', scholar: false },
      { by: 'k4', firstDay: 70, deathDay: 74, cause: 'monster', monster: 'Big Ugly', scholar: false },
    ], [
      { day: 30, cause: 'monster', monster: 'Big Ugly' }, { day: 35, cause: 'thirst' },
      { day: 38, cause: 'monster', monster: 'Big Ugly' }, { day: 44, cause: 'a wound that wouldn\'t close' },
      { day: 47, cause: 'monster', monster: 'Big Ugly' }, { day: 55, cause: 'thirst' },
      { day: 58, cause: 'monster', monster: 'Big Ugly' }, { day: 66, cause: 'contest' },
      { day: 72, cause: 'thirst' }, { day: 80, cause: 'monster', monster: 'Big Ugly' },
    ], 10),
  ]);
  const a = PB.analyzeDir(dir);
  check('verdict-a-show-preferential', a.verdict === 'a-show-preferential' && a.ruleA.implicated === true,
    'verdict=' + a.verdict + ' shareRatio=' + a.shareRatio + ' rateRatio=' + a.rateRatio + ' fresh=' + a.freshDeaths);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

// (b) Wild-dominant: 4 fresh deaths, 3 wild + 1 show; non-killer 10 deaths, 2 show.
(function () {
  const dir = fixtureCorpus('b', [
    killerRow(99171, [
      { by: 'k1', firstDay: 40, deathDay: 41, cause: 'monster', monster: 'Big Ugly', scholar: true },
      { by: 'k2', firstDay: 50, deathDay: 52, cause: 'monster', monster: 'Big Ugly', scholar: false },
      { by: 'k3', firstDay: 60, deathDay: 63, cause: 'contest', scholar: false },
      { by: 'k4', firstDay: 70, deathDay: 74, cause: 'monster', monster: 'Big Ugly', scholar: false },
    ], [
      { day: 30, cause: 'monster', monster: 'Big Ugly' }, { day: 35, cause: 'contest' },
      { day: 38, cause: 'monster', monster: 'Big Ugly' }, { day: 44, cause: 'contest' },
      { day: 47, cause: 'monster', monster: 'Big Ugly' }, { day: 55, cause: 'thirst' },
      { day: 58, cause: 'monster', monster: 'Big Ugly' }, { day: 66, cause: 'thirst' },
      { day: 72, cause: 'thirst' }, { day: 80, cause: 'monster', monster: 'Big Ugly' },
    ], 10),
  ]);
  const a = PB.analyzeDir(dir);
  check('verdict-b-wild-dominant', a.verdict === 'b-wild-dominant' && a.ruleB.implicated === true,
    'verdict=' + a.verdict + ' shareRatio=' + a.shareRatio + ' fresh=' + a.freshDeaths);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

// (c) Underpowered: only 2 fresh deaths, however show-heavy.
(function () {
  const dir = fixtureCorpus('c', [
    killerRow(99171, [
      { by: 'k1', firstDay: 40, deathDay: 41, cause: 'contest', scholar: true },
      { by: 'k2', firstDay: 50, deathDay: 50, cause: 'the arena', scholar: true },
    ], [
      { day: 30, cause: 'monster', monster: 'Big Ugly' }, { day: 35, cause: 'thirst' },
    ], 10),
  ]);
  const a = PB.analyzeDir(dir);
  check('verdict-c-underpowered', a.verdict === 'c-underpowered' && a.ruleA.nPass === false,
    'verdict=' + a.verdict + ' fresh=' + a.freshDeaths);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

// (c) Censored killer (alive at end / village lost) is not a death.
(function () {
  const dir = fixtureCorpus('d', [
    killerRow(99171, [
      { by: 'k1', firstDay: 40, deathDay: null, scholar: true },
    ], [], 10),
  ]);
  const a = PB.analyzeDir(dir);
  check('censored-not-a-death', a.deadKillers === 0 && a.censoredKillers === 1 && a.verdict === 'c-underpowered',
    'dead=' + a.deadKillers + ' censored=' + a.censoredKillers);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

async function liveLegs() {
  // Live harness smoke: 5 days, instrument on, snapshots + no errors.
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const INST = require(path.join(REPO, 'scripts', 'killerdeath-instrument-20261105'));
  const { Game } = await loadGame({ seed: 99171, mode: 'competent-postblood-proof', fullTelemetry: false });
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

  // Neutrality leg: driver off vs on, 10 days, seed 99171, into /tmp.
  const tmp = '/tmp/postblood-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99171', OUTDIR: tmp });
  execSync('node scripts/postblood-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', POSTBLOOD_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/postblood-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'postblood-s99171-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'postblood-s99171-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
