// test-firstkiller-20261107.js — proof for the first-killer death
// classification (arm sim-firstkiller-b). Fixtures prove every channel
// branch, the pyrrhic log-read rule, and second-killer gap math; the
// corpus section pins the analyzer over the FROZEN stageally-confirm2
// corpus (evidence/2026-11-07/perseed-stageally-confirm2-b, band
// 53001-53008) so analyzer drift is caught; live legs to /tmp prove the
// driver installs, is deterministic, and is neutral (instrument off vs
// on). No judged sims run here; the judged band is re-run from scratch
// by the driver after this test goes green.
// Usage: node scripts/test-firstkiller-20261107.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'firstkiller-analyze-20261107'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(name, got, want) { check(name, got === want, { got: got, want: want }); }

// --- fixture builder -------------------------------------------------------
function dailyRows(days, scholarId) {
  const out = [];
  for (let d = 1; d <= days; d++) {
    out.push({ day: d, scholarId: scholarId, rosterSize: 10, living: 10,
      readiness5: { veterans: 1 }, w4kills: 1, w4killers: 1, partySize: 0, partyIds: [] });
  }
  return out;
}
function baseRow(over) {
  const row = {
    seed: 1, policy: 'baseline', run: 'fixture', days: 30, endReason: 'survived',
    won: false, scaleRank: 'village', maxWave: 4, unlockedWave: 4, standing: 150,
    waveKillLog: [], killsLive: [], fallen: [], scholarDeaths: [], deadMap: {},
    killerTrack: [], daily: [], tbFights: [], fights: [], instrumentErrors: [],
  };
  return Object.assign(row, over || {});
}
function killEntry(day, mid, wave, by, via) {
  return { d: day, mid: mid, w: wave, by: by, via: via || 'player', trick: null };
}
function liveRow(day, mid, wave, by, via, scholarChannel) {
  return { day: day, mid: mid, wave: wave, by: by, via: via, scholarAtKill: by, scholarChannel: !!scholarChannel };
}
function scholarDeath(day, id, causeArg, atHaven, inCombat) {
  return { day: day, scholarId: id, causeArg: causeArg, atHaven: !!atHaven, mapX: 4, mapY: 4, inCombat: !!inCombat, pendingEncounter: false };
}
function tbRow(seq, day, mid, wave, rounds, mHpLeft) {
  return { seq: seq, day: day, mid: mid, wave: wave, alliesAtEntry: 0, partyAtEntry: 0,
    outcome: 'lost', scholarDiedInFight: true, scholarHpFracEnd: -0.05,
    monsterHpFracEnd: mHpLeft, rounds: rounds };
}
// One-killer row: K1 kills a wave-4 Strike on day 10 as the scholar.
function oneKillerRow(over) {
  return baseRow(Object.assign({
    waveKillLog: [killEntry(10, 'strike', 4, 'K1')],
    killsLive: [liveRow(10, 'strike', 4, 'K1', 'player', true)],
    fallen: [{ villagerId: 'K1', day: 15, cause: 'the wild' }],
    scholarDeaths: [scholarDeath(15, 'K1', 'the wild', true, true)],
    tbFights: [tbRow(1, 15, 'reunion', 4, 8, 0.33)],
    daily: dailyRows(15, 'K1'),
    deadMap: { K1: true },
    killerTrack: [{ day: 10, by: 'K1', isScholar: true, deadInFallen: false, atHaven: true, health: 100, onExped: false }],
  }, over || {}));
}
function firstOf(row) {
  const r = A.analyzeRow(row);
  check('fixture has exactly one first killer', r.firstKillers.length === 1, r.firstKillers);
  return r.firstKillers[0];
}

