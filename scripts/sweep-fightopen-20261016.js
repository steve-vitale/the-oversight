#!/usr/bin/env node
// sweep-fightopen-20261016.js — the sim-fightopen pilot sweep.
//
// Multi-arm pilot on the execensus instrument: FIGHT-OPENING execution
// (src/js/fieldFights.js, FIGHTOPEN=1) vs identical-seed control (flag
// unset). The instrument is scripts/sweep-execensus-20261016.js
// (attachExecensusCapture + classifyLearning + trickTokensFor) — reused
// wholesale; this file only re-homes the run loop (ARM=fightopen) and
// toggles FIGHTOPEN between arms in-process (the layer reads
// process.env.FIGHTOPEN live on every villagerTrickAction call).
//
// Substrate (pre-seat courtship, the execensus channel):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 ; FIGHTOPEN=1 (treatment) / unset
//   SEEDS=975..982 (FRESH: 0 per-seed filename hits across evidence/)
//   POLICIES=leadfeast,belongfeast DAYS=180 (death-aware) ARM=fightopen
//
// Per-seed JSONs: evidence/2026-10-16/perseed-fightopen/<policy>-s<seed>-fightopen-<arm>.json
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

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (the measured channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const ARM = 'fightopen';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [975, 976, 977, 978, 979, 980, 981, 982]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.FOARMS ? process.env.FOARMS.split(',').map(s => s.trim()) : ['treatment', 'control']);
const EVID = process.env.FIGHTOPEN_EVID || path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fightopen');
const BEATS = process.env.FIGHTOPEN_BEATS || path.join(__dirname, '..', 'evidence', '2026-10-16', 'fightopen-beats');

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId, armId) {
  const fightopen = armId === 'treatment' ? 1 : 0;
  if (fightopen) process.env.FIGHTOPEN = '1'; else delete process.env.FIGHTOPEN;
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'fightopen', fullTelemetry: false });
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
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit, NODEWITNESS=1) + FIGHTOPEN=' + fightopen,
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
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}-${armId}.json`), JSON.stringify(out, null, 1));
  const beats = cap.sayBeats.slice(0, 800);
  if (beats.length || cap.trickFightLogs.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}-${armId}.json`), JSON.stringify({ beats, trickFightLogs: cap.trickFightLogs.slice(0, 40) }, null, 1));
  }
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

module.exports = { oneRun };
