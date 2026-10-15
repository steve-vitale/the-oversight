#!/usr/bin/env node
// scripts/unlockbeat-sweep.js — armed/control sweep for the Standing-path
// unlock announcement fix (sim-unlockbeat, 2026-10-15).
//
// Substrate: leadfeast × belongfeast (the Standing-path unlock substrate —
// diplomacy/plenty roads), 8 seeds, 180d death-aware. Both sides run in ONE
// sweep on identical seeds: armed (the fix live) vs control
// (Game._standingBeatOff=true — replays the pre-fix tree; CONTROL BASELINE
// DRIFT #247: never inherit baselines).
//
// Instrument: daily samples of unlockedWave()/standing/living/rank/seat +
// a day-stamped say/sysSay ring. Unlock-day = first observed day at wave >=
// w (coincident 3->5 jumps backfill w4). Beat-day = first ring entry on/after
// unlock-day matching the unlock beat ("New casting directives incoming").
// lag = beatDay - unlockDay.
//
// Env:
//   FEASTSCALE_R13=1                 (required — the substrate)
//   SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadfeast,belongfeast"
//   SIDES="armed,control"            DAYS=180
//   OUT=<json>                      PERSEED_DIR=<dir>
//   SMOKE=1 — 3 days/policy/side, unwrap + sampler honesty, no unlocks expected
//   DETGATE=1 — seeds 11,22 armed run twice; byte-identical per-seed JSON check
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('UNLOCKBEAT FATAL: FEASTSCALE_R13=1 required (the Standing-path unlock substrate).');
  process.exit(2);
}
const FS = require('./policies/feastscale');
const POLICY_REGISTRY = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => +s.trim()).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
const SIDES = (process.env.SIDES || 'armed,control').split(',').map(s => s.trim()).filter(Boolean);
const SMOKE = process.env.SMOKE === '1';
const DETGATE = process.env.DETGATE === '1';
const DAYS = SMOKE ? 3 : (+process.env.DAYS || 180);
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
if (DETGATE) { SEEDS.splice(0, SEEDS.length, 11, 22); POLICIES.splice(0, POLICIES.length, 'leadfeast', 'belongfeast'); SIDES.splice(0, SIDES.length, 'armed'); }

const BEAT_RE = /New casting directives incoming/;

