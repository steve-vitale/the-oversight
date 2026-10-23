#!/usr/bin/env node
// sweep-havencontact.js — sim-havencontact PILOT census sweep.
//
// DIAG census (no lever): 8 seeds (65801-65808 — the havendraw seed block, for
// comparability) x {leadfeast, belongfeast} = 16 configs, 180d death-aware, on
// the mantlechain DIAG substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 (no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/
//   VETREL/VGEARBEATS/TWOVETS/VGEAR/WAVE4ENGAGE/FEASTDISC)
//
//   policy = AD.armedFor(AD.normBase(base)) — the substrate control stack,
//   no policy layers added or removed.
//
// Instruments (all read-only, RNG-neutral; proven by scripts/test-havencontact.js):
//   - scripts/mantlechain-instr-20261022.js — succession events, wave-4
//     combat_start rows, death rows with live-fight wave context, say windows
//   - scripts/diag-havencontact.js (havencontact namespace) — per-fight origin
//     classification with the havencontact split (player field@haven vs true
//     field), combat_end companion damage, raid events, muster transitions,
//     feast-draw events. Installed OUTSIDE the mantlechain wraps; uninstalls
//     inside-out.
//   - daily bearer <redacted> via policy.daily wrap (kill-time attribution)
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-havencontact/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SEEDS=65801,65802 \
//   node scripts/sweep-havencontact.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const MC = require(path.join(REPO, 'scripts', 'mantlechain-instr-20261022'));
const HC = require(path.join(REPO, 'scripts', 'diag-havencontact'));

// Pinned substrate guard (nothing else).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (mantlechain DIAG substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'FEASTDISC', 'RESTRAINT']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65801, 65802, 65803, 65804, 65805, 65806, 65807, 65808]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-havencontact');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const TRAP_IDS = new Set(['deadfall_trap', 'box_trap', 'minnow_trap', 'pit_trap', 'snare', 'snare_wire']);

function policyFor(base) { return AD.armedFor(AD.normBase(base)); }
function policyTag(base) { return AD.normBase(base); }
function gday(Game) { try { return ((Game.state.scholar || {}).day) || 0; } catch (e) { return 0; } }
function nameOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
  return String(vid || '?').slice(0, 14);
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

