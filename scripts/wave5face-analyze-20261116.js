// wave5face-analyze-20261116.js — wave-5 facing analyzer (arm
// sim-wave5face-b). PURE over the per-seed corpus: deterministic, two
// runs byte-identical on the same corpus (no Date, no Math.random, no
// file mtimes in the output). Base per-seed pin/release classification
// reuses scripts/stand199-analyze-20261116.js (analyzeSeed); this file
// adds the arm's own questions: the facing table (per released seed:
// release day, first-faced day or never, engagements with outcomes,
// wave-5 kills, fate by d200), the wall numbers (engagement-based
// facing beside kill-based facing), the OFF-vs-ON neutrality check (D2
// full-band, with the new w5 daily-signature fields), and the 150d-prefix
// comparison against the committed stand199 ON corpus (the 150d
// reference — per seed: identical, or first divergence day + fields).
// Usage:
//   node scripts/wave5face-analyze-20261116.js <on-dir> <off-dir> [out.json]
// Prints the summary JSON to stdout and, when out.json is given,
// writes the full summary there.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const STAND199 = require(path.join(__dirname, 'stand199-analyze-20261116'));
const BASE_AN = require(path.join(__dirname, 'standing199-analyze-20261110'));

function medianStd(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}

function dedupeDaily(daily) {
  const seen = {};
  const out = [];
  for (const s of (daily || [])) {
    if (seen[s.day] != null) out[seen[s.day]] = s;
    else { seen[s.day] = out.length; out.push(s); }
  }
  return out;
}

// analyzeSeed: stand199 base classification + this arm's facing fields.
function analyzeSeed(seedData) {
  const deduped = Object.assign({}, seedData, { daily: dedupeDaily(seedData.daily || []) });
  const base = STAND199.analyzeSeed(deduped);
  const engs = (seedData.engagements || []).slice().sort(function (a, b) { return (a.day - b.day) || (a.mid < b.mid ? -1 : 1); });
  const outcomeCounts = { killed: 0, fled: 0, died: 0 };
  for (const e of engs) if (outcomeCounts[e.outcome] != null) outcomeCounts[e.outcome]++;
  const firstFacedDay = engs.length ? Math.min.apply(null, engs.map(function (e) { return e.day; })) : null;
  const faced = engs.length > 0;
  const endSnap = deduped.daily[deduped.daily.length - 1] || null;
  return Object.assign(base, {
    engagements: engs,
    engagementCount: engs.length,
    outcomeCounts: outcomeCounts,
    firstFacedDay: firstFacedDay,
    faced: faced,
    w5facedCount: (seedData.w5facedCount | 0) || 0,
    w5facedIds: seedData.w5facedIds || [],
    facingReconcileMismatch: !!(seedData.facingReconcile && seedData.facingReconcile.mismatch),
    endScaleRank: endSnap ? (endSnap.scaleRank || null) : null,
    endGated: endSnap ? (endSnap.gated != null ? endSnap.gated : null) : null,
    endRaw: (endSnap && endSnap.standing) ? endSnap.standing.total : null,
  });
}

function dedupeSig(rows) {
  const byDay = {};
  const order = [];
  for (const r of rows || []) {
    if (byDay[r.day] == null) order.push(r.day);
    byDay[r.day] = r;
  }
  return order.sort(function (a, b) { return a - b; }).map(function (d) { return byDay[d]; });
}

const SIG_FIELDS = ['living', 'pantryKcal', 'gated', 'raw', 'war', 'diplomacy', 'plenty', 'capped', 'peakWave', 'scaleRank', 'nationalLive', 'w5facedCount'];
function compareLegs(onData, offData) {
  const errs = [];
  const onSig = dedupeSig(onData.dailySig || []);
  const offSig = dedupeSig(offData.dailySig || []);
  if (onSig.length !== offSig.length) errs.push('sig-length: on ' + onSig.length + ' vs off ' + offSig.length);
  const n = Math.min(onSig.length, offSig.length);
  let divs = 0;
  for (let i = 0; i < n; i++) {
    const a = onSig[i], b = offSig[i];
    if (a.day !== b.day) { errs.push('sig-day d' + a.day + ' vs d' + b.day); divs++; continue; }
    for (const f of SIG_FIELDS) {
      if (a[f] !== b[f]) { errs.push('sig-div d' + a.day + ' ' + f + ': on ' + JSON.stringify(a[f]) + ' vs off ' + JSON.stringify(b[f])); divs++; }
    }
    // w5facedIds compared as a sorted-id list (JSON).
    const ai = JSON.stringify((a.w5facedIds || []).slice().sort());
    const bi = JSON.stringify((b.w5facedIds || []).slice().sort());
    if (ai !== bi) { errs.push('sig-div d' + a.day + ' w5facedIds: on ' + ai + ' vs off ' + bi); divs++; }
  }
  const wallFields = ['days', 'standing', 'standingRaw', 'scaleRank', 'maxWave', 'w4kills', 'w3kills', 'w5kills'];
  for (const f of wallFields) {
    if (onData[f] !== offData[f]) { errs.push('wall-div ' + f + ': on ' + JSON.stringify(onData[f]) + ' vs off ' + JSON.stringify(offData[f])); divs++; }
  }
  const onDeaths = (onData.deaths || []).length, offDeaths = (offData.deaths || []).length;
  if (onDeaths !== offDeaths) { errs.push('wall-div deaths: on ' + onDeaths + ' vs off ' + offDeaths); divs++; }
  return { divergences: divs, errors: errs };
}

