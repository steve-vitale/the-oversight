#!/usr/bin/env node
// scripts/winstall-instrument-20261017.js — WINSTALL post-modal stall
// attribution instrument (flesh-out loop, axis scale-onramp, 2026-10-17,
// diagnostic for sim-findings #446).
//
// READ-ONLY ATTACH: every wrap records and delegates; nothing alters game
// behavior, RNG draws, or control flow. Exact restore() at the end.
// Honesty rule: a chooseTableOption call that the engine swallows (returns
// null, no state change) is recorded as a no-op, never as progress.
//
// What it records:
//   - sitEvents: every Game.tableScene() entry (day, seat) — the driver
//     took the seat here.
//   - chooseCalls: every Game.chooseTableOption(id) call — day, option id,
//     T {phase,path,beat} before -> after, pending modal signature after,
//     Game.won after, and whether the call was a no-op (state unchanged).
//   - deferEvents: every Game.winDayFloorDefer() (day).
//   - finalEvents: every Game.tableResolveFinal(id) (day, id).
//   - tableLines: ring buffer of say/sysSay lines mentioning the table
//     (◈ lines), for the sense read — capped, text-truncated.
//   - samples: daily pure-read snapshot — day, scholar day, T
//     phase/path/beat/winDeferred/branch, pending modal sig + option
//     count, pg.tableWaiting/tableDone, Game.over, Game.won,
//     winDayFloorOk().
//   - finish(ctx): end-state snapshot + ctx.tableAnswers (the drain's own
//     answer counter) + stall attribution per run.
//
// Stall taxonomy (measured, not assumed):
//   modal-unanswered: 0 chooseCalls on the whole run AND the modal was
//     pending at end (phase 'paths', tableDone, tableChoices pending) —
//     the offer opened and nothing ever answered it.
//   modal-stalled: chooseCalls>0 but phase never left 'paths' by end — the
//     drain engaged and stuck (signature repeats, downgrade loop, etc.).
//   deferred: winDayFloorDefer fired and the re-offer never completed.
//   won: Game.won.
//   no-table: the table never sat (tableScene never fired).
//   other: anything else (Game.over mid-modal with a cause).
'use strict';

const RING_CAP = 80;
const LINE_MAX = 200;

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Pure-read modal signature: frame + option ids. null when nothing pending.
function modalSig(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const tc = s.tableChoices;
    if (!tc || !tc.options || !tc.options.length) return null;
    return String(tc.frame || '?') + '|' + tc.options.map(o => String((o && o.id) || '?')).join(',');
  } catch (e) { return null; }
}

function pendingCount(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const tc = s.tableChoices;
    return (tc && tc.options) ? tc.options.length : 0;
  } catch (e) { return 0; }
}

function tableSnap(Game) {
  // STRICTLY READ-ONLY: never call Game.tableState()/progState() (both
  // create state when missing). Read the persisted fields directly.
  let T = {};
  try {
    const s0 = (Game.state || {}).scholar || {};
    const pg0 = s0.prog || {};
    T = (pg0 && pg0.table) || {};
  } catch (e) {}
  let pgw = {}, pgd = false;
  try {
    const s0 = (Game.state || {}).scholar || {};
    const pg0 = s0.prog || {};
    pgw = !!pg0.tableWaiting; pgd = !!pg0.tableDone;
  } catch (e) {}
  let floor = null;
  try { floor = (typeof Game.winDayFloorOk === 'function') ? !!Game.winDayFloorOk() : null; } catch (e) {}
  let over = null, won = null;
  try { over = !!Game.over; } catch (e) {}
  try { won = !!Game.won; } catch (e) {}
  return {
    day: gday(Game),
    phase: T.phase || null, path: T.path || null, beat: (T.beat == null ? null : T.beat | 0),
    branch: T.branch || null, winDeferred: !!T.winDeferred, weakened: T.weakened | 0,
    modalSig: modalSig(Game), modalN: pendingCount(Game),
    tableWaiting: pgw, tableDone: pgd,
    over: over, won: won, floorOk: floor,
  };
}

