#!/usr/bin/env node
// test-medchannel-seed-a.js — proof for the medicine-channel seeded-stash measurement.
// Legs: L1 seeder (puts 20+20 doses in the stash at day 1, exact item
// shapes; unseeded stash holds 0); L2 live medicine cure (a holder with NO
// healing ability cures wound_fever via antibiotics: counter +1, exactly
// one antibiotics dose spent, antiparasitic untouched; gutrot via
// antiparasitic likewise); L3 doses decrement ONLY on a cure (tick fever /
// radiation sickness / already-cured patient: no cure, no dose spent);
// L4 analyzer classification (synthetic events: ability-available vs
// medicine-unique incl. trichinosis, table-violation, alien/trembles
// rejection); L5 analyzer dose-balance join (synthetic corpus: removed ==
// cures + non-duty takes; tampered corpus fails the balance); L6 recorder
// neutrality (one seed, 150d, seeded, recorder on vs off: identical
// fingerprints); L7 corpus integrity (synthetic daily rows: clean corpus
// reports no gaps, gapped corpus reports the gap).
// Uses the shared harness (seeded RNG before eval). The judged 8-seed 150d
// corpora are produced by the sweeps, not by this test. This test writes
// ONLY to os.tmpdir() — never into the repo.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const CORPUS_DIR = path.join(__dirname, '..', 'evidence', '2026-11-09', 'medchannel-seed-a-corpus');
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}

function synthSeedFile(dir, seed, opts) {
  const o = opts || {};
  const daily = [];
  const n = o.dailyDays == null ? 5 : o.dailyDays;
  for (let d = 0; d < n; d++) {
    if (o.gapAt != null && d === o.gapAt) continue;
    daily.push({ day: d, pop: 10, sickCountNPC: 0, healerPresent: false, dutyVid: null, dutyHeld: false, dutyBlocked: 0, dutyCures: { ability: 0, medicine: (o.medCures || []).filter(e => e.day <= d).length }, medDoses: { antibiotics: 20, antiparasitic: 20 } });
  }
  const f = {
    seed, policy: 'competent', leg: o.leg || 'seeded', seeded: true,
    seededDoses: { antibiotics: 20, antiparasitic: 20 },
    day0Doses: o.day0Doses || { antibiotics: 20, antiparasitic: 20 },
    daysAlive: n, villageDays: daily.length, deathCauses: {}, deathRows: [],
    daily,
    cureEvents: { medicine: o.medCures || [], ability: o.abCures || [] },
    cureLines: [], stashTakes: o.stashTakes || [], anomalies: o.anomalies || [],
    finalMedDoses: o.finalDoses || { antibiotics: 20 - (o.medCures || []).filter(e => e.kind === 'antibiotics').length, antiparasitic: 20 - (o.medCures || []).filter(e => e.kind === 'antiparasitic').length },
    finalDutyCures: { ability: (o.abCures || []).length, medicine: (o.medCures || []).length },
    national: false, table: false, win: false, waveReach: [1],
  };
  fs.writeFileSync(path.join(dir, `medchannel-seed-a-${o.leg || 'seeded'}-s${seed}.json`), JSON.stringify(f));
  return f;
}

