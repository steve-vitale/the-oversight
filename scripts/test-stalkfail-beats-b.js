#!/usr/bin/env node
// scripts/test-stalkfail-beats-b.js — RED→GREEN + DET-GATE proof for the hunt
// stalk-fail beat variant pool (flesh-out loop-B arm sim-stalkfail-beats-b,
// run fleshout-loop-b-20261021T2330Z; finding: HUNT STALK-FAIL BEAT VERBATIM
// x50, sim-huntstaff-decomp-b / sim-findings.md).
//
// Blank: src/js/game.js villagerHuntResolve's stalk-fail branch fired one
// verbatim line ~50x across 60 days of hunt beats while the kill case varied.
//
// Fixture: 60d x N-villager hunt fixture calling Game.villagerHuntResolve
// directly. TWO arms per seed:
//   - fail arm: eff=0 -> chance=0 -> the stalk-fail branch every time
//     (the beat under test)
//   - real arm: eff=1 -> real chances, real kills — exercises the shared
//     animal-pick RNG path so the det-gate covers kills/kcal too.
// (VillagerHuntResolve itself rolls no wounds — the injury roll stays with
// the caller — so the outcome digest is kills/kcal/aid/beats.)
//
// Phases:
//   RED phase: run against UNFIXED game.js. Asserts the blank — every
//     stalk-fail beat byte-identical. Writes digests (outcome-only) to
//     evidence/2026-10-21/stalkfail-beats/digests-red.json.
//   GREEN phase: run against FIXED game.js. Asserts (a) 4 variants cycle
//     across the fixture with no verbatim-dominance, and (b) DET-GATE: the
//     outcome digest is byte-identical to the RED run's digests — identical
//     seeds, identical kills/kcal/aid; only the beat text changed.
//
// The det-gate is strict equality of the JSON digest because the fix adds
// ZERO Math.random draws (leadPick rotation is stream-neutral, keyed on
// 'stalkfail:'+vid). If any draw leaked into the outcome stream, the digests
// would diverge — so identical digests are an honest assertion of RNG
// neutrality, not an assumption of it.
//
// Usage (run each phase in its own process; seeds are ~3-4s each):
//   node scripts/test-stalkfail-beats-b.js red
//   node scripts/test-stalkfail-beats-b.js green   # needs digests-red.json
// Verbatim corpus dump for the sense read:
//   SEED=8903 node scripts/test-stalkfail-beats-b.js corpus
'use strict';
const fs = require('fs');
const path = require('path');

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-21', 'stalkfail-beats');
const DIGEST_PATH = path.join(OUTDIR, 'digests-red.json');

const SEEDS = [8903, 8904, 8905, 8906];
const DAYS = 60;

const { loadGame, setupGame, quietLog } = require('./sim-harness');

async function fixture(seed) {
  const { Game, loadFails } = await loadGame({ seed });
  if (loadFails && loadFails.length) throw new Error('loadFails: ' + loadFails.join(','));
  await setupGame(Game, 'Columbus, Ohio');
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const vids = roster.slice(0, 12);
  if (vids.length < 4) throw new Error('fixture roster too small: ' + vids.length);
  const out = { seed, beats: [], digest: { seed, fail: null, real: null } };
  for (const arm of ['fail', 'real']) {
    const eff = arm === 'fail' ? 0 : 1;
    let kcal = 0, kills = 0, fails = 0, other = 0;
    const aids = [];
    for (let d = 0; d < DAYS; d++) {
      for (const vid of vids) {
        let r = null;
        try { r = Game.villagerHuntResolve(vid, eff); } catch (e) { continue; }
        if (!r || !r.msg) continue;
        kcal += (r.kcal || 0);
        if ((r.kcal || 0) > 0) { kills++; if (r.aid) aids.push(r.aid); }
        else if (/stalks a /.test(r.msg)) { fails++; if (arm === 'fail') out.beats.push(r.msg); }
        else other++;
      }
    }
    aids.sort();
    out.digest[arm] = { kcal, kills, aids: aids.join(','), fails, other };
  }
  return out;
}

