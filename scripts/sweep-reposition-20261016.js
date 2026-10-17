#!/usr/bin/env node
// sweep-reposition-20261016.js — the sim-reposition pilot sweep (finding #430).
//
// QUESTION: does teaching the TB policy to reposition (honest movement
// actions for known movement-kind tricks) move performances — and fight
// outcomes — on the pre-seat substrate?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: tribfloor leadfeast / belongfeast (REPOSITION unset)
//   armed:   tribfloor leadfeast / belongfeast + reposition layer (REPOSITION=1)
// Armed differs from control ONLY by the reposition layer.
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1,
// TRIBFLOOR=1. NODEWITNESS unset.
//
// PRE-REGISTRATION (evidence/2026-10-16/sim-reposition.md header — BINDING):
//   Primary: movement-kind trick PERFORMANCES (blindside + face_it +
//   move_windup via the f.trickLogByMid attribution channel) —
//   armed − control ≥ 4 across the 16-run pilot. GO → confirm; KILL → delete
//   scripts/policies/reposition.js zero-trace.
//   Guardrails: scholar combat deaths ≤ control+2; national ≥ control−2 (per
//   8-seed set); median survival ≥ control−10d; no new death mode.
//   Seeds: 8 FRESH [3401–3408] × {leadfeast, belongfeast} = 16 runs/arm.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 SEEDS=3401,3402,... \
//   POLICIES=leadfeast,belongfeast DAYS=180 ARM=armed|control \
//   node scripts/sweep-reposition-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const { withReposition } = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const { attachTrickresCapture } = require('./trickres-instrument-20261016.js');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [3401]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const ARM = process.env.ARM || 'control';
const EVID = path.join(REPO, 'evidence', '2026-10-16', 'perseed-reposition');
const BEATS = path.join(REPO, 'evidence', '2026-10-16', 'reposition-beats');

const MOVE_KINDS = new Set(['blindside', 'face_it', 'move_windup']);

function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  if (ARM === 'armed') return withReposition(base, 'reposition-' + policyId, 'triblayer + reposition (pilot)');
  return base;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function oneRun(seed, policyId) {
  if (ARM === 'armed') process.env.REPOSITION = '1'; else delete process.env.REPOSITION;
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'reposition-' + ARM, fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickresCapture(Game);

  // ctx counters: reposition-layer attempts (armed only; control never fires)
  const ctxProbe = { rpBlindside: 0, rpFaceIt: 0 };
  const oDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { ctxProbe.rpBlindside = ctx.rpBlindside || 0; ctxProbe.rpFaceIt = ctx.rpFaceIt || 0; } catch (e) {}
    },
  });

  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();
  delete process.env.REPOSITION;

  const st = Game.state || {};
  const monsterById = {};
  try { for (const m of (Game.data.monsters || [])) monsterById[m.id] = m.wave || 1; } catch (e) {}

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;

  // PRIMARY: movement-kind performances via the attribution channel.
  let movePerfs = 0;
  const movePerfByKind = {};
  const movePerfFights = [];
  for (const t of cap.tbFights) {
    const perfs = (t && t.perfs) || {};
    for (const mid of Object.keys(perfs)) {
      for (const k of (perfs[mid] || [])) {
        if (MOVE_KINDS.has(k)) {
          movePerfs++;
          movePerfByKind[k] = (movePerfByKind[k] || 0) + 1;
          movePerfFights.push({ day: t.day, mid, kind: k, outcome: t.outcome });
        }
      }
    }
  }

  const deaths = cap.deaths || [];
  const playerDeaths = deaths.filter(d => d.player).length;
  const deathCauses = deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {});

  const out = {
    seed, policyId, arm: ARM,
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1, SEATDRIVE=0 explicit; NODEWITNESS unset)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave,
    movePerfs, movePerfByKind, movePerfFights,
    rpAttempts: { blindside: ctxProbe.rpBlindside, faceIt: ctxProbe.rpFaceIt },
    deaths: deaths.length, playerDeaths,
    deathCauses,
    nTbFights: cap.tbFights.length,
    monsterCounters: Object.keys(st.monsterCounters || {}),
    nSayBeats: cap.sayBeats.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));

  // Sense-read material: beats around movement-kind performance fights.
  const perfDays = new Set(movePerfFights.map(x => x.day));
  const beats = (cap.sayBeats || []).filter(b => perfDays.has(b.day)).slice(0, 60);
  if (beats.length || movePerfFights.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}.txt`),
      `reposition beats — ${policyId} s${seed} ${ARM} — movement-kind performances\n` +
      JSON.stringify(movePerfFights, null, 1) + '\n--- beats on those days ---\n' +
      beats.map(b => `d${b.day}: ${b.text}`).join('\n') + '\n');
  }
  return out;
}

(async () => {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, policyId);
      rows.push({ policy: policyId, seed, arm: ARM, days: r.days, end: r.endReason, movePerfs: r.movePerfs, byKind: r.movePerfByKind, national: r.national, table: r.table, won: r.won, playerDeaths: r.playerDeaths });
      console.log(JSON.stringify(rows[rows.length - 1]));
    }
  }
  const agg = {
    arm: ARM, n: rows.length,
    movePerfs: rows.reduce((s, r) => s + r.movePerfs, 0),
    byKind: {},
    national: rows.reduce((s, r) => s + r.national, 0),
    table: rows.reduce((s, r) => s + r.table, 0),
    won: rows.reduce((s, r) => s + r.won, 0),
    playerDeaths: rows.reduce((s, r) => s + r.playerDeaths, 0),
    medianDays: rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
  };
  for (const r of rows) for (const k of Object.keys(r.byKind || {})) agg.byKind[k] = (agg.byKind[k] || 0) + (r.byKind[k] | 0);
  console.log('AGG: ' + JSON.stringify(agg));
})();
