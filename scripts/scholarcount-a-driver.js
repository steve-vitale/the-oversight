// scholarcount-a-driver.js — scholar-counts veteran census
// (arm sim-scholarcount-a, Loop A run fleshout-20261110T1415Z, base a80b2d789).
// Derived from scripts/capstoneready-b-driver.js (same daily census +
// kill-time sampling + final `killers` table). Differences, all additive:
//   - each daily row records BOTH veteran counts: livingVeterans (the NEW
//     engine read — the scholar counts, Steve RULED 2026-11-10) and
//     livingVeteransLegacy (the OLD rule — non-scholar living veterans,
//     recomputed from the log + scholarId + vpOf, the payable subset the
//     tribute delivery still requires);
//   - each daily row records veteransAll (scholar-inclusive killer list,
//     with isScholar) alongside veterans (legacy, non-scholar) and
//     payable (from the readiness return);
//   - kill-time samples record both counts at the kill moment;
//   - the summary adds peakLivingVeteransLegacy, legacy ever-ready, and
//     scholarVeteranDays (days the new count exceeds the legacy count).
// Usage:
//   SEEDS=140201..140208 DAYS=150 OUTDIR=evidence/2026-11-10/perseed-scholarcount-a node scripts/scholarcount-a-driver.js
// Writes evidence/2026-11-10/perseed-scholarcount-a/scholarcount-a-s<seed>.json
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
  outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-scholarcount-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'scholarcount-a-s' + seed + '.json');
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

// legacyLivingVeterans(Game): the OLD veteran rule, recomputed in the
// recorder — distinct living NON-scholar killers with a wave-4+ kill in
// the log. This is the payable subset the tribute delivery still
// requires (ladderDeliverCapstone pays 2 non-scholar veterans), and the
// guard secondary: it must reproduce the control corpus's
// livingVeterans exactly on every seed. Faithful re-implementation of
// the pre-fix _ladderLivingVeterans, including its fail-open catch
// (vpOf throwing counts the killer as living) and its roster-free read
// (any vid with a living vp record counts — the pre-fix code never
// checked roster membership; the NEW engine rule adds that check, so
// this legacy read and the new engine read can differ by a non-roster
// killer as well as by the scholar — the analyzer reports both).
function legacyLivingVeterans(Game) {
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const seen = {};
    const isLivingLegacy = (vid) => {
      if (!vid || vid === Game.villagerId) return false;
      try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); }
      catch (e) { return true; }
    };
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      if (!isLivingLegacy(e.by)) continue;
      seen[e.by] = true;
    }
    return Object.keys(seen).length;
  } catch (e) { return null; }
}

// snapshotLadder(Game): one daily census row. PURE READS ONLY — no game
// action, no RNG, no state write. (villageLadder() itself reads npcXp,
// which seeds a villager's track record on first touch with their
// occupation lean — deterministic given the villager, and any game-code
// read of the same villager seeds the identical record; neutrality is
// proven empirically in scripts/test-scholarcount-a.js.)
function snapshotLadder(Game) {
  const row = { day: gday(Game), errors: [] };
  // (a) scholarId: observe veteran-to-scholar promotion directly.
  try { row.scholarId = Game.villagerId || null; } catch (e) { row.scholarId = null; }
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
  // NEW rule (this arm): the scholar counts (Steve RULED 2026-11-10).
  try { row.livingVeterans = Game._ladderLivingVeterans(4); } catch (e) { row.livingVeterans = null; row.errors.push('_ladderLivingVeterans: ' + String(e.message).slice(0, 120)); }
  // Legacy count (OLD rule): non-scholar living veterans — the payable
  // subset. Must reproduce the control corpus exactly (guard secondary).
  try { row.livingVeteransLegacy = legacyLivingVeterans(Game); } catch (e) { row.livingVeteransLegacy = null; row.errors.push('legacyLivingVeterans: ' + String(e.message).slice(0, 120)); }
  // Payable count from the readiness return itself (additive `payable`
  // field on military_tribute) — must agree with livingVeteransLegacy.
  try { row.payable = (((row.deeds || {}).military_tribute || {}).payable != null) ? row.deeds.military_tribute.payable : null; } catch (e) { row.payable = null; }
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
  // veteransAll: the scholar-INCLUSIVE killer list (NEW rule) — same
  // shape as `veterans`, plus isScholar. The scholar is alive by
  // definition while holding the seat (mirrors standing.js); every
  // other killer's alive state comes from the data-array lookup.
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const seenAll = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      const v = seenAll[e.by] || (seenAll[e.by] = { vid: e.by, waves: [], firstKillDay: null, lastKillDay: null, kills: 0 });
      v.kills++;
      if (!v.waves.includes(e.w)) v.waves.push(e.w);
      if (e.d != null) {
        if (v.firstKillDay == null || e.d < v.firstKillDay) v.firstKillDay = e.d;
        if (v.lastKillDay == null || e.d > v.lastKillDay) v.lastKillDay = e.d;
      }
    }
    row.veteransAll = Object.keys(seenAll).map(function (vid) {
      const v = seenAll[vid];
      const isSch = vid === Game.villagerId;
      return { vid: vid, name: personName(Game, vid), alive: isSch ? true : personAlive(Game, vid), isScholar: isSch, waves: v.waves.sort(), kills: v.kills, firstKillDay: v.firstKillDay, lastKillDay: v.lastKillDay };
    });
  } catch (e) { row.errors.push('veteransAll: ' + String(e.message).slice(0, 120)); row.veteransAll = []; }
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

