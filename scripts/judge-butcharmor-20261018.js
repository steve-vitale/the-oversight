// sim-butcharmor pilot judge (2026-10-18).
//
// PRIMARY (§14, binding): median over paired qualifying pairs of
//   (armed.deferralArmorMargin - control.deferralArmorMargin) >= +2.0 pieces.
// A pair qualifies when BOTH arms have a non-null deferralArmorMargin.
// Guardrails: national >= control-2, median survival >= control-10d,
//   no new death mode (cause-canonicalized).
const path = require('path');
const fs = require('fs');
const EVID = path.join('/home/hatch/workspace/worktrees/sim-butcharmor',
  'evidence', '2026-10-18', 'perseed-butcharmor');

const median = xs => { if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const rows = fs.readdirSync(EVID).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
console.log(`rows: ${rows.length} (${rows.filter(r => r.crashed).length} crashed)`);

const key = (r) => `${r.policyId}-s${r.seed}`;
const control = {}, armed = {};
for (const r of rows) {
  if (r.crashed) continue;
  (r.arm === 'armed' ? armed : control)[key(r)] = r;
}
const pairs = [];
for (const k of Object.keys(control)) {
  if (armed[k]) pairs.push({ k, c: control[k], a: armed[k] });
}
console.log(`paired: ${pairs.length}/16`);

// engagement: did the layer fire on the armed side, and stay off on control?
for (const { k, c, a } of pairs) {
  const b = a.butcharmorCounters || {};
  const cnull = c.butcharmorCounters === null;
  console.log(`  ${k}: armed banked=${b.baBanked|0} diverted=${b.baDiverted|0} crafted=${b.baCrafted|0} fails=${b.baCraftFails|0} | control counters null=${cnull}`);
}

// primary metric
const deltas = [];
for (const { k, c, a } of pairs) {
  if (c.deferralArmorMargin == null || a.deferralArmorMargin == null) {
    console.log(`  ${k}: margin n/a (control=${c.deferralArmorMargin} armed=${a.deferralArmorMargin}) firstW4 control=${c.firstW4Day} armed=${a.firstW4Day}`);
    continue;
  }
  const d = a.deferralArmorMargin - c.deferralArmorMargin;
  deltas.push(d);
  console.log(`  ${k}: margin control=${c.deferralArmorMargin} armed=${a.deferralArmorMargin} delta=${d >= 0 ? '+' : ''}${d}`);
}
const med = median(deltas);
console.log(`\nPRIMARY: n=${deltas.length} paired deltas, median delta = ${med == null ? 'n/a' : (med >= 0 ? '+' : '') + med.toFixed(2)} pieces (GO >= +2.0)`);

// guardrails
const natC = pairs.reduce((s, p) => s + (p.c.national | 0), 0);
const natA = pairs.reduce((s, p) => s + (p.a.national | 0), 0);
console.log(`guardrail national: control=${natC} armed=${natA} (need armed >= control-2 = ${natC - 2})`);
const survC = median(pairs.map(p => p.c.gameDays | 0));
const survA = median(pairs.map(p => p.a.gameDays | 0));
console.log(`guardrail survival: control median=${survC}d armed median=${survA}d (need >= ${survC - 10})`);
const causesC = {}, causesA = {};
for (const { c, a } of pairs) {
  for (const [k, v] of Object.entries(c.deaths.byCause || {})) causesC[k] = (causesC[k] || 0) + v;
  for (const [k, v] of Object.entries(a.deaths.byCause || {})) causesA[k] = (causesA[k] || 0) + v;
}
const newModes = Object.keys(causesA).filter(k => !causesC[k]);
console.log(`guardrail death modes: control causes=${Object.keys(causesC).length} armed causes=${Object.keys(causesA).length} new-in-armed=[${newModes.join(', ')}]`);

const go = med != null && med >= 2.0 &&
  natA >= natC - 2 && survA >= survC - 10 && newModes.length === 0;
console.log(`\nVERDICT: ${go ? 'GO (confirm at 12 seeds)' : 'KILL (per protocol)'}`);
