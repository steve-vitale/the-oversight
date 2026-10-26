#!/usr/bin/env node
// Analyzer for journey ESTABLISHMENT r44 (2026-10-26): re-derives the panel
// verdicts C1/C2/C3/C4, the I intake-gate decomposition, and the P
// preserved-food arm comparison from the panel + arm JSONs. Read-only:
// prints to stdout, writes nothing. Usage:
//   node scripts/analyze-journey-establishment-r43-20261026.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-26';
const load = (n) => JSON.parse(fs.readFileSync(path.join(EVID, n), 'utf8'));
const SEEDS = [209, 228, 238, 239];
const panel = {};
for (const s of SEEDS) panel[s] = load(`journey-establishment-r44-seed${s}.json`);
let arm = null, r43arm = null, r43panel = {};
try { arm = load('journey-establishment-r43-preserved-seed239.json'); } catch (e) { console.log('P arm file missing:', e.message); }
try { r43arm = load('journey-establishment-r43-preserved-seed239.json'); } catch (e) {}
for (const s of SEEDS) { try { r43panel[s] = load(`journey-establishment-r43-seed${s}.json`); } catch (e) {} }

console.log('== C1/C2 (panel totals vs pristine re-score) ==');
for (const t of ['cook', 'builder']) {
  const n1 = SEEDS.reduce((a, s) => a + panel[s].censusEndSummary[t].n1, 0);
  const old = SEEDS.reduce((a, s) => a + panel[s].censusEndSummary[t].old_n1, 0);
  console.log(`  ${t}: living>=1 ${n1} vs pristine ${old} -> ${n1 > old ? 'GO' : 'NO-GO'}`);
}
const regr = SEEDS.reduce((a, s) => a + panel[s].regressions.length, 0);
console.log(`  regressions total: ${regr} -> ${regr === 0 ? 'GO' : 'NO-GO'}`);
if (regr) for (const s of SEEDS) for (const r of panel[s].regressions) console.log(`    regression seed ${s}:`, JSON.stringify(r));

console.log('== C3/C4 per seed (r44 panel; r43 panel for comparison) ==');
for (const s of SEEDS) {
  const d = panel[s], o = r43panel[s];
  console.log(`  ${s}: C3 ${d.c3.verdict} (starvation ${d.c3.starvationDeaths}, maxCrisisStreak ${d.c3.maxCrisisStreak}) | C4 ${d.c4.verdict} (convos ${d.c4.convos}, null ${d.c4.nullCount}, err ${d.c4.errorCount})` +
    (o ? ` | r43: C3 ${o.c3.verdict} (starv ${o.c3.starvationDeaths}, streak ${o.c3.maxCrisisStreak}), pantry ${o.guardrails.pantryKcal}, alive ${o.guardrails.popAlive}, tier ${o.guardrails.tier}` : '') +
    ` | r44 pantry ${d.guardrails.pantryKcal}, alive ${d.guardrails.popAlive}, tier ${d.guardrails.tier}`);
}

