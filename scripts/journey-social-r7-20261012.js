#!/usr/bin/env node
// journey-social-r7-20261012.js — LEG 5 SOCIAL LIFE, r7 (village journey sim loop).
// Two probes the r6 run left open:
//   POLICY=larceny  (default): JUSTICE LADDER NATURAL-FIRE probe. Runs the
//     crime-pressure policy (larceny-leaning: steals, provokes, cold) + social
//     conversation driving, on the r6 seeds. Instruments the full ladder:
//     considerBetrayalPlot -> armPlot -> ambush -> openCase -> npcMootTick /
//     playerCaseTick -> callMoot -> conductTrial -> finishTrial -> verdict.
//     Question: does the courtroom ceremony fire end-to-end in natural play
//     when the player misbehaves, or is the ladder structurally dead?
//   POLICY=promise: promise-system SENSE test in social context. Runs the
//     promiser policy (makes formal vows, keeps them) and captures the full
//     vow transcript + a keep arc for sense-testing.
// Output: evidence/2026-10-12/journey-social-r7-<policy>-<seed>.json
// Usage: POLICY=larceny SEEDS=20261012,111,222 DAYCAP=140 node scripts/journey-social-r7-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const POLICY = process.env.POLICY || 'larceny';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : (POLICY === 'larceny' ? [20261012, 111, 222] : [30303]));
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { larcenyLeaning } = require('./policies/larceny-leaning');
const { promiser } = require('./policies/promiser');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-12');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function trustOf(Game, vid) {
  try { const t = (Game.state.village.trust || {})[vid]; return t === undefined ? 10 : t; } catch (e) { return 10; }
}

