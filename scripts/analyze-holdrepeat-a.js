// analyze-holdrepeat-a.js — firmer measurement of holdspeak repetition
// (0915Z round blank #4; prereg evidence/2026-11-24/sim-holdrepeat-a-prereg.md)
//
// Corpus: REUSE of the holdspeak AFTER-leg corpora (24 seeds), declared
// a replay in the prereg — no fresh-seed claim. holdLines rows are
// {day, name, text} (first name only; the holdspeak analyzer joins by
// (day, first-name)).
// Method: group holdLines by (seed, name, text); report counts, spans,
// max consecutive-day runs, and distinct texts per holder.
// No game code touched; no new sims run.
//
// Usage: node scripts/analyze-holdrepeat-a.js [--selftest]
//        [--out evidence/2026-11-24/holdrepeat-a-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..');
const DIRS = [
  path.join(REPO, 'evidence', '2026-11-22', 'perseed-holdspeak-a-after'),
  path.join(REPO, 'evidence', '2026-11-22', 'perseed-holdspeak-a-confirm-after'),
];

function maxConsecutive(days) {
  if (!days.length) return 0;
  const s = days.slice().sort(function (a, b) { return a - b; });
  let best = 1, run = 1;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1] + 1) { run++; if (run > best) best = run; }
    else if (s[i] !== s[i - 1]) run = 1;
  }
  return best;
}

function analyzeFile(file) {
  const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = corpus.holdLines || [];
  const groups = {};
  for (const r of rows) {
    const k = (r.name || '?') + '|' + (r.text || '?');
    if (!groups[k]) groups[k] = { name: r.name || null, text: r.text || null, days: [] };
    groups[k].days.push(r.day);
  }
  const out = [];
  for (const k of Object.keys(groups)) {
    const g = groups[k];
    g.days.sort(function (a, b) { return a - b; });
    out.push({
      seed: corpus.seed, name: g.name, text: g.text,
      count: g.days.length,
      spanDays: g.days.length ? (g.days[g.days.length - 1] - g.days[0] + 1) : 0,
      firstDay: g.days[0] != null ? g.days[0] : null,
      lastDay: g.days.length ? g.days[g.days.length - 1] : null,
      maxConsecutive: maxConsecutive(g.days),
    });
  }
  // distinct texts per holder name on this seed
  const byName = {};
  for (const g of out) {
    if (!byName[g.name]) byName[g.name] = { texts: new Set(), total: 0 };
    byName[g.name].texts.add(g.text);
    byName[g.name].total += g.count;
  }
  const holders = Object.keys(byName).map(function (n) {
    return { name: n, distinctTexts: byName[n].texts.size, totalLines: byName[n].total };
  });
  return { file: path.basename(file), seed: corpus.seed, rows: rows.length, groups: out, holders: holders };
}

function analyzeAll() {
  const perSeed = [];
  let totalRows = 0, unparsed = 0;
  for (const dir of DIRS) {
    const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
    for (const f of files) {
      const a = analyzeFile(path.join(dir, f));
      perSeed.push(a);
      totalRows += a.rows;
      for (const g of a.groups) if (g.name == null || g.text == null) unparsed++;
    }
  }
  // max repeats of one line per (seed, holder)
  const maxPerHolder = [];
  for (const s of perSeed) {
    for (const g of s.groups) maxPerHolder.push({ seed: s.seed, name: g.name, text: g.text, count: g.count, spanDays: g.spanDays, maxConsecutive: g.maxConsecutive });
  }
  maxPerHolder.sort(function (a, b) { return b.count - a.count; });
  const top = maxPerHolder.slice(0, 10);
  const dist = { ge10: 0, ge20: 0, ge25: 0, ge30: 0, totalHolders: 0 };
  const perSeedMax = {};
  for (const h of maxPerHolder) {
    if (!perSeedMax[h.seed + '|' + h.name] || h.count > perSeedMax[h.seed + '|' + h.name]) perSeedMax[h.seed + '|' + h.name] = h.count;
  }
  const maxima = Object.values(perSeedMax);
  dist.totalHolders = maxima.length;
  dist.ge10 = maxima.filter(function (x) { return x >= 10; }).length;
  dist.ge20 = maxima.filter(function (x) { return x >= 20; }).length;
  dist.ge25 = maxima.filter(function (x) { return x >= 25; }).length;
  dist.ge30 = maxima.filter(function (x) { return x >= 30; }).length;
  maxima.sort(function (a, b) { return a - b; });
  const median = maxima.length ? maxima[Math.floor(maxima.length / 2)] : 0;
  // defect rule (frozen R3): a holder with one line >= 25x, <= 2 distinct
  // texts, and a >= 10 consecutive-day run.
  const defects = [];
  for (const s of perSeed) {
    for (const g of s.groups) {
      if (g.count < 25 || g.maxConsecutive < 10) continue;
      const holder = s.holders.find(function (h) { return h.name === g.name; });
      if (holder && holder.distinctTexts <= 2) {
        defects.push({ seed: s.seed, name: g.name, text: g.text, count: g.count, distinctTexts: holder.distinctTexts, maxConsecutive: g.maxConsecutive, spanDays: g.spanDays });
      }
    }
  }
  return {
    arm: 'holdrepeat-a', corpus: 'holdspeak after-legs, 24 seeds (replay)',
    seeds: perSeed.length, totalRows: totalRows, unparsed: unparsed,
    maxRepeatsPerHolder: { median: median, max: maxima.length ? maxima[maxima.length - 1] : 0, dist: dist },
    top10: top, defects: defects,
    verdict: defects.length ? 'DEFECT' : 'CADENCE',
    perSeed: perSeed,
  };
}

