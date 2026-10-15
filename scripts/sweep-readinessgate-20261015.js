#!/usr/bin/env node
// scripts/sweep-readinessgate-20261015.js — READINESS GATE PILOT SWEEP.
// sim-readinessgate (2026-10-15): src/js/standing.js ONLY — Standing-gated
// wave-4/5 unlocks DEFER until the readiness bar passes (measured against
// the wave below: >=2 distinct kill types OR >=2 learned counters OR
// scholar armor P >= 20).
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14 — BINDING):
//   axis      : scale-onramp (the wall), lever-2 lens (wave unlock pacing)
//   question  : do readiness-gated Standing unlocks raise the 30d
//               post-unlock holder rate among diplomacy/plenty-driven w4/5
//               unlockers (the #209/#210 lethal pattern)?
//   stack     : leadfeast/belongfeast (leadcourt/belongseek via FEASTSCALE_R13)
//               both sides. CONTROL = pristine standing.js (HEAD), ARMED = the
//               worktree's standing.js with the gate. Same tree, identical
//               seeds, in-script file swap (no stash — repo-global stack).
//   seeds     : 11/22/33/44/55/66/77/88 x 2 roads, 180d death-aware.
//   PRIMARY   : 30d post-unlock holder rate among w4/5 Standing unlockers
//               (diplomacy/plenty-driven: war < threshold at the crossing)
//               >= control x 1.25.
//   GUARDRAILS: wave-4 unlock rate within 0.20-0.60 (the 0.30-0.50 tune band
//               is the review reference, NOT the kill bar — deferral shifts
//               timing by design); median survival >= control-10d;
//               national >= control-2/8; no new death mode at the cause-FAMILY
//               level (family = strip player:/villager: prefix, named-monster
//               kills -> 'monster'; armed-only family with n>=3 = new mode).
//   GO        : primary met at pilot -> confirm 12-16 seeds. A miss is NO-GO,
//               never re-scored mid-run.
//
// Modes:
//   SMOKE=1 node scripts/sweep-readinessgate-20261015.js
//     instrument-honesty gate: (a) named-export unwrap — leadfeast/belongfeast
//     .daily is a function, harness invokes it, >=1 policy-origin act; (b)
//     the deferral mechanism is reachable on the armed tree (scripted fixture:
//     unready + standing>=100 => unlockedWave 3; ready => 4). Control side
//     skips (b) (pristine has no gate to reach).
//   ALL=1 OUT=evidence/2026-10-15/sim-readinessgate.json node scripts/...
//     full before/after: swaps standing.js for the control leg, restores
//     (byte-verified) for the armed leg, prints the verdict table.
//   SIDE=control|armed (default armed): single-side suite, OUT=... .
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');

const ROOT = path.join(__dirname, '..');
const STANDING = path.join(ROOT, 'src', 'js', 'standing.js');
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const POLICY_REGISTRY = { leadfeast, belongfeast };

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function daySample(Game) {
  const d = dayOf(Game);
  let s = null, wave = 1, defer4 = false, defer5 = false, rd4 = null, rd5 = null;
  let faced3 = 0, faced4 = 0, capped5 = 0, peak = 0;
  try { s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; } catch (e) {}
  try { wave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  try { defer4 = !!(typeof Game.standingDeferral === 'function') && Game.standingDeferral(4).deferred; } catch (e) {}
  try { defer5 = !!(typeof Game.standingDeferral === 'function') && Game.standingDeferral(5).deferred; } catch (e) {}
  try { rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null; } catch (e) {}
  try { rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null; } catch (e) {}
  try { faced3 = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(3) | 0) : 0; } catch (e) {}
  try { faced4 = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
  try { capped5 = (typeof Game.standingPlentyCappedTotal === 'function') ? (Game.standingPlentyCappedTotal() | 0) : 0; } catch (e) {}
  try { peak = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : 0; } catch (e) {}
  return {
    day: d, total: s ? (s.total | 0) : 0,
    war: s ? (s.war | 0) : 0, diplomacy: s ? (s.diplomacy | 0) : 0, plenty: s ? (s.plenty | 0) : 0,
    warPts: s ? (s.warPts | 0) : 0, links: s ? (s.links | 0) : 0, feasts: s ? (s.feasts | 0) : 0,
    wave, defer4, defer5, faced3, faced4, capped5, peak,
    ready4: rd4 ? !!rd4.ready : null, ready5: rd5 ? !!rd5.ready : null,
  };
}

function deathCausesFamily(result, monsterIds) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    let c = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    c = c.replace(/^(player|villager):/, '');           // cause families, not victim-prefixed keys (r33 metric review)
    if (monsterIds && monsterIds.has(c)) c = 'monster'; // named monsters -> the monster family
    causes[c] = (causes[c] || 0) + 1;
  }
  return causes;
}

