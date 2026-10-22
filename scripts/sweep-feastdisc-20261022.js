#!/usr/bin/env node
// sweep-feastdisc-20261022.js — sim-feastdiscipline PILOT sweep.
//
// 8 FRESH seeds (66021-66028, filename-verified 2026-10-22) x
// {leadfeast, belongfeast} x {control, feastdisc} = 32 configs,
// 180d death-aware, paired identical seeds, on the proven non-seat long
// substrate (the sim-armorydrive pilot/confirm substrate:
// FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
// KILLDISC=1; VETREL/REPOSITION/VGEAR unset):
//
//   control   = AD.armedFor(base), ARMORYDRIVE=1 (weapons in hands +
//               fire-side staging — the proven baseline)
//   feastdisc = FD.disciplinedFor(base), ARMORYDRIVE=1 + FEASTDISC=1
//               (threat-driven armed-feast staging OUTSIDE the armorydrive
//               stack)
//
// Composition honesty pinned by scripts/test-feastdiscipline-20261022.js
// (ALL GREEN) BEFORE this sweep runs.
//
// Instruments: KILLDISC=1 v2 (read-only per-source tbDamage attribution
// on wave-3+ monsters + startCombat engagement census) + daily bearer
// census (kill-time attribution — the scholar is a role, not a person;
// sim-killtime MANDATORY) + feast-staging census (read-only hostFeast /
// grantFeastBuff wraps: armed feast days, feasted status at each wave-4
// engagement) + feastdiscipline layer counters (FD.tele).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-feastdisc/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 \
//   ARM=control SEEDS=66021,66022 node scripts/sweep-feastdisc-20261022.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 FEASTDISC=1 \
//   ARM=feastdisc SEEDS=66021,66022 node scripts/sweep-feastdisc-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'feastdiscipline'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// NON-SEAT LONG SUBSTRATE guard (the sim-armorydrive substrate).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION', 'VGEAR']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'feastdisc') { console.error('SWEEP STOP: ARM must be control|feastdisc.'); process.exit(2); }
if (ARM === 'feastdisc' && !FD.fdOn()) { console.error('SWEEP STOP: FEASTDISC=1 required for ARM=feastdisc.'); process.exit(2); }
if (ARM === 'control' && FD.fdOn()) { console.error('SWEEP STOP: FEASTDISC must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66021, 66022, 66023, 66024, 66025, 66026, 66027, 66028]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-feastdisc');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`); process.exit(2);
}
function policyFor(base) {
  const nb = normBase(base);
  return ARM === 'feastdisc' ? FD.disciplinedFor(nb) : AD.armedFor(nb);
}
function policyTag(base) { return normBase(base) + (ARM === 'feastdisc' ? '-feastdisc' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function waveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 0;
  } catch (e) { return 0; }
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'feastdisc-pilot', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Feast-staging census: read-only hostFeast/grantFeastBuff wraps (chain
  // after the KD install — unrelated methods, no interference).
  const feastCalls = [], buffGrants = [];
  const uninstallFeast = (() => {
    const errs = [];
    const oHost = Game.hostFeast ? Game.hostFeast.bind(Game) : null;
    const oGrant = Game.grantFeastBuff ? Game.grantFeastBuff.bind(Game) : null;
    if (oHost) Game.hostFeast = function (...a) {
      let armed = false, day = 0, part = 0;
      try {
        armed = !!((((Game.state || {}).scholar || {}).prog || {}).feastSurge);
        day = ((Game.state || {}).scholar || {}).day || 0;
        part = (Game.dayPart == null ? 0 : Game.dayPart);
      } catch (e) {}
      const r = oHost(...a);
      try { feastCalls.push({ day, part, armed, ok: !!(r && r.ok) }); } catch (e) { errs.push(String(e && e.message)); }
      return r;
    };
    if (oGrant) Game.grantFeastBuff = function (...a) {
      const r = oGrant(...a);
      try {
        buffGrants.push({ day: ((Game.state || {}).scholar || {}).day || 0, granted: !!(r && r.granted) });
      } catch (e) { errs.push(String(e && e.message)); }
      return r;
    };
    return () => { try { if (oHost) Game.hostFeast = oHost; } catch (e) {} try { if (oGrant) Game.grantFeastBuff = oGrant; } catch (e) {} };
  })();

  // Per-fight feasted census: wrap startCombat AFTER the killdisc wrap.
  // Feasted status at entry tells whether the engagement rode the buff.
  const fightFeasted = [];
  let uninstallFeasted = null;
  try {
    const oSC = Game.startCombat ? Game.startCombat.bind(Game) : null;
    if (oSC) {
      Game.startCombat = function (...a) {
        const r = oSC(...a);
        try {
          const f = Game.tbfight;
          if (f && !f.over) {
            const mid = a[0] || (Game.pendingMonsterId || 'bulldozer');
            let feasted = false;
            try { feasted = !!(Game.feastedActive && Game.feastedActive()); } catch (e) {}
            fightFeasted.push({
              day: ((Game.state || {}).scholar || {}).day || 0,
              mid, wave: waveOf(Game, mid), feasted,
            });
          }
        } catch (e) { t.instrumentErrors.push('feastedCensus: ' + String((e && e.message) || e)); }
        return r;
      };
      uninstallFeasted = () => { try { Game.startCombat = oSC; } catch (e) {} };
    }
  } catch (e) {}

  // Bearer-by-day for kill-time attribution.
  let lastCtx = null;
  const bearerByDay = {};
  const oDaily = policy.daily;
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  FD.resetTele();
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const fdTele = FD.tele();
  try { if (uninstallFeasted) uninstallFeasted(); } catch (e) {}
  try { uninstallFeast(); } catch (e) {}
  try { uninstallKD(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Kill-time + damage-majority attribution (sim-killtime MANDATORY):
  // villager kill = w=4, by != bearer-on-that-day, by != 'player'.
  // damage-majority = >=50% of the kill's fight damage from non-scholar sources.
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villagers = new Set();
  const w4villagersDmgMaj = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    const isScholar = (e.by === bearerAtKill || e.by === 'player');
    if (isScholar) w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }

  // KILLDISC-attributed wave-4 kills (damage by source).
  const w4killRows = [];
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      const d = k.dmg || {};
      const sD = Math.round(d.scholar || 0), cD = Math.round(d.companion || 0), oD = Math.round(d.other || 0);
      const tot = sD + cD + oD;
      const nonScholarShare = tot > 0 ? (cD + oD) / tot : 0;
      const dmgMaj = nonScholarShare >= 0.5;
      const bearerAtKill = bearerByDay[k.day] != null ? bearerByDay[k.day] : scholarVid;
      const killTimeVillager = k.by && k.by !== bearerAtKill && k.by !== 'player';
      if (killTimeVillager && dmgMaj && k.by) w4villagersDmgMaj.add(k.by);
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        bearerAtKill, killTimeVillager: !!killTimeVillager,
        dmgScholar: sD, dmgCompanion: cD, dmgOther: oD,
        nonScholarShare: Math.round(nonScholarShare * 100) / 100, dmgMaj,
      });
    }
  } catch (e) {}

  // Scholar-fight mortality watch.
  let scholarCombatDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      if (dd.player && /combat|fight|monster|wound|bleed|titan/i.test(String(dd.cause || ''))) scholarCombatDeaths++;
    }
  } catch (e) {}

  // Wave-4 engagement events (killdisc v2 startCombat census) + feasted-at-entry.
  let w4EngageEvents = 0, w4EngageFeasted = 0;
  const w4EngageDetail = [];
  try {
    for (const e of (t.engagements || [])) {
      if ((e.wave | 0) !== 4 || !e.started) continue;
      w4EngageEvents++;
      const ff = fightFeasted.find(x => x.day === e.day && x.mid === e.mid);
      const feasted = ff ? ff.feasted : null;
      if (feasted) w4EngageFeasted++;
      w4EngageDetail.push({ day: e.day, mid: e.mid, partySize: e.partySize, fightId: e.fightId, feasted });
    }
  } catch (e) {}

  // Death causes.
  const deathCauses = {};
  let starvationDeaths = 0, villagerCombatDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String(dd.cause || 'unknown').slice(0, 40);
      deathCauses[c] = (deathCauses[c] | 0) + 1;
      if (/starv/i.test(c)) starvationDeaths++;
      if (!dd.player && /combat|fight|monster|wound|bleed/i.test(c)) villagerCombatDeaths++;
    }
  } catch (e) {}

  const armedFeasts = feastCalls.filter(f => f.ok && f.armed).map(f => f.day);
  const allFeasts = feastCalls.filter(f => f.ok).length;

  const r = {
    seed, policy: tag, arm: ARM,
    anchorCommit: ANCHOR,
    substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1' + (ARM === 'feastdisc' ? ' FEASTDISC=1' : ''),
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled,
    days: gameDays, endReason: (Game.over ? 'over' : 'done'),
    // primary (kill-time) + damage-majority alongside
    w4kills: w4.length,
    nW4Villagers: w4villagers.size, w4villagerVids: [...w4villagers],
    nW4VillagersDmgMaj: w4villagersDmgMaj.size, w4villagerVidsDmgMaj: [...w4villagersDmgMaj],
    w4scholarKills, w4killRows,
    // mechanism: feasts staged + feasted engagements
    fdTele, armedFeastDays: armedFeasts, nArmedFeasts: armedFeasts.length, nFeasts: allFeasts,
    w4EngageEvents, w4EngageFeasted, w4EngageDetail,
    // guardrails
    deathCauses, starvationDeaths, villagerCombatDeaths, scholarCombatDeaths,
    instrumentErrors: t.instrumentErrors,
  };
  const fn = path.join(EVID, `${ARM}-${base.replace('feast', '')}-s${seed}.json`);
  fs.writeFileSync(fn, JSON.stringify(r, null, 1));
  console.log(`done ${r.policy} s${seed}: wave5=${r.wave5} w4=${r.w4kills} villW4=${r.nW4Villagers} villW4dm=${r.nW4VillagersDmgMaj} schW4=${r.w4scholarKills} feasts=${r.nFeasts} armedF=${r.nArmedFeasts} fdStaged=${fdTele.feastsStaged} engage4=${r.w4EngageEvents} engage4f=${r.w4EngageFeasted} starv=${r.starvationDeaths} days=${r.days} end=${r.endReason} won=${r.won}`);
  return r;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const b of BASES) {
      const base = normBase(b);
      rows.push(await oneRun(seed, base));
    }
  }
  const tot = (k) => rows.reduce((a, r) => a + (r[k] | 0), 0);
  console.log(`ARM=${ARM} n=${rows.length} w4kills=${tot('w4kills')} villW4seeds=${rows.filter(r => r.nW4Villagers >= 1).length} villW4dmSeeds=${rows.filter(r => r.nW4VillagersDmgMaj >= 1).length} feasts=${tot('nFeasts')} armedF=${tot('nArmedFeasts')} fdStaged=${rows.reduce((a, r) => a + ((r.fdTele && r.fdTele.feastsStaged) | 0), 0)} engage4=${tot('w4EngageEvents')} engage4f=${tot('w4EngageFeasted')} starv=${tot('starvationDeaths')} won=${tot('won')} national=${tot('national')}`);
})().catch(e => { console.error('SWEEP FATAL', e); process.exit(1); });
