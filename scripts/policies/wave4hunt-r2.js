// wave4hunt-r2 — deliberate wave-4 engagement manufacture (hunt-side lever)
// (flesh-out loop, 2026-10-21, run fleshout-20261021T1215Z, arm
// sim-wave4hunt-r2, axis scale-onramp; named next of the sim-twovets-r2 kill
// 49c939c23).
//
// LINEAGE: the twovets-r2 verdict — the no-finish discipline HELD (0 scholar
// wave-4 kills in 16 armed runs) but the OPPORTUNITY never materialized
// (1 villager veteran kill in 16 runs: Nikos vs THE EATER d75). The binding
// constraint is opportunity, not discipline. This arm re-derives the twovets
// no-finish discipline (T3/T4 + KILL-LEAK FIX, shape borrowed not the file —
// twovets.js was deleted zero-trace per kill protocol) and adds the missing
// piece the twovets metric review named: deliberate WAVE-4 TARGETING. The
// scholar goes hunting for wave-4 with 2 staged companions instead of only
// fighting when it arrives.
//
// TWO LEGS (policy-side only, zero src/js):
// 1. ENGAGEMENT TARGETING (upkeep, after the base upkeep — the deedHunt
//    position in capable.js): once wave-4 is unlocked or wave-4 omens are
//    active, and the w5 veterans bar is unmet, the scholar deliberately
//    walks toward the nearest live non-titan wave-4 world monster (within
//    4 tiles — the deedHunt radius) and starts the fight honestly (walk
//    closer + the phone's Fight flow via Game.startCombat). Titans are
//    EXCLUDED (backlog #749: the Herald refuses solo TB entry 163/168 —
//    its canon is muster-only, the engine refuses the fight, so hunting it
//    is a wasted day; the herald channel is a different mechanism).
// 2. NO-FINISH DISCIPLINE (fight hook, scholar turns in wave-4 fights): the
//    scholar softens (strikes the weakest live wave-4 only above 50%
//    maxHp) but NEVER lands the killing blow — re-derived twovets T3/T4:
//    yield at/below 30% (bounded: scholar hp>=50%, round>=2, <=8 yield
//    turns/fight, 2-turn stall guard -> breakoff, never finish); chaff/hold
//    in the (30%,50%] band; breakoff on stall or hurt companion; KILL-LEAK
//    FIX — breakoff-failure delegations to the inner fight happen ONLY when
//    every live wave-4 monster is above 50% maxHp, so the base policy can
//    never be handed the killing blow.
//
// Env gate WAVE4HUNT_R2=1 opts IN (default OFF). The layer additionally
// requires the VGEAR=1 substrate (the armory-drive + fighter-staging legs
// are the staging this hunt relies on). Gate off in any way = pure
// delegation: zero writes, zero RNG draws — byte-identical to the wrapped
// stack (the proof test's E1/E1c det-gates pin that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 roster + bands,
// the readiness gate, VILLAGER XP LAW — villager kills score the ledger
// exactly like the player's).
'use strict';
const VCE = require('./vgearconfirm');

function w4hOn() { return process.env.WAVE4HUNT_R2 === '1'; }
function vgearOn() { return process.env.VGEAR === '1'; }
// The layer engages only on its own gate AND its substrate (the vgear
// staging legs the hunt relies on). Composition honesty: W4H=1 without
// VGEAR is byte-identical to the seat stack (E1c).
function layerLive() { return w4hOn() && vgearOn(); }
// R1 RED escape (test only): disable the no-finish apparatus (hunt leg +
// fight discipline) so the regression seed measures the bare VGEAR stack —
// proving the test detects scholar wave-4 kills when the discipline is off.
function noFinishOff() { return process.env.W4H_TEST_NOFINISH_OFF === '1'; }

function normBase(base) {
  const b = String(base || '').toLowerCase();
  if (b === 'lead' || b === 'leadfeast') return 'leadfeast';
  if (b === 'belong' || b === 'belongfeast') return 'belongfeast';
  throw new Error('wave4hunt-r2: unknown base ' + base);
}

