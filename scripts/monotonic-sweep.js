#!/usr/bin/env node
// scripts/monotonic-sweep.js — the link-break / monotonic-unlock diagnostic
// instrument (sim-monotonic, 2026-10-15).
//
// INSTRUMENT-ONLY: wraps policy.daily with a READ-ONLY sampler plus a
// DELIBERATE link-break scenario. Zero src/js changes, zero policy behavior
// changes. The scenario uses the ENGINE'S OWN link-break path
// (Game.breakLink(id, 'gambit') — the exact call the UI's data-link-break
// button makes); nothing about the break mechanism is invented.
//
// Arms (paired, identical seeds):
//   break  (a): pristine engine. Standing collapses on the break; waves
//               re-lock by engine law (the diagnostic's "mercy by accident").
//   sticky (b): pristine engine + instrument-side monotonic overlay,
//               re-derived from the killed v2 gate's spec
//               (evidence/2026-10-15/sim-readinessgate2.md):
//               "once the gated total releases wave w, the effective total
//               never drops below that wave's threshold again."
//               Implemented as a wrap on Game.unlockedWave: peak = max(peak,
//               raw); effective = max(raw, peak). villageStandingTotal is the
//               ONLY reader's input (unlockedWave in game.js), so this is
//               behaviorally identical to the v2 ratchet. Pure reads, no RNG,
//               trajectory-neutral until a re-lock would fire.
//
// Scenario: at the first observed RAW wave-4 Standing unlock, +3d the
// harness breaks the oldest diplomacy-contributing link (seasoned AND
// regional+ per standing.js — the links that actually carry the +34).
// +10d it breaks a second if links remain and wave-4 is still held raw.
//
// Attribution per link-break scenario (fully attributed):
//   pre/post RAW Standing around each break, re-lock-or-hold determined
//   (waveRaw vs waveEff), 30d post-first-break outcome determined
//   uncensored (held/died/hollow — the readinessbind operationalization,
//   window anchored at the first break day).
//
// Env:
//   ARMS="break,sticky"  POLICIES="leadcourt,belongseek"
//   SEEDS="11,22,33,44,55,66,77,88"  DAYS=180
//   BREAK=1/0    — scenario enabled (0 for A/A + honesty checks)
//   MONO_OFF=1   — fully pristine: no wraps at all, hash-only (A/A OFF side)
//   SMOKE=1      — instrument-honesty gate (15d/policy/arm, no unlocks/breaks)
//   AA=1         — A/A sanity: 2 seeds x 2 policies, instrument (sticky,
//                  BREAK=0) vs MONO_OFF pristine, byte-identical hashes
//   OUT=... PERSEED_DIR=...
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const RB = require('./readinessbind-lib');

const ARMS = (process.env.ARMS || 'break,sticky').split(',').map(s => s.trim()).filter(a => a === 'break' || a === 'sticky');
// Call-time accessors (not module-load consts): aaSanity toggles these
// between runs inside one process.
let forceBreak = null; // when non-null, overrides process.env.BREAK
const doBreakNow = () => forceBreak !== null ? forceBreak === '1' : process.env.BREAK !== '0';
const isMonoOff = () => process.env.MONO_OFF === '1';
if (!ARMS.length) { console.error('MONOTONIC FATAL: no valid arms in ARMS.'); process.exit(2); }

const POLICY_REGISTRY = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
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

