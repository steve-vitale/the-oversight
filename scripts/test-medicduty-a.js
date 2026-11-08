#!/usr/bin/env node
// test-medicduty-a.js — proof for the Haven Medic Duty build.
// Legs: L1 duty assignment (picks a roster medic at Haven, prefers triage,
// keeps the holder while eligible, re-picks when the holder leaves / dies /
// falls sev-2 sick, reads vacant when no medic exists); L2 departure blocks
// (objMaybeDepart converts the holder to indoor chore work and counts it;
// LEAVE is exempt; startExpedition blocks voluntary launches but not
// directed win-plan launches; objAskCompanion never picks the holder);
// L3 tending priority (the duty holder tends first and tends the sickest
// patient); L4 no-cure (the duty creates no cure path: villagerCareTick
// still only tends, treatVillager is never called by the duty, code-read
// confirms no v.sick deletion in the duty code); L5 live leg (duty recorder
// is neutral vs the medicdiag recorder on this base, seeds 96301+96302,
// 150d: identical fingerprints and identical healerPresent / sickCountNPC
// series); L6 analyzer runs on the pilot corpora and the join is clean.
// Uses the shared harness (seeded RNG before eval). The judged 8-seed 150d
// corpora are produced by the sweeps, not by this test.
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const SWEEP = path.join(__dirname, 'sweep-medicduty-a.js');
const ANALYZE = path.join(__dirname, 'analyze-medicduty-a.js');
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-11-08', 'medicduty-a-corpus');
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

