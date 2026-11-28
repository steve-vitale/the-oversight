#!/usr/bin/env node
// scripts/analyze-seatvoice-a.js — sim-seatvoice-a analyzer.
//
// Diffs the BEFORE corpus (leg-2, evidence/2026-11-28/
// perseed-capstoneready-a-leg2-arm/) against the AFTER corpus
// (evidence/2026-11-28/perseed-seatvoice-a-arm/) per seed and judges
// the frozen prereg bars (1), (3), (4). Bar (2) — the staged
// open-gate delivery — is judged by scripts/test-seatvoice-a.js,
// not here; the analyzer says so rather than re-judging it.
//
//   Bar (1): on BOTH delivery seeds the delivery-day tribute line
//     carries the frozen honest line and never says "The seat is
//     open", while that day's deed-gate snapshot reads ok:false.
//   Bar (3): determinism — on the two delivery seeds ONLY the
//     delivery line and the mercy line may differ (2 changed
//     tableLines entries per delivery seed); on the other six seeds
//     ZERO lines differ; snapshots, delivery records, end states,
//     and all other lines identical. say() consumes no RNG, so a
//     voicing change must not move any number.
//   Bar (4): "Nothing out there can take this from you" appears
//     ZERO times in the after corpus; the delivery-day mercy line is
//     exactly the frozen text.
//
// Usage: node scripts/analyze-seatvoice-a.js [--before <dir>]
//   [--after <dir>] [--json]
// Exit 0 when all judged bars pass, 1 otherwise. Prints a verdict
// table to stdout (and, with --json, the verdict object).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const BEFORE = path.join(REPO, 'evidence', '2026-11-28', 'perseed-capstoneready-a-leg2-arm');
const AFTER = path.join(REPO, 'evidence', '2026-11-28', 'perseed-seatvoice-a-arm');
const SEEDS = [113301, 113302, 113303, 113304, 113305, 113306, 113307, 113308];
const DELIVERY = { 113302: 83, 113305: 140 };
const CLOSED_SEAT = 'The deed is done — the seat still waits on the deeds.';
const OPEN_SEAT = 'The seat is open.';
const MERCY = '◈ THE TABLE — between now and the seat, the world holds its breath. The wild can still take your food — but it cannot take your people.';
const OLD_MERCY = 'Nothing out there can take this from you';

function load(dir, seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '.json'), 'utf8'));
}

