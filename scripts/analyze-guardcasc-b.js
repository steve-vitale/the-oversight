#!/usr/bin/env node
// analyze-guardcasc-b.js — guard->succession cascade analyzer
// (sim-guardcasc-b, 2026-11-03). Prereg:
// evidence/2026-11-03/sim-guardcasc-b-prereg.md.
//
// Reads ONE shadow/armed pair of homeconstruct driver .jsonl
// files (one seed each) and reports, per the prereg's fixed
// definitions: day-1 identity, construction-day vetoes,
// player-death window, successor signature, candidate
// verdict, first day-5 say divergence, and the death trace
// (day records 5-7, death tele, veto/death/mantle lines).
// With --orig-shadow/--orig-armed it additionally computes
// the prereg's reproducibility levels R-SHADOW / R-VETO /
// R-OUTCOME for a fresh pair against the original pair.
//
// Usage:
//   node scripts/analyze-guardcasc-b.js <shadow.jsonl> <armed.jsonl>
//     [--seed N] [--construct-days 5,6]
//     [--orig-shadow f] [--orig-armed f]
// Prints one JSON object to stdout. Exit 0 always on a
// successful read (verdicts are data, not failures);
// exit 2 on unreadable input.
'use strict';
const fs = require('fs');

function loadPair(path, seed) {
  const lines = fs.readFileSync(path, 'utf8').split('\n').filter((l) => l.trim());
  const recs = lines.map((l) => JSON.parse(l));
  if (seed != null) {
    const r = recs.find((x) => x.seed === seed);
    if (!r) throw new Error('seed ' + seed + ' not found in ' + path);
    return r;
  }
  if (recs.length !== 1) throw new Error(path + ' holds ' + recs.length + ' records; pass --seed');
  return recs[0];
}

function dayRec(rec, loopDay) {
  return (rec.days || []).find((d) => d.loopDay === loopDay) || null;
}
function sayOf(rec, day) {
  return (rec.sayLines || []).filter((s) => s.day === day);
}
function sameDay1(a, b) {
  const d1a = dayRec(a, 1), d1b = dayRec(b, 1);
  if (!d1a || !d1b) return { ok: false, reason: 'missing day-1 record' };
  const fields = [];
  const cmp = (name, va, vb) => { if (JSON.stringify(va) !== JSON.stringify(vb)) fields.push(name); };
  cmp('start.pos', d1a.start.pos, d1b.start.pos);
  cmp('start.kcal', d1a.start.kcal, d1b.start.kcal);
  cmp('start.hydration', d1a.start.hydration, d1b.start.hydration);
  cmp('end.pos', d1a.end.pos, d1b.end.pos);
  cmp('end.kcal', d1a.end.kcal, d1b.end.kcal);
  cmp('end.hydration', d1a.end.hydration, d1b.end.hydration);
  const fa = (d1a.forages || []).map((f) => JSON.stringify(f.added));
  const fb = (d1b.forages || []).map((f) => JSON.stringify(f.added));
  cmp('forages.added', fa, fb);
  cmp('sayDay1.count', sayOf(a, 1).length, sayOf(b, 1).length);
  return { ok: fields.length === 0, diverging: fields };
}
function vetoesOn(rec, loopDay) {
  const d = dayRec(rec, loopDay);
  if (!d) return [];
  return (d.hops || []).filter((h) => h.vetoed).map((h) => ({
    from: [h.from.x, h.from.y], to: [h.to.x, h.to.y],
    simOk: h.simOk, silent: !!h.silent, homeward: !!h.homeward,
    vetoCause: h.vetoCause || (h.simOk === false ? 'escape' : 'unknown'),
    allowPrime: (h.allowPrime === undefined ? null : !!h.allowPrime),
  }));
}
function playerDeaths(rec) {
  return (rec.deaths || []).filter((d) => d.player === true).map((d) => ({
    day: d.day, kind: d.kind, who: d.who, cause: d.cause,
  }));
}
function successorSig(rec, lo, hi) {
  // Day-record start at haven with kcal 1500 inside [lo,hi],
  // or a mantle-transfer say line with day in [lo,hi].
  const recHits = [];
  for (const d of (rec.days || [])) {
    if (d.loopDay < lo || d.loopDay > hi) continue;
    const st = d.start || {};
    const hv = st.haven || { x: 4, y: 4 };
    if (st.pos && st.pos.x === hv.x && st.pos.y === hv.y && st.kcal === 1500) {
      recHits.push({ loopDay: d.loopDay, pos: [st.pos.x, st.pos.y], kcal: st.kcal });
    }
  }
  const sayHits = (rec.sayLines || []).filter((s) => s.day >= lo && s.day <= hi &&
    /MANTLE TRANSFER|wake up somebody else/i.test(s.line)).map((s) => ({
    day: s.day, seq: s.seq, line: s.line.slice(0, 200),
  }));
  return { record: recHits, say: sayHits, found: recHits.length > 0 || sayHits.length > 0 };
}
function firstDivergence(a, b, day) {
  const sa = sayOf(a, day).map((s) => s.line);
  const sb = sayOf(b, day).map((s) => s.line);
  for (let i = 0; i < Math.min(sa.length, sb.length); i++) {
    if (sa[i] !== sb[i]) return { index: i, shadow: sa[i].slice(0, 200), armed: sb[i].slice(0, 200) };
  }
  if (sa.length !== sb.length) return { index: Math.min(sa.length, sb.length), shadow: '(end)', armed: '(end)', countNote: 'lengths differ: shadow=' + sa.length + ' armed=' + sb.length };
  return null;
}
function traceLines(rec, day, re) {
  return (rec.sayLines || []).filter((s) => s.day === day && re.test(s.line))
    .map((s) => ({ day: s.day, seq: s.seq, line: s.line.slice(0, 300) }));
}
function compactDay(rec, loopDay) {
  const d = dayRec(rec, loopDay);
  if (!d) return null;
  return {
    loopDay, start: { pos: d.start.pos, kcal: d.start.kcal, day: d.start.day },
    end: { pos: d.end.pos, kcal: d.end.kcal, day: d.end.day },
    vetoes: d.vetoes, silentVetoes: d.silentVetoes,
    construct: d.construct ? { kind: d.construct.kind, startPos: d.construct.startPos,
      posAfterForced: d.construct.posAfterForced || null,
      attempt: d.construct.attempt || null } : null,
    dayEndReturnSim: d.dayEndReturnSim || null,
  };
}

