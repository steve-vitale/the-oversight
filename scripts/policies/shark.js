// policies/shark.js — SHARK: the degenerate-optimal win maximizer.
//
// MEASUREMENT PROBE, not shipped AI and not a game tweak. This file is a
// sim-side measurement instrument only (roguelike-celebration audit Talk 1,
// Kingsford/MCTS: "no optimizer exists, so reward-shaping has no adversary").
// It exists so reward-shaping HAS an adversary: a policy that maximizes the
// `won` metric of the 23-metric balance contract with zero regard for fun.
// Its wins are read INVERTED: shark >= competent on identical seeds means
// the metric/lever it exploited is DEGENERATE, never that the game should be
// tuned harder. Per Steve 2026-10-15, win-rate movement is investigation, not
// regression — the shark's wins must NEVER tune the game harder or declare
// regressions. Never add it to the panel baseline; never edit the metric
// contract (contract changes are Steve's call).
//
// Base: winseek (Object.assign), NOT competent directly — the shark needs
// winseek's full 6-road table-pursuit machinery (deed bars, contest road,
// scale courtship, crisis/sentiment/feast/integration roads, table road).
// Reimplementing it would duplicate ~900 lines and drift. The shark's
// identity is its degenerate DELTA on top of that pursuit:
//
//  D1. TOP-UP OR NOTHING. Feastburn is the known load-bearing win lever
//      (drivenofeast proved the FEASTED surge is load-bearing; feastdiscipline
//      went GO). The shark pre-loads to >=92% kcal cap BEFORE any voluntary
//      exposure, and patrols never below 70%. Fights that FIND the shark
//      (ambushes, contest bouts) can start untopped — the topped/untopped
//      diagnostic counts every fight entry honestly, so the voluntary rate
//      is read off patrols, not the raw fraction.
//  D2. MINIMUM EXPOSURE. winseek patrols 3x/week on cadence; the shark
//      patrols on NEED only (an unlocked wave's deed bar unfilled, or the
//      FEASTED buff live-and-unused) — every fight is death risk, so fights
//      are gate units and nothing more. Drain guard at the EXILE EDGE
//      (12000) instead of winseek's 3000: the freeloader-exile lever
//      (exile observed ~20k takes / 0 gives, day 17) is probed, not obeyed.
//      If the village exiles the shark, the endReason records it — data.
//  D3. COMMONS SKIMMING. Eat to cap at every upkeep even when the village is
//      hungry; never donate surplus; keep contributeRoad's anti-exile floor
//      (a dead village is a lost run — the shark keeps its resource base
//      alive, nothing more). End-of-run net drain (takes - gives) is the
//      signature.
//  D4. CONTEST EV. winseek always participates (fair/fun). The shark refuses
//      when the contests-survived deed (>=3) is filled AND hurt (<70% HP) —
//      HP is the win currency. In-phase it plays min-harm (risk-aware's
//      harmScore), preserving HP for priced fights.
//  D5. FIGHT TRIAGE. Eject at 50% HP (earlier than risk-aware's 45%): a dead
//      shark wins nothing. The eject is the real barrier flee — step toward
//      the nearest edge within moveLeft, push through with tbBarrierExit
//      (tbGridMax-aware: titan grids are 12x12).
//  D6. TABLE RUSH. Take the seat the day the preview says ready (no greedy
//      waits — the overtime question is Steve's open call; the shark plays
//      the game as it is), answer the modal chain with capable's
//      scoreTableOption (best-priced option, trial-by-combat never
//      volunteered), never delay for content.
//  D7. NO PRICED-SOCIAL WASTE. The shark inherits competent's survival
//      substrate (cook/eat/drink/water/gear/traps/loot — unexported, so not
//      reimplemented; a shark that dies of thirst measures nothing). Its
//      anti-fun signature is expressed at the decision points it owns:
//      need-based patrols, EV-only contests, exile-edge skimming,
//      top-up-or-nothing fights, same-day table answers. Talk-while-ignorant
//      is food-knowledge extraction, not fun — the substrate stays.
//
// Honest-measurement rules (same discipline as oracle-v3):
//  - Real engine calls only, try/catch-guarded. No invented magnitudes.
//  - Deterministic: seeded PRNG only (inherits the harness policy stream).
//  - Never mutates shared policy objects (Object.assign per use).
//  - diagnostics() returns bounded JSON counters, never Game state.
//
// Reading the probe (inverted):
//   shark.won >= competent.won  -> the win metric is reachable by degenerate
//      play: the levers in ctx (top-up rate, refusals, drain) are degenerate.
//   shark.won < competent.won   -> degenerate play does NOT dominate: the
//      win metric currently rewards the fuller game. Still investigation,
//      never a verdict.
'use strict';
const { winseek } = require('./winseek');
const { competent, competentEat, packEatOnce } = require('./competent');
let harmScore = null;
try { harmScore = require('./risk-aware').harmScore || null; } catch (e) { harmScore = null; }
let scoreTableOption = null;
try { scoreTableOption = require('./capable').scoreTableOption || null; } catch (e) { scoreTableOption = null; }

