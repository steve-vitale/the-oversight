// standing199-analyze-20261110.js — standing-199 plateau read analyzer
// (arm sim-standing199-a). PURE over the per-seed corpus: deterministic,
// two runs byte-identical on the same corpus (no Date, no Math.random,
// no file mtimes in the output). Classification rule is the prereg's
// (precedence: released > defer5 / plenty-cap / mixed-199 by first-pin
// kind > defer4-pin > standing-short; unclassified = failure).
// Hold kinds recompute per snapshot via INST.holdKind (the
// villageStandingTotal() logic); the gated value cross-checks it:
// gated == 199 on a day ⟺ a 199-hold recomputes that day.
// Usage:
//   node scripts/standing199-analyze-20261110.js <perseed-dir> [out.json]
// Prints the per-seed table + wall numbers as JSON to stdout and, when
// out.json is given, writes the full summary there.
'use strict';
const fs = require('fs');
const path = require('path');
const INST = require(path.join(__dirname, 'standing199-instrument-20261110'));

function barsMet(rd) {
  if (!rd || !rd.demand) return null;
  const dem = rd.demand;
  let met = 0;
  if ((rd.armored | 0) >= (dem.armored | 0)) met++;
  if ((rd.armed | 0) >= (dem.armed | 0)) met++;
  if ((rd.tricks | 0) >= (dem.tricks | 0)) met++;
  if ((rd.veterans | 0) >= (dem.veterans | 0)) met++;
  return met;
}

