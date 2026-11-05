#!/usr/bin/env node
// journey-social-life-r141-20261105.js — LEG 5 SOCIAL LIFE r141 (lane B).
// r141 = r136 driver verbatim EXCEPT: fresh seeds 41801-41804, OUTDIR
// evidence/2026-11-05, filenames r141, PLUS the initialBearer capture
// fix (captured after the ctxShared literal — r136 captured before it
// and initialBearer stayed null).
//   (j) BOND INSTRUMENT: Game.proposeLink / proposeCovenant / proposeTrade
//       wrapped (driver-side, read-only) to record every bond-proposal call
//       { day, method, target, initiator, result }. propose* act only for
//       the player's village by construction (no initiator parameter; the
//       only callers in src/js are app.js UI buttons — no NPC caller
//       exists), so any call observed is scholar-initiated; the wrap PROVES
//       the 0-call expectation in wild sim play rather than assuming it.
//       Scholar name + a bond sample (to see whether the engine records an
//       initiator) are added to the evidence.
// Zero src/js changes in the driver.
//   (g) ARMPLOT WRAP: Game.armPlot wrapped (driver-side, read-only) to record
//       motiveBetween(leader,target) score+reasons, grievanceBetween both ways,
//       each accomplice motive, and trust — AT ARMING (r113 metric review).
//   (h) SIMNPCAMBUSH WRAP: Game.simNpcAmbush wrapped to record every NPC-NPC
//       spring (plotId, leader, target, outcome, caseId) for the escaped-trace.
//   (i) darkSnap cases are a detail list now, not a count.
//   (d) LURE DECISIONS: Game.npcInviteDecision wrapped (driver-side,
//       read-only) to record every party/lure decision with chance,
//       accept, veto, inputs, reasons — the direct sometimes-taken read.
//   (e) DARK SNAPSHOTS at d30/60/90/120/end: betrayalState() grievances,
//       plots (status, inviter/target), invite histories, cases, and
//       grievanceBetween(inviter, target) per live plot.
//   (f) AMBUSH LINES: emit-stream lines matching ambush/spring/trap.
// Pre-registration: evidence/2026-11-05/journey-social-life-r141-prereg.md
// journey-social-life-20261012.js — LEG 5 SOCIAL LIFE (village journey sim loop).
// Plays a full run days 1->140 as a competent SOCIALLY-ENGAGED player:
//   - base survival from policies/competent.js, social layer from
//     policies/socialite.js (talks, feasts, moots, aid cries)
//   - REAL full conversations driven through the natural player path:
//     answer their question -> engage their want -> ask about them/village ->
//     leave via a bye choice (NOT forced endConvo('left')), so openings,
//     middles, AND endings are all sense-tested
//   - full transcripts captured in 5 social contexts for the PEOPLE CHECK:
//     A. day-1 nudge      (talk request fires on day 1 — "Can we talk?")
//     B. first meeting    (stranger, no prior conversation)
//     C. friendship       (trust >= 50 with a villager)
//     D. talk request     (pending v.talkRequests answered when found)
//     E. moot             (a petition moot held — transcript + outcome)
// Output: evidence file scripts/journey-social-life-<seed>.json + census text.
// Usage: node scripts/journey-social-life-20261012.js   (seeds 20261012, 777; DAYCAP=140)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [41801, 41802, 41803, 41804]);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { socialite } = require('./policies/socialite');
const gc = require('./policies/gossipcensus-diag'); // r141 M6 classifiers (read-only)

const OUTDIR = process.env.OUTDIR ? path.resolve(process.env.OUTDIR) : path.join(ROOT, 'evidence', '2026-11-05');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function trustOf(Game, vid) {
  try { const t = (Game.state.village.trust || {})[vid]; return t === undefined ? 10 : t; } catch (e) { return 10; }
}

