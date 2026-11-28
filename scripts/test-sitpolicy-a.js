#!/usr/bin/env node
// scripts/test-sitpolicy-a.js — proof test, arm sim-sitpolicy-a.
//
// Proves the sitting-policy measurement chain:
//   A. Fake-Game decision rules (no harness load): the frozen pick
//      rule (first option; conscript refused; trial never taken;
//      seat-taker picks the player character), the court mapping
//      per shape (unknown shape never answered), the delivery rule
//      (tribute only when payable >= 2; charter/feast on ready
//      alone; never twice), the bundle rule (only when the embassy
//      is bundle-blocked AND the pantry holds >= 16,000 kcal AND
//      the scholar is at Haven), the sit drive (null preview /
//      not-ready preview / ready preview / dead scholar), and the
//      drain loop (stall guard, live-fight break, blocked modal).
//   B. Staged-state delivery honesty on a LIVE loaded game (the
//      leg-2 staging): two living non-scholar wave-4 veterans —
//      tryDeliverCapstone delivers ok:true, records the capstone,
//      pays both veterans cleanly; a second call delivers nothing.
//      Scholar-veteran + 1 villager — NO attempt (the split).
//   C1. Driver live run + determinism (child processes, temp
//      dirs): seed 113601, 30d, twice — byte-identical rows,
//      complete snapshots, zero instrument errors, and ZERO sit
//      events in 30d (no sit before the day-90 floor — the
//      preview is null, so nothing is attempted).
//   C2. Live sit in two phases (in-process, no child): competent
//      verbatim plays seed 113301 to day ~95 (lesser seat day 38 on
//      the leg-1 band, announced day 90), then competent-sit takes
//      over for 10 days — the scholar sits on the first ready dawn,
//      a path is walked, the drain answers, the sitting resolves
//      (win or downgrade). This proves the takeSeat + drain path
//      end-to-end on a live game; a single-policy 150d run cannot
//      prove it, because the sit policy's own day-1 bundle buy-out
//      reshuffles the trajectory and the village may never earn the
//      seat at all (prereg §7 correction).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): staged
// veterans are a mid-run village's — two living wave-4 veterans
// — never a fresh un-geared solo scholar. The staging writes the
// ledger through the live state objects and reads it back through
// the live ladderCapstoneReady()/ladderDeliverCapstone() — the
// measurement chain is what's proved, not the ledger itself.
//
// Usage: node scripts/test-sitpolicy-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (child runs use temp OUTDIRs under
// /tmp, cleaned up after); prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const driver = require('./sitpolicy-driver-a');
const policy = require('./policies/competent-sit');
const { competent } = require('./policies/competent');
const { reconcileRow, analyzeRow } = require('./analyze-sitpolicy-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function fakeGame(overrides) {
  const g = {
    state: {
      scholar: { day: 95, tableChoices: null },
      village: { roster: ['p1', 'p2', 'p3'], pantryKcal: 20000 },
    },
    villagerId: 'p1',
    map: { px: 4, py: 4 },
    over: false, won: false,
    progState: () => ({ tableWaiting: true, tableDone: false, tableAnnounced: true }),
    getPerson: () => ({ dead: false }),
    pantryKcalLive: () => 20000,
  };
  return Object.assign(g, overrides || {});
}
function sitEvents(kind) {
  return policy.sitLogSlice().filter(e => e.kind === kind);
}