// F1: TB-fight death, scholar dies in the fight (the dominant shape).
(function () {
  const k = firstOf(oneKillerRow());
  eq('F1 channel TB-fight:reunion', k.channel, 'TB-fight:reunion');
  eq('F1 channelTop TB-fight', k.channelTop, 'TB-fight');
  eq('F1 kill-to-death 5', k.killToDeathDays, 5);
  eq('F1 kill day 10', k.killDay, 10);
  eq('F1 kill mid strike', k.killMid, 'strike');
  eq('F1 kill wave 4', k.killWave, 4);
  eq('F1 kill via player', k.killVia, 'player');
  eq('F1 scholar at kill', k.scholarAtKill, true);
  eq('F1 scholar at kill via live row', k.scholarAtKillViaLive, true);
  eq('F1 scholar at death', k.scholarAtDeath, true);
  eq('F1 quote carries scholarDeath causeArg', k.deathQuote.scholarDeath.causeArg, 'the wild');
  eq('F1 quote carries fallen cause', k.deathQuote.fallen.cause, 'the wild');
})();

// F2: arena bout — same TB shape, causeArg 'the arena' splits out.
(function () {
  const k = firstOf(oneKillerRow({
    scholarDeaths: [scholarDeath(15, 'K1', 'the arena', true, true)],
    tbFights: [tbRow(1, 15, 'eulogy', 4, 6, 0.5)],
  }));
  eq('F2 channel arena-bout:eulogy', k.channel, 'arena-bout:eulogy');
  eq('F2 channelTop arena-bout', k.channelTop, 'arena-bout');
  check('F2 detail names the arena', k.channelDetail.indexOf('the arena') >= 0, k.channelDetail);
})();

// F3: field-fight death as a companion (not the scholar at death).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K2', 'companion')],
    killsLive: [liveRow(10, 'strike', 4, 'K2', 'companion', false)],
    fallen: [{ villagerId: 'K2', day: 12, cause: 'the wild' }],
    fights: [{ day: 12, channel: 'field', fighter: 'K2', mid: 'reunion', wave: 4, outcome: 'vDie' }],
    daily: dailyRows(12, 'OTHER'),
    deadMap: { K2: true },
    killerTrack: [{ day: 10, by: 'K2', isScholar: false, deadInFallen: false, atHaven: null, health: 100, onExped: false }],
  });
  const k = firstOf(row);
  eq('F3 channel field-fight:reunion', k.channel, 'field-fight:reunion');
  eq('F3 kill-to-death 2', k.killToDeathDays, 2);
  eq('F3 scholar at kill false', k.scholarAtKill, false);
  eq('F3 scholar at death false', k.scholarAtDeath, false);
  eq('F3 quote carries field row', k.deathQuote.fieldRow.mid, 'reunion');
})();

// F4: contest death.
(function () {
  const k = firstOf(oneKillerRow({
    scholarDeaths: [scholarDeath(15, 'K1', 'contest', false, false)],
    tbFights: [],
  }));
  eq('F4 channel contest', k.channel, 'contest');
})();

// F5: starvation, scholar at home (would otherwise read at-home-not-combat).
(function () {
  const k = firstOf(oneKillerRow({
    fallen: [{ villagerId: 'K1', day: 15, cause: 'starvation' }],
    scholarDeaths: [scholarDeath(15, 'K1', 'starvation', true, false)],
    tbFights: [],
  }));
  eq('F5 channel starvation', k.channel, 'starvation');
  check('F5 detail quotes the cause', k.channelDetail.indexOf('starvation') >= 0, k.channelDetail);
})();

// F6: starvation via the fallen record alone (non-scholar death).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K2', 'companion')],
    killsLive: [liveRow(10, 'strike', 4, 'K2', 'companion', false)],
    fallen: [{ villagerId: 'K2', day: 20, cause: 'starvation' }],
    daily: dailyRows(20, 'OTHER'),
    deadMap: { K2: true },
  });
  const k = firstOf(row);
  eq('F6 channel starvation (fallen-only)', k.channel, 'starvation');
  eq('F6 kill-to-death 10', k.killToDeathDays, 10);
})();

// F7: at-home, not in combat, non-starvation cause.
(function () {
  const k = firstOf(oneKillerRow({
    fallen: [{ villagerId: 'K1', day: 15, cause: 'the night' }],
    scholarDeaths: [scholarDeath(15, 'K1', 'the night', true, false)],
    tbFights: [],
  }));
  eq('F7 channel at-home-not-combat', k.channel, 'at-home-not-combat');
})();

