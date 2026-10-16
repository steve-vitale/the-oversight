#!/usr/bin/env node
'use strict';
// sweep-crisistier-20261016.js — paired before/after sweep for the
// sim-crisistier arm (finding #420: raid crisis tier always wave 1).
//
// The fix is a pure bug fix, always-on (no env gate): havenRaidTick now
// reads raiders' waves from the data defs (Game.crisisWaveOf) instead of
// the never-present m.wave. The sweep measures the GUARDRAILS on identical
// seeds, because the binding PRIMARY is the proof (tier attribution 100%
// correct on wave-4/5 probe raids, scripts/test-crisistier-20261016.js):
// national >= control-2, median survival >= control-10d, no new death mode.
//
// Runs one side per invocation; the side is chosen by ARMED=1 (fixed tree)
// vs ARMED unset/0 (pre-fix baseline tree). Each side FAILS LOUDLY when run
// in the wrong tree (armed side asserts the fix exists; control side asserts
// it is absent), so a mix-up can never silently compare a tree to itself.
//
// Substrate (pre-registration): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit, pre-seat
// courtship. Policies: leadfeast / belongfeast (TF = tribfloor). Horizon
// 180d death-aware. 8 fresh seeds [941..948] x 2 policies x {control,armed}
// = 32 runs. Per-seed JSONs carry the numeric wall-metric keys
// (national/table/wins/exiled).
//
// Run (armed side, in the fixed tree):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     ARMED=1 node scripts/sweep-crisistier-20261016.js
// Run (control side, in the pristine baseline tree):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     node scripts/sweep-crisistier-20261016.js
//   SEEDS=941,942 node scripts/sweep-crisistier-20261016.js   (subset)
//   RESUME=1 ... (skip pairs already complete)
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [941, 942, 943, 944, 945, 946, 947, 948]).filter(Number.isFinite);
const ARMED = process.env.ARMED === '1';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-crisistier');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'crisistier-beats');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SUBSTRATE: ${k} must be 1`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SUBSTRATE: SEATDRIVE must be 0 explicit (pre-seat)'); process.exit(2); }

function policyFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Read-only raid/crisis beat recorder: captures the beats the sense-read
// needs (RAID announcements, 🚨 crisis chain) without altering output.
function withRaidBeats(Game) {
  const rec = { beats: [] };
  const orig = Game.say;
  Game.say = function (s) {
    try {
      const t = String(s || '');
      if (/RAID|🚨|aid crisis|call for help|signal fire|runner/i.test(t)) {
        const day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0;
        if (rec.beats.length < 300) rec.beats.push({ day, text: t.slice(0, 260) });
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  return rec;
}

async function oneRun(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: 'crisistier', fullTelemetry: false });
  // WRONG-TREE GUARD: the armed side must see the fix; the control side must not.
  const hasFix = typeof Game.crisisWaveOf === 'function';
  if (ARMED && !hasFix) { console.error(`WRONG TREE: ARMED=1 but Game.crisisWaveOf is absent (seed ${seed} ${policyId})`); process.exit(3); }
  if (!ARMED && hasFix) { console.error(`WRONG TREE: control side but Game.crisisWaveOf is present (seed ${seed} ${policyId})`); process.exit(3); }
  await setupGame(Game, null, 'courtship');
  const rb = withRaidBeats(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policyFor(policyId), { days: DAYS, manifest: { seed } }); });
  const samples = result.samples || {};
  const scaleRows = samples.scale || [];
  const national = scaleRows.some(r => r[1] === 'national' || r[1] === 'global') ? 1 : 0;
  let table = 0;
  try { const pg = Game.progState ? Game.progState() : {}; table = (pg.tableWaiting || pg.tableDone) ? 1 : 0; } catch (e) {}
  const deaths = samples.deaths || [];
  const causeCounts = {};
  for (const d of deaths) { const c = String((d && d.cause) || 'unknown'); causeCounts[c] = (causeCounts[c] || 0) + 1; }
  const out = {
    seed, policyId, armed: ARMED, mode: 'crisistier',
    days: result.days, gameDays: result.gameDays, finalEngineDay: result.gameDays,
    endReason: result.endReason,
    won: !!Game.won ? 1 : 0,
    national, table,
    wins: !!Game.won ? 1 : 0,
    exiled: !!(((Game.state || {}).scholar || {}).exiled) ? 1 : 0,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    nDeaths: deaths.length,
    causeCounts,
    raidBeats: rb.beats.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`), JSON.stringify(out, null, 1));
  if (rb.beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`), JSON.stringify(rb.beats, null, 1));
  }
  console.log(`  [${policyId} s${seed} ${ARMED ? 'ARMED' : 'control'}] gameDays=${out.gameDays} end=${out.endReason} ` +
    `nat=${national} table=${table} won=${out.won} exiled=${out.exiled} deaths=${deaths.length} raidBeats=${rb.beats.length}`);
}

(async () => {
  if (require.main !== module) return;
  const RESUME = process.env.RESUME === '1';
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      if (RESUME) {
        const mine = path.join(EVID, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`);
        if (fs.existsSync(mine)) { console.log(`  [${policyId} s${seed}] resume-skip (already present)`); continue; }
      }
      await oneRun(seed, policyId);
    }
  }
  console.log('sweep complete');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
