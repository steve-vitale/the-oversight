// test-linkform-b-20261124.js — proof for arm sim-linkform-b.
// Fixture tests over the stage classifier (S0–S5, provenance,
// prereg-vs-OR second-raise definition, orphan / irreconcilable
// detection, reproduction-mismatch detection, merge integrity)
// plus live harness legs: both instruments install cleanly with
// zero errors, and a 12-day ON-vs-ON-vs-OFF determinism /
// neutrality miniature on seed 109310.
// Usage: node scripts/test-linkform-b-20261124.js
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'linkform-b-analyze-20261124'));
const DRIVER = require(path.join(REPO, 'scripts', 'linkform-b-driver-20261124'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const HAVEN_INST = require(path.join(REPO, 'scripts', 'havenlink-b-instrument-20261124'));
const SL_INST = require(path.join(REPO, 'scripts', 'secondlink-instrument-20261110'));

let pass = 0;
let total = 0;
function ok(name, fn) {
  total++;
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + e.message); process.exitCode = 1; }
}
async function aok(name, fn) {
  total++;
  try { await fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.stack || e)); process.exitCode = 1; }
}

// --- fixture builders ---
// Standing-shaped link row (merged `daily`): {key, kind, status,
// seasoned, regionalPlus, counts, ...} — NO `other`.
function stLink(vid, day, seasoned, counts) {
  return { key: 'null|haven|' + vid, kind: null, status: 'active', day: day,
    trust: seasoned ? 55 : 32, seasoned: !!seasoned, regionalPlus: false,
    counts: !!counts, tributePaidWeek: null };
}
// Secondlink-shaped link row (secondlinkDaily): active-only, has `other`.
function slLink(vid, day, seasoned) {
  return { key: vid + '|null|haven>' + vid + '|:', other: vid, kind: null,
    primary: 'haven', subordinate: vid, a: null, b: null, age: 0,
    trust: seasoned ? 55 : 32, conquered: false, status: 'active',
    seasoned: !!seasoned, regional: false, reason: seasoned ? 'counts' : 'too-young' };
}
function raiser(vid) {
  return { vid: vid, alive: true, isScholar: false, trust: 30, buildStanding: 2,
    lore: ['village_0', 'village_1'], unlinkedKnown: ['village_1'], cooldown: [],
    hasPending: false, talkBlocked: false, gates: [], eligible: true };
}
// opts: firstLinkDay, firstLinkOther, secondLinkDay (2nd active link),
// seasonedFromDay, polityFromDay, fp (foreign polity {primary, primaryName,
// subs, subsNames, firstDay}), stagings [{vid, villageId, day, fate, decisionDay}],
// gated199Days [days], ladderCrossDay, linkEvents, proposeCalls, acceptCalls,
// counterEvents, nationalEvents.
function mkOut(o) {
  o = o || {};
  const seed = o.seed || 109310;
  const lastDay = o.lastDay || 60;
  const firstDay = o.firstLinkDay || null;
  const firstOther = o.firstLinkOther || 'village_0';
  const secondDay = o.secondLinkDay || null;
  const secondOther = o.secondLinkOther || 'village_1';
  const seasonedFrom = o.seasonedFromDay || null;
  const polityFrom = o.polityFromDay || null;
  const fp = o.fp || null;
  const ladderCross = o.ladderCrossDay || firstDay;
  const stagings = o.stagings || [];
  const daily = [];
  const slDaily = [];
  for (let d = 1; d <= lastDay; d++) {
    const hasFirst = firstDay != null && d >= firstDay;
    const hasSecond = secondDay != null && d >= secondDay;
    const seasoned = seasonedFrom != null && d >= seasonedFrom;
    const linksSt = [];
    if (hasFirst) linksSt.push(stLink(firstOther, firstDay, seasoned, false));
    if (hasSecond) linksSt.push(stLink(secondOther, secondDay, false, false));
    const linksSl = [];
    if (hasFirst) linksSl.push(slLink(firstOther, firstDay, seasoned));
    if (hasSecond) linksSl.push(slLink(secondOther, secondDay, false));
    const havenLinks = [];
    if (hasFirst) havenLinks.push({ other: firstOther, otherName: 'Emberhold', kind: null,
      status: 'active', day: firstDay, trust: seasoned ? 55 : 32, age: d - firstDay,
      seasoned: seasoned, role: 'primary', tributeKcalPerWeek: 4000, arrears: 0,
      goodStanding: seasoned, belongGap: { trust: seasoned, arrears: true, age: d - firstDay >= 14, size: false },
      isForeignPrimary: false,
      foreignPolityOfOther: (fp && fp.subs.indexOf(firstOther) !== -1)
        ? { primary: fp.primary, subs: fp.subs.slice(), size: fp.subs.length + 1, day: fp.firstDay } : null });
    if (hasSecond) havenLinks.push({ other: secondOther, otherName: 'Stonebridge', kind: null,
      status: 'active', day: secondDay, trust: 32, age: d - secondDay,
      seasoned: false, role: 'primary', tributeKcalPerWeek: 4000, arrears: 0,
      goodStanding: false, belongGap: { trust: false, arrears: true, age: false, size: false },
      isForeignPrimary: false, foreignPolityOfOther: null });
    const fps = (fp && d >= fp.firstDay) ? [{ primary: fp.primary, primaryName: fp.primaryName,
      subs: fp.subs.slice(), subsNames: fp.subsNames.slice(), day: fp.firstDay,
      size: fp.subs.length + 1 }] : [];
    const stage = (ladderCross != null && d >= ladderCross) ? 3 : (d >= 10 ? 2 : 1);
    const pendingRaises = stagings.filter(function (s) { return s.day === d; })
      .map(function (s) { return { vid: s.vid, villageId: s.villageId, day: s.day, line: 'raise line' }; });
    daily.push({ day: d, scholarId: 'scholar_1', standing: null, capped: 150,
      peak: 0, readiness5: { ready: false, short: ['veterans'] }, readiness4: { ready: true },
      gatedTotal: (o.gated199Days || []).indexOf(d) !== -1 ? 199 : 150, holdKind: 'none',
      deferralMismatch: false, links: linksSt, feasts: [],
      ladder: { total: 45, counted: 40, stage: stage },
      w4faced: 0, w5faced: 0, veteranVids: [], veteranMismatch: false,
      havenLinks: havenLinks, foreignPolitiesFull: fps,
      pendingNational: null, nationalLive: false, scaleRefused: false, belongPolity: null,
      pendingAccord: null });
    const raiseState = [];
    stagings.filter(function (s) { return s.decisionDay === d; }).forEach(function (s) {
      const k = [s.vid, s.villageId].sort().join('|');
      raiseState.push({ key: k, day: s.decisionDay, outcome: s.fate });
    });
    slDaily.push({ day: d, scholarId: 'scholar_1', standing: 150, scaleRank: 'regional',
      polity: (polityFrom != null && d >= polityFrom) ? { shape: 'lead', size: 4, villages: ['village_0', 'village_1', 'village_2'] } : null,
      pending: { counter: false, accord: false, national: false, global: false },
      pendingRaises: pendingRaises, raiseState: raiseState,
      links: linksSl, linkTotal: linksSl.length,
      villages: [{ id: 'village_0', name: 'Emberhold', opinion: 20, linked: hasFirst },
        { id: 'village_1', name: 'Stonebridge', opinion: 15, linked: hasSecond }],
      scholarLore: ['village_0', 'village_1'], linkTickRoll: 0.3,
      raisers: [raiser('villager_a')], eligibleRaisers: 1 });
  }
  const bondEvents = [];
  stagings.forEach(function (s) {
    bondEvents.push({ day: s.day, initiator: s.vid, target: s.villageId, kind: 'link', outcome: 'staged', chance: null, reason: null });
    if (s.decisionDay != null) bondEvents.push({ day: s.decisionDay, initiator: s.vid, target: s.villageId, kind: 'link', outcome: s.fate, chance: null, reason: null });
  });
  return {
    seed: seed, arm: 'linkform-b', run: 'linkform-b-test', anchorCommit: 'test',
    days: lastDay, gameDays: lastDay, endReason: 'horizon', won: false, over: false,
    villageLost: false, scaleRank: 'regional', maxWave: 4, endUnlockedWave: 4,
    peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false, standing: 150,
    daily: daily, secondlinkDaily: slDaily,
    killEvents: [], deathEvents: [], feastEvents: [], standingLines: [], releaseLines: [], saySample: [],
    linkEvents: o.linkEvents || [], proposeEvents: o.proposeEvents || [],
    counterEvents: o.counterEvents || [], nationalEvents: o.nationalEvents || [], linkLines: [],
    otherVillages: [{ id: 'village_0', name: 'Emberhold', opinion: 20 },
      { id: 'village_1', name: 'Stonebridge', opinion: 15 },
      { id: 'village_2', name: 'The Red Table', opinion: 10 }],
    wrapCounts: {},
    bondEvents: bondEvents, stageCalls: [], acceptCalls: o.acceptCalls || [],
    declineCalls: [], proposeCalls: o.proposeCalls || [], linkTickCalls: 0,
    instrumentErrors: [],
  };
}
const FP = { primary: 'village_2', primaryName: 'The Red Table',
  subs: ['village_0', 'village_3'], subsNames: ['Emberhold', 'Thornfield'], firstDay: 50 };