function analyzeSeed(seedData) {
  const daily = seedData.daily || [];
  const errs = [];
  let peakRaw = -Infinity, peakRawDay = null, peakGated = -Infinity, peakGatedDay = null;
  let peakWave = 0, releaseDay = null;
  const pin199 = []; // {day, kind, rd5, raw, capped}
  const pin99 = [];
  let readyDays5 = 0, readyDays4 = 0;
  let maxBars5 = 0, days3of4 = 0, daysVet1 = 0, daysVet2ShortOther = 0;
  let firstPin199 = null;
  let gatedMismatch = 0;
  const veteranDeaths = []; // {vid, day} — a living veteran vid vanishing
  let prevVets = null;
  let prevSnap = null;
  for (const s of daily) {
    const raw = s.standing ? (s.standing.total | 0) : null;
    const gated = (s.gated != null) ? (s.gated | 0) : null;
    if (raw != null && raw > peakRaw) { peakRaw = raw; peakRawDay = s.day; }
    if (gated != null && gated > peakGated) { peakGated = gated; peakGatedDay = s.day; }
    const pw = (s.peakWave | 0) || 0;
    if (pw > peakWave) { peakWave = pw; if (pw >= 5 && releaseDay == null) releaseDay = s.day; }
    // Reconciliation: raw == war + diplomacy + plenty; capped == war +
    // diplomacy + min(plenty, 100); gated == 199 ⟺ a 199-hold recomputes.
    if (s.standing) {
      const sum = ((s.standing.war | 0) + (s.standing.diplomacy | 0) + (s.standing.plenty | 0));
      if (sum !== raw) errs.push('reconcile-raw d' + s.day + ': ' + sum + ' != ' + raw);
      if (s.capped != null) {
        const capSum = ((s.standing.war | 0) + (s.standing.diplomacy | 0) + Math.min(s.standing.plenty | 0, 100));
        if (capSum !== (s.capped | 0)) errs.push('reconcile-capped d' + s.day + ': ' + capSum + ' != ' + s.capped);
      }
    }
    const kind = INST.holdKind(s);
    if (gated === 199 && kind !== 'cap' && kind !== 'defer5') {
      gatedMismatch++;
      errs.push('gated-199-no-hold d' + s.day + ' kind=' + kind + ' raw=' + raw + ' capped=' + s.capped);
    }
    if (gated === 199) {
      pin199.push({ day: s.day, kind: kind, raw: raw, capped: s.capped, rd5: s.readiness5 ? { armored: s.readiness5.armored, armed: s.readiness5.armed, tricks: s.readiness5.tricks, veterans: s.readiness5.veterans, short: (s.readiness5.short || []).slice() } : null });
      if (!firstPin199) firstPin199 = pin199[pin199.length - 1];
    }
    if (gated === 99) pin99.push({ day: s.day, kind: kind, rd4: s.readiness4 ? { armored: s.readiness4.armored, armed: s.readiness4.armed, tricks: s.readiness4.tricks, veterans: s.readiness4.veterans, short: (s.readiness4.short || []).slice() } : null });
    if (s.readiness5 && s.readiness5.ready) readyDays5++;
    if (s.readiness4 && s.readiness4.ready) readyDays4++;
    const bm = barsMet(s.readiness5);
    if (bm != null) {
      if (bm > maxBars5) maxBars5 = bm;
      if (bm === 3) days3of4++;
      if (s.readiness5 && (s.readiness5.veterans | 0) === 1) daysVet1++;
      if (s.readiness5 && (s.readiness5.veterans | 0) >= 2 && !s.readiness5.ready) daysVet2ShortOther++;
    }
    // Veteran deaths: a vid in yesterday's living-veteran set, gone today.
    const vets = s.veteranVids || [];
    if (prevVets) {
      for (const vid of prevVets) {
        if (vets.indexOf(vid) === -1) veteranDeaths.push({ vid: vid, day: s.day });
      }
    }
    prevVets = vets;
    prevSnap = s;
  }
  const endSnap = daily[daily.length - 1] || null;
  const endRaw = endSnap && endSnap.standing ? (endSnap.standing.total | 0) : null;
  const peakSnap = peakRawDay != null ? daily.find(function (s) { return s.day === peakRawDay; }) : null;
  // Decay decomposition: source deltas between peak-raw day and end.
  let decay = null;
  if (peakSnap && endSnap && peakRaw != null && endRaw != null && (peakRaw - endRaw) >= 50) {
    decay = {
      peakRaw: peakRaw, peakDay: peakRawDay, endRaw: endRaw, drop: peakRaw - endRaw,
      warDelta: ((endSnap.standing.war | 0) - (peakSnap.standing.war | 0)),
      diplomacyDelta: ((endSnap.standing.diplomacy | 0) - (peakSnap.standing.diplomacy | 0)),
      plentyDelta: ((endSnap.standing.plenty | 0) - (peakSnap.standing.plenty | 0)),
    };
  }
  // Classification (prereg precedence).
  const capDays = pin199.filter(function (p) { return p.kind === 'cap'; }).length;
  const defer5Days = pin199.filter(function (p) { return p.kind === 'defer5'; }).length;
  let cls = null, binding = null;
  if (peakWave >= 5) {
    cls = 'released';
    binding = 'none (released d' + releaseDay + ')';
  } else if (pin199.length > 0) {
    if (capDays > 0 && defer5Days > 0) { cls = 'mixed-199'; binding = 'mixed cap ' + capDays + 'd / defer5 ' + defer5Days + 'd (first-pin ' + firstPin199.kind + ')'; }
    else if (firstPin199.kind === 'cap') { cls = 'plenty-cap'; binding = 'plenty-cap (' + capDays + 'd pinned)'; }
    else if (firstPin199.kind === 'defer5') {
      cls = 'defer5';
      const short0 = firstPin199.rd5 ? (firstPin199.rd5.short || []).join('+') : '?';
      binding = 'defer5 short[' + short0 + '] at first pin';
    } else { cls = 'unclassified'; binding = 'pin199 with kind ' + firstPin199.kind; }
  } else if (pin99.length > 0) {
    cls = 'defer4-pin';
    const short0 = pin99[0].rd4 ? (pin99[0].rd4.short || []).join('+') : '?';
    binding = 'defer4 short[' + short0 + '] (' + pin99.length + 'd pinned at 99)';
  } else if (peakRaw < 200) {
    cls = 'standing-short';
    const ps = peakSnap && peakSnap.standing ? peakSnap.standing : null;
    binding = ps ? ('peak raw ' + peakRaw + ' = war ' + ps.war + ' + bonds ' + ps.diplomacy + ' + bread ' + ps.plenty) : ('peak raw ' + peakRaw);
  } else {
    cls = 'unclassified';
    binding = 'peak raw ' + peakRaw + ' >= 200 with no 199 pin and no release';
  }
  // Death-cause shares from the memorial roll.
  const causes = {};
  let deaths = 0;
  const mem = seedData.memorial || [];
  for (const m of mem) { deaths++; causes[m.cause || 'the wild'] = (causes[m.cause || 'the wild'] || 0) + 1; }
  return {
    seed: seedData.seed, days: seedData.days, endReason: seedData.endReason,
    won: !!seedData.won, scaleRank: seedData.scaleRank || null,
    maxWave: seedData.maxWave, unlockedWave: seedData.unlockedWave,
    peakRaw: peakRaw, peakRawDay: peakRawDay, peakGated: peakGated, peakGatedDay: peakGatedDay,
    endRaw: endRaw, peakWave: peakWave, releaseDay: releaseDay,
    pin199Days: pin199.length, pin99Days: pin99.length,
    firstPin199Day: firstPin199 ? firstPin199.day : null,
    firstPin199Kind: firstPin199 ? firstPin199.kind : null,
    capDays: capDays, defer5Days: defer5Days,
    firstPinShort: firstPin199 && firstPin199.rd5 ? (firstPin199.rd5.short || []).slice() : null,
    firstPinBars: firstPin199 && firstPin199.rd5 ? { armored: firstPin199.rd5.armored, armed: firstPin199.rd5.armed, tricks: firstPin199.rd5.tricks, veterans: firstPin199.rd5.veterans } : null,
    readyDays5: readyDays5, readyDays4: readyDays4,
    maxBars5: maxBars5, days3of4: days3of4, daysVet1: daysVet1, daysVet2ShortOther: daysVet2ShortOther,
    veteranDeaths: veteranDeaths,
    decay: decay,
    endStanding: endSnap && endSnap.standing ? { war: endSnap.standing.war, diplomacy: endSnap.standing.diplomacy, plenty: endSnap.standing.plenty, ledger: endSnap.ledger || null, feastsQual: endSnap.feasts ? endSnap.feasts.qualifying : null } : null,
    peakStanding: peakSnap && peakSnap.standing ? { war: peakSnap.standing.war, diplomacy: peakSnap.standing.diplomacy, plenty: peakSnap.standing.plenty, ledger: peakSnap.ledger || null, feastsQual: peakSnap.feasts ? peakSnap.feasts.qualifying : null } : null,
    class: cls, binding: binding,
    deaths: deaths, deathCauses: causes,
    instrumentErrors: (seedData.instrumentErrors || []).length,
    reconcileErrors: errs,
    gatedMismatch: gatedMismatch,
    snapshots: daily.length,
  };
}

