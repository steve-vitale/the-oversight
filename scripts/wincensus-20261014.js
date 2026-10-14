'use strict';
// scripts/wincensus-20261014.js — WIN-FLAG CENSUS instrument (sim-wincensus arm, DIAGNOSTIC, no game-code changes).
//
// The win-flag chain (read from code 2026-10-14, verified against docs/TABLE.md + MONSTER-WAVES.md):
//   G1 Arc IV seat: checkArc -> tableSeat() 'full'|'lesser' -> pg.arc=4, pg.tableWaiting=true
//   G2 tableScene: next dawn, seat 'none' -> WITHDRAWAL (tableWaiting=false); else pg.tableDone=true,
//        T.phase='paths', tableOfferPaths -> scholar.tableChoices modal (7 doors)
//   G3 path walk: chooseTableOption('path:X') -> tableStartPath -> beats (tableChoose) ->
//        fail (tableFail -> downgrade loop or comfort-ending) | finals (tableFinals)
//   G4 final choice: tableResolveFinal -> winDayFloorOk() (scholar.day >= 90):
//        NO -> winDayFloorDefer: T.phase='paths', tableChoices=null, game continues. NOTHING re-opens the
//            modal (tableOfferPaths is only ever called from tableScene; tableScene is blocked by
//            pg.tableDone=true once it has fired). This is the DEFERRAL STALL: after an early resolution
//            the win is unreachable for the rest of the run.
//        YES -> T.phase='done', Game.over=true, Game.won=true — THE WIN FLAG.
//   G5 trial-by-combat (feared path opt-in): tableTrialByCombat pauses the challenge; tbEnd resumes.
//
// Instruments every gate via call-through wraps (scripts-only). Per-day census rows + event log.
// Detects two distinct no-win sinks:
//   (a) PENDING-MODAL: scene fired, prompts offered, policy never answers (harness-policy artifact);
//   (b) DEFERRAL-STALL: pre-day-90 resolution -> phase 'paths' + tableChoices null, win unreachable (game-chain gap).
//
// Usage:
//   const { installWinCensus, censusRow, finalizeWinCensus, wrapWithTableWalk } = require('./wincensus-20261014');
//   const t = installWinCensus(Game);
//   // in the daily loop: censusRow(Game, t);
//   const c = finalizeWinCensus(Game, t, { endReason, days });
// INFO-SKIP discipline: every wrap is guarded; a missing Game method degrades to a recorded
// note, never a throw. The instrument never changes game behavior (pure observation + say capture).

function gday(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}

function seatInfo(Game) {
  try {
    if (typeof Game.tableSeat !== 'function') return { seat: 'no-fn' };
    const s = Game.tableSeat();
    const d = (s && s.detail) || {};
    return { seat: s.seat || 'none', w1: d.w1 | 0, w2: d.w2 | 0, w3: d.w3 | 0, cx: d.contestsN | 0, cr: d.crisesN | 0, rank: d.rank || '?', stage: d.stage | 0, food: !!d.foodDeeds };
  } catch (e) { return { seat: 'err' }; }
}

function deedBars(Game) {
  try {
    if (typeof Game.deedGateReady !== 'function') return null;
    const g = Game.deedGateReady();
    return { gw: [g.w1 | 0, g.w2 | 0, g.w3 | 0, g.w4 | 0, g.w5 | 0], gok: !!g.ok, gcx: g.contestsN | 0, gcr: g.crisesN | 0, grank: g.rank || '?' };
  } catch (e) { return null; }
}

