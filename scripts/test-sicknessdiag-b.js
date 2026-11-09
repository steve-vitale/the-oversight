// test-sicknessdiag-b.js — the SICKNESS-DIAG det-gate + neutrality + integrity proof
// (arm sim-sicknessdiag-b, run fleshout-loop-b-20261109T1530Z). DIAG, zero src/js.
// G1: the reused prefloor classifier (scripts/analyze-prefloor-deaths-20261109.js,
// read-only) classifies every registered cause correctly — `the arena` as
// arena, `the night`/`betrayal` as other-NAMED, `a wound that wouldn't close`
// + `sickness` as sickness-disease, the monsterName rule, unknown causes in
// other-NAMED — and the fixtures DETECT a broken classifier (rule swap /
// monsterName rule removed / `the night` silently merged). The wound-chain
// join (scripts/analyze-sicknessdiag-b.js) classifies wound-first /
// sickness-first / unlinked on synthetic corpora, and the fixtures DETECT a
// broken join (cause-string-only classification).
// G2: recorder neutrality on real sims (recorded vs bare fingerprints
// identical on 58202 + 58206, same code, same master) + determinism smoke
// (same seed twice → identical per-seed JSON, seed 58201).
// G3: corpus integrity on the committed corpora when present
// (skip-until-present, as the foundation proof does) + checkCorpusDiag
// fixtures on synthetic good/bad corpora.
// Real-sim legs: the G2 oneRuns ARE the real-sim legs (winseek, 150d) —
// corpora parse, fallen present with day + cause, episodes built, zero
// sit-verb calls (the no-seat-walking config proven live).
// Usage: node scripts/test-sicknessdiag-b.js
// Never run concurrent jest; use --cacheDirectory=/tmp/jest-cache-sim-sicknessdiag-b.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const AN = require('./analyze-prefloor-deaths-20261109');
const FEVER = require('./analyze-feveranat-a');
const SD = require('./analyze-sicknessdiag-b');
const SWEEP = require('./sweep-sicknessdiag-b');