console.log('== I: intake-gate decomposition (streak-signal rows: !fasting && ate < 60% needBase) ==');
let allStarving = [];
for (const s of SEEDS) {
  const d = panel[s];
  const rows = [];
  for (const iday of (d.intakeDays || [])) for (const m of (iday.meals || [])) if (m.starving) rows.push(m);
  allStarving = allStarving.concat(rows.map(r => ({ seed: s, ...r })));
  const days = [...new Set(rows.map(r => r.day))];
  console.log(`  seed ${s}: starving rows ${rows.length} on days [${days.join(', ')}] (intakeDays ${ (d.intakeDays || []).length })`);
  const byVid = {};
  for (const r of rows) byVid[r.name] = (byVid[r.name] || 0) + 1;
  if (rows.length) console.log(`    by villager: ${JSON.stringify(byVid)}`);
}
function classify(r) {
  if (r.away) return 'away-pack';
  const want = Math.max(0, r.needBase - r.ownEat);
  if (r.drawn <= 0) return 'drawn-zero';
  if (r.drawn < want && (r.freshBefore || 0) >= want) return 'drawn-short-full-pantry';
  if (r.drawn < want) return 'drawn-short-thin-pantry';
  return 'other (draw covered want but ate still <60%: check needBase vs true need)';
}
const cls = {};
for (const r of allStarving) cls[classify(r)] = (cls[classify(r)] || 0) + 1;
console.log(`  panel starving rows total: ${allStarving.length}; by gate: ${JSON.stringify(cls)}`);
if (allStarving.length) {
  const full = allStarving.filter(r => classify(r) === 'drawn-short-full-pantry');
  console.log(`  drawn-short-full-pantry rows: ${full.length}`);
  const worst = [...allStarving].sort((a, b) => (b.pantryBefore || 0) - (a.pantryBefore || 0)).slice(0, 8);
  console.log('  highest-pantryBefore starving rows:');
  for (const r of worst) console.log(`    seed ${r.seed} d${r.day} ${r.name}: ate ${r.ate} drawn ${r.drawn} ownEat ${r.ownEat} produced ${r.produced} needBase ${r.needBase} away ${r.away} fasting ${r.fasting} rhythm ${r.rhythm} pantryBefore ${r.pantryBefore} freshBefore ${r.freshBefore} -> ${classify(r)}`);
  const awayRows = allStarving.filter(r => r.away);
  console.log(`  away-pack rows: ${awayRows.length}`);
  const fed = [];
  for (const s of SEEDS) for (const iday of (panel[s].intakeDays || [])) for (const m of (iday.meals || [])) if (!m.starving && !m.fasting) fed.push(m);
  const fedDrawnZero = fed.filter(m => m.drawn <= 0).length;
  console.log(`  fed (non-starving, non-fasting) rows: ${fed.length}, of which drawn==0: ${fedDrawnZero} (own-production covers them)`);
}
console.log('== I: streak windows (foodLedger hungryStreak path) ==');
for (const s of SEEDS) {
  const d = panel[s];
  const led = d.foodLedger || [];
  const hsPath = led.map(r => `d${r.day}:${r.hungryStreak}`).join(' ');
  const starv = d.deaths.filter(x => /starvat|hunger|thirst/.test(String(x.cause || '')));
  console.log(`  ${s}: hs path: ${hsPath}`);
  console.log(`    starvation deaths (all days): ${JSON.stringify(starv)}`);
}

if (arm) {
  console.log('== P: preserved-food arm (r43 arm, NOT rerun in r44 - reference only) ==');
  console.log(`  topUp: ${JSON.stringify(arm.topUp)}`);
  console.log(`  arm C3: ${arm.c3.verdict} (starvation ${arm.c3.starvationDeaths}, maxCrisisStreak ${arm.c3.maxCrisisStreak}) vs panel C3: ${panel[239].c3.verdict} (starvation ${panel[239].c3.starvationDeaths}, maxCrisisStreak ${panel[239].c3.maxCrisisStreak})`);
  if (r43arm) console.log(`  r42 perishable arm C3: ${r43arm.c3.verdict} (starvation ${r43arm.c3.starvationDeaths}, maxCrisisStreak ${r43arm.c3.maxCrisisStreak})`);
  console.log(`  arm deaths: ${JSON.stringify(arm.deaths.filter(x => /starvat/.test(String(x.cause || ''))))}`);
  console.log(`  arm hs d22+: ${arm.foodLedger.filter(r => r.day >= 22).map(r => 'd' + r.day + ':' + r.hungryStreak).join(' ')}`);
  console.log(`  arm end pantry ${arm.guardrails.pantryKcal} alive ${arm.guardrails.popAlive} tier ${arm.guardrails.tier} vs panel pantry ${panel[239].guardrails.pantryKcal} alive ${panel[239].guardrails.popAlive} tier ${panel[239].guardrails.tier}`);
  const arows = [];
  for (const iday of (arm.intakeDays || [])) for (const m of (iday.meals || [])) if (m.starving) arows.push(m);
  const acls = {};
  for (const r of arows) acls[classify(r)] = (acls[classify(r)] || 0) + 1;
  console.log(`  arm starving rows: ${arows.length} by gate: ${JSON.stringify(acls)}`);
  const aworst = [...arows].sort((a, b) => (b.pantryBefore || 0) - (a.pantryBefore || 0)).slice(0, 5);
  for (const r of aworst) console.log(`    arm worst d${r.day} ${r.name}: ate ${r.ate} drawn ${r.drawn} ownEat ${r.ownEat} produced ${r.produced} needBase ${r.needBase} away ${r.away} pantryBefore ${r.pantryBefore} freshBefore ${r.freshBefore} -> ${classify(r)}`);
}

