#!/usr/bin/env node
'use strict';
// overtimedeath-20261016.js — READ-ONLY OVERTIME mortality-attribution instrument
// (flesh-out loop, 2026-10-15 arm sim-overtimedeath, scale-onramp axis).
//
// DIAGNOSTIC — no lever, zero src/js changes, zero policy behavior changes.
// The presubstrate census (evidence/2026-10-15/sim-presubstrate.md) measured
// the new mortality bind: win-side content all reachable (Arc IV 16/16,
// wave-4 16/16, wave-5 11/16, table invites 16/16) but villages die rich —
// 16/16 village-lost, median 134.5d, combat 65% of deaths, starvation 1/685,
// under the post-invite OVERTIME rerun ladder (x1->x6 escalation, wave 4-5
// reruns +25%->+150% HP while the table sits open). This instrument
// attributes that mortality death-by-death on the same pre-seat substrate.
//
// Per run (8 FRESH seeds [181,292,403,514,625,736,847,958] x
// {leadfeast, belongfeast} = 16 runs, 180d death-aware):
//   1. Every death: day, kind (person/monster), cause, family
//      (holdloss-lib classifyDeathFamily), rerun flag (Game.tbfight.otTier
//      at the death beat — the engine's own marker that overtimeScaleFight
//      scaled this fight), overtimeTier() at the death beat.
//   2. Daily tier trajectory (overtimeTier at daily() entry) — the ladder's
//      escalation shape per run.
//   3. inviteDay rising edge (tableWaiting && !tableDone), sittings edge,
//      unlockedWave + scaleRank daily (wall numbers).
//   4. Death/funeral/OVERTIME beats for the sense-read.
//
// Classification (analyzer scripts/analyze-overtimedeath-20261016.js):
//   (a) combat inside an OVERTIME rerun window — rerun flag set at the death
//   (b) combat outside a rerun window — combat/monster family, no rerun flag
//   (c) non-combat — starvation / sickness / wounds / other (family named)
//   (d) unattributed — reserved for unobservable records (missing day/cause;
//       the wrap always supplies them) — target exactly 0.
// Monster deaths are recorded (they are combat by definition) but the
// village-killing attribution counts person deaths; monster kills are
// reported separately.
//
// Read-only: the instrument wraps Game.registerDeath / Game.say and the
// policy's setup/daily; it writes nothing to game state — all records go to
// ctx._od. Proven by the det-gate: 4 identical-seed pairs
// with/without the instrument trajectory-identical (both-repeat design:
// plain-repeat + instr-repeat + plain==instr).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SMOKE=1 node scripts/overtimedeath-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 DET=1 node scripts/overtimedeath-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/overtimedeath-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEEDS="181" ONLY="leadfeast" node scripts/overtimedeath-20261016.js
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const HL = require('./holdloss-lib-20261015');

// --- substrate gates (the pre-seat stack presubstrate/seatpath measured) ---
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['WAVE5REACH', 'W3DRIVE', 'SEATDRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [181, 292, 403, 514, 625, 736, 847, 958]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-overtimedeath');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'overtimedeath-beats');
const BEAT_CAP = 2000;
const BEAT_LEN = 300;
// Beat filter: the ladder's own announcements + the deaths the village
// suffers under it (the sense-read question). Bounded like seatpath's
// TABLEBEAT (unfiltered capture fills any cap by day 5).
const OD_BEAT = /OVERTIME|RERUN|Take your seat|take your seat|Nothing is final|Seven doors|THE TABLE is set|ring of pale|Herald|herald|invitation|died|funeral|Funeral|buried|bury |killed|slain|fallen|succession|mantle|exile|Exile/i;

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Engine reads — pure, try/catch-wrapped. The rerun flag is the engine's
// OWN marker: overtimeScaleFight sets Game.tbfight.otTier when it scales a
// fight (overtime.js:134). tbfight is nulled at fight end, so a set otTier
// at the death beat means the death happened inside a rerun-scaled fight.
function rerunFightAt(Game) {
  try {
    const f = Game.tbfight;
    return !!(f && (f.otTier | 0) >= 1);
  } catch (e) { return false; }
}
function tierAt(Game) {
  try { return (Game.overtimeTier && Game.overtimeTier()) | 0; } catch (e) { return null; }
}
function waveAt(Game) {
  try { return Game.unlockedWave ? (Game.unlockedWave() | 0) : null; } catch (e) { return null; }
}
function scaleRankAt(Game) {
  try { return typeof Game.scaleRank === 'function' ? Game.scaleRank() : null; } catch (e) { return null; }
}

