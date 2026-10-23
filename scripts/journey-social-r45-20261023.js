#!/usr/bin/env node
// journey-social-r45-20261023.js -- SOCIAL leg (leg 5), r45 (lane B).
// PRE-REGISTERED in hidden_files/evidence/2026-10-23/journey-social-r45.md
// (written before this ran).
//
// Leg question: THE RUMOR'S LIFE — when a competent warm player plants
// rumors through the real conversation path (ask:spread_rumor), do they
// TRAVEL villager-to-villager, mutate, move the subject's reputation, and
// ever surface back in conversation — or do they die on arrival like r1
// (2026-10-14: rumorTravel=[] across 3 seeds)?
//
// Seeds: 4101-4104 (fresh). Horizon: DAYCAP=140, death-aware
// (+10d tail via runDays' Game.over stop).
// Policy: warm-competent (competent base; warm neighbor: donates, keeps
// promises, comforts) + rumor-plant layer: 2 plants/seed — first once
// ask:spread_rumor is offered (gossipOpen: trust>=20, day>=6), second
// >=30d after the first. 2 convos/day rotating the roster (deep mode,
// gossip forcing GOSSIP_TARGET=3 as in r44).
// Bindings (a miss is NO-GO, never re-scored):
//   M1 instrument: daily gossip census on 4/4 seeds, no gaps >2d; both
//       planned plants actually start a rumor (plantLog 2/2/seed) — if a
//       plant never gets an offered choice, that's M2's story, not M1.
//   M2 travel: >=1 planted rumor reaches >=4 hearers on >=2/4 seeds.
//       (r1's zero is the null; GO = the machinery works in real play.)
//   M3 consequence: on >=2/4 seeds, >=1 planted rumor moves a subject
//       rep dim by >=5 total OR a trace-back event (rumor_about_them with
//       the player blamed) fires.
//   M4 people: >=4 gossip-thread transcripts sense-read, 0
//       fabricated-history flags.
//   M5 guardrail: >=3/4 seeds end with >=5 alive, village not scattered.
//   F1 informational: distortion trajectory per rumor (max distortion,
//       does the distortion>=2 mutation path engage?).
//   F2 informational: do planted rumors surface back in conversation
//       (overheard fragments + ask:gossip threads mentioning the subject)?
// TOOLING ONLY -- no game code changes in this file.
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-23');
const TAG = (process.env.TAG || 'r45-pilot').replace(/[^a-z0-9-]/gi, '');
const TDIR = path.join(EVIDIR, `social-${TAG}-transcripts`);
const SDIR = path.join(EVIDIR, `social-${TAG}-moots`);
for (const d of [EVIDIR, TDIR, SDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 4105;
const SMOKE_DAYS = 12;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [4101, 4102, 4103, 4104]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const GOSSIP_TARGET = 3;
// Two plants per seed: first when gossip can open (day>=6), second >=30d later.
const PLANT_EARLIEST = 6;
const PLANT_GAP = 30;
const PLANT_TYPES = ['generous', 'untrustworthy'];

// writeFileFlap (infra 2026-10-19): the host EPERMs writes intermittently
// across ALL processes. Retry through the flap.
function writeFileFlap(p, data) {
  let last = null;
  for (let i = 0; i < 12; i++) {
    try { fs.writeFileSync(p, data); return; }
    catch (e) { last = e; if (!/EPERM/.test(String(e && e.message))) throw e; }
    const t0 = Date.now(); while (Date.now() - t0 < 2500) {}
  }
  throw last;
}

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

const CG = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characterGen.json'), 'utf8'));
const EXHAUSTED = (CG.convo && CG.convo.exhausted) || [];
const WINDDOWN_POOL = [];
if (CG.convo && CG.convo.winddowns) {
  for (const k of Object.keys(CG.convo.winddowns)) {
    const v = CG.convo.winddowns[k]; if (Array.isArray(v)) WINDDOWN_POOL.push(...v);
  }
}
const norm = (t) => String(t == null ? '' : t).trim().replace(/^\"+|\"+$/g, '');
const EXH_SET = new Set(EXHAUSTED.map(norm));
const WD_SET = new Set(WINDDOWN_POOL.map(norm));

const COMFORT_OPENERS = [
  '"Do you ever — no. Never mind." They don\'t look away, though. They want you to ask.',
  '"I\'m not okay. I\'m saying it out loud so it\'s real: I\'m not okay."',
  '"I don\'t want to be alone with my head right now. That\'s all. That\'s the whole thing."',
  '"It\'s stupid. I\'m alive, everyone\'s alive, and I can\'t stop shaking."',
];
const COMFORT_ENGAGES = [
  '"It helps. Just — saying it out loud to someone who\'s actually listening. It helps."',
  '"I keep going over it. Having someone here... it slows the spiral."',
  '"My hands stopped shaking. That\'s — that\'s something. Thank you for sitting here."',
  '"I can breathe all the way down again. I couldn\'t, before you sat down."',
  '"Saying it out loud makes it smaller. Still there. Smaller."',
  '"I keep waiting for it to get worse again. It hasn\'t. Not while you\'re here."',
];
const POOL_SET = new Map();
for (const l of COMFORT_OPENERS) POOL_SET.set(norm(l), 'opener');
for (const l of COMFORT_ENGAGES) POOL_SET.set(norm(l), 'engage');

const COMFORT_PICKS = new Set(['dlg:comfort', 'dlg:empathize', 'dlg:stay']);

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const moodAtStart = safe(() => Game.npcMood(vid), '?');
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [],
    maxDeadAirStreak: 0, moreWhileClosed: 0, endClass: null, winddownSeen: false,
    npcTurns: 0, dryLines: 0, gossipPicks: 0, comfortPicks: 0, moodAtStart,
    repeatHits: [],
    comfortRepeatHits: [],
    favorBefore: null, favorAfter: null, favorGratitudeSpoken: false, silentSettle: false,
    rumorPlanted: false,
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
  // r45 rumor-plant state: runState.plantToday={target,type} when a plant is due.
  const plantJob = runState.plantToday || null;
  let plantStep = 0; // 0=need ask:spread_rumor, 1=need rumor:tgt:, 2=need rumor:type:
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const hasMore = safe(() => !!Game.convoThreadHasMore(vid), false);
    if (choices.some(x => x && String(x.id || '') === 'more') && !hasMore) out.moreWhileClosed++;
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    let pick = null;
    if (mode === 'deep') {
      // r45: plant a planned rumor through the real conversation path.
      // Step 0: take ask:spread_rumor; step 1: pick the planned target;
      // step 2: pick the planned type.
      if (plantJob && plantStep === 0) {
        const sr = byId(/^ask:spread_rumor$/);
        if (sr) { pick = sr; plantStep = 1; }
      }
      if (plantJob && plantStep === 1 && !pick) {
        const want = byId(new RegExp('^rumor:tgt:' + String(plantJob.target).replace(/[^a-zA-Z0-9_]/g, '') + '$'));
        const any = byId(/^rumor:tgt:/);
        if (want) { pick = want; plantStep = 2; }
        else if (any) { pick = any; plantStep = 2; }
        else { plantStep = -1; } // thread offered ask:spread_rumor but no targets — abandon
      }
      if (plantJob && plantStep === 2 && !pick) {
        const ty = byId(new RegExp('^rumor:type:' + plantJob.type + '$'));
        if (ty) { pick = ty; plantStep = 3; }
        else { plantStep = -1; }
      }
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
    if (COMFORT_PICKS.has(pickId)) { out.comfortPicks++; }
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try { Game.convoTurn(vid, pickId); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
    // r45: the plant completes on the rumor:type: pick — the spreadRumor
    // wrap records it; clear today's job so we don't plant twice.
    if (/^rumor:type:/.test(pickId)) {
      out.rumorPlanted = true;
      runState.plantToday = null;
      runState.plantsDone++;
    }
    const afterLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try {
      const cc = Game.convoGet(vid);
      const tr = (cc && cc.transcript) || [];
      for (let i = beforeLen; i < tr.length; i++) {
        const e = tr[i];
        const who = (e && e.who) || (e && e.speaker) || '?';
        const text = (e && (e.text || e.line)) || '';
        if (text) out.transcript.push({ who, text: String(text).slice(0, 600) });
      }
      const nl = String(((tr[tr.length - 1]) || {}).text || '');
      if (/^(agree|joke|silence|react:)/.test(pickId)) { out.dryLines++; deadStreak++; out.deadAir.push({ pickId, line: nl.slice(0, 120) }); }
      else { out.npcTurns++; deadStreak = 0; }
      out.maxDeadAirStreak = Math.max(out.maxDeadAirStreak, deadStreak);
      // L2': verbatim beat repeats inside one convo
      const nrm = norm(nl);
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
  const runState = { gossipPicks: 0, seed, plantToday: null, plantsDone: 0, plantsPlanned: 0 };
  const gossipSnap = [];      // r45: daily gossip-array census
  const plantLog = [];        // r45: spreadRumor wrap — every planted rumor
  const repBefore = {};       // r45: subject rep at plant time
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  // r45: wrap spreadRumor — the plant event is the rumor's birth record.
  const origSpreadRumor = Game.spreadRumor;
  if (typeof origSpreadRumor === 'function') {
    Game.spreadRumor = function (targetId, rumorType, firstHearerId) {
      let g = null;
      try { g = origSpreadRumor.apply(this, arguments); } catch (e) {}
      try {
        if (g) plantLog.push({
          day: curDay(), target: targetId, targetName: vname(Game, targetId),
          type: rumorType, firstHearer: firstHearerId, firstHearerName: vname(Game, firstHearerId),
          partKey: g.partKey || null,
        });
        else plantLog.push({ day: curDay(), target: targetId, targetName: vname(Game, targetId), type: rumorType, deduped: true });
      } catch (e) {}
      return g;
    };
  }

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

  // r45: the plant scheduler. Two plants; first when gossip can open
  // (day>=6), second >=PLANT_GAP days after the first completes. Called in
  // pol.daily BEFORE socialConvo; sets runState.plantToday={target,type}.
  let plantIdx = 0;
  let lastPlantDay = null;
  function schedulePlant() {
    const day = curDay();
    if (plantIdx >= PLANT_TYPES.length) return;
    if (day < PLANT_EARLIEST) return;
    if (lastPlantDay != null && day - lastPlantDay < PLANT_GAP) return;
    const living = livingIds();
    if (!living.length) return;
    const target = living[(day * 3 + plantIdx * 7) % living.length];
    runState.plantToday = { target, type: PLANT_TYPES[plantIdx] };
    runState.plantsPlanned++;
    try { repBefore[target + ':' + PLANT_TYPES[plantIdx]] = repOf(target); } catch (e) {}
  }

  // r45: daily gossip census — every live gossip item's reach + distortion.
  function snapshotGossip() {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const items = (v.gossip || []).map(g => ({
        partKey: g.partKey || null, action: g.action || '?',
        subject: (g.dims && g.dims.who) || null,
        subjectName: (g.dims && g.dims.who) ? vname(Game, g.dims.who) : null,
        heard: (g.heard || []).length, distortion: g.distortion || 0,
        plantedDay: g.day, playerRumor: !!g.playerRumor,
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
    for (let n = 0; n < 2; n++) {
      const pool = living.filter(id => !talkedToday.has(id));
      const arr = pool.length ? pool : living;
      const target = arr[(day * 7 + n * 5) % arr.length];
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      const beforePlants = plantLog.length;
      driveOne(Game, target, n === 0 ? 'rumor-daily-1' : 'rumor-daily-2', 'deep', convoLog, runState);
      if (plantLog.length > beforePlants) { plantIdx++; lastPlantDay = curDay(); }
    }
  }
  function resetTalkLedger() { talkedToday.clear(); }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    daily(Game2, ctx) {
      resetTalkLedger();
      if (base.daily) base.daily(Game2, ctx);
      schedulePlant();
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

  // r45 post: rumor lifecycles.
  const gossipDays = {};
  for (const s of gossipSnap) {
    for (const it of (s.items || [])) {
      if (!it.partKey) continue;
      const k = it.partKey;
      gossipDays[k] = gossipDays[k] || { snapshots: 0, maxHeard: 0, maxDistortion: 0, daysSeen: [], action: it.action, subject: it.subject, subjectName: it.subjectName, playerRumor: it.playerRumor, plantedDay: it.plantedDay };
      const g = gossipDays[k];
      g.snapshots++; g.maxHeard = Math.max(g.maxHeard, it.heard); g.maxDistortion = Math.max(g.maxDistortion, it.distortion);
      g.daysSeen.push(s.day);
    }
  }
  // trace events: subject remembers hearing the rumor about themselves.
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
  const rumorLives = plantLog.filter(p => !p.deduped).map(p => {
    const g = p.partKey ? gossipDays[p.partKey] : null;
    const rbKey = p.target + ':' + p.type;
    const rb = repBefore[rbKey] || {};
    const ra = repOf(p.target) || {};
    const dims = {};
    for (const k of new Set([...Object.keys(rb), ...Object.keys(ra)])) {
      const d = (ra[k] || 0) - (rb[k] || 0);
      if (d !== 0) dims[k] = d;
    }
    const frags = fragments.filter(f => f.day >= p.day && f.day <= p.day + 4).slice(0, 3);
    return {
      day: p.day, target: p.targetName, type: p.type,
      firstHearer: p.firstHearerName, partKey: p.partKey,
      maxHeard: g ? g.maxHeard : 0, maxDistortion: g ? g.maxDistortion : 0,
      daysSeen: g ? g.daysSeen.length : 0,
      repDelta: dims,
      fragments: frags,
      traces: traces.filter(t => t.subject === p.target).slice(0, 4),
    };
  });

  const v = Game.state.village || {};
  const bondsMap = safe(() => v.bonds || {}, {});
  const bonds = Object.keys(bondsMap).length;
  let deepBonds = 0;
  try { for (const k of Object.keys(bondsMap)) { const bb = bondsMap[k] || {}; if ((bb.v || 0) >= 30 || (bb.depth || 0) >= 1) deepBonds++; } } catch (e) {}
  const gossipThreads = convoLog.filter(o => (o.threads || []).includes('gossip')).length;
  const spreadThreads = convoLog.filter(o => (o.threads || []).includes('spread_rumor')).length;
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  const repeatHits = [];
  for (const o of convoLog) for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line });
  const comfortConvos = convoLog.filter(o => o.isComfortConvo).length;
  const comfortPicksTotal = convoLog.reduce((s, o) => s + o.comfortPicks, 0);
  const deathCauses = {};
  for (const d of deaths) { const k = String(d.cause || 'unknown'); deathCauses[k] = (deathCauses[k] || 0) + 1; }
  const teleDeaths = safe(() => (Game.state.telemetry || []).filter(t => t.type === 'death'), [])
    .map(t => ({ who: t.who, cause: t.cause || 'unknown', wave: t.wave, player: !!t.player, day: t.day }));
  return {
    seed, days: curDay(), deaths, deathCauses, teleDeaths, alive: livingIds().length,
    convos: convoLog.length,
    deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    comfortConvos, comfortPicksTotal,
    gossipPicks: runState.gossipPicks, gossipConvos: gossipThreads, spreadThreads,
    plants: { planned: runState.plantsPlanned, done: plantLog.filter(p => !p.deduped).length, log: plantLog },
    rumors: rumorLives,
    gossipCensusDays: gossipSnap.length,
    traceCount: traces.length,
    fragmentCount: fragments.length,
    l2prime: { repeats: repeatHits, count: repeatHits.length },
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    l3: { bonds, deepBonds, gossipConvos: gossipThreads, spreadThreads, gossipPicks: runState.gossipPicks, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
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
  // ---- 12-day smoke self-test BEFORE the full seeds (plant window opens d6).
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: plant path + gossip census)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, policyId: 'journey-social-r45-smoke' });
  const sGSnaps = smoke.gossipCensusDays;
  const sPlants = (smoke.plants || {}).done | 0;
  console.log(`SMOKE: gossipCensusDays=${sGSnaps} plantsDone=${sPlants} convos=${smoke.convos} spreadThreads=${smoke.spreadThreads}`);
  const realTest = sGSnaps >= 8 && smoke.convos > 0;
  console.log(`SMOKE SELF-TEST: ${realTest ? 'PASS (gossip census live, warm convos ran' + (sPlants > 0 ? ', plant path fired' : ', plant path not yet offered — gossip may still be closed at d12') + ')' : 'FAIL (instrument broken — investigate before full seeds)'}`);
  if (!realTest) { console.log('ABORT: census instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, policyId: 'journey-social-r45-pilot' });
      const convoLog = r._convoLog; delete r._convoLog;
      writeFileFlap(path.join(EVIDIR, `journey-social-${TAG}-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r45 sense-read set: 2 gossip convos + 2 late convos per seed.
      convoLog.filter(o => o.gossipPicks > 0 && o.turns >= 4).slice(0, 2).forEach((o, i) => {
        writeFileFlap(path.join(TDIR, `s${s}-gossip-${i + 1}-${sname(o)}.txt`),
          [`# RUMOR'S LIFE sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const lates = convoLog.filter(o => o.mode === 'deep' && o.day >= 100 && o.turns >= 5).slice(0, 2);
      (lates.length ? lates : convoLog.filter(o => o.mode === 'deep' && o.turns >= 5).slice(-2)).forEach((o) => {
        writeFileFlap(path.join(TDIR, `s${s}-late-d${o.day}-${sname(o)}.txt`),
          [`# RUMOR'S LIFE late sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // rumor lifecycle summary
      const lines = [`# THE RUMOR'S LIFE — seed ${s} (${r.days}d, ${r.alive} alive)`, ''];
      for (const rl of (r.rumors || [])) {
        lines.push(`rumor d${rl.day}: '${rl.type}' about ${rl.target} (first told ${rl.firstHearer})`);
        lines.push(`  reach: maxHeard=${rl.maxHeard} maxDistortion=${rl.maxDistortion} daysSeen=${rl.daysSeen}`);
        lines.push(`  repDelta: ${JSON.stringify(rl.repDelta)}`);
        lines.push(`  traces: ${rl.traces.length ? rl.traces.map(t => 'd' + t.day + ':' + t.note).join(' | ') : '(none)'}`);
        lines.push(`  fragments: ${rl.fragments.length}`);
        for (const f of rl.fragments) lines.push(`    [d${f.day}] ${f.text}`);
      }
      lines.push('', `deathCauses: ${JSON.stringify(r.deathCauses)}`);
      writeFileFlap(path.join(SDIR, `s${s}-rumor-summary.txt`), lines.join('\n') + '\n');
      results.push(r);
      console.log(`seed ${s}: days=${r.days} alive=${r.alive} convos=${r.convos} gossip=${r.gossipConvos} spread=${r.spreadThreads} plants=${r.plants.done}/${r.plants.planned} dryRate=${r.dryRate}/12`);
      for (const rl of (r.rumors || [])) console.log(`  rumor d${rl.day} ${rl.type}@${rl.target}: maxHeard=${rl.maxHeard} maxDist=${rl.maxDistortion} repDelta=${JSON.stringify(rl.repDelta)} traces=${rl.traces.length}`);
      console.log(`  L2' repeats: ${r.l2prime.count}`);
      console.log(`  L3: ${JSON.stringify(r.l3)}`);
    } catch (e) { console.log(`seed ${s} ERROR: ${String(e && e.stack || e).slice(0, 500)}`); }
  }
  // verdicts
  let m1gaps = 0, m1plantMiss = 0;
  let m2hit = 0;
  let m3hit = 0;
  const m4seeds = [];
  const f1dists = [];
  let f2frag = 0;
  for (const r of results) {
    const plants = (r.plants || {}).log || [];
    const real = plants.filter(p => !p.deduped);
    if (real.length < 2) { console.log(`  seed ${r.seed}: M1 PLANT SHORTFALL (${real.length}/2)`); m1plantMiss++; }
    const snaps = r.gossipCensusDays | 0;
    if (snaps < (r.days | 0) - 3) { console.log(`  seed ${r.seed}: M1 CENSUS GAP (censusDays=${snaps} runDays=${r.days})`); m1gaps++; }
    let seedHit = false, seedCons = false;
    for (const rl of (r.rumors || [])) {
      f1dists.push(rl.maxDistortion);
      f2frag += (rl.fragments || []).length;
      if (rl.maxHeard >= 4) seedHit = true;
      const repMag = Object.values(rl.repDelta || {}).reduce((s, d) => s + Math.abs(d), 0);
      if (repMag >= 5 || (rl.traces || []).length) seedCons = true;
    }
    if (seedHit) m2hit++;
    if (seedCons) m3hit++;
    if ((r.alive | 0) >= 5 && !(r.endState || {}).scattered) m4seeds.push(r.seed);
    console.log(`  seed ${r.seed}: days=${r.days} alive=${r.alive} rumors=${(r.rumors || []).length} traces=${r.traceCount} fragments=${r.fragmentCount} end=${JSON.stringify(r.endState)}`);
  }
  console.log(`M1 (census complete, plants 2/2): ${m1gaps === 0 && m1plantMiss === 0 ? 'GO' : 'MISS — gaps=' + m1gaps + ' plantShort=' + m1plantMiss}`);
  console.log(`M2 (rumor reaches >=4 hearers on >=2/4 seeds): ${m2hit}/4 — ${m2hit >= 2 ? 'GO' : 'MISS — DOCUMENTED BLANK'}`);
  console.log(`M3 (rep moved >=5 or trace-back on >=2/4 seeds): ${m3hit}/4 — ${m3hit >= 2 ? 'GO' : 'MISS — DOCUMENTED BLANK'}`);
  console.log(`M5 (guardrail alive>=5, not scattered): ${m4seeds.length}/4 [${m4seeds.join(',')}] — ${m4seeds.length >= 3 ? 'GO' : 'NO-GO'}`);
  console.log(`F1 (max distortion across ${(f1dists || []).length} rumors): ${f1dists.join(', ')}`);
  console.log(`F2 (overheard fragments referencing plants): ${f2frag}`);
})();
