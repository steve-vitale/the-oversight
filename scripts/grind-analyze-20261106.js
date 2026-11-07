// grind-analyze-20261106.js — field-grind analyzer (arm sim-grind-a,
// run fleshout-loop-a-20261106T2256Z). Pure functions over the grind
// corpus (evidence/2026-11-06/perseed-grind-a/*.json) plus the committed
// partydamage corpus for the 87008 fixture. No sims run here.
// Usage: node scripts/grind-analyze-20261106.js [dir-or-files...]
//   (default: evidence/2026-11-06/perseed-grind-a)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

function median(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(a) {
  if (!a.length) return null;
  return a.reduce(function (x, y) { return x + y; }, 0) / a.length;
}
function round2(x) { return x == null ? null : Math.round(x * 100) / 100; }
function tally(rows, key) {
  const out = {};
  (rows || []).forEach(function (r) { const k = String(key(r)); out[k] = (out[k] || 0) + 1; });
  return out;
}

// ---- TB chains: same beast ground down across TB fights ----
// Group by (mid, entryMaxHp), sort by (day, seq), link consecutive
// traces where next.entryHp === prev.mHpLeft (exact continuation — the
// lingerer restore returns the beast at exactly the HP the last scholar
// left it; validated on the 87008 fixture). A break in the link starts a
// new segment. Returns segments (each >= 1 fight) with chain stats.
function tbChainGroup(traces, waveMin) {
  const w = waveMin == null ? 4 : waveMin;
  const rows = (traces || []).filter(function (t) { return t && (t.wave | 0) >= w && t.mid; });
  rows.sort(function (a, b) { return ((a.day | 0) - (b.day | 0)) || ((a.seq | 0) - (b.seq | 0)); });
  const byKey = {};
  rows.forEach(function (t) {
    const k = t.mid + '|' + (t.entryMaxHp == null ? '?' : t.entryMaxHp);
    (byKey[k] = byKey[k] || []).push(t);
  });
  const segments = [];
  Object.keys(byKey).forEach(function (k) {
    const list = byKey[k];
    let cur = [list[0]];
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1], next = list[i];
      if (next.entryHp != null && prev.mHpLeft != null && next.entryHp === prev.mHpLeft) cur.push(next);
      else { segments.push(cur); cur = [next]; }
    }
    segments.push(cur);
  });
  return segments.map(function (seg) {
    const days = seg.map(function (t) { return t.day | 0; });
    const sameDay = {};
    days.forEach(function (d) { sameDay[d] = (sameDay[d] || 0) + 1; });
    const refightDays = Object.keys(sameDay).filter(function (d) { return sameDay[d] >= 2; }).length;
    const refights = seg.length - Object.keys(sameDay).length; // extra fights beyond one per day
    return {
      mid: seg[0].mid, maxHp: seg[0].entryMaxHp, fights: seg.length,
      firstDay: Math.min.apply(null, days), lastDay: Math.max.apply(null, days),
      entries: seg.map(function (t) { return t.entryHp; }),
      exits: seg.map(function (t) { return t.mHpLeft; }),
      finalHp: seg[seg.length - 1].mHpLeft,
      kills: seg.filter(function (t) { return t.ending === 'kill'; }).length,
      scholarDeaths: seg.filter(function (t) { return t.ending === 'scholar-death'; }).length,
      routs: seg.filter(function (t) { return t.ending === 'rout'; }).length,
      rounds: seg.map(function (t) { return t.rounds; }),
      totalDealt: seg.reduce(function (s, t) {
        const dealt = (t.hits || []).reduce(function (a, h) {
          return a + (((h.tgtKind === 'monster' || h.tgtKind === 'hostile') && (h.dmg | 0) > 0) ? (h.dmg | 0) : 0);
        }, 0);
        return s + dealt;
      }, 0),
      sameDayRefightDays: refightDays, sameDayRefights: refights,
      traceSeqs: seg.map(function (t) { return t.seq; }),
    };
  });
}