// Degenerate constants (policy choices, not game tuning).
const SHARK_TOPUP_FRAC = 0.92;  // D1: never voluntarily fight below this
const SHARK_PATROL_FLOOR = 0.70; // D2: no voluntary exposure below this
const SHARK_EJECT_HP = 0.50;     // D5: HP is the win currency
const SHARK_DRAIN_GUARD = 12000; // D2/D3: the exile edge (winseek: 3000)
const SHARK_CONTEST_HURT = 0.70; // D4: refuse unpriced contests below this

function kcalFrac(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const cap = Game.kcalCap ? Game.kcalCap() : 2400;
    return (s.kcal || 0) / Math.max(1, cap);
  } catch (e) { return 1; }
}
function hpFrac(Game) {
  try {
    if (Game.tbfight && !Game.tbfight.over && Game.tbFighter) {
      const p = Game.tbFighter('p');
      if (p) return (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
    }
    const s = (Game.state || {}).scholar || {};
    return (s.hp || 1) / Math.max(1, s.maxHp || s.hp || 1);
  } catch (e) { return 1; }
}
function netDrain(Game) {
  try {
    const v = Game.state.village || {};
    const me = Game.villagerId;
    return ((v.takes || {})[me] || 0) - ((v.gives || {})[me] || 0);
  } catch (e) { return 0; }
}
function feastedLiveUnused(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return !!(Game.feastedActive && Game.feastedActive() && !((s.feastBuff || {}).used));
  } catch (e) { return false; }
}
function deedNeed(Game) {
  // An unlocked wave's deed bar unfilled? (mirrors winseek's wave-targeting)
  try {
    const g = Game.deedGateReady ? Game.deedGateReady() : null;
    if (!g) return true;
    const bars = [g.w1 >= 5, g.w2 >= 5, g.w3 >= 4, g.w4 >= 3, g.w5 >= 2];
    const uw = Game.unlockedWave ? Game.unlockedWave() : 1;
    for (let w = 1; w <= uw; w++) if (!bars[w - 1]) return true;
    return false;
  } catch (e) { return true; }
}
function contestsSurvived(Game) {
  try {
    const d = Game.deedState ? Game.deedState() : {};
    return d.contestsSurvived || 0;
  } catch (e) { return 0; }
}

// D1. TOP-UP OR NOTHING: eat to >=92% cap before any exposure. competentEat
// is trigger-gated at 85%, so push the last stretch with packEatOnce (one
// honest Game.eat per call). Stop on no-progress — never spin.
function sharkTopUp(Game, ctx) {
  try {
    const cap = Game.kcalCap ? Game.kcalCap() : 2400;
    let guard = 0, takes = 0;
    for (;;) {
      if (guard++ > 48 || Game.over) break;
      const s = (Game.state || {}).scholar;
      if (!s) break;
      if ((s.kcal || 0) >= cap * SHARK_TOPUP_FRAC) break;
      const before = s.kcal || 0;
      try { competentEat(Game); } catch (e) { break; }
      try { packEatOnce(Game); } catch (e) {}
      const after = ((Game.state || {}).scholar || {}).kcal || 0;
      if (after > before + 1) takes++;
      else break;
    }
    ctx.sharkTopUps = (ctx.sharkTopUps || 0) + 1;
    ctx.sharkTopUpTakes = (ctx.sharkTopUpTakes || 0) + takes;
    ctx.sharkDrain = netDrain(Game);
  } catch (e) {}
}

