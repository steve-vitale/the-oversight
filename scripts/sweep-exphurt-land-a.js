'use strict';
// sweep-exphurt-land-a.js — EXPHURT LAND hook-armed re-run on the
// matched 24-seed band (sim-exphurt-land-a, oversight-flesh-out-loop,
// run fleshout-20261104T1933Z, axis food-economy). Identical instrument
// to scripts/sweep-exphurt-24-a.js except the corpus directory, the
// per-seed filename prefix, and the fixed closing-part capture
// (exphurt-land-a-lib: description-form returns like Bill s99946 are
// captured by template/emoji fallback, not by name form alone). The
// game code under test is current master PLUS the hurt-clause hook
// in expeditionReturn — the sweep refuses to run without
// Game.shouldHurtReturn, as before, and the hook proof test (not this
// sweep) proves the hook itself. Single cell: current master,
// which MUST include
// the landed hurthome fix (Game.shouldHurtReturn) — the sweep refuses
// to run without it, so a baseline/master mix-up fails loudly instead
// of silently measuring the wrong game.
//
// Adapted from scripts/sweep-hurthome-fix-c.js (event instrument, NOT
// a dawn census — warning #1697): cases open on hurt EVENTS
// (hurtVillager post-wrapper + per-part scan net), close at travel
// ticks. Added here: per-case expedition-clock snapshots
// (st.exped duration vs v.away duration) and closing-part return-line
// capture, so the disconnect prevalence (D) and the return-line
// metrics (M1/M2/M3) in the prereg are measured off the same cases.
// Exped snapshots read the raw village.agency record — agencyState()
// is deliberately NOT called (it mutates/initializes state).
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const lib = require('./hurthome-b-lib');
const exlib = require('./exphurt-a-lib');
const landLib = require('./exphurt-land-a-lib');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
  process.exit(2);
}
const BAND = [99933, 99934, 99935, 99936, 99937, 99938, 99939, 99940, 99941, 99942, 99943, 99944, 99945, 99946, 99947, 99948, 99949, 99950, 99951, 99952, 99953, 99954, 99955, 99956];
const SEEDS = (process.env.SEEDS || '')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
function validateSeeds(candidate) { return candidate.length === BAND.length && candidate.every((s, i) => s === BAND[i]); }
if (!validateSeeds(SEEDS)) {
  console.error('FATAL: seeds must be exactly BAND 99933-99956, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 100) {
  console.error('FATAL: DAYS must be exactly 100, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-04', 'perseed-exphurt-land-a', 'sweep-exphurt-land-a.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-04', 'perseed-exphurt-land-a');

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
  const { Game } = await loadGame({ seed, mode: 'exphurt-land-a-competent', fullTelemetry: false });
  await setupGame(Game);
  // Game-code guard: this census is defined on post-hurthome-fix master.
  if (typeof Game.shouldHurtReturn !== 'function') {
    console.error('FATAL: Game.shouldHurtReturn missing — not post-hurthome-fix master, refusing');
    process.exit(2);
  }
  const W = {
    open: new Map(), cases: [], deaths: [], hurtMealLines: [],
    transcript: [], errors: [], awayBeforeTravel: null, preTravelHp: {},
    hurtReturnLineCount: 0, retroOpened: 0,
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
  const hpOf = (vid) => {
    const v = village();
    return (v.health && v.health[vid] !== undefined) ? v.health[vid] : null;
  };
  // Raw read only (never agencyState(): it initializes/mutates).
  // Returns {present, duration, legs, encountersHurt} with nulls when
  // no expedition record exists for the villager.
  const expedSnap = (vid) => {
    try {
      const v = village();
      const ex = ((v.agency || {}).exped || {})[vid] || null;
      if (!ex) return { present: false, duration: null, legs: null, encountersHurt: null };
      return {
        present: true,
        duration: (ex.duration != null ? ex.duration : null),
        legs: (ex.legs != null ? ex.legs : null),
        encountersHurt: Array.isArray(ex.encounters) ? ex.encounters.includes('hurt') : null,
      };
    } catch (e) { W.errors.push('expedSnap: ' + (e && e.message)); return { present: false, duration: null, legs: null, encountersHurt: null }; }
  };
  const playerAtHavenNow = () => {
    try {
      const v = village();
      const hx = v.px ?? 4, hy = v.py ?? 4;
      return Game.map && Game.map.px === hx && Game.map.py === hy;
    } catch (e) { W.errors.push('playerAtHaven: ' + (e && e.message)); return null; }
  };
  const attachSnap = (c, snap) => {
    if (!c) return;
    if (c.expedDurationAtOpen == null) {
      c.expedDurationAtOpen = snap.duration;
      c.expedLegsAtOpen = snap.legs;
      c.expedEncountersHurtAtOpen = snap.encountersHurt;
      c.expedPresentAtOpen = snap.present;
    }
    c.expedDurationAtLastHurt = snap.duration;
    c.expedLegsAtLastHurt = snap.legs;
    c.expedEncountersHurtAtLastHurt = snap.encountersHurt;
  };
  const openCase = (vid, day, part, source, cause, dmg) => {
    try {
      const v = village();
      const aw = (v.away || {})[vid] || null;
      const hp = hpOf(vid);
      const r = lib.hurtStep(W.open, vid, day, part, aw, hp, { source, cause, dmg });
      if (r.action === 'opened') { r.case.name = firstName(vid); attachSnap(r.case, expedSnap(vid)); }
      else if (r.action === 'counted') { attachSnap(r.case, expedSnap(vid)); }
      return r;
    } catch (e) { W.errors.push('openCase: ' + (e && e.message)); return null; }
  };
  const attachClose = (c) => {
    if (!c) return c;
    c.playerAtHavenAtClose = playerAtHavenNow();
    c.closingLines = exlib.closingReturnLines(W.transcript, c.closeDay, c.closePart, c.name || firstName(c.vid));
    return c;
  };

  // Return scan + scan net: after npcNodeTravel each part.
  const travelScan = () => {
    try {
      const v = village();
      const now = (v.away || {});
      const before = W.awayBeforeTravel || {};
      for (const vid of Object.keys(before)) {
        if (now[vid]) continue;
        if (!W.open.has(vid)) continue;
        const pre = (W.preTravelHp || {})[vid];
        const c = lib.closeReturned(W.open, vid, scholarDay(), Game.dayPart || 0,
          (pre ? pre.hp : null), null);
        if (c) {
          c.name = c.name || firstName(vid);
          if (lib.latencyParts(c) != null && lib.latencyParts(c) < 0) W.errors.push('negativeLatency:' + vid);
          W.cases.push(attachClose(c));
        }
      }
      // Scan net: heal closes, dead closes, new scan cases.
      for (const vid of Object.keys(now)) {
        try {
          const hp = hpOf(vid);
          if (W.open.has(vid)) {
            if (hp != null && hp > 7) {
              const c = lib.closeHealed(W.open, vid, scholarDay(), Game.dayPart || 0, hp);
              if (c) { c.name = c.name || firstName(vid); W.cases.push(c); }
            } else if (hp === 0) {
              const c = lib.closeDied(W.open, vid, scholarDay(), Game.dayPart || 0, 'scan-dead', null);
              if (c) { c.name = c.name || firstName(vid); W.cases.push(c); }
            }
          } else if (lib.isHurtHp(hp)) {
            openCase(vid, scholarDay(), Game.dayPart || 0, 'scan', 'scan-crossing', null);
          }
        } catch (e) { W.errors.push('scanNet: ' + (e && e.message)); }
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
      W.preTravelHp = {};
      for (const vid of Object.keys(v.away || {})) {
        W.awayBeforeTravel[vid] = true;
        W.preTravelHp[vid] = { hp: (v.health || {})[vid], purpose: (v.away[vid] || {}).purpose || null, duration: (v.away[vid] || {}).duration ?? null };
      }
    } catch (e) { W.errors.push('travelPre: ' + (e && e.message)); }
    const ret = oTravel.apply(this, arguments);
    try { travelScan(); } catch (e) { W.errors.push('travelPost: ' + (e && e.message)); }
    return ret;
  };

  const oHurt = Game.hurtVillager;
  if (typeof oHurt === 'function') Game.hurtVillager = function (vid, dmg, cause, settlement, damageContext) {
    let ret = null;
    try { ret = oHurt.apply(this, arguments); } catch (e) { throw e; }
    try {
      const v = village();
      const aw = (v.away || {})[vid] || null;
      if (aw) {
        const hpAfter = (v.health && v.health[vid] !== undefined) ? v.health[vid] : null;
        if (lib.isHurtHp(hpAfter)) openCase(vid, scholarDay(), Game.dayPart || 0, 'hurtVillager', String(cause || '?').slice(0, 32), Math.round(dmg || 0));
      }
    } catch (e) { W.errors.push('hurtPost: ' + (e && e.message)); }
    return ret;
  };

  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const whoId = String((opts && (opts.villagerId || '')) || '');
      const cause = String((opts && (opts.cause) || '?')).slice(0, 64);
      const day = scholarDay();
      if (whoId && W.open.has(whoId)) {
        const c = lib.closeDied(W.open, whoId, day, Game.dayPart || 0, cause, null);
        if (c) { c.name = c.name || firstName(whoId); W.cases.push(c); }
      }
      if (whoId) W.deaths.push({ day, who: whoId, cause });
    } catch (e) { W.errors.push('deathPre: ' + (e && e.message)); }
    return oDie.apply(this, arguments);
  };

  // Transcript capture (bounded): away-voice hurt lines, return lines,
  // and any line naming a villager with a case open right now.
  // RETRO-OPEN (from fix-c): when a hurt-return line fires for a
  // villager with NO open case, the line itself is the event record.
  // At retro time the away record is already deleted (base travel
  // deletes before saying) but the exped record still exists
  // (agencyTick runs after), so the snapshot below is still valid;
  // awayDuration is restored from the pre-travel snapshot.
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (t) {
        const retro = t.match(/returns from the wilds hurt \(health (\d+)\/100\)/);
        if (retro) {
          W.hurtReturnLineCount += 1;
          const hp = parseInt(retro[1], 10);
          const nm = t.match(/🧭\s+(\S+)/);
          if (nm) {
            for (const vid of Object.keys(W.awayBeforeTravel || {})) {
              if (firstName(vid) === nm[1]) {
                const pre = (W.preTravelHp || {})[vid];
                const r = lib.retroCase(W.open, vid, scholarDay(), Game.dayPart || 0,
                  pre ? pre.purpose : null, hp, firstName(vid));
                if (r.action === 'opened') {
                  W.retroOpened += 1;
                  if (pre && pre.duration != null) r.case.awayDuration = pre.duration;
                  attachSnap(r.case, expedSnap(vid));
                }
                break;
              }
            }
          }
        }
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

  const policy = Object.assign({}, competent);
  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  // Final scan: returns after the last travel tick, deaths the death
  // wrapper missed, and still-open cases censored at run end.
  try {
    const v = village();
    for (const vid of [...W.open.keys()]) {
      const c0 = W.open.get(vid);
      if (!(v.away || {})[vid]) {
        const hp = hpOf(vid);
        const c = lib.closeReturned(W.open, vid, scholarDay(), Game.dayPart || 0, hp, 'finalScanReturn');
        if (c) { c.name = c.name || c0.name || firstName(vid); W.cases.push(attachClose(c)); }
        continue;
      }
      let dead = false;
      try {
        const p = (Game.data.villagers || []).find((x) => x.id === vid)
          || (Game.data.background_survivors || []).find((x) => x.id === vid);
        if (p && p.dead) dead = true;
      } catch (e) { W.errors.push('finalDead: ' + (e && e.message)); }
      const hp = hpOf(vid);
      if (dead || hp === 0) {
        const c = lib.closeDied(W.open, vid, scholarDay(), Game.dayPart || 0, 'finalScan-dead', 'finalScanDead');
        if (c) { c.name = c.name || c0.name || firstName(vid); W.cases.push(c); }
      }
    }
    const rest = lib.closeCensored(W.open, scholarDay(), Game.dayPart || 0);
    for (const c of rest) { c.name = c.name || firstName(c.vid); W.cases.push(c); }
  } catch (e) { W.errors.push('finalScan: ' + (e && e.message)); }

  // (exphurt-land-a) FIXED CAPTURE: re-derive closing lines from the
  // full transcript (template/emoji fallback for description-form
  // returns) BEFORE writing, so the stored corpus is already fixed.
  // The analyzer recomputes the same function and asserts identity.
  try {
    const fixedCases = landLib.fixedClosingLinesForSeed(W.cases, W.transcript);
    for (const fc of fixedCases) {
      if (typeof fc.outcome === 'string' && fc.outcome.indexOf('returned') === 0) fc.closingLines = fc.fixedClosingLines;
    }
    W.cases = fixedCases;
  } catch (e) { W.errors.push('fixedCapture: ' + (e && e.message)); }

  for (const c of W.cases) {
    c.latencyParts = lib.latencyParts(c);
    if (c.outcome === 'returned-hurt' && (c.latencyParts == null || c.latencyParts < 0)) W.errors.push('badLatency:' + c.vid);
  }
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const perSeed = { seed, policy: 'competent', plentydepri: 1, depositgate: 1,
    daysAlive: result.days, endReason: result.endReason,
    rank, national: /national|global/i.test(rank) || !!((Game.state || {}).nationalLive),
    table: won, win: won, maxWave,
    waveReach: Array.from({ length: maxWave }, (_, i) => i + 1),
    cases: W.cases, caseCount: W.cases.length,
    hurtReturnLineCount: W.hurtReturnLineCount, retroOpened: W.retroOpened,
    retroCaseCount: W.cases.filter((c) => c.source === 'retro-line').length,
    hurtMealLineCount: W.hurtMealLines.length, hurtMealLines: W.hurtMealLines,
    deaths: W.deaths, transcript: W.transcript, errors: W.errors };
  const diag = { endReason: result.endReason, rank, maxWave, ms,
    caseCount: W.cases.length,
    hurtMealLineCount: W.hurtMealLines.length,
    hurtReturnLineCount: W.hurtReturnLineCount, retroOpened: W.retroOpened,
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
    writeRobust(path.join(PERSEED_DIR, `exphurt-land-a-competent-s${s}.json`), JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathCount} cases=${diag.caseCount} hurtMealLines=${diag.hurtMealLineCount} hurtReturnLines=${diag.hurtReturnLineCount} retroOpened=${diag.retroOpened} transcript=${diag.transcriptLines} errors=${diag.errorCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  {
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
    writeRobust(OUT, JSON.stringify({ meta: { policy: 'competent', days: DAYS, seeds: merged.map((r) => r.seed), env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
    console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
  }
})().catch((e) => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BAND, validateSeeds, DAYS };
