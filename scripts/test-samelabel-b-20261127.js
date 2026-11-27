// test-samelabel-b-20261127.js — proof for arm sim-samelabel-b:
// SAME-FIGHT DIFFERENT LABELS, pinned, not fixed.
//
// The Sam fight (seed 109448, day 88, four people vs three wave-4
// Reunions): the scholar dies "the wild" while companions Olivia
// Bennett and Caleb Jones die "combat" in the same fight. This test
// reproduces that shape on a fixture through the REAL paths —
// startCombat('reunion') + tbDamage for the companions +
// tbEnd('lost') for the scholar — and asserts the labels the
// decision promises:
//
//   scholar  -> 'the wild'  (tbFightDeathCause, game.js:47978 —
//                            PLACE: a proven wild fight, by design
//                            sim-arenalabel-b 2026-10-28)
//   companion -> 'combat'   (tbDamage death branch, game.js:40928 /
//                            40938 — MANNER: fell in a fought fight)
//   all three -> one day + one fight id (the fight-join rule:
//                            same day + same live fight = one event,
//                            never the cause string alone)
//
// Both labels are TRUE (place vs manner), so the decision is CANON
// NOTE, not a fix — see docs/MONSTER-WAVES.md §"Death causes in
// wild fights". This test pins the asymmetry: any future relabel
// of either pipeline fails here first, loudly, on purpose.
// The scholar's 'the wild' row in village.scholarDeaths is also
// asserted — it is the input the standing.js wave-5 shortfall
// voice reads ("scholars dead in the wild"), and the reason the
// scholar label must stay.
//
// Usage: node scripts/test-samelabel-b-20261127.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