// D2. NEED-BASED PATROL: no 3x/week cadence. Patrol only while deed-need or
// the FEASTED buff is live-and-unused; never below the patrol floor; never
// past the exile-edge drain guard. Mechanics mirror winseek's huntPatrol.
function sharkPatrol(Game, ctx) {
  try {
    const s = (Game.state || {}).scholar || {};
    const day = s.day || 1;
    if (ctx._sharkPatrolDay === day) return; // one patrol DECISION per day (upkeep runs 3x/day)
    ctx._sharkPatrolDay = day;
    const feasted = feastedLiveUnused(Game);
    if (!feasted && !deedNeed(Game)) return; // no deed value = no death risk
    if (kcalFrac(Game) < SHARK_PATROL_FLOOR) { ctx.sharkPatrolSkippedHungry = (ctx.sharkPatrolSkippedHungry || 0) + 1; return; }
    if (netDrain(Game) > SHARK_DRAIN_GUARD) { ctx.sharkPatrolSkippedDrain = (ctx.sharkPatrolSkippedDrain || 0) + 1; return; }
    const hx = Game.map.px, hy = Game.map.py;
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      const t = Game.tileAt(tt.x, tt.y);
      if (!t || t.type === 'haven') continue;
      let blocked = false;
      try { blocked = !!Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (blocked) continue;
      cands.push({ x: tt.x, y: tt.y, d: tt.d });
    }
    cands.sort((a, b) => b.d - a.d);
    let visited = 0;
    for (const c of cands.slice(0, 4)) {
      if (Game.over) break;
      try { Game.travelTo(c.x, c.y); } catch (e) { break; }
      if (Game.over || Game.tbfight) break;
      if (Game.map.px !== c.x || Game.map.py !== c.y) continue;
      visited++;
      try { Game.doAction('forage', {}); } catch (e) {}
      if (Game.over || Game.tbfight) break;
    }
    if (visited) {
      ctx.sharkPatrols = (ctx.sharkPatrols || 0) + 1;
      try { Game.travelTo(hx, hy); } catch (e) {}
    }
  } catch (e) {}
}

// D5. FIGHT TRIAGE: eject at 50% HP via the real barrier flee.
// Otherwise count topped-up vs untopped fight entries (per fight id; EVERY
// entry, voluntary or not — see D1) and inherit winseek's engage logic
// (feastburn use included).
function sharkFight(Game, ctx) {
  try {
    const f = Game.tbfight;
    if (f && !f.over && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
      if (ctx._sharkFightId !== f.id) {
        ctx._sharkFightId = f.id;
        if (kcalFrac(Game) >= SHARK_TOPUP_FRAC) ctx.sharkFightsTopped = (ctx.sharkFightsTopped || 0) + 1;
        else ctx.sharkFightsUntopped = (ctx.sharkFightsUntopped || 0) + 1;
      }
      if (hpFrac(Game) < SHARK_EJECT_HP) {
        // REAL FLEE (barrier exit, not teleport): tbPlayerMove refuses
        // destinations beyond moveLeft ("Too far"), and merely standing on
        // the edge ends nothing — the push goes through tbBarrierExit(dx,dy).
        // Step toward the nearest edge (tbGridMax: titan fights are 12x12),
        // push when on it. One action per turn, then end the turn.
        try {
          const p = Game.tbFighter('p');
          const px = (p && p.mx != null) ? p.mx : 4, py = (p && p.my != null) ? p.my : 4;
          const gmax = Game.tbGridMax ? Game.tbGridMax() : 8;
          const dl = px, dr = gmax - px, dt = py, db = gmax - py;
          const m = Math.min(dl, dr, dt, db);
          let dx = 0, dy = 0, tx = px, ty = py;
          if (m === dl) { dx = -1; tx = 0; }
          else if (m === dr) { dx = 1; tx = gmax; }
          else if (m === dt) { dy = -1; ty = 0; }
          else { dy = 1; ty = gmax; }
          if (m === 0 && Game.tbBarrierExit) {
            try { Game.tbBarrierExit(dx, dy); } catch (e2) {}
            ctx.sharkFlees = (ctx.sharkFlees || 0) + 1;
          } else {
            const ml = (p && p.moveLeft) || 0;
            const nx = tx === px ? px : px + Math.sign(tx - px) * Math.min(ml, Math.abs(tx - px));
            const ny = ty === py ? py : py + Math.sign(ty - py) * Math.min(ml, Math.abs(ty - py));
            try { Game.tbPlayerMove(nx, ny); } catch (e2) {}
          }
          const q = Game.tbFighter('p');
          // End the turn only if the fight is still live (a successful
          // barrier exit may have ended it — or moved it to a chase node).
          if (Game.tbfight && !Game.tbfight.over) {
            if (q) { q.moveLeft = 0; q.acted = true; }
            Game.tbAfterPlayerAction();
          }
          ctx.sharkEjects = (ctx.sharkEjects || 0) + 1;
          return true;
        } catch (e) { return false; }
      }
    }
  } catch (e) {}
  try { if (winseek.fight(Game, ctx)) return true; } catch (e) {}
  return false;
}

