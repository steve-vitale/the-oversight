#!/usr/bin/env node
// scripts/sweep-hybridroad-20261014.js — HYBRIDROAD PILOT SWEEP (scale-onramp ARM, r35).
//
// PRE-REGISTRATION (evidence/2026-10-14/sim-hybridroad.md header,
// docs/MEASUREMENT.md §§9-12, 14 — BINDING):
//   axis    : scale-onramp (the wall).
//   question: does the hybrid road (diplomacy drive + modest wave-3 hunt
//             banking the 2-point recipe + post-unlock readiness hold) reach
//             wave 4 AND hold it where the diplomacy road reaches it and
//             bleeds? r34 ARM-2 hint: control s66 survived wave-4 contact to
//             150d and reached global with diplomacy + 2 organic wave-3 kills.
//   stack   : CONTROL = competent + proposelayer (PROPOSELAYER=1 — the
//             diplomacy road, r33/r34 rebuild, behaviorally identical);
//             ARMED = competent + hybridroad (HYBRIDROAD=1 +
//             COMPETENT_DIRECTIONAL_FLEE=1 — the readiness hold rides
//             competent's recover-and-return machinery; directional-flee
//             confound disclosed in evidence).
//             Same code tree, identical seeds, env-var only.
//   primary : villages alive at d+30 post-wave-4-unlock >= control AND
//             wave-4 unlocks >= control-1.
//   guard   : median survival >= control-10d; national >= control-2;
//             no new death mode (cause-family level; COUNT FLOOR per r34
//             metric review: >=2 events on a side to fire — singleton noise
//             doesn't count).
//   horizon : 150d death-aware (dead villages stop; +10d tail max).
//   seeds   : 11/22/33/44/55/66/77/88.
//   GO      : primary met at pilot -> confirm 12-16 seeds before calling GO.
//   A miss is NO-GO — never re-scored mid-run.
//
// Usage (control — the diplomacy road):
//   OUT=evidence/2026-10-14/sim-hybridroad-control.json \
//   PROPOSELAYER=1 node scripts/sweep-hybridroad-20261014.js
// Usage (armed — the hybrid road):
//   OUT=evidence/2026-10-14/sim-hybridroad-armed.json \
//   HYBRIDROAD=1 COMPETENT_DIRECTIONAL_FLEE=1 node scripts/sweep-hybridroad-20261014.js
// Compare (after both sides):
//   COMPARE=1 node scripts/sweep-hybridroad-20261014.js
// Instrument-honesty gates:
//   SMOKE=1 PROPOSELAYER=1 node scripts/sweep-hybridroad-20261014.js
//   SMOKE=1 HYBRIDROAD=1 COMPETENT_DIRECTIONAL_FLEE=1 node scripts/sweep-hybridroad-20261014.js
'use strict';
const fs = require('fs');
const ARMED = process.env.HYBRIDROAD === '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { proposelayer, courtshipPass } = require('./policies/proposelayer');
const { hybridroad } = require('./policies/hybridroad');
const { attachLinkPipe, finalizeLinkPipe } = require('./link-pipeline-20261014');
const tune = require('./sweep-standing-tune-20261013');
const sr = require('./scale-repro-20261013');
const fc = require('./food-coupling-20261013');

