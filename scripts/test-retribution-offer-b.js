// test-retribution-offer-b.js — proof test for sim-retribution-offer-b
// (finding #2318: RETRIBUTION NEVER EXERCISED BY COMPETENT PLAY).
// Proves the OFFER instrument: every ability sheet the System puts in
// front of the scholar is captured with source + ids in order + scholar
// state, and every resolution is classified (accepted with position /
// declined-by-position / stalled-full-slots / kept / trampled /
// pending-at-end). A staged retribution offer — via the Bulwark payoff
// lean on a non-combat track's sheet — is seen and classified.
// Run: node scripts/test-retribution-offer-b.js [--game]
//   (exit 0 = all green; --game runs the live-game legs)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const D = require(path.join(REPO, 'scripts', 'retribution-offer-driver-20261114'));
const A = require(path.join(REPO, 'scripts', 'retribution-offer-analyze-20261114'));

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// §1 — the analyzer on synthetic corpora (no game load).
function synthDoc(seed, offers, endState, extra) {
  const d = Object.assign({
    seed: seed, days: 150, endReason: 'survived', won: false, maxWave: 4,
    standing: 199, scaleRank: 'regional',
    offers: offers, villagerOffers: [], villagerGrants: [],
    offerCount: offers.length, retributionOfferCount: offers.filter(function (o) { return o.retributionPos >= 0; }).length,
    instrumentErrors: [], instrumentMissing: [],
    endState: endState, deaths: [], samples: null,
  }, extra || {});
  return d;
}
function synthOffer(seq, source, ids, status, extra) {
  return Object.assign({
    seq: seq, day: 10, source: source, src: source === 'level_up' ? 'level_up:combat' : null,
    track: source === 'level_up' ? 'combat' : null, level: 1,
    ids: ids, retributionPos: ids.indexOf('retribution'),
    slots: 3, heldCount: 2, combatKitHeldCount: 0, combatKitHeld: [],
    tracks: { combat: { level: 1, xp: 18 } }, classRec: null,
    queueDepth: 0, trackStats: {}, status: status,
    resolution: status === 'accepted' ? { id: ids[0], position: 0, replaced: null, slotsFullBefore: false } : null,
    stallAttempts: [], declinedByPosition: [],
  }, extra || {});
}
const END_OK = {
  scholarHeld: ['rage', 'war_cry'], scholarHeldCount: 2, hasRetribution: false,
  heldButNeverOffered: [], tracks: { combat: { level: 1, xp: 18 } }, classRec: null,
  pendingSheet: [], pendingSheetSrcs: [], queueDepth: 0, trackStats: { offered: 1, picked: 1 },
  npcScanned: 12, npcScan: [], npcRetributionHolders: [], npcOfferedRetribution: [],
};
const agg1 = A.analyze([synthDoc(190391, [
  synthOffer(1, 'level_up', ['adrenaline_surge', 'rage', 'war_cry'], 'accepted'),
  synthOffer(2, 'level_up', ['adrenaline_control', 'retribution', 'phoenix_clause'], 'accepted',
    { resolution: { id: 'adrenaline_control', position: 0, replaced: null, slotsFullBefore: false }, declinedByPosition: ['retribution', 'phoenix_clause'] }),
  synthOffer(3, 'arrival', ['survivor', 'cold_blooded', 'lucky_rock'], 'accepted'),
], END_OK)]);
t('analyzer: counts offers by source', agg1.offers === 3 && agg1.bySource.level_up === 2 && agg1.bySource.arrival === 1, JSON.stringify(agg1.bySource));
t('analyzer: retribution offer counted once, position 1', agg1.retributionOffers === 1 && agg1.retributionPositions[1] === 1, JSON.stringify(agg1.retributionPositions));
t('analyzer: declined-by-position counts retribution', agg1.declinedByPosition === 1, 'got ' + agg1.declinedByPosition);
t('analyzer: combat level-ups counted', agg1.combatLevelUps === 2, 'got ' + agg1.combatLevelUps);
t('analyzer: GO bars pass on the clean corpus', A.checkGoBars(agg1).length === 0, A.checkGoBars(agg1).join('; '));

const agg2 = A.analyze([synthDoc(190391, [
  synthOffer(1, 'level_up', ['adrenaline_surge', 'rage', 'war_cry'], 'unattributed',
    { resolution: { id: 'rage', day: 10 } }),
], END_OK)]);
t('analyzer: unattributed offer fails GO bar (a)', A.checkGoBars(agg2).some(function (f) { return f.indexOf('(a)') === 0; }), A.checkGoBars(agg2).join('; '));

