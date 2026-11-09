#!/usr/bin/env node
// sweep-sicknessdiag-b.js — SICKNESS-DISEASE SECOND MEASUREMENT (DIAG, zero src/js)
// (arm sim-sicknessdiag-b, run fleshout-loop-b-20261109T1530Z, Loop B, axis
// scale-onramp / winnability chain. The prefloor DIAG found pre-day-90 deaths
// under winseek wild 76.6% (118/154) with sickness-disease the runner-up at
// 23/154 (14.9%), led by `a wound that wouldn't close` (14); the party-up
// build arm that was supposed to attack the wild deaths was KILLED at pilot.
// This arm decomposes the sickness-disease deaths into wound->fever->death
// chains on winseek: wound_fever vs tick-fever episodes, medic/healer
// presence on the days wounds fester, wound-care availability, time from
// wound to death, wound-first vs sickness-first. It names the medic/wound-care
// lever candidate, or reports DIAG-NO-GO.
//
// MODELED on scripts/sweep-feveranat-a.js (read in-tree; own code, same
// harness pattern). Declared deltas:
//   1. Policy: winseek (scripts/policies/winseek.js, UNMODIFIED), default env.
//      NO PLENTYDEPRI/DEPOSITGATE requirement (the prefloor winseek leg ran
//      default env; competent-only env discipline does not apply here).
//   2. Seeds: exactly 58201-58208 (8 seeds, FRESH band — verified in the
//      prereg across every dated sim-*-prereg.md, evidence .md, corpus
//      filenames, and goal hidden_files). Days 150 ONLY.
//   3. Meal/flow wrappers DROPPED (production cost is out of scope here).
//      Kept verbatim in pattern: the fever-anatomy wrappers
//      (villageSicknessTick, villagerFoodPoisoning, contractDisease,
//      applyStatus, villagerCareTick incl. dutyCure capture, villagerTreatTick,
//      diagnoseDisease, treatVillager, tendVillager, folkRemedy /
//      treatDisease / useMedicine, removeTick, sickRestTick, cureStatus,
//      seRemove), the registerDeath capture (kept even in BARE mode: the
//      documented exception — no Game-state writes, no RNG), and the
//      fresh-child writeRobust.
//   4. NEW: healerRounds wrapper (call-through; logs the returned vid + HP
//      before/after + caregiver — the wound-care channel; healerRounds treats
//      the single most-hurt villager <70 HP once/day, +15 HP, game.js ~7915).
//   5. NEW: lean daily snapshot in the policy.daily wrapper (day, pop,
//      healerPresent, medicCount, sickMap, scholarSick, sickCountNPC, mean /
//      sick / healthy mean health, health map — the healer-presence series
//      the wound-chain join reads). No meal rows, no flow series.
//   6. NEW: say-wrap death sample (prefloor pattern, tightened word-boundary
//      death regex) + door-verb wrappers for the four sit verbs (any call is
//      a loud contradiction: winseek never sits) + the fallen list read at
//      run end (Game.state.village.fallen, full entries incl. monsterName)
//      for the reused prefloor classifier.
//   7. BARE mode (SICKNESSDIAG_BARE=1): same seeds/days/policy, all recorders
//      SKIPPED except the registerDeath capture, writes only a fingerprint
//      per seed. The recorded run must match it exactly (G2).
//   8. EPISODE DAY CONVENTION (feveranat prereg): onset day is dayOf() at the
//      creation call (the night of that day for villageSicknessTick, which
//      runs in endDay); the first policy.daily snapshot showing the entry is
//      the following day. Wrapper events are authoritative; snapshots
//      corroborate.
'use strict';
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

const BARE = process.env.SICKNESSDIAG_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [58201, 58202, 58203, 58204, 58205, 58206, 58207, 58208];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-09', 'perseed-sicknessdiag-b', 'sweep-winseek.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-09', 'perseed-sicknessdiag-b');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// ---- sickness-diag helpers (pure reads only; no RNG, no Game-state writes) ----
// Disease roster from docs/DISEASES.md (mundane 6 + alien 9) + tick_attached.
const DISEASE_IDS = new Set(['disease', 'wound_fever', 'gutrot', 'lockjaw',
  'trichinosis', 'trembles', 'howlbelly', 'gristlefit', 'croakbelly', 'shellgut',
  'witness_maw', 'flockmind', 'eurika', 'east_nile', 'lemons', 'tick_attached']);
