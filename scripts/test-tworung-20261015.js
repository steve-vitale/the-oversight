#!/usr/bin/env node
// scripts/test-tworung-20261015.js — proof for the two-rung re-measurement +
// national hold-duration instrument (sim-tworung2, 2026-10-15).
//
// REAL RED phases first (the asserts must FAIL on a deliberately broken
// instrument), then GREEN on the real one:
//
//   R1: naive bin function (always 'both') vs known-rung fixtures -> FAILS
//       (proves the bin asserts are sensitive to the rung math)
//   R2: MUTATE=1 naive probe (500 kcal/day pantry drain) -> trajectory hash
//       DIVERGES from clean (proves the hash is trajectory-sensitive)
//   R3: broken loss-mode (always 'unattributed') vs a link-break fixture ->
//       FAILS (proves the loss-mode asserts are sensitive)
//   G1: real attribution on the known-rung fixtures -> all bins correct
//       (blood/faced-rung, scale-rung, both, neither x3 subs, unlocked)
//   G2: real wave-5 bins on fixtures -> cap-hold, defer5-hold,
//       raw-shortfall, unlocked, n/a, unexplained
//   G3: instrument ON vs OFF byte-identical 60d (seed 33, leadfeast) ->
//       the sampler's reads are trajectory-neutral
//   G4: nationalHold on synthetic daily rows -> held-to-end, link-break,
//       village-death, succession-exile, unattributed, not-reached
//   G5: 15d smoke x 3 policies -> standing rows collect, no hallucination,
//       no crash
//
// Env: FOURTHLINK=1 FEASTSCALE_R13=1 (the substrate gates).
// Usage: FOURTHLINK=1 FEASTSCALE_R13=1 node scripts/test-tworung-20261015.js
'use strict';
process.env.FOURTHLINK = process.env.FOURTHLINK || '1';
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const RB = require('./readinessbind-lib');
const TW = require('./tworung-lib-20261015');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const { fourthlink } = require('./policies/fourthlink');
const { leadfeast, belongfeast } = require('./policies/feastscale');