if (process.env.COMPARE !== '1' && process.env.SMOKE !== '1') {
  if (ARMED && process.env.PROPOSELAYER === '1') {
    console.error('FATAL: set exactly one of HYBRIDROAD / PROPOSELAYER per sweep side.');
    process.exit(1);
  }
  if (!ARMED && process.env.PROPOSELAYER !== '1') {
    console.error('FATAL: control side requires PROPOSELAYER=1 (the diplomacy road).');
    process.exit(1);
  }
  if (ARMED && process.env.COMPETENT_DIRECTIONAL_FLEE !== '1') {
    console.error('FATAL: armed side requires COMPETENT_DIRECTIONAL_FLEE=1 (the readiness hold rides recovering()).');
    process.exit(1);
  }
}
const leadPolicy = ARMED ? hybridroad : proposelayer;
const LABEL = ARMED ? 'hybridroad-armed' : 'proposelayer-control';
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
// fixture; armed: the hunt leg fires on the wave-3-unlocked fixture AND the
// readiness hold fires on the hurt post-unlock fixture).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    const ok = !!cond;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!ok) fails.push(name);
  };
  check('unwrapped policy.daily is a function', leadPolicy && typeof leadPolicy.daily === 'function',
    'typeof=' + (leadPolicy && typeof leadPolicy.daily) + ' id=' + (leadPolicy && leadPolicy.id));
  check('policy id matches side', ARMED ? leadPolicy.id === 'hybridroad' : leadPolicy.id === 'proposelayer',
    'id=' + leadPolicy.id + ' ARMED=' + ARMED);
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure — the suite would run policy-less.'); process.exit(1); }
  const { Game } = await loadGame({ seed: 11, mode: 'hybridroad-smoke' });
  await setupGame(Game);
  let result = null;
  const policy = Object.assign({}, leadPolicy);
  const origDaily = leadPolicy.daily;
  policy.daily = (G, ctx) => origDaily(G, ctx);
  await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
  const pacing = result.pacing || {};
  check('harness invokes policy.daily (mean deliberate/day>0)', (pacing.meanDeliberatePerDay || 0) > 0,
    'mean=' + (pacing.meanDeliberatePerDay || 0));
  if (!ARMED) {
    // (b-control) courtshipPass fires the real proposeLink on the window fixture
    const { Game: G2 } = await loadGame({ seed: 12, mode: 'hybridroad-smoke2' });
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
    // (b-armed) the hunt leg fires on the wave-3-unlocked fixture
    const { Game: G2 } = await loadGame({ seed: 13, mode: 'hybridroad-smoke3' });
    await setupGame(G2);
    G2.state.scholar.day = 30;
    for (const id of ['bulldozer', 'hushwolf', 'gallowdeer', 'mirrormoth', 'belltoad']) G2.recordWaveKill(id, 'player', 'test', null);
    for (const id of ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea']) G2.recordWaveKill(id, 'player', 'test', null);
    const w3 = (typeof G2.unlockedWave === 'function') ? G2.unlockedWave() : 0;
    const s = G2.state.scholar;
    try { s.hp = (typeof G2.maxHealth === 'function' ? G2.maxHealth() : 100); } catch (e) { s.hp = 100; }
    s.kcal = 800;
    const ctx = {};
    try { hybridroad.daily(G2, ctx); } catch (e) {}
    check('HYBRIDROAD=1: hunt leg fires on the wave-3-unlocked fixture',
      w3 >= 3 && (ctx.hybridHunts || 0) >= 1, `wave=${w3} hunts=${ctx.hybridHunts || 0} legs=${ctx.hybridHuntLegs || 0}`);
    // (c-armed) the readiness hold fires on the hurt post-unlock fixture
    const { Game: G3 } = await loadGame({ seed: 14, mode: 'hybridroad-smoke4' });
    await setupGame(G3);
    G3.state.scholar.day = 80;
    G3.unlockedWave = () => 4;
    const s3 = G3.state.scholar;
    try { s3.hp = Math.round((typeof G3.maxHealth === 'function' ? G3.maxHealth() : 100) * 0.5); } catch (e) { s3.hp = 50; }
    s3.kcal = 800;
    const ctx3 = {};
    try { hybridroad.daily(G3, ctx3); } catch (e) {}
    check('HYBRIDROAD=1: readiness hold fires when hurt post-unlock',
      (ctx3._recoverUntilDay || 0) > 80 && (ctx3.hybridHolds || 0) >= 1,
      `recoverUntil=${ctx3._recoverUntilDay || 0} holds=${ctx3.hybridHolds || 0}`);
  }
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: harness drives the policy and the side layer fires when armed.');
}

