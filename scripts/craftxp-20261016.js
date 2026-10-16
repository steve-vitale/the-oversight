#!/usr/bin/env node
// scripts/craftxp-20261016.js — CRAFT-TRACK XP ECONOMY CENSUS (loop B, 2026-10-16,
// food-economy axis, arm sim-craftxp-b).
//
// READ-ONLY DIAGNOSTIC INSTRUMENT. Zero src/js changes, zero policy behavior
// changes. It wraps Game.gainTrackXP to attribute every craft-track XP award
// to its source verb, snapshots the occupation-lean baseline, and censuses
// craft-kit offer eligibility for deep_reserves.
//
// Background (evidence/2026-10-15/sim-bankpath-b.md, sim-findings #367): the
// designed bank-expansion path — System ability deep_reserves (Deep Reserves,
// food.bank_mult x5) — is structurally unreachable on the courtship road
// because the craft track never levels. The 4-run probe measured the craft
// track at 0L / 6-13 XP per lifetime against the L1 threshold of 18.
//
// Pre-registered questions (BINDING):
//   PRIMARY GO: >=95% of craft-track XP attributed to source verbs.
//   (1) the XP threshold for the first craft-track level and for
//       deep_reserves offer eligibility;
//   (2) the closest any run came to that threshold (absolute XP gap, and as a
//       multiple of the run's own accrual);
//   (3) the single largest missing-XP source class, named.
//
// Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (explicit — c004b9dd flipped the
// seat default ON; this axis runs the pre-seat substrate). Policies:
// leadfeast / belongfeast (feastscale-wrapped courtship policies).
// 16 fresh-seed runs: seeds 1601-1608 x {leadcourt, belongseek}, 180d
// death-aware (+10d tail max).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS="1601,1602" POLICIES="leadcourt,belongseek" DAYS=180 \
//     PERSEED_DIR=evidence/2026-10-16/perseed-craftxp node scripts/craftxp-20261016.js
// Det-gate mode (no wraps; trajectory-identity check):
//   ... DETGATE_OFF=1 ...   (emits canonical fingerprints only)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

const REG = { leadcourt: leadfeast, belongseek: belongfeast };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// --- classification of craft-track XP sources, in-canon terms ----------------
// occupationLean: background grant at character creation (trackLean, clamped
//   below the first threshold). Not a verb — a starting condition.
// cooking: the cooking deed (tracks.json deeds.cooking: n=1, perDay 1).
// crafting: the crafting deed (deeds.crafting: n=1, perDay 2).
// healing: the healing deed (deeds.healing: n=1, perDay 2) — healing XP feeds
//   the craft track (village craft canon: the healer's craft).
// hunger_trial: once-per-lifetime trial deed (deedConversions: n=3, craft).
// contest: contest-win deed (contests.js) — rarely craft.
// other: anything else, listed explicitly (attribution honesty).
function classifyCraftWhy(why) {
  why = String(why || '');
  if (why === 'cooking') return 'cooking';
  if (why === 'crafting') return 'crafting';
  if (why === 'healing') return 'healing';
  if (why === 'deed:hunger_trial') return 'hunger_trial';
  if (/^won .* on camera$/.test(why)) return 'contest';
  if (/^deed:/.test(why)) return 'trial_deed:' + why.slice(5);
  return 'other:' + (why || '(empty)');
}

// deep_reserves offer eligibility: craft kit index 11 (0-based); a level-up
// sheet draws from the next `window` (6) unheld kit entries. deep_reserves can
// enter a sheet only when at most (window-1)=5 unheld entries stand before it
// in kit order — i.e. >=6 of the first 11 entries already held.
function craftKitInfo(Game) {
  const info = { deepIndex: -1, window: 6, first11: [] };
  try {
    const T = Game.trackData ? Game.trackData() : {};
    const kit = ((T.kits || {}).craft) || [];
    info.deepIndex = kit.indexOf('deep_reserves');
    info.first11 = kit.slice(0, 11);
    const O = ((((Game.data || {}).godpaths || {}).rules || {}).offers) || {};
    if (O.window) info.window = O.window;
  } catch (e) {}
  return info;
}

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village', breadth: 0, vests: 0 };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try {
    const VEST_IDS = ['military_vest', 'swat_vest'];
    let n = 0;
    for (const it of ((Game.state.scholar || {}).inventory || [])) if (it && VEST_IDS.includes(it.id)) n += (it.units || 1);
    for (const v of Object.values((Game.state.scholar || {}).equipped || {})) if (v && VEST_IDS.includes(v.id)) n++;
    out.vests = n;
  } catch (e) {}
  return out;
}

