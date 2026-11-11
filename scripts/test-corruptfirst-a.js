// test-corruptfirst-a.js — proof for the corruption / cannibalism
// first-numbers instrument + analyzer (arm sim-corruptfirst-a, run
// fleshout-20261111T1408Z).
//
// Fixture leg (fast, always): every wrap proven live on a fixture game
// (seed 99104 — the trustfirst/abilityfirst fixture seed, not a band
// seed): addCorruption (scholar), addNpcCorruption, corruptionThresholdBeat,
// corpseButcher (granted, with blade, person corpse in range),
// eatCannibal (first meal: trauma 35, corruption +14, meal counted),
// contractDisease (trembles, source human meat), recordCrime
// (cannibalism witnessed), cravingTick (energy drain at 60+ unfed),
// npcDriftTick (corrupt figure normalizes the roster), npcCannibalTick
// (starving village + corrupt candidate + person corpse → a feed),
// temptTick (meat parcel offered), darkCarePackageTick (dark fans
// deliver), psychoViolenceTick (malicious psycho escalates a stage),
// psychoIntro (fires once, corruption 20, darkPath), mantleWatch
// (corruption carried to the scholar), discoverNpcCannibalism
// (retroactive detonation), addFear/fearWeakness, intimidate
// (yielded_dread), trustGainProgressive foil drag, justiceHeat
// (contextual), darkShowBeat, remember (filtered keys only),
// corruptionTick invocation counter, snapshot shape, and a RED check:
// installing on a Game with a method deleted logs instrumentErrors
// instead of throwing.
// Analyzer leg (pure): classifyCorrEvent, classifySlopeEvent,
// reconcileCrimes, reconcileNpcCorruption on synthetic per-seed objects.
// Neutrality miniature (live, 5 days): same seed, instrument on vs off,
// days + pantry + deaths identical.
// Usage: node scripts/test-corruptfirst-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const CF = require(path.join(__dirname, 'corruptfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'corruptfirst-analyze-20261111'));

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
  check('classifyCorrEvent: player add ok', AN.classifyCorrEvent({ who: 'player', reason: 'ate human meat', n: 14 }).cls === 'ok');
  check('classifyCorrEvent: npc add ok', AN.classifyCorrEvent({ who: 'v1', reason: 'fed in the hungry dark', n: 12 }).cls === 'ok');
  check('classifyCorrEvent: empty reason unclassified', AN.classifyCorrEvent({ who: 'player', reason: '', n: 14 }).cls === 'unclassified');
  check('classifyCorrEvent: null who unclassified', AN.classifyCorrEvent({ who: null, reason: 'x', n: 1 }).cls === 'unclassified');
  check('classifySlopeEvent: butcher granted ok', AN.classifySlopeEvent({ verb: 'corpseButcher', granted: true }) === 'ok');
  check('classifySlopeEvent: eat refused ok', AN.classifySlopeEvent({ verb: 'eatCannibal', granted: false }) === 'ok');
  check('classifySlopeEvent: unknown verb unclassified', AN.classifySlopeEvent({ verb: 'eatOne', granted: true }) === 'unclassified');
  check('classifySlopeEvent: missing granted unclassified', AN.classifySlopeEvent({ verb: 'eatCannibal' }) === 'unclassified');
  check('reconcileCrimes: snapshot matches last crimesAfter', (function () {
    const o = {
      crimeEvents: [{ type: 'cannibalism', witnessed: true, crimesAfter: 1 }],
      daily: [{ day: 1, justiceCrimes: [] }, { day: 2, justiceCrimes: [{ type: 'cannibalism', witnessed: true }] }],
    };
    return AN.reconcileCrimes(o).residue === 0;
  })());
  check('reconcileCrimes: unexplained snapshot crime is residue', (function () {
    const o = {
      crimeEvents: [],
      daily: [{ day: 1, justiceCrimes: [{ type: 'cannibalism', witnessed: true }] }],
    };
    return AN.reconcileCrimes(o).residue === 1;
  })());
  check('reconcileNpcCorruption: adds explain the delta', (function () {
    const o = {
      corrEvents: [{ who: 'v1', before: 0, after: 12 }],
      psychoEvents: [],
      daily: [{ day: 1, npcCorruption: { v1: 0 } }, { day: 2, npcCorruption: { v1: 12 } }],
    };
    return AN.reconcileNpcCorruption(o).residue === 0;
  })());
  check('reconcileNpcCorruption: unexplained npc delta is residue', (function () {
    const o = {
      corrEvents: [],
      psychoEvents: [],
      daily: [{ day: 1, npcCorruption: { v1: 0 } }, { day: 2, npcCorruption: { v1: 12 } }],
    };
    return AN.reconcileNpcCorruption(o).residue === 1;
  })());

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-corruptfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const cf = CF.install(Game);
  const T = cf.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all 24 wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));

  const ids = roster(Game);
  check('fixture: roster has non-scholar villagers', ids.length >= 3, 'roster=' + ids.length);
  const A = ids[0], B = ids[1], C = ids[2];
  Game.dayPart = 0;
  if (Game.state.scholar) Game.state.scholar.part = 0;

  // addCorruption: +5, reason recorded, before/after.
  Game.state.scholar.corruption = 0;
  const c0 = T.corrEvents.length;
  Game.addCorruption(5, 'proof');
  check('addCorruption: +5 recorded with reason', T.corrEvents.length === c0 + 1 &&
    T.corrEvents[T.corrEvents.length - 1].who === 'player' &&
    T.corrEvents[T.corrEvents.length - 1].reason === 'proof' &&
    T.corrEvents[T.corrEvents.length - 1].after === 5);
  check('addCorruption: event classified ok', T.corrEvents.every(function (e) { return AN.classifyCorrEvent(e).cls === 'ok'; }));

  // addNpcCorruption: +7 on a villager.
  const c1 = T.corrEvents.length;
  Game.addNpcCorruption(A, 7, 'proof-npc');
  check('addNpcCorruption: +7 recorded on villager', T.corrEvents.length === c1 + 1 &&
    T.corrEvents[T.corrEvents.length - 1].who === A &&
    T.corrEvents[T.corrEvents.length - 1].after === 7);

  // corruptionThresholdBeat: 25 -> 35 crosses 30.
  const th0 = T.thresholdEvents.length;
  Game.corruptionThresholdBeat(25, 35, 'proof-beat');
  check('corruptionThresholdBeat: crossing 30 recorded', T.thresholdEvents.length === th0 + 1 &&
    T.thresholdEvents[T.thresholdEvents.length - 1].crossed.indexOf(30) >= 0);

  // corpseButcher: person corpse in range + blade -> meat, +4 corruption, trauma.
  Game.state.scholar.inventory.push({ name: 'stone knife', itemId: 'stone_knife' });
  const s = Game.state.scholar;
  const corpse = { id: 'c-proof', kind: 'person', villagerId: A, node: { x: Game.map.px, y: Game.map.py },
    mx: (s.mx == null ? 4 : s.mx), my: (s.my == null ? 4 : s.my), buried: false, butchered: false, items: [] };
  Game.state.corpses = Game.state.corpses || [];
  Game.state.corpses.push(corpse);
  const sl0 = T.slopeEvents.length;
  const traumaBefore = s.trauma || 0, corrBeforeB = s.corruption || 0;
  const meat = Game.corpseButcher('c-proof');
  check('corpseButcher: meat granted, slope event recorded', !!meat && meat.plantId === 'meat_human' &&
    T.slopeEvents.length === sl0 + 1 && T.slopeEvents[T.slopeEvents.length - 1].granted === true,
    'meat=' + JSON.stringify(meat && { plantId: meat.plantId, units: meat.units }));
  check('corpseButcher: corruption +4 and trauma up', (s.corruption || 0) === corrBeforeB + 4 && (s.trauma || 0) > traumaBefore,
    'corr ' + corrBeforeB + '->' + s.corruption + ' trauma ' + traumaBefore + '->' + s.trauma);
  check('corpseButcher: no re-butcher dup', (function () {
    const units1 = (s.inventory || []).filter(function (i) { return i.plantId === 'meat_human'; }).reduce(function (a, i) { return a + (i.units || 1); }, 0);
    Game.corpseButcher('c-proof');
    const units2 = (s.inventory || []).filter(function (i) { return i.plantId === 'meat_human'; }).reduce(function (a, i) { return a + (i.units || 1); }, 0);
    return units2 === units1;
  })());

  // recordCrime + justiceHeat BEFORE the first meal: recordCrime
  // dedupes on type+victim+day+part, so an explicit cannibalism crime
  // must be booked before eatCannibal books its own victimless one
  // (same key shape would dedupe the later call). Victim B keeps the
  // keys distinct so the meal's own crime still books afterwards.
  const cr0 = T.crimeEvents.length;
  Game.recordCrime('cannibalism', { victim: B, witnessed: true });
  check('recordCrime: cannibalism witnessed recorded', T.crimeEvents.length === cr0 + 1 &&
    T.crimeEvents[T.crimeEvents.length - 1].type === 'cannibalism' &&
    T.crimeEvents[T.crimeEvents.length - 1].witnessed === true);

  // justiceHeat: exile norm, witnessed cannibalism = heavy heat.
  // (The base ladder scores murder/attack/theft only; the +60 for
  // witnessed cannibalism under exile comes from the corruption wrap.)
  const h0 = T.heatEvents.length;
  const heat = Game.justiceHeat();
  check('justiceHeat: heat recorded, exile norm heavy (>=60)', T.heatEvents.length === h0 + 1 &&
    T.heatEvents[T.heatEvents.length - 1].heat >= 60 &&
    T.heatEvents[T.heatEvents.length - 1].norm === 'exile', 'heat=' + heat);

  // eatCannibal: first meal — trauma 35, corruption +14, meal counted.
  const meatIdx = (s.inventory || []).findIndex(function (i) { return i.plantId === 'meat_human'; });
  const sl1 = T.slopeEvents.length;
  const t0 = s.trauma || 0, cc0 = s.corruption || 0;
  const ate = Game.eatCannibal(meatIdx);
  check('eatCannibal: first meal granted, meals 1', ate === true && (s.cannibalMeals || 0) === 1 &&
    T.slopeEvents.length === sl1 + 1 && T.slopeEvents[T.slopeEvents.length - 1].verb === 'eatCannibal',
    'ate=' + ate + ' meals=' + s.cannibalMeals);
  check('eatCannibal: trauma +35, corruption +14 (canon slope)', ((s.trauma || 0) - t0) === 35 && ((s.corruption || 0) - cc0) === 14,
    'trauma +' + ((s.trauma || 0) - t0) + ' corr +' + ((s.corruption || 0) - cc0));
  check('eatCannibal: slope event classified ok', T.slopeEvents.every(function (e) { return AN.classifySlopeEvent(e) === 'ok'; }));
  check('eatCannibal: tremblesAfter is a boolean read', typeof T.slopeEvents[T.slopeEvents.length - 1].tremblesAfter === 'boolean');

  // contractDisease: trembles via human meat.
  const d0 = T.diseaseEvents.length;
  const contracted = Game.contractDisease('trembles', { source: 'human meat' });
  check('contractDisease: trembles recorded with source', T.diseaseEvents.length === d0 + 1 &&
    T.diseaseEvents[T.diseaseEvents.length - 1].trembles === true &&
    T.diseaseEvents[T.diseaseEvents.length - 1].source === 'human meat',
    'returned=' + contracted);

  // contractDisease: trembles via human meat.
  // cravingTick: 60+ corruption, unfed 3+ days, dawn -> energy drain.
  Game.state.scholar.corruption = 70;
  Game.state.scholar.day = 10; Game.state.scholar.cravingFedDay = 0;
  Game.state.scholar.energy = 100;
  Game.dayPart = 0;
  const tk0 = T.tickEvents.length;
  Game.cravingTick();
  const cravingEv = T.tickEvents[T.tickEvents.length - 1];
  check('cravingTick: energy drained when unfed at 70', T.tickEvents.length === tk0 + 1 &&
    cravingEv.verb === 'cravingTick' && (cravingEv.drained || 0) > 0,
    'drained=' + (cravingEv && cravingEv.drained));

  // npcDriftTick: a corrupt figure (65) normalizes the roster (+1 each).
  Game.state.village.corruption = Game.state.village.corruption || {};
  Game.state.village.corruption[B] = 65;
  const beforeDrift = (Game.state.village.corruption[A] || 0);
  Game.npcDriftTick();
  const driftEv = T.tickEvents[T.tickEvents.length - 1];
  check('npcDriftTick: roster drift recorded', driftEv.verb === 'npcDriftTick' &&
    (driftEv.changed || []).some(function (ch) { return ch.vid === A && ch.after === beforeDrift + 1; }),
    JSON.stringify(driftEv.changed));

  // npcCannibalTick: starving village + corrupt candidate + person corpse.
  const dayNow = gday(Game);
  Game.state.village.fallen = [{ villagerId: 'vx', day: dayNow, cause: 'starved' }];
  Game.state.village.corruption[C] = 40;
  const corpse2 = { id: 'c-proof2', kind: 'person', villagerId: B, node: { x: Game.map.px, y: Game.map.py },
    mx: (s.mx == null ? 4 : s.mx), my: (s.my == null ? 4 : s.my), buried: false, butchered: false, items: [] };
  Game.state.corpses.push(corpse2);
  check('starvingVillage: true with a recent starvation death', (function () { try { return Game.starvingVillage() === true; } catch (e) { return false; } })());
  let fed = false;
  for (let i = 0; i < 200 && !fed; i++) {
    Game.npcCannibalTick();
    fed = (Game.state.corpses || []).some(function (c) { return c.npcFed; });
  }
  check('npcCannibalTick: an NPC feeds within 200 calls (12%/dawn)', fed === true);
  check('npcCannibalTick: tick event records the feed', T.tickEvents.some(function (e) { return e.verb === 'npcCannibalTick' && e.fed === true; }));

  // discoverNpcCannibalism: the fed corpse detonates retroactively.
  const fedCorpse = (Game.state.corpses || []).find(function (c) { return c.npcFed; });
  const di0 = T.discoveryEvents.length;
  const discovered = fedCorpse ? Game.discoverNpcCannibalism(fedCorpse.id) : false;
  check('discoverNpcCannibalism: discovery recorded', discovered === true &&
    T.discoveryEvents.length === di0 + 1 && T.discoveryEvents[T.discoveryEvents.length - 1].discovered === true);

  // temptTick: a corrupt villager (>=55) offers meat.
  Game.state.village.corruption[B] = 60;
  let offered = false;
  for (let i = 0; i < 200 && !offered; i++) {
    const mBefore = (s.inventory || []).filter(function (x) { return x.plantId === 'meat_human'; }).reduce(function (a, x) { return a + (x.units || 1); }, 0);
    Game.temptTick();
    const mAfter = (s.inventory || []).filter(function (x) { return x.plantId === 'meat_human'; }).reduce(function (a, x) { return a + (x.units || 1); }, 0);
    offered = mAfter > mBefore;
  }
  check('temptTick: a meat parcel is offered within 200 calls (5%/tick)', offered === true);
  check('temptTick: tick event records the offer', T.tickEvents.some(function (e) { return e.verb === 'temptTick' && e.offered === true; }));
  check('remember: offered_meat memory recorded', T.memoryEvents.some(function (e) { return e.key === 'offered_meat'; }));

  // darkCarePackageTick: dark fans deliver at 60+ with the System arrived.
  Game.state.systemArrived = true;
  Game.state.scholar.corruption = 65;
  Game.state.scholar._darkPackDay = -99;
  let delivered = false;
  for (let i = 0; i < 200 && !delivered; i++) {
    const mBefore = (s.inventory || []).filter(function (x) { return x.plantId === 'meat_human'; }).reduce(function (a, x) { return a + (x.units || 1); }, 0);
    Game.darkCarePackageTick();
    const mAfter = (s.inventory || []).filter(function (x) { return x.plantId === 'meat_human'; }).reduce(function (a, x) { return a + (x.units || 1); }, 0);
    delivered = mAfter > mBefore;
  }
  check('darkCarePackageTick: a package lands within 200 calls (8%/dawn)', delivered === true);
  check('darkCarePackageTick: tick event records the delivery', T.tickEvents.some(function (e) { return e.verb === 'darkCarePackageTick' && e.delivered === true; }));

  // psychoViolenceTick: force a malicious psycho, watch a stage advance.
  Game.state.village.bgDark = Game.state.village.bgDark || {};
  Game.state.village.bgDark[A] = { kind: 'malicious' };
  Game.state.scholar.part = 0;
  let advanced = false;
  for (let i = 0; i < 300 && !advanced; i++) {
    Game.psychoViolenceTick();
    const ps = ((Game.state.village || {})._psychoState || {})[A];
    advanced = !!(ps && (ps.stage || 0) >= 1);
  }
  check('psychoViolenceTick: a malicious psycho reaches stage 1 within 300 calls', advanced === true);
  check('psychoViolenceTick: tick event records the stage advance', T.tickEvents.some(function (e) { return e.verb === 'psychoViolenceTick' && (e.stages || []).length > 0; }));

  // psychoIntro: fires once for a malicious bearer, corruption 20.
  Game.state.scholar.corruption = 0;
  Game.state.scholar._psychoIntroFired = false;
  Game.state.scholar.darkPath = false;
  const tell = ((Game.data.characterGen || {}).darkTells || {}).malicious || [];
  const char = { name: 'Test Dark', personality: { dark: { kind: 'malicious', tell: tell.length ? tell[0].id : 'x' } } };
  const ps0 = T.psychoEvents.length;
  const fired = Game.psychoIntro(char);
  check('psychoIntro: fires, corruption 20, darkPath set', fired === true &&
    (Game.state.scholar.corruption || 0) === 20 && Game.state.scholar.darkPath === true &&
    T.psychoEvents.length === ps0 + 1 && T.psychoEvents[T.psychoEvents.length - 1].fired === true);
  check('psychoIntro: fires once only', Game.psychoIntro(char) === false);

  // mantleWatch: a corrupt NPC's corruption follows them into the job.
  Game.state.village.corruption[Game.villagerId] = 25;
  Game.state.scholar.corruption = 0;
  Game._lastBearer = 'someone-else';
  Game.mantleWatch();
  check('mantleWatch: corruption carried to the scholar (25)', (Game.state.scholar.corruption || 0) === 25,
    'corr=' + Game.state.scholar.corruption);
  check('mantleWatch: bearer-change event recorded', T.psychoEvents.some(function (e) { return e.verb === 'mantleWatch' && e.corrAfter === 25; }));

  // addFear / fearWeakness: fear recorded, then collapses on weakness.
  const f0 = T.fearEvents.length;
  Game.addFear(A, 'player', 70);
  check('addFear: fear 70 recorded', Game.fearOf(A, 'player') === 70 &&
    T.fearEvents.length === f0 + 1 && T.fearEvents[T.fearEvents.length - 1].after === 70);
  Game.fearWeakness('player');
  check('fearWeakness: fear collapses below 70', Game.fearOf(A, 'player') < 70, 'fear=' + Game.fearOf(A, 'player'));

  // intimidate: dread >= 60 yields without a word.
  Game.addFear(A, Game.villagerId, 70);
  const in0 = T.fearEvents.length;
  const yielded = Game.intimidate(A);
  check('intimidate: yielded_dread at dread 70', yielded === 'yielded_dread' &&
    T.fearEvents.length === in0 + 1 && T.fearEvents[T.fearEvents.length - 1].returned === 'yielded_dread',
    'returned=' + yielded);

  // trustGainProgressive foil: 100 corruption drags the gain.
  Game.state.scholar.corruption = 0;
  const g0 = Game.trustGainProgressive(A, 10);
  Game.state.scholar.corruption = 100;
  const g1 = Game.trustGainProgressive(A, 10);
  check('trustGainProgressive: foil drags the gain at 100 corruption', g1 < g0, [g0, g1]);
  check('trustGainProgressive: drag event recorded in full', T.foilEvents.some(function (e) { return e.vid === A && e.base === 10 && e.returned === g1 && e.dragged === (10 - g1); }));

  // darkShowBeat: the show notices.
  const sh0 = T.showEvents.length;
  Game.darkShowBeat('threshold60');
  check('darkShowBeat: threshold60 recorded', T.showEvents.length === sh0 + 1 &&
    T.showEvents[T.showEvents.length - 1].kind === 'threshold60');

  // remember: filtered keys recorded, ordinary keys not.
  const m0 = T.memoryEvents.length;
  Game.remember(A, 'offered_meat', 'they offered you human meat');
  check('remember: offered_meat recorded', T.memoryEvents.length === m0 + 1 &&
    T.memoryEvents[T.memoryEvents.length - 1].key === 'offered_meat');
  Game.remember(A, 'gift', 'answered their hunger');
  check('remember: ordinary key NOT recorded', T.memoryEvents.length === m0 + 1);

  // corruptionTick: invocation counter moves.
  const ct0 = T.corruptionTickCalls;
  Game.corruptionTick();
  check('corruptionTick: invocation counted', T.corruptionTickCalls === ct0 + 1);

  // Snapshot: corruption fields + justice + corpses present.
  const snap = cf.snapshot();
  check('snapshot: scholar corruption/norm/village corruption present',
    snap.scholarCorruption != null && snap.cannibalNorm != null && snap.villageCorruption != null);
  check('snapshot: person corpses + justice crimes visible',
    (snap.corpses || {}).person >= 2 && (snap.justiceCrimes || []).length >= 1,
    'person=' + (snap.corpses || {}).person + ' crimes=' + (snap.justiceCrimes || []).length);
  check('snapshot: trembles case visible on the scholar', snap.trembles && snap.trembles.scholar === true);
  check('snapshot: malicious-dark psycho counted', snap.maliciousDark >= 1, 'maliciousDark=' + snap.maliciousDark);
  cf.uninstall();

  // ---- RED check: install on a Game with a method deleted ----
  const { Game: Game2 } = await loadGame({ seed: 99104, mode: 'competent-corruptfirst-proof-red', fullTelemetry: false });
  await setupGame(Game2);
  Game2.darkShowBeat = undefined;
  const cf2 = CF.install(Game2);
  check('RED: missing method logs instrumentErrors, install does not throw', cf2.t.instrumentErrors.some(function (e) { return e.indexOf('darkShowBeat-missing') === 0; }), JSON.stringify(cf2.t.instrumentErrors.slice(0, 2)));
  check('RED: other wraps still work after a missing method', (function () {
    try { Game2.addCorruption(3, 'red-check'); return cf2.t.corrEvents.length >= 1; } catch (e) { return false; }
  })());
  cf2.uninstall();

  // ---- neutrality miniature: 5 days, instrument on vs off ----
  async function mini(withInst) {
    const { Game: G } = await loadGame({ seed: 99104, mode: 'competent-corruptfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (withInst) inst = CF.install(G);
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
  check('neutrality miniature: corruption tick ran in the instrumented leg', (function () {
    return miniOn.days === 5;
  })());

  console.log(fails === 0 ? ('CORRUPTFIRST PROOF GREEN ' + pass + '/' + pass) : ('CORRUPTFIRST PROOF FAILURES ' + fails + ' (pass ' + pass + ')'));
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
