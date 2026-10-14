#!/usr/bin/env node
// scripts/sweep-candwindow-20261014.js — CANDWINDOW PILOT SWEEP.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-candwindow.md header):
//   axis    : scale-onramp (the wall), lever-8 lens
//   question: does keeping the proposal window open (pantry discipline above
//             the 12000 gate + codex-study courtship assist) widen the
//             candidate window AND convert it into formed links?
//   stack   : FOURTHLINK=1 FIFTHLINK=1 both sides (the subaid courtship
//             stack); ARMED adds CANDWINDOW=1 on top. Same code tree,
//             identical seeds, env-var only.
//   primary : windowOpenDays >= control x 1.5 AND forming (links formed per
//             suite) >= control. Both must hold — a wider window that forms
//             nothing is mechanism without outcome.
//   guard   : national >= control-2; starvation deaths <= control+2;
//             hungryDays (fc.starveDays) <= control x 1.1; no new death mode;
//             exiled <= control+1.
//   horizon : 180d death-aware (dead villages stop; +10d tail max).
//   seeds   : 11/22/33/44/55/66/77/88 x courtstack (single stack).
//   GO      : primary met at pilot -> confirm 12-16 seeds before calling GO.
//   A miss is NO-GO — never re-scored against a friendlier metric mid-run.
//
// Usage (control):
//   OUT=evidence/2026-10-14/sim-candwindow-control.json \
//   node scripts/sweep-candwindow-20261014.js
// Usage (armed):
//   CANDWINDOW=1 OUT=evidence/2026-10-14/sim-candwindow-armed.json \
//   node scripts/sweep-candwindow-20261014.js
// Instrument-honesty gate (the 2026-10-14 prodthrottle lesson):
//   SMOKE=1 node scripts/sweep-candwindow-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { fifthlink } = require('./policies/fifthlink-r26');
const { candwindow, _prePass } = require('./policies/candwindow');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const ARMED = process.env.CANDWINDOW === '1';
const leadPolicy = ARMED ? candwindow : fifthlink;
const POLICY_REGISTRY = { courtstack: leadPolicy };

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}

// INSTRUMENT-HONESTY GATE: SMOKE=1 runs a short live smoke BEFORE any sweep
// spend and FAILS LOUDLY unless (a) the policy is genuinely driving
// (unwrapped daily is a function; harness invokes it; >=1 policy-origin
// deliberate act fires) and (b) with CANDWINDOW=1 the layer actually fires
// through its own path (scripted: _prePass in the discipline zone sets the
// pantry toggles and counts the discipline day).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  check('unwrapped policy.daily is a function', leadPolicy && typeof leadPolicy.daily === 'function',
    'typeof=' + (leadPolicy && typeof leadPolicy.daily) + ' id=' + (leadPolicy && leadPolicy.id));
  check('policy id matches side', ARMED ? leadPolicy.id === 'candwindow' : leadPolicy.id === 'fifthlink-r26',
    'id=' + leadPolicy.id + ' ARMED=' + ARMED);
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  const policy = Object.assign({}, leadPolicy);
  const origDaily = leadPolicy.daily;
  let dailyCalls = 0;
  policy.daily = (G, ctx) => { dailyCalls++; return origDaily(G, ctx); };
  const { Game } = await loadGame({ seed: 11, mode: 'candwindow-smoke', fullTelemetry: false });
  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
  const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
  let policyActs = 0;
  try {
    for (const row of (result.pacing.perDay || [])) {
      for (const k of Object.keys(row.acts || {})) if (k.indexOf('policy:') === 0) policyActs += row.acts[k];
    }
  } catch (e) {}
  check('harness invokes policy.daily (meanCalls/day>0)', meanCalls > 0, 'mean=' + meanCalls);
  check('>=1 policy-origin deliberate act', policyActs > 0, 'policyActs=' + policyActs);
  // (b) the layer fires: scripted discipline-zone pre-pass.
  if (ARMED) {
    const { Game: G2 } = await loadGame({ seed: 12, mode: 'candwindow-smoke2' });
    await setupGame(G2);
    G2.state.scholar.day = 30;
    const v = (G2.state.otherVillages || [])[0];
    if (v) v.rumored = true;
    G2.state.village.pantry = [{ id: 'smoke', kcalEach: 13000, units: 1, foodState: 'fresh' }];
    const ctx = {};
    _prePass(G2, ctx);
    check('CANDWINDOW=1: layer fires in the discipline zone (toggles set, discipline day counted)',
      process.env.COMPETENT_FEAST === '0' && process.env.COMPETENT_AID === '0' && (ctx.cwDisciplineDays || 0) >= 1,
      `feast=${process.env.COMPETENT_FEAST} aid=${process.env.COMPETENT_AID} days=${ctx.cwDisciplineDays || 0}`);
    delete process.env.COMPETENT_FEAST;
    delete process.env.COMPETENT_AID;
  }
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: harness drives the policy and the layer fires when armed.');
}