const MUNDANE_IDS = new Set(['disease', 'wound_fever', 'gutrot', 'lockjaw',
  'trichinosis', 'trembles']);
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;
// villageSicknessTick names map 1:1 to vectors (the engine enforces it).
function vectorForNpcTick(name, cond) {
  if (name === 'wound fever') return { vector: 'wound', evidence: 'hp<40 at onset: ' + (cond.hp != null ? (cond.hp + ' (<40: ' + (cond.hp < 40) + ')') : 'unknown') };
  if (name === 'gut rot') return { vector: 'dirty water', evidence: 'drinksDirty at onset: ' + cond.drinksDirty };
  if (name === 'tick fever') return { vector: 'tick', evidence: 'range profile at onset: ' + (cond.profile || 'unknown') + ' (forager/explorer: ' + (cond.profile === 'forager' || cond.profile === 'explorer') + ')' };
  return { vector: 'unattributed', evidence: 'villageSicknessTick created an unknown name: ' + String(name) };
}
function vectorForFoodName(name) {
  const n = String(name || '');
  if (/^food poisoning/.test(n)) return { vector: 'raw food', evidence: 'meal-time sicken: ' + n };
  if (n === 'bad belly') return { vector: 'unsafe food', evidence: 'meal-time sicken: bad belly' };
  if (n === 'spoiled gut') return { vector: 'spoiled food', evidence: 'meal-time sicken: spoiled gut (desperation)' };
  if (/^poisoned/.test(n)) return { vector: 'poison', evidence: 'meal-time sicken: ' + n };
  return { vector: 'unattributed', evidence: 'villagerFoodPoisoning created an unknown name: ' + n };
}
function vectorForScholarSource(src) {
  const s = String(src || '');
  if (s === 'a mosquito bite') return { vector: 'mosquito (ambient)', evidence: s };
  if (s === 'a heatwave mosquito bite') return { vector: 'mosquito (heatwave)', evidence: s };
  if (s === 'a tick bite') return { vector: 'tick (ambient)', evidence: s };
  if (s === 'a cut gone wrong' || s === 'a dirty cut') return { vector: 'wound', evidence: s };
  if (s === 'a botched tick removal') return { vector: 'tick-removal botch', evidence: s };
  if (s === 'the creek water') return { vector: 'dirty water', evidence: s };
  if (/^the /.test(s)) return { vector: 'food', evidence: s };
  return { vector: 'unattributed', evidence: 'contractDisease source not in map: ' + s };
}

