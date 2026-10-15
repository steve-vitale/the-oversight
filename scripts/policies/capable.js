// policies/capable.js — the CAPABLE bot (Steve 2026-10-14: "Build a bot").
//
// A sim player that actually uses the game, so sims can measure builds.
// The 2026-10-14 simulator audit (evidence/2026-10-14/simulator-audit.md §2)
// found every policy plays about a third of the game: no real fleeing, no
// ability use, no held conversations, option 0 everywhere, the Table never
// answered. This policy closes those gaps WITHOUT forking competent: it
// composes leadfeast (competent + LEAD-road courtship + the r13 feast layer)
// and adds its own layers on top.
//
// Base: feastscale.leadfeast, called with two existing opt-in gates forced
// on for the duration of each call (withEnv — set, call, restore; never
// leaks to other policies in the same process):
//   COMPETENT_DIRECTIONAL_FLEE=1  recover-and-return after a flee; competent's
//                                 own flee() picks the havenward exit
//   FEASTSCALE_R13=1              tribute/tend count as feast contribution, so
//                                 feasts fire on the courtship road
//
// Layers, in priority order (Steve's brief):
//   1. REAL FLEEING — when outmatched or losing, walk (movement-clamped) to the
//      havenward edge chosen by competent.chooseFleeDir and push THROUGH it
//      (tbBarrierExit). Committed: once fleeing, keep fleeing until out.
//      Holds in sealed fights (the engine says no exit); at Haven takes the
//      hall door or the grounds barrier. Also leaves a known beam Stranger
//      without resistant gear and an outmatching Highbeam Deer (threatFlee).
//   1b. AFTERCARE (2026-10-15): treats lockjaw (treatLockjaw) and calls for
//      help once per raid crisis (raidCall).
//   2. ABILITIES IN COMBAT — every held combat action from abilities.json is
//      scored each turn (control early, payoffs when they land, loaders only
//      with a target in reach and nothing already loaded), fired through
//      Game.useAbility. Never below the hunger gate (kcal < 500 refuses all
//      abilities — foodPower.js), never twice when a per-fight precheck or
//      our own per-fight cap says no. Signature-monster counter verbs
//      (sigW3a/b/c, sigW4, sigW5) are read from their own button builders
//      (the same HTML the phone renders) and pressed by a priority table.
//   3. CHOICES BY SCORING — ability offers (synergy legs held > path
//      consistency > combat value), contest phases (reward vs harm, harm
//      weighted up when hurt or deep in the waves), Table seat (taken at
//      day >= 90 via tableTakeSeat when tablePreview().ready), Table paths
//      (earned strength + branch fit), Table beats (branch-fit words, never
//      the trial by combat), relic enhancements, relay scenes.
//   4. HELD CONVERSATIONS — competent.holdConversation, target by need:
//      pending want first, then grief/fear, then lowest trust.
//   5. CLIMB THE SCALE + FOOD DEEDS — inherited from leadfeast (courtship,
//      tend, feast with tribute counted, channelDevotion, feastFightRoad).
//      Plus the relay office: appoint steady hands when the network goes
//      live (or take it yourself when the pantry is deep), then commune and
//      answer the System's scenes.
//
// Randomness: global.__policyRandom only (seeded per run by the harness);
// a local seeded fallback when run outside the harness. Never Math.random.
//
// What it measures: the game as a capable player plays it — death rates
// with real fleeing, ability/build effects, Table reach and path spread.
// Counters on ctx (cap*) are listed in capableSummary().
'use strict';
const C = require('./competent');
const { leadfeast } = require('./feastscale');
const { harmScore } = require('./risk-aware');

const BASE = leadfeast;
const ENV = { COMPETENT_DIRECTIONAL_FLEE: '1', FEASTSCALE_R13: '1', COMPETENT_ROUTE_AROUND: '1',
  COMPETENT_COOK_HAUL: '1', COMPETENT_TREAT_SICK: '1', COMPETENT_TALK_SKILLS: '1', COMPETENT_DETECTIVE: '1' };
for (const k of String(process.env.CAPABLE_OFF || '').split(',').map(x => x.trim()).filter(Boolean)) delete ENV[k];

