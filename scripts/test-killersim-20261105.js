// test-killersim-20261105.js — proof for the killersim instrument,
// analyzer, and verdict rules (arm sim-killersim-a). Fixture fate /
// L(d) / mechanism / verdict tests + live harness smoke + live
// determinism leg + off/on neutrality leg (driver subprocesses into
// /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-killersim-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'killersim-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function row(seed, opts) {
  const r = {
    seed: seed, policy: 'baseline', run: 'fixture', days: 100, endReason: 'horizon', won: false, fights: [],
    daily: [{ day: 1, gated: 0, raw: 0, readiness5: { veterans: 0, ready: false, short: [] } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    killsLive: [], scholarDeaths: [], killerTrack: [], deadMap: {},
    exiles: [], scaleRank: 'village', unlockedWave: 1, maxWave: 1,
  };
  return Object.assign(r, opts || {});
}
function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'player', trick: null }; }
function dead(vid, day, cause, extra) { return Object.assign({ villagerId: vid, day: day, cause: cause || 'the arena', name: vid }, extra || {}); }
function liveKill(d, mid, w, by, scholarChannel) {
  return { day: d, mid: mid, wave: w, by: by, via: 'player', scholarAtKill: scholarChannel ? by : 'someone-else', scholarChannel: !!scholarChannel };
}
function snap(day, vets, ready) {
  return { day: day, gated: 0, raw: 0, readiness5: { veterans: vets, ready: !!ready, short: [] }, livingKillersDerived: null };
}
function daysRange(a, b, vetsFn, readyFn) {
  const out = [];
  for (let d = a; d <= b; d++) out.push(snap(d, vetsFn ? vetsFn(d) : 0, readyFn ? readyFn(d) : false));
  return out;
}

