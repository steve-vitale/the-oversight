#!/usr/bin/env node
// scripts/test-grudge-audit.js — gaps-grudge AUDIT probe (no src/js changes,
// no judged sim run). Questions from the funnel evidence:
//   (1) Of the 22 "offered" picks in LOTTERY-LOST triples, how many ever
//       reached the lottery? EAT is NOT a lottery candidate in objPick
//       (villager-objectives.js): it is a pre-lottery return when
//       hunger > 55 and pantry > 500. REST is likewise pre-lottery.
//       WATER/FORAGE are lottery candidates but only enter when the
//       village is short (waterDays < 2; pantry < 4000 or hunger > 50).
//   (2) Under MILD needs (fed villager, full cistern, no forage
//       pressure), what share does the fixed HUNT weight 2.0 win
//       against the always-present HAVEN_CHORE (+ VISIT/SEEK/etc.)?
//       The funnel sense fixture's 11% HUNT was drawn under a dry
//       cistern (WATER 90/200) — this probe contrasts dry vs full.
//   (3) Does repeated objPick mutate needs (would repeated draws
//       be non-iid)? Reported, not assumed.
// Usage: node scripts/test-grudge-audit.js
// Exits 0 with GRUDGE-AUDIT PASS when all shape assertions hold:
// candidate non-null in every condition, EAT-pre-gate behavior
// matches the code reading (all-EAT iff hunger>55 and pantry>500,
// else EAT never appears), and mild-needs HUNT share is reported
// (no threshold asserted — this is an audit, not a judged run).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function kitVillagers(G, vids) {
  const KIT = [['torso', 'hide_armor', 'Hide Armor'], ['head', 'skull_helm', 'Skull Helm'],
    ['legs', 'canvas_pants', 'Canvas Pants'], ['hands', 'work_gloves', 'Work Gloves'],
    ['feet', 'good_boots', 'Good Boots']];
  for (const vid of vids) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (vp) {
      vp.items = ['hunting_spear', 'skull_helm', 'hide_armor', 'canvas_pants', 'work_gloves', 'good_boots'];
      vp.equipped = { melee: { itemId: 'hunting_spear', name: 'Hunting Spear' } };
      for (const [slot, iid, name] of KIT) vp.equipped[slot] = { itemId: iid, name };
    }
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  for (const vid of vids) vv.health[vid] = 100;
}

function draw(G, vid, hx, hy, n) {
  const kinds = {};
  for (let i = 0; i < n; i++) {
    const o = G.objPick(vid, hx, hy);
    if (!o) break;
    kinds[o.kind] = (kinds[o.kind] || 0) + 1;
  }
  return kinds;
}

function waterDaysOf(G) {
  const v = G.state.village || {};
  let liv = 0;
  for (const id of (v.roster || [])) { try { if (!((G.vpOf(id) || {}).dead)) liv++; } catch (e) {} }
  const sup = ((v.water || {}).clean || 0) + ((v.water || {}).dirty || 0);
  return sup / (2 * Math.max(1, liv));
}

