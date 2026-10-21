#!/usr/bin/env node
// heraldmuster-instrument-20261021.js — herald muster-gate engagement census
// (sim-heraldmuster, 2026-10-21, axis scale-onramp, killdisc finding 3).
//
// DIAGNOSTIC instrument — no lever. READ-ONLY observation wraps, env-gated:
// install(Game, t) is called by the sweep ONLY when
// process.env.HERALDCENSUS === '1'. When unset the wrappers are never
// installed and the policy path is byte-identical to the base stack (the
// proof test's det-gate pins that).
//
// THE QUESTION (killdisc finding 3): the Herald's titan muster gate refused
// 38 of 82 TB engagements on the pre-seat substrate. This instrument
// attributes every herald startCombat attempt on the WINNING substrate as
// refused (gate returns null — no fight starts) or accepted (a fight
// starts), with a gate-state snapshot, and keeps the count of unexplained
// outcomes (null while gate-ready, or a fight while gate-not-ready —
// either is an attribution failure, never silently trusted).
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.startCombat — herald engagement census: refused/accepted/unexplained
//                      + gate snapshot (omen stage, unique allies, haven
//                      blades, minAllies, active links, trust classes)
// Exported census(Game) — the sweep calls it daily (pure reads): the muster
// assembly trajectory (day, omenStage, gateReady, uniqueAllies, havenBlades,
// minAllies, activeLinks, linksTrustGE70, linksTrustGE25).
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.HERALDCENSUS === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// musterSnapshot(Game): pure reads of the herald muster + gate inputs.
function musterSnapshot(Game) {
  const s = {
    omenStage: null, omenExists: false, gateReady: null,
    uniqueAllies: null, havenBlades: null, minAllies: 10,
    activeLinks: 0, linksTrustGE70: 0, linksTrustGE25: 0,
  };
  try {
    const st = (Game.state || {}).titans || {};
    const o = (st.omens || {}).herald;
    if (o) { s.omenExists = true; s.omenStage = o.stage | 0; }
    if (Game.titanMusterState) {
      const ms = Game.titanMusterState('herald');
      if (ms) {
        s.uniqueAllies = (ms.allies || []).length;
        try { s.havenBlades = (Game.titanHavenBlades ? Game.titanHavenBlades(ms) : []).length; } catch (e) {}
      }
    }
    try {
      const defs = (Game.data && Game.data.titans) || {};
      if (defs.herald && defs.herald.minAllies != null) s.minAllies = defs.herald.minAllies | 0;
    } catch (e) {}
    try {
      const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      links.forEach(function (l) {
        if (!l || l.status !== 'active') return;
        s.activeLinks++;
        const tr = l.trust || 0;
        if (tr >= 70) s.linksTrustGE70++;
        if (tr >= 25) s.linksTrustGE25++;
      });
    } catch (e) { err(null, 'snapshot.links', e); }
    try { s.gateReady = Game.titanMusterReady ? !!Game.titanMusterReady('herald') : null; } catch (e) {}
  } catch (e) {}
  return s;
}

// census(Game): the daily muster-assembly trajectory record. Pure reads.
function census(Game) {
  const s = musterSnapshot(Game);
  s.day = gday(Game);
  return s;
}

// install(Game, t): installs the read-only wrap on Game.startCombat.
// t = {heraldEngagements, instrumentErrors}. Returns an uninstall function.
function install(Game, t) {
  if (!t.heraldEngagements) t.heraldEngagements = [];
  const orig = Game.startCombat;
  if (typeof orig !== 'function') { err(t, 'install.missing:startCombat', new Error('not a function')); return function () {}; }
  Game.startCombat = function (mid) {
    let pre = null;
    const isHerald = (mid === 'herald');
    try { if (isHerald) pre = { day: gday(Game), snap: musterSnapshot(Game) }; } catch (e) { err(t, 'startCombat.before', e); }
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { err(t, 'startCombat.call', e); throw e; }
    try {
      if (isHerald && pre) {
        const snap = pre.snap;
        const accepted = (r !== null && r !== undefined);
        let verdict = 'unexplained';
        if (accepted && snap.gateReady === true) verdict = 'accepted';
        else if (!accepted && snap.gateReady === false) verdict = 'refused';
        else if (accepted && snap.gateReady === null) verdict = 'unexplained';
        else if (!accepted && snap.gateReady === null) verdict = 'unexplained';
        // accepted while gate-not-ready, or refused while gate-ready: the
        // engine did something the model doesn't describe — attribution
        // failure, counted, never silently trusted.
        t.heraldEngagements.push({ day: pre.day, verdict, snap });
      }
    } catch (e) { err(t, 'startCombat.after', e); }
    return r;
  };
  return function () { try { Game.startCombat = orig; } catch (e) {} };
}

module.exports = { instrumentOn, install, census, musterSnapshot };
