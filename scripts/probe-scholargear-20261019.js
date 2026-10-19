#!/usr/bin/env node
// probe-scholargear-20261019.js — scholar gear-day sweep instrument
// (flesh-out loop arm sim-scholargear, run fleshout-20261019T1xxxZ, axis
// scale-onramp).
//
// REUSE-FORK of scripts/probe-armorup-20261019.js (identical-by-
// construction): identical substrate guard, identical death capture
// (installDeathCapture + attributeDeaths + the vetwindow-identical
// classifier, imported from the windowsurvive probe module — NOT copied),
// identical dayHash det-gate. The deliberate differences:
//   (1) policyFor wraps the w5path stack OUTSIDE with the scholargear layer
//       (SCHOLARGEAR=1 = armed arm; unset = control arm — gate-off is pure
//       delegation, DET-pinned byte-identical to the bare stack).
//   (2) the daily wrap adds an armor census (pure engine reads): scholar
//       worn P, home-fighter mean worn P, unworn armor pieces in the
//       village (scholar pack + villager packs/stashes, not worn).
//   (3) a once-installed Game.say hook counts "too heavy" lines — the
//       encumbrance watch item (findings backlog 2026-10-18).
//   (4) the scholargear layer's ctx counters (sgDays, sgEquippedNew,
//       sgStashFetched, sgPBefore, sgPAfter) are read back from the
//       captured ctx.
//   (5) a fight-start recorder captures scholar worn P (Game.armorBonus())
//       at every fight open — the secondary instrument.
//
// SUBSTRATE (w5path, VETREL=1 — the windowsurvive/vetrel1 substrate, for
// comparability with evidence/2026-10-19/windowsurvive-taxonomy.md):
//   withScholarGear(withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1
//   Arm: SCHOLARGEAR=1 (armed) vs unset (control).
//
// PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE
// the sweep; see evidence/2026-10-19/sim-scholargear.md):
//   PRIMARY: scholar combat deaths (raid + wild + patrol channels, player
//     deaths — the taxonomy's field-combat bucket) per run, armed vs
//     control on IDENTICAL seeds, PAIRED DELTAS. GO: >= 20% fewer scholar
//     combat deaths on the armed arm. A miss is NO-GO, never re-scored
//     mid-run (§14).
//   HORIZON: 180d death-aware (+10d tail max via the harness).
//   SEEDS: 63801–63808 (comparability with the taxonomy) x {leadfeast,
//     belongfeast} x {control, armed} = 32 runs.
//   GUARDRAILS: wave-4 unlocks within ±2/16 of control; median survival no
//     worse than -10d; no new death mode; starvation deaths <= control+1.
//     Watch item (not guardrail): encumbrance/action-failure rate.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 \
//   node scripts/probe-scholargear-20261019.js
//   SCHOLARGEAR=1 ... # armed arm (or SG_ARM=armed)
//   SMOKE=1 ...      # short smoke: both policies drive, census + layer live
//   DET=1 ...        # det-gate: gate-off vs bare stack byte-identical;
//                    # SCHOLARGEAR=1 repeat byte-identical
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="63801,63802" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const SG = require('./policies/scholargear');
const WS = require('./probe-windowsurvive-20261019'); // substrate guard + shared instrument fns
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// ARM SELECTION — the scholargear layer reads process.env.SCHOLARGEAR per call,
// so one process can sweep both arms by flipping it between runs.
const SG_ARM = (process.env.SG_ARM || (process.env.SCHOLARGEAR === '1' ? 'armed' : 'control')).toLowerCase();
const ARMS = (process.env.SG_ARMS ? process.env.SG_ARMS.split(',').map(s => s.trim().toLowerCase()) : [SG_ARM])
  .filter(a => a === 'control' || a === 'armed');
