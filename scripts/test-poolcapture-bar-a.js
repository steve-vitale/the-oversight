#!/usr/bin/env node
// test-poolcapture-bar-a.js — proof for the pool-capture bar re-registration
// (backlog #1925) and the episode-join cure fix (backlog #1921), plus the
// medicdiag L2 revision's instrument (backlog #1926 is proved by
// test-medicdiag-a.js itself).
// Legs: U1 cureEvent join (scholar + NPC, window + disease matching);
// U2 'cured'-end join; U3 duty-snapshot join (daysLeft >= 3 cures, == 1
// does not, missing snapshot does not); U4 same-tick decomposition
// arithmetic; U5 capture-fraction + medic-days-only share math;
// C1 calibration re-read of the landed medicduty corpus (before/after):
// absentWithMedic 38 -> 18, capture 52.6% PASS, treated 35/135 = 25.9%,
// curedEpisodes 3, sameTickCures 30, careCoverage 39.4%, G1 PASS, exit 0;
// C2 feveranat analyzer on the after leg: treated 35 -> 36/141 (Rosa
// only — cureEvents are 0 on this corpus, so the cureEvent rule changes
// nothing here).
// Measurement-only: no src/js, no sweep re-runs; the corpus is read as
// landed. The calibration validates the INSTRUMENT, not the Haven Medic
// Duty build (whose verdict stands from the main-session decision).
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const { buildEpisodes } = require('./analyze-feveranat-a.js');
const ANALYZE_DUTY = path.join(__dirname, 'analyze-medicduty-a.js');
const ANALYZE_FEVER = path.join(__dirname, 'analyze-feveranat-a.js');
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-11-08', 'medicduty-a-corpus');

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}

// Minimal per-seed file shape for buildEpisodes: sickOnsets, sickEnds,
// treatEvents, cureEvents, daySeries, daysAlive, deathRows.
function seedFile(over) {
  return Object.assign({
    seed: 1, daysAlive: 10, deathRows: [],
    sickOnsets: [], sickEnds: [], treatEvents: [], cureEvents: [],
    daySeries: [],
  }, over);
}
function npcOnset(day, who, name, diseaseId, daysLeft0) {
  return { day, who, whoName: who, kind: 'npc', name, diseaseId,
    vector: 'tick', vectorSource: 'villageSicknessTick', daysLeft0,
    severity: 1, healerPresent: false, medicCount: 0 };
}
function npcEnd(day, who, name, diseaseId, outcome) {
  return { day, who, whoName: who, kind: 'npc', name, diseaseId, outcome, by: 'villageSicknessTick' };
}
function snap(day, who, daysLeft) {
  const sickMap = {};
  if (who) sickMap[who] = { name: 'tick fever', daysLeft, severity: 1, diagnosed: false };
  return { day, sickMap };
}

leg('U1 cureEvent join: scholar cure in-window + disease match counts as treated; wrong disease / out-of-window does not', () => {
  const f = seedFile({
    sickOnsets: [
      { day: 2, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'disease', diseaseId: 'disease', daysLeft0: null, dayPartsLeft0: 8 },
      { day: 3, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'gutrot', diseaseId: 'gutrot', daysLeft0: null, dayPartsLeft0: 8 },
    ],
    sickEnds: [
      { day: 5, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'disease', diseaseId: 'disease', outcome: 'cured', by: 'cureStatus' },
      { day: 6, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'gutrot', diseaseId: 'gutrot', outcome: 'recovered (expired)', by: 'seRemove' },
    ],
    cureEvents: [{ day: 5, target: 'scholar', diseaseId: 'disease', source: 'triage' }],
  });
  const { eps } = buildEpisodes(f);
  assert.strictEqual(eps.length, 2, 'two scholar episodes built');
  const fever = eps.find(e => e.diseaseId === 'disease');
  const gut = eps.find(e => e.diseaseId === 'gutrot');
  assert.ok(fever.treated && fever.cured && fever.curedBy === 'cureEvent', 'scholar fever cured by cureEvent');
  assert.ok(fever.treatKinds.includes('cure'), 'cure in treatKinds');
  assert.ok(!gut.treated, 'gutrot (wrong disease, no cureEvent) stays untreated');
  // Out-of-window cureEvent: cure on day 9, after the episode ended day 5.
  const f2 = seedFile({
    sickOnsets: [{ day: 2, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'disease', diseaseId: 'disease', daysLeft0: null, dayPartsLeft0: 8 }],
    sickEnds: [{ day: 5, who: 'scholar', whoName: 'scholar', kind: 'scholar', name: 'disease', diseaseId: 'disease', outcome: 'recovered (expired)', by: 'seRemove' }],
    cureEvents: [{ day: 9, target: 'scholar', diseaseId: 'disease', source: 'triage' }],
  });
  const { eps: eps2 } = buildEpisodes(f2);
  assert.ok(!eps2[0].treated, 'cureEvent after the episode window does not count');
  console.log('    scholar cureEvent in-window treated; wrong-disease and out-of-window ignored');
});

