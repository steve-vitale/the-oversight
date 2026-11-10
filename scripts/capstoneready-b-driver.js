// capstoneready-b-driver.js — ladder capstone-deed readiness census
// (arm sim-capstoneready-b, Loop B run fleshout-loop-b-20261110T1030Z).
// DIAG ONLY, zero src/js: a daily recorder (pure reads) wrapped around the
// plain competent policy's daily() hook. Records, per seed-day,
// ladderCapstoneReady(kind) for all three deeds plus the underlying counts
// (living non-scholar wave-4 veterans, chartered trade links, scaleRank,
// ladderStage, feast-bundle flag, delivered state).
// Usage:
//   SEEDS=140101..140108 DAYS=150 node scripts/capstoneready-b-driver.js
// Writes evidence/2026-11-10/perseed-capstoneready-b/capstoneready-b-s<seed>.json
// (refuses to overwrite an existing per-seed file).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const DEEDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}

let SEEDS = [];
let DAYS = 150;
let ANCHOR = 'unknown';
let outDir = null;
function loadConfig() {
  SEEDS = expandSeeds(process.env.SEEDS);
  DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
  if (!SEEDS.length) { console.error('CAPSTONEREADY-B STOP: SEEDS required (e.g. SEEDS=140101..140108).'); process.exit(2); }
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-capstoneready-b');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'capstoneready-b-s' + seed + '.json');
    if (fs.existsSync(file)) { console.error('CAPSTONEREADY-B STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// personAlive(Game, vid): alive per the data-array lookup runDays' own
// snapshotVillagers uses (data.villagers / background_survivors .dead).
// Pure read, no hydration, no getPerson.
function personAlive(Game, vid) {
  try {
    const p = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; })
      || ((Game.data || {}).background_survivors || []).find(function (x) { return x && x.id === vid; });
    if (!p) return null;
    return !p.dead;
  } catch (e) { return null; }
}
function personName(Game, vid) {
  try {
    const p = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; })
      || ((Game.data || {}).background_survivors || []).find(function (x) { return x && x.id === vid; });
    return (p && p.name) || null;
  } catch (e) { return null; }
}

// snapshotLadder(Game): one daily census row. PURE READS ONLY — no game
// action, no RNG, no state write. (villageLadder() itself reads npcXp,
// which seeds a villager's track record on first touch with their
// occupation lean — deterministic given the villager, and any game-code
// read of the same villager seeds the identical record; neutrality is
// proven empirically in scripts/test-capstoneready-b.js.)
function snapshotLadder(Game) {
  const row = { day: gday(Game), errors: [] };
  try {
    const L = Game.villageLadder();
    row.ladder = {
      stage: L.stage, stageName: L.stageName, counted: L.counted,
      nextThreshold: L.nextThreshold, shortfall: L.shortfall,
      tracks: L.tracks, countedTracks: L.countedTracks, capped: (L.capped || []).slice(),
      detail: L.detail,
    };
  } catch (e) { row.errors.push('villageLadder: ' + String(e.message).slice(0, 120)); row.ladder = null; }
  row.deeds = {};
  for (const kind of DEEDS) {
    try { row.deeds[kind] = Game.ladderCapstoneReady(kind); }
    catch (e) { row.deeds[kind] = { kind: kind, ready: false, reason: 'read-error' }; row.errors.push(kind + ': ' + String(e.message).slice(0, 120)); }
  }
  try { row.scaleRank = Game.scaleRank(); } catch (e) { row.scaleRank = null; row.errors.push('scaleRank: ' + String(e.message).slice(0, 120)); }
  try { row.delivered = Game.ladderCapstoneDelivered(); } catch (e) { row.delivered = null; row.errors.push('delivered: ' + String(e.message).slice(0, 120)); }
  // Authoritative veteran count: the same read ladderCapstoneReady uses.
  try { row.livingVeterans = Game._ladderLivingVeterans(4); } catch (e) { row.livingVeterans = null; row.errors.push('_ladderLivingVeterans: ' + String(e.message).slice(0, 120)); }
  // Veteran identities, from raw state (waveKillLog + data-array alive
  // lookup): who they were, which waves they killed, whether they lived.
  // Scholar kills are excluded here, matching _ladderLivingVeterans.
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const seen = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      if (e.by === Game.villagerId) continue;
      const v = seen[e.by] || (seen[e.by] = { vid: e.by, waves: [], firstKillDay: null, lastKillDay: null, kills: 0 });
      v.kills++;
      if (!v.waves.includes(e.w)) v.waves.push(e.w);
      if (e.d != null) {
        if (v.firstKillDay == null || e.d < v.firstKillDay) v.firstKillDay = e.d;
        if (v.lastKillDay == null || e.d > v.lastKillDay) v.lastKillDay = e.d;
      }
    }
    row.veterans = Object.keys(seen).map(function (vid) {
      const v = seen[vid];
      return { vid: vid, name: personName(Game, vid), alive: personAlive(Game, vid), waves: v.waves.sort(), kills: v.kills, firstKillDay: v.firstKillDay, lastKillDay: v.lastKillDay };
    });
  } catch (e) { row.errors.push('veterans: ' + String(e.message).slice(0, 120)); row.veterans = []; }
  try {
    const roster = (((Game.state || {}).village || {}).roster) || [];
    row.roster = roster.length;
    let living = 0;
    for (const vid of roster) { const a = personAlive(Game, vid); if (a !== false) living++; }
    row.livingRoster = living;
  } catch (e) { row.roster = null; row.livingRoster = null; }
  try { row.waveKills = Object.assign({}, (Game.state || {}).waveKills || {}); } catch (e) { row.waveKills = {}; }
  try { row.over = !!Game.over; row.won = !!Game.won; } catch (e) {}
  return row;
}