// Writes go through a FRESH child process per attempt. Host EPERM-flap
// denial is STICKY per process once a write fails (2026-11-07: an in-process
// retry loop failed 300/300 over ~10 min while fresh processes wrote 1.5MB
// files 5/5 in the same minute). Retrying in-process is futile; each child
// reads the payload from stdin (a pipe, never a filesystem write), writes +
// readback-verifies + renames, and exits 0/1/3.
const CHILD_WRITER = `
// NOTE: with node -e, argv has NO script filename: args are argv[1]/argv[2].
const fs = require('fs');
const tmp = process.argv[1], dest = process.argv[2];
let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  try {
    fs.writeFileSync(tmp, data);
    const back = fs.readFileSync(tmp, 'utf8');
    if (back.length !== data.length) process.exit(3);
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

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed, days, opts) {
  const bare = !!(opts && opts.bare);
  const { Game } = await loadGame({ seed, mode: 'sicknessdiag-b-winseek', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(),
    daySeries: [], sayWin: [],
    sickOnsets: [], sickEnds: [], treatEvents: [], statusEvents: [],
    diagnoses: [], cureEvents: [], healerRoundsEvents: [],
    deathSays: [], sitVerbMsgs: [], doorVerbMsgs: [],
    instrumentErrors: [],
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  const npcName = (vid) => {
    try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
    return 'Someone';
  };
  const diseaseIdForNpcName = (name) => {
    try { if (Game.villagerDiseaseId) return Game.villagerDiseaseId({ name }) || null; } catch (e) {}
    const m = { 'wound fever': 'wound_fever', 'gut rot': 'gutrot', 'tick fever': 'disease' };
    return m[name] || null;
  };
  const medicIds = () => {
    const out = [];
    try {
      const v = (Game.state || {}).village || {};
      for (const id of (v.roster || [])) {
        if (id === Game.villagerId) continue;
        let p = null; try { p = Game.getPerson(id); } catch (e) {}
        if (!p || p.dead) continue;
        const msick = (v.sick || {})[id];
        if (msick && (msick.severity || 1) >= 2) continue;
        if (MED_OCC.test(String(p.formerOccupation || '').toLowerCase())) out.push(String(id).slice(0, 24));
      }
    } catch (e) {}
    return out;
  };
  const healerPresentNow = () => {
    try { return Game.campHealerId ? Game.campHealerId('haven') != null : null; } catch (e) { return null; }
  };
  const scholarDiseaseList = () => {
    const out = [];
    try {
      const list = Game.seList ? Game.seList('scholar') : [];
      const diag = ((Game.state || {}).scholar || {}).diagnosed || {};
      for (const e of list) {
        if (!DISEASE_IDS.has(e.id)) continue;
        out.push({ id: e.id, dayPartsLeft: e.dayPartsLeft == null ? null : e.dayPartsLeft,
          diagnosed: !!diag[e.id], severe: !!e.severe, stacks: e.stacks || 1,
          easedUntil: e.easedUntil == null ? null : e.easedUntil });
      }
    } catch (e) {}
    return out;
  };
  const scholarDiseaseMap = () => {
    const m = {};
    for (const e of scholarDiseaseList()) m[e.id] = e;
    return m;
  };

  // --- deaths: CALL-THROUGH capture (kept even in BARE mode: the documented
  // exception — it performs no Game-state writes and consumes no RNG, it only
  // appends to the external W array, so it cannot change the trajectory) ---
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
          row = { day, who: who.slice(0, 24), whoName, kind, cause,
            causeRaw: (opts && opts.cause) || null,
            monsterName: (opts && opts.monsterName) || null,
            monsterId: (opts && opts.monsterId) || null,
            isPlayer: whoId ? (whoId === Game.villagerId) : false,
            sayWin: bare ? [] : W.sayWin.slice(-8) };
          W.deaths.push(row);
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  if (!bare) {
    // --- say-wrap death sample (prefloor pattern, tightened word-boundary regex) ---
    const oSay = Game.say;
    if (typeof oSay === 'function') Game.say = function (txt) {
      try {
        W.sayWin.push('d' + dayOf() + ' ' + trunc(txt));
        if (W.sayWin.length > 20) W.sayWin.shift();
        if (typeof txt === 'string') {
          if (/\bdead\b|\bdied\b|didn't come back|\bgrave\b|\bburied\b|\bscreams\b|starts digging|\bslain\b|\bis dead\b|\bveteran\b/i.test(txt) && W.deathSays.length < 400) W.deathSays.push({ day: dayOf(), line: String(txt).slice(0, 600) });
        }
      } catch (e) { W.instrumentErrors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return oSay.apply(this, arguments);
    };

    // --- door-verb wrappers: ANY sit-verb call contradicts the no-seat
    // configuration and is a loud contradiction, never smoothed. ---
    const snapTable = () => {
      const s = {};
      try {
        const T = (typeof Game.tableState === 'function') ? Game.tableState() : null;
        s.phase = T && T.phase != null ? String(T.phase) : null;
        s.path = T && T.path != null ? String(T.path) : null;
        s.branch = T && T.branch != null ? String(T.branch) : null;
        s.beat = T && T.beat != null ? (T.beat | 0) : null;
        s.trialPending = !!(T && T.trialPending);
      } catch (e) {}
      return s;
    };
    const offeredIds = () => {
      try {
        const tc = ((Game.state || {}).scholar || {}).tableChoices;
        return (tc && tc.options) ? tc.options.map(function (o) { return String(o.id); }) : [];
      } catch (e) { return []; }
    };
    ['tableTakeSeat', 'tableOfferSeatTaker', 'tableChooseSeatTaker', 'chooseTableOption'].forEach(function (name) {
      try {
        const inner = Game[name];
        if (typeof inner !== 'function') { W.instrumentErrors.push('doorverb-missing-' + name); return; }
        Game[name] = function () {
          const before = snapTable();
          const offered = offeredIds();
          let arg = null;
          try { arg = (arguments.length && arguments[0] != null) ? String(arguments[0]) : null; } catch (e) {}
          let ret;
          try { ret = inner.apply(this, arguments); } catch (e) { throw e; }
          try {
            const rec = { day: gday(Game), call: name, arg: arg, ok: !!(ret && ret.ok), msg: (ret && typeof ret.msg === 'string') ? ret.msg.slice(0, 200) : null, before: before, after: snapTable(), offered: offered };
            W.doorVerbMsgs.push(rec);
            if (name === 'tableTakeSeat' || name === 'tableOfferSeatTaker' || name === 'tableChooseSeatTaker') W.sitVerbMsgs.push(rec);
          } catch (e2) { W.instrumentErrors.push('doorverb-record: ' + String(e2.message).slice(0, 80)); }
          return ret;
        };
      } catch (e) { W.instrumentErrors.push('doorverb-install-' + name + ': ' + String(e.message).slice(0, 80)); }
    });

    // ---- FEVER-ANATOMY wrappers (all read-only, call-through, zero extra RNG) ----
    // villageSicknessTick: diff v.sick before/after (onsets with vector + onset
    // conditions; ends with outcome). Same-tick turnover handled by (vid, name)
    // diffing; same-tick duty cures are captured by the villagerCareTick
    // wrapper below (sim-sametick-a).
    const oVST = Game.villageSicknessTick;
    if (typeof oVST === 'function') Game.villageSicknessTick = function () {
      let before = null, beforeMeta = {}, condBefore = null;
      try {
        const v = (Game.state || {}).village || {};
        before = JSON.parse(JSON.stringify(v.sick || {}));
        for (const vid of Object.keys(before)) {
          let dead = false; try { const p = Game.vpOf && Game.vpOf(vid); dead = !!(p && p.dead); } catch (e) {}
          beforeMeta[vid] = { onRoster: (v.roster || []).includes(vid), dead };
        }
        const drinksDirty = !!v.drankDirty || (((v.water || {}).clean || 0) <= 0 && ((v.water || {}).dirty || 0) > 0);
        let hygiene = false;
        try { hygiene = !!((v.triageHygiene || {}).until >= dayOf()); } catch (e) {}
        const cond = {};
        for (const vid of (v.roster || [])) {
          let hp = null; try { const h = (v.health || {})[vid]; hp = (h === undefined ? 100 : h); } catch (e) {}
          cond[vid] = { hp, drinksDirty, hygiene };
        }
        condBefore = { cond, drinksDirty, hygiene, healerPresent: healerPresentNow(),
          medicCount: medicIds().length, pop: (v.roster || []).length,
          waterClean: (v.water || {}).clean || 0, waterDirty: (v.water || {}).dirty || 0 };
      } catch (e) {}
      const r = oVST.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        const after = v.sick || {};
        const day = dayOf();
        for (const vid of Object.keys(after)) {
          const prev = before ? before[vid] : null;
          if (prev && prev.name === after[vid].name) continue; // continuing spell
          const rec = after[vid];
          let profile = null;
          try { const a = Game.agencyState && Game.agencyState(); profile = (a && a.profiles && a.profiles[vid]) || null; } catch (e) {}
          const c = (condBefore && condBefore.cond && condBefore.cond[vid]) || {};
          const vec = vectorForNpcTick(rec.name, { hp: c.hp, profile, drinksDirty: (condBefore || {}).drinksDirty, hygiene: (condBefore || {}).hygiene });
          W.sickOnsets.push({ day, who: String(vid).slice(0, 24), whoName: npcName(vid), kind: 'npc',
            name: rec.name, diseaseId: diseaseIdForNpcName(rec.name), vector: vec.vector,
            vectorSource: 'villageSicknessTick', vectorEvidence: vec.evidence,
            daysLeft0: rec.daysLeft, severity: rec.severity,
            hpAtOnset: c.hp == null ? null : c.hp, rangeProfile: profile,
            drinksDirty: (condBefore || {}).drinksDirty, hygiene: (condBefore || {}).hygiene,
            healerPresent: (condBefore || {}).healerPresent, medicCount: (condBefore || {}).medicCount,
            sayWin: W.sayWin.slice(-3) });
        }
        for (const vid of Object.keys(before || {})) {
          const rec = before[vid];
          if (after[vid] && after[vid].name === rec.name) continue;
          const meta = beforeMeta[vid] || {};
          let aliveNow = false;
          try { const p = Game.vpOf && Game.vpOf(vid); aliveNow = (v.roster || []).includes(vid) && !(p && p.dead); } catch (e) {}
          const outcome = (!meta.onRoster || meta.dead) ? 'stale-cleanup' : (aliveNow ? 'recovered' : 'died');
          W.sickEnds.push({ day, who: String(vid).slice(0, 24), whoName: npcName(vid), kind: 'npc',
            name: rec.name, diseaseId: diseaseIdForNpcName(rec.name), outcome, by: 'villageSicknessTick' });
        }
      } catch (e) {}
      return r;
    };

    // villagerFoodPoisoning: diff v.sick before/after (food-vector onsets).
    const oVFP = Game.villagerFoodPoisoning;
    if (typeof oVFP === 'function') Game.villagerFoodPoisoning = function (v, vid, exposure) {
      let before = null;
      try { before = (v && v.sick && v.sick[vid]) ? JSON.parse(JSON.stringify(v.sick[vid])) : null; } catch (e) {}
      const r = oVFP.apply(this, arguments);
      try {
        const after = (v && v.sick && v.sick[vid]) || null;
        if (!before && after) {
          const vec = vectorForFoodName(after.name);
          W.sickOnsets.push({ day: dayOf(), who: String(vid).slice(0, 24), whoName: npcName(vid),
            kind: 'npc', name: after.name, diseaseId: diseaseIdForNpcName(after.name),
            vector: vec.vector, vectorSource: 'villagerFoodPoisoning', vectorEvidence: vec.evidence,
            daysLeft0: after.daysLeft, severity: after.severity,
            hpAtOnset: null, rangeProfile: null, drinksDirty: null, hygiene: null,
            healerPresent: healerPresentNow(), medicCount: medicIds().length,
            sayWin: W.sayWin.slice(-3) });
        }
      } catch (e) {}
      return r;
    };

    // contractDisease: scholar onsets with the engine's own source string.
    let inContractDisease = false;
    const oCD = Game.contractDisease;
    if (typeof oCD === 'function') Game.contractDisease = function (effectId, opts) {
      let hadIt = false;
      try { if (Game.hasStatus) hadIt = !!Game.hasStatus('scholar', effectId); } catch (e) {}
      inContractDisease = true;
      let r = false;
      try { r = oCD.apply(this, arguments); } finally { inContractDisease = false; }
      try {
        if (r && !hadIt) {
          const entry = (Game.seList ? Game.seList('scholar') : []).find(e => e.id === effectId);
          const src = (opts && opts.source) || null;
          const vec = vectorForScholarSource(src);
          W.sickOnsets.push({ day: dayOf(), who: 'scholar', whoName: 'scholar', kind: 'scholar',
            name: effectId, diseaseId: effectId, vector: vec.vector,
            vectorSource: 'contractDisease', vectorEvidence: vec.evidence, source: src,
            dayPartsLeft0: entry ? entry.dayPartsLeft : null,
            severity: entry && entry.severe ? 2 : 1,
            hpAtOnset: null, rangeProfile: null, drinksDirty: null, hygiene: null,
            healerPresent: healerPresentNow(), medicCount: medicIds().length,
            sayWin: W.sayWin.slice(-3) });
        }
      } catch (e) {}
      return r;
    };

    // applyStatus: disease-roster ids only. Catches alien quirks + tick_attached
    // on any target, and any mundane disease applied WITHOUT going through
    // contractDisease (a finding in itself).
    const oAS = Game.applyStatus;
    if (typeof oAS === 'function') Game.applyStatus = function (target, effectId, opts) {
      let hadIt = false;
      try {
        if (DISEASE_IDS.has(effectId) && Game.hasStatus) hadIt = !!Game.hasStatus(target, effectId);
      } catch (e) {}
      const r = oAS.apply(this, arguments);
      try {
        if (r && DISEASE_IDS.has(effectId) && !inContractDisease && !hadIt) {
          let who = null, whoName = null, kind = null;
          if (target === 'scholar') { who = 'scholar'; whoName = 'scholar'; kind = 'scholar'; }
          else if (target && typeof target === 'object') {
            who = String(target.villagerId || target.id || '?').slice(0, 24);
            whoName = String(target.name || 'Someone').split(' ')[0];
            kind = 'npc-status';
          }
          if (!who) return r;
          const src = (opts && opts.source) || null;
          const pool = (() => { try { const d = Game.seDef && Game.seDef(effectId); return (d && d.pool) || null; } catch (e) { return null; } })();
          if (effectId === 'tick_attached') {
            W.statusEvents.push({ day: dayOf(), kind: 'tick_attached', who, whoName, source: src, sayWin: W.sayWin.slice(-3) });
          } else if (pool === 'alien') {
            W.statusEvents.push({ day: dayOf(), kind: 'alien-quirk', who, whoName, diseaseId: effectId, source: src, sayWin: W.sayWin.slice(-3) });
          } else {
            W.statusEvents.push({ day: dayOf(), kind: 'disease-direct', who, whoName, diseaseId: effectId, source: src, sayWin: W.sayWin.slice(-3) });
            W.sickOnsets.push({ day: dayOf(), who, whoName, kind: kind === 'scholar' ? 'scholar' : 'npc',
              name: effectId, diseaseId: effectId, vector: 'unattributed',
              vectorSource: 'applyStatus-direct', vectorEvidence: 'mundane disease applied without contractDisease; source: ' + String(src),
              daysLeft0: null, severity: 1, hpAtOnset: null, rangeProfile: null,
              drinksDirty: null, hygiene: null, healerPresent: healerPresentNow(), medicCount: medicIds().length,
              sayWin: W.sayWin.slice(-3) });
          }
        }
      } catch (e) {}
      return r;
    };

    // villagerCareTick: diff daysLeft (tended patients) + dutyCure capture.
    const oVCT = Game.villagerCareTick;
    if (typeof oVCT === 'function') Game.villagerCareTick = function (nm) {
      let before = null, medics = [], holder = null;
      try {
        const v = (Game.state || {}).village || {};
        before = {};
        for (const [vid, rec] of Object.entries(v.sick || {})) {
          before[vid] = { name: rec.name, daysLeft: rec.daysLeft,
            severity: rec.severity == null ? null : rec.severity };
        }
        medics = medicIds();
        try { holder = Game.medicDutyHolder ? Game.medicDutyHolder() : null; } catch (e2) {}
      } catch (e) {}
      const r = oVCT.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        for (const vid of Object.keys(before || {})) {
          const b = before[vid];
          const after = (v.sick || {})[vid];
          if (!after) {
            W.treatEvents.push({ day: dayOf(), kind: 'dutyCure', who: String(vid).slice(0, 24),
              whoName: npcName(vid), diseaseName: b.name,
              diseaseId: diseaseIdForNpcName(b.name),
              daysLeftBefore: b.daysLeft, holder: holder ? String(holder).slice(0, 24) : null,
              medics: medics.slice(0, 8) });
          } else if (after.daysLeft < b.daysLeft) {
            W.treatEvents.push({ day: dayOf(), kind: 'villagerCare', who: String(vid).slice(0, 24),
              whoName: npcName(vid), diseaseName: after.name,
              diseaseId: diseaseIdForNpcName(after.name),
              daysLeftBefore: b.daysLeft, daysLeftAfter: after.daysLeft, medics: medics.slice(0, 8) });
          }
        }
      } catch (e) {}
      return r;
    };

    // villagerTreatTick: a medic eases the scholar's sickness (easedUntil moves).
    const oVTT = Game.villagerTreatTick;
    if (typeof oVTT === 'function') Game.villagerTreatTick = function () {
      let before = null;
      try { before = scholarDiseaseMap(); } catch (e) {}
      const r = oVTT.apply(this, arguments);
      try {
        const after = scholarDiseaseMap();
        for (const id of Object.keys(after)) {
          const b = (before || {})[id], a = after[id];
          if (b && (a.easedUntil || 0) > (b.easedUntil || 0)) {
            W.treatEvents.push({ day: dayOf(), kind: 'villagerTreat', who: 'scholar', whoName: 'scholar',
              diseaseId: id, easedUntilBefore: b.easedUntil || null, easedUntilAfter: a.easedUntil || null,
              dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: a.dayPartsLeft });
          }
        }
      } catch (e) {}
      return r;
    };

    // diagnoseDisease: every diagnosis.
    const oDD = Game.diagnoseDisease;
    if (typeof oDD === 'function') Game.diagnoseDisease = function (target, effectId, opts) {
      const r = oDD.apply(this, arguments);
      try {
        if (r) W.diagnoses.push({ day: dayOf(),
          target: target === 'scholar' ? 'scholar' : String((target && (target.villagerId || target.id)) || '?').slice(0, 24),
          diseaseId: effectId, by: (opts && opts.by) || null });
      } catch (e) {}
      return r;
    };

    // treatVillager: diff v.sick (cured = record deleted; eased = daysLeft down).
    const oTV = Game.treatVillager;
    if (typeof oTV === 'function') Game.treatVillager = function (vid, abilityId) {
      let before = null;
      try { const v = (Game.state || {}).village || {}; before = (v.sick || {})[vid] ? JSON.parse(JSON.stringify(v.sick[vid])) : null; } catch (e) {}
      const r = oTV.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        const after = (v.sick || {})[vid] || null;
        if (before) {
          if (!after) {
            W.treatEvents.push({ day: dayOf(), kind: 'treatVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), abilityId, diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'cured', daysLeftBefore: before.daysLeft, daysLeftAfter: 0 });
            W.sickEnds.push({ day: dayOf(), who: String(vid).slice(0, 24), whoName: npcName(vid), kind: 'npc', name: before.name, diseaseId: diseaseIdForNpcName(before.name), outcome: 'cured', by: 'treatVillager:' + abilityId });
          } else if (after.daysLeft < before.daysLeft) {
            W.treatEvents.push({ day: dayOf(), kind: 'treatVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), abilityId, diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'eased', daysLeftBefore: before.daysLeft, daysLeftAfter: after.daysLeft });
          } else {
            W.treatEvents.push({ day: dayOf(), kind: 'treatVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), abilityId, diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'no-change', daysLeftBefore: before.daysLeft, daysLeftAfter: after.daysLeft });
          }
        }
      } catch (e) {}
      return r;
    };

    // tendVillager: diff v.sick daysLeft, or wound-care HP gain when not sick.
    const oTend = Game.tendVillager;
    if (typeof oTend === 'function') Game.tendVillager = function (vid) {
      let before = null, hpBefore = null;
      try { const v = (Game.state || {}).village || {}; before = (v.sick || {})[vid] ? JSON.parse(JSON.stringify(v.sick[vid])) : null; hpBefore = (v.health || {})[vid]; } catch (e) {}
      const r = oTend.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        const after = (v.sick || {})[vid] || null;
        const hpAfter = (v.health || {})[vid];
        if (before && after && after.daysLeft < before.daysLeft) {
          W.treatEvents.push({ day: dayOf(), kind: 'tendVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'eased', daysLeftBefore: before.daysLeft, daysLeftAfter: after.daysLeft, hpBefore: hpBefore == null ? null : hpBefore, hpAfter: hpAfter == null ? null : hpAfter });
        } else if (!before && hpBefore != null && hpAfter != null && hpAfter > hpBefore) {
          W.treatEvents.push({ day: dayOf(), kind: 'tendVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), diseaseName: null, diseaseId: null, result: 'wound-care', hpBefore, hpAfter });
        }
      } catch (e) {}
      return r;
    };

    // Scholar self-treatment (folkRemedy / treatDisease / useMedicine): the
    // winseek policy is not expected to call these; the wrappers prove it.
    const wrapScholarTreat = (fnName, kind) => {
      const o = Game[fnName];
      if (typeof o !== 'function') return;
      Game[fnName] = function (...args) {
        let before = null;
        try { before = scholarDiseaseMap(); } catch (e) {}
        const r = o.apply(this, arguments);
        try {
          const after = scholarDiseaseMap();
          const ids = new Set([...Object.keys(before || {}), ...Object.keys(after)]);
          let logged = false;
          for (const id of ids) {
            const b = (before || {})[id], a = after[id];
            if (b && !a) {
              W.treatEvents.push({ day: dayOf(), kind, who: 'scholar', whoName: 'scholar', diseaseId: id, result: 'cured', dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: 0, arg: String(args[0] == null ? '' : args[0]) });
              logged = true;
            } else if (b && a && ((a.dayPartsLeft !== b.dayPartsLeft) || ((a.easedUntil || 0) !== (b.easedUntil || 0)))) {
              W.treatEvents.push({ day: dayOf(), kind, who: 'scholar', whoName: 'scholar', diseaseId: id, result: 'eased', dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: a.dayPartsLeft, easedUntilBefore: b.easedUntil || null, easedUntilAfter: a.easedUntil || null, arg: String(args[0] == null ? '' : args[0]) });
              logged = true;
            }
          }
          if (!logged && before && Object.keys(before).length) {
            const id0 = Object.keys(before)[0];
            W.treatEvents.push({ day: dayOf(), kind, who: 'scholar', whoName: 'scholar', diseaseId: id0, result: 'no-effect', dayPartsLeftBefore: before[id0].dayPartsLeft, arg: String(args[0] == null ? '' : args[0]) });
          }
        } catch (e) {}
        return r;
      };
    };
    wrapScholarTreat('folkRemedy', 'folkRemedy');
    wrapScholarTreat('treatDisease', 'treatDisease');
    wrapScholarTreat('useMedicine', 'useMedicine');

    // removeTick: clean vs botched.
    const oRT = Game.removeTick;
    if (typeof oRT === 'function') Game.removeTick = function () {
      let hadTick = false, wfBefore = 0;
      try { hadTick = !!(Game.hasStatus && Game.hasStatus('scholar', 'tick_attached')); wfBefore = W.sickOnsets.filter(o => o.kind === 'scholar' && o.diseaseId === 'wound_fever').length; } catch (e) {}
      const r = oRT.apply(this, arguments);
      try {
        if (hadTick) {
          let stillTick = false;
          try { stillTick = !!(Game.hasStatus && Game.hasStatus('scholar', 'tick_attached')); } catch (e) {}
          const wfAfter = W.sickOnsets.filter(o => o.kind === 'scholar' && o.diseaseId === 'wound_fever').length;
          W.treatEvents.push({ day: dayOf(), kind: 'removeTick', who: 'scholar', whoName: 'scholar',
            diseaseId: 'tick_attached',
            result: wfAfter > wfBefore ? 'botched (wound_fever)' : (stillTick ? 'still-attached' : 'clean') });
        }
      } catch (e) {}
      return r;
    };

    // sickRestTick: sleep helps slow-folk diseases (diff scholar seList).
    const oSRT = Game.sickRestTick;
    if (typeof oSRT === 'function') Game.sickRestTick = function (via) {
      let before = null;
      try { before = scholarDiseaseMap(); } catch (e) {}
      const r = oSRT.apply(this, arguments);
      try {
        const after = scholarDiseaseMap();
        for (const id of Object.keys(after)) {
          const b = (before || {})[id], a = after[id];
          if (b && a.dayPartsLeft < b.dayPartsLeft) {
            W.treatEvents.push({ day: dayOf(), kind: 'sickRest', who: 'scholar', whoName: 'scholar', diseaseId: id, result: 'eased', dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: a.dayPartsLeft, via: via || null });
          }
        }
      } catch (e) {}
      return r;
    };

    // cureStatus: cure attribution + scholar sickEnds.
    const oCS = Game.cureStatus;
    if (typeof oCS === 'function') Game.cureStatus = function (target, effectId, source) {
      const r = oCS.apply(this, arguments);
      try {
        if (r) {
          W.cureEvents.push({ day: dayOf(), target: target === 'scholar' ? 'scholar' : String((target && (target.villagerId || target.id)) || '?').slice(0, 24), diseaseId: effectId, source: source || null });
          if (target === 'scholar' && MUNDANE_IDS.has(effectId)) {
            W.sickEnds.push({ day: dayOf(), who: 'scholar', whoName: 'scholar', kind: 'scholar', name: effectId, diseaseId: effectId, outcome: 'cured', by: source || 'cureStatus' });
          }
        }
      } catch (e) {}
      return r;
    };

    // seRemove: scholar episode ends via expiry or early removal.
    const oSR = Game.seRemove;
    if (typeof oSR === 'function') Game.seRemove = function (target, st) {
      let partsBefore = null, id = null;
      try { id = st && st.id; partsBefore = st && st.dayPartsLeft; } catch (e) {}
      const r = oSR.apply(this, arguments);
      try {
        if (target === 'scholar' && id && MUNDANE_IDS.has(id)) {
          W.sickEnds.push({ day: dayOf(), who: 'scholar', whoName: 'scholar', kind: 'scholar',
            name: id, diseaseId: id,
            outcome: (partsBefore != null && partsBefore <= 0) ? 'recovered (expired)' : 'removed-early',
            dayPartsLeftAtRemoval: partsBefore });
        }
      } catch (e) {}
      return r;
    };

    // ---- NEW: healerRounds wrapper (the wound-care channel) ----
    // healerRounds() treats the single most-hurt villager (<70 HP) once per
    // day, +15 HP, and returns the treated vid or null. Diff the health map
    // around the call so the event carries HP before/after even if the
    // engine's return contract ever changes; the return value is the
    // authority for WHO was treated.
    const oHR = Game.healerRounds;
    if (typeof oHR === 'function') Game.healerRounds = function () {
      let healthBefore = null, healerHere = null, healerHaven = null;
      try {
        const v = (Game.state || {}).village || {};
        healthBefore = Object.assign({}, v.health || {});
        try { healerHere = Game.campHealerId ? Game.campHealerId('here') : null; } catch (e2) {}
        try { healerHaven = Game.campHealerId ? Game.campHealerId('haven') : null; } catch (e2) {}
      } catch (e) {}
      const r = oHR.apply(this, arguments);
      try {
        if (r) {
          const v = (Game.state || {}).village || {};
          const hb = healthBefore ? healthBefore[r] : null;
          const ha = (v.health || {})[r];
          W.healerRoundsEvents.push({ day: dayOf(), kind: 'healerRounds',
            who: String(r).slice(0, 24), whoName: npcName(r),
            hpBefore: hb == null ? null : hb, hpAfter: ha == null ? null : ha,
            healerHere: healerHere ? String(healerHere).slice(0, 24) : null,
            healerHaven: healerHaven ? String(healerHaven).slice(0, 24) : null,
            healerPresent: healerPresentNow() });
        }
      } catch (e) {}
      return r;
    };
  } // end if (!bare) — fever wrappers above are recorders, skipped in BARE mode

  const policy = Object.assign({}, winseek);
  const origDaily = winseek.daily;
  if (!bare) policy.daily = (G, ctx) => {
    try {
      const v = (G.state || {}).village || {};
      const roster = v.roster || [];
      let sickCount = 0, healthSum = 0, healthN = 0;
      const sickMap = {};
      const healthMap = {};
      try {
        for (const [vid, rec] of Object.entries(v.sick || {})) {
          sickMap[vid] = { name: rec.name, daysLeft: rec.daysLeft, severity: rec.severity, diagnosed: !!rec.diagnosed };
        }
        for (const id of roster) {
          const h = (v.health || {})[id];
          const hv = (h === undefined ? 100 : h);
          healthSum += hv; healthN++;
          healthMap[id] = hv;
          if (hv < 50) sickCount++;
        }
      } catch (e) {}
      let sickMeanHealth = null, healthyMeanHealth = null, sickCountNPC = 0;
      try {
        let sSum = 0, sN = 0, hSum = 0, hN = 0;
        for (const id of roster) {
          let dead = false; try { const p = G.vpOf && G.vpOf(id); dead = !!(p && p.dead); } catch (e2) {}
          if (dead) continue;
          const h = (v.health || {})[id]; const hv = (h === undefined ? 100 : h);
          if ((v.sick || {})[id]) { sSum += hv; sN++; sickCountNPC++; } else { hSum += hv; hN++; }
        }
        sickMeanHealth = sN ? Math.round((sSum / sN) * 10) / 10 : null;
        healthyMeanHealth = hN ? Math.round((hSum / hN) * 10) / 10 : null;
      } catch (e) {}
      W.daySeries.push({ day: dayOf(), pop: roster.length,
        sickCount, meanHealth: healthN ? Math.round((healthSum / healthN) * 10) / 10 : null,
        sickMap, scholarSick: scholarDiseaseList(),
        healerPresent: healerPresentNow(), medicCount: medicIds().length,
        sickMeanHealth, healthyMeanHealth, sickCountNPC, healthMap });
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  // GROUND-TRUTH DUTY CURES (sim-sametick-a): the game's own cumulative
  // counter (v.medicDutyCures), read once at run end — a pure read, after
  // the sim, so it cannot affect the trajectory.
  const dutyCuresTotal = (() => {
    try {
      const c = ((Game.state || {}).village || {}).medicDutyCures || {};
      return { ability: c.ability || 0, medicine: c.medicine || 0,
        total: (c.ability || 0) + (c.medicine || 0) };
    } catch (e) { return { ability: 0, medicine: 0, total: 0 }; }
  })();
  // The fallen list is the authoritative death record (full entries incl.
  // monsterName) — read once at run end, a pure read.
  const fallen = (() => {
    try {
      const f = (((Game.state || {}).village || {}).fallen) || [];
      return JSON.parse(JSON.stringify(f));
    } catch (e) { return []; }
  })();

  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const finalPop = (() => { try { return (((Game.state || {}).village || {}).roster || []).length; } catch (e) { return null; } })();
  const deathKeys = W.deaths.map(d => d.day + '|' + d.who + '|' + d.cause).sort();
  const fingerprint = { seed, daysAlive: result.days, endReason: result.endReason,
    rank, maxWave, national, table: won, win: won,
    deathCauses, deathKeys, finalPop };
  if (bare) return { seed, perSeed: null, diag: null, fingerprint };

  const perSeed = {
    seed, policy: 'winseek',
    daysAlive: result.days, villageDays: W.daySeries.length,
    endReason: result.endReason,
    deathCauses, deathRows: W.deaths, fallen,
    daySeries: W.daySeries, national, rank,
    table: won, win: won,
    waveReach, finalPop,
    sickOnsets: W.sickOnsets, sickEnds: W.sickEnds, treatEvents: W.treatEvents,
    statusEvents: W.statusEvents, diagnoses: W.diagnoses, cureEvents: W.cureEvents,
    healerRoundsEvents: W.healerRoundsEvents,
    deathSays: W.deathSays, sitVerbMsgs: W.sitVerbMsgs, doorVerbMsgs: W.doorVerbMsgs,
    instrumentErrors: W.instrumentErrors,
    dutyCuresTotal,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    deathRowCount: W.deaths.length, fallenCount: fallen.length, ms,
    onsetCount: W.sickOnsets.length, endCount: W.sickEnds.length,
    treatEventCount: W.treatEvents.length, statusEventCount: W.statusEvents.length,
    diagnosisCount: W.diagnoses.length, cureEventCount: W.cureEvents.length,
    healerRoundsCount: W.healerRoundsEvents.length,
    sitVerbCount: W.sitVerbMsgs.length, doorVerbCount: W.doorVerbMsgs.length,
    instrumentErrorCount: W.instrumentErrors.length,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 58201-58208, got: ' + (process.env.SEEDS || '(unset)'));
    process.exit(2);
  }
  if (DAYS !== 150) {
    console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
    process.exit(2);
  }
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, fingerprint } = await oneRun(seed, DAYS, { bare: false });
    rows.push({ seed: s, perSeed, diag, fingerprint });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    const file = path.join(PERSEED_DIR, `sicknessdiag-b-winseek-s${s}.json`);
    if (fs.existsSync(file)) { console.error('SWEEP STOP: refusing to overwrite ' + file); process.exit(3); }
    writeRobust(file, JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} fallen=${diag.fallenCount} onsets=${diag.onsetCount} ends=${diag.endCount} treats=${diag.treatEventCount} healerRounds=${diag.healerRoundsCount} cures=${diag.cureEventCount} sitVerbs=${diag.sitVerbCount} errors=${diag.instrumentErrorCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (G2 neutrality): same seeds/days/policy, recorders skipped.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `sicknessdiag-b-bare-s${seed}.json`),
      JSON.stringify(fingerprint));
    console.log(`bare seed=${seed} days=${fingerprint.daysAlive} end=${fingerprint.endReason} deaths=${Object.values(fingerprint.deathCauses).reduce((a, b) => a + b, 0)}`);
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
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'winseek', policy: 'winseek', days: DAYS, seeds: allSeeds }, rows: merged, bare: bareRows }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows, ' + bareRows.length + ' bare)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BATCH, DAYS, writeRobust };