const LADDER_LINK_EV = [{ day: 20, target: 'village_0', targetName: 'Emberhold',
  asSubordinate: false, tributeKcalPerWeek: 4000, formed: true,
  caller: 'src/js/metaProgression.js <- src/js/game.js' }];

ok('S0 no-link: no link, no stagings -> stage S0', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: null }));
  assert.strictEqual(c.stage, 'S0');
  assert.strictEqual(c.firstLink, null);
  assert.strictEqual(c.unclassified, false);
});

ok('S1 first-only: one link, zero second stagings -> stage S1', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV }));
  assert.strictEqual(c.stage, 'S1');
  assert.strictEqual(c.firstLink.other, 'village_0');
  assert.strictEqual(c.secondStagingCount, 0);
});

ok('S2 second-staged-lost: second raise expired -> stage S2, fate counted', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV,
    stagings: [{ vid: 'villager_a', villageId: 'village_1', day: 30, fate: 'expired', decisionDay: 33 }] }));
  assert.strictEqual(c.stage, 'S2');
  assert.strictEqual(c.secondStagingCount, 1);
  assert.strictEqual(c.secondFates.expired, 1);
  assert.strictEqual(c.unclassified, false);
});

ok('S3a accepted-then-declined: raise accepted, propose declined -> stage S3', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV,
    stagings: [{ vid: 'villager_a', villageId: 'village_1', day: 30, fate: 'accepted', decisionDay: 31 }],
    proposeCalls: [{ day: 31, villageId: 'village_1', outcome: 'declined-null' }],
    acceptCalls: [{ day: 31, vid: 'villager_a', ok: true, villageId: 'village_1' }] }));
  assert.strictEqual(c.stage, 'S3');
  assert.strictEqual(c.secondAcceptedCount, 1);
  assert.strictEqual(c.secondFates['accepted->propose-declined'], 1);
});

