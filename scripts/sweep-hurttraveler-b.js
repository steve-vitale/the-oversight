#!/usr/bin/env node
// sweep-hurttraveler-b.js — hurt-traveler DIAG + before/after instrument
// (sim-hurttraveler-b, 2026-11-03, oversight-flesh-out-loop-b, axis
// food-economy; tracker blank 2, sim-findings #1720.)
//
// QUESTION: in sim corpora, ALL away-voice lines are the hurt-traveler
// full-meal template, and the line never explains WHY a villager at
// health 3-7 is still out instead of home. This instrument captures,
// at each awayHungerVoice firing, the TRUE state-derived reason they
// are still out: the away record's purpose + return clock (partsAway
// vs duration, from game.js npcNodeTravel's return branch), the
// objective/expedition state behind that record, and whether their
// last hurt landed BEFORE departure (heal-gate era) or WHILE away
// (no health check exists on the return path — verified by code read).
//
// INSTRUMENT ONLY: every wrapper reads and calls through. No RNG is
// consumed, no game value is changed, no Math.random is read. The same
// file runs the BASELINE cell and the ARMED cell on identical seeds —
// the only difference is the src/js under test. For a narration-only
// fix, armed per-seed JSONs must equal baseline with ONLY the voice
// line text differing (the analyzer's identity mode strips `line`).
//
// Derived from scripts/sweep-awayration2-b.js (harness/policy/runDays
// pattern, writeRobust, env gates). Declared deltas:
//   1. Seeds: PILOT 96101-96108 (shared with the awayration2 corpus so
//      the cited cases are comparable); DAYS exactly 100, death-aware
//      (runDays stops dead villages; +10d tail is the harness's own).
//   2. awayHungerVoice wrapper (NEW): full state snapshot at fire time.
//   3. hurtVillager wrapper (NEW): last-hurt record per vid, read-only.
//   4. say wrapper: hurt-traveler lines only, joined to the snapshot
//      taken synchronously inside awayHungerVoice (say is sync).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
  process.exit(2);
}
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const PILOT = [96101, 96102, 96103, 96104, 96105, 96106, 96107, 96108];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!isList(PILOT)) {
  console.error('FATAL: seeds must be exactly PILOT 96101-96108, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 100) {
  console.error('FATAL: DAYS must be exactly 100, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-03', 'perseed-hurttraveler-b', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-03', 'perseed-hurttraveler-b');

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
      const t0 = performance.now(); while (performance.now() - t0 < 2000) {}
    }
  }
}

