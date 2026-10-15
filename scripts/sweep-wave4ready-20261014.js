#!/usr/bin/env node
// scripts/sweep-wave4ready-20261014.js — WAVE4READY PILOT SWEEP (the readiness doctrine).
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-wave4ready.md header,
// docs/MEASUREMENT.md §§9-12, 14 — BINDING):
//   axis    : scale-onramp (the wall), lever-8 lens (travel & regional)
//   question: does a readiness-gated diplomacy road to wave 4 (the policy
//             holds the diplomacy bar below 100 until combat-ready, then
//             crosses — delayed, not prevented) survive wave-4 contact
//             better than the ungated diplomacy road?
//   stack   : CONTROL = competent + proposelayer (PROPOSELAYER=1, the
//             diplomacy road — r33 rebuild); ARMED = competent + proposelayer
//             + wave4ready (PROPOSELAYER=1 + WAVE4READY=1, the readiness road).
//             Same code tree, identical seeds, env-var only. Same substrate,
//             same road (sim-findings #230/#231).
//   primary : armed wave-4 unlocks >= control-1 AND armed median survival >=
//             control+5d. (The warroad-trap guard: survival won by never
//             arriving fails the unlock prong.)
//   guard   : national >= control-1; no new death mode (cause-FAMILY level:
//             strip player:/villager:, named monsters -> the `monster`
//             family); starvation deaths <= control+9 (proposelayer A/A p90abs).
//   horizon : 150d death-aware (dead villages stop; +10d tail max).
//   seeds   : 11/22/33/44/55/66/77/88.
//   GO      : primary met at pilot -> confirm 12-16 seeds before calling GO.
//   A miss is NO-GO — never re-scored mid-run.
//
// Usage (control — the diplomacy road):
//   OUT=evidence/2026-10-14/sim-wave4ready-control.json \
//   PROPOSELAYER=1 node scripts/sweep-wave4ready-20261014.js
// Usage (armed — the readiness road):
//   OUT=evidence/2026-10-14/sim-wave4ready-armed.json \
//   PROPOSELAYER=1 WAVE4READY=1 node scripts/sweep-wave4ready-20261014.js
// Compare (after both sides):
//   COMPARE=1 node scripts/sweep-wave4ready-20261014.js
// Instrument-honesty gates:
//   SMOKE=1 PROPOSELAYER=1 node scripts/sweep-wave4ready-20261014.js
//   SMOKE=1 PROPOSELAYER=1 WAVE4READY=1 node scripts/sweep-wave4ready-20261014.js
'use strict';
const fs = require('fs');
const ARMED = process.env.WAVE4READY === '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');
// Landed-tree guard (3184c187 pattern): a killed arm's layers are deleted per
// kill protocol; the sweep then INFO-SKIPs instead of FATALing. Pre-kill
// results (proof/det-gate/sweep/COMPARE) stand; the per-seed JSONs are the
// durable record.
let proposelayer, courtshipPass, wave4ready, combatReady, resolveVillager;
try {
  ({ proposelayer, courtshipPass } = require('./policies/proposelayer'));
  ({ wave4ready, combatReady, resolveVillager } = require('./policies/wave4ready'));
} catch (e) {
  console.log('INFO-SKIP: policy files absent (killed arm, layers deleted per kill protocol). Pre-kill sweep results stand; nothing to run on the landed tree.');
  process.exit(0);
}
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

if (process.env.COMPARE !== '1' && process.env.SMOKE !== '1') {
  if (ARMED && process.env.PROPOSELAYER !== '1') {
    console.error('FATAL: armed side requires PROPOSELAYER=1 + WAVE4READY=1 (same substrate, gated).');
    process.exit(1);
  }
  if (!ARMED && (process.env.PROPOSELAYER !== '1' || process.env.WAVE4READY === '1')) {
    console.error('FATAL: control side requires PROPOSELAYER=1 and WAVE4READY unset (the ungated diplomacy road).');
    process.exit(1);
  }
}
const leadPolicy = ARMED ? wave4ready : proposelayer;
const LABEL = ARMED ? 'wave4ready-armed' : 'wave4ready-control';
const OUT = process.env.OUT || `evidence/2026-10-14/sim-${LABEL}.json`;

function deathCauses(result) {
  const causes = {};
  for (const d of ((result.samples || {}).deaths) || []) {
    const k = String((d.player ? 'player:' : 'villager:') + (d.cause || 'unknown'));
    causes[k] = (causes[k] || 0) + 1;
  }
  return causes;
}
// Cause-family level (r33 metric review #1): strip the player:/villager:
// prefix; named monsters -> the `monster` family. Guardrail compares these.
function deathFamilies(causes) {
  const fams = {};
  for (const k of Object.keys(causes || {})) {
    let f = k.replace(/^(player|villager):/, '');
    if (/^(The |)[A-Z]/.test(f) && !/^(starvation|sickness|combat|monster|exile|old_age|accident|fire|drowning|execution|grief|sacrifice)/i.test(f)) f = 'monster';
    fams[f] = (fams[f] || 0) + causes[k];
  }
  return fams;
}

