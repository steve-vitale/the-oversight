// tbdmg-rebase-diag — turn-based + field-fight damage recorder for the
// sim-w4lethality-rebase census (flesh-out loop, axis scale-onramp,
// 2026-10-27, DIAG ONLY: zero src/js changes, policy-side only).
//
// QUESTION (from sim-scale-onramp-round-2357.md): the channel census
// proved wave-4 conversion is zero across channels, but no recorder
// in its stack records TURN-BASED fight damage at all — oldcore
// tbEnds carry day/result/seq/type/wave/kind only, nonworldkill ends
// carry day/fightId/result/log-delta only, and defwound carries
// field-fight damage only. This recorder closes exactly that gap.
//
// MECHANISM, READ FROM CODE (never invented):
//   - TB fights: Game.tbfight holds {id, fighters, round, over}.
//     Fighters carry key/kind/monsterId/villagerId/hp/maxHp/alive/
//     fled. tbEnd(result) is the single end for TB fights; at the
//     moment a tbEnd wrapper runs BEFORE delegating, tbfight is
//     still the live fight, so its fighters' HP are the fight-end
//     HP. Recording pre-delegation is therefore the end record;
//     post-delegation tbfight is null and carries nothing.
//   - Field fights: resolveWildMonsterEncounter(vid, m, opts)
//     returns {outcome, rounds, vTaken, mDealt, vHpLeft, mHpLeft,
//     ...} (fieldFights.js header). defwound records that return
//     minus vHpLeft; this recorder records the same return WITH
//     vHpLeft, keyed by day/vid/seq/mid for the join. It is a
//     supplement, not a replacement: defwound rows remain the
//     field-fight damage record of reference.
//   - Join keys: TB fights join to nonworldkill starts by fightId
//     (tbfight.id, unique per fight). Field supplements join to
//     defwound rows by (day, vid, seq, mid); seq may be null for
//     untagged monsters, in which case the join falls back to
//     (day, vid, mid) and is flagged fallback.
//
// OBSERVATIONAL ONLY. TBDMG=1 is the only on-switch. Unset it
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters
// for the field supplement (the return record exists only after
// the call) and BEFORE delegating for tbEnd (the live fight
// exists only before the call), write nothing to game state
// (store arrays only, plus the same installed-flag class the
// other recorders use), draw no RNG, never throw into the engine
// (recording errors are counted), and return the original value
// untouched.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.TBDMG === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { tbEnds: [], fieldSupp: [], errs: 0, errors: [], overflow: { tbEnds: 0, fieldSupp: 0 }, installed: false };
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

function snapFighters(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return { fightId: null, round: null, fighters: [] };
    const fighters = (f.fighters || []).map(x => (x ? {
      key: x.key || null, kind: x.kind || null,
      monsterId: x.monsterId || (x.mdef && x.mdef.id) || null,
      villagerId: x.villagerId || null, hp: roundHp(x.hp), maxHp: roundHp(x.maxHp),
      alive: (x.alive === undefined) ? null : !!x.alive,
      fled: (x.fled === undefined) ? null : !!x.fled,
    } : null));
    return { fightId: f.id || null, round: (f.round == null) ? null : (f.round | 0), fighters: fighters };
  } catch (e) { return { fightId: null, round: null, fighters: [], snapError: String((e && e.message) || e).slice(0, 120) }; }
}

function waveOf(Game, m) {
  try {
    if (m && m.wave != null && isFinite(m.wave)) return { wave: m.wave | 0, source: 'field' };
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return { wave: w | 0, source: 'crisisWaveOf' };
    }
  } catch (e) { /* fall through */ }
  return { wave: 1, source: 'default' };
}

function installTbdmgDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._tbdmgDiagStore === store && Game._tbdmgDiagInstalled) return Game._tbdmgDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  // TB end: pre-record only. Post-delegation the fight is gone.
  wrap('tbEnd', (orig) => function (result) {
    let pre = null;
    try { pre = snapFighters(Game); } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      if (pre) pushCapped(store, 'tbEnds', {
        day: dayOf(Game), fightId: pre.fightId, round: pre.round,
        result: (result === undefined || result === null) ? null : String(result),
        fighters: pre.fighters, snapError: pre.snapError || null,
      });
    } catch (e) { noteErr(store, 'tbEnd.rec', e); }
    return r;
  });

  // Field supplement: post-record the engine's own return record.
  wrap('resolveWildMonsterEncounter', (orig) => function (vid, m, opts) {
    let startM = null, wv = null, seq = null;
    try {
      if (m && m.hp != null) startM = { hp: roundHp(m.hp), max: roundHp(m.maxHp) };
      wv = waveOf(Game, m);
      seq = (m && m._spawnSeq != null) ? m._spawnSeq : null;
    } catch (e) { noteErr(store, 'resolve.start', e); }
    const rec = orig.apply(this, arguments);
    try {
      if (rec) pushCapped(store, 'fieldSupp', {
        day: dayOf(Game), vid: vid != null ? String(vid) : null,
        seq: seq, mid: (m && m.id) || null, wave: wv ? wv.wave : 1,
        waveSource: wv ? wv.source : 'default',
        raid: !!(opts && opts.raid), context: (opts && opts.raid) ? 'raid' : 'field',
        mHpStart: startM ? startM.hp : null, mHpMax: startM ? startM.max : null,
        outcome: rec.outcome || null, rounds: rec.rounds | 0,
        mHpLeft: roundHp(rec.mHpLeft), vHpLeft: roundHp(rec.vHpLeft),
        mDealt: rec.mDealt | 0, vTaken: rec.vTaken | 0,
      });
    } catch (e) { noteErr(store, 'resolve.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._tbdmgDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._tbdmgDiagStore = store;
    Game._tbdmgDiagInstalled = true;
    Game._tbdmgDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withTbdmgDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installTbdmgDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._tbdmg = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// Pure damage derivation for one TB fight (analyzer + unit check share
// it — the sweep never computes damage, it only records HP snapshots).
// startFighters / endFighters are fighter arrays as snapped above.
// Returns null when the monster fighter cannot be identified at either
// end (incomplete, never estimated).
function deriveTbDamage(startFighters, endFighters) {
  const pick = (fs) => (fs || []).find(x => x && x.kind === 'monster') || null;
  const s = pick(startFighters), e = pick(endFighters);
  if (!s || !e || s.hp == null || e.hp == null || s.maxHp == null) return null;
  return {
    monsterId: s.monsterId || e.monsterId || null,
    startHp: s.hp, endHp: e.hp, maxHp: s.maxHp,
    damage: s.hp - e.hp,
    pctOfMax: s.maxHp ? (s.hp - e.hp) / s.maxHp : null,
    pctLeft: s.maxHp ? e.hp / s.maxHp : null,
    fighterHpLeft: (() => {
      const p = (endFighters || []).find(x => x && x.kind === 'player');
      return p ? p.hp : null;
    })(),
  };
}

module.exports = { newStore, installTbdmgDiag, withTbdmgDiag, deriveTbDamage, snapFighters };
