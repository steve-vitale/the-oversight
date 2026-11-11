// test-dutyfirst-b.js — proof for the duties first-numbers instrument
// (arm sim-dutyfirst-b, run fleshout-loop-b-20261111T1131Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-dutyfirst-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const DI = require(path.join(REPO, 'scripts', 'dutyfirst-instrument-20261111'));
const AN = require(path.join(REPO, 'scripts', 'dutyfirst-analyze-20261111'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Analyzer classifier fixtures (no game load) ----
(function () {
  eq(AN.dutyTaskForDeposit('Foraged food'), 'forage-or-scout', 'A1 Foraged food maps to forage-or-scout');
  eq(AN.dutyTaskForDeposit('Fish catch'), 'fish', 'A2 Fish catch maps to fish');
  eq(AN.dutyTaskForDeposit('Game meat'), 'hunt', 'A3 Game meat maps to hunt');
  eq(AN.dutyTaskForDeposit('Garden harvest'), 'garden', 'A4 Garden harvest maps to garden');
  eq(AN.dutyTaskForDeposit('Snared meat'), null, 'A5 Snared meat is NOT a duty deposit (villager TRAPS)');
  eq(AN.dutyTaskForDeposit('Meal leftovers'), null, 'A6 Meal leftovers is not a duty deposit');
  ok(AN.isDutyDepositName('Game meat'), 'A7 Game meat is a duty deposit');
  ok(!AN.isDutyDepositName(null), 'A8 null deposit name is not a duty deposit');
  ok(DI.TASKS.length === 15 && DI.TASKS.indexOf('rest') !== -1, 'A9 fifteen tasks incl. rest');
})();

// ---- B. Live wrap fixtures (one game load, direct calls) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 190311, mode: 'dutyfirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  ['assignTask', 'offerDeal', 'appealToGoal', 'resolveAssignments',
   'resolveOneAssignment', 'villagerPractice', 'villagerHuntResolve',
   'hurtVillager', 'stockPantry', 'resolvePatrol', 'recordWaveKill',
   'medicDutyTick', 'medicDutyCureAttempt', 'villagerCareTick', 'tele',
   'noteDeed', 'creditDeed'].forEach(function (n) { orig[n] = Game[n]; });
  const di = DI.install(Game);
  const t = di.t;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const roster = (v.roster || []).slice();
  const vid = roster.find(function (x) { return x !== Game.villagerId; }) || roster[0];
  const vid2 = roster.find(function (x) { return x !== Game.villagerId && x !== vid; }) || vid;
  const first = Game.displayName(vid).split(' ')[0];
  v.trust = v.trust || {};
  v.health = v.health || {};
  v.trust[vid] = 80; v.trust[vid2] = 80;
  v.health[vid] = 100; v.health[vid2] = 100;

  // B1: assignTask('wood') ok — recorded with trust/HP/comp/caller/via.
  const r1 = Game.assignTask(vid, 'wood', { via: 'in-person' });
  ok(r1 && r1.ok === true, 'B1 assignTask wood ok', r1);
  ok(t.assignCalls.length === 1 && t.assignCalls[0].task === 'wood' && t.assignCalls[0].ret === 'ok',
    'B1b assignTask wood recorded', t.assignCalls[0]);
  ok(t.assignCalls[0].trustBefore === 80 && t.assignCalls[0].hpBefore === 100,
    'B1c trust/HP-before recorded', { tr: t.assignCalls[0].trustBefore, hp: t.assignCalls[0].hpBefore });
  ok(typeof t.assignCalls[0].comp === 'number' && t.assignCalls[0].via === 'in-person' && t.assignCalls[0].caller,
    'B1d competence/via/caller recorded', { comp: t.assignCalls[0].comp, caller: t.assignCalls[0].caller });

  // B2: trust refusal — trust 5, wood (gate 20): refused, trust-gate class.
  v.trust[vid2] = 5;
  const r2 = Game.assignTask(vid2, 'wood', { via: 'in-person' });
  ok(r2 && r2.refused === true, 'B2 trust refusal returns refused', r2);
  ok(t.assignCalls[1].ret === 'refused' && t.assignCalls[1].reasonClass === 'trust-gate',
    'B2b refusal classified trust-gate', t.assignCalls[1]);
  v.trust[vid2] = 80;

  // B3: wounded refusal — HP 30, outdoor hunt: refused, reason 'wounded'.
  v.health[vid2] = 30;
  const r3 = Game.assignTask(vid2, 'hunt', { via: 'in-person' });
  ok(r3 && r3.refused === true && r3.reason === 'wounded', 'B3 wounded refusal', r3);
  ok(t.assignCalls[2].ret === 'refused' && t.assignCalls[2].reasonClass === 'wounded' && t.assignCalls[2].hpBefore === 30,
    'B3b wounded refusal classified', t.assignCalls[2]);
  v.health[vid2] = 100;

  // B4: remote / unknown-task / rest / self nulls, each classified.
  const r4 = Game.assignTask(vid, 'wood', { via: 'shout' });
  ok(r4 === null && t.assignCalls[3].reasonClass === 'remote', 'B4 remote assign null + classified remote', t.assignCalls[3]);
  const r5 = Game.assignTask(vid, 'nope-task');
  ok(r5 === null && t.assignCalls[4].reasonClass === 'null-task', 'B4b unknown task null + classified null-task', t.assignCalls[4]);
  const r6 = Game.assignTask(vid, 'rest');
  ok(r6 === null && t.assignCalls[5].reasonClass === 'rest' && !((v.assignments || {})[vid]),
    'B4c rest null + assignment deleted', t.assignCalls[5]);
  const rSelf = Game.assignTask(Game.villagerId, 'wood');
  ok(rSelf === null && t.assignCalls[6].reasonClass === 'self', 'B4d self-assign null + classified self', t.assignCalls[6]);

  // B5: re-assign wood, then resolveAssignments — assignment path,
  // completed outcome, practice rep recorded.
  Game.assignTask(vid, 'wood', { via: 'in-person' });
  const resBefore = t.resolutions.length;
  const prBefore = t.practiceReps.length;
  Game.resolveAssignments();
  const woodRes = t.resolutions.slice(resBefore).filter(function (x) { return x.vid === vid; });
  ok(woodRes.length === 1 && woodRes[0].callerPath === 'assignment' && woodRes[0].outcome === 'completed' && woodRes[0].taskPre === 'wood',
    'B5 assignment resolution completed', woodRes[0]);
  ok(t.practiceReps.length > prBefore && t.practiceReps[t.practiceReps.length - 1].task === 'wood',
    'B5b practice rep recorded for the resolution', t.practiceReps[t.practiceReps.length - 1]);
  const rcWood = t.resolveCalls.filter(function (x) { return x.vid === vid; });
  ok(rcWood.length >= 1 && rcWood[rcWood.length - 1].outcome === 'completed',
    'B5c resolveAssignments diff classifies completed', rcWood[rcWood.length - 1]);

  // B6: task-lead resolution — synthetic lead, no assignment.
  v.taskLeads = v.taskLeads || {};
  v.taskLeads.wood = vid2;
  const resBefore6 = t.resolutions.length;
  Game.resolveAssignments();
  const leadRes = t.resolutions.slice(resBefore6).filter(function (x) { return x.vid === vid2; });
  ok(leadRes.length === 1 && leadRes[0].callerPath === 'taskLead' && leadRes[0].outcome === 'completed',
    'B6 task-lead resolution recorded (sim-huntstaff-b3 lesson)', leadRes[0]);
  delete v.taskLeads.wood;

  // B7: throttle redirect — pantry stuffed fresh (>4 days), forage duty
  // redirects to an alt task; outer record 'redirected', ledger moves.
  // pantryFreshDays with no burn history divides by pop*2000, so 12
  // villagers need >96,000 fresh kcal to pass the 4-day bar.
  Game.stockPantry(150000, 'Foraged food');
  const depBefore = t.deposits.filter(function (d) { return d.name === 'Foraged food'; }).length;
  ok(depBefore >= 1, 'B7 stockPantry deposit recorded', { n: depBefore });
  Game.assignTask(vid, 'forage', { via: 'in-person' });
  const thrBefore = v.throttleRedirects || 0;
  const resBefore7 = t.resolutions.length;
  Game.resolveAssignments();
  const redir = t.resolutions.slice(resBefore7).filter(function (x) { return x.vid === vid && x.taskPre === 'forage'; });
  ok(redir.length === 1 && redir[0].outcome === 'redirected' && redir[0].taskPost !== 'forage',
    'B7b throttle redirect recorded (outer redirected, alt task shown)', redir[0]);
  ok((v.throttleRedirects || 0) > thrBefore, 'B7c throttle ledger moved', { before: thrBefore, after: v.throttleRedirects });
  const rcForage = t.resolveCalls.filter(function (x) { return x.vid === vid && x.task === 'forage'; });
  ok(rcForage.length >= 1 && rcForage[rcForage.length - 1].outcome === 'redirected',
    'B7d resolveAssignments diff classifies redirected', rcForage[rcForage.length - 1]);

  // B8: cistern redirect — cistern full, water duty redirects.
  v.water = { clean: 40, dirty: 0 };
  Game.assignTask(vid, 'water', { via: 'in-person' });
  const ccBefore = v.cisternRedirects || 0;
  const resBefore8 = t.resolutions.length;
  Game.resolveAssignments();
  const credir = t.resolutions.slice(resBefore8).filter(function (x) { return x.vid === vid && x.taskPre === 'water'; });
  ok(credir.length === 1 && credir[0].outcome === 'redirected',
    'B8 cistern redirect recorded', credir[0]);
  ok((v.cisternRedirects || 0) > ccBefore, 'B8b cistern ledger moved', { before: ccBefore, after: v.cisternRedirects });
  v.water = { clean: 0, dirty: 0 };

  // B9: villagerHuntResolve live — record shape, killed iff aid + kcal.
  const huntsBefore = t.hunts.length;
  const hr = Game.villagerHuntResolve(vid, 1.0);
  ok(t.hunts.length === huntsBefore + 1 && typeof t.hunts[t.hunts.length - 1].killed === 'boolean',
    'B9 villagerHuntResolve recorded', t.hunts[t.hunts.length - 1]);
  ok(!t.hunts[t.hunts.length - 1].killed || (t.hunts[t.hunts.length - 1].aid && t.hunts[t.hunts.length - 1].kcal > 0),
    'B9b kill implies species + kcal', hr);

  // B10: hurtVillager during duty — attribution from the live assignment.
  Game.assignTask(vid, 'wood', { via: 'in-person' });
  const hpBefore = v.health[vid];
  const hurtsBefore = t.hurts.length;
  Game.hurtVillager(vid, 10, 'test-cause');
  ok(t.hurts.length === hurtsBefore + 1 && t.hurts[t.hurts.length - 1].dutyTask === 'wood' && t.hurts[t.hurts.length - 1].cause === 'test-cause',
    'B10 hurtVillager attributed to the live duty', t.hurts[t.hurts.length - 1]);
  ok(t.hurts[t.hurts.length - 1].hpBefore === hpBefore && t.hurts[t.hurts.length - 1].hpAfter === hpBefore - 10,
    'B10b HP before/after recorded', { before: hpBefore, after: t.hurts[t.hurts.length - 1].hpAfter });
  // leave the assignment in place for the B5-style cleanup below: the
  // next resolveAssignments clears it.

  // B11: resolvePatrol live — no world monsters, uneventful patrol.
  const patBefore = t.patrols.length;
  try { Game.resolvePatrol(vid, first); } catch (e) { ok(false, 'B11 resolvePatrol live', { err: String(e && e.message) }); }
  ok(t.patrols.length === patBefore + 1 && t.patrols[t.patrols.length - 1].vid === vid,
    'B11 resolvePatrol recorded', t.patrols[t.patrols.length - 1]);

  // B12: recordWaveKill live.
  const wkBefore = t.waveKills.length;
  try { Game.recordWaveKill('glasswing', vid, 'patrol', null); } catch (e) { ok(false, 'B12 recordWaveKill live', { err: String(e && e.message) }); }
  ok(t.waveKills.length === wkBefore + 1 && t.waveKills[t.waveKills.length - 1].channel === 'patrol',
    'B12 recordWaveKill patrol channel recorded', t.waveKills[t.waveKills.length - 1]);

  // B13: medic duty — pick a roster villager physically at Haven, make
  // them a nurse, tick picks them (no tier-0 healing-ability holder in
  // a fresh cast to outrank an occupation medic — verified below).
  let medicVid = null;
  try {
    const haven = (typeof Game.campPeopleIds === 'function') ? (Game.campPeopleIds('haven') || []) : [];
    medicVid = roster.find(function (x) { return x !== Game.villagerId && haven.indexOf(x) !== -1; }) || null;
  } catch (e) {}
  if (!medicVid) medicVid = vid2;
  const pMed = Game.getPerson(medicVid);
  if (pMed) pMed.formerOccupation = 'nurse';
  v.trust[medicVid] = 80; v.health[medicVid] = 100;
  ok(Game.isMedicDutyEligible(medicVid) === true, 'B13 nurse is medic-duty eligible');
  let tier0 = null;
  try {
    for (const cand of roster) {
      if (cand === Game.villagerId || cand === medicVid) continue;
      if (Game.npcHasAbility && (Game.npcHasAbility(cand, 'triage') || Game.npcHasAbility(cand, 'herbal_remedy') || Game.npcHasAbility(cand, 'field_medicine'))) { tier0 = cand; break; }
    }
  } catch (e) {}
  const mtBefore = t.medicTicks.length;
  const holder = Game.medicDutyTick();
  if (tier0) {
    console.log('note  B13 tier-0 ability holder ' + tier0 + ' outranks the nurse; holder assertion relaxed to eligible');
    ok(t.medicTicks.length === mtBefore + 1 && t.medicTicks[t.medicTicks.length - 1].holderAfter !== null,
      'B13b medicDutyTick picks a holder', t.medicTicks[t.medicTicks.length - 1]);
    ok(holder !== null && Game.isMedicDutyEligible(holder), 'B13c holder is eligible', { holder: holder });
  } else {
    ok(t.medicTicks.length === mtBefore + 1 && t.medicTicks[t.medicTicks.length - 1].holderAfter === medicVid,
      'B13b medicDutyTick picks the nurse holder', t.medicTicks[t.medicTicks.length - 1]);
    ok(holder === medicVid, 'B13c medicDutyTick returns the holder', { holder: holder });
  }
  ok(typeof t.medicTicks[t.medicTicks.length - 1].eligibleCount === 'number' && t.medicTicks[t.medicTicks.length - 1].eligibleCount >= 1,
    'B13d eligible pool counted', { n: t.medicTicks[t.medicTicks.length - 1].eligibleCount });

  // B14: medic cure attempt — sick patient (wound fever), holder granted
  // herbal_remedy. Expectation computed from the engine's own cure table,
  // never assumed: if the table says 'cure' the attempt must cure via
  // ability (patient is diagnosed, so a diagnosis gate cannot block it).
  v.sick = v.sick || {};
  v.sick[vid] = { name: 'wound fever', severity: 1, daysLeft: 5, diagnosed: true };
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[medicVid] = ['herbal_remedy'];
  let eff = null, needsDiag = null;
  try { eff = Game.cureEffectFor('wound_fever', 'herbal_remedy'); } catch (e) {}
  try { const def = Game.seDef ? Game.seDef('wound_fever') : null; needsDiag = def && def.cure ? !!def.cure.needsDiagnosis : false; } catch (e) {}
  const expectCure = (eff === 'cure' && (!needsDiag || true)); // diagnosed:true above
  const caBefore = t.cureAttempts.length;
  const curesBefore = ((v.medicDutyCures || {}).ability || 0);
  const cured = Game.medicDutyCureAttempt(medicVid, vid, function (id) { try { const p = Game.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } });
  ok(t.cureAttempts.length === caBefore + 1 && t.cureAttempts[t.cureAttempts.length - 1].disease === 'wound_fever',
    'B14 cure attempt recorded with disease', t.cureAttempts[t.cureAttempts.length - 1]);
  if (expectCure) {
    ok(cured === true && t.cureAttempts[t.cureAttempts.length - 1].result === 'cured' && t.cureAttempts[t.cureAttempts.length - 1].via === 'ability',
      'B14b ability-channel cure recorded', t.cureAttempts[t.cureAttempts.length - 1]);
    ok(((v.medicDutyCures || {}).ability || 0) === curesBefore + 1, 'B14c ability cure counter moved');
  } else {
    console.log('note  B14b no cure expected from the table (eff=' + eff + ' needsDiag=' + needsDiag + '); attempt recorded as ' + t.cureAttempts[t.cureAttempts.length - 1].result);
    ok(t.cureAttempts[t.cureAttempts.length - 1].result === 'no', 'B14b attempt recorded as no-cure (table says no cure)');
  }
  delete v.sick[vid];

  // B15: villagerCareTick live — a sick villager + the nurse holder.
  v.sick[vid] = { name: 'wound fever', severity: 1, daysLeft: 5, diagnosed: true };
  const ctBefore = t.careTicks.length;
  Game.villagerCareTick('Test');
  ok(t.careTicks.length === ctBefore + 1 && typeof t.careTicks[t.careTicks.length - 1].sickBefore === 'number',
    'B15 villagerCareTick recorded', t.careTicks[t.careTicks.length - 1]);
  delete v.sick[vid];

  // B16: tele npc_trap recorded.
  Game.tele('npc_trap', { vid: vid, caught: true, kcal: 250 });
  ok(t.teleTrap.length === 1 && t.teleTrap[0].type === 'npc_trap' && t.teleTrap[0].kcal === 250,
    'B16 tele npc_trap recorded', t.teleTrap[0]);

  // B17: deeds — noteDeed('foraging') records exactly once (dedup).
  const deedsBefore = t.deeds.length;
  Game.noteDeed('foraging');
  eq(t.deeds.length, deedsBefore + 1, 'B17 noteDeed foraging records once (no double-count)');
  ok(t.deeds[t.deeds.length - 1].who === 'player', 'B17b player deed actor');
  Game.creditDeed(vid, 'hunting');
  ok(t.deeds.length === deedsBefore + 2 && t.deeds[t.deeds.length - 1].who === vid,
    'B17c villager hunting deed recorded', t.deeds[t.deeds.length - 1]);
  const deedsBefore17d = t.deeds.length;
  Game.noteDeed('trapping'); // not a duty deed — must NOT record
  eq(t.deeds.length, deedsBefore17d, 'B17d non-duty deed not recorded');

  // B18: offerDeal / appealToGoal recorded (expected live calls, any return).
  const acBefore = t.assignCalls.length;
  try { Game.offerDeal(vid, 'wood'); } catch (e) {}
  try { Game.appealToGoal(vid, 'wood'); } catch (e) {}
  ok(t.assignCalls.length === acBefore + 2 && t.assignCalls[acBefore].verb === 'offerDeal' && t.assignCalls[acBefore + 1].verb === 'appealToGoal',
    'B18 offerDeal/appealToGoal recorded', { n: t.assignCalls.length - acBefore });

  // B19: snapshot shape.
  const snap = di.snapshot();
  ok(snap.assignments && typeof snap.assignments === 'object', 'B19 snapshot assignments map');
  ok(snap.taskLeads && typeof snap.taskLeads === 'object', 'B20 snapshot taskLeads map');
  ok(typeof snap.medicDutyHolder === 'string' || snap.medicDutyHolder === null, 'B21 snapshot medicDuty holder', { h: snap.medicDutyHolder });
  ok(typeof snap.medicEligible === 'number', 'B22 snapshot medic eligible count', { n: snap.medicEligible });
  ok(snap.medicCures && typeof snap.medicCures.ability === 'number', 'B23 snapshot medic cure counters');
  ok(snap.sick && typeof snap.sick === 'object', 'B24 snapshot sick map');
  ok(snap.rosterHP && typeof snap.rosterHP === 'object', 'B25 snapshot roster HP map');
  ok(snap.objectives && typeof snap.objectives === 'object', 'B26 snapshot objective kinds');
  ok(snap.pantryByName && typeof snap.pantryKcal === 'number', 'B27 snapshot pantry roll');
  ok(snap.water && typeof snap.water.clean === 'number', 'B28 snapshot water');
  ok(typeof snap.wood === 'number', 'B29 snapshot wood');
  ok(snap.cistern && typeof snap.cistern.waterHauls === 'number', 'B30 snapshot cistern ledgers');
  ok(snap.throttle && typeof snap.throttle.throttleRedirects === 'number', 'B31 snapshot throttle ledgers');
  ok(snap.deadfall && typeof snap.deadfall.hauls === 'number', 'B32 snapshot deadfall ledgers');
  ok(snap.haulcount && typeof snap.haulcount.villagerPreserveBatches === 'number', 'B33 snapshot haulcount tap');
  ok(snap.gives && snap.havenToday, 'B34 snapshot gives/havenToday');
  ok(snap.garden && typeof snap.garden.live === 'number', 'B35 snapshot garden plots');
  ok(Array.isArray(t.daily) && t.daily.length === 1, 'B36 snapshot stored');

  // B37: no instrument errors on the fixture run.
  eq(t.instrumentErrors.length, 0, 'B37 zero instrument errors', t.instrumentErrors);

  // B38: uninstall restores every wrapped method.
  di.uninstall();
  const restored = ['assignTask', 'offerDeal', 'appealToGoal', 'resolveAssignments',
    'resolveOneAssignment', 'villagerPractice', 'villagerHuntResolve',
    'hurtVillager', 'stockPantry', 'resolvePatrol', 'recordWaveKill',
    'medicDutyTick', 'medicDutyCureAttempt', 'villagerCareTick', 'tele',
    'noteDeed', 'creditDeed'].every(function (n) { return Game[n] === orig[n]; });
  ok(restored, 'B38 uninstall restores all wraps');
}

