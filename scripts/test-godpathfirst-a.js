// test-godpathfirst-a.js — proof for the godpath / godhood first-numbers
// instrument + analyzer (arm sim-godpathfirst-a, run fleshout-20261111T1115Z).
//
// Fixture leg (fast, always): every wrap proven live on fixture games
// (seed 99104 — the trustfirst fixture seed, not a band seed):
// kitSheet (direct + the live levelUpOffers path), chooseAbility
// (player pick, path-tagged), buildDecide (villager pick),
// npcLearnAbility (villager learns an offer), recognizeClass (rigged
// 4-ability berserker build -> class recognised, tele class_recognized),
// S.Godhood.checkGodhood (rigged complete brawler build -> fresh
// ['one_person_army']), S.Godhood.checkVillagerGodhood (rigged villager
// build -> fresh), checkPlayerGodhoodAscension /
// checkVillagerGodhoodAscension (Game attempts recorded),
// maybeGrantCapstoneItem (gift recorded, item granted),
// S.Godhood.recognitionCeremony / villagerRecognitionCeremony (recorded),
// the ten S.Godhood capstone verbs (all guarded — return null when the
// god is not active; the proof asserts the RECORD, not the outcome),
// useAbility (path-tagged magic, hasVerb flag), S.Godpath.villagerCast
// (returns false with no tbfight — the wrap records the attempt),
// tele cross-check (class_recognized live; godpath_deed / godpath_verb /
// villager_level_up / track_level_empty proven through the tele wrap by
// direct tele calls, since staging each engine scene needs a whole
// scene — the engine-side firing is the registerVerbs / deed-note code
// cited in the prereg), snapshot shape (10-god deedStatus + closeness,
// class, godhood store, deed book), and a RED check: installing on a
// Game with a method deleted logs instrumentErrors instead of throwing.
// Analyzer leg (pure): classifiers + reconcilers on synthetic objects
// (sheets, recognitions tele-vs-snapshot, ascensions fresh-vs-ceremony-
// vs-active, gifts, verbs incl. the passive hasVerb rule, deeds
// tele-vs-book, picks vs ability diffs).
// Neutrality miniature (live, 5 days): same seed, instrument on vs off,
// days + pantry + deaths identical.
// Usage: node scripts/test-godpathfirst-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const GP = require(path.join(__dirname, 'godpathfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'godpathfirst-analyze-20261111'));

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
function abilityDef(Game, id) {
  try { return (Game.data.abilities || []).find(function (a) { return a && a.id === id; }) || null; } catch (e) { return null; }
}

