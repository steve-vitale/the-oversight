#!/usr/bin/env node
// test-medheadcount-a.js — proof for the MEDIC HEADCOUNT build.
// (sim-medheadcount-a, 2026-11-08, backlog #1920.)
//
// STATUS 2026-11-09 (main-session closeout of the timed-out 0715Z
// adoption): pilot judged NO-GO ON LANDING — the prereg bars pass
// (G1 82.3% ≥ 70%, 0 zero-medic seeds; G2 pass; G3 compare
// review_required, no regression_signal; G4 this test 7/7), but the
// gate attributes 10 new failures to the lever (fixed-tree fails /
// base-tree passes, standalone, deterministic), so the fix is
// REVERTED (zero src/js diff vs base). This test is retained as the
// lever's specification: it FAILS (4/7 — L0/L1/L3, the lever legs)
// on the reverted tree by design and PASSES (7/7) when the fix is
// re-applied. Do NOT add it to the green list while the fix is
// reverted. See evidence/2026-11-08/sim-medheadcount-a.md (main-session
// closeout addendum) for the attribution table and the next-arm brief
// (suite updates with per-test justification, or a narrower
// implementation; 12–16 seed confirm band still owed).
// Legs: L0 genCharacter forceOccIds draws only from the forced set;
// L1 genRoster guarantee — every starting cast holds >=1 medical
// occupation (20 rosters); L2 the four choice cards stay unforced (their
// medic count varies across rosters — the guarantee touches only the two
// extras); L3 live leg — seed 96302, medic-less at spawn on the before
// leg, now spawns a medic (5-day run); L4 recorder neutrality — the
// before-leg bare fingerprints equal the competent fingerprints
// seed-for-seed (recorder reads only); L5 analyzer reproduces the
// prereg baseline on the before corpus (share 56.1%, zeroMedicSeeds 2 —
// re-anchored 2026-11-09 to the FIXED recorder's before leg; the 51.6% /
// 3-of-8 numbers were measured with the contaminated recorder that
// seeded occupation skills daily and are DISCARDED per the prereg's
// contamination correction);
// L6 analyzer --before/--after verdict (runs only when the after corpus
// exists; skipped otherwise — the pilot judge lives in the evidence file).
// L7 (sim-medheadcount-metricfix-a 2026-11-09: THE REDACTOR revision) —
// the revised new-modes wiring: (a) replay on the COMMITTED confirm
// corpora, where "the redactor":2 failed the old wiring — must now read
// "none" and VERDICT GO; (b) synthetic pair where after adds
// "the redactor":2 (absent in before) — must read "none"; (c) synthetic
// control where after adds a genuinely new non-fight cause >=2 — must
// still FLAG it (the clause still bites). L7 tests the analyzer, not the
// lever: it passes on a reverted tree too.
// Uses the shared harness (seeded RNG before eval).
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const ANALYZE = path.join(__dirname, 'analyze-medheadcount-a.js');
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-11-08', 'medheadcount-a-corpus');
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;
const MED_IDS = ['er_nurse', 'paramedic', 'army_medic', 'midwife', 'dentist', 'pharmacist', 'veterinarian'];

let pass = 0, fail = 0, skip = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}

