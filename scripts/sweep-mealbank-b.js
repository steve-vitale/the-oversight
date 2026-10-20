#!/usr/bin/env node
// sweep-mealbank-b.js — pilot sweep for the pack-banking discipline
// (arm sim-mealbank-b, run fleshout-loop-b-20261020T1630Z, axis food-economy).
//
// Paired before/after on identical seeds, pooled over lead+belong.
// Control: MEALBANK unset. Armed: MEALBANK=1.
// Both sides: mealbank-wrapped base-courtship policies (leadmealbank /
// belongmealbank) on the bare base substrate (no FEASTSCALE/SEATDRIVE flags,
// exactly the parent mealonly road).
//
// Instruments: scholar hungry-days (kcal<1200 scholar-days at the daily
// read), mealbank counters (refused/refuseDays/voicedDays/bankSum), wall
// keys (national/table/won booleans + won key, maxWave, arc, survival),
// death causes (live-captured by the harness).
//
// Usage:
//   MEALBANK=1 SEEDS="82002,82003,82004,82005,82006,82007,82008,82009" \
//   POLICY=leadmealbank DAYS=180 \
//   OUT=evidence/2026-10-20/perseed-mealbank-b/armed-lead.json \
//   node scripts/sweep-mealbank-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
// KILL PROTOCOL: the mealbank layer was deleted after the pilot killed the
// arm (NO-GO). Degrade gracefully; the pre-kill pilot is in
// evidence/2026-10-20/perseed-mealbank-b/.
let layer = null;
try { layer = require('./policies/mealbank-b'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: mealbank layer deleted per kill protocol (NO-GO at pilot) — see evidence/2026-10-20/sim-mealbank-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadmealbank, belongmealbank } = layer;

const SIDE = process.env.MEALBANK === '1' ? 'armed' : 'control';

const POLICIES = { leadmealbank, belongmealbank };
const POLICY_ID = process.env.POLICY || 'leadmealbank';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadmealbank;
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sweep-mealbank-b-' + SIDE + '-' + POLICY_ID + '.json');

// ---- coordinator's banned-seed list (sweep stops on any hit) ----
// Verbatim from sweep-retagrot-b.js (the canonical judged-run list) +
// 5411-5426 (sibling arm sim-retagrot-confirm-b of THIS run, reserved).
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708', '4801-4808', '4901-4908',
    '5201-5208', '5301-5308', '6810-6811', '6813-6817', '6912-6912',
    '5411-5426']) {
  const [a, b] = spec.split('-').map(Number);
  for (let s = a; s <= b; s++) BANNED.add(s);
}
for (const spec of ['171,282,393,504,615,726,837,948', '121,232,343,454,565,676,787,898',
    '131,242,353,464,575,686,797,908', '151,262,373,484,595,706,817,928',
    '163,274,385,496,607,718,829,940', '205,246,321,412,523,634,745,856',
    '307,418,529,640,751,862,973,84', '917,928,939,104,215,326,437,548',
    '141,252,363,474', '101,202,303,404,606,707,808,909',
    '137,248,359,470,581,692,803,914']) {
  for (const s of spec.split(',').map(Number)) BANNED.add(s);
}
const SEEDS = (process.env.SEEDS || '82002,82003,82004,82005,82006,82007,82008,82009')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
console.log(`side=${SIDE} policy=${POLICY_ID} seeds: ${SEEDS.join(',')} (banned-check clean)`);

function scholarDay(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'mealbank-b-' + SIDE + '-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);

  // --- per-day instruments via the policy wrapper ---
  // hungry-days: scholar kcal<1200 (the engine's own scholar hunger line,
  // per finding #277's calibration) read at the daily start — one night
  // behind the meals, identically on both sides.
  // wall keys: everTable (progState.tableWaiting || tableState staged/
  // seated/done), maxWave (daily unlockedWave), national (nationalLive).
  const W = { hungryDays: 0, everTable: false, maxWave: 1, nationalLive: false, arc: 1 };
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  let lastCtx = null;
  policy.daily = (G, ctx) => {
    lastCtx = ctx;
    try {
      if (((G.state || {}).scholar || {}).kcal < 1200) W.hungryDays++;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) W.everTable = true;
      try {
        const ts = G.tableState ? G.tableState() : null;
        if (ts && (ts.staged || ts.seated || ts.done)) W.everTable = true;
      } catch (e) {}
      try { W.maxWave = Math.max(W.maxWave, G.unlockedWave ? (G.unlockedWave() | 0) : 1); } catch (e) {}
      try { if ((G.state || {}).nationalLive) W.nationalLive = true; } catch (e) {}
      try { W.arc = Math.max(W.arc, ((G.progState() || {}).arc || 1)); } catch (e) {}
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null, sampleEvery: 181 });
  const ms = Date.now() - t0;

  const mb = {};
  try {
    mb.refused = lastCtx._mbRefused || 0;
    mb.refuseDays = lastCtx._mbRefuseDays || 0;
    mb.voicedDays = lastCtx._mbVoicedDays || 0;
    mb.bankSum = Math.round(lastCtx._mbBankSum || 0);
  } catch (e) {}

  const deaths = {};
  let scholarDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (d.player) scholarDeaths++;
    }
  } catch (e) {}
  const starveDeaths = Object.entries(deaths).filter(([k]) => /starv/i.test(k)).reduce((a, [, v]) => a + v, 0);

  let exiled = 0, rosterEnd = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}

  // Wall booleans, top-level for the telemetry step.
  const won = !!Game.won;
  const national = W.nationalLive ? 1 : 0;
  const table = W.everTable ? 1 : 0;
  const end = {
    days: result.days, endReason: result.endReason,
    won, national, table,
    maxWave: W.maxWave | 0, wave4: W.maxWave >= 4 ? 1 : 0, wave5: W.maxWave >= 5 ? 1 : 0,
    arc: W.arc | 0,
    rosterEnd, exiled,
    hungryDays: W.hungryDays, starveDeaths, scholarDeaths, deaths,
    mealbank: mb, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  try {
    const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    if (prev && Array.isArray(prev.rows)) {
      for (const r of prev.rows) rows.push(r);
      console.log(`resume: ${rows.length} seeds already done (${rows.map(r => r.seed).join(',')})`);
    }
  } catch (e) {}
  const doneSet = new Set(rows.map(r => r.seed));
  for (const seed of SEEDS) {
    if (doneSet.has(seed)) { console.log(`skip seed=${seed} (already done)`); continue; }
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} hungry=${end.hungryDays} wave=${end.maxWave} national=${end.national} table=${end.table} won=${end.won} starveD=${end.starveDeaths} scholarD=${end.scholarDeaths} refused=${end.mealbank.refused} (${end.ms}ms)`);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ meta: { policy: POLICY_ID, side: SIDE, days: DAYS, seeds: SEEDS, env: { MEALBANK: SIDE === 'armed' ? '1' : 'unset', SEATDRIVE: process.env.SEATDRIVE || 'unset', FEASTSCALE_R13: process.env.FEASTSCALE_R13 || 'unset' }, kind: 'mealbank-b-pilot' }, rows }, null, 1));
  }
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
