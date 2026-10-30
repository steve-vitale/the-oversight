#!/usr/bin/env node
// analyze-woodday-b.js — strand / daytime-delta census for
// sim-woodday-b corpora (scripts/woodday-trace-b.js, and the
// older scripts/woodwarm-trace-b.js corpora for re-analysis).
// Usage: node scripts/analyze-woodday-b.js <corpusDir> [outJson]
// Pure reads; no game code.
//
// Strand: maximal run of still-refused creek evenings on
// CONSECUTIVE loop-days (bucket creek, rescued false).
// Evening wood (pre-warmth) = classification woodPlayer.
// Post-evening wood = warmth woodAfter if warmth acted, else
// evening wood. Daytime delta (def 1) for adjacent strand
// evenings N -> N+1 = eveningWood(N+1) - postEveningWood(N).
// Overnight cannot raise wood, and morning carry acts only at
// haven (which breaks a strand), so a positive delta inside a
// strand IS daytime recovery. Delta def 2 (instrumented legs
// only) = eveningWood(N+1) - morningWood(N+1) when the morning
// carry did not act; the two must agree on every pair, and
// morningWood(N+1) must equal postEveningWood(N) (no overnight
// change). Source attribution scans the pair day's wood lines
// for the engine's verb lines.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: analyze-woodday-b.js <corpusDir> [outJson]'); process.exit(2); }
const outJson = process.argv[3] || null;

function eveningWood(e) {
  const c = (e.woodcarry || {}).classification || {};
  return (c.woodPlayer === undefined ? null : c.woodPlayer);
}
function postEveningWood(e) {
  const w = e.warmth || null;
  if (w && w.acted && w.woodAfter !== null && w.woodAfter !== undefined) return w.woodAfter;
  return eveningWood(e);
}
function attribute(lines) {
  const ls = lines || [];
  if (ls.some((l) => /comes down with a crack/.test(l))) return 'cutTree';
  if (ls.some((l) => /clear the brush/.test(l))) return 'clearBrush';
  if (ls.some((l) => /cut through the fallen tree/.test(l))) return 'clearBlockage-fallen';
  if (ls.some((l) => /from the woodpile/.test(l))) return 'takeWood-pile';
  if (ls.some((l) => /\+[0-9]+ wood/.test(l))) return 'wood-line-unnamed';
  return null;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const perSeed = {};
const strands = [];
const pairs = [];
const positiveDeltas = [];
const negativeDeltas = [];
const deltaMismatches = [];
const carryInsideStrand = [];
const windowMornings = [];
const fullTileMornings = [];
let seeds = 0, evenings = 0, creekEvenings = 0, stillRefused = 0, rescued = 0;
let warmActed = 0, warmLogSpent = 0, warmFireFailed = 0;
let strandPairs = 0, posCount = 0, zeroCount = 0, negCount = 0;
let instrumented = false;

for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const s = inst.seed;
  seeds++;
  const evs = inst.evenings || [];
  evenings += evs.length;
  const byDay = {};
  for (const e of evs) byDay[e.loopDay] = e;
  const mornByDay = {};
  for (const m of (inst.mornings || [])) mornByDay[m.loopDay] = m;
  if (evs.some((e) => e.morningWood !== undefined && e.morningWood !== null)) instrumented = true;
  perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0, warmActed: 0, warmLogSpent: 0, strands: [], daysAlive: inst.daysAlive, endReason: inst.endReason };
  for (const e of evs) {
    const wc = e.woodcarry || {};
    const ww = e.warmth || null;
    if (ww && ww.acted) {
      warmActed++; perSeed[s].warmActed++;
      if (ww.fireLit && ww.logSpent && ww.logSpent >= 1) { warmLogSpent++; perSeed[s].warmLogSpent++; }
      else if (!ww.fireLit) warmFireFailed++;
    }
    if (wc.bucket !== 'creek') continue;
    creekEvenings++; perSeed[s].creek++;
    if (wc.rescued) { rescued++; perSeed[s].rescued++; }
    else { stillRefused++; perSeed[s].still++; }
  }
  // Strand runs over consecutive loop-days.
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const rec = { seed: s, nights: run.map((e) => e.loopDay), length: run.length,
      eveningWoods: run.map((e) => eveningWood(e)), postWoods: run.map((e) => postEveningWood(e)) };
    strands.push(rec);
    perSeed[s].strands.push(rec);
    for (let i = 0; i + 1 < run.length; i++) {
      const a = run[i], b = run[i + 1];
      const ewA = eveningWood(a), postA = postEveningWood(a), ewB = eveningWood(b);
      if (ewA === null || postA === null || ewB === null) continue;
      strandPairs++;
      const d1 = ewB - postA;
      const carryB = b.woodcarryCarry || null;
      const carryActed = !!(carryB && carryB.acted);
      if (carryActed) carryInsideStrand.push({ seed: s, dayN: a.loopDay, dayNp1: b.loopDay, took: carryB.took });
      let d2 = null, recon = null;
      if (b.morningWood !== undefined && b.morningWood !== null) {
        if (b.morningWood !== postA) recon = 'morning-mismatch';
        d2 = carryActed ? (ewB - (carryB.woodAfter ?? b.morningWood)) : (ewB - b.morningWood);
        if (recon === null && d2 !== d1) recon = 'delta-mismatch';
        if (recon) deltaMismatches.push({ seed: s, dayN: a.loopDay, dayNp1: b.loopDay, postA, morningWood: b.morningWood, d1, d2, recon });
      }
      const mB = mornByDay[b.loopDay] || null;
      const adj = mB ? mB.adjSources : null;
      const adjTotal = adj ? (adj.tree + adj.bigtree + adj.bush) : null;
      if (adj && adjTotal > 0) windowMornings.push({ seed: s, dayNp1: b.loopDay, adj, inside: mB.inside, tile: mB.tile });
      const fullTotal = adj ? ((adj.fullTree || 0) + (adj.fullBigtree || 0) + (adj.fullBush || 0)) : null;
      if (adj && fullTotal > 0) fullTileMornings.push({ seed: s, dayNp1: b.loopDay, adj, inside: mB.inside, tile: mB.tile });
      const pair = { seed: s, dayN: a.loopDay, dayNp1: b.loopDay, eveningWoodN: ewA, postWoodN: postA,
        eveningWoodNp1: ewB, delta1: d1, delta2: d2, carryActed, morningWood: (b.morningWood ?? null),
        adjSources: adj, dayWoodLines: b.dayWoodLines || null, source: attribute(b.dayWoodLines) };
      pairs.push(pair);
      if (d1 > 0) { posCount++; positiveDeltas.push(pair); }
      else if (d1 === 0) zeroCount++;
      else { negCount++; negativeDeltas.push(pair); }
    }
    run = [];
  };
  const sorted = [...evs].sort((a, b) => a.loopDay - b.loopDay);
  for (const e of sorted) {
    const wc = e.woodcarry || {};
    if (wc.bucket === 'creek' && !wc.rescued) {
      if (run.length && e.loopDay !== run[run.length - 1].loopDay + 1) flush();
      run.push(e);
    } else flush();
  }
  flush();
}

