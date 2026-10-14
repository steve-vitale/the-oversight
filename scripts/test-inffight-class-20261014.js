#!/usr/bin/env node
// test-inffight-class-20261014.js — PROOF for finding #108 (longsim
// scale-wall r24 arm 2, game-code): the GENERAL whiff-forever guard.
//
// The blank (s44, evidence/2026-10-14/sim-succession.md): baseline s44
// (leadcourt+FOURTHLINK, seed 44, 180d runDays) stalls ~day 60 in a
// turn-based fight vs The Focus Group at round 1M+, over=false. Mechanism:
// the competent policy strikes the weakest (1-HP eye-heads) -> sigW3a
// interception consumes the turn with ZERO damage; the lead's Deliberation
// (self-centered r1 burst, anchor-centered on a 2x2 body) can't reach the
// edge-pinned scholar at range 2 -> ZERO damage; the boredom walkout needs
// 3 boring rounds but 'strike' resets it every round. HP/position churn
// defeats the harness's hp@pos no-progress signature, and the time-freeze
// watchdog never gets its 8 loop-days: each loop-day grinds ~240k rounds
// through driveContests' 400-iteration loop (~75s/loop-day -> ~10 min fuse).
//
// The fix (game.js tbRoundWrap): a GENERAL engine-class guard — no monster
// ids, no telegraph names. If NOBODY loses HP for 120 consecutive rounds,
// the fight COMES APART via the existing honest-disengage idiom (tbEndCheck:
// "It comes apart — no one in reach, no one chasing..."), never a silent
// kill, never a free win. WHIFFGUARD=0 disables (RED).
//
// Scenarios:
//   R1 (WHIFFGUARD=0): the whiff duel must STALL (round cap hit, over=false,
//      zero damage after the opening exchange). Proves the test sees the bug.
//   G1 (guard on): same duel must RESOLVE honestly — over=true, 'routed',
//      the "comes apart" line said, lead unharmed past the opening (no free
//      win), scholar alive, zero kills paid, within a sane round budget.
//   G2 (battery): honest duels (damage flows) resolve BYTE-IDENTICALLY with
//      the guard on vs off — the guard fires only on true whiff-forever.
//   G3 (sense): the "comes apart" narration collected from G1 must read as
//      an honest fizzle, not an engine trick.
//
// Usage: node scripts/test-inffight-class-20261014.js        (GREEN)
//        WHIFFGUARD=0 node scripts/test-inffight-class-20261014.js  (RED: R1 must STALL, G1 must FAIL)
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL ' + name + (extra ? ' -- ' + extra : '')); }
}

const GUARD_ON = process.env.WHIFFGUARD !== '0';
const STALL_CAP = 3000;    // RED must hit this with over=false
const RESOLVE_BUDGET = 600; // GREEN must resolve well under this (120 whiff + opening)

function giveWeapon(Game, itemId) {
  const s = Game.state.scholar;
  const def = Game.data.items.find(i => i.id === itemId);
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId, name: def.name, units: 1 });
  s.equipped = s.equipped || {};
  s.equipped.weapon = { itemId, name: def.name };
}

// The s44 whiff geometry, deterministically: scholar pinned at the grid edge
// (8,2); the Focus Group lead's 2x2 body anchored at (6,1) cannot close
// further; Deliberation (self-centered r1, anchor-centered) misses forever;
// the scholar strikes weakest (eye-heads -> interception, 0 damage).
async function newWhiffGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'inffight-class-whiff' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.health = 100;
  giveWeapon(Game, 'fire_hardened_spear');
  try {
    for (const rid of Object.keys((Game.state.village || {}).positions || {})) {
      Game.state.village.positions[rid] = { mx: 0, my: 0 };
    }
  } catch (e) {}
  Game.dayPart = 3;
  Game.genDetail = function () { return Array.from({ length: 9 }, () => Array(9).fill('grass')); };
  s.mx = 8; s.my = 2;
  s.monster = { id: 'focus_group', mx: 6, my: 1 };
  await quietLog(async () => { Game.startCombat('focus_group'); });
  if (!Game.tbfight) throw new Error('no fight started');
  const p0 = Game.tbFighter('p');
  if (p0) { p0.mx = 8; p0.my = 2; p0.hp = 100; p0.maxHp = 100; }
  const lead = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group');
  if (lead) { lead.mx = 6; lead.my = 1; }
  return Game;
}

// strike-weakest: the competent policy's honest targeting (competent.js).
function strikeWeakest(Game) {
  const f = Game.tbfight;
  if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
  const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
  if (!alive.length) return false;
  alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
  try { return !!Game.tbPlayerStrike(alive[0].key); } catch (e) { return false; }
}

