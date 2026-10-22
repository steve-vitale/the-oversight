#!/usr/bin/env node
// standgate-sweep-20261022.js — STANDING GATE attribution sweep
// (flesh-out loop arm sim-standgate, run fleshout-20261022T0437Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. The instrument wraps the policy daily with PURE engine reads
// (scripts/standgate-lib.js) — the DET gate pins instrument-on vs
// instrument-off byte-identical trajectories.
//
// SUBSTRATE (the brief's exact env — the VGEAR winning substrate):
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//        VGEAR=1 KILLDISC=1
//   unset: SUCCGRACE RAIDDENSITY NODEWITNESS FULLSEAT VETREL REPOSITION VGEARBEATS
//   policy = vgearconfirm armedFor(leadfeast|belongfeast) (VGEAR=1)
//
// PRE-REGISTRATION: PRIMARY (DIAG-GO) = >=95% of all standing gains across
// the corpus attributed to named channels (blood/bonds/bread), 0
// unexplained. The design judgment: is the 225 gate EARNABLE (channels a
// player can deliberately push, independent of winning) or a WIN-PROXY
// (standing tracks the win)? See evidence/2026-10-22/sim-standgate.md.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//     node scripts/standgate-sweep-20261022.js
//   SMOKE=1 ...       # short smoke: both policies drive, instrument live
//   DET=1 ...         # det-gate: instrument-on vs instrument-off byte-identical (paired seeds, 60d)
//   FIDELITY=1 ...    # fidelity: re-run completed sweep seeds, byte-identical per-seed JSON (minus hashes)
//   ONLY=leadfeast ...# policy filter
//   SEEDS="65501,65502" DAYS=180 ...
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SG = require('./standgate-lib');
const VCE = require('./policies/vgearconfirm');
const KD = require('./killdisc-instrument-20261018');

// SUBSTRATE GUARD — the brief's exact env. FAIL LOUD otherwise.
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65501, 65502, 65503, 65504, 65505, 65506, 65507, 65508]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(REPO, 'evidence', '2026-10-22', 'perseed-standgate');
const isBare = () => process.env.STANDGATE_BARE === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const SAY_CAP = 4000;

