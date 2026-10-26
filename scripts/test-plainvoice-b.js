#!/usr/bin/env node
// test-plainvoice-b.js — proof tests for the plainvoice recorder
// (sim-plainvoice-b, 2026-10-26). T1 runs BEFORE the sweep (fixture
// taxonomy checks); T2 runs AFTER (corpus assertions). Usage:
//   node scripts/test-plainvoice-b.js            (T1 only, no corpus)
//   node scripts/test-plainvoice-b.js --corpus   (T1 + T2)
// Corpus dir: evidence/2026-10-26/sim-plainvoice-b-corpus/
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyPlain, recomputeContext } = require('./plainvoice-capture');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function fakeGame(opts) {
  opts = opts || {};
  const pantry = [];
  if (opts.preservedKcal) pantry.push({ kcalEach: opts.preservedKcal, units: 1, foodState: 'preserved', spoilDay: 9999 });
  if (opts.eligible) pantry.push({ kcalEach: 500, units: 2, foodState: 'raw', spoilDay: opts.day + 1 });
  return {
    state: { scholar: { day: opts.day || 10 }, village: { pantry, roster: new Array(opts.roster || 10).fill('x') } },
    data: { villagers: opts.villagers || [{ name: 'Ana Reyes' }] },
    specialistSkill: (p, k) => (opts.skills || {})[p.name] || 0,
    isSpoiled: (it, bonus) => it.spoilDay <= (opts.day || 10),
    isKeepsake: () => false,
    _racksFullVoiceDay: opts.voiceDay,
  };
}

