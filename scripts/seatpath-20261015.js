#!/usr/bin/env node
'use strict';
// seatpath-20261015.js — READ-ONLY invitation→sitting funnel instrument
// (flesh-out loop, 2026-10-15, scale-onramp axis, sim-seatpath).
//
// DIAGNOSTIC — no lever, zero src/js changes. On the pre-seat substrate
// (sim-wincensus / sim-presubstrate: 32 runs, 31-32/32 invites, 0 sittings)
// the seat driver (seatdrive.js, SEATDRIVE=1) fills the gap but the
// mechanism of the gap itself is unmeasured. This instrument measures the
// funnel and attributes every non-sitting.
//
// Substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
// WINPURSUIT=1 WINDEFER=1, SEATDRIVE unset (asserted at load — the same
// composition presubstrate censused). Policies: TF.leadfeast /
// TF.belongfeast (the tribfloor base ids, plain — WINPURSUIT/WINDEFER are
// inert on the base policies, set so the env matches the declared
// composition).
// Seeds: 8 FRESH [163,274,385,496,607,718,829,940] (coordinator-assigned,
// verified 0 evidence hits) x {leadfeast, belongfeast} = 16 runs, 180d
// death-aware.
//
// THE FUNNEL, per open-invite dawn (a daily() entry with pg.tableWaiting &&
// !pg.tableDone — the same decision point the seatdrive driver acts on, at
// the top of daily() before the base policy runs):
//   - preview = Game.tablePreview() (the engine's own offer predicate —
//     what the Haven panel button reads; table.js:506)
//   - OFFERED: preview non-null && preview.ready — the seat is sittable;
//     the verb Game.tableTakeSeat() is callable and honest
//   - NEVER-OFFERED: preview null while an invitation pends. Sub-reasons:
//       winDayFloor — day < 90 (NO SPOILERS, table.js:498: "nonexistent,
//         don't spoil the game"): the announcement fires but the seat
//         doesn't exist yet; the invitation pends unsat
//       no-seat — Game.tableSeat().seat === 'none': the run no longer
//         qualifies (withdrawn aloud by ledger.js's law)
//       unknown — anything else (exceptions included, named)
//   - GATE-BLOCKED: offered but the scholar can't sit — scholar dead
//     (mantle in transit / no living bearer) or exiled/joinedVillage
//     (the #294 council-gate class seatdrive pre-checks)
//   - OFFERED-BUT-NEVER-INVOKED: offered, scholar alive, proposable —
//     the verb is in the engine's action set and no policy plays it
// Scholar context per dawn (fiction, not gates — tableTakeSeat carries no
// location or council gate in table.js): scholarAlive, atHaven
// (playerAtHaven — the seat is "taken from Haven"), exiled.
//
// WHAT WAS CHOSEN INSTEAD: on each open-invite dawn the instrument
// snapshots numeric ctx keys at daily() entry and diffs them after the
// base policy's daily() returns — the policy's own honest action counters
// (its recorded reasons). Deltas aggregate across all open-invite dawns;
// the analyzer reports the top 5 with source-file labels.
//
// Per run: inviteDay, seatType (full/lesser at invite), openInviteDawns,
// per-dawn classifications, sittings (tableDone rising edge), end
// day/reason, scholar context shares.
//
// GO (pre-registered, binding §14): 100% of non-sittings attributed to a
// mechanism on 16 runs — offered-but-never-invoked vs never-offered vs
// gate-blocked, per run.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/seatpath-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/seatpath-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 DET=1 node scripts/seatpath-20261015.js   # det-gate only
// Targeted re-runs: SEEDS="163,274" ONLY="leadfeast;belongfeast"
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['WAVE5REACH', 'W3DRIVE', 'SEATDRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [163, 274, 385, 496, 607, 718, 829, 940]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-seatpath');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'seatpath-beats');
const BEAT_CAP = 2000;
const BEAT_LEN = 260;
// Beat filter: the table/herald/invitation fiction plus the deaths the
// village suffers while the invitation pends (the sense-read question).
// Unfiltered capture fills any cap by day 5 (16k beats/run); the presubstrate
// SETPIECE pattern held 0 dropped at 2000.
const TABLEBEAT = /THE TABLE|table is being set|Take your seat|take your seat|Nothing is final|Seven doors|ring of pale|OVERTIME|Herald|herald|the Table|invitation|YOUR CASE IS NOT COMPLETE|First Court|Ninety dawns|ARC IV|died|funeral|Funeral|exile|Exile/i;

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// ---------------------------------------------------------------------
// Funnel classification. Pure reads of Game state; returns the dawn
// record. `seatdrive`'s driveSeat checks the same three predicates
// (tablePreview, scholarAlive, canPropose) — this is the read-only twin.
function scholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}

