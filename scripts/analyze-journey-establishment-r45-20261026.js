#!/usr/bin/env node
// Analyzer for journey ESTABLISHMENT r45 (2026-10-26): re-derives the panel
// verdicts C1/C2/C3/C4, the I intake-gate decomposition, the S scholar-crash
// coverage, the G gossip-attribution check, and the L landing-carry watch
// from the panel JSONs. (P preserved-food arm closed in r43/r44, not re-run.) Read-only:
// prints to stdout, writes nothing. Usage:
//   node scripts/analyze-journey-establishment-r45-20261026.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-26';
const load = (n) => JSON.parse(fs.readFileSync(path.join(EVID, n), 'utf8'));
const SEEDS = [209, 228, 238, 239];
const panel = {};
for (const s of SEEDS) panel[s] = load(`journey-establishment-r45-seed${s}.json`);
let r44panel = {};
for (const s of SEEDS) { try { r44panel[s] = load(`journey-establishment-r44-seed${s}.json`); } catch (e) {} }

console.log('== C1/C2 (panel totals vs pristine re-score) ==');
for (const t of ['cook', 'builder']) {
  const n1 = SEEDS.reduce((a, s) => a + panel[s].censusEndSummary[t].n1, 0);
  const old = SEEDS.reduce((a, s) => a + panel[s].censusEndSummary[t].old_n1, 0);
  console.log(`  ${t}: living>=1 ${n1} vs pristine ${old} -> ${n1 > old ? 'GO' : 'NO-GO'}`);
}
const regr = SEEDS.reduce((a, s) => a + panel[s].regressions.length, 0);
console.log(`  regressions total: ${regr} -> ${regr === 0 ? 'GO' : 'NO-GO'}`);
if (regr) for (const s of SEEDS) for (const r of panel[s].regressions) console.log(`    regression seed ${s}:`, JSON.stringify(r));