// Sense material (havencontact namespace): say lines around havencontact
// wave-4+ fights (±1d) — for the SENSE-TEST (do havencontact fights read as
// ambient contact or as assaults? do scholar deaths in this channel read
// with weight?), plus raid/muster context windows.
function senseWindows(Game, T, HCt) {
  const rx = /raid|assault|muster|palisade|defend|met them|door|watch|treeline|scout|breach|killed|slain|died|death|dead|strike|fight|party|wave|veteran|wound|feast|draw|drawn|scavenger|linger|siege|sortie|contact|bump|stumble|appeared|emerged/i;
  const out = [];
  const push = (label, lo, hi) => {
    const win = T.sayAll.filter(l => l.day >= lo && l.day <= hi && rx.test(l.text));
    if (win.length) out.push({ label, lo, hi, lines: win.slice(0, 120).map(l => `[d${l.day}] ${l.text}`) });
  };
  for (const f of (HCt.fights || [])) {
    if ((f.wave | 0) >= 4 && f.origin === 'havencontact') push(`W4 HAVENCONTACT d${f.day}: ${f.mid} feasted=${f.feasted} party=${(f.party || []).length}`, f.day - 1, f.day + 1);
  }
  for (const r of (HCt.raids || [])) {
    if (r.fired) push(`RAID d${r.day}: n=${r.n} waves=[${(r.raiders || []).map(x => x.wave).join(',')}] palisade=${r.palisade} reach=${r.reachMid || '-'}`, r.day - 2, r.day + 2);
  }
  for (const m of (HCt.musters || [])) {
    if (m.kind === 'muster') push(`MUSTER d${m.day}: n=${m.n} sheltered=${m.sheltered} threat=${m.threat}`, m.day - 1, m.day + 1);
  }
  return out;
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'havencontact-pilot', fullTelemetry: false });
  const inst = MC.installMantlechain(Game);
  const hc = HC.installHavencontact(Game);

  // Daily bearer <redacted> (kill-time attribution).
  const oDaily = policy.daily;
  const bearerByDay = {};
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  hc.uninstall();
  inst.uninstall();

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const sg = Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : null; if (sg != null && sg >= 200) table = 1; } catch (e) {}
  let maxWave = 1;
  try { maxWave = Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let maxArc = 1, tier = 0, stage = 0, breadth = 0;
  try { maxArc = (Game.progState() || {}).arc || 1; } catch (e) {}
  try { tier = (Game.havenTier ? Game.havenTier() : 0) || 0; } catch (e) {}
  try { stage = Game.integrationStage(); } catch (e) {}
  try { breadth = Game.codexBreadth(); } catch (e) {}
  let maxScale = 'village';
  try { maxScale = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
  let realmMax = 0, successionNotes = 0, successionSurvived = 0, successionSnapped = 0;
  try {
    const links = (Game.hierarchyState ? Game.hierarchyState() : []) || [];
    for (const l of links) {
      let sz = 1 + ((l.subs || []).length || 0);
      if (l.primary && l.subs) sz = 1 + l.subs.length;
      if (sz > realmMax) realmMax = sz;
      for (const h of (l.history || [])) {
        if (h.kind === 'succession') {
          successionNotes++;
          if (String(l.status || '').toLowerCase() === 'active') successionSurvived++;
          else successionSnapped++;
        }
      }
    }
  } catch (e) {}

  // Wave-4+ kills with kill-time bearer attribution.
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) >= 4);
  const w4villagers = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    if (e.by === bearerAtKill || e.by === 'player') w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }

  // Death causes.
  const deathCauses = {};
  let villagerCombatDeaths = 0, starvationDeaths = 0, scholarCombatDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (/starv/i.test(c)) starvationDeaths++;
      if (/combat|fight|monster|wound|bleed|titan/i.test(c)) {
        if (dd.player) scholarCombatDeaths++;
        else villagerCombatDeaths++;
      }
    }
  } catch (e) {}

  // Traps by source (craft tele vs loot_dropped tele).
  let trapsCrafted = 0, trapsLooted = 0;
  try {
    for (const ev of (st.telemetry || [])) {
      if (ev.type === 'craft' && TRAP_IDS.has(ev.id)) trapsCrafted++;
      if (ev.type === 'loot_dropped' && TRAP_IDS.has(ev.id)) trapsLooted++;
    }
  } catch (e) {}

  // Counters.
  let countersDiscovered = 0, counterTeleCount = 0, counterKillProxy = 0;
  try { countersDiscovered = Object.keys(st.monsterCounters || {}).length; } catch (e) {}
  try { for (const ev of (st.telemetry || [])) if (ev.type === 'counter_discovered') counterTeleCount++; } catch (e) {}
  try {
    const wl = st.waveLedger || {};
    for (const w of Object.keys(wl)) for (const t of Object.keys(wl[w].perType || {})) if (wl[w].perType[t] >= 2) counterKillProxy++;
  } catch (e) {}

  // Village-days (exposure normalization denominator).
  let villageDays = 0;
  try { villageDays = ((result.samples.villageDays != null) ? result.samples.villageDays : (result.days || 0)); } catch (e) { villageDays = result.days || 0; }

  const waveKillLog = [];
  try {
    for (const e of wkl) {
      if (!e) continue;
      waveKillLog.push({ d: e.d | 0, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), w: e.w | 0, via: e.via || null });
    }
  } catch (e) {}

  const out = {
    seed, base, policy: tag,
    instrument: 'mantlechain (successions + wave-4 fights + deaths) + havencontact (origin-classified fights/vfights incl. havencontact split, combat_end companion damage, raids, musters, draws) + daily bearer <redacted>',
    substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, maxArc, maxScale, realmMax, tier, stage, breadth,
    days: result.days, endReason: result.endReason,
    villageDays,
    // mantlechain rows
    successions: inst.T.successions,
    mcFights: inst.T.fights,
    deaths: inst.T.deaths,
    waveKillLog,
    bearerByDay,
    scholarVid,
    // havencontact rows
    fights: hc.T.fights, ends: hc.T.ends, vfights: hc.T.vfights,
    raids: hc.T.raids, musters: hc.T.musters, draws: hc.T.draws,
    senseWindows: senseWindows(Game, inst.T, hc.T),
    sayLinesTotal: inst.T.sayAll.length,
    instrumentErrors: inst.T.instrumentErrors.concat(hc.T.instrumentErrors),
    // wall metrics
    w4kills: w4.length, nW4Villagers: w4villagers.size, w4scholarKills,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    deathCauses, villagerCombatDeaths, starvationDeaths, scholarCombatDeaths,
    trapsCrafted, trapsLooted,
    countersDiscovered, counterTeleCount, counterKillProxy,
    successionNotes, successionSurvived, successionSnapped,
  };
  const fp = path.join(EVID, `census-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1) + '\n');
  console.log(`done: seed=${seed} base=${tag} days=${result.days} end=${result.endReason} wave=${maxWave} scale=${maxScale} fights=${hc.T.fights.length} vfights=${hc.T.vfights.length} raids=${hc.T.raids.filter(r=>r.fired).length}`);
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const tag = policyTag(base);
      const fp = path.join(EVID, `census-${tag}-s${seed}.json`);
      if (fs.existsSync(fp)) { console.log(`SKIP (exists): ${path.basename(fp)}`); continue; }
      try { rows.push(await oneRun(seed, base)); }
      catch (e) { console.error(`RUN FAILED seed=${seed} base=${tag}:`, String((e && e.stack) || e)); process.exitCode = 1; }
    }
  }
  console.log(`\n${rows.length} configs written to ${EVID}`);
})();
