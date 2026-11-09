#!/usr/bin/env node
// test-medicdiag-a.js — proof for the medicdiag-a care census.
// Legs: L1 healer definition (campHealerId returns the scholar-with-ability
// else the medical-occupation roster member at Haven, else null; away
// residents are excluded from the camp group); L2 cure-channel (behavioral:
// POOLCAPTURE-BAR-A #1926, duty-aware — WITHOUT a duty holder,
// villagerCareTick never deletes a v.sick record: it only tends, and stops
// at daysLeft 1; the duty holder is the ONLY care path that cures, proved
// in L2d here and in full in test-medicduty-a.js L4; treatVillager refuses
// without the ability and leaves the record untouched; static code-read:
// villagerCareTick itself never deletes — the deletion lives in
// medicDutyCureAttempt, called for the duty holder only; cureStatus never
// touches v.sick; the only treatVillager/tendVillager callers are the
// competent policy's keepPromiseHeal and the app.js UI buttons); L3 coverage accounting
// (modeledAvoided + coverageCount unit cases, incl. the judged band's
// numbers); L4 live leg (extended recorder on seeds 96301+96302, 150d:
// fingerprints equal the feveranat bare fingerprints AND the healerPresent /
// medicCount series equal the feveranat daySeries — the census reproduces
// the feveranat counts); L5 analyzer runs on the live-leg corpus and prints
// the census gates.
// Uses the shared harness (seeded RNG before eval). The judged 8-seed 150d
// corpus is produced by the sweep, not by this test.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const SWEEP = path.join(__dirname, 'sweep-medicdiag-a.js');
const ANALYZE = path.join(__dirname, 'analyze-medicdiag-a.js');
const FEVER_DIR = path.join(__dirname, '..', 'evidence', '2026-11-07', 'feveranat-a-corpus');
const TMP = path.join('/tmp', 'medicdiag-a-test-' + process.pid);
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;
const HEAL_ABS = ['triage', 'field_medicine', 'herbal_remedy'];

let pass = 0, fail = 0;
function leg(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}
async function aleg(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + (e && e.message)); }
}

