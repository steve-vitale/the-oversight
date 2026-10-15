#!/usr/bin/env node
// scripts/sweep-younggrace-20261015.js — YOUNGGRACE consolidation-grace
// lever sweep (flesh-out sim-younggrace, 2026-10-15, scale-onramp axis).
//
// 8 seeds x leadfeast x {control (YOUNGGRACE unset), armed (YOUNGGRACE=1)},
// 180d death-aware, own control in the SAME sweep (never inherited).
// The game lever reads process.env at call time, so the armed/control
// switch is a per-run env set/delete inside this one process — identical
// seeds, identical substrate, only the lever differs.
//
// Pre-registered (binding, see evidence/2026-10-15/sim-younggrace.md):
//   PRIMARY: sum(armed national-hold days) >= 1.3 x sum(control)
//   GUARDRAILS: median survival >= control-10d; national formations >=
//   control-2/8; no new death mode (n>=3).
//
// Modes: SMOKE=1 (2d x both arms, samples collect, no crash)
//        default: the 16-run suite.
//
// Env: FEASTSCALE_R13=1 node scripts/sweep-younggrace-20261015.js
//      SMOKE=1 FEASTSCALE_R13=1 node scripts/sweep-younggrace-20261015.js
//
// Env-var discipline: each run sets or deletes YOUNGGRACE explicitly
// before loadGame; the suite never leaves it set (finally delete).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const sr = require('./scale-repro-20261013');
const TW = require('./tworung-lib-20261015');
const HL = require('./holdloss-lib-20261015');

const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('YOUNGGRACE FATAL: FEASTSCALE_R13=1 required (leadfeast is a feastscale policy, #312 lesson).');
  process.exit(2);
}
const { leadfeast } = require('./policies/feastscale');
if (!leadfeast || leadfeast.id !== 'leadfeast') {
  console.error('YOUNGGRACE FATAL: leadfeast policy failed named-export unwrap.');
  process.exit(2);
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; };
const BEAT_RE = /wave 4|wave 5|mirror draft|standing|national|regional|link|break|tribute|exile|table|died|dead|starv|ascend|treaty|succession|realm came apart|pantry|famine|raid|won\b/i;

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
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

async function oneRun(seed, armed, days) {
  if (armed) process.env.YOUNGGRACE = '1'; else delete process.env.YOUNGGRACE;
  const { Game } = await loadGame({ seed, mode: 'younggrace-' + (armed ? 'armed' : 'control') });
  await setupGame(Game);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const scaleRows = [];
  const waveUnlockDays = { 4: null, 5: null };
  let lastWave = 1, nSamples = 0;

  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      scaleRows.push(sr.scaleRow(G));
      const st = TW.standingSample(G);
      if (st.unlockedWave > lastWave) {
        for (let w = lastWave + 1; w <= st.unlockedWave; w++) {
          if (w === 4 || w === 5) waveUnlockDays[w] = st.day;
        }
        lastWave = st.unlockedWave;
      }
      nSamples++;
    } catch (e) {}
  };

  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const daysRan = result.days;
  let tableSeat = 'none', maxWave = 1;
  try { const s = (Game.tableSeat || (() => null)).call(Game); tableSeat = (s && s.seat) || 'none'; } catch (e) {}
  try { maxWave = Number((Game.unlockedWave || (() => 1)).call(Game)) || 1; } catch (e) {}
  const exiledRow = scaleRows.find(r => r.exiled);

  const rec = {
    seed, policy: 'leadfeast', days: daysRan, endReason: result.endReason,
    won: /win|won/i.test(String(result.endReason || '')),
    scaleRows, deaths: t.deaths, beats: t.beats, waveUnlockDays,
    exiledEver: !!exiledRow, exiledDay: exiledRow ? exiledRow.day : null,
  };
  const loss = HL.nationalLoss(rec);
  const narrative = loss.reached ? HL.last20Narrative(rec, Object.assign({ waveUnlockDays }, loss)) : null;
  const row = {
    seed, armed: armed ? 1 : 0, days: daysRan, endReason: result.endReason,
    national: loss.reached ? 1 : 0, holdDays: loss.reached ? loss.holdDays : 0,
    endState: loss.reached ? loss.endState : 'n/a',
    lossMode: loss.reached ? loss.lossMode : 'n/a',
    lossDay: loss.reached ? loss.lossDay : null,
    firstDay: loss.reached ? loss.firstDay : null,
    won: rec.won ? 1 : 0, table: tableSeat !== 'none' ? 1 : 0, tableSeat, maxWave,
    survivalDays: daysRan, exiled: rec.exiledEver ? 1 : 0,
    nDeaths: t.deaths.length, nSamples,
  };
  return { row, rec, loss, narrative };
}

