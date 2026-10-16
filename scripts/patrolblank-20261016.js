#!/usr/bin/env node
'use strict';
// patrolblank-20261016.js — READ-ONLY patrol-resolution diagnostic instrument
// (flesh-out loop sim-patrolblank, 2026-10-16).
//
// WHY does Game.resolvePatrol NEVER fire on the courtship substrate?
// Attaches read-only wraps (logs only — zero state mutation, zero RNG
// consumption, zero beats/narration) and classifies every patrol-resolution
// "opportunity" as FIRED / REFUSED:<gate> / RESOLVED-WITHOUT-FIRE /
// DIRECT-WRITE:<source> / NEVER-SCHEDULED (no assigner exists).
//
// Purity: every wrapper calls the original with the original arguments and
// returns the original's return value. The only bookkeeping is pushing into
// plain JS arrays on a fresh ctx object; no Game.state, no telemetry, no
// Math.random, no say(). The det-gate (test-patrolblank-det-20261016.js)
// proves trajectory-identical digests with/without this instrument.
function attachPatrolBlank(Game) {
  const ctx = {
    // Attempt class: every assignTask(vid,'patrol') call.
    attempts: [],            // {day, part, vid, via, outcome, gate, trust, hp, atHaven}
    // Direct-write class: assignments[vid].task==='patrol' with no assignTask call.
    directWrites: [],         // {day, part, vid, source}
    // Resolution class: resolveOneAssignment(vid, {task:'patrol'}) (incl. task leads).
    resolutions: [],          // {day, part, vid, viaLead, fired}
    fires: 0,                 // resolvePatrol invocations
    // Lead class: patrol-domain leadership machinery.
    patrolChallenges: [],     // {day, part, kind, cid, task}
    patrolLeads: [],          // {day, part, task, vid} — v.taskLeads[patrol] observed
    // Threat availability probe (RNG-free scan): nearest world monster at haven, once/day.
    threatDays: 0,            // days sampled
    threatPresent: 0,         // samples with >=1 world monster
    threatNear: 0,            // samples with a monster within 2 tiles of haven
    sayBeats: [],             // patrol-adjacent beats for the sense-read
    _assignIds: new Set(),     // patrol assignment ids created via assignTask (vid@day)
    _sayPatrol: /patrol|perimeter|treeline watch/i,
  };
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const gpart = () => { try { return Game.dayPart; } catch (e) { return '?'; } };

  // --- resolvePatrol: count fires ---
  try {
    const _orig = Game.resolvePatrol.bind(Game);
    Game.resolvePatrol = function (vid) {
      ctx.fires++;
      const r = _orig.apply(this, arguments);
      return r;
    };
  } catch (e) { ctx.wrapError = 'resolvePatrol: ' + String(e && e.message || e); }

  // --- assignTask: log every patrol assignment attempt + its outcome ---
  // Outcome read AFTER the call: assignment present => assigned; absent =>
  // refused (classify the gate read-only: not-at-haven/remote, obedience
  // trust gate, reluctant roll — undetectable post-hoc so 'refused-silent',
  // fitness HP gate). Gates read WITHOUT consuming RNG or mutating.
  try {
    const _orig = Game.assignTask.bind(Game);
    Game.assignTask = function (vid, task, opts) {
      const r = _orig.apply(this, arguments);
      try {
        if (task === 'patrol') {
          const via = (opts && opts.via) || 'in-person';
          const asg = ((Game.state.village || {}).assignments || {})[vid];
          const outcome = (asg && asg.task === 'patrol') ? 'assigned' : 'refused';
          let gate = null, trust = null, hp = null, atHaven = null;
          if (outcome === 'assigned') {
            ctx._assignIds.add(String(vid));
          } else {
            try {
              trust = ((Game.state.village || {}).trust || {})[vid];
              if (trust === undefined) trust = 10;
            } catch (e) {}
            try {
              const hv = (Game.state.village || {}).health || {};
              hp = (hv[vid] !== undefined) ? hv[vid] : 100;
            } catch (e) {}
            try { atHaven = Game.playerAtHaven ? !!Game.playerAtHaven() : null; } catch (e) {}
            // Gate classification (engine source: game.js assignTask/checkObedience):
            // remote via (not 'in-person' + no remote-assign ability) => refused up front;
            // else not-at-haven => refused; else trust<20 => obedience refused;
            // else hp<40 => fitness refused; else => reluctant-roll (RNG, post-hoc
            // undetectable — recorded as refused-reluctant).
            if (via !== 'in-person') {
              let methods = [];
              try { methods = Game.remoteAssignMethods ? Game.remoteAssignMethods() : []; } catch (e) {}
              gate = methods.some(m => m && m.id === via) ? 'reluctant-roll' : 'remote-ungated';
            } else if (!atHaven) gate = 'not-at-haven';
            else if ((trust || 10) < 20) gate = 'obedience-trust<20';
            else if ((hp == null ? 100 : hp) < 40) gate = 'fitness-hp<40';
            else gate = 'reluctant-roll';
          }
          ctx.attempts.push({ day: gday(), part: gpart(), vid: String(vid), via, outcome, gate, trust, hp, atHaven });
        }
      } catch (e) { ctx.logError = 'assignTask-log: ' + String(e && e.message || e); }
      return r;
    };
  } catch (e) { ctx.wrapError = 'assignTask: ' + String(e && e.message || e); }

  // --- resolveOneAssignment: did any patrol-task resolution call resolvePatrol? ---
  try {
    const _orig = Game.resolveOneAssignment.bind(Game);
    Game.resolveOneAssignment = function (vid, a) {
      let isPatrol = false, viaLead = false;
      try { isPatrol = a && a.task === 'patrol'; } catch (e) {}
      const firesBefore = ctx.fires;
      const r = _orig.apply(this, arguments);
      try {
        if (isPatrol) {
          try {
            const tl = (Game.state.village || {}).taskLeads || {};
            viaLead = Object.entries(tl).some(([t, v]) => t === 'patrol' && String(v) === String(vid));
          } catch (e) {}
          ctx.resolutions.push({ day: gday(), part: gpart(), vid: String(vid), viaLead, fired: ctx.fires > firesBefore });
        }
      } catch (e) { ctx.logError = 'resolveOne-log: ' + String(e && e.message || e); }
      return r;
    };
  } catch (e) { ctx.wrapError = 'resolveOneAssignment: ' + String(e && e.message || e); }

  // --- resolveAssignments: snapshot assignments each part; catch direct writes ---
  try {
    const _orig = Game.resolveAssignments.bind(Game);
    Game.resolveAssignments = function () {
      try {
        const asg = (Game.state.village || {}).assignments || {};
        for (const vid of Object.keys(asg)) {
          if ((asg[vid] || {}).task === 'patrol' && !ctx._assignIds.has(String(vid))) {
            ctx.directWrites.push({ day: gday(), part: gpart(), vid: String(vid), source: 'assignment-without-assignTask' });
            ctx._assignIds.add(String(vid)); // dedupe per part
          }
        }
        // task-lead patrol entries (the contender-takeover path).
        const tl = (Game.state.village || {}).taskLeads || {};
        if (tl.patrol) ctx.patrolLeads.push({ day: gday(), part: gpart(), task: 'patrol', vid: String(tl.patrol) });
      } catch (e) { ctx.logError = 'resolveAssignments-log: ' + String(e && e.message || e); }
      const r = _orig.apply(this, arguments);
      try { ctx._assignIds.clear(); } catch (e) {} // assignments clear each part; reset tracking
      return r;
    };
  } catch (e) { ctx.wrapError = 'resolveAssignments: ' + String(e && e.message || e); }

  // --- yieldChallenge: patrol-domain challenges (the takeover source) ---
  try {
    const _orig = Game.yieldChallenge ? Game.yieldChallenge.bind(Game) : null;
    if (_orig) {
      Game.yieldChallenge = function (vid) {
        try {
          const ch = (Game.state.village || {}).challenge || {};
          const task = ch.task || 'forage';
          if (task === 'patrol') ctx.patrolChallenges.push({ day: gday(), part: gpart(), kind: 'yield', cid: ch.cid || vid, task });
        } catch (e) {}
        return _orig.apply(this, arguments);
      };
    }
  } catch (e) { ctx.wrapError = 'yieldChallenge: ' + String(e && e.message || e); }

  // --- challenge-aging takeover: v.taskLeads[t] = ch.cid happens inside
  // resolveAssignments (line ~6124) — already captured via patrolLeads above.
  // Catch challenges FILED on the patrol domain via leadershipFriction if present.
  try {
    if (typeof Game.leadershipFriction === 'function') {
      const _orig = Game.leadershipFriction.bind(Game);
      Game.leadershipFriction = function (vid, task) {
        try {
          if (task === 'patrol') ctx.patrolChallenges.push({ day: gday(), part: gpart(), kind: 'friction', cid: String(vid), task });
        } catch (e) {}
        return _orig.apply(this, arguments);
      };
    }
  } catch (e) { ctx.wrapError = 'leadershipFriction: ' + String(e && e.message || e); }

  // --- daily threat probe (RNG-free scan, read-only) ---
  ctx.probeThreat = function () {
    try {
      const hx = ((Game.state.village || {}).px ?? 4), hy = ((Game.state.village || {}).py ?? 4);
      let best = null, bestD = 1e9;
      const list = (Game.state.worldMonsters || []);
      for (const m of list) {
        if (!m) continue;
        const d = Math.abs((m.tx ?? 0) - hx) + Math.abs((m.ty ?? 0) - hy);
        if (d < bestD) { bestD = d; best = m; }
      }
      ctx.threatDays++;
      if (best) {
        ctx.threatPresent++;
        if (bestD <= 2) ctx.threatNear++;
      }
    } catch (e) { ctx.logError = 'threat-probe: ' + String(e && e.message || e); }
  };

  // --- say-beat capture for the sense-read ---
  try {
    const _orig = Game.say.bind(Game);
    Game.say = function (text) {
      const r = _orig.apply(this, arguments);
      try {
        if (ctx._sayPatrol.test(String(text || ''))) {
          ctx.sayBeats.push({ day: gday(), text: String(text || '').slice(0, 300) });
          if (ctx.sayBeats.length > 400) ctx.sayBeats.shift();
        }
      } catch (e) {}
      return r;
    };
  } catch (e) { ctx.wrapError = 'say: ' + String(e && e.message || e); }

  return ctx;
}

