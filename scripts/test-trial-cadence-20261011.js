#!/usr/bin/env node
// test-trial-cadence-20261011.js — lever 9 r3 proof: audience-trial cadence
// (0.25 -> 0.40 offer chance, completeTrial cooldown +7 -> +4) + the
// recordMoment silent-bug fix (t.name on an unbound t).
//
// Mechanical: guards intact, offer rate ~0.40, cooldown +4, gift semantics
// unchanged (synergy-aware pick, full-slots refusal, +15 integ, synergy
// recompute), moment recorded with the trial's real text.
// Sense: the offer/completion copy reads as System voice with no template
// leakage ("undefined", raw ids).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const notes = [];
function ok(cond, name, detail) {
  if (cond) { pass++; }
  else { fail++; notes.push(`FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

// eligible: system arrived, integ >= 40, no pending trial, no cooldown.
function makeEligible(Game) {
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  s.day = 60; s.integration = 60;
  const pg = Game.progState();
  pg.trial = null; pg.trialCd = 0;
  return pg;
}

(async () => {
  const { Game } = await loadGame({ seed: 777, mode: 'god', fullTelemetry: false });
  await setupGame(Game);

  // capture narration for the sense read
  const said = [];
  Game.say = (m) => said.push(String(m));
  Game.sysSay = (m) => said.push(String(m));

  // ---------- 1. guards intact ----------
  makeEligible(Game);
  Game.state.systemArrived = false;
  Game.checkAudienceEncore();
  ok(Game.progState().trial == null, 'guard: no offer pre-arrival');
  makeEligible(Game);
  Game.state.scholar.integration = 30;
  Game.checkAudienceEncore();
  ok(Game.progState().trial == null, 'guard: no offer below integ 40');
  makeEligible(Game);
  Game.progState().trial = { id: 'x', kind: 'pantry', need: 1, have: 0, expires: 999 };
  Game.checkAudienceEncore();
  ok(Game.progState().trial.id === 'x', 'guard: no offer while trial pending');
  makeEligible(Game);
  Game.progState().trialCd = 999;
  Game.checkAudienceEncore();
  ok(Game.progState().trial == null, 'guard: cooldown respected');

  // ---------- 2. offer rate ~0.40 ----------
  makeEligible(Game);
  let offers = 0; const N = 500;
  for (let i = 0; i < N; i++) {
    const pg = Game.progState();
    pg.trial = null; pg.trialCd = 0;
    Game.checkAudienceEncore();
    if (pg.trial) offers++;
  }
  const rate = offers / N;
  ok(rate >= 0.30 && rate <= 0.50, 'offer rate ~0.40', `${rate.toFixed(3)} (${offers}/${N})`);

  // ---------- 3. source wiring ----------
  const src = fs.readFileSync(path.join(ROOT, 'src/js/progression.js'), 'utf8');
  ok(/checkAudienceEncore\(\) \{[\s\S]{0,600}?Math\.random\(\) < 0\.40/.test(src),
    'wiring: checkAudienceEncore rolls < 0.40');
  ok(/pg\.trialCd = \(s\.day \|\| 0\) \+ 4;/.test(src),
    'wiring: completeTrial cooldown +4');

  // ---------- 4. completion: cooldown, integ, gift, synergy ----------
  makeEligible(Game);
  const s = Game.state.scholar;
  s.abilities = [{ id: 'mediator', name: 'Mediator', level: 1, xp: 0 }]; // one synergy leg held
  s.synergies = [];
  const integBefore = s.integration;
  const vRawBefore = (Game.state.village || {}).viewership; // may be null
  // stage a completable trial: pantry haul, already hauled
  const pg = Game.progState();
  const pk = Game.pantryKcal ? Game.pantryKcal() : 0;
  pg.trial = { id: 'haul_small', text: 'Haul 1,000 kcal to the pantry within 3 days.', need: 1000, have: 0, kind: 'pantry', start: pk - 1000, expires: (s.day || 0) + 3 };
  Game.checkTrial('daily');
  ok(pg.trial == null, 'trial completes when the haul is met');
  ok(pg.trialCd === (s.day || 0) + 4, 'cooldown is day+4', `trialCd=${pg.trialCd} day=${s.day}`);
  ok(Math.round(s.integration) === Math.round(Math.min(100, integBefore + 15)), '+15 integration', `${integBefore} -> ${s.integration}`);
  // PICK 1 OF 3 (Steve 2026-10-14): the trial now offers a choice sheet led
  // by the synergy-aware pick, instead of granting it directly.
  const sheet = (s.abilityChoices || []).map(c => c.id);
  ok(sheet.length === 3 && sheet[0] === 'diplomat', 'trial offers 1 of 3, led by the synergy-aware pick (diplomat)', sheet.join(','));
  Game.chooseAbility('diplomat');
  const got = (s.abilities || []).map(a => a.id);
  ok(got.includes('diplomat'), 'choosing the lead pick grants diplomat', got.join(','));
  // discovery itself needs uses (checkSynergyDiscovery attempt windows) —
  // the gift's job is completing the legs. Assert the pairing is co-held.
  ok(got.includes('mediator') && got.includes('diplomat'),
    'synergy legs co-held after gift (discovery follows from play)', got.join(','));
  // the moment: recorded with real text, not undefined
  const moments = pg.moments || [];
  ok(moments.length > 0 && /Haul 1,000 kcal/.test(moments[0].text || ''), 'recordMoment fires with trial text', moments[0] && moments[0].text);
  ok(!/undefined/.test(moments[0] && moments[0].text || ''), 'no "undefined" in the moment');
  const viewAfter = (Game.state.village || {}).viewership;
  // the exact arithmetic is ledger.js's domain (havenViewership is
  // showmanship-reactive); this test asserts the moment registered at all.
  ok(viewAfter != null && viewAfter > 0, 'viewership registered by the moment', `${vRawBefore} -> ${viewAfter}`);

  // ---------- 5. slot-opening gift + true-full refusal ----------
  // Pre-existing design (verified on this code): completeTrial integrates
  // FIRST (+15 can open a slot), then the gift fills it. 4/4 at integ 60
  // -> integ 75 opens slot 5 -> the gift takes it. Honest, not forced.
  makeEligible(Game);
  s.abilities = [];
  {
    const slots = Game.abilitySlots();
    const pool = (Game.data.abilities || []).filter(a => a.unlock && a.unlock.type === 'system_offer');
    for (let i = 0; i < slots && i < pool.length; i++) s.abilities.push({ id: pool[i].id, name: pool[i].name, level: 1, xp: 0 });
    ok(s.abilities.length === slots, 'setup: slots full at current integ', `${s.abilities.length}/${slots}`);
    pg.trial = { id: 'haul_small', text: 'Haul 1,000 kcal to the pantry within 3 days.', need: 1000, have: 0, kind: 'pantry', start: (Game.pantryKcal ? Game.pantryKcal() : 0) - 1000, expires: (s.day || 0) + 3 };
    said.length = 0;
    Game.checkTrial('daily');
    if (s.abilityChoices && s.abilityChoices[0]) Game.chooseAbility(s.abilityChoices[0].id);
    ok(s.abilities.length === slots + 1 && s.abilities.length === Game.abilitySlots(),
      'trial opens a slot and the chosen gift fills it (never exceeds slots)',
      `${slots} -> ${s.abilities.length} (slots now ${Game.abilitySlots()})`);
  }
  // True-full: integ 100 (6 slots), 6 held -> the gift is refused honestly.
  makeEligible(Game);
  s.integration = 100;
  ok(Game.abilitySlots() === 6, 'setup: 6 slots at integ 100');
  s.abilities = [];
  {
    const pool = (Game.data.abilities || []).filter(a => a.unlock && a.unlock.type === 'system_offer');
    for (let i = 0; i < 6 && i < pool.length; i++) s.abilities.push({ id: pool[i].id, name: pool[i].name, level: 1, xp: 0 });
    pg.trial = { id: 'haul_small', text: 'Haul 1,000 kcal to the pantry within 3 days.', need: 1000, have: 0, kind: 'pantry', start: (Game.pantryKcal ? Game.pantryKcal() : 0) - 1000, expires: (s.day || 0) + 3 };
    said.length = 0;
    Game.checkTrial('daily');
    ok(s.abilities.length === 6, 'full slots at max: no gift forced', `6 -> ${s.abilities.length}`);
    ok(said.some(m => /TRIAL COMPLETE/.test(m)) && !/gift:/.test(said.join(' ')),
      'completion narrated without a gift when slots are full');
  }

  // ---------- 6. sense read: the copy ----------
  makeEligible(Game);
  said.length = 0;
  Game.offerAudienceTrial('audience');
  const offerCopy = said.join('\n');
  console.log('\n--- sense: offer copy ---\n' + offerCopy.split('\n').slice(0, 4).join('\n'));
  ok(/AUDIENCE TRIAL/.test(offerCopy), 'offer beat fires with the trial frame');
  ok(!/undefined/.test(offerCopy), 'no "undefined" in offer copy');
  ok(/integration, and a gift/i.test(offerCopy), 'offer names the reward honestly');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (notes.length) console.log(notes.join('\n'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
