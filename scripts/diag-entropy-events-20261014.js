'use strict';
// diag-entropy-events-20261014.js — log telemetry event types+days for
// days 100-115 in both runs of a pair. Finds where the event streams diverge.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'entropy-events', fullTelemetry: true });
  await setupGame(Game);
  const r = await runDays(Game, leadfeast, { days: 180, sampleEvery: 10 });
  const evs = (Game.state.telemetry || [])
    .filter(e => e.day >= 100 && e.day <= 115)
    .map(e => e.day + ':' + e.type + ':' + (e.kind || '') + ':' + (e.who || '') + ':' + (e.cause || ''));
  return { evs, days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44), b = await one(44);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    // Find first differing event (normalize timestamp IDs)
    const norm = s => s.replace(/app_[0-9a-z]+/g, 'APP').replace(/link_[0-9a-z]+/g, 'LINK').replace(/vis_[0-9a-z]+/g, 'VIS').replace(/scam_[0-9a-z_]+/g, 'SCAM');
    const aN = a.evs.map(norm), bN = b.evs.map(norm);
    const n = Math.min(aN.length, bN.length);
    let first = -1;
    for (let i = 0; i < n; i++) if (aN[i] !== bN[i]) { first = i; break; }
    if (first < 0) first = n;
    console.log('telemetry events A:', a.evs.length, 'B:', b.evs.length, 'first SUBSTANTIVE diff idx:', first);
    for (let i = Math.max(0, first - 3); i < Math.min(Math.max(aN.length, bN.length), first + 10); i++) {
      const sa = i < aN.length ? aN[i] : '(none)';
      const sb = i < bN.length ? bN[i] : '(none)';
      console.log(i, 'A:', sa, '\n' + i, 'B:', sb, sa === sb ? '' : '  <--');
    }
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
