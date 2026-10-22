#!/usr/bin/env node
// sweep-windowfight-20261022.js — post-invitation wave-5 deliberate-fighting
// DIAGNOSTIC sweep (flesh-out loop arm sim-windowfight-r2, run
// fleshout-20261022T0555Z, axis scale-onramp, backlog #748).
//
// ADOPTED ARM: the sim-windowfight (0019Z) worker died before writing its
// proof or running its sweep. This file is the orphan's sweep with the
// following corrections:
//   (1) SEEDS 65441-65448 — verified fresh 2026-10-22 (zero s6544*.json in
//       evidence/ across the whole workspace; 65401-65408 per-reg seeds
//       are VOID — their freshness claim was never established on disk;
//       65421-65432 consumed by landed sibling sim-wave5door-openers).
//   (2) Anchor: per-seed JSONs carry anchorCommit; must equal the landing
//       commit (f83b5d92c on this run) per the stale-base lesson.
//   (3) Exported the pure helpers (detectUnlockDays, channelOf,
//       continuePostWin) for the proof test's E2 RED→GREEN gate.
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. Composes the LANDED instruments on master, UNMODIFIED:
//   scripts/killdisc-instrument-20261021.js  (kill-discrimination v2 base)
//   scripts/windowreach-r3-instrument-20261021.js (post-unlock window layer)
// plus three arm-local additions, all inside THIS file:
//   (a) daily bearer <redacted> — a PURE read of Game.villagerId /
//       state.scholar.villagerId inside the policy wrapper, fixing backlog
//       #754 (end-of-run Game.villagerId misattributes wave kills under
//       succession churn — `by` is resolved against the bearer <redacted> THE
//       KILL'S DAY, sampled daily at policy.daily time = end of day;
//       documented daily granularity);
//   (b) the #757 post-win continuation hook (the ONE documented engine
//       mutation: Game.over=false post-win, then runDays again;
//       death-aware end preserved — hook never fires on village-lost);
//   (c) end-of-run w5gates-lib gateVector + attribute (PURE-ish reads only,
//       called post-run so no trajectory effect).
//
// Two phases (one invocation per phase; SEEDS/POLICIES/DAYS/EVID select):
//   Phase 1 (unlock-rate screen): SEEDS=65441..65448 (verified fresh
//     2026-10-22 — zero s6544*.json anywhere in evidence/) POLICIES=
//     leadfeast,belongfeast DAYS=180 — the HARD REALITY CHECK: establish
//     the current-master unlock rate on the PINNED winning substrate
//     BEFORE any post-unlock observation. #756: pre-screen sets must
//     qualify unlocks by substrate.
//   Phase 2 (window census): any unlocking runs from phase 1 re-run under
//     the analyzer with the post-win continuation already in place
//     (deterministic rerun = true continuation: the continuation is
//     deterministic per the #757 D2 proof, so phase-1 JSONs already carry
//     the full window).
//
// Substrate: VCE.armedFor(base) (VGEAR=1 winning substrate, pinned in
// scripts/policies/vgearconfirm.js).
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
// VGEAR=1 KILLDISC=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset.
// SWEEP FAILS LOUD unless the env matches exactly.
//
// Writes per-seed JSONs ONCE, on purpose, to
// $EVID/{policy}/s<seed>.json and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   SEEDS=65441,65442,65443,65444,65445,65446,65447,65448 POLICIES=leadfeast,belongfeast DAYS=180 \
//   EVID=evidence/2026-10-22/perseed-windowfight-r2 \
//   node scripts/sweep-windowfight-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));
const WI = require(path.join(REPO, 'scripts', 'windowreach-r3-instrument-20261021'));
const W5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] != null) { console.error(`SWEEP STOP: ${k} must be UNSET on this substrate.`); process.exit(2); }
}
if (!VCE.vgearOn()) { console.error('SWEEP STOP: VGEAR layer off despite VGEAR=1.'); process.exit(2); }
if (!WI.instrumentOn()) { console.error('SWEEP STOP: window instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65441, 65442, 65443, 65444, 65445, 65446, 65447, 65448]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-windowfight-r2');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(G) {
  try { return (((G.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}
function bearerVid(G) {
  // PURE read: the current scholar's villager id (null-safe).
  try { return (G.state && G.state.scholar && G.state.scholar.villagerId) || G.villagerId || null; } catch (e) { return null; }
}
// Herald channel split (backlog #749): the wave-4 tutorial titan's canon is
// "no solo fights — hard gate" (titans.js); its solo-TB refusals must not be
// counted in the wave-4-monster engagement channel.
const HERALD_MID = 'herald';
function channelOf(mid) { return String(mid || '') === HERALD_MID ? 'herald-titan' : 'wave-monster'; }

// detectUnlockDays(windowTrace): first day uw >= 4 / >= 5 in the daily
// window trace. Pure; unit-testable.
function detectUnlockDays(windowTrace) {
  let w4Day = null, w5Day = null;
  for (const w of (windowTrace || [])) {
    if (w4Day == null && (w.uw | 0) >= 4) w4Day = w.day;
    if (w5Day == null && (w.uw | 0) >= 5) w5Day = w.day;
  }
  return { w4Day, w5Day };
}

// continuePostWin(Game, runDaysFn, wrapped, days, quiet): the #757 post-win
// continuation hook as an exported, unit-testable unit. The stock harness
// (runDays) stops at the win flag on a village that is fully alive in
// memory; this records winDay/winPath, flips Game.over=false (POSTWIN-ALLOW
// — the one documented engine mutation in this arm's tooling), and calls
// runDays AGAIN for the remaining days. A post-win village-lost sets
// Game.over WITHOUT Game.won — the hook never fires; the death-aware end
// is preserved.
async function continuePostWin(Game, runDaysFn, wrapped, days, quiet) {
  const q = quiet || (async (fn) => fn());
  let winDay = null, winPath = null, winResumed = false, postWinDays = 0, finalResult = null;
  let wonFirst = false;
  try { wonFirst = !!Game.won; } catch (e) {}
  if (Game.over && wonFirst) {
    try { winDay = ((((Game.state || {}).scholar || {}).day | 0)) || 0; } catch (e) { winDay = 0; }
    try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    const remaining = Math.max(0, days - winDay);
    if (remaining > 0) {
      Game.over = false; // POSTWIN-ALLOW
      winResumed = true;
      finalResult = await q(async () => { return await runDaysFn(Game, wrapped, { days: remaining, manifest: undefined, sampleEvery: 30 }); });
      try { postWinDays = ((((Game.state || {}).scholar || {}).day | 0) || 0) - winDay; } catch (e) {}
    }
  }
  return { winDay, winPath, winResumed, postWinDays, finalResult };
}

async function oneRun(seed, policyId) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'windowfight', fullTelemetry: false });
  const t = {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
  };
  const uninstall = WI.install(Game, t);

  await setupGame(Game);
  const hashes = [];
  const bearerTimeline = {}; // day -> bearer <redacted> (sampled end-of-day in the policy wrapper)
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      bearerTimeline[Gm.state.scholar.day | 0] = bearerVid(Gm);
      return policy.daily(Gm, ctx);
    },
  });
  let result = await quietLog(async () => { return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  // POST-WIN CONTINUATION HOOK (#757): see continuePostWin above. Records
  // winDay + winPath, flips Game.over=false (POSTWIN-ALLOW), calls runDays
  // again for the remaining days. Never fires on village-lost.
  const endReasonFirst = result.endReason;
  const pw = await continuePostWin(Game, runDays, wrapped, DAYS, quietLog);
  const { winDay, winPath, winResumed, postWinDays } = pw;
  if (winResumed && pw.finalResult) result = pw.finalResult;
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let endRunScholarVid = null;
  try { endRunScholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}
  const bearerOnDay = (d) => bearerTimeline[d | 0] || null;

  // wave-4+ engagements with the fight-id joins done IN PROCESS (raw fight
  // ids are never persisted — bool flags only), herald channel split.
  const engagements = [];
  for (const e of t.engagements) {
    if ((e.wave | 0) < 4) continue;
    let outcome = null, outcomeSource = 'unrecorded';
    let killJoin = false, killBy = null, killVia = null;
    if (e.fightId) {
      const o = t.tbOutcomes[e.fightId];
      if (o != null) { outcome = String(o); outcomeSource = 'tbEnd'; }
    }
    for (const k of t.kills) {
      if ((k.wave | 0) < 4) continue;
      const fidMatch = e.fightId && k.ctx && k.ctx.fightId === e.fightId;
      const dayMidMatch = !e.fightId && k.day === e.day && k.mid === e.mid;
      if (fidMatch || dayMidMatch) {
        killJoin = true; killBy = k.by; killVia = k.via;
        break;
      }
    }
    engagements.push({
      d: e.day, mid: e.mid, wave: e.wave, shape: e.shape,
      channel: channelOf(e.mid),
      party: e.partySize, started: !!e.started,
      fightIdPresent: !!e.fightId, outcome, outcomeSource,
      killJoin, killBy, killVia,
    });
  }
  engagements.sort((a, b) => a.d - b.d);

  const fieldFights = t.fieldFights.filter(f => (f.wave | 0) >= 4).map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, wave: f.wave, channel: channelOf(f.mid),
    outcome: f.outcome, rounds: f.rounds, vTaken: f.vTaken, mDealt: f.mDealt,
  }));
  fieldFights.sort((a, b) => a.d - b.d);

  // Kills with KILL-TIME bearer <redacted> (#754): `by` is resolved against
  // the DAILY bearer <redacted> THE KILL'S DAY, never the end-of-run vid.
  const kills = t.kills.filter(k => (k.wave | 0) >= 4).map(k => {
    const bday = bearerOnDay(k.day);
    const byScholarAtKill = !!(k.by && bday && k.by === bday);
    const becameScholarLater = !!(k.by && endRunScholarVid && k.by === endRunScholarVid && !byScholarAtKill);
    return {
      d: k.day, mid: k.mid, wave: k.wave, channel: channelOf(k.mid),
      by: k.by, via: k.via,
      pyrrhic: !!k.pyrrhic, shape: KD.classifyKill(k, k.ctx),
      bearerOnKillDay: bday,
      byScholarAtKill,          // killer was the bearer <redacted> THE KILL'S DAY
      becameScholarLater,       // #754 phantom class: kill looks scholar at end-run, wasn't at kill-time
      endRunScholarVid,
      hasFightId: !!(k.ctx && k.ctx.fightId),
    };
  });
  kills.sort((a, b) => a.d - b.d);

  const spawns = t.spawns.filter(s => (s.wave | 0) >= 4).map(s => ({
    d: s.day, mid: s.mid, wave: s.wave, channel: channelOf(s.mid), veteran: s.veteran, src: s.src,
  }));
  spawns.sort((a, b) => a.d - b.d);

  // Wall numbers + deaths.
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}

  // #760: winTrack{path,seat} + regional-at-win + ever-national. Pure reads.
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
  try {
    let mo = -1;
    for (const w of t.window) {
      const ro = WI.rankOrd(w.rank);
      if (ro > mo) { mo = ro; maxRank = w.rank; }
    }
    everNational = mo >= WI.rankOrd('national') ? 1 : 0;
  } catch (e) {}

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
  const { w4Day, w5Day } = detectUnlockDays(t.window);

  // End-of-run wave-5 gate decomposition (w5gates-lib, PURE-ish reads,
  // post-run so no trajectory effect).
  let gateVector = null, gateAttr = null;
  try { gateVector = W5.gateVector(Game); } catch (e) { gateVector = { error: String((e && e.message) || e) }; }
  try { gateAttr = W5.attribute(gateVector); } catch (e) { gateAttr = { error: String((e && e.message) || e) }; }

  const out = {
    seed, policyId, instrument: 'windowfight-on-windowreach-r3+killdisc-v2',
    substrate: 'VCE.armedFor (withVillagerGear(withSeatDrive(withWinDefer(TF base)))) + KILLDISC=1 (v2 base + r3 window layer + bearer <redacted> + postwin-hook)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1, SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset',
    anchorCommit: ANCHOR,
    maxWave, w4Day, w5Day, national, table, won,
    winTrack, seat, rankAtEnd, maxRank, everNational,
    postWin: { winDay, winPath, winResumed, postWinDays, endReasonFirst },
    days: result.days, gameDays, endReason: result.endReason,
    deaths, deathList,
    nWindowTraceDays: t.window.length,
    w4Engagements: engagements.length, w4FieldFights: fieldFights.length,
    w4Kills: kills.length, w4Spawns: spawns.length,
    window: t.window,
    bearerTimeline,
    engagements, fieldFights, kills, spawns,
    gateVector, gateAttr,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return out;
}

