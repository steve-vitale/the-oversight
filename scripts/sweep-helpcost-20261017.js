#!/usr/bin/env node
'use strict';
// sweep-helpcost-20261017.js — cost-accounting sweep for the sim-helpcost arm.
//
// The sim-helpcall2 "named next": replicate-or-refute the median-survival
// gap (155.5 vs 172d) on fresh seeds, with the cost-accounting instrument
// (scripts/policies/helpcost.js) separating runner-absence cost from
// runner-death cost, and an apex-raid episode census on both sides to test
// the 38-vs-13 engagement-volume hypothesis.
//
// PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14):
//   PRIMARY: attribution completeness of the armed-control total-death
//     delta. delta = sum(control.nDeaths) - sum(armed.nDeaths). Classified:
//       perExposureGain = (C.raidDeaths - A.raidDeaths)
//                         - (C.apexEpisodes - A.apexEpisodes) * (C.raidDeaths / max(1,C.apexEpisodes))
//       exposureAsym    = (C.apexEpisodes - A.apexEpisodes) * (C.raidDeaths / max(1,C.apexEpisodes))
//       runnerCost      = -sum(armed.aidRunnerDeaths)          [counted cost, not a violation]
//       absenceCorr     = -sum(armed non-raid deaths whose day falls in a runner trip window)
//       noInviteNonRaid = non-raid, non-runner, non-absence death delta over pairs with no invite either side
//     unattributed = delta - sum(classified).
//     GO iff |delta| > 0 and |unattributed| <= 0.20 * |delta|.
//     (If |delta| == 0: GO iff every component is 0.)
//   SECONDARY (replicate-or-refute): the median-survival gap — report median
//     gameDays armed vs control, paired sign test, clock-rate
//     (gameDays/harness-days) for the tick-stall lesson, endReason
//     village-lost counts, total deaths. Never scholar.day alone.
//   GUARDRAILS: national armed >= control-2; exiled 0 (armed); no NEW death
//     mode beyond aid-runner at n>=3 armed (aid-runner is the pre-registered
//     counted cost); det-gate holds (proven in scripts/test-helpcost.js).
//
// Substrate (identical to sim-helpcall2): SEATDRIVE=0 explicit (pre-seat
// courtship), FEASTSCALE_R13=1, TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1,
// WINPURSUIT=1, WINDEFER=1, ALLOWGATE2 unset, NODEWITNESS unset.
// Armed = withHelpCost(HC.leadhc/HC.belonghc), HELPCALL=1.
// Control = withHelpCost(TF.leadfeast/TF.belongfeast), HELPCALL explicitly
// unset (true default-OFF; the instrument is behavior-neutral per det-gate).
// 8 fresh seeds [970,971,972,990,992,993,994,995] (collision-checked as
// -s<seed>. literals against evidence/ before the run) x 2 policies x
// {control,armed} = 32 runs, 180d death-aware.
//
// Run (armed):   SEATDRIVE=0 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 HELPCALL=1 node scripts/sweep-helpcost-20261017.js
// Run (control): SEATDRIVE=0 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 env -u HELPCALL node scripts/sweep-helpcost-20261017.js
//   SEEDS=970,971 node scripts/sweep-helpcost-20261017.js   (subset)
//   RESUME=1 ... (skip runs already complete)
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const HC = require('./policies/helpcall');
const HCK = require('./policies/helpcost');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [970, 971, 972, 990, 992, 993, 994, 995]).filter(Number.isFinite);
const ARMED = process.env.HELPCALL === '1';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-helpcost');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'helpcost-beats');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SUBSTRATE: ${k} must be 1`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SUBSTRATE: SEATDRIVE must be 0 explicit (pre-seat courtship)'); process.exit(2); }
if (process.env.NODEWITNESS === '1') { console.error('SUBSTRATE: NODEWITNESS must NOT be 1 (crisistier substrate, not witness)'); process.exit(2); }
if (process.env.ALLOWGATE2 === '1') { console.error('SUBSTRATE: ALLOWGATE2 must be unset'); process.exit(2); }
if (ARMED && !HC.layerOn()) { console.error('WRONG SIDE: HELPCALL=1 but layerOn() false'); process.exit(3); }
if (!ARMED && HC.layerOn()) { console.error('WRONG SIDE: control but layerOn() true'); process.exit(3); }
if (!ARMED && 'HELPCALL' in process.env) { console.error('WRONG SIDE: control must have HELPCALL explicitly unset'); process.exit(3); }

function policyFor(policyId) {
  if (ARMED) return policyId === 'leadfeast' ? HCK.leadCost : HCK.belongCost;
  return policyId === 'leadfeast' ? HCK.leadBaseCost : HCK.belongBaseCost;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// Invite-day tracker: the tableWaiting rising edge. Pure read of progState.
function withInviteDay(policy) {
  const tracked = { inviteDay: null };
  const base = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(Game, ctx) {
      if (tracked.inviteDay == null) {
        try { const pg = Game.progState ? Game.progState() : null; if (pg && pg.tableWaiting) tracked.inviteDay = gday(Game); } catch (e) {}
      }
      return base ? base(Game, ctx) : undefined;
    },
  });
  return { wrapped, tracked };
}

