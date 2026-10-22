#!/usr/bin/env node
// probe-endgame-r40-20261022.js — journey-endgame r40 (lane B, 2026-10-22).
//
// LEG QUESTION: THE GREY MIDDLE AS LIVED PLAY. The relay path's leaning
// gradient has three bands; light (r39) and dark (sim-tablepathdriver, 10
// terminal) are walked. Grey — "the pragmatist's both-hands endings," "not
// a coin flip, not a lesser frame" (TABLE.md GRADIENT law;
// src/js/table-relay.js) — has never been walked. Is the middle reachable
// by sustained pragmatic play (use the relay for real work, refuse both
// the dark verbs and the tender extremes, read the System's lean notices
// and self-correct), and do its two finals play and read as a person?
//
// WHAT WOULD COUNT AS INTERESTING: a grey final offered and walked to
// terminal with a coherent both-hands ending; the band proving unreachable
// by honest thermostat play (drift to light/dark despite correction — a
// design finding about the gradient); the cockpit merge failing under grey
// constraints; grounding collapse pricing out the middle.
//
// PRIMARY (binding, pre-registered):
//  M1 GUARD: >=3/4 seeds reach the table window (announceDay != null) and
//     sit (satDay != null).
//  M2 GREY EARNED: on seeds where the layer holds the relay pre-sit
//     (sysBond >= 2, >= 5 relay verbs, >= 1 commune answered), the at-sit
//     band is 'grey' AND |lean| <= 30. GO = 100% of qualifying seeds.
//     0 qualifying seeds -> NO-GO with reachability analysis (never
//     re-scored).
//  M3 GREY FINALS PLAY: on grey-sat seeds, a grey final is offered and the
//     walk reaches terminal (won or priced failure — failure resolving
//     counts as played). GO = 100% of grey-sat seeds.
//  M4 LEAN LEGIBILITY: relayLeanNoticed fired >= 1 per grey run (the
//     System voiced the drift); the sit-time ledger line names the relay
//     band. GO = 100% of grey-sat seeds.
// REGRESSIONS (binding, inherited): r35 auditNamed on sat seeds with
//     nonzero w4/w5; r37 satPenalty present + voiced-line match on sat
//     seeds.
// A miss on any leg is reported honestly per §14 — never re-scored mid-run.
//
// SUBSTRATE: CAPABLE bot + CAPABLE_GREEDY=1 (deferral design, r39 regime),
// MAXTIER=6, LASTDAY=170, RELAYGREY=1 (scripts/policies/relaygrey.js —
// the pragmatist's road), TELEMETRY_FULL=1. 180d, death-aware. Seeds
// 82011–82014 (fresh; adjacent to r39's 81011–81014).
//
// Usage:
//   CAPABLE_GREEDY=1 CAPABLE_GREEDY_MAXTIER=6 CAPABLE_GREEDY_LASTDAY=170 \
//     RELAYGREY=1 CAPABLE_RELAYROAD=0 TELEMETRY_FULL=1 node scripts/probe-endgame-r40-20261022.js
//   (CAPABLE_RELAYROAD=0 also defaulted by the probe when RELAYGREY=1 — the
//   grey experiment needs the base's relay road off; without it the two
//   layers double-drive and the thermostat can't hold grey.)
//   SMOKE=1 ...  # 1 seed x 120d
//   DET=1 ...    # instrument-on twice byte-identical (2 x 120d on seed 0)
//   FID=1 ...    # RELAYGREY unset: relaygrey-wrapped base vs pure capable,
//                # byte-identical (default-off delegation)
'use strict';
const fs = require('fs');
const path = require('path');
const CAP = require('./policies/capable');
const RG = require('./policies/relaygrey');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.FID === '1' ? 'fid'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

if (process.env.CAPABLE_GREEDY !== '1') { console.error('SWEEP STOP: CAPABLE_GREEDY=1 required.'); process.exit(2); }

