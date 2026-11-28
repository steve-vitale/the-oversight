#!/usr/bin/env node
// scripts/test-seatvoice-a.js — proof test, arm sim-seatvoice-a.
//
// Proves the capstone-delivery voicing fix on a LIVE loaded game:
// the delivery announcement must not say "The seat is open" while
// the deed gate is still closed, and must still say it when the gate
// is genuinely open; the mercy-window line must not claim nothing can
// be taken (raids still take food after delivery — leg 2, seed 113302).
//
//   A. Helpers (fresh game, gate closed): _capstoneSeatLine() returns
//      the frozen honest line; _capstoneMercyLine() returns the frozen
//      mercy text; neither contains the overclaim strings.
//   B. Tribute end-to-end, gate CLOSED: staged two living wave-4
//      veterans (leg-2 pattern) — the real ladderDeliverCapstone()
//      delivers ok:true and the captured lines are the honest tribute
//      line + the frozen mercy line; "The seat is open" appears
//      NOWHERE, "Nothing out there" appears NOWHERE.
//   C. Tribute end-to-end, gate OPEN: full deed legs staged
//      (wavesFaced 5/5/4/3/2, 3 contests, 3 crises, sentimentTaught,
//      national scale, integration stage 2 — fullseat-stage-a pattern)
//      — deedGateReady().ok === true is asserted BEFORE the delivery,
//      so the line is proved against a genuinely open gate, not a
//      staged string — the delivery says "The seat is open."
//   D. Charter end-to-end, both gate states: staged chartered trade
//      link (live mshipState().links) + national scale; readiness
//      asserted live before each delivery.
//   E. Embassy end-to-end, both gate states: staged feast-bundle
//      flag + ladder stage 3 (scholar field/craft track XP through
//      the live playerTracks() store, the same store the engine
//      reads); readiness + ladderStage() asserted live before each
//      delivery.
//   F. Driver determinism: capstoneready2-driver-a --one 113302 run
//      twice (30d, temp OUTDIRs) writes byte-identical per-seed JSON.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): every staged
// delivery is a mid-run village's — living wave-4 veterans, full
// deed legs, a sealed charter, a served bundle — never a fresh
// un-geared solo scholar. The staging writes the ledger through the
// live state objects and reads it back through the live
// ladderCapstoneReady()/ladderDeliverCapstone()/deedGateReady() —
// the measurement chain is what's proved, not the ledger itself.
// NO gate function is stubbed anywhere. Only narration (say) is
// captured, and it is restored at the end.
//
// Usage: node scripts/test-seatvoice-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (child runs use temp OUTDIRs under
// /tmp, cleaned up after); prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const CLOSED_SEAT = 'The deed is done — the seat still waits on the deeds.';
const OPEN_SEAT = 'The seat is open.';
const MERCY = '◈ THE TABLE — between now and the seat, the world holds its breath. The wild can still take your food — but it cannot take your people.';

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// Capture say() lines on a game, returning { lines, restore }.
function captureSay(Game) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (s) { lines.push(String(s)); };
  return { lines, restore() { Game.say = orig; } };
}

function stageVeterans(Game) {
  const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []).filter(v => v !== Game.villagerId);
  if (roster.length < 2) return null;
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ by: roster[0], w: 4, d: 40 }, { by: roster[1], w: 4, d: 41 });
  return [roster[0], roster[1]];
}

function stageFullLegs(Game) {
  const byWave = {};
  for (const m of Game.data.monsters || []) (byWave[m.wave || 1] = byWave[m.wave || 1] || []).push(m.id);
  const need = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
  const d = Game.deedState();
  d.wavesFaced = {};
  for (const w of Object.keys(need)) for (const id of (byWave[w] || []).slice(0, need[w])) d.wavesFaced[id] = +w;
  d.contestsSurvived = 3;
  const pg = Game.progState();
  pg.crises = { a: 1, b: 1, c: 1 };
  pg.sentimentTaught = true;
  Game.state.nationalLive = true;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 45; // stage 2
}

