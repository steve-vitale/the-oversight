#!/usr/bin/env node
// analyze-falseclose-b.js — arrival-conditioned false-close proxy
// (sim-falseclose-b, Loop B food-economy arm, 2026-11-02).
//
// The predecessor proxy (sim-latescape-b, scripts/analyze-latescape-b.js)
// counted an armed vetoed hop as a false close when the same-seed
// baseline leg on the same loopDay attempted that exact hop in its
// shadow hop log AND ended the day home. That conflates "attempted"
// with "taken": on seed 61802 day 14 the baseline scholar ATTEMPTED
// (4,4)->(4,6) three times in shadow, the ENGINE refused it each time,
// and it foraged elsewhere and ended home — yet the old proxy fired 3.
//
// This instrument adds the ARRIVAL CONDITION (prereg
// evidence/2026-11-02/sim-falseclose-b-prereg.md): a hop counts as a
// false close only when the baseline scholar actually ARRIVED at the
// hop destination on that seed-day, evidenced by ANY of:
//   (a) AUTHORITATIVE (new driver): a baseline hop entry for that exact
//       hop on that day with arrived === true (post-travel position
//       equalled the destination; see the ported policy's `arrived`
//       field). This is the quoting instrument.
//   (b) LEGACY FALLBACK (predecessor corpora carry no `arrived`):
//       a baseline forage event that day whose position equals the
//       destination (the scholar foraged from that tile).
//   (c) LEGACY FALLBACK: a LATER baseline hop that day whose `from`
//       equals the destination (the scholar departed from that tile).
//   (d) LEGACY FALLBACK: the baseline day-end position that day equals
//       the destination.
// Day-START position is explicitly NOT evidence. A hop with no evidence
// in any class is listed as DROPPED, never silently omitted: the CLI
// prints the full counted and dropped lists per seed.
//
// Counting is per armed vetoed-hop OCCURRENCE, matching the old proxy
// (3 vetoes of one hop = 3 entries), so old and new counts stay
// comparable. The OLD count is reported for comparison only and must
// NEVER be quoted as false closes.
//
// Usage: node scripts/analyze-falseclose-b.js --baseline <jsonl> --armed <jsonl>
// Exits 0 on a successful analysis (the instrument reports, it does not
// judge — the prereg bars are judged in the evidence file), 2 on usage
// or file errors. When required as a module, exports the pure counters
// (no CLI side effects) for scripts/test-falseclose-b.js.
'use strict';
const fs = require('fs');

function hopKey(h) {
  return h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y;
}
function sameTile(a, b) {
  return !!a && !!b && a.x === b.x && a.y === b.y;
}

// Arrival evidence class for one baseline seed-day and one hop, or null.
// `hops` are that day's baseline hop-log slice in chronological order.
function arrivalEvidence(baseDay, hop) {
  const hops = baseDay.hops || [];
  const dest = hop.to;
  for (const h of hops) {
    if (hopKey(h) === hopKey(hop) && h.arrived === true) return 'arrived-field';
  }
  for (const f of (baseDay.forages || [])) {
    if (sameTile(f.pos, dest)) return 'forage-at-dest';
  }
  let seen = false;
  for (const h of hops) {
    if (!seen && hopKey(h) === hopKey(hop)) { seen = true; continue; }
    if (seen && sameTile(h.from, dest)) return 'later-departure-from-dest';
  }
  if (sameTile(baseDay.end && baseDay.end.pos, dest)) return 'day-end-at-dest';
  return null;
}

// Count old-proxy and new-proxy false closes for one seed pair.
// Returns { seed, old: [...], counted: [...], dropped: [...] } where each
// entry is { seed, loopDay, hop, evidence? , reason? }.
function countFalseCloses(baselineInst, armedInst) {
  const out = { seed: baselineInst.seed, old: [], counted: [], dropped: [] };
  const bDays = new Map((baselineInst.days || []).map((d) => [d.loopDay, d]));
  for (const d of (armedInst.days || [])) {
    const bd = bDays.get(d.loopDay);
    if (!bd || !bd.end || !bd.end.pos) continue;
    const hv = bd.end.haven || { x: 4, y: 4 };
    if (!(bd.end.pos.x === hv.x && bd.end.pos.y === hv.y)) continue; // day-end-home gate (both proxies)
    const bKeys = new Set((bd.hops || []).map(hopKey));
    for (const h of (d.hops || []).filter((x) => x.vetoed)) {
      const k = hopKey(h);
      if (!bKeys.has(k)) continue; // baseline never attempted it: not a false close under either proxy
      const entry = { seed: armedInst.seed, loopDay: d.loopDay, hop: k };
      out.old.push(entry);
      const ev = arrivalEvidence(bd, h);
      if (ev) out.counted.push(Object.assign({}, entry, { evidence: ev }));
      else out.dropped.push(Object.assign({}, entry, { reason: 'no-arrival-evidence' }));
    }
  }
  return out;
}

// Forage identity between two legs of one seed (diagnostic bar D1):
// every day's forage list must match exactly (positions, ok flags, added
// items and lump components, in order). Returns { identical, diffs }.
function foragesIdentical(baselineInst, armedInst) {
  const diffs = [];
  const aDays = new Map((armedInst.days || []).map((d) => [d.loopDay, d]));
  for (const bd of (baselineInst.days || [])) {
    const ad = aDays.get(bd.loopDay);
    if (!ad) { diffs.push({ loopDay: bd.loopDay, what: 'armed day missing' }); continue; }
    const b = JSON.stringify(bd.forages || []);
    const a = JSON.stringify(ad.forages || []);
    if (b !== a) diffs.push({ loopDay: bd.loopDay, what: 'forage lists differ' });
  }
  return { identical: diffs.length === 0, diffs };
}

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function main() {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i < 0 ? fallback : process.argv[i + 1];
  };
  const baseFile = arg('baseline', null), armedFile = arg('armed', null);
  if (!baseFile || !armedFile) {
    console.error('usage: analyze-falseclose-b.js --baseline <jsonl> --armed <jsonl>');
    process.exit(2);
  }
  const baseline = readJsonl(baseFile), armed = readJsonl(armedFile);
  const aBySeed = new Map(armed.map((inst) => [inst.seed, inst]));
  let totOld = 0, totNew = 0;
  console.log('PER-SEED FALSE-CLOSE TABLE (old proxy = comparison only, NEVER quoted; new proxy = arrival-conditioned)');
  console.log('seed | old | new | counted (hop @ day, evidence) | dropped (hop @ day, reason)');
  for (const b of baseline) {
    const a = aBySeed.get(b.seed);
    if (!a) { console.log(b.seed + ' | NO ARMED LEG'); continue; }
    const r = countFalseCloses(b, a);
    const fi = foragesIdentical(b, a);
    totOld += r.old.length; totNew += r.counted.length;
    console.log(b.seed + ' | ' + r.old.length + ' | ' + r.counted.length +
      ' | ' + JSON.stringify(r.counted.map((e) => e.hop + ' @d' + e.loopDay + ' [' + e.evidence + ']')) +
      ' | ' + JSON.stringify(r.dropped.map((e) => e.hop + ' @d' + e.loopDay + ' [' + e.reason + ']')) +
      ' | foragesIdentical=' + fi.identical + (fi.identical ? '' : ' ' + JSON.stringify(fi.diffs)));
  }
  console.log('TOTAL: old=' + totOld + ' new=' + totNew + ' dropped=' + (totOld - totNew));
}

if (require.main === module) main();

module.exports = { hopKey, sameTile, arrivalEvidence, countFalseCloses, foragesIdentical, readJsonl };
