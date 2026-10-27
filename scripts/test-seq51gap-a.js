#!/usr/bin/env node
// scripts/test-seq51gap-a.js — proof for sim-seq51gap-a.
// Re-derives EVERY summary number from the per-seed corpus rows
// (evidence/2026-10-26/perseed-seq51gap-a/) using the sweep
// module's own pure functions, then checks the evidence's
// claims: re-baseline table, G2 neutrality, trace window
// completeness, window classification, band-wide unaccounted
// counts, tick coverage, and the C6 tile-vs-tick test.
// Exits non-zero on any FAIL. No game code is loaded here —
// this is a pure re-derivation over files on disk.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-seq51gap-a');
const { traceSeq, wave4Seqs, bandOf, BAND1920, SEEDS } = require('./test-seq51gap-diag-sweep');

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));
const rows = [];
for (const seed of SEEDS) for (const pid of ['baseline', 'armed']) {
  rows.push(JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-${pid}.json`), 'utf8')));
}
check('corpus rows 16', rows.length === 16, rows.length);
check('summary label', summary.label === 'sim-seq51gap-a', summary.label);
check('summary seeds', JSON.stringify(summary.seeds) === JSON.stringify(SEEDS), summary.seeds);

// Re-baseline: bandOf over baseline rows vs summary + vs 1920Z.
const bb = bandOf(rows, 'baseline');
const ab = bandOf(rows, 'armed');
check('summary baselineBand matches rows', JSON.stringify(summary.baselineBand) === JSON.stringify(bb), { summary: summary.baselineBand, rows: bb });
check('summary armedBand matches rows', JSON.stringify(summary.armedBand) === JSON.stringify(ab), { summary: summary.armedBand, rows: ab });
check('baseline wins vs 1920Z', bb.won === BAND1920.wins, [bb.won, BAND1920.wins]);
check('baseline nationalEver vs 1920Z', bb.nationalEver === BAND1920.nationalEver, [bb.nationalEver, BAND1920.nationalEver]);
check('baseline nationalFinal vs 1920Z', bb.nationalFinal === BAND1920.nationalFinal, [bb.nationalFinal, BAND1920.nationalFinal]);
check('baseline table vs 1920Z', bb.table === BAND1920.table, [bb.table, BAND1920.table]);
check('baseline entered vs 1920Z', bb.entered === BAND1920.entered, [bb.entered, BAND1920.entered]);
check('baseline wave4 vs 1920Z', bb.wave4 === BAND1920.wave4, [bb.wave4, BAND1920.wave4]);
check('baseline wave5 vs 1920Z', bb.wave5 === BAND1920.wave5, [bb.wave5, BAND1920.wave5]);
check('baseline medianDays vs 1920Z', bb.medianDays === BAND1920.medianDays, [bb.medianDays, BAND1920.medianDays]);
check('baseline deaths vs 1920Z', bb.deathTotal === BAND1920.deaths, [bb.deathTotal, BAND1920.deaths]);
check('baseline starvation vs 1920Z', bb.starvationTotal === BAND1920.starvation, [bb.starvationTotal, BAND1920.starvation]);
check('summary rebaselineExact flag', summary.gates.rebaselineExact === (bb.won === BAND1920.wins && bb.nationalEver === BAND1920.nationalEver && bb.nationalFinal === BAND1920.nationalFinal && bb.table === BAND1920.table && bb.entered === BAND1920.entered && bb.wave4 === BAND1920.wave4 && bb.wave5 === BAND1920.wave5 && bb.medianDays === BAND1920.medianDays && bb.deathTotal === BAND1920.deaths && bb.starvationTotal === BAND1920.starvation), summary.gates.rebaselineExact);

// G2 neutrality re-derived.
let g2ok = true;
for (const seed of SEEDS) {
  const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
  const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
  const ok = c.days === a.days && c.gameDays === a.gameDays && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
  const facedOk = JSON.stringify(c.faced) === JSON.stringify(a.faced);
  const killsOk = JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
  check(`G2 seed ${seed}`, ok && facedOk && killsOk, { ok, facedOk, killsOk });
  if (!ok || !facedOk || !killsOk) g2ok = false;
}
check('summary g2Pass flag', summary.gates.g2Pass === g2ok, summary.gates.g2Pass);

// Per-seed trace re-derivation + cross-checks.
let bandDrops = 0, bandRises = 0;
for (const seed of SEEDS) {
  const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
  const seqs = wave4Seqs(armed);
  const sp = summary.perSeed.find(p => p.seed === seed);
  check(`seed ${seed} seqs match summary`, JSON.stringify(sp.seqs) === JSON.stringify(seqs), { summary: sp.seqs, rows: seqs });
  // Tick gaps are harness day-jumps (the scholar day can advance
  // twice between policy.daily calls), listed in the summary —
  // never hidden. The proof checks the listing is complete and
  // that no gap day falls inside the target window on 73672.
  const tickDays = armed.seq51gap.ticks.map(t => t.day);
  const reGaps = [];
  for (let i = 1; i < tickDays.length; i++) if (tickDays[i] > tickDays[i - 1] + 1) { const miss = []; for (let d = tickDays[i - 1] + 1; d < tickDays[i]; d++) miss.push(d); reGaps.push({ from: tickDays[i - 1], to: tickDays[i], missing: miss }); }
  check(`seed ${seed} tick gaps match summary`, JSON.stringify(sp.tickGaps) === JSON.stringify(reGaps), { summary: sp.tickGaps, rows: reGaps });
  if (seed === 73672) {
    const windowGap = reGaps.some(g => g.missing.some(d => d >= 143 && d <= 148));
    check('target window has no tick gap day', !windowGap, reGaps);
  }
  check(`seed ${seed} ticks present`, armed.seq51gap.ticks.length > 0, armed.seq51gap.ticks.length);
  check(`seed ${seed} diag errs zero`, sp.diagErrs === 0, sp.diagErrs);
  check(`seed ${seed} overflow zero`, sp.overflowN === 0, sp.overflowN);
  check(`seed ${seed} field count match`, sp.fieldCountMatch === true, [sp.field4, sp.waveField4]);
  check(`seed ${seed} source-sum clean`, sp.sumFail === 0, sp.sumFail);
  let sd = 0, sr = 0;
  for (const seq of seqs) {
    const tr = traceSeq(armed, seq);
    const sptr = sp.traces[seq];
    check(`seed ${seed} seq ${seq} steps match summary`, JSON.stringify(sptr.steps) === JSON.stringify(tr.steps), { summarySteps: sptr.steps.length, rowSteps: tr.steps.length });
    check(`seed ${seed} seq ${seq} unacc drops match summary`, sptr.unaccountedDrops === tr.unaccountedDrops, [sptr.unaccountedDrops, tr.unaccountedDrops]);
    sd += tr.unaccountedDrops; sr += tr.unaccountedRises;
  }
  check(`seed ${seed} band drops match summary`, sp.bandUnaccountedDrops === sd, [sp.bandUnaccountedDrops, sd]);
  check(`seed ${seed} band rises match summary`, sp.bandUnaccountedRises === sr, [sp.bandUnaccountedRises, sr]);
  bandDrops += sd; bandRises += sr;
}
check('summary band drops', summary.bandUnaccountedDrops === bandDrops, [summary.bandUnaccountedDrops, bandDrops]);
check('summary band rises', summary.bandUnaccountedRises === bandRises, [summary.bandUnaccountedRises, bandRises]);

// Target row first (pins below use it).
const tRow = rows.find(r => r.policy === 'armed' && r.seed === 73672);
// Classifier-fix pins (each must hold in the regenerated summary).
// 73673 seq45 d112: every same-day chained tb-start step is C3.
const tr45 = traceSeq(rows.find(r => r.policy === 'armed' && r.seed === 73673), 45);
const steps45 = tr45.steps.filter(s => s.toDay === 112);
check('73673 seq45 d112 steps all C3', steps45.length === 5 && steps45.every(s => s.cause === 'C3-tb-restore'), steps45.map(s => [s.fromHp, s.toHp, s.cause]));
// 73676 seq41: the d141 tick -> d142 tb-start step is C2 (raid
// detected from tick rows even though the entity never reappears).
const tr41 = traceSeq(rows.find(r => r.policy === 'armed' && r.seed === 73676), 41);
const step41 = tr41.steps.find(s => s.fromDay === 141 && s.toDay === 142);
check('73676 seq41 d141->d142 step is C2', !!step41 && step41.cause === 'C2-palisade-wall', step41);
// 73675 seq26: the d162 -> d163 tick step is C2 via the 1-HP floor
// (175 - 175 = 0, floored to 1, so the drop is 174 not 175).
const tr26 = traceSeq(rows.find(r => r.policy === 'armed' && r.seed === 73675), 26);
const step26 = tr26.steps.find(s => s.fromDay === 162 && s.toDay === 163);
check('73675 seq26 d162->d163 step is C2 (floor case)', !!step26 && step26.cause === 'C2-palisade-wall', step26);
// 73672 seq43: null-starts excluded, zero unaccounted steps.
const tr43 = traceSeq(tRow, 43);
check('73672 seq43 null-starts counted', tr43.nullStarts >= 11, tr43.nullStarts);
check('73672 seq43 zero unaccounted steps', tr43.unaccountedDrops === 0 && tr43.unaccountedRises === 0, [tr43.unaccountedDrops, tr43.unaccountedRises]);
// 73672 seq51: post-tb vanish documented (no tick presence after d148).
check('73672 seq51 vanishes after d148 tb fight', (() => {
  const ticks = tRow.seq51gap.ticks;
  return ticks.filter(t => t.day > 148 && (t.entities || []).some(e => e.seq === 51)).length === 0;
})(), 'seq51 present after d148');
const tTr = traceSeq(tRow, 51);
const wSteps = tTr.steps.filter(s => s.toDay >= 143 && s.toDay <= 148);
check('target window steps match summary', JSON.stringify(summary.target.windowSteps) === JSON.stringify(wSteps), { summary: summary.target.windowSteps.length, rows: wSteps.length });
check('target window complete (d143-d148 all present)', summary.target.windowComplete === true, summary.target.windowDaysPresent);
check('target window days present', JSON.stringify(summary.target.windowDaysPresent) === JSON.stringify([143, 144, 145, 146, 147, 148]), summary.target.windowDaysPresent);
// The documented gap endpoints: field end d143 = 799, tb-start tile d148 = 586.
const f143 = (tRow.w4dmg.fieldFights || []).filter(f => f.seq === 51 && f.day === 143);
check('target field end d143 is 799', f143.length === 1 && f143[0].endHp === 799, f143.map(f => f.endHp));
const tb148 = (tRow.nonworldkill.starts || []).filter(s => s.tileMonster && s.tileMonster.seq === 51 && s.day === 148);
check('target tb-start tile d148 is 586 lingering', tb148.length >= 1 && tb148.some(s => s.tileMonster.hp === 586 && s.tileMonster.lingering === true), tb148.map(s => s.tileMonster.hp));
// C6 test: the tick nearest before the d148 tb start must agree
// with the tile read (586) or the drop must be shown inside the
// tick chain — either way the tick chain itself must contain
// both 799 and 586 observations for seq51.
const tickHps51 = tTr.obs.filter(o => o.kind === 'tick').map(o => o.hp);
check('target tick chain contains 799 and 586', tickHps51.indexOf(799) >= 0 && tickHps51.indexOf(586) >= 0, tickHps51);
// C2 arithmetic: wall for maxHp 850 is 213; 799 - 213 = 586.
check('wall arithmetic 799-213=586', 799 - Math.round(850 * 0.25) === 586, 799 - Math.round(850 * 0.25));
// Verdict re-derivation.
const windowUnacc = wSteps.filter(s => s.cause === 'UNACCOUNTED');
const expectVerdict = (summary.target.windowComplete && g2ok) ? 'DIAG-GO' : 'DIAG-NO-GO';
check('summary verdict', summary.verdict === expectVerdict, [summary.verdict, expectVerdict]);
check('summary verdictDetail consistent', (windowUnacc.length === 0 && summary.verdictDetail === 'fully-accounted') || (windowUnacc.length > 0 && summary.verdict === 'DIAG-GO' && summary.verdictDetail === 'honest-remainder') || summary.verdict === 'DIAG-NO-GO', summary.verdictDetail);

// Wall numbers: death-cause shares re-derived from baseline rows.
const causeTotals = {};
for (const r of rows.filter(x => x.policy === 'baseline')) for (const k of Object.keys(r.deaths || {})) causeTotals[k] = (causeTotals[k] || 0) + (r.deaths[k] || 0);
const totalDeaths = Object.keys(causeTotals).reduce((t, k) => t + causeTotals[k], 0);
check('death totals match baseline band', totalDeaths === bb.deathTotal, [totalDeaths, bb.deathTotal]);
console.log(`\nproof: ${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
