#!/usr/bin/env node
// sweep-wave4hunt-r3-20261021.js — sim-wave4hunt-r3 PILOT/CONFIRM sweep.
//
// 8 PRE-SCREENED seeds {64406,64703,64858} (known wave-4+wave-5 unlockers,
// windowreach-r2) + {64843,64847,64841,64842,64844} (twovets corpus,
// wave-4 unlocked / wave-5 not) x {leadfeast, belongfeast} x
// {control, wave4hunt} = 32 configs, 180d death-aware, paired identical
// seeds, on the pinned winning substrate (FEASTSCALE_R13=1 TRIBFLOOR=1
// WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1;
// no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS):
//
//   control  = VCE.armedFor(base): the VGEAR=1 stack (WAVE4HUNT_R3 unset)
//   wave4hunt = W4H3.armedFor(base): WAVE4HUNT_R3=1 OUTSIDE the same stack (VGEAR=1)
//
// Composition honesty pinned by scripts/test-wave4hunt-r3-20261021.js (all
// gates GREEN) BEFORE this sweep ran.
//
// Instruments: KILLDISC=1 v2 (scripts/killdisc-instrument-20261021.js —
// read-only per-source tbDamage attribution on wave-3+ monsters + daily
// readiness census) + a call-through daily w5-readiness sample + w4h3 layer
// counters (counts only).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-wave4hunt-r3/ and prints a summary.
//
// Usage (pilot: 4 seeds x 2 policies x 2 arms = 16 configs):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   ARM=control SEEDS=64406,64703,64858,64843 node scripts/sweep-wave4hunt-r3-20261021.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   WAVE4HUNT_R3=1 ARM=wave4hunt SEEDS=64406,64703,64858,64843 node scripts/sweep-wave4hunt-r3-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
// KILL-PROTOCOL INFO-SKIP: if the composition is deleted (W4H3_KILLED=1
// set by the coordinator after a killed arm), this sweep exits green with an
// INFO-SKIP instead of FATAL-ing.
let W4H3 = null, VCE = null;
try {
  W4H3 = require(path.join(REPO, 'scripts', 'policies', 'wave4hunt-r3'));
  VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
} catch (e) {
  if (process.env.W4H3_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/wave4hunt-r3.js deleted per kill protocol (sim-wave4hunt-r3 NO-GO) — sweep not applicable.');
    process.exit(0);
  }
  throw e;
}
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// WINNING-SUBSTRATE guard (the pinned substrate + VGEAR; KILLDISC v2).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate + VGEAR).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'wave4hunt') { console.error('SWEEP STOP: ARM must be control|wave4hunt.'); process.exit(2); }
if (ARM === 'wave4hunt' && process.env.WAVE4HUNT_R3 !== '1') { console.error('SWEEP STOP: WAVE4HUNT_R3=1 required for ARM=wave4hunt.'); process.exit(2); }
if (ARM === 'control' && ('WAVE4HUNT_R3' in process.env)) { console.error('SWEEP STOP: WAVE4HUNT_R3 must be unset for ARM=control.'); process.exit(2); }

// Inline banned/used-seed assertion. The arm's seeds are deliberately
// PRE-SCREENED (not fresh) — the assertion guards against banned/broken
// seeds and typos, not against prior use. EXPECTED_SEEDS is the full
// pre-registered set (pilot + confirm); the sweep runs the SEEDS subset.
const BANNED = new Set();
for (const [a, b] of [[4201, 4208], [4301, 4308], [4401, 4408], [4501, 4508], [4601, 4608],
  [4801, 4808], [4901, 4908], [5101, 5108], [5111, 5118], [5201, 5208], [5411, 5426],
  [5601, 5608], [6201, 6208], [6301, 6308], [7001, 7008], [7501, 7508], [7601, 7608],
  [99101, 99108], [105101, 105104]]) for (let s = a; s <= b; s++) BANNED.add(s);