function gday(G) { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function livingNPCs(G) {
  try {
    const v = G.state.village || {}, sid = G.villagerId;
    return (v.roster || []).filter(id => id !== sid && !((G.getPerson(id) || {}).dead)).length;
  } catch (e) { return -1; }
}
function seatName(G) {
  try {
    if (typeof G.tableSeatName === 'function') return G.tableSeatName() || 'none';
    const t = (G.state || {}).table || {};
    return t.seat || 'none';
  } catch (e) { return 'none'; }
}

async function oneRun(seed, pid, side, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'unlockbeat-' + pid + '-' + side });
  await setupGame(Game);
  if (side === 'control') Game._standingBeatOff = true; // pre-fix replay

  // Day-stamped beat ring (say/sysSay capture; calls through to the
  // harness-silenced no-ops — no RNG, no state). Unlock beats are captured
  // AT FIRE TIME (beatHits + beatCtx): a capped ring would evict a day-55
  // beat by day 180.
  const ring = [];
  const RING_CAP = 40;
  const beatHits = [];   // {day, tag, msg, wave} — every unlock-beat firing
  const beatCtx = [];    // {day, msg, before:[...]} — context at fire time
  const BEAT_WAVE_RE = /Wave (\d) (?:talent|protocols)/;
  try {
    const oSay = Game.say, oSys = Game.sysSay;
    const push = (tag, m) => {
      try {
        const e = { day: gday(Game), tag, msg: String(m).slice(0, 300) };
        ring.push(e);
        if (ring.length > RING_CAP) ring.splice(0, ring.length - RING_CAP);
        if (BEAT_RE.test(e.msg)) {
          const wm = BEAT_WAVE_RE.exec(e.msg);
          beatHits.push({ day: e.day, tag, msg: e.msg, wave: wm ? +wm[1] : null });
          beatCtx.push({ day: e.day, msg: e.msg,
            before: ring.slice(0, -1).map(r => `d${r.day} ${r.tag}: ${r.msg.slice(0, 140)}`) });
        }
      } catch (e2) {}
    };
    Game.say = function (m) { push('say', m); return oSay.apply(this, arguments); };
    Game.sysSay = function (m) { push('sys', m); return oSys.apply(this, arguments); };
  } catch (e) {}

  const rec = { policy: pid, seed, side, days, samples: [], unlocks: [], ringCtx: [] };
  const seenWave = { 4: false, 5: false };
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = gday(G);
      let wave = 1; try { wave = G.unlockedWave ? G.unlockedWave() : 1; } catch (e) {}
      let stTotal = 0; try { stTotal = G.villageStandingTotal ? G.villageStandingTotal() : 0; } catch (e) {}
      let rank = 'village'; try { rank = G.scaleRank ? (G.scaleRank() || 'village') : 'village'; } catch (e) {}
      rec.samples.push({ day, wave, standingTotal: stTotal, living: livingNPCs(G), rank, seat: seatName(G) });
      for (const w of [4, 5]) {
        if (!seenWave[w] && wave >= w) {
          const backfill = (w === 5 && !seenWave[4]);
          for (const bw of (backfill ? [4, 5] : [w])) {
            seenWave[bw] = true;
            rec.unlocks.push({ wave: bw, unlockDay: day, coincident: backfill && bw === 4, beats: null });
          }
        }
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 1 }); });
  rec.endReason = result.endReason;
  rec.gameDays = result.gameDays;
  try { rec.over = !!Game.over; } catch (e) {}
  try { rec.maxWaveUnlocked = result.maxWaveUnlocked || 1; } catch (e) {}
  try { rec.deaths = (result.samples && result.samples.deaths) || []; } catch (e) { rec.deaths = []; }
  rec.nationalEver = rec.samples.some(s => s.rank === 'national');
  rec.tableEver = rec.samples.some(s => s.seat && s.seat !== 'none');

  // Beat-day + lag per unlock (armed: the fix; control: the kill-gated baseline).
  // Matched at fire time (beatHits) — never from the evicted ring. The beat
  // text names its wave, so matching is per-wave. SLEEP ARTIFACT: the daily
  // sample is taken at policy.daily (pre-sleep), but unlocks that cross
  // during sleep()/endDay fire their beat with the pre-increment day-stamp —
  // the first sample at the new wave is then a day late (beatDay =
  // unlockDay-1). The beat cannot precede the unlock (the choke point reads
  // live unlockedWave(); proven no-early in the proof), so beatDay =
  // unlockDay-1 means the unlock truly happened on beatDay: lag 0.
  rec.beatHits = beatHits.map(h => ({ day: h.day, wave: h.wave }));
  for (const u of rec.unlocks) {
    if (u.coincident) { u.lag = null; u.note = 'coincident (beat fires once for w5)'; continue; }
    const hit = beatHits.find(h => h.wave === u.wave && h.day >= u.unlockDay - 1);
    if (hit) {
      u.beatDay = hit.day;
      if (hit.day < u.unlockDay) { u.lag = 0; u.note = 'sleep-artifact: beat fired during the unlock night\'s sleep, first sample a day late'; }
      else u.lag = hit.day - u.unlockDay;
      const ctx = beatCtx.find(c => c.day === hit.day && c.msg === hit.msg);
      u.beats = [`d${hit.day} ${hit.tag}: ${hit.msg.slice(0, 160)}`];
      rec.ringCtx.push({ wave: u.wave, unlockDay: u.unlockDay, beatDay: hit.day, lag: u.lag, note: u.note || '',
        beat: hit.msg.slice(0, 220), before: (ctx && ctx.before || []).slice(-8) });
    } else { u.beatDay = null; u.lag = null; u.note = 'no beat observed'; }
  }
  // 30d post-unlock split (secondary, non-binding): held / died / hollow.
  for (const u of rec.unlocks) {
    const s30 = rec.samples.find(s => s.day === u.unlockDay + 30);
    if (s30) u.outcome30 = s30.living > 0 ? 'held' : 'hollow';
    else u.outcome30 = (rec.endReason === 'survived') ? 'held-censored'
      : (/village-lost|pop-zero/.test(rec.endReason || '') ? 'died' : 'ended-' + (rec.endReason || '?'));
  }
  return rec;
}

