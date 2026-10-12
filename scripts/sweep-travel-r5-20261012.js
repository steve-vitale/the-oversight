#!/usr/bin/env node
// sweep-travel-r5-20261012.js — TRAVEL & REGIONAL lever r5: the upper-ladder audit.
// 12 seeds x 200d, POLICY=winseek|fedseek. fedseek = winseek + fed survival
// floor (SIM INSTRUMENT ONLY — see scripts/policies/winseek.js fedFloorRoad;
// never shipped as game code). The only difference between arms is that the
// pantry never drops below 3 days of village food.
//
// Before/after on IDENTICAL seeds: fed vs unfed. Verdict rule: if the ladder
// climbs when fed, travel's machinery is honest end to end and the food wall
// is THE binding constraint. If anything still doesn't reach when fed —
// that's travel's real blank.
//
// Per-run telemetry:
//   scaleRank trajectory (regional/national/global day), national shape staged
//   + answered (lead/belong/covenant/trade/conquest), beat transcripts staged
//   (First Court, Iron Court, Binding, Founding Council, Charter, Watchers,
//   refuse-the-scale), foreign polity max size, tribute arrears, wave reach
//   1-5 (deedState().wavesFaced), Arc reach (state.prog.arc/arcSeen),
//   tableSeat() (full/lesser/none + detail), deedGateReady(), Game.won,
//   catch-up calls, gestures, loans, death line, ctx counters.
//
// Env: POLICY=winseek|fedseek SEEDS=1-12 DAYS=200 OUT=scripts/sweep-travel-r5-fed-s1.json
// Shard-friendly: SEEDS="1-6" OUT=scripts/sweep-travel-r5-fed-s1.json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { winseek, fedseek } = require('./policies/winseek');

const DAYS = parseInt(process.env.DAYS || '200', 10);
const POLICY_ID = process.env.POLICY || 'fedseek';
const base = POLICY_ID === 'winseek' ? winseek : fedseek;
const SEEDS = (() => {
  const s = process.env.SEEDS || '1-12';
  if (s.indexOf('-') >= 0) {
    const [a, b] = s.split('-').map(x => parseInt(x, 10));
    const out = []; for (let i = a; i <= b; i++) out.push(i); return out;
  }
  return s.split(',').map(x => parseInt(x, 10));
})();
const OUT = process.env.OUT || path.join(ROOT, 'scripts', 'sweep-travel-r5-' + POLICY_ID + '.json');

// Beat markers for sense-testing transcript capture.
const BEAT_RX = [
  [/The First Court/i, 'beat:first-court'],
  [/Iron Court/i, 'beat:iron-court'],
  [/The Binding/i, 'beat:binding'],
  [/Founding Council/i, 'beat:founding-council'],
  [/The Charter/i, 'beat:charter'],
  // THE WATCHERS (the staged global beat) — match the staging copy, not the
  // ambient villager chatter ("my kid asked if the watchers have favorites"
  // is a fixed r3 pool, not the beat).
  [/THE WORLD IS WATCHING|the galaxy wants a show/i, 'beat:watchers'],
  [/refuse the scale|refused the scale/i, 'beat:refuse'],
];