// installWinCensus(Game) -> track { events, lines, notes, rows }
function installWinCensus(Game) {
  const t = { events: [], lines: [], notes: [], rows: [], hookErrs: 0 };
  const ev = (kind, data) => { try { t.events.push(Object.assign({ day: gday(Game), kind }, data || {})); } catch (e) {} };
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { t.notes.push(name + ':missing'); return; }
      const orig = Game[name].bind(Game);
      Game[name] = function () { try { return fn(orig, arguments); } catch (e) { t.hookErrs++; return orig.apply(null, arguments); } };
    } catch (e) { t.notes.push(name + ':wrap-err'); }
  };

  // G2: the scene. Record seat at fire; withdrawal vs one-shot.
  wrap('tableScene', (orig) => {
    const before = seatInfo(Game);
    const r = orig();
    let after = {};
    try { const pg = Game.progState(); after = { waiting: !!pg.tableWaiting, done: !!pg.tableDone }; } catch (e) {}
    ev(after.done && !before.withdrew ? 'scene-fired' : 'scene-call', { seat: before.seat, waitingAfter: after.waiting, doneAfter: after.done });
    if (before.seat === 'none' && !after.waiting) ev('scene-withdrawn', { seat: 'none' });
    return r;
  });
  // G2b: every modal offer (tablePrompt is the single modal driver).
  wrap('tablePrompt', (orig, args) => {
    let n = 0, ids = [], frame = '';
    try { const tc = (args[1] || []); n = tc.length; ids = tc.map(o => o && o.id).filter(Boolean).slice(0, 12); frame = String(args[2] || ''); } catch (e) {}
    ev('prompt-offered', { n, ids, frame: frame.slice(0, 60) });
    return orig.apply(null, args);
  });
  // G3a: path choice answered.
  wrap('chooseTableOption', (orig, args) => {
    const id = String((args[0] == null ? '' : args[0]));
    ev('choice-answered', { id: id.slice(0, 40) });
    const r = orig.apply(null, args);
    try { const T = Game.tableState(); ev('choice-applied', { id: id.slice(0, 40), phase: T.phase || '?', path: T.path || null }); } catch (e) {}
    return r;
  });
  // G3b: path starts.
  wrap('tableStartPath', (orig, args) => {
    ev('path-started', { pathId: String(args[0] || '?') });
    const r = orig.apply(null, args);
    try { const T = Game.tableState(); ev('path-state', { path: T.path || '?', branch: T.branch || T.band || '?', phase: T.phase || '?' }); } catch (e) {}
    return r;
  });
  // G3c: challenge beats.
  wrap('tableChoose', (orig, args) => {
    const id = String((args[0] == null ? '' : args[0]));
    const r = orig.apply(null, args);
    try { const T = Game.tableState(); ev('beat-answered', { id: id.slice(0, 40), beat: T.beat | 0, phase: T.phase || '?' }); } catch (e) {}
    return r;
  });
  // G3d: failure (downgrade loop) and the comfort-ending shortcut.
  wrap('tableFail', (orig, args) => {
    const reason = String(args[0] || '?').slice(0, 120);
    const r = orig.apply(null, args);
    try { const T = Game.tableState(); ev('path-failed', { reason, weakened: T.weakened | 0, phase: T.phase || '?' }); } catch (e) {}
    return r;
  });
  // G3e: trial-by-combat pause (feared path opt-in).
  wrap('tableTrialByCombat', (orig) => {
    ev('trial-started', {});
    const r = orig();
    try { ev('trial-state', { tbfight: !!(Game.tbfight && !Game.tbfight.over) }); } catch (e) {}
    return r;
  });
  // G4a: finals reached.
  wrap('tableFinals', (orig) => {
    const r = orig();
    try { const T = Game.tableState(); ev('finals-reached', { path: T.path || '?', branch: T.branch || T.band || '?' }); } catch (e) {}
    return r;
  });
  // G4b: the final choice — the win flag or the deferral.
  wrap('tableResolveFinal', (orig, args) => {
    const fid = String((args[0] == null ? '' : args[0])).slice(0, 40);
    let floorOk = null;
    try { floorOk = (typeof Game.winDayFloorOk === 'function') ? !!Game.winDayFloorOk() : null; } catch (e) {}
    const r = orig.apply(null, args);
    let won = null, over = null, phase = '?';
    try { won = !!Game.won; over = !!Game.over; const T = Game.tableState(); phase = T.phase || '?'; } catch (e) {}
    ev('final-chosen', { finalId: fid, floorOk, won, over, phase });
    return r;
  });
  wrap('tableResolveDemandPrice', (orig, args) => {
    const r = orig.apply(null, args);
    try { ev('demand-price-paid', { price: String(args[0] || '?'), won: !!Game.won, over: !!Game.over }); } catch (e) {}
    return r;
  });
  // G4c: the deferral itself.
  wrap('winDayFloorDefer', (orig, args) => {
    const r = orig.apply(null, args);
    try { const T = Game.tableState(); ev('win-deferred', { phase: T.phase || '?', tableChoicesNull: !(Game.state.scholar || {}).tableChoices }); } catch (e) {}
    return r;
  });

  // say capture: table/won/defer/death beats (bounded) — sense-testing raw material.
  try {
    const osay = Game.say ? Game.say.bind(Game) : null;
    const RE = /table|seat|won|win|defer|ninety|◈ THE AUDIT|downgrade|finals|path of|CHAMPION|died|starv|village is gone|extinct/i;
    Game.say = function (msg) {
      try {
        const text = String(msg == null ? '' : msg);
        if (RE.test(text) && t.lines.length < 400) t.lines.push({ day: gday(Game), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260) });
      } catch (e) {}
      return osay ? osay(msg) : msg;
    };
  } catch (e) { t.notes.push('say-wrap:err'); }

  return t;
}

