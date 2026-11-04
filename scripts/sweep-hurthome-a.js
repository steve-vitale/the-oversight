'use strict';
// sweep-hurthome-a.js — hurt-traveler turn-home behavior DIAG
// (sim-hurthome-a, oversight-flesh-out-loop, run fleshout-20261104T0545Z,
// axis food-economy; behavior half of sim-findings travel/health #1720,
// left open by Loop B 2130Z sim-hurttraveler-b, which closed narration
// only.) DIAG ONLY: zero src/js, zero policy change.
//
// QUESTION: when a villager is hurt (hp <= 7, the awayHungerVoice gate)
// at dawn while ledger-away (v.away[vid] present, regardless of node
// distance), do they turn home — same day, next day, after >= 3 days
// out — or die away? Returns are clock-only in code (npcNodeTravel:
// partsAway >= away.duration; no health check anywhere on the return
// path), so this census measures what the clock rule produces.
//
// INSTRUMENT ONLY: every wrapper reads and calls through. No RNG is
// consumed, no game value is changed, no Math.random is read.
// Dawn = endDay post-call with dayPart === 0 (game.js endDay ends
// "— DAY N DAWN —" with dayPart = 0; DAY_PARTS[0] === 'dawn').
// Returns are caught by a post-npcNodeTravel scan (the return branch
// runs inside npcNodeTravel, BEFORE endDay rolls the day — scanning
// after advancePart would misdate night returns by +1 day).
// Deaths are caught by a PRE-call registerDeath wrapper (expedDeath
// deletes v.away after registerDeath, so the away state must be read
// before the original call).
//
// Derived from scripts/sweep-hurttraveler-b.js (harness/policy/runDays
// pattern, writeRobust, env gates).
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const lib = require('./hurthome-a-lib');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
  process.exit(2);
}
const PILOT = [97101, 97102, 97103, 97104, 97105, 97106, 97107, 97108];
const EXPANSION = [97109, 97110, 97111, 97112, 97113, 97114, 97115, 97116];
const SEEDS = (process.env.SEEDS || '')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DETERMINISM = process.env.DETERMINISM === '1';
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!DETERMINISM && !isList(PILOT) && !isList(EXPANSION)) {
  console.error('FATAL: seeds must be exactly PILOT 97101-97108 or EXPANSION 97109-97116, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
if (DETERMINISM && !(SEEDS.length === 1 && SEEDS[0] === 97101)) {
  console.error('FATAL: determinism leg allows only seed 97101, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 100) {
  console.error('FATAL: DAYS must be exactly 100, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-04', 'perseed-hurthome-a', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-04', 'perseed-hurthome-a');

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 300; i++) {
    try {
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      const t0 = performance.now(); while (performance.now() - t0 < 2000) { /* retry backoff */ }
    }
  }
}

const trunc = (t) => String(t == null ? '' : t).slice(0, 300);

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'hurthome-a-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    open: new Map(), episodes: [], deaths: [], hurtMealLines: [],
    transcript: [], errors: [], lastHurt: {}, lastDawnDay: null,
    awayBeforeTravel: null, dawnSamples: 0,
  };
  const village = () => (Game.state || {}).village || {};
  const scholarDay = () => ((Game.state || {}).scholar || {}).day || 0;
  const firstName = (vid) => {
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (p && p.name) return String(p.name).split(' ')[0];
    } catch (e) { W.errors.push('firstName: ' + (e && e.message)); }
    return 'Someone';
  };
  const hurtTimingFor = (vid, aw) => {
    const lh = W.lastHurt[vid] || null;
    if (!lh || !aw) return { lastHurt: lh, hurtTiming: (lh ? 'no-away-record' : null) };
    const lhParts = (lh.day - (aw.sinceDay || lh.day)) * 4 + (lh.part - (aw.sincePart || 0));
    return { lastHurt: lh, hurtTiming: lhParts < 0 ? 'before-departure' : 'while-away' };
  };

  // Dawn sample: after endDay, new day at dayPart 0.
  const dawnSample = () => {
    try {
      const day = scholarDay();
      if (Game.dayPart !== 0) return;
      if (W.lastDawnDay === day) return;
      W.lastDawnDay = day;
      W.dawnSamples += 1;
      const v = village();
      for (const vid of (v.roster || [])) {
        const aw = (v.away || {})[vid] || null;
        if (!aw) continue;
        try {
          const vp = Game.vpOf ? Game.vpOf(vid) : null;
          if (vp && vp.dead) continue;
        } catch (e) { W.errors.push('dawnDead: ' + (e && e.message)); }
        const hp = (v.health && v.health[vid] !== undefined) ? v.health[vid] : null;
        let expedDuration = null;
        try {
          const st = Game.agencyState ? Game.agencyState() : null;
          const ex = st && st.exped ? st.exped[vid] : null;
          if (ex) expedDuration = ex.duration ?? null;
        } catch (e) { W.errors.push('agencyState: ' + (e && e.message)); }
        const { lastHurt, hurtTiming } = hurtTimingFor(vid, aw);
        const r = lib.dawnStep(W.open, vid, day, aw, hp, { lastHurt, hurtTiming, expedDuration });
        if (r.action === 'opened') {
          r.episode.name = firstName(vid);
          r.episode.partsLeftAtOpen = (aw.duration || 4) - ((day - (aw.sinceDay || day)) * 4 + (0 - (aw.sincePart || 0)));
        }
      }
    } catch (e) { W.errors.push('dawnSample: ' + (e && e.message)); }
  };

  // Return scan: after npcNodeTravel, before endDay can roll the day.
  const travelScan = () => {
    try {
      const v = village();
      const now = (v.away || {});
      const before = W.awayBeforeTravel || {};
      for (const vid of Object.keys(before)) {
        if (now[vid]) continue;
        // Away record gone. If the episode was already closed by the
        // death wrapper this part, this is expedDeath cleanup, not a
        // return. Otherwise it is a return (return branch, any part).
        if (!W.open.has(vid)) continue;
        const ep = lib.closeReturned(W.open, vid, scholarDay(), Game.dayPart || 0);
        if (ep) {
          ep.name = ep.name || firstName(vid);
          W.episodes.push(ep);
        }
      }
      W.awayBeforeTravel = {};
      for (const vid of Object.keys(now)) W.awayBeforeTravel[vid] = true;
    } catch (e) { W.errors.push('travelScan: ' + (e && e.message)); }
  };

  const oTravel = Game.npcNodeTravel;
  if (typeof oTravel === 'function') Game.npcNodeTravel = function () {
    try {
      const v = village();
      W.awayBeforeTravel = {};
      for (const vid of Object.keys(v.away || {})) W.awayBeforeTravel[vid] = true;
    } catch (e) { W.errors.push('travelPre: ' + (e && e.message)); }
    const ret = oTravel.apply(this, arguments);
    try { travelScan(); } catch (e) { W.errors.push('travelPost: ' + (e && e.message)); }
    return ret;
  };

  const oEndDay = Game.endDay;
  if (typeof oEndDay === 'function') Game.endDay = function () {
    const ret = oEndDay.apply(this, arguments);
    try { dawnSample(); } catch (e) { W.errors.push('endDayPost: ' + (e && e.message)); }
    return ret;
  };

  const oHurt = Game.hurtVillager;
  if (typeof oHurt === 'function') Game.hurtVillager = function (vid, dmg, cause, settlement, damageContext) {
    let ret = null;
    try { ret = oHurt.apply(this, arguments); } catch (e) { throw e; }
    try {
      const v = village();
      const hpAfter = (v.health && v.health[vid] !== undefined) ? v.health[vid] : null;
      W.lastHurt[vid] = { day: scholarDay(), part: Game.dayPart || 0,
        cause: String(cause || '?').slice(0, 32), dmg: Math.round(dmg || 0), hpAfter };
    } catch (e) { W.errors.push('hurtPost: ' + (e && e.message)); }
    return ret;
  };

  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const whoId = String((opts && (opts.villagerId || '')) || '');
      const cause = String((opts && opts.cause) || '?').slice(0, 64);
      const day = scholarDay();
      if (whoId && W.open.has(whoId)) {
        const ep = lib.closeDied(W.open, whoId, day, Game.dayPart || 0, cause);
        if (ep) { ep.name = ep.name || firstName(whoId); W.episodes.push(ep); }
      }
      if (whoId) W.deaths.push({ day, who: whoId, cause });
    } catch (e) { W.errors.push('deathPre: ' + (e && e.message)); }
    return oDie.apply(this, arguments);
  };

  // Transcript capture (bounded): away-voice hurt lines, return lines,
  // and any line naming a villager with an episode open right now.
  // Say-time dayPart: 0 dawn, 1 midday, 2 dusk, 3 night.
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (t) {
        const isVoice = /away from the haven/i.test(t) && /hurt/i.test(t);
        const isReturn = /returns from|is back from|came back/i.test(t);
        let namesHit = false;
        if (!isVoice && !isReturn) {
          for (const vid of W.open.keys()) {
            const fn = firstName(vid);
            if (fn !== 'Someone' && t.indexOf(fn) !== -1) { namesHit = true; break; }
          }
        }
        if (isVoice || isReturn || namesHit) {
          W.transcript.push({ day: scholarDay(), part: Game.dayPart || 0, line: trunc(t) });
          if (isVoice) W.hurtMealLines.push({ day: scholarDay(), part: Game.dayPart || 0, line: trunc(t) });
        }
      }
    } catch (e) { W.errors.push('say: ' + (e && e.message)); }
    return oSay.apply(this, arguments);
  };

  // Opening dawn (day 7, dayPart 0 at setup): no one can be away yet,
  // but the sample anchors lastDawnDay so the first endDay dawn is new.
  try { dawnSample(); } catch (e) { W.errors.push('openDawn: ' + (e && e.message)); }

  const policy = Object.assign({}, competent);
  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  // Final scan: any return after the last npcNodeTravel, and any
  // still-open episode whose villager is in fact dead (death path
  // that bypassed registerDeath) or gone from the roster.
  try {
    const v = village();
    for (const vid of [...W.open.keys()]) {
      const ep = W.open.get(vid);
      if (!(v.away || {})[vid]) {
        const closed = lib.closeReturned(W.open, vid, scholarDay(), Game.dayPart || 0);
        if (closed) { closed.censorNote = 'finalScanReturn'; W.episodes.push(closed); }
        continue;
      }
      let dead = false;
      try {
        const p = (Game.data.villagers || []).find((x) => x.id === vid)
          || (Game.data.background_survivors || []).find((x) => x.id === vid);
        if (p && p.dead) dead = true;
      } catch (e) { W.errors.push('finalDead: ' + (e && e.message)); }
      const hp = (v.health && v.health[vid] !== undefined) ? v.health[vid] : null;
      if (dead || hp === 0) {
        const closed = lib.closeDied(W.open, vid, scholarDay(), Game.dayPart || 0, 'finalScan-dead');
        if (closed) { closed.censorNote = 'finalScanDead'; W.episodes.push(closed); }
      }
    }
    const rest = lib.closeCensored(W.open, scholarDay());
    for (const ep of rest) { ep.name = ep.name || firstName(ep.vid); W.episodes.push(ep); }
  } catch (e) { W.errors.push('finalScan: ' + (e && e.message)); }

  for (const ep of W.episodes) ep.bucket = lib.classifyEpisode(ep);
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const perSeed = { seed, policy: 'competent', plentydepri: 1, depositgate: 1,
    daysAlive: result.days, endReason: result.endReason, dawnSamples: W.dawnSamples,
    rank, national: /national|global/i.test(rank) || !!((Game.state || {}).nationalLive),
    table: won, win: won, maxWave,
    waveReach: Array.from({ length: maxWave }, (_, i) => i + 1),
    episodes: W.episodes, episodeCount: W.episodes.length,
    hurtMealLineCount: W.hurtMealLines.length, hurtMealLines: W.hurtMealLines,
    deaths: W.deaths, transcript: W.transcript, errors: W.errors };
  const diag = { endReason: result.endReason, rank, maxWave, ms,
    episodeCount: W.episodes.length, hurtMealLineCount: W.hurtMealLines.length,
    deathCount: W.deaths.length, transcriptLines: W.transcript.length, errorCount: W.errors.length };
  return { seed, perSeed, diag };
}

if (require.main === module) (async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `hurthome-a-competent-s${s}.json`), JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathCount} episodes=${diag.episodeCount} hurtMealLines=${diag.hurtMealLineCount} transcript=${diag.transcriptLines} errors=${diag.errorCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  if (!DETERMINISM) {
    try { fs.mkdirSync(path.dirname(OUT), { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
    let merged = rows;
    try {
      if (fs.existsSync(OUT)) {
        const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
        const bySeed = new Map();
        for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
        for (const r of rows) bySeed.set(r.seed, r);
        merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
      }
    } catch (e) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
    writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: merged.map((r) => r.seed), env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
    console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
  }
})().catch((e) => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, PILOT, EXPANSION, DAYS };