// --- natural-path conversation driver (sense-testing: the full arc) ---
// Returns { vid, turns, naturalEnd, transcript[], endTrust }.
function driveConversation(Game, vid, tag, maxTurns, log) {
  const out = { vid, tag, turns: 0, naturalEnd: false, forcedClose: false, transcript: [] };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  const snap = () => {
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    return c;
  };
  const EXIT_SIGNAL = /duty calls|good pause|should get back|should be going|i should|let me get back|time to go|see you|good talking/i;
  out.offered = []; // choice ids offered each turn (evidence of bye availability)
  for (let t = 0; t < (maxTurns || 12); t++) {
    const c = snap();
    if (!c) { out.error = 'convoGet null at turn ' + t; break; }
    if (!c.active) {
      // the budget winddown closed the conversation — that IS the natural end
      out.naturalEnd = true;
      out.turns = t;
      out.transcript = (c.transcript || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 400) }));
      break;
    }
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) {
      // menu empty while still active (shouldn't happen) — treat as end
      out.naturalEnd = true;
      out.transcript = (c.transcript || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 400) }));
      break;
    }
    const ids = choices.map(x => String((x && x.id) || '')).slice(0, 10);
    out.offered.push(ids);
    const lastNPC = (c.transcript || []).filter(e => e.who !== 'you').slice(-1)[0];
    const byeFirst = lastNPC && EXIT_SIGNAL.test(String(lastNPC.text || ''));
    let pick = byeFirst ? choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || ''))) : null;
    if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /how|feeling|holding|news|day|worried|afraid|hungry|sick|village|everyone/i.test(String(x.text || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) { out.forcedClose = true; break; }
    if (/^(leave|bye|goodbye)/.test(String(pick.id || ''))) out.leftViaBye = true;
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd) {
    // exhausted turns without close — snapshot what we have, close via bye if possible
    const c = snap();
    if (c) out.transcript = (c.transcript || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 400) }));
    try {
      const choices = Game.convoChoices(vid) || [];
      const bye = choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (bye) Game.convoTurn(vid, bye.id);
      else Game.endConvo(vid, 'left');
      out.forcedClose = true;
    } catch (e) {}
  }
  out.endTrust = trustOf(Game, vid);
  if (log) log.push(out);
  return out;
}

// POLICY env: journey (socialite base + real conversations) | socialite | competent
const POLICY = process.env.POLICY || 'journey';

// --- policy: socialite + real conversations in daily ---
function makePolicy(Game, ctxShared) {
  ctxShared.mootNotes = [];
  ctxShared.talkReqSeen = {};
  const base = POLICY === 'competent' ? competent : socialite;
  const pol = Object.assign({}, base, {
    id: 'journey-social-' + POLICY,
    setup(Game2, ctx) { ctxShared.ctx = ctx; },
    daily(Game2, ctx) {
      if (POLICY === 'journey') socialite.daily(Game2, ctx); // includes competent.daily + social talks/feasts/moots/aid
      else if (base.daily) base.daily(Game2, ctx);
      ctx.socialTranscripts = ctx.socialTranscripts || [];
      const vv = Game2.state.village || {};
      const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
      const day = (Game2.state.scholar || {}).day || 0;
      const talked = new Set();
      const talkOne = (vid, tag) => {
        if (!vid || talked.has(vid)) return;
        talked.add(vid);
        const before = trustOf(Game2, vid);
        const rec = driveConversation(Game2, vid, tag, 12, ctx.socialTranscripts);
        rec.day = day; rec.trustBefore = before;
        ctx.socialConvs = (ctx.socialConvs || 0) + 1;
        if (rec.naturalEnd) ctx.socialNaturalEnds = (ctx.socialNaturalEnds || 0) + 1;
        if (rec.forcedClose) ctx.socialForced = (ctx.socialForced || 0) + 1;
        ctx.lastDay = day;
      };
      // A. day-1 nudge: answer the villager who asked "Can we talk?"
      if (day <= 2) {
        const reqs = vv.talkRequests || {};
        for (const vid of Object.keys(reqs)) { talkOne(vid, 'A-day1-nudge'); break; }
      }
      // D. pending talk requests answered first (they came to YOU)
      try {
        const reqs = vv.talkRequests || {};
        for (const vid of Object.keys(reqs)) { talkOne(vid, 'D-talk-request'); break; }
      } catch (e) {}
      // B. first meeting: someone with no recorded conversation history
      try {
        const fresh = roster.find(vid => {
          try {
            const c = Game2.convoGet(vid);
            return c && !(c.transcript || []).length && !(ctx.metSet || {}).has(vid);
          } catch (e) { return false; }
        });
        if (fresh && Math.random() < 0.6) talkOne(fresh, 'B-first-meeting');
      } catch (e) {}
      // C. friendship: someone at trust>=50 gets a real visit every few days
      try {
        if (day % 3 === 0) {
          const pals = roster.filter(vid => trustOf(Game2, vid) >= 50 && !talked.has(vid));
          if (pals.length) talkOne(pals[Math.floor(Math.random() * pals.length)], 'C-friendship');
        }
      } catch (e) {}
      // one random villager each day keeps the village warmed (the socialite talk)
      try {
        const rest = roster.filter(vid => !talked.has(vid));
        if (rest.length) {
          const vid = rest[Math.floor(Math.random() * rest.length)];
          try {
            Game2.talkTo(vid);
            const choices = Game2.convoChoices(vid) || [];
            const agency = choices.find(x => x && String(x.id || '').indexOf('agency:') === 0);
            if (agency && Game2.convoTurn) { try { Game2.convoTurn(vid, agency.id); } catch (e) {} }
            ctx.socialTalks = (ctx.socialTalks || 0) + 1;
          } catch (e) {}
          try { Game2.endConvo(vid, 'left'); } catch (e2) {}
        }
      } catch (e) {}
      // moot note (socialite.daily already conducted+answered; record what fired)
      try {
        const pet = Game2.state ? Game2.state.pendingPetition : null;
        if (pet && pet.id && !(ctx._mootSeen || {})[pet.id]) {
          ctx._mootSeen = ctx._mootSeen || {};
          ctx._mootSeen[pet.id] = 1;
          ctxShared.mootNotes.push({ day, petition: pet.id || pet.kind || '?', moots: ctx.socialMoots || 0 });
        }
      } catch (e) {}
      // record the talkRequests we never got to (are NPCs being heard?)
      try {
        ctxShared.talkReqSeen = ctxShared.talkReqSeen || {};
        for (const vid of Object.keys(vv.talkRequests || {})) ctxShared.talkReqSeen[vid] = (ctxShared.talkReqSeen[vid] || 0) + 1;
      } catch (e) {}
      // met set for B
      ctx.metSet = ctx.metSet || new Set();
      for (const v of roster) { try { const c = Game2.convoGet(v); if (c && (c.transcript || []).length) ctx.metSet.add(v); } catch (e) {} }
    },
  });
  return pol;
}


