// test-killersurvive-20261106.js — proof for the first-killer death-channel
// trace + party-persistence probe (arm sim-killersurvive-a). The analyzer is
// a pure function over the stageally-confirm corpus; the proof pins it to the
// confirmed numbers and to the classification invariants. No game reads, no
// RNG, no judged sims. Exit non-zero on any failure.
// Usage: node scripts/test-killersurvive-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'killersurvive-analyze-20261106'));
const KD = require(path.join(REPO, 'scripts', 'killerdeath-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

const DIR = path.join(REPO, 'evidence', '2026-11-06', 'perseed-stageally-confirm-b');
const staged = AN.analyzeLeg(DIR, 'staged');
const baseline = AN.analyzeLeg(DIR, 'baseline');

// ---------- headline reproduction (the confirm evidence numbers) ----------
check('staged: 8 legs, 0 instrument errors', staged.n === 8 && staged.instrumentErrors === 0,
  'n=' + staged.n + ' errors=' + staged.instrumentErrors);
check('baseline: 8 legs, 0 instrument errors', baseline.n === 8 && baseline.instrumentErrors === 0,
  'n=' + baseline.n + ' errors=' + baseline.instrumentErrors);
check('staged w4 kills = 3 (confirm)', staged.w4kills === 3, 'got ' + staged.w4kills);
check('baseline w4 kills = 9 (confirm)', baseline.w4kills === 9, 'got ' + baseline.w4kills);
check('staged killers ever = 3 (confirm)', staged.killersEver === 3, 'got ' + staged.killersEver);
check('baseline killers ever = 7 (confirm)', baseline.killersEver === 7, 'got ' + baseline.killersEver);
check('staged kill-to-death median = 9.5d (confirm)', staged.killToDeathMedianAll === 9.5,
  'got ' + staged.killToDeathMedianAll);
check('baseline first-killer median = 9d (confirm)', baseline.firstKillToDeathMedian === 9,
  'got ' + baseline.firstKillToDeathMedian);
check('baseline kill-to-death median (all dead) = 12d', baseline.killToDeathMedianAll === 12,
  'got ' + baseline.killToDeathMedianAll);
check('living pair 0/8 both legs (confirm)', staged.pairSnapshotSeeds === 0 && baseline.pairSnapshotSeeds === 0,
  'staged=' + staged.pairSnapshotSeeds + ' baseline=' + baseline.pairSnapshotSeeds);
check('max simultaneous living killers = 1 both legs', staged.maxSimultaneous === 1 && baseline.maxSimultaneous === 1,
  'staged=' + staged.maxSimultaneous + ' baseline=' + baseline.maxSimultaneous);

// ---------- classification completeness (the DIAG-GO bar) ----------
check('no unmatched first killers (staged)', staged.unmatchedFirst.length === 0,
  JSON.stringify(staged.unmatchedFirst));
check('no unmatched first killers (baseline)', baseline.unmatchedFirst.length === 0,
  JSON.stringify(baseline.unmatchedFirst));
[staged, baseline].forEach(function (leg) {
  leg.killers.forEach(function (k) {
    check('killer ' + k.seed + ':' + k.by + ' has a channel', !!k.channel);
    check('killer ' + k.seed + ':' + k.by + ' death-day matches a record or is alive',
      k.aliveAtEnd || (k.deathDay != null && k.killToDeathDays != null));
  });
});

// ---------- the two named killers (anchor rows, not just aggregates) ----------
const k53004 = staged.killers.filter(function (k) { return k.seed === 53004; })[0];
check('53004 staged first killer is gen_16cjvkx, Eulogy d78',
  k53004 && k53004.by === 'gen_16cjvkx' && k53004.firstDay === 78 && k53004.mids.indexOf('eulogy') >= 0,
  JSON.stringify(k53004 && { by: k53004.by, firstDay: k53004.firstDay, mids: k53004.mids }));
check('53004 killer died d90 in a TB Reunion fight, party [chen_wei] beside them',
  k53004 && k53004.channel === 'TB-fight:reunion' && k53004.deathDay === 90 &&
  k53004.partyAtDeath && k53004.partyAtDeath.ids.indexOf('chen_wei') >= 0,
  JSON.stringify(k53004 && { channel: k53004.channel, deathDay: k53004.deathDay, partyAtDeath: k53004.partyAtDeath }));
check('53004 killer was at full health and at Haven until death',
  k53004 && k53004.healthMin === 100 && k53004.atHavenShare === 1 && k53004.onExpedShare === 0,
  JSON.stringify(k53004 && { healthMin: k53004.healthMin, atHavenShare: k53004.atHavenShare }));
const kOlivia = staged.killers.filter(function (k) { return k.by === 'olivia_bennett'; })[0];
check('53006 Olivia died d96 in a contest (not a fight)',
  kOlivia && kOlivia.channel === 'contest' && kOlivia.deathDay === 96 && kOlivia.killToDeathDays === 7,
  JSON.stringify(kOlivia && { channel: kOlivia.channel, deathDay: kOlivia.deathDay }));
const kElena = baseline.killers.filter(function (k) { return k.by === 'elena_petrova'; })[0];
check('53008 Elena died d131 of dehydration at home (not in combat)',
  kElena && kElena.channel === 'at-home-not-combat' && kElena.deathDay === 131 &&
  kElena.scholarCtx && kElena.scholarCtx.causeArg === 'dehydration',
  JSON.stringify(kElena && { channel: kElena.channel, deathDay: kElena.deathDay }));

// ---------- party persistence: no member ever "scatters" ----------
// Every scattered member in the staged succession trace must have a fallen
// entry on the succession day (they died that day — they did not walk away).
const scatteredDead = staged.successions.every(function (s) {
  return s.scattered.every(function (id) {
    const row = JSON.parse(fs.readFileSync(
      path.join(DIR, 'stageally-s' + s.seed + '-stageally-confirm-staged.json'), 'utf8'));
    return (row.fallen || []).some(function (f) { return f.villagerId === id && (f.day | 0) === (s.day | 0); });
  });
});
check('every staged "scattered" party member died that day (no walk-aways)', scatteredDead);
check('staged party persisted across succession 21 times', staged.succAgg.partyPersisted === 21,
  'got ' + staged.succAgg.partyPersisted);
check('staged successions: 47 total, 10 promotions', staged.succAgg.total === 47 && staged.succAgg.promoted === 10,
  JSON.stringify(staged.succAgg));
staged.successions.concat(baseline.successions).forEach(function (s, i) {
  check('succession row ' + i + ' well-formed', Array.isArray(s.partyBefore) && Array.isArray(s.partyAfter) &&
    (s.veteransBefore == null || typeof s.veteransBefore === 'number'));
});

// ---------- killerdeath reuse: every w4 kill has a live row ----------
['staged', 'baseline'].forEach(function (policy) {
  const files = fs.readdirSync(DIR).filter(function (f) {
    return f.indexOf('stageally-confirm-' + policy + '.json') >= 0;
  }).sort();
  files.forEach(function (f) {
    const row = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    KD.killerFates(row).forEach(function (fate) {
      check('killer ' + row.seed + ':' + fate.by + ' liveRows cover all w4 kills (liveMissing=0)',
        fate.liveMissing === 0, 'liveMissing=' + fate.liveMissing + ' kills=' + fate.kills + ' liveRows=' + fate.liveRows);
    });
  });
});
const kdStaged = KD.analyzeDir(DIR, 'stageally-s');
check('killerdeath cross-check runs over the corpus dir', kdStaged.n === 16, 'n=' + kdStaged.n);

console.log('---\nkillersurvive proof: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
