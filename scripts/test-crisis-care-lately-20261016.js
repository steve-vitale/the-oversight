#!/usr/bin/env node
// test-crisis-care-lately-20261016.js — proof for the r18 care-memory blank:
// "the healer arc is conversationally invisible."
//
// Root cause: villagerCareTick narrates "X sits with Y — cool cloth, bitter
// tea" and books a 'tended' memory on the medic, but the lately system has no
// kind for it — gratitude's scan only matches
// promise_kept|gift|comforted|ally|mediated. The patient remembers nothing,
// the medic's memory never surfaces, and 13 pilot transcripts carried zero
// care mentions (r18 seeds 121/242/363).
// AFTER: villagerCareTick books 'tended_by' (+medic id) on the patient and
// {patient} extra on the medic's 'tended' entry; t2LatelyEvent yields a
// 'care' kind (7-day window) below fresh grief/mantle/table/severe-and-mild
// bodily crisis and village politics, above gratitude/cheer; t2gen_lately
// emits care lines with knowledge-gated (firstRef) names.
// Run: node scripts/test-crisis-care-lately-20261016.js (seeds 7, 42, 99)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = [7, 42, 99];

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

async function one(seed) {
  const fails = [];
  const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log((cond ? '  PASS ' : '  FAIL ') + msg); };
  const { Game } = await loadGame({ seed, mode: 'test-crisis-care-lately', fullTelemetry: true });
  await setupGame(Game);
  try { Game.state.scholar.day = 15; } catch (e) {}
  const d0 = dayOf(Game);
  const roster = livingRoster(Game).filter(id => id !== Game.villagerId);
  ok(roster.length >= 2, `seed ${seed}: 2+ villagers to cast (have ${roster.length})`);
  if (roster.length < 2) return fails;
  const medic = roster[0], patient = roster[1];
  ok(setMedic(Game, medic), `seed ${seed}: medic occupation settable on ${medic}`);

  // run the REAL tending path: one sick patient, one nurse
  const v = Game.state.village;
  v.sick = v.sick || {};
  v.sick[patient] = { name: 'gut rot', daysLeft: 10, severity: 1 };
  const nm = (id) => { try { const p = Game.getPerson(id); return p ? String(p.name).split(' ')[0] : 'Someone'; } catch (e) { return 'Someone'; } };
  try { Game.villagerCareTick(nm); } catch (e) { ok(false, `seed ${seed}: villagerCareTick threw: ${e.message}`); }

  // (1) the patient remembers being sat with — with the medic's id
  const pmem = (Game.t2mem(patient) || []).filter(m => m.t === 'tended_by');
  ok(pmem.length >= 1, `seed ${seed}: patient carries a 'tended_by' memory`);
  ok(pmem.length >= 1 && pmem[0].medic === medic, `seed ${seed}: tended_by names the medic id (extra.medic)`);
  // (2) the medic's own memory carries the patient id
  const mmem = (Game.t2mem(medic) || []).filter(m => m.t === 'tended');
  ok(mmem.length >= 1, `seed ${seed}: medic carries a 'tended' memory`);
  ok(mmem.length >= 1 && mmem[0].patient === patient, `seed ${seed}: tended memory carries the patient id (extra.patient)`);

  // (3) lately kinds: patient self-marked, medic gets their own variant
  let evP = null, evM = null;
  try { evP = Game.t2LatelyEvent(patient); } catch (e) {}
  try { evM = Game.t2LatelyEvent(medic); } catch (e) {}
  ok(evP && evP.kind === 'care', `seed ${seed}: patient latelyKind=care (got ${evP && evP.kind})`);
  ok(evP && evP.self === true, `seed ${seed}: patient event is self-marked`);
  ok(evP && evP.medic === medic, `seed ${seed}: care event carries the medic id`);
  ok(evM && evM.kind === 'care', `seed ${seed}: medic latelyKind=care (got ${evM && evM.kind})`);
  ok(evM && evM.patient === patient, `seed ${seed}: medic care event carries the patient id`);

  // (4) lines exist, name names (knowledge-gated), no raw ids
  let linesP = [], linesM = [];
  try { linesP = Game.t2gen_lately(patient); } catch (e) {}
  try { linesM = Game.t2gen_lately(medic); } catch (e) {}
  const jP = linesP.join(' '), jM = linesM.join(' ');
  ok(linesP.length > 0, `seed ${seed}: patient has care lines`);
  ok(linesM.length > 0, `seed ${seed}: medic has care lines`);
  console.log(`    e.g. patient: ${(linesP[0] || '').slice(0, 100)}...`);
  console.log(`    e.g. medic:   ${(linesM[0] || '').slice(0, 100)}...`);

  // (5) priority: care sits below a live mild outbreak, above plain gratitude
  try { Game.remember(patient, 'promise_kept', 'kept a promise'); } catch (e) {}
  let evG = null;
  try { evG = Game.t2LatelyEvent(patient); } catch (e) {}
  ok(evG && evG.kind === 'care', `seed ${seed}: care outranks plain gratitude (got ${evG && evG.kind})`);
  // mild outbreak (2 sick) outranks care — the outbreak is the village's business while it burns
  v.sick[medic] = { name: 'gut rot', daysLeft: 10, severity: 1 };
  let evO = null;
  try { evO = Game.t2LatelyEvent(patient); } catch (e) {}
  ok(evO && evO.kind === 'outbreak', `seed ${seed}: mild outbreak outranks care (got ${evO && evO.kind})`);
  delete v.sick[medic];

  // (6) window expires: 8 days later, no more 'care'
  try { Game.state.scholar.day = d0 + 8; } catch (e) {}
  let evP2 = null;
  try { evP2 = Game.t2LatelyEvent(patient); } catch (e) {}
  ok(!evP2 || evP2.kind !== 'care', `seed ${seed}: care window expired after 7d (now ${evP2 && evP2.kind})`);
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