// --- r110: bond snapshot (trust + relationship channels, read-only) ---
function bondSnap(Game2) {
  const vv = Game2.state.village || {};
  const snap = { day: (Game2.state.scholar || {}).day || 0, alive: (vv.roster || []).length };
  try {
    snap.trust = (vv.roster || []).map(vid => ({ who: vname(Game2, vid), trust: trustOf(Game2, vid) })).sort((a, b) => b.trust - a.trust);
  } catch (e) { snap.trust = []; }
  try { snap.bonds = Object.keys(vv.bonds || {}).length; } catch (e) { snap.bonds = -1; }
  try { snap.conflicts = Object.keys(vv.conflicts || {}).length; } catch (e) { snap.conflicts = -1; }
  try { snap.grievances = Object.keys(vv.grievances || {}).length; } catch (e) { snap.grievances = -1; }
  try { snap.groups = Object.keys(vv.groups || {}).length; } catch (e) { snap.groups = -1; }
  try { snap.friends50 = snap.trust.filter(t => t.trust >= 50).length; } catch (e) { snap.friends50 = -1; }
  return snap;
}

// --- r112: dark snapshot (betrayal state, read-only) ---
function darkSnap(Game2) {
  const snap = { day: (Game2.state.scholar || {}).day || 0 };
  try {
    const bs = (Game2.betrayalState && Game2.betrayalState()) || {};
    snap.grievances = (bs.grievances || []).map(g => ({
      by: vname(Game2, g.by), against: vname(Game2, g.against),
      kind: g.kind, severity: g.severity, day: g.day,
    }));
    snap.plots = (bs.plots || []).map(p => {
      let gb = null, gtl = null, gti = null, gat = null;
      try { gb = (Game2.grievanceBetween && Game2.grievanceBetween(p.inviter, p.target)); } catch (e) {}
      try { gtl = (Game2.grievanceBetween && Game2.grievanceBetween(p.target, p.leader)); } catch (e) {}
      try { gti = (Game2.grievanceBetween && Game2.grievanceBetween(p.target, p.inviter)); } catch (e) {}
      try {
        const acc = p.accomplices || [];
        const vals = acc.map(a => { try { return Game2.grievanceBetween(a, p.target); } catch (e) { return null; } }).filter(v => v !== null);
        gat = vals.length ? Math.max(...vals) : null;
      } catch (e) {}
      return {
        id: p.id, leader: vname(Game2, p.leader), inviter: vname(Game2, p.inviter),
        target: vname(Game2, p.target),
        accomplices: (p.accomplices || []).map(a => vname(Game2, a)),
        day: p.day, active: !!p.active, sprung: !!p.sprung, resolved: !!p.resolved,
        expired: !!p.expired, grievanceInviterToTarget: gb,
        grievanceTargetToLeader: gtl, grievanceTargetToInviter: gti,
        grievanceAccompliceToTargetMax: gat,
      };
    });
    snap.invites = Object.keys(bs.invites || {}).map(vid => {
      const h = bs.invites[vid] || {};
      return { who: vname(Game2, vid), count: h.count || 0, accepted: h.accepted || 0,
        outcomes: (h.outcomes || []).slice(-6), pending: h.pending ? { defId: h.pending.defId, day: h.pending.day, plotId: h.pending.plotId || null } : null };
    });
    snap.casesCount = (bs.cases || []).length;
    snap.cases = (bs.cases || []).map(c => ({
      id: c.id, plotId: c.plotId, charge: c.charge, day: c.day,
      target: vname(Game2, c.target),
      accused: (c.accused || []).map(a => vname(Game2, a)),
      status: c.status, knownToPlayer: !!c.knownToPlayer, playerHeardDay: c.playerHeardDay || null,
      playerRole: c.playerRole || null,
    }));
  } catch (e) { snap.error = 'darkSnap: ' + e.message; }
  return snap;
}