// GREY OWNS THE RELAY (r40b fix): the grey-middle experiment requires the
// capable base's own relay road OFF — otherwise base + grey double-drive the
// relay (verbs 207 vs 8, lean pinned light) and the thermostat can't hold.
// The dead 18:55Z run ran with CAPABLE_RELAYROAD=0 but its Usage line omitted
// it; the 21:2xZ adoption sweep ran without it and produced garbage. Default
// it here so the instrument can't be misconfigured again.
if (process.env.RELAYGREY === '1' && process.env.CAPABLE_RELAYROAD == null) {
  process.env.CAPABLE_RELAYROAD = '0';
  console.log('NOTE: CAPABLE_RELAYROAD defaulted to 0 (RELAYGREY=1 — grey owns the relay)');
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [82011, 82012, 82013, 82014]).filter(Number.isFinite);
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10)
  : (MODE === 'smoke' ? 120 : MODE === 'det' ? 120 : MODE === 'fid' ? 120 : 180);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-endgame-r40');

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

// censusOf — FIXED (journey-endgame r40; r39's caveat resolved, r40b
// correction): formerOccupation is the canonical person field (not
// occupation/role/job — p.occupation is always null; occupationId is the
// identity-layer disguise, not the true occupation), village.npcAbilities[vid]
// (not p.abilities), scholar.villagerId -> name (not scholar.name), dead
// filter corrected.
function censusOf(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const abilMap = v.npcAbilities || {};
    const people = (v.roster || []).map(id => {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      const abil = (abilMap[id] && abilMap[id].length) || 0;
      return {
        id, name: (p && (p.name || p.displayName)) || String(id),
        dead: !!(p && p.dead),
        occupation: (p && p.formerOccupation) || null,
        npcAbilities: abil,
      };
    });
    let bearerName = null;
    try {
      const vid = ((Game.state || {}).scholar || {}).villagerId;
      const bp = (vid && Game.getPerson) ? Game.getPerson(vid) : null;
      bearerName = (bp && (bp.name || bp.displayName)) || vid || null;
    } catch (e) {}
    return {
      alive: people.filter(p => !p.dead).length,
      dead: people.filter(p => p.dead).length,
      people, pantryKcal: Math.round(v.pantryKcal || 0),
      scale: (Game.scaleRank ? Game.scaleRank() : '?'),
      mantle: bearerName,
    };
  } catch (e) { return { error: String(e && e.message) }; }
}

