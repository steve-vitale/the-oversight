#!/usr/bin/env node
// test-journey-crisis-r181-regional-meds.js — U1 UNIT PROBE (crisis r181
// prereg Q2b): the four regional ruin medicines are dead stock. Code read
// (before any scored seed):
//   - cureEffectFor is a pure table lookup (statusEffects.js:698):
//     def.cure[treatment] || 'no'. The cure tables name ONLY
//     herbal_remedy / field_medicine / triage / antibiotics /
//     antiparasitic / folk. The regional kinds (antimalarial,
//     cold_remedy, bandage, ors) are absent from EVERY disease's table.
//   - useMedicine(kind) (game.js:14157) hardcodes cls by kind and burns
//     the dose even when eff is 'no' ("Wrong medicine — the dose is
//     gone").
//   - Medic-duty channel 2 (game.js:33312) tries ONLY antibiotics /
//     antiparasitic.
//   - isMedicine (storage.js:640) admits by healAmount or a name regex:
//     med_kakkonto / med_antimalarial / ors_packets do NOT pass (and
//     ors_packets carries no medType at all in regions.json — it enters
//     inventory as a kcal-0 "can" with no use path).
// Expected pre-fix: ALL of (1)-(4) FAIL (RED). The RED run is the proof
// of the defect. Post-fix (prereg U2: cure-table entries + ors medType +
// useMedicine kind->class map + channel-2 kinds + isMedicine admits
// medType) all go GREEN. The antibiotics control (5) passes pre-fix
// and post-fix — it proves the test CAN observe a working cure, so a
// RED on (1)-(4) is the defect, not the fixture.
// Exit non-zero on any failure.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const REGIONS = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'regions.json'), 'utf8'));

let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ': ' + e.message); }
}

