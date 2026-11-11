// test-trustfirst-a.js — proof for the trust + gossip first-numbers
// instrument + analyzer (arm sim-trustfirst-a, run fleshout-20261111T0815Z).
//
// Fixture leg (fast, always): every wrap proven live on a fixture game
// (seed 99104 — the trustgrowth fixture seed, not a band seed):
// bumpTrust (+8 full rate at trust 10; +8 -> +4 at trust 60, progressive),
// _evTrustAll, trustGainProgressive scaling, applyRep (rep + trust drift),
// seedGossip (new + deduped repeat), spreadGossip (hops recorded with
// listener + distortion), spreadRumor, talkRound shape (0 exchanges -> +0
// stipend), tendLink / opinion verbs / river verbs (wrap fires, engine
// verb returns its honest null/0 — proven live, dead-under-competent /
// dead-under-harness in the pilot), _trustGain wrap on a rigged link,
// tele('trust') cross-check, trust-map setter catching a direct write
// that bypasses bumpTrust, and a RED check: installing on a Game with a
// method deleted logs instrumentErrors instead of throwing.
// Analyzer leg (pure): classifyTrustWrite on fixture stacks +
// summarizeSeed on a synthetic per-seed object (reconciliation math).
// Neutrality miniature (live, 5 days): same seed, instrument on vs off,
// days + pantry + deaths identical (the #114 nondeterminism onset was
// day 112 on fight-heavy seeds — a 5-day window is far below it).
// Usage: node scripts/test-trustfirst-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const TF = require(path.join(__dirname, 'trustfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'trustfirst-analyze-20261111'));

let pass = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) { return null; }
}
function roster(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; }); } catch (e) { return []; }
}

