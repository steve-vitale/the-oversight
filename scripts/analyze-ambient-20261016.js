#!/usr/bin/env node
// scripts/analyze-ambient-20261016.js — det-gate + variety + wall metrics for
// the sim-ambient-b sweep (control vs armed, identical seeds).
//
// Reads evidence/2026-10-16/perseed-ambient/<side>-<pid>-s<seed>.{json,hashes.json,picks.json}
// and prints:
//   1. DET-GATE: per-dawn extHash byte-identical armed vs control, 16/16 pairs.
//   2. VARIETY: sweep-level distinct variant indices per key (armed, from the
//      ambientPick instrument) and distinct rendered texts per key (control,
//      from per-seed say samples). GO: >=3 per key on armed.
//   3. WALL METRICS: national/table/wins/wave45/median survival/death causes,
//      report-only, both sides.
// Usage: node scripts/analyze-ambient-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-ambient');
const SEEDS = [141, 252, 363, 474, 585, 696, 807, 918];
const PIDS = ['leadfeast', 'belongfeast'];
const KEYS = ['rest', 'eat', 'chore_fire', 'chore_repair', 'chore_cook', 'chore_sweep', 'finds', 'visit', 'mend'];

// Text-level verb-phrase normalization: strip the name slots so "distinct
// texts" measures verb-phrase variety, not roster variety. Returns the
// normalized verb phrase or null if the text is not the known template.
const NORM_RES = {
  rest: [/^😴 (.+) is sleeping by the fire\.$/, 'REST'],
  eat: [/^🍲 (.+) is eating by the fire — not talking, just eating\.$/, 'EAT'],
  chore_fire: [/^(.+) is tending the fire, coaxing it steady\.$/, 'FIRE'],
  chore_repair: [/^(.+) is mending something by the door — patient work\.$/, 'REPAIR'],
  chore_cook: [/^(.+) is working the cookpot, tasting, adjusting\.$/, 'COOK'],
  chore_sweep: [/^(.+) is sweeping the hall\. Someone has to\.$/, 'SWEEP'],
  finds: [/^📖 (.+) is going over their finds, re-tying the bundle\.$/, 'FINDS'],
  visit: [/^💬 (.+) is sitting with (.+), talking low\. Not business\. Just people\.$/, 'VISIT'],
  mend: [/^🤒 (.+) is on the mend — (.+) broke\.$/, 'MEND'],
};
function normVerb(key, text) {
  const [re] = NORM_RES[key] || [];
  if (!re) return null;
  const m = re.exec(text);
  if (!m) return 'OTHER:' + text.slice(0, 60); // not the known template shape
  // armed variants: strip ALL name/arg slots to the bare verb phrase
  let s = text;
  for (let i = m.length - 1; i >= 1; i--) s = s.replace(m[i], i === 1 ? 'N' : (key === 'mend' ? 'OF' : 'N2'));
  return s;
}

