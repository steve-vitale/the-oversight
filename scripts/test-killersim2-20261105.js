// test-killersim2-20261105.js — proof for the killersim2 analyzer
// (arm sim-killersim2-b). Fixture tests for the banking definition,
// the M3 n>=2 guard, post-first-blood counting, death channels, and
// the 32-seed screen verdict rules, plus live harness smoke +
// determinism + off/on neutrality legs (driver subprocesses into
// /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-killersim2-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'killersim-analyze-20261105'));
const K2 = require(path.join(REPO, 'scripts', 'killersim2-analyze-20261105'));

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
function scholarDeath(vid, day, causeArg, atHaven, inCombat) {
  return { day: day, scholarId: vid, causeArg: causeArg, atHaven: !!atHaven, inCombat: !!inCombat, pendingEncounter: false };
}
function oneKiller(seed, firstDay, exit) {
  // exit: null | {kind:'death', day, cause, extra} | {kind:'exile', day, how}
  const opts = {
    waveKillLog: [kill(firstDay, 'w4a', 4, 'alice')],
    killsLive: [liveKill(firstDay, 'w4a', 4, 'alice', true)],
    daily: [snap(firstDay, 1, false), snap(100, 1, false)],
  };
  if (exit && exit.kind === 'death') opts.fallen = [dead('alice', exit.day, exit.cause || 'the arena', exit.extra || {})];
  if (exit && exit.kind === 'exile') opts.exiles = [{ vid: 'alice', day: exit.day, how: exit.how || 'exiled' }];
  return row(seed, opts);
}

