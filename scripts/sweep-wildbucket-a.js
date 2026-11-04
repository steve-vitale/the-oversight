'use strict';
// sweep-wildbucket-a.js — WILDBUCKET rich death-record census on current master
// (sim-wildbucket-a, oversight-flesh-out-loop, run
// fleshout-20261104T2230Z, axis food-economy). Measurement only: no
// game-code change. Records, for EVERY registerDeath, a rich death
// record (context snapshot at death time) so the 'the wild' bucket
// can be decomposed from fields the engine actually writes — never
// from invented causes.
//
// Pattern + env gates copied from scripts/sweep-exphurt-24-a.js
// (competent policy, 100d death-aware cap, PLENTYDEPRI=1,
// DEPOSITGATE=1, post-hurthome guard). Seed bands are pre-registered
// in evidence/2026-11-04/sim-wildbucket-a-prereg.md; the sweep
// refuses any other list, loudly, before any sim runs.
// VALIDATE_ONLY=1 validates STAGE/SEEDS/DAYS and exits 0 without sims
// (used by scripts/test-wildbucket-a.js).
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const BANDS = {
  pilot: [99957, 99958, 99959, 99960, 99961, 99962, 99963, 99964],
  confirm: [99965, 99966, 99967, 99968, 99969, 99970, 99971, 99972,
    99973, 99974, 99975, 99976, 99977, 99978, 99979, 99980],
};
const DAYS = 100;

function parseSeeds() {
  return (process.env.SEEDS || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
}
function validate() {
  const errors = [];
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    errors.push('PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly');
  }
  const stage = process.env.STAGE || '';
  if (!BANDS[stage]) errors.push('STAGE must be pilot or confirm, got: ' + (stage || '(unset)'));
  const band = BANDS[stage] || [];
  const seeds = parseSeeds();
  if (stage && !(seeds.length === band.length && seeds.every((s, i) => s === band[i]))) {
    errors.push('seeds must be exactly ' + stage + ' band ' + band.join('-') + ', got: ' + (process.env.SEEDS || '(unset)'));
  }
  if (parseInt(process.env.DAYS || '', 10) !== DAYS) {
    errors.push('DAYS must be exactly 100, got: ' + (process.env.DAYS || '(unset)'));
  }
  return { stage, band, seeds, errors };
}

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