(async function () {
  // ---- analyzer leg (pure, no sim) ----
  check('classifySheetEvent: full sheet ok', AN.classifySheetEvent({ who: 'player', track: 'combat', level: 1, day: 5, offers: [{ id: 'rage', path: 'brawler' }] }) === 'ok');
  check('classifySheetEvent: missing offers unclassified', AN.classifySheetEvent({ who: 'player', track: 'combat', level: 1, day: 5 }) === 'unclassified');
  check('classifySheetEvent: offer without id unclassified', AN.classifySheetEvent({ who: 'player', track: 'combat', level: 1, day: 5, offers: [{ path: 'brawler' }] }) === 'unclassified');
  check('classifyRecognitionEvent: tele ok', AN.classifyRecognitionEvent({ type: 'class_recognized', data: { who: 'player', path: 'brawler', subclass: 'berserker', day: 12 } }) === 'ok');
  check('classifyRecognitionEvent: no subclass unclassified', AN.classifyRecognitionEvent({ type: 'class_recognized', data: { who: 'player', path: 'brawler', day: 12 } }) === 'unclassified');
  check('classifyDeedEvent: apex_hunt ok', AN.classifyDeedEvent({ type: 'godpath_deed', data: { who: 'v1', event: 'apex_hunt', day: 40 } }) === 'ok');
  check('classifyDeedEvent: unknown event unclassified', AN.classifyDeedEvent({ type: 'godpath_deed', data: { who: 'v1', event: 'bogus', day: 40 } }) === 'unclassified');
  check('classifyAscensionEvent: checkGodhood fresh ok', AN.classifyAscensionEvent({ kind: 'checkGodhood', who: 'player', fresh: ['one_person_army'], day: 100 }) === 'ok');
  check('classifyAscensionEvent: fresh not array unclassified', AN.classifyAscensionEvent({ kind: 'checkGodhood', who: 'player', fresh: null, day: 100 }) === 'unclassified');
  check('classifyVerbUseEvent: tele verb ok', AN.classifyVerbUseEvent({ type: 'godpath_verb', data: { ability: 'bribe', verb: 'bribe', day: 30 } }) === 'ok');
  check('classifyVerbUseEvent: no verb unclassified', AN.classifyVerbUseEvent({ type: 'godpath_verb', data: { ability: 'bribe', day: 30 } }) === 'unclassified');
  check('reconcileRecognitions: tele + snapshot agree, residue 0', (function () {
    const o = {
      teleEvents: [{ type: 'class_recognized', day: 12, data: { who: 'player', path: 'brawler', subclass: 'berserker', day: 12 } }],
      daily: [
        { day: 11, player: { class: null }, villagers: {} },
        { day: 12, player: { class: { path: 'brawler', subclass: 'berserker', since: 12, god: 'one_person_army' } }, villagers: {} },
      ],
    };
    const r = AN.reconcileRecognitions(o);
    return r.residue === 0 && r.teleCount === 1 && r.snapCount === 1;
  })());
  check('reconcileRecognitions: tele without snapshot is residue', (function () {
    const o = {
      teleEvents: [{ type: 'class_recognized', day: 12, data: { who: 'player', path: 'brawler', subclass: 'berserker', day: 12 } }],
      daily: [{ day: 12, player: { class: null }, villagers: {} }],
    };
    return AN.reconcileRecognitions(o).residue === 1;
  })());
  check('reconcileAscensions: fresh + ceremony + active agree, residue 0', (function () {
    const o = {
      ascensionEvents: [{ kind: 'checkGodhood', who: 'player', fresh: ['one_person_army'], day: 100 }],
      ceremonyEvents: [{ who: 'player', god: 'one_person_army', day: 100 }],
      daily: [
        { day: 99, player: { godhood: {} }, villagers: {} },
        { day: 100, player: { godhood: { recognized: { one_person_army: true }, active: ['one_person_army'] } }, villagers: {} },
      ],
    };
    const r = AN.reconcileAscensions(o);
    return r.residue === 0 && r.freshCount === 1;
  })());
  check('reconcileAscensions: fresh without ceremony is residue', (function () {
    const o = {
      ascensionEvents: [{ kind: 'checkGodhood', who: 'player', fresh: ['one_person_army'], day: 100 }],
      ceremonyEvents: [],
      daily: [{ day: 100, player: { godhood: { active: ['one_person_army'] } }, villagers: {} }],
    };
    return AN.reconcileAscensions(o).residue === 1;
  })());
  check('reconcileGifts: gift + snapshot agree, residue 0', (function () {
    const o = {
      capstoneGiftEvents: [{ who: 'player', newlyGifted: ['one_person_army'], day: 100 }],
      daily: [
        { day: 99, player: { godhood: {} }, villagers: {} },
        { day: 100, player: { godhood: { capstoneGifted: { one_person_army: true } } }, villagers: {} },
      ],
    };
    const r = AN.reconcileGifts(o);
    return r.residue === 0 && r.giftCount === 1;
  })());
  check('reconcileVerbs: player do-verb + tele agree, residue 0', (function () {
    const o = {
      teleEvents: [{ type: 'godpath_verb', day: 30, data: { ability: 'bribe', verb: 'bribe' } }],
      verbUseEvents: [{ ability: 'bribe', verb: 'bribe', hasVerb: true, day: 30 }],
    };
    const r = AN.reconcileVerbs(o);
    return r.residue === 0 && r.playerMatched === 1;
  })());
  check('reconcileVerbs: passive use without tele is NOT residue', (function () {
    const o = {
      teleEvents: [],
      verbUseEvents: [{ ability: 'blood_magic', verb: 'blood_magic', hasVerb: false, day: 30 }],
    };
    return AN.reconcileVerbs(o).residue === 0;
  })());
  check('reconcileVerbs: do-verb use without tele IS residue', (function () {
    const o = {
      teleEvents: [],
      verbUseEvents: [{ ability: 'bribe', verb: 'bribe', hasVerb: true, day: 30 }],
    };
    return AN.reconcileVerbs(o).residue === 1;
  })());
  check('reconcileVerbs: villager tele (who) needs no useAbility row', (function () {
    const o = {
      teleEvents: [{ type: 'godpath_verb', day: 30, data: { ability: 'bribe', verb: 'bribe', who: 'v1' } }],
      verbUseEvents: [],
    };
    const r = AN.reconcileVerbs(o);
    return r.residue === 0 && r.villagerTele === 1;
  })());
  check('reconcileDeeds: tele + book agree, residue 0', (function () {
    const o = {
      teleEvents: [{ type: 'godpath_deed', day: 40, data: { who: 'v1', event: 'apex_hunt', day: 40 } }],
      daily: [
        { day: 39, godpathDeeds: {}, switchboard: null },
        { day: 40, godpathDeeds: { v1: { apex_hunt: { day: 40 } } }, switchboard: null },
      ],
    };
    const r = AN.reconcileDeeds(o);
    return r.residue === 0 && r.teleCount === 1 && r.bookCount === 1;
  })());
  check('reconcileDeeds: book without tele is residue', (function () {
    const o = {
      teleEvents: [],
      daily: [{ day: 40, godpathDeeds: { v1: { apex_hunt: { day: 40 } } }, switchboard: null }],
    };
    return AN.reconcileDeeds(o).residue === 1;
  })());
  check('reconcilePicks: player pick appears in abilities, residue 0', (function () {
    const o = {
      pickEvents: [{ who: 'player', id: 'rage', day: 10 }],
      villagerPickEvents: [{ vid: 'v1', day: 12, decision: { id: 'blood_magic' } }],
      daily: [
        { day: 9, player: { abilities: [] }, villagers: { v1: { abilities: [] } } },
        { day: 10, player: { abilities: ['rage'] }, villagers: { v1: { abilities: [] } } },
        { day: 12, player: { abilities: ['rage'] }, villagers: { v1: { abilities: ['blood_magic'] } } },
      ],
    };
    return AN.reconcilePicks(o).residue === 0;
  })());
  check('analyzeSeed: band-shape summary present', (function () {
    const o = {
      seed: 1, mode: 'control', days: 150, gameDays: 150, endReason: 'days', won: false,
      villageLost: false, scaleRank: 'regional', maxWave: 4, standing: 200, endPantryKcal: 0,
      deaths: [], instrumentErrors: [], daily: [{ day: 1, player: { abilities: [], tracks: {}, trackStats: {}, godhood: {}, closeness: {}, deedStatus: {} }, villagers: {}, godpathDeeds: {} }],
      sheetEvents: [], pickEvents: [], villagerPickEvents: [], learnEvents: [],
      recognitionEvents: [], ascensionEvents: [], ceremonyEvents: [],
      capstoneGiftEvents: [], verbUseEvents: [], villagerCastEvents: [],
      capstoneVerbEvents: [], teleEvents: [], godpathSays: [], wrapLive: {}, wrapCounts: {},
    };
    const s = AN.analyzeSeed(o);
    return s.seed === 1 && s.sheets === 0 && s.opportunityEvents === 0 && s.ladder && Object.keys(s.ladder).length === 10;
  })());

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-godpathfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const S = globalThis.Scattering || {};
  const gp = GP.install(Game);
  const T = gp.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));
  check('install: Godhood + Godpath namespaces present', !!(S.Godhood && S.Godpath), 'Godhood=' + !!S.Godhood + ' Godpath=' + !!S.Godpath);

  const ids = roster(Game);
  check('fixture: roster has non-scholar villagers', ids.length >= 2, 'roster=' + ids.length);
  const A = ids[0];

  // kitSheet, direct + the live levelUpOffers path.
  const brawlerDefs = (Game.data.abilities || []).filter(function (a) { return a && a.path === 'brawler' && a.lane === 'magic'; });
  check('fixture: brawler magic defs exist', brawlerDefs.length >= 4, 'n=' + brawlerDefs.length);
  const sh0 = T.sheetEvents.length;
  const sheet = Game.kitSheet(brawlerDefs.slice(), 'player', 'combat', 1);
  check('kitSheet: direct call recorded with offers + paths', T.sheetEvents.length === sh0 + 1 &&
    Array.isArray(sheet) && sheet.length > 0 &&
    T.sheetEvents[T.sheetEvents.length - 1].offers.every(function (of) { return of.id && of.path === 'brawler'; }),
    'offers=' + JSON.stringify(T.sheetEvents[T.sheetEvents.length - 1] && T.sheetEvents[T.sheetEvents.length - 1].offers));
  const sh1 = T.sheetEvents.length;
  let luOk = false;
  try { const lu = Game.levelUpOffers('combat', 1); luOk = Array.isArray(lu); } catch (e) { luOk = false; }
  check('kitSheet: live levelUpOffers path calls kitSheet', luOk && T.sheetEvents.length === sh1 + 1, 'luOk=' + luOk);

  // recognizeClass on a rigged 4-ability berserker build.
  Game.state.scholar.day = 100;
  Game.state.scholar.abilities = ['blood_frenzy', 'rage', 'blood_magic', 'cannibal_frenzy'];
  const r0 = T.recognitionEvents.length;
  const tele0 = T.teleEvents.length;
  const rec = Game.recognizeClass('player');
  check('recognizeClass: berserker build recognised, recorded', rec && rec.path === 'brawler' && rec.subclass === 'berserker' &&
    T.recognitionEvents.length === r0 + 1 &&
    T.recognitionEvents[T.recognitionEvents.length - 1].path === 'brawler',
    'rec=' + JSON.stringify(rec));
  check('tele: class_recognized cross-checked', T.teleEvents.slice(tele0).some(function (e) { return e.type === 'class_recognized' && (e.data || {}).path === 'brawler'; }));

  // chooseAbility: player pick.
  Game.state.scholar.abilityChoices = [{ id: 'rage', name: 'Rage', description: 'x', flavor: '', src: 'level_up:combat', level: 1 }];
  const p0 = T.pickEvents.length;
  let chooseRet = null;
  try { chooseRet = Game.chooseAbility('rage'); } catch (e) { chooseRet = 'threw:' + e.message; }
  check('chooseAbility: player pick recorded with path', T.pickEvents.length === p0 + 1 &&
    T.pickEvents[T.pickEvents.length - 1].id === 'rage' &&
    T.pickEvents[T.pickEvents.length - 1].path === 'brawler', 'ret=' + chooseRet);

  // npcLearnAbility + buildDecide: villager learn + pick.
  const l0 = T.learnEvents.length;
  Game.npcLearnAbility(A, 'rage', 2, 'system-sheet');
  check('npcLearnAbility: villager learn recorded with path', T.learnEvents.length === l0 + 1 &&
    T.learnEvents[T.learnEvents.length - 1].vid === A &&
    T.learnEvents[T.learnEvents.length - 1].id === 'rage' &&
    T.learnEvents[T.learnEvents.length - 1].path === 'brawler');
  const vp0 = T.villagerPickEvents.length;
  let decRet = null;
  try { decRet = Game.buildDecide(A, brawlerDefs.slice(0, 3)); } catch (e) { decRet = 'threw:' + e.message; }
  check('buildDecide: villager pick recorded', T.villagerPickEvents.length === vp0 + 1 &&
    T.villagerPickEvents[T.villagerPickEvents.length - 1].vid === A &&
    Array.isArray(T.villagerPickEvents[T.villagerPickEvents.length - 1].offers) &&
    T.villagerPickEvents[T.villagerPickEvents.length - 1].offers.length === 3, 'ret=' + JSON.stringify(decRet));

  // useAbility on a path-tagged magic ability (rage: hand-written impl,
  // no `do` — hasVerb false; bribe: a `do` verb, refused outside combat).
  const u0 = T.verbUseEvents.length;
  let useRet = null;
  try { useRet = Game.useAbility('rage'); } catch (e) { useRet = 'threw:' + e.message; }
  check('useAbility: rage recorded, hasVerb false (passive)', T.verbUseEvents.length === u0 + 1 &&
    T.verbUseEvents[T.verbUseEvents.length - 1].ability === 'rage' &&
    T.verbUseEvents[T.verbUseEvents.length - 1].hasVerb === false, 'ret=' + useRet);
  const u1 = T.verbUseEvents.length;
  try { Game.useAbility('bribe'); } catch (e) {}
  check('useAbility: bribe recorded, hasVerb true (do-verb)', T.verbUseEvents.length === u1 + 1 &&
    T.verbUseEvents[T.verbUseEvents.length - 1].ability === 'bribe' &&
    T.verbUseEvents[T.verbUseEvents.length - 1].hasVerb === true);

  // villagerCast: no tbfight -> false, wrap records the attempt.
  const vc0 = T.villagerCastEvents.length;
  let castRet = 'n/a';
  try { castRet = S.Godpath.villagerCast(Game, { villagerId: A }); } catch (e) { castRet = 'threw:' + e.message; }
  check('villagerCast: no-fight call recorded, returns false', castRet === false && T.villagerCastEvents.length === vc0 + 1,
    'ret=' + castRet);

  // Capstone verbs: all guarded, return null when the god is not active.
  const cv0 = T.capstoneVerbEvents.length;
  const sch = Game.state.scholar;
  const capCalls = [
    function () { return S.Godhood.raiseEcho(sch, { id: A }); },
    function () { return S.Godhood.chooseTerms(sch, 'ambush'); },
    function () { return S.Godhood.feedMultitude(sch); },
    function () { return S.Godhood.turnPain(sch, 10); },
    function () { return S.Godhood.noLiesCheck(sch); },
    function () { return S.Godhood.namePrice(sch, 'item_x', null); },
    function () { return S.Godhood.buyOff(sch, 1); },
    function () { return S.Godhood.walkHorizon(sch, 1); },
    function () { return S.Godhood.phaseOut(sch); },
    function () { return S.Godhood.takeWound(sch, { id: A }, 5); },
  ];
  capCalls.forEach(function (fn) { try { fn(); } catch (e) { /* guarded verbs return null; a throw is a fixture finding, not a wrap failure */ } });
  const recordedVerbs = T.capstoneVerbEvents.slice(cv0).map(function (e) { return e.verb; });
  check('capstone verbs: all ten recorded', ['raiseEcho', 'chooseTerms', 'feedMultitude', 'turnPain', 'noLiesCheck', 'namePrice', 'buyOff', 'walkHorizon', 'phaseOut', 'takeWound']
    .every(function (v) { return recordedVerbs.indexOf(v) >= 0; }), JSON.stringify(recordedVerbs));

  // Ascension rig: complete brawler build (payoff + 3, class since day 50,
  // day 100 -> deedClassDays satisfied, minDay satisfied).
  Game.state.scholar.abilities = ['blood_frenzy', 'rage', 'blood_magic', 'cannibal_frenzy'];
  Game.state.scholar.godpath = { path: 'brawler', subclass: 'berserker', since: 50, god: 'one_person_army' };
  Game.state.scholar.day = 100;
  const gh = (S.Godhood.godhoods() || []).find(function (g) { return g.id === 'one_person_army'; });
  check('fixture: one_person_army godhood derived', !!gh, 'gh=' + !!gh);
  let closeness = null;
  try { closeness = S.Godhood.godhoodCloseness(Game.state.scholar, gh, 100); } catch (e) {}
  check('godhoodCloseness: rigged build complete', !!(closeness && closeness.complete && closeness.kit >= 4 && closeness.coreHit && closeness.synergy && closeness.dayOk),
    JSON.stringify(closeness));

  // Capstone gift FIRST (engine order: gift, then check, then ceremony).
  const g0 = T.capstoneGiftEvents.length;
  let giftRet = null;
  try { giftRet = Game.maybeGrantCapstoneItem(null, true); } catch (e) { giftRet = 'threw:' + e.message; }
  check('maybeGrantCapstoneItem: one_person_army gifted, recorded', T.capstoneGiftEvents.length === g0 + 1 &&
    (T.capstoneGiftEvents[T.capstoneGiftEvents.length - 1].newlyGifted || []).indexOf('one_person_army') >= 0,
    'gifted=' + JSON.stringify(T.capstoneGiftEvents[T.capstoneGiftEvents.length - 1] && T.capstoneGiftEvents[T.capstoneGiftEvents.length - 1].newlyGifted));

  // checkGodhood through the namespace (the live call path).
  const a0 = T.ascensionEvents.length;
  let fresh = null;
  try { fresh = S.Godhood.checkGodhood(Game.state.scholar, 100); } catch (e) { fresh = 'threw:' + e.message; }
  check('checkGodhood: fresh includes one_person_army, recorded', Array.isArray(fresh) && fresh.indexOf('one_person_army') >= 0 &&
    T.ascensionEvents.length === a0 + 1 &&
    (T.ascensionEvents[T.ascensionEvents.length - 1].fresh || []).indexOf('one_person_army') >= 0,
    'fresh=' + JSON.stringify(fresh));

  // Ceremony through the namespace.
  const c0 = T.ceremonyEvents.length;
  try { S.Godhood.recognitionCeremony(Game, 'one_person_army', [], 'dawn'); } catch (e) {}
  check('recognitionCeremony: recorded with god + witnesses', T.ceremonyEvents.length === c0 + 1 &&
    T.ceremonyEvents[T.ceremonyEvents.length - 1].god === 'one_person_army');

  // checkPlayerGodhoodAscension: Game attempt recorded (already ascended,
  // so no fresh ids — the proof asserts the RECORD, not the outcome).
  const pa0 = T.ascensionEvents.length;
  try { Game.checkPlayerGodhoodAscension(); } catch (e) {}
  check('checkPlayerGodhoodAscension: attempt recorded', T.ascensionEvents.slice(pa0).some(function (e) { return e.kind === 'checkPlayerGodhoodAscension'; }) &&
    T.ascensionEvents.length > pa0, 'new=' + JSON.stringify(T.ascensionEvents.slice(pa0).map(function (e) { return e.kind; })));

  // Villager ascension rig: same build on villager A.
  const v = Game.state.village;
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[A] = ['blood_frenzy', 'rage', 'blood_magic', 'cannibal_frenzy'];
  const vrec = Game.recognizeClass(A);
  check('recognizeClass: villager build recognised', !!(vrec && vrec.path === 'brawler'), 'vrec=' + JSON.stringify(vrec));
  try {
    v.npcGodpath = v.npcGodpath || {};
    if (v.npcGodpath[A]) v.npcGodpath[A].since = 50;
  } catch (e) {}
  const va0 = T.ascensionEvents.length;
  let vfresh = null;
  try { vfresh = S.Godhood.checkVillagerGodhood(Game, A); } catch (e) { vfresh = 'threw:' + e.message; }
  check('checkVillagerGodhood: fresh includes one_person_army, recorded', Array.isArray(vfresh) && vfresh.indexOf('one_person_army') >= 0 &&
    T.ascensionEvents.length === va0 + 1 &&
    (T.ascensionEvents[T.ascensionEvents.length - 1].fresh || []).indexOf('one_person_army') >= 0,
    'vfresh=' + JSON.stringify(vfresh));
  const vc2 = T.ceremonyEvents.length;
  try { S.Godhood.villagerRecognitionCeremony(Game, A, 'one_person_army', []); } catch (e) {}
  check('villagerRecognitionCeremony: recorded', T.ceremonyEvents.length === vc2 + 1 &&
    T.ceremonyEvents[T.ceremonyEvents.length - 1].god === 'one_person_army' &&
    T.ceremonyEvents[T.ceremonyEvents.length - 1].who === A);
  const va1 = T.ascensionEvents.length;
  try { Game.checkVillagerGodhoodAscension(A); } catch (e) {}
  check('checkVillagerGodhoodAscension: attempt recorded', T.ascensionEvents.slice(va1).some(function (e) { return e.kind === 'checkVillagerGodhoodAscension'; }) &&
    T.ascensionEvents.length > va1, 'new=' + JSON.stringify(T.ascensionEvents.slice(va1).map(function (e) { return e.kind; })));

  // Tele wrap: deed / verb / level-up / empty-sheet types proven through
  // the tele wrap itself (staging each engine scene needs a whole scene;
  // the engine-side firing is the deed-note / registerVerbs code).
  const te0 = T.teleEvents.length;
  Game.tele('godpath_deed', { t: 'deed', who: A, event: 'apex_hunt', day: 40 });
  Game.tele('godpath_verb', { ability: 'bribe', verb: 'bribe' });
  Game.tele('villager_level_up', { vid: A, track: 'combat', level: 1, kept: false, offers: ['rage'] });
  Game.tele('track_level_empty', { track: 'combat', level: 9 });
  check('tele: godpath_deed / godpath_verb / villager_level_up / track_level_empty recorded',
    T.teleEvents.length === te0 + 4 &&
    ['godpath_deed', 'godpath_verb', 'villager_level_up', 'track_level_empty']
      .every(function (ty, i) { return T.teleEvents[te0 + i].type === ty; }));

  // Snapshot shape: 10-god deedStatus + closeness, class, godhood store,
  // deed book, switchboard, table fields.
  const snap = gp.snapshot();
  check('snapshot: player deedStatus covers 10 gods', snap.player && snap.player.deedStatus &&
    Object.keys(snap.player.deedStatus).length === 10, 'n=' + (snap.player && Object.keys(snap.player.deedStatus).length));
  check('snapshot: player closeness covers 10 gods, brawler complete', snap.player && snap.player.closeness &&
    Object.keys(snap.player.closeness).length === 10 &&
    snap.player.closeness.one_person_army && snap.player.closeness.one_person_army.complete === true);
  check('snapshot: player class is brawler/berserker', snap.player && snap.player.class && snap.player.class.path === 'brawler');
  check('snapshot: player godhood store has the ascension', snap.player && snap.player.godhood &&
    ((snap.player.godhood.active || []).indexOf('one_person_army') >= 0 ||
     (snap.player.godhood.recognized || {}).one_person_army),
    JSON.stringify(snap.player && snap.player.godhood));
  check('snapshot: villager A class + closeness present', snap.villagers && snap.villagers[A] &&
    snap.villagers[A].class && snap.villagers[A].class.path === 'brawler' &&
    snap.villagers[A].closeness && snap.villagers[A].closeness.one_person_army);
  check('snapshot: deed book + switchboard + table fields present', snap.godpathDeeds != null && 'switchboard' in snap &&
    'tableAnnounced' in snap && 'tableDone' in snap);
  console.log('    instrument errors at fixture end: ' + JSON.stringify(T.instrumentErrors.slice(0, 5)));
  gp.uninstall();

  // ---- RED check: install on a Game with a method deleted ----
  const { Game: Game3 } = await loadGame({ seed: 99104, mode: 'competent-godpathfirst-proof-red', fullTelemetry: false });
  await setupGame(Game3);
  Game3.kitSheet = undefined;
  const gp3 = GP.install(Game3);
  check('RED: missing method logs instrumentErrors, install does not throw', gp3.t.instrumentErrors.some(function (e) { return e.indexOf('kitSheet-missing') === 0; }), JSON.stringify(gp3.t.instrumentErrors.slice(0, 2)));
  check('RED: other wraps still work after a missing method', (function () {
    try { Game3.recognizeClass('player'); return gp3.t.recognitionEvents.length >= 1; } catch (e) { return false; }
  })());
  gp3.uninstall();

  // ---- neutrality miniature: 5 days, instrument on vs off ----
  async function mini(withInst) {
    const { Game: G } = await loadGame({ seed: 99104, mode: 'competent-godpathfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (withInst) inst = GP.install(G);
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

  console.log(fails === 0 ? ('GODPATHFIRST PROOF GREEN ' + pass + '/' + pass) : ('GODPATHFIRST PROOF FAILURES ' + fails + ' (pass ' + pass + ')'));
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