// D4. CONTEST EV: participate while the contests-survived deed (<3) is
// unfilled or HP affords it; refuse when the deed is filled AND hurt.
// In-phase: min-harm (HP is the win currency).
function sharkContest(Game, ctx) {
  try {
    const ac = Game.state && Game.state.activeContest;
    if (!ac || ac.phase === 'done') return false;
    if (ac.participant && ac.participant !== 'player') return false;
    const phases = ac.phases || [];
    const phase = phases[ac.phaseIdx || 0];
    if (!phase || !phase.choices || !phase.choices.length) return false;
    const choices = phase.choices;
    const refuseIdx = choices.findIndex(ch => ch && ch.next === 'REFUSE');
    if (refuseIdx >= 0) {
      const need = contestsSurvived(Game) < 3;
      const hurt = hpFrac(Game) < SHARK_CONTEST_HURT;
      ctx.sharkContestChoices = (ctx.sharkContestChoices || 0) + 1;
      if (!need && hurt) {
        ctx.sharkContestRefusals = (ctx.sharkContestRefusals || 0) + 1;
        try { Game.contestChoose(refuseIdx); } catch (e) {}
        return true;
      }
      try { Game.contestChoose(0); } catch (e) {}
      ctx.sharkContestTakes = (ctx.sharkContestTakes || 0) + 1;
      return true;
    }
    let best = 0, bestScore = Infinity;
    for (let i = 0; i < choices.length; i++) {
      let sc = Infinity;
      try { sc = harmScore ? harmScore(choices[i]) : i; } catch (e) { sc = i; }
      if (sc < bestScore - 1e-9) { bestScore = sc; best = i; }
    }
    try { Game.contestChoose(best); } catch (e) {}
    return true;
  } catch (e) { return false; }
}

// D1 backstop: the feast draw answered at driveContests time. Face it while
// the buff is live (top up first — the buff decays at dawn); otherwise the
// watch drives it off (declining the fight declines the deed, honestly).
function sharkPending(Game, ctx) {
  try {
    if (!Game.pendingEncounter || !Game.pendingMonsterId) return false;
    const draw = Game.feastDrawPending ? Game.feastDrawPending() : null;
    if (draw && feastedLiveUnused(Game)) {
      sharkTopUp(Game, ctx);
      if (kcalFrac(Game) >= SHARK_PATROL_FLOOR) {
        try {
          const r = Game.faceFeastDraw();
          if (r && r.ok) { ctx.sharkDrawsFaced = (ctx.sharkDrawsFaced || 0) + 1; return true; }
        } catch (e) {}
      }
    }
    try {
      const r = Game.driveOffFeastDraw ? Game.driveOffFeastDraw() : null;
      if (r && r.ok) { ctx.sharkDrawsDrivenOff = (ctx.sharkDrawsDrivenOff || 0) + 1; return true; }
    } catch (e) {}
    return false;
  } catch (e) { return false; }
}

