#!/usr/bin/env node
// sweep-cheaptend-a.js — A CHEAPER TENDING SHAPE (measurement + pilot sweep)
// (sim-cheaptend-a, 2026-11-08, oversight-flesh-out-loop run fleshout-20261108T0015Z, axis
// food-economy. Tests the named next blank (1) from the tendsick review: whether tending
// ONLY on days the forage trip would not range anyway (capped at 2 acts/day) buys the
// fever gain without the forage cost.)
//
// MODELED on scripts/sweep-tendsick-a.js (read, own code, same harness pattern).
// Declared deltas:
//   1. Names/paths: cheaptend-a-*, corpus evidence/2026-11-07/cheaptend-a-corpus/ (baseline)
//      and cheaptend-a-corpus-armed/ (pilot, Phase B).
//   2. POLICY switch: POLICY=competent|cheaptend-a (FATAL otherwise). The cheaptend-a
//      policy module is required LAZILY, only on the armed leg, so the baseline leg
//      never loads it. Armed leg FATAL-requires CHEAPTEND_A=1; baseline leg FATALs if
//      CHEAPTEND_A=1.
//   3. NEW event wrappers (all read-only, call-through, no RNG): villageSicknessTick
//      (diff v.sick: onsets/ends), villagerFoodPoisoning (diff: food-vector onsets),
//      treatVillager / tendVillager (diff v.sick: cured/eased/wound-care/refused,
//      with the scholar's ability holdings + kcal at call time), villagerCareTick
//      (diff daysLeft: NPC-tended patients).
//   4. Daily snapshot EXTENDED: sickCount = Object.keys(v.sick).length (the real
//      record, not the prodcollapse health<50 proxy), sickNames, atHaven (scholar
//      at Haven at daily time — the layer's opportunity), scholar healing abilities
//      (herbal_remedy / field_medicine / triage held + level), scholar kcal,
//      healerPresent + medicCount, tend/treat counters from the policy module STATS
//      (armed leg; baseline reads 0). NEW in this arm: tripPlanned
//      (competent.needTrip at snapshot time — the trip decision the layer
//      reads) and eligible (sick + at Haven + no trip planned — the days
//      THIS layer could fire). All prodcollapse snapshot fields KEPT so the
//      guardrails compare like-for-like.
//   5. Flow wrappers KEPT (stockPantry, sweepSpoiled, pantryDraw, drawSpoiled,
//      stockSurplus, drawLeaguePool, pantryAdd, donateToPantry, takeFromPantryBulk/
//      takeFromPantry, _removePantryKcal, resolveOneAssignment, villagerMealDay
//      deduped rows with production factors). villagerDepleteTiles /
//      villagerHuntResolve NOT carried (not this arm's question).
//   6. BARE mode (CHEAPTEND_BARE=1): same seeds/days/policy, all recorders SKIPPED
//      except the registerDeath capture (documented exception, as in prodcollapse),
//      writes only a fingerprint per seed. The recorded run must match it exactly (G2).
//   7. Per-seed files: cheaptend-a-<policy>-s<seed>.json (+ cheaptend-a-bare-s<seed>.json).
'use strict';
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent, needTrip } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  if (require.main === module) {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
}
const POLICY = process.env.POLICY || 'competent';
const ARMED = POLICY === 'cheaptend-a';
if (POLICY !== 'competent' && POLICY !== 'cheaptend-a') {
  if (require.main === module) {
    console.error('FATAL: POLICY must be competent|cheaptend-a, got: ' + POLICY);
    process.exit(2);
  }
}
if (ARMED && process.env.CHEAPTEND_A !== '1') {
  if (require.main === module) {
    console.error('FATAL: armed leg requires CHEAPTEND_A=1');
    process.exit(2);
  }
}
if (!ARMED && process.env.CHEAPTEND_A === '1') {
  if (require.main === module) {
    console.error('FATAL: baseline leg forbids CHEAPTEND_A=1 (layer gate must be OFF)');
    process.exit(2);
  }
}
const BARE = process.env.CHEAPTEND_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const CORPUS = ARMED ? 'cheaptend-a-corpus-armed' : 'cheaptend-a-corpus';
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-07', CORPUS, 'sweep-' + POLICY + '.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-07', CORPUS);

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// Writes go through a FRESH child process per attempt. Host EPERM-flap
// denial is STICKY per process once a write fails (2026-11-07: an in-process
// retry loop failed 300/300 over ~10 min while fresh processes wrote 1.5MB
// files 5/5 in the same minute). Retrying in-process is futile; each child
// reads the payload from stdin (a pipe, never a filesystem write), writes +
// readback-verifies + renames, and exits 0/1/3.
//
// CHUNKED APPENDS (2026-11-08, this run): the flap changed shape — large
// single writes are now denied while small writes pass (measured 02:07Z:
// 100KB writes 0/60 over a minute while <=8KB writes passed repeatedly;
// a 537KB single write landed only after ~7 min of retries, and seed
// 96307's write then exhausted all 300 attempts and killed the baseline
// sweep). The child therefore appends the payload in 4KB chunks (each
// chunk its own small write), repairs a partial tail chunk by truncating
// back to the last whole-chunk boundary, and RESUMES across child attempts
// (progress persists in the tmp file; the parent respawns until the file
// is complete, then a final child readback-verifies the full bytes and
// renames). Transport only: the file bytes and the verification are
// identical to the single-write version.
const CHILD_WRITER = `
// NOTE: with node -e, argv has NO script filename: args are argv[1]/argv[2].
const fs = require('fs');
const CHUNK = 4096;
const tmp = process.argv[1], dest = process.argv[2];
const t0 = Date.now();
let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  try {
    const payload = Buffer.from(data, 'utf8');
    let size = 0;
    try { size = fs.statSync(tmp).size; } catch (e) { size = 0; }
    // Repair a partial tail chunk (a short write mid-chunk): truncate back
    // to the last whole-chunk boundary, unless the file is already complete.
    if (size > 0 && size < payload.length && size % CHUNK !== 0) {
      const good = Math.floor(size / CHUNK) * CHUNK;
      fs.truncateSync(tmp, good);
      size = good;
    }
    if (size > payload.length) { fs.truncateSync(tmp, 0); size = 0; }
    const fd = fs.openSync(tmp, 'a');
    try {
      while (size < payload.length) {
        if (Date.now() - t0 > 25000) { fs.closeSync(fd); process.exit(1); }
        const end = Math.min(size + CHUNK, payload.length);
        const buf = payload.subarray(size, end);
        let wrote = 0, tries = 0;
        while (tries++ < 200) {
          try {
            const n = fs.writeSync(fd, buf, wrote, buf.length - wrote);
            wrote += n;
            if (wrote >= buf.length) break;
          } catch (e) {
            if (Date.now() - t0 > 25000) { fs.closeSync(fd); process.exit(1); }
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
          }
        }
        if (wrote < buf.length) { fs.closeSync(fd); process.exit(1); }
        size = end;
      }
    } finally { try { fs.closeSync(fd); } catch (e) {} }
    const back = fs.readFileSync(tmp);
    if (!back.equals(payload)) process.exit(3);
    fs.renameSync(tmp, dest);
    process.exit(0);
  } catch (e) { process.exit(1); }
});
`;
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 300; i++) {
    const r = child_process.spawnSync(process.execPath,
      ['-e', CHILD_WRITER, tmp, filePath],
      { input: data, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 0) return;
    if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, 'child status=' + r.status); process.exit(2); }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500 + Math.floor(Math.random() * 2500));
  }
}

