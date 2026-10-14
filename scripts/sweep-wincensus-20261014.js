'use strict';
// scripts/sweep-wincensus-20261014.js — WIN-FLAG CENSUS driver (sim-wincensus arm, DIAGNOSTIC, no game-code changes).
//
// PRE-REGISTERED DIAGNOSTIC GO (written before any sims — evidence/2026-10-14/sim-wincensus.md header):
//   PRIMARY: >=2 table-reaching runs instrumented end to end; EVERY win-flag gate attributed
//     (which gates clear, which never do, with counts); a complete taxonomy of where table-reaching
//     villages die/fail (death causes, gate shortfalls, timing).
//   SEEDS: leadfeast (FEASTSCALE_R13=1) seeds 11/22/33/44/55/66/77/88 (the r31 set) — screen first;
//     full census (origin + walked arms, 2 in-process invocations each) on every table-reaching seed.
//   ARMS: origin (policy as the suite ran it — reproduction) | walked (same + tableWalk driver).
//   HORIZON: 180d death-aware (matches the origin suites). Death-aware: dead villages stop simulating.
//   DETERMINISM: A/A in-process, dayHash identical required; a diverged seed is EXCLUDED (documented).
//   GO: taxonomy complete on >=2 table-reaching seeds. If <2 materialize, expand the screen (documented),
//     never lower the bar.
//
// NOTE (2026-10-14): the r30b overstock table seeds (overlead/overbelong, 5 seeds) are NOT reproducible
// on this base — scripts/policies/overstock.js exists only on branch sim-overstock2 (unlanded). Workers
// never touch unlanded branches, so those seeds degrade to INFO-SKIP here. The r31 leadfeast seeds
// (s22, s55) satisfy the >=2 GO on master alone.
//
// Usage:
//   SMOKE=1 node scripts/sweep-wincensus-20261014.js        # 1 seed x 40d x both arms, honesty checks
//   node scripts/sweep-wincensus-20261014.js                # screen 8 seeds + full census on table-reachers
//   SEEDS="22,55" node scripts/sweep-wincensus-20261014.js  # census only on named seeds (skip screen)
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const wc = require('./wincensus-20261014');