// F8: on the road, not in combat.
(function () {
  const k = firstOf(oneKillerRow({
    fallen: [{ villagerId: 'K1', day: 15, cause: 'the night' }],
    scholarDeaths: [scholarDeath(15, 'K1', 'the night', false, false)],
    tbFights: [],
  }));
  eq('F8 channel on-road-not-combat', k.channel, 'on-road-not-combat');
})();

// F9: fallen record naming a killing monster.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K2', 'companion')],
    killsLive: [liveRow(10, 'strike', 4, 'K2', 'companion', false)],
    fallen: [{ villagerId: 'K2', day: 18, cause: 'the wild', monsterName: 'The Reunion' }],
    daily: dailyRows(18, 'OTHER'),
    deadMap: { K2: true },
  });
  const k = firstOf(row);
  eq('F9 channel fallen-monster:The Reunion', k.channel, 'fallen-monster:The Reunion');
})();

// F10: fallen record with a literal cause (the stranger — alien-player kill).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K2', 'companion')],
    killsLive: [liveRow(10, 'strike', 4, 'K2', 'companion', false)],
    fallen: [{ villagerId: 'K2', day: 18, cause: 'a stranger' }],
    daily: dailyRows(18, 'OTHER'),
    deadMap: { K2: true },
  });
  const k = firstOf(row);
  eq('F10 channel fallen:a stranger', k.channel, 'fallen:a stranger');
})();

// F11: unmatched — scholar died in combat but no TB/field row that day
// AND no fallen row on the death day. Through analyzeRow this shape
// cannot arise (KD derives deathDay FROM the fallen record, so the
// fallen rule always fires first — see F11b); the unmatched branch is
// therefore exercised by calling firstKillerChannel directly with a
// hand-built fate, which is the only path that reaches it.
(function () {
  const row = baseRow({
    scholarDeaths: [scholarDeath(15, 'K1', 'the wild', true, true)],
    daily: dailyRows(15, 'K1'),
  });
  const fate = { by: 'K1', firstDay: 10, deathDay: 15, aliveAtEnd: false,
    deathCauseRaw: 'the wild', killToDeathDays: 5 };
  const ch = A.firstKillerChannel(row, fate);
  eq('F11 channel unmatched (direct call)', ch.channel, 'unmatched');
})();

// F11b: the same shape through analyzeRow classifies via the fallen
// fallback — the fallen record is what supplies the death day, so the
// death is 'fallen:the wild', never 'unmatched'.
(function () {
  const k = firstOf(oneKillerRow({ tbFights: [] }));
  eq('F11b analyzeRow fallen fallback', k.channel, 'fallen:the wild');
})();

// F12: alive at the horizon — censored, not a death.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K1')],
    killsLive: [liveRow(10, 'strike', 4, 'K1', 'player', true)],
    fallen: [],
    daily: dailyRows(30, 'K1'),
    deadMap: { K1: false },
  });
  const k = firstOf(row);
  eq('F12 channel alive-at-end', k.channel, 'alive-at-end');
  eq('F12 alive at end', k.aliveAtEnd, true);
  eq('F12 kill-to-death null', k.killToDeathDays, null);
})();

// F13: PYRRHIC log-read — kill in waveKillLog, NO killsLive row (the
// recordPyrrhicKill direct-write path). The killer must still be a
// first killer, with a classified death and liveMissing 1.
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(10, 'reunion', 4, 'K1', 'player')],
    killsLive: [],
    fallen: [{ villagerId: 'K1', day: 10, cause: 'the wild' }],
    scholarDeaths: [scholarDeath(10, 'K1', 'the wild', true, true)],
    tbFights: [tbRow(1, 10, 'reunion', 4, 9, 0.0)],
    daily: dailyRows(10, 'K1'),
    deadMap: { K1: true },
  });
  const k = firstOf(row);
  eq('F13 pyrrhic kill still a first killer', k.killMid, 'reunion');
  eq('F13 pyrrhic same-day death 0', k.killToDeathDays, 0);
  eq('F13 pyrrhic channel TB-fight', k.channel, 'TB-fight:reunion');
  eq('F13 pyrrhic liveMissing 1', k.liveMissing, 1);
  eq('F13 pyrrhic scholar at kill via fallback', k.scholarAtKill, true);
  eq('F13 pyrrhic scholar-at-kill NOT via live row', k.scholarAtKillViaLive, false);
})();

