#!/usr/bin/env node
// rosterlot-analyze-20261031.js — sim-rosterlot-a census analyzer.
// Derives EVERY judged number from the per-seed JSONs only (never
// re-runs sims, never re-rolls RNG). Usage:
//   node scripts/rosterlot-analyze-20261031.js [perseed-dir]
// Prints a human table plus a SUMMARY JSON line (last line).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const COMBAT_OCC_RE = /(hunter|soldier|police|marine|ranger|security|firefighter|boxer|mma)/;
function combatOcc(occLower) {
  try { return COMBAT_OCC_RE.test(String(occLower || '')); } catch (e) { return false; }
}

// Wilson 95% score interval, z = 1.96 (pinned by the proof test).
function wilson(k, n, z) {
  z = (z === undefined) ? 1.96 : z;
  if (!n) return [0, 0];
  const p = k / n, d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n)) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

function comb(n, r) {
  if (r < 0 || r > n) return 0;
  let out = 1;
  for (let i = 0; i < r; i++) out = out * (n - i) / (i + 1);
  return out;
}
// Naive-draw expectation (prereg approximation): generated ~w/o
// replacement from 78 (4 combat), bg ~w/o replacement from 100 (4 combat).
function naiveExpectation() {
  const gen = comb(74, 5) / comb(78, 5);
  const bg = comb(96, 6) / comb(100, 6);
  return { gen, bg, product: gen * bg };
}

function analyzeSeed(j) {
  const members = j.members || [];
  const askable = members.filter(m => !m.isScholar);
  return {
    seed: j.seed,
    rosterN: j.rosterN, askableN: j.askableN,
    generatedN: j.generatedN, backgroundN: j.backgroundN,
    holdersAskable: (j.askableHolders || []).length,
    holdersAskableList: j.askableHolders || [],
    holdersFull: (j.fullHolders || []).length,
    playerIsCombat: !!j.playerIsCombat,
    shape85107: !!j.shape85107,
    personMissingN: j.personMissingN || 0,
    nonzeroKillsN: j.nonzeroKillsN || 0,
    errors: (j.errors || []).length,
    trapAskableN: (j.trapKnowledgeAskable || []).length,
    trapAskableList: j.trapKnowledgeAskable || [],
    members: members.map(m => ({ vid: m.vid, isScholar: m.isScholar, source: m.source,
      name: m.name, occ: m.occ, combatOcc: m.combatOcc,
      knowsSnare: m.knowsSnare, knowsPit: m.knowsPit, kills: m.kills })),
  };
}

function main() {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-31', 'perseed-rosterlot-a');
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  const rows = files.map(f => analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
  const judged = rows.filter(r => r.errors === 0 && r.personMissingN === 0 && r.nonzeroKillsN === 0);
  const failed = rows.filter(r => !(r.errors === 0 && r.personMissingN === 0 && r.nonzeroKillsN === 0));
  const shapes = judged.filter(r => r.shape85107);
  const [lo, hi] = wilson(shapes.length, judged.length);
  const dist = {};
  for (const r of judged) dist[r.holdersAskable] = (dist[r.holdersAskable] || 0) + 1;
  const byOcc = {}, bySource = {};
  for (const r of judged) for (const h of r.holdersAskableList) {
    byOcc[h.occ] = (byOcc[h.occ] || 0) + 1;
    bySource[h.source] = (bySource[h.source] || 0) + 1;
  }
  const trapDist = {};
  for (const r of judged) trapDist[r.trapAskableN] = (trapDist[r.trapAskableN] || 0) + 1;
  const shapeAndNoTrap = judged.filter(r => r.shape85107 && r.trapAskableN === 0).length;
  const playerCombatN = judged.filter(r => r.playerIsCombat).length;
  const fullHolderDist = {};
  for (const r of judged) fullHolderDist[r.holdersFull] = (fullHolderDist[r.holdersFull] || 0) + 1;
  const exp = naiveExpectation();
  for (const r of rows) {
    console.log(`s${r.seed} roster=${r.rosterN} (gen ${r.generatedN} bg ${r.backgroundN}) askable=${r.askableN} ` +
      `holdersAskable=${r.holdersAskable} shape85107=${r.shape85107} holdersFull=${r.holdersFull} ` +
      `playerCombat=${r.playerIsCombat} trapAskable=${r.trapAskableN} missing=${r.personMissingN} ` +
      `nonzeroKills=${r.nonzeroKillsN} errors=${r.errors}` +
      (r.holdersAskableList.length ? ` holders=[${r.holdersAskableList.map(h => h.occ + '(' + h.source + ')').join(', ')}]` : ''));
  }
  console.log('---');
  console.log(`JUDGED ${judged.length}/${rows.length} (failed: ${failed.map(r => r.seed).join(', ') || 'none'})`);
  console.log(`SHAPE85107 ${shapes.length}/${judged.length} = ${(shapes.length / Math.max(1, judged.length) * 100).toFixed(1)}% Wilson95 [${lo.toFixed(4)}, ${hi.toFixed(4)}]`);
  console.log(`shape seeds: ${shapes.map(r => r.seed).join(', ')}`);
  console.log(`holder-count distribution (askable): ${JSON.stringify(dist)}`);
  console.log(`holders by occupation: ${JSON.stringify(byOcc)}`);
  console.log(`holders by source: ${JSON.stringify(bySource)}`);
  console.log(`holders-full (incl player) distribution: ${JSON.stringify(fullHolderDist)}`);
  console.log(`player-is-combat seeds: ${playerCombatN}/${judged.length}`);
  console.log(`trap-knowledge askable distribution: ${JSON.stringify(trapDist)}`);
  console.log(`shape AND zero trap-knowledge askable: ${shapeAndNoTrap}/${judged.length}`);
  console.log(`naive-draw expectation: gen ${exp.gen.toFixed(4)} x bg ${exp.bg.toFixed(4)} = ${exp.product.toFixed(4)}`);
  console.log('SUMMARY ' + JSON.stringify({
    judgedN: judged.length, totalN: rows.length, failedSeeds: failed.map(r => r.seed),
    shapeN: shapes.length, shapeRate: judged.length ? shapes.length / judged.length : 0,
    wilson95: [Number(lo.toFixed(4)), Number(hi.toFixed(4))],
    shapeSeeds: shapes.map(r => r.seed),
    holderDist: dist, holdersByOcc: byOcc, holdersBySource: bySource,
    holdersFullDist: fullHolderDist, playerCombatN,
    trapDist, shapeAndNoTrapN: shapeAndNoTrap,
    naiveExpectation: Number(exp.product.toFixed(4)),
  }));
}

if (require.main === module) main();
module.exports = { combatOcc, wilson, comb, naiveExpectation, analyzeSeed };