let fails = [];
function read(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

// 1. DET-GATE
console.log('== 1. DET-GATE: per-dawn trajectory hash, armed vs control ==');
let detPass = 0, detTotal = 0;
const detFails = [];
for (const seed of SEEDS) for (const pid of PIDS) {
  detTotal++;
  const hc = read(path.join(DIR, `control-${pid}-s${seed}.hashes.json`));
  const ha = read(path.join(DIR, `armed-${pid}-s${seed}.hashes.json`));
  const ok = hc.length === ha.length && hc.length > 0 && hc.every((h, i) => h === ha[i]);
  if (ok) detPass++; else detFails.push(`${pid}-s${seed} (n=${hc.length}/${ha.length})`);
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} — ${hc.length} dawn hashes`);
}
console.log(`DET-GATE: ${detPass}/${detTotal} byte-identical`);
if (detFails.length) { fails.push('det-gate'); console.log('  failures: ' + detFails.join(', ')); }

// 2. VARIETY
console.log('\n== 2. VARIETY ==');
console.log('-- armed: distinct variant indices across all 16 runs (instrument) --');
console.log('   (fixtures prove each index renders a distinct verb phrase: test PART A A2)');
let varFails = [];
for (const k of KEYS) {
  const idxs = new Set();
  let firings = 0;
  for (const seed of SEEDS) for (const pid of PIDS) {
    const picks = read(path.join(DIR, `armed-${pid}-s${seed}.picks.json`));
    for (const p of picks) if (p.key === k) { idxs.add(p.idx); firings++; }
  }
  const ok = firings === 0 ? null : idxs.size >= 3;
  if (ok === false) varFails.push(k);
  console.log(`  ${ok === null ? 'NO-FIRINGS' : ok ? 'PASS' : 'FAIL'} ${k}: ${idxs.size} distinct indices, ${firings} firings [${[...idxs].sort().join(',')}]`);
}
console.log('-- control: verb-phrase normalization (name slots stripped) --');
console.log('   (expect exactly 1 verb phrase per key: the pre-fix single template)');
for (const k of KEYS) {
  const phrases = new Set();
  let firings = 0, other = 0;
  for (const seed of SEEDS) for (const pid of PIDS) {
    const slim = read(path.join(DIR, `control-${pid}-s${seed}.json`));
    const v = (slim.variety || {})[k] || {};
    firings += v.sayFirings || 0;
    for (const t of (v.samples || [])) {
      const n = normVerb(k, t);
      if (!n || n.startsWith('OTHER:')) other++;
      else phrases.add(n);
    }
  }
  const ok = firings === 0 ? null : (phrases.size === 1 && other === 0);
  console.log(`  ${ok === null ? 'NO-FIRINGS' : ok ? 'ok  ' : 'NOTE'} ${k}: ${phrases.size} verb phrase(s), ${firings} firings${other ? `, ${other} unmatched` : ''}`);
}
if (varFails.length) fails.push('variety: ' + varFails.join(','));

// 3. WALL METRICS (report-only)
console.log('\n== 3. WALL METRICS (report-only) ==');
for (const side of ['control', 'armed']) {
  const rows = [];
  for (const seed of SEEDS) for (const pid of PIDS) rows.push(read(path.join(DIR, `${side}-${pid}-s${seed}.json`)));
  const sum = k => rows.reduce((a, r) => a + (r[k] || 0), 0);
  const days = rows.map(r => r.gameDays || 0).sort((a, b) => a - b);
  const med = days.length % 2 ? days[days.length >> 1] : (days[(days.length >> 1) - 1] + days[days.length >> 1]) / 2;
  const deaths = {};
  for (const r of rows) for (const k of Object.keys(r.deaths || {})) deaths[k] = (deaths[k] || 0) + r.deaths[k];
  console.log(`  ${side}: n=${rows.length} national=${sum('national')} table=${sum('table')} wins=${sum('wins')} ` +
    `wave45=${sum('wave45')} exiled=${sum('exiled')} sittings=${sum('sittings')} medianDays=${med} maxDays=${days[days.length - 1]}`);
  console.log(`    maxArc=${Math.max.apply(null, rows.map(r => r.maxArc || 1))} maxWave=${Math.max.apply(null, rows.map(r => r.maxWave || 1))}`);
  const dk = Object.keys(deaths).sort((a, b) => deaths[b] - deaths[a]).slice(0, 8);
  console.log(`    deaths: ${dk.map(k => `${k}=${deaths[k]}`).join(', ')}`);
  const herr = sum('sayHookErr') + sum('pickHookErr');
  if (herr) console.log(`    INSTRUMENT ERRORS: ${herr}`);
}

// GO verdict vs the pre-registered primary
console.log('\n== GO VERDICT ==');
const goVariety = varFails.length === 0;
const goDet = detFails.length === 0;
console.log(`  variety >=3/key (armed): ${goVariety ? 'GO' : 'NO-GO'}`);
console.log(`  det-gate 16/16 byte-identical: ${goDet ? 'GO' : 'NO-GO'}`);
console.log(`  sense PASS: judged from transcripts in the evidence file (manual)`);
const go = goVariety && goDet;
console.log(go && !fails.length ? '\nPRIMARY: GO' : `\nPRIMARY: NO-GO (${fails.join('; ')})`);
process.exit(go && !fails.length ? 0 : 1);
