// stand199-analyze-20261116.js — standing-199 stall analyzer
// (arm sim-stand199-b). PURE over the per-seed corpus: deterministic,
// two runs byte-identical on the same corpus (no Date, no Math.random,
// no file mtimes in the output). Base per-seed pin classification
// reuses scripts/standing199-analyze-20261110.js (analyzeSeed); this
// file adds the arm's own questions: per-contribution last-gain days
// (which contribution stops, when), the released-vs-pinned contribution
// comparison (H3), the national trust-lapse table vs the pin table
// (H4), and the OFF-vs-ON neutrality check (D2 full-band).
// Usage:
//   node scripts/stand199-analyze-20261116.js <on-dir> <off-dir> [out.json]
// Prints the summary JSON to stdout and, when out.json is given,
// writes the full summary there.
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = require(path.join(__dirname, 'standing199-analyze-20261110'));
const INST = require(path.join(__dirname, 'standing199-instrument-20261110'));

function medianStd(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}

// lastGainDays: for each contribution, the last day it increased and
// the days-at-plateau at end (end day - last-gain day). A contribution
// that never moved has lastGainDay null.
function contributionStops(daily) {
  const out = { war: null, diplomacy: null, plenty: null };
  const keys = ['war', 'diplomacy', 'plenty'];
  let prev = null;
  let endDay = null;
  for (const s of daily) {
    if (!s.standing) { prev = null; continue; }
    endDay = s.day;
    if (prev) {
      for (const k of keys) {
        if ((s.standing[k] | 0) > (prev[k] | 0)) out[k] = s.day;
      }
    }
    prev = s.standing;
  }
  const res = {};
  for (const k of keys) {
    res[k] = {
      lastGainDay: out[k],
      plateauDaysAtEnd: (out[k] == null) ? null : ((endDay | 0) - (out[k] | 0)),
      endValue: (daily.length && daily[daily.length - 1].standing) ? (daily[daily.length - 1].standing[k] | 0) : null,
    };
  }
  return res;
}

// nationalLapses: flips of nationalLive across the snapshot series,
// each with the lapsing link named from the link roll (trust crossing
// below 40, seasoned flag flipping, or the link vanishing).
function nationalLapses(daily) {
  const lapses = [];
  const restages = [];
  let prev = null;
  for (const s of daily) {
    const cur = !!s.nationalLive;
    if (prev && prev.nationalLive === true && cur === false) {
      let cause = 'unknown-link';
      try {
        const prevLinks = prev.links || [];
        const curLinks = s.links || [];
        const curByKey = {};
        curLinks.forEach(function (l) { curByKey[l.key] = l; });
        for (const pl of prevLinks) {
          const cl = curByKey[pl.key];
          if (!cl) { cause = 'link-vanished:' + pl.key + ' (trust ' + pl.trust + ')'; break; }
          if (pl.trust >= 40 && cl.trust < 40) { cause = 'trust-below-40:' + pl.key + ' (' + pl.trust + ' -> ' + cl.trust + ')'; break; }
          if (pl.seasoned && !cl.seasoned) { cause = 'unseasoned:' + pl.key + ' (trust ' + pl.trust + ')'; break; }
          if (pl.regional && !cl.regional) { cause = 'lost-regional:' + pl.key + ' (trust ' + pl.trust + ')'; break; }
        }
      } catch (e) { cause = 'read-error'; }
      lapses.push({ day: s.day, cause: cause });
    }
    if (prev && prev.nationalLive === false && cur === true) restages.push({ day: s.day });
    prev = s;
  }
  return { lapses: lapses, restages: restages };
}

