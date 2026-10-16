#!/usr/bin/env node
'use strict';
// scripts/seatvoice-20261016.js — sim-seatvoice: villager voice about the
// seat, on the WINNING substrate (flesh-out loop, 2026-10-16, scale-onramp
// axis, villager-personhood diagnostic).
//
// DIAGNOSTIC INSTRUMENT — READ ONLY. Zero src/js changes, zero policy
// changes. Captures every Game.say beat across 16 full runs and classifies
// every villager-speech beat as table-related or not (the pre-registered
// classification rule lives in evidence/2026-10-16/sim-seatvoice.md).
//
// Substrate (the winning stack; method finding #389 — seatdrive.js is a
// COMPOSITION WRAPPER, so the driver is composed explicitly here via
// SD.leadseat / SD.belongseat; "SEATDRIVE unset" without composition runs
// the pre-seat substrate regardless of c004b9dd's default-ON flip):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 (asserted)
//   WINPURSUIT=1 WINDEFER=1 (set inside, the seatdefault sweep pattern)
//   SEATDRIVE must NOT be '0' (the wrapper's layerOn() is the only gate)
// Policies: SD.leadseat / SD.belongseat (withSeatDrive-wrapped tribfloor base).
// Seeds: 8 FRESH [105,216,327,438,549,650,761,872] x {leadfeast, belongfeast}
//   = 16 runs, armed-only. Horizon: 180d death-aware.
//
// Outputs:
//   evidence/2026-10-16/perseed-seatvoice/{policy}-s{seed}.json — numeric keys
//   evidence/2026-10-16/seatvoice-beats/{policy}-s{seed}.json — every beat,
//     classified (cat + villagerBeat), table-topic overlay, seat-day relation,
//     events, roster snapshots.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/seatvoice-20261016.js
//   ... SMOKE=1 node scripts/seatvoice-20261016.js        # 2 seeds x 2 policies x 10d
//   ... DET=1 node scripts/seatvoice-20261016.js          # det-gate only
// Targeted re-runs: SEEDS="105,216" ONLY="leadfeast,belongfeast"
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { extractText, classify } = require('./villagevoice-lib-20261016');
const { tableTopic, stanceOf, contextOf } = require('./seatvoice-table-20261016');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`seatvoice: need ${k}=1 (substrate)`); process.exit(2); }
}
if (process.env.SEATDRIVE === '0') { console.error('seatvoice: SEATDRIVE=0 opts OUT of the seat driver — this sweep needs it composed and ON'); process.exit(2); }
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';

const SMOKE = process.env.SMOKE === '1';
const DET = process.env.DET === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map((s) => parseInt(s.trim(), 10)) : [105, 216, 327, 438, 549, 650, 761, 872]).filter(Number.isFinite);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map((s) => s.trim()).filter(Boolean) : null;
const DAYS = SMOKE ? 10 : 180;
const POLICIES = { leadfeast: SD.leadseat, belongfeast: SD.belongseat };
const ROOT = path.join(__dirname, '..');
const PERSEED_DIR = path.join(ROOT, 'evidence', '2026-10-16', 'perseed-seatvoice');
const BEATS_DIR = path.join(ROOT, 'evidence', '2026-10-16', 'seatvoice-beats');
if (!DET && !SMOKE) for (const d of [PERSEED_DIR, BEATS_DIR]) fs.mkdirSync(d, { recursive: true });

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const RANK_ORDER = { village: 1, regional: 2, national: 3, global: 4 };

function personRow(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (!p) return { vid: String(vid), missing: true };
    let name = null;
    try { name = Game.displayName ? Game.displayName(vid) : (p.name || String(vid)); } catch (e) { name = p.name || String(vid); }
    return { vid: String(vid), name: String(name || vid).slice(0, 40), occ: ((p.occupationId || p.formerOccupation || p.occupation || '?') + '').slice(0, 40), dead: !!p.dead };
  } catch (e) { return { vid: String(vid), err: true }; }
}

function rosterSnapshot(Game) {
  try { return ((Game.state.village || {}).roster || []).map((vid) => personRow(Game, vid)); }
  catch (e) { return []; }
}

