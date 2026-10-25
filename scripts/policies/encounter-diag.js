// encounter-diag — the wave-3+ encounter/kill-opportunity recorder
// (sim-encounter-a, 2026-10-24, flesh-out loop, axis scale-onramp,
// the named next blank (1) from sim-vetkill-a: the NEVER-KILLED group's
// encounter/kill opportunity — seeds 73674/73675/73677 never killed a
// wave-3+ monster in 98-180 days, and 73674 never even left wave 2).
//
// THE QUESTION: vetkill proved WHAT the log says (no wave-3+ kill on
// those seeds) but not WHY there is no kill. Three very different
// failures hide behind "0 kills":
//   (a) NEVER-FACED — no wave-3+ monster ever spawned near / met the
//       village at all (a spawn/encounter-opportunity failure);
//   (b) FACED-UNFOUGHT — wave-3+ monsters spawned (world spawns seen)
//       but no blow-by-blow fight ever started (a contact failure:
//       despawned, evaded, wandered off, player absent, refused);
//   (c) FACED-LOST / FACED-FLED — fights started but ended in death or
//       flight with no kill (a combat-outcome failure).
// A daily snapshot alone cannot separate (b) from (c): the deed feed
// (deedState().wavesFaced) records only that a fight STARTED, never its
// outcome, and fieldFight outcomes are returned to callers, never logged
// centrally. So this recorder has two layers, both observational:
//   LAYER 1 (daily pure-read, vetkill discipline): end-of-day copies of
//     the deed feed, the kill log, the wave-2 ledger points, the live
//     world-monster list, the wanderer, and the pending encounter.
//     It NEVER calls unlockedWave() or villageStandingTotal() during a
//     run (both release standing peaks / emit hold beats — side effects);
//     the wave-3 gate is recomputed from pure reads instead: day >= 25
//     AND waveLedgerPoints(2) >= barsPerWave[2] (4), which is exactly
//     the wave-3 rung of unlockedWave() (standing gates only waves 4-5
//     on top of this rung).
//   LAYER 2 (call observation, postunlock-instrument precedent): wraps
//     installed on the per-run Game object that record AFTER delegating:
//     spawnWorldMonster (a spawn happened), fieldFight (a villager fight
//     happened, with its returned outcome), tbEnd (a player fight ended,
//     with its result). The wraps write NOTHING to game state, draw NO
//     RNG, never throw into the engine (recording errors are counted),
//     and return the original's value untouched. G2 neutrality (baseline
//     vs armed identical on every seed) is the proof the layer leaks
//     nothing; if G2 fails, the recorder is NO-GO, not the data.
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). ENCOUNTER=1 is the only on-switch. Unset delegates
// byte-identically: no wraps installed, no daily record, no ctx surface.
//
// KNOWN LIMITS (stated, not hidden):
// - Fight-to-spawn linkage is by monster TYPE, not by entity instance:
//   world-monster entities carry no stable instance id, so a spawned
//   type that was never in the deed feed is "unfought" at type level.
// - Contest-arena tb fights share tbEnd with wild fights; the wrap
//   records a best-effort arena context flag (tbfight.coalitionArena /
//   a suspended contest), not a clean wild/contest split. fieldFight
//   rows record opts.rng presence as a contest-like proxy (the contest
//   engine passes a seeded stream; wild fights do not) — a proxy, never
//   presented as a fact.
// - A fight that starts but never settles before the run ends has no
//   outcome row; the classifier reports it UNCLASSIFIED, never guessed.
// - Player tb 'won' with no kill means the monster was driven off /
//   fled (tbEndCheck ends 'won' when no monster fights on); the label
//   for that seed outcome is FACED-DROVE-OFF — a specific, evidenced
//   label, not one of the four brief labels, and it counts as classified
//   under G4 (only UNCLASSIFIED fails G4).
//
// POLICY-SIDE ONLY — zero src/js changes, no default flips.
'use strict';

const { copyKillLog } = require('./vetkill-diag');

