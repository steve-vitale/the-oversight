#!/usr/bin/env node
// analyze-titanmuster-b.js — census of the titan muster from the tbrefuse corpus.
//
// Reads the 16 -v2 per-seed files of the sim-tbrefuse-b band (seeds
// 109310-109325, 150d, competent verbatim) and answers: can any village
// assemble 10 allied blades?
//
// Outputs JSON to stdout: refusal classification, muster-line census,
// call-sounding census, per-refusal counterfactual (living count on the day),
// and instrument-health counts. Deterministic: same input -> byte-identical
// output (keys sorted where order would otherwise vary).
//
// Usage: node scripts/analyze-titanmuster-b.js [corpusDir]
//   corpusDir defaults to evidence/2026-11-24/perseed-tbrefuse-b
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = process.argv[2] ||
  path.join(__dirname, '..', 'evidence', '2026-11-24', 'perseed-tbrefuse-b');

const MUSTER_LINE_RE = /muster (\d+) allied blades \(you have (\d+)\)/;
const CALL_SOUND_RE = /THE CALL GOES OUT/;
const COOLED_RE = /fires have cooled since dawn/;

function loadSeedFiles(dir) {
  const files = fs.readdirSync(dir)
    .filter((f) => /-v2\.json$/.test(f))
    .sort()
    .map((f) => path.join(dir, f));
  return files;
}

// Walk any JSON value; call fn(path, string) for every string leaf.
function walkStrings(v, fn, p) {
  p = p || '$';
  if (typeof v === 'string') { fn(p, v); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => walkStrings(x, fn, p + '[' + i + ']')); return; }
  if (v && typeof v === 'object') {
    Object.keys(v).sort().forEach((k) => walkStrings(v[k], fn, p + '.' + k));
  }
}

function analyzeFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const d = JSON.parse(raw);
  const seed = d.seed;
  const out = {
    seed,
    refusalsTotal: (d.refusals || []).length,
    titanRefusals: 0,
    titanClassified: 0,
    titanUnclassified: 0,
    haveValues: [],
    needValues: [],
    fates: {},
    musterLines: [], // {day, mid, need, have, source}
    callSoundings: [], // {day, mid, source}
    cooledLines: 0,
    promptLines: 0,
    parseErrors: [],
  };

  // B1: classify every titan refusal.
  // Pass 1: collect the gate count per (mid, day) from refusals whose
  // lines carry the muster line. The line is said ONCE per titan per day
  // by design (titans.js REFUSAL-SPAM dedup), so repeat refusals the same
  // day carry no line — their count is inherited from the day's firing
  // refusal (same titan, same day, same gate count by code).
  const byDay = {};
  (d.refusals || []).forEach((r) => {
    if (!r.isTitan) return;
    const lines = (r.linesDuringCall || []).concat(r.contextLines || []);
    lines.forEach((ln) => {
      const text = typeof ln === 'string' ? ln : (ln.line || '');
      const m = MUSTER_LINE_RE.exec(text);
      if (m) byDay[r.mid + '|' + r.day] = { need: Number(m[1]), have: Number(m[2]) };
    });
  });
  (d.refusals || []).forEach((r) => {
    if (!r.isTitan) return;
    out.titanRefusals += 1;
    const fate = r.fate || 'unknown';
    out.fates[fate] = (out.fates[fate] || 0) + 1;
    let have = null;
    let need = null;
    const lines = (r.linesDuringCall || []).concat(r.contextLines || []);
    lines.forEach((ln) => {
      const text = typeof ln === 'string' ? ln : (ln.line || '');
      const m = MUSTER_LINE_RE.exec(text);
      if (m) {
        if (have === null) have = Number(m[2]);
        if (need === null) need = Number(m[1]);
        out.musterLines.push({ day: r.day, mid: r.mid, need: Number(m[1]), have: Number(m[2]), source: 'linesDuringCall' });
      }
      if (CALL_SOUND_RE.test(text)) out.callSoundings.push({ day: r.day, mid: r.mid, source: 'linesDuringCall' });
      if (COOLED_RE.test(text)) out.cooledLines += 1;
    });
    if (r.titanLineFired) out.lineFiredCount = (out.lineFiredCount || 0) + 1;
    // Same-day inheritance for repeat refusals (dedup rule, see above).
    if ((have === null || need === null) && byDay[r.mid + '|' + r.day]) {
      const inh = byDay[r.mid + '|' + r.day];
      if (have === null) have = inh.have;
      if (need === null) need = inh.need;
      out.inheritedCount = (out.inheritedCount || 0) + 1;
    }
    if (have === null || need === null) {
      out.titanUnclassified += 1;
      out.parseErrors.push({ day: r.day, mid: r.mid, reason: 'no have/need found (no line this titan-day)', fate });
    } else {
      out.titanClassified += 1;
      out.haveValues.push(have);
      out.needValues.push(need);
    }
  });

  // B2/B3: sweep every string in the file for muster lines and soundings
  // the refusal rows may have missed (saySample, daily text, etc.).
  const seenLineKeys = new Set(out.musterLines.map((l) => l.day + '|' + l.mid + '|' + l.have));
  walkStrings(d, (p, s) => {
    const m = MUSTER_LINE_RE.exec(s);
    if (m) {
      const key = null; // day/mid unknown from a bare string; count separately
      out._extraMusterLines = (out._extraMusterLines || 0) + 1;
      out._extraHave = out._extraHave || {};
      out._extraHave[m[2]] = (out._extraHave[m[2]] || 0) + 1;
      void key; void seenLineKeys;
    }
    if (CALL_SOUND_RE.test(s)) out._extraCallSoundings = (out._extraCallSoundings || 0) + 1;
    // Prompt lines: "Sound the call" text that is NOT the muster refusal
    // line itself (the refusal line contains "sound the call" too).
    if (/Sound the call/i.test(s) && !CALL_SOUND_RE.test(s) && !MUSTER_LINE_RE.test(s)) out.promptLines += 1;
  });

  // B4: counterfactual — living count on each titan-refusal day.
  const dailyByDay = {};
  (d.daily || []).forEach((row) => { dailyByDay[row.day] = row; });
  out.counterfactual = [];
  (d.refusals || []).forEach((r) => {
    if (!r.isTitan) return;
    const row = dailyByDay[r.day] || null;
    out.counterfactual.push({
      seed, day: r.day, mid: r.mid, fate: r.fate || 'unknown',
      livingCount: row ? (row.livingCount ?? null) : null,
      standing: row ? (row.standing ?? null) : null,
      links: row ? (row.links ?? null) : null,
    });
  });

  return out;
}

