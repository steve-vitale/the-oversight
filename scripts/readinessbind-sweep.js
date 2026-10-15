#!/usr/bin/env node
// scripts/readinessbind-sweep.js — the wave-4/5 Standing-unlock readiness
// diagnostic sweep (readinessbind, 2026-10-15).
//
// INSTRUMENT-ONLY: wraps each policy's daily hook with a READ-ONLY sampler
// (scripts/readinessbind-lib.js). Zero src/js changes, zero policy behavior
// changes. Trajectory-neutrality is proven in
// scripts/test-readinessbind-20261015.js (MUTATE=1 naive-probe RED shows the
// hash is sensitive; instrument on/off is byte-identical).
//
// Substrate (the #209/#210 diagnostic): courtship + leadfeast roads —
//   FOURTHLINK=1  -> policies/fourthlink.js  (id 'fourthlink', uncapped courtship)
//   (no gate)    -> policies/belongseek.js   (id 'belongseek')
//   FEASTSCALE_R13=1 -> policies/feastscale.js (id 'leadfeast')
// 8 seeds (11/22/33/44/55/66/77/88), 180d death-aware, current tip.
// No before/after: this is a diagnostic sweep, one side only.
//
// At every wave-4/5 Standing unlock (first observed Game.unlockedWave() >=
// wave), captures readinessSnapshot (8 covariates) + the unlock beat text,
// then the 30d post-unlock outcome (held/died/hollow/tableBy30).
//
// Env:
//   FOURTHLINK=1 FEASTSCALE_R13=1 node scripts/readinessbind-sweep.js
//   SMOKE=1 ...  — instrument-honesty gate (15d/policy, no unlocks expected)
//   MUTATE=1 ...  — NAIVE PROBE (proof only): drains 500 kcal/day from the
//                   pantry inside the wrap. Deliberately trajectory-changing.
//                   NEVER in a real sweep.
//   SEEDS="11,22" POLICIES="leadfeast" DAYS=180 OUT=... PERSEED_DIR=...
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const RB = require('./readinessbind-lib');

const FOURTHLINK = process.env.FOURTHLINK === '1';
const R13 = process.env.FEASTSCALE_R13 === '1';
// MUTATE is read at CALL time (isMutate()) — the proof toggles it between
// runs in one process; a module-load-time read would freeze the first value.
const isMutate = () => process.env.MUTATE === '1';
if (!FOURTHLINK || !R13) {
  console.error('READINESSBIND FATAL: FOURTHLINK=1 and FEASTSCALE_R13=1 required (the #209/#210 substrate).');
  process.exit(2);
}
if (isMutate()) console.error('READINESSBIND: MUTATE=1 naive probe ACTIVE — trajectory will diverge by design (proof only).');