const MAX_EVENTS = 20000;

function layerOn() { return process.env.ENCOUNTER === '1'; }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// newStore(): the recorder's event store. Lives OUTSIDE game state
// (held by the sweep / attached to ctx), never on Game.state.
function newStore() {
  return {
    spawns: [], fieldFights: [], tbFights: [], daily: [],
    errs: 0, errors: [], overflow: { spawns: 0, fieldFights: 0, tbFights: 0 },
    installed: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

// copyWavesFaced(Game): defensive copy of deedState().wavesFaced
// ({monsterId: wave}). A missing feed is an empty map, not an error.
function copyWavesFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// ledgerGate(Game): the wave-3 rung recomputed from pure reads.
// Returns {day, pts1, pts2, bar2, dayFloor, w3gate, errs, error}.
// waveLedgerPoints() reads ledgerState (idempotent init only); it
// scores nothing and announces nothing.
function ledgerGate(Game) {
  const out = { day: dayOf(Game), pts1: null, pts2: null, bar2: null, dayFloor: null, w3gate: false, errs: 0, error: null };
  try {
    out.pts1 = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(1) | 0) : null;
    out.pts2 = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(2) | 0) : null;
  } catch (e) { out.errs++; out.error = 'ledgerPoints: ' + String((e && e.message) || e).slice(0, 100); }
  try {
    const cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null;
    if (cfg) {
      if (cfg.barsPerWave) out.bar2 = (cfg.barsPerWave[2] | 0) || null;
      if (cfg.dayFloor != null) out.dayFloor = cfg.dayFloor | 0;
    }
  } catch (e) { out.errs++; out.error = (out.error ? out.error + '; ' : '') + 'ledgerCfg: ' + String((e && e.message) || e).slice(0, 100); }
  const bar2 = out.bar2 != null ? out.bar2 : 4;
  const floor = out.dayFloor != null ? out.dayFloor : 25;
  out.w3gate = out.day >= floor && (out.pts2 != null ? out.pts2 : 0) >= bar2;
  return out;
}

