// test-allyslot3-b.js — proof test, arm sim-allyslot3-b (finding #2515:
// the 3rd-ally slot — a launched quad fields its 4th member at a meeting).
// PORTED to sim-fightcap-b (master eccc08af2): the sense substrate is now
// SENSEEXPED (sim-senseexped-b, finding #2583, on master) — the sense
// reads the expedition, not winPlan, so §1–§5 set SENSEEXPED=1 and §4
// stages a trio EXPEDITION. The slot itself is unchanged from 7efbf26a8.
//
// WHAT IT PROVES (observable effect, not just assertions):
//   §1–§5 SENSE: the real villagerFightAllies against a STAGED live
//     expedition returns 3 launch companions for a quad (arm) and 2
//     for a trio / with the flag off / with no launch (control).
//   §6–§7 FIGHT: the real fieldFight on a staged quad (geared wave-4
//     hunting party fixture: holder 200 HP, 3 companions 100 HP,
//     unarmed/unarmored, vs gavel) fields FOUR on the arm leg
//     (ally3Vid set, third door line, ally3Dealt > 0, third shout)
//     and THREE on the control leg (ally3Vid null).
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged party is
// a geared wave-4 hunting party as the launch leaves them — holder +
// three launch companions — never a fresh un-geared solo scholar.
// Usage: node scripts/test-allyslot3-b.js
// Exit 0 = all checks pass. On pre-slot code §1 fails (sense returns
// [c1, c2]) and §6 fails (ally3Vid null) — those failures ARE the
// reproduction of finding #2515's engine half.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function hasLine(rec, re) { return (rec.log || []).some(function (s) { return re.test(s); }); }

// ================= SENSE PROBE (bare ctx, real party-wiring.js) =================
globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
require(path.join(REPO, 'src', 'js', 'party-wiring.js'));
const BareGame = globalThis.Scattering.Game;
const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');

function makeCtx(opts) {
  const o = opts || {};
  const nodes = o.nodes || { h1: [5, 5], c1: [1, 1], c2: [8, 8], c3: [2, 2], s1: [5, 6], s2: [6, 5] };
  const people = {};
  ['h1', 'c1', 'c2', 'c3', 's1', 's2'].forEach(function (vid) {
    people[vid] = { id: vid, name: vid, dead: !!(o.dead || {})[vid],
      node: nodes[vid] ? [nodes[vid][0], nodes[vid][1]] : null };
  });
  const exped = o.exped || {
    h1: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c1: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c2: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c3: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
  };
  const ctx = {
    villagerId: 'scholar1',
    _outdoorCrew: o.crew || [],
    state: {
      scholar: { day: 60 },
      village: {
        roster: ['h1', 'c1', 'c2', 'c3', 's1', 's2'],
        trust: o.trust || { c1: 40, c2: 30, c3: 35, s1: 50, s2: 45 },
        assignments: o.assignments || {},
        winPlan: o.winPlan || { h1: { stage: 'hunt', target: 'audit', needWave: 4, party: ['c1', 'c2', 'c3'] } },
      },
    },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    agencyState: function () { return { exped: exped }; },
  };
  return ctx;
}
function sense(ctx, vid) { return BareGame.villagerFightAllies.call(ctx, vid) || []; }

(function section0() {
  check('§0 party-wiring reads the ALLYSLOT3 env gate', /ALLYSLOT3/.test(wiringSrc));
  check('§0 fieldFights reads the ALLYSLOT3 env gate + ally3 slot', /ALLYSLOT3/.test(ffSrc) && /ally3Vid/.test(ffSrc));
  check('§0 game.js wild router reads the ALLYSLOT3 cap', /ALLYSLOT3/.test(gameSrc));
})();

(function section1() {
  process.env.SENSEEXPED = '1'; process.env.ALLYSLOT3 = '1';
  const got = sense(makeCtx({}), 'h1');
  check('§1 probe: launched quad sensed as all 3 launch companions (arm)',
    eq(got, ['c1', 'c2', 'c3']), got);
  delete process.env.SENSEEXPED; delete process.env.ALLYSLOT3;
})();

(function section2() {
  process.env.SENSEEXPED = '1'; delete process.env.ALLYSLOT3;
  const got = sense(makeCtx({}), 'h1');
  check('§2 flag off: quad sensed as holder + 2 (cap 2, launch order)',
    eq(got, ['c1', 'c2']), got);
  delete process.env.SENSEEXPED;
})();

