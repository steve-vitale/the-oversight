#!/usr/bin/env node
// scripts/monostick-sweep.js — MONOTONIC IN THE WILD (sim-monostick,
// 2026-10-15): does the landed monotonic peak ratchet help or hurt a
// weakened village vs the old re-lock mercy?
//
// sim-findings #288: the peak ratchet fired only in proof fixtures — no run
// has tested stickiness against the old re-lock mercy on a weakened village.
// Named next: deliberately include a link-break.
//
// INSTRUMENT-ONLY: zero src/js changes, zero policy behavior changes.
// The scenario uses the ENGINE'S OWN link-break path (Game.breakLink(id,
// 'gambit') — the exact call the UI's link-break button makes).
//
// Arms (paired, identical seeds):
//   sticky (a): pristine current engine. The monotonic peak ratchet is
//               LANDED (readiness-gate v3, 7a72b456): villageStandingTotal()
//               floors the gated total at the released wave's threshold via
//               state._standingPeakWave — a broken link can't re-lock an
//               opened draft.
//   mercy  (b): pristine engine + instrument-side mercy emulation. At each
//               deliberate break the instrument zeroes the engine's OWN
//               ratchet-memory field (Game.state._standingPeakWave = 0 — the
//               exact field villageStandingTotal() reads and writes; there
//               is no separate setter method in the engine). With peak=0 the
//               floor is max(gated, 0) = gated: behaviorally identical to the
//               pre-ratchet engine — the break re-locks by engine law, and a
//               later re-earn re-records the peak and re-fires the release
//               beat, exactly as the old engine did. Pure field write, no
//               RNG, trajectory-neutral until a deliberate break fires.
//
// "Weakened villages" (the #288 named next) are operationalized, not
// hand-picked: a pair counts as weakened iff the mercy arm's break actually
// re-locks (waveEff drops below pre-break) — i.e. villages that WOULD have
// triggered the mercy under the old engine. Non-re-locking pairs are binned
// separately (their standing held by other sources; the mercy never bit).
//
// Scenario: at the first observed wave-4 unlock (waveEff >= 4 — pre-break
// both arms are pristine-identical), +3d: break the oldest qualifying link
// (active + seasoned + regional+ per standing.js — the +34/link set) via the
// engine's own Game.breakLink(id, 'gambit'). +10d: break a second if
// qualifying links remain (the prior run's wr>=4 condition was dead on
// arrival — every first break re-locked; the 2-link case is tested here by
// conditioning on links remaining only).
//
// Attribution per PAIR (paired identical-seed (sticky,mercy) x policy x
// seed): break cause (link id/kind/other, 'gambit', brokeOk, same link both
// arms), wave-4/5 rung state at break (standingEff/Raw pre/post, waveEff
// pre/post, peak pre/post, reLocked on mercy, heldByRatchet on sticky), 30d
// post-first-break outcome on BOTH arms (held/died/hollow, uncensored).
// A pair is fully attributed iff: both events brokeOk with the SAME linkId,
// every numeric field present on both, and both 30d outcomes determined.
// Censored pairs are in the denominator, out of the numerator.
//
// Env:
//   ARMS="sticky,mercy"  POLICIES="fourthlink,leadfeast"
//   SEEDS="11,22,33,44,55,66,77,88"  DAYS=180
//   BREAK=1/0    — scenario enabled (0 for A/A + honesty checks)
//   MONO_OFF=1   — fully pristine: no wraps at all, hash-only (A/A OFF side)
//   STICK_RED=1  — REDMODE: mercy emulation disabled (the mercy arm then
//                  behaves sticky; the proof's re-lock check must FAIL)
//   SMOKE=1      — instrument-honesty gate (15d/policy/arm, no unlocks/breaks)
//   AA=1         — A/A sanity: sticky vs mercy (BREAK=0) vs MONO_OFF pristine,
//                  byte-identical trajectory hashes pre-scenario
//   OUT=... PERSEED_DIR=...
'use strict';
// FOURTHLINK=1 BEFORE requires: policies/fourthlink.js reads the env at
// module load (the gate that turns leadcourt into the uncapped 4th-link
// courtship road).
process.env.FOURTHLINK = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const RB = require('./readinessbind-lib');