const trunc = (t) => String(t == null ? '' : t).slice(0, 300);

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'hurttraveler-b-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = { hurtLines: [], lastHurt: {}, pendingSnap: null, deaths: [], deathSeen: new Set() };

  const snap = (vid, want, take) => {
    const v = (Game.state || {}).village || {};
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 0, part = Game.dayPart || 0;
    const aw = (v.away || {})[vid] || null;
    const hp = (v.health && v.health[vid] !== undefined) ? v.health[vid] : 100;
    let name = 'Someone';
    try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.name) name = p.name; } catch (e) {}
    let node = null, hx = v.px ?? 4, hy = v.py ?? 4;
    try { node = Game.npcNode ? Game.npcNode(vid) : null; } catch (e) {}
    let obj = null;
    try { const o = Game.objOf ? Game.objOf(vid) : null;
      if (o) obj = { kind: o.kind || null, purpose: o.purpose || null, state: o.state || null,
        partsLeft: (o.partsLeft != null ? o.partsLeft : null), tx: o.tx ?? null, ty: o.ty ?? null,
        targetVid: o.targetVid || null, companion: o.companion || null }; } catch (e) {}
    let exped = null;
    try { const st = Game.agencyState ? Game.agencyState() : null;
      const ex = st && st.exped ? st.exped[vid] : null;
      if (ex) exped = { legs: ex.legs ?? null, duration: ex.duration ?? null,
        encounters: (ex.encounters || []).slice(-3), finds: (ex.finds || []).length }; } catch (e) {}
    let partsAway = null, partsLeft = null;
    if (aw) {
      partsAway = (day - (aw.sinceDay || day)) * 4 + (part - (aw.sincePart || 0));
      partsLeft = (aw.duration || 4) - partsAway;
    }
    const lh = W.lastHurt[vid] || null;
    let hurtTiming = null;
    if (lh && aw) {
      const lhParts = (lh.day - (aw.sinceDay || lh.day)) * 4 + (lh.part - (aw.sincePart || 0));
      hurtTiming = lhParts < 0 ? 'before-departure' : 'while-away';
    } else if (lh) hurtTiming = 'no-away-record';
    return { vid: String(vid).slice(0, 24), name: String(name).slice(0, 24), day, dayPart: part,
      want: Math.round(want || 0), take: Math.round(take || 0), hp,
      away: aw ? { purpose: aw.purpose || null, sinceDay: aw.sinceDay ?? null, sincePart: aw.sincePart ?? null,
        duration: aw.duration ?? null, nx: aw.nx ?? null, ny: aw.ny ?? null } : null,
      partsAway, partsLeft,
      node: node ? { nx: node.nx ?? null, ny: node.ny ?? null } : null,
      distFromHaven: node ? (Math.abs(node.nx - hx) + Math.abs(node.ny - hy)) : null,
      obj, exped, lastHurt: lh, hurtTiming,
      hurtGate: (v.hurtGate || {})[vid] || null };
  };

  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (/away from the haven/i.test(t) && /hurt/i.test(t) && W.pendingSnap) {
        W.hurtLines.push({ line: trunc(t), snap: W.pendingSnap });
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };

  const oVoice = Game.awayHungerVoice;
  if (typeof oVoice === 'function') Game.awayHungerVoice = function (vid, want, take, pool) {
    try { W.pendingSnap = snap(vid, want, take); } catch (e) { W.pendingSnap = null; }
    try { return oVoice.apply(this, arguments); } finally { W.pendingSnap = null; }
  };

  const oHurt = Game.hurtVillager;
  if (typeof oHurt === 'function') Game.hurtVillager = function (vid, dmg, cause, settlement, damageContext) {
    let ret = null;
    try { ret = oHurt.apply(this, arguments); } catch (e) { throw e; }
    try {
      const v = (Game.state || {}).village || {};
      const hpAfter = (v.health && v.health[vid] !== undefined) ? v.health[vid] : null;
      W.lastHurt[vid] = { day: ((Game.state || {}).scholar || {}).day || 0, part: Game.dayPart || 0,
        cause: String(cause || '?').slice(0, 32), dmg: Math.round(dmg || 0), hpAfter };
    } catch (e) {}
    return ret;
  };

  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const whoId = String((opts && (opts.villagerId || '')) || '');
        const day = ((Game.state || {}).scholar || {}).day || 0;
        const cause = String((opts && opts.cause) || '?').slice(0, 32);
        const key = whoId + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) { W.deathSeen.add(key); W.deaths.push({ day, who: whoId, cause }); }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  const policy = Object.assign({}, competent);
  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const perSeed = { seed, policy: 'competent', plentydepri: 1, depositgate: 1,
    daysAlive: result.days, endReason: result.endReason,
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    deathCauses, deaths: W.deaths, national, table: won, win: won,
    waveReach: Array.from({ length: maxWave }, (_, i) => i + 1), maxWave,
    hurtLines: W.hurtLines };
  const diag = { endReason: result.endReason, rank, maxWave, hurtLineCount: W.hurtLines.length,
    deathCount: W.deaths.length, ms };
  return { seed, perSeed, diag };
}

if (require.main === module) (async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `hurttraveler-b-competent-s${s}.json`), JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathCount} hurtLines=${diag.hurtLineCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
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
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: merged.map(r => r.seed), env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, PILOT, DAYS };
