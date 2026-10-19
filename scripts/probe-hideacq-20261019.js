#!/usr/bin/env node
// probe-hideacq-20261019.js — hide-acquisition sweep instrument
// (flesh-out loop arm sim-hideacq, run fleshout-20261019T1815Z, axis
// scale-onramp).
//
// REUSE-FORK of scripts/probe-vinearmor-20261019.js (the REUSE-FORK precedent:
// sim-vetrel1): identical substrate guard, identical death capture
// (installDeathCapture + attributeDeaths + the vetwindow-identical
// classifier, from the windowsurvive probe module — NOT copied), identical
// dayHash det-gate. The deliberate differences:
//   (1) policyFor wraps the w5path stack OUTSIDE with the hideacq layer
//       (HIDEACQ=1 = armed arm; unset = control arm — gate-off is pure
//       delegation, DET-pinned byte-identical to the bare stack). The
//       layer's pre-pass runs its dawn butcher + craft drive BEFORE
//       base.daily (the dawn trapline catch is butchered before the
//       homecoming pooling can strand its hides on the counter); the
//       post-pass sweeps hides off today's kills and re-checks the craft
//       drive on the day's full haul.
//   (2) the daily wrap adds an armor census (pure engine reads — copied
//       from the armorup probe) PLUS a production census: scholar pack
//       materials (bark/vine/hide), hide_armor + bark_armor recipe levels,
//       base-policy bark crafts AND the base's vine-sink counters
//       (knivesKnapped/armedKnife/knappedKnife, trapsCrafted/trapsSet), and
//       the hideacq layer's ha* ctx counters.
//   (3) a once-installed Game.say hook counts "too heavy" lines — the
//       encumbrance watch item — plus pack-refusal and left-behind counts.
//
// SUBSTRATE (w5path, VETREL=1 — the windowsurvive/vetrel1 substrate, for
// comparability with evidence/2026-10-19/windowsurvive-taxonomy.md):
//   withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1
//   Arm: HIDEACQ=1 (armed) vs unset (control).
//
// PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE
// the sweep; see evidence/2026-10-19/sim-hideacq.md):
//   PRIMARY: hide_armor crafts per run (scholar-side — the layer's ha
//     counters; both arms instrumented identically), armed vs control on
//     IDENTICAL seeds, paired. GO: armed mean >= 2x control mean AND armed
//     mean >= 0.5 craft/run. A miss is NO-GO, never re-scored (§14).
//   HORIZON: 180d death-aware (+10d tail max via the harness).
//   SEEDS: 63901–63908 (this run's pilot seeds) x {leadfeast,
//     belongfeast} x {control, armed} = 32 runs.
//   GUARDRAILS: wave-4 unlocks within ±2/16 of control; median survival no
//     worse than -10d; no new death mode (revised >=2-event rule);
//     starvation deaths <= control+1 (paired per run).
//   SECONDARY: (hide>=2 & vine>=1) co-occurrence days/run; wave-5 door
//     armored15 leg end/max; scholar mean P worn at fight start; wall
//     numbers (national/table/wave-4/wave-5/wins); "too heavy" rates.
//   Watch item (not guardrail): knife/trap production counts (the dawn
//     butcher reorders where carcasses get cleaned) + meat-flow notes.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 \
//   node scripts/probe-hideacq-20261019.js
//   HIDEACQ=1 ...  # armed arm (or HA_ARM=armed)
//   SMOKE=1 ...      # short smoke: both policies drive, census + layer live
//   DET=1 ...        # det-gate: gate-off vs bare stack byte-identical;
//                    # HIDEACQ=1 repeat byte-identical
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="63801,63802" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const HA = require('./policies/hideacq');
const WS = require('./probe-windowsurvive-20261019'); // substrate guard + shared instrument fns
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// ARM SELECTION — the hideacq layer reads process.env.HIDEACQ per call,
// so one process can sweep both arms by flipping it between runs.
const HA_ARM = (process.env.HA_ARM || (process.env.HIDEACQ === '1' ? 'armed' : 'control')).toLowerCase();
const ARMS = (process.env.HA_ARMS ? process.env.HA_ARMS.split(',').map(s => s.trim().toLowerCase()) : [HA_ARM])
  .filter(a => a === 'control' || a === 'armed');
