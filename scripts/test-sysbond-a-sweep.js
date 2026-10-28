#!/usr/bin/env node
// scripts/test-sysbond-a-sweep.js — sim-sysbond-a band reproduction.
//
// Re-runs the seatpath-a substrate (LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
// TABLERELAY=1 via scripts/policies/tablepaths-relay.js) on seeds
// 75101-75108, 180d death-aware horizon, and captures — at the FIRST
// day a tablePreview exists (the earning/pricing moment, BEFORE the
// seat legs take the seat that same daily and BEFORE any cockpit verb
// can move sysBond/grounding) — the Relay door's earned state with its
// sysBond + integration stage attached, plus the full earned-door list.
// This is corroboration of the fixture (scripts/test-sysbond-a.js),
// which is the gate proof: the band shows the same earning in live
// sims, with real (not fixture-set) sysBond/stage values.
//
// Writes one row per seed, incrementally, to
// evidence/2026-10-28/perseed-sysbond-a/s<seed>-armed.json (this arm's
// own directory — never seatpath-a's), plus a summary.json. Exit 0 on
// a completed sweep regardless of GO/NO-GO (the evidence judges);
// exit 1 on a missing row or harness error.
// Env: SEEDS (default 75101..75108), DAYS (default 180),
// EVID (default perseed-sysbond-a).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tablepathsRelay } = require('./policies/tablepaths-relay');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeRow(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), p],
        { input: body, cwd: REPO, encoding: 'utf8', timeout: 600000 });
      if (!/WROTE /.test(out || '')) throw new Error('writer gave no WROTE line');
      return;
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function snapEarning(Game) {
  const s = { day: null, seat: null, stage: null, sysBond: null, switchboardHolder: null, relay: null, doors: [] };
  try { s.day = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try { const st = Game.tableSeat ? Game.tableSeat() : null; s.seat = st ? st.seat : null; } catch (e) {}
  try { s.stage = Game.integrationStage ? Game.integrationStage() : null; } catch (e) {}
  try { s.sysBond = Game.sysBond ? Game.sysBond() : null; } catch (e) {}
  try { const sw = Game.switchboard ? Game.switchboard() : null; s.switchboardHolder = sw ? (sw.holderId || '(office, no holder)') : null; } catch (e) {}
  try {
    const paths = Game.tableEarnedPaths ? Game.tableEarnedPaths() : [];
    const r = paths.find(p => p.id === 'relay') || null;
    s.relay = r ? { earned: !!r.earned, strength: r.strength, why: r.why } : null;
    s.doors = paths.filter(p => p.earned).map(p => p.id);
  } catch (e) {}
  return s;
}

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.TABLERELAY = '1';
  const { Game } = await loadGame({ seed, mode: 'sysbond-a', fullTelemetry: false });
  await setupGame(Game);
  let earning = null, previewFirst = null;
  const policy = Object.assign({}, tablepathsRelay, {
    daily(G, ctx) {
      if (!earning) {
        try {
          const pv = G.tablePreview ? G.tablePreview() : null;
          if (pv) {
            previewFirst = { day: pv.day, seat: pv.seat, ready: !!pv.ready, why: pv.why || null, doors: pv.doors || [] };
            earning = snapEarning(G);
          }
        } catch (e) {}
      }
      if (tablepathsRelay.daily) { try { return tablepathsRelay.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  let endEarning = null, tableState = null;
  try { endEarning = snapEarning(Game); } catch (e) {}
  try { const ts = Game.tableState ? Game.tableState() : null; if (ts) tableState = { path: ts.path || null, branch: ts.branch || null, phase: ts.phase || null, seat: ts.seat || null }; } catch (e) {}
  const row = {
    policy: 'armed', seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, finalRank: (Game.scaleRank ? Game.scaleRank() : 'village') || 'village',
    previewFirst, earning, endSnapshot: endEarning, tableState,
    enteredPath: (tableState && tableState.path) || null,
  };
  const p = path.join(evidDir, `s${seed}-armed.json`);
  writeRow(p, JSON.stringify(row, null, 1));
  console.log(`SYSBOND-A seed=${seed} days=${row.days} won=${row.won} entered=${row.enteredPath} earning=${earning ? JSON.stringify(earning.relay) + ' stage=' + earning.stage + ' bond=' + earning.sysBond + ' seat=' + earning.seat : 'none'}`);
  return row;
}

(async () => {
  const seeds = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108').split(',').map(s => parseInt(s, 10));
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-sysbond-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const seed of seeds) rows.push(await runOne(seed, days, evidDir));
  const summary = {
    label: 'sim-sysbond-a band reproduction (seatpath-a substrate, armed only)',
    seeds, days,
    rows: rows.map(r => ({ seed: r.seed, days: r.days, won: r.won, enteredPath: r.enteredPath, earning: r.earning, previewFirst: r.previewFirst })),
  };
  writeRow(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1));
  const seated = rows.filter(r => r.earning);
  console.log(`SYSBOND-A-SWEEP-DONE seeds=${rows.length} withPreview=${seated.length} relayEarnedAtPreview=${seated.filter(r => r.earning.relay && r.earning.relay.earned).length}`);
  seated.forEach(r => console.log(`  seed=${r.seed} day=${r.earning.day} seat=${r.earning.seat} stage=${r.earning.stage} sysBond=${r.earning.sysBond} holder=${r.earning.switchboardHolder} relayEarned=${r.earning.relay && r.earning.relay.earned} strength=${r.earning.relay && r.earning.relay.strength} entered=${r.enteredPath}`));
  process.exit(0);
})().catch(e => { console.error('SYSBOND-A-SWEEP harness error', e); process.exit(1); });
