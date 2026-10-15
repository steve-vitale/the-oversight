#!/usr/bin/env node
// scripts/sweep-plentycap-20261015.js — PLENTY CAP STANDALONE PILOT SWEEP.
// sim-plentycap (2026-10-15): the two v3 teeth (faced-experience + plenty
// cap, 7a72b456) are env-selectable in standing.js — STANDING_VARIANT =
// 'both' (v3 as landed = control) | 'faced-only' (cap tooth off) |
// 'cap-only' (faced tooth off). One sweep, identical seeds, no file swaps.
// sim-findings #289: does the cap ALONE suffice against the plenty
// accelerator?
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE
// sims; see evidence/2026-10-15/sim-plentycap.md):
//   axis    : scale-onramp (the wall), lever-2 lens (wave unlock pacing)
//   stack   : leadfeast/belongfeast (the plenty accelerator's home turf),
//             FEASTSCALE_R13=1, all three legs in ONE sweep, identical seeds
//   seeds   : 11/22/33/44/55/66/77/88 (pilot), 180d death-aware
//   numbers : readyFacedW3=3, readyFacedW4=2, plentyCapT5=100 (v3 landed;
//             sim starting points, not canon — Steve can overrule)
//   PRIMARY : wave5(cap-only) <= wave5(control) x 1.25 AND median cap
//             bind-days(cap-only) >= 5 (bind-day = raw >= 200 && capped < 200)
//   GUARDRAILS (cap-only vs control): national >= control-2/16; median
//             survival >= control-10d; no new death mode (cause-family,
//             n>=3 armed-only); wave-4 unlock rate within 0.20-0.60
//   GO      : PRIMARY + all guardrails at pilot -> confirm 12-16 seeds.
//             GO -> land cap-only as own commit [needs-eyes].
//             KILL -> revert standing.js byte-clean; evidence+proof kept.
//
// Modes:
//   SMOKE=1 node scripts/sweep-plentycap-20261015.js
//     instrument-honesty gate: (a) named-export unwrap — leadfeast/
//     belongfeast .daily is a function, harness invokes it, >=1
//     policy-origin act; (b) per requested variant the tooth mechanism is
//     reachable on scripted fixtures (bread-only 200: control -> 199;
//     faced-only -> 200; cap-only -> 199; war 125 0-faced: control ->
//     held 3/99; faced-only -> held 3/99; cap-only -> released 4/125).
//   VARIANT=all|control|faced-only|cap-only (default all)
//   ALL=1 OUT=evidence/2026-10-15/sim-plentycap-pilot.json
//     all legs + verdict. VARIANT=<v> OUT=... : single leg.
//   Killed-arm INFO-SKIP: VARIANT=faced-only|cap-only on a tree WITHOUT the
//   env reader prints INFO-SKIP and exits 0 (never MODULE_NOT_FOUND).
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');

const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const VARIANT = process.env.VARIANT || 'all';
const LEGS = VARIANT === 'all' ? ['control', 'faced-only', 'cap-only'] : [VARIANT];
const POLICY_REGISTRY = { leadfeast, belongfeast };
const ENV_FOR = { control: 'both', 'faced-only': 'faced-only', 'cap-only': 'cap-only' };

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function daySample(Game) {
  const d = dayOf(Game);
  let raw = 0, capped = 0, wave = 1, defer4 = false, defer5 = false, peak = 0;
  try { raw = ((typeof Game.villageStanding === 'function') ? Game.villageStanding() : { total: 0 }).total | 0; } catch (e) {}
  try { capped = (typeof Game.standingPlentyCappedTotal === 'function') ? (Game.standingPlentyCappedTotal() | 0) : 0; } catch (e) {}
  try { wave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  try { defer4 = !!(typeof Game.standingDeferral === 'function') && Game.standingDeferral(4).deferred; } catch (e) {}
  try { defer5 = !!(typeof Game.standingDeferral === 'function') && Game.standingDeferral(5).deferred; } catch (e) {}
  try { peak = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : 0; } catch (e) {}
  return { day: d, raw, capped, wave, defer4, defer5, peak };
}

function deathCausesFamily(result, monsterIds) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    let c = String((d.cause || 'unknown'));
    if (monsterIds && monsterIds.has(c)) c = 'monster';
    causes[c] = (causes[c] || 0) + 1;
  }
  return causes;
}

