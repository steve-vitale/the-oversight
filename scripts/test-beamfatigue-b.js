#!/usr/bin/env node
// test-beamfatigue-b.js — PROOF for the longsim r18 arm B "BEAM-FATIGUE"
// lever (game-code, gallowdeer monster AI).
//
// The blank (r15b s11, evidence/2026-10-13/sim-scale-wall-r15b.md): the
// gallowdeer AI has no response to a non-closing dodger. The r16 arm-A
// beam-dodge pilot produced a stalemate where the deer re-declared Ocular
// Discharge ~2,263 times over ~9,051 damage ticks with 2 landed — the
// fight ate the calendar while the village died around the scholar
// (village-lost d83). A real player doing this by hand hits the same loop.
//
// The lever: after 3 consecutive STERILE Ocular Discharges (judged per
// completed beam in tbBeamEndFiring — no blood drawn, the FIFO target never
// closed distance and never changed), the deer stops burning light and
// HUNTS: a mode where every deer turn advances at full speed toward the
// target and declares nothing, until antler range (melee begins) or the
// trail goes cold (10 hunt turns). Design choice, documented: CLOSE, not
// bait/change-range/leave — Steve's rule "monsters were sent to fight"
// forbids leaving/disengaging; the codex already prescribes "close in and
// break its aim — mind the antlers" as the player's counter, so the deer
// bringing the antlers to the dodger mirrors the intended counterplay;
// the antlers are permanent equipment (visual-mechanical coherence).
//
// Scenarios (BEAM_FATIGUE=0 disables the lever — the RED phase):
//   A (gate ON):  dodger duel — the fight MUST resolve (fled/lost/won) in
//      < 200 deer turns, with >= 1 hunt. The stalemate is gone.
//   B (gate OFF): same duel — the fight must NOT resolve within 200 deer
//      turns (the s11 stalemate reproduces). Proves the test can see the bug.
//   C2 (gate ON): the scholar stands still through beam 1 (blood drawn) —
//      the streak must be 0 after the beam completes (a working beam never
//      triggers a hunt).
//   C3 (gate ON): the scholar dodges beam 1 sterile, then closes to d1
//      during the cooldown — the deer picks Antler Sweep, streak 0, no hunt
//      armed (closing breaks the streak; melee is the honest answer).
//   D (sense): the hunt narration collected from A must read as a monster
//      hunting, not an engine trick (asserts on the arrival/trigger lines).
//
// Usage: node scripts/test-beamfatigue-b.js
//        BEAM_FATIGUE=0 node scripts/test-beamfatigue-b.js   (RED: B must show the stalemate, A/C/D must FAIL)
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' -- ' + extra : '')); }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));

// --- the dodger: a non-closing beam-dodger (rebuilds the r15b s11 camper) ---
// Camps the d2-4 band, moves along the TRUE perpendicular to the deer bearing
// while the beam is live (the arc-band dodge: at d2-4 a 3-tile lateral move is
// ~1 rad of arc, far beyond the beam's 0.18 rad/tick sweep budget), never
// closes, never strikes. Flees (barrier exit) below 35% HP - the honest out.
// When the deer is hunting (no beam to dodge), it RUNS - directly away.
function perpDodgeDest(p, deer, beamAngle, mustMove) {
  // BRUTE-FORCE DODGE: evaluate all tiles within 3 (Chebyshev) and pick the
  // one maximizing angular separation from the beam, subject to staying in
  // the d2-4 arc band. This directly optimizes "the beam must sweep far."
  const dNow = cheb(p.mx, p.my, deer.mx, deer.my);
  let best = null, bestScore = -1e9;
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 3) continue;
      const cx = clamp(p.mx + dx, 1, 7), cy = clamp(p.my + dy, 1, 7);
      if (cx === deer.mx && cy === deer.my) continue;
      const isStay = (cx === p.mx && cy === p.my);
      if (mustMove && isStay) continue;
      const dNew = cheb(cx, cy, deer.mx, deer.my);
      if (dNew < 2 || dNew > 5) continue; // stay in the arc band
      let angScore = 0;
      if (beamAngle !== null && beamAngle !== undefined) {
        const ang = Math.atan2(cy - deer.my, cx - deer.mx);
        let dAng = Math.abs(ang - beamAngle) % (2 * Math.PI);
        if (dAng > Math.PI) dAng = 2 * Math.PI - dAng;
        angScore = dAng * 6;
      }
      // prefer keeping distance (don't drift into the deer) and moving
      const score = angScore - Math.abs(dNew - 3) * 0.5 + (isStay ? 0 : 0.3);
      if (score > bestScore) { bestScore = score; best = { x: cx, y: cy }; }
    }
  }
  return best;
}