// NAMED export unwrap (the r20b lesson): destructure leadfeast — never Object.assign({}, require(...)).
const { leadfeast } = require('./policies/feastscale');
if (!leadfeast || typeof leadfeast.daily !== 'function') {
  console.error('FATAL: leadfeast policy failed named-export unwrap (policy.daily not a function). Aborting.');
  process.exit(1);
}

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-14');
const PERSEED = path.join(EVID, 'wincensus-per-seed');
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SEED_ENV = (process.env.SEEDS || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const SMOKE = process.env.SMOKE === '1';

async function runCombo(seed, arm, inv, days) {
  const { Game } = await loadGame({ seed, mode: `wincensus-${arm}-i${inv}` });
  await setupGame(Game);
  const t = wc.installWinCensus(Game);
  const policy = arm === 'walked' ? wc.wrapWithTableWalk(leadfeast) : leadfeast;
  const hashes = [];
  const wrapped = Object.create(policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    wc.censusRow(Game, t);
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await runDays(Game, wrapped, { days, sampleEvery: 1 });
  const census = wc.finalizeWinCensus(Game, t, { seed, combo: 'leadfeast', arm, inv, days: r.days, endReason: r.endReason });
  return { seed, arm, inv, days: r.days, endReason: r.endReason, hashes, census,
    tableWalked: 0, deliberate: (r.pacing && r.pacing.totalDeliberate) || 0 };
}

function chainStr(c) { return (c.gates.chain || []).join(' '); }

async function main() {
  fs.mkdirSync(PERSEED, { recursive: true });
  const screenSeeds = SEED_ENV.length ? SEED_ENV : [11, 22, 33, 44, 55, 66, 77, 88];

  if (SMOKE) {
    // Honesty gate: the policy unwrap worked, the instrument hooks without throwing,
    // and both arms produce attributed gate chains on a known table-reaching seed.
    console.log('[wincensus] SMOKE: seed 22, 40d, both arms');
    for (const arm of ['origin', 'walked']) {
      const r = await runCombo(22, arm, 1, 40);
      const ok = r.census.rows !== undefined && r.census.gates && r.census.hookErrs === 0;
      console.log(`  [${arm}] days=${r.days} end=${r.endReason} rows=${r.census.stall ? 'ok' : '?'} hookErrs=${r.census.hookErrs} deliberate=${r.deliberate}`);
      console.log(`  [${arm}] chain: ${chainStr(r.census)}`);
      if (r.days < 20 && r.endReason === 'village-lost') console.log(`  [${arm}] NOTE: early death — honest, not a failure of the instrument`);
    }
    console.log('[wincensus] SMOKE done');
    return;
  }

  // ---- SCREEN: 1 invocation, origin arm, find table-reaching seeds ----
  const screen = [];
  let tableSeeds = [];
  if (!SEED_ENV.length) {
    console.log('[wincensus] SCREEN: leadfeast x 8 seeds, origin arm, 180d death-aware');
    for (const seed of screenSeeds) {
      const r = await runCombo(seed, 'origin', 1, DAYS);
      const c = r.census;
      const reached = c.gates.waitingDay != null;
      screen.push({ seed, days: r.days, end: r.endReason, table: reached, chain: chainStr(c) });
      console.log(`  [screen s${seed}] days=${r.days} end=${r.endReason} table=${reached ? 'YES' : 'no'} chain=${chainStr(c)}`);
      if (reached) tableSeeds.push(seed);
      fs.writeFileSync(path.join(PERSEED, `screen-leadfeast-s${seed}.json`), JSON.stringify(c, null, 1));
    }
    console.log(`[wincensus] SCREEN table-reaching seeds: ${tableSeeds.join(',') || 'NONE'}`);
  } else {
    tableSeeds = screenSeeds;
    console.log(`[wincensus] census-only on SEEDS=${tableSeeds.join(',')}`);
  }

  // ---- CENSUS: origin + walked arms x 2 invocations on table-reaching seeds ----
  const results = [];
  for (const seed of tableSeeds) {
    for (const arm of ['origin', 'walked']) {
      const invs = [];
      for (const inv of [1, 2]) {
        const r = await runCombo(seed, arm, inv, DAYS);
        invs.push(r);
        fs.writeFileSync(path.join(PERSEED, `census-leadfeast-s${seed}-${arm}-i${inv}.json`), JSON.stringify(r.census, null, 1));
        console.log(`  [census s${seed} ${arm} i${inv}] days=${r.days} end=${r.endReason} chain=${chainStr(r.census)}`);
      }
      // A/A determinism: identical day-hashes AND identical gate chains required.
      const h1 = invs[0].hashes.join('|'), h2 = invs[1].hashes.join('|');
      const c1 = chainStr(invs[0].census), c2 = chainStr(invs[1].census);
      const identical = h1 === h2 && c1 === c2;
      if (!identical) {
        console.log(`  [census s${seed} ${arm}] DIVERGED A/A — EXCLUDED from taxonomy (documented). hashes=${h1 === h2}, chains=${c1 === c2}`);
      }
      results.push({ seed, arm, identical, days: [invs[0].days, invs[1].days],
        end: [invs[0].endReason, invs[1].endReason], chain: c1, census: identical ? invs[0].census : null });
    }
  }

  const summary = {
    when: new Date().toISOString(), combo: 'leadfeast', flags: { FEASTSCALE_R13: process.env.FEASTSCALE_R13 },
    days: DAYS, screen, tableSeeds, results: results.map(r => Object.assign({}, r, { census: undefined })),
    infoSkip: ['overstock: overlead/overbelong table seeds (5) not reproducible on this base — policy exists only on unlanded branch sim-overstock2'],
  };
  fs.writeFileSync(path.join(EVID, 'wincensus-summary-20261014.json'), JSON.stringify(summary, null, 1));
  console.log('[wincensus] done. summary -> evidence/2026-10-14/wincensus-summary-20261014.json');
  const kept = results.filter(r => r.identical && r.census);
  console.log(`[wincensus] GO check: ${kept.length} identical-instrumented runs on ${new Set(kept.map(r => r.seed)).size} table-reaching seeds (need >=2 runs on >=2 seeds)`);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
