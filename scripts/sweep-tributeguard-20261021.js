#!/usr/bin/env node
// sweep-tributeguard-20261021.js — sim-tributeguard PILOT sweep.
//
// 8 FRESH seeds (64921-64928, verified unused) x {control, armed} = 16 runs,
// belongfeast only, 180d death-aware, paired identical seeds, on the VGEAR=1
// WINNING substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
// SEATDRIVE=1 VGEAR=1; NO SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT):
//
//   control = TG.armedFor('belongfeast') with TRIBGUARD unset
//             (withTributeGuard OUTSIDE the vgearconfirm armed stack;
//              read-only skip counting, pure delegation)
//   armed   = TG.armedFor('belongfeast') with TRIBGUARD=1 (the guard:
//             never skip the tribute that keeps the court)
// Both share scripts/policies/tributeguard.js; composition honesty pinned by
// scripts/test-tributeguard-20261021.js BEFORE this sweep ran.
//
// Instruments: the layer's own skip/guard counters (ctx.tgSkips,
// tgGuardPaid, tgGuardPartial, tgGuardError + bounded tgEvents log) plus a
// call-through daily rank/arrears census (Game.sleep wrap: rank, own-link
// arrears/trust — pure reads, zero writes/RNG) for the dissolution
// secondary. Same det-gate discipline as the DIAG.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-tributeguard/ and prints a summary.
//
// TRANSCRIPT mode (sense-testing): TRANSCRIPT=1 re-runs the given seeds and
// captures Game.say lines into evidence/2026-10-21/tributeguard-transcripts/
// (a window around each guard/skip event day). Not part of the judged sweep.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 \
//   ARM=control SEEDS=64921,64922 node scripts/sweep-tributeguard-20261021.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 \
//   TRIBGUARD=1 ARM=armed SEEDS=64921,64922 node scripts/sweep-tributeguard-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (TRIBUTEGUARD_KILLED=1
// set by the coordinator after a killed arm), this sweep exits green with an
// INFO-SKIP instead of FATAL-ing.
let TG = null;
try { TG = require(path.join(REPO, 'scripts', 'policies', 'tributeguard')); }
catch (e) {
  if (process.env.TRIBUTEGUARD_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/tributeguard.js deleted per kill protocol (sim-tributeguard NO-GO) — sweep not applicable.');
    process.exit(0);
  }
  throw e;
}

