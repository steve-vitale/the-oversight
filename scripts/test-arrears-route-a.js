#!/usr/bin/env node
// test-arrears-route-a.js — corpus-only validator for sim-arrears-route-a.
// Reproduces the pilot verdict from the per-seed corpora alone (no
// game load). Prereg: evidence/2026-11-02/sim-arrears-route-a-prereg.md.
// Usage: node scripts/test-arrears-route-a.js <baselinePrefix> <armedPrefix> [seed,...]
// Defaults: baseline armed, pilot seeds 97101-97108. Corpus dir:
// evidence/2026-11-02/perseed-arrears-route-a/<prefix>-s<seed>.json.
// Exit: 0 GO (all bars pass), 1 NO-GO, 2 UNDER-POWERED (bar (a) miss).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-arrears-route-a');
const args = process.argv.slice(2);
const basePrefix = args[0] || 'baseline';
const armedPrefix = args[1] || 'armed';
const seeds = args.length > 2 ? args.slice(2).map(s => parseInt(s, 10))
  : [97101, 97102, 97103, 97104, 97105, 97106, 97107, 97108];
function load(prefix, seed) {
  const fp = path.join(DIR, prefix + '-s' + seed + '.json');
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function deathCauses(corpus) {
  const counts = {};
  corpus.forEach(function (c) {
    (c.deaths || []).forEach(function (d) {
      const k = (d && d.cause) || 'unknown';
      counts[k] = (counts[k] || 0) + 1;
    });
  });
  return counts;
}
function linkSig(row) {
  if (!row) return null;
  return (row.links || []).map(function (l) {
    return (l.name || l.villageId) + ':t' + l.trust + '/o' + l.opinion + '/a' + l.arrears + '->' + l.contribution;
  }).join(',');
}
const base = [], armed = [];
seeds.forEach(function (seed) {
  base.push(load(basePrefix, seed));
  armed.push(load(armedPrefix, seed));
});
console.log('seeds: ' + seeds.join(','));
console.log('anchors base=' + base.map(c => c.anchorCommit).join(',') + ' armed=' + armed.map(c => c.anchorCommit).join(','));
const rows = seeds.map(function (seed, i) {
  const b = base[i], a = armed[i];
  return { seed: seed, b: b, a: a,
    firstTotalMatch: (b.firstCheck && a.firstCheck) ? (b.firstCheck.total === a.firstCheck.total && linkSig(b.firstCheck) === linkSig(a.firstCheck)) : (b.firstCheck === a.firstCheck),
    blocked: !!(b.firstCheck && b.firstCheck.arrearsOnly),
    armedDeferred: !!a.deferred, armedSounded: !!a.sounded, armedStoodDown: !!a.stoodDown };
});
rows.forEach(function (r) {
  const b = r.b, a = r.a;
  console.log('s' + r.seed + ': base firstCheck total=' + (b.firstCheck ? b.firstCheck.total : null) +
    ' arrearsOnly=' + (b.firstCheck ? b.firstCheck.arrearsOnly : null) +
    ' ready=' + (b.firstCheck ? b.firstCheck.ready : null) +
    ' | armed deferred=' + a.deferred + ' deferDay=' + a.deferDay +
    ' sounded=' + a.sounded + ' soundDay=' + a.soundDay + ' tick=' + a.soundTick +
    ' soundTotal=' + (a.preSoundReadiness ? a.preSoundReadiness.total : null) +
    ' stoodDown=' + a.stoodDown + ' (' + (a.stoodDownDay || '') + ')' +
    ' | firstCheckMatch=' + r.firstTotalMatch +
    ' | gameDays base=' + b.gameDays + ' armed=' + a.gameDays +
    ' nat=' + a.national + ' table=' + a.table + ' won=' + a.won + ' w4=' + a.wave4 + ' w5=' + a.wave5);
});
const blocked = rows.filter(r => r.blocked);
console.log('BAR (a) POWER: blocked-at-first-check ' + blocked.length + '/' + seeds.length + ' (need >= 3): ' +
  blocked.map(r => r.seed).join(','));
const soundedBlocked = rows.filter(r => r.blocked && r.armedSounded);
let soundOk = true;
soundedBlocked.forEach(function (r) {
  const a = r.a;
  const pre = a.preSoundReadiness;
  const ok = !!pre && pre.ready === true && pre.total != null && pre.total >= 10 &&
    (a.soundDay - a.deferDay) <= 28 && (a.soundDay - a.deferDay) > 0;
  if (!ok) soundOk = false;
  console.log('  sounded blocked s' + r.seed + ': deferDay=' + a.deferDay + ' soundDay=' + a.soundDay +
    ' delay=' + (a.soundDay - a.deferDay) + ' preSoundReady=' + (pre ? pre.ready : null) +
    ' preSoundTotal=' + (pre ? pre.total : null) + ' -> ' + (ok ? 'OK' : 'FAIL'));
});
console.log('BAR (b) CONVERSION: blocked seeds sounded within 28d with total>=need: ' +
  soundedBlocked.length + ' (need >= 2), soundRowsValid=' + soundOk);
// Guardrails per sounded seed.
let guardOk = true;
rows.filter(r => r.armedSounded).forEach(function (r) {
  const a = r.a, p = a.post || {};
  const ok = (p.linkCountBefore === p.linkCountAfter) && p.respondersVerified === true &&
    (a.instrumentErrors || []).length === 0 && (a.musterErrs || 0) === 0 &&
    !!a.preSoundReadiness && a.preSoundReadiness.ready === true;
  if (!ok) guardOk = false;
  console.log('  guardrail s' + r.seed + ': links ' + p.linkCountBefore + '->' + p.linkCountAfter +
    ' respondersVerified=' + p.respondersVerified + ' instrErrs=' + (a.instrumentErrors || []).length +
    ' musterErrs=' + (a.musterErrs || 0) + ' preReady=' + (a.preSoundReadiness ? a.preSoundReadiness.ready : null) +
    ' -> ' + (ok ? 'OK' : 'FAIL'));
});
console.log('BAR (d) GUARDRAILS (all sounded seeds): ' + (guardOk ? 'PASS' : 'FAIL'));
// No-harm: median survival + death shapes.
const baseDays = base.map(c => c.gameDays), armedDays = armed.map(c => c.gameDays);
const baseMed = median(baseDays), armedMed = median(armedDays);
const baseCauses = deathCauses(base), armedCauses = deathCauses(armed);
const newCauses = Object.keys(armedCauses).filter(k => !(k in baseCauses));
console.log('BAR (c) NO-HARM: median gameDays base=' + baseMed + ' armed=' + armedMed +
  ' delta=' + (armedMed - baseMed) + ' (need >= -10): ' + ((armedMed - baseMed) >= -10 ? 'PASS' : 'FAIL'));
console.log('  death causes base: ' + JSON.stringify(baseCauses));
console.log('  death causes armed: ' + JSON.stringify(armedCauses));
console.log('  new causes in armed: ' + (newCauses.length ? newCauses.join(',') : 'none') +
  ' -> ' + (newCauses.length ? 'FAIL' : 'PASS'));
// Sense: transcript lines.
let senseOk = true;
rows.filter(r => r.armedDeferred).forEach(function (r) {
  const a = r.a;
  const waitLines = (a.transcript || []).filter(l => /waits|stands down|still stands/.test(l));
  const fire = (a.post && a.post.deferral && a.post.deferral.fire) || '';
  const namesFire = fire && waitLines.some(l => l.indexOf(fire) >= 0);
  const namesDebt = waitLines.some(l => /kcal/.test(l));
  if (!namesFire || !namesDebt) senseOk = false;
  console.log('  sense s' + r.seed + ': waitLines=' + waitLines.length + ' namesFire=' + !!namesFire + ' namesDebt=' + namesDebt);
  waitLines.slice(0, 3).forEach(l => console.log('    | ' + l.slice(0, 220)));
});
rows.filter(r => r.armedSounded).forEach(function (r) {
  const a = r.a;
  const callLines = (a.transcript || []).filter(l => /CALL GOES OUT|answers!/.test(l));
  console.log('  sound lines s' + r.seed + ': ' + callLines.length);
  callLines.slice(0, 3).forEach(l => console.log('    | ' + l.slice(0, 220)));
});
console.log('BAR (e) SENSE (mechanical part): ' + (senseOk ? 'PASS' : 'FAIL') + ' (human judgment in evidence)');
// Drift: first-check match.
const mismatches = rows.filter(r => !r.firstTotalMatch);
console.log('DRIFT first-check baseline-vs-armed mismatches: ' + mismatches.length +
  (mismatches.length ? ' seeds ' + mismatches.map(r => r.seed).join(',') : ' (none — clean)'));
// Wall per band.
function wall(corpus, label) {
  const nat = corpus.filter(c => c.national).length, tab = corpus.filter(c => c.table).length,
    won = corpus.filter(c => c.won).length, w4 = corpus.filter(c => c.wave4).length,
    w5 = corpus.filter(c => c.wave5).length, med = median(corpus.map(c => c.gameDays)),
    mx = Math.max.apply(null, corpus.map(c => c.gameDays));
  console.log('WALL ' + label + ': national ' + nat + '/' + corpus.length + ' table ' + tab + '/' + corpus.length +
    ' won ' + won + '/' + corpus.length + ' wave4 ' + w4 + '/' + corpus.length + ' wave5 ' + w5 + '/' + corpus.length +
    ' median ' + med + 'd max ' + mx + 'd ends ' + corpus.map(c => c.endReason).join(','));
}
wall(base, 'baseline');
wall(armed, 'armed');
const barA = blocked.length >= 3;
const barB = soundedBlocked.length >= 2 && soundOk;
const barC = (armedMed - baseMed) >= -10 && newCauses.length === 0;
const barD = guardOk;
const barE = senseOk;
console.log('VERDICT bars: a=' + barA + ' b=' + barB + ' c=' + barC + ' d=' + barD + ' e=' + barE);
if (!barA) { console.log('VERDICT: UNDER-POWERED'); process.exit(2); }
if (barA && barB && barC && barD && barE) { console.log('VERDICT: GO'); process.exit(0); }
console.log('VERDICT: NO-GO');
process.exit(1);