function analyze(shadow, armed, constructDays) {
  const out = { seed: shadow.seed, day1: sameDay1(shadow, armed) };
  out.shadow = { daysAlive: shadow.daysAlive, endReason: shadow.endReason,
    playerDeaths: playerDeaths(shadow) };
  out.armed = { daysAlive: armed.daysAlive, endReason: armed.endReason,
    playerDeaths: playerDeaths(armed) };
  out.vetoes = {};
  for (const cd of constructDays) out.vetoes['day' + cd] = vetoesOn(armed, cd);
  const armedVetoDays = constructDays.filter((cd) => out.vetoes['day' + cd].length > 0);
  out.armedVetoDays = armedVetoDays;
  // Candidate definition (prereg, fixed): (i) veto on a
  // construction day; (ii) armed player death in
  // [vetoDay, vetoDay+2]; (iii) no shadow player death
  // in the same window; (iv) successor signature.
  let candidate = false;
  const candDetail = [];
  for (const vd of armedVetoDays) {
    const lo = vd, hi = vd + 2;
    const adeaths = out.armed.playerDeaths.filter((d) => d.day >= lo && d.day <= hi);
    const sdeaths = out.shadow.playerDeaths.filter((d) => d.day >= lo && d.day <= hi);
    const sig = successorSig(armed, lo, hi);
    const hit = adeaths.length > 0 && sdeaths.length === 0 && sig.found;
    candDetail.push({ vetoDay: vd, window: [lo, hi], armedDeaths: adeaths,
      shadowDeaths: sdeaths, successor: sig, candidate: hit });
    if (hit) candidate = true;
  }
  out.candidateDetail = candDetail;
  out.candidate = candidate;
  out.firstDivergenceDay5 = firstDivergence(shadow, armed, 5);
  out.trace = {
    shadowDays: [5, 6, 7].map((d) => compactDay(shadow, d)),
    armedDays: [5, 6, 7].map((d) => compactDay(armed, d)),
    armedVetoLines: traceLines(armed, 5, /don't walk there|can't step there/i),
    armedDeathLines: traceLines(armed, 6, /is dead|MANTLE TRANSFER|wake up somebody else/i),
    armedWakeDay6: traceLines(armed, 6, /You wake|stiff and cold|By the fire/i),
    shadowWakeDay6: traceLines(shadow, 6, /You wake|stiff and cold|By the fire/i),
  };
  return out;
}

