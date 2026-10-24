// analyze-scale-costbar.js — MEASUREMENT DIAG for the scale-onramp axis (sim-scalemetric).
// Re-derives, from the already-landed leanlink-family corpora under evidence/2026-10-24/:
//   Q1: per-seed end-state rank vs ever-reached rank (max over trustWeekly samples) + decay events.
//   Q2: per-band median survival, total/scholar/starvation/villager-combat deaths, arm-only
//       starvation (same-seed same-day matched), village-lost timing + exposure check.
// Usage: node scripts/analyze-scale-costbar.js [--json]
// Reads ONLY corpus files; writes nothing. Band filters are exact (cap5 confirm = 73509-73516;
// the 73509 seed belongs to the 7350x family — the cap5 arm's filter-trap note).
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RANK_NAMES = ['village', 'regional', 'national', 'global'];

const BANDS = [
  { id: 'leanlink-pilot', dir: 'perseed-leanlink', seeds: [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508] },
  { id: 'leanlinkrescue-pilot', dir: 'perseed-leanlinkrescue', seeds: [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508] },
  { id: 'leanlinkcap5-pilot', dir: 'perseed-leanlinkcap5', seeds: [73501, 73502, 73503, 73504, 73505, 73506, 73507, 73508] },
  { id: 'leanlinkcap5-confirm', dir: 'perseed-leanlinkcap5', seeds: [73509, 73510, 73511, 73512, 73513, 73514, 73515, 73516] },
];

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function perSeed(band, seed, arm) {
  const f = path.join(ROOT, 'evidence', '2026-10-24', band.dir, `s${seed}-${arm}.json`);
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  let ever = 'village';
  let peakDay = null;
  for (const w of (j.trustWeekly || [])) {
    if (RANK_ORDER[w.rank] > RANK_ORDER[ever]) { ever = w.rank; peakDay = w.day; }
  }
  // peakDay must be the FIRST sample day at the ever rank (loop above takes the first
  // climb past each rung, which is the first day at the final peak rank).
  const deathDays = (j.deaths || []).map(d => d.day);
  const lastWeekly = (j.trustWeekly || [])[(j.trustWeekly || []).length - 1] || null;
  const starvDays = (j.deaths || []).filter(d => d.cause === 'starvation').map(d => d.day);
  return {
    seed, arm, file: path.basename(f), anchor12: j.anchor12,
    days: j.gameDays, end: j.endReason, endRank: j.scaleRank, ever, peakDay,
    decayed: RANK_ORDER[ever] > RANK_ORDER[j.scaleRank],
    natEnd: RANK_ORDER[j.scaleRank] >= 2 ? 1 : 0,
    natEver: RANK_ORDER[ever] >= 2 ? 1 : 0,
    globalEnd: j.scaleRank === 'global' ? 1 : 0,
    globalEver: ever === 'global' ? 1 : 0,
    table: j.table ? 1 : 0, won: j.won ? 1 : 0, wave: j.maxWave,
    deaths: j.deathTotals.total, scholar: j.deathTotals.scholar,
    villager: j.deathTotals.villager, villCombat: j.deathTotals.villagerCombat,
    starv: (j.deathTotals.byCause || {}).starvation || 0, starvDays,
    courtNational: (j.court || {}).courtNational || 0,
    courtGlobal: (j.court || {}).courtGlobal || 0,
    finalRoster: j.finalRoster, lastDeathDay: deathDays.length ? Math.max(...deathDays) : null,
    lastWeeklyPantry: lastWeekly ? lastWeekly.pantry : null,
    lastWeeklyRank: lastWeekly ? lastWeekly.rank : null,
  };
}

function summarize(band, armRows, otherRows) {
  const bySeed = new Map(otherRows.map(r => [r.seed, r]));
  let matched = 0;
  for (const r of armRows) {
    const o = bySeed.get(r.seed);
    if (!o) continue;
    const counts = {};
    for (const d of r.starvDays) counts[d] = (counts[d] || 0) + 1;
    for (const d of o.starvDays) if (counts[d]) { matched += 1; counts[d] -= 1; }
  }
  const sum = k => armRows.reduce((a, r) => a + r[k], 0);
  const starv = sum('starv');
  return {
    n: armRows.length,
    medianDays: median(armRows.map(r => r.days)),
    lost: armRows.filter(r => r.end === 'village-lost').length,
    deaths: sum('deaths'), scholar: sum('scholar'), villager: sum('villager'),
    villCombat: sum('villCombat'), starv, starvMatched: matched, starvArmOnly: starv - matched,
    deathsPerDay: sum('deaths') / armRows.reduce((a, r) => a + r.days, 0),
    natEnd: sum('natEnd'), natEver: sum('natEver'), globalEnd: sum('globalEnd'),
    globalEver: sum('globalEver'), table: sum('table'), won: sum('won'),
    wave5: armRows.filter(r => r.wave >= 5).length,
  };
}

