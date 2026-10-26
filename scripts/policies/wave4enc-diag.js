// wave4enc-diag — wave-4 field-fight spawn-link recorder for
// sim-wave4enc-a (2026-10-26, flesh-out loop, axis scale-onramp).
//
// QUESTION (from sim-wave5gate-a): wave-4 monsters are faced on 6/8
// seeds of band 73671-73678 but killed on 0/8. Decompose every wave-4
// encounter: spawn -> fight -> flee/lose/kill, field vs player tb.
//
// This recorder is deliberately SMALL: it wraps fieldFight ONLY, and
// reads the spawn sequence off the entity at fight entry. The birth
// side is spawnsrc-diag (SPAWNSRC=1), which tags every fresh world
// monster with _spawnSeq/_spawnsrc at spawnWorldMonster time; the
// field side here reads that tag back, so a field fight links to its
// birth without this recorder ever touching spawnWorldMonster (no
// double-wrap, no second sequence). The tb side is
// nonworldkill-diag (tb starts carry tileMonster.seq; tb ends join
// by fightId). Fieldfinish-diag wraps the same fieldFight for its
// own rows; the two wraps compose (each delegates, each records
// after delegating) and the analyzer cross-checks their wave-4 row
// counts — a wrap miss on either side shows up as a count split.
//
// OBSERVATIONAL ONLY. WAVE4ENC=1 is the only on-switch. Unset
// delegates byte-identically: no wrap installed, no ctx surface, no
// record. The wrap records AFTER delegating: start hp/max/seq/src
// are captured from the entity argument BEFORE delegating (the
// engine mutates m.hp during the fight); end hp/rounds/outcome come
// from the RETURNED record, never post-call engine state. It writes
// nothing to game state, draws no RNG, never throws into the engine
// (recording errors are counted), and returns the original's value
// untouched.
//
// KNOWN LIMITS (stated, not hidden):
// - seq null rows: an entity spawned before spawnsrc installed (e.g.
//   during setupGame) carries no _spawnSeq; its field rows still get
//   a full outcome class, counted as field-unlinked, never hidden.
// - Ephemeral fights (m == null) have no start hp and no seq:
//   startHp null, startFrac null, seq null, never counted as a
//   below-line arrival.
// - Linkage is by spawn sequence for field fights; tb linkage by
//   tileMonster.seq for tb starts. A tb fight whose monster was not
//   on the player tile at startCombat (arena, trap, feast-draw doors)
//   has tileMonster null and cannot be seq-linked to a spawn — it is
//   still classified as a tb event, and its type is reported.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.WAVE4ENC === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    fieldFights: [],
    errs: 0, errors: [], overflow: { fieldFights: 0 },
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

function installWave4encDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._wave4encDiagStore === store && Game._wave4encDiagInstalled) return Game._wave4encDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        let startHp = null, startMax = null, seq = null, src = null;
        try {
          if (m && m.hp != null) startHp = roundHp(m.hp);
          if (m && m.maxHp != null) startMax = roundHp(m.maxHp);
          if (startMax == null && mdef && mdef.hp && mdef.hp.length === 2) startMax = roundHp(mdef.hp[1]);
          if (m && m._spawnSeq != null) seq = m._spawnSeq | 0;
          if (m && m._spawnsrc != null) src = String(m._spawnsrc);
        } catch (e) { noteErr(store, 'fieldFight.start', e); }
        const rec = orig.apply(this, arguments);
        try {
          const md = mdef || {};
          const endHp = rec ? roundHp(rec.mHpLeft) : null;
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: md.id || null, wave: (md.wave | 0) || 1,
            seq: seq, src: src,
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
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._wave4encDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._wave4encDiagStore = store;
    Game._wave4encDiagInstalled = true;
    Game._wave4encDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withWave4encDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installWave4encDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._wave4enc = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installWave4encDiag, withWave4encDiag, MAX_EVENTS };