function deepSample(Game, ctx, S) {
  let day = 0;
  try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
  let rank = '?';
  try { rank = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
  if (day % 7 !== 0) return;
  if (S.weeklyDeep.length && S.weeklyDeep[S.weeklyDeep.length - 1].day === day) return;
  const links = (() => { try { return Game.hierarchyState ? Game.hierarchyState() : []; } catch (e) { return []; } })();
  let arrears = 0, active = 0, maxTrust = 0;
  for (const l of links) {
    if (l.status !== 'active') continue;
    active++;
    arrears += (l.arrears || 0);
    if ((l.trust || 0) > maxTrust) maxTrust = l.trust;
  }
  let fp = [];
  try { fp = Game.foreignPolities ? Game.foreignPolities() : []; } catch (e) {}
  const fpSizes = fp.map(f => 1 + ((f.subs || []).length));
  let stir = 0;
  try { stir = Game.state._regionStir || 0; } catch (e) {}
  // national shape staged (pendingNational live)
  let pnShape = null;
  try { const pn = Game.state.pendingNational; if (pn) pnShape = (pn.led ? 'lead:' : '') + (pn.shape || '?'); } catch (e) {}
  // viewership (the global bar: national + viewership >= 40 stages the Watchers)
  let view = null;
  try { view = Game.havenViewership ? Game.havenViewership() : null; } catch (e) {}
  S.weeklyDeep.push({ day, rank, stir, fp: fpSizes.slice(), pnShape, view, arrears, active, maxTrust });
}

const policy = Object.assign({}, base, {
  id: 'travelwinseek-r5-' + POLICY_ID,
  daily(Game, ctx) {
    policy._ctx = ctx; // runDays doesn't return ctx; read it off the policy
    try { if (base.daily) base.daily(Game, ctx); } catch (e) {}
    try {
      if (!Game._travelR5) {
        Game._travelR5 = {
          weeklyDeep: [],
          catchUp: { calls: 0, villages: {} },
          loans: { issued: 0 },
          gestures: 0,
          natStaged: {},      // shape -> count of staged beats
          natAnswered: {},     // shape -> [choices]
          beats: {},           // beat marker -> count
          beatLines: {},       // beat marker -> sample lines (sense-testing)
          sayLines: [],
        };
        const oc = Game.catchUpSim.bind(Game);
        Game.catchUpSim = function (v) {
          try {
            Game._travelR5.catchUp.calls++;
            const id = v && v.id;
            if (id) Game._travelR5.catchUp.villages[id] = (Game._travelR5.catchUp.villages[id] || 0) + 1;
          } catch (e) {}
          return oc(v);
        };
        const oANC = Game.answerNationalChoice ? Game.answerNationalChoice.bind(Game) : null;
        if (oANC) {
          Game.answerNationalChoice = function (choice) {
            let shape = '?';
            try { const pn = Game.state.pendingNational; if (pn) shape = (pn.led ? 'lead:' : '') + (pn.shape || '?'); } catch (e) {}
            let r = null;
            try { r = oANC(choice); } catch (e) { r = null; }
            try {
              if (r) {
                Game._travelR5.natAnswered[shape] = Game._travelR5.natAnswered[shape] || [];
                Game._travelR5.natAnswered[shape].push(choice);
              }
            } catch (e) {}
            return r;
          };
        }
        const oSay = Game.say.bind(Game);
        Game.say = function (m) {
          try {
            if (typeof m === 'string') {
              const D = Game._travelR5;
              if (/walks out to sit at|walks out to serve/.test(m)) D.loans.issued++;
              if (/first gesture|2,000 kcal walks|walks out to sit at|ink dries on its own/.test(m)) D.gestures++;
              for (const [rx, tag] of BEAT_RX) {
                if (rx.test(m)) {
                  D.beats[tag] = (D.beats[tag] || 0) + 1;
                  if (!D.beatLines[tag]) D.beatLines[tag] = [];
                  if (D.beatLines[tag].length < 12) D.beatLines[tag].push(m.slice(0, 600));
                }
              }
              if (D.sayLines.length < 6000) D.sayLines.push(m);
            }
          } catch (e) {}
          return oSay(m);
        };
      }
      // record staged national shapes while pending
      try {
        const pn = Game.state.pendingNational;
        if (pn) {
          const shape = (pn.led ? 'lead:' : '') + (pn.shape || '?') + '|day' + ((Game.state.scholar || {}).day || 0);
          Game._travelR5.natStaged[shape] = (Game._travelR5.natStaged[shape] || 0) + 1;
        }
      } catch (e) {}
      deepSample(Game, ctx, Game._travelR5);
    } catch (e) {}
  },
});

function commitSha() {
  try { return require('child_process').execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) { return '?'; }
}

function waveReach(Game) {
  const out = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, monsters: {} };
  try {
    const d = Game.deedState ? Game.deedState() : {};
    const faced = (d && d.wavesFaced) || {};
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      if (w >= 1 && w <= 5) { out[w]++; out.monsters[mid] = w; }
    }
  } catch (e) {}
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    const t0 = Date.now();
    let row;
    try {
      const { Game, manifest: mf } = await loadGame({ seed, mode: policy.id, fullTelemetry: false });
      await setupGame(Game);
      const res = await runDays(Game, policy, { days: DAYS, manifest: mf });
      const D = Game._travelR5 || {};
      const over = (D.sayLines || []).filter(m => /scattering|No one is left|dies out|season ends|wiped out|village is gone/i.test(m));
      let regDay = null, natDay = null, globDay = null, fpMax = 0, arrearsMax = 0;
      for (const w of (D.weeklyDeep || [])) {
        if (w.rank === 'regional' && regDay == null) regDay = w.day;
        if ((w.rank === 'national' || w.rank === 'global') && natDay == null) natDay = w.day;
        if (w.rank === 'global' && globDay == null) globDay = w.day;
        for (const s of (w.fp || [])) if (s > fpMax) fpMax = s;
        if ((w.arrears || 0) > arrearsMax) arrearsMax = w.arrears;
      }
      let rankFinal = '?';
      try { rankFinal = Game.scaleRank ? Game.scaleRank() : '?'; } catch (e) {}
      let seat = { seat: '?', detail: {} };
      try { if (Game.tableSeat) seat = Game.tableSeat(); } catch (e) {}
      let deedGate = null;
      try { deedGate = Game.deedGateReady ? Game.deedGateReady() : null; } catch (e) {}
      let arc = null, arcSeen = [];
      try { const pg = Game.progState ? Game.progState() : {}; arc = pg.arc == null ? null : pg.arc; arcSeen = Object.keys(pg.arcSeen || {}).map(Number); } catch (e) {}
      let won = false;
      try { won = !!Game.won; } catch (e) {}
      let pop = 0;
      try { pop = ((Game.state.village || {}).roster || []).length; } catch (e) {}
      let ctxOut = {};
      try { const rc = policy._ctx || {}; ctxOut = { nationalAnswered: rc.nationalAnswered || 0, globalAnswered: rc.globalAnswered || 0, gestures: D.gestures || 0, fedKcal: rc.fedKcal || 0, fedDays: rc.fedDays || 0 }; } catch (e) {}
      row = {
        seed, days: res.days, gameDays: res.gameDays, endReason: res.endReason,
        deathLine: over.length ? over[over.length - 1].slice(0, 160) : null,
        regDay, natDay, globDay, rankFinal,
        natStaged: D.natStaged || {}, natAnswered: D.natAnswered || {},
        beats: D.beats || {}, beatLines: D.beatLines || {},
        fpMax, arrearsMax,
        waves: waveReach(Game),
        arc, arcSeen,
        seat: seat.seat, seatDetail: seat.detail || {},
        deedGate: deedGate ? { ok: !!deedGate.ok } : null,
        won, pop,
        catchUpCalls: (D.catchUp || {}).calls || 0,
        loansIssued: (D.loans || {}).issued || 0,
        ctx: ctxOut,
        weekly: D.weeklyDeep || [],
        ms: res.ms,
      };
    } catch (e) {
      row = { seed, error: String(e && e.message || e) };
    }
    row.msTotal = Date.now() - t0;
    rows.push(row);
    console.log(JSON.stringify({ seed, days: row.days, endReason: row.endReason, rank: row.rankFinal, nat: row.natDay, glob: row.globDay, seat: row.seat, won: row.won, ms: row.msTotal }));
  }
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), days: DAYS, seeds: SEEDS, policy: POLICY_ID, commit: commitSha(), rows }, null, 1));
  console.log('wrote ' + OUT + ' (' + rows.length + ' rows)');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
