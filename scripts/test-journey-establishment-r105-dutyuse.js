#!/usr/bin/env node
// scripts/test-journey-establishment-r105-dutyuse.js — journey-establishment r105
// PROOF for the duty-use instrument the r105 driver reads (no src/js change):
//  P1 field_dressing WORKS for villagers: same seed, same villager — a hunt
//     kill's kcal rises by the 0.78/0.60 frac ratio (1.2–1.4) once the hunter
//     holds field_dressing.
//  P2a preserve_food is INERT for villagers: specialistSkill('preserver')
//     reads occupation + foodXp only — recording preserve_food in npcSkills
//     leaves it unchanged (0 for a non-preserver occupation).
//  P2b care is OCCUPATION-gated, triage extends reach: a non-medical
//     villager holding herbal_remedy tends NOBODY (tends identical with /
//     without the grant); a medical-occupation medic holding triage tends
//     TWO patients in one tick vs ONE without.
//  P3 diplomat is INERT for villagers: granting it to an NPC leaves the
//     player's abilityLevel('diplomat') at 0, and an identical 1-exchange
//     convo with that NPC moves trust / player state identically with and
//     without the grant.
//  P4 wrap-read purity: every read the r105 driver wraps use (npcHasAbility,
//     npcOwnedIds, specialistSkill, campHealerId/Name, raw scholar.statuses,
//     villagePeople, raw npcSkills/npcAbilities/npcXp) changes no state.
//     (sickDiseases() is NOT pure — seList() lazy-inits scholar.statuses —
//     so the driver reads raw statuses instead; the test asserts that too.)
// Cases run on load seeds 7, 42, 99 (+ 1..5 as needed for a medic / a kill).
// Each case loads a fresh game. The r105 driver itself is exercised by the
// pilot seed.
// Usage: node scripts/test-journey-establishment-r105-dutyuse.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const LOAD_SEEDS = [7, 42, 99, 1, 2, 3, 4, 5];
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;

function livingRoster(G) {
  return ((G.state.village || {}).roster || []).filter(id => {
    if (!id || String(id) === String(G.villagerId)) return false;
    try { return !((G.getPerson(id) || {}).dead); } catch (e) { return false; }
  });
}
function snapVillageScholar(G) {
  return JSON.stringify({ village: G.state.village || {}, scholar: G.state.scholar || {} });
}
function nmFn(G) {
  return (id) => { try { return G.displayName(id); } catch (e) { return String(id); } };
}

