#!/usr/bin/env node
// sweep-trickreach-20261017.js — the sim-trickreach pilot sweep (finding #432a).
//
// QUESTION: does teaching the TB policy the two remaining bot-unreachable
// trick kinds (fresh_weapon via mid-fight weapon switch, keep_distance via
// honest distance-hold) move performances — and fight outcomes — on the
// pre-seat substrate?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: feastscale leadfeast / belongfeast (TRICKREACH unset)
//   armed:   feastscale leadfeast / belongfeast + trickreach layer (TRICKREACH=1)
// Armed differs from control ONLY by the trickreach layer.
//
// Substrate: pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1.
// NODEWITNESS unset.
//
// PRE-REGISTRATION (evidence/2026-10-17/sim-trickreach.md header — BINDING):
//   Primary: fresh_weapon + keep_distance PERFORMANCES (via the
//   f.trickLogByMid attribution channel, scripts/trickres-instrument-20261016.js)
//   — armed − control ≥ 4 across the 16-run pilot. GO → confirm on 12–16
//   fresh seeds; KILL → delete scripts/policies/trickreach.js zero-trace.
//   Guardrails: scholar combat deaths ≤ control+2; national ≥ control−2 (per
//   8-seed set); median survival ≥ control−10d; no new death mode.
//   Seeds: 8 FRESH [3601–3608] × {leadfeast, belongfeast} = 16 runs/arm.
//   FRESH = 0 filename hits across evidence/ (verified 2026-10-17).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS=3601,3602,... \
//   POLICIES=leadfeast,belongfeast DAYS=180 ARM=armed|control \
//   node scripts/sweep-trickreach-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { leadfeast, belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));
const { withTrickreach } = require(path.join(REPO, 'scripts', 'policies', 'trickreach'));
const { attachTrickresCapture } = require('./trickres-instrument-20261016.js');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required (substrate).'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [3601]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const ARM = process.env.ARM || 'control';
const EVID = path.join(REPO, 'evidence', '2026-10-17', 'perseed-trickreach');
const BEATS = path.join(REPO, 'evidence', '2026-10-17', 'trickreach-beats');

const TARGET_KINDS = new Set(['fresh_weapon', 'keep_distance']);

function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  if (ARM === 'armed') return withTrickreach(base, 'trickreach-' + policyId, 'feastscale + trickreach (pilot)');
  return base;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function oneRun(seed, policyId) {
  if (ARM === 'armed') process.env.TRICKREACH = '1'; else delete process.env.TRICKREACH;
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'trickreach-' + ARM, fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickresCapture(Game);

  // ctx counters: trickreach-layer attempts (armed only; control never fires)
  const ctxProbe = { trFreshWeapon: 0, trKeepDistance: 0 };
  const oDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { ctxProbe.trFreshWeapon = ctx.trFreshWeapon || 0; ctxProbe.trKeepDistance = ctx.trKeepDistance || 0; } catch (e) {}
    },
  });

  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();
  delete process.env.TRICKREACH;

  const st = Game.state || {};

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;

  // PRIMARY: target-kind performances via the attribution channel.
  let targetPerfs = 0;
  const targetPerfByKind = {};
  const targetPerfFights = [];
  for (const t of cap.tbFights) {
    const perfs = (t && t.perfs) || {};
    for (const mid of Object.keys(perfs)) {
      for (const k of (perfs[mid] || [])) {
        if (TARGET_KINDS.has(k)) {
          targetPerfs++;
          targetPerfByKind[k] = (targetPerfByKind[k] || 0) + 1;
          targetPerfFights.push({ day: t.day, mid, kind: k, result: t.result });
        }
      }
    }
  }

  const deaths = cap.deaths || [];
  const playerDeaths = deaths.filter(d => d.player).length;
  const deathCauses = deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {});
  // combat deaths of the scholar specifically (guardrail)
  let scholarCombatDeaths = 0;
  for (const d of deaths) {
    try {
      if (d.player && /combat|fight|slain|killed/i.test(String(d.cause || '') + ' ' + String(d.kind || ''))) scholarCombatDeaths++;
    } catch (e) {}
  }

  const out = {
    seed, policyId, arm: ARM,
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1, SEATDRIVE=0 explicit; NODEWITNESS unset)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave,
    targetPerfs, targetPerfByKind, targetPerfFights,
    trAttempts: { freshWeapon: ctxProbe.trFreshWeapon, keepDistance: ctxProbe.trKeepDistance },
    deaths: deaths.length, playerDeaths, scholarCombatDeaths,
    deathCauses,
    nTbFights: cap.tbFights.length,
    monsterCounters: Object.keys(st.monsterCounters || {}),
    nSayBeats: cap.sayBeats.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));

  // Sense-read material: beats around target-kind performance fights.
  const perfDays = new Set(targetPerfFights.map(x => x.day));
  const beats = (cap.sayBeats || []).filter(b => perfDays.has(b.day)).slice(0, 60);
  if (beats.length || targetPerfFights.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}.txt`),
      `trickreach beats — ${policyId} s${seed} ${ARM} — fresh_weapon + keep_distance performances\n` +
      JSON.stringify(targetPerfFights, null, 1) + '\n--- beats on those days ---\n' +
      beats.map(b => `d${b.day}: ${b.text}`).join('\n') + '\n');
  }
  return out;
}

(async () => {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, policyId);
      rows.push({ policy: policyId, seed, arm: ARM, days: r.days, end: r.endReason, targetPerfs: r.targetPerfs, byKind: r.targetPerfByKind, national: r.national, table: r.table, won: r.won, playerDeaths: r.playerDeaths, scholarCombatDeaths: r.scholarCombatDeaths });
      console.log(JSON.stringify(rows[rows.length - 1]));
    }
  }
  const agg = {
    arm: ARM, n: rows.length,
    targetPerfs: rows.reduce((s, r) => s + r.targetPerfs, 0),
    byKind: {},
    national: rows.reduce((s, r) => s + r.national, 0),
    table: rows.reduce((s, r) => s + r.table, 0),
    won: rows.reduce((s, r) => s + r.won, 0),
    playerDeaths: rows.reduce((s, r) => s + r.playerDeaths, 0),
    scholarCombatDeaths: rows.reduce((s, r) => s + r.scholarCombatDeaths, 0),
    medianDays: rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
  };
  for (const r of rows) for (const k of Object.keys(r.byKind || {})) agg.byKind[k] = (agg.byKind[k] || 0) + (r.byKind[k] | 0);
  console.log('AGG: ' + JSON.stringify(agg));
})();