leg('U1b cureEvent join: NPC cure matches on who+day when diseaseId is null (food-name episode)', () => {
  const f = seedFile({
    sickOnsets: [npcOnset(2, 'ada', 'bad belly', null, 4)],
    sickEnds: [npcEnd(4, 'ada', 'bad belly', null, 'recovered')],
    cureEvents: [{ day: 4, target: 'ada', diseaseId: 'disease', source: 'triage' }],
  });
  const { eps } = buildEpisodes(f);
  assert.ok(eps[0].treated && eps[0].cured, 'NPC food-name episode cured by who+day cureEvent');
  const f2 = seedFile({
    sickOnsets: [npcOnset(2, 'ada', 'tick fever', 'disease', 4)],
    sickEnds: [npcEnd(4, 'ada', 'tick fever', 'disease', 'recovered')],
    cureEvents: [{ day: 4, target: 'ada', diseaseId: 'gutrot', source: 'triage' }],
  });
  const { eps: eps2 } = buildEpisodes(f2);
  assert.ok(!eps2[0].treated, 'NPC cureEvent with a mismatching known diseaseId does not count');
  console.log('    NPC null-diseaseId matches on who+day; known-disease mismatch ignored');
});

leg('U2 cured-end join: an episode ending cured counts as treated even with no treatEvent', () => {
  const f = seedFile({
    sickOnsets: [npcOnset(2, 'bob', 'wound fever', 'wound_fever', 5)],
    sickEnds: [npcEnd(3, 'bob', 'wound fever', 'wound_fever', 'cured')],
  });
  const { eps } = buildEpisodes(f);
  assert.ok(eps[0].treated && eps[0].cured && eps[0].curedBy === 'cured-end', 'cured end treated');
  console.log('    outcome cured -> treated, curedBy cured-end');
});

leg('U3 duty-snapshot join: recovered end with end-day daysLeft >= 3 is a duty cure; == 1 is natural; missing snapshot is not', () => {
  const f = seedFile({
    sickOnsets: [npcOnset(2, 'ada', 'tick fever', 'disease', 5),
      npcOnset(2, 'bob', 'tick fever', 'disease', 5),
      npcOnset(2, 'cyd', 'tick fever', 'disease', 5)],
    sickEnds: [npcEnd(5, 'ada', 'tick fever', 'disease', 'recovered'),
      npcEnd(5, 'bob', 'tick fever', 'disease', 'recovered'),
      npcEnd(5, 'cyd', 'tick fever', 'disease', 'recovered')],
    daySeries: [{ day: 5, sickMap: {
      ada: { name: 'tick fever', daysLeft: 3, severity: 1, diagnosed: false },
      bob: { name: 'tick fever', daysLeft: 1, severity: 1, diagnosed: false },
    } }],
    // cyd has no day-5 snapshot entry at all (record already gone / no snapshot).
  });
  const { eps } = buildEpisodes(f);
  const byWho = {};
  for (const e of eps) byWho[e.who] = e;
  assert.ok(byWho.ada.treated && byWho.ada.cured && byWho.ada.curedBy === 'duty-snapshot', 'ada dl=3 -> duty cure');
  assert.ok(!byWho.bob.treated && !byWho.bob.cured, 'bob dl=1 -> natural expiry, untreated');
  assert.ok(!byWho.cyd.treated && !byWho.cyd.cured, 'cyd (no snapshot) -> not attributed, stays untreated');
  assert.strictEqual(byWho.ada.outcome, 'recovered', 'cured episode keeps its corpus outcome');
  console.log('    dl>=3 cured, dl==1 natural, missing snapshot unattributed');
});