// --- T1: taxonomy fixtures ---
(function t1() {
  const day = 10;
  // P-SILENCED: racks full, eligible, complaint already spoke today.
  let g = fakeGame({ day, preservedKcal: 20000, eligible: true, voiceDay: 10 });
  let ctx = recomputeContext(g, 'Ana');
  check('T1 silenced ctx ok', ctx.ok === true, JSON.stringify(ctx));
  check('T1 silenced racksFull', ctx.racksFull === true, JSON.stringify(ctx));
  check('T1 silenced eligible', ctx.eligiblePresent === true);
  check('T1 silenced voice', ctx.voiceSpokenToday === true);
  check('T1 silenced class', classifyPlain(ctx, 3) === 'P-SILENCED');
  // P-RACKS-NOELIG: racks full, no eligible.
  g = fakeGame({ day, preservedKcal: 20000, eligible: false, voiceDay: 9 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 noelig class', classifyPlain(ctx, 1) === 'P-RACKS-NOELIG', JSON.stringify(ctx));
  // P-RES2PLUS: not full, 2nd resolution.
  g = fakeGame({ day, preservedKcal: 0, eligible: false, voiceDay: 9 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 res2plus class', classifyPlain(ctx, 2) === 'P-RES2PLUS');
  check('T1 res2plus 3rd too', classifyPlain(ctx, 3) === 'P-RES2PLUS');
  // P-FIRST-NOSMOKE: not full, 1st resolution (eligible present but
  // within dinner reserve still counts as first-nosmoke by taxonomy).
  g = fakeGame({ day, preservedKcal: 0, eligible: true, voiceDay: 9 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 first class', classifyPlain(ctx, 1) === 'P-FIRST-NOSMOKE');
  check('T1 first eligible attr', ctx.eligiblePresent === true);
  // IMPOSSIBLE COMBO: racks full + eligible + no voice spoken today
  // would have spoken under gate B -> UNCLASSIFIED, never forced.
  g = fakeGame({ day, preservedKcal: 20000, eligible: true, voiceDay: 9 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 impossible unclassified', classifyPlain(ctx, 1) === 'UNCLASSIFIED', JSON.stringify(ctx));
  // NO CANDIDATE -> UNCLASSIFIED.
  g = fakeGame({ day, preservedKcal: 0, eligible: false });
  ctx = recomputeContext(g, 'Zed');
  check('T1 no-candidate unclassified', classifyPlain(ctx, 1) === 'UNCLASSIFIED');
  // AMBIGUOUS RACKCAP: two Anas, one preserver (cap 47500) one not
  // (cap 16250), preserved 20000 sits between -> UNCLASSIFIED.
  g = fakeGame({ day, preservedKcal: 20000, eligible: false,
    villagers: [{ name: 'Ana Reyes' }, { name: 'Ana Park' }],
    skills: { 'Ana Reyes': 0, 'Ana Park': 2 } });
  ctx = recomputeContext(g, 'Ana');
  check('T1 ambiguous unclassified', classifyPlain(ctx, 1) === 'UNCLASSIFIED', JSON.stringify(ctx));
  // AGREEING CANDIDATES: two Anas, both non-preservers -> unambiguous.
  g = fakeGame({ day, preservedKcal: 0, eligible: false,
    villagers: [{ name: 'Ana Reyes' }, { name: 'Ana Park' }] });
  ctx = recomputeContext(g, 'Ana');
  check('T1 agreeing candidates ok', ctx.ok === true && ctx.candidates === 2);
  check('T1 agreeing class', classifyPlain(ctx, 1) === 'P-FIRST-NOSMOKE');
  // SKILLED COOK: preserver skill 2 -> ownShelf 40 -> cap 47500, so
  // 20000 preserved is NOT racks-full -> res2plus/first by index.
  g = fakeGame({ day, preservedKcal: 20000, eligible: false,
    villagers: [{ name: 'Ana Reyes' }], skills: { 'Ana Reyes': 2 } });
  ctx = recomputeContext(g, 'Ana');
  check('T1 skilled not-full', ctx.racksFull === false && ctx.rackCap === 47500, JSON.stringify(ctx));
  check('T1 skilled class', classifyPlain(ctx, 1) === 'P-FIRST-NOSMOKE');
  // SPOILED SURPLUS IS NOT ELIGIBLE: spoilDay <= day excluded.
  g = fakeGame({ day, preservedKcal: 20000, eligible: false, voiceDay: 10 });
  g.state.village.pantry.push({ kcalEach: 900, units: 1, foodState: 'raw', spoilDay: day });
  ctx = recomputeContext(g, 'Ana');
  check('T1 spoiled not eligible', ctx.eligiblePresent === false, JSON.stringify(ctx));
  check('T1 spoiled class noelig', classifyPlain(ctx, 1) === 'P-RACKS-NOELIG');
  // FAR SPOILDAY IS NOT ELIGIBLE: spoilDay-day > 2 excluded.
  g = fakeGame({ day, preservedKcal: 20000, eligible: false, voiceDay: 10 });
  g.state.village.pantry.push({ kcalEach: 900, units: 1, foodState: 'raw', spoilDay: day + 5 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 far not eligible', ctx.eligiblePresent === false);
})();

// --- T2: corpus assertions (only with --corpus) ---
if (process.argv.includes('--corpus')) {
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-plainvoice-b-corpus');
  const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
  const load = (cap, seed) => JSON.parse(fs.readFileSync(
    path.join(dir, `plainvoice-b-cap${cap}-pd0-dg1-leadfeast-s${seed}.json`), 'utf8'));
  let bandPlain = 0, bandUnclass = 0;
  for (const seed of seeds) {
    let c0, c1;
    try { c0 = load(0, seed); } catch (e) { check('T2 cap0 present s' + seed, false, e.message); continue; }
    try { c1 = load(1, seed); } catch (e) { check('T2 cap1 present s' + seed, false, e.message); continue; }
    check('T2 files parse s' + seed, true);
    const numFields = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerKcal',
      'preserveVillagerResolutions', 'deaths', 'national', 'rank'];
    const same = numFields.every(f => JSON.stringify(c0[f]) === JSON.stringify(c1[f])) &&
      JSON.stringify(c0.waveReach) === JSON.stringify(c1.waveReach);
    check('T2 neutrality s' + seed, same,
      numFields.filter(f => JSON.stringify(c0[f]) !== JSON.stringify(c1[f])).join(','));
    check('T2 batches>=res s' + seed, c1.preserveVillagerBatches >= c1.preserveVillagerResolutions);
    check('T2 worked==res s' + seed, c1.workedLines === c1.preserveVillagerResolutions,
      'worked=' + c1.workedLines + ' res=' + c1.preserveVillagerResolutions);
    check('T2 say under cap s' + seed, c1.sayTotal < 1000, 'sayTotal=' + c1.sayTotal);
    check('T2 plain detail count s' + seed,
      (c1.plainDetail || []).length === c1.plainLines,
      'detail=' + (c1.plainDetail || []).length + ' plain=' + c1.plainLines);
    const cc = c1.classCounts || {};
    const sum = Object.values(cc).reduce((a, b) => a + b, 0);
    check('T2 class sum==plain s' + seed, sum === c1.plainLines, 'sum=' + sum);
    bandPlain += c1.plainLines || 0;
    bandUnclass += cc.UNCLASSIFIED || 0;
    check('T2 silenced coherence s' + seed, c1.silencedIncoherent === 0,
      'incoherent=' + c1.silencedIncoherent);
    check('T2 plain frames byte-identical s' + seed,
      (c1.plainDetail || []).every(p => /^🍲 \S+ cooked for the haven — meals stretched\.$/.test(p.text)));
    check('T2 class values known s' + seed,
      Object.keys(cc).every(k => ['P-SILENCED', 'P-RACKS-NOELIG', 'P-RES2PLUS', 'P-FIRST-NOSMOKE', 'UNCLASSIFIED'].includes(k)));
  }
  check('T2 band plain > 0', bandPlain > 0, 'bandPlain=' + bandPlain);
  const cov = bandPlain ? (bandPlain - bandUnclass) / bandPlain : 0;
  check('T2 band coverage >=95%', cov >= 0.95,
    'plain=' + bandPlain + ' unclass=' + bandUnclass + ' cov=' + (cov * 100).toFixed(2) + '%');
  console.log('BAND plain=' + bandPlain + ' unclassified=' + bandUnclass + ' coverage=' + (cov * 100).toFixed(2) + '%');
}

console.log('test-plainvoice-b: ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
