#!/usr/bin/env node
// sweep-fightopen4.js — sim-fightopen4 pilot sweep (flesh-out loop ARM, 2026-10-18).
//
// The sim-condbreak named next: confirm the landed FIGHTOPEN openers'
// effect on REAL WAVE-4 TRICK FIGHTS. fightopen round-2 measured PRIMARY GO
// on w1-3-era fights (0.0% conditions-never-met vs 95.2% control on the
// opener-eligible pool) but its SECONDARY (opener outcomes on actual wave-4
// trick fights) was 0/0: the pre-seat courtship substrate produced 0
// wave-4 unlocks. defercensus2b (landed d81d381a) showed the vetrel
// readiness substrate does produce unlocks (gate clears 2-3/16 per
// substrate). This sweep composes that readiness substrate and toggles
// FIGHTOPEN between arms.
//
// COMPOSITION ONLY — zero src/js changes, zero scripts/policies changes.
// Policy: withVetrel(withReposition(tribfloor leadfeast/belongfeast))
// (the defercensus2b readiness composition). Env (both arms, held constant):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   (+ WINPURSUIT=1 WINDEFER=1 set in-process, inert here — the windefer
//   wrapper is not composed, exactly as defercensus2b readiness)
//   SEATDRIVE=0 (pre-seat) VETREL=1 REPOSITION=1 NODEWITNESS=1 (the measured
//   witness-learning channel)
// Arms: armed = FIGHTOPEN=1; control = FIGHTOPEN unset (the layer is
// default-OFF; the sim-fightopen proof's det-gate pins zero trace when off).
//
// Substrate (composition choice, documented for overrule): REPOSITION=1 and
// NODEWITNESS=1 are part of the defercensus2b readiness substrate — the
// substrate the task's premise names as producing unlocks. They are shared
// by both arms; only FIGHTOPEN differs.
//
// Instrument: the execensus instrument reused wholesale
// (scripts/sweep-execensus-20261016.js: attachExecensusCapture +
// classifyLearning + trickTokensFor), same as sim-fightopen.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SEATDRIVE=0 \
//     VETREL=1 REPOSITION=1 NODEWITNESS=1 \
//     node scripts/sweep-fightopen4.js
//   SEEDS="52001,52002" node scripts/sweep-fightopen4.js   # targeted
//   FO4ARMS="armed" ...                                    # one arm only
//   SMOKE=1 ...  # 1 seed x 2 policies x 2 arms, 60d (det-gate + smoke)
//
// Per-seed JSONs: evidence/2026-10-18/perseed-fightopen4/<policy>-s<seed>-fightopen4-<armId>.json
// Schema: the execensus schema + fightopen: 0|1 (numeric wall-metric keys
// national/table/won/wins/exiled kept exact for telemetry-check).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

// The execensus module's top-level STOP gates require the execensus
// substrate env; ARM defaults to 'execensus' there (passes its gate) —
// we only borrow its instrument functions, never its oneRun.
const EX = require(path.join(REPO, 'scripts', 'sweep-execensus-20261016.js'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (readiness substrate).`); process.exit(2); }
}
for (const k of ['SEATDRIVE']) {
  if (process.env[k] !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
}
for (const k of ['VETREL', 'REPOSITION', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (readiness substrate).`); process.exit(2); }
}
// WINPURSUIT/WINDEFER are set in-process in oneRun (inert here — the
// windefer wrapper is not composed), matching defercensus2b readiness.
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!VR.vetrelOn()) { console.error('SWEEP STOP: vetrel layerOn() false despite VETREL=1.'); process.exit(2); }
if (!RP.layerOn()) { console.error('SWEEP STOP: reposition layerOn() false despite REPOSITION=1.'); process.exit(2); }

const ARM = 'fightopen4';
const SMOKE = process.env.SMOKE === '1';
const SEEDS = SMOKE ? [52001] :
  (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [52001, 52002, 52003, 52004, 52005, 52006, 52007, 52008]).filter(Number.isFinite);
const DAYS = SMOKE ? 60 : (parseInt(process.env.DAYS || '180', 10) || 180);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.FO4ARMS ? process.env.FO4ARMS.split(',').map(s => s.trim()) : ['armed', 'control']);
const EVID = process.env.FIGHTOPEN4_EVID || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-fightopen4');