// INSTRUMENT-HONESTY GATE: SMOKE=1 runs a short live smoke BEFORE any sweep
// spend and FAILS LOUDLY unless (a) the policy is genuinely driving
// (unwrapped daily is a function; harness invokes it; >=1 policy-origin
// deliberate act fires) and (b) the side's own layer fires through its own
// path (control: courtshipPass fires the real proposeLink on the window
// fixture; armed: the readiness gate HOLDS the 3rd proposal while not-ready
// and RELEASES it once ready, on the 2-sub fixture).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  check('unwrapped policy.daily is a function', leadPolicy && typeof leadPolicy.daily === 'function',
    'typeof=' + (leadPolicy && typeof leadPolicy.daily) + ' id=' + (leadPolicy && leadPolicy.id));
  check('policy id matches side', ARMED ? leadPolicy.id === 'wave4ready' : leadPolicy.id === 'proposelayer',
    'id=' + leadPolicy.id + ' ARMED=' + ARMED);
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  const { Game } = await loadGame({ seed: 11, mode: 'wave4ready-smoke' });
  await setupGame(Game);
  let result = null;
  const policy = Object.assign({}, leadPolicy);
  const origDaily = leadPolicy.daily;
  policy.daily = (G, ctx) => origDaily(G, ctx);
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
  if (!ARMED) {
    // (b-control) courtshipPass fires the real proposeLink on the window fixture
    const { Game: G2 } = await loadGame({ seed: 12, mode: 'wave4ready-smoke2' });
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
  } else {
    // (b-armed) the readiness gate holds/releases the 3rd proposal on the 2-sub fixture
    const { Game: G2 } = await loadGame({ seed: 13, mode: 'wave4ready-smoke3' });
    await setupGame(G2);
    G2.state.scholar.day = 30;
    const v = (G2.state.otherVillages || [])[0];
    if (v) v.rumored = true;
    G2.state.village.pantry = [{ id: 'smoke', kcalEach: 13000, units: 1, foodState: 'fresh' }];
    const fakes = [1, 2].map(i => ({ id: 'smk' + i, status: 'active', primary: 'haven', conquered: false, subordinate: 'v' + i, day: 20 }));
    const origHS = G2.hierarchyState;
    G2.hierarchyState = () => fakes;
    const callsHold = [];
    const orig = G2.proposeLink;
    G2.proposeLink = function (...a) { callsHold.push(a); return orig.apply(this, a); };
    courtshipPass(G2, {}, { readinessGate: () => combatReady(G2) });
    const holdCalls = callsHold.length;
    const rNotReady = combatReady(G2);
    G2.proposeLink = orig;
    G2.hierarchyState = origHS;
    check('WAVE4READY=1: gate HOLDS the 3rd proposal while not-ready',
      holdCalls === 0 && rNotReady.ready === false,
      `proposeLink calls=${holdCalls} ready=${rNotReady.ready} signals=${JSON.stringify(rNotReady.signals)}`);
    // release: rig all three signals, the 3rd proposal must fire
    G2.state.scholar.equipped = { torso: { itemId: 'hide_armor' } };
    for (const id of (G2.state.village.roster || []).slice(0, 3)) {
      const vv = resolveVillager(G2, id);
      if (vv) vv.equipped = { melee: { itemId: 'stone_knife' } };
    }
    try { G2.recordWaveKill('redactor', 'player', 'test', null); } catch (e) {}
    const rReady = combatReady(G2);
    G2.hierarchyState = () => fakes;
    const callsRel = [];
    G2.proposeLink = function (...a) { callsRel.push(a); return orig.apply(this, a); };
    const ctx2 = {};
    courtshipPass(G2, ctx2, { readinessGate: () => combatReady(G2) });
    G2.proposeLink = orig;
    G2.hierarchyState = origHS;
    check('WAVE4READY=1: gate RELEASES the 3rd proposal once ready',
      callsRel.length === 1 && (ctx2.plProposed || 0) === 1 && rReady.ready === true,
      `proposeLink calls=${callsRel.length} ready=${rReady.ready}`);
  }
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: harness drives the policy and the side layer fires when armed.');
}

