#!/usr/bin/env node
// analyze-pyrrhic-20261017.js — the sim-pyrrhic det-gate analyzer.
//
// Compares the FIXED sweep (evidence/2026-10-17/perseed-pyrrhic/) against
// the PRISTINE same-base control (evidence/2026-10-17/perseed-pyrrhic-ctrl/,
// game.js at HEAD without the fix, identical seeds/policies/substrate).
//
// The in-sweep detGate vs perseed-attrcensus is INVALID: four loop-B commits
// landed on src/js/game.js between the attrcensus re-sweep and this run's
// base (sim-mergereval-b, sim-phantomfood-b, sim-capdoor-b, sim-prosefix-b —
// food-economy mechanics), so trajectories drift by base, not by the fix.
// THIS comparison isolates the fix.
//
// Expected (attribution-only): identical days/endReason/nTbFights/wall
// metrics; nPerf/nUnattr identical; nAttr = control + (newly attributed
// pyrrhic kills); unattr fight rows identical; the only state delta is the
// +attribution entries (waveKillLog/codex/villageSlain).
//
// Usage: node scripts/analyze-pyrrhic-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FIXDIR = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-pyrrhic');
const CTRLDIR = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-pyrrhic-ctrl');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

const files = fs.readdirSync(FIXDIR).filter(f => f.endsWith('.json')).sort();
let totFixed = { nPerf: 0, nAttr: 0, nUnattr: 0, nPyrrhicUnattr: 0, pyrrhicFixed: 0 };
let totCtrl = { nPerf: 0, nAttr: 0, nUnattr: 0, nPyrrhicUnattr: 0 };
let wallFixed = { national: 0, table: 0, won: 0 };
let wallCtrl = { national: 0, table: 0, won: 0 };