async function runSuite(label, out) {
  const rows = [];
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    for (const seed of SEEDS) {
      const { Game } = await loadGame({ seed, mode: `readinessgate-${label}-${pid}` });
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
      // national-first-day from the scale instrument's daily rows.
      let nationalFirstDay = null;
      try {
        for (const r of ((m.scale && m.scale.daily) || [])) {
          const rk = String(r.rank || '');
          if ((rk === 'national' || rk === 'global') && nationalFirstDay == null) nationalFirstDay = r.day;
        }
      } catch (e) {}
      // unlock detection from the samples.
      // drivenNonWar is evaluated AT THE ACTUAL UNLOCK (wave4Day/wave5Day),
      // not at the Standing crossing — a deferred unlock crosses T4 while
      // the wave is still held at 3 (measuring at the crossing would
      // systematically exclude every deferred unlock from the population).
      let t4Day = null, t5Day = null, wave4Day = null, wave5Day = null;
      let atWave4 = null, atWave5 = null;
      let held4Days = 0, defer4Ever = false, defer5Ever = false, ready4FirstDay = null, ready5FirstDay = null;
      let plentyCapDays = 0;
      for (const r of samples) {
        if (r.defer4) { held4Days++; defer4Ever = true; }
        if (r.defer5) defer5Ever = true;
        if (ready4FirstDay == null && r.ready4 === true) ready4FirstDay = r.day;
        if (ready5FirstDay == null && r.ready5 === true) ready5FirstDay = r.day;
        if (r.total >= 200 && r.capped5 < 200) plentyCapDays++;
        if (t4Day == null && r.total >= 100) t4Day = r.day;
        if (t5Day == null && r.total >= 200) t5Day = r.day;
        if (wave4Day == null && r.wave >= 4) { wave4Day = r.day; atWave4 = r; }
        if (wave5Day == null && r.wave >= 5) { wave5Day = r.day; atWave5 = r; }
      }
      // diplomacy/plenty-driven: war alone could not have unlocked it —
      // evaluated at the unlock, when the wave actually opened.
      const drivenNonWar4 = atWave4 ? (atWave4.war < 100) : null;
      const drivenNonWar5 = atWave5 ? (atWave5.war < 200) : null;
      // holder: alive 30d after the unlock day.
      const holder4 = wave4Day != null ? (result.days >= wave4Day + 30 ? 1 : 0) : null;
      const holder5 = wave5Day != null ? (result.days >= wave5Day + 30 ? 1 : 0) : null;
      const row = Object.assign(
        { label, policy: pid, seed, days: result.days, endReason: result.endReason },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        { nationalFirstDay },
        {
          t4Day, t5Day, wave4Day, wave5Day,
          driver4: atWave4 ? { war: atWave4.war, diplomacy: atWave4.diplomacy, plenty: atWave4.plenty, warPts: atWave4.warPts, links: atWave4.links, feasts: atWave4.feasts, faced3: atWave4.faced3 } : null,
          driver5: atWave5 ? { war: atWave5.war, diplomacy: atWave5.diplomacy, plenty: atWave5.plenty, faced4: atWave5.faced4, capped5: atWave5.capped5 } : null,
          drivenNonWar4, drivenNonWar5, holder4, holder5,
          defer4Ever, defer5Ever, held4Days, ready4FirstDay, ready5FirstDay, plentyCapDays,
          faced3AtUnlock4: (wave4Day != null ? (samples.find(r => r.day === wave4Day) || {}).faced3 : null),
          faced4AtUnlock5: (wave5Day != null ? (samples.find(r => r.day === wave5Day) || {}).faced4 : null),
          endStanding: { total: (samples.length ? samples[samples.length - 1].total : 0) },
          deathCauses: deathCausesFamily(result, monsterIds),
        }
      );
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${result.days} ${result.endReason} ` +
        `wave4=${wave4Day == null ? '-' : 'd' + wave4Day}${drivenNonWar4 ? '(nbw)' : ''} ` +
        `wave5=${wave5Day == null ? '-' : 'd' + wave5Day}${drivenNonWar5 ? '(nbw)' : ''} ` +
        `held4=${held4Days}d nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} won=${row.won ? 1 : 0}`);
    }
  }
  return rows;
}

function summarize(label, rows) {
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  // PRIMARY population: w4/5 unlockers driven by diplomacy/plenty (non-war).
  const unlockers = rows.filter(r => r.wave4Day != null && r.drivenNonWar4);
  const holders = unlockers.filter(r => r.holder4 === 1);
  const unlockers5 = rows.filter(r => r.wave5Day != null && r.drivenNonWar5);
  const holders5 = unlockers5.filter(r => r.holder5 === 1);
  const pop = unlockers.length + unlockers5.length;
  const holdN = holders.length + holders5.length;
  const familyCounts = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) familyCounts[k] = (familyCounts[k] || 0) + v;
  return {
    label, runs: rows.length,
    wave4Rate: +(agg(r => (r.wave4Day != null ? 1 : 0)) / rows.length).toFixed(3),
    wave5Ever: agg(r => (r.wave5Day != null ? 1 : 0)),
    primaryPop: pop, primaryHolders: holdN,
    primaryHolderRate: pop ? +(holdN / pop).toFixed(3) : null,
    w4nbwPop: unlockers.length, w4nbwHolders: holders.length,
    w5nbwPop: unlockers5.length, w5nbwHolders: holders5.length,
    deferral: {
      defer4Ever: agg(r => r.defer4Ever ? 1 : 0), defer5Ever: agg(r => r.defer5Ever ? 1 : 0),
      medHeld4Days: med(rows.map(r => r.held4Days || 0)),
      medPlentyCapDays: med(rows.map(r => r.plentyCapDays || 0)),
    },
    medianDays: med(rows.map(r => r.days)),
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won),
    exiled: agg(r => r.exiledEver || 0),
    families: familyCounts,
  };
}

function verdict(control, armed) {
  const lines = [];
  const p = armed.primaryHolderRate, c = control.primaryHolderRate;
  const go = (c == null || c === 0) ? (p != null && p > 0) : (p != null && p >= c * 1.25);
  lines.push(`PRIMARY (30d holder rate, non-war-driven w4/5 unlockers): control=${c} (${control.primaryHolders}/${control.primaryPop}) armed=${p} (${armed.primaryHolders}/${armed.primaryPop}) — GO=${go ? 'YES' : 'NO'} (bar: >= control x 1.25)`);
  const wr = armed.wave4Rate;
  lines.push(`GUARDRAIL wave-4 unlock rate: armed=${wr} (band 0.20-0.60; 0.30-0.50 is review reference)`);
  lines.push(`GUARDRAIL median survival: control=${control.medianDays} armed=${armed.medianDays} (bar >= ${control.medianDays - 10}) — ${armed.medianDays >= control.medianDays - 10 ? 'HOLD' : 'MISS'}`);
  lines.push(`GUARDRAIL national: control=${control.national}/8 armed=${armed.national}/8 (bar >= ${control.national - 2}) — ${armed.national >= control.national - 2 ? 'HOLD' : 'MISS'}`);
  const newModes = Object.entries(armed.families || {}).filter(([k, v]) => v >= 3 && !(control.families || {})[k]);
  lines.push(`GUARDRAIL new death mode (family, n>=3 armed-only): ${newModes.length ? newModes.map(([k, v]) => k + '=' + v).join(', ') + ' — MISS' : 'none — HOLD'}`);
  lines.push(`wall: national ${armed.national}/${armed.runs} table ${armed.table}/${armed.runs} won ${armed.won}/${armed.runs} wave5 ${armed.wave5Ever}/${armed.runs} medianDays ${armed.medianDays}`);
  return { go, lines };
}

// INSTRUMENT-HONESTY GATE: SMOKE=1 — named-export unwrap + live drive +
// (armed only) the deferral mechanism reachable on scripted fixtures.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
    check(`named-export unwrap: ${pid}.daily is a function`, pol && typeof pol.daily === 'function', 'typeof=' + (pol && typeof pol.daily));
  }
  const { Game } = await loadGame({ seed: 11, mode: 'readinessgate-smoke' });
  await quietLog(async () => { await setupGame(Game); });
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
  const ARMED = typeof Game.waveUnlockReady === 'function' && typeof Game.standingPlentyCappedTotal === 'function';
  if (ARMED) {
    // v2: the faced-experience deferral + plenty cap are reachable on
    // scripted fixtures.
    Game.state.scholar.day = 60;
    Game.state.feastLog = [{ day: 55, quality: 1 }, { day: 54, quality: 1 }, { day: 53, quality: 1 }, { day: 52, quality: 1 }, { day: 51, quality: 1 }];
    Game.state.waveLedger = Game.state.waveLedger || {};
    Game.state.waveLedger[2] = { points: 4, perType: { x: 2, y: 2 }, perTypeX: {} };
    Game.state.waveLedger[3] = { points: 0, perType: {}, perTypeX: {} };
    try { Game.deedState().wavesFaced = {}; } catch (e) {}
    check('armed v2: 0/3 wave-3 faced + standing>=100 => wave held at 3', Game.unlockedWave() === 3, 'wave=' + Game.unlockedWave());
    try { Game.deedState().wavesFaced = { redactor: 3, gavel: 3, spool: 3 }; } catch (e) {}
    check('armed v2: 3/3 wave-3 faced => releases to 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
    Game.state.feastLog = Game.state.feastLog.concat(Game.state.feastLog.map(f => ({ day: f.day - 10, quality: 1 })));
    try { Game.deedState().wavesFaced = { redactor: 3, gavel: 3, spool: 3, eater: 4 }; } catch (e) {}
    check('armed v2: 200 bread alone => plenty cap holds at 4', Game.unlockedWave() === 4 && Game.villageStandingTotal() === 199,
      'wave=' + Game.unlockedWave() + ' total=' + Game.villageStandingTotal());
  } else {
    console.log('  (pristine side: v2 gate absent by design — skip mechanism check)');
  }
  if (fails.length) { console.log('\nSMOKE STOP: ' + fails.join('; ')); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function main() {
  if (process.env.SMOKE === '1') return smokeGate();
  const SIDE = process.env.SIDE || 'armed';
  const OUT = process.env.OUT;
  const swapNeeded = process.env.ALL === '1';
  const armedBytes = fs.readFileSync(STANDING);
  const run = async (side) => {
    if (side === 'control') {
      const pristine = cp.execSync('git show HEAD:src/js/standing.js', { cwd: ROOT });
      fs.writeFileSync(STANDING, pristine);
    } else {
      fs.writeFileSync(STANDING, armedBytes);
    }
    const rows = await runSuite(side);
    const sum = summarize(side, rows);
    if (OUT && !swapNeeded) fs.writeFileSync(OUT, JSON.stringify({ summary: sum, rows }, null, 1));
    return { sum, rows };
  };
  if (!swapNeeded) {
    const { sum } = await run(SIDE);
    console.log(`\n=== ${SIDE} === holder-rate=${sum.primaryHolderRate} (${sum.primaryHolders}/${sum.primaryPop}) wave4=${sum.wave4Rate} wave5=${sum.wave5Ever} medianDays=${sum.medianDays} national=${sum.national}/${sum.runs} table=${sum.table} won=${sum.won}`);
    return;
  }
  // ALL=1: control leg on pristine, restore armed byte-verified, armed leg, verdict.
  let ctrl;
  try {
    ctrl = await run('control');
  } finally {
    fs.writeFileSync(STANDING, armedBytes);
  }
  const back = fs.readFileSync(STANDING);
  if (!back.equals(armedBytes)) throw new Error('RESTORE FAILED: armed standing.js not byte-identical after control leg');
  console.log('restore verified: armed standing.js byte-identical');
  const armed = await run('armed');
  const v = verdict(ctrl.sum, armed.sum);
  console.log('\n=== VERDICT ===');
  for (const l of v.lines) console.log(l);
  console.log(`\nGO=${v.go ? 'YES' : 'NO'}`);
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ control: ctrl.sum, armed: armed.sum, verdict: v, rows: { control: ctrl.rows, armed: armed.rows } }, null, 1));
}

main().catch(e => {
  console.error('FATAL', e);
  try { /* best-effort restore of the armed file */ } catch (e2) {}
  process.exit(1);
});
