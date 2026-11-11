// test-fightplay-b.js — proof test for the fight-play census instrument
// (arm sim-fightplay-b). Fixtures + determinism/neutrality legs.
//   node scripts/test-fightplay-b.js [seed1,seed2,seed3]
// Legs run the driver on 3 seeds x 30d: ON vs OFF (neutrality — digests
// must match) and ON twice (determinism — per-seed JSONs byte-identical).
// Leg corpora go to /tmp (never into the repo).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'fightplay-analyze-20261110'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function synthRow(over) {
  const base = {
    seed: 1, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    villageLost: false, scaleRank: 'village', unlockedWave: 2, maxWave: 2,
    standing: 50, fights: [], gateCalls: [], spawns: [], daily: [],
    waveKillLog: [], fallen: [], instrumentErrors: [],
  };
  return Object.assign(base, over || {});
}
function fight(over) {
  const base = {
    day: 10, channel: 'field', fighter: 'v1', mid: 'bulldozer', wave: 1,
    cls: 'world', seq: 5, outcome: 'vKill', psycho: false, gateSeq: null,
    partySize: 1, alliesOpt: 0, allyVid: null, calledHelp: false,
    noFlee: false, intent: 'engage', intentWhy: 'party', rounds: 4,
    vTaken: 10, mDealt: 60, vHpLeft: 90, mHpLeft: 0,
    ffFired: ['haymaker'], abilitiesByRound: [[], ['haymaker'], [], []],
    trickLog: [], volley: null, ammoBefore: 0, ammoBeforeReason: 'no-ranged-weapon',
    ammoId: null, rangedId: null, ammoAfter: 0, ammoSpent: 0,
    trickKnown: false, trickKnownWhy: null, foughtBefore: false, seenCount: 3,
    logExcerpt: 'x',
  };
  return Object.assign(base, over || {});
}