if (!ARMS.length) { console.error('SWEEP STOP: no valid arms (HA_ARMS=control,armed).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [63901, 63902, 63903, 63904, 63905, 63906, 63907, 63908]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-hideacq');
const isBare = () => process.env.APP_BARE === '1';

// Policy composition — the w5path stack (windowsurvive probe) with the
// hideacq layer OUTSIDE. HIDEACQ env (set per-arm in the sweep) gates it.
// The layer's pre-pass runs its dawn butcher + craft drive BEFORE
// base.daily (the dawn trapline catch is butchered before the homecoming
// pooling can strand its hides on the counter); the post-pass sweeps hides
// off today's kills and re-checks the craft drive on the day's full haul.
function policyFor(policyId) {
  const inner = WS.policyFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  return HA.withHideAcq(inner, `${tag}-hideacq`, `${policyId} + w5path stack + HIDEACQ hide-acquisition drive`);
}

// ---------- wave-5/wave-4 door armor-leg census (mirrors standing.js waveCombatReadiness) ----------
// ARMORED bar: living roster fighters with armor WORN at P >= demand
// (scholar via armorBonus, villagers via equipment.armorOf). Demands:
// wave-4: 3 at P>=10; wave-5: 4 at P>=15. Read-only; same demand table the
// door reads, so "armor short" is the same verdict the game renders.
function doorLeg(Game) {
  const c = { armored10: 0, armored15: 0, rosterN: 0, scholarP: 0 };
  try {
    const items = (Game.data && Game.data.items) || [];
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    const v = (Game.state || {}).village || {};
    const scholarId = Game.villagerId;
    const roster = v.roster || [];
    const vpOfId = (vid) => { try { return Game.getPerson ? Game.getPerson(vid) : null; } catch (e) { return null; } };
    for (const vid of roster) {
      let ap = 0;
      if (vid === scholarId) {
        try { ap = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : 0; } catch (e) { ap = 0; }
      } else {
        const vp = vpOfId(vid);
        if (!vp || vp.dead) continue;
        try { ap = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, items) || 0) : 0; } catch (e) { ap = 0; }
      }
      c.rosterN++;
      if (ap >= 10) c.armored10++;
      if (ap >= 15) c.armored15++;
      if (vid === scholarId) c.scholarP = ap;
    }
  } catch (e) {}
  return c;
}

// ---------- armor census (pure engine reads; copied from the armorup probe) ----------
// homeFighters: the armorup probe read AU.homeFighters(Game) from the
// (deleted) armorup layer. Re-derived here, same observable meaning:
// living roster villagers at home (not the scholar, not away).
function homeFighters(Game) {
  const out = [];
  try {
    const v = (Game.state || {}).village || {};
    for (const rid of (v.roster || [])) {
      if (rid === Game.villagerId) continue;
      if ((v.away || {})[rid]) continue;
      const p = Game.getPerson ? Game.getPerson(rid) : null;
      if (!p || p.dead) continue;
      out.push(rid);
    }
  } catch (e) {}
  return out;
}

