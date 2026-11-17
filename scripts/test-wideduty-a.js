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
// ADOPTION STATE (2026-11-17, run fleshout-20261117T1015Z): the lever
// is NOT in this tree — the Nov 9 run's lever commit survives only as
// orphaned commit 48c93b22b (game.js +66/-20). Legs L0-L3 are the lever
// spec: they run when Game.isMedicDutyEligible exists and SKIP with a
// note when it does not, so this file stays green as the measurement
// proof on the unlevered tree and becomes the full lever proof again
// the moment the lever is re-ported. Legs L4-L10 prove the measurement
// on the stranded corpora: recorder neutrality, pilot baseline +
// verdict, confirm verdict, corpus validity, panel compare, and
// byte-exact analyzer reproduction.
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
// L6 analyzer --before/--after verdict on the PILOT corpora
// (GO: 70.8%, zeroDutySeeds 2/8); L7 the same verdict on the CONFIRM
// corpora, seeds 96901-96912 (GO: 88.3%, dutyTrained 746/1439,
// zeroDutySeeds 0/12, medianSurvival 122d); L8 corpus validity —
// every expected per-seed file exists, parses, and carries the seed
// it is named for; L9 §15 panel compare recovered (decision
// review_required, no regression_signal, before/after panels share
// sourceHead 01540e4c5); L10 analyzer output reproduces the committed
// pilot + confirm analyzer .txt files byte-for-byte.
// Uses the shared harness (seeded RNG before eval).
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const zlib = require('zlib');
const assert = require('assert');

const ANALYZE = path.join(__dirname, 'analyze-wideduty-a.js');
const EVID = path.join(__dirname, '..', 'evidence', '2026-11-09');
const CORPUS = path.join(EVID, 'wideduty-a-corpus');
const AFTER = path.join(EVID, 'wideduty-a-corpus-after');
const CONFIRM_BEFORE = path.join(EVID, 'wideduty-a-confirm-before');
const CONFIRM_AFTER = path.join(EVID, 'wideduty-a-confirm-after');
const PANEL = path.join(EVID, 'wideduty-a-confirm-panel');
const CONFIRM_SEEDS = '96901,96902,96903,96904,96905,96906,96907,96908,96909,96910,96911,96912';
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;

