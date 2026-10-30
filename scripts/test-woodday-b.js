#!/usr/bin/env node
// test-woodday-b.js — proof for sim-woodday-b (daytime wood
// recovery census + morning-gather probe). Pure reads + unit
// tests; writes nothing. Exits non-zero on any failure.
//
// Proves:
//  P1 probeGate unit cases (act + every skip).
//  P2 instrumented legs reproduce the fresh master-driver legs
//     exactly (creek/still/rescued/warmth counts, per leg).
//  P3 guard legs: 0 warmth acted.
//  P4 daytime deltas: 0 positive, 0 negative on ON, guard, and
//     probe corpora; 0 delta mismatches; 0 carry-inside-strand.
//  P5 overnight reconciliation: morningWood(N+1) ==
//     post-evening-wood(N) on every strand pair.
//  P6 probe: acted 0 bank-wide; probe stranded == ON stranded;
//     probe rescued == ON rescued (GO bar (a) fails, (b) holds).
//  P7 sharp window fact: every still evening with morningWood
//     < 4 has ZERO adjacent wood sources; the only
//     adjacent-positive still morning bank-wide is 15009 day 13
//     with morningWood 4 (probe gate pack-ready blocks, and its
//     evening failure is kcal-short, not wood-short).
//  P8 determinism: the 15003 instrumented-ON re-run file is
//     byte-identical to the judged corpus file.
//  P9 sense-read anchors: probe corpus 15215 day-10/13
//     wood-short lines name the recorded pack (3 / 1).
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const { probeGate } = require('./policies/woodday');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { console.error('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}
function eq(a, b, what) { assert.strictEqual(a, b, what + ' expected ' + b + ' got ' + a); }

const EV = path.join(__dirname, '..', 'evidence', '2026-10-30');
function loadCorpus(dir) {
  const out = {};
  for (const f of fs.readdirSync(path.join(EV, dir)).filter((f) => f.endsWith('.json')).sort()) {
    const inst = JSON.parse(fs.readFileSync(path.join(EV, dir, f), 'utf8'));
    out[inst.seed] = inst;
  }
  return out;
}
function eveningWood(e) { const c = (e.woodcarry || {}).classification || {}; return (c.woodPlayer === undefined ? null : c.woodPlayer); }
function postEveningWood(e) { const w = e.warmth || null; if (w && w.acted && w.woodAfter !== null && w.woodAfter !== undefined) return w.woodAfter; return eveningWood(e); }
function censusOf(corpus) {
  let creek = 0, still = 0, rescued = 0, acted = 0, spent = 0;
  for (const inst of Object.values(corpus)) {
    for (const e of inst.evenings) {
      const wc = e.woodcarry || {};
      if (wc.bucket !== 'creek') continue;
      creek++;
      if (wc.rescued) rescued++; else still++;
      const w = e.warmth || null;
      if (w && w.acted) { acted++; if (w.fireLit && w.logSpent >= 1) spent++; }
    }
  }
  return { creek, still, rescued, acted, spent };
}
function strandPairs(corpus) {
  // Returns { pairs, pos, neg, mism, carryIn, reconFail }.
  let pairs = 0, pos = 0, neg = 0, mism = 0, carryIn = 0, reconFail = 0;
  for (const inst of Object.values(corpus)) {
    const evs = [...inst.evenings].sort((a, b) => a.loopDay - b.loopDay);
    let run = [];
    const flush = () => {
      for (let i = 0; i + 1 < run.length; i++) {
        const a = run[i], b = run[i + 1];
        const postA = postEveningWood(a), ewB = eveningWood(b);
        if (postA === null || ewB === null) continue;
        pairs++;
        const d = ewB - postA;
        if (d > 0) pos++;
        else if (d < 0) neg++;
        if (b.woodcarryCarry && b.woodcarryCarry.acted) carryIn++;
        if (b.morningWood !== null && b.morningWood !== undefined && b.morningWood !== postA) { mism++; reconFail++; }
      }
      run = [];
    };
    for (const e of evs) {
      const wc = e.woodcarry || {};
      if (wc.bucket === 'creek' && !wc.rescued) {
        if (run.length && e.loopDay !== run[run.length - 1].loopDay + 1) flush();
        run.push(e);
      } else flush();
    }
    flush();
  }
  return { pairs, pos, neg, mism, carryIn, reconFail };
}

// P1 — probeGate unit cases.
check('P1 gate act', () => { const r = probeGate({ gameOver: false, combat: false, atHaven: false, wood: 2, kcal: 200, ticksLeft: 300 }); eq(r.act, true, 'act'); });
check('P1 gate at-haven', () => eq(probeGate({ gameOver: false, combat: false, atHaven: true, wood: 0, kcal: 500, ticksLeft: 500 }).skip, 'at-haven', 'skip'));
check('P1 gate pack-ready', () => eq(probeGate({ gameOver: false, combat: false, atHaven: false, wood: 4, kcal: 500, ticksLeft: 500 }).skip, 'pack-ready', 'skip'));
check('P1 gate kcal-floor', () => eq(probeGate({ gameOver: false, combat: false, atHaven: false, wood: 1, kcal: 79, ticksLeft: 500 }).skip, 'kcal-floor', 'skip'));
check('P1 gate ticks-floor', () => eq(probeGate({ gameOver: false, combat: false, atHaven: false, wood: 1, kcal: 500, ticksLeft: 95 }).skip, 'ticks-floor', 'skip'));
check('P1 gate game-over', () => eq(probeGate({ gameOver: true, combat: false, atHaven: false, wood: 1, kcal: 500, ticksLeft: 500 }).skip, 'game-over', 'skip'));
check('P1 gate combat', () => eq(probeGate({ gameOver: false, combat: true, atHaven: false, wood: 1, kcal: 500, ticksLeft: 500 }).skip, 'combat', 'skip'));

const masterOn = censusOf(loadCorpus('sim-woodday-b-corpus-on'));
const masterGuard = censusOf(loadCorpus('sim-woodday-b-corpus-guard'));
const instrOn = censusOf(loadCorpus('sim-woodday-b-corpus-instr-on'));
const instrGuard = censusOf(loadCorpus('sim-woodday-b-corpus-instr-guard'));
const probe = censusOf(loadCorpus('sim-woodday-b-corpus-probe'));

// P2 — instrumented == fresh master-driver legs.
check('P2 instr-ON == master-ON', () => {
  eq(instrOn.creek, masterOn.creek, 'creek'); eq(instrOn.still, masterOn.still, 'still');
  eq(instrOn.rescued, masterOn.rescued, 'rescued'); eq(instrOn.acted, masterOn.acted, 'acted');
  eq(instrOn.spent, masterOn.spent, 'spent');
  eq(masterOn.creek, 21, 'master ON creek'); eq(masterOn.still, 11, 'master ON still'); eq(masterOn.rescued, 10, 'master ON rescued');
});
check('P2 instr-guard == master-guard', () => {
  eq(instrGuard.creek, masterGuard.creek, 'creek'); eq(instrGuard.still, masterGuard.still, 'still');
  eq(instrGuard.rescued, masterGuard.rescued, 'rescued'); eq(instrGuard.acted, masterGuard.acted, 'acted');
  eq(masterGuard.creek, 15, 'master guard creek'); eq(masterGuard.still, 4, 'master guard still'); eq(masterGuard.rescued, 11, 'master guard rescued');
});

// P3 — guard warmth never acts.
check('P3 guard 0 warmth acted', () => { eq(instrGuard.acted, 0, 'guard acted'); eq(masterGuard.acted, 0, 'master guard acted'); });

// P4 + P5 — deltas and reconciliation on all instrumented corpora.
for (const [name, dir] of [['ON', 'sim-woodday-b-corpus-instr-on'], ['guard', 'sim-woodday-b-corpus-instr-guard'], ['probe', 'sim-woodday-b-corpus-probe']]) {
  const sp = strandPairs(loadCorpus(dir));
  check('P4 ' + name + ' deltas 0 pos / 0 neg', () => { eq(sp.pos, 0, 'pos'); eq(sp.neg, 0, 'neg'); });
  check('P5 ' + name + ' overnight reconciliation', () => { eq(sp.reconFail, 0, 'reconFail'); eq(sp.carryIn, 0, 'carryIn'); });
}

// P6 — probe verdict numbers.
check('P6 probe acted 0; stranded/rescued unchanged', () => {
  let acted = 0;
  for (const inst of Object.values(loadCorpus('sim-woodday-b-corpus-probe'))) {
    for (const e of inst.evenings) if (e.woodday && e.woodday.acted) acted++;
  }
  eq(acted, 0, 'probe acted');
  eq(probe.still, instrOn.still, 'probe still == ON still');
  eq(probe.rescued, instrOn.rescued, 'probe rescued == ON rescued');
  eq(probe.still - instrOn.still, 0, 'stranded-evening fall (GO needs >= 3)');
});

// P7 — sharp window fact.
check('P7 no pack<4 still morning has an adjacent source', () => {
  const hits = [];
  for (const dir of ['sim-woodday-b-corpus-instr-on', 'sim-woodday-b-corpus-instr-guard']) {
    for (const inst of Object.values(loadCorpus(dir))) {
      const mBy = {};
      for (const m of inst.mornings) mBy[m.loopDay] = m;
      for (const e of inst.evenings) {
        const wc = e.woodcarry || {};
        if (wc.bucket !== 'creek' || wc.rescued) continue;
        const m = mBy[e.loopDay];
        if (!m || !m.adjSources) continue;
        const tot = m.adjSources.tree + m.adjSources.bigtree + m.adjSources.bush;
        if (tot > 0) hits.push({ seed: inst.seed, day: e.loopDay, wood: e.morningWood, adj: m.adjSources });
        if (e.morningWood !== null && e.morningWood < 4) assert.strictEqual(tot, 0, 'pack<4 morning with adjacent source: seed ' + inst.seed + ' day ' + e.loopDay);
      }
    }
  }
  eq(hits.length, 2, 'adjacent-positive still mornings (ON + guard, same morning twice)');
  for (const h of hits) { eq(h.seed, 15009, 'hit seed'); eq(h.day, 13, 'hit day'); eq(h.wood, 4, 'hit morningWood'); }
});

// P8 — determinism re-run byte-identical.
check('P8 determinism 15003 byte-identical', () => {
  const a = fs.readFileSync(path.join(EV, 'sim-woodday-b-corpus-instr-on', 'woodday-b-nighttravel-s15003.json'));
  const b = fs.readFileSync(path.join(EV, 'sim-woodday-b-corpus-determinism', 'woodday-b-nighttravel-s15003.json'));
  assert.ok(a.equals(b), 'determinism files differ');
});

// P9 — probe sense-read anchors.
check('P9 probe 15215 wood-short lines name the pack', () => {
  const inst = loadCorpus('sim-woodday-b-corpus-probe')[15215];
  const d10 = inst.evenings.find((e) => e.loopDay === 10);
  const d13 = inst.evenings.find((e) => e.loopDay === 13);
  assert.ok((d10.fullDaySay || []).some((l) => l.indexOf('the pack holds 3 logs') >= 0), 'day10 line');
  assert.ok((d13.fullDaySay || []).some((l) => l.indexOf('the pack holds 1 log') >= 0), 'day13 line');
});

console.log('test-woodday-b: ' + pass + ' checks passed');