const HEAL_ABS = ['herbal_remedy', 'field_medicine', 'triage'];
const MEDIC_RE = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;

async function oneRun(seed, days, opts) {
  const bare = !!(opts && opts.bare);
  const policyName = (opts && opts.policy) || POLICY;
  const armed = policyName === 'cheaptend-a';
  const { Game } = await loadGame({ seed, mode: 'cheaptend-a-' + policyName, fullTelemetry: false });
  await setupGame(Game);
  // Lazy require: the baseline leg never loads the layer module.
  let cheaptendMod = null;
  if (armed) {
    cheaptendMod = require('./policies/cheaptend-a');
    if (cheaptendMod.resetCheaptendStats) cheaptendMod.resetCheaptendStats();
  }
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
    daySeries: [], flowSeries: [], sayWin: [], teleWin: [],
    villageDays: 0, starveDays: 0, resDepth: 0, opportunityDays: 0, eligibleDays: 0,
    sickOnsets: [], sickEnds: [], treatEvents: [], npcTends: [],
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  const sickMap = () => {
    const out = {};
    try {
      const sick = ((Game.state || {}).village || {}).sick || {};
      for (const [vid, rec] of Object.entries(sick)) {
        if (!rec) continue;
        out[vid] = { name: rec.name || null, daysLeft: rec.daysLeft == null ? null : rec.daysLeft,
          severity: rec.severity == null ? null : rec.severity,
          diagnosed: rec.diagnosed || null };
      }
    } catch (e) {}
    return out;
  };
  const rosterSet = () => {
    try { return new Set(((Game.state || {}).village || {}).roster || []); } catch (e) { return new Set(); }
  };
  const aliveSet = () => {
    const out = new Set();
    try {
      for (const id of (((Game.state || {}).village || {}).roster || [])) {
        try { const p = Game.getPerson && Game.getPerson(id); if (p && !p.dead) out.add(id); } catch (e) {}
      }
    } catch (e) {}
    return out;
  };
  const healState = () => {
    const out = {};
    for (const ab of HEAL_ABS) {
      let held = false, level = null;
      try { held = !!(Game.hasAbility && Game.hasAbility(ab)); } catch (e) {}
      try { if (held && Game.abilityLevel) level = Game.abilityLevel(ab); } catch (e) {}
      out[ab] = { held, level };
    }
    return out;
  };
  const flowFor = (day) => {
    let f = W.flowSeries.find(x => x.day === day);
    if (!f) {
      f = { day, stocked: {}, stored: 0, pantryAdd: 0, donated: 0, league: 0,
        drawn: 0, drawGap: 0, spoiledDrawn: 0, spoiledSwept: 0, takeBulk: 0,
        removedKcal: 0, produced: 0, need: 0,
        ate: 0, ownEat: 0, gave: 0, resolved: {}, redirectResolved: {} };
      W.flowSeries.push(f);
    }
    return f;
  };
  const pantryLive = () => {
    try { if (Game.pantryKcalLive) return Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) { return null; }
  };

  const snapContext = () => {
    let freshDays = null, pantryKcal = null, freshKcal = null, spoiledKcal = 0,
      preservedKcal = 0, itemCount = 0, unknownCount = 0, pop = null, hungry = 0, awayAtDeath = null;
    try { if (Game.pantryFreshDays) freshDays = Math.round(Game.pantryFreshDays() * 10) / 10; } catch (e) {}
    try { pantryKcal = pantryLive(); } catch (e) {}
    try { if (Game.pantryFreshKcal) freshKcal = Math.round(Game.pantryFreshKcal()); } catch (e) {}
    try {
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      itemCount = pantry.length;
      for (const it of pantry) {
        if (!it) continue;
        if ((it.kcalEach || 0) <= 0) unknownCount++;
        const k = (it.kcalEach || 0) * (it.units || 1);
        try {
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') preservedKcal += k;
          else if (Game.isSpoiled && Game.isSpoiled(it)) spoiledKcal += k;
        } catch (e2) {}
      }
      spoiledKcal = Math.round(spoiledKcal);
      preservedKcal = Math.round(preservedKcal);
    } catch (e) {}
    try {
      const roster = ((Game.state || {}).village || {}).roster || [];
      pop = roster.length;
      for (const id of roster) { try { if (Game.npcNeeds && (Game.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e2) {} }
    } catch (e) {}
    return { freshDays, pantryKcal, pantryFreshKcal: freshKcal, pantrySpoiledKcal: spoiledKcal,
      preservedKcal, pantryItemCount: itemCount, unknownKcal0Count: unknownCount, pop, hungry, awayAtDeath };
  };

  // --- deaths: CALL-THROUGH capture (kept even in BARE mode: the documented
  // exception — it performs no Game-state writes and consumes no RNG, it only
  // appends to an external array, so it cannot change the trajectory) ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    let row = null;
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const whoId = String((opts && (opts.villagerId || '')) || '');
        const who = whoId || String((opts && opts.name) || '?');
        const day = dayOf();
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          let whoName = who.slice(0, 24);
          try {
            const nm = Game.npcName && Game.npcName(who);
            if (nm && nm !== 'Someone') whoName = String(nm).slice(0, 24);
          } catch (e) {}
          const ctx = bare ? null : snapContext();
          const v = (Game.state || {}).village || {};
          if (ctx) ctx.awayAtDeath = whoId ? !!((v.away || {})[whoId]) : null;
          row = { day, who: who.slice(0, 24), whoName, kind, cause,
            isPlayer: whoId ? (whoId === Game.villagerId) : false,
            ctx, sayWin: bare ? [] : W.sayWin.slice(-8), teleWin: bare ? [] : W.teleWin.slice(-8) };
          W.deaths.push(row);
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  if (!bare) {
    // --- transcript windows ---
    const oSay = Game.say;
    if (typeof oSay === 'function') Game.say = function (txt) {
      try { W.sayWin.push('d' + dayOf() + ' ' + trunc(txt)); if (W.sayWin.length > 20) W.sayWin.shift(); } catch (e) {}
      return oSay.apply(this, arguments);
    };
    const oTele = Game.tele;
    if (typeof oTele === 'function') Game.tele = function (type, data) {
      try {
        W.teleWin.push('d' + dayOf() + ' ' + String(type) + ' ' + trunc(data ? JSON.stringify(data) : ''));
        if (W.teleWin.length > 20) W.teleWin.shift();
      } catch (e) {}
      return oTele.apply(this, arguments);
    };

    // --- SICKNESS wrappers: diff v.sick before/after, read-only, no RNG ---
    const oSickTick = Game.villageSicknessTick;
    if (typeof oSickTick === 'function') Game.villageSicknessTick = function (...args) {
      const before = sickMap();
      const beforeRoster = rosterSet();
      const r = oSickTick.apply(this, args);
      try {
        const after = sickMap();
        const alive = aliveSet();
        const day = dayOf();
        for (const vid of Object.keys(after)) {
          if (!before[vid]) {
            W.sickOnsets.push({ day, vid: vid.slice(0, 24), name: after[vid].name,
              daysLeft: after[vid].daysLeft, severity: after[vid].severity, source: 'tick' });
          }
        }
        for (const vid of Object.keys(before)) {
          if (!after[vid]) {
            // Stale-record cleanup (vid already off the roster before the
            // tick) is not an episode end — it was never a live patient.
            if (!beforeRoster.has(vid)) continue;
            W.sickEnds.push({ day, vid: vid.slice(0, 24), name: before[vid].name,
              outcome: alive.has(vid) ? 'recovered' : 'died', via: 'tick' });
          }
        }
      } catch (e) {}
      return r;
    };
    const oFoodPoison = Game.villagerFoodPoisoning;
    if (typeof oFoodPoison === 'function') Game.villagerFoodPoisoning = function (...args) {
      const before = sickMap();
      const r = oFoodPoison.apply(this, args);
      try {
        const after = sickMap();
        const day = dayOf();
        for (const vid of Object.keys(after)) {
          if (!before[vid]) {
            W.sickOnsets.push({ day, vid: vid.slice(0, 24), name: after[vid].name,
              daysLeft: after[vid].daysLeft, severity: after[vid].severity, source: 'food' });
          }
        }
      } catch (e) {}
      return r;
    };
    const oTreat = Game.treatVillager;
    if (typeof oTreat === 'function') Game.treatVillager = function (vid, abilityId) {
      const before = sickMap();
      const hs = healState();
      let kcalBefore = null;
      try { kcalBefore = ((Game.state || {}).scholar || {}).kcal; } catch (e) {}
      const r = oTreat.apply(this, arguments);
      try {
        const after = sickMap();
        const day = dayOf();
        const b = before[vid], a = after[vid];
        const ab = hs[abilityId] || { held: null, level: null };
        if (b && !a) {
          W.treatEvents.push({ day, vid: String(vid).slice(0, 24), kind: 'treat',
            ability: abilityId, outcome: 'cured', name: b.name,
            daysLeftBefore: b.daysLeft, level: ab.level, kcalBefore });
          // A cure deletes the record OUTSIDE the sickness tick, so the tick
          // diff would never see the end — record it here, or the episode
          // builder would leave it 'open at run end'.
          W.sickEnds.push({ day, vid: String(vid).slice(0, 24), name: b.name,
            outcome: 'cured', via: 'treat' });
        } else if (b && a && (a.daysLeft || 0) < (b.daysLeft || 0)) {
          W.treatEvents.push({ day, vid: String(vid).slice(0, 24), kind: 'treat',
            ability: abilityId, outcome: 'eased', name: b.name,
            daysLeftBefore: b.daysLeft, daysLeftAfter: a.daysLeft,
            sevBefore: b.severity, sevAfter: a.severity, level: ab.level, kcalBefore });
        } else {
          let why = 'no-effect';
          if (!b) why = 'not-sick';
          else if (!ab.held) why = 'no-ability';
          else if ((ab.level || 0) < 2) why = 'level';
          else if ((kcalBefore || 0) < 150) why = 'kcal';
          W.treatEvents.push({ day, vid: String(vid).slice(0, 24), kind: 'treat',
            ability: abilityId, outcome: why, name: b ? b.name : null,
            daysLeftBefore: b ? b.daysLeft : null, level: ab.level, kcalBefore });
        }
      } catch (e) {}
      return r;
    };
    const oTend = Game.tendVillager;
    if (typeof oTend === 'function') Game.tendVillager = function (vid) {
      const before = sickMap();
      const hs = healState();
      let hpBefore = null;
      try { hpBefore = (((Game.state || {}).village || {}).health || {})[vid]; } catch (e) {}
      const r = oTend.apply(this, arguments);
      try {
        const after = sickMap();
        const day = dayOf();
        const b = before[vid], a = after[vid];
        const skilled = HEAL_ABS.some(ab => hs[ab] && hs[ab].held);
        if (b && a && (a.daysLeft || 0) < (b.daysLeft || 0)) {
          W.treatEvents.push({ day, vid: String(vid).slice(0, 24), kind: 'tend',
            ability: null, outcome: 'tended', name: b.name,
            daysLeftBefore: b.daysLeft, daysLeftAfter: a.daysLeft,
            sevBefore: b.severity, sevAfter: a.severity, skilled });
        } else if (!b) {
          let hpAfter = null;
          try { hpAfter = (((Game.state || {}).village || {}).health || {})[vid]; } catch (e) {}
          if (hpBefore != null && hpAfter != null && hpAfter > hpBefore) {
            W.treatEvents.push({ day, vid: String(vid).slice(0, 24), kind: 'tend',
              ability: null, outcome: 'wound-care', name: null,
              hpBefore, hpAfter, skilled });
          } else {
            W.treatEvents.push({ day, vid: String(vid).slice(0, 24), kind: 'tend',
              ability: null, outcome: 'not-sick', name: null, skilled });
          }
        } else {
          W.treatEvents.push({ day, vid: String(vid).slice(0, 24), kind: 'tend',
            ability: null, outcome: 'no-effect', name: b.name,
            daysLeftBefore: b.daysLeft, skilled });
        }
      } catch (e) {}
      return r;
    };
    const oCare = Game.villagerCareTick;
    if (typeof oCare === 'function') Game.villagerCareTick = function (...args) {
      const before = sickMap();
      const r = oCare.apply(this, args);
      try {
        const after = sickMap();
        const day = dayOf();
        for (const vid of Object.keys(after)) {
          if (before[vid] && (after[vid].daysLeft || 0) < (before[vid].daysLeft || 0)) {
            W.npcTends.push({ day, vid: vid.slice(0, 24), name: after[vid].name,
              daysLeftBefore: before[vid].daysLeft, daysLeftAfter: after[vid].daysLeft });
          }
        }
      } catch (e) {}
      return r;
    };

    // --- flow wrappers: read-only, call-through, no RNG ---
    const wrapFlow = (name) => {
      const o = Game[name];
      if (typeof o !== 'function') return;
      Game[name] = function (...args) {
        const day = dayOf();
        if (name === 'stockPantry') {
          const kcal = Math.round(args[0] || 0);
          const nm = String(args[1] || 'unnamed').slice(0, 40);
          const f = flowFor(day);
          if (kcal > 0) f.stocked[nm] = (f.stocked[nm] || 0) + kcal;
        } else if (name === 'sweepSpoiled') {
          const before = pantryLive();
          const r = o.apply(this, args);
          const after = pantryLive();
          if (before != null && after != null && before > after) flowFor(day).spoiledSwept += (before - after);
          return r;
        } else if (name === 'pantryDraw') {
          const r = o.apply(this, args);
          try {
            if (r && r.taken > 0) flowFor(day).drawn += Math.round(r.taken);
            if (r && r.items) {
              let gap = 0;
              for (const d of r.items) gap += (d.units || 0) * (((d.item || {}).kcalEach || 0) - (d.effectiveKcal || 0));
              flowFor(day).drawGap += Math.round(gap);
            }
          } catch (e) {}
          return r;
        } else if (name === 'drawSpoiled') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).spoiledDrawn += Math.round(r);
          return r;
        } else if (name === 'stockSurplus') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).stored += Math.round(r);
          return r;
        } else if (name === 'drawLeaguePool') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).league += Math.round(r);
          return r;
        } else if (name === 'pantryAdd' || name === 'donateToPantry') {
          const before = pantryLive();
          const r = o.apply(this, args);
          const after = pantryLive();
          if (before != null && after != null && after > before) {
            flowFor(day)[name === 'pantryAdd' ? 'pantryAdd' : 'donated'] += (after - before);
          }
          return r;
        } else if (name === '_removePantryKcal') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).removedKcal += Math.round(r);
          return r;
        } else if (name === 'takeFromPantryBulk' || name === 'takeFromPantry') {
          const before = pantryLive();
          const r = o.apply(this, args);
          const after = pantryLive();
          if (before != null && after != null && before > after) flowFor(day).takeBulk += (before - after);
          return r;
        }
        return o.apply(this, args);
      };
    };
    for (const n of ['stockPantry', 'sweepSpoiled', 'pantryDraw', 'drawSpoiled',
      'stockSurplus', 'drawLeaguePool', 'pantryAdd', 'donateToPantry',
      'takeFromPantryBulk', 'takeFromPantry', '_removePantryKcal']) wrapFlow(n);

    // --- duty resolution counts (outermost only; redirect re-resolution separate) ---
    const oRes = Game.resolveOneAssignment;
    if (typeof oRes === 'function') Game.resolveOneAssignment = function (vid, a) {
      const day = dayOf();
      const task = String((a && a.task) || '?');
      const f = flowFor(day);
      if (W.resDepth === 0) f.resolved[task] = (f.resolved[task] || 0) + 1;
      else f.redirectResolved[task] = (f.redirectResolved[task] || 0) + 1;
      W.resDepth++;
      try { return oRes.apply(this, arguments); } finally { W.resDepth--; }
    };

    // --- villagerMealDay wrapper (reads only, no RNG) + production-factor capture ---
    const oMeal = Game.villagerMealDay;
    if (typeof oMeal === 'function') Game.villagerMealDay = function (vid, person, v, ctx) {
      const day = dayOf();
      let hungerBefore = null, healthBefore = null, needEst = 2000, awayBefore = null;
      try { awayBefore = !!(((v || Game.state.village || {}).away || {})[vid]); } catch (e) {}
      try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerBefore = n ? (n.hunger || 0) : null; } catch (e) {}
      try { healthBefore = ((v || Game.state.village || {}).health || {})[vid]; if (healthBefore === undefined) healthBefore = 100; } catch (e) {}
      try { const p = person || (Game.getPerson && Game.getPerson(vid)); if (p && p.kcalPerDay) needEst = p.kcalPerDay; } catch (e) {}
      let result = null;
      try { result = oMeal.apply(this, arguments); } catch (e) { throw e; }
      let hungerAfter = null, healthAfter = null, produced = null, expected = null;
      try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAfter = n ? (n.hunger || 0) : null; } catch (e) {}
      try { healthAfter = ((v || Game.state.village || {}).health || {})[vid]; if (healthAfter === undefined) healthAfter = null; } catch (e) {}
      try { const lg = ((v || Game.state.village || {}).contribLog || {})[vid]; if (lg) { produced = lg.produced; expected = lg.expected; } } catch (e) {}
      let base = null, kf = null, knownN = null, occSkill = null, ageCap = null,
        healthFrac = null, trust = null, task = null, mult = null;
      try {
        const p = person || (Game.getPerson && Game.getPerson(vid));
        if (p) {
          if (Game.villagerFoodBase) base = Math.round(Game.villagerFoodBase(p));
          if (Game.occupationFoodSkill) occSkill = Game.occupationFoodSkill(p.formerOccupation || p.occupation);
          if (Game.ageCapacity) ageCap = Game.ageCapacity(p.age);
        }
        if (Game.villagerKnowledgeFactor) kf = Math.round(Game.villagerKnowledgeFactor(vid, v) * 1000) / 1000;
        if (Game.plantsKnownBy) knownN = Game.plantsKnownBy(vid, v).length;
        const h = ((v || Game.state.village || {}).health || {})[vid];
        healthFrac = Math.round(((h === undefined ? 100 : h) / 100) * 1000) / 1000;
        const tv = ((v || Game.state.village || {}).trust || {})[vid];
        trust = (tv === undefined ? null : tv);
        const asg = ((v || Game.state.village || {}).assignments || {})[vid];
        task = asg ? String(asg.task || '?') : null;
        if (produced != null && expected != null && expected > 0) mult = Math.round((produced / expected) * 1000) / 1000;
      } catch (e) {}
      const ate = result ? (result.ate ?? null) : null;
      const drawn = result ? (result.drawn ?? null) : null;
      const gave = result ? (result.gave ?? null) : null;
      const ownEat = (ate != null && drawn != null) ? Math.max(0, ate - drawn) : null;
      const f = flowFor(day);
      if (produced != null) f.produced += Math.round(produced);
      if (needEst) f.need += Math.round(needEst);
      if (ate != null) f.ate += Math.round(ate);
      if (ownEat != null) f.ownEat += Math.round(ownEat);
      if (gave != null) f.gave += Math.round(gave);
      const key = String(vid) + '|' + day;
      const dupIdx = W.mealRows.findIndex(r => r._key === key);
      const row = { _key: key, vid: String(vid).slice(0, 24), day, away: awayBefore,
        ate, drawn, gave, ownEat, produced, expected, base, kf, knownN, occSkill,
        ageCap, healthFrac, trust, task, mult,
        fasting: result ? !!result.fasting : false,
        hungerBefore, hungerAfter, healthBefore, healthAfter, needEst };
      if (dupIdx >= 0) { W.mealDup++; W.mealRows[dupIdx] = row; }
      else W.mealRows.push(row);
      return result;
    };
  }

  const basePolicy = armed ? cheaptendMod.cheaptendA : competent;
  const policy = Object.assign({}, basePolicy);
  const origDaily = basePolicy.daily;
  const ledgerTotal = (map) => {
    let t = 0;
    try { for (const d of Object.values(map || {})) t += (d.kcal || d.shareEased || 0); } catch (e) {}
    return Math.round(t);
  };
  if (!bare) policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      const v = (G.state || {}).village || {};
      const roster = v.roster || [];
      W.villageDays += roster.length;
      for (const id of roster) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      let fd = null, pk = null, fk = null, cap = null, throttled = null;
      if (G.pantryFreshDays) { fd = G.pantryFreshDays(); }
      try { pk = pantryLive(); } catch (e) {}
      try { if (G.pantryFreshKcal) fk = Math.round(G.pantryFreshKcal()); } catch (e) {}
      try { if (G.pantryCapKcal) cap = Math.round(G.pantryCapKcal()); } catch (e) {}
      try { if (G.prodThrottleEngaged) throttled = !!G.prodThrottleEngaged(); } catch (e) {}
      let spoiledKcal = 0, preservedKcal = 0, healthSum = 0, healthN = 0;
      try {
        for (const it of (v.pantry || [])) {
          if (!it) continue;
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') preservedKcal += k;
          else { try { if (G.isSpoiled && G.isSpoiled(it)) spoiledKcal += k; } catch (e2) {} }
        }
        for (const id of roster) {
          const h = (v.health || {})[id];
          const hv = (h === undefined ? 100 : h);
          healthSum += hv; healthN++;
        }
      } catch (e) {}
      // --- NEW: the sickness snapshot (this arm's subject) ---
      let sickCount = 0, sickNames = [], atHaven = null, healerPresent = null, medicCount = 0;
      let scholarKcal = null, scholarAbilities = null, ctStats = null;
      try {
        const sick = v.sick || {};
        sickCount = Object.keys(sick).length;
        sickNames = Object.values(sick).map(r => r.name || '?').slice(0, 12);
        if (sickCount > 0) {
          let home = false;
          try { home = !!(G.playerAtHaven && G.playerAtHaven()); } catch (e2) {}
          atHaven = home;
          if (home) W.opportunityDays++;
        } else {
          try { atHaven = !!(G.playerAtHaven && G.playerAtHaven()); } catch (e2) {}
        }
      } catch (e) {}
      // --- NEW: the not-ranging gate's own instruments (this arm) ---
      // tripPlanned reads the trip's own gate (needTrip, exported from
      // competent.js, same ctx) at snapshot time — the same moment the
      // layer's gate reads it, moments before origDaily runs. eligible
      // = the days THIS layer could fire (sick + at Haven + no trip
      // planned).
      let tripPlanned = null, eligible = false;
      try { tripPlanned = !!(needTrip && needTrip(G, ctx)); } catch (e) {}
      if (sickCount > 0 && atHaven === true && tripPlanned === false) {
        eligible = true;
        W.eligibleDays = (W.eligibleDays || 0) + 1;
      }
      try { scholarKcal = ((G.state || {}).scholar || {}).kcal; } catch (e) {}
      try {
        scholarAbilities = {};
        for (const ab of HEAL_ABS) {
          let held = false, level = null;
          try { held = !!(G.hasAbility && G.hasAbility(ab)); } catch (e2) {}
          try { if (held && G.abilityLevel) level = G.abilityLevel(ab); } catch (e2) {}
          scholarAbilities[ab] = { held, level };
        }
      } catch (e) {}
      try {
        let hid = null;
        try { hid = G.campHealerId ? G.campHealerId('haven') : null; } catch (e2) {}
        healerPresent = !!hid;
        for (const id of roster) {
          try {
            const p = G.getPerson && G.getPerson(id);
            if (!p || p.dead) continue;
            const msick = (v.sick || {})[id];
            if (msick && (msick.severity || 1) >= 2) continue;
            if (MEDIC_RE.test(String(p.formerOccupation || ''))) medicCount++;
          } catch (e2) {}
        }
      } catch (e) {}
      try {
        if (cheaptendMod && cheaptendMod.cheaptendStats) ctStats = cheaptendMod.cheaptendStats();
      } catch (e) {}
      let seasonId = null, weather = null;
      try { const se = G.season && G.season(dayOf()); seasonId = se ? (se.id || null) : null; } catch (e) {}
      try { weather = (G.state || {}).weather || null; } catch (e) {}
      const awayCount = Object.keys(v.away || {}).length;
      const assignments = {};
      try {
        for (const [vid, a] of Object.entries(v.assignments || {})) {
          const t = String((a && a.task) || '?');
          assignments[t] = (assignments[t] || 0) + 1;
        }
      } catch (e) {}
      W.daySeries.push({ day: dayOf(), pop: roster.length, hungry,
        freshDays: (fd == null ? null : Math.round(fd * 10) / 10), pantryKcal: pk,
        pantryFreshKcal: fk, pantrySpoiledKcal: Math.round(spoiledKcal),
        preservedKcal: Math.round(preservedKcal),
        pantryCapKcal: cap, capFlag: (pk != null && cap != null) ? (pk >= 0.95 * cap) : null,
        throttleEngaged: throttled,
        throttleRedirects: (v.throttleRedirects || 0),
        throttleExemptDepth: (v.throttleExemptDepth || 0),
        plentyDepriKcal: ledgerTotal((v._plentyDepri || {}).days),
        depositGateKcal: ledgerTotal((v._depositGate || {}).days),
        assignments,
        season: seasonId, weather, awayCount,
        meanHealth: healthN ? Math.round((healthSum / healthN) * 10) / 10 : null,
        sickCount, sickNames, atHaven, healerPresent, medicCount,
        scholarKcal, scholarAbilities, ctStats, tripPlanned, eligible });
      W.hungrySeries = W.hungrySeries || [];
      W.hungrySeries.push(hungry);
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
  const freshSeries = W.daySeries.map(x => x.freshDays).filter(x => x != null);
  const finalPop = (() => { try { return (((Game.state || {}).village || {}).roster || []).length; } catch (e) { return null; } })();
  const deathKeys = W.deaths.map(d => d.day + '|' + d.who + '|' + d.cause).sort();
  const fingerprint = { seed, daysAlive: result.days, endReason: result.endReason,
    rank, maxWave, national, table: won, win: won,
    deathCauses, deathKeys, finalPop };
  if (bare) return { seed, perSeed: null, diag: null, fingerprint };

  let cheaptendStats = null;
  try { if (cheaptendMod && cheaptendMod.cheaptendStats) cheaptendStats = cheaptendMod.cheaptendStats(); } catch (e) {}
  const perSeed = {
    seed, policy: policyName,
    plentydepri: 1, depositgate: 1,
    daysAlive: result.days, villageDays: W.villageDays,
    deathCauses, deathRows: W.deaths,
    mealRows: W.mealRows.map(({ _key, ...r }) => r),
    daySeries: W.daySeries, flowSeries: W.flowSeries, national,
    table: won, win: won,
    waveReach, medianSurvival: null,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
    sickOnsets: W.sickOnsets, sickEnds: W.sickEnds,
    treatEvents: W.treatEvents, npcTends: W.npcTends,
    opportunityDays: W.opportunityDays, eligibleDays: W.eligibleDays || 0, cheaptendStats,
    endReason: result.endReason,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup, ms,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 96301-96308, got: ' + (process.env.SEEDS || '(unset)'));
    process.exit(2);
  }
  if (DAYS !== 150) {
    console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
    process.exit(2);
  }
  if (POLICY !== 'competent' && POLICY !== 'cheaptend-a') {
    console.error('FATAL: POLICY must be competent|cheaptend-a, got: ' + POLICY);
    process.exit(2);
  }
  if (ARMED && process.env.CHEAPTEND_A !== '1') {
    console.error('FATAL: armed leg requires CHEAPTEND_A=1');
    process.exit(2);
  }
  if (!ARMED && process.env.CHEAPTEND_A === '1') {
    console.error('FATAL: baseline leg forbids CHEAPTEND_A=1');
    process.exit(2);
  }
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, fingerprint } = await oneRun(seed, DAYS, { bare: false });
    rows.push({ seed: s, perSeed, diag, fingerprint });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `cheaptend-a-${POLICY}-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} policy=${POLICY} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} onsets=${perSeed.sickOnsets.length} treats=${perSeed.treatEvents.length} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (G2 neutrality): same seeds/days/policy, recorders skipped.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `cheaptend-a-bare-s${seed}.json`),
      JSON.stringify(fingerprint));
    console.log(`bare seed=${seed} policy=${POLICY} days=${fingerprint.daysAlive} end=${fingerprint.endReason} deaths=${Object.values(fingerprint.deathCauses).reduce((a, b) => a + b, 0)}`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
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
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  writeRobust(OUT, JSON.stringify({ meta: { cell: POLICY, policy: POLICY, days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1', CHEAPTEND_A: ARMED ? '1' : '0' } }, rows: merged, bare: bareRows }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows, ' + bareRows.length + ' bare)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BATCH, DAYS, POLICY, writeRobust };