function tally(msgs) {
  const m = new Map();
  for (const s of msgs) m.set(s, (m.get(s) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

// The blank is verbatim in the FAILURE TEXT, not the whole string — the
// verbatim beat interpolates ${first} and ${animal.name}. Normalize to the
// failure moment itself so verbatim-dominance is measured honestly.
function normFail(msg) {
  return String(msg)
    .replace(/^🏹\s+\S+\s+stalks a\s+.*?\s+all morning\s*[—–-]\s*/, '')
    .replace(/\s*Nothing to bring home\.?\s*$/, '');
}

async function runRed() {
  const digests = {};
  let totalBeats = 0;
  const distinct = new Set();
  for (const seed of SEEDS) {
    const { digest, beats } = await fixture(seed);
    digests[seed] = digest;
    totalBeats += beats.length;
    for (const b of beats) distinct.add(normFail(b));
  }
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(DIGEST_PATH, JSON.stringify(digests, null, 1));
  console.log('RED fixture: seeds=' + SEEDS.join(',') + ' days=' + DAYS +
    ' stalk-fail beats=' + totalBeats + ' distinct-variants=' + distinct.size);
  // RED assertion: the blank — one verbatim variant across the whole fixture.
  if (totalBeats < 100) { console.log('RED-INCONCLUSIVE: too few fail beats (' + totalBeats + ')'); process.exit(2); }
  if (distinct.size !== 1) { console.log('RED-FAILED: expected 1 verbatim variant, saw ' + distinct.size); process.exit(1); }
  console.log('RED-CONFIRMED: all ' + totalBeats + ' stalk-fail beats byte-identical across ' + SEEDS.length + ' seeds');
}

async function runGreen() {
  if (!fs.existsSync(DIGEST_PATH)) { console.log('GREEN-BLOCKED: missing ' + DIGEST_PATH + ' (run red phase first)'); process.exit(2); }
  const redDigests = JSON.parse(fs.readFileSync(DIGEST_PATH, 'utf8'));
  let detOk = true;
  let totalBeats = 0;
  const counts = new Map();
  const corpus = [];
  for (const seed of SEEDS) {
    const { digest, beats } = await fixture(seed);
    totalBeats += beats.length;
    for (const b of beats) { const k = normFail(b); counts.set(k, (counts.get(k) || 0) + 1); if (corpus.length < 12 && seed === SEEDS[0]) corpus.push(b); }
    const rd = redDigests[seed];
    if (!rd) { console.log('GREEN-BLOCKED: no RED digest for seed ' + seed); process.exit(2); }
    for (const arm of ['fail', 'real']) {
      const a = JSON.stringify(digest[arm]);
      const b = JSON.stringify(rd[arm]);
      if (a !== b) { detOk = false; console.log('DET-DIVERGENCE seed ' + seed + ' arm ' + arm + ':\n  red:  ' + b + '\n  green:' + a); }
    }
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  console.log('GREEN fixture: stalk-fail beats=' + totalBeats + ' distinct-variants=' + ranked.length);
  for (const [s, n] of ranked) console.log('  ' + n + 'x  ' + s.slice(0, 120));
  // DET-GATE (honest strict equality): identical seeds must produce identical
  // gameplay outcomes (kills/kcal/aid) — only beat TEXT may change.
  if (!detOk) { console.log('DET-GATE: FAIL — outcome digests diverged (RNG stream disturbed)'); process.exit(1); }
  console.log('DET-GATE: PASS — per-seed outcome digests byte-identical (kills/kcal/aid/fails/other all equal)');
  // GREEN assertion: 4 variants cycle, no verbatim-dominance.
  if (ranked.length < 4) { console.log('GREEN-FAILED: expected >=4 variants, saw ' + ranked.length); process.exit(1); }
  const topShare = ranked[0][1] / totalBeats;
  console.log('top-variant share=' + topShare.toFixed(3));
  if (topShare > 0.5) { console.log('GREEN-FAILED: verbatim-dominance persists (top share ' + topShare.toFixed(2) + ' > 0.50)'); process.exit(1); }
  console.log('GREEN-CONFIRMED: ' + ranked.length + ' variants cycle, no verbatim-dominance');
  console.log('--- sample corpus (seed ' + SEEDS[0] + ', first 12 beats, villager-hunt order) ---');
  for (const b of corpus) console.log(b);
}

async function runCorpus() {
  const seed = parseInt(process.env.SEED || '8903', 10);
  const { beats } = await fixture(seed);
  console.log('corpus seed=' + seed + ' stalk-fail beats=' + beats.length);
  // interleaved sample across the fixture so the sense read sees beats as
  // they fire (roster-major order), not grouped by variant
  const step = Math.max(1, Math.floor(beats.length / 20));
  for (let i = 0; i < beats.length && i < 20 * step; i += step) console.log(beats[i]);
}

(async () => {
  const phase = process.argv[2] || 'red';
  if (phase === 'red') await runRed();
  else if (phase === 'green') await runGreen();
  else if (phase === 'corpus') await runCorpus();
  else { console.log('usage: node scripts/test-stalkfail-beats-b.js red|green|corpus'); process.exit(2); }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(3); });
