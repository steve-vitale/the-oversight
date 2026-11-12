// pairarming-analyze-20261112.js — analyzer for the wave-5
// pair-arming diagnostic (arm sim-pairarming-a). Reads the 8
// per-seed JSONs (seeds 190391–190398, the vetphantom band) from
// evidence/2026-11-12/perseed-pairarming-a/ and judges them
// against the prereg (evidence/2026-11-12/
// sim-pairarming-a-prereg.md).
//
// THE QUESTION (r9 §5, §8.5): on the r9 base, seed 190398 holds a
// wave-5 pair for 19 days (d131–149) with armed 4–5 vs demand 6
// and never qualifies; armed falls 4 → 3 over the block. WHY do
// armed counts fall while a pair holds — not whether pairs form.
//
// GO BAR — instrument validity ONLY (the mechanism finding itself
// is REPORTED, never judged):
//   (a) the gear trajectory is captured on 100% of deferral-hold
//       days on all 8 seeds (implemented as: gearDaily covers
//       every vetfirst daily day on every seed — a gear snapshot
//       missing on any day fails coverage, and every
//       deferral-hold day is therefore captured);
//   (b) every armed-count drop on a deferral-hold day is
//       attributed to classes 1–6 or counted unattributed;
//   (c) REPLAY IDENTITY: the ready5 armed/armored/veterans
//       trajectory AND roster length match the r9 corpus
//       (evidence/2026-11-12/perseed-bisect-r9-cut-a/) day-for-day
//       on 100% of days on all 8 seeds.
// GO requires: unattributed drops <= 1 across the whole band AND
// 100% deferral-hold-day coverage AND replay identity on 100% of
// days. Anything else is instrument NO-GO: the evidence reports
// what failed and what instrument would settle it, and the
// mechanism finding is not presented as settled.
// Exit 0 on a classified outcome (GO or NO-GO) with a complete
// corpus and 0 instrument errors; exit 1 on corpus incompleteness,
// instrument failure, or an unclassifiable read. The verdict is
// the classification — never re-scored.
// SECONDARY (reported, not judged): the mechanism finding — which
// classes explain the armed drops on hold days (death / departure
// / gear-loss transferred / gear-loss stolen-vanished / other /
// unattributed), ceiling days (roster < 6), the 190398 hold
// narrative; plus the wall numbers (national / table / wins,
// wave 4–5 unlocks, median survival).
// Usage: node scripts/pairarming-analyze-20261112.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PA = require(path.join(__dirname, 'pairarming-instrument-20261112'));
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-pairarming-a');
const R9DIR = path.join(REPO, 'evidence', '2026-11-12', 'perseed-bisect-r9-cut-a');
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const RUN = 'pairarming-pilot';

function perSeedFile(seed, dir) {
  return path.join(dir || DIR, 'pairarming-s' + seed + '-' + RUN + '-fix.json');
}

function r9File(seed) {
  return path.join(R9DIR, 'bisect-r9-cut-s' + seed + '-bisect-r9-cut-pilot-fix.json');
}

function loadR9Daily(seed) {
  // The r9 corpus lives on master. During the run this worktree is
  // on the old r9 base, so the REPO-relative copy does not exist
  // here — read it from the local master ref. After rebase onto
  // master the REPO-relative copy exists and is preferred.
  const f = r9File(seed);
  if (fs.existsSync(f)) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    return d.daily || null;
  }
  try {
    const rel = path.relative(REPO, f);
    // The r9 per-seed files are 1.1–2.2 MB (190394 is the only one
    // under 1 MB at 349 KB); execSync's default 1 MB maxBuffer
    // throws "maxBuffer length exceeded" on the other seven and the
    // catch below silently reports them unreadable. Size the buffer
    // for the corpus.
    const txt = execSync('git show master:' + rel, { cwd: REPO, maxBuffer: 64 * 1024 * 1024 }).toString();
    const d = JSON.parse(txt);
    return d.daily || null;
  } catch (e) { return null; }
}

