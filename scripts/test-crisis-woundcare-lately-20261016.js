#!/usr/bin/env node
// test-crisis-woundcare-lately-20261016.js — proof for the r19 wound-care blank:
// "combat-wound tending is conversationally invisible."
//
// Root cause: healerRounds() (the camp healer binding up the most-hurt
// villager, +15 HP, narrated daily) books NO memory — the r18 care-memory
// fix covered only disease tending (villagerCareTick). Across the r19 pilot
// (seeds 1717/1828/1939) healerRounds fired 75 times; zero 'tended' memories
// existed and zero end-state transcripts mentioned wound-tending.
// AFTER: healerRounds books 'tended_by' (+medic id, wound:true) on the
// patient and 'tended' (+patient id, wound:true) on the healer; the existing
// 'care' lately kind carries the wound flag through and t2gen_lately renders
// wound-appropriate lines (bound up / cut — never fever lines).
// Run: node scripts/test-crisis-woundcare-lately-20261016.js (seeds 7, 42, 99)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = [7, 42, 99];
const CARE_ABILITIES = ['triage', 'field_medicine', 'herbal_remedy'];

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } });
}
function setMedic(Game, vid) {
  const d = (Game.data.villagers || []).find(x => x.id === vid)
    || (Game.data.background_survivors || []).find(x => x.id === vid);
  if (d) d.formerOccupation = 'nurse';
  return !!d;
}
// the scholar may hold a care ability (then THEY are the camp healer). For the
// villager-healer block we shim hasAbility for the three care ids only —
// test-side, engine untouched.
function stripScholarCare(Game) {
  const _ha = Game.hasAbility.bind(Game);
  Game.__origHasAbility = _ha;
  Game.hasAbility = function (id) {
    if (CARE_ABILITIES.includes(id)) return null;
    return _ha(id);
  };
}
function restoreScholarCare(Game) {
  if (Game.__origHasAbility) Game.hasAbility = Game.__origHasAbility;
}

