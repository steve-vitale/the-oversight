#!/usr/bin/env node
// scripts/build-shellrevive-b3-panels.js — §15 escape-hatch light panels for
// the shelltask-b revival (sim-shellrevive-b3).
//
// The official balance-panel driver cannot express this arm (policy-side
// layer; FEASTSCALE_R13 substrate; leadfeast/belongfeast are not panel
// policies; the contract lacks starvation/shelled-kcal/pantry metrics).
// This emits honest per-seed panel-schema JSONs for the wall + arm metrics
// plus a compare .md with the pre-registered step-3/step-4 judgement.
// Pre-registered metrics are judged directly (see evidence), not by the panel.
//
// Usage: node scripts/build-shellrevive-b3-panels.js
'use strict';
const fs = require('fs');
const path = require('path');
const SEED_DIR = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-shellrevive-b3');
const OUT_DIR = path.join(__dirname, '..', 'evidence', '2026-10-18', 'panel-shellrevive-b3');

const rows = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(SEED_DIR, f), 'utf8')));

function panelFor(arm) {
  return {
    schema: 'shellrevive-b3-light-panel/1',
    note: 'Light panel: honest per-seed metrics from the sim-shellrevive-b3 pilot sweep (frozen base 01fd89450ea01109c79f1838b017741833f5cbe5, original seeds 7001-7008). NOT a balance-panel.js panel (no observer, no validity gates) — see metric review in evidence/2026-10-18/sim-shellrevive-b3.md.',
    wallMetrics: ['national', 'table', 'wins', 'exiled', 'survivalDays', 'starvationDeaths', 'shelledKcal', 'shelledKcalStarvDays', 'scholarPantryTakes'],
    rows: rows.filter(r => r.arm === arm).map(r => ({
      seed: r.seed, policy: r.policyId, arm: r.arm,
      metrics: {
        national: r.national, table: r.table, wins: r.wins, exiled: r.exiled,
        survivalDays: r.gameDays, starvationDeaths: r.starvationDeaths,
        shelledKcal: r.shelledKcal, shelledKcalStarvDays: r.shelledKcalStarvDays,
        scholarPantryTakes: r.scholarPantryTakes,
      },
    })),
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'control.json'), JSON.stringify(panelFor('control'), null, 1));
fs.writeFileSync(path.join(OUT_DIR, 'armed.json'), JSON.stringify(panelFor('armed'), null, 1));

// pre-registered step-3/step-4 judgement block
const sum = (a, f) => a.reduce((t, r) => t + (f(r) || 0), 0);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const C = rows.filter(r => r.arm === 'control'), A = rows.filter(r => r.arm === 'armed');
const engA = sum(A, r => r.shelledKcal), engC = sum(C, r => r.shelledKcal);
const starvA = sum(A, r => r.starvationDeaths), starvC = sum(C, r => r.starvationDeaths);
const natA = sum(A, r => r.national), natC = sum(C, r => r.national);
const medA = med(A.map(r => r.gameDays)), medC = med(C.map(r => r.gameDays));
let disp = 0, nulls = 0;
const pairs = {};
for (const r of rows) { const k = `${r.policyId}-s${r.seed}`; (pairs[k] = pairs[k] || {})[r.arm] = r; }
for (const [, p] of Object.entries(pairs)) {
  if (p.control && p.armed && p.control.scholarPantryTakes != null && p.armed.scholarPantryTakes != null)
    disp += p.control.scholarPantryTakes - p.armed.scholarPantryTakes;
  else nulls++;
}
const ccA = {}, ccC = {};
for (const r of A) for (const [k, v] of Object.entries(r.causeCounts || {})) ccA[k] = (ccA[k] || 0) + v;
for (const r of C) for (const [k, v] of Object.entries(r.causeCounts || {})) ccC[k] = (ccC[k] || 0) + v;
const newModes = Object.keys(ccA).filter(k => !(k in ccC));
const harmReproduced = starvA > starvC + 2;
const GO = !harmReproduced && engA >= 30000 && engC === 0 && starvA <= starvC + 2 &&
  disp >= 0 && nulls === 0 && natA >= natC - 2 && medA >= medC - 10 && newModes.length === 0;

const md = `# sim-shellrevive-b3 — before/after compare (pilot, original seeds 7001–7008 x 2 policies x control/armed, frozen base 01fd8945)

**Decision: ${GO ? 'GO' : harmReproduced ? 'KILL — harm-class signal reproduced' : 'NO-GO'}** (pre-registered step-3/step-4 adjudication)

Paired cases: ${Object.keys(pairs).length}. Light panels: control.json / armed.json in this directory.
Pre-registered metrics judged directly (see evidence/2026-10-18/sim-shellrevive-b3.md).

## Step 3 — harm-signal reproduction
- Pooled starvation: armed **${starvA}** vs control **${starvC}** (harm-class = armed > control+2 = ${starvC + 2}). **${harmReproduced ? 'REPRODUCED' : 'not reproduced'}**

## Step 4 — revised-guardrail GO
- (a) engagement: armed shelled kcal **${engA}** (GO >= 30000), control **${engC}** (GO = 0). **${engA >= 30000 && engC === 0 ? 'HOLD' : 'MISS'}**
- (b) starvation: armed **${starvA}** <= control+2 = ${starvC + 2}. **${starvA <= starvC + 2 ? 'HOLD' : 'MISS'}**
- (c) pantry-draw displacement (control − armed, scholar): **${disp}** kcal, nulls=${nulls} (GO >= 0). **${disp >= 0 && nulls === 0 ? 'HOLD' : 'MISS'}**
- (d) national **${natA}/${A.length}** vs control **${natC}/${C.length}** (GO >= control−2). **${natA >= natC - 2 ? 'HOLD' : 'MISS'}**
- (d) median survival **${medA}d** vs control **${medC}d** (GO >= control−10d). **${medA >= medC - 10 ? 'HOLD' : 'MISS'}**
- (d) new death modes: ${newModes.length ? newModes.join(', ') : 'none'}. **${newModes.length === 0 ? 'HOLD' : 'MISS'}**
- (d) det-gate: scripts/test-shelltask-b.js Part C (byte-identical gate-off).

**Overall: ${GO ? 'GO — land default-OFF layer' : 'NO-GO — kill zero-trace'}**
`;
fs.writeFileSync(path.join(OUT_DIR, 'compare-shellrevive-b3.md'), md);
console.log(`panels written to ${OUT_DIR}: control=${C.length} armed=${A.length} rows; verdict=${GO ? 'GO' : 'NO-GO'}`);
