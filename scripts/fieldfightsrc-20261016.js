#!/usr/bin/env node
'use strict';
// fieldfightsrc-20261016.js — READ-ONLY field-fight source-system attribution
// instrument (flesh-out loop, 2026-10-16 arm sim-fieldfightsrc, scale-onramp axis).
//
// DIAGNOSTIC — no lever, zero src/js changes, zero policy behavior changes.
// sim-overtimedeath (evidence/2026-10-16/sim-overtimedeath.md) attributed 193
// post-invite deaths: 14.5% inside OVERTIME rerun-scaled fights, 83.9%
// ordinary combat outside any rerun window — and on ladder-active days
// (tier>=1) the non-rerun villager combat deaths were dominated by the
// 'monster' field-fight/expedition verb (27/38). This arm dissects that
// (b)-channel: tag every post-invite 'monster'-verb villager combat death by
// SOURCE SYSTEM (RAID / EXPEDITION / WILD-ENCOUNTER) and decide the fork:
// RAID-KNOBS-DOMINANT (ladder kills through its raid knobs -> tune fix
// viable) vs FIELD-EXPOSURE-DOMINANT (raw wave-4/5 field exposure -> deeper
// pacing question).
//
// Per run (8 FRESH seeds [205,246,321,412,523,634,745,856] x
// {leadfeast, belongfeast} = 16 runs, 180d death-aware, pre-seat substrate):
//   1. Every death: day, kind, cause, family (holdloss-lib), and the
//      fight-context captured at the death beat — see below.
//   2. Source tag per post-invite 'monster'-verb villager death (srcOf).
//   3. Daily tier trajectory + inviteDay rising edge (wall numbers).
//   4. Death/funeral/OVERTIME beats for the sense-read.
//
// FIGHT-CONTEXT CAPTURE (all engine-owned markers, read at the death beat —
// the overtimedeath convention; never reconstructed from prose):
//   - Game.resolveWildMonsterEncounter(vid, m, opts): captures opts.raid
//     (set ONLY by havenRaidTick — the reactive haven raid — havenGrowth.js)
//     and m.lingering for the synchronous duration of the fight.
//   - Game.resolvePatrol(vid, first): captures the patrol router tag (the
//     monster is picked inside; the fieldFight upgrade covers it).
//   - Game.fieldFight(vid, mdef, m, opts): upgrades the enclosing entry's
//     raid flag from the monster entity's own m.lingering (set ONLY by
//     havenRaidTick for unmet raiders — nothing else sets it; cleared on
//     crisis resolution — comms.js). Unrouted calls are classified by opts:
//     awareness:true = villager-agency expedition, noFlee = contest, else
//     field-other (nomad / alienPlayers / corruption contexts).
//   - Game.expedDeath(vid, mName, nm, ...): the agency-expedition death path
//     (registerDeath cause = monster NAME) fires AFTER fieldFight returns,
//     so it carries its own context entry.
//   - Game.travelTo wrapped during the policy's daily/upkeep window: counts
//     policy-driven travel legs per day (the EXPEDITION correlation — the
//     competent policy's expedition verbs on the scholar).
//
// Source tags (srcOf, pure, exported for the proof test):
//   RAID            — engine raid context: opts.raid or m.lingering.
//   EXPEDITION      — correlation: death on a day the policy drove scholar
//                     travel (travelLegs>0), no raid marker, not a
//                     villager-autonomous agency expedition.
//   WILD-ENCOUNTER  — untagged field encounters: patrols, wild ticks,
//                     villager-agency expeditions, home days.
//   unattributed    — reserved for unobservable records (missing day/cause).
//   nontarget       — not the population (non-'monster' family).
// The aid crisis (state.aidCrisis.raiders) is recorded as corroboration at
// the death beat, never the tag flipper (a raid crisis can stay open while
// ordinary wild fights happen — finding #357's honesty requirement).
//
// Read-only: the wraps push/pop a ctx-local stack and count travel legs;
// they write nothing to game state — all records go to ctx._ffs. Proven by
// the det-gate: 4 identical-seed pairs with/without the instrument
// trajectory-identical (both-repeat design: plain-repeat + instr-repeat +
// plain==instr).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SMOKE=1 node scripts/fieldfightsrc-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 DET=1 node scripts/fieldfightsrc-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/fieldfightsrc-20261016.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEEDS="205" ONLY="leadfeast" node scripts/fieldfightsrc-20261016.js
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const HL = require('./holdloss-lib-20261015');