function policyFor(policyId) {
  const tag = policyId === 'leadfeast' ? 'vetrel-lead' : 'vetrel-belong';
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION=1)`);
  return VR.withVetrel(rp, `${tag}-rp-vetrel`, `${policyId} + reposition + VETREL (companion veteran channel)`);
}

async function oneRun(seed, policyId, armId) {
  const fightopen = armId === 'armed' ? 1 : 0;
  if (fightopen) process.env.FIGHTOPEN = '1'; else delete process.env.FIGHTOPEN;
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; // inert here (windefer not composed); matches defercensus2b readiness
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'fightopen4', fullTelemetry: false });
  await setupGame(Game);
  const cap = EX.attachExecensusCapture(Game);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();
  // The flag must not leak into the next run's setup in-process.
  delete process.env.FIGHTOPEN;

  const st = Game.state || {};
  const monsterById = {};
  try { for (const m of (Game.data.monsters || [])) monsterById[m.id] = m; } catch (e) {}

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fieldDeaths = cap.deaths.filter(d => !d.player).length;
  let trickTally = {};
  try { trickTally = Game._trickTally || {}; } catch (e) {}

  const witnessLearnings = [];
  for (const d of cap.discoveries) {
    const mid = d.id;
    const mdef = monsterById[mid];
    if (!mdef) continue;
    const witnessObsBefore = cap.observations.filter(o => o.id === mid && o.via === 'node-witnessed' && o.seq <= d.seq).length;
    const pure = d.via === 'node-witnessed' && witnessObsBefore >= 2;
    const shared = !pure && witnessObsBefore > 0;
    if (!pure && !shared) continue;
    const defs = (Game.villagerTrickDefs ? Game.villagerTrickDefs() : {}) || {};
    const store = mdef.counter ? 'monsterCounters' : 'villagerTricks';
    const trickText = mdef.counter ? (mdef.counter.kind + ' — ' + (mdef.counter.trick || '')) : ((defs[mid] || {}).trick || '');
    witnessLearnings.push({
      learnId: 'L' + d.seq + '-' + mid, seq: d.seq, day: d.day, id: mid,
      trick: mdef.counter ? mdef.counter.kind : mid, trickText: String(trickText).slice(0, 200),
      wave: mdef.wave || 1, store, via: d.via,
      witnessSourced: pure ? 'pure' : 'shared', witnessObsBefore,
      tokens: EX.trickTokensFor(Game, mid),
    });
  }
  const funnel = witnessLearnings.map(l => {
    const c = EX.classifyLearning(Game, cap, l);
    return { learnId: l.learnId, day: l.day, id: l.id, trick: l.trick, wave: l.wave, via: l.via, witnessSourced: l.witnessSourced, verdict: c.verdict, summary: c.summary, execs: c.execs, fights: c.fights, tbFights: c.tbFights };
  });

  const waveKillTricks = (st.waveKillLog || []).filter(k => k.trick).map(k => ({ d: k.d, mid: k.mid, w: k.w, by: k.by, via: k.via, trick: String(k.trick).slice(0, 120) }));
  const bySpecies = {};
  for (const w of cap.observations.filter(o => o.via === 'node-witnessed')) bySpecies[w.id] = (bySpecies[w.id] || 0) + 1;

  const out = {
    seed, policyId, arm: ARM, armId, fightopen,
    substrate: 'readiness (VETREL=1 REPOSITION=1 NODEWITNESS=1 + FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1, SEATDRIVE=0 explicit) + FIGHTOPEN=' + fightopen,
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: cap.deaths.length, fieldDeaths, playerDeaths: cap.deaths.length - fieldDeaths,
    deathCauses: cap.deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    trickTally,
    nNodeWitnessReports: cap.observations.filter(o => o.via === 'node-witnessed').length,
    nodeWitnessBySpecies: bySpecies,
    nNodeWitnessDiscovered: witnessLearnings.filter(l => l.via === 'node-witnessed').length,
    nodeWitnessDiscovered: witnessLearnings.filter(l => l.via === 'node-witnessed').map(l => ({ day: l.day, id: l.id })),
    nFieldFights: cap.fieldFights.length, nTbFights: cap.tbFights.length,
    nWaveKillTricks: waveKillTricks.length,
    witnessLearnings, funnel,
    nLearnings: witnessLearnings.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  const outPath = path.join(EVID, `${policyId}-s${seed}-${ARM}-${armId}.json`);
  const payload = JSON.stringify(out, null, 1);
  // EPERM-hardened write (2026-10-18): this VM intermittently returns EPERM
  // on writeFileSync after ~100s of heavy sim (clears within ~2 min idle).
  // Retry with backoff; fail loudly only after 10 attempts.
  let wrote = false, werr = null;
  for (let attempt = 1; attempt <= 10 && !wrote; attempt++) {
    try {
      const tmpPath = outPath + '.tmp-' + process.pid;
      fs.writeFileSync(tmpPath, payload);
      fs.renameSync(tmpPath, outPath);
      wrote = true;
    } catch (e) {
      werr = e;
      if (attempt < 10) await new Promise(r => setTimeout(r, 30000));
    }
  }
  if (!wrote) { console.error('SWEEP WRITE FAIL after 10 attempts:', werr && werr.message); process.exit(2); }
  const nExec = funnel.reduce((a, f) => a + f.execs, 0);
  console.log(`  [${ARM}-${armId} ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} won=${won} fieldFights=${cap.fieldFights.length} learnings=${witnessLearnings.length} execs=${nExec}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const armId of ARMS) {
    for (const seed of SEEDS) {
      for (const policyId of POLICIES) {
        await oneRun(seed, policyId, armId);
      }
    }
  }
  console.log(`\nSWEEP DONE (${ARM}) — per-seed JSONs in ${EVID}/`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun, policyFor, SEEDS, POLICIES, ARMS, EVID };
