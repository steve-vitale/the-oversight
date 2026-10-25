// deathcensus-diag — the villager death-context census recorder
// (sim-deathcensus-a, 2026-10-25, flesh-out loop, axis scale-onramp,
// DIAG ONLY: zero src/js changes, policy-side recorder only).
//
// THE QUESTION (from sim-scale-onramp-round-0535, 2026-10-25): three
// finish remedies were killed because villages could not afford them
// (breakexcept: deaths 261 -> 390, median 116d), but the death SOURCE
// was never measured — the arm evidences were branch-only and deleted.
// This recorder measures, on current code, WHERE villagers actually die
// on the tableseat-nowait band, so the next finish lever's
// survivability companion can be aimed at a measured target instead
// of a guessed one.
//
// MECHANISM, READ FROM CODE (not invented):
//   - Villager deaths are recorded by the harness from Game.tele('death')
//     (scripts/sim-harness.js live capture; corpses.js registerDeath
//     fires the tele with who = villagerId, cause, and a player flag).
//     The harness death list is the census POPULATION: every villager
//     (non-scholar) death entry is counted exactly once, whatever the
//     fight rows say. Fight rows are attribution EVIDENCE, never the
//     population — a fight row without a matching death entry is a
//     discrepancy to report, never a death to add.
//   - Field fights route through Game.resolveWildMonsterEncounter
//     (game.js): it calls fieldFight OR aidFight and returns the record,
//     and it — NOT fieldFight — carries the raid flag. havenRaidTick
//     (havenGrowth.js) calls resolveWildMonsterEncounter(d, m,
//     {raid: true}); the wild path (villagerMonsterTick) calls it with
//     no opts. resolveWildMonsterEncounter does NOT forward opts.raid
//     to fieldFight, so a fieldFight-only wrap CANNOT see the raid
//     flag — the raid context lives only at the resolve level. Hence
//     this recorder wraps BOTH levels: resolve rows carry the context
//     (raid vs field), direct fieldFight rows carry only fights NOT
//     routed through resolve (arena opts.noFlee, patrols, expeditions,
//     contests), deduped by a reentrancy flag so a routed fight is
//     never counted twice.
//   - Arena = fieldFight with opts.noFlee (fieldFights.js header: the
//     seal that makes a contest arena run to vKill/vDie/mFlee).
//   - tb fights end through Game.tbEnd (fieldfinish-diag shipped the
//     pre-capture pattern: tbEnd nulls tbfight, so the fight object
//     must be captured BEFORE delegating). TB-END CAPTURE CAVEAT: the
//     capture happens at tbEnd, i.e. AFTER the whole fight — so a
//     fighter's hp/alive at capture IS the end state, not the start
//     state. A tb villager death is therefore a fighter who ENDS dead
//     (alive false, or hp <= 0) in that fight. The attribution step
//     still requires a harness death entry for the same vid+day, which
//     is what guards against an already-dead fighter being counted:
//     a fighter dead before the fight would carry an EARLIER death day.
//     (First version of this recorder required startAlive && !endAlive
//     and therefore could never fire — the death had already happened
//     by tbEnd. Fixed 2026-10-25 after the day-169 audit tb death
//     proved the miss.)
//   - Wave: world-monster entities NEVER carry .wave (havenGrowth.js
//     crisisWaveOf comment) — the wave lives in the data def, looked
//     up by id. crisisWaveOf(m) is used whenever the entity carries an
//     id; when the fight has no world entity (contest arena beasts,
//     m == null), the wave falls back to the data-def lookup by
//     mdef.id, flagged as waveSource 'def' (never silently 1).
//   - Break line (fieldFights.js / 0535 arms): 0.15 for wave >= 2,
//     0.25 for wave 1. A monster "ends below the line with wounds
//     persisting" when its end fraction is below the line and the
//     outcome is not vKill (the entity stays in the world with
//     m.hp = rec.mHpLeft, per fieldfinish-diag's mechanism note).
//   - Villager HP at fight start is read BEFORE delegating from
//     state.village.health[vid] — exactly the value fieldFight reads
//     (fieldFights.js: vHp from vv.health[vid], vHpMax = max(100, vHp)).
//     Monster HP at fight start is read from the entity BEFORE
//     delegating (the engine mutates m.hp during the fight).
//
// TRANSCRIPT TAP (env-gated, default OFF): when
// DEATHCENSUS_TRANSCRIPT=1, the resolve/direct wraps also record the
// engine's own awayNews death line for that fight — read-only (the
// awayNews length before vs after delegating proves the line belongs
// to this fight; a full queue drops the line and nothing is recorded).
// This exists because narration-mode replays (loadGame narration:true
// + postunlock-instrument) DIVERGE from census trajectories (4/4 seeds
// in this run: different days/outcomes, zero villager deaths), so a
// narration replay cannot quote a census death. The tap quotes the
// death on the exact census trajectory instead. It writes nothing to
// game state, draws no RNG, and is OFF in every census run.
//
// OBSERVATIONAL ONLY. DEATHCENSUS=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface, no
// daily record. The wraps record AFTER delegating (resolve, fieldFight)
// or capture pre-state BEFORE delegating (tbEnd, start HPs), write
// nothing to game state, draw no RNG, never throw into the engine
// (recording errors are counted), and return the original's value
// untouched.
//
// CLASSIFICATION (analyzeDeathcensus, one context per harness death):
//   - raid: a resolve row with opts.raid, outcome vDie, same vid+day.
//   - field: a resolve row without opts.raid, outcome vDie, same vid+day,
//     OR a direct fieldFight row (not routed, not arena), outcome vDie.
//   - arena: a direct fieldFight row with opts.noFlee, outcome vDie.
//   - tb: a tb row whose fighter for that vid ends dead, same vid+day.
//   - other: no vDie/tb-death evidence for that vid+day. Subdivided by
//     the harness cause: other-starvation (cause matches /starv|hunger/i)
//     vs other-<cause>. 'Other' is a classification WITH a stated cause,
//     never a guess at a fight.
//   - unknown: no evidence AND no usable cause (who missing, or cause
//     missing/'?'), OR evidence rows for one death spanning more than
//     one context (ambiguous — counted unknown, listed explicitly).
//   A death is never assigned a fight context from cause alone, and a
//   fight row is never promoted to a death without a harness entry.
//
// KNOWN LIMITS (stated, not hidden):
//   - Same-vid+same-day matching: a villager who fights twice in one day
//     and dies in the second is matched to the vDie row; a villager who
//     dies of starvation on a day they also fought (but survived the
//     fight) matches nothing, because only vDie/tb-dead rows are
//     evidence — a survived fight cannot claim a death.
//   - Ally falls inside a field fight are NOT visible here: the returned
//     record carries allyVid/calledHelp but no ally end state, so an ally
//     who falls mid-fight leaves no row-level trace. An ally counts as a
//     death ONLY if a harness death entry for that ally exists that day
//     (and it then attributes via its own vDie/tb evidence, if any).
//   - Repeat linkage by monster type is NOT used here: deaths are
//     matched by vid+day, not by monster identity.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { return process.env.DEATHCENSUS === '1'; }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }
function breakLineOf(wave) { return (wave | 0) >= 2 ? 0.15 : 0.25; }