function newRec() {
  return {
    inviteDay: null, seatAtInvite: null, sittings: 0,
    _wasWaiting: false, _wasDone: false,
    deaths: [],          // per death: day, kind, name, vid, cause, family, rerunFight, tier
    dayTiers: [],        // per day: day, tier, waiting, wave, scaleRank
    beats: [], beatsDropped: 0,
  };
}

function installSayCapture(Game, ctx) {
  if (ctx._odSayInstalled) return;
  ctx._odSayInstalled = true;
  const oSay = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const C = ctx._od;
      if (C) {
        const s = String(t || '');
        if (OD_BEAT.test(s)) {
          if (C.beats.length < BEAT_CAP) C.beats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
          else C.beatsDropped++;
        }
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
}

// Death capture: wrap registerDeath; read BEFORE calling orig (the
// casualtyseq convention). The rerun flag + tier are read at the death
// beat, not reconstructed later.
function installDeathCapture(Game, ctx) {
  if (ctx._odDeathInstalled) return;
  ctx._odDeathInstalled = true;
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (!origReg) return;
  Game.registerDeath = function (opts) {
    try {
      const C = ctx._od;
      if (C && C.deaths.length < 1200) {
        const o = opts || {};
        const cause = String(o.cause || '?').slice(0, 80);
        C.deaths.push({
          day: gday(Game),
          kind: String(o.kind || '?'),
          name: String(o.name || '?').slice(0, 40),
          vid: String(o.villagerId || o.monsterId || '').slice(0, 24),
          cause,
          family: HL.classifyDeathFamily(cause).family,
          rerunFight: rerunFightAt(Game),
          tier: tierAt(Game),
          player: /player|scholar/i.test(String(o.kind || '')),
          monsterId: o.monsterId || null,
        });
      }
    } catch (e) {}
    return origReg(opts);
  };
}

function withOvertimeDeath(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._od = newRec();
      installSayCapture(Game, ctx);
      installDeathCapture(Game, ctx);
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      const C = ctx._od;
      if (C) {
        // Daily tier row at entry (the same decision-point convention as
        // the seatpath funnel sample).
        let waiting = false, done = false;
        try { const pg = Game.progState ? Game.progState() : null; waiting = !!(pg && pg.tableWaiting); done = !!(pg && pg.tableDone); } catch (e) {}
        if (waiting && !C._wasWaiting && C.inviteDay == null) {
          C.inviteDay = gday(Game);
          try { C.seatAtInvite = (Game.tableSeat ? Game.tableSeat().seat : null); } catch (e) {}
        }
        C._wasWaiting = waiting;
        if (done && !C._wasDone) C.sittings++;
        C._wasDone = done;
        C.dayTiers.push({ day: gday(Game), tier: tierAt(Game), waiting: waiting ? 1 : 0, wave: waveAt(Game), scale: scaleRankAt(Game) });
      }
      const oDaily = base.daily;
      return oDaily ? oDaily(Game, ctx) : undefined;
    },
  });
}