function main() {
  const files = loadSeedFiles(CORPUS);
  const perSeed = files.map(analyzeFile);
  const sum = {
    corpusDir: CORPUS,
    seeds: perSeed.length,
    seedList: perSeed.map((s) => s.seed).sort((a, b) => a - b),
    refusalsTotal: 0,
    titanRefusals: 0,
    titanClassified: 0,
    titanUnclassified: 0,
    haveDistribution: {},
    needDistribution: {},
    maxHave: null,
    fates: {},
    musterLineOccurrences: 0,
    callSoundings: 0,
    callSoundingRows: [],
    cooledLines: 0,
    promptLines: 0,
    extraMusterLines: 0,
    extraHave: {},
    extraCallSoundings: 0,
    parseErrors: [],
    perSeed: perSeed,
  };
  perSeed.forEach((s) => {
    sum.refusalsTotal += s.refusalsTotal;
    sum.titanRefusals += s.titanRefusals;
    sum.titanClassified += s.titanClassified;
    sum.titanUnclassified += s.titanUnclassified;
    sum.inheritedCount = (sum.inheritedCount || 0) + (s.inheritedCount || 0);
    sum.lineFiredCount = (sum.lineFiredCount || 0) + (s.lineFiredCount || 0);
    s.haveValues.forEach((h) => { sum.haveDistribution[h] = (sum.haveDistribution[h] || 0) + 1; });
    s.needValues.forEach((n) => { sum.needDistribution[n] = (sum.needDistribution[n] || 0) + 1; });
    Object.keys(s.fates).forEach((f) => { sum.fates[f] = (sum.fates[f] || 0) + s.fates[f]; });
    sum.musterLineOccurrences += s.musterLines.length;
    sum.callSoundings += s.callSoundings.length;
    s.callSoundings.forEach((c) => sum.callSoundingRows.push({ seed: s.seed, day: c.day, mid: c.mid }));
    sum.cooledLines += s.cooledLines;
    sum.promptLines += s.promptLines;
    sum.extraMusterLines += (s._extraMusterLines || 0);
    Object.keys(s._extraHave || {}).forEach((h) => { sum.extraHave[h] = (sum.extraHave[h] || 0) + s._extraHave[h]; });
    sum.extraCallSoundings += (s._extraCallSoundings || 0);
    sum.parseErrors = sum.parseErrors.concat(s.parseErrors.map((e) => Object.assign({ seed: s.seed }, e)));
  });
  const haves = Object.keys(sum.haveDistribution).map(Number);
  sum.maxHave = haves.length ? Math.max.apply(null, haves) : null;
  // The wide string sweep double-counts lines already found in refusal
  // rows; report both, and judge B2 on the row-anchored census.
  sum.perSeed.forEach((s) => { delete s._extraMusterLines; delete s._extraHave; delete s._extraCallSoundings; });
  process.stdout.write(JSON.stringify(sum, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { analyzeFile, loadSeedFiles, MUSTER_LINE_RE };
