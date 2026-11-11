// test-standfirst-b.js — proof for the standing points first-numbers
// instrument + analyzer (arm sim-standfirst-b, run fleshout-loop-b-20261111T1131Z).
//
// Fixture leg (fast, always): every wrap proven live on a fixture game
// (seed 99104 — the trustfirst fixture seed, not a band seed):
// ladderTick (direct call, before/after recorded), ladderStageBeat(1)
// (stage beat + the attach hook's reward grant behind it),
// ladderCapBeat('fight'), ladderGrantStageReward (wrap live; grants
// empty at live stage 0 — the grant path itself is proven by the
// leg-3 tests, and _ladderRewardTrader is called directly here),
// ladderCashOut (refused stage-short), ladderBankPoints('lost')
// (banks the fixture's counted points), ladderCapstoneReady x3
// (military_tribute / trade_charter / feast_embassy readiness),
// ladderDeliverCapstone (refused veterans-short), feastBundleCheck
// (empty sheet + a pemmican item fills crafted_centrepiece),
// feastBundleBuyOut (refused, pantry short), hostFeast (recorded
// whether it holds or refuses), overtimeTick (tier 0, inactive),
// tele('overtime_tier') cross-check, snapshot shape + snapshot purity
// (no capReadyEvents created by snapshot reads; no peak/state change),
// and a RED check: installing on a Game with a method deleted logs
// instrumentErrors instead of throwing.
// Analyzer leg (pure): classifyStandingEvent on every kind (ok +
// unclassified variants), gatedTotal on synthetic snapshots (defer4
// hold, plenty-cap hold, peak floor, clean pass).
// Neutrality miniature (live, 5 days): same seed, instrument on vs off,
// days + pantry + deaths identical.
// Bank-freshness miniature: a banked store in game A reads head start 6;
// a fresh loadGame (game B, same process) reads head start 0 — the
// in-memory meta store is fresh per load, so pilot seeds cannot inherit
// each other's banked points.
// Usage: node scripts/test-standfirst-b.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const SF = require(path.join(__dirname, 'standfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'standfirst-analyze-20261111'));

let pass = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) { return null; }
}

