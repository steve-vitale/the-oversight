#!/usr/bin/env node
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
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [20261012, 777]);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { socialite } = require('./policies/socialite');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-12');
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
  const t0 = Date.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life', fullTelemetry: true });
  // text capture ON (emit = the one text stream)
  const captured = [];
  try {
    const _emit = Game.emit;
    Game.emit = function (...a) {
      try { captured.push({ d: (Game.state.scholar || {}).day || 0, s: a[1] || 'narration', t: String(a[0] || '').slice(0, 300) }); } catch (e) {}
      if (captured.length > 4000) captured.splice(0, captured.length - 4000);
      try { return _emit.apply(this, a); } catch (e) { return a[0]; }
    };
  } catch (e) {}
  await setupGame(Game);
  const ctxShared = { mootNotes: [], talkReqSeen: {}, captured };
  const policy = makePolicy(Game, ctxShared);
  // wrap daily to tag moot narration: capture day-lines when a moot fired
  const innerDaily = policy.daily;
  policy.daily = function (G2, ctx) {
    const m0 = ctx.socialMoots || 0;
    const c0 = captured.length;
    innerDaily(G2, ctx);
    if ((ctx.socialMoots || 0) > m0) {
      ctxShared.mootNotes.push({ day: (G2.state.scholar || {}).day || 0, mootFired: true, lines: captured.slice(c0).slice(0, 60) });
    }
  };
  const result = await runDays(Game, policy, { days: DAYCAP, manifest });
  const ms = Date.now() - t0;
  const cen = census(Game, seed);
  // end-state trust table + talk-request answer rate
  const vv = Game.state.village || {};
  const trustTbl = (vv.roster || []).map(vid => ({ who: vname(Game, vid), trust: trustOf(Game, vid) }));
  trustTbl.sort((a, b) => b.trust - a.trust);
  // gossip read: what reputation rumors does a mid villager carry?
  let repSample = null;
  try {
    const rep = vv.rep || {};
    const keys = Object.keys(rep);
    repSample = { n: keys.length, sample: keys.slice(0, 3).map(k => ({ k: String(k).slice(0, 24), v: rep[k] })) };
  } catch (e) {}
  const evidence = {
    seed, manifest, ms: Math.round(ms / 1000) + 's',
    days: result.days, endReason: result.endReason,
    gameDay: (Game.state.scholar || {}).day,
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
    trustTbl, repSample,
    mootNotes: ctxShared.mootNotes,
    talkReqSeen: ctxShared.talkReqSeen,
    census: cen,
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
    fs.writeFileSync(path.join(OUTDIR, `journey-social-life-${seed}.json`), JSON.stringify(evidence, null, 1));
    console.log(`day ${evidence.gameDay} endReason=${evidence.endReason} ms=${evidence.ms}`);
    console.log(evidence.census.slice(0, 6).join('\n'));
  }
  console.log('DONE');
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
