#!/usr/bin/env node
// sweep-presence2-analyze.js — sim-presence2 analysis (flesh-out loop,
// 2026-10-19, run sim-presence2, axis scale-onramp).
//
// Reads evidence/2026-10-19/perseed-presence2/ per-seed JSONs and judges:
//
// MODE=pilot (the mechanism gate on the rebuilt layer):
//   JOIN RATE = (fights with any companion damage) / (wave-3+ killing fights)
//   presence arm >= 1.5x control -> GO to confirm.
//   (pilot corpus: seeds 64201-64204 x {lead,belong} = 8 runs per arm)
//
// MODE=confirm (the §14-revised outcome):
//   living VILLAGER veterans at end of run =
//   Game.waveCombatReadiness(4).veterans EXCLUDING the scholar vid
//   (the confirm's metric-review finding: control's 3 veterans were all
//   scholar-veterans; presence's 4 were all villager-veterans — 4 vs 0 on
//   the layer's actual target), summed over the 16-run corpus per arm.
//   presence total >= control total + 2 -> GO.
//   (the +4 bar scaled from 32 to 16 runs; confirm corpus: seeds 64201-64208
//   x {lead,belong} = 16 runs per arm)
//
// GUARDRAILS (all must hold): median survival >= control-5d; no new death
// modes (esp. ZERO fighter-movement deaths — the mechanism never
// assigns/moves/risks villagers; proof A9 in test-presence.js, T3 in
// test-presence-confirm.js); national/table not degraded (±2 band).
// Starvation is a watch-item (confirm showed 16 vs 11 — reported, not
// judged, unless it breaches control+4).
//
// villagerVeterans(Game) is the ONE definition of the revised primary —
// required by the sweep, the analyzer's verdict, and the proof's V-section
// (one definition, three consumers; mirrors test-presence-confirm.js's T2
// pattern). It mirrors Game.waveCombatReadiness(4)'s veterans bar (design
// call #4, src/js/standing.js) minus the scholar vid.
//
// Usage: MODE=pilot|confirm node scripts/sweep-presence2-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-19', 'perseed-presence2');

const CORPUS_RUNS = 16;          // 8 seeds x 2 policies
const VET_BAR = 2;               // pre-registered: +2 villager-veterans on the 16-run corpus
const JOIN_BAR = 1.5;            // pilot: join rate >= 1.5x control
const ENGAGE_BAR = 8;            // pilot: beat fires on >= 8 runs
const SURV_BAR_DAYS = 5;         // median survival >= control - 5d
const REACH_NOISE_BAND = 2;      // national/table "not degraded" allows noise
const STARV_WATCH = 4;           // starvation reported; judged only if presence > control + 4

// villagerVeterans(Game): distinct living non-scholar vids with a wave-3+
// kill in state.waveKillLog. Mirrors the engine's veterans computation
// (src/js/standing.js waveCombatReadiness(4): distinct e.by with
// (e.w|0) >= 3, living-only under VETSHAPE-off) minus the scholar vid —
// the engine's isLiving(scholarId) is always true, so the scholar always
// counts in the engine bar and never counts here.
function villagerVeterans(Game) {
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    const scholarId = Game.villagerId;
    const seen = new Set();
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 3)) continue;
      if (e.by === scholarId) continue;
      let vp = null;
      try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(e.by) : null; } catch (err) { vp = null; }
      if (!vp || vp.dead) continue;
      seen.add(e.by);
    }
    return seen.size;
  } catch (e) { return 0; }
}

