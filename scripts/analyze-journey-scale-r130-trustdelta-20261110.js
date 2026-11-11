// analyze-journey-scale-r130-trustdelta-20261110.js — journey-scale r130
// TRUST-DRAIN DECOMPOSITION analyzer (r93 follow-up #1, named 2026-11-03,
// unbuilt until this run).
//
// Reads a scale driver's per-seed trust corpora and attributes EVERY trust
// delta to the engine writer that made it:
//   <prefix>-trustset-<seed>.txt   — every nonzero trust assignment, with
//     day, link kind/other, before/after, and the call stack (driver-only
//     trust setter instrument; see journey-scale-r127-20261110.js).
//   <prefix>-trust-<seed>.txt      — daily trust snapshots per link.
//   <prefix>-trustevents-<seed>.txt — engine link-book notes (day-stamped).
//   <prefix>-capture-<seed>.txt    — the say capture (voiced lines, flat).
//
// Writer rule: the first src/js frame in the stack after the setter (skipping
// eval frames); when that frame is _trustGain (hierarchy.js:1811, the gains
// choke point) the writer is its CALLER — the deed/verb that earned the gain.
// Writer label is `fn@file:line`, so two writes in one function stay distinct.
//
// Per seed it prints:
//   - writer table (sum + count, most-negative first)
//   - per-link CHAIN WALK: within one link object each delta's `before` must
//     equal the previous delta's `after`; a break is a link replacement
//     (snapshots show the formed day changing in that window) or a GAP (a
//     delta the setter never saw — a fail). The final expected trust is
//     checked against the last snapshot within the tail bound (endDay fires
//     after the snapshot). The prereg bar is: zero GAPs, unattributed ('?')
//     share of absolute movement < 5%.
//   - unvoiced drains: deltas <= -4 with no same-day link-book note naming
//     the amount for that link (the r93 words-vs-numbers check; the note
//     regex accepts "(trust -10)", "trust −5" (unicode minus), "(Trust +8.)").
//     The capture is flat, so say-lines are verified by reading the code
//     and recorded in the run note, not by this analyzer.
//   - capture counts for the crisis/concede say lines (voiced-aloud check).
//
// Usage:
//   node scripts/analyze-journey-scale-r130-trustdelta-20261110.js \
//     --dir evidence/2026-11-10/journey-scale-r127 --prefix journey-scale-r127 \
//     --seeds 97901,97902,97903,97904
// Exit 0 with a GO/NO-GO verdict line per the prereg bar; exit 1 on
// missing input files (fail loudly, never a silent zero).
'use strict';
const fs = require('fs');
const path = require('path');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1 || i + 1 >= process.argv.length) return def;
  return process.argv[i + 1];
}
const DIR = arg('dir', null);
const PREFIX = arg('prefix', null);
const SEEDS = (arg('seeds', '') || '').split(',').map(s => s.trim()).filter(Boolean);
if (!DIR || !PREFIX || !SEEDS.length) {
  console.error('usage: node analyze-journey-scale-r130-trustdelta-20261110.js --dir <eviDir> --prefix <prefix> --seeds <csv>');
  process.exit(1);
}

function read(p) {
  if (!fs.existsSync(p)) { console.error('MISSING INPUT: ' + p); process.exit(1); }
  return fs.readFileSync(p, 'utf8');
}