// F14: second-killer production gaps.
(function () {
  const two = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K1'), killEntry(25, 'eulogy', 4, 'K2', 'companion'),
      killEntry(40, 'algorithm', 4, 'K1')],
    killsLive: [liveRow(10, 'strike', 4, 'K1', 'player', true), liveRow(25, 'eulogy', 4, 'K2', 'companion', false)],
    fallen: [],
    daily: dailyRows(40, 'K1'),
    deadMap: { K1: false, K2: false },
  });
  const r2 = A.analyzeRow(two);
  eq('F14 second-killer gap 15', r2.secondKillerGap, 15);
  eq('F14 second-kill gap 15', r2.secondKillGap, 15);
  eq('F14 distinct killers 2', r2.distinctKillers, 2);
  const one = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K1')],
    killsLive: [liveRow(10, 'strike', 4, 'K1', 'player', true)],
    fallen: [],
    daily: dailyRows(30, 'K1'),
    deadMap: { K1: false },
  });
  const r1 = A.analyzeRow(one);
  eq('F14 single killer gap null', r1.secondKillerGap, null);
  eq('F14 single killer second-kill gap null', r1.secondKillGap, null);
  const sameDay = baseRow({
    waveKillLog: [killEntry(10, 'strike', 4, 'K1'), killEntry(10, 'eulogy', 4, 'K2', 'companion')],
    killsLive: [liveRow(10, 'strike', 4, 'K1', 'player', true), liveRow(10, 'eulogy', 4, 'K2', 'companion', false)],
    fallen: [],
    daily: dailyRows(30, 'K1'),
    deadMap: { K1: false, K2: false },
  });
  const r0 = A.analyzeRow(sameDay);
  eq('F14 same-day second killer gap 0', r0.secondKillerGap, 0);
})();

// F15: first killer is the EARLIEST wave-4 kill, not the first log row
// (a wave-1 kill earlier in the log must not make its killer first).
(function () {
  const row = baseRow({
    waveKillLog: [killEntry(4, 'drumbelly_tanuki', 1, 'EARLY', 'wild'),
      killEntry(10, 'strike', 4, 'K1'), killEntry(12, 'eulogy', 4, 'K2', 'companion')],
    killsLive: [liveRow(10, 'strike', 4, 'K1', 'player', true)],
    fallen: [{ villagerId: 'K1', day: 15, cause: 'the wild' }],
    scholarDeaths: [scholarDeath(15, 'K1', 'the wild', true, true)],
    tbFights: [tbRow(1, 15, 'reunion', 4, 8, 0.33)],
    daily: dailyRows(15, 'K1'),
    deadMap: { K1: true, K2: false, EARLY: false },
  });
  const r = A.analyzeRow(row);
  eq('F15 first killer is K1 not EARLY', r.firstKillers[0].by, 'K1');
  eq('F15 second-killer gap 2', r.secondKillerGap, 2);
})();

