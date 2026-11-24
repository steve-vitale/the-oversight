// analyze-holdspeak-a.js — analyzer + judge, arm sim-holdspeak-a.
// Compares the before/after per-seed corpora produced by
// scripts/dawnchoke-driver-a.js (extended with holdLines + holdCause)
// and judges the frozen GO bars from
// evidence/2026-11-24/sim-holdspeak-a-prereg.md.
//
// What it checks, per seed:
//   * hold-days: distinct (day, vid) with a 'hold' departCalls verdict.
//     The after leg must voice >= 80% of them (B1) — a hold line in
//     after.holdLines with the same day and the holder's true first
//     name (the driver records holderName = npcName at call time; the
//     line's leading name token is recorded by the driver too, so the
//     join never re-parses a name).
//   * reason match: each voiced day's FIRST hold line must name the
//     verdict's actual cause family (kit / companion / veteran /
//     no-trail / sick / hurt / range0 / unknown), classified by the
//     line's reason token. A wrong-reason line is a defect, not a
//     pass — mismatches are listed, never averaged away.
//   * B2 no-regression: per-seed deaths, v4departs launch counts,
//     beatLines (count + exact text), departBeats rows, days and
//     endReason identical before vs after — the fix is text-only.
//   * the before leg must carry ZERO holdLines (the measured
//     silence: finding #2713) and the after leg's hold lines must
//     carry no stranger descriptor and must start with a name token.
// Usage:
//   node scripts/analyze-holdspeak-a.js --before <dir> --after <dir>
//     [--out <analysis.json>] [--selftest]
//   (dirs hold dawnchoke-a-s<seed>-<run>-ctl.json per seed.)
'use strict';
const fs = require('fs');
const path = require('path');

