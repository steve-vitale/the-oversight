#!/usr/bin/env node
// sweep-draworder-b.js — before/after sweep for the sim-draworder-b arm
// (loop B, food-economy; draw-order lever, env-gated DRAWCOARSE=1).
//
// Usage (HONOR EXACTLY — same substrate as sim-rotdiff-b):
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=control POLICY=leadfeast SEEDS=23001,...,23008 node scripts/sweep-draworder-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=armed   POLICY=leadfeast SEEDS=23001,...,23008 node scripts/sweep-draworder-b.js
// ARM=control -> DRAWCOARSE unset; ARM=armed -> DRAWCOARSE=1 (set INSIDE the
// script, never inherited — the game code reads the env at pantryDraw time).
// SURPLUSFEED must stay unset (base substrate).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachRotDiff, summarize } = require('./rotdiff-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SURPLUSFEED === '1') {
  console.error('FATAL: SURPLUSFEED must be unset (base substrate)');
  process.exit(2);
}
const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armed') { console.error('FATAL: ARM=control|armed'); process.exit(2); }
if (ARM === 'armed') process.env.DRAWCOARSE = '1';
else delete process.env.DRAWCOARSE;

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-21/perseed-draworder-b/' + POLICY_ID + '-' + ARM + '.json');

// ---- coordinator's banned-seed list (sweep stops on any hit) ----
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708', '4801-4808', '4901-4908',
    '5201-5208', '5301-5308', '6810-6811', '6813-6817', '6912-6912']) {
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
const SEEDS = (process.env.SEEDS || '23001,23002,23003,23004,23005,23006,23007,23008')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
console.log(`arm=${ARM} policy=${POLICY_ID} seeds: ${SEEDS.join(',')} (banned-check clean)`);

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'draworder-b-' + ARM + '-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = attachRotDiff(Game);
  // death tele tap (read-only): guardrail counts need live death causes
  const deaths = [];
  const oTele = Game.tele;
  if (typeof oTele === 'function') Game.tele = function (type, data) {
    try {
      if (type === 'death' && data) deaths.push({ day: ((Game.state || {}).scholar || {}).day || 0,
        kind: data.kind || '?', who: String(data.who || '?'), cause: String(data.cause || '?') });
    } catch (e) {}
    return oTele.apply(this, arguments);
  };
  // spoil-line sniffer (SENSE): capture a sample of rot-voicing lines
  const spoilLines = [];
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (msg) {
    try {
      if (typeof msg === 'string' && /spoil|threw out|went bad|rotten|flies/i.test(msg) && spoilLines.length < 25) {
        spoilLines.push('d' + ((((Game.state || {}).scholar || {}).day) || '?') + ': ' + msg.slice(0, 220));
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const t0 = Date.now();
  const result = await runDays(Game, POLICY, { days, manifest: null, sampleEvery: 181 });
  const ms = Date.now() - t0;
  let exiled = 0, rosterEnd = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const starvation = deaths.filter(d => /starv/i.test(d.cause)).length;
  const end = {
    seed, policy: POLICY_ID, arm: ARM, days: result.days, endReason: result.endReason,
    won: !!Game.won,
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    national: (() => { try { return !!Game.state.nationalLive; } catch (e) { return false; } })(),
    table: (() => { try { return !!Game.tableActive(); } catch (e) { return false; } })(),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled, pkEnd: Math.round(pantryKcal(Game)),
    deaths, starvationDeaths: starvation,
    wins: Game.won ? 1 : 0,
    rd: summarize(W), spoilLines: spoilLines.slice(0, 12), ms,
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
    const rc = end.rd.rotClass || {};
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} ` +
      `rotCoarse=${Math.round((rc['pantry-coarse'] || 0) / 1000)}k rotS3d=${Math.round((rc['surplus-3d'] || 0) / 1000)}k ` +
      `starv=${end.starvationDeaths} won=${end.won} (${end.ms}ms)`);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ meta: { policy: POLICY_ID, arm: ARM, kind: 'draworder-b', days: DAYS, seeds: SEEDS,
      env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: 'unset', DRAWCOARSE: ARM === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  }
  console.log('wrote ' + OUT);
})().catch(e => { console.error(e.stack); process.exit(1); });
