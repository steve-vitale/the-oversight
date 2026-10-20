#!/usr/bin/env node
// probe-readiness-audit-20261020.js — wave-5 readiness-gate DIAGNOSTIC AUDIT
// instrument (flesh-out loop run fleshout-20261020T1915Z, arm sim-readiness-audit,
// axis scale-onramp — the blocking axis).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. The instrument wraps the policy daily with PURE engine reads
// (no state writes, no RNG draws) — the DET gate pins instrument-on vs
// instrument-off byte-identical trajectories.
//
// WHAT THIS AUDITS (design call #4, src/js/standing.js waveCombatReadiness):
// the w5doormeasure stall attribution (evidence/2026-10-20/
// w5doormeasure-stall-attribution.md) showed eligible runs stalling on
// veterans 0-1/2, armor 0-3/4, weapons 0-5/6 (all terminally). This arm
// instruments WHAT THE GATE COUNTS vs WHAT THE VILLAGE ACTUALLY HOLDS,
// per leg, per day in the deferral(5) window, plus a terminal census:
//   ARMORED — gate: living roster with armor WORN at P>=15 (S.equipment.
//     armorOf on vp.equipped; scholar via armorBonus on state.scholar.
//     equipped). Census adds: armor in packs (vp.items) not worn, armor in
//     own stashes (person.stashed) not fetched. Note: no communal armor
//     pile exists (depositable stash sections are weapons/medicine only).
//   ARMED — gate: living roster with a weapon TO HAND (equipped melee/
//     ranged, or a weapon item carried in pack — carriesWeapon). Census
//     adds: the village ARMORY stock (stashState().weapons units) — NOT on
//     any villager, invisible to the leg until borrowed via villagerGearUp/
//     villagerGearDay. Also carried-not-equipped (already counted — proves
//     the census reports the gate honestly in both directions).
//   TRICKS — gate: monsterCounterKnown over state.monsterCounters keys
//     (requires the def to carry a `counter` field). Census adds: the known
//     mid list; waves 3-5 are deliberately counter-less (discoverMonster-
//     Counter fails closed without a counter field) — by design, not a gap.
//   VETERANS — gate: distinct killer vids in state.waveKillLog with w>=4,
//     LIVING only (VETSHAPE unset in this substrate — default OFF, the
//     pristine living-veterans behavior; do NOT change it). Census adds the
//     VETSHAPE=1 SHADOW (living-or-dead distinct killers — Steve's #427
//     instrument, computed manually, env never set so the engine's gate
//     stays pristine), per-killer living/dead + first-kill day, and
//     unattributed kills (by=null).
//
// EVALUATION TIMING (from code reading, documented in the evidence file):
// the gate is a LAZY read of persistent state — unlockedWave() (the only
// engine reader) calls it at spawn/cast/kill/unlock-check moments; the
// hold beat is the only scheduled consumer (initial + 7-day reminders).
// Gear state persists, so there is no race: villagerGearUp(acquire=true)
// at departure (patrols/expeditions), villagerGearDay() daily greedy
// allocation, re-equip at fight entry (acquire=false).
//
// SUBSTRATE (EXACT w5doormeasure stack — same seeds, same policies, same
// env + KILLDISC=1 per the brief): policy
//   withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1
//   (VETREL/REPOSITION unset -> those layers inert; SEATDRIVE=0 -> seatdrive
//   pure delegation; VETSHAPE unset -> veterans bar is living-only.)
// KILLDISC installs the landed read-only tbDamage attribution instrument
// (counts only, zero state writes, zero RNG draws — det-pinned by its own
// proof; the DET here keeps KILLDISC=1 on BOTH arms so the delta is only
// this instrument).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   node scripts/probe-readiness-audit-20261020.js
//   SMOKE=1 ...        # short smoke: both policies drive, census records live
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="65111,65112" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-w5path-20261019'); // policyFor: the landed w5census policy stack (composed, never edited)
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261018');