(async () => {
  const { loadGame, setupGame } = require('./sim-harness');
  const { oneRun } = require('./sweep-medheadcount-a.js');

  const { Game } = await loadGame({ seed: 96302, mode: 'medheadcount-a-test', fullTelemetry: false });
  await setupGame(Game);

  leg('L0 genCharacter forceOccIds draws only medical occupations', () => {
    for (let i = 0; i < 5; i++) {
      const c = Game.genCharacter({ usedNames: new Set(), usedOccs: new Set(), forceOccIds: MED_IDS });
      assert.ok(c, 'a character is generated');
      assert.ok(MED_IDS.indexOf(c.occupationId) >= 0,
        'forced occupation is medical, got ' + c.occupationId + ' (' + c.formerOccupation + ')');
      assert.ok(MED_OCC.test(String(c.formerOccupation || '')),
        'forced occupation matches the duty regex: ' + c.formerOccupation);
    }
    // Empty restriction falls back to the full pool (no crash, any occupation).
    const any = Game.genCharacter({ usedNames: new Set(), usedOccs: new Set(), forceOccIds: [] });
    assert.ok(any && any.occupationId, 'empty forceOccIds still generates a character');
    const none = Game.genCharacter({ usedNames: new Set(), usedOccs: new Set(), forceOccIds: ['no_such_occ'] });
    assert.ok(none && none.occupationId, 'unknown forceOccIds falls back to the full pool');
    console.log('    forced draws: 5/5 medical; fallbacks generate normally');
  });

  leg('L1 genRoster guarantee: every starting cast holds >=1 medic (20 rosters)', () => {
    let totalMedics = 0;
    for (let i = 0; i < 20; i++) {
      const chars = Game.genRoster('somewhere');
      assert.ok(Array.isArray(chars) && chars.length === 6, 'roster is 6 generated chars, got ' + (chars && chars.length));
      const medics = chars.filter(c => MED_OCC.test(String(c.formerOccupation || '')));
      assert.ok(medics.length >= 1, 'roster ' + i + ' has no medic: ' + chars.map(c => c.formerOccupation).join(', '));
      totalMedics += medics.length;
      // The medic is a real person with the occupation's grants wired:
      // npcSeedSkills seeds wound_care / herbal_medicine from backgrounds.
      const m = medics[0];
      assert.ok(m.name && m.formerOccupation && m.occupationId, 'medic char is a full person');
    }
    console.log('    20/20 rosters hold >=1 medic; total medics across rosters: ' + totalMedics);
  });

  leg('L2 the four choice cards stay unforced (medic count varies)', () => {
    let candMedics = 0, rostersWithCandMedic = 0;
    for (let i = 0; i < 20; i++) {
      const chars = Game.genRoster('somewhere');
      const cand = chars.slice(0, 4).filter(c => MED_OCC.test(String(c.formerOccupation || '')));
      candMedics += cand.length;
      if (cand.length) rostersWithCandMedic++;
    }
    // Candidates are uniform draws (~9% medic each): across 20 rosters
    // expect a handful of candidate medics, never all 80 cards medical
    // (that would prove the guarantee leaked into the choice cards) and
    // never zero rosters with one (that would prove it never happens).
    assert.ok(candMedics > 0 && candMedics < 40,
      'candidate medics across 20 rosters should vary, got ' + candMedics + '/80');
    assert.ok(rostersWithCandMedic > 0 && rostersWithCandMedic < 20,
      'rosters with a candidate medic should vary, got ' + rostersWithCandMedic + '/20');
    console.log('    candidate medics: ' + candMedics + '/80 cards across 20 rosters; ' + rostersWithCandMedic + '/20 rosters have one');
  });

  await aleg('L3 live leg: seed 96302 (medic-less at spawn before) now spawns a medic', async () => {
    const { perSeed } = await oneRun(96302, 5, { bare: false });
    assert.ok(perSeed && perSeed.spawn, 'spawn record exists');
    assert.ok((perSeed.spawn.medics || 0) >= 1,
      'seed 96302 spawns with a medic now, got ' + (perSeed.spawn.medics || 0));
    console.log('    seed 96302 spawn pop=' + perSeed.spawn.pop + ' medics=' + perSeed.spawn.medics);
  });

  leg('L4 recorder neutrality: bare fingerprints equal competent fingerprints', () => {
    const summary = path.join(CORPUS, 'sweep-competent.json');
    assert.ok(fs.existsSync(summary), 'before-leg summary exists: ' + summary);
    const s = JSON.parse(fs.readFileSync(summary, 'utf8'));
    assert.strictEqual((s.rows || []).length, 8, '8 competent rows');
    assert.strictEqual((s.bare || []).length, 8, '8 bare rows');
    for (const row of s.rows) {
      const bare = (s.bare || []).find(b => b.seed === row.seed);
      assert.ok(bare, 'bare row for seed ' + row.seed);
      const fp = row.fingerprint, bf = bare;
      for (const k of ['daysAlive', 'endReason', 'rank', 'maxWave', 'national', 'table', 'win', 'finalPop']) {
        assert.deepStrictEqual(bf[k], fp[k], 'seed ' + row.seed + ' fingerprint.' + k + ' matches (recorder neutral)');
      }
      assert.deepStrictEqual(bf.deathCauses, fp.deathCauses, 'seed ' + row.seed + ' deathCauses match');
      assert.deepStrictEqual(bf.deathKeys, fp.deathKeys, 'seed ' + row.seed + ' deathKeys match');
    }
    console.log('    8/8 seeds: bare == competent fingerprints (days, rank, wave, deaths identical)');
  });

  leg('L5 analyzer reproduces the prereg baseline on the before corpus', () => {
    const r = cp.spawnSync(process.execPath, [ANALYZE, '--leg', CORPUS], { encoding: 'utf8' });
    assert.ok(/medicPresent=543\/968 share=56\.1%/.test(r.stdout),
      'analyzer before-leg share is 56.1% (543/968): ' + (r.stdout || '').split('\n')[2]);
    assert.ok(/zeroMedicSeeds=2\/8/.test(r.stdout), 'analyzer before-leg zeroMedicSeeds is 2/8');
    assert.ok(/spawnSeedsWithMedic=4\/8/.test(r.stdout), 'analyzer before-leg spawnSeedsWithMedic is 4/8');
    console.log('    baseline pinned: share 56.1%, zeroMedicSeeds 2/8, spawnSeedsWithMedic 4/8');
  });

  const afterDir = path.join(__dirname, '..', 'evidence', '2026-11-08', 'medheadcount-a-corpus-after');
  if (!fs.existsSync(afterDir)) {
    skip++;
    console.log('SKIP L6 analyzer --before/--after verdict (no after corpus yet — run the after sweep first)');
  } else {
    await aleg('L6 analyzer --before/--after verdict', async () => {
      const r = cp.spawnSync(process.execPath, [ANALYZE, '--before', CORPUS, '--after', afterDir], { encoding: 'utf8' });
      console.log(r.stdout);
      assert.ok(/VERDICT: GO/.test(r.stdout), 'analyzer verdict is GO');
    });
  }

  await aleg('L7 revised new-modes wiring: monster-name collapse (THE REDACTOR)', async () => {
    // (a) Replay on the COMMITTED confirm corpora — the exact case that
    // failed the old wiring ("the redactor":2 in after, absent in before).
    const confirmBefore = path.join(__dirname, '..', 'evidence', '2026-11-09', 'medheadcount-confirm-before');
    const confirmAfter = path.join(__dirname, '..', 'evidence', '2026-11-09', 'medheadcount-confirm-after');
    const seeds16 = '96009,96010,96011,96012,96013,96014,96015,96016,96017,96018,96019,96020,96021,96022,96023,96024';
    const rr = cp.spawnSync(process.execPath,
      [ANALYZE, '--before', confirmBefore, '--after', confirmAfter, '--seeds', seeds16],
      { encoding: 'utf8' });
    assert.ok(/G2 NEW-MODES \(mode reading, fight labels collapsed\): none -> PASS/.test(rr.stdout),
      'confirm replay reads NEW-MODES none: ' + (rr.stdout || '').split('\n').filter(l => /NEW-MODES|VERDICT/.test(l)).join(' | '));
    assert.ok(/VERDICT: GO/.test(rr.stdout), 'confirm replay verdict is GO under the revised wiring');
    // (b)+(c) Synthetic pairs: minimal per-seed corpora, 2 seeds each.
    function synthPair(beforeCauses, afterCauses) {
      const base = fs.mkdtempSync(path.join(os.tmpdir(), 'medheadcount-l7-'));
      const bd = path.join(base, 'before'), ad = path.join(base, 'after');
      fs.mkdirSync(bd); fs.mkdirSync(ad);
      for (const s of [1, 2]) {
        const days = [];
        for (let d = 1; d <= 100; d++) days.push({ day: d, pop: 6, medicCount: 1, wcHolders: 1, hmHolders: 0, triageHolders: 0, triageNonMedic: 0, herbalRemedyHolders: 0, fieldMedHolders: 0 });
        const mk = (causes) => ({ seed: s, policy: 'competent', plentydepri: 1, depositgate: 1,
          daysAlive: 100, villageDays: 100, deathCauses: causes, deathRows: [],
          spawn: { day: 1, pop: 6, medics: 1 }, days, lessons: [], joins: [], medicDeaths: [],
          national: false, table: false, win: false, waveReach: [1, 2, 3, 4] });
        fs.writeFileSync(path.join(bd, `medheadcount-a-competent-s${s}.json`), JSON.stringify(mk(beforeCauses)));
        fs.writeFileSync(path.join(ad, `medheadcount-a-competent-s${s}.json`), JSON.stringify(mk(afterCauses)));
      }
      return { bd, ad };
    }
    const p1 = synthPair({ monster: 5, 'the wild': 10 }, { monster: 5, 'the wild': 10, 'the redactor': 2 });
    const r1 = cp.spawnSync(process.execPath,
      [ANALYZE, '--before', p1.bd, '--after', p1.ad, '--seeds', '1,2'], { encoding: 'utf8' });
    assert.ok(/G2 NEW-MODES \(mode reading, fight labels collapsed\): none -> PASS/.test(r1.stdout),
      'synthetic redactor pair reads NEW-MODES none: ' + (r1.stdout || '').split('\n').filter(l => /NEW-MODES/.test(l)).join(' | '));
    assert.ok(/VERDICT: GO/.test(r1.stdout), 'synthetic redactor pair verdict is GO');
    const p2 = synthPair({ monster: 5, 'the wild': 10 }, { monster: 5, 'the wild': 10, drowning: 2 });
    const r2 = cp.spawnSync(process.execPath,
      [ANALYZE, '--before', p2.bd, '--after', p2.ad, '--seeds', '1,2'], { encoding: 'utf8' });
    assert.ok(/G2 NEW-MODES \(mode reading, fight labels collapsed\): drowning:4 -> FAIL/.test(r2.stdout),
      'synthetic control still flags a genuinely new non-fight cause: ' + (r2.stdout || '').split('\n').filter(l => /NEW-MODES/.test(l)).join(' | '));
    assert.strictEqual(r2.status, 1, 'synthetic control exits NO-GO (1)');
    console.log('    confirm replay: NEW-MODES none, VERDICT GO; synthetic redactor: none/GO; synthetic control: drowning:2 flagged');
  });

  console.log(`\ntest-medheadcount-a: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