// wrapKillRecorder(Game, samples, errors): (b) kill-time veteran sampling.
// Wraps the two kill-log choke points (recordWaveKill, recordPyrrhicKill —
// every real kill flows through one of them; zero src/js) so that right
// after each NEW waveKillLog entry lands, the living-veteran count is
// sampled at that moment. Pure reads only: the sample is the same read
// ladderCapstoneReady uses (_ladderLivingVeterans). Sampling failures are
// caught and recorded — they must never change game behavior. A call that
// adds no log entry (recordWaveKill's same-day dedupe) records no sample.
// Returns the installed wrappers, or null when neither method exists.
function wrapKillRecorder(Game, samples, errors) {
  const methods = ['recordWaveKill', 'recordPyrrhicKill'];
  const installed = {};
  for (const name of methods) {
    const orig = Game[name];
    if (typeof orig !== 'function') continue;
    installed[name] = (function (origFn, methodName) {
      return function (monsterId, killerVid, via, detail) {
        let beforeLen = -1;
        try { beforeLen = (((Game.state || {}).waveKillLog) || []).length; } catch (e) {}
        const ret = origFn.apply(Game, arguments);
        try {
          const log = ((Game.state || {}).waveKillLog) || [];
          if (beforeLen >= 0 && log.length > beforeLen) {
            const entry = log[log.length - 1];
            if (entry && entry.mid === monsterId && (entry.by || null) === (killerVid || null)) {
              let living = null;
              try { living = Game._ladderLivingVeterans(4); } catch (e) { errors.push(methodName + ' sample: ' + String(e.message).slice(0, 120)); }
              let livingLegacy = null;
              try { livingLegacy = legacyLivingVeterans(Game); } catch (e) { errors.push(methodName + ' legacy sample: ' + String(e.message).slice(0, 120)); }
              samples.push({
                day: gday(Game), mid: entry.mid, by: entry.by, w: entry.w | 0,
                via: entry.via || via || 'unknown',
                livingVeteransAtKill: living,
                livingVeteransLegacyAtKill: livingLegacy,
                scholarIdAtKill: (function () { try { return Game.villagerId || null; } catch (e) { return null; } })(),
              });
            }
          }
        } catch (e) { errors.push(methodName + ' sample: ' + String(e.message).slice(0, 120)); }
        return ret;
      };
    })(orig, name);
    Game[name] = installed[name];
  }
  return Object.keys(installed).length ? installed : null;
}