(async () => {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  const { Game } = await loadGame({ seed: 96301, mode: 'regional-meds-r181-test', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days: 5, manifest: null });
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert.ok(roster.length >= 3, 'roster has villagers, got ' + roster.length);
  const nm = (id) => { try { const p = Game.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } };
  const s = Game.state.scholar;
  // Reset FIRST in each scholar case: a check() failure skips the lines
  // after the failing assert, so end-of-case cleanup never runs on RED.
  // Clearing here makes every case independent of earlier failures.
  const resetScholar = () => {
    for (const e of Game.sickDiseases()) { try { Game.cureStatus('scholar', e.id, 'test-reset'); } catch (err) {} }
    s.inventory = (s.inventory || []).filter(i => !(i && i.medType));
    assert.strictEqual(Game.sickDiseases().length, 0, 'scholar still sick after reset: ' + JSON.stringify(Game.sickDiseases().map(e => e.id)));
  };

  // (0) DATA: south_asia ORS packets carry a medType (the loot path
  // copies medType from the scavenge def — without it the bottle is a can).
  check('data: ors_packets carries medType ors', () => {
    const sa = REGIONS.find(r => r.id === 'south_asia');
    const ors = ((sa.people || {}).scavenge || []).find(x => x.id === 'ors_packets');
    assert.ok(ors, 'ors_packets missing from south_asia scavenge');
    assert.strictEqual(ors.medType, 'ors', 'ors_packets medType is ' + ors.medType);
    assert.strictEqual(Game.scavengeItem('ors_packets').medType, 'ors', 'scavengeItem(ors_packets) has no medType');
  });

  // (1) TABLE: each regional kind eases/cures its labeled target.
  check('table: antimalarial cures Fever', () => {
    assert.strictEqual(Game.cureEffectFor('disease', 'antimalarial'), 'cure', 'got ' + Game.cureEffectFor('disease', 'antimalarial'));
  });
  check('table: cold_remedy eases Fever', () => {
    assert.strictEqual(Game.cureEffectFor('disease', 'cold_remedy'), 'ease', 'got ' + Game.cureEffectFor('disease', 'cold_remedy'));
  });
  check('table: bandage eases Wound Fever', () => {
    assert.strictEqual(Game.cureEffectFor('wound_fever', 'bandage'), 'ease', 'got ' + Game.cureEffectFor('wound_fever', 'bandage'));
  });
  check('table: ors eases Gut Rot', () => {
    assert.strictEqual(Game.cureEffectFor('gutrot', 'ors'), 'ease', 'got ' + Game.cureEffectFor('gutrot', 'ors'));
  });
  check('table: ors eases Fever', () => {
    assert.strictEqual(Game.cureEffectFor('disease', 'ors'), 'ease', 'got ' + Game.cureEffectFor('disease', 'ors'));
  });

  // (2) PHARMACY GATE: every dosed medicine is pharmacy material.
  check('isMedicine: regional meds are pharmacy material', () => {
    for (const [id, medType] of [['med_antimalarial', 'antimalarial'], ['med_kakkonto', 'cold_remedy'], ['med_bandage', 'bandage'], ['ors_packets', 'ors']]) {
      assert.ok(Game.isMedicine({ itemId: id, medType, doses: 3, units: 1 }), id + ' not admitted by isMedicine');
    }
  });

  // (3) SCHOLAR USE: kakkonto eases a fever instead of burning the dose.
  check('useMedicine: cold_remedy eases Fever (dose spent, sickness eased)', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'disease', { silent: true }), 'could not make the scholar feverish');
    assert.ok(Game.sickDiseases().some(e => e.id === 'disease'), 'scholar has no Fever entry');
    s.inventory.push({ itemId: 'med_kakkonto', medType: 'cold_remedy', doses: 4, units: 1, kg: 0.1, name: 'Cold medicine (kakkonto)' });
    Game.useMedicine('cold_remedy');
    const dose = s.inventory.find(i => i && i.medType === 'cold_remedy');
    assert.ok(dose && dose.doses === 3, 'dose not spent exactly once (doses=' + (dose && dose.doses) + ')');
    const entry = Game.sickDiseases().find(e => e.id === 'disease');
    assert.ok(entry, 'Fever entry vanished — an ease must not cure it');
    assert.ok(entry.easedUntil != null && entry.easedUntil > 0, 'Fever NOT eased (no easedUntil) — the dose burned with "Wrong medicine"');
    try { Game.cureStatus('scholar', 'disease', 'test-reset'); } catch (e) {}
    s.inventory = (s.inventory || []).filter(i => !(i && i.medType === 'cold_remedy'));
  });

  // (4) MEDIC DUTY: antimalarial from the pharmacy cures a tick-fever patient.
  check('medicDuty: antimalarial cures tick-fever patient from the pharmacy', () => {
    const holder = roster.find(id => !Game.npcHasAbility(id, 'herbal_remedy') && !Game.npcHasAbility(id, 'field_medicine') && !Game.npcHasAbility(id, 'triage'));
    assert.ok(holder, 'no ability-free holder on the roster (channel 1 would mask channel 2)');
    v.medicDutyCures = { ability: 0, medicine: 0 };
    v.sick = {};
    const patient = roster.find(id => id !== holder && !((Game.getPerson(id) || {}).dead));
    assert.ok(patient, 'no patient on the roster');
    v.sick[patient] = { name: 'tick fever', daysLeft: 5, severity: 1 };
    const st = Game.stashState();
    st.medicine.length = 0;
    st.medicine.push({ medType: 'antimalarial', doses: 3, name: 'Antimalarials (artemether)', itemId: 'med_antimalarial' });
    const ok = Game.medicDutyCureAttempt(holder, patient, nm);
    assert.ok(ok, 'channel 2 did not cure the tick-fever patient with pharmacy antimalarial');
    assert.ok(!v.sick[patient], 'patient still sick after channel-2 cure');
    assert.strictEqual(v.medicDutyCures.medicine, 1, 'medicine cure counter is ' + v.medicDutyCures.medicine);
    assert.strictEqual(st.medicine[0].doses, 2, 'pharmacy dose not spent exactly once (doses=' + (st.medicine[0] && st.medicine[0].doses) + ')');
    st.medicine.length = 0;
    v.sick = {};
  });

  // (5) CONTROL (sensitivity): the existing antibiotics cure already works.
  check('control: antibiotics cure Wound Fever (table + scholar use)', () => {
    assert.strictEqual(Game.cureEffectFor('wound_fever', 'antibiotics'), 'cure', 'got ' + Game.cureEffectFor('wound_fever', 'antibiotics'));
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'wound_fever', { silent: true }), 'could not give the scholar wound fever');
    s.inventory.push({ itemId: 'med_antibiotics', medType: 'antibiotics', doses: 3, units: 1, kg: 0.1, name: 'Antibiotics (amoxicillin)' });
    Game.useMedicine('antibiotics');
    assert.ok(!Game.sickDiseases().some(e => e.id === 'wound_fever'), 'wound fever NOT cured by antibiotics — the fixture cannot observe a cure');
    s.inventory = (s.inventory || []).filter(i => !(i && i.medType === 'antibiotics'));
  });

  // (6) NAMES (finding #2274): useMedicine must narrate the pill actually
  // taken — antimalarial / cold remedy / bandage / ORS — never the
  // pre-fix fallback 'antiparasitic' in any say line. Reachability per
  // the cure tables: the use verb fires for every kind (undiagnosed
  // use) — dry-swallow for pills, apply for bandage, drink for ORS;
  // the cure path is reachable only for antimalarial of the four
  // (cold_remedy / bandage / ors only ease); the ease path only for the
  // three easing kinds. So the matrix is: use-verb × all four,
  // cure × antimalarial (diagnosed + undiagnosed variants),
  // ease × cold_remedy / bandage / ors — plus antibiotics /
  // antiparasitic cure controls proving the recorder sees real names.
  // Order matters: undiagnosed cases run before the same disease is
  // diagnosed (diagnosis persists across resetScholar).
  const _origSay6 = Game.say.bind(Game);
  const said6 = [];
  Game.say = (t) => { said6.push(String(t)); return _origSay6(t); };
  const medItem = (itemId, medType, name) => ({ itemId, medType, doses: 3, units: 1, kg: 0.1, name });
  const useAndCapture = (kind, item) => {
    s.inventory.push(item);
    said6.length = 0;
    Game.useMedicine(kind);
    return said6.slice();
  };
  const noLeak = (lines, kind) => {
    for (const ln of lines) {
      if (kind !== 'antiparasitic' && /antiparasitic/i.test(ln)) {
        throw new Error('say line names the wrong pill: ' + JSON.stringify(ln));
      }
    }
  };
  const spokenName = (lines, re, expected, path) => {
    const ln = lines.find(l => re.test(l));
    assert.ok(ln, 'no ' + path + ' line spoken; got ' + JSON.stringify(lines));
    assert.ok(ln.toLowerCase().includes(expected.toLowerCase()),
      path + ' line names the wrong pill: ' + JSON.stringify(ln));
    return ln;
  };

  check('names: antimalarial dry-swallow + cure (undiagnosed Fever)', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'disease', { silent: true }), 'could not make the scholar feverish');
    const lines = useAndCapture('antimalarial', medItem('med_antimalarial', 'antimalarial', 'Antimalarials (artemether)'));
    spokenName(lines, /dry-swallow the/i, 'antimalarial', 'dry-swallow');
    spokenName(lines, /sickness breaks/i, 'antimalarial', 'cure');
    assert.ok(!Game.sickDiseases().some(e => e.id === 'disease'), 'Fever NOT cured by antimalarial');
    noLeak(lines, 'antimalarial');
  });
  check('names: cold_remedy dry-swallow + ease (undiagnosed Fever)', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'disease', { silent: true }), 'could not make the scholar feverish');
    const lines = useAndCapture('cold_remedy', medItem('med_kakkonto', 'cold_remedy', 'Cold medicine (kakkonto)'));
    spokenName(lines, /dry-swallow the/i, 'cold remedy', 'dry-swallow');
    spokenName(lines, /edge off/i, 'cold remedy', 'ease');
    assert.ok(Game.sickDiseases().some(e => e.id === 'disease'), 'Fever vanished — an ease must not cure it');
    noLeak(lines, 'cold_remedy');
  });
  check('names: bandage apply + ease (undiagnosed Wound Fever)', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'wound_fever', { silent: true }), 'could not give the scholar wound fever');
    const lines = useAndCapture('bandage', medItem('med_bandage', 'bandage', 'Bandages (roll)'));
    spokenName(lines, /apply the/i, 'bandage', 'use-verb');
    spokenName(lines, /edge off/i, 'bandage', 'ease');
    assert.ok(Game.sickDiseases().some(e => e.id === 'wound_fever'), 'Wound Fever vanished — an ease must not cure it');
    noLeak(lines, 'bandage');
  });
  check('names: ors drink + ease (undiagnosed Gut Rot)', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'gutrot', { silent: true }), 'could not give the scholar gut rot');
    const lines = useAndCapture('ors', medItem('ors_packets', 'ors', 'ORS packets'));
    spokenName(lines, /drink the/i, 'ORS', 'use-verb');
    spokenName(lines, /edge off/i, 'ORS', 'ease');
    assert.ok(Game.sickDiseases().some(e => e.id === 'gutrot'), 'Gut Rot vanished — an ease must not cure it');
    noLeak(lines, 'ors');
  });
  check('names: antimalarial cure line, diagnosed Fever (no dry-swallow)', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'disease', { silent: true }), 'could not make the scholar feverish');
    assert.ok(Game.diagnoseDisease('scholar', 'disease', { silent: true, by: 'test' }), 'could not diagnose the Fever');
    const lines = useAndCapture('antimalarial', medItem('med_antimalarial', 'antimalarial', 'Antimalarials (artemether)'));
    assert.ok(!lines.some(l => /dry-swallow/i.test(l)), 'dry-swallow line spoken for a diagnosed sickness: ' + JSON.stringify(lines));
    spokenName(lines, /breaks within the day/i, 'antimalarial', 'cure');
    noLeak(lines, 'antimalarial');
  });
  check('names: antibiotics cure control still says antibiotics', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'wound_fever', { silent: true }), 'could not give the scholar wound fever');
    assert.ok(Game.diagnoseDisease('scholar', 'wound_fever', { silent: true, by: 'test' }), 'could not diagnose Wound Fever');
    const lines = useAndCapture('antibiotics', medItem('med_antibiotics', 'antibiotics', 'Antibiotics (amoxicillin)'));
    spokenName(lines, /breaks within the day/i, 'antibiotics', 'cure');
    assert.ok(!Game.sickDiseases().some(e => e.id === 'wound_fever'), 'Wound Fever NOT cured by antibiotics');
  });
  check('names: antiparasitic cure control still says antiparasitic', () => {
    resetScholar();
    assert.ok(Game.applyStatus('scholar', 'gutrot', { silent: true }), 'could not give the scholar gut rot');
    assert.ok(Game.diagnoseDisease('scholar', 'gutrot', { silent: true, by: 'test' }), 'could not diagnose Gut Rot');
    const lines = useAndCapture('antiparasitic', medItem('med_antiparasitic', 'antiparasitic', 'Antiparasitic (mebendazole)'));
    spokenName(lines, /breaks within the day/i, 'antiparasitic', 'cure');
    assert.ok(!Game.sickDiseases().some(e => e.id === 'gutrot'), 'Gut Rot NOT cured by antiparasitic');
  });
  // (7) VERBS (sim-findings-a 2026-11-11): the undiagnosed-use line
  // uses the verb for the kind — pills are dry-swallowed, a bandage is
  // applied, ORS is drunk. Every kind the KIND_NAME map covers is
  // asserted here. Trichinosis is the shared sickness: (6) never
  // diagnosed it, so the use line fires for every kind; only
  // antiparasitic cures it (the other kinds answer "Wrong medicine",
  // which is fine — the verb line is what this section asserts).
  const KIND_VERB_EXPECTED = [
    ['antibiotics', 'dry-swallow', 'antibiotics', 'med_antibiotics', 'Antibiotics (amoxicillin)'],
    ['antiparasitic', 'dry-swallow', 'antiparasitic', 'med_antiparasitic', 'Antiparasitic (mebendazole)'],
    ['antimalarial', 'dry-swallow', 'antimalarial', 'med_antimalarial', 'Antimalarials (artemether)'],
    ['cold_remedy', 'dry-swallow', 'cold remedy', 'med_kakkonto', 'Cold medicine (kakkonto)'],
    ['bandage', 'apply', 'bandage', 'med_bandage', 'Bandages (roll)'],
    ['ors', 'drink', 'ORS', 'ors_packets', 'ORS packets'],
  ];
  for (const [kind, verb, kindName, itemId, itemName] of KIND_VERB_EXPECTED) {
    check(`verbs: undiagnosed use of ${kind} says "You ${verb} the ${kindName}"`, () => {
      resetScholar();
      assert.ok(Game.applyStatus('scholar', 'trichinosis', { silent: true }), 'could not give the scholar trichinosis');
      assert.ok(!Game.isDiagnosed('scholar', 'trichinosis'), 'trichinosis already diagnosed — the use line would not fire');
      const lines = useAndCapture(kind, medItem(itemId, kind, itemName));
      const useLine = lines.find(l => /You (dry-swallow|apply|drink) the /i.test(l));
      assert.ok(useLine, 'no use-verb line spoken; got ' + JSON.stringify(lines));
      assert.ok(new RegExp(`You ${verb} the ${kindName}\\.`, 'i').test(useLine),
        `wrong verb for ${kind}: ${JSON.stringify(useLine)}`);
      for (const wrong of ['dry-swallow', 'apply', 'drink']) {
        if (wrong === verb) continue;
        assert.ok(!lines.some(l => new RegExp(`You ${wrong} the`, 'i').test(l)),
          `wrong verb "${wrong}" spoken for ${kind}: ${JSON.stringify(lines)}`);
      }
      noLeak(lines, kind);
    });
  }
  Game.say = _origSay6;

  console.log(failures === 0 ? 'r181 regional-meds: ALL PASS' : 'r181 regional-meds: ' + failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.log('FATAL ' + (e && e.stack || e)); process.exit(2); });
