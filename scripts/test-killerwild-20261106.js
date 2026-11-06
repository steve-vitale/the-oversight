// test-killerwild-20261106.js — proof for the killerwild instrument reuse,
// analyzer (death channels + trigger coverage + Stage-1 judge), and
// driver (arm sim-killerwild-b). Fixture classification/coverage/judge
// tests + live harness smoke + off/on neutrality leg (driver subprocesses
// into /tmp, never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-killerwild-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'killerwild-analyze-20261106'));
const KD = require(path.join(REPO, 'scripts', 'killerdeath-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function row(seed, opts) {
  const r = {
    seed: seed, policy: 'baseline', run: 'fixture', days: 100, endReason: 'horizon', won: false, fights: [],
    daily: [{ day: 1, gated: 0, raw: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [],
    killsLive: [], scholarDeaths: [], killerTrack: [], deadMap: {},
    refindStats: { triggerFires: 0, exits: 0, havenHolds: 0, events: [] },
    killerawareStats: null,
    scaleRank: 'village', unlockedWave: 1, maxWave: 1,
  };
  return Object.assign(r, opts || {});
}
function kill(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via || 'player', trick: null }; }
function dead(vid, day, cause, extra) { return Object.assign({ villagerId: vid, day: day, cause: cause || 'the arena', name: vid }, extra || {}); }
function liveKill(d, mid, w, by, scholarChannel) {
  return { day: d, mid: mid, wave: w, by: by, via: 'player', scholarAtKill: scholarChannel ? by : 'someone-else', scholarChannel: !!scholarChannel };
}
function scholarCtx(day, vid, causeArg, atHaven, inCombat, pending) {
  return { day: day, scholarId: vid, causeArg: causeArg, atHaven: atHaven, inCombat: inCombat, pendingEncounter: !!pending };
}
function killerRow(seed, opts) {
  // One scholar killer 'alice', first blood day 40, dead day 45 unless overridden.
  return row(seed, Object.assign({
    waveKillLog: [kill(40, 'the_reunion', 4, 'alice')],
    killsLive: [liveKill(40, 'the_reunion', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the wild')],
    scholarDeaths: [scholarCtx(45, 'alice', 'the wild', false, true, false)],
    fights: [{ day: 45, channel: 'player-tb', mid: 'the_reunion', wave: 4 }],
  }, opts || {}));
}

// 1. Channel TB-wild: scholar dies in combat away from haven.
(function () {
  const c = AN.classifyRow(killerRow(1));
  check('channel-tb-wild', c.killers[0].channel === 'TB-wild', 'got ' + c.killers[0].channel);
})();
// 2. Channel TB-home: scholar dies in combat at haven.
(function () {
  const c = AN.classifyRow(killerRow(2, {
    scholarDeaths: [scholarCtx(45, 'alice', 'the wild', true, true, false)],
  }));
  check('channel-tb-home', c.killers[0].channel === 'TB-home', 'got ' + c.killers[0].channel);
})();
// 3. Channel arena: scholar dies not in combat, cause 'the arena'.
(function () {
  const c = AN.classifyRow(killerRow(3, {
    fallen: [dead('alice', 45, 'the arena')],
    scholarDeaths: [scholarCtx(45, 'alice', 'the arena', true, false, false)],
  }));
  check('channel-arena', c.killers[0].channel === 'arena', 'got ' + c.killers[0].channel);
})();
// 4. Channel expedition.
(function () {
  const c = AN.classifyRow(killerRow(4, {
    fallen: [dead('alice', 45, 'the expedition')],
    scholarDeaths: [scholarCtx(45, 'alice', 'the expedition', true, false, false)],
  }));
  check('channel-expedition', c.killers[0].channel === 'expedition', 'got ' + c.killers[0].channel);
})();
// 5. Channel field: NPC killer, monster-threaded fallen entry, no scholar ctx.
(function () {
  const c = AN.classifyRow(row(5, {
    waveKillLog: [kill(40, 'the_reunion', 4, 'bob')],
    killsLive: [liveKill(40, 'the_reunion', 4, 'bob', false)],
    fallen: [dead('bob', 45, 'monster', { monsterId: 'big_ugly', monsterName: 'Big Ugly' })],
  }));
  check('channel-field', c.killers[0].channel === 'field', 'got ' + c.killers[0].channel);
})();
// 6. Bare 'the wild' with no split evidence stays a residual, never a cause.
(function () {
  const c = AN.classifyRow(row(6, {
    waveKillLog: [kill(40, 'the_reunion', 4, 'alice')],
    killsLive: [liveKill(40, 'the_reunion', 4, 'alice', true)],
    fallen: [dead('alice', 45, 'the wild')],
  }));
  check('wild-residual', c.killers[0].channel === 'the wild (unsplit residual)', 'got ' + c.killers[0].channel);
})();
// 7. Coverage fired-exited: trigger fired on death day, fighter exited.
(function () {
  const c = AN.classifyRow(killerRow(7, {
    refindStats: { triggerFires: 1, exits: 1, havenHolds: 0,
      events: [{ day: 45, mid: 'the_reunion', wave: 4, fighterVid: 'alice', turn: 3, scholarHpFrac: 0.5, monsterHpFrac: 0.9, result: 'exited', exitKind: 'exited-haven', crossings: 0 }] },
  }));
  check('coverage-fired-exited', c.killers[0].triggerCoverage === 'fired-exited', 'got ' + c.killers[0].triggerCoverage);
})();
// 8. Coverage haven-hold.
(function () {
  const c = AN.classifyRow(killerRow(8, {
    scholarDeaths: [scholarCtx(45, 'alice', 'the wild', true, true, false)],
    refindStats: { triggerFires: 1, exits: 0, havenHolds: 1,
      events: [{ day: 45, mid: 'the_reunion', wave: 4, fighterVid: 'alice', turn: 3, scholarHpFrac: 0.5, monsterHpFrac: 0.9, result: 'haven-hold', exitKind: null, crossings: 0 }] },
  }));
  check('coverage-haven-hold', c.killers[0].triggerCoverage === 'haven-hold', 'got ' + c.killers[0].triggerCoverage);
})();
// 9. Coverage died-mid-retreat (open result).
(function () {
  const c = AN.classifyRow(killerRow(9, {
    refindStats: { triggerFires: 1, exits: 0, havenHolds: 0,
      events: [{ day: 45, mid: 'the_reunion', wave: 4, fighterVid: 'alice', turn: 3, scholarHpFrac: 0.5, monsterHpFrac: 0.9, result: 'open', exitKind: null, crossings: 1 }] },
  }));
  check('coverage-died-mid-retreat', c.killers[0].triggerCoverage === 'died-mid-retreat:open', 'got ' + c.killers[0].triggerCoverage);
})();
// 10. Coverage no-fire: w4 TB fight row on death day, no trigger event.
(function () {
  const c = AN.classifyRow(killerRow(10));
  check('coverage-no-fire', c.killers[0].triggerCoverage === 'no-fire', 'got ' + c.killers[0].triggerCoverage);
})();
// 11. Coverage no-fire with a same-day fire by ANOTHER fighter is still
// no-fire (and says so), never silently counted as coverage.
(function () {
  const c = AN.classifyRow(killerRow(11, {
    refindStats: { triggerFires: 1, exits: 0, havenHolds: 0,
      events: [{ day: 45, mid: 'the_reunion', wave: 4, fighterVid: 'mallory', turn: 2, scholarHpFrac: 0.4, monsterHpFrac: 0.95, result: 'open', exitKind: null, crossings: 0 }] },
  }));
  check('coverage-no-fire-other-fighter', c.killers[0].triggerCoverage.indexOf('no-fire') === 0 &&
    c.killers[0].triggerCoverage.indexOf('other-fighter-fire-same-day') > 0, 'got ' + c.killers[0].triggerCoverage);
})();
// 12. Coverage no-tb-fight-near-death: last w4 TB fight 15 days before death.
(function () {
  const c = AN.classifyRow(killerRow(12, {
    fights: [{ day: 30, channel: 'player-tb', mid: 'the_eater', wave: 4 }],
  }));
  check('coverage-no-tb-fight', c.killers[0].triggerCoverage.indexOf('no-tb-fight-near-death') === 0, 'got ' + c.killers[0].triggerCoverage);
})();
// 13. Coverage npc-policy-blind: NPC field killer.
(function () {
  const c = AN.classifyRow(row(13, {
    waveKillLog: [kill(40, 'the_reunion', 4, 'bob')],
    killsLive: [liveKill(40, 'the_reunion', 4, 'bob', false)],
    fallen: [dead('bob', 45, 'monster', { monsterId: 'big_ugly', monsterName: 'Big Ugly' })],
  }));
  check('coverage-npc-blind', c.killers[0].triggerCoverage === 'npc-policy-blind', 'got ' + c.killers[0].triggerCoverage);
})();
// 14. First-killer alive-14d boundary: death 14d after first blood is NOT
// alive at 14d; 15d is; alive-at-end is.
(function () {
  const d14 = AN.classifyRow(killerRow(14, { fallen: [dead('alice', 54, 'the wild')], scholarDeaths: [scholarCtx(54, 'alice', 'the wild', false, true, false)], fights: [{ day: 54, channel: 'player-tb', mid: 'the_reunion', wave: 4 }] }));
  const d15 = AN.classifyRow(killerRow(15, { fallen: [dead('alice', 55, 'the wild')], scholarDeaths: [scholarCtx(55, 'alice', 'the wild', false, true, false)], fights: [{ day: 55, channel: 'player-tb', mid: 'the_reunion', wave: 4 }] }));
  const alive = AN.classifyRow(killerRow(16, { fallen: [], scholarDeaths: [], fights: [] }));
  check('alive14-boundary', d14.firstKillerAlive14d === false && d15.firstKillerAlive14d === true && alive.firstKillerAlive14d === true,
    JSON.stringify({ d14: d14.firstKillerAlive14d, d15: d15.firstKillerAlive14d, alive: alive.firstKillerAlive14d }));
})();
// 15. Determinism.
(function () {
  const r = killerRow(17);
  const a = AN.classifyRow(JSON.parse(JSON.stringify(r)));
  const b = AN.classifyRow(JSON.parse(JSON.stringify(r)));
  check('determinism', JSON.stringify(a) === JSON.stringify(b));
})();

// 16-17. Judge arithmetic on mini-corpora written to /tmp (never evidence/).
function miniRow(seed, run, firstKillDay, deathDay, days) {
  const r = row(seed, { run: run, days: days, endReason: 'horizon' });
  if (firstKillDay != null) {
    r.waveKillLog = [kill(firstKillDay, 'the_reunion', 4, 'alice')];
    r.killsLive = [liveKill(firstKillDay, 'the_reunion', 4, 'alice', true)];
    if (deathDay != null) {
      r.fallen = [dead('alice', deathDay, 'the wild')];
      r.scholarDeaths = [scholarCtx(deathDay, 'alice', 'the wild', false, true, false)];
      r.fights = [{ day: deathDay, channel: 'player-tb', mid: 'the_reunion', wave: 4 }];
    }
  }
  return r;
}
function writeCorpus(dir, run, rows) {
  fs.mkdirSync(dir, { recursive: true });
  rows.forEach(function (r) {
    fs.writeFileSync(path.join(dir, 'killerwild-s' + r.seed + '-' + run + '.json'), JSON.stringify(r, null, 2) + '\n');
  });
}
(function () {
  const tmp = '/tmp/killerwild-judge-' + process.pid;
  const bDir = path.join(tmp, 'baseline');
  const aDir = path.join(tmp, 'armed');
  // Baseline: 0/2 first killers alive 14d (one dies 2d after blood, one seed killerless).
  writeCorpus(bDir, 'killerwild-baseline', [miniRow(56001, 'killerwild-baseline', 40, 42, 60), miniRow(56002, 'killerwild-baseline', null, null, 50)]);
  // Armed: 2/2 alive 14d (one lives, one dies 20d after blood) -> diff +2, guards hold -> GO.
  writeCorpus(aDir, 'killerwild-armed', [miniRow(56001, 'killerwild-armed', 40, null, 60), miniRow(56002, 'killerwild-armed', 40, 60, 50)]);
  const j = AN.judge(bDir, aDir);
  check('judge-go', j.verdict === 'GO' && j.primary.diff === 2 && j.primary.baseline === 0 && j.primary.armed === 2,
    JSON.stringify(j.verdict) + ' diff=' + j.primary.diff);
  // Armed with only 1/2 alive 14d -> diff +1 -> NO-GO.
  const aDir2 = path.join(tmp, 'armed2');
  writeCorpus(aDir2, 'killerwild-armed', [miniRow(56001, 'killerwild-armed', 40, null, 60), miniRow(56002, 'killerwild-armed', 40, 42, 50)]);
  const j2 = AN.judge(bDir, aDir2);
  check('judge-nogo-diff1', j2.verdict === 'NO-GO' && j2.primary.diff === 1, JSON.stringify(j2.verdict) + ' diff=' + j2.primary.diff);
  // Kill guard: armed kills 0 vs baseline 1 -> ratio 0 < 0.5 -> NO-GO even with diff +2.
  const aDir3 = path.join(tmp, 'armed3');
  const noKill = miniRow(56001, 'killerwild-armed', null, null, 60);
  const noKill2 = miniRow(56002, 'killerwild-armed', null, null, 50);
  writeCorpus(aDir3, 'killerwild-armed', [noKill, noKill2]);
  const j3 = AN.judge(bDir, aDir3);
  check('judge-nogo-killguard', j3.verdict === 'NO-GO' && j3.guardKills.holds === false,
    JSON.stringify(j3.verdict) + ' killRatio=' + j3.guardKills.ratio);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
})();

async function liveLegs() {
  // Live smoke: driver subprocess, seed 56001, 150d, baseline policy,
  // OUTDIR /tmp. Instrument fires: snapshots, fights, refind stats, 0 errors.
  const tmp = '/tmp/killerwild-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '150', SEEDS: '56001', OUTDIR: tmp });
  execSync('node scripts/killerwild-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'killerwild-proof-smoke' }), stdio: 'pipe' });
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'killerwild-s56001-killerwild-proof-smoke.json'), 'utf8'));
  check('live-smoke', on.days > 0 && on.daily.length > 0 && Array.isArray(on.fights) &&
    on.refindStats && typeof on.refindStats.triggerFires === 'number' &&
    on.instrumentErrors.length === 0 && on.anchorCommit && on.anchorCommit.length >= 7,
    'days=' + on.days + ' snaps=' + on.daily.length + ' fights=' + on.fights.length +
    ' rfFires=' + (on.refindStats && on.refindStats.triggerFires) + ' errs=' + JSON.stringify(on.instrumentErrors));
  // Neutrality leg: instrument OFF vs ON, same seed, 150d. The instrument
  // is pure-read, so days/endReason/wave-4 kills must match exactly.
  execSync('node scripts/killerwild-driver-20261106.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'killerwild-proof-off', KILLERWILD_OFF: '1' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'killerwild-s56001-killerwild-proof-off.json'), 'utf8'));
  const w4 = function (r) { return (r.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length; };
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason && w4(off) === w4(on),
    'off=' + off.days + '/' + off.endReason + '/w4kills=' + w4(off) +
    ' on=' + on.days + '/' + on.endReason + '/w4kills=' + w4(on));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
