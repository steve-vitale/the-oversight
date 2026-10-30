// Proof test for scripts/analyze-leantrade-a.js.
// 1) Fixtures on synthetic rows: classification, ambiguous-margin rule,
//    pairing check, loss buckets.
// 2) Determinism: analyze() run twice on the REAL corpora serializes
//    byte-identical.
// No game eval, no jest, no repo writes (in-memory only).
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { analyze, classify, summarizeDeaths, bucket } = require('./analyze-leantrade-a.js');

let n = 0;
const check = (cond, msg) => { assert(cond, msg); n += 1; };

// --- classification fixtures ---
check(classify('monster:combat') === 'monster-combat', 'monster:combat class');
check(classify('monster:villager combat') === 'monster-combat', 'villager combat class');
check(classify('villager:monster') === 'monster-combat', 'villager:monster class');
check(classify('player:the wild') === 'player-field', 'the wild class');
check(classify('person:ambush') === 'player-field', 'ambush class');
check(classify('player:the arena') === 'player-arena-contest', 'arena class');
check(classify('player:starvation') === 'sustenance-disease', 'starvation class');
check(classify('villager:thirst') === 'sustenance-disease', 'thirst class');
check(classify('villager:a wound that wouldn\'t close') === 'sustenance-disease', 'wound class');
check(classify('villager:Murkcap') === 'other-named', 'named cause class');

// --- dominant-share + margin rule fixtures ---
let s = summarizeDeaths({ 'monster:combat': 20, 'player:the wild': 3 });
check(s.primary === 'monster-combat' && s.margin === 17, 'clear dominant share');
s = summarizeDeaths({ 'monster:combat': 10, 'player:the wild': 9 });
check(s.primary === 'mixed/ambiguous' && s.margin === 1, 'margin<=2 is ambiguous, not forced');
s = summarizeDeaths({ 'monster:combat': 10, 'player:the wild': 8 });
check(s.primary === 'mixed/ambiguous', 'margin==2 is ambiguous');
s = summarizeDeaths({ 'monster:combat': 10, 'player:the wild': 7 });
check(s.primary === 'monster-combat', 'margin==3 is decisive');

// --- buckets ---
check(bucket(86) === 'early (<100d)', 'early bucket');
check(bucket(129) === 'mid-ambition (100-150d)', 'mid bucket');
check(bucket(166) === 'late (>150d)', 'late bucket');

// --- synthetic paired corpus fixture ---
const synth = (policy, rows) => ({ label: 'synth', policy, seeds: rows.map(r => r.seed), days: 180, runs: rows });
const comp = synth('competent', [
  { seed: 1, endReason: 'survived', days: 180, national: 0, table: 0, maxRank: 'village', waveReach: 3, maxArc: 3, deaths: { 'monster:combat': 5 }, court: {}, endGate: null },
  { seed: 2, endReason: 'village-lost', days: 90, national: 0, table: 0, maxRank: 'village', waveReach: 2, maxArc: 3, deaths: { 'monster:combat': 12, 'player:the wild': 2 }, court: {}, endGate: null },
]);
const lean = synth('leanlink', [
  { seed: 1, endReason: 'village-lost', days: 160, national: 1, table: 1, maxRank: 'national', waveReach: 4, maxArc: 4, deaths: { 'monster:combat': 15, 'player:the wild': 6 }, court: { proposedLead: 3, courtAccords: 3, courtNational: 1 }, endGate: { rank: 'national', links: [{ trust: 20 }] } },
  { seed: 2, endReason: 'village-lost', days: 130, national: 1, table: 0, maxRank: 'global', waveReach: 4, maxArc: 3, deaths: { 'monster:combat': 9, 'player:the wild': 8 }, court: { proposedLead: 3 }, endGate: { rank: 'global', links: [] } },
]);
const out = analyze(comp, lean);
check(out.corpora.seedPairingConfirmed === true, 'pairing confirmed on matching seeds');
check(out.lossInventory.length === 2, 'loss inventory covers both lost seeds');
check(out.paired[0].dayDeltaLeanMinusComp === -20, 'paired day delta');
check(out.lossDays.leanlinkBuckets['late (>150d)'] === 1, 'leanlink late bucket count');
check(out.lossDays.leanlinkBuckets['mid-ambition (100-150d)'] === 1, 'leanlink mid bucket count');
check(out.courtTotals.leanlink.proposedLead === 6, 'court totals summed');
check(out.gaps.length === 4, 'gap statements present');

// --- pairing failure fixture: mismatched seeds fail loudly, never silently ---
let threw = false;
try { analyze(comp, synth('leanlink', [lean.runs[0]])); } catch (e) { threw = /missing from leanlink corpus/.test(e.message); }
check(threw, 'missing counterpart seed throws a loud pairing error');

// --- determinism on the REAL corpora (in-memory, no writes) ---
const root = path.join(__dirname, '..', 'evidence', '2026-10-30');
const realComp = JSON.parse(fs.readFileSync(path.join(root, 'sim-vests-b-corpus-competent.json'), 'utf8'));
const realLean = JSON.parse(fs.readFileSync(path.join(root, 'sim-vests-b-corpus-leanlink.json'), 'utf8'));
const a = JSON.stringify(analyze(realComp, realLean), null, 2);
const b = JSON.stringify(analyze(realComp, realLean), null, 2);
check(a === b, 'analyzer run twice byte-identical');
const real = JSON.parse(a);
check(real.corpora.seedPairingConfirmed === true, 'real corpora pairing confirmed');
check(real.lossInventory.length === 4, 'real loss inventory: 4 seeds with any loss (9911,9912,9913,9918)');
check(real.lossDays.leanlink.join(',') === '129,139,159,166', 'real leanlink loss days');
check(real.lossDays.competent.join(',') === '86', 'real competent loss day');

console.log(`test-leantrade-a: ${n} assertions passed`);