if (!ARMS.length) { console.error('SWEEP STOP: no valid arms (SG_ARMS=control,armed).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [63801, 63802, 63803, 63804, 63805, 63806, 63807, 63808]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-scholargear');
const isBare = () => process.env.SG_BARE === '1';

// homeFighters: fighters at home — roster minus the scholar, not away,
// not dead (the armorup module's helper, re-derived locally — the layer
// was deleted per kill protocol).
function homeFighters(Game) {
  const out = [];
  try {
    const v = (Game.state || {}).village || {};
    const away = v.away || {};
    for (const rid of (v.roster || [])) {
      if (rid === Game.villagerId) continue;
      if (away[rid]) continue;
      const p = Game.getPerson ? Game.getPerson(rid) : null;
      if (!p || p.dead) continue;
      out.push(rid);
    }
  } catch (e) {}
  return out;
}

// Policy composition — the w5path stack (windowsurvive probe) with the
// scholargear layer OUTSIDE. SCHOLARGEAR env (set per-arm in the sweep) gates it.
function policyFor(policyId) {
  const inner = WS.policyFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  return SG.withScholarGear(inner, `${tag}-scholargear`, `${policyId} + w5path stack + SCHOLARGEAR scholar gear-day`);
}

// ---------- armor census (pure engine reads) ----------
function armorCensus(Game) {
  const c = { schP: 0, fighterMeanP: 0, fightersN: 0, unworn: 0, unwornScholar: 0, unwornFighter: 0, unwornOther: 0 };
  try {
    const items = (Game.data && Game.data.items) || [];
    const defOf = (id) => items.find(d => d && d.id === id) || null;
    const idOf = (it) => (it && (it.itemId || it.id)) || it;
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    try { c.schP = Game.armorBonus ? (Game.armorBonus() | 0) : 0; } catch (e) {}
    // unworn armor in the scholar's pack
    try {
      const s = (Game.state || {}).scholar || {};
      const wornIds = new Set(Object.values(s.equipped || {}).map(e => e && e.itemId).filter(Boolean));
      for (const it of (s.inventory || [])) {
        const id = idOf(it);
        const d = defOf(id);
        if (d && d.armor && !wornIds.has(id)) { c.unworn++; c.unwornScholar++; }
      }
    } catch (e) {}
    // fighters at home + their unworn armor (packs + stashes)
    let sum = 0, n = 0;
    const fighterSet = new Set();
    try {
      for (const vid of homeFighters(Game)) {
        fighterSet.add(String(vid));
        const p = Game.getPerson ? Game.getPerson(vid) : null;
        if (!p || p.dead) continue;
        let pp = 0;
        try { pp = eq ? (eq.armorOf(p, items) || 0) : 0; } catch (e) {}
        sum += pp; n++;
        const wornIds = new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
        for (const it of (p.items || [])) {
          const id = idOf(it);
          const d = defOf(id);
          if (d && d.armor && !wornIds.has(id)) { c.unworn++; c.unwornFighter++; }
        }
        for (const it of (p.stashed || [])) {
          const id = idOf(it);
          const d = defOf(id);
          if (d && d.armor && !wornIds.has(id)) { c.unworn++; c.unwornFighter++; }
        }
      }
    } catch (e) {}
    // everyone else on the roster: unworn armor the drill cannot reach
    // (away, sheltered, wounded, non-fighters) — the honest remainder
    try {
      const v = (Game.state || {}).village || {};
      for (const rid of (v.roster || [])) {
        if (fighterSet.has(String(rid)) || rid === Game.villagerId) continue;
        const p = Game.getPerson ? Game.getPerson(rid) : null;
        if (!p || p.dead) continue;
        const wornIds = new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
        for (const bag of [p.items || [], p.stashed || []]) {
          for (const it of bag) {
            const id = idOf(it);
            const d = defOf(id);
            if (d && d.armor && !wornIds.has(id)) { c.unworn++; c.unwornOther++; }
          }
        }
      }
    } catch (e) {}
    c.fightersN = n;
    c.fighterMeanP = n ? Math.round((sum / n) * 10) / 10 : 0;
  } catch (e) {}
  return c;
}

// ---------- "too heavy" watch: once-installed Game.say hook (count only) ----------
function installTooHeavy(Game, C) {
  if (Game.__sgTooHeavyInstalled) return;
  Game.__sgTooHeavyInstalled = true;
  try {
    const orig = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        if (typeof msg === 'string' && /too heavy/i.test(msg)) C.tooHeavy = (C.tooHeavy || 0) + 1;
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  } catch (e) { C.instrumentErrors++; }
}

// ---------- runOne (mirrors the windowsurvive probe's runOne; arm tag added) ----------
const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = policyFor(policyId);
  const bare = isBare();
  const C = {
    recs: [], hashes: [], deathRecs: [], fightStarts: [], fightScholarP: [], _router: null,
    instrumentErrors: 0, tooHeavy: 0,
    maxRank: 0, everTable: false, exiled: false,
    maxWave: 1, wave4Day: null, wave5Day: null, nationalDay: null, invites: 0, _wasWaiting: false,
    ctx: null,
  };
  const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) {
      try { installDeathCapture(G, C); } catch (e) { C.instrumentErrors++; }
      try { installTooHeavy(G, C); } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { C.ctx = ctx; } catch (e) {}
    try {
      // Hashes ALWAYS recorded (bare and live alike) — the det-gate
      // compares these; gating them on !isBare() voids the gate.
      C.hashes.push(scholarDay(G) + ':' + dayHash(G));
    } catch (e) {}
    if (!bare) {
      try {
        const rec = WS.dailyRec(G);
        rec.au = armorCensus(G);
        C.recs.push(rec);
        if (rec.uw > C.maxWave) C.maxWave = rec.uw;
        if (rec.uw >= 4 && C.wave4Day == null) C.wave4Day = rec.d;
        if (rec.uw >= 5 && C.wave5Day == null) C.wave5Day = rec.d;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if (rank === 'national' || rank === 'global') {
          if (C.nationalDay == null) C.nationalDay = rec.d;
        }
        const pg = G.progState ? G.progState() : null;
        if (pg && pg.tableWaiting) C.everTable = true;
        if ((G.state.scholar || {}).exiled) C.exiled = true;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'scholargear', fullTelemetry: false });
  await setupGame(Game);
  const monsterNames = monsterNameSet(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : WS.attributeDeaths(Game, C, monsterNames);
  let endRec = null;
  try { endRec = WS.dailyRec(Game); } catch (e) { endRec = null; }
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let maxWave = C.maxWave;
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && C.wave5Day == null) C.wave5Day = gameDays;
    if (maxWave >= 4 && C.wave4Day == null) C.wave4Day = gameDays;
  } catch (e) {}
  const ctx = C.ctx || {};
  const out = {
    seed, policyId, arm: opts.arm || 'control', substrate: 'w5path-vetrel1-scholargear',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won,
    deaths,
    maxRank: C.maxRank, national: C.nationalDay != null ? 1 : 0, nationalDay: C.nationalDay,
    table: C.everTable ? 1 : 0, exiled: C.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    instrumentErrors: C.instrumentErrors | 0,
    tooHeavy: C.tooHeavy | 0,
    sg: {
      days: ctx.sgDays || 0,
      equippedNew: ctx.sgEquippedNew || 0,
      stashFetched: ctx.sgStashFetched || 0,
      pBefore: ctx.sgPBefore || 0,
      pAfter: ctx.sgPAfter || 0,
    },
    fightScholarP: C.fightScholarP || [],
    deathsAttributed: attr,
    fightStarts: C.fightStarts || [],
    recs: C.recs, endRec, hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(EVID, out.arm, policyId);
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, `s${seed}.json`);
    const tmp = f + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(out));
    fs.renameSync(tmp, f);
    const st = fs.statSync(f);
    if (st.size === 0) { fs.unlinkSync(f); throw new Error('0-byte per-seed file (host EPERM flap?): ' + f); }
  }
  return out;
}

