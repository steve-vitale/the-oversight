#!/usr/bin/env node
// scripts/test-namelessadm-b.js — CHECK-FIRST proof for arm sim-namelessadm-b.
//
// Finding #2309 (sim-findings.md): when _vaAdmitPetitioners runs with zero
// housing room, it still says "The fire makes room. — said aloud, so the
// village learns the names." — with blank names, admitting nobody. The
// staged call in test-voicejoins-b.js §3 bypassed the moot, so whether the
// moot can accept at room 0 in live play was unproven.
//
// This test drives the moot HONESTLY, through the game entry points:
//   openPetition -> conductPetitionMoot -> (last bed fills through a real
//   game path: a visitor invite) -> answerPetition('accept').
// It never calls _vaAdmitPetitioners directly.
//
//   §1  THE WINDOW: moot held at room 1, last bed filled by a visitor
//       invite before the vote lands, player votes accept. Fixed
//       behavior: no fire-makes-room line at all, one honest turn-away
//       line naming both petitioners, roster unchanged, petition clears,
//       and the world reacts to a turn-away (not a harboring).
//   §2  PARTIAL-ADMISSION CONTROL (same seed, no bed filled): one of two
//       petitioners admitted — the fire-makes-room line names the admitted
//       one, the left line names the other. Guards the fix's other branch.
//
// The moot's votes are random, so seeds are searched (1..40) for one whose
// moot accepts on the player's vote. That is seed selection, not vote
// manipulation: the moot outcome is read from its own return
// (acceptSoFar + 1 >= need) before the vote is cast.
//
// Usage: node scripts/test-namelessadm-b.js
// Exits 0 with NAMELESSADM-B PASS when all assertions hold.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; failures.push(label); console.log('  FAIL: ' + label); }
}
function eq(a, b, label) { ok(a === b, label + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

async function fresh(seed) {
  const { Game: G, loadFails } = await loadGame({ seed: seed, mode: 'namelessadm-b', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  return G;
}

function captureSay(G) {
  const lines = [];
  const orig = G.say;
  G.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') lines.push(String(arg));
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  return lines;
}

function rosterOf(G) { try { return ((G.state || {}).village || {}).roster || []; } catch (e) { return []; } }
function dayOf(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function makePetition(seed) {
  return {
    id: 'pet_nameless_' + seed, originName: 'another fire', cause: 'famine-flight',
    petitioners: [
      { name: 'Wren Hall', age: 34, occupation: 'cook', temperament: 'steady' },
      { name: 'Ash Kett', age: 41, occupation: 'carpenter', temperament: 'warm' },
    ],
  };
}

// Drive the moot honestly up to the vote. Returns null when this seed's
// moot would not accept even with the player's vote (caller tries the
// next seed); otherwise returns the drive record.
async function driveToVote(seed, fillBed) {
  const G = await fresh(seed);
  const said = captureSay(G);
  const v = G.state.village || {};
  const day = dayOf(G);
  // Stage the village: 11 on the roster, room 1 (cap 12). The trimmed
  // villagers are not killed; they are simply not on the staged roster.
  v.roster = (v.roster || []).slice(0, 11);
  if (G.havenRoom() !== 1) return { G: G, said: said, skip: 'fixture room ' + G.havenRoom() + ' != 1' };
  const pet = makePetition(seed);
  G.state.petitionQueue = [];
  G.openPetition(pet);
  const moot = G.conductPetitionMoot(pet.id);
  if (!moot || !moot.awaitingPlayerVote) return { G: G, said: said, skip: 'moot did not reach a vote: ' + JSON.stringify(moot) };
  // The moot's own return predicts the outcome: the player's accept adds
  // one vote to acceptSoFar against the same need.
  if ((moot.acceptSoFar || 0) + 1 < (moot.need || 99)) return { G: G, said: said, skip: 'moot would reject (' + moot.acceptSoFar + '+1 < ' + moot.need + ')' };
  if (fillBed) {
    // The last bed fills through a REAL game path: a visitor invite
    // (betrayal.js visitorInteract 'invite' — no petition check, roster
    // +1), the same path voicejoins-b §2 proved. The petition never
    // expires once the moot is held (villageAgencyDaily only walks a
    // petition with no vote), so the player may vote days later — here,
    // immediately after the bed fills.
    const vis = { id: 'vis_nameless_' + seed, name: 'a curious wanderer', type: 'curious', day: day, leavesDay: day + 1 };
    v.visitors = v.visitors || [];
    v.visitors.push(vis);
    const inv = G.visitorInteract(vis.id, 'invite');
    if (inv !== true) return { G: G, said: said, skip: 'visitor invite failed' };
    if (G.havenRoom() !== 0) return { G: G, said: said, skip: 'room after invite ' + G.havenRoom() + ' != 0' };
  }
  const roomBefore = G.havenRoom();
  const rosterBefore = rosterOf(G).length;
  const mark = said.length;
  const out = G.answerPetition(pet.id, 'accept');
  return { G: G, said: said, out: out, roomBefore: roomBefore, rosterBefore: rosterBefore, freshLines: said.slice(mark), moot: moot };
}

async function findAcceptingSeed(fillBed) {
  for (let seed = 1; seed <= 40; seed++) {
    const d = await driveToVote(seed, fillBed);
    if (d.skip) continue;
    if (d.out && d.out.accepted === true) return { seed: seed, drive: d };
    // Moot predicted accept but the vote did not take it — report, keep searching.
    console.log('  seed ' + seed + ': moot predicted accept but vote returned ' + JSON.stringify(d.out));
  }
  return null;
}

(async function () {
  // ---- §1: the room-0 window (bed filled between moot and vote) ----
  const found = await findAcceptingSeed(true);
  ok(!!found, '§1 proof seed: a seed 1..40 whose moot accepts at room 0');
  if (!found) {
    console.log('NAMELESSADM-B FAIL (' + pass + ' passed, ' + fail + ' failed)');
    process.exitCode = 1;
    return;
  }
  const seed = found.seed;
  const d = found.drive;
  const G = d.G, said = d.said, freshLines = d.freshLines;
  console.log('  §1 proof seed: ' + seed + ' (room at vote: ' + d.roomBefore + ', roster ' + d.rosterBefore + ')');
  eq(d.roomBefore, 0, '§1 fixture: room is 0 when the vote lands');
  const roomLines = freshLines.filter(function (l) { return /The fire makes room/.test(l); });
  eq(roomLines.length, 0, '§1 no fire-makes-room line when nobody is admitted');
  const blankLines = said.filter(function (l) { return /The fire makes room\.  — said aloud/.test(l); });
  eq(blankLines.length, 0, '§1 no blank-names admission line anywhere in the run');
  const honestLines = freshLines.filter(function (l) { return /beds filled/.test(l); });
  eq(honestLines.length, 1, '§1 exactly one honest beds-filled line');
  ok(honestLines.length === 1 && honestLines[0].indexOf('Wren Hall') !== -1 && honestLines[0].indexOf('Ash Kett') !== -1,
    '§1 beds-filled line names both petitioners');
  eq(rosterOf(G).length, d.rosterBefore, '§1 roster unchanged by the room-0 accept');
  ok(!rosterOf(G).some(function (id) { return String(id).indexOf('ptn_') === 0; }),
    '§1 no petitioner id joins the roster');
  eq(G.state.pendingPetition, null, '§1 petition clears');
  const harborLines = freshLines.filter(function (l) { return /feeding the hungry/.test(l); });
  eq(harborLines.length, 0, '§1 world does NOT react as if the hungry were harbored');
  const turnLines = freshLines.filter(function (l) { return /turned away the hungry/.test(l); });
  eq(turnLines.length, 1, '§1 world reacts to the turn-away (opinion -4 line)');
  console.log('  §1 vote lines:');
  freshLines.forEach(function (l) { console.log('    "' + l.slice(0, 200) + '"'); });

  // ---- §2: partial-admission control (same seed, bed left open) ----
  const d2 = await driveToVote(seed, false);
  ok(!d2.skip, '§2 control drive reaches a vote on the proof seed' + (d2.skip ? ' (' + d2.skip + ')' : ''));
  if (!d2.skip) {
    const G2 = d2.G, fresh2 = d2.freshLines;
    eq(d2.roomBefore, 1, '§2 fixture: room is 1 when the vote lands');
    ok(d2.out && d2.out.accepted === true, '§2 moot accepts on the proof seed without the bed fill');
    const room2 = fresh2.filter(function (l) { return /The fire makes room/.test(l); });
    eq(room2.length, 1, '§2 exactly one fire-makes-room line for the partial admission');
    ok(room2.length === 1 && room2[0].indexOf('Wren Hall') !== -1,
      '§2 fire-makes-room line names the admitted petitioner');
    const left2 = fresh2.filter(function (l) { return /there's no room\. Every bed's full/.test(l); });
    eq(left2.length, 1, '§2 exactly one no-room line for the petitioner left out');
    ok(left2.length === 1 && left2[0].indexOf('Ash') !== -1,
      '§2 no-room line names the petitioner left out (firstOf: Ash)');
    eq(rosterOf(G2).length, d2.rosterBefore + 1, '§2 roster grows by exactly one');
    eq(G2.state.pendingPetition, null, '§2 petition clears');
  }

  if (fail) {
    console.log('NAMELESSADM-B FAIL (' + pass + ' passed, ' + fail + ' failed)');
    process.exitCode = 1;
  } else {
    console.log('NAMELESSADM-B PASS (' + pass + ' assertions, proof seed ' + seed + ')');
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
