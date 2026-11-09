// test-sitmetric-sweep-b.js — proof for the sweep-corpus side-by-side
// (arm sim-sitmetric-sweep-b, run fleshout-loop-b-20261109T0330Z).
//
// The §15 compare already surfaces raw table invitations alongside
// ruling-665 sittings (sim-sitmetric-b). The sweep-corpus compare
// (compareSweepCorpora) judged `table` as the raw row.table flag and
// printed nothing else about the table. This arm adds the same
// per-policy tableReach (display only) to the sweep path, WITHOUT
// changing any judged value, contract, digest, or decision logic.
//
// Proof: derivation fixtures on synthetic rows; known-case reads on
// the real committed corpora (takeseat / feareddoor / darkwit /
// fightloop); judged-value invariance against pre-change goldens
// (recorded from the unmodified code, see the prereg); a
// broken-compare sensitivity (invitation signal hidden -> tableReach
// null, no invented counts); and a cross-check of the inline sittings
// derivation against the canonical seatTakenOf on every re-run corpus
// row. Exit non-zero on any failure. Nothing is written into the
// repo. Usage: node scripts/test-sitmetric-sweep-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const score = require(path.join(REPO, 'scripts', 'lib', 'balance-scorecard'));
const { seatTakenOf } = require(path.join(REPO, 'scripts', 'lib', 'seat-taken'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function sha(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

// ---------- (1) derivation fixtures ----------
(function () {
  // True sweep row: flat flags are the signal.
  check('deriv-flat-row', score.sweepInvitedOf({ policy: 'p', seed: 1, table: 1, entered: 0 }) === 1 &&
    score.sweepSatOf({ policy: 'p', seed: 1, table: 1, entered: 0 }) === 0, '');
  check('deriv-flat-row-sat', score.sweepInvitedOf({ policy: 'p', seed: 1, table: 1, entered: 1 }) === 1 &&
    score.sweepSatOf({ policy: 'p', seed: 1, table: 1, entered: 1 }) === 1, '');
  // tableInvited alias stands in for the flat flag.
  check('deriv-alias', score.sweepInvitedOf({ policy: 'p', seed: 1, tableInvited: true }) === 1, '');
  // Instrument row: daily snapshots are the signal.
  check('deriv-daily-invited', score.sweepInvitedOf({ policy: 'p', seed: 1,
    daily: [{ day: 1, tableWaiting: false }, { day: 61, tableWaiting: true }] }) === 1, '');
  check('deriv-daily-never-invited', score.sweepInvitedOf({ policy: 'p', seed: 1,
    daily: [{ day: 1, tableWaiting: false }, { day: 2, tableWaiting: false }] }) === 0, '');
  check('deriv-daily-sat', score.sweepSatOf({ policy: 'p', seed: 1,
    daily: [{ day: 1, tableDone: false }, { day: 93, tableDone: true }] }) === 1, '');
  // No signal at all: null, never invented.
  check('deriv-no-signal', score.sweepInvitedOf({ policy: 'p', seed: 1 }) === null &&
    score.sweepSatOf({ policy: 'p', seed: 1 }) === null, '');
  check('deriv-daily-no-field', score.sweepInvitedOf({ policy: 'p', seed: 1, daily: [{ day: 1 }] }) === null, '');
  check('deriv-empty-row', score.sweepInvitedOf(null) === null && score.sweepSatOf(null) === null, '');
  // Priced-but-untaken row, no daily: the priced seat is NOT an
  // invitation signal. (A compare that counted priced seats as
  // invitations would read 1 here; the derivation reads null.)
  check('deriv-priced-is-not-invited', score.sweepInvitedOf({ policy: 'p', seed: 1,
    finalSeat: { seat: 'lesser' }, takeseatStats: { seatTaken: 0 } }) === null &&
    score.sweepSatOf({ policy: 'p', seed: 1,
      finalSeat: { seat: 'lesser' }, takeseatStats: { seatTaken: 0 } }) === 0, '');
})();

// ---------- (2) known cases on the real corpora ----------
function loadDir(dir, label) {
  return fs.readdirSync(path.join(REPO, dir)).sort()
    .filter(function (f) { return f.endsWith('.json'); })
    .map(function (f) {
      const r = JSON.parse(fs.readFileSync(path.join(REPO, dir, f), 'utf8'));
      if (label) r.policy = label; // test-side presentation: the arm
      // corpora carry different policy names per leg, and the sweep
      // compare pairs by policy+seed, so both legs share one label.
      return r;
    });
}
function reach(rep) {
  return rep.policies.length === 1 ? rep.policies[0].tableReach : null;
}
// Pre-change goldens (recorded from the unmodified code before the
// fix; see evidence/2026-11-08/sim-sitmetric-sweep-b-prereg.md).
// Every pair's judged `table` metric is the same not_observed object
// (these corpora carry no flat table flag), differing only in
// totalPairs (= cases). The digests cover the FULL judged metrics
// arrays, byte for byte.
const GOLDEN_TABLE = { id: 'table', label: 'Table sitting rate (seat taken, whether or not a waiting invitation was observed)',
  unit: 'fraction', direction: 'higher', tolerance: 0.02, reviewChanges: false, status: 'not_observed',
  coverageChanged: false, eligibleBefore: 0, eligibleAfter: 0, pairs: 0, before: null, after: null, delta: null,
  interval95: [null, null], pairedP10: null, pairedMedian: null, pairedP90: null,
  increased: 0, decreased: 0, better: 0, worse: 0, tied: 0 };
const GOLDENS = {
  takeseat: { decision: 'review_required', cases: 8, digest: '460a36fdfbf3a19cffa1e26fffaa6a71b1c2264c8b9c6b32aeac18df8e01b885' },
  feareddoor: { decision: 'review_required', cases: 12, digest: 'eeaa356cdc1a36f15dfbd4b8e9b6f76579da8fc7b3353a357bff280267f90730' },
  'darkwit-fresh': { decision: 'review_required', cases: 8, digest: 'f202d5baa641882f4e6a04688082a15865d975221f7cd272ccec2b4a3ac347ff' },
  'darkwit-53201': { decision: 'review_required', cases: 8, digest: '460a36fdfbf3a19cffa1e26fffaa6a71b1c2264c8b9c6b32aeac18df8e01b885' },
  'feareddoor-53210': { decision: 'review_required', cases: 1, digest: '53b95785e1539e289b1028196c3ea2151bc2d3572dd75bdc5248b7b0d02d6ab4' },
  fightloop: { decision: 'review_required', cases: 8, digest: '460a36fdfbf3a19cffa1e26fffaa6a71b1c2264c8b9c6b32aeac18df8e01b885' },
};
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every(function (v, i) { return deepEqual(v, b[i]); });
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every(function (k, i) { return k === kb[i] && deepEqual(a[k], b[k]); });
}
function checkInvariance(name, rep, checkName) {
  const g = GOLDENS[name];
  const p = rep.policies[0];
  const table = p.metrics.find(function (m) { return m.id === 'table'; });
  const expectedTable = Object.assign({}, GOLDEN_TABLE, { totalPairs: g.cases });
  let firstDiff = null;
  if (!deepEqual(table, expectedTable)) firstDiff = 'table metric moved: ' + JSON.stringify(table);
  if (sha(JSON.stringify(p.metrics)) !== g.digest) {
    // Diagnose: name the first metric whose judged value moved.
    firstDiff = firstDiff || 'metrics digest moved: ' + sha(JSON.stringify(p.metrics)) + ' != golden ' + g.digest;
  }
  check(checkName || ('invariance-' + name), rep.decision === g.decision && p.cases === g.cases &&
    deepEqual(table, expectedTable) &&
    sha(JSON.stringify(p.metrics)) === g.digest,
    'decision=' + rep.decision + ' cases=' + p.cases + (firstDiff ? ' :: ' + firstDiff : ''));
}
function checkReach(name, rep, ib, ia, sb, sa, cases) {
  const t = reach(rep);
  check('reach-' + name, !!t && t.invitedBefore === ib && t.invitedAfter === ia &&
    t.sittingsBefore === sb && t.sittingsAfter === sa && t.cases === cases,
    JSON.stringify(t));
}
(function () {
  // takeseat: baseline invited 5/8 + sat 0/8; armed invited 5/8 + sat 5/8.
  const tkB = loadDir('evidence/2026-11-07/perseed-takeseat-b-baseline', 'takeseat');
  const tkA = loadDir('evidence/2026-11-07/perseed-takeseat-b-armed', 'takeseat');
  const tk = score.comparePanels(tkB, tkA, {});
  checkInvariance('takeseat', tk);
  checkReach('takeseat', tk, 5, 5, 0, 5, 8);
  // feareddoor full pair: invited 4/12 both legs (2 priced rows per
  // leg sat on the final day after the last daily snapshot, so the
  // snapshot signal never saw their invitation — see the evidence
  // file); sittings 5/12 both legs.
  const fdB = loadDir('evidence/2026-11-07/perseed-feareddoor-b-baseline', 'feareddoor');
  const fdA = loadDir('evidence/2026-11-07/perseed-feareddoor-b-armed', 'feareddoor');
  const fd = score.comparePanels(fdB, fdA, {});
  checkInvariance('feareddoor', fd);
  checkReach('feareddoor', fd, 4, 4, 5, 5, 12);
  // feareddoor seed 53210 on both legs: invited 1/1, sat 0/1.
  const s10 = score.comparePanels(fdB.filter(function (r) { return r.seed === 53210; }),
    fdA.filter(function (r) { return r.seed === 53210; }), {});
  checkInvariance('feareddoor-53210', s10);
  checkReach('feareddoor-53210', s10, 1, 1, 0, 0, 1);
  // darkwit 53201-baseline leg (self-compare): invited 3/8, sat 0/8.
  const dwOld = loadDir('evidence/2026-11-07/perseed-darkwit-b-baseline', 'darkwit');
  const dwSelf = score.comparePanels(dwOld, dwOld, {});
  checkInvariance('darkwit-53201', dwSelf);
  checkReach('darkwit-53201', dwSelf, 3, 3, 0, 0, 8);
  // darkwit fresh pair (seeds 53701-53708): invited 5/8 -> 6/8,
  // sittings 5/8 -> 2/8 — the measured values, verified against the
  // canonical aligned-seat rule and the darkwit arm's own evidence
  // (sim-darkwit-b.md: baseline 5 sits, armed 2 walks). The prereg's
  // expectation for this pair (0/8 -> 5/8) was wrong — it imported
  // sim-sitmetric-b's conflated darkwit row, which paired the
  // collapsed 53201 baseline against the fresh BASELINE as "armed".
  // The miss is recorded in the evidence file's metric review; the
  // test pins the verified-true counts.
  const dwB = loadDir('evidence/2026-11-07/perseed-darkwit-b-pilot-baseline-fresh', 'darkwit-fresh');
  const dwA = loadDir('evidence/2026-11-07/perseed-darkwit-b-pilot-armed-fresh', 'darkwit-fresh');
  const dw = score.comparePanels(dwB, dwA, {});
  checkInvariance('darkwit-fresh', dw);
  checkReach('darkwit-fresh', dw, 5, 6, 5, 2, 8);
  // fightloop: invited 8/8 -> 7/8, sittings 7/8 -> 5/8 (invited ==
  // priced on both legs here).
  const flB = loadDir('evidence/2026-11-08/perseed-fightloop-b-baseline', null);
  const flA = loadDir('evidence/2026-11-08/perseed-fightloop-b-candidate', null);
  const fl = score.comparePanels(flB, flA, {});
  checkInvariance('fightloop', fl);
  checkReach('fightloop', fl, 8, 7, 7, 5, 8);
  // The markdown renders the sweep table-reach line (same line the
  // §15 compare prints) under the sweep header.
  const md = score.markdown(tk);
  check('md-sweep-header', md.startsWith('# Sweep-corpus comparison (not a balanced-panel verdict)'), md.split('\n')[0]);
  check('md-sweep-reach-line', md.includes('Table reach (raw') && md.includes('invitations observed 5/8 before') &&
    md.includes('5/8 after') && md.includes('sittings (ruling 665) 0/8') && md.includes('5/8'),
    md.split('\n').filter(function (l) { return /Table reach/.test(l); }).join(' '));
})();

// ---------- (3) broken-compare sensitivity ----------
(function () {
  // Hide the invitation signal from the takeseat baseline rows: strip
  // the tableWaiting field from every daily entry (sittings stay
  // derivable via takeseatStats/daily tableDone). The compare must
  // report NO reach line at all — tableReach null — not a false 0/8
  // and not the 5/8 the priced seats would suggest. A compare that
  // counted priced seats as invitations, or that printed 0 for a
  // missing flag, fails this check.
  function hideInvitations(rows) {
    return rows.map(function (r) {
      const c = JSON.parse(JSON.stringify(r));
      delete c.table; delete c.tableInvited;
      (c.daily || []).forEach(function (d) { delete d.tableWaiting; });
      return c;
    });
  }
  const tkB = loadDir('evidence/2026-11-07/perseed-takeseat-b-baseline', 'takeseat');
  const tkA = loadDir('evidence/2026-11-07/perseed-takeseat-b-armed', 'takeseat');
  const hidden = score.comparePanels(hideInvitations(tkB), hideInvitations(tkA), {});
  check('sensitivity-hidden-flag-null', hidden.policies.length === 1 &&
    hidden.policies[0].tableReach === null, JSON.stringify(hidden.policies[0] && hidden.policies[0].tableReach));
  // ...and its judged values are still the goldens: hiding a display
  // signal must not move the judge either.
  checkInvariance('takeseat', hidden, 'invariance-takeseat-hidden-flag');
  const md = score.markdown(hidden);
  check('sensitivity-hidden-flag-md', !md.includes('Table reach'), md.split('\n').filter(function (l) { return /Table reach/.test(l); }).join(' '));
  // Flat sweep rows with no table flag anywhere: null as well.
  const bare = score.comparePanels(
    [{ policy: 'p', seed: 1, won: 0 }, { policy: 'p', seed: 2, won: 1 }],
    [{ policy: 'p', seed: 1, won: 0 }, { policy: 'p', seed: 2, won: 1 }], {});
  check('sensitivity-bare-rows-null', bare.policies[0].tableReach === null, JSON.stringify(bare.policies[0].tableReach));
  // Flat sweep rows WITH the flag: the flag itself is the signal.
  const flagged = score.comparePanels(
    [{ policy: 'p', seed: 1, won: 0, table: 1, entered: 0 }, { policy: 'p', seed: 2, won: 1, table: 0, entered: 0 }],
    [{ policy: 'p', seed: 1, won: 0, table: 1, entered: 1 }, { policy: 'p', seed: 2, won: 1, table: 1, entered: 0 }], {});
  const ft = flagged.policies[0].tableReach;
  check('sensitivity-flat-flag-read', !!ft && ft.invitedBefore === 1 && ft.invitedAfter === 2 &&
    ft.sittingsBefore === 0 && ft.sittingsAfter === 1 && ft.cases === 2, JSON.stringify(ft));
})();

// ---------- (4) cross-check: inline sittings vs canonical seatTakenOf ----------
(function () {
  const dirs = ['evidence/2026-11-07/perseed-takeseat-b-baseline', 'evidence/2026-11-07/perseed-takeseat-b-armed',
    'evidence/2026-11-07/perseed-feareddoor-b-baseline', 'evidence/2026-11-07/perseed-feareddoor-b-armed',
    'evidence/2026-11-07/perseed-darkwit-b-baseline', 'evidence/2026-11-07/perseed-darkwit-b-pilot-baseline-fresh',
    'evidence/2026-11-07/perseed-darkwit-b-pilot-armed-fresh', 'evidence/2026-11-08/perseed-fightloop-b-baseline',
    'evidence/2026-11-08/perseed-fightloop-b-candidate'];
  let rows = 0, bad = [];
  dirs.forEach(function (dir) {
    loadDir(dir, null).forEach(function (r) {
      rows++;
      const mine = score.sweepSatOf(r), canon = seatTakenOf(r);
      const agree = (mine === 1 && canon === true) || (mine === 0 && canon === false) || (mine === null && canon === null);
      if (!agree) bad.push(dir + '/s' + r.seed + ': mine=' + mine + ' canon=' + canon);
    });
  });
  check('xcheck-sat-agrees-seatTakenOf', bad.length === 0, rows + ' rows; ' + bad.slice(0, 5).join('; '));
})();

console.log(pass + '/' + (pass + fail) + ' PASS');
process.exit(fail ? 1 : 0);
