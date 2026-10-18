// sim-butcharmor pilot sweep (2026-10-18).
//
// Lever: the butchering->armor last mile — hides banked off the scholar's
// prep counter into the village stores, villagers sew hide_armor for
// themselves (game code in villager-build.js, BUTCHARMOR-gated, default ON),
// plus a forage-time vine lacing set-aside (game.js).
//
// The armed/control delta is ONLY the BUTCHARMOR env var (same tribfloor
// policies both arms — the lever is pure game code, no policy wrap).
// Substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//            WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 (pre-seat), NODEWITNESS=1.
// Seeds: 8 fresh (zero hits in evidence/ at sweep time).
//
// PRIMARY (§14, binding): median over paired qualifying pairs of
//   (armed.deferralArmorMargin - control.deferralArmorMargin) >= +2.0 pieces,
//   where deferralArmorMargin = rd.armored - 4 at the LAST wave-4-unready day.
// Guardrails: national >= control-2, median survival >= control-10d,
//   no new death mode (cause-canonicalized).
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const REPO = '/home/hatch/workspace/worktrees/sim-butcharmor';
const SWEEP_COMMIT = (() => { try {
  return require('child_process').execSync('git rev-parse --short HEAD', { cwd: REPO }).toString().trim();
} catch (e) { return 'unknown'; } })();

const SEEDS = [7001021, 7002047, 7003091, 7004127, 7005183, 7006239, 7007311, 7008377];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const EVID = path.join(REPO, 'evidence', '2026-10-18', 'perseed-butcharmor');

function assertSubstrate() {
  const want = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
    WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1' };
  for (const [k, v] of Object.entries(want)) {
    if (String(process.env[k] || '') !== v)
      throw new Error(`substrate violation: ${k}=${process.env[k]} (need ${v})`);
  }
}

function baseFor(policyId) {
  const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
  if (policyId === 'leadfeast') return TF.leadfeast;
  if (policyId === 'belongfeast') return TF.belongfeast;
  throw new Error('unknown policy ' + policyId);
}

function deathCauseSummary(deaths) {
  const byCause = {};
  for (const d of (deaths || [])) {
    const c = String((d && d.cause) || 'unknown').toLowerCase().replace(/[^a-z]+/g, ' ').trim();
    byCause[c] = (byCause[c] || 0) + 1;
  }
  return { total: (deaths || []).length,
    starv: (deaths || []).filter(d => /starv/.test(String(d && d.cause))).length,
    villagerCombat: (deaths || []).filter(d => /combat|fight|monster|wave/.test(String(d && d.cause))).length,
    byCause };
}

function censusP(G) {
  // mean villager P (armor protection) among the living, for deferral depth
  const rows = [];
  try {
    const eq = (globalThis.Scattering || {}).Equipment || G.Equipment;
    const itemDefs = (G.data && G.data.items) || [];
    const v = G.state.village || {};
    for (const vid of (v.roster || [])) {
      let vp = null;
      try { vp = (typeof G.vpOf === 'function') ? G.vpOf(vid) : null; } catch (e) { vp = null; }
      if (!vp || vp.dead) continue;
      let P = 0;
      try { P = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) | 0) : 0; } catch (e) {}
      rows.push(P);
    }
  } catch (e) {}
  if (!rows.length) return null;
  return rows.reduce((a, b) => a + b, 0) / rows.length;
}