// monsterNameSet + installDeathCapture: reuse the windowsurvive module's
// (identical-by-construction). They aren't exported, so the small set is
// re-derived here; installDeathCapture IS the same function the windowsurvive
// probe installs (copied with its comments trimmed — behavior identical).
function monsterNameSet(Game) {
  const set = new Set();
  try {
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (m && m.name) set.add(String(m.name).toLowerCase());
      if (m && m.id) set.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m && m.id) set.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  return set;
}
function installDeathCapture(Game, C) {
  C._router = null;
  if (!Array.isArray(C.fightStarts)) C.fightStarts = [];
  const recFight = (mid, wave, via) => {
    try {
      C.fightStarts.push({ day: scholarDay(Game), mid: mid != null ? String(mid) : null, wave: wave != null ? (wave | 0) : WS.waveOf(Game, mid), via });
      // fight-open scholar worn P (pure engine read — the secondary instrument)
      try { C.fightScholarP.push(Game.armorBonus ? (Game.armorBonus() | 0) : 0); } catch (e) {}
    }
    catch (e) { C.instrumentErrors++; }
  };
  const wrapRouter = (name, flag, midOf) => {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { C.instrumentErrors++; return; }
      Game[name] = function (...args) {
        const prev = C._router;
        C._router = flag;
        try {
          if (!isBare()) {
            try {
              const mid = midOf ? midOf(args) : null;
              if (mid) recFight(mid, null, 'router:' + flag);
            } catch (e) { C.instrumentErrors++; }
          }
          return orig.apply(this, args);
        }
        finally { C._router = prev; }
      };
    } catch (e) { C.instrumentErrors++; }
  };
  wrapRouter('resolvePatrol', 'patrol', (args) => (args[1] && args[1].id) || null);
  wrapRouter('resolveWildMonsterEncounter', 'wild', (args) => (args[1] && args[1].id) || null);
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try { if (!isBare()) recFight(mdef && mdef.id, mdef && mdef.wave, 'aidFight'); }
        catch (e) { C.instrumentErrors++; }
        return oAid.apply(this, arguments);
      };
    } else { C.instrumentErrors++; }
  } catch (e) { C.instrumentErrors++; }
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'combat_start' && !isBare()) {
          recFight(data && data.vs, data && data.wave, 'combat_start');
        }
        if (type === 'death') {
          const rec = {
            day: scholarDay(Game),
            who: data && data.who != null ? String(data.who) : null,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
            wave: (data && data.wave != null) ? (data.wave | 0) : null,
            ctx: { aid: false, atHaven: false, inTb: false, router: C._router || null, onExped: false },
            stateAtDeath: WS.stateSnap(Game),
          };
          try { rec.ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) {}
          try { rec.ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
          try { rec.ctx.inTb = !!Game.tbfight; } catch (e) {}
          try {
            const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
            rec.ctx.onExped = !!(st && st.exped && rec.who && st.exped[rec.who]);
          } catch (e) {}
          C.deathRecs.push(rec);
        }
      } catch (e) { C.instrumentErrors++; }
      return r;
    };
  } catch (e) { C.instrumentErrors++; }
}