// ---- Field chains: same INSTANCE (WeakMap id) re-fought ----
// Group field rows by instId (non-null only), sort by (day, seq).
// Also same-day same-mid groups (the trail-read fallback when the
// instance id is absent). waveMin filters by wave (default 0 = all).
// Returns { instanceChains, sameDayGroups }.
function fieldChainGroup(rows, waveMin) {
  const w = waveMin == null ? 0 : waveMin;
  const list = (rows || []).filter(function (r) { return r && r.mid && (r.wave | 0) >= w; });
  const byInst = {};
  list.forEach(function (r) { if (r.instId) (byInst[r.instId] = byInst[r.instId] || []).push(r); });
  const instanceChains = Object.keys(byInst).map(function (id) {
    const seg = byInst[id].slice().sort(function (a, b) { return ((a.day | 0) - (b.day | 0)) || ((a.seq | 0) - (b.seq | 0)); });
    const days = seg.map(function (r) { return r.day | 0; });
    const sameDay = {};
    days.forEach(function (d) { sameDay[d] = (sameDay[d] || 0) + 1; });
    return {
      instId: id, mid: seg[0].mid, wave: seg[0].wave, fights: seg.length,
      firstDay: Math.min.apply(null, days), lastDay: Math.max.apply(null, days),
      entries: seg.map(function (r) { return r.entryHp; }),
      exits: seg.map(function (r) { return r.mHpLeft; }),
      finalHp: seg[seg.length - 1].mHpLeft,
      kills: seg.filter(function (r) { return r.outcome === 'vKill'; }).length,
      deaths: seg.filter(function (r) { return r.outcome === 'vDie'; }).length,
      flees: seg.filter(function (r) { return r.outcome === 'mFlee'; }).length,
      contactFinishKills: seg.filter(function (r) { return r.contactFinishKill; }).length,
      regenSuspect: seg.filter(function (r) { return r.regenSuspect; }).length,
      sameDayRefights: seg.length - Object.keys(sameDay).length,
      totalDealt: seg.reduce(function (s, r) { return s + ((r.mDealt | 0) || 0); }, 0),
    };
  }).filter(function (c) { return c.fights >= 2; });
  const byDayMid = {};
  list.forEach(function (r) {
    const k = (r.day | 0) + '|' + r.mid;
    (byDayMid[k] = byDayMid[k] || []).push(r);
  });
  const sameDayGroups = Object.keys(byDayMid).map(function (k) {
    const seg = byDayMid[k];
    return { key: k, day: seg[0].day, mid: seg[0].mid, fights: seg.length,
      outcomes: tally(seg, function (r) { return r.outcome; }),
      entries: seg.map(function (r) { return r.entryHp; }),
      exits: seg.map(function (r) { return r.mHpLeft; }) };
  }).filter(function (g) { return g.fights >= 2; });
  return { instanceChains: instanceChains, sameDayGroups: sameDayGroups };
}

// ---- Field-fight distribution (any wave filter) ----
function fieldDist(rows, waveMin) {
  const w = waveMin == null ? 0 : waveMin;
  const list = (rows || []).filter(function (r) { return r && (r.wave | 0) >= w; });
  const rounds = list.map(function (r) { return r.rounds; }).filter(function (x) { return x != null; });
  const dmg = list.map(function (r) {
    return (r.entryHp != null && r.mHpLeft != null) ? (r.entryHp - r.mHpLeft) : null;
  }).filter(function (x) { return x != null; });
  const left = list.map(function (r) { return r.mHpLeft; }).filter(function (x) { return x != null; });
  const entryFrac = list.map(function (r) { return r.entryFrac; }).filter(function (x) { return x != null; });
  return {
    n: list.length,
    outcomes: tally(list, function (r) { return r.outcome; }),
    rounds: { median: median(rounds), mean: round2(mean(rounds)), min: rounds.length ? Math.min.apply(null, rounds) : null, max: rounds.length ? Math.max.apply(null, rounds) : null },
    entryFracBuckets: {
      tail_lt015: entryFrac.filter(function (x) { return x < 0.15; }).length,
      mid_015_075: entryFrac.filter(function (x) { return x >= 0.15 && x < 0.75; }).length,
      fresh_ge075: entryFrac.filter(function (x) { return x >= 0.75; }).length,
      unknown: list.length - entryFrac.length,
    },
    dmgPerFight: { median: median(dmg), mean: round2(mean(dmg)), min: dmg.length ? Math.min.apply(null, dmg) : null, max: dmg.length ? Math.max.apply(null, dmg) : null },
    mHpLeftMedian: median(left),
    contactFinishAttempted: list.filter(function (r) { return r.contactFinishAttempted; }).length,
    contactFinishKills: list.filter(function (r) { return r.contactFinishKill; }).length,
    committedFinish: list.filter(function (r) { return r.committedFinish; }).length,
    corneredHold: list.filter(function (r) { return r.corneredHold; }).length,
    volleyKills: list.filter(function (r) { return r.outcome === 'vKill' && (r.rounds | 0) === 0 && !r.contactFinishKill && r.volley && (r.volley.dmg | 0) > 0; }).length,
    scholarFighterRows: list.filter(function (r) { return r.isScholar; }).length,
    regenSuspect: list.filter(function (r) { return r.regenSuspect; }).length,
  };
}

