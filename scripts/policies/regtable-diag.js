// regtable-diag — the regional-table seat recorder
// (sim-regtable-a, 2026-10-31, flesh-out loop, axis scale-onramp).
//
// THE QUESTION (backlog "REGIONAL-TABLE EXCEPTION 87103"): wavegate-a
// found seed 87103 reaching the table at regional rank without national.
// The table has TWO seats (src/js/table.js tableSeat()): FULL requires
// national/global (src/js/progression.js:613 deedGateReady, scale
// enforced in `ok` per the 2026-10-27 ruling), LESSER requires only
// regional+. checkArc() sets tableWaiting for EITHER seat. This layer
// records, per day, which seat the engine actually prices, the full
// gate's components, the rank, and the table flags — so the trace
// settles whether a regional table is a lesser seat (designed), a
// full seat below national (a counterexample), or something else.
//
// PURE-READ instrument (REGTABLE=1; unset delegates to the wrapped
// policy byte-identically): every daily, AFTER delegating inward, it
// snapshots the engine's OWN gate state. It calls tableSeat() and
// deedGateReady() — calls the base stack already makes daily via
// fullseat-diag's snap (inner layer runs first) — writes NOTHING to
// game state and draws NO RNG. Errors are COUNTED (store.errs), never
// swallowed silently.
//
// SAY CAPTURE: installSayCapture wraps Game.sysSay ONLY to record
// lines containing 'table' (case-insensitive), calling through to the
// original with identical arguments. Install AFTER wavegate's capture
// and uninstall BEFORE it, so the nesting restores correctly.
//
// POLICY-SIDE ONLY — zero src/js changes. COMPOSE UPON (never edit):
// tribfloor, windefer, seatdrive, fullseat-diag, wavegate-diag — this
// layer wraps OUTSIDE them.
'use strict';

function layerOn() { return process.env.REGTABLE === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// snapRegtable(Game): one pure-read row. Returns the seat the engine
// prices today, the full gate's breakdown, the rank, and the table
// flags — the four facts the verdict turns on.
function snapRegtable(Game) {
  const row = { day: dayOf(Game), errs: [] };
  try {
    row.rank = (typeof Game.scaleRank === 'function') ? String(Game.scaleRank()) : 'village';
  } catch (e) { row.rank = 'village'; row.errs.push('scaleRank'); }
  try {
    const seat = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    row.seat = (seat && seat.seat) || 'none';
    const d = (seat && seat.detail) || {};
    row.seatDetail = {
      w1: n0(d.w1), w2: n0(d.w2), w3: n0(d.w3), w4: n0(d.w4), w5: n0(d.w5),
      contestsN: n0(d.contestsN), crisesN: n0(d.crisesN),
      rank: String(d.rank || row.rank), stage: n0(d.stage), foodDeeds: !!d.foodDeeds,
    };
  } catch (e) { row.seat = 'none'; row.seatDetail = null; row.errs.push('tableSeat'); }
  try {
    const g = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null;
    if (g) {
      row.fullOk = !!g.ok;
      row.full = {
        waves: !!g.waves, contests: !!g.contests, crises: !!g.crises,
        scale: !!g.scale, stageOk: !!g.stageOk, foodDeeds: !!g.foodDeeds,
        w1: n0(g.w1), w2: n0(g.w2), w3: n0(g.w3), w4: n0(g.w4), w5: n0(g.w5),
        contestsN: n0(g.contestsN), crisesN: n0(g.crisesN),
        stage: n0(g.stage), rank: String(g.rank || row.rank),
      };
    } else { row.fullOk = false; row.full = null; }
  } catch (e) { row.fullOk = false; row.full = null; row.errs.push('deedGateReady'); }
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    row.arc = n0(pg.arc);
    row.tableWaiting = !!pg.tableWaiting;
    row.tableDone = !!pg.tableDone;
    row.tableAnnounced = !!pg.tableAnnounced;
  } catch (e) { row.arc = 0; row.tableWaiting = false; row.tableDone = false; row.tableAnnounced = false; row.errs.push('progState'); }
  try { row.won = !!Game.won; } catch (e) { row.won = false; row.errs.push('won'); }
  try { row.villageLost = !!Game.villageLost; } catch (e) { row.villageLost = false; row.errs.push('villageLost'); }
  try { row.winFloorOk = (typeof Game.winDayFloorOk === 'function') ? !!Game.winDayFloorOk() : false; } catch (e) { row.winFloorOk = false; row.errs.push('winDayFloorOk'); }
  return row;
}

function newStore() {
  return { rows: [], beats: [], errs: 0, installed: false, origSysSay: null };
}

function installSayCapture(Game, store) {
  if (!Game || store.installed) return;
  try {
    const orig = Game.sysSay;
    if (typeof orig !== 'function') return;
    store.origSysSay = orig;
    const wrapped = function () {
      try {
        const line = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
        if (line.toLowerCase().indexOf('table') >= 0) {
          store.beats.push({ day: dayOf(Game), line });
        }
      } catch (e) { store.errs += 1; }
      return orig.apply(this, arguments);
    };
    Game.sysSay = wrapped;
    store.installed = true;
  } catch (e) { store.errs += 1; }
}

function uninstallSayCapture(Game, store) {
  try {
    if (store && store.installed && Game && store.origSysSay) Game.sysSay = store.origSysSay;
  } catch (e) { if (store) store.errs += 1; }
  if (store) store.installed = false;
}

function withRegtableDiag(inner, id, desc) {
  const store = newStore();
  const wrapped = Object.assign({}, inner, {
    id, desc, regtableStore: store,
    daily(Game, ctx) {
      const r = inner.daily(Game, ctx);
      if (layerOn()) {
        try {
          const row = snapRegtable(Game);
          store.rows.push(row);
          if (row.errs.length) store.errs += row.errs.length;
        } catch (e) { store.errs += 1; }
      }
      return r;
    },
  });
  return wrapped;
}

module.exports = {
  layerOn, withRegtableDiag, snapRegtable, newStore,
  installSayCapture, uninstallSayCapture,
};
