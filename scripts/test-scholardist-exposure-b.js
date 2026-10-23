#!/usr/bin/env node
// test-scholardist-exposure-b.js — Part A: offline exposure-normalized
// re-analysis of the landed scholardist-confirm corpus
// (evidence/2026-10-23/perseed-scholardist-confirm-b/, commits
// 1b429dc3e/13825c88d); Part B: scholar-safe variant gate verification
// (NO new sweep — the named next is already measured by the landed
// sim-scholardistsafe-b arm, commit 6ea142c1c).
//
// PRE-REGISTRATION (binding diagnostic, written before analysis):
// - PRIMARY: paired per-matched-config (seed x policy) thin-pool
//   starvation deaths per 100 village-days, one-sided sign test
//   armed<control. DIAG-GO iff p<0.10 AND median paired diff <= -0.5/100vd.
//   Ties dropped from the sign test (standard); median over all pairs.
// - SECONDARY: classify pairs by whether the lever's grants were on the
//   causal path (thin deaths at grant-recipient vids) vs chaos-reshuffle
//   (early combat-collapse deaths in the ruins), using the day-beats.
// - Verdict classes: DIAG-GO / DIAG-NO-GO. No re-score (§14).
// - PRIMARY corpus: r1 (seeds 67501-67516, 32 pairs — the corpus behind
//   the confirm NO-GO). r2 (92801-92816) is SECONDARY (31 complete pairs;
//   armed-belongfeast-s92808 never landed).
//
// E0: corpus integrity + byte-for-byte reproduction: recompute
//   thinPoolStarvation from deaths[] (pclass=='starvation' && thinPool)
//   and assert it equals the stored field on EVERY config.
// E1: PRIMARY diagnostic on r1.
// E2: causal-path classification on r1.
// E3: r2 secondary diagnostic.
// E4: scholar-safe instrument verification (Part B resolution): layer
//   byte-identical to committed 6ea142c1c; sibling proof test
//   test-scholardistsafe-b.js re-run — E0/E1/E3 must be GREEN, E2's only
//   FAILs the 4 documented wild-horizon ones.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence/2026-10-23/perseed-scholardist-confirm-b');

let passed = 0, failed = 0;
function ok(name, cond, extra) {
  if (!cond) { failed++; console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); return; }
  passed++; console.log('ok: ' + name);
}
function note(s) { console.log('  ' + s); }

function loadCorpus() {
  const files = fs.readdirSync(CORPUS).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const d = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
    d._file = f;
    return d;
  });
}

// one-sided binomial tail P(X >= k), p=0.5
function binomTail(n, k) {
  if (n === 0) return 1;
  let c = 1, tail = 0;
  // C(n,k) via multiplicative, sum k..n
  for (let i = 0; i <= n; i++) {
    if (i === 0) c = 1; else c = c * (n - i + 1) / i;
    if (i >= k) tail += c;
  }
  return tail / Math.pow(2, n);
}
function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const all = loadCorpus();
note('corpus files: ' + all.length);

// ---------- E0: byte-for-byte reproduction ----------
let reproBad = 0;
for (const d of all) {
  const recomputed = d.deaths.filter(x => x.pclass === 'starvation' && x.thinPool === true).length;
  if (recomputed !== d.thinPoolStarvation) { reproBad++; console.error('MISMATCH ' + d._file + ': recomputed=' + recomputed + ' stored=' + d.thinPoolStarvation); }
  assert.ok(d.gameDays > 0, d._file + ' gameDays');
  assert.ok(d.arm === 'control' || d.arm === 'armed', d._file + ' arm');
}
ok('E0 corpus thin-pool counts reproduce byte-for-byte on all ' + all.length + ' configs', reproBad === 0, reproBad + ' mismatches');