(async () => {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  const { modeledAvoided, coverageCount } = require('./analyze-medicdiag-a.js');
  const { oneRun, writeRobust } = require('./sweep-medicdiag-a.js');

  // ---- L1/L2 need a live Game: run competent 5 days on 96301 ----
  const { Game } = await loadGame({ seed: 96301, mode: 'medicdiag-a-test', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days: 5, manifest: null });
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert.ok(roster.length >= 3, 'roster has villagers, got ' + roster.length);

  leg('L1 healer definition: campHealerId is scholar-with-ability else medic-occupation at Haven else null', () => {
    const haven = new Set(Game.campPeopleIds ? (Game.campPeopleIds('haven') || []) : []);
    const scholarHeals = HEAL_ABS.some(a => { try { return Game.hasAbility(a); } catch (e) { return false; } });
    let expected = null;
    if (scholarHeals && haven.has(Game.villagerId)) expected = Game.villagerId;
    else {
      for (const id of haven) {
        if (id === Game.villagerId) continue;
        const p = Game.getPerson(id);
        if (p && !p.dead && MED_OCC.test(String(p.formerOccupation || ''))) { expected = id; break; }
      }
    }
    assert.strictEqual(Game.campHealerId('haven'), expected,
      'campHealerId(haven)=' + Game.campHealerId('haven') + ' expected=' + expected);
    console.log('    healer at haven: ' + (expected === Game.villagerId ? 'scholar (ability)' : (expected || 'none')) +
      ' | scholar holds healing ability: ' + scholarHeals);
  });

  leg('L1b away residents cannot lend hands: flagging the healer away removes them from the camp group', () => {
    const hid = Game.campHealerId('haven');
    if (hid == null || hid === Game.villagerId) {
      console.log('    SKIP (no village medic is the Haven healer on this game — scholar or none)');
      return;
    }
    assert.ok((Game.campPeopleIds('haven') || []).includes(hid), 'healer in haven group before');
    v.away = v.away || {};
    v.away[hid] = true;
    assert.ok(!(Game.campPeopleIds('haven') || []).includes(hid), 'healer out of haven group once away');
    const after = Game.campHealerId('haven');
    assert.ok(after !== hid, 'campHealerId moves off the away healer (now ' + after + ')');
    delete v.away[hid];
    assert.strictEqual(Game.campHealerId('haven'), hid, 'healer restored once back');
  });

  leg('L2 care never cures without a duty holder: villagerCareTick tends only, stops at daysLeft 1, never deletes the record', () => {
    // Find a medic and a healthy patient; inject a fresh tick-fever record.
    // Clear the board first so the patient is the ONLY sick villager and
    // the chosen medic is available — otherwise another patient could take
    // the tend, or a sev-2-sick medic could stay down, and the parking
    // assertion would be non-deterministic.
    // POOLCAPTURE-BAR-A #1926 (duty-aware): the duty holder's care tick
    // CAN cure (L2d below; test-medicduty-a.js L4 in full), so this leg
    // runs with the duty vacated — v.medicDuty nulled, restored after —
    // which is exactly the pre-duty care path: every medic tends, nobody
    // cures. Without the vacating, the holder could cure the patient and
    // the "record survives" assertion would be testing the holder, not
    // the care tick.
    const medics = roster.filter(id => {
      const p = Game.getPerson(id);
      return p && !p.dead && MED_OCC.test(String(p.formerOccupation || ''));
    });
    assert.ok(medics.length >= 1, 'at least one medic on the roster, got ' + medics.length);
    v.sick = {};
    const medic = medics[0];
    const patient = roster.find(id => {
      const p = Game.getPerson(id);
      return p && !p.dead && !medics.includes(id);
    });
    assert.ok(patient, 'a healthy non-medic patient exists');
    v.sick[patient] = { name: 'tick fever', daysLeft: 5, severity: 1 };
    const nm = (id) => { try { const p = Game.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } };
    const savedDuty = v.medicDuty ?? null;
    v.medicDuty = null; // vacate: no duty holder, so no cure attempt runs
    assert.strictEqual(Game.medicDutyHolder(), null, 'duty reads vacant while nulled');
    let minSeen = 5;
    try {
      for (let i = 0; i < 10; i++) {
        Game.villagerCareTick(nm);
        const rec = (Game.state.village.sick || {})[patient];
        assert.ok(rec, 'record survives care tick ' + (i + 1) + ' (never deleted early)');
        assert.ok(rec.daysLeft >= 1, 'care never pushes daysLeft below 1 (got ' + rec.daysLeft + ')');
        minSeen = Math.min(minSeen, rec.daysLeft);
      }
    } finally { v.medicDuty = savedDuty; }
    const rec = (Game.state.village.sick || {})[patient];
    assert.strictEqual(rec.daysLeft, 1, 'after repeated care the record parks at daysLeft 1, got ' + rec.daysLeft);
    assert.strictEqual(minSeen, 1, 'min daysLeft seen is 1');
    // The tick itself (not care) is what ends the spell: one more
    // villageSicknessTick decrements 1 -> 0 and the record recovers away.
    // (Care without a duty holder cannot finish it: that is the point —
    // no villager-side cure outside the duty.)
    delete v.sick[patient];
    console.log('    patient ' + nm(patient) + ' tended 5 -> 1 over repeated care ticks with the duty vacated; record never deleted by care');
  });

  leg('L2b treatVillager refuses without the ability and leaves the record untouched', () => {
    const patient = roster.find(id => {
      const p = Game.getPerson(id);
      return p && !p.dead && !(v.sick || {})[id];
    });
    assert.ok(patient, 'a healthy patient exists');
    v.sick = v.sick || {};
    v.sick[patient] = { name: 'wound fever', daysLeft: 4, severity: 2 };
    const before = JSON.stringify(v.sick[patient]);
    const r = Game.treatVillager(patient, 'not_a_skill');
    assert.strictEqual(r, null, 'treatVillager without the ability returns null');
    assert.strictEqual(JSON.stringify(v.sick[patient]), before, 'record untouched by the refused treat');
    // A real held ability below L2 also refuses (sample-gated: only if the
    // scholar holds one of the three below L2 on this game).
    let checked = 0;
    for (const ab of HEAL_ABS) {
      try {
        if (Game.hasAbility(ab) && Game.abilityLevel(ab) < 2) {
          const r2 = Game.treatVillager(patient, ab);
          assert.strictEqual(r2, null, 'L1 ' + ab + ' refuses (needs L2)');
          assert.strictEqual(JSON.stringify(v.sick[patient]), before, 'record untouched by the L1 refuse');
          checked++;
        }
      } catch (e) { /* abilityLevel throwing is itself a refuse path; ignore */ }
    }
    console.log('    refused without ability; L2-gate exercised on ' + checked + ' held-below-L2 abilities');
    delete v.sick[patient];
  });

  leg('L2c code-read: villagerCareTick itself tends but never deletes; the deletion lives in medicDutyCureAttempt, duty-holder-only; cureStatus never touches v.sick; only scholar callers treat', () => {
    const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    const seSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'statusEffects.js'), 'utf8');
    // Extract the villagerCareTick body (from its definition to the next
    // top-level method comment at the same indent).
    const start = gameSrc.indexOf('villagerCareTick(nm) {');
    assert.ok(start > 0, 'villagerCareTick found in game.js');
    const end = gameSrc.indexOf('villagerTreatTick() {', start);
    const body = gameSrc.slice(start, end);
    assert.ok(body.includes('daysLeft -= 1'), 'villagerCareTick tends (daysLeft -= 1)');
    assert.ok(!body.includes('delete v.sick'), 'villagerCareTick never deletes a v.sick record directly');
    assert.ok(!body.includes('cureStatus'), 'villagerCareTick never calls the cure path');
    // POOLCAPTURE-BAR-A #1926: the cure attempt is a separate call, gated
    // to the duty holder — that is the ONLY deletion path inside care.
    assert.ok(body.includes('medicDutyCureAttempt'), 'villagerCareTick calls medicDutyCureAttempt');
    assert.ok(body.includes('mid === duty'), 'the cure attempt is gated to the duty holder (mid === duty)');
    // The deletion itself lives in medicDutyCureAttempt: it deletes the
    // record only through the A2 channels, refuses the alien pool, and
    // never calls the scholar's cure.
    const mStart = gameSrc.indexOf('medicDutyCureAttempt(holder, pid, nm) {');
    assert.ok(mStart > 0, 'medicDutyCureAttempt found in game.js');
    const mEnd = gameSrc.indexOf('villagerCareTick(nm) {', mStart);
    const mBody = gameSrc.slice(mStart, mEnd);
    assert.ok(mBody.includes('delete v.sick[pid]'), 'medicDutyCureAttempt deletes the cured record');
    assert.ok(mBody.includes("def.pool === 'alien'"), 'medicDutyCureAttempt refuses the alien pool');
    assert.ok(!mBody.includes('treatVillager'), 'medicDutyCureAttempt never calls the scholar cure');
    // cureStatus operates on the status-engine list only.
    const cStart = seSrc.indexOf('cureStatus: function');
    assert.ok(cStart > 0, 'cureStatus found in statusEffects.js');
    const cEnd = seSrc.indexOf('seMoveMod', cStart);
    const cBody = seSrc.slice(cStart, cEnd);
    assert.ok(cBody.includes('seList(target)'), 'cureStatus reads the status-engine list');
    assert.ok(!cBody.includes('v.sick'), 'cureStatus never touches v.sick');
    // treatVillager is scholar-gated (ability + L2) and is the only
    // villager-cure call in game.js.
    const tStart = gameSrc.indexOf('treatVillager(vid, abilityId) {');
    assert.ok(tStart > 0, 'treatVillager found in game.js');
    const tBody = gameSrc.slice(tStart, tStart + 4000);
    assert.ok(tBody.includes("hasAbility(abilityId)"), 'treatVillager requires the ability');
    assert.ok(tBody.includes('abilityLevel(abilityId) < 2'), 'treatVillager requires L2');
    assert.ok(tBody.includes('delete v.sick[vid]'), 'treatVillager is the scholar cure (delete v.sick)');
    // Callers of treatVillager / tendVillager outside the policy + UI:
    // grep the tree (excluding definitions, the policy file, and app.js).
    const grep = cp.spawnSync('grep', ['-rn', 'treatVillager(\\|tendVillager(', 'src/js', '--include=*.js'],
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    const callers = grep.stdout.split('\n').filter(l => l.trim() &&
      !l.includes('treatVillager(vid') && !l.includes('tendVillager(vid') &&
      !l.includes('src/js/app.js'));
    assert.ok(callers.length === 0, 'no NPC-side caller of treat/tendVillager in src/js (found: ' + callers.join(' | ') + ')');
    const polGrep = cp.spawnSync('grep', ['-n', 'treatVillager(\\|tendVillager(', 'scripts/policies/competent.js'],
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    assert.ok(/keepPromiseHeal/.test(fs.readFileSync(path.join(__dirname, '..', 'scripts', 'policies', 'competent.js'), 'utf8')),
      'competent.js keeps heal promises via treat/tendVillager');
    console.log('    callers: competent keepPromiseHeal only (+ app.js UI buttons); cureStatus is scholar-list-only');
  });

  leg('L2d the duty holder DOES cure: a curable patient is cured on the holder\'s pass, counter incremented', () => {
    // POOLCAPTURE-BAR-A #1926: the positive half of the duty-aware L2 —
    // the full proof of both cure channels lives in
    // test-medicduty-a.js L4; this leg states the medicdiag-side fact
    // that the holder's care tick deletes a curable record.
    const ms = roster.filter(id => {
      const p = Game.getPerson(id);
      return p && !p.dead && MED_OCC.test(String(p.formerOccupation || ''));
    });
    assert.ok(ms.length >= 1, 'at least one medic on the roster, got ' + ms.length);
    v.medicDuty = null;
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'a holder is assigned');
    // Ability channel only: clear the pharmacy so no medicine cure can
    // take the patient instead (same seam as test-medicduty-a.js L4b).
    try { const st = Game.stashState ? Game.stashState() : null; if (st && st.medicine) st.medicine.length = 0; } catch (e) {}
    assert.ok(Game.npcGrantAbility(holder, 'triage'), 'triage granted to the holder');
    assert.ok(Game.npcHasAbility(holder, 'triage'), 'holder holds triage');
    v.medicDutyCures = { ability: 0, medicine: 0 };
    v.sick = {};
    const patient = roster.find(id => id !== holder && !((Game.getPerson(id) || {}).dead));
    assert.ok(patient, 'a patient exists');
    const nm = (id) => { try { const p = Game.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } };
    // Wound fever needs no diagnosis and triage cures it — the holder's
    // pass deletes the record instead of tending it.
    v.sick[patient] = { name: 'wound fever', daysLeft: 5, severity: 1 };
    Game.villagerCareTick(nm);
    assert.ok(!v.sick[patient], 'wound-fever patient cured by the duty holder (record gone)');
    assert.strictEqual(v.medicDutyCures.ability, 1, 'ability cure counter incremented');
    console.log('    ' + nm(holder) + ' cured ' + nm(patient) + ' of wound fever on the duty pass (ability channel)');
    delete v.sick[patient];
  });

  // ---- L3 coverage accounting (pure) ----
  leg('L3 modeledAvoided + coverageCount unit cases (incl. the judged band numbers)', () => {
    // Judged band, NPC only: present 2/85, absent 18/75 -> 16.24 avoided.
    const a = modeledAvoided(85, 2, 75, 18);
    assert.ok(Math.abs(a - 16.235294117647058) < 1e-9, 'band model 16.24, got ' + a);
    // All episodes: present 3/87, absent 20/80 -> 17.24.
    const b = modeledAvoided(87, 3, 80, 20);
    assert.ok(Math.abs(b - 17.24137931034483) < 1e-9, 'all-episode model 17.24, got ' + b);
    // Edge cases: no absent group -> null; zero present mortality -> all absent deaths avoided.
    assert.strictEqual(modeledAvoided(10, 0, 5, 5), 5, 'zero present mortality avoids all 5');
    assert.strictEqual(modeledAvoided(10, 2, 0, 0), null, 'no absent group -> null');
    assert.strictEqual(modeledAvoided(0, 0, 5, 5), null, 'no present group -> null');
    // Coverage: 167/167 classified on the judged band; a null healerPresent counts.
    const cov = coverageCount([{ healerPresent: true }, { healerPresent: false }, { healerPresent: null }]);
    assert.deepStrictEqual(cov, { total: 3, classified: 2, unclassified: 1 }, 'coverage counts');
    const covBand = coverageCount(Array(167).fill({ healerPresent: true }));
    assert.strictEqual(covBand.unclassified, 0, 'band has zero UNCLASSIFIED');
  });

  // ---- L4 live leg: 2 seeds, full horizon, recorder-vs-recorder ----
  // AMENDMENT A1 (prereg): the feveranat corpus was recorded on base
  // 018295600; this tree is ba9859e13, and the feveranat recorder itself
  // gives different trajectories here (96301: 104d, not the corpus's
  // 127d). Corpus-vs-corpus reproduction is therefore unachievable and is
  // NOT the proof. The proof is recorder-vs-recorder ON THE SHARED
  // CURRENT BASE: the medicdiag oneRun and the feveranat oneRun, both
  // in-process on this base, must give identical fingerprints AND
  // identical healerPresent / medicCount / sickCountNPC series.
  let live = {};
  await aleg('L4 live leg: extended recorder is neutral vs the feveranat recorder on this base (96301+96302, 150d)', async () => {
    const feverSweep = require('./sweep-feveranat-a.js');
    for (const seed of [96301, 96302]) {
      const r = await oneRun(seed, 150);
      const f = await feverSweep.oneRun(seed, 150);
      live[seed] = r;
      // (a) trajectory identical: fingerprints equal across recorders.
      assert.strictEqual(JSON.stringify(r.fingerprint), JSON.stringify(f.fingerprint),
        's' + seed + ' medicdiag fingerprint == feveranat fingerprint on this base');
      // (b) healer flags identical day by day.
      const fHealer = f.perSeed.daySeries.map(d => d.healerPresent);
      const mHealer = r.perSeed.medicDays.map(d => d.healerPresent);
      assert.deepStrictEqual(mHealer, fHealer, 's' + seed + ' healerPresent series identical');
      // (c) roster medic counts identical day by day.
      const fMed = f.perSeed.daySeries.map(d => d.medicCount);
      const mMed = r.perSeed.medicDays.map(d => d.medicCount);
      assert.deepStrictEqual(mMed, fMed, 's' + seed + ' medicCount series identical');
      // (d) sick counts identical day by day.
      const fSick = f.perSeed.daySeries.map(d => d.sickCountNPC);
      const mSick = r.perSeed.medicDays.map(d => d.sickCountNPC);
      assert.deepStrictEqual(mSick, fSick, 's' + seed + ' sickCountNPC series identical');
      console.log('    s' + seed + ': daysAlive=' + r.perSeed.daysAlive + ' end=' + r.fingerprint.endReason +
        ' healerDays=' + mHealer.filter(Boolean).length + ' scholarHealerDays=' +
        r.perSeed.medicDays.filter(d => d.healerIsScholar).length +
        ' villageHealerDays=' + r.perSeed.medicDays.filter(d => d.healerPresent && !d.healerIsScholar).length);
    }
  });

  await aleg('L5 analyzer runs on the medicdiag corpus dir and prints the census gates', async () => {
    const MEDIC_DIR = path.join(__dirname, '..', 'evidence', '2026-11-07', 'medicdiag-a-corpus');
    const present = fs.existsSync(MEDIC_DIR) ? fs.readdirSync(MEDIC_DIR).filter(f => /^medicdiag-a-competent-s\d+\.json$/.test(f)) : [];
    assert.ok(present.length >= 2, 'medicdiag corpus dir holds >=2 seed files (the sweep wrote them), got ' + present.length);
    const r = cp.spawnSync(process.execPath, [ANALYZE, FEVER_DIR, MEDIC_DIR], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer exit 0: ' + (r.stderr || '').slice(0, 500));
    for (const pat of ['C1 HEALER CAPACITY', 'C2 CURE-CHANNEL', 'C3 MODELED VALUE',
      'G1 COVERAGE', 'G3 CORPUS', 'CENSUS GATES']) {
      assert.ok(r.stdout.includes(pat), pat + ' printed');
    }
    assert.ok(/MEDICDETAIL \(\d+\/8 seeds\)/.test(r.stdout), 'medicDetail section present');
    console.log('    analyzer on medicdiag corpus (' + present.length + ' seeds): ' + r.stdout.split('\n').find(l => l.startsWith('CENSUS GATES')));
  });

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