function check(name, cond, detail) {
  if (!cond) throw new Error('SELFTEST FAIL: ' + name + (detail ? ' — ' + detail : ''));
  return name;
}
function selftest() {
  const passed = [];
  passed.push(check('S1 consecutive run', maxConsecutive([1, 2, 3, 5, 6, 10]) === 3, 'got ' + maxConsecutive([1, 2, 3, 5, 6, 10])));
  passed.push(check('S2 consecutive single', maxConsecutive([7]) === 1, ''));
  passed.push(check('S3 consecutive empty', maxConsecutive([]) === 0, ''));
  passed.push(check('S4 consecutive dup days', maxConsecutive([3, 3, 4, 5]) === 3, 'got ' + maxConsecutive([3, 3, 4, 5])));
  // S5: determinism — analyzeAll twice, byte-identical.
  const r1 = JSON.stringify(analyzeAll());
  const r2 = JSON.stringify(analyzeAll());
  passed.push(check('S5 determinism', r1 === r2, 'lengths ' + r1.length + ' vs ' + r2.length));
  // S6/S7: known counts reproduce (Eamon 31x on 109430, Elif 21x on 109419).
  const parsed = JSON.parse(r1);
  const eamon = parsed.top10.find(function (h) { return h.seed === 109430; }) ||
    parsed.perSeed.find(function (s) { return s.seed === 109430; });
  let eamonMax = 0;
  const s430 = parsed.perSeed.find(function (s) { return s.seed === 109430; });
  if (s430) eamonMax = Math.max.apply(null, s430.groups.map(function (g) { return g.count; }));
  passed.push(check('S6 Eamon 31x reproduces (109430)', eamonMax === 31, 'got max ' + eamonMax));
  let elifMax = 0;
  const s419 = parsed.perSeed.find(function (s) { return s.seed === 109419; });
  if (s419) elifMax = Math.max.apply(null, s419.groups.map(function (g) { return g.count; }));
  passed.push(check('S7 Elif 21x reproduces (109419)', elifMax === 21, 'got max ' + elifMax));
  // S8: attribution — 0 unparsed.
  passed.push(check('S8 0 unparsed', parsed.unparsed === 0, 'unparsed ' + parsed.unparsed));
  // S9: 24 seeds.
  passed.push(check('S9 24 seeds', parsed.seeds === 24, 'got ' + parsed.seeds));
  console.log('holdrepeat-a selftest: ' + passed.length + ' passed, 0 failed');
  return passed.length;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { selftest(); return; }
  const result = analyzeAll();
  const oi = args.indexOf('--out');
  const out = oi !== -1 && args[oi + 1] ? args[oi + 1] : path.join(REPO, 'evidence', '2026-11-24', 'holdrepeat-a-analysis.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({
    seeds: result.seeds, totalRows: result.totalRows, unparsed: result.unparsed,
    maxRepeatsPerHolder: result.maxRepeatsPerHolder, verdict: result.verdict,
    defects: result.defects, top10: result.top10, out: out,
  }, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeAll: analyzeAll, selftest: selftest, maxConsecutive: maxConsecutive };