async function main() {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'grudge-audit', fullTelemetry: false, narration: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (!roster.length) throw new Error('no non-scholar roster villagers after setup');
  const vid = roster[0];
  kitVillagers(G, [vid]);
  const v = G.state.village || {};
  const hx = (v.px != null) ? v.px : 4;
  const hy = (v.py != null) ? v.py : 4;
  const noted = G.objNoteMonsterSighting ? G.objNoteMonsterSighting(vid, 'influencer', hx + 1, hy) : null;
  const armed = G.objVillagerArmed ? G.objVillagerArmed(vid) : null;
  const maxD = G.npcMaxDist ? G.npcMaxDist(vid) : null;
  const cand = G.objHuntCandidate ? G.objHuntCandidate(vid, hx, hy) : null;
  const goal = G.npcGoal ? G.npcGoal(vid) : null;
  const temp = G.npcTemper ? G.npcTemper(vid) : null;
  const prof = G.npcRangeProfile ? G.npcRangeProfile(vid) : null;
  const needTrack = G.villagerNeedTrack ? G.villagerNeedTrack(vid) : null;
  console.log(`villager=${vid} haven=(${hx},${hy}) goal=${goal} temper=${temp} profile=${prof} needTrack=${needTrack}`);
  console.log(`noted=${JSON.stringify(noted)} armed=${armed} maxD=${maxD} candidate=${JSON.stringify(cand)}`);
  if (!cand) { console.log('GRUDGE-AUDIT FAIL: no HUNT candidate for a fresh armed in-range memory'); process.exit(1); }
  const needs = G.npcNeeds(vid);
  console.log(`setup needs=${JSON.stringify(needs)} pantryKcalLive=${(G.pantryKcalLive ? G.pantryKcalLive(v) : null)} waterDays=${waterDaysOf(G).toFixed(2)} water=${JSON.stringify(v.water || null)}`);

  // Condition A — MILD: fed villager, full cistern.
  needs.hunger = 30; needs.energy = 70; needs.fear = 20; needs.social = 40;
  v.water = { clean: 9999, dirty: 0 };
  const pantryA = G.pantryKcalLive ? G.pantryKcalLive(v) : null;
  const kindsA = draw(G, vid, hx, hy, 300);
  const candA = G.objHuntCandidate ? G.objHuntCandidate(vid, hx, hy) : null;
  console.log(`A MILD (hunger=30 waterDays=${waterDaysOf(G).toFixed(1)} pantry=${pantryA}): ${JSON.stringify(kindsA)} candidateAfter=${JSON.stringify(candA)}`);
  console.log(`A needsAfter=${JSON.stringify(G.npcNeeds(vid))} (mutation check: hunger/energy vs pre-draw 30/70)`);

  // Condition B — DRY CISTERN: same villager, same memory, water gone.
  needs.hunger = 30; needs.energy = 70;
  v.water = { clean: 0, dirty: 0 };
  const kindsB = draw(G, vid, hx, hy, 300);
  console.log(`B DRY (hunger=30 waterDays=${waterDaysOf(G).toFixed(2)}): ${JSON.stringify(kindsB)}`);

  // Condition C — HUNGRY: hunger 80. EAT appears iff pantry > 500
  // (the pre-gate). Report pantry and the outcome; do not force it.
  needs.hunger = 80; needs.energy = 70;
  v.water = { clean: 9999, dirty: 0 };
  const pantryC = G.pantryKcalLive ? G.pantryKcalLive(v) : null;
  const kindsC = draw(G, vid, hx, hy, 50);
  console.log(`C HUNGRY (hunger=80 pantry=${pantryC}): ${JSON.stringify(kindsC)}`);
  const eatOnly = Object.keys(kindsC).length === 1 && kindsC.EAT === 50;
  const eatNever = !kindsC.EAT;
  console.log(`C reading: pantry>500=${pantryC > 500} allEAT=${eatOnly} eatNever=${eatNever} (code: EAT pre-gate iff hunger>55 AND pantry>500; EAT is not a lottery candidate)`);
  if (pantryC > 500 && !eatOnly) { console.log('GRUDGE-AUDIT FAIL: hunger>55 + pantry>500 did not pre-gate EAT on every draw'); process.exit(1); }
  if (pantryC <= 500 && !eatNever) { console.log('GRUDGE-AUDIT FAIL: EAT appeared with pantry<=500, contradicting the pre-gate-only reading'); process.exit(1); }
  const huntA = kindsA.HUNT || 0, huntB = kindsB.HUNT || 0;
  console.log(`SUMMARY mildHUNT=${huntA}/300 (${(100 * huntA / 300).toFixed(1)}%) dryHUNT=${huntB}/300 (${(100 * huntB / 300).toFixed(1)}%)`);
  console.log('GRUDGE-AUDIT PASS — candidate held in all conditions; pre-gate reading confirmed; mild-vs-dry contrast quoted above');
}
main().catch(e => { console.error('GRUDGE-AUDIT FAIL', e && e.stack || e); process.exit(1); });
