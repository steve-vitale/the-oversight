#!/usr/bin/env node
// presencetend-analyze-20261019.js — sim-presencetend analysis.
//
// Reads evidence/2026-10-19/perseed-presencetend/ per-seed JSONs and judges
// the pre-registered PRIMARY (outcome):
//   living-VILLAGER-veterans at end of run (the REVISED primary per the
//   presence-confirm metric review #2: DISTINCT living roster vids with a
//   wave-3+ kill in state.waveKillLog, the SCHOLAR vid EXCLUDED — control
//   produces scholar-veterans on its own; the layer's actual target is
//   villager veterans), summed over the 32-run corpus per arm, paired on
//   identical seeds x policies.
//   presencetend total >= control total + 4 (32 runs) -> GO.
//
// GUARDRAILS (all must hold): median survival >= control-10d; no new death
// modes (REVISED per the decomp metric review: a new cause counts only at
// >=2 events; named-monster-lottery causes exempt — monster display names
// from src/data/monsters.json); table >= control-2; national not degraded;
// wave-4 not degraded.
//
// The judge predicates and countLivingVillagerVeterans are require-able so
// scripts/test-presencetend-20261019.js proves the SAME logic the verdict
// rests on (T1/T2).
//
// Usage: node scripts/presencetend-analyze-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-19', 'perseed-presencetend');

const CORPUS_RUNS = 32;          // 16 seeds x 2 policies
const VET_BAR = 4;               // pre-registered: +4 living-villager-veterans per 32 runs
const SURV_FLOOR_DAYS = 10;      // armed median survival >= control - 10d
const REACH_NOISE_BAND = 2;      // table "not degraded" allows noise
const NEW_MODE_MIN_EVENTS = 2;   // decomp metric-review revision

// --- the revised primary, pinned on the same engine read as the VETERANS bar ---
// DISTINCT living roster vids with a wave-3+ kill in state.waveKillLog,
// the SCHOLAR vid excluded. Mirrors waveCombatReadiness(4)'s veterans loop
// (standing.js: VETSHAPE-off default = living only) minus the scholar
// short-circuit.
function countLivingVillagerVeterans(Game) {
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const scholarId = Game.villagerId;
    const seen = new Set();
    const isLiving = (vid) => {
      try { const vp = Game.vpOf ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); }
      catch (e) { return false; }
    };
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 3)) continue;
      if (e.by === scholarId) continue; // the scholar never counts on the revised primary
      if (!isLiving(e.by)) continue;
      seen.add(e.by);
    }
    return { count: seen.size, vids: [...seen] };
  } catch (e) { return { count: 0, vids: [] }; }
}

// --- named-monster-lottery exemption set (decomp metric review #3) ---
let MONSTER_NAMES = new Set();
try {
  const defs = require(path.join(REPO, 'src', 'data', 'monsters.json'));
  for (const d of defs) {
    if (!d) continue;
    if (d.name) MONSTER_NAMES.add(String(d.name).toLowerCase());
    if (d.id) MONSTER_NAMES.add(String(d.id).toLowerCase().replace(/_/g, ' '));
  }
} catch (e) { MONSTER_NAMES = new Set(); }

// --- judge predicates (pure; also exercised by the proof test) ---
function judgePrimary(controlVets, armedVets) {
  return armedVets >= controlVets + VET_BAR;
}
function judgeSurvival(controlMed, armedMed) {
  return armedMed >= controlMed - SURV_FLOOR_DAYS;
}
// newDeathModes(controlModes, armedModes, names): armed-only causes that
// reach >=2 events and are NOT named-monster-lottery causes. Returns the
// qualifying causes. Single-draw noise and monster names are exempt (the
// decomp metric-review revision, applied to this run).
function newDeathModes(controlModes, armedModes, names) {
  const nm = names || MONSTER_NAMES;
  return Object.keys(armedModes).filter(k =>
    !(k in controlModes) && (armedModes[k] | 0) >= NEW_MODE_MIN_EVENTS &&
    !nm.has(String(k).toLowerCase()));
}
function judgeReach(controlN, armedN) {
  return armedN >= controlN - REACH_NOISE_BAND;
}

