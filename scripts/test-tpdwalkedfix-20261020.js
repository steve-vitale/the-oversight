// test-tpdwalkedfix-20261020 — proof test for the tablepathdriver walked-recorder
// fix (sim-tpdwalkedfix, 2026-10-20, flesh-out loop, axis scale-onramp,
// backlog #709).
//
// Usage: node scripts/test-tpdwalkedfix-20261020.js
//   No env vars. No game eval, no RNG, no network. Part A is a mock-Game
//   unit test; Part B-RED reads the committed corpus; Part B' compares
//   two rerun JSONs (old driver vs fixed driver, same base, identical
//   seeds) when present, and skips loud when absent.
//   Exit 0 = all green, 1 = failure (prints the failures).
//
// What it proves:
//  Part A (mock Game, REAL drainTable recorder — no game eval):
//    A1: the relay door's real transition (paths->conscript, the dark-
//        conscript divert in src/js/table.js tableStartPath L684-700) is
//        recorded as a walk: walked=[{path:'relay',branch:'dark'}], the
//        door event agrees, branchMargins.relay carries band/lean, and
//        the drain's later conscript->challenge->finals->done beats do
//        NOT double-record.
//    A2: the normal transition (paths->challenge) still records exactly
//        as before (feared/light) — and branchMargins keeps its exact old
//        shape for non-relay doors (6 ledger keys, no band/lean fields).
//    A3: a non-door transition (challenge->finals) never records a walk.
//  Part B-RED (no sims): the COMMITTED corpus is the pinned RED —
//    walked=[] on the 5 relay/dark wins with the old recorder, endRec.tb
//    relay/dark on all 5 (sim-wintrack-audit named next 1).
//  Part B' (old-vs-new, same base, identical seeds): the corpus was
//    generated on an older base (fd896c2ea) and game-code drift since
//    then moves trajectories, so corpus replay cannot isolate the fix.
//    The honest before/after runs the OLD and NEW drivers on the same
//    base: trajectory-neutrality (day-hashes identical old-vs-new — the
//    instrumentation is pure reads), RED (old driver still misses the
//    relay walk on the current base), GREEN = 5/5 walked=[relay/dark] +
//    branchMargins.relay with band/lean, DET-GATE = 7/7 non-relay runs
//    byte-identical (walked, branchMargins, doorEvents) old-vs-new.
'use strict';
const fs = require('fs');
const path = require('path');
const TPD = require('./policies/tablepathdriver');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function canon(o) {
  return JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v))
    ? Object.keys(v).sort().reduce((a, kk) => (a[kk] = v[kk], a), {}) : v);
}

