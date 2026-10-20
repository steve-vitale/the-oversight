#!/usr/bin/env node
// analyze-ledgerdark-20261020.js — attribution + PRIMARY verdict for
// sim-ledgerdark-road.
//
// Reads the armed corpus (evidence/2026-10-20/perseed-ledgerdark/) and the
// re-measured control corpus
// (evidence/2026-10-20/perseed-tablepathdriver-control/) and reports:
//   - wall numbers armed vs control
//   - per-run: ledger vector at sitting, beloved branch, assigned/walked
//     door, terminal resolution, the road's verb counts
//   - PRIMARY: (1) dark-branch walks ≥3/4 of dark-assigned runs that earn
//     a dark branch; (2) dark-ledger depth per sitting; (3) dark-branch
//     terminal reach; (4) guardrails
// Usage: node scripts/analyze-ledgerdark-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const ARMED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-ledgerdark');
// The control: re-measured on the current tip (f83c41ea6) by the parent
// arm (its FIDELITY=1 proved the 2026-10-19 corpus stale). Same
// composition, same seeds, current base.
const CONTROL = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tablepathdriver-control');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];

function loadRuns(dir) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(dir, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) { rows.push({ policyId, seed, r: null, fp }); continue; }
      rows.push({ policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')), fp });
    }
  }
  return rows;
}

function wall(rows) {
  const ok = rows.filter(x => x.r);
  const n = (f) => ok.filter(x => f(x.r)).length;
  return {
    n: ok.length, national: n(r => r.national), table: n(r => r.table),
    wins: n(r => r.won), wave4: n(r => r.wave45), wave5: n(r => r.wave5),
    sat: n(r => r.satEver), invited: n(r => r.tableDay != null),
    exiled: n(r => r.exiled),
    medianSurvival: median(ok.map(x => x.r.gameDays || 0)),
    maxSurvival: Math.max(0, ...ok.map(x => x.r.gameDays || 0)),
  };
}
function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function analyzeRun(x) {
  const r = x.r;
  if (!r) return { missing: true };
  const tpd = r.tpdSummary || {};
  const ld = r.ldSummary || {};
  const lv = r.ledgerAtSit || {};
  // Walks derived from doorEvents + finalsEvents (the drain's own record;
  // the parent arm's instrument note on the `walked` array applies).
  const doorEvents = tpd.doorEvents || [];
  const finalsByPath = {};
  for (const f of (tpd.finalsEvents || [])) finalsByPath[f.path] = f;
  const walked = doorEvents.map(d => {
    const pid = String(d.picked || '').replace(/^path:/, '');
    const fin = finalsByPath[pid];
    return {
      path: pid, branch: fin ? fin.branch : null, day: d.day,
      fellBack: !!d.fellBack, finalId: fin ? fin.finalId : null,
      missWhy: d.missWhy || null,
    };
  });
  const terminal = r.tableDoneDay != null && (r.phaseTrace || []).indexOf('done') >= 0;
  const beloved = lv.beloved || null;
  const darkEarned = !!(beloved && beloved.branch === 'dark');
  const darkWalked = walked.some(w => w.path === 'beloved' && w.branch === 'dark');
  const seatedDeaths = (((r.deathsAttributed || {}).attributed) || []).filter(d => {
    const t = d.tableAtDeath || {};
    return (t.sitting | 0) > 0;
  });
  return {
    seed: x.seed, policyId: x.policyId,
    endReason: r.endReason, won: !!r.won, national: !!r.national,
    invited: r.tableDay != null, sat: !!r.satEver, sittingDay: r.sittingDay,
    exiled: !!r.exiled,
    assigned: r.tpAssigned || null,
    walked, terminal,
    doorEvents,
    darkEarned, darkWalked,
    belovedMargin: beloved ? `${beloved.branch} ${beloved.dark}v${beloved.light}` : null,
    ledger: {
      killed: lv.killed | 0, prot: lv.prot | 0, betrayed: lv.betrayed | 0,
      shared: lv.shared | 0, hoarded: lv.hoarded | 0,
      showmanship: lv.showmanship | 0, stance: lv.stance || null,
    },
    road: {
      begsRefused: ld.begsRefused | 0, aidBegsRefused: ld.aidBegsRefused | 0,
      hoardTakes: ld.hoardTakes | 0, hoardTakeKcal: ld.hoardTakeKcal | 0,
      hoardSkippedPantry: ld.hoardSkippedPantry | 0,
      betrayalDone: ld.betrayalDone | 0, betrayalDay: ld.betrayalDay,
      betrayalSkipped: ld.betrayalSkipped | 0, betrayalThrew: ld.betrayalThrew | 0,
      stoppedTable: ld.stoppedTable | 0, quietExile: ld.quietExile | 0,
    },
    branchMargins: tpd.branchMargins || {},
    seatedDeaths: seatedDeaths.map(d => ({ who: d.name || d.who, day: d.day, channel: d.channel, cause: d.cause, phase: (d.tableAtDeath || {}).phase, path: (d.tableAtDeath || {}).path })),
    engineErrors: ((tpd.drainError | 0) + (ld.ldError | 0) + (r.instrumentErrors | 0)),
    complete: true,
  };
}