// runOne(policyId, seed, opts) -> { ps, beats, events, ... }
// opts.instrument: true = attach the Game.say capture + seat telemetry
// (the det-gate's read-only twin). False = bare policy (control).
async function runOne(policyId, seed, opts) {
  opts = opts || {};
  const instrument = opts.instrument !== false;
  const base = POLICIES[policyId];
  const { Game } = await loadGame({ seed, mode: `seatvoice-${policyId}` });
  await setupGame(Game);

  const beats = [];
  const events = [];
  const seat = { inviteDay: null, sitDay: null, seatType: null };
  const hist = { maxRank: 0, exiled: false };
  let rosterStart = null;
  const snaps = [];

  if (instrument) {
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const t = extractText(msg);
        if (t) beats.push({ d: day(Game), t });
      } catch (e) {}
      return origSay(msg);
    };
  }
  const origTele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'death' || type === 'contest_fired' || type === 'contest_end') {
        let who = null;
        try {
          const wid = (data && (data.who || data.vid)) || null;
          if (wid) who = (personRow(Game, wid).name || String(wid));
        } catch (e) {}
        events.push({ d: day(Game), type, who, cause: (data && (data.cause || data.kind)) || null });
      }
    } catch (e) {}
    return origTele.apply(this, arguments);
  };

  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  const sampleSeat = (G) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting && seat.inviteDay == null) seat.inviteDay = day(G);
      if (pg.tableDone && seat.sitDay == null) {
        seat.sitDay = day(G);
        try { seat.seatType = (G.tableSeat ? G.tableSeat().seat : null) || null; } catch (e) { seat.seatType = null; }
      }
    } catch (e) {}
  };
  policy.daily = (G, ctx) => {
    try {
      // PRE-daily sample: catches invitations that pend across dawns.
      if (instrument) sampleSeat(G);
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (day(G) % 30 === 0) snaps.push({ d: day(G), roster: rosterSnapshot(G) });
    } catch (e) {}
    const r = oDaily ? oDaily(G, ctx) : undefined;
    // POST-daily sample: on the winning substrate the whole
    // invite→sit→resolve sequence drains inside ONE daily (the drain plays
    // the modal the dawn it appears), so the pre-daily sample of the next
    // dawn never happens — the run ends on the win. Read-only.
    try { if (instrument) sampleSeat(G); } catch (e) {}
    return r;
  };

  rosterStart = rosterSnapshot(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const rosterEnd = rosterSnapshot(Game);

  // --- post-run classification (instrumented runs only) ---
  let dist = {}, villagerBeats = 0, tableRelated = 0, villagerVoicedTable = 0, topDownTable = 0;
  const deathDay = {};
  for (const e of events) if (e.type === 'death' && e.who) deathDay[e.who] = Math.min(deathDay[e.who] ?? 1e9, e.d);
  if (instrument) {
    const names = [];
    for (const s of [rosterStart, rosterEnd, ...snaps.map((x) => x.roster)]) {
      for (const p of (s || [])) {
        if (p.name && !names.includes(p.name)) names.push(p.name);
        if (p.name) { const first = p.name.split(' ')[0]; if (first && !names.includes(first)) names.push(first); }
      }
    }
    for (const e of events) if (e.who && !names.includes(e.who)) names.push(e.who);
    const seen = new Map();
    for (const b of beats) {
      const c = classify(b.t, { names, seen, deathDay, beatDay: b.d });
      b.c = c.cat;
      b.vb = !!c.villagerBeat;
      if (c.villagerBeat) villagerBeats++;
      dist[c.cat] = (dist[c.cat] || 0) + 1;
      const tp = tableTopic(b.t);
      b.tr = tp.related;
      b.trWhy = tp.reasons;
      if (tp.related) {
        tableRelated++;
        // THE BINDING RULE (evidence/2026-10-16/sim-seatvoice.md): villager-
        // voiced = cat in {dialogue-with-stakes, goal-driven, routine-honest}
        // OR event-reaction/template-fingerprint with villagerBeat — never
        // system-voice, never scholar-action (second-person narrator, even
        // when it names the collective — the "You won" beat is narration,
        // not a villager's mouth). The analyzer re-applies this rule
        // exactly; the inline counter below mirrors it for progress logging.
        const vv = ['dialogue-with-stakes', 'goal-driven', 'routine-honest'].includes(c.cat) ||
          ((c.cat === 'event-reaction' || c.cat === 'template-fingerprint') && c.villagerBeat);
        if (vv) {
          villagerVoicedTable++;
          const st = stanceOf(b.t);
          b.stances = st.stances;
          b.ctx2 = contextOf(b.t);
          b.rel = seat.sitDay != null ? (b.d - seat.sitDay) : null; // days before(-)/after(+) the sitting
        } else {
          topDownTable++;
        }
      }
    }
  }

  const deaths = {};
  try { for (const d of (result.samples.deaths || [])) { const k = String(d.cause || d.kind || 'unknown'); deaths[k] = (deaths[k] || 0) + 1; } } catch (e) {}
  const ps = {
    seed, policyId,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths, won: !!Game.won,
    national: hist.maxRank >= 2 ? 1 : 0,
    table: seat.inviteDay != null ? 1 : 0,
    inviteDay: seat.inviteDay, sitDay: seat.sitDay, seatType: seat.seatType,
    maxWave: result.maxWaveUnlocked || 1,
    exiled: hist.exiled ? 1 : 0,
    beatCount: beats.length, villagerBeats,
    tableRelated, villagerVoicedTable, topDownTable,
  };
  if (instrument && !DET && !SMOKE) {
    fs.writeFileSync(path.join(PERSEED_DIR, `${policyId}-s${seed}.json`), JSON.stringify(ps, null, 1));
    fs.writeFileSync(path.join(BEATS_DIR, `${policyId}-s${seed}.json`), JSON.stringify({
      seed, policyId, seat, distribution: dist, villagerBeats, tableRelated, villagerVoicedTable, topDownTable,
      events, rosterStart, rosterEnd,
      beats,
    }));
  }
  return { ps, beats, events, seat };
}