// censusRow(Game, t): call once per game-day (before or after policy.daily — consistent).
function censusRow(Game, t) {
  try {
    const s = seatInfo(Game);
    const pg = Game.progState ? Game.progState() : {};
    const T = (typeof Game.tableState === 'function') ? Game.tableState() : {};
    let choices = 0;
    try { const tc = (Game.state.scholar || {}).tableChoices; choices = (tc && tc.options && tc.options.length) || 0; } catch (e) {}
    let living = -1;
    try { living = ((Game.state.village || {}).roster || []).length; } catch (e) {}
    let active = null;
    try { active = (typeof Game.tableActive === 'function') ? !!Game.tableActive() : null; } catch (e) {}
    t.rows.push({
      day: gday(Game), arc: pg.arc | 0, seat: s.seat, waiting: !!pg.tableWaiting, done: !!pg.tableDone,
      phase: T.phase || null, path: T.path || null, branch: T.branch || T.band || null, beat: T.beat | 0,
      weakened: T.weakened | 0, choices, over: !!Game.over, won: !!Game.won, living, active,
      national: (() => { try { return Game.scaleRank && (Game.scaleRank() === 'national' || Game.scaleRank() === 'global'); } catch (e) { return null; } })(),
      deeds: deedBars(Game),
    });
  } catch (e) { t.hookErrs++; }
}

