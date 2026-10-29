#!/usr/bin/env node
// scripts/test-pickband-a-sense.js — SENSE-TESTING LAW leg for
// sim-pickband-a. Quotes, verbatim from the corpus, ONE pick chain
// per the prereg hierarchy (fixed before any judged run):
//   tier 1: a primary wave-4 HUNT pick chain (pick / departure /
//     drop / later-pick / death records in part order);
//   tier 2 (only if tier 1 is empty): a wave-4 memory-holder pick
//     chain (offered picks, chosen kinds, candidate at pick);
//   tier 3 (only if tier 2 is empty): a wave-4 survivor's
//     note+meeting chain.
// The tier used is printed and must be named in the evidence.
// Exit 0 only when a chain is quoted. The plain-words judgment
// itself lives in the evidence file; this script proves the
// trace exists and is verbatim.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyPick } = require('./test-departlag-a');
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const evidDir = get('--evid') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-pickband-a');
const mons = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const list = Array.isArray(mons) ? mons : (mons.monsters || []);
const WAVE4 = new Set(list.filter(m => (m.wave | 0) === 4).map(m => m.id));
const SEEDS = [75117, 75118, 75119, 75120, 75121, 75122, 75123, 75124];
function trace(row, vid) {
  const lines = [];
  for (const p of (row.funnel.picks || []).filter(p => p.vid === vid)) {
    const ch = p.chosen || {};
    lines.push({ part: p.part, s: `  PICK d${p.day} part=${p.part} chosen=${ch.kind}${ch.huntMid ? '/' + ch.huntMid : ''}${ch.huntDay != null ? ' huntDay=' + ch.huntDay : ''} candidate=${p.candidate ? p.candidate.mid + '@(' + p.candidate.tx + ',' + p.candidate.ty + ')/day' + p.candidate.day : 'null'} gates=${JSON.stringify(p.gates)} pre=${JSON.stringify(p.preSightings)}` });
  }
  for (const d of (row.returns.departures || []).filter(d => d.vid === vid)) {
    const o = d.objective || {};
    lines.push({ part: d.part, s: `  DEP d${d.day} part=${d.part} ${o.kind}${o.huntMid ? ' ' + o.huntMid + ' huntDay=' + o.huntDay : ''} -> (${o.tx},${o.ty})` });
  }
  for (const d of (row.returns.drops || []).filter(d => d.vid === vid)) lines.push({ part: d.part, s: `  DROP d${d.day} part=${d.part} ${d.mid} @(${d.tx},${d.ty}) dropped=${d.dropped}` });
  for (const n of (row.funnel.notes || []).filter(n => n.vid === vid)) lines.push({ part: n.part, s: `  NOTE d${n.day} part=${n.part} ${n.mid} @(${n.tx},${n.ty}) refreshed=${n.refreshed} evicted=${JSON.stringify(n.evicted)}` });
  for (const d of (row.deathsList || []).filter(d => d.who === vid)) lines.push({ part: 1e9, s: `  DEATH d${d.day} ${d.who} cause=${d.cause}` });
  lines.sort((a, b) => a.part - b.part);
  return lines.map(l => l.s).join('\n');
}
let tier = null, chosen = null;
for (const seed of SEEDS) {
  const fn = path.join(evidDir, `s${seed}-fresh.json`);
  if (!fs.existsSync(fn)) continue;
  const row = JSON.parse(fs.readFileSync(fn, 'utf8'));
  // Tier 1: primary pick, prefer DEPARTED then any other class.
  const prim = [];
  for (const p of (row.funnel.picks || [])) {
    if (p.chosen && p.chosen.kind === 'HUNT' && WAVE4.has(p.chosen.huntMid)) prim.push({ row, pick: p, cls: classifyPick(p, row) });
  }
  if (prim.length && !tier) {
    const dep = prim.find(e => e.cls.cls === 'DEPARTED') || prim[0];
    tier = 'TIER-1-PRIMARY'; chosen = dep;
  }
  if (!tier) {
    // Tier 2: any funnel pick for a wave-4 memory holder (the
    // recorder only records such picks, so any funnel pick
    // qualifies as a memory-holder chain anchor).
    const anyPick = (row.funnel.picks || [])[0];
    if (anyPick) { tier = 'TIER-2-MEMORY-HOLDER'; chosen = { row, pick: anyPick, cls: null }; }
  }
  if (tier) break;
}
console.log('=== sim-pickband-a sense trace (verbatim from corpus) ===');
if (!chosen) {
  // Tier 3: a wave-4 survivor meeting chain from fieldparty.
  for (const seed of SEEDS) {
    const fn = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(fn)) continue;
    const row = JSON.parse(fs.readFileSync(fn, 'utf8'));
    const m = (row.fieldparty.meetings || []).find(x => (x.wave | 0) === 4 && x.channel === 'field' && x.outcome === 'vFlee');
    if (m) { tier = 'TIER-3-SURVIVOR-MEETING'; chosen = { row, meeting: m }; break; }
  }
}
if (!chosen) { console.log('SENSE: NO CHAIN FOUND (no primary pick, no funnel pick, no wave-4 survivor meeting)'); console.log('PICKBAND-SENSE FAIL'); process.exit(1); }
if (chosen.meeting) {
  console.log(`\n-- ${tier}: s${chosen.row.seed} meeting ${JSON.stringify(chosen.meeting)}`);
} else {
  const c = chosen.cls;
  console.log(`\n-- ${tier}: s${chosen.row.seed} ${chosen.pick.vid} ${chosen.pick.chosen.huntMid || chosen.pick.chosen.kind} pick d${chosen.pick.day}${c ? ` -> ${c.cls}: ${c.sub}` : ''}`);
  console.log(trace(chosen.row, chosen.pick.vid));
}
console.log(`\nPICKBAND-SENSE PASS (${tier})`);