// Read-only raid/aid beat recorder (same keyword set as helpcall2).
function withRaidBeats(Game) {
  const rec = { beats: [] };
  const orig = Game.say;
  Game.say = function (s) {
    try {
      const t = String(s || '');
      if (/RAID|🚨|aid crisis|call for help|signal fire|runner|sprint|arrived|refused|stood-down|empty-handed|treeline|beacon|debt|foragers|Hold the door|walks in|🥁/i.test(t)) {
        const day = gday(Game);
        if (rec.beats.length < 600) rec.beats.push({ day, text: t.slice(0, 280) });
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  return rec;
}

// Raid-attributed death capture: the fieldfightsrc recipe (engine markers).
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
    aidArrived: 0, aidArrivedParty: 0, errors: 0, unattributed: 0, enRoute: 0 };
  let led = null;
  try { led = Game.state.hcLedger || null; } catch (e) {}
  if (!led) return out;
  const calls = led.calls || [], verdicts = (led.verdicts || []).slice().sort((a, b) => (a.day - b.day));
  let runners = [];
  try { runners = Game.state.aidRunners || []; } catch (e) {}
  out.placements = calls.length;
  for (const c of calls) { const r = String(c.ret || '?'); out.retCounts[r] = (out.retCounts[r] || 0) + 1; }
  for (const v of verdicts) { const r = String(v.verdict || '?'); out.verdictCounts[r] = (out.verdictCounts[r] || 0) + 1; }
  out.errors = (led.errors || []).length;
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
      if (hit.v.verdict === 'accepted') out.accepted++;
      else if (hit.v.verdict === 'refused') out.refused++;
    } else if (runners.some(rn => String((rn || {}).targetId || '') === String(c.targetId || ''))) {
      out.enRoute++;
    } else {
      out.unattributed++;
    }
  }
  return out;
}

async function oneRun(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: 'helpcost', fullTelemetry: false });
  await setupGame(Game, null, 'courtship');
  installRaidDeathCapture(Game);
  HCK.installPartCensus(Game); // per-part runner-away accounting (both sides, pure read)
  const rb = withRaidBeats(Game);
  const { wrapped, tracked } = withInviteDay(policyFor(policyId));
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: { seed } }); });
  const samples = result.samples || {};
  const scaleRows = samples.scale || [];
  const national = scaleRows.some(r => r[1] === 'national' || r[1] === 'global') ? 1 : 0;
  let table = 0;
  try { const pg = Game.progState ? Game.progState() : {}; table = (pg.tableWaiting || pg.tableDone) ? 1 : 0; } catch (e) {}
  const deaths = samples.deaths || [];
  const causeCounts = {};
  for (const d of deaths) { const c = String((d && d.cause) || 'unknown'); causeCounts[c] = (causeCounts[c] || 0) + 1; }
  const raidDeaths = (Game.state.hcRaidDeaths || []);
  const inviteDay = tracked.inviteDay;
  const postInvite = inviteDay == null ? [] : raidDeaths.filter(d => d.day >= inviteDay);
  const hc = summarizeLedger(Game);
  const cost = HCK.costSummary(Game);
  const out = {
    seed, policyId, armed: ARMED, mode: 'helpcost',
    days: result.days, gameDays: result.gameDays, finalEngineDay: result.gameDays,
    clockRate: result.days ? +(result.gameDays / result.days).toFixed(3) : null,
    endReason: result.endReason,
    inviteDay,
    won: !!Game.won ? 1 : 0,
    national, table,
    wins: !!Game.won ? 1 : 0,
    exiled: !!(((Game.state || {}).scholar || {}).exiled) ? 1 : 0,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    nDeaths: deaths.length,
    deathDays: deaths.map(d => [d.day || 0, String(d.cause || 'unknown')]),
    causeCounts,
    aidRunnerDeaths: causeCounts['aid-runner'] || 0,
    raidDeaths: raidDeaths.length,
    raidDeathsPostInvite: postInvite.length,
    raidDeathDays: raidDeaths.map(d => d.day),
    raidDeathCauses: raidDeaths.reduce((t, d) => { t[d.cause] = (t[d.cause] || 0) + 1; return t; }, {}),
    hc,
    cost,
    raidBeats: rb.beats.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`), JSON.stringify(out, null, 1));
  if (rb.beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARMED ? 'armed' : 'control'}.json`), JSON.stringify(rb.beats, null, 1));
  }
  console.log(`  [${policyId} s${seed} ${ARMED ? 'ARMED' : 'control'}] gameDays=${out.gameDays} end=${out.endReason} ` +
    `nat=${national} table=${table} won=${out.won} inviteDay=${inviteDay == null ? '—' : inviteDay} deaths=${deaths.length} ` +
    `raidDeaths=${raidDeaths.length} postInvite=${postInvite.length} ` +
    `hcPlace=${hc.placements} apexEp=${(cost || {}).apexRaidEpisodes} trips=${(cost || {}).runnerTrips} awayParts=${(cost || {}).runnerAwayDayParts}`);
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