function armorCensus(Game) {
  const c = { schP: 0, fighterMeanP: 0, fightersN: 0, unworn: 0, unwornScholar: 0, unwornFighter: 0, unwornOther: 0 };
  try {
    const items = (Game.data && Game.data.items) || [];
    const defOf = (id) => items.find(d => d && d.id === id) || null;
    const idOf = (it) => (it && (it.itemId || it.id)) || it;
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    try { c.schP = Game.armorBonus ? (Game.armorBonus() | 0) : 0; } catch (e) {}
    try {
      const s = (Game.state || {}).scholar || {};
      const wornIds = new Set(Object.values(s.equipped || {}).map(e => e && e.itemId).filter(Boolean));
      for (const it of (s.inventory || [])) {
        const id = idOf(it);
        const d = defOf(id);
        if (d && d.armor && !wornIds.has(id)) { c.unworn++; c.unwornScholar++; }
      }
    } catch (e) {}
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

// ---------- production census (pure engine reads — the MATERIALS-GATE surface) ----------
// The vine-race surface: pack materials (bark/vine/hide), recipe knowledge
// (bark_armor/hide_armor L1+), the base policy's own bark crafts AND its
// vine-sink counters (knives, snares, traps set — the watch item: what the
// vine claim reorders), and the hideacq layer's va* ctx counters.
function prodCensus(Game, ctx) {
  const c = { bark: 0, vine: 0, hide: 0, barkL: 0, hideL: 0,
    barkCraftsBase: 0, haDawnButchers: 0, haNoKnife: 0, haSweeps: 0,
    haHideAttempts: 0, haHideCrafts: 0, haHideFails: 0, haBlindAttempts: 0,
    haHideL0: 0, haWantHide: 0, haWantVine: 0, haBanked: 0,
    haOwnedSkip: 0, haWornSkip: 0,
    knivesKnapped: 0, armedKnife: 0, knappedKnife: 0,
    trapsCrafted: 0, trapsSet: 0, trapsWireSet: 0,
    packKg: 0, packCap: 0 };
  try {
    const s = (Game.state || {}).scholar || {};
    for (const it of (s.inventory || [])) {
      if (!it || it.material == null) continue;
      if (it.material === 'bark') c.bark += it.units || 0;
      else if (it.material === 'vine') c.vine += it.units || 0;
      else if (it.material === 'hide') c.hide += it.units || 0;
    }
    const rc = (Game.state.codex || {}).recipes || {};
    c.barkL = (rc.bark_armor || {}).level || 0;
    c.hideL = (rc.hide_armor || {}).level || 0;
    if (ctx) {
      c.barkCraftsBase = ctx.barkArmorCrafted || 0;
      c.haDawnButchers = ctx.haDawnButchers || 0;
      c.haNoKnife = ctx.haNoKnife || 0;
      c.haSweeps = ctx.haSweeps || 0;
      c.haHideAttempts = ctx.haCraftAttempts || 0;
      c.haHideCrafts = ctx.haCrafts || 0;
      c.haHideFails = ctx.haCraftFails || 0;
      c.haBlindAttempts = ctx.haBlindAttempts || 0;
      c.haHideL0 = ctx.haHideL0 || 0;
      c.haWantHide = ctx.haWantHide || 0;
      c.haWantVine = ctx.haWantVine || 0;
      c.haBanked = ctx.haBanked || 0;
      c.haOwnedSkip = ctx.haOwnedSkip || 0;
      c.haWornSkip = ctx.haWornSkip || 0;
      c.knivesKnapped = ctx.knivesKnapped || 0;
      c.armedKnife = ctx.armedKnife || 0;
      c.knappedKnife = ctx.knappedKnife || 0;
      c.trapsCrafted = ctx.trapsCrafted || 0;
      c.trapsSet = ctx.trapsSet || 0;
      c.trapsWireSet = ctx.trapsWireSet || 0;
    }
    try { c.packKg = Game.packWeight ? Game.packWeight() : 0; } catch (e) {}
    try { c.packCap = Game.packCapacity ? Game.packCapacity() : 0; } catch (e) {}
  } catch (e) {}
  return c;
}

// ---------- "too heavy" watch: once-installed Game.say hook (count only) ----------
function installTooHeavy(Game, C) {
  if (Game.__vaTooHeavyInstalled) return;
  Game.__vaTooHeavyInstalled = true;
  try {
    const orig = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        if (typeof msg === 'string') {
          if (/too heavy/i.test(msg)) C.tooHeavy = (C.tooHeavy || 0) + 1;
          if (/your pack can't take it/i.test(msg)) C.packRefused = (C.packRefused || 0) + 1;
          if (/left where it lies/i.test(msg)) C.leftBehind = (C.leftBehind || 0) + 1;
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  } catch (e) { C.instrumentErrors++; }
}

// ---------- runOne (mirrors the armorup probe's runOne; arm tag added) ----------
const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = policyFor(policyId);
  const bare = isBare();
  const C = {
    recs: [], hashes: [], deathRecs: [], fightStarts: [], _router: null,
    instrumentErrors: 0, tooHeavy: 0, packRefused: 0, leftBehind: 0,
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
        rec.prod = prodCensus(G, ctx);
        rec.door = doorLeg(G);
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
  const { Game } = await loadGame({ seed, mode: 'hideacq', fullTelemetry: false });
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
    seed, policyId, arm: opts.arm || 'control', substrate: 'w5path-vetrel1-hideacq',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won,
    deaths,
    maxRank: C.maxRank, national: C.nationalDay != null ? 1 : 0, nationalDay: C.nationalDay,
    table: C.everTable ? 1 : 0, exiled: C.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    instrumentErrors: C.instrumentErrors | 0,
    tooHeavy: C.tooHeavy | 0, packRefused: C.packRefused | 0, leftBehind: C.leftBehind | 0,
    ap: {
      // primary: scholar-side armor crafts, both arms instrumented
      // identically (layer va crafts + base bark crafts).
      hideAttempts: ctx.haCraftAttempts || 0,
      hideCrafts: ctx.haCrafts || 0,
      hideFails: ctx.haCraftFails || 0,
      dawnButchers: ctx.haDawnButchers || 0,
      sweeps: ctx.haSweeps || 0,
      barkCrafts: (ctx.barkArmorCrafted || 0),
      // watch: vine-sink production (what the vine claim reorders)
      knives: (ctx.knivesKnapped || 0) + (ctx.armedKnife || 0) + (ctx.knappedKnife || 0),
      traps: (ctx.trapsCrafted || 0) + (ctx.trapsSet || 0) + (ctx.trapsWireSet || 0),
    },
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

// monsterNameSet + installDeathCapture: copied verbatim from
// probe-armorup-20261019.js (identical-by-construction across the taxonomy
// family). Behavior identical, comments trimmed.
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
    try { C.fightStarts.push({ day: scholarDay(Game), mid: mid != null ? String(mid) : null, wave: wave != null ? (wave | 0) : WS.waveOf(Game, mid), via }); }
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
  if (arm === 'armed') process.env.HIDEACQ = '1'; else delete process.env.HIDEACQ;
  console.log(`SWEEP ARM=${arm} (HIDEACQ=${process.env.HIDEACQ || 'unset'}) seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${daysNow()}`);
  let bad = 0;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      try {
        const out = await runOne(seed, policyId, { arm });
        console.log(`  ok ${arm}/${policyId}/s${seed} days=${out.gameDays} end=${out.endReason} wave=${out.maxWave} ierr=${out.instrumentErrors} tooHeavy=${out.tooHeavy} hideCrafts=${out.ap.hideCrafts}/${out.ap.hideAttempts} dawnButch=${out.ap.dawnButchers} sweeps=${out.ap.sweeps} knives=${out.ap.knives} traps=${out.ap.traps}`);
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

module.exports = { runOne, policyFor, armorCensus, prodCensus, daysNow, HA_ARM, ARMS };

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