ok('S3b counter staged for a second village -> stage S3', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV,
    proposeCalls: [{ day: 40, villageId: 'village_1', outcome: 'counter' }],
    counterEvents: [{ day: 40, target: 'village_1', targetName: 'Stonebridge', asSubordinate: false, tributeKcalPerWeek: 5000, terms: null }] }));
  assert.strictEqual(c.stage, 'S3');
  assert.strictEqual(c.secondCounterCount, 1);
});

ok('S4 second-formed: two active links at once -> stage S4', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, secondLinkDay: 40,
    linkEvents: LADDER_LINK_EV.concat([{ day: 40, target: 'village_1', targetName: 'Stonebridge',
      asSubordinate: false, tributeKcalPerWeek: 4000, formed: true,
      caller: 'src/js/bond-initiation.js <- src/js/game.js' }]) }));
  assert.strictEqual(c.stage, 'S4');
  assert.strictEqual(c.maxActiveLinks, 2);
  assert.strictEqual(c.maxActiveDay, 40);
});

ok('S5 polity: polityOf non-null -> stage S5', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV, polityFromDay: 50 }));
  assert.strictEqual(c.stage, 'S5');
  assert.strictEqual(c.polityEver, true);
});

ok('provenance ladder-reward: metaProgression caller + stage 2->3 cross, zero propose', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV }));
  assert.strictEqual(c.firstLinkProvenance, 'ladder-reward');
  assert.strictEqual(c.firstLinkProvenanceDetail.ladderCross, true);
});

ok('provenance raise: formed proposeLink call for the target -> raise', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20,
    linkEvents: [{ day: 20, target: 'village_0', targetName: 'Emberhold',
      asSubordinate: false, tributeKcalPerWeek: 4000, formed: true,
      caller: 'src/js/bond-initiation.js <- src/js/game.js' }],
    proposeCalls: [{ day: 20, villageId: 'village_0', outcome: 'formed' }],
    acceptCalls: [{ day: 20, vid: 'villager_a', ok: true, villageId: 'village_0' }] }));
  assert.strictEqual(c.firstLinkProvenance, 'raise');
});