console.log('== C3/C4 per seed (r45 panel; r44 panel for comparison) ==');
for (const s of SEEDS) {
  const d = panel[s], o = r44panel[s];
  console.log(`  ${s}: C3 ${d.c3.verdict} (starvation ${d.c3.starvationDeaths}, maxCrisisStreak ${d.c3.maxCrisisStreak}) | C4 ${d.c4.verdict} (convos ${d.c4.convos}, null ${d.c4.nullCount}, err ${d.c4.errorCount})` +
    (o ? ` | r44: C3 ${o.c3.verdict} (starv ${o.c3.starvationDeaths}, streak ${o.c3.maxCrisisStreak}), pantry ${o.guardrails.pantryKcal}, alive ${o.guardrails.popAlive}, tier ${o.guardrails.tier}` : '') +
    ` | r45 pantry ${d.guardrails.pantryKcal}, alive ${d.guardrails.popAlive}, tier ${d.guardrails.tier}`);
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

console.log('== P: preserved-food arm — closed in r43/r44, not re-run in r45 ==');

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
  // hurts (multi-hit days count). Player rows are excluded here: scholar
  // health flows through addHealth, not hurtVillager — the S section
  // below covers the player with the same window rule.
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

console.log('== S: scholar-crash coverage (addHealth funnel + player snap deltas) ==');
for (const s of SEEDS) {
  const d = panel[s];
  const sh = d.scholarHurtLog || [];
  const big = sh.filter(h => typeof h.amount === 'number' && h.amount <= -20);
  const byScene = {};
  for (const h of big) byScene[h.scene || '?'] = (byScene[h.scene || '?'] || 0) + 1;
  const sn = d.healthSnaps || [];
  const uncovered = [];
  for (let i = 1; i < sn.length; i++) {
    const a = sn[i - 1].health.player, b = sn[i].health.player;
    if (a != null && b != null && a - b >= 30) {
      const tot = sh.filter(h => h.day >= sn[i].day - 1 && h.day <= sn[i].day && typeof h.amount === 'number' && h.amount < 0).reduce((t, h) => t + (-h.amount), 0);
      if (tot < 20) uncovered.push({ day: sn[i].day, a, b, addHealthSum: tot });
    }
  }
  console.log(`  ${s}: scholarWrap=${d.scholarWrap} addHealth rows=${sh.length} big hits(<=-20)=${big.length} by scene ${JSON.stringify(byScene)} | player snap drops>=30 uncovered: ${uncovered.length} ${uncovered.length ? JSON.stringify(uncovered) : ''}`);
  for (const h of [...big].sort((a, b) => a.amount - b.amount).slice(0, 5)) console.log(`    big hit d${h.day} amount ${h.amount} scene=${h.scene} ${h.healthBefore}->${h.healthAfter}`);
  const heals = sh.filter(h => typeof h.amount === 'number' && h.amount > 0).length;
  console.log(`    addHealth heals (amount>0): ${heals}; damage rows: ${sh.length - heals}`);
}
console.log('== G: gossip attribution (double-winner lines vs _cxGossip log) ==');
for (const s of SEEDS) {
  let txt = '';
  try { txt = fs.readFileSync(path.join(EVID, `journey-establishment-r45-convo-seed${s}.txt`), 'utf8'); } catch (e) { console.log(`  ${s}: convo file missing`); continue; }
  const wins = {};
  let m;
  const re1 = /(\w+) won (.+?) on the cameras/g;
  const re2 = /I won (.+?)\. On camera/g;
  while ((m = re1.exec(txt))) { (wins[m[2]] = wins[m[2]] || new Set()).add(m[1]); }
  while ((m = re2.exec(txt))) { (wins[m[1]] = wins[m[1]] || new Set()).add('You'); }
  const d = panel[s];
  const gl = d.gossipLog || [];
  const wonLogs = gl.filter(g => g.how === 'won');
  console.log(`  ${s}: gossipWrap=${d.gossipWrap} gossipLog rows=${gl.length} (won ${wonLogs.length}) | won contests in log: ${JSON.stringify([...new Set(wonLogs.map(g => g.contest))])}`);
  if (!Object.keys(wins).length) { console.log(`    no won-gossip lines in held convos (G: no test case this seed)`); continue; }
  for (const show of Object.keys(wins)) {
    const winners = [...wins[show]];
    const logs = wonLogs.filter(g => String(g.contest || '').toLowerCase() === show.toLowerCase());
    const pids = [...new Set(logs.map(g => g.pid))];
    const names = [...new Set(logs.map(g => (g.name || '').split(' ')[0]))];
    const verdict = winners.length >= 2 ? (pids.length >= 2 ? 'CO-WINNERS (r44 hypothesis holds)' : (pids.length === 1 ? 'DOUBLE-COUNT SUSPECT (1 pid, 2 convo winners)' : 'UNRESOLVED (no matching log entries)')) : 'single-winner (no test)';
    console.log(`    show "${show}": convo winners [${winners.join(', ')}] (${winners.length}) | log won entries ${logs.length}, distinct pids ${pids.length} [${pids.join(', ')}], names [${names.join(', ')}] -> ${verdict}`);
  }
}
console.log('== L: landing-carry watch (d14 pantry + starvation d14-28; r58 proposal) ==');
for (const s of SEEDS) {
  const d = panel[s];
  const tr = d.pantryTrace || [];
  const r14 = tr.find(r => r.day === 14) || tr[0] || null;
  const starv1428 = (d.deaths || []).filter(x => x.day >= 14 && x.day <= 28 && /starvat|hunger|thirst/.test(String(x.cause || '')));
  console.log(`  ${s}: d14 pantry ${r14 ? r14.pantryKcal : '?'} alive ${r14 ? r14.alive : '?'} | starvation deaths d14-28: ${starv1428.length} ${JSON.stringify(starv1428)} | end pantry ${d.guardrails.pantryKcal}`);
}
console.log('== ARRIVALS (noteArrivals instrument; r44: 0/4) ==');
for (const s of SEEDS) {
  const d = panel[s];
  console.log(`  ${s}: arrivals ${d.guardrails.arrivals} (list ${(d.arrivals || []).length}) hunter ${(d.hunterArrivals || []).length} hunting-guide ${(d.huntingGuideArrivals || []).length} ${(d.arrivals || []).map(a => a.name + '(' + a.occ + ' d' + a.day + ')').join(', ')}`);
}
console.log('== B (betrayal probe) ==');
for (const s of SEEDS) {
  try {
    const p = load(`journey-establishment-r45-betrayal-seed${s}.json`);
    console.log(`  ${s}: ${p.verdict}${p.found ? ' ' + p.found.name : ''}`);
  } catch (e) { console.log(`  ${s}: probe file missing`); }
}
