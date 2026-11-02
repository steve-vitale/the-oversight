// policies/titanroute.js — deliberate titan routing prototype (Loop A
// 20261102T0915Z, arm sim-titanroute-a, axis scale-onramp). POLICY ONLY:
// zero src/js changes. Wraps a base policy's daily/setup; upkeep, fight,
// and everything else delegate untouched.
//
// PERCEPTION LAW (load-bearing): the policy NEVER reads Game.worldMonsters()
// or any monster roster for targeting. It knows exactly two things, both
// heard/seen in fiction:
//   1. the lair tile, heard from the scouts' announcement line
//      ("Scouts found its lair — tile x,y", Game.say at omen stage 1->2);
//   2. tile-sharing, seen with its own eyes via Game.playerMonster()
//      (the engine's monster-on-your-tile read).
// The march target is ALWAYS the heard lair tile (fixed, known) — never a
// live herald position, which the scholar cannot know.
//
// BEHAVIOR: after the base daily runs (food, chores, go-home leg), if a
// lair is known, the titan is not slain, and the scholar is fed/watered/
// healthy, walk tile-by-tile to the lair (engine-offered steps only, no
// force) and stop there for the night. On the first night the scholar
// ends ON the lair tile, if no muster exists yet, sound the call once
// (Game.soundTitanCall('herald')). Haven's own blades are NOT committed
// here — titanCommitOwn stays an explicit player verb. One call per run:
// re-sounding would farm engine trust loss on refusals.
// If the lair is never heard, this wrapper is byte-identical to base.
// No RNG is consumed (no Math.random calls), so arm/baseline trajectories
// differ ONLY through the march/call actions and their consequences.
'use strict';

const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;
const CALL_RE = /THE CALL GOES OUT/;

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function scholarTile(Game) {
  try {
    if (!Game.map) return null;
    return { x: Game.map.px, y: Game.map.py };
  } catch (e) { return null; }
}

function slain(Game) {
  try {
    const st = ((Game.state || {}).titans || {});
    return !!((st.slain || {}).herald);
  } catch (e) { return false; }
}

function musterExists(Game) {
  try {
    if (typeof Game.titanMusterState === 'function') return !!Game.titanMusterState('herald');
    const st = ((Game.state || {}).titans || {});
    return !!((st.musters || {}).herald);
  } catch (e) { return false; }
}

// Honest tile-by-tile walk toward (hx,hy): the competent walkTo pattern
// (engine travelTargets only, one travelTo per hop, bounded, no force).
// walkTo is not exported by competent.js, so the pattern lives here;
// it reads only the scholar's own tile and the engine's offered steps.
function marchWalk(Game, hx, hy) {
  let steps = 0;
  try {
    let guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 &&
           !Game.over && !Game.tbfight) {
      let best = null, bd = 1e9;
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - hx) + Math.abs(tt.y - hy);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      const px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) break; // refused: stop, safely
      steps++;
    }
  } catch (e) {
    // A march failure is a failed march, not a crash: record and stop.
    return { steps: steps, error: String((e && e.message) || e).slice(0, 120) };
  }
  return { steps: steps, error: null };
}

function withTitanRoute(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'titanroute',
    desc: desc || 'titanroute: march to heard lair + sound the call once',
    setup(Game, ctx) {
      if (base.setup) {
        try { base.setup(Game, ctx); } catch (e) { ctx.titanSetupErr = String(e.message).slice(0, 120); }
      }
      // HEARING, not reading: wrap Game.say and record ONLY the anchored
      // lair line (and the call line, for bookkeeping). Every other line
      // passes through untouched and is never used for decisions.
      const st = { lair: null, callHeard: false, errors: [] };
      ctx.titan = st;
      try {
        const origSay = Game.say;
        Game.say = function () {
          try {
            const arg = arguments.length ? arguments[0] : null;
            if (typeof arg === 'string') {
              const lm = LAIR_RE.exec(arg);
              if (lm && !st.lair) st.lair = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
              if (CALL_RE.test(arg)) st.callHeard = true;
            }
          } catch (e) { st.errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
          return origSay.apply(this, arguments);
        };
      } catch (e) { st.errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
    },
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.titanBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const st = ctx.titan || (ctx.titan = { lair: null, callHeard: false, errors: [] });
      if (!st.lair || slain(Game)) return;
      if (Game.over || Game.tbfight) return;
      // GUARDRAILS: march only fed, watered, healthy. A starving march
      // would suicide the village and prove nothing about routing.
      let s = null;
      try { s = Game.state.scholar; } catch (e) { return; }
      if (!s) return;
      let cap = 2000;
      try { cap = Game.kcalCap() || 2000; } catch (e) { /* keep default */ }
      const fed = (s.kcal || 0) > cap * 0.5;
      const watered = (s.hydration || 0) > 45;
      // Scholar HP lives in `health` (game.js: scholar.health; competent
      // reads s.hp || s.health). Reading hp alone always blocks — fixed
      // after the void pilot batch showed healthy:false every day.
      const hp = (s.hp != null ? s.hp : (s.health != null ? s.health : 100));
      const healthy = hp > (s.maxHp || 100) * 0.5;
      if (!fed || !watered || !healthy) {
        st.lastGuardBlock = { day: gday(Game), fed: fed, watered: watered, healthy: healthy };
        return;
      }
      const here = scholarTile(Game);
      if (!here) return;
      const atLair = here.x === st.lair.x && here.y === st.lair.y;
      if (!atLair) {
        const res = marchWalk(Game, st.lair.x, st.lair.y);
        const now = scholarTile(Game);
        const arrived = !!(now && now.x === st.lair.x && now.y === st.lair.y);
        st.marches = st.marches || [];
        st.marches.push({ day: gday(Game), from: here, steps: res.steps,
          arrived: arrived, error: res.error });
        if (!arrived) return;
        // Fell through to the arrival branch below with `now` at lair.
      } else {
        st.marches = st.marches || [];
        st.marches.push({ day: gday(Game), from: here, steps: 0, arrived: true, error: null, alreadyThere: true });
      }
      // ARRIVED (or already camped): sound the call once, if no muster.
      if (st.called) return;
      if (musterExists(Game)) { st.called = 'preexisting-muster'; return; }
      if (typeof Game.soundTitanCall !== 'function') {
        st.callError = 'soundTitanCall missing';
        return;
      }
      try {
        const r = Game.soundTitanCall('herald');
        st.called = { day: gday(Game), result: r == null ? 'null (nothing located)' : 'sounded' };
        if (r == null) st.called = null; // nothing located: stay unsounded, retry another night
      } catch (e) {
        st.callError = String(e.message).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withTitanRoute };