// ---- Tail stats: TB fights entered below 15% HP ----
function tailStats(traces, waveMin) {
  const w = waveMin == null ? 4 : waveMin;
  const tail = (traces || []).filter(function (t) {
    return t && (t.wave | 0) >= w && t.entryFrac != null && t.entryFrac < 0.15;
  });
  const dpr = tail.map(function (t) {
    const dealt = (t.hits || []).reduce(function (a, h) {
      return a + (((h.tgtKind === 'monster' || h.tgtKind === 'hostile') && (h.dmg | 0) > 0) ? (h.dmg | 0) : 0);
    }, 0);
    return { dealt: dealt, rounds: t.rounds, dpr: dealt / Math.max(1, t.rounds | 0 || 1) };
  });
  return {
    n: tail.length,
    endings: tally(tail, function (t) { return t.ending; }),
    kills: tail.filter(function (t) { return t.ending === 'kill'; }).length,
    roundsMedian: median(tail.map(function (t) { return t.rounds; }).filter(function (x) { return x != null; })),
    dmgPerRoundMedian: median(dpr.map(function (x) { return x.dpr; })),
    dmgPerRoundMean: round2(mean(dpr.map(function (x) { return x.dpr; }))),
    dmgPerFightMedian: median(dpr.map(function (x) { return x.dealt; })),
    entryHpMedian: median(tail.map(function (t) { return t.entryHp; }).filter(function (x) { return x != null; })),
    mHpLeftMedian: median(tail.map(function (t) { return t.mHpLeft; }).filter(function (x) { return x != null; })),
    entries: tail.map(function (t) { return { day: t.day, mid: t.mid, entryHp: t.entryHp, entryMaxHp: t.entryMaxHp, rounds: t.rounds, ending: t.ending, mHpLeft: t.mHpLeft }; }),
  };
}

// ---- Grind windows: scholar deaths on chain-fight days vs other days ----
function grindWindows(seedJson) {
  const chains = tbChainGroup(seedJson.traces || [], 4).filter(function (c) { return c.fights >= 2; });
  // Field chains count ONLY wave-4+ re-fights: unfiltered, wave-1/2
  // re-fights swamp the window (every hushwolf re-met is a "grind day").
  const fChains = fieldChainGroup(seedJson.fieldFights || [], 4).instanceChains;
  const grindDays = {};
  const tb = (seedJson.traces || []).filter(function (t) { return (t.wave | 0) >= 4; });
  const chainKeys = {};
  chains.forEach(function (c) { c.traceSeqs.forEach(function (s) { chainKeys[s] = true; }); });
  tb.forEach(function (t) { if (chainKeys[t.seq]) grindDays[t.day | 0] = true; });
  (seedJson.fieldFights || []).forEach(function (r) {
    if (fChains.some(function (c) { return c.instId === r.instId; })) grindDays[r.day | 0] = true;
  });
  const deaths = seedJson.scholarDeaths || [];
  const onGrind = deaths.filter(function (d) { return grindDays[d.day | 0]; }).length;
  return {
    grindDays: Object.keys(grindDays).map(function (d) { return +d; }).sort(function (a, b) { return a - b; }),
    scholarDeathsTotal: deaths.length,
    scholarDeathsOnGrindDays: onGrind,
    scholarDeathsElsewhere: deaths.length - onGrind,
    tbChains: chains.length, fieldChains: fChains.length,
  };
}