// --- pure classification, exported for the proof test ---
// bucket(death, inviteDay): 'a' | 'b' | 'c' | 'd'
//   (a) combat inside an OVERTIME rerun window — the engine's otTier flag
//       was set at the death beat (death happened inside a rerun-scaled fight)
//   (b) combat outside a rerun window — combat/monster family, no flag
//   (c) non-combat — starvation/sickness/wounds/other family named, no flag
//   (d) unattributed — reserved for unobservable records (missing day or
//       missing cause); the instrument always supplies both.
function bucket(death) {
  if (death.day == null || death.cause == null) return 'd';
  if (death.rerunFight) return 'a';
  const fam = death.family;
  if (fam === 'combat' || fam === 'monster') return 'b';
  return 'c';
}
function phaseOf(death, inviteDay) {
  if (inviteDay == null) return 'pre-invite';
  if (death.day < inviteDay) return 'pre-invite';
  const t = death.tier;
  if (t != null && t >= 1) return 'post-invite-in-rerun';
  return 'post-invite-outside-rerun';
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
    const policy = withOvertimeDeath(base, base.id + '-od', base.desc + ' [OVERTIMEDEATH]');
    let live = null, dailyRan = false;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); live = !!(ctx && ctx._od); };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => { dailyRan = dailyRan || !!(ctx && ctx._od && ctx._od.dayTiers.length); return oDaily(G, ctx); };
    const { Game } = await loadGame({ seed: 181, mode: 'od-smoke', fullTelemetry: false });
    await setupGame(Game);
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`[${policyId}] instrument live`, live === true, '');
    check(`[${policyId}] daily rows collected`, dailyRan === true, '');
    check(`[${policyId}] 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`[${policyId}] overtimeTier callable`, typeof Game.overtimeTier === 'function', '');
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both policies drive, instrument live, runs complete.');
}

// ---------------------------------------------------------------------
// DET-GATE: instrument-on vs instrument-off trajectory-identical, 4
// identical-seed pairs, both-repeat design (plain-repeat + instr-repeat +
// plain==instr) — the seatpath convention. Proves read-only-ness.
async function runHashes(policy, seed, days) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const { Game } = await loadGame({ seed, mode: 'od-det', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  let r = null;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return { h: hashes.join('\n'), endReason: r && r.endReason, days: r && r.days };
}

async function detGate() {
  const pairs = [['leadfeast', 181], ['leadfeast', 292], ['belongfeast', 181], ['belongfeast', 292]];
  const days = 60;
  let green = 0;
  for (const [pid, seed] of pairs) {
    const plain = policyFor(pid);
    const instr = withOvertimeDeath(policyFor(pid), pid + '-od', pid + ' [OD DET]');
    const p1 = await runHashes(plain, seed, days);
    const p2 = await runHashes(plain, seed, days);
    const c1 = await runHashes(instr, seed, days);
    const c2 = await runHashes(instr, seed, days);
    const plainStable = p1.h === p2.h;
    const instrStable = c1.h === c2.h;
    const identical = plainStable && instrStable && p1.h === c1.h;
    const endsSame = p1.endReason === c1.endReason;
    if (identical && endsSame) green++;
    console.log(`  ${pid} s${seed}: plain-stable=${plainStable} instr-stable=${instrStable} ` +
      `instrument-identical=${p1.h === c1.h} ends=${p1.endReason}/${c1.endReason} ${identical && endsSame ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE: ${green}/${pairs.length} identical (plain-repeat + instr-repeat + plain==instr, ends agree).`);
  if (green < pairs.length) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// ---------------------------------------------------------------------
// The sweep.
async function oneRun(seed, policyId) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const policy = withOvertimeDeath(base, base.id + '-od', base.desc + ' [OVERTIMEDEATH]');
  const { Game } = await loadGame({ seed, mode: 'od', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._od) || newRec();
  const finalEngineDay = gday(Game);
  if (finalEngineDay > result.days + 1) console.log(`  [drift] engine day ${finalEngineDay} > daysRan ${result.days} (${policyId}-s${seed})`);
  // Day-accounting off-by-one (task finding): deaths can timestamp a day
  // AFTER runDays' returned day — the death window extends to finalDay+1.
  // Records beyond that are kept and flagged, never silently dropped.
  for (const d of C.deaths) {
    d.late = d.day > result.days ? 1 : 0;
    d.beyondWindow = d.day > finalEngineDay + 1 ? 1 : 0;
  }
  const buckets = { a: 0, b: 0, c: 0, d: 0 };
  for (const d of C.deaths) buckets[bucket(d)]++;
  const out = {
    seed, policyId, mode: 'overtimedeath',
    days: result.days, gameDays: result.gameDays, finalEngineDay,
    endReason: result.endReason,
    won: !!Game.won,
    inviteDay: C.inviteDay, seatAtInvite: C.seatAtInvite, sittings: C.sittings,
    maxWave: Math.max(1, ...C.dayTiers.map(r => r.wave || 1)),
    national: C.dayTiers.some(r => r.scale === 'national' || r.scale === 'global') ? 1 : 0,
    table: C.inviteDay != null ? 1 : 0,
    wins: !!Game.won ? 1 : 0, exiled: 0,
    nDeaths: C.deaths.length, buckets,
    deaths: C.deaths,
    dayTiers: C.dayTiers,
    beatsDropped: C.beatsDropped,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (C.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(C.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} invDay=${C.inviteDay} ` +
    `deaths=${C.deaths.length} buckets=${JSON.stringify(buckets)} maxWave=${out.maxWave} nat=${out.national}`);
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
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-overtimedeath/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withOvertimeDeath, newRec, bucket, phaseOf, rerunFightAt, tierAt, policyFor };