function reproLevels(freshShadow, freshArmed, origShadow, origArmed, constructDays) {
  // R-SHADOW: fresh shadow days 1-6 start/end pos/kcal +
  // day-5/6 construct reports equal original shadow.
  let rShadow = true;
  const diffs = [];
  for (let ld = 1; ld <= 6; ld++) {
    const f = dayRec(freshShadow, ld), o = dayRec(origShadow, ld);
    if (!f || !o) { rShadow = false; diffs.push('day' + ld + ' missing'); continue; }
    for (const side of ['start', 'end']) {
      if (JSON.stringify(f[side].pos) !== JSON.stringify(o[side].pos) ||
          f[side].kcal !== o[side].kcal) {
        rShadow = false;
        diffs.push('day' + ld + ' ' + side + ' fresh=' + JSON.stringify(f[side].pos) + '/' + f[side].kcal +
          ' orig=' + JSON.stringify(o[side].pos) + '/' + o[side].kcal);
      }
    }
    if (ld >= 5) {
      if (JSON.stringify((f.construct || null)) !== JSON.stringify((o.construct || null))) {
        rShadow = false; diffs.push('day' + ld + ' construct differs');
      }
    }
  }
  // R-VETO: fresh armed day-5 hops contain (2,8)->(1,8) vetoed, spoken, E-fail.
  const d5 = dayRec(freshArmed, 5);
  const vetoHop = (d5 ? (d5.hops || []) : []).find((h) => h.vetoed &&
    h.from.x === 2 && h.from.y === 8 && h.to.x === 1 && h.to.y === 8);
  const rVeto = !!vetoHop && !vetoHop.silent && vetoHop.simOk === false;
  // R-OUTCOME: fresh armed player death day 6 cause 'the wild'
  // + successor-signature day-6 record start.
  const deaths = playerDeaths(freshArmed);
  const deathOk = deaths.some((d) => d.day === 6 && d.cause === 'the wild');
  const sig = successorSig(freshArmed, 6, 6);
  const rOutcome = deathOk && sig.found;
  // Deploy delta: entry vetoes on fresh armed days 5-6.
  const entryVetoes = [];
  for (const cd of constructDays) {
    for (const v of vetoesOn(freshArmed, cd)) {
      if (v.vetoCause === 'entry') entryVetoes.push(Object.assign({ day: cd }, v));
    }
  }
  return { rShadow, rShadowDiffs: diffs, rVeto,
    rVetoHop: vetoHop ? { from: [vetoHop.from.x, vetoHop.from.y], to: [vetoHop.to.x, vetoHop.to.y],
      simOk: vetoHop.simOk, silent: !!vetoHop.silent } : null,
    rOutcome, deathOk, successorSigDay6: sig,
    entryVetoesDays56: entryVetoes,
    reproYes: rShadow && rVeto && rOutcome };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) { console.error('usage: analyze-guardcasc-b.js <shadow.jsonl> <armed.jsonl> [--seed N] [--construct-days 5,6] [--orig-shadow f] [--orig-armed f]'); process.exit(2); }
  const opts = { constructDays: [5, 6] };
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed') opts.seed = parseInt(args[++i], 10);
    else if (args[i] === '--construct-days') opts.constructDays = args[++i].split(',').map((s) => parseInt(s, 10));
    else if (args[i] === '--orig-shadow') opts.origShadow = args[++i];
    else if (args[i] === '--orig-armed') opts.origArmed = args[++i];
    else pos.push(args[i]);
  }
  let shadow, armed;
  try {
    shadow = loadPair(pos[0], opts.seed);
    armed = loadPair(pos[1], opts.seed);
  } catch (e) { console.error('FATAL: ' + e.message); process.exit(2); }
  const out = analyze(shadow, armed, opts.constructDays);
  if (opts.origShadow && opts.origArmed) {
    const os = loadPair(opts.origShadow, opts.seed);
    const oa = loadPair(opts.origArmed, opts.seed);
    out.repro = reproLevels(shadow, armed, os, oa, opts.constructDays);
  }
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { loadPair, analyze, reproLevels, sameDay1, vetoesOn, playerDeaths, successorSig, firstDivergence };