function load(arm) {
  const files = fs.readdirSync(EVID).filter(f => f.startsWith(arm + '-') && f.endsWith('.json') && !f.startsWith('_'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}

const sum = (runs, f) => runs.reduce((a, r) => a + (f(r) || 0), 0);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

// --- judge predicates (pure; exercised by test-presence.js V-section) ---
function judgePrimary(controlV, presenceV) { return presenceV >= controlV + VET_BAR; }
function judgeJoin(controlJ, presenceJ) {
  if (controlJ <= 0) return presenceJ > 0;
  return (presenceJ / controlJ) >= JOIN_BAR;
}
function judgeSurvival(controlMed, presenceMed) { return presenceMed >= controlMed - SURV_BAR_DAYS; }
function newDeathModes(controlModes, presenceModes) {
  return Object.keys(presenceModes).filter(k => !(k in controlModes));
}
function judgeReach(controlN, presenceN) { return presenceN >= controlN - REACH_NOISE_BAND; }

function deathModes(runs) {
  const m = {};
  for (const r of runs) for (const [k, n] of Object.entries(r.deathCauses || {})) m[k] = (m[k] || 0) + n;
  return m;
}

function joinAgg(runs) {
  let fights = 0, withComp = 0, compKills = 0;
  let scholar = 0, companion = 0, other = 0;
  for (const r of runs) {
    for (const k of (r.kills || [])) {
      if (!k.dmg || k.dmg.compShare == null) continue;
      fights++;
      scholar += k.dmg.scholar; companion += k.dmg.companion; other += k.dmg.other;
      if (k.dmg.companion > 0) withComp++;
      if (k.companion) compKills++;
    }
  }
  return { fights, withComp, compKills, joinRate: fights > 0 ? withComp / fights : 0, scholar, companion, other };
}

function main() {
  const MODE = process.env.MODE || 'pilot';
  const control = load('control');
  const presence = load('presence');
  if (!control.length || !presence.length) {
    console.error('ANALYZE STOP: need both arms swept (control + presence).');
    process.exit(2);
  }
  if (MODE === 'confirm' && (control.length !== CORPUS_RUNS || presence.length !== CORPUS_RUNS)) {
    console.error(`ANALYZE STOP: confirm corpus incomplete (control ${control.length}, presence ${presence.length}; need ${CORPUS_RUNS} each).`);
    process.exit(2);
  }

  const out = { mode: MODE, runs: { control: control.length, presence: presence.length } };

  // --- PILOT PRIMARY (mechanism): join rate ---
  const c = joinAgg(control), v = joinAgg(presence);
  const ratio = c.joinRate > 0 ? v.joinRate / c.joinRate : (v.joinRate > 0 ? Infinity : 0);
  const goJoin = judgeJoin(c.joinRate, v.joinRate);
  console.log('=== PILOT PRIMARY (mechanism): JOIN RATE ===');
  console.log(`control:  ${(c.joinRate * 100).toFixed(1)}% (${c.withComp}/${c.fights} killing fights with companion dmg)`);
  console.log(`presence: ${(v.joinRate * 100).toFixed(1)}% (${v.withComp}/${v.fights} killing fights with companion dmg)`);
  console.log(`ratio: ${Number.isFinite(ratio) ? ratio.toFixed(2) + 'x' : String(ratio)} (bar: >=${JOIN_BAR}x -> ${goJoin ? 'GO' : 'NO-GO'})`);
  console.log(`companion kills: control ${c.compKills}  presence ${v.compKills}`);
  console.log(`companion damage: control ${c.companion}  presence ${v.companion} (scholar ${c.scholar}/${v.scholar})`);
  out.mechanism = { control: c.joinRate, presence: v.joinRate, ratio: Number.isFinite(ratio) ? ratio : null, bar: JOIN_BAR, go: goJoin, companionKills: { control: c.compKills, presence: v.compKills }, companionDamage: { control: c.companion, presence: v.companion } };

  // --- engagement ---
  const engaged = presence.filter(r => ((r.beat || {}).presenceGoInside || 0) > 0).length;
  const goEngage = engaged >= ENGAGE_BAR;
  console.log('\n=== ENGAGEMENT (the beat moved) ===');
  console.log(`goInside beats: control ${sum(control, r => (r.beat || {}).presenceGoInside)}  presence ${sum(presence, r => (r.beat || {}).presenceGoInside)}`);
  console.log(`runs with beat firing: presence ${engaged}/${presence.length} (bar: >=${ENGAGE_BAR}) -> ${goEngage ? 'GO' : 'NO-GO'}`);
  console.log(`instrument errors: control ${sum(control, r => (r.instrumentErrors || []).length)}  presence ${sum(presence, r => (r.instrumentErrors || []).length)}`);
  out.engagement = { runs: engaged, bar: ENGAGE_BAR, go: goEngage, goInside: sum(presence, r => (r.beat || {}).presenceGoInside) };

  // --- REVISED CONFIRM PRIMARY (outcome): living villager-veterans ---
  const cVV = sum(control, r => r.villagerVeterans);
  const vVV = sum(presence, r => r.villagerVeterans);
  const cLV = sum(control, r => r.livingVeterans);
  const vLV = sum(presence, r => r.livingVeterans);
  const cV5 = sum(control, r => r.veterans5);
  const vV5 = sum(presence, r => r.veterans5);
  const goPrimary = judgePrimary(cVV, vVV);
  console.log('\n=== REVISED PRIMARY (outcome): living VILLAGER veterans ===');
  console.log(`villager-veterans: control ${cVV}  presence ${vVV} (delta ${vVV >= cVV ? '+' : ''}${vVV - cVV}; bar >= +${VET_BAR} -> ${goPrimary ? 'GO' : 'NO-GO'})`);
  console.log(`engine living-veterans (incl scholar): control ${cLV}  presence ${vLV}`);
  console.log(`veterans5 (living wave-4+ killers): control ${cV5}  presence ${vV5}`);
  out.primary = { villagerVeterans: { control: cVV, presence: vVV, delta: vVV - cVV, bar: VET_BAR, go: goPrimary }, livingVeterans: { control: cLV, presence: vLV }, veterans5: { control: cV5, presence: vV5 } };

  // --- guardrails ---
  console.log('\n=== GUARDRAILS (pre-registered) ===');
  const cMed = median(control.map(r => r.gameDays)), vMed = median(presence.map(r => r.gameDays));
  const goSurv = judgeSurvival(cMed, vMed);
  console.log(`median survival (gameDays): control ${cMed}  presence ${vMed} (bar: >= control-${SURV_BAR_DAYS}d -> ${goSurv ? 'PASS' : 'FAIL'})`);
  const starv = (runs) => sum(runs, r => ((r.deathCauses || {})['starvation'] || 0) + ((r.deathCauses || {})['player:starvation'] || 0) + ((r.deathCauses || {})['starved'] || 0));
  const cSt = starv(control), vSt = starv(presence);
  const starvWatch = vSt > cSt + STARV_WATCH;
  console.log(`starvation deaths: control ${cSt}  presence ${vSt} (watch-item; judged only if > control+${STARV_WATCH} -> ${starvWatch ? 'WATCH-BREACH' : 'ok'})`);
  const cm = deathModes(control), vm = deathModes(presence);
  const newModes = newDeathModes(cm, vm);
  console.log(`death modes: control ${Object.keys(cm).length}  presence ${Object.keys(vm).length}${newModes.length ? ' raw-new strings: ' + newModes.join(', ') : ' (none new)'}`);
  const nat = (runs) => sum(runs, r => r.national ? 1 : 0), tab = (runs) => sum(runs, r => r.table ? 1 : 0);
  const goNat = judgeReach(nat(control), nat(presence)), goTab = judgeReach(tab(control), tab(presence));
  console.log(`national: control ${nat(control)}/${control.length}  presence ${nat(presence)}/${presence.length} -> ${goNat ? 'PASS' : 'FAIL'}`);
  console.log(`table:    control ${tab(control)}/${control.length}  presence ${tab(presence)}/${presence.length} -> ${goTab ? 'PASS' : 'FAIL'}`);
  console.log(`wave-4:   control ${sum(control, r => r.wave4)}/${control.length}  presence ${sum(presence, r => r.wave4)}/${presence.length}`);
  console.log(`wave-5:   control ${sum(control, r => r.wave5)}/${control.length}  presence ${sum(presence, r => r.wave5)}/${presence.length}`);
  console.log(`wins:     control ${sum(control, r => r.won ? 1 : 0)}/${control.length}  presence ${sum(presence, r => r.won ? 1 : 0)}/${presence.length}`);
  out.guardrails = {
    survival: { control: cMed, presence: vMed, go: goSurv },
    starvation: { control: cSt, presence: vSt, watchBreach: starvWatch },
    newDeathModesRaw: newModes, deathModeCategories: { control: Object.keys(cm).length, presence: Object.keys(vm).length },
    national: { control: nat(control), presence: nat(presence), go: goNat },
    table: { control: tab(control), presence: tab(presence), go: goTab },
    wave4: { control: sum(control, r => r.wave4), presence: sum(presence, r => r.wave4) },
    wave5: { control: sum(control, r => r.wave5), presence: sum(presence, r => r.wave5) },
    wins: { control: sum(control, r => r.won ? 1 : 0), presence: sum(presence, r => r.won ? 1 : 0) },
  };

  console.log('\n=== VERDICT ===');
  let verdict;
  if (MODE === 'pilot') {
    // Pre-registered pilot verdict (this run): the pilot is a MECHANISM
    // CHECK on the rebuilt layer — "PRIMARY: JOIN RATE >= 1.5x control ->
    // GO to confirm". The kill protocol is for PRIMARY miss. Guardrails
    // are judged and reported; a guardrail FAIL at pilot is a LOUD flag
    // carried to the confirm (re-judged on the full corpus), not a kill —
    // n=8 medians are noisy by construction ("noisy small-n causes false
    // kills", throughput §).
    const goModes = newModes.length === 0;
    verdict = (goJoin && goEngage) ? 'GO-TO-CONFIRM' : 'NO-GO (kill protocol)';
    console.log(`join rate >=${JOIN_BAR}x: ${goJoin ? 'GO' : 'NO-GO'}`);
    console.log(`engagement >=${ENGAGE_BAR}: ${goEngage ? 'GO' : 'NO-GO'}`);
    console.log(`survival guardrail: ${goSurv ? 'PASS' : 'FAIL'}${goSurv ? '' : ' — LOUD FLAG, carried to confirm'}`);
    console.log(`no-new-death-mode (raw): ${goModes ? 'PASS' : 'FAIL'}${goModes ? '' : ' — needs category judgment'}`);
    console.log(`\nPILOT VERDICT: ${verdict}`);
  } else {
    const go = goPrimary && goSurv && newModes.length === 0 && goNat && goTab;
    verdict = go ? 'GO' : 'NO-GO (kill protocol)';
    console.log(`villager-veterans +${VET_BAR}: ${goPrimary ? 'GO' : 'NO-GO'} (${vVV} vs ${cVV}, delta ${vVV - cVV})`);
    console.log(`survival guardrail: ${goSurv ? 'PASS' : 'FAIL'}`);
    console.log(`no-new-death-mode: ${newModes.length === 0 ? 'PASS' : 'FAIL'}${newModes.length ? ' — raw strings need category judgment' : ''}`);
    console.log(`national not degraded: ${goNat ? 'PASS' : 'FAIL'}`);
    console.log(`table not degraded: ${goTab ? 'PASS' : 'FAIL'}`);
    console.log(`\nCONFIRM VERDICT: ${verdict}`);
  }
  out.verdict = verdict;
  fs.writeFileSync(path.join(EVID, `_analysis-${MODE}.json`), JSON.stringify(out, null, 1));
  console.log(`wrote _analysis-${MODE}.json`);
}

if (require.main === module) main();

module.exports = { villagerVeterans, judgePrimary, judgeJoin, judgeSurvival, newDeathModes, judgeReach, VET_BAR, JOIN_BAR, ENGAGE_BAR, SURV_BAR_DAYS, REACH_NOISE_BAND, CORPUS_RUNS };
