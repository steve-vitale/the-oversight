#!/usr/bin/env node
// defcensus-sweep-20261018.js — READ-ONLY wave-4 readiness deferral census on
// CURRENT MASTER (flesh-out loop arm sim-defercensus2, 2026-10-18, run
// fleshout-20261018T0515Z, scale-onramp axis). DIAGNOSTIC: no lever, no
// game-code change, no policy change — instruments + evidence only.
//
// Refresh of sim-wave4census (2026-10-17) on the PRE-SEAT courtship road:
// 8 fresh seeds x {leadfeast, belongfeast} = 16 runs, 180d death-aware.
// Deferral-day classification method reused EXACTLY from
// scripts/wave4census-lib-20261017.js (sampleReadiness + attributeRun):
//   deferral day = raw Standing >= t4 AND !ready AND peak < 4
//     (mirrors the defer4 hold in villageStandingTotal(), src/js/standing.js)
//   binding = intersection of the engine's OWN `short` set over deferral days
//     (single bar | multi:a+b | none-single | standing | unlocked).
// Gate code verified unchanged since the census (standing.js
// waveCombatReadiness/waveUnlockReady byte-identical in behavior; VETSHAPE
// default OFF => pristine 2-living-veterans). Post-census game-code landings
// (crisistier 9a76cc6e: read-only; witnesource 3e6b44d1: exposure layer,
// witness/ledger only — no readiness inputs; fieldfeast kill 95ecbb07:
// read-only) do not touch the readiness gate.
//
// Substrate (pre-seat courtship road — the presubstrate 9a76cc6e composition):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
//   SEATDRIVE / WAVE5REACH / W3DRIVE / VETREL / VETSHAPE / ALLOWGATE2 unset
//   (asserted). Policies: TF.leadfeast / TF.belongfeast (scripts/policies/
//   tribfloor base ids, plain — no wrappers).
//
// The instrument: once per day, two engine readers + one state read, zero
// writes, zero RNG draws: Game.villageStanding(), Game.waveUnlockReady(4),
// state._standingPeakWave (scripts/wave4census-lib-20261017.js
// sampleReadiness). PLUS, on deferral days only, a read-only per-villager
// armor piece census (equipment.armorOf / armorBonus per living villager,
// equipped item ids per body slot) — for the SECONDARY armor-source
// breakdown (which sources feed the P>=15 margin: gen/spawn, craft,
// salvage, godpath, orphan).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/defcensus-sweep-20261018.js
//   SMOKE=1 ...   # short smoke: both policies drive, census live
//   DET=1 ...     # det-gate: instrument-on vs instrument-off byte-identical
//   FIDELITY=1 ...# fidelity: re-run 2 completed runs, hashes+binding identical
// Targeted: SEEDS="41131,41142" ONLY="leadfeast;belongfeast"
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { sampleReadiness, attributeRun } = require('./wave4census-lib-20261017');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['SEATDRIVE', 'WAVE5REACH', 'W3DRIVE', 'VETREL', 'VETSHAPE', 'ALLOWGATE2']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [41131, 41142, 41153, 41164, 41175, 41186, 41197, 41208]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const T4 = 100;
const ARMOR_P = 15;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-defercensus2');

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

// Read-only per-villager armor piece census. Mirrors the engine's own
// armored accounting (standing.js waveCombatReadiness: S.equipment.armorOf
// for villagers, Game.armorBonus() for the scholar). Returns only villagers
// meeting the P>=15 demand (the margin), with equipped piece ids per slot.
function armorMarginCensus(Game) {
  const out = [];
  try {
    const S = globalThis.Scattering || {};
    const eq = S.equipment || null;
    const itemDefs = (Game.data && Game.data.items) || [];
    const BODY = (eq && eq.BODY_SLOTS) || ['head', 'torso', 'legs', 'hands', 'shoes'];
    const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
    const scholarId = Game.villagerId;
    const vpOf = (vid) => { try { return (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; } catch (e) { return null; } };
    const nameOf = (vid) => { try { return String(Game.displayName ? Game.displayName(vid) : vid).split(' ')[0]; } catch (e) { return String(vid); } };
    for (const vid of roster) {
      let P = 0, pieces = {}, isScholar = vid === scholarId;
      try {
        if (isScholar) {
          P = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : 0;
          const eqt = (Game.state && Game.state.scholar && Game.state.scholar.equipped) || {};
          for (const s of BODY) { const e = eqt[s]; if (e) pieces[s] = (typeof e === 'string') ? e : (e.itemId || e.id || '?'); }
        } else {
          const vp = vpOf(vid);
          if (!vp || vp.dead) continue;
          P = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) | 0) : 0;
          const eqt = (vp && vp.equipped) || {};
          for (const s of BODY) { const e = eqt[s]; if (e) pieces[s] = (typeof e === 'string') ? e : (e.itemId || e.id || '?'); }
        }
      } catch (e) { continue; }
      if (P >= ARMOR_P) out.push({ vid: String(vid), name: nameOf(vid), scholar: isScholar, P, pieces });
    }
  } catch (e) { /* census best-effort; errors counted by caller */ }
  return out;
}