// --- substrate gates (the pre-seat stack presubstrate/seatpath/overtimedeath measured) ---
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['WAVE5REACH', 'W3DRIVE', 'SEATDRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [205, 246, 321, 412, 523, 634, 745, 856]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldfightsrc');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'fieldfightsrc-beats');
const BEAT_CAP = 2000;
const BEAT_LEN = 300;
const OD_BEAT = /OVERTIME|RERUN|Take your seat|take your seat|Nothing is final|Seven doors|THE TABLE is set|ring of pale|Herald|herald|invitation|died|funeral|Funeral|buried|bury |killed|slain|fallen|succession|mantle|exile|Exile|RAID|raiders|treeline/i;

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Engine reads — pure, try/catch-wrapped.
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
// The aid crisis with the engine's own raid flag (corroboration, never the tag).
function raidCrisisAt(Game) {
  try {
    const c = Game.aidCrisis && Game.aidCrisis();
    return { open: !!c, raiders: !!(c && c.raiders) };
  } catch (e) { return { open: false, raiders: false }; }
}
function scholarAwayAt(Game) {
  try { return !(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return null; }
}

function newRec() {
  return {
    inviteDay: null, seatAtInvite: null, sittings: 0,
    _wasWaiting: false, _wasDone: false,
    stack: [],           // fight-context stack (synchronous fights only)
    deaths: [],          // per death: day, kind, cause, family, src + context
    dayTiers: [],        // per day: day, tier, waiting, wave, scaleRank
    travelDays: {},      // day -> policy-window travel legs
    srcCounts: { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, unattributed: 0 },
    beats: [], beatsDropped: 0,
  };
}

function installSayCapture(Game, ctx) {
  if (ctx._ffsSayInstalled) return;
  ctx._ffsSayInstalled = true;
  const oSay = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const C = ctx._ffs;
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

// Death capture: wrap registerDeath; read the fight stack BEFORE calling
// orig (the casualtyseq convention). The stack top is the enclosing fight
// context — the engine's own raid markers, not a reconstruction.
function installDeathCapture(Game, ctx) {
  if (ctx._ffsDeathInstalled) return;
  ctx._ffsDeathInstalled = true;
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (!origReg) return;
  Game.registerDeath = function (opts) {
    try {
      const C = ctx._ffs;
      if (C && C.deaths.length < 1200) {
        const o = opts || {};
        const cause = String(o.cause || '?').slice(0, 80);
        const family = HL.classifyDeathFamily(cause).family;
        const top = (C.stack && C.stack.length) ? C.stack[C.stack.length - 1] : null;
        const day = gday(Game);
        const crisis = raidCrisisAt(Game);
        const dctx = {
          day,
          kind: String(o.kind || '?'),
          name: String(o.name || '?').slice(0, 40),
          vid: String(o.villagerId || o.monsterId || '').slice(0, 24),
          cause,
          family,
          via: top ? top.via : null,
          raid: !!(top && top.raid),
          monsterId: top ? top.monsterId : null,
          monsterLingering: !!(top && top.monsterLingering),
          monsterName: top ? (top.monsterName || null) : null,
          scholarAway: scholarAwayAt(Game),
          travelLegs: (C.travelDays && C.travelDays[day]) || 0,
          crisisOpen: crisis.open,
          crisisRaiders: crisis.raiders,
          rerunFight: rerunFightAt(Game),
          tier: tierAt(Game),
          player: /player|scholar/i.test(String(o.kind || '')),
        };
        dctx.src = srcOf(dctx);
        C.deaths.push(dctx);
        if (dctx.family === 'monster' && /villager|person/i.test(dctx.kind)) {
          C.srcCounts[dctx.src] = (C.srcCounts[dctx.src] || 0) + 1;
        }
      }
    } catch (e) {}
    return origReg(opts);
  };
}

// Fight-context stack: the three village fight routers + the expedition
// death path. All synchronous in node (verified: fieldFights.js carries no
// async/await; aidFight -> fieldFight is a plain call). try/finally restores.
function installFightStack(Game, ctx) {
  if (ctx._ffsStackInstalled) return;
  ctx._ffsStackInstalled = true;
  const C = () => ctx._ffs;
  const push = (e) => { const c = C(); if (c) c.stack.push(e); };
  const pop = () => { const c = C(); if (c) c.stack.pop(); };

  if (typeof Game.resolveWildMonsterEncounter === 'function' && !Game.resolveWildMonsterEncounter.__ffsWrapped) {
    const orig = Game.resolveWildMonsterEncounter.bind(Game);
    const w = function (vid, m, opts) {
      push({
        via: 'wild',
        raid: !!(opts && opts.raid),          // havenRaidTick's own flag
        monsterId: (m && m.id) || null,
        monsterLingering: !!(m && m.lingering), // engine raid tag (havenRaidTick only)
      });
      try { return orig.apply(this, arguments); }
      finally { pop(); }
    };
    w.__ffsWrapped = true;
    Game.resolveWildMonsterEncounter = w;
  }
  if (typeof Game.resolvePatrol === 'function' && !Game.resolvePatrol.__ffsWrapped) {
    const orig = Game.resolvePatrol.bind(Game);
    const w = function (vid, first) {
      push({ via: 'patrol', raid: false, monsterId: null, monsterLingering: false });
      try { return orig.apply(this, arguments); }
      finally { pop(); }
    };
    w.__ffsWrapped = true;
    Game.resolvePatrol = w;
  }
  if (typeof Game.fieldFight === 'function' && !Game.fieldFight.__ffsWrapped) {
    const orig = Game.fieldFight.bind(Game);
    const w = function (vid, mdef, m, opts) {
      const c = C();
      let pushed = false;
      if (c) {
        const ling = !!(m && m.lingering);
        const top = c.stack.length ? c.stack[c.stack.length - 1] : null;
        if (top) {
          // The router picked the monster inside its call — upgrade from
          // the entity's own engine tag.
          if (ling) { top.raid = true; top.monsterLingering = true; }
          if (!top.monsterId && m && m.id) top.monsterId = m.id;
        } else {
          // Unrouted fieldFight: classify by the engine's own opts.
          const o = opts || {};
          const via = o.awareness ? 'agency-expedition'
            : (o.noFlee ? 'contest' : 'field-other');
          c.stack.push({
            via, raid: ling,
            monsterId: (m && m.id) || null,
            monsterLingering: ling,
          });
          pushed = true;
        }
      }
      try { return orig.apply(this, arguments); }
      finally { if (pushed) pop(); }
    };
    w.__ffsWrapped = true;
    Game.fieldFight = w;
  }
  if (typeof Game.expedDeath === 'function' && !Game.expedDeath.__ffsWrapped) {
    const orig = Game.expedDeath.bind(Game);
    const w = function (vid, mName, nm, playerAtHaven) {
      // expedDeath fires AFTER fieldFight returns (the stack has popped) —
      // it carries its own context entry.
      push({ via: 'agency-expedition', raid: false, monsterId: null, monsterLingering: false, monsterName: mName || null });
      try { return orig.apply(this, arguments); }
      finally { pop(); }
    };
    w.__ffsWrapped = true;
    Game.expedDeath = w;
  }
}

// ---------------------------------------------------------------------
// Pure source classification, exported for the proof test.
// srcOf(dctx): 'RAID' | 'EXPEDITION' | 'WILD-ENCOUNTER' | 'unattributed' | 'nontarget'
//   RAID           — the engine's raid context at the death beat
//                    (opts.raid from havenRaidTick, or m.lingering).
//   EXPEDITION     — correlation: policy-driven scholar travel that day
//                    (travelLegs>0), no raid marker, not villager-autonomous.
//   WILD-ENCOUNTER — untagged field encounters.
//   unattributed    — reserved for unobservable records (missing day/cause).
//   nontarget       — not the 'monster'-verb population.
// Rule order is the contract: raid first, then the agency-expedition
// carve-out (villager-autonomous, never policy-driven even on outing days),
// then the outing-day correlation.
function srcOf(c) {
  if (!c || c.day == null || c.cause == null) return 'unattributed';
  if (c.family !== 'monster') return 'nontarget';
  if (c.raid) return 'RAID';
  if (c.via === 'agency-expedition') return 'WILD-ENCOUNTER';
  if ((c.travelLegs | 0) > 0) return 'EXPEDITION';
  return 'WILD-ENCOUNTER';
}
function phaseOf(death, inviteDay) {
  if (inviteDay == null) return 'pre-invite';
  if (death.day < inviteDay) return 'pre-invite';
  const t = death.tier;
  if (t != null && t >= 1) return 'post-invite-in-rerun';
  return 'post-invite-outside-rerun';
}

function withFieldFightSrc(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._ffs = newRec();
      installSayCapture(Game, ctx);
      installDeathCapture(Game, ctx);
      installFightStack(Game, ctx);
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      const C = ctx._ffs;
      // Policy-window travel tracking: the EXPEDITION correlation reads the
      // POLICY's own expedition verbs (travelTo calls during the policy's
      // turn). Restored in finally — the engine sees its own function back.
      const origT = Game.travelTo;
      const countsTravel = typeof origT === 'function';
      if (countsTravel) {
        Game.travelTo = function () {
          try {
            const d = gday(Game);
            if (C) C.travelDays[d] = (C.travelDays[d] || 0) + 1;
          } catch (e) {}
          return origT.apply(this, arguments);
        };
      }
      try {
        if (C) {
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
      } finally {
        if (countsTravel) Game.travelTo = origT;
      }
    },
  });
  // The policy's upkeep runs inside the same day — cover it too.
  if (typeof base.upkeep === 'function') {
    const oUp = base.upkeep;
    wrapped.upkeep = function (Game, ctx) {
      const origT = Game.travelTo;
      const countsTravel = typeof origT === 'function';
      if (countsTravel) {
        Game.travelTo = function () {
          try {
            const d = gday(Game);
            const C = ctx._ffs;
            if (C) C.travelDays[d] = (C.travelDays[d] || 0) + 1;
          } catch (e) {}
          return origT.apply(this, arguments);
        };
      }
      try { return oUp.call(base, Game, ctx); }
      finally { if (countsTravel) Game.travelTo = origT; }
    };
  }
  return wrapped;
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
    const policy = withFieldFightSrc(base, base.id + '-ffs', base.desc + ' [FFS]');
    let live = null, dailyRan = false, stackLive = false;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); live = !!(ctx && ctx._ffs); stackLive = live && Array.isArray(ctx._ffs.stack); };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => { dailyRan = dailyRan || !!(ctx && ctx._ffs && ctx._ffs.dayTiers.length); return oDaily(G, ctx); };
    const { Game } = await loadGame({ seed: 205, mode: 'ffs-smoke', fullTelemetry: false });
    await setupGame(Game);
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`[${policyId}] instrument live`, live === true, '');
    check(`[${policyId}] fight stack live`, stackLive === true, '');
    check(`[${policyId}] daily rows collected`, dailyRan === true, '');
    check(`[${policyId}] 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`[${policyId}] overtimeTier callable`, typeof Game.overtimeTier === 'function', '');
    check(`[${policyId}] raid-marker wraps attached`, !!(Game.resolveWildMonsterEncounter.__ffsWrapped && Game.resolvePatrol.__ffsWrapped && Game.fieldFight.__ffsWrapped), '');
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
  const { Game } = await loadGame({ seed, mode: 'ffs-det', fullTelemetry: false });
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
  const pairs = [['leadfeast', 205], ['leadfeast', 246], ['belongfeast', 205], ['belongfeast', 246]];
  const days = 60;
  let green = 0;
  for (const [pid, seed] of pairs) {
    const plain = policyFor(pid);
    const instr = withFieldFightSrc(policyFor(pid), pid + '-ffs', pid + ' [FFS DET]');
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
  const policy = withFieldFightSrc(base, base.id + '-ffs', base.desc + ' [FFS]');
  const { Game } = await loadGame({ seed, mode: 'ffs', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._ffs) || newRec();
  const finalEngineDay = gday(Game);
  if (finalEngineDay > result.days + 1) console.log(`  [drift] engine day ${finalEngineDay} > daysRan ${result.days} (${policyId}-s${seed})`);
  for (const d of C.deaths) {
    d.late = d.day > result.days ? 1 : 0;
    d.beyondWindow = d.day > finalEngineDay + 1 ? 1 : 0;
  }
  const isVillager = (d) => /person|villager/i.test(d.kind || '') || d.player === true;
  const postInvite = C.deaths.filter(d => C.inviteDay != null && d.day >= C.inviteDay && isVillager(d) && d.family === 'monster');
  const srcShare = { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, unattributed: 0 };
  for (const d of postInvite) srcShare[d.src] = (srcShare[d.src] || 0) + 1;
  const attributed = (srcShare.RAID || 0) + (srcShare.EXPEDITION || 0) + (srcShare['WILD-ENCOUNTER'] || 0);
  const out = {
    seed, policyId, mode: 'fieldfightsrc',
    days: result.days, gameDays: result.gameDays, finalEngineDay,
    endReason: result.endReason,
    won: !!Game.won,
    inviteDay: C.inviteDay, seatAtInvite: C.seatAtInvite, sittings: C.sittings,
    maxWave: Math.max(1, ...C.dayTiers.map(r => r.wave || 1)),
    national: C.dayTiers.some(r => r.scale === 'national' || r.scale === 'global') ? 1 : 0,
    table: C.inviteDay != null ? 1 : 0,
    wins: !!Game.won ? 1 : 0, exiled: 0,
    nDeaths: C.deaths.length,
    srcCounts: C.srcCounts,
    postInviteMonsterVerb: postInvite.length,
    postInviteSrcShare: srcShare,
    attributionRate: postInvite.length ? attributed / postInvite.length : 1,
    deaths: C.deaths,
    dayTiers: C.dayTiers,
    travelDays: C.travelDays,
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
    `deaths=${C.deaths.length} monsterverb-post=${postInvite.length} src=${JSON.stringify(srcShare)} maxWave=${out.maxWave} nat=${out.national}`);
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
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-16/perseed-fieldfightsrc/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withFieldFightSrc, newRec, srcOf, phaseOf, policyFor };
