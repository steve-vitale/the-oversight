#!/usr/bin/env node
// scripts/test-picktime-a-sense.js — sim-picktime-a sense proof.
// PURE READS over the picktime corpus + the joint analyzer
// (scripts/test-picktime-a.js, joinPick imported, not copied).
// Prints one verbatim pick→departure chain: tier 1 = a DEPARTED
// primary pick if one exists (pick stamps, verdict window,
// departure stamps, drop), else tier 2 = a SUPERSEDED primary
// pick (pick stamps, verdict window, superseding pick). The
// tier used is printed and is the sense result — a tier-2 bar
// on an empty primary is NOT a tier-1 pass.
// Usage: node scripts/test-picktime-a-sense.js [--evid <dir>]
// Exit 0 only when a tier-1 or tier-2 chain is printed.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];
const { joinPick } = require('./test-picktime-a');
const WAVES = {};
try {
  const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(defs) ? defs : (defs.monsters || []);
  for (const d of list) if (d && d.id) WAVES[d.id] = (d.wave | 0);
} catch (e) {}
function main() {
  const args = process.argv.slice(2);
  const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
  const evidDir = get('--evid') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-picktime-a');
  const rows = [];
  for (const seed of SEEDS) {
    const fn = path.join(evidDir, `s${seed}-fresh.json`);
    if (fs.existsSync(fn)) rows.push(JSON.parse(fs.readFileSync(fn, 'utf8')));
  }
  const primary = [];
  for (const r of rows) {
    for (const p of ((r.funnel || {}).picks || [])) {
      if (!p.chosen || p.chosen.kind !== 'HUNT' || !p.chosen.huntMid) continue;
      if (WAVES[p.chosen.huntMid] !== 4) continue;
      primary.push({ row: r, pick: p, joined: joinPick(r, p) });
    }
  }
  primary.sort((a, b) => (a.pick.part | 0) - (b.pick.part | 0));
  const chosen = primary.find(c => c.joined.joinedCls === 'DEPARTED-PICK-LINKED')
    || primary.find(c => c.joined.joinedCls === 'SUPERSEDED');
  if (!chosen) {
    console.log('PICKTIME-SENSE: no primary pick to read (primary n=0)');
    process.exit(1);
  }
  const tier = chosen.joined.joinedCls === 'DEPARTED-PICK-LINKED' ? 'TIER-1-DEPARTED' : 'TIER-2-SUPERSEDED';
  const { row: r, pick: p, joined: c } = chosen;
  const vid = p.vid, mid = p.chosen.huntMid;
  const lo = (p.part | 0) - 30, hi = (c.depPart != null ? c.depPart : p.part) + 20;
  console.log(`=== sim-picktime-a sense ${tier} ===`);
  console.log(`PICK s${r.seed} ${vid} ${mid} huntDay=${p.chosen.huntDay} picked d${p.day} part=${p.part} dayPart=${p.dayPart} ageAtPick=${c.ageAtPick} joined=${c.joinedCls}`);
  console.log(`  preSightings=${JSON.stringify(p.preSightings)} candidate=${JSON.stringify(p.candidate)} gates=${JSON.stringify(p.gates)}`);
  console.log(`  funnel picks for ${vid} in part window [${lo}, ${hi}]:`);
  for (const q of ((r.funnel || {}).picks || []).filter(q => q.vid === vid && (q.part | 0) >= lo && (q.part | 0) <= hi).sort((a, b) => a.part - b.part)) {
    console.log(`    PICK d${q.day} part=${q.part} dayPart=${q.dayPart} chosen=${q.chosen.kind}${q.chosen.huntMid ? '/' + q.chosen.huntMid : ''} candidate=${q.candidate ? q.candidate.mid + '@(' + q.candidate.tx + ',' + q.candidate.ty + ')/day' + q.candidate.day : 'null'}`);
  }
  console.log(`  departhold evaluations in pick window (evalCount=${c.evalCount} neverChecked=${c.neverChecked}):`);
  for (const e of ((r.departhold || {}).evaluations || []).filter(e => e.vid === vid && (e.part | 0) >= (p.part | 0) && (e.part | 0) <= hi).sort((a, b) => a.part - b.part)) {
    const dg = (e.danger || []).map(v => v.verdict + '/' + v.score).join(',');
    console.log(`    EVAL d${e.day} part=${e.part} dayPart=${e.dayPart} action=${e.action} sub=${e.sub} pre=${e.pre ? e.pre.kind + '/' + e.pre.huntMid + '/day' + e.pre.huntDay : 'null'} danger=[${dg}]`);
  }
  console.log(`  returns departures/drops for ${vid}/${mid}:`);
  for (const d of ((r.returns || {}).departures || []).filter(d => d.vid === vid).sort((a, b) => a.part - b.part)) {
    console.log(`    DEP d${d.day} part=${d.part} dayPart=${d.dayPart} kind=${d.objective.kind} huntMid=${d.objective.huntMid} huntDay=${d.objective.huntDay}`);
  }
  for (const d of ((r.returns || {}).drops || []).filter(d => d.vid === vid && d.mid === mid).sort((a, b) => a.part - b.part)) {
    console.log(`    DROP d${d.day} part=${d.part} dayPart=${d.dayPart} mid=${d.mid} dropped=${d.dropped}`);
  }
  console.log(`  deaths for ${vid}: ${JSON.stringify((r.deathsList || []).filter(d => d.who === vid))}`);
  console.log(`  JOINED: lag=${c.lagDays}d/${c.lagParts}p dep d${c.depDay} part=${c.depPart} dayPart=${c.depDayPart} ageAtDeparture=${c.ageAtDeparture} stale=${c.staleAtDeparture} dropped=${c.dropped} dropDay=${c.dropDay} overwrite=${JSON.stringify(c.overwrite)} departedEval=${JSON.stringify(c.departedEval)}`);
  console.log(`PICKTIME-SENSE PASS (${tier})`);
}
main();
