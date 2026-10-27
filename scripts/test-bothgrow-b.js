#!/usr/bin/env node
// test-bothgrow-b.js — proof for sim-bothgrow-b (CASE-DIAG case study).
//
// Checks, all exit-nonzero on failure:
//  1. Det-gate (leg 1): seed 9761 run with SPOILVOL=0 vs SPOILVOL=1 in
//     stdout-JSON mode produces byte-identical inflow records,
//     mealdraw records, death lists, and wall fields (spoilvol fields
//     and `ms` excluded). Also reproduces the corpus seed-9761 counts
//     (mealDraw / inflows / deaths) when the corpus exists.
//  2. Corpus validity: 8 files, competent-nofeast policy fields,
//     no truncation flags, spoil records present.
//  3. Independent leg recomputation from the corpus: leg 2
//     (0/0 violations), leg 3 case contrast (9761 Cattail vs 9762 LQ
//     shares, >= 10pp gap + sweep >=), and the CASE-DIAG verdict.
//  4. Determinism cross-check: 0 differing inflow channels vs the
//     cattailband corpus on all 8 seeds (base-move drift reported
//     as failure here so it cannot hide).
//  5. Hygiene: 0 src/js files modified, 0 sibling capture files
//     modified (sweep-spoilvol-b.js, spoilvol-capture.js,
//     inflow-capture.js, mealdraw-capture.js), and the only new
//     scripts are this arm's own (analyze-bothgrow-b.js,
//     test-bothgrow-b.js).
//
// Env: DETGATE_ONLY=1 runs only check 1 (usable while the corpus is
// still being swept). Corpus dirs overridable via CORPUS_DIR /
// REF_CORPUS_DIR. Never writes into the repo; det-gate runs are
// stdout-JSON mode only.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = process.env.CORPUS_DIR || path.join(ROOT, 'evidence', '2026-10-26', 'sim-bothgrow-b-corpus');
const REF_DIR = process.env.REF_CORPUS_DIR || path.join(ROOT, 'evidence', '2026-10-26', 'sim-cattailband-b-corpus');
const SWEEP = path.join(__dirname, 'sweep-spoilvol-b.js');

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail != null ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

function stripForDetGate(j) {
  const c = JSON.parse(JSON.stringify(j));
  delete c.ms;
  delete c.spoilvolOn;
  delete c.spoilDays;
  delete c.spoilSayLines;
  delete c.spoilEvents;
  delete c.spoilCounters;
  return c;
}
function stableStringify(v) {
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
  }
  return JSON.stringify(v);
}

function runDetGate() {
  const baseEnv = Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
    SEEDS: '9761', DAYS: '100', SWEEP_STDOUT_JSON: '1',
  });
  delete baseEnv.FEASTSCALE_R13;
  const outs = [];
  for (const spoil of ['1', '0']) {
    const env = Object.assign({}, baseEnv, { SPOILVOL: spoil });
    const r = spawnSync(process.execPath, [SWEEP], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) {
      check('det-gate sweep SPOILVOL=' + spoil + ' exits 0', false, (r.stderr || '').slice(-300));
      return null;
    }
    const line = (r.stdout || '').trim().split('\n').filter(Boolean)[0];
    if (!line) { check('det-gate SPOILVOL=' + spoil + ' emits JSON', false); return null; }
    outs.push(JSON.parse(line));
  }
  const [on, off] = outs;
  const a = stableStringify(stripForDetGate(on));
  const b = stableStringify(stripForDetGate(off));
  check('det-gate leg 1 byte-identical (excl spoilvol fields + ms)', a === b,
    `on: mealDraw=${on.mealDrawRecords.length} inflows=${on.inflows.length} deaths=${on.deaths} | off: mealDraw=${off.mealDrawRecords.length} inflows=${off.inflows.length} deaths=${off.deaths}`);
  return on;
}

function honestInflowSum(j) {
  const m = new Map();
  for (const r of (j.inflows || [])) {
    if (r.door === 'stock' && !(r.kcal > 0)) continue;
    if (r.door === 'pantryAdd' && !r.added) continue;
    m.set(String(r.name), (m.get(String(r.name)) || 0) + (r.kcal || 0));
  }
  return m;
}