// 1. Banking: same-day kill-and-die does NOT bank.
(function () {
  const c = AN.analyzeSeed(oneKiller(1, 40, { kind: 'death', day: 40 }));
  check('banking-same-day-death', K2.seedBanks(c) === false && c.killers[0].survivalDays === 0, JSON.stringify(c.killers[0].survivalDays));
})();
// 2. Banking: death the next day DOES bank (alive at end of kill day).
(function () {
  const c = AN.analyzeSeed(oneKiller(2, 40, { kind: 'death', day: 41 }));
  check('banking-next-day-death', K2.seedBanks(c) === true && c.killers[0].survivalDays === 1, JSON.stringify(c.killers[0].survivalDays));
})();
// 3. Banking: no exit (censored) banks.
(function () {
  const c = AN.analyzeSeed(oneKiller(3, 40, null));
  check('banking-censored', K2.seedBanks(c) === true && c.killers[0].survivalDays == null, JSON.stringify(c.killers[0].survivalDays));
})();
// 4. Banking: same-day exile does NOT bank.
(function () {
  const c = AN.analyzeSeed(oneKiller(4, 40, { kind: 'exile', day: 40 }));
  check('banking-same-day-exile', K2.seedBanks(c) === false && c.killers[0].survivalDays === 0, JSON.stringify(c.killers[0].survivalDays));
})();
// 5. Banking: exile the next day DOES bank.
(function () {
  const c = AN.analyzeSeed(oneKiller(5, 40, { kind: 'exile', day: 41 }));
  check('banking-next-day-exile', K2.seedBanks(c) === true && c.killers[0].survivalDays === 1, JSON.stringify(c.killers[0].survivalDays));
})();
// 6. Channel: scholar-death arena -> contest/arena.
(function () {
  const c = AN.analyzeSeed(row(6, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the arena')],
    scholarDeaths: [scholarDeath('alice', 45, 'arena', true, true)],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('channel-arena', K2.deathChannel(c.killers[0]) === 'contest/arena', JSON.stringify(c.killers[0].deathCauseSplit));
})();
// 6b. Channel: the game passes causeArg WITH the article ('the arena',
// not 'arena') — the channel must still be contest/arena.
(function () {
  const c = AN.analyzeSeed(row(61, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the arena')],
    scholarDeaths: [scholarDeath('alice', 45, 'the arena', true, true)],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('channel-arena-article', K2.deathChannel(c.killers[0]) === 'contest/arena', JSON.stringify(c.killers[0].deathCauseSplit));
})();
// 6c. Channel: bare raw cause 'the arena' with no scholarDeath record.
(function () {
  const c = AN.analyzeSeed(row(62, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the arena')],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('channel-bare-arena', K2.deathChannel(c.killers[0]) === 'contest/arena', JSON.stringify(c.killers[0].deathCauseSplit));
})();
// 7. Channel: scholar-death expedition at haven, not in combat -> other:expedition.
(function () {
  const c = AN.analyzeSeed(row(7, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the expedition')],
    scholarDeaths: [scholarDeath('alice', 45, 'expedition', true, false)],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('channel-expedition', K2.deathChannel(c.killers[0]) === 'other:expedition', JSON.stringify(c.killers[0].deathCauseSplit));
})();
// 8. Channel: monster-threaded fallen entry -> wild.
(function () {
  const c = AN.analyzeSeed(row(8, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'combat', { monsterId: 'big_ugly', monsterName: 'Big Ugly' })],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('channel-monster', K2.deathChannel(c.killers[0]) === 'wild', JSON.stringify(c.killers[0].deathCauseSplit));
})();
// 9. Channel: bare 'the wild' with no split evidence stays a labelled residual inside wild.
(function () {
  const c = AN.analyzeSeed(row(9, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the wild')],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('channel-wild-residual', K2.deathChannel(c.killers[0]) === 'wild (unsplit residual)', JSON.stringify(c.killers[0].deathCauseSplit));
})();
// 10. Channel: scholar-death 'the wild' -> wild.
(function () {
  const c = AN.analyzeSeed(row(10, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the wild')],
    scholarDeaths: [scholarDeath('alice', 45, 'the wild', false, true)],
    daily: [snap(40, 1, false), snap(100, 0, false)],
  }));
  check('channel-scholar-wild', K2.deathChannel(c.killers[0]) === 'wild', JSON.stringify(c.killers[0].deathCauseSplit));
})();
// 11. Channel: still-living and exiled killers have NO death channel.
(function () {
  const alive = AN.analyzeSeed(oneKiller(11, 40, null));
  const exiled = AN.analyzeSeed(oneKiller(12, 40, { kind: 'exile', day: 48 }));
  check('channel-none', K2.deathChannel(alive.killers[0]) == null && K2.deathChannel(exiled.killers[0]) == null,
    JSON.stringify({ alive: K2.deathChannel(alive.killers[0]), exiled: K2.deathChannel(exiled.killers[0]) }));
})();
// 12. M3 guard: at n=1 the base analyzer fires M3 but the guarded list must NOT.
(function () {
  const c = AN.analyzeSeed(row(13, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    fights: [
      { day: 40, channel: 'field', fighter: 'alice', fighters: ['alice', 'xena'], mid: 'w4a', wave: 4 },
      { day: 50, channel: 'field', fighter: 'alice', fighters: ['alice', 'yuki'], mid: 'w4b', wave: 4 },
      { day: 60, channel: 'field', fighter: 'xena', fighters: ['xena'], mid: 'w4c', wave: 4 },
    ],
    daily: [snap(40, 1, false), snap(100, 1, false)],
  }));
  check('m3-guard-n1', c.m3 === true && K2.guardedMechanisms(c).indexOf('M3-clusters') < 0,
    JSON.stringify({ base: c.m3, guarded: K2.guardedMechanisms(c) }));
})();
// 13. M3 guard: at n>=2 kills the clustering pattern is kept.
(function () {
  const c = AN.analyzeSeed(row(14, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(50, 'w4b', 4, 'alice', true)],
    fights: [
      { day: 40, channel: 'field', fighter: 'alice', fighters: ['alice', 'xena'], mid: 'w4a', wave: 4 },
      { day: 50, channel: 'field', fighter: 'alice', fighters: ['alice', 'yuki'], mid: 'w4b', wave: 4 },
      { day: 60, channel: 'field', fighter: 'xena', fighters: ['xena'], mid: 'w4c', wave: 4 },
    ],
    daily: [snap(40, 1, false), snap(100, 1, false)],
  }));
  check('m3-guard-n2', K2.guardedMechanisms(c).indexOf('M3-clusters') >= 0,
    JSON.stringify(K2.guardedMechanisms(c)));
})();
// 14. Post-first-blood: only fights/kills strictly after the first kill day count.
(function () {
  const r = row(15, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(55, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(55, 'w4b', 4, 'bob', false)],
    fights: [
      { day: 39, channel: 'field', fighter: 'alice', fighters: ['alice'], mid: 'w4a', wave: 4 },
      { day: 40, channel: 'field', fighter: 'alice', fighters: ['alice'], mid: 'w4a', wave: 4 },
      { day: 50, channel: 'field', fighter: 'alice', fighters: ['alice'], mid: 'w4b', wave: 4 },
      { day: 60, channel: 'player-tb', fighter: 'bob', fighters: ['bob'], mid: 'w4c', wave: 4 },
    ],
    daily: [snap(40, 1, false), snap(100, 2, false)],
  });
  const c = AN.analyzeSeed(r);
  const pb = K2.postBloodRow(r, c);
  check('postblood-counts', pb.fights === 2 && pb.kills === 1 && pb.killRate === 0.5, JSON.stringify(pb));
})();
// 15. Analyzer determinism (pure function, same row twice).
(function () {
  const r = row(16, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(50, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(50, 'w4b', 4, 'bob', false)],
    daily: daysRange(40, 60, function (d) { return d < 50 ? 1 : 2; }, function () { return false; }),
  });
  const a = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  const b = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('determinism', JSON.stringify(a) === JSON.stringify(b));
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
function plainSeed(seed) {
  // One killer, alive at end, no fights, long run: no mechanism fires.
  return row(seed, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true)],
    daily: [snap(40, 1, false), snap(100, 1, false)],
  });
}
function pairSeed(seed) {
  // Sustained pair, no mechanism: kills day 40 + 45, both alive, run to
  // day 100 (M4 false: 40 < 70), 1 kill each (M3 false: share 0.5).
  return row(seed, {
    waveKillLog: [kill(40, 'w4a', 4, 'alice'), kill(45, 'w4b', 4, 'bob')],
    killsLive: [liveKill(40, 'w4a', 4, 'alice', true), liveKill(45, 'w4b', 4, 'bob', false)],
    daily: daysRange(40, 100, function (d) { return d < 45 ? 1 : 2; }, function () { return false; }),
  });
}
function pad32(rows) {
  // Fill a fixture band out to 32 seeds with no-kill seeds.
  const out = rows.slice();
  let s = 100;
  while (out.length < 32) { out.push(noKillSeed(s)); s++; }
  return out;
}

// 16. Verdict GO on a 32-seed screen: 4 banking seeds, gap confirmed, M1 holds.
(function () {
  const dir = '/tmp/killersim2-proof-' + process.pid + '/verdict-go';
  writeDir(dir, pad32([goSeed(1), goSeed(2), goSeed(3), goSeed(4)]));
  const out = K2.analyzeDir(dir);
  check('verdict-go-32', out.verdict === 'DIAG-GO' && out.bankingSeeds === 4 && out.n === 32, out.verdict + ' :: ' + out.verdictReason);
})();
// 17. Verdict UNDERPOWERED: only 3 banking seeds on a 32-seed screen.
(function () {
  const dir = '/tmp/killersim2-proof-' + process.pid + '/verdict-under';
  writeDir(dir, pad32([goSeed(1), goSeed(2), goSeed(3)]));
  const out = K2.analyzeDir(dir);
  check('verdict-underpowered-32', out.verdict === 'UNDERPOWERED' && out.bankingSeeds === 3, out.verdict + ' :: ' + out.verdictReason);
})();
// 18. Verdict NO: two sustained pairs on the banking subset, no mechanism.
(function () {
  const dir = '/tmp/killersim2-proof-' + process.pid + '/verdict-no';
  writeDir(dir, pad32([pairSeed(1), pairSeed(2), plainSeed(3), plainSeed(4)]));
  const out = K2.analyzeDir(dir);
  check('verdict-no-32', out.verdict === 'DIAG-NO' && out.sustainedBankingSeeds.length === 2, out.verdict + ' :: ' + out.verdictReason);
})();
// 19. Verdict INSUFFICIENT-DATA: > 2 screen seeds with instrument errors.
(function () {
  const dir = '/tmp/killersim2-proof-' + process.pid + '/verdict-insuff';
  const bad = [goSeed(1), goSeed(2), goSeed(3)];
  bad.forEach(function (r) { r.instrumentErrors = ['boom']; });
  writeDir(dir, pad32([bad[0], bad[1], bad[2], goSeed(4)]));
  const out = K2.analyzeDir(dir);
  check('verdict-insufficient-32', out.verdict === 'INSUFFICIENT-DATA', out.verdict + ' :: ' + out.verdictReason);
})();
// 20. Stage-2 M3: two multi-killer banking seeds counted; post-blood pooled.
(function () {
  const dir = '/tmp/killersim2-proof-' + process.pid + '/stage2-m3';
  const multi = pairSeed(1);
  multi.fights = [{ day: 50, channel: 'field', fighter: 'alice', fighters: ['alice'], mid: 'w4c', wave: 4 }];
  const multi2 = pairSeed(2);
  multi2.fights = [{ day: 50, channel: 'field', fighter: 'bob', fighters: ['bob'], mid: 'w4c', wave: 4 }];
  writeDir(dir, pad32([multi, multi2, plainSeed(3), plainSeed(4)]));
  const out = K2.analyzeDir(dir);
  check('stage2-m3', out.stage2.m3MultiKillerBankingSeeds === 2 && out.stage2.m3PostBloodFights === 2 && out.stage2.m3PostBloodKills === 2,
    JSON.stringify(out.stage2));
})();
// 21. Same-day kill-and-die seed is NOT a banking seed even though it has a killer.
(function () {
  const dir = '/tmp/killersim2-proof-' + process.pid + '/banking-sameday';
  const fleeting = oneKiller(1, 40, { kind: 'death', day: 40 });
  writeDir(dir, pad32([fleeting, goSeed(2), goSeed(3), goSeed(4)]));
  const out = K2.analyzeDir(dir);
  check('banking-excludes-fleeting', out.bankingSeeds === 3 && out.verdict === 'UNDERPOWERED',
    JSON.stringify({ banking: out.bankingSeeds, verdict: out.verdict }));
})();

async function liveLegs() {
  // Live smoke: driver 5d, seed 99311, into /tmp. Exiles array present,
  // daily entries carry livingKillersDerived, 0 instrument errors.
  const tmp = '/tmp/killersim2-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '5', SEEDS: '99311', OUTDIR: tmp });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-smoke' }), stdio: 'pipe' });
  const smoke = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99311-proof-smoke.json'), 'utf8'));
  check('live-smoke', smoke.instrumentErrors.length === 0 && Array.isArray(smoke.exiles) &&
    smoke.daily.length > 0 && smoke.daily.every(function (s) { return s.livingKillersDerived != null; }) &&
    smoke.daily.every(function (s) { return s.ready5 != null; }),
    'errs=' + JSON.stringify(smoke.instrumentErrors) + ' days=' + smoke.daily.length);
  // Live determinism: same seed twice at 10d, same summary.
  const env10 = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99311', OUTDIR: tmp });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env10, { RUN: 'proof-det-a' }), stdio: 'pipe' });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env10, { RUN: 'proof-det-b' }), stdio: 'pipe' });
  const da = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99311-proof-det-a.json'), 'utf8'));
  const db = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99311-proof-det-b.json'), 'utf8'));
  check('live-determinism', da.days === db.days && da.endReason === db.endReason &&
    (da.waveKillLog || []).length === (db.waveKillLog || []).length &&
    (da.fights || []).length === (db.fights || []).length &&
    (da.daily || []).length === (db.daily || []).length,
    'a=' + da.days + '/' + da.endReason + ' b=' + db.days + '/' + db.endReason);
  // Neutrality leg: driver off vs on, 30 days, seed 99311, into /tmp.
  const env30 = Object.assign({}, process.env, { REPO: REPO, DAYS: '30', SEEDS: '99311', OUTDIR: tmp });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env30, { RUN: 'proof-off', KILLERSIM_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/killersim-driver-20261105.js', { cwd: REPO, env: Object.assign({}, env30, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99311-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'killersim-s99311-proof-on.json'), 'utf8'));
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