for (const s of [4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 4819, 4820, 4821, 4822,
  6417, 6418, 6419, 6420, 6421, 6422, 6423, 6424,
  6810, 6811, 6813, 6814, 6815, 6816, 6817, 6912,
  8811, 8812, 8813, 8814,
  9292, 9293, 9294, 9295, 9921, 9922, 9923, 9924, 9925, 9926, 9927, 9928,
  17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018]) BANNED.add(s);
// Pre-registered set: {64406,64703,64858} known wave-4+wave-5 unlockers +
// {64843,64847} twovets wave-4-on-both-policies + {64841,64842,64844}
// twovets wave-4-on-belongfeast (seed order). Pilot = first 4.
const EXPECTED_SEEDS = [64406, 64703, 64858, 64843, 64847, 64841, 64842, 64844];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64406, 64703, 64858, 64843]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error('FATAL: seed ' + s + ' is on the banned/used list.'); process.exit(2); }
  if (!EXPECTED_SEEDS.includes(s)) { console.error('FATAL: seed ' + s + ' is not in the pre-registered set ' + EXPECTED_SEEDS.join(',') + '.'); process.exit(2); }
}
console.log('seed assertion OK: ' + SEEDS.join(',') + ' (banned-list clean, pre-registered set)');

const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-wave4hunt-r3');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// Paired composition: control = the VGEAR=1 stack; armed = WAVE4HUNT_R3=1
// OUTSIDE the same stack. WAVE4HUNT_R3 is the only switch.
function policyFor(base) { const t = W4H3.normBase(base); return ARM === 'wave4hunt' ? W4H3.armedFor(t) : VCE.armedFor(t); }
function policyTag(base) { return W4H3.normBase(base) + (ARM === 'wave4hunt' ? '-wave4hunt-r3' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'wave4hunt-r3', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Daily w5-readiness sample (call-through, pure reads) + w4h3 counters.
  const w5census = [];
  let lastCtx = null;
  let uninstallW5 = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
          w5census.push({ day: ((Game.state || {}).scholar || {}).day || 0,
            veterans: r ? (r.veterans | 0) : null, short: r ? (r.short || []).slice() : null });
        } catch (e) { t.instrumentErrors.push('w5census: ' + String((e && e.message) || e)); }
        return oSleep(...a);
      };
      uninstallW5 = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  // Wrap the policy's daily to capture the harness ctx (w4h3 counters live
  // there; counts only, zero state writes, zero RNG draws) and to sample
  // the bearer (scholar vid) per day — wave-4 kills are attributed
  // KILL-TIME (bearer on the kill's day), not end-of-run: succession
  // churn would otherwise misattribute villager kills as scholar kills.
  const oDaily = policy.daily;
  const bearerByDay = {};
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  // Layer telemetry: call-through observation on the layer's verbs (counts
  // only).
  const tele = { donations: 0, invites: 0 };
  let uninstallTele = null;
  try {
    const oDon = Game.donateWeapon ? Game.donateWeapon.bind(Game) : null;
    const oInv = Game.inviteToParty ? Game.inviteToParty.bind(Game) : null;
    if (oDon) Game.donateWeapon = function (...a) { try { tele.donations++; } catch (e) {} return oDon(...a); };
    if (oInv) Game.inviteToParty = function (...a) { try { tele.invites++; } catch (e) {} return oInv(...a); };
    uninstallTele = () => {
      try { if (oDon) Game.donateWeapon = oDon; } catch (e) {}
      try { if (oInv) Game.inviteToParty = oInv; } catch (e) {}
    };
  } catch (e) {}

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallW5) uninstallW5(); } catch (e) {}
  try { uninstallKD(); } catch (e) {}
  try { if (uninstallTele) uninstallTele(); } catch (e) {}

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

  // Terminal waveKillLog — the PRIMARY judge line (brief), attributed
  // KILL-TIME: villager kill = w=4, by != bearer-on-that-day, by !=
  // 'player'; scholar kill = by == bearer-on-that-day or by == 'player'.
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villagers = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    if (e.by === bearerAtKill || e.by === 'player') w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }

  // w4h3 layer counters from the captured ctx.
  const w4h3 = {};
  try {
    for (const k of Object.keys(lastCtx || {})) if (/^w4h3/.test(k)) w4h3[k] = lastCtx[k];
  } catch (e) {}

  // KILLDISC-attributed wave-4 kills (damage by source at kill time).
  const w4killRows = [];
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        dmgScholar: k.dmg ? Math.round(k.dmg.scholar || 0) : null,
        dmgCompanion: k.dmg ? Math.round(k.dmg.companion || 0) : null,
        dmgOther: k.dmg ? Math.round(k.dmg.other || 0) : null,
      });
    }
  } catch (e) {}

  // w5 veterans bar: end-of-run + max over the daily census.
  let w5vetsEnd = 0;
  try { const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; w5vetsEnd = (r && r.veterans) | 0; } catch (e) {}
  let w5vetsMax = w5vetsEnd;
  try { for (const c of w5census) if ((c.veterans | 0) > w5vetsMax) w5vetsMax = c.veterans | 0; } catch (e) {}

  // Wave-4 fights by channel (backlog #749 split): herald vs monster.
  const w4channels = { heraldFights: 0, monsterFights: 0, heraldRefused: 0 };
  try {
    for (const g of (t.engagements || [])) {
      if ((g.wave | 0) !== 4) continue;
      let isTitan = false;
      try { isTitan = !!(Game.isTitan && Game.isTitan(g.mid)); } catch (e) {}
      if (g.started === false) { if (isTitan) w4channels.heraldRefused++; continue; }
      if (isTitan) w4channels.heraldFights++; else w4channels.monsterFights++;
    }
  } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  let villagerCombatDeaths = 0, starvationDeaths = 0, scholarDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || '');
      if (/starv/i.test(c)) starvationDeaths++;
      if (dd.player) scholarDeaths++;
      if (!dd.player && /combat|fight|monster|wound|bleed|titan/i.test(c)) villagerCombatDeaths++;
    }
  } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc-v2+w5census+w4h3counters',
    substrate: 'winning substrate + VGEAR (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS)' + (ARM === 'wave4hunt' ? ' +WAVE4HUNT_R3=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled, winTrack,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    // PRIMARY judge line (brief): runs with >=1 villager wave-4 kill
    // (kill-time attributed).
    w4kills: w4.length,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4Villagers: w4villagers.size,
    villagerW4Kill: w4villagers.size >= 1 ? 1 : 0,
    w4scholarKills,
    w4killsDetail: w4.map(e => ({ d: e.d, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), via: e.via, bearerAtKill: bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid })),
    w4killRows,
    w4channels,
    // mechanism
    w4h3,
    donations: tele.donations, invites: tele.invites,
    partyEnd: (() => { try { return (Game.partyMembers ? Game.partyMembers() : []).length; } catch (e) { return 0; } })(),
    instrumentErrors: t.instrumentErrors,
    deathCauses, villagerCombatDeaths, starvationDeaths, scholarDeaths,
    w5censusDays: w5census.length,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const tag = policyTag(base);
      process.stdout.write(`run ${ARM} ${tag} s${seed} ... `);
      const r = await oneRun(seed, base);
      rows.push(r);
      console.log(`done d${r.gameDays} w4=${r.wave4} w5=${r.wave5} won=${r.won} villW4=${r.villagerW4Kill} schW4=${r.w4scholarKills} w4h3Sorties=${(r.w4h3 || {}).w4h3Sorties | 0}`);
    }
  }
  const nV = rows.filter(r => r.villagerW4Kill).length;
  console.log(`\n${ARM}: ${rows.length} configs, ${nV} with >=1 villager wave-4 kill`);
  const errs = rows.reduce((t, r) => t + ((r.instrumentErrors || []).length), 0);
  if (errs) { console.error(`FATAL: ${errs} instrument errors`); process.exit(1); }
})();