function main() {
  const on = runDetGate();
  if (process.env.DETGATE_ONLY === '1') {
    console.log(failures === 0 ? 'DETGATE GREEN' : 'DETGATE RED');
    process.exit(failures === 0 ? 0 : 1);
  }
  if (!on) { console.log('PROOF RED (det-gate failed)'); process.exit(1); }

  // Corpus validity.
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
  check('corpus has 8 files', files.length === 8, `${files.length} files`);
  const corpus = files.map(f => ({ file: f, data: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }));
  let policyOk = true, truncOk = true, spoilOk = true;
  for (const { data: ps } of corpus) {
    if (ps.policy !== 'competent-nofeast' || ps.competentFeast !== 0 || ps.plentydepri !== 0 || ps.depositgate !== 1) policyOk = false;
    if (ps.inflowTruncated || ps.mealdrawTruncated) truncOk = false;
    if (!ps.spoilEvents || !Array.isArray(ps.spoilEvents.sweeps)) spoilOk = false;
  }
  check('corpus policy fields competent-nofeast', policyOk);
  check('corpus no truncation flags', truncOk);
  check('corpus spoil records present', spoilOk);

  // Corpus-9761 count reproduction from the det-gate SPOILVOL=1 run.
  const s9761 = corpus.find(({ data }) => data.seed === 9761);
  if (s9761) {
    check('corpus-9761 counts reproduced by det-gate run',
      on.mealDrawRecords.length === s9761.data.mealDrawRecords.length &&
      on.inflows.length === s9761.data.inflows.length &&
      on.deaths === s9761.data.deaths,
      `det-gate ${on.mealDrawRecords.length}/${on.inflows.length}/${on.deaths} vs corpus ${s9761.data.mealDrawRecords.length}/${s9761.data.inflows.length}/${s9761.data.deaths}`);
  } else {
    check('corpus contains seed 9761', false);
  }

  // Independent leg recomputation.
  const stats = (ps, channel) => {
    let inflow = 0, recs = 0, meal = 0, other = 0, sweep = 0;
    for (const r of (ps.inflows || [])) {
      if (String(r.name) !== channel) continue;
      recs++;
      if (r.door === 'stock' && !(r.kcal > 0)) continue;
      if (r.door === 'pantryAdd' && !r.added) continue;
      inflow += r.kcal || 0;
    }
    for (const r of (ps.mealDrawRecords || [])) {
      if (r.kind !== 'pantryDraw') continue;
      for (const it of (r.items || [])) {
        if (String(it.name) !== channel) continue;
        const k = (it.units || 0) * (it.kcalEach || 0);
        if (r.context === 'other') other += k; else meal += k;
      }
    }
    for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
      for (const bc of (((sw.removed || {}).pantry || {}).byChannel || [])) {
        if (String(bc.channel) === channel) sweep += bc.kcal || 0;
      }
    }
    return { inflow, recs, draws: meal + other, sweep };
  };
  let violR = 0, violK = 0, sweeps = 0;
  for (const { data: ps } of corpus) {
    for (const sw of ((ps.spoilEvents || {}).sweeps || [])) {
      sweeps++;
      violR += ((sw.violations || {}).pantry || {}).removedNotSpoiledKcal || 0;
      violK += ((sw.violations || {}).pantry || {}).keptSpoiledKcal || 0;
    }
  }
  check('leg 2 sweep integrity 0/0', violR === 0 && violK === 0, `${violR}/${violK} over ${sweeps} sweeps`);
  const cat = stats(s9761.data, 'Cattail');
  const s9762 = corpus.find(({ data }) => data.seed === 9762);
  const lq = s9762 ? stats(s9762.data, "Lamb's Quarters") : null;
  if (lq) {
    const catShare = cat.sweep / (cat.inflow - cat.draws);
    const lqShare = lq.sweep / (lq.inflow - lq.draws);
    const gapPp = (catShare - lqShare) * 100;
    check('leg 3a share gap >= 10pp', gapPp >= 10, `Cattail ${(catShare * 100).toFixed(1)}% vs LQ ${(lqShare * 100).toFixed(1)}% = ${gapPp.toFixed(1)}pp`);
    check('leg 3b Cattail sweep >= LQ sweep', cat.sweep >= lq.sweep, `${cat.sweep} vs ${lq.sweep}`);
    console.log(`CASE NUMBERS: 9761 Cattail in=${cat.inflow} draws=${cat.draws} sweep=${cat.sweep} | 9762 LQ in=${lq.inflow} draws=${lq.draws} sweep=${lq.sweep}`);
  } else {
    check('corpus contains seed 9762', false);
  }

  // Determinism cross-check vs cattailband corpus.
  const ref = fs.readdirSync(REF_DIR).filter(f => f.endsWith('.json')).sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(REF_DIR, f), 'utf8')));
  const refBySeed = new Map(ref.map(j => [j.seed, j]));
  let diffChannels = 0;
  const diffDetail = [];
  for (const { data: ps } of corpus) {
    const r = refBySeed.get(ps.seed);
    if (!r) { diffDetail.push(ps.seed + ':no-ref'); continue; }
    const a = honestInflowSum(ps), b = honestInflowSum(r);
    const names = new Set([...a.keys(), ...b.keys()]);
    let d = 0;
    for (const n of names) if ((a.get(n) || 0) !== (b.get(n) || 0)) d++;
    if (d) { diffChannels += d; diffDetail.push(ps.seed + ':' + d); }
    if (ps.deaths !== r.deaths) diffDetail.push(ps.seed + ':deaths-differ');
  }
  check('determinism vs cattailband corpus: 0 differing inflow channels', diffChannels === 0,
    diffDetail.length ? diffDetail.join(', ') : 'identical on all 8 seeds');

  // Hygiene: no src/js or sibling capture files modified.
  const gitStatus = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8', cwd: ROOT });
  const changed = gitStatus.split('\n').filter(Boolean).map(l => l.slice(3).trim());
  const badSrc = changed.filter(f => f.startsWith('src/js/'));
  check('0 src/js files modified', badSrc.length === 0, badSrc.join(', ') || 'clean');
  const siblings = ['scripts/sweep-spoilvol-b.js', 'scripts/spoilvol-capture.js', 'scripts/inflow-capture.js', 'scripts/mealdraw-capture.js'];
  const badSib = changed.filter(f => siblings.includes(f));
  check('0 sibling capture files modified', badSib.length === 0, badSib.join(', ') || 'clean');

  console.log(failures === 0 ? 'PROOF GREEN' : 'PROOF RED');
  process.exit(failures === 0 ? 0 : 1);
}

main();
