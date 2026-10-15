#!/usr/bin/env node
// scripts/sweep-holdvillage-20261015.js — village-mortality census sweep
// (sim-holdvillage, 2026-10-15, scale-onramp axis).
//
// DIAGNOSTIC ARM, instrument-only: 8 seeds x {leadfeast, belongfeast},
// 180d death-aware, on the current tip (FEASTSCALE_R13=1 asserted up front,
// #312). Own control not needed — the diagnostic runs against the live tip.
// Every national-reaching run that DIES WITH THE RANK STILL ON gets the
// full attribution packet from scripts/holdvillage-lib-20261015.js:
// death-cause family shares (30d window), the 30d pantry trajectory,
// raid/succession/contest/arena co-occurrence ±4d, and the polity state at
// death — plus a sense-read death narrative (SENSE-TESTING LAW).
//
// Beat capture: the #303 lesson — the old 600-cap starved late windows
// (wave-4/5 unlock and national-loss beats at d100+ were dropped on long
// runs). This sweep uses the tworung2 repair: a 4000 ring buffer. Without
// it the instrument would be blind to d100+ deaths. BEAT_RE extends the
// succhain regex with contest|arena|carried off for the co-occurrence
// buckets (raid / succession / contest-arena / tribute-snap / wave-unlock).
//
// Modes:
//   SMOKE=1      15d x {leadfeast, belongfeast}: samples collect, no crash,
//                the policy honesty gate (refuses to run policy-less).
//   DETGATE=1    D1 gate determinism (60d x2 byte-identical); D2 instrument
//                ON vs OFF byte-identical 60d (the sampler is read-only —
//                trajectory neutrality, same bar as the holdloss proof).
//   default      the 16-run suite -> evidence/2026-10-15/perseed-holdvillage/,
//                evidence/2026-10-15/sim-holdvillage-runs.json,
//                evidence/2026-10-15/telemetry-holdvillage/.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-holdvillage-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-holdvillage-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-holdvillage-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const RB = require('./readinessbind-lib');
const HV = require('./holdvillage-lib-20261015');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('HOLDVILLAGE FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

const { leadfeast, belongfeast } = require('./policies/feastscale');
const POLICY_REGISTRY = { leadfeast, belongfeast };
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`HOLDVILLAGE FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
// Beat capture: raid/succession/contest/arena/snap/wave/death beats for the
// ±4d co-occurrence, plus the full-text sample for death narratives.
// RING BUFFER (#303 repair): keep the last 4000 — a 600-cap starves late
// windows on long runs and the instrument goes blind to d100+ deaths.
const BEAT_RE = /wave 4|wave 5|mirror draft|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|pantry|famine|snap|raid|treeline|carried off|contest|arena|won\b/i;

function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys ? origSys(msg) : msg; };
}

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 500) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 80),
            player: !!o.player,   // the r17 deathattr bearer <redacted>
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

async function oneRun(seed, pid, days, opts) {
  opts = opts || {};
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const { Game } = await loadGame({ seed, mode: 'holdvillage-' + pid });
  await setupGame(Game);

  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  if (opts.instrument !== false) {
    attachBeats(Game, t);
    attachDeaths(Game, t);
  }
  const hashes = [];
  const scaleRows = [];
  const foodRows = [];
  const waveUnlockDays = { 4: null, 5: null };
  let lastWave = 1;
  let nSamples = 0;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      hashes.push(RB.trajectoryHash(G));
      foodRows.push(fc.dailyRow(G));
      scaleRows.push(sr.scaleRow(G));
      let uw = 1;
      try { uw = Number((G.unlockedWave || (() => 1)).call(G)) || 1; } catch (e) {}
      if (uw > lastWave) {
        for (let w = lastWave + 1; w <= uw; w++) {
          if (w === 4 || w === 5) waveUnlockDays[w] = gday(G);
        }
        lastWave = uw;
      }
      nSamples++;
    } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  const exiledRow = scaleRows.find(r => r.exiled);
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}

  const rec = {
    seed, policy: pid, days: daysRan, endReason: result.endReason,
    won: /win|won/i.test(String(result.endReason || '')),
    scaleRows, foodRows, waveUnlockDays,
    deaths: t.deaths || [], beats: t.beats || [],
  };
  // the win beat is the authority (endReason regexes lie about the table —
  // the sim-succhain win-detection correction).
  rec.won = HV.wonByBeat(rec) || rec.won;
  const packet = HV.attributeVillageDeath(rec);
  const narrative = packet.diedHolding ? HV.deathNarrative(rec, packet) : null;

  const row = {
    seed, policy: pid, days: daysRan, endReason: result.endReason, trajHash, nSamples,
    national: scaleRows.some(r => r.rank === 'national' || r.rank === 'global'),
    diedHolding: !!packet.diedHolding,
    attributed: packet.diedHolding ? !!packet.attributed : null,
    deathDay: packet.deathDay,
    famShares: packet.diedHolding ? packet.deathShares.famCounts : null,
    modalFamily: packet.diedHolding ? packet.deathShares.modalFamily : null,
    pantryMin: packet.diedHolding && packet.pantry.readable ? packet.pantry.minPantryDays : null,
    cooccur: packet.diedHolding ? {
      raids: packet.cooccur.raids.length, successions: packet.cooccur.successions.length,
      contests: packet.cooccur.contests.length, snaps: packet.cooccur.snaps.length,
    } : null,
    won: rec.won, table: tableSeat !== 'none', tableSeat, maxWave,
    survivalDays: daysRan, exiled: !!exiledRow,
    nDeaths: rec.deaths.length, nBeats: rec.beats.length,
  };
  return { row, rec, packet, narrative };
}

async function detgate() {
  console.log('DETGATE: byte-identical checks');
  let fail = 0;
  const chk = (name, a, b) => {
    if (a === b) { console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + ' — ' + String(a).slice(0, 16) + ' != ' + String(b).slice(0, 16)); }
  };
  const c1 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  const c2 = await oneRun(11, 'leadfeast', 60, { instrument: false });
  chk('D1 gate determinism (11/leadfeast/60d x2, instrument OFF)', c1.row.trajHash, c2.row.trajHash);
  const i1 = await oneRun(33, 'belongfeast', 60, { instrument: true });
  const i2 = await oneRun(33, 'belongfeast', 60, { instrument: false });
  chk('D2 instrument ON vs OFF byte-identical (33/belongfeast/60d)', i1.row.trajHash, i2.row.trajHash);
  if (fail) { console.error('DETGATE FAILED'); process.exit(1); }
  console.log('DETGATE GREEN');
}

async function smoke() {
  console.log('SMOKE: 15d x {leadfeast,belongfeast}');
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    const { row, rec } = await oneRun(11, pid, 15);
    const ok = row.nSamples >= 10 && row.days === 15 && rec.scaleRows.length >= 10 && rec.foodRows.length >= 10;
    if (ok) console.log(`  PASS ${pid} — ${row.nSamples} samples, 15d, beats=${rec.beats.length}, deaths=${rec.deaths.length}`);
    else { fail++; console.log(`  FAIL ${pid} — nSamples=${row.nSamples} days=${row.days} scaleRows=${rec.scaleRows.length} foodRows=${rec.foodRows.length}`); }
  }
  if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(x => x.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-15/sim-holdvillage-runs.json';
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-holdvillage';
  const teleDir = process.env.TELE_DIR || 'evidence/2026-10-15/telemetry-holdvillage';
  fs.mkdirSync(perseedDir, { recursive: true });
  fs.mkdirSync(teleDir, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      console.log(`-- ${pid} seed ${seed}`);
      const { row, rec, packet, narrative } = await oneRun(seed, pid, days);
      rows.push(row);
      const pname = `${pid}-s${seed}`;
      // per-seed attribution packet + narrative (booleans as numbers where
      // the coordinator's deviation check reads them).
      fs.writeFileSync(path.join(perseedDir, pname + '.json'),
        JSON.stringify({ seed, policy: pid, packet, narrative }, null, 1));
      // full record (deaths/beats/daily rows) for sense-reading + audit
      fs.writeFileSync(path.join(perseedDir, pname + '-full.json'),
        JSON.stringify({ seed, policy: pid, daysRan: row.days, endReason: row.endReason, packet,
          deaths: rec.deaths, beats: rec.beats.slice(-400),
          foodRows: rec.foodRows, scaleRows: rec.scaleRows.map(r => ({ day: r.day, rank: r.rank, exiled: r.exiled })) }));
      // coordinator telemetry record: 0/1 booleans as numbers.
      fs.writeFileSync(path.join(teleDir, pname + '.json'),
        JSON.stringify({
          seed, policy: pid,
          national: row.national ? 1 : 0, table: row.table ? 1 : 0,
          wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0,
          diedHolding: row.diedHolding ? 1 : 0,
          attributed: row.attributed === null ? null : (row.attributed ? 1 : 0),
        }, null, 1));
      console.log(`   d=${row.days} ${row.endReason} national=${row.national} diedHolding=${row.diedHolding} attributed=${row.attributed} modal=${row.modalFamily} table=${row.table} w=${row.maxWave}`);
    }
  }
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log(`\nwrote ${rows.length} rows -> ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

(async () => {
  if (process.env.SMOKE === '1') return smoke();
  if (process.env.DETGATE === '1') return detgate();
  return runSweep();
})().catch(e => { console.error('HOLDVILLAGE FATAL:', e && e.stack || e); process.exit(1); });
