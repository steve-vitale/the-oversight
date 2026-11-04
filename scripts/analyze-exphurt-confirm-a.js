'use strict';
// analyze-exphurt-confirm-a.js — pooled EXPHURT confirm tables + quoted
// return lines for sim-exphurt-confirm-a. Reads the per-seed JSONs
// written by scripts/sweep-exphurt-confirm-a.js.
// Usage: node scripts/analyze-exphurt-confirm-a.js [perseed-dir]
const fs = require('fs');
const path = require('path');
const exlib = require('./exphurt-a-lib');
const clib = require('./exphurt-confirm-a-lib');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-exphurt-confirm-a');
const files = fs.readdirSync(DIR).filter((f) => /^exphurt-confirm-a-competent-s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no per-seed files in ' + DIR); process.exit(2); }
const seeds = [];
let allCases = [];
let errors = 0, hurtLines = 0, retro = 0, days = [];
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  seeds.push({ seed: s.seed, daysAlive: s.daysAlive, endReason: s.endReason, rank: s.rank, maxWave: s.maxWave, win: s.win, cases: s.caseCount, errors: (s.errors || []).length });
  errors += (s.errors || []).length;
  hurtLines += s.hurtReturnLineCount || 0;
  retro += s.retroOpened || 0;
  days.push(s.daysAlive);
  for (const c of (s.cases || [])) allCases.push(Object.assign({ seed: s.seed }, c));
}
const S = exlib.summarize(allCases);
const SL = clib.summarizeLastHurt(allCases);
const MA = clib.m1All(allCases);
const outcomes = {};
for (const c of allCases) outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1;
const purposes = {};
for (const c of allCases) purposes[c.purpose] = (purposes[c.purpose] || 0) + 1;
const unclassified = allCases.filter((c) => !c.outcome).length;
const sortedDays = [...days].sort((a, b) => a - b);
const medianDays = sortedDays.length ? sortedDays[Math.floor(sortedDays.length / 2)] : null;
console.log(`seeds: ${files.length} (${seeds.map((s) => s.seed).join(',')})`);
console.log(`per-seed: ${seeds.map((s) => `${s.seed}:d${s.daysAlive}/${s.endReason}/w${s.maxWave}/cases${s.cases}/err${s.errors}`).join(' ')}`);
console.log(`median daysAlive: ${medianDays} (sorted: ${sortedDays.join(',')})`);
console.log(`instrument errors total: ${errors}; unclassified cases: ${unclassified}; hurt-return lines: ${hurtLines}; retro-opened: ${retro}`);
console.log(`all cases: ${allCases.length}; by purpose: ${JSON.stringify(purposes)}; by outcome: ${JSON.stringify(outcomes)}`);
console.log(`D-open: disconnected ${S.disconnected}/${S.disconnectDenom} = ${S.D == null ? 'n/a' : S.D.toFixed(3)}; expedShorter ${S.expedShorter}/${S.disconnectDenom} = ${S.expedShorterShare == null ? 'n/a' : S.expedShorterShare.toFixed(3)}; median signed gap ${S.medianGap}`);
console.log(`D-last: disconnected ${SL.disconnectedLastHurt}/${SL.disconnectDenomLastHurt} = ${SL.DLast == null ? 'n/a' : SL.DLast.toFixed(3)}; expedShorter ${SL.expedShorterLastHurt}/${SL.disconnectDenomLastHurt} = ${SL.expedShorterShareLastHurt == null ? 'n/a' : SL.expedShorterShareLastHurt.toFixed(3)}; median signed gap ${SL.medianGapLastHurt}`);
console.log(`M1: expedition line mentions hurt ${S.rhExpeditionLineMentionsHurt}/${S.rhWithExpeditionLine} = ${S.M1 == null ? 'n/a' : S.M1.toFixed(3)}`);
console.log(`M1-all: expedition line mentions hurt over ALL returned-hurt ${MA.rhExpeditionLineMentionsHurtAll}/${MA.returnedHurtExpedition} = ${MA.M1All == null ? 'n/a' : MA.M1All.toFixed(3)}`);
console.log(`M2: any closing line mentions hurt ${S.rhAnyLineMentionsHurt}/${S.returnedHurtExpedition} = ${S.M2 == null ? 'n/a' : S.M2.toFixed(3)}`);
console.log(`M3: announced at all ${S.rhAnnounced}/${S.returnedHurtExpedition} = ${S.M3 == null ? 'n/a' : S.M3.toFixed(3)}`);
console.log('\n== DISCONNECTED (LAST-HURT) EXPEDITION CASES (gap >= 2) ==');
for (const c of allCases.filter((c) => c.purpose === 'expedition' && clib.disconnectOfLastHurt(c.expedDurationAtLastHurt, c.awayDuration).disconnected)) {
  const d = clib.disconnectOfLastHurt(c.expedDurationAtLastHurt, c.awayDuration);
  const dO = exlib.disconnectOf(c.expedDurationAtOpen, c.awayDuration);
  console.log(`s${c.seed} ${c.name || c.vid} outcome=${c.outcome} expedOpen=${c.expedDurationAtOpen} expedLast=${c.expedDurationAtLastHurt} away=${c.awayDuration} gapLast=${d.gap} gapOpen=${dO.gap == null ? '?' : dO.gap} legsLast=${c.expedLegsAtLastHurt} encountersHurt=${c.expedEncountersHurtAtLastHurt} hpAtEvent=${c.hpAtEvent} latency=${c.latencyParts}`);
}
console.log('\n== RETURNED-HURT EXPEDITION CASES + CLOSING LINES ==');
for (const c of allCases.filter((c) => c.purpose === 'expedition' && c.outcome === 'returned-hurt')) {
  const d = clib.disconnectOfLastHurt(c.expedDurationAtLastHurt, c.awayDuration);
  console.log(`s${c.seed} ${c.name || c.vid} expedOpen=${c.expedDurationAtOpen} expedLast=${c.expedDurationAtLastHurt} away=${c.awayDuration} gapLast=${d.gap == null ? '?' : d.gap} playerAtHaven=${c.playerAtHavenAtClose} lines=${(c.closingLines || []).length}`);
  for (const l of (c.closingLines || [])) console.log(`    [exp=${l.isExpeditionReturn} hurt-line=${l.isHurthome} mentionsHurt=${l.mentionsHurt}] ${l.line}`);
  if (!(c.closingLines || []).length) console.log('    (no closing-part return line captured — silent return)');
}
console.log('\n== WALK-OUT (leave) CASES, SEPARATE POPULATION ==');
for (const c of allCases.filter((c) => c.purpose === 'leave')) {
  console.log(`s${c.seed} ${c.name || c.vid} outcome=${c.outcome} away=${c.awayDuration} hpAtEvent=${c.hpAtEvent}`);
}