function load(arm) {
  const files = fs.readdirSync(EVID).filter(f => f.startsWith(arm + '-') && f.endsWith('.json') && !f.startsWith('_'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}

const sum = (runs, f) => runs.reduce((a, r) => a + (f(r) || 0), 0);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

function deathModes(runs) {
  const m = {};
  for (const r of runs) for (const [k, n] of Object.entries(r.deathCauses || {})) m[k] = (m[k] || 0) + n;
  return m;
}

function main() {
  const control = load('control');
  const armed = load('presencetend');
  if (!control.length || !armed.length) {
    console.error('ANALYZE STOP: need both arms swept (control + presencetend).');
    process.exit(2);
  }
  if (control.length !== CORPUS_RUNS || armed.length !== CORPUS_RUNS) {
    console.error(`ANALYZE STOP: corpus incomplete (control ${control.length}, presencetend ${armed.length}; need ${CORPUS_RUNS} each).`);
    process.exit(2);
  }

  // --- PRIMARY: living-villager-veterans at end of run (scholar excluded) ---
  const cVV = sum(control, r => r.livingVillagerVeterans);
  const aVV = sum(armed, r => r.livingVillagerVeterans);
  const cVE = sum(control, r => r.livingVeterans); // engine VETERANS bar (informational)
  const aVE = sum(armed, r => r.livingVeterans);
  const cV5 = sum(control, r => r.veterans5), aV5 = sum(armed, r => r.veterans5);
  const goPrimary = judgePrimary(cVV, aVV);
  console.log('=== PRIMARY: living-villager-veterans at end of run (scholar excluded) ===');
  console.log(`control:      ${cVV} over ${control.length} runs (engine veterans incl scholar: ${cVE}; vets5: ${cV5})`);
  console.log(`presencetend: ${aVV} over ${armed.length} runs (engine veterans incl scholar: ${aVE}; vets5: ${aV5})`);
  console.log(`delta: ${aVV >= cVV ? '+' : ''}${aVV - cVV} (bar: >= +${VET_BAR} -> ${goPrimary ? 'GO' : 'NO-GO'})`);
  for (const p of ['lead', 'belong']) {
    const c = sum(control.filter(r => r.policy.includes(p + 'feast')), r => r.livingVillagerVeterans);
    const a = sum(armed.filter(r => (r.policy.includes(p + 'presencetend'))), r => r.livingVillagerVeterans);
    console.log(`  ${p}: control ${c} vs presencetend ${a}`);
  }

  // --- mechanism continuity (presence half + tend half engagement) ---
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
  const cj = joinAgg(control), aj = joinAgg(armed);
  console.log('\n=== MECHANISM CONTINUITY (presence half) ===');
  console.log(`control:      ${(cj.joinRate * 100).toFixed(1)}% (${cj.withComp}/${cj.fights})  companion kills ${cj.compKills}  comp dmg ${cj.companion}`);
  console.log(`presencetend: ${(aj.joinRate * 100).toFixed(1)}% (${aj.withComp}/${aj.fights})  companion kills ${aj.compKills}  comp dmg ${aj.companion}`);
  console.log('\n=== ENGAGEMENT (the beats moved) ===');
  const beat = (runs, k) => sum(runs, r => ((r.beat || {})[k] || 0));
  console.log(`goInside beats: control ${beat(control, 'presencetendGoInside')}  presencetend ${beat(armed, 'presencetendGoInside')}`);
  console.log(`steps:          control ${beat(control, 'presencetendStep')}  presencetend ${beat(armed, 'presencetendStep')}`);
  console.log(`tends:          control ${beat(control, 'presencetendTends')}  presencetend ${beat(armed, 'presencetendTends')}`);
  console.log(`runs with beat firing: presencetend ${armed.filter(r => ((r.beat || {}).presencetendGoInside || 0) > 0).length}/${armed.length}`);
  console.log(`runs with tend firing: presencetend ${armed.filter(r => ((r.beat || {}).presencetendTends || 0) > 0).length}/${armed.length}`);
  console.log(`instrument errors: control ${sum(control, r => (r.instrumentErrors || []).length)}  presencetend ${sum(armed, r => (r.instrumentErrors || []).length)}`);

  // --- guardrails ---
  console.log('\n=== GUARDRAILS (pre-registered) ===');
  const cMed = median(control.map(r => r.gameDays)), aMed = median(armed.map(r => r.gameDays));
  const goSurv = judgeSurvival(cMed, aMed);
  console.log(`median survival (gameDays): control ${cMed}  presencetend ${aMed} (floor: >= control-${SURV_FLOOR_DAYS}d -> ${goSurv ? 'PASS' : 'FAIL'})`);
  const starv = (runs) => sum(runs, r => ((r.deathCauses || {})['starvation'] || 0) + ((r.deathCauses || {})['player:starvation'] || 0));
  console.log(`starvation deaths: control ${starv(control)}  presencetend ${starv(armed)}`);
  const cm = deathModes(control), am = deathModes(armed);
  const newModes = newDeathModes(cm, am);
  console.log(`death modes: control ${Object.keys(cm).length}  presencetend ${Object.keys(am).length}${newModes.length ? ' qualifying new: ' + newModes.join(', ') : ' (none new per revised rule)'}`);
  const rawNew = Object.keys(am).filter(k => !(k in cm));
  if (rawNew.length && !newModes.length) console.log(`  raw new strings (single-draw/monster-name, exempt): ${rawNew.map(k => `${k}@${am[k]}`).join(', ')}`);
  const nat = (runs) => sum(runs, r => r.national || 0), tab = (runs) => sum(runs, r => r.table || 0);
  const goNat = nat(armed) >= nat(control), goTab = judgeReach(tab(control), tab(armed));
  const w4 = (runs) => sum(runs, r => r.wave4 || 0), w5 = (runs) => sum(runs, r => r.wave5 || 0);
  const goW4 = w4(armed) >= w4(control);
  console.log(`national: control ${nat(control)}/${control.length}  presencetend ${nat(armed)}/${armed.length} -> ${goNat ? 'PASS' : 'FAIL'}`);
  console.log(`table:    control ${tab(control)}/${control.length}  presencetend ${tab(armed)}/${armed.length} -> ${goTab ? 'PASS' : 'FAIL'}`);
  console.log(`wave-4:   control ${w4(control)}/${control.length}  presencetend ${w4(armed)}/${armed.length} -> ${goW4 ? 'PASS' : 'FAIL'}`);
  console.log(`wave-5:   control ${w5(control)}/${control.length}  presencetend ${w5(armed)}/${armed.length} (informational)`);
  console.log(`wins:     control ${sum(control, r => r.won)}/${control.length}  presencetend ${sum(armed, r => r.won)}/${armed.length}`);

  console.log('\n=== VERDICT ===');
  const goModes = newModes.length === 0;
  const verdict = (goPrimary && goSurv && goModes && goNat && goTab && goW4) ? 'GO' : 'NO-GO (kill protocol)';
  console.log(`primary +${VET_BAR}: ${goPrimary ? 'GO' : 'NO-GO'} (${aVV} vs ${cVV}, delta ${aVV - cVV})`);
  console.log(`survival floor: ${goSurv ? 'PASS' : 'FAIL'}`);
  console.log(`no-new-death-mode (revised): ${goModes ? 'PASS' : 'FAIL'}${newModes.length ? ' — ' + newModes.join(', ') : ''}`);
  console.log(`national not degraded: ${goNat ? 'PASS' : 'FAIL'}`);
  console.log(`table not degraded: ${goTab ? 'PASS' : 'FAIL'}`);
  console.log(`wave-4 not degraded: ${goW4 ? 'PASS' : 'FAIL'}`);
  console.log(`\nVERDICT: ${verdict}`);

  const out = {
    primary: { control: cVV, presencetend: aVV, delta: aVV - cVV, bar: VET_BAR, go: goPrimary, engineVets: { control: cVE, presencetend: aVE }, vets5: { control: cV5, presencetend: aV5 } },
    mechanism: { control: cj.joinRate, presencetend: aj.joinRate, companionKills: { control: cj.compKills, presencetend: aj.compKills } },
    engagement: {
      runsWithBeat: armed.filter(r => ((r.beat || {}).presencetendGoInside || 0) > 0).length,
      runsWithTend: armed.filter(r => ((r.beat || {}).presencetendTends || 0) > 0).length,
      goInside: beat(armed, 'presencetendGoInside'), steps: beat(armed, 'presencetendStep'), tends: beat(armed, 'presencetendTends'),
    },
    guardrails: {
      survival: { control: cMed, presencetend: aMed, go: goSurv },
      newDeathModesQualifying: newModes, rawNewStrings: rawNew,
      deathModeCategories: { control: Object.keys(cm).length, presencetend: Object.keys(am).length },
      national: { control: nat(control), presencetend: nat(armed), go: goNat },
      table: { control: tab(control), presencetend: tab(armed), go: goTab },
      wave4: { control: w4(control), presencetend: w4(armed), go: goW4 },
      wave5: { control: w5(control), presencetend: w5(armed) },
      wins: { control: sum(control, r => r.won), presencetend: sum(armed, r => r.won) },
      starvation: { control: starv(control), presencetend: starv(armed) },
    },
    verdict,
  };
  fs.writeFileSync(path.join(EVID, '_analysis.json'), JSON.stringify(out, null, 1));
  console.log('wrote _analysis.json');
}

if (require.main === module) main();

module.exports = {
  countLivingVillagerVeterans, judgePrimary, judgeSurvival, newDeathModes, judgeReach,
  VET_BAR, SURV_FLOOR_DAYS, REACH_NOISE_BAND, NEW_MODE_MIN_EVENTS, CORPUS_RUNS, MONSTER_NAMES,
};