leg('U4 same-tick decomposition: totalDutyCures - attributedCuredEpisodes = sameTickCures', () => {
  const decompose = (totalCures, curedEpisodes) => Math.max(0, totalCures - curedEpisodes);
  assert.strictEqual(decompose(33, 3), 30, 'medicduty corpus: 33 - 3 = 30 same-tick cures');
  assert.strictEqual(decompose(0, 0), 0, 'before leg: 0 - 0 = 0');
  assert.strictEqual(decompose(2, 5), 0, 'never negative (defensive)');
  const careCoverage = (treated, eps, sameTick) => (treated + sameTick) / (eps + sameTick);
  assert.ok(Math.abs(careCoverage(35, 135, 30) - 65 / 165) < 1e-12, 'after care coverage 65/165 = 39.4%');
  assert.ok(Math.abs(careCoverage(71, 156, 0) - 71 / 156) < 1e-12, 'before care coverage == treated share when no cures');
  console.log('    33-3=30; care coverage 39.4% after, 45.5% before');
});

leg('U5 capture + medic-days-only share math: 38->18 is 52.6% PASS; 38->20 is 47.4% FAIL', () => {
  const capture = (b, a) => (b - a) / b;
  assert.ok(Math.abs(capture(38, 18) - 20 / 38) < 1e-12, 'capture 20/38');
  assert.ok(capture(38, 18) >= 0.50, '52.6% >= 50% PASS');
  assert.ok(capture(38, 20) < 0.50, '47.4% < 50% FAIL');
  const medicDaysShare = (present, absentWithMedic) => present / (present + absentWithMedic);
  assert.ok(Math.abs(medicDaysShare(113, 38) - 113 / 151) < 1e-12, 'before medic-days-only 74.8%');
  assert.ok(Math.abs(medicDaysShare(110, 18) - 110 / 128) < 1e-12, 'after medic-days-only 85.9%');
  console.log('    capture 52.6% PASS / 47.4% FAIL; medic-days-only 74.8% -> 85.9%');
});

leg('C1 calibration re-read: medicduty corpus under the re-registered bar (capture 52.6% PASS, treated 35/135, sameTick 30)', () => {
  const beforeDir = path.join(CORPUS, 'before');
  const afterDir = path.join(CORPUS, 'after');
  for (const [dir, n] of [[beforeDir, 8], [afterDir, 8]]) {
    const files = fs.readdirSync(dir).filter(f => /^medicduty-a-competent-s\d+\.json$/.test(f));
    assert.strictEqual(files.length, n, dir + ' holds ' + n + ' duty seed files');
  }
  const r = cp.spawnSync(process.execPath, [ANALYZE_DUTY, '--before', beforeDir, '--after', afterDir],
    { encoding: 'utf8', timeout: 120000 });
  assert.strictEqual(r.status, 0, 'analyzer exit 0 under the re-registered bar: ' + (r.stderr || '').slice(0, 300));
  const out = r.stdout;
  assert.ok(/before absentWithMedic=38 after=18 capture=52\.6%/.test(out), 'capture 52.6% printed');
  assert.ok(/G1 PASS/.test(out), 'G1 PASS under the re-registered bar');
  assert.ok(/VERDICT: GO/.test(out), 'verdict GO (calibration of the instrument, not a re-judgment of the build)');
  assert.ok(/treated=35 treatedShare=25\.9%/.test(out), 'treated repaired 34 -> 35/135 = 25.9%');
  assert.ok(/curedEpisodes=3 totalDutyCures=33 sameTickCures=30/.test(out), 'cure decomposition 3 + 30 = 33');
  assert.ok(/careCoverage=39\.4%/.test(out), 'care coverage 39.4%');
  assert.ok(/medic-days-only share=85\.9%/.test(out), 'after medic-days-only share 85.9%');
  assert.ok(/medic-days-only share=74\.8%/.test(out), 'before medic-days-only share 74.8%');
  console.log('    analyzer on landed corpus: capture 52.6% PASS, treated 35/135, sameTick 30, G1 PASS, exit 0');
});

leg('C2 calibration re-read: feveranat analyzer on the after leg treats 36/141 (Rosa only)', () => {
  const r = cp.spawnSync(process.execPath, [ANALYZE_FEVER, path.join(CORPUS, 'after')],
    { encoding: 'utf8', timeout: 120000 });
  assert.strictEqual(r.status, 0, 'feveranat analyzer exit 0: ' + (r.stderr || '').slice(0, 300));
  assert.ok(/episodes treated=36\/141/.test(r.stdout), 'treated 35 -> 36/141 (only Rosa newly treated; cureEvents are 0 here)');
  assert.ok(/duty-snapshot 3/.test(r.stdout), '3 duty-snapshot cures attributed');
  console.log('    feveranat after leg: treated 36/141, duty-snapshot 3');
});

console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
