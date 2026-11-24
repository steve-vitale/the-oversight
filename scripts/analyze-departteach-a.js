// analyze-departteach-a.js — analyzer + judge, arm sim-departteach-a.
// Compares the control/arm per-seed corpora produced by
// scripts/departteach-driver-a.js and judges the frozen bars from
// evidence/2026-11-24/sim-departteach-a-prereg.md §6 (bars B1–B3;
// B4 UI audit + B5 instrument are judged in the evidence from the
// proof test + the §3 code audit, not here).
//
// What it checks, per seed:
//   * teachRows (one row per winPlanDepartLaunchBeat call, with the
//     knownNames snapshot before/after): for NAMED beats only
//     (ordinarySpoke — the beat actually spoke), per companion
//     slot: knownBefore / knownAfter / taught. PRIMARY: taught /
//     unknown-before on the arm leg (bar 1, >= 0.80); control leg
//     must teach 0 (instrument sanity). The holder must NEVER be
//     taught (holderKnownBefore === holderKnownAfter on every row).
//   * driftLines: 0 on ctl; exactly equal to taught slots on arm
//     (each teach says exactly one drift line — bar 3).
//   * beatLines (DEPART_BEAT_RE only): identical count, days in
//     order, and TEXT control vs arm — the teach does not touch
//     the line itself (bar 3). Zero descriptors on both legs
//     (the departname fix must not have regressed).
//   * departBeats (structured rows): byte-identical before vs
//     after — the same departures happened with the same parties.
//   * deaths, v4departs launch counts, days, endReason identical
//     per seed — the teach writes only knownNames + journal name
//     entries + say lines (bar 2).
//   * Denominator guard (bar 6): if unknown-before companion
//     slots total < 10 across the pilot, the verdict is
//     EXTEND-BAND — bar 1 is NOT judged on that denominator.
// Usage:
//   node scripts/analyze-departteach-a.js --before <dir> --after <dir>
//     [--out <analysis.json>] [--selftest]
//   (dirs hold departteach-a-s<seed>-departteach-a-ctl.json per seed.)
'use strict';
const fs = require('fs');
const path = require('path');

const DESCRIPTOR_RE = /A (person|man|woman), maybe \d0s/;
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// The visible-trait pool is fixed data (game.js visibleTraitPool);
// copied from analyze-departname-a.js (same reader, same fallback).
const TRAIT_POOL_FALLBACK = ['with a long braid', 'with a shaved head', 'with tattooed arms',
  'with a scarred cheek', 'with a limp', 'with thick glasses',
  'with weathered hands', 'with grey-streaked hair', 'with a nervous tic',
  'with freckles', 'with a buzz cut', 'with a slouched posture',
  'with restless hands', 'with a crooked nose', 'with a gap-toothed grin',
  'with ink-stained fingers', "with a farmer's tan", 'with calloused knuckles',
  'with deep-set eyes', 'with a broad frame', 'with a wiry build',
  'with a missing fingertip', 'with a burn-scarred forearm', 'with sun-creased eyes'];
function loadTraitPool() {
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    const m = src.match(/visibleTraitPool\(\) \{[\s\S]*?return \[([\s\S]*?)\];/);
    if (!m) return TRAIT_POOL_FALLBACK;
    const items = m[1].match(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g) || [];
    const traits = items.map(function (q) { return q.slice(1, -1); });
    return traits.length ? traits : TRAIT_POOL_FALLBACK;
  } catch (e) { return TRAIT_POOL_FALLBACK; }
}
const TRAIT_POOL = loadTraitPool();
const DESCRIPTOR_FULL_RE = new RegExp(
  'A (?:person|man|woman), maybe \\d0s(?:, (?:' +
  TRAIT_POOL.map(escapeRegExp).join('|') + '))?', 'g');
