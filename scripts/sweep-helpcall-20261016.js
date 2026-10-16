#!/usr/bin/env node
'use strict';
// sweep-helpcall-20261016.js — paired sweep for the sim-helpcall arm.
//
// The arm engages the aid system: on an apex raid crisis (crisis.raiders &&
// wave>=3) the policy calls Game.callForHelp('runner', {}), recording every
// placement + every aidAskVillage verdict into Game.state.hcLedger.
//
// One side per invocation: HELPCALL=1 (armed, HC.leadhc/HC.belonghc) vs
// HELPCALL unset/0 (control, TF.leadfeast/TF.belongfeast). Same tree, same
// seeds, same substrate — the gate is the only switch.
//
// Substrate (pre-registration): SEATDRIVE=0 explicit (pre-seat courtship),
// FEASTSCALE_R13=1, NODEWITNESS=1. Policies: leadfeast / belongfeast
// (tribfloor). Horizon 180d death-aware. 8 fresh seeds [951..958] x 2
// policies x {control,armed} = 32 runs. Per-seed JSONs carry the wall keys
// (national/table/wins/exiled), the hc attribution ledger summary, and
// raid-attributed death counts.
//
// PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14):
//   PRIMARY (diagnostic GO): >=1 aid engagement (accepted help leading to
//     aid arrival, OR refusal with attributed reason) on called apex raids,
//     with 100% attribution of every help call placed.
//   SECONDARY (lever read): post-invite raid-attributed deaths armed vs
//     control (raid marker = havenRaidTick's opts.raid or m.lingering,
//     the fieldfightsrc recipe).
//   Guardrails: no new death mode (aid-runner road deaths are an
//     engine-existing mode the arm engages — counted separately and
//     reported, not hidden); national >= control-2; median survival >=
//     control-10d; no aid-system errors (hcLedger.errors).
//
// Run (armed):   SEATDRIVE=0 FEASTSCALE_R13=1 NODEWITNESS=1 HELPCALL=1 node scripts/sweep-helpcall-20261016.js
// Run (control): SEATDRIVE=0 FEASTSCALE_R13=1 NODEWITNESS=1 node scripts/sweep-helpcall-20261016.js
//   SEEDS=951,952 node scripts/sweep-helpcall-20261016.js   (subset)
//   RESUME=1 ... (skip runs already complete)
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const HC = require('./policies/helpcall');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [951, 952, 953, 954, 955, 956, 957, 958]).filter(Number.isFinite);
const ARMED = process.env.HELPCALL === '1';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-helpcall');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'helpcall-beats');

