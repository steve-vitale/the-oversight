#!/usr/bin/env node
// analyze-postunlock-deaths.js — post-unlock death-attribution pass (gap 883).
//
// Input: one per-seed postunlock JSON (postunlockDeaths + postunlockFights,
// as written by scripts/postunlock-sweep.js) or a directory of them.
// Output: JSON summary { total, linked, unlinked, byStrength, unlinkedRows }
// plus per-seed rows. Unlinked-at-capture rows (fightBasis none — 9/28 in
// the triage corpus) are re-linked through sim-instrument-kit.js:
// fight-seq, same-day victim/monster, cause-names-monster, then nearest
// prior fight (weak, flagged). A row with no fight in window stays
// unlinked with reason 'no-fight-in-window' — the tool never invents a
// killer. Re-run over an already-captured corpus: the per-seed JSONs carry
// both postunlockDeaths and postunlockFights, so attribution improves
// without re-running the sweep.
//
// Usage:
//   node scripts/analyze-postunlock-deaths.js <per-seed.json | dir> [--json]
//   node scripts/analyze-postunlock-deaths.js <dir> --seed 70811
'use strict';
const fs = require('fs');
const path = require('path');
const kit = require('./sim-instrument-kit');

function loadInputs(target) {
  if (!fs.existsSync(target)) { console.error('not found: ' + target); process.exit(2); }
  const st = fs.statSync(target);
  if (st.isFile()) return [JSON.parse(fs.readFileSync(target, 'utf8'))];
  const out = [];
  for (const name of fs.readdirSync(target).sort()) {
    if (!name.endsWith('.json')) continue;
    try { out.push(JSON.parse(fs.readFileSync(path.join(target, name), 'utf8'))); } catch (e) { /* skip non-corpus */ }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const target = args.find(a => !a.startsWith('--'));
  let seedFilter = null;
  const si = args.indexOf('--seed');
  if (si >= 0) seedFilter = String(args[si + 1]);
  if (!target) { console.error('usage: analyze-postunlock-deaths.js <per-seed.json|dir> [--seed N]'); process.exit(2); }
  const inputs = loadInputs(target).filter(j => !seedFilter || String(j.seed) === seedFilter);
  const perSeed = [];
  let total = 0, linked = 0;
  const byStrength = { strong: 0, medium: 0, weak: 0, prior: 0 };
  const unlinkedRows = [];
  for (const j of inputs) {
    const deaths = j.postunlockDeaths || j.windowVillagerDeathList || [];
    const fights = j.postunlockFights || [];
    const res = kit.attributeWindowDeaths(deaths, fights);
    total += res.total; linked += res.linked;
    for (const k of Object.keys(byStrength)) byStrength[k] += res.byStrength[k];
    for (const r of res.unlinkedRows) unlinkedRows.push(Object.assign({ seed: j.seed }, r));
    perSeed.push({ seed: j.seed, total: res.total, linked: res.linked, unlinked: res.unlinked, byStrength: res.byStrength });
  }
  const summary = { total, linked, unlinked: total - linked, byStrength, perSeed, unlinkedRows };
  console.log(JSON.stringify(summary, null, 1));
}
if (require.main === module) main();
module.exports = { loadInputs };
