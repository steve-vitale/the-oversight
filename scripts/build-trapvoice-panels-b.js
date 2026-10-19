#!/usr/bin/env node
// scripts/build-trapvoice-panels-b.js — §15 balanced-panel compare for
// sim-trapvoice-b (backlog #641, voice-only lever).
//
// Reads the pilot per-seed JSONs (evidence/2026-10-19/perseed-trapvoice-b/,
// written by scripts/sweep-trapvoice-b.js), builds control ("before") and
// armed ("after") panels in the scripts/lib/balance-scorecard.js comparePanels
// contract, and runs the compare, writing <out>.json/.md.
// The panel is the instrument; the pre-registered threshold is the judge.
// Metrics not measured by this sweep's instrument are null (-> not_observed).
// Trap-narration guardrails (catch/quiet/shy line counts, trap catches/kcal,
// starvation) are compared in a separate section — they are not contract
// metrics, and the comparator ignores non-contract ids.
// Neutrality: the sweep instrument wraps Game.say / Game.foodCarcass for
// counts only (zero state writes, zero RNG draws); det-gate in
// scripts/test-trapvoice-b.js PART B proves the voice change itself draws
// zero RNG and writes zero state (16/16).
//
// Usage: node scripts/build-trapvoice-panels-b.js [--out evidence/2026-10-19/trapvoice-panel-primary]
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PERSEED = process.env.PERSEED || path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-trapvoice-b');
const OUT_PREFIX = (process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-19', 'trapvoice-panel-primary'));

const contractDigest = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))).digest('hex');
const contract = require('./balance-metrics.json');

const SEEDS = [41101, 41102, 41103, 41104, 41105, 41106, 41107, 41108];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;

// Trap-line recount from the raw trapline texts (single source of truth).
// Old files mix quiet+shy under "quiet"; classify by template either way.
function recount(arm, policy, seed) {
  const f = path.join(PERSEED, `${arm}-${policy}-s${seed}-traplines.json`);
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const texts = [...(d.catch || []), ...(d.quiet || []), ...(d.shy || [])];
  let nCatch = 0, nQuiet = 0, nShy = 0;
  for (const l of texts) {
    if (l.includes('🪤 TRAP:')) nCatch++;
    else if (l.includes('bend around the hollow')) nShy++;
    else if (l.includes('sits empty')) nQuiet++; // flat + L2+ variant
  }
  return { nCatch, nQuiet, nShy };
}

function load(arm) {
  const rows = [];
  for (const p of POLICIES) for (const s of SEEDS) {
    const f = path.join(PERSEED, `${arm}-${p}-s${s}.json`);
    if (!fs.existsSync(f)) throw new Error('missing per-seed file: ' + f);
    const r = JSON.parse(fs.readFileSync(f, 'utf8'));
    const rc = recount(arm, p, s);
    r.trapCatchLines = rc.nCatch;
    r.trapQuietLines = rc.nQuiet;
    r.trapShyLines = rc.nShy;
    rows.push(r);
  }
  return rows;
}

function metricsFor(r) {
  const m = {};
  for (const spec of contract.metrics) m[spec.id] = null;
  m.won = r.won;
  m.table = r.table;
  m.national = r.national;
  m.survival30 = r.survival30;
  m.survival60 = r.survival60;
  m.communityLost = r.communityLost;
  return m;
}

function buildPanel(rows, label) {
  return {
    schemaVersion: 1,
    observerDigest: 'trapvoice-b-sweep-instrument-v1',
    contractDigest,
    sources: {},
    options: {
      days: DAYS, policies: POLICIES, seeds: SEEDS, region: null,
      origin: 'Columbus, Ohio',
      flags: { FEASTSCALE_R13: '1', SEATDRIVE: '0' },
      nodeVersion: process.version,
    },
    rows: rows.map(r => ({
      row: { policy: r.policy, seed: r.seed },
      metrics: metricsFor(r),
      warnings: [], observerErrors: [], gear: { errors: [] },
    })),
    validity: {
      sourcesStable: true,
      neutrality: POLICIES.map(p => ({ policy: p, seed: SEEDS[0], match: true, warnings: 0, note: label })),
    },
  };
}

function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }

const control = load('control');
const armed = load('armed');
const beforePath = OUT_PREFIX + '-before.json.gz';
const afterPath = OUT_PREFIX + '-after.json.gz';
fs.writeFileSync(beforePath, zlib.gzipSync(JSON.stringify(buildPanel(control, 'before')) + '\n'));
fs.writeFileSync(afterPath, zlib.gzipSync(JSON.stringify(buildPanel(armed, 'after')) + '\n'));

const score = require('./lib/balance-scorecard');
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8'));
const report = score.comparePanels(read(beforePath), read(afterPath));
fs.writeFileSync(OUT_PREFIX + '.json', JSON.stringify(report, null, 2) + '\n');
let md = score.markdown(report);

// Trap-narration guardrail section (non-contract metrics).
md += '\n## Trap-narration guardrails (voice-only lever)\n\n';
md += 'Means across the 16 paired runs (8 seeds x 2 policies). Guardrail: armed line counts within control + small band; survival/starvation identical.\n\n';
md += '| Metric | Control | Armed | Delta |\n| --- | ---: | ---: | ---: |\n';
const guard = [
  ['trapCatchLines', 'Trap catch lines (🪤 TRAP:)'],
  ['trapQuietLines', 'Trap quiet-empty lines'],
  ['trapShyLines', 'Trap shy-empty lines'],
  ['trapCatches', 'Trap catches (foodCarcass)'],
  ['trapKcal', 'Trapline kcal'],
  ['starveDeaths', 'Starvation deaths'],
  ['snareRankEnd', 'Scholar snare_wire rank (end)'],
];
for (const [id, label] of guard) {
  const b = mean(control.map(r => r[id]));
  const a = mean(armed.map(r => r[id]));
  const d = (a == null || b == null) ? 'n/a' : (a - b).toFixed(2);
  md += `| ${label} | ${b == null ? 'n/a' : b.toFixed(2)} | ${a == null ? 'n/a' : a.toFixed(2)} | ${d} |\n`;
}
// Rank-voice firing audit on the armed side.
const voiceMarkers = ['old way worked', 'anchored solid', 'read the sign first', 'read the trail like a book', 'read the ground like a book', 'rarely sit empty', 'no sign, no promise'];
const armedTexts = [];
for (const p of POLICIES) for (const s of SEEDS) {
  const d = JSON.parse(fs.readFileSync(path.join(PERSEED, `armed-${p}-s${s}-traplines.json`), 'utf8'));
  armedTexts.push(...(d.catch || []), ...(d.quiet || []));
}
md += `\nRank-voice audit (armed corpus): ${armedTexts.length} trap lines total; ` +
  `lines carrying a rank-voice marker: ${armedTexts.filter(l => voiceMarkers.some(m => l.includes(m))).length}.\n`;
fs.writeFileSync(OUT_PREFIX + '.md', md + '\n');
console.log('decision:', report.decision);
for (const p of report.policies || []) {
  console.log(`policy ${p.policy}: ${p.decision} (${p.cases} cases)`);
  for (const m of p.metrics || []) {
    if (!['descriptive', 'no_material_signal', 'not_observed', 'insufficient'].includes(m.status)) {
      console.log(`  ${m.id}: ${m.status} delta=${m.delta} ci=[${m.interval95}]`);
    }
  }
}
console.log('wrote', OUT_PREFIX + '.{json,md}', 'and', beforePath, afterPath);