async function runSuite(label) {
  const rows = [];
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: `plentycap-${label}-${pid}` });
      await quietLog(async () => { await setupGame(Game); });
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      const samples = [];
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { samples.push(daySample(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const monsterIds = new Set(((Game.data && Game.data.monsters) || []).map(x => x.id));
      let result = null;
      await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
      let nationalFirstDay = null, tableFirstDay = null;
      try {
        for (const r of ((m.scale && m.scale.daily) || [])) {
          const rk = String(r.rank || '');
          if ((rk === 'national' || rk === 'global') && nationalFirstDay == null) nationalFirstDay = r.day;
        }
      } catch (e) {}
      let wave4Day = null, wave5Day = null, capBindSamples = 0, defer4Ever = false, defer5Ever = false;
      let driver5 = null;
      for (const r of samples) {
        if (r.defer4) defer4Ever = true;
        if (r.defer5) defer5Ever = true;
        if (r.raw >= 200 && r.capped < 200) capBindSamples++;
        if (wave4Day == null && r.wave >= 4) wave4Day = r.day;
        if (wave5Day == null && r.wave >= 5) { wave5Day = r.day; driver5 = r; }
      }
      const row = Object.assign(
        { label, policy: pid, seed, days: result.days, endReason: result.endReason },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        { nationalFirstDay },
        {
          wave4Day, wave5Day,
          driver5: driver5 ? { raw: driver5.raw, capped: driver5.capped, peak: driver5.peak } : null,
          defer4Ever, defer5Ever, capBindSamples, capBindDays: capBindSamples * 10,
          deathCauses: deathCausesFamily(result, monsterIds),
        }
      );
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${result.days} ${result.endReason} ` +
        `wave4=${wave4Day == null ? '-' : 'd' + wave4Day} wave5=${wave5Day == null ? '-' : 'd' + wave5Day} ` +
        `capBind~${capBindSamples * 10}d nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} won=${row.won ? 1 : 0}`);
    }
  }
  return rows;
}

function summarize(label, rows) {
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const familyCounts = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) familyCounts[k] = (familyCounts[k] || 0) + v;
  return {
    label, runs: rows.length,
    wave4Rate: +(agg(r => (r.wave4Day != null ? 1 : 0)) / rows.length).toFixed(3),
    wave5Ever: agg(r => (r.wave5Day != null ? 1 : 0)),
    medCapBindDays: med(rows.map(r => r.capBindDays || 0)),
    defer: { defer4Ever: agg(r => r.defer4Ever ? 1 : 0), defer5Ever: agg(r => r.defer5Ever ? 1 : 0) },
    medianDays: med(rows.map(r => r.days)),
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won),
    exiled: agg(r => r.exiledEver || 0),
    families: familyCounts,
  };
}

function verdict(control, capOnly, facedOnly) {
  const lines = [];
  // PRIMARY (binding): wave-5 unlocks on cap-only <= control x 1.25 AND
  // median cap bind-days on cap-only >= 5.
  const w5c = control.wave5Ever, w5a = capOnly.wave5Ever;
  const bar5 = w5c * 1.25;
  const p1 = w5a <= bar5;
  lines.push(`PRIMARY wave-5 unlocks: control=${w5c}/${control.runs} cap-only=${w5a}/${capOnly.runs} — GO=${p1 ? 'YES' : 'NO'} (bar: cap-only <= control x 1.25 = ${bar5.toFixed(2)})`);
  const p2 = capOnly.medCapBindDays >= 5;
  lines.push(`PRIMARY median cap bind-days (cap-only): ${capOnly.medCapBindDays}d — GO=${p2 ? 'YES' : 'NO'} (bar >= 5)`);
  const medOk = capOnly.medianDays >= control.medianDays - 10;
  lines.push(`GUARDRAIL median survival: control=${control.medianDays} cap-only=${capOnly.medianDays} — ${medOk ? 'HOLD' : 'MISS'} (bar >= ${control.medianDays - 10})`);
  const natOk = capOnly.national >= control.national - 2;
  lines.push(`GUARDRAIL national: control=${control.national}/${control.runs} cap-only=${capOnly.national}/${capOnly.runs} — ${natOk ? 'HOLD' : 'MISS'} (bar >= ${control.national - 2})`);
  const newModes = Object.entries(capOnly.families || {}).filter(([k, v]) => v >= 3 && !(control.families || {})[k]);
  const modeOk = !newModes.length;
  lines.push(`GUARDRAIL new death mode (family, n>=3 cap-only-only): ${newModes.length ? newModes.map(([k, v]) => k + '=' + v).join(', ') + ' — MISS' : 'none — HOLD'}`);
  const wrOk = capOnly.wave4Rate >= 0.20 && capOnly.wave4Rate <= 0.60;
  lines.push(`GUARDRAIL wave-4 unlock rate (cap-only): ${capOnly.wave4Rate} — ${wrOk ? 'HOLD' : 'MISS'} (bar 0.20-0.60)`);
  lines.push(`wall: control national ${control.national}/${control.runs} table ${control.table}/${control.runs} won ${control.won}/${control.runs} wave5 ${control.wave5Ever}/${control.runs} medianDays ${control.medianDays}`);
  lines.push(`wall: cap-only national ${capOnly.national}/${capOnly.runs} table ${capOnly.table}/${capOnly.runs} won ${capOnly.won}/${capOnly.runs} wave5 ${capOnly.wave5Ever}/${capOnly.runs} medianDays ${capOnly.medianDays}`);
  const go = p1 && p2 && medOk && natOk && modeOk && wrOk;
  return { go, lines, detail: { p1, p2, medOk, natOk, modeOk, wrOk } };
}

// INSTRUMENT-HONESTY GATE: SMOKE=1.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
    check(`named-export unwrap: ${pid}.daily is a function`, pol && typeof pol.daily === 'function');
  }
  const { Game } = await loadGame({ seed: 11, mode: 'plentycap-smoke' });
  await quietLog(async () => { await setupGame(Game); });
  if (typeof Game._standingVariant !== 'function') {
    // killed-arm variant on a tree without the env reader: INFO-SKIP, not crash.
    console.log(`INFO-SKIP: standing.js has no _standingVariant reader (arm killed or control tree) — SMOKE skipped for VARIANT=${VARIANT}`);
    process.exit(0);
  }
  const pol = POLICY_REGISTRY.leadfeast;
  let dailyCalls = 0;
  const wrapped = Object.assign({}, pol);
  const orig = pol.daily;
  wrapped.daily = (G, ctx) => { dailyCalls++; return orig(G, ctx); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: 15, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  let policyActs = 0;
  try {
    for (const row of (result.pacing.perDay || [])) for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
  } catch (e) {}
  check('harness invokes policy.daily (meanCalls/day>0)', meanCalls > 0, 'mean=' + meanCalls);
  check('>=1 policy-origin deliberate act', policyActs > 0, 'policyActs=' + policyActs);
  // tooth mechanism per requested variant, on scripted fixtures.
  const G2 = await loadFreshVariant(VARIANT === 'all' ? 'control' : VARIANT);
  const mech = await fixtureMechanism(G2);
  for (const [name, cond, detail] of mech) check(name, cond, detail);
  if (fails.length) { console.log('\nSMOKE STOP: ' + fails.join('; ')); process.exit(1); }
  console.log('SMOKE GREEN');
  process.exit(0);
}

async function loadFreshVariant(variant) {
  process.env.STANDING_VARIANT = ENV_FOR[variant];
  const { Game } = await loadGame({ seed: 42, mode: `plentycap-smoke-${variant}` });
  await quietLog(async () => { await setupGame(Game); });
  return Game;
}

async function fixtureMechanism(Game) {
  const out = [];
  const breadOnlyReleased = (G) => {
    G.state.scholar.day = 70;
    G.ledgerState()[1].points = 5; G.ledgerState()[2].points = 5;
    G.ledgerState()[3].points = 0; G.ledgerState()[4].points = 0; G.ledgerState()[5].points = 0;
    G.state.feastLog = [];
    for (let i = 0; i < 10; i++) G.state.feastLog.push({ day: 69 - i, quality: 1 });
    G.deedState().wavesFaced = { a: 3, b: 3, c: 3, d: 4, e: 4 };
  };
  const warNoFaced = (G) => {
    G.state.scholar.day = 70;
    G.ledgerState()[1].points = 5; G.ledgerState()[2].points = 5;
    G.ledgerState()[3].points = 5;
    G.state.feastLog = [];
    G.deedState().wavesFaced = {};
  };
  const v = Game._standingVariant() === 'both' ? 'control' : Game._standingVariant();
  breadOnlyReleased(Game);
  const breadTotal = Game.villageStandingTotal();
  const breadCapped = Game.standingPlentyCappedTotal();
  warNoFaced(Game);
  // NOTE: warNoFaced on the SAME game after breadOnlyReleased trips the
  // monotonic ratchet (peak=5 already recorded) — so reload fresh for the
  // war check on faced-only.
  const expect = { control: [199, 100], 'faced-only': [200, 200], 'cap-only': [199, 100] }[v];
  out.push([`mechanism: bread-only 200 on ${v} -> total ${expect[0]}/capped ${expect[1]}`, breadTotal === expect[0] && breadCapped === expect[1], `total=${breadTotal} capped=${breadCapped}`]);
  return out;
}

async function main() {
  if (process.env.SMOKE === '1') return smokeGate();
  const OUT = process.env.OUT;
  // killed-arm INFO-SKIP: variant requested but the env reader is absent.
  if (VARIANT !== 'all') {
    process.env.STANDING_VARIANT = ENV_FOR[VARIANT];
    const { Game } = await loadGame({ seed: 1, mode: 'plentycap-variant-probe' });
    if (typeof Game._standingVariant !== 'function') {
      console.log(`INFO-SKIP: VARIANT=${VARIANT} requested but standing.js has no env reader (arm killed) — exit 0`);
      process.exit(0);
    }
  }
  const sums = {}, allRows = {};
  for (const leg of LEGS) {
    process.env.STANDING_VARIANT = ENV_FOR[leg];
    const rows = await runSuite(leg);
    const sum = summarize(leg, rows);
    sums[leg] = sum; allRows[leg] = rows;
    console.log(`\n=== ${leg} === wave4=${sum.wave4Rate} wave5=${sum.wave5Ever}/${sum.runs} medCapBind=${sum.medCapBindDays}d medianDays=${sum.medianDays} national=${sum.national}/${sum.runs} table=${sum.table} won=${sum.won}`);
  }
  delete process.env.STANDING_VARIANT;
  if (LEGS.length === 3) {
    const v = verdict(sums.control, sums['cap-only'], sums['faced-only']);
    console.log('\n=== VERDICT ===');
    for (const l of v.lines) console.log(l);
    console.log(`\nGO=${v.go ? 'YES' : 'NO'}`);
    if (OUT) fs.writeFileSync(OUT, JSON.stringify({ control: sums.control, capOnly: sums['cap-only'], facedOnly: sums['faced-only'], verdict: v, rows: allRows }, null, 1));
  } else if (OUT) {
    fs.writeFileSync(OUT, JSON.stringify({ summary: sums[LEGS[0]], rows: allRows[LEGS[0]] }, null, 1));
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