// ---------- reads (re-derived shapes, self-contained for the kill protocol) ----------
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function hpFracOf(x) {
  try { return (x.hp || 0) / Math.max(1, x.maxHp || x.hp || 1); } catch (e) { return 1; }
}
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
function scholarHpFrac(Game) {
  try {
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    if (p) return hpFracOf(p);
    const s = (Game.state || {}).scholar || {};
    const maxHp = Game.maxHealth ? Game.maxHealth() : 100;
    return (s.hp || s.health || 100) / Math.max(1, maxHp);
  } catch (e) { return 1; }
}
// Wave-4 is open for hunting: unlocked, or wave-4 omens active (the brief's
// clause — the herald omen requires wave>=4, so this is defensive).
function wave4Open(Game) {
  try { if (Game.unlockedWave && Game.unlockedWave() >= 4) return true; } catch (e) {}
  try {
    const om = ((Game.state || {}).titans || {}).omens || {};
    if (Object.keys(om).length > 0) return true;
  } catch (e) {}
  return false;
}
// The w5 veterans bar (standing.js): 2 living killers with wave-4+ kills.
// The hunt stands down once met — the arm's question is answered.
function veteransBarMet(Game) {
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
    return ((r && r.veterans) | 0) >= (((r && r.demand) || {}).veterans || 2);
  } catch (e) { return false; }
}
function partySize(Game) {
  try { return ((Game.partyMembers ? Game.partyMembers() : []) || []).length; } catch (e) { return 0; }
}
// Live wave-4 monsters in the scholar's TB fight (titan class excluded).
function liveWave4(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    return (f.fighters || []).filter(x => x && x.kind === 'monster' &&
      (x.hp || 0) > 0 && !x.fled && beastWaveOf(Game, beastMidOf(x)) === 4 &&
      !(Game.isTitan && Game.isTitan(beastMidOf(x))));
  } catch (e) { return []; }
}
function liveOthers(Game, exclude) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    return (f.fighters || []).filter(x => x && x.kind === 'monster' &&
      (x.hp || 0) > 0 && !x.fled && x !== exclude);
  } catch (e) { return []; }
}
// Party companions engaged in the scholar's TB fight (the villagergear
// engagedCompanions shape).
function engagedCompanions(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return [];
    const party = (Game.partyMembers ? Game.partyMembers() : []) || [];
    return (f.fighters || []).filter(x => x && x.alive && !x.fled &&
      (x.kind === 'villager' || x.kind === 'ally') &&
      x.villagerId && party.includes(x.villagerId));
  } catch (e) { return []; }
}
// Honest disengage: walk to the nearest x-edge, then push through the
// barrier via the real tbBarrierExit verb (vetrel/villagergear miniature).
function breakOffDisengage(Game) {
  try {
    const p0 = Game.tbFighter('p');
    if (!p0) return false;
    const px0 = p0.mx != null ? p0.mx : 4, py0 = p0.my != null ? p0.my : 4;
    const onEdge = (px0 === 0 || px0 === 8 || py0 === 0 || py0 === 8);
    if (onEdge) {
      const ddx = px0 === 0 ? -1 : px0 === 8 ? 1 : 0;
      const ddy = (px0 === 0 || px0 === 8) ? 0 : (py0 === 0 ? -1 : 1);
      Game.tbBarrierExit(ddx, ddy);
    } else {
      const tx = px0 <= 4 ? 0 : 8;
      Game.tbPlayerMove(tx, py0);
    }
    if (!Game.tbfight || Game.tbfight.over) return true;
    const p1 = Game.tbFighter('p');
    if (p1 && p1.fled) return true;
    const moved = p1 && (p1.mx !== px0 || p1.my !== py0);
    if (!moved) return false; // no-op: don't stand still calling it a retreat
    if (p1) { p1.moveLeft = 0; p1.acted = true; }
    Game.tbAfterPlayerAction();
    return true;
  } catch (e) { return false; }
}