async function runSweep(opts) {
  opts = opts || {};
  const label = opts.label || (ARMED ? 'candwindow-armed' : 'candwindow-control');
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'courtstack').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'candwindow-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      tune.attachStanding(Game, m);
      attachLinkPipe(Game, m);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      const pp = m.linkpipe;
      const cw = { disciplineDays: 0, studies: 0, travels: 0 };
      policy.daily = (G, ctx) => {
        try { pp.snapshot(G, pid); } catch (e) {}
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
        let r;
        if (origDaily) { try { r = origDaily(G, ctx); } catch (e) {} }
        try {
          cw.disciplineDays = ctx.cwDisciplineDays || 0;
          cw.studies = ctx.cwStudies || 0;
          cw.travels = ctx.cwTravels || 0;
        } catch (e) {}
        return r;
      };
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
      m._days = result.days;
      let w4faced = 0;
      try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
      const row = Object.assign(
        { label, policy: pid, seed, armed: ARMED },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        tune.finalizeStanding(Game, m),
        { linkpipe: finalizeLinkPipe(Game, m), w4faced, deathCauses: deathCauses(result), candwindow: cw }
      );
      rows.push(row);
      const lp = row.linkpipe;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `win=${lp.windowOpenDays}d formed=${lp.linksFormed} seasoned=${lp.linksSeasoned} ` +
        `cwDisc=${cw.disciplineDays}d cwStud=${cw.studies} ` +
        `stand=${row.endStanding.total} nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} ` +
        `w4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day} w5=${row.wave5Day == null ? '-' : 'd' + row.wave5Day} ` +
        `exiled=${row.exiledEver ? 'Y' : 'n'}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const starvDeaths = (r) => Object.keys(r.deathCauses || {}).filter(k => /starvation/i.test(k)).reduce((x, k) => x + r.deathCauses[k], 0);
  const deathModes = (r) => Object.keys(r.deathCauses || {}).sort();
  const summary = {
    label, seeds, policies: policyIds, days, armed: ARMED, runs: rows.length,
    // PRIMARY (both must hold)
    windowOpenDays: agg(r => r.linkpipe.windowOpenDays),
    linksFormed: agg(r => r.linkpipe.linksFormed),
    linksSeasoned: agg(r => r.linkpipe.linksSeasoned),
    proposals: agg(r => r.linkpipe.proposals.total),
    accepts: agg(r => r.linkpipe.proposals.accept),
    // mechanism: the layer's own counters
    cwDisciplineDays: agg(r => (r.candwindow || {}).disciplineDays),
    cwStudies: agg(r => (r.candwindow || {}).studies),
    cwTravels: agg(r => (r.candwindow || {}).travels),
    // guardrails + wall
    national: agg(r => (r.national ? 1 : 0)),
    exiled: agg(r => (r.exiledEver ? 1 : 0)),
    starvationDeaths: agg(starvDeaths),
    hungryDays: agg(r => r.starveDays),
    deathModes: [...new Set(rows.flatMap(deathModes))].sort(),
    medianDays: med(rows.map(r => r.days)),
    table: agg(r => r.table), won: agg(r => r.won),
    wave4Unlock: agg(r => r.wave4Day != null ? 1 : 0),
    wave5Unlock: agg(r => r.wave5Day != null ? 1 : 0),
    maxStanding: Math.max(0, ...rows.map(r => r.endStanding.total)),
    medianEndStanding: med(rows.map(r => r.endStanding.total)),
  };
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    if (process.env.SMOKE === '1') { await smokeGate(); return; }
    const t0 = Date.now();
    const rep = await runSweep({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log(`PRIMARY windowOpenDays ${s.windowOpenDays} | links formed ${s.linksFormed} seasoned ${s.linksSeasoned} (prop ${s.proposals} a${s.accepts})`);
    console.log(`mechanism: cwDisciplineDays ${s.cwDisciplineDays} cwStudies ${s.cwStudies} cwTravels ${s.cwTravels}`);
    console.log(`guard: national ${s.national}/${s.runs} exiled ${s.exiled}/${s.runs} starvDeaths ${s.starvationDeaths} hungryDays ${s.hungryDays} modes=[${s.deathModes.join('|')}]`);
    console.log(`wall: table ${s.table}/${s.runs} won ${s.won}/${s.runs} wave4 ${s.wave4Unlock}/${s.runs} wave5 ${s.wave5Unlock}/${s.runs} maxStanding ${s.maxStanding} medianEnd ${s.medianEndStanding} medianDays ${s.medianDays}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runSweep };