async function runOne(seed, policyId, armed) {
  assertSubstrate();
  if (armed) process.env.BUTCHARMOR = '1'; else process.env.BUTCHARMOR = '0';
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const base = baseFor(policyId);
  const { Game } = await loadGame({ seed, mode: `butcharmor-${armed ? 'armed' : 'control'}`, fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const oDaily = policy.daily;
  let firstW4Day = null, lastUnready = null, deferralDepth = null;
  let baSnap = null;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const day = G.state.scholar.day;
      if (firstW4Day == null && typeof G.unlockedWave === 'function' && G.unlockedWave() >= 4) {
        firstW4Day = day;
      }
      if (firstW4Day == null && typeof G.waveCombatReadiness === 'function') {
        const rd = G.waveCombatReadiness(4);
        if (rd && !rd.ready) {
          lastUnready = { day, armored: rd.armored, armed: rd.armed, tricks: rd.tricks,
            veterans: rd.veterans, short: rd.short };
          deferralDepth = censusP(G);
        }
      }
      // layer-engagement snapshot (armed side; control must stay all-null)
      if (armed) {
        const tel = G.state.telemetry || [];
        baSnap = {
          baBanked: tel.filter(t => t.type === 'hide_banked').length,
          baDiverted: tel.filter(t => t.type === 'vine_set_aside').length,
          baCrafted: tel.filter(t => t.type === 'villager_craft').length,
          baCraftFails: tel.filter(t => t.type === 'villager_craft_fail').length,
        };
      }
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { delete process.env.BUTCHARMOR; } catch (e) {}
  const deaths = (result.samples && result.samples.deaths) || [];
  const ds = deathCauseSummary(deaths);
  let readiness = null, standing = null, national = 0;
  try { readiness = Game.waveCombatReadiness(4); } catch (e) {}
  try { standing = Game.villageStanding(); } catch (e) {}
  try {
    const v = Game.state.village || {};
    const rank = v.scaleRank || v.rank || '';
    national = (rank === 'national' || rank === 'global') ? 1 : 0;
  } catch (e) {}
  const won = (() => { try { return Game.won ? 1 : 0; } catch (e) { return 0; } })();
  return {
    run: 'sim-butcharmor', axis: 'wave4-armor-depth',
    seed, policyId, arm: armed ? 'armed' : 'control', butcharmor: armed ? 1 : 0,
    sweepCommit: SWEEP_COMMIT,
    substrate: { FEASTSCALE_R13: 1, TRIBFLOOR: 1, SUCCGRACE: 1, RAIDDENSITY: 1,
      WINPURSUIT: 1, WINDEFER: 1, SEATDRIVE: 0, NODEWITNESS: 1 },
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won, national,
    maxWaveUnlocked: result.maxWaveUnlocked || 1, firstW4Day,
    standingTotal: standing ? (standing.total | 0) : null,
    readiness4: readiness ? { ready: readiness.ready, armored: readiness.armored,
      armed: readiness.armed, tricks: readiness.tricks, veterans: readiness.veterans,
      short: readiness.short } : null,
    deferralSnapshot: lastUnready, deferralDepth,
    deferralArmorMargin: lastUnready ? (lastUnready.armored - 4) : null,
    butcharmorCounters: baSnap, // armed side only; null on control
    deaths: { total: ds.total, starv: ds.starv, villagerCombat: ds.villagerCombat, byCause: ds.byCause },
  };
}

(async () => {
  assertSubstrate();
  fs.mkdirSync(EVID, { recursive: true });
  console.log(`sweep-time master commit: ${SWEEP_COMMIT}`);
  const rows = [];
  for (const armed of [false, true]) {
    for (const policyId of POLICIES) {
      for (const seed of SEEDS) {
        const t0 = Date.now();
        let row;
        try {
          row = await runOne(seed, policyId, armed);
        } catch (e) {
          console.error(`CRASH ${armed ? 'armed' : 'control'} ${policyId} s${seed}: ${e && e.message}`);
          row = { run: 'sim-butcharmor', seed, policyId, arm: armed ? 'armed' : 'control',
            crashed: true, error: String(e && e.message), sweepCommit: SWEEP_COMMIT };
        }
        rows.push(row);
        const fn = `${row.arm}-${policyId}-s${seed}.json`;
        fs.writeFileSync(path.join(EVID, fn), JSON.stringify(row, null, 1));
        const w4 = row.maxWaveUnlocked >= 4 ? 'W4' : 'w3-';
        const dm = row.deferralArmorMargin;
        const w = row.won ? 'WON' : '---';
        console.log(`  [${((Date.now() - t0) / 1000).toFixed(0)}s] ${row.arm} ${policyId} s${seed}: days=${row.days} end=${row.endReason} ${w4} ${w} deferMargin=${dm} starv=${row.deaths ? row.deaths.starv : '?'}${row.crashed ? ' CRASHED' : ''}`);
      }
    }
  }
  console.log(`done: ${rows.length} runs, ${rows.filter(r => r.crashed).length} crashed`);
})();