ok('prereg-vs-OR definition: pre-link raise for another village is NOT a second raise', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV,
    stagings: [{ vid: 'villager_a', villageId: 'village_1', day: 10, fate: 'expired', decisionDay: 12 }] }));
  assert.strictEqual(c.stage, 'S1', 'pre-link staging must not lift the stage');
  assert.strictEqual(c.secondStagingCount, 0, 'prereg count is 0');
  assert.strictEqual(c.secondStagingCountReusedOR, 1, 'reused OR count is 1');
  assert.strictEqual(c.secondDefDiff.length, 1, 'the disagreement is listed');
  assert.strictEqual(c.secondDefDiff[0].villageId, 'village_1');
});

ok('orphan link event: formed _formLink with no link in any later snapshot -> unclassified', function () {
  const c = AN.classifySeed(mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV.concat(
    [{ day: 25, target: 'village_9', targetName: 'Nowhere', asSubordinate: false,
      tributeKcalPerWeek: 4000, formed: true, caller: 'src/js/metaProgression.js <- src/js/game.js' }]) }));
  assert.strictEqual(c.unclassified, true);
  assert.strictEqual(c.orphanLinkEvents.length, 1);
});

ok('irreconcilable bond event: staged with no pending row and no decision in 3 days -> unclassified', function () {
  // Staging day 30 for village_1, no pendingRaises row that day and no
  // decision event at all: the analyzer pairs it as pending-at-end and
  // reconciliation fails (no pending row, no decision, no link in 3 days).
  const out = mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV,
    stagings: [{ vid: 'villager_a', villageId: 'village_1', day: 30, fate: 'pending-at-end', decisionDay: null }] });
  // Remove the pendingRaises row the builder added for day 30.
  out.secondlinkDaily.forEach(function (r) { if (r.day === 30) r.pendingRaises = []; });
  const c = AN.classifySeed(out);
  assert.strictEqual(c.unclassified, true);
  assert.strictEqual(c.reconcileBad.length, 1);
  assert.strictEqual(c.stage, 'S2', 'still S2 — pending-at-end is a second staging');
});

ok('reproduction mismatch detection: daysAt199 divergence is named', function () {
  const a = mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV, gated199Days: [59, 60] });
  const b = mkOut({ firstLinkDay: 20, linkEvents: LADDER_LINK_EV, gated199Days: [] });
  const r = AN.reproductionCheck(a, b);
  assert.strictEqual(r.match, false);
  assert.strictEqual(r.mismatches.length, 1);
  assert.strictEqual(r.mismatches[0].field, 'daysAt199');
  assert.strictEqual(r.mismatches[0].replay, 2);
  assert.strictEqual(r.mismatches[0].pilot, 0);
  const r2 = AN.reproductionCheck(a, a);
  assert.strictEqual(r2.match, true);
});

ok('merge integrity: standing row wins on standing/links, secondlink keys survive', function () {
  const merged = DRIVER.mergeDailyRows(
    [{ day: 5, standing: { total: 100 }, links: [{ key: 'null|haven|village_0', counts: false }] }],
    [{ day: 5, standing: 250, links: [{ other: 'village_0' }], pendingRaises: [{ vid: 'a' }] }]);
  assert.strictEqual(merged.length, 1);
  assert.strictEqual(merged[0].standing.total, 100, 'standing OBJECT wins over the number');
  assert.strictEqual(merged[0].links[0].key, 'null|haven|village_0', 'standing-shaped links win');
  assert.strictEqual(merged[0].links[0].other, undefined, 'no secondlink `other` leaks into merged links');
  assert.strictEqual(merged[0].pendingRaises.length, 1, 'secondlink keys survive');
});

ok('contrasts: seasoned vs unseasoned and FP vs no-FP groups separate', function () {
  const seasoned = AN.classifySeed(mkOut({ seed: 109310, firstLinkDay: 20, linkEvents: LADDER_LINK_EV, seasonedFromDay: 50, fp: FP }));
  const plain = AN.classifySeed(mkOut({ seed: 109311, firstLinkDay: 25, linkEvents: LADDER_LINK_EV }));
  const g = AN.contrastGroup([seasoned, plain], function (c) { return c.seasonedAtEnd; });
  assert.strictEqual(g.n, 1);
  assert.strictEqual(g.seeds[0], 109310);
  assert.strictEqual(g.foreignPolityPresent, 1);
  const g2 = AN.contrastGroup([seasoned, plain], function (c) { return !c.foreignPolity; });
  assert.strictEqual(g2.n, 1);
  assert.strictEqual(g2.seeds[0], 109311);
});