const POLICY_REGISTRY = {
  fourthlink: require('./policies/fourthlink').fourthlink,
  belongseek: require('./policies/belongseek').belongseek,
  leadfeast: require('./policies/feastscale').leadfeast,
};

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// naiveProbe: the DELIBERATELY MUTATING instrument (proof RED only).
// Drains 500 kcal/day from the pantry — guaranteed trajectory-changing.
function naiveProbe(Game) {
  try {
    const pantry = (Game.state.village || {}).pantry || [];
    let need = 500;
    for (const it of pantry) {
      if (need <= 0) break;
      const kcal = (it.kcalEach || 0) * (it.units || 1);
      if (kcal <= 0) continue;
      const take = Math.min(need, kcal);
      const units = it.kcalEach > 0 ? take / it.kcalEach : 0;
      it.units = Math.max(0, (it.units || 0) - units);
      need -= take;
    }
  } catch (e) {}
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'readinessbind-' + pid, fullTelemetry: false });
  await setupGame(Game);

  // Beat ring: capture say/sysSay for sense-testing the unlock beats.
  // Wrapped AFTER the harness silences them; records to our own ring,
  // calls through to the silenced no-op. No RNG, no state. Skipped in
  // RB_OFF mode (the OFF side stays maximally minimal).
  const ring = [];
  const RING_CAP = 60;
  const pushRing = (tag, msg) => {
    try {
      ring.push(tag + ': ' + String(msg).slice(0, 280));
      if (ring.length > RING_CAP) ring.splice(0, ring.length - RING_CAP);
    } catch (e) {}
  };
  if (process.env.RB_OFF !== '1') {
  try {
    const oSay = Game.say, oSys = Game.sysSay;
    Game.say = function (m) { pushRing('say', m); return oSay.apply(this, arguments); };
    Game.sysSay = function (m) { pushRing('sys', m); return oSys.apply(this, arguments); };
  } catch (e) {}
  }

  const rec = {
    policy: pid, seed, days,
    samples: [],          // per-day: {day, wave, seat, living, standingTotal}
    unlocks: [],          // {wave, unlockDay, coincident, snapshot, beats}
    tableDays: [],
    hashes: [],           // per-day trajectory hashes (honesty proof)
    endReason: null, gameDays: 0, over: false,
  };
  const seenWave = { 4: false, 5: false };
  let firstTableDay = -1;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  // RB_OFF=1: instrument reads skipped — minimal hash-only wrap (the OFF
  // side of the trajectory-neutrality proof; the shared hash collection is
  // identical on both sides, so ON-vs-OFF isolates the sampler's reads).
  if (process.env.RB_OFF === '1') {
    policy.daily = (G, ctx) => {
      try { rec.hashes.push(gday(G) + ':' + RB.trajectoryHash(G)); } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
  } else {
  policy.daily = (G, ctx) => {
    try {
      if (isMutate()) naiveProbe(G);
      const day = gday(G);
      let wave = 1;
      try { wave = G.unlockedWave ? G.unlockedWave() : 1; } catch (e) {}
      const seat = RB.tableSeatName(G);
      if (seat !== 'none' && firstTableDay < 0) firstTableDay = day;
      if (seat !== 'none') rec.tableDays.push(day);
      const living = RB.livingNPCs(G);
      let stTotal = 0;
      try { stTotal = G.villageStandingTotal ? G.villageStandingTotal() : 0; } catch (e) {}
      rec.samples.push({ day, wave, seat, living, standingTotal: stTotal });
      rec.hashes.push(day + ':' + RB.trajectoryHash(G));
      // Unlock detection: first observed day at the new wave.
      for (const w of [4, 5]) {
        if (!seenWave[w] && wave >= w) {
          seenWave[w] = true;
          // Coincident jump (e.g. 3 -> 5 in one day): backfill wave 4.
          const backfill = (w === 5 && !seenWave[4]);
          const waves = backfill ? [4, 5] : [w];
          for (const bw of waves) {
            seenWave[bw] = true;
            let snap = null;
            try { snap = RB.readinessSnapshot(G, bw); } catch (e) { snap = { error: String(e && e.message) }; }
            rec.unlocks.push({
              wave: bw, unlockDay: day, coincident: backfill && bw === 4,
              snapshot: snap, beats: ring.slice(-12),
            });
          }
        }
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  } // end RB_OFF branch

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  rec.endReason = result.endReason;
  rec.gameDays = result.gameDays;
  try { rec.over = !!Game.over; } catch (e) {}
  rec.maxWaveUnlocked = result.maxWaveUnlocked || 1;

  // 30d post-unlock outcomes.
  for (const u of rec.unlocks) {
    const plus30 = rec.samples.find(s => s.day === u.unlockDay + 30);
    u.outcome = RB.classifyOutcome(
      { unlockDay: u.unlockDay, wave: u.wave },
      { finalDay: rec.gameDays, endReason: rec.endReason, over: rec.over,
        livingAtPlus30: plus30 ? plus30.living : -1, tableDays: rec.tableDays }
    );
  }
  return rec;
}

function summarizeUnlocks(recs) {
  const unlocks = [];
  for (const r of recs) {
    for (const u of r.unlocks) {
      unlocks.push({
        policy: r.policy, seed: r.seed, wave: u.wave, unlockDay: u.unlockDay,
        coincident: !!u.coincident, snapshot: u.snapshot, outcome: u.outcome,
      });
    }
  }
  return unlocks;
}

// SMOKE=1: instrument-honesty gate — policies unwrap and drive, the sampler
// collects, and no unlocks are expected on a 15d smoke (Standing cannot reach
// 100 that early — a detection here would prove hallucination).
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  const expect = { fourthlink: 'fourthlink', belongseek: 'belongseek', leadfeast: 'leadfeast' };
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const base = POLICY_REGISTRY[pid];
    check(`[${pid}] unwrapped policy.daily is a function`, base && typeof base.daily === 'function');
    check(`[${pid}] policy id`, (base && base.id) === expect[pid], 'id=' + (base && base.id));
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} unwrap failure(s).`); process.exit(1); }
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    const rec = await oneRun(11, pid, 15);
    check(`[${pid}] sampler collected daily samples`, rec.samples.length > 0, `n=${rec.samples.length}`);
    check(`[${pid}] trajectory hashes collected`, rec.hashes.length === rec.samples.length, `n=${rec.hashes.length}`);
    const snapOk = rec.samples.every(s => typeof s.standingTotal === 'number' && typeof s.wave === 'number');
    check(`[${pid}] samples carry wave+standing reads`, snapOk);
    check(`[${pid}] no unlocks on 15d smoke (no hallucination)`, rec.unlocks.length === 0, `unlocks=${rec.unlocks.length}`);
  }
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: instrument samples cleanly, no hallucinated unlocks.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'fourthlink,belongseek,leadfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const perSeedDir = process.env.PERSEED_DIR || null;
  const recs = [];
  for (const pid of pids) for (const seed of seeds) {
    console.log(`-- readinessbind ${pid} seed ${seed} (${days}d) --`);
    const r = await oneRun(seed, pid, days);
    recs.push(r);
    const u4 = r.unlocks.filter(u => u.wave === 4), u5 = r.unlocks.filter(u => u.wave === 5);
    console.log(`   days=${r.gameDays} end=${r.endReason} maxWave=${r.maxWaveUnlocked} ` +
      `w4=${u4.length ? u4.map(u => 'd' + u.unlockDay + ':' + u.outcome.outcome).join(',') : '-'} ` +
      `w5=${u5.length ? u5.map(u => 'd' + u.unlockDay + ':' + u.outcome.outcome).join(',') : '-'}`);
    if (perSeedDir) {
      try { fs.mkdirSync(perSeedDir, { recursive: true }); } catch (e) {}
      const slim = Object.assign({}, r, { samples: r.samples.filter(s => s.day % 5 === 0 || r.unlocks.some(u => Math.abs(u.unlockDay - s.day) <= 2 || Math.abs(u.unlockDay + 30 - s.day) <= 1)) });
      fs.writeFileSync(path.join(perSeedDir, `${pid}-s${seed}.json`), JSON.stringify(slim, null, 1));
    }
  }
  const unlocks = summarizeUnlocks(recs);
  const attr = RB.attribution(unlocks);
  const sep = RB.separation(unlocks);
  const agg = {
    label: 'readinessbind', seeds, policies: pids, days, mutate: isMutate(),
    nRuns: recs.length,
    nUnlocks: unlocks.length,
    w4: unlocks.filter(u => u.wave === 4).length,
    w5: unlocks.filter(u => u.wave === 5).length,
    outcomes: unlocks.reduce((t, u) => { const o = (u.outcome || {}).outcome || '?'; t[o] = (t[o] || 0) + 1; return t; }, {}),
    tableBy30: unlocks.filter(u => (u.outcome || {}).tableBy30 === 1).length,
    attribution: attr,
    separation: sep,
  };
  console.log('\n===== READINESSBIND AGGREGATE =====');
  console.log(JSON.stringify(agg, null, 1));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify({ aggregate: agg, unlocks, runs: recs.map(r => {
    const c = Object.assign({}, r);
    if (process.env.RB_KEEP_HASHES !== '1') { delete c.samples; delete c.hashes; }
    return c;
  }) }, null, 1));
}

if (require.main === module) {
  main().catch(e => { console.error('READINESSBIND CRASH:', e); process.exit(2); });
}

// Exported for the proof (scripts/test-readinessbind-20261015.js), which
// drives oneRun directly with MUTATE / RB_OFF env flags. CLI use unaffected.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { oneRun, POLICY_REGISTRY };
}
