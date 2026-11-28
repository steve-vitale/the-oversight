#!/usr/bin/env node
// scripts/test-scalerank-a.js — sim-scalerank-a proof test.
// GREEN before the pilot (prereg §5). Proves the measurement chain
// on LIVE state, never on fixtures alone:
//
//   1. Analyzer selftest (stages, recompute, reconciliation, judge
//      shapes) — run as a child process, must exit 0.
//   2. Live leg: the driver runs seed 113301 for 100 days into a
//      temp outdir. On the produced row:
//        - every snapshot carries a complete scale-rank input block
//          (scale + standing + link list);
//        - the driver's recorded per-shape counts agree with an
//          independent recomputation from the recorded link rows
//          (analyzer.reconcileRow: 0 mismatches);
//        - the standing breakdown matches its own arithmetic
//          (total == war + diplomacy + plenty) on every snapshot;
//        - the death census closed its books or lists its residual
//          (booksClose true, or unattributed + residual named);
//        - the mechanism stage is computable (maxStage 0-3) and the
//          rank agrees with the flags on every snapshot.
//   3. Determinism: the same seed run twice (two temp outdirs) is
//      byte-identical per-seed JSON.
//
// Usage: node scripts/test-scalerank-a.js
// Exit 0 only if every check passes. Prints "N/N passed".
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED = 113301;
const DAYS = 100;

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function runDriver(seed, outdir, days) {
  const env = Object.assign({}, process.env, { OUTDIR: outdir, DAYS: String(days) });
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'scalerank-driver-a.js'), '--one', String(seed)], { env, encoding: 'utf8', timeout: 600000 });
  if (r.status !== 0) {
    console.log('--- driver stdout ---\n' + (r.stdout || '').slice(-2000));
    console.log('--- driver stderr ---\n' + (r.stderr || '').slice(-2000));
    throw new Error(`driver --one ${seed} exited ${r.status}`);
  }
  return JSON.parse(fs.readFileSync(path.join(outdir, `s${seed}.json`), 'utf8'));
}

function main() {
  // 1. Analyzer selftest.
  console.log('== analyzer selftest ==');
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-scalerank-a.js'), '--selftest'], { encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
    check('analyzer --selftest exits 0', true);
  } catch (e) {
    console.log((e.stdout || '') + (e.stderr || ''));
    check('analyzer --selftest exits 0', false, String((e && e.message) || e).slice(0, 120));
  }

  // 2. Live leg (only if the selftest passed — a broken analyzer
  // must not be papered over by live numbers).
  if (failed === 0) {
    console.log('== live leg: seed 113301, 100d ==');
    const tmpA = fs.mkdtempSync(path.join('/tmp', 'scalerank-a-proof-'));
    const tmpB = fs.mkdtempSync(path.join('/tmp', 'scalerank-a-proof2-'));
    const row = runDriver(SEED, tmpA, DAYS);
    const A = require('./analyze-scalerank-a');
    check('row has 100+ snapshots (daily + closing)', (row.snapshots || []).length >= DAYS, `got ${(row.snapshots || []).length}`);
    const snaps = row.snapshots || [];
    const complete = snaps.filter(s => s.scale && s.scale.standing && Array.isArray(s.scale.links));
    check('snapshot coverage 100% complete scale blocks', complete.length === snaps.length, `${complete.length}/${snaps.length}`);
    check('no gate errors', (row.gateErrors | 0) === 0);
    check('no scale errors', (row.scaleErrors | 0) === 0, `scaleErrors=${row.scaleErrors}`);
    check('no link errors', (row.linkErrors | 0) === 0, `linkErrors=${row.linkErrors}`);
    check('no driver errors', (row.errors || []).length === 0, JSON.stringify(row.errors || []).slice(0, 200));
    const mism = A.reconcileRow(row);
    check('reconciliation 0 mismatches', mism.length === 0, mism.join('; ').slice(0, 300));
    // Standing arithmetic on every snapshot.
    let badStanding = 0;
    for (const s of snaps) {
      const st = s.scale && s.scale.standing;
      if (!st) { badStanding++; continue; }
      if (((st.war | 0) + (st.diplomacy | 0) + (st.plenty | 0)) !== (st.total | 0)) badStanding++;
    }
    check('standing arithmetic holds on every snapshot', badStanding === 0, `${badStanding} bad`);
    // Rank agrees with the flags on every snapshot.
    let badRank = 0;
    for (const s of snaps) {
      const sc = s.scale;
      if (!sc) { badRank++; continue; }
      const want = sc.globalLive ? 'global' : (sc.nationalLive ? 'national' : (sc.networkLive ? 'regional' : 'village'));
      if (want !== sc.rank) badRank++;
    }
    check('rank agrees with flags on every snapshot', badRank === 0, `${badRank} bad`);
    // Mechanism stage computable.
    const analyzed = A.analyzeRow(row);
    check('mechanism maxStage in 0..3', analyzed.mechanism.maxStage >= 0 && analyzed.mechanism.maxStage <= 3, 'got ' + analyzed.mechanism.maxStage);
    check('binding input present at end', !!analyzed.mechanism.binding && analyzed.mechanism.binding.leadSeasonedSubs !== null);
    // The staged mid-run village: by day 100 the scale machinery
    // must be visible (regional reached, links formed) — the
    // contact check from prereg §6.1, verified live, not assumed.
    check('regional reached by day 100 (contact)', (row.markers.firstRegionalDay | 0) > 0 && (row.markers.firstRegionalDay | 0) <= 100, `firstRegionalDay=${row.markers.firstRegionalDay}`);
    const anyLinks = snaps.some(s => s.scale && s.scale.links && s.scale.links.length > 0);
    check('at least one link recorded (contact)', anyLinks);
    // Death census: books close or the residual is explicit.
    const ds = row.deaths && row.deaths.summary;
    check('death census present', !!ds);
    if (ds) {
      check('death books close (or residual listed)', ds.booksClose === true || (ds.leavers != null && ds.joins != null), `booksClose=${ds.booksClose}`);
      check('death census errors 0', ((row.deaths.errors || []).length) === 0, JSON.stringify((row.deaths.errors || [])).slice(0, 200));
      console.log(`  INFO deaths=${ds.deaths} named=${ds.deaths - (ds.unattributed | 0)} unattributed=${ds.unattributed} booksClose=${ds.booksClose} byCause=${JSON.stringify(ds.byCause)}`);
    }
    console.log(`  INFO seed ${SEED}: days=${row.days} maxRank=${row.maxRank} firstRegionalDay=${row.markers.firstRegionalDay} firstPolityDay=${row.markers.firstPolityDay} firstBeatDay=${row.markers.firstBeatDay} stage=${analyzed.mechanism.maxStage} endSeat=${row.end.seat}`);

    // 3. Determinism: same seed twice → byte-identical.
    console.log('== determinism: seed 113301 re-run ==');
    runDriver(SEED, tmpB, DAYS);
    const a = fs.readFileSync(path.join(tmpA, `s${SEED}.json`), 'utf8');
    const b = fs.readFileSync(path.join(tmpB, `s${SEED}.json`), 'utf8');
    check('determinism: re-run byte-identical', a === b, `lengths ${a.length} vs ${b.length}`);
  }

  console.log(`TEST-SCALERANK-A: ${passed} passed, ${failed} failed`);
  if (failed) { console.log('FAILURES: ' + fails.join('; ')); process.exit(1); }
}
if (require.main === module) main();