const ARMS = (process.env.ARMS || 'sticky,mercy').split(',').map(s => s.trim()).filter(a => a === 'sticky' || a === 'mercy');
let forceBreak = null; // when non-null, overrides process.env.BREAK
const doBreakNow = () => forceBreak !== null ? forceBreak === '1' : process.env.BREAK !== '0';
const isMonoOff = () => process.env.MONO_OFF === '1';
// REDMODE accessor (call-time: the proof toggles it inside one process).
const mercyOff = () => process.env.STICK_RED === '1';
if (!ARMS.length) { console.error('MONOSTICK FATAL: no valid arms in ARMS.'); process.exit(2); }

const POLICY_REGISTRY = {
  fourthlink: require('./policies/fourthlink').fourthlink,
  leadfeast: require('./policies/feastscale').leadfeast,
};

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// qualifyingLinks: diplomacy-contributing links — active AND seasoned AND
// regional+ (the exact set standing.js counts for the +34/link term).
// Oldest first (deterministic break order).
function qualifyingLinks(Game) {
  try {
    const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    const out = ls.filter(l => {
      try {
        return l && l.status === 'active'
          && (typeof Game._linkSeasoned === 'function' ? Game._linkSeasoned(l, !!l.conquered) : false)
          && (typeof Game._linkRegionalPlus === 'function' ? Game._linkRegionalPlus(l) : false);
      } catch (e) { return false; }
    });
    out.sort((a, b) => ((a.day || 0) - (b.day || 0)) || String(a.id || '').localeCompare(String(b.id || '')));
    return out;
  } catch (e) { return []; }
}

function otherName(Game, link) {
  try {
    const o = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : null;
    return (typeof Game._ovName === 'function') ? Game._ovName(o) : String(o);
  } catch (e) { return '?'; }
}

// applyMercy(Game): the instrument-side re-lock mercy. Zeroes the engine's
// OWN ratchet-memory field (state._standingPeakWave — the exact field
// villageStandingTotal() reads via _standingPeakWave() and writes on
// release). Returns {peakPre, peakPost}. With peak=0 the floor is
// max(gated,0)=gated: the pre-ratchet engine law, computed by the engine
// itself. Exported so the proof drives the same code the sweep uses.
function applyMercy(Game) {
  let peakPre = -1, peakPost = -1;
  try { peakPre = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : -1; } catch (e) {}
  try { if (Game && Game.state) Game.state._standingPeakWave = 0; } catch (e) {}
  try { peakPost = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : -1; } catch (e) {}
  return { peakPre, peakPost };
}

// breakLinkScenario: the deliberate link-break step, via the ENGINE'S OWN
// link-break path (Game.breakLink(id, 'gambit')). On arm='mercy' (and not
// REDMODE) the mercy emulation fires between the break and the post reads.
// readers: {standingEff, standingRaw, waveEff, peak} functions on Game.
// Exported so the proof drives the same code the sweep's daily wrap uses.
function breakLinkScenario(Game, link, readers, ring, arm) {
  if (!link || !Game || typeof Game.breakLink !== 'function') return null;
  const pre = {
    stEff: readers.standingEff(Game), stRaw: readers.standingRaw(Game),
    waveEff: readers.waveEff(Game), peak: readers.peak(Game),
  };
  let broke = null;
  try { broke = Game.breakLink(link.id, 'gambit'); } catch (e) { broke = 'ERR:' + (e && e.message); }
  const brokeOk = broke !== null && broke !== undefined && !String(broke).startsWith('ERR');
  let mercyApplied = false, mercyPeaks = null;
  if (brokeOk && arm === 'mercy' && !mercyOff()) {
    mercyPeaks = applyMercy(Game);
    mercyApplied = true;
  }
  const post = {
    stEff: readers.standingEff(Game), stRaw: readers.standingRaw(Game),
    waveEff: readers.waveEff(Game), peak: readers.peak(Game),
  };
  const ev = {
    arm: arm || '?',
    breakDay: gday(Game), linkId: link.id, linkKind: link.kind || '?',
    other: otherName(Game, link), how: 'gambit',
    brokeOk, mercyApplied,
    mercyPeakPre: mercyPeaks ? mercyPeaks.peakPre : null,
    mercyPeakPost: mercyPeaks ? mercyPeaks.peakPost : null,
    stEffPre: pre.stEff, stEffPost: post.stEff,
    stRawPre: pre.stRaw, stRawPost: post.stRaw,
    waveEffPre: pre.waveEff, waveEffPost: post.waveEff,
    peakPre: pre.peak, peakPost: post.peak,
    // reLocked: the mercy bit — the wave dropped under raw law.
    reLocked: post.waveEff < pre.waveEff,
    // heldByRatchet: engine-real hold — raw standing fell below the t4 bar
    // but the effective wave didn't (the floor did the work, not raw law).
    heldByRatchet: (post.stRaw < 100) && (post.waveEff >= pre.waveEff) && (pre.waveEff >= 4),
    // heldByRaw: the wave held because raw standing still clears the bar
    // (mercy wouldn't have bitten here either).
    heldByRaw: (post.stRaw >= 100) && (post.waveEff >= pre.waveEff),
    beatTail: Array.isArray(ring) ? ring.slice(-8) : [],
  };
  return brokeOk ? ev : null;
}

