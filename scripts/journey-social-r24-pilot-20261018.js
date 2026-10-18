#!/usr/bin/env node
// journey-social-r24-pilot-20261018.js -- SOCIAL leg (leg 5), r24 PILOT.
// PRE-REGISTERED (MEASUREMENT.md sections 9-12, 14 -- written before the
// pilot ran; full note at evidence/2026-10-18/journey-social-r24.md):
//
// Context: r23 (landed dacab5ca5) made the invite layer bond-aware. Its
// documented-not-fixed blank: "One dry-line wart after a 'Sure.' (pre-
// existing tail-deflection class). The failure mode remains absence (dry
// lines at tails), not invention." r18 built the dry-streak guard: 3
// consecutive DEFLECTION speeches (convoIsDeflectionLine class: 9 dry +
// 3 self-repeat lines) spend the energy budget and queue the natural
// winddown.
//
// Leg question: when a conversation runs out of content -- mid-thread
// (thread exhausted, topic re-asked) or at the end -- does the engine stay
// human (one honest exhausted line, then a pivot or a temperament winddown)
// or strand the player in dead air the r18 guard cannot see? The
// `cg.exhausted` pool ("I've told you everything I know about that.",
// 20 lines) is NOT in the deflection class -- 3+ consecutive exhausted
// lines would never trigger the winddown. And the react path ("Sure.")
// may produce dry lines on live threads.
//
// Binding (pilot; a miss is NO-GO, never re-scored):
//   P1 gap-exhaust-streak: >=1 conversation where >=3 NPC lines in a row
//     are dead-air class (exhausted-pool OR deflection-class) with no
//     intervening real beat and the winddown did NOT fire (convo ended by
//     player-leave or kept going) -> the dead-air class the r18 guard
//     cannot see is real.
//   P2 gap-react-dry: >=1 turn where the player picked a react choice
//     (agree/joke/silence/react:) on a LIVE thread and the NPC's line is
//     deflection-class or exhausted-pool -> dry reacts on live threads.
//   P3 gate-check: 'more' offered in the menu while convoThreadHasMore is
//     false (the exhaustion gate leaking), or >=25% of conversation-final
//     NPC lines being exhausted/deflection class rather than winddown
//     class (conversations dying on dead air instead of winding down).
//   Any of P1/P2/P3 GO -> the gap is real -> fix. All miss -> document
//     and move on.
//
// Interesting-finding bar: a transcript showing 3+ dead-air NPC lines in a
// row with the player still offered 'more'/reacts; or a "Sure." -> "lost my
// train of thought" on a live thread.
//
// Seeds: 1701, 1702 (fresh). Horizon: DAYCAP=60, death-aware (+10d tail).
// Policy: 'deep' driver -- answer questions first, then 'more' (probe to
// exhaustion), then fresh topic asks, then reacts (probe P2), leave last.
// Plus r22/r23 favoritism wrapper (2 favorites kind, 2 outsiders hostile/
// theft every 5d) so bonds form the honest way.
// TOOLING ONLY -- no game code changes in this file.
// Usage: SEEDS=1701,1702 node scripts/journey-social-r24-pilot-20261018.js
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
const TDIR = path.join(EVIDIR, 'social-r24-transcripts');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
if (!fs.existsSync(TDIR)) fs.mkdirSync(TDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1701, 1702]).filter(Number.isFinite);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);