function craftTrack(Game) {
  try {
    const t = Game.playerTracks ? Game.playerTracks() : {};
    const c = t.craft || {};
    return { level: c.level || 0, xp: Math.round(c.xp || 0) };
  } catch (e) { return { level: -1, xp: -1 }; }
}

// isPlayerSideCall(c): did this gainTrackXP award land in the SCHOLAR's own
// track record? who='player' always does; who=<vid> does only when that vid
// was the bearer at call time (the engine routes who===villagerId to
// _playerTrackXP). A villager-side award to a future bearer is NOT a
// scholar-track award — it surfaces later as that successor's startXp.
function isPlayerSideCall(c) {
  if (c.phase !== 'run' || c.track !== 'craft') return false;
  return c.who === 'player' || c.who === c.bearer;
}
// buildSegments({baselineXp, vid0, succEvents, runCalls, finalXp, traj, detOff}):
// split the scholar's craft-XP series at succession boundaries. mantleBecome
// REPLACES s.tracks wholesale, so without segmentation a successor's lower XP
// reads as negative accrual and attribution explodes. Bounds are exact when
// the mantleBecome hook fired (oldFinalXp / newStartXp captured around the
// original); calls are assigned by their monotonic seq. In DETGATE_OFF mode
// (no hooks) vid changes in the trajectory synthesize approximate bounds.
// Returns {segments, totalAccrued, totalAttributed, attributionPct}.
function buildSegments(o) {
  const { baselineXp, vid0, succEvents, runCalls, finalXp, traj, detOff } = o;
  const segments = [];
  const bounds = [{ seq: -1, startXp: baselineXp, vid: vid0 }];
  for (const ev of succEvents) bounds.push({ seq: ev.seq, startXp: ev.newStartXp, vid: ev.newVid, ev });
  if (!bounds.some(b => b.ev) && !detOff) {
    // no mantleBecome events seen but traj shows vid changes (hook missed a
    // path): synthesize from the trajectory.
    let lastVid = vid0;
    for (const t of traj) {
      if (t.vid !== lastVid) {
        bounds.push({ seq: -2, startXp: t.xp, vid: t.vid, approx: true });
        lastVid = t.vid;
      }
    }
    bounds.sort((a, b) => a.seq - b.seq);
  }
  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i];
    const nextSeq = (i + 1 < bounds.length) ? bounds[i + 1].seq : Infinity;
    const sgCalls = runCalls.filter(c => c.seq > b.seq && c.seq < nextSeq);
    // endXp = the bearer's XP at the NEXT succession (or the post-run read)
    const endXp = (i + 1 < bounds.length && bounds[i + 1].ev) ? bounds[i + 1].ev.oldFinalXp : finalXp;
    const sg = {
      vid: b.vid, startXp: b.startXp, endXp,
      accrued: (endXp == null || b.startXp == null) ? null : endXp - b.startXp,
      attributed: sgCalls.reduce((t, c) => t + c.n, 0),
      nCalls: sgCalls.length, approx: !!b.approx,
      byClass: {},
    };
    for (const c of sgCalls) {
      const k = classifyCraftWhy(c.why);
      sg.byClass[k] = (sg.byClass[k] || 0) + c.n;
    }
    sg.attributionPct = (sg.accrued != null && sg.accrued > 0)
      ? +(100 * sg.attributed / sg.accrued).toFixed(1)
      : (sg.attributed === 0 ? 100 : 0);
    segments.push(sg);
  }
  const totalAccrued = segments.reduce((t, sg) => t + Math.max(0, sg.accrued || 0), 0);
  const totalAttributed = segments.reduce((t, sg) => t + sg.attributed, 0);
  const attributionPct = totalAccrued > 0 ? +(100 * totalAttributed / totalAccrued).toFixed(1)
    : (totalAttributed === 0 ? 100 : 0);
  return { segments, totalAccrued, totalAttributed, attributionPct };
}

