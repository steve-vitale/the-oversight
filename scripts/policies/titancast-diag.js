// scripts/policies/titancast-diag.js — sim-titanexcl-a record-only probe.
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TITANCAST unset or not '1'
// → install is a no-op. When on, it wraps Game.castMonster and
// Game.drawFeastScavenger, records AFTER the original returns, draws no
// RNG, writes nothing to game state (counts live on the store, dumped to
// the sweep's per-seed file). It never throws into the engine: every wrap
// is try-guarded and falls back to the original's return.
'use strict';
function titancastOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TITANCAST) || '0') === '1'; } catch (e) { return false; }
}
function newTitancastStore() {
  return { casts: 0, titanCasts: 0, castById: {}, feastDraws: 0, feastTitan: 0, feastById: {}, errs: 0, errors: [], installed: false };
}
function titanIdsOf(Game) {
  const set = {};
  try {
    const raw = (Game.data && Game.data.titans) || {};
    Object.keys(raw).forEach((k) => {
      if (k.charAt(0) === '_') return;
      set[k] = true;
      if (raw[k] && raw[k].monster) set[raw[k].monster] = true;
    });
  } catch (e) {}
  return set;
}
function installTitancastDiag(Game, store) {
  if (!titancastOn() || !Game || Game.__titancastInstalled) return;
  try {
    const TITANS = titanIdsOf(Game);
    const origCast = Game.castMonster;
    if (typeof origCast === 'function') {
      Game.castMonster = function () {
        const r = origCast.apply(this, arguments);
        try {
          const id = (typeof r === 'string') ? r : (r && (r.id || r.monsterId));
          store.casts++;
          if (id && TITANS[id]) { store.titanCasts++; store.castById[id] = (store.castById[id] || 0) + 1; }
        } catch (e) { store.errs++; if (store.errors.length < 5) store.errors.push(String((e && e.message) || e)); }
        return r;
      };
    }
    const origDraw = Game.drawFeastScavenger;
    if (typeof origDraw === 'function') {
      Game.drawFeastScavenger = function () {
        const r = origDraw.apply(this, arguments);
        try {
          if (r && r.drawn) {
            store.feastDraws++;
            if (r.monsterId && TITANS[r.monsterId]) { store.feastTitan++; store.feastById[r.monsterId] = (store.feastById[r.monsterId] || 0) + 1; }
          }
        } catch (e) { store.errs++; if (store.errors.length < 5) store.errors.push(String((e && e.message) || e)); }
        return r;
      };
    }
    Game.__titancastInstalled = true;
    store.installed = true;
  } catch (e) { store.errs++; if (store.errors.length < 5) store.errors.push(String((e && e.message) || e)); }
}
module.exports = { titancastOn, newTitancastStore, installTitancastDiag };