async function main() {
  if (DET) {
    // det-gate: instrument-on vs instrument-off, 2 seeds x 2 policies, 60d.
    const { checkDeterminism } = require('./det-gate');
    let fails = 0;
    const gateSeeds = [105, 216];
    const policyIds = ONLY || Object.keys(POLICIES);
    for (const pid of policyIds) {
      for (const seed of gateSeeds) {
        const hashesA = [], hashesB = [];
        for (const instrument of [true, false]) {
          const base = POLICIES[pid];
          const { Game } = await loadGame({ seed, mode: `seatvoice-det-${pid}` });
          await setupGame(Game);
          if (instrument) {
            const origSay = Game.say.bind(Game);
            Game.say = function (msg) { return origSay(msg); };
          }
          const policy = Object.assign({}, base);
          const oDaily = base.daily;
          policy.daily = (G, ctx) => {
            try { (instrument ? hashesA : hashesB).push(day(G) + ':' + dayHash(G)); } catch (e) {}
            return oDaily ? oDaily(G, ctx) : undefined;
          };
          await quietLog(async () => { await runDays(Game, policy, { days: 60 }); });
        }
        const same = hashesA.length === hashesB.length && hashesA.every((h, i) => h === hashesB[i]);
        console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate ${pid} s${seed} (instrument-on vs off, 60d, ${hashesA.length}d)`);
        if (!same) fails++;
      }
    }
    if (fails) { console.error(`DET-GATE FAILED: ${fails} pair(s)`); process.exit(1); }
    console.log('DET-GATE: all pairs byte-identical.');
    return;
  }
  const out = [];
  const policyIds = ONLY || Object.keys(POLICIES);
  for (const policyId of policyIds) {
    for (const seed of SEEDS) {
      const { ps } = await runOne(policyId, seed, { instrument: true });
      out.push(ps);
      console.log(`  [${policyId} s${seed}] d=${ps.days} ${ps.endReason} win=${ps.won ? 1 : 0} inv=${ps.inviteDay} sit=${ps.sitDay} beats=${ps.beatCount} vill=${ps.villagerBeats} tabRel=${ps.tableRelated} villTab=${ps.villagerVoicedTable} topTab=${ps.topDownTable}`);
    }
  }
  if (SMOKE) { console.log('SMOKE ok.'); return; }
  // SANITY GATE (pre-registered): the runs must actually sit before any
  // classification is trusted.
  const sittings = out.filter((r) => r.sitDay != null).length;
  console.log(`\nSANITY: sittings=${sittings}/16`);
  if (sittings === 0) { console.error('SWEEP STOP: 0 sittings — the seat driver did not drive. Debug composition before classifying.'); process.exit(2); }
  const agg = (f) => out.reduce((a, r) => a + (f(r) ? 1 : 0), 0);
  console.log(`wall: national ${agg((r) => r.national)}/16 table ${agg((r) => r.table)}/16 won ${agg((r) => r.won)}/16 medianDays ${out.map((r) => r.days).sort((a, b) => a - b)[8]} exiled ${agg((r) => r.exiled)}/16`);
  const vb = out.reduce((a, r) => a + r.villagerBeats, 0);
  const tr = out.reduce((a, r) => a + r.tableRelated, 0);
  const vt = out.reduce((a, r) => a + r.villagerVoicedTable, 0);
  const td = out.reduce((a, r) => a + r.topDownTable, 0);
  console.log(`voice: villagerBeats=${vb} tableRelated=${tr} villagerVoicedTable=${vt} topDownTable=${td}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(2); });
