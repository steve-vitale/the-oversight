#!/usr/bin/env node
// scripts/sweep-hvstop2-20261017.js — scholar harvest stand-down pilot sweep
// (sim-hvstop2-b, 2026-10-17, food-economy axis; §14 escape-hatch re-run of
// the killed sim-harvstop-b arm with a corrected pre-registration).
//
// control: leadfeast / belongfeast (the FEASTSCALE_R13=1 substrate, no layer)
// armed:   hvlead / hvbelong (HVSTOP2=1 — scholar surplus-forage stand-down,
//   the scholar-side complement to the engine's PRODTHROTTLE: same pin gate
//   (pantryFreshDays() > 4, hunger-exempt) + hot trailing-7d flow
//   (>= 2x trailing-7d burn), surplus-only (scholar topped up))
//
// 8 FRESH seeds 4501-4508 x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds both sides. Own control in the
// SAME sweep (#247 — never inherit a baseline).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). Banned-seed check: SWEEP STOPS if any seed is banned.
// Banned/used sets: 4201-4208 (wallcensus), 4301-4308 (wasterate),
// 4401-4408 (harvstop pilot).
//
// Pre-registered GO (binding, MEASUREMENT §§9-12, 14 — see
// evidence/2026-10-17/sim-hvstop2-b.md):
//   VOLUME-SANITY (pre-pilot): max-theoretical attributable rot reduction
//     >= required delta, else the primary is NO-COVERAGE and this sweep
//     does not run.
//   PRIMARY: PAIRED-MEDIAN waste-rate ratio (armed/control per-seed) <= 0.85x.
//     (Aggregate ratio is secondary; the old arm's metric review showed the
//     aggregate is noisy on heterogeneous pairs.)
//   SECONDARY: aggregate rot-per-pantry-kcal ratio <= 0.85x.
//     rot = fresh rot, pantry + pack (trig6 instrument convention);
//     pantry-kcal = per-day pantry kcal summed over the run.
//   COVERAGE GATE: stand-down days > 0 on >= 6/8 seeds, else no-coverage
//     diagnostic (not a kill).
//   MECHANISM-ENGAGEMENT (vacuous-pass protection): (a) stand-down days
//     >= 20 armed-side; (b) declined forage verbs >= 20 armed-side;
//     (c) pin-days and hot-flow-days counted separately. Mechanism never
//     engages => KILL, not GO.
//   GUARDRAILS: starvation <= control+1; national >= control-2;
//     median survival >= control-10d; no new death mode;
//     dehydration <= control+1; wins 0=0 both sides (pre-seat);
//     exiled 0 both sides.
//   HETEROGENEITY LENS: report max per-seed starvation delta
//     (armed-control); scholar harvest kcal left wild per run (info).
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (the schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-hvstop2-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-hvstop2-20261017.js
// Targeted re-runs: SEEDS="4501,4502" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
process.env.LEANWINTER_LIB = '1';
const LW = require('./sweep-leanwinter-20261017');
let HS = null;
try { HS = require('./policies/hvstop2'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    // KILL-PROTOCOL INFO-SKIP (2026-10-17): the hvstop2 layer was deleted
    // per kill protocol (pilot NO-GO); the retained sweep skips cleanly.
    console.log('INFO-SKIP: hvstop2 layer absent (killed at pilot) — nothing to sweep.');
    process.exit(0);
  }
  throw e;
}
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

// ---- banned-seed check (the coordinator's list; sweep stops on any hit) ----
const BANNED = new Set();
try {
  const f = path.join(__dirname, '..', 'hidden_files', 'banned-seeds.txt');
  if (fs.existsSync(f)) for (const l of fs.readFileSync(f, 'utf8').split('\n')) { const s = l.trim(); if (s && !s.startsWith('#')) BANNED.add(parseInt(s, 10)); }
} catch (e) {}
const SEEDS = (process.env.SEEDS || '4501,4502,4503,4504,4505,4506,4507,4508').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
for (const s of SEEDS) if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is banned.`); process.exit(2); }
console.log(`seeds: ${SEEDS.join(',')} (banned-check clean)`);

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-hvstop2');
try { fs.mkdirSync(OUTDIR, { recursive: true }); } catch (e) {}

function gday(G) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(G) {
  try { return ((G.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function alivePop(G) { try { return ((G.state.village || {}).roster || []).filter(id => { try { const p = G.getPerson(id); return p && !p.dead; } catch (e) { return true; } }).length; } catch (e) { return 0; } }

// layer-beat capture: the stand-down voice lines (sense-testing reads these)
// Beat capture: the layer's stand-down voice lines (sense-testing reads
// these). The regex matches ALL FOUR rotation frames — each frame has a
// distinct signature ("shelves are pinned" / "check the pantry before
// heading out" / "Full shelves" / "pantry's pinned"). The engine's
// PRODTHROTTLE beat ("the shelves are full… leaves the forage standing…
// the wild will keep") matches none of these — the old harvstop regex
// matched the engine's copy and contaminated the capture.
const HS_BEAT_RE = /shelves are pinned|check the pantry before heading out|Full shelves|pantry's pinned/i;
function attachLayerBeats(Game, beats) {
  beats.lines = [];
  const push = (msg) => { try { if (msg && HS_BEAT_RE.test(String(msg))) beats.lines.push(`d${gday(Game)}: ${String(msg).slice(0, 220)}`); } catch (e) {} };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys ? origSys(msg) : msg; };
}

// fresh-rot instrument (trig6 convention): snapshot spoiled FRESH kcal just
// before the engine's sweep runs — scholar inventory + prepStash + pantry.
function attachRot(Game, t) {
  t.freshRotKcal = 0; t.freshRotItems = 0;
  const orig = Game.sweepSpoiled ? Game.sweepSpoiled.bind(Game) : null;
  if (!orig) return;
  const isSpoiled = Game.isSpoiled ? Game.isSpoiled.bind(Game) : null;
  Game.sweepSpoiled = function () {
    try {
      const scan = (arr) => {
        for (const it of (arr || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') continue;
          let spoiled = false;
          try { spoiled = isSpoiled ? !!isSpoiled(it) : false; } catch (e) {}
          if (spoiled) {
            t.freshRotKcal += Math.round((it.kcalEach || 0) * (it.units || 1));
            t.freshRotItems++;
          }
        }
      };
      scan((Game.state.scholar || {}).inventory);
      try {
        const ps = Game.prepStash ? Game.prepStash() : null;
        if (ps && ps !== Game.state.scholar.inventory) scan(ps);
      } catch (e) {}
      scan((Game.state.village || {}).pantry);
    } catch (e) {}
    return orig.apply(this, arguments);
  };
}

function policyFor(policyId, side) {
  const armed = side === 'armed';
  if (policyId === 'leadfeast') return armed ? HS.hvlead : leadfeast;
  return armed ? HS.hvbelong : belongfeast;
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('hvstop2 layer loads', !!HS.hvlead && !!HS.hvbelong, `ids=${HS.hvlead.id},${HS.hvbelong.id}`);
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.HVSTOP2 = '1'; else delete process.env.HVSTOP2;
    const { Game } = await loadGame({ seed: 4501, mode: `hvstop2-smoke-${side}` });
    await setupGame(Game);
    const base = policyFor('belongfeast', side);
    let runCtx = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    const wantId = side === 'armed' ? 'hvbelong' : 'belongfeast';
    const r = await quietLog(async () => runDays(Game, pol, { days: 20, sampleEvery: 20 }));
    const live = side === 'armed' ? (base.id === wantId && runCtx && typeof runCtx.hvPinDays === 'number') : (base.id === wantId);
    check(`${side}: layer-live markers honest`, !!live, `id=${base.id}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  delete process.env.HVSTOP2;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.HVSTOP2 = '1'; else delete process.env.HVSTOP2;
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 4501, mode: `hvstop2-det-${side}` });
      await setupGame(Game);
      const base = policyFor('leadfeast', side);
      const hashes = [];
      const pol = Object.assign({}, base);
      const oDaily = base.daily;
      pol.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
        return oDaily ? oDaily(G, ctx) : undefined;
      };
      await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 1 }); });
      runs.push(hashes);
    }
    const same = runs[0].length === runs[1].length && runs[0].every((h, i) => h === runs[1][i]);
    console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate (${side}): 40d rerun byte-identical — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
  }
  delete process.env.HVSTOP2;
  console.log('DET gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.HVSTOP2 = '1'; else delete process.env.HVSTOP2;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `hvstop2-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0, maxArc: 1, maxWave: 1, pantryKcalDays: 0, dayCount: 0 };
  const inst = {};
  LW.attachDeathInstrument(Game, inst);
  LW.attachFoodInstruments(Game, inst);
  const beats = {};
  attachLayerBeats(Game, beats);
  const rot = {};
  attachRot(Game, rot);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      hist.villagerDays += alivePop(G);
      hist.pantryKcalDays += pantryKcal(G);
      hist.dayCount++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) {}
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  const out = {
    seed, policy: policyId, side,
    gameDays: result && result.days, endReason: result && (result.endReason || result.ended),
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0, wins: 0,
    exiled: hist.exiled ? 1 : 0,
    arc: hist.maxArc, maxWave: hist.maxWave,
    starvation: 0, dehydration: 0,
    freshRotKcal: rot.freshRotKcal || 0, freshRotItems: rot.freshRotItems || 0,
    pantryKcalDays: Math.round(hist.pantryKcalDays), dayCount: hist.dayCount,
    rotPerPantryKcal: hist.pantryKcalDays > 0 ? +((rot.freshRotKcal || 0) / hist.pantryKcalDays).toFixed(5) : 0,
    hvStandDowns: (runCtx && runCtx.hvStandDowns) || 0,
    hvDeclined: (runCtx && runCtx.hvDeclined) || 0,
    hvPinDays: (runCtx && runCtx.hvPinDays) || 0,
    hvHotDays: (runCtx && runCtx.hvHotDays) || 0,
    hvBeats: (beats.lines || []).slice(0, 12),
    villagerDays: Math.round(hist.villagerDays),
  };
  try {
    for (const d of (inst.deaths || [])) {
      const c = String(d.class || d.cause || '');
      if (/STARVATION/i.test(c)) out.starvation++;
      if (/DEHYDRATION|WATER/i.test(c)) out.dehydration++;
    }
  } catch (e) {}
  const fp = path.join(OUTDIR, `${side}-${policyId}-s${seed}.json`);
  try { fs.writeFileSync(fp, JSON.stringify(out, null, 1)); } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starv=${out.starvation} dehydr=${out.dehydration} nat=${out.national} wave=${out.maxWave} table=${out.table} rot=${Math.round(out.freshRotKcal / 1000)}k rate=${out.rotPerPantryKcal} pkd=${Math.round(out.pantryKcalDays / 1000)}k sd=${out.hvStandDowns} decl=${out.hvDeclined} pin=${out.hvPinDays} hot=${out.hvHotDays}`);
  return out;
}

(async () => {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  await detGate(); // bit-identical reruns both sides before any pilot spend
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(';').map(s => s.trim()).filter(Boolean)) : null;
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of ['belongfeast', 'leadfeast']) {
      for (const side of ['control', 'armed']) {
        if (only && !only.has(`${policyId},${side}`)) continue;
        try { results.push(await oneRun(seed, policyId, side)); }
        catch (e) { console.log(`  [${side} ${policyId} s${seed}] ERROR ${String(e && e.message).slice(0, 140)}`); }
      }
    }
  }
  delete process.env.HVSTOP2;
  // ---- summary ----
  const sum = (rs, k) => rs.reduce((a, r) => a + (r[k] || 0), 0);
  const med = (rs, k) => { const v = rs.map(r => r[k] || 0).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; };
  for (const side of ['control', 'armed']) {
    const rs = results.filter(r => r.side === side);
    if (!rs.length) continue;
    const rot = sum(rs, 'freshRotKcal'), pkd = sum(rs, 'pantryKcalDays');
    console.log(`\n== ${side} (n=${rs.length}) ==`);
    console.log(`  freshRot=${Math.round(rot / 1000)}k pantryKcalDays=${Math.round(pkd / 1000)}k rotPerPantryKcal=${pkd ? (rot / pkd).toFixed(5) : 0}`);
    console.log(`  starvation=${sum(rs, 'starvation')} dehydration=${sum(rs, 'dehydration')} national=${sum(rs, 'national')} table=${sum(rs, 'table')} exiled=${sum(rs, 'exiled')}`);
    console.log(`  medSurvival=${med(rs, 'gameDays')} maxWave=${Math.max(...rs.map(r => r.maxWave || 1))} arc>=3: ${rs.filter(r => r.arc >= 3).length}`);
    if (side === 'armed') console.log(`  standDowns=${sum(rs, 'hvStandDowns')} declined=${sum(rs, 'hvDeclined')} pinDays=${sum(rs, 'hvPinDays')} hotDays=${sum(rs, 'hvHotDays')}`);
  }
  const rc = results.filter(r => r.side === 'control'), ra = results.filter(r => r.side === 'armed');
  if (rc.length && ra.length) {
    const rate = (rs) => { const rot = sum(rs, 'freshRotKcal'), pkd = sum(rs, 'pantryKcalDays'); return pkd ? rot / pkd : 0; };
    const aggRatio = rate(ra) / Math.max(1e-9, rate(rc));
    console.log(`\nSECONDARY aggregate rot-per-pantry-kcal: control=${rate(rc).toFixed(5)} armed=${rate(ra).toFixed(5)} ratio=${aggRatio.toFixed(3)} (GO needs <= 0.85)`);
    // PRIMARY: paired-median waste-rate ratio (armed/control per identical
    // seed+policy pair). Heterogeneity-aware: the aggregate is noisy when
    // pantries shrink or trajectories diverge (harvstop-b metric review).
    const pairs = [];
    for (const a of ra) {
      const c = rc.find(r => r.seed === a.seed && r.policy === a.policy);
      if (!c) continue;
      const cr = c.rotPerPantryKcal || 0, ar = a.rotPerPantryKcal || 0;
      const ratio = cr > 0 ? ar / cr : (ar > 0 ? 2 : 1);
      pairs.push({ seed: a.seed, policy: a.policy, control: +cr.toFixed(5), armed: +ar.toFixed(5), ratio: +ratio.toFixed(3), starvDelta: (a.starvation || 0) - (c.starvation || 0) });
    }
    pairs.sort((x, y) => x.ratio - y.ratio);
    // Proper statistical median (mean of the two middle values for even n).
    const med = pairs.length
      ? (pairs[Math.floor((pairs.length - 1) / 2)].ratio + pairs[Math.floor(pairs.length / 2)].ratio) / 2
      : 0;
    console.log(`PRIMARY paired-median waste-rate ratio: median=${med.toFixed(3)} over ${pairs.length} pairs (GO needs <= 0.85)`);
    console.log('  paired ratios: ' + pairs.map(p => `${p.seed}-${p.policy.slice(0, 4)}:${p.ratio.toFixed(2)}`).join(' '));
    const maxStarvDelta = pairs.length ? Math.max(...pairs.map(p => p.starvDelta)) : 0;
    console.log(`  heterogeneity lens: max per-seed starvation delta (armed-control) = ${maxStarvDelta}`);
    // coverage gate: stand-down days > 0 on >= 6/8 seeds
    const seedsWithSD = new Set(ra.filter(r => (r.hvStandDowns || 0) > 0).map(r => r.seed));
    console.log(`  coverage: ${seedsWithSD.size}/8 seeds with stand-down days > 0 (gate needs >= 6)`);
    // guardrails
    const gStarv = sum(ra, 'starvation') <= sum(rc, 'starvation') + 1;
    const gNat = sum(ra, 'national') >= sum(rc, 'national') - 2;
    const gMed = med2(ra) >= med2(rc) - 10;
    const gDehy = sum(ra, 'dehydration') <= sum(rc, 'dehydration') + 1;
    console.log(`  guardrails: starvation ${gStarv ? 'PASS' : 'FAIL'} (${sum(ra, 'starvation')} <= ${sum(rc, 'starvation')}+1), national ${gNat ? 'PASS' : 'FAIL'} (${sum(ra, 'national')} >= ${sum(rc, 'national')}-2), medSurvival ${gMed ? 'PASS' : 'FAIL'} (${med2(ra)} >= ${med2(rc)}-10), dehydration ${gDehy ? 'PASS' : 'FAIL'}`);
  }
  function med2(rs) { const v = rs.map(r => r.gameDays || 0).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : 0; }
})();
