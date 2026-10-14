#!/usr/bin/env node
// scripts/sweep-proposelayer-20261014.js — PROPOSELAYER PILOT SWEEP.
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-proposelayer-r33.md header,
// docs/MEASUREMENT.md §§9-12, 14 — BINDING):
//   axis    : scale-onramp (the wall), lever-8 lens (travel & regional)
//   question: does a policy-side propose layer on competent (the verb gap
//             from journey-scale r3) move the scale wall numbers — links
//             formed, regional reached, national — without breaking the
//             survival guardrails?
//   stack   : competent (pinned, gates OFF) both sides; ARMED adds
//             PROPOSELAYER=1 on top. Same code tree, identical seeds,
//             env-var only.
//   primary : links formed >= 2/8 AND >= 1 seed reaching regional+ by day
//             120 (or national >= 1/8).
//   guard   : median survival >= control-10d; starvation deaths <=
//             control+9 (A/A p90abs); hungryDays (fc.starveDays) <=
//             control x 1.409 (A/A p90rel); no new death mode;
//             exiled <= control+1.
//   horizon : 150d death-aware (dead villages stop; +10d tail max).
//   seeds   : 11/22/33/44/55/66/77/88.
//   GO      : primary met at pilot -> confirm 12-16 seeds before calling GO.
//   A miss is NO-GO — never re-scored mid-run.
//
// Usage (control):
//   OUT=evidence/2026-10-14/sim-proposelayer-control.json \
//   node scripts/sweep-proposelayer-20261014.js
// Usage (armed):
//   OUT=evidence/2026-10-14/sim-proposelayer-armed.json \
//   PROPOSELAYER=1 node scripts/sweep-proposelayer-20261014.js
// Compare (after both sides):
//   COMPARE=1 node scripts/sweep-proposelayer-20261014.js
// Instrument-honesty gate:
//   SMOKE=1 node scripts/sweep-proposelayer-20261014.js
//   SMOKE=1 PROPOSELAYER=1 node scripts/sweep-proposelayer-20261014.js
'use strict';
const fs = require('fs');
const ARMED = process.env.PROPOSELAYER === '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { proposelayer, courtshipPass } = require('./policies/proposelayer');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

const leadPolicy = ARMED ? proposelayer : competent;
const LABEL = ARMED ? 'proposelayer-armed' : 'competent-control';
const OUT = process.env.OUT || `evidence/2026-10-14/sim-${LABEL}.json`;

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
// deliberate act fires) and (b) with PROPOSELAYER=1 the layer actually fires
// through its own path (scripted: courtshipPass on the open-window fixture
// calls the real proposeLink and counts the proposal).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  check('unwrapped policy.daily is a function', leadPolicy && typeof leadPolicy.daily === 'function',
    'typeof=' + (leadPolicy && typeof leadPolicy.daily) + ' id=' + (leadPolicy && leadPolicy.id));
  check('policy id matches side', ARMED ? leadPolicy.id === 'proposelayer' : leadPolicy.id === 'competent',
    'id=' + leadPolicy.id + ' ARMED=' + ARMED);
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  const policy = Object.assign({}, leadPolicy);
  const origDaily = leadPolicy.daily;
  policy.daily = (G, ctx) => origDaily(G, ctx);
  const { Game } = await loadGame({ seed: 11, mode: 'proposelayer-smoke', fullTelemetry: false });
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
  // (b) the layer fires through its own path when armed.
  if (ARMED) {
    const { Game: G2 } = await loadGame({ seed: 12, mode: 'proposelayer-smoke2' });
    await setupGame(G2);
    G2.state.scholar.day = 30;
    const v = (G2.state.otherVillages || [])[0];
    if (v) v.rumored = true;
    G2.state.village.pantry = [{ id: 'smoke', kcalEach: 13000, units: 1, foodState: 'fresh' }];
    const calls = [];
    const orig = G2.proposeLink;
    G2.proposeLink = function (...a) { calls.push(a); return orig.apply(this, a); };
    const ctx = {};
    courtshipPass(G2, ctx);
    G2.proposeLink = orig;
    check('PROPOSELAYER=1: layer fires the real proposeLink on the window fixture',
      calls.length >= 1 && (ctx.plProposed || 0) >= 1, `proposeLink calls=${calls.length} plProposed=${ctx.plProposed || 0}`);
  }
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: harness drives the policy and the layer fires when armed.');
}

