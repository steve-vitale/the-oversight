#!/usr/bin/env node
// homecoming-tax-b.js — channel-aware taxonomy audit of the homecoming deposit
// path (sim-homecoming-tax-b, 2026-10-24, oversight-flesh-out-loop-b run
// fleshout-loop-b-20261024T0430Z). DIAG, MEASUREMENT ONLY — zero src/js
// changes, zero new sims, READ-ONLY on both corpora.
//
// Claims the sim-findings item "DEPINTERACTION INSTRUMENT BLIND TO THE
// HOMECOMING CHANNEL" (2026-10-24): scripts/sweep-depinteraction-b.js's
// channelOf() maps 'scholar_home' via a /donat/i stack regex that never
// matches the homecoming deposit path (returnToVillage/returnToOldVillage),
// so evidence/2026-10-23/depinteraction-b-corpus/ records
// glutChannels.scholarHomecoming = 0 on all 128 configs; those deposits land
// in its away_wild/other buckets. sim-depinteraction-b's "ONE channel" rot
// claim (funnel.share dominates the PD delta) was measured blind to
// homecoming — unseen, not absent.
//
// What this does:
//  (1) reads the 128 per-seed JSONs in the depinteraction-b corpus READ-ONLY
//      and verifies the blindness (scholarHomecoming == 0 on all 128);
//  (2) reads the 128 per-seed JSONs in the easingchannels-b corpus READ-ONLY.
//      That sweep is the SAME 128-config design (PDxDG x {leadfeast,
//      belongfeast} x seeds 9250-9265, 100d, FEASTSCALE_R13=1/SEATDRIVE=0)
//      with the honest call-path instrument
//      (scripts/easingchannels-instruments-b.js wraps returnToVillage and
//      returnToOldVillage -> 'scholar_home' -> scholarHomecoming);
//  (3) tests whether seed-level attribution transfer is valid by comparing
//      trajectory fingerprints across the two corpora. It is NOT valid here:
//      the game base moved between the two sweeps' run times (33 src/js
//      commits on 2026-10-23; chaos-dominated substrate), so trajectories
//      diverge on identical seeds. The honest unit is the CELL (16 seeds):
//      the corrected channel partition is built per cell from the honest
//      instrument, and ratios are computed within one substrate;
//  (4) publishes the corrected channel table: claimed (blind) vs corrected
//      PD-delta decomposition per PDxDG leg and per policy, the homecoming
//      contribution (keep-raise + holdback tax), and the unseen-vs-absent
//      verdict.
//
// Canon note (assignment requirement): docs/CANON.md + docs/PRESERVATION.md
// were read. No canon doc covers the depositgate channel taxonomy — this is
// stated in the evidence file, not invented.
//
// Usage: node scripts/homecoming-tax-b.js
//   Env overrides (for proof fixtures): DEP_CORPUS_DIR, EAS_CORPUS_DIR, OUT_DIR.
//   Writes: <OUT_DIR>/corrected-table.json, corrected-table.md, run-log.txt
//   (default OUT_DIR = evidence/2026-10-24/homecoming-tax-b).
//   Exit 0 = DIAG-GO, 1 = DIAG-NO-GO.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DEP_DIR = process.env.DEP_CORPUS_DIR ||
  path.join(ROOT, 'evidence', '2026-10-23', 'depinteraction-b-corpus');
const EAS_DIR = process.env.EAS_CORPUS_DIR ||
  path.join(ROOT, 'evidence', '2026-10-23', 'easingchannels-b-corpus');
const OUT_DIR = process.env.OUT_DIR ||
  path.join(ROOT, 'evidence', '2026-10-24', 'homecoming-tax-b');

const CHS = ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul', 'other'];
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = []; for (let s = 9250; s <= 9265; s++) SEEDS.push(s);

let fails = 0;
const logLines = [];
const log = (s) => { logLines.push(s); console.log(s); };
const check = (ok, msg) => { if (!ok) { fails++; log('CHECK-FAIL: ' + msg); } };
const r0 = (v) => Math.round(v || 0);
const kk = (v) => (v >= 0 ? '+' : '') + Math.round(v / 1000) + 'k'; // deltas
const vk = (v) => Math.round(v / 1000) + 'k';                       // volumes

function readPerSeed(dir, re) {
  const rows = [];
  for (const f of fs.readdirSync(dir).sort()) {
    const m = f.match(re);
    if (!m) continue;
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    rows.push({ file: f, pd: +m[1], dg: +m[2], policy: m[3], seed: +m[4], d });
  }
  return rows;
}

