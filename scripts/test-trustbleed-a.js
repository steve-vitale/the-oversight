#!/usr/bin/env node
// test-trustbleed-a.js — independent validator for the sim-trustbleed-a
// arm. Recomputes, straight from the raw per-seed corpus series (no
// analyzer code reused except file loading shape), the facts the arm
// evidence will claim: first-refusal day, per-link pre-refusal trust,
// trusted-tier re-reach after a dip, net trust to day 130, dissolution,
// and the no-evidence delta count (deltas with neither a same-day
// history entry nor a same-day trust say-line). It then cross-checks
// the analyzer's verdict fields against that independent recomputation
// and fails loudly on any mismatch.
// Usage: node scripts/test-trustbleed-a.js <corpus-dir> [expected-verdict-json]
// With no expected verdict, it prints the recomputed verdict and exits
// 0 iff the corpus is internally consistent (analyzer agrees, instruments
// clean). With an expected verdict JSON it additionally asserts equality
// on recoveryExists / recoverySeeds / instrumentGO.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeed } = require(path.join(__dirname, 'trustbleed-analyze-20261101'));

const dir = process.argv[2];
if (!dir) { console.error('usage: test-trustbleed-a.js <corpus-dir> [expected.json]'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /\.json$/.test(f)).sort();
if (!files.length) { console.error('FAIL: no corpus files in ' + dir); process.exit(1); }
const failures = [];
function check(cond, msg) { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures.push(msg); }

const recomputed = [];
for (const f of files) {
  const tb = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const att = tb.heraldAttempts || [];
  const firstRef = att.find(a => a.cls === 'REFUSED');
  const firstRefDay = firstRef ? firstRef.day : null;
  const linesByDay = {};
  for (const tl of (tb.trustLines || [])) (linesByDay[tl.day] = linesByDay[tl.day] || []).push(tl.line);
  for (const cl of (tb.callLines || [])) (linesByDay[cl.day] = linesByDay[cl.day] || []).push(cl.line);
  function amountIn(text) {
    if (!text) return null;
    const m = String(text).match(/[Tt]rust\s*[−\-–]\s*(\d+)|[Tt]rust\s*\+\s*(\d+)|\(trust\s*[−\-–](\d+)/);
    if (!m) return null;
    if (m[1] != null) return -parseInt(m[1], 10);
    if (m[2] != null) return parseInt(m[2], 10);
    if (m[3] != null) return -parseInt(m[3], 10);
    return null;
  }
  function voiceOnly(h) {
    if (!h) return false;
    if (h.kind === 'drift') return true;
    if (/priced in/i.test(h.note || '')) return true;
    return false;
  }
  const byLink = {};
  for (const row of (tb.series || [])) for (const l of (row.links || [])) {
    const k = l.id || l.villageId || 'unknown';
    (byLink[k] = byLink[k] || []).push({ day: row.day, link: l });
  }
  let noEvidence = 0, totalDeltas = 0, recoveryLinks = 0;
  const linkFacts = [];
  for (const k of Object.keys(byLink)) {
    const rows = byLink[k].sort((a, b) => a.day - b.day);
    let pre = null;
    if (firstRefDay != null) { const b = rows.filter(r => r.day < firstRefDay); pre = b.length ? b[b.length - 1].link.trust : rows[0].link.trust; }
    else pre = rows[0].link.trust;
    for (let i = 1; i < rows.length; i++) {
      const pt = rows[i - 1].link.trust, ct = rows[i].link.trust;
      if (pt == null || ct == null || ct === pt) continue;
      totalDeltas++;
      const hist = rows[i].link.historyNew || [];
      const effHist = hist.filter(h => !voiceOnly(h));
      const dayLines = linesByDay[rows[i].day] || [];
      const claimLines = dayLines.filter(l => !/raid —/i.test(l));
      const d = ct - pt;
      const hungerLine = dayLines.some(l => /muster is hungry/i.test(l));
      const foodLine = dayLines.some(l => /accept .* food/i.test(l) && /Trust \+4/.test(l));
      const evidenced = effHist.some(h => amountIn(h.note) === d)
        || (hungerLine && (rows[i].link.musterAllies || 0) > 0 && d === -2)
        || (hungerLine && foodLine && d === 2)
        || claimLines.some(l => amountIn(l) === d)
        || effHist.length > 0;
      if (!evidenced) noEvidence++;
    }
    let dipped = false, rec = null;
    if (firstRefDay != null) for (const r of rows) {
      if (r.day < firstRefDay) continue;
      const trusted = (r.link.trust >= 70 && (r.link.opinion || 0) >= 10);
      if (!dipped && !trusted) dipped = true;
      if (dipped && trusted && rec == null) rec = r.day;
    }
    if (rec != null) recoveryLinks++;
    const r130 = rows.filter(r => r.day <= 130);
    linkFacts.push({ id: k, name: rows[0].link.name, pre, rec,
      at130: r130.length ? r130[r130.length - 1].link.trust : null,
      final: rows[rows.length - 1].link.trust, status: rows[rows.length - 1].link.status });
  }
  const an = analyzeSeed(tb);
  check(an.firstRefusalDay === firstRefDay, `${f}: firstRefusalDay ${an.firstRefusalDay} == ${firstRefDay}`);
  check(an.totalDeltas === totalDeltas, `${f}: totalDeltas ${an.totalDeltas} == ${totalDeltas}`);
  check(an.unattDeltas === noEvidence, `${f}: unattDeltas ${an.unattDeltas} == no-evidence ${noEvidence}`);
  check(an.recoveryLinks === recoveryLinks, `${f}: recoveryLinks ${an.recoveryLinks} == ${recoveryLinks}`);
  for (const lf of linkFacts) {
    const al = an.links.find(x => x.id === lf.id);
    check(!!al, `${f}: link ${lf.id} present in analyzer`);
    if (al) {
      check(al.preRefusalTrust === lf.pre, `${f} ${lf.id}: preRefusalTrust ${al.preRefusalTrust} == ${lf.pre}`);
      check(al.recoveryDay === lf.rec, `${f} ${lf.id}: recoveryDay ${al.recoveryDay} == ${lf.rec}`);
      check(al.trustAt130 === lf.at130, `${f} ${lf.id}: trustAt130 ${al.trustAt130} == ${lf.at130}`);
      check(al.finalTrust === lf.final, `${f} ${lf.id}: finalTrust ${al.finalTrust} == ${lf.final}`);
    }
  }
  check((tb.instrumentErrors || []).length === 0 && (tb.musterErrs || 0) === 0, `${f}: instruments clean`);
  recomputed.push({ seed: tb.seed, mode: tb.mode, recoveryLinks, firstRefusalDay: firstRefDay });
}
const observeRec = recomputed.filter(r => r.mode === 'observe' && r.recoveryLinks > 0);
const recoveryExists = observeRec.length >= 2;
console.log('RECOMPUTED recoveryExists=' + recoveryExists + ' recoverySeeds=' + JSON.stringify(observeRec.map(r => r.seed)));
if (process.argv[3]) {
  const exp = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  check(recoveryExists === !!exp.recoveryExists, `expected recoveryExists=${exp.recoveryExists}`);
  check(JSON.stringify(observeRec.map(r => r.seed).sort()) === JSON.stringify((exp.recoverySeeds || []).sort()), `expected recoverySeeds=${JSON.stringify(exp.recoverySeeds)}`);
  if (exp.instrumentGO !== undefined) {
    // instrumentGO needs the analyzer verdict; recompute unattributed share from files via analyzer totals
    const ans = files.map(f => analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
    const tot = ans.reduce((s, x) => s + x.totalAbs, 0), un = ans.reduce((s, x) => s + x.unattAbs, 0);
    const go = tot ? (un / tot) <= 0.10 : false;
    check(go === !!exp.instrumentGO, `expected instrumentGO=${exp.instrumentGO} (share=${tot ? (un / tot).toFixed(3) : 'n/a'})`);
  }
}
if (failures.length) { console.error('VALIDATOR FAILURES: ' + failures.length); process.exit(1); }
console.log('VALIDATOR OK: ' + files.length + ' corpus files cross-checked');
