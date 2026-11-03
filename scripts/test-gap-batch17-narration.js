#!/usr/bin/env node
// test-gap-batch17-narration.js — gap batch item 17: narration +
// decision.
//
//   NIGHT-OUT: sleep()'s wake line never said in plain words that
//   the night was spent OUT, away from Haven. It now appends "You
//   spent the night out here, away from Haven — and you're still out
//   here at dawn." when waking on a non-Haven tile, and nothing extra
//   when waking at Haven.
//   PACK-FULL REFUSAL: the joint forage press's failure line used to
//   hedge ("the patch, or your pack, said no"). It now names the
//   actual refusal: a full pack gets the pack line, an empty patch
//   gets the patch line.
//   SILENT-ARMOR-CRAFT (decision, documented in the batch evidence
//   note and at the code gate): NPC armor crafting speaks ONLY when
//   the player is home to witness it and stays silent when away —
//   presence-gated home narration is the standing pattern
//   (DIRECTIVES "If you don't know, it doesn't show"; game.js
//   home_narration_presence). This script proves the gate behaves
//   that way: an attempt at home says a line, the same attempt away
//   says none, while the craft itself still runs in both cases.
//
// Usage: node scripts/test-gap-batch17-narration.js
// Exit 0 on all green, 1 on any failure.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label + (extra != null ? ' :: ' + extra : '')); }
}
const NIGHT_OUT = "You spent the night out here, away from Haven";