const DESCRIPTOR_RE = /A (person|man|woman), maybe \d0s/;
const NAME_TOKEN_RE = /^[A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ'’\-]*$/;
const CLOSER_RE = /— the party waits\.$/;

// holdCause (driver) -> reason family (line token). 'other' is a hold
// verdict the voice does not cover (e.g. a winPlanDepart 'hold' —
// none in the census); it counts as unvoiced and is reported.
function causeFamily(cause) {
  if (cause === 'gear_hold') return 'kit';
  if (cause === 'party_wait') return 'companion';
  if (cause === 'veteran_guard') return 'veteran';
  if (cause === 'expired:no-trail') return 'no-trail';
  if (cause === 'execute:sick') return 'sick';
  if (cause === 'execute:hurt') return 'hurt';
  if (cause === 'execute:range0') return 'range0';
  if (cause === 'execute:unknown') return 'unknown';
  return 'other';
}
// lineFamily(text): the reason family a hold line names, by its
// reason token. Returns 'other' when no token matches (unclassifiable
// — a defect, listed for the audit).
function lineFamily(text) {
  const t = String(text || '');
  if (/no weapon|no armor/.test(t)) return 'kit';
  if (/no one to walk out with|waiting on a companion/.test(t)) return 'companion';
  if (/kills for the table/.test(t)) return 'veteran';
  if (/no trail/.test(t)) return 'no-trail';
  if (/is sick/.test(t)) return 'sick';
  if (/still hurt/.test(t)) return 'hurt';
  if (/never leaves Haven/.test(t)) return 'range0';
  if (/couldn't get out/.test(t)) return 'unknown';
  return 'other';
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

// holdDays(corpusRow): distinct (day, vid) hold verdicts, each with
// the FIRST verdict's cause + holderName that day (the line fires at
// the first hold return of the day, so the first verdict is the cause
// the line must name).
function holdDays(row) {
  const map = {};
  for (const r of (row.departCalls || [])) {
    if (r.result !== 'hold') continue;
    const key = r.day + '>' + r.vid;
    if (!map[key]) {
      map[key] = { day: r.day, vid: r.vid, cause: r.holdCause || null,
        family: causeFamily(r.holdCause || null), holderName: r.holderName || null,
        source: r.source || null, verdicts: 0 };
    }
    map[key].verdicts++;
  }
  return Object.keys(map).sort().map(function (k) { return map[k]; });
}

function analyzeSeed(before, after) {
  const bd = holdDays(before);
  const ad = holdDays(after);
  const beforeLines = before.holdLines || [];
  const afterLines = after.holdLines || [];
  // Voice join: group hold-days and lines by (day, holderName).
  // Ambiguity (two holders, same first name, same day) is counted
  // conservatively: voiced = min(lines, days) per group.
  const dayGroups = {};
  for (const d of ad) {
    const k = d.day + '>' + (d.holderName || '?');
    (dayGroups[k] = dayGroups[k] || { days: [], lines: [] }).days.push(d);
  }
  for (const l of afterLines) {
    const k = l.day + '>' + (l.name || '?');
    (dayGroups[k] = dayGroups[k] || { days: [], lines: [] }).lines.push(l);
  }
  let voiced = 0, unvoiced = [];
  const reasonMismatches = [];
  const auditSample = [];
  for (const k of Object.keys(dayGroups).sort()) {
    const g = dayGroups[k];
    const n = Math.min(g.days.length, g.lines.length);
    voiced += n;
    for (let i = n; i < g.days.length; i++) unvoiced.push(g.days[i]);
    // Reason audit: the first n days (in day order) pair with the
    // first n lines (in corpus order) — the line fires at the first
    // hold return of the day, so pairing in order is exact when
    // lines <= days; ambiguous groups are flagged, not assumed.
    const daysSorted = g.days.slice().sort(function (a, b) { return a.vid < b.vid ? -1 : 1; });
    const linesSorted = g.lines.slice();
    for (let i = 0; i < n; i++) {
      const fam = lineFamily(linesSorted[i].text);
      const want = daysSorted[i].family;
      const rec = { day: daysSorted[i].day, vid: daysSorted[i].vid,
        holderName: daysSorted[i].holderName, cause: daysSorted[i].cause,
        want: want, got: fam, text: linesSorted[i].text,
        match: fam === want, ambiguous: g.days.length > 1 };
      auditSample.push(rec);
      if (fam !== want) reasonMismatches.push(rec);
    }
  }
  // B2 identity checks.
  const deathsB = (before.deaths || []).length;
  const deathsA = (after.deaths || []).length;
  const launchesB = (before.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
  const launchesA = (after.v4departs || []).filter(function (r) { return r.result === 'launch'; }).length;
  const beatsB = (before.beatLines || []).map(function (l) { return l.day + '|' + l.text; });
  const beatsA = (after.beatLines || []).map(function (l) { return l.day + '|' + l.text; });
  const beatsEqual = beatsB.length === beatsA.length && beatsB.every(function (v, i) { return v === beatsA[i]; });
  const structB = JSON.stringify(before.departBeats || []);
  const structA = JSON.stringify(after.departBeats || []);
  const badLines = afterLines.filter(function (l) {
    return DESCRIPTOR_RE.test(l.text) || !NAME_TOKEN_RE.test(l.name || '') || !CLOSER_RE.test(l.text);
  });
  return {
    seed: before.seed,
    holdDaysBefore: bd.length, holdDaysAfter: ad.length,
    holdVerdictsBefore: bd.reduce(function (s, d) { return s + d.verdicts; }, 0),
    holdVerdictsAfter: ad.reduce(function (s, d) { return s + d.verdicts; }, 0),
    holdLinesBefore: beforeLines.length, holdLinesAfter: afterLines.length,
    voicedDays: voiced, unvoicedDays: unvoiced,
    reasonMismatches: reasonMismatches, auditSample: auditSample,
    badLines: badLines.map(function (l) { return l.text; }),
    causesAfter: (function () { const c = {}; ad.forEach(function (d) { c[d.family] = (c[d.family] || 0) + 1; }); return c; })(),
    deathsBefore: deathsB, deathsAfter: deathsA,
    launchesBefore: launchesB, launchesAfter: launchesA,
    beatLinesBefore: beatsB.length, beatLinesAfter: beatsA.length, beatsEqual: beatsEqual,
    departBeatsEqual: structB === structA,
    daysEqual: before.days === after.days, endReasonEqual: before.endReason === after.endReason,
    holdDaysIdentical: JSON.stringify(bd.map(function (d) { return [d.day, d.vid, d.cause]; })) ===
      JSON.stringify(ad.map(function (d) { return [d.day, d.vid, d.cause]; })),
  };
}

function analyze(beforeDir, afterDir) {
  const before = loadCorpus(beforeDir);
  const after = loadCorpus(afterDir);
  const seeds = Object.keys(before).map(Number).sort(function (a, b) { return a - b; });
  const perSeed = {};
  let totalDays = 0, totalVoiced = 0, totalMismatches = 0, totalBad = 0;
  let b2pass = true;
  const b2fails = [];
  for (const seed of seeds) {
    if (!after[seed]) { b2pass = false; b2fails.push('seed ' + seed + ': missing after corpus'); continue; }
    const r = analyzeSeed(before[seed], after[seed]);
    perSeed[seed] = r;
    totalDays += r.holdDaysAfter;
    totalVoiced += r.voicedDays;
    totalMismatches += r.reasonMismatches.length;
    totalBad += r.badLines.length;
    if (r.holdLinesBefore !== 0) { b2pass = false; b2fails.push('seed ' + seed + ': before leg has ' + r.holdLinesBefore + ' holdLines (silence baseline broken)'); }
    if (!r.holdDaysIdentical) { b2pass = false; b2fails.push('seed ' + seed + ': hold-day sets differ before/after'); }
    if (r.deathsBefore !== r.deathsAfter) { b2pass = false; b2fails.push('seed ' + seed + ': deaths ' + r.deathsBefore + ' -> ' + r.deathsAfter); }
    if (r.launchesBefore !== r.launchesAfter) { b2pass = false; b2fails.push('seed ' + seed + ': launches ' + r.launchesBefore + ' -> ' + r.launchesAfter); }
    if (!r.beatsEqual) { b2pass = false; b2fails.push('seed ' + seed + ': beatLines differ (' + r.beatLinesBefore + ' vs ' + r.beatLinesAfter + ')'); }
    if (!r.departBeatsEqual) { b2pass = false; b2fails.push('seed ' + seed + ': departBeats rows differ'); }
    if (!r.daysEqual || !r.endReasonEqual) { b2pass = false; b2fails.push('seed ' + seed + ': days/endReason differ'); }
    if (r.badLines.length) { b2pass = false; b2fails.push('seed ' + seed + ': ' + r.badLines.length + ' malformed hold lines'); }
  }
  // Sampled audit: all mismatches + up to 10 matched lines per family.
  const sample = [];
  const perFamily = {};
  for (const seed of seeds) {
    const r = perSeed[seed];
    if (!r) continue;
    for (const rec of r.auditSample) {
      if (!rec.match) { sample.push(Object.assign({ seed: seed }, rec)); continue; }
      perFamily[rec.want] = perFamily[rec.want] || 0;
      if (perFamily[rec.want] < 10) { perFamily[rec.want]++; sample.push(Object.assign({ seed: seed }, rec)); }
    }
  }
  const voicedShare = totalDays ? totalVoiced / totalDays : null;
  const b1pass = totalDays >= 5 && voicedShare != null && voicedShare >= 0.8 && totalMismatches === 0;
  return {
    verdict: (b1pass && b2pass) ? 'GO' : 'NO-GO',
    bars: { B1_voicedShare: voicedShare, B1_pass: b1pass, B2_pass: b2pass, B2_fails: b2fails },
    totals: { holdDays: totalDays, voicedDays: totalVoiced, reasonMismatches: totalMismatches,
      badLines: totalBad, sampleSize: sample.length },
    perSeed: perSeed,
    auditSample: sample,
  };
}

// ---------- selftest ----------
function seedOut(o) {
  return Object.assign({ seed: 1, days: 150, endReason: 'survived',
    deaths: [], v4departs: [], beatLines: [], departBeats: [], holdLines: [], departCalls: [] }, o || {});
}
function holdCall(day, vid, cause, name) {
  return { day: day, vid: vid, source: 'brain', commitWinPlanAction: cause, result: 'hold',
    holdCause: cause, holderName: name || 'Mara' };
}
function holdLine(day, name, text) {
  return { day: day, name: name, text: text };
}
function selftest() {
  let p = 0, f = 0;
  function ck(name, cond) { if (cond) { p++; console.log('PASS ' + name); } else { f++; console.log('FAIL ' + name); } }
  // 1. One voiced day, reason matches.
  (function () {
    const b = seedOut({ departCalls: [holdCall(10, 'mara', 'party_wait')] });
    const a = seedOut({ departCalls: [holdCall(10, 'mara', 'party_wait')],
      holdLines: [holdLine(10, 'Mara', 'Mara has no one to walk out with — the party waits.')] });
    const r = analyzeSeed(b, a);
    ck('selftest voiced day counts', r.voicedDays === 1 && r.holdDaysAfter === 1);
    ck('selftest reason matches', r.reasonMismatches.length === 0);
  })();
  // 2. Multi-tick day: 3 verdicts, 1 line -> 1 voiced day.
  (function () {
    const calls = [holdCall(12, 'mara', 'execute:hurt'), holdCall(12, 'mara', 'execute:hurt'), holdCall(12, 'mara', 'execute:hurt')];
    const b = seedOut({ departCalls: calls });
    const a = seedOut({ departCalls: calls,
      holdLines: [holdLine(12, 'Mara', 'Mara is still hurt, and no one who can walk will take the plan — the party waits.')] });
    const r = analyzeSeed(b, a);
    ck('selftest multi-tick day is one hold-day', r.holdDaysAfter === 1 && r.voicedDays === 1);
  })();
  // 3. Reason mismatch is listed, never averaged away.
  (function () {
    const b = seedOut({ departCalls: [holdCall(10, 'mara', 'execute:hurt')] });
    const a = seedOut({ departCalls: [holdCall(10, 'mara', 'execute:hurt')],
      holdLines: [holdLine(10, 'Mara', 'Mara has no weapon and no armor yet — the party waits.')] });
    const r = analyzeSeed(b, a);
    ck('selftest wrong-reason line mismatches', r.reasonMismatches.length === 1 &&
      r.reasonMismatches[0].want === 'hurt' && r.reasonMismatches[0].got === 'kit');
  })();
  // 4. Unvoiced day + apostrophe name + descriptor in a line.
  (function () {
    const b = seedOut({ departCalls: [holdCall(10, 'mara', 'party_wait'), holdCall(11, 'chepng', 'gear_hold', "Chepng'etich")] });
    const a = seedOut({ departCalls: [holdCall(10, 'mara', 'party_wait'), holdCall(11, 'chepng', 'gear_hold', "Chepng'etich")],
      holdLines: [holdLine(11, "Chepng'etich", "Chepng'etich has no weapon and no armor yet — the party waits.")] });
    const r = analyzeSeed(b, a);
    ck('selftest unvoiced day listed', r.unvoicedDays.length === 1 && r.unvoicedDays[0].day === 10);
    ck('selftest apostrophe name joins', r.voicedDays === 1);
    const bad = seedOut({ departCalls: [holdCall(10, 'mara', 'party_wait')],
      holdLines: [holdLine(10, 'Mara', 'A person, maybe 40s, with deep-set eyes has no one to walk out with — the party waits.')] });
    ck('selftest descriptor line is malformed', analyzeSeed(b, bad).badLines.length === 1);
  })();
  // 5. 'other' hold (winPlanDepart) counts unvoiced.
  (function () {
    const b = seedOut({ departCalls: [{ day: 10, vid: 'mara', source: 'winPlanDepart', result: 'hold', holdCause: 'other', holderName: 'Mara' }] });
    const a = seedOut({ departCalls: [{ day: 10, vid: 'mara', source: 'winPlanDepart', result: 'hold', holdCause: 'other', holderName: 'Mara' }] });
    const r = analyzeSeed(b, a);
    ck('selftest other-cause hold is unvoiced', r.voicedDays === 0 && r.unvoicedDays.length === 1);
  })();
  // 6. B2: deaths / beatLines / departBeats identity.
  (function () {
    const b = seedOut({ deaths: [{ day: 5 }], beatLines: [{ day: 6, text: 'X sets out with Y — the fire marks the trail.' }],
      departBeats: [{ day: 6, vid: 'x' }], departCalls: [holdCall(10, 'mara', 'party_wait')] });
    const a = seedOut({ deaths: [{ day: 5 }, { day: 7 }], beatLines: [{ day: 6, text: 'X sets out with Y — the fire marks the trail.' }],
      departBeats: [{ day: 6, vid: 'x' }], departCalls: [holdCall(10, 'mara', 'party_wait')],
      holdLines: [holdLine(10, 'Mara', 'Mara has no one to walk out with — the party waits.')] });
    const r = analyzeSeed(b, a);
    ck('selftest death mismatch detected', r.deathsBefore !== r.deathsAfter);
    const a2 = seedOut({ deaths: [{ day: 5 }],
      beatLines: [{ day: 6, text: 'X sets out with Z — the fire marks the trail.' }],
      departBeats: [{ day: 6, vid: 'x' }], departCalls: [holdCall(10, 'mara', 'party_wait')],
      holdLines: [holdLine(10, 'Mara', 'Mara has no one to walk out with — the party waits.')] });
    ck('selftest beat-line edit detected', analyzeSeed(b, a2).beatsEqual === false);
  })();
  // 7. Full analyze(): GO shape and NO-GO shape.
  (function () {
    const fs2 = require('fs'), os = require('os');
    const tmp = fs2.mkdtempSync(path.join(os.tmpdir(), 'holdspeak-selftest-'));
    const bd = path.join(tmp, 'before'), ad = path.join(tmp, 'after');
    fs2.mkdirSync(bd); fs2.mkdirSync(ad);
    const b = seedOut({ seed: 99, departCalls: [holdCall(10, 'mara', 'party_wait'), holdCall(11, 'mara', 'party_wait'),
      holdCall(12, 'mara', 'party_wait'), holdCall(13, 'mara', 'party_wait'), holdCall(14, 'mara', 'party_wait'),
      holdCall(15, 'mara', 'party_wait')] });
    const a = seedOut({ seed: 99, departCalls: b.departCalls,
      holdLines: [10, 11, 12, 13, 14, 15].map(function (d) { return holdLine(d, 'Mara', 'Mara has no one to walk out with — the party waits.'); }) });
    fs2.writeFileSync(path.join(bd, 'dawnchoke-a-s99-x-ctl.json'), JSON.stringify(b));
    fs2.writeFileSync(path.join(ad, 'dawnchoke-a-s99-x-ctl.json'), JSON.stringify(a));
    const res = analyze(bd, ad);
    ck('selftest full analyze GO on 6/6 voiced', res.verdict === 'GO' && res.totals.voicedDays === 6);
    fs2.writeFileSync(path.join(ad, 'dawnchoke-a-s99-x-ctl.json'),
      JSON.stringify(seedOut({ seed: 99, departCalls: b.departCalls, holdLines: [] })));
    ck('selftest full analyze NO-GO on 0/6 voiced', analyze(bd, ad).verdict === 'NO-GO');
  })();
  console.log('----');
  console.log(p + ' passed, ' + f + ' failed');
  return f === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  const bi = args.indexOf('--before'), ai = args.indexOf('--after'), oi = args.indexOf('--out');
  if (bi === -1 || ai === -1) {
    console.error('usage: node scripts/analyze-holdspeak-a.js --before <dir> --after <dir> [--out <analysis.json>] [--selftest]');
    process.exit(2);
  }
  const res = analyze(args[bi + 1], args[ai + 1]);
  console.log(JSON.stringify(res, null, 2));
  if (oi !== -1) fs.writeFileSync(args[oi + 1], JSON.stringify(res, null, 2) + '\n');
  process.exit(res.verdict === 'GO' ? 0 : 1);
}
module.exports = { analyze: analyze, analyzeSeed: analyzeSeed, causeFamily: causeFamily, lineFamily: lineFamily, selftest: selftest };
