#!/usr/bin/env node
// scripts/test-departlag-a-sense.js — SENSE-TESTING LAW leg for
// sim-departlag-a. Quotes, verbatim from the corpus, one DEPARTED
// wave-4 HUNT chain and one picked-never-departed (superseded /
// died / held) chain, with the pick / departure / drop / later-pick
// / death records in part order. If the primary universe holds no
// non-departed chain, it falls back to the nearest non-departed
// HUNT chain from the secondary census, LABELED as secondary, per
// the prereg. Exit 0 only when a departed chain and a
// non-departed chain (primary or labeled-secondary) are both
// quoted. The plain-words judgment itself lives in the evidence
// file; this script proves the traces exist and are verbatim.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyPick } = require('./test-departlag-a');
const REPO = path.join(__dirname, '..');
const args = process.argv.slice(2);
const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const evidDir = get('--evid') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-departlag-a');
const mons = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const list = Array.isArray(mons) ? mons : (mons.monsters || []);
const WAVE4 = new Set(list.filter(m => (m.wave | 0) === 4).map(m => m.id));
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108, 75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];
function trace(row, pick, cls) {
  const lines = [];
  const picks = (row.funnel.picks || []).filter(p => p.vid === pick.vid);
  const deps = (row.returns.departures || []).filter(d => d.vid === pick.vid);
  const drops = (row.returns.drops || []).filter(d => d.vid === pick.vid);
  const deaths = (row.deathsList || []).filter(d => d.who === pick.vid);
  for (const p of picks) {
    const ch = p.chosen || {};
    lines.push({ part: p.part, s: `  PICK d${p.day} part=${p.part} chosen=${ch.kind}${ch.huntMid ? '/' + ch.huntMid : ''}${ch.huntDay != null ? ' huntDay=' + ch.huntDay : ''} candidate=${p.candidate ? p.candidate.mid + '@(' + p.candidate.tx + ',' + p.candidate.ty + ')/day' + p.candidate.day : 'null'} pre=${JSON.stringify(p.preSightings)}` });
  }
  for (const d of deps) {
    const o = d.objective || {};
    lines.push({ part: d.part, s: `  DEP d${d.day} part=${d.part} ${o.kind}${o.huntMid ? ' ' + o.huntMid + ' huntDay=' + o.huntDay : ''} -> (${o.tx},${o.ty})` });
  }
  for (const d of drops) lines.push({ part: d.part, s: `  DROP d${d.day} part=${d.part} ${d.mid} @(${d.tx},${d.ty}) dropped=${d.dropped}` });
  for (const d of deaths) lines.push({ part: 1e9, s: `  DEATH d${d.day} ${d.who} cause=${d.cause}` });
  lines.sort((a, b) => a.part - b.part);
  return lines.map(l => l.s).join('\n');
}
const primary = [], secondary = [];
for (const seed of SEEDS) {
  const fn = path.join(evidDir, `s${seed}-fresh.json`);
  if (!fs.existsSync(fn)) continue;
  const row = JSON.parse(fs.readFileSync(fn, 'utf8'));
  for (const p of (row.funnel.picks || [])) {
    if (!p.chosen || p.chosen.kind !== 'HUNT' || !p.chosen.huntMid) continue;
    const c = classifyPick(p, row);
    const entry = { row, pick: p, cls: c };
    secondary.push(entry);
    if (WAVE4.has(p.chosen.huntMid)) primary.push(entry);
  }
}
const departed = primary.find(e => e.cls.cls === 'DEPARTED');
let nonDep = primary.find(e => e.cls.cls !== 'DEPARTED');
let nonDepLabel = 'PRIMARY';
if (!nonDep) {
  nonDep = secondary.find(e => e.cls.cls !== 'DEPARTED');
  nonDepLabel = 'SECONDARY (labeled fallback per prereg)';
}
console.log('=== sim-departlag-a sense traces (verbatim from corpus) ===');
console.log(`primary wave-4 HUNT picks=${primary.length} secondary HUNT picks=${secondary.length}`);
let ok = true;
if (departed) {
  console.log(`\n-- DEPARTED chain: s${departed.row.seed} ${departed.pick.vid} ${departed.pick.chosen.huntMid} pick d${departed.pick.day} -> ${departed.cls.sub}`);
  console.log(trace(departed.row, departed.pick, departed.cls));
} else { console.log('\n-- DEPARTED chain: NONE in primary universe'); ok = false; }
if (nonDep) {
  console.log(`\n-- NON-DEPARTED chain [${nonDepLabel}]: s${nonDep.row.seed} ${nonDep.pick.vid} ${nonDep.pick.chosen.huntMid} pick d${nonDep.pick.day} -> ${nonDep.cls.cls}: ${nonDep.cls.sub}`);
  console.log(trace(nonDep.row, nonDep.pick, nonDep.cls));
} else { console.log('\n-- NON-DEPARTED chain: NONE in primary or secondary'); ok = false; }
console.log(`\nDEPARTLAG-SENSE ${ok ? 'PASS' : 'FAIL'}`);
process.exit(ok ? 0 : 1);
