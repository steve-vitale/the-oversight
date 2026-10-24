#!/usr/bin/env node
// sim-foreignhelp-b-instrument.js — FOREIGN-HELP / AID-CRISIS COMMS-CHAIN
// instrument (flesh-out loop arm sim-foreignhelp-b, axis scale-onramp, run
// fleshout-20261024T0925Z, backlog #872). DIAG arm: instrument-side, ZERO
// src/js changes, RNG-neutral (wraps are call-through; no Math.random reads,
// no state mutation beyond the recorder arrays).
//
// Installed ON TOP of scripts/vetaidcrisis-instrument.js (which owns the
// crisis timeline / fights / deaths). This file owns the COMMS CHAIN only:
//   t.fh.calls    — every Game.callForHelp invocation {day, tier, ret}
//   t.fh.asks     — every Game.aidAskVillage verdict {day, via, villageId,
//                    verdict, trustBefore} (trust read BEFORE the call)
//   t.fh.arrivals — every Game.aidHelpArrived outcome {day, villageId,
//                    partySize, result}
//   t.fh.raiseSnaps — per crisis raise: links at raise (other, trust,
//                    status, kind), known-village count, integration stage,
//                    cry abilities held (the four tiers' preconditions)
//   t.fh.resolveSnaps — per crisis resolve: engine crisis.calls verbatim
//                    (tier/day/part/target/result), helpAtDoor count,
//                    attracted, pendingHelp left over, duration days
//   t.fh.firstTranscript — Game.say lines for the FIRST crisis only, from
//                    its raise through its resolve (+5 trailing lines), so
//                    one crisis can be sense-tested end-to-end without
//                    drowning the corpus in say traffic.
// The gate question #872 asks is answered by joining these: calls per tier
// -> asks per verdict -> arrivals, with the precondition snapshot naming
// which gate (no links / trust / score / crisis-window) each failure hit.
'use strict';

