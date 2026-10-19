#!/usr/bin/env node
// journey-social-r26-pilot-20261018.js -- SOCIAL leg (leg 5), r26 PILOT.
// PRE-REGISTERED in evidence/2026-10-18/journey-social-r26.md (written before
// this ran). Leg question: when the day's news is re-asked across villagers
// (or the same event stays live across sittings) and EVERY lately candidate
// line is run-ledger-blocked, does the engine reframe honestly ("you've
// probably heard...") with the villager's own take — or strand the player in
// dry deflections?
// Bindings (a miss is NO-GO, never re-scored):
//   L1 reframe-opportunity: >=1 lately-ask where ALL filled candidates are
//     emission-blocked (convoWouldBlock) and the emitted NPC line is
//     deflection-class or exhausted-pool -> gap real -> fix.
//   L2 reframe-honesty: >=1 lately-ask producing a verbatim repeat of a
//     ledger-blocked line, or a line contradicting canon -> fix.
//   L3 social-arc: moots, gossip, bond deepening, friendships/rivalries
//     over 140d — if any counter is ~0 across seeds, investigate.
// Rate metric (r25 proposal): dry NPC lines (deflection + exhausted) per
// 12 NPC turns, pilot-wide.
// Seeds: 1901, 1902 (fresh). Horizon: DAYCAP=140, death-aware (+10d tail).
// Policy: 'deep' driver + favoritism wrapper (r24/r25).
// TOOLING ONLY -- no game code changes in this file.
// Usage: SEEDS=1901,1902 node scripts/journey-social-r26-pilot-20261018.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
const TDIR = path.join(EVIDIR, 'social-r26-transcripts');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
if (!fs.existsSync(TDIR)) fs.mkdirSync(TDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1901, 1902]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

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
const norm = (t) => String(t == null ? '' : t).trim().replace(/^"+|"+$/g, '');
const EXH_SET = new Set(EXHAUSTED.map(norm));
const WD_SET = new Set(WINDDOWN_POOL.map(norm));

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
const LATELY_PICK = /^(ask:lately|alive:event)$/;

// Snapshot the lately candidate-block state BEFORE the turn is taken:
// all filled candidates emission-blocked? (the r26 reframe opportunity)
function latelyBlockState(Game, vid) {
  try {
    const cands = Game.t2gen_lately(vid) || [];
    const vp = Game.vpOf ? Game.vpOf(vid) : {};
    const filled = cands.map(l => { try { return Game.t2fill(l, vp, vid); } catch (e) { return String(l); } });
    const blocked = filled.filter(l => { try { return Game.convoWouldBlock(vid, l); } catch (e) { return false; } });
    return { total: filled.length, blocked: blocked.length, allBlocked: filled.length > 0 && blocked.length === filled.length };
  } catch (e) { return { total: 0, blocked: 0, allBlocked: false, error: String(e.message).slice(0, 100) }; }
}