async function main() {
  // ---- A. Fake-Game decision rules ----
  console.log('A. fake-Game decision rules');
  // pickTableOption: first option, carve-outs.
  const tc = (ids) => ({ frame: 'the Table', options: ids.map(id => ({ id, label: 'opt ' + id })) });
  check('pick: first option by default',
    policy.pickTableOption(tc(['path:feared', 'path:beloved']), fakeGame()).id === 'path:feared');
  check('pick: conscript refused',
    policy.pickTableOption(tc(['conscript:yes', 'conscript:no']), fakeGame()).id === 'conscript:no');
  check('pick: conscript yes-only returns null (fail-closed)',
    policy.pickTableOption(tc(['conscript:yes']), fakeGame()) === null);
  check('pick: trial skipped for first non-trial option',
    policy.pickTableOption(tc(['beat:trial', 'beat:mercy']), fakeGame()).id === 'beat:mercy');
  check('pick: trial-only returns null (fail-closed)',
    policy.pickTableOption(tc(['beat:trial']), fakeGame()) === null);
  check('pick: seat-taker picks the player character',
    policy.pickTableOption(tc(['seat:p2', 'seat:p1']), fakeGame()).id === 'seat:p1');
  check('pick: seat-taker without own id picks first',
    policy.pickTableOption(tc(['seat:p2', 'seat:p3']), fakeGame()).id === 'seat:p2');

  // answerCourtBeat: per-shape mapping + unknown shape.
  const courtCalls = [];
  const courtGame = fakeGame({
    state: { scholar: { day: 60, tableChoices: null }, pendingNational: { shape: 'lead', villages: ['a', 'b'] } },
    answerNationalChoice: (how) => { courtCalls.push(how); return true; },
  });
  policy.resetSitLog();
  check('court: lead answered feast', policy.answerCourtBeat(courtGame) === 'feast');
  check('court: answer called once with feast', courtCalls.length === 1 && courtCalls[0] === 'feast');
  check('court: answer logged', sitEvents('court').length === 1 && sitEvents('court')[0].shape === 'lead');
  for (const [shape, how] of [['conquest', 'mercy'], ['belong', 'swear'], ['covenant', 'pact'], ['trade', 'sign']]) {
    const g = fakeGame({
      state: { scholar: { day: 60, tableChoices: null }, pendingNational: { shape, villages: [] } },
      answerNationalChoice: (h) => { courtCalls.push(h); return true; },
    });
    check(`court: ${shape} answered ${how}`, policy.answerCourtBeat(g) === how);
  }
  const unknownGame = fakeGame({
    state: { scholar: { day: 60, tableChoices: null }, pendingNational: { shape: 'mystery', villages: [] } },
    answerNationalChoice: (h) => { courtCalls.push(h); return true; },
  });
  const callsBefore = courtCalls.length;
  check('court: unknown shape not answered', policy.answerCourtBeat(unknownGame) === 'unknown-shape');
  check('court: unknown shape made no call', courtCalls.length === callsBefore);
  check('court: unknown shape logged', sitEvents('court-unknown').length === 1);
  check('court: no pending beat returns null',
    policy.answerCourtBeat(fakeGame({ state: { scholar: { day: 60, tableChoices: null } } })) === null);

  // tryDeliverCapstone: tribute / split / charter / twice.
  const reads = {
    military_tribute: { kind: 'military_tribute', ready: true, reason: 'ready', veterans: 2, payable: 2, need: 2 },
    trade_charter: { kind: 'trade_charter', ready: false, reason: 'no-sealed-charter', charteredLinks: 0, scale: 'village' },
    feast_embassy: { kind: 'feast_embassy', ready: false, reason: 'no-bundle-feast', stage: 3, needStage: 3, bundle: false },
  };
  const deliverCalls = [];
  const delGame = fakeGame({
    ladderCapstoneDelivered: () => null,
    ladderCapstoneReady: (kind) => reads[kind],
    ladderDeliverCapstone: (kind) => { deliverCalls.push(kind); return { ok: true, kind, reason: 'delivered', veterans: ['vA', 'vB'], names: ['A', 'B'] }; },
  });
  policy.resetSitLog();
  const dAttempt = policy.tryDeliverCapstone(delGame);
  check('deliver: tribute deliverable delivers ok', dAttempt && dAttempt.ok === true && dAttempt.capKind === 'military_tribute', JSON.stringify(dAttempt));
  check('deliver: attempt logged with veterans', sitEvents('deliver').length === 1 && sitEvents('deliver')[0].veterans.length === 2);
  const splitReads = JSON.parse(JSON.stringify(reads));
  splitReads.military_tribute.payable = 1;
  const splitGame = fakeGame({
    ladderCapstoneDelivered: () => null,
    ladderCapstoneReady: (kind) => splitReads[kind],
    ladderDeliverCapstone: (kind) => { deliverCalls.push(kind); return { ok: true, kind, reason: 'delivered' }; },
  });
  policy.resetSitLog();
  check('deliver: split (payable 1) attempts nothing', policy.tryDeliverCapstone(splitGame) === null);
  check('deliver: split logs nothing', policy.sitLogSlice().length === 0);
  const charterReads = JSON.parse(JSON.stringify(reads));
  charterReads.military_tribute = { kind: 'military_tribute', ready: false, reason: 'veterans-short', veterans: 1, payable: 1, need: 2 };
  charterReads.trade_charter = { kind: 'trade_charter', ready: true, reason: 'ready', charteredLinks: 1, scale: 'national' };
  const charterGame = fakeGame({
    ladderCapstoneDelivered: () => null,
    ladderCapstoneReady: (kind) => charterReads[kind],
    ladderDeliverCapstone: (kind) => { deliverCalls.push(kind); return { ok: true, kind, reason: 'delivered' }; },
  });
  policy.resetSitLog();
  const cAttempt = policy.tryDeliverCapstone(charterGame);
  check('deliver: charter ready delivers (no payment)', cAttempt && cAttempt.ok === true && cAttempt.capKind === 'trade_charter', JSON.stringify(cAttempt));
  const doneGame = fakeGame({
    ladderCapstoneDelivered: () => 'military_tribute',
    ladderCapstoneReady: (kind) => reads[kind],
    ladderDeliverCapstone: (kind) => { deliverCalls.push(kind); return { ok: true, kind, reason: 'delivered' }; },
  });
  policy.resetSitLog();
  check('deliver: already delivered attempts nothing', policy.tryDeliverCapstone(doneGame) === null);
  check('deliver: already delivered logs nothing', policy.sitLogSlice().length === 0);

  // tryBuyBundle: pantry gate, reason gate, Haven gate.
  const bundleReads = { kind: 'feast_embassy', ready: false, reason: 'no-bundle-feast', stage: 3, needStage: 3, bundle: false };
  const buyCalls = [];
  const bundleGame = fakeGame({
    ladderCapstoneReady: () => bundleReads,
    feastBundleBuyOut: () => { buyCalls.push(1); return { ok: true, why: 'The bundle is bought.', spent: 8000, bundleStage: 3 }; },
  });
  policy.resetSitLog();
  const bAttempt = policy.tryBuyBundle(bundleGame);
  check('bundle: pantry 20000 buys out ok', bAttempt && bAttempt.ok === true && bAttempt.spent === 8000, JSON.stringify(bAttempt));
  check('bundle: attempt logged with pantryBefore', sitEvents('bundle').length === 1 && sitEvents('bundle')[0].pantryBefore === 20000);
  const poorGame = fakeGame({
    ladderCapstoneReady: () => bundleReads,
    feastBundleBuyOut: () => { buyCalls.push(1); return { ok: true, why: 'The bundle is bought.', spent: 8000, bundleStage: 3 }; },
    pantryKcalLive: () => 10000,
  });
  policy.resetSitLog();
  check('bundle: pantry 10000 attempts nothing', policy.tryBuyBundle(poorGame) === null);
  check('bundle: pantry 10000 made no call', buyCalls.length === 1);
  const stageShortGame = fakeGame({
    ladderCapstoneReady: () => ({ kind: 'feast_embassy', ready: false, reason: 'stage-short', stage: 2, needStage: 3, bundle: false }),
    feastBundleBuyOut: () => { buyCalls.push(1); return { ok: true, why: 'The bundle is bought.', spent: 8000, bundleStage: 2 }; },
  });
  check('bundle: stage-short attempts nothing', policy.tryBuyBundle(stageShortGame) === null);
  const awayGame = fakeGame({
    map: { px: 0, py: 0 },
    ladderCapstoneReady: () => bundleReads,
    feastBundleBuyOut: () => { buyCalls.push(1); return { ok: true, why: 'The bundle is bought.', spent: 8000, bundleStage: 3 }; },
  });
  check('bundle: away from Haven attempts nothing', policy.tryBuyBundle(awayGame) === null);
  check('bundle: no further calls made', buyCalls.length === 1);

  // driveSeat: null / not-ready / ready / dead scholar.
  const chooseCalls = [];
  const seatGame = fakeGame({
    tablePreview: () => ({ seat: 'lesser', ready: true, why: '', fullReady: false }),
    tableTakeSeat: () => {
      seatGame.state.scholar.tableChoices = { frame: 'the Table', options: [{ id: 'path:feared', label: 'Walk the path of the Feared' }] };
      return { ok: true, msg: '' };
    },
    chooseTableOption: (id) => { chooseCalls.push(id); seatGame.state.scholar.tableChoices = null; },
  });
  policy.resetSitLog();
  const sitRes = policy.driveSeat(seatGame, {});
  check('sit: ready preview sits ok', sitRes && sitRes.ok === true && sitRes.seat === 'lesser', JSON.stringify(sitRes));
  check('sit: sit-ok logged', sitEvents('sit-ok').length === 1);
  check('sit: drain answered the path modal', chooseCalls.length === 1 && chooseCalls[0] === 'path:feared');
  check('sit: drain-answer logged the path', sitEvents('drain-answer').length === 1 && sitEvents('drain-answer')[0].path === 'feared');
  const nullGame = fakeGame({ tablePreview: () => null, tableTakeSeat: () => { chooseCalls.push('TAKE'); return { ok: true }; } });
  policy.resetSitLog();
  check('sit: null preview (before day 90) attempts nothing', policy.driveSeat(nullGame, {}) === null);
  check('sit: null preview made no takeSeat call', chooseCalls.length === 1);
  const notReadyGame = fakeGame({
    tablePreview: () => ({ seat: 'lesser', ready: false, why: 'Finish the current contest before taking your seat.', fullReady: false }),
    tableTakeSeat: () => { chooseCalls.push('TAKE'); return { ok: true }; },
  });
  policy.resetSitLog();
  check('sit: not-ready preview attempts nothing', policy.driveSeat(notReadyGame, {}) === null);
  check('sit: not-ready preview logged with why', sitEvents('preview').length === 1 && sitEvents('preview')[0].why.indexOf('contest') >= 0);
  check('sit: not-ready made no takeSeat call', chooseCalls.length === 1);
  const deadGame = fakeGame({
    getPerson: () => ({ dead: true }),
    tablePreview: () => ({ seat: 'lesser', ready: true, why: '', fullReady: false }),
    tableTakeSeat: () => { chooseCalls.push('TAKE'); return { ok: true }; },
  });
  policy.resetSitLog();
  check('sit: dead scholar attempts nothing', policy.driveSeat(deadGame, {}) === null);
  check('sit: dead scholar logged sit-no-scholar', sitEvents('sit-no-scholar').length === 1);
  check('sit: dead scholar made no takeSeat call', chooseCalls.length === 1);

  // drainTableChoices: stall guard + live-fight break.
  const stallGame = fakeGame({
    state: { scholar: { day: 95, tableChoices: { frame: 'the Table', options: [{ id: 'path:feared', label: 'x' }] } } },
    chooseTableOption: () => {},
  });
  policy.resetSitLog();
  let stallCalls = 0;
  stallGame.chooseTableOption = () => { stallCalls++; /* modal never changes */ };
  policy.drainTableChoices(stallGame, {});
  check('drain: stall guard stops after 2 same-modal answers', stallCalls === 2, 'calls=' + stallCalls);
  const fightGame = fakeGame({
    tbfight: { over: false },
    state: { scholar: { day: 95, tableChoices: { frame: 'challenge', options: [{ id: 'beat:mercy', label: 'x' }] } } },
    chooseTableOption: () => { stallCalls++; },
  });
  const callsBeforeFight = stallCalls;
  policy.drainTableChoices(fightGame, {});
  check('drain: live tbfight answers nothing', stallCalls === callsBeforeFight);

  // ---- B. Staged-state delivery honesty (live game) ----
  console.log('B. live staged delivery');
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'sitpolicy-unit' });
  check('harness loads', !loadFails || loadFails.length === 0, JSON.stringify(loadFails || []));
  await quietLog(async () => { await setupGame(Game); });
  policy.resetSitLog();
  let attempt = policy.tryDeliverCapstone(Game);
  check('fresh village: no delivery attempt', attempt === null, JSON.stringify(attempt));
  check('fresh village: sit log empty', policy.sitLogSlice().length === 0, 'n=' + policy.sitLogSlice().length);
  const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []).filter(v => v !== Game.villagerId);
  check('roster has 2+ non-scholar villagers to stage', roster.length >= 2, 'roster=' + roster.length);
  const vA = roster[0], vB = roster[1];
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ by: vA, w: 4, d: 40 }, { by: vB, w: 4, d: 41 });
  const readBefore = Game.ladderCapstoneReady('military_tribute');
  check('staged tribute deliverable before the call', readBefore && readBefore.ready === true && (readBefore.payable | 0) >= 2, JSON.stringify(readBefore));
  attempt = policy.tryDeliverCapstone(Game);
  check('staged tribute: delivery returns ok:true', attempt && attempt.ok === true, JSON.stringify(attempt));
  check('staged tribute: attempt is the tribute kind', attempt && attempt.capKind === 'military_tribute', JSON.stringify(attempt));
  check('staged tribute: attempt logged with the paid veterans', attempt && Array.isArray(attempt.veterans) && attempt.veterans.length === 2, JSON.stringify(attempt));
  const pg = Game.progState();
  check('staged tribute: pg.ladderCapstone recorded', pg && pg.ladderCapstone === 'military_tribute', 'capstone=' + (pg && pg.ladderCapstone));
  const rosterAfter = ((Game.state && Game.state.village && Game.state.village.roster) || []);
  check('staged tribute: both veterans off the roster (payment landed)', rosterAfter.indexOf(vA) < 0 && rosterAfter.indexOf(vB) < 0,
    `vA on roster=${rosterAfter.indexOf(vA) >= 0} vB on roster=${rosterAfter.indexOf(vB) >= 0}`);
  check('staged tribute: driver paymentVerified reads true', driver.paymentVerified(Game) === true);
  check('staged tribute: snapshot delivered reads military_tribute', driver.snap(Game, 0).delivered === 'military_tribute');
  const second = policy.tryDeliverCapstone(Game);
  check('second call: no delivery (already delivered)', second === null, JSON.stringify(second));
  check('second call: deliver log still has exactly 1 entry', sitEvents('deliver').length === 1, 'n=' + sitEvents('deliver').length);

  const { Game: Game2 } = await loadGame({ seed: 8, mode: 'sitpolicy-unit2' });
  await quietLog(async () => { await setupGame(Game2); });
  policy.resetSitLog();
  const roster2 = ((Game2.state && Game2.state.village && Game2.state.village.roster) || []).filter(v => v !== Game2.villagerId);
  check('split village: roster has 1+ non-scholar villager', roster2.length >= 1, 'roster=' + roster2.length);
  Game2.state.waveKillLog = Game2.state.waveKillLog || [];
  Game2.state.waveKillLog.push({ by: Game2.villagerId, w: 4, d: 40 }, { by: roster2[0], w: 4, d: 41 });
  const readSplit = Game2.ladderCapstoneReady('military_tribute');
  check('split staging ready but payable 1', readSplit && readSplit.ready === true && readSplit.payable === 1, JSON.stringify(readSplit));
  const splitAttempt = policy.tryDeliverCapstone(Game2);
  check('split staging: NO delivery attempt (not deliverable)', splitAttempt === null, JSON.stringify(splitAttempt));
  check('split staging: sit log empty', policy.sitLogSlice().length === 0, 'n=' + policy.sitLogSlice().length);
  check('split staging: delivered stays null', Game2.ladderCapstoneDelivered() === null);

  // ---- C1+C2. Driver live runs (child processes, temp dirs) ----
  console.log('C. driver live runs');
  const tmpA = '/tmp/sitpolicy-proof-a';
  const tmpB = '/tmp/sitpolicy-proof-b';
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
  const runChild = (outdir, seed, days) => {
    execFileSync('node', [path.join(REPO, 'scripts', 'sitpolicy-driver-a.js'), '--one', String(seed)],
      { cwd: REPO, env: Object.assign({}, process.env, { DAYS: String(days), OUTDIR: outdir, SEEDS: String(seed) }), stdio: 'pipe', timeout: 900000 });
  };
  // C1: 30d determinism on the fresh band's first seed.
  let rowA = null, rowB = null, bytesA = null, bytesB = null;
  try {
    runChild(tmpA, 113601, 30);
    bytesA = fs.readFileSync(path.join(tmpA, 's113601.json'));
    rowA = JSON.parse(bytesA.toString('utf8'));
    runChild(tmpB, 113601, 30);
    bytesB = fs.readFileSync(path.join(tmpB, 's113601.json'));
    rowB = JSON.parse(bytesB.toString('utf8'));
  } catch (e) {
    check('driver --one runs (30d)', false, String((e && e.message) || e).slice(0, 200));
  }
  if (rowA) {
    check('driver row has snapshots', Array.isArray(rowA.snapshots) && rowA.snapshots.length >= 25, 'n=' + (rowA.snapshots || []).length);
    const complete = (rowA.snapshots || []).filter(x => x.readiness && !x.readinessError).length;
    check('every snapshot carries complete readiness', complete === (rowA.snapshots || []).length, `complete=${complete}/${(rowA.snapshots || []).length}`);
    check('no readiness errors', (rowA.readinessErrors | 0) === 0, 'readinessErrors=' + rowA.readinessErrors);
    check('no gate errors', (rowA.gateErrors | 0) === 0, 'gateErrors=' + rowA.gateErrors);
    check('no driver errors', (rowA.errors || []).length === 0, JSON.stringify(rowA.errors || []));
    // The bundle fires on day 1 on this fat-pantry seed (47,250 kcal)
    // and the feast delivers once the ladder reaches stage 3 (day 28)
    // — the frozen rule working as written (prereg §7 correction).
    // This is the EXPECTED behavior, not a leak: the tribute's first
    // ready day (94 on the old band) is a different deed.
    check('bundle bought once in 30d (day 1)', (rowA.bundleAttempts || []).length === 1 && rowA.bundleAttempts[0].ok === true && rowA.bundleAttempts[0].day === 1, JSON.stringify(rowA.bundleAttempts || []));
    check('feast delivered once in 30d', (rowA.deliveryAttempts || []).length === 1 && rowA.deliveryAttempts[0].ok === true && rowA.deliveryAttempts[0].capKind === 'feast_embassy', JSON.stringify(rowA.deliveryAttempts || []));
    check('delivered reads feast_embassy in 30d', rowA.end.delivered === 'feast_embassy', 'delivered=' + rowA.end.delivered);
    check('paymentVerified null for a no-payment delivery', rowA.paymentVerified === null, 'paymentVerified=' + rowA.paymentVerified);
    const sitKinds = (rowA.sitEvents || []).filter(e => ['preview', 'sit-ok', 'sit-failed', 'sit-error', 'sit-no-scholar', 'sit-guard', 'drain-answer', 'drain-blocked', 'drain-error', 'wait'].includes(e.kind));
    check('ZERO sit/drain/wait events in 30d (no sit before the day-90 floor)', sitKinds.length === 0, JSON.stringify(sitKinds.slice(0, 3)));
    check('not seated in 30d', rowA.seated === false, 'seated=' + rowA.seated);
    const rec = reconcileRow(rowA);
    check('analyzer reconciliation empty', rec.length === 0, JSON.stringify(rec).slice(0, 400));
    const an = analyzeRow(rowA);
    check('analyzer reads the row', an && an.seed === 113601 && Array.isArray(an.deliveryAttempts), 'seed=' + (an && an.seed));
    console.log(`  INFO live 30d: days=${rowA.days} endReason=${rowA.endReason} finalSeat=${rowA.end.seat} readyDays=${JSON.stringify(rowA.readyDays)}`);
  }
  if (bytesA && bytesB) {
    check('determinism: same seed twice byte-identical', bytesA.equals(bytesB), `lenA=${bytesA.length} lenB=${bytesB.length}`);
  } else {
    check('determinism: same seed twice byte-identical', false, 'missing row bytes');
  }
  // C2: live sit in two phases (in-process).
  console.log('C2. two-phase live sit');
  const { Game: Game3 } = await loadGame({ seed: 113301, mode: 'sitpolicy-unit3' });
  await quietLog(async () => { await setupGame(Game3); });
  const res1 = await quietLog(async () => runDays(Game3, competent, { days: 95, manifest: undefined, sampleEvery: 1 }));
  const dayAfter1 = (Game3.state && Game3.state.scholar && Game3.state.scholar.day) || 0;
  check('two-phase: competent phase runs 95 days without ending', !Game3.over && (res1.days | 0) >= 90, `days=${res1.days} over=${Game3.over} gameDay=${dayAfter1}`);
  check('two-phase: game day past the 90 floor', dayAfter1 >= 90, 'gameDay=' + dayAfter1);
  const seatAfter1 = (typeof Game3.tableSeat === 'function') ? Game3.tableSeat() : null;
  check('two-phase: lesser seat priced after competent phase', seatAfter1 && (seatAfter1.seat === 'lesser' || seatAfter1.seat === 'full'), JSON.stringify(seatAfter1 && seatAfter1.seat));
  const pg3 = (typeof Game3.progState === 'function') ? Game3.progState() : {};
  check('two-phase: table waiting after competent phase', pg3.tableWaiting === true, 'tableWaiting=' + pg3.tableWaiting);
  policy.resetSitLog();
  const res2 = await quietLog(async () => runDays(Game3, policy.competentSit, { days: 10, manifest: undefined, sampleEvery: 1 }));
  const sitOk2 = sitEvents('sit-ok');
  const drain2 = sitEvents('drain-answer');
  const pg3b = (typeof Game3.progState === 'function') ? Game3.progState() : {};
  check('two-phase: sit policy ran 10 days', (res2.days | 0) >= 1, `days=${res2.days} over=${Game3.over} won=${Game3.won}`);
  check('two-phase: scholar sat (sit-ok logged)', sitOk2.length >= 1, JSON.stringify(sitOk2.slice(0, 2)));
  check('two-phase: sit was at the lesser seat', sitOk2.length >= 1 && sitOk2[0].seat === 'lesser', JSON.stringify(sitOk2.slice(0, 1)));
  check('two-phase: tableDone set after the sit', pg3b.tableDone === true, 'tableDone=' + pg3b.tableDone);
  check('two-phase: drain answered at least once', drain2.length >= 1, 'drainAnswers=' + drain2.length);
  check('two-phase: a path was walked', drain2.some(e => e.path), JSON.stringify(drain2.filter(e => e.path).slice(0, 1)));
  check('two-phase: no sit/drain errors', sitEvents('sit-error').length === 0 && sitEvents('drain-error').length === 0 && sitEvents('drain-blocked').length === 0,
    JSON.stringify(policy.sitLogSlice().filter(e => /error|blocked/.test(e.kind)).slice(0, 3)));
  console.log(`  INFO live sit: won=${!!Game3.won} over=${!!Game3.over} seatDay=${(sitOk2[0] || {}).day} path=${(drain2.find(e => e.path) || {}).path} drainAnswers=${drain2.length}`);
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }

  console.log(`RESULT: ${passed} passed, ${failed} failed`);
  if (failed) { console.log('FAILURES: ' + fails.join('; ')); process.exit(1); }
}
main().catch(e => { console.error('PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