// ---- C. Live miniature: competent, 12 days, seed 190311 ----
async function miniature() {
  const { Game } = await loadGame({ seed: 190311, mode: 'dutyfirst-proof-c', fullTelemetry: false });
  await setupGame(Game);
  const di = DI.install(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally { try { di.snapshot(); } catch (e) {} }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
  di.uninstall();
  ok(result.days > 0, 'C1 miniature ran days', { days: result.days });
  ok(di.t.deposits.length > 0, 'C2 deposits exist', { n: di.t.deposits.length });
  ok(di.t.assignCalls.length > 0, 'C3 staffing calls exist', { n: di.t.assignCalls.length });
  ok(di.t.resolutions.length > 0, 'C4 resolutions exist', { n: di.t.resolutions.length });
  ok(di.t.resolutions.some(function (r) { return r.outcome === 'completed'; }), 'C5 at least one completed resolution');
  ok(di.t.daily.every(function (x) { return x.assignments && x.taskLeads && x.objectives && x.pantryByName && x.cistern && x.throttle; }),
    'C6 every snapshot has assignments + leads + objectives + pantry + ledgers');
  eq(di.t.instrumentErrors.length, 0, 'C7 zero instrument errors in miniature', di.t.instrumentErrors);
  console.log('info  C8 assignCalls=' + di.t.assignCalls.length + ' resolutions=' + di.t.resolutions.length +
    ' resolveCalls=' + di.t.resolveCalls.length + ' hunts=' + di.t.hunts.length +
    ' hurts=' + di.t.hurts.length + ' deposits=' + di.t.deposits.length +
    ' patrols=' + di.t.patrols.length + ' medicTicks=' + di.t.medicTicks.length +
    ' careTicks=' + di.t.careTicks.length + ' deeds=' + di.t.deeds.length +
    ' practiceReps=' + di.t.practiceReps.length);
  ok(true, 'C8 duty counts recorded (informational)');
}

// ---- D. Neutrality miniature: instrument on vs off, 12 days ----
async function neutralityMini() {
  async function mini(seed, on) {
    const { Game } = await loadGame({ seed: seed, mode: 'dutyfirst-proof-d', fullTelemetry: false });
    await setupGame(Game);
    let di = null;
    if (on) di = DI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (di) di.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    if (di) di.uninstall();
    const pantryKcal = ((Game.state || {}).village || {}).pantry || [];
    const pk = pantryKcal.reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    const deaths = ((result && result.samples && result.samples.deaths) || []).length;
    return { days: result.days, pantryKcal: pk, deaths: deaths, errors: di ? di.t.instrumentErrors.length : 0 };
  }
  const on = await mini(190311, true);
  const off = await mini(190311, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths,
    'D1 neutrality miniature identical', { on: on, off: off });
  eq(on.errors, 0, 'D2 miniature instrument errors 0');
}

(async function () {
  try {
    await liveFixtures();
    await miniature();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\ndutyfirst proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