// Writer from a trustset stack string. Frames are separated by ' | ' and look
// like `at Object.covenantCrisis (src/js/hierarchy.js:3642:18)` or
// `at Object.set [as trust] (...driver.js:232:25)` (the setter) or
// `at eval (src/js/hierarchy.js:1258:49)`.
function writerOf(stack) {
  if (!stack) return '?';
  const frames = stack.split('|').map(s => s.trim());
  let sawGain = false;
  for (const f of frames) {
    const m = f.match(/at (?:[^\s(]*\s)?\(?([^()\s]+\.js):(\d+):\d+\)?/);
    if (!m) continue;
    const file = m[1], line = parseInt(m[2], 10);
    if (!file.startsWith('src/js/')) continue; // the setter frame (driver) is skipped
    const fnm = f.match(/at (?:Object\.|G\.<computed> \[as )?([A-Za-z_$][\w$]*)/);
    const fn = fnm ? fnm[1] : '?';
    if (fn === 'eval') continue; // linkTick's eval'd tick: the caller frame follows
    if (fn === '_trustGain' || line === 1811) { sawGain = true; continue; } // gains choke point: caller is the writer
    if (sawGain) return fn + '@' + file.replace('src/js/', '') + ':' + line + ' (via _trustGain)';
    return fn + '@' + file.replace('src/js/', '') + ':' + line;
  }
  return '?';
}

const TRUSTSET_RX = /^d(\d+) (\S+) (\S+) (-?\d+)->(-?\d+) \(delta (-?\d+)\) :: (.*)$/;
const TRUST_RX = /^d(\d+) (\S+) (\S+) trust=(-?\d+) formed=d(\d+)/;
const NOTED_RX = /trust\s*([−\-+])\s*(\d+)/; // book notes name the delta many ways:
// "(trust -10)", "(trust +8)", "trust −5", "trust −4" (unicode minus, no parens)

let bandVerdict = true;
for (const seed of SEEDS) {
  const tsTxt = read(path.join(DIR, `${PREFIX}-trustset-${seed}.txt`));
  const trTxt = read(path.join(DIR, `${PREFIX}-trust-${seed}.txt`));
  const evTxt = read(path.join(DIR, `${PREFIX}-trustevents-${seed}.txt`));
  const capTxt = read(path.join(DIR, `${PREFIX}-capture-${seed}.txt`));

  // --- parse trustset deltas ---
  const deltas = []; // {day, kind, other, before, after, delta, writer}
  const writers = {}; // writer -> {sum, n}
  let absTotal = 0, absUnattr = 0;
  for (const line of tsTxt.split('\n')) {
    const m = line.match(TRUSTSET_RX);
    if (!m) continue;
    const day = parseInt(m[1], 10), kind = m[2], other = m[3];
    const before = parseInt(m[4], 10), after = parseInt(m[5], 10), delta = parseInt(m[6], 10);
    const writer = writerOf(m[7]);
    deltas.push({ day, kind, other, before, after, delta, writer });
    const w = (writers[writer] = writers[writer] || { sum: 0, n: 0 });
    w.sum += delta; w.n += 1;
    absTotal += Math.abs(delta);
    if (writer === '?') absUnattr += Math.abs(delta);
  }

  // --- parse daily snapshots per link (keep the formed day: a link object
  // can be replaced mid-run — the snapshots show formed=d30 then d102 for
  // the same kind|other — and the delta chain restarts at the new object).
  const snaps = {}; // key kind|other -> [{day, trust, formed}]
  for (const line of trTxt.split('\n')) {
    const m = line.match(TRUST_RX);
    if (!m) continue;
    const k = m[2] + '|' + m[3];
    (snaps[k] = snaps[k] || []).push({ day: parseInt(m[1], 10), trust: parseInt(m[4], 10), formed: parseInt(m[5], 10) });
  }

  // --- parse link-book notes per (day, link) ---
  const notes = {}; // day|kind|other -> [amounts]
  for (const line of evTxt.split('\n')) {
    const m = line.match(/^d(\d+) (\S+) (\S+) \[([^\]]+)\] (.*)$/);
    if (!m) continue;
    const nm = m[5].match(NOTED_RX);
    if (!nm) continue;
    const amt = (nm[1] === '+' ? 1 : -1) * parseInt(nm[2], 10);
    const k = m[1] + '|' + m[2] + '|' + m[3];
    (notes[k] = notes[k] || []).push(amt);
  }

  // --- per-link reconciliation: CHAIN WALK. The trustset setter logs every
  // assignment in order, so within one link object each delta's `before`
  // must equal the previous delta's `after`. A break in the chain is either
  // a link replacement (the snapshots show the formed day changing in that
  // window — the new object restarts at its formation trust) or a GAP (a
  // delta the setter never saw). The final expected trust is then checked
  // against the last snapshot: the difference must fit inside the tail
  // deltas on/after the last snapshot day (endDay fires after the snapshot).
  const links = {};
  for (const d of deltas) {
    const k = d.kind + '|' + d.other;
    (links[k] = links[k] || []).push(d);
  }
  const linkRows = [];
  for (const k of Object.keys(links).sort()) {
    const ds = links[k].slice().sort((a, b) => a.day - b.day); // stable: file order is call order within a day
    const ss = (snaps[k] || []).slice().sort((a, b) => a.day - b.day);
    let expected = null, gaps = [], replacements = 0, prevDay = null;
    for (const d of ds) {
      if (expected === null) { expected = d.after; prevDay = d.day; continue; } // first delta anchors the chain at its before, applied to its after
      if (d.before !== expected) {
        // chain break — replacement if the formed day changed in this window
        const formedBefore = (ss.filter(s => s.day <= prevDay).pop() || {}).formed;
        const formedAfter = (ss.filter(s => s.day >= d.day).shift() || {}).formed;
        if (formedBefore != null && formedAfter != null && formedBefore !== formedAfter) { replacements++; }
        else gaps.push({ day: d.day, expected, before: d.before, writer: d.writer });
        expected = d.before;
      }
      expected = d.after; prevDay = d.day;
    }
    let tailBound = 0, lastSnap = null, lastSnapDay = null;
    if (ss.length) {
      lastSnap = ss[ss.length - 1].trust; lastSnapDay = ss[ss.length - 1].day;
      for (const d of ds) if (d.day >= lastSnapDay) tailBound += Math.abs(d.delta);
    }
    const finalDiff = (expected == null || lastSnap == null) ? null : (expected - lastSnap);
    const reconOkLink = gaps.length === 0 && (finalDiff == null || Math.abs(finalDiff) <= tailBound);
    linkRows.push({ k, n: ds.length, gaps, replacements, finalDiff, tailBound, reconOkLink,
      first: ss.length ? ss[0].trust : null, last: lastSnap, attr: ds.reduce((a, d) => a + d.delta, 0) });
  }

  // --- unvoiced drains: delta <= -4 with no same-day book note naming the
  // amount. The book is the durable record (r36 titan precedent: say + book);
  // the capture is flat (no days, no link), so a say line cannot be tied to
  // one event from it — the run note verifies each flagged writer's say
  // lines by reading the code. Deltas on/after the seed's final snapshot
  // day are excluded: a note written in the final endDay is never captured
  // by the daily trustevents diff (the r127 d109/d137 tail cases).
  const finalDay = Math.max(0, ...Object.values(snaps).flat().map(s => s.day));
  const unvoiced = [];
  for (const d of deltas) {
    if (d.delta > -4) continue;
    if (d.day >= finalDay) continue; // final-endDay tail: note never captured
    const k = d.day + '|' + d.kind + '|' + d.other;
    const amounts = notes[k] || [];
    if (!amounts.includes(d.delta)) unvoiced.push(d);
  }
  const saidCounts = {}; // amount -> capture lines naming trust + amount (info only)
  for (const line of capTxt.split('\n')) {
    const m = line.match(/trust\s*[−\-]\s*(\d+)/i);
    if (m) { const a = -parseInt(m[1], 10); saidCounts[a] = (saidCounts[a] || 0) + 1; }
  }

  // --- capture counts for the crisis/concede say lines ---
  const crisisSays = (capTxt.match(/\(Trust -10\.\)/g) || []).length;
  const concedeSays = (capTxt.match(/\(Trust \+8\.\)/g) || []).length;
  const crisisDeltas = deltas.filter(d => d.writer.indexOf('covenantCrisis@') === 0).length;
  const concedeDeltas = deltas.filter(d => d.writer.indexOf('answerCovenantCrisis@') === 0).length;

  // --- verdicts ---
  const unattrShare = absTotal ? (absUnattr / absTotal) : 0;
  const reconOk = linkRows.every(r => r.reconOkLink);
  const unattrOk = unattrShare < 0.05;
  const voicedOk = unvoiced.length === 0;
  const seedOk = reconOk && unattrOk && voicedOk;
  if (!seedOk) bandVerdict = false;

  const sortedWriters = Object.keys(writers).sort((a, b) => writers[a].sum - writers[b].sum);
  console.log(`\n===== seed ${seed} =====`);
  console.log(`deltas=${deltas.length} absTotal=${absTotal} unattributed=${absUnattr} (${(unattrShare * 100).toFixed(1)}%)`);
  console.log('writers (most-negative first):');
  for (const w of sortedWriters) console.log(`  ${w}  sum=${writers[w].sum >= 0 ? '+' : ''}${writers[w].sum} n=${writers[w].n}`);
  const topDrain = sortedWriters[0], topGain = sortedWriters[sortedWriters.length - 1];
  console.log(`top drain: ${topDrain} (${writers[topDrain].sum}); top gain: ${topGain} (+${writers[topGain].sum})`);
  console.log('per-link chain walk (gaps = setter missed a delta; replacements = link object re-formed):');
  for (const r of linkRows) {
    console.log(`  ${r.k}  ${r.first}->${r.last} attr=${r.attr} n=${r.n} gaps=${r.gaps.length} replacements=${r.replacements} finalDiff=${r.finalDiff} tailBound=${r.tailBound} ${r.reconOkLink ? 'ok' : 'RECON-FAIL'}`);
    for (const g of r.gaps) console.log(`    GAP d${g.day} expected=${g.expected} before=${g.before} writer=${g.writer}`);
  }
  console.log(`unvoiced drains (<= -4, no same-day book note naming the amount): ${unvoiced.length}`);
  const unvByW = {};
  for (const d of unvoiced) unvByW[d.writer] = (unvByW[d.writer] || 0) + 1;
  for (const w of Object.keys(unvByW).sort((a, b) => unvByW[b] - unvByW[a])) console.log(`  ${w} x${unvByW[w]}`);
  for (const d of unvoiced.slice(0, 8)) console.log(`  d${d.day} ${d.kind} ${d.other} delta=${d.delta} writer=${d.writer}`);
  console.log(`capture mentions (info): ${JSON.stringify(saidCounts)}`);
  console.log(`capture: crisis "(Trust -10.)" says=${crisisSays} vs covenantCrisis deltas=${crisisDeltas}; concede "(Trust +8.)" says=${concedeSays} vs answerCovenantCrisis deltas=${concedeDeltas}`);
  console.log(`VERDICT seed ${seed}: recon ${reconOk ? 'OK' : 'FAIL'} (chain walk, no gaps) | unattributed ${unattrOk ? 'OK' : 'FAIL'} (${(unattrShare * 100).toFixed(1)}% < 5%) | voiced ${voicedOk ? 'OK' : 'FAIL'} (${unvoiced.length} unvoiced) => ${seedOk ? 'GO' : 'NO-GO'}`);
}
console.log(`\nBAND VERDICT: ${bandVerdict ? 'GO' : 'NO-GO'} (all seeds recon + unattributed + voiced)`);
process.exit(bandVerdict ? 0 : 1);