// ---- 1. Classification fixtures ----
(function () {
  const grounded = fight({ seq: 7, cls: 'world' });
  const conjured = fight({ seq: null, cls: 'other' });
  const psycho = fight({ seq: null, cls: 'other', mid: 'psycho_test' });
  const contest = fight({ seq: null, cls: 'contest', noFlee: true });
  const aidGrounded = fight({ seq: 9, cls: 'other' });
  check('grounded world fight counts as grounded wild', ANALYZE.isGroundedWild(grounded) === true);
  check('conjured agency fight is NOT grounded wild', ANALYZE.isGroundedWild(conjured) === false);
  check('psycho row is NOT grounded wild', ANALYZE.isGroundedWild(psycho) === false);
  check('contest fight is NOT grounded wild', ANALYZE.isGroundedWild(contest) === false);
  check('grounded aid fight (cls other, seq set) counts', ANALYZE.isGroundedWild(aidGrounded) === true);
  check('psycho detector', ANALYZE.isPsycho(psycho) === true && ANALYZE.isPsycho(grounded) === false);

  const row = synthRow({
    fights: [grounded, conjured, psycho, contest, aidGrounded,
      fight({ seq: null, cls: 'other', outcome: 'vFlee', trickKnown: true, trickLog: ['shout'], gateSeq: 1 }),
      fight({ seq: 3, cls: 'world', outcome: 'evade', partySize: 2, allyVid: 'v2', ffFired: [], trickKnown: true, foughtBefore: true, trickLog: ['shout'] }),
      fight({ seq: 11, cls: 'world', outcome: 'mFlee', trickKnown: true, trickLog: [] })],
    gateCalls: [{ gateSeq: 1, day: 10, vid: 'v1', mid: 'bulldozer', wave: 1, result: 'avoid', reason: 'outmatched', partySize: 1 }],
    waveKillLog: [
      { d: 10, mid: 'bulldozer', w: 1, by: 'v1', via: 'agency' },
      { d: 10, mid: 'bulldozer', w: 1, by: 'v1', via: 'wild' },
    ],
    daily: [{ day: 10, living: 8 }],
    fallen: [{ cause: 'monster' }],
  });
  // The agency kill on day 10 by v1 matches a conjured vKill row (seq null)
  // and a grounded vKill row (seq 7) — grounded wins the linkage.
  const s = ANALYZE.analyzeSeed(row);
  check('groundedWild counts world + aid, not conjured/psycho/contest', s.groundedWild === 4, 'got ' + s.groundedWild);
  check('agency fights counted (cls other incl. psycho)', s.agencyFights === 4, 'got ' + s.agencyFights);
  check('conjured agency counted', s.conjuredAgency === 3, 'got ' + s.conjuredAgency);
  check('psycho counted separately', s.psychoFights === 1, 'got ' + s.psychoFights);
  check('agency kill linked grounded when a seq row matches', s.groundedKillsAgency === 1 && s.conjuredKills === 0 && s.unmatchedKills === 0,
    JSON.stringify({ g: s.groundedKillsAgency, c: s.conjuredKills, u: s.unmatchedKills }));
  check('party size distribution', s.partySizeDist['1'] === 3 && s.partySizeDist['2'] === 1, JSON.stringify(s.partySizeDist));
  check('ability uses counted by id (grounded only)', s.abilityUses.haymaker === 3 && s.abilityUsesTotal === 3, JSON.stringify(s.abilityUses));
  check('fightsWithAbility', s.fightsWithAbility === 3, 'got ' + s.fightsWithAbility);
  check('trick use counted (grounded only)', s.trickUsesTotal === 1 && s.trickUses.shout === 1, JSON.stringify(s.trickUses));
  check('trick-known no-exec counted', s.trickKnownFights === 2 && s.trickKnownNoExec === 1,
    JSON.stringify({ k: s.trickKnownFights, n: s.trickKnownNoExec }));
  check('gate results', s.gateResults.avoid === 1, JSON.stringify(s.gateResults));
  check('gate join (agency only): avoid-gated agency fight counted', s.gateJoinedAgency.avoid === 1 && s.gateJoinedAgencyOutcomes.avoid.vFlee === 1,
    JSON.stringify({ j: s.gateJoinedAgency, o: s.gateJoinedAgencyOutcomes }));
  check('outcome by party x wave', s.outcomeByPartyWave['w1/party1'].fights === 3 && s.outcomeByPartyWave['w1/party1'].vKill === 2
    && s.outcomeByPartyWave['w1/party2'].fights === 1 && s.outcomeByPartyWave['w1/party2'].evade === 1,
    JSON.stringify(s.outcomeByPartyWave));
  check('byTrickKnown tab', s.byTrickKnown['trickKnown=true'].fights === 2 && s.byTrickKnown['trickKnown=false'].fights === 2, JSON.stringify(s.byTrickKnown));
  check('byFoughtBefore tab', s.byFoughtBefore['foughtBefore=true'].fights === 1, JSON.stringify(s.byFoughtBefore));
  check('byIntent tab', s.byIntent['intent=engage'].fights === 4, JSON.stringify(s.byIntent));
  check('ammo reasons (grounded only)', s.ammoReasons['no-ranged-weapon'] === 4, JSON.stringify(s.ammoReasons));
  check('instrument errors', s.instrumentErrors === 0);

  // Unmatched kill: no fight row at all.
  const row2 = synthRow({ waveKillLog: [{ d: 5, mid: 'hushwolf', w: 1, by: 'v9', via: 'agency' }] });
  const s2 = ANALYZE.analyzeSeed(row2);
  check('unmatched agency kill reported separately', s2.unmatchedKills === 1 && s2.conjuredKills === 0, JSON.stringify(s2));
  // Conjured-only kill: matching rows exist but all seq-null.
  const row3 = synthRow({
    fights: [fight({ seq: null, cls: 'other', outcome: 'vKill', day: 5, fighter: 'v9', mid: 'hushwolf' })],
    waveKillLog: [{ d: 5, mid: 'hushwolf', w: 1, by: 'v9', via: 'agency' }],
  });
  const s3 = ANALYZE.analyzeSeed(row3);
  check('conjured-only kill counted conjured', s3.conjuredKills === 1 && s3.groundedKillsAgency === 0, JSON.stringify(s3));

  // Analyzer determinism on a synthetic corpus.
  const dirA = '/tmp/fightplay-proof-determinism-a';
  const dirB = '/tmp/fightplay-proof-determinism-b';
  [dirA, dirB].forEach(function (d) {
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'x.json'), JSON.stringify(row));
    fs.writeFileSync(path.join(d, 'y.json'), JSON.stringify(row2));
  });
  const a1 = ANALYZE.analyzeDir(dirA);
  const a2 = ANALYZE.analyzeDir(dirB);
  check('analyzer deterministic (identical corpora)', JSON.stringify(a1) === JSON.stringify(a2));
})();

