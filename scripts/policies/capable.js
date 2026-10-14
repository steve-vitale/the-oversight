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
//      Holds at the haven node and in sealed fights (the engine says no exit).
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
const ENV = { COMPETENT_DIRECTIONAL_FLEE: '1', FEASTSCALE_R13: '1' };

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
    ctx._cap = { f, turn: 0, used: {}, refused: {}, sig: {}, fleeing: false, hpHist: [], escapeTried: false };
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
  const pmax = p.maxHp || 100;
  const hp = (p.hp || 0) / Math.max(1, pmax);
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
// One flee turn. Returns true when the turn is consumed.
function realFlee(Game, ctx, st, f, p) {
  let dir = null;
  try { dir = C.chooseFleeDir(Game, Game.map.px, Game.map.py); } catch (e) { note(ctx, 'chooseFleeDir: ' + e.message); }
  if (!dir) { bump(ctx, 'capFleeHeld'); st.fleeing = false; return false; } // at haven: hold ground
  if (!st.fleeing) { st.fleeing = true; bump(ctx, 'capFleeDecisions'); bumpMap(ctx, 'capFleeWhy', st.why || '?'); }
  let gmax = 8;
  try { gmax = Game.tbGridMax ? Game.tbGridMax() : 8; } catch (e) { gmax = 8; } // titan fights are 12x12
  const tx = dir.dx < 0 ? 0 : dir.dx > 0 ? gmax : p.mx;
  const ty = dir.dy < 0 ? 0 : dir.dy > 0 ? gmax : p.my;
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
  'animal_ken.calm_beast': (I) => { const m = (I.f.fighters || []).find(x => x && x.alive && !x.fled && x.kind !== 'monster' && x.kind !== 'player' && x.kind !== 'villager' && x.key !== 'p'); return m ? { s: 6, t: m.key } : null; },
};

// Before running from a fight we can't win: one try at a verb that ends
// it (talk it down, calm it) or stalls the pursuers (stun, blind, hesitate).
const ESCAPE_ACTIONS = {
  'peacemaker.walk_in': 1, 'animal_ken.calm_beast': 1, 'scream_cheese.scream': 1, 'war_cry.bellow': 1,
  'pocket_sand.throw_sand': 1, 'fear_aura.loom': 1, 'intimidating_presence.stare_down': 1,
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
  const paths = def.paths || [];
  for (const h of heldIds) {
    const hd = abilityDef(Game, h);
    for (const pth of ((hd && hd.paths) || [])) if (paths.indexOf(pth) >= 0) sc += 3;
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
    let best = null;
    for (const o of ch) { const sc = scoreOffer(Game, o, held); if (!best || sc > best.sc) best = { o, sc }; }
    Game.chooseAbility(best.o.id);
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
      let best = -Infinity;
      for (let i = 0; i < choices.length; i++) {
        const sc = contestReward(choices[i]) - harmScore(choices[i]) * w + rnd() * 2;
        if (sc > best) { best = sc; pick = i; }
      }
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
  const dark = T && T.branch === 'dark';
  if (LIGHT_WORDS.test(label)) sc += dark ? 0 : 3;
  if (DARK_WORDS.test(label)) sc += dark ? 3 : -1;
  return sc;
}
function tableRoad(Game, ctx) {
  try {
    const pg = Game.progState ? Game.progState() : {};
    if (!pg.tableDone && Game.tablePreview && Game.tableTakeSeat) {
      const pv = Game.tablePreview();
      if (pv) {
        ctx.capTablePreviewSeen = 1;
        if (pv.ready) {
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
      C.holdConversation(Game, ctx, v);
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

// ---------- the policy ----------
const capable = Object.assign({}, BASE, {
  id: 'capable',
  desc: 'leadfeast base + real fleeing, combat abilities + signature verbs, scored choices (offers/contests/table/relic), held conversations by need, relay',
  setup(Game, ctx) {
    if (BASE.setup) withEnv(() => BASE.setup(Game, ctx));
  },
  upkeep(Game, ctx) {
    chooseOffers(Game, ctx); // before competent's ch[0] pick in daily
    withEnv(() => BASE.upkeep(Game, ctx));
  },
  daily(Game, ctx) {
    chooseOffers(Game, ctx);
    answerRelic(Game, ctx);
    withEnv(() => BASE.daily(Game, ctx));
    capableTalk(Game, ctx);
    relayRoad(Game, ctx);
    tableRoad(Game, ctx);
  },
  fight(Game, ctx) {
    try { return capableFight(Game, ctx); } catch (e) { note(ctx, 'capableFight: ' + e.message); return false; }
  },
  contest: capableContest,
});

// capableSummary(ctx): the behaviour counters, flat, for reports/tests.
function capableSummary(ctx) {
  const k = ['capFights', 'capFleeDecisions', 'capFleeSteps', 'capFleePushes', 'capFleeExits', 'capFleeNodeExits', 'capFleeChased', 'capFleeHeld',
    'capAbilityUses', 'capAbilityRefused', 'capAbilityHungerSkips', 'capSigUses', 'capOffersChosen', 'capOffersNotFirst', 'capRelicChosen',
    'capContestChoices', 'capContestNotFirst', 'capContestRefusals', 'capTableAnswers', 'capTableNotFirst', 'capSeatTaken',
    'capConvos', 'capConvosHeld', 'deepTurns', 'capRelayClaimed', 'capRelayAppointed', 'capRelayAnswers', 'capRelayCommunes'];
  const out = {};
  for (const x of k) out[x] = (ctx && ctx[x]) || 0;
  return out;
}

module.exports = { capable, capableSummary, scoreOffer, scoreTableOption, stepToward, sigButtons, ACTION_PLAN, SIG_PREF };