(async function () {
  await aok('live: both instruments install, snapshot shapes complete, zero errors', async function () {
    const { Game } = await loadGame({ seed: 109310, mode: 'competent-linkform-test', fullTelemetry: false });
    await setupGame(Game);
    const proposeBefore = Game.proposeLink;
    const haven = HAVEN_INST.install(Game);
    const sl = SL_INST.install(Game);
    assert.strictEqual(haven.t.instrumentErrors.length, 0, 'haven install errors: ' + JSON.stringify(haven.t.instrumentErrors));
    assert.strictEqual(sl.t.instrumentErrors.length, 0, 'secondlink install errors: ' + JSON.stringify(sl.t.instrumentErrors));
    const hs = haven.snapshot();
    const ss = sl.snapshot();
    assert.ok(Array.isArray(hs.havenLinks), 'havenLinks array');
    assert.ok(Array.isArray(hs.foreignPolitiesFull), 'foreignPolitiesFull array');
    assert.ok(Array.isArray(ss.pendingRaises), 'pendingRaises array');
    assert.ok(Array.isArray(ss.raisers), 'raisers array');
    assert.ok(Array.isArray(ss.links), 'secondlink links array');
    assert.strictEqual(typeof ss.linkTickRoll, 'number', 'linkTickRoll number');
    assert.ok(ss.linkTickRoll >= 0 && ss.linkTickRoll < 1, 'linkTickRoll in [0,1)');
    assert.strictEqual(hs.day, ss.day, 'both snapshots same day');
    // Both wraps chain on proposeLink: one call lands in both streams.
    const r = Game.proposeLink('nowhere-village');
    assert.strictEqual(r, null, 'unknown propose returns null');
    assert.strictEqual(sl.t.proposeCalls.length, 1, 'secondlink proposeCalls recorded');
    assert.strictEqual(haven.t.proposeEvents.length, 1, 'havenlink proposeEvents recorded');
    assert.strictEqual(haven.t.proposeEvents[0].outcome, 'declined-or-shut');
    // Uninstall in reverse restores the original proposeLink.
    sl.uninstall();
    haven.uninstall();
    assert.strictEqual(Game.proposeLink, proposeBefore, 'proposeLink restored after uninstall');
  });

  await aok('live: determinism + neutrality miniature (12d, seed 109310, ON vs ON vs OFF)', async function () {
    async function shortRun(withInst) {
      const { Game } = await loadGame({ seed: 109310, mode: 'competent-linkform-test', fullTelemetry: false });
      await setupGame(Game);
      const haven = withInst ? HAVEN_INST.install(Game) : null;
      const sl = withInst ? SL_INST.install(Game) : null;
      let lastSnap = -1;
      const wrapped = Object.assign({}, competent, {
        daily: function (Gm, ctx) {
          try { return competent.daily(Gm, ctx); } finally {
            try {
              if (sl) sl.installTeleLazy();
              const d = ((Game.state || {}).scholar || {}).day || 0;
              if (withInst && d !== lastSnap) { lastSnap = d; haven.snapshot(); sl.snapshot(); }
            } catch (e) {}
          }
        },
      });
      let result = null;
      await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
      let standing = null;
      try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
      const out = { days: result.days, standing: standing,
        bondEvents: sl ? sl.t.bondEvents.slice() : [],
        errors: (haven ? haven.t.instrumentErrors.length : 0) + (sl ? sl.t.instrumentErrors.length : 0) };
      if (sl) sl.uninstall();
      if (haven) haven.uninstall();
      return out;
    }
    const a = await shortRun(true);
    const b = await shortRun(true);
    const c = await shortRun(false);
    assert.strictEqual(a.errors, 0, 'ON run errors 0');
    assert.strictEqual(b.errors, 0, 'ON rerun errors 0');
    assert.deepStrictEqual(a.bondEvents, b.bondEvents, 'bond events deterministic across identical runs');
    assert.strictEqual(a.days, b.days, 'days deterministic');
    assert.strictEqual(a.standing, b.standing, 'standing deterministic');
    assert.strictEqual(a.days, c.days, 'ON vs OFF days identical (non-perturbation)');
    assert.strictEqual(a.standing, c.standing, 'ON vs OFF standing identical (non-perturbation)');
    console.log('    (12d: days=' + a.days + ' standing=' + a.standing + ' bondEvents=' + a.bondEvents.length + ')');
  });

  console.log('PASS ' + pass + '/' + total);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