// copyWorldW3(Game): live world monsters at snapshot time (all waves
// recorded; the classifier filters wave >= 3). World-monster entities
// carry their own wave (spawnWorldMonster resolves it from the def).
function copyWorldMonsters(Game) {
  const out = { monsters: [], errs: 0, error: null };
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : ((Game.state && Game.state.worldMonsters) || []);
    if (!Array.isArray(list)) { out.errs++; out.error = 'worldMonsters-not-array'; return out; }
    for (const m of list) {
      if (!m || typeof m !== 'object') { out.errs++; continue; }
      out.monsters.push({ id: m.id || null, wave: n0(m.wave), tx: m.tx != null ? (m.tx | 0) : null, ty: m.ty != null ? (m.ty | 0) : null, veteran: !!m.veteran, hp: m.hp != null ? Math.round(m.hp) : null });
    }
  } catch (e) { out.errs++; out.error = 'worldMonsters: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// recordDaily(Game, ctx, store): one end-of-day point (LAYER 1).
function recordDaily(Game, ctx, store) {
  const p = { day: dayOf(Game), errs: 0 };
  const faced = copyWavesFaced(Game);
  p.faced = faced.faced; p.errs += faced.errs; if (faced.error) p.error = faced.error;
  const prev = store.daily.length ? store.daily[store.daily.length - 1] : null;
  const prevFaced = (prev && prev.faced) || {};
  p.facedNew = Object.keys(p.faced).filter(mid => !(mid in prevFaced));
  const gate = ledgerGate(Game);
  p.ledger = { pts1: gate.pts1, pts2: gate.pts2, bar2: gate.bar2, dayFloor: gate.dayFloor, w3gate: gate.w3gate };
  p.errs += gate.errs; if (gate.error) p.error = (p.error ? p.error + '; ' : '') + gate.error;
  const log = copyKillLog(Game);
  p.logLen = log.entries.length; p.errs += log.errs; if (log.error) p.error = (p.error ? p.error + '; ' : '') + log.error;
  const world = copyWorldMonsters(Game);
  p.world = world.monsters; p.errs += world.errs; if (world.error) p.error = (p.error ? p.error + '; ' : '') + world.error;
  try {
    const w = Game.wanderer || null;
    p.wanderer = w ? { monsterId: w.monsterId || null, veteran: !!w.veteran } : null;
  } catch (e) { p.wanderer = null; p.errs++; }
  try {
    p.pending = { pendingEncounter: !!Game.pendingEncounter, pendingMonsterId: Game.pendingMonsterId || null };
  } catch (e) { p.pending = null; p.errs++; }
  store.daily.push(p);
  store.errs += p.errs;
  return p;
}

// installEncounterDiag(Game, store): LAYER 2 wraps. Idempotent per
// (Game, store) pair. Returns an uninstall function. The wraps record
// AFTER delegating and never throw into the engine.
function installEncounterDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._encounterDiagStore === store && Game._encounterDiagInstalled) return Game._encounterDiagUninstall || function () {};
  const uninstalls = [];
  // spawnWorldMonster wrap: a world spawn happened.
  try {
    if (typeof Game.spawnWorldMonster === 'function') {
      const orig = Game.spawnWorldMonster;
      Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
        const mon = orig.apply(this, arguments);
        try {
          if (mon) pushCapped(store, 'spawns', { day: dayOf(Game), mid: mon.id || null, wave: n0(mon.wave), tx: mon.tx != null ? (mon.tx | 0) : null, ty: mon.ty != null ? (mon.ty | 0) : null, veteran: !!mon.veteran });
        } catch (e) { noteErr(store, 'spawn.rec', e); }
        return mon;
      };
      uninstalls.push(() => { try { Game.spawnWorldMonster = orig; } catch (e) {} });
    } else { noteErr(store, 'spawn.missing', new Error('no spawnWorldMonster')); }
  } catch (e) { noteErr(store, 'spawn.wrap', e); }
  // fieldFight wrap: a villager fight happened, with its outcome.
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        const rec = orig.apply(this, arguments);
        try {
          const md = mdef || {};
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: md.id || null, wave: (md.wave | 0) || 1,
            outcome: rec ? (rec.outcome || null) : null,
            rounds: rec ? (rec.rounds | 0) : null,
            vHpLeft: rec ? (rec.vHpLeft != null ? Math.round(rec.vHpLeft) : null) : null,
            mHpLeft: rec ? (rec.mHpLeft != null ? Math.round(rec.mHpLeft) : null) : null,
            allyVid: rec ? (rec.allyVid || null) : null,
            calledHelp: rec ? !!rec.calledHelp : false,
            intent: rec ? (rec.intent || null) : null,
            hasRng: !!(opts && opts.rng),
            hasAllies: !!(opts && opts.allies),
          });
        } catch (e) { noteErr(store, 'fieldFight.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
    } else { noteErr(store, 'fieldFight.missing', new Error('no fieldFight')); }
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }
  // tbEnd wrap: a player fight settled, with its result. Fighters are
  // copied BEFORE delegating (tbEnd settles/clears the fight) — and the
  // settled check MUST read the captured fight OBJECT, never
  // Game.tbfight afterwards: tbEnd ends with `this.tbfight = null`, so
  // a post-call Game.tbfight read always misses (this exact bug shipped
  // in the first sweep: tbW3 read 0 while the kill log held 11 tb-via
  // wave-3+ kills — the kill log cross-check caught it).
  try {
    if (typeof Game.tbEnd === 'function') {
      const orig = Game.tbEnd;
      Game.tbEnd = function (result) {
        let pre = null;
        try {
          const f = Game.tbfight;
          if (f && !f.over) {
            const monsterIds = [], villagerIds = [];
            let scholarIn = false;
            for (const fighter of (f.fighters || [])) {
              if (!fighter) continue;
              if (fighter.kind === 'monster' && fighter.monsterId) monsterIds.push(String(fighter.monsterId));
              if (fighter.kind === 'villager' && fighter.villagerId) villagerIds.push(String(fighter.villagerId));
              if (fighter.kind === 'player') scholarIn = true;
            }
            pre = { fight: f, monsterIds, villagerIds, scholarIn, arena: !!(f.coalitionArena || f.arena) };
          }
        } catch (e) { noteErr(store, 'tbEnd.pre', e); pre = null; }
        const r = orig.apply(this, arguments);
        try {
          if (pre && pre.fight.over) {
            pushCapped(store, 'tbFights', { day: dayOf(Game), result: pre.fight.result != null ? String(pre.fight.result) : (result != null ? String(result) : null), monsterIds: pre.monsterIds, villagerIds: pre.villagerIds, scholarIn: pre.scholarIn, arena: pre.arena });
          }
        } catch (e) { noteErr(store, 'tbEnd.rec', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.tbEnd = orig; } catch (e) {} });
    } else { noteErr(store, 'tbEnd.missing', new Error('no tbEnd')); }
  } catch (e) { noteErr(store, 'tbEnd.wrap', e); }
  const uninstall = function () {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._encounterDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._encounterDiagStore = store;
    Game._encounterDiagInstalled = true;
    Game._encounterDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function ensureEncounter(ctx, store) {
  let D = ctx._encounterdiag;
  if (!D) D = ctx._encounterdiag = { store: store };
  return D;
}

function withEncounterDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installEncounterDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ensureEncounter(ctx, st); recordDaily(Game, ctx, st); } catch (e) { noteErr(st, 'daily.rec', e); }
      }
      return r;
    },
  });
}

