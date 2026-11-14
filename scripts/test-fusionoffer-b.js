// test-fusionoffer-b.js — proof test for sim-fusionoffer-b
// (findings #2326 + #2327, filed by sim-retribution-offer-b).
//
// #2326: maybeOfferFusionReactor overwrites whatever ability sheet is
// pending (it only checks for a pending fusion_reactor choice,
// game.js:25883) — 2x on the retribution band, each time discarding a
// 3-choice contest-prize sheet the scholar had not answered.
// FIX: defer while ANY sheet is pending (same guard shape as
// pumpLevelUps / _cxPrizeAbilityOffer); the offer recurs on the next
// day-part tick / pellet arrival, so deferral loses nothing.
//
// #2327: the contest prize bag offers fusion_reactor regardless of
// pellet possession; abilityOnAcquire revokes it when no pellet is
// found (game.js:25819-25852) — the offer is a taunt the install
// dissolves (seed 190395 day 34). FIX: only offer fusion_reactor
// when the scholar holds the pellet (hasFusionPellet, the same
// possession condition abilityOnAcquire uses).
//
// Fixture (Steve 2026-11-13): a mid-game scholar — integration 80
// (6 slots), two early-kit abilities held (lucky_rock, green_thumb),
// machete + bark armor in the pack, pellet present/absent per leg.
// Never a fresh un-geared solo scholar.
//
// Run: node scripts/test-fusionoffer-b.js
//   (exit 0 = all green)
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async function () {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 190391, mode: 'fusionoffer-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  const defOf = function (id) { return (Game.data.abilities || []).find(function (a) { return a.id === id; }); };
  const mk = function (id) { const d = defOf(id); return { id: id, name: (d && d.name) || id, desc: (d && d.description) || '', level: 1, xp: 0 }; };
  const choiceIds = function () { return ((s.abilityChoices || []).map(function (c) { return (c && c.id) || c; })); };
  const heldIds = function () { return ((s.abilities || []).map(function (a) { return (a && a.id) || a; })); };
  const hasPellet = function () { return Game.hasFusionPellet(); };
  const givePellet = function () { s.inventory = s.inventory || []; s.inventory.push({ itemId: 'fusion_pellet', units: 1 }); };
  const takePellet = function () { s.inventory = (s.inventory || []).filter(function (i) { return (i && ((i.itemId || i.id) !== 'fusion_pellet')); }); };

  // --- Encounter-gear fixture (mid-game scholar) ---
  s.integration = 80; // 6 slots
  s.abilities = [mk('lucky_rock'), mk('green_thumb')];
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'machete', units: 1 }, { itemId: 'bark_armor', units: 1 });
  Game.state.systemArrived = true;
  t('F0 fixture: 6 slots, 2 early-kit abilities, machete + bark armor packed',
    Game.abilitySlots() === 6 && heldIds().length === 2
    && s.inventory.some(function (i) { return (i.itemId || i.id) === 'machete'; })
    && s.inventory.some(function (i) { return (i.itemId || i.id) === 'bark_armor'; }),
    'slots=' + Game.abilitySlots() + ' held=' + JSON.stringify(heldIds()));
  t('F0 fixture: no pellet at start, no reactor held',
    !hasPellet() && heldIds().indexOf('fusion_reactor') < 0, 'pellet=' + hasPellet());

  // --- Narration capture (sense leg): wrap say/sysSay, count fusion lines ---
  const said = [];
  const origSay = Game.say.bind(Game);
  const origSysSay = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (m) { said.push({ fn: 'say', m: String(m) }); return origSay(m); };
  if (origSysSay) Game.sysSay = function (m) { said.push({ fn: 'sysSay', m: String(m) }); return origSysSay(m); };
  const fusionLines = function () { return said.filter(function (l) { return /FUSION|PELLET|REACTOR/i.test(l.m); }); };
  const fusionLinesSince = function (n) { return fusionLines().slice(n); };

  // --- #2326 leg F1: pending prize sheet + pellet + fusion offer ---
  // The retribution band's 190395 day-75 trample, staged verbatim.
  s.abilityChoices = [
    { id: 'switcheroo', name: 'Switcheroo', description: 'Swap places.', flavor: '', src: 'prize' },
    { id: 'aegis_link', name: 'Aegis Link', description: 'Share a shield.', flavor: '', src: 'prize' },
    { id: 'bird_whisperer', name: 'Bird Whisperer', description: 'Birds talk.', flavor: '', src: 'prize' },
  ];
  givePellet();
  const saidBeforeF1 = fusionLines().length;
  const f1 = Game.maybeOfferFusionReactor();
  t('F1 #2326: fusion offer DEFERS while a prize sheet is pending (returns false)',
    f1 === false, 'returned ' + JSON.stringify(f1));
  t('F1 #2326: the pending prize sheet survives byte-identical',
    JSON.stringify(choiceIds()) === JSON.stringify(['switcheroo', 'aegis_link', 'bird_whisperer']),
    'choices now: ' + JSON.stringify(choiceIds()));
  t('F1 #2326 SENSE: no fusion line is said while deferred (no silent discard, no nag)',
    fusionLinesSince(saidBeforeF1).length === 0,
    JSON.stringify(fusionLinesSince(saidBeforeF1)));

  // --- #2326 leg F2: answer the sheet, the offer recurs (deferral is not a loss) ---
  Game.chooseAbility('switcheroo');
  t('F2 #2326: answering the prize sheet clears it and holds the pick',
    choiceIds().length === 0 && heldIds().indexOf('switcheroo') >= 0,
    'choices=' + JSON.stringify(choiceIds()) + ' held=' + JSON.stringify(heldIds()));
  const saidBeforeF2 = fusionLines().length;
  const f2 = Game.maybeOfferFusionReactor();
  t('F2 #2326: after the sheet clears, the fusion offer lands (returns true)',
    f2 === true && JSON.stringify(choiceIds()) === JSON.stringify(['fusion_reactor']),
    'returned ' + JSON.stringify(f2) + ' choices=' + JSON.stringify(choiceIds()));
  t('F2 #2326 SENSE: the fusion sysSay fires exactly once, on the real offer',
    fusionLinesSince(saidBeforeF2).length === 1 && /PELLET/i.test(fusionLinesSince(saidBeforeF2)[0].m),
    JSON.stringify(fusionLinesSince(saidBeforeF2)));

  // --- #2326 leg F3: accepting the deferred offer installs (pellet held) ---
  Game.chooseAbility('fusion_reactor');
  t('F3 #2326: deferred-then-accepted fusion installs and holds',
    heldIds().indexOf('fusion_reactor') >= 0 && !!(s.fusionReactor && s.fusionReactor.installed)
    && Game.state.fusionReactorHolder && Game.state.fusionReactorHolder.who === 'player',
    'held=' + JSON.stringify(heldIds()) + ' installed=' + !!(s.fusionReactor && s.fusionReactor.installed));
  t('F3 #2326: the pellet is consumed by the install',
    !hasPellet(), 'pellet=' + hasPellet());

  // Reset for the #2327 legs: fresh scholar state, reactor un-held.
  // (The singularity flag stays set on this Game — a second reactor can
  // never be offered here, so the prize legs run on a FRESH load.)
  const { Game: G2 } = await loadGame({ seed: 190392, mode: 'fusionoffer-proof-2' });
  await setupGame(G2);
  const s2 = G2.state.scholar;
  s2.integration = 80;
  s2.abilities = [mk('lucky_rock'), mk('green_thumb')].map(function (a) {
    return a; // same defs resolve against G2's data identically
  });
  s2.inventory = [{ itemId: 'machete', units: 1 }, { itemId: 'bark_armor', units: 1 }];
  G2.state.systemArrived = true;
  G2.state.fusionReactorHolder = null;
  const choiceIds2 = function () { return ((s2.abilityChoices || []).map(function (c) { return (c && c.id) || c; })); };
  const clearSheet2 = function () { s2.abilityChoices = null; };

  // --- #2327 leg P1 (deterministic): narrow the bag to [fusion_reactor, night_eyes] ---
  // (night_eyes, not lucky_rock: the fixture already HOLDS lucky_rock, so
  // the bag filter would exclude it as owned and the no-pellet leg would
  // correctly return false with nothing to offer — a vacuous leg.)
  const savedAbilities = G2.data.abilities;
  const fusionDef = savedAbilities.find(function (a) { return a.id === 'fusion_reactor'; });
  const luckyDef = savedAbilities.find(function (a) { return a.id === 'night_eyes'; });
  t('P0 setup: fusion_reactor + night_eyes defs found', !!(fusionDef && luckyDef));
  G2.data.abilities = [fusionDef, luckyDef];
  // WITHOUT pellet: the sheet must not contain fusion_reactor.
  clearSheet2();
  const p1a = G2._cxPrizeAbilityOffer({});
  t('P1 #2327 no-pellet: prize offer fires but fusion_reactor is NOT in the sheet',
    p1a === true && choiceIds2().indexOf('fusion_reactor') < 0 && choiceIds2().indexOf('night_eyes') >= 0,
    'returned ' + JSON.stringify(p1a) + ' choices=' + JSON.stringify(choiceIds2()));
  // WITH pellet: fusion_reactor IS offerable.
  s2.inventory.push({ itemId: 'fusion_pellet', units: 1 });
  clearSheet2();
  const p1b = G2._cxPrizeAbilityOffer({});
  t('P1 #2327 with-pellet: prize sheet DOES offer fusion_reactor',
    p1b === true && choiceIds2().indexOf('fusion_reactor') >= 0,
    'returned ' + JSON.stringify(p1b) + ' choices=' + JSON.stringify(choiceIds2()));
  // Accepting it with the pellet installs it (no fizzle).
  G2.chooseAbility('fusion_reactor');
  const held2 = (s2.abilities || []).map(function (a) { return (a && a.id) || a; });
  t('P1 #2327 with-pellet: accepted fusion installs and holds (no fizzle)',
    held2.indexOf('fusion_reactor') >= 0 && !!(s2.fusionReactor && s2.fusionReactor.installed),
    'held=' + JSON.stringify(held2));
  G2.data.abilities = savedAbilities;

  // --- #2327 leg P2 (statistical): full bag, 40 draws, no pellet ---
  const { Game: G3 } = await loadGame({ seed: 190393, mode: 'fusionoffer-proof-3' });
  await setupGame(G3);
  const s3 = G3.state.scholar;
  s3.integration = 80;
  s3.abilities = [];
  s3.inventory = [{ itemId: 'machete', units: 1 }, { itemId: 'bark_armor', units: 1 }];
  G3.state.systemArrived = true;
  G3.state.fusionReactorHolder = null;
  let fusionSeen = 0, draws = 0;
  for (let i = 0; i < 40; i++) {
    s3.abilityChoices = null;
    const ok = G3._cxPrizeAbilityOffer({});
    if (!ok) continue;
    draws++;
    const ids = (s3.abilityChoices || []).map(function (c) { return (c && c.id) || c; });
    if (ids.indexOf('fusion_reactor') >= 0) fusionSeen++;
  }
  t('P2 #2327 no-pellet: 0/' + draws + ' full-bag prize sheets contain fusion_reactor (40 draws)',
    draws > 0 && fusionSeen === 0, 'draws=' + draws + ' fusionSeen=' + fusionSeen);

  // --- Safety net leg: the abilityOnAcquire revoke still works ---
  // A stale pre-fix sheet offering fusion with no pellet must still
  // fizzle honestly (the revoke is the backstop, not the fix).
  const { Game: G4 } = await loadGame({ seed: 190394, mode: 'fusionoffer-proof-4' });
  await setupGame(G4);
  const s4 = G4.state.scholar;
  s4.integration = 80;
  s4.abilities = [];
  s4.inventory = [{ itemId: 'machete', units: 1 }];
  G4.state.systemArrived = true;
  G4.state.fusionReactorHolder = null;
  const fdef = (G4.data.abilities || []).find(function (a) { return a.id === 'fusion_reactor'; });
  s4.abilityChoices = [{ id: 'fusion_reactor', name: fdef.name, description: fdef.description, flavor: '', src: 'prize' }];
  G4.chooseAbility('fusion_reactor');
  const held4 = (s4.abilities || []).map(function (a) { return (a && a.id) || a; });
  t('P3 safety net: a stale no-pellet fusion pick still revokes honestly (not held)',
    held4.indexOf('fusion_reactor') < 0 && !(s4.fusionReactor && s4.fusionReactor.installed),
    'held=' + JSON.stringify(held4));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
