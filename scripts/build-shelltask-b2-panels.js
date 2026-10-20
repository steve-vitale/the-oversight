#!/usr/bin/env node
// scripts/build-shelltask-b2-panels.js — §15 escape-hatch light panels for
// the shelltask-b2 revival pilot.
//
// The official balance-panel driver cannot express this arm (policy-side
// layer; FEASTSCALE_R13 substrate; leadfeast/belongfeast are not panel
// policies; the contract lacks starvation/shelled-kcal/pantry metrics).
// This emits honest per-seed panel-schema JSONs for the wall + arm metrics
// plus a compare .md with the pre-registered GO judgement. Pre-registered
// metrics are judged directly (see evidence), not by the panel.
//
// Usage: node scripts/build-shelltask-b2-panels.js
'use strict';
const fs = require('fs');
const path = require('path');
const SEED_DIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-shelltask-b2');
const OUT_DIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'panel-shelltask-b2');

const rows = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(SEED_DIR, f), 'utf8')));

function panelFor(arm) {
  return {
    schema: 'shelltask-b2-light-panel/1',
    note: 'Light panel: honest per-seed metrics from the sim-shelltask-b2 revival pilot sweep (frozen base 09123a854, fresh seeds 8001-8008). NOT a balance-panel.js panel (no observer, no validity gates) — see metric review in evidence/2026-10-20/sim-shelltask-b2.md.',
    wallMetrics: ['national', 'table', 'wins', 'exiled', 'survivalDays', 'starvationDeaths', 'playerStarvationDeaths', 'shelledKcal', 'shelledKcalStarvDays', 'scholarPantryTakes'],
    rows: rows.filter(r => r.arm === arm).map(r => ({
      seed: r.seed, policy: r.policyId, arm: r.arm,
      metrics: {
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        survivalDays: r.gameDays, starvationDeaths: r.starvationDeaths,
        playerStarvationDeaths: r.playerStarvationDeaths,
        shelledKcal: r.shelledKcal, shelledKcalStarvDays: r.shelledKcalStarvDays,
        scholarPantryTakes: r.scholarPantryTakes,
      },
    })),
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'control.json'), JSON.stringify(panelFor('control'), null, 1));
fs.writeFileSync(path.join(OUT_DIR, 'armed.json'), JSON.stringify(panelFor('armed'), null, 1));

// pre-registered GO judgement block
const sum = (a, f) => a.reduce((t, r) => t + (f(r) || 0), 0);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const C = rows.filter(r => r.arm === 'control'), A = rows.filter(r => r.arm === 'armed');
const engA = sum(A, r => r.shelledKcal), engC = sum(C, r => r.shelledKcal);
const starvA = sum(A, r => r.shelledKcalStarvDays);
const sdA = sum(A, r => r.starvationDeaths), sdC = sum(C, r => r.starvationDeaths);
const psdA = sum(A, r => r.playerStarvationDeaths), psdC = sum(C, r => r.playerStarvationDeaths);
const natA = sum(A, r => r.national), natC = sum(C, r => r.national);
const medA = med(A.map(r => r.gameDays)), medC = med(C.map(r => r.gameDays));
let disp = 0;
for (const c of C) {
  const a = A.find(r => r.seed === c.seed && r.policyId === c.policyId);
  if (a) disp += (c.scholarPantryTakes || 0) - (a.scholarPantryTakes || 0);
}
const lines = [
  '# sim-shelltask-b2 — before/after compare (revival pilot, 8 seeds x 2 policies x control/armed)',
  '',
  'Frozen base: 09123a854. Paired cases: 16. Light panels: control.json / armed.json in this directory.',
  'The contract-overlapping metrics below are descriptive; pre-registered metrics are judged directly (see evidence/2026-10-20/sim-shelltask-b2.md).',
  '',
  '## control -> armed',
  '',
  '| Metric | Before | After | Paired delta | Pairs |',
  '| --- | ---: | ---: | ---: | ---: |',
  `| National scale | ${(sum(C, r => r.national) / C.length).toFixed(3)} | ${(sum(A, r => r.national) / A.length).toFixed(3)} | ${(natA - natC)} | 16 |`,
  `| Table invitation | ${(sum(C, r => r.table) / C.length).toFixed(3)} | ${(sum(A, r => r.table) / A.length).toFixed(3)} | ${sum(A, r => r.table) - sum(C, r => r.table)} | 16 |`,
  `| Starvation deaths (pooled) | ${sdC} | ${sdA} | ${sdA - sdC} | 16 |`,
  `| Player starvation deaths | ${psdC} | ${psdA} | ${psdA - psdC} | 16 |`,
  `| Pantry displacement (control-armed, kcal) | — | — | ${disp} | 16 |`,
  `| Survival days (median) | ${medC} | ${medA} | ${medA - medC} | 16 |`,
  `| Shelled kcal (armed total) | 0 | ${engA} | +${engA} | 16 |`,
  `| Shelled kcal on starvation days (armed) | 0 | ${starvA} | +${starvA} | 16 |`,
  '',
  '## Pre-registered judgement (revival)',
  '',
  `- PRIMARY(a) engagement: **${engA} kcal armed vs 0 control** (need armed>0, control=0) — ${engA > 0 && engC === 0 ? 'MET' : 'MISS'}.`,
  `- PRIMARY(b) shelled-and-eaten on starvation days: **${starvA} kcal armed** (need >= 1000) — ${starvA >= 1000 ? 'MET' : 'MISS'}.`,
  `- STARVATION guardrail: armed ${sdA} vs control ${sdC} (bound <= ${sdC + 2}) — ${sdA <= sdC + 2 ? 'HOLD' : 'BREACH'}; player starvation ${psdA} vs ${psdC}.`,
  `- DISPLACEMENT guardrail: ${disp} >= 0 — ${disp >= 0 ? 'HOLD' : 'MISS'} (armed scholar pantry draws must not exceed control).`,
  `- national ${natA} vs ${natC} (need >= ${natC - 2}) — ${natA >= natC - 2 ? 'HOLD' : 'MISS'}.`,
  `- median survival ${medA}d vs ${medC}d (need >= ${medC - 10}d) — ${medA >= medC - 10 ? 'HOLD' : 'MISS'}.`,
  '',
];
fs.writeFileSync(path.join(OUT_DIR, 'compare-shelltask-b2.md'), lines.join('\n'));
console.log('panels written to', OUT_DIR);
