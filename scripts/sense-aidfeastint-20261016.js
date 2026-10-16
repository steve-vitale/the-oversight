#!/usr/bin/env node
// scripts/sense-aidfeastint-20261016.js — SIM-AIDFEASTINT-B sense-testing.
// SENSE-TESTING LAW: read transcripts, judge meaning/coherence — not counts.
//
// Takes the sweep JSON, finds the 3 seeds with the largest both-vs-neither
// absolute rot delta (per road), re-runs the both-cell on those seeds with
// say-line capture (deterministic per det-gate: same seed => same beats),
// and prints ~10 beat samples around each seed's largest rotByDay days.
// Env: FEASTSCALE_R13=1 SEATDRIVE=0.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sense-aidfeastint-20261016.js \
//     evidence/2026-10-16/aidfeastint-sweep.json [outdir]
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let AD = null, FD = null;
try {
  AD = require('./policies/aiddrain');
  FD = require('./policies/feastdrawdown');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: aid/feast drivers absent (diagnostic layers deleted post-measurement); status in evidence/2026-10-16/sim-aidfeastint-b.md');
    process.exit(0);
  }
  throw e;
}

const AID_BOTH = AD.withAidDrain(FD.feastDrawdown, 'aidFeastBoth');
const AID_BOTH_BELONG = AD.withAidDrain(FD.feastBelongDrawdown, 'aidFeastBothBelong');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function clean(text) {
  return String(text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function captureBoth(road, seed, days, rotByDay) {
  process.env.AIDDRAIN = '1'; process.env.FEASTDRAWDOWN = '1';
  const base = road === 'lead' ? AID_BOTH : AID_BOTH_BELONG;
  const { Game } = await loadGame({ seed, mode: `aidfeastint-sense-${road}-${seed}`, fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say ? Game.say.bind(Game) : null;
  Game.say = function (msg) {
    try {
      const t = clean((msg && (msg.text || msg.msg || msg.message)) || msg);
      if (t) beats.push({ day: gday(Game), text: t.slice(0, 300) });
    } catch (e) {}
    return origSay ? origSay(msg) : msg;
  };
  const policy = Object.assign({}, base);
  await quietLog(async () => {
    await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  });
  delete process.env.AIDDRAIN; delete process.env.FEASTDRAWDOWN;
  return beats;
}

(async () => {
  const sweepFile = process.argv[2];
  const outdir = process.argv[3] || null;
  if (!sweepFile) { console.error('usage: sense-aidfeastint-20261016.js <sweep.json> [outdir]'); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(sweepFile, 'utf8'));
  const rows = data.rows;
  const days = data.days || 180;
  const byKey = {};
  for (const r of rows) { (byKey[r.key] = byKey[r.key] || []).push(r); }
  const report = [];
  for (const road of ['lead', 'belong']) {
    const n = byKey[`${road}_neither`] || [], b = byKey[`${road}_both`] || [];
    const deltas = b.map(r => {
      const twin = n.find(x => x.seed === r.seed);
      return { seed: r.seed, delta: r.rotFresh - ((twin || {}).rotFresh || 0),
               rotBoth: r.rotFresh, rotNeither: (twin || {}).rotFresh || 0,
               rotByDay: r.rotByDay || {} };
    }).sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
    const top = deltas.slice(0, 3);
    report.push(`\n===== ${road.toUpperCase()} ROAD — top-3 |both-neither| rot-delta seeds =====`);
    for (const t of top) {
      report.push(`\n-- seed ${t.seed}: both=${(t.rotBoth / 1000).toFixed(0)}k neither=${(t.rotNeither / 1000).toFixed(0)}k delta=${(t.delta / 1000).toFixed(0)}k`);
      const bigDays = Object.entries(t.rotByDay)
        .map(([d, k]) => ({ d: +d, k })).sort((a, b) => b.k - a.k).slice(0, 3);
      report.push(`   largest rot days: ${bigDays.map(x => `d${x.d}=${(x.k / 1000).toFixed(1)}k`).join(' ')}`);
      const beats = await captureBoth(road, t.seed, days, t.rotByDay);
      const focus = new Set(bigDays.flatMap(x => [x.d - 2, x.d - 1, x.d, x.d + 1]));
      let shown = 0;
      for (const bt of beats) {
        if (!focus.has(bt.day)) continue;
        if (/🌾|🍖|FEAST|rot|grain|pantry|spoil/i.test(bt.text)) {
          report.push(`   [d${bt.day}] ${bt.text}`);
          if (++shown >= 10) break;
        }
      }
      if (shown === 0) report.push('   (no food/rot beats near the largest rot days in this window)');
    }
  }
  const text = report.join('\n');
  console.log(text);
  if (outdir) {
    fs.mkdirSync(outdir, { recursive: true });
    fs.writeFileSync(`${outdir}/aidfeastint-sense-beats.txt`, text);
    console.error('wrote ' + outdir + '/aidfeastint-sense-beats.txt');
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