function dodgerFight(Game, ctx) {
  const f = Game.tbfight;
  if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
  const p = Game.tbFighter('p');
  const deer = f.fighters.find(x => x.kind === 'monster' && x.alive && !x.fled);
  const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || 100);
  const endTurn = () => { try { if (Game.tbfight && Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn(); } catch (e) {} };
  if (!deer) { endTurn(); return true; }
  const d = cheb(p.mx, p.my, deer.mx, deer.my);
  if (hpPct < 0.35) {
    // the honest out: walk to the nearest edge, then push through it
    const onEdge = (p.mx === 0 || p.mx === 8 || p.my === 0 || p.my === 8);
    if (onEdge) {
      const dx = p.mx === 0 ? -1 : p.mx === 8 ? 1 : 0;
      const dy = p.my === 0 ? -1 : p.my === 8 ? 1 : 0;
      try { Game.tbBarrierExit(dx, dy); } catch (e) {}
      ctx.fledPushes = (ctx.fledPushes || 0) + 1;
    } else {
      const dl = p.mx, dr = 8 - p.mx, dt = p.my, db = 8 - p.my;
      const m = Math.min(dl, dr, dt, db);
      let tx = p.mx, ty = p.my;
      if (m === dl) tx = 0; else if (m === dr) tx = 8; else if (m === dt) ty = 0; else ty = 8;
      try { Game.tbPlayerMove(tx, ty); } catch (e) {}
    }
    endTurn();
    return true;
  }
  const hunting = !!deer.beamHunting;
  let dest = null;
  if (hunting) {
    // RUN - directly away from the deer; sidestep if pinned
    let ax = Math.sign(p.mx - deer.mx), ay = Math.sign(p.my - deer.my);
    if (!ax && !ay) { ax = 1; ay = 0; }
    dest = { x: clamp(p.mx + ax * 3, 0, 8), y: clamp(p.my + ay * 3, 0, 8) };
    if (dest.x === p.mx && dest.y === p.my) {
      dest = { x: clamp(p.mx - ay * 3, 0, 8), y: clamp(p.my + ax * 3, 0, 8) };
    }
  } else if (deer.telegraph && ((deer.telegraph.pattern || {}).type === 'beam')) {
    // mustMove during the firing ticks: a stationary target lets the beam dwell.
    const firing = (deer.telegraph.firing || 0) > 0;
    dest = perpDodgeDest(p, deer, deer.telegraph.angle, firing);
  } else if (d < 2) {
    const ax = Math.sign(p.mx - deer.mx) || 1, ay = Math.sign(p.my - deer.my);
    dest = { x: clamp(p.mx + ax * 2, 1, 7), y: clamp(p.my + ay * 2, 1, 7) };
  } else if (d > 4) {
    const ax = Math.sign(deer.mx - p.mx), ay = Math.sign(deer.my - p.my);
    dest = { x: clamp(p.mx + ax * 2, 1, 7), y: clamp(p.my + ay * 2, 1, 7) };
  } else {
    dest = perpDodgeDest(p, deer, deer.telegraph ? deer.telegraph.angle : null);
  }
  if (dest && (dest.x !== p.mx || dest.y !== p.my)) {
    try { Game.tbPlayerMove(dest.x, dest.y); } catch (e) {}
  }
  endTurn();
  return true;
}