function driveOne(Game, vid, tag, mode, convoLog) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [],
    maxDeadAirStreak: 0, moreWhileClosed: 0, endClass: null, winddownSeen: false,
    lately: [], // {turn, pickId, block:{total,blocked,allBlocked}, npcLines:[{kind,line}]}
    npcTurns: 0, dryLines: 0,
  };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  const seenIds = [];
  let deadStreak = 0;
  let lastNpcLine = null;
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
    if (mode === 'hostile') {
      pick = choices.find(x => x && String(x.temper || '') === 'cruel');
      if (!pick) pick = byId(/^dlg:cant$/);
      if (!pick) pick = byId(/^deflect_q$/);
      if (t >= 2) pick = pick || byId(/^(leave|bye|goodbye)/);
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    } else {
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
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
    const isLately = LATELY_PICK.test(pickId);
    const block = isLately ? latelyBlockState(Game, vid) : null;
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
    const tr = safe(() => { const cc = Game.convoGet(vid); return cc.transcript || []; }, []);
    const newE = tr.slice(beforeLen).filter(e => e && e.who !== 'you');
    const npcLines = [];
    for (const e of newE) {
      const txt = String(e.text || '');
      const n = norm(txt);
      const isExh = EXH_SET.has(n);
      const isDefl = safe(() => !!Game.convoIsDeflectionLine(txt), false);
      const isWd = WD_SET.has(n);
      if (isWd) out.winddownSeen = true;
      const dead = isExh || isDefl;
      out.npcTurns++;
      if (dead) out.dryLines++;
      const kind = isExh ? 'exhausted' : (isDefl ? 'deflection' : (isWd ? 'winddown' : 'beat'));
      lastNpcLine = { turn: t, pickId, line: txt.slice(0, 120), kind };
      npcLines.push({ kind, line: txt.slice(0, 160) });
      if (dead) {
        deadStreak++;
        out.deadAir.push({ turn: t, pickId, line: txt.slice(0, 140), kind });
        if (deadStreak > out.maxDeadAirStreak) out.maxDeadAirStreak = deadStreak;
      } else {
        deadStreak = 0;
      }
    }
    if (isLately) out.lately.push({ turn: t, pickId, block, npcLines });
  }
  if (!out.naturalEnd && out.turns >= 14) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  if (lastNpcLine) {
    out.endClass = out.winddownSeen ? 'winddown' : (lastNpcLine.kind === 'beat' ? 'beat' : lastNpcLine.kind);
  }
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '') }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function oneSeed(seed) {
  const { Game, manifest: mf } = await loadGame({ seed, mode: 'journey-social-r26-pilot', fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();

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

  const ctx2 = { favorites: null, outsiders: null };
  function pickFactions() {
    const living = livingIds();
    const byTrust = living.slice().sort((a, b) => trustOf(b) - trustOf(a));
    ctx2.favorites = byTrust.slice(0, 2);
    ctx2.outsiders = byTrust.slice(-2).reverse();
  }
  function kindnessRound() {
    const day = curDay();
    const sid = me();
    for (const vid of (ctx2.favorites || [])) {
      if (!livingIds().includes(vid)) continue;
      try {
        const needs = safe(() => Game.npcNeeds(vid) || {}, {});
        const s = Game.state.scholar || {};
        if ((needs.hunger || 0) > 30 && (s.kcal || 0) > 1200 && Game.giveFood) Game.giveFood(vid);
      } catch (e) {}
      try { if (Game.tendVillager) Game.tendVillager(vid); } catch (e) {}
    }
    for (const vid of (ctx2.outsiders || [])) {
      if (!livingIds().includes(vid)) continue;
      if (day % 5 === 0 && day > 2 && Game.stealFrom) { try { Game.stealFrom(vid); } catch (e) {} }
    }
    const living = livingIds();
    const favAlive = (ctx2.favorites || []).filter(id => living.includes(id));
    const outAlive = (ctx2.outsiders || []).filter(id => living.includes(id));
    if (day >= 3) {
      if (day % 2 === 0 && favAlive.length) driveOne(Game, favAlive[(day / 2) % favAlive.length | 0], 'deep-daily', 'deep', convoLog);
      else if (day % 2 === 1 && outAlive.length) driveOne(Game, outAlive[day % outAlive.length], 'hostile-daily', 'hostile', convoLog);
    }
  }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: 'journey-social-r26-pilot',
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      if (curDay() === 2 && !ctx2.favorites) pickFactions();
      if (ctx2.favorites) kindnessRound();
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay() });
      }
    },
  });
  const result = await runDays(Game, pol, { days: DAYCAP, manifest: mf });

  // Save transcripts: 2 deep + 1 late-run (day>=100) for the sense-read.
  convoLog.filter(o => o.mode === 'deep' && o.turns >= 6).slice(0, 2).forEach((o, i) => {
    fs.writeFileSync(path.join(TDIR, `s${seed}-deep-${i + 1}-${o.name.replace(/\W+/g, '_')}.txt`),
      o.transcript.map(e => `${e.who}: ${e.text}`).join('\n'));
  });
  convoLog.filter(o => o.day >= 100 && o.turns >= 5).slice(0, 1).forEach((o) => {
    fs.writeFileSync(path.join(TDIR, `s${seed}-late-d${o.day}-${o.name.replace(/\W+/g, '_')}.txt`),
      o.transcript.map(e => `${e.who}: ${e.text}`).join('\n'));
  });

  // L1: lately-asks where all candidates were blocked and the NPC reply was dead air.
  const l1 = [];
  for (const o of convoLog) {
    for (const l of (o.lately || [])) {
      if (l.block && l.block.allBlocked) {
        const dead = (l.npcLines || []).filter(x => x.kind === 'deflection' || x.kind === 'exhausted');
        if (dead.length) l1.push({ day: o.day, name: o.name, turn: l.turn, pickId: l.pickId, total: l.block.total, blocked: l.block.blocked, dead });
      }
    }
  }
  // P2-carry: react-dry (regression watch).
  const reactDry = [];
  for (const o of convoLog) {
    for (const d of o.deadAir) {
      if (/^(agree|joke|silence|react:)/.test(d.pickId)) reactDry.push({ day: o.day, name: o.name, turn: d.turn, pickId: d.pickId, kind: d.kind, line: d.line });
    }
  }
  // L3: social-arc counters from live state.
  // (r26 fix: bonds/cases live under state.village, NOT state root — the
  // pilot originally read Game.state.bonds / Game.state.betrayal and
  // reported phantom zeros.)
  const v = Game.state.village || {};
  const bondsMap = safe(() => (Game.state.village || {}).bonds || {}, {});
  const bonds = Object.keys(bondsMap).length;
  let deepBonds = 0;
  try {
    for (const k of Object.keys(bondsMap)) { const bb = bondsMap[k] || {}; if ((bb.v || 0) >= 30 || (bb.depth || 0) >= 1) deepBonds++; }
  } catch (e) {}
  const bsCases = safe(() => ((Game.state.village || {}).betrayal || {}).cases || [], []);
  const cases = bsCases.length;
  const moots = safe(() => bsCases.filter(c => c.moot || c.mootHeld || (c.log || []).some(l => /moot/i.test(String(l)))).length, 0);
  const gossipThreads = convoLog.filter(o => (o.threads || []).includes('gossip')).length;
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);

  const out = {
    seed, days: curDay(),
    deaths,
    convos: convoLog.length,
    deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    latelyAsks: convoLog.reduce((s, o) => s + (o.lately || []).length, 0),
    l1: { opportunities: l1, count: l1.length },
    p2carry: { reactDry: reactDry.length, reactDrySample: reactDry.slice(0, 5) },
    p1carry: { streaks: convoLog.filter(o => o.maxDeadAirStreak >= 3).length },
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    l3: { bonds, deepBonds, betrayalCases: cases, moots, gossipConvos: gossipThreads, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    alive: livingIds().length,
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-social-r26-pilot-s${seed}.json`), JSON.stringify(out, null, 1));
  return out;
}

(async () => {
  const results = [];
  for (const s of SEEDS) {
    try { results.push(await oneSeed(s)); }
    catch (e) { results.push({ seed: s, error: String(e && e.stack || e).slice(0, 2000) }); }
  }
  for (const r of results) {
    console.log(`seed ${r.seed}: days=${r.days} convos=${r.convos} (deep=${r.deepConvos}) lately=${r.latelyAsks} alive=${r.alive} dryRate=${r.dryRate}/12`);
    console.log(`  L1 reframe-opportunities: ${(r.l1 || {}).count}`);
    for (const p of ((r.l1 || {}).opportunities || [])) {
      console.log(`    d${p.day} ${p.name} t${p.turn} <${p.pickId}> cands=${p.total} blocked=${p.blocked}`);
      for (const d of p.dead) console.log(`      [${d.kind}]: ${d.line}`);
    }
    console.log(`  L3 social-arc: ${JSON.stringify((r.l3 || {}))}`);
    console.log(`  regression: P1-streaks=${(r.p1carry || {}).streaks} P2-reactDry=${(r.p2carry || {}).reactDry}`);
    if (r.error) console.log(`  ERROR: ${r.error.slice(0, 300)}`);
  }
  const l1go = results.some(r => (r.l1 || {}).count >= 1);
  console.log(`L1 reframe-opportunity: ${l1go ? 'GO (gap REAL)' : 'MISS'}`);
  if (!l1go) console.log('All pilot metrics MISS -- document and move on per MEASUREMENT.md section 9.');
})();
