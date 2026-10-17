#!/usr/bin/env node
// sweep-pyrrhic-20261017.js — the sim-pyrrhic re-sweep (flesh-out loop,
// axis scale-onramp, run fleshout-20261017T1223Z).
//
// PRE-REGISTERED in the arm header (see evidence/2026-10-17/sim-pyrrhic.md):
// re-run the attrcensus re-sweep substrate EXACTLY (fresh seeds 1809-1812 x
// {leadfeast, belongfeast}, tribfloor policies, FEASTSCALE_R13=1,
// TRIBFLOOR=1, SEATDRIVE=0 explicit, 180d death-aware) WITH the pyrrhic-kill
// attribution fix in game.js, and prove:
//   PRIMARY: the 3 known pyrrhic cases now carry waveKillLog + trick +
//            codex 'slain' + villageSlain, and 0 unattributed pyrrhic kills
//            across the fresh re-sweep.
//   GUARDRAIL (det-gate): trajectories byte-identical to the pristine
//            control (evidence/2026-10-17/perseed-attrcensus/) except for
//            the +3 attribution entries — same fights, same outcomes, same
//            days/endReason, same wall metrics. Any divergence is reported
//            as a behavior change with its mechanism, never hidden.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 \
//     SEEDS=1809,1810,1811,1812 POLICIES=leadfeast,belongfeast DAYS=180 \
//     node scripts/sweep-pyrrhic-20261017.js
//
// Per-seed JSONs: evidence/2026-10-17/perseed-pyrrhic/<policy>-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));
const TFUN = require('./trickfunnel-instrument-20261016.js');
const { attachAttrcensusCapture } = require('./attrcensus-instrument-20261017.js');
const { classifyExtended } = require('./attrcensus-classify-20261017.js');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1809]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-pyrrhic');
const CONTROLDIR = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-attrcensus');

// The 3 known pyrrhic cases from the attrcensus re-sweep (pristine code).
const KNOWN = [
  { policy: 'belongfeast', seed: 1811, seq: 42, day: 147, mid: 'belltoad', kind: 'shout' },
  { policy: 'belongfeast', seed: 1812, seq: 3, day: 21, mid: 'gallowdeer', kind: 'move_windup' },
  { policy: 'leadfeast', seed: 1812, seq: 23, day: 90, mid: 'gallowdeer', kind: 'move_windup' },
];

function isPyrrhic(t, mid) {
  const perfs = (t.perfs[mid] || []).length;
  const mort = (t.mortality || {})[mid] || { dead: 0, alive: 0 };
  return t.result === 'lost' && t.pAlive === false && perfs > 0 && mort.dead > 0;
}