// Summarize one run's patrol-blank ledger into the attribution table.
function summarize(run) {
  const c = run.ctx;
  const gates = {};
  for (const a of c.attempts) {
    const k = a.outcome === 'assigned' ? 'assigned' : ('refused:' + (a.gate || 'unknown'));
    gates[k] = (gates[k] || 0) + 1;
  }
  const resFired = c.resolutions.filter(r => r.fired).length;
  const resNoFire = c.resolutions.filter(r => !r.fired).length;
  return {
    seed: run.seed, policyId: run.policyId, days: run.days, gameDays: run.gameDays,
    endReason: run.endReason, finalEngineDay: run.finalEngineDay,
    fires: c.fires,
    attempts: c.attempts.length,
    attemptsByGate: gates,
    directWrites: c.directWrites.length,
    resolutions: c.resolutions.length,
    resolutionsFired: resFired,
    resolutionsNoFire: resNoFire,
    patrolLeads: c.patrolLeads.length,
    patrolChallenges: c.patrolChallenges.length,
    threatDays: c.threatDays, threatPresent: c.threatPresent, threatNear: c.threatNear,
    sayBeats: c.sayBeats.length,
    wrapError: c.wrapError || null, logError: c.logError || null,
    national: run.national, table: run.table, wins: run.wins, exiled: run.exiled,
  };
}

module.exports = { attachPatrolBlank, summarize };