// 1. Died-in-fight: monster-threaded fallen entry.
(function () {
  const c = AN.analyzeSeed(row(1, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'combat', { monsterId: 'the_eater', monsterName: 'The Eater' })],
    daily: [snap(40, 1, false), snap(45, 0, false), snap(100, 0, false)],
  }));
  const k = c.killers[0];
  check('fate-died-in-fight', k.fate === 'died-in-fight' && k.exitDay === 45 && k.survivalDays === 5, JSON.stringify(k.fate));
})();
// 2. Died-away: non-combat fallen cause, no monster thread.
(function () {
  const c = AN.analyzeSeed(row(2, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 52, 'thirst')],
    daily: [snap(40, 1, false), snap(52, 0, false), snap(100, 0, false)],
  }));
  const k = c.killers[0];
  check('fate-died-away', k.fate === 'died-away' && k.exitDay === 52 && k.survivalDays === 12, JSON.stringify(k.fate));
})();
// 3. Exiled: exile earlier than any death.
(function () {
  const c = AN.analyzeSeed(row(3, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    exiles: [{ vid: 'alice', day: 48, how: 'exiled' }],
    daily: [snap(40, 1, false), snap(48, 0, false), snap(100, 0, false)],
  }));
  const k = c.killers[0];
  check('fate-exiled', k.fate === 'exiled' && k.exitDay === 48 && k.survivalDays === 8, JSON.stringify(k.fate));
})();
// 4. Other removal is 'left:<how>', never folded into 'exiled'.
(function () {
  const c = AN.analyzeSeed(row(4, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    exiles: [{ vid: 'alice', day: 48, how: 'fled' }],
    daily: [snap(40, 1, false), snap(48, 0, false), snap(100, 0, false)],
  }));
  check('fate-left-fled', c.killers[0].fate === 'left:fled', JSON.stringify(c.killers[0].fate));
})();
// 5. Still-living: no death, no exile.
(function () {
  const c = AN.analyzeSeed(row(5, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    daily: [snap(40, 1, false), snap(100, 1, false)],
  }));
  const k = c.killers[0];
  check('fate-still-living', k.fate === 'still-living' && k.exitDay == null && k.survivalDays == null, JSON.stringify(k.fate));
})();
// 6. Exile before death wins (earliest exit).
(function () {
  const c = AN.analyzeSeed(row(6, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 60, 'thirst')],
    exiles: [{ vid: 'alice', day: 48, how: 'exiled' }],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('exile-before-death', c.killers[0].fate === 'exiled' && c.killers[0].exitDay === 48, JSON.stringify(c.killers[0].fate));
})();
// 7. Death before exile wins.
(function () {
  const c = AN.analyzeSeed(row(7, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'combat', { monsterId: 'the_eater', monsterName: 'The Eater' })],
    exiles: [{ vid: 'alice', day: 60, how: 'exiled' }],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('death-before-exile', c.killers[0].fate === 'died-in-fight' && c.killers[0].exitDay === 45, JSON.stringify(c.killers[0].fate));
})();
// 8. L(d): two killers overlapping give L>=2 days; exit ends the count.
(function () {
  const c = AN.analyzeSeed(row(8, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(50, 'w4b', 4, 'bob', false)],
    fallen: [dead('alice', 60, 'thirst')],
    daily: daysRange(40, 70, function (d) { return d < 50 ? 1 : (d < 60 ? 2 : 1); }, function () { return false; }),
  }));
  check('living-counts', c.maxLiving === 2 && c.daysL2 === 10 && c.longestL2Run === 10 && c.daysL1 === 21,
    JSON.stringify({ max: c.maxLiving, l2: c.daysL2, run: c.longestL2Run, l1: c.daysL1 }));
})();
// 9. Same-day kill-and-die contributes to NO day.
(function () {
  const c = AN.analyzeSeed(row(9, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(40, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(40, 'w4b', 4, 'bob', false)],
    fallen: [dead('alice', 40), dead('bob', 40)],
    daily: [snap(40, 0, false), snap(41, 0, false)],
  }));
  check('same-day-fleeting', c.maxLiving === 0 && c.daysL2 === 0 && c.daysL1 === 0, JSON.stringify({ max: c.maxLiving }));
})();
// 10. M1 dies-fast: first-killer survival <= 14.
(function () {
  const c = AN.analyzeSeed(row(10, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'thirst')],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('m1-dies-fast', c.m1 === true && c.mechanisms.indexOf('M1-dies-fast') >= 0 && c.m4 === false, JSON.stringify(c.mechanisms));
})();
// 11. M2 never-arrives: exactly 1 killer ever despite >= 5 w4 fights.
(function () {
  const fights = [];
  for (let i = 0; i < 6; i++) fights.push({ day: 50 + i, channel: 'field', fighter: 'carol', fighters: ['carol'], mid: 'the_eater', wave: 4 });
  const c = AN.analyzeSeed(row(11, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fights: fights,
    daily: [snap(40, 1, false), snap(100, 1, false)],
  }));
  check('m2-never-arrives', c.m2 === true && c.mechanisms.indexOf('M2-never-arrives') >= 0, JSON.stringify(c.mechanisms));
})();
// 12. M3 clusters: one killer holds all kills, >= 2 other fighters fought w4.
(function () {
  const c = AN.analyzeSeed(row(12, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(50, 'w4b', 4, 'alice', true)],
    fights: [
      { day: 40, channel: 'field', fighter: 'alice', fighters: ['alice', 'xena'], mid: 'w4a', wave: 4 },
      { day: 50, channel: 'field', fighter: 'alice', fighters: ['alice', 'yuki'], mid: 'w4b', wave: 4 },
      { day: 60, channel: 'field', fighter: 'xena', fighters: ['xena'], mid: 'w4c', wave: 4 },
    ],
    daily: [snap(40, 1, false), snap(100, 1, false)],
  }));
  check('m3-clusters', c.m3 === true && c.topShare === 1 && c.otherFighters === 2, JSON.stringify({ share: c.topShare, others: c.otherFighters }));
})();
// 13. M4 made-late: first kill within the last 30 days of the run.
(function () {
  const c = AN.analyzeSeed(row(13, {
    waveKillLog: [kill(80, 'w4a', 4, 'alice')],
    killsLive: [liveKill(80, 'w4a', 4, 'alice', true)],
    daily: [snap(80, 1, false), snap(100, 1, false)],
  }));
  check('m4-made-late', c.m4 === true && c.mechanisms.indexOf('M4-made-late') >= 0, JSON.stringify(c.mechanisms));
})();
// 14. Analyzer determinism (pure function, same row twice).
(function () {
  const r = row(14, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(50, 'w4b', 4, 'bob', false)],
    daily: daysRange(40, 60, function (d) { return d < 50 ? 1 : 2; }, function () { return false; }),
  });
  const a = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  const b = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('determinism', JSON.stringify(a) === JSON.stringify(b));
})();
// 15. Median rule: >= 3 observed exits -> median; fewer -> null.
(function () {
  check('median-three', AN.median([5, 12, 30]) === 12 && AN.median([5, 12]) === 8.5);
})();