// ---- 2. Live legs: neutrality + determinism + capture smoke ----
(function () {
  const seeds = (process.argv[2] || '180225,180226,180227').split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
  const stamp = Date.now();
  const dirOn1 = '/tmp/fightplay-proof-on1-' + stamp;
  const dirOn2 = '/tmp/fightplay-proof-on2-' + stamp;
  const dirOff = '/tmp/fightplay-proof-off-' + stamp;
  function runDriver(outdir, off) {
    const env = Object.assign({}, process.env, {
      SEEDS: seeds.join(','), DAYS: '30', RUN: 'fightplay-proof',
      OUTDIR: outdir,
    });
    if (off) env.FIGHTPLAY_OFF = '1';
    execFileSync('node', [path.join(REPO, 'scripts', 'fightplay-driver-20261110.js')], {
      cwd: REPO, env: env, stdio: 'pipe', timeout: 600000,
    });
  }
  runDriver(dirOn1, false);
  runDriver(dirOn2, false);
  runDriver(dirOff, true);

  function readDir(d) {
    const out = {};
    fs.readdirSync(d).filter(function (f) { return f.endsWith('.json'); }).sort().forEach(function (f) {
      out[f] = fs.readFileSync(path.join(d, f), 'utf8');
    });
    return out;
  }
  const on1 = readDir(dirOn1);
  const on2 = readDir(dirOn2);
  const off = readDir(dirOff);
  check('leg corpora complete (3 seeds each)', Object.keys(on1).length === 3 && Object.keys(on2).length === 3 && Object.keys(off).length === 3,
    [Object.keys(on1).length, Object.keys(on2).length, Object.keys(off).length].join('/'));

  let neutralOk = true, determOk = true, captureOk = true, captureDetail = '', ammoSeen = false;
  Object.keys(on1).forEach(function (f) {
    const a = JSON.parse(on1[f]);
    const b = JSON.parse(on2[f]);
    const c = JSON.parse(off[f]);
    if (a.digest !== c.digest) neutralOk = false;
    if (on1[f] !== on2[f]) determOk = false;
    if (a.instrumentErrors.length) { captureOk = false; captureDetail += f + ' errors=' + a.instrumentErrors.length + '; '; }
    if (!Array.isArray(a.fights) || !Array.isArray(a.gateCalls) || !Array.isArray(a.daily) || !a.waveKillLog) {
      captureOk = false; captureDetail += f + ' missing section; ';
    }
    if (!a.fights.length) { captureOk = false; captureDetail += f + ' zero fights; '; }
    // Every FIELD fight row carries its ammo + knowledge fields
    // (number or reason). Player-tb rows carry neither by design.
    // The equipment lookup must actually resolve: zero fights may report
    // 'no-S-equipment' / 'no-equipment', and at least one fight must
    // carry real pocketed ammo (volleys fire in these legs).
    a.fights.forEach(function (fr) {
      if (fr.channel !== 'field') return;
      if (fr.ammoBefore == null && !fr.ammoBeforeReason) { captureOk = false; captureDetail += f + ' fight missing ammo fields; '; }
      if (fr.ammoBeforeReason === 'no-S-equipment' || fr.ammoBeforeReason === 'no-equipment') { captureOk = false; captureDetail += f + ' equipment lookup failed; '; }
      if (typeof fr.ammoBefore === 'number' && fr.ammoBefore > 0) ammoSeen = true;
      if (fr.trickKnown == null && fr.foughtBefore == null) { captureOk = false; captureDetail += f + ' fight missing knowledge fields; '; }
    });
  });
  check('neutrality leg: ON vs OFF digests identical (3 seeds)', neutralOk);
  check('determinism leg: ON repeat byte-identical (3 seeds)', determOk);
  check('capture smoke: fights recorded, 0 instrument errors, ammo/knowledge fields present', captureOk, captureDetail);
  check('capture smoke: real pocketed ammo seen (equipment lookup resolves)', ammoSeen);
})();

console.log('\ntest-fightplay-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