// ---------------------------------------------------------------- Part A
// Mock Game whose chooseTableOption mirrors the ENGINE's real transitions
// (src/js/table.js — cited, not invented):
//   - tableStartPath L624:  T.path=pathId, T.phase='challenge'
//   - dark-conscript divert L684-700: relay with lean<0 -> T.phase='conscript'
//     (T.path already set — the door IS entered)
//   - conscript answer L607-611: 'conscript:no' -> T.phase='challenge'
function mockGame(mode) {
  const T = {
    phase: mode === 'midchallenge' ? 'challenge' : 'paths',
    path: mode === 'midchallenge' ? 'feared' : null,
    branch: mode === 'midchallenge' ? 'light' : null,
    beat: 0,
    tableChoices: { options: [] },
  };
  const G = {
    over: false,
    state: { scholar: { day: 95 } },
    _T: T,
    tableState() { return this._T; },
    tableEarnedPaths() {
      return [
        { id: 'relay', earned: true, why: 'Stage 2 with the relay office' },
        { id: 'feared', earned: true, why: 'might shown' },
      ];
    },
    tableBranch(pid) {
      if (pid === 'relay') {
        return { branch: 'dark', dark: 8, light: 1, notes: ['the relay edited more than it carried'], band: 'dark', lean: -48 };
      }
      return { branch: 'light', dark: 0, light: 3, notes: ['promises kept'] };
    },
    chooseTableOption(id) {
      const t = this._T;
      if (id === 'path:relay' && t.phase === 'paths') {
        t.path = 'relay'; t.branch = 'dark'; t.beat = 0;
        t.phase = 'conscript'; // dark-conscript divert (lean<0) — engine L684-700
        t.tableChoices.options = [{ id: 'conscript:no', label: 'Refuse' }, { id: 'conscript:yes', label: 'Take them' }];
      } else if (id === 'path:feared' && t.phase === 'paths') {
        t.path = 'feared'; t.branch = 'light'; t.beat = 0;
        t.phase = 'challenge'; // engine L624
        t.tableChoices.options = [{ id: 'beat:0', label: 'Beat 0' }];
      } else if (id === 'conscript:no' && t.phase === 'conscript') {
        t.phase = 'challenge'; t.beat = 0; // engine L607-611
        t.tableChoices.options = [{ id: 'beat:0', label: 'Beat 0' }];
      } else if (t.phase === 'challenge' && String(id).indexOf('beat:') === 0) {
        t.beat = parseInt(String(id).split(':')[1], 10) + 1;
        if (t.beat >= 2) { t.phase = 'finals'; t.tableChoices.options = [{ id: 'final:voice', label: 'Final' }]; }
        else t.tableChoices.options = [{ id: 'beat:1', label: 'Beat 1' }];
      } else if (id === 'final:voice' && t.phase === 'finals') {
        t.phase = 'done'; t.tableChoices.options = [];
      }
    },
  };
  G.state.scholar.tableChoices = T.tableChoices;
  if (mode === 'midchallenge') T.tableChoices.options = [{ id: 'beat:1', label: 'Beat 1' }];
  else T.tableChoices.options = [{ id: 'path:relay', label: 'Relay' }, { id: 'path:feared', label: 'Feared' }];
  return G;
}

// A1: the relay door's real transition records the walk, once.
{
  const G = mockGame('relay');
  const ctx = {};
  TPD.drainTable(G, ctx, { door: 'relay', trial: false });
  const tp = ctx._tablepathdriver;
  ok('A1 relay walked recorded', tp.walked.length === 1, `walked=${JSON.stringify(tp.walked)}`);
  const w = tp.walked[0] || {};
  ok('A1 relay walk shape', w.path === 'relay' && w.branch === 'dark' && w.door === 'path:relay' && w.fellBack === false,
    JSON.stringify(w));
  ok('A1 relay walk day matches door event',
    tp.doorEvents.length === 1 && tp.doorEvents[0].picked === 'path:relay' && w.day === tp.doorEvents[0].day,
    JSON.stringify(tp.doorEvents));
  ok('A1 relay finals recorded', tp.finalsEvents.length === 1 && tp.finalsEvents[0].path === 'relay',
    JSON.stringify(tp.finalsEvents));
  ok('A1 relay margin has band/lean', !!(tp.branchMargins && tp.branchMargins.relay &&
    tp.branchMargins.relay.band === 'dark' && tp.branchMargins.relay.lean === -48),
    JSON.stringify(tp.branchMargins && tp.branchMargins.relay));
  ok('A1 relay margins cover all 7 doors', tp.branchMargins && Object.keys(tp.branchMargins).length === 7,
    JSON.stringify(Object.keys(tp.branchMargins || {})));
  ok('A1 drain reached done (no stall)', G.tableState().phase === 'done', `phase=${G.tableState().phase}`);
}

// A2: the normal transition records exactly as before; non-relay margin
// shape byte-identical (6 ledger keys, no band/lean).
{
  const G = mockGame('feared');
  const ctx = {};
  TPD.drainTable(G, ctx, { door: 'feared', trial: false });
  const tp = ctx._tablepathdriver;
  ok('A2 feared walked recorded', tp.walked.length === 1 && tp.walked[0].path === 'feared' && tp.walked[0].branch === 'light',
    JSON.stringify(tp.walked));
  const keys = Object.keys(tp.branchMargins || {});
  ok('A2 margin keys unchanged (6 ledger doors)', keys.length === 6 &&
    ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant'].every(k => keys.indexOf(k) >= 0),
    JSON.stringify(keys));
  ok('A2 no relay key on non-relay walk', !tp.branchMargins.relay, 'relay key leaked into a non-relay walk');
  const shaped = Object.keys(tp.branchMargins || {}).every(k => {
    const r = tp.branchMargins[k];
    return canon(Object.keys(r).sort()) === canon(['branch', 'dark', 'light', 'notes']);
  });
  ok('A2 margin record shape unchanged', shaped, 'a margin record gained/lost fields');
}