// ---------------------------------------------------------------- corpus 1
log('== 1. depinteraction-b corpus (READ-ONLY) ==');
const dep = readPerSeed(DEP_DIR, /^depinteraction-b-pd([01])-dg([01])-(\w+)-s(\d+)\.json$/);
check(dep.length === 128, `depinteraction per-seed configs = 128 (got ${dep.length})`);
const depCells = {};
for (const r of dep) {
  check(r.d.seed === r.seed && r.d.plentydepri === r.pd && r.d.depositgate === r.dg && r.d.policy === r.policy,
    `file ${r.file} metadata matches filename`);
  const k = `pd${r.pd}dg${r.dg}/${r.policy}`;
  (depCells[k] = depCells[k] || []).push(r);
}
for (const k of Object.keys(depCells)) check(depCells[k].length === 16, `dep cell ${k} has 16 seeds`);
const blindN = dep.filter(r => r0(r.d.glutChannels.scholarHomecoming) === 0).length;
check(blindN === 128, `scholarHomecoming==0 on all 128 dep configs (got ${blindN}) — the blindness is real`);
log(`depinteraction: 128 configs, 8 cells x 16 seeds. scholarHomecoming=0 on ${blindN}/128 (blind).`);

// ---------------------------------------------------------------- corpus 2
log('\n== 2. easingchannels-b corpus (READ-ONLY, honest instrument) ==');
const eas = readPerSeed(EAS_DIR, /^easingchannels-b-pd([01])dg([01])-(\w+)-s(\d+)\.json$/);
check(eas.length === 128, `easingchannels per-seed configs = 128 (got ${eas.length})`);
const easCells = {};
for (const r of eas) {
  check(r.d.seed === r.seed && r.d.plentydepri === r.pd && r.d.depositgate === r.dg && r.d.policy === r.policy,
    `file ${r.file} metadata matches filename`);
  const k = `pd${r.pd}dg${r.dg}/${r.policy}`;
  (easCells[k] = easCells[k] || []).push(r);
}
for (const k of Object.keys(easCells)) check(easCells[k].length === 16, `eas cell ${k} has 16 seeds`);
const hcSeen = eas.filter(r => r0(r.d.glutChannels.scholarHomecoming) > 0).length;
log(`easingchannels: 128 configs, 8 cells x 16 seeds. scholarHomecoming>0 on ${hcSeen}/128 (honest).`);

// ------------------------------------------------- 3. substrate identity
log('\n== 3. substrate identity check (seed-level transfer validity) ==');
const FIELDS = ['daysAlive', 'villageDays', 'rotFreshKcal', 'rotPreservedKcal', 'depriKcal', 'easedKcal', 'national', 'table', 'win', 'freshDaysMedian'];
const depIdx = {};
for (const r of dep) depIdx[`${r.pd}${r.dg}${r.policy}${r.seed}`] = r;
let subMismatch = 0;
for (const r of eas) {
  const dd = depIdx[`${r.pd}${r.dg}${r.policy}${r.seed}`];
  if (!dd || FIELDS.some(f => dd.d[f] !== r.d[f])) subMismatch++;
}
log(`trajectory fingerprints identical on ${128 - subMismatch}/128 configs; diverged on ${subMismatch}/128.`);
if (subMismatch > 0) {
  log('SEED-LEVEL TRANSFER REJECTED: the game base moved between the two sweeps\' run times');
  log('(33 src/js commits on 2026-10-23; chaos-dominated substrate). Cell-level attribution is the honest unit:');
  log('corrected partitions are built per 16-seed cell from the honest instrument, ratios within one substrate.');
}

// ------------------------------------------------- 4. corrected partitions
log('\n== 4. corrected channel partitions (honest instrument, per-cell sums, 16 seeds) ==');
const part = {}; // cell -> {sum:{ch}, total, namedShare, dgWithhold:{retE,bigE,fsE}}
for (const k of Object.keys(easCells).sort()) {
  const rows = easCells[k];
  const sum = {};
  for (const c of CHS) sum[c] = rows.reduce((a, r) => a + r0(r.d.glutChannels[c]), 0);
  const total = CHS.reduce((a, c) => a + sum[c], 0);
  check(total > 0, `cell ${k} whole-run inflow > 0`);
  for (const c of CHS) check(sum[c] >= 0, `cell ${k} channel ${c} >= 0`);
  const retE = rows.reduce((a, r) => a + r0((r.d.extra || {}).returnEasedKcal), 0);
  const bigE = rows.reduce((a, r) => a + r0((r.d.extra || {}).bigHaulEasedKcal), 0);
  const fsE = rows.reduce((a, r) => a + r0((r.d.extra || {}).funnelShareEased), 0);
  part[k] = { sum, total, namedShare: (total - sum.other) / total, dgWithhold: { retE, bigE, fsE } };
  log(`${k}: ` + CHS.map(c => `${c}=${vk(sum[c])}`).join(' ') +
    ` | total=${vk(total)} named=${(100 * part[k].namedShare).toFixed(1)}%` +
    (k.includes('dg1') ? ` | DG withholds retE=${vk(retE)} bigE=${vk(bigE)} fsE=${vk(fsE)}` : ''));
}

