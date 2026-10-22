#!/usr/bin/env node
// probe-endgame-r39-20261022.js — journey-endgame r39 (lane B, 2026-10-22).
//
// LEG QUESTION (Steve 2026-10-14 standing overtime call: "waiting should have
// a cost" / the design call still open: priced opportunity mechanism vs
// waiting staying simply wrong): THE OVERTIME WINDOW AS LIVED PLAY. The r37
// probe proved the price is RECORDED and VOICED (satPenalty + "Every door's
// standing −M"). Nobody has read what the waiting weeks themselves PLAY like.
// Is the overtime window the final act of the run — narrated, populated,
// consequential — or a waiting room where a competent player just watches
// tiers rise until the seat is cheap enough to take?
//
// PRIMARY (binding, pre-registered):
//  M1 tier narration: on every sat seed, every tier 1..maxTier has BOTH an
//     overtime_tier tele event AND a "◈ OVERTIME ×N" SAY line (the rise is
//     announced on air, per overtime.js contract). GO = 4/4 sat seeds.
//  M2 populated window: on every sat seed, every waiting-week (7d from the
//     announce) contains ≥1 tele event AND ≥3 SAY lines (the world keeps
//     turning while the table waits). GO = 4/4 sat seeds.
//  M3 deferral surfaced as a choice: ≥3/4 sat seeds have ≥1 defer-choice beat
//     ("Take your seat") in the waiting window (the greedy policy defers
//     deliberately; the game must surface it as a decision, not a timeout).
// REGRESSIONS (binding, inherited): r35 auditNamed (lesser seat w4/w5 naming);
//     r37 satPenalty present + voiced-line match on sat seeds.
// GUARDRAIL (binding): ≥3/4 seeds reach the table window (announceDay !=
//     null) — otherwise the pilot can't answer its question.
// A miss on any leg is reported honestly per §14 — never re-scored mid-run.
//
// SUBSTRATE: CAPABLE bot + CAPABLE_GREEDY=1 (deferral design), MAXTIER=6,
// LASTDAY=170, TELEMETRY_FULL=1. 180d, death-aware. Seeds 81011–81014
// (fresh; adjacent to r37's 81001–81004 but not overlapping).
//
// Usage:
//   CAPABLE_GREEDY=1 CAPABLE_GREEDY_MAXTIER=6 CAPABLE_GREEDY_LASTDAY=170 \
//     TELEMETRY_FULL=1 node scripts/probe-endgame-r39-20261022.js
//   SMOKE=1 ...  # 1 seed x 120d
//   DET=1 ...    # instrument-on twice byte-identical (2 x 120d on seed 0)
'use strict';
const fs = require('fs');
const path = require('path');
const CAP = require('./policies/capable');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

if (process.env.CAPABLE_GREEDY !== '1') { console.error('SWEEP STOP: CAPABLE_GREEDY=1 required.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [81011, 81012, 81013, 81014]).filter(Number.isFinite);
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10)
  : (MODE === 'smoke' ? 120 : MODE === 'det' ? 120 : 180);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-endgame-r39');

function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

function dayOf(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function wavesOf(G) {
  try {
    const d = (G.deedState ? G.deedState() : {}).wavesFaced || {};
    const out = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0 };
    for (const mid of Object.keys(d)) { const w = d[mid] | 0; if (w >= 1 && w <= 5) out['w' + w]++; }
    return out;
  } catch (e) { return {}; }
}
function aliveOf(G) {
  try {
    const ids = ((G.state || {}).village || {}).roster || [];
    let n = 0;
    for (const id of ids) { try { const p = G.getPerson ? G.getPerson(id) : null; if (p && !p.dead) n++; } catch (e) {} }
    return n;
  } catch (e) { return 0; }
}
function pantryOf(G) { try { return Math.round((((G.state || {}).village || {}).pantryKcal) || 0); } catch (e) { return 0; } }
function censusOf(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const people = (v.roster || []).map(id => {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      return {
        id, name: (p && (p.name || p.displayName)) || String(id),
        dead: !!(p && p.dead), role: (p && (p.role || p.job)) || null,
        abilities: (p && p.abilities && p.abilities.length) || 0,
      };
    });
    return {
      alive: people.filter(p => !p.dead).length, dead: people.filter(p => !p.dead).length,
      people, pantryKcal: Math.round(v.pantryKcal || 0),
      scale: (Game.scaleRank ? Game.scaleRank() : '?'),
      mantle: (Game.state.scholar && Game.state.scholar.name) || null,
    };
  } catch (e) { return { error: String(e && e.message) }; }
}

