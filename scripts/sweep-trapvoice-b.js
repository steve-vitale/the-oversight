#!/usr/bin/env node
// scripts/sweep-trapvoice-b.js — trapvoice pilot sweep (voice-only lever).
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9-12, 14-15): pilot
// 8 fresh seeds (41101-41108) x {leadfeast, belongfeast} x {control, armed},
// 180d death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0 pre-seat substrate.
// ARM=control (pre-fix tree) vs ARM=armed (post-fix tree). The treatment is
// narration-only: zero new say() calls, zero RNG draws.
//
// Per-run telemetry: trap catch/quiet narration line counts (via wrapped
// Game.say — observation only, no state writes, no extra RNG), trap catches
// + kcal via foodCarcass wrap, scholar snare_wire rank (start/end),
// survival + death causes + starvation guardrail + scale-wall numbers
// (national/table/wins, wave unlocks).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=control node scripts/sweep-trapvoice-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=armed   node scripts/sweep-trapvoice-b.js
// Writes per-seed JSON + transcripts to evidence/2026-10-19/perseed-trapvoice-b/.
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 required (pre-seat substrate).'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }

const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(Number) : [41101, 41102, 41103, 41104, 41105, 41106, 41107, 41108];
const POLICIES = process.env.POLICIES ? process.env.POLICIES.split(',') : ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-trapvoice-b');

function snareRank(Game) {
  try { return (((Game.state.codex || {}).skills || {}).snare_wire || {}).level || 0; }
  catch (e) { return 0; }
}

// Say-log instrument: counts only, zero state writes, zero RNG draws.
function instrumentSay(Game) {
  const log = [];
  const oSay = Game.say;
  if (typeof oSay === 'function') {
    Game.say = function (msg) { try { log.push(String(msg)); } catch (e) {} return oSay.apply(this, arguments); };
  }
  return log;
}

function instrumentCarcass(Game) {
  const W = { trapKcal: 0, trapCatches: 0 };
  const oCarc = Game.foodCarcass;
  if (typeof oCarc === 'function') Game.foodCarcass = function (animal, kcal, day, how) {
    try { if (how === 'trapped') { W.trapKcal += (kcal || 0); W.trapCatches++; } } catch (e) {}
    return oCarc.apply(this, arguments);
  };
  return W;
}

const dayOf = (Game) => { try { return ((Game.state.scholar || {}).day || 0); } catch (e) { return 0; }; };

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of POLICIES) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: 'trapvoice-' + pid + '-' + ARM });
      await setupGame(Game);
      const rank0 = snareRank(Game);
      const sayLog = instrumentSay(Game);
      const W = instrumentCarcass(Game);
      let result;
      await quietLog(async () => { result = await runDays(Game, base, { days: DAYS, sampleEvery: 10 }); });
      const rank1 = snareRank(Game);
      // Three trap-narration surfaces in checkTraps(): catch (🪤 TRAP:),
      // quiet-empty (quietTold: "nothing it can catch is moving"), and
      // shy-empty (shyTold: "bend around the hollow"). Counted separately.
      const catchTexts = sayLog.filter(l => l.includes('🪤 TRAP:'));
      const quietTexts = sayLog.filter(l => l.includes('sits empty') && !l.includes('bend around the hollow'));
      const shyTexts = sayLog.filter(l => l.includes('bend around the hollow'));
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
          if (/starv/i.test(k)) W.starveDeaths = (W.starveDeaths || 0) + 1;
        }
      } catch (e) {}
      let wave = 1;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      let national = 0, table = 0, won = 0;
      try { const hs = Game.hierarchyState ? (Game.hierarchyState() || []) : []; national = hs.some(l => l && l.kind === 'national' && l.status === 'active') ? 1 : 0; } catch (e) {}
      try { table = Game.tableEntered ? 1 : 0; } catch (e) {}
      try { won = Game.won ? 1 : 0; } catch (e) {}
      const row = {
        arm: ARM, policy: pid, seed,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        snareRankStart: rank0, snareRankEnd: rank1,
        trapCatchLines: catchTexts.length, trapQuietLines: quietTexts.length, trapShyLines: shyTexts.length,
        trapCatches: W.trapCatches, trapKcal: Math.round(W.trapKcal),
        starveDeaths: W.starveDeaths || 0, deaths,
        wave, national, table, won,
        survival30: result.gameDays >= 30 ? 1 : 0,
        survival60: result.gameDays >= 60 ? 1 : 0,
        communityLost: ['village-lost', 'village-dead', 'pop-zero'].includes(result.endReason) ? 1 : 0,
      };
      rows.push(row);
      fs.writeFileSync(path.join(OUTDIR, `${ARM}-${pid}-s${seed}.json`), JSON.stringify(row, null, 2) + '\n');
      fs.writeFileSync(path.join(OUTDIR, `${ARM}-${pid}-s${seed}-traplines.json`),
        JSON.stringify({ catch: catchTexts, quiet: quietTexts, shy: shyTexts }, null, 2) + '\n');
      console.log(`${ARM} ${pid} s${seed}: days=${result.gameDays} end=${result.endReason} rank=${rank0}->${rank1} catchLines=${catchTexts.length} quietLines=${quietTexts.length} shyLines=${shyTexts.length} catches=${W.trapCatches} starve=${W.starveDeaths || 0} won=${won}`);
    }
  }
  fs.writeFileSync(path.join(OUTDIR, `${ARM}-summary.json`), JSON.stringify({ arm: ARM, rows, ms: Date.now() - t0 }, null, 2) + '\n');
  console.log(`done ${ARM}: ${rows.length} runs in ${Math.round((Date.now() - t0) / 1000)}s`);
}

main().catch(e => { console.error('SWEEP FAILED:', e); process.exit(1); });