let pass = 0, fail = 0, skip = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
function skipLeg(name, why) {
  skip++;
  console.log('SKIP ' + name + ' (' + why + ')');
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
  const LEVER = typeof Game.isMedicDutyEligible === 'function';
  console.log('    lever ' + (LEVER ? 'PRESENT (isMedicDutyEligible found — lever legs run)' : 'ABSENT (isMedicDutyEligible missing — L0-L3 skip; measurement legs prove the corpora)'));
  const roster = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const first = roster[0], second = roster[1];

  if (!LEVER) {
    skipLeg('L0 eligibility predicate', 'lever not in this tree (see adoption note)');
    skipLeg('L1 medicDutyTick assigns the trained holder; campHealerId sees them', 'lever not in this tree');
    skipLeg('L2 preference tiers', 'lever not in this tree');
    skipLeg('L3 live leg: seed 96302 holds the duty within 5 days', 'lever not in this tree');
  } else {
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
  }

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
    skipLeg('L6 analyzer --before/--after verdict (pilot)', 'no after corpus yet — run the after sweep first');
  } else {
    await aleg('L6 analyzer --before/--after verdict (pilot)', async () => {
      const r = cp.spawnSync(process.execPath, [ANALYZE, '--before', CORPUS, '--after', AFTER], { encoding: 'utf8' });
      assert.ok(/VERDICT: GO/.test(r.stdout), 'analyzer pilot verdict is GO');
      assert.ok(/dutyHeld=656\/926 share=70\.8%/.test(r.stdout), 'pilot after dutyHeld 656/926 = 70.8%');
      assert.ok(/dutyTrained=349\/926/.test(r.stdout), 'pilot after dutyTrained 349/926');
      assert.ok(/zeroDutySeeds=2\/8/.test(r.stdout), 'pilot after zeroDutySeeds 2/8');
      console.log('    pilot GO: 43.5% -> 70.8% duty-held, trained 0 -> 349 days, zero-duty seeds 3 -> 2');
    });
  }

  await aleg('L7 analyzer --before/--after verdict (confirm, seeds 96901-96912)', async () => {
    const r = cp.spawnSync(process.execPath, [ANALYZE, '--before', CONFIRM_BEFORE, '--after', CONFIRM_AFTER],
      { encoding: 'utf8', env: { ...process.env, WIDEDUTY_SEEDS: CONFIRM_SEEDS } });
    assert.strictEqual(r.status, 0, 'analyzer exits 0 on the confirm corpora: ' + (r.stderr || ''));
    assert.ok(/dutyHeld=1271\/1439 share=88\.3%/.test(r.stdout), 'confirm after dutyHeld 1271/1439 = 88.3%');
    assert.ok(/dutyTrained=746\/1439/.test(r.stdout), 'confirm after dutyTrained 746/1439 (51.8%)');
    assert.ok(/zeroDutySeeds=0\/12/.test(r.stdout), 'confirm after zeroDutySeeds 0/12');
    assert.ok(/medianSurvival=122d/.test(r.stdout), 'confirm after medianSurvival 122d');
    assert.ok(/starvationDeaths=1 /.test(r.stdout), 'confirm after starvationDeaths 1');
    assert.ok(/VERDICT: GO/.test(r.stdout), 'analyzer confirm verdict is GO');
    console.log('    confirm GO: 61.0% -> 88.3% duty-held, trained 0 -> 746 days, zero-duty seeds 2 -> 0');
  });

  leg('L8 corpus validity: every expected per-seed file exists, parses, carries its seed', () => {
    const check = (dir, seeds, kind) => {
      for (const s of seeds) {
        const f = path.join(dir, `wideduty-a-competent-s${s}.json`);
        assert.ok(fs.existsSync(f), 'missing ' + f);
        const d = JSON.parse(fs.readFileSync(f, 'utf8'));
        assert.ok(Array.isArray(d.days) && d.days.length > 0, 'seed ' + s + ' ' + kind + ' has days');
        assert.strictEqual(typeof d.daysAlive, 'number', 'seed ' + s + ' ' + kind + ' has daysAlive');
        assert.ok(d.daysAlive >= d.days.length && d.daysAlive - d.days.length <= 2,
          'seed ' + s + ' ' + kind + ' daysAlive ' + d.daysAlive + ' vs ' + d.days.length + ' recorded days');
      }
    };
    const pilot = [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308];
    const confirm = CONFIRM_SEEDS.split(',').map(Number);
    check(CORPUS, pilot, 'pilot-before');
    check(AFTER, pilot, 'pilot-after');
    check(CONFIRM_BEFORE, confirm, 'confirm-before');
    check(CONFIRM_AFTER, confirm, 'confirm-after');
    // Bare (recorder-neutrality) files where the run recorded them.
    for (const [dir, seeds] of [[CORPUS, pilot], [AFTER, pilot], [CONFIRM_BEFORE, [96910, 96911, 96912]]]) {
      for (const s of seeds) {
        const f = path.join(dir, `wideduty-a-bare-s${s}.json`);
        assert.ok(fs.existsSync(f), 'missing bare ' + f);
        JSON.parse(fs.readFileSync(f, 'utf8'));
      }
    }
    console.log('    8+8 pilot + 12+12 confirm competent files valid; bare files valid (8+8 pilot, 3 confirm-before)');
  });

  leg('L9 panel compare recovered: review_required, no regression_signal', () => {
    const md = path.join(PANEL, 'compare.md');
    const js = path.join(PANEL, 'compare.json');
    assert.ok(fs.existsSync(md), 'compare.md exists');
    assert.ok(fs.existsSync(js), 'compare.json exists');
    const mdtxt = fs.readFileSync(md, 'utf8');
    assert.ok(/Decision: review_required/.test(mdtxt), 'compare.md decision is review_required');
    assert.ok(!/regression_signal/.test(mdtxt), 'compare.md carries no regression_signal');
    const cmp = JSON.parse(fs.readFileSync(js, 'utf8'));
    assert.strictEqual(cmp.decision, 'review_required', 'compare.json decision is review_required');
    for (const side of ['panel-before', 'panel-after']) {
      const gz = path.join(PANEL, side, 'panel.json.gz');
      assert.ok(fs.existsSync(gz), side + ' panel.json.gz exists');
      const p = JSON.parse(zlib.gunzipSync(fs.readFileSync(gz)).toString('utf8'));
      assert.strictEqual(p.sourceHeadStart, '01540e4c5314177e32754c6d86c76814ac1eab3f',
        side + ' sourceHead is the rebuilt adopt-tree head 01540e4c5');
      assert.strictEqual(p.sourceHeadEnd, p.sourceHeadStart, side + ' sourceHead stable across the panel');
    }
    console.log('    G3 panel: review_required, 1 paired case per policy, both panels on 01540e4c5');
  });

  leg('L10 analyzer output reproduces the committed analyzer .txt files byte-for-byte', () => {
    const pilot = cp.spawnSync(process.execPath, [ANALYZE, '--before', CORPUS, '--after', AFTER], { encoding: 'utf8' });
    assert.strictEqual(pilot.stdout, fs.readFileSync(path.join(EVID, 'wideduty-a-pilot-analyzer.txt'), 'utf8'),
      'pilot analyzer output == wideduty-a-pilot-analyzer.txt');
    const confirm = cp.spawnSync(process.execPath, [ANALYZE, '--before', CONFIRM_BEFORE, '--after', CONFIRM_AFTER],
      { encoding: 'utf8', env: { ...process.env, WIDEDUTY_SEEDS: CONFIRM_SEEDS } });
    assert.strictEqual(confirm.stdout, fs.readFileSync(path.join(EVID, 'wideduty-a-confirm-analyzer.txt'), 'utf8'),
      'confirm analyzer output == wideduty-a-confirm-analyzer.txt');
    console.log('    pilot + confirm analyzer .txt reproduced exactly');
  });

  console.log(`\ntest-wideduty-a: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