// ---------- leg 1: engagement targeting ----------
// Candidate wave-4 world monsters: live, non-titan, non-haven tile, within
// 4 tiles (the deedHunt radius). Sorted nearest-first (id tie-break for
// determinism). The titan class is excluded by design (backlog #749).
function wave4Targets(Game) {
  const out = [];
  try {
    const px = Game.map.px, py = Game.map.py;
    const wm = (Game.worldMonsters ? Game.worldMonsters() : []) || [];
    for (const m of wm) {
      if (!m || m.id == null || m.tx == null || m.ty == null) continue;
      const mid = beastMidOf(m);
      if (beastWaveOf(Game, mid) !== 4) continue;
      try { if (Game.isTitan && Game.isTitan(mid)) continue; } catch (e) {}
      let t = null;
      try { t = Game.tileAt ? Game.tileAt(m.tx, m.ty) : null; } catch (e) {}
      if (t && (t.type === 'haven' || t.isHaven)) continue;
      const dist = Math.abs(m.tx - px) + Math.abs(m.ty - py);
      if (dist > 4) continue;
      out.push({ mid, tx: m.tx, ty: m.ty, dist });
    }
  } catch (e) {}
  out.sort((a, b) => (a.dist - b.dist) || (a.mid < b.mid ? -1 : a.mid > b.mid ? 1 : 0));
  return out;
}
// Hop-by-hop honest walk toward (hx,hy) (the competent.js walkTo shape —
// travelTargets only reaches d<=3, so walk it like a player would).
function walkTo(Game, hx, hy) {
  try {
    let guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 && !Game.over && !Game.tbfight) {
      let best = null, bd = 1e9;
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - hx) + Math.abs(tt.y - hy);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      const px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) break; // refused: stay put
    }
  } catch (e) {}
}
// WALK CLOSER, THEN FIGHT — the phone's flow (capable.js deedHunt's shape:
// walkCloser + the cell popup's "Fight", offered only within 1 square).
function approachAndFight(Game, ctx, here) {
  try {
    const sx = () => (Game.state.scholar.mx != null ? Game.state.scholar.mx : 4);
    const sy = () => (Game.state.scholar.my != null ? Game.state.scholar.my : 4);
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
      } catch (e) { ctx.w4hApproachError = (ctx.w4hApproachError | 0) + 1; }
      const path = best ? Game.beginPathWalk(best[0], best[1]) : null;
      for (const st of (path || [])) {
        if (Game.over || (Game.tbfight && !Game.tbfight.over)) break;
        if (!Game.pathStep(st[0], st[1])) break;
      }
    }
    if (Game.tbfight && !Game.tbfight.over) { ctx.w4hNoticed = (ctx.w4hNoticed | 0) + 1; return; } // it came to us
    if (!near()) { ctx.w4hUnreached2 = (ctx.w4hUnreached2 | 0) + 1; return; }
    Game.startCombat(here.id);
    if (Game.tbfight && !Game.tbfight.over) ctx.w4hFights = (ctx.w4hFights | 0) + 1;
    else ctx.w4hFightRefused = (ctx.w4hFightRefused | 0) + 1;
  } catch (e) { ctx.w4hFightError = (ctx.w4hFightError | 0) + 1; }
}

function wave4HuntLeg(Game, ctx) {
  if (!layerLive()) return; // gate off or substrate off: pure silence
  if (noFinishOff()) return; // R1 RED escape: the no-finish apparatus is
  // entirely off (hunt + discipline) so the regression test measures the
  // bare VGEAR stack — the hunt leg would otherwise confound the kill
  // census by redirecting the scholar.
  try {
    if (Game.over) return;
    const f = Game.tbfight;
    if (f && !f.over) return; // the harness drives live fights right after upkeep
    if (Game.state.activeContest) return; // contests are unavoidable — never preempt
    if (!wave4Open(Game)) return; // the door isn't open — nothing to hunt
    if (veteransBarMet(Game)) return; // the arm's question is answered — stand down
    const s = (Game.state || {}).scholar || {};
    if (s.exiled) return; // exile days belong to the courtship machinery
    const key = gday(Game) + ':' + Game.dayPart;
    if (ctx._w4hSortieKey === key) return; // one sortie per day part
    // Survival gates — never hunt dying or starving (the guardrail-conscious line).
    if (scholarHpFrac(Game) < 0.6) { ctx.w4hSkippedHurt = (ctx.w4hSkippedHurt | 0) + 1; return; }
    const cap = (typeof Game.kcalCap === 'function' ? Game.kcalCap() : 2400) || 2400;
    if ((s.kcal || 0) < cap * 0.4) { ctx.w4hSkippedHungry = (ctx.w4hSkippedHungry | 0) + 1; return; }
    // The kill channel: the hunt goes out with 2 staged companions (the
    // brief's line — the vgear staging leg's cap). Fewer than 2 and the
    // scholar can't finish what they start (the no-finish discipline), so
    // the hunt stays home.
    const ps = partySize(Game);
    if (ps < 2) { ctx.w4hSkippedParty = (ctx.w4hSkippedParty | 0) + 1; return; }
    const tgts = wave4Targets(Game);
    if (!tgts.length) { ctx.w4hNoTarget = (ctx.w4hNoTarget | 0) + 1; return; }
    ctx._w4hSortieKey = key;
    const tg = tgts[0];
    ctx.w4hSorties = (ctx.w4hSorties | 0) + 1;
    ctx.w4hSortieParty = ps;
    ctx.w4hSortieMid = tg.mid;
    walkTo(Game, tg.tx, tg.ty);
    if (Game.over || (Game.tbfight && !Game.tbfight.over)) { ctx.w4hAmbushed = (ctx.w4hAmbushed | 0) + 1; return; }
    if (Game.map.px !== tg.tx || Game.map.py !== tg.ty) { ctx.w4hUnreached = (ctx.w4hUnreached | 0) + 1; return; }
    const here = (Game.playerMonster ? Game.playerMonster() : null) ||
      (Game.monsterAt ? Game.monsterAt(Game.map.px, Game.map.py) : null);
    if (!here) { ctx.w4hGone = (ctx.w4hGone | 0) + 1; return; }
    const mid = beastMidOf(here);
    if (beastWaveOf(Game, mid) !== 4 || (Game.isTitan && Game.isTitan(mid))) {
      ctx.w4hWrongBeast = (ctx.w4hWrongBeast | 0) + 1; return;
    }
    if (here.mx == null || here.my == null) { ctx.w4hNoPos = (ctx.w4hNoPos | 0) + 1; return; }
    approachAndFight(Game, ctx, here);
  } catch (e) { ctx.w4hLegError = (ctx.w4hLegError | 0) + 1; }
}