function sampleFunnel(Game) {
  // Returns null when this is NOT an open-invite dawn.
  let pg = null;
  try { pg = Game.progState ? Game.progState() : null; } catch (e) {}
  if (!pg || !pg.tableWaiting || pg.tableDone) return null;
  const day = gday(Game);
  let seat = 'err', pv = null, pvErr = null;
  try { seat = (Game.tableSeat ? Game.tableSeat().seat : 'err') || 'err'; } catch (e) { seat = 'exc'; }
  try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; }
  catch (e) { pvErr = String(e && e.message).slice(0, 60); }
  const alive = scholarAlive(Game);
  let atHaven = null, exiled = false, joined = false;
  try { atHaven = typeof Game.playerAtHaven === 'function' ? !!Game.playerAtHaven() : null; } catch (e) {}
  try { const s = Game.state.scholar || {}; exiled = !!s.exiled; joined = !!s.joinedVillage; } catch (e) {}
  let cls, sub = null;
  if (!pv) {
    if (seat === 'none' || seat === 'err' || seat === 'exc') { cls = 'never-offered'; sub = 'no-seat'; }
    else if (day < 90) { cls = 'never-offered'; sub = 'winDayFloor'; }
    else { cls = 'never-offered'; sub = pvErr ? 'exc:' + pvErr : 'unknown'; }
  } else if (!pv.ready) {
    cls = 'gate-blocked'; sub = 'preview-not-ready';
  } else if (!alive) {
    cls = 'gate-blocked'; sub = 'scholar-dead';
  } else if (exiled || joined) {
    cls = 'gate-blocked'; sub = 'council-gate';
  } else {
    cls = 'offered-but-never-invoked'; sub = 'policy-has-no-seat-verb';
  }
  return {
    day, cls, sub,
    seat, pvDoors: pv && Array.isArray(pv.doors) ? pv.doors.length : (pv ? -1 : 0),
    pvSeat: pv ? pv.seat : null, overtime: pv && pv.overtime != null ? pv.overtime : null,
    scholarAlive: alive, atHaven, exiled, joinedVillage: joined,
  };
}

// Snapshot numeric ctx keys (the policy's honest action counters) at
// daily() entry; diff at exit. Pure reads; the store lives under
// ctx._seatpath, the instrument's own namespace (withPresub precedent).
function snapCtx(ctx) {
  const out = {};
  try {
    for (const k of Object.keys(ctx)) {
      if (k === '_seatpath') continue;
      const v = ctx[k];
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    }
  } catch (e) {}
  return out;
}
function diffSnap(before, after) {
  const d = {};
  for (const k of Object.keys(after)) {
    const b = before[k] || 0;
    if (after[k] !== b) d[k] = after[k] - b;
  }
  for (const k of Object.keys(before)) {
    if (!(k in after)) d[k] = -before[k];
  }
  return d;
}

// ---------------------------------------------------------------------
function newFunnel() {
  return {
    inviteDay: null, seatAtInvite: null,
    sittings: 0, _wasDone: false,
    dawns: [],           // per open-invite dawn: funnel record + ctx deltas
    actionDelta: {},     // aggregated ctx-counter deltas over open-invite dawns
    beats: [], beatsDropped: 0,
  };
}

function installSayCapture(Game, ctx) {
  if (ctx._spSayInstalled) return;
  ctx._spSayInstalled = true;
  const oSay = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const C = ctx._seatpath;
      if (C) {
        const s = String(t || '');
        if (TABLEBEAT.test(s)) {
          if (C.beats.length < BEAT_CAP) C.beats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
          else C.beatsDropped++;
        }
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
}

function withSeatPath(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._seatpath = newFunnel();
      installSayCapture(Game, ctx);
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      const C = ctx._seatpath;
      let funnel = null, before = null;
      if (C) {
        funnel = sampleFunnel(Game); // at entry: the seatdriver's decision point
        if (funnel) {
          if (C.inviteDay == null) { C.inviteDay = funnel.day; C.seatAtInvite = funnel.seat; }
          before = snapCtx(ctx);
        }
        // sitting rising edge (wintrace/presubstrate convention)
        try {
          const pg = Game.progState ? Game.progState() : null;
          if (pg && pg.tableDone && !C._wasDone) C.sittings++;
          C._wasDone = !!(pg && pg.tableDone);
        } catch (e) {}
      }
      const oDaily = base.daily;
      const r = oDaily ? oDaily(Game, ctx) : undefined;
      if (C && funnel && before) {
        const after = snapCtx(ctx);
        funnel.deltas = diffSnap(before, after);
        C.dawns.push(funnel);
        for (const k of Object.keys(funnel.deltas)) {
          C.actionDelta[k] = (C.actionDelta[k] || 0) + funnel.deltas[k];
        }
      }
      return r;
    },
  });
}

