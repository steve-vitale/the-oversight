#!/usr/bin/env node
// analyze-racksvoice-gate-b.js — paired baseline-vs-variant tables,
// GO evaluation against the pre-registered bars in
// evidence/2026-10-26/sim-racksvoice-gate-b.md, and the B+C risk count.
// Usage: node scripts/analyze-racksvoice-gate-b.js <corpus-dir>
// Corpus files: racksvoice-gate-b-<base|B|C|BC>[-confirm]-pd0-dg1-leadfeast-s<seed>.json
// (SWEEP_CENSUS compact records: racksFullDetail = [{day,cook,kcal}]).
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: analyze-racksvoice-gate-b.js <corpus-dir>'); process.exit(2); }

function loadAll() {
  const out = {}; // variant -> seed -> record
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const m = f.match(/^racksvoice-gate-b-(base|B|C|BC)(-confirm)?-pd0-dg1-leadfeast-s(\d+)\.json$/);
    if (!m) continue;
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const key = m[1] + (m[2] ? '-confirm' : '');
    (out[key] = out[key] || {})[parseInt(m[3], 10)] = rec;
  }
  return out;
}

// Simulate a variant rule over a BASELINE detail sequence (in order).
// Returns kept detail array. Cross-checks the implemented gate.
function simulate(detail, rule) {
  const kept = [];
  let lastDay = null, lastKcal = null;
  for (const d of detail) {
    if (rule === 'B') {
      if (lastDay !== d.day) { lastDay = d.day; kept.push(d); }
    } else if (rule === 'C') {
      if (lastKcal !== d.kcal) { lastKcal = d.kcal; kept.push(d); }
    } else if (rule === 'BC') {
      if (lastDay !== d.day && lastKcal !== d.kcal) { lastDay = d.day; lastKcal = d.kcal; kept.push(d); }
    }
  }
  return kept;
}

// B+C risk: baseline events where a figure moved vs the last SPOKEN
// figure but the day already had a voice (so BC silences a moved figure).
function bcRiskEvents(detail) {
  let lastDay = null, lastKcal = null, events = 0;
  const days = new Set();
  for (const d of detail) {
    if (lastDay !== d.day && lastKcal !== d.kcal) { lastDay = d.day; lastKcal = d.kcal; }
    else if (lastDay === d.day && lastKcal !== d.kcal) { events += 1; days.add(d.day); }
  }
  return { events, days: days.size };
}

function distinctDays(detail) { return new Set(detail.map(d => d.day)).size; }
function distinctKcal(detail) { return new Set(detail.map(d => d.kcal)).size; }
function consecEqual(detail) {
  let n = 0;
  for (let i = 1; i < detail.length; i++) if (detail[i].kcal === detail[i - 1].kcal) n += 1;
  return n;
}
function sameDayMultiFigureDays(detail) {
  const byDay = {};
  for (const d of detail) (byDay[d.day] = byDay[d.day] || new Set()).add(d.kcal);
  return Object.keys(byDay).filter(d => byDay[d].size >= 2).length;
}
function numerics(rec) {
  return [rec.daysAlive, rec.preserveVillagerBatches, rec.preserveVillagerResolutions,
    rec.deaths, rec.rank, rec.national, JSON.stringify(rec.waveReach)].join('|');
}

const data = loadAll();
const variants = Object.keys(data).sort();
console.log('variants found: ' + variants.join(', '));
for (const v of variants) console.log('  ' + v + ' seeds: ' + Object.keys(data[v]).sort((a, b) => a - b).join(','));