// D6. TABLE RUSH: take the seat the day the preview says ready (no greedy
// waits — the overtime question is Steve's open call; the shark plays the
// game as it is), then answer the modal chain with scoreTableOption
// (best-priced option; trial-by-combat never volunteered).
function sharkTableRush(Game, ctx) {
  try {
    const pg = Game.progState ? Game.progState() : {};
    const day = ((Game.state || {}).scholar || {}).day || 0;
    if (!pg.tableDone && Game.tablePreview && Game.tableTakeSeat) {
      try {
        const pv = Game.tablePreview();
        if (pv) {
          ctx.sharkTablePreviewSeen = 1;
          if (pv.ready && ctx._sharkSeatDay !== day) {
            ctx._sharkSeatDay = day;
            const r = Game.tableTakeSeat();
            if (r && r.ok) { ctx.sharkSeatTaken = 1; ctx.sharkSeatDay = day; ctx.sharkSeatKind = pv.seat || '?'; }
          }
        }
      } catch (e) {}
    }
    let n = 0, lastSig = null, stall = 0;
    for (;;) {
      if (Game.over || n >= 30) break;
      try { if (Game.tbfight && !Game.tbfight.over) break; } catch (e) {}
      const tc = ((Game.state || {}).scholar || {}).tableChoices;
      if (!tc || !tc.options || !tc.options.length || typeof Game.chooseTableOption !== 'function') break;
      const sig = tc.frame + '|' + tc.options.map(o => o.id).join(',');
      if (sig === lastSig && ++stall >= 2) break;
      lastSig = sig;
      let pick = tc.options[0];
      try {
        if (scoreTableOption) {
          let T = {};
          try { T = Game.tableState ? Game.tableState() : {}; } catch (e2) { T = {}; }
          let best = null;
          for (const o of tc.options) {
            const sc = scoreTableOption(Game, o, T);
            if (!best || sc > best.sc) best = { o, sc };
          }
          if (best) pick = best.o;
        }
      } catch (e) {}
      Game.chooseTableOption(pick.id);
      n++;
      ctx.sharkTableAnswers = (ctx.sharkTableAnswers || 0) + 1;
    }
    if (n > 0) ctx.sharkAnsweredTable = true;
  } catch (e) {}
}

const SHARK_KEYS = ['sharkTopUps', 'sharkTopUpTakes', 'sharkDrain',
  'sharkPatrols', 'sharkPatrolSkippedHungry', 'sharkPatrolSkippedDrain',
  'sharkFightsTopped', 'sharkFightsUntopped', 'sharkEjects', 'sharkFlees',
  'sharkContestChoices', 'sharkContestTakes', 'sharkContestRefusals',
  'sharkDrawsFaced', 'sharkDrawsDrivenOff',
  'sharkTablePreviewSeen', 'sharkSeatTaken', 'sharkSeatDay', 'sharkSeatKind',
  'sharkTableAnswers', 'sharkAnsweredTable'];

const shark = Object.assign({}, winseek, {
  id: 'shark',
  desc: 'shark: degenerate-optimal win maximizer — top-up-or-nothing fights, need-based patrols, exile-edge skimming, EV-only contests, table rush. MEASUREMENT PROBE, not shipped AI.',
  setup(Game, ctx) {
    if (winseek.setup) winseek.setup(Game, ctx);
    try {
      for (const k of SHARK_KEYS) if (ctx[k] == null) ctx[k] = 0;
    } catch (e) {}
  },
  upkeep(Game, ctx) {
    sharkTopUp(Game, ctx);                    // D1: eat to >=92% BEFORE exposure
    if (competent.upkeep) competent.upkeep(Game, ctx); // survival substrate
    sharkPatrol(Game, ctx);                   // D2: need-based, exile-edge guard
    try {                                     // contest watch counter (winseek's contestRoad)
      if (Game.state.activeContest) ctx.sharkSawContest = (ctx.sharkSawContest || 0) + 1;
    } catch (e) {}
  },
  daily(Game, ctx) {
    if (winseek.daily) winseek.daily(Game, ctx); // full 6-road pursuit
    sharkTableRush(Game, ctx);                    // D6: seat + best-priced answers
    try { ctx.sharkDrain = netDrain(Game); } catch (e) {}
  },
  fight(Game, ctx) {
    try { if (sharkFight(Game, ctx)) return true; } catch (e) {}
    return false;
  },
  contest(Game, ctx) {
    try { if (sharkContest(Game, ctx)) return true; } catch (e) {}
    return false;
  },
  pending(Game, ctx) {
    try { return sharkPending(Game, ctx); } catch (e) { return false; }
  },
  diagnostics(ctx) {
    const out = { policy: 'shark', probe: 'MEASUREMENT PROBE, not shipped AI' };
    try {
      for (const k of SHARK_KEYS.concat(['sharkSawContest'])) out[k] = ctx[k] || 0;
      const ft = (ctx.sharkFightsTopped || 0) + (ctx.sharkFightsUntopped || 0);
      out.sharkToppedFrac = ft ? +((ctx.sharkFightsTopped || 0) / ft).toFixed(3) : null;
    } catch (e) {}
    return out;
  },
});

module.exports = { shark, SHARK_KEYS };