const out = { bands: {} };
for (const band of BANDS) {
  const control = band.seeds.map(s => perSeed(band, s, 'control'));
  const armed = band.seeds.map(s => perSeed(band, s, 'armed'));
  const cs = summarize(band, control, armed);
  const as = summarize(band, armed, control);
  const medianRatio = as.medianDays / cs.medianDays;
  out.bands[band.id] = {
    control: cs, armed: as,
    medianRatio, lostExcess: as.lost - cs.lost,
    scholarDelta: as.scholar - cs.scholar,
    deathRateRatio: as.deathsPerDay / cs.deathsPerDay,
    // Pre-registered candidate bars (see sim-scalemetric.md header):
    B1_median: medianRatio >= 0.8,
    B2_lostExcess: as.lost <= cs.lost + 1,
    B3_starvTotals: as.starv <= cs.starv + 2,
    B3_starvArmOnly: as.starvArmOnly <= cs.starvArmOnly + 2,
    B4_scholar: as.scholar <= cs.scholar + 5,
    B5_deathRate: as.deathsPerDay <= cs.deathsPerDay * 1.10,
    seeds: { control, armed },
    decays: armed.filter(r => r.decayed).map(r => ({
      seed: r.seed, peak: r.ever, peakDay: r.peakDay, final: r.endRank,
      end: r.end, days: r.days, courtNational: r.courtNational, courtGlobal: r.courtGlobal,
    })),
  };
}

// Separation test (decision rule §1): fails leanlink-pilot AND passes rescue-pilot,
// cap5-pilot, cap5-confirm.
const b = out.bands;
function separates(key) {
  return !b['leanlink-pilot'][key] && b['leanlinkrescue-pilot'][key] &&
    b['leanlinkcap5-pilot'][key] && b['leanlinkcap5-confirm'][key];
}
out.separation = {
  B1_median: separates('B1_median'),
  B2_lostExcess: separates('B2_lostExcess'),
  B4_scholar: separates('B4_scholar'),
  B5_deathRate: separates('B5_deathRate'),
  B3_starvTotals_allPass:
    b['leanlink-pilot'].B3_starvTotals && b['leanlinkrescue-pilot'].B3_starvTotals &&
    b['leanlinkcap5-pilot'].B3_starvTotals && b['leanlinkcap5-confirm'].B3_starvTotals,
  B3_starvArmOnly_allPass:
    b['leanlink-pilot'].B3_starvArmOnly && b['leanlinkrescue-pilot'].B3_starvArmOnly &&
    b['leanlinkcap5-pilot'].B3_starvArmOnly && b['leanlinkcap5-confirm'].B3_starvArmOnly,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(out, null, 2));
} else {
  for (const [id, x] of Object.entries(out.bands)) {
    console.log(`\n### ${id}`);
    console.log(`control: median ${x.control.medianDays} lost ${x.control.lost}/8 deaths ${x.control.deaths} scholar ${x.control.scholar} starv ${x.control.starv} (armOnly ${x.control.starvArmOnly}) villCombat ${x.control.villCombat} natEnd ${x.control.natEnd} natEver ${x.control.natEver} table ${x.control.table} dpd ${x.control.deathsPerDay.toFixed(3)}`);
    console.log(`armed:   median ${x.armed.medianDays} lost ${x.armed.lost}/8 deaths ${x.armed.deaths} scholar ${x.armed.scholar} starv ${x.armed.starv} (armOnly ${x.armed.starvArmOnly}) villCombat ${x.armed.villCombat} natEnd ${x.armed.natEnd} natEver ${x.armed.natEver} globEnd ${x.armed.globalEnd} globEver ${x.armed.globalEver} table ${x.armed.table} dpd ${x.armed.deathsPerDay.toFixed(3)}`);
    console.log(`medianRatio ${x.medianRatio.toFixed(3)} lostExcess ${x.lostExcess} scholarDelta ${x.scholarDelta} rateRatio ${x.deathRateRatio.toFixed(3)} | B1 ${x.B1_median} B2 ${x.B2_lostExcess} B3tot ${x.B3_starvTotals} B3only ${x.B3_starvArmOnly} B4 ${x.B4_scholar} B5 ${x.B5_deathRate}`);
    console.log(`decays (${x.decays.length}): ${x.decays.map(d => `${d.seed}:${d.peak}@d${d.peakDay}->${d.final} (${d.end} d${d.days}, natBeats ${d.courtNational}, globBeats ${d.courtGlobal})`).join('; ') || 'none'}`);
    console.log('per-seed armed: ' + x.seeds.armed.map(r => `${r.seed}:${r.endRank}->ever ${r.ever} d${r.days} ${r.end} deaths${r.deaths}/sch${r.scholar}/stv${r.starv} roster${r.finalRoster} lastDeath${r.lastDeathDay} lastPantry${r.lastWeeklyPantry}`).join(' | '));
    console.log('per-seed control: ' + x.seeds.control.map(r => `${r.seed}:${r.endRank} d${r.days} ${r.end} deaths${r.deaths}/sch${r.scholar}/stv${r.starv}`).join(' | '));
  }
  console.log('\nSEPARATION: ' + JSON.stringify(out.separation));
}