function reportSet(baseKey, varKeys) {
  const base = data[baseKey];
  if (!base) { console.log('NO BASELINE ' + baseKey); return; }
  const seeds = Object.keys(base).sort((a, b) => a - b);
  console.log('\n=== ' + baseKey + ' vs ' + varKeys.join(',') + ' ===');
  console.log('seed | base rf/plain/say | ' + varKeys.map(v => v + ' rf/plain/say').join(' | '));
  const totals = {};
  for (const v of [baseKey].concat(varKeys)) totals[v] = { rf: 0, plain: 0, say: 0 };
  for (const s of seeds) {
    const b = base[s];
    const row = [s, `${b.racksFullLines}/${b.plainLines}/${b.sayTotal}`];
    for (const v of varKeys) {
      const r = (data[v] || {})[s];
      if (!r) { row.push('MISSING'); continue; }
      row.push(`${r.racksFullLines}/${r.plainLines}/${r.sayTotal}`);
      totals[v].rf += r.racksFullLines; totals[v].plain += r.plainLines; totals[v].say += r.sayTotal;
    }
    totals[baseKey].rf += b.racksFullLines; totals[baseKey].plain += b.plainLines; totals[baseKey].say += b.sayTotal;
    console.log(row.join(' | '));
  }
  console.log('TOTAL | ' + [baseKey].concat(varKeys).map(v => `${v} ${totals[v].rf}/${totals[v].plain}/${totals[v].say}`).join(' | '));
  // Numerics identity guard
  let guardFail = 0;
  for (const v of varKeys) {
    for (const s of seeds) {
      const r = (data[v] || {})[s];
      if (!r) { console.log(`GUARD MISSING ${v} s${s}`); guardFail += 1; continue; }
      if (numerics(r) !== numerics(base[s])) { console.log(`GUARD FAIL ${v} s${s}: base=${numerics(base[s])} var=${numerics(r)}`); guardFail += 1; }
      if (r.preserveVillagerResolutions !== r.workedLines) { console.log(`GUARD worked!=res ${v} s${s}`); guardFail += 1; }
      if (r.sayTotal !== r.racksFullLines + r.plainLines + r.workedLines) { console.log(`GUARD say!=sum ${v} s${s}`); guardFail += 1; }
    }
  }
  console.log('numerics-identity guard failures: ' + guardFail);
  // Structural cross-checks: simulation vs actual variant corpora
  for (const v of ['B', 'C', 'BC']) {
    if (!varKeys.includes(v)) continue;
    let mismatch = 0;
    for (const s of seeds) {
      const b = base[s], r = (data[v] || {})[s];
      if (!b || !r) continue;
      const sim = simulate(b.racksFullDetail || [], v);
      const act = r.racksFullDetail || [];
      const same = sim.length === act.length && sim.every((d, i) => d.day === act[i].day && d.kcal === act[i].kcal);
      if (!same) { console.log(`SIM MISMATCH ${v} s${s}: sim=${sim.length} actual=${act.length}`); mismatch += 1; }
    }
    console.log(`simulation-vs-actual ${v}: mismatches=${mismatch}`);
  }
  // GO evaluation (pilot bars; confirm set reuses same shape, judged separately)
  const tot = v => totals[v] ? totals[v].rf : null;
  const b9757 = base[9757] ? base[9757].racksFullLines : null;
  const v9757 = v => (data[v] || {})[9757] ? data[v][9757].racksFullLines : null;
  const v9756 = v => (data[v] || {})[9756] ? data[v][9756].racksFullLines : null;
  const voiceDaysEq = v => seeds.every(s => distinctDays(((data[v] || {})[s] || {}).racksFullDetail || []) === distinctDays((base[s] || {}).racksFullDetail || []));
  const consecZero = v => seeds.every(s => consecEqual(((data[v] || {})[s] || {}).racksFullDetail || []) === 0);
  let risk = { events: 0, days: 0 };
  for (const s of seeds) risk = ((e) => ({ events: risk.events + e.events, days: risk.days + e.days }))(bcRiskEvents(base[s].racksFullDetail || []));
  console.log('B+C risk (baseline days where a moved figure is silenced after a voice spoke): events=' + risk.events + ' days=' + risk.days);
  console.log('same-day multi-figure baseline days (any seed): ' + seeds.map(s => sameDayMultiFigureDays(base[s].racksFullDetail || [])).reduce((a, b) => a + b, 0));
  if (varKeys.includes('B')) {
    const go = v9757('B') <= 60 && tot('B') <= 212 && voiceDaysEq('B');
    console.log(`GO B: 9757=${v9757('B')} (<=60) total=${tot('B')} (<=212) voiceDaysEq=${voiceDaysEq('B')} => ${go ? 'GO' : 'NO-GO'}`);
  }
  if (varKeys.includes('C')) {
    const go = tot('C') <= 150 && v9756('C') === 17 && consecZero('C');
    console.log(`GO C: total=${tot('C')} (<=150) 9756=${v9756('C')} (==17) consecZero=${consecZero('C')} => ${go ? 'GO' : 'NO-GO'}`);
  }
  if (varKeys.includes('BC')) {
    const go = tot('BC') <= 120 && v9757('BC') <= 35 && v9756('BC') === 17 && risk.events === 0;
    console.log(`GO BC: total=${tot('BC')} (<=120) 9757=${v9757('BC')} (<=35) 9756=${v9756('BC')} (==17) riskEvents=${risk.events} (==0) => ${go ? 'GO' : 'NO-GO'}`);
  }
  // Wall numbers (baseline set)
  const nat = seeds.filter(s => base[s].national).length;
  const wins = seeds.filter(s => base[s].win).length;
  const days = seeds.map(s => base[s].daysAlive).sort((a, b) => a - b);
  const med = days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
  console.log(`WALL (${baseKey}): national=${nat}/${seeds.length} table/wins=${wins}/${seeds.length} medianDays=${med} maxDays=${days[days.length - 1]} waves={` + seeds.map(s => base[s].waveReach.length).join(',') + '}');
  // Per-seed detail for evidence
  for (const s of seeds) {
    const b = base[s];
    const dd = b.racksFullDetail || [];
    console.log(`DETAIL s${s}: base rf=${b.racksFullLines} days=${distinctDays(dd)} distinctKcal=${distinctKcal(dd)} firstDay=${dd.length ? dd[0].day : '-'} lastDay=${dd.length ? dd[dd.length - 1].day : '-'}` + varKeys.map(v => ` ${v} rf=${((data[v] || {})[s] || {}).racksFullLines} days=${distinctDays(((data[v] || {})[s] || {}).racksFullDetail || [])} distinctKcal=${distinctKcal(((data[v] || {})[s] || {}).racksFullDetail || [])}`).join(''));
  }
}

reportSet('base', ['B', 'C', 'BC']);
if (data['base-confirm']) reportSet('base-confirm', ['BC-confirm', 'C-confirm', 'B-confirm'].filter(v => data[v]));