async function runSeed(seed, days) {
  const capture = [];
  let lastCap = null;
  const cap = (line) => {
    if (line == null) return;
    const s = String(line).slice(0, 700);
    if (s === lastCap) return;           // dedupe consecutive repeats only
    lastCap = s;
    capture.push(s);
  };
  let announceDay = null, satDay = null, satSeatKind = null, satWaves = null;
  let satPenalty = null;
  let maxTierSeen = 0;
  let walkedPath = null, walkedBranch = null, won = false;
  let instrumentErrors = 0;
  const ctx = {};
  // weekly snapshots inside the waiting window
  const weekly = [];                    // {day,tier,alive,pantry,sayLines,teleEvents,eventTypes}
  let snapCursor = null;                // next snapshot day boundary

  const { Game } = await loadGame({ seed, mode: 'endgame-r39', fullTelemetry: true });
  await setupGame(Game);
  const oSay = Game.say.bind(Game);
  Game.say = function (l) { try { cap(l); } catch (e) {} return oSay.apply(this, arguments); };
  // sim-harness stubs sysSay to a no-op; restore the engine's voice so the
  // System's table beats are heard (tablepaths-transcripts-20261019 pattern).
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };

  const policy = Object.assign({}, CAP.capable);
  const oDaily = policy.daily.bind(policy);
  policy.daily = (G, c) => {
    let r;
    try { r = oDaily(G, c); } catch (e) { instrumentErrors++; }
    try {
      const pg = (G.progState ? G.progState() : {});
      const d = dayOf(G);
      if (pg.tableAnnounced && announceDay == null) { announceDay = d; snapCursor = d + 7; }
      const inWindow = announceDay != null && satDay == null && !pg.tableDone;
      if (inWindow && snapCursor != null && d >= snapCursor) {
        let tier = 0; try { tier = G.overtimeTier ? G.overtimeTier() | 0 : 0; } catch (e) {}
        weekly.push({ day: d, tier, alive: aliveOf(G), pantry: pantryOf(G), sayLines: -1, teleEvents: -1, eventTypes: [] });
        snapCursor += 7;
      }
      if (pg.tableDone && satDay == null) {
        satDay = d; satWaves = wavesOf(G);
        try { const st = G.tableSeat ? G.tableSeat() : null; satSeatKind = st ? st.seat : null; } catch (e) {}
        try { satPenalty = G.overtimeStanding ? G.overtimeStanding() : null; } catch (e) { instrumentErrors++; }
      }
      try { if (G.overtimeTier) maxTierSeen = Math.max(maxTierSeen, G.overtimeTier() | 0); } catch (e) {}
      if (c && c.capTablePath) walkedPath = walkedPath || c.capTablePath;
      try { const T = G.tableState ? G.tableState() : {}; if (T.path) walkedPath = T.path; if (T.branch) walkedBranch = T.branch; } catch (e) {}
    } catch (e) { instrumentErrors++; }
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  won = !!Game.won;

  // ---- audit line as spoken (r35 regression datum) ----
  const auditIdx = capture.findIndex(s => s.indexOf('◈ THE AUDIT') === 0);
  const auditLine = auditIdx >= 0 ? capture[auditIdx] : null;
  const w45 = satWaves ? (satWaves.w4 | 0) + (satWaves.w5 | 0) : 0;
  let auditNamed = null;
  if (auditLine && satWaves && w45 > 0) {
    if (satSeatKind === 'full') auditNamed = /every wave faced/.test(auditLine);
    else {
      const namesW4 = (satWaves.w4 | 0) > 0 ? /wave-4/.test(auditLine) : true;
      const namesW5 = (satWaves.w5 | 0) > 0 ? /wave-5/.test(auditLine) : true;
      auditNamed = namesW4 && namesW5;
    }
  } else if (auditLine && satWaves && w45 === 0) auditNamed = true;

  // ---- r37 regression: satPenalty present + voiced match ----
  let otMismatch = null;
  if (satDay != null) {
    const sp = satPenalty;
    const fieldsOk = sp && typeof sp === 'object'
      && Number.isFinite(sp.tier) && Number.isFinite(sp.losses) && Number.isFinite(sp.penalty);
    let voiced = null;
    const m = capture.join('\n').match(/Every door's standing −(\d+)/);
    voiced = m ? parseInt(m[1], 10) : null;
    if (!fieldsOk) otMismatch = 'OT-RECORD-MISSING';
    else if (sp.penalty > 0 && voiced == null) otMismatch = 'OT-VOICED-LINE-MISSING';
    else if (voiced != null && voiced !== sp.penalty) otMismatch = `OT-MISMATCH record=${sp.penalty} voiced=${voiced}`;
  }

  // ---- waiting-window analysis ----
  const annIdx = capture.findIndex(s => s.indexOf('◈ THE TABLE IS SET') === 0);
  const windowStart = Math.max(0, annIdx >= 0 ? annIdx : (auditIdx >= 0 ? auditIdx : 0));
  // tier-rise days from the SAY contract lines
  const tierRiseDays = [];
  const teleByDay = {};
  try {
    const tele = (Game.state || {}).telemetry || [];
    for (const e of tele) {
      if (!e || e.day == null) continue;
      if (!teleByDay[e.day]) teleByDay[e.day] = [];
      teleByDay[e.day].push(e.type);
    }
  } catch (e) { instrumentErrors++; }
  // per-week SAY-line density + tele event counts, derived from day-tagged
  // tele and the weekly snapshots (say density uses transcript position, not
  // wall day — approximations noted in the verdict)
  const weekRows = weekly.map((w, i) => ({
    day: w.day, tier: w.tier, alive: w.alive, pantry: w.pantry,
    teleEvents: 0, eventTypes: [],
  }));
  let windowWeeks = weekly.length;
  let windowSayLines = 0, windowTeleEvents = 0;
  const windowTypes = {};
  let deferBeats = 0;
  if (announceDay != null) {
    const endDay = satDay != null ? satDay : dayOf(Game);
    for (const [dStr, types] of Object.entries(teleByDay)) {
      const d = parseInt(dStr, 10);
      if (d < announceDay || d >= endDay) continue;
      windowTeleEvents += types.length;
      for (const t of types) windowTypes[t] = (windowTypes[t] || 0) + 1;
    }
    const allText = capture.slice(windowStart).join('\n');
    windowSayLines = capture.slice(windowStart).length;
    deferBeats = (allText.match(/Take your seat/gi) || []).length;
    // per-week tele density (approx: weeks from the snapshots)
    for (let i = 0; i < weekRows.length; i++) {
      const w0 = weekRows[i].day - 7, w1 = weekRows[i].day;
      let n = 0; const types = {};
      for (const [dStr, ts] of Object.entries(teleByDay)) {
        const d = parseInt(dStr, 10);
        if (d >= w0 && d < w1) { n += ts.length; for (const t of ts) types[t] = 1; }
      }
      weekRows[i].teleEvents = n; weekRows[i].eventTypes = Object.keys(types);
    }
  }
  // tier narration: each tier 1..maxTier needs BOTH tele + SAY line
  const tierNarration = [];
  for (let t = 1; t <= maxTierSeen; t++) {
    const sayOk = capture.slice(windowStart).some(s => s.indexOf(`◈ OVERTIME ×${t}`) === 0);
    let teleOk = false;
    try {
      teleOk = ((Game.state || {}).telemetry || []).some(e => e && e.type === 'overtime_tier' && e.tier === t);
    } catch (e) {}
    tierNarration.push({ tier: t, sayOk, teleOk });
  }

  let tele = [];
  try {
    tele = ((Game.state || {}).telemetry || [])
      .filter(e => e.type === 'table_entered' || e.type === 'table_won' || e.type === 'table_lost')
      .map(e => ({ type: e.type, day: e.day, path: e.tablePath, moral: e.moral, ending: e.ending, endingKind: e.endingKind }));
  } catch (e) {}
  for (const t of tele) if (t.type === 'table_won' && t.path) { walkedPath = walkedPath || t.path; walkedBranch = walkedBranch || t.moral; }

  const rec = {
    seed, days, gameDays: dayOf(Game),
    endReason: Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived',
    won, announceDay, satDay, satSeatKind, satWaves, auditLine, auditNamed,
    satPenalty, maxTier: maxTierSeen, otMismatch,
    tierNarration, weekRows, windowWeeks,
    windowSayLines, windowTeleEvents, windowTypes, deferBeats,
    walkedPath, walkedBranch, instrumentErrors, telemetry: tele,
    census: censusOf(Game),
  };
  if (process.env.DET !== '1') {
    try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
    writeFileRetry(path.join(EVID, `endgame-r39-${seed}.json`), JSON.stringify(rec, null, 1));
    const start = windowStart;
    writeFileRetry(path.join(EVID, `endgame-r39-${seed}-transcript.txt`),
      `# journey-endgame r39 — seed ${seed}, announced d${announceDay}, sat day ${satDay} (${satSeatKind} seat), ` +
      `walked ${walkedPath || '—'}/${walkedBranch || '?'}, won=${won}, maxTier=${maxTierSeen}\n` +
      `# window: the announce through the run's end (${capture.length - start} SAY lines)\n\n` +
      capture.slice(start).join('\n') + '\n');
  }
  return rec;
}

(async () => {
  if (MODE === 'det') {
    const a = await runSeed(SEEDS[0], DAYS);
    const b = await runSeed(SEEDS[0], DAYS);
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    console.log('DET ' + (sa === sb ? 'GREEN byte-identical' : 'RED differs'));
    if (sa !== sb) { console.log('a bytes', sa.length, 'b bytes', sb.length); process.exit(1); }
    return;
  }
  if (MODE === 'smoke') {
    const r = await runSeed(SEEDS[0], DAYS);
    console.log(`SMOKE seed=${r.seed} announceDay=${r.announceDay} satDay=${r.satDay} seat=${r.satSeatKind} maxTier=${r.maxTier} tiersVoiced=${JSON.stringify(r.tierNarration)} weeks=${r.windowWeeks} sayLines=${r.windowSayLines} teleEvents=${r.windowTeleEvents} deferBeats=${r.deferBeats} path=${r.walkedPath}/${r.walkedBranch} won=${r.won} end=${r.endReason} alive=${r.census.alive}`);
    return;
  }
  const out = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS);
    out.push({ seed: r.seed, announceDay: r.announceDay, satDay: r.satDay, seat: r.satSeatKind, maxTier: r.maxTier, weeks: r.windowWeeks, sayLines: r.windowSayLines, teleEvents: r.windowTeleEvents, deferBeats: r.deferBeats, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive });
    console.log(JSON.stringify(out[out.length - 1]));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
