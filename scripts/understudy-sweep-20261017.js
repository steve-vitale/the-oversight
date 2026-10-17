#!/usr/bin/env node
// understudy-sweep-20261017.js — the sim-understudy pilot sweep (findings #432a/#433).
//
// QUESTION: does the honest mid-fight weapon switch (fresh_weapon execution)
// move fresh_weapon PERFORMANCES on the pre-seat tribfloor substrate — and
// does the contact-creating part of the layer put scholar-vs-understudy TB
// fights on the board?
//
// Arms (identical seeds, 180d death-aware, own in-sweep paired control):
//   control: tribfloor leadfeast / belongfeast (UNDERHUNT unset)
//   armed:   tribfloor leadfeast / belongfeast + understudy layer (UNDERHUNT=1)
// Armed differs from control ONLY by the understudy layer.
//
// Substrate: pre-seat courtship — FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0
// EXPLICIT (post-c004b9dd the seat default is ON; unset would change the
// substrate). The tribfloor composition: scripts/policies/tribfloor.js wraps
// feastscale's leadfeast/belongfeast (ids 'leadfeast'/'belongfeast'); the
// understudy layer wraps tribfloor's exports. Control and armed share the
// identical substrate objects; UNDERHUNT is the only switch.
//
// PRE-REGISTRATION (evidence/2026-10-17/sim-understudy.md header — BINDING):
//   Primary: fresh_weapon PERFORMANCES via the f.trickLogByMid attribution
//   channel (scripts/trickres-instrument-20261016.js, reused read-only) —
//   armed − control ≥ 4 across the 32-run pilot. GO → confirm; KILL → delete
//   scripts/policies/understudy.js zero-trace per kill protocol.
//   Guardrails (binding): national ≥ control−2; median survival ≥ control−10d;
//   scholar combat deaths ≤ control+2; no new death mode.
//   Seeds: 8 FRESH [4001–4008] (0 filename hits across evidence/, verified
//   2026-10-17) × {leadfeast, belongfeast} = 16 runs/arm. 32 runs total.
//   Horizon: 180d death-aware (dead villages stop; +10d tail max).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 SEEDS=4001,4002,... \
//   POLICIES=leadfeast,belongfeast DAYS=180 ARM=armed|control \
//   node scripts/understudy-sweep-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { leadfeast, belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const { withUnderstudy } = require(path.join(REPO, 'scripts', 'policies', 'understudy'));
const { attachTrickresCapture } = require('./trickres-instrument-20261016.js');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required (substrate).'); process.exit(2); }
if (process.env.TRIBFLOOR !== '1') { console.error('SWEEP STOP: TRIBFLOOR=1 is required (substrate).'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4001]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const ARM = process.env.ARM || 'control';
const EVID = path.join(REPO, 'evidence', '2026-10-17', 'perseed-understudy');
const BEATS = path.join(REPO, 'evidence', '2026-10-17', 'understudy-beats');
try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
try { fs.mkdirSync(BEATS, { recursive: true }); } catch (e) {}

function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  if (ARM === 'armed') return withUnderstudy(base, 'understudy-' + policyId, 'tribfloor + understudy (pilot)');
  return base;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function oneRun(seed, policyId) {
  if (ARM === 'armed') process.env.UNDERHUNT = '1'; else delete process.env.UNDERHUNT;
  const basePolicy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'understudy-' + ARM, fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickresCapture(Game);

  // Track max rank / national reach (sweep-compare pattern: history, not just end state)
  const RANK_ORDER = { village: 0, regional: 1, national: 2 };
  let maxRank = 0;
  const oDaily = basePolicy.daily;
  const policy = Object.assign({}, basePolicy, {
    daily(G, ctx) {
      try {
        const r = (G.state.village || {}).rank;
        const rv = RANK_ORDER[String(r).toLowerCase()] || 0;
        if (rv > maxRank) maxRank = rv;
      } catch (e) {}
      if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
    },
  });

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // fresh_weapon performances: the f.trickLogByMid channel, per-fight
  let fwPerfs = 0;
  const fwBeats = [];
  try {
    for (const tf of (cap.tbFights || [])) {
      const kinds = ((tf.perfs || {}).understudy || []);
      for (const k of kinds) {
        if (k === 'fresh_weapon') {
          fwPerfs++;
          if (fwBeats.length < 10) fwBeats.push({ day: tf.day, result: tf.result, known: (tf.knownByMid || {}).understudy });
        }
      }
    }
  } catch (e) {}
  cap.restore();
  delete process.env.UNDERHUNT;
  // scholar combat deaths + death causes from the run samples
  const deaths = {};
  try {
    for (const d of ((result.samples || {}).deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let scholarCombatDeaths = 0;
  for (const k of Object.keys(deaths)) {
    if (/player:/.test(k) && /combat|fight|monster|understudy/i.test(k)) scholarCombatDeaths += deaths[k];
  }
  const end = { days: result.days, gameDays: result.gameDays, endReason: result.endReason };
  const row = {
    seed, policy: policyId, arm: ARM, days: end.days, gameDays: end.gameDays, endReason: end.endReason,
    freshWeaponPerfs: fwPerfs, freshWeaponBeats: fwBeats,
    scholarCombatDeaths, deaths,
    maxRank: maxRank,
    national: maxRank >= 2 ? 1 : 0,
  };
  fs.writeFileSync(path.join(EVID, `${ARM}-${policyId}-s${seed}.json`), JSON.stringify(row, null, 1));
  console.log(`  [${ARM} ${policyId} s${seed}] days=${end.days} end=${end.endReason} freshWeapon=${fwPerfs} national=${row.national} scholarCombatDeaths=${scholarCombatDeaths}`);
  return row;
}

(async () => {
  const rows = [];
  for (const pid of POLICIES) for (const seed of SEEDS) {
    try { rows.push(await oneRun(seed, pid)); }
    catch (e) { console.error(`  !! [${ARM} ${pid} s${seed}] FAILED: ${e.message}`); }
  }
  const fw = rows.reduce((a, r) => a + (r.freshWeaponPerfs || 0), 0);
  console.log(`\n=== ${ARM} SUMMARY: runs=${rows.length} fresh_weapon performances=${fw} ===`);
  fs.writeFileSync(path.join(EVID, `${ARM}-summary.json`), JSON.stringify({ arm: ARM, runs: rows.length, freshWeaponPerfs: fw, rows }, null, 1));
})().catch(e => { console.error('SWEEP FATAL: ' + (e && e.stack || e)); process.exit(1); });