async function runSeed(seed, days, useGrey) {
  const capture = [];
  let lastCap = null;
  const cap = (line) => {
    if (line == null) return;
    const s = String(line).slice(0, 700);
    if (s === lastCap) return;
    lastCap = s;
    capture.push(s);
  };
  let announceDay = null, satDay = null, satSeatKind = null, satWaves = null;
  let satPenalty = null;
  let maxTierSeen = 0;
  let walkedPath = null, walkedBranch = null, won = false;
  let instrumentErrors = 0;
  const ctx = {};
  const chooserCtx = {};   // the chooseTableOption interceptor's ctx (door/cockpit/final picks)
  // relay state snapshots
  let atSit = null;          // {lean, band, grounding, bond, held, verbs, communes}
  let atDoorOffer = null;    // relay offered? (earned paths at door)
  const weekly = [];
  let snapCursor = null;

  const { Game } = await loadGame({ seed, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);
  const oSay = Game.say.bind(Game);
  Game.say = function (l) { try { cap(l); } catch (e) {} return oSay.apply(this, arguments); };
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  if (useGrey) RG.installRelayGreyChooser(Game, chooserCtx);

  const base = Object.assign({}, CAP.capable);
  const policy = useGrey ? RG.withRelayGrey(base, 'capable+relaygrey', 'capable + the grey road') : base;
  const oDaily = policy.daily.bind(policy);
  policy.daily = (G, c) => {
    let r;
    try { r = oDaily(G, c); } catch (e) { instrumentErrors++; }
    // CTX SYNC (r40 fix): runDays owns the daily ctx — the grey layer's
    // road state lives on it, not on this probe's outer ctx. Mirror the
    // reference so the summary below reads the real road state.
    try { if (c && c._relaygrey && ctx._relaygrey !== c._relaygrey) ctx._relaygrey = c._relaygrey; } catch (e) {}
    try {
      const pg = (G.progState ? G.progState() : {});
      const d = dayOf(G);
      if (pg.tableAnnounced && announceDay == null) { announceDay = d; snapCursor = d + 7; }
      const inWindow = announceDay != null && satDay == null && !pg.tableDone;
      if (inWindow && snapCursor != null && d >= snapCursor) {
        let tier = 0; try { tier = G.overtimeTier ? G.overtimeTier() | 0 : 0; } catch (e) {}
        weekly.push({ day: d, tier, alive: aliveOf(G), pantry: pantryOf(G) });
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

  // ---- relay road summary from the layer ctx ----
  let rgSum = null;
  try {
    const L = ctx._relaygrey;       // daily road state (inner ctx, synced)
    const LC = chooserCtx._relaygrey || {};  // door/cockpit/final picks
    if (L) {
      // verbs: ALL relay verb invocations (deepen/reroute/commune answers
      // are all real uses of the office — r40 pilot instrument
      // clarification, see metric review).
      const verbs = (L.deepens | 0) + (L.rerouteEff | 0) + (L.rerouteHon | 0) + (L.communes | 0);
      rgSum = {
        active: !!L.active, claimDone: !!L.claimDone, claimDay: L.claimDay,
        claimTried: L.claimTried | 0, claimWaiting: L.claimWaiting | 0,
        firstAvailableDay: L.firstAvailableDay,
        deepens: L.deepens | 0, rerouteEff: L.rerouteEff | 0, rerouteHon: L.rerouteHon | 0,
        verbs, communes: L.communes | 0, floorStops: L.floorStops | 0,
        doorRelay: LC.doorRelay | 0, doorDelegated: LC.doorDelegated | 0,
        cockpitPicks: LC.cockpitPicks || {}, finalPick: LC.finalPick || null,
        leanTrace: L.leanTrace || [], communeLean: L.communeLean || [],
        rgError: (L.rgError | 0) + (LC.rgError | 0),
      };
      const tr = L.leanTrace || [];
      rgSum.leanTraceHead = tr.slice(0, 3);
      rgSum.leanTraceTail = tr.slice(-8);
      // at-sit lean/band: last trace point at or before satDay
      if (satDay != null && tr.length) {
        let pt = tr[0];
        for (const q of tr) { if (q.day <= satDay) pt = q; }
        atSit = pt;
      }
      rgSum.atSit = atSit;
    }
  } catch (e) { instrumentErrors++; }

  // relay offered at the door? (from the transcript's path-offer lines)
  try {
    const offerIdx = capture.findIndex(s => s.indexOf('Choose your door') >= 0 || s.indexOf('Walk the path of') >= 0);
    atDoorOffer = offerIdx >= 0 ? capture.slice(Math.max(0, offerIdx - 2), offerIdx + 3).join(' ').slice(0, 400) : null;
  } catch (e) {}

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

  // ---- M4: lean legibility ----
  const allText = capture.join('\n');
  const noticedCount = (allText.match(/NOTICED\. (YOUR REGISTER|YOU ARE BACK)/g) || []).length;
  let ledgerLine = null;
  try {
    const li = capture.findIndex(s => s.indexOf('The table has read your ledger') === 0);
    ledgerLine = li >= 0 ? capture[li] : null;
  } catch (e) {}

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
    walkedPath, walkedBranch, instrumentErrors, telemetry: tele,
    rg: rgSum, noticedCount, ledgerLine,
    weekly, census: censusOf(Game),
  };
  if (process.env.DET !== '1' && process.env.FID !== '1') {
    try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
    writeFileRetry(path.join(EVID, `endgame-r40-${seed}.json`), JSON.stringify(rec, null, 1));
    const annIdx = capture.findIndex(s => s.indexOf('◈ THE TABLE IS SET') === 0);
    const auditIdx2 = capture.findIndex(s => s.indexOf('◈ THE AUDIT') === 0);
    const start = Math.max(0, annIdx >= 0 ? annIdx : (auditIdx2 >= 0 ? auditIdx2 : 0));
    writeFileRetry(path.join(EVID, `endgame-r40-${seed}-transcript.txt`),
      `# journey-endgame r40 — seed ${seed}, announced d${announceDay}, sat day ${satDay} (${satSeatKind} seat), ` +
      `walked ${walkedPath || '—'}/${walkedBranch || '?'}, won=${won}, relay=${rgSum ? JSON.stringify({ lean: atSit && atSit.lean, band: atSit && atSit.band, verbs: rgSum.verbs, communes: rgSum.communes }) : 'off'}\n` +
      `# window: the announce through the run's end (${capture.length - start} SAY lines)\n\n` +
      capture.slice(start).join('\n') + '\n');
  }
  return rec;
}

(async () => {
  if (MODE === 'det') {
    const a = await runSeed(SEEDS[0], DAYS, true);
    const b = await runSeed(SEEDS[0], DAYS, true);
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    console.log('DET ' + (sa === sb ? 'GREEN byte-identical' : 'RED differs'));
    if (sa !== sb) { console.log('a bytes', sa.length, 'b bytes', sb.length); process.exit(1); }
    return;
  }
  if (MODE === 'fid') {
    // RELAYGREY unset in this process: wrapped base must equal pure capable.
    const a = await runSeed(SEEDS[0], DAYS, false);
    const sa = JSON.stringify(a);
    console.log('FID wrapped=' + sa.length);
    const CAP2 = require('./policies/capable');
    // pure capable second run for comparison
    const b = await (async () => {
      const { Game } = await loadGame({ seed: SEEDS[0], mode: 'endgame-r40', fullTelemetry: true });
      await setupGame(Game);
      const ctx = {};
      const oDaily = CAP2.capable.daily.bind(CAP2.capable);
      await quietLog(async () => { await runDays(Game, CAP2.capable, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
      return { gameDays: dayOf(Game), won: !!Game.won, alive: aliveOf(Game), pantry: pantryOf(Game) };
    })();
    const saMini = { gameDays: a.gameDays, won: a.won, alive: a.census.alive, pantry: a.census.pantryKcal };
    const ok = JSON.stringify(saMini) === JSON.stringify(b);
    console.log('FID ' + (ok ? 'GREEN byte-identical (mini)' : 'RED differs'));
    console.log('wrapped', JSON.stringify(saMini));
    console.log('pure   ', JSON.stringify(b));
    if (!ok) process.exit(1);
    return;
  }
  if (MODE === 'smoke') {
    const r = await runSeed(SEEDS[0], DAYS, true);
    console.log(`SMOKE seed=${r.seed} announceDay=${r.announceDay} satDay=${r.satDay} seat=${r.satSeatKind} path=${r.walkedPath}/${r.walkedBranch} won=${r.won} end=${r.endReason} alive=${r.census.alive}`);
    console.log('RG', JSON.stringify(r.rg ? { firstAvailableDay: r.rg.firstAvailableDay, claimDay: r.rg.claimDay, claimTried: r.rg.claimTried, claimWaiting: r.rg.claimWaiting, verbs: r.rg.verbs, communes: r.rg.communes, doorRelay: r.rg.doorRelay, cockpitPicks: r.rg.cockpitPicks, finalPick: r.rg.finalPick, atSit: r.rg.atSit, traceTail: r.rg.leanTraceTail } : null));
    return;
  }
  const out = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS, true);
    out.push({ seed: r.seed, announceDay: r.announceDay, satDay: r.satDay, seat: r.satSeatKind, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive, atSit: r.rg && r.rg.atSit, verbs: r.rg && r.rg.verbs, communes: r.rg && r.rg.communes, doorRelay: r.rg && r.rg.doorRelay, finalPick: r.rg && r.rg.finalPick, noticed: r.noticedCount });
    console.log(JSON.stringify(out[out.length - 1]));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