function stageCharter(Game) {
  const links = Game.hierarchyState();
  links.push({ status: 'active', kind: 'trade', chartered: true, a: 'haven', b: 'ashford' });
  Game.state.nationalLive = true;
}

function stageEmbassy(Game) {
  Game.state.feastLog = Game.state.feastLog || [];
  Game.state.feastLog.push({ bundle: true, bundleStage: 1, day: 1 });
  // Ladder stage 3 needs 40 counted points (cap 24/track): stage the
  // scholar's field + craft track XP through the live playerTracks()
  // store the engine itself reads (forage/craft 600xp -> 50 -> cap 24
  // each; talk 3 from the full legs' contests; bundle +4).
  const tr = Game.playerTracks();
  if (tr.field) tr.field.xp = 600;
  if (tr.craft) tr.craft.xp = 600;
}

async function freshGame(seed, mode) {
  const { Game, loadFails } = await loadGame({ seed, mode });
  check('harness loads (' + mode + ')', !loadFails || loadFails.length === 0, JSON.stringify(loadFails || []));
  await quietLog(async () => { await setupGame(Game); });
  return Game;
}

async function main() {
  // ---- A. Helpers on a fresh game (gate closed) ----
  let Game = await freshGame(7, 'seatvoice-a-helpers');
  check('fresh game: deed gate closed', Game.deedGateReady().ok === false, JSON.stringify(Game.deedGateReady()));
  check('helper (closed): seat line is the honest line', Game._capstoneSeatLine() === CLOSED_SEAT, JSON.stringify(Game._capstoneSeatLine()));
  check('helper (closed): seat line never says the seat is open', Game._capstoneSeatLine().indexOf(OPEN_SEAT) < 0);
  check('helper: mercy line is the frozen text', Game._capstoneMercyLine() === MERCY, JSON.stringify(Game._capstoneMercyLine()));
  check('helper: mercy line never claims nothing can be taken', Game._capstoneMercyLine().indexOf('Nothing out there') < 0);

  // ---- B. Tribute end-to-end, gate CLOSED ----
  const capB = captureSay(Game);
  const vetsB = stageVeterans(Game);
  check('tribute closed: 2 veterans staged', Array.isArray(vetsB) && vetsB.length === 2);
  const readyB = Game.ladderCapstoneReady('military_tribute');
  check('tribute closed: deliverable before the call', readyB && readyB.ready === true && (readyB.payable | 0) >= 2, JSON.stringify(readyB));
  check('tribute closed: deed gate still closed at delivery time', Game.deedGateReady().ok === false, JSON.stringify(Game.deedGateReady()));
  const resB = Game.ladderDeliverCapstone('military_tribute');
  check('tribute closed: delivery returns ok:true', resB && resB.ok === true, JSON.stringify(resB));
  check('tribute closed: exactly 2 say lines (announcement + mercy)', capB.lines.length === 2, 'n=' + capB.lines.length + ' ' + JSON.stringify(capB.lines));
  check('tribute closed: announcement names the veterans and the honest line',
    capB.lines[0] && capB.lines[0].indexOf('◈ THE TRIBUTE') === 0 && capB.lines[0].indexOf(CLOSED_SEAT) >= 0,
    JSON.stringify(capB.lines[0]));
  check('tribute closed: announcement never says the seat is open',
    capB.lines[0] && capB.lines[0].indexOf(OPEN_SEAT) < 0, JSON.stringify(capB.lines[0]));
  check('tribute closed: mercy line is the frozen text', capB.lines[1] === MERCY, JSON.stringify(capB.lines[1]));
  capB.restore();

  // ---- C. Tribute end-to-end, gate OPEN ----
  Game = await freshGame(8, 'seatvoice-a-tribute-open');
  stageFullLegs(Game);
  const gateC = Game.deedGateReady();
  check('tribute open: deed gate genuinely open before delivery', gateC && gateC.ok === true, JSON.stringify(gateC));
  const capC = captureSay(Game);
  const vetsC = stageVeterans(Game);
  check('tribute open: 2 veterans staged', Array.isArray(vetsC) && vetsC.length === 2);
  const readyC = Game.ladderCapstoneReady('military_tribute');
  check('tribute open: deliverable before the call', readyC && readyC.ready === true && (readyC.payable | 0) >= 2, JSON.stringify(readyC));
  const resC = Game.ladderDeliverCapstone('military_tribute');
  check('tribute open: delivery returns ok:true', resC && resC.ok === true, JSON.stringify(resC));
  check('tribute open: announcement says the seat is open',
    capC.lines[0] && capC.lines[0].indexOf(OPEN_SEAT) >= 0, JSON.stringify(capC.lines[0]));
  check('tribute open: announcement does not say the seat waits',
    capC.lines[0] && capC.lines[0].indexOf('still waits') < 0, JSON.stringify(capC.lines[0]));
  check('tribute open: mercy line is the frozen text', capC.lines[1] === MERCY, JSON.stringify(capC.lines[1]));
  capC.restore();

  // ---- D. Charter end-to-end, both gate states ----
  Game = await freshGame(9, 'seatvoice-a-charter-closed');
  stageCharter(Game);
  const readyD = Game.ladderCapstoneReady('trade_charter');
  check('charter closed: ready before the call', readyD && readyD.ready === true, JSON.stringify(readyD));
  check('charter closed: deed gate closed at delivery time', Game.deedGateReady().ok === false, JSON.stringify(Game.deedGateReady()));
  const capD = captureSay(Game);
  const resD = Game.ladderDeliverCapstone('trade_charter');
  check('charter closed: delivery returns ok:true', resD && resD.ok === true, JSON.stringify(resD));
  check('charter closed: announcement carries the honest line',
    capD.lines[0] && capD.lines[0].indexOf('◈ THE CHARTER') === 0 && capD.lines[0].indexOf(CLOSED_SEAT) >= 0,
    JSON.stringify(capD.lines[0]));
  check('charter closed: announcement never says the seat is open',
    capD.lines[0] && capD.lines[0].indexOf(OPEN_SEAT) < 0, JSON.stringify(capD.lines[0]));
  check('charter closed: mercy line is the frozen text', capD.lines[1] === MERCY, JSON.stringify(capD.lines[1]));
  capD.restore();

  Game = await freshGame(10, 'seatvoice-a-charter-open');
  stageFullLegs(Game);
  stageCharter(Game);
  const gateD2 = Game.deedGateReady();
  check('charter open: deed gate genuinely open before delivery', gateD2 && gateD2.ok === true, JSON.stringify(gateD2));
  const readyD2 = Game.ladderCapstoneReady('trade_charter');
  check('charter open: ready before the call', readyD2 && readyD2.ready === true, JSON.stringify(readyD2));
  const capD2 = captureSay(Game);
  const resD2 = Game.ladderDeliverCapstone('trade_charter');
  check('charter open: delivery returns ok:true', resD2 && resD2.ok === true, JSON.stringify(resD2));
  check('charter open: announcement says the seat is open',
    capD2.lines[0] && capD2.lines[0].indexOf(OPEN_SEAT) >= 0, JSON.stringify(capD2.lines[0]));
  check('charter open: mercy line is the frozen text', capD2.lines[1] === MERCY, JSON.stringify(capD2.lines[1]));
  capD2.restore();

  // ---- E. Embassy end-to-end, both gate states ----
  Game = await freshGame(11, 'seatvoice-a-embassy-closed');
  stageEmbassy(Game);
  check('embassy closed: ladder stage 3 staged', Game.ladderStage() === 3, 'stage=' + Game.ladderStage());
  const readyE = Game.ladderCapstoneReady('feast_embassy');
  check('embassy closed: ready before the call', readyE && readyE.ready === true, JSON.stringify(readyE));
  check('embassy closed: deed gate closed at delivery time', Game.deedGateReady().ok === false, JSON.stringify(Game.deedGateReady()));
  const capE = captureSay(Game);
  const resE = Game.ladderDeliverCapstone('feast_embassy');
  check('embassy closed: delivery returns ok:true', resE && resE.ok === true, JSON.stringify(resE));
  check('embassy closed: announcement carries the honest line',
    capE.lines[0] && capE.lines[0].indexOf('◈ THE EMBASSY') === 0 && capE.lines[0].indexOf(CLOSED_SEAT) >= 0,
    JSON.stringify(capE.lines[0]));
  check('embassy closed: announcement never says the seat is open',
    capE.lines[0] && capE.lines[0].indexOf(OPEN_SEAT) < 0, JSON.stringify(capE.lines[0]));
  check('embassy closed: mercy line is the frozen text', capE.lines[1] === MERCY, JSON.stringify(capE.lines[1]));
  capE.restore();

  Game = await freshGame(12, 'seatvoice-a-embassy-open');
  stageFullLegs(Game);
  stageEmbassy(Game);
  const gateE2 = Game.deedGateReady();
  check('embassy open: deed gate genuinely open before delivery', gateE2 && gateE2.ok === true, JSON.stringify(gateE2));
  check('embassy open: ladder stage 3 staged', Game.ladderStage() === 3, 'stage=' + Game.ladderStage());
  const readyE2 = Game.ladderCapstoneReady('feast_embassy');
  check('embassy open: ready before the call', readyE2 && readyE2.ready === true, JSON.stringify(readyE2));
  const capE2 = captureSay(Game);
  const resE2 = Game.ladderDeliverCapstone('feast_embassy');
  check('embassy open: delivery returns ok:true', resE2 && resE2.ok === true, JSON.stringify(resE2));
  check('embassy open: announcement says the seat is open',
    capE2.lines[0] && capE2.lines[0].indexOf(OPEN_SEAT) >= 0, JSON.stringify(capE2.lines[0]));
  check('embassy open: mercy line is the frozen text', capE2.lines[1] === MERCY, JSON.stringify(capE2.lines[1]));
  capE2.restore();

  // ---- F. Driver determinism (child processes, temp dirs) ----
  const tmpA = '/tmp/seatvoice-proof-a';
  const tmpB = '/tmp/seatvoice-proof-b';
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
  const runChild = (outdir) => {
    execFileSync('node', [path.join(REPO, 'scripts', 'capstoneready2-driver-a.js'), '--one', '113302'],
      { cwd: REPO, env: Object.assign({}, process.env, { DAYS: '30', OUTDIR: outdir, SEEDS: '113302' }), stdio: 'pipe', timeout: 600000 });
  };
  let bytesA = null, bytesB = null;
  try {
    runChild(tmpA);
    bytesA = fs.readFileSync(path.join(tmpA, 's113302.json'));
    runChild(tmpB);
    bytesB = fs.readFileSync(path.join(tmpB, 's113302.json'));
  } catch (e) {
    check('driver determinism: both child runs complete', false, String(e && e.message));
  }
  if (bytesA && bytesB) {
    check('driver determinism: same seed twice writes byte-identical JSON', bytesA.equals(bytesB));
    const rowA = JSON.parse(bytesA.toString('utf8'));
    check('driver determinism: 30d row has no delivery yet (d83 is later)', Array.isArray(rowA.deliveryAttempts) && rowA.deliveryAttempts.length === 0,
      'attempts=' + JSON.stringify(rowA.deliveryAttempts));
  }
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }

  console.log(`TEST-SEATVOICE-A ${passed} passed, ${failed} failed`);
  if (failed) { console.log('FAILURES: ' + fails.join(' | ')); process.exit(1); }
  process.exit(0);
}

main().catch(e => { console.error('TEST-SEATVOICE-A harness error', e); process.exit(1); });
