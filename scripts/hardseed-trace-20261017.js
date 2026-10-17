#!/usr/bin/env node
// hardseed-trace-20261017.js — READ-ONLY instrument for seed 1940809 autopsy
// (sim-hardseed, scale-onramp axis). Zero src/js changes, zero policy edits.
// Mirrors scripts/sweep-wincensus-c-20261017.js EXACTLY (same env substrate,
// same policies, same mode strings, same daily/hash sequencing) and adds:
//   - Game.registerDeath wrapper capturing {day,kind,vid,name,cause} per death
//   - per-day village state snapshot (alive count, pantry kcal, scholar state)
// Output: evidence/2026-10-17/perseed-hardseed-s1940809/hardseed-<policy>-<side>-s1940809.json
// Det-gate: every run's hash trajectory must byte-match the sweep's stored
// hashes (read-only reference: the-scattering/evidence/2026-10-17/perseed-wincensus-c/)
// before ANY attribution is trusted.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//     node scripts/hardseed-trace-20261017.js [policy-list] [side-list]
//   e.g. node scripts/hardseed-trace-20261017.js leadfeast armed
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`HARDSEED STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.ALLOWGATE2 === '1') {
  console.error('HARDSEED STOP: ALLOWGATE2=1 is set — substrate moved; STOP.'); process.exit(2);
}

const SEED = 1940809;
const POLICIES = process.argv[2] ? process.argv[2].split(',') : ['leadfeast', 'belongfeast'];
const SIDES = process.argv[3] ? process.argv[3].split(',') : ['armed', 'control'];
const TREE = path.join(__dirname, '..');
const OUTDIR = process.env.HARDSEED_OUT || path.join(TREE, 'evidence', '2026-10-17', 'perseed-hardseed-s1940809');
const REFDIR = process.env.HARDSEED_REF ||
  path.join(process.env.HOME, 'workspace', 'the-scattering', 'evidence', '2026-10-17', 'perseed-wincensus-c');

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// The sweep captured names via this exact wrapper — reproduce it here so the
// death log carries names (harness samples.deaths has day/kind/who/cause only).
function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 500) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 80),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

function snapDay(Game) {
  const snap = { day: gday(Game), alive: null, pantry: null, scholar: {} };
  try {
    const v = Game.state.village || {};
    const sid = Game.villagerId;
    snap.alive = (v.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    }).length;
    snap.pantry = Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
    const s = Game.state.scholar || {};
    for (const k of ['health', 'energy', 'starving', 'hungerNights', 'dead']) snap.scholar[k] = s[k] === undefined ? null : s[k];
  } catch (e) {}
  return snap;
}

async function oneRun(policyId, side) {
  const armed = side === 'armed';
  process.env.SEATDRIVE = armed ? '1' : '0';
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed: SEED, mode: `wincensus-c-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hashes = [];
  const daysnap = [];
  const deathsT = { deaths: [] };
  attachDeaths(Game, deathsT);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    try { daysnap.push(snapDay(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== armed || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} seat=${seatLive} defer=${deferLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  // DET-GATE: byte-identical trajectory vs the sweep's stored hashes.
  const refFile = path.join(REFDIR, `${policyId}-${side}-s${SEED}.json`);
  let detgate = 'noref';
  try {
    const ref = JSON.parse(fs.readFileSync(refFile, 'utf8'));
    detgate = JSON.stringify(ref.hashes) === JSON.stringify(hashes) ? 'PASS' : 'FAIL';
  } catch (e) { detgate = 'noref:' + e.message; }
  const out = {
    seed: SEED, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths, deathLog: deathsT.deaths, daysnap,
    hashes, detgate,
    endVillagers: (result.samples.villagers || []).slice(-1)[0] || null,
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, `hardseed-${policyId}-${side}-s${SEED}.json`), JSON.stringify(out, null, 1));
  console.log(`  [${side} ${policyId} s${SEED}] gameDays=${out.gameDays} end=${out.endReason} detgate=${detgate} deaths=${deathsT.deaths.length}`);
  return out;
}

(async () => {
  const fails = [];
  for (const p of POLICIES) for (const s of SIDES) {
    try {
      const o = await oneRun(p, s);
      if (o.detgate !== 'PASS') fails.push(`${p}/${s}: detgate=${o.detgate}`);
    } catch (e) { console.error(`FAIL ${p}/${s}:`, e.message); fails.push(`${p}/${s}: ${e.message}`); }
  }
  if (fails.length) { console.error('HARDSEED TRACE FAILURES:\n' + fails.join('\n')); process.exit(3); }
  console.log('HARDSEED TRACE complete: all det-gates PASS.');
})();