// compareToStand199: this run's ON-leg daily snapshots, days 1..150,
// against the committed stand199 ON corpus (the 150d reference).
// Per seed: days compared, identical?, first divergence day, and the
// diverging fields (with the day each first diverged). A divergence is
// a finding about the moved base (r140 policy + conversation changes),
// not an instrument failure — unless it is in a field the recorder
// itself writes.
const PREFIX_FIELDS = ['gated', 'raw', 'war', 'diplomacy', 'plenty', 'capped', 'living', 'peakWave', 'scaleRank', 'nationalLive'];
function compareToStand199(onData, refData) {
  const mine = dedupeDaily(onData.daily || []).filter(function (s) { return (s.day | 0) <= 150; });
  const ref = dedupeDaily(refData.daily || []).filter(function (s) { return (s.day | 0) <= 150; });
  const refByDay = {};
  ref.forEach(function (s) { refByDay[s.day] = s; });
  let compared = 0;
  let firstDivDay = null;
  const fieldFirstDiv = {};
  for (const s of mine) {
    const r = refByDay[s.day];
    if (!r) continue;
    compared++;
    const vals = {
      gated: s.gated, raw: s.standing ? s.standing.total : null,
      war: s.standing ? s.standing.war : null,
      diplomacy: s.standing ? s.standing.diplomacy : null,
      plenty: s.standing ? s.standing.plenty : null,
      capped: s.capped, living: s.living, peakWave: s.peakWave,
      scaleRank: s.scaleRank, nationalLive: s.nationalLive,
    };
    const rvals = {
      gated: r.gated, raw: r.standing ? r.standing.total : null,
      war: r.standing ? r.standing.war : null,
      diplomacy: r.standing ? r.standing.diplomacy : null,
      plenty: r.standing ? r.standing.plenty : null,
      capped: r.capped, living: r.living, peakWave: r.peakWave,
      scaleRank: r.scaleRank, nationalLive: r.nationalLive,
    };
    for (const f of PREFIX_FIELDS) {
      if (vals[f] !== rvals[f]) {
        if (firstDivDay == null) firstDivDay = s.day;
        if (fieldFirstDiv[f] == null) fieldFirstDiv[f] = { day: s.day, mine: vals[f], ref: rvals[f] };
      }
    }
  }
  return {
    seed: onData.seed, daysCompared: compared, refDays: ref.length,
    identical: firstDivDay == null,
    firstDivergenceDay: firstDivDay,
    divergingFields: fieldFirstDiv,
  };
}

