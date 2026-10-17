#!/usr/bin/env node
'use strict';
// casualtyseq-20261017.js — READ-ONLY post-wave-4-unlock casualty-sequence
// instrument (flesh-out loop arm sim-casualtyseq, scale-onramp axis, 2026-10-17).
//
// DIAGNOSTIC — no lever, zero src/js changes, zero policy behavior changes.
// sim-survdiff (evidence/2026-10-15/sim-survdiff.md, #268) reached 14/16
// wave-4 unlocks and found ZERO separating factors among 15 pre-registered
// state variables between survivors and non-survivors post-unlock
// ("post-unlock survival is a war of funerals, not stocks; combat deaths
// 12/14"). The named next: measure the casualty sequence itself —
// inter-death intervals and roster trajectory after wave-4 unlock.
//
// This arm runs on the PRE-SEAT courtship substrate (SEATDRIVE=0 explicit):
// the prior sim-casualtyseq (2026-10-15) measured the sequence on the ARMED
// win-side stack (SEATDRIVE=1, 12/16 wins ~d89 — win-truncated). The pre-seat
// substrate (0/16 wins, median survival 117d) shows the full war of funerals.
//
// Composition: reuses fieldfightsrc-20261016's read-only instrument (death
// capture + fight-context stack + srcOf tagging + beats) and
// survdiff-lib-20261015's livingRoster reader; adds the wave-4 rising-edge
// sampler and the daily roster-trajectory sampler. All wraps read state and
// push to ctx-local records — nothing writes to game state. The det-gate
// (DET=1) proves trajectory-identicality the fieldfightsrc way
// (both-repeat: plain-repeat + instr-repeat + plain==instr).
//
// Lazy: requiring fieldfightsrc at module load would fire its substrate
// gates (they run at load, before require.main's guard) — the unit test
// must load this module gate-free. The sweep/SMOKE/DET paths require it on
// demand. (The apexpredators-20261016 convention.)
const FFS = () => require('./fieldfightsrc-20261016');
const SD = () => require('./survdiff-lib-20261015');
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// --- substrate gates (pre-seat courtship stack; seatdrive explicitly OFF) ---
function substrateGates() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE === '1') { console.error('SWEEP STOP: SEATDRIVE must be 0/unset on the pre-seat substrate.'); process.exit(2); }
  for (const k of ['WAVE5REACH', 'W3DRIVE']) {
    if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
  }
  const TF = require('./policies/tribfloor');
  if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [205, 246, 321, 412, 523, 634, 745, 856]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-casualtyseq');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'casualtyseq-beats');
const BEAT_CAP = 2000;
const BEAT_LEN = 300;
const CSQ_BEAT = /died|funeral|Funeral|buried|bury |killed|slain|fallen|mantle|succession|exile|Exile/i;

const policyFor = (pid) => { const TF = require('./policies/tribfloor'); return pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast; };
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function waveNow(Game) {
  try { return Game.unlockedWave ? (Game.unlockedWave() | 0) : null; } catch (e) { return null; }
}

// ---------------------------------------------------------------------------
// Pure functions (exported for the proof test). All deterministic.
// ---------------------------------------------------------------------------

// unlockDayOf(dayTiers): first day with wave >= 4 (rising edge), else null.
function unlockDayOf(dayTiers) {
  for (const r of (dayTiers || [])) {
    if ((r.wave | 0) >= 4) return r.day;
  }
  return null;
}

// wave5ContactDay(dayTiers): first day with wave >= 5, else null.
function wave5ContactDay(dayTiers) {
  for (const r of (dayTiers || [])) {
    if ((r.wave | 0) >= 5) return r.day;
  }
  return null;
}

// isVillagerDeath(d): the person/villager kinds, excluding the scholar.
// fieldfightsrc's d.player flag is /player|scholar/i on the registerDeath kind.
function isVillagerDeath(d) {
  if (!d) return false;
  if (d.player === true) return false; // the scholar — excluded (their metric is separate)
  return /person|villager/i.test(d.kind || '');
}