const census = { dir, instrumented, seeds, files: files.length, evenings, creekEvenings, stillRefused, rescued,
  warmActed, warmLogSpent, warmFireFailed, perSeed, strands,
  strandPairs, posCount, zeroCount, negCount, pairs, positiveDeltas, negativeDeltas,
  deltaMismatches, carryInsideStrand, windowMornings, fullTileMornings };

console.log('seeds: ' + seeds + ' files: ' + files.length + ' evenings: ' + evenings + ' instrumented: ' + instrumented);
console.log('creek evenings: ' + creekEvenings + ' still-refused: ' + stillRefused + ' rescued: ' + rescued);
console.log('warmth acted: ' + warmActed + ' log-spent: ' + warmLogSpent + ' fire-failed: ' + warmFireFailed);
console.log('strands: ' + strands.length + ' strand pairs: ' + strandPairs + ' deltas pos/zero/neg: ' + posCount + '/' + zeroCount + '/' + negCount);
for (const st of strands) console.log('  STRAND seed ' + st.seed + ' nights ' + st.nights.join(',') + ' eveningWoods ' + st.eveningWoods.join(',') + ' postWoods ' + st.postWoods.join(','));
for (const p of positiveDeltas) console.log('  POSITIVE seed ' + p.seed + ' day ' + p.dayN + '->' + p.dayNp1 + ' ' + p.postWoodN + '->' + p.eveningWoodNp1 + ' source ' + (p.source || 'UNATTRIBUTED') + ' adj ' + JSON.stringify(p.adjSources) + ' lines ' + JSON.stringify(p.dayWoodLines));
for (const p of negativeDeltas) console.log('  NEGATIVE seed ' + p.seed + ' day ' + p.dayN + '->' + p.dayNp1 + ' ' + p.postWoodN + '->' + p.eveningWoodNp1);
for (const m of deltaMismatches) console.log('  MISMATCH seed ' + m.seed + ' day ' + m.dayN + '->' + m.dayNp1 + ' ' + m.recon + ' postA ' + m.postA + ' morningWood ' + m.morningWood + ' d1 ' + m.d1 + ' d2 ' + m.d2);
for (const c of carryInsideStrand) console.log('  CARRY-INSIDE-STRAND seed ' + c.seed + ' day ' + c.dayNp1 + ' took ' + c.took);
console.log('window mornings (stranded morning with adjacent wood source): ' + windowMornings.length);
for (const w of windowMornings) console.log('  WINDOW seed ' + w.seed + ' day ' + w.dayNp1 + ' adj ' + JSON.stringify(w.adj) + ' inside ' + w.inside + ' tile ' + w.tile);
console.log('supplementary full-tile mornings (stranded morning, wood anywhere on wake tile): ' + fullTileMornings.length);
for (const w of fullTileMornings) console.log('  FULLTILE seed ' + w.seed + ' day ' + w.dayNp1 + ' adj ' + JSON.stringify(w.adj) + ' inside ' + w.inside + ' tile ' + w.tile);
console.log('per-seed: ' + JSON.stringify(perSeed));
if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(census, null, 2)); console.log('wrote ' + outJson); }