function loadCorpus(seeds, dir) {
  const rows = [];
  const missing = [];
  for (const seed of seeds) {
    const f = perSeedFile(seed, dir);
    if (!fs.existsSync(f)) { missing.push(seed); continue; }
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    rows.push(d);
  }
  return { rows: rows, missing: missing, complete: missing.length === 0 && rows.length === seeds.length };
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function deathCauseShares(rows) {
  const counts = {};
  let total = 0;
  for (const d of rows) {
    for (const death of (d.deaths || [])) {
      const c = death.cause || death.kind || 'unknown';
      counts[c] = (counts[c] || 0) + 1;
      total++;
    }
  }
  return { total: total, counts: counts };
}

// compareReplay(thisDaily, r9Daily): day-aligned comparison of the
// ready5 armed/armored/veterans trajectory and roster length.
// Days are aligned by day value AND by occurrence within the day:
// both drivers emit TWO snapshots for the village-loss day (the
// in-day snapshot, then a post-loss flush with the roster emptied),
// and day 3 is skipped by both drivers, so a plain day→entry map
// collapses the duplicate and compares the in-day snapshot against
// the post-loss flush (190394 d43: roster 1 vs 0 — a false
// mismatch). Occurrences are consumed in order; a missing or extra
// occurrence counts as a mismatch, exactly as a missing day does.
// Returns { days: N, mismatches: [{day, field, a, b}], uncomparable: [...] }.
function compareReplay(thisDaily, r9Daily) {
  const out = { days: 0, mismatches: [], uncomparable: [] };
  if (!Array.isArray(thisDaily) || !Array.isArray(r9Daily)) {
    out.uncomparable.push('missing daily array');
    return out;
  }
  const queues = {};
  for (const s of r9Daily) {
    if (s && typeof s.day === 'number') {
      if (!queues[s.day]) queues[s.day] = [];
      queues[s.day].push(s);
    }
  }
  for (const s of thisDaily) {
    if (!s || typeof s.day !== 'number') continue;
    out.days++;
    const q = queues[s.day];
    const r = (q && q.length) ? q.shift() : null;
    if (!r) { out.mismatches.push({ day: s.day, field: 'day-missing-in-r9', a: s.day, b: null }); continue; }
    const fields = [
      ['armed', (s.ready5 || {}).armed, (r.ready5 || {}).armed],
      ['armored', (s.ready5 || {}).armored, (r.ready5 || {}).armored],
      ['veterans', (s.ready5 || {}).veterans, (r.ready5 || {}).veterans],
      ['rosterLength', (s.roster || []).length, (r.roster || []).length],
    ];
    for (const f of fields) {
      if (f[1] === undefined || f[1] === null || f[2] === undefined || f[2] === null) {
        out.uncomparable.push('seed day ' + s.day + ' field ' + f[0] + ' unreadable');
        continue;
      }
      if (f[1] !== f[2]) out.mismatches.push({ day: s.day, field: f[0], a: f[1], b: f[2] });
    }
  }
  // Leftover r9 occurrences: days (or extra occurrences of a day)
  // present in r9 but not in this corpus.
  for (const day of Object.keys(queues)) {
    for (const s of queues[day]) {
      out.mismatches.push({ day: Number(day), field: 'day-missing-in-this', a: null, b: s.day });
    }
  }
  return out;
}

function analyzeSeed(d) {
  const gearDaily = d.gearDaily || [];
  const gearDiffs = d.gearDiffs || [];
  const daily = d.daily || [];
  const holds = PA.findHoldBlocks(gearDaily);
  const holdDays = holds.perDay.filter(function (p) { return p.deferralHold; });
  // Coverage: gearDaily must cover every vetfirst daily day.
  const vfDays = {};
  for (const s of daily) if (s && typeof s.day === 'number') vfDays[s.day] = true;
  const gearDays = {};
  for (const s of gearDaily) if (s && typeof s.day === 'number') gearDays[s.day] = true;
  let coveredDays = 0;
  let missingGearDays = [];
  for (const day of Object.keys(vfDays)) {
    if (gearDays[day]) coveredDays++;
    else missingGearDays.push(Number(day));
  }
  const coverage = { vfDays: Object.keys(vfDays).length, gearDays: Object.keys(gearDays).length, coveredDays: coveredDays, missingGearDays: missingGearDays };
  // Armed drops on deferral-hold days, with attribution.
  const diffByDay = {};
  for (const diff of gearDiffs) if (diff && typeof diff.day === 'number') diffByDay[diff.day] = diff;
  const drops = [];
  const classCounts = {};
  let unattributed = 0;
  for (let i = 1; i < gearDaily.length; i++) {
    const prev = gearDaily[i - 1];
    const cur = gearDaily[i];
    if (!prev || !cur) continue;
    const isHoldDay = holds.perDay.some(function (p) { return p.day === cur.day && p.deferralHold; });
    if (!isHoldDay) continue;
    const prevArmed = (prev.ready5 && (prev.ready5.armed | 0)) || 0;
    const curArmed = (cur.ready5 && (cur.ready5.armed | 0)) || 0;
    if (curArmed >= prevArmed) continue;
    const need = prevArmed - curArmed;
    const diff = diffByDay[cur.day] || null;
    const events = (diff && diff.armedEvents) || [];
    const unattr = (diff && (diff.unattributedArmed | 0)) || 0;
    const gainsArmed = ((diff && diff.gains) || []).filter(function (g) { return g.bar === 'armed'; }).length;
    for (const ev of events) {
      const k = (ev.class || 'other') + '/' + (ev.subclass || '');
      classCounts[k] = (classCounts[k] || 0) + 1;
    }
    unattributed += unattr;
    // A drop whose events do not add up to the drop is partly
    // unattributed even if the diff says 0 (defensive: never trust
    // the count, recompute it from the walk). The net drop is
    // losses minus gains, so the walk must explain
    // (drop + gains) loss events.
    const explained = events.length;
    if (explained + unattr < need + gainsArmed) unattributed += (need + gainsArmed - explained - unattr);
    drops.push({
      day: cur.day, from: prevArmed, to: curArmed, drop: need,
      events: events.map(function (ev) { return { vid: ev.vid, name: ev.name, class: ev.class, subclass: ev.subclass, detail: ev.detail }; }),
      unattributed: unattr + Math.max(0, need + gainsArmed - explained - unattr),
    });
  }
  // Ceiling days (roster < 6 on a deferral-hold day).
  const ceilingDays = holdDays.filter(function (p) { return p.ceiling; }).map(function (p) { return p.day; });
  // Replay identity vs the r9 corpus.
  const r9Daily = loadR9Daily(d.seed);
  const replay = r9Daily ? compareReplay(daily, r9Daily) : { days: 0, mismatches: [], uncomparable: ['r9 corpus unreadable for seed ' + d.seed] };
  return {
    seed: d.seed, anchorCommit: d.anchorCommit, standingFix: d.standingFix, standingSha: d.standingSha,
    days: d.days, endReason: d.endReason, won: !!d.won, villageLost: !!d.villageLost,
    scaleRank: d.scaleRank, maxWave: d.maxWave, unlockedWave: d.unlockedWave,
    standing: d.standing, deaths: (d.deaths || []).length,
    endPantryKcal: d.endPantryKcal, blooded: !!d.blooded,
    tribute: d.tribute, ready4: d.ready4 ? d.ready4.veterans : null,
    ready5: d.ready5 ? d.ready5.veterans : null,
    ladderVets4: d.ladderVets4,
    errors: (d.instrumentErrors || []).length,
    snapshotCount: daily.length,
    gearDays: gearDaily.length,
    holds: { pairHoldDays: holds.perDay.filter(function (p) { return p.pairHold; }).length, deferralHoldDays: holdDays.length, blocks: holds.blocks, ceilingDays: ceilingDays },
    coverage: coverage,
    drops: drops,
    classCounts: classCounts,
    unattributed: unattributed,
    replay: { days: replay.days, mismatches: replay.mismatches.length, mismatchRows: replay.mismatches.slice(0, 10), uncomparable: replay.uncomparable },
  };
}

function analyzeRows(rows) {
  const perSeed = rows.map(analyzeSeed);
  const survived = perSeed.filter(function (r) { return !r.villageLost; }).length;
  const wall = {
    wins: perSeed.filter(function (r) { return r.won; }).length,
    national: perSeed.filter(function (r) { return r.scaleRank === 'national'; }).length,
    table: perSeed.filter(function (r) { return r.scaleRank === 'table'; }).length,
    regional: perSeed.filter(function (r) { return r.scaleRank === 'regional'; }).length,
    village: perSeed.filter(function (r) { return r.scaleRank === 'village'; }).length,
    wave5: perSeed.filter(function (r) { return (r.maxWave || 1) >= 5; }).length,
    wave4: perSeed.filter(function (r) { return (r.maxWave || 1) >= 4; }).length,
    medianDays: median(perSeed.map(function (r) { return r.days; })),
    survived: survived,
    deaths: perSeed.reduce(function (a, r) { return a + r.deaths; }, 0),
    standingRange: [Math.min.apply(null, perSeed.map(function (r) { return r.standing; })), Math.max.apply(null, perSeed.map(function (r) { return r.standing; }))],
    blooded: perSeed.filter(function (r) { return r.blooded; }).length,
  };
  const causes = deathCauseShares(rows);
  const instrumentErrors = perSeed.reduce(function (a, r) { return a + r.errors; }, 0);
  const unattributedTotal = perSeed.reduce(function (a, r) { return a + r.unattributed; }, 0);
  const coverageOk = perSeed.every(function (r) { return r.coverage.coveredDays === r.coverage.vfDays && r.coverage.vfDays > 0; });
  const replayOk = perSeed.every(function (r) { return r.replay.mismatches === 0 && r.replay.uncomparable.length === 0 && r.replay.days > 0; });
  const classCounts = {};
  for (const r of perSeed) {
    for (const k of Object.keys(r.classCounts)) classCounts[k] = (classCounts[k] || 0) + r.classCounts[k];
  }
  return {
    perSeed: perSeed, survived: survived, wall: wall, causes: causes,
    instrumentErrors: instrumentErrors, unattributedTotal: unattributedTotal,
    coverageOk: coverageOk, replayOk: replayOk, classCounts: classCounts,
  };
}

// judgeGO(analysis): the prereg GO bar — instrument validity only.
// Returns { verdict: 'GO' | 'NO-GO', reasons: [...] }.
function judgeGO(analysis) {
  const reasons = [];
  if (analysis.unattributedTotal > 1) reasons.push('unattributed armed drops ' + analysis.unattributedTotal + ' > 1');
  if (!analysis.coverageOk) reasons.push('gear coverage incomplete (a vetfirst day lacks a gear snapshot)');
  if (!analysis.replayOk) reasons.push('replay identity broken (ready5/roster trajectory diverges from the r9 corpus)');
  return { verdict: reasons.length === 0 ? 'GO' : 'NO-GO', reasons: reasons };
}

function main() {
  const corpus = loadCorpus(SEEDS);
  if (!corpus.complete) {
    console.error('pairarming-a: INCOMPLETE corpus — missing seeds: ' + corpus.missing.join(', '));
    process.exit(1);
  }
  const analysis = analyzeRows(corpus.rows);
  const j = judgeGO(analysis);
  const classifiable = analysis.perSeed.every(function (r) { return r.replay.days > 0; });
  const summary = {
    seeds: SEEDS, run: RUN,
    r9cutBase: 'ee30f22a2',
    standingFixSha: 'f8fda4295a99',
    perSeed: analysis.perSeed,
    survived: analysis.survived,
    verdict: j.verdict,
    reasons: j.reasons,
    classifiable: classifiable,
    wall: analysis.wall,
    deathCauses: analysis.causes,
    instrumentErrors: analysis.instrumentErrors,
    unattributedTotal: analysis.unattributedTotal,
    coverageOk: analysis.coverageOk,
    replayOk: analysis.replayOk,
    classCounts: analysis.classCounts,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-12', 'pairarming-a-summary.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2) + '\n');
  console.log('pairarming-a: ' + j.verdict + (j.reasons.length ? ' — ' + j.reasons.join('; ') : ' (instrument valid: unattributed 0, coverage 100%, replay 100%)'));
  console.log('  unattributed armed drops (band): ' + analysis.unattributedTotal + ' (bar <= 1)');
  console.log('  coverage 100%: ' + analysis.coverageOk + ' | replay identity 100%: ' + analysis.replayOk);
  console.log('  class counts (armed drops on hold days): ' + JSON.stringify(analysis.classCounts));
  console.log('  wall: wins ' + analysis.wall.wins + ', national ' + analysis.wall.national + ', table ' + analysis.wall.table + ', wave5 ' + analysis.wall.wave5 + '/8, wave4 ' + analysis.wall.wave4 + '/8, median ' + analysis.wall.medianDays + 'd, deaths ' + analysis.wall.deaths + ', standing ' + analysis.wall.standingRange[0] + '–' + analysis.wall.standingRange[1]);
  console.log('  death causes (' + analysis.causes.total + '): ' + JSON.stringify(analysis.causes.counts));
  console.log('  instrument errors: ' + analysis.instrumentErrors);
  for (const r of analysis.perSeed) {
    console.log('  seed ' + r.seed + ': ' + r.days + 'd ' + r.endReason + ' standing ' + r.standing + ' scale ' + r.scaleRank + ' maxWave ' + r.maxWave + ' pairHold ' + r.holds.pairHoldDays + 'd deferralHold ' + r.holds.deferralHoldDays + 'd drops ' + r.drops.length + ' unattributed ' + r.unattributed + ' replayMismatch ' + r.replay.mismatches + ' errors ' + r.errors);
  }
  console.log('  summary: ' + path.relative(REPO, outFile));
  if (!classifiable || analysis.instrumentErrors > 0) process.exit(1);
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  SEEDS: SEEDS, RUN: RUN, DIR: DIR, R9DIR: R9DIR,
  loadCorpus: loadCorpus, loadR9Daily: loadR9Daily,
  compareReplay: compareReplay, analyzeSeed: analyzeSeed,
  analyzeRows: analyzeRows, judgeGO: judgeGO,
  deathCauseShares: deathCauseShares, median: median,
  perSeedFile: perSeedFile, r9File: r9File,
};
