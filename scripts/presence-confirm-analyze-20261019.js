#!/usr/bin/env node
// presence-confirm-analyze-20261019.js — sim-presence CONFIRM analysis.
//
// Reads evidence/2026-10-19/perseed-presence-confirm/ per-seed JSONs and
// judges the pre-registered CONFIRM PRIMARY (outcome):
//   living-veterans at end of run (waveCombatReadiness(4).veterans — living
//   roster members with a wave-3+ kill in state.waveKillLog, the engine's
//   own VETERANS bar, design call #4), summed over the 32-run corpus per
//   arm, paired on identical seeds x policies.
//   presence total >= control total + 4 (32 runs; +2 per 16) -> GO.
//
// GUARDRAILS (all must hold): median survival >= control-5d; no new death
// modes (esp. ZERO fighter-movement deaths — the mechanism never
// assigns/moves/risks villagers; proof A9 in test-presence.js); villager-
// combat death share reported; national/table not degraded.
//
// The judge predicates are require-able so scripts/test-presence-confirm.js
// proves the SAME logic the verdict rests on.
//
// Usage: node scripts/presence-confirm-analyze-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-19', 'perseed-presence-confirm');

const CORPUS_RUNS = 32;          // 16 seeds x 2 policies
const VET_BAR_PER16 = 2;         // pre-registered: +2 veterans per 16 runs
const VET_BAR = VET_BAR_PER16 * (CORPUS_RUNS / 16); // = 4 on this corpus
const SURV_BAR_DAYS = 5;         // median survival >= control - 5d
const REACH_NOISE_BAND = 2;      // national/table "not degraded" allows noise