// A3: a non-door transition never records a walk.
{
  const G = mockGame('midchallenge');
  const ctx = {};
  TPD.drainTable(G, ctx, { door: 'feared', trial: false });
  const tp = ctx._tablepathdriver;
  ok('A3 challenge->finals records no walk', tp.walked.length === 0, `walked=${JSON.stringify(tp.walked)}`);
  ok('A3 challenge beats still drain', tp.finalsEvents.length === 1, `finals=${JSON.stringify(tp.finalsEvents)}`);
}

// ---------------------------------------------------------------- Part B
// B-RED (no sims, always runs): the COMMITTED corpus is the pinned RED —
// walked=[] on the 5 relay/dark wins with the old recorder, endRec.tb
// relay/dark on all 5 (sim-wintrack-audit named next 1).
{
  const repo = path.resolve(__dirname, '..');
  const corpusDir = path.join(repo, 'evidence', '2026-10-20', 'perseed-tablepathdriver');
  const corpus = (pol, seed) => JSON.parse(fs.readFileSync(path.join(corpusDir, pol, `s${seed}.json`), 'utf8'));
  const relaySeeds = [
    ['belongfeast', 64203], ['leadfeast', 64203], ['leadfeast', 64204], ['leadfeast', 64206], ['leadfeast', 64208],
  ];
  let redOk = true;
  for (const [pol, seed] of relaySeeds) {
    const c = corpus(pol, seed);
    const w = ((c.tpdSummary || {}).walked || []);
    const tb = ((c.endRec || {}).tb) || {};
    if (!(w.length === 0)) { redOk = false; console.log(`  RED-BASELINE broken: ${pol} s${seed} corpus walked=${JSON.stringify(w)}`); }
    if (!(tb.path === 'relay' && tb.branch === 'dark')) { redOk = false; console.log(`  RED-BASELINE broken: ${pol} s${seed} endRec.tb=${JSON.stringify(tb)}`); }
  }
  ok('B-RED corpus baseline (walked=[] on 5/5 relay/dark wins)', redOk, 'committed corpus does not match the pinned RED');
}