function main() {
  const armed = loadRuns(ARMED).map(analyzeRun);
  const control = loadRuns(CONTROL);
  const missing = armed.filter(a => a.missing);
  if (missing.length) { console.log(`MISSING armed files: ${missing.length}`); process.exit(2); }

  const w = wall(loadRuns(ARMED)), c = wall(control);
  console.log('WALL armed  : ' + JSON.stringify(w));
  console.log('WALL control: ' + JSON.stringify(c));

  // Per-run: the road, the ledger, the branch, the walk.
  console.log('\nPER-RUN (road -> ledger@sit -> beloved branch -> walk -> terminal):');
  for (const a of armed) {
    const L = a.ledger, R = a.road;
    console.log(`  ${a.policyId}-s${a.seed} sat=${a.sat} won=${a.won} end=${a.endReason}` +
      ` | road: begs=${R.begsRefused} aidbegs=${R.aidBegsRefused} hoard=${R.hoardTakes}(${R.hoardTakeKcal}kcal) betray=${R.betrayalDone}${R.betrayalDay ? '@d' + R.betrayalDay : ''}${R.betrayalSkipped ? `(skipped x${R.betrayalSkipped})` : ''}${R.stoppedTable ? ' stoppedTable' : ''}${R.quietExile ? ' QUIET-EXILE' : ''}` +
      ` | ledger: killed=${L.killed} prot=${L.prot} betrayed=${L.betrayed} shared=${L.shared} hoarded=${L.hoarded} show=${L.showmanship} stance=${L.stance}` +
      ` | beloved: ${a.belovedMargin || '—'} walked=[${a.walked.map(x => x.path + '/' + x.branch + (x.fellBack ? '(fb)' : '')).join(',') || '—'}] terminal=${a.terminal}`);
  }

  // Dark-branch walks.
  const darkEarnedRuns = armed.filter(a => a.darkEarned);
  const darkWalkedRuns = armed.filter(a => a.darkWalked);
  console.log(`\nDARK-BRANCH: earned=${darkEarnedRuns.length} walked=${darkWalkedRuns.length}`);
  for (const a of darkEarnedRuns) {
    console.log(`  ${a.policyId}-s${a.seed} sat=${a.sat} branch=${a.belovedMargin} walked=[${a.walked.map(x => x.path + '/' + x.branch).join(',') || '—'}] terminal=${a.terminal} missWhy=${((a.doorEvents[0] || {}).missWhy || '').slice(0, 100)}`);
  }

  // Seated deaths.
  const seated = [];
  for (const a of armed) for (const d of a.seatedDeaths) seated.push({ ...d, run: `${a.policyId}-s${a.seed}` });
  console.log(`\nSEATED DEATHS: ${seated.length}`);
  for (const d of seated) console.log(`  ${d.run} ${d.who} d${d.day} ${d.channel} (${d.cause}) phase=${d.phase} path=${d.path}`);

  // Engine errors.
  const errs = armed.filter(a => a.engineErrors > 0);
  console.log(`\nENGINE ERRORS: ${errs.length} runs with nonzero (drain/ld/instrument)`);
  for (const a of errs) console.log(`  ${a.policyId}-s${a.seed}: ${a.engineErrors}`);

  // ---- PRIMARY verdict ----
  const leg = {};
  // (1) dark-branch walks: ≥3/4 of dark-assigned runs that earn a dark
  // branch walk it. All 16 runs are dark-assigned (beloved).
  const nE = darkEarnedRuns.length, nW = darkWalkedRuns.length;
  leg.darkWalks = nE === 0 ? 'NO-GO (0 dark branches earned — the road failed)'
    : (nW / nE >= 0.75 ? `GO (${nW}/${nE})` : `NO-GO (${nW}/${nE} < 3/4)`);
  // (2) dark-ledger depth: named per sitting.
  const withLedger = armed.filter(a => a.sat && a.belovedMargin);
  leg.depth = withLedger.length >= 3 ? `GO (${withLedger.length} sittings with named margins)` : `NO-GO (${withLedger.length} sittings)`;
  // (3) dark-branch terminal reach.
  const darkTerminal = darkWalkedRuns.filter(a => a.terminal).length;
  leg.terminal = darkWalkedRuns.length === 0 ? 'NO-GO (0 dark walks)'
    : (darkTerminal / darkWalkedRuns.length >= 0.75 ? `GO (${darkTerminal}/${darkWalkedRuns.length} terminal)` : `NO-GO (${darkTerminal}/${darkWalkedRuns.length} terminal)`);
  console.log('\nPRIMARY:');
  console.log(`  (1) dark-branch walks ≥3/4 of dark-earning runs: ${leg.darkWalks}`);
  console.log(`  (2) dark-ledger depth named per sitting: ${leg.depth}`);
  console.log(`  (3) dark-branch terminal reach ≥3/4: ${leg.terminal}`);

  // ---- Guardrails ----
  const conv = w.invited ? w.sat / w.invited : 0;
  const armedChans = new Set(), controlChans = new Set();
  for (const x of loadRuns(ARMED)) {
    if (!x.r) continue;
    for (const d of (((x.r.deathsAttributed || {}).attributed) || [])) armedChans.add(d.channel);
  }
  for (const x of control) {
    if (!x.r) continue;
    for (const d of (((x.r.deathsAttributed || {}).attributed) || [])) controlChans.add(d.channel);
  }
  const newModes = [...armedChans].filter(ch => !controlChans.has(ch));
  console.log('\nGUARDRAILS:');
  console.log(`  conversion sat/invited: ${(conv * 100).toFixed(1)}% (bar ≥70%) ${conv >= 0.7 ? 'PASS' : 'FAIL'}`);
  console.log(`  new death modes: [${newModes.join(',') || 'none'}] ${newModes.length === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  national ±2: armed=${w.national} control=${c.national} ${Math.abs(w.national - c.national) <= 2 ? 'PASS' : 'FAIL'}`);
  console.log(`  table ±2: armed=${w.table} control=${c.table} ${Math.abs(w.table - c.table) <= 2 ? 'PASS' : 'FAIL'}`);
  console.log(`  engine errors: ${errs.length} runs ${errs.length === 0 ? 'PASS' : 'REVIEW'}`);
  console.log(`  exiled: armed=${w.exiled} control=${c.exiled} (informational — the dark road's price)`);

  const summary = { wallArmed: w, wallControl: c, legs: leg, guardrails: { conversion: conv, newModes, national: [w.national, c.national], table: [w.table, c.table], errRuns: errs.length, exiled: [w.exiled, c.exiled] } };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-20', 'ledgerdark-corpus-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log('\nwrote evidence/2026-10-20/ledgerdark-corpus-summary.json');
}

if (require.main === module) main();
module.exports = { analyzeRun, loadRuns, wall, SEEDS, POLICIES, ARMED, CONTROL };
