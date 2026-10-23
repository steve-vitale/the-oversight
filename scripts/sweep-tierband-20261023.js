#!/usr/bin/env node
// sweep-tierband-20261023.js — sim-overtime-yield-b PILOT sweep.
//
// 8 seeds (65611-65618, the splitclose pilot seeds — direct comparability)
// x {leadfeast, belongfeast} x {control, tierband} = 32 paired configs,
// 180d death-aware, on the pre-seat armorydrive substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   ARMORYDRIVE=1 KILLDISC=1 (SPLITCLOSE=1 BOTH arms; TIERBAND=1 armed only;
//   no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/
//   TWOVETS/VGEAR/WAVE4ENGAGE/FEASTDISC)
//
//   control  = TB.controlFor(base) = SC.armedFor(base) (SPLITCLOSE=1,
//              TIERBAND unset — the discipline WITHOUT tier-awareness)
//   tierband = TB.armedFor(base)   = withTierband over SC.armedFor(base)
//              (SPLITCLOSE=1 + TIERBAND=1 — tier>=3 wave-4 fights bypass
//              the discipline; the scholar fights to kill normally)
//
// Composition honesty pinned by scripts/test-tierband-20261023.js (all
// gates GREEN) BEFORE this sweep runs.
//
// Instruments: KILLDISC=1 v2 (per-source tbDamage attribution on wave-3+
// monsters + engagement census) + daily w5-readiness sample + splitclose
// layer counters (sc*) + tierband layer counters (tb*) + kill-time bearer
// census (the scholar is a role, not a person; sim-killtime MANDATORY) +
// wave-4 fight damage tables (w4FightDmg) + FEASTED-window attribution +
// read-only overtime-tier sampler at wave-4 TB fight start (fightId -> tier
// side table — the measure-overtime-splitclose-20261022.js sampling point;
// needed to attribute kills/fights by tier on BOTH arms).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-tierband/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1 ARM=control SEEDS=65611,65612 \
//   node scripts/sweep-tierband-20261023.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1 TIERBAND=1 ARM=tierband SEEDS=65611,65612 \
//   node scripts/sweep-tierband-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const SC = require(path.join(REPO, 'scripts', 'policies', 'splitclose'));
const TB = require(path.join(REPO, 'scripts', 'policies', 'tierband'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// NON-SEAT ARMORYDRIVE SUBSTRATE guard (the pinned substrate + KILLDISC v2).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SPLITCLOSE', 'ARMORYDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (non-seat armorydrive substrate, SPLITCLOSE on both arms).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'FEASTDISC']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'tierband') { console.error('SWEEP STOP: ARM must be control|tierband.'); process.exit(2); }
if (ARM === 'tierband' && process.env.TIERBAND !== '1') { console.error('SWEEP STOP: TIERBAND=1 required for ARM=tierband.'); process.exit(2); }
if (ARM === 'control' && ('TIERBAND' in process.env)) { console.error('SWEEP STOP: TIERBAND must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65611, 65612, 65613, 65614, 65615, 65616, 65617, 65618]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-tierband');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
function policyFor(base) { const t = AD.normBase(base); return ARM === 'tierband' ? TB.armedFor(t) : TB.controlFor(t); }
function policyTag(base) { return AD.normBase(base) + (ARM === 'tierband' ? '-tierband' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function feastedNow(Game) { try { return !!(Game.feastedActive && Game.feastedActive()); } catch (e) { return false; } }
function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; } catch (e) { return 1; }
}
function baseHpOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.hp) || null; } catch (e) { return null; }
}
// Overtime tier for a fightId, looked up in the fight-start sampler side
// table (keys are String(f.id) when f.id exists — matches KD's fightId).
let _tierByFight = {};
function tierOfFightId(fid) {
  const row = _tierByFight[fid];
  return row ? (row.tier | 0) : null;
}