// ---------------------------------------------------------------------
// SMOKE gate: both base policies drive with the instrument live.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
    const base = policyFor(policyId);
    check(`[${policyId}] base id = ${policyId}`, base.id === policyId, 'got ' + base.id);
    const policy = withSeatPath(base, base.id + '-seatpath', base.desc + ' [SEATPATH]');
    let funnelLive = null, dailyRan = false;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); funnelLive = !!(ctx && ctx._seatpath); };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => { dailyRan = dailyRan || !!(ctx && ctx._seatpath); return oDaily(G, ctx); };
    const { Game } = await loadGame({ seed: 163, mode: 'seatpath-smoke', fullTelemetry: false });
    await setupGame(Game);
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`[${policyId}] funnel live`, funnelLive === true, '');
    check(`[${policyId}] funnel daily ran`, dailyRan === true, '');
    check(`[${policyId}] 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`[${policyId}] tablePreview callable`, typeof Game.tablePreview === 'function', '');
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both policies drive, funnel live, runs complete.');
}

// ---------------------------------------------------------------------
// DET-GATE: instrument-on vs instrument-off trajectory-identical, 4 seeds.
// Both-repeat design (presubstrate precedent).
async function runHashes(policy, seed, days) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const { Game } = await loadGame({ seed, mode: 'seatpath-det', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes.join('\n');
}

async function detGate() {
  const seeds = [163, 274, 385, 496];
  const days = 60;
  let green = 0, total = 0;
  for (const seed of seeds) {
    const plain = policyFor('leadfeast');
    const instr = withSeatPath(policyFor('leadfeast'), 'leadfeast-seatpath', 'leadfeast [SEATPATH DET]');
    const hP1 = await runHashes(plain, seed, days);
    const hP2 = await runHashes(plain, seed, days);
    const hC1 = await runHashes(instr, seed, days);
    const hC2 = await runHashes(instr, seed, days);
    const plainStable = hP1 === hP2;
    const instrStable = hC1 === hC2;
    const identical = plainStable && instrStable && hP1 === hC1;
    total++;
    if (identical) green++;
    console.log(`  seed ${seed}: plain-stable=${plainStable} instr-stable=${instrStable} ` +
      `instrument-identical=${hP1 === hC1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE: ${green}/${total} identical (plain-repeat + instr-repeat + plain==instr).`);
  if (green < total) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// ---------------------------------------------------------------------
// The sweep.
async function oneRun(seed, policyId) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const policy = withSeatPath(base, base.id + '-seatpath', base.desc + ' [SEATPATH]');
  const { Game } = await loadGame({ seed, mode: 'seatpath', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._seatpath) || newFunnel();
  let seatAtEnd = null;
  try { seatAtEnd = Game.tableSeat ? Game.tableSeat().seat : null; } catch (e) {}
  const clsCounts = {};
  let offeredDawns = 0, atHavenOffered = 0, deadOffered = 0;
  for (const d of C.dawns) {
    const k = d.cls + ':' + d.sub;
    clsCounts[k] = (clsCounts[k] || 0) + 1;
    if (d.cls === 'offered-but-never-invoked') { offeredDawns++; if (d.atHaven) atHavenOffered++; if (!d.scholarAlive) deadOffered++; }
  }
  const out = {
    seed, policyId, mode: 'seatpath',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    inviteDay: C.inviteDay, seatAtInvite: C.seatAtInvite, seatAtEnd,
    sittings: C.sittings,
    openInviteDawns: C.dawns.length,
    clsCounts,
    offeredDawns, atHavenOffered, deadOffered,
    actionDelta: C.actionDelta,
    dawns: C.dawns.map(d => ({ day: d.day, cls: d.cls, sub: d.sub, seat: d.seat, doors: d.pvDoors, ot: d.overtime, alive: d.scholarAlive ? 1 : 0, haven: d.atHaven === true ? 1 : (d.atHaven === false ? 0 : -1), ex: d.exiled ? 1 : 0, deltas: d.deltas })),
    beatsDropped: C.beatsDropped,
    // Numeric telemetry keys (coordinator's telemetry-check): national, table, wins, exiled.
    national: null, table: C.inviteDay != null ? 1 : 0, wins: !!Game.won ? 1 : 0, exiled: 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (C.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(C.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} invDay=${C.inviteDay} seat=${C.seatAtInvite} openDawns=${C.dawns.length} offered=${offeredDawns} sit=${C.sittings} win=${out.wins} cls=${JSON.stringify(clsCounts)}`);
}

(async () => {
  if (require.main !== module) return; // require() by the proof test must not launch the sweep
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) {
      const p = part.trim();
      if (p) only[p] = true;
    }
  }
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  else {
    for (const policyId of POLICIES) {
      if (only && !only[policyId]) continue;
      for (const seed of SEEDS) {
        await oneRun(seed, policyId);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-15/perseed-seatpath/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withSeatPath, newFunnel, sampleFunnel, snapCtx, diffSnap, scholarAlive, policyFor };