// --- plain-words census ---
function census(Game, seed) {
  const lines = [];
  const vv = Game.state.village || {};
  const roster = vv.roster || [];
  const day = (Game.state.scholar || {}).day || 0;
  lines.push(`seed ${seed}, day ${day}, alive ${roster.length}`);
  for (const vid of roster) {
    let p = {}, name = vname(Game, vid);
    try { p = Game.getPerson(vid) || {}; } catch (e) {}
    const t = trustOf(Game, vid);
    let mood = '?';
    try { mood = Game.convoMoodBand ? Game.convoMoodBand(vid) : '?'; } catch (e) {}
    const ab = ((vv.npcAbilities || {})[vid] || []).length;
    lines.push(`- ${name} (${p.occupationId || p.formerOccupation || 'no occ'}, ${p.origin || '?'}) trust=${t} mood=${mood} npcAbilities=${ab}`);
  }
  const fallen = vv.fallen || [];
  lines.push(`fallen: ${fallen.length}`);
  for (const f of fallen.slice(0, 12)) {
    let nm = '?'; try { nm = vname(Game, f.villagerId); } catch (e) {}
    lines.push(`- ${nm} d${f.day}: ${f.cause || '?'}`);
  }
  lines.push(`codex plants: ${Object.keys((Game.state.codex || {}).plants || {}).length}`);
  lines.push(`pantry kcal: ${Math.round((vv.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))}`);
  return lines;
}