function writeDir(dir, rows) {
  fs.mkdirSync(dir, { recursive: true });
  rows.forEach(function (r) {
    fs.writeFileSync(path.join(dir, 'killersim-s' + r.seed + '-fixture.json'), JSON.stringify(r, null, 2) + '\n');
  });
}
function goSeed(seed) {
  // One killer, dies fast (M1), no pair, long run so M4 is false.
  return row(seed, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'thirst')],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  });
}
function noKillSeed(seed) { return row(seed, { daily: [snap(1, 0, false), snap(100, 0, false)] }); }
function pairSeed(seed) {
  // Sustained pair, no mechanism: kills day 40 + 45, both alive, run to
  // day 100 (M4 false: 40 < 70), 1 kill each (M3 false: share 0.5).
  return row(seed, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(45, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(45, 'w4b', 4, 'bob', false)],
    daily: daysRange(40, 100, function (d) { return d < 45 ? 1 : 2; }, function () { return false; }),
  });
}

// 16. Verdict GO: gap confirmed + a named mechanism on fresh seeds.
(function () {
  const dir = '/tmp/killersim-proof-' + process.pid + '/verdict-go';
  writeDir(dir, [goSeed(1), goSeed(2), goSeed(3), goSeed(4), noKillSeed(5), noKillSeed(6), noKillSeed(7), noKillSeed(8)]);
  const out = AN.analyzeDir(dir);
  check('verdict-go', out.verdict === 'DIAG-GO' && out.bankingSeeds === 4, out.verdict + ' :: ' + out.verdictReason);
})();
function plainSeed(seed) {
  // One killer, alive at end, no fights, long run: no mechanism fires
  // (M1 censored, M2 needs >= 5 fights, M3 needs >= 2 other fighters,
  // M4 needs firstDay >= endDay - 30).
  return row(seed, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    daily: [snap(40, 1, false), snap(100, 1, false)],
  });
}

