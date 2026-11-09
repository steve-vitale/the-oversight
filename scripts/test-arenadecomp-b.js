// test-arenadecomp-b.js — the ARENA-DECOMP det-gate + neutrality + integrity proof
// (arm sim-arenadecomp-b, run fleshout-loop-b-20261109T1739Z). DIAG, zero src/js.
// G1: the reused prefloor classifier (scripts/analyze-prefloor-deaths-20261109.js,
// read-only) classifies every registered cause correctly — exact 'the arena'
// as arena, bare 'arena' as other (the known 53007-a classifier gap: that
// classifier's VIOLENT map keys 'arena' but the game emits 'the arena'),
// 'contest' as other (distinct from the arena), the monsterName rule,
// unknown causes in other-NAMED — and the fixtures DETECT a broken
// classifier (bare-'arena' substring match / 'contest'-merged-into-arena /
// monsterName rule removed). The arena join
// (scripts/analyze-arenadecomp-b.js) classifies contest-arena /
// fallback-label / unclassified on synthetic corpora, and the fixtures DETECT
// a broken join (cause-string-only classification).
// G2: recorder neutrality on real sims (recorded vs bare fingerprints
// identical on 43002 + 43006, same code, same master) + determinism smoke
// (same seed twice → identical per-seed JSON, seed 43001).
// G3: corpus integrity on the committed corpora when present
// (skip-until-present, as the foundation proof does) + checkCorpusArena
// fixtures on synthetic good/bad corpora.
// Real-sim legs: the G2 oneRuns ARE the real-sim legs (winseek, 150d) —
// corpora parse, fallen present with day + cause, hurt events + contest
// takes present, zero sit-verb calls (the no-seat-walking config proven live).
// Usage: node scripts/test-arenadecomp-b.js
// Never run concurrent jest; use --cacheDirectory=/tmp/jest-cache-sim-arenadecomp-b.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const AN = require('./analyze-prefloor-deaths-20261109');
const AD = require('./analyze-arenadecomp-b');
const SWEEP = require('./sweep-arenadecomp-b');