async function oneSeed(seed) {
  const t0 = process.hrtime.bigint();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r141', fullTelemetry: true, narration: true });
  // text capture ON (emit = the one text stream)
  const captured = [];
  let capDropped = 0; // r141 M6: emit-trim accounting (see below)
  try {
    const _emit = Game.emit;
    Game.emit = function (...a) {
      try { captured.push({ d: (Game.state.scholar || {}).day || 0, s: a[1] || 'narration', t: String(a[0] || '').slice(0, 300) }); } catch (e) {}
      // r141 M6: the 50k trim drops the OLDEST entries, so any index
      // recorded before a trim points past the new array's end. Track how
      // many entries were dropped so daily slices can use GLOBAL indices
      // (dropped + length) instead of raw array indices.
      if (captured.length > 50000) { capDropped += captured.length - 50000; captured.splice(0, captured.length - 50000); }
      try { return _emit.apply(this, a); } catch (e) { return a[0]; }
    };
  } catch (e) {}
  await setupGame(Game);
  const ctxShared = { mootNotes: [], talkReqSeen: {}, captured, lureDecisions: [], darkSnaps: [], armEvents: [], springEvents: [], expiredEvents: [], proposeCalls: [], successions: [], nightlyNews: [] };
  // r141 succession tracking: the mantle can pass mid-run, so the bearer
  // at decision time is recorded, not the end-of-run scholar. Capture the
  // initial bearer AFTER the ctxShared literal (r136 captured before it,
  // so the assignment was swallowed and initialBearer stayed null).
  try { ctxShared.lastBearer = Game.villagerId; ctxShared.initialBearer = vname(Game, Game.villagerId); } catch (e) { ctxShared.lastBearer = null; ctxShared.initialBearer = null; }
  // r112: wrap npcInviteDecision (driver-side, read-only) to record
  // every party/lure decision. If the method is not on Game, record
  // the miss — plots-status counts are then the fallback read.
  try {
    const orig = Game.npcInviteDecision;
    if (typeof orig === 'function') {
      ctxShared.decisionWrapped = true;
      Game.npcInviteDecision = function (invitee, inviter, opts) {
        const d = orig.call(this, invitee, inviter, opts);
        try {
          ctxShared.lureDecisions.push({
            day: (Game.state.scholar || {}).day || 0,
            kind: (opts && opts.kind) || 'party',
            inviter: vname(Game, inviter), invitee: vname(Game, invitee),
            // succession-proof: the bearer AT CALL TIME, not the end scholar.
            // party.js:206 always passes villagerId, so party decisions are
            // bearer-initiated by construction; lure inviters are plot roles.
            bearer: vname(Game, Game.villagerId),
            inviterWasBearer: inviter === Game.villagerId,
            chance: d && d.chance, accept: d && d.accept, veto: d && d.veto || null,
            inputs: d && d.inputs || null, reasons: d && d.reasons || [],
          });
        } catch (e) {}
        return d;
      };
    } else { ctxShared.decisionWrapped = false; }
  } catch (e) { ctxShared.decisionWrapped = 'wrap-error: ' + e.message; }
  // r120: wrap armPlot (arming-time motive) + simNpcAmbush (spring trace).
  // Both read-only: call through, record, return the original result.
  try {
    const origArm = Game.armPlot;
    if (typeof origArm === 'function') {
      ctxShared.armWrapped = true;
      Game.armPlot = function (leader, accomplices, target, motive) {
        const ev = { day: (Game.state.scholar || {}).day || 0 };
        try {
          ev.leader = vname(Game, leader); ev.target = vname(Game, target);
          ev.inviterPending = null;
          ev.accomplices = (accomplices || []).map(a => vname(Game, a));
          ev.passedMotive = motive ? { score: motive.score, reasons: motive.reasons || [] } : null;
          const mb = Game.motiveBetween ? Game.motiveBetween(leader, target) : null;
          ev.motiveAtArming = mb ? { score: mb.score, reasons: mb.reasons || [] } : null;
          ev.grievanceTargetToLeader = Game.grievanceBetween ? Game.grievanceBetween(target, leader) : null;
          ev.grievanceLeaderToTarget = Game.grievanceBetween ? Game.grievanceBetween(leader, target) : null;
          ev.accompliceMotives = (accomplices || []).map(a => {
            try { const m = Game.motiveBetween(a, target); return { who: vname(Game, a), score: m.score, reasons: m.reasons || [], grievance: Game.grievanceBetween(a, target) }; } catch (e2) { return { who: vname(Game, a), error: String(e2.message) }; }
          });
          ev.trust = { leader: trustOf(Game, leader) };
          for (const a of (accomplices || [])) ev.trust[vname(Game, a)] = trustOf(Game, a);
          try { const g = Game.npcGoal ? Game.npcGoal(leader) : null; ev.leaderGoal = g || null; } catch (e2) {}
        } catch (e2) { ev.error = 'armWrap: ' + e2.message; }
        const plot = origArm.call(this, leader, accomplices, target, motive);
        try { ev.plotId = plot && plot.id; ev.inviter = plot ? vname(Game, plot.inviter) : null; } catch (e2) {}
        ctxShared.armEvents.push(ev);
        return plot;
      };
    } else { ctxShared.armWrapped = false; }
  } catch (e) { ctxShared.armWrapped = 'wrap-error: ' + e.message; }
  try {
    const origSpring = Game.simNpcAmbush;
    if (typeof origSpring === 'function') {
      ctxShared.springWrapped = true;
      Game.simNpcAmbush = function (plot) {
        const ev = { day: (Game.state.scholar || {}).day || 0, plotId: plot && plot.id };
        try { ev.leader = vname(Game, plot.leader); ev.target = vname(Game, plot.target); ev.inviter = vname(Game, plot.inviter); } catch (e2) {}
        const r = origSpring.call(this, plot);
        try { ev.outcome = r && r.outcome; ev.caseId = r && r.caseId; } catch (e2) {}
        ctxShared.springEvents.push(ev);
        return r;
      };
    } else { ctxShared.springWrapped = false; }
  } catch (e) { ctxShared.springWrapped = 'wrap-error: ' + e.message; }
  // r132: detect newly-expired plots (read-only before/after diff of npcPlotTick).
  try {
    const origTick = Game.npcPlotTick;
    if (typeof origTick === 'function') {
      ctxShared.expireWrapped = true;
      Game.npcPlotTick = function () {
        let before = [];
        try { before = ((Game.betrayalState() || {}).plots || []).map(p => ({ id: p.id, expired: !!p.expired, leader: vname(Game, p.leader), target: vname(Game, p.target), inviter: vname(Game, p.inviter) })); } catch (e) {}
        const r = origTick.call(this);
        try {
          const after = ((Game.betrayalState() || {}).plots || []);
          for (const p of after) {
            if (p.expired && !before.find(b => b.id === p.id && b.expired)) {
              ctxShared.expiredEvents.push({ day: (Game.state.scholar || {}).day || 0, plotId: p.id, leader: vname(Game, p.leader), target: vname(Game, p.target), inviter: vname(Game, p.inviter), armedDay: p.day });
            }
          }
        } catch (e) {}
        return r;
      };
    } else { ctxShared.expireWrapped = false; }
  } catch (e) { ctxShared.expireWrapped = 'wrap-error: ' + e.message; }
  // r141 (j) BOND INSTRUMENT: wrap proposeLink / proposeCovenant /
  // proposeTrade (driver-side, read-only). propose* act only for the
  // player's village by construction (no initiator parameter; the only
  // callers in src/js are app.js UI buttons — no NPC caller exists), so
  // any call observed is scholar-initiated. Expected count in sim play
  // is 0 (UI-only verbs); the wrap PROVES that rather than assuming it.
  try {
    const scholarName = vname(Game, Game.villagerId);
    ctxShared.proposeWrapped = {};
    for (const method of ['proposeLink', 'proposeCovenant', 'proposeTrade']) {
      const origFn = Game[method];
      if (typeof origFn === 'function') {
        ctxShared.proposeWrapped[method] = true;
        Game[method] = function (targetId, opts) {
          const r = origFn.call(this, targetId, opts);
          try {
            let resultSummary = null;
            try { resultSummary = JSON.stringify(r).slice(0, 200); } catch (e2) { resultSummary = String(r).slice(0, 200); }
            ctxShared.proposeCalls.push({
              day: (Game.state.scholar || {}).day || 0,
              method, target: vname(Game, targetId),
              initiator: scholarName, initiatorKind: 'scholar',
              result: resultSummary,
            });
          } catch (e2) {}
          return r;
        };
      } else { ctxShared.proposeWrapped[method] = false; }
    }
  } catch (e) { ctxShared.proposeWrapped = 'wrap-error: ' + e.message; }
  const policy = makePolicy(Game, ctxShared);
  ctxShared.bondSnaps = [];
  // wrap daily to tag moot narration: capture day-lines when a moot fired
  const innerDaily = policy.daily;
  policy.daily = function (G2, ctx) {
    const m0 = ctx.socialMoots || 0;
    const c0 = captured.length;
    innerDaily(G2, ctx);
    if ((ctx.socialMoots || 0) > m0) {
      const lines = captured.slice(c0).slice(0, 60);
      let petKind = '?';
      try { const p = G2.state ? G2.state.pendingPetition : null; petKind = (p && (p.kind || p.id)) || '?'; } catch (e) {}
      ctxShared.mootNotes.push({ day: (G2.state.scholar || {}).day || 0, mootFired: true, petitionKind: petKind, nLines: lines.length, lines });
    }
    const d = (G2.state.scholar || {}).day || 0;
    // r141 succession tracking (read-only): note mantle passes.
    try {
      const b = G2.villagerId;
      if (ctxShared.lastBearer !== null && b !== ctxShared.lastBearer) {
        ctxShared.successions.push({ day: d, from: vname(G2, ctxShared.lastBearer), to: vname(G2, b) });
      }
      ctxShared.lastBearer = b;
    } catch (e) {}
    // r141 M6 (read-only): nightly haven-news census. Count naming-beat
    // lines delivered since the LAST daily call — the slice runs from the
    // previous daily's end to this daily's end, so it covers the night's
    // endDay beats (the naming debate fires in endDay/advancePart, AFTER
    // policy.daily returns — a slice from this daily's start would miss
    // them entirely; probe-r141-trim proved it: slice-method 2 burst
    // lines vs 48 in the full stream on seed 41801). Global indices
    // (capDropped + length) so the 50k emit-trim cannot shift the slice.
    // Stranded = scholar away from Haven when the slice is read, i.e.
    // where they spent the night — the position the slice's endDay lines
    // were delivered to. Classifiers are the gossipcensus-a ones; no
    // Game call changes, no RNG.
    try {
      const m6start = Math.max(0, (ctxShared._m6endGlobal || 0) - capDropped);
      const dayLines = captured.slice(m6start).map(c => String(c.t || ''));
      let burst = 0, settle = 0, witness = 0, tale = 0;
      for (const t of dayLines) {
        if (gc.isGossipBurstLine(t)) burst++;
        else if (gc.isSettleLine(t)) settle++;
        if (/came back from the treeline white-faced/.test(t)) witness++;
        if (/The fire settles\./.test(t)) tale++;
      }
      let stranded = false;
      try { stranded = !G2.scholarAtHaven(); } catch (e2) {}
      ctxShared.nightlyNews.push({ day: d, stranded, burst, settle, witness, tale });
      ctxShared._m6endGlobal = capDropped + captured.length;
    } catch (e2) {}
    if (d === 30 || d === 60 || d === 90) ctxShared.bondSnaps.push(bondSnap(G2));
    if (d === 30 || d === 60 || d === 90 || d === 120) ctxShared.darkSnaps.push(darkSnap(G2));
  };
  const result = await runDays(Game, policy, { days: DAYCAP, manifest });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const cen = census(Game, seed);
  // end-state trust table + talk-request answer rate
  const vv = Game.state.village || {};
  const trustTbl = (vv.roster || []).map(vid => ({ who: vname(Game, vid), trust: trustOf(Game, vid) }));
  trustTbl.sort((a, b) => b.trust - a.trust);
  // gossip read: village rep record + per-villager rumor spread (r110)
  let repSample = null;
  try {
    const rep = vv.rep || {};
    const keys = Object.keys(rep);
    repSample = { n: keys.length, sample: keys.slice(0, 5).map(k => ({ k: String(k).slice(0, 40), v: rep[k] })) };
  } catch (e) {}
  let rumorSpread = [];
  try {
    for (const vid of (vv.roster || []).slice(0, 5)) {
      let per = null;
      try { const p = Game.getPerson(vid) || {}; per = p.rumors || p.rep || p.reputation || null; } catch (e) {}
      rumorSpread.push({ who: vname(Game, vid), rumors: per ? JSON.stringify(per).slice(0, 300) : null });
    }
  } catch (e) {}
  let bondEnd = null;
  try { bondEnd = bondSnap(Game); } catch (e) {}
  let darkEnd = null;
  try { darkEnd = darkSnap(Game); } catch (e) {}
  // r141 M6: end-state naming census (read-only) — which debates kicked
  // and settled, and what is still queued for the scholar's return.
  let namingEnd = null;
  try {
    namingEnd = Object.entries((Game.state.codex || {}).monsters || {}).map(([mid, e]) => ({
      mid, reported: !!e.reported, namingKicked: !!e.namingKicked,
      villageName: e.villageName || null, proposals: Object.keys(e.proposals || {}).length,
      queued: (Game.state.pendingHavenNews || []).filter(q => q.mid === mid).length,
    }));
  } catch (e) {}
  let ambushLines = [];
  try {
    ambushLines = captured.filter(c => /ambush|sprang|trap|betray|stands accused|Word reaches you/i.test(String(c.t || ''))).slice(0, 200);
  } catch (e) {}
  // r141: scholar name (for the analyzer's player-vs-NPC inviter split)
  // + one bond sample (to see whether the engine records an initiator).
  let scholarName = null;
  try { scholarName = vname(Game, Game.villagerId); } catch (e) {}
  let bondSample = null;
  try {
    const b = vv.bonds || {};
    const k = Object.keys(b)[0];
    bondSample = k ? { key: String(k).slice(0, 80), val: JSON.stringify(b[k]).slice(0, 500) } : null;
  } catch (e) {}
  const evidence = {
    seed, manifest, ms: Math.round(ms / 1000) + 's',
    days: result.days, endReason: result.endReason,
    gameDay: (Game.state.scholar || {}).day,
    scholarName,
    initialBearer: ctxShared.initialBearer, successions: ctxShared.successions,
    social: (function () {
      const ctx = ctxShared.ctx || {};
      return {
        fullConvs: ctx.socialConvs || 0,
        naturalEnds: ctx.socialNaturalEnds || 0,
        forced: ctx.socialForced || 0,
        quickTalks: ctx.socialTalks || 0,
        feasts: ctx.socialFeasts || 0,
        moots: ctx.socialMoots || 0,
        cries: ctx.socialCries || 0,
        switch: ctx.socialSwitch || 0,
        transcripts: ctx.socialTranscripts || [],
        met: (ctx.metSet || new Set()).size,
      };
    })(),
    trustTbl, repSample, rumorSpread, bondSnaps: ctxShared.bondSnaps, bondEnd, bondSample,
    decisionWrapped: ctxShared.decisionWrapped, lureDecisions: ctxShared.lureDecisions,
    proposeWrapped: ctxShared.proposeWrapped, proposeCalls: ctxShared.proposeCalls,
    armWrapped: ctxShared.armWrapped, armEvents: ctxShared.armEvents,
    springWrapped: ctxShared.springWrapped, springEvents: ctxShared.springEvents,
    expireWrapped: ctxShared.expireWrapped, expiredEvents: ctxShared.expiredEvents,
    darkSnaps: ctxShared.darkSnaps, darkEnd, ambushLines,
    nightlyNews: ctxShared.nightlyNews, namingEnd,
    mootNotes: ctxShared.mootNotes,
    talkReqSeen: ctxShared.talkReqSeen,
    census: cen,
    fallenFull: ((Game.state.village || {}).fallen || []).map(f => {
      let nm = '?'; try { nm = vname(Game, f.villagerId); } catch (e) {}
      return { who: nm, day: f.day, cause: f.cause || '?' };
    }),
    telemetryDeaths: (result.samples.deaths || []).length,
    pacing: result.pacing ? {
      meanVerbsPerDay: result.pacing.meanVerbsPerDay,
      meanPolicyCallsPerDay: result.pacing.meanPolicyCallsPerDay,
      meanTicksPerDay: result.pacing.meanTicksPerDay,
    } : null,
    pacingDays: (result.pacing ? result.pacing.perDay : []).slice(0, 140).map(r => ({ d: r.day, v: r.verbs, p: r.policyCalls })),
    samples: {
      pop: result.samples.pop, trust: result.samples.trust, pantry: result.samples.pantry,
      knowledge: result.samples.knowledge, deaths: result.samples.deaths,
    },
  };
  return { Game, evidence, ctxShared };
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const seedsOut = [];
  for (const seed of SEEDS) {
    console.log(`=== seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const { evidence, ctxShared } = await oneSeed(seed);
    seedsOut.push(evidence);
    // transcript records live OUTSIDE evidence JSON? No — keep them in, capped.
    fs.writeFileSync(path.join(OUTDIR, `journey-social-life-r141-${seed}.json`), JSON.stringify(evidence, null, 1));
    console.log(`day ${evidence.gameDay} endReason=${evidence.endReason} ms=${evidence.ms}`);
    console.log(evidence.census.slice(0, 6).join('\n'));
  }
  console.log('DONE');
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
