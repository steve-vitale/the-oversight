#!/usr/bin/env node
// scripts/test-r52split-sense.js — r52split sense-test reader.
//
// Runs one seed under the tableseat-nowait substrate and prints, to
// stdout only (no file writes), the corpse-spawn log: every
// registerDeath call with the scholar's cell, the explicit opts
// cell (if any), and the cell the corpse was actually filed at.
// The r52 corpses.js fix changes ONLY the defaulting path: when
// opts.mx/my are absent, the corpse cell defaults to the scholar's
// cell — old code `(s.mx || 4)` filed a scholar at edge 0 at the
// center (4,4); new code `(s.mx ?? 4)` files it at the true edge.
//
// Run twice — once with HEAD corpses.js, once with the e8f2ccad7
// version swapped in (verify blob hashes around the swap; the
// driver script's restore step returns the tree to HEAD) — and
// diff the spawn logs: the first EDGE line that differs is the
// mechanism's first bite. Also prints the endpoint row and the
// deaths list (day, who, cause) so the first divergent death day
// can be read against the spawn log.
//
// Usage: node scripts/test-r52split-sense.js [seed]
//   (default seed 73671 — the first band seed that moves).
// Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1 are set inside.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
async function main() {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const seed = parseInt(process.argv[2] || '73671', 10);
  const { Game } = await loadGame({ seed, mode: 'r52split-sense', fullTelemetry: false });
  await setupGame(Game);
  const spawns = [];
  const orig = Game.registerDeath;
  if (typeof orig !== 'function') { console.log('SENSE: Game.registerDeath not a function — cannot wrap'); process.exit(2); }
  Game.registerDeath = function (opts) {
    opts = opts || {};
    let s = null;
    try { s = Game.state.scholar || {}; } catch (e) { s = {}; }
    const before = { day: s.day || 0, smx: (s.mx == null ? null : s.mx), smy: (s.my == null ? null : s.my) };
    const ret = orig.call(this, opts);
    let filed = null;
    try {
      const list = Game.corpses();
      const last = list[list.length - 1];
      if (last) filed = { mx: last.mx, my: last.my, name: last.name, kind: last.kind };
    } catch (e) { /* best-effort */ }
    const edge = (opts.mx == null && opts.my == null && (before.smx === 0 || before.smy === 0));
    spawns.push(Object.assign({}, before, {
      kind: opts.kind || '?', who: opts.villagerId || opts.monsterId || opts.name || '?',
      cause: opts.cause || '?', omx: (opts.mx == null ? null : opts.mx), omy: (opts.my == null ? null : opts.my),
      filed: filed, edge: edge,
    }));
    return ret;
  };
  const result = await runDays(Game, tableseatNowait, { days: 180, manifest: undefined, sampleEvery: 10 });
  console.log(`SENSE seed=${seed} days=${result.days} end=${result.endReason} won=${Game.won ? 1 : 0} deaths=${(result.samples.deaths || []).length}`);
  for (const sp of spawns) {
    console.log(`SPAWN d${sp.day} ${sp.edge ? 'EDGE*' : '     '} scholar=(${sp.smx},${sp.smy}) opts=(${sp.omx},${sp.omy}) filed=(${sp.filed ? sp.filed.mx : '?'},${sp.filed ? sp.filed.my : '?'}) ${sp.kind} ${sp.who} cause=${sp.cause}`);
  }
  for (const d of (result.samples.deaths || [])) {
    console.log(`DEATH d${d.day} ${d.player ? 'player' : 'villager'} ${d.who} cause=${d.cause}`);
  }
}
if (require.main === module) main().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
