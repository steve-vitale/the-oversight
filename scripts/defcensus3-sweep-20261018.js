#!/usr/bin/env node
// defcensus3-sweep-20261018.js — READ-ONLY 3-substrate wave-4 readiness
// deferral census on CURRENT MASTER (flesh-out loop arm sim-defercensus2,
// 2026-10-18, scale-onramp axis). DIAGNOSTIC: no lever, no game-code change,
// no policy change — instruments + evidence only.
//
// Extends sim-defercensus2 (2026-10-18 0515Z, 16 runs, courtship substrate
// only) to the landed policy-layer compositions:
//   (a) courtship — pre-seat courtship baseline: plain TF.leadfeast /
//       TF.belongfeast (leadfeast/belongfeast, no driver). SEATDRIVE=0
//       explicit (method note, sim-villagevoice 2026-10-16: SEATDRIVE unset
//       != driver active; pre-seat runs set SEATDRIVE=0 explicitly).
//       VETREL / REPOSITION / NODEWITNESS unset.
//   (b) readiness — the landed readiness substrate: VETREL=1 (companion
//       veteran channel, 6377a6dc) + REPOSITION=1 (movement-kind execution,
//       d09bc3ac) + NODEWITNESS=1 (witness observation channel, game-code
//       flag in fieldFights.js). Composed as
//       withVetrel(withReposition(TF base)); SEATDRIVE=0 explicit.
//   (c) winseat — full win-side stack with the seat driver composed:
//       withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//       (method note: the driver is a composition wrapper — sweeps that
//       don't compose it run pre-seat). VETREL=1 REPOSITION=1 NODEWITNESS=1,
//       SEATDRIVE=1 explicit.
// All substrates share FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
// (+ WINPURSUIT=1 WINDEFER=1 set in-process; the windefer wrapper is only
// composed on winseat — on (a)/(b) the env is inert, exactly as the 0515Z
// corpus).
//
// Deferral-day method reused EXACTLY from scripts/wave4census-lib-20261017.js
// (sampleReadiness + attributeRun): deferral day = raw Standing >= t4 AND
// !ready AND peak < 4; binding = intersection of the engine's OWN `short`
// set over deferral days. Plus per run: wave-4 unlocks (maxWave), firstW4Day,
// and deferralArmorMargin = rd.armored - 4 at the LAST wave-4-unready day
// (the butcharmor metric, scripts/judge-butcharmor-20261018.js).
//
// Usage:
//   SUBSTRATE=courtship FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/defcensus3-sweep-20261018.js
//   SMOKE=1 ...            # short smoke: both policies drive, census live
//   DET=1 ...              # det-gate: instrument-on vs instrument-off byte-identical (4 seeds x substrate)
//   FIDELITY=1 ...         # fidelity: re-run completed runs, hashes+binding identical
// Targeted: SUBSTRATE=readiness SEEDS="51331,51342" ONLY="leadfeast;belongfeast"
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { sampleReadiness, attributeRun } = require('./wave4census-lib-20261017');

const SUBSTRATE = process.env.SUBSTRATE || 'courtship';
if (!['courtship', 'readiness', 'winseat'].includes(SUBSTRATE)) {
  console.error(`SWEEP STOP: SUBSTRATE must be courtship|readiness|winseat (got ${SUBSTRATE}).`);
  process.exit(2);
}
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
// Per-substrate env assertions (fail loud on composition drift).
const SUB_WANT = {
  courtship: { SEATDRIVE: '0', VETREL: 'unset', REPOSITION: 'unset', NODEWITNESS: 'unset' },
  readiness: { SEATDRIVE: '0', VETREL: '1', REPOSITION: '1', NODEWITNESS: '1' },
  winseat:   { SEATDRIVE: '1', VETREL: '1', REPOSITION: '1', NODEWITNESS: '1' },
};
for (const [k, want] of Object.entries(SUB_WANT[SUBSTRATE])) {
  const got = process.env[k];
  const ok = want === 'unset' ? (got !== '1') : (got === want);
  if (!ok) { console.error(`SWEEP STOP [${SUBSTRATE}]: ${k} must be ${want} (got ${got}).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [51331, 51342, 51353, 51364, 51375, 51386, 51397, 51408]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const T4 = 100;
const ARMOR_P = 15;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-defercensus2b');

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition per substrate. All wrappers gate on their own env and
// delegate byte-identically when off (pinned by each layer's proof) — the
// composition is policy-side only, zero src/js.
function policyFor(policyId) {
  const base = baseFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  if (SUBSTRATE === 'courtship') return base;
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION=1)`);
  const vet = VR.withVetrel(rp, `${tag}-vetrel-rp`, `${policyId} + reposition + VETREL (companion veteran channel)`);
  if (SUBSTRATE === 'readiness') return vet;
  const wd = WD.withWinDefer(vet, `${tag}-windefer`, `${policyId} + readiness + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1, explicit composition)`);
}

// Read-only per-villager armor piece census (same as defcensus-sweep-20261018:
// mirrors the engine's own armored accounting; deferral days only).
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
  } catch (e) { /* best-effort; errors counted by caller */ }
  return out;
}