function withDefcensus(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._defc = { snaps: [], hashes: [], deferArmor: [], instrumentErrors: 0, censusErrors: 0,
        maxWave: 1, wave3Day: null, wave4Day: null, wave5Day: null,
        nationalDay: null, invites: 0, inviteDay: null, _wasWaiting: false };
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      const C = ctx._defc;
      const oDaily = base.daily;
      let r;
      try { r = oDaily ? oDaily(Game, ctx) : undefined; } catch (e) { r = undefined; }
      if (C) {
        try { C.hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); } catch (e) {}
        const instrumented = process.env.DEFCENSUS_BARE !== '1';
        if (instrumented) {
          try {
            const s = sampleReadiness(Game);
            C.instrumentErrors += (s.err | 0);
            C.snaps.push(s);
            // Deferral-day armor margin census (mirrors attributeRun's
            // deferral predicate exactly: raw>=t4 && !ready && peak<4).
            const deferred = (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4;
            if (deferred) {
              try {
                const margin = armorMarginCensus(Game);
                C.deferArmor.push({ day: s.day | 0, raw: s.raw | 0, armored: s.armored | 0, margin });
              } catch (e) { C.censusErrors++; }
            }
          } catch (e) { C.instrumentErrors++; }
        }
        // Wall-number rising edges (pure reads; finding #360: no engine
        // telemetry fires on wave unlock — sample unlockedWave() daily).
        try {
          const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
          const w = Game.unlockedWave ? Game.unlockedWave() : 1;
          if (w > C.maxWave) C.maxWave = w;
          if (w >= 3 && C.wave3Day == null) C.wave3Day = day;
          if (w >= 4 && C.wave4Day == null) C.wave4Day = day;
          if (w >= 5 && C.wave5Day == null) C.wave5Day = day;
          const rank = Game.scaleRank ? Game.scaleRank() : 'village';
          if ((rank === 'national' || rank === 'global') && C.nationalDay == null) C.nationalDay = day;
          const pg = Game.progState ? Game.progState() : null;
          if (pg) {
            if (pg.tableWaiting && !C._wasWaiting) { C.invites++; if (C.inviteDay == null) C.inviteDay = day; }
            C._wasWaiting = !!pg.tableWaiting;
          }
        } catch (e) { C.instrumentErrors++; }
      }
      return r;
    },
  });
}