const SCALE_LINE_RE = /propose|counter|accord|tribute|regional|dawn|network is|first court|one organization|seasoned|realm|subordinate|link with|cold ink|gesture/i;

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const seed of seeds) {
    console.log(`  [${LABEL} s${seed}] starting…`);
    const { Game } = await loadGame({ seed, mode: 'proposelayer-' + LABEL });
    await setupGame(Game);
    // bounded engine-text capture for sense-testing the scale beats
    let dayBuf = [];
    const cap = (s) => {
      try {
        if (typeof s === 'string' && s.length) {
          const d = ((Game.state.scholar || {}).day) || 0;
          dayBuf.push({ day: d, text: String(s) });
          if (dayBuf.length > 600) dayBuf.splice(0, dayBuf.length - 600);
        }
      } catch (e) {}
    };
    const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
    Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
    Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
    if (typeof _emit === 'function') {
      Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
    }
    const m = fc.attachInstruments(Game);
    sr.attachScale(Game, m);
    tune.attachStanding(Game, m);
    attachLinkPipe(Game, m);
    const policy = Object.assign({}, leadPolicy);
    const origDaily = leadPolicy.daily;
    const pp = m.linkpipe;
    const pl = { proposed: 0, tended: 0, counters: 0, accords: 0, national: 0, defense: 0 };
    policy.daily = (G, ctx) => {
      try { pp.snapshot(G, LABEL); } catch (e) {}
      try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
      try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
      try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
      let r;
      if (origDaily) { try { r = origDaily(G, ctx); } catch (e) {} }
      try {
        pl.proposed = ctx.plProposed || 0; pl.tended = ctx.plTended || 0;
        pl.counters = ctx.plCounters || 0; pl.accords = ctx.plAccords || 0;
        pl.national = ctx.plNational || 0; pl.defense = ctx.plDefense || 0;
      } catch (e) {}
      return r;
    };
    let result;
    await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
    let w4faced = 0;
    try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
    let finalRank = '?';
    try { finalRank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
    const scaleLines = dayBuf.filter(e => SCALE_LINE_RE.test(e.text)).slice(-120)
      .map(e => `[d${e.day}] ${e.text.slice(0, 220)}`);
    const row = Object.assign(
      { label: LABEL, policy: leadPolicy.id, seed, armed: ARMED, finalRank,
        regionalDay: (Game.state && Game.state.networkLiveDay) || null,
        networkLive: !!((Game.state || {}).networkLive) },
      fc.finalize(Game, m, result),
      sr.finalizeScale(Game, m),
      tune.finalizeStanding(Game, m),
      { linkpipe: finalizeLinkPipe(Game, m), w4faced,
        deathCauses: deathCauses(result), proposelayer: pl, scaleLines }
    );
    rows.push(row);
    const lp = row.linkpipe;
    console.log(`  [${LABEL} s${seed}] d=${row.days} ${row.endReason} rank=${finalRank} ` +
      `formed=${lp.linksFormed} seasoned=${lp.linksSeasoned} prop=${lp.proposals.total} acc=${lp.proposals.accept} ctr=${lp.proposals.counter} ` +
      `plProp=${pl.proposed} plTend=${pl.tended} nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} ` +
      `w4=${w4faced ? 'Y' : 'n'} exiled=${row.exiledEver ? 'Y' : 'n'}`);
  }
  const out = { label: LABEL, armed: ARMED, seeds, days, horizon: '150d death-aware',
    prereg: 'links>=2/8 AND (regional+ by d120 on >=1 seed OR national>=1/8); guards: medSurv>=ctrl-10, starv<=ctrl+9, hungry<=ctrl*1.409, no new death mode, exiled<=ctrl+1',
    rows };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`wrote ${OUT} (${rows.length} rows)`);
  return out;
}

