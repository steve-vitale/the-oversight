#!/usr/bin/env node
// journey-social-r47-20261024.js -- SOCIAL leg (leg 5), r47 (lane B).
// PRE-REGISTERED in hidden_files/evidence/2026-10-24/journey-social-r47.md
// (written before this ran).
//
// Leg question: THE INVISIBLE FRIENDSHIP — NPC-NPC friendships (bond ledger
// depth >= 2) form via meals/visits/feasts; does the player ever HEAR about
// them? Contrast with rivalries (grievances), which surface via memdepth
// grievance lines. Static read: t2gen_others 'close' picks come from v.groups
// (frozen day-1 cohorts), not the live ledger; bondGet surfaces only for
// player-NPC pairs.
//
// Seeds: 4301-4304 (fresh). Horizon: DAYCAP=140, death-aware.
// Policy: warm-competent (competent base + warm neighbor) + 3 gossip-first
// convos/day (deep mode).
// Bindings (a miss is NO-GO, never re-scored):
//   M1 formation: >=2 NPC-NPC pairs reach depth >= 2 on >=3/4 seeds by d140.
//   M2 crack: >=1 grievance where the pair's depth drops >=1 within 7d, on
//       >=2/4 seeds.
//   M3 surface asymmetry: on >=3/4 seeds with a depth>=2 NPC-NPC pair, zero
//       t2gen_others 'close' reads name a ledger depth>=2 pair (invisible)
//       AND >=1 grievance-line/'grievance'/'vgrievance' read names an NPC-NPC
//       pair on >=2/4 seeds (rival half alive).
//   M4 knack-gossip blank (lane A r26): fix landed, proof RED->GREEN, no
//       same-teller same-knack identical anecdote repeat.
//   M5 people: >=4 bond-relevant transcripts sense-read, 0 fabricated flags.
//   M6 guardrail: >=3/4 seeds end with >=5 alive, village not scattered.
// TOOLING ONLY -- no game code changes in this file.
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const OUTROOT = process.env.OUTROOT || path.join(REPO, 'evidence', '2026-10-24');
const EVIDIR = path.join(OUTROOT, 'r47');
const TDIR = path.join(EVIDIR, 'transcripts');
const SDIR = path.join(EVIDIR, 'summaries');
for (const d of [EVIDIR, TDIR, SDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 4305;
const SMOKE_DAYS = 12;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [4301, 4302, 4303, 4304]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const GOSSIP_TARGET = 3;

// writeFileFlap (infra 2026-10-19, worsened 2026-10-23): queue all output,
// flush once at end with long EPERM retries.
const pendingWrites = [];
function queueWrite(p, data) { pendingWrites.push({ p, data }); }
function flushWrites() {
  let ok = 0, lost = 0;
  for (const { p, data } of pendingWrites) {
    let done = false, last = null;
    for (let i = 0; i < 40 && !done; i++) {
      try { fs.writeFileSync(p, data); done = true; }
      catch (e) { last = e; if (!/EPERM/.test(String(e && e.message))) break; }
      if (!done) { const t0 = Date.now(); while (Date.now() - t0 < 3000) {} }
    }
    if (done) ok++;
    else {
      lost++;
      console.log(`LOST-FILE (EPERM flap outlasted 40 retries): ${p} [${String(last && last.message || '').slice(0, 80)}]`);
      console.log(`LOST-HEAD ${p}: ${String(data).slice(0, 600)}`);
    }
  }
  console.log(`FLUSH: ${ok} written, ${lost} lost to EPERM flap.`);
  return lost === 0;
}

const { mulberry32, loadGame, setupGame, runDays, manifest } = require(REPO + '/scripts/sim-harness');
const { competent } = require(REPO + '/scripts/policies/competent');

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

// --- bond serve-line matchers ---
function isCloseReadLine(text) {
  const t = String(text || '');
  return /trust .* with my pack|keeps me sane|notice if they stopped showing up/i.test(t);
}
function isGrievanceLine(text) {
  const t = String(text || '');
  return /hasn't forgiven|won't forgive|still hasn't|not.*forgiven/i.test(t);
}
function isKnackGossipLine(text) {
  const t = String(text || '');
  return /found a lost knife by smell|cuts close faster when|talks to the garden|stray dog|ate something last month|sees in the dark/i.test(t);
}

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const moodAtStart = safe(() => Game.npcMood(vid), '?');
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [], maxDeadAirStreak: 0,
    npcTurns: 0, dryLines: 0, gossipPicks: 0, comfortPicks: 0, moodAtStart,
    repeatHits: [], closeReads: 0, grievanceServes: 0, knackGossips: 0,
  };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  const seenContent = new Set();
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  const seenIds = [];
  let deadStreak = 0;
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    let pick = null;
    if (mode === 'deep') {
      if (!pick && runState.gossipPicks < GOSSIP_TARGET) {
        const g = byId(/^ask:gossip$/);
        if (g && (fresh(g) || !seenIds.some(id => id === 'ask:gossip'))) pick = g;
        if (pick) { runState.gossipPicks++; out.gossipPicks++; }
      }
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (!pick && ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
      // r47: steer one convo per day toward 'others' (t2gen_others surface).
      // The subject menu shows only 1-2 fresh t2 topics (defs order); work
      // through the queue — discussed topics drop behind, 'others' surfaces.
      if (!pick && !runState.othersDoneToday) {
        const o = byId(/^ask:others$/);
        if (o && fresh(o)) { pick = o; runState.othersDoneToday = true; }
        else {
          const c2 = safe(() => Game.convoGet(vid), null);
          if (c2 && c2.choosingSubject) {
            const t2 = choices.find(x => x && fresh(x) && /^ask:(lately|where|you|fears|neighbors|advice|oldworld|skills|systemtake|loved|personal)$/.test(String(x.id || '')));
            if (t2) pick = t2;
            else { const more = byId(/^menu:more$/); if (more) pick = more; }
          }
          if (!pick) { const subj = byId(/^(dlg:)?subject$/); if (subj && fresh(subj)) pick = subj; }
        }
      }
      if (!pick) pick = choices.find(x => String(x.id || '') === 'more');
      if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
      if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && /^(agree|joke|silence|react:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    }
    if (!pick) break;
    const pickId = String(pick.id || '');
    seenIds.push(pickId);
    if (/^dlg:(comfort|empathize|stay)$/.test(pickId)) { out.comfortPicks++; }
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try { Game.convoTurn(vid, pickId); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
    const afterLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try {
      const cc = Game.convoGet(vid);
      const tr = (cc && cc.transcript) || [];
      for (let i = beforeLen; i < tr.length; i++) {
        const e = tr[i];
        const who = (e && e.who) || (e && e.speaker) || '?';
        const text = (e && (e.text || e.line)) || '';
        if (text) {
          out.transcript.push({ who, text: String(text).slice(0, 600) });
          if (isCloseReadLine(text)) out.closeReads++;
          if (isGrievanceLine(text)) out.grievanceServes++;
          if (isKnackGossipLine(text)) out.knackGossips++;
        }
      }
      const nl = String(((tr[tr.length - 1]) || {}).text || '');
      if (/^(agree|joke|silence|react:)/.test(pickId)) { out.dryLines++; deadStreak++; out.deadAir.push({ pickId, line: nl.slice(0, 120) }); }
      else { out.npcTurns++; deadStreak = 0; }
      out.maxDeadAirStreak = Math.max(out.maxDeadAirStreak, deadStreak);
      const nrm = nl.trim().replace(/^\"+|\"+$/g, '');
      if (nrm && seenContent.has(nrm)) out.repeatHits.push({ turn: t, pickId, line: nl.slice(0, 140) });
      else if (nrm) seenContent.add(nrm);
    } catch (e) {}
  }
  if (convoLog) convoLog.push(out);
  return out;
}

async function runWorld({ seed, days, policyId }) {
  const { Game, manifest: mf } = await loadGame({ seed, mode: policyId, fullTelemetry: true });
  await setupGame(Game);
  // SMOKE ONLY: instrument test — open the trust-gated topics (ask:others
  // needs minTrust 20) so the t2pickOther wrap can prove it fires. Full
  // seeds run unmodified.
  if (String(policyId).endsWith('-smoke')) {
    try {
      const v = Game.state.village || {};
      v.trust = v.trust || {};
      for (const id of (v.roster || [])) v.trust[id] = Math.max(v.trust[id] || 10, 30);
    } catch (e) {}
  }
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const runState = { gossipPicks: 0, seed, othersDoneToday: false };
  const t2picks = [];      // every t2pickOther call: {day, vid, id, why}
  const grievances = [];   // every recordGrievance: {day, by, against, kind, severity}
  const bondSnaps = [];    // every-5d bond census
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  // r47 wraps: t2pickOther (the 'close' surface) + recordGrievance (crack events).
  try {
    const origPick = Game.t2pickOther;
    if (typeof origPick === 'function') {
      Game.t2pickOther = function (vid) {
        let r = null;
        try { r = origPick.apply(this, arguments); } catch (e) {}
        try {
          if (r && r.id) t2picks.push({ day: curDay(), vid: String(vid), vidName: vname(Game, vid), id: String(r.id), idName: vname(Game, r.id), why: r.why || '?' });
        } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
  try {
    const origGr = Game.recordGrievance;
    if (typeof origGr === 'function') {
      Game.recordGrievance = function (by, against, kind, severity) {
        let r = null;
        try { r = origGr.apply(this, arguments); } catch (e) {}
        try { grievances.push({ day: curDay(), by: String(by), byName: vname(Game, by), against: String(against), againstName: vname(Game, against), kind: kind || '?', severity: severity || 15 }); } catch (e) {}
        return r;
      };
    }
  } catch (e) {}

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  function trustOf(vid) { try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; } }

  // r47: bond census — every 5 days + final. NPC-NPC pairs and player pairs.
  function snapshotBonds(final) {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const sid = me();
      const pairs = [], playerPairs = [];
      for (const k of Object.keys(v.bonds || {})) {
        const bnd = v.bonds[k] || {};
        const [a, b] = String(k).split('|');
        const rec = { k, a, aName: vname(Game, a), b, bName: vname(Game, b), v: bnd.v || 0, depth: bnd.depth || 0 };
        if (a === sid || b === sid) playerPairs.push(rec); else pairs.push(rec);
      }
      bondSnaps.push({ day: d, final: !!final, pairs, playerPairs });
    } catch (e) {}
  }

  const talkedToday = new Set();
  function socialConvo() {
    const day = curDay();
    runState.othersDoneToday = false;
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    for (let n = 0; n < 3; n++) {
      const pool = living.filter(id => !talkedToday.has(id));
      const arr = pool.length ? pool : living;
      const target = arr[(day * 7 + n * 5) % arr.length];
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      driveOne(Game, target, 'bond-daily-' + (n + 1), 'deep', convoLog, runState);
    }
  }
  function resetTalkLedger() { talkedToday.clear(); }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      resetTalkLedger();
      if (base.daily) base.daily(Game2, ctx);
      socialConvo();
      try { if (curDay() % 5 === 0) snapshotBonds(false); } catch (e) {}
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay(), cause: cp.cause || 'unknown' });
      }
    },
  });
  const result = await runDays(Game, pol, { days, manifest: mf });
  snapshotBonds(true);

  // --- bond trajectory analysis ---
  const pairHist = {};   // key -> [{day, v, depth}]
  for (const s of bondSnaps) for (const p of s.pairs) {
    (pairHist[p.k] = pairHist[p.k] || []).push({ day: s.day, v: p.v, depth: p.depth });
  }
  const npcPairs = Object.keys(pairHist).map(k => {
    const h = pairHist[k];
    const maxDepth = Math.max(...h.map(x => x.depth));
    const minDepth = Math.min(...h.map(x => x.depth));
    const maxV = Math.max(...h.map(x => x.v));
    const firstDeep2 = h.find(x => x.depth >= 2);
    return {
      k, aName: h[0] && pairHist[k] ? undefined : undefined,
      maxDepth, minDepth, maxV,
      firstDeep2Day: firstDeep2 ? firstDeep2.day : null,
      finalDepth: h[h.length - 1].depth, finalV: h[h.length - 1].v,
      dropped: maxDepth - h[h.length - 1].depth,   // how much depth was lost
    };
  });
  // attach names
  const nameOf = {};
  for (const s of bondSnaps) for (const p of s.pairs) { nameOf[p.a] = p.aName; nameOf[p.b] = p.bName; }
  for (const np of npcPairs) { const [a, b] = np.k.split('|'); np.aName = nameOf[a] || a; np.bName = nameOf[b] || b; }
  const deep2Pairs = npcPairs.filter(p => p.maxDepth >= 2);
  // grievance -> depth drop within 7d (M2)
  const cracks = [];
  for (const g of grievances) {
    const k = Game.bondKey ? safe(() => Game.bondKey(g.by, g.against), g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by) : (g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by);
    const h = pairHist[k];
    if (!h) continue;
    const before = h.filter(x => x.day <= g.day).slice(-1)[0];
    const after = h.filter(x => x.day > g.day && x.day <= g.day + 7).slice(-1)[0];
    if (before && after && after.depth <= before.depth - 1) {
      cracks.push({ day: g.day, byName: g.byName, againstName: g.againstName, kind: g.kind, depthBefore: before.depth, depthAfter: after.depth });
    }
  }
  // 'close' reads naming ledger pairs (M3): for each t2pick with why=close,
  // look up the pair's ledger depth AT THAT DAY.
  const closeReads = [];
  for (const tp of t2picks) {
    if (tp.why !== 'close') continue;
    const k = tp.vid < tp.id ? tp.vid + '|' + tp.id : tp.id + '|' + tp.vid;
    const h = pairHist[k];
    let ledgerDepth = null, ledgerV = null;
    if (h) {
      const at = h.filter(x => x.day <= tp.day).slice(-1)[0] || h[0];
      ledgerDepth = at.depth; ledgerV = at.v;
    }
    closeReads.push({ day: tp.day, vidName: tp.vidName, idName: tp.idName, why: tp.why, ledgerDepth, ledgerV });
  }
  const grievReads = t2picks.filter(tp => tp.why === 'grievance' || tp.why === 'vgrievance');
  const closeReadsTotal = convoLog.reduce((s, o) => s + o.closeReads, 0);
  const grievanceServesTotal = convoLog.reduce((s, o) => s + o.grievanceServes, 0);
  const knackGossipsTotal = convoLog.reduce((s, o) => s + o.knackGossips, 0);
  const knackLines = [];
  for (const o of convoLog) for (const e of o.transcript) if (isKnackGossipLine(e.text)) knackLines.push({ seedDay: o.day, convo: o.name, text: e.text });

  const v = Game.state.village || {};
  let mootsConvened = 0;
  try { mootsConvened = (v.moots || []).length; } catch (e) {}
  const deathCauses = {};
  for (const d of deaths) { const k = String(d.cause || 'unknown'); deathCauses[k] = (deathCauses[k] || 0) + 1; }
  const repeatHits = [];
  for (const o of convoLog) for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line });
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  return {
    seed, days: curDay(), deaths, deathCauses, alive: livingIds().length,
    convos: convoLog.length, deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    gossipPicks: runState.gossipPicks,
    t2picksTotal: t2picks.length, closeReadsTotal, closeReads,
    grievReads: grievReads.map(g => ({ day: g.day, vidName: g.vidName, idName: g.idName, why: g.why })),
    grievanceServesTotal, grievances, cracks,
    knackGossipsTotal, knackLines,
    npcPairCount: npcPairs.length, deep2Pairs,
    bondSnapDays: bondSnaps.length,
    mootsConvened,
    l3: { bonds: npcPairs.length, deep2: deep2Pairs.length, cracks: cracks.length, t2picks: t2picks.length, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    repeatCount: repeatHits.length, repeats: repeatHits.slice(0, 20),
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    endState: {
      over: !!Game.over, villageLost: !!Game.villageLost,
      scattered: !!((Game.state.village || {}).scattered),
      extinct: !!((Game.state.village || {}).extinct),
      scholarExiled: !!((Game.state.scholar || {}).exiled),
      scholarDead: !!((safe(() => Game.getPerson(me()), null) || {}).dead),
    },
    _convoLog: convoLog,
  };
}