async function oneRun(seed, pid, days, detOff) {
  const base = REG[pid];
  const { Game } = await loadGame({ seed, mode: 'craftxp-census-' + pid, fullTelemetry: false });
  // Instrument IMMEDIATELY after load, before setupGame, so even setup-time
  // awards carry a phase flag. The wrap is a pure observer: it calls the
  // original first, records second, never mutates arguments or state.
  const calls = []; // {seq, phase, day, who, track, n, why}
  let seq = 0; // monotonic across the run: orders calls across successions
  const succEvents = []; // {day, seq, oldVid, newVid, oldFinalXp, newStartXp}
  let phase = 'setup';
  let oGain = null;
  if (!detOff && typeof Game.gainTrackXP === 'function') {
    oGain = Game.gainTrackXP;
    Game.gainTrackXP = function (who, track, n, why) {
      const r = oGain.apply(this, arguments);
      try {
        // bearer is captured AT CALL TIME: a villager-side award (who=vid)
        // routes to _villagerTrackXP (their npcXp), NOT s.tracks — unless
        // that vid is the bearer right now (gainTrackXP routes
        // who===villagerId to _playerTrackXP). The census counts only
        // awards that landed in the scholar's own track record.
        calls.push({ seq: seq++, phase, day: ((this.state.scholar || {}).day || 0), bearer: this.villagerId || null, who: String(who), track: String(track), n: n || 0, why: String(why || '') });
      } catch (e) {}
      return r;
    };
  }
  // Craft-verb sense lines: say() filtered to craft-eligible verbs. Capped;
  // the evidence sense-read uses these.
  const craftVerbLines = [];
  let oSay = null;
  if (!detOff && typeof Game.say === 'function') {
    oSay = Game.say;
    const re = /(cook|craf|smok|render|pemmican|preserv|heal|butcher|mend)/i;
    Game.say = function (s) {
      try {
        const line = String(s);
        if (re.test(line) && craftVerbLines.length < 60) {
          craftVerbLines.push('d' + ((Game.state.scholar || {}).day || 0) + ' ' + line.slice(0, 200));
        }
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
  }
  // Succession hook (pure observer): mantleBecome REPLACES s.tracks with the
  // successor's own record. Capture the old bearer's final craft XP BEFORE the
  // original runs and the new bearer's start XP AFTER — exact segment bounds.
  let oMantle = null;
  if (!detOff && typeof Game.mantleBecome === 'function') {
    oMantle = Game.mantleBecome;
    Game.mantleBecome = function (oldId, newId) {
      let oldFinalXp = null;
      try { oldFinalXp = craftTrack(this).xp; } catch (e) {}
      const day = ((this.state.scholar || {}).day || 0);
      const r = oMantle.apply(this, arguments);
      let newStartXp = null;
      try { newStartXp = craftTrack(this).xp; } catch (e) {}
      try { succEvents.push({ day, seq, oldVid: oldId, newVid: newId, oldFinalXp, newStartXp }); } catch (e) {}
      return r;
    };
  }
  await setupGame(Game);

  // Occupation-lean baseline (seeding happens on first playerTracks() touch).
  let occ = { id: null, name: null, craftLean: 0, craftStartXp: 0 };
  try {
    const p = (Game.getPerson && Game.villagerId) ? Game.getPerson(Game.villagerId) : null;
    const occId = p && p.occupationId;
    const lean = Game.occupationLean ? (Game.occupationLean(occId) || {}) : {};
    const th = Game.trackThresholds ? Game.trackThresholds('player') : [18, 48, 96, 192, 384];
    occ.id = occId || null;
    occ.name = (p && (p.occupationName || p.occupation)) || null;
    occ.craftLean = Math.round(lean.craft || 0);
    occ.craftStartXp = Math.max(0, Math.min((th[0] || 18) - 1, Math.round(lean.craft || 0)));
  } catch (e) {}
  const baselineXp = craftTrack(Game).xp;
  const thresholds = (() => { try { return Game.trackThresholds('player'); } catch (e) { return [18, 48, 96, 192, 384]; } })();

  const kitInfo = craftKitInfo(Game);
  const traj = [];
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, maxVests: 0 };
  const vid0 = (() => { try { return Game.villagerId || null; } catch (e) { return null; } })();
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      hist.maxVests = Math.max(hist.maxVests, s.vests || 0);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
      const c = craftTrack(G);
      // vid is recorded: succession (mantleBecome) REPLACES s.tracks with the
      // successor's own record, so craft XP is a per-bearer series.
      traj.push({ day: ((G.state.scholar || {}).day || 0), xp: c.xp, level: c.level, vid: G.villagerId || null });
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  phase = 'run';
  const result = await quietLog(async () => runDays(Game, policy, { days, sampleEvery: 10 }));
  phase = 'done';

  const finalCraft = craftTrack(Game);
  const runCalls = calls.filter(isPlayerSideCall);

  // --- per-bearer <redacted> (exact): succession events bound each bearer's XP
  // series; calls are assigned by seq. See buildSegments() below.
  const seg = buildSegments({ baselineXp, vid0, succEvents, runCalls, finalXp: finalCraft.xp, traj, detOff });
  const segments = seg.segments;
  const totalAccrued = seg.totalAccrued;
  const totalAttributed = seg.totalAttributed;
  const attributionPct = seg.attributionPct;
  const successions = succEvents.length;
  const bearerBest = segments.reduce((b, sg) => (!b || (sg.endXp || 0) > (b.endXp || 0) ? sg : b), null);
  const maxBearerXp = bearerBest ? (bearerBest.endXp || 0) : finalCraft.xp;
  const bearerBestAccrued = bearerBest ? Math.max(0, bearerBest.accrued || 0) : 0;
  const byClassAll = {};
  for (const sg of segments) for (const [k, v] of Object.entries(sg.byClass)) byClassAll[k] = (byClassAll[k] || 0) + v;

  // Craft-kit holdings at run end: how many of the first 11 are already held
  // (any source: level-ups, arrival, poison aid, contest prizes, safety nets).
  let first11Held = 0, heldCraftKit = [];
  try {
    const owned = new Set(Game.ownedAbilityIds ? Game.ownedAbilityIds() : []);
    for (const id of kitInfo.first11) if (owned.has(id)) { first11Held++; heldCraftKit.push(id); }
  } catch (e) {}
  const unheldBefore11 = kitInfo.first11.length - first11Held;
  const eligible = kitInfo.deepIndex >= 0 && unheldBefore11 <= (kitInfo.window - 1);
  // Gap analysis is per-BEARER: the closest any single bearer came to L1
  // (18) and to the L5 sheet (384, the level at which a 5th craft sheet
  // fires — the last sheet that could ever carry deep_reserves).
  const deepXpTarget = thresholds[4] || 384;
  const l1Target = thresholds[0] || 18;
  const gapMultiple = (target) => bearerBestAccrued > 0
    ? +Math.max(0, (target - maxBearerXp) / bearerBestAccrued).toFixed(2) : null;

  const end = stdSnapshot(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let exiled = 0;
  try { exiled = (Game.state.scholar && Game.state.scholar.exiled) ? 1 : 0; } catch (e) {}
  let scholarDead = 0;
  try { scholarDead = (Game.state.scholar && Game.state.scholar.dead) ? 1 : 0; } catch (e) {}

  const row = {
    instrument: 'craftxp-20261016', policy: pid, seed, side: 'diagnostic',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    scholarDays: (Game.state.scholar || {}).day || 0, scholarDead,
    deaths,
    // FULL WALL-METRIC KEY SET (numbers, every per-seed file):
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    vests: Math.max(hist.maxVests, end.vests || 0),
    exiled,
    occupation: occ,
    craft: {
      thresholds, firstLevelXp: l1Target,
      baselineXp, finalXp: finalCraft.xp, level: finalCraft.level,
      successions, segments: segments.map(sg => ({
        vid: sg.vid, startXp: sg.startXp, endXp: sg.endXp,
        accrued: sg.accrued, attributed: sg.attributed, nCalls: sg.nCalls,
        attributionPct: sg.attributionPct, approx: sg.approx, byClass: sg.byClass,
      })),
      totalAccrued, totalAttributed, attributionPct,
      sources: Object.keys(byClassAll).sort().map(k => ({ class: k, n: byClassAll[k] })),
      trajectory: traj,
      closestToL1: {
        bearerVid: bearerBest ? bearerBest.vid : null,
        maxXpReached: maxBearerXp, gapXp: Math.max(0, l1Target - maxBearerXp),
        bearerAccrued: bearerBestAccrued, multipleOfAccrual: gapMultiple(l1Target),
      },
      deepReserves: {
        kitIndex: kitInfo.deepIndex, window: kitInfo.window,
        first11Held, heldCraftKit, unheldBefore11, eligible,
        xpTargetForL5: deepXpTarget, gapXpToL5: Math.max(0, deepXpTarget - maxBearerXp),
        bearerAccrued: bearerBestAccrued, multipleOfAccrual: gapMultiple(deepXpTarget),
        structuralNote: 'max craft level is 5 (5 thresholds); deep_reserves needs >=6 of the first 11 held, so at least one off-road craft-kit grant is required even at L5',
      },
    },
    nCraftCalls: runCalls.length,
    craftVerbLines,
  };
  if (process.env.CRAFTXP_DEBUG_CALLS) {
    row.debugCalls = runCalls;
    row.debugSucc = succEvents;
  }
  try { Game.gainTrackXP = oGain || Game.gainTrackXP; } catch (e) {}
  try { if (oSay) Game.say = oSay; } catch (e) {}
  try { if (oMantle) Game.mantleBecome = oMantle; } catch (e) {}
  const outDir = process.env.PERSEED_DIR;
  if (outDir && !detOff) {
    try {
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, `craftxp-${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
    } catch (e) {}
  }
  return row;
}

function canonicalFingerprint(row) {
  // Trajectory identity: everything the engine decided, none of the
  // instrument's own observations.
  return JSON.stringify({
    seed: row.seed, policy: row.policy, days: row.days, gameDays: row.gameDays,
    endReason: row.endReason, scholarDays: row.scholarDays, scholarDead: row.scholarDead,
    deaths: row.deaths, won: row.won, waveReach: row.waveReach, maxArc: row.maxArc,
    maxRank: row.maxRank, national: row.national, table: row.table, exiled: row.exiled,
    occupation: row.occupation, craftFinal: { xp: row.craft.finalXp, level: row.craft.level },
    craftTrajectory: row.craft.trajectory,
  });
}

async function main() {
  const seeds = (process.env.SEEDS || '1601,1602,1603,1604,1605,1606,1607,1608').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const detOff = process.env.DETGATE_OFF === '1';
  console.log(`craftxp-20261016 census | FEASTSCALE_R13=${process.env.FEASTSCALE_R13 || '(unset)'} SEATDRIVE=${process.env.SEATDRIVE || '(unset)'} detOff=${detOff}`);
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days, detOff);
    rows.push(r);
    const c = r.craft;
    console.log(`[${r.policy} s${r.seed}] days=${r.days} end=${r.endReason} scholarDead=${r.scholarDead} ` +
      `craft=${c.level}L/${c.finalXp}xp (base ${c.baselineXp}, +${c.totalAccrued} over ${c.segments.length} bearer${c.segments.length === 1 ? '' : 's'}) attrib=${c.attributionPct}% ` +
      `occ=${r.occupation.id || '?'}(${r.occupation.craftLean}) srcs=${c.sources.map(s => s.class + ':' + s.n).join(',') || '-'} ` +
      `first11Held=${c.deepReserves.first11Held} eligibleDR=${c.deepReserves.eligible} ` +
      `won=${r.won} wave=${r.waveReach} rank=${r.maxRank} nat=${r.national} table=${r.table} exiled=${r.exiled}`);
  }
  // aggregate
  const n = rows.length;
  const agg = {
    instrument: 'craftxp-20261016', n, seeds, policies: pids, days,
    substrate: { FEASTSCALE_R13: process.env.FEASTSCALE_R13 || null, SEATDRIVE: process.env.SEATDRIVE || null },
    craft: {
      meanAccrued: +(rows.reduce((t, r) => t + r.craft.totalAccrued, 0) / n).toFixed(2),
      medianAccrued: median(rows.map(r => r.craft.totalAccrued)),
      meanAttributionPct: +(rows.reduce((t, r) => t + r.craft.attributionPct, 0) / n).toFixed(1),
      minAttributionPct: Math.min(...rows.map(r => r.craft.attributionPct)),
      levelsReached: rows.map(r => r.craft.level),
      nLeveled: rows.filter(r => r.craft.level >= 1).length,
      nSuccessions: rows.reduce((t, r) => t + r.craft.successions, 0),
      sources: sumSources(rows),
      occupations: rows.map(r => ({ seed: r.seed, policy: r.policy, occ: r.occupation.id, craftLean: r.occupation.craftLean, finalXp: r.craft.finalXp })),
      closestToL1: closest(rows, r => r.craft.closestToL1),
      closestToDeepL5: closest(rows, r => r.craft.deepReserves),
      nEligibleDR: rows.filter(r => r.craft.deepReserves.eligible).length,
    },
    wall: {
      national: rows.reduce((t, r) => t + r.national, 0),
      table: rows.reduce((t, r) => t + r.table, 0),
      wins: rows.reduce((t, r) => t + r.won, 0),
      exiled: rows.reduce((t, r) => t + r.exiled, 0),
      wave45: rows.reduce((t, r) => t + r.wave45, 0),
      maxWave: Math.max(...rows.map(r => r.waveReach)),
      medianDays: median(rows.map(r => r.days)),
      maxDays: Math.max(...rows.map(r => r.days)),
      deathCauses: sumDeaths(rows),
    },
  };
  const outDir = process.env.PERSEED_DIR;
  if (outDir && !detOff) {
    try { fs.writeFileSync(path.join(outDir, 'craftxp-summary-20261016.json'), JSON.stringify(agg, null, 1)); } catch (e) {}
  }
  console.log('\nAGGREGATE craft: meanAccrued=' + agg.craft.meanAccrued + ' medianAccrued=' + agg.craft.medianAccrued +
    ' meanAttrib=' + agg.craft.meanAttributionPct + '% nLeveled=' + agg.craft.nLeveled + '/' + n +
    ' eligibleDR=' + agg.craft.nEligibleDR + '/' + n);
  console.log('AGGREGATE wall: national=' + agg.wall.national + ' table=' + agg.wall.table + ' wins=' + agg.wall.wins +
    ' exiled=' + agg.wall.exiled + ' wave45=' + agg.wall.wave45 + ' maxWave=' + agg.wall.maxWave +
    ' medianDays=' + agg.wall.medianDays + ' maxDays=' + agg.wall.maxDays);
  console.log('SOURCES: ' + Object.entries(agg.craft.sources).map(([k, v]) => k + '=' + v).join(' '));
  return rows;
}

function median(a) { const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function sumSources(rows) { const o = {}; for (const r of rows) for (const s of r.craft.sources) o[s.class] = (o[s.class] || 0) + s.n; return o; }
function sumDeaths(rows) { const o = {}; for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) o[k] = (o[k] || 0) + v; return o; }
function closest(rows, f) {
  let best = null;
  for (const r of rows) {
    const c = f(r);
    const gap = c.gapXp != null ? c.gapXp : c.gapXpToL5;
    if (best == null || gap < best.gapXp) best = { policy: r.policy, seed: r.seed, gapXp: gap, multipleOfAccrual: c.multipleOfAccrual, maxXpReached: c.maxXpReached };
  }
  return best;
}

if (require.main === module) {
  main().then(rows => {
    if (process.env.FINGERPRINT_OUT) {
      fs.writeFileSync(process.env.FINGERPRINT_OUT, rows.map(canonicalFingerprint).join('\n') + '\n');
    }
  }).catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { classifyCraftWhy, craftKitInfo, canonicalFingerprint, buildSegments, isPlayerSideCall };
