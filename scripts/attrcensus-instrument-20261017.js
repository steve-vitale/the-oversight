#!/usr/bin/env node
// attrcensus-instrument-20261017.js — the sim-attrcensus extended fight
// classifier instrument (flesh-out loop, axis scale-onramp, run
// fleshout-20261017T1102Z).
// MEASUREMENT ONLY: read-only attach to the engine (wrappers call through
// and record; none touches RNG, logic, or save state). The trickfunnel
// instrument (scripts/trickfunnel-instrument-20261016.js) is NOT modified —
// this file reuses its exported trickMids/kindOf and adds the one field the
// census needs: per-mid fighter dead/alive at tbEnd, snapshotted BEFORE the
// engine's own tbEnd runs the per-kill ledger. That closes the pyrrhic gap:
// on 'lost' the ledger is forfeited by design, so a trick that killed the
// monster on the scholar's dying tick leaves no waveKillLog trace — the
// mortality snapshot is the only witness.
// No top-level side effects — safe to require from any process. No game
// dependency beyond the passed-in helpers (pure + wrappers).
'use strict';

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// attachAttrcensusCapture(Game, TF): TF = the trickfunnel instrument module
// (for trickMids/kindOf — never reimplemented here).
// Returns { tbFights, restore, tbfightIntercepted }.
// tbFights entries: { seq, day, started, result, mids, kindByMid,
//                     perfs: {mid: [tokens]}, mortality: {mid: {dead, alive}},
//                     pAlive }.
function attachAttrcensusCapture(Game, TF) {
  const trickMids = TF.trickMids;
  const kindOf = TF.kindOf;
  let fightSeq = 0;
  const tbFights = [];
  const seqIndex = {};

  function onFightStart(f) {
    fightSeq++;
    const mids = trickMids(Game, f);
    const kindByMid = {};
    for (const mid of mids) kindByMid[mid] = kindOf(Game, mid);
    seqIndex[fightSeq] = tbFights.length;
    tbFights.push({
      seq: fightSeq, day: gday(Game), started: true, result: null,
      mids: mids, kindByMid: kindByMid, perfs: {}, mortality: {}, pAlive: null,
    });
  }

  // --- tbfight property interception (transparent; same pattern as the
  // trickfunnel instrument — covers all fight-initiation paths) ---
  const origDesc = Object.getOwnPropertyDescriptor(Game, 'tbfight');
  let tbVal = Game.tbfight;
  let attached = false;
  try {
    Object.defineProperty(Game, 'tbfight', {
      configurable: true,
      enumerable: origDesc ? !!origDesc.enumerable : true,
      get: function () { return tbVal; },
      set: function (v) {
        tbVal = v;
        try {
          if (v && typeof v === 'object' && Array.isArray(v.fighters)) onFightStart(v);
        } catch (e) {}
      },
    });
    attached = true;
  } catch (e) { attached = false; }

  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const idx = seqIndex[fightSeq];
        if (idx != null && tbFights[idx]) {
          const cap = tbFights[idx];
          cap.result = result;
          cap.day = gday(Game);
          // Snapshot BEFORE _tbEnd runs the per-kill ledger: fight-end state.
          const perfs = {};
          for (const k of Object.keys((f && f.trickLogByMid) || {})) perfs[k] = (f.trickLogByMid[k] || []).slice();
          const mortality = {};
          for (const x of (f.fighters || [])) {
            if (!x || x.kind !== 'monster' || !x.mdef) continue;
            const mid = x.mdef.id;
            const m = mortality[mid] || (mortality[mid] = { dead: 0, alive: 0 });
            if (x.alive) m.alive++; else m.dead++;
          }
          cap.perfs = perfs;
          cap.mortality = mortality;
          try { const p = Game.tbFighter ? Game.tbFighter('p') : null; cap.pAlive = p ? !!p.alive : null; } catch (e) {}
          const all = new Set(cap.mids.concat(Object.keys(perfs)));
          cap.mids = Array.from(all);
          for (const mid of cap.mids) if (!cap.kindByMid[mid]) cap.kindByMid[mid] = kindOf(Game, mid);
        } else {
          // Defensive: tbEnd with no captured start. Recorded loud.
          fightSeq++;
          tbFights.push({
            seq: fightSeq, day: gday(Game), started: false, result: result,
            mids: [], kindByMid: {}, perfs: {}, mortality: {}, pAlive: null,
          });
        }
      }
    } catch (e) {}
    return _tbEnd(result);
  };

  function restore() {
    Game.tbEnd = _tbEnd;
    if (attached) {
      try {
        if (origDesc) Object.defineProperty(Game, 'tbfight', origDesc);
        else { delete Game.tbfight; Game.tbfight = tbVal; }
      } catch (e) {}
    }
  }

  return { tbFights: tbFights, restore: restore, tbfightIntercepted: attached };
}

module.exports = { attachAttrcensusCapture: attachAttrcensusCapture };