// summarize(rows): per-seed census summary — ever-ready rates, first-ready
// days, blocked deed-day counts per reason, peaks. Pure function of rows.
function summarize(rows) {
  const s = { days: rows.length, everReady: {}, firstReadyDay: {}, blockedDeedDays: {}, reasonDays: {}, peakLivingVeterans: 0, peakLadderStage: 0, peakScaleRank: 'village', everCharteredLinks: 0, everFeastBundle: false, everDelivered: null };
  const scaleOrd = { village: 0, regional: 1, national: 2, global: 3 };
  for (const kind of DEEDS) { s.everReady[kind] = false; s.firstReadyDay[kind] = null; s.blockedDeedDays[kind] = 0; }
  for (const r of rows) {
    if (typeof r.livingVeterans === 'number' && r.livingVeterans > s.peakLivingVeterans) s.peakLivingVeterans = r.livingVeterans;
    if (r.ladder && typeof r.ladder.stage === 'number' && r.ladder.stage > s.peakLadderStage) s.peakLadderStage = r.ladder.stage;
    if (r.scaleRank && (scaleOrd[r.scaleRank] | 0) > (scaleOrd[s.peakScaleRank] | 0)) s.peakScaleRank = r.scaleRank;
    if (r.delivered) s.everDelivered = r.delivered;
    for (const kind of DEEDS) {
      const d = (r.deeds || {})[kind];
      if (!d) continue;
      if (d.ready) {
        if (!s.everReady[kind]) { s.everReady[kind] = true; s.firstReadyDay[kind] = r.day; }
      } else {
        s.blockedDeedDays[kind]++;
        const reason = d.reason || 'unknown';
        s.reasonDays[reason] = (s.reasonDays[reason] | 0) + 1;
      }
      if (kind === 'trade_charter' && typeof d.charteredLinks === 'number' && d.charteredLinks > s.everCharteredLinks) s.everCharteredLinks = d.charteredLinks;
      if (kind === 'feast_embassy' && d.bundle === true) s.everFeastBundle = true;
    }
  }
  // Binding blocker (prereg): the reason code with the largest share of
  // this seed's blocked deed-days; named when share >= 50%.
  let totalBlocked = 0, topReason = null, topN = 0;
  for (const k of Object.keys(s.reasonDays)) { totalBlocked += s.reasonDays[k]; if (s.reasonDays[k] > topN) { topN = s.reasonDays[k]; topReason = k; } }
  s.totalBlockedDeedDays = totalBlocked;
  s.bindingBlocker = topReason;
  s.bindingBlockerShare = totalBlocked ? +(topN / totalBlocked).toFixed(3) : null;
  s.bindingBlockerNamed = totalBlocked > 0 && s.bindingBlockerShare >= 0.5;
  return s;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'capstoneready-b', fullTelemetry: false });
  const rows = [];
  const errors = [];
  let lastSnapDay = -1;
  await setupGame(Game);
  const wrapped = Object.assign({}, COMPETENT.competent, {
    daily: function (Gm, ctx) {
      try { return COMPETENT.competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; rows.push(snapshotLadder(Game)); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 120)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // Final end-state row (post-runDays: Game.over may have cut the loop
  // before the last daily fired).
  try { const d = gday(Game); if (d !== lastSnapDay) rows.push(snapshotLadder(Game)); } catch (e) { errors.push('final-snapshot: ' + String(e.message).slice(0, 120)); }
  const st = Game.state || {};
  const summary = summarize(rows);
  const out = {
    seed: seed, arm: 'capstoneready-b', run: 'fleshout-loop-b-20261110T1030Z',
    policy: 'competent', anchorCommit: ANCHOR, days: DAYS,
    resultDays: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    waveKills: result.waveKills || {},
    scaleTrajectory: (result.samples && result.samples.scale) || [],
    teleDeaths: (result.samples && result.samples.deaths) || [],
    summary: summary, daily: rows, recorderErrors: errors,
  };
  return out;
}

async function main() {
  loadConfig();
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'capstoneready-b-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = out.summary;
    console.log(JSON.stringify({
      seed: out.seed, days: out.resultDays, endReason: out.endReason, won: out.won,
      maxWave: out.maxWaveUnlocked, peakStage: s.peakLadderStage, peakScale: s.peakScaleRank,
      peakVets: s.peakLivingVeterans, everReady: s.everReady, firstReadyDay: s.firstReadyDay,
      bindingBlocker: s.bindingBlocker, blockerShare: s.bindingBlockerShare, named: s.bindingBlockerNamed,
      everChartered: s.everCharteredLinks, everBundle: s.everFeastBundle,
      rows: s.days, recorderErrors: out.recorderErrors.length, file: path.relative(REPO, file),
    }));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { snapshotLadder: snapshotLadder, summarize: summarize, DEEDS: DEEDS };