function summarize(doc) {
  const rows = doc.rows;
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const starvDeaths = (r) => Object.keys(r.deathCauses || {}).filter(k => /starvation/i.test(k)).reduce((x, k) => x + r.deathCauses[k], 0);
  const deathModes = (r) => Object.keys(r.deathCauses || {}).sort();
  return {
    label: doc.label, runs: rows.length,
    linksFormed: agg(r => r.linkpipe.linksFormed),
    linksSeasoned: agg(r => r.linkpipe.linksSeasoned),
    proposals: agg(r => r.linkpipe.proposals.total),
    accepts: agg(r => r.linkpipe.proposals.accept),
    counters: agg(r => r.linkpipe.proposals.counter),
    regionalPlus120: agg(r => (r.regionalDay != null && r.regionalDay <= 120) ? 1 : 0),
    regionalEver: agg(r => r.networkLive ? 1 : 0),
    plProposed: agg(r => (r.proposelayer || {}).proposed),
    plTended: agg(r => (r.proposelayer || {}).tended),
    plCounters: agg(r => (r.proposelayer || {}).counters),
    plAccords: agg(r => (r.proposelayer || {}).accords),
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    exiled: agg(r => r.exiledEver || 0),
    starvationDeaths: agg(starvDeaths),
    hungryDays: agg(r => r.starveDays),
    deathModes: [...new Set(rows.flatMap(deathModes))].sort(),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    table: agg(r => r.table), won: agg(r => r.won),
    wave4: agg(r => r.w4faced ? 1 : 0),
    wave5: agg(r => (r.wave5Day != null ? 1 : 0)),
    maxStanding: Math.max(0, ...rows.map(r => (r.endStanding || { total: 0 }).total)),
  };
}

function compare() {
  const cPath = process.env.CONTROL_JSON || 'evidence/2026-10-14/sim-proposelayer-control.json';
  const aPath = process.env.ARMED_JSON || 'evidence/2026-10-14/sim-proposelayer-armed.json';
  const c = summarize(JSON.parse(fs.readFileSync(cPath, 'utf8')));
  const a = summarize(JSON.parse(fs.readFileSync(aPath, 'utf8')));
  console.log('\n=== PROPOSELAYER PILOT: control vs armed (8 seeds x 150d, identical seeds) ===');
  const line = (k, fmt) => console.log(`  ${k}: control=${fmt(c[k])} armed=${fmt(a[k])}`);
  const n = (v) => v;
  line('linksFormed', n); line('linksSeasoned', n); line('proposals', n);
  line('accepts', n); line('counters', n);
  line('regionalPlus120', n); line('regionalEver', n);
  line('plProposed', n); line('plTended', n); line('plCounters', n); line('plAccords', n);
  line('national', n); line('table', n); line('won', n); line('wave4', n); line('wave5', n);
  line('maxStanding', n);
  line('medianDays', n); line('maxDays', n);
  line('starvationDeaths', n); line('hungryDays', n); line('exiled', n);
  console.log(`  deathModes control=[${c.deathModes.join('|')}]`);
  console.log(`  deathModes armed  =[${a.deathModes.join('|')}]`);
  // PRE-REGISTERED VERDICT (§14 — binding)
  const primary = a.linksFormed >= 2 && (a.regionalPlus120 >= 1 || a.national >= 1);
  const newModes = a.deathModes.filter(m => !c.deathModes.includes(m));
  const guards = {
    medianSurvival: a.medianDays >= c.medianDays - 10,
    starvation: a.starvationDeaths <= c.starvationDeaths + 9,
    hungryDays: a.hungryDays <= c.hungryDays * 1.409,
    noNewDeathMode: newModes.length === 0,
    exiled: a.exiled <= c.exiled + 1,
  };
  const guardsHold = Object.values(guards).every(Boolean);
  console.log('\n--- PRE-REGISTERED VERDICT ---');
  console.log(`  PRIMARY links>=2/8 (${a.linksFormed}) AND (regional+120>=1 (${a.regionalPlus120}) OR national>=1 (${a.national})): ${primary ? 'GO' : 'MISS'}`);
  for (const [k, v] of Object.entries(guards)) console.log(`  guard ${k}: ${v ? 'HOLD' : 'MISS'}`);
  if (newModes.length) console.log(`  new death modes: ${newModes.join(', ')}`);
  console.log(`  => ${primary && guardsHold ? 'GO (confirm 12-16 seeds before calling GO)' : 'NO-GO — ' + (primary ? 'primary met but guardrail missed' : 'primary missed') + '. Kill protocol applies.'}`);
  return { control: c, armed: a, primary, guards, go: primary && guardsHold };
}

if (require.main === module) {
  (async () => {
    if (process.env.SMOKE === '1') { await smokeGate(); return; }
    if (process.env.COMPARE === '1') { compare(); return; }
    await runSweep();
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}
module.exports = { runSweep, summarize, compare };
