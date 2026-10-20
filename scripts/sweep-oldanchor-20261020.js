#!/usr/bin/env node
// sweep-oldanchor-20261020.js — the old-history lower-bound anchor for the
// wave-4 unlock collapse (sim-w5door-measure, 2026-10-20; answers the
// sim-unlockdrift named nexts #1/#2).
//
// Runs the ROUND-1 substrate (evidence/2026-10-16/sim-fightopen.md) on
// PRE-REBUILD game code: worktree ~/workspace/worktrees/sim-w5door-oldanchor
// detached at 0152a2ce (2026-10-16 07:46 CDT, old history) — the
// faced-experience readiness bar, no waveCombatReadiness. The sweep requires
// the old tree's OWN sim-harness + tribfloor policies (self-consistent old
// code); this script lives in the worker's own worktree and touches neither
// tree's game code.
//
// Substrate: TF.leadfeast / TF.belongfeast (tribfloor) on the round-1 env:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
// (FIGHTOPEN unset — it does not exist in old code; the unlockdrift arm
// established wave-4 reach is FIGHTOPEN-independent.)
//
// PRIMARY (binding): wave-4 reach on seeds 975–982 x {leadfeast,belongfeast}
// (16 runs, 180d death-aware). GO >= 12/16 (round-1: 14/16).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   node scripts/sweep-oldanchor-20261020.js
//   SMOKE=1 ...  # 1 seed x both policies x 30d
'use strict';
const fs = require('fs');
const path = require('path');

const OLDTREE = process.env.W5DOOR_OLDANCHOR_TREE || '/home/hatch/workspace/worktrees/sim-w5door-oldanchor';
const { loadGame, setupGame, runDays, quietLog } = require(path.join(OLDTREE, 'scripts', 'sim-harness.js'));
const TF = require(path.join(OLDTREE, 'scripts', 'policies', 'tribfloor.js'));

// SUBSTRATE GUARD — the round-1 env.
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`ANCHOR STOP: ${k}=1 is required (round-1 env).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('ANCHOR STOP: SEATDRIVE=0 is required.'); process.exit(2); }
if (!TF.layerOn()) { console.error('ANCHOR STOP: old tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
// The old tree must be the faced-experience bar (the anchor's premise).
try {
  const st = fs.readFileSync(path.join(OLDTREE, 'src', 'js', 'standing.js'), 'utf8');
  if (!/faced-experience bar/.test(st)) { console.error('ANCHOR STOP: old standing.js lacks the faced-experience bar — wrong tree.'); process.exit(2); }
  if (/waveCombatReadiness/.test(st)) { console.error('ANCHOR STOP: old standing.js HAS waveCombatReadiness — wrong tree.'); process.exit(2); }
} catch (e) { console.error('ANCHOR STOP: cannot verify old standing.js:', e.message); process.exit(2); }

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-w5door-oldanchor');
const SEEDS = [975, 976, 977, 978, 979, 980, 981, 982];
const POLICIES = ['leadfeast', 'belongfeast'];

async function runOne(seed, policyId, days) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'oldanchor', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, base, { days, manifest: undefined, sampleEvery: 30 }); });
  let maxWave = 1;
  try { maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  maxWave = Math.max(maxWave, result.maxWaveUnlocked || 1);
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  const out = {
    seed, policyId, substrate: 'oldanchor-fightopen-round1',
    tree: '0152a2ce', days: result.days, gameDays, endReason: result.endReason,
    won: !!Game.won, maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
  };
  if (!process.env.OLDANCHOR_NOWRITE) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.SMOKE === '1') {
    for (const p of POLICIES) {
      const r = await runOne(975, p, 30);
      console.log(`SMOKE old/${p}/s975: days=${r.gameDays} end=${r.endReason} maxWave=${r.maxWave}`);
    }
    console.log('OLDANCHOR SMOKE GREEN.');
    return;
  }
  let w4 = 0, w5 = 0, n = 0;
  for (const p of POLICIES) {
    for (const s of SEEDS) {
      const t0 = Date.now();
      const r = await runOne(s, p, 180);
      n++; w4 += r.wave4; w5 += r.wave5;
      console.log(`done old/${p}/s${s}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
  }
  console.log(`OLDANCHOR COMPLETE: n=${n} wave4=${w4}/16 wave5=${w5}/16 → ${w4 >= 12 ? 'GO (>=12/16)' : 'MISS (<12/16)'}`);
  if (w4 < 12) process.exit(1);
}

if (require.main === module) {
  main().catch(e => { console.error('ANCHOR CRASH:', e); process.exit(2); });
}
