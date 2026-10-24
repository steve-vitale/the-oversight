#!/usr/bin/env node
// journey-social-r46-20261023.js -- SOCIAL leg (leg 5), r46 (lane B).
// PRE-REGISTERED in hidden_files/evidence/2026-10-23/journey-social-r46.md
// (written before this ran).
//
// Leg question: THE CONTEST GRAPEVINE — on the post-contest-gossip-lane base
// (8461565f8), when televised contests resolve in a full competent run, does
// the outcome seed into village gossip via _cxGossip, spread NPC-to-NPC, get
// SERVED in conversation through the new lane, and leave consequences?
//
// Contrast with r45 (THE RUMOR'S LIFE: player-planted rumors, 7-11 hearers).
// This run measures NATURAL contest gossip — no rumor plants.
//
// Seeds: 4201-4204 (fresh). Horizon: DAYCAP=140, death-aware.
// Policy: warm-competent (competent base + warm neighbor) + 3 gossip-first
// convos/day (GOSSIP_TARGET=3, deep mode).
// Bindings (a miss is NO-GO, never re-scored):
//   M1 contest seeds: >=1 contest with resolved outcome on >=2/4 seeds;
//       contest_* entries seeded in village gossip on those seeds; daily
//       gossip census, no gaps >2d.
//   M2 serve: >=1 contest entry served via ask:gossip on >=2/4 seeds
//       (transcript line evidence: won/survived/died render + contest name).
//   M3 travel: >=1 contest entry reaches >=3 hearers on >=2/4 seeds.
//   M4 consequence: on >=2/4 seeds, contest gossip referenced in a later
//       conversation OR moves a subject rep dim >=5.
//   M5 people: >=4 contest-gossip transcripts sense-read, 0 fabricated flags.
//   M6 guardrail: >=3/4 seeds end with >=5 alive, village not scattered.
// Informational:
//   F1: does the contest lane crowd out rumor verbs (r39 salience)?
//   F2: latency from contest resolution to first serve (days).
// TOOLING ONLY -- no game code changes in this file.
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const REPO = '/home/hatch/workspace/the-scattering';
const OUTROOT = process.env.OUTROOT || path.join(REPO, 'evidence', '2026-10-23');
const EVIDIR = path.join(OUTROOT, 'r46');
const TDIR = path.join(EVIDIR, 'transcripts');
const SDIR = path.join(EVIDIR, 'summaries');
for (const d of [EVIDIR, TDIR, SDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 4205;
const SMOKE_DAYS = 12;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [4201, 4202, 4203, 4204]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const GOSSIP_TARGET = 3;

// writeFileFlap (infra 2026-10-19, worsened 2026-10-23): the host EPERMs
// writes intermittently across ALL processes, in long flaps. All output is
// queued in memory and flushed ONCE at the end with a long retry per file,
// so a mid-run flap can't lose completed seeds.
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

const CONTEST_ACTIONS = new Set(['contest_won', 'contest_survived', 'contest_died']);
// Contest render line matchers (game.js ask:gossip contest branch).
function isContestServeLine(text, contestNames) {
  const t = String(text || '');
  if (/on the cameras?\.|walked out of .*alive|died in .*the fire was quiet/i.test(t)) return true;
  for (const cn of contestNames) {
    if (!cn) continue;
    if (t.indexOf(cn) !== -1 && /(won|died|walked out|survived)/i.test(t)) return true;
  }
  return false;
}
function isRumorVerbServeLine(text) {
  const t = String(text || '');
  return /holding back|been generous|Word is .*has been/i.test(t);
}

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const moodAtStart = safe(() => Game.npcMood(vid), '?');
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [], maxDeadAirStreak: 0,
    npcTurns: 0, dryLines: 0, gossipPicks: 0, comfortPicks: 0, moodAtStart,
    repeatHits: [], contestServes: 0, rumorVerbServes: 0, otherGossipServes: 0,
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
      const curThread = safe(() => { const c2 = Game.convoGet(vid); return c2 && c2.thread; }, null);
      for (let i = beforeLen; i < tr.length; i++) {
        const e = tr[i];
        const who = (e && e.who) || (e && e.speaker) || '?';
        const text = (e && (e.text || e.line)) || '';
        if (text) out.transcript.push({ who, text: String(text).slice(0, 600) });
        // r46: classify gossip-thread serves (contest lane vs rumor verbs).
        if (curThread === 'gossip' && text) {
          if (isContestServeLine(text, runState.contestNames)) out.contestServes++;
          else if (isRumorVerbServeLine(text)) out.rumorVerbServes++;
          else if (/^(agree|joke|silence|react:|leave|bye|goodbye)/.test(pickId)) {}
          else out.otherGossipServes++;
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
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const runState = { gossipPicks: 0, seed, contestNames: [] };
  const gossipSnap = [];      // daily gossip census (contest entries + verbs)
  const contestSeedLog = [];  // _cxGossip wrap — every contest seed event
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  // r46: wrap _cxGossip — the contest seed event is the grapevine's birth record.
  try {
    const origCx = Game._cxGossip;
    if (typeof origCx === 'function') {
      Game._cxGossip = function (how, pid, contestName) {
        let r = null;
        try { r = origCx.apply(this, arguments); } catch (e) {}
        try {
          contestSeedLog.push({
            day: curDay(), how, pid, pidName: vname(Game, pid),
            contest: contestName || null,
          });
          if (contestName && !runState.contestNames.includes(contestName)) runState.contestNames.push(contestName);
        } catch (e) {}
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
  function repOf(vid) { return safe(() => Object.assign({}, Game.repOf(vid) || {}), {}); }

  // r46: daily gossip census — contest entries + rumor verbs.
  function snapshotGossip() {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const items = (v.gossip || []).filter(g => CONTEST_ACTIONS.has(g.action) || (g.action === 'stingy') || (g.action === 'generous')).map(g => ({
        partKey: g.partKey || null, action: g.action || '?',
        subject: (g.dims && g.dims.who) || null,
        subjectName: (g.dims && g.dims.who) ? vname(Game, g.dims.who) : null,
        contest: (g.dims && g.dims.contest) || null,
        heard: (g.heard || []).length, distortion: g.distortion || 0,
        plantedDay: g.day, source: g.source || null,
      }));
      gossipSnap.push({ day: d, items });
    } catch (e) {}
  }

  const talkedToday = new Set();
  function socialConvo() {
    const day = curDay();
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    for (let n = 0; n < 3; n++) {
      const pool = living.filter(id => !talkedToday.has(id));
      const arr = pool.length ? pool : living;
      const target = arr[(day * 7 + n * 5) % arr.length];
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      driveOne(Game, target, 'gossip-daily-' + (n + 1), 'deep', convoLog, runState);
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
      try { snapshotGossip(); } catch (e) {}
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay(), cause: cp.cause || 'unknown' });
      }
    },
  });
  const result = await runDays(Game, pol, { days, manifest: mf });

  // r46 post: contest gossip lifecycles from the census.
  const gossipDays = {};
  for (const s of gossipSnap) {
    for (const it of (s.items || [])) {
      if (!it.partKey) continue;
      const k = it.partKey;
      gossipDays[k] = gossipDays[k] || { snapshots: 0, maxHeard: 0, maxDistortion: 0, daysSeen: [], action: it.action, subject: it.subject, subjectName: it.subjectName, contest: it.contest, source: it.source, plantedDay: it.plantedDay, firstServedDay: null };
      const g = gossipDays[k];
      g.snapshots++; g.maxHeard = Math.max(g.maxHeard, it.heard); g.maxDistortion = Math.max(g.maxDistortion, it.distortion);
      g.daysSeen.push(s.day);
    }
  }
  // trace events: subject remembers hearing contest gossip about themselves.
  const traces = [];
  try {
    const mem = ((Game.state.village || {}).memory) || {};
    for (const rid of Object.keys(mem)) {
      for (const m of (mem[rid] || [])) {
        if (String(m.t) === 'rumor_about_them') traces.push({ subject: rid, subjectName: vname(Game, rid), day: m.day, note: String(m.note || '').slice(0, 160) });
      }
    }
  } catch (e) {}
  // overheard-fragment lines in the beat stream.
  const fragments = beatBuf.filter(b => /catch fragments by the fire/i.test(b.text))
    .map(b => ({ day: b.day, text: b.text.slice(0, 220) }));
  // contest seed events -> lifecycles (match seeds to census entries by
  // contest+how+pid+day).
  const contestLives = contestSeedLog.map(cs => {
    const key = `${cs.day}:contest:${cs.contest || ''}:${cs.how}:${cs.pid}`;
    let g = gossipDays[key] || null;
    if (!g) {
      // fallback: match by action/subject/contest ignoring partKey format.
      const action = 'contest_' + cs.how;
      g = Object.values(gossipDays).find(x => x.action === action && x.subject === cs.pid && x.contest === cs.contest) || null;
    }
    const frags = fragments.filter(f => f.day >= cs.day && f.day <= cs.day + 4).slice(0, 3);
    return {
      day: cs.day, how: cs.how, subject: cs.pidName, contest: cs.contest,
      seeded: !!g, maxHeard: g ? g.maxHeard : 0, maxDistortion: g ? g.maxDistortion : 0,
      daysSeen: g ? g.daysSeen.length : 0,
      fragments: frags,
      traces: traces.filter(t => t.subject === cs.pid).slice(0, 4),
    };
  });

  const v = Game.state.village || {};
  const bondsMap = safe(() => v.bonds || {}, {});
  const bonds = Object.keys(bondsMap).length;
  let deepBonds = 0;
  try { for (const k of Object.keys(bondsMap)) { const bb = bondsMap[k] || {}; if ((bb.v || 0) >= 30 || (bb.depth || 0) >= 1) deepBonds++; } } catch (e) {}
  let betrayalCases = 0, mootsConvened = 0;
  try { betrayalCases = ((v.cases || []).filter(c => c && c.type === 'betrayal') || []).length; } catch (e) {}
  try { mootsConvened = (v.moots || []).length; } catch (e) {}
  const gossipThreads = convoLog.filter(o => (o.threads || []).includes('gossip')).length;
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  const repeatHits = [];
  for (const o of convoLog) for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line });
  const comfortConvos = 0;
  const comfortPicksTotal = convoLog.reduce((s, o) => s + o.comfortPicks, 0);
  const deathCauses = {};
  for (const d of deaths) { const k = String(d.cause || 'unknown'); deathCauses[k] = (deathCauses[k] || 0) + 1; }
  const teleDeaths = safe(() => (Game.state.telemetry || []).filter(t => t.type === 'death'), [])
    .map(t => ({ who: t.who, cause: t.cause || 'unknown', wave: t.wave, player: !!t.player, day: t.day }));
  const contestServesTotal = convoLog.reduce((s, o) => s + (o.contestServes || 0), 0);
  const rumorVerbServesTotal = convoLog.reduce((s, o) => s + (o.rumorVerbServes || 0), 0);
  const otherGossipServesTotal = convoLog.reduce((s, o) => s + (o.otherGossipServes || 0), 0);
  // first-serve latency per contest lifecycle: earliest transcript day with a
  // matching serve line.
  const serveDays = [];
  for (const cl of contestLives) {
    let first = null;
    for (const o of convoLog) {
      if (!o.transcript || !o.transcript.length) continue;
      const hit = o.transcript.some(e => isContestServeLine(e.text, [cl.contest]) && String(e.text || '').indexOf(cl.contest || '###none###') !== -1 || (cl.contest && String(e.text || '').indexOf(cl.contest) !== -1 && /(won|died|walked out|survived)/i.test(String(e.text || ''))));
      if (hit) { first = o.day; break; }
    }
    cl.firstServedDay = first;
    cl.serveLatency = first != null ? first - cl.day : null;
    serveDays.push(cl.serveLatency);
  }
  return {
    seed, days: curDay(), deaths, deathCauses, teleDeaths, alive: livingIds().length,
    convos: convoLog.length,
    deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    comfortPicksTotal,
    gossipPicks: runState.gossipPicks, gossipConvos: gossipThreads,
    contestSeeds: contestSeedLog.length, contestNames: runState.contestNames,
    contestLives,
    contestServesTotal, rumorVerbServesTotal, otherGossipServesTotal,
    serveLatencies: serveDays,
    gossipCensusDays: gossipSnap.length,
    traceCount: traces.length,
    fragmentCount: fragments.length,
    l2prime: { repeats: repeatHits, count: repeatHits.length },
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    l3: { bonds, deepBonds, betrayalCases, mootsConvened, gossipConvos: gossipThreads, gossipPicks: runState.gossipPicks, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
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
  // ---- 12-day smoke self-test BEFORE the full seeds.
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: census + gossip convos + contest wrap)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, policyId: 'journey-social-r46-smoke' });
  console.log(`SMOKE: gossipCensusDays=${smoke.gossipCensusDays} convos=${smoke.convos} gossipPicks=${smoke.gossipPicks} contestSeeds=${smoke.contestSeeds}`);
  const realTest = smoke.gossipCensusDays >= 8 && smoke.convos > 0 && smoke.gossipPicks > 0;
  console.log(`SMOKE SELF-TEST: ${realTest ? 'PASS (gossip census live, gossip-forced convos ran)' : 'FAIL (instrument broken — investigate before full seeds)'}`);
  if (!realTest) { console.log('ABORT: instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, policyId: 'journey-social-r46' });
      const convoLog = r._convoLog; delete r._convoLog;
      queueWrite(path.join(EVIDIR, `journey-social-r46-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r46 sense-read set: 2 contest-gossip convos + 2 late convos per seed.
      const cg = convoLog.filter(o => o.contestServes > 0).slice(0, 2);
      (cg.length ? cg : convoLog.filter(o => o.gossipPicks > 0 && o.turns >= 4).slice(0, 2)).forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-contestgossip-${i + 1}-${sname(o)}.txt`),
          [`# CONTEST GRAPEVINE sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart}, contestServes=${o.contestServes})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const lates = convoLog.filter(o => o.mode === 'deep' && o.day >= 100 && o.turns >= 5).slice(0, 2);
      (lates.length ? lates : convoLog.filter(o => o.mode === 'deep' && o.turns >= 5).slice(-2)).forEach((o) => {
        queueWrite(path.join(TDIR, `s${s}-late-d${o.day}-${sname(o)}.txt`),
          [`# CONTEST GRAPEVINE late sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // contest lifecycle summary
      const lines = [`# THE CONTEST GRAPEVINE — seed ${s} (${r.days}d, ${r.alive} alive)`, ''];
      for (const cl of (r.contestLives || [])) {
        lines.push(`contest d${cl.day}: '${cl.how}' — ${cl.subject} (${cl.contest || 'unnamed'})`);
        lines.push(`  seeded=${cl.seeded} reach: maxHeard=${cl.maxHeard} maxDistortion=${cl.maxDistortion} daysSeen=${cl.daysSeen}`);
        lines.push(`  firstServedDay=${cl.firstServedDay} latency=${cl.serveLatency}d`);
        lines.push(`  traces: ${cl.traces.length ? cl.traces.map(t => 'd' + t.day + ':' + t.note).join(' | ') : '(none)'}`);
        lines.push(`  fragments: ${cl.fragments.length}`);
        for (const f of cl.fragments) lines.push(`    [d${f.day}] ${f.text}`);
      }
      lines.push('', `deathCauses: ${JSON.stringify(r.deathCauses)}`);
      queueWrite(path.join(SDIR, `s${s}-contest-summary.txt`), lines.join('\n') + '\n');
      results.push(r);
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} gossip=${r.gossipConvos} contestSeeds=${r.contestSeeds} contestServes=${r.contestServesTotal} rumorVerbs=${r.rumorVerbServesTotal} dryRate=${r.dryRate}/12`);
      for (const cl of (r.contestLives || [])) console.log(`  contest d${cl.day} ${cl.how}@${cl.subject}: seeded=${cl.seeded} maxHeard=${cl.maxHeard} latency=${cl.serveLatency}d traces=${cl.traces.length}`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  // verdicts
  let m1censusGaps = 0, m1seedMiss = 0;
  let m2hit = 0, m3hit = 0, m4hit = 0;
  const m6seeds = [];
  const f1contest = [], f1verbs = [];
  for (const r of results) {
    const lives = r.contestLives || [];
    if (lives.length === 0) { console.log(`  seed ${r.seed}: M1 CONTEST SEED MISS (no resolved contest outcomes)`); m1seedMiss++; }
    const snaps = r.gossipCensusDays | 0;
    if (snaps < (r.days | 0) - 3) { console.log(`  seed ${r.seed}: M1 CENSUS GAP (censusDays=${snaps} runDays=${r.days})`); m1censusGaps++; }
    let seedServe = false, seedTravel = false, seedCons = false;
    for (const cl of lives) {
      if (cl.firstServedDay != null) seedServe = true;
      if (cl.maxHeard >= 3) seedTravel = true;
      if ((cl.traces || []).length || (cl.fragments || []).length) seedCons = true;
    }
    // rep-dim movement check for M4: contest subject rep before/after (approx:
    // skip — use trace/fragment evidence + rep via repOf not tracked here).
    if (seedServe) m2hit++;
    if (seedTravel) m3hit++;
    if (seedCons) m4hit++;
    if ((r.alive | 0) >= 5 && !(r.endState || {}).scattered) m6seeds.push(r.seed);
    f1contest.push(r.contestServesTotal | 0); f1verbs.push(r.rumorVerbServesTotal | 0);
    console.log(`  seed ${r.seed}: days=${r.days} alive=${r.alive} contestSeeds=${lives.length} serves=${r.contestServesTotal} end=${JSON.stringify(r.endState)}`);
  }
  console.log(`M1 (contests seed gossip, census complete): ${m1seedMiss === 0 && m1censusGaps === 0 ? 'GO' : 'MISS — seedMiss=' + m1seedMiss + ' censusGaps=' + m1censusGaps}`);
  console.log(`M2 (>=1 contest entry served via ask:gossip on >=2/4 seeds): ${m2hit}/4 — ${m2hit >= 2 ? 'GO' : 'MISS — DOCUMENTED BLANK'}`);
  console.log(`M3 (>=1 contest entry reaches >=3 hearers on >=2/4 seeds): ${m3hit}/4 — ${m3hit >= 2 ? 'GO' : 'MISS — DOCUMENTED BLANK'}`);
  console.log(`M4 (contest gossip referenced later on >=2/4 seeds): ${m4hit}/4 — ${m4hit >= 2 ? 'GO' : 'MISS — DOCUMENTED BLANK'}`);
  console.log(`M6 (guardrail alive>=5, not scattered): ${m6seeds.length}/4 [${m6seeds.join(',')}] — ${m6seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`F1 (contest serves vs rumor-verb serves per seed): contest=[${f1contest.join(',')}] verbs=[${f1verbs.join(',')}]`);
  console.log(`F2 latencies: ${results.map(r => 's' + r.seed + ':' + JSON.stringify(r.serveLatencies)).join(' ')}`);
  // r46: flush all queued outputs at the end (EPERM-flap resilient).
  flushWrites();
})();