function attachWinstallCapture(Game) {
  const cap = {
    errors: 0,
    sitEvents: [],
    chooseCalls: [],
    deferEvents: [],
    finalEvents: [],
    tableLines: [],
    samples: [],
    wonDay: null,
    tableAnswersEnd: null,
    snapEnd: null,
    stall: null,
  };

  function pushLine(kind, text) {
    try {
      const t = String(text == null ? '' : text);
      if (!/◈|TABLE|table|Table/.test(t)) return;
      cap.tableLines.push({ day: gday(Game), kind: kind, text: t.slice(0, LINE_MAX) });
      if (cap.tableLines.length > RING_CAP) cap.tableLines.splice(0, cap.tableLines.length - RING_CAP);
    } catch (e) { /* never break the game on logging */ }
  }

  // --- tableScene: the sit. Record day + seat basis.
  if (typeof Game.tableScene === 'function') {
    const _ts = Game.tableScene.bind(Game);
    Game.tableScene = function () {
      let r;
      try { r = _ts(); }
      catch (e) { cap.errors++; throw e; }
      try {
        // Seat basis, read-only: tableScene just set T.seat via tableSeat().
        let seat = null;
        try { seat = ((((Game.state || {}).scholar || {}).prog || {}).table || {}).seat || null; } catch (e2) {}
        cap.sitEvents.push(Object.assign({ day: gday(Game), seat: seat }, tableSnap(Game)));
        pushLine('sit', '◈ SIT d' + gday(Game) + ' seat=' + seat);
      } catch (e) { cap.errors++; }
      return r;
    };
    Game.tableScene._winstallOrig = _ts;
  }

  // --- chooseTableOption: THE answering event. Record before -> after.
  if (typeof Game.chooseTableOption === 'function') {
    const _ct = Game.chooseTableOption.bind(Game);
    Game.chooseTableOption = function (id) {
      let before = null, after = null, r, err = null;
      try { before = tableSnap(Game); } catch (e) { cap.errors++; }
      try { r = _ct(id); }
      catch (e) { err = String((e && e.message) || e).slice(0, 120); cap.errors++; }
      try { after = tableSnap(Game); } catch (e) { cap.errors++; }
      try {
        const noOp = !!(before && after &&
          before.phase === after.phase && before.path === after.path &&
          (before.beat | 0) === (after.beat | 0) && before.modalSig === after.modalSig &&
          before.won === after.won);
        cap.chooseCalls.push({
          day: gday(Game), id: String(id == null ? '' : id),
          phaseBefore: before ? before.phase : null, pathBefore: before ? before.path : null,
          beatBefore: before ? before.beat : null,
          phaseAfter: after ? after.phase : null, pathAfter: after ? after.path : null,
          beatAfter: after ? after.beat : null, sigAfter: after ? after.modalSig : null,
          noOp: noOp, err: err, won: !!(after && after.won),
        });
        if (after && after.won && cap.wonDay == null) cap.wonDay = gday(Game);
      } catch (e) { cap.errors++; }
      return r;
    };
    Game.chooseTableOption._winstallOrig = _ct;
  }

  // --- winDayFloorDefer: the deferral gate.
  if (typeof Game.winDayFloorDefer === 'function') {
    const _wd = Game.winDayFloorDefer.bind(Game);
    Game.winDayFloorDefer = function (T) {
      let r;
      try { r = _wd(T); } catch (e) { cap.errors++; throw e; }
      try { cap.deferEvents.push(Object.assign({ day: gday(Game), kind: 'defer' }, tableSnap(Game))); } catch (e) { cap.errors++; }
      return r;
    };
    Game.winDayFloorDefer._winstallOrig = _wd;
  }

  // --- tableResolveFinal: the finals entry (win sites live here).
  if (typeof Game.tableResolveFinal === 'function') {
    const _tr = Game.tableResolveFinal.bind(Game);
    Game.tableResolveFinal = function (id) {
      let r;
      try { r = _tr(id); } catch (e) { cap.errors++; throw e; }
      try {
        cap.finalEvents.push(Object.assign({ day: gday(Game), finalId: String(id == null ? '' : id) }, tableSnap(Game)));
        if (Game.won && cap.wonDay == null) cap.wonDay = gday(Game);
      } catch (e) { cap.errors++; }
      return r;
    };
    Game.tableResolveFinal._winstallOrig = _tr;
  }

  // --- say/sysSay: table-line ring buffer only. Record + delegate.
  if (typeof Game.say === 'function') {
    const _say = Game.say.bind(Game);
    Game.say = function () {
      try { pushLine('say', arguments[0]); } catch (e) { cap.errors++; }
      return _say.apply(Game, arguments);
    };
    Game.say._winstallOrig = _say;
  }
  if (typeof Game.sysSay === 'function') {
    const _ss = Game.sysSay.bind(Game);
    Game.sysSay = function () {
      try { pushLine('sysSay', arguments[0]); } catch (e) { cap.errors++; }
      return _ss.apply(Game, arguments);
    };
    Game.sysSay._winstallOrig = _ss;
  }

  function sample() {
    try { cap.samples.push(tableSnap(Game)); }
    catch (e) { cap.errors++; }
  }

  function finish(ctx) {
    try { cap.snapEnd = tableSnap(Game); } catch (e) { cap.errors++; cap.snapEnd = {}; }
    try {
      cap.tableAnswersEnd = ctx && ctx.tableAnswers != null ? (ctx.tableAnswers | 0) : null;
    } catch (e) { cap.tableAnswersEnd = null; }
    try { cap.stall = classifyStall(cap); } catch (e) { cap.errors++; cap.stall = { stall: 'classify-error' }; }
    return cap;
  }

  function restore() {
    const pairs = [
      ['tableScene'], ['chooseTableOption'], ['winDayFloorDefer'], ['tableResolveFinal'], ['say'], ['sysSay'],
    ];
    for (const [k] of pairs) {
      try {
        const cur = Game[k];
        if (cur && cur._winstallOrig) Game[k] = cur._winstallOrig;
      } catch (e) { cap.errors++; }
    }
  }

  return { capture: cap, sample, finish, restore };
}