function summarize(runs) {
  const agg = {};
  for (const side of SIDES) {
    const rs = runs.filter(r => r.side === side);
    const gd = rs.map(r => r.gameDays).sort((a, b) => a - b);
    const med = gd.length ? gd[Math.floor(gd.length / 2)] : 0;
    const nat = rs.filter(r => r.nationalEver).length;
    const tab = rs.filter(r => r.tableEver).length;
    const deaths = {};
    for (const r of rs) for (const d of (r.deaths || [])) {
      const fam = String((d && d.cause) || 'unknown').split(':')[0].slice(0, 40);
      deaths[fam] = (deaths[fam] || 0) + 1;
    }
    const unlocks = [];
    for (const r of rs) for (const u of r.unlocks) unlocks.push(Object.assign({ policy: r.policy, seed: r.seed, side }, u));
    const nonCo = unlocks.filter(u => !u.coincident);
    const lagged = nonCo.filter(u => u.lag != null);
    const within1 = lagged.filter(u => u.lag <= 1 && u.lag >= 0);
    const early = lagged.filter(u => u.lag < 0);
    agg[side] = {
      n: rs.length, medianDays: med, maxDays: gd.length ? gd[gd.length - 1] : 0,
      national: nat, table: tab, w4: unlocks.filter(u => u.wave === 4).length, w5: unlocks.filter(u => u.wave === 5).length,
      unlockEvents: nonCo.length, beatObserved: lagged.length,
      lagWithin1: within1.length, lagEarly: early.length,
      lagDist: lagged.map(u => u.lag).sort((a, b) => a - b),
      primaryShare: nonCo.length ? within1.length / nonCo.length : null,
      deaths, endReasons: rs.reduce((m, r) => { m[r.endReason] = (m[r.endReason] || 0) + 1; return m; }, {}),
    };
  }
  return agg;
}

async function main() {
  const runs = [];
  for (const side of SIDES) for (const pid of POLICIES) for (const seed of SEEDS) {
    console.log(`unlockbeat: ${side}/${pid}/s${seed} ...`);
    const rec = await oneRun(seed, pid, side, DAYS);
    runs.push(rec);
    if (PERSEED_DIR) {
      try {
        fs.mkdirSync(PERSEED_DIR, { recursive: true });
        fs.writeFileSync(path.join(PERSEED_DIR, `unlockbeat-${side}-${pid}-s${seed}.json`),
          JSON.stringify(rec, null, 1));
      } catch (e) {}
    }
    if (DETGATE) { // second identical pass for the byte-identical check
      const rec2 = await oneRun(seed, pid, side, DAYS);
      const a = JSON.stringify(rec), b = JSON.stringify(rec2);
      console.log(`  detgate ${side}/${pid}/s${seed}: ${a === b ? 'IDENTICAL' : 'DIVERGED(' + a.length + ' vs ' + b.length + ')'}`);
      if (a !== b) { console.error('DETGATE FAIL'); process.exit(3); }
    }
  }
  const agg = summarize(runs);
  const out = { seeds: SEEDS, policies: POLICIES, sides: SIDES, days: DAYS, agg,
    unlocks: runs.flatMap(r => r.unlocks.map(u => Object.assign({ policy: r.policy, seed: r.seed, side: r.side }, u))),
    ringCtx: runs.flatMap(r => (r.ringCtx || []).map(c => Object.assign({ policy: r.policy, seed: r.seed, side: r.side }, c))) };
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  for (const side of SIDES) {
    const a = agg[side];
    console.log(`\n[${side}] n=${a.n} medD=${a.medianDays} maxD=${a.maxDays} nat=${a.national} tab=${a.table} w4=${a.w4} w5=${a.w5}`);
    console.log(`  unlock events=${a.unlockEvents} beats observed=${a.beatObserved} lag<=1d=${a.lagWithin1} early=${a.lagEarly} PRIMARY=${a.primaryShare == null ? 'n/a' : (a.primaryShare * 100).toFixed(1) + '%'}`);
    console.log(`  lag dist: [${a.lagDist.join(',')}]`);
    console.log(`  endReasons: ${JSON.stringify(a.endReasons)}`);
  }
  if (SMOKE) {
    const ok = runs.every(r => r.samples.length > 0);
    console.log(ok ? '\nSMOKE GATE: sampler collects on all runs, no crash.' : '\nSMOKE GATE: FAILED — empty samples');
    if (!ok) process.exit(4);
  }
}

main().catch(e => { console.error('UNLOCKBEAT SWEEP FATAL:', e && e.stack || e); process.exit(2); });