// B' (old-vs-new on the CURRENT base, identical seeds): the corpus was
// generated on an older base (fd896c2ea) — game-code drift since then
// moves trajectories, so corpus replay cannot isolate the fix. The
// honest before/after runs the OLD and NEW drivers on the same base.
// Produces the two JSONs via (from the worktree):
//   cp scripts/policies/tablepathdriver.js ~/workspace/tpd-fixed-20261020.js
//   git show HEAD:scripts/policies/tablepathdriver.js > scripts/policies/tablepathdriver.js
//   OUTJSON=~/workspace/tpdwalkedfix-oldruns.json <substrate env> node ~/workspace/tpdwalkedfix-rerun.js
//   cp ~/workspace/tpd-fixed-20261020.js scripts/policies/tablepathdriver.js
//   OUTJSON=~/workspace/tpdwalkedfix-newruns.json <substrate env> node ~/workspace/tpdwalkedfix-rerun.js
// Skip-loud when the JSONs are absent (Part A + B-RED still run).
{
  const oldP = '/home/hatch/workspace/tpdwalkedfix-oldruns.json';
  const newP = '/home/hatch/workspace/tpdwalkedfix-newruns.json';
  if (!fs.existsSync(oldP) || !fs.existsSync(newP)) {
    console.log("PART B' SKIPPED-LOUD: tpdwalkedfix-oldruns.json / tpdwalkedfix-newruns.json absent (run the two reruns per the header)");
  } else {
    const oldR = JSON.parse(fs.readFileSync(oldP, 'utf8'));
    const newR = JSON.parse(fs.readFileSync(newP, 'utf8'));
    const byKey = (arr) => { const m = {}; for (const r of arr) m[r.pol + ' s' + r.seed] = r; return m; };
    const O = byKey(oldR), N = byKey(newR);
    const relayKeys = ['belongfeast s64203', 'leadfeast s64203', 'leadfeast s64204', 'leadfeast s64206', 'leadfeast s64208'];
    const nonRelayKeys = ['belongfeast s64201', 'belongfeast s64202', 'belongfeast s64206', 'belongfeast s64208',
      'leadfeast s64202', 'leadfeast s64205', 'leadfeast s64207'];
    ok("B' same 12 seeds both sides", relayKeys.concat(nonRelayKeys).every(k => O[k] && N[k]), 'seed sets differ');
    // Trajectory neutrality: the instrumentation is pure reads — day-hashes
    // must be identical old-vs-new on the same base.
    let hashOk = true;
    for (const k of relayKeys.concat(nonRelayKeys)) {
      if ((O[k].hashes || []).join('|') !== (N[k].hashes || []).join('|') || !(O[k].hashes || []).length) {
        hashOk = false; console.log(`  HASH-DRIFT ${k}: old=${(O[k].hashes || []).length}d new=${(N[k].hashes || []).length}d`);
      }
    }
    ok("B' DET hashes identical old-vs-new (instrumentation is pure reads)", hashOk, 'trajectories moved');
    // RED on the current base: old driver still misses the relay walk.
    let redNow = true;
    for (const k of relayKeys) {
      const w = (O[k].tpd.walked || []);
      if (!(O[k].endRecTb && O[k].endRecTb.path === 'relay' && w.length === 0)) {
        redNow = false; console.log(`  RED-NOW broken ${k}: won-path=${O[k].endRecTb && O[k].endRecTb.path} walked=${JSON.stringify(w)}`);
      }
    }
    ok("B' RED old driver misses relay walks on current base", redNow, 'old driver recorded a relay walk?!');
    // GREEN (GO = 5/5): new driver records walked=[relay/dark] + margins.
    let green = 0;
    for (const k of relayKeys) {
      const n = N[k], w = (n.tpd.walked || []);
      const de = (n.tpd.doorEvents || [])[0] || {};
      const m = (n.tpd.branchMargins || {}).relay;
      const tb = n.endRecTb || {};
      const good = w.length === 1 && w[0].path === 'relay' && w[0].branch === 'dark' &&
        w[0].door === 'path:relay' && w[0].fellBack === false && w[0].day === de.day &&
        de.picked === 'path:relay' && m && m.band === 'dark' && typeof m.lean === 'number' && m.lean <= -40 &&
        typeof m.dark === 'number' && typeof m.light === 'number' && Array.isArray(m.notes) &&
        tb.path === 'relay' && tb.branch === 'dark';
      if (good) green++;
      else console.log(`  GREEN miss ${k}: walked=${JSON.stringify(w)} margin=${JSON.stringify(m)} endRecTb=${JSON.stringify(tb)}`);
      ok(`B' GREEN ${k} walked=[relay/dark] + margin`, good, 'see line above');
    }
    // DET-GATE (GO = 7/7): non-relay runs byte-identical old-vs-new.
    for (const k of nonRelayKeys) {
      ok(`B' DET ${k} walked identical`, canon(O[k].tpd.walked) === canon(N[k].tpd.walked),
        `old=${canon(O[k].tpd.walked)} new=${canon(N[k].tpd.walked)}`);
      ok(`B' DET ${k} branchMargins identical`, canon(O[k].tpd.branchMargins) === canon(N[k].tpd.branchMargins),
        `old=${canon(O[k].tpd.branchMargins)} new=${canon(N[k].tpd.branchMargins)}`);
      ok(`B' DET ${k} doorEvents identical`, canon(O[k].tpd.doorEvents) === canon(N[k].tpd.doorEvents),
        `old=${canon(O[k].tpd.doorEvents)} new=${canon(N[k].tpd.doorEvents)}`);
    }
  }
}

console.log(fail === 0 ? `ALL GREEN (${pass}/${pass})` : `FAILURES: ${fail} (passed ${pass})`);
process.exit(fail === 0 ? 0 : 1);