// sourceOf(d, ffsSrcOf): source-system tag for a post-unlock villager death.
// The fieldfightsrc tagging convention (raid / expedition / wild-encounter)
// covers the monster family via the injected ffsSrcOf (rule order: raid
// first, then the agency-expedition carve-out, then the outing-day
// correlation). Contest, non-monster families, and unnameables extend it:
//   RAID | EXPEDITION | WILD-ENCOUNTER | CONTEST | COMBAT | DISEASE |
//   STARVATION | WOUNDS | OTHER | unattributed
function sourceOf(d, ffsSrcOf) {
  if (!d || d.day == null || d.cause == null) return 'unattributed';
  const causeL = String(d.cause || '').toLowerCase();
  if (d.via === 'contest' || /(^|[^a-z])contest([^a-z]|$)/i.test(causeL)) return 'CONTEST';
  if (d.family === 'monster') {
    const s = ffsSrcOf(d);
    if (s === 'RAID') return 'RAID';
    if (s === 'EXPEDITION') return 'EXPEDITION';
    if (s === 'WILD-ENCOUNTER') return 'WILD-ENCOUNTER';
    return s === 'nontarget' ? 'WILD-ENCOUNTER' : 'unattributed'; // nontarget is unreachable here (family is monster); keep honest
  }
  if (d.family === 'combat') return 'COMBAT';       // raid-defense, ambush, 'the wild' — the blow-by-blow combat verb
  if (d.family === 'sickness') return 'DISEASE';
  if (d.family === 'starvation') return 'STARVATION';
  if (d.family === 'wounds') return 'WOUNDS';
  return 'OTHER'; // family null — raw cause preserved on the record
}

// interDeathIntervals(postUnlockDeaths, unlockDay): days since the previous
// post-unlock death; the first interval is days since the unlock.
function interDeathIntervals(deaths, unlockDay) {
  const days = (deaths || []).map(d => d.day).sort((a, b) => a - b);
  const out = [];
  let prev = unlockDay;
  for (const day of days) { out.push(day - prev); prev = day; }
  return out;
}

// clusters(postUnlockDeaths): sliding 7-day windows with >=3 deaths.
// Each cluster: {start, end, n}. Merged on overlap.
function clusters(deaths) {
  const days = (deaths || []).map(d => d.day).sort((a, b) => a - b);
  if (days.length < 3) return [];
  const raw = [];
  for (let i = 0; i < days.length; i++) {
    let j = i;
    while (j < days.length && days[j] - days[i] <= 7) j++;
    if (j - i >= 3) raw.push({ start: days[i], end: days[j - 1], n: j - i });
  }
  // Merge overlapping windows, keep the widest n per merged span.
  const merged = [];
  for (const c of raw) {
    const last = merged[merged.length - 1];
    if (last && c.start <= last.end) {
      last.end = Math.max(last.end, c.end);
      last.n = Math.max(last.n, c.n);
    } else merged.push(Object.assign({}, c));
  }
  return merged;
}

// trajectoryShape(runs): the sprint-vs-siege verdict (pre-registered):
//   sprint — the median run ENDS <= 45 days after the wave-4 unlock
//            (the post-unlock window is a race, not a hold);
//   siege  — it holds longer (median > 45d).
// Runs are {unlockDay, endDay, daily:[{day, living}]}; only runs with a
// non-null unlockDay contribute.
function trajectoryShape(runs) {
  const rs = (runs || []).filter(r => r && r.unlockDay != null && r.endDay != null);
  if (!rs.length) return { shape: 'no-unlocks', medianDaysPostUnlock: null, n: 0 };
  const spans = rs.map(r => r.endDay - r.unlockDay).sort((a, b) => a - b);
  const med = spans.length % 2
    ? spans[(spans.length - 1) / 2]
    : (spans[spans.length / 2 - 1] + spans[spans.length / 2]) / 2;
  return { shape: med <= 45 ? 'sprint' : 'siege', medianDaysPostUnlock: med, n: rs.length };
}