function load(arm) {
  const files = fs.readdirSync(EVID).filter(f => f.startsWith(arm + '-') && f.endsWith('.json') && !f.startsWith('_'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}

const sum = (runs, f) => runs.reduce((a, r) => a + (f(r) || 0), 0);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

// --- judge predicates (pure; also exercised by test-presence-confirm.js) ---
function judgePrimary(controlVets, presenceVets) {
  return presenceVets >= controlVets + VET_BAR;
}
function judgeSurvival(controlMed, presenceMed) {
  return presenceMed >= controlMed - SURV_BAR_DAYS;
}
function newDeathModes(controlModes, presenceModes) {
  // controlModes/presenceModes: {cause: count}. Returns presence-only causes.
  // NOTE (pilot metric review): naive string matching flags INSTANCES
  // (monster names, "alien", "the expedition" vs "expedition"), not modes.
  // The verdict layer judges CATEGORIES; this helper lists raw strings.
  return Object.keys(presenceModes).filter(k => !(k in controlModes));
}
function judgeReach(controlN, presenceN) {
  return presenceN >= controlN - REACH_NOISE_BAND;
}

function deathModes(runs) {
  const m = {};
  for (const r of runs) for (const [k, n] of Object.entries(r.deathCauses || {})) m[k] = (m[k] || 0) + n;
  return m;
}

function main() {
  const control = load('control');
  const presence = load('presence');
  if (!control.length || !presence.length) {
    console.error('ANALYZE STOP: need both arms swept (control + presence).');
    process.exit(2);
  }
  if (control.length !== CORPUS_RUNS || presence.length !== CORPUS_RUNS) {
    console.error(`ANALYZE STOP: corpus incomplete (control ${control.length}, presence ${presence.length}; need ${CORPUS_RUNS} each).`);
    process.exit(2);
  }

  // --- CONFIRM PRIMARY: living-veterans at end of run ---
  const cVets = sum(control, r => r.livingVeterans);
  const vVets = sum(presence, r => r.livingVeterans);
  const cVets5 = sum(control, r => r.veterans5);
  const vVets5 = sum(presence, r => r.veterans5);
  const goPrimary = judgePrimary(cVets, vVets);
  console.log('=== CONFIRM PRIMARY: living-veterans at end of run ===');
  console.log(`control:  ${cVets} veterans over ${control.length} runs (vets5 wave-4+ killers: ${cVets5})`);
  console.log(`presence: ${vVets} veterans over ${presence.length} runs (vets5 wave-4+ killers: ${vVets5})`);
  console.log(`delta: ${vVets >= cVets ? '+' : ''}${vVets - cVets} (bar: >= +${VET_BAR} -> ${goPrimary ? 'GO' : 'NO-GO'})`);
  for (const p of ['lead', 'belong']) {
    const c = sum(control.filter(r => r.policy.includes(p)), r => r.livingVeterans);
    const v = sum(presence.filter(r => (r.policy.includes(p + 'presence'))), r => r.livingVeterans);
    console.log(`  ${p}: control ${c} vs presence ${v}`);
  }

  // --- mechanism continuity (the pilot's mechanism on the confirm corpus) ---
  const joinAgg = (runs) => {
    let fights = 0, withComp = 0, compKills = 0, companion = 0, scholar = 0;
    for (const r of runs) for (const k of (r.kills || [])) {
      if (!k.dmg || k.dmg.compShare == null) continue;
      fights++; scholar += k.dmg.scholar; companion += k.dmg.companion;
      if (k.dmg.companion > 0) withComp++;
      if (k.companion) compKills++;
    }
    return { fights, withComp, compKills, joinRate: fights ? withComp / fights : 0, scholar, companion };
  };
  const cj = joinAgg(control), vj = joinAgg(presence);
  console.log('\n=== MECHANISM CONTINUITY (join rate, pilot primary) ===');
  console.log(`control:  ${(cj.joinRate * 100).toFixed(1)}% (${cj.withComp}/${cj.fights})  companion kills ${cj.compKills}  comp dmg ${cj.companion}`);
  console.log(`presence: ${(vj.joinRate * 100).toFixed(1)}% (${vj.withComp}/${vj.fights})  companion kills ${vj.compKills}  comp dmg ${vj.companion}`);

  // --- engagement ---
  console.log('\n=== ENGAGEMENT (the beat moved) ===');
  console.log(`goInside beats: control ${sum(control, r => (r.beat || {}).presenceGoInside)}  presence ${sum(presence, r => (r.beat || {}).presenceGoInside)}`);
  const engaged = presence.filter(r => ((r.beat || {}).presenceGoInside || 0) > 0).length;
  console.log(`runs with beat firing: presence ${engaged}/${presence.length}`);
  console.log(`instrument errors: control ${sum(control, r => (r.instrumentErrors || []).length)}  presence ${sum(presence, r => (r.instrumentErrors || []).length)}`);

  // --- guardrails ---
  console.log('\n=== GUARDRAILS (pre-registered) ===');
  const cMed = median(control.map(r => r.gameDays)), vMed = median(presence.map(r => r.gameDays));
  const goSurv = judgeSurvival(cMed, vMed);
  console.log(`median survival (gameDays): control ${cMed}  presence ${vMed} (bar: >= control-${SURV_BAR_DAYS}d -> ${goSurv ? 'PASS' : 'FAIL'})`);
  const starv = (runs) => sum(runs, r => ((r.deathCauses || {})['starvation'] || 0) + ((r.deathCauses || {})['player:starvation'] || 0));
  console.log(`starvation deaths: control ${starv(control)}  presence ${starv(presence)}`);
  const cm = deathModes(control), vm = deathModes(presence);
  const newModes = newDeathModes(cm, vm);
  console.log(`death modes: control ${Object.keys(cm).length}  presence ${Object.keys(vm).length}${newModes.length ? ' raw-new strings: ' + newModes.join(', ') : ' (none new)'}`);
  // fighter-movement proxy: villager deaths in combat relative to exposure
  const vcombat = (runs) => sum(runs, r => ((r.deathCauses || {})['villager combat'] || 0) + ((r.deathCauses || {})['villager-combat'] || 0) + ((r.deathCauses || {})['combat'] || 0));
  console.log(`combat-class deaths (all): control ${vcombat(control)}  presence ${vcombat(presence)} (see metric review)`);
  const nat = (runs) => sum(runs, r => r.national || 0), tab = (runs) => sum(runs, r => r.table || 0);
  const goNat = judgeReach(nat(control), nat(presence)), goTab = judgeReach(tab(control), tab(presence));
  console.log(`national: control ${nat(control)}/${control.length}  presence ${nat(presence)}/${presence.length} -> ${goNat ? 'PASS' : 'FAIL'}`);
  console.log(`table:    control ${tab(control)}/${control.length}  presence ${tab(presence)}/${presence.length} -> ${goTab ? 'PASS' : 'FAIL'}`);
  console.log(`wave-4:   control ${sum(control, r => r.wave4)}/${control.length}  presence ${sum(presence, r => r.wave4)}/${presence.length}`);
  console.log(`wave-5:   control ${sum(control, r => r.wave5)}/${control.length}  presence ${sum(presence, r => r.wave5)}/${presence.length}`);
  console.log(`wins:     control ${sum(control, r => r.won)}/${control.length}  presence ${sum(presence, r => r.won)}/${presence.length}`);

  console.log('\n=== VERDICT ===');
  const goModes = newModes.length === 0;
  const verdict = (goPrimary && goSurv && goModes && goNat && goTab) ? 'GO' : 'NO-GO (kill protocol)';
  console.log(`primary +${VET_BAR}: ${goPrimary ? 'GO' : 'NO-GO'} (${vVets} vs ${cVets}, delta ${vVets - cVets})`);
  console.log(`survival guardrail: ${goSurv ? 'PASS' : 'FAIL'}`);
  console.log(`no-new-death-mode: ${goModes ? 'PASS' : 'FAIL'}${newModes.length ? ' — raw strings need category judgment' : ''}`);
  console.log(`national not degraded: ${goNat ? 'PASS' : 'FAIL'}`);
  console.log(`table not degraded: ${goTab ? 'PASS' : 'FAIL'}`);
  console.log(`\nCONFIRM VERDICT: ${verdict}`);

  const out = {
    primary: { control: cVets, presence: vVets, delta: vVets - cVets, bar: VET_BAR, go: goPrimary, vets5: { control: cVets5, presence: vVets5 } },
    mechanism: { control: cj.joinRate, presence: vj.joinRate, companionKills: { control: cj.compKills, presence: vj.compKills } },
    engagement: { runs: engaged, goInside: sum(presence, r => (r.beat || {}).presenceGoInside) },
    guardrails: {
      survival: { control: cMed, presence: vMed, go: goSurv },
      newDeathModesRaw: newModes, deathModeCategories: { control: Object.keys(cm).length, presence: Object.keys(vm).length },
      national: { control: nat(control), presence: nat(presence), go: goNat },
      table: { control: tab(control), presence: tab(presence), go: goTab },
      wave4: { control: sum(control, r => r.wave4), presence: sum(presence, r => r.wave4) },
      wave5: { control: sum(control, r => r.wave5), presence: sum(presence, r => r.wave5) },
      wins: { control: sum(control, r => r.won), presence: sum(presence, r => r.won) },
      starvation: { control: starv(control), presence: starv(presence) },
    },
    verdict,
  };
  fs.writeFileSync(path.join(EVID, '_analysis.json'), JSON.stringify(out, null, 1));
  console.log('wrote _analysis.json');
}

if (require.main === module) main();

module.exports = { judgePrimary, judgeSurvival, newDeathModes, judgeReach, VET_BAR, SURV_BAR_DAYS, REACH_NOISE_BAND, CORPUS_RUNS };