const { mulberry32, loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

// Pools loaded from the same data the engine reads.
const CG = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/characterGen.json'), 'utf8'));
const EXHAUSTED = (CG.convo && CG.convo.exhausted) || [];
const WINDDOWN_POOL = [];
if (CG.convo && CG.convo.winddowns) {
  for (const k of Object.keys(CG.convo.winddowns)) {
    const v = CG.convo.winddowns[k];
    if (Array.isArray(v)) WINDDOWN_POOL.push(...v);
  }
}
const norm = (t) => String(t == null ? '' : t).trim().replace(/^"+|"+$/g, '');
const EXH_SET = new Set(EXHAUSTED.map(norm));
const WD_SET = new Set(WINDDOWN_POOL.map(norm));

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

function driveOne(Game, vid, tag, mode, convoLog) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [], // {turn, pickId, line, kind}
    maxDeadAirStreak: 0, moreWhileClosed: 0, endClass: null, winddownSeen: false,
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
    // P3 gate check: 'more' offered while thread has no more.
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
      // DEEP: answer questions, probe 'more' to exhaustion, fresh topics,
      // then reacts (P2 probe), leave last.
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
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
    // Classify the NPC's new line(s).
    const tr = safe(() => { const cc = Game.convoGet(vid); return cc.transcript || []; }, []);
    const newE = tr.slice(beforeLen).filter(e => e && e.who !== 'you');
    for (const e of newE) {
      const txt = String(e.text || '');
      const n = norm(txt);
      const isExh = EXH_SET.has(n);
      const isDefl = safe(() => !!Game.convoIsDeflectionLine(txt), false);
      const isWd = WD_SET.has(n);
      if (isWd) out.winddownSeen = true;
      const dead = isExh || isDefl;
      lastNpcLine = { turn: t, pickId, line: txt.slice(0, 120), kind: isExh ? 'exhausted' : (isDefl ? 'deflection' : (isWd ? 'winddown' : 'beat')) };
      if (dead) {
        deadStreak++;
        out.deadAir.push({ turn: t, pickId, line: txt.slice(0, 140), kind: isExh ? 'exhausted' : 'deflection' });
        if (deadStreak > out.maxDeadAirStreak) out.maxDeadAirStreak = deadStreak;
      } else {
        deadStreak = 0;
      }
    }
  }
  if (!out.naturalEnd && out.turns >= 14) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  if (lastNpcLine) {
    out.endClass = out.winddownSeen ? 'winddown' : (lastNpcLine.kind === 'beat' ? 'beat' : lastNpcLine.kind);
  }
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({
      who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || ''),
    }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function oneSeed(seed) {
  const { Game, manifest: mf } = await loadGame({ seed, mode: 'journey-social-r24-pilot', fullTelemetry: true });
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
      // 'deep' probes exhaustion on favorites; hostile on outsiders (rivalry texture).
      if (day % 2 === 0 && favAlive.length) driveOne(Game, favAlive[(day / 2) % favAlive.length | 0], 'deep-daily', 'deep', convoLog);
      else if (day % 2 === 1 && outAlive.length) driveOne(Game, outAlive[day % outAlive.length], 'hostile-daily', 'hostile', convoLog);
    }
  }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: 'journey-social-r24-pilot',
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

  // Save transcripts (2 per seed) for the sense-read.
  convoLog.filter(o => o.mode === 'deep' && o.turns >= 6).slice(0, 2).forEach((o, i) => {
    fs.writeFileSync(path.join(TDIR, `s${seed}-deep-${i + 1}-${o.name.replace(/\W+/g, '_')}.txt`),
      o.transcript.map(e => `${e.who}: ${e.text}`).join('\n'));
  });

  // P2: react turns on live threads that produced dead air.
  const reactDry = [];
  for (const o of convoLog) {
    for (const d of o.deadAir) {
      if (/^(agree|joke|silence|react:)/.test(d.pickId)) {
        reactDry.push({ day: o.day, name: o.name, turn: d.turn, pickId: d.pickId, kind: d.kind, line: d.line });
      }
    }
  }
  // P3: 'more' offered while thread closed.
  const gateLeaks = convoLog.filter(o => o.moreWhileClosed > 0).map(o => ({ day: o.day, name: o.name, leaks: o.moreWhileClosed }));
  const endClasses = {};
  for (const o of convoLog) { const k = o.endClass || 'unknown'; endClasses[k] = (endClasses[k] || 0) + 1; }

  const out = {
    seed, days: curDay(),
    deaths,
    convos: convoLog.length,
    deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    p1: { streaks: convoLog.filter(o => o.maxDeadAirStreak >= 3).map(o => ({ day: o.day, name: o.name, mode: o.mode, streak: o.maxDeadAirStreak, deadAir: o.deadAir.slice(0, 6) })) },
    p2: { reactDry },
    p3: { gateLeaks, endClasses },
    alive: livingIds().length,
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-social-r24-pilot-s${seed}.json`), JSON.stringify(out, null, 1));
  return out;
}

(async () => {
  const results = [];
  for (const s of SEEDS) {
    try { results.push(await oneSeed(s)); }
    catch (e) { results.push({ seed: s, error: String(e && e.stack || e).slice(0, 2000) }); }
  }
  for (const r of results) {
    console.log(`seed ${r.seed}: days=${r.days} convos=${r.convos} (deep=${r.deepConvos}) alive=${r.alive}`);
    console.log(`  P1 dead-air streaks>=3: ${(r.p1.streaks || []).length}`);
    for (const p of (r.p1.streaks || [])) {
      console.log(`    STREAK d${p.day} ${p.name} [${p.mode}] len=${p.streak}`);
      for (const d of p.deadAir) console.log(`      t${d.turn} <${d.pickId}> [${d.kind}]: ${d.line}`);
    }
    console.log(`  P2 react-dry: ${(r.p2.reactDry || []).length}`);
    for (const p of (r.p2.reactDry || []).slice(0, 5)) console.log(`    d${p.day} ${p.name} t${p.turn} <${p.pickId}> [${p.kind}]: ${p.line}`);
    console.log(`  P3 gate leaks: ${(r.p3.gateLeaks || []).length}; end classes: ${JSON.stringify(r.p3.endClasses)}`);
    if (r.error) console.log(`  ERROR: ${r.error.slice(0, 300)}`);
  }
  const p1go = results.some(r => (r.p1.streaks || []).length >= 1);
  const p2go = results.some(r => (r.p2.reactDry || []).length >= 1);
  const p3go = results.some(r => (r.p3.gateLeaks || []).length >= 1 ||
    (((r.p3.endClasses || {}).exhausted || 0) + ((r.p3.endClasses || {}).deflection || 0)) >= Math.max(1, 0.25 * (r.convos || 1)));
  console.log(`P1 gap-exhaust-streak: ${p1go ? 'GO (gap REAL)' : 'MISS'} | P2 gap-react-dry: ${p2go ? 'GO (gap REAL)' : 'MISS'} | P3 gate/end-class: ${p3go ? 'GO (gap REAL)' : 'MISS'}`);
  if (!p1go && !p2go && !p3go) console.log('All pilot metrics MISS -- document and move on per MEASUREMENT.md section 9.');
})();