function withDefcensus3(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._defc = { snaps: [], hashes: [], deferArmor: [], instrumentErrors: 0, censusErrors: 0,
        maxWave: 1, wave3Day: null, wave4Day: null, wave5Day: null,
        nationalDay: null, invites: 0, inviteDay: null, _wasWaiting: false,
        firstW4Day: null, lastUnready: null };
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
            const deferred = (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4;
            if (deferred) {
              try {
                const margin = armorMarginCensus(Game);
                C.deferArmor.push({ day: s.day | 0, raw: s.raw | 0, armored: s.armored | 0, margin });
              } catch (e) { C.censusErrors++; }
            }
          } catch (e) { C.instrumentErrors++; }
          // firstW4Day + lastUnready (butcharmor metric inputs) — pure reads.
          try {
            const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
            if (C.firstW4Day == null && typeof Game.unlockedWave === 'function' && Game.unlockedWave() >= 4) {
              C.firstW4Day = day;
            }
            if (C.firstW4Day == null && typeof Game.waveCombatReadiness === 'function') {
              const rd = Game.waveCombatReadiness(4);
              if (rd && !rd.ready) {
                C.lastUnready = { day, armored: rd.armored | 0, armed: rd.armed | 0,
                  tricks: rd.tricks | 0, veterans: rd.veterans | 0,
                  short: Array.isArray(rd.short) ? rd.short.slice() : [] };
              }
            }
          } catch (e) { C.instrumentErrors++; }
        }
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
  const policy = withDefcensus3(base, base.id + '-defcensus3', base.desc + ' [DEFCENSUS3]');
  const { Game } = await loadGame({ seed, mode: 'defcensus3', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  const days = opts.days || DAYS;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._defc) || { snaps: [], hashes: [], deferArmor: [], instrumentErrors: 0, censusErrors: 0,
    maxWave: 1, wave3Day: null, wave4Day: null, wave5Day: null, nationalDay: null, invites: 0, inviteDay: null,
    firstW4Day: null, lastUnready: null };
  const out = {
    seed, policyId, substrate: SUBSTRATE, mode: 'defcensus3',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    maxWave: C.maxWave | 0, wave3Day: C.wave3Day, wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    nationalDay: C.nationalDay, national: C.nationalDay != null ? 1 : 0,
    invites: C.invites | 0, inviteDay: C.inviteDay, table: (C.invites | 0) > 0 ? 1 : 0,
    deaths: (result.samples && result.samples.deaths) ? result.samples.deaths.length : 0,
    firstW4Day: C.firstW4Day,
    deferralArmorMargin: C.lastUnready ? (C.lastUnready.armored | 0) - 4 : null,
    deferralSnapshot: C.lastUnready,
    instrumentErrors: C.instrumentErrors, censusErrors: C.censusErrors,
    hashes: C.hashes, snaps: C.snaps, deferArmor: C.deferArmor,
  };
  if (!opts.noWrite) {
    fs.mkdirSync(EVID, { recursive: true });
    fs.writeFileSync(path.join(EVID, `${SUBSTRATE}-${policyId}-s${seed}.json`), JSON.stringify(out));
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
    const out = await oneRun(51331, policyId, { days: 15, noWrite: true });
    check(`[${SUBSTRATE}/${policyId}] run completes`, out.days >= 15, `days=${out.days}`);
    check(`[${SUBSTRATE}/${policyId}] snaps collected`, out.snaps.length > 0, `snaps=${out.snaps.length}`);
    check(`[${SUBSTRATE}/${policyId}] hashes collected`, out.hashes.length > 0, `hashes=${out.hashes.length}`);
    check(`[${SUBSTRATE}/${policyId}] 0 instrument errors`, out.instrumentErrors === 0, `err=${out.instrumentErrors}`);
    check(`[${SUBSTRATE}/${policyId}] attribution runs`, (() => { try { bindingOf(out); return true; } catch (e) { return false; } })(), '');
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log(`\nSMOKE GATE [${SUBSTRATE}]: both policies drive, census live, attribution runs.`);
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
  const seeds = [51331, 51342, 51353, 51364];
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
    console.log(`  [${SUBSTRATE}] seed ${seed}: plain-stable=${plainStable} census-stable=${censusStable} instrument-identical=${hP1 === hC1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE [${SUBSTRATE}]: ${green}/${total} identical.`);
  if (green < total) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// FIDELITY: re-run completed runs; byte-identical hashes => same binding
// bar on the same days. Compares against the written per-seed JSONs.
async function fidelityGate() {
  const pairs = [['leadfeast', 51331], ['belongfeast', 51342]];
  let green = 0;
  for (const [policyId, seed] of pairs) {
    const fp = path.join(EVID, `${SUBSTRATE}-${policyId}-s${seed}.json`);
    if (!fs.existsSync(fp)) { console.error(`FIDELITY STOP: ${fp} missing — run the sweep first.`); process.exit(5); }
    const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const rerun = await oneRun(seed, policyId, { noWrite: true });
    const hOrig = (orig.hashes || []).join('\n');
    const hNew = (rerun.hashes || []).join('\n');
    const bOrig = bindingOf(orig), bNew = bindingOf(rerun);
    const dOf = (o) => JSON.stringify((o.snaps || []).map(s => [s.day, (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4 ? 1 : 0, (s.short || []).slice().sort().join('+')]));
    const ok = hOrig === hNew && bOrig === bNew && dOf(orig) === dOf(rerun);
    if (ok) green++;
    console.log(`  [${SUBSTRATE}/${policyId} s${seed}] hashes-identical=${hOrig === hNew} binding=${bOrig}->${bNew} defer-classification-identical=${dOf(orig) === dOf(rerun)} ${ok ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`FIDELITY [${SUBSTRATE}]: ${green}/${pairs.length} reproduced byte-identical.`);
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
        console.log(`  [${SUBSTRATE}/${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won ? 1 : 0} w=${out.maxWave} nat=${out.national} binding=${b} deferArmorDays=${out.deferArmor.length} margin=${out.deferralArmorMargin} ierr=${out.instrumentErrors}`);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log(`\nSWEEP DONE [${SUBSTRATE}] — per-seed JSONs in evidence/2026-10-18/perseed-defercensus2b/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withDefcensus3, armorMarginCensus, oneRun, bindingOf, policyFor, baseFor, SEEDS, POLICIES, T4, ARMOR_P, SUBSTRATE };