const agg3 = A.analyze([synthDoc(190391, [
  synthOffer(1, 'prize', ['retribution', 'rage', 'war_cry'], 'accepted'),
], END_OK)]);
t('analyzer: retribution via a non-level-up source fails GO bar (c)', A.checkGoBars(agg3).some(function (f) { return f.indexOf('(c)') === 0; }), A.checkGoBars(agg3).join('; '));

const agg4 = A.analyze([synthDoc(190391, [synthOffer(1, 'level_up', ['rage'], 'accepted')],
  END_OK, { instrumentErrors: ['pumpLevelUps-throw: boom'] })]);
t('analyzer: instrument errors fail GO bar (f)', A.checkGoBars(agg4).some(function (f) { return f.indexOf('(f)') === 0; }), A.checkGoBars(agg4).join('; '));

const agg5 = A.analyze([synthDoc(190391, [synthOffer(1, 'level_up', ['rage'], 'accepted')],
  Object.assign({}, END_OK, { npcScanned: 0 }))]);
t('analyzer: empty NPC scan fails GO bar (d)', A.checkGoBars(agg5).some(function (f) { return f.indexOf('(d)') === 0; }), A.checkGoBars(agg5).join('; '));

// §2+ — GAME-LEVEL legs (runs only with --game).
if (process.argv.indexOf('--game') !== -1) (async function () {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 190391, mode: 'retribution-offer-proof' });
  await setupGame(Game);
  const inst = D.installOfferInstrument(Game);
  t('G1 install: no missing methods', inst.missing.length === 0, 'missing: ' + inst.missing.join(','));
  t('G1 install: no errors at install', inst.errors.length === 0, inst.errors.join('; '));

  const s = Game.state.scholar;
  // Six slots for the staged legs (abilitySlots reads integration:
  // 80 -> 6). Without this the staged abilities overfill the fresh
  // scholar's 1 slot and every staged pick stalls.
  s.integration = 80;
  const combatKit = (Game.trackData().kits || {}).combat || [];
  const isCombatKit = function (id) { return combatKit.indexOf(id) >= 0; };

  // G2 — a real combat level-up offer is captured end-to-end.
  Game.state.systemArrived = true;
  s.levelUpQueue = [{ track: 'combat', level: 1, xp: 18 }];
  const pumped = Game.pumpLevelUps();
  t('G2 pump opens a sheet', pumped === true && (s.abilityChoices || []).length === 3, 'pumped=' + pumped + ' choices=' + JSON.stringify(s.abilityChoices));
  t('G2 offer captured: level_up:combat, 3 ids, all combat kit',
    inst.offers.length === 1 && inst.offers[0].source === 'level_up' && inst.offers[0].track === 'combat'
    && inst.offers[0].ids.length === 3 && inst.offers[0].ids.every(isCombatKit),
    JSON.stringify(inst.offers[0] && inst.offers[0].ids));
  const g2pick = inst.offers[0].ids[0];
  Game.chooseAbility(g2pick);
  t('G2 accept: offer resolved accepted, position 0, id held',
    inst.offers[0].status === 'accepted' && inst.offers[0].resolution
    && inst.offers[0].resolution.id === g2pick && inst.offers[0].resolution.position === 0
    && D.heldIds(Game).indexOf(g2pick) >= 0,
    JSON.stringify(inst.offers[0].resolution));

  // G3 — staged retribution offer via the Bulwark payoff lean: hold 3
  // bulwark-subclass abilities, get recognised as Bulwark, then a
  // FIELD level-up sheet must carry retribution (payoffAnyTrack).
  const defOf = function (id) { return (Game.data.abilities || []).find(function (a) { return a.id === id; }); };
  const mk = function (id) { const d = defOf(id); return { id: id, name: (d && d.name) || id, desc: (d && d.description) || '', level: 1, xp: 0 }; };
  s.abilities.push(mk('chitin_skin'), mk('leech'), mk('aegis_link'));
  let rec = null;
  try { rec = Game.recognizeClass ? Game.recognizeClass('player') : null; } catch (e) { rec = null; }
  if (!rec) { try { rec = Game.godpathClass ? Game.godpathClass('player') : null; } catch (e) {} }
  t('G3 Bulwark recognised (3 bulwark-subclass abilities)',
    !!(rec && rec.path === 'shieldbearer' && rec.subclass === 'bulwark'), JSON.stringify(rec));
  s.levelUpQueue = [{ track: 'field', level: 1, xp: 18 }];
  Game.pumpLevelUps();
  const g3 = inst.offers[inst.offers.length - 1];
  t('G3 payoff lean: field sheet carries retribution',
    !!(g3 && g3.source === 'level_up' && g3.track === 'field' && g3.retributionPos >= 0),
    JSON.stringify(g3 && g3.ids));
  const g3pos = g3 ? g3.retributionPos : -1;
  const g3take = g3.ids[0];
  Game.chooseAbility(g3take);
  if (g3pos === 0) {
    t('G3 resolution: retribution at position 0 is accepted',
      g3.status === 'accepted' && g3.resolution && g3.resolution.id === 'retribution'
      && D.heldIds(Game).indexOf('retribution') >= 0, JSON.stringify(g3.resolution));
  } else {
    t('G3 resolution: retribution at position ' + g3pos + ' is declined-by-position',
      g3.status === 'accepted' && g3.resolution && g3.resolution.id === g3take
      && (g3.declinedByPosition || []).indexOf('retribution') >= 0
      && D.heldIds(Game).indexOf('retribution') < 0, JSON.stringify(g3.resolution));
  }

  // G4 — full slots: a level-up sheet stalls, classified, sheet stays.
  s.abilities = [mk('chitin_skin'), mk('leech'), mk('aegis_link'), mk('lucky_rock'), mk('night_eyes'), mk('green_whisper')];
  s.levelUpQueue = [{ track: 'combat', level: 1, xp: 18 }];
  Game.pumpLevelUps();
  const g4 = inst.offers[inst.offers.length - 1];
  t('G4 full-slots sheet opens', !!(g4 && g4.ids.length === 3), JSON.stringify(g4 && g4.ids));
  const g4idsBefore = D.choiceIds(Game).slice();
  Game.chooseAbility(g4.ids[0]);
  t('G4 stall: sheet still pending after the attempt',
    D.choiceIds(Game).length === 3 && JSON.stringify(D.choiceIds(Game)) === JSON.stringify(g4idsBefore),
    'choices now: ' + JSON.stringify(D.choiceIds(Game)));
  t('G4 stall: attempt classified stalled-full-levelup, offer still pending',
    g4.stallAttempts.length === 1 && g4.stallAttempts[0].class === 'stalled-full-levelup' && g4.status === 'pending',
    JSON.stringify(g4.stallAttempts) + ' status=' + g4.status);

  // G5 — a villager level-up offer is captured.
  const roster = ((Game.state.village || {}).roster || []).slice();
  t('G5 roster non-empty', roster.length > 0, 'roster=' + roster.length);
  let vo = null;
  if (roster.length) {
    try { Game.villagerLevelUpOffers(roster[0], 'combat', 1); } catch (e) { inst.errors.push('test-villager-offer-throw: ' + String(e.message).slice(0, 80)); }
    vo = inst.villagerOffers[inst.villagerOffers.length - 1];
  }
  t('G5 villager offer captured: 3 ids, all combat kit',
    !!(vo && vo.vid === roster[0] && vo.ids.length === 3 && vo.ids.every(isCombatKit)),
    JSON.stringify(vo));

  // G6 — keepAbilities resolves the stalled sheet as kept.
  Game.keepAbilities();
  t('G6 keep: stalled sheet resolved as kept, sheet cleared',
    g4.status === 'kept' && D.choiceIds(Game).length === 0, 'status=' + g4.status + ' choices=' + D.choiceIds(Game).length);

  // G7 — end state: direct grants named, NPC scan non-empty.
  const end = inst.endState();
  t('G7 endState: staged abilities listed held-but-never-offered',
    end.heldButNeverOffered.indexOf('chitin_skin') >= 0, JSON.stringify(end.heldButNeverOffered));
  t('G7 endState: NPC scan non-empty', end.npcScanned > 0, 'scanned=' + end.npcScanned);
  t('G7 instrument: zero wrap errors across the game legs', inst.errors.length === 0, inst.errors.join('; '));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

if (process.argv.indexOf('--game') === -1) {
  console.log('\n' + pass + ' passed, ' + fail + ' failed (instrument legs only; re-run with --game for the live legs)');
  process.exitCode = fail ? 1 : 0;
}
