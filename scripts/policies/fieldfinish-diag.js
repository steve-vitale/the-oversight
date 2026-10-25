// fieldfinish-diag — the wounded-monster field-finish recorder
// (sim-fieldfinish-a, 2026-10-24, flesh-out loop, axis scale-onramp,
// the named next blank from sim-encounter-a: on the tableseat-nowait
// substrate, villagers NEVER killed a wave-3+ monster in the field
// (prior corpus: 0/87 field fights; all wave-3+ kills player tb kills).
//
// THE HYPOTHESIS (a hypothesis, not a claim): the same wounded entity
// reappears fight after fight at mHpLeft = 1 with rounds = 0 and outcome
// mFlee — a monster below its break threshold flees before the first
// strike every time, so a wounded monster can never be finished in the
// field. This recorder RULES THAT HYPOTHESIS IN OR OUT from its own
// corpus; it never cites the prior corpus as its result.
//
// MECHANISM, READ FROM CODE (src/js/fieldFights.js, not invented):
//   - members[0] IS the world-monster entity: its hp starts at m.hp
//     when an entity is passed, and wounds persist back with
//     `m.hp = rec.mHpLeft` for every non-vKill outcome.
//   - mBreak = 0.15 for wave >= 2 (0.25 wave 1). After the volley
//     section, UNCONDITIONALLY: if members[0].hp/maxHp < mBreak then
//     outcome = 'mFlee' — even when the volley dealt nothing (no ranged
//     kit, or all misses), because the check does not distinguish
//     "the volley just dropped it below the line" from "it ARRIVED
//     below the line". A wounded entity re-entering a fight below the
//     line therefore ends at rounds = 0, outcome mFlee, with no strike
//     thrown. The in-round check (same < mBreak test after each round)
//     is a different path and always has rounds >= 1.
//   - So the discriminating row is: startFrac < 0.15 AND rounds = 0
//     AND outcome = 'mFlee', with the start hp equal to a previous
//     fight's end hp for the same monster TYPE (repeat linkage —
//     entities carry no stable instance id, so linkage is by type,
//     exactly as encounter-diag's spawn linkage).
//   - Counter-cases the recorder must also separate: volley drive-off
//     (startFrac >= 0.15, volley damage drops it below the line,
//     rounds = 0, mFlee — a real ranged finish, not a stuck wound),
//     evade (rounds = 0, outcome evade, mHpLeft = start hp — contact
//     never made), and in-round mFlee (rounds >= 1).
//
// OBSERVATIONAL ONLY. FIELDFINISH=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface, no
// daily record. The wraps record AFTER delegating (fieldFight) or
// capture the fight OBJECT before delegating (tbEnd — tbEnd ends with
// `this.tbfight = null`, so a post-call Game.tbfight read always
// misses; encounter-diag shipped exactly that bug once). mHpLeft and
// rounds come from the RETURNED result object, never from post-call
// engine state. Start hp comes from the entity argument BEFORE
// delegating (the engine mutates m.hp during the fight). The wraps
// write nothing to game state, draw no RNG, never throw into the
// engine (recording errors are counted), and return the original's
// value untouched.
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). POLICY-SIDE ONLY — zero src/js changes, no
// default flips, no combat-code changes (DIAG ONLY).
//
// KNOWN LIMITS (stated, not hidden):
// - Repeat linkage is by monster TYPE, not entity instance: two
//   live entities of one type could interleave, so a start==prior-end
//   match is strong evidence, not an identity proof. The sweep
//   reports immediate-predecessor links separately from any-earlier
//   links so a weak link cannot dress as a strong one.
// - Ephemeral fights (m == null) have no start hp: startHp null,
//   startFrac null, never counted as wounded-entry.
// - Contest-arena field fights share fieldFight with wild fights;
//   hasRng (opts.rng presence) is recorded as a contest-like proxy,
//   never presented as a fact.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { return process.env.FIELDFINISH === '1'; }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    fieldFights: [], tbFights: [],
    errs: 0, errors: [], overflow: { fieldFights: 0, tbFights: 0 },
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