async function oneRun(seed, policyId, opts) {
  opts = opts || {};
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const policy = withDefcensus(base, base.id + '-defcensus', base.desc + ' [DEFCENSUS2]');
  const { Game } = await loadGame({ seed, mode: 'defcensus2', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  const days = opts.days || DAYS;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._defc) || { snaps: [], hashes: [], deferArmor: [], instrumentErrors: 0, censusErrors: 0,
    maxWave: 1, wave3Day: null, wave4Day: null, wave5Day: null, nationalDay: null, invites: 0, inviteDay: null };
  const out = {
    seed, policyId, mode: 'defcensus2',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    maxWave: C.maxWave | 0, wave3Day: C.wave3Day, wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    nationalDay: C.nationalDay, national: C.nationalDay != null ? 1 : 0,
    invites: C.invites | 0, inviteDay: C.inviteDay, table: (C.invites | 0) > 0 ? 1 : 0,
    deaths: (result.samples && result.samples.deaths) ? result.samples.deaths.length : 0,
    instrumentErrors: C.instrumentErrors, censusErrors: C.censusErrors,
    hashes: C.hashes, snaps: C.snaps, deferArmor: C.deferArmor,
  };
  if (!opts.noWrite) {
    fs.mkdirSync(EVID, { recursive: true });
    fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  }
  return out;
}

function bindingOf(out) {
  return attributeRun(out.snaps, { t4: T4 }).binding;
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    const out = await oneRun(41131, policyId, { days: 15, noWrite: true });
    check(`[${policyId}] run completes`, out.days >= 15, `days=${out.days}`);
    check(`[${policyId}] snaps collected`, out.snaps.length > 0, `snaps=${out.snaps.length}`);
    check(`[${policyId}] hashes collected`, out.hashes.length > 0, `hashes=${out.hashes.length}`);
    check(`[${policyId}] 0 instrument errors`, out.instrumentErrors === 0, `err=${out.instrumentErrors}`);
    check(`[${policyId}] attribution runs`, (() => { try { bindingOf(out); return true; } catch (e) { return false; } })(), '');
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both policies drive, census live, attribution runs.');
}

async function runHashes(policyId, seed, days, bare) {
  if (bare) process.env.DEFCENSUS_BARE = '1'; else delete process.env.DEFCENSUS_BARE;
  const out = await oneRun(seed, policyId, { days, noWrite: true });
  delete process.env.DEFCENSUS_BARE;
  return out;
}

// DET-GATE: instrument-on vs instrument-off trajectory-identical, 4 seeds.
// Both-repeat: [plain, plain] and [census, census] distinguish a real leak
// from seed nondeterminism.
async function detGate() {
  const seeds = [41131, 41142, 41153, 41164];
  const days = 60;
  let green = 0, total = 0;
  for (const seed of seeds) {
    const hP1 = (await runHashes('leadfeast', seed, days, true)).hashes.join('\n');
    const hP2 = (await runHashes('leadfeast', seed, days, true)).hashes.join('\n');
    const hC1 = (await runHashes('leadfeast', seed, days, false)).hashes.join('\n');
    const hC2 = (await runHashes('leadfeast', seed, days, false)).hashes.join('\n');
    const plainStable = hP1 === hP2;
    const censusStable = hC1 === hC2;
    const identical = plainStable && censusStable && hP1 === hC1;
    total++;
    if (identical) green++;
    console.log(`  seed ${seed}: plain-stable=${plainStable} census-stable=${censusStable} instrument-identical=${hP1 === hC1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE: ${green}/${total} identical.`);
  if (green < total) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// FIDELITY: re-run 2 completed runs; byte-identical hashes => same binding
// bar on the same days. Compares against the written per-seed JSONs.
async function fidelityGate() {
  const pairs = [['leadfeast', 41131], ['belongfeast', 41142]];
  let green = 0;
  for (const [policyId, seed] of pairs) {
    const fp = path.join(EVID, `${policyId}-s${seed}.json`);
    if (!fs.existsSync(fp)) { console.error(`FIDELITY STOP: ${fp} missing — run the sweep first.`); process.exit(5); }
    const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const rerun = await oneRun(seed, policyId, { noWrite: true });
    const hOrig = (orig.hashes || []).join('\n');
    const hNew = (rerun.hashes || []).join('\n');
    const bOrig = bindingOf(orig), bNew = bindingOf(rerun);
    const dOrig = JSON.stringify((orig.snaps || []).map(s => [s.day, (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4 ? 1 : 0, (s.short || []).slice().sort().join('+')]));
    const dNew = JSON.stringify((rerun.snaps || []).map(s => [s.day, (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4 ? 1 : 0, (s.short || []).slice().sort().join('+')]));
    const ok = hOrig === hNew && bOrig === bNew && dOrig === dNew;
    if (ok) green++;
    console.log(`  [${policyId} s${seed}] hashes-identical=${hOrig === hNew} binding=${bOrig}->${bNew} defer-classification-identical=${dOrig === dNew} ${ok ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`FIDELITY: ${green}/${pairs.length} reproduced byte-identical.`);
  if (green < pairs.length) { console.error('FIDELITY FAILED — seeded determinism broken.'); process.exit(6); }
  console.log('FIDELITY gate green.');
}

(async () => {
  if (require.main !== module) return;
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) { const p = part.trim(); if (p) only[p] = true; }
  }
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  else if (process.env.FIDELITY === '1') await fidelityGate();
  else {
    for (const policyId of POLICIES) {
      if (only && !only[policyId]) continue;
      for (const seed of SEEDS) {
        const out = await oneRun(seed, policyId);
        let b = '?';
        try { b = bindingOf(out); } catch (e) { b = 'ERR:' + e.message; }
        console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won ? 1 : 0} w=${out.maxWave} nat=${out.national} binding=${b} deferArmorDays=${out.deferArmor.length} ierr=${out.instrumentErrors}`);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-18/perseed-defercensus2/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withDefcensus, armorMarginCensus, oneRun, bindingOf, policyFor, SEEDS, POLICIES, T4, ARMOR_P };
