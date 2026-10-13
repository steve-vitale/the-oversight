#!/usr/bin/env node
// journey-social-r9-talk-20261013.js — LEG 5 SOCIAL LIFE, r9 (village journey sim loop).
// Three blanks r8 left open:
//   BLANK 1 — NPC-initiated talk requests (v.talkRequests): does any NPC
//     request to talk during NATURAL play, or is it unfireable? Instrument
//     talkReason (creation), expireTalkRequests (rot), and daily scans.
//   BLANK 2 — the NPC-asks-YOU arc: six canon questions; first conversation
//     always includes one; answers in conv.answered, referenced later
//     ("You told me you're from..."). Does asked -> answered -> referenced
//     fire end-to-end in natural play? Capture one COMPLETE arc's transcript
//     and sense-judge it.
//   BLANK 3 — NPC-NPC relationship arcs: do villager pairs develop measurable
//     friendship/rivalry movement, or is the village spokes-around-the-player?
//     Instrument bondAdd + npcMootTick; record top-5 pair movements + causes.
// Output: evidence/2026-10-13/journey-social-r9-talk-<seed>.json
// Usage: SEEDS=505,606,707,808 DAYCAP=100 node scripts/journey-social-r9-talk-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [505, 606, 707, 808]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { socialite } = require('./policies/socialite');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-13');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }

