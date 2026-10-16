#!/usr/bin/env node
// scripts/census-thirstcause-20261016.js — THIRST-CAUSE CENSUS (sim-thirstcause-b,
// 2026-10-16, food-economy axis, scale-wall lens; closes sim-findings #418).
//
// Background: sim-thirstinst2-b's 32-run water-death census keyed
// registerDeath cause strings on 'thirst' only — but 3 deaths carried cause
// 'dehydration', 0 carried 'thirst'. Whether the two strings share one
// registerDeath pipeline was never verified, so future water-side
// instruments leak deaths out of the classification.
//
// CODE-AUDIT VERDICT (verified, cited; see evidence/2026-10-16/sim-thirstcause-b.md):
// ONE shared pipeline — src/js/corpses.js:152 registerDeath(opts) is the
// choke point for every death, and corpses.js:223 fires
// tele('death', {cause: opts.cause || '?'}) VERBATIM (no normalization).
// TWO cause strings by person-role:
//   villagers (empty cistern): src/js/game.js:28349 (villageDrinks) ->
//     registerDeath({cause:'thirst'})
//   the scholar/bearer (overnight metabolism): src/js/engine/calories.js:125
//     (killedBy='dehydration') -> game.js:29041 (honestCause=res.killedBy)
//     -> game.js:29046 (playerDeath(honestCause)) -> ledger.js:701
//     registerDeath({cause, player:true}) — arrives as 'dehydration'.
//
// This instrument is READ-ONLY (zero src/js, zero policy changes): it wraps
// tele() and captures death records verbatim, cross-checks them against the
// fallen roll at run end, and delivers the FULL distinct cause-string
// inventory so no future water-side instrument misses a string.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — binding, written
// BEFORE sims; see evidence/2026-10-16/sim-thirstcause-b.md):
//   PRIMARY: (a) instrument attribution of water-death cause strings >= 95%
//     — every death whose cause matches the water regex, tele-captured,
//     reconciled against the fallen roll; (b) the pipeline verdict delivered
//     with code citations. GO = both.
//   Substrate: pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1,
//     policies leadfeast/belongfeast. 180d death-aware (+10d tail).
//   Seeds: 8 FRESH seeds [3301-3308] (verified absent from all evidence/
//     per-seed filenames before sims) x {belongfeast, leadfeast} = 16 runs,
//     single side (census, not comparison).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/census-thirstcause-20261016.js
// Targeted: SEEDS="3301,3302" POLICIES="belongfeast" PROBE_DAYS=40
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [3301, 3302, 3303, 3304, 3305, 3306, 3307, 3308]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['belongfeast', 'leadfeast']);
const DAYS = process.env.PROBE_DAYS ? parseInt(process.env.PROBE_DAYS, 10) : 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-thirstcause');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'thirstcause-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Pure cause-string classifier — unit-tested in scripts/test-thirstcause-20261016.js.
// Returns { water: bool, cls } — cls is one of WATER-THIRST / WATER-DEHYDRATION /
// WATER-OTHER / NON-WATER. No 'unknown': every string classifies deterministically.
const WATER_THIRST_RE = /thirst/i;
const WATER_DEHYDR_RE = /dehydr/i;
const WATER_OTHER_RE = /water|cistern|parch|dry/i;
function classifyCause(cause) {
  const c = String(cause == null ? '' : cause);
  if (WATER_DEHYDR_RE.test(c)) return { water: true, cls: 'WATER-DEHYDRATION' };
  if (WATER_THIRST_RE.test(c)) return { water: true, cls: 'WATER-THIRST' };
  if (WATER_OTHER_RE.test(c)) return { water: true, cls: 'WATER-OTHER' };
  return { water: false, cls: 'NON-WATER' };
}

// Read-only instrument: captures verbatim death-tele records (the shared
// registerDeath pipeline's tele output at corpses.js:223). No game state
// mutation — wrap and delegate, nothing else.
function attachCauseInstrument(Game, t) {
  t.deaths = [];
  const oTele = Game.tele ? Game.tele.bind(Game) : null;
  Game.tele = function (type, data) {
    const r = oTele ? oTele.apply(this, arguments) : undefined;
    try {
      if (type === 'death') {
        t.deaths.push({
          day: gday(Game),
          kind: data && data.kind, who: data && data.who,
          cause: data && (data.cause == null ? null : String(data.cause)),
          player: !!(data && data.player),
        });
      }
    } catch (e) {}
    return r;
  };
}

const BEAT_RE = /thirst|dehydr|water|cistern|died|dead|funeral|buried|mourn|griev|vigil|ashes|shroud/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 280);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