(function section3() {
  process.env.SENSEEXPED = '1'; process.env.ALLYSLOT3 = '1';
  const got = sense(makeCtx({ exped: {}, winPlan: {} }), 'h1');
  check('§3 non-launched meeting stays capped at 2 (strangers only)',
    eq(got, ['s1', 's2']), got);
  delete process.env.SENSEEXPED; delete process.env.ALLYSLOT3;
})();

(function section4() {
  process.env.SENSEEXPED = '1'; process.env.ALLYSLOT3 = '1';
  // SENSEEXPED (sim-senseexped-b): the sense reads the EXPEDITION,
  // not winPlan — so a trio launch is staged as a trio expedition
  // (c3 holds no expedition entry here), not a trio winPlan party.
  const ctx = makeCtx({ exped: {
    h1: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c1: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c2: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
  }, winPlan: { h1: { stage: 'hunt', target: 'audit', needWave: 4, party: ['c1', 'c2'] } } });
  const got = sense(ctx, 'h1');
  check('§4 trio launch unaffected: 2 companions, no 3rd seat',
    eq(got, ['c1', 'c2']), got);
  delete process.env.SENSEEXPED; delete process.env.ALLYSLOT3;
})();

(function section5() {
  process.env.SENSEEXPED = '1'; process.env.ALLYSLOT3 = '1';
  const ctx = makeCtx({ exped: {
    h1: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c1: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c2: { tx: 3, ty: 3, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
    c3: { tx: 7, ty: 7, dist: 4, legs: 1, sinceDay: 60, sincePart: 0, duration: 12, finds: [], encounters: [] },
  } });
  const got = sense(ctx, 'h1');
  check('§5 third companion on a different target: no 3rd seat, falls back to a stranger',
    eq(got, ['c1', 'c2']), got);
  delete process.env.SENSEEXPED; delete process.env.ALLYSLOT3;
})();

// ================= STAGED QUAD FIGHT (harness, real fieldFight) =================
function stage(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  if (roster.length < 4) { console.log('SKIP need 4+ NPC roster, have ' + roster.length); process.exit(2); }
  const fighter = roster[0], a1 = roster[1], a2 = roster[2], a3 = roster[3];
  Game.npcSetNode(fighter, 5, 5);
  Game.npcSetNode(a1, 5, 5); Game.npcSetNode(a2, 5, 5); Game.npcSetNode(a3, 5, 5);
  v.trust = v.trust || {};
  v.trust[a1] = 50; v.trust[a2] = 50; v.trust[a3] = 50;
  v.health = v.health || {};
  return { v: v, Game: Game, fighter: fighter, a1: a1, a2: a2, a3: a3 };
}
function strip(Game, id) {
  try {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (p) { p.items = []; p.equipped = {}; }
  } catch (e) {}
}
function resetHealth(s) {
  s.v.health[s.fighter] = 200; s.v.health[s.a1] = 100; s.v.health[s.a2] = 100; s.v.health[s.a3] = 100;
  strip(s.Game, s.fighter); strip(s.Game, s.a1); strip(s.Game, s.a2); strip(s.Game, s.a3);
}

(async () => {
  // ---------- ARMED LEG (FIGHTALLY2=1 + ALLYSLOT3=1 + SENSEEXPED=1) ----------
  process.env.FIGHTALLY2 = '1'; process.env.ALLYSLOT3 = '1'; process.env.SENSEEXPED = '1';
  const { Game } = await loadGame({ seed: 424242, mode: 'allyslot3', fullTelemetry: false });
  await setupGame(Game);
  const s = stage(Game);
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'gavel'; }) || {};

  // (a) From-start: all three join at the door, all three strike.
  resetHealth(s);
  const recA = Game.fieldFight(s.fighter, mdef, null, { allies: 3, allyVids: [s.a1, s.a2, s.a3], allyFromStart: true });
  check('§6a armed from-start: all three allies join (allyVid/ally2Vid/ally3Vid set)',
    !!recA.allyVid && !!recA.ally2Vid && !!recA.ally3Vid,
    { allyVid: recA.allyVid, ally2Vid: recA.ally2Vid, ally3Vid: recA.ally3Vid });
  check('§6b armed from-start: third door line in the log',
    hasLine(recA, /already at the door too/), (recA.log || []).filter(function (x) { return /door/.test(x); }));
  check('§6c armed from-start: third ally deals damage (ally3Dealt > 0)',
    (recA.ally3Dealt || 0) > 0, recA.ally3Dealt);
  check('§6d armed from-start: unwounded third ally settles nothing (no phantom settlement)',
    recA.ally3Taken === 0 && recA.ally3WoundsSettled === false,
    { ally3Taken: recA.ally3Taken, ally3WoundsSettled: recA.ally3WoundsSettled });
  console.log('  [armed from-start] outcome=' + recA.outcome + ' rounds=' + recA.rounds +
    ' mDealt=' + recA.mDealt + ' allyDealt=' + recA.allyDealt + ' ally3Dealt=' + recA.ally3Dealt +
    ' ally3Taken=' + recA.ally3Taken);

  // (b) Shout path: no allyFromStart — the third shout must fire.
  // Fresh load (same seed): the from-start fight above consumed the
  // RNG stream, so the shout fight runs on its own load, exactly like
  // the fightallycap test's separate legs. Frozen numbers from that
  // load: shout rounds 2/3/4, vFlee round 4.
  const { Game: GameS } = await loadGame({ seed: 424242, mode: 'allyslot3', fullTelemetry: false });
  await setupGame(GameS);
  const sS = stage(GameS);
  resetHealth(sS);
  const recB = GameS.fieldFight(sS.fighter, mdef, null, { allies: 3, allyVids: [sS.a1, sS.a2, sS.a3] });
  check('§7a armed shout: third ally joins (ally3Vid set, ally3Joined)',
    !!recB.ally3Vid && recB.ally3Joined === true,
    { ally3Vid: recB.ally3Vid, ally3Joined: recB.ally3Joined, shout3Round: recB.shout3Round });
  check('§7b armed shout: third-shout line in the log',
    hasLine(recB, /shouts a third time!/), (recB.log || []).filter(function (x) { return /shout/.test(x); }));
  check('§7c armed shout: third ally arrives with a real body (entry 100, hp left 100)',
    recB.ally3EntryHp === 100 && recB.ally3HpLeft === 100,
    { ally3EntryHp: recB.ally3EntryHp, ally3HpLeft: recB.ally3HpLeft });
  check('§7d armed shout: frozen shout rounds (2/3/4) and the fight flees round 4',
    recB.shoutRound === 2 && recB.shout2Round === 3 && recB.shout3Round === 4 &&
    recB.outcome === 'vFlee' && recB.rounds === 4,
    { shoutRound: recB.shoutRound, shout2Round: recB.shout2Round, shout3Round: recB.shout3Round, outcome: recB.outcome, rounds: recB.rounds });
  console.log('  [armed shout] outcome=' + recB.outcome + ' rounds=' + recB.rounds +
    ' mDealt=' + recB.mDealt + ' ally3Dealt=' + recB.ally3Dealt +
    ' shout2Round=' + recB.shout2Round + ' shout3Round=' + recB.shout3Round);

  // ---------- CONTROL LEG (ALLYSLOT3 unset; FIGHTALLY2=1 + SENSEEXPED=1 stay) ----------
  delete process.env.ALLYSLOT3;
  const { Game: Game2 } = await loadGame({ seed: 424242, mode: 'allyslot3', fullTelemetry: false });
  await setupGame(Game2);
  const s2 = stage(Game2);
  resetHealth(s2);
  const recC = Game2.fieldFight(s2.fighter, mdef, null, { allies: 3, allyVids: [s2.a1, s2.a2, s2.a3], allyFromStart: true });
  check('§8a control from-start: only two allies join (ally3Vid null)',
    !!recC.allyVid && !!recC.ally2Vid && !recC.ally3Vid,
    { allyVid: recC.allyVid, ally2Vid: recC.ally2Vid, ally3Vid: recC.ally3Vid });
  check('§8b control from-start: no third-ally damage (ally3Dealt 0)',
    (recC.ally3Dealt || 0) === 0, recC.ally3Dealt);
  console.log('  [control from-start] outcome=' + recC.outcome + ' rounds=' + recC.rounds +
    ' mDealt=' + recC.mDealt + ' allyDealt=' + recC.allyDealt);

  console.log('test-allyslot3-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error('HARNESS ERROR', e && e.stack || e); process.exit(1); });