// breakLinkScenario: the deliberate link-break step, via the ENGINE'S OWN
// link-break path (Game.breakLink(id, 'gambit') — the UI button's call).
// readers: {standingRaw, waveRaw, waveEff} functions on Game. Returns the
// break event record (or null when the break failed). Exported so the proof
// drives the same code the sweep's daily wrap uses.
function breakLinkScenario(Game, link, readers, ring) {
  if (!link || !Game || typeof Game.breakLink !== 'function') return null;
  const pre = { st: readers.standingRaw(Game), waveRaw: readers.waveRaw(Game), waveEff: readers.waveEff(Game) };
  let broke = null;
  try { broke = Game.breakLink(link.id, 'gambit'); } catch (e) { broke = 'ERR:' + (e && e.message); }
  const post = { st: readers.standingRaw(Game), waveRaw: readers.waveRaw(Game), waveEff: readers.waveEff(Game) };
  const brokeOk = broke !== null && broke !== undefined && !String(broke).startsWith('ERR');
  const ev = {
    breakDay: gday(Game), linkId: link.id, linkKind: link.kind || '?',
    other: otherName(Game, link), how: 'gambit',
    brokeOk,
    standingPre: pre.st, standingPost: post.st,
    waveRawPre: pre.waveRaw, waveRawPost: post.waveRaw, waveEffPost: post.waveEff,
    reLocked: post.waveRaw < pre.waveRaw,
    heldByRatchet: post.waveEff > post.waveRaw,
    beatTail: Array.isArray(ring) ? ring.slice(-8) : [],
  };
  return brokeOk ? ev : null;
}