async function smoke() {
  console.log('SMOKE: 2d x {control, armed}');
  for (const armed of [false, true]) {
    const { row } = await oneRun(11, armed, 2);
    const ok = row.nSamples >= 1 && row.days === 2;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${armed ? 'armed' : 'control'} — days=${row.days} nSamples=${row.nSamples}`);
    if (!ok) { console.error('SMOKE FAILED'); process.exit(1); }
  }
  console.log('SMOKE GREEN');
}

async function runSweep() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-15/sim-younggrace-runs.json';
  const perseedDir = process.env.PERSEED_DIR || 'evidence/2026-10-15/perseed-younggrace';
  const teleDir = process.env.TELEMETRY_DIR || 'evidence/2026-10-15/telemetry-younggrace';
  fs.mkdirSync(perseedDir, { recursive: true });
  fs.mkdirSync(teleDir, { recursive: true });
  const rows = [];
  const t0 = Date.now();
  try {
    for (const armed of [false, true]) {
      for (const seed of seeds) {
        console.log(`-- ${armed ? 'armed' : 'control'} seed ${seed}`);
        const { row, rec, loss, narrative } = await oneRun(seed, armed, days);
        rows.push(row);
        const armName = armed ? 'armed' : 'control';
        const pname = `${armName}-s${seed}`;
        fs.writeFileSync(path.join(perseedDir, pname + '.json'),
          JSON.stringify({ seed, armed: armed ? 1 : 0, loss, narrative,
            subCauses: loss.subCauses || {}, famCounts: loss.famCounts || {} }, null, 1));
        fs.writeFileSync(path.join(perseedDir, pname + '-full.json'),
          JSON.stringify({ seed, armed: armed ? 1 : 0, daysRan: row.days, endReason: row.endReason, loss,
            deaths: rec.deaths, beats: rec.beats.slice(-400),
            scaleRows: rec.scaleRows.map(r => ({ day: r.day, rank: r.rank, exiled: r.exiled })) }, null, 1));
        // per-seed telemetry record for the coordinator's telemetry check
        const trec = { run: 'younggrace-' + armName, seed, policy: 'leadfeast',
          national: row.national, table: row.table, wins: row.won, exiled: row.exiled };
        fs.writeFileSync(path.join(teleDir, `younggrace-${armName}-s${seed}.json`), JSON.stringify(trec));
        console.log(`   d=${row.days} ${row.endReason} national=${row.national} hold=${row.holdDays}d end=${row.endState} mode=${row.lossMode} table=${row.table} w=${row.maxWave}`);
      }
    }
  } finally {
    delete process.env.YOUNGGRACE;
  }
  fs.writeFileSync(out, JSON.stringify(rows, null, 1));
  console.log(`\nwrote ${rows.length} rows -> ${out} (${Math.round((Date.now() - t0) / 1000)}s)`);
}

(async () => {
  if (process.env.SMOKE === '1') return smoke();
  return runSweep();
})().catch(e => { delete process.env.YOUNGGRACE; console.error('YOUNGGRACE FATAL:', e && e.stack || e); process.exit(1); });
