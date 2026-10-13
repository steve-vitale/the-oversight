#!/usr/bin/env node
// scripts/test-scale-wall-r8-pilot.js — longsim scale-wall r8 PILOT (2026-10-13, lever 5).
//
// Fair-share RATE accounting: before/after on identical seeds.
//   4 seeds (11/22/33/44) x belongseek + leadcourt, 150d death-aware.
// Run BEFORE with the fix reverted, AFTER with it applied; compare exiled rates.
//
// Usage:
//   LABEL=r8-before OUT=/tmp/r8-before.json node scripts/test-scale-wall-r8-pilot.js
//   LABEL=r8-after  OUT=/tmp/r8-after.json  node scripts/test-scale-wall-r8-pilot.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const fc = require('./food-coupling-20261013');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

const POLICY_REGISTRY = { belongseek, leadcourt };
const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
const JUSTICE_RE = /moot|exil|theft|confront|⚖|freeload|grievance|hoard|cold shoulder|justice|weregild|schism|accus|verdict|sentence|carried you|hands:.*exile|pulling weight|warned/i;

function attachLedger(Game, m) {
  const led = m.ledger = { daily: [], justice: [] };
  const origEmit = Game.emit ? Game.emit.bind(Game) : null;
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (text && JUSTICE_RE.test(text) && led.justice.length < 600) {
        led.justice.push({ day: day(Game), msg: text.slice(0, 300) });
      }
    } catch (e) {}
    if (origEmit) { try { return origEmit(msg, 'narration'); } catch (e) {} }
    return null;
  };
  return led;
}

async function main() {
  const label = process.env.LABEL || 'r8-pilot';
  const outPath = process.env.OUT || '/tmp/r8-pilot.json';
  const seeds = (process.env.SEEDS || '11,22,33,44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'belongseek,leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'r8pilot-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      attachLedger(Game, m);
      const policy = Object.assign({}, base);
      const origSetup = base.setup, origDaily = base.daily;
      const ctx = { policyId: pid };
      policy.setup = (G) => { if (origSetup) { try { origSetup(G, ctx); } catch (e) {} } };
      policy.daily = (G) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const row = Object.assign({ label, policy: pid, seed },
        fc.finalize(Game, m, result), finalizeScale(Game, m));
      // moot-case forensics: route attribution
      row.cases = [];
      try {
        const bs = Game.betrayalState ? Game.betrayalState() : null;
        for (const c of ((bs && bs.cases) || [])) {
          if (!(c.accused || []).includes(Game.villagerId)) continue;
          row.cases.push({ day: c.day, charge: c.charge, resolution: c.resolution || null,
            fabricated: !!c.fabricated, accuser: String(c.accuser || '?').slice(0, 30) });
        }
      } catch (e) {}
      // freeloadVote forensics: did the freeload pipeline fire?
      try {
        const fl = ((Game.state.village || {}).freeload || {})[Game.villagerId] || {};
        row.freeload = { days: fl.days || 0, stage: fl.stage || 0, exiled: !!fl.exiled, acquitted: !!fl.acquitted };
      } catch (e) { row.freeload = null; }
      const jl = (m.ledger.justice || []);
      row.mootLines = jl.filter(l => /moot|exil|weregild|schism|verdict|sentence|⚖/i.test(l.msg)).slice(0, 12);
      row.confrontLines = jl.filter(l => /confront|hoard|accus|pulling weight|carried you|hands:.*exile/i.test(l.msg)).slice(0, 12);
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} rank=${row.rank} ` +
        `exiled=${row.exiledEver}${row.exileDay != null ? ('@' + row.exileDay) : ''} ` +
        `seas=${row.linksSeasonedEver} nat=${row.national} maxWave=${row.maxWave} ` +
        `cases=${JSON.stringify(row.cases.map(c => c.charge + (c.fabricated ? '(fab)' : '') + ':' + (c.resolution || '?')))} ` +
        `freeload=${row.freeload ? row.freeload.stage + '/d' + row.freeload.days : '?'}`);
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const summary = {
    label, seeds, policies: policyIds, days, runs: rows.length,
    national: agg(r => r.national), table: agg(r => r.table), won: agg(r => r.won),
    maxWave: Math.max(0, ...rows.map(r => r.maxWave || 0)),
    medianDays: med(rows.map(r => r.days)),
    exiledEver: agg(r => r.exiledEver),
    exileDays: rows.filter(r => r.exiledEver).map(r => `${r.policy}s${r.seed}@${r.exileDay}`),
    exileRate: rows.length ? agg(r => r.exiledEver) / rows.length : 0,
  };
  console.log('\nSUMMARY ' + JSON.stringify(summary));
  fs.writeFileSync(outPath, JSON.stringify({ summary, rows }, null, 1));
  console.log('wrote ' + outPath);
}

main().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