const SCALE_LINE_RE = /propose|counter|accord|tribute|regional|dawn|network is|first court|one organization|seasoned|realm|subordinate|link with|cold ink|gesture|standing|mirror draft|wave 4|readiness|ready/i;
const COMBAT_LINE_RE = /congregation|the strike|influencer|audit|reunion|suburb|eulogy|algorithm|the eater|herald|mirror draft|wave-4|wave 4/i;

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const seed of seeds) {
    console.log(`  [${LABEL} s${seed}] starting…`);
    const { Game } = await loadGame({ seed, mode: 'wave4ready-' + LABEL });
    await setupGame(Game);
    let dayBuf = [];
    const cap = (s) => {
      try {
        if (typeof s === 'string' && s.length) {
          const d = ((Game.state.scholar || {}).day) || 0;
          dayBuf.push({ day: d, text: String(s) });
          if (dayBuf.length > 1200) dayBuf.splice(0, dayBuf.length - 1200);
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
    m.w4r = { rows: [] };
    const policy = Object.assign({}, leadPolicy);
    const origDaily = leadPolicy.daily;
    const pp = m.linkpipe;
    const side = { proposed: 0, tended: 0, counters: 0, accords: 0, national: 0, defense: 0 };
    policy.daily = (G, ctx) => {
      try { pp.snapshot(G, LABEL); } catch (e) {}
      try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
      try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
      try { m.standing.rows.push(tune.standingSample(G)); } catch (e) {}
      let r;
      if (origDaily) { try { r = origDaily(G, ctx); } catch (e) {} }
      try {
        side.proposed = ctx.plProposed || 0; side.tended = ctx.plTended || 0;
        side.counters = ctx.plCounters || 0; side.accords = ctx.plAccords || 0;
        side.national = ctx.plNational || 0; side.defense = ctx.plDefense || 0;
        // Readiness trajectory on BOTH sides (the control's counterfactual:
        // when would the ungated road have been "ready"?). Deterministic —
        // det-gate safe.
        const w = combatReady(G);
        if (w) m.w4r.rows.push({ day: (G.state.scholar || {}).day || 0, ready: !!w.ready,
          armorP: w.signals.armorP | 0, armed: w.signals.armedVillagers | 0, warPts: w.signals.warPts | 0 });
      } catch (e) {}
      return r;
    };
    let result;
    await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
    let w4faced = 0, w5faced = 0;
    try { w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
    try { w5faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(5) | 0) : 0; } catch (e) {}
    let finalRank = '?';
    try { finalRank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
    const lines = dayBuf.filter(e => SCALE_LINE_RE.test(e.text) || COMBAT_LINE_RE.test(e.text)).slice(-160)
      .map(e => `[d${e.day}] ${e.text.slice(0, 220)}`);
    const st = tune.finalizeStanding(Game, m);
    // readiness trajectory: first day the doctrine reported ready; max signals.
    let firstReadyDay = null, maxArmorP = 0, maxArmed = 0, maxWarPts = 0;
    for (const rowW of m.w4r.rows) {
      if (rowW.armorP > maxArmorP) maxArmorP = rowW.armorP;
      if (rowW.armed > maxArmed) maxArmed = rowW.armed;
      if (rowW.warPts > maxWarPts) maxWarPts = rowW.warPts;
      if (rowW.ready && firstReadyDay == null) firstReadyDay = rowW.day;
    }
    const row = Object.assign(
      { label: LABEL, policy: leadPolicy.id, seed, armed: ARMED, finalRank,
        regionalDay: (Game.state && Game.state.networkLiveDay) || null,
        networkLive: !!((Game.state || {}).networkLive) },
      fc.finalize(Game, m, result),
      sr.finalizeScale(Game, m),
      { standing: st, t4Day: st.t4Day, wave4Day: st.wave4Day, wave5Day: st.wave5Day,
        t4Driver: st.driver, atT4: st.atT4, endStanding: st.endStanding },
      { linkpipe: finalizeLinkPipe(Game, m), w4faced, w5faced,
        deathCauses: deathCauses(result), side, lines,
        readiness: { firstReadyDay, maxArmorP, maxArmed, maxWarPts } }
    );
    rows.push(row);
    const lp = row.linkpipe;
    const es = st.endStanding || {};
    console.log(`  [${LABEL} s${seed}] d=${row.days} ${row.endReason} rank=${finalRank} ` +
      `w4day=${st.wave4Day == null ? '-' : st.wave4Day} driver=${st.driver} ` +
      `stand(tot=${es.total}|w=${es.war}|d=${es.diplomacy}|p=${es.plenty}) ` +
      `links=${lp.linksFormed}/${lp.linksSeasoned} ` +
      `ready=${firstReadyDay == null ? '-' : 'd' + firstReadyDay}(P${maxArmorP}/a${maxArmed}/w${maxWarPts}) ` +
      `nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} exiled=${row.exiledEver ? 'Y' : 'n'}`);
  }
  const out = { label: LABEL, armed: ARMED, seeds, days, horizon: '150d death-aware',
    prereg: 'PRIMARY: armed wave4unlocks >= control-1 AND armed medianDays >= control+5d; guards: national>=control-1, no new death mode (family level), starvation<=control+9',
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
  const famAgg = {};
  for (const r of rows) {
    const f = deathFamilies(r.deathCauses);
    for (const k of Object.keys(f)) famAgg[k] = (famAgg[k] || 0) + f[k];
  }
  return {
    label: doc.label, runs: rows.length,
    wave4unlocks: agg(r => (r.wave4Day != null ? 1 : 0)),
    t4drivers: rows.filter(r => r.wave4Day != null).map(r => `s${r.seed}:${r.t4Driver}@d${r.wave4Day}`),
    readyDays: rows.map(r => `s${r.seed}:${(r.readiness || {}).firstReadyDay == null ? '-' : 'd' + r.readiness.firstReadyDay}`),
    linksFormed: agg(r => r.linkpipe.linksFormed),
    linksSeasoned: agg(r => r.linkpipe.linksSeasoned),
    regionalPlus120: agg(r => (r.regionalDay != null && r.regionalDay <= 120) ? 1 : 0),
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    exiled: agg(r => r.exiledEver || 0),
    starvationDeaths: agg(starvDeaths),
    hungryDays: agg(r => r.starveDays),
    deathFamilies: famAgg,
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    table: agg(r => r.table), won: agg(r => r.won),
    wave4faced: agg(r => r.w4faced ? 1 : 0),
    wave5: agg(r => (r.wave5Day != null ? 1 : 0)),
    maxStanding: Math.max(0, ...rows.map(r => ((r.endStanding || {}).total) || 0)),
  };
}

function compare() {
  const cPath = process.env.CONTROL_JSON || 'evidence/2026-10-14/sim-wave4ready-control.json';
  const aPath = process.env.ARMED_JSON || 'evidence/2026-10-14/sim-wave4ready-armed.json';
  const c = summarize(JSON.parse(fs.readFileSync(cPath, 'utf8')));
  const a = summarize(JSON.parse(fs.readFileSync(aPath, 'utf8')));
  console.log('\n=== WAVE4READY PILOT: control (diplomacy road) vs armed (readiness road) — 8 seeds x 150d, identical seeds ===');
  const line = (k, fmt) => console.log(`  ${k}: control=${fmt(c[k])} armed=${fmt(a[k])}`);
  const n = (v) => v;
  line('wave4unlocks', n);
  console.log(`  t4drivers control=[${c.t4drivers.join(' ')}]`);
  console.log(`  t4drivers armed  =[${a.t4drivers.join(' ')}]`);
  console.log(`  readyDays control=[${c.readyDays.join(' ')}]`);
  console.log(`  readyDays armed  =[${a.readyDays.join(' ')}]`);
  line('linksFormed', n); line('linksSeasoned', n);
  line('regionalPlus120', n); line('national', n); line('table', n); line('won', n);
  line('wave4faced', n); line('wave5', n); line('maxStanding', n);
  line('medianDays', n); line('maxDays', n);
  line('starvationDeaths', n); line('hungryDays', n); line('exiled', n);
  console.log(`  deathFamilies control=${JSON.stringify(c.deathFamilies)}`);
  console.log(`  deathFamilies armed  =${JSON.stringify(a.deathFamilies)}`);
  // PRE-REGISTERED VERDICT (§14 — binding)
  const primary = a.wave4unlocks >= c.wave4unlocks - 1 && a.medianDays >= c.medianDays + 5;
  const newFams = Object.keys(a.deathFamilies).filter(k => !(k in c.deathFamilies));
  const guards = {
    national: a.national >= c.national - 1,
    noNewDeathMode: newFams.length === 0,
    starvation: a.starvationDeaths <= c.starvationDeaths + 9,
  };
  const guardsHold = Object.values(guards).every(Boolean);
  console.log('\n--- PRE-REGISTERED VERDICT ---');
  console.log(`  PRIMARY wave4unlocks armed(${a.wave4unlocks})>=control(${c.wave4unlocks})-1 AND medianDays armed(${a.medianDays})>=control(${c.medianDays})+5: ${primary ? 'GO' : 'MISS'}`);
  for (const [k, v] of Object.entries(guards)) console.log(`  guard ${k}: ${v ? 'HOLD' : 'MISS'}`);
  if (newFams.length) console.log(`  new death families: ${newFams.join(', ')}`);
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