async function oneRun(seed, pid, arm, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'monotonic-' + arm + '-' + pid, fullTelemetry: false });
  await setupGame(Game);

  // The raw reader: saved BEFORE any wrap. In the sticky arm this stays the
  // pristine engine law; the wrap lives on Game.unlockedWave.
  const rawUW = Game.unlockedWave ? Game.unlockedWave.bind(Game) : (() => 1);
  let peakWave = 0;
  if (arm === 'sticky' && !isMonoOff()) {
    const self = Game;
    Game.unlockedWave = function () {
      let e = 1;
      try { e = rawUW.call(self); } catch (err) {}
      if (e > peakWave) peakWave = e;
      return Math.max(e, peakWave);
    };
  }
  const waveRaw = (G) => { try { return rawUW.call(G); } catch (e) { return 1; } };
  const waveEff = (G) => { try { return G.unlockedWave ? G.unlockedWave() : 1; } catch (e) { return 1; } };
  const standingRaw = (G) => { try { return (G.villageStandingTotal ? G.villageStandingTotal() : 0) | 0; } catch (e) { return 0; } };

  // Beat ring (same pattern as readinessbind): wrap the silenced say/sysSay,
  // call through, record. Skipped in MONO_OFF.
  const ring = [];
  const RING_CAP = 200;
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
    monoOff: isMonoOff(), doBreak: doBreakNow(),
    samples: [],
    unlock4: null,          // {day, waveEff, snapshot}
    breaks: [],             // scenario break events
    breakDays: [],
    tableDays: [],
    hashes: [],
    endReason: null, gameDays: 0, over: false,
    won: 0, exiled: 0,
    maxRank: 'village',
    maxWaveRaw: 1, maxWaveEff: 1, peakWaveSeen: 0,
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
        const wr = waveRaw(G), we = waveEff(G);
        const st = standingRaw(G);
        const seat = RB.tableSeatName(G);
        if (seat !== 'none') rec.tableDays.push(day);
        const living = RB.livingNPCs(G);
        let rank = 'village';
        try { rank = RB.scaleRank(G); } catch (e) {}
        if ((RANK_IX[rank] | 0) > (RANK_IX[rec.maxRank] | 0)) rec.maxRank = rank;
        if (wr > rec.maxWaveRaw) rec.maxWaveRaw = wr;
        if (we > rec.maxWaveEff) rec.maxWaveEff = we;
        if (peakWave > rec.peakWaveSeen) rec.peakWaveSeen = peakWave;
        rec.samples.push({ day, waveRaw: wr, waveEff: we, stRaw: st, living, seat, rank });
        rec.hashes.push(day + ':' + RB.trajectoryHash(G));

        if (doBreakNow()) {
          // Unlock detection on RAW law (both arms comparable pre-break).
          if (!rec.unlock4 && wr >= 4) {
            let snap = null;
            try { snap = RB.readinessSnapshot(G, 4); } catch (e) { snap = { error: String(e && e.message) }; }
            rec.unlock4 = { day, waveRawAtUnlock: wr, waveEffAtUnlock: we, snapshot: snap, breakDay1: day + 3, breakDay2: day + 10 };
            pushRing('mono', 'scenario armed: wave-4 Standing unlock d' + day + ' (raw ' + wr + ', eff ' + we + ', standing ' + st + '); breaks d' + (day + 3) + '/d' + (day + 10));
          }
          if (rec.unlock4 && rec.breaks.length < 2) {
            const u = rec.unlock4;
            const wantBreak = (rec.breaks.length === 0 && day === u.breakDay1)
              || (rec.breaks.length === 1 && day === u.breakDay2 && wr >= 4);
            if (wantBreak) {
              const cands = qualifyingLinks(G);
              if (cands.length) {
                const link = cands[0];
                const ev = breakLinkScenario(G, link, { standingRaw, waveRaw, waveEff }, ring);
                if (ev) {
                  ev.n = rec.breaks.length + 1;
                  rec.breaks.push(ev);
                  rec.breakDays.push(day);
                  pushRing('mono', 'BREAK #' + ev.n + ' d' + day + ' link ' + link.id + ' (' + ev.other + '): standing ' + ev.standingPre + '->' + ev.standingPost + ', waveRaw ' + ev.waveRawPre + '->' + ev.waveRawPost + ', waveEff ' + ev.waveEffPost + (ev.reLocked ? ' RE-LOCK' : '') + (ev.heldByRatchet ? ' HELD-BY-RATCHET' : ''));
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

  // noScenarioReason when the run never unlocked wave 4 at all.
  if (doBreakNow() && !rec.unlock4 && !rec.noScenarioReason) rec.noScenarioReason = 'no-w4-unlock';

  // Per-break post windows: pre/post standing series + 30d outcome.
  for (const b of rec.breaks) {
    const series = {};
    for (const dOff of [1, 3, 7, 14, 30]) {
      const s = rec.samples.find(x => x.day === b.breakDay + dOff);
      series['d+' + dOff] = s ? { stRaw: s.stRaw, waveRaw: s.waveRaw, waveEff: s.waveEff, living: s.living } : null;
    }
    b.postSeries = series;
    const plus30 = rec.samples.find(x => x.day === b.breakDay + 30);
    b.outcome = RB.classifyOutcome(
      { unlockDay: b.breakDay, wave: b.waveRawPre },
      { finalDay: rec.gameDays, endReason: rec.endReason, over: rec.over,
        livingAtPlus30: plus30 ? plus30.living : -1, tableDays: rec.tableDays }
    );
  }
  // Sense slices: the ring around each break, and around any re-lock/re-open
  // day (waveEff drop/rise) — what the village experiences.
  const sense = [];
  for (const b of rec.breaks) {
    sense.push({ kind: 'break', day: b.breakDay, ring: ring.filter(r => {
      const m = r.match(/^d(\d+) /); return m && Math.abs(+m[1] - b.breakDay) <= 3;
    }).slice(0, 24) });
  }
  // re-lock day (break arm): first day waveRaw < wave at unlock; re-open day:
  // first day after a re-lock where waveRaw rises again.
  let wasW = rec.unlock4 ? rec.unlock4.waveRawAtUnlock : 4;
  for (const s of rec.samples) {
    if (s.day <= (rec.unlock4 ? rec.unlock4.day : 0)) continue;
    if (s.waveRaw < wasW) {
      sense.push({ kind: 'relock', day: s.day, ring: ring.filter(r => {
        const m = r.match(/^d(\d+) /); return m && Math.abs(+m[1] - s.day) <= 2;
      }).slice(0, 16) });
      wasW = s.waveRaw;
    } else if (s.waveRaw > wasW) {
      sense.push({ kind: 'reopen', day: s.day, ring: ring.filter(r => {
        const m = r.match(/^d(\d+) /); return m && Math.abs(+m[1] - s.day) <= 2;
      }).slice(0, 16) });
      wasW = s.waveRaw;
    }
  }
  rec.sense = sense;
  return rec;
}

// scenarioAttributed(b): fully-attributed check for one break event.
function scenarioAttributed(b) {
  if (!b) return false;
  if (typeof b.standingPre !== 'number' || typeof b.standingPost !== 'number') return false;
  if (typeof b.waveRawPre !== 'number' || typeof b.waveRawPost !== 'number') return false;
  if (typeof b.waveEffPost !== 'number') return false;
  if (typeof b.reLocked !== 'boolean' || typeof b.heldByRatchet !== 'boolean') return false;
  const oc = (b.outcome || {}).outcome;
  return oc === 'held' || oc === 'died' || oc === 'hollow';
}

// SMOKE=1: instrument-honesty gate — policies unwrap, sampler collects, no
// unlocks and no breaks expected on a 15d smoke (a break/unlock here would
// prove hallucination).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`, base && typeof base.daily === 'function');
    check(`[${pid}] policy id`, (base && base.id) === pid, 'id=' + (base && base.id));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) for (const arm of ['break', 'sticky']) {
    const rec = await oneRun(11, pid, arm, 15);
    check(`[${pid}/${arm}] sampler collected daily samples`, rec.samples.length > 0, `n=${rec.samples.length}`);
    check(`[${pid}/${arm}] hashes collected`, rec.hashes.length === rec.samples.length, `n=${rec.hashes.length}`);
    const snapOk = rec.samples.every(s => typeof s.stRaw === 'number' && typeof s.waveRaw === 'number' && typeof s.waveEff === 'number');
    check(`[${pid}/${arm}] samples carry wave+standing reads`, snapOk);
    check(`[${pid}/${arm}] no wave-4 unlock on 15d smoke`, !rec.unlock4, `unlock4=${rec.unlock4 ? 'd' + rec.unlock4.day : 'none'}`);
    check(`[${pid}/${arm}] no breaks on 15d smoke`, rec.breaks.length === 0, `breaks=${rec.breaks.length}`);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: instrument samples cleanly, no hallucinated unlocks or breaks.');
}

// AA=1: A/A sanity — instrument (sticky arm, BREAK=0) vs pristine
// (MONO_OFF=1, BREAK=0) byte-identical trajectory hashes BEFORE the scenario
// would trigger. The overlay and the sampler must be trajectory-neutral.
async function aaSanity() {
  const fails = [];
  const seeds = (process.env.AA_SEEDS || '11,22').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.AA_DAYS || '60', 10);
  for (const pid of Object.keys(POLICY_REGISTRY)) for (const seed of seeds) {
    forceBreak = '0';
    process.env.MONO_OFF = '1';
    const off = await oneRun(seed, pid, 'break', days);
    delete process.env.MONO_OFF;
    const on = await oneRun(seed, pid, 'sticky', days);
    forceBreak = null;
    const hoff = off.hashes.join('\n'), hon = on.hashes.join('\n');
    const same = hoff === hon;
    console.log(`  ${same ? 'PASS' : 'FAIL'} A/A [${pid}/s${seed}] ${days}d instrument vs pristine ${same ? 'byte-identical' : 'DIVERGED'} (n=${off.hashes.length})`);
    if (!same) {
      fails.push(pid + '/s' + seed);
      const a = off.hashes, b = on.hashes;
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) { console.log(`    first divergence at idx ${i}: OFF=${a[i]} ON=${b[i]}`); break; }
      }
    }
  }
  if (fails.length) { console.log(`\nAA STOP: ${fails.length} divergence(s) — the instrument is NOT trajectory-neutral.`); process.exit(1); }
  console.log('\nAA GATE: instrument is trajectory-neutral pre-scenario (byte-identical).');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  if (process.env.AA === '1') { await aaSanity(); return; }
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const recs = [];
  for (const arm of ARMS) for (const pid of pids) for (const seed of seeds) {
    console.log(`-- monotonic ${arm} ${pid} seed ${seed} (${days}d) --`);
    const r = await oneRun(seed, pid, arm, days);
    recs.push(r);
    const brk = r.breaks.map(b => 'd' + b.breakDay + '#' + b.n + ':' + (b.reLocked ? 'RELOCK' : (b.heldByRatchet ? 'HELD' : 'ok')) + '/' + ((b.outcome || {}).outcome || '?')).join(',');
    console.log(`   days=${r.gameDays} end=${r.endReason} maxWaveRaw=${r.maxWaveRaw} maxWaveEff=${r.maxWaveEff} ` +
      `w4unlock=${r.unlock4 ? 'd' + r.unlock4.day : (r.noScenarioReason || '-')} breaks=[${brk || '-'}]`);
    if (perSeedDir) {
      try { fs.mkdirSync(perSeedDir, { recursive: true }); } catch (e) {}
      const slim = Object.assign({}, r);
      slim.samples = r.samples.filter(s => s.day % 5 === 0
        || r.breakDays.some(bd => Math.abs(bd - s.day) <= 2 || Math.abs(bd + 30 - s.day) <= 1)
        || (r.unlock4 && Math.abs(r.unlock4.day - s.day) <= 2));
      slim.hashes = undefined;
      // run telemetry for the coordinator's telemetry-check (national/table/wins/exiled)
      slim.telemetry = {
        national: (r.maxRank === 'national' || r.maxRank === 'global') ? 1 : 0,
        table: r.tableDays.length > 0 ? 1 : 0,
        wins: r.won, exiled: r.exiled,
      };
      fs.writeFileSync(path.join(perSeedDir, `${arm}-${pid}-s${seed}.json`), JSON.stringify(slim, null, 1));
    }
  }

  // ---- aggregation ----
  const scenarios = [];   // one record per break event
  const pairIndex = {};   // "pid/seed" -> {break: rec, sticky: rec}
  for (const r of recs) {
    const key = r.policy + '/' + r.seed;
    pairIndex[key] = pairIndex[key] || {};
    pairIndex[key][r.arm] = r;
    for (const b of r.breaks) {
      scenarios.push({
        policy: r.policy, seed: r.seed, arm: r.arm,
        unlockDay: r.unlock4 ? r.unlock4.day : null,
        breakN: b.n, breakDay: b.breakDay, linkId: b.linkId, linkKind: b.linkKind, other: b.other,
        standingPre: b.standingPre, standingPost: b.standingPost,
        standingDrop: b.standingPre - b.standingPost,
        waveRawPre: b.waveRawPre, waveRawPost: b.waveRawPost, waveEffPost: b.waveEffPost,
        reLocked: b.reLocked, heldByRatchet: b.heldByRatchet,
        outcome: (b.outcome || {}).outcome, daysObserved: (b.outcome || {}).daysObserved,
        tableBy30: (b.outcome || {}).tableBy30,
        attributed: scenarioAttributed(b),
        snapshotAtUnlock: (r.unlock4 && r.unlock4.snapshot) || null,
      });
    }
  }
  const nScen = scenarios.length;
  const nAttr = scenarios.filter(s => s.attributed).length;
  const attrRate = nScen ? +(nAttr / nScen).toFixed(3) : 0;

  // ---- paired helped/hurt ----
  const ORANK = { held: 3, 'held-censored': 2.5, hollow: 2, died: 1 };
  const pairs = [];
  for (const key of Object.keys(pairIndex)) {
    const P = pairIndex[key];
    if (!P.break || !P.sticky) continue;
    const bScen = P.break.breaks, sScen = P.sticky.breaks;
    if (!bScen.length || !sScen.length) continue;
    const bOut = (bScen[0].outcome || {}).outcome, sOut = (sScen[0].outcome || {}).outcome;
    const br = ORANK[bOut], sr = ORANK[sOut];
    let verdict = 'neutral';
    if (bOut === 'held-censored' || sOut === 'held-censored') verdict = 'unknown';
    else if (sr > br) verdict = 'helped';
    else if (sr < br) verdict = 'hurt';
    pairs.push({
      key, policy: P.break.policy, seed: P.break.seed,
      breakOutcome: bOut, stickyOutcome: sOut, verdict,
      reLockedBreak: bScen[0].reLocked, heldSticky: sScen[0].heldByRatchet,
      standingPre: bScen[0].standingPre, standingPost: bScen[0].standingPost,
      breakSnap: P.break.breaks[0].postSeries ? null : null,
      cov: covAtBreak(P.break),
    });
  }
  const helped = pairs.filter(p => p.verdict === 'helped');
  const hurt = pairs.filter(p => p.verdict === 'hurt');

  // Separation on the paired verdicts, reusing the readinessbind three-rung
  // rule: holders = helped pairs, corpses = hurt pairs.
  const sepRecords = pairs.filter(p => p.verdict === 'helped' || p.verdict === 'hurt').map(p => ({
    outcome: { outcome: p.verdict === 'helped' ? 'held' : 'died' },
    snapshot: p.cov,
  }));
  const separation = RB.separation(sepRecords);

  // ---- secondaries ----
  const relocked = scenarios.filter(s => s.arm === 'break' && s.reLocked);
  const heldScen = scenarios.filter(s => s.arm === 'sticky' && s.heldByRatchet);
  const outDist = (arr) => arr.reduce((t, s) => { const o = s.outcome || '?'; t[o] = (t[o] || 0) + 1; return t; }, {});

  const noScenario = recs.filter(r => r.breaks.length === 0).map(r => ({
    policy: r.policy, seed: r.seed, arm: r.arm, reason: r.noScenarioReason,
    maxWaveRaw: r.maxWaveRaw, gameDays: r.gameDays, endReason: r.endReason,
  }));

  const agg = {
    label: 'monotonic', arms: ARMS, seeds, policies: pids, days,
    doBreak: doBreakNow(), monoOff: isMonoOff(),
    nRuns: recs.length,
    nScenarios: nScen, nAttributed: nAttr, attributionRate: attrRate,
    goA: attrRate >= 0.80,
    scenariosByArm: ARMS.reduce((t, a) => { t[a] = scenarios.filter(s => s.arm === a).length; return t; }, {}),
    reLockedBreak: relocked.length,
    heldByRatchetSticky: heldScen.length,
    pairVerdicts: pairs.reduce((t, p) => { t[p.verdict] = (t[p.verdict] || 0) + 1; return t; }, {}),
    separation,
    secondaryRelockMercy: {
      breakArmRelockedOutcomes: outDist(relocked),
      stickyArmHeldOutcomes: outDist(heldScen),
    },
    noScenario,
    runTelemetry: recs.map(r => ({
      policy: r.policy, seed: r.seed, arm: r.arm, gameDays: r.gameDays,
      endReason: r.endReason, maxWaveRaw: r.maxWaveRaw, maxWaveEff: r.maxWaveEff,
      peakWaveSeen: r.peakWaveSeen, maxRank: r.maxRank,
      national: (r.maxRank === 'national' || r.maxRank === 'global') ? 1 : 0,
      table: r.tableDays.length > 0 ? 1 : 0, wins: r.won, exiled: r.exiled,
    })),
  };
  console.log('\n===== MONOTONIC AGGREGATE =====');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) {
    const runs = recs.map(r => { const c = Object.assign({}, r); delete c.samples; delete c.hashes; return c; });
    fs.writeFileSync(outFile, JSON.stringify({ aggregate: agg, scenarios, pairs, runs }, null, 1));
  }
}