let PASS = 0, FAIL = 0, SKIP = 0;
const FAILURES = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('PASS ' + name); }
  else { FAIL++; FAILURES.push(name); console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function skip(name, why) { SKIP++; console.log('SKIP ' + name + ' — ' + why); }

// ---- G1: classifier fixtures (the preregistered registry, via the reused classifier) ----
check('G1 wild: the wild', AN.classifyCause({ cause: 'the wild', day: 10 }) === 'wild');
check('G1 wild: monster', AN.classifyCause({ cause: 'monster', day: 10 }) === 'wild');
check('G1 wild: a stranger', AN.classifyCause({ cause: 'a stranger', day: 10 }) === 'wild');
check('G1 wild: Gavel with monsterName', AN.classifyCause({ cause: 'Gavel', monsterName: 'Gavel', day: 40 }) === 'wild');
check('G1 wild: Gavel WITHOUT monsterName is other', AN.classifyCause({ cause: 'Gavel', day: 40 }) === 'other');
check('G1 arena: the arena (exact)', AN.classifyCause({ cause: 'the arena', day: 10 }) === 'arena');
check('G1 arena: bare "arena" is NOT the arena', AN.classifyCause({ cause: 'arena', day: 10 }) === 'other');
check('G1 starvation', AN.classifyCause({ cause: 'starvation', day: 10 }) === 'starvation');
check('G1 sickness: sickness', AN.classifyCause({ cause: 'sickness', day: 10 }) === 'sickness-disease');
check('G1 sickness: wound_fever', AN.classifyCause({ cause: 'wound_fever', day: 10 }) === 'sickness-disease');
check("G1 sickness: a wound that wouldn't close", AN.classifyCause({ cause: "a wound that wouldn't close", day: 10 }) === 'sickness-disease');
check('G1 other: the night lands in other-NAMED', AN.classifyCause({ cause: 'the night', day: 10 }) === 'other');
check('G1 other: betrayal lands in other-NAMED', AN.classifyCause({ cause: 'betrayal', day: 10 }) === 'other');
check('G1 other: dehydration stays other (never starvation)', AN.classifyCause({ cause: 'dehydration', day: 10 }) === 'other');
check('G1 other: thirst stays other (never starvation)', AN.classifyCause({ cause: 'thirst', day: 10 }) === 'other');
check('G1 other: contest stays other (distinct from the arena)', AN.classifyCause({ cause: 'contest', day: 10 }) === 'other');
check('G1 other: unknown cause lands in other-NAMED', AN.classifyCause({ cause: 'fell off a cliff', day: 10 }) === 'other');
check('G1 other: missing cause lands in other', AN.classifyCause({ day: 10 }) === 'other');
check('G1 other: null entry lands in other', AN.classifyCause(null) === 'other');

// ---- G1: the fixtures DETECT a broken classifier (sensitivity) ----
function brokenSwap(entry) {
  const cause = entry && entry.cause != null ? String(entry.cause) : '';
  if (cause === 'sickness') return 'wild';
  if (cause === 'the wild') return 'sickness-disease';
  return AN.classifyCause(entry);
}
check('G1 sensitivity: swapped wild/sickness misclassifies the sickness fixture (real one does not)',
  brokenSwap({ cause: 'sickness', day: 10 }) !== AN.classifyCause({ cause: 'sickness', day: 10 }));
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
function brokenNightMerged(entry) {
  if (entry && entry.cause === 'the night') return 'wild';
  return AN.classifyCause(entry);
}
check('G1 sensitivity: the-night-as-wild misclassifies the night fixture (real one does not)',
  brokenNightMerged({ cause: 'the night', day: 10 }) !== AN.classifyCause({ cause: 'the night', day: 10 }));

// ---- G1: wound-chain join fixtures on synthetic corpora ----
function synthDaySeries(days, sickByDay, hpByDay, healerByDay) {
  const rows = [];
  for (let d = 1; d <= days; d++) {
    rows.push({ day: d, pop: 10, sickCount: 0, meanHealth: 90,
      sickMap: (sickByDay && sickByDay[d]) || {},
      scholarSick: [], healerPresent: !!(healerByDay && healerByDay[d]),
      medicCount: 1, sickMeanHealth: null, healthyMeanHealth: 90, sickCountNPC: 0,
      healthMap: (hpByDay && hpByDay[d]) || {} });
  }
  return rows;
}
function synthCorpus(over) {
  const base = {
    seed: 99901, policy: 'winseek', daysAlive: 50, villageDays: 50,
    endReason: 'village-lost', national: false, rank: 'village', win: false,
    waveReach: [1, 2, 3], finalPop: 6,
    deathCauses: {}, deathRows: [], fallen: [], daySeries: synthDaySeries(50, {}, {}, {}),
    sickOnsets: [], sickEnds: [], treatEvents: [], statusEvents: [],
    diagnoses: [], cureEvents: [], healerRoundsEvents: [],
    deathSays: [], sitVerbMsgs: [], doorVerbMsgs: [], instrumentErrors: [],
    dutyCuresTotal: { ability: 0, medicine: 0, total: 0 },
  };
  return Object.assign(base, over || {});
}
// Fixture A: wound_fever episode open on the death day -> wound-first.
const corpusA = synthCorpus({
  daySeries: synthDaySeries(50, { 14: { v1: { name: 'wound fever', daysLeft: 1, severity: 1, diagnosed: false } } }, { 13: { v1: 25 } }, { 10: true, 11: true, 12: true, 13: true, 14: false }),
  sickOnsets: [{ day: 10, who: 'v1', whoName: 'Ana', kind: 'npc', name: 'wound fever', diseaseId: 'wound_fever', vector: 'wound', vectorSource: 'villageSicknessTick', vectorEvidence: 'hp<40 at onset: 30 (<40: true)', daysLeft0: 4, severity: 1, hpAtOnset: 30, rangeProfile: null, drinksDirty: false, hygiene: false, healerPresent: true, medicCount: 1, sayWin: [] }],
  sickEnds: [{ day: 14, who: 'v1', whoName: 'Ana', kind: 'npc', name: 'wound fever', diseaseId: 'wound_fever', outcome: 'died', by: 'villageSicknessTick' }],
  deathRows: [{ day: 14, who: 'v1', whoName: 'Ana', kind: 'villager', cause: "a wound that wouldn't close", causeRaw: "a wound that wouldn't close", monsterName: null, monsterId: null, isPlayer: false, sayWin: [] }],
  fallen: [{ villagerId: 'v1', day: 14, cause: "a wound that wouldn't close", name: 'Ana' }],
});
const builtA = FEVER.buildEpisodes(corpusA);
check('G1 join fixture A: buildEpisodes pairs the wound_fever onset+end', builtA.eps.length === 1 && builtA.eps[0].diseaseId === 'wound_fever' && builtA.eps[0].outcome === 'died', 'eps=' + JSON.stringify(builtA.eps.map(function (e) { return e.diseaseId + '/' + e.outcome; })));
const joinA = SD.joinWoundChain(corpusA, builtA, corpusA.fallen[0]);
check('G1 join fixture A: wound_fever open on death day -> wound-first', joinA.chain === 'wound-first', 'got ' + joinA.chain);
check('G1 join fixture A: onset->death is 4 days', joinA.onsetToDeath === 4, 'got ' + joinA.onsetToDeath);
check('G1 join fixture A: healer at onset recorded', joinA.healerPresentAtOnset === true);
check('G1 join fixture A: HP day before death is 25', joinA.hpDayBefore === 25, 'got ' + joinA.hpDayBefore);
// Fixture B: tick-fever episode open on the death day -> sickness-first.
const corpusB = synthCorpus({
  daySeries: synthDaySeries(50, { 23: { v2: { name: 'tick fever', daysLeft: 1, severity: 1, diagnosed: false } } }, { 22: { v2: 60 } }, {}),
  sickOnsets: [{ day: 20, who: 'v2', whoName: 'Bo', kind: 'npc', name: 'tick fever', diseaseId: 'disease', vector: 'tick', vectorSource: 'villageSicknessTick', vectorEvidence: 'range profile at onset: forager (forager/explorer: true)', daysLeft0: 3, severity: 1, hpAtOnset: 80, rangeProfile: 'forager', drinksDirty: false, hygiene: false, healerPresent: false, medicCount: 0, sayWin: [] }],
  sickEnds: [{ day: 23, who: 'v2', whoName: 'Bo', kind: 'npc', name: 'tick fever', diseaseId: 'disease', outcome: 'died', by: 'villageSicknessTick' }],
  deathRows: [{ day: 23, who: 'v2', whoName: 'Bo', kind: 'villager', cause: 'sickness', causeRaw: 'sickness', monsterName: null, monsterId: null, isPlayer: false, sayWin: [] }],
  fallen: [{ villagerId: 'v2', day: 23, cause: 'sickness', name: 'Bo' }],
});
const joinB = SD.joinWoundChain(corpusB, FEVER.buildEpisodes(corpusB), corpusB.fallen[0]);
check('G1 join fixture B: tick-fever episode open on death day -> sickness-first', joinB.chain === 'sickness-first', 'got ' + joinB.chain);
check('G1 join fixture B: onset->death is 3 days', joinB.onsetToDeath === 3, 'got ' + joinB.onsetToDeath);
// Fixture C: no episode, no snapshot record -> unlinked (pure HP-attrition wound death).
const corpusC = synthCorpus({
  daySeries: synthDaySeries(50, {}, { 29: { v3: 12 } }, { 30: false }),
  deathRows: [{ day: 30, who: 'v3', whoName: 'Cy', kind: 'villager', cause: "a wound that wouldn't close", causeRaw: "a wound that wouldn't close", monsterName: null, monsterId: null, isPlayer: false, sayWin: [] }],
  fallen: [{ villagerId: 'v3', day: 30, cause: "a wound that wouldn't close", name: 'Cy' }],
});
const joinC = SD.joinWoundChain(corpusC, FEVER.buildEpisodes(corpusC), corpusC.fallen[0]);
check('G1 join fixture C: no episode, no snapshot record -> unlinked', joinC.chain === 'unlinked', 'got ' + joinC.chain);
check('G1 join fixture C: HP day before death is 12', joinC.hpDayBefore === 12, 'got ' + joinC.hpDayBefore);
// Fixture D: snapshot-only wound fever (no episode window) -> wound-first via snapshot.
const corpusD = synthCorpus({
  daySeries: synthDaySeries(50, { 40: { v4: { name: 'wound fever', daysLeft: 2, severity: 1, diagnosed: false } } }, { 39: { v4: 35 } }, {}),
  deathRows: [{ day: 40, who: 'v4', whoName: 'Dee', kind: 'villager', cause: 'sickness', causeRaw: 'sickness', monsterName: null, monsterId: null, isPlayer: false, sayWin: [] }],
  fallen: [{ villagerId: 'v4', day: 40, cause: 'sickness', name: 'Dee' }],
});
const joinD = SD.joinWoundChain(corpusD, FEVER.buildEpisodes(corpusD), corpusD.fallen[0]);
check('G1 join fixture D: snapshot-only wound fever -> wound-first', joinD.chain === 'wound-first' && joinD.source.indexOf('snapshot') === 0, 'got ' + joinD.chain + ' via ' + joinD.source);
// Fixture E: wound-cause death while a TICK-fever episode is open (HP attrition
// while sick with tick fever) -> sickness-first. A cause-string-only join
// would call this wound-first — the discriminating case.
const corpusE = synthCorpus({
  daySeries: synthDaySeries(50, { 33: { v5: { name: 'tick fever', daysLeft: 1, severity: 1, diagnosed: false } } }, { 32: { v5: 8 } }, {}),
  sickOnsets: [{ day: 30, who: 'v5', whoName: 'Eli', kind: 'npc', name: 'tick fever', diseaseId: 'disease', vector: 'tick', vectorSource: 'villageSicknessTick', vectorEvidence: 'range profile at onset: explorer (forager/explorer: true)', daysLeft0: 3, severity: 1, hpAtOnset: 70, rangeProfile: 'explorer', drinksDirty: false, hygiene: false, healerPresent: false, medicCount: 0, sayWin: [] }],
  sickEnds: [{ day: 33, who: 'v5', whoName: 'Eli', kind: 'npc', name: 'tick fever', diseaseId: 'disease', outcome: 'died', by: 'villageSicknessTick' }],
  deathRows: [{ day: 33, who: 'v5', whoName: 'Eli', kind: 'villager', cause: "a wound that wouldn't close", causeRaw: "a wound that wouldn't close", monsterName: null, monsterId: null, isPlayer: false, sayWin: [] }],
  fallen: [{ villagerId: 'v5', day: 33, cause: "a wound that wouldn't close", name: 'Eli' }],
});
const joinE = SD.joinWoundChain(corpusE, FEVER.buildEpisodes(corpusE), corpusE.fallen[0]);
check('G1 join fixture E: wound-cause death with tick-fever episode open -> sickness-first', joinE.chain === 'sickness-first', 'got ' + joinE.chain);
// Sensitivity: a cause-string-only join misclassifies fixture E (real one does not).
function brokenCauseStringJoin(fallenEntry) {
  return fallenEntry.cause === "a wound that wouldn't close" ? 'wound-first' : 'sickness-first';
}
check('G1 sensitivity: cause-string-only join misclassifies fixture E (real join does not)',
  brokenCauseStringJoin(corpusE.fallen[0]) !== joinE.chain);

// ---- G1: checkCorpusDiag fixtures on synthetic corpora ----
const goodCk = SD.checkCorpusDiag(corpusA);
check('G1 corpus-check: synthetic good corpus passes', goodCk.ok, goodCk.problems.join('; '));
const badOrphan = synthCorpus({
  sickEnds: [{ day: 20, who: 'v9', whoName: 'No', kind: 'npc', name: 'tick fever', diseaseId: 'disease', outcome: 'recovered', by: 'villageSicknessTick' }],
});
const badOrphanCk = SD.checkCorpusDiag(badOrphan);
check('G1 corpus-check: orphan sickEnd fails', !badOrphanCk.ok && badOrphanCk.problems.some(function (p) { return /orphan/.test(p); }), badOrphanCk.problems.join('; '));
const badErrors = synthCorpus({ instrumentErrors: ['say-wrap: boom'] });
check('G1 corpus-check: instrument errors fail', !SD.checkCorpusDiag(badErrors).ok);
const badFallen = synthCorpus({
  fallen: [{ villagerId: 'vx', day: 12, cause: 'the wild', name: 'X' }],
});
check('G1 corpus-check: fallen without deathRow fails', !SD.checkCorpusDiag(badFallen).ok);

// ---- G2/G3 real legs (async) ----
async function main() {
  // G2 neutrality: recorded vs bare fingerprints identical on 58202 + 58206.
  for (const seed of [58202, 58206]) {
    const rec = await SWEEP.oneRun(seed, 150, { bare: false });
    const bare = await SWEEP.oneRun(seed, 150, { bare: true });
    const recFp = SD.buildFingerprint(rec.perSeed, rec.diag);
    const diff = SD.fingerprintsEqual(recFp, bare.fingerprint);
    check('G2 neutrality seed ' + seed + ': recorded == bare fingerprint', diff == null, diff || '');
    check('G2 real leg seed ' + seed + ': zero sit-verb calls (no-seat config live)', (rec.perSeed.sitVerbMsgs || []).length === 0 && (rec.perSeed.doorVerbMsgs || []).length === 0, 'sit=' + (rec.perSeed.sitVerbMsgs || []).length + ' door=' + (rec.perSeed.doorVerbMsgs || []).length);
    check('G2 real leg seed ' + seed + ': fallen present with day + cause', (rec.perSeed.fallen || []).length > 0 && (rec.perSeed.fallen || []).every(function (f) { return f.day != null && f.cause != null; }), 'fallen=' + (rec.perSeed.fallen || []).length);
    check('G2 real leg seed ' + seed + ': episodes built (onsets + ends present)', (rec.perSeed.sickOnsets || []).length > 0, 'onsets=' + (rec.perSeed.sickOnsets || []).length);
    check('G2 real leg seed ' + seed + ': zero instrument errors', (rec.perSeed.instrumentErrors || []).length === 0, JSON.stringify(rec.perSeed.instrumentErrors || []));
  }
  // Determinism smoke: same seed twice -> identical per-seed JSON.
  const d1 = await SWEEP.oneRun(58201, 150, { bare: false });
  const d2 = await SWEEP.oneRun(58201, 150, { bare: false });
  check('G2 determinism seed 58201: same seed twice -> identical per-seed JSON',
    JSON.stringify(d1.perSeed) === JSON.stringify(d2.perSeed));

  // G3 real corpus integrity on the committed pilot corpora (skip-until-present).
  const corpusDir = path.join(REPO, 'evidence', '2026-11-09', 'perseed-sicknessdiag-b');
  if (!fs.existsSync(corpusDir)) {
    skip('G3 real corpora', 'no committed pilot corpora yet at ' + corpusDir);
  } else {
    const files = fs.readdirSync(corpusDir).filter(function (f) { return /^sicknessdiag-b-winseek-s\d+\.json$/.test(f); }).sort();
    if (!files.length) skip('G3 real corpora', 'no per-seed files in ' + corpusDir);
    else {
      let allOk = true;
      for (const f of files) {
        const c = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
        const ck = SD.checkCorpusDiag(c);
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