const SCALE_LINE_RE = /propose|counter|accord|tribute|regional|dawn|network is|first court|one organization|seasoned|realm|subordinate|link with|cold ink|gesture|standing|mirror draft|wave 4|recover|hold at|hunt/i;
const COMBAT_LINE_RE = /congregation|the strike|influencer|audit|reunion|suburb|eulogy|algorithm|the eater|herald|mirror draft|wave-4|wave 4/i;

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const seed of seeds) {
    console.log(`  [${LABEL} s${seed}] starting…`);
    const { Game } = await loadGame({ seed, mode: 'hybridroad-' + LABEL });
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
    const policy = Object.assign({}, leadPolicy);
    const origDaily = leadPolicy.daily;
    const pp = m.linkpipe;
    const side = { proposed: 0, tended: 0, counters: 0, accords: 0, national: 0, defense: 0,
                   hunts: 0, huntLegs: 0, huntEngaged: 0, huntFights: 0,
                   hybridHunts: 0, hybridHuntLegs: 0, hybridHuntFights: 0, hybridHolds: 0, recoverDays: 0 };
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
        side.hunts = ctx.hunts || 0; side.huntLegs = ctx.huntLegs || 0;
        side.huntEngaged = ctx.huntEngaged || 0; side.huntFights = ctx.huntFights || 0;
        side.hybridHunts = ctx.hybridHunts || 0; side.hybridHuntLegs = ctx.hybridHuntLegs || 0;
        side.hybridHuntFights = ctx.hybridHuntFights || 0; side.hybridHolds = ctx.hybridHolds || 0;
        side.recoverDays = ctx.recoverDays || 0;
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
    const row = Object.assign(
      { label: LABEL, policy: leadPolicy.id, seed, armed: ARMED, finalRank,
        regionalDay: (Game.state && Game.state.networkLiveDay) || null,
        networkLive: !!((Game.state || {}).networkLive) },
      fc.finalize(Game, m, result),
      sr.finalizeScale(Game, m),
      { standing: st, t4Day: st.t4Day, wave4Day: st.wave4Day, wave5Day: st.wave5Day,
        t4Driver: st.driver, atT4: st.atT4, endStanding: st.endStanding },
      { linkpipe: finalizeLinkPipe(Game, m), w4faced, w5faced,
        deathCauses: deathCauses(result), side, lines }
    );
    rows.push(row);
    const lp = row.linkpipe;
    const es = st.endStanding || {};
    console.log(`  [${LABEL} s${seed}] d=${row.days} ${row.endReason} rank=${finalRank} ` +
      `w4day=${st.wave4Day == null ? '-' : st.wave4Day} driver=${st.driver} ` +
      `stand(tot=${es.total}|w=${es.war}|d=${es.diplomacy}|p=${es.plenty}) ` +
      `links=${lp.linksFormed}/${lp.linksSeasoned} hunts=${side.hybridHunts || side.hunts}/${side.hybridHuntFights || side.huntFights} ` +
      `holds=${side.hybridHolds} rec=${side.recoverDays} ` +
      `nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} exiled=${row.exiledEver ? 'Y' : 'n'}`);
  }
  const out = { label: LABEL, armed: ARMED, seeds, days, horizon: '150d death-aware',
    prereg: 'PRIMARY: alive30post(w4) >= control AND wave4unlocks >= control-1; guards: medSurv>=ctrl-10, national>=ctrl-2, no new death mode (family level, >=2 events to fire)',
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
  // alive30post: wave-4 unlocked AND the village lived to unlockDay+30.
  const alive30 = (r) => (r.wave4Day != null && r.days >= r.wave4Day + 30) ? 1 : 0;
  const censored = (r) => (r.wave4Day != null && r.days < r.wave4Day + 30 && /survived/i.test(r.endReason || '')) ? 1 : 0;
  return {
    label: doc.label, runs: rows.length,
    wave4unlocks: agg(r => (r.wave4Day != null ? 1 : 0)),
    alive30post: agg(alive30),
    censored30: agg(censored),
    t4drivers: rows.filter(r => r.wave4Day != null).map(r => `s${r.seed}:${r.t4Driver}`),
    linksFormed: agg(r => r.linkpipe.linksFormed),
    linksSeasoned: agg(r => r.linkpipe.linksSeasoned),
    hunts: agg(r => (r.side || {}).hybridHunts || (r.side || {}).hunts),
    huntFights: agg(r => (r.side || {}).hybridHuntFights || (r.side || {}).huntFights),
    hybridHolds: agg(r => (r.side || {}).hybridHolds),
    recoverDays: agg(r => (r.side || {}).recoverDays),
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
  const cPath = process.env.CONTROL_JSON || 'evidence/2026-10-14/sim-hybridroad-control.json';
  const aPath = process.env.ARMED_JSON || 'evidence/2026-10-14/sim-hybridroad-armed.json';
  const c = summarize(JSON.parse(fs.readFileSync(cPath, 'utf8')));
  const a = summarize(JSON.parse(fs.readFileSync(aPath, 'utf8')));
  console.log('\n=== HYBRIDROAD PILOT: control (diplomacy road) vs armed (hybrid road) — 8 seeds x 150d, identical seeds ===');
  const line = (k, fmt) => console.log(`  ${k}: control=${fmt(c[k])} armed=${fmt(a[k])}`);
  const n = (v) => v;
  line('wave4unlocks', n); line('alive30post', n); line('censored30', n);
  console.log(`  t4drivers control=[${c.t4drivers.join(' ')}]`);
  console.log(`  t4drivers armed  =[${a.t4drivers.join(' ')}]`);
  line('linksFormed', n); line('linksSeasoned', n); line('hunts', n); line('huntFights', n);
  line('hybridHolds', n); line('recoverDays', n);
  line('regionalPlus120', n); line('national', n); line('table', n); line('won', n);
  line('wave4faced', n); line('wave5', n); line('maxStanding', n);
  line('medianDays', n); line('maxDays', n);
  line('starvationDeaths', n); line('hungryDays', n); line('exiled', n);
  console.log(`  deathFamilies control=${JSON.stringify(c.deathFamilies)}`);
  console.log(`  deathFamilies armed  =${JSON.stringify(a.deathFamilies)}`);
  // PRE-REGISTERED VERDICT (§14 — binding)
  const primary = a.alive30post >= c.alive30post && a.wave4unlocks >= c.wave4unlocks - 1;
  // COUNT FLOOR (r34 metric review): a family fires the no-new-death-mode
  // guardrail only at >=2 events on the armed side.
  const newFams = Object.keys(a.deathFamilies).filter(k => !(k in c.deathFamilies) && (a.deathFamilies[k] || 0) >= 2);
  const guards = {
    medianSurvival: a.medianDays >= c.medianDays - 10,
    national: a.national >= c.national - 2,
    noNewDeathMode: newFams.length === 0,
  };
  const guardsHold = Object.values(guards).every(Boolean);
  console.log('\n--- PRE-REGISTERED VERDICT ---');
  console.log(`  PRIMARY alive30post armed(${a.alive30post})>=control(${c.alive30post}) [censored: c=${c.censored30} a=${a.censored30}] AND wave4unlocks armed(${a.wave4unlocks})>=control(${c.wave4unlocks})-1: ${primary ? 'GO' : 'MISS'}`);
  for (const [k, v] of Object.entries(guards)) console.log(`  guard ${k}: ${v ? 'HOLD' : 'MISS'}`);
  if (newFams.length) console.log(`  new death families (>=2 events): ${newFams.join(', ')}`);
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