// Pure helpers exported for the proof test (test-windowfight-20261022.js,
// E2 RED→GREEN). Requiring this module must NOT run the sweep.
module.exports = { detectUnlockDays, channelOf, continuePostWin, bearerVid, gday, HERALD_MID };

if (require.main === module) {
(async () => {
  console.log(`windowfight sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${DAYS} anchor=${ANCHOR}`);
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      try {
        const out = await oneRun(seed, policyId);
        rows.push({ seed, policyId, ok: true, w5Day: out.w5Day, won: out.won, endReason: out.endReason, gameDays: out.gameDays });
        console.log(`  ok ${policyId}/s${seed}: w5Day=${out.w5Day}, won=${out.won}, end=${out.endReason}, days=${out.gameDays}, eng=${out.w4Engagements}, kills=${out.w4Kills}`);
      } catch (e) {
        rows.push({ seed, policyId, ok: false, error: String((e && e.message) || e).slice(0, 200) });
        console.log(`  FAIL ${policyId}/s${seed}: ${String((e && e.message) || e).slice(0, 200)}`);
      }
    }
  }
  const ok = rows.filter(r => r.ok);
  fs.writeFileSync(path.join(EVID, 'sweep-summary.json'),
    JSON.stringify({ n: ok.length, errors: rows.length - ok.length, seeds: SEEDS, policies: POLICIES, days: DAYS, anchor: ANCHOR, rows }, null, 1) + '\n');
  console.log(`done: ${ok.length}/${rows.length} ok`);
  if (ok.length !== rows.length) process.exit(3);
})().catch(e => { console.error('SWEEP FATAL', e); process.exit(2); });
} // end if (require.main === module)