(async function () {
  // ---- analyzer leg (pure, no sim) ----
  check('classify: stageBeat ok', AN.classifyStandingEvent({ stage: 2 }, 'stageBeat').cls === 'ok');
  check('classify: stageBeat no stage unclassified', AN.classifyStandingEvent({}, 'stageBeat').cls === 'unclassified');
  check('classify: stageBeat stage 4 unclassified', AN.classifyStandingEvent({ stage: 4 }, 'stageBeat').cls === 'unclassified');
  check('classify: capBeat ok', AN.classifyStandingEvent({ track: 'fight', rungAttempted: 1 }, 'capBeat').cls === 'ok');
  check('classify: capBeat bogus track unclassified', AN.classifyStandingEvent({ track: 'bogus' }, 'capBeat').cls === 'unclassified');
  check('classify: reward ok (grant + skip)', AN.classifyStandingEvent({ stageArg: 1, granted: [{ stage: 1, kind: 'trader' }], skipped: [{ stage: 2, why: 'already-granted' }] }, 'reward').cls === 'ok');
  check('classify: reward grant missing kind unclassified', AN.classifyStandingEvent({ stageArg: 1, granted: [{ stage: 1 }], skipped: [] }, 'reward').cls === 'unclassified');
  check('classify: bundle complete ok', AN.classifyStandingEvent({ contributions: ['a', 'b', 'c', 'd', 'e', 'f'], count: 6, complete: true }, 'bundle').cls === 'ok');
  check('classify: bundle no contributions unclassified', AN.classifyStandingEvent({ count: 0, complete: false }, 'bundle').cls === 'unclassified');
  check('classify: capReady ok', AN.classifyStandingEvent({ kind: 'military_tribute', ready: false, reason: 'veterans-short' }, 'capReady').cls === 'ok');
  check('classify: capReady unknown kind unclassified', AN.classifyStandingEvent({ kind: 'nope', ready: false, reason: 'x' }, 'capReady').cls === 'unclassified');
  check('classify: cashOut refused ok', AN.classifyStandingEvent({ ok: false, why: 'stage-short' }, 'cashOut').cls === 'ok');
  check('classify: bank ok', AN.classifyStandingEvent({ kind: 'lost', points: 9 }, 'bank').cls === 'ok');
  check('classify: capDeliver refused ok', AN.classifyStandingEvent({ kind: 'trade_charter', ok: false, reason: 'not-ready' }, 'capDeliver').cls === 'ok');
  check('classify: buyOut refused ok', AN.classifyStandingEvent({ ok: false, why: 'short pantry' }, 'buyOut').cls === 'ok');
  check('classify: feast ok', AN.classifyStandingEvent({ logAfter: { entries: 3 } }, 'feast').cls === 'ok');
  check('classify: overtime ok', AN.classifyStandingEvent({ before: { tier: 0, interval: 7 }, after: { tier: 0, interval: 7 } }, 'overtime').cls === 'ok');
  check('classify: tele overtime_tier ok', AN.classifyStandingEvent({ type: 'overtime_tier', data: { tier: 1 } }, 'tele').cls === 'ok');
  check('classify: tele wrong type unclassified', AN.classifyStandingEvent({ type: 'other', data: { tier: 1 } }, 'tele').cls === 'unclassified');
  check('classify: ladderTick ok', AN.classifyStandingEvent({ before: { stage: 0, counted: 0 }, after: { stage: 0, counted: 1 } }, 'ladderTick').cls === 'ok');
  check('classify: null event unclassified', AN.classifyStandingEvent(null, 'stageBeat').cls === 'unclassified');

  // gatedTotal: mirror of villageStandingTotal's gating rules.
  check('gatedTotal: defer4 holds raw 120 at 99', (function () {
    const g = AN.gatedTotal({ standing: { total: 120 }, cappedTotal: 120, peakWave: 0,
      readiness4: { ready: false }, readiness5: { ready: false } });
    return g.gated === 99 && g.holds.indexOf('defer4') >= 0;
  })());
  check('gatedTotal: plenty cap holds raw 250 at 199', (function () {
    const g = AN.gatedTotal({ standing: { total: 250 }, cappedTotal: 150, peakWave: 4,
      readiness4: { ready: true }, readiness5: { ready: true } });
    return g.gated === 199 && g.holds.indexOf('cap') >= 0;
  })());
  check('gatedTotal: peak floor holds released wave 4 at 100', (function () {
    const g = AN.gatedTotal({ standing: { total: 50 }, cappedTotal: 50, peakWave: 4,
      readiness4: { ready: true }, readiness5: { ready: false } });
    return g.gated === 100;
  })());
  check('gatedTotal: clean pass returns raw', (function () {
    const g = AN.gatedTotal({ standing: { total: 90 }, cappedTotal: 90, peakWave: 0,
      readiness4: { ready: true }, readiness5: { ready: false } });
    return g.gated === 90 && g.holds.length === 0;
  })());
  check('gatedTotal: defer5 holds capped 210 at 199', (function () {
    const g = AN.gatedTotal({ standing: { total: 210 }, cappedTotal: 210, peakWave: 4,
      readiness4: { ready: true }, readiness5: { ready: false } });
    return g.gated === 199 && g.holds.indexOf('defer5') >= 0;
  })());

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-standfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const sf = SF.install(Game);
  const T = sf.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all 13 wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));

  // ladderTick: direct call, before/after recorded.
  const ltBefore = T.ladderTickEvents.length;
  Game.ladderTick();
  check('ladderTick: event recorded with before/after', T.ladderTickEvents.length === ltBefore + 1 &&
    T.ladderTickEvents[T.ladderTickEvents.length - 1].before != null &&
    T.ladderTickEvents[T.ladderTickEvents.length - 1].after != null &&
    typeof T.ladderTickEvents[T.ladderTickEvents.length - 1].after.counted === 'number');

  // ladderStageBeat(1): beat + the attach hook's reward grant behind it.
  const sbBefore = T.stageBeatEvents.length;
  const rwBefore = T.rewardEvents.length;
  Game.ladderStageBeat(1);
  check('ladderStageBeat: event recorded, stage 1', T.stageBeatEvents.length === sbBefore + 1 &&
    T.stageBeatEvents[T.stageBeatEvents.length - 1].stage === 1);
  check('ladderStageBeat: attach hook called ladderGrantStageReward (recorded)', T.rewardEvents.length >= rwBefore + 1);

  // ladderCapBeat('fight').
  const cbBefore = T.capBeatEvents.length;
  Game.ladderCapBeat('fight');
  check('ladderCapBeat: event recorded, track fight', T.capBeatEvents.length === cbBefore + 1 &&
    T.capBeatEvents[T.capBeatEvents.length - 1].track === 'fight');

  // ladderGrantStageReward: wrap live; grants empty at live stage 0.
  const grBefore = T.rewardEvents.length;
  const grRet = Game.ladderGrantStageReward(2);
  check('ladderGrantStageReward: wrap live, returns granted/skipped', T.rewardEvents.length === grBefore + 1 &&
    grRet && Array.isArray(grRet.granted) && Array.isArray(grRet.skipped));

  // The trader reward itself lands when called directly.
  const trRet = Game._ladderRewardTrader();
  check('_ladderRewardTrader: reward lands (river trader today)', trRet && trRet.ok === true &&
    ((Game.state.scholar || {}).riverTrader || {}).day === gday(Game), JSON.stringify(trRet));

  // ladderCashOut: refused stage-short (peak 0).
  const coBefore = T.cashOutEvents.length;
  const coRet = Game.ladderCashOut();
  check('ladderCashOut: refused stage-short recorded', T.cashOutEvents.length === coBefore + 1 &&
    coRet && coRet.ok === false && coRet.why === 'stage-short');

  // ladderBankPoints('lost'): banks the fixture's counted points.
  const bkBefore = T.bankEvents.length;
  const bkRet = Game.ladderBankPoints('lost');
  check('ladderBankPoints: event recorded, ok', T.bankEvents.length === bkBefore + 1 &&
    bkRet && bkRet.ok === true && typeof bkRet.banked === 'number');

  // ladderCapstoneReady x3: readiness reads recorded with reasons.
  const crBefore = T.capReadyEvents.length;
  const rMil = Game.ladderCapstoneReady('military_tribute');
  const rCha = Game.ladderCapstoneReady('trade_charter');
  const rFea = Game.ladderCapstoneReady('feast_embassy');
  check('ladderCapstoneReady x3: events recorded with kinds + reasons', T.capReadyEvents.length === crBefore + 3 &&
    rMil && rMil.ready === false && rMil.reason === 'veterans-short' &&
    rCha && rCha.ready === false && rCha.reason === 'no-sealed-charter' &&
    rFea && rFea.ready === false && rFea.reason === 'no-bundle-feast',
    JSON.stringify([rMil && rMil.reason, rCha && rCha.reason, rFea && rFea.reason]));

  // ladderDeliverCapstone: refused veterans-short, nothing recorded.
  const cdBefore = T.capDeliverEvents.length;
  const cdRet = Game.ladderDeliverCapstone('military_tribute');
  check('ladderDeliverCapstone: refused veterans-short recorded', T.capDeliverEvents.length === cdBefore + 1 &&
    cdRet && cdRet.ok === false && cdRet.reason === 'veterans-short' &&
    (typeof Game.ladderCapstoneDelivered === 'function' ? Game.ladderCapstoneDelivered() == null : true));

  // feastBundleCheck: empty sheet + a pemmican item fills one slot.
  // (The fixture already holds a kept recipe at level >= 1 — game.js
  // sets `snare` level 3 at start — so the state-fact slot fills too:
  // count 2, not 1. That is the bundle logic working, not a bug.)
  const buBefore = T.bundleEvents.length;
  const buEmpty = Game.feastBundleCheck([], { star: false, surge: false });
  const buPem = Game.feastBundleCheck([{ itemId: 'pemmican' }], { star: false, surge: false });
  check('feastBundleCheck: pemmican fills crafted_centrepiece (+ kept_recipe state fact)', T.bundleEvents.length === buBefore + 2 &&
    buEmpty && buEmpty.count === 1 && buEmpty.contributions.indexOf('kept_recipe') >= 0 && buEmpty.complete === false &&
    buPem && buPem.count === 2 && buPem.contributions.indexOf('crafted_centrepiece') >= 0 &&
    buPem.contributions.indexOf('kept_recipe') >= 0,
    JSON.stringify(buPem));

  // feastBundleBuyOut: refused (pantry short in the fixture).
  const boBefore = T.buyOutEvents.length;
  const boRet = Game.feastBundleBuyOut();
  check('feastBundleBuyOut: event recorded, refused or bought honestly', T.buyOutEvents.length === boBefore + 1 &&
    boRet && typeof boRet.ok === 'boolean');

  // hostFeast: recorded whether it holds or refuses.
  const hfBefore = T.feastEvents.length;
  const hfRet = Game.hostFeast({});
  check('hostFeast: event recorded with feast-log before/after', T.feastEvents.length === hfBefore + 1 &&
    T.feastEvents[T.feastEvents.length - 1].logBefore != null &&
    T.feastEvents[T.feastEvents.length - 1].logAfter != null, JSON.stringify(hfRet && hfRet.why));

  // overtimeTick: tier 0, inactive in the fixture.
  const otBefore = T.overtimeEvents.length;
  Game.overtimeTick();
  check('overtimeTick: event recorded, tier 0 inactive', T.overtimeEvents.length === otBefore + 1 &&
    T.overtimeEvents[T.overtimeEvents.length - 1].after.tier === 0);

  // tele: overtime_tier cross-check.
  const teBefore = T.teleEvents.length;
  Game.tele('overtime_tier', { tier: 1 });
  check('tele: overtime_tier cross-checked', T.teleEvents.length === teBefore + 1 &&
    T.teleEvents[T.teleEvents.length - 1].data.tier === 1);

  // Snapshot: shape present + purity (no capReadyEvents from snapshot reads).
  const crCountBeforeSnap = T.capReadyEvents.length;
  const peakBeforeSnap = (typeof Game._standingPeakWave === 'function') ? Game._standingPeakWave() : null;
  const snap = sf.snapshot();
  check('snapshot: ladder + standing + seat + overtime present',
    snap.ladder && typeof snap.ladder.counted === 'number' &&
    snap.standing && typeof snap.standing.total === 'number' &&
    snap.seat && typeof snap.seat.seat === 'string' &&
    snap.overtime && typeof snap.overtime.tier === 'number' &&
    snap.capReady && snap.capReady.military_tribute && snap.capReady.trade_charter && snap.capReady.feast_embassy,
    JSON.stringify({ counted: snap.ladder && snap.ladder.counted, seat: snap.seat && snap.seat.seat }));
  check('snapshot purity: no capReadyEvents created by snapshot reads', T.capReadyEvents.length === crCountBeforeSnap);
  check('snapshot purity: peak wave unchanged by snapshot', (typeof Game._standingPeakWave === 'function' ? Game._standingPeakWave() : null) === peakBeforeSnap);
  check('snapshot: bank head start is 0 in a fresh fixture', (snap.bankHeadStart | 0) === 0);
  sf.uninstall();

  // ---- RED check: install on a Game with a method deleted ----
  const { Game: Game2 } = await loadGame({ seed: 99104, mode: 'competent-standfirst-proof-red', fullTelemetry: false });
  await setupGame(Game2);
  Game2.ladderTick = undefined;
  const sf2 = SF.install(Game2);
  check('RED: missing method logs instrumentErrors, install does not throw', sf2.t.instrumentErrors.some(function (e) { return e.indexOf('ladderTick-missing') === 0; }), JSON.stringify(sf2.t.instrumentErrors.slice(0, 2)));
  check('RED: other wraps still work after a missing method', (function () {
    try { Game2.ladderStageBeat(1); return sf2.t.stageBeatEvents.length >= 1; } catch (e) { return false; }
  })());
  sf2.uninstall();

  // ---- bank-freshness miniature: banked store in A, fresh load B reads 0 ----
  const { Game: GameA } = await loadGame({ seed: 99104, mode: 'competent-standfirst-bank-a', fullTelemetry: false });
  await setupGame(GameA);
  const sA = GameA._meta();
  sA.ladderBank = { points: 40, at: 1, kind: 'lost' };
  GameA._metaCommit();
  const hsA = GameA.ladderBankedHeadStart();
  check('bank-freshness A: banked 40 reads head start 6', hsA === 6, 'headStart=' + hsA);
  const { Game: GameB } = await loadGame({ seed: 99104, mode: 'competent-standfirst-bank-b', fullTelemetry: false });
  await setupGame(GameB);
  const hsB = GameB.ladderBankedHeadStart();
  check('bank-freshness B: fresh loadGame reads head start 0', hsB === 0, 'headStart=' + hsB);

  // ---- neutrality miniature: 5 days, instrument on vs off ----
  async function mini(withInst) {
    const { Game: G } = await loadGame({ seed: 99104, mode: 'competent-standfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (withInst) inst = SF.install(G);
    let res = null;
    await quietLog(async function () { res = await runDays(G, competent, { days: 5, manifest: undefined, sampleEvery: 30 }); });
    const out = { days: res.days, pantry: pantryKcal(G), deaths: ((res.samples && res.samples.deaths) || []).length, gameDay: gday(G) };
    if (inst) inst.uninstall();
    return out;
  }
  const miniOn = await mini(true);
  const miniOff = await mini(false);
  check('neutrality miniature: 5d days + pantry + deaths identical on/off',
    miniOn.days === miniOff.days && miniOn.pantry === miniOff.pantry && miniOn.deaths === miniOff.deaths,
    'on=' + JSON.stringify(miniOn) + ' off=' + JSON.stringify(miniOff));

  console.log(fails === 0 ? ('STANDFIRST PROOF GREEN ' + pass + '/' + pass) : ('STANDFIRST PROOF FAILURES ' + fails + ' (pass ' + pass + ')'));
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