function err(t, where, e) {
  try { t.fh.errors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}
function gday(Game) {
  try { return (Game.state && Game.state.scholar && Game.state.scholar.day) | 0; }
  catch (e) { return -1; }
}
function otherOf(link) {
  if (!link) return null;
  if (link.primary === 'haven') return link.subordinate || null;
  if (link.subordinate === 'haven') return link.primary || null;
  if (link.a === 'haven') return link.b || null;
  if (link.b === 'haven') return link.a || null;
  return null;
}

function install(Game, t) {
  if (!t.fh) t.fh = { calls: [], asks: [], arrivals: [], raiseSnaps: [], resolveSnaps: [], errors: [], firstTranscript: null };
  const fh = t.fh;
  const uninstalls = [];
  // Transcript capture state: first crisis only.
  let capturing = false, trailing = 0, transcriptDone = false;

  function linkSnap(Game) {
    const out = [];
    try {
      const links = Game.hierarchyState ? Game.hierarchyState() : [];
      for (const l of links) {
        if (!l || l.status !== 'active') continue;
        const o = otherOf(l);
        if (!o) continue;
        out.push({ other: String(o), trust: l.trust != null ? (l.trust | 0) : null, status: String(l.status), kind: l.kind != null ? String(l.kind) : null });
      }
    } catch (e) { err(t, 'linkSnap', e); }
    return out;
  }
  function raiseSnap(Game) {
    let stage = null, cries = [];
    try { stage = Game.integrationStage ? Game.integrationStage() : null; } catch (e) {}
    try { cries = Game.aidCryAbilities ? Game.aidCryAbilities().map(c => c.id) : []; } catch (e) {}
    let known = null;
    try {
      const ovs = Game.state.otherVillages || [];
      known = ovs.filter(ov => { try { return Game.knowsVillage(ov); } catch (e) { return false; } }).length;
    } catch (e) {}
    return { links: linkSnap(Game), knownVillages: known, integrationStage: stage, cryAbilities: cries };
  }

  // -- Game.say capture (first crisis only) --
  // FH_SENSE_ALL=1 (sense runs only, never the census): additionally record
  // arrival/help beat lines for EVERY crisis, so a later crisis's arrival
  // can be sense-tested even though firstTranscript covers only crisis #1.
  const senseAll = (typeof process !== 'undefined' && process.env && process.env.FH_SENSE_ALL === '1');
  if (senseAll) fh.senseLines = [];
  const SENSE_RE = /🥁|walks in with|Where's the teeth|We're here|heads home|debt stands|🚨|door is quiet|moved on|foragers leave our fields|Old friends don't count/;
  try {
    const oSay = Game.say ? Game.say.bind(Game) : null;
    if (typeof oSay === 'function') {
      Game.say = function () {
        let r;
        try { r = oSay.apply(this, arguments); } catch (e) { err(t, 'say-fwd', e); throw e; }
        try {
          const txt = arguments.length ? String(arguments[0]) : '';
          if (capturing && fh.firstTranscript) {
            fh.firstTranscript.lines.push({ day: gday(Game), text: txt.slice(0, 400) });
            if (trailing > 0) { trailing--; if (trailing === 0) { capturing = false; transcriptDone = true; } }
          }
          if (senseAll && SENSE_RE.test(txt)) fh.senseLines.push({ day: gday(Game), text: txt.slice(0, 400) });
        } catch (e) { err(t, 'say-rec', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oSay) Game.say = oSay; } catch (e) {} });
    }
  } catch (e) { err(t, 'say.wrap', e); }

  // -- callForHelp --
  try {
    const oCall = Game.callForHelp ? Game.callForHelp.bind(Game) : null;
    if (typeof oCall === 'function') {
      Game.callForHelp = function (tier, opts) {
        const day = gday(Game);
        let r;
        try { r = oCall.apply(this, arguments); } catch (e) { err(t, 'callForHelp-fwd', e); throw e; }
        try { fh.calls.push({ day, tier: tier != null ? String(tier) : null, ret: r == null ? 'null' : String(r) }); } catch (e) { err(t, 'call-rec', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oCall) Game.callForHelp = oCall; } catch (e) {} });
    } else { err(t, 'install.missing:callForHelp', new Error('not a function')); }
  } catch (e) { err(t, 'callForHelp.wrap', e); }

  // -- aidAskVillage (verdicts; trust read BEFORE the call) --
  try {
    const oAsk = Game.aidAskVillage ? Game.aidAskVillage.bind(Game) : null;
    if (typeof oAsk === 'function') {
      Game.aidAskVillage = function (villageId, via, msg) {
        const day = gday(Game);
        let trustBefore = null;
        try { const l = Game.linkWith ? Game.linkWith(villageId) : null; trustBefore = l && l.trust != null ? (l.trust | 0) : null; } catch (e) {}
        let r;
        try { r = oAsk.apply(this, arguments); } catch (e) { err(t, 'aidAskVillage-fwd', e); throw e; }
        try { fh.asks.push({ day, via: via != null ? String(via) : null, villageId: villageId != null ? String(villageId) : null, verdict: r == null ? 'null' : String(r), trustBefore }); } catch (e) { err(t, 'ask-rec', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oAsk) Game.aidAskVillage = oAsk; } catch (e) {} });
    } else { err(t, 'install.missing:aidAskVillage', new Error('not a function')); }
  } catch (e) { err(t, 'aidAskVillage.wrap', e); }

  // -- aidHelpArrived --
  try {
    const oArr = Game.aidHelpArrived ? Game.aidHelpArrived.bind(Game) : null;
    if (typeof oArr === 'function') {
      Game.aidHelpArrived = function (help) {
        const day = gday(Game);
        let r;
        try { r = oArr.apply(this, arguments); } catch (e) { err(t, 'aidHelpArrived-fwd', e); throw e; }
        try { fh.arrivals.push({ day, villageId: help && help.villageId != null ? String(help.villageId) : null, partySize: help && help.partySize != null ? (help.partySize | 0) : null, result: r == null ? 'null' : String(r) }); } catch (e) { err(t, 'arrival-rec', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oArr) Game.aidHelpArrived = oArr; } catch (e) {} });
    } else { err(t, 'install.missing:aidHelpArrived', new Error('not a function')); }
  } catch (e) { err(t, 'aidHelpArrived.wrap', e); }

  // -- raiseAidCrisis (snapshot preconditions; start transcript capture) --
  try {
    const oRaise = Game.raiseAidCrisis ? Game.raiseAidCrisis.bind(Game) : null;
    if (typeof oRaise === 'function') {
      Game.raiseAidCrisis = function (name, wave) {
        const day = gday(Game);
        // Start transcript capture BEFORE the raise announcement is spoken
        // inside oRaise, or the 🚨 line itself is missing from the transcript.
        if (!transcriptDone && !capturing) {
          fh.firstTranscript = { raiseDay: day, name: name != null ? String(name) : null, wave: wave != null ? (wave | 0) : null, lines: [] };
          capturing = true;
        }
        let r;
        try { r = oRaise.apply(this, arguments); } catch (e) { err(t, 'raiseAidCrisis-fwd', e); throw e; }
        try {
          const snap = raiseSnap(Game);
          snap.day = day; snap.name = name != null ? String(name) : null; snap.wave = wave != null ? (wave | 0) : null;
          fh.raiseSnaps.push(snap);
        } catch (e) { err(t, 'raiseSnap-rec', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oRaise) Game.raiseAidCrisis = oRaise; } catch (e) {} });
    } else { err(t, 'install.missing:raiseAidCrisis', new Error('not a function')); }
  } catch (e) { err(t, 'raiseAidCrisis.wrap', e); }

  // -- resolveAidCrisis (verbatim engine calls; stop transcript after 5 lines) --
  try {
    const oResolve = Game.resolveAidCrisis ? Game.resolveAidCrisis.bind(Game) : null;
    if (typeof oResolve === 'function') {
      Game.resolveAidCrisis = function (how) {
        const day = gday(Game);
        let pre = null;
        try { pre = Game.aidCrisis ? Game.aidCrisis() : null; } catch (e) {}
        const preCalls = pre ? (pre.calls || []).map(c => ({ tier: c.tier != null ? String(c.tier) : null, day: c.day != null ? (c.day | 0) : null, part: c.part != null ? (c.part | 0) : null, targetId: c.targetId != null ? String(c.targetId) : null, runner: c.runner != null ? String(c.runner) : null, result: c.result != null ? String(c.result) : null })) : null;
        const preHelp = pre ? (pre.helpAtDoor || []).length : null;
        const preAttr = pre ? (pre.attracted | 0) : null;
        const prePend = (() => { try { return (Game.state.pendingHelp || []).length; } catch (e) { return null; } })();
        const preSince = pre && pre.sinceDay != null ? (pre.sinceDay | 0) : null;
        let r;
        try { r = oResolve.apply(this, arguments); } catch (e) { err(t, 'resolveAidCrisis-fwd', e); throw e; }
        try {
          fh.resolveSnaps.push({ day, how: how != null ? String(how) : null, ret: r == null ? 'null' : String(r), calls: preCalls, helpAtDoor: preHelp, attracted: preAttr, pendingHelpLeft: prePend, crisisDays: preSince != null ? (day - preSince) : null });
          if (capturing && fh.firstTranscript && fh.firstTranscript.raiseDay != null && r !== 'blocked') trailing = 5;
          else if (capturing && r === 'blocked') { /* keep capturing: blocked is not a resolve */ }
        } catch (e) { err(t, 'resolveSnap-rec', e); }
        return r;
      };
      uninstalls.push(() => { try { if (oResolve) Game.resolveAidCrisis = oResolve; } catch (e) {} });
    } else { err(t, 'install.missing:resolveAidCrisis', new Error('not a function')); }
  } catch (e) { err(t, 'resolveAidCrisis.wrap', e); }

  return function uninstallForeignhelp() {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
  };
}

module.exports = { install };