// summarize(rows): per-seed census summary — ever-ready rates, first-ready
// days, blocked deed-day counts per reason, peaks. Pure function of rows.
// Rows in the old corpus format (no scholarId / kill-time fields) still
// summarize: those fields are never read here.
function summarize(rows) {
  const s = { days: rows.length, everReady: {}, firstReadyDay: {}, blockedDeedDays: {}, reasonDays: {}, peakLivingVeterans: 0, peakLadderStage: 0, peakScaleRank: 'village', everCharteredLinks: 0, everFeastBundle: false, everDelivered: null,
    // scholarcount-a additions: the legacy (payable) peak + ever-ready,
    // and the pooled scholar-veteran days (days the new count exceeds
    // the legacy count — the direct effect of the ruling).
    peakLivingVeteransLegacy: 0, scholarVeteranDays: 0,
    everReadyLegacy: { military_tribute: false }, firstReadyDayLegacy: { military_tribute: null },
    legacyReadyDays: 0, newReadyDays: 0 };
  const scaleOrd = { village: 0, regional: 1, national: 2, global: 3 };
  for (const kind of DEEDS) { s.everReady[kind] = false; s.firstReadyDay[kind] = null; s.blockedDeedDays[kind] = 0; }
  for (const r of rows) {
    if (typeof r.livingVeterans === 'number' && r.livingVeterans > s.peakLivingVeterans) s.peakLivingVeterans = r.livingVeterans;
    if (typeof r.livingVeteransLegacy === 'number' && r.livingVeteransLegacy > s.peakLivingVeteransLegacy) s.peakLivingVeteransLegacy = r.livingVeteransLegacy;
    if (typeof r.livingVeterans === 'number' && typeof r.livingVeteransLegacy === 'number' && r.livingVeterans > r.livingVeteransLegacy) s.scholarVeteranDays += (r.livingVeterans - r.livingVeteransLegacy);
    if (typeof r.livingVeteransLegacy === 'number' && r.livingVeteransLegacy >= 2) {
      s.legacyReadyDays++;
      if (!s.everReadyLegacy.military_tribute) { s.everReadyLegacy.military_tribute = true; s.firstReadyDayLegacy.military_tribute = r.day; }
    }
    if (typeof r.livingVeterans === 'number' && r.livingVeterans >= 2) s.newReadyDays++;
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
  // Binding blocker (prereg, baseline): the reason code with the largest share of
  // this seed's blocked deed-days; named when share >= 50%. Kept for
  // comparison only — the baseline proved it structurally unsatisfiable.
  let totalBlocked = 0, topReason = null, topN = 0;
  for (const k of Object.keys(s.reasonDays)) { totalBlocked += s.reasonDays[k]; if (s.reasonDays[k] > topN) { topN = s.reasonDays[k]; topReason = k; } }
  s.totalBlockedDeedDays = totalBlocked;
  s.bindingBlocker = topReason;
  s.bindingBlockerShare = totalBlocked ? +(topN / totalBlocked).toFixed(3) : null;
  s.bindingBlockerNamed = totalBlocked > 0 && s.bindingBlockerShare >= 0.5;
  // Per-deed binding blocker (prereg, re-measure): the modal reason over
  // THAT deed's own blocked days. Named when the modal share of that
  // deed's blocked days is >= 50%; a deed with zero blocked days counts
  // as named-vacuous (blocker null, it has nothing blocking it).
  s.perDeedBlocker = {};
  for (const kind of DEEDS) {
    const counts = {};
    let blocked = 0;
    for (const r of rows) {
      const d = (r.deeds || {})[kind];
      if (!d || d.ready) continue;
      blocked++;
      const reason = d.reason || 'unknown';
      counts[reason] = (counts[reason] | 0) + 1;
    }
    let modal = null, modalN = 0;
    for (const k of Object.keys(counts)) { if (counts[k] > modalN) { modalN = counts[k]; modal = k; } }
    s.perDeedBlocker[kind] = {
      blockedDays: blocked,
      blocker: blocked === 0 ? null : modal,
      share: blocked ? +(modalN / blocked).toFixed(3) : null,
      named: blocked === 0 || (modalN / blocked) >= 0.5,
    };
  }
  return s;
}

// buildKillers(Game, rows): the fates-table source (vetcount fix 4).
// Every distinct wave-4+ killer in the FINAL waveKillLog, INCLUDING the
// current scholar — the daily rows' `veterans` list deliberately excludes
// the current scholar (correct for the daily readiness read), so it cannot
// serve the fates table. Only the recorder, with Game access at end of
// run, can build this authoritatively. Additive: old corpora have no
// `killers` field and the analyzer falls back to last-row `veterans`.
function buildKillers(Game, rows) {
  const out = [];
  try {
    const scholarDays = {};
    for (const r of (rows || [])) { if (r.scholarId) scholarDays[r.scholarId] = (scholarDays[r.scholarId] | 0) + 1; }
    const log = ((Game.state || {}).waveKillLog) || [];
    const seen = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      const v = seen[e.by] || (seen[e.by] = { vid: e.by, waves: [], firstKillDay: null, lastKillDay: null, kills: 0, pyrrhicKills: 0 });
      v.kills++;
      if (e.pyrrhic === true) v.pyrrhicKills++;
      if (!v.waves.includes(e.w)) v.waves.push(e.w);
      if (e.d != null) {
        if (v.firstKillDay == null || e.d < v.firstKillDay) v.firstKillDay = e.d;
        if (v.lastKillDay == null || e.d > v.lastKillDay) v.lastKillDay = e.d;
      }
    }
    const scholarAtEnd = (function () { try { return Game.villagerId || null; } catch (e) { return null; } })();
    for (const vid of Object.keys(seen)) {
      const v = seen[vid];
      out.push({
        vid: vid, name: personName(Game, vid), alive: personAlive(Game, vid),
        waves: v.waves.sort(), kills: v.kills, pyrrhicKills: v.pyrrhicKills,
        firstKillDay: v.firstKillDay, lastKillDay: v.lastKillDay,
        everScholar: (scholarDays[vid] | 0) > 0, scholarDays: (scholarDays[vid] | 0),
        scholarAtEnd: vid === scholarAtEnd,
      });
    }
  } catch (e) { /* killers is diagnostic; a failure must never break the run */ }
  return out;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'scholarcount-a', fullTelemetry: false });
  const rows = [];
  const errors = [];
  const killTimeSamples = [];
  let lastSnapDay = -1;
  await setupGame(Game);
  wrapKillRecorder(Game, killTimeSamples, errors);
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
  summary.killTimeSamples = killTimeSamples.length;
  summary.killTimePeakVeterans = killTimeSamples.reduce(function (m, s) { return (typeof s.livingVeteransAtKill === 'number' && s.livingVeteransAtKill > m) ? s.livingVeteransAtKill : m; }, 0);
  summary.killTimeEverTwoVeterans = killTimeSamples.some(function (s) { return (s.livingVeteransAtKill | 0) >= 2; });
  summary.killTimePeakVeteransLegacy = killTimeSamples.reduce(function (m, s) { return (typeof s.livingVeteransLegacyAtKill === 'number' && s.livingVeteransLegacyAtKill > m) ? s.livingVeteransLegacyAtKill : m; }, 0);
  summary.killTimeEverTwoVeteransLegacy = killTimeSamples.some(function (s) { return (s.livingVeteransLegacyAtKill | 0) >= 2; });
  const out = {
    seed: seed, arm: 'scholarcount-a', run: 'fleshout-20261110T1415Z',
    policy: 'competent', anchorCommit: ANCHOR, days: DAYS,
    resultDays: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    waveKills: result.waveKills || {},
    scaleTrajectory: (result.samples && result.samples.scale) || [],
    teleDeaths: (result.samples && result.samples.deaths) || [],
    summary: summary, killTimeSamples: killTimeSamples, killers: buildKillers(Game, rows), daily: rows, recorderErrors: errors,
  };
  return out;
}

