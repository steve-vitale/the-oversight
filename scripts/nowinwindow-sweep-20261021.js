#!/usr/bin/env node
// nowinwindow-sweep-20261021.js — no-win post-invitation-window diagnostic
// sweep (flesh-out loop arm sim-nowinwindow, axis scale-onramp, backlog
// #748's named next).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes. The no-win POLICY layer
// (scripts/policies/nowinwindow.js, NOWINWINDOW=1) is a new policy file, not
// a modification — it wraps the vgearconfirm winning stack OUTSIDE and
// refuses Game.tableTakeSeat for the duration of the inner daily. The win
// can never happen (all four `won = true` sites are downstream of the sit),
// so the post-invitation window runs to the 180d horizon instead of
// truncating at the win day.
//
// Sweep: 8 FRESH seeds (65301–65308, verified unused: no s<seed>.json in any
// evidence/*/perseed-* dir, no collision with other seed-block naming) ×
// {leadfeast, belongfeast} = 16 runs, 180d death-aware (+10d tail via the
// harness). One phase — every run is a full window census.
//
// Substrate: NW.armedFor(base) — withNoWin(VCE.armedFor(base))
// (NOWINWINDOW=1 over the VGEAR=1 winning substrate, pinned in
// scripts/policies/nowinwindow.js + scripts/policies/vgearconfirm.js).
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
// VGEAR=1 KILLDISC=1 NOWINWINDOW=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT
// unset. SWEEP FAILS LOUD unless the env matches exactly.
//
// INSTRUMENT: scripts/nowinwindow-instrument-20261021.js (the r3 window
// layer + invitation/exiled reads, on top of the killdisc v2 base — neither
// modified). Fight ids contain Date.now() — used in-process only for the
// engagement<->kill/outcome joins and NEVER persisted (bool flags only), so
// per-seed JSONs are re-run byte-identical.
//
// #760 fields: winTrack{path,branch,resolution,phase} (always null here —
// any non-null is a LAYER FAILURE, reported LOUD), seat, rankAtEnd, maxRank,
// everNational, plus exiled (post-run scholar.exiled) and everExiled (any
// trace day exiled — the r3 instrument never recorded it).
//
// Writes per-seed JSONs ONCE, on purpose, to
// $EVID/{policy}/s<seed>.json and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 NOWINWINDOW=1 \
//   SEEDS=65301,65302,65303,65304,65305,65306,65307,65308 POLICIES=leadfeast,belongfeast DAYS=180 \
//   EVID=evidence/2026-10-21/perseed-nowinwindow \
//   node scripts/nowinwindow-sweep-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const NW = require(path.join(REPO, 'scripts', 'policies', 'nowinwindow'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));
const WI = require(path.join(REPO, 'scripts', 'nowinwindow-instrument-20261021'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC', 'NOWINWINDOW']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] != null) { console.error(`SWEEP STOP: ${k} must be UNSET on this substrate.`); process.exit(2); }
}
if (!NW.layerOn()) { console.error('SWEEP STOP: NOWINWINDOW layer off despite NOWINWINDOW=1.'); process.exit(2); }
if (!WI.instrumentOn()) { console.error('SWEEP STOP: window instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65301, 65302, 65303, 65304, 65305, 65306, 65307, 65308]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-nowinwindow');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, policyId) {
  const policy = NW.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'nowinwindow', fullTelemetry: false });
  const t = {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
    firstInviteDay: null,
  };
  const uninstall = WI.install(Game, t);

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}
  const byScholar = (by) => !!(by && (by === scholarVid || by === 'player' || by === 'p'));

  // wave-4+ engagements with the fight-id joins done IN PROCESS (raw fight
  // ids are never persisted — bool flags only).
  const engagements = [];
  for (const e of t.engagements) {
    if ((e.wave | 0) < 4) continue;
    let outcome = null, outcomeSource = 'unrecorded';
    let killJoin = false, killBy = null, killVia = null, killerIsScholar = false;
    if (e.fightId) {
      const o = t.tbOutcomes[e.fightId];
      if (o != null) { outcome = String(o); outcomeSource = 'tbEnd'; }
    }
    for (const k of t.kills) {
      if ((k.wave | 0) < 4) continue;
      const fidMatch = e.fightId && k.ctx && k.ctx.fightId === e.fightId;
      const dayMidMatch = !e.fightId && k.day === e.day && k.mid === e.mid;
      if (fidMatch || dayMidMatch) {
        killJoin = true; killBy = k.by; killVia = k.via; killerIsScholar = byScholar(k.by);
        break;
      }
    }
    engagements.push({
      d: e.day, mid: e.mid, wave: e.wave, shape: e.shape,
      party: e.partySize, started: !!e.started,
      fightIdPresent: !!e.fightId, outcome, outcomeSource,
      killJoin, killBy, killVia, killerIsScholar,
    });
  }
  engagements.sort((a, b) => a.d - b.d);

  const fieldFights = t.fieldFights.filter(f => (f.wave | 0) >= 4).map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome,
    rounds: f.rounds, vTaken: f.vTaken, mDealt: f.mDealt,
  }));
  fieldFights.sort((a, b) => a.d - b.d);

  const kills = t.kills.filter(k => (k.wave | 0) >= 4).map(k => ({
    d: k.day, mid: k.mid, wave: k.wave, by: k.by, via: k.via,
    pyrrhic: !!k.pyrrhic, shape: KD.classifyKill(k, k.ctx),
    byScholar: byScholar(k.by), hasFightId: !!(k.ctx && k.ctx.fightId),
  }));
  kills.sort((a, b) => a.d - b.d);

  const spawns = t.spawns.filter(s => (s.wave | 0) >= 4).map(s => ({
    d: s.day, mid: s.mid, wave: s.wave, veteran: s.veteran, src: s.src,
  }));
  spawns.sort((a, b) => a.d - b.d);

  // Wall numbers + deaths.
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  if (won) {
    // LAYER FAILURE — the no-win layer's entire job is refusing the seat.
    // Report LOUD; the analyzer judges layer-failure on any win.
    console.error(`LOUD LAYER FAILURE: ${policyId} s${seed} WON (Game.won=true) with NOWINWINDOW=1 — the seat was taken.`);
  }

  // #760: winTrack{path,seat} + regional-at-win + ever-national, plus
  // exiled/everExiled (the r3 instrument never recorded exiled). All pure
  // reads. winTrack must be null on every run — a non-null winTrack with
  // won=0 would mean the table resolved without the win flag.
  let winTrack = null, seat = null, rankAtEnd = 'unknown';
  if (won) {
    try {
      const ts = (typeof Game.tableState === 'function') ? Game.tableState() : {};
      winTrack = {
        path: ts.path || null, branch: ts.branch || null,
        resolution: (ts.resolution && ts.resolution.title) || null,
        finalId: (ts.resolution && ts.resolution.finalId) || null,
        phase: ts.phase || null,
      };
    } catch (e) { winTrack = { error: String((e && e.message) || e) }; }
    try {
      const s = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
      seat = s ? { seat: s.seat || null, detail: s.detail || null } : null;
    } catch (e) { seat = { error: String((e && e.message) || e) }; }
  }
  try { const r = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : 'unknown'; rankAtEnd = (typeof r === 'string' && r) ? r : 'unknown'; } catch (e) {}
  let maxRank = 'village', everNational = 0;
  let firstInviteDay = t.firstInviteDay != null ? t.firstInviteDay : null;
  let inviteReadyDays = 0, everExiled = 0;
  try {
    let mo = -1;
    for (const w of t.window) {
      const ro = WI.rankOrd(w.rank);
      if (ro > mo) { mo = ro; maxRank = w.rank; }
      if (w.inviteReady) inviteReadyDays++;
      if (w.exiled) everExiled = 1;
    }
    everNational = mo >= WI.rankOrd('national') ? 1 : 0;
  } catch (e) {}
  // firstInviteDay fallback: derive from the trace if the instrument's
  // in-trace marker missed it (defensive; both read the same entries).
  if (firstInviteDay == null) {
    try {
      for (const w of t.window) { if (w.inviteReady) { firstInviteDay = w.day; break; } }
    } catch (e) {}
  }
  let exiled = 0;
  try { exiled = !!(((Game.state || {}).scholar || {}).exiled) ? 1 : 0; } catch (e) {}

  const deaths = {};
  const deathList = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathList.push({ day: d.day | 0, who: String(d.who || ''), player: !!d.player, kind: String(d.kind || ''), cause: String(d.cause || '') });
    }
  } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Unlock days from the window trace (first day uw >= 4 / >= 5).
  let w4Day = null, w5Day = null;
  for (const w of t.window) {
    if (w4Day == null && (w.uw | 0) >= 4) w4Day = w.day;
    if (w5Day == null && (w.uw | 0) >= 5) w5Day = w.day;
  }

  const out = {
    seed, policyId, instrument: 'nowinwindow-on-killdisc-v2',
    substrate: 'NW.armedFor (withNoWin(VCE.armedFor) — seat refused, NOWINWINDOW=1) + KILLDISC=1 (v2 base + nowinwindow window layer)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 NOWINWINDOW=1, SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset',
    anchorCommit: ANCHOR,
    maxWave, w4Day, w5Day, national, table, won,
    winTrack, seat, rankAtEnd, maxRank, everNational,
    exiled, everExiled,
    firstInviteDay, inviteReadyDays,
    days: result.days, gameDays, endReason: result.endReason,
    deaths, deathList,
    nWindowTraceDays: t.window.length,
    w4Engagements: engagements.length, w4FieldFights: fieldFights.length,
    w4Kills: kills.length, w4Spawns: spawns.length,
    window: t.window,
    engagements, fieldFights, kills, spawns,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  console.log(`nowinwindow sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${DAYS}`);
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const t0 = Date.now();
      try {
        const r = await oneRun(seed, policyId);
        rows.push(r);
        console.log(`done ${policyId} s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} w5Day=${r.w5Day} won=${r.won} ` +
          `inviteDay=${r.firstInviteDay} inviteReadyDays=${r.inviteReadyDays} ` +
          `winPath=${r.winTrack ? r.winTrack.path : '-'} seat=${r.seat ? r.seat.seat : '-'} rank=${r.rankAtEnd} everNat=${r.everNational} ` +
          `exiled=${r.exiled} everExiled=${r.everExiled} ` +
          `w4eng=${r.w4Engagements} w4ff=${r.w4FieldFights} w4kills=${r.w4Kills} errs=${r.instrumentErrors.length} ` +
          `(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const wins = ok.filter(r => r.won).length;
  if (wins > 0) console.error(`LOUD LAYER FAILURE: ${wins}/${ok.length} runs WON with NOWINWINDOW=1 — the seat-refusal layer failed.`);
  console.log(JSON.stringify({
    instrument: 'nowinwindow', n: ok.length, errors: rows.length - ok.length,
    wins,
    runsWithInvite: ok.filter(r => r.firstInviteDay != null).length,
    runsUnlocked5: ok.filter(r => r.w5Day != null).length,
    runsUnlocked4: ok.filter(r => r.w4Day != null).length,
    totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
  }, null, 1));
  fs.writeFileSync(path.join(EVID, 'corpus-summary.json'),
    JSON.stringify({ n: ok.length, errors: rows.length - ok.length, seeds: SEEDS, policies: POLICIES, days: DAYS }, null, 1) + '\n');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