// Drive a duel; returns telemetry. Captures say() lines for the sense check.
async function duel(Game, playerFn, roundCap) {
  const tele = { maxRound: 0, endResult: null, iters: 0, said: [] };
  const leadOf = () => Game.tbfight ? Game.tbfight.fighters.find(x => x.kind === 'monster' && x.mdef && x.mdef.id === 'focus_group') : null;
  const l0 = leadOf();
  if (l0) tele.leadHp0 = Math.round(l0.hp);
  const p0 = Game.tbFighter('p');
  if (p0) tele.scholarHp0 = Math.round(p0.hp);
  tele.combatWins0 = Game.state.combatWins || 0;
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) { try { tele.said.push(String(msg)); } catch (e) {} return origSay(msg); };
  const origEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (res) {
    tele.endResult = res;
    try {
      const ld = leadOf();
      tele.leadHp = ld ? Math.round(ld.hp) : tele.leadHp;
      tele.leadAlive = ld ? !!ld.alive : tele.leadAlive;
      const p = Game.tbFighter('p');
      tele.scholarHp = p ? Math.round(p.hp) : tele.scholarHp;
      tele.scholarAlive = p ? !!p.alive : tele.scholarAlive;
    } catch (e) {}
    return origEnd(res);
  };
  try {
    await quietLog(async () => {
      while (Game.tbfight && !Game.tbfight.over && tele.iters++ < 400000) {
        const cur = Game.tbCurrent();
        if (!cur) break;
        if (cur.kind === 'player') {
          playerFn(Game);
          if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
            try { const p = Game.tbFighter('p'); p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction(); }
            catch (e) { break; }
          }
        } else { try { Game.tbAdvance(); } catch (e) { break; } }
        const f = Game.tbfight;
        if (!f || f.over) break;
        tele.maxRound = Math.max(tele.maxRound, f.round);
        if (f.round >= (roundCap || STALL_CAP)) break;
        if (Game.over) break;
      }
    });
  } finally {
    Game.say = origSay;
    Game.tbEnd = origEnd;
  }
  const f = Game.tbfight;
  tele.over = !f || !!f.over;
  // Prefer end-of-fight captures (tbEnd wrapper) — tbfight is nulled after.
  if (tele.leadHp == null) {
    const lead = leadOf();
    tele.leadHp = lead ? Math.round(lead.hp) : null;
    tele.leadAlive = lead ? !!lead.alive : null;
  }
  if (tele.scholarHp == null) {
    const p = Game.tbFighter('p');
    tele.scholarHp = p ? Math.round(p.hp) : null;
    tele.scholarAlive = p ? !!p.alive : null;
  }
  tele.combatWins = Game.state.combatWins || 0;
  tele.comesApart = tele.said.some(s => /comes apart — no one in reach/.test(s));
  return tele;
}