// ---------- plumbing ----------
let _fallbackSeed = 0x9e3779b9;
function rnd() {
  if (typeof global.__policyRandom === 'function') return global.__policyRandom();
  // deterministic fallback (mulberry32) — never Math.random
  _fallbackSeed = (_fallbackSeed + 0x6D2B79F5) >>> 0;
  let t = _fallbackSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function withEnv(fn) {
  const prev = {};
  for (const k of Object.keys(ENV)) { prev[k] = process.env[k]; process.env[k] = ENV[k]; }
  try { return fn(); }
  finally {
    for (const k of Object.keys(ENV)) {
      if (prev[k] === undefined) delete process.env[k]; else process.env[k] = prev[k];
    }
  }
}
function bump(ctx, k, n) { ctx[k] = (ctx[k] || 0) + (n == null ? 1 : n); }
function bumpMap(ctx, k, key) { const m = ctx[k] || (ctx[k] = {}); m[key] = (m[key] || 0) + 1; }
function note(ctx, msg) {
  // policy-side errors are surfaced, not swallowed: bounded list on ctx
  try { const a = ctx.capErrors || (ctx.capErrors = []); if (a.length < 40) a.push(String(msg).slice(0, 160)); } catch (e) { /* ctx itself unusable */ }
}
function day(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function hpFrac(Game) {
  try { const s = Game.state.scholar || {}; return (s.health || 0) / Math.max(1, (Game.maxHealth ? Game.maxHealth() : s.maxHealth) || 100); } catch (e) { return 1; }
}
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function cheb(a, b) { return Math.max(Math.abs((a.mx || 0) - (b.mx || 0)), Math.abs((a.my || 0) - (b.my || 0))); }

function endTurn(Game) {
  try {
    if (!Game.tbfight || Game.tbfight.over || !Game.tbIsPlayerTurn()) return;
    const q = Game.tbFighter('p');
    if (!q) return;
    q.moveLeft = 0; q.acted = true;
    Game.tbAfterPlayerAction();
  } catch (e) { /* fight ended under us */ }
}
function turnSpent(Game, p) {
  try {
    if (!Game.tbfight || Game.tbfight.over) return true;
    if (!Game.tbIsPlayerTurn()) return true;
    const q = Game.tbFighter('p');
    return !q || q !== p || !!q.acted;
  } catch (e) { return true; }
}

// stepToward: walk as far toward (tx,ty) as THIS turn's movement allows,
// pricing terrain the way tbPlayerMove does (it refuses paths it can't pay
// for — the "Too far" no-op that froze fights). Returns true if we moved.
function stepToward(Game, p, tx, ty) {
  try {
    if (p.mx === tx && p.my === ty) return false;
    const path = Game.findPath(p.mx, p.my, tx, ty);
    if (!path || !path.length) return false;
    const budget = p.moveLeft || 0;
    let cost = 0, idx = -1;
    for (let i = 0; i < path.length; i++) {
      let c = 1;
      try { c = Game.tbTerrainCost ? Game.tbTerrainCost(path[i][0], path[i][1]) : 1; } catch (e) { c = 1; }
      if (cost + c > budget) break;
      cost += c; idx = i;
    }
    if (idx < 0) return false;
    const bx = p.mx, by = p.my;
    Game.tbPlayerMove(path[idx][0], path[idx][1]);
    const q = Game.tbFighter('p');
    return !!(q && (q.mx !== bx || q.my !== by));
  } catch (e) { return false; }
}

// ---------- per-fight state ----------
function fightState(Game, ctx, f) {
  if (!ctx._cap || ctx._cap.f !== f) {
    ctx._cap = { f, turn: 0, used: {}, refused: {}, sig: {}, fleeing: false, hpHist: [], escapeTried: false, feastCommit: !!ctx._capFeastCommit };
    ctx._capFeastCommit = false;
    bump(ctx, 'capFights');
  }
  return ctx._cap;
}
function liveMons(f) {
  return (f.fighters || []).filter(x => x && (x.kind === 'monster' || x.kind === 'hostile') && x.alive !== false && (x.hp || 0) > 0 && !x.fled);
}
function monWave(Game, m) {
  try {
    const md = m.mdef || ((Game.data || {}).monsters || []).find(d => d.id === m.monsterId);
    return (md && md.wave) || 1;
  } catch (e) { return 1; }
}

// ---------- 1. REAL FLEEING ----------
function fleeSealed(Game, f) {
  try { return !!((Game.state || {}).arenaContest || f.noFlee); } catch (e) { return true; }
}
// Decide whether to disengage this turn. Mirrors competent's walk-away
// triggers (outmatched at the start, < 35% HP) and adds a losing-race read
// (two turns of incoming damage would drop us). Commits once triggered.
function shouldFlee(Game, ctx, st, f, p, mons) {
  if (fleeSealed(Game, f)) return false;
  if (st.fleeing) return true;
  const threat = threatFlee(Game, ctx, p, mons);
  if (threat) { st.why = threat; return true; }
  const pmax = p.maxHp || 100;
  const hp = (p.hp || 0) / Math.max(1, pmax);
  if (C.coalitionCommitted(Game, ctx, f, p)) return false;
  // FEAST COMMIT (deed hunt): a fight picked to spend the feast buff holds
  // until a blow lands (feastSurgeUsed) — unless HP drops under half.
  if (st.feastCommit && feastPending(Game) && hp >= 0.5) return false;
  if (st.turn === 1) {
    let totalMhp = 0, maxWave = 1;
    for (const m of mons) { totalMhp += m.maxHp || m.hp || 0; maxWave = Math.max(maxWave, monWave(Game, m)); }
    const huntCommitted = !!(ctx._huntCommit && maxWave === 3 && hp >= 0.5);
    if (!huntCommitted && (totalMhp > 2.5 * pmax || (maxWave >= 2 && hp < 0.7) || hp < 0.5)) { st.why = 'outmatched'; return true; }
  }
  if (hp < (ctx._huntCommit ? 0.12 : 0.35)) { st.why = 'low-hp'; return true; }
  // losing race: average incoming over the last two turns, doubled, >= HP left
  const h = st.hpHist;
  if (h.length >= 3) {
    const taken = Math.max(0, h[h.length - 3] - h[h.length - 1]) / 2;
    const remaining = mons.reduce((t, m) => t + (m.hp || 0), 0);
    if (taken > 0 && taken * 2 >= (p.hp || 0) && remaining > 25) { st.why = 'losing-race'; return true; }
  }
  return false;
}
// THREATS THE HP SUM DOESN'T SEE (death diagnosis 2026-10-15 follow-ups,
// evidence/2026-10-15/diagnosis-deaths.md, root causes #5 and #8). Checked
// every turn, ahead of the HP read, because both kill a full-HP bearer:
//   - BEAM STRANGER: an alien's beam is 90-110% of max HP, armor useless,
//     x0.7 per beam-resistant piece (alienPlayers.js apBeamHit). A Stranger
//     has 80-110 HP, so the outmatched read never fires: 12 of 99 combat
//     deaths, every one a single drop. Flee one we KNOW carries the beam
//     (apKnowsAlien, or we have already felt a beam: _beamHorrorSeen; "if
//     you don't know, it doesn't show") when wearing fewer than
//     CAPABLE_BEAM_RESIST_MIN (default 2) resistant pieces.
//     CAPABLE_BEAM_FLEE=0 turns it off (A/B).
//   - HIGHBEAM DEER (gallowdeer, wave 1, 150-170 HP): its swept beam does
//     the killing ("The beam itself is the argument for leaving."), and
//     170 < 2.5 x 100 so it never reads as outmatched: 14 deaths. Leave when
//     the deer has more HP left than we do. The deed hunt no longer picks
//     it either. CAPABLE_DEER_FLEE=0 turns both off (A/B).
function beamStrangerKnown(Game, m) {
  if (!m || !m.alienPid) return false;
  try {
    if (Game.apHasBeam && !Game.apHasBeam(m.alienPid)) return false;
    const knows = (Game.apKnowsAlien && Game.apKnowsAlien(m.alienPid)) || !!((Game.state.scholar || {})._beamHorrorSeen);
    return !!knows;
  } catch (e) { console.warn('[capable] beamStrangerKnown', e.message); return false; }
}
function beamResistShort(Game) {
  const min = parseInt(process.env.CAPABLE_BEAM_RESIST_MIN || '2', 10);
  try { return ((Game.apBeamResistPieces ? Game.apBeamResistPieces() : []) || []).length < min; } catch (e) { console.warn('[capable] beamResist', e.message); return true; }
}
function isDeer(m) { return !!(m && ((m.mdef || {}).id === 'gallowdeer' || m.monsterId === 'gallowdeer')); }
function threatFlee(Game, ctx, p, mons) {
  if (process.env.CAPABLE_BEAM_FLEE !== '0' && mons.some(m => beamStrangerKnown(Game, m)) && beamResistShort(Game)) {
    bump(ctx, 'capBeamFlee'); return 'beam-stranger';
  }
  if (process.env.CAPABLE_DEER_FLEE !== '0') {
    const deerHp = mons.filter(isDeer).reduce((t, m) => t + (m.hp || 0), 0);
    if (deerHp > 0 && deerHp > (p.hp || 0)) { bump(ctx, 'capDeerFlee'); return 'highbeam'; }
  }
  return null;
}

// THE THREAT IS INSIDE (death diagnosis 2026-10-15,
// evidence/2026-10-15/diagnosis-deaths.md): competent.chooseFleeDir holds at
// the Haven node, because Haven used to be where a flee ENDS. But raiders,
// feast-draw scavengers and breach fights happen AT Haven, and holding there
// meant trading blows to the death with wave-3..5 monsters (300-1,900 HP)
// on a 100 HP bearer: 20 of 48 combat deaths on 16 seeds were "wanted to
// flee, held at Haven". Haven has two real exits:
//   - inside the hall the grid edge is wall, but the DOORS work: step on a
//     door tile mid-fight and you dive outside (game.js tbPlayerMove, "Walls
//     don't work, doors do"); the monsters wait at the door.
//   - on the grounds the barrier works like anywhere else.
// So when we are outmatched or losing at Haven, take the door, or run out
// through the best edge (known, monster-free ground first). The
// recover-and-return walk brings the bearer home after.
// CAPABLE_HAVEN_FLEE=0 restores the old hold (A/B).
function havenEscape(Game, p) {
  if (process.env.CAPABLE_HAVEN_FLEE === '0') return null;
  const px = Game.map.px, py = Game.map.py;
  if (px !== C.DIR_FLEE_HAVEN.x || py !== C.DIR_FLEE_HAVEN.y) return null;
  const s = Game.state.scholar || {};
  if (s.insideHaven) {
    let detail = null;
    try { detail = Game.genDetail(px, py); } catch (e) { detail = null; }
    let best = null;
    for (let y = 0; detail && y < detail.length; y++) {
      for (let x = 0; x < (detail[y] || []).length; x++) {
        if (detail[y][x] !== 'door') continue;
        const pth = (p.mx === x && p.my === y) ? [] : Game.findPath(p.mx, p.my, x, y);
        if (!pth) continue;
        if (!best || pth.length < best.n) best = { door: [x, y], n: pth.length };
      }
    }
    return best;
  }
  let best = null;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    let sc = null;
    try { sc = C.fleeDirScore(Game, px, py, dx, dy); } catch (e) { sc = null; }
    if (!sc) continue;
    let blocked = false;
    try { blocked = !!(Game.travelBlockage && Game.travelBlockage(sc.nx, sc.ny)); } catch (e) { blocked = false; }
    if (blocked) continue;
    if (!best || sc.score > best.score) best = sc;
  }
  return best ? { dir: best } : null;
}
function havenExitDir(Game) {
  const p = (Game.tbFighter && Game.tbFighter('p')) || { mx: 4, my: 4 };
  const e = havenEscape(Game, p);
  return e ? (e.dir || { door: e.door }) : null;
}

// One flee turn. Returns true when the turn is consumed.
function realFlee(Game, ctx, st, f, p) {
  let dir = null;
  try { dir = C.chooseFleeDir(Game, Game.map.px, Game.map.py); } catch (e) { note(ctx, 'chooseFleeDir: ' + e.message); }
  if (!dir) {
    let esc = null;
    try { esc = havenEscape(Game, p); } catch (e) { note(ctx, 'havenEscape: ' + e.message); }
    if (esc && !st.fleeing) { st.fleeing = true; bump(ctx, 'capFleeDecisions'); bumpMap(ctx, 'capFleeWhy', st.why || '?'); bump(ctx, 'capFleeFromHaven'); }
    if (esc && esc.door) {
      // the hall door: one walk, and the move onto the door IS the escape
      if (stepToward(Game, p, esc.door[0], esc.door[1])) bump(ctx, 'capFleeSteps');
      if (!Game.tbfight || Game.tbfight.over || Game.tbfight !== f) {
        bump(ctx, 'capFleeExits'); bump(ctx, 'capFleeDoorExits'); st.fleeing = false;
        try { C.markRecover(Game, ctx); } catch (e) { note(ctx, 'markRecover: ' + e.message); }
        return true;
      }
      endTurn(Game);
      return true;
    }
    if (esc && esc.dir) dir = esc.dir;
  }
  if (!dir) { bump(ctx, 'capFleeHeld'); st.fleeing = false; return false; } // at haven: hold ground
  if (!st.fleeing) { st.fleeing = true; bump(ctx, 'capFleeDecisions'); bumpMap(ctx, 'capFleeWhy', st.why || '?'); }
  let gmax = 8;
  try { gmax = Game.tbGridMax ? Game.tbGridMax() : 8; } catch (e) { gmax = 8; } // titan fights are 12x12
  let tx = dir.dx < 0 ? 0 : dir.dx > 0 ? gmax : p.mx;
  let ty = dir.dy < 0 ? 0 : dir.dy > 0 ? gmax : p.my;
  // BLOCKED EDGE TILE (2026-10-14, seed 1234 day 9): the straight-line edge
  // tile can be a tree. findPath then fails every turn, the bot never reaches
  // the edge, and a betrayer who won't close (a "stalling" human hostile)
  // leaves the fight live forever — a lost game day per loop-day. Head for
  // the nearest REACHABLE tile on the chosen edge instead.
  try {
    const direct = Game.findPath(p.mx, p.my, tx, ty);
    if (!(p.mx === tx && p.my === ty) && (!direct || !direct.length)) {
      const cands = [];
      for (let i = 0; i <= gmax; i++) {
        if (dir.dx) cands.push([dir.dx < 0 ? 0 : gmax, i]);
        if (dir.dy) cands.push([i, dir.dy < 0 ? 0 : gmax]);
      }
      let best = null;
      for (const [cx, cy] of cands) {
        const pth = Game.findPath(p.mx, p.my, cx, cy);
        if (pth && pth.length && (!best || pth.length < best.n)) best = { x: cx, y: cy, n: pth.length };
      }
      if (best) { tx = best.x; ty = best.y; }
    }
  } catch (e) { note(ctx, 'flee edge pick: ' + e.message); }
  const onEdge = () => { const q = Game.tbFighter('p'); return q && ((dir.dx < 0 && q.mx === 0) || (dir.dx > 0 && q.mx === gmax) || (dir.dy < 0 && q.my === 0) || (dir.dy > 0 && q.my === gmax)); };
  if (!onEdge()) { if (stepToward(Game, p, tx, ty)) bump(ctx, 'capFleeSteps'); }
  if (!Game.tbfight || Game.tbfight.over) { bump(ctx, 'capFleeExits'); st.fleeing = false; return true; } // a door, mid-walk
  if (onEdge() && Game.tbIsPlayerTurn()) {
    const bx = Game.map.px, by = Game.map.py;
    try { Game.tbBarrierExit(dir.dx, dir.dy); } catch (e) { note(ctx, 'tbBarrierExit: ' + e.message); }
    bump(ctx, 'capFleePushes');
    const ended = !Game.tbfight || Game.tbfight.over || Game.tbfight !== f;
    const moved = Game.map.px !== bx || Game.map.py !== by;
    if (ended) {
      bump(ctx, 'capFleeExits');
      if (moved) bump(ctx, 'capFleeNodeExits');
      st.fleeing = false;
    } else if (moved) bump(ctx, 'capFleeChased'); // crossed, chase continues — keep running
    if (moved || ended) { try { C.markRecover(Game, ctx); } catch (e) { note(ctx, 'markRecover: ' + e.message); } }
  }
  endTurn(Game);
  return true;
}

// ---------- 2. ABILITIES IN COMBAT ----------
// Score each available action; null = not now. info is the turn's read.
function loaded(s) {
  return !!(s.ambushReady || s.deadAimShot || s.haymakerReady || s.aimBonus || (s.rageActive && s.rageActive.rounds > 0) || (s.tradeOpen && s.tradeOpen.attacksLeft > 0));
}
function isControlled(m) { return (m.stunned || 0) > 0 || (m._frozen || 0) > 0 || (m.blind || 0) > 0 || (m.hesitate || 0) > 0; }
const ACTION_PLAN = {
  'god.turn_the_pain': (I) => ((I.s.fightDamageTaken || 0) >= 20 && I.adj.length ? { s: 12, t: I.adj[0].key } : null),
  'god.terms_ground': (I) => (I.turn <= 2 && I.mons.length >= 3 ? 12 : null),
  'god.terms_ambush': (I) => (I.turn <= 2 && !loaded(I.s) ? 11 : null),
  'god.terms_range': (I) => (I.turn <= 2 && I.nearest && I.dist(I.nearest) <= 2 && I.adj.length ? 10 : null),
  'god.no_lies': (I) => ((I.f.fighters || []).some(x => (x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled) ? 10 : null),
  'god.rally_cry': (I) => ((I.f.fighters || []).some(x => (x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled) ? 11 : null),
  'god.buy_passage': (I) => (I.outmatched || I.hp < 0.5 ? { s: 12, t: I.strongest.key } : null),
  'unbreakable.shake_off': (I) => ((I.p.stunned || 0) > 0 ? 9 : null),
  'unbreakable.brace': (I) => (I.hp < 0.5 && (I.adj.length || I.telegraphed) && I.n('unbreakable.brace') < 2 ? 6 : null),
  'scream_cheese.scream': (I) => (I.turn <= 3 && (I.mons.length >= 2 || (I.strongest.maxHp || 0) >= 60) ? 7 : null),
  'war_cry.bellow': (I) => (I.turn <= 3 && I.mons.length >= 2 && I.n('war_cry.bellow') < 1 ? 6.5 : null),
  'fear_aura.loom': (I) => (I.turn <= 2 && I.n('fear_aura.loom') < 1 ? 6 : null),
  'pocket_sand.throw_sand': (I) => (I.nearest && !(I.nearest.blind > 0) && I.dist(I.nearest) <= 3 && I.n('pocket_sand.throw_sand') < 2 ? 5.5 : null),
  'intimidating_presence.stare_down': (I) => (I.mons.length === 1 && I.n('intimidating_presence.stare_down') < 1 ? { s: 5, t: I.strongest.key } : null),
  'game_sense.read_stance': (I) => (I.n('game_sense.read_stance') < 1 ? { s: 3, t: I.strongest.key } : null),
  'brawler_instinct.read_fight': (I) => (I.n('brawler_instinct.read_fight') < 1 ? 4 : null),
  'freeze_tag.tag': (I) => (I.n('freeze_tag.tag') < 1 ? 5 : null),
  'tripwire.string': (I) => (I.turn <= 2 ? 4.5 : null),
  'bird_strike.call': (I) => (I.n('bird_strike.call') < 1 ? { s: 5, t: I.strongest.key } : null),
  'turncoat.persuade': (I) => (I.mons.length >= 2 && I.n('turncoat.persuade') < 1 ? 7 : null),
  'leech.leech_stance': (I) => (I.n('leech.leech_stance') < 1 && I.hp > 0.6 ? 2 : null),
  'hogtie.bind': (I) => { const m = I.adj.find(isControlled); return m ? { s: 7.5, t: m.key } : null; },
  'come_get_some.goad': (I) => { const m = I.mons.find(x => (x.blind || 0) > 0 && I.dist(x) > 1 && I.dist(x) <= 3); return m && I.n('come_get_some.goad') < 1 ? { s: 3, t: m.key } : null; },
  'static_toss.toss': (I) => { const m = I.mons.find(x => I.dist(x) <= 3); return m ? { s: 8, t: m.key } : null; },
  'cheese_wheel.hurl': () => 8,
  'retribution.unleash': () => 8,
  'trade_of_blows.settle_debt': (I) => ((I.s.fightDamageTaken || 0) >= 20 ? 7 : null),
  'dead_aim.dead_aim_shot': (I) => (I.canLoad ? 6.8 : null),
  'haymaker.throw_haymaker': (I) => (I.canLoad ? 6.2 : null),
  'ambush.set_ambush': (I) => (I.canLoad ? 6 : null),
  'patient_aim.take_aim': (I) => (I.canLoad && I.hp > 0.5 ? 5.5 : null),
  'rage.unleash_rage': (I) => (I.canLoad && I.n('rage.unleash_rage') < 1 ? 6.5 : null),
  'trade_of_blows.open_trade': (I) => (I.canLoad && I.hp > 0.7 && I.n('trade_of_blows.open_trade') < 1 ? 5 : null),
  'peacemaker.walk_in': (I) => (I.outmatched && I.n('peacemaker.walk_in') < 1 ? 8.5 : null),
  // KEEPSAKE L2 ACTIONS (2026-10-14, keepsakes.js): worn keepsake verbs.
  'keepsake.steady': (I) => (((I.p.stunned || 0) > 0 || ((I.p.statuses || []).some(x => x && x.id === 'fear'))) ? 8.5 : null),
  'keepsake.hold': (I) => (I.outmatched ? 8 : null),
  'keepsake.lucky_break': (I) => ((I.p.blindTurns || 0) > 0 || I.s.haymakerReady ? 6 : null),
  // GOD-PATH SUBCLASS VERBS (2026-10-14, godpath.js): board control first,
  // then the payoffs that cash it in.
  'raise_earth.raise': (I) => (I.turn <= 3 && I.nearest && I.dist(I.nearest) >= 2 && I.dist(I.nearest) <= 4 ? 6 : null),
  'gravity_well.pull': (I) => (I.mons.filter(m => I.dist(m) > 1 && I.dist(m) <= 4).length >= 1 && I.n('gravity_well.pull') < 1 && (I.s._nextStrikes || I.canLoad) ? 5 : (I.mons.length >= 2 && I.n('gravity_well.pull') < 1 ? 4.5 : null)),
  'landslide.quake': (I) => (I.mons.filter(m => I.dist(m) <= 2).length >= 1 ? 7.5 : null),
  'pack_hunt.sic': (I) => (I.n('pack_hunt.sic') < 1 ? { s: 7, t: I.strongest.key } : null),
  'mending_hands.mend': (I) => { const a = (I.f.fighters || []).find(x => (x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled && x.hp < x.maxHp * 0.5 && I.dist(x) <= 1); if (a) return { s: 7, t: a.key }; return I.hp < 0.45 ? { s: 6.5, t: 'p' } : null; },
  'aegis_link.link': (I) => { const a = (I.f.fighters || []).filter(x => (x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0]; return (a && I.hp > 0.6 && a.hp < a.maxHp * 0.6 && I.n('aegis_link.link') < 1) ? { s: 6, t: a.key } : null; },
  'blink.blink': (I) => (I.hp < 0.4 && I.adj.length ? 7 : null),
  'switcheroo.swap': (I) => { const m = I.mons.find(x => x.telegraph && I.dist(x) <= 3); return m ? { s: 7.5, t: m.key } : null; },
  'foresight.foresee': (I) => (I.n('foresight.foresee') < 1 && (I.turn <= 2 || I.telegraphed) ? 5.5 : null),
  'live_broadcast.go_live': (I) => (I.n('live_broadcast.go_live') < 1 && I.turn <= 3 ? 5 : null),
  'the_crowd_moves.command': (I) => ((I.f.fighters || []).filter(x => (x.kind === 'villager' || x.kind === 'ally') && x.alive && !x.fled).length >= 2 ? 7 : null),
  'stoke.stoke': (I) => (!I.s._nextStrikes && I.adj.some(m => (m.hp || 0) >= 25) ? 6 : null),
  'coin_guard.coins': (I) => (!I.s._absorb && (I.telegraphed || I.hp < 0.6) ? 6.5 : null),
  'bribe.pay_off': (I) => { const m = I.adj.find(x => !isControlled(x)); return (m && (I.hp < 0.5 || I.mons.length >= 2)) ? { s: 6.5, t: m.key } : null; },
  'animal_ken.calm_beast': (I) => { const m = (I.f.fighters || []).find(x => x && x.alive && !x.fled && x.kind !== 'monster' && x.kind !== 'player' && x.kind !== 'villager' && x.key !== 'p'); return m ? { s: 6, t: m.key } : null; },
};

// Before running from a fight we can't win: one try at a verb that ends
// it (talk it down, calm it) or stalls the pursuers (stun, blind, hesitate).
const ESCAPE_ACTIONS = {
  'god.buy_passage': 1, 'god.terms_ground': 1, 'god.terms_ambush': 1, 'god.terms_range': 1, 'god.rally_cry': 1,
  'peacemaker.walk_in': 1, 'animal_ken.calm_beast': 1, 'scream_cheese.scream': 1, 'war_cry.bellow': 1,
  'pocket_sand.throw_sand': 1, 'fear_aura.loom': 1, 'intimidating_presence.stare_down': 1,
  'keepsake.hold': 1, // anchor L2: the flee through the edge can't be cut off
  'raise_earth.raise': 1, 'landslide.quake': 1, 'bribe.pay_off': 1, 'blink.blink': 1, 'switcheroo.swap': 1, 'pack_hunt.sic': 1, 'coin_guard.coins': 1,
};
function abilityTurn(Game, ctx, st, f, p, mons, extra) {
  const s = Game.state.scholar || {};
  if ((s.kcal || 0) < 500) { bump(ctx, 'capAbilityHungerSkips'); return false; } // the hunger gate refuses everything
  let acts = [];
  try { acts = (Game.activatableAbilities ? Game.activatableAbilities() : []) || []; } catch (e) { note(ctx, 'activatableAbilities: ' + e.message); return false; }
  acts = acts.filter(a => a && a.combat && a.actionId && a.available);
  if (!acts.length) return false;
  const w = (() => { try { return (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 }; } catch (e) { return { range: 1 }; } })();
  const byHp = mons.slice().sort((a, b) => (b.hp || 0) - (a.hp || 0));
  const near = mons.slice().sort((a, b) => cheb(a, p) - cheb(b, p));
  const inRange = mons.filter(m => cheb(m, p) <= (w.range || 1));
  const I = {
    f, p, s, mons, turn: st.turn,
    hp: (p.hp || 0) / Math.max(1, p.maxHp || 100),
    strongest: byHp[0], nearest: near[0],
    adj: mons.filter(m => cheb(m, p) <= 1),
    dist: (m) => cheb(m, p),
    telegraphed: mons.some(m => m.telegraph && (m.telegraph.turnsLeft == null || m.telegraph.turnsLeft <= 1)),
    canLoad: !loaded(s) && inRange.some(m => (m.hp || 0) >= 25),
    outmatched: !!(extra && extra.outmatched),
    n: (k) => st.used[k] || 0,
  };
  let best = null;
  for (const a of acts) {
    const key = a.abilityId + '.' + a.actionId;
    if (st.refused[key]) continue;
    const plan = ACTION_PLAN[key];
    if (!plan) continue;
    if (extra && extra.outmatched && !ESCAPE_ACTIONS[key]) continue; // escape mode: only verbs that end or stall the fight
    const kc = (a.cost && a.cost.kcal) || 0;
    if (kc && (s.kcal || 0) < 500 + kc + 50) continue; // stay above the hunger gate after paying
    let r = null;
    try { r = plan(I); } catch (e) { note(ctx, 'plan ' + key + ': ' + e.message); }
    if (r == null) continue;
    const sc = typeof r === 'number' ? r : r.s;
    const tgt = typeof r === 'number' ? null : r.t;
    const jit = sc + rnd() * 0.3;
    if (!best || jit > best.sc) best = { a, key, sc: jit, tgt };
  }
  if (!best) return false;
  let ok = false;
  try { ok = Game.useAbility(best.a.abilityId, best.a.actionId, best.tgt != null ? best.tgt : undefined); } catch (e) { note(ctx, 'useAbility ' + best.key + ': ' + e.message); }
  if (ok) {
    st.used[best.key] = (st.used[best.key] || 0) + 1;
    bump(ctx, 'capAbilityUses');
    bumpMap(ctx, 'capAbilityById', best.key);
  } else {
    st.refused[best.key] = 1;
    bump(ctx, 'capAbilityRefused');
  }
  if (turnSpent(Game, p)) return true;
  return false;
}

// Signature-monster counter verbs: read each module's own combat-button
// builder (the HTML the phone shows), press by priority. Each entry: base
// priority, per-fight cap, optional guard.
const SIG_W3C_IDS = { 'c-funeral': 'tbPlayerFuneral', 'c-nameit': 'tbPlayerNameIt', 'c-closeeyes': 'tbPlayerCloseEyes', 'c-skipad': 'tbPlayerSkipAd', 'c-lookaway': 'tbPlayerLookAway' };
const SIG_PREF = {
  'gavel-recess': [9, 1], 'gavel-object': [8, 1], 'gavel-confess': [3, 1], dodge: [4, 2],
  tbTosInvokeLoophole: [10, 1], tbTosObject: [7, 1], tbTosRead: [6, 1], tbSpoolExamineReel: [5, 1], tbChorusThrowGravel: [6, 2],
  tbPlayerSkipAd: [9, 2], tbPlayerFuneral: [9, 2], tbPlayerCloseEyes: [7, 3], tbPlayerLookAway: [6, 2], tbPlayerNameIt: [5, 1],
  tbCongRefuse: [9, 1], tbCongHeresy: [8, 2], tbStrikeMeet: [9, 2], tbInflOutentertain: [6, 2], tbAuditRead: [5, 1],
  tbSuburbLeave: [8, 4], tbSuburbRest: [7, 2, (I) => I.hp < 0.5], tbEulogyRewrite: [10, 1], tbEulogyContradict: [7, 4],
  tbAlgoTank: [6, 2], tbEaterPoison: [7, 1],
  tbCxOffScript: [8, 2], tbEdContradict: [6, 2], tbEdRetrieve: [5, 1], 'tbRrLeaveMessage:left': [6, 1], 'tbRrLeaveMessage:big': [5, 1],
  tbSpAsk: [6, 1], tbSpCheapFulfill: [5, 1], tbTsOwnVenue: [7, 1], 'tbFiSacrifice:memory': [8, 3, (I) => (I.s.kcal || 0) > 900],
  'tbNnBadNote:smaller': [7, 1], tbNnReadMemo: [4, 1],
};
function sigButtons(Game, f, p, mons, ctx) {
  let html = '';
  const grab = (name, fn) => { try { const h = fn(); if (h) html += h; } catch (e) { note(ctx, name + ': ' + e.message); } };
  if (Game.sigCombatButtonsHTML) grab('sigCombatButtonsHTML', () => Game.sigCombatButtonsHTML(mons, p));
  if (Game.sigW3bCombatButtons) grab('sigW3bCombatButtons', () => Game.sigW3bCombatButtons());
  if (Game.sigW3cCombatButtons) grab('sigW3cCombatButtons', () => Game.sigW3cCombatButtons(mons, p));
  if (Game.sigW4CombatButtons) grab('sigW4CombatButtons', () => Game.sigW4CombatButtons());
  if (Game.sigW5CombatButtons) grab('sigW5CombatButtons', () => Game.sigW5CombatButtons());
  const out = [];
  const re = /<button([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    if (/\sdisabled\b/.test(attrs)) continue;
    const get = (n) => { const r = new RegExp(n + '="([^"]*)"').exec(attrs); return r ? r[1] : null; };
    let fn = null, arg = null, call = null;
    const sigAct = get('data-sig-act');
    if (sigAct) { fn = sigAct; call = () => Game.sigCombatAct(sigAct); }
    else if (get('data-sigw3b')) { fn = get('data-sigw3b'); }
    else if (get('data-sigw4')) { fn = get('data-sigw4'); }
    else if (get('data-sigw5')) { fn = get('data-sigw5'); arg = get('data-arg'); }
    else if (get('id') && SIG_W3C_IDS[get('id')]) { fn = SIG_W3C_IDS[get('id')]; }
    if (!fn) continue;
    if (!call) { const f2 = fn, a2 = arg; call = () => (a2 ? Game[f2](a2) : Game[f2]()); }
    out.push({ key: arg ? fn + ':' + arg : fn, call });
  }
  return out;
}
function sigTurn(Game, ctx, st, f, p, mons) {
  const btns = sigButtons(Game, f, p, mons, ctx);
  if (!btns.length) return false;
  const I = { s: Game.state.scholar || {}, hp: (p.hp || 0) / Math.max(1, p.maxHp || 100) };
  let best = null;
  for (const b of btns) {
    const pref = SIG_PREF[b.key];
    if (!pref) continue;
    if ((st.sig[b.key] || 0) >= pref[1]) continue;
    if (pref[2] && !pref[2](I)) continue;
    const sc = pref[0] + rnd() * 0.3;
    if (!best || sc > best.sc) best = Object.assign({ sc }, b);
  }
  if (!best) return false;
  st.sig[best.key] = (st.sig[best.key] || 0) + 1;
  try { best.call(); } catch (e) { note(ctx, 'sig ' + best.key + ': ' + e.message); }
  bump(ctx, 'capSigUses');
  bumpMap(ctx, 'capSigById', best.key);
  if (turnSpent(Game, p)) return true;
  return false;
}

function capableFight(Game, ctx) {
  const f = Game.tbfight;
  if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
  const p = Game.tbFighter('p');
  if (!p) return false;
  const st = fightState(Game, ctx, f);
  st.turn++;
  st.hpHist.push(p.hp || 0);
  const mons = liveMons(f);
  if (!mons.length) return withEnv(() => C.competent.fight(Game, ctx));
  // 1. real flee (an escape ability gets one try first)
  let flee = false;
  try { flee = shouldFlee(Game, ctx, st, f, p, mons); } catch (e) { note(ctx, 'shouldFlee: ' + e.message); }
  if (flee) {
    if (!st.escapeTried) {
      st.escapeTried = true;
      try { if (abilityTurn(Game, ctx, st, f, p, mons, { outmatched: true })) return true; } catch (e) { note(ctx, 'escape ability: ' + e.message); }
      if (!Game.tbfight || Game.tbfight.over) return true;
    }
    try { if (realFlee(Game, ctx, st, f, p)) return true; } catch (e) { note(ctx, 'realFlee: ' + e.message); }
  }
  // 2a. signature counter verbs
  try { if (sigTurn(Game, ctx, st, f, p, mons)) return true; } catch (e) { note(ctx, 'sigTurn: ' + e.message); }
  if (!Game.tbfight || Game.tbfight.over) return true;
  // 2b. abilities
  try { if (abilityTurn(Game, ctx, st, f, p, mons)) return true; } catch (e) { note(ctx, 'abilityTurn: ' + e.message); }
  if (!Game.tbfight || Game.tbfight.over) return true;
  // otherwise: competent's tricks + strikes (its own flee is directional under ENV)
  return withEnv(() => C.competent.fight(Game, ctx));
}

// ---------- 3. CHOICES BY SCORING ----------
function abilityDef(Game, id) { try { return ((Game.data || {}).abilities || []).find(a => a && a.id === id) || null; } catch (e) { return null; } }
function scoreOffer(Game, offer, heldIds) {
  const def = abilityDef(Game, offer.id) || {};
  let sc = 0;
  try {
    for (const syn of ((Game.data || {}).synergies || [])) {
      const req = (syn && syn.requires) || [];
      if (!Array.isArray(req) || req.indexOf(offer.id) < 0) continue;
      const others = req.filter(r => r !== offer.id);
      const have = others.filter(r => heldIds.indexOf(r) >= 0).length;
      if (others.length && have === others.length) sc += 20; // completes a synergy
      else sc += 6 * have; // a leg toward one we hold part of
    }
  } catch (e) { /* malformed synergy row: score without it */ }
  // GOD-PATH (2026-10-14): one source — def.path (+ alsoPath).
  const pathsOf = (d) => (d ? [d.path, d.alsoPath].filter(Boolean) : []);
  const paths = pathsOf(def);
  for (const h of heldIds) {
    const hd = abilityDef(Game, h);
    for (const pth of pathsOf(hd)) if (paths.indexOf(pth) >= 0) sc += 3;
  }
  if ((def.actions || []).some(a => (a.context || 'explore') === 'combat' && !a.automatic)) sc += 4;
  if (def.role === 'payoff') sc += 1; else if (def.role === 'enabler') sc += 0.5;
  if (def.pool === 'combat') sc += 1;
  return sc + rnd() * 0.5;
}
function heldAbilityIds(Game) {
  try { return ((Game.data || {}).abilities || []).filter(a => a && Game.hasAbility(a.id)).map(a => a.id); } catch (e) { return []; }
}
function chooseOffers(Game, ctx) {
  try {
    const s = Game.state.scholar || {};
    const ch = s.abilityChoices;
    if (!ch || !ch.length || !Game.chooseAbility) return;
    // Held set via the engine's own query (hasAbility), never by reading
    // scholar.abilities: human abilities may move to skills and still answer.
    const held = heldAbilityIds(Game);
    if (ctx._capOfferSig === JSON.stringify(ch.map(c => c.id)) && ctx._capOfferDay === day(Game)) return; // refused today (no slot): don't spin
    // ONE BRAIN (parity 2026-10-14): the game's build brain (villager-build.js
    // buildScore / buildDecide) scores for the bot exactly as it does for
    // villagers. The local scorer is the fallback for older code.
    const brain = typeof Game.buildScore === 'function' && typeof Game.buildDecide === 'function';
    let best = null;
    for (const o of ch) {
      const sc = brain ? Game.buildScore('player', o.id, { onSheet: true }) : scoreOffer(Game, o, held);
      if (!best || sc > best.sc) best = { o, sc };
    }
    // UNIFIED TRACKS (2026-10-14): a level-up sheet with full slots asks what
    // the pick replaces. Score the held abilities the same way (against the
    // rest of the build) and swap only when the offer beats the weakest;
    // otherwise keep what we have.
    const isLevelUp = String(ch[0].src || '').indexOf('level_up:') === 0;
    const slotsFull = ((Game.state.scholar || {}).abilities || []).length >= (Game.abilitySlots ? Game.abilitySlots() : 6);
    if (isLevelUp && slotsFull && Game.keepAbilities && brain) {
      const d = Game.buildDecide('player', ch.map(c => c.id));
      if (d.pick && d.replace) { Game.chooseAbility(d.pick, d.replace); bump(ctx, 'capLevelUpReplaced'); bumpMap(ctx, 'capOfferPicks', d.pick); }
      else { Game.keepAbilities(); bump(ctx, 'capLevelUpKept'); }
      return;
    }
    if (isLevelUp && slotsFull && Game.keepAbilities) {
      const mine = ((Game.state.scholar || {}).abilities || []).map(e => (e && e.id) || e).filter(id => id && id !== 'fusion_reactor');
      let worst = null;
      for (const id of mine) {
        const others = held.filter(h => h !== id);
        const sc = scoreOffer(Game, { id }, others);
        if (!worst || sc < worst.sc) worst = { id, sc };
      }
      if (worst && best.sc > worst.sc + 1) {
        Game.chooseAbility(best.o.id, worst.id);
        bump(ctx, 'capLevelUpReplaced');
      } else {
        Game.keepAbilities();
        bump(ctx, 'capLevelUpKept');
      }
      bumpMap(ctx, 'capOfferPicks', best.o.id);
      return;
    }
    Game.chooseAbility(best.o.id);
    if (isLevelUp) bump(ctx, 'capLevelUpPicked');
    if ((Game.state.scholar || {}).abilityChoices === ch) { // engine refused (no free slot): the offer waits
      ctx._capOfferSig = JSON.stringify(ch.map(c => c.id)); ctx._capOfferDay = day(Game);
      bump(ctx, 'capOffersNoSlot');
      return;
    }
    bump(ctx, 'capOffersChosen');
    if (best.o.id !== ch[0].id) bump(ctx, 'capOffersNotFirst');
    bumpMap(ctx, 'capOfferPicks', best.o.id);
  } catch (e) { note(ctx, 'chooseOffers: ' + e.message); }
}
// KEEPSAKES (2026-10-14, Steve: keepsakes compete with accessory gear and
// grow only while worn): simple rule — while an accessory slot is free, wear
// the highest-bond keepsake from the pack. Never takes anything off.
function wearKeepsakes(Game, ctx) {
  try {
    if (!Game.equipAccessory || !Game.isKeepsake) return;
    const s = Game.state.scholar || {};
    const eq = s.equipped || {};
    for (let guard = 0; guard < 4; guard++) {
      if (!['acc1', 'acc2', 'acc3', 'acc4'].some(sl => !eq[sl])) return;
      let best = -1;
      (s.inventory || []).forEach((it, idx) => {
        if (!it || !Game.isKeepsake(it)) return;
        if (Game.keepsakeMine && !Game.keepsakeMine(it)) return;
        if (best < 0 || (it.bond || 0) > (s.inventory[best].bond || 0)) best = idx;
      });
      if (best < 0) return;
      if (!Game.equipAccessory(best)) return;
      bump(ctx, 'capKeepsakesWorn');
    }
  } catch (e) { note(ctx, 'wearKeepsakes: ' + e.message); }
}

function answerRelic(Game, ctx) {
  try {
    const rc = (Game.state.scholar || {}).relicChoices;
    if (!rc || !rc.options || !rc.options.length || !Game.chooseRelicEnhancement) return;
    let best = null;
    for (const o of rc.options) {
      let sc = rnd();
      const d = String(o.description || '') + ' ' + String(o.name || '');
      if (o.secret) sc += 2;
      if (/hp|heal|hold at 1|survive|protect|armor|damage|strike/i.test(d)) sc += 2;
      if (/kcal|food|hunger|feast/i.test(d)) sc += 1;
      if (!best || sc > best.sc) best = { o, sc };
    }
    Game.chooseRelicEnhancement(best.o.id);
    bump(ctx, 'capRelicChosen');
    if (best.o.id !== rc.options[0].id) bump(ctx, 'capRelicNotFirst');
  } catch (e) { note(ctx, 'answerRelic: ' + e.message); }
}

// Contest phases: reward minus harm, harm weighted up when hurt or deep in
// the waves. Participation: refuse high/extreme billing when hurt.
function contestReward(ch) {
  const d = (ch && ch.do) || {};
  let r = 0;
  if (ch && ch.next === 'WIN') r += 30;
  if (ch && ch.next === 'LOSE') r -= 30;
  if (d.prize) r += 15;
  if (d.notability) r += 4;
  if (typeof d.kcal === 'number' && d.kcal > 0) r += d.kcal / 100;
  if (d.cheer) r += 3;
  if (d.comfort) r += 2;
  if (d.heckle) r -= 2;
  return r;
}
// LETHAL CHOICES (death diagnosis 2026-10-15): harmScore prices damage in
// the abstract, so at 8 HP "One more measure" (16-28, x1.5 on an
// EXTREME billing, said aloud) still out-scored "Offer your name" (trauma)
// — 5 of 9 contest deaths on 16 seeds were the Blood Tithe taken past the
// bearer's own HP. Read the damage the way contestChoose applies it
// (hardened x1.25, high/extreme x1.5, shows never kill) and the Maw's
// distance. Returns the chance this choice kills (0..1); a death outweighs
// any trauma or lost prize. CAPABLE_CONTEST_LETHAL=0 turns the read off (A/B).
function contestLethal(Game, ac, ch) {
  if (process.env.CAPABLE_CONTEST_LETHAL === '0') return 0;
  const d = (ch && ch.do) || {};
  if (typeof d.mawDist === 'number' && typeof ac.mawDist === 'number' && ac.mawDist + d.mawDist <= 0) return 1;
  if (!Array.isArray(d.dmg) || d.dmg.length < 2) return 0;
  if (ac.kind === 'show' || ac.kind === 'summons') return 0; // TV doesn't kill (capped at 1 HP)
  let mult = 1;
  if (ac.variant === 'hardened') mult *= 1.25;
  let risk = null;
  try { risk = ((Game._cxScaledContest ? Game._cxScaledContest(ac) : null) || {}).risk; } catch (e) { risk = null; }
  if (risk === 'high' || risk === 'extreme') mult *= 1.5;
  const cur = (Game.state.scholar || {}).health || 0;
  const lo = Math.ceil(d.dmg[0] * mult), hi = Math.ceil(d.dmg[1] * mult);
  if (lo >= cur) return 1;
  if (hi < cur) return 0;
  return (hi - cur + 1) / (hi - lo + 1); // uniform roll, as contestChoose rolls it
}
function capableContest(Game, ctx) {
  try {
    const ac = Game.state && Game.state.activeContest;
    if (!ac || ac.phase === 'done') return false;
    if (Game.tbfight && !Game.tbfight.over) return false; // arena fight: the fight driver owns it
    const phase = (ac.phases || [])[ac.phaseIdx || 0];
    if (!phase || !phase.choices || !phase.choices.length) return false;
    const choices = phase.choices;
    const hp = hpFrac(Game);
    let wave = 1;
    try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { wave = 1; }
    const refuseIdx = choices.findIndex(ch => ch && ch.next === 'REFUSE');
    let pick = 0;
    if (refuseIdx >= 0 && (!ac.participant || ac.participant === 'player')) {
      let risk = 'medium';
      try { const c = (Game.contestPool ? Game.contestPool() : []).find(x => x && x.id === ac.contestId); risk = (c && c.risk) || 'medium'; } catch (e) { risk = 'medium'; }
      const refuse = (risk === 'extreme' && hp < 0.8) || (risk === 'high' && hp < 0.6) || hp < 0.4;
      pick = refuse ? refuseIdx : (refuseIdx === 0 ? 1 : 0);
      if (refuse) bump(ctx, 'capContestRefusals');
    } else {
      const w = 1 + Math.max(0, 1 - hp) * 3 + (wave >= 3 ? 0.5 : 0);
      let best = -Infinity, bestLethal = 0;
      const mine = !ac.participant || ac.participant === 'player';
      for (let i = 0; i < choices.length; i++) {
        let sc = contestReward(choices[i]) - harmScore(choices[i]) * w + rnd() * 2;
        const leth = mine ? contestLethal(Game, ac, choices[i]) : 0;
        sc -= 5000 * leth;
        if (sc > best) { best = sc; pick = i; bestLethal = leth; }
      }
      if (mine && choices.some(ch => contestLethal(Game, ac, ch) > 0) && bestLethal === 0) bump(ctx, 'capContestLethalAvoided');
    }
    bump(ctx, 'capContestChoices');
    if (pick !== 0) bump(ctx, 'capContestNotFirst');
    Game.contestChoose(pick);
    return true;
  } catch (e) { note(ctx, 'capableContest: ' + e.message); return false; }
}

// The Table: take the seat when it's ready, then answer the modal chain.
const LIGHT_WORDS = /mercy|hold|refuse|spend|share|protect|honest|truth|feed|give|kind|pledge|carry|shield|gentle|tend|translate|sanctuary|advocate|thank|stay/i;
const DARK_WORDS = /kill|keep|name the|lean|take|tribute|example|rewrite|skim|demand|own|crush|silence|rule/i;
function scoreTableOption(Game, o, T) {
  const id = String(o.id || ''), label = String(o.label || '');
  if (/trial/i.test(id) || /TRIAL BY COMBAT/i.test(label)) return -100; // real death: never volunteered
  let sc = rnd() * 4;
  if (id.indexOf('path:') === 0) {
    const pid = id.slice(5);
    try {
      const ep = (Game.tableEarnedPaths() || []).find(p => p.id === pid);
      sc += (ep && ep.strength) || 0;
      const br = Game.tableBranch(pid);
      if (br && br.branch === 'light') sc += 8;
    } catch (e) { /* unpriced path: jitter only */ }
    return sc;
  }
  // READ THE STAKE (CAPABLE_READ_STAKES=1, diagnosis-endgame 2026-10-15):
  // the build option's label says what it needs ("(needs terror 4+)"). A
  // player reads it; the bot used to pick it on its words and fail the door.
  if (process.env.CAPABLE_READ_STAKES === '1') {
    const m = /\(needs (\w+) (?:(\d+)\+|≤(\d+))\)/.exec(label);
    if (m) {
      const cur = ((T && T.meters) || {})[m[1]] | 0;
      const short = m[2] != null ? cur < +m[2] : cur > +m[3];
      if (short) return sc - 50;
      sc += 4; // the build option, affordable: play the build
    }
  }
  const dark = T && T.branch === 'dark';
  if (LIGHT_WORDS.test(label)) sc += dark ? 0 : 3;
  if (DARK_WORDS.test(label)) sc += dark ? 3 : -1;
  return sc;
}
// GREEDY (CAPABLE_GREEDY=1, diagnosis-endgame 2026-10-15): Steve's Overtime
// is "a cost- but also an opportunity for the truly powerful". The default
// bot sits the day the seat is ready, so Overtime, the Network and THE HOSTS
// are never measured. Greedy waits while the run looks strong: Haven holds
// (5+ people, under 3 lost while waiting), the bearer is above 40% HP, and
// the tier is under the cap (CAPABLE_GREEDY_MAXTIER, default 4). It sits at
// once with the key, when
// the run weakens, or near the sim horizon (CAPABLE_GREEDY_LASTDAY, 145).
// CAPABLE_GREEDY_RECKLESS=1 drops the strength checks (waits to the cap or
// the horizon): the pure cost of Overtime. Off by default: the tuning
// dashboard measures the plain bot.
function greedyWaits(Game, pv) {
  if (process.env.CAPABLE_GREEDY !== '1') return false;
  if (pv.key) return false;
  const maxTier = parseInt(process.env.CAPABLE_GREEDY_MAXTIER || '4', 10);
  const lastDay = parseInt(process.env.CAPABLE_GREEDY_LASTDAY || '145', 10);
  if ((pv.overtime | 0) >= maxTier || day(Game) >= lastDay) return false;
  if (process.env.CAPABLE_GREEDY_RECKLESS === '1') return true; // measure the pure cost of waiting
  if ((pv.losses | 0) >= 3) return false;
  let roster = 0;
  try { roster = ((Game.state.village || {}).roster || []).length; } catch (e) { roster = 0; }
  if (roster < 5) return false;
  if (hpFrac(Game) < 0.4) return false;
  return true;
}
function tableRoad(Game, ctx) {
  try {
    const pg = Game.progState ? Game.progState() : {};
    if (!pg.tableDone && Game.tablePreview && Game.tableTakeSeat) {
      const pv = Game.tablePreview();
      if (pv) {
        ctx.capTablePreviewSeen = 1;
        if (pv.ready && greedyWaits(Game, pv)) { bump(ctx, 'capGreedyWaits'); ctx.capGreedyMaxTier = Math.max(ctx.capGreedyMaxTier | 0, pv.overtime | 0); }
        else if (pv.ready) {
          const r = Game.tableTakeSeat();
          if (r && r.ok) { bump(ctx, 'capSeatTaken'); ctx.capSeatDay = day(Game); ctx.capSeatKind = pv.seat; }
        }
      }
    }
    let n = 0, lastSig = null, stall = 0;
    for (;;) {
      if (Game.over || n >= 30) break;
      if (Game.tbfight && !Game.tbfight.over) break; // a trial fight: the driver plays it
      const tc = (Game.state.scholar || {}).tableChoices;
      if (!tc || !tc.options || !tc.options.length || !Game.chooseTableOption) break;
      const sig = tc.frame + '|' + tc.options.map(o => o.id).join(',');
      if (sig === lastSig && ++stall >= 2) break;
      lastSig = sig;
      let T = {};
      try { T = Game.tableState ? Game.tableState() : {}; } catch (e) { T = {}; }
      let best = null;
      for (const o of tc.options) { const sc = scoreTableOption(Game, o, T); if (!best || sc > best.sc) best = { o, sc }; }
      Game.chooseTableOption(best.o.id);
      n++;
      bump(ctx, 'capTableAnswers');
      if (best.o.id !== tc.options[0].id) bump(ctx, 'capTableNotFirst');
      if (String(best.o.id).indexOf('path:') === 0) ctx.capTablePath = best.o.id.slice(5);
    }
  } catch (e) { note(ctx, 'tableRoad: ' + e.message); }
}

// ---------- 4. HELD CONVERSATIONS ----------
function needScore(Game, vid) {
  let sc = 0;
  try { const c = Game.convoGet ? Game.convoGet(vid) : null; const w = c && c.want; if (w && w.id && !w.resolution) sc += 100; } catch (e) { /* no convo record yet */ }
  try { const m = Game.npcMood ? Game.npcMood(vid) : null; if (m === 'grieving' || m === 'scared') sc += 50; } catch (e) { /* mood unreadable */ }
  try { const t = ((Game.state.village || {}).trust || {})[vid]; sc += Math.max(0, 60 - (t == null ? 15 : t)); } catch (e) { /* no trust row */ }
  return sc + rnd();
}
function capableTalk(Game, ctx) {
  try {
    if (!Game.talkTo || !Game.convoTurn) return;
    if (Game.tbfight && !Game.tbfight.over) return;
    const vv = Game.state.village || {};
    const me = Game.villagerId;
    const alive = (vv.roster || []).filter(id => {
      if (!id || id === me) return false;
      try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; }
    });
    if (!alive.length) return;
    const ranked = alive.map(v => ({ v, sc: needScore(Game, v) })).sort((a, b) => b.sc - a.sc);
    for (const { v } of ranked.slice(0, 2)) {
      if (Game.over) break;
      const before = ctx.deepTurns || 0;
      withEnv(() => C.holdConversation(Game, ctx, v));
      bump(ctx, 'capConvos');
      if ((ctx.deepTurns || 0) > before) bump(ctx, 'capConvosHeld');
    }
  } catch (e) { note(ctx, 'capableTalk: ' + e.message); }
}

// ---------- 5. RELAY ----------
function relayRoad(Game, ctx) {
  try {
    if (Game.switchboardAvailable && Game.switchboardAvailable()) {
      const roster = ((Game.state.village || {}).roster || []).length;
      if (pantryKcal(Game) > 30000 && roster >= 6 && Game.claimRelay) {
        if (Game.claimRelay() === 'claimed') bump(ctx, 'capRelayClaimed');
      } else if (Game.switchboardCandidates && Game.appointSwitchboard) {
        const cands = Game.switchboardCandidates() || [];
        const sc = (c) => (c.corrupt ? -10 : 0) + (c.isTalker ? -3 : 0) + (c.isWeakest ? -4 : 0) + (c.work || 0) / 20 + rnd();
        const pick = cands.slice().sort((a, b) => sc(b) - sc(a))[0];
        if (pick && Game.appointSwitchboard(pick.id)) bump(ctx, 'capRelayAppointed');
      }
    }
    if (Game.relayHeldByBearer && Game.relayHeldByBearer()) {
      const pend = Game.pendingRelayScene ? Game.pendingRelayScene() : null;
      if (pend && Game.relayAnswer) {
        let chs = [];
        try { const sc = pend.resolved || (Game.relaySceneById ? Game.relaySceneById(pend.scene) : null); chs = (sc && sc.choices) || []; } catch (e) { chs = []; }
        if (chs.length) {
          const pick = chs.slice().sort((a, b) => ((b.lean || 0) + (b.ground || 0) + rnd()) - ((a.lean || 0) + (a.ground || 0) + rnd()))[0];
          if (Game.relayAnswer(pick.id) === 'answered') bump(ctx, 'capRelayAnswers');
        }
      } else if (Game.relayCommune && ctx._capCommuneDay !== day(Game)) {
        ctx._capCommuneDay = day(Game);
        Game.relayCommune();
        bump(ctx, 'capRelayCommunes');
        if (Game.relayReroute) { Game.relayReroute('honest'); bump(ctx, 'capRelayReroutes'); }
      }
    }
  } catch (e) { note(ctx, 'relayRoad: ' + e.message); }
}

// ---------- 6. DEED HUNT: the food deed + the wave bars ----------
// Diagnosis (2026-10-14, 8-seed sweep): capable runs reach national rank,
// stage 3, 6 contests, 4 crises — and stop at Arc III. The Table's seat bars
// still missing: foodDeeds (sentimentTaught && feastSurgeUsed) and distinct
// wave-3 monsters faced. sentimentTaught fires at integration 60 and the
// devotion channel arms the surge (prog.feastSurge) by ~day 20; leadfeast
// hosts armed feasts; but feastSurgeUsed only marks on a REAL combat use
// while FEASTED (a player strike that lands, or an ability) — and the
// player almost never fights (0–11 fights per 150 days). feastFightRoad's
// forage-and-hope patrol rarely meets anything.
//
// So, deliberately: while FEASTED and the buff is unused, walk to the
// nearest known world monster (weakest wave first) and start the fight
// (the phone's "Fight" cell action calls startCombat the same way). The
// fight is committed until a strike lands or HP < 50% (st.feastCommit).
// And when a wave's lesser-seat bar (4/4/3 distinct) is short and that
// wave is unlocked, engage a NOT-YET-FACED monster of that wave — the
// engine counts the engagement (progression.js: "fleeing still counts —
// you stood on the grid with it"), so the normal flee logic still guards
// the scholar. Guards: HP >= 70%, kcal >= 40% cap, one sortie per day part,
// at most HUNT_MAX_DIST nodes from where we stand. After a sortie the
// scholar walks home on the next quiet upkeep.
const HUNT_MAX_DIST = 4;
const SEAT_BARS = { 1: 4, 2: 4, 3: 3 }; // tableSeat lesser bars (table.js)
function feastPending(Game) {
  try {
    const s = Game.state.scholar || {};
    if (s.prog && s.prog.feastSurgeUsed) return false;
    if (!(Game.feastedActive && Game.feastedActive())) return false;
    return !((s.feastBuff || {}).used);
  } catch (e) { return false; }
}
function waveBarsShort(Game) {
  // waves whose lesser-seat bar is unmet and which are unlocked
  const out = {};
  try {
    const g = Game.deedGateReady();
    const uw = Game.unlockedWave ? Game.unlockedWave() : 1;
    const have = { 1: g.w1, 2: g.w2, 3: g.w3 };
    for (const w of [1, 2, 3]) if (w <= uw && (have[w] | 0) < SEAT_BARS[w]) out[w] = true;
  } catch (e) { /* no deed state yet */ }
  return out;
}
function huntTargets(Game, pred) {
  const faced = (() => { try { return Game.deedState().wavesFaced || {}; } catch (e) { return {}; } })();
  const px = Game.map.px, py = Game.map.py;
  const out = [];
  let wm = [];
  try { wm = Game.worldMonsters() || []; } catch (e) { wm = []; }
  for (const m of wm) {
    if (!m || !m.id || m.tx == null) continue;
    const md = ((Game.data || {}).monsters || []).find(d => d && d.id === m.id);
    if (!md) continue;
    const t = (() => { try { return Game.tileAt(m.tx, m.ty); } catch (e) { return null; } })();
    if (t && (t.type === 'haven' || t.isHaven)) continue;
    const dist = Math.abs(m.tx - px) + Math.abs(m.ty - py);
    if (dist > HUNT_MAX_DIST) continue;
    const w = md.wave || 1;
    if (md.id === 'gallowdeer' && process.env.CAPABLE_DEER_FLEE !== '0') continue; // a fight we'd leave (threatFlee)
    if (!pred({ m, md, w, faced: !!faced[m.id] })) continue;
    out.push({ m, w, dist, faced: !!faced[m.id] });
  }
  return out;
}
function deedHunt(Game, ctx) {
  if (process.env.CAPABLE_HUNT === '0') return; // A/B gate: hunt layer off
  try {
    if (Game.over || (Game.tbfight && !Game.tbfight.over)) return;
    if (Game.state.activeContest) return;
    const s = Game.state.scholar || {};
    const key = day(Game) + ':' + Game.dayPart;
    // walk home after a sortie (quiet upkeep, no goal left)
    const wantFeast = feastPending(Game);
    const short = waveBarsShort(Game);
    const wantWave = Object.keys(short).length > 0 && !!((Game.progState() || {}).sentimentTaught || day(Game) >= 30);
    if (!wantFeast && !wantWave) {
      if (ctx._capHuntAway && !ctx._capHuntAwayHome) { ctx._capHuntAwayHome = 1; C.walkTo(Game, 4, 4); ctx._capHuntAway = 0; ctx._capHuntAwayHome = 0; }
      return;
    }
    if (ctx._capHuntKey === key) return; // one sortie per day part
    ctx._capHuntKey = key;
    if (hpFrac(Game) < 0.7) return;
    const cap = Game.kcalCap ? Game.kcalCap() : 2000;
    if ((s.kcal || 0) < cap * 0.4) return;
    let cands = [];
    if (wantFeast) {
      cands = huntTargets(Game, (x) => x.w <= Math.max(1, Math.min(2, Game.unlockedWave ? Game.unlockedWave() : 1)));
      cands.sort((a, b) => (a.w - b.w) || (a.dist - b.dist));
    }
    let goal = wantFeast && cands.length ? 'feast' : null;
    if (!goal && wantWave) {
      cands = huntTargets(Game, (x) => short[x.w] && !x.faced);
      cands.sort((a, b) => (a.dist - b.dist) || (a.w - b.w));
      if (cands.length) goal = 'wave';
    }
    if (!goal) { bump(ctx, 'capHuntNoTarget'); return; }
    const tg = cands[0];
    bump(ctx, 'capHuntSorties');
    if (Game.map.px !== tg.m.tx || Game.map.py !== tg.m.ty) C.walkTo(Game, tg.m.tx, tg.m.ty);
    if (Game.tbfight && !Game.tbfight.over) { ctx._capHuntAway = 1; bump(ctx, 'capHuntAmbushed'); return; } // something found us first
    if (Game.map.px !== tg.m.tx || Game.map.py !== tg.m.ty) { bump(ctx, 'capHuntUnreached'); return; }
    const here = Game.playerMonster ? Game.playerMonster() : Game.monsterAt(Game.map.px, Game.map.py);
    if (!here) { bump(ctx, 'capHuntGone'); return; }
    ctx._capHuntAway = 1;
    ctx._capFeastCommit = goal === 'feast';
    // WALK CLOSER, THEN FIGHT — the phone's flow (app.js walkCloser +
    // the cell popup's "Fight", offered only within 1 square). A monster
    // with no grid position is not approached (startCombat would stack
    // everyone on one tile).
    if (here.mx == null || here.my == null) { bump(ctx, 'capHuntNoPos'); ctx._capFeastCommit = false; return; }
    const sx = () => (Game.state.scholar.mx != null ? Game.state.scholar.mx : 4), sy = () => (Game.state.scholar.my != null ? Game.state.scholar.my : 4);
    const near = () => Math.max(Math.abs(here.mx - sx()), Math.abs(here.my - sy())) <= 1;
    if (!near()) {
      let best = null, bd = 1e9;
      try {
        const detail = Game.genDetail(Game.map.px, Game.map.py);
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const nx = here.mx + dx, ny = here.my + dy;
          if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
          if (Game.cellProps(detail[ny][nx]).blocks) continue;
          const pth = Game.findPath(sx(), sy(), nx, ny);
          if (pth && pth.length && pth.length < bd) { bd = pth.length; best = [nx, ny]; }
        }
      } catch (e) { note(ctx, 'hunt approach: ' + e.message); }
      const path = best ? Game.beginPathWalk(best[0], best[1]) : null;
      for (const st of (path || [])) {
        if (Game.over || (Game.tbfight && !Game.tbfight.over)) break;
        if (!Game.pathStep(st[0], st[1])) break;
      }
    }
    if (Game.tbfight && !Game.tbfight.over) { bump(ctx, 'capHuntNoticed'); bump(ctx, goal === 'feast' ? 'capHuntFeastFights' : 'capHuntWaveFights'); return; } // it came to us
    if (!near()) { bump(ctx, 'capHuntUnreached'); ctx._capFeastCommit = false; return; }
    Game.startCombat(here.id);
    if (Game.tbfight && !Game.tbfight.over) {
      bump(ctx, goal === 'feast' ? 'capHuntFeastFights' : 'capHuntWaveFights');
      bumpMap(ctx, 'capHuntById', here.id);
    }
  } catch (e) { note(ctx, 'deedHunt: ' + e.message); }
}

// THE FEAST DRAW IS A CHOICE (death diagnosis 2026-10-15): the feast's smoke
// draws a scavenger to Haven's edge, and the phone offers "Face it" or "Let
// the watch drive it off". The harness used to face every pending encounter
// itself, so the bot never chose: 10 of 48 combat deaths on 16 seeds were
// feast-draw scavengers (wave-3/4 casts of 300-1,800 HP) faced at once.
// Called by the harness (policy.pending) before it faces a pending
// encounter. Same "outmatched" read as shouldFlee's first turn: face it
// when it's a fight, let the watch drive it off when it isn't. Declining
// spends no devotion (feastBuff.js driveOffFeastDraw), so the deed hunt can
// still find a fair fight. CAPABLE_DRAW_DECIDE=0 faces every draw (A/B).
function drawOutmatched(Game, mid) {
  const md = ((Game.data || {}).monsters || []).find(m => m && m.id === mid) || {};
  const s = Game.state.scholar || {};
  const pmax = (Game.maxHealth ? Game.maxHealth() : s.maxHealth) || 100;
  const hp = (s.health || 0) / Math.max(1, pmax);
  const hpTop = Array.isArray(md.hp) ? md.hp[1] : (md.hp || 0);
  const veteran = !!((s.feastDraw || {}).veteran);
  const total = hpTop * (veteran ? 1.5 : 1) * Math.max(1, md.pack || 1);
  const wave = md.wave || 1;
  return total > 2.5 * pmax || (wave >= 2 && hp < 0.7) || hp < 0.5;
}
function capablePending(Game, ctx) {
  try {
    if (process.env.CAPABLE_DRAW_DECIDE === '0') return false;
    if (!Game.pendingEncounter || !Game.feastDrawPending || !Game.driveOffFeastDraw) return false;
    const d = Game.feastDrawPending();
    if (!d || !d.monsterId) return false; // not a feast draw: the panel offers only "Face it"
    if (!drawOutmatched(Game, d.monsterId)) { bump(ctx, 'capDrawFaced'); return false; }
    const r = Game.driveOffFeastDraw();
    if (r && r.ok) { bump(ctx, 'capDrawDrivenOff'); return true; }
    return false;
  } catch (e) { note(ctx, 'capablePending: ' + e.message); return false; }
}

// TREAT LOCKJAW (death diagnosis 2026-10-15 follow-up): after the Haven
// escape fix, bearers who survived wounded fights died of lockjaw later
// (3 -> 15 on 32 seeds); the bot never treated it. The game's treatment
// (statusEffects.json lockjaw.cure; game.js useMedicine / treatDisease):
// antibiotics cure it, named or not; triage and field medicine cure it once
// it is DIAGNOSED (examineSick), otherwise they only ease it; herbal remedy
// eases. The symptoms show without a name ("Stiffening", the jaw), and the
// game says what helps ("Find real treatment (antibiotics, skilled wound
// care)"), so the bot acts on what a player sees. Once per day part.
// CAPABLE_TREAT_LOCKJAW=0 turns it off (A/B).
const LOCKJAW_CURES = ['triage', 'field_medicine', 'herbal_remedy'];
function treatLockjaw(Game, ctx) {
  if (process.env.CAPABLE_TREAT_LOCKJAW === '0') return;
  try {
    if (Game.over || !Game.hasStatus || !Game.hasStatus('scholar', 'lockjaw')) return;
    const key = day(Game) + ':' + Game.dayPart;
    if (ctx._capJawKey === key) return;
    ctx._capJawKey = key;
    bump(ctx, 'capLockjawSeen');
    const isDiag = () => { try { return !!Game.isDiagnosed('scholar', 'lockjaw'); } catch (e) { return false; } };
    if (!isDiag() && Game.canDiagnose && Game.canDiagnose() && Game.examineSick) { Game.examineSick(); bump(ctx, 'capLockjawExamined'); }
    const inv = (Game.state.scholar || {}).inventory || [];
    if (inv.some(i => i && i.medType === 'antibiotics' && (i.doses || 0) > 0) && Game.useMedicine) {
      Game.useMedicine('antibiotics'); bump(ctx, 'capLockjawPills');
    }
    for (const ab of LOCKJAW_CURES) {
      if (!Game.hasStatus('scholar', 'lockjaw')) break;
      if (!(Game.hasAbility && Game.hasAbility(ab)) || !Game.treatDisease) continue;
      Game.treatDisease(ab); bump(ctx, 'capLockjawTreated');
    }
    if (!Game.hasStatus('scholar', 'lockjaw')) bump(ctx, 'capLockjawCured');
  } catch (e) { note(ctx, 'treatLockjaw: ' + e.message); }
}

// CALL FOR HELP IN A RAID (death diagnosis 2026-10-15 follow-up): raids raise
// the aid crisis (havenGrowth.js havenRaidTick -> raiseAidCrisis, crisis.
// raiders) and the game says the four ways to call aloud, but the capable
// bot called 0 times. Once per raid crisis, when Haven has a linked village:
// an ability cry first (fast, honest, build-gated), else a runner (unless
// the road is hot), else the System relay (integration stage 2+). Never the
// signal fire: its smoke draws company and blocks fleeing, and fleeing is
// how the bot survives a raider it can't beat. Help then fights at the door
// blow by blow (comms.js aidFight). CAPABLE_AID_CALL=0 turns it off (A/B).
function raidCall(Game, ctx) {
  if (process.env.CAPABLE_AID_CALL === '0') return;
  try {
    const crisis = Game.aidCrisis ? Game.aidCrisis() : null;
    if (!crisis || !crisis.raiders || crisis.resolved || !Game.callForHelp) return;
    if ((crisis.calls || []).some(c => c && c.result !== 'died')) return; // already called (a dead runner: call again)
    const links = Game.villageLinks ? (Game.villageLinks('haven') || []) : [];
    if (!links.length) { if (!crisis._capNoLink) { crisis._capNoLink = 1; bump(ctx, 'capAidNoLink'); } return; }
    const n0 = (crisis.calls || []).length;
    const cries = Game.aidCryAbilities ? Game.aidCryAbilities() : [];
    let stage = 0;
    try { stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) { stage = 0; }
    let tier = null;
    if (cries.length) { tier = 'cry'; Game.callForHelp('cry', { abilityId: cries[0].id }); }
    else if (!(Game.aidRoadHot && Game.aidRoadHot())) { tier = 'runner'; Game.callForHelp('runner'); }
    else if (stage >= 2) { tier = 'system'; Game.callForHelp('system'); }
    const c2 = Game.aidCrisis ? Game.aidCrisis() : null;
    if (tier && c2 && (c2.calls || []).length > n0) { bump(ctx, 'capAidCalls'); bumpMap(ctx, 'capAidByTier', tier); }
  } catch (e) { note(ctx, 'raidCall: ' + e.message); }
}

// FINISH THE FIGHT BEFORE BED: a fight that starts during the daily round
// (a forage trip, the walk home after a flee, a hunt's return) used to sit
// live until the harness's next upkeep — and Game.sleep refuses mid-fight
// ("Not in the middle of a fight."), so the whole loop-day passed without a
// game day: 150 loop-days measured as 69–133 game days on the 8-seed sweep
// (competent: 152). A player finishes the fight; so does the bot. Same
// default as the harness driver: our fight hook, else strike the nearest.
function finishLiveFight(Game, ctx) {
  let guard = 0, still = 0, last = '';
  try {
    while (Game.tbfight && !Game.tbfight.over && !Game.over && guard++ < 300) {
      if (!Game.tbIsPlayerTurn()) { try { Game.tbAdvance(); } catch (e) { note(ctx, 'finish tbAdvance: ' + e.message); break; } if (!Game.tbfight || Game.tbfight.over || !Game.tbIsPlayerTurn()) break; }
      let handled = false;
      try { handled = capableFight(Game, ctx); } catch (e) { note(ctx, 'finish fight: ' + e.message); }
      if (!handled && Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
        const t = Game.tbfight.fighters.find(x => (x.kind === 'monster' || x.kind === 'hostile') && x.alive && !x.fled && (x.hp || 0) > 0);
        if (t) { try { Game.tbPlayerStrike(t.key); } catch (e) { note(ctx, 'finish strike: ' + e.message); } }
        endTurn(Game);
      }
      const f = Game.tbfight;
      const sig = f ? f.round + ':' + f.fighters.map(x => Math.round(x.hp || 0) + '@' + x.mx + ',' + x.my).join(';') : 'none';
      if (sig === last) { if (++still > 10) { bump(ctx, 'capFinishStalled'); break; } } else { still = 0; last = sig; }
    }
    if (guard > 1) bump(ctx, 'capFightsFinishedAtDusk');
  } catch (e) { note(ctx, 'finishLiveFight: ' + e.message); }
}

// Daily god actions use the same public entry as a tap on the action bar.
function godDay(Game, ctx) {
  try {
    if (!Game.godActivatables || Game.inCombat()) return;
    for (const a of Game.godActivatables()) {
      if (!a.available || a.combat) continue;
      if (Game.useAbility('god', a.actionId)) bump(ctx, 'capGodDayUses');
      if (Game.over || Game.inCombat()) break;
    }
  } catch (e) { note(ctx, 'godDay: ' + e.message); }
}

// ---------- the policy ----------
const capable = Object.assign({}, BASE, {
  id: 'capable',
  desc: 'leadfeast base + real fleeing, combat abilities + signature verbs, scored choices (offers/contests/table/relic), held conversations by need, relay',
  setup(Game, ctx) {
    if (BASE.setup) withEnv(() => BASE.setup(Game, ctx));
  },
  upkeep(Game, ctx) {
    chooseOffers(Game, ctx); // before competent's ch[0] pick in daily
    raidCall(Game, ctx); // raids land in the night: call at dawn
    treatLockjaw(Game, ctx);
    withEnv(() => BASE.upkeep(Game, ctx));
    deedHunt(Game, ctx); // in upkeep: the harness drives the fight right after
  },
  daily(Game, ctx) {
    chooseOffers(Game, ctx);
    answerRelic(Game, ctx);
    wearKeepsakes(Game, ctx);
    godDay(Game, ctx);
    raidCall(Game, ctx);
    treatLockjaw(Game, ctx);
    withEnv(() => BASE.daily(Game, ctx));
    capableTalk(Game, ctx);
    relayRoad(Game, ctx);
    tableRoad(Game, ctx);
    finishLiveFight(Game, ctx);
  },
  fight(Game, ctx) {
    try { return capableFight(Game, ctx); } catch (e) { note(ctx, 'capableFight: ' + e.message); return false; }
  },
  contest: capableContest,
  pending: capablePending,
});

// capableSummary(ctx): the behaviour counters, flat, for reports/tests.
function capableSummary(ctx) {
  const k = ['capFights', 'capFleeDecisions', 'capFleeSteps', 'capFleePushes', 'capFleeExits', 'capFleeNodeExits', 'capFleeChased', 'capFleeHeld',
    'capAbilityUses', 'capAbilityRefused', 'capAbilityHungerSkips', 'capSigUses', 'capOffersChosen', 'capOffersNotFirst', 'capRelicChosen',
    'capContestChoices', 'capContestNotFirst', 'capContestRefusals', 'capTableAnswers', 'capTableNotFirst', 'capSeatTaken', 'capGreedyWaits', 'capGreedyMaxTier',
    'capConvos', 'capConvosHeld', 'deepTurns', 'capFleeFromHaven', 'capFleeDoorExits', 'capDrawFaced', 'capDrawDrivenOff', 'capContestLethalAvoided', 'capBeamFlee', 'capDeerFlee', 'capLockjawSeen', 'capLockjawExamined', 'capLockjawPills', 'capLockjawTreated', 'capLockjawCured', 'capAidCalls', 'capAidNoLink', 'capHuntSorties', 'capHuntFeastFights', 'capHuntWaveFights', 'capHuntNoTarget', 'capHuntUnreached', 'capHuntGone', 'capRelayClaimed', 'capRelayAppointed', 'capRelayAnswers', 'capRelayCommunes', 'capKeepsakesWorn', 'capGodDayUses'];
  const out = {};
  for (const x of k) out[x] = (ctx && ctx[x]) || 0;
  return out;
}

module.exports = { capable, capableSummary, threatFlee, treatLockjaw, raidCall, godDay, havenEscape, havenExitDir, drawOutmatched, wearKeepsakes, scoreOffer, scoreTableOption, greedyWaits, stepToward, sigButtons, ACTION_PLAN, SIG_PREF };