function median(xs) {
  const s = (xs || []).filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

// ---------------------------------------------------------------------------
// The instrument: composes fieldfightsrc's read-only wrap and adds the
// wave-4 rising-edge + daily roster-trajectory samplers.
function withCasualtySeq(base, id, desc) {
  const ffs = FFS().withFieldFightSrc(base, id + '-cseq', desc + ' [CSEQ]');
  const sd = SD();
  const wrapped = Object.assign({}, ffs, {
    id, desc,
    setup(Game, ctx) {
      ctx._cseq = { daily: [], unlockDay: null, scholarFlags: [] };
      const oSetup = ffs.setup;
      if (oSetup) oSetup(Game, ctx);
      installScholarFlag(Game, ctx);
    },
    daily(Game, ctx) {
      try {
        const C = ctx._cseq;
        if (C) {
          const day = gday(Game);
          const living = sd.livingRoster(Game).length;
          const wave = waveNow(Game);
          C.daily.push({ day, living, wave });
          if (C.unlockDay == null && (wave | 0) >= 4) C.unlockDay = day;
        }
      } catch (e) {}
      const oDaily = ffs.daily;
      return oDaily ? oDaily(Game, ctx) : undefined;
    },
  });
  return wrapped;
}

// installScholarFlag(Game, ctx): outermost registerDeath wrap (installed
// AFTER fieldfightsrc's wrap, so this is the outer layer). At the death
// beat — before orig runs succession — records whether the dying vid is the
// current scholar (Game.villagerId). The 'player'-kind convention misses
// scholar deaths: the scholar dies as kind 'villager' (mantle transfer
// beats prove it: "The mantle passes to Rocco Boyko" for a kind='villager'
// death). Read-only: pushes to a ctx-local list, never touches game state.
// Zipped by call index with fieldfightsrc's death list in oneRun (both
// wraps fire synchronously for the same calls, in the same order).
function installScholarFlag(Game, ctx) {
  if (ctx._cseqScholarInstalled) return;
  ctx._cseqScholarInstalled = true;
  const inner = Game.registerDeath;
  if (typeof inner !== 'function' || inner.__cseqWrapped) return;
  const w = function (opts) {
    try {
      const C = ctx._cseq;
      if (C && C.scholarFlags.length < 1200) {
        const o = opts || {};
        const vid = String(o.villagerId || o.monsterId || '');
        let sid = null;
        try { sid = Game.villagerId || null; } catch (e) {}
        C.scholarFlags.push({ vid, isScholar: !!sid && vid === String(sid) });
      }
    } catch (e) {}
    return inner.apply(this, arguments);
  };
  w.__cseqWrapped = true;
  Game.registerDeath = w;
}

// ---------------------------------------------------------------------------
// SMOKE gate: the instrument lives, unlock-day + roster rows sample, deaths
// capture, day-stamps sane — the survdiff lesson (proof must cover sweep
// day-stamping). 15d x 2 policies.
async function smokeGate() {
  substrateGates();
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    const base = policyFor(policyId);
    const policy = withCasualtySeq(base, base.id + '-cseq-smoke', base.desc + ' [CSEQ SMOKE]');
    const { Game } = await loadGame({ seed: 205, mode: 'cseq-smoke', fullTelemetry: false });
    await setupGame(Game);
    let live = false, dailyRows = 0, deathRows = 0, daysRan = 0, stampOK = true;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); live = !!(ctx && ctx._cseq && ctx._ffs); };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => {
      if (ctx && ctx._cseq) dailyRows = ctx._cseq.daily.length;
      if (ctx && ctx._ffs) deathRows = ctx._ffs.deaths.length;
      return oDaily(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    daysRan = r && r.days;
    const engineDay = gday(Game);
    check(`[${policyId}] instrument live`, live === true, '');
    check(`[${policyId}] roster rows sampled`, dailyRows >= 14, `rows=${dailyRows}`);
    check(`[${policyId}] 15d run completes`, daysRan >= 15, `days=${daysRan}`);
    check(`[${policyId}] no crash on death capture`, deathRows >= 0, `deaths=${deathRows}`);
    check(`[${policyId}] wave sampler reads a wave`, Number.isFinite(waveNow(Game)), `wave=${waveNow(Game)}`);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: GREEN — instrument live, roster rows sampled, runs complete.');
}

// ---------------------------------------------------------------------------
// DET-GATE: instrument ON vs OFF trajectory-identical, 4 pairs, both-repeat
// (plain-repeat + instr-repeat + plain==instr) — the fieldfightsrc convention.
async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'cseq-det', fullTelemetry: false });
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
  substrateGates();
  const pairs = [['leadfeast', 205], ['leadfeast', 246], ['belongfeast', 205], ['belongfeast', 246]];
  const days = 30;
  let green = 0;
  for (const [pid, seed] of pairs) {
    const plain = policyFor(pid);
    const instr = withCasualtySeq(policyFor(pid), pid + '-cseq', pid + ' [CSEQ DET]');
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
  console.log(`DET-GATE: ${green}/${pairs.length} identical (plain-repeat + instr-repeat + plain==instr, ends agree).`);
  if (green < pairs.length) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// ---------------------------------------------------------------------------
// The sweep.
async function oneRun(seed, policyId) {
  const ffsSrcOf = FFS().srcOf;
  const base = policyFor(policyId);
  const policy = withCasualtySeq(base, base.id + '-cseq', base.desc + ' [CSEQ]');
  const { Game } = await loadGame({ seed, mode: 'cseq', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const F = (runCtx && runCtx._ffs) || FFS().newRec();
  const Q = (runCtx && runCtx._cseq) || { daily: [], unlockDay: null };
  const finalEngineDay = gday(Game);

  // The survdiff lesson: the day-stamp self-consistency guard — every death
  // day must fall inside [1, engineDays+1].
  for (const d of F.deaths) {
    if (!(d.day >= 1 && d.day <= finalEngineDay + 1)) {
      console.error(`SWEEP STOP: death day ${d.day} outside [1, ${finalEngineDay + 1}] (${policyId}-s${seed}) — day-stamping broken.`);
      process.exit(5);
    }
  }

  const unlockDay = Q.unlockDay != null ? Q.unlockDay : unlockDayOf(F.dayTiers);
  const w5Day = wave5ContactDay(F.dayTiers);
  // All villager deaths (the full census — the post-unlock subset is flagged;
  // the pre-unlock rows matter when the wave-4 on-ramp is closed).
  // isScholar is zipped by call index from the outer wrap's scholarFlags
  // (both wraps fire synchronously for the same registerDeath calls).
  const flags = (Q.scholarFlags || []);
  const allVillagerDeaths = (F.deaths || [])
    .map((d, i) => {
      const fl = flags[i] || {};
      const isScholar = fl.isScholar === true && (!fl.vid || fl.vid === d.vid);
      return { d, isScholar };
    })
    .filter(({ d, isScholar }) => !isScholar && isVillagerDeath(d))
    .map(({ d, isScholar }) => {
      const src = sourceOf(d, ffsSrcOf);
      return {
        day: d.day, name: d.name, kind: d.kind, cause: d.cause, family: d.family,
        src, via: d.via, raid: d.raid, monsterName: d.monsterName,
        scholarAway: d.scholarAway, travelLegs: d.travelLegs, tier: d.tier,
        postUnlock: unlockDay != null && d.day >= unlockDay,
      };
    })
    .sort((a, b) => a.day - b.day);
  const scholarDeaths = (F.deaths || []).filter((d, i) => {
    const fl = flags[i] || {};
    return fl.isScholar === true && (!fl.vid || fl.vid === d.vid);
  }).map((d, i) => ({ day: d.day, name: d.name, cause: d.cause, family: d.family }));
  const postDeaths = allVillagerDeaths.filter(d => d.postUnlock);
  const intervals = interDeathIntervals(postDeaths, unlockDay);
  const cls = clusters(postDeaths);
  const srcShares = {};
  let attributed = 0;
  for (const d of postDeaths) {
    srcShares[d.src] = (srcShares[d.src] || 0) + 1;
    if (d.src !== 'unattributed') attributed++;
  }
  const n0 = Q.daily.length ? Q.daily[0].living : null;
  const atOffset = (off) => {
    const r = Q.daily.find(x => x.day >= (unlockDay == null ? -1 : unlockDay + off));
    return r ? r.living : null;
  };
  const out = {
    seed, policyId, mode: 'casualtyseq',
    days: result.days, finalEngineDay,
    endReason: result.endReason,
    won: !!Game.won,
    inviteDay: F.inviteDay, sittings: F.sittings,
    unlockDay, wave5Day: w5Day,
    maxWave: Math.max(1, ...F.dayTiers.map(r => r.wave || 1)),
    national: F.dayTiers.some(r => r.scale === 'national' || r.scale === 'global') ? 1 : 0,
    table: F.inviteDay != null ? 1 : 0,
    wins: !!Game.won ? 1 : 0, exiled: 0,
    nDeaths: F.deaths.length,
    postUnlockVillagerDeaths: postDeaths.length,
    allVillagerDeaths: allVillagerDeaths.length,
    scholarDeaths: scholarDeaths.length,
    scholarDeathList: scholarDeaths,
    srcShares,
    attributionRate: postDeaths.length ? attributed / postDeaths.length : 1,
    intervals,
    medianInterval: median(intervals),
    clusters: cls,
    first10dShare: postDeaths.length && unlockDay != null
      ? postDeaths.filter(d => d.day - unlockDay <= 10).length / postDeaths.length : null,
    trajectory: {
      unlockDay, endDay: result.days, n0,
      n15: unlockDay != null ? atOffset(15) : null,
      n30: unlockDay != null ? atOffset(30) : null,
      n60: unlockDay != null ? atOffset(60) : null,
      daily: Q.daily,
    },
    deaths: postDeaths,
    allDeaths: allVillagerDeaths,
    beatsDropped: F.beatsDropped,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    // Persist the FULL beats array (the fieldfightsrc capture, up to
    // BEAT_CAP) — the sense-read needs the funeral narration, and the
    // beat regexes miss some funeral templates ("X is dead", "the grave").
    if ((F.beats || []).length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(F.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed}] days=${result.days} end=${result.endReason} unlock=${unlockDay} ` +
    `w5=${w5Day} deaths-post=${postDeaths.length} src=${JSON.stringify(srcShares)} maxWave=${out.maxWave}`);
}

(async () => {
  if (require.main !== module) return; // require() by the proof test must not launch the sweep
  substrateGates();
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
    const seeds = process.env.PILOT === '1' ? SEEDS.slice(0, 8) : SEEDS;
    for (const policyId of POLICIES) {
      if (only && !only[policyId]) continue;
      for (const seed of seeds) {
        await oneRun(seed, policyId);
      }
    }
    console.log(`\nSWEEP DONE (${process.env.PILOT === '1' ? 'PILOT 8 seeds' : 'FULL 16 seeds'} x ${POLICIES.length} policies) — per-seed JSONs in evidence/2026-10-17/perseed-casualtyseq/.`);
  }
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = {
  withCasualtySeq, installScholarFlag, unlockDayOf, wave5ContactDay, isVillagerDeath, sourceOf,
  interDeathIntervals, clusters, trajectoryShape, median, policyFor,
};