// Recursive diff: returns [{ path, before, after }] for differing leaves.
function diff(a, b, prefix, out) {
  out = out || [];
  prefix = prefix || '';
  if (a === b) return out;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) { out.push({ path: prefix, before: a, after: b }); return out; }
    const keys = new Set([].concat(Object.keys(a), Object.keys(b)));
    for (const k of keys) diff(a[k], b[k], prefix ? prefix + '.' + k : k, out);
    return out;
  }
  out.push({ path: prefix, before: a, after: b });
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
  const beforeDir = opt('--before', BEFORE);
  const afterDir = opt('--after', AFTER);
  const asJson = args.indexOf('--json') >= 0;

  const verdict = { bar1: null, bar3: null, bar4: null, perSeed: {}, wall: {}, errors: [] };
  let allOk = true;

  for (const seed of SEEDS) {
    let before, after;
    try { before = load(beforeDir, seed); } catch (e) { verdict.errors.push('before s' + seed + ' unreadable: ' + e.message); allOk = false; continue; }
    try { after = load(afterDir, seed); } catch (e) { verdict.errors.push('after s' + seed + ' unreadable: ' + e.message); allOk = false; continue; }
    const diffs = diff(before, after);
    const lineDiffs = diffs.filter(d => d.path.indexOf('tableLines.') === 0 || d.path.indexOf('fireside.') === 0);
    const otherDiffs = diffs.filter(d => d.path.indexOf('tableLines.') !== 0 && d.path.indexOf('fireside.') !== 0);
    verdict.perSeed[seed] = {
      diffs: diffs.length,
      lineDiffs: lineDiffs.map(d => ({ path: d.path, before: d.before, after: d.after })),
      otherDiffs: otherDiffs.map(d => ({ path: d.path, before: d.before, after: d.after })),
      deliveryAttempts: after.deliveryAttempts,
      deliveredDay: after.deliveredDay,
      days: after.days,
      end: after.endReason,
      maxRank: after.maxRank,
      won: after.won,
    };
    // Bar (3) per seed.
    const isDelivery = DELIVERY[seed] != null;
    if (isDelivery) {
      // Exactly the delivery line + mercy line on the delivery day.
      const day = DELIVERY[seed];
      const dayDiffs = lineDiffs.filter(d => {
        const m = d.path.match(/tableLines\.(\d+)\.line/);
        if (!m) return false;
        const entry = (after.tableLines || [])[+m[1]];
        return entry && entry.day === day;
      });
      const okDay = dayDiffs.length === 2 && otherDiffs.length === 0 &&
        lineDiffs.length === 2 &&
        dayDiffs.every(d => (typeof d.before === 'string' && typeof d.after === 'string'));
      if (!okDay) { allOk = false; verdict.perSeed[seed].bar3 = 'FAIL'; }
      else verdict.perSeed[seed].bar3 = 'PASS';
    } else {
      if (diffs.length !== 0) { allOk = false; verdict.perSeed[seed].bar3 = 'FAIL'; }
      else verdict.perSeed[seed].bar3 = 'PASS';
    }
    // Bar (1) + (4) on delivery seeds.
    if (isDelivery) {
      const day = DELIVERY[seed];
      const lines = (after.tableLines || []).filter(l => l && l.day === day);
      const trib = lines.find(l => typeof l.line === 'string' && l.line.indexOf('◈ THE TRIBUTE') === 0);
      const mercy = lines.find(l => typeof l.line === 'string' && l.line.indexOf('◈ THE TABLE') === 0);
      const snap = (after.snapshots || []).find(s => s && s.day === day);
      const gateOk = snap && snap.gate ? snap.gate.ok : null;
      const b1 = !!(trib && trib.line.indexOf(CLOSED_SEAT) >= 0 && trib.line.indexOf(OPEN_SEAT) < 0 && gateOk === false);
      const b4 = !!(mercy && mercy.line === MERCY);
      verdict.perSeed[seed].bar1 = b1 ? 'PASS' : 'FAIL';
      verdict.perSeed[seed].bar4 = b4 ? 'PASS' : 'FAIL';
      verdict.perSeed[seed].deliveryLine = trib ? trib.line : null;
      verdict.perSeed[seed].mercyLine = mercy ? mercy.line : null;
      verdict.perSeed[seed].gateOkOnDeliveryDay = gateOk;
      if (!b1 || !b4) allOk = false;
    }
    // Old-mercy sweep on every seed (bar 4, corpus-wide).
    const oldCount = (after.tableLines || []).filter(l => typeof l.line === 'string' && l.line.indexOf(OLD_MERCY) >= 0).length;
    verdict.perSeed[seed].oldMercyLines = oldCount;
    if (oldCount > 0) allOk = false;
  }

  verdict.bar1 = SEEDS.filter(s => DELIVERY[s] != null).every(s => verdict.perSeed[s] && verdict.perSeed[s].bar1 === 'PASS') ? 'PASS' : 'FAIL';
  verdict.bar3 = SEEDS.every(s => verdict.perSeed[s] && verdict.perSeed[s].bar3 === 'PASS') ? 'PASS' : 'FAIL';
  const oldTotal = SEEDS.reduce((n, s) => n + ((verdict.perSeed[s] && verdict.perSeed[s].oldMercyLines) || 0), 0);
  verdict.bar4 = (SEEDS.filter(s => DELIVERY[s] != null).every(s => verdict.perSeed[s] && verdict.perSeed[s].bar4 === 'PASS') && oldTotal === 0) ? 'PASS' : 'FAIL';
  verdict.oldMercyTotal = oldTotal;
  // Wall numbers from the after corpus (expected identical to leg 2).
  const rows = SEEDS.map(s => verdict.perSeed[s]).filter(Boolean);
  verdict.wall = {
    national: rows.filter(r => r.maxRank === 'national' || r.maxRank === 'global').length,
    wins: rows.filter(r => r.won).length,
    medianDays: rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)] || null,
    delivered: rows.filter(r => r.deliveredDay != null).length,
  };
  // Bar (2) is judged by the proof test, not here.
  verdict.bar2 = 'PROOF-TEST (scripts/test-seatvoice-a.js, 52 checks) — see evidence file';

  if (asJson) { console.log(JSON.stringify(verdict, null, 2)); }
  else {
    console.log('SEATVOICE-A verdict (before: leg-2 corpus, after: seatvoice corpus)');
    console.log('  bar (1) closed-gate delivery never overclaims : ' + verdict.bar1);
    console.log('  bar (2) open-gate delivery says it           : ' + verdict.bar2);
    console.log('  bar (3) determinism (only 2 lines move/seed)  : ' + verdict.bar3);
    console.log('  bar (4) mercy line no longer overclaims      : ' + verdict.bar4 + ' (old-mercy lines in after corpus: ' + oldTotal + ')');
    console.log('  wall after: national ' + verdict.wall.national + '/8, wins ' + verdict.wall.wins + '/8, delivered ' + verdict.wall.delivered + '/8');
    for (const seed of SEEDS) {
      const r = verdict.perSeed[seed];
      console.log('  s' + seed + ': diffs=' + r.diffs + ' bar3=' + r.bar3 +
        (DELIVERY[seed] != null ? ' bar1=' + r.bar1 + ' bar4=' + r.bar4 + ' gateOk(d' + DELIVERY[seed] + ')=' + r.gateOkOnDeliveryDay : ''));
      for (const d of r.lineDiffs) {
        console.log('      ' + d.path + ':');
        console.log('        - ' + JSON.stringify(d.before));
        console.log('        + ' + JSON.stringify(d.after));
      }
      for (const d of r.otherDiffs) console.log('      OTHER ' + d.path + ': ' + JSON.stringify(d.before) + ' -> ' + JSON.stringify(d.after));
    }
    if (verdict.errors.length) console.log('  ERRORS: ' + verdict.errors.join(' | '));
  }
  process.exit(allOk && verdict.errors.length === 0 ? 0 : 1);
}

main();