// drive one scripted duel; playerFn(p) decides each player turn.
// Returns telemetry. maxDeerTurns caps the stalemate (RED phase needs the cap).
async function duel(Game, playerFn, maxDeerTurns) {
  const tele = { deerTurns: 0, playerTurns: 0, declares: 0, completed: 0, hunts: 0, maxStreak: 0, result: null, fledPushes: 0 };
  const ctx = {};
  const seenTg = new Set();
  let liveBeam = null;
  const deerOf = () => (Game.tbfight ? Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'gallowdeer') : null);
  // count deer turns at the source (tbMonsterTurn), not the drive loop
  const origEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (r) { ctx.endResult = r; return origEnd(r); };
  const origMT = Game.tbMonsterTurn.bind(Game);
  Game.tbMonsterTurn = function (m) {
    if (m && Game.deerIs(m)) tele.deerTurns++;
    return origMT(m);
  };
  try {
    let guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 20000) {
      const cur = Game.tbCurrent();
      if (!cur) break;
      if (cur.kind === 'player') {
        tele.playerTurns++;
        playerFn(Game, ctx);
        if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
          try { Game.tbPlayerEndTurn(); } catch (e) { break; }
        }
      } else {
        try { Game.tbAdvance(); } catch (e) { break; }
      }
      if (!Game.tbfight || Game.tbfight.over) break;
      // beam declaration / completion telemetry (telegraph object identity)
      const deer = deerOf();
      if (deer) {
        tele.maxStreak = Math.max(tele.maxStreak, deer.beamStreakMax || 0);
        const tg = deer.telegraph;
        const isBeamTg = !!(tg && tg.pattern && tg.pattern.type === 'beam' && tg.attackName === 'Ocular Discharge');
        if (isBeamTg && !seenTg.has(tg)) { seenTg.add(tg); tele.declares++; liveBeam = tg; }
        else if (!isBeamTg && liveBeam) { tele.completed++; liveBeam = null; }
      }
      tele.hunts = Game._beamFatigueHunts || 0;
      tele.fledPushes = ctx.fledPushes || 0;
      if (tele.deerTurns >= (maxDeerTurns || 250)) break;
      if (Game.over) break;
    }
  } finally {
    Game.tbMonsterTurn = origMT;
    Game.tbEnd = origEnd;
  }
  // capture the result at tbEnd time (tbEnd nulls Game.tbfight)
  tele.result = ctx.endResult !== undefined ? ctx.endResult : null;
  const f = Game.tbfight;
  tele.over = !f || !!f.over;
  const deer = deerOf();
  tele.deerHp = deer ? deer.hp : null;
  tele.deerAlive = deer ? !!deer.alive : null;
  try { tele.playerHp = Math.round(Game.state.scholar.health); } catch (e) { tele.playerHp = null; }
  tele.armed = deer ? !!deer.beamHuntArmed : false;
  tele.streak = deer ? (deer.beamStreak || 0) : 0;
  return tele;
}