function baseFor(policyId) { return VCE.armedFor(policyId); }

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const policy = Object.assign({}, baseFor(policyId));
  const oDaily = policy.daily;
  const samples = [];
  let sayLines = [];
  const hashes = [];
  const hist = { maxRank: 0, everTable: false, exiled: false };
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      if (!isBare()) {
        const s = SG.sgSample(G);
        try { const pg = G.progState ? G.progState() : {}; if (pg.tableWaiting || pg.tableDone) { hist.everTable = true; s.table = 1; } } catch (e) {}
        try { s.rank = RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] | 0; } catch (e) { s.rank = 0; }
        try { s.won = G.won ? 1 : 0; } catch (e) { s.won = 0; }
        hist.maxRank = Math.max(hist.maxRank, s.rank | 0);
        try { if (G.justiceExiled && G.justiceExiled()) hist.exiled = true; } catch (e) {}
        samples.push(s);
      }
      hashes.push(G.state.scholar.day + ':' + dayHash(G));
    } catch (e) {}
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'standgate', fullTelemetry: false });
  // KILLDISC observer (same as the substrate's reference sweep — read-only,
  // trajectory-neutral per its own det-gate; keeps this corpus comparable).
  const kdT = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  let uninstallKD = null;
  try { uninstallKD = KD.install(Game, kdT); } catch (e) {}
  if (!isBare()) {
    // say capture — call-through, array appends only, trajectory-neutral.
    try {
      const osay = Game.say.bind(Game);
      Game.say = function (x) {
        try { if (sayLines.length < SAY_CAP) sayLines.push({ d: SG.gday(Game), text: String(x).slice(0, 500) }); } catch (e) {}
        return osay.apply(this, arguments);
      };
    } catch (e) {}
  }
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: daysNow(), manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallKD) uninstallKD(); } catch (e) {}
  const st = Game.state || {};
  const deaths = {};
  const deathList = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathList.push({ day: d.day | 0, who: String(d.who || ''), player: !!d.player, kind: String(d.kind || ''), cause: String(d.cause || '') });
    }
  } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let maxWave = 1;
  try { maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  let won = 0, winTrack = null;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    const ek = pg.table && pg.table.endingKey;
    if (ek) winTrack = { path: ek.tablePath || null, moral: ek.moral || null, track: ek.track || null, seat: ek.seat || null };
  } catch (e) {}
  // End-of-run attribution grain.
  const endFeasts = { q0: 0, q1: 0, q2: 0 };
  try {
    for (const f of (st.feastLog || [])) {
      const q = (f && f.quality) | 0;
      if (q >= 2) endFeasts.q2++; else if (q === 1) endFeasts.q1++; else endFeasts.q0++;
    }
  } catch (e) {}
  const killByWaveVia = {};
  try {
    for (const e of (st.waveKillLog || [])) {
      if (!e || (e.w | 0) < 3) continue;
      const k = 'w' + (e.w | 0) + '.' + String(e.via || 'unknown');
      killByWaveVia[k] = (killByWaveVia[k] || 0) + 1;
    }
  } catch (e) {}
  const endLinks = [];
  try {
    const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (const l of ls) if (l && l.status === 'active') endLinks.push({ kind: String(l.kind || ''), primary: String(l.primary || ''), sub: String(l.subordinate || '') });
  } catch (e) {}
  const endStanding = SG.sgSample(Game);
  const out = {
    seed, policyId, substrate: 'vgear(VGEAR=1,FEASTSCALE_R13=1,TRIBFLOOR=1,WINPURSUIT=1,WINDEFER=1,SEATDRIVE=1,KILLDISC=1)',
    days: result.days, gameDays, endReason: result.endReason,
    won, winTrack, deaths, deathList,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    endStanding, endFeasts, killByWaveVia, endLinks,
    samples, sayLines: isBare() ? null : sayLines,
    hashes,
  };
  if (process.env.STANDGATE_NOWRITE !== '1' && !opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

// (say capture now lives inline in runOne, after loadGame).

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65501, 65502]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = process.env.DAYS || '60';
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of dseeds) {
        delete process.env.STANDGATE_BARE;
        const live = await runOne(seed, policyId, { noWrite: true });
        process.env.STANDGATE_BARE = '1';
        const bareR = await runOne(seed, policyId, { noWrite: true });
        delete process.env.STANDGATE_BARE;
        n++;
        const okH = JSON.stringify(live.hashes) === JSON.stringify(bareR.hashes) && live.hashes.length > 0;
        const okS = JSON.stringify(live.samples) !== '[]' && bareR.samples.length === 0;
        console.log(`DET ${policyId}/s${seed}: ${okH && okS ? 'IDENTICAL' : 'DIVERGED'} (${live.hashes.length} days, ${live.samples.length} samples)`);
        if (!(okH && okS)) bad++;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    if (bad) { console.error(`DET FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`DET GREEN: ${n}/${n} byte-identical, instrument captured samples only on the live side.`);
    return;
  }
  if (process.env.FIDELITY === '1') {
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : SEEDS.slice(0, 2)).filter(Number.isFinite);
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of fseeds) {
        const fp = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { console.log(`FIDELITY SKIP ${policyId}/s${seed}: no sweep JSON`); continue; }
        const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const re = await runOne(seed, policyId, { noWrite: true });
        n++;
        const strip = (o) => { const c = Object.assign({}, o); delete c.hashes; return JSON.stringify(c); };
        const ok = strip(orig) === strip(re);
        console.log(`FIDELITY ${policyId}/s${seed}: ${ok ? 'IDENTICAL' : 'DIVERGED'}`);
        if (!ok) bad++;
      }
    }
    if (!n) { console.error('FIDELITY: nothing to compare.'); process.exit(2); }
    if (bad) { console.error(`FIDELITY FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`FIDELITY GREEN: ${n}/${n} byte-identical.`);
    return;
  }
  if (process.env.SMOKE === '1') {
    const sseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65501]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = process.env.DAYS || '10';
    for (const policyId of POLICIES) {
      for (const seed of sseeds) {
        const r = await runOne(seed, policyId, { noWrite: true });
        const e = r.endStanding || {};
        console.log(`SMOKE ${policyId}/s${seed}: days=${r.gameDays} end=${r.endReason} samples=${r.samples.length} ` +
          `raw=${e.raw} war=${e.war} dip=${e.dip} plenty=${e.plenty} capped=${e.capped} ` +
          `sayLines=${(r.sayLines || []).length} hashes=${r.hashes.length}`);
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log('SMOKE GREEN.');
    return;
  }
  console.log(`standgate sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${daysNow()}`);
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await runOne(seed, policyId);
      const e = r.endStanding || {};
      console.log(`done ${policyId}/s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} won=${r.won} ` +
        `raw=${e.raw} war=${e.war} dip=${e.dip} plenty=${e.plenty} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
  }
  console.log('SWEEP COMPLETE.');
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}

module.exports = { runOne, baseFor, SEEDS };