let PASS = 0, FAIL = 0, SKIP = 0;
const FAILURES = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('PASS ' + name); }
  else { FAIL++; FAILURES.push(name); console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function skip(name, why) { SKIP++; console.log('SKIP ' + name + ' — ' + why); }

// ---- G1: classifier fixtures (the preregistered registry, via the reused classifier) ----
check('G1 arena: the arena (exact emitted string)', AN.classifyCause({ cause: 'the arena', day: 10 }) === 'arena');
check('G1 arena: bare "arena" is NOT the arena (53007-a gap: VIOLENT keyed arena, game emits the arena)', AN.classifyCause({ cause: 'arena', day: 10 }) === 'other');
check('G1 arena: "Arena" capitalised is NOT the arena', AN.classifyCause({ cause: 'Arena', day: 10 }) === 'other');
check('G1 arena: the coalition arena is NOT the arena class', AN.classifyCause({ cause: 'the coalition arena', day: 10 }) === 'other');
check('G1 wild: the wild', AN.classifyCause({ cause: 'the wild', day: 10 }) === 'wild');
check('G1 wild: monster', AN.classifyCause({ cause: 'monster', day: 10 }) === 'wild');
check('G1 wild: a stranger', AN.classifyCause({ cause: 'a stranger', day: 10 }) === 'wild');
check('G1 wild: Gavel with monsterName', AN.classifyCause({ cause: 'Gavel', monsterName: 'Gavel', day: 40 }) === 'wild');
check('G1 wild: Gavel WITHOUT monsterName is other', AN.classifyCause({ cause: 'Gavel', day: 40 }) === 'other');
check('G1 starvation', AN.classifyCause({ cause: 'starvation', day: 10 }) === 'starvation');
check('G1 sickness: sickness', AN.classifyCause({ cause: 'sickness', day: 10 }) === 'sickness-disease');
check("G1 sickness: a wound that wouldn't close", AN.classifyCause({ cause: "a wound that wouldn't close", day: 10 }) === 'sickness-disease');
check('G1 other: contest stays other (distinct from the arena)', AN.classifyCause({ cause: 'contest', day: 10 }) === 'other');
check('G1 other: the night lands in other-NAMED', AN.classifyCause({ cause: 'the night', day: 10 }) === 'other');
check('G1 other: betrayal lands in other-NAMED', AN.classifyCause({ cause: 'betrayal', day: 10 }) === 'other');
check('G1 other: unknown cause lands in other-NAMED', AN.classifyCause({ cause: 'fell off a cliff', day: 10 }) === 'other');
check('G1 other: missing cause lands in other', AN.classifyCause({ day: 10 }) === 'other');
check('G1 other: null entry lands in other', AN.classifyCause(null) === 'other');

// ---- G1: the fixtures DETECT a broken classifier (sensitivity) ----
function brokenBareArena(entry) {
  // The 53007-a bug shape: a substring/keyword match on 'arena' instead of
  // the exact emitted string 'the arena'.
  const cause = entry && entry.cause != null ? String(entry.cause) : '';
  if (/arena/i.test(cause)) return 'arena';
  return AN.classifyCause(entry);
}
check('G1 sensitivity: bare-arena substring match misclassifies "arena" (real one does not)',
  brokenBareArena({ cause: 'arena', day: 10 }) !== AN.classifyCause({ cause: 'arena', day: 10 }));
check('G1 sensitivity: bare-arena substring match misclassifies "the coalition arena" (real one does not)',
  brokenBareArena({ cause: 'the coalition arena', day: 10 }) !== AN.classifyCause({ cause: 'the coalition arena', day: 10 }));
function brokenContestMerged(entry) {
  if (entry && entry.cause === 'contest') return 'arena';
  return AN.classifyCause(entry);
}
check('G1 sensitivity: contest-merged-into-arena misclassifies "contest" (real one does not)',
  brokenContestMerged({ cause: 'contest', day: 10 }) !== AN.classifyCause({ cause: 'contest', day: 10 }));
function brokenNoMonsterName(entry) {
  if (!entry || typeof entry !== 'object') return 'other';
  const cause = entry.cause != null ? String(entry.cause) : '';
  if (cause === 'the wild' || cause === 'monster' || cause === 'ambush' || cause === 'combat' || cause === 'a stranger') return 'wild';
  if (cause === 'the arena') return 'arena';
  if (cause === 'starvation') return 'starvation';
  if (cause === 'sickness' || cause === 'wound_fever' || cause === "a wound that wouldn't close") return 'sickness-disease';
  return 'other';
}
check('G1 sensitivity: no-monsterName-rule misclassifies Gavel-with-monsterName (real one does not)',
  brokenNoMonsterName({ cause: 'Gavel', monsterName: 'Gavel', day: 40 }) !== AN.classifyCause({ cause: 'Gavel', monsterName: 'Gavel', day: 40 }));

// ---- G1: arena-join fixtures on synthetic corpora ----
function synthDaySeries(days, hpByDay) {
  const rows = [];
  for (let d = 1; d <= days; d++) {
    rows.push({ day: d, pop: 10, healthMap: (hpByDay && hpByDay[d]) || {},
      healerPresent: true });
  }
  return rows;
}
function synthCorpus(over) {
  const base = {
    seed: 99901, policy: 'winseek', daysAlive: 50, villageDays: 50,
    endReason: 'village-lost', national: false, rank: 'village', win: false,
    waveReach: [1, 2, 3], finalPop: 6,
    deathCauses: {}, deathRows: [], fallen: [], daySeries: synthDaySeries(50, {}),
    hurtEvents: [], contestTakes: [], arenaEvents: [], arenaAfterEvents: [],
    choiceOfferLines: [], waveKillLog: [], contestDeathsById: {}, contestsHeld: 0,
    deathSays: [], sitVerbMsgs: [], doorVerbMsgs: [], instrumentErrors: [],
  };
  return Object.assign(base, over || {});
}
function arenaSnap(over) {
  return Object.assign({
    arenaContest: { contestId: 'blood-pit', waveIdx: 0, waves: ['beast-x'], beastId: 'beast-x', beastWave: 3 },
    activeContest: { contestId: 'blood-pit', cat: 'blood', name: 'The Pit', participant: 'player', others: [], approach: { 0: 0 }, refused: false },
    tbfight: { id: 'tb1', round: 5, fighters: [{ key: 'p', kind: 'villager', villagerId: 'scholar1', hp: 0, maxHp: 100, alive: false, taken: 85 }] },
    veteran: { w3: 2, w4: 1, maxWave: 4, kills: [{ d: 40, mid: 'm1', w: 4, via: 'player' }] },
    hpAtDeath: 0, contestsHeld: 3,
  }, over || {});
}
// Fixture A: contest-arena scholar death, full snapshot, veteran, choice offered + participated.
const corpusA = synthCorpus({
  daySeries: synthDaySeries(50, { 44: { scholar1: 80 } }),
  hurtEvents: [{ day: 44, who: 'scholar1', whoName: 'Ana', dmg: 30, cause: 'contest', hpBefore: 80, hpAfter: 50, settlement: false, monsterName: null, monsterId: null, threw: null }],
  contestTakes: [{ day: 44, contestId: 'blood-pit', cat: 'blood', name: 'The Pit', participantIds: ['player'], isPlayerTake: true, choiceOffered: true, threw: null }],
  arenaEvents: [{ day: 44, contestId: 'blood-pit', waves: ['beast-x'], beastWaves: [{ id: 'beast-x', wave: 3 }], threw: null }],
  arenaAfterEvents: [{ day: 44, contestId: 'blood-pit', result: 'lost', waveIdx: 0, threw: null }],
  deathRows: [{ day: 44, who: 'scholar1', whoName: 'Ana', kind: 'person', cause: 'the arena', causeRaw: 'the arena', monsterName: null, monsterId: null, isPlayer: true, sayWin: [], arena: arenaSnap() }],
  fallen: [{ villagerId: 'scholar1', day: 44, cause: 'the arena', name: 'Ana' }],
});
const joinA = AD.joinArenaDeath(corpusA, corpusA.fallen[0]);
check('G1 join fixture A: arenaContest live at death -> contest-arena', joinA.origin === 'contest-arena', 'got ' + joinA.origin);
check('G1 join fixture A: scholar death', joinA.isPlayer === true);
check('G1 join fixture A: veteran wave-4 killer (w4=1)', joinA.veteranW4 === 1 && joinA.veteranW3 === 2, 'w3=' + joinA.veteranW3 + ' w4=' + joinA.veteranW4);
check('G1 join fixture A: entry HP is the death-day dawn snapshot (80)', joinA.entryHp === 80 && joinA.entryHpDay === 44, 'got ' + joinA.entryHp + ' d' + joinA.entryHpDay);
check('G1 join fixture A: hurt trail recorded (30 dmg, contest cause)', joinA.trailEvents === 1 && joinA.trailDmg === 30 && joinA.trail[0].cause === 'contest', 'trail=' + JSON.stringify(joinA.trail));
check('G1 join fixture A: choice offered + participated', joinA.choiceOffered === true && joinA.choiceTaken === 'participated', 'offered=' + joinA.choiceOffered + ' taken=' + joinA.choiceTaken);
check('G1 join fixture A: beast wave 3, outcome lost', joinA.beastWave === 3 && joinA.arenaOutcome === 'lost', 'wave=' + joinA.beastWave + ' outcome=' + joinA.arenaOutcome);
check('G1 join fixture A: tbTaken 85', joinA.tbfightTaken === 85, 'got ' + joinA.tbfightTaken);
// Fixture B: fallback-label death — no arenaContest live, no activeContest,
// hurt trail with a monster cause. Same cause string, different origin.
const corpusB = synthCorpus({
  daySeries: synthDaySeries(50, { 30: { scholar1: 95 } }),
  hurtEvents: [{ day: 30, who: 'scholar1', whoName: 'Bo', dmg: 95, cause: 'monster', hpBefore: 95, hpAfter: 0, settlement: true, monsterName: 'Big Beast', monsterId: 'big-beast', threw: null }],
  deathRows: [{ day: 30, who: 'scholar1', whoName: 'Bo', kind: 'person', cause: 'the arena', causeRaw: 'the arena', monsterName: null, monsterId: null, isPlayer: true, sayWin: [],
    arena: { arenaContest: null, activeContest: null, tbfight: { id: 'tb2', round: 3, fighters: [{ key: 'p', kind: 'villager', villagerId: 'scholar1', hp: 0, maxHp: 100, alive: false, taken: 95 }] }, veteran: { w3: 0, w4: 0, maxWave: 0, kills: [] }, hpAtDeath: 0, contestsHeld: 1 } }],
  fallen: [{ villagerId: 'scholar1', day: 30, cause: 'the arena', name: 'Bo' }],
});
const joinB = AD.joinArenaDeath(corpusB, corpusB.fallen[0]);
check('G1 join fixture B: no arenaContest live -> fallback-label', joinB.origin === 'fallback-label', 'got ' + joinB.origin);
check('G1 join fixture B: choice unknown (no take match)', joinB.choiceOffered == null && joinB.choiceTaken == null);
check('G1 join fixture B: hurt trail is the monster settlement (95 dmg)', joinB.trailEvents === 1 && joinB.trailDmg === 95 && joinB.trail[0].monsterName === 'Big Beast');
// Fixture C: no arena snapshot on the deathRow -> unclassified.
const corpusC = synthCorpus({
  daySeries: synthDaySeries(50, { 20: { v3: 60 } }),
  deathRows: [{ day: 20, who: 'v3', whoName: 'Cy', kind: 'villager', cause: 'the arena', causeRaw: 'the arena', monsterName: null, monsterId: null, isPlayer: false, sayWin: [] }],
  fallen: [{ villagerId: 'v3', day: 20, cause: 'the arena', name: 'Cy' }],
});
const joinC = AD.joinArenaDeath(corpusC, corpusC.fallen[0]);
check('G1 join fixture C: deathRow without arena snapshot -> unclassified', joinC.origin === 'unclassified', 'got ' + joinC.origin);
// Fixture D: villager arena death (isPlayer false) with arenaContest live —
// the join must not assume the victim is the scholar.
const corpusD = synthCorpus({
  daySeries: synthDaySeries(50, { 35: { v4: 70 } }),
  contestTakes: [{ day: 35, contestId: 'blood-pit', cat: 'blood', name: 'The Pit', participantIds: ['player', 'v4'], isPlayerTake: true, choiceOffered: false, threw: null }],
  deathRows: [{ day: 35, who: 'v4', whoName: 'Dee', kind: 'villager', cause: 'the arena', causeRaw: 'the arena', monsterName: null, monsterId: null, isPlayer: false, sayWin: [],
    arena: arenaSnap({ activeContest: { contestId: 'blood-pit', cat: 'blood', name: 'The Pit', participant: 'player', others: ['v4'], approach: { 0: 0 }, refused: false }, tbfight: { id: 'tb3', round: 2, fighters: [{ key: 'p', kind: 'villager', villagerId: 'scholar1', hp: 40, maxHp: 100, alive: true, taken: 60 }, { key: 'm_0', kind: 'monster', villagerId: null, hp: 0, maxHp: 80, alive: false, taken: null }] }, veteran: { w3: 0, w4: 0, maxWave: 2, kills: [{ d: 20, mid: 'm2', w: 2, via: 'wild' }] } }) }],
  fallen: [{ villagerId: 'v4', day: 35, cause: 'the arena', name: 'Dee' }],
});
const joinD = AD.joinArenaDeath(corpusD, corpusD.fallen[0]);
check('G1 join fixture D: villager death with arenaContest live -> contest-arena', joinD.origin === 'contest-arena' && joinD.isPlayer === false, 'got ' + joinD.origin + ' isPlayer=' + joinD.isPlayer);
check('G1 join fixture D: non-veteran (w3=0, maxWave 2)', joinD.veteranW3 === 0 && joinD.veteranMaxWave === 2);
// Fixture E: choice NOT offered, but approach[0] is 0 — the discriminating
// case. approach[0] is the first REAL phase's choice here, not a participate
// choice, so choiceTaken must stay null.
const corpusE = synthCorpus({
  daySeries: synthDaySeries(50, { 44: { scholar1: 80 } }),
  contestTakes: [{ day: 44, contestId: 'blood-pit', cat: 'blood', name: 'The Pit', participantIds: ['player'], isPlayerTake: true, choiceOffered: false, threw: null }],
  deathRows: [{ day: 44, who: 'scholar1', whoName: 'Eli', kind: 'person', cause: 'the arena', causeRaw: 'the arena', monsterName: null, monsterId: null, isPlayer: true, sayWin: [], arena: arenaSnap() }],
  fallen: [{ villagerId: 'scholar1', day: 44, cause: 'the arena', name: 'Eli' }],
});
const joinE = AD.joinArenaDeath(corpusE, corpusE.fallen[0]);
check('G1 join fixture E: choice NOT offered -> choiceTaken stays null even though approach[0]=0', joinE.choiceOffered === false && joinE.choiceTaken == null, 'offered=' + joinE.choiceOffered + ' taken=' + joinE.choiceTaken);
// Sensitivity: a cause-string-only join misclassifies fixture B (real join does not).
function brokenCauseStringJoin(fallenEntry) {
  return fallenEntry.cause === 'the arena' ? 'contest-arena' : 'fallback-label';
}
check('G1 sensitivity: cause-string-only join misclassifies fixture B as contest-arena (real join does not)',
  brokenCauseStringJoin(corpusB.fallen[0]) !== joinB.origin);

// ---- G1: checkCorpusArena fixtures on synthetic corpora ----
const goodCk = AD.checkCorpusArena(corpusA);
check('G1 corpus-check: synthetic good corpus passes', goodCk.ok, goodCk.problems.join('; '));
const badNoSnap = AD.checkCorpusArena(corpusC);
check('G1 corpus-check: arena death without snapshot fails', !badNoSnap.ok && badNoSnap.problems.some(function (p) { return /no arena snapshot/.test(p); }), badNoSnap.problems.join('; '));
const badErrors = synthCorpus({ instrumentErrors: ['say-wrap: boom'] });
check('G1 corpus-check: instrument errors fail', !AD.checkCorpusArena(badErrors).ok);
const badFallen = synthCorpus({
  fallen: [{ villagerId: 'vx', day: 12, cause: 'the wild', name: 'X' }],
});
check('G1 corpus-check: fallen without deathRow fails', !AD.checkCorpusArena(badFallen).ok);
const badHurt = synthCorpus({ hurtEvents: null });
check('G1 corpus-check: missing hurtEvents fails', !AD.checkCorpusArena(badHurt).ok);

// ---- G2/G3 real legs (async) ----
async function main() {
  // G2 neutrality: recorded vs bare fingerprints identical on 43002 + 43006.
  for (const seed of [43002, 43006]) {
    const rec = await SWEEP.oneRun(seed, 150, { bare: false });
    const bare = await SWEEP.oneRun(seed, 150, { bare: true });
    const recFp = AD.buildFingerprint(rec.perSeed, rec.diag);
    const diff = AD.fingerprintsEqual(recFp, bare.fingerprint);
    check('G2 neutrality seed ' + seed + ': recorded == bare fingerprint', diff == null, diff || '');
    check('G2 real leg seed ' + seed + ': zero sit-verb calls (no-seat config live)', (rec.perSeed.sitVerbMsgs || []).length === 0 && (rec.perSeed.doorVerbMsgs || []).length === 0, 'sit=' + (rec.perSeed.sitVerbMsgs || []).length + ' door=' + (rec.perSeed.doorVerbMsgs || []).length);
    check('G2 real leg seed ' + seed + ': fallen present with day + cause', (rec.perSeed.fallen || []).length > 0 && (rec.perSeed.fallen || []).every(function (f) { return f.day != null && f.cause != null; }), 'fallen=' + (rec.perSeed.fallen || []).length);
    check('G2 real leg seed ' + seed + ': hurt events + contest takes present', (rec.perSeed.hurtEvents || []).length > 0 && (rec.perSeed.contestTakes || []).length > 0, 'hurt=' + (rec.perSeed.hurtEvents || []).length + ' takes=' + (rec.perSeed.contestTakes || []).length);
    check('G2 real leg seed ' + seed + ': zero instrument errors', (rec.perSeed.instrumentErrors || []).length === 0, JSON.stringify(rec.perSeed.instrumentErrors || []));
  }
  // Determinism smoke: same seed twice -> identical per-seed JSON.
  const d1 = await SWEEP.oneRun(43001, 150, { bare: false });
  const d2 = await SWEEP.oneRun(43001, 150, { bare: false });
  check('G2 determinism seed 43001: same seed twice -> identical per-seed JSON',
    JSON.stringify(d1.perSeed) === JSON.stringify(d2.perSeed));

  // G3 real corpus integrity on the committed pilot corpora (skip-until-present).
  const corpusDir = path.join(REPO, 'evidence', '2026-11-09', 'perseed-arenadecomp-b');
  if (!fs.existsSync(corpusDir)) {
    skip('G3 real corpora', 'no committed pilot corpora yet at ' + corpusDir);
  } else {
    const files = fs.readdirSync(corpusDir).filter(function (f) { return /^arenadecomp-b-winseek-s\d+\.json$/.test(f); }).sort();
    if (!files.length) skip('G3 real corpora', 'no per-seed files in ' + corpusDir);
    else {
      let allOk = true;
      for (const f of files) {
        const c = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
        const ck = AD.checkCorpusArena(c);
        if (!ck.ok) allOk = false;
        check('G3 real corpus ' + f, ck.ok, ck.problems.join('; '));
      }
      check('G3 real corpora: all 8 pilot seeds present', files.length === 8, 'got ' + files.length);
    }
  }

  console.log('\nproof: ' + PASS + ' passed, ' + FAIL + ' failed, ' + SKIP + ' skipped');
  if (FAIL) { console.log('FAILURES: ' + FAILURES.join(', ')); process.exitCode = 1; }
}

if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
