#!/usr/bin/env node
// probe-tableaudit-20261021.js — journey-endgame r35 (lane B, 2026-10-21).
//
// LEG QUESTION: after the Table is announced and a village with wave-4/5
// deeds sits, does the seated audit read the run back honestly? (r34 blank
// #1: the lesser-seat audit hardcoded "waves 1–3 faced".) Plus a fresh
// sense-read of the played challenge beats on the current base.
//
// PRIMARY (binding, pre-registered): on every pilot run that sits with
// nonzero w4 or w5 deeds, the seated audit line names the w4/w5 counts.
// GO = 0 silent omissions across the pilot.
//
// SUBSTRATE: CAPABLE bot + CAPABLE_GREEDY=1 (deferral design), MAXTIER=6,
// LASTDAY=170, TELEMETRY_FULL=1. POLICY-SIDE ONLY — the game fix is in
// table.js and is proven by test-tableaudit-20261021.js; this probe measures
// it in play (sweep-identical substrate to r34).
//
// Usage:
//   CAPABLE_GREEDY=1 CAPABLE_GREEDY_MAXTIER=6 CAPABLE_GREEDY_LASTDAY=170 \
//     TELEMETRY_FULL=1 node scripts/probe-tableaudit-20261021.js
//   SMOKE=1 ...  # 1 seed x 120d
//   DET=1 ...    # instrument-on twice byte-identical (2 seeds x 120d)
//   SEEDS="81001,81002" DAYS=180 ...
'use strict';
const fs = require('fs');
const path = require('path');
const CAP = require('./policies/capable');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

if (process.env.CAPABLE_GREEDY !== '1') { console.error('SWEEP STOP: CAPABLE_GREEDY=1 required.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [81001, 81002, 81003, 81004]).filter(Number.isFinite);
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10)
  : (MODE === 'smoke' ? 120 : MODE === 'det' ? 120 : 180);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-tableaudit');

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
      alive: people.filter(p => !p.dead).length, dead: people.filter(p => p.dead).length,
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
    capture.push(s);                    // no total cap: the seated window is
                                        // at the END of the run (r34 scale OK)
  };
  let announceDay = null, satDay = null, satSeatKind = null, satWaves = null;
  let walkedPath = null, walkedBranch = null, finalChoice = null, won = false;
  let instrumentErrors = 0;
  const ctx = {};

  const { Game } = await loadGame({ seed, mode: 'tableaudit', fullTelemetry: true });
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
      if (pg.tableAnnounced && announceDay == null) { announceDay = d; }
      if (pg.tableDone && satDay == null) {
        satDay = d; satWaves = wavesOf(G);
        // tablePreview() returns null once tableDone — read the locked seat
        try { const st = G.tableSeat ? G.tableSeat() : null; satSeatKind = st ? st.seat : null; } catch (e) {}
      }
      if (c && c.capTablePath) walkedPath = walkedPath || c.capTablePath;
      try { const T = G.tableState ? G.tableState() : {}; if (T.path) walkedPath = T.path; if (T.branch) walkedBranch = T.branch; } catch (e) {}
    } catch (e) { instrumentErrors++; }
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  won = !!Game.won;

  // ---- the audit line as spoken ------------------------------------
  const auditIdx = capture.findIndex(s => s.indexOf('◈ THE AUDIT') === 0);
  const auditLine = auditIdx >= 0 ? capture[auditIdx] : null;
  const w45 = satWaves ? (satWaves.w4 | 0) + (satWaves.w5 | 0) : 0;
  let auditNamed = null;   // PRIMARY datum: null when no w4/w5 to name
  if (auditLine && satWaves && w45 > 0) {
    if (satSeatKind === 'full') {
      // The full-seat line says "every wave faced" — that IS the naming;
      // the r34 blank was the lesser line only.
      auditNamed = /every wave faced/.test(auditLine);
    } else {
      const namesW4 = (satWaves.w4 | 0) > 0 ? /wave-4/.test(auditLine) : true;
      const namesW5 = (satWaves.w5 | 0) > 0 ? /wave-5/.test(auditLine) : true;
      auditNamed = namesW4 && namesW5;
    }
  } else if (auditLine && satWaves && w45 === 0) {
    auditNamed = true;     // nothing to name: the silence is honest
  }
  // table telemetry: path walked, final choice, won
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
    walkedPath, walkedBranch, instrumentErrors, telemetry: tele,
    census: censusOf(Game),
  };
  if (process.env.DET !== '1') {
    try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
    writeFileRetry(path.join(EVID, `tableaudit-r35-${seed}.json`), JSON.stringify(rec, null, 1));
    // sense-read transcript: the seated stretch — from the announce through
    // the run's end (announce -> tiers -> audit -> challenge -> final + coda)
    const annIdx = capture.findIndex(s => s.indexOf('◈ THE TABLE IS SET') === 0);
    const start = Math.max(0, annIdx >= 0 ? annIdx : (auditIdx >= 0 ? auditIdx : 0));
    writeFileRetry(path.join(EVID, `tableaudit-r35-${seed}-transcript.txt`),
      `# journey-endgame r35 — seed ${seed}, announced d${announceDay}, sat day ${satDay} (${satSeatKind} seat), ` +
      `walked ${walkedPath || '—'}/${walkedBranch || '?'}, won=${won}\n` +
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
    console.log(`SMOKE seed=${r.seed} announceDay=${r.announceDay} satDay=${r.satDay} seat=${r.satSeatKind} waves=${JSON.stringify(r.satWaves)} auditNamed=${r.auditNamed} path=${r.walkedPath} won=${r.won} end=${r.endReason}`);
    return;
  }
  const out = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS);
    out.push({ seed: r.seed, announceDay: r.announceDay, satDay: r.satDay, seat: r.satSeatKind, waves: r.satWaves, auditNamed: r.auditNamed, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive });
    console.log(JSON.stringify(out[out.length - 1]));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