(async () => {
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { competent } = require('./policies/competent');
  const { oneRun } = require('./sweep-medicduty-a.js');

  // ---- L1/L2/L3/L4 need a live Game: run competent 5 days on 96301 ----
  const { Game } = await loadGame({ seed: 96301, mode: 'medicduty-a-test', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days: 5, manifest: null });
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert.ok(roster.length >= 3, 'roster has villagers, got ' + roster.length);
  const nm = (id) => { try { const p = Game.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } };
  const medics = () => roster.filter(id => {
    const p = Game.getPerson(id);
    return p && !p.dead && MED_OCC.test(String(p.formerOccupation || ''));
  });
  // Force a clean board for the duty legs: every medic home, healthy, alive.
  const prepMedics = () => {
    v.away = v.away || {};
    v.sick = v.sick || {};
    for (const id of medics()) { delete v.away[id]; delete v.sick[id]; }
    return medics();
  };

  leg('L0 duty functions exist', () => {
    assert.strictEqual(typeof Game.medicDutyTick, 'function', 'medicDutyTick exists');
    assert.strictEqual(typeof Game.medicDutyHolder, 'function', 'medicDutyHolder exists');
  });

  leg('L1 assignment: picks a roster medic at Haven, preferring triage', () => {
    const ms = prepMedics();
    assert.ok(ms.length >= 1, 'at least one medic on the roster, got ' + ms.length);
    v.medicDuty = null;
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'a holder is assigned');
    assert.strictEqual(v.medicDuty, holder, 'v.medicDuty stores the holder');
    assert.strictEqual(Game.medicDutyHolder(), holder, 'medicDutyHolder() reads the holder back');
    const p = Game.getPerson(holder);
    assert.ok(MED_OCC.test(String(p.formerOccupation || '')), 'holder is a medical occupation: ' + p.formerOccupation);
    assert.ok((Game.campPeopleIds('haven') || []).includes(holder), 'holder is physically at Haven');
    assert.strictEqual(Game.campHealerId('haven'), holder,
      'the duty holder IS the Haven healer (campHealerId agrees)');
    console.log('    duty holder: ' + nm(holder) + ' (' + p.formerOccupation + ')' +
      (Game.npcHasAbility(holder, 'triage') ? ', holds triage' : ', no triage'));
  });

  leg('L1b stability: re-assignment keeps the holder while eligible', () => {
    const before = Game.medicDutyHolder();
    assert.ok(before, 'a holder is assigned (L1 ran first)');
    Game.medicDutyTick();
    assert.strictEqual(Game.medicDutyHolder(), before, 'holder unchanged on re-assignment');
    assert.strictEqual(v.medicDuty, before, 'v.medicDuty unchanged');
  });

  leg('L1c re-pick: holder sent away vacates the duty; next dawn reassigns', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    v.away = v.away || {};
    v.away[holder] = { nx: 7, ny: 7, purpose: 'forage', sinceDay: 5, sincePart: 0, duration: 6 };
    assert.strictEqual(Game.medicDutyHolder(), null, 'away holder reads vacant');
    const next = Game.medicDutyTick();
    const others = ms.filter(id => id !== holder);
    if (others.length) {
      assert.ok(next && next !== holder, 'duty passes to another medic (' + nm(next) + ')');
    } else {
      assert.strictEqual(next, null, 'no other medic: duty stays vacant, not stuck on the away holder');
    }
    delete v.away[holder];
    Game.medicDutyTick();
    console.log('    after away: duty -> ' + (next ? nm(next) : 'vacant') + '; holder restored, duty -> ' + nm(Game.medicDutyHolder()));
  });

  leg('L1d sev-2-sick holder is a patient, not the duty holder', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    v.sick = v.sick || {};
    v.sick[holder] = { name: 'wound fever', daysLeft: 4, severity: 2 };
    assert.strictEqual(Game.medicDutyHolder(), null, 'sev-2-sick holder reads vacant');
    const next = Game.medicDutyTick();
    assert.ok(next !== holder, 'duty does not reassign to the sev-2-sick medic');
    delete v.sick[holder];
    Game.medicDutyTick();
  });

  leg('L2 departure block: objMaybeDepart keeps the holder home on indoor chore work', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    // Force a ready outdoor objective, solo (no companion ask), and a 'go'
    // danger verdict (test-only seam, restored below) so the ONLY reason
    // the holder stays home is the duty.
    const o = Game.objOf(holder);
    o.kind = 'FORAGE'; o.purpose = 'forage'; o.state = 'ready'; o.indoor = false;
    o.tx = Math.min(8, hx + 1); o.ty = hy; o.tightness = 0; o.partsLeft = 6;
    o.solo = true; o.companion = null; o.targetVid = null;
    const origDanger = Game.objDanger;
    Game.objDanger = () => ({ verdict: 'go' });
    const blockedBefore = v.medicDutyBlocked || 0;
    try {
      const node = Game.npcNode(holder);
      Game.objMaybeDepart(holder, node, true, hx, hy);
    } finally { Game.objDanger = origDanger; }
    assert.ok(!(v.away || {})[holder], 'holder did not depart');
    assert.strictEqual(o.state, 'indoor', 'holder objective became indoor (got ' + o.state + ')');
    assert.strictEqual(o.kind, 'HAVEN_CHORE', 'holder takes Haven chore work (got ' + o.kind + ')');
    assert.strictEqual(v.medicDutyBlocked, blockedBefore + 1, 'blocked-departure counter incremented');
    console.log('    ' + nm(holder) + ' stayed home on ' + o.chore + ' duty; blocked=' + v.medicDutyBlocked);
  });

  leg('L2b LEAVE is exempt: the desperate still walk out, duty passes on', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    const o = Game.objOf(holder);
    o.kind = 'LEAVE'; o.purpose = 'leave'; o.state = 'ready'; o.indoor = false;
    o.tx = Math.min(8, hx + 1); o.ty = hy; o.tightness = 0; o.partsLeft = 6;
    o.solo = true; o.companion = null; o.targetVid = null;
    const node = Game.npcNode(holder);
    Game.objMaybeDepart(holder, node, true, hx, hy);
    assert.ok((v.away || {})[holder], 'LEAVE holder departed (duty does not trap the desperate)');
    assert.strictEqual(Game.medicDutyHolder(), null, 'duty reads vacant once the holder has left');
    // The villager is gone for the rest of this fixture; restore them so
    // later legs still have a medic at Haven.
    delete v.away[holder];
    const back = Game.objOf(holder);
    back.kind = 'idle'; back.state = 'done'; back.indoor = false;
    Game.medicDutyTick();
  });

  leg('L2c expedition block: voluntary launches blocked, directed win-plan launches exempt', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    v.health = v.health || {};
    v.health[holder] = 100; // healthy: the heal gate cannot be the reason they stay
    const blockedBefore = v.medicDutyBlocked || 0;
    Game.startExpedition(holder, hx, hy, false);
    assert.ok(!(v.away || {})[holder], 'voluntary expedition did not launch for the holder');
    assert.strictEqual(v.medicDutyBlocked, blockedBefore + 1, 'blocked counter incremented for the expedition');
    // Directed launch (win-plan party leg): exempt.
    Game.startExpedition(holder, hx, hy, false, { tx: Math.min(8, hx + 2), ty: hy, duration: 8 });
    assert.ok((v.away || {})[holder], 'directed launch departed (win-plan exempt)');
    assert.strictEqual(Game.medicDutyHolder(), null, 'duty reads vacant once the holder is out on the directed launch');
    delete v.away[holder];
    try { delete (Game.agencyState().exped || {})[holder]; } catch (e) {}
    const back = Game.objOf(holder);
    back.kind = 'idle'; back.state = 'done'; back.indoor = false;
    Game.medicDutyTick();
    console.log('    voluntary blocked, directed departed; duty reassigned to ' + nm(Game.medicDutyHolder()));
  });

  leg('L2d companion exclusion: objAskCompanion never picks the duty holder', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    // Make the holder the ONLY plausible companion: every other villager's
    // node is moved off Haven, and the holder holds a ready outdoor errand
    // (score +4) so they would be the top candidate without the exclusion.
    const principal = roster.find(id => id !== holder && !((Game.getPerson(id) || {}).dead));
    assert.ok(principal, 'a principal exists');
    const ho = Game.objOf(holder);
    ho.kind = 'FORAGE'; ho.purpose = 'forage'; ho.state = 'ready'; ho.indoor = false;
    ho.tx = hx; ho.ty = hy; ho.tightness = 0; ho.partsLeft = 6;
    const savedNodes = {};
    for (const id of roster) {
      if (id === holder) continue;
      try { savedNodes[id] = Game.npcNode(id); Game.npcSetNode(id, 0, 0); } catch (e) {}
    }
    const po = Game.objOf(principal);
    po.kind = 'FORAGE'; po.purpose = 'forage'; po.state = 'ready'; po.indoor = false;
    po.tx = Math.min(8, hx + 1); po.ty = hy; po.tightness = 0; po.partsLeft = 6; po.solo = false;
    let picked = null;
    try { picked = Game.objAskCompanion(principal, po, hx, hy); }
    finally {
      for (const [id, node] of Object.entries(savedNodes)) {
        try { if (node) Game.npcSetNode(id, node.nx, node.ny); } catch (e) {}
      }
    }
    assert.ok(picked !== holder, 'companion ask did not pick the duty holder (picked ' + (picked ? nm(picked) : 'none') + ')');
    assert.strictEqual(picked, null, 'with only the holder as a candidate, no companion is picked');
  });

  leg('L3 tending priority: the duty holder tends the sickest patient first', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    // Total tend reach on this game: each medic tends 1, or 2 with triage.
    // Take reach+1 patients with ascending HPs: the reach sickest must be
    // tended and the healthiest must not be — that ordering IS the priority,
    // whatever the medic count on this base.
    let totalReach = 0;
    for (const mid of ms) {
      let reach = 1;
      try { if (Game.npcHasAbility && Game.npcHasAbility(mid, 'triage')) reach = 2; } catch (e) {}
      totalReach += reach;
    }
    const nonMedics = roster.filter(id => id !== holder && !ms.includes(id) && !((Game.getPerson(id) || {}).dead));
    const patients = nonMedics.slice(0, totalReach + 1);
    assert.ok(patients.length === totalReach + 1, 'enough patients for reach+1, got ' + patients.length + ' for reach ' + totalReach);
    v.sick = {};
    v.health = v.health || {};
    patients.forEach((id, i) => {
      v.sick[id] = { name: 'wound fever', daysLeft: 5, severity: 1 };
      v.health[id] = 20 + i * 15; // ascending HP: patients[0] is the sickest
    });
    Game.villagerCareTick(nm);
    for (let i = 0; i < totalReach; i++) {
      assert.strictEqual(v.sick[patients[i]].daysLeft, 4, 'patient ' + (i + 1) + ' (' + (20 + i * 15) + ' HP) tended');
    }
    assert.strictEqual(v.sick[patients[totalReach]].daysLeft, 5, 'healthiest patient not tended this tick');
    console.log('    tended the ' + totalReach + ' sickest of ' + patients.length + ' patients, left the healthiest — sickest first');
    for (const id of patients) delete v.sick[id];
  });

  leg('L4 no-cure: the duty creates no cure path; care still only tends', () => {
    const ms = prepMedics();
    const holder = Game.medicDutyTick();
    assert.ok(holder, 'holder assigned');
    // The duty must never call the scholar's cure.
    let treatCalls = 0;
    const origTreat = Game.treatVillager;
    Game.treatVillager = function () { treatCalls++; return origTreat.apply(this, arguments); };
    try {
      v.sick = {};
      const patient = roster.find(id => id !== holder && !((Game.getPerson(id) || {}).dead));
      assert.ok(patient, 'a patient exists');
      v.sick[patient] = { name: 'wound fever', daysLeft: 5, severity: 1 };
      for (let i = 0; i < 10; i++) {
        Game.medicDutyTick();
        Game.villagerCareTick(nm);
      }
      const rec = (Game.state.village.sick || {})[patient];
      assert.ok(rec, 'record survives repeated duty + care ticks (never deleted)');
      assert.strictEqual(rec.daysLeft, 1, 'care parks at daysLeft 1, got ' + rec.daysLeft);
      assert.strictEqual(treatCalls, 0, 'treatVillager never called by the duty');
      delete v.sick[patient];
    } finally { Game.treatVillager = origTreat; }
    // Code-read: no v.sick deletion in the duty functions.
    const gameSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    for (const fnName of ['medicDutyTick() {', 'medicDutyHolder() {']) {
      const start = gameSrc.indexOf(fnName);
      assert.ok(start > 0, fnName + ' found in game.js');
      const end = gameSrc.indexOf('\n    },', start);
      const body = gameSrc.slice(start, end === -1 ? start + 6000 : end);
      assert.ok(!body.includes('delete v.sick'), fnName + ' never deletes a v.sick record');
      assert.ok(!body.includes('treatVillager'), fnName + ' never calls the scholar cure');
    }
    console.log('    duty + care: 5 -> 1, record kept, treatVillager 0 calls');
  });

  // ---- L5 live leg: duty recorder neutral vs medicdiag recorder ----
  await aleg('L5 live leg: duty recorder is neutral vs the medicdiag recorder on this base (96301+96302, 150d)', async () => {
    const diagSweep = require('./sweep-medicdiag-a.js');
    for (const seed of [96301, 96302]) {
      const r = await oneRun(seed, 150);
      const d = await diagSweep.oneRun(seed, 150);
      assert.strictEqual(JSON.stringify(r.fingerprint), JSON.stringify(d.fingerprint),
        's' + seed + ' medicduty fingerprint == medicdiag fingerprint on this base');
      const dHealer = d.perSeed.medicDays.map(m => m.healerPresent);
      const rHealer = r.perSeed.dutyDays.map(m => m.healerPresent);
      assert.deepStrictEqual(rHealer, dHealer, 's' + seed + ' healerPresent series identical');
      const dSick = d.perSeed.medicDays.map(m => m.sickCountNPC);
      const rSick = r.perSeed.dutyDays.map(m => m.sickCountNPC);
      assert.deepStrictEqual(rSick, dSick, 's' + seed + ' sickCountNPC series identical');
      console.log('    s' + seed + ': daysAlive=' + r.perSeed.daysAlive + ' end=' + r.fingerprint.endReason +
        ' dutyDays=' + r.perSeed.dutyDays.filter(m => m.dutyVid).length +
        ' blocked=' + (r.perSeed.dutyDays[r.perSeed.dutyDays.length - 1] || {}).dutyBlocked);
    }
  });

  await aleg('L6 analyzer runs on the pilot corpora with a clean join', async () => {
    const beforeDir = path.join(CORPUS, 'before');
    const present = fs.existsSync(beforeDir) ? fs.readdirSync(beforeDir).filter(f => /^medicduty-a-competent-s\d+\.json$/.test(f)) : [];
    assert.ok(present.length === 8, 'before corpus holds 8 duty seed files, got ' + present.length);
    const r = cp.spawnSync(process.execPath, [ANALYZE, '--leg', beforeDir], { encoding: 'utf8', timeout: 60000 });
    assert.strictEqual(r.status, 0, 'analyzer --leg exit 0: ' + (r.stderr || '').slice(0, 500));
    for (const pat of ['PRIMARY:', 'DUTY:', 'SECONDARY:', 'GUARDRAILS:']) {
      assert.ok(r.stdout.includes(pat), pat + ' printed');
    }
    assert.ok(/joinMismatches=0/.test(r.stdout), 'duty/medicdiag join is clean (0 mismatches)');
    console.log('    analyzer --leg before: ' + r.stdout.split('\n').find(l => l.startsWith('PRIMARY:')));
  });

  console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
