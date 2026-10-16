#!/usr/bin/env node
// trickres-instrument-20261016.js — the sim-trickres resolution instrument.
// MEASUREMENT ONLY: read-only attach to the engine (wrappers call through and
// record; none touches RNG, logic, or save state). Shared by the sweep
// (scripts/sweep-trickres-20261016.js) and the proof test
// (scripts/test-trickres-20261016.js). No top-level side effects — safe to
// require from any process. No game dependency (pure + wrappers).
//
// The resolution classifier implements the metric review's definition
// (evidence/2026-10-16/sim-counterwire.md): a resolution = a fight vs a
// known-trick species ending in (a) a trick-attributed kill with non-empty
// trickLog, OR (b) mFlee/vFlee with >=2 trick actions in that fight's
// trickLog. Single-token flees (offer_food, suburb leave, eater poison) are
// classified as diagnostics, never resolutions — the >=2 bar is the metric
// as written (§14: never re-scored mid-run).
'use strict';

const BEAT_CAP = 3000;
const BEAT_LEN = 300;
const TRICK_BEAT = /COUNTER LEARNED|starves|starved out|bored out|Bored out|LEAVE|leaves|DISMISSED|dismisses|kindly|goodbye properly|looks away|dead air|contradicts the|confesses first|argues theology|fighting boring|deliberately boring|Navigation is victory|walk out|VOMITS|poisoned meal|fine print|loophole|Tanking the|goes quiet|falls PRONE|bad note|SMALLER|Scabbing|stands down/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// classifyFieldFight(f, killAttributed):
//   f = { outcome, trickTokens[] } (captured per-fight).
//   killAttributed = waveKillLog join found (same mid, ±1d, trick non-empty).
// Returns { resolution, kind, path }.
function classifyFieldFight(f, killAttributed) {
  const n = (f.trickTokens || []).length;
  if (f.outcome === 'vKill' && n >= 1) {
    return killAttributed
      ? { resolution: true, kind: 'kill', path: 'field' }
      : { resolution: false, kind: 'unattributed-kill', path: 'field' };
  }
  if ((f.outcome === 'mFlee' || f.outcome === 'vFlee') && n >= 2) {
    return { resolution: true, kind: 'flee', path: 'field' };
  }
  if ((f.outcome === 'mFlee' || f.outcome === 'vFlee') && n === 1) {
    return { resolution: false, kind: 'single-token-flee', path: 'field' };
  }
  return { resolution: false, kind: 'none', path: 'field' };
}

// classifyTbFight(t):
//   t = { perfs: {mid: [tokens]}, killAttributedByMid: {mid: bool} }.
// Returns an array of { resolution, kind, path, mid } (one per species with
// a logged performance — a performance logged implies the species bears a
// trick, since checkMonsterCounter only logs counter performances).
function classifyTbFight(t) {
  const out = [];
  for (const mid of Object.keys((t && t.perfs) || {})) {
    const perfs = (t.perfs[mid] || []);
    if (perfs.length > 0 && t.killAttributedByMid && t.killAttributedByMid[mid]) {
      out.push({ resolution: true, kind: 'kill', path: 'tb', mid: mid });
    }
  }
  return out;
}

// The OLD (kill-only) metric from the counterwire pilot, for the RED leg:
// counts only trick-attributed kills. Deliberately blind to non-lethal
// resolutions — the metric review's whole point.
function classifyKillOnly(fights) {
  let n = 0;
  for (const f of fights) {
    if (f.cls === 'kill') n++;
  }
  return n;
}

// attachTrickresCapture(Game): read-only wrappers. Every wrapper calls
// through and records; none touches RNG, logic, or save state. Defensive:
// every engine read is guarded so the instrument attaches cleanly to the
// base-commit control (which lacks rec.trickLog on some paths,
// f.trickLogByMid, and TB trick attribution) as well as to treatment.
function attachTrickresCapture(Game) {
  let fightSeq = 0;
  let curFightSeq = 0;
  const fieldFights = [];
  const tbFights = [];
  const discoveries = [];
  const deaths = [];
  const sayBeats = [];

  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'counter_discovered') discoveries.push({ seq: fightSeq, day: gday(Game), id: data && data.id, via: data && data.via });
      else if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (TRICK_BEAT.test(s) && sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
    } catch (e) {}
    return _s(t);
  };
  const _ff = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    const prev = curFightSeq;
    fightSeq++; curFightSeq = fightSeq;
    let knownStart = false;
    try { knownStart = !!(Game.villageKnowsTrick && mdef && Game.villageKnowsTrick(mdef.id)); } catch (e) {}
    const rec = _ff(vid, mdef, m, opts);
    try {
      const tl = (rec && rec.trickLog) || [];
      const entry = {
        seq: curFightSeq, day: gday(Game), vid: vid,
        mid: mdef && mdef.id, wave: (mdef && mdef.wave) || 1,
        outcome: rec && rec.outcome, rounds: rec && rec.rounds,
        trickTokens: tl.slice(0, 12), knownStart: knownStart,
      };
      if (tl.length) {
        // Integrity: the engine gates every trick action on known12||knownSig.
        // A trick fired with knownStart=false is an engine bug — flag it loud.
        entry.knownViolation = !knownStart;
        if (rec && rec.log) {
          entry.logExcerpt = rec.log.filter(l => TRICK_BEAT.test(String(l))).slice(0, 8).map(l => String(l).slice(0, 280));
        }
      }
      fieldFights.push(entry);
    } catch (e) {}
    curFightSeq = prev;
    return rec;
  };
  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    let cap = null;
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        fightSeq++;
        const mids = (f.fighters || []).filter(x => x && x.kind === 'monster' && x.mdef).map(x => x.mdef.id);
        const perfs = {};
        for (const k of Object.keys((f && f.trickLogByMid) || {})) perfs[k] = (f.trickLogByMid[k] || []).slice();
        const knownByMid = {};
        try { for (const mid of mids) knownByMid[mid] = !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) {}
        cap = { seq: fightSeq, day: gday(Game), result: result, mids: mids, perfs: perfs, knownByMid: knownByMid };
      }
    } catch (e) {}
    const r = _tbEnd(result);
    if (cap) tbFights.push(cap);
    return r;
  };

  return {
    fieldFights: fieldFights, tbFights: tbFights,
    discoveries: discoveries, deaths: deaths, sayBeats: sayBeats,
    restore: function () { Game.tele = _t; Game.say = _s; Game.fieldFight = _ff; Game.tbEnd = _tbEnd; },
  };
}

module.exports = {
  attachTrickresCapture: attachTrickresCapture,
  classifyFieldFight: classifyFieldFight,
  classifyTbFight: classifyTbFight,
  classifyKillOnly: classifyKillOnly,
  TRICK_BEAT: TRICK_BEAT,
};