// --- conversation driver: one full exchange per villager (r7 driveOne pattern,
// prefers gq: questions; ans: question answers take precedence when the NPC
// asks — the two never co-occur in choices) ---
function driveOne(Game, vid, tag, convoLog) {
  const day = (() => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } })();
  const out = {
    vid, tag, day, turns: 0, naturalEnd: false,
    asked: [],        // {qid, askLine, offers[]}
    answered: [],     // {qid, aid}
    transcript: [],
  };
  const askedSet = new Set();
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  const askLineOf = () => {
    try {
      const c = Game.convoGet(vid);
      const tr = (c && c.transcript) || [];
      for (let i = tr.length - 1; i >= 0; i--) {
        if (tr[i].who !== 'you' && tr[i].text) return String(tr[i].text);
      }
    } catch (e) {}
    return '';
  };
  for (let t = 0; t < 12; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    // blank-2 probe: was a bespoke question offered?
    const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
    if (ansChoices.length) {
      const qid = String(ansChoices[0].id).split(':')[1];
      if (!askedSet.has(qid)) {
        askedSet.add(qid);
        out.asked.push({ qid, askLine: askLineOf().slice(0, 300), offers: ansChoices.map(x => String(x.id).split(':')[2]) });
      }
    }
    let pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices[0];
    if (!pick) break;
    const pid = String(pick.id || '');
    if (/^ans:/.test(pid) && !/honest_pass/.test(pid)) {
      const parts = pid.split(':');
      out.answered.push({ qid: parts[1], aid: parts[2] });
    }
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  try {
    const c = Game.convoGet(vid);
    const tr = ((c && c.transcript) || []);
    out.transcript = tr.map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '') }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function oneSeed(seed) {
  const t0 = Date.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r9', fullTelemetry: true });
  const curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

  // ---- BLANK 1 instrumentation ----
  const talk = { fired: [], expired: 0, answered: [], seededAtSetup: [] };
  try {
    const _tr = Game.talkReason;
    Game.talkReason = function (rid) {
      const r = _tr.apply(this, arguments);
      if (r && r.line) talk.fired.push({ day: curDay(), vid: vname(Game, rid), line: String(r.line).replaceAll('__NAME__', '<NAME>').slice(0, 160) });
      return r;
    };
  } catch (e) {}
  try {
    const _ex = Game.expireTalkRequests;
    Game.expireTalkRequests = function () {
      let before = 0, after = 0;
      try { before = Object.keys((this.state.village || {}).talkRequests || {}).length; } catch (e) {}
      const r = _ex.apply(this, arguments);
      try { after = Object.keys((this.state.village || {}).talkRequests || {}).length; } catch (e) {}
      talk.expired += Math.max(0, before - after);
      return r;
    };
  } catch (e) {}
  const dailyTalkScan = [];
  function scanTalk() {
    let n = 0, undel = 0;
    try {
      const reqs = (Game.state.village || {}).talkRequests || {};
      const keys = Object.keys(reqs); n = keys.length;
      for (const k of keys) if (!reqs[k].delivered) undel++;
    } catch (e) {}
    dailyTalkScan.push({ d: curDay(), pending: n, undelivered: undel });
  }

  // ---- BLANK 2 instrumentation ----
  const qa = { askedTotal: 0, answeredTotal: 0, recallHits: [], perQid: {}, firstConvoHadQuestion: {} };
  function bumpQid(qid, field) {
    qa.perQid[qid] = qa.perQid[qid] || { asked: 0, answered: 0, recalled: 0 };
    qa.perQid[qid][field]++;
  }
  // full convo texts kept in memory for arc assembly
  const convoLog = [];
  const seenVid = new Set();
  function driveConvos() {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    for (const vid of roster) {
      const reqs = vv.talkRequests || {};
      const tag = (reqs[vid] && !reqs[vid].delivered) ? 'D-talk-request' : 'warmup';
      const out = driveOne(Game, vid, tag, convoLog);
      if (tag === 'D-talk-request' && !out.error) talk.answered.push({ day: out.day, vid: vname(Game, vid) });
      if (!seenVid.has(vid)) {
        seenVid.add(vid);
        qa.firstConvoHadQuestion[vid] = out.asked.length > 0;
      }
      for (const a of out.asked) { qa.askedTotal++; bumpQid(a.qid, 'asked'); }
      for (const a of out.answered) { qa.answeredTotal++; bumpQid(a.qid, 'answered'); }
      // recall detection: "You told me ..." opener in this convo's transcript
      for (const e of out.transcript) {
        if (e.who === 'NPC' && /You told me/i.test(e.text)) {
          const qid = /you're from|from \{region\}|from /.test(e.text) ? 'q_origin'
            : /watch what you do/.test(e.text) ? 'q_trust' : 'unknown';
          qa.recallHits.push({ day: out.day, vid: vname(Game, vid), qid, text: e.text.slice(0, 300) });
          bumpQid(qid, 'recalled');
        }
      }
    }
  }

  // ---- BLANK 3 instrumentation ----
  const npcPairs = { bondEvents: [], mootTicks: 0, npcMoots: [] };
  try {
    const _ba = Game.bondAdd;
    Game.bondAdd = function (a, b, dv, reason) {
      const r = _ba.apply(this, arguments);
      try { npcPairs.bondEvents.push({ day: curDay(), a: String(a), b: String(b), an: vname(Game, a), bn: vname(Game, b), dv, reason }); } catch (e) {}
      return r;
    };
  } catch (e) {}
  try {
    const _mt = Game.npcMootTick;
    Game.npcMootTick = function () { npcPairs.mootTicks++; return _mt.apply(this, arguments); };
  } catch (e) {}
  try {
    const _cm = Game.callMoot;
    Game.callMoot = function (caseId, byId) {
      const r = _cm.apply(this, arguments);
      try {
        if (byId && byId !== this.villagerId) npcPairs.npcMoots.push({ day: curDay(), caseId, by: vname(Game, byId) });
      } catch (e) {}
      return r;
    };
  } catch (e) {}
  const bondsSnap = [];
  function scanBonds() {
    const b = {};
    try {
      for (const [k, v] of Object.entries((Game.state.village || {}).bonds || {})) {
        const [a, bb] = k.split('|');
        b[k] = { a: vname(Game, a), b: vname(Game, bb), v: v.v || 0, depth: v.depth || 0 };
      }
    } catch (e) {}
    bondsSnap.push({ d: curDay(), n: Object.keys(b).length, pairs: b });
  }

  await setupGame(Game);
  // seeded talk request (betrayal.js day-1) is created at setup
  try {
    for (const [rid, t] of Object.entries((Game.state.village || {}).talkRequests || {}))
      talk.seededAtSetup.push({ vid: vname(Game, rid), line: String(t.line || '').replaceAll('__NAME__', '<NAME>').slice(0, 160) });
  } catch (e) {}
  scanBonds();

  const pol = Object.assign({}, socialite, {
    id: 'journey-social-r9',
    daily(Game2, ctx) {
      if (socialite.daily) socialite.daily(Game2, ctx);
      driveConvos();
      scanTalk();
      if (curDay() % 10 === 0) scanBonds();
      ctx.socialConvs = convoLog.length;
    },
  });

  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Date.now() - t0;
  scanBonds();

  // ---- bonds reason histogram + negative-event scan ----
  const bondReasons = {}, bondNeg = [];
  for (const ev of npcPairs.bondEvents) {
    bondReasons[ev.reason] = (bondReasons[ev.reason] || 0) + 1;
    if (ev.dv < 0) bondNeg.push({ day: ev.day, pair: ev.an + ' | ' + ev.bn, dv: ev.dv, reason: ev.reason });
  }
  const nBondPairs = (() => { try { return Object.keys((Game.state.village || {}).bonds || {}).length; } catch (e) { return 0; } })();

  // ---- arc assembly: prefer q_origin (a_tell), else q_trust ----
  let arc = null;
  const recallConvo = {};
  for (const c of convoLog) {
    for (const e of c.transcript) {
      if (e.who === 'NPC' && /You told me/i.test(e.text)) {
        const key = c.vid + '|';
        const qid = /from /.test(e.text) ? 'q_origin' : /watch what you do/.test(e.text) ? 'q_trust' : 'unknown';
        (recallConvo[c.vid + ':' + qid] = recallConvo[c.vid + ':' + qid] || []).push({ day: c.day, transcript: c.transcript });
      }
    }
  }
  outer:
  for (const wantQ of ['q_origin', 'q_trust']) {
    for (const c of convoLog) {
      const asked = c.asked.find(a => a.qid === wantQ);
      const answered = c.answered.find(a => a.qid === wantQ);
      if (asked && answered) {
        const rc = recallConvo[c.vid + ':' + wantQ];
        if (rc && rc.length) {
          arc = {
            qid: wantQ, vid: vname(Game, c.vid), askDay: c.day, answer: answered,
            askConvo: { day: c.day, tag: c.tag, transcript: c.transcript },
            recallDay: rc[0].day, recallConvo: { day: rc[0].day, transcript: rc[0].transcript },
          };
          break outer;
        }
      }
    }
  }

  // ---- bonds top-5 ----
  const pairAgg = {};
  const keyOf = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  for (const ev of npcPairs.bondEvents) {
    const k = keyOf(ev.a, ev.b);
    const p = pairAgg[k] || (pairAgg[k] = { pair: k, events: 0, pos: 0, neg: 0, reasons: {} });
    p.events++; if (ev.dv > 0) p.pos += ev.dv; else p.neg += ev.dv;
    p.reasons[ev.reason] = (p.reasons[ev.reason] || 0) + 1;
  }
  const finalBonds = [];
  try {
    for (const [k, v] of Object.entries((Game.state.village || {}).bonds || {})) {
      const [a, b] = k.split('|');
      finalBonds.push({ key: k, pair: vname(Game, a) + ' | ' + vname(Game, b), v: v.v || 0, depth: v.depth || 0 });
    }
  } catch (e) {}
  const top5 = finalBonds.sort((x, y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, 5).map(f => ({
    pair: f.pair, v: f.v, depth: f.depth,
    movement: (() => { const p = pairAgg[f.key]; return p ? { events: p.events, gained: p.pos, lost: p.neg, reasons: p.reasons } : { events: 0 }; })(),
  }));
  const conflicts = [];
  try {
    for (const cf of ((Game.state.village || {}).conflicts || [])) conflicts.push({ a: vname(Game, cf.a), b: vname(Game, cf.b), tension: cf.tension });
  } catch (e) {}

  // census
  const cen = [];
  const vv = Game.state.village || {};
  for (const vid of (vv.roster || [])) {
    let p = {}; try { p = Game.getPerson(vid) || {}; } catch (e) {}
    cen.push(vname(Game, vid) + ' (' + (p.occupationId || p.formerOccupation || 'no occ') + ')');
  }
  const fallen = (vv.fallen || []).length;

  // compact convo log (truncate text for JSON)
  const compactLog = convoLog.map(c => ({
    vid: vname(Game, c.vid), day: c.day, tag: c.tag, turns: c.turns, naturalEnd: c.naturalEnd,
    asked: c.asked.map(a => ({ qid: a.qid, offers: a.offers })),
    answered: c.answered,
    transcript: c.transcript.map(e => ({ who: e.who, text: e.text.slice(0, 250) })),
  }));

  const evidence = {
    seed, manifest, ms: Math.round(ms / 1000) + 's',
    days: result.days, endReason: result.endReason, gameDay: curDay(),
    talk, dailyTalkScan: dailyTalkScan.filter((_, i) => i % 5 === 0),
    qa: { askedTotal: qa.askedTotal, answeredTotal: qa.answeredTotal, perQid: qa.perQid, recallHits: qa.recallHits, firstConvoQuestion: qa.firstConvoHadQuestion },
    arc,
    npcPairs: {
      bondEvents: npcPairs.bondEvents.length, bondReasons, bondNeg: bondNeg.slice(0, 10), nBondPairs,
      mootTicks: npcPairs.mootTicks, npcMoots: npcPairs.npcMoots,
      top5, conflicts: conflicts.slice(0, 8),
    },
    bondsSnapCount: bondsSnap.length,
    convosDriven: convoLog.length,
    convos: compactLog.slice(-8),
    roster: cen, fallen, deaths: (result.samples.deaths || []).length,
  };
  return evidence;
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const seed of SEEDS) {
    console.log(`=== seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const evidence = await oneSeed(seed);
    fs.writeFileSync(path.join(OUTDIR, `journey-social-r9-talk-${seed}.json`), JSON.stringify(evidence, null, 1));
    console.log(`day ${evidence.gameDay} endReason=${evidence.endReason} ms=${evidence.ms}`);
    console.log(`talkRequests: fired=${evidence.talk.fired.length} expired=${evidence.talk.expired} answered=${evidence.talk.answered.length} seeded=${evidence.talk.seededAtSetup.length}`);
    console.log(`Q&A: asked=${evidence.qa.askedTotal} answered=${evidence.qa.answeredTotal} recalls=${evidence.qa.recallHits.length} arc=${evidence.arc ? evidence.arc.qid + ' ' + evidence.arc.vid : 'NONE'}`);
    console.log(`bonds: events=${evidence.npcPairs.bondEvents} pairs=${evidence.npcPairs.top5.length} npcMoots=${evidence.npcPairs.npcMoots.length} mootTicks=${evidence.npcPairs.mootTicks}`);
    console.log('perQid:', JSON.stringify(evidence.qa.perQid));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