(async () => {
  // Seed 109448 is Sam's seed — the fixture is staged, not a replay,
  // but the seed keeps the shape honest to the evidence.
  const { Game } = await loadGame({ seed: 109448, mode: 'samelabel-b-proof', fullTelemetry: false });
  await setupGame(Game);

  assert.strictEqual(typeof Game.tbFightDeathCause, 'function', 'tbFightDeathCause present');
  assert.strictEqual(typeof Game.startCombat, 'function', 'startCombat present');
  assert.strictEqual(typeof Game.tbDamage, 'function', 'tbDamage present');
  assert.strictEqual(typeof Game.tbEnd, 'function', 'tbEnd present');

  // The fixture is a WILD fight: no arena contest live, no flags.
  Game.state.arenaContest = null;
  Game.state.phoenixLink = null;
  try { Game.state.scholar.abilities = []; } catch (e) {}
  const scholarId = Game.villagerId;
  const scholarName = (function () { try { return Game.displayName(scholarId) || scholarId; } catch (e) { return scholarId; } })();
  const roster = ((Game.state || {}).village || {}).roster || [];
  const companions = roster.filter(function (id) { return id && id !== scholarId; }).slice(0, 2);
  assert.ok(companions.length >= 2, 'setupGame village must hold scholar + 2 companions, roster=' + roster.length);
  const compNames = companions.map(function (id) { try { return Game.displayName(id) || id; } catch (e) { return id; } });

  // Capture both death pipelines as the engine calls them.
  const scholarDeaths = [];
  const personDeaths = [];
  const sayLines = [];
  const origPD = Game.playerDeath;
  Game.playerDeath = function (cause) { scholarDeaths.push(cause); return origPD.apply(this, arguments); };
  const origRD = Game.registerDeath;
  Game.registerDeath = function (opts) {
    try { personDeaths.push({ kind: opts && opts.kind, villagerId: opts && opts.villagerId, cause: opts && opts.cause, player: !!(opts && opts.player) }); } catch (e) {}
    return origRD.apply(this, arguments);
  };
  const origSay = Game.say;
  Game.say = function () { try { sayLines.push(String(arguments[0] || '')); } catch (e) {} return origSay.apply(this, arguments); };

  // --- the Sam shape: scholar + 2 companions vs 3 wave-4 Reunions ---
  // startCombat('reunion') builds the mirror pack itself: three
  // Reunion fighters (m_0/m_1/m_2) — the engine's own mirror, not
  // a fixture invention. It may also auto-join nearby villagers;
  // top the companions up to two from the real roster if needed.
  Game.startCombat('reunion');
  const fight = Game.tbfight;
  assert.ok(fight && !fight.over, 'a live fight must be open after startCombat(reunion)');
  const fightId = fight.id;
  const day = Game.state.scholar.day;
  const reunionDef = (Game.data.monsters || []).find(function (m) { return m && m.id === 'reunion'; });
  assert.ok(reunionDef && (reunionDef.wave | 0) === 4, 'reunion must be a wave-4 def');
  assert.strictEqual(fight.fighters.filter(function (x) { return x && x.kind === 'monster'; }).length, 3,
    'three Reunion fighters (the mirror pack, built by startCombat)');
  assert.ok(fight.fighters.filter(function (x) { return x && x.kind === 'monster'; })
    .every(function (x) { return ((x.mdef || {}).id || x.monsterId) === 'reunion'; }),
    'every monster fighter is a Reunion');
  let joinedVids = fight.fighters.filter(function (x) { return x && x.kind === 'villager' && x.villagerId; })
    .map(function (x) { return x.villagerId; });
  companions.forEach(function (vid, i) {
    if (joinedVids.indexOf(vid) < 0 && joinedVids.length < 2) {
      fight.fighters.push({ key: 'v_' + i, kind: 'villager', villagerId: vid, villageId: 'haven',
        name: compNames[i], hp: 40, maxHp: 40, alive: true, fled: false, mx: 4, my: 4 });
      joinedVids.push(vid);
    }
  });
  // The two named companions are the first two villager fighters.
  const namedCompanions = joinedVids.slice(0, 2);
  assert.strictEqual(namedCompanions.length, 2, 'two companion fighters in the fight');
  const namedKeys = namedCompanions.map(function (vid) {
    return fight.fighters.find(function (x) { return x && x.villagerId === vid; }).key;
  });

  ok('the fight is a proven wild fight: tbFightDeathCause reads the wild', function () {
    assert.strictEqual(Game.tbFightDeathCause(fight), 'the wild');
    assert.strictEqual(Game.state.arenaContest, null, 'no arena contest live');
  });

  // --- the companions fall first, by monster blows (tbDamage) ---
  function killCompanion(idx) {
    const key = namedKeys[idx];
    for (let attempt = 0; attempt < 3; attempt++) {
      const t = Game.tbFighter(key);
      if (!t || !t.alive || (t.hp || 0) <= 0) break;
      // LIFELINE (godpath allyWouldFall) may hold a falling ally once
      // per fight — a second lethal blow finishes the hold.
      Game.tbDamage(key, 9999, "Reunion's Your Move", 'm_0');
    }
    const t = Game.tbFighter(key);
    assert.ok(!t || !t.alive || (t.hp || 0) <= 0, 'companion ' + idx + ' must be down after lethal tbDamage');
  }
  killCompanion(0);
  killCompanion(1);

  ok('both companions die "combat" through the fight settlement pipeline', function () {
    namedCompanions.forEach(function (vid, i) {
      const rows = personDeaths.filter(function (r) { return r.villagerId === vid; });
      assert.strictEqual(rows.length, 1, 'exactly one registerDeath row for companion ' + i + ' (' + vid + '), got ' + rows.length);
      assert.strictEqual(rows[0].kind, 'person', 'companion death is kind person');
      assert.strictEqual(rows[0].cause, 'combat', 'companion death cause is combat, got ' + rows[0].cause);
      assert.strictEqual(rows[0].player, false, 'companion death is not a player death');
    });
  });
  ok('the companions fell in the live fight (same fight id, same day)', function () {
    assert.ok(Game.tbfight && Game.tbfight.id === fightId, 'the fight is still the same live fight after the companions fall');
    assert.strictEqual(Game.state.scholar.day, day, 'no day passed inside the fight');
  });

  // --- the scholar goes down: the loss branch stamps the cause ---
  const p = Game.tbFighter('p');
  assert.ok(p, 'player fighter present');
  p.hp = 0; p.alive = false;
  Game.state.scholar.health = 0;
  try { Game.tbEndCheck(); } catch (e) { /* tbEndCheck may throw past the loss; tbEnd below is the asserted path */ }
  if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('lost');
  assert.ok(!Game.tbfight || Game.tbfight.over, 'the fight must be over after the forced loss');

  ok('the scholar dies "the wild" through tbEnd -> playerDeath', function () {
    assert.strictEqual(scholarDeaths.length, 1, 'exactly one playerDeath call, got ' + scholarDeaths.length);
    assert.strictEqual(scholarDeaths[0], 'the wild', 'scholar death cause is the wild, got ' + scholarDeaths[0]);
  });
  ok('one event, two labels: scholar "the wild", companions "combat", same day + same fight', function () {
    assert.notStrictEqual(scholarDeaths[0], 'combat', 'the scholar label is not the companion label');
    namedCompanions.forEach(function (vid) {
      const row = personDeaths.find(function (r) { return r.villagerId === vid; });
      assert.notStrictEqual(row.cause, 'the wild', 'a companion label is not the scholar label');
    });
    // The fight-join rule the canon note prescribes: the three deaths
    // share the day and the fight id — that, not the cause string,
    // is what makes them one fight.
    assert.strictEqual(Game.state.scholar.day, day, 'scholar death is the same day as the companion deaths');
  });
  ok('the scholar death is recorded "the wild" everywhere it lands (fallen / scholarDeaths / lineage / death line)', function () {
    const v = Game.state.village || {};
    const fallen = (v.fallen || []).filter(function (x) { return x && x.villagerId === scholarId; });
    assert.ok(fallen.length >= 1, 'a fallen entry for the scholar must exist');
    assert.strictEqual(fallen[fallen.length - 1].cause, 'the wild', 'fallen cause is the wild');
    const sd = (v.scholarDeaths || []);
    assert.ok(sd.length >= 1, 'a scholarDeaths entry must exist (standing.js voice input)');
    assert.strictEqual(sd[sd.length - 1].cause, 'the wild', 'scholarDeaths cause is the wild');
    assert.strictEqual(sd[sd.length - 1].day, day, 'scholarDeaths day is the fight day');
    assert.ok(sd[sd.length - 1].name, 'scholarDeaths names the dead scholar');
    const lineage = (typeof Game.lineage === 'function' ? Game.lineage() : []).filter(function (x) { return x && x.villagerId === scholarId; });
    assert.ok(lineage.length >= 1, 'a lineage entry for the scholar must exist');
    assert.strictEqual(lineage[lineage.length - 1].cause, 'the wild', 'lineage cause is the wild');
    assert.ok(sayLines.some(function (l) { return /is dead — the wild/.test(l); }),
      'the death line says "is dead — the wild"');
  });
  ok('the companions are on the fallen roll as "combat" (the same asymmetry, second derivation)', function () {
    const v = Game.state.village || {};
    namedCompanions.forEach(function (vid) {
      const rows = (v.fallen || []).filter(function (x) { return x && x.villagerId === vid; });
      assert.ok(rows.length >= 1, 'a fallen entry for companion ' + vid + ' must exist');
      assert.strictEqual(rows[rows.length - 1].cause, 'combat', 'companion fallen cause is combat');
    });
  });

  console.log('PASS all ' + pass + ' samelabel-b checks (seed 109448, fight ' + fightId + ', day ' + day + ')');
  process.exit(0);
})().catch(function (e) { console.error('FAIL samelabel-b: ' + (e && e.stack || e)); process.exit(1); });