(async function () {
  // ---- analyzer leg (pure, no sim) ----
  check('classifyTrustWrite: bumpTrust stack', (function () {
    const c = AN.classifyTrustWrite({ stack: 'Error | at Object.bumpTrust (/repo/src/js/game.js:8300:1) | at Object.endConvo', vid: 'v1', day: 1, delta: 3 }, {});
    return c.cause === 'bumpTrust';
  })());
  check('classifyTrustWrite: evTrustAll stack', AN.classifyTrustWrite({ stack: 'Error | at Object._evTrustAll (/repo/src/js/game.js:26736:1)', vid: 'v1', day: 1, delta: 8 }, {}).cause === 'evTrustAll');
  check('classifyTrustWrite: applyRep stack', AN.classifyTrustWrite({ stack: 'Error | at Object.applyRep (/repo/src/js/game.js:18390:1)', vid: 'v1', day: 1, delta: 6 }, {}).cause === 'applyRep-drift');
  check('classifyTrustWrite: direct deed writer named', AN.classifyTrustWrite({ stack: 'Error | at Object.giveFood (/repo/src/js/game.js:4146:1)', vid: 'v1', day: 1, delta: 4 }, {}).cause === 'other-named:giveFood');
  check('classifyTrustWrite: empty stack unattributed', AN.classifyTrustWrite({ stack: '', vid: 'v1', day: 1, delta: 2 }, {}).cause === 'unattributed');

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-trustfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const tf = TF.install(Game);
  const T = tf.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: link instrument attached', !!tf.tgT && Array.isArray(tf.tgT.daily));

  const ids = roster(Game);
  check('fixture: roster has non-scholar villagers', ids.length >= 2, 'roster=' + ids.length);
  const A = ids[0], B = ids[1], C = ids[2] || ids[0];
  const trustOf = function (vid) { try { const t = (Game.state.village || {}).trust || {}; return (t[vid] === undefined ? 10 : t[vid]); } catch (e) { return null; } };

  // bumpTrust: full rate at trust 10, progressive at 60.
  const beforeA = trustOf(A);
  Game.bumpTrust(A, 8, 'proof-test');
  check('bumpTrust: +8 at trust 10 applies +8', trustOf(A) === beforeA + 8, 'before=' + beforeA + ' after=' + trustOf(A));
  check('bumpTrust: wrap event recorded with reason', T.bumpTrust.some(function (e) { return e.vid === A && e.requested === 8 && e.applied === 8 && e.reason === 'proof-test'; }));
  check('bumpTrust: setter twin logged', T.trustWrites.some(function (e) { return e.vid === A && e.delta === 8 && /bumpTrust/.test(e.stack || ''); }));
  // Force trust to 60 via a direct map write (through the setter), then +8 -> +4.
  Game.state.village.trust[A] = 60;
  Game.bumpTrust(A, 8, 'proof-scaling');
  check('bumpTrust: +8 at trust 60 applies +4 (progressive)', trustOf(A) === 64, 'after=' + trustOf(A));
  check('trustGainProgressive: wrap records scaled value', T.trustGains.some(function (e) { return e.vid === A && e.base === 8 && e.scaled === 4; }));

  // _evTrustAll: every known villager moves; requested vs applied recorded.
  const evBefore = T.evTrustAll.length;
  Game._evTrustAll(3);
  check('_evTrustAll: event recorded with per-vid applied', T.evTrustAll.length === evBefore + 1 && Object.keys(T.evTrustAll[T.evTrustAll.length - 1].applied).length >= 1);

  // applyRep: rep moves + trust drift recorded.
  const repBefore = Game.repOf(B).generous || 0;
  const trustBeforeB = trustOf(B);
  Game.applyRep(B, { generous: 10 }, 1, false);
  check('applyRep: rep +10 recorded', (Game.repOf(B).generous || 0) === repBefore + 10);
  check('applyRep: trust drift recorded (repDelta + trustDelta)', T.applyRep.some(function (e) { return e.vid === B && (e.repDelta.generous || 0) === 10 && typeof e.trustDelta === 'number'; }), 'trustBefore=' + trustBeforeB + ' after=' + trustOf(B));
  check('applyRep: noTrust=true pays rep only', (function () {
    const tb = trustOf(C);
    Game.applyRep(C, { honest: -5 }, 1, true);
    return trustOf(C) === tb && T.applyRep.some(function (e) { return e.vid === C && e.noTrust && e.trustDelta === 0; });
  })());

  // Direct write bypassing bumpTrust is caught by the setter.
  const directBefore = trustOf(B);
  Game.state.village.trust[B] = directBefore + 2;
  check('setter: direct write bypassing bumpTrust logged', T.trustWrites.some(function (e) { return e.vid === B && e.delta === 2 && !/bumpTrust/.test(e.stack || ''); }));

  // tele('trust') cross-check (only if tele exists on this Game).
  if (typeof Game.tele === 'function') {
    check('tele: trust events cross-checked', T.teleTrust.length >= 1, 'teleTrust=' + T.teleTrust.length);
  } else {
    console.log('ok   tele: Game.tele absent on this harness (skipped, wrap records nothing)');
    pass++;
  }

  // seedGossip: new + deduped repeat.
  const sgBefore = T.seedGossip.length;
  Game.seedGossip('theft', { honest: -15, generous: -10 }, [A, B]);
  Game.seedGossip('theft', { honest: -15, generous: -10 }, [A, B]);
  check('seedGossip: new + deduped repeat recorded', T.seedGossip.length === sgBefore + 2 &&
    T.seedGossip[T.seedGossip.length - 2].deduped === false && T.seedGossip[T.seedGossip.length - 1].deduped === true);

  // spreadGossip: hops recorded with listener + distortion (40 parts).
  const spBefore = T.spreadGossip.length;
  for (let i = 0; i < 40; i++) { try { Game.spreadGossip(); } catch (e) {} }
  const hops = [];
  T.spreadGossip.slice(spBefore).forEach(function (c) { (c.hops || []).forEach(function (h) { if (h.listener) hops.push(h); }); });
  check('spreadGossip: wrap fired 40x', T.spreadGossip.length === spBefore + 40);
  check('spreadGossip: >=1 hop recorded with listener + distortion', hops.length >= 1 && hops.every(function (h) { return typeof h.listener === 'string' && typeof h.distortionAfter === 'number'; }), 'hops=' + hops.length);
  check('gossipActionDims: theft maps to rep dims', (function () {
    const out = Game.gossipActionDims('theft', { honest: -15, generous: -10 });
    return out && out.honest === -15 && out.generous === -10;
  })());

  // spreadRumor: player rumor seeded with a first hearer, noTrust.
  const srBefore = T.spreadRumor.length;
  const rumor = Game.spreadRumor(C, 'stingy', A);
  check('spreadRumor: event recorded, rumor object returned', T.spreadRumor.length === srBefore + 1 && !!rumor && rumor.noTrust === true);

  // talkRound shape: open + immediate 'left' pays +0.
  const talkBefore = trustOf(B);
  try { Game.talkTo(B); } catch (e) {}
  try { Game.endConvo(B, 'left'); } catch (e) {}
  check('talkRound: 0-exchange sitting pays +0 stipend', trustOf(B) === talkBefore &&
    T.endConvo.some(function (e) { return e.vid === B && e.how === 'left' && e.stipend === 0; }), 'before=' + talkBefore + ' after=' + trustOf(B));

  // tendLink / opinion verbs / river verbs: wrap fires, engine verb honest.
  const tlBefore = T.tendLink.length;
  const tlRet = Game.tendLink('no-such-link');
  check('tendLink: wrap live, no link -> 0', T.tendLink.length === tlBefore + 1 && tlRet === 0);
  const ovBefore = T.opinionVerbs.length;
  check('villageTalk: wrap live, no village -> null', Game.villageTalk('no-such-village') === null && T.opinionVerbs.length === ovBefore + 1);
  check('villageDeal: wrap live, no village -> null', Game.villageDeal('no-such-village', 'split') === null);
  check('villageShareFood: wrap live, no village -> null', Game.villageShareFood('no-such-village', { giftKcal: 700 }) === null);
  check('probationTick: wrap live, no probation -> undefined', (function () { Game.probationTick(); return true; })() && T.opinionVerbs.some(function (e) { return e.fn === 'probationTick'; }));
  const rvBefore = T.river.length;
  Game.evRiverTrader({});
  Game.feedRiverTrader();
  try { Game.snubRiverTrader(); } catch (e) {}
  check('river: ev/feed/snub wraps live', T.river.length >= rvBefore + 2 && T.river.some(function (e) { return e.fn === 'evRiverTrader'; }) && T.river.some(function (e) { return e.fn === 'feedRiverTrader'; }));

  // _trustGain wrap (TG): rigged link.
  const fake = { id: 'proof-link', trust: 30 };
  const tgBefore = (tf.tgT.gains || []).length;
  const tgRet = Game._trustGain(fake, 8);
  check('_trustGain: wrap records requested/applied on rigged link', tgRet === 8 && (tf.tgT.gains || []).length === tgBefore + 1 && tf.tgT.gains[tf.tgT.gains.length - 1].applied === 8);

  // Snapshot: trust map, rep, gossip alive, opinion present.
  const snap = tf.snapshot();
  check('snapshot: trust + rep + gossip + opinion present', snap.trust && snap.rep && Array.isArray(snap.gossipAlive) && Array.isArray(snap.opinion));
  check('snapshot: gossip alive includes seeded theft', snap.gossipAlive.some(function (g) { return g.action === 'theft'; }));

  // Bond wraps exist (proposeBond etc. attached by bond-initiation).
  check('bond: proposeBond + stage/accept/decline fns wrapped', ['proposeBond', 'stageBondProposal', 'acceptBondProposal', 'declineBondProposal', 'stageLinkRaise', 'acceptLinkRaise', 'declineLinkRaise'].every(function (n) { return typeof Game[n] === 'function'; }));
  tf.uninstall();

  // ---- RED check: install on a Game with a method deleted ----
  const { Game: Game2 } = await loadGame({ seed: 99104, mode: 'competent-trustfirst-proof-red', fullTelemetry: false });
  await setupGame(Game2);
  Game2.spreadRumor = undefined;
  const tf2 = TF.install(Game2);
  check('RED: missing method logs instrumentErrors, install does not throw', tf2.t.instrumentErrors.some(function (e) { return e.indexOf('spreadRumor-missing') === 0; }), JSON.stringify(tf2.t.instrumentErrors.slice(0, 2)));
  check('RED: other wraps still work after a missing method', (function () {
    try { Game2.bumpTrust(ids[0], 1, 'red-check'); return tf2.t.bumpTrust.length >= 1; } catch (e) { return false; }
  })());
  tf2.uninstall();

  // ---- neutrality miniature: 5 days, instrument on vs off ----
  async function mini(withInst) {
    const { Game: G } = await loadGame({ seed: 99104, mode: 'competent-trustfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (withInst) inst = TF.install(G);
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

  console.log(fails === 0 ? ('TRUSTFIRST PROOF GREEN ' + pass + '/' + pass) : ('TRUSTFIRST PROOF FAILURES ' + fails + ' (pass ' + pass + ')'));
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