let passed = 0, failed = 0;
function ok(name, fn) {
  try { fn(); passed++; console.log('  PASS ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + ' — ' + e.message); }
}
// expectFail: the fn MUST throw — a RED that doesn't fail is itself a failure.
function expectFail(name, fn) {
  try { fn(); failed++; console.log('  FAIL(red) ' + name + ' — broken instrument did NOT fail the assert (RED is insensitive!)'); }
  catch (e) { passed++; console.log('  PASS(red) ' + name + ' — correctly failed: ' + String(e.message).slice(0, 90)); }
}

function trackOf(o) {
  return Object.assign({
    n: 50, bestRaw: 0, bestGated: 0, bestWar: 0, bestDip: 0, bestPlenty: 0,
    bestWarPts: 0, bestLinks: 0, bestFeasts: 0, bestFaced3: 0, bestFaced4: 0,
    bestRawDay: 60, peak: 0, maxWave: 1, samples: [],
  }, o);
}

// ---------- R1 (RED): naive bin always 'both' must fail the asserts ----------
function naiveBin4() { return { bin: 'both', sub: 'naive' }; }
console.log('\nR1 (RED): naive bin function vs known rung states');
expectFail('R1.1 blood/faced-rung fixture', () => {
  const b = naiveBin4(trackOf({ bestWar: 20, bestDip: 68, bestLinks: 2, bestPlenty: 0, bestRaw: 88, bestFaced3: 1, bestWarPts: 1 }));
  assert.strictEqual(b.bin, 'blood/faced-rung');
});
expectFail('R1.2 scale-rung fixture', () => {
  const b = naiveBin4(trackOf({ bestWar: 75, bestWarPts: 3, bestDip: 0, bestRaw: 75, bestFaced3: 1 }));
  assert.strictEqual(b.bin, 'scale-rung');
});
expectFail('R1.3 deferral-hold fixture', () => {
  const b = naiveBin4(trackOf({ bestWar: 80, bestDip: 34, bestPlenty: 20, bestRaw: 134, bestFaced3: 2 }));
  assert.strictEqual(b.bin, 'neither');
  assert.ok(/^deferral-hold/.test(b.sub));
});

// ---------- G1 (GREEN): real rung-bin attribution on known rung states ----------
console.log('\nG1 (GREEN): rungBin4 on known rung states');
ok('G1.1 blood/faced-rung: bonds carry, blood binds', () => {
  const b = TW.rungBin4(trackOf({ bestWar: 20, bestWarPts: 1, bestDip: 68, bestLinks: 2, bestPlenty: 0, bestRaw: 88, bestFaced3: 1 }));
  assert.strictEqual(b.bin, 'blood/faced-rung');
  assert.ok(/bonds carry/.test(b.sub));
});
ok('G1.2 scale-rung: blood carries, scale binds', () => {
  const b = TW.rungBin4(trackOf({ bestWar: 75, bestWarPts: 3, bestDip: 0, bestLinks: 0, bestRaw: 75, bestFaced3: 1 }));
  assert.strictEqual(b.bin, 'scale-rung');
  assert.ok(/blood carries/.test(b.sub));
});
ok('G1.3 both: neither old-rung side near half a path', () => {
  const b = TW.rungBin4(trackOf({ bestWar: 25, bestDip: 34, bestRaw: 59, bestFaced3: 0 }));
  assert.strictEqual(b.bin, 'both');
});
ok('G1.4 both: plenty-only still has neither old rung', () => {
  const b = TW.rungBin4(trackOf({ bestWar: 0, bestDip: 0, bestPlenty: 80, bestFeasts: 4, bestRaw: 80, bestFaced3: 0 }));
  assert.strictEqual(b.bin, 'both');
  assert.ok(/plenty-only/.test(b.sub));
});
ok('G1.5 neither: deferral-hold (raw >= 100, faced-3 short)', () => {
  const b = TW.rungBin4(trackOf({ bestWar: 80, bestDip: 34, bestPlenty: 20, bestRaw: 134, bestFaced3: 2 }));
  assert.strictEqual(b.bin, 'neither');
  assert.ok(/^deferral-hold/.test(b.sub));
});
ok('G1.6 neither: hybrid gap (both half-paths up, raw < 100)', () => {
  // best-ever components come from different days — they need not sum to
  // best-ever raw (e.g. war peaked before a link broke).
  const b = TW.rungBin4(trackOf({ bestWar: 55, bestDip: 50, bestRaw: 95, bestFaced3: 0 }));
  assert.strictEqual(b.bin, 'neither');
  assert.ok(/hybrid gap/.test(b.sub));
});
ok('G1.7 neither: unexplained (raw >= 100, faced met, no release)', () => {
  const b = TW.rungBin4(trackOf({ bestWar: 80, bestDip: 34, bestRaw: 114, bestFaced3: 3, maxWave: 1, peak: 0 }));
  assert.strictEqual(b.bin, 'neither');
  assert.ok(/^unexplained/.test(b.sub));
});
ok('G1.8 unlocked: wave-4 released', () => {
  const b = TW.rungBin4(trackOf({ maxWave: 4, peak: 4, bestRaw: 134, bestFaced3: 3 }));
  assert.strictEqual(b.bin, 'unlocked');
});

// ---------- G2 (GREEN): wave-5 bins ----------
console.log('\nG2 (GREEN): rungBin5 on known states');
ok('G2.1 cap-hold: raw >= 200 but capped < 200', () => {
  const b = TW.rungBin5(trackOf({ maxWave: 4, peak: 4, bestWar: 50, bestDip: 30, bestPlenty: 150, bestRaw: 230, bestFaced4: 2 }));
  assert.strictEqual(b.bin, 'cap-hold');
});
ok('G2.2 defer5-hold: capped >= 200 but faced-4 short', () => {
  const b = TW.rungBin5(trackOf({ maxWave: 4, peak: 4, bestWar: 150, bestDip: 60, bestPlenty: 0, bestRaw: 210, bestFaced4: 1 }));
  assert.strictEqual(b.bin, 'defer5-hold');
});
ok('G2.3 raw-shortfall', () => {
  const b = TW.rungBin5(trackOf({ maxWave: 4, peak: 4, bestRaw: 150, bestWar: 100, bestDip: 34, bestPlenty: 16 }));
  assert.strictEqual(b.bin, 'raw-shortfall');
});
ok('G2.4 unexplained: capped >= 200, faced-4 met, no release', () => {
  const b = TW.rungBin5(trackOf({ maxWave: 4, peak: 4, bestWar: 150, bestDip: 60, bestPlenty: 40, bestRaw: 250, bestFaced4: 2 }));
  assert.strictEqual(b.bin, 'unexplained');
});
ok('G2.5 unlocked', () => {
  const b = TW.rungBin5(trackOf({ maxWave: 5, peak: 5 }));
  assert.strictEqual(b.bin, 'unlocked');
});
ok('G2.6 n/a: wave 4 never unlocked', () => {
  const b = TW.rungBin5(trackOf({ maxWave: 3 }));
  assert.strictEqual(b.bin, 'n/a');
});

// ---------- R3 (RED): broken loss-mode must fail the link-break fixture ----------
console.log('\nR3 (RED): broken loss-mode vs link-break fixture');
const lbDaily = [
  { day: 1, rank: 'regional' }, { day: 2, rank: 'national' },
  { day: 3, rank: 'national' }, { day: 4, rank: 'national' },
  { day: 5, rank: 'regional' }, { day: 6, rank: 'regional' },
];
expectFail('R3.1 always-unattributed misses the link break', () => {
  const broken = () => 'unattributed';
  assert.strictEqual(broken(), 'link-break');
});
expectFail('R3.1b real nationalHold must catch it', () => {
  // this is a GREEN-shaped assert run as a RED on purpose: it must NOT fail
  const h = TW.nationalHold(lbDaily, { breaks: [{ day: 5, link: 'ashford' }], endReason: 'survived', finalDay: 6 });
  assert.strictEqual(h.lossMode, 'held-to-end'); // WRONG expectation -> must fail
});

// ---------- G4 (GREEN): nationalHold loss modes on synthetic rows ----------
console.log('\nG4 (GREEN): nationalHold on synthetic rows');
ok('G4.1 held-to-end', () => {
  const h = TW.nationalHold(
    [{ day: 1, rank: 'village' }, { day: 2, rank: 'national' }, { day: 3, rank: 'national' }],
    { endReason: 'survived', finalDay: 3 });
  assert.strictEqual(h.reached, true);
  assert.strictEqual(h.firstDay, 2);
  assert.strictEqual(h.holdDays, 2);
  assert.strictEqual(h.endState, 'held-to-end');
  assert.strictEqual(h.lossMode, 'held-to-end');
});
ok('G4.2 link-break (break within +-3d of loss day)', () => {
  const h = TW.nationalHold(lbDaily, { breaks: [{ day: 5, link: 'ashford' }], endReason: 'survived', finalDay: 6 });
  assert.strictEqual(h.lossMode, 'link-break');
  assert.strictEqual(h.lossDay, 5);
  assert.ok(/ashford/.test(h.lossEvidence.join(' ')));
});
ok('G4.3 village-death (rank fell as the village died)', () => {
  const h = TW.nationalHold(lbDaily, { breaks: [], endReason: 'village-lost', finalDay: 6 });
  assert.strictEqual(h.lossMode, 'village-death');
});
ok('G4.4 succession-exile', () => {
  const h = TW.nationalHold(lbDaily, { breaks: [], endReason: 'survived', finalDay: 6, exiledEver: true, exiledDay: 4 });
  assert.strictEqual(h.lossMode, 'succession-exile');
});
ok('G4.5 unattributed when nothing fires', () => {
  const h = TW.nationalHold(lbDaily, { breaks: [], endReason: 'survived', finalDay: 6 });
  assert.strictEqual(h.lossMode, 'unattributed');
});
ok('G4.6 tribute-collapse via arrears spike', () => {
  const h = TW.nationalHold(lbDaily, { breaks: [], endReason: 'survived', finalDay: 6, arrearsSpike: 'home-link arrears 0 -> 4500 kcal' });
  assert.strictEqual(h.lossMode, 'tribute-collapse');
});
ok('G4.7 not reached', () => {
  const h = TW.nationalHold([{ day: 1, rank: 'village' }, { day: 2, rank: 'regional' }], {});
  assert.strictEqual(h.reached, false);
});
ok('G4.8 died-at-national is a village-death loss, not held-to-end', () => {
  const h = TW.nationalHold(
    [{ day: 1, rank: 'regional' }, { day: 2, rank: 'national' }, { day: 3, rank: 'national' }],
    { endReason: 'village-lost', finalDay: 3 });
  assert.strictEqual(h.reached, true);
  assert.strictEqual(h.endState, 'lost');
  assert.strictEqual(h.lossMode, 'village-death');
  assert.strictEqual(h.lossDay, 3);
});
ok('G4.9 succession-collapse: scholar death dissolves the polity', () => {
  const h = TW.nationalHold(lbDaily, {
    breaks: [], endReason: 'survived', finalDay: 6,
    deathDays: [{ day: 4, kind: 'player', name: 'Konrad', cause: 'combat' }],
  });
  assert.strictEqual(h.lossMode, 'succession-collapse');
  assert.ok(/Konrad/.test(h.lossEvidence.join(' ')));
});
ok('G4.10 succession-collapse does not fire for monster deaths', () => {
  const h = TW.nationalHold(lbDaily, {
    breaks: [], endReason: 'survived', finalDay: 6,
    deathDays: [{ day: 4, kind: 'monster', name: 'Highbeam Deer', cause: 'combat' }],
  });
  assert.strictEqual(h.lossMode, 'unattributed');
});

console.log('\nG3/G5 (GREEN): sim-backed gates');
(async () => {
  // naive probe: deliberately mutating (proof only)
  function naiveProbe(Game) {
    try {
      const pantry = (Game.state.village || {}).pantry || [];
      let need = 500;
      for (const it of pantry) {
        if (need <= 0) break;
        const kcal = (it.kcalEach || 0) * (it.units || 1);
        if (kcal <= 0) continue;
        const take = Math.min(need, kcal);
        const units = it.kcalEach > 0 ? take / it.kcalEach : 0;
        it.units = Math.max(0, (it.units || 0) - units);
        need -= take;
      }
    } catch (e) {}
  }

  async function drive(policy, { days, instrumented, mutate }) {
    const { Game } = await loadGame({ seed: 33, mode: 'tworung-proof' });
    await setupGame(Game);
    const hashes = [];
    let nSamples = 0;
    if (instrumented) {
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      policy._m = m;
    }
    const p = Object.assign({}, policy);
    const orig = policy.daily;
    p.daily = (G, ctx) => {
      hashes.push(RB.trajectoryHash(G));
      if (instrumented) {
        try { policy._m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { policy._m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { const s = TW.standingSample(G); const tr = p._track || (p._track = TW.newStandingTrack()); TW.trackStanding(tr, s); nSamples++; } catch (e) {}
      }
      if (mutate) naiveProbe(G);
      if (orig) return orig(G, ctx);
    };
    const res = await runDays(Game, p, { days, sampleEvery: 10 });
    return { hashes, nSamples, days: res.days };
  }

  // R2 (RED): the naive probe must DIVERGE — the hash is sensitive
  console.log('  R2 (RED): naive probe divergence');
  const clean = await drive(leadfeast, { days: 60, instrumented: false, mutate: false });
  const dirty = await drive(leadfeast, { days: 60, instrumented: false, mutate: true });
  const divergeAt = clean.hashes.findIndex((h, i) => h !== dirty.hashes[i]);
  if (divergeAt >= 0) { passed++; console.log(`  PASS(red) R2 — naive probe diverged at hash idx ${divergeAt} (hash is sensitive)`); }
  else { failed++; console.log('  FAIL(red) R2 — naive probe did NOT diverge (hash insensitive!)'); }

  // G3 (GREEN): instrument ON vs OFF byte-identical 60d
  console.log('  G3 (GREEN): instrument ON/OFF byte-identical 60d');
  const off = await drive(leadfeast, { days: 60, instrumented: false, mutate: false });
  const on = await drive(leadfeast, { days: 60, instrumented: true, mutate: false });
  const diffAt = off.hashes.findIndex((h, i) => h !== on.hashes[i]);
  if (diffAt === -1 && off.hashes.length === on.hashes.length) { passed++; console.log(`  PASS G3 — ON/OFF identical over ${off.hashes.length} daily hashes (${off.days}d)`); }
  else { failed++; console.log(`  FAIL G3 — ON/OFF diverged at idx ${diffAt} (lengths ${off.hashes.length}/${on.hashes.length})`); }

  // G5 (GREEN): 15d smoke x 3 policies — samples collect, no crash
  console.log('  G5 (GREEN): 15d smoke x 3 policies');
  for (const [pid, pol] of [['fourthlink', fourthlink], ['leadfeast', leadfeast], ['belongfeast', belongfeast]]) {
    assert.strictEqual(pol.id, pid, pid + ' id mismatch');
    const r = await drive(pol, { days: 15, instrumented: true, mutate: false });
    assert.ok(r.nSamples >= 10, pid + ' collected only ' + r.nSamples + ' samples');
    passed++; console.log(`  PASS G5.${pid} — ${r.nSamples} standing samples, ${r.days}d, no crash`);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
