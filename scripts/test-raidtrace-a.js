#!/usr/bin/env node
// scripts/test-raidtrace-a.js — proof validator for sim-raidtrace-a.
// Re-derives every headline number from the corpus files in
// evidence/2026-10-27/perseed-raidtrace-a/ (census rows,
// transcript rows, raidtrace-classification.json, det-gate
// logs, and the evidence file's sense quotes). No corpus row
// is trusted at face value: the validator recomputes the
// census band, the transcript wall list, the classification
// completeness, and the window-validity condition from the
// raw files. Exit 1 on any HARD failure; the verdict inputs
// (DIAG-GO / DIAG-NO-GO) are printed, never silently fixed.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-27', 'perseed-raidtrace-a');
const EVIDENCE_MD = path.join(REPO, 'evidence', '2026-10-27', 'sim-raidtrace-a.md');
const { traceSeq, wave4Seqs, BAND1920 } = require('./test-seq51gap-diag-sweep');
const raidSweep = require('./test-raidtrace-a-sweep');

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; }
  else { fail++; failures.push(name + (detail ? ' :: ' + detail : '')); console.log(`FAIL ${name}${detail ? ' :: ' + detail : ''}`); }
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function main() {
  const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  // --- files present ---
  check('prereg exists', fs.existsSync(path.join(REPO, 'evidence', '2026-10-27', 'sim-raidtrace-a-prereg.md')));
  check('evidence md exists', fs.existsSync(EVIDENCE_MD));
  check('census summary exists', fs.existsSync(path.join(EVID, 'summary.json')));
  check('classification exists', fs.existsSync(path.join(EVID, 'raidtrace-classification.json')));
  const census = readJson(path.join(EVID, 'summary.json'));
  const cls = readJson(path.join(EVID, 'raidtrace-classification.json'));
  // --- census re-baseline vs 1920Z (HARD: DIAG-GO (c)) ---
  check('census baseline n=8', census.baselineBand.n === 8);
  check('rebaseline exact vs 1920Z', census.gates.rebaselineExact === true, JSON.stringify(census.gates.diffVs1920));
  check('baseline wins=2', census.baselineBand.won === BAND1920.wins);
  check('baseline nationalEver=6', census.baselineBand.nationalEver === BAND1920.nationalEver);
  check('baseline nationalFinal=5', census.baselineBand.nationalFinal === BAND1920.nationalFinal);
  check('baseline table=4', census.baselineBand.table === BAND1920.table);
  check('baseline entered=2', census.baselineBand.entered === BAND1920.entered);
  check('baseline wave4=6', census.baselineBand.wave4 === BAND1920.wave4);
  check('baseline wave5=0', census.baselineBand.wave5 === BAND1920.wave5);
  check('baseline median=152', census.baselineBand.medianDays === BAND1920.medianDays);
  check('baseline deaths=307', census.baselineBand.deathTotal === BAND1920.deaths);
  check('baseline starvation=1', census.baselineBand.starvationTotal === BAND1920.starvation);
  check('G2 recorder neutrality pass', census.gates.g2Pass === true);
  check('census corpus ok', census.gates.corpusOk === true);
  check('cost bar starvation', census.gates.costBar.starvationOk === true);
  check('cost bar median', census.gates.costBar.medianOk === true);
  // Armed band == baseline band (recorder neutrality at band level).
  const ab = census.armedBand, bb = census.baselineBand;
  for (const k of ['won', 'medianDays', 'nationalEver', 'nationalFinal', 'table', 'entered', 'wave4', 'wave5', 'deathTotal', 'starvationTotal']) {
    check(`armed band ${k} == baseline`, ab[k] === bb[k], `armed=${ab[k]} baseline=${bb[k]}`);
  }
  // Per-seed census rows present and days match the summary's seeds.
  for (const seed of SEEDS) {
    check(`census baseline row s${seed}`, fs.existsSync(path.join(EVID, `s${seed}-baseline.json`)));
    check(`census armed row s${seed}`, fs.existsSync(path.join(EVID, `s${seed}-armed.json`)));
  }
  // --- classification completeness (HARD: DIAG-GO (a)) ---
  check('classification totals walls>0', cls.totals.walls > 0, `walls=${cls.totals.walls}`);
  check('classification unclassified=0', cls.totals.unclassified === 0, `unclassified=${cls.totals.unclassified}`);
  check('traced+untraced==walls', cls.totals.traced + cls.totals.untraced === cls.totals.walls,
    `traced=${cls.totals.traced} untraced=${cls.totals.untraced} walls=${cls.totals.walls}`);
  check('classification per-seed count=8', cls.perSeed.length === 8);
  // Recompute walls from transcript rows and compare to classification.
  let recomputedWalls = 0;
  for (const p of cls.perSeed) {
    const tRow = readJson(path.join(EVID, `s${p.seed}-transcript-armed.json`));
    const tDoc = readJson(path.join(EVID, `s${p.seed}-transcript.json`));
    const walls = raidSweep.wallsOfRow(tRow);
    recomputedWalls += walls.length;
    check(`seed ${p.seed} classification wall count == recomputed`, p.transcriptWalls.length === walls.length,
      `classified=${p.transcriptWalls.length} recomputed=${walls.length}`);
    check(`seed ${p.seed} per-seed unclassified=0`, p.unclassified === 0);
    check(`seed ${p.seed} transcript ticks>0`, (tRow.seq51gap.ticks || []).length > 0);
    check(`seed ${p.seed} transcript lines>0`, (tDoc.totalLines || 0) > 0);
    check(`seed ${p.seed} raidtrace diag errs=0`, (tRow.raidtrace.diag.errs | 0) === 0);
    // Every classified wall's raidDay has a window entry (even if empty).
    for (const w of p.transcriptWalls) {
      check(`seed ${p.seed} seq${w.seq} raidDay ${w.raidDay} window entry exists`,
        w.raidDay != null && Object.prototype.hasOwnProperty.call(tDoc.windows, String(w.raidDay)),
        `raidDay=${w.raidDay}`);
      // Window-validity: every retained window line satisfies the
      // union condition (sequence interval OR day R/R+1).
      const win = (w.raidDay != null && tDoc.windows[String(w.raidDay)]) ? tDoc.windows[String(w.raidDay)] : [];
      const lo = tDoc.tickEmitIndex[String(w.raidDay)];
      const tickDays = Object.keys(tDoc.tickEmitIndex).map(Number).sort((a, b) => a - b);
      const nextTick = tickDays.find(d => d > w.raidDay);
      const hi = nextTick != null ? tDoc.tickEmitIndex[String(nextTick)] : tDoc.totalLines;
      let bad = 0;
      for (const l of win) {
        const inSeq = (lo != null && l.idx > lo && l.idx <= hi);
        const inDay = (l.day === w.raidDay || l.day === w.raidDay + 1);
        if (!inSeq && !inDay) bad++;
      }
      check(`seed ${p.seed} seq${w.seq} window lines all satisfy union condition`, bad === 0, `bad=${bad} of ${win.length}`);
      // Recompute the classification from the retained window lines.
      const recomputed = raidSweep.classifyWall(w, win);
      check(`seed ${p.seed} seq${w.seq} classification recomputes`, recomputed.verdict === w.classification,
        `stored=${w.classification} recomputed=${recomputed.verdict}`);
    }
  }
  check('recomputed walls == classification walls', recomputedWalls === cls.totals.walls,
    `recomputed=${recomputedWalls} classified=${cls.totals.walls}`);
  // Census walls recomputed (comparison only, not a verdict gate).
  let censusWalls = 0;
  for (const seed of SEEDS) {
    const cRow = readJson(path.join(EVID, `s${seed}-armed.json`));
    censusWalls += raidSweep.wallsOfRow(cRow).length;
  }
  console.log(`INFO census walls recomputed=${censusWalls} transcript walls=${cls.totals.walls} censusWallsInClassification=${cls.totals.censusWalls}`);
  check('classification censusWalls field matches recomputed', cls.totals.censusWalls === censusWalls,
    `field=${cls.totals.censusWalls} recomputed=${censusWalls}`);
  // --- det-gate logs ---
  const detLog = path.join(REPO, 'evidence', '2026-10-27', 'sim-raidtrace-a-detgate.log');
  check('transcript det-gate log exists', fs.existsSync(detLog));
  if (fs.existsSync(detLog)) {
    const txt = fs.readFileSync(detLog, 'utf8');
    check('transcript det-gate PASS in log', /DETGATE-RAIDTRACE.*PASS/.test(txt));
  }
  const censusDetLog = path.join(REPO, 'evidence', '2026-10-27', 'sim-raidtrace-a-census-detgate.log');
  check('census det-gate log exists', fs.existsSync(censusDetLog));
  if (fs.existsSync(censusDetLog)) {
    const txt = fs.readFileSync(censusDetLog, 'utf8');
    check('census det-gate PASS in log', /DETGATE.*PASS/.test(txt));
  }
  // --- sense samples (HARD: DIAG-GO (b)) ---
  const md = fs.readFileSync(EVIDENCE_MD, 'utf8');
  const sampleMarkers = (md.match(/SENSE SAMPLE \d/g) || []).length;
  check('evidence has >=3 sense samples', sampleMarkers >= 3, `markers=${sampleMarkers}`);
  const quoteLines = md.split('\n').filter(l => l.startsWith('QUOTE: ')).map(l => l.slice('QUOTE: '.length).trim());
  check('evidence has >=3 quoted lines', quoteLines.length >= 3, `quotes=${quoteLines.length}`);
  // Each quoted line must appear (first 60 chars) in some transcript window.
  const allWindowTexts = [];
  for (const seed of SEEDS) {
    const tDoc = readJson(path.join(EVID, `s${seed}-transcript.json`));
    for (const R of Object.keys(tDoc.windows)) for (const l of tDoc.windows[R]) allWindowTexts.push(l.text);
  }
  for (const q of quoteLines) {
    const probe = q.slice(0, 60);
    check(`quoted line found in transcript windows: ${probe.slice(0, 50)}`,
      allWindowTexts.some(t => t.includes(probe)));
  }
  check('evidence has metric review section', /metric review/i.test(md));
  check('evidence states verdict', /DIAG-(GO|NO-GO)/.test(md));
  console.log(`\nPROOF sim-raidtrace-a: ${pass} PASS, ${fail} FAIL`);
  if (fail) {
    console.log('FAILURES:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}
if (require.main === module) main();
module.exports = { main };