function pairsFor(seedLo, seedHi) {
  const inRange = all.filter(d => d.seed >= seedLo && d.seed <= seedHi);
  const byKey = new Map();
  for (const d of inRange) {
    const k = d.seed + '|' + d.policy;
    if (!byKey.has(k)) byKey.set(k, {});
    byKey.get(k)[d.arm] = d;
  }
  const pairs = [];
  for (const [k, v] of byKey) {
    if (v.control && v.armed) pairs.push({ key: k, seed: v.control.seed, policy: v.control.policy, control: v.control, armed: v.armed });
  }
  return { pairs, partial: [...byKey].filter(([k, v]) => !(v.control && v.armed)).map(([k]) => k) };
}

const rate = d => d.thinPoolStarvation / d.gameDays * 100;

// ---------- E1: PRIMARY diagnostic on r1 ----------
{
  const { pairs, partial } = pairsFor(67501, 67516);
  ok('E1 r1 pair completeness (32 pairs)', pairs.length === 32 && partial.length === 0, pairs.length + ' pairs, partial=' + partial.join(','));
  const rows = pairs.map(p => {
    const rc = rate(p.control), ra = rate(p.armed);
    return { key: p.key, rc, ra, diff: ra - rc };
  });
  const diffs = rows.map(r => r.diff);
  const nonTied = diffs.filter(x => x !== 0);
  const k = nonTied.filter(x => x < 0).length;
  const n = nonTied.length;
  const p = binomTail(n, k);
  const med = median(diffs);
  const rcTot = rows.reduce((a, r) => a + r.rc, 0), raTot = rows.reduce((a, r) => a + r.ra, 0);
  note('r1 corpus totals: control ' + pairs.reduce((a, p) => a + p.control.thinPoolStarvation, 0) +
    ' / ' + pairs.reduce((a, p) => a + p.control.gameDays, 0) + 'd = ' + (rcTot / 32).toFixed(3) + '/100d mean; ' +
    'armed ' + pairs.reduce((a, p) => a + p.armed.thinPoolStarvation, 0) +
    ' / ' + pairs.reduce((a, p) => a + p.armed.gameDays, 0) + 'd');
  note('r1 sign test: k=' + k + ' armed<control of n=' + n + ' non-tied pairs, one-sided p=' + p.toFixed(4));
  note('r1 median paired diff (armed-control): ' + med.toFixed(3) + '/100vd');
  const diagGo = p < 0.10 && med <= -0.5;
  console.log('E1 PRIMARY DIAGNOSTIC VERDICT: ' + (diagGo ? 'DIAG-GO' : 'DIAG-NO-GO') +
    ' (p<0.10: ' + (p < 0.10) + '; median<=-0.5: ' + (med <= -0.5) + ')');
  ok('E1 verdict computed', true);
  // paired rows for the evidence (§15 manual rows)
  console.log('--- r1 paired rows (seed|policy : control rate -> armed rate, diff) ---');
  for (const r of rows) console.log('  ' + r.key + ' : ' + r.rc.toFixed(2) + ' -> ' + r.ra.toFixed(2) + '  (' + (r.diff >= 0 ? '+' : '') + r.diff.toFixed(2) + ')');
}

// ---------- E2: causal-path classification on r1 ----------
{
  const { pairs } = pairsFor(67501, 67516);
  let causal = 0, chaos = 0, other = 0, noThin = 0;
  const detail = [];
  for (const p of pairs) {
    const a = p.armed;
    const recipients = new Set(a.beats.map(b => b.vid));
    const thinDead = a.deaths.filter(x => x.pclass === 'starvation' && x.thinPool === true);
    if (thinDead.length === 0) { noThin++; continue; }
    const onPath = thinDead.filter(x => recipients.has(x.who));
    if (onPath.length > 0) {
      causal++;
      detail.push(p.key + ' CAUSAL-PATH: thin deaths at grant recipients [' + onPath.map(x => x.who + ' d' + x.day).join(', ') + ']');
    } else {
      const combatN = a.deaths.filter(x => x.pclass === 'combat').length;
      const combatShare = a.deaths.length ? combatN / a.deaths.length : 0;
      if (a.gameDays < 60 && combatShare > 0.5) {
        chaos++;
        detail.push(p.key + ' CHAOS-RESHUFFLE: early collapse ' + a.gameDays + 'd, combat ' + (combatShare * 100).toFixed(0) + '%, thin deaths in ruins [' + thinDead.map(x => x.who + ' d' + x.day + ' fd=' + x.deathDayFreshDays).join(', ') + ']');
      } else {
        other++;
        detail.push(p.key + ' OTHER: ' + a.gameDays + 'd, thin deaths [' + thinDead.map(x => x.who + ' d' + x.day).join(', ') + ']');
      }
    }
  }
  console.log('--- E2 causal-path classification (r1 pairs with armed thin deaths) ---');
  for (const d of detail) console.log('  ' + d);
  note('pairs: no-thin=' + noThin + ' causal-path=' + causal + ' chaos-reshuffle=' + chaos + ' other=' + other);
  ok('E2 classification complete', true);
}

