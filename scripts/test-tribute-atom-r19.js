#!/usr/bin/env node
// PROOF (journey deepening r19, 2026-10-19): the TRIBUTE pantry atom law.
// RED (pre-fix): hierarchy.js's weekly tribute push minted single-unit
// 3000-4000 kcal atoms (`_v.pantry.push({name:'Tribute grain from X',
// kcalEach:_amt, units:1})`) — the same master-slab class the 2026-10-16
// granularity closure fixed for hauls/donations. Measured in the r19 pilot:
// seeds 9202/9203/9204, 190/9/113 daily-scan violations, maxAtom 4000.
// GREEN (post-fix): the tribute routes through depositPantryPieces (<=500
// pieces, stacksMatch-merged, pantryKcal kept honest).
// Deterministic: seeded harness; no RNG consumed by either path.
'use strict';
const fs = require('fs');
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 9202, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const fails = [];
  const ok = (cond, label) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + label); if (!cond) fails.push(label); };
  const say0 = Game.say; Game.say = () => {};

  // T1: the helper honors the law for a tribute-shaped 4000-kcal item.
  {
    const v = Game.state.village; v.pantry = []; v.pantryKcal = 0;
    const dep = Game.depositPantryPieces(v, { name: 'Tribute grain from Emberhold', kcalEach: 4000, units: 1, spoilDay: 50, safe: true }, 500);
    const worst = v.pantry.reduce((m, p) => Math.max(m, p.kcalEach || 0), 0);
    const total = v.pantry.reduce((t, p) => t + (p.kcalEach || 0) * (p.units || 1), 0);
    ok(worst <= 500, `T1 tribute 4000 kcal -> pieces <= 500 (worst=${worst})`);
    ok(total === 4000, `T1 total conserved: ${total} == 4000`);
    ok(dep === 4000, `T1 deposited == 4000 (got ${dep})`);
    ok(v.pantryKcal === 4000, `T1 pantryKcal honest (got ${v.pantryKcal})`);
    v.pantry = []; v.pantryKcal = 0;
  }

  // T2: the hierarchy call site no longer mints slabs (static, deterministic).
  {
    const src = fs.readFileSync('src/js/hierarchy.js', 'utf8');
    ok(!/\.pantry\.push\(\{\s*name:\s*'Tribute grain/.test(src), 'T2 no direct slab push of tribute grain in hierarchy.js (RED: push present)');
    ok(/depositPantryPieces\(_v,\s*\{\s*name:\s*'Tribute grain/.test(src), 'T2 tribute routes via depositPantryPieces');
  }

  Game.say = say0;
  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error('ERROR', e); process.exit(1); });