// 17. Verdict NO: two sustained pairs, no mechanism visible.
(function () {
  const dir = '/tmp/killersim-proof-' + process.pid + '/verdict-no';
  writeDir(dir, [pairSeed(1), pairSeed(2), plainSeed(3), plainSeed(4), noKillSeed(5), noKillSeed(6), noKillSeed(7), noKillSeed(8)]);
  const out = AN.analyzeDir(dir);
  check('verdict-no', out.verdict === 'DIAG-NO' && out.sustainedPairSeeds.length === 2, out.verdict + ' :: ' + out.verdictReason);
})();
// 18. Verdict UNDERPOWERED: fewer than 4 banking seeds.
(function () {
  const dir = '/tmp/killersim-proof-' + process.pid + '/verdict-under';
  writeDir(dir, [goSeed(1), goSeed(2), noKillSeed(3), noKillSeed(4), noKillSeed(5), noKillSeed(6), noKillSeed(7), noKillSeed(8)]);
  const out = AN.analyzeDir(dir);
  check('verdict-underpowered', out.verdict === 'UNDERPOWERED', out.verdict + ' :: ' + out.verdictReason);
})();
// 19. Verdict INSUFFICIENT-DATA: > 2 seeds with instrument errors.
(function () {
  const dir = '/tmp/killersim-proof-' + process.pid + '/verdict-insuff';
  const bad = [goSeed(1), goSeed(2), goSeed(3)];
  bad.forEach(function (r) { r.instrumentErrors = ['boom']; });
  writeDir(dir, bad.concat([goSeed(4), noKillSeed(5), noKillSeed(6), noKillSeed(7), noKillSeed(8)]));
  const out = AN.analyzeDir(dir);
  check('verdict-insufficient', out.verdict === 'INSUFFICIENT-DATA', out.verdict + ' :: ' + out.verdictReason);
})();
// 20. First-killer survival median: exit-based vs death-based differ
// when a killer is exiled (exit ends survival, death never comes).
(function () {
  const dir = '/tmp/killersim-proof-' + process.pid + '/verdict-median';
  const a = goSeed(1); // death survival 5
  const b = row(2, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    exiles: [{ vid: 'alice', day: 52, how: 'exiled' }],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }); // exit survival 12, death survival null
  const c = row(3, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 70, 'thirst')],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }); // death survival 30
  const d = goSeed(4);
  writeDir(dir, [a, b, c, d, noKillSeed(5), noKillSeed(6), noKillSeed(7), noKillSeed(8)]);
  const out = AN.analyzeDir(dir);
  check('median-exit-vs-death', JSON.stringify(out.firstKillerSurvivalExit.intervals) === JSON.stringify([5, 12, 30, 5]) &&
    out.firstKillerSurvivalExit.median === 8.5 &&
    JSON.stringify(out.firstKillerSurvivalDeath.intervals) === JSON.stringify([5, 30, 5]) &&
    out.firstKillerSurvivalDeath.median === 5,
    JSON.stringify({ exit: out.firstKillerSurvivalExit, death: out.firstKillerSurvivalDeath }));
})();

async function liveLegs() {
  // Live smoke: driver 5d, seed 99211, into /tmp. Exiles array present,
  // daily entries carry livingKillersDerived, 0 instrument errors.
  const tmp = '/tmp/killersim-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '5', SEEDS: '99211', OUTDIR: tmp });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-smoke' }), stdio: 'pipe' });
  const smoke = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99211-proof-smoke.json'), 'utf8'));
  check('live-smoke', smoke.instrumentErrors.length === 0 && Array.isArray(smoke.exiles) &&
    smoke.daily.length > 0 && smoke.daily.every(function (s) { return s.livingKillersDerived != null; }) &&
    smoke.daily.every(function (s) { return s.ready5 != null; }),
    'errs=' + JSON.stringify(smoke.instrumentErrors) + ' days=' + smoke.daily.length);
  // Live determinism: same seed twice at 10d, same summary.
  const env10 = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99211', OUTDIR: tmp });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env10, { RUN: 'proof-det-a' }), stdio: 'pipe' });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env10, { RUN: 'proof-det-b' }), stdio: 'pipe' });
  const da = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99211-proof-det-a.json'), 'utf8'));
  const db = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99211-proof-det-b.json'), 'utf8'));
  check('live-determinism', da.days === db.days && da.endReason === db.endReason &&
    (da.waveKillLog || []).length === (db.waveKillLog || []).length &&
    (da.fights || []).length === (db.fights || []).length &&
    (da.daily || []).length === (db.daily || []).length,
    'a=' + da.days + '/' + da.endReason + ' b=' + db.days + '/' + db.endReason);
  // Neutrality leg: driver off vs on, 10 days, seed 99211, into /tmp.
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env10, { RUN: 'proof-off', KILLERSIM_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env10, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99211-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99211-proof-on.json'), 'utf8'));
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