module.exports = { attachWinstallCapture, modalSig, tableSnap, gday, classifyStall };

// Stall classification over a recorded run (pure, proof-testable).
// cap-like: { snapEnd, chooseCalls[], sitEvents[], deferEvents[] }.
function classifyStall(cap) {
  const end = (cap && cap.snapEnd) || {};
  const chooseCalls = (cap && cap.chooseCalls) || [];
  const nChoose = chooseCalls.length;
  const sat = ((cap && cap.sitEvents) || []).length > 0;
  const modalPending = !!(end.modalSig && (end.phase === 'paths' || end.phase === 'challenge' || end.phase === 'finals' || end.phase === 'downgrade'));
  const progOps = chooseCalls.filter(c => !c.noOp).length;
  let stall = 'other';
  if (end.won) stall = 'won';
  else if (!sat) stall = 'no-table';
  else if (nChoose === 0 && modalPending) stall = 'modal-unanswered';
  else if (nChoose > 0 && !end.won && (end.phase === 'paths' || end.phase === 'challenge' || end.phase === 'finals' || end.phase === 'downgrade') && progOps === 0) stall = 'modal-stalled-noop';
  else if (nChoose > 0 && !end.won && modalPending) stall = 'modal-stalled';
  else if (((cap && cap.deferEvents) || []).length > 0 && !end.won) stall = 'deferred';
  else if (end.over && !end.won) stall = 'died-mid-modal';
  else if (!modalPending && !end.won && sat) stall = 'modal-closed-no-win';
  return { stall: stall, nChoose: nChoose, progOps: progOps, modalPending: modalPending, sitN: ((cap && cap.sitEvents) || []).length };
}