function readersOf(Game) {
  return {
    standingEff: (G) => { try { return (G.villageStandingTotal ? G.villageStandingTotal() : 0) | 0; } catch (e) { return 0; } },
    standingRaw: (G) => { try { return ((G.villageStanding ? G.villageStanding() : null) || {}).total | 0; } catch (e) { return 0; } },
    waveEff: (G) => { try { return G.unlockedWave ? G.unlockedWave() : 1; } catch (e) { return 1; } },
    peak: (G) => { try { return (typeof G._standingPeakWave === 'function') ? (G._standingPeakWave() | 0) : 0; } catch (e) { return 0; } },
  };
}

async function oneRun(seed, pid, arm, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'monostick-' + arm + '-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const R = readersOf(Game);

  // Beat ring: wrap the silenced say/sysSay, call through, record.
  // Skipped in MONO_OFF.
  const ring = [];
  const RING_CAP = parseInt(process.env.RING_CAP || '200', 10) || 200;
  const pushRing = (tag, msg) => {
    try {
      ring.push('d' + gday(Game) + ' ' + tag + ': ' + String(msg).slice(0, 220));
      if (ring.length > RING_CAP) ring.splice(0, ring.length - RING_CAP);
    } catch (e) {}
  };
  if (!isMonoOff()) {
    try {
      const oSay = Game.say, oSys = Game.sysSay;
      Game.say = function (m) { pushRing('say', m); return oSay.apply(this, arguments); };
      Game.sysSay = function (m) { pushRing('sys', m); return oSys.apply(this, arguments); };
    } catch (e) {}
  }

  const rec = {
    policy: pid, seed, arm, days,
    monoOff: isMonoOff(), doBreak: doBreakNow(), mercyOff: mercyOff(),
    samples: [],
    unlock4: null,          // {day, waveEff, standingEff, snapshot}
    breaks: [],             // scenario break events
    breakDays: [],
    tableDays: [],
    hashes: [],
    endReason: null, gameDays: 0, over: false,
    won: 0, exiled: 0,
    maxRank: 'village',
    maxWaveEff: 1, peakSeen: 0,
    noScenarioReason: null,
  };
  const RANK_IX = { village: 0, local: 1, regional: 2, national: 3, global: 4 };

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  if (isMonoOff()) {
    policy.daily = (G, ctx) => {
      try { rec.hashes.push(gday(G) + ':' + RB.trajectoryHash(G)); } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
  } else {
    policy.daily = (G, ctx) => {
      try {
        const day = gday(G);
        const we = R.waveEff(G);
        const stEff = R.standingEff(G), stRaw = R.standingRaw(G), peak = R.peak(G);
        const seat = RB.tableSeatName(G);
        if (seat !== 'none') rec.tableDays.push(day);
        const living = RB.livingNPCs(G);
        let rank = 'village';
        try { rank = RB.scaleRank(G); } catch (e) {}
        if ((RANK_IX[rank] | 0) > (RANK_IX[rec.maxRank] | 0)) rec.maxRank = rank;
        if (we > rec.maxWaveEff) rec.maxWaveEff = we;
        if (peak > rec.peakSeen) rec.peakSeen = peak;
        rec.samples.push({ day, waveEff: we, stEff, stRaw, peak, living, seat, rank });
        rec.hashes.push(day + ':' + RB.trajectoryHash(G));

        if (doBreakNow()) {
          // Unlock detection on the effective wave (pre-break both arms are
          // pristine-identical, so this is the raw law too).
          if (!rec.unlock4 && we >= 4) {
            let snap = null;
            try { snap = RB.readinessSnapshot(G, 4); } catch (e) { snap = { error: String(e && e.message) }; }
            rec.unlock4 = { day, waveEffAtUnlock: we, stEffAtUnlock: stEff, snapshot: snap, breakDay1: day + 3, breakDay2: day + 10 };
            pushRing('mono', 'scenario armed: wave-4 unlock d' + day + ' (eff ' + we + ', stEff ' + stEff + ', stRaw ' + stRaw + ', peak ' + peak + '); breaks d' + (day + 3) + '/d' + (day + 10));
          }
          if (rec.unlock4 && rec.breaks.length < 2) {
            const u = rec.unlock4;
            // Break #1 at unlock+3d; break #2 at unlock+10d iff qualifying
            // links remain (the 2-link case the prior run never tested).
            const wantBreak = (rec.breaks.length === 0 && day === u.breakDay1)
              || (rec.breaks.length === 1 && day === u.breakDay2);
            if (wantBreak) {
              const cands = qualifyingLinks(G);
              if (cands.length) {
                const link = cands[0];
                const ev = breakLinkScenario(G, link, R, ring, arm);
                if (ev) {
                  ev.n = rec.breaks.length + 1;
                  rec.breaks.push(ev);
                  rec.breakDays.push(day);
                  pushRing('mono', 'BREAK #' + ev.n + ' d' + day + ' [' + arm + '] link ' + link.id + ' (' + ev.other + '): stEff ' + ev.stEffPre + '->' + ev.stEffPost + ', stRaw ' + ev.stRawPre + '->' + ev.stRawPost + ', waveEff ' + ev.waveEffPre + '->' + ev.waveEffPost + (ev.mercyApplied ? ' MERCY-RESET' : '') + (ev.reLocked ? ' RE-LOCK' : '') + (ev.heldByRatchet ? ' HELD-BY-RATCHET' : '') + (ev.heldByRaw ? ' HELD-BY-RAW' : ''));
                } else {
                  pushRing('mono', 'break #' + (rec.breaks.length + 1) + ' d' + day + ': breakLink FAILED on ' + link.id);
                }
              } else {
                pushRing('mono', 'break #' + (rec.breaks.length + 1) + ' d' + day + ': NO qualifying links — scenario short');
              }
            }
          }
          if (rec.unlock4 && rec.breaks.length === 0 && day > rec.unlock4.breakDay2) {
            rec.noScenarioReason = 'no-qualifying-links';
          }
        }
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
  }

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  rec.endReason = result.endReason;
  rec.gameDays = result.gameDays;
  try { rec.over = !!Game.over; } catch (e) {}
  try { rec.won = Game.won ? 1 : 0; } catch (e) {}
  try { rec.exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}

  if (doBreakNow() && !rec.unlock4 && !rec.noScenarioReason) rec.noScenarioReason = 'no-w4-unlock';

  // Per-break post windows: standing series + 30d outcome (anchored at the
  // FIRST break day — the question is the break's aftermath).
  const firstBreakDay = rec.breakDays.length ? rec.breakDays[0] : null;
  for (const b of rec.breaks) {
    const series = {};
    for (const dOff of [1, 3, 7, 14, 30]) {
      const s = rec.samples.find(x => x.day === b.breakDay + dOff);
      series['d+' + dOff] = s ? { stEff: s.stEff, stRaw: s.stRaw, waveEff: s.waveEff, peak: s.peak, living: s.living } : null;
    }
    b.postSeries = series;
    const plus30 = rec.samples.find(x => x.day === firstBreakDay + 30);
    b.outcome = RB.classifyOutcome(
      { unlockDay: firstBreakDay, wave: b.waveEffPre },
      { finalDay: rec.gameDays, endReason: rec.endReason, over: rec.over,
        livingAtPlus30: plus30 ? plus30.living : -1, tableDays: rec.tableDays }
    );
  }
  // Sense slices: the ring around each break — what the village experiences.
  const sense = [];
  for (const b of rec.breaks) {
    // Center the slice on the break day itself: from the first line of the
    // break day forward (the break beat + aftermath are what sense-testing
    // reads). ±2d window, up to 90 lines.
    const near = ring.filter(r => {
      const m = r.match(/^d(\d+) /); return m && Math.abs(+m[1] - b.breakDay) <= 2;
    });
    let start = near.findIndex(r => { const m = r.match(/^d(\d+) /); return m && (+m[1] | 0) >= b.breakDay; });
    if (start < 0) start = 0;
    sense.push({ kind: 'break', arm, day: b.breakDay, ring: near.slice(start, start + 90) });
  }
  rec.sense = sense;
  return rec;
}

// pairAttributed(P): full-attribution check for one (sticky,mercy) pair.
function pairAttributed(P) {
  if (!P || !P.sticky || !P.mercy) return false;
  const s = P.sticky.breaks, m = P.mercy.breaks;
  if (!s.length || !m.length || s.length !== m.length) return false;
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = m[i];
    if (!a.brokeOk || !b.brokeOk) return false;
    if (a.linkId !== b.linkId) return false; // pre-break divergence: not a pair
    for (const k of ['stEffPre', 'stEffPost', 'stRawPre', 'stRawPost', 'waveEffPre', 'waveEffPost', 'peakPre', 'peakPost']) {
      if (typeof a[k] !== 'number' || typeof b[k] !== 'number') return false;
    }
    if (typeof a.reLocked !== 'boolean' || typeof b.reLocked !== 'boolean') return false;
    if (typeof a.heldByRatchet !== 'boolean' || typeof b.heldByRatchet !== 'boolean') return false;
    const ao = (a.outcome || {}).outcome, bo = (b.outcome || {}).outcome;
    const ok = o => o === 'held' || o === 'died' || o === 'hollow';
    if (!ok(ao) || !ok(bo)) return false; // censored: in denominator, out of numerator
  }
  return true;
}

// SMOKE=1: instrument-honesty gate — policies unwrap to their named exports,
// the sampler collects, and no unlocks/breaks appear on a 15d smoke (a
// break/unlock here would prove hallucination).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  const base4 = POLICY_REGISTRY.fourthlink, baseF = POLICY_REGISTRY.leadfeast;
  check('[fourthlink] unwrapped named export, id=fourthlink (FOURTHLINK=1 on)', base4 && base4.id === 'fourthlink', 'id=' + (base4 && base4.id));
  check('[leadfeast] unwrapped named export, id=leadfeast', baseF && baseF.id === 'leadfeast', 'id=' + (baseF && baseF.id));
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s) — refusing to run policy-less.`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) for (const arm of ['sticky', 'mercy']) {
    const rec = await oneRun(11, pid, arm, 15);
    check(`[${pid}/${arm}] sampler collected daily samples`, rec.samples.length > 0, `n=${rec.samples.length}`);
    check(`[${pid}/${arm}] hashes collected`, rec.hashes.length === rec.samples.length, `n=${rec.hashes.length}`);
    const snapOk = rec.samples.every(s => typeof s.stEff === 'number' && typeof s.waveEff === 'number' && typeof s.peak === 'number');
    check(`[${pid}/${arm}] samples carry standing+wave+peak reads`, snapOk);
    check(`[${pid}/${arm}] no wave-4 unlock on 15d smoke`, !rec.unlock4, `unlock4=${rec.unlock4 ? 'd' + rec.unlock4.day : 'none'}`);
    check(`[${pid}/${arm}] no breaks on 15d smoke`, rec.breaks.length === 0, `breaks=${rec.breaks.length}`);
    check(`[${pid}/${arm}] mercy reset not fired pre-scenario`, rec.breaks.every(b => true) && rec.peakSeen === 0, `peakSeen=${rec.peakSeen}`);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: instrument samples cleanly, no hallucinated unlocks or breaks.');
}

// AA=1: A/A sanity — sticky vs mercy (BREAK=0) vs MONO_OFF pristine,
// byte-identical trajectory hashes. The mercy reset only fires inside a
// deliberate break; with breaks off all three must be the same trajectory.
async function aaSanity() {
  const fails = [];
  const seeds = (process.env.AA_SEEDS || '11,22').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.AA_DAYS || '60', 10);
  for (const pid of Object.keys(POLICY_REGISTRY)) for (const seed of seeds) {
    forceBreak = '0';
    process.env.MONO_OFF = '1';
    const off = await oneRun(seed, pid, 'sticky', days);
    delete process.env.MONO_OFF;
    const st = await oneRun(seed, pid, 'sticky', days);
    const me = await oneRun(seed, pid, 'mercy', days);
    forceBreak = null;
    const h = r => r.hashes.join('\n');
    const sameSM = h(st) === h(me), sameSO = h(st) === h(off);
    console.log(`  ${sameSM && sameSO ? 'PASS' : 'FAIL'} A/A [${pid}/s${seed}] ${days}d sticky~mercy:${sameSM ? 'same' : 'DIVERGED'} sticky~pristine:${sameSO ? 'same' : 'DIVERGED'} (n=${st.hashes.length})`);
    if (!sameSM || !sameSO) {
      fails.push(pid + '/s' + seed);
      const a = st.hashes, b = sameSM ? null : me.hashes, c = sameSO ? null : off.hashes;
      const cmp = (x, y, lbl) => {
        for (let i = 0; i < Math.min(x.length, y.length); i++) {
          if (x[i] !== y[i]) { console.log(`    first ${lbl} divergence at idx ${i}: ${x[i]} vs ${y[i]}`); break; }
        }
      };
      if (b) cmp(a, b, 'sticky/mercy');
      if (c) cmp(a, c, 'sticky/pristine');
    }
  }
  if (fails.length) { console.log(`\nAA STOP: ${fails.length} divergence(s) — the instrument is NOT trajectory-neutral pre-scenario.`); process.exit(1); }
  console.log('\nAA GATE: instrument is trajectory-neutral pre-scenario (byte-identical).');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  if (process.env.AA === '1') { await aaSanity(); return; }
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'fourthlink,leadfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const recs = [];
  for (const arm of ARMS) for (const pid of pids) for (const seed of seeds) {
    console.log(`-- monostick ${arm} ${pid} seed ${seed} (${days}d) --`);
    const r = await oneRun(seed, pid, arm, days);
    recs.push(r);
    const brk = r.breaks.map(b => 'd' + b.breakDay + '#' + b.n + ':' + (b.mercyApplied ? 'MERCY' : 'sticky') + ':' + (b.reLocked ? 'RELOCK' : (b.heldByRatchet ? 'HELD' : (b.heldByRaw ? 'RAW' : '?'))) + '/' + ((b.outcome || {}).outcome || '?')).join(',');
    console.log(`   days=${r.gameDays} end=${r.endReason} maxWaveEff=${r.maxWaveEff} peakSeen=${r.peakSeen} ` +
      `w4unlock=${r.unlock4 ? 'd' + r.unlock4.day : (r.noScenarioReason || '-')} breaks=[${brk || '-'}]`);
    if (perSeedDir) {
      try { fs.mkdirSync(perSeedDir, { recursive: true }); } catch (e) {}
      const slim = Object.assign({}, r);
      slim.samples = r.samples.filter(s => s.day % 5 === 0
        || r.breakDays.some(bd => Math.abs(bd - s.day) <= 2 || Math.abs(bd + 30 - s.day) <= 1)
        || (r.unlock4 && Math.abs(r.unlock4.day - s.day) <= 2));
      slim.hashes = undefined;
      slim.telemetry = {
        national: (r.maxRank === 'national' || r.maxRank === 'global') ? 1 : 0,
        table: r.tableDays.length > 0 ? 1 : 0,
        wins: r.won, exiled: r.exiled,
      };
      fs.writeFileSync(path.join(perSeedDir, `${arm}-${pid}-s${seed}.json`), JSON.stringify(slim, null, 1));
    }
  }

  // ---- paired aggregation ----
  const pairIndex = {};
  for (const r of recs) {
    const key = r.policy + '/' + r.seed;
    pairIndex[key] = pairIndex[key] || { policy: r.policy, seed: r.seed };
    pairIndex[key][r.arm] = r;
  }
  const pairs = [];
  for (const key of Object.keys(pairIndex)) {
    const P = pairIndex[key];
    if (!P.sticky || !P.mercy) continue;
    const hasBreak = P.sticky.breaks.length > 0 || P.mercy.breaks.length > 0;
    if (!hasBreak) continue;
    const attributed = pairAttributed(P);
    const linkMatch = P.sticky.breaks.length && P.mercy.breaks.length
      && P.sticky.breaks.every((b, i) => P.mercy.breaks[i] && b.linkId === P.mercy.breaks[i].linkId);
    // weakened (#288): the mercy arm's first break actually re-locked — the
    // village WOULD have triggered the mercy under the old engine.
    const weakened = !!(P.mercy.breaks[0] && P.mercy.breaks[0].reLocked);
    const sOut = (P.sticky.breaks[0] && P.sticky.breaks[0].outcome || {}).outcome;
    const mOut = (P.mercy.breaks[0] && P.mercy.breaks[0].outcome || {}).outcome;
    const ORANK = { held: 3, 'held-censored': 2.5, hollow: 2, died: 1 };
    let verdict = 'neutral';
    if (sOut === 'held-censored' || mOut === 'held-censored' || !sOut || !mOut) verdict = 'unknown';
    else if ((ORANK[sOut] | 0) > (ORANK[mOut] | 0)) verdict = 'helped';
    else if ((ORANK[sOut] | 0) < (ORANK[mOut] | 0)) verdict = 'hurt';
    pairs.push({
      key, policy: P.policy, seed: P.seed,
      attributed, linkMatch: !!linkMatch, weakened,
      stickyOutcome: sOut || null, mercyOutcome: mOut || null, verdict,
      nBreaksSticky: P.sticky.breaks.length, nBreaksMercy: P.mercy.breaks.length,
      stickyBreaks: P.sticky.breaks.map(b => ({
        n: b.n, breakDay: b.breakDay, linkId: b.linkId, other: b.other,
        stEffPre: b.stEffPre, stEffPost: b.stEffPost, stRawPre: b.stRawPre, stRawPost: b.stRawPost,
        waveEffPre: b.waveEffPre, waveEffPost: b.waveEffPost, peakPre: b.peakPre, peakPost: b.peakPost,
        reLocked: b.reLocked, heldByRatchet: b.heldByRatchet, heldByRaw: b.heldByRaw,
        outcome: (b.outcome || {}).outcome, postSeries: b.postSeries,
      })),
      mercyBreaks: P.mercy.breaks.map(b => ({
        n: b.n, breakDay: b.breakDay, linkId: b.linkId, other: b.other, mercyApplied: b.mercyApplied,
        mercyPeakPre: b.mercyPeakPre, mercyPeakPost: b.mercyPeakPost,
        stEffPre: b.stEffPre, stEffPost: b.stEffPost, stRawPre: b.stRawPre, stRawPost: b.stRawPost,
        waveEffPre: b.waveEffPre, waveEffPost: b.waveEffPost, peakPre: b.peakPre, peakPost: b.peakPost,
        reLocked: b.reLocked, heldByRatchet: b.heldByRatchet, heldByRaw: b.heldByRaw,
        outcome: (b.outcome || {}).outcome, postSeries: b.postSeries,
      })),
      cov: covAtBreak(P.sticky),
    });
  }
  const nPairs = pairs.length;
  const nAttr = pairs.filter(p => p.attributed).length;
  const attrRate = nPairs ? +(nAttr / nPairs).toFixed(3) : 0;
  const weakPairs = pairs.filter(p => p.weakened && p.attributed);
  const wVerdicts = weakPairs.reduce((t, p) => { t[p.verdict] = (t[p.verdict] || 0) + 1; return t; }, {});
  const helped = weakPairs.filter(p => p.verdict === 'helped').length;
  const hurt = weakPairs.filter(p => p.verdict === 'hurt').length;
  // Named verdict (pre-registered rule): net >= +2 -> helps; net <= -2 -> hurts; else neutral.
  const net = helped - hurt;
  const namedVerdict = net >= 2 ? 'helps' : net <= -2 ? 'hurts' : 'neutral';

  // Separation on the weakened helped vs hurt pairs (readinessbind rule).
  const sepRecords = weakPairs.filter(p => p.verdict === 'helped' || p.verdict === 'hurt').map(p => ({
    outcome: { outcome: p.verdict === 'helped' ? 'held' : 'died' },
    snapshot: p.cov,
  }));
  const separation = RB.separation(sepRecords);

  // Guardrails: median survival mercy vs sticky (identical-seed control);
  // death-cause families by arm (new mode = family at n>=3 on one arm only).
  const surv = a => recs.filter(r => r.arm === a).map(r => r.gameDays).sort((x, y) => x - y);
  const med = a => { const s = surv(a); return s.length ? s[(s.length / 2) | 0] : 0; };
  const noScenario = recs.filter(r => r.breaks.length === 0).map(r => ({
    policy: r.policy, seed: r.seed, arm: r.arm, reason: r.noScenarioReason,
    maxWaveEff: r.maxWaveEff, gameDays: r.gameDays, endReason: r.endReason,
  }));

  const agg = {
    label: 'monostick', arms: ARMS, seeds, policies: pids, days,
    doBreak: doBreakNow(), monoOff: isMonoOff(), mercyOff: mercyOff(),
    nRuns: recs.length,
    nPairs, nAttributed: nAttr, attributionRate: attrRate,
    goA: attrRate >= 0.80,
    nWeakenedPairs: weakPairs.length,
    weakenedVerdicts: wVerdicts,
    namedVerdict, helpedWeakened: helped, hurtWeakened: hurt, netHelped: net,
    separation,
    medianSurvival: { sticky: med('sticky'), mercy: med('mercy') },
    guardrailSurvival: med('mercy') >= med('sticky') - 10,
    noScenario,
    runTelemetry: recs.map(r => ({
      policy: r.policy, seed: r.seed, arm: r.arm, gameDays: r.gameDays,
      endReason: r.endReason, maxWaveEff: r.maxWaveEff, peakSeen: r.peakSeen,
      maxRank: r.maxRank,
      national: (r.maxRank === 'national' || r.maxRank === 'global') ? 1 : 0,
      table: r.tableDays.length > 0 ? 1 : 0, wins: r.won, exiled: r.exiled,
    })),
  };
  console.log('\n===== MONOSTICK AGGREGATE =====');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) {
    const runs = recs.map(r => { const c = Object.assign({}, r); delete c.samples; delete c.hashes; return c; });
    fs.writeFileSync(outFile, JSON.stringify({ aggregate: agg, pairs, runs }, null, 1));
  }
}

// covAtBreak(rec): break-day covariates for the paired separation analysis.
// The unlock snapshot (same village, same era) plus break-day fields.
function covAtBreak(rec) {
  let snap = {};
  try { snap = Object.assign({}, (rec.unlock4 && rec.unlock4.snapshot) || {}); } catch (e) {}
  const b = (rec.breaks && rec.breaks[0]) || {};
  snap.standingEffPre = b.stEffPre; snap.standingEffPost = b.stEffPost;
  snap.standingRawPre = b.stRawPre; snap.standingRawPost = b.stRawPost;
  snap.breakDay = b.breakDay; snap.peakPre = b.peakPre;
  for (const k of ['ledgerPointsPrev', 'scholarArmorP', 'rosterAlive', 'pantryFreshDays', 'trustMean']) {
    if (typeof snap[k] !== 'number') snap[k] = NaN;
  }
  if (!snap.tricksPrev || typeof snap.tricksPrev.share !== 'number') snap.tricksPrev = { share: 0 };
  return snap;
}

if (require.main === module) {
  main().catch(e => { console.error('MONOSTICK CRASH:', e); process.exit(2); });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { oneRun, qualifyingLinks, breakLinkScenario, applyMercy, pairAttributed, aaSanity };
}