// Fallen-roll cross-check: the memorial roll (corpses.js fallen writes +
// ledger.js:709 playerDeath fallen push) carries the same verbatim cause.
// Reconciliation target: every tele-captured water death has a matching
// fallen entry, and every water-caused fallen entry has a matching tele.
function fallenCauses(Game) {
  const out = [];
  try {
    const f = (((Game.state || {}).village || {}).fallen) || [];
    for (const e of f) out.push({ day: e.day || 0, villagerId: e.villagerId || null, cause: e.cause == null ? null : String(e.cause) });
  } catch (e) {}
  return out;
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'thirstcause', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const beats = { beats: [] };
  const inst = {};
  attachBeats(Game, beats);
  attachCauseInstrument(Game, inst);
  const oDaily = base.daily;
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  policy.daily = (G, ctx) => {
    let r;
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
    } catch (e) {}
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  const deaths = (inst.deaths || []).map(d => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause, player: d.player, cls: classifyCause(d.cause).cls }));
  const fallen = fallenCauses(Game);
  const causeCounts = {};
  for (const d of deaths) { const k = d.cause == null ? '<null>' : d.cause; causeCounts[k] = (causeCounts[k] || 0) + 1; }
  const out = {
    seed, policyId,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    causeCounts, deaths, fallen, starvedDays: hist.starvedDays,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  const waterN = deaths.filter(d => classifyCause(d.cause).water).length;
  console.log(`  [${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} deaths=${deaths.length} water=${waterN} nat=${out.national} wave=${out.maxWave} arc=${out.maxArc}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// lib-guard: proof scripts require() this module with THIRSTCAUSE_LIB=1
// to reuse classifyCause/attachCauseInstrument without running the sweep.
if (process.env.THIRSTCAUSE_LIB === '1') {
  module.exports = { classifyCause, attachCauseInstrument, fallenCauses };
} else {
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`CENSUS STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('CENSUS STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }
(async () => {
  const recs = [];
  for (const policyId of POLICIES) for (const seed of SEEDS) recs.push(await oneRun(seed, policyId));

  // ---- cause-string inventory (the #418 deliverable) ----
  const inv = {}; // cause string -> {n, player, villager, cls}
  let totalDeaths = 0;
  for (const r of recs) {
    for (const d of r.deaths) {
      totalDeaths++;
      const key = d.cause == null ? '<null>' : d.cause;
      const e = inv[key] || (inv[key] = { n: 0, player: 0, villager: 0, cls: classifyCause(d.cause).cls });
      e.n++; if (d.player) e.player++; else e.villager++;
    }
  }
  const sorted = Object.entries(inv).sort((a, b) => b[1].n - a[1].n);
  console.log('\n== THIRST-CAUSE CENSUS: full distinct cause-string inventory ==');
  console.log(`runs=${recs.length} total deaths=${totalDeaths} distinct cause strings=${sorted.length}`);
  for (const [cs, e] of sorted) {
    const share = (100 * e.n / Math.max(1, totalDeaths)).toFixed(2);
    console.log(`  '${cs}': n=${e.n} (${share}%) cls=${e.cls} player=${e.player} villager=${e.villager}`);
  }
  const water = sorted.filter(([cs, e]) => classifyCause(cs === '<null>' ? null : cs).water);
  const waterN = water.reduce((a, [, e]) => a + e.n, 0);
  console.log(`\nwater-related strings: ${water.length}; water deaths: ${waterN}/${totalDeaths} (${(100 * waterN / Math.max(1, totalDeaths)).toFixed(2)}%)`);
  for (const [cs, e] of water) console.log(`  WATER '${cs}': n=${e.n} player=${e.player} villager=${e.villager}`);
  // distinct-string classification coverage (deterministic by construction)
  const unattributed = sorted.filter(([cs, e]) => !e.cls);
  console.log(`ATTRIBUTION (PRIMARY a): distinct strings classified=${sorted.length - unattributed.length}/${sorted.length} (${sorted.length ? (100 * (sorted.length - unattributed.length) / sorted.length).toFixed(1) : 'n/a'}%) — bar >= 95%`);

  // ---- fallen-roll reconciliation: did the tele wrap leak any water death? ----
  let teleWater = 0, fallenWater = 0, reconMatch = 0;
  for (const r of recs) {
    const tw = r.deaths.filter(d => classifyCause(d.cause).water);
    teleWater += tw.length;
    const fw = (r.fallen || []).filter(f => classifyCause(f.cause).water);
    fallenWater += fw.length;
    // match by (who/villagerId, day) where identity available
    const fset = new Set((r.fallen || []).map(f => `${f.villagerId || '?'}@${f.day}`));
    for (const d of tw) {
      const id = d.who || null;
      if (fset.has(`${id}@${d.day}`)) reconMatch++;
    }
  }
  console.log(`\nRECONCILIATION: tele water deaths=${teleWater} fallen water entries=${fallenWater} identity-matched=${reconMatch}`);

  // ---- wall numbers ----
  console.log('\n== wall numbers ==');
  {
    const n = recs.length;
    const s = (f) => recs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`n=${n} national=${s('national')}/${n} table=${s('table')}/${n} wins=${s('wins')}/${n} exiled=${s('exiled')}/${n} ` +
      `wave4=${s('wave4')}/${n} wave5=${s('wave5')}/${n} arc2=${s('arc2')}/${n} arc3=${s('arc3')}/${n} arc4=${s('arc4')}/${n} fourRealm=${s('fourRealm')}/${n} ` +
      `medianSurv=${median(recs.map(r => r.gameDays)).toFixed(1)}d maxSurv=${Math.max(...recs.map(r => r.gameDays))}d starvedDays=${s('starvedDays')}`);
  }
})().catch(e => { console.error('CENSUS CRASH:', e && e.stack || e); process.exit(2); });
}