const NAME_TOKEN_RE = /^[A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ'’\-]*$/;

function beatKind(text) {
  if (/marks the trail/.test(text)) return 'depart';
  if (/found a new trail/.test(text)) return 'reseed-launch';
  if (/put down/.test(text)) return 'reseed-expiry';
  return 'other';
}
function descriptorCount(text) {
  const m = String(text).match(/A (?:person|man|woman), maybe \d0s/g);
  return m ? m.length : 0;
}
// lineMatchesAfter(beforeLine, afterLine): the after line equals the
// before line with each full descriptor span replaced by exactly one
// capitalized first name. Kept from analyze-departname-a.js as the
// regression guard's shape check — but for THIS arm the beat lines
// must be byte-identical (the teach never touches the line), so the
// judgment uses strict equality and this helper only classifies a
// mismatch (a substitution would mean the legs differ).
function lineMatchesAfter(beforeLine, afterLine) {
  const parts = String(beforeLine).split(DESCRIPTOR_FULL_RE);
  const descs = String(beforeLine).match(DESCRIPTOR_FULL_RE) || [];
  if (!descs.length) return beforeLine === afterLine;
  const pattern = '^' + parts.map(escapeRegExp).join("([A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ'’\\-]*)") + '$';
  let re = null;
  try { re = new RegExp(pattern); } catch (e) { return false; }
  const m = re.exec(String(afterLine));
  if (!m) return false;
  for (let i = 1; i < m.length; i++) if (!NAME_TOKEN_RE.test(m[i])) return false;
  return true;
}
// teachStats(rows): the teach numbers for one seed's teachRows.
// Only NAMED beats count (ordinarySpoke): a reseed-spoke call
// never ran departLaunchBeat, so it has nothing to teach.
function teachStats(rows) {
  const out = { namedBeats: 0, slots: 0, unknownBefore: 0, taught: 0,
    alreadyKnown: 0, postSystemSlots: 0, holderTaught: 0, teachRate: null };
  for (const r of (rows || [])) {
    if (!r || !r.ordinarySpoke) continue;
    out.namedBeats++;
    if (r.holderKnownBefore !== r.holderKnownAfter) out.holderTaught++;
    for (const s of (r.slots || [])) {
      out.slots++;
      if (r.systemArrivedBefore) { out.postSystemSlots++; continue; }
      if (s.knownBefore) { out.alreadyKnown++; continue; }
      out.unknownBefore++;
      if (s.taught) out.taught++;
    }
  }
  out.teachRate = out.unknownBefore > 0 ? out.taught / out.unknownBefore : null;
  return out;
}
// beatLinesIdentical(before, after): same count, same days in
// order, byte-identical text. The teach must not move the line.
function beatLinesIdentical(before, after) {
  if (before.length !== after.length) return false;
  for (let i = 0; i < before.length; i++) {
    if (before[i].day !== after[i].day) return false;
    if (before[i].text !== after[i].text) return false;
  }
  return true;
}
function loadCorpus(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    if (!/\.json$/.test(f)) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function analyze(beforeDir, afterDir) {
  const before = loadCorpus(beforeDir);
  const after = loadCorpus(afterDir);
  const seeds = Object.keys(before).map(Number).sort(function (a, b) { return a - b; });
  const perSeed = {};
  let totalUnknownBefore = 0, totalTaughtCtl = 0, totalTaughtArm = 0;
  let totalUnknownBeforeArm = 0;
  let totalDeathsBefore = 0, totalDeathsAfter = 0;
  let totalLaunchesBefore = 0, totalLaunchesAfter = 0;
  let totalDriftCtl = 0, totalDriftArm = 0;
  let lineMismatches = [];
  let structMismatches = [];
  let metaMismatches = [];
  let teachMismatches = [];
  const taughtExamples = [];
  for (const seed of seeds) {
    const b = before[seed], a = after[seed];
    if (!a) { metaMismatches.push({ seed: seed, issue: 'missing after-leg corpus' }); continue; }
    const bb = b.beatLines || [], ab = a.beatLines || [];
    const bd = (b.deaths || []).length, ad = (a.deaths || []).length;
    const bl = (b.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
    const al = (a.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
    totalDeathsBefore += bd; totalDeathsAfter += ad;
    totalLaunchesBefore += bl; totalLaunchesAfter += al;
    const tsB = teachStats(b.teachRows || []);
    const tsA = teachStats(a.teachRows || []);
    totalUnknownBefore += tsB.unknownBefore;
    totalUnknownBeforeArm += tsA.unknownBefore;
    totalTaughtCtl += tsB.taught;
    totalTaughtArm += tsA.taught;
    const driftB = (b.driftLines || []).length, driftA = (a.driftLines || []).length;
    totalDriftCtl += driftB; totalDriftArm += driftA;
    // Beat-line identity (bar 3): same count, days, byte-identical
    // text — plus zero descriptors on both legs (departname guard).
    let descB = 0, descA = 0;
    for (const row of bb) descB += descriptorCount(row.text);
    for (const row of ab) descA += descriptorCount(row.text);
    if (!beatLinesIdentical(bb, ab)) {
      lineMismatches.push({ seed: seed, issue: 'beat lines differ (count/day/text)',
        before: bb.length, after: ab.length,
        firstDiff: (function () {
          for (let i = 0; i < Math.max(bb.length, ab.length); i++) {
            if (!bb[i] || !ab[i] || bb[i].day !== ab[i].day || bb[i].text !== ab[i].text) {
              return { index: i, before: bb[i] || null, after: ab[i] || null };
            }
          }
          return null;
        })() });
    }
    if (descB !== 0 || descA !== 0) {
      lineMismatches.push({ seed: seed, issue: 'descriptor-named beat lines present',
        descriptorsBefore: descB, descriptorsAfter: descA });
    }
    // Drift identity (bar 3): ctl 0, arm exactly taught slots.
    if (driftB !== 0) teachMismatches.push({ seed: seed, issue: 'drift lines on control leg', driftCtl: driftB });
    if (driftA !== tsA.taught) teachMismatches.push({ seed: seed, issue: 'drift lines != taught slots on arm leg', driftArm: driftA, taughtArm: tsA.taught });
    // Holder must never be taught (scope boundary, prereg §1).
    if (tsB.holderTaught !== 0) teachMismatches.push({ seed: seed, issue: 'holder taught on control leg', n: tsB.holderTaught });
    if (tsA.holderTaught !== 0) teachMismatches.push({ seed: seed, issue: 'holder taught on arm leg', n: tsA.holderTaught });
    // Control leg must teach 0 (bar 1 instrument sanity).
    if (tsB.taught !== 0) teachMismatches.push({ seed: seed, issue: 'control leg taught slots (instrument broken)', n: tsB.taught });
    // Structured departBeats must be byte-identical.
    const dbs = JSON.stringify(b.departBeats || []);
    const das = JSON.stringify(a.departBeats || []);
    if (dbs !== das) structMismatches.push({ seed: seed, issue: 'departBeats differ' });
    if (bd !== ad || bl !== al || b.days !== a.days || b.endReason !== a.endReason) {
      metaMismatches.push({ seed: seed, issue: 'run meta differs',
        deathsBefore: bd, deathsAfter: ad, launchesBefore: bl, launchesAfter: al,
        daysBefore: b.days, daysAfter: a.days, endBefore: b.endReason, endAfter: a.endReason });
    }
    // Sense-test material: taught beats on the arm leg, with the
    // beat line + the drift line that follows it (paired by day).
    if (tsA.taught > 0) {
      for (const r of (a.teachRows || [])) {
        if (!r || !r.ordinarySpoke) continue;
        for (const s of (r.slots || [])) {
          if (!s.taught) continue;
          const beat = (a.beatLines || []).find(function (x) { return x.day === r.day; });
          const drift = (a.driftLines || []).find(function (x) { return x.day === r.day; });
          taughtExamples.push({ seed: seed, day: r.day, holder: r.vid,
            companion: s.companion, beat: beat ? beat.text : null,
            drift: drift ? drift.text : null });
        }
      }
    }
    perSeed[seed] = { teachCtl: tsB, teachArm: tsA,
      driftCtl: driftB, driftArm: driftA,
      beatsBefore: bb.length, beatsAfter: ab.length,
      descriptorsBefore: descB, descriptorsAfter: descA,
      deathsBefore: bd, deathsAfter: ad, launchesBefore: bl, launchesAfter: al,
      daysBefore: b.days, daysAfter: a.days,
      endBefore: b.endReason, endAfter: a.endReason };
  }
  const teachRateArm = totalUnknownBeforeArm > 0 ? totalTaughtArm / totalUnknownBeforeArm : null;
  const denominatorOk = totalUnknownBeforeArm >= 10;
  const bars = {
    B1_teach: denominatorOk && teachRateArm != null && teachRateArm >= 0.80 && totalTaughtCtl === 0,
    B2_noRegression: lineMismatches.length === 0 && structMismatches.length === 0 && metaMismatches.length === 0,
    B3_beatIntegrity: lineMismatches.length === 0 && teachMismatches.length === 0,
    B6_denominator: denominatorOk,
  };
  let verdict;
  if (!denominatorOk) verdict = 'EXTEND-BAND';
  else verdict = (bars.B1_teach && bars.B2_noRegression && bars.B3_beatIntegrity) ? 'GO' : 'NO-GO';
  return { seeds: seeds, perSeed: perSeed,
    totals: { unknownBeforeCtl: totalUnknownBefore, unknownBeforeArm: totalUnknownBeforeArm,
      taughtCtl: totalTaughtCtl, taughtArm: totalTaughtArm, teachRateArm: teachRateArm,
      driftCtl: totalDriftCtl, driftArm: totalDriftArm,
      deathsBefore: totalDeathsBefore, deathsAfter: totalDeathsAfter,
      launchesBefore: totalLaunchesBefore, launchesAfter: totalLaunchesAfter },
    taughtExamples: taughtExamples,
    lineMismatches: lineMismatches, structMismatches: structMismatches,
    metaMismatches: metaMismatches, teachMismatches: teachMismatches,
    bars: bars, verdict: verdict };
}

function selftest() {
  let p = 0, f = 0;
  function check(name, cond, extra) {
    if (cond) { p++; console.log('PASS ' + name); }
    else { f++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // teachStats: named beats only; reseed-spoke rows do not count.
  const rows1 = [
    { day: 5, vid: 'sean', launched: ['mara'], ordinarySpoke: true, systemArrivedBefore: false,
      holderKnownBefore: true, holderKnownAfter: true,
      slots: [{ companion: 'mara', knownBefore: false, knownAfter: true, taught: true }] },
    { day: 6, vid: 'sean', launched: ['mara', 'emmett'], ordinarySpoke: true, systemArrivedBefore: false,
      holderKnownBefore: true, holderKnownAfter: true,
      slots: [{ companion: 'mara', knownBefore: true, knownAfter: true, taught: false },
              { companion: 'emmett', knownBefore: false, knownAfter: false, taught: false }] },
    { day: 7, vid: 'sean', launched: ['mara'], ordinarySpoke: false, systemArrivedBefore: false,
      holderKnownBefore: true, holderKnownAfter: true,
      slots: [{ companion: 'mara', knownBefore: false, knownAfter: false, taught: false }] },
    { day: 9, vid: 'sean', launched: ['mara'], ordinarySpoke: true, systemArrivedBefore: true,
      holderKnownBefore: true, holderKnownAfter: true,
      slots: [{ companion: 'mara', knownBefore: true, knownAfter: true, taught: false }] },
  ];
  const ts1 = teachStats(rows1);
  check('teachStats: named beats counted, reseed-spoke row excluded',
    ts1.namedBeats === 3 && ts1.slots === 4 && ts1.postSystemSlots === 1, ts1);
  check('teachStats: unknown-before / taught / already-known split',
    ts1.unknownBefore === 2 && ts1.taught === 1 && ts1.alreadyKnown === 1, ts1);
  check('teachStats: teach rate 1/2 on the synthetic rows',
    ts1.teachRate === 0.5, ts1);
  check('teachStats: holder never taught on clean rows',
    ts1.holderTaught === 0, ts1);
  const rowsHolder = [
    { day: 5, vid: 'sean', launched: ['mara'], ordinarySpoke: true, systemArrivedBefore: false,
      holderKnownBefore: false, holderKnownAfter: true,
      slots: [{ companion: 'mara', knownBefore: false, knownAfter: true, taught: true }] },
  ];
  check('teachStats: a holder flip is counted as holderTaught (scope violation)',
    teachStats(rowsHolder).holderTaught === 1, teachStats(rowsHolder));
  check('teachStats: empty rows → null rate (no denominator)',
    teachStats([]).teachRate === null && teachStats([]).unknownBefore === 0, teachStats([]));
  // beatLinesIdentical: strict day+text equality.
  const blB = [{ day: 5, text: 'Sean sets out with Mara after Herald — the fire marks the trail.' }];
  check('beatLinesIdentical: identical lines pass',
    beatLinesIdentical(blB, [{ day: 5, text: 'Sean sets out with Mara after Herald — the fire marks the trail.' }]));
  check('beatLinesIdentical: changed text fails',
    !beatLinesIdentical(blB, [{ day: 5, text: 'Sean sets out with Emmett after Herald — the fire marks the trail.' }]));
  check('beatLinesIdentical: changed day fails',
    !beatLinesIdentical(blB, [{ day: 6, text: 'Sean sets out with Mara after Herald — the fire marks the trail.' }]));
  check('beatLinesIdentical: different count fails',
    !beatLinesIdentical(blB, []));
  // descriptorCount / beatKind (inherited helpers).
  check('descriptorCount: two in one line', descriptorCount('A man, maybe 40s, with a long braid sets out with A woman, maybe 30s — the fire marks the trail.') === 2);
  check('descriptorCount: zero on a named line', descriptorCount('Sean sets out with Mara — the fire marks the trail.') === 0);
  check('beatKind: depart', beatKind('Sean sets out with Mara — the fire marks the trail.') === 'depart');
  check('lineMatchesAfter: identical lines (no descriptor) match',
    lineMatchesAfter('Sean sets out with Mara after Herald — the fire marks the trail.',
      'Sean sets out with Mara after Herald — the fire marks the trail.'));
  check('lineMatchesAfter: descriptor -> name still classifies as a substitution (not identity)',
    lineMatchesAfter('Sean sets out with A person, maybe 40s, with deep-set eyes — the fire marks the trail.',
      'Sean sets out with Mara — the fire marks the trail.'));
  console.log('analyze-departteach-a selftest: ' + p + ' passed, ' + f + ' failed');
  process.exit(f === 0 ? 0 : 1);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { selftest(); return; }
  function arg(name) {
    const i = args.indexOf(name);
    return i !== -1 ? args[i + 1] : null;
  }
  const beforeDir = arg('--before'), afterDir = arg('--after'), outPath = arg('--out');
  if (!beforeDir || !afterDir) {
    console.error('Usage: node scripts/analyze-departteach-a.js --before <dir> --after <dir> [--out <analysis.json>] [--selftest]');
    process.exit(2);
  }
  const res = analyze(beforeDir, afterDir);
  console.log(JSON.stringify({
    verdict: res.verdict,
    bars: res.bars,
    totals: res.totals,
    taughtExamples: res.taughtExamples.slice(0, 10),
    lineMismatches: res.lineMismatches,
    structMismatches: res.structMismatches,
    metaMismatches: res.metaMismatches,
    teachMismatches: res.teachMismatches,
  }, null, 2));
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(res, null, 2) + '\n');
  process.exit(res.verdict === 'GO' ? 0 : 1);
}
module.exports = { analyze: analyze, teachStats: teachStats, beatLinesIdentical: beatLinesIdentical,
  descriptorCount: descriptorCount, beatKind: beatKind, lineMatchesAfter: lineMatchesAfter };
