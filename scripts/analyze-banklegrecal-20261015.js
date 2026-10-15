#!/usr/bin/env node
// analyze-banklegrecal-20261015.js — compare banklegrecal pilot arms vs
// their own same-sweep control (never an inherited baseline, #247).
// Prints the pre-registered PRIMARY (h1200), CO-PRIMARY (trust>=30),
// guardrails, wall numbers, death-cause shares, and per-policy splits.
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-banklegrecal');
const rows = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'))
  .filter(r => !r.error);

const byKey = {};
for (const r of rows) byKey[`${r.policyId}|${r.side}|${r.seed}`] = r;

function sum(rows, f) { return rows.reduce((t, r) => t + (f(r) || 0), 0); }
function median(vs) { const s = [...vs].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
function ratio(a, b) { return b === 0 ? (a === 0 ? '—' : '∞') : (a / b).toFixed(3); }

function deathsOf(rows) {
  const out = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) out[k] = (out[k] || 0) + v;
  return out;
}
// Prefer the per-run recorded thirst counters (with the player flag); fall
// back to cause-key matching for rows written by older sweeps.
function thirstDeaths(rows) {
  const recorded = rows.some(r => r.thirstDeathsAll !== undefined);
  if (recorded) return { all: sum(rows, r => r.thirstDeathsAll || 0), scholar: sum(rows, r => r.scholarThirstDeaths || 0) };
  const all = sum(rows, r => sum(Object.entries(r.deaths || {}), ([k, v]) => /thirst/i.test(k) ? v : 0));
  return { all, scholar: null };
}

const out = [];
function line(s) { out.push(s); console.log(s); }

line('=== BANKLEGRECAL PILOT ANALYSIS (own control, same sweep) ===');
line('seeds=' + [...new Set(rows.map(r => r.seed))].join(',') + ' policies=' + [...new Set(rows.map(r => r.policyId))].join(',') + ' n=' + rows.length);

for (const scope of ['pooled', 'belongseek', 'leadfeast']) {
  const A = rows.filter(r => (scope === 'pooled' || r.policyId === scope) && r.side === 'armed');
  const C = rows.filter(r => (scope === 'pooled' || r.policyId === scope) && r.side === 'control');
  if (!A.length || !C.length) { line(`\n-- ${scope}: NO DATA`); continue; }
  const hA = sum(A, r => r.hungry1200), hC = sum(C, r => r.hungry1200);
  const tA = sum(A, r => r.trustGe30), tC = sum(C, r => r.trustGe30);
  const halfA = sum(A, r => r.halfRation), halfC = sum(C, r => r.halfRation);
  const oldA = sum(A, r => r.starvedDays), oldC = sum(C, r => r.starvedDays); // deprecated metric, reported for calibration only
  const mA = median(A.map(r => r.gameDays)), mC = median(C.map(r => r.gameDays));
  const maxA = Math.max(...A.map(r => r.gameDays)), maxC = Math.max(...C.map(r => r.gameDays));
  const nA = sum(A, r => r.national ? 1 : 0), nC = sum(C, r => r.national ? 1 : 0);
  const tblA = sum(A, r => r.everTable ? 1 : 0), tblC = sum(C, r => r.everTable ? 1 : 0);
  const wA = sum(A, r => r.won ? 1 : 0), wC = sum(C, r => r.won ? 1 : 0);
  const w4A = sum(A, r => (r.maxWave || 0) >= 4 ? 1 : 0), w4C = sum(C, r => (r.maxWave || 0) >= 4 ? 1 : 0);
  const w5A = sum(A, r => (r.maxWave || 0) >= 5 ? 1 : 0), w5C = sum(C, r => (r.maxWave || 0) >= 5 ? 1 : 0);
  const sA = sum(A, r => r.starveDeaths), sC = sum(C, r => r.starveDeaths);
  const thA = thirstDeaths(A), thC = thirstDeaths(C);
  const wildA = sum(A, r => r.wildVisits), wildC = sum(C, r => r.wildVisits);
  const wdA = wildA / Math.max(1, sum(A, r => r.gameDays)), wdC = wildC / Math.max(1, sum(C, r => r.gameDays));
  const legsA = sum(A, r => r.guaranteeLegs), legsC = sum(C, r => r.guaranteeLegs);
  const refuseA = sum(A, r => r.refused), hatchA = sum(A, r => r.hatchTakes);
  line(`\n-- ${scope} (armed n=${A.length}, control n=${C.length}) --`);
  line(`PRIMARY h1200:            ${hA}/${hC} = ${ratio(hA, hC)}  (GO <= 0.650)`);
  line(`CO-PRIMARY trust>=30:     ${tA}/${tC} = ${ratio(tA, tC)}  (GO >= 1.100)`);
  line(`half-ration days:         ${halfA}/${halfC} = ${ratio(halfA, halfC)}`);
  line(`old 0.6cap (deprecated):  ${oldA}/${oldC} = ${ratio(oldA, oldC)}  (calibration only, NEVER a verdict)`);
  line(`guard median survival:    ${mA} vs ${mC} (need >= ${mC - 10})`);
  line(`guard national:           ${nA}/${A.length} vs ${nC}/${C.length} (need >= ${nC - 2})`);
  line(`guard starvation deaths:  ${sA} vs ${sC} (need within ${sC}±3)`);
  line(`guard villager thirst:    ${thA.all - (thA.scholar || 0)} vs ${thC.all - (thC.scholar || 0)} (need <= ${(thC.all - (thC.scholar || 0)) + 2}); scholar thirst ${thA.scholar == null ? 'n/a' : thA.scholar} vs ${thC.scholar == null ? 'n/a' : thC.scholar} (need <= ${(thC.scholar || 0) + 1})`);
  line(`wall: table ${tblA}/${A.length} vs ${tblC}/${C.length}; wins ${wA}/${wC}; w4 ${w4A} vs ${w4C}; w5 ${w5A} vs ${w5C}; max ${maxA}d/${maxC}d`);
  line(`mechanism: legs ${legsA} (g${sum(A, r => r.gardenLegs)}/f${sum(A, r => r.fishLegs)}/h${sum(A, r => r.forageLegs)}); skipped ${sum(A, r => r.guaranteeSkipped)}; refused ${refuseA}; hatch ${hatchA}`);
  line(`exposure: wild visits/day ${wdA.toFixed(2)} vs ${wdC.toFixed(2)} (total ${wildA}/${wildC})`);
}

line('\n-- death-cause shares (pooled) --');
for (const side of ['control', 'armed']) {
  const R = rows.filter(r => r.side === side);
  const d = deathsOf(R);
  const tot = Object.values(d).reduce((t, v) => t + v, 0);
  const rot = sum(Object.entries(d), ([k, v]) => /rot/i.test(k) ? v : 0);
  const th = thirstDeaths(R);
  line(`[${side}] total=${tot} rot/total-deaths=${ratio(rot, tot)} starve=${sum(R, r => r.starveDeaths)} thirst=${th.all}${th.scholar == null ? '' : ` (scholar ${th.scholar})`}`);
  const top = Object.entries(d).sort((a, b) => b[1] - a[1]).slice(0, 12);
  line(`  ${top.map(([k, v]) => `${k} ${v} (${(100 * v / tot).toFixed(0)}%)`).join(', ')}`);
}
fs.writeFileSync(path.join(__dirname, 'banklegrecal-analysis.txt'), out.join('\n') + '\n');
console.log('\nwrote scripts/banklegrecal-analysis.txt');