async function newDuelGame(seed, hp, withNarration) {
  const { Game } = await loadGame({ seed, mode: 'beamfatigue-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.health = hp || 100;
  // no party: villagers far away so the duel is 1v1
  try {
    for (const rid of Object.keys((Game.state.village || {}).positions || {})) {
      Game.state.village.positions[rid] = { mx: 0, my: 0 };
    }
  } catch (e) {}
  Game._beamFatigueHunts = 0;
  Game.dayPart = 3;
  // OPEN TERRAIN: stub the node detail to all grass so beam lanes are never
  // blocked by terrain (the blocked-lane reposition would otherwise muddy
  // the pure beam-dodge dynamics under test).
  Game.genDetail = function () {
    return Array.from({ length: 9 }, () => Array(9).fill('grass'));
  };
  // manual placement at distance (the spawn picker can stack the deer on the
  // scholar; test-highbeam.js places manually for the same reason)
  s.mx = 4; s.my = 4;
  s.monster = { id: 'gallowdeer', mx: 7, my: 4 };
  Game.startCombat('gallowdeer');
  if (!Game.tbfight) throw new Error('no fight started');
  const p0 = Game.tbFighter('p');
  const d0 = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'gallowdeer');
  if (p0) { p0.mx = 4; p0.my = 4; }
  if (d0) { d0.mx = 7; d0.my = 4; }
  // SENSE-TEST: capture say() calls without invoking the real narration
  // (which consumes RNG via pickFresh and shifts the duel). The harness
  // stubs say() to a no-op; wrap the stub to record messages.
  if (withNarration) {
    Game._capturedSay = [];
    Game.say = function (msg) { try { Game._capturedSay.push(String(msg)); } catch (e) {} };
  }
  return Game;
}

function huntLines(Game) {
  try {
    const src = (Game._capturedSay && Game._capturedSay.length)
      ? Game._capturedSay
      : (Game.log || []).map(l => (l && l.text) || String(l || ''));
    return src.filter(t => /antlers first|loses the trail|No more aiming|light dies/i.test(t));
  } catch (e) { return []; }
}

(async () => {
  const gateOff = process.env.BEAM_FATIGUE === '0';
  console.log(`beam-fatigue proof — lever ${gateOff ? 'OFF (RED phase)' : 'ON'}`);

  // ---- A: the stalemate duel, gate ON ----
  {
    const Game = await quietLog(() => newDuelGame(11, 100));
    const t = await quietLog(() => duel(Game, (G, ctx) => dodgerFight(G, ctx), 250));
    const hl = huntLines(Game);
    console.log(`A dodger duel: resolved=${t.over} result=${t.result} deerTurns=${t.deerTurns} declares=${t.declares} completed=${t.completed} hunts=${t.hunts} maxStreak=${t.maxStreak} fledPushes=${t.fledPushes} php=${t.playerHp}`);
    console.log(`  hunt narration (${hl.length} lines):`);
    for (const l of hl.slice(0, 4)) console.log(`   | ${String(l).slice(0, 140)}`);
    if (!gateOff) {
      ok('A: the stalemate duel resolves (fled/lost/won)', t.over === true, `result=${t.result}`);
      ok('A: no gallowdeer beam-fight reaches 200 deer turns', t.over && t.deerTurns < 200, `deerTurns=${t.deerTurns}`);
      ok('A: the hunt fired at least once', t.hunts >= 1, `hunts=${t.hunts}`);
      ok('A: max sterile streak reached 3 (the trigger)', t.maxStreak >= 3, `maxStreak=${t.maxStreak}`);
      ok('A: beam declarations stay bounded (no spam)', t.declares < 40, `declares=${t.declares}`);
    } else {
      // RED: with the lever off, A must FAIL — the stalemate recurs
      ok('B(RED): gate off — the stalemate recurs (fight NOT resolved in 200 deer turns)', t.over === false && t.deerTurns >= 200, `resolved=${t.over} deerTurns=${t.deerTurns}`);
      ok('B(RED): gate off — no hunt ever fires', t.hunts === 0, `hunts=${t.hunts}`);
      ok('B(RED): gate off — the deer re-declares the beam dozens of times', t.declares >= 10, `declares=${t.declares}`);
    }
  }

  if (gateOff) {
    console.log(`\n${pass} passed, ${fail} failed (RED phase)`);
    process.exit(fail ? 1 : 0);
  }

  // ---- C2: blood resets the streak ----
  {
    const Game = await quietLog(() => newDuelGame(22, 2000));
    const stander = (G) => {
      const f = G.tbfight;
      if (!f || f.over || !G.tbIsPlayerTurn()) return false;
      try { if (G.tbIsPlayerTurn()) G.tbPlayerEndTurn(); } catch (e) {}
      return true;
    };
    const t = await quietLog(() => duel(Game, stander, 250));
    // the scholar stood still: the beam dwelled and drew blood every cycle.
    // find the deer and read the streak after the first completed beam
    console.log(`C2 stander: declares=${t.declares} completed=${t.completed} maxStreak=${t.maxStreak} hunts=${t.hunts} result=${t.result} php=${t.playerHp}`);
    ok('C2: a beam that draws blood never builds a streak', t.maxStreak === 0, `maxStreak=${t.maxStreak}`);
    ok('C2: no hunt fires against a bloody beam', t.hunts === 0, `hunts=${t.hunts}`);
  }

  // ---- C3: closing breaks the streak (direct mechanism test) ----
  // Seed a streak, teleport the scholar adjacent, run one deer turn: the deer
  // must pick Antler Sweep (melee), not the beam, and the streak must reset.
  {
    const Game = await quietLog(() => newDuelGame(33, 2000));
    const p = Game.tbFighter('p');
    const deer = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'gallowdeer');
    // simulate: two sterile beams banked
    deer.beamStreak = 2; deer.beamHuntArmed = false; deer.telegraph = null;
    deer.encCooldown = 0;
    // teleport scholar adjacent
    p.mx = deer.mx + 1; p.my = deer.my; p.hp = 2000;
    // ensure it's the deer's turn: advance until deer acts
    let picked = null;
    const origChoose = Game.tbChooseMove.bind(Game);
    Game.tbChooseMove = function (m, foe) {
      const atk = origChoose(m, foe);
      if (m === deer) picked = atk;
      return atk;
    };
    // run deer turns until it picks (max 5)
    for (let i = 0; i < 5 && !picked && Game.tbfight && !Game.tbfight.over; i++) {
      const cur = Game.tbCurrent();
      if (cur && cur.kind === 'player') {
        try { if (Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn(); } catch (e) {}
      } else {
        Game.tbAdvance();
      }
    }
    const pickedName = picked && (picked.name || picked.attackName || JSON.stringify(picked).slice(0, 40));
    console.log(`C3 closer: picked=${pickedName} streak=${deer.beamStreak} armed=${!!deer.beamHuntArmed}`);
    ok('C3: adjacent deer picks Antler Sweep (melee), not the beam', /antler/i.test(pickedName || ''), `picked=${pickedName}`);
    ok('C3: non-beam move resets the streak', (deer.beamStreak || 0) === 0, `streak=${deer.beamStreak}`);
    ok('C3: no hunt armed after closing', !deer.beamHuntArmed, `armed=${!!deer.beamHuntArmed}`);
  }

  // ---- D: sense-test the hunt narration ----
  // Re-run the dodger duel with narration restored (harness stubs say()).
  // Seed 11 fires the hunt in the silent run; narration shifts RNG, so try
  // a few seeds and take the first hunt.
  if (!gateOff) {
    let hl2 = [], hunts2 = 0, seedUsed = null;
    for (const ds of [11, 22, 33, 44, 55]) {
      const G2 = await newDuelGame(ds, 100, true);
      const t2 = await duel(G2, (G, ctx) => dodgerFight(G, ctx), 250);
      if ((t2.hunts || 0) > 0) {
        hl2 = huntLines(G2); hunts2 = t2.hunts; seedUsed = ds;
        break;
      }
    }
    console.log(`D narrated duel: seed=${seedUsed} hunts=${hunts2} hunt-lines=${hl2.length}`);
    for (const l of hl2.slice(0, 6)) console.log(`   | ${String(l).slice(0, 150)}`);
    ok('D: hunt narration reads as a monster hunting (not an engine trick)',
      hunts2 > 0 && hl2.some(l => /antlers first/i.test(l)),
      `seed=${seedUsed} lines=${hl2.length}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
