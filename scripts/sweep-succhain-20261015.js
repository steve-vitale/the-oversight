#!/usr/bin/env node
// scripts/sweep-succhain-20261015.js — bearer-death chain diagnostic sweep
// (sim-succhain, 2026-10-15, scale-onramp axis).
//
// DIAGNOSTIC ARM, instrument-only: 8 seeds x {leadfeast, belongfeast}
// unlayered + leadfeast WINPURSUIT=1, 180d death-aware, on the current tip
// (FEASTSCALE_R13=1 asserted up front, #312; WINPURSUIT=1 on the pursued
// policy only — loop A's own landed layer, zero src/js). Own control not
// needed — the diagnostic runs against the live tip; control side never
// layered. On young nationals (first 60 hold-days) every bearer death is
// chained (chain length, cause per death, inter-death gaps, polity state
// at each death, tribute-snap / rival-raid co-occurrence, pantry
// trajectory through the chain) via scripts/succhain-lib-20261015.js.
//
// Modes:
//   SMOKE=1      15d x {leadfeast, belongfeast, leadfeast-winpursuit}:
//                samples collect, no crash, bearer flag present.
//   DETGATE=1    D1 gate determinism (60d x2 byte-identical); D2 instrument
//                ON vs OFF byte-identical 60d (the sampler is read-only).
//   default      the 24-run suite -> evidence/2026-10-15/perseed-succhain/,
//                evidence/2026-10-15/sim-succhain-runs.json,
//                evidence/2026-10-15/telemetry-succhain/.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-succhain-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-succhain-20261015.js
//      DETGATE=1 FEASTSCALE_R13=1 node scripts/sweep-succhain-20261015.js
//      WINPURSUIT=1 FEASTSCALE_R13=1 node scripts/sweep-succhain-20261015.js
//        (env must select leadfeast-winpursuit: POLICIES=leadfeast-winpursuit)
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const TW = require('./tworung-lib-20261015');
const RB = require('./readinessbind-lib');
const HL = require('./holdloss-lib-20261015');
const SC = require('./succhain-lib-20261015');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('SUCCHAIN FATAL: FEASTSCALE_R13=1 required (the courtship-road substrate).');
  process.exit(2);
}