function main() {
  const dir = process.argv[2];
  const outFile = process.argv[3] || null;
  if (!dir) { console.error('STANDING199 ANALYZE STOP: perseed dir required.'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('standing199-s') === 0 && f.endsWith('.json'); }).sort();
  const seeds = files.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); });
  const byClass = {};
  for (const s of seeds) byClass[s.class] = (byClass[s.class] || 0) + 1;
  const daysSorted = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const medianDays = daysSorted.length ? daysSorted[Math.floor(daysSorted.length / 2)] : null;
  const totalDeaths = seeds.reduce(function (a, s) { return a + s.deaths; }, 0);
  const allCauses = {};
  for (const s of seeds) for (const k of Object.keys(s.deathCauses)) allCauses[k] = (allCauses[k] || 0) + s.deathCauses[k];
  const summary = {
    seeds: seeds,
    classes: byClass,
    wall: {
      won: seeds.filter(function (s) { return s.won; }).length,
      national: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      table: 0, // the table is not instrumented by this arm; not guessed
      wave4: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
      medianDays: medianDays,
      maxDays: daysSorted.length ? daysSorted[daysSorted.length - 1] : null,
      totalDeaths: totalDeaths,
      deathCauses: allCauses,
    },
    instrumentErrors: seeds.reduce(function (a, s) { return a + s.instrumentErrors; }, 0),
    reconcileErrors: seeds.reduce(function (a, s) { return a + s.reconcileErrors.length; }, 0),
    unclassified: seeds.filter(function (s) { return s.class === 'unclassified'; }).map(function (s) { return s.seed; }),
  };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeSeed: analyzeSeed, barsMet: barsMet };
