#!/usr/bin/env node
// test-wideduty-a.js — proof for the WIDEN THE DUTY build.
// (sim-wideduty-a, 2026-11-09, oversight-flesh-out-loop run
// fleshout-20261109T1015Z, Loop A, axis food-economy, blank #2 from
// sim-medheadcount-a.)
//
// The lever (game.js only): isMedicDutyEligible — a medical occupation,
// OR wound_care/herbal_medicine skill, OR triage/herbal_remedy/
// field_medicine ability — gates medicDutyHolder / medicDutyTick;
// the duty holder joins the villagerCareTick tenders list and is
// returned by campHealerId at Haven, so the duty's tend-first + cure
// attempt + healer presence actually fire for a trained holder.
// No spawn, teaching, cure-channel, or stay-home change.
//
// Legs: L0 the eligibility predicate (untrained / scholar / unknown
// false; wound_care -> true + triage + field_medicine via the skill
// lane; herbal_medicine -> true + herbal_remedy); L1 medicDutyTick
// assigns a trained holder on medic-less seed 96302 and campHealerId
// sees them; L2 preference tiers — an ability-holding trained
// villager is picked over an occupation medic without a healing
// ability, and the duty reassigns when the holder loses eligibility;
// L3 live leg — seed 96302 holds the duty within a 5-day run (before
// leg: 0/97 duty-held days); L4 recorder neutrality — the before-leg
// bare fingerprints equal the competent fingerprints seed-for-seed;
// L5 analyzer reproduces the prereg baseline on the before corpus
// (dutyHeld 342/786 = 43.5%, zeroDutySeeds 3/8, medianSurvival 97d);
// L6 analyzer --before/--after verdict (runs only when the after
// corpus exists; skipped otherwise — the pilot judge lives in the
// evidence file).
// Uses the shared harness (seeded RNG before eval).
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const ANALYZE = path.join(__dirname, 'analyze-wideduty-a.js');
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-11-09', 'wideduty-a-corpus');
const AFTER = path.join(__dirname, '..', 'evidence', '2026-11-09', 'wideduty-a-corpus-after');
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;

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
  const { oneRun } = require('./sweep-wideduty-a.js');

  const { Game } = await loadGame({ seed: 96302, mode: 'wideduty-a-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const first = roster[0], second = roster[1];

  leg('L0 eligibility predicate: untrained/scholar/unknown false; taught true', () => {
    assert.strictEqual(Game.isMedicDutyEligible(first), false,
      'untrained non-medic is not eligible');
    assert.strictEqual(Game.isMedicDutyEligible(Game.villagerId), false,
      'the scholar is never eligible');
    assert.strictEqual(Game.isMedicDutyEligible(null), false, 'null is not eligible');
    assert.strictEqual(Game.isMedicDutyEligible('no_such_id'), false, 'unknown id is not eligible');
    Game.npcLearnSkill(first, 'wound_care');
    assert.strictEqual(Game.npcKnowsSkill(first, 'wound_care'), true, 'wound_care learned');
    assert.strictEqual(Game.npcHasAbility(first, 'triage'), true,
      'triage rides the wound_care skill lane');
    assert.strictEqual(Game.npcHasAbility(first, 'field_medicine'), true,
      'field_medicine rides the wound_care skill lane');
    assert.strictEqual(Game.isMedicDutyEligible(first), true,
      'wound_care holder is eligible');
    Game.npcLearnSkill(second, 'herbal_medicine');
    assert.strictEqual(Game.npcHasAbility(second, 'herbal_remedy'), true,
      'herbal_remedy rides the herbal_medicine skill lane');
    assert.strictEqual(Game.isMedicDutyEligible(second), true,
      'herbal_medicine holder is eligible');
    console.log('    wound_care -> triage + field_medicine; herbal_medicine -> herbal_remedy');
  });

  leg('L1 medicDutyTick assigns the trained holder; campHealerId sees them', () => {
    const assigned = Game.medicDutyTick();
    assert.strictEqual(assigned, first, 'tick assigns the trained villager, got ' + assigned);
    assert.strictEqual(Game.medicDutyHolder(), first, 'holder reads back');
    assert.strictEqual(Game.campHealerId('haven'), first, 'campHealerId(haven) returns the holder');
    assert.strictEqual(Game.campHealerId('here'), first, 'campHealerId(here) returns the holder while home');
    console.log('    holder ' + first + ' assigned + visible as camp healer');
  });

  leg('L2 preference tiers: ability-holding trained villager beats an ability-less occupation medic', () => {
    // Fixture-only mutation: give `second` a medical occupation without
    // any healing ability (herbal_medicine was taught in L0 — remove it
    // so `second` is a pure title-medic, tier 1).
    const store = Game.state.village.npcSkills[second];
    const ix = store.indexOf('herbal_medicine');
    if (ix >= 0) store.splice(ix, 1);
    assert.strictEqual(Game.isMedicDutyEligible(second), false,
      'herbal_medicine removed: no longer eligible (not yet a title-medic)');
    const p = Game.getPerson(second);
    p.formerOccupation = 'Dentist';
    assert.ok(MED_OCC.test(String(p.formerOccupation)), 'fixture occupation matches the duty regex');
    assert.strictEqual(Game.isMedicDutyEligible(second), true,
      'title-medic is eligible via occupation');
    assert.strictEqual(Game.npcHasAbility(second, 'triage'), false,
      'title-medic holds no healing ability');
    assert.strictEqual(Game.npcHasAbility(second, 'herbal_remedy'), false,
      'title-medic holds no herbal_remedy');
    // `first` (tier 0, ability holder) must keep the duty over `second`
    // (tier 1, title only), even though `second` is an occupation medic.
    assert.strictEqual(Game.medicDutyTick(), first,
      'tier-0 trained holder beats tier-1 occupation medic');
    // The duty reassigns when the holder loses eligibility.
    const store1 = Game.state.village.npcSkills[first];
    store1.splice(store1.indexOf('wound_care'), 1);
    assert.strictEqual(Game.isMedicDutyEligible(first), false, 'skill removed: no longer eligible');
    assert.strictEqual(Game.medicDutyHolder(), null, 'holder reads vacant');
    assert.strictEqual(Game.medicDutyTick(), second,
      'tick reassigns to the occupation medic');
    console.log('    tier 0 (ability) > tier 1 (title); vacancy reassigns');
  });

  await aleg('L3 live leg: seed 96302 holds the duty within 5 days', async () => {
    const { perSeed } = await oneRun(96302, 5, { bare: false });
    const held = (perSeed.days || []).filter(d => d.dutyHeld).length;
    const trained = (perSeed.days || []).filter(d => d.dutyTrained).length;
    assert.ok(held >= 1, 'seed 96302 holds the duty within 5 days, got ' + held + '/5 (before leg: 0/97)');
    assert.ok(trained >= 1, 'the holder is trained-only, got ' + trained + '/5 trained-held days');
    console.log('    seed 96302 5-day run: dutyHeld=' + held + '/5 dutyTrained=' + trained + '/5 (before: 0/97)');
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
    assert.ok(/dutyHeld=342\/786 share=43\.5%/.test(r.stdout),
      'analyzer before-leg dutyHeld is 342/786 = 43.5%: ' + (r.stdout || '').split('\n')[2]);
    assert.ok(/zeroDutySeeds=3\/8/.test(r.stdout), 'analyzer before-leg zeroDutySeeds is 3/8');
    assert.ok(/medianSurvival=97d/.test(r.stdout), 'analyzer before-leg medianSurvival is 97d');
    console.log('    baseline pinned: dutyHeld 43.5%, zeroDutySeeds 3/8, medianSurvival 97d');
  });

  if (!fs.existsSync(AFTER)) {
    skip++;
    console.log('SKIP L6 analyzer --before/--after verdict (no after corpus yet — run the after sweep first)');
  } else {
    await aleg('L6 analyzer --before/--after verdict', async () => {
      const r = cp.spawnSync(process.execPath, [ANALYZE, '--before', CORPUS, '--after', AFTER], { encoding: 'utf8' });
      console.log(r.stdout);
      assert.ok(/VERDICT: GO/.test(r.stdout), 'analyzer verdict is GO');
    });
  }

  console.log(`\ntest-wideduty-a: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