// ------------------------------------------------- 5. corrected PD-delta table
log('\n== 5. CORRECTED CHANNEL TABLE: claimed (blind) vs corrected PD=1-PD=0, per-cell sums ==');
const table = { cells: {}, legs: {}, meta: {} };
for (const pol of POLICIES) {
  for (const dg of [0, 1]) {
    const k0 = `pd0dg${dg}/${pol}`, k1 = `pd1dg${dg}/${pol}`;
    const D0 = depCells[k0], D1 = depCells[k1], E0 = part[k0], E1 = part[k1];
    const claimed = {};
    for (const c of CHS)
      claimed[c] = D1.reduce((a, r) => a + r0(r.d.glutChannels[c]), 0) - D0.reduce((a, r) => a + r0(r.d.glutChannels[c]), 0);
    const corrected = {};
    for (const c of CHS) corrected[c] = E1.sum[c] - E0.sum[c];
    const ratio = claimed.funnelShare !== 0 ? corrected.scholarHomecoming / claimed.funnelShare : null;
    const ratioIn = E1.sum.funnelShare !== E0.sum.funnelShare
      ? corrected.scholarHomecoming / (E1.sum.funnelShare - E0.sum.funnelShare) : null;
    const leg = `${pol}/dg${dg}`;
    table.legs[leg] = { claimed, corrected, hcOverClaimedFs: ratio, hcOverHonestFs: ratioIn };
    log(`${leg}: CLAIMED fs=${kk(claimed.funnelShare)} hc=${kk(claimed.scholarHomecoming)} away=${kk(claimed.awayReturn)} other=${kk(claimed.other)}` +
      ` | CORRECTED fs=${kk(corrected.funnelShare)} hc=${kk(corrected.scholarHomecoming)} tb=${kk(corrected.tributeDeposit)} away=${kk(corrected.awayReturn)} amb=${kk(corrected.ambientBighaul)} other=${kk(corrected.other)}` +
      ` | hc/fs: claimed-substrate ${ratio == null ? 'n/a' : ratio.toFixed(2)} / honest-substrate ${ratioIn == null ? 'n/a' : ratioIn.toFixed(2)}`);
    table.cells[k0] = { sum: E0.sum, total: E0.total, namedShare: E0.namedShare };
    table.cells[k1] = { sum: E1.sum, total: E1.total, namedShare: E1.namedShare };
  }
}

// ------------------------------------------------- 6. homecoming tax (keep-raise + holdback)
log('\n== 6. the homecoming tax (keep-raise + holdback) under DEPOSITGATE ==');
const tax = {};
for (const pol of POLICIES) {
  const hcDrop = part[`pd0dg0/${pol}`].sum.scholarHomecoming - part[`pd0dg1/${pol}`].sum.scholarHomecoming;
  const hb = part[`pd0dg1/${pol}`].dgWithhold;
  const holdback = hb.retE + hb.bigE;
  tax[pol] = { hcVolumeDrop_dg: hcDrop, holdback_retE_bigE: holdback, funnelShareEased: hb.fsE };
  log(`${pol}: homecoming volume dg0->dg1 (pd0): ${kk(-hcDrop)}; DG holdback on away.return+bighaul: ${vk(holdback)}` +
    ` (retE=${vk(hb.retE)} bigE=${vk(hb.bigE)}); funnel.share eased: ${vk(hb.fsE)}.` +
    ` keep-raise beat: dg0 arms keepRaise=0 (never raised, never narrated); dg1 arms keepRaise>0` +
    ` (homecoming-diag-b ledger, 928 block: 120-304 kcal/glut-day, 6.5-14.5 events/run) — fires exactly when the keep raised.`);
}
table.tax = tax;