// classifyEncounters(input): the per-seed verdict from the recorder's
// evidence. input: {spawns, fieldFights, tbFights, faced, killEntries,
// waveOf, daily} where waveOf(mid) resolves a monster id to its wave
// (tb fights record ids only; the def lookup happens here, at
// classification time, from live game data).
// Seed labels (fixed before sweeping):
//   NEVER-FACED: no w3+ spawn, no w3+ fight, no w3+ kill.
//   FACED-UNFOUGHT: w3+ spawn exists, no w3+ fight started.
//   FACED-LOST: a w3+ fight ended tb lost, or field vDie.
//   FACED-FLED: a w3+ fight ended tb fled/routed, or field vFlee
//     (and no LOST fight — LOST outranks FLED).
//   FACED-DROVE-OFF: w3+ fights happened, none lost/fled, at least one
//     ended tb won-no-kill or field mFlee/evade (the monster left).
//   FACED-KILLED: at least one w3+ kill (the vetkill verdict's domain;
//     a killed seed is classified, not "never-killed").
//   UNCLASSIFIED: a w3+ fight is in the deed feed but no fight row and
//     no spawn row explains it (e.g. unresolved at run end), or a fight
//     row carries no outcome — never guessed.
function classifyEncounters(input) {
  const inp = input || {};
  const waveOf = (typeof inp.waveOf === 'function') ? inp.waveOf : function () { return 1; };
  const spawns = (inp.spawns || []).filter(s => s && ((s.wave | 0) >= 3 || ((s.mid && (waveOf(s.mid) | 0) >= 3))));
  const ff = (inp.fieldFights || []).filter(f => f && (f.wave | 0) >= 3);
  const tb = (inp.tbFights || []).filter(t => t && (t.monsterIds || []).some(mid => (waveOf(mid) | 0) >= 3));
  const faced = inp.faced || {};
  const facedW3 = Object.keys(faced).filter(mid => (faced[mid] | 0) >= 3);
  const kills = (inp.killEntries || []).filter(e => e && (e.w | 0) >= 3);
  const byWave = {};
  const addWave = (w, kind) => {
    if (!byWave[w]) byWave[w] = { spawns: 0, fieldFights: 0, tbFights: 0, kills: 0, facedTypes: 0 };
    byWave[w][kind]++;
  };
  for (const s of spawns) addWave((s.wave | 0) || waveOf(s.mid), 'spawns');
  for (const f of ff) addWave(f.wave | 0, 'fieldFights');
  for (const t of tb) {
    const waves = (t.monsterIds || []).map(mid => waveOf(mid) | 0).filter(w => w >= 3);
    const w = waves.length ? waves[0] : 3;
    addWave(w, 'tbFights');
  }
  for (const e of kills) addWave(e.w | 0, 'kills');
  for (const mid of facedW3) { const w = faced[mid] | 0; if (!byWave[w]) byWave[w] = { spawns: 0, fieldFights: 0, tbFights: 0, kills: 0, facedTypes: 0 }; byWave[w].facedTypes++; }
  const firstSpawnDay = {};
  for (const s of spawns) { const w = (s.wave | 0) || waveOf(s.mid); if (firstSpawnDay[w] == null || s.day < firstSpawnDay[w]) firstSpawnDay[w] = s.day; }
  const firstFightDay = {};
  for (const f of ff) { const w = f.wave | 0; if (firstFightDay[w] == null || f.day < firstFightDay[w]) firstFightDay[w] = f.day; }
  for (const t of tb) { const waves = (t.monsterIds || []).map(mid => waveOf(mid) | 0).filter(w => w >= 3); const w = waves.length ? waves[0] : 3; if (firstFightDay[w] == null || t.day < firstFightDay[w]) firstFightDay[w] = t.day; }
  const outcomeCounts = { tbWon: 0, tbWonKill: 0, tbWonNoKill: 0, tbLost: 0, tbFled: 0, tbRouted: 0, tbOther: 0, fieldVKill: 0, fieldVDie: 0, fieldVFlee: 0, fieldMFlee: 0, fieldEvade: 0, fieldOther: 0, fieldNoOutcome: 0 };
  const killDaysByMid = {};
  for (const e of kills) { if (!killDaysByMid[e.mid]) killDaysByMid[e.mid] = []; killDaysByMid[e.mid].push(e.d | 0); }
  for (const t of tb) {
    const mids = (t.monsterIds || []).filter(mid => (waveOf(mid) | 0) >= 3);
    const killed = mids.some(mid => (killDaysByMid[mid] || []).some(d => d >= (t.day | 0)));
    if (t.result === 'won') { outcomeCounts.tbWon++; if (killed) outcomeCounts.tbWonKill++; else outcomeCounts.tbWonNoKill++; }
    else if (t.result === 'lost') outcomeCounts.tbLost++;
    else if (t.result === 'fled') outcomeCounts.tbFled++;
    else if (t.result === 'routed') outcomeCounts.tbRouted++;
    else outcomeCounts.tbOther++;
  }
  for (const f of ff) {
    if (f.outcome === 'vKill') outcomeCounts.fieldVKill++;
    else if (f.outcome === 'vDie') outcomeCounts.fieldVDie++;
    else if (f.outcome === 'vFlee') outcomeCounts.fieldVFlee++;
    else if (f.outcome === 'mFlee') outcomeCounts.fieldMFlee++;
    else if (f.outcome === 'evade') outcomeCounts.fieldEvade++;
    else if (f.outcome == null) outcomeCounts.fieldNoOutcome++;
    else outcomeCounts.fieldOther++;
  }
  // Participant split: tb fights — villager party present vs player-only;
  // field fights are villager fights by construction (vid + allies).
  let tbPlayerOnly = 0, tbWithVillager = 0, tbScholarAbsent = 0;
  for (const t of tb) {
    if (!t.scholarIn) tbScholarAbsent++;
    else if ((t.villagerIds || []).length) tbWithVillager++;
    else tbPlayerOnly++;
  }
  const fieldWithAlly = ff.filter(f => f.allyVid || f.calledHelp).length;
  const spawnedTypes = [];
  { const seen = {}; for (const s of spawns) { if (s.mid && !seen[s.mid]) { seen[s.mid] = true; spawnedTypes.push(s.mid); } } }
  const facedSet = {}; for (const mid of facedW3) facedSet[mid] = true;
  const unfoughtSpawnTypes = spawnedTypes.filter(mid => !facedSet[mid] && !(killDaysByMid[mid] || []).length);
  const foughtTypes = facedW3.slice();
  // Seed label, by the fixed priority above.
  let label, reason;
  const nFights = ff.length + tb.length;
  const hasSpawn = spawns.length > 0;
  const hasFight = nFights > 0 || facedW3.length > 0;
  const hasKill = kills.length > 0;
  const hasUnknownOutcome = outcomeCounts.fieldNoOutcome > 0 || outcomeCounts.tbOther > 0;
  if (hasKill) { label = 'FACED-KILLED'; reason = kills.length + ' wave-3+ kill(s) in the kill log'; }
  else if (!hasSpawn && !hasFight) { label = 'NEVER-FACED'; reason = 'no wave-3+ spawn, no wave-3+ fight, no wave-3+ kill'; }
  else if (hasSpawn && !hasFight) { label = 'FACED-UNFOUGHT'; reason = spawns.length + ' wave-3+ spawn(s), 0 wave-3+ fights started'; }
  else if (outcomeCounts.tbLost > 0 || outcomeCounts.fieldVDie > 0) { label = 'FACED-LOST'; reason = 'wave-3+ fight(s) ended lost/vDie (tbLost=' + outcomeCounts.tbLost + ', fieldVDie=' + outcomeCounts.fieldVDie + ')'; }
  else if (outcomeCounts.tbFled > 0 || outcomeCounts.tbRouted > 0 || outcomeCounts.fieldVFlee > 0) { label = 'FACED-FLED'; reason = 'wave-3+ fight(s) ended fled/routed/vFlee (tbFled=' + outcomeCounts.tbFled + ', tbRouted=' + outcomeCounts.tbRouted + ', fieldVFlee=' + outcomeCounts.fieldVFlee + ')'; }
  else if (outcomeCounts.tbWonNoKill > 0 || outcomeCounts.fieldMFlee > 0 || outcomeCounts.fieldEvade > 0) { label = 'FACED-DROVE-OFF'; reason = 'wave-3+ fight(s) ended with the monster leaving (tbWonNoKill=' + outcomeCounts.tbWonNoKill + ', fieldMFlee=' + outcomeCounts.fieldMFlee + ', fieldEvade=' + outcomeCounts.fieldEvade + ')'; }
  else if (hasFight && nFights === 0) { label = 'UNCLASSIFIED'; reason = 'deed feed shows ' + facedW3.length + ' wave-3+ fought type(s) but no fight row or spawn row explains the outcome'; }
  else if (hasUnknownOutcome) { label = 'UNCLASSIFIED'; reason = 'wave-3+ fight row(s) carry no usable outcome'; }
  else if (hasFight) { label = 'UNCLASSIFIED'; reason = 'wave-3+ fights exist but none matches a labeled outcome'; }
  else { label = 'UNCLASSIFIED'; reason = 'no rule matched'; }
  return {
    label, reason, byWave, firstSpawnDay, firstFightDay, outcomeCounts,
    counts: {
      spawnsW3: spawns.length, fieldFightsW3: ff.length, tbFightsW3: tb.length,
      facedTypesW3: facedW3.length, killsW3: kills.length,
      tbPlayerOnly, tbWithVillager, tbScholarAbsent, fieldWithAlly,
    },
    spawnedTypes, unfoughtSpawnTypes, foughtTypes,
    spawnFirstDayW3: firstSpawnDay[3] != null ? firstSpawnDay[3] : null,
    fightFirstDayW3: firstFightDay[3] != null ? firstFightDay[3] : null,
  };
}

module.exports = { layerOn, newStore, installEncounterDiag, withEncounterDiag, recordDaily, copyWavesFaced, ledgerGate, copyWorldMonsters, classifyEncounters, MAX_EVENTS };
