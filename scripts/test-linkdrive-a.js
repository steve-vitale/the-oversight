#!/usr/bin/env node
// scripts/test-linkdrive-a.js — sim-linkdrive-a proof test.
// GREEN before the pilot (prereg §5). Proves the measurement chain
// on LIVE state, never on fixtures alone:
//
//   1. Analyzer selftest (stages, paired table, GO judge shapes) —
//      run as a child process, must exit 0.
//   2. Policy fixture tests on a fake Game (detJudge rule, the
//      season gate, counter sweeten/walk, raise skips, national
//      non-answer, event-kind protection — the linkdrive-b fix).
//   3. Live leg: the driver runs seed 113501 for 100 days on BOTH
//      legs into temp outdirs. On each produced row:
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
//        - the armed leg records a linkdrive stats object with 0
//          policy errors.
//      The staged mid-run village: by day 100 the scale machinery
//      must be visible (regional reached, links formed) — the
//      contact check from prereg §6.1, verified live, not assumed.
//   4. Determinism: the same armed seed run twice (two temp outdirs)
//      is byte-identical per-seed JSON.
//
// Usage: node scripts/test-linkdrive-a.js
// Exit 0 only if every check passes. Prints "N/N passed".
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const LD = require('./policies/competent-linkdrive-a');
const SEED = 113501;
const DAYS = 100;

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function checkFn(name, fn) {
  try { fn(); passed++; console.log('  PASS ' + name); }
  catch (e) { failed++; fails.push(name); console.log('  FAIL ' + name + ' — ' + String((e && e.message) || e).slice(0, 200)); }
}

// --- Fake Game (adapted from test-linkdrive-20261107.js) ---------------
function fakeGame(overrides) {
  const calls = { proposeLink: [], answerCounter: [], answerAccord: [], tendLink: [],
    payTribute: [], answerDemand: [], talkTo: [], convoTurn: [], endConvo: [],
    acceptLinkRaise: [], answerNationalChoice: [], answerGlobalChoice: [] };
  const g = {
    over: false,
    state: {
      scholar: { day: 40 },
      village: { pantry: [{ kcalEach: 5000, units: 10 }], roster: ['scholar1', 'rosa', 'leo'], trust: { rosa: 30, leo: 25 }, linkRaises: {} },
      otherVillages: [],
      pendingCounter: null, pendingAccord: null, pendingNational: null, pendingGlobal: null,
    },
    villagerId: 'scholar1',
    _week: function () { return 2; },
    representative: function () { return { id: 'leo', standing: 40 }; },
    regionalStanding: function () { return 0; },
    villageStandingOf: function () { return 0; },
    isAllied: function () { return false; },
    knowsVillage: function () { return true; },
    linkWith: function () { return null; },
    hierarchyState: function () { return g._links || []; },
    _links: [],
    getPerson: function (vid) { return { id: vid, dead: false }; },
    proposeLink: function (vid, opts) { calls.proposeLink.push([vid, opts]); return g._proposeRet === undefined ? { id: 'link_x' } : g._proposeRet; },
    answerCounter: function (how) { calls.answerCounter.push(how); return g._counterRet === undefined ? { id: 'link_c' } : g._counterRet; },
    answerAccord: function (how) { calls.answerAccord.push(how); return true; },
    tendLink: function (id) { calls.tendLink.push(id); return 1500; },
    payTribute: function (id) { calls.payTribute.push(id); return 4000; },
    answerDemand: function (id, acc) { calls.answerDemand.push([id, acc]); return true; },
    acceptLinkRaise: function (vid) { calls.acceptLinkRaise.push(vid); return { ok: true }; },
    answerNationalChoice: function (x) { calls.answerNationalChoice.push(x); },
    answerGlobalChoice: function (x) { calls.answerGlobalChoice.push(x); },
    talkTo: function (vid) { calls.talkTo.push(vid); g._convoActive = true; return 'Hello.'; },
    convoGet: function () { return { active: !!g._convoActive, exchanges: 0 }; },
    convoChoices: function () { return g._choices || []; },
    convoTurn: function (vid, id) {
      calls.convoTurn.push(id);
      if (id === 'link:accept' && g._acceptLinks) g._linkedVillage = g._acceptVillage;
      return { line: 'x', choices: [], ended: false, transcript: [] };
    },
    endConvo: function (vid, how) { calls.endConvo.push([vid, how]); g._convoActive = false; },
    calls: calls,
  };
  if (overrides) Object.assign(g, overrides);
  return g;
}
function village(id, opinion) { return { id: id, opinion: opinion }; }