// WINNING-SUBSTRATE guard (sim-fullseat corpus env + VGEAR).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS', 'SURPLUSFEED']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
if (ARM === 'armed' && process.env.TRIBGUARD !== '1') { console.error('SWEEP STOP: TRIBGUARD=1 required for ARM=armed.'); process.exit(2); }
if (ARM === 'control' && ('TRIBGUARD' in process.env)) { console.error('SWEEP STOP: TRIBGUARD must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64921, 64922, 64923, 64924, 64925, 64926, 64927, 64928]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const TRANSCRIPT = process.env.TRANSCRIPT === '1';
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-tributeguard');
fs.mkdirSync(EVID, { recursive: true });
if (TRANSCRIPT) fs.mkdirSync(path.join(REPO, 'evidence', '2026-10-21', 'tributeguard-transcripts'), { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

async function oneRun(seed) {
  const policy = TG.armedFor('belongfeast');
  const tag = 'belongfeast-tributeguard';
  const { Game } = await loadGame({ seed, mode: 'tributeguard', fullTelemetry: false });

  // Daily rank + own-link arrears/trust census (call-through, pure reads).
  const rankCensus = [];
  let uninstallRank = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const day = ((Game.state || {}).scholar || {}).day || 0;
          let rank = 'village';
          try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
          const link = TG.ownSubLink(Game);
          rankCensus.push({
            day, rank,
            ownTrust: link ? (link.trust || 0) : null,
            ownArrears: link ? (link.arrears || 0) : null,
            courtHeld: link ? TG.courtHeld(Game, link) : false,
          });
        } catch (e) {}
        return oSleep(...a);
      };
      uninstallRank = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  // Transcript capture (sense-testing mode only).
  const sayLines = [];
  let uninstallSay = null;
  if (TRANSCRIPT) {
    try {
      const oSay = Game.say ? Game.say.bind(Game) : null;
      if (oSay) {
        Game.say = function (...a) {
          try {
            const day = ((Game.state || {}).scholar || {}).day || 0;
            sayLines.push('[d' + day + '] SAY: ' + a.map(String).join(' '));
          } catch (e) {}
          return oSay(...a);
        };
        uninstallSay = () => { try { Game.say = oSay; } catch (e) {} };
      }
    } catch (e) {}
  }

  await setupGame(Game);
  let result, runCtx = null;
  // Capture the ctx the layer writes (runDays creates its own ctx; the
  // wrapper just forwards and remembers it — zero behavior change).
  const wrapped = Object.assign({}, policy, {
    daily(G, c) { runCtx = c; try { return policy.daily(G, c); } catch (e) { throw e; } },
  });
  await quietLog(async () => {
    result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 });
  });
  const ctx = runCtx || {};
  try { if (uninstallRank) uninstallRank(); } catch (e) {}
  try { if (uninstallSay) uninstallSay(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0, winTrack = null;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    const ek = pg.table && pg.table.endingKey;
    if (ek) winTrack = { path: ek.tablePath || null, moral: ek.moral || null, track: ek.track || null, seat: ek.seat || null };
  } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  // Dissolution secondary: rank national/global -> village transitions, with
  // own-link arrears at the transition day.
  let nationalEver = 0;
  const dissolutions = [];
  try {
    let prevNat = false;
    for (const c of rankCensus) {
      const nat = c.rank === 'national' || c.rank === 'global';
      if (nat) nationalEver = 1;
      if (prevNat && !nat) {
        dissolutions.push({ day: c.day, ownArrears: c.ownArrears, ownTrust: c.ownTrust, courtHeld: c.courtHeld });
      }
      prevNat = nat;
    }
  } catch (e) {}
  const arrearsTripped = dissolutions.filter(d => (d.ownArrears || 0) > 0).length;

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'tributeguard-layer-counters + rank/arrears census',
    substrate: 'VGEAR=1 winning substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, nationalEver, table, won, exiled, winTrack,
    days: result.days, gameDays, endReason: result.endReason,
    // MECHANISM (the primary): tribute skips while a court is held.
    tgSkips: ctx.tgSkips | 0,
    tgGuardPaid: ctx.tgGuardPaid | 0,
    tgGuardPartial: ctx.tgGuardPartial | 0,
    tgGuardError: ctx.tgGuardError | 0,
    tgEvents: (ctx.tgEvents || []).slice(0, 200),
    // SECONDARY (report only): dissolution transitions + arrears at trip.
    dissolutions: dissolutions.length,
    arrearsTrippedDissolutions: arrearsTripped,
    dissolutionDetail: dissolutions,
    deathCauses,
    rankCensusDays: rankCensus.length,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');

  // Transcript windows around guard/skip events (sense-testing).
  if (TRANSCRIPT) {
    try {
      const eventDays = new Set((ctx.tgEvents || []).map(e => e.day));
      const win = [];
      for (const line of sayLines) {
        const m = /^\[d(\d+)\]/.exec(line);
        if (!m) continue;
        const d = parseInt(m[1], 10);
        for (const ed of eventDays) {
          if (Math.abs(d - ed) <= 4) { win.push(line); break; }
        }
      }
      const tfp = path.join(REPO, 'evidence', '2026-10-21', 'tributeguard-transcripts',
        `tg-${ARM}-belongfeast-s${seed}.txt`);
      fs.writeFileSync(tfp,
        `# tributeguard ${ARM} belongfeast s${seed} — say-lines within ±4d of guard/skip events ` +
        `(${eventDays.size} event days) | maxWave=${maxWave} national=${national} table=${table} won=${won}\n\n` +
        win.join('\n') + '\n');
    } catch (e) {}
  }
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      rows.push(r);
      console.log(`done ${r.policy} s${seed}: tgSkips=${r.tgSkips} tgGuardPaid=${r.tgGuardPaid} tgPartial=${r.tgGuardPartial} dissol=${r.dissolutions} arrearsTrip=${r.arrearsTrippedDissolutions} nat=${r.national}/${r.nationalEver} won=${r.won} w5=${r.wave5} days=${r.gameDays} end=${r.endReason}`);
    } catch (e) {
      console.error(`FAILED s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
      process.exitCode = 1;
    }
  }
  fs.writeFileSync(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national, nationalEver: r.nationalEver,
    table: r.table, won: r.won, exiled: r.exiled,
    tgSkips: r.tgSkips, tgGuardPaid: r.tgGuardPaid, tgGuardPartial: r.tgGuardPartial,
    dissolutions: r.dissolutions, arrearsTrippedDissolutions: r.arrearsTrippedDissolutions,
    gameDays: r.gameDays, endReason: r.endReason, deathCauses: r.deathCauses, winTrack: r.winTrack,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