// --- corpus pins: frozen stageally-confirm2 corpus (band 53001-53008) ----
// Computed by this analyzer over the committed corpus; pins catch drift.
// Day counting is EXCLUSIVE (deathDay - killDay, the killerdeath family
// convention): the confirm2 evidence quoted INCLUSIVE (+1) spans
// (armed 0,1,8,13,18,19; baseline 2,10,34,38) — medians agree either way.
(function () {
  const dir = path.join(REPO, 'evidence', '2026-11-07', 'perseed-stageally-confirm2-b');
  const out = A.analyzeDir(dir, 'stageally-s');
  eq('P1 instrument errors 0', out.instrumentErrors, 0);
  eq('P2 pooled first killers 11', out.pooled.firstKillers, 11);
  eq('P3 pooled first-killer deaths 10', out.pooled.firstKillerDeaths, 10);
  eq('P4 pooled censored 1', out.pooled.firstKillerCensored, 1);
  eq('P5 pooled classified 10', out.pooled.classified, 10);
  eq('P6 pooled coverage 1', out.pooled.coverage, 1);
  eq('P7 pooled dominant TB-fight', out.pooled.dominantTop, 'TB-fight');
  eq('P8 pooled dominant count 7', out.pooled.dominantTopCount, 7);
  eq('P9 pooled dominant share 0.7', out.pooled.dominantTopShare, 0.7);
  eq('P10 pooled unmatched none', out.pooled.unmatched.length, 0);
  eq('P11 pooled kill-to-death median 11.5', out.pooled.killToDeathMedian, 11.5);
  const b = out.legs.baseline, s = out.legs.staged;
  eq('P12 baseline first killers 5', b.firstKillers, 5);
  eq('P13 baseline deaths 4', b.firstKillerDeaths, 4);
  eq('P14 baseline censored 1', b.firstKillerCensored, 1);
  eq('P15 baseline median 22', b.killToDeathMedian, 22);
  eq('P16 baseline spans', JSON.stringify(b.killToDeathDays), JSON.stringify([1, 10, 34, 38]));
  eq('P17 baseline TB-fight 4', b.topCounts['TB-fight'], 4);
  eq('P18 staged first killers 6', s.firstKillers, 6);
  eq('P19 staged deaths 6', s.firstKillerDeaths, 6);
  eq('P20 staged median 10', s.killToDeathMedian, 10);
  eq('P21 staged spans', JSON.stringify(s.killToDeathDays), JSON.stringify([0, 1, 7, 13, 18, 18]));
  eq('P22 staged TB-fight 3', s.topCounts['TB-fight'], 3);
  eq('P23 staged field-fight 1', s.topCounts['field-fight'], 1);
  eq('P24 staged starvation 1', s.topCounts.starvation, 1);
  eq('P25 staged fallen 1', s.topCounts.fallen, 1);
  eq('P26 baseline second-killer gap median 31', b.secondKillerGapMedian, 31);
  eq('P27 staged second-killer gap median 25', s.secondKillerGapMedian, 25);
  eq('P28 baseline median survival 96', b.wall.medianDays, 96);
  eq('P29 staged median survival 114.5', s.wall.medianDays, 114.5);
  eq('P30 staged wave-5 unlocks 1', s.wall.wave5unlocks, 1);
  eq('P31 baseline wave-5 unlocks 0', b.wall.wave5unlocks, 0);
  eq('P32 wins 0 both legs', b.wall.wins + s.wall.wins, 0);
  const bySeed = {};
  out.firstKillersTable.forEach(function (k) { bySeed[k.seed + ':' + k.policy] = k; });
  eq('P33 53003 staged jorge starvation', bySeed['53003:staged'].channel, 'starvation');
  eq('P34 53002 staged nadia field-fight reunion', bySeed['53002:staged'].channel, 'field-fight:reunion');
  eq('P35 53002 staged nadia same-day death 0', bySeed['53002:staged'].killToDeathDays, 0);
  eq('P36 53004 staged mara fallen stranger', bySeed['53004:staged'].channel, 'fallen:a stranger');
  eq('P37 53006 staged adaeze TB-fight algorithm', bySeed['53006:staged'].channel, 'TB-fight:algorithm');
  eq('P38 53006 staged adaeze k2d 18', bySeed['53006:staged'].killToDeathDays, 18);
  eq('P39 53007 baseline mara censored', bySeed['53007:baseline'].aliveAtEnd, true);
  eq('P40 53001 staged owen scholar at kill', bySeed['53001:staged'].scholarAtKill, true);
  eq('P41 53006 staged adaeze scholar at kill false', bySeed['53006:staged'].scholarAtKill, false);
})();