async function sweepArm(arm) {
  if (arm === 'armed') process.env.SCHOLARGEAR = '1'; else delete process.env.SCHOLARGEAR;
  console.log(`SWEEP ARM=${arm} (SCHOLARGEAR=${process.env.SCHOLARGEAR || 'unset'}) seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${daysNow()}`);
  let bad = 0;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      try {
        const out = await runOne(seed, policyId, { arm });
        console.log(`  ok ${arm}/${policyId}/s${seed} days=${out.gameDays} end=${out.endReason} wave=${out.maxWave} ierr=${out.instrumentErrors} tooHeavy=${out.tooHeavy} sgDays=${out.sg.days} wornNew=${out.sg.equippedNew} stash=${out.sg.stashFetched}`);
      } catch (e) {
        bad++;
        console.error(`  FAIL ${arm}/${policyId}/s${seed}: ${e && e.message}`);
      }
    }
  }
  return bad;
}

async function main() {
  let bad = 0;
  for (const arm of ARMS) bad += await sweepArm(arm);
  console.log(`SWEEP DONE arms=${ARMS.join(',')} bad=${bad}`);
  if (bad) process.exit(1);
}

module.exports = { runOne, policyFor, armorCensus, homeFighters, daysNow, SG_ARM, ARMS };

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