// ---------- E3: r2 secondary diagnostic ----------
{
  const { pairs, partial } = pairsFor(92801, 92816);
  note('r2 partial pairs (noted, excluded): ' + (partial.join(', ') || 'none'));
  ok('E3 r2 pair completeness (31 pairs, 1 known-missing)', pairs.length === 31 && partial.length === 1, pairs.length + ' pairs');
  const rows = pairs.map(p => ({ key: p.key, diff: rate(p.armed) - rate(p.control) }));
  const diffs = rows.map(r => r.diff);
  const nonTied = diffs.filter(x => x !== 0);
  const k = nonTied.filter(x => x < 0).length;
  const p = binomTail(nonTied.length, k);
  const med = median(diffs);
  note('r2 sign test: k=' + k + ' of n=' + nonTied.length + ', one-sided p=' + p.toFixed(4) + '; median diff ' + med.toFixed(3) + '/100vd');
  console.log('E3 SECONDARY (r2) VERDICT: ' + ((p < 0.10 && med <= -0.5) ? 'DIAG-GO' : 'DIAG-NO-GO'));
  ok('E3 verdict computed', true);
}

// ---------- E4: scholar-safe instrument verification (Part B resolution) ----------
{
  // (a) layer byte-identical to the committed 6ea142c1c blob
  const blob = execFileSync('git', ['rev-parse', '6ea142c1c:scripts/layers/scholardistsafe-b.js'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const workHash = execFileSync('git', ['hash-object', 'scripts/layers/scholardistsafe-b.js'], { cwd: ROOT, encoding: 'utf8' }).trim();
  ok('E4 scholar-safe layer byte-identical to committed 6ea142c1c', blob === workHash, 'blob=' + blob.slice(0, 8) + ' work=' + workHash.slice(0, 8));
  // (b) re-run the sibling proof test; E0/E1/E3 must be GREEN, E2 only the 4 documented wild-horizon FAILs
  let out;
  try {
    out = execFileSync('node', ['scripts/test-scholardistsafe-b.js'], { cwd: ROOT, encoding: 'utf8', timeout: 1200000 });
  } catch (e) {
    out = (e.stdout || '') + '\n' + (e.stderr || '');
  }
  const fails = out.split('\n').filter(l => l.startsWith('FAIL:'));
  const allowedE2 = ['E2 wild: halves applied', 'E2 wild: grants fired', 'E2 wild: granted kcal > 0', 'E2 wild: voices fired'];
  const badFails = fails.filter(f => !allowedE2.some(a => f.includes(a)));
  const e0e1e3ok = /E3 armed det: digest-identical re-run/.test(out) && !fails.some(f => /E0|E1|E3/.test(f));
  note('sibling proof re-run: ' + fails.length + ' FAIL lines, all in documented E2 wild-fire set: ' + (badFails.length === 0));
  if (badFails.length) for (const f of badFails) console.error('  UNEXPECTED ' + f);
  ok('E4 sibling proof E0/E1/E3 GREEN, E2 only documented wild-horizon FAILs', badFails.length === 0 && e0e1e3ok, fails.length + ' fails');
}

console.log('\n' + passed + ' checks passed' + (failed ? ' WITH ' + failed + ' FAILURES' : ' — ALL GREEN'));
process.exitCode = failed ? 1 : 0;