// covAtBreak(rec): break-day covariates for the paired separation analysis.
// Reuses the readinessbind snapshot shape (break-day wave-4 snapshot),
// extended with the pre-break Standing.
function covAtBreak(rec) {
  let snap = null;
  try {
    // Rebuild a snapshot-like covariate vector at the first break day from
    // the unlock snapshot (same village, same era) — plus break-day fields.
    const u = (rec.unlock4 && rec.unlock4.snapshot) || {};
    snap = Object.assign({}, u);
  } catch (e) { snap = {}; }
  const b = (rec.breaks && rec.breaks[0]) || {};
  snap.standingPre = b.standingPre; snap.standingPost = b.standingPost;
  snap.breakDay = b.breakDay;
  // Ensure the SEP_COVARIATES fields exist (numbers).
  for (const k of ['ledgerPointsPrev', 'scholarArmorP', 'rosterAlive', 'pantryFreshDays', 'trustMean']) {
    if (typeof snap[k] !== 'number') snap[k] = NaN;
  }
  if (!snap.tricksPrev || typeof snap.tricksPrev.share !== 'number') snap.tricksPrev = { share: 0 };
  return snap;
}

if (require.main === module) {
  main().catch(e => { console.error('MONOTONIC CRASH:', e); process.exit(2); });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { oneRun, qualifyingLinks, scenarioAttributed, aaSanity, breakLinkScenario };
}