console.log('== H: health-crash diagnostic (hurtVillager funnel + sickness ticks + snap deltas) ==');
for (const s of SEEDS) {
  const d = panel[s];
  const big = (d.hurtLog || []).filter(h => h.fn === 'hurtVillager' && typeof h.argDmg === 'number' && h.argDmg >= 20);
  const starv = (d.hurtLog || []).filter(h => h.fn === 'hurtFromStarvation');
  const tickMax = (d.sickTickLog || []).reduce((m, t) => { for (const c of (t.changed || [])) { const dd = (c.before == null || c.after == null) ? 0 : c.before - c.after; if (dd > m) m = dd; } return m; }, 0);
  const tickRows = (d.sickTickLog || []).reduce((a, t) => a + (t.changed || []).length, 0);
  let snapMax = 0, snapMaxRow = null;
  const sn = d.healthSnaps || [];
  for (let i = 1; i < sn.length; i++) for (const vid of Object.keys(sn[i].health)) {
    const a = sn[i - 1].health[vid], b = sn[i].health[vid];
    if (a != null && b != null && a - b > snapMax) { snapMax = a - b; snapMaxRow = { from: sn[i - 1].day + '/' + sn[i - 1].tag, to: sn[i].day + '/' + sn[i].tag, vid, a, b }; }
  }
  const byCause = {};
  for (const h of big) byCause[h.cause || '?'] = (byCause[h.cause || '?'] || 0) + 1;
  console.log(`  ${s}: hurtVillager>=20: ${big.length} by cause ${JSON.stringify(byCause)} | starvation hurts: ${starv.length} | sickness-tick max single drop: ${tickMax} over ${tickRows} tick rows | snap max drop: ${snapMax} ${snapMaxRow ? JSON.stringify(snapMaxRow) : ''} | crashDays: [${(d.crashDays || []).join(', ')}]`);
  const top = [...big].sort((a, b) => b.argDmg - a.argDmg).slice(0, 5);
  for (const h of top) console.log(`    top hit d${h.day} ${h.name}: ${h.argDmg} cause=${h.cause} ${h.healthBefore}->${h.healthAfter}`);
  // Snap drops land at dawn; the causing hurt logs during the previous day's
  // overnight resolution, so the window is day-1..day and the test sums
  // hurts (multi-hit days count). Player rows are excluded: scholar health
  // flows through addHealth, not hurtVillager — an instrument-scope gap
  // for a future run, not a villager funnel gap.
  const noLogCrashes = [];
  for (let i = 1; i < sn.length; i++) for (const vid of Object.keys(sn[i].health)) {
    if (vid === 'player') continue;
    const a = sn[i - 1].health[vid], b = sn[i].health[vid];
    if (a != null && b != null && a - b >= 30) {
      const tot = (d.hurtLog || []).filter(h => String(h.vid) === String(vid) && h.fn === 'hurtVillager' && typeof h.argDmg === 'number' && h.day >= sn[i].day - 1 && h.day <= sn[i].day).reduce((t, h) => t + h.argDmg, 0);
      if (tot < 20) noLogCrashes.push({ day: sn[i].day, vid, a, b, hurtSum: tot });
    }
  }
  console.log(`    villager snap drops >=30 with NO hurtVillager cover (window day-1..day, sum<20): ${noLogCrashes.length} ${noLogCrashes.length ? JSON.stringify(noLogCrashes) : ''} (player rows excluded: scholar uses addHealth)`);
}
console.log('== O: over-cause (r44 addition) ==');
for (const s of SEEDS) {
  const d = panel[s];
  console.log(`  ${s}: over=${d.over} overCause=${JSON.stringify(d.overCause)} reachedDay=${d.reachedDay}`);
}
console.log('== T aggregates (panel sums; baseline establishment.json (r40 re-seed): deaths 41, popAlive 38, pantryKcal 77861, starvation 1) ==');
const tDeaths = SEEDS.reduce((a, s) => a + panel[s].guardrails.deaths, 0);
const tAlive = SEEDS.reduce((a, s) => a + panel[s].guardrails.popAlive, 0);
const tPantry = SEEDS.reduce((a, s) => a + panel[s].guardrails.pantryKcal, 0);
const tStarv = SEEDS.reduce((a, s) => a + panel[s].c3.starvationDeaths, 0);
console.log(`  deaths ${tDeaths} | popAlive ${tAlive} | pantryKcal ${tPantry} | starvation ${tStarv}`);
console.log('== B (betrayal probe) ==');
for (const s of SEEDS) {
  try {
    const p = load(`journey-establishment-r44-betrayal-seed${s}.json`);
    console.log(`  ${s}: ${p.verdict}${p.found ? ' ' + p.found.name : ''}`);
  } catch (e) { console.log(`  ${s}: probe file missing`); }
}