// SUBSTRATE GUARD — the brief's exact env. SEATDRIVE must be '0' (not '1',
// not unset): pre-seat arm. VETREL/REPOSITION must NOT be '1' (inert).
// VETSHAPE must NOT be '1': the veteran bar under audit is the pristine
// living-only default (Steve's #427 shadow is computed, never enabled).
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (readiness-audit substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat — this is the readiness-audit arm).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION', 'VETSHAPE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must NOT be 1 (readiness-audit substrate).`); process.exit(2); }
}
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65111, 65112, 65113, 65114, 65115, 65116, 65117, 65118]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-readiness-audit');
const isBare = () => process.env.RDAUDIT_BARE === '1';

function gday(G) { try { return (G.state && G.state.scholar && G.state.scholar.day) | 0 || 0; } catch (e) { return 0; } }

// censusReadiness(G, wave): the gate's EXACT numbers + the true-held census.
// PURE: no state writes, no RNG draws. The gate half comes from the engine's
// own waveUnlockReady(w) (the exact object the deferral reads); the census
// half re-reads the same sources the gate reads (roster, vp records, stash,
// waveKillLog, monsterCounters) with the "what the village holds" lens.
//
// Scholar armor: the gate reads this.armorBonus() which calls
// migrateEquipment(state.scholar) — a WRITE (idempotent legacy-slot move).
// The census must not trigger it (DET), so it replicates the read on a
// deep copy: same migrate logic, same armorOf math, zero writes.
function migrateCopy(eq) {
  const c = JSON.parse(JSON.stringify(eq || {}));
  const move = (from, to) => { if (c[from] && !c[to]) { c[to] = c[from]; delete c[from]; } };
  move('armor', 'torso'); move('feet', 'shoes');
  move('misc1', 'acc1'); move('misc2', 'acc2'); move('misc3', 'acc3');
  return c;
}
function censusReadiness(G, wave) {
  const out = { wave, d: gday(G), gate: null, demand: null, living: 0,
    armor: { count: 0, near: [], woreNothing: 0 },
    weapons: { count: 0, carriedNotEquipped: 0, unarmed: 0, armoryUnits: 0, armoryList: [] },
    tricks: { count: 0, known: [] },
    veterans: { count: 0, shadow: 0, killers: [], unattributed: 0 } };
  try {
    const rd = G.waveUnlockReady ? G.waveUnlockReady(wave) : null;
    if (rd) {
      out.gate = { armored: rd.armored | 0, armed: rd.armed | 0, tricks: rd.tricks | 0,
        veterans: rd.veterans | 0, short: Array.isArray(rd.short) ? rd.short.slice() : [], ready: !!rd.ready };
      out.demand = rd.demand || null;
    }
  } catch (e) { out.gate = { error: String((e && e.message) || e) }; }
  const dem = out.demand || {};
  const armorP = (dem.armorP | 0) || 0;
  const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
  const eq = S.equipment || null;
  const itemDefs = (G.data && G.data.items) || [];
  const defOf = (iid) => { for (const d of itemDefs) { if (d && d.id === iid) return d; } return null; };
  const iidOf = (e) => (typeof e === 'string') ? e : (e && (e.itemId || e.id));
  const armorProtOf = (iid) => { const d = defOf(iid); return (d && d.armor && d.armor.protection) | 0; };
  const isWeaponDef = (iid) => { const d = defOf(iid); return !!(d && d.weapon); };
  const scholarId = G.villagerId;
  const roster = ((G.state && G.state.village && G.state.village.roster) || []);
  const vpCache = {};
  const vpOf = (vid) => {
    if (vid === scholarId) return null;
    if (!(vid in vpCache)) {
      let vp = null;
      try { vp = (typeof G.vpOf === 'function') ? G.vpOf(vid) : null; } catch (e) { vp = null; }
      vpCache[vid] = vp;
    }
    return vpCache[vid];
  };
  const nameOf = (vid) => {
    try {
      if (vid === scholarId) return 'scholar';
      const vp = vpOf(vid);
      return (vp && (vp.name || vp.disp)) || String(vid);
    } catch (e) { return String(vid); }
  };
  const isLivingVid = (vid) => {
    if (vid === scholarId) return true;
    const vp = vpOf(vid);
    return !!(vp && !vp.dead);
  };
  for (const vid of roster) {
    if (!isLivingVid(vid)) continue;
    out.living++;
    const isScholar = vid === scholarId;
    const vp = isScholar ? null : vpOf(vid);
    // ---- armor: the gate reads WORN only (armorOf on vp.equipped;
    // scholar via armorBonus on state.scholar.equipped). Packs and own
    // stashes do NOT count — the census names the near-misses.
    let wornP = 0;
    try {
      if (isScholar) {
        const schEq = migrateCopy((G.state && G.state.scholar && G.state.scholar.equipped) || {});
        wornP = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf({ equipped: schEq }, itemDefs) | 0) : 0;
        // armorBonus also adds modTarget('armor.flat') — replicate honestly.
        try { const flat = (typeof G.modTarget === 'function') ? (G.modTarget('armor.flat', 0) | 0) : 0; if (flat > 0) wornP += flat; } catch (e2) {}
      } else {
        wornP = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) | 0) : 0;
      }
    } catch (e) {}
    const heldIds = (isScholar
      ? ((G.state && G.state.scholar && G.state.scholar.inventory) || [])
      : ((vp && vp.items) || [])).map(iidOf).filter(Boolean);
    const stashIds = isScholar ? [] : (((vp && vp.stashed) || []).map(iidOf).filter(Boolean));
    let packBest = 0, packBestId = null;
    for (const iid of heldIds) { const p = armorProtOf(iid); if (p > packBest) { packBest = p; packBestId = iid; } }
    let stashBest = 0, stashBestId = null;
    for (const iid of stashIds) { const p = armorProtOf(iid); if (p > stashBest) { stashBest = p; stashBestId = iid; } }
    if (wornP >= armorP) { out.armor.count++; }
    else if (packBest >= armorP) {
      out.armor.near.push({ vid: String(vid), name: nameOf(vid), wornP, mech: 'pack-not-worn', item: packBestId, p: packBest });
    } else if (stashBest >= armorP) {
      out.armor.near.push({ vid: String(vid), name: nameOf(vid), wornP, mech: 'own-stash-not-fetched', item: stashBestId, p: stashBest });
    } else {
      out.armor.woreNothing++;
    }
    // ---- weapons: the gate reads equipped melee/ranged OR a weapon item
    // carried (carriesWeapon). The census records the channel — and the
    // armory stock below, which is on NO villager.
    let armed = false, viaW = 'none', wId = null;
    try {
      if (isScholar) {
        const schEq = migrateCopy((G.state && G.state.scholar && G.state.scholar.equipped) || {});
        const wslot = schEq.melee || schEq.ranged || schEq.weapon;
        if (wslot) { armed = true; viaW = 'scholar-equipped'; wId = iidOf(wslot); }
      } else if (eq && ((typeof eq.meleeWeaponOf === 'function' && eq.meleeWeaponOf(vp)) || (typeof eq.rangedWeaponOf === 'function' && eq.rangedWeaponOf(vp)))) {
        armed = true; viaW = 'equipped';
      }
    } catch (e) {}
    if (!armed) {
      for (const iid of heldIds) { if (isWeaponDef(iid)) { armed = true; viaW = 'carried'; wId = iid; break; } }
    }
    if (armed) {
      out.weapons.count++;
      if (viaW === 'carried') out.weapons.carriedNotEquipped++;
    } else {
      out.weapons.unarmed++;
    }
    // keep per-fighter detail light: only the near-misses and channels
    // needed for mechanism attribution.
    void viaW; void wId;
  }
  // ---- armory stock: stashState().weapons — deposited communal weapons.
  // On NO villager: invisible to the armed leg until borrowed.
  try {
    const st = (typeof G.stashState === 'function') ? G.stashState() : null;
    const pile = (st && st.weapons) || [];
    let units = 0;
    const list = [];
    for (const e of pile) {
      const u = (e.units == null ? 1 : (e.units | 0));
      units += u;
      list.push({ id: e.itemId || e.id || null, units: u });
    }
    out.weapons.armoryUnits = units;
    out.weapons.armoryList = list;
  } catch (e) {}
  // ---- tricks: monsterCounterKnown over state.monsterCounters keys.
  try {
    const mc = (G.state && G.state.monsterCounters) || {};
    for (const mid of Object.keys(mc)) {
      if (typeof G.monsterCounterKnown === 'function' && G.monsterCounterKnown(mid)) {
        out.tricks.count++;
        out.tricks.known.push(mid);
      }
    }
  } catch (e) {}
  // ---- veterans: distinct killer vids in waveKillLog with w >= wave-1.
  // Gate = living only (VETSHAPE unset). Shadow = living-or-dead (the
  // VETSHAPE=1 shape, computed manually — the env is NEVER set, so the
  // engine's gate stays pristine).
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const seenLiving = new Set(), seenAll = new Set();
    const killerFirst = {};
    for (const e of log) {
      if (!e || ((e.w | 0) < (wave - 1))) continue;
      const by = e.by || null;
      if (!by) { out.veterans.unattributed++; continue; }
      seenAll.add(by);
      if (!(by in killerFirst)) killerFirst[by] = { d: (e.d | 0) || 0, mid: e.mid || null, via: String(e.via || 'unknown') };
      if (isLivingVid(by)) seenLiving.add(by);
    }
    out.veterans.count = seenLiving.size;
    out.veterans.shadow = seenAll.size;
    for (const by of seenAll) {
      out.veterans.killers.push({ vid: String(by), name: nameOf(by), living: isLivingVid(by),
        firstKillD: killerFirst[by].d, firstKillMid: killerFirst[by].mid, via: killerFirst[by].via });
    }
  } catch (e) {}
  return out;
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = SW.policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'readiness-audit', fullTelemetry: false });
  const kdT = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, kdT);
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const recs = [];
  const hashes = [];
  const waveTrace = { maxWave: 1, wave2Day: null, wave3Day: null, wave4Day: null, wave5Day: null };
  const bare = isBare();
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const day = gday(G);
      if (!bare) {
        // Deferral(5) is the engine's own "at the w5 door". The census runs
        // on deferral days only (post-daily state, deterministic per seed).
        let def5 = false, peak = 0, uw = 1;
        try { const df = G.standingDeferral ? G.standingDeferral(5) : null; def5 = !!(df && df.deferred); } catch (e) {}
        try { peak = (G._standingPeakWave ? G._standingPeakWave() : 0) | 0; } catch (e) {}
        try { uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) {}
        let census = null;
        if (def5) { try { census = censusReadiness(G, 5); } catch (e) { census = { error: String((e && e.message) || e) }; } }
        recs.push({ d: day, def5, peak, uw, census });
        if (uw > waveTrace.maxWave) waveTrace.maxWave = uw;
        if (uw >= 2 && waveTrace.wave2Day == null) waveTrace.wave2Day = day;
        if (uw >= 3 && waveTrace.wave3Day == null) waveTrace.wave3Day = day;
        if (uw >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = day;
        if (uw >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = day;
      }
      hashes.push(G.state.scholar.day + ':' + dayHash(Game));
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: daysNow(), manifest: undefined, sampleEvery: 30 }); });
  try { uninstallKD(); } catch (e) {}
  const deaths = {};
  const deathList = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathList.push({ day: d.day | 0, who: String(d.who || ''), player: !!d.player, kind: String(d.kind || ''), cause: String(d.cause || '') });
    }
  } catch (e) {}
  let maxWave = Math.max(result.maxWaveUnlocked || 1, waveTrace.maxWave);
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = gameDays;
    if (maxWave >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = gameDays;
    if (maxWave >= 3 && waveTrace.wave3Day == null) waveTrace.wave3Day = gameDays;
    if (maxWave >= 2 && waveTrace.wave2Day == null) waveTrace.wave2Day = gameDays;
  } catch (e) {}
  // Terminal census — the state the analyzer attributes the stall against.
  let endCensus = null;
  if (!bare) { try { endCensus = censusReadiness(Game, 5); } catch (e) { endCensus = { error: String((e && e.message) || e) }; } }
  // Terminal standing breakdown (for standing-short attribution).
  let standing = null;
  try {
    const vs = Game.villageStanding ? Game.villageStanding() : {};
    standing = { raw: (vs.total | 0) || 0, war: (vs.war | 0) || 0, dip: (vs.diplomacy | 0) || 0,
      plenty: (vs.plenty | 0) || 0, warPts: (vs.warPts | 0) || 0, links: (vs.links | 0) || 0,
      feasts: (vs.feasts | 0) || 0, capped: Game.standingPlentyCappedTotal ? (Game.standingPlentyCappedTotal() | 0) : -1 };
  } catch (e) { standing = null; }
  // Full waveKillLog for killer-class + window-mortality attribution.
  let killLog = [];
  try {
    for (const e of ((Game.state && Game.state.waveKillLog) || [])) {
      killLog.push({ d: (e.d | 0) || 0, mid: e.mid || null, w: (e.w | 0) || 0, by: e.by || null, via: String(e.via || 'unknown') });
    }
  } catch (e) {}
  const out = {
    seed, policyId, substrate: 'readiness-audit-preseat-windefer',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    deaths, deathList,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave2Day: waveTrace.wave2Day, wave3Day: waveTrace.wave3Day,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    recs, endCensus, standing, killLog, hashes,
  };
  if (process.env.RDAUDIT_NOWRITE !== '1' && !opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65111, 65112]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of dseeds) {
        delete process.env.RDAUDIT_BARE;
        const live = await runOne(seed, policyId, { noWrite: true });
        process.env.RDAUDIT_BARE = '1';
        const bareR = await runOne(seed, policyId, { noWrite: true });
        delete process.env.RDAUDIT_BARE;
        n++;
        const lh = JSON.stringify(live.hashes), bh = JSON.stringify(bareR.hashes);
        const ok = lh === bh && live.hashes.length > 0;
        console.log(`DET ${policyId}/s${seed}: ${ok ? 'IDENTICAL' : 'DIVERGED'} (${live.hashes.length} days)`);
        if (!ok) bad++;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    if (bad) { console.error(`DET FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`DET GREEN: ${n}/${n} byte-identical.`);
    return;
  }
  if (process.env.FIDELITY === '1') {
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : SEEDS.slice(0, 2)).filter(Number.isFinite);
    let bad = 0, n = 0;
    for (const policyId of POLICIES) {
      for (const seed of fseeds) {
        const fp = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { console.log(`FIDELITY SKIP ${policyId}/s${seed}: no sweep JSON`); continue; }
        const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const re = await runOne(seed, policyId, { noWrite: true });
        n++;
        const strip = (o) => { const c = Object.assign({}, o); delete c.hashes; return JSON.stringify(c); };
        const ok = strip(orig) === strip(re);
        console.log(`FIDELITY ${policyId}/s${seed}: ${ok ? 'IDENTICAL' : 'DIVERGED'}`);
        if (!ok) bad++;
      }
    }
    if (!n) { console.error('FIDELITY: nothing to compare.'); process.exit(2); }
    if (bad) { console.error(`FIDELITY FAILED: ${bad}/${n} diverged.`); process.exit(1); }
    console.log(`FIDELITY GREEN: ${n}/${n} byte-identical.`);
    return;
  }
  if (process.env.SMOKE === '1') {
    const sseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65111]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = process.env.DAYS || '10';
    for (const policyId of POLICIES) {
      for (const seed of sseeds) {
        const r = await runOne(seed, policyId, { noWrite: true });
        const ec = r.endCensus || {};
        const g = ec.gate || {};
        console.log(`SMOKE ${policyId}/s${seed}: days=${r.gameDays} end=${r.endReason} recs=${r.recs.length} maxWave=${r.maxWave} errs=0 ` +
          `census{living=${ec.living},gate=${g.armored}/${g.armed}/${g.tricks}/${g.veterans},shadow=${(ec.veterans||{}).shadow}}`);
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log('SMOKE GREEN.');
    return;
  }
  console.log(`readiness-audit sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${daysNow()}`);
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      const r = await runOne(seed, policyId);
      const g = (r.endCensus && r.endCensus.gate) || {};
      console.log(`done ${policyId}/s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} gate=${g.armored}/${g.armed}/${g.tricks}/${g.veterans} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    }
  }
  console.log('SWEEP COMPLETE.');
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}

module.exports = { policyFor: SW.policyFor, censusReadiness, runOne, SEEDS };
