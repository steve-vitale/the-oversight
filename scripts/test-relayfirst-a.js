// test-relayfirst-a.js — proof for the relay / Network campaign first-numbers
// instrument + analyzer (arm sim-relayfirst-a, run fleshout-20261111T1115Z).
//
// Fixture leg (fast, always): every wrap proven live on fixture games
// (seed 99104 — the trustfirst fixture seed, not a band seed):
// claimRelay (refused when not networked, claimed when networkLive),
// appointSwitchboard (positive appoint on a fresh game),
// relayAnswer (pending scene answered), relayCommune / relayReroute /
// relayProbe / relayDeepen (recorded while held), relayGrant,
// relayUnlockCheck (translate granted at communes>=2), the seven relay
// ability verbs (recorded), networkSummon (9 pieces placed, tele
// cross-check), startCombat (out-of-order network piece refused),
// soundTitanCall, ledgerAdd titan slew, tbEnd (network node resolve
// miniature with a fabricated tbfight), tele cross-check, snapshot shape,
// and a RED check: installing on a Game with a method deleted logs
// instrumentErrors instead of throwing.
// Analyzer leg (pure): classifyRelayEvent, classifyBelongChain on
// synthetic snapshot trajectories (B0 foreign-realm-no-belong-link;
// B3 qualified-never-staged), reconcileW6 on synthetic per-seed
// objects (spawn/face/kill reconcile to 0; a cleared node with no
// fight counts as kill residue).
// Neutrality miniature (live, 5 days): same seed, instrument on vs off,
// days + pantry + deaths identical.
// Usage: node scripts/test-relayfirst-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const RF = require(path.join(__dirname, 'relayfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'relayfirst-analyze-20261111'));

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
  check('classifyRelayEvent: probe ok', AN.classifyRelayEvent({ verb: 'relayProbe', day: 5, ret: 'x' }) === 'ok');
  check('classifyRelayEvent: null ret is a recorded refusal, ok', AN.classifyRelayEvent({ verb: 'relayCommune', day: 5, ret: null }) === 'ok');
  check('classifyRelayEvent: unknown verb unclassified', AN.classifyRelayEvent({ verb: 'bogus', day: 5, ret: 'x' }) === 'unclassified');
  check('classifyRelayEvent: missing day unclassified', AN.classifyRelayEvent({ verb: 'relayProbe', ret: 'x' }) === 'unclassified');
  check('classifyGrantEvent: grant ok', AN.classifyGrantEvent({ id: 'deep-listen', day: 3 }) === 'ok');
  check('classifyAbilityUseEvent: rewrite ok', AN.classifyAbilityUseEvent({ verb: 'relayRewrite', day: 3 }) === 'ok');
  check('classifyBelongChain: foreign realm, no links -> B0', (function () {
    const daily = [];
    for (let d = 40; d <= 60; d++) {
      daily.push({ day: d, maxForeignSize: d >= 50 ? 4 : 3,
        fps: [{ primary: 'emberhold', subs: ['a', 'b'], day: 50 }],
        links: [], pendingCounter: null, pendingNational: null,
        nationalLive: false, nationalShape: null, exiled: false });
    }
    const r = AN.classifyBelongChain({ daily: daily });
    return r.stage === 'B0' && r.link === 'foreign-realm-no-belong-link' && r.first.foreignRealmDay === 50;
  })());
  check('classifyBelongChain: belong link good + realm -> B3 qualified-never-staged', (function () {
    const daily = [];
    for (let d = 50; d <= 80; d++) {
      daily.push({ day: d, maxForeignSize: 4,
        fps: [{ primary: 'emberhold', subs: ['a', 'b'], day: 50 }],
        links: [{ id: 'l1', status: 'active', primary: 'emberhold', subordinate: 'haven', trust: 60, arrears: 0, day: 60, kind: 'sub', conquered: false }],
        pendingCounter: null, pendingNational: null,
        nationalLive: false, nationalShape: null, exiled: false });
    }
    const r = AN.classifyBelongChain({ daily: daily });
    return r.stage === 'B3' && r.link === 'qualified-never-staged' && r.first.firstBelongGoodDay === 74 && r.first.firstBelongQualifyDay === 74;
  })());
  check('reconcileW6: spawn+face+kill reconcile to 0', (function () {
    const o = {
      spawnEvents: [{ id: 'network_tower', day: 100, networkNode: 'mast_nw' }],
      faceEvents: [{ id: 'network_limb', day: 101, refused: true }],
      fightEvents: [{ day: 102, campaign: 'network:mast_nw',
        fighters: [{ id: 'network_tower', alive: false, hp: 0 }] }],
      teleEvents: [{ type: 'network_summoned', day: 100, data: {} }],
      summonEvents: [{ summoned: true, day: 100 }],
      daily: [
        { day: 100, campaignMonsters: [{ id: 'network_tower', networkNode: 'mast_nw' }], networkCampaign: { summoned: true, started: false, idx: 0, cleared: [], lost: false, done: false }, networkFallen: false, networkLost: false, overtimeTier: 3 },
        { day: 101, campaignMonsters: [{ id: 'network_tower', networkNode: 'mast_nw' }], networkCampaign: { summoned: true, started: true, idx: 0, cleared: [], lost: false, done: false }, networkFallen: false, networkLost: false, overtimeTier: 3 },
        { day: 103, campaignMonsters: [], networkCampaign: { summoned: true, started: true, idx: 1, cleared: ['mast_nw'], lost: false, done: false }, networkFallen: false, networkLost: false, overtimeTier: 3 },
      ],
    };
    const r = AN.reconcileW6(o);
    return r.spawnResidue === 0 && r.faceResidue === 0 && r.killResidue === 0 && r.w6.spawn.network_tower === 1 && r.w6.kill.network_tower === 1;
  })());
  check('reconcileW6: cleared node with no fight is kill residue', (function () {
    const o = {
      spawnEvents: [], faceEvents: [], fightEvents: [], teleEvents: [], summonEvents: [],
      daily: [{ day: 100, campaignMonsters: [], networkCampaign: { summoned: true, started: true, idx: 1, cleared: ['mast_nw'], lost: false, done: false }, networkFallen: false, networkLost: false, overtimeTier: 3 }],
    };
    return AN.reconcileW6(o).killResidue === 1;
  })());

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-relayfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const rf = RF.install(Game);
  const T = rf.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));

  const ids = roster(Game);
  check('fixture: roster has non-scholar villagers', ids.length >= 2, 'roster=' + ids.length);
  const A = ids[0];

  // claimRelay refused while Haven is not networked.
  const c0 = T.relayEvents.length;
  const claimRefused = Game.claimRelay();
  check('claimRelay refused when not networked, recorded', claimRefused === null && T.relayEvents.length === c0 + 1 &&
    T.relayEvents[T.relayEvents.length - 1].verb === 'claimRelay' &&
    T.relayEvents[T.relayEvents.length - 1].ret === null, 'ret=' + claimRefused);

  // Network the village (fixture rigging), then claim.
  Game.state.networkLive = true;
  const c1 = T.relayEvents.length;
  const claimOk = Game.claimRelay();
  check('claimRelay claimed when networked, bearer holds it', claimOk === 'claimed' && Game.relayHeldByBearer() === true &&
    T.relayEvents.length === c1 + 1 &&
    T.relayEvents[T.relayEvents.length - 1].heldAfter === true, 'ret=' + claimOk);

  // Relay verbs while held.
  const v0 = T.relayEvents.length;
  Game.relayProbe();
  Game.relayDeepen();
  Game.relayReroute('honest');
  const communeRet = Game.relayCommune();
  check('relay verbs recorded while held (probe/deepen/reroute/commune)', T.relayEvents.length === v0 + 4 &&
    ['relayProbe', 'relayDeepen', 'relayReroute', 'relayCommune'].every(function (v, i) { return T.relayEvents[v0 + i].verb === v; }),
    'communeRet=' + communeRet);

  // relayGrant: deep-listen granted once, refused the second time.
  const g0 = T.grantEvents.length;
  const grantOk = Game.relayGrant('deep-listen');
  const grantAgain = Game.relayGrant('deep-listen');
  check('relayGrant: first grant true, second false, both recorded', grantOk === true && grantAgain === false &&
    T.grantEvents.length === g0 + 2 && T.grantEvents[g0].granted === true && T.grantEvents[g0 + 1].granted === false);

  // relayUnlockCheck: communes>=2 + light open grants translate.
  Game.state.scholar.relay.communes = 2;
  const u0 = T.unlockEvents.length;
  Game.relayUnlockCheck();
  check('relayUnlockCheck: translate granted at communes>=2', T.unlockEvents.length === u0 + 1 &&
    (T.unlockEvents[T.unlockEvents.length - 1].granted || []).indexOf('translate') >= 0,
    JSON.stringify(T.unlockEvents[T.unlockEvents.length - 1]));

  // relayAnswer: the commune opened cur-1; answer its first choice.
  const pend = (typeof Game.pendingRelayScene === 'function') ? Game.pendingRelayScene() : null;
  if (pend && pend.scene && typeof Game.relaySceneById === 'function') {
    const sc = Game.relaySceneById(pend.scene);
    const chs = (sc && sc.choices) || [];
    if (chs.length) {
      const a0 = T.relayEvents.length;
      const ansRet = Game.relayAnswer(chs[0].id);
      check('relayAnswer: pending scene answered, recorded', ansRet === 'answered' && T.relayEvents.length === a0 + 1 &&
        T.relayEvents[T.relayEvents.length - 1].verb === 'relayAnswer' &&
        T.relayEvents[T.relayEvents.length - 1].scene === pend.scene, 'ret=' + ansRet);
    } else {
      check('relayAnswer: pending scene answered, recorded', false, 'scene has no choices');
    }
  } else {
    check('relayAnswer: pending scene answered, recorded', false, 'no pending scene after commune');
  }

  // The seven relay ability verbs: recorded (returns vary by state;
  // the proof asserts the RECORD, not the outcome).
  const au0 = T.abilityUseEvents.length;
  const verbCalls = [
    function () { return Game.relayTranslate('grief'); },
    function () { return Game.relaySanctuary(); },
    function () { return Game.relayAdvocate(A); },
    function () { return Game.relayRewrite(); },
    function () { return Game.relaySkim(); },
    function () { return Game.relaySight(); },
    function () { return Game.relayCarry(); },
  ];
  verbCalls.forEach(function (fn) { try { fn(); } catch (e) { /* engine refusal path; the wrap records the attempt */ } });
  const recordedVerbs = T.abilityUseEvents.slice(au0).map(function (e) { return e.verb; });
  check('relay ability verbs: all seven recorded', ['relayTranslate', 'relaySanctuary', 'relayAdvocate', 'relayRewrite', 'relaySkim', 'relaySight', 'relayCarry']
    .every(function (v) { return recordedVerbs.indexOf(v) >= 0; }), JSON.stringify(recordedVerbs));
  check('relay events classify ok so far', T.relayEvents.every(function (e) { return AN.classifyRelayEvent(e) === 'ok'; }) &&
    T.grantEvents.every(function (e) { return AN.classifyGrantEvent(e) === 'ok'; }) &&
    T.abilityUseEvents.every(function (e) { return AN.classifyAbilityUseEvent(e) === 'ok'; }));

  // networkSummon: nine pieces placed, tele cross-check.
  const s0 = T.spawnEvents.length;
  const sumRet = Game.networkSummon();
  const newSpawns = T.spawnEvents.slice(s0);
  const byKind = {};
  newSpawns.forEach(function (e) { byKind[e.id] = (byKind[e.id] || 0) + 1; });
  check('networkSummon: summoned, 4 tower + 4 limb + 1 heart spawned', sumRet === true && newSpawns.length === 9 &&
    byKind.network_tower === 4 && byKind.network_limb === 4 && byKind.network_heart === 1,
    'spawns=' + newSpawns.length + ' ' + JSON.stringify(byKind));
  check('tele: network_summoned cross-checked', T.teleEvents.some(function (e) { return e.type === 'network_summoned'; }));
  check('spawnWorldMonster: direct campaign spawn recorded', (function () {
    const before = T.spawnEvents.length;
    Game.spawnWorldMonster('network_tower', 1, 1, { titan: true });
    return T.spawnEvents.length === before + 1 && T.spawnEvents[T.spawnEvents.length - 1].id === 'network_tower';
  })());

  // startCombat on an out-of-order network piece refuses aloud.
  const f0 = T.faceEvents.length;
  const faceRet = Game.startCombat('network_limb');
  check('startCombat: out-of-order network piece refused, recorded', faceRet === null && T.faceEvents.length === f0 + 1 &&
    T.faceEvents[T.faceEvents.length - 1].refused === true &&
    T.faceEvents[T.faceEvents.length - 1].id === 'network_limb', 'ret=' + faceRet);

  // soundTitanCall + ledgerAdd titan slew.
  const tc0 = T.titanCallEvents.length;
  Game.soundTitanCall('herald');
  check('soundTitanCall: herald call recorded', T.titanCallEvents.length === tc0 + 1 &&
    T.titanCallEvents[T.titanCallEvents.length - 1].titan === 'herald');
  const ts0 = T.titanSlewEvents.length;
  Game.ledgerAdd('titan', 'slew:herald');
  check('ledgerAdd: titan slew recorded', T.titanSlewEvents.length === ts0 + 1 &&
    T.titanSlewEvents[T.titanSlewEvents.length - 1].what === 'slew:herald');

  // tbEnd miniature: fabricated network fight, mast_nw piece dead.
  const fe0 = T.fightEvents.length;
  Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null };
  Game.state.titans._fight = { campaign: 'network:mast_nw', titan: null, day: gday(Game) };
  Game.tbfight = { over: false, round: 1,
    fighters: [{ kind: 'monster', key: 'm_0', mdef: { id: 'network_tower' }, monsterId: 'network_tower', alive: false, hp: 0 }] };
  let tbThrew = false;
  try { Game.tbEnd('won'); } catch (e) { tbThrew = true; }
  const fe = T.fightEvents.slice(fe0);
  check('tbEnd: network fight recorded with campaign tag + dead piece', !tbThrew && fe.length === 1 &&
    fe[0].campaign === 'network:mast_nw' &&
    (fe[0].fighters || []).some(function (p) { return p.id === 'network_tower' && !p.alive; }),
    'threw=' + tbThrew + ' events=' + fe.length);
  check('tbEnd miniature: mast_nw cleared in campaign state', (function () {
    try {
      const c = Game.networkCampaign ? Game.networkCampaign() : null;
      return !!(c && (c.cleared || []).indexOf('mast_nw') >= 0);
    } catch (e) { return false; }
  })());

  // Snapshot: relay + binding + network + table shape present.
  const snap = rf.snapshot();
  check('snapshot: relay counters + lean + integration present',
    snap.relay && typeof snap.relay.communes === 'number' && typeof snap.relay.lean === 'number' && snap.integration != null);
  check('snapshot: relayAbils include the granted ids', (snap.relayAbils || []).indexOf('deep-listen') >= 0 && (snap.relayAbils || []).indexOf('translate') >= 0);
  check('snapshot: network summoned + pieces on the map', snap.networkCampaign && snap.networkCampaign.summoned === true &&
    (snap.campaignMonsters || []).length >= 8, 'pieces=' + (snap.campaignMonsters || []).length);
  check('snapshot: binding traj + table fields present',
    Array.isArray(snap.fps) && Array.isArray(snap.links) && 'tableAnnounced' in snap && 'tableDone' in snap);
  console.log('    instrument errors at fixture end: ' + JSON.stringify(T.instrumentErrors.slice(0, 5)));
  rf.uninstall();

  // ---- appointSwitchboard positive (fresh game) ----
  const { Game: Game2 } = await loadGame({ seed: 99104, mode: 'competent-relayfirst-proof-appoint', fullTelemetry: false });
  await setupGame(Game2);
  const rf2 = RF.install(Game2);
  Game2.state.networkLive = true;
  const ids2 = roster(Game2);
  check('appoint fixture: roster has non-scholar villagers', ids2.length >= 1, 'roster=' + ids2.length);
  const ap0 = rf2.t.relayEvents.length;
  Game2.appointSwitchboard(ids2[0]);
  const sw2 = (typeof Game2.switchboard === 'function') ? Game2.switchboard() : null;
  check('appointSwitchboard: holder named + event recorded', sw2 && sw2.holderId === ids2[0] &&
    rf2.t.relayEvents.length === ap0 + 1 &&
    rf2.t.relayEvents[rf2.t.relayEvents.length - 1].verb === 'appointSwitchboard', 'holder=' + (sw2 && sw2.holderId));
  rf2.uninstall();

  // ---- RED check: install on a Game with a method deleted ----
  const { Game: Game3 } = await loadGame({ seed: 99104, mode: 'competent-relayfirst-proof-red', fullTelemetry: false });
  await setupGame(Game3);
  Game3.relayGrant = undefined;
  const rf3 = RF.install(Game3);
  check('RED: missing method logs instrumentErrors, install does not throw', rf3.t.instrumentErrors.some(function (e) { return e.indexOf('relayGrant-missing') === 0; }), JSON.stringify(rf3.t.instrumentErrors.slice(0, 2)));
  check('RED: other wraps still work after a missing method', (function () {
    try { Game3.claimRelay(); return rf3.t.relayEvents.length >= 1; } catch (e) { return false; }
  })());
  rf3.uninstall();

  // ---- neutrality miniature: 5 days, instrument on vs off ----
  async function mini(withInst) {
    const { Game: G } = await loadGame({ seed: 99104, mode: 'competent-relayfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (withInst) inst = RF.install(G);
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
  check('neutrality miniature: ran 5 days', miniOn.days === 5);

  console.log(fails === 0 ? ('RELAYFIRST PROOF GREEN ' + pass + '/' + pass) : ('RELAYFIRST PROOF FAILURES ' + fails + ' (pass ' + pass + ')'));
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