async function oneRun(seed, policyId) {
  const policy = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'pyrrhic-sweep', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachAttrcensusCapture(Game, TFUN);
  if (!cap.tbfightIntercepted) { console.error('SWEEP STOP: tbfight interception failed.'); process.exit(2); }

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();

  const st = Game.state || {};
  const wkl = st.waveKillLog || [];

  const fights = [];
  const pyrrhicFixed = [];
  const classCounts = {};
  let nPerf = 0, nAttr = 0, nUnattr = 0, nReverse = 0, nPyrrhicUnattr = 0;
  for (const t of cap.tbFights) {
    for (const mid of (t.mids || [])) {
      const perfs = (t.perfs[mid] || []).length;
      const wklSame = wkl
        .filter(k => k.mid === mid && Math.abs((k.d | 0) - (t.day | 0)) <= 1)
        .map(k => ({ d: k.d | 0, trick: k.trick || null, by: k.by || null, via: k.via || null }));
      const killAttributed = wklSame.some(e => e.trick) ? 1 : 0;
      const mort = (t.mortality || {})[mid] || { dead: 0, alive: 0 };
      const row = {
        seq: t.seq, day: t.day, result: t.result, mid: mid, kind: t.kindByMid[mid] || null,
        nPerfs: perfs, pAlive: t.pAlive === true ? 1 : (t.pAlive === false ? 0 : null),
        midDead: mort.dead, midAlive: mort.alive,
        killAttributed: killAttributed, wklSame: wklSame,
      };
      if (perfs > 0) {
        nPerf++;
        if (killAttributed) {
          nAttr++;
          if (isPyrrhic(t, mid)) {
            pyrrhicFixed.push(Object.assign({ cls: 'a2-fixed' }, row));
          }
          continue;
        }
        nUnattr++;
        if (isPyrrhic(t, mid)) nPyrrhicUnattr++;
        const c = classifyExtended({
          mid: mid, kind: row.kind, day: t.day, result: t.result,
          pAlive: t.pAlive, nPerfs: perfs,
          midDead: mort.dead, midAlive: mort.alive,
          wklSame: wklSame, killAttributed: false,
        });
        classCounts[c.cls] = (classCounts[c.cls] || 0) + 1;
        fights.push(Object.assign({ cls: c.cls, sub: c.sub, note: c.note }, row));
      } else if (killAttributed) {
        nReverse++;
        fights.push(Object.assign({ cls: 'c1', sub: 'reverse-artifact',
          note: 'kill attributed with zero perfs — ±1d join over-attribution' }, row));
      }
    }
  }

  // Codex + villageSlain state for the known mids.
  const codexMon = ((st.codex || {}).monsters) || {};
  const codexStages = {};
  const slainCounts = {};
  for (const mid of ['belltoad', 'gallowdeer']) {
    codexStages[mid] = (codexMon[mid] || {}).stage || null;
    slainCounts[mid] = ((st.villageSlain || {})[mid] | 0);
  }

  // Wall metrics (telemetry-check schema).
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const won = !!Game.won ? 1 : 0;

  // Det-gate vs the pristine control (attrcensus re-sweep).
  let detGate = { compared: false };
  try {
    const ctl = JSON.parse(fs.readFileSync(path.join(CONTROLDIR, `${policyId}-s${seed}.json`), 'utf8'));
    const gateFails = [];
    if (ctl.days !== result.days) gateFails.push(`days ${ctl.days} -> ${result.days}`);
    if (ctl.endReason !== result.endReason) gateFails.push(`endReason ${ctl.endReason} -> ${result.endReason}`);
    if (ctl.nTbFights !== cap.tbFights.length) gateFails.push(`nTbFights ${ctl.nTbFights} -> ${cap.tbFights.length}`);
    if (ctl.national !== national) gateFails.push(`national ${ctl.national} -> ${national}`);
    if (ctl.table !== table) gateFails.push(`table ${ctl.table} -> ${table}`);
    if (ctl.won !== won) gateFails.push(`won ${ctl.won} -> ${won}`);
    if (ctl.nPerf !== nPerf) gateFails.push(`nPerf ${ctl.nPerf} -> ${nPerf}`);
    // Every control unattr row that is NOT a known-pyrrhic a2 must match
    // row-for-row (seq/day/result/mid/nPerfs/mortality/pAlive).
    const mine = {};
    for (const r of fights) mine[`${r.seq}/${r.mid}`] = r;
    for (const cr of (ctl.fights || [])) {
      const isKnownA2 = KNOWN.some(k => k.policy === policyId && k.seed === seed && k.seq === cr.seq && k.mid === cr.mid);
      if (isKnownA2) continue; // these are SUPPOSED to move to attributed
      const mr = mine[`${cr.seq}/${cr.mid}`];
      if (!mr) { gateFails.push(`control unattr row seq${cr.seq}/${cr.mid} missing in pyrrhic run`); continue; }
      for (const k of ['day', 'result', 'nPerfs', 'midDead', 'midAlive', 'pAlive']) {
        if (mr[k] !== cr[k]) gateFails.push(`row seq${cr.seq}/${cr.mid}.${k}: ${cr[k]} -> ${mr[k]}`);
      }
    }
    // No NEW unattr rows beyond the control's (minus the 3 a2).
    const ctlKeys = new Set((ctl.fights || []).filter(cr => !KNOWN.some(k => k.policy === policyId && k.seed === seed && k.seq === cr.seq && k.mid === cr.mid)).map(cr => `${cr.seq}/${cr.mid}`));
    for (const r of fights) {
      if (!ctlKeys.has(`${r.seq}/${r.mid}`)) gateFails.push(`new unattr row seq${r.seq}/${r.mid} not in control`);
    }
    detGate = { compared: true, pass: gateFails.length === 0, fails: gateFails };
  } catch (e) { detGate = { compared: false, error: String(e && e.message || e) }; }

  const out = {
    seed: seed, policyId: policyId, arm: 'pyrrhic',
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1, SEATDRIVE=0 explicit; NODEWITNESS unset) + pyrrhic-kill attribution fix',
    gameCommit: (function () { try { return require('child_process').execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) { return 'unknown'; } })(),
    days: result.days, endReason: result.endReason,
    national: national, table: table, won: won, wins: won, exiled: 0,
    nTbFights: cap.tbFights.length,
    nPerf: nPerf, nAttr: nAttr, nUnattr: nUnattr, nReverse: nReverse,
    nPyrrhicUnattr: nPyrrhicUnattr,
    classCounts: classCounts,
    pyrrhicFixed: pyrrhicFixed,
    codexStages: codexStages, villageSlain: slainCounts,
    detGate: detGate,
    fights: fights,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ policy: policyId, seed: seed, days: result.days, end: result.endReason,
    tbFights: cap.tbFights.length, perf: nPerf, attr: nAttr, unattr: nUnattr,
    pyrrhicFixed: pyrrhicFixed.length, pyrrhicUnattr: nPyrrhicUnattr,
    national: national, table: table, won: won,
    detGate: detGate.compared ? (detGate.pass ? 'PASS' : 'FAIL:' + detGate.fails.join(';')) : 'no-control' }));
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log('\nSWEEP DONE (pyrrhic) — per-seed JSONs in evidence/2026-10-17/perseed-pyrrhic/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun: oneRun, KNOWN: KNOWN };
