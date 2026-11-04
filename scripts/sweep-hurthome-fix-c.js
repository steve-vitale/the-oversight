'use strict';
// sweep-hurthome-fix-c.js — hurt-aware turn-home rule, EVENT-based
// re-judgement (sim-hurthome-fix-c, oversight-flesh-out-loop, run
// fleshout-20261104T1220Z, axis food-economy). The dawn census of
// fix-a collapsed because the rule fires intra-day; this sweep
// instruments from hurt EVENTS instead (see prereg
// evidence/2026-11-04/sim-hurthome-fix-c-prereg.md, binding).
//
// Case lifecycle (scripts/hurthome-b-lib.js): a case opens when a
// ledger-away villager is observed alive-and-hurt (hp 1..7) via the
// hurtVillager post-wrapper or the per-part scan net (catches
// direct-write hurts and hurts-before-departure still hurt while
// away). Cases close at travel ticks (returned-hurt/healed/unknown),
// at death (died), at a part scan showing hp > 7 while still away
// (healed-away), or at run end (censored). One case per villager at
// a time; a healed interval breaks continuity.
// Cells differ by exactly one game commit (the fix). The sweep
// refuses to run a cell against the wrong game code (CELL=armed
// requires shouldHurtReturn; CELL=baseline forbids it).
//
// Derived from scripts/sweep-hurthome-fix-b.js (harness/policy/runDays
// pattern, writeRobust, env gates). Seed band 98701-98716 is fresh
// for this instrument.
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const lib = require('./hurthome-b-lib');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
  process.exit(2);
}
const PILOT = [98701, 98702, 98703, 98704, 98705, 98706, 98707, 98708];
const CONFIRM = [98709, 98710, 98711, 98712, 98713, 98714, 98715, 98716];
const SEEDS = (process.env.SEEDS || '')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const CELL = (process.env.CELL || 'baseline').toLowerCase();
if (CELL !== 'baseline' && CELL !== 'armed') {
  console.error('FATAL: CELL must be baseline or armed, got: ' + (process.env.CELL || '(unset)'));
  process.exit(2);
}
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!isList(PILOT) && !isList(CONFIRM)) {
  console.error('FATAL: seeds must be exactly PILOT 98701-98708 or CONFIRM 98709-98716, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 100) {
  console.error('FATAL: DAYS must be exactly 100, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-04', 'perseed-hurthome-fix-c', 'sweep-' + CELL + '.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-04', 'perseed-hurthome-fix-c');

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
  const { Game } = await loadGame({ seed, mode: 'hurthome-fix-c-competent', fullTelemetry: false });
  await setupGame(Game);
  // Cell/code guard: refuse to run a cell against the wrong game code.
  const hasFix = typeof Game.shouldHurtReturn === 'function';
  if (CELL === 'armed' && !hasFix) {
    console.error('FATAL: CELL=armed but Game.shouldHurtReturn is missing — fix not applied');
    process.exit(2);
  }
  if (CELL === 'baseline' && hasFix) {
    console.error('FATAL: CELL=baseline but Game.shouldHurtReturn exists — fix still applied');
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
  const openCase = (vid, day, part, source, cause, dmg) => {
    try {
      const v = village();
      const aw = (v.away || {})[vid] || null;
      const hp = hpOf(vid);
      const r = lib.hurtStep(W.open, vid, day, part, aw, hp, { source, cause, dmg });
      if (r.action === 'opened') { r.case.name = firstName(vid); }
      return r;
    } catch (e) { W.errors.push('openCase: ' + (e && e.message)); return null; }
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
          W.cases.push(c);
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
        W.preTravelHp[vid] = { hp: (v.health || {})[vid], purpose: (v.away[vid] || {}).purpose || null };
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
        // hpAfter 0 / dead: the registerDeath wrapper already closed any
        // open case; a lethal hurt never opens a new case.
      }
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
        const c = lib.closeDied(W.open, whoId, day, Game.dayPart || 0, cause, null);
        if (c) { c.name = c.name || firstName(whoId); W.cases.push(c); }
      }
      if (whoId) W.deaths.push({ day, who: whoId, cause });
    } catch (e) { W.errors.push('deathPre: ' + (e && e.message)); }
    return oDie.apply(this, arguments);
  };

  // Transcript capture (bounded): away-voice hurt lines, return lines,
  // and any line naming a villager with a case open right now.
  // RETRO-OPEN (fix-c coverage fix, ordered by fix-b's metric review):
  // when a hurt-return line fires for a villager with NO open case,
  // the line itself is the event record — open a retrospective case
  // at this tick so the travel scan closes it returned-hurt (latency
  // 0). Only during a travel tick (awayBeforeTravel populated) and
  // never for a LEAVE purpose (preTravelHp purpose check in lib).
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
                if (r.action === 'opened') W.retroOpened += 1;
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
        if (c) { c.name = c.name || c0.name || firstName(vid); W.cases.push(c); }
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

  for (const c of W.cases) {
    c.latencyParts = lib.latencyParts(c);
    if (c.outcome === 'returned-hurt' && (c.latencyParts == null || c.latencyParts < 0)) W.errors.push('badLatency:' + c.vid);
  }
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const perSeed = { seed, cell: CELL, policy: 'competent', plentydepri: 1, depositgate: 1,
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
    writeRobust(path.join(PERSEED_DIR, `hurthome-fix-c-competent-s${s}-${CELL}.json`), JSON.stringify(perSeed));
    console.log(`done seed=${s} cell=${CELL} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathCount} cases=${diag.caseCount} hurtMealLines=${diag.hurtMealLineCount} hurtReturnLines=${diag.hurtReturnLineCount} retroOpened=${diag.retroOpened} transcript=${diag.transcriptLines} errors=${diag.errorCount} won=${perSeed.win} (${diag.ms}ms)`);
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
    writeRobust(OUT, JSON.stringify({ meta: { cell: CELL, policy: 'competent', days: DAYS, seeds: merged.map((r) => r.seed), env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
    console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
  }
})().catch((e) => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, PILOT, CONFIRM, DAYS };