(async () => {
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: bond census + t2pickOther wrap + grievance wrap + convos)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, policyId: 'journey-social-r47-smoke' });
  console.log(`SMOKE: bondSnapDays=${smoke.bondSnapDays} convos=${smoke.convos} t2picks=${smoke.t2picksTotal} grievances=${smoke.grievances.length} npcPairs=${smoke.npcPairCount}`);
  const realTest = smoke.bondSnapDays >= 2 && smoke.convos > 0 && smoke.t2picksTotal > 0;
  console.log(`SMOKE SELF-TEST: ${realTest ? 'PASS (bond census live, t2pickOther wrap firing, convos ran)' : 'FAIL (instrument broken — investigate before full seeds)'}`);
  if (!realTest) { console.log('ABORT: instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, policyId: 'journey-social-r47' });
      const convoLog = r._convoLog; delete r._convoLog;
      queueWrite(path.join(EVIDIR, `journey-social-r47-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r47 sense-read set: bond-relevant convos (close reads / grievance
      // serves / knack gossips) + 1 late convo per seed.
      const bondy = convoLog.filter(o => o.closeReads > 0 || o.grievanceServes > 0 || o.knackGossips > 0).slice(0, 3);
      (bondy.length ? bondy : convoLog.filter(o => o.mode === 'deep' && o.turns >= 4).slice(0, 2)).forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-bondy-${i + 1}-${sname(o)}.txt`),
          [`# INVISIBLE FRIENDSHIP sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart}, closeReads=${o.closeReads} grievanceServes=${o.grievanceServes} knackGossips=${o.knackGossips})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const lates = convoLog.filter(o => o.mode === 'deep' && o.day >= 100 && o.turns >= 5).slice(0, 1);
      (lates.length ? lates : convoLog.filter(o => o.mode === 'deep' && o.turns >= 5).slice(-1)).forEach((o) => {
        queueWrite(path.join(TDIR, `s${s}-late-d${o.day}-${sname(o)}.txt`),
          [`# INVISIBLE FRIENDSHIP late sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // bond ledger summary
      const lines = [`# THE INVISIBLE FRIENDSHIP — seed ${s} (${r.days}d, ${r.alive} alive)`, ''];
      lines.push(`npcPairs=${r.npcPairCount} deep2=${r.deep2Pairs.length} cracks=${r.cracks.length} t2picks=${r.t2picksTotal} closeReadsServed=${r.closeReadsTotal} grievanceServes=${r.grievanceServesTotal}`);
      for (const p of r.deep2Pairs) {
        lines.push(`  FRIEND d${p.firstDeep2Day}: ${p.aName} <> ${p.bName} — maxDepth ${p.maxDepth}, final ${p.finalDepth} (v=${p.finalV}), dropped ${p.dropped}`);
      }
      for (const c of r.cracks) {
        lines.push(`  CRACK d${c.day}: ${c.byName} vs ${c.againstName} (${c.kind}) depth ${c.depthBefore} -> ${c.depthAfter}`);
      }
      for (const cr of r.closeReads) {
        lines.push(`  CLOSE-READ d${cr.day}: ${cr.vidName} about ${cr.idName} — ledger depth=${cr.ledgerDepth} v=${cr.ledgerV}${cr.ledgerDepth === null ? ' (no ledger pair!)' : ''}`);
      }
      for (const g of r.grievReads.slice(0, 6)) {
        lines.push(`  GRIEV-READ d${g.day}: ${g.vidName} about ${g.idName} (why=${g.why})`);
      }
      for (const k of r.knackLines.slice(0, 8)) {
        lines.push(`  KNACK d${k.seedDay} ${k.convo}: ${k.text.slice(0, 120)}`);
      }
      lines.push('', `deathCauses: ${JSON.stringify(r.deathCauses)}`);
      queueWrite(path.join(SDIR, `s${s}-friendship-summary.txt`), lines.join('\n') + '\n');
      results.push(r);
      console.log(`SEED ${s}: ${r.days}d alive=${r.alive} deep2=${r.deep2Pairs.length} cracks=${r.cracks.length} t2picks=${r.t2picksTotal} closeReads=${r.closeReadsTotal} grievServes=${r.grievanceServesTotal} knack=${r.knackGossipsTotal}`);
    } catch (e) {
      console.log(`SEED ${s} FAILED: ${e && e.message}`);
    }
  }
  const verd = results.map(r => ({
    seed: r.seed, alive: r.alive, deep2: r.deep2Pairs.length, cracks: r.cracks.length,
    t2picks: r.t2picksTotal, closeReads: r.closeReads.length, grievReads: r.grievReads.length,
    knack: r.knackGossipsTotal,
  }));
  queueWrite(path.join(EVIDIR, 'r47-verdicts.json'), JSON.stringify(verd, null, 1));
  flushWrites();
  console.log('DONE r47.');
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