for (const k of ['FEASTSCALE_R13', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`SUBSTRATE: ${k} must be 1`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SUBSTRATE: SEATDRIVE must be 0 explicit (pre-seat courtship)'); process.exit(2); }
if (ARMED && !HC.layerOn()) { console.error('WRONG SIDE: HELPCALL=1 but layerOn() false'); process.exit(3); }
if (!ARMED && HC.layerOn()) { console.error('WRONG SIDE: control but layerOn() true'); process.exit(3); }

function policyFor(policyId) {
  if (ARMED) return policyId === 'leadfeast' ? HC.leadhc : HC.belonghc;
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// Read-only raid/aid beat recorder: captures the beats the sense-read
// needs without altering output.
function withRaidBeats(Game) {
  const rec = { beats: [] };
  const orig = Game.say;
  Game.say = function (s) {
    try {
      const t = String(s || '');
      if (/RAID|🚨|aid crisis|call for help|signal fire|runner|sprint|arrived|refused|stood-down|empty-handed|treeline|beacon|debt/i.test(t)) {
        const day = gday(Game);
        if (rec.beats.length < 400) rec.beats.push({ day, text: t.slice(0, 280) });
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  return rec;
}

// Raid-attributed death capture: the fieldfightsrc recipe (engine markers,
// not reconstruction). Wraps resolveWildMonsterEncounter + fieldFight with
// a fight-context stack; registerDeath reads the stack top for
// havenRaidTick's opts.raid or the raiders' m.lingering.
function installRaidDeathCapture(Game) {
  if (Game.__hcDeathInstalled) return;
  Game.__hcDeathInstalled = true;
  Game.state.hcRaidDeaths = [];
  const stack = [];
  const wrap = (name, tagFn) => {
    const fn = Game[name];
    if (typeof fn !== 'function' || fn.__hcWrapped) return;
    const orig = fn.bind(Game);
    const w = function () {
      const tag = tagFn(Array.prototype.slice.call(arguments));
      const top = stack.length ? stack[stack.length - 1] : null;
      if (top && tag.lingering) { top.raid = true; top.lingering = true; }
      stack.push(tag);
      try { return orig.apply(this, arguments); }
      finally { stack.pop(); }
    };
    w.__hcWrapped = true;
    Game[name] = w;
  };
  wrap('resolveWildMonsterEncounter', (a) => ({ raid: !!(a[2] && a[2].raid), lingering: !!(a[1] && a[1].lingering) }));
  wrap('fieldFight', (a) => ({ raid: false, lingering: !!(a[2] && a[2].lingering) }));
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (!origReg) return;
  Game.registerDeath = function (opts) {
    try {
      const top = stack.length ? stack[stack.length - 1] : null;
      const o = opts || {};
      if (top && (top.raid || top.lingering) && Game.state.hcRaidDeaths.length < 1200) {
        Game.state.hcRaidDeaths.push({
          day: gday(Game), kind: String(o.kind || '?'), name: String(o.name || '').slice(0, 40),
          vid: String(o.villagerId || o.monsterId || '').slice(0, 24), cause: String(o.cause || '').slice(0, 60),
        });
      }
    } catch (e) {}
    return origReg(opts);
  };
}

function summarizeLedger(Game) {
  const out = { placements: 0, retCounts: {}, verdictCounts: {}, accepted: 0, refused: 0,
    aidArrived: 0, aidArrivedParty: 0, errors: 0, unattributed: 0, enRoute: 0, matched: [],
    rawCalls: [], rawVerdicts: [] };
  let led = null;
  try { led = Game.state.hcLedger || null; } catch (e) {}
  if (!led) return out;
  const calls = led.calls || [], verdicts = (led.verdicts || []).slice().sort((a, b) => (a.day - b.day));
  out.rawCalls = calls.map(c => ({ day: c.day, wave: c.wave, tier: c.tier, ret: c.ret, target: c.targetId, runner: c.runner }));
  out.rawVerdicts = verdicts.map(v => ({ day: v.day, via: v.via, village: v.villageId, verdict: v.verdict }));
  let runners = [];
  try { runners = Game.state.aidRunners || []; } catch (e) {}
  out.placements = calls.length;
  for (const c of calls) { const r = String(c.ret || '?'); out.retCounts[r] = (out.retCounts[r] || 0) + 1; }
  for (const v of verdicts) { const r = String(v.verdict || '?'); out.verdictCounts[r] = (out.verdictCounts[r] || 0) + 1; }
  out.errors = (led.errors || []).length;
  // Aid arrivals: the engine's own ledger events ('aid-arrived:<v>:<n>').
  try {
    const evs = ((Game.progState ? Game.progState() : {}) || {}).ledgerEvents || [];
    for (const e of evs) {
      if (e && e.sys === 'comms' && String(e.ev || '').indexOf('aid-arrived:') === 0) {
        out.aidArrived++;
        const n = parseInt(String(e.ev).split(':')[2], 10);
        if (Number.isFinite(n)) out.aidArrivedParty += n;
      }
    }
  } catch (e) {}
  // 100% attribution: every 'sent' placement matches one verdict
  // (via runner, same target village, day >= placement day), oldest first.
  const used = new Set();
  for (const c of calls.slice().sort((a, b) => (a.day - b.day))) {
    if (c.ret !== 'sent') continue;
    let hit = null;
    for (let i = 0; i < verdicts.length; i++) {
      const v = verdicts[i];
      if (used.has(i)) continue;
      if (v.via === 'runner' && v.villageId === String(c.targetId || '') && v.day >= c.day) { hit = { i, v }; break; }
    }
    if (hit) {
      used.add(hit.i);
      out.matched.push({ day: c.day, target: String(c.targetId || ''), verdict: hit.v.verdict, vday: hit.v.day });
      if (hit.v.verdict === 'accepted') out.accepted++;
      else if (hit.v.verdict === 'refused') out.refused++;
    } else if (runners.some(rn => String((rn || {}).targetId || '') === String(c.targetId || ''))) {
      // The runner is still on the road (or walking home) when the run
      // ended — the verdict never had a day to fire. Fully attributed as
      // en-route-at-run-end, never "unattributed".
      out.enRoute++;
      out.matched.push({ day: c.day, target: String(c.targetId || ''), verdict: 'en-route-at-run-end', vday: null });
    } else {
      out.unattributed++;
    }
  }
  return out;
}

async function oneRun(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: 'helpcall', fullTelemetry: false });
  await setupGame(Game, null, 'courtship');
  installRaidDeathCapture(Game);
  const rb = withRaidBeats(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policyFor(policyId), { days: DAYS, manifest: { seed } }); });
  const samples = result.samples || {};
  const scaleRows = samples.scale || [];
  const national = scaleRows.some(r => r[1] === 'national' || r[1] === 'global') ? 1 : 0;
  let table = 0;
  try { const pg = Game.progState ? Game.progState() : {}; table = (pg.tableWaiting || pg.tableDone) ? 1 : 0; } catch (e) {}
  const deaths = samples.deaths || [];
  const causeCounts = {};
  for (const d of deaths) { const c = String((d && d.cause) || 'unknown'); causeCounts[c] = (causeCounts[c] || 0) + 1; }
  const raidDeaths = (Game.state.hcRaidDeaths || []);
  const hc = summarizeLedger(Game);
  const out = {
    seed, policyId, armed: ARMED, mode: 'helpcall',
    days: result.days, gameDays: result.gameDays, finalEngineDay: result.gameDays,
    endReason: result.endReason,
    won: !!Game.won ? 1 : 0,
    national, table,
    wins: !!Game.won ? 1 : 0,
    exiled: !!(((Game.state || {}).scholar || {}).exiled) ? 1 : 0,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    nDeaths: deaths.length,
    causeCounts,
    aidRunnerDeaths: causeCounts['aid-runner'] || 0,
    raidDeaths: raidDeaths.length,
    raidDeathCauses: raidDeaths.reduce((t, d) => { t[d.cause] = (t[d.cause] || 0) + 1; return t; }, {}),
    hc,
    raidBeats: rb.beats.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`), JSON.stringify(out, null, 1));
  if (rb.beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`), JSON.stringify(rb.beats, null, 1));
  }
  console.log(`  [${policyId} s${seed} ${ARMED ? 'ARMED' : 'control'}] gameDays=${out.gameDays} end=${out.endReason} ` +
    `nat=${national} table=${table} won=${out.won} deaths=${deaths.length} raidDeaths=${raidDeaths.length} ` +
    `hcPlace=${hc.placements} hcAccepted=${hc.accepted} hcRefused=${hc.refused} aidArrived=${hc.aidArrived} enRoute=${hc.enRoute} unattributed=${hc.unattributed} err=${hc.errors}`);
}

(async () => {
  if (require.main !== module) return;
  const RESUME = process.env.RESUME === '1';
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      if (RESUME) {
        const mine = path.join(EVID, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`);
        if (fs.existsSync(mine)) { console.log(`  [${policyId} s${seed}] resume-skip (already present)`); continue; }
      }
      await oneRun(seed, policyId);
    }
  }
  console.log('sweep complete');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