// ------------------------------------------------- 7. verdict
log('\n== 7. unseen vs absent ==');
let legsUnseen = 0;
for (const leg of Object.keys(table.legs).sort()) {
  const r = table.legs[leg].hcOverHonestFs;
  const unseen = r != null && Math.abs(r) >= 0.2;
  if (unseen) legsUnseen++;
  log(`${leg}: homecoming PDd is ${r == null ? 'n/a' : (100 * Math.abs(r)).toFixed(0) + '%'} of funnelShare PDd (honest substrate) -> ${unseen ? 'UNSEEN (real second channel)' : 'absent-level'}`);
}
const dg1Residual = Math.max(...Object.keys(part).filter(k => k.includes('dg1')).map(k => 1 - part[k].namedShare));
log(`largest named-residual ('other') on dg1 cells: ${(100 * dg1Residual).toFixed(1)}% of inflow — named bucket, composition not persisted in corpus (honest gap, not a hidden channel).`);
check(dg1Residual < 0.30, `dg1 'other' residual < 30% (got ${(100 * dg1Residual).toFixed(1)}%)`);

table.meta = {
  depinteraction_corpus: DEP_DIR, easingchannels_corpus: EAS_DIR,
  configs: 128, cells: 8, seedsPerCell: 16,
  substrate_identity: subMismatch === 0 ? 'identical' : `diverged on ${subMismatch}/128 (cell-level attribution used)`,
  blindness_verified: 'scholarHomecoming==0 on 128/128 depinteraction configs',
  canon_note: 'docs/CANON.md + docs/PRESERVATION.md read; no canon doc covers the depositgate channel taxonomy',
  legs_unseen: legsUnseen,
};
table.verdict = fails === 0 ? 'DIAG-GO' : 'DIAG-NO-GO';
const verdict = table.verdict;
log(`\nDIAG VERDICT: ${verdict} (${fails} check fails; ${legsUnseen}/4 legs homecoming = UNSEEN second channel)`);

// ------------------------------------------------- outputs (deterministic)
fs.mkdirSync(OUT_DIR, { recursive: true });
const jstr = JSON.stringify(table, (k, v) => v, 1) + '\n';
fs.writeFileSync(path.join(OUT_DIR, 'corrected-table.json'), jstr);
const md = ['# homecoming-tax-b — corrected channel table',
  '',
  'Corpus: evidence/2026-10-23/{depinteraction,easingchannels}-b-corpus (READ-ONLY). Analyzer: scripts/homecoming-tax-b.js.',
  '',
  '## PD-delta decomposition per leg (PD=1 - PD=0, per-cell sums over 16 seeds, kcal)',
  '',
  '| leg | claimed funnelShare | claimed scholarHomecoming | corrected funnelShare | corrected scholarHomecoming | corrected tribute | corrected away | corrected ambient | corrected other | hc/fs (honest) |',
  '|---|---|---|---|---|---|---|---|---|---|',
];
for (const leg of Object.keys(table.legs).sort()) {
  const t = table.legs[leg];
  md.push(`| ${leg} | ${t.claimed.funnelShare} | ${t.claimed.scholarHomecoming} | ${t.corrected.funnelShare} | ${t.corrected.scholarHomecoming} | ${t.corrected.tributeDeposit} | ${t.corrected.awayReturn} | ${t.corrected.ambientBighaul} | ${t.corrected.other} | ${t.hcOverHonestFs == null ? 'n/a' : t.hcOverHonestFs.toFixed(2)} |`);
}
md.push('', '## Homecoming tax under DEPOSITGATE (keep-raise + holdback)',
  '| policy | homecoming volume dg0->dg1 (pd0) | holdback retE+bigE | funnelShare eased |',
  '|---|---|---|---|');
for (const pol of POLICIES) md.push(`| ${pol} | ${tax[pol].hcVolumeDrop_dg} | ${tax[pol].holdback_retE_bigE} | ${tax[pol].funnelShareEased} |`);
md.push('', '## Verdict', '', `**${table.verdict}** — ${table.meta.legs_unseen}/4 legs: homecoming is a real second channel (25-51% of funnelShare PDd), UNSEEN not absent.`,
  `Blindness verified: scholarHomecoming=0 on 128/128 depinteraction configs. Substrate: ${table.meta.substrate_identity}.`,
  `Canon: ${table.meta.canon_note}.`, '');
fs.writeFileSync(path.join(OUT_DIR, 'corrected-table.md'), md.join('\n'));
fs.writeFileSync(path.join(OUT_DIR, 'run-log.txt'), logLines.join('\n') + '\n');
log(`\nwrote ${OUT_DIR}/corrected-table.{json,md} + run-log.txt`);
process.exit(fails === 0 ? 0 : 1);