(async () => {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  const { oneRun, seedStash, medDoses } = require('./sweep-medchannel-seed-a.js');
  const { classify, censusLeg, SEEDS } = require('./analyze-medchannel-seed-a.js');
  const table = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'statusEffects.json'), 'utf8')).statuses;

  // ---- L1/L2/L3 need a live Game: run competent 5 days on 95205 ----
  const { Game } = await loadGame({ seed: 95205, mode: 'medchannel-seed-a-test', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days: 5, manifest: null });
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert.ok(roster.length >= 3, 'roster has villagers, got ' + roster.length);
  const nm = (id) => { try { const p = Game.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } };
  const noAbility = (id) => ['herbal_remedy', 'field_medicine', 'triage'].every(ab => !(Game.npcHasAbility && Game.npcHasAbility(id, ab)));
  const holder = roster.find(noAbility);
  assert.ok(holder, 'a holder with NO healing ability exists');
  const patients = roster.filter(id => id !== holder && !((v.sick || {})[id]));
  assert.ok(patients.length >= 3, 'need 3+ healthy patients, got ' + patients.length);
  v.sick = v.sick || {};

  leg('L1 seeder puts 20+20 in the stash, unseeded holds 0', () => {
    assert.deepStrictEqual(medDoses(Game), { antibiotics: 0, antiparasitic: 0 }, 'fresh game pharmacy is empty');
    const seeded = seedStash(Game);
    assert.deepStrictEqual(seeded, { antibiotics: 20, antiparasitic: 20 });
    assert.deepStrictEqual(medDoses(Game), { antibiotics: 20, antiparasitic: 20 });
    const st = Game.stashState();
    const ab = st.medicine.find(m => m.medType === 'antibiotics');
    const ap = st.medicine.find(m => m.medType === 'antiparasitic');
    assert.strictEqual(ab.id, 'med_antibiotics');
    assert.strictEqual(ab.name, 'Antibiotics (amoxicillin)');
    assert.strictEqual(ap.id, 'med_antiparasitic');
    assert.strictEqual(ap.name, 'Antiparasitic (mebendazole)');
  });

  const curesBefore = () => ({ ...((Game.state.village || {}).medicDutyCures || { ability: 0, medicine: 0 }) });

  aleg('L2a live medicine cure: wound_fever via antibiotics (no-ability holder)', async () => {
    const p = patients[0];
    v.sick[p] = { name: 'wound fever', daysLeft: 5, severity: 1 };
    const c0 = curesBefore();
    const ok = Game.medicDutyCureAttempt(holder, p, nm);
    assert.strictEqual(ok, true, 'wound_fever cured by medicine');
    assert.strictEqual(v.sick[p], undefined, 'record deleted');
    const c1 = curesBefore();
    assert.strictEqual(c1.medicine, (c0.medicine || 0) + 1, 'medicine counter +1');
    assert.strictEqual(c1.ability, c0.ability || 0, 'ability counter untouched');
    assert.deepStrictEqual(medDoses(Game), { antibiotics: 19, antiparasitic: 20 }, 'exactly one antibiotics dose spent');
  });

  aleg('L2b live medicine cure: gutrot via antiparasitic (no-ability holder)', async () => {
    const p = patients[1];
    v.sick[p] = { name: 'gut rot', daysLeft: 5, severity: 1 };
    const ok = Game.medicDutyCureAttempt(holder, p, nm);
    assert.strictEqual(ok, true, 'gutrot cured by medicine');
    assert.strictEqual(v.sick[p], undefined, 'record deleted');
    assert.deepStrictEqual(medDoses(Game), { antibiotics: 19, antiparasitic: 19 }, 'exactly one antiparasitic dose spent');
  });

  aleg('L3a no cure, no spend: tick fever (antibiotics ease only)', async () => {
    const p = patients[2];
    v.sick[p] = { name: 'tick fever', daysLeft: 5, severity: 1 };
    const ok = Game.medicDutyCureAttempt(holder, p, nm);
    assert.strictEqual(ok, false, 'generic fever is not a medicine cure');
    assert.ok(v.sick[p], 'record still present');
    assert.deepStrictEqual(medDoses(Game), { antibiotics: 19, antiparasitic: 19 }, 'no dose spent');
  });

  aleg('L3b no cure, no spend: radiation sickness (no at both kinds)', async () => {
    const p = patients[2];
    v.sick[p] = { name: 'radiation sickness', daysLeft: 5, severity: 1 };
    const ok = Game.medicDutyCureAttempt(holder, p, nm);
    assert.strictEqual(ok, false, 'radiation is not a medicine cure');
    assert.deepStrictEqual(medDoses(Game), { antibiotics: 19, antiparasitic: 19 }, 'no dose spent');
  });

  aleg('L3c no cure, no spend: already-cured patient (record gone)', async () => {
    const ok = Game.medicDutyCureAttempt(holder, patients[0], nm);
    assert.strictEqual(ok, false, 'no record, no cure');
    assert.deepStrictEqual(medDoses(Game), { antibiotics: 19, antiparasitic: 19 }, 'no dose spent');
  });

  leg('L3d cure table agrees with the prereg (live table, not a copy)', () => {
    assert.strictEqual(table.wound_fever.cure.antibiotics, 'cure');
    assert.strictEqual(table.gutrot.cure.antiparasitic, 'cure');
    assert.strictEqual(table.trichinosis.cure.antiparasitic, 'cure');
    assert.strictEqual(table.trichinosis.cure.herbal_remedy, 'ease');
    assert.strictEqual(table.disease.cure.antibiotics, 'ease');
    assert.strictEqual(table.trembles.cure.antibiotics, 'no');
    assert.strictEqual(table.radiation_sickness.cure.antibiotics, 'no');
    assert.strictEqual(table.lockjaw.cure.antibiotics, 'cure');
  });

  // ---- L4: analyzer classification on synthetic events ----
  leg('L4a wound_fever + antibiotics + herbal holder = ability-available', () => {
    const c = classify({ diseaseId: 'wound_fever', kind: 'antibiotics', diagnosed: false, holderAbilities: ['herbal_remedy'] }, table);
    assert.strictEqual(c.cls, 'ability-available');
  });
  leg('L4b wound_fever + antibiotics + no abilities = medicine-unique', () => {
    const c = classify({ diseaseId: 'wound_fever', kind: 'antibiotics', diagnosed: false, holderAbilities: [] }, table);
    assert.strictEqual(c.cls, 'medicine-unique');
  });
  leg('L4c gutrot + antiparasitic + triage-only holder = medicine-unique (triage eases gutrot)', () => {
    const c = classify({ diseaseId: 'gutrot', kind: 'antiparasitic', diagnosed: false, holderAbilities: ['triage'] }, table);
    assert.strictEqual(c.cls, 'medicine-unique');
  });
  leg('L4d gutrot + antiparasitic + herbal holder = ability-available', () => {
    const c = classify({ diseaseId: 'gutrot', kind: 'antiparasitic', diagnosed: false, holderAbilities: ['herbal_remedy'] }, table);
    assert.strictEqual(c.cls, 'ability-available');
  });
  leg('L4e trichinosis + antiparasitic = medicine-unique (no ability cures it)', () => {
    const c = classify({ diseaseId: 'trichinosis', kind: 'antiparasitic', diagnosed: true, holderAbilities: ['herbal_remedy', 'field_medicine', 'triage'] }, table);
    assert.strictEqual(c.cls, 'medicine-unique');
  });
  leg('L4f generic fever + antibiotics = table-violation (ease, not cure)', () => {
    const c = classify({ diseaseId: 'disease', kind: 'antibiotics', diagnosed: false, holderAbilities: [] }, table);
    assert.strictEqual(c.cls, 'table-violation');
  });
  leg('L4g trembles + antibiotics = table-violation', () => {
    const c = classify({ diseaseId: 'trembles', kind: 'antibiotics', diagnosed: true, holderAbilities: [] }, table);
    assert.strictEqual(c.cls, 'table-violation');
  });
  leg('L4h lockjaw diagnosis gate: field holder + undiagnosed = medicine-unique', () => {
    // lockjaw needsDiagnosis=true: an undiagnosed field_medicine holder
    // cannot ability-cure, so a medicine cure there is medicine-unique.
    const c = classify({ diseaseId: 'lockjaw', kind: 'antibiotics', diagnosed: false, holderAbilities: ['field_medicine'] }, table);
    assert.strictEqual(c.cls, 'medicine-unique');
    const c2 = classify({ diseaseId: 'lockjaw', kind: 'antibiotics', diagnosed: true, holderAbilities: ['field_medicine'] }, table);
    assert.strictEqual(c2.cls, 'ability-available');
  });

  // ---- L5: analyzer dose-balance join on synthetic corpora ----
  leg('L5a dose balance holds when removed == cures + non-duty takes', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medchannel-census-'));
    const medEv = [
      { seed: 95205, day: 2, patient: 'p1', patientName: 'A', diseaseId: 'wound_fever', diseaseName: 'wound fever', kind: 'antibiotics', diagnosed: false, holder: 'h1', holderName: 'H', holderAbilities: [], dosesBefore: { antibiotics: 20, antiparasitic: 20 }, dosesAfter: { antibiotics: 19, antiparasitic: 20 }, sayLine: 'x' },
      { seed: 95206, day: 3, patient: 'p2', patientName: 'B', diseaseId: 'gutrot', diseaseName: 'gut rot', kind: 'antiparasitic', diagnosed: false, holder: 'h2', holderName: 'I', holderAbilities: ['triage'], dosesBefore: { antibiotics: 20, antiparasitic: 20 }, dosesAfter: { antibiotics: 20, antiparasitic: 19 }, sayLine: 'y' },
    ];
    for (const s of SEEDS) {
      const evs = medEv.filter(e => e.seed === s);
      synthSeedFile(dir, s, { medCures: evs,
        stashTakes: evs.map(e => ({ day: e.day, kind: 'take', what: e.kind === 'antibiotics' ? 'Antibiotics (amoxicillin)' : 'Antiparasitic (mebendazole)', qty: 1, vid: e.holder })),
        finalDoses: { antibiotics: 20 - evs.filter(e => e.kind === 'antibiotics').length, antiparasitic: 20 - evs.filter(e => e.kind === 'antiparasitic').length } });
    }
    const legOut = censusLeg(dir, 'seeded');
    assert.strictEqual(legOut.medCures.length, 2);
    assert.strictEqual(legOut.byClass['medicine-unique'], 2);
    assert.strictEqual(legOut.byDisease.wound_fever, 1);
    assert.strictEqual(legOut.byDisease.gutrot, 1);
    assert.strictEqual(legOut.undiagnosedMedCures, 2);
    assert.strictEqual(legOut.doseBalanceOk, true, 'balance reconciles');
    assert.strictEqual(legOut.nonDutyTakes.length, 0);
    assert.deepStrictEqual(legOut.gaps, []);
  });
  leg('L5b dose balance FAILS when a dose vanishes without a cure or take', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medchannel-census-'));
    for (const s of SEEDS) {
      synthSeedFile(dir, s, { medCures: [], finalDoses: s === 95205 ? { antibiotics: 19, antiparasitic: 20 } : { antibiotics: 20, antiparasitic: 20 } });
    }
    const legOut = censusLeg(dir, 'seeded');
    assert.strictEqual(legOut.doseBalanceOk, false, 'one unexplained dose breaks the balance');
  });
  leg('L5c non-duty take reconciles: scholar takes 1 dose, no cure', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medchannel-census-'));
    for (const s of SEEDS) {
      const take = s === 95207 ? [{ day: 4, kind: 'take', what: 'Antibiotics (amoxicillin)', qty: 1, vid: 'scholar-id' }] : [];
      synthSeedFile(dir, s, { medCures: [], stashTakes: take,
        finalDoses: s === 95207 ? { antibiotics: 19, antiparasitic: 20 } : { antibiotics: 20, antiparasitic: 20 } });
    }
    const legOut = censusLeg(dir, 'seeded');
    assert.strictEqual(legOut.doseBalanceOk, true, 'scholar take is accounted, not a waste');
    assert.strictEqual(legOut.nonDutyTakes.length, 1);
  });

  // ---- L6: recorder neutrality, one seed, 150d, seeded ----
  await aleg('L6 recorder neutrality: recorded vs bare fingerprints identical (seed 95205, 150d, seeded)', async () => {
    const rec = await oneRun(95205, 150, { bare: false, seeded: true });
    const bare = await oneRun(95205, 150, { bare: true, seeded: true });
    assert.deepStrictEqual(rec.fingerprint, bare.fingerprint, 'fingerprints must match exactly');
  });

  // ---- L7: corpus integrity ----
  leg('L7a clean synthetic corpus reports no gaps', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medchannel-census-'));
    for (const s of SEEDS) synthSeedFile(dir, s, {});
    const legOut = censusLeg(dir, 'seeded');
    assert.deepStrictEqual(legOut.gaps, []);
    assert.strictEqual(legOut.villageDays, SEEDS.length * 5);
  });
  leg('L7b gapped synthetic corpus reports the gap', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medchannel-census-'));
    for (const s of SEEDS) synthSeedFile(dir, s, { gapAt: s === 95206 ? 3 : null });
    const legOut = censusLeg(dir, 'seeded');
    assert.strictEqual(legOut.gaps.length, 1);
    assert.strictEqual(legOut.gaps[0].seed, 95206);
  });

  console.log(`\ntest-medchannel-seed-a: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