// finalizeWinCensus(Game, t, meta) -> per-run census object (gate taxonomy + wall fields).
function finalizeWinCensus(Game, t, meta) {
  meta = meta || {};
  const c = {
    seed: meta.seed, combo: meta.combo, arm: meta.arm, inv: meta.inv,
    days: meta.days, endReason: meta.endReason || '?', hookErrs: t.hookErrs, notes: t.notes.slice(),
    gates: {}, stall: {}, deaths: [], wall: {}, transcript: t.lines.slice(),
  };
  const firstEv = (kind) => t.events.find(e => e.kind === kind) || null;
  const allEv = (kind) => t.events.filter(e => e.kind === kind);
  const dayOf = (kind) => { const e = firstEv(kind); return e ? e.day : null; };

  c.gates.arc4Day = dayOf('arc4') != null ? dayOf('arc4') : (() => {
    const r = t.rows.find(r => (r.arc | 0) >= 4); return r ? r.day : null;
  })();
  c.gates.waitingDay = (() => { const r = t.rows.find(r => r.waiting); return r ? r.day : null; })();
  const sc = firstEv('scene-fired');
  c.gates.sceneDay = sc ? sc.day : null;
  c.gates.sceneSeat = sc ? sc.seat : null;
  c.gates.sceneWithdrawn = !!firstEv('scene-withdrawn');
  c.gates.promptsOffered = allEv('prompt-offered').length;
  c.gates.choicesAnswered = allEv('choice-answered').length;
  const ps = firstEv('path-started');
  c.gates.pathStarted = ps ? { day: ps.day, pathId: ps.pathId } : null;
  const pst = firstEv('path-state');
  c.gates.pathBranch = pst ? pst.branch : null;
  c.gates.beatsAnswered = allEv('beat-answered').length;
  c.gates.fails = allEv('path-failed').map(e => ({ day: e.day, reason: e.reason, weakened: e.weakened }));
  c.gates.trials = allEv('trial-started').length;
  c.gates.finalsDay = dayOf('finals-reached');
  const fc = firstEv('final-chosen');
  c.gates.finalChosen = fc ? { day: fc.day, id: fc.finalId, floorOk: fc.floorOk, won: fc.won } : null;
  c.gates.deferrals = allEv('win-deferred').map(e => e.day);
  c.gates.demandPrice = allEv('demand-price-paid').length > 0;
  c.gates.wonDay = (() => { const r = t.rows.find(r => r.won); return r ? r.day : null; })();
  c.gates.overDay = (() => { const r = t.rows.find(r => r.over); return r ? r.day : null; })();

  // Stall analysis from rows.
  const rows = t.rows;
  const afterScene = sc ? rows.filter(r => r.day > sc.day) : [];
  c.stall.postSceneDays = afterScene.length;
  c.stall.pendingModalDays = rows.filter(r => (r.choices | 0) > 0).length;
  c.stall.deferredDays = (() => {
    if (!c.gates.deferrals.length) return 0;
    const d0 = c.gates.deferrals[0];
    return rows.filter(r => r.day > d0 && (r.phase === 'paths') && (r.choices | 0) === 0 && !r.won).length;
  })();
  c.stall.phaseAtEnd = rows.length ? rows[rows.length - 1].phase : null;
  c.stall.choicesAtEnd = rows.length ? rows[rows.length - 1].choices : null;
  c.stall.activeAtEnd = rows.length ? rows[rows.length - 1].active : null;

  // Deaths from telemetry (player-kind flags the scholar's own death).
  try {
    for (const d of (Game.state.telemetry || [])) {
      if (d && d.type === 'death') c.deaths.push({ day: d.day, kind: d.kind || '?', who: d.who || '?', cause: d.cause || '?', player: !!d.player });
    }
  } catch (e) {}
  c.deaths = c.deaths.slice(0, 60);

  // Wall fields.
  c.wall.nationalEver = rows.some(r => r.national === true);
  c.wall.nationalFirstDay = (() => { const r = rows.find(r => r.national === true); return r ? r.day : null; })();
  try { c.wall.maxWaveUnlocked = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) { c.wall.maxWaveUnlocked = null; }
  const lastDeeds = (() => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i].deeds) return rows[i].deeds; return null; })();
  c.wall.deedBars = lastDeeds;
  c.wall.maxSeat = rows.reduce((m, r) => { const o = { none: 0, lesser: 1, full: 2 }[r.seat] || 0; return o > m.o ? { o, seat: r.seat, day: r.day } : m; }, { o: 0, seat: 'none', day: null });

  // Gate reachability bitmask: which gates cleared, in order.
  c.gates.chain = [
    c.gates.arc4Day != null ? 'ARC4' : '-arc4',
    c.gates.waitingDay != null ? 'WAIT' : '-wait',
    c.gates.sceneDay != null ? 'SCENE(' + (c.gates.sceneSeat || '?') + ')' : (c.gates.sceneWithdrawn ? 'WITHDRAWN' : '-scene'),
    c.gates.pathStarted ? 'PATH(' + c.gates.pathStarted.pathId + ')' : '-path',
    c.gates.finalsDay != null ? 'FINALS' : '-finals',
    c.gates.finalChosen ? 'FINAL(' + (c.gates.finalChosen.floorOk ? 'floor-ok' : 'DEFERRED') + ')' : '-choice',
    c.gates.wonDay != null ? 'WON(d' + c.gates.wonDay + ')' : '-won',
  ];
  return c;
}

// wrapWithTableWalk(policy): policy-side table driver (winseek's tableRoad pattern —
// answers the first option, like a decisive player, capped; never invents answers).
// This is HARNESS-side: it lets the census measure the post-invitation chain mechanically.
function tableWalk(Game, ctx) {
  try {
    let n = 0, lastSig = null, stall = 0;
    for (;;) {
      if (Game.over) break;
      if (n >= 30) break;
      try { if (Game.tbfight && !Game.tbfight.over) break; } catch (e) {}
      const s = Game.state.scholar || {};
      const tc = s.tableChoices;
      if (!tc || !tc.options || !tc.options.length || typeof Game.chooseTableOption !== 'function') break;
      const sig = (tc.frame || '') + '|' + tc.options.map(o => o.id).join(',');
      if (sig === lastSig && ++stall >= 2) break;
      lastSig = sig;
      Game.chooseTableOption(tc.options[0].id);
      n++;
      ctx.tableWalked = (ctx.tableWalked | 0) + 1;
    }
  } catch (e) {}
}

function wrapWithTableWalk(policy) {
  const wrapped = Object.create(policy);
  const baseDaily = policy.daily;
  wrapped.id = (policy.id || 'policy') + '+tablewalk';
  wrapped.daily = function (G, ctx) {
    if (baseDaily) baseDaily(G, ctx);
    tableWalk(G, ctx);
  };
  return wrapped;
}

module.exports = { installWinCensus, censusRow, finalizeWinCensus, wrapWithTableWalk, tableWalk };
