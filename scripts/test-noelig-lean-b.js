#!/usr/bin/env node
// test-noelig-lean-b.js — proof tests for the noelig lean-band measurement
// (sim-noelig-lean-b, 2026-10-26). T1 runs BEFORE the sweep (fixture
// taxonomy checks); T2 runs AFTER (corpus assertions, including the
// neutrality leg FIRST: cap0 vs cap1 numerics identical, before any
// classified number is judged). Usage:
//   node scripts/test-noelig-lean-b.js            (T1 only, no corpus)
//   node scripts/test-noelig-lean-b.js --corpus   (T1 + T2)
// Corpus dir: evidence/2026-10-26/sim-noelig-lean-b-corpus/
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

// --- T1: taxonomy fixtures (same taxonomy as sim-plainvoice-b) ---
(function t1() {
  const day = 10;
  let g = fakeGame({ day, preservedKcal: 20000, eligible: true, voiceDay: 10 });
  let ctx = recomputeContext(g, 'Ana');
  check('T1 silenced ctx ok', ctx.ok === true, JSON.stringify(ctx));
  check('T1 silenced racksFull', ctx.racksFull === true);
  check('T1 silenced eligible', ctx.eligiblePresent === true);
  check('T1 silenced voice', ctx.voiceSpokenToday === true);
  check('T1 silenced class', classifyPlain(ctx, 3) === 'P-SILENCED');
  g = fakeGame({ day, preservedKcal: 20000, eligible: false, voiceDay: 9 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 noelig class', classifyPlain(ctx, 1) === 'P-RACKS-NOELIG', JSON.stringify(ctx));
  check('T1 noelig racksFull', ctx.racksFull === true);
  check('T1 noelig no-eligible', ctx.eligiblePresent === false);
  g = fakeGame({ day, preservedKcal: 0, eligible: false, voiceDay: 9 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 res2plus class', classifyPlain(ctx, 2) === 'P-RES2PLUS');
  check('T1 first class', classifyPlain(ctx, 1) === 'P-FIRST-NOSMOKE');
  // Impossible combo under gate B: racks full + eligible + no voice spoken
  // would have spoken, so a plain line with those tags is UNCLASSIFIED.
  g = fakeGame({ day, preservedKcal: 20000, eligible: true, voiceDay: 9 });
  ctx = recomputeContext(g, 'Ana');
  check('T1 impossible combo unclassified', classifyPlain(ctx, 1) === 'UNCLASSIFIED');
  // Ambiguous rackCap across same-first-name candidates -> UNCLASSIFIED.
  g = fakeGame({ day, preservedKcal: 20000, eligible: false, voiceDay: 9,
    villagers: [{ name: 'Ana Reyes' }, { name: 'Ana Park' }],
    skills: { 'Ana Reyes': 0, 'Ana Park': 3 } });
  ctx = recomputeContext(g, 'Ana');
  check('T1 ambiguous unclassified', ctx.ok === false && classifyPlain(ctx, 1) === 'UNCLASSIFIED', JSON.stringify(ctx));
  // No candidate -> UNCLASSIFIED.
  g = fakeGame({ day, preservedKcal: 0, eligible: false, voiceDay: 9, villagers: [{ name: 'Bo Chen' }] });
  ctx = recomputeContext(g, 'Ana');
  check('T1 no-candidate unclassified', ctx.ok === false && classifyPlain(ctx, 1) === 'UNCLASSIFIED');
  // Reclassifying stored plainDetail tags reproduces the stored class
  // (taxonomy is deterministic from tags).
  check('T1 reclassify silenced', classifyPlain({ ok: true, racksFull: true, eligiblePresent: true, voiceSpokenToday: true }, 2) === 'P-SILENCED');
  check('T1 reclassify noelig', classifyPlain({ ok: true, racksFull: true, eligiblePresent: false, voiceSpokenToday: false }, 1) === 'P-RACKS-NOELIG');
})();

// --- T2: corpus assertions ---
if (process.argv.includes('--corpus')) {
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-noelig-lean-b-corpus');
  const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
  const load = (cap, seed) => {
    const f = path.join(dir, `noelig-lean-b-cap${cap}-pd0-dg1-competent-nofeast-s${seed}.json`);
    check(`T2 file present cap${cap} s${seed}`, fs.existsSync(f), f);
    if (!fs.existsSync(f)) return null;
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { check(`T2 file parses cap${cap} s${seed}`, false, e.message); return null; }
  };
  const NUM = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions', 'deaths', 'national', 'rank', 'table', 'win'];
  let bandPlain = 0, bandUnclass = 0, bandNoelig = 0;
  for (const seed of seeds) {
    const c0 = load(0, seed), c1 = load(1, seed);
    if (!c0 || !c1) continue;
    // NEUTRALITY LEG FIRST: numeric fields identical cap0 vs cap1.
    for (const k of NUM) check(`T2 neutrality s${seed} ${k}`, JSON.stringify(c0[k]) === JSON.stringify(c1[k]), `cap0=${JSON.stringify(c0[k])} cap1=${JSON.stringify(c1[k])}`);
    check(`T2 neutrality s${seed} waveReach`, JSON.stringify(c0.waveReach) === JSON.stringify(c1.waveReach));
    check(`T2 neutrality s${seed} deathCauses`, JSON.stringify(c0.deathCauses) === JSON.stringify(c1.deathCauses));
    // Substrate assertions on cap1.
    check(`T2 substrate policy s${seed}`, c1.policy === 'competent-nofeast', c1.policy);
    check(`T2 substrate feast off s${seed}`, c1.competentFeast === 0 && c1.feastscaleR13 === 0);
    check(`T2 substrate pd0/dg1 s${seed}`, c1.plentydepri === 0 && c1.depositgate === 1);
    check(`T2 batches>=resolutions s${seed}`, c1.preserveVillagerBatches >= c1.preserveVillagerResolutions, `b=${c1.preserveVillagerBatches} r=${c1.preserveVillagerResolutions}`);
    check(`T2 worked==resolutions s${seed}`, c1.workedLines === c1.preserveVillagerResolutions, `worked=${c1.workedLines} res=${c1.preserveVillagerResolutions}`);
    check(`T2 say under cap s${seed}`, c1.sayTotal != null && c1.sayTotal <= 1000, `say=${c1.sayTotal}`);
    check(`T2 frame sum s${seed}`, c1.workedLines + c1.racksFullLines + c1.plainLines === c1.sayTotal, `w=${c1.workedLines} r=${c1.racksFullLines} p=${c1.plainLines} say=${c1.sayTotal}`);
    // Class counts sum to plain total; stored class matches tag reclassification.
    const cc = c1.classCounts || {};
    const sum = Object.values(cc).reduce((a, b) => a + b, 0);
    check(`T2 class sum==plain s${seed}`, sum === c1.plainLines, `sum=${sum} plain=${c1.plainLines}`);
    let reclassBad = 0;
    for (const p of (c1.plainDetail || [])) {
      const rc = classifyPlain({ ok: p.unclassReason ? false : true, racksFull: p.racksFull, eligiblePresent: p.eligiblePresent, voiceSpokenToday: p.voiceSpokenToday }, p.resIndex);
      // UNCLASSIFIED lines with a recompute failure carry unclassReason;
      // the impossible-combo case reclassifies from tags alone.
      if (p.unclassReason && p.unclassReason !== 'impossible-combo') continue;
      if (rc !== p.class) reclassBad++;
    }
    check(`T2 stored classes reclassify s${seed}`, reclassBad === 0, `bad=${reclassBad}`);
    check(`T2 silenced coherent s${seed}`, c1.silencedIncoherent === 0, `incoherent=${c1.silencedIncoherent}`);
    bandPlain += c1.plainLines || 0;
    bandUnclass += cc.UNCLASSIFIED || 0;
    bandNoelig += cc['P-RACKS-NOELIG'] || 0;
    // Per-seed counts published individually (printed by the analyzer too).
    console.log(`SEED ${seed} plain=${c1.plainLines} SILENCED=${cc['P-SILENCED'] || 0} NOELIG=${cc['P-RACKS-NOELIG'] || 0} RES2PLUS=${cc['P-RES2PLUS'] || 0} FIRST=${cc['P-FIRST-NOSMOKE'] || 0} UNCLASS=${cc.UNCLASSIFIED || 0}`);
  }
  const cov = bandPlain ? (bandPlain - bandUnclass) / bandPlain : 0;
  check('T2 band coverage >=95%', cov >= 0.95, `plain=${bandPlain} unclass=${bandUnclass} cov=${cov}`);
  console.log(`BAND plain=${bandPlain} unclass=${bandUnclass} noelig=${bandNoelig} coverage=${(cov * 100).toFixed(2)}%`);
}

console.log(`${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
