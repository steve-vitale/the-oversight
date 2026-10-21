#!/usr/bin/env node
// sweep-thiefcooldown-b.js — pilot sweep for the sim-thiefcooldown-b arm.
//
// Substrate matches the finding: leadfeast policy + SURPLUSFEED=1 (+ the
// doomeddraw governor layer), FEASTSCALE_R13=1, SEATDRIVE=0, with the scholar
// granted the Light Fingers thief ability at setup.
//
// Env: SEEDS="8801,...,8808" DAYS=100 SIDE=<label> OUTDIR=<dir>
//   FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1
//   node scripts/sweep-thiefcooldown-b.js
//
// Per seed: runs the policy death-aware, counts "Caught red-handed!" events
// with day stamps, reports max caught per 10-day window (the pre-registered
// primary: <= 3; the finding observed ~30), scholar trust trajectory, days
// survived, end reason, death cause. Writes one JSON per seed into OUTDIR.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
let withDoomedDraw = null;
try { ({ withDoomedDraw } = require('./policies/doomeddraw')); } catch (e) {}

for (const [k, want] of [['FEASTSCALE_R13', '1'], ['SEATDRIVE', '0'], ['SURPLUSFEED', '1']]) {
  if (process.env[k] !== want) { console.error(`FATAL: ${k}=${want} must be set explicitly`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS || '8801,8802,8803,8804,8805,8806,8807,8808')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const SIDE = process.env.SIDE || 'pilot';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-thiefcooldown-b');
fs.mkdirSync(OUTDIR, { recursive: true });

function basePolicy() {
  let p = leadfeast;
  if (withDoomedDraw && process.env.SURPLUSFEED === '1') p = withDoomedDraw(p, 'leadfeast-thiefcooldown', 'thiefcooldown pilot');
  const wrapped = Object.assign({}, p);
  const baseSetup = p.setup;
  wrapped.setup = function (Game, ctx) {
    if (baseSetup) baseSetup.call(this, Game, ctx);
    // the finding's scholar: Light Fingers granted (the ability under test)
    const s = Game.state.scholar;
    s.abilities = s.abilities || [];
    if (!s.abilities.some(a => (a && a.id) === 'thief' || a === 'thief')) s.abilities.push({ id: 'thief' });
    ctx._thiefGranted = Game.hasAbility('thief');
  };
  wrapped.id = 'leadfeast-thief';
  return wrapped;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'thiefcooldown-b-' + SIDE, fullTelemetry: false });
  await setupGame(Game);
  const W = { caughtDays: [], palmDays: [], nickDays: [] };
  const oSay = Game.say.bind(Game);
  Game.say = function (msg) {
    const m = String(msg);
    const day = (Game.state.scholar || {}).day || 0;
    try {
      if (/Caught red-handed/.test(m)) W.caughtDays.push(day);
      else if (/palm the food cleanly/.test(m)) W.palmDays.push(day);
      else if (/Someone watches you take food/.test(m)) W.nickDays.push(day);
    } catch (e) {}
    return oSay(msg);
  };
  const trustSamples = [];
  const policy = basePolicy();
  const origDaily = policy.daily;
  policy.daily = (G, ctx) => {
    try {
      const v = (G.state || {}).village || {};
      const vid = (G.state || {}).scholar.villagerId;
      const t = ((v.trust || {})[vid] === undefined) ? 15 : (v.trust || {})[vid];
      trustSamples.push({ day: (G.state.scholar || {}).day || 0, trust: t });
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };
  const t0 = Date.now();
  let result, err = null;
  try {
    result = await quietLog(() => runDays(Game, policy, { days: DAYS }));
  } catch (e) { err = String(e && e.message || e); }
  const ms = Date.now() - t0;
  // max caught per 10-day window (the pre-registered primary)
  const wins = {};
  for (const d of W.caughtDays) { const w = Math.floor(d / 10); wins[w] = (wins[w] || 0) + 1; }
  const maxPer10d = Object.values(wins).reduce((a, b) => Math.max(a, b), 0);
  const s = (Game.state || {}).scholar || {};
  const out = {
    side: SIDE, seed, days: DAYS, ms,
    error: err,
    daysSurvived: result && result.days,
    endReason: result && result.endReason,
    thiefGranted: undefined,
    caughtTotal: W.caughtDays.length,
    caughtMaxPer10d: maxPer10d,
    caughtDays: W.caughtDays.slice(0, 60),
    palmTotal: W.palmDays.length,
    nickTotal: W.nickDays.length,
    trustStart: trustSamples.length ? trustSamples[0].trust : null,
    trustEnd: trustSamples.length ? trustSamples[trustSamples.length - 1].trust : null,
    trustMin: trustSamples.length ? Math.min(...trustSamples.map(x => x.trust)) : null,
  };
  try {
    const tel = (Game.state || {}).telemetry || [];
    const deaths = tel.filter(e => e && e.type === 'death');
    const pd = deaths.find(e => e.player);
    out.playerDeath = pd ? { day: pd.day, cause: String(pd.cause || '').slice(0, 60) } : null;
  } catch (e) {}
  const fp = path.join(OUTDIR, `${SIDE}-seed${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const r = await oneRun(seed);
    rows.push(r);
    console.log(`seed ${seed}: survived=${r.daysSurvived} end=${r.endReason} caught=${r.caughtTotal} maxPer10d=${r.caughtMaxPer10d} trust=${r.trustStart}->${r.trustEnd}(min ${r.trustMin}) death=${r.playerDeath ? r.playerDeath.day + '/' + r.playerDeath.cause : '-'}${r.error ? ' ERROR:' + r.error : ''}`);
  }
  const caughts = rows.map(r => r.caughtMaxPer10d);
  console.log(`\nPILOT ${SIDE}: n=${rows.length} maxCaughtPer10d=[${caughts.join(',')}] ` +
    `go=${caughts.every(c => c <= 3) ? 'PASS' : 'FAIL'} (bar <= 3; finding observed ~30)`);
}
main().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