async function main() {
  loadConfig();
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'scholarcount-a-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = out.summary;
    console.log(JSON.stringify({
      seed: out.seed, days: out.resultDays, endReason: out.endReason, won: out.won,
      maxWave: out.maxWaveUnlocked, peakStage: s.peakLadderStage, peakScale: s.peakScaleRank,
      peakVets: s.peakLivingVeterans, peakVetsLegacy: s.peakLivingVeteransLegacy,
      scholarVetDays: s.scholarVeteranDays,
      killTimePeakVets: s.killTimePeakVeterans, killTimePeakVetsLegacy: s.killTimePeakVeteransLegacy,
      killTimeEverTwo: s.killTimeEverTwoVeterans, killTimeEverTwoLegacy: s.killTimeEverTwoVeteransLegacy,
      everReady: s.everReady, everReadyLegacy: s.everReadyLegacy,
      firstReadyDay: s.firstReadyDay, firstReadyDayLegacy: s.firstReadyDayLegacy,
      newReadyDays: s.newReadyDays, legacyReadyDays: s.legacyReadyDays,
      bindingBlocker: s.bindingBlocker, blockerShare: s.bindingBlockerShare, named: s.bindingBlockerNamed,
      perDeedBlocker: s.perDeedBlocker,
      everChartered: s.everCharteredLinks, everBundle: s.everFeastBundle,
      rows: s.days, recorderErrors: out.recorderErrors.length, file: path.relative(REPO, file),
    }));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { snapshotLadder: snapshotLadder, summarize: summarize, wrapKillRecorder: wrapKillRecorder, buildKillers: buildKillers, personAlive: personAlive, personName: personName, legacyLivingVeterans: legacyLivingVeterans, DEEDS: DEEDS };