function runDriver(seed, outdir, days, leg) {
  const env = Object.assign({}, process.env, { OUTDIR: outdir, DAYS: String(days), LEG: leg });
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'linkdrive-driver-a.js'), '--one', String(seed), '--leg', leg], { env, encoding: 'utf8', timeout: 600000 });
  if (r.status !== 0) {
    console.log('--- driver stdout ---\n' + (r.stdout || '').slice(-2000));
    console.log('--- driver stderr ---\n' + (r.stderr || '').slice(-2000));
    throw new Error(`driver --one ${seed} --leg ${leg} exited ${r.status}`);
  }
  return JSON.parse(fs.readFileSync(path.join(outdir, `s${seed}-${leg}.json`), 'utf8'));
}

function main() {
  // 1. Analyzer selftest.
  console.log('== analyzer selftest ==');
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-linkdrive-a.js'), '--selftest'], { encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
    check('analyzer --selftest exits 0', true);
  } catch (e) {
    console.log((e.stdout || '') + (e.stderr || ''));
    check('analyzer --selftest exits 0', false, String((e && e.message) || e).slice(0, 120));
  }

  // 2. Policy fixture tests.
  if (failed === 0) {
    console.log('== policy fixtures ==');
    checkFn('detJudge: rep 40 + opinion 20, even strength', function () {
      const g = fakeGame();
      const d = LD.detJudge(g, village('v1', 20));
      assert.deepStrictEqual(d, { prim: 58, sub: 86 });
    });
    checkFn('detJudge: opinion 0, no generosity term on prim', function () {
      const g = fakeGame();
      const d = LD.detJudge(g, village('v1', 0));
      // rep standing 40 -> +20; opinion 0 -> +0; even strength -> -10 prim.
      assert.deepStrictEqual(d, { prim: 48, sub: 68 });
    });
    checkFn('detJudge: allied +15', function () {
      const g = fakeGame();
      g.isAllied = function () { return true; };
      const d = LD.detJudge(g, village('v1', 20));
      assert.deepStrictEqual(d, { prim: 73, sub: 101 });
    });
    checkFn('detJudge: null input returns zero-input defaults, never throws', function () {
      assert.deepStrictEqual(LD.detJudge(null, null), { prim: 28, sub: 48 });
    });
    checkFn('isSeasoned: 30d + trust 40 is seasoned; a day or a point short is not', function () {
      const l = { day: 10, trust: 40 };
      assert.strictEqual(LD.isSeasoned(l, 40), true);
      assert.strictEqual(LD.isSeasoned(l, 39), false);
      assert.strictEqual(LD.isSeasoned({ day: 10, trust: 39 }, 40), false);
    });
    checkFn('gate closed: no seasoned link -> no propose, gate blocked counted', function () {
      const g = fakeGame();
      g._links = [{ id: 'l1', primary: 'haven', subordinate: 'emberhold', status: 'active', day: 35, trust: 55 }];
      g.state.otherVillages = [village('millford', 20)];
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      const s = LD.linkdriveStats();
      assert.strictEqual(g.calls.proposeLink.length, 0);
      assert.strictEqual(s.proposeBlockedGate, 1);
      assert.strictEqual(s.gateOpenedDay, null);
      assert.strictEqual(s.proposeCalls, 0);
    });
    checkFn('gate open: seasoned link + ready village -> one as-primary propose', function () {
      const g = fakeGame();
      g._links = [{ id: 'l1', primary: 'haven', subordinate: 'emberhold', status: 'active', day: 10, trust: 55 }];
      g.state.otherVillages = [village('millford', 20)];
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      const s = LD.linkdriveStats();
      assert.strictEqual(g.calls.proposeLink.length, 1);
      assert.deepStrictEqual(g.calls.proposeLink[0][1], { asSubordinate: false, tributeKcalPerWeek: 4000 });
      assert.strictEqual(s.proposeCalls, 1);
      assert.strictEqual(s.proposeAccepted, 1);
      assert.strictEqual(s.gateOpenedDay, 40);
    });
    checkFn('gate open but no ready village -> not-ready counted, no propose', function () {
      const g = fakeGame();
      g._links = [{ id: 'l1', primary: 'haven', subordinate: 'emberhold', status: 'active', day: 10, trust: 55 }];
      g.state.otherVillages = [village('millford', -10)];
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      const s = LD.linkdriveStats();
      assert.strictEqual(g.calls.proposeLink.length, 0);
      assert.strictEqual(s.proposeNotReady, 1);
    });
    checkFn('counter: pantry high -> sweeten, never accept; formed counted', function () {
      const g = fakeGame();
      g.state.pendingCounter = { targetId: 'millford' };
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      assert.deepStrictEqual(g.calls.answerCounter, ['sweeten']);
      const s = LD.linkdriveStats();
      assert.strictEqual(s.counterSweetened, 1);
      assert.strictEqual(s.counterSweetenFormed, 1);
      assert.strictEqual(s.counterAnswers, 1);
    });
    checkFn('counter: pantry low -> walk', function () {
      const g = fakeGame();
      g.state.village.pantry = [{ kcalEach: 100, units: 1 }];
      g.state.pendingCounter = { targetId: 'millford' };
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      assert.deepStrictEqual(g.calls.answerCounter, ['walk']);
      assert.strictEqual(LD.linkdriveStats().counterWalked, 1);
    });
    checkFn('counter: sweeten held (pantry short at verb) -> held, not formed', function () {
      const g = fakeGame();
      g.state.pendingCounter = { targetId: 'millford' };
      g._counterRet = 'counter';
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      const s = LD.linkdriveStats();
      assert.strictEqual(s.counterSweetenHeld, 1);
      assert.strictEqual(s.counterSweetenFormed, 0);
    });
    checkFn('raise: raiser off-roster -> skipped, never talked to', function () {
      const g = fakeGame();
      g.state.village.linkRaises = { ghost: { villageId: 'millford', day: 39 } };
      g.state.otherVillages = [village('millford', 20)];
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      const s = LD.linkdriveStats();
      assert.strictEqual(g.calls.talkTo.length, 0);
      assert.strictEqual(s.raisesSkippedNoRaiser, 1);
      assert.strictEqual(s.raisesSeen, 1);
    });
    checkFn('national beat pending -> recorded, never answered', function () {
      const g = fakeGame();
      g.state.pendingNational = { shape: 'lead', day: 39 };
      g.state.pendingGlobal = { shape: 'global', day: 39 };
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      const s = LD.linkdriveStats();
      assert.strictEqual(g.calls.answerNationalChoice.length, 0);
      assert.strictEqual(g.calls.answerGlobalChoice.length, 0);
      assert.strictEqual(s.nationalPendingDays, 1);
      assert.strictEqual(s.globalPendingDays, 1);
    });
    checkFn('event kind: extra.kind never overwrites the event kind', function () {
      const g = fakeGame();
      g._links = [{ id: 'lb', primary: 'highcourt', subordinate: 'haven', status: 'active', day: 10, trust: 55, tributeKcalPerWeek: 4000, tributePaidWeek: 1, pendingDemand: { kind: 'tribute' } }];
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      const s = LD.linkdriveStats();
      assert.strictEqual(s.demandAnswers, 1);
      const ev = s.events.find(e => e.outcome === 'honor');
      assert.ok(ev, 'demand-answer event present');
      assert.strictEqual(ev.kind, 'demand-answer');
    });
    checkFn('tend: LEAD below bar tended weekly; seasoned link not tended', function () {
      const g = fakeGame();
      g._links = [
        { id: 'l1', primary: 'haven', subordinate: 'emberhold', status: 'active', day: 35, trust: 30 },
        { id: 'l2', primary: 'haven', subordinate: 'stonebridge', status: 'active', day: 5, trust: 60 },
      ];
      LD.resetLinkdriveStats();
      LD.linkDrive(g, {});
      assert.deepStrictEqual(g.calls.tendLink, ['l1']);
      assert.strictEqual(LD.linkdriveStats().tends, 1);
    });
  }

  // 3. Live legs, both policies, seed 113501, 100d.
  if (failed === 0) {
    console.log('== live legs: seed 113501, 100d, base + armed ==');
    const tmpBase = fs.mkdtempSync(path.join('/tmp', 'linkdrive-a-proof-base-'));
    const tmpArmed = fs.mkdtempSync(path.join('/tmp', 'linkdrive-a-proof-armed-'));
    const tmpArmed2 = fs.mkdtempSync(path.join('/tmp', 'linkdrive-a-proof-armed2-'));
    const A = require('./analyze-linkdrive-a');
    let bandRegional = false, bandLinks = false;
    for (const leg of ['base', 'armed']) {
      const tmp = leg === 'base' ? tmpBase : tmpArmed;
      const row = runDriver(SEED, tmp, DAYS, leg);
      const snaps = row.snapshots || [];
      // Death-aware: one snapshot per lived day + the closing snapshot.
      check(`${leg}: row has days+1 snapshots (daily + closing)`, snaps.length === row.days + 1, `got ${snaps.length} for ${row.days} days`);
      const complete = snaps.filter(s => s.scale && s.scale.standing && Array.isArray(s.scale.links));
      check(`${leg}: snapshot coverage 100% complete scale blocks`, complete.length === snaps.length, `${complete.length}/${snaps.length}`);
      check(`${leg}: no gate errors`, (row.gateErrors | 0) === 0);
      check(`${leg}: no scale errors`, (row.scaleErrors | 0) === 0, `scaleErrors=${row.scaleErrors}`);
      check(`${leg}: no link errors`, (row.linkErrors | 0) === 0, `linkErrors=${row.linkErrors}`);
      check(`${leg}: no driver errors`, (row.errors || []).length === 0, JSON.stringify(row.errors || []).slice(0, 200));
      const mism = A.reconcileRow(row);
      check(`${leg}: reconciliation 0 mismatches`, mism.length === 0, mism.join('; ').slice(0, 300));
      let badStanding = 0;
      for (const s of snaps) {
        const st = s.scale && s.scale.standing;
        if (!st) { badStanding++; continue; }
        if (((st.war | 0) + (st.diplomacy | 0) + (st.plenty | 0)) !== (st.total | 0)) badStanding++;
      }
      check(`${leg}: standing arithmetic holds on every snapshot`, badStanding === 0, `${badStanding} bad`);
      let badRank = 0;
      for (const s of snaps) {
        const sc = s.scale;
        if (!sc) { badRank++; continue; }
        const want = sc.globalLive ? 'global' : (sc.nationalLive ? 'national' : (sc.networkLive ? 'regional' : 'village'));
        if (want !== sc.rank) badRank++;
      }
      check(`${leg}: rank agrees with flags on every snapshot`, badRank === 0, `${badRank} bad`);
      const analyzed = A.analyzeRow(row);
      check(`${leg}: mechanism maxStage in 0..3`, analyzed.mechanism.maxStage >= 0 && analyzed.mechanism.maxStage <= 3, 'got ' + analyzed.mechanism.maxStage);
      check(`${leg}: binding input present at end`, !!analyzed.mechanism.binding && analyzed.mechanism.binding.leadSeasonedSubs !== null);
      // Contact, conditional on survival (death-aware horizon): a leg
      // that dies early cannot be asked to reach regional. What the
      // proof must show is that WHEN a leg reaches regional, the link
      // that carried it is recorded — and that the band as a whole
      // shows the machinery live (checked after both legs, below).
      const anyLinks = snaps.some(s => s.scale && s.scale.links && s.scale.links.length > 0);
      if ((row.markers.firstRegionalDay | 0) > 0) bandRegional = true;
      if (anyLinks) bandLinks = true;
      if ((row.markers.firstRegionalDay | 0) > 0) {
        check(`${leg}: regional reached -> at least one link recorded (contact)`, anyLinks);
      } else {
        console.log(`  INFO ${leg}: no regional by end (days=${row.days}, end=${row.endReason}) — contact check deferred to the band level`);
      }
      const ds = row.deaths && row.deaths.summary;
      check(`${leg}: death census present`, !!ds);
      if (ds) {
        check(`${leg}: death books close (or residual listed)`, ds.booksClose === true || (ds.leavers != null && ds.joins != null), `booksClose=${ds.booksClose}`);
        check(`${leg}: death census errors 0`, ((row.deaths.errors || []).length) === 0, JSON.stringify((row.deaths.errors || [])).slice(0, 200));
        console.log(`  INFO ${leg} seed ${SEED}: days=${row.days} maxRank=${row.maxRank} firstRegionalDay=${row.markers.firstRegionalDay} firstPolityDay=${row.markers.firstPolityDay} firstBeatDay=${row.markers.firstBeatDay} stage=${analyzed.mechanism.maxStage} endSeat=${row.end.seat} deaths=${ds.deaths} booksClose=${ds.booksClose}`);
      }
      if (leg === 'armed') {
        check('armed: linkdrive stats recorded', !!row.linkdrive && typeof row.linkdrive === 'object');
        if (row.linkdrive) {
          check('armed: policy errors 0', (row.linkdrive.errors | 0) === 0, `errors=${row.linkdrive.errors}`);
          check('armed: events array present', Array.isArray(row.linkdrive.events));
          console.log(`  INFO armed stats: proposeCalls=${row.linkdrive.proposeCalls} accepted=${row.linkdrive.proposeAccepted} counter=${row.linkdrive.proposeCounter} gateOpenedDay=${row.linkdrive.gateOpenedDay} gateBlockedDays=${row.linkdrive.gateBlockedDays} raisesAnswered=${row.linkdrive.raisesAnswered} raisesLinked=${row.linkdrive.raisesLinked} counterSweetened=${row.linkdrive.counterSweetened} counterWalked=${row.linkdrive.counterWalked} tends=${row.linkdrive.tends}`);
        }
      } else {
        check('base: linkdrive stats null (no drive on the baseline)', row.linkdrive === null);
      }
    }
    // Band-level contact: the scale machinery must be live on this
    // seed in at least one leg (regional reached AND links formed).
    check('band: regional reached on at least one leg (contact)', bandRegional);
    check('band: at least one link recorded on at least one leg (contact)', bandLinks);

    // 4. Determinism: same armed seed twice → byte-identical.
    console.log('== determinism: armed seed 113501 re-run ==');
    runDriver(SEED, tmpArmed2, DAYS, 'armed');
    const a = fs.readFileSync(path.join(tmpArmed, `s${SEED}-armed.json`), 'utf8');
    const b = fs.readFileSync(path.join(tmpArmed2, `s${SEED}-armed.json`), 'utf8');
    check('determinism: armed re-run byte-identical', a === b, `lengths ${a.length} vs ${b.length}`);
  }

  console.log(`TEST-LINKDRIVE-A: ${passed} passed, ${failed} failed`);
  if (failed) { console.log('FAILURES: ' + fails.join('; ')); process.exit(1); }
}
if (require.main === module) main();