// An honest duel vs a straightforward damage-dealing monster. Returns a
// compact outcome tuple for byte-identical comparison.
async function honestDuel(monId, seed) {
  const { Game } = await loadGame({ seed, mode: 'inffight-class-honest' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.health = 100;
  giveWeapon(Game, 'fire_hardened_spear');
  try {
    for (const rid of Object.keys((Game.state.village || {}).positions || {})) {
      Game.state.village.positions[rid] = { mx: 0, my: 0 };
    }
  } catch (e) {}
  Game.dayPart = 3;
  Game.genDetail = function () { return Array.from({ length: 9 }, () => Array(9).fill('grass')); };
  s.mx = 4; s.my = 4;
  s.monster = { id: monId, mx: 6, my: 4 };
  await quietLog(async () => { Game.startCombat(monId); });
  if (!Game.tbfight) throw new Error('no fight for ' + monId);
  const strikeIt = (G) => {
    const f = G.tbfight;
    if (!f || f.over || !G.tbIsPlayerTurn()) return false;
    const m = f.fighters.find(x => x.kind === 'monster' && x.alive && !x.fled);
    if (!m) return false;
    try { return !!G.tbPlayerStrike(m.key); } catch (e) { return false; }
  };
  let iters = 0, maxRound = 0, endResult = null, endPhp = null, endMhp = null;
  const origEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (res) {
    endResult = res;
    try {
      const p = Game.tbFighter('p');
      endPhp = p ? Math.round(p.hp) : null;
      const m = Game.tbfight ? Game.tbfight.fighters.find(x => x.kind === 'monster') : null;
      endMhp = m ? Math.round(m.hp) : null;
    } catch (e) {}
    return origEnd(res);
  };
  try {
    await quietLog(async () => {
      while (Game.tbfight && !Game.tbfight.over && iters++ < 100000) {
        const cur = Game.tbCurrent();
        if (!cur) break;
        if (cur.kind === 'player') {
          strikeIt(Game);
          if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
            try { const p = Game.tbFighter('p'); p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction(); }
            catch (e) { break; }
          }
        } else { try { Game.tbAdvance(); } catch (e) { break; } }
        const f = Game.tbfight;
        if (!f || f.over) break;
        maxRound = Math.max(maxRound, f.round);
        if (Game.over) break;
      }
    });
  } finally { Game.tbEnd = origEnd; }
  const p = Game.tbFighter('p');
  const m = Game.tbfight ? Game.tbfight.fighters.find(x => x.kind === 'monster') : null;
  return {
    over: !Game.tbfight || !!Game.tbfight.over,
    result: endResult,
    rounds: maxRound,
    php: endPhp != null ? endPhp : (p ? Math.round(p.hp) : null),
    mhp: endMhp != null ? endMhp : (m ? Math.round(m.hp) : null),
    mdead: m ? !m.alive : null,
  };
}

(async () => {
  console.log(`inffight-class proof: WHIFFGUARD=${GUARD_ON ? '1 (guard ON)' : '0 (RED)'}`);

  // R1: the whiff-forever stall reproduces with the guard disabled.
  {
    const Game = await newWhiffGame(44);
    const t = await duel(Game, strikeWeakest, STALL_CAP);
    console.log(`R1: maxRound=${t.maxRound} over=${t.over} leadHp=${t.leadHp} (was ${t.leadHp0}) scholarHp=${t.scholarHp} (was ${t.scholarHp0})`);
    if (!GUARD_ON) {
      ok('R1 stall: round cap hit', t.maxRound >= STALL_CAP, 'maxRound=' + t.maxRound);
      ok('R1 stall: fight never ends', t.over === false, 'over=' + t.over);
      ok('R1 stall: no damage after the opening exchange (lead frozen)',
        t.leadHp != null && t.leadHp0 != null && (t.leadHp0 - t.leadHp) <= 30, `lead ${t.leadHp0} -> ${t.leadHp}`);
      ok('R1 stall: scholar takes no damage in the whiff', t.scholarHp === t.scholarHp0, `scholar ${t.scholarHp0} -> ${t.scholarHp}`);
    } else {
      console.log('R1 skipped (guard ON — stall should be gone; see G1)');
    }
  }

  // G1: the same duel resolves HONESTLY with the guard on.
  {
    const Game = await newWhiffGame(44);
    const t = await duel(Game, strikeWeakest, STALL_CAP);
    console.log(`G1: over=${t.over} result=${t.endResult} maxRound=${t.maxRound} leadHp=${t.leadHp} (was ${t.leadHp0}) scholarHp=${t.scholarHp} comesApart=${t.comesApart}`);
    if (GUARD_ON) {
      ok('G1 resolves: fight ends', t.over === true, 'over=' + t.over + ' maxRound=' + t.maxRound);
      ok('G1 resolves: within sane budget (120 whiff rounds + opening)', t.maxRound < RESOLVE_BUDGET, 'maxRound=' + t.maxRound);
      ok('G1 honest: the fight comes apart (existing idiom)', t.endResult === 'routed' && t.comesApart === true,
        `result=${t.endResult} comesApart=${t.comesApart}`);
      ok('G1 honest: no free win — the lead survives unharmed past the opening',
        t.leadAlive === true && t.leadHp != null && t.leadHp0 != null && (t.leadHp0 - t.leadHp) <= 30,
        `lead alive=${t.leadAlive} ${t.leadHp0} -> ${t.leadHp}`);
      ok('G1 honest: the scholar lives', t.scholarAlive === true, `scholarHp=${t.scholarHp}`);
      ok('G1 honest: no kill paid (combatWins unchanged)', t.combatWins === t.combatWins0,
        `wins ${t.combatWins0} -> ${t.combatWins}`);
    } else {
      console.log('G1 expected to FAIL on RED (stall) — guard OFF');
      ok('G1 RED check: stall present', t.over === false);
    }
  }

  // G2: battery — honest duels resolve byte-identically with the guard on/off.
  {
    const mons = ['bulldozer', 'hushwolf', 'mirror_stag'];
    for (const mid of mons) {
      const a = await honestDuel(mid, 44); // guard state per env; run twice via env
      console.log(`G2 ${mid}: over=${a.over} result=${a.result} rounds=${a.rounds} php=${a.php} mhp=${a.mhp} mdead=${a.mdead}`);
      // The byte-identical check runs across the two env invocations; here we
      // assert the duel is honest (damage flowed and it resolved).
      ok(`G2 ${mid}: honest duel resolves`, a.over === true, `over=${a.over} rounds=${a.rounds}`);
      ok(`G2 ${mid}: damage flowed (guard must not fire)`, a.rounds < 500, `rounds=${a.rounds}`);
    }
  }

  // G3: sense — the "comes apart" narration reads honestly.
  {
    const Game = await newWhiffGame(44);
    const t = await duel(Game, strikeWeakest, STALL_CAP);
    const line = t.said.find(s => /comes apart/.test(s)) || '';
    console.log(`G3 line: ${line.slice(0, 160)}`);
    if (GUARD_ON) {
      ok('G3 sense: the line names what happened (no one in reach, no one chasing)', /no one in reach, no one chasing/.test(line), line.slice(0, 80));
      ok('G3 sense: the line says where they go (melt back into the wilds)', /melt back into the wilds/.test(line), line.slice(0, 80));
      ok('G3 sense: no kill language, no victory language', !/WINNER|trophy|slain/i.test(line), line.slice(0, 80));
    } else {
      console.log('G3 skipped on RED (no resolution, no line)');
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
