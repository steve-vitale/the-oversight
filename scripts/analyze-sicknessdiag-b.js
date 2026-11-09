// analyze-sicknessdiag-b.js — the SICKNESS-DISEASE wound-chain analyzer
// (arm sim-sicknessdiag-b, run fleshout-loop-b-20261109T1530Z). DIAG, zero src/js.
// Implements EXACTLY the wound-chain taxonomy pre-registered in
// evidence/2026-11-09/sim-sicknessdiag-b-prereg.md — a taxonomy change
// after the sweep is a dated CORRECTION, never a silent re-issue.
// Reuses, READ-ONLY, never edited:
//   scripts/analyze-prefloor-deaths-20261109.js — classifyCause (the cause
//     registry: wild / arena / starvation / sickness-disease / other-NAMED).
//   scripts/analyze-feveranat-a.js — buildEpisodes (episode reconstruction:
//     FIFO pairing per who+name, duty-cure joins, same-tick synthesis, open
//     reconciliation via deathRows).
// Usage:
//   node scripts/analyze-sicknessdiag-b.js <winseek-dir> [bare-dir] [unrec-dir]
// Prints the per-seed pre-90 split, the band split (primary set + the
// pre-90-ending subset), the raw cause census, the wound-chain join table
// (one row per pre-90 sickness-disease death), the medic presence table,
// wound-care availability, wall numbers, contradiction flags, G3 integrity,
// and (with a bare dir) the G2 neutrality comparison. With an unrec dir it
// compares unrecorded fingerprints against recorded ones (G2 controls).
'use strict';
const fs = require('fs');
const path = require('path');
const PREFLOOR = require('./analyze-prefloor-deaths-20261109');
const FEVER = require('./analyze-feveranat-a');

const classifyCause = PREFLOOR.classifyCause;
const CLASSES = PREFLOOR.CLASSES;

function loadDir(dir, re) {
  const out = {};
  fs.readdirSync(dir).filter(function (f) { return re.test(f); }).forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[c.seed] = c;
  });
  return out;
}

function trueMedian(nums) {
  const s = nums.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function emptySplit() {
  const s = {};
  CLASSES.forEach(function (c) { s[c] = 0; });
  return s;
}

function med(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; }
function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }

// ---- G3 corpus integrity (prereg G3) ----
function checkCorpusDiag(corpus) {
  const problems = [];
  const notes = [];
  const rows = corpus.daySeries || [];
  const daysAlive = corpus.daysAlive | 0;
  if (!rows.length) problems.push('no daily rows');
  else {
    const firstDay = rows[0].day | 0;
    const lastDay = rows[rows.length - 1].day | 0;
    if (firstDay !== 1 && firstDay !== 0) problems.push('first daily row day ' + firstDay + ' (expected 0/1)');
    if (!(rows.length === daysAlive || rows.length === daysAlive - 1)) {
      problems.push('daySeries length ' + rows.length + ' vs daysAlive ' + daysAlive + ' (expected daysAlive or daysAlive-1)');
    } else if (rows.length === daysAlive - 1) {
      notes.push('daySeries is daysAlive-1 (one day has no snapshot — see gaps below)');
    }
    // Day gaps: a snapshot is pushed per policy.daily call, and the clock
    // can advance >1 day per call (multi-day travel/legs), so a missing day
    // is a NOTE naming the day, not a failure (feveranat G3 tolerates the
    // same shape; only the length rule binds).
    const seenDays = new Set(rows.map(function (r) { return r.day | 0; }));
    const gaps = [];
    for (let d = (rows[0].day | 0); d <= (rows[rows.length - 1].day | 0); d++) if (!seenDays.has(d)) gaps.push(d);
    if (gaps.length) notes.push('daySeries gaps (no snapshot): days ' + gaps.join(', '));
    rows.forEach(function (r, i) {
      if (r.healerPresent == null) problems.push('row ' + i + ' (day ' + r.day + '): healerPresent null');
      if (r.sickMap == null) problems.push('row ' + i + ' (day ' + r.day + '): sickMap null');
    });
  }
  if (!corpus.fallen) problems.push('fallen list missing');
  if (!corpus.deathRows) problems.push('deathRows missing');
  if ((corpus.instrumentErrors || []).length) problems.push('instrumentErrors: ' + corpus.instrumentErrors.join('; '));
  if (corpus.sickOnsets == null || corpus.sickEnds == null) problems.push('episode arrays missing');
  if (corpus.healerRoundsEvents == null) problems.push('healerRoundsEvents missing');
  if (corpus.treatEvents == null) problems.push('treatEvents missing');
  if (corpus.dutyCuresTotal == null) problems.push('dutyCuresTotal missing');
  // Fallen vs deathRows consistency: every fallen entry must have a matching
  // deathRow (same day + same villager id + canonCause-matched cause). A
  // deathRow with no fallen entry is reported, not hidden.
  const fallen = corpus.fallen || [];
  const deaths = corpus.deathRows || [];
  let fallenMatched = 0;
  const fallenUnmatched = [];
  fallen.forEach(function (f) {
    const ok = deaths.some(function (d) {
      return d && (d.day | 0) === (f.day | 0) && d.who === f.villagerId &&
        (d.cause === canonCauseOf(f.cause) || (d.causeRaw != null && String(d.causeRaw) === String(f.cause)));
    });
    if (ok) fallenMatched++;
    else fallenUnmatched.push(f);
  });
  const deathUnmatched = deaths.filter(function (d) {
    return !fallen.some(function (f) {
      return (f.day | 0) === (d.day | 0) && f.villagerId === d.who;
    });
  });
  if (fallenUnmatched.length) problems.push('fallen without deathRow: ' + fallenUnmatched.length + ' (' + fallenUnmatched.map(function (f) { return f.villagerId + ' d' + f.day + ' ' + f.cause; }).join('; ') + ')');
  if (deathUnmatched.length) notes.push('deathRows without fallen entry: ' + deathUnmatched.length + ' (' + deathUnmatched.map(function (d) { return d.who + ' d' + d.day + ' ' + d.cause; }).join('; ') + ')');
  // Episode classification: buildEpisodes must leave zero orphan ends.
  let built = null;
  try { built = FEVER.buildEpisodes(corpus); } catch (e) { problems.push('buildEpisodes threw: ' + String(e.message).slice(0, 80)); }
  if (built) {
    if ((built.orphanEnds || []).length) problems.push('orphan sickEnds: ' + built.orphanEnds.length + ' (' + built.orphanEnds.map(function (e) { return e.who + ' d' + e.day + ' ' + e.name; }).join('; ') + ')');
    if ((built.eps || []).some(function (e) { return e.outcome == null; })) problems.push('episode with null outcome');
  }
  return { ok: problems.length === 0, problems: problems, notes: notes,
    fallenMatched: fallenMatched, fallenTotal: fallen.length,
    deathUnmatched: deathUnmatched.length, built: built };
}

