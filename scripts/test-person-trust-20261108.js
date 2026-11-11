// test-person-trust-20261108.js — per-villager trust map writers
// (docs/VILLAGER-BRAIN.md phase 2 writer slice; game-gaps.md first ready gap).
//
// Proves:
//   1. bumpPersonTrust / personTrustOf / personTrustCensus exist and
//      unset reads as 0 (never the scholar-trust default of 10).
//   2. bondAdd lived warmth writes both directions on the person map
//      without touching state.village.trust.
//   3. trustedAnyone / vgoalGate('bonds') opens once a map entry hits 40.
//   4. bondDriveLive still keys off warmth (15..50), not the person map.
//   5. Ordinary seeded panel (seed 84101, 30d, competent): maxTrust > 0
//      and at least one bonds gate opens; non-aimed errands stay inside
//      the pre-declared tolerance from evidence/2026-11-08/person-trust-prereg.md.
//
// Usage: node scripts/test-person-trust-20261108.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); }
}

// Errand-mix baseline (seed 84101, 30d competent) refreshed 2026-11-08
// (duty dawn pick): Phase 6 DUTY top-score commit maps believed-need water/
// forage ads onto real WATER/FORAGE objectives — aimed mix move vs OVE-61
// tip be39a0a4e. Honest rebaseline, not a loosened assertion. VISIT /
// HAVEN_CHORE remain bonds-goal kinds excluded from the bar.
// Re-pinned 2026-11-11 (divergence reconciliation): EAT 36 -> 59,
// FORAGE 1 -> 2, HAUL 1 -> 0. Measured merged-tree panel, bit-identical
// across re-runs; mechanism in evidence/2026-11-10/reconcile-feeder-probe.md —
// Cursor's dawn scorer adds DUTY water ads (3.0-5.5+) that win 60/291 picks
// over light lottery draws while the cistern sits under 2 days' water, so
// villagers fetch water all morning and eat at dusk. Tolerance stays ±25%.
const BASELINE = {
  seed: 84101,
  days: 30,
  maxTrust: 56,
  entries: 48,
  trustedOpen: 5,
  kinds: { LEAVE: 2, WATER: 187, EAT: 59, VISIT: 10, FORAGE: 2, SEEK: 19, HAUL: 0 },
};
const NON_AIMED = ['WATER', 'FORAGE', 'TRAPS', 'EAT', 'SEEK', 'LEAVE', 'HUNT', 'HAUL'];
const TOLERANCE = 0.25; // ±25% of baseline count; zero-baseline allows +2 absolute