for (const fn of files) {
  const fx = JSON.parse(fs.readFileSync(path.join(FIXDIR, fn), 'utf8'));
  const cx = JSON.parse(fs.readFileSync(path.join(CTRLDIR, fn), 'utf8'));
  const tag = `${fx.policyId}-s${fx.seed}`;
  ok(fx.days === cx.days, `${tag}: days identical (ctrl ${cx.days}, fixed ${fx.days})`);
  ok(fx.endReason === cx.endReason, `${tag}: endReason identical (ctrl ${cx.endReason}, fixed ${fx.endReason})`);
  ok(fx.nTbFights === cx.nTbFights, `${tag}: nTbFights identical (ctrl ${cx.nTbFights}, fixed ${fx.nTbFights})`);
  ok(fx.nPerf === cx.nPerf, `${tag}: nPerf identical (ctrl ${cx.nPerf}, fixed ${fx.nPerf})`);
  const cxA2 = (cx.fights || []).filter(r => r.cls === 'a2').length;
  ok(fx.nUnattr === cx.nUnattr - cxA2, `${tag}: nUnattr = ctrl - a2-moved (ctrl ${cx.nUnattr} - ${cxA2} = ${fx.nUnattr})`);
  ok(fx.nAttr === cx.nAttr + fx.pyrrhicFixed.length, `${tag}: nAttr = ctrl + pyrrhicFixed (${cx.nAttr} + ${fx.pyrrhicFixed.length} = ${fx.nAttr})`);
  ok(fx.national === cx.national && fx.table === cx.table && fx.won === cx.won,
    `${tag}: wall metrics identical (ctrl n${cx.national}/t${cx.table}/w${cx.won}, fixed n${fx.national}/t${fx.table}/w${fx.won})`);
  // Unattr fight rows: every control row must match row-for-row, EXCEPT
  // control a2 rows (pyrrhic on pristine) — those are SUPPOSED to move to
  // attributed in the fixed run; assert they land in pyrrhicFixed instead.
  const fm = {};
  for (const r of (fx.fights || [])) fm[`${r.seq}/${r.mid}`] = r;
  const pfm = {};
  for (const r of (fx.pyrrhicFixed || [])) pfm[`${r.seq}/${r.mid}`] = r;
  for (const cr of (cx.fights || [])) {
    if (cr.cls === 'a2') {
      const pr = pfm[`${cr.seq}/${cr.mid}`];
      ok(!!pr, `${tag}: control a2 row seq${cr.seq}/${cr.mid} now in pyrrhicFixed`);
      if (pr) ok(['day', 'result', 'nPerfs', 'midDead', 'midAlive', 'pAlive'].every(k => pr[k] === cr[k]),
        `${tag}: control a2 row seq${cr.seq}/${cr.mid} fight-shape identical`);
      continue;
    }
    const mr = fm[`${cr.seq}/${cr.mid}`];
    ok(!!mr, `${tag}: control unattr row seq${cr.seq}/${cr.mid} present in fixed run`);
    if (mr) {
      const same = ['day', 'result', 'nPerfs', 'midDead', 'midAlive', 'pAlive', 'cls'].every(k => mr[k] === cr[k]);
      ok(same, `${tag}: control unattr row seq${cr.seq}/${cr.mid} field-identical`);
    }
  }
  // No new unattr rows in the fixed run.
  const ck = new Set((cx.fights || []).map(r => `${r.seq}/${r.mid}`));
  for (const r of (fx.fights || [])) ok(ck.has(`${r.seq}/${r.mid}`), `${tag}: no new unattr row seq${r.seq}/${r.mid}`);
  // Every pyrrhicFixed row carries a trick-tagged waveKillLog entry.
  for (const pr of (fx.pyrrhicFixed || [])) {
    ok((pr.wklSame || []).some(e => e.trick), `${tag}: pyrrhicFixed seq${pr.seq}/${pr.mid} trick-tagged`);
  }
  // The 3 KNOWN cases (attrcensus re-sweep) must be attributed in the fixed run.
  const { KNOWN } = require('./sweep-pyrrhic-20261017.js');
  for (const k of KNOWN) {
    if (k.policy !== fx.policyId || k.seed !== fx.seed) continue;
    const pr = pfm[`${k.seq}/${k.mid}`];
    ok(!!pr && (pr.wklSame || []).some(e => e.trick),
      `KNOWN CASE: ${k.policy}-s${k.seed} seq${k.seq} d${k.day} ${k.mid}/${k.kind} now attributed`);
    ok((fx.codexStages || {})[k.mid] === 'slain',
      `KNOWN CASE: ${k.policy}-s${k.seed} codex ${k.mid} stage slain (got ${JSON.stringify((fx.codexStages || {})[k.mid])})`);
    ok(((fx.villageSlain || {})[k.mid] | 0) >= 1,
      `KNOWN CASE: ${k.policy}-s${k.seed} villageSlain[${k.mid}] >= 1 (got ${(fx.villageSlain || {})[k.mid]})`);
  }
  for (const k of ['nPerf', 'nAttr', 'nUnattr', 'nPyrrhicUnattr']) { totFixed[k] += fx[k] || 0; totCtrl[k] += cx[k] || 0; }
  totFixed.pyrrhicFixed += (fx.pyrrhicFixed || []).length;
  for (const k of ['national', 'table', 'won']) { wallFixed[k] += fx[k]; wallCtrl[k] += cx[k]; }
}

console.log('\n== TOTALS (8 runs) ==');
console.log('fixed: ' + JSON.stringify(totFixed) + ' wall ' + JSON.stringify(wallFixed));
console.log('ctrl:  ' + JSON.stringify(totCtrl) + ' wall ' + JSON.stringify(wallCtrl));
ok(totFixed.nPyrrhicUnattr === 0, 'PRIMARY: 0 unattributed pyrrhic kills across the re-sweep');
ok(totFixed.pyrrhicFixed === 3, 'PRIMARY: all 3 known pyrrhic cases now attributed');
ok(wallFixed.national === wallCtrl.national && wallFixed.table === wallCtrl.table && wallFixed.won === wallCtrl.won,
  'GUARDRAIL: wall metrics within noise of control (identical here)');

console.log(`\ndet-gate: ${pass} pass, ${fail} fail`);
if (fail) { console.log('DIVERGENCES:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('DET-GATE PASS — fix is attribution-only on identical seeds.');