function captureSay(Game) {
  const said = [];
  const orig = Game.say;
  Game.say = function (t) { said.push(String(t)); try { return orig.apply(this, arguments); } catch (e) {} };
  return { said, restore() { Game.say = orig; } };
}
function evening(Game) {
  const s = Game.state.scholar;
  s.dayTicks = Game.TIME.TICKS_PER_DAY - Game.TIME.TICKS_PER_BATCH * 3;
  s.kcal = 3000; s.hydration = 100; s.health = 100; s.energy = 100;
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const s = Game.state.scholar || {};
  const bearer = Game.villagerId;
  const X = (v.roster || []).find(id => id !== bearer && Game.getPerson(id));
  ok(!!X, 'setup: a living non-bearer villager exists');
  if (!X) { console.log(`\ntest-gap-batch17-narration: ${pass} passed, ${fail} failed`); process.exit(1); }

  // --- NIGHT-OUT: wake at Haven (no extra sentence) ---
  let cap = captureSay(Game);
  evening(Game);
  Game.sleep();
  let wake = cap.said.filter(t => t.includes('You wake'));
  ok(wake.length >= 1, 'night-out: Haven sleep produces a wake line', 'got ' + wake.length);
  ok(wake.length && !wake[0].includes(NIGHT_OUT), 'night-out: Haven wake has NO night-out sentence',
    'got: ' + (wake[0] || '').slice(0, 300));
  cap.restore();

  // --- NIGHT-OUT: wake in the wild (sentence present) ---
  cap = captureSay(Game);
  Game.map.px = 5; Game.map.py = 4;
  Game.location = 'wild';
  s.insideHaven = false; s.insideTent = null;
  evening(Game);
  Game.sleep();
  wake = cap.said.filter(t => t.includes('You wake'));
  ok(wake.length >= 1, 'night-out: wild sleep produces a wake line', 'got ' + wake.length);
  ok(wake.length && wake[0].includes(NIGHT_OUT), 'night-out: wild wake names the night out',
    'got: ' + (wake[0] || '').slice(0, 400));
  cap.restore();

  // --- PACK-FULL: joint forage press with a full pack ---
  // Back to Haven node area is wrong for forage_together (at home it
  // offers deliver/end, not the press), so stay out on a green tile.
  Game.map.px = 2; Game.map.py = 4;
  Game.location = 'wild';
  const tile = Game.playerTile();
  ok(tile && tile.type === 'forest_floor', 'pack-full: on a green wild tile', 'got: ' + (tile && tile.type));
  function setOuting() {
    // The two sleeps above can send villagers out on the road; the
    // fixture partner must be home for the adjacency checks below.
    if (v.away) delete v.away[X];
    v.favorLedger = v.favorLedger || {};
    v.promises = v.promises || {};
    v.favorLedger[X] = { id: 'gap17-forage', vid: X, kind: 'forage_help', state: 'promised',
      task: 'Forage together', goal: 'feed', askedDay: 1, promisedDay: 1, deadline: 99, meetDay: 1,
      forageRun: { bearer, startedDay: 1, playerHaul: [], partnerHaul: [], forageCount: 0,
        talked: false, talkCount: 0, returned: false, deliveredKcal: 0 } };
    v.promises[X] = { goal: 'feed', day: 1, kept: false, maker: bearer,
      favorId: 'gap17-forage', favorTask: 'Forage together', favorDeadline: 99 };
    v.nodePos = v.nodePos || {};
    v.nodePos[X] = { nx: Game.map.px, ny: Game.map.py };
    v.positions = v.positions || {};
    const mx = (s.mx ?? 4) + 1;
    v.positions[X] = { mx: mx > 8 ? (s.mx ?? 4) - 1 : mx, my: s.my ?? 4 };
  }
  setOuting();
  let st = Game.forageFavorAction(X, v.favorLedger[X], false);
  ok(st && st.action === 'forage_together', 'pack-full: joint press offered out on green ground',
    'got: ' + JSON.stringify(st));
  // Fill the pack past capacity.
  s.inventory = [{ name: 'Stone', kg: 5, units: 30, kcalEach: 0, edible: false }];
  ok(!Game.canCarry(0.4), 'pack-full: pack cannot fit one more cell take');
  let res = Game.performForageFavor(X, v.favorLedger[X], false);
  ok(res && !res.ok, 'pack-full: joint press fails with a full pack');
  ok(String(res && res.line || '').toLowerCase().includes('pack is full'),
    'pack-full: failure line names the full pack', 'got: ' + JSON.stringify(res && res.line));

  // --- PATCH-EMPTY: room in the pack, patch picked clean ---
  setOuting();
  s.inventory = [];
  ok(Game.canCarry(0.4), 'patch: pack has room');
  try {
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    tile.detailRegrow = tile.detailRegrow || {};
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) tile.detailRegrow[x + ',' + y] = true;
  } catch (e) {}
  st = Game.forageFavorAction(X, v.favorLedger[X], false);
  // With every cell regrowing the press may refuse as "nothing left"
  // at the action level; either surface must name the patch, not the pack.
  res = Game.performForageFavor(X, v.favorLedger[X], false);
  const line = String((res && res.line) || '') + ' ' + String((st && st.reason) || '');
  ok(!/pack is full/i.test(line), 'patch: empty-patch failure does NOT blame the pack',
    'got: ' + JSON.stringify(line.slice(0, 300)));
  ok(/patch|green|nothing/i.test(line), 'patch: empty-patch failure names the patch',
    'got: ' + JSON.stringify(line.slice(0, 300)));

  // --- SILENT-ARMOR-CRAFT: attempt speaks at home, silent away ---
  // (Same road-away caveat as above: the fixture villager must be
  // home for the beat to consider them at all.)
  if (v.away) delete v.away[X];
  const p = Game.getPerson(X);
  p.equipped = { torso: { itemId: 'bark_armor', name: 'Bark armor' } };
  v.stash = v.stash || {};
  v.stash.materials = { bark: 10, vine: 10 };
  v.avCraft = v.avCraft || {};
  v.avCraftCd = v.avCraftCd || {};
  const day = s.day || 1;
  delete v.avCraftCd[X];
  Game.map.px = 4; Game.map.py = 4; // home node (village at 4,4 in this harness)
  cap = captureSay(Game);
  Game.villagerArmorCraftDay();
  const homeAttempted = v.avCraftCd[X] === day;
  const homeLines = cap.said.filter(t => /sewing|workbench|afternoon/i.test(t));
  cap.restore();
  ok(homeAttempted, 'armor: craft attempt recorded at home', 'cd=' + v.avCraftCd[X] + ' day=' + day);
  ok(homeLines.length >= 1, 'armor: attempt at home SAYS a line',
    'got: ' + JSON.stringify(cap.said.slice(-3)));
  // Away run: fresh day (cooldown), materials restored, PLAYER map far
  // (the villager stays home; only the player's presence changes).
  v.stash.materials = { bark: 10, vine: 10 };
  s.day = day + 4;
  delete v.avCraftCd[X];
  if (v.away) delete v.away[X];
  Game.map.px = 0; Game.map.py = 0;
  cap = captureSay(Game);
  Game.villagerArmorCraftDay();
  const awayAttempted = v.avCraftCd[X] === s.day;
  const awayLines = cap.said.filter(t => /sewing|workbench|afternoon/i.test(t));
  cap.restore();
  ok(awayAttempted, 'armor: craft attempt still runs while away (sim runs, story waits)',
    'cd=' + v.avCraftCd[X] + ' day=' + s.day);
  ok(awayLines.length === 0, 'armor: attempt away says NO craft line (silent by decision)',
    'got: ' + JSON.stringify(awayLines));

  console.log(`\ntest-gap-batch17-narration: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(1); });