function analyzeSeed(seedData) {
  // Dedupe daily snapshots by day (last wins): the driver's post-run
  // final snapshot can duplicate the last day, which would double-count
  // one pin day in the base classifier.
  const seen = {};
  const daily = [];
  for (const s of (seedData.daily || [])) {
    if (seen[s.day] != null) daily[seen[s.day]] = s;
    else { seen[s.day] = daily.length; daily.push(s); }
  }
  const deduped = Object.assign({}, seedData, { daily: daily });
  const base = BASE.analyzeSeed(deduped);
  const stops = contributionStops(daily);
  const nat = nationalLapses(daily);
  const pinDays = new Set();
  for (const s of daily) if ((s.gated | 0) === 199) pinDays.add(s.day);
  const nationalDays = new Set();
  for (const s of daily) if (s.nationalLive) nationalDays.add(s.day);
  const lapsesWhilePinned = nat.lapses.filter(function (l) { return pinDays.has(l.day); }).length;
  const lapsesWhileReleased = nat.lapses.filter(function (l) { return (base.releaseDay != null) && l.day >= base.releaseDay; }).length;
  const nationalEver = nationalDays.size > 0;
  // First-pin-day growth: was each contribution still growing on the
  // first-pin day (last-gain day >= first-pin day)?
  const fp = base.firstPin199Day;
  const growthAtPin = {};
  if (fp != null) {
    for (const k of ['war', 'diplomacy', 'plenty']) {
      growthAtPin[k] = (stops[k].lastGainDay != null) && (stops[k].lastGainDay >= fp);
    }
  }
  const endSnap = daily[daily.length - 1] || null;
  const peakSnap = base.peakRawDay != null ? daily.find(function (s) { return s.day === base.peakRawDay; }) : null;
  return Object.assign(base, {
    w3kills: seedData.w3kills | 0, w4kills: seedData.w4kills | 0, w5kills: seedData.w5kills | 0,
    villageLost: !!seedData.villageLost,
    contributionStops: stops,
    growthAtFirstPin: (fp != null) ? growthAtPin : null,
    nationalEver: nationalEver,
    nationalDays: nationalDays.size,
    lapses: nat.lapses,
    restages: nat.restages,
    lapseCount: nat.lapses.length,
    restageCount: nat.restages.length,
    lapsesWhilePinned: lapsesWhilePinned,
    lapsesWhileReleased: lapsesWhileReleased,
    endSplit: endSnap && endSnap.standing ? { war: endSnap.standing.war, diplomacy: endSnap.standing.diplomacy, plenty: endSnap.standing.plenty } : null,
    peakSplit: peakSnap && peakSnap.standing ? { war: peakSnap.standing.war, diplomacy: peakSnap.standing.diplomacy, plenty: peakSnap.standing.plenty } : null,
    endNationalLive: endSnap ? !!endSnap.nationalLive : null,
    endScaleRank: endSnap ? (endSnap.scaleRank || null) : null,
    sayLines: (seedData.standSays || []).map(function (r) { return { day: r.day, line: r.line }; }),
  });
}

// dedupeSig: one row per day (last wins) — the ON leg's post-run final
// snapshot can duplicate the last day.
function dedupeSig(rows) {
  const byDay = {};
  const order = [];
  for (const r of rows || []) {
    if (byDay[r.day] == null) order.push(r.day);
    byDay[r.day] = r;
  }
  return order.sort(function (a, b) { return a - b; }).map(function (d) { return byDay[d]; });
}

const SIG_FIELDS = ['living', 'pantryKcal', 'gated', 'raw', 'war', 'diplomacy', 'plenty', 'capped', 'peakWave', 'scaleRank', 'nationalLive'];
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
  }
  const wallFields = ['days', 'standing', 'standingRaw', 'scaleRank', 'maxWave', 'w4kills', 'w3kills', 'w5kills'];
  for (const f of wallFields) {
    if (onData[f] !== offData[f]) { errs.push('wall-div ' + f + ': on ' + JSON.stringify(onData[f]) + ' vs off ' + JSON.stringify(offData[f])); divs++; }
  }
  const onDeaths = (onData.deaths || []).length, offDeaths = (offData.deaths || []).length;
  if (onDeaths !== offDeaths) { errs.push('wall-div deaths: on ' + onDeaths + ' vs off ' + offDeaths); divs++; }
  return { divergences: divs, errors: errs };
}