const { leadfeast, belongfeast } = require('./policies/feastscale');
const WP = require('./policies/winpursuit');
const POLICY_REGISTRY = {
  leadfeast, belongfeast,
  'leadfeast-winpursuit': WP.leadpursuit,
};
for (const [pid, pol] of Object.entries(POLICY_REGISTRY)) {
  if (!pol || pol.id !== pid) {
    console.error(`SUCCHAIN FATAL: policy '${pid}' failed named-export unwrap (got id '${pol && pol.id}'). Suite refuses to run policy-less.`);
    process.exit(2);
  }
}
if ((process.env.POLICIES || '').indexOf('winpursuit') !== -1 && process.env.WINPURSUIT !== '1') {
  console.error('SUCCHAIN FATAL: POLICIES selects winpursuit but WINPURSUIT!=1 (the layer would be gate-off — a silent no-op).');
  process.exit(2);
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
// Beat capture: the holdloss beat set PLUS the chain instrument's snap/raid
// vocabulary (the neglected-link snap, rival night raids at the treeline).
const BEAT_RE = /wave 4|wave 5|mirror draft|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|pantry|famine|snap|raid|treeline|won\b/i;

function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 3000) t.beats.splice(0, 500);
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
            player: !!o.player,   // the r17 deathattr bearer flag
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
  const { Game } = await loadGame({ seed, mode: 'succhain-' + pid });
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
  const standingRows = [];
  const waveUnlockDays = { 4: null, 5: null };
  let lastWave = 1;
  let nSamples = 0;

  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      hashes.push(RB.trajectoryHash(G));
      const fr = fc.dailyRow(G); foodRows.push(fr);
      const srw = sr.scaleRow(G); scaleRows.push(srw);
      const st = TW.standingSample(G);
      standingRows.push({ day: st.day, unlockedWave: st.unlockedWave, rank: st.rank, gated: st.gated, tableSeat: st.tableSeat });
      if (st.unlockedWave > lastWave) {
        for (let w = lastWave + 1; w <= st.unlockedWave; w++) {
          if (w === 4 || w === 5) waveUnlockDays[w] = st.day;
        }
        lastWave = st.unlockedWave;
      }
      nSamples++;
    } catch (e) {}
  };

  // DAILY sampling: the chain instrument reads polity state at each death
  // day, so rank/link rows must be day-granular (holdloss sampled every 10d).
  const result = await runDays(Game, policy, { days, sampleEvery: 1 });
  const daysRan = result.days;
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');

  const exiledRow = scaleRows.find(r => r.exiled);
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}

  const rec = {
    seed, policy: pid, days: daysRan, endReason: result.endReason,
    won: /win|won/i.test(String(result.endReason || '')),
    scaleRows, foodRows, standingRows, waveUnlockDays,
    deaths: t.deaths || [], beats: t.beats || [],
    breaks: (m.scale.breaks || []).map(b => ({ day: b.day, link: b.link })),
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
  };
  const chains = SC.attributeChains(rec);
  const loss = HL.nationalLoss(rec);
  loss.waveUnlockDays = waveUnlockDays;

  const row = {
    seed, policy: pid, days: daysRan, endReason: result.endReason, trajHash, nSamples,
    national: !!chains.window, natFirstDay: chains.window ? chains.window.firstDay : null,
    nChains: chains.nChains, nAttributed: chains.nAttributed, attribRate: chains.attribRate,
    chainLens: chains.chains.map(c => c.length),
    lossMode: loss.reached ? loss.lossMode : 'n/a',
    won: rec.won, table: tableSeat !== 'none', tableSeat, maxWave,
    survivalDays: daysRan, exiled: rec.exiledEver,
    nBearerDeaths: rec.deaths.filter(d => SC.isBearerDeath(d)).length,
    nDeaths: rec.deaths.length,
  };
  return { row, rec, chains, loss };
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
  console.log('SMOKE: 15d x {leadfeast, belongfeast, leadfeast-winpursuit}');
  let fail = 0;
  for (const pid of ['leadfeast', 'belongfeast', 'leadfeast-winpursuit']) {
    const { row, rec } = await oneRun(11, pid, 15);
    const hasPlayerFlag = rec.deaths.some(d => d.player === true || d.player === false);
    const ok = row.nSamples >= 10 && row.days === 15 && rec.scaleRows.length >= 10 && rec.foodRows.length >= 10 && hasPlayerFlag;
    if (ok) console.log(`  PASS ${pid} — ${row.nSamples} samples, 15d, beats=${rec.beats.length}, deaths=${rec.deaths.length} (player-flag ${hasPlayerFlag ? 'present' : 'MISSING'})`);
    else { fail++; console.log(`  FAIL ${pid} — nSamples=${row.nSamples} days=${row.days} scaleRows=${rec.scaleRows.length} foodRows=${rec.foodRows.length} playerFlag=${hasPlayerFlag}`); }
  }
  if (fail) { console.error('SMOKE FAILED'); process.exit(1); }
  console.log('SMOKE GREEN');
}

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast,leadfeast-winpursuit').split(',').map(x => x.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-15/sim-succhain-runs.json';
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-succhain';
  const teleDir = process.env.TELE_DIR || 'evidence/2026-10-15/telemetry-succhain';
  fs.mkdirSync(perseedDir, { recursive: true });
  fs.mkdirSync(teleDir, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  for (const pid of policyIds) {
    for (const seed of seeds) {
      console.log(`-- ${pid} seed ${seed}`);
      const { row, rec, chains, loss } = await oneRun(seed, pid, days);
      rows.push(row);
      const pname = `${pid}-s${seed}`;
      const narratives = chains.chains.map(c => SC.chainNarrative(rec, c));
      fs.writeFileSync(path.join(perseedDir, pname + '.json'),
        JSON.stringify({ seed, policy: pid, window: chains.window, chains, narratives, lossMode: loss.lossMode }, null, 1));
      // full record (deaths/beats/daily rows) for sense-reading + audit
      fs.writeFileSync(path.join(perseedDir, pname + '-full.json'),
        JSON.stringify({ seed, policy: pid, daysRan: row.days, endReason: row.endReason,
          bearerDeaths: SC.bearerDeaths(rec), outsideWindow: chains.outsideWindow,
          deaths: rec.deaths, beats: rec.beats.slice(-400),
          scaleRows: rec.scaleRows.map(r => ({ day: r.day, rank: r.rank, exiled: r.exiled, links: r.links })),
          foodRows: rec.foodRows, standingRows: rec.standingRows, breaks: rec.breaks }));
      // coordinator telemetry record (booleans as 0/1)
      fs.writeFileSync(path.join(teleDir, pname + '.json'),
        JSON.stringify({ run: 'succhain', seed, policy: pid,
          national: row.national ? 1 : 0, table: row.table ? 1 : 0,
          wins: row.won ? 1 : 0, exiled: row.exiled ? 1 : 0 }));
      console.log(`   d=${row.days} ${row.endReason} national=${row.national} chains=${row.nChains} lens=[${row.chainLens}] mode=${row.lossMode} table=${row.table} w=${row.maxWave}`);
    }
  }
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log(`\nwrote ${rows.length} rows -> ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

(async () => {
  if (process.env.SMOKE === '1') return smoke();
  if (process.env.DETGATE === '1') return detgate();
  return runSweep();
})().catch(e => { console.error('SUCCHAIN FATAL:', e && e.stack || e); process.exit(1); });