// canonCause mirrors the sweep's deathRow cause normalization: lowercased,
// dehydration/thirst folded, truncated. Used ONLY for the fallen<->deathRow
// consistency check, never for the verdict classification (which reads the
// fallen list's original cause via the reused prefloor classifier).
function canonCauseOf(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// ---- per-seed pre-90 split (same shape as the prefloor analyzer) ----
function classifySeed(corpus) {
  const fallen = corpus.fallen || [];
  const pre90 = fallen.filter(function (f) { return f && f.day != null && (f.day | 0) < 90; });
  const dayMissing = fallen.filter(function (f) { return !f || f.day == null; }).length;
  const split = emptySplit();
  const raw = {};
  const rawClasses = {};
  const otherBreakdown = {};
  pre90.forEach(function (f) {
    const cl = classifyCause(f);
    split[cl] += 1;
    const c = f.cause != null ? String(f.cause) : '<missing>';
    raw[c] = (raw[c] || 0) + 1;
    rawClasses[c] = rawClasses[c] || {};
    rawClasses[c][cl] = (rawClasses[c][cl] || 0) + 1;
    if (cl === 'other') otherBreakdown[c] = (otherBreakdown[c] || 0) + 1;
  });
  const total90 = pre90.length;
  const shares = {};
  CLASSES.forEach(function (c) { shares[c] = total90 ? split[c] / total90 : 0; });
  const rows = corpus.daySeries || [];
  const maxRowDay = rows.length ? Math.max.apply(null, rows.map(function (r) { return r.day | 0; })) : -1;
  const floorReach = (corpus.daysAlive | 0) >= 90;
  const sitCalls = (corpus.sitVerbMsgs || []).length + (corpus.doorVerbMsgs || []).length;
  return {
    seed: corpus.seed, daysAlive: corpus.daysAlive, endReason: corpus.endReason,
    floorReach: floorReach, floorReachRows: maxRowDay >= 90,
    floorDisagree: floorReach !== (maxRowDay >= 90),
    fallenTotal: fallen.length, pre90Total: total90, dayMissing: dayMissing,
    split: split, shares: shares, raw: raw, rawClasses: rawClasses, otherBreakdown: otherBreakdown,
    sitCalls: sitCalls, contradiction: sitCalls > 0,
    standing: corpus.standing, maxWave: (corpus.waveReach || []).length ? Math.max.apply(null, corpus.waveReach) : 1,
    national: !!corpus.national, won: !!corpus.won,
  };
}

function aggregateSeedClassifications(list) {
  const primary = emptySplit();
  const subset = emptySplit();
  const raw = {};
  const rawClasses = {};
  const otherBreakdown = {};
  let primaryN = 0, subsetN = 0, dayMissing = 0;
  list.forEach(function (cl) {
    CLASSES.forEach(function (c) { primary[c] += cl.split[c]; });
    primaryN += cl.pre90Total;
    dayMissing += cl.dayMissing;
    Object.keys(cl.raw).forEach(function (c) { raw[c] = (raw[c] || 0) + cl.raw[c]; });
    Object.keys(cl.rawClasses || {}).forEach(function (c) {
      rawClasses[c] = rawClasses[c] || {};
      Object.keys(cl.rawClasses[c]).forEach(function (k) { rawClasses[c][k] = (rawClasses[c][k] || 0) + cl.rawClasses[c][k]; });
    });
    Object.keys(cl.otherBreakdown).forEach(function (c) { otherBreakdown[c] = (otherBreakdown[c] || 0) + cl.otherBreakdown[c]; });
    if ((cl.daysAlive | 0) < 90) {
      CLASSES.forEach(function (c) { subset[c] += cl.split[c]; });
      subsetN += cl.pre90Total;
    }
  });
  function shares(split, n) {
    const s = {};
    CLASSES.forEach(function (c) { s[c] = n ? split[c] / n : 0; });
    return s;
  }
  function dominant(split, n) {
    let best = null, bestShare = 0;
    CLASSES.forEach(function (c) {
      const sh = n ? split[c] / n : 0;
      if (sh > bestShare) { best = c; bestShare = sh; }
    });
    return { cls: best, share: bestShare, meets50: bestShare >= 0.5 };
  }
  return {
    primary: primary, primaryN: primaryN, primaryShares: shares(primary, primaryN),
    primaryDominant: dominant(primary, primaryN),
    subset: subset, subsetN: subsetN, subsetShares: shares(subset, subsetN),
    subsetDominant: dominant(subset, subsetN),
    raw: raw, rawClasses: rawClasses, otherBreakdown: otherBreakdown, dayMissing: dayMissing,
  };
}

// ---- the wound-chain join (prereg taxonomy) ----
// For one pre-90 sickness-disease fallen entry, find the victim's episode open
// on the death day (episode window onset..end, or the death-day snapshot's
// sickMap record), and classify wound-first / sickness-first / unlinked.
function joinWoundChain(corpus, built, fallenEntry) {
  const vid = fallenEntry.villagerId;
  const day = fallenEntry.day | 0;
  const eps = (built && built.eps) || [];
  const rows = corpus.daySeries || [];
  const snapByDay = new Map(rows.map(function (r) { return [r.day | 0, r]; }));
  // Episodes open on the death day for this victim. Scholar episodes are
  // keyed who='scholar'; join them via the deathRow (isPlayer) for this vid.
  let candidates = eps.filter(function (e) {
    const samePerson = e.who === vid || (e.kind === 'scholar' && isScholarDeath(corpus, vid, day));
    if (!samePerson) return false;
    const endD = e.endDay == null ? 9999 : (e.endDay | 0);
    return (e.onsetDay | 0) <= day && day <= endD;
  });
  // Prefer the episode whose window actually contains the death; if several,
  // wound_fever outranks the rest (the chain question is wound-first).
  candidates.sort(function (a, b) {
    const aw = (a.diseaseId === 'wound_fever' || a.name === 'wound fever') ? 0 : 1;
    const bw = (b.diseaseId === 'wound_fever' || b.name === 'wound fever') ? 0 : 1;
    if (aw !== bw) return aw - bw;
    return (a.onsetDay | 0) - (b.onsetDay | 0);
  });
  const ep = candidates[0] || null;
  const snap = snapByDay.get(day) || null;
  const snapRec = snap && snap.sickMap ? snap.sickMap[vid] : null;
  const snapPrev = snapByDay.get(day - 1) || null;
  const hpBefore = snapPrev && snapPrev.healthMap ? snapPrev.healthMap[vid] : null;
  const healerOnDeathDay = snap ? snap.healerPresent : null;
  // Healer-present sick-days over the episode window (onset..death day).
  let healerSickDays = null, totalSickDays = null;
  if (ep) {
    const start = ep.onsetDay | 0;
    let present = 0, total = 0;
    for (let d = start; d <= day; d++) {
      const r = snapByDay.get(d);
      if (!r) continue;
      total++;
      if (r.healerPresent) present++;
    }
    healerSickDays = present; totalSickDays = total;
  }
  const rounds7d = (corpus.healerRoundsEvents || []).filter(function (ev) {
    return ev.who === vid && (ev.day | 0) >= day - 7 && (ev.day | 0) <= day;
  });
  const base = {
    seed: corpus.seed, day: day, who: vid, whoName: fallenEntry.name || null,
    cause: fallenEntry.cause,
    healerPresentOnDeathDay: healerOnDeathDay,
    hpDayBefore: hpBefore == null ? null : hpBefore,
    healerRounds7d: rounds7d.length,
    healerRounds7dDetail: rounds7d.map(function (ev) { return 'd' + ev.day + ' ' + ev.hpBefore + '->' + ev.hpAfter; }),
  };
  if (ep) {
    const isWound = ep.diseaseId === 'wound_fever' || ep.name === 'wound fever';
    return Object.assign(base, {
      chain: isWound ? 'wound-first' : 'sickness-first',
      source: 'episode',
      episodeName: ep.name, diseaseId: ep.diseaseId, vector: ep.vector,
      onsetDay: ep.onsetDay, endDay: ep.endDay, duration: ep.duration,
      onsetToDeath: day - (ep.onsetDay | 0),
      outcome: ep.outcome, deathCause: ep.deathCause || null,
      treated: !!ep.treated, treatKinds: ep.treatKinds || [],
      cured: !!ep.cured, curedBy: ep.curedBy || null,
      healerPresentAtOnset: ep.healerPresent, medicCountAtOnset: ep.medicCount,
      hpAtOnset: ep.hpAtOnset,
      healerSickDays: healerSickDays, totalSickDays: totalSickDays,
      reconciled: !!ep.reconciled, synthesized: ep.synthesized || null,
    });
  }
  if (snapRec) {
    const isWound = snapRec.name === 'wound fever';
    return Object.assign(base, {
      chain: isWound ? 'wound-first' : 'sickness-first',
      source: 'snapshot-only (no episode window)',
      episodeName: snapRec.name, diseaseId: null, vector: null,
      onsetDay: null, endDay: null, duration: null,
      onsetToDeath: null,
      outcome: null, deathCause: null,
      treated: null, treatKinds: [],
      cured: null, curedBy: null,
      healerPresentAtOnset: null, medicCountAtOnset: null,
      hpAtOnset: null,
      healerSickDays: null, totalSickDays: null,
      reconciled: false, synthesized: null,
    });
  }
  return Object.assign(base, {
    chain: 'unlinked',
    source: 'no episode, no snapshot record',
    episodeName: null, diseaseId: null, vector: null,
    onsetDay: null, endDay: null, duration: null,
    onsetToDeath: null,
    outcome: null, deathCause: null,
    treated: null, treatKinds: [],
    cured: null, curedBy: null,
    healerPresentAtOnset: null, medicCountAtOnset: null,
    hpAtOnset: null,
    healerSickDays: null, totalSickDays: null,
    reconciled: false, synthesized: null,
  });
}

function isScholarDeath(corpus, vid, day) {
  return (corpus.deathRows || []).some(function (d) {
    return d && d.who === vid && d.isPlayer && (d.day | 0) === day;
  });
}

function printSplit(label, split, n, shares) {
  console.log(label + ' (n=' + n + '): ' + CLASSES.map(function (c) {
    return c + ' ' + split[c] + ' (' + (100 * shares[c]).toFixed(1) + '%)';
  }).join(', '));
}

function buildFingerprint(corpus, diag) {
  const deathKeys = (corpus.deathRows || []).map(function (d) { return d.day + '|' + d.who + '|' + d.cause; }).sort();
  return { seed: corpus.seed, daysAlive: corpus.daysAlive,
    endReason: diag ? diag.endReason : corpus.endReason,
    rank: corpus.rank != null ? corpus.rank : (diag ? diag.rank : null),
    maxWave: (corpus.waveReach || []).length ? Math.max.apply(null, corpus.waveReach) : 1,
    national: !!corpus.national, table: !!corpus.win, win: !!corpus.win,
    deathCauses: corpus.deathCauses || {}, deathKeys: deathKeys,
    finalPop: corpus.finalPop == null ? null : corpus.finalPop };
}

function fingerprintsEqual(a, b) {
  const keys = ['seed', 'daysAlive', 'endReason', 'rank', 'maxWave', 'national', 'table', 'win', 'finalPop'];
  for (const k of keys) if (a[k] !== b[k]) return 'field ' + k + ': recorded=' + JSON.stringify(a[k]) + ' bare=' + JSON.stringify(b[k]);
  const ca = a.deathCauses || {}, cb = b.deathCauses || {};
  const allC = new Set(Object.keys(ca).concat(Object.keys(cb)));
  for (const c of allC) if ((ca[c] || 0) !== (cb[c] || 0)) return 'deathCauses[' + c + ']: recorded=' + (ca[c] || 0) + ' bare=' + (cb[c] || 0);
  const ka = (a.deathKeys || []).join('\n'), kb = (b.deathKeys || []).join('\n');
  if (ka !== kb) return 'deathKeys differ (recorded ' + (a.deathKeys || []).length + ' vs bare ' + (b.deathKeys || []).length + ')';
  return null;
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/analyze-sicknessdiag-b.js <winseek-dir> [bare-dir] [unrec-dir]'); process.exit(2); }
  const corpora = loadDir(dir, /^sicknessdiag-b-winseek-s\d+\.json$/);
  const seeds = Object.keys(corpora).sort(function (a, b) { return (a | 0) - (b | 0); });
  if (!seeds.length) { console.error('no per-seed files in ' + dir); process.exit(2); }
  const classified = seeds.map(function (s) { return classifySeed(corpora[s]); });
  console.log('=== sim-sicknessdiag-b DIAGNOSIS (seeds ' + seeds.join(',') + ', winseek, 150d) ===\n');
  console.log('seed | daysAlive | end | floor? | fallen | pre90 | wild | arena | starv | sick | other | sitCalls');
  classified.forEach(function (cl) {
    console.log(cl.seed + ' | ' + cl.daysAlive + ' | ' + cl.endReason + ' | ' + (cl.floorReach ? 'YES' : 'no') + ' | ' + cl.fallenTotal + ' | ' + cl.pre90Total +
      ' | ' + cl.split.wild + ' | ' + cl.split.arena + ' | ' + cl.split.starvation + ' | ' + cl.split['sickness-disease'] + ' | ' + cl.split.other + ' | ' + cl.sitCalls +
      (cl.contradiction ? ' CONTRADICTION' : '') + (cl.floorDisagree ? ' FLOOR-DISAGREE' : ''));
  });
  const agg = aggregateSeedClassifications(classified);
  console.log('\nBAND SPLIT — primary set (all pre-90 deaths, winseek leg):');
  printSplit('primary', agg.primary, agg.primaryN, agg.primaryShares);
  console.log('dominant: ' + agg.primaryDominant.cls + ' ' + (100 * agg.primaryDominant.share).toFixed(1) + '% — ' + (agg.primaryDominant.meets50 ? 'MEETS the 50% bar' : 'below the 50% bar'));
  console.log('\nBAND SPLIT — subset (deaths in villages ending before day 90):');
  printSplit('subset', agg.subset, agg.subsetN, agg.subsetShares);
  console.log('dominant: ' + agg.subsetDominant.cls + ' ' + (100 * agg.subsetDominant.share).toFixed(1) + '% — ' + (agg.subsetDominant.meets50 ? 'MEETS the 50% bar' : 'below the 50% bar'));
  console.log('\nRAW CAUSE CENSUS (pre-90 deaths, all causes, nothing hidden):');
  Object.keys(agg.raw).sort(function (a, b) { return agg.raw[b] - agg.raw[a]; }).forEach(function (c) {
    const classes = Object.keys(agg.rawClasses[c] || {}).map(function (k) { return k + ' ' + agg.rawClasses[c][k]; }).join(', ');
    console.log('  ' + agg.raw[c] + '  ' + JSON.stringify(c) + '  -> ' + classes);
  });
  console.log('\nOTHER-CLASS BREAKDOWN (named):');
  const ob = agg.otherBreakdown;
  if (Object.keys(ob).length) Object.keys(ob).sort(function (a, b) { return ob[b] - ob[a]; }).forEach(function (c) { console.log('  ' + ob[c] + '  ' + JSON.stringify(c)); });
  else console.log('  (empty — no pre-90 death fell in other)');
  console.log('\nFallen entries with missing day (data quality, expected 0): ' + agg.dayMissing);

  // ---- the wound-chain join (primary metric) ----
  console.log('\n=== WOUND-CHAIN JOIN (pre-90 sickness-disease deaths) ===');
  const joins = [];
  seeds.forEach(function (s) {
    const corpus = corpora[s];
    const built = FEVER.buildEpisodes(corpus);
    (corpus.fallen || []).filter(function (f) { return f && f.day != null && (f.day | 0) < 90 && classifyCause(f) === 'sickness-disease'; })
      .forEach(function (f) { joins.push(joinWoundChain(corpus, built, f)); });
  });
  const chainCounts = {};
  joins.forEach(function (j) { chainCounts[j.chain] = (chainCounts[j.chain] || 0) + 1; });
  const attributed = (chainCounts['wound-first'] || 0) + (chainCounts['sickness-first'] || 0);
  console.log('chain counts: ' + JSON.stringify(chainCounts) + ' (attributed ' + attributed + ' of ' + joins.length + ')');
  if (attributed) console.log('wound-first share of attributed: ' + (100 * (chainCounts['wound-first'] || 0) / attributed).toFixed(1) + '%');
  joins.forEach(function (j) {
    console.log('  s' + j.seed + ' d' + j.day + ' ' + (j.whoName || j.who) + ' (' + j.who + ') cause=' + JSON.stringify(j.cause) +
      ' chain=' + j.chain + ' via=' + j.source +
      (j.episodeName ? ' ep=' + j.episodeName + ' vector=' + j.vector + ' onset=d' + j.onsetDay + ' onset->death=' + j.onsetToDeath + 'd' : '') +
      (j.treated != null ? ' treated=' + j.treated + (j.treatKinds.length ? '(' + j.treatKinds.join(',') + ')' : '') : '') +
      (j.healerPresentAtOnset != null ? ' healer@onset=' + j.healerPresentAtOnset : '') +
      (j.healerSickDays != null ? ' healerSickDays=' + j.healerSickDays + '/' + j.totalSickDays : '') +
      ' hpDayBefore=' + j.hpDayBefore + ' healer@deathDay=' + j.healerPresentOnDeathDay +
      ' rounds7d=' + j.healerRounds7d + (j.healerRounds7dDetail.length ? ' [' + j.healerRounds7dDetail.join(', ') + ']' : '') +
      (j.reconciled ? ' RECONCILED' : '') + (j.synthesized ? ' SYNTH-' + j.synthesized : ''));
  });
  const onsetToDeaths = joins.filter(function (j) { return j.onsetToDeath != null; }).map(function (j) { return j.onsetToDeath; });
  if (onsetToDeaths.length) console.log('onset->death days (n=' + onsetToDeaths.length + '): min=' + Math.min.apply(null, onsetToDeaths) + ' median=' + med(onsetToDeaths) + ' mean=' + r1(mean(onsetToDeaths)) + ' max=' + Math.max.apply(null, onsetToDeaths));
  const unlinked = joins.filter(function (j) { return j.chain === 'unlinked'; });
  if (unlinked.length) {
    console.log('UNLINKED deaths (no episode, no snapshot record) — pure HP-attrition wound deaths or instrument misses:');
    unlinked.forEach(function (j) { console.log('  s' + j.seed + ' d' + j.day + ' ' + (j.whoName || j.who) + ' cause=' + JSON.stringify(j.cause) + ' hpDayBefore=' + j.hpDayBefore + ' healer@deathDay=' + j.healerPresentOnDeathDay + ' rounds7d=' + j.healerRounds7d); });
  }

  // ---- episode census (feveranat F1-F4 shape, winseek band) ----
  console.log('\n=== EPISODE CENSUS (all episodes, all days) ===');
  const allEps = [];
  const orphanTotal = [];
  seeds.forEach(function (s) {
    const built = FEVER.buildEpisodes(corpora[s]);
    built.eps.forEach(function (e) { allEps.push(e); });
    (built.orphanEnds || []).forEach(function (e) { orphanTotal.push(e); });
  });
  const npcEps = allEps.filter(function (e) { return e.kind === 'npc'; });
  const schEps = allEps.filter(function (e) { return e.kind === 'scholar'; });
  const byDisease = {};
  allEps.forEach(function (e) { const k = e.diseaseId || e.name || '?'; byDisease[k] = (byDisease[k] || 0) + 1; });
  const byVector = {};
  allEps.forEach(function (e) { byVector[e.vector || 'unattributed'] = (byVector[e.vector || 'unattributed'] || 0) + 1; });
  const byOutcome = {};
  allEps.forEach(function (e) { byOutcome[e.outcome] = (byOutcome[e.outcome] || 0) + 1; });
  console.log('episodes=' + allEps.length + ' (NPC ' + npcEps.length + ', scholar ' + schEps.length + ')');
  console.log('  by disease id/name=' + JSON.stringify(byDisease));
  console.log('  by vector=' + JSON.stringify(byVector));
  console.log('  by outcome=' + JSON.stringify(byOutcome));
  console.log('  orphan ends (unexplained): ' + orphanTotal.length);
  const wfEps = npcEps.filter(function (e) { return e.diseaseId === 'wound_fever'; });
  const wfDied = wfEps.filter(function (e) { return e.outcome === 'died'; });
  const tickEps = npcEps.filter(function (e) { return e.diseaseId === 'disease'; });
  const tickDied = tickEps.filter(function (e) { return e.outcome === 'died'; });
  console.log('  wound_fever (NPC): n=' + wfEps.length + ' died-of-fever=' + wfDied.length +
    ' healer@onset present ' + wfEps.filter(function (e) { return e.healerPresent === true; }).length +
    ' / absent ' + wfEps.filter(function (e) { return e.healerPresent === false; }).length);
  console.log('  tick fever / disease (NPC): n=' + tickEps.length + ' died-of-fever=' + tickDied.length);
  // Healer-signal table for wound_fever (NPC): mortality by healer at onset.
  function mortalityByHealer(eps) {
    const p = eps.filter(function (e) { return e.healerPresent === true; });
    const a = eps.filter(function (e) { return e.healerPresent === false; });
    const pd = p.filter(function (e) { return e.outcome === 'died'; }).length;
    const ad = a.filter(function (e) { return e.outcome === 'died'; }).length;
    const pr = p.length ? pd / p.length : null;
    const ar = a.length ? ad / a.length : null;
    return { presentN: p.length, presentDied: pd, presentRate: pr,
      absentN: a.length, absentDied: ad, absentRate: ar,
      ratio: (pr != null && pr > 0) ? ar / pr : (ar != null && ar > 0 ? Infinity : null) };
  }
  const wfMort = mortalityByHealer(wfEps);
  console.log('  WOUND_FEVER MORTALITY BY HEALER AT ONSET (NPC): present ' + wfMort.presentDied + '/' + wfMort.presentN +
    ' (' + (wfMort.presentRate == null ? 'n/a' : (100 * wfMort.presentRate).toFixed(1) + '%') + ')' +
    ' | absent ' + wfMort.absentDied + '/' + wfMort.absentN +
    ' (' + (wfMort.absentRate == null ? 'n/a' : (100 * wfMort.absentRate).toFixed(1) + '%') + ')' +
    ' | ratio absent/present=' + (wfMort.ratio == null ? 'n/a' : (wfMort.ratio === Infinity ? 'inf (present 0 deaths)' : wfMort.ratio.toFixed(2) + 'x')));
  const treated = allEps.filter(function (e) { return e.treated; });
  const untreated = allEps.filter(function (e) { return !e.treated; });
  console.log('  treated episodes ' + treated.length + '/' + allEps.length +
    ' died-of-fever ' + treated.filter(function (e) { return e.outcome === 'died'; }).length +
    ' | untreated ' + untreated.length + ' died-of-fever ' + untreated.filter(function (e) { return e.outcome === 'died'; }).length);
  // Medic presence (per seed + pooled), from the daily series.
  console.log('\n=== MEDIC PRESENCE (daily series) ===');
  let poolDays = 0, poolHealerDays = 0, poolMedicDays = 0, poolSickPresent = 0, poolSickAbsent = 0;
  seeds.forEach(function (s) {
    const rows = corpora[s].daySeries || [];
    const hd = rows.filter(function (r) { return r.healerPresent === true; }).length;
    const md = rows.filter(function (r) { return (r.medicCount | 0) > 0; }).length;
    const sp = rows.filter(function (r) { return r.healerPresent === true; }).reduce(function (n, r) { return n + (r.sickCountNPC | 0); }, 0);
    const sa = rows.filter(function (r) { return r.healerPresent === false; }).reduce(function (n, r) { return n + (r.sickCountNPC | 0); }, 0);
    poolDays += rows.length; poolHealerDays += hd; poolMedicDays += md; poolSickPresent += sp; poolSickAbsent += sa;
    console.log('  s' + s + ': days=' + rows.length + ' healerDays=' + hd + ' medicDays=' + md +
      ' sickDaysPresent=' + sp + ' sickDaysAbsent=' + sa +
      ' tends=' + ((corpora[s].treatEvents || []).filter(function (t) { return t.kind === 'villagerCare'; }).length));
  });
  console.log('  POOLED: village-days=' + poolDays + ' healerDays=' + poolHealerDays +
    ' (' + (poolDays ? (100 * poolHealerDays / poolDays).toFixed(1) : 'n/a') + '%)' +
    ' medicDays=' + poolMedicDays +
    ' NPC sick-days healer-present=' + poolSickPresent + ' healer-absent=' + poolSickAbsent);

  // ---- wound-care availability ----
  console.log('\n=== WOUND-CARE AVAILABILITY ===');
  let roundsTotal = 0, roundsPatients = new Set(), roundsHpGain = 0;
  let tendWoundCare = 0, treatVillagerCalls = 0, villagerCareTends = 0, dutyCures = 0;
  let diagnosesTotal = 0, cureEventsTotal = 0, dutyCuresGame = 0;
  seeds.forEach(function (s) {
    const c = corpora[s];
    (c.healerRoundsEvents || []).forEach(function (ev) {
      roundsTotal++;
      roundsPatients.add(ev.who);
      if (ev.hpBefore != null && ev.hpAfter != null) roundsHpGain += (ev.hpAfter - ev.hpBefore);
    });
    tendWoundCare += (c.treatEvents || []).filter(function (t) { return t.kind === 'tendVillager' && t.result === 'wound-care'; }).length;
    treatVillagerCalls += (c.treatEvents || []).filter(function (t) { return t.kind === 'treatVillager'; }).length;
    villagerCareTends += (c.treatEvents || []).filter(function (t) { return t.kind === 'villagerCare'; }).length;
    dutyCures += (c.treatEvents || []).filter(function (t) { return t.kind === 'dutyCure'; }).length;
    diagnosesTotal += (c.diagnoses || []).length;
    cureEventsTotal += (c.cureEvents || []).length;
    dutyCuresGame += ((c.dutyCuresTotal || {}).total || 0);
  });
  const treatByKind = {};
  seeds.forEach(function (s) { (corpora[s].treatEvents || []).forEach(function (t) { treatByKind[t.kind] = (treatByKind[t.kind] || 0) + 1; }); });
  console.log('healerRounds events=' + roundsTotal + ' distinct patients=' + roundsPatients.size + ' total HP gained=' + roundsHpGain);
  console.log('treatEvents by kind=' + JSON.stringify(treatByKind) + ' (total ' + Object.values(treatByKind).reduce(function (a, b) { return a + b; }, 0) + ')');
  console.log('tendVillager wound-care events=' + tendWoundCare + ' treatVillager calls=' + treatVillagerCalls +
    ' (cured ' + seeds.reduce(function (n, s) { return n + (corpora[s].treatEvents || []).filter(function (t) { return t.kind === 'treatVillager' && t.result === 'cured'; }).length; }, 0) + ')' +
    ' villagerCare tends=' + villagerCareTends);
  console.log('diagnoses=' + diagnosesTotal + ' cureEvents=' + cureEventsTotal +
    ' dutyCure events=' + dutyCures + ' vs game-counter dutyCuresTotal=' + dutyCuresGame +
    ' (capture ' + dutyCures + '/' + dutyCuresGame + ')');
  console.log('episodes ending cured=' + allEps.filter(function (e) { return e.cured; }).length +
    ' (cureEvent ' + allEps.filter(function (e) { return e.curedBy === 'cureEvent'; }).length +
    ', cured-end ' + allEps.filter(function (e) { return e.curedBy === 'cured-end'; }).length +
    ', duty-snapshot ' + allEps.filter(function (e) { return e.curedBy === 'duty-snapshot'; }).length +
    ', duty-cure-event ' + allEps.filter(function (e) { return e.curedBy === 'duty-cure-event'; }).length +
    ', duty-same-tick ' + allEps.filter(function (e) { return e.curedBy === 'duty-same-tick'; }).length + ')');

  // ---- wall numbers ----
  console.log('\nWall numbers (winseek leg):');
  const floorN = classified.filter(function (c) { return c.floorReach; }).length;
  const national = classified.filter(function (c) { return c.national; }).length;
  const wins = classified.filter(function (c) { return c.won; }).length;
  const w4u = classified.filter(function (c) { return (c.maxWave | 0) >= 4; }).length;
  const w5u = classified.filter(function (c) { return (c.maxWave | 0) >= 5; }).length;
  const surv = classified.map(function (c) { return c.daysAlive; }).sort(function (a, b) { return a - b; });
  console.log('floor-reach ' + floorN + '/' + classified.length + ', national ' + national + '/' + classified.length + ', table sits 0/' + classified.length + ', wins ' + wins + '/' + classified.length);
  console.log('wave-4 unlocks ' + w4u + '/' + classified.length + ', wave-5 unlocks ' + w5u + '/' + classified.length);
  console.log('true median survival ' + trueMedian(classified.map(function (c) { return c.daysAlive; })) + 'd (sorted ' + surv.join(', ') + ')');
  console.log('sit-verb calls across the band: ' + classified.reduce(function (n, c) { return n + c.sitCalls; }, 0) + ' (expected 0 — no seat-walking on this leg)');

  // ---- G3 corpus integrity ----
  console.log('\nG3 corpus integrity (winseek leg):');
  let g3pass = true;
  seeds.forEach(function (s) {
    const ck = checkCorpusDiag(corpora[s]);
    if (!ck.ok) g3pass = false;
    console.log(s + ': ' + (ck.ok ? 'PASS' : 'FAIL — ' + ck.problems.join('; ')) + (ck.notes.length ? ' (notes: ' + ck.notes.join('; ') + ')' : '') +
      ' [fallen matched ' + ck.fallenMatched + '/' + ck.fallenTotal + ']');
  });
  console.log('G3 overall: ' + (g3pass ? 'PASS' : 'FAIL'));

  // ---- G2 neutrality (bare dir: fingerprints) ----
  const bareDir = process.argv[3];
  if (bareDir) {
    const bare = loadDir(bareDir, /^sicknessdiag-b-bare-s\d+\.json$/);
    console.log('\nG2 neutrality (unrecorded vs recorded, winseek leg):');
    Object.keys(bare).sort(function (a, b) { return (a | 0) - (b | 0); }).forEach(function (s) {
      if (!corpora[s]) { console.log(s + ': no recorded match'); return; }
      const recFp = buildFingerprint(corpora[s], null);
      const diff = fingerprintsEqual(recFp, bare[s]);
      console.log(s + ': ' + (diff ? 'FAIL — ' + diff : 'PASS'));
    });
  }

  // ---- verdict inputs (prereg lever-naming rule) ----
  console.log('\nLEVER-NAMING RULE INPUTS:');
  console.log('wound-first ' + (chainCounts['wound-first'] || 0) + ' / attributed ' + attributed +
    ' = ' + (attributed ? (100 * (chainCounts['wound-first'] || 0) / attributed).toFixed(1) + '%' : 'n/a') + ' (bar >= 50%)');
  console.log('healer-absent wound_fever deaths ' + wfMort.absentDied + ' (bar >= 3) | absent rate ' +
    (wfMort.absentRate == null ? 'n/a' : (100 * wfMort.absentRate).toFixed(1) + '%') + ' vs present rate ' +
    (wfMort.presentRate == null ? 'n/a' : (100 * wfMort.presentRate).toFixed(1) + '%') + ' | ratio ' +
    (wfMort.ratio == null ? 'n/a' : (wfMort.ratio === Infinity ? 'inf' : wfMort.ratio.toFixed(2) + 'x')) + ' (bar >= 2x)');
  console.log('unlinked deaths ' + (chainCounts['unlinked'] || 0) + ' (bar <= 2)');
}

module.exports = { classifySeed: classifySeed, aggregateSeedClassifications: aggregateSeedClassifications,
  joinWoundChain: joinWoundChain, checkCorpusDiag: checkCorpusDiag, buildFingerprint: buildFingerprint,
  fingerprintsEqual: fingerprintsEqual, loadDir: loadDir, trueMedian: trueMedian, CLASSES: CLASSES };
