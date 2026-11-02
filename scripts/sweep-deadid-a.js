#!/usr/bin/env node
// sweep-deadid-a.js — band runner + det-gate diff for sim-deadid-a.
// Modes:
//   --run <baseline|postfix> --band <pilot|confirm> --seeds <csv>
//       Spawns the deadid driver once per seed (separate processes;
//       never two harnesses in one process), collects the per-seed
//       summary lines, writes evidence/2026-11-02/deadid-band-<side>-<band>.json.
//   --diff --band <pilot|confirm>
//       Compares baseline vs postfix per-seed JSONs on the det-gate
//       fields (death days/names, endReason, survival days,
//       application/arrival counts). Writes
//       evidence/2026-11-02/deadid-detgate-<band>.json and prints the
//       verdict lines. A seed may differ ONLY if baseline drew or
//       walked a dead id there, and only with an identical death
//       prefix before that seed's first dead-draw day.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   node scripts/sweep-deadid-a.js --run baseline --band pilot --seeds 97330,97338
//   node scripts/sweep-deadid-a.js --diff --band pilot
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const EV = path.join(REPO, 'evidence', '2026-11-02', 'perseed-deadid-a');

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
}
function flag(name) { return process.argv.indexOf('--' + name) >= 0; }

function runBand(side, band, seeds) {
  const summaries = [];
  for (const seed of seeds) {
    console.log(`--- deadid ${band}/${side} seed ${seed} ---`);
    const env = Object.assign({}, process.env, { SEEDS: String(seed), RUN: side, DAYS: '180' });
    const out = execFileSync(process.execPath,
      [path.join(REPO, 'scripts', 'deadid-driver-20261102.js')],
      { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const lines = out.split('\n').filter(function (l) { return l.trim().startsWith('{'); });
    lines.forEach(function (l) { console.log(l); try { summaries.push(JSON.parse(l)); } catch (e) {} });
  }
  const file = path.join(REPO, 'evidence', '2026-11-02', `deadid-band-${side}-${band}.json`);
  fs.writeFileSync(file, JSON.stringify({ side: side, band: band, seeds: seeds, summaries: summaries }, null, 2) + '\n');
  console.log('band summary: ' + path.relative(REPO, file));
  const totals = summaries.reduce(function (t, s) {
    t.applications += s.applicationsTotal || 0;
    t.walked += s.arrivalsWalked || 0;
    t.refused += s.arrivalsRefused || 0;
    t.deadDraws += (s.deadDraws || []).length;
    t.deadWalked += (s.deadWalked || []).length;
    t.reappearances += (s.reappearances || []).length;
    return t;
  }, { applications: 0, walked: 0, refused: 0, deadDraws: 0, deadWalked: 0, reappearances: 0 });
  console.log('band totals: ' + JSON.stringify(totals));
}

function deathSig(rec) {
  return (rec.deaths || []).map(function (d) { return d.day + ':' + d.oldName + '->' + d.chosenName; }).join('|');
}
function diffBand(band) {
  // Seeds present on either side.
  const files = fs.existsSync(EV) ? fs.readdirSync(EV) : [];
  const seeds = [];
  files.forEach(function (f) {
    const m = f.match(/^dd-s(\d+)-(baseline|postfix)\.json$/);
    if (m && seeds.indexOf(m[1]) < 0) seeds.push(m[1]);
  });
  seeds.sort(function (a, b) { return Number(a) - Number(b); });
  const rows = [];
  let unexplained = 0;
  seeds.forEach(function (seed) {
    const bf = path.join(EV, `dd-s${seed}-baseline.json`);
    const pf = path.join(EV, `dd-s${seed}-postfix.json`);
    if (!fs.existsSync(bf) || !fs.existsSync(pf)) {
      rows.push({ seed: Number(seed), status: 'missing-side' });
      return;
    }
    const b = JSON.parse(fs.readFileSync(bf, 'utf8'));
    const p = JSON.parse(fs.readFileSync(pf, 'utf8'));
    const identical = deathSig(b) === deathSig(p) && b.endReason === p.endReason &&
      b.gameDays === p.gameDays && b.applicationsTotal === p.applicationsTotal &&
      b.arrivalsWalked === p.arrivalsWalked;
    if (identical) { rows.push({ seed: Number(seed), status: 'identical' }); return; }
    const deadDrawDays = (b.deadDraws || []).map(function (d) { return d.day; })
      .concat((b.deadWalked || []).map(function (a) { return a.day; }));
    const firstDead = deadDrawDays.length ? Math.min.apply(null, deadDrawDays) : null;
    const reapp = (b.reappearances || []).length > 0;
    let prefixIdentical = null;
    if (firstDead != null) {
      const bPre = (b.deaths || []).filter(function (d) { return d.day < firstDead; })
        .map(function (d) { return d.day + ':' + d.oldName + '->' + d.chosenName; }).join('|');
      const pPre = (p.deaths || []).filter(function (d) { return d.day < firstDead; })
        .map(function (d) { return d.day + ':' + d.oldName + '->' + d.chosenName; }).join('|');
      prefixIdentical = (bPre === pPre);
    }
    const status = (firstDead != null || reapp) && prefixIdentical !== false ? 'differs-dead-draw' : 'differs-UNEXPLAINED';
    if (status === 'differs-UNEXPLAINED') unexplained++;
    rows.push({ seed: Number(seed), status: status, firstDeadDay: firstDead,
      baselineReappearances: (b.reappearances || []).length, postfixReappearances: (p.reappearances || []).length,
      baselineDeadDraws: (b.deadDraws || []).length, postfixDeadDraws: (p.draws || []).filter(function (d) { return d.deadAtDraw; }).length,
      baselineDeadWalked: (b.deadWalked || []).length, postfixDeadWalked: (p.deadWalked || []).length,
      prefixDeathsIdentical: prefixIdentical,
      baseline: { deathSig: deathSig(b), endReason: b.endReason, gameDays: b.gameDays, applications: b.applicationsTotal, walked: b.arrivalsWalked },
      postfix: { deathSig: deathSig(p), endReason: p.endReason, gameDays: p.gameDays, applications: p.applicationsTotal, walked: p.arrivalsWalked } });
  });
  const out = { band: band, rows: rows, unexplained: unexplained };
  const file = path.join(REPO, 'evidence', '2026-11-02', `deadid-detgate-${band}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  rows.forEach(function (r) { console.log(JSON.stringify(r)); });
  console.log('det-gate: ' + path.relative(REPO, file) + ' unexplained=' + unexplained);
  if (unexplained) process.exitCode = 1;
}

(function main() {
  if (flag('diff')) { diffBand(arg('band', 'pilot')); return; }
  const side = arg('run', null);
  const band = arg('band', null);
  const seeds = (arg('seeds', '') || '').split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
  if (!side || !band || !seeds.length) {
    console.error('Usage: sweep-deadid-a.js --run <baseline|postfix> --band <name> --seeds <csv>  OR  --diff --band <name>');
    process.exit(2);
  }
  runBand(side, band, seeds);
})();