// --- lean conversation driver (one full exchange per villager per day) ---
function driveOne(Game, vid, tag, transcripts, log) {
  const out = { vid, tag, turns: 0, naturalEnd: false, transcript: [] };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  for (let t = 0; t < 12; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) {
      out.naturalEnd = true; out.turns = t;
      out.transcript = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 400) }));
      break;
    }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    let pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices[0];
    if (!pick) break;
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  try {
    const c = Game.convoGet(vid);
    if (c && (c.transcript || []).length && !out.transcript.length)
      out.transcript = c.transcript.map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 400) }));
  } catch (e) {}
  if (out.transcript.length && transcripts) transcripts.push(out);
  return out;
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
    lines.push(`- ${name} (${p.occupationId || p.formerOccupation || 'no occ'}) trust=${trustOf(Game, vid)}`);
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
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r7', fullTelemetry: true });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  // sayLog + span machinery (r6 pattern)
  const sayLog = [];
  let logBase = 0;
  const spans = []; let openSpan = null;
  function recSay(tag, msg) {
    try {
      const m = String(msg == null ? '' : msg);
      if (!m) return;
      sayLog.push({ d: curDay(), t: (tag ? '[' + tag + '] ' : '') + m.slice(0, 500) });
      if (sayLog.length > 3000) { const n = sayLog.length - 3000; sayLog.splice(0, n); logBase += n; }
    } catch (e) {}
  }
  Game.say = function (msg) { recSay(null, msg); };
  Game.sysSay = function (msg) { recSay('SYSTEM', msg); };
  function openSpanAt(kind, meta) {
    if (openSpan) closeSpanAt('superseded');
    openSpan = { kind, meta, day: curDay(), start: sayLog.length + logBase };
  }
  function closeSpanAt(how) {
    if (!openSpan) return;
    const s = openSpan; openSpan = null;
    const from = Math.max(0, s.start - logBase);
    spans.push({ kind: s.kind, meta: s.meta, day: s.day, closed: how, lines: sayLog.slice(from).map(e => e.t) });
  }

  // ---- justice ladder instrumentation ----
  const ladder = { plotsArmed: 0, casesOpened: [], playerCasesOpened: 0, mootsCalled: [], trials: [], verdicts: [], votesCast: 0 };
  try {
    const _arm = Game.armPlot;
    Game.armPlot = function () { ladder.plotsArmed++; return _arm.apply(this, arguments); };
  } catch (e) {}
  try {
    const _oc = Game.openCase;
    Game.openCase = function (plot, charge) {
      const r = _oc.apply(this, arguments);
      try {
        ladder.casesOpened.push({
          day: curDay(), charge,
          id: r && r.id, leader: plot && plot.leader ? vname(Game, plot.leader) : null,
          target: plot && plot.target ? vname(Game, plot.target) : null,
        });
      } catch (e) {}
      return r;
    };
  } catch (e) {}
  try {
    const _opc = Game.openPlayerCase;
    Game.openPlayerCase = function (accuser, charge) {
      ladder.playerCasesOpened++;
      return _opc.apply(this, arguments);
    };
  } catch (e) {}
  try {
    const _cm = Game.callMoot;
    Game.callMoot = function (caseId, byId) {
      let meta = { caseId };
      try {
        const c = Game.getCase ? Game.getCase(caseId) : null;
        if (c) meta = { charge: c.charge, accused: (c.accused || []).map(a => vname(Game, a)), accuser: c.accuser ? vname(Game, c.accuser) : null };
      } catch (e) {}
      openSpanAt('justice', meta);
      const r = _cm.apply(this, arguments);
      ladder.mootsCalled.push({ day: curDay(), ...meta });
      return r;
    };
  } catch (e) {}
  try {
    const _ft = Game.finishTrial;
    Game.finishTrial = function (c, pv) {
      const r = _ft.apply(this, arguments);
      try {
        ladder.verdicts.push({
          day: curDay(), charge: c && c.charge, verdict: c && c.verdict, resolution: c && c.resolution,
          accused: c && (c.accused || []).map(a => vname(Game, a)),
        });
      } catch (e) {}
      if (openSpan && openSpan.kind === 'justice') closeSpanAt('finishTrial');
      return r;
    };
  } catch (e) {}

  // ---- promise instrumentation ----
  const promises = { vows: [], deflected: 0, keptSeen: 0, brokenSeen: 0 };
  try {
    const _ph = Game.promiseHelp;
    Game.promiseHelp = function (vid) {
      openSpanAt('promise', { vid: vname(Game, vid) });
      const r = _ph.apply(this, arguments);
      try {
        if (r && r.ok !== false) promises.vows.push({ day: curDay(), vid: vname(Game, vid), goal: (Game.npcGoal && Game.npcGoal(vid)) || '?' });
        else if (r && r.deflected) promises.deflected++;
      } catch (e) {}
      return r;
    };
  } catch (e) {}

  // ---- gossip instrumentation ----
  const gossip = { seeds: [], rumorStarts: 0 };
  try {
    const _sg = Game.seedGossip;
    Game.seedGossip = function (action, dims, heardBy, noTrust) {
      gossip.seeds.push({ day: curDay(), action, heardN: (heardBy || []).length });
      return _sg.apply(this, arguments);
    };
  } catch (e) {}
  try {
    const _sr = Game.spreadRumor;
    Game.spreadRumor = function () { gossip.rumorStarts++; return _sr.apply(this, arguments); };
  } catch (e) {}

  // ---- daily ladder sampler ----
  const dailySamples = [];
  function sampleLadder() {
    let plots = -1, openCases = -1, promisesOpen = 0, promisesSettled = 0, crimes = 0, mootDemanded = false;
    try {
      const bs = Game.betrayalState ? Game.betrayalState() : {};
      plots = (bs.plots || []).filter(p => p.active && !p.resolved).length;
      openCases = (bs.cases || []).filter(c => c.status === 'open').length;
      const v = Game.state.village || {};
      for (const p of Object.values(v.promises || {})) { if (p && !p.kept) promisesOpen++; else if (p && p.kept) promisesSettled++; }
      try { crimes = ((Game.justiceState && Game.justiceState().crimes) || []).length; } catch (e) {}
      try { mootDemanded = !!(Game.justiceState && Game.justiceState().mootDemanded); } catch (e) {}
    } catch (e) {}
    dailySamples.push({ d: curDay(), plots, openCases, promisesOpen, promisesSettled, crimes, mootDemanded });
  }

  await setupGame(Game);

  // ---- policy composition ----
  const base = POLICY === 'promise' ? promiser : larcenyLeaning;
  const transcripts = [];
  const ctxShared = {};
  const pol = Object.assign({}, base, {
    id: 'journey-social-r7-' + POLICY,
    setup(Game2, ctx) { ctxShared.ctx = ctx; },
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      // competent social layer: talk to one random villager properly each day
      try {
        const vv = Game2.state.village || {};
        const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
        const talked = new Set();
        const day = curDay();
        // D. pending talk requests first
        try {
          const reqs = vv.talkRequests || {};
          for (const vid of Object.keys(reqs)) { if (!talked.has(vid)) { talked.add(vid); driveOne(Game2, vid, 'D-talk-request', transcripts); break; } }
        } catch (e) {}
        if (day % 2 === 0) {
          const rest = roster.filter(vid => !talked.has(vid));
          if (rest.length) {
            const vid = rest[Math.floor(Math.random() * rest.length)];
            talked.add(vid);
            driveOne(Game2, vid, 'warmup', transcripts);
          }
        }
        ctx.socialConvs = transcripts.length;
      } catch (e) {}
      // justice-trial player votes on evidence (r6)
      try {
        const cases = (Game2.betrayalState && Game2.betrayalState().cases) || [];
        for (const c of cases) {
          if (c && c.trial && c.trial.awaitingPlayerVote && !(c.accused || []).includes(Game2.villagerId)) {
            const belief = (typeof Game2.avgBelief === 'function') ? Game2.avgBelief(c) : 0;
            const sev = ['murder', 'cannibalism', 'ambush'].includes(c.charge);
            const guilty = belief < -10 || (belief < 20 && sev);
            Game2.castPlayerVote(c.id, guilty);
            ladder.votesCast++;
          }
        }
      } catch (e) {}
      // promise span close: the vow's conversation is still open
      if (openSpan && openSpan.kind === 'promise') {
        try {
          const vv = Game2.state.village || {};
          let closed = false;
          for (const id of Object.keys(vv.roster ? {} : {})) { void id; }
          // close when the vow-holder's convo went quiet or after 3 days
          if (curDay() - openSpan.day >= 3) closed = true;
          if (closed) closeSpanAt('daycap');
        } catch (e) {}
      }
      sampleLadder();
    },
  });

  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Date.now() - t0;
  if (openSpan) closeSpanAt('run-end');
  const cen = census(Game, seed);
  const vv = Game.state.village || {};

  // end-state: promises ledger
  const promiseLedger = [];
  try {
    for (const [vid, p] of Object.entries(vv.promises || {}))
      promiseLedger.push({ who: vname(Game, vid), goal: p.goal, kept: p.kept, day: p.day });
  } catch (e) {}

  // gossip read
  let gossipChains = null;
  try {
    const g = vv.gossip || [];
    gossipChains = {
      n: g.length,
      seeds: gossip.seeds.length,
      actions: {},
      sample: g.slice(-5).map(x => ({
        action: x.action, day: x.day, distortion: x.distortion || 0, mutated: !!x.mutated,
        heard: (x.heard || []).map(h => vname(Game, h)).slice(0, 8),
      })),
    };
    for (const x of g) gossipChains.actions[x.action] = (gossipChains.actions[x.action] || 0) + 1;
  } catch (e) {}

  // full cases ledger
  let casesLedger = [];
  try {
    const bs = Game.betrayalState ? Game.betrayalState() : {};
    casesLedger = (bs.cases || []).map(c => ({
      id: c.id, charge: c.charge, status: c.status, day: c.day,
      accused: (c.accused || []).map(a => vname(Game, a)),
      accuser: c.accuser ? vname(Game, c.accuser) : null,
      verdict: c.verdict || null, resolution: c.resolution || null,
    }));
  } catch (e) {}

  // player crimes ledger
  let crimesLedger = [];
  try { crimesLedger = ((Game.justiceState && Game.justiceState().crimes) || []).map(c => ({ type: c.type, day: c.day, victim: c.victim ? vname(Game, c.victim) : null })); } catch (e) {}

  // promise spans: trim to vow moment (first 40 lines); justice spans: full
  const justiceSpans = spans.filter(s => s.kind === 'justice');
  const promiseSpans = spans.filter(s => s.kind === 'promise').map(s => ({ ...s, lines: s.lines.slice(0, 60) }));

  const evidence = {
    seed, manifest, policy: POLICY, ms: Math.round(ms / 1000) + 's',
    days: result.days, endReason: result.endReason, gameDay: curDay(),
    ladder, promises, promiseLedger,
    gossip: gossipChains, rumorStarts: gossip.rumorStarts,
    justiceSpans, promiseSpans,
    casesLedger, crimesLedger,
    fullConvs: transcripts.length,
    transcripts: transcripts.slice(-6), // last 6 full conversations (people check pool)
    census: cen,
    trustTbl: (vv.roster || []).map(vid => ({ who: vname(Game, vid), trust: trustOf(Game, vid) })).sort((a, b) => b.trust - a.trust),
    deaths: (result.samples.deaths || []).length,
    dailyLadder: dailySamples.filter((_, i) => i % 10 === 0),
  };
  return evidence;
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const seed of SEEDS) {
    console.log(`=== policy ${POLICY} seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const evidence = await oneSeed(seed);
    fs.writeFileSync(path.join(OUTDIR, `journey-social-r7-${POLICY}-${seed}.json`), JSON.stringify(evidence, null, 1));
    console.log(`day ${evidence.gameDay} endReason=${evidence.endReason} ms=${evidence.ms}`);
    console.log(`plots=${evidence.ladder.plotsArmed} cases=${evidence.ladder.casesOpened.length} playerCases=${evidence.ladder.playerCasesOpened} moots=${evidence.ladder.mootsCalled.length} verdicts=${evidence.ladder.verdicts.length} votes=${evidence.ladder.votesCast}`);
    console.log(`vows=${evidence.promises.vows.length} deflected=${evidence.promises.deflected} gossip=${evidence.gossip ? evidence.gossip.n : 0} convs=${evidence.fullConvs}`);
    console.log(evidence.census.slice(0, 4).join('\n'));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
