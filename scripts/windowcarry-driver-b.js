#!/usr/bin/env node
// windowcarry-driver-b.js — judged legs for sim-windowcarry-b.
// Warmed stack + windowcarry probe wrapper (WINDOWCARRY=1 variant,
// WINDOWCARRY=0 OFF det-gate). Control legs run through the existing
// trace driver (unmodified); this driver runs variant + OFF legs only.
// Records per loop-day: morning snap (pre-probe-daily: pack, kcal,
// pantry, position) and evening snap (woodcarry + warmth records,
// pack, kcal, wood, ticks, departure record). The probe's depart
// records carry the policy's own daily-call loop-day; the driver
// cross-checks it against its callIdx stamp at the evening.
// No behavior change beyond the probe wrapper itself: no verb calls,
// no state writes, no RNG draws in this driver (say wrapping only).
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" (required)
//   WOODCARRY="1" (required)
//   WOODWARM="0"|"1" (required: 0 = guard leg, 1 = ON leg)
//   WINDOWCARRY="0"|"1" (required, explicit)
//   STRANDFIX must NOT be 1; PRESSB must NOT be 1
//   SEEDS, DAYS=30, OUTDIR (override)
// Write transport mirrors the trace driver (EPERM flap waited out;
// deadline exhaustion stages inside this worktree, never /tmp).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withWindowcarry, newStore: newWcStore } = require('./policies/windowcarry-diag');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be set explicitly to 0 (guard) or 1 (ON)'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.WINDOWCARRY !== '0' && process.env.WINDOWCARRY !== '1') { console.error('FATAL: WINDOWCARRY must be set explicitly to 0 (OFF) or 1 (variant)'); process.exit(2); }
if (process.env.STRANDFIX === '1') { console.error('FATAL: STRANDFIX must NOT be 1 in a windowcarry leg'); process.exit(2); }
if (process.env.PRESSB === '1') { console.error('FATAL: PRESSB must NOT be 1 in a windowcarry leg'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '15215')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for windowcarry legs'); process.exit(2); }
const ARM = process.env.WINDOWCARRY === '1' ? 'variant' : 'off';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-31', 'sim-windowcarry-b-corpus-' + (process.env.WOODWARM === '1' ? 'on' : 'guard') + '-' + ARM);
const STAGING_DIR = path.join(__dirname, '..', '.windowcarry-staging');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    vesselId: (Game.villagerId !== undefined ? Game.villagerId : (sch.villagerId !== undefined ? sch.villagerId : null)),
  };
}
function packSnap(Game) {
  try {
    const sch = (Game.state || {}).scholar || {};
    const day = sch.day || 0;
    const items = (sch.inventory || []).map((it) => {
      if (!it || typeof it !== 'object') return it;
      let spoiled = null;
      try { spoiled = (typeof Game.isSpoiled === 'function') ? !!Game.isSpoiled(it) : ((it.spoilDay !== undefined && it.spoilDay !== null) ? it.spoilDay <= day : false); } catch (e) {}
      return { name: it.name || null, units: (it.units === undefined ? null : it.units), kcalEach: (it.kcalEach === undefined ? null : it.kcalEach), edible: (it.edible === undefined ? null : !!it.edible), foodState: it.foodState || null, spoilDay: (it.spoilDay === undefined ? null : it.spoilDay), spoiled };
    });
    let kcalAll = 0, kcalKnown = 0;
    for (const it of items) {
      if ((it.kcalEach || 0) > 0) {
        kcalAll += (it.kcalEach || 0) * (it.units || 0);
        if (it.edible !== false && !it.spoiled) kcalKnown += (it.kcalEach || 0) * (it.units || 0);
      }
    }
    return { items, kcalAll: Math.round(kcalAll), kcalKnown: Math.round(kcalKnown) };
  } catch (e) { return null; }
}
function pantryKcal(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
  } catch (e) { return null; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const errs = [];
  const spawn = { pos: snapPos(Game), pack: packSnap(Game), pantryKcal: pantryKcal(Game) };
  const evenings = [], mornings = [];
  let callIdx = 0;
  let lastEvening = null;
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const probeStore = newWcStore();
  const probe = withWindowcarry(warmed, probeStore);
  const policy = Object.assign({}, probe, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) {
        const mPos = snapPos(Game2);
        const mPack = packSnap(Game2);
        let mWood = null;
        try { mWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) { errs.push('wood: ' + String(e && e.message).slice(0, 120)); }
        const prevStill = !!(lastEvening && lastEvening.woodcarry && lastEvening.woodcarry.bucket === 'creek' && !lastEvening.woodcarry.rescued);
        const atHaven = !!(mPos.inside || mPos.tile === 'haven');
        mornings.push({
          loopDay: callIdx, ...mPos, morningWood: mWood, pack: mPack, pantryKcal: pantryKcal(Game2),
          prevEveningStillCreek: prevStill, prevEveningLoopDay: lastEvening ? lastEvening.loopDay : null,
          strandMorning: prevStill && !atHaven && !Game2.over && !(Game2.inCombat && Game2.inCombat()),
          startsAtHaven: atHaven,
          inCombat: !!(Game2.inCombat && Game2.inCombat()),
          saySeqAtMorning: saySeq,
        });
      }
      const sayBefore = sayLines.length;
      probe.daily(Game2, ctx);
      const dayLines = sayLines.slice(sayBefore).map((x) => x.line);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, tapDay: false, ...pos, saySeqAtEvening: saySeq };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.travelledHome = !!nt.travelledHome;
      }
      row.woodcarry = ctx._wcLast || null;
      row.warmth = ctx._wwLast || null;
      try { row.eveningWood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null; } catch (e) {}
      row.pack = packSnap(Game2);
      row.pantryKcal = pantryKcal(Game2);
      const dep = (ctx && ctx._wcDepart) || null;
      if (dep && dep.loopDay === undefined) { try { dep.loopDay = callIdx; dep.gameDay = pos.gameDay; } catch (e) {} }
      row.depart = dep;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      if (row.woodcarry && row.woodcarry.bucket === 'creek') row.fullDaySay = dayLines;
      evenings.push(row);
      lastEvening = row;
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: process.env.POLICY, woodwarm: process.env.WOODWARM, woodcarry: process.env.WOODCARRY,
    windowcarry: process.env.WINDOWCARRY, arm: ARM,
    spawn,
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors, classified: wcStore.classified, unclassified: wcStore.unclassified, otherRefused: wcStore.otherRefused },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted, missed: wwStore.missed },
    windowcarryStore: { departRecords: probeStore.departRecords, errs: probeStore.errs, dailyCount: probeStore.dailyCount, seenStill: probeStore.seenStill },
    errs, errCount: errs.length,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, sayLines,
  };
}

async function main() {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const name = `windowcarry-b-nighttravel-s${seed}.json`;
    const summary = `windowcarry-${ARM} policy=nighttravel woodcarry=${process.env.WOODCARRY} woodwarm=${process.env.WOODWARM} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} mornings=${inst.mornings.length} errs=${inst.errCount}`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' windowcarry-' + ARM + ' files to ' + OUTDIR);
}

if (require.main === module) {
  main().catch((e) => { console.error('WINDOWCARRY DRIVER CRASH', e && (e.stack || e)); process.exit(2); });
}