// --- live legs (driver subprocesses, /tmp only) ---------------------------
// Stage-0 smoke per the prereg: seeds 53001-53002, 60d, staged leg.
// Unjudged: install + determinism + neutrality only. The judged legs
// re-run these seeds from scratch with the frozen driver.
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'firstkiller-live-'));
  const env = Object.assign({}, process.env, { REPO: REPO });
  function runDriver(extraEnv) {
    const e = Object.assign({}, env, extraEnv || {});
    return execFileSync('node', [path.join(REPO, 'scripts', 'firstkiller-driver-20261107.js')], {
      cwd: REPO, env: e, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 600000,
    });
  }
  const outSmoke = path.join(tmp, 'smoke');
  const outSmoke2 = path.join(tmp, 'smoke2');
  const outOff = path.join(tmp, 'off');
  try {
    runDriver({ SEEDS: '53001..53002', DAYS: '60', RUN: 'proof-staged', OUTDIR: outSmoke, POLICY: 'staged' });
    [53001, 53002].forEach(function (seed) {
      const f = path.join(outSmoke, 'firstkiller-s' + seed + '-proof-staged.json');
      check('L1 smoke wrote seed ' + seed, fs.existsSync(f));
      const row = JSON.parse(fs.readFileSync(f, 'utf8'));
      check('L2 smoke seed ' + seed + ' zero instrument errors', (row.instrumentErrors || []).length === 0, JSON.stringify((row.instrumentErrors || []).slice(0, 3)));
      check('L3 smoke seed ' + seed + ' firstKillers is an array', Array.isArray(row.firstKillers));
      check('L4 smoke seed ' + seed + ' ran days', (row.days | 0) > 0, 'days=' + row.days);
      check('L5 smoke seed ' + seed + ' endReason present', !!row.endReason, row.endReason);
    });
    // Determinism: same seed, same policy, second run byte-identical.
    runDriver({ SEEDS: '53001', DAYS: '60', RUN: 'proof-staged', OUTDIR: outSmoke2, POLICY: 'staged' });
    const b1 = fs.readFileSync(path.join(outSmoke, 'firstkiller-s53001-proof-staged.json'), 'utf8');
    const b2 = fs.readFileSync(path.join(outSmoke2, 'firstkiller-s53001-proof-staged.json'), 'utf8');
    check('L6 determinism byte-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);
    // Neutrality: instrument OFF must match ON on days/endReason/kill-log
    // length; the firstKillers table is omitted OFF (it needs instrument rows).
    runDriver({ SEEDS: '53001', DAYS: '60', RUN: 'proof-staged', OUTDIR: outOff, POLICY: 'staged', STAGEALLY_OFF: '1' });
    const off = JSON.parse(fs.readFileSync(path.join(outOff, 'firstkiller-s53001-proof-staged.json'), 'utf8'));
    const on = JSON.parse(fs.readFileSync(path.join(outSmoke, 'firstkiller-s53001-proof-staged.json'), 'utf8'));
    check('L7 neutrality days', off.days === on.days, 'off=' + off.days + ' on=' + on.days);
    check('L8 neutrality endReason', off.endReason === on.endReason, 'off=' + off.endReason + ' on=' + on.endReason);
    check('L9 neutrality kill-log length', (off.waveKillLog || []).length === (on.waveKillLog || []).length,
      'off=' + (off.waveKillLog || []).length + ' on=' + (on.waveKillLog || []).length);
    check('L10 neutrality firstKillers omitted OFF', off.firstKillers === undefined, typeof off.firstKillers);
  } catch (e) {
    fail++;
    console.log('FAIL live-legs :: ' + (e && e.message ? String(e.message).slice(0, 400) : String(e)));
    if (e && e.stdout) console.log('--- driver stdout (tail) ---\n' + String(e.stdout).slice(-2000));
    if (e && e.stderr) console.log('--- driver stderr (tail) ---\n' + String(e.stderr).slice(-2000));
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
})();

console.log('test-firstkiller-20261107: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