// installFieldfinishDiag(Game, store): LAYER-2-style call observation.
// Idempotent per (Game, store) pair. Returns an uninstall function.
function installFieldfinishDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._fieldfinishDiagStore === store && Game._fieldfinishDiagInstalled) return Game._fieldfinishDiagUninstall || function () {};
  const uninstalls = [];
  // fieldFight wrap: capture start hp BEFORE delegating (the engine
  // mutates m.hp), record outcome/rounds/end hp from the RETURNED
  // record AFTER delegating — never from post-call engine state.
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        let startHp = null, startMax = null;
        try {
          if (m && m.hp != null) startHp = roundHp(m.hp);
          if (m && m.maxHp != null) startMax = roundHp(m.maxHp);
          if (startMax == null && mdef && mdef.hp && mdef.hp.length === 2) startMax = roundHp(mdef.hp[1]);
        } catch (e) { noteErr(store, 'fieldFight.start', e); }
        const rec = orig.apply(this, arguments);
        try {
          const md = mdef || {};
          const endHp = rec ? roundHp(rec.mHpLeft) : null;
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: md.id || null, wave: (md.wave | 0) || 1,
            startHp: startHp, startMax: startMax,
            startFrac: (startHp != null && startMax) ? (startHp / startMax) : null,
            endHp: endHp,
            endFrac: (endHp != null && startMax) ? (endHp / startMax) : null,
            outcome: rec ? (rec.outcome || null) : null,
            rounds: rec ? (rec.rounds | 0) : null,
            vHpLeft: rec ? roundHp(rec.vHpLeft) : null,
            mDealt: rec ? (rec.mDealt | 0) : null,
            vTaken: rec ? (rec.vTaken | 0) : null,
            volleyDmg: (rec && rec.volley) ? (rec.volley.dmg | 0) : null,
            volleyShots: (rec && rec.volley) ? (rec.volley.shots | 0) : null,
            volleyHits: (rec && rec.volley) ? (rec.volley.hits | 0) : null,
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
  // tbEnd wrap: capture the fight OBJECT before delegating (tbEnd ends
  // with `this.tbfight = null`). Cross-check source for player kills:
  // the kill log (via tb) must agree with tbFights, so a field zero
  // cannot hide a wrap miss on the player side either.
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
            pushCapped(store, 'tbFights', {
              day: dayOf(Game), result: result || null,
              settledResult: pre.fight.result || null,
              monsterIds: pre.monsterIds, villagerIds: pre.villagerIds,
              scholarIn: pre.scholarIn, arena: pre.arena,
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
    try { Game._fieldfinishDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._fieldfinishDiagStore = store;
    Game._fieldfinishDiagInstalled = true;
    Game._fieldfinishDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function ensureFF(ctx, store) {
  let D = ctx._fieldfinishdiag;
  if (!D) D = ctx._fieldfinishdiag = { store: store };
  return D;
}

function withFieldfinishDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installFieldfinishDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ensureFF(ctx, st); } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// analyzeFieldFights(fights): repeat linkage + wounded-repeat detection.
// fights: the store's fieldFights rows (any wave; callers filter).
// Returns {perType, woundedRepeats, volleyDriveOffs, evades, ...}.
// A woundedRepeat (strict) = rounds 0, outcome mFlee, startFrac < 0.15,
// and the IMMEDIATELY PRECEDING fight of the same type ended at exactly
// this fight's start hp (the wound persisted across fights). Any-earlier
// links are counted separately and never promoted to strict.
function analyzeFieldFights(fights) {
  const rows = (fights || []).slice();
  const perType = {};
  const woundedRepeats = [], woundedRepeatsAnyEarlier = [];
  const volleyDriveOffs = [], evades = [], inRoundMFlee = [];
  const byOutcome = {}, byOutcomeW3 = {};
  for (let i = 0; i < rows.length; i++) {
    const f = rows[i];
    if (!f) continue;
    byOutcome[f.outcome || 'null'] = (byOutcome[f.outcome || 'null'] || 0) + 1;
    if ((f.wave | 0) >= 3) byOutcomeW3[f.outcome || 'null'] = (byOutcomeW3[f.outcome || 'null'] || 0) + 1;
    if (!perType[f.mid]) perType[f.mid] = { fights: 0, outcomes: {}, woundedRepeats: 0, seq: [] };
    const pt = perType[f.mid];
    pt.fights++;
    pt.outcomes[f.outcome || 'null'] = (pt.outcomes[f.outcome || 'null'] || 0) + 1;
    pt.seq.push(i);
    if (f.outcome === 'evade') evades.push(i);
    if (f.outcome === 'mFlee' && (f.rounds | 0) >= 1) inRoundMFlee.push(i);
    if (f.outcome === 'mFlee' && (f.rounds | 0) === 0) {
      if (f.startFrac != null && f.startFrac < 0.15) {
        // strict: immediate predecessor of same type ended at this start hp
        let prev = null;
        for (let j = i - 1; j >= 0; j--) { if (rows[j] && rows[j].mid === f.mid) { prev = rows[j]; break; } }
        const strict = !!(prev && prev.endHp != null && f.startHp != null && prev.endHp === f.startHp && prev.endHp > 0);
        let anyEarlier = strict;
        if (!strict) {
          for (let j = 0; j < i; j++) {
            if (rows[j] && rows[j].mid === f.mid && rows[j].endHp != null && rows[j].endHp === f.startHp && rows[j].endHp > 0) { anyEarlier = true; break; }
          }
        }
        const rec = { index: i, fight: f, prevEndHp: prev ? prev.endHp : null, prevOutcome: prev ? prev.outcome : null, strict, anyEarlier };
        if (strict) { woundedRepeats.push(rec); pt.woundedRepeats++; }
        else if (anyEarlier) woundedRepeatsAnyEarlier.push(rec);
        else woundedRepeatsAnyEarlier.push(Object.assign({}, rec, { anyEarlier: false, unlinked: true }));
      } else if (f.startFrac != null && f.startFrac >= 0.15) {
        volleyDriveOffs.push({ index: i, fight: f });
      }
    }
  }
  return { perType, woundedRepeats, woundedRepeatsAnyEarlier, volleyDriveOffs, evades, inRoundMFlee, byOutcome, byOutcomeW3 };
}

module.exports = { layerOn, newStore, installFieldfinishDiag, withFieldfinishDiag, analyzeFieldFights, MAX_EVENTS };