async function main() {
  let failures = 0;
  const check = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) failures++;
  };

  // ---- P1: hunt frac (field_dressing) ----
  let p1done = false;
  for (const seed of LOAD_SEEDS) {
    if (p1done) break;
    const { Game: A } = await loadGame({ seed, mode: 'establishment-r105-p1a' });
    await setupGame(A);
    const rosterA = livingRoster(A);
    if (!rosterA.length) continue;
    const vid = rosterA[0];
    let rA = null;
    try { rA = A.villagerHuntResolve(vid, 1.0); } catch (e) { check(`seed${seed} P1 baseline hunt runs`, false, e.message); continue; }
    if (!rA || !(rA.kcal > 0)) continue; // stalk fail / no prey: try next seed
    const { Game: B } = await loadGame({ seed, mode: 'establishment-r105-p1b' });
    await setupGame(B);
    const okGrant = B.npcGrantAbility(vid, 'field_dressing');
    check(`seed${seed} P1 grant field_dressing accepted`, okGrant === true, `returned ${okGrant}`);
    check(`seed${seed} P1 holder reads field_dressing`, !!(B.npcHasAbility && B.npcHasAbility(vid, 'field_dressing')),
      `npcHasAbility=${B.npcHasAbility && B.npcHasAbility(vid, 'field_dressing')}`);
    let rB = null;
    try { rB = B.villagerHuntResolve(vid, 1.0); } catch (e) { check(`seed${seed} P1 granted hunt runs`, false, e.message); continue; }
    check(`seed${seed} P1 same animal picked (stream unshifted)`, rB && rB.aid === rA.aid,
      `aidA=${rA.aid} aidB=${rB && rB.aid}`);
    if (!rB || rB.aid !== rA.aid) continue;
    const ratio = rB.kcal / rA.kcal;
    check(`seed${seed} P1 holder kill pays 0.78/0.60 more`, rB.kcal > rA.kcal && ratio >= 1.2 && ratio <= 1.4,
      `kcalA=${rA.kcal} kcalB=${rB.kcal} ratio=${ratio.toFixed(3)}`);
    p1done = true;
  }
  check('P1 found a killing seed', p1done, 'no seed in 7,42,99,1..5 produced a baseline kill on roster[0]');

  // ---- P2a: specialistSkill ignores learned preserve_food ----
  let p2adone = false;
  for (const seed of [7, 42, 99]) {
    if (p2adone) break;
    const { Game: G } = await loadGame({ seed, mode: 'establishment-r105-p2a' });
    await setupGame(G);
    const roster = livingRoster(G);
    const cand = roster.find(id => {
      try {
        const p = G.getPerson(id) || {};
        const occ = String(p.formerOccupation || '').toLowerCase();
        return !/cook|chef|baker|butcher|fisherman|farmer|smoker|homesteader/i.test(occ);
      } catch (e) { return false; }
    });
    if (!cand) continue;
    let person = null;
    try { const vp = (typeof G.villagePeople === 'function') ? G.villagePeople() : []; person = vp.find(x => String(x.id) === String(cand)) || G.getPerson(cand); } catch (e) { person = G.getPerson(cand); }
    const specBefore = (typeof G.specialistSkill === 'function') ? G.specialistSkill(person, 'preserver') : null;
    check(`seed${seed} P2a specialistSkill exists`, specBefore !== null, 'specialistSkill missing');
    if (specBefore === null) continue;
    // Record the skill the way the game records learned skills.
    const v = G.state.village || {};
    v.npcSkills = v.npcSkills || {};
    const list = (v.npcSkills[cand] || []).slice();
    if (!list.includes('preserve_food')) list.push('preserve_food');
    v.npcSkills[cand] = list;
    let knows = null;
    try { knows = G.npcKnowsSkill ? !!G.npcKnowsSkill(cand, 'preserve_food') : null; } catch (e) {}
    check(`seed${seed} P2a skill is visible via npcKnowsSkill`, knows === true, `npcKnowsSkill=${knows}`);
    const specAfter = G.specialistSkill(person, 'preserver');
    check(`seed${seed} P2a specialistSkill unchanged by learned preserve_food`, specAfter === specBefore,
      `before=${specBefore} after=${specAfter}`);
    p2adone = true;
  }
  check('P2a found a non-preserver villager', p2adone, 'no candidate on seeds 7,42,99');

  // ---- P2b: careTick occupation gate + triage reach ----
  let p2bdone = false;
  for (const seed of LOAD_SEEDS) {
    if (p2bdone) break;
    const setup = async () => {
      const { Game: G } = await loadGame({ seed, mode: 'establishment-r105-p2b' });
      await setupGame(G);
      return G;
    };
    const G0 = await setup();
    const roster = livingRoster(G0);
    const medic = roster.find(id => { try { return MED_OCC.test(String((G0.getPerson(id) || {}).formerOccupation || '')); } catch (e) { return false; } });
    const nonMedic = roster.find(id => { try { return !MED_OCC.test(String((G0.getPerson(id) || {}).formerOccupation || '')); } catch (e) { return false; } });
    const targets = roster.filter(id => String(id) !== String(medic) && String(id) !== String(nonMedic)).slice(0, 3);
    if (!medic || !nonMedic || targets.length < 2) continue;
    const sicken = (G) => {
      const v = G.state.village || {};
      v.sick = v.sick || {};
      for (const t of targets) v.sick[t] = { name: 'test fever', daysLeft: 3, severity: 1 };
    };
    const tendsOf = (G) => {
      sicken(G);
      const before = {};
      for (const t of targets) before[t] = ((G.state.village.sick || {})[t] || {}).daysLeft;
      G.villagerCareTick(nmFn(G));
      let tends = 0;
      for (const t of targets) {
        const a = ((G.state.village.sick || {})[t] || {}).daysLeft;
        if (a < before[t]) tends += (before[t] - a);
      }
      return tends;
    };
    // Baseline: medic only, reach 1.
    const tBase = tendsOf(G0);
    check(`seed${seed} P2b baseline medic tends exactly 1`, tBase === 1, `tends=${tBase}`);
    // Triage: medic holds triage -> reach 2.
    const G1 = await setup();
    const okTri = G1.npcGrantAbility(medic, 'triage');
    check(`seed${seed} P2b grant triage accepted`, okTri === true, `returned ${okTri}`);
    check(`seed${seed} P2b medic reads triage`, !!(G1.npcHasAbility && G1.npcHasAbility(medic, 'triage')),
      `npcHasAbility=${G1.npcHasAbility && G1.npcHasAbility(medic, 'triage')}`);
    const tTri = tendsOf(G1);
    check(`seed${seed} P2b triage medic tends 2`, tTri === 2, `tends=${tTri}`);
    // Herbal: non-medic holds herbal_remedy -> still 1 (adds nothing).
    const G2 = await setup();
    const okHerb = G2.npcGrantAbility(nonMedic, 'herbal_remedy');
    check(`seed${seed} P2b grant herbal_remedy accepted`, okHerb === true, `returned ${okHerb}`);
    check(`seed${seed} P2b non-medic reads herbal_remedy`, !!(G2.npcHasAbility && G2.npcHasAbility(nonMedic, 'herbal_remedy')),
      `npcHasAbility=${G2.npcHasAbility && G2.npcHasAbility(nonMedic, 'herbal_remedy')}`);
    const tHerb = tendsOf(G2);
    check(`seed${seed} P2b herbal-holding non-medic adds no tend`, tHerb === 1, `tends=${tHerb} (baseline ${tBase})`);
    check(`seed${seed} P2b non-medic is not a medic by occupation`,
      !MED_OCC.test(String(((G2.getPerson(nonMedic) || {}).formerOccupation) || '')),
      `occ=${(G2.getPerson(nonMedic) || {}).formerOccupation}`);
    p2bdone = true;
  }
  check('P2b found a seed with a medic + non-medic + 2 targets', p2bdone, 'no suitable seed in 7,42,99,1..5');

  // ---- P3: diplomat inert for villagers ----
  let p3done = false;
  for (const seed of [7, 42, 99]) {
    if (p3done) break;
    const runConvo = async (grant) => {
      const { Game: G } = await loadGame({ seed, mode: 'establishment-r105-p3' });
      await setupGame(G);
      const roster = livingRoster(G);
      for (const npc of roster.slice(0, 3)) {
        try {
          if (grant) {
            const ok = G.npcGrantAbility(npc, 'diplomat');
            if (ok !== true) return { error: 'grant rejected' };
          }
          const trustBefore = ((G.state.village.trust || {})[npc] === undefined ? 10 : G.state.village.trust[npc]);
          const dipLvlBefore = (typeof G.abilityLevel === 'function') ? G.abilityLevel('diplomat') : null;
          let r = G.startConvo(npc);
          const choices = (r.choices || []).filter(ch => ch.id !== 'leave' && ch.id !== 'bye');
          if (!choices.length) continue;
          r = G.convoTurn(npc, choices[0].id);
          try { G.endConvo(npc, 'done'); } catch (e) {}
          const trustAfter = ((G.state.village.trust || {})[npc] === undefined ? 10 : G.state.village.trust[npc]);
          const dipLvlAfter = (typeof G.abilityLevel === 'function') ? G.abilityLevel('diplomat') : null;
          return { npc, trustBefore, trustAfter, dipLvlBefore, dipLvlAfter,
            npcHolds: grant ? !!(G.npcHasAbility && G.npcHasAbility(npc, 'diplomat')) : false,
            scholar: JSON.stringify(G.state.scholar || {}) };
        } catch (e) { continue; }
      }
      return { error: 'no convo ran' };
    };
    const base = await runConvo(false);
    if (base.error) continue;
    const granted = await runConvo(true);
    if (granted.error) { check(`seed${seed} P3 granted convo runs`, false, granted.error); continue; }
    check(`seed${seed} P3 same NPC conversed`, String(granted.npc) === String(base.npc), `base=${base.npc} granted=${granted.npc}`);
    check(`seed${seed} P3 NPC holds diplomat after grant`, granted.npcHolds === true, `npcHasAbility=${granted.npcHolds}`);
    check(`seed${seed} P3 player diplomat level stays 0`, granted.dipLvlAfter === 0 && base.dipLvlAfter === 0,
      `base=${base.dipLvlAfter} granted=${granted.dipLvlAfter}`);
    check(`seed${seed} P3 trust moves identically with/without the grant`,
      granted.trustAfter === base.trustAfter && granted.trustBefore === base.trustBefore,
      `trust base ${base.trustBefore}->${base.trustAfter}, granted ${granted.trustBefore}->${granted.trustAfter}`);
    check(`seed${seed} P3 player scholar state identical with/without the grant`,
      granted.scholar === base.scholar, 'scholar JSON differs');
    p3done = true;
  }
  check('P3 found a seed with a working convo', p3done, 'no convo ran on seeds 7,42,99');

  // ---- P4: wrap-read purity ----
  for (const seed of [7, 42, 99]) {
    const { Game: G } = await loadGame({ seed, mode: 'establishment-r105-p4' });
    await setupGame(G);
    const before = snapVillageScholar(G);
    const roster = livingRoster(G);
    for (const id of roster) {
      try { G.npcHasAbility && G.npcHasAbility(id, 'field_dressing'); } catch (e) {}
      try { G.npcHasAbility && G.npcHasAbility(id, 'triage'); } catch (e) {}
      try { G.npcHasAbility && G.npcHasAbility(id, 'herbal_remedy'); } catch (e) {}
      try { G.npcHasAbility && G.npcHasAbility(id, 'diplomat'); } catch (e) {}
      try { G.npcOwnedIds && G.npcOwnedIds(id); } catch (e) {}
      try { ((G.state.village.npcAbilities || {})[id] || []).slice(); } catch (e) {}
      try { ((G.state.village.npcSkills || {})[id] || []).slice(); } catch (e) {}
      try { JSON.parse(JSON.stringify((G.state.village.npcXp || {})[id] || null)); } catch (e) {}
      try { if (typeof G.specialistSkill === 'function') { const p = G.getPerson(id); if (p) G.specialistSkill(p, 'preserver'); } } catch (e) {}
    }
    try { G.campHealerId && G.campHealerId('here'); } catch (e) {}
    try { G.campHealerId && G.campHealerId('haven'); } catch (e) {}
    try { G.campHealerName && G.campHealerName(); } catch (e) {}
    // NOTE: sickDiseases() is NOT a pure read — it calls seList(), which
    // lazy-inits scholar.statuses. The driver reads raw statuses instead.
    try { JSON.stringify((G.state.scholar || {}).statuses || []); } catch (e) {}
    try { G.villagePeople && G.villagePeople(); } catch (e) {}
    check(`seed${seed} P4 wrap reads change no state`, snapVillageScholar(G) === before, 'village/scholar state changed by reads');
  }

  console.log(failures === 0 ? 'ALL-PASS' : `FAILURES=${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('PROOF-FAIL', e && e.stack || e); process.exit(1); });
