#!/usr/bin/env node
// diag-tableconfirm-20261020.js — diagnostic for the confirm's two
// relay-door/feared-final runs (belongfeast s81302, s81304): the drain
// picked path:relay but the final resolved feared/light. Captures the
// drain's own beat log (ctx._tablepathdriver.log) which the probe's
// per-seed summary does not keep.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1 \
//   POLICY=belongfeast SEED=81304 node scripts/diag-tableconfirm-20261020.js
'use strict';

const POLICY = process.env.POLICY || 'belongfeast';
const SEED = parseInt(process.env.SEED || '81304', 10);
const { SLOTS } = require('./tableconfirm-slots-20261020');
process.env.SEEDS = SLOTS[POLICY].join(',');
const SEEDIDX = SLOTS[POLICY].indexOf(SEED);
if (SEEDIDX < 0) { console.error('STOP: seed not in slots'); process.exit(2); }

const SW = require('./probe-tablepathdriver-20261020');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  const base = SW.policyFor(POLICY, SEEDIDX);
  // Wrap daily to capture the drain log from ctx after each day.
  const seen = [];
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    const r = oDaily(G, ctx);
    const t = ctx && ctx._tablepathdriver;
    if (t && t.log && t.log.length && !seen._dumped) {
      // dump once the table sequence completes (phase done or log stops growing)
    }
    policy._lastTPD = t;
    return r;
  };
  const { Game } = await loadGame({ seed: SEED, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const t = policy._lastTPD || {};
  console.log(`seed ${SEED} ${POLICY}: answers=${t.answers} stalls=${t.stalls}`);
  console.log('doorEvents: ' + JSON.stringify(t.doorEvents));
  console.log('finalsEvents: ' + JSON.stringify(t.finalsEvents));
  console.log('walked: ' + JSON.stringify(t.walked));
  console.log('--- drain log (phase/path/beat -> option -> toPhase/toPath) ---');
  for (const e of (t.log || [])) {
    console.log(`d${e.day} ${e.phase}/${e.path || '-'}/${e.beat != null ? 'b' + e.beat : '-'} --[${e.optionId}|${e.note}]--> ${e.toPhase}/${e.toPath || '-'}/${e.toBranch || '-'}${e.toBeat != null ? '/b' + e.toBeat : ''}`);
  }
})().catch(e => { console.error('DIAG FATAL:', e && e.stack || e); process.exit(1); });
