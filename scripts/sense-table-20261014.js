'use strict';
// One-off sense-test: re-run table-reaching walked seeds with a narrow beat capture
// (table scene, audit, deferral, finals, deaths, final days) — SENSE-TESTING LAW.
// Prints the story of the table wait and the final days. (Diagnostic scratch.)
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const wc = require('./wincensus-20261014');
const { leadfeast } = require('./policies/feastscale');
const SEED = parseInt(process.env.SEED || '11', 10);
const RE = /◈ THE TABLE|◈ THE AUDIT|ninety|Ninety|defer|DEFER|final|FINAL|epilogue|falter|downgrade|died|dead|starv|village is gone|extinct|chose|mercy|MERCY|FEARED|Feared|waiting|Waiting|reschedule|RESCHEDULE/i;
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'sense-table' });
  await setupGame(Game);
  const lines = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const osay = Game.say.bind(Game);
  Game.say = function (m) {
    try {
      const t = String(m == null ? '' : m);
      const d = gday();
      if (d >= 60 && /table|TABLE|seat|SEAT|audit|AUDIT|path|PATH|door|DOOR|choice|CHOICE|mercy|MERCY|won|WON|win|WIN|final|FINAL|epilogue/i.test(t) && lines.length < 120) lines.push({ day: d, text: t.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 320) });
    } catch (e) {}
    return osay(m);
  };
  const policy = wc.wrapWithTableWalk(leadfeast);
  const wrapped = Object.create(policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => base(G, ctx);
  const r = await runDays(Game, wrapped, { days: 180, sampleEvery: 1 });
  console.log(`=== seed ${SEED} walked: days=${r.days} end=${r.endReason} won=${!!Game.won} over=${!!Game.over}`);
  for (const l of lines) console.log(`d${l.day}: ${l.text}`);
})().catch(e => { console.error('FATAL', e && e.message); process.exit(1); });
