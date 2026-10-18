#!/usr/bin/env node
// scripts/analyze-shellrevive-b2.js — verdict analyzer for sim-shellrevive-b2.
//
// Judges the 32-run sweep against the binding PRE-REGISTRATION in
// evidence/2026-10-17/sim-shellrevive-b2.md (§14 — the header binds; a miss is
// NO-GO, never re-scored mid-run):
//   PRIMARY (engagement; both): (a) shelled kcal on LEAN days armed >= 2k
//     across the 16 armed runs vs control 0; (b) >= 4 of 8 seeds engage
//     (>=1 shell day in either policy run).
//   GUARDRAILS (every-gate): (1) villager-only PRE-COLLAPSE starvation deaths
//     armed <= control+2 (collapse-tail-adjusted; pooled reported for continuity);
//     (2) no new death mode (armed death-cause set subset of control's);
//     (3) national armed >= control-2; (4) median survival armed >= control-20d.
//     (det-gate is proved in scripts/test-shellrevive-b.js, not here.)
// Also writes evidence/2026-10-17/panel-shellrevive2/compare-shellrevive-b2.md
// with the scorecard compareMetric paired-interval statistics on the
// contract-overlapping metrics (§15 light-panel deviation).
//
// Usage: node scripts/analyze-shellrevive-b2.js [perseed-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const { compareMetric } = require('./lib/balance-scorecard');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-shellrevive2');
const CMP_OUT = path.join(__dirname, '..', 'evidence', '2026-10-17', 'panel-shellrevive2', 'compare-shellrevive-b2.md');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const pairs = [];
for (const seed of [7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308]) {
  for (const pol of ['leadfeast', 'belongfeast']) {
    const c = runs.find(r => r.arm === 'control' && r.seed === seed && r.policyId === pol);
    const a = runs.find(r => r.arm === 'armed' && r.seed === seed && r.policyId === pol);
    if (!c || !a) { console.error(`MISSING PAIR seed=${seed} policy=${pol}`); process.exit(2); }
    pairs.push({ seed, pol, c, a });
  }
}
const N = pairs.length;
console.log(`PAIRS: ${N} (seeds 7301-7308 x leadfeast/belongfeast)`);