function main() {
  const onDir = process.argv[2];
  const offDir = process.argv[3];
  const outFile = process.argv[4] || null;
  if (!onDir || !offDir) { console.error('WAVE5FACE ANALYZE STOP: on-dir and off-dir required.'); process.exit(2); }
  const refDir = process.env.STAND199_REF_DIR || path.join(REPO, 'evidence', '2026-11-16', 'perseed-stand199-b-on');
  const onFiles = fs.readdirSync(onDir).filter(function (f) { return f.indexOf('wave5face-b-s') === 0 && f.endsWith('.json'); }).sort();
  const offFiles = fs.readdirSync(offDir).filter(function (f) { return f.indexOf('wave5face-b-s') === 0 && f.endsWith('.json'); }).sort();
  const seeds = onFiles.map(function (f) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(onDir, f), 'utf8'))); });
  const offBySeed = {};
  for (const f of offFiles) {
    const d = JSON.parse(fs.readFileSync(path.join(offDir, f), 'utf8'));
    offBySeed[d.seed] = d;
  }
  let d2 = { divergences: 0, errors: [] };
  for (const f of onFiles) {
    const onData = JSON.parse(fs.readFileSync(path.join(onDir, f), 'utf8'));
    const offData = offBySeed[onData.seed];
    if (!offData) { d2.errors.push('missing OFF leg for seed ' + onData.seed); d2.divergences++; continue; }
    const c = compareLegs(onData, offData);
    d2.divergences += c.divergences;
    d2.errors = d2.errors.concat(c.errors);
  }
  // 150d-prefix comparison vs the committed stand199 ON corpus.
  const prefix = [];
  for (const f of onFiles) {
    const onData = JSON.parse(fs.readFileSync(path.join(onDir, f), 'utf8'));
    const refFile = path.join(refDir, 'stand199-b-s' + onData.seed + '-stand199-b-pilot-on.json');
    if (!fs.existsSync(refFile)) { prefix.push({ seed: onData.seed, daysCompared: 0, refDays: 0, identical: false, firstDivergenceDay: null, divergingFields: {}, note: 'no stand199 ref file' }); continue; }
    const refData = JSON.parse(fs.readFileSync(refFile, 'utf8'));
    prefix.push(compareToStand199(onData, refData));
  }
  const byClass = {};
  for (const s of seeds) byClass[s.class] = (byClass[s.class] || 0) + 1;
  const released = seeds.filter(function (s) { return s.class === 'released'; });
  const facingTable = released.map(function (s) {
    return {
      seed: s.seed, releaseDay: s.releaseDay, faced: s.faced,
      firstFacedDay: s.firstFacedDay, engagements: s.engagements,
      outcomeCounts: s.outcomeCounts, w5kills: s.w5kills | 0,
      days: s.days, villageLost: !!s.villageLost,
      endScaleRank: s.endScaleRank, endGated: s.endGated, endRaw: s.endRaw,
      daysFromReleaseToFirstFace: (s.firstFacedDay != null && s.releaseDay != null) ? (s.firstFacedDay - s.releaseDay) : null,
    };
  });
  const daysSorted = seeds.map(function (s) { return s.days; });
  const totalDeaths = seeds.reduce(function (a, s) { return a + s.deaths; }, 0);
  const allCauses = {};
  for (const s of seeds) for (const k of Object.keys(s.deathCauses || {})) allCauses[k] = (allCauses[k] || 0) + s.deathCauses[k];
  const totalEngagements = seeds.reduce(function (a, s) { return a + s.engagementCount; }, 0);
  const outcomeTotals = { killed: 0, fled: 0, died: 0 };
  for (const s of seeds) for (const k of Object.keys(outcomeTotals)) outcomeTotals[k] += (s.outcomeCounts[k] || 0);
  const summary = {
    seeds: seeds,
    classes: byClass,
    facingTable: facingTable,
    releasedSeeds: released.map(function (s) { return s.seed; }),
    releasedCount: released.length,
    facedAmongReleased: released.filter(function (s) { return s.faced; }).length,
    neverFacedReleased: released.filter(function (s) { return !s.faced; }).map(function (s) { return s.seed; }),
    prefix150: prefix,
    prefixIdentical: prefix.filter(function (p) { return p.identical; }).length,
    d2: { divergences: d2.divergences, errors: d2.errors.slice(0, 50), errorCount: d2.errors.length },
    wall: {
      won: seeds.filter(function (s) { return s.won; }).length,
      nationalByStanding: seeds.filter(function (s) { return (s.peakGated | 0) >= 200; }).length,
      nationalByRank: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      nationalEver: seeds.filter(function (s) { return s.nationalEver; }).length,
      table: 0, // the table is not instrumented by this arm; not guessed
      wave4: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
      // Faced = a wave-5 engagement recorded (fought blow-by-blow).
      // wave5facedKills = the stand199 kill-based count, for continuity.
      wave5faced: seeds.filter(function (s) { return s.faced; }).length,
      wave5facedKills: seeds.filter(function (s) { return (s.w5kills | 0) > 0; }).length,
      totalEngagements: totalEngagements,
      outcomeTotals: outcomeTotals,
      medianDays: medianStd(daysSorted),
      maxDays: daysSorted.length ? Math.max.apply(null, daysSorted) : null,
      survived: seeds.filter(function (s) { return !s.villageLost; }).length,
      totalDeaths: totalDeaths,
      deathCauses: allCauses,
      totalW4kills: seeds.reduce(function (a, s) { return a + ((s.w4kills | 0) || 0); }, 0),
      totalW5kills: seeds.reduce(function (a, s) { return a + ((s.w5kills | 0) || 0); }, 0),
      totalPin199Days: seeds.reduce(function (a, s) { return a + s.pin199Days; }, 0),
    },
    instrumentErrors: seeds.reduce(function (a, s) { return a + s.instrumentErrors; }, 0),
    reconcileErrors: seeds.reduce(function (a, s) { return a + s.reconcileErrors.length; }, 0),
    reconcileMismatches: seeds.filter(function (s) { return s.facingReconcileMismatch; }).map(function (s) { return s.seed; }),
    unclassified: seeds.filter(function (s) { return s.class === 'unclassified'; }).map(function (s) { return s.seed; }),
  };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
module.exports = {
  analyzeSeed: analyzeSeed, compareLegs: compareLegs,
  compareToStand199: compareToStand199, medianStd: medianStd, dedupeSig: dedupeSig,
};