// Strike then end turn (the competent.js fight-hook shape): tbPlayerStrike
// leaves moveLeft > 0, so the turn never auto-advances — without the
// explicit end the harness spins on "Already acted" until its 200 guard.
// tbPlayerWait() advances internally, so it must NOT be followed by this.
function strikeAndEndTurn(Game, key) {
  try { Game.tbPlayerStrike(key); } catch (e) {}
  try {
    const q = Game.tbFighter('p');
    if (q) { q.moveLeft = 0; q.acted = true; }
    Game.tbAfterPlayerAction();
  } catch (e) {}
}

// ---------- leg 2: no-finish discipline (re-derived twovets T3/T4) ----------
// The scholar softens (strikes the weakest live wave-4 only above 50%
// maxHp) but NEVER lands the killing blow. The wrapper strikes directly via
// Game.tbPlayerStrike — never delegates the strike — so the inner policy
// can't finish what the discipline forbids. KILL-LEAK FIX: breakoff-failure
// delegations to the inner fight happen ONLY when every live wave-4 monster
// is above 50% maxHp.
function w4hFightTurn(Game, ctx, base) {
  const f = Game.tbfight;
  const w4 = liveWave4(Game);
  let tgt = w4[0], tf = hpFracOf(w4[0]);
  for (const m of w4) { const fr = hpFracOf(m); if (fr < tf) { tf = fr; tgt = m; } }
  const p = Game.tbFighter('p');
  const sFrac = p ? hpFracOf(p) : 1;
  const round = (f && f.round) || 1;
  const comps = engagedCompanions(Game);
  const hurtComp = comps.find(c => hpFracOf(c) < 0.40);
  let ys = ctx._w4hYield;
  if (!ys || ys.fight !== f) ys = ctx._w4hYield = { fight: f, turns: 0, lastHp: null, stall: 0 };

  // T4 companion survival: a hurt companion ends the commitment — unless the
  // beast is near death, when the honest end is the fastest end (keep
  // yielding for the companions to close; the scholar never strikes it).
  if (hurtComp && tf > 0.20) {
    ctx.w4hBreakoffs = (ctx.w4hBreakoffs | 0) + 1;
    if (breakOffDisengage(Game)) return true;
    // Breakoff failed — fall through to the main logic; the KILL-LEAK FIX
    // governs any delegation below.
  }

  // T1/T4 yield: weakest live wave-4 at/below 30% — the scholar holds, never
  // finishes. Bounded: scholar hp>=50%, round>=2, <=8 yield turns/fight,
  // stall guard (2 consecutive yield turns with no damage -> abandon).
  if (tf <= 0.30) {
    const stalled = (ys.lastHp != null && (tgt.hp || 0) >= ys.lastHp) ? ys.stall + 1 : 0;
    if (sFrac >= 0.5 && round >= 2 && ys.turns < 8 && stalled < 2) {
      ys.turns++; ys.stall = stalled; ys.lastHp = tgt.hp || 0;
      ctx.w4hYields = (ctx.w4hYields | 0) + 1;
      Game.tbPlayerWait(); // the honest hold — advances the turn internally
      return true;
    }
    ys.lastHp = tgt.hp || 0;
    if (round < 2) { // first round: hold for the companions, don't abandon yet
      Game.tbPlayerWait(); ctx.w4hHolds = (ctx.w4hHolds | 0) + 1; return true;
    }
    // Yield window closed or stalled: breakoff (abandon, never finish).
    ctx.w4hBreakoffs = (ctx.w4hBreakoffs | 0) + 1;
    if (breakOffDisengage(Game)) return true;
    // KILL-LEAK FIX: breakoff-failure delegation only when EVERY live
    // wave-4 is above 50% — tgt is at/below 30%, so this branch always
    // holds. The base policy is never handed the killing blow.
    Game.tbPlayerWait(); ctx.w4hHolds = (ctx.w4hHolds | 0) + 1; return true;
  }

  // T3 band (30%,50%]: the scholar never strikes a wave-4 at/below half —
  // chaff first (strongest other live monster), else hold.
  if (tf <= 0.50) {
    const others = liveOthers(Game, tgt);
    if (sFrac >= 0.5 && others.length) {
      let o = others[0];
      for (const m of others) if ((m.hp || 0) > (o.hp || 0)) o = m;
      strikeAndEndTurn(Game, o.key);
      ctx.w4hChaffStrikes = (ctx.w4hChaffStrikes | 0) + 1;
      return true;
    }
    Game.tbPlayerWait(); ctx.w4hHolds = (ctx.w4hHolds | 0) + 1; return true;
  }

  // T3 soften: weakest live wave-4 above 50% — strike it DIRECTLY (never
  // delegate the strike).
  if (sFrac >= 0.5) {
    strikeAndEndTurn(Game, tgt.key);
    ctx.w4hSoftStrikes = (ctx.w4hSoftStrikes | 0) + 1;
    return true;
  }
  // Scholar hurt: hold if any live wave-4 at/below half; else the KILL-LEAK
  // FIX permits delegating to the inner fight (every wave-4 above 50% — a
  // strike can't land the killing blow from there).
  if (w4.some(m => hpFracOf(m) <= 0.50)) {
    Game.tbPlayerWait(); ctx.w4hHolds = (ctx.w4hHolds | 0) + 1; return true;
  }
  ctx.w4hDelegates = (ctx.w4hDelegates | 0) + 1;
  return base.fight(Game, ctx);
}