// ---- Wall summary over per-seed JSONs ----
function wallSummary(jsons) {
  const days = jsons.map(function (j) { return j.days; }).filter(function (x) { return x != null; });
  return {
    seeds: jsons.length,
    daysMedian: median(days), daysRange: days.length ? [Math.min.apply(null, days), Math.max.apply(null, days)] : null,
    won: jsons.filter(function (j) { return j.won; }).length,
    national: jsons.filter(function (j) { return j.scaleRank === 'national' || j.scaleRank === 'global'; }).length,
    scaleRanks: tally(jsons, function (j) { return j.scaleRank; }),
    wave4unlock: jsons.filter(function (j) { return (j.maxWave | 0) >= 4; }).length,
    wave5unlock: jsons.filter(function (j) { return (j.maxWave | 0) >= 5; }).length,
    wave4kills: jsons.reduce(function (s, j) { return s + ((j.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length); }, 0),
    wave5kills: jsons.reduce(function (s, j) { return s + ((j.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 5; }).length); }, 0),
    scholarDeaths: jsons.reduce(function (s, j) { return s + ((j.scholarDeaths || []).length); }, 0),
    instrumentErrors: jsons.reduce(function (s, j) { return s + ((j.instrumentErrors || []).length); }, 0),
  };
}

function analyzeFiles(files) {
  const jsons = files.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
  const allTraces = jsons.reduce(function (a, j) { return a.concat(j.traces || []); }, []);
  const allField = jsons.reduce(function (a, j) { return a.concat(j.fieldFights || []); }, []);
  const chains = jsons.reduce(function (a, j) { return a.concat(tbChainGroup(j.traces || [], 4).map(function (c) { c.seed = j.seed; return c; })); }, []);
  const multiChains = chains.filter(function (c) { return c.fights >= 2; });
  const fChains = jsons.reduce(function (a, j) {
    return a.concat(fieldChainGroup(j.fieldFights || [], 4).instanceChains.map(function (c) { c.seed = j.seed; return c; }));
  }, []);
  return {
    wall: wallSummary(jsons),
    tb: {
      tracesW4: allTraces.filter(function (t) { return (t.wave | 0) >= 4; }).length,
      chains: chains.length, multiFightChains: multiChains.length,
      chainList: multiChains,
      sameDayRefights: multiChains.reduce(function (s, c) { return s + c.sameDayRefights; }, 0),
      tail: tailStats(allTraces, 4),
    },
    field: {
      all: fieldDist(allField, 0),
      w4: fieldDist(allField, 4),
      instanceChains: fChains,
      sameDayGroupsTotal: jsons.reduce(function (s, j) { return s + fieldChainGroup(j.fieldFights || [], 4).sameDayGroups.length; }, 0),
    },
    windows: jsons.map(function (j) { return Object.assign({ seed: j.seed }, grindWindows(j)); }),
    perSeed: jsons.map(function (j) {
      return { seed: j.seed, days: j.days, end: j.endReason, maxWave: j.maxWave, standing: j.standing,
        scaleRank: j.scaleRank, w4kills: (j.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length,
        fieldFights: (j.fieldFights || []).length,
        w4field: (j.fieldFights || []).filter(function (f) { return (f.wave | 0) >= 4; }).length,
        w4traces: (j.traces || []).filter(function (t) { return (t.wave | 0) >= 4; }).length,
        scholarDeaths: (j.scholarDeaths || []).length };
    }),
  };
}

function collectInputs(args) {
  const out = [];
  args.forEach(function (a) {
    const st = fs.statSync(a);
    if (st.isDirectory()) {
      fs.readdirSync(a).filter(function (f) { return /\.json$/.test(f); }).sort().forEach(function (f) { out.push(path.join(a, f)); });
    } else out.push(a);
  });
  return out;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dir = args.length ? args : [path.join(REPO, 'evidence', '2026-11-06', 'perseed-grind-a')];
  const files = collectInputs(dir);
  if (!files.length) { console.error('GRIND-ANALYZE STOP: no JSON files found.'); process.exit(2); }
  const rep = analyzeFiles(files);
  console.log(JSON.stringify(rep, null, 2));
}

module.exports = { median: median, mean: mean, tbChainGroup: tbChainGroup,
  fieldChainGroup: fieldChainGroup, fieldDist: fieldDist, tailStats: tailStats,
  grindWindows: grindWindows, wallSummary: wallSummary, analyzeFiles: analyzeFiles };