async function oneRun(seed, days, outDir) {
  const { Game } = await loadGame({ seed, mode: 'wildbucket-a-competent', fullTelemetry: false });
  await setupGame(Game);
  if (typeof Game.shouldHurtReturn !== 'function') {
    console.error('FATAL: Game.shouldHurtReturn missing — not post-hurthome-fix master, refusing');
    process.exit(2);
  }
  const W = { deaths: [], lastHurt: {}, sayWindow: [], errors: [] };
  const village = () => (Game.state || {}).village || {};
  const scholarDay = () => ((Game.state || {}).scholar || {}).day || 0;
  const partNow = () => Game.dayPart || 0;

  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (txt) {
    try {
      const t = String(txt || '');
      if (t) {
        W.sayWindow.push({ day: scholarDay(), part: partNow(), line: trunc(t) });
        if (W.sayWindow.length > 200) W.sayWindow.splice(0, W.sayWindow.length - 200);
      }
    } catch (e) { W.errors.push('say: ' + (e && e.message)); }
    return oSay.apply(this, arguments);
  };

  const oHurt = Game.hurtVillager;
  if (typeof oHurt === 'function') Game.hurtVillager = function (vid, dmg, cause, settlement, damageContext) {
    let ret = null;
    try { ret = oHurt.apply(this, arguments); } catch (e) { throw e; }
    try {
      const id = (vid === 'player') ? Game.villagerId : vid;
      W.lastHurt[id] = { cause: String(cause == null ? '?' : cause), dmg: Math.round(dmg || 0), day: scholarDay(), part: partNow() };
    } catch (e) { W.errors.push('hurtPost: ' + (e && e.message)); }
    return ret;
  };

  const snapFighters = () => {
    try {
      const f = Game.tbfight || null;
      if (!f) return null;
      const fighters = Array.isArray(f.fighters) ? f.fighters : [];
      return {
        over: !!f.over, result: f.result || null,
        betrayal: !!f.betrayal, tableTrial: !!f.tableTrial, coalitionArena: !!f.coalitionArena,
        fighters: fighters.map((x) => ({
          kind: (x && x.kind) || null,
          villagerId: (x && x.villagerId) || null,
          monsterId: (x && (x.monsterId || x.mid || (x.mdef && x.mdef.id))) || null,
          name: (x && (x.name || x.monsterName || (x.mdef && x.mdef.name))) || null,
        })),
      };
    } catch (e) { W.errors.push('snapFighters: ' + (e && e.message)); return null; }
  };

  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const o = opts || {};
      const who = String(o.villagerId || o.monsterId || o.name || '');
      const v = village();
      const aw = who ? ((v.away || {})[who] || null) : null;
      const sick = who ? ((v.sick || {})[who] || null) : null;
      let tileType = null;
      try { const t = Game.playerTile ? Game.playerTile() : null; tileType = t ? (t.type || null) : null; } catch (e) {}
      W.deaths.push({
        day: scholarDay(), part: partNow(), who, name: o.name || null, kind: o.kind || null,
        cause: String(o.cause == null ? '?' : o.cause),
        player: !!o.player, killerId: o.killerId || null,
        monsterId: o.monsterId || null, monsterName: o.monsterName || null,
        isScholar: who === Game.villagerId,
        scholarDeparted: !!Game.departed, tileType,
        arenaContestLive: !!(Game.state && Game.state.arenaContest),
        tbfight: snapFighters(),
        away: aw ? { purpose: aw.purpose || null, duration: (aw.duration != null ? aw.duration : null) } : null,
        sick: sick ? { name: sick.name || null, diagnosed: sick.diagnosed || null } : null,
        health: who ? (((v.health || {})[who] !== undefined) ? (v.health || {})[who] : null) : null,
        lastHurt: who ? (W.lastHurt[who] || null) : null,
        transcriptWindow: W.sayWindow.slice(-15),
      });
    } catch (e) { W.errors.push('deathPre: ' + (e && e.message)); }
    return oDie.apply(this, arguments);
  };

  const policy = Object.assign({}, competent);
  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const perSeed = { seed, policy: 'competent', plentydepri: 1, depositgate: 1,
    daysAlive: result.days, endReason: result.endReason,
    rank, national: /national|global/i.test(rank) || !!((Game.state || {}).nationalLive),
    table: won, win: won, maxWave,
    deaths: W.deaths, deathCount: W.deaths.length, errors: W.errors, simMs: ms };
  writeRobust(path.join(outDir, 'wildbucket-a-competent-s' + seed + '.json'), JSON.stringify(perSeed, null, 1));
  console.log('seed ' + seed + ': daysAlive=' + result.days + ' deaths=' + W.deaths.length +
    ' wild=' + W.deaths.filter((d) => d.cause === 'the wild').length + ' errors=' + W.errors.length + ' ' + ms + 'ms');
  return perSeed;
}

async function main() {
  const { stage, band, seeds, errors } = validate();
  if (errors.length) { for (const e of errors) console.error('FATAL: ' + e); process.exit(2); }
  if (process.env.VALIDATE_ONLY === '1') { console.log('VALIDATE OK stage=' + stage); return; }
  const outDir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-wildbucket-a-' + stage);
  fs.mkdirSync(outDir, { recursive: true });
  const summary = { stage, seeds: band, days: DAYS, perSeed: [] };
  for (const seed of seeds) {
    const ps = await oneRun(seed, DAYS, outDir);
    summary.perSeed.push({ seed: ps.seed, daysAlive: ps.daysAlive, endReason: ps.endReason,
      deathCount: ps.deathCount, wildCount: ps.deaths.filter((d) => d.cause === 'the wild').length,
      errors: ps.errors.length });
  }
  writeRobust(path.join(outDir, 'sweep-wildbucket-a-' + stage + '.json'), JSON.stringify(summary, null, 1));
  console.log('SUMMARY stage=' + stage + ' seeds=' + seeds.length +
    ' deaths=' + summary.perSeed.reduce((a, s) => a + s.deathCount, 0) +
    ' wild=' + summary.perSeed.reduce((a, s) => a + s.wildCount, 0));
}

if (require.main === module) main().catch((e) => { console.error('FATAL', e && e.stack || e); process.exit(2); });
module.exports = { BANDS, DAYS, validate, parseSeeds };