function main() {
  const onDir = process.argv[2];
  const offDir = process.argv[3];
  const outFile = process.argv[4] || null;
  if (!onDir || !offDir) { console.error('STAND199 ANALYZE STOP: on-dir and off-dir required.'); process.exit(2); }
  const onFiles = fs.readdirSync(onDir).filter(function (f) { return f.indexOf('stand199-b-s') === 0 && f.endsWith('.json'); }).sort();
  const offFiles = fs.readdirSync(offDir).filter(function (f) { return f.indexOf('stand199-b-s') === 0 && f.endsWith('.json'); }).sort();
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
  const byClass = {};
  for (const s of seeds) byClass[s.class] = (byClass[s.class] || 0) + 1;
  const released = seeds.filter(function (s) { return s.class === 'released'; });
  const pinned = seeds.filter(function (s) { return s.class === 'defer5' || s.class === 'plenty-cap' || s.class === 'mixed-199'; });
  // H3: released-vs-pinned contribution comparison (best-day splits).
  function splitAvg(list, key) {
    if (!list.length) return null;
    const vs = list.map(function (s) { return (s.peakSplit && s.peakSplit[key]) | 0; });
    return { min: Math.min.apply(null, vs), max: Math.max.apply(null, vs), mean: vs.reduce(function (a, b) { return a + b; }, 0) / vs.length };
  }
  const h3 = {
    releasedN: released.length, pinnedN: pinned.length,
    releasedSplit: { war: splitAvg(released, 'war'), diplomacy: splitAvg(released, 'diplomacy'), plenty: splitAvg(released, 'plenty') },
    pinnedSplit: { war: splitAvg(pinned, 'war'), diplomacy: splitAvg(pinned, 'diplomacy'), plenty: splitAvg(pinned, 'plenty') },
    releasedPeakRaw: released.map(function (s) { return s.peakRaw; }),
    pinnedPeakRaw: pinned.map(function (s) { return s.peakRaw; }),
  };
  const daysSorted = seeds.map(function (s) { return s.days; });
  const totalDeaths = seeds.reduce(function (a, s) { return a + s.deaths; }, 0);
  const allCauses = {};
  for (const s of seeds) for (const k of Object.keys(s.deathCauses)) allCauses[k] = (allCauses[k] || 0) + s.deathCauses[k];
  const totalPinDays = seeds.reduce(function (a, s) { return a + s.pin199Days; }, 0);
  const totalCapDays = seeds.reduce(function (a, s) { return a + s.capDays; }, 0);
  const totalDefer5Days = seeds.reduce(function (a, s) { return a + s.defer5Days; }, 0);
  const totalLapses = seeds.reduce(function (a, s) { return a + s.lapseCount; }, 0);
  const summary = {
    seeds: seeds,
    classes: byClass,
    h3: h3,
    h4: {
      nationalEver: seeds.filter(function (s) { return s.nationalEver; }).length,
      nationalEnd: seeds.filter(function (s) { return s.endNationalLive; }).length,
      totalLapses: totalLapses,
      totalRestages: seeds.reduce(function (a, s) { return a + s.restageCount; }, 0),
      lapsesWhilePinned: seeds.reduce(function (a, s) { return a + s.lapsesWhilePinned; }, 0),
      lapsesWhileReleased: seeds.reduce(function (a, s) { return a + s.lapsesWhileReleased; }, 0),
      // H4 separates iff some seed pins without lapsing, or lapses
      // without pinning (or lapses while released).
      separates: seeds.some(function (s) { return (s.pin199Days > 0 && s.lapseCount === 0) || (s.lapseCount > 0 && s.pin199Days === 0) || s.lapsesWhileReleased > 0; }),
    },
    d2: { divergences: d2.divergences, errors: d2.errors.slice(0, 50), errorCount: d2.errors.length },
    wall: {
      won: seeds.filter(function (s) { return s.won; }).length,
      nationalByStanding: seeds.filter(function (s) { return (s.peakGated | 0) >= 200; }).length,
      nationalByRank: seeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
      nationalEver: seeds.filter(function (s) { return s.nationalEver; }).length,
      table: 0, // the table is not instrumented by this arm; not guessed
      wave4: seeds.filter(function (s) { return (s.maxWave | 0) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave | 0) >= 5; }).length,
      // Faced = a wave-5 kill (kills imply facing). Engagement without a
      // kill is unmeasured by this instrument (no w5faced field in the
      // reused snapshots); unlock alone is NOT facing.
      wave5faced: seeds.filter(function (s) { return (s.w5kills | 0) > 0; }).length,
      medianDays: medianStd(daysSorted),
      maxDays: daysSorted.length ? Math.max.apply(null, daysSorted) : null,
      survived: seeds.filter(function (s) { return !s.villageLost; }).length,
      totalDeaths: totalDeaths,
      deathCauses: allCauses,
      totalW4kills: seeds.reduce(function (a, s) { return a + ((s.w4kills | 0) || 0); }, 0),
      totalPin199Days: totalPinDays,
      totalCapDays: totalCapDays,
      totalDefer5Days: totalDefer5Days,
    },
    instrumentErrors: seeds.reduce(function (a, s) { return a + s.instrumentErrors; }, 0),
    reconcileErrors: seeds.reduce(function (a, s) { return a + s.reconcileErrors.length; }, 0),
    unclassified: seeds.filter(function (s) { return s.class === 'unclassified'; }).map(function (s) { return s.seed; }),
  };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeSeed: analyzeSeed, contributionStops: contributionStops, nationalLapses: nationalLapses, compareLegs: compareLegs, medianStd: medianStd, dedupeSig: dedupeSig };