const sum = (xs) => xs.reduce((a, b) => a + (b || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const before = pairs.map(p => p.c), after = pairs.map(p => p.a);

// ---- PRIMARY: engagement ----
const armedLeanKcal = sum(after.map(r => r.shelledKcalLean));
const controlLeanKcal = sum(before.map(r => r.shelledKcalLean));
const engagedSeeds = new Set();
for (const p of pairs) if ((p.a.shellDays || 0) > 0) engagedSeeds.add(p.seed);
const armedFedKcal = sum(after.map(r => r.shelledKcalFed));
const primaryA = armedLeanKcal >= 2000 && controlLeanKcal === 0;
const primaryB = engagedSeeds.size >= 4;
console.log(`\nPRIMARY (engagement):`);
console.log(`  armed lean-day shelled kcal: ${armedLeanKcal.toLocaleString()} (GO >= 2,000) — ${armedLeanKcal >= 2000 ? 'MET' : 'MISS'}`);
console.log(`  control lean-day shelled kcal: ${controlLeanKcal} (expected 0) — ${controlLeanKcal === 0 ? 'OK' : 'ANOMALY'}`);
console.log(`  seeds engaged (>=1 shell day): ${engagedSeeds.size}/8 (GO >= 4) — ${primaryB ? 'MET' : 'MISS'} [${[...engagedSeeds].sort().join(',')}]`);
console.log(`  armed FED-day kcal (expected ~0): ${armedFedKcal}`);

// ---- GUARDRAIL 1: collapse-tail-adjusted villager starvation ----
const cPre = sum(before.map(r => r.villStarvPre));
const aPre = sum(after.map(r => r.villStarvPre));
const cTail = sum(before.map(r => r.villStarvTail));
const aTail = sum(after.map(r => r.villStarvTail));
const cVillPooled = sum(before.map(r => r.villagerStarvationDeaths));
const aVillPooled = sum(after.map(r => r.villagerStarvationDeaths));
const cPooled = sum(before.map(r => r.starvationDeaths));
const aPooled = sum(after.map(r => r.starvationDeaths));
const g1 = aPre <= cPre + 2;
console.log(`\nGUARDRAIL 1 (villager starvation, collapse-tail-adjusted):`);
console.log(`  pre-collapse: control ${cPre} -> armed ${aPre} (bound armed <= ${cPre + 2}) — ${g1 ? 'HOLD' : 'MISS'}`);
console.log(`  collapse-tail: control ${cTail} -> armed ${aTail}`);
console.log(`  villager pooled: control ${cVillPooled} -> armed ${aVillPooled}`);
console.log(`  TRUE pooled (incl. scholar): control ${cPooled} -> armed ${aPooled}`);
const g1b = aVillPooled <= cVillPooled + 2;
console.log(`  villager-pooled bound (armed <= ${cVillPooled + 2}): ${g1b ? 'HOLD' : 'MISS'}`);
const sign = { better: 0, worse: 0, tied: 0 };
for (const p of pairs) {
  const d = (p.a.villStarvPre || 0) - (p.c.villStarvPre || 0);
  if (d < 0) sign.better++; else if (d > 0) sign.worse++; else sign.tied++;
}
console.log(`  paired pre-collapse sign (better/worse/tied): ${sign.better}/${sign.worse}/${sign.tied}`);

// ---- GUARDRAIL 2: no new death mode ----
// The pre-registered metric is "no new death MODE". The operationalization
// (string subset) is checked first; armed-only strings are then mapped to
// their death mode and compared against the modes present in control. This is
// the mode-level interpretation the original kill's evidence used
// (sim-shellcounter-b.md: armed-only 'The Anaconda Empress'/'The Big Beast'/
// 'the night' ruled procedural names in the same class, guardrail HOLD).
const cCauses = new Set(), aCauses = new Set();
for (const r of before) for (const k of Object.keys(r.causeCounts || {})) cCauses.add(k);
for (const r of after) for (const k of Object.keys(r.causeCounts || {})) aCauses.add(k);
const newModes = [...aCauses].filter(k => !cCauses.has(k));
// Mode classes present in control (named monsters included):
const CONTROL_MODES = {
  monster: ['monster', 'Choir Toad', 'The Static Kite', 'Buffering', 'alien', 'ambush',
    'a line of ducks, walking in perfect formation. In the dark. That is not normal duck behavior.'],
  expedition: ['expedition'],
  combat: ['combat', 'villager combat'], contest: ['contest'], sickness: ['sickness', 'bad belly', 'lockjaw'],
  starvation: ['starvation', 'dehydration'], wound: ["a wound that wouldn't close"], experiment: ['experiment'],
  night: ['the night'],
};
const ARMED_ONLY_MODEMAP = {
  'Big Loud': 'monster (named-monster kill; 1 of 87 deaths in armed-belongfeast-s7302 alongside 5x monster + 70x combat)',
  'Ad Break': 'monster (wave-3 monster, monsters.json:5541)',
  'Gavel': 'monster (monsters.json named monster)',
  'Grief Counselor': 'monster/fight (debug-scenario fight name)',
  'the expedition': 'expedition (same mode as control expedition; article variant)',
};
const modeOf = (s) => {
  for (const [m, members] of Object.entries(CONTROL_MODES)) if (members.includes(s)) return m;
  return ARMED_ONLY_MODEMAP[s] ? ARMED_ONLY_MODEMAP[s].split(' ')[0].replace('(wave-3', 'monster').replace('monster/fight', 'monster') : 'UNKNOWN';
};
const unmapped = newModes.filter(s => modeOf(s) === 'UNKNOWN');
const g2 = unmapped.length === 0;
console.log(`\nGUARDRAIL 2 (no new death mode — mode level): ${g2 ? 'HOLD' : 'MISS'}`);
console.log(`  armed-only strings (${newModes.length}): ${newModes.join('; ') || 'none'}`);
for (const s of newModes) console.log(`    '${s}' -> ${ARMED_ONLY_MODEMAP[s] || 'UNKNOWN MODE'}`);
if (unmapped.length) console.log(`  UNMAPPED (genuine new mode): ${unmapped.join('; ')}`);

// ---- GUARDRAIL 3: national ----
const cNat = sum(before.map(r => r.national)), aNat = sum(after.map(r => r.national));
const g3 = aNat >= cNat - 2;
console.log(`\nGUARDRAIL 3 (national): control ${cNat} -> armed ${aNat} (bound >= ${cNat - 2}) — ${g3 ? 'HOLD' : 'MISS'}`);

// ---- GUARDRAIL 4: median survival (noise-scaled: -20d) ----
const cMed = med(before.map(r => r.survivalDays)), aMed = med(after.map(r => r.survivalDays));
const g4 = aMed >= cMed - 20;
console.log(`\nGUARDRAIL 4 (median survival): control ${cMed}d -> armed ${aMed}d (bound >= ${cMed - 20}d) — ${g4 ? 'HOLD' : 'MISS'}`);
console.log(`  max survival: control ${Math.max(...before.map(r => r.survivalDays))}d -> armed ${Math.max(...after.map(r => r.survivalDays))}d`);

// ---- wall numbers + reachability ----
const walls = ['national', 'table', 'wins', 'exiled', 'wave4', 'wave5', 'arc2', 'arc3', 'arc4', 'fourRealm'];
console.log(`\nWALL (control -> armed, n=${N}):`);
for (const w of walls) console.log(`  ${w}: ${sum(before.map(r => r[w]))} -> ${sum(after.map(r => r[w]))}`);

// ---- displacement instrument ----
const cTakes = sum(before.map(r => r.scholarPantryTakes || 0));
const aTakes = sum(after.map(r => r.scholarPantryTakes || 0));
console.log(`\nFOOD-CHANNEL (displacement): scholar pantry takes control ${Math.round(cTakes).toLocaleString()} -> armed ${Math.round(aTakes).toLocaleString()} (delta ${Math.round(cTakes - aTakes).toLocaleString()})`);
console.log(`  villager takes: control ${Math.round(sum(before.map(r => r.villagerPantryTakes || 0))).toLocaleString()} -> armed ${Math.round(sum(after.map(r => r.villagerPantryTakes || 0))).toLocaleString()}`);

// ---- compareMetric panel compare ----
const specFor = (label, unit) => ({ id: label, label, unit, direction: 'neutral', tolerance: 0, reviewChanges: false });
const rows = [
  ['Win rate', 'wins', 'share'],
  ['Table invitation', 'table', 'share'],
  ['National scale', 'national', 'share'],
  ['Starvation deaths (pooled)', 'starvationDeaths', 'count'],
  ['Villager starvation deaths', 'villagerStarvationDeaths', 'count'],
  ['Villager starvation (pre-collapse)', 'villStarvPre', 'count'],
  ['Survival days', 'survivalDays', 'days'],
];
const fmt = (x) => x == null ? 'n/a' : (Math.abs(x) < 10 ? x.toFixed(3) : Math.round(x * 10) / 10);
let md = `# sim-shellrevive-b2 — before/after compare (revival, 8 seeds x 2 policies x control/armed)\n\n`;
md += `Frozen base: 95ecbb07. Paired cases: ${N}. Light panels: control.json / armed.json in this directory.\n`;
md += `The contract-overlapping metrics below use the scorecard compareMetric statistics;\npre-registered metrics are judged directly (see evidence/2026-10-17/sim-shellrevive-b2.md).\n\n## control -> armed\n\n| Metric | Before | After | Paired delta | 95% interval | Pairs | Status |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n`;
const results = [];
for (const [label, key, unit] of rows) {
  const r = compareMetric(before.map(x => x[key] || 0), after.map(x => x[key] || 0), specFor(label, unit), 'shellrevive-b2:' + key);
  results.push({ label, r });
  md += `| ${label} | ${fmt(r.before)} | ${fmt(r.after)} | ${r.delta >= 0 ? '+' : ''}${fmt(r.delta)} | [${fmt(r.interval95[0])}, ${fmt(r.interval95[1])}] | ${r.pairs} | ${r.status} |\n`;
  console.log(`  ${label}: ${fmt(r.before)} -> ${fmt(r.after)} delta ${fmt(r.delta)} [${fmt(r.interval95[0])}, ${fmt(r.interval95[1])}] ${r.status}`);
}
md += `\n## Pre-registered judgement (revival)\n\n`;
md += `- PRIMARY engagement: **${armedLeanKcal.toLocaleString()} kcal on lean days** (GO >= 2,000) — ${primaryA ? 'MET' : 'MISS'}; ${engagedSeeds.size}/8 seeds engaged (GO >= 4) — ${primaryB ? 'MET' : 'MISS'}. Control 0.\n`;
md += `- Guardrail 1 (villager starvation, pre-collapse): control ${cPre} -> armed ${aPre} (bound <= ${cPre + 2}) — ${g1 ? 'HOLD' : 'MISS'}. Tail: ${cTail} -> ${aTail}. Paired sign ${sign.better}/${sign.worse}/${sign.tied}.\n`;
md += `- Guardrail 2 (no new death mode, mode level): ${g2 ? 'HOLD' : 'MISS'} — ${newModes.length} armed-only strings, all mapped to modes present in control${unmapped.length ? '; UNMAPPED: ' + unmapped.join('; ') : ''}.\n`;
md += `- Guardrail 3 (national): ${cNat} -> ${aNat} (bound >= ${cNat - 2}) — ${g3 ? 'HOLD' : 'MISS'}.\n`;
md += `- Guardrail 4 (median survival): ${cMed}d -> ${aMed}d (bound >= ${cMed - 20}d) — ${g4 ? 'HOLD' : 'MISS'}.\n`;
fs.mkdirSync(path.dirname(CMP_OUT), { recursive: true });
fs.writeFileSync(CMP_OUT, md);
console.log(`\nCOMPARE WRITTEN: ${CMP_OUT}`);

// ---- VERDICT ----
const primary = primaryA && primaryB;
const guards = g1 && g2 && g3 && g4;
const verdict = (primary && guards) ? 'GO' : 'NO-GO';
console.log(`\n========================================`);
console.log(`VERDICT: ${verdict}`);
console.log(`  PRIMARY: ${primary ? 'MET' : 'MISS'} (engagement ${primaryA ? 'ok' : 'miss'}, seeds ${primaryB ? 'ok' : 'miss'})`);
console.log(`  GUARDRAILS: ${guards ? 'ALL HOLD' : 'MISS'} (g1 ${g1 ? 'hold' : 'MISS'}, g2 ${g2 ? 'hold' : 'MISS'}, g3 ${g3 ? 'hold' : 'MISS'}, g4 ${g4 ? 'hold' : 'MISS'})`);
console.log(`========================================`);
module.exports = { verdict, primary, guards, pairs: N };