// EPERM-flap-hardened write (finding #621): node writeFileSync flaps EPERM
// in long windows; shell writes succeed. Retry EPERM-only with backoff.
function writeFileFlap(fp, data) {
  let last = null;
  for (let i = 0; i < 12; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      last = e;
      if (!/EPERM/i.test(String((e && e.code) || '') + String((e && e.message) || ''))) throw e;
      execSync('sleep 20');
    }
  }
  throw last;
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'tierband', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // FEASTED-window attribution on wave-4 kills (the drivenofeast honesty
  // rule): wrap OUTSIDE KD's wrapper — call-through, side table only.
  const feastedAtKill = [];
  let oRWK = null;
  try {
    oRWK = Game.recordWaveKill;
    if (typeof oRWK === 'function') {
      Game.recordWaveKill = function (mid, vid, via, detail) {
        try { feastedAtKill.push({ day: gday(Game), mid, by: vid, via, feasted: feastedNow(Game) }); } catch (e) {}
        return oRWK.apply(this, arguments);
      };
    }
  } catch (e) {}

  // Overtime-tier sampler at wave-4 TB fight start (the
  // measure-overtime-splitclose sampling point — read-only hooks).
  const tierByFight = {};
  let oStart = null;
  try {
    oStart = Game.startCombat;
    if (typeof oStart === 'function') {
      Game.startCombat = function (mid) {
        const r = oStart.apply(this, arguments);
        try {
          const f = Game.tbfight;
          if (f && (waveOf(Game, mid) | 0) === 4) {
            let tier = 0;
            try { tier = (typeof Game.overtimeTier === 'function') ? (Game.overtimeTier() | 0) : 0; } catch (e) {}
            const fid = String(f.id || (f.fighters || []).map(x => x.key).join(','));
            let maxHp = null;
            try {
              for (const x of (f.fighters || [])) {
                if (x && x.kind === 'monster') { const h = Math.round(x.maxHp || x.hp || 0); if (h > (maxHp | 0)) maxHp = h; }
              }
            } catch (e) {}
            tierByFight[fid] = { day: gday(Game), mid, tier, baseHp: baseHpOf(Game, mid), maxHp };
          }
        } catch (e) {}
        return r;
      };
    }
  } catch (e) {}

  const w5census = [];
  let lastCtx = null;
  let uninstallW5 = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
          const r4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
          w5census.push({ day: ((Game.state || {}).scholar || {}).day || 0,
            veterans: r ? (r.veterans | 0) : null, short: r ? (r.short || []).slice() : null,
            armored4: r4 ? (r4.armored | 0) : null });
        } catch (e) { t.instrumentErrors.push('w5census: ' + String((e && e.message) || e)); }
        return oSleep(...a);
      };
      uninstallW5 = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  const oDaily = policy.daily;
  const bearerByDay = {};
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallW5) uninstallW5(); } catch (e) {}
  try { uninstallKD(); } catch (e) {}
  try { if (oStart && Game.startCombat) { /* leave wrapped — Game is discarded */ } } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0, winTrack = null;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    const ek = pg.table && pg.table.endingKey;
    if (ek) winTrack = { path: ek.tablePath || null, moral: ek.moral || null, track: ek.track || null, seat: ek.seat || null };
  } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Kill-time attribution (sim-killtime MANDATORY):
  // villager kill = w=4, by != bearer-on-that-day, by != 'player'.
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villagers = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    if (e.by === bearerAtKill || e.by === 'player') w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }
  const bearerChanges = [];
  try {
    const days = Object.keys(bearerByDay).map(Number).sort((a, b) => a - b);
    let prev = null;
    for (const d of days) {
      if (bearerByDay[d] !== prev) { bearerChanges.push({ day: d, vid: bearerByDay[d] }); prev = bearerByDay[d]; }
    }
  } catch (e) {}

  let w4EngageEvents = 0;
  const w4EngageDetail = [];
  try {
    for (const g of (t.engagements || [])) {
      if ((g.wave | 0) !== 4 || !g.started || (g.partySize | 0) < 1) continue;
      w4EngageEvents++;
      w4EngageDetail.push({ day: g.day, mid: g.mid, partySize: g.partySize, fightId: g.fightId });
    }
  } catch (e) {}

  const w4FightDmg = [];
  try { _tierByFight = tierByFight; } catch (e) {}
  try {
    const seen = new Set();
    for (const g of (t.engagements || [])) {
      if ((g.wave | 0) !== 4 || !g.fightId || seen.has(g.fightId)) continue;
      seen.add(g.fightId);
      const d = t.dmg[g.fightId];
      if (!d) continue;
      w4FightDmg.push({ fightId: g.fightId, day: g.day, mid: g.mid,
        scholar: Math.round(d.scholar || 0), companion: Math.round(d.companion || 0),
        other: Math.round(d.other || 0), byVid: d.byVid || {},
        outcome: (t.tbOutcomes && t.tbOutcomes[g.fightId]) || null,
        tier: tierOfFightId(String(g.fightId)) });
    }
  } catch (e) {}

  // Layer counters: splitclose (sc*) + tierband (tb*).
  const sc = {}, tb = {};
  try {
    for (const k of Object.keys(lastCtx || {})) {
      if (/^sc/.test(k) && !/^_/.test(k)) sc[k] = lastCtx[k];
      if (/^tb/.test(k) && !/^_/.test(k)) tb[k] = lastCtx[k];
    }
  } catch (e) {}

  const w4killRows = [];
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      const fk = feastedAtKill.find(f => f.day === k.day && f.mid === k.mid && String(f.by) === String(k.by));
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        feasted: fk ? !!fk.feasted : null,
        dmgScholar: k.dmg ? Math.round(k.dmg.scholar || 0) : null,
        dmgCompanion: k.dmg ? Math.round(k.dmg.companion || 0) : null,
        dmgOther: k.dmg ? Math.round(k.dmg.other || 0) : null,
        byVid: k.dmg ? (k.dmg.byVid || {}) : {},
      });
    }
  } catch (e) {}

  let w5vetsEnd = 0, w5vetsMax = 0, armored4End = 0;
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
    w5vetsEnd = (r && r.veterans) | 0;
    const r4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
    armored4End = (r4 && r4.armored) | 0;
  } catch (e) {}
  try { for (const c of w5census) if ((c.veterans | 0) > w5vetsMax) w5vetsMax = c.veterans | 0; } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  let villagerCombatDeaths = 0, starvationDeaths = 0, scholarCombatDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || '');
      if (/starv/i.test(c)) starvationDeaths++;
      if (/combat|fight|monster|wound|bleed|titan/i.test(c)) {
        if (dd.player) scholarCombatDeaths++;
        else villagerCombatDeaths++;
      }
    }
  } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc-v2+w5census+sccounters+tbcounters+killtime-bearer+w4fightdmg+feasted-window+overtime-tier',
    substrate: 'pre-seat armorydrive substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/TWOVETS/VGEAR/WAVE4ENGAGE/FEASTDISC)' + (ARM === 'tierband' ? ' +TIERBAND=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled, winTrack,
    w5vetsEnd, w5vetsMax, armored4End,
    days: result.days, gameDays, endReason: result.endReason,
    w4kills: w4.length,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4Villagers: w4villagers.size,
    w4scholarKills,
    w4killsDetail: w4.map(e => ({ d: e.d, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via, trick: e.trick || null, bearerAtKill: bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid })),
    bearerChanges,
    w4killRows,
    w4EngageEvents, w4EngageDetail,
    w4FightDmg,
    tierByFight,
    tbOutcomes: t.tbOutcomes || {},
    sc, tb,
    partyEnd: (() => { try { return (Game.partyMembers ? Game.partyMembers() : []).length; } catch (e) { return 0; } })(),
    scholarCombatDeaths,
    instrumentErrors: t.instrumentErrors,
    deathCauses, villagerCombatDeaths, starvationDeaths,
    w5censusDays: w5census.length,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const tag = policyTag(base);
      const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
      if (fs.existsSync(fp)) { console.log(`SKIP (exists): ${path.basename(fp)}`); continue; }
      console.log(`RUN seed=${seed} base=${base} arm=${ARM}`);
      const t0 = Date.now();
      try {
        const out = await oneRun(seed, base);
        const tb = out.tb || {};
        console.log(`  done ${(Date.now() - t0) / 1000 | 0}s days=${out.gameDays} w4kills=${out.w4kills} nW4Villagers=${out.nW4Villagers} tbW4Fights=${tb.tbW4Fights | 0} tbHighTierFights=${tb.tbHighTierFights | 0} tbBypasses=${tb.tbHighTierBypasses | 0}`);
        rows.push(out);
      } catch (e) {
        console.error(`  RUN FAIL seed=${seed} base=${base}: ${(e && e.message) || e}`);
      }
    }
  }
  console.log(`sweep complete: ${rows.length} configs`);
})().catch(e => { console.error('SWEEP FAIL: ' + (e && e.stack || e)); process.exit(1); });