async function one(seed) {
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? '  PASS ' : '  FAIL ') + msg); };
  const { Game } = await loadGame({ seed, mode: 'test-crisis-woundcare-lately', fullTelemetry: true });
  await setupGame(Game);
  try { Game.state.scholar.day = 15; } catch (e) {}
  const d0 = dayOf(Game);
  const roster = livingRoster(Game).filter(id => id !== Game.villagerId);
  ok(roster.length >= 3, `seed ${seed}: 3+ villagers to cast (have ${roster.length})`);
  if (roster.length < 3) return fails;
  const medic = roster[0], patient = roster[1], patient2 = roster[2];
  ok(setMedic(Game, medic), `seed ${seed}: medic occupation settable on ${medic}`);
  stripScholarCare(Game);

  // ---- BLOCK A: villager healer ----
  try { Game.hurtVillager(patient, 40, 'monster'); } catch (e) { ok(false, `seed ${seed}: hurtVillager threw: ${e.message}`); }
  const hp = ((Game.state.village || {}).health || {})[patient];
  ok(hp !== undefined && hp < 70, `seed ${seed}: patient wounded below the rounds threshold (hp=${hp})`);
  let treated = null;
  try { treated = Game.healerRounds(); } catch (e) { ok(false, `seed ${seed}: healerRounds threw: ${e.message}`); }
  ok(treated === patient, `seed ${seed}: healerRounds treated the wounded patient (got ${treated})`);

  // (1) the patient remembers being bound up — medic id + wound flag
  const pmem = (Game.t2mem(patient) || []).filter(m => m.t === 'tended_by' && m.wound);
  ok(pmem.length >= 1, `seed ${seed}: patient carries a wound 'tended_by' memory`);
  ok(pmem.length >= 1 && pmem[0].medic === medic, `seed ${seed}: wound tended_by names the medic id (extra.medic)`);
  // (2) the healer's own memory carries the patient id + wound flag
  const mmem = (Game.t2mem(medic) || []).filter(m => m.t === 'tended' && m.wound);
  ok(mmem.length >= 1, `seed ${seed}: healer carries a wound 'tended' memory`);
  ok(mmem.length >= 1 && mmem[0].patient === patient, `seed ${seed}: wound tended memory carries the patient id (extra.patient)`);

  // (3) lately kinds: patient self-marked with wound, healer gets their variant
  let evP = null, evM = null;
  try { evP = Game.t2LatelyEvent(patient); } catch (e) {}
  try { evM = Game.t2LatelyEvent(medic); } catch (e) {}
  ok(evP && evP.kind === 'care' && evP.wound === true, `seed ${seed}: patient latelyKind=care+wound (got ${evP && evP.kind}, wound=${evP && evP.wound})`);
  ok(evP && evP.self === true, `seed ${seed}: patient event is self-marked`);
  ok(evP && evP.medic === medic, `seed ${seed}: wound care event carries the medic id`);
  ok(evM && evM.kind === 'care' && evM.wound === true, `seed ${seed}: healer latelyKind=care+wound (got ${evM && evM.kind}, wound=${evM && evM.wound})`);
  ok(evM && evM.patient === patient, `seed ${seed}: healer care event carries the patient id`);

  // (4) wound lines render — bound up / cut, never fever language
  let linesP = [], linesM = [];
  try { linesP = Game.t2gen_lately(patient); } catch (e) {}
  try { linesM = Game.t2gen_lately(medic); } catch (e) {}
  const jP = linesP.join(' '), jM = linesM.join(' ');
  ok(linesP.length > 0, `seed ${seed}: patient has wound-care lines`);
  ok(linesM.length > 0, `seed ${seed}: healer has wound-care lines`);
  ok(/bound up|cut|wrapped|stitched|bleed/i.test(jP), `seed ${seed}: patient lines are wound-flavored (not fever)`);
  ok(/bound up|cut|wrapped|stitched|bleed/i.test(jM), `seed ${seed}: healer lines are wound-flavored (not fever)`);
  ok(!/fever|burning up|cool cloth/i.test(jP), `seed ${seed}: patient lines carry no fever language`);
  ok(!/fever|burning up|cool cloth/i.test(jM), `seed ${seed}: healer lines carry no fever language`);
  console.log(`    e.g. patient: ${(linesP[0] || '').slice(0, 110)}...`);
  console.log(`    e.g. healer:  ${(linesM[0] || '').slice(0, 110)}...`);

  // (5) priority: wound-care below a live mild outbreak (2 sick), above plain gratitude
  try { Game.remember(patient, 'promise_kept', 'kept a promise'); } catch (e) {}
  let evG = null;
  try { evG = Game.t2LatelyEvent(patient); } catch (e) {}
  ok(evG && evG.kind === 'care', `seed ${seed}: wound-care outranks plain gratitude (got ${evG && evG.kind})`);
  const v = Game.state.village;
  v.sick = v.sick || {};
  v.sick[patient] = { name: 'gut rot', daysLeft: 10, severity: 1 };
  v.sick[medic] = { name: 'gut rot', daysLeft: 10, severity: 1 };
  let evO = null;
  try { evO = Game.t2LatelyEvent(patient); } catch (e) {}
  ok(evO && evO.kind === 'outbreak', `seed ${seed}: mild outbreak (2 sick) outranks wound-care (got ${evO && evO.kind})`);
  delete v.sick[patient]; delete v.sick[medic];

  // (6) window expires: 8 days later, no more 'care'
  try { Game.state.scholar.day = d0 + 8; } catch (e) {}
  let evP2 = null;
  try { evP2 = Game.t2LatelyEvent(patient); } catch (e) {}
  ok(!evP2 || evP2.kind !== 'care', `seed ${seed}: wound-care window expired after 7d (now ${evP2 && evP2.kind})`);

  // ---- BLOCK B: the scholar as healer ('You' branch) ----
  // restore real hasAbility, grant triage outright, wound a fresh patient, next day
  restoreScholarCare(Game);
  try { Game.state.scholar.day = d0 + 9; } catch (e) {}
  const sch = Game.state.scholar;
  sch.abilities = sch.abilities || [];
  if (!sch.abilities.find(a => ((a && a.id) || a) === 'triage')) sch.abilities.push({ id: 'triage' });
  try { Game.hurtVillager(patient2, 40, 'monster'); } catch (e) {}
  let treated2 = null;
  try { treated2 = Game.healerRounds(); } catch (e) { ok(false, `seed ${seed}: player-healer healerRounds threw: ${e.message}`); }
  ok(treated2 === patient2, `seed ${seed}: player-healer rounds treated the patient (got ${treated2})`);
  const pmem2 = (Game.t2mem(patient2) || []).filter(m => m.t === 'tended_by' && m.wound);
  ok(pmem2.length >= 1 && pmem2[0].medic === Game.villagerId, `seed ${seed}: player-healer patient memory names the scholar id`);
  return fails;
}

(async () => {
  let fails = [];
  for (const s of SEEDS) {
    console.log(`-- seed ${s} --`);
    fails = fails.concat(await one(s));
  }
  if (fails.length) { console.error(`\n${fails.length} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
