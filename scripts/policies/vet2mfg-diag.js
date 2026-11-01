// vet2mfg-diag — the wave-4 funnel daily recorder (sim-vet2mfg-a,
// 2026-11-01, flesh-out loop, axis scale-onramp).
//
// THE QUESTION (vet2-a backlog item 1): where does the wave-4 funnel
// leak — unlocked -> spawned -> encountered -> fought -> killed, plus
// shelter filtering and win-censoring? The sweep-side wrappers in
// scripts/vet2mfg-a-sweep.js record the EVENTS (spawns, router calls,
// fight outcomes, kills); this layer records the DAILY STATE the
// events move through, so the analyzer can join them: which wave-4
// monsters are on the board, how many villagers are sheltered, how
// close the nearest wave-4 monster is to Haven, and what the village
// was told (awayNews wild-fight lines) for sense reads.
//
// PURE-READ instrument (VET2MFG=1; unset delegates to the wrapped
// policy byte-identically): every daily, AFTER delegating inward, it
// snapshots state reads only. It writes NOTHING to game state and
// draws NO RNG. It never calls unlockedWave() or
// villageStandingTotal() mid-run (wavegate-diag's deliberate
// non-call rule — both can write state / fire beats); the unlock day
// comes from the wavegate-diag rows this layer composes upon.
//
// COMPOSE UPON (never edit): tableseat-nowait, wavegate-diag,
// fullseat-diag, vet2-diag — this layer wraps OUTSIDE them.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

function layerOn() { return process.env.VET2MFG === '1'; }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function defWaveOf(Game, id) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    const d = defs.find(m => m && m.id === id);
    if (d && d.wave) return d.wave | 0;
  } catch (e) {}
  return 1;
}

function snapVet2mfg(Game) {
  const row = { day: dayOf(Game), errs: [] };
  const st = Game.state || {};
  const vil = st.village || {};
  try { row.px = (Game.map ? Game.map.px : null); row.py = (Game.map ? Game.map.py : null); } catch (e) { row.px = null; row.py = null; row.errs.push('map'); }
  try { row.havenPx = (vil.px !== undefined ? vil.px : null); row.havenPy = (vil.py !== undefined ? vil.py : null); } catch (e) { row.havenPx = null; row.havenPy = null; row.errs.push('haven'); }
  try {
    const roster = Array.isArray(vil.roster) ? vil.roster : [];
    const sh = vil.sheltered || {};
    row.shelteredList = Object.keys(sh).filter(rid => roster.indexOf(rid) >= 0 && sh[rid]).sort();
    row.shelteredCount = row.shelteredList.length;
    row.rosterCount = roster.length;
  } catch (e) { row.shelteredList = []; row.shelteredCount = 0; row.rosterCount = 0; row.errs.push('sheltered'); }
  try {
    const wmRaw = Array.isArray(st.worldMonsters) ? st.worldMonsters : [];
    row.worldMonsters = wmRaw.map(m => ({
      type: m.id || null,
      wave: (m.wave !== undefined && m.wave !== null) ? (m.wave | 0) : defWaveOf(Game, m.id),
      tx: m.tx, ty: m.ty, hp: m.hp, maxHp: m.maxHp,
    })).sort((a, b) => String(a.type).localeCompare(String(b.type)) || (a.tx - b.tx) || (a.ty - b.ty));
    const w4 = row.worldMonsters.filter(m => m.wave === 4);
    row.w4count = w4.length;
    row.w4types = Array.from(new Set(w4.map(m => m.type))).sort();
    row.nearestW4toHaven = null;
    if (w4.length && row.havenPx != null && row.havenPy != null) {
      let best = Infinity;
      for (const m of w4) {
        const d = Math.abs(m.tx - row.havenPx) + Math.abs(m.ty - row.havenPy);
        if (d < best) best = d;
      }
      row.nearestW4toHaven = best;
    }
  } catch (e) { row.worldMonsters = []; row.w4count = 0; row.w4types = []; row.nearestW4toHaven = null; row.errs.push('worldMonsters'); }
  try {
    const an = ((st.scholar || {}).awayNews) || [];
    row.awayNews = Array.isArray(an) ? an.slice() : [];
  } catch (e) { row.awayNews = []; row.errs.push('awayNews'); }
  return row;
}

function newStore() {
  return { rows: [], errs: 0 };
}

function withVet2mfgDiag(inner, id, desc) {
  const store = newStore();
  const wrapped = Object.assign({}, inner, {
    id, desc, vet2mfgStore: store,
    daily(Game, ctx) {
      const r = inner.daily(Game, ctx);
      if (layerOn()) {
        try {
          const row = snapVet2mfg(Game);
          store.rows.push(row);
          if (row.errs.length) store.errs += row.errs.length;
        } catch (e) { store.errs += 1; }
      }
      return r;
    },
  });
  return wrapped;
}

module.exports = { layerOn, withVet2mfgDiag, snapVet2mfg, newStore, defWaveOf };