// ---------- composition ----------
function withWave4Hunt(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    upkeep(Game, ctx) {
      if (!layerLive()) return base.upkeep(Game, ctx); // gate off: pure delegation
      base.upkeep(Game, ctx); // the survival brain runs FIRST and fully — never preempted
      wave4HuntLeg(Game, ctx); // leg 1 (additive)
    },
    daily(Game, ctx) {
      return base.daily(Game, ctx); // the vgear legs (armory + staging) run inside
    },
    fight(Game, ctx) {
      if (!layerLive()) return base.fight(Game, ctx); // gate off: pure delegation
      try {
        if (noFinishOff()) return base.fight(Game, ctx); // R1 RED escape (test only)
        if (!(Game.tbIsPlayerTurn && Game.tbIsPlayerTurn())) return base.fight(Game, ctx);
        const w4 = liveWave4(Game);
        if (!w4.length) return base.fight(Game, ctx); // non-wave-4 fights: untouched
        const f = Game.tbfight;
        if (ctx._w4hFightObj !== f) {
          ctx._w4hFightObj = f;
          ctx.w4hW4Fights = (ctx.w4hW4Fights | 0) + 1;
          ctx._w4hYield = null;
        }
        return w4hFightTurn(Game, ctx, base);
      } catch (e) {
        ctx.w4hFightError = (ctx.w4hFightError | 0) + 1;
        return base.fight(Game, ctx);
      }
    },
  });
}

function armedFor(base) {
  const b = normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  const inner = VCE.armedFor(b); // the VGEAR=1 stack
  return withWave4Hunt(inner,
    `${tag}-wave4hunt-r2`,
    `${b} + win-side layers + seatdrive (SEATDRIVE=1) + VILLAGERGEAR (VGEAR=1) + WAVE4HUNT-R2: deliberate wave-4 engagement manufacture (hunt-side, 2 staged companions) + no-finish discipline`);
}

module.exports = {
  w4hOn, vgearOn, layerLive, noFinishOff, normBase,
  wave4Open, veteransBarMet, partySize, wave4Targets,
  liveWave4, liveOthers, engagedCompanions, breakOffDisengage,
  withWave4Hunt, armedFor,
};