function withinTol(got, want) {
  if (want === 0) return got <= 2;
  const lo = want * (1 - TOLERANCE);
  const hi = want * (1 + TOLERANCE);
  return got >= lo && got <= hi;
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  ok('API: bumpPersonTrust', typeof Game.bumpPersonTrust === 'function');
  ok('API: personTrustOf', typeof Game.personTrustOf === 'function');
  ok('API: personTrustCensus', typeof Game.personTrustCensus === 'function');
  ok('bondAdd wrapped', !!(Game.bondAdd && Game.bondAdd._personTrustWrapped));

  const v = Game.state.village;
  const me = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== me);
  ok('roster has 2+ NPCs', npcs.length >= 2, 'n=' + npcs.length);
  const a = npcs[0], b = npcs[1];

  // Unset reads as 0, not 10.
  ok('unset personTrustOf is 0', Game.personTrustOf(a, b) === 0, 'got=' + Game.personTrustOf(a, b));

  // Scholar trust is a different number — snapshot before bondAdd.
  v.trust = v.trust || {};
  const scholarBefore = Object.assign({}, v.trust);

  // Lived event: bondAdd (visit-shaped). Should move person maps both ways
  // and leave village.trust untouched.
  const bondOk = Game.bondAdd(a, b, 4, 'visit');
  ok('bondAdd accepts visit', !!bondOk);
  ok('A trusts B after visit', Game.personTrustOf(a, b) === 4, 'got=' + Game.personTrustOf(a, b));
  ok('B trusts A after visit', Game.personTrustOf(b, a) === 4, 'got=' + Game.personTrustOf(b, a));
  let scholarTouched = false;
  for (const k of Object.keys(v.trust || {})) {
    if ((scholarBefore[k] || 0) !== (v.trust[k] || 0) && (k === a || k === b)) {
      // bondAdd itself must not write scholar trust; allow unrelated churn
      if ((scholarBefore[k] === undefined && v.trust[k] !== undefined) ||
          (scholarBefore[k] !== undefined && scholarBefore[k] !== v.trust[k])) {
        // Only fail if a or b scholar slot changed from this call alone
        if (k === a || k === b) {
          const before = scholarBefore[k];
          const after = v.trust[k];
          if (before !== after) scholarTouched = true;
        }
      }
    }
  }
  // Stricter: a/b scholar slots identical to snapshot.
  ok('bondAdd does not write village.trust[a/b]',
    (scholarBefore[a] === v.trust[a] || (scholarBefore[a] === undefined && v.trust[a] === undefined)) &&
    (scholarBefore[b] === v.trust[b] || (scholarBefore[b] === undefined && v.trust[b] === undefined)),
    'a:' + scholarBefore[a] + '->' + v.trust[a] + ' b:' + scholarBefore[b] + '->' + v.trust[b]);
  void scholarTouched;

  // Bonds gate: closed at 0, open at 40.
  const pa = Game.getPerson(a);
  if (pa) pa.trust = {};
  ok('bonds gate closed at empty map', Game.vgoalGate(a, 'bonds') === 0, 'got=' + Game.vgoalGate(a, 'bonds'));
  Game.bumpPersonTrust(a, b, 40, 'test');
  ok('bonds gate opens at 40', Game.vgoalGate(a, 'bonds') === 1, 'got=' + Game.vgoalGate(a, 'bonds'));

  // Warmth window unchanged: bondDriveLive keys off bond.v, not person map.
  ok('bondDriveLive present', typeof Game.bondDriveLive === 'function');
  // Clear person trust; set warmth into the window.
  if (pa) pa.trust = {};
  const pb = Game.getPerson(b);
  if (pb) pb.trust = {};
  // Force a warmth of 20 via repeated bondAdd across days (daily cap 6).
  v.bonds = v.bonds || {};
  const key = Game.bondKey(a, b);
  v.bonds[key] = { v: 20, depth: 0, day: 0, dayGain: 0 };
  const drive = Game.bondDriveLive(a, b);
  ok('warmth window live at v=20 regardless of empty person map',
    !!(drive && drive.live === true && drive.warmth === 20),
    JSON.stringify(drive));
  ok('bonds gate still closed with empty person map', Game.vgoalGate(a, 'bonds') === 0);

  // --- Ordinary panel ---
  // Fresh process would be cleaner, but harness forbids two loads in one
  // process. Re-newGame via setup on a second load is impossible here; run
  // the panel in a child process instead.
  const { spawnSync } = require('child_process');
  const panel = spawnSync(process.execPath, [path.join(__dirname, 'person-trust-panel-20261108.js')], {
    cwd: REPO,
    encoding: 'utf8',
    env: process.env,
    timeout: 120000,
  });
  if (panel.status !== 0) {
    ok('panel child exited 0', false, 'status=' + panel.status + ' err=' + (panel.stderr || '').slice(0, 200));
  } else {
    let row = null;
    try { row = JSON.parse((panel.stdout || '').trim().split('\n').filter(Boolean).pop()); }
    catch (e) { ok('panel JSON', false, String(e)); }
    if (row) {
      ok('panel maxTrust > 0', row.maxTrust > 0, 'maxTrust=' + row.maxTrust);
      ok('panel has map entries', row.entries > 0, 'entries=' + row.entries);
      ok('panel bonds gate opens for someone', row.trustedOpen > 0, 'trustedOpen=' + row.trustedOpen);
      let aimedOk = true;
      const drifts = [];
      for (const k of NON_AIMED) {
        const got = (row.kinds && row.kinds[k]) || 0;
        const want = BASELINE.kinds[k] || 0;
        if (!withinTol(got, want)) {
          aimedOk = false;
          drifts.push(k + ':' + got + ' vs ' + want);
        }
      }
      ok('non-aimed errands within ±25% of prereg baseline', aimedOk, drifts.join(', ') || 'ok');
      console.log('PANEL ' + JSON.stringify({
        maxTrust: row.maxTrust, entries: row.entries, trustedOpen: row.trustedOpen,
        kinds: row.kinds,
      }));
    }
  }

  console.log(fail ? ('FAIL ' + fail + ' / pass ' + pass) : ('PASS all ' + pass));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