function newStore() {
  return {
    resolveFights: [], directFights: [], tbFights: [],
    errs: 0, errors: [], overflow: { resolveFights: 0, directFights: 0, tbFights: 0 },
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

// waveOf(Game, m, mdef): crisisWaveOf when the entity carries an id,
// else the data-def lookup by mdef.id. Returns {wave, source}.
// crisisWaveOf defaults unknown ids to 1, so it is never called with
// a null/anonymous entity — that path would silently report wave 1
// for a contest beast that may be wave 2+.
function waveOf(Game, m, mdef) {
  try {
    if (m && m.id && typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m) | 0;
      if (w) return { wave: w, source: 'crisisWaveOf' };
    }
  } catch (e) { /* fall through to def lookup */ }
  try {
    const id = (mdef && mdef.id) || (m && m.id) || null;
    if (id) {
      const defs = (Game.data && Game.data.monsters) || [];
      const def = defs.find(d => d && d.id === id);
      if (def && (def.wave | 0)) return { wave: def.wave | 0, source: 'def' };
      if (mdef && (mdef.wave | 0)) return { wave: mdef.wave | 0, source: 'mdef.wave' };
    }
  } catch (e) { /* fall through */ }
  return { wave: 1, source: 'default' };
}

// villagerHpStart(Game, vid): {hp, max} exactly as fieldFight reads them.
function villagerHpStart(Game, vid) {
  try {
    const vv = (Game.state || {}).village || {};
    const hp = (vv.health && vv.health[vid] !== undefined) ? vv.health[vid] : 100;
    return { hp: roundHp(hp), max: Math.max(100, roundHp(hp)) };
  } catch (e) { return { hp: null, max: null }; }
}

// awayNewsTap(Game, lenBefore): the awayNews line this fight just pushed,
// or null when the queue was full (tell() drops) or unchanged. Read-only.
function awayNewsTap(Game, lenBefore) {
  try {
    if (process.env.DEATHCENSUS_TRANSCRIPT !== '1') return null;
    const aw = ((Game.state || {}).scholar || {}).awayNews;
    if (!aw || aw.length <= lenBefore) return null;
    return String(aw[aw.length - 1]).slice(0, 300);
  } catch (e) { return null; }
}
function awayNewsLen(Game) {
  try { const aw = ((Game.state || {}).scholar || {}).awayNews; return aw ? aw.length : 0; } catch (e) { return 0; }
}

// villagerDeadAfter(Game, vid): dead flag or health <= 0 after the fight.
function villagerDeadAfter(Game, vid) {
  try {
    const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
    if (p && p.dead) return true;
    const vv = (Game.state || {}).village || {};
    if (vv.health && vv.health[vid] !== undefined && vv.health[vid] <= 0) return true;
  } catch (e) { /* read best-effort */ }
  return false;
}

// installDeathcensusDiag(Game, store): LAYER-2-style call observation.
// Idempotent per (Game, store) pair. Returns an uninstall function.
function installDeathcensusDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._deathcensusDiagStore === store && Game._deathcensusDiagInstalled) return Game._deathcensusDiagUninstall || function () {};
  const uninstalls = [];
  // Reentrancy flag: while a resolve call is in flight, the inner
  // fieldFight/aidFight call is the SAME fight — the direct wrap skips
  // it and the resolve row carries the context.
  let inResolve = 0;

  // resolveWildMonsterEncounter wrap: raid flag + start HPs BEFORE
  // delegating, outcome/rounds/damage from the RETURNED record AFTER.
  try {
    if (typeof Game.resolveWildMonsterEncounter === 'function') {
      const orig = Game.resolveWildMonsterEncounter;
      Game.resolveWildMonsterEncounter = function (vid, m, opts) {
        const raid = !!(opts && opts.raid);
        const awLen0 = awayNewsLen(Game);
        let startM = null, startV = null, wv = null;
        try {
          if (m && m.hp != null) startM = { hp: roundHp(m.hp), max: roundHp(m.maxHp) };
          startV = villagerHpStart(Game, vid);
          wv = waveOf(Game, m, null);
        } catch (e) { noteErr(store, 'resolve.start', e); }
        inResolve++;
        let rec = null;
        try { rec = orig.apply(this, arguments); } finally { inResolve--; }
        try {
          const wave = wv ? wv.wave : 1;
          const bl = breakLineOf(wave);
          const endHp = rec ? roundHp(rec.mHpLeft) : null;
          const endMax = (startM && startM.max) || null;
          const endFrac = (endHp != null && endMax) ? (endHp / endMax) : null;
          const startFrac = (startM && startM.hp != null && startM.max) ? (startM.hp / startM.max) : null;
          pushCapped(store, 'resolveFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: (m && m.id) || null, wave: wave, waveSource: wv ? wv.source : 'default',
            raid: raid, context: raid ? 'raid' : 'field',
            vHpStart: startV ? startV.hp : null, vHpMax: startV ? startV.max : null,
            vHpStartFrac: (startV && startV.hp != null && startV.max) ? (startV.hp / startV.max) : null,
            mHpStart: startM ? startM.hp : null, mHpMax: startM ? startM.max : null,
            mHpStartFrac: startFrac,
            outcome: rec ? (rec.outcome || null) : null,
            rounds: rec ? (rec.rounds | 0) : null,
            vHpLeft: rec ? roundHp(rec.vHpLeft) : null,
            mHpLeft: endHp, mHpEndFrac: endFrac,
            mDealt: rec ? (rec.mDealt | 0) : null,
            vTaken: rec ? (rec.vTaken | 0) : null,
            volleyDmg: (rec && rec.volley) ? (rec.volley.dmg | 0) : null,
            allyVid: rec ? (rec.allyVid || null) : null,
            calledHelp: rec ? !!rec.calledHelp : false,
            intent: rec ? (rec.intent || null) : null,
            diedInFight: (rec && rec.outcome === 'vDie') ? villagerDeadAfter(Game, vid) : false,
            belowLineEnd: (endFrac != null && endFrac < bl),
            breakLine: bl,
            awayNewsLast: awayNewsTap(Game, awLen0),
          });
        } catch (e) { noteErr(store, 'resolve.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.resolveWildMonsterEncounter = orig; } catch (e) {} });
    } else { noteErr(store, 'resolve.missing', new Error('no resolveWildMonsterEncounter')); }
  } catch (e) { noteErr(store, 'resolve.wrap', e); }

  // fieldFight wrap: SKIPS fights routed through resolve (same fight,
  // counted once at the resolve level). Direct fights only.
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        if (inResolve > 0) return orig.apply(this, arguments);
        const arena = !!(opts && opts.noFlee);
        const awLen0 = awayNewsLen(Game);
        let startM = null, startV = null, wv = null;
        try {
          if (m && m.hp != null) startM = { hp: roundHp(m.hp), max: roundHp(m.maxHp) };
          if (startM && !startM.max && mdef && mdef.hp && mdef.hp.length === 2) startM.max = roundHp(mdef.hp[1]);
          startV = villagerHpStart(Game, vid);
          wv = waveOf(Game, m, mdef);
        } catch (e) { noteErr(store, 'fieldFight.start', e); }
        const rec = orig.apply(this, arguments);
        try {
          const wave = wv ? wv.wave : 1;
          const bl = breakLineOf(wave);
          const endHp = rec ? roundHp(rec.mHpLeft) : null;
          const endMax = (startM && startM.max) || null;
          const endFrac = (endHp != null && endMax) ? (endHp / endMax) : null;
          const startFrac = (startM && startM.hp != null && startM.max) ? (startM.hp / startM.max) : null;
          pushCapped(store, 'directFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: (mdef && mdef.id) || (m && m.id) || null, wave: wave, waveSource: wv ? wv.source : 'default',
            arena: arena, context: arena ? 'arena' : 'field',
            hasRng: !!(opts && opts.rng), hasAllies: !!(opts && opts.allies),
            vHpStart: startV ? startV.hp : null, vHpMax: startV ? startV.max : null,
            vHpStartFrac: (startV && startV.hp != null && startV.max) ? (startV.hp / startV.max) : null,
            mHpStart: startM ? startM.hp : null, mHpMax: startM ? startM.max : null,
            mHpStartFrac: startFrac,
            outcome: rec ? (rec.outcome || null) : null,
            rounds: rec ? (rec.rounds | 0) : null,
            vHpLeft: rec ? roundHp(rec.vHpLeft) : null,
            mHpLeft: endHp, mHpEndFrac: endFrac,
            mDealt: rec ? (rec.mDealt | 0) : null,
            vTaken: rec ? (rec.vTaken | 0) : null,
            volleyDmg: (rec && rec.volley) ? (rec.volley.dmg | 0) : null,
            allyVid: rec ? (rec.allyVid || null) : null,
            calledHelp: rec ? !!rec.calledHelp : false,
            intent: rec ? (rec.intent || null) : null,
            diedInFight: (rec && rec.outcome === 'vDie') ? villagerDeadAfter(Game, vid) : false,
            belowLineEnd: (endFrac != null && endFrac < bl),
            breakLine: bl,
            awayNewsLast: awayNewsTap(Game, awLen0),
          });
        } catch (e) { noteErr(store, 'fieldFight.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
    } else { noteErr(store, 'fieldFight.missing', new Error('no fieldFight')); }
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }

  // tbEnd wrap: capture the fight OBJECT before delegating (tbEnd ends
  // with `this.tbfight = null`), per-fighter end states after.
  try {
    if (typeof Game.tbEnd === 'function') {
      const orig = Game.tbEnd;
      Game.tbEnd = function (result) {
        let pre = null;
        try {
          const f = Game.tbfight;
          if (f && !f.over) {
            const fighters = [];
            const monsterIds = [];
            let scholarIn = false;
            for (const fighter of (f.fighters || [])) {
              if (!fighter) continue;
              if (fighter.kind === 'monster' && fighter.monsterId) monsterIds.push(String(fighter.monsterId));
              if (fighter.kind === 'player') scholarIn = true;
              if (fighter.kind === 'villager' && fighter.villagerId) {
                // NOTE: captured at tbEnd — these are END-of-fight values.
                fighters.push({ fighter: fighter, villagerId: String(fighter.villagerId) });
              }
            }
            pre = { fight: f, fighters: fighters, monsterIds: monsterIds, scholarIn: scholarIn,
              arena: !!(f.coalitionArena || f.arena) };
          }
        } catch (e) { noteErr(store, 'tbEnd.pre', e); pre = null; }
        const r = orig.apply(this, arguments);
        try {
          if (pre && pre.fight.over) {
            const fightersOut = pre.fighters.map(pf => {
              const ftr = pf.fighter;
              const endHp = (ftr && ftr.hp != null) ? roundHp(ftr.hp) : null;
              const endAlive = !!(ftr && ftr.alive);
              // End state at tbEnd IS the death evidence (see header):
              // a fighter ending dead, matched to a same-day death entry
              // by the attribution step, died in this fight.
              return { villagerId: pf.villagerId,
                hpAtEnd: endHp, maxHpAtEnd: (ftr && ftr.maxHp != null) ? roundHp(ftr.maxHp) : null,
                aliveAtEnd: endAlive,
                diedInFight: (!endAlive || (endHp != null && endHp <= 0)) };
            });
            pushCapped(store, 'tbFights', {
              day: dayOf(Game), result: result || null,
              settledResult: pre.fight.result || null,
              monsterIds: pre.monsterIds, scholarIn: pre.scholarIn, arena: pre.arena,
              fighters: fightersOut,
            });
          }
        } catch (e) { noteErr(store, 'tbEnd.rec', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.tbEnd = orig; } catch (e) {} });
    } else { noteErr(store, 'tbEnd.missing', new Error('no tbEnd')); }
  } catch (e) { noteErr(store, 'tbEnd.wrap', e); }

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._deathcensusDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._deathcensusDiagStore = store;
    Game._deathcensusDiagInstalled = true;
    Game._deathcensusDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function ensureDC(ctx, store) {
  let D = ctx._deathcensusdiag;
  if (!D) D = ctx._deathcensusdiag = { store: store };
  return D;
}

function withDeathcensusDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installDeathcensusDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ensureDC(ctx, st); } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

const STARV_RE = /starv|hunger/i;

// analyzeDeathcensus(store, deaths, scholarId): the census itself.
// deaths: harness live-death entries {day, kind, who, cause, player}.
// scholarId: Game.villagerId (excluded: the scholar is not a villager).
// POPULATION RULE (corrected 2026-10-25): the harness death list mixes
// THREE populations, because registerDeath fires one tele for every
// death (corpses.js: kind covers person/monster/animal). A death entry
// is a VILLAGER death ONLY if kind is 'person' or 'villager' AND the
// player flag is false AND who is not the scholar. Monster-kind entries
// (a villager's kill, who = monsterId, cause 'villager combat') and
// animal-kind entries are counted separately and NEVER enter the
// villager census. The first version of this recorder filtered only on
// the player flag and therefore counted 192 monster deaths as villager
// deaths (219 "villager deaths", 205 "other") — a taxonomy error of
// exactly the class MEASUREMENT.md §14 warns about. The corrected band
// population is 27 villager deaths. Returns {population, byContext,
// byCause, threeWay, attributed, other, unknown, discrepancies,
// fieldW3, raidMFleeBelowLine, ...}.
function analyzeDeathcensus(store, deaths, scholarId) {
  const s = store || { resolveFights: [], directFights: [], tbFights: [] };
  const allDeaths = (deaths || []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) { player = false; }
    return { day: d.day | 0, kind: d.kind || null, who: (d.who != null) ? String(d.who) : null,
      cause: (d.cause != null) ? String(d.cause) : null, player: player };
  });
  const isPersonKind = (d) => d.kind === 'person' || d.kind === 'villager';
  const villagerDeaths = allDeaths.filter(d => !d.player && isPersonKind(d) && d.who !== scholarId && d.who !== 'player');
  const scholarDeaths = allDeaths.filter(d => d.player || d.who === scholarId || d.who === 'player');
  const monsterDeaths = allDeaths.filter(d => d.kind === 'monster' || d.kind === 'animal');
  const unknownKindDeaths = allDeaths.filter(d => !d.player && !isPersonKind(d) && d.kind !== 'monster' && d.kind !== 'animal' && d.who !== scholarId && d.who !== 'player');

  // Death evidence: fight rows that THEMSELVES killed a villager.
  const evidence = []; // {vid, day, context, row}
  const pushEv = (vid, day, context, row) => { evidence.push({ vid: String(vid), day: day | 0, context: context, row: row }); };
  for (const f of (s.resolveFights || [])) {
    if (f.outcome === 'vDie' && f.vid) pushEv(f.vid, f.day, f.context, f);
  }
  for (const f of (s.directFights || [])) {
    if (f.outcome === 'vDie' && f.vid) pushEv(f.vid, f.day, f.context, f);
  }
  for (const t of (s.tbFights || [])) {
    for (const pf of (t.fighters || [])) {
      if (pf.diedInFight) pushEv(pf.villagerId, t.day, 'tb', t);
    }
  }
  // Evidence rows WITHOUT a matching harness death (discrepancy class):
  // the fight says someone died, but no death was recorded that day.
  const deathKeys = new Set(villagerDeaths.map(d => d.who + '|' + d.day));
  const orphanEvidence = evidence.filter(ev => !deathKeys.has(ev.vid + '|' + ev.day));

  const byContext = { raid: 0, field: 0, arena: 0, tb: 0, other: 0, unknown: 0 };
  const attributed = [], other = [], unknown = [];
  for (const d of villagerDeaths) {
    const matches = evidence.filter(ev => ev.vid === d.who && ev.day === d.day);
    const contexts = [];
    for (const m of matches) if (contexts.indexOf(m.context) < 0) contexts.push(m.context);
    if (contexts.length === 1) {
      byContext[contexts[0]]++;
      attributed.push({ death: d, context: contexts[0], evidence: matches.map(m => ({
        context: m.context, mid: m.row.mid || (m.row.monsterIds || []).join(','), day: m.row.day,
        outcome: m.row.outcome || m.row.settledResult || null, rounds: m.row.rounds != null ? m.row.rounds : null })) });
    } else if (contexts.length > 1) {
      byContext.unknown++;
      unknown.push({ death: d, reason: 'ambiguous-evidence', contexts: contexts });
    } else if (!d.who || d.who === '?' || !d.cause || d.cause === '?') {
      byContext.unknown++;
      unknown.push({ death: d, reason: 'no-evidence-no-cause' });
    } else {
      byContext.other++;
      const starv = STARV_RE.test(d.cause);
      other.push({ death: d, sub: starv ? 'starvation' : d.cause });
    }
  }
  const byCause = {};
  for (const d of villagerDeaths) byCause[d.cause || '?'] = (byCause[d.cause || '?'] || 0) + 1;
  const starvationDeaths = villagerDeaths.filter(d => d.cause && STARV_RE.test(d.cause)).length;
  const combatDeaths = byContext.raid + byContext.field + byContext.arena + byContext.tb;
  const threeWay = { combat: combatDeaths, starvation: starvationDeaths,
    other: villagerDeaths.length - combatDeaths - starvationDeaths };

  // Band totals over ALL fight rows (not just deaths).
  const fightRows = (s.resolveFights || []).concat(s.directFights || []);
  const byOutcome = {}, byOutcomeW3 = {};
  let fieldW3Fights = 0, fieldW3VKill = 0, fieldW3VDie = 0;
  let raidMFleeBelowLine = 0, fieldMFleeBelowLine = 0, arenaMFleeBelowLine = 0;
  let raidMFlee = 0, raidFights = 0, raidVDie = 0, raidVKill = 0;
  for (const f of fightRows) {
    byOutcome[f.outcome || 'null'] = (byOutcome[f.outcome || 'null'] || 0) + 1;
    if ((f.wave | 0) >= 3) {
      byOutcomeW3[f.outcome || 'null'] = (byOutcomeW3[f.outcome || 'null'] || 0) + 1;
      fieldW3Fights++;
      if (f.outcome === 'vKill') fieldW3VKill++;
      if (f.outcome === 'vDie') fieldW3VDie++;
    }
    if (f.outcome === 'mFlee' && f.belowLineEnd) {
      if (f.context === 'raid') raidMFleeBelowLine++;
      else if (f.context === 'arena') arenaMFleeBelowLine++;
      else fieldMFleeBelowLine++;
    }
    if (f.context === 'raid') {
      raidFights++;
      if (f.outcome === 'mFlee') raidMFlee++;
      if (f.outcome === 'vDie') raidVDie++;
      if (f.outcome === 'vKill') raidVKill++;
    }
  }
  // Per-combat-death detail: the attributed deaths' own fight rows.
  const combatDeathDetail = attributed.map(a => {
    const ev = a.evidence[0];
    const row = (evidence.find(e => e.vid === a.death.who && e.day === a.death.day && e.context === a.context) || {}).row || {};
    return { seedDay: a.death.day, vid: a.death.who, cause: a.death.cause, context: a.context,
      mid: row.mid || null, wave: row.wave != null ? row.wave : null,
      vHpStartFrac: row.vHpStartFrac != null ? row.vHpStartFrac : null,
      mHpStartFrac: row.mHpStartFrac != null ? row.mHpStartFrac : null,
      rounds: row.rounds != null ? row.rounds : null,
      mDealt: row.mDealt, vTaken: row.vTaken, outcome: row.outcome || null,
      mHpEndFrac: row.mHpEndFrac != null ? row.mHpEndFrac : null,
      belowLineEnd: !!row.belowLineEnd };
  });
  const combatDeathsBelowLine = combatDeathDetail.filter(d => d.belowLineEnd).length;
  return {
    population: { allDeaths: allDeaths.length, villagerDeaths: villagerDeaths.length, scholarDeaths: scholarDeaths.length,
      monsterDeaths: monsterDeaths.length, unknownKindDeaths: unknownKindDeaths.length,
      monsterDeathsByCause: monsterDeaths.reduce((m, d) => { m[d.cause || '?'] = (m[d.cause || '?'] || 0) + 1; return m; }, {}) },
    byContext: byContext, byCause: byCause, threeWay: threeWay,
    starvationDeaths: starvationDeaths,
    attributed: attributed, other: other, unknown: unknown,
    evidenceRows: evidence.length, orphanEvidence: orphanEvidence.map(o => ({ vid: o.vid, day: o.day, context: o.context, mid: o.row.mid || null, outcome: o.row.outcome || null })),
    fightTotals: { rows: fightRows.length, resolveRows: (s.resolveFights || []).length, directRows: (s.directFights || []).length, tbRows: (s.tbFights || []).length,
      byOutcome: byOutcome, byOutcomeW3: byOutcomeW3,
      fieldW3: { fights: fieldW3Fights, vKill: fieldW3VKill, vDie: fieldW3VDie },
      raid: { fights: raidFights, mFlee: raidMFlee, vDie: raidVDie, vKill: raidVKill, mFleeBelowLine: raidMFleeBelowLine },
      mFleeBelowLine: { raid: raidMFleeBelowLine, field: fieldMFleeBelowLine, arena: arenaMFleeBelowLine } },
    combatDeathDetail: combatDeathDetail, combatDeathsBelowLine: combatDeathsBelowLine,
  };
}

module.exports = { layerOn, newStore, installDeathcensusDiag, withDeathcensusDiag, analyzeDeathcensus, breakLineOf, MAX_EVENTS };
